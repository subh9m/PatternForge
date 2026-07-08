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
    private final BlockingQueue<Runnable> queue = new PriorityBlockingQueue<>();
    private final ExecutorService executor = new ThreadPoolExecutor(
            1, 1, 0L, TimeUnit.MILLISECONDS, queue
    );
    private final Set<UUID> generatingProblems = ConcurrentHashMap.newKeySet();
    private final ConcurrentHashMap<UUID, Object> problemLocks = new ConcurrentHashMap<>();
    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(ProblemGenerationService.class);

    private static volatile long lastUserRequestTime = 0;

    public static void recordUserActivity() {
        lastUserRequestTime = System.currentTimeMillis();
    }

    public static boolean isBackgroundGenerationPaused() {
        return (System.currentTimeMillis() - lastUserRequestTime) < 60000;
    }

    private static class PrioritizedTask implements Runnable, Comparable<PrioritizedTask> {
        final UUID problemId;
        final int priority; // 1 = HIGH, 2 = LOW
        private final Runnable runnable;

        public PrioritizedTask(UUID problemId, int priority, Runnable runnable) {
            this.problemId = problemId;
            this.priority = priority;
            this.runnable = runnable;
        }

        @Override
        public void run() {
            runnable.run();
        }

        @Override
        public int compareTo(PrioritizedTask other) {
            return Integer.compare(this.priority, other.priority);
        }

        @Override
        public boolean equals(Object obj) {
            if (this == obj) return true;
            if (!(obj instanceof PrioritizedTask)) return false;
            return Objects.equals(this.problemId, ((PrioritizedTask) obj).problemId);
        }

        @Override
        public int hashCode() {
            return Objects.hash(problemId);
        }
    }

    public ProblemGenerationService(ProblemRepository problemRepository, GeminiService geminiService) {
        this.problemRepository = problemRepository;
        this.geminiService = geminiService;
    }

    public boolean isGenerating(UUID problemId) {
        return generatingProblems.contains(problemId);
    }

    public void queueGeneration(UUID problemId, int priority) {
        if (priority == 1) {
            PrioritizedTask dummy = new PrioritizedTask(problemId, 2, () -> {});
            if (queue.remove(dummy)) {
                generatingProblems.remove(problemId);
            }
        }

        if (generatingProblems.add(problemId)) {
            executor.execute(new PrioritizedTask(problemId, priority, () -> {
                try {
                    if (priority > 1) {
                        while (isBackgroundGenerationPaused()) {
                            Thread.sleep(5000);
                        }
                    }

                    Optional<Problem> freshOpt = problemRepository.findById(problemId);
                    if (freshOpt.isPresent()) {
                        generateMissingDetailsInternal(freshOpt.get());
                    }
                    
                    long sleepMs = (priority == 1) ? 4000 : 12000;
                    Thread.sleep(sleepMs);
                } catch (Exception e) {
                    log.error("Error in sequential problem generation thread", e);
                } finally {
                    generatingProblems.remove(problemId);
                }
            }));
        }
    }

    public int getEstimatedTimeSeconds(UUID problemId) {
        if (!generatingProblems.contains(problemId)) {
            return 0;
        }
        
        Object[] array = queue.toArray();
        List<PrioritizedTask> tasks = new ArrayList<>();
        for (Object obj : array) {
            if (obj instanceof PrioritizedTask) {
                tasks.add((PrioritizedTask) obj);
            }
        }
        Collections.sort(tasks);

        int index = -1;
        for (int i = 0; i < tasks.size(); i++) {
            if (tasks.get(i).problemId.equals(problemId)) {
                index = i;
                break;
            }
        }

        if (index == -1) {
            return 4; // Currently running task
        }

        return (index + 2) * 4;
    }

    public void generateMissingDetailsInternal(Problem p) {
        Object lock = problemLocks.computeIfAbsent(p.getId(), id -> new Object());
        synchronized (lock) {
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
                log.error("ProblemGenerationService: Failed to generate unified details via Gemini. Applying local offline fallbacks for: {}",
                        freshProblem.getName(), e);

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
            } finally {
                problemLocks.remove(freshProblem.getId());
            }
        }
    }
}
