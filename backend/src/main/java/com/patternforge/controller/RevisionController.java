package com.patternforge.controller;

import com.patternforge.model.*;
import com.patternforge.repository.*;
import com.patternforge.service.GeminiService;
import com.patternforge.service.LocalFallbackGenerator;
import com.patternforge.service.ProblemGenerationService;
import com.patternforge.service.DailyBoundaryService;
import com.patternforge.service.DailyResetService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
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
    private final ProblemGenerationService problemGenerationService;
    private final RevisionSessionRepository revisionSessionRepository;
    private final UserRepository userRepository;
    private final DailyResetService dailyResetService;
    private final DailyBoundaryService dailyBoundaryService;

    public RevisionController(AttemptRepository attemptRepository,
                              SubmissionRepository submissionRepository,
                              NoteRepository noteRepository,
                              ProblemRepository problemRepository,
                              ProblemGenerationService problemGenerationService,
                              RevisionSessionRepository revisionSessionRepository,
                              UserRepository userRepository,
                              DailyResetService dailyResetService,
                              DailyBoundaryService dailyBoundaryService) {
        this.attemptRepository = attemptRepository;
        this.submissionRepository = submissionRepository;
        this.noteRepository = noteRepository;
        this.problemRepository = problemRepository;
        this.problemGenerationService = problemGenerationService;
        this.revisionSessionRepository = revisionSessionRepository;
        this.userRepository = userRepository;
        this.dailyResetService = dailyResetService;
        this.dailyBoundaryService = dailyBoundaryService;
    }

    @GetMapping
    public ResponseEntity<?> getRevisionQueue(Authentication authentication) {
        UUID userId = (UUID) authentication.getPrincipal();

        dailyResetService.ensureDailyReset(userId);
        Settings settings = dailyResetService.getOrCreateSettings(userId);

        List<Attempt> solvedAttempts = attemptRepository.findByUserId(userId).stream()
                .filter(a -> "SOLVED".equals(a.getStatus()))
                .toList();

        List<Map<String, Object>> response = new ArrayList<>();

        for (Attempt a : solvedAttempts) {
            Problem p = a.getProblem();
            
            boolean activeGenerating = problemGenerationService.isGenerating(p.getId());
            int estimatedTimeSeconds = problemGenerationService.getEstimatedTimeSeconds(p.getId());

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

            boolean isRevisedToday = dailyBoundaryService.isOnActiveStudyDay(a.getLastRevisedAt(), settings);

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
            item.put("isGenerating", activeGenerating);
            item.put("estimatedTimeSeconds", estimatedTimeSeconds);
            
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
        if (Boolean.TRUE.equals(attempt.getNeedRevision()) && attempt.getRevisionLevel() != null && attempt.getRevisionLevel() > 0) {
            attempt.setNextRevisionDate(LocalDateTime.now().plusDays(attempt.getRevisionLevel()));
        }
        attemptRepository.save(attempt);

        // If there's an active session, increment questionsRevised
        revisionSessionRepository.findByUserIdAndStatusIn(userId, List.of("RUNNING", "PAUSED"))
            .forEach(session -> {
                session.setQuestionsRevised(session.getQuestionsRevised() + 1);
                revisionSessionRepository.save(session);
            });

        return ResponseEntity.ok(Map.of("success", true));
    }

    @GetMapping("/session/active")
    public ResponseEntity<?> getActiveSession(Authentication authentication) {
        UUID userId = (UUID) authentication.getPrincipal();
        Optional<RevisionSession> sessionOpt = revisionSessionRepository
            .findByUserIdAndStatusIn(userId, List.of("RUNNING", "PAUSED"))
            .stream()
            .findFirst();
        if (sessionOpt.isPresent()) {
            RevisionSession s = sessionOpt.get();
            Map<String, Object> res = new HashMap<>();
            res.put("id", s.getId());
            res.put("startTime", s.getStartTime());
            res.put("elapsedTime", s.getElapsedTime());
            res.put("status", s.getStatus());
            res.put("questionsRevised", s.getQuestionsRevised());
            res.put("date", s.getDate());
            res.put("active", true);
            return ResponseEntity.ok(res);
        }
        return ResponseEntity.ok(Map.of("active", false));
    }

    @PostMapping("/session/start")
    public ResponseEntity<?> startSession(Authentication authentication) {
        UUID userId = (UUID) authentication.getPrincipal();
        User user = userRepository.findById(userId).orElseThrow();

        dailyResetService.ensureDailyReset(userId);
        Settings settings = dailyResetService.getOrCreateSettings(userId);
        LocalDate effectiveDate = dailyBoundaryService.getActiveStudyDate(settings);
        
        Optional<RevisionSession> activeSessionOpt = revisionSessionRepository
            .findByUserIdAndStatusIn(userId, List.of("RUNNING", "PAUSED"))
            .stream()
            .findFirst();
            
        if (activeSessionOpt.isPresent()) {
            RevisionSession s = activeSessionOpt.get();
            s.setStatus("RUNNING");
            revisionSessionRepository.save(s);
            return ResponseEntity.ok(s);
        }
        
        RevisionSession newSession = RevisionSession.builder()
            .user(user)
            .date(effectiveDate)
            .startTime(LocalDateTime.now())
            .elapsedTime(0)
            .status("RUNNING")
            .questionsRevised(0)
            .build();
            
        revisionSessionRepository.save(newSession);
        return ResponseEntity.ok(newSession);
    }

    @PostMapping("/session/pause")
    public ResponseEntity<?> pauseSession(
            Authentication authentication,
            @RequestBody Map<String, Object> payload) {
        UUID userId = (UUID) authentication.getPrincipal();
        Optional<RevisionSession> sessionOpt = revisionSessionRepository
            .findByUserIdAndStatusIn(userId, List.of("RUNNING", "PAUSED"))
            .stream()
            .findFirst();
            
        if (sessionOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("No active session found");
        }
        
        RevisionSession s = sessionOpt.get();
        if (payload.containsKey("elapsedTime")) {
            s.setElapsedTime(((Number) payload.get("elapsedTime")).intValue());
        }
        s.setStatus("PAUSED");
        revisionSessionRepository.save(s);
        return ResponseEntity.ok(s);
    }

    @PostMapping("/session/resume")
    public ResponseEntity<?> resumeSession(Authentication authentication) {
        UUID userId = (UUID) authentication.getPrincipal();
        Optional<RevisionSession> sessionOpt = revisionSessionRepository
            .findByUserIdAndStatusIn(userId, List.of("RUNNING", "PAUSED"))
            .stream()
            .findFirst();
            
        if (sessionOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("No active session found");
        }
        
        RevisionSession s = sessionOpt.get();
        s.setStatus("RUNNING");
        revisionSessionRepository.save(s);
        return ResponseEntity.ok(s);
    }

    @PostMapping("/session/save")
    public ResponseEntity<?> saveSession(
            Authentication authentication,
            @RequestBody Map<String, Object> payload) {
        UUID userId = (UUID) authentication.getPrincipal();
        Optional<RevisionSession> sessionOpt = revisionSessionRepository
            .findByUserIdAndStatusIn(userId, List.of("RUNNING", "PAUSED"))
            .stream()
            .findFirst();
            
        if (sessionOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("No active session found");
        }
        
        RevisionSession s = sessionOpt.get();
        if (payload.containsKey("elapsedTime")) {
            s.setElapsedTime(((Number) payload.get("elapsedTime")).intValue());
        }
        if (payload.containsKey("status")) {
            s.setStatus((String) payload.get("status"));
        }
        revisionSessionRepository.save(s);
        return ResponseEntity.ok(s);
    }

    @PostMapping("/session/finish")
    public ResponseEntity<?> finishSession(
            Authentication authentication,
            @RequestBody Map<String, Object> payload) {
        UUID userId = (UUID) authentication.getPrincipal();
        Optional<RevisionSession> sessionOpt = revisionSessionRepository
            .findByUserIdAndStatusIn(userId, List.of("RUNNING", "PAUSED"))
            .stream()
            .findFirst();
            
        if (sessionOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("No active session found");
        }
        
        RevisionSession s = sessionOpt.get();
        if (payload.containsKey("elapsedTime")) {
            s.setElapsedTime(((Number) payload.get("elapsedTime")).intValue());
        }
        s.setStatus("FINISHED");
        revisionSessionRepository.save(s);
        return ResponseEntity.ok(s);
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
