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
        boolean updated = false;
        ObjectMapper mapper = new ObjectMapper();

        // 1. Ensure basicDetailsJson is present (essential for problem description)
        if (LocalFallbackGenerator.isBoilerplateBasicDetails(p.getBasicDetailsJson())) {
            try {
                if (p.getProblemDetailsJson() != null && !p.getProblemDetailsJson().trim().isEmpty()) {
                    JsonNode root = mapper.readTree(p.getProblemDetailsJson());
                    Map<String, Object> basic = new LinkedHashMap<>();
                    basic.put("problemStatement", root.path("problemStatement").asText(""));
                    basic.put("inputFormat", root.path("inputFormat").asText(""));
                    basic.put("outputFormat", root.path("outputFormat").asText(""));
                    basic.put("examples", mapper.convertValue(root.path("examples"), List.class));
                    basic.put("constraints", mapper.convertValue(root.path("constraints"), List.class));
                    basic.put("edgeCases", mapper.convertValue(root.path("edgeCases"), List.class));
                    basic.put("followUp", root.path("followUp").asText(""));
                    basic.put("hints", mapper.convertValue(root.path("hints"), List.class));
                    p.setBasicDetailsJson(mapper.writeValueAsString(basic));
                } else {
                    String jsonStr = geminiService.generateProblemBasicDetailsJson(
                            p.getName(), p.getLeetcodeNumber(), p.getTopic().getName());
                    p.setBasicDetailsJson(jsonStr);
                }
                updated = true;
            } catch (Exception e) {
                try {
                    p.setBasicDetailsJson(LocalFallbackGenerator.getBasicDetailsFallbackJson(
                            p.getName(), p.getLeetcodeNumber(), p.getTopic().getName()));
                    updated = true;
                } catch (Exception ex) {
                    // ignore
                }
            }
        }

        // 2. Ensure solutionDetailsJson is present (essential for code snippets and approach tabs)
        if (LocalFallbackGenerator.isBoilerplateSolutionDetails(p.getSolutionDetailsJson())) {
            try {
                if (p.getProblemDetailsJson() != null && !p.getProblemDetailsJson().trim().isEmpty()) {
                    JsonNode root = mapper.readTree(p.getProblemDetailsJson());
                    Map<String, Object> sol = new LinkedHashMap<>();
                    sol.put("observation", root.path("observation").asText(""));
                    sol.put("pattern", root.path("pattern").asText(""));
                    sol.put("approach", root.path("approach").asText(""));
                    sol.put("optimalTimeComplexity", root.path("optimalTimeComplexity").asText(""));
                    sol.put("optimalSpaceComplexity", root.path("optimalSpaceComplexity").asText(""));
                    sol.put("fullExplanation", root.path("fullExplanation").asText(""));
                    sol.put("referenceSolution", root.path("referenceSolution").asText(""));
                    sol.put("referenceSolutions", mapper.convertValue(root.path("referenceSolutions"), Map.class));
                    sol.put("bruteForce", mapper.convertValue(root.path("bruteForce"), Map.class));
                    sol.put("better", mapper.convertValue(root.path("better"), Map.class));
                    sol.put("optimal", mapper.convertValue(root.path("optimal"), Map.class));
                    p.setSolutionDetailsJson(mapper.writeValueAsString(sol));
                } else {
                    String jsonStr = geminiService.generateProblemSolutionDetailsJson(
                            p.getName(), p.getLeetcodeNumber(), p.getTopic().getName());
                    p.setSolutionDetailsJson(jsonStr);
                }
                updated = true;
            } catch (Exception e) {
                try {
                    p.setSolutionDetailsJson(LocalFallbackGenerator.getSolutionDetailsFallbackJson(
                            p.getName(), p.getLeetcodeNumber(), p.getTopic().getName()));
                    updated = true;
                } catch (Exception ex) {
                    // ignore
                }
            }
        }

        // 3. Ensure simplified fields are present (essential for brief task description and brief approach cards)
        if (LocalFallbackGenerator.isBoilerplateSimplifiedStatement(p.getSimplifiedStatement()) ||
            LocalFallbackGenerator.isBoilerplateSimplifiedApproach(p.getSimplifiedApproach())) {
            try {
                Map<String, String> res = geminiService.generateSimplifiedProblemAndApproach(
                        p.getName(),
                        p.getEffectiveProblemStatement(),
                        p.getSolutionDetailsJson()
                );
                
                if (LocalFallbackGenerator.isBoilerplateSimplifiedStatement(p.getSimplifiedStatement())) {
                    p.setSimplifiedStatement(res.get("simplifiedStatement"));
                }
                if (LocalFallbackGenerator.isBoilerplateSimplifiedApproach(p.getSimplifiedApproach())) {
                    Map<String, String> approachMap = new HashMap<>();
                    approachMap.put("optimal", res.get("simplifiedOptimal"));
                    approachMap.put("better", res.getOrDefault("simplifiedBetter", ""));
                    approachMap.put("bruteForce", res.getOrDefault("simplifiedBrute", ""));
                    p.setSimplifiedApproach(mapper.writeValueAsString(approachMap));
                }
                updated = true;
            } catch (Exception e) {
                try {
                    Map<String, String> res = LocalFallbackGenerator.getSimplifiedFallback(p.getName(), p.getTopic().getName());
                    if (LocalFallbackGenerator.isBoilerplateSimplifiedStatement(p.getSimplifiedStatement())) {
                        p.setSimplifiedStatement(res.get("simplifiedStatement"));
                    }
                    if (LocalFallbackGenerator.isBoilerplateSimplifiedApproach(p.getSimplifiedApproach())) {
                        Map<String, String> approachMap = new HashMap<>();
                        approachMap.put("optimal", res.get("simplifiedOptimal"));
                        approachMap.put("better", res.getOrDefault("simplifiedBetter", ""));
                        approachMap.put("bruteForce", res.getOrDefault("simplifiedBrute", ""));
                        p.setSimplifiedApproach(mapper.writeValueAsString(approachMap));
                    }
                    updated = true;
                } catch (Exception ex) {
                    // ignore
                }
            }
        }

        if (updated) {
            problemRepository.save(p);
        }
    }
}
