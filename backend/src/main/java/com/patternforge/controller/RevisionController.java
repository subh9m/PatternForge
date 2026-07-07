package com.patternforge.controller;

import com.patternforge.model.*;
import com.patternforge.repository.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/revisions")
public class RevisionController {

    private final AttemptRepository attemptRepository;
    private final SubmissionRepository submissionRepository;
    private final NoteRepository noteRepository;

    public RevisionController(AttemptRepository attemptRepository,
                              SubmissionRepository submissionRepository,
                              NoteRepository noteRepository) {
        this.attemptRepository = attemptRepository;
        this.submissionRepository = submissionRepository;
        this.noteRepository = noteRepository;
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

    private String getOptimalTimeComplexity(Problem p) {
        if (p.getSolutionDetailsJson() != null && !p.getSolutionDetailsJson().trim().isEmpty()) {
            try {
                com.fasterxml.jackson.databind.JsonNode node = new com.fasterxml.jackson.databind.ObjectMapper().readTree(p.getSolutionDetailsJson());
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
                com.fasterxml.jackson.databind.JsonNode node = new com.fasterxml.jackson.databind.ObjectMapper().readTree(p.getSolutionDetailsJson());
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
