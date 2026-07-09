package com.patternforge.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.patternforge.model.Problem;
import com.patternforge.repository.ProblemRepository;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.*;

@Service
public class ProblemGenerationService {

    private final ProblemRepository problemRepository;
    private final GeminiService geminiService;
    private final APIKeyManager apiKeyManager;
    private final ModelSelector modelSelector;

    private final PriorityBlockingQueue<GenerationJob> queue = new PriorityBlockingQueue<>();
    private final Set<UUID> runningJobs = ConcurrentHashMap.newKeySet();
    private final Set<UUID> queuedJobs = ConcurrentHashMap.newKeySet();
    private final Object lock = new Object();
    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(ProblemGenerationService.class);

    private static volatile long lastUserRequestTime = 0;

    public static void recordUserActivity() {
        lastUserRequestTime = System.currentTimeMillis();
    }

    public static boolean isBackgroundGenerationPaused() {
        return (System.currentTimeMillis() - lastUserRequestTime) < 60000;
    }

    private Thread workerThread = null;

    private synchronized void ensureWorkerThreadStarted() {
        if (workerThread == null || !workerThread.isAlive()) {
            workerThread = new Thread(this::queueProcessorLoop, "dsa-problem-generation-worker");
            workerThread.setDaemon(true);
            workerThread.start();
            log.info("ProblemGenerationService: Background queue processor worker thread started successfully.");
        }
    }

    public ProblemGenerationService(ProblemRepository problemRepository,
                                    GeminiService geminiService,
                                    APIKeyManager apiKeyManager,
                                    ModelSelector modelSelector) {
        this.problemRepository = problemRepository;
        this.geminiService = geminiService;
        this.apiKeyManager = apiKeyManager;
        this.modelSelector = modelSelector;
    }

    private void queueProcessorLoop() {
        while (true) {
            try {
                GenerationJob job = null;
                synchronized (lock) {
                    while (queue.isEmpty()) {
                        lock.wait();
                    }

                    // Peek to check the priority of the next job
                    GenerationJob peeked = queue.peek();
                    if (peeked != null && peeked.getPriority() != JobPriority.HIGHEST) {
                        // Pause queue if no keys are currently AVAILABLE
                        if (apiKeyManager.getAvailableKeys().isEmpty()) {
                            Long expiry = apiKeyManager.getEarliestCooldownExpiry();
                            long sleepMs = 60000; // default 1 min
                            if (expiry != null) {
                                sleepMs = expiry - System.currentTimeMillis();
                            }
                            if (sleepMs > 0) {
                                java.text.SimpleDateFormat sdf = new java.text.SimpleDateFormat("HH:mm:ss");
                                String pauseTime = sdf.format(new Date(System.currentTimeMillis() + sleepMs));
                                log.warn("APIKeyManager: No available keys in pool. Queue paused until {}", pauseTime);
                                lock.wait(sleepMs);
                                continue; // re-evaluate queue states
                            }
                        }
                    }

                    // Proceed to pull the job
                    job = queue.poll();
                    if (job != null) {
                        queuedJobs.remove(job.getProblemId());
                        runningJobs.add(job.getProblemId());
                    }
                }

                if (job != null) {
                    try {
                        Optional<Problem> freshOpt = problemRepository.findById(job.getProblemId());
                        if (freshOpt.isPresent()) {
                            generateMissingDetailsInternal(freshOpt.get());
                        }
                        job.getFuture().complete(null);
                    } catch (Exception e) {
                        log.error("ProblemGenerationService: Failed executing job for problem: {}", job.getProblemId(), e);
                        job.getFuture().completeExceptionally(e);
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
            }
            lock.notifyAll();
        }
    }

    public void submitJobAndWait(UUID problemId, JobPriority priority) {
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
            }
            lock.notifyAll();
        }

        try {
            job.getFuture().get(60, TimeUnit.SECONDS);
        } catch (Exception e) {
            log.warn("ProblemGenerationService: Wait timeout or failure occurred for problem {}: {}", problemId, e.getMessage());
        }
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

    public void generateMissingDetailsInternal(Problem p) {
        Problem freshProblem = problemRepository.findById(p.getId()).orElse(p);

        boolean needsGeneration = (LocalFallbackGenerator.isBoilerplateBasicDetails(freshProblem.getBasicDetailsJson()) ||
                                   LocalFallbackGenerator.isBoilerplateSolutionDetails(freshProblem.getSolutionDetailsJson()) ||
                                   LocalFallbackGenerator.isBoilerplateSimplifiedStatement(freshProblem.getSimplifiedStatement()) ||
                                   LocalFallbackGenerator.isBoilerplateSimplifiedApproach(freshProblem.getSimplifiedApproach()));

        if (!needsGeneration) {
            return;
        }

        ObjectMapper mapper = new ObjectMapper();
        try {
            log.info("ProblemGenerationService: Performing single-pass details generation for problem: {} (#{})",
                    freshProblem.getName(), freshProblem.getLeetcodeNumber());

            String unifiedJsonStr = geminiService.generateAllProblemDetailsJson(
                    freshProblem.getName(), freshProblem.getLeetcodeNumber(), freshProblem.getTopic().getName());

            JsonNode root = mapper.readTree(unifiedJsonStr);

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
            log.info("ProblemGenerationService: Single-pass details successfully generated and saved for problem: {}",
                    freshProblem.getName());

        } catch (Exception e) {
            log.warn("ProblemGenerationService: Gemini details generation failed for problem '{}' ({}). Applying local offline stubs.",
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
        }
    }
}
