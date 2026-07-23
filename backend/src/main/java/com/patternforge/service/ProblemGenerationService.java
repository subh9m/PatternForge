package com.patternforge.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.patternforge.model.Problem;
import com.patternforge.dto.AIResponse;
import com.patternforge.repository.ProblemRepository;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.*;

@Service
public class ProblemGenerationService {

    private final ProblemRepository problemRepository;
    private final GeminiService geminiService;

    private final PriorityBlockingQueue<GenerationJob> queue = new PriorityBlockingQueue<>();
    private final Set<UUID> runningJobs = ConcurrentHashMap.newKeySet();
    private final Set<UUID> queuedJobs = ConcurrentHashMap.newKeySet();
    private final Object lock = new Object();
    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(ProblemGenerationService.class);

    private static volatile long lastUserRequestTime = 0;
    
    public enum JobStatus {
        QUEUED,
        GENERATING,
        COMPLETED,
        FAILED
    }

    public static class JobProgress {
        private UUID problemId;
        private String problemName;
        private JobStatus status;
        private long startTime;
        private long endTime;
        private String stage = "Preparing request...";
        private String activeProvider = "";

        public JobProgress(UUID problemId, String problemName, JobStatus status) {
            this.problemId = problemId;
            this.problemName = problemName;
            this.status = status;
        }

        public UUID getProblemId() { return problemId; }
        public String getProblemName() { return problemName; }
        public JobStatus getStatus() { return status; }
        public void setStatus(JobStatus status) { this.status = status; }
        public long getStartTime() { return startTime; }
        public void setStartTime(long startTime) { this.startTime = startTime; }
        public long getEndTime() { return endTime; }
        public void setEndTime(long endTime) { this.endTime = endTime; }
        public String getStage() { return stage; }
        public void setStage(String stage) { this.stage = stage; }
        public String getActiveProvider() { return activeProvider; }
        public void setActiveProvider(String activeProvider) { this.activeProvider = activeProvider; }
        public String getJobType() { return "PROBLEM_GEN"; }
    }

    private static final Map<UUID, JobProgress> activeJobs = new ConcurrentHashMap<>();

    public static JobProgress getActiveJob(UUID problemId) {
        return activeJobs.get(problemId);
    }

    public static List<JobProgress> getActiveJobsList() {
        cleanRegistry();
        return new ArrayList<>(activeJobs.values());
    }

    public static void cleanRegistry() {
        long now = System.currentTimeMillis();
        activeJobs.entrySet().removeIf(entry -> {
            JobProgress p = entry.getValue();
            return (p.getStatus() == JobStatus.COMPLETED || p.getStatus() == JobStatus.FAILED)
                    && (now - p.getEndTime() > 300000); // 5 minutes
        });
    }

    public static void recordUserActivity() {
        lastUserRequestTime = System.currentTimeMillis();
    }

    public static boolean isBackgroundGenerationPaused() {
        return (System.currentTimeMillis() - lastUserRequestTime) < 60000;
    }

    private final List<Thread> workerThreads = new ArrayList<>();
    private static final int MAX_WORKERS = 1;

    private synchronized void ensureWorkerThreadStarted() {
        workerThreads.removeIf(t -> !t.isAlive());
        while (workerThreads.size() < MAX_WORKERS) {
            Thread t = new Thread(this::queueProcessorLoop, "dsa-problem-generation-worker-" + workerThreads.size());
            t.setDaemon(true);
            t.start();
            workerThreads.add(t);
            log.info("ProblemGenerationService: Background queue processor worker thread dsa-problem-generation-worker-{} started successfully.", workerThreads.size() - 1);
        }
    }

    public ProblemGenerationService(ProblemRepository problemRepository,
                                    GeminiService geminiService) {
        this.problemRepository = problemRepository;
        this.geminiService = geminiService;
    }

    private void queueProcessorLoop() {
        while (true) {
            try {
                GenerationJob job = null;
                synchronized (lock) {
                    while (queue.isEmpty()) {
                        lock.wait();
                    }

                    // Proceed to pull the job
                    job = queue.poll();
                    if (job != null) {
                        queuedJobs.remove(job.getProblemId());
                        runningJobs.add(job.getProblemId());
                        
                        JobProgress progress = activeJobs.get(job.getProblemId());
                        if (progress != null) {
                            progress.setStatus(JobStatus.GENERATING);
                            progress.setStartTime(System.currentTimeMillis());
                        }
                    }
                }

                if (job != null) {
                    try {
                        Optional<Problem> freshOpt = problemRepository.findById(job.getProblemId());
                        if (freshOpt.isPresent()) {
                            generateMissingDetailsInternal(freshOpt.get());
                        }
                        job.getFuture().complete(null);
                        
                        JobProgress progress = activeJobs.get(job.getProblemId());
                        if (progress != null) {
                            progress.setStatus(JobStatus.COMPLETED);
                            progress.setEndTime(System.currentTimeMillis());
                        }
                    } catch (Exception e) {
                        log.error("ProblemGenerationService: Failed executing job for problem: {}", job.getProblemId(), e);
                        job.getFuture().completeExceptionally(e);
                        
                        JobProgress progress = activeJobs.get(job.getProblemId());
                        if (progress != null) {
                            progress.setStatus(JobStatus.FAILED);
                            progress.setEndTime(System.currentTimeMillis());
                        }
                    } finally {
                        runningJobs.remove(job.getProblemId());
                        // Apply spacing delays
                        if (job.getPriority() == JobPriority.LOWEST) {
                            Thread.sleep(12000);
                        } else {
                            Thread.sleep(3000);
                        }
                    }
                }

            } catch (InterruptedException ie) {
                log.warn("ProblemGenerationService: Queue worker thread interrupted. Shutting down.");
                Thread.currentThread().interrupt();
                break;
            } catch (Exception e) {
                log.error("ProblemGenerationService: Error occurred in queue processor loop.", e);
            }
        }
    }

    public boolean isGenerating(UUID problemId) {
        return runningJobs.contains(problemId) || queuedJobs.contains(problemId);
    }

    public void submitJob(UUID problemId, JobPriority priority) {
        ensureWorkerThreadStarted();
        Optional<Problem> freshOpt = problemRepository.findById(problemId);
        if (freshOpt.isPresent()) {
            Problem p = freshOpt.get();
            boolean needsGeneration = (LocalFallbackGenerator.isBoilerplateBasicDetails(p.getBasicDetailsJson()) ||
                                       LocalFallbackGenerator.isBoilerplateSolutionDetails(p.getSolutionDetailsJson()) ||
                                       LocalFallbackGenerator.isBoilerplateSimplifiedStatement(p.getSimplifiedStatement()) ||
                                       LocalFallbackGenerator.isBoilerplateSimplifiedApproach(p.getSimplifiedApproach()));
            if (!needsGeneration) {
                return; // Cached data exists
            }
        }

        synchronized (lock) {
            if (runningJobs.contains(problemId)) {
                return; 
            }

            GenerationJob existing = getQueuedJob(problemId);
            if (existing != null) {
                if (priority.getValue() < existing.getPriority().getValue()) {
                    queue.remove(existing);
                    GenerationJob promoted = new GenerationJob(problemId, priority);
                    queue.add(promoted);
                }
            } else {
                GenerationJob job = new GenerationJob(problemId, priority);
                queue.add(job);
                queuedJobs.add(problemId);
                
                // Add to activeJobs registry
                if (freshOpt.isPresent()) {
                    activeJobs.put(problemId, new JobProgress(problemId, freshOpt.get().getName(), JobStatus.QUEUED));
                }
            }
            lock.notifyAll();
        }
    }

    public boolean submitJobAndWait(UUID problemId, JobPriority priority) {
        ensureWorkerThreadStarted();
        Optional<Problem> freshOpt = problemRepository.findById(problemId);
        if (freshOpt.isPresent()) {
            Problem p = freshOpt.get();
            boolean needsGeneration = (LocalFallbackGenerator.isBoilerplateBasicDetails(p.getBasicDetailsJson()) ||
                                       LocalFallbackGenerator.isBoilerplateSolutionDetails(p.getSolutionDetailsJson()) ||
                                       LocalFallbackGenerator.isBoilerplateSimplifiedStatement(p.getSimplifiedStatement()) ||
                                       LocalFallbackGenerator.isBoilerplateSimplifiedApproach(p.getSimplifiedApproach()));
            if (!needsGeneration) {
                return true; // Cached data exists
            }
        }

        GenerationJob job;
        synchronized (lock) {
            job = getQueuedJob(problemId);
            if (job != null) {
                if (priority.getValue() < job.getPriority().getValue()) {
                    queue.remove(job);
                    job = new GenerationJob(problemId, priority);
                    queue.add(job);
                }
            } else {
                job = new GenerationJob(problemId, priority);
                queue.add(job);
                queuedJobs.add(problemId);
                
                // Add to activeJobs registry
                if (freshOpt.isPresent()) {
                    activeJobs.put(problemId, new JobProgress(problemId, freshOpt.get().getName(), JobStatus.QUEUED));
                }
            }
            lock.notifyAll();
        }

        try {
            job.getFuture().get(120, TimeUnit.SECONDS);
            return true;
        } catch (Exception e) {
            log.warn("ProblemGenerationService: Wait timeout or failure occurred for problem {}: {}", problemId, e.getMessage());
            return false;
        }
    }

    public JobStatus getJobStatus(UUID problemId) {
        JobProgress progress = activeJobs.get(problemId);
        return progress != null ? progress.getStatus() : null;
    }

    public void clearJobStatus(UUID problemId) {
        activeJobs.remove(problemId);
    }

    public void queueGeneration(UUID problemId, int priority) {
        JobPriority jp = JobPriority.LOWEST;
        if (priority == 1) {
            jp = JobPriority.MEDIUM;
        }
        submitJob(problemId, jp);
    }

    public int getEstimatedTimeSeconds(UUID problemId) {
        if (!isGenerating(problemId)) {
            return 0;
        }

        Object[] array = queue.toArray();
        List<GenerationJob> tasks = new ArrayList<>();
        for (Object obj : array) {
            if (obj instanceof GenerationJob) {
                tasks.add((GenerationJob) obj);
            }
        }
        Collections.sort(tasks);

        int index = -1;
        for (int i = 0; i < tasks.size(); i++) {
            if (tasks.get(i).getProblemId().equals(problemId)) {
                index = i;
                break;
            }
        }

        if (index == -1) {
            return 3; // Currently executing
        }

        return (index + 2) * 3;
    }

    private GenerationJob getQueuedJob(UUID problemId) {
        for (GenerationJob job : queue) {
            if (job.getProblemId().equals(problemId)) {
                return job;
            }
        }
        return null;
    }

    public int getQueueSize() {
        return queue.size();
    }

    public int getRunningJobsCount() {
        return runningJobs.size();
    }

    private static final Queue<Long> generationDurations = new ConcurrentLinkedQueue<>();
    private static final int ROLLING_LIMIT = 20;

    public static void recordGenerationDuration(long seconds) {
        generationDurations.add(seconds);
        while (generationDurations.size() > ROLLING_LIMIT) {
            generationDurations.poll();
        }
    }

    public static double getAverageGenerationDuration() {
        if (generationDurations.isEmpty()) {
            return 35.0; // Default estimate
        }
        long sum = 0;
        for (long d : generationDurations) {
            sum += d;
        }
        return (double) sum / generationDurations.size();
    }

    public void generateMissingDetailsInternal(Problem p) {
        Problem freshProblem = problemRepository.findById(p.getId()).orElse(p);

        boolean needsGeneration = (LocalFallbackGenerator.isBoilerplateBasicDetails(freshProblem.getBasicDetailsJson()) ||
                                   LocalFallbackGenerator.isBoilerplateSolutionDetails(freshProblem.getSolutionDetailsJson()) ||
                                   LocalFallbackGenerator.isBoilerplateSimplifiedStatement(freshProblem.getSimplifiedStatement()) ||
                                   LocalFallbackGenerator.isBoilerplateSimplifiedApproach(freshProblem.getSimplifiedApproach()));

        if (!needsGeneration) {
            return;
        }

        JobProgress progress = activeJobs.get(p.getId());
        if (progress != null) {
            progress.setStage("Preparing request...");
        }

        ObjectMapper mapper = new ObjectMapper();
        long startTime = System.currentTimeMillis();
        
        try {
            log.info("ProblemGenerationService: Performing single-pass details generation for problem: {} (#{})",
                    freshProblem.getName(), freshProblem.getLeetcodeNumber());

            if (progress != null) {
                progress.setStage("Contacting AI provider...");
            }

            long providerStart = System.currentTimeMillis();
            AIResponse aiResponse = geminiService.generateAllProblemDetailsJson(
                    freshProblem.getName(), freshProblem.getLeetcodeNumber(), freshProblem.getTopic().getName());
            long providerTimeMs = System.currentTimeMillis() - providerStart;

            String providerName = aiResponse.getProviderName();
            if (progress != null) {
                progress.setActiveProvider(providerName);
                progress.setStage("Generating explanation...");
            }

            String unifiedJsonStr = aiResponse.getContent();

            if (progress != null) {
                progress.setStage("Validating response...");
            }

            long validationStart = System.currentTimeMillis();
            JsonNode root = mapper.readTree(unifiedJsonStr);
            long validationTimeMs = System.currentTimeMillis() - validationStart;

            if (progress != null) {
                progress.setStage("Saving to database...");
            }

            long saveStart = System.currentTimeMillis();
            
            // 1. Basic Details
            JsonNode basicNode = root.path("basicDetails");
            if (!basicNode.isMissingNode() && !basicNode.isNull()) {
                freshProblem.setBasicDetailsJson(mapper.writeValueAsString(basicNode));
            }

            // 2. Solution Details
            JsonNode solutionNode = root.path("solutionDetails");
            if (!solutionNode.isMissingNode() && !solutionNode.isNull()) {
                freshProblem.setSolutionDetailsJson(mapper.writeValueAsString(solutionNode));
            }

            // 3. Revision Details
            JsonNode revisionNode = root.path("revisionDetails");
            if (!revisionNode.isMissingNode() && !revisionNode.isNull()) {
                freshProblem.setSimplifiedStatement(revisionNode.path("simplifiedStatement").asText(""));

                Map<String, String> approachMap = new HashMap<>();
                approachMap.put("optimal", revisionNode.path("simplifiedOptimal").asText(""));
                approachMap.put("better", revisionNode.path("simplifiedBetter").asText(""));
                approachMap.put("bruteForce", revisionNode.path("simplifiedBrute").asText(""));
                freshProblem.setSimplifiedApproach(mapper.writeValueAsString(approachMap));
            }

            problemRepository.save(freshProblem);
            long saveTimeMs = System.currentTimeMillis() - saveStart;

            long totalTimeMs = System.currentTimeMillis() - startTime;
            recordGenerationDuration(totalTimeMs / 1000);

            if (progress != null) {
                progress.setStage("Finalizing...");
            }

            // Exactly matching the required logs:
            log.info("Trying {}...\nResponse:\n{} sec\nValidation:\n{} ms\nSave:\n{} ms\nTotal:\n{} sec",
                    providerName,
                    String.format("%.2f", providerTimeMs / 1000.0),
                    validationTimeMs,
                    saveTimeMs,
                    String.format("%.2f", totalTimeMs / 1000.0));

        } catch (Exception e) {
            log.warn("ProblemGenerationService: Unified details generation failed for problem '{}' ({}). Applying local offline stubs.",
                    freshProblem.getName(), e.getMessage());

            try {
                if (LocalFallbackGenerator.isBoilerplateBasicDetails(freshProblem.getBasicDetailsJson())) {
                    freshProblem.setBasicDetailsJson(LocalFallbackGenerator.getBasicDetailsFallbackJson(
                            freshProblem.getName(), freshProblem.getLeetcodeNumber(), freshProblem.getTopic().getName()));
                }
                if (LocalFallbackGenerator.isBoilerplateSolutionDetails(freshProblem.getSolutionDetailsJson())) {
                    freshProblem.setSolutionDetailsJson(LocalFallbackGenerator.getSolutionDetailsFallbackJson(
                            freshProblem.getName(), freshProblem.getLeetcodeNumber(), freshProblem.getTopic().getName()));
                }
                if (LocalFallbackGenerator.isBoilerplateSimplifiedStatement(freshProblem.getSimplifiedStatement()) ||
                    LocalFallbackGenerator.isBoilerplateSimplifiedApproach(freshProblem.getSimplifiedApproach())) {
                    Map<String, String> res = LocalFallbackGenerator.getSimplifiedFallback(freshProblem.getName(), freshProblem.getTopic().getName());
                    if (LocalFallbackGenerator.isBoilerplateSimplifiedStatement(freshProblem.getSimplifiedStatement())) {
                        freshProblem.setSimplifiedStatement(res.get("simplifiedStatement"));
                    }
                    if (LocalFallbackGenerator.isBoilerplateSimplifiedApproach(freshProblem.getSimplifiedApproach())) {
                        Map<String, String> approachMap = new HashMap<>();
                        approachMap.put("optimal", res.get("simplifiedOptimal"));
                        approachMap.put("better", res.getOrDefault("simplifiedBetter", ""));
                        approachMap.put("bruteForce", res.getOrDefault("simplifiedBrute", ""));
                        freshProblem.setSimplifiedApproach(mapper.writeValueAsString(approachMap));
                    }
                }
                problemRepository.save(freshProblem);
            } catch (Exception ex) {
                log.error("ProblemGenerationService: Extremely unexpected critical failure when writing offline stubs", ex);
            }
            throw new RuntimeException("Failed to generate unified problem details: " + e.getMessage(), e);
        }
    }
}
