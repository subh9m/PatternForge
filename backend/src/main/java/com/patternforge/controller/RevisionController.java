package com.patternforge.controller;

import com.patternforge.model.*;
import com.patternforge.repository.*;
import com.patternforge.service.GeminiService;
import com.patternforge.service.LocalFallbackGenerator;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/revisions")
public class RevisionController {

    private final AttemptRepository attemptRepository;
    private final SubmissionRepository submissionRepository;
    private final NoteRepository noteRepository;
    private final ProblemRepository problemRepository;
    private final GeminiService geminiService;
    private static final Set<UUID> generatingProblems = ConcurrentHashMap.newKeySet();

    public RevisionController(AttemptRepository attemptRepository,
                              SubmissionRepository submissionRepository,
                              NoteRepository noteRepository,
                              ProblemRepository problemRepository,
                              GeminiService geminiService) {
        this.attemptRepository = attemptRepository;
        this.submissionRepository = submissionRepository;
        this.noteRepository = noteRepository;
        this.problemRepository = problemRepository;
        this.geminiService = geminiService;
    }

    @GetMapping
    public ResponseEntity<?> getRevisionQueue(Authentication authentication) {
        UUID userId = (UUID) authentication.getPrincipal();
        
        // Query solved attempts
        List<Attempt> solvedAttempts = attemptRepository.findByUserId(userId).stream()
                .filter(a -> "SOLVED".equals(a.getStatus()))
                .toList();

        List<Map<String, Object>> response = new ArrayList<>();
        java.time.LocalDate today = java.time.LocalDate.now();

        for (Attempt a : solvedAttempts) {
            Problem p = a.getProblem();
            
            // Check if details are missing and need generation
            boolean isGenerating = (p.getBasicDetailsJson() == null || p.getBasicDetailsJson().trim().isEmpty() ||
                                    "{}".equals(p.getBasicDetailsJson()) ||
                                    p.getSimplifiedStatement() == null || p.getSimplifiedStatement().trim().isEmpty() ||
                                    p.getSimplifiedApproach() == null || p.getSimplifiedApproach().trim().isEmpty() ||
                                    "{}".equals(p.getSimplifiedApproach()) ||
                                    p.getSolutionDetailsJson() == null || p.getSolutionDetailsJson().trim().isEmpty() ||
                                    "{}".equals(p.getSolutionDetailsJson()));

            if (isGenerating) {
                UUID problemId = p.getId();
                if (generatingProblems.add(problemId)) {
                    new Thread(() -> {
                        try {
                            Optional<Problem> freshOpt = problemRepository.findById(problemId);
                            if (freshOpt.isPresent()) {
                                ensureProblemDetailsAndSimplifiedFields(freshOpt.get());
                            }
                        } catch (Exception e) {
                            e.printStackTrace();
                        } finally {
                            generatingProblems.remove(problemId);
                        }
                    }).start();
                }
            }

            // Get user's latest code submission
            List<Submission> submissions = submissionRepository.findByUserIdAndProblemIdOrderByCreatedAtDesc(userId, p.getId());
            String userCode = submissions.isEmpty() ? "" : submissions.get(0).getCode();
            String language = submissions.isEmpty() ? "cpp" : submissions.get(0).getLanguage();

            // Get user's complexity guess from Notes
            String timeComplexity = "";
            Optional<Note> noteOpt = noteRepository.findByUserIdAndProblemId(userId, p.getId());
            if (noteOpt.isPresent() && noteOpt.get().getTimeComplexityGuess() != null && !noteOpt.get().getTimeComplexityGuess().trim().isEmpty()) {
                timeComplexity = noteOpt.get().getTimeComplexityGuess();
            } else {
                timeComplexity = getOptimalTimeComplexity(p);
            }

            boolean isRevisedToday = (a.getLastRevisedAt() != null && a.getLastRevisedAt().toLocalDate().equals(today));

            Map<String, Object> item = new HashMap<>();
            item.put("id", p.getId());
            item.put("masterNumber", p.getMasterNumber());
            item.put("name", p.getName());
            item.put("topicName", p.getTopic().getName());
            item.put("difficulty", p.getDifficulty());
            item.put("simplifiedStatement", p.getSimplifiedStatement() != null ? p.getSimplifiedStatement() : "Solve the puzzle in brief.");
            item.put("simplifiedApproach", p.getSimplifiedApproach() != null ? p.getSimplifiedApproach() : "Short optimal strategy.");
            item.put("userCode", userCode);
            item.put("language", language);
            item.put("timeComplexity", timeComplexity);
            item.put("spaceComplexity", getOptimalSpaceComplexity(p));
            item.put("isRevisedToday", isRevisedToday);
            item.put("solutionDetails", p.getSolutionDetailsJson() != null ? p.getSolutionDetailsJson() : "{}");
            item.put("problemStatement", p.getEffectiveProblemStatement());
            item.put("isGenerating", isGenerating);
            
            response.add(item);
        }

        return ResponseEntity.ok(response);
    }

    @PostMapping("/{problemId}/complete")
    public ResponseEntity<?> completeRevision(
            Authentication authentication,
            @PathVariable UUID problemId) {

        UUID userId = (UUID) authentication.getPrincipal();
        Optional<Attempt> attemptOpt = attemptRepository.findByUserIdAndProblemId(userId, problemId);

        if (attemptOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Attempt attempt = attemptOpt.get();
        attempt.setLastRevisedAt(LocalDateTime.now());
        attemptRepository.save(attempt);

        return ResponseEntity.ok(Map.of("success", true));
    }

    private void ensureProblemDetailsAndSimplifiedFields(Problem p) {
        boolean updated = false;
        ObjectMapper mapper = new ObjectMapper();

        // 1. Ensure basicDetailsJson is present (essential for problem description)
        if (p.getBasicDetailsJson() == null || p.getBasicDetailsJson().trim().isEmpty() || "{}".equals(p.getBasicDetailsJson())) {
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
        if (p.getSolutionDetailsJson() == null || p.getSolutionDetailsJson().trim().isEmpty() || "{}".equals(p.getSolutionDetailsJson())) {
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
        if (p.getSimplifiedStatement() == null || p.getSimplifiedStatement().trim().isEmpty() ||
            p.getSimplifiedApproach() == null || p.getSimplifiedApproach().trim().isEmpty() ||
            "{}".equals(p.getSimplifiedApproach())) {
            try {
                Map<String, String> res = geminiService.generateSimplifiedProblemAndApproach(
                        p.getName(),
                        p.getEffectiveProblemStatement(),
                        p.getSolutionDetailsJson()
                );
                
                if (p.getSimplifiedStatement() == null || p.getSimplifiedStatement().trim().isEmpty()) {
                    p.setSimplifiedStatement(res.get("simplifiedStatement"));
                }
                if (p.getSimplifiedApproach() == null || p.getSimplifiedApproach().trim().isEmpty()) {
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
                    if (p.getSimplifiedStatement() == null || p.getSimplifiedStatement().trim().isEmpty()) {
                        p.setSimplifiedStatement(res.get("simplifiedStatement"));
                    }
                    if (p.getSimplifiedApproach() == null || p.getSimplifiedApproach().trim().isEmpty() || "{}".equals(p.getSimplifiedApproach())) {
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

    private String getOptimalTimeComplexity(Problem p) {
        if (p.getSolutionDetailsJson() != null && !p.getSolutionDetailsJson().trim().isEmpty()) {
            try {
                JsonNode node = new ObjectMapper().readTree(p.getSolutionDetailsJson());
                if (node.has("optimalTimeComplexity")) {
                    return node.get("optimalTimeComplexity").asText();
                }
                if (node.has("optimal") && node.get("optimal").has("timeComplexity")) {
                    return node.get("optimal").get("timeComplexity").asText();
                }
            } catch (Exception e) {
                // ignore
            }
        }
        return "O(N)";
    }

    private String getOptimalSpaceComplexity(Problem p) {
        if (p.getSolutionDetailsJson() != null && !p.getSolutionDetailsJson().trim().isEmpty()) {
            try {
                JsonNode node = new ObjectMapper().readTree(p.getSolutionDetailsJson());
                if (node.has("optimalSpaceComplexity")) {
                    return node.get("optimalSpaceComplexity").asText();
                }
                if (node.has("optimal") && node.get("optimal").has("spaceComplexity")) {
                    return node.get("optimal").get("spaceComplexity").asText();
                }
            } catch (Exception e) {
                // ignore
            }
        }
        return "O(1)";
    }
}
