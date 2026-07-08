package com.patternforge.controller;

import com.patternforge.dto.CodeRunRequest;
import com.patternforge.dto.CodeRunResponse;
import com.patternforge.model.*;
import com.patternforge.repository.*;
import com.patternforge.service.CodeExecutionService;
import com.patternforge.service.GeminiService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/problems/{problemId}")
public class SubmissionController {

    private final CodeExecutionService codeExecutionService;
    private final ProblemRepository problemRepository;
    private final AttemptRepository attemptRepository;
    private final SubmissionRepository submissionRepository;
    private final TestCaseRepository testCaseRepository;
    private final GeminiService geminiService;
    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(SubmissionController.class);

    public SubmissionController(CodeExecutionService codeExecutionService,
                                ProblemRepository problemRepository,
                                AttemptRepository attemptRepository,
                                SubmissionRepository submissionRepository,
                                TestCaseRepository testCaseRepository,
                                GeminiService geminiService) {
        this.codeExecutionService = codeExecutionService;
        this.problemRepository = problemRepository;
        this.attemptRepository = attemptRepository;
        this.submissionRepository = submissionRepository;
        this.testCaseRepository = testCaseRepository;
        this.geminiService = geminiService;
    }

    @PostMapping("/run")
    public ResponseEntity<?> runCode(
            Authentication authentication,
            @PathVariable UUID problemId,
            @RequestBody CodeRunRequest request) {

        Optional<Problem> problemOpt = problemRepository.findById(problemId);
        if (problemOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        CodeExecutionService.ExecutionResult result = codeExecutionService.executeCode(
                request.getCode(),
                request.getLanguage(),
                request.getCustomInput()
        );

        return ResponseEntity.ok(CodeRunResponse.builder()
                .success(result.success)
                .output(result.output)
                .error(result.error)
                .runTimeMs(result.runTimeMs)
                .isTimeout(result.isTimeout)
                .status(result.exitCode == 0 ? "RUN_SUCCESS" : (result.isTimeout ? "TIME_LIMIT_EXCEEDED" : "RUNTIME_ERROR"))
                .build());
    }

    @PostMapping("/submit")
    public ResponseEntity<?> submitCode(
            Authentication authentication,
            @PathVariable UUID problemId,
            @RequestBody CodeRunRequest request) {

        Optional<Problem> problemOpt = problemRepository.findById(problemId);
        if (problemOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Problem problem = problemOpt.get();
        UUID userId = (UUID) authentication.getPrincipal();
        User user = User.builder().id(userId).build();

        List<TestCase> testCases = testCaseRepository.findByProblemId(problemId);
        
        // If no test cases exist, we create a default dummy test case to let the execution run
        if (testCases.isEmpty()) {
            testCases = new ArrayList<>();
            testCases.add(TestCase.builder()
                    .problem(problem)
                    .input("")
                    .expectedOutput("")
                    .isPublic(true)
                    .build());
        }

        int passedCount = 0;
        int totalCount = testCases.size();
        String finalStatus = "SUBMIT_SUCCESS";
        String compileErrorDetails = "";
        long maxRuntime = 0;

        for (TestCase tc : testCases) {
            CodeExecutionService.ExecutionResult result = codeExecutionService.executeCode(
                    request.getCode(),
                    request.getLanguage(),
                    tc.getInput()
            );

            maxRuntime = Math.max(maxRuntime, result.runTimeMs);

            if (result.isTimeout) {
                finalStatus = "TIME_LIMIT_EXCEEDED";
                compileErrorDetails = "Execution timed out on test case.";
                break;
            }

            if (result.exitCode != 0) {
                finalStatus = result.error.contains("Compilation Error") ? "COMPILE_ERROR" : "RUNTIME_ERROR";
                compileErrorDetails = result.error;
                break;
            }

            // Standardize output comparison (trim trailing spaces, newlines)
            String actual = result.output.trim().replaceAll("\\r\\n", "\n");
            String expected = tc.getExpectedOutput().trim().replaceAll("\\r\\n", "\n");

            // If it's a dummy test case, we check that output executes without errors (success = true)
            if (tc.getInput().isEmpty() && tc.getExpectedOutput().isEmpty()) {
                passedCount++;
            } else if (actual.equals(expected)) {
                passedCount++;
            } else {
                finalStatus = "WRONG_ANSWER";
                compileErrorDetails = String.format("Input: %s\nExpected: %s\nActual: %s", tc.getInput(), expected, actual);
                break;
            }
        }

        if (passedCount == totalCount) {
            finalStatus = "SUBMIT_SUCCESS";
        }

        // Save submission history
        Submission submission = Submission.builder()
                .user(user)
                .problem(problem)
                .code(request.getCode())
                .language(request.getLanguage())
                .status(finalStatus)
                .compileOutput(compileErrorDetails)
                .executionTime((int) maxRuntime)
                .createdAt(LocalDateTime.now())
                .build();
        submissionRepository.save(submission);

        // Update problem attempt tracking
        Attempt attempt = attemptRepository.findByUserIdAndProblemId(userId, problemId)
                .orElseGet(() -> Attempt.builder()
                        .user(user)
                        .problem(problem)
                        .wrongAttemptsCount(0)
                        .timeTaken(0)
                        .hintsUsed(0)
                        .build());

        attempt.setLastAttemptedAt(LocalDateTime.now());
        attempt.setCodeSaved(true);

        if (finalStatus.equals("SUBMIT_SUCCESS")) {
            attempt.setStatus("SOLVED");
        } else {
            attempt.setStatus("WRONG");
            attempt.setWrongAttemptsCount(attempt.getWrongAttemptsCount() + 1);
        }
        attemptRepository.save(attempt);

        if ("SOLVED".equals(attempt.getStatus())) {
            generateAndSaveSimplifiedFields(attempt.getProblem());
        }

        // Calculate updated streak and solved count for the user
        List<Submission> userSubmissions = submissionRepository.findByUserIdOrderByCreatedAtDesc(userId);
        List<Attempt> userAttempts = attemptRepository.findByUserId(userId);

        Set<java.time.LocalDate> activityDates = new HashSet<>();
        userSubmissions.stream()
                .map(s -> s.getCreatedAt().toLocalDate())
                .forEach(activityDates::add);
        userAttempts.stream()
                .filter(a -> a.getLastAttemptedAt() != null)
                .map(a -> a.getLastAttemptedAt().toLocalDate())
                .forEach(activityDates::add);

        int newStreak = calculateStreak(activityDates);
        long newSolvedCount = userAttempts.stream().filter(a -> a.getStatus().equals("SOLVED")).count();

        return ResponseEntity.ok(CodeRunResponse.builder()
                .success(finalStatus.equals("SUBMIT_SUCCESS"))
                .status(finalStatus)
                .error(compileErrorDetails)
                .runTimeMs(maxRuntime)
                .testCasesPassed(passedCount)
                .totalTestCases(totalCount)
                .newStreak(newStreak)
                .newSolvedCount((int) newSolvedCount)
                .build());
    }

    private int calculateStreak(Set<java.time.LocalDate> activityDates) {
        if (activityDates.isEmpty()) return 0;

        java.time.LocalDate today = java.time.LocalDate.now();
        java.time.LocalDate yesterday = today.minusDays(1);

        if (!activityDates.contains(today) && !activityDates.contains(yesterday)) {
            return 0;
        }

        int currentStreak = 0;
        java.time.LocalDate checkDate = activityDates.contains(today) ? today : yesterday;

        while (activityDates.contains(checkDate)) {
            currentStreak++;
            checkDate = checkDate.minusDays(1);
        }

        return currentStreak;
    }

    @GetMapping("/submissions")
    public ResponseEntity<?> getSubmissions(Authentication authentication, @PathVariable UUID problemId) {
        UUID userId = (UUID) authentication.getPrincipal();
        List<Submission> history = submissionRepository.findByUserIdAndProblemIdOrderByCreatedAtDesc(userId, problemId);
        
        List<Map<String, Object>> response = new ArrayList<>();
        for (Submission s : history) {
            response.add(Map.of(
                    "id", s.getId(),
                    "language", s.getLanguage(),
                    "status", s.getStatus(),
                    "code", s.getCode(),
                    "compileOutput", s.getCompileOutput() != null ? s.getCompileOutput() : "",
                    "runTimeMs", s.getExecutionTime(),
                    "createdAt", s.getCreatedAt().toString()
            ));
        }

        return ResponseEntity.ok(response);
    }

    public void generateAndSaveSimplifiedFields(Problem problem) {
        UUID problemId = problem.getId();
        new Thread(() -> {
            try {
                Optional<Problem> freshOpt = problemRepository.findById(problemId);
                if (freshOpt.isPresent()) {
                    generateMissingDetails(freshOpt.get());
                }
            } catch (Exception e) {
                System.err.println("PatternForge: Error in async generateAndSaveSimplifiedFields in SubmissionController: " + e.getMessage());
            }
        }).start();
    }

    private void generateMissingDetails(Problem p) {
        boolean updated = false;
        ObjectMapper mapper = new ObjectMapper();

        // 1. Ensure basicDetailsJson
        if (p.getBasicDetailsJson() == null || p.getBasicDetailsJson().trim().isEmpty()) {
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
                    Map<String, Object> fallback = new HashMap<>();
                    fallback.put("problemStatement", "Problem: " + p.getName() + " (LeetCode #" + p.getLeetcodeNumber() + ")");
                    fallback.put("inputFormat", "Please refer to LeetCode for the full problem statement.");
                    fallback.put("outputFormat", "Please refer to LeetCode for the output format.");
                    fallback.put("examples", Collections.emptyList());
                    fallback.put("constraints", Collections.emptyList());
                    fallback.put("edgeCases", Collections.emptyList());
                    fallback.put("followUp", "");
                    fallback.put("hints", List.of(
                            "Think about the brute force approach first.",
                            "Consider what data structures could optimize your solution.",
                            "Look for patterns related to " + p.getTopic().getName() + "."));
                    p.setBasicDetailsJson(mapper.writeValueAsString(fallback));
                    updated = true;
                } catch (Exception ex) {}
            }
        }

        // 2. Ensure solutionDetailsJson
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
                    Map<String, Object> fallback = new HashMap<>();
                    fallback.put("observation", "This problem falls under " + p.getTopic().getName() + ".");
                    fallback.put("pattern", p.getTopic().getName());
                    fallback.put("approach", "Analyze the problem constraints and identify the optimal pattern.");
                    fallback.put("optimalTimeComplexity", "O(n)");
                    fallback.put("optimalSpaceComplexity", "O(1)");
                    fallback.put("fullExplanation", "AI solution details unavailable.");
                    fallback.put("referenceSolution", "# Reference solution not available.");
                    p.setSolutionDetailsJson(mapper.writeValueAsString(fallback));
                    updated = true;
                } catch (Exception ex) {}
            }
        }

        // 3. Ensure simplifiedStatement and simplifiedApproach
        if (p.getSimplifiedStatement() == null || p.getSimplifiedStatement().trim().isEmpty() ||
            p.getSimplifiedApproach() == null || p.getSimplifiedApproach().trim().isEmpty()) {
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
                if (p.getSimplifiedStatement() == null || p.getSimplifiedStatement().trim().isEmpty()) {
                    p.setSimplifiedStatement("Solve the coding puzzle for " + p.getName() + ".");
                }
                if (p.getSimplifiedApproach() == null || p.getSimplifiedApproach().trim().isEmpty()) {
                    try {
                        Map<String, String> approachMap = new HashMap<>();
                        approachMap.put("optimal", "Optimal solution using standard categories.");
                        approachMap.put("better", "");
                        approachMap.put("bruteForce", "");
                        p.setSimplifiedApproach(mapper.writeValueAsString(approachMap));
                    } catch (Exception ex) {}
                }
                updated = true;
            }
        }

        if (updated) {
            problemRepository.save(p);
        }
    }
}
