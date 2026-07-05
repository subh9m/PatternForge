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

    private final RevisionRepository revisionRepository;
    private final AttemptRepository attemptRepository;

    public RevisionController(RevisionRepository revisionRepository, AttemptRepository attemptRepository) {
        this.revisionRepository = revisionRepository;
        this.attemptRepository = attemptRepository;
    }

    @GetMapping
    public ResponseEntity<?> getRevisionQueue(Authentication authentication) {
        UUID userId = (UUID) authentication.getPrincipal();
        List<Revision> pending = revisionRepository.findByUserIdAndStatus(userId, "PENDING");
        
        List<Map<String, Object>> response = new ArrayList<>();
        for (Revision r : pending) {
            Problem p = r.getProblem();
            response.add(Map.of(
                    "id", r.getId(),
                    "problemId", p.getId(),
                    "masterNumber", p.getMasterNumber(),
                    "name", p.getName(),
                    "topicName", p.getTopic().getName(),
                    "difficulty", p.getDifficulty(),
                    "level", r.getLevel(),
                    "scheduledDate", r.getScheduledDate().toString(),
                    "due", r.getScheduledDate().isBefore(LocalDateTime.now())
            ));
        }

        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/complete")
    public ResponseEntity<?> completeRevision(
            Authentication authentication,
            @PathVariable UUID id,
            @RequestBody Map<String, Object> body) {

        UUID userId = (UUID) authentication.getPrincipal();
        Optional<Revision> revisionOpt = revisionRepository.findById(id);

        if (revisionOpt.isEmpty() || !revisionOpt.get().getUser().getId().equals(userId)) {
            return ResponseEntity.notFound().build();
        }

        Revision rev = revisionOpt.get();
        rev.setStatus("COMPLETED");
        rev.setCompletedAt(LocalDateTime.now());
        revisionRepository.save(rev);

        // Advance to next spaced repetition level
        // Spaced levels: 1 -> 3 -> 7 -> 15 -> 30 -> done
        int currentLevel = rev.getLevel();
        int nextLevel = getNextSpacedLevel(currentLevel);

        Optional<Attempt> attemptOpt = attemptRepository.findByUserIdAndProblemId(userId, rev.getProblem().getId());
        if (attemptOpt.isPresent()) {
            Attempt attempt = attemptOpt.get();
            if (nextLevel > 0) {
                attempt.setRevisionLevel(nextLevel);
                LocalDateTime nextDate = LocalDateTime.now().plusDays(nextLevel);
                attempt.setNextRevisionDate(nextDate);
                attemptRepository.save(attempt);

                // Schedule next revision
                revisionRepository.save(Revision.builder()
                        .user(User.builder().id(userId).build())
                        .problem(rev.getProblem())
                        .level(nextLevel)
                        .scheduledDate(nextDate)
                        .status("PENDING")
                        .build());
            } else {
                // Completed all levels, clear revision status
                attempt.setNeedRevision(false);
                attempt.setRevisionLevel(0);
                attempt.setNextRevisionDate(null);
                attemptRepository.save(attempt);
            }
        }

        return ResponseEntity.ok(Map.of(
                "success", true,
                "nextLevel", nextLevel
        ));
    }

    private int getNextSpacedLevel(int currentLevel) {
        if (currentLevel == 1) return 3;
        if (currentLevel == 3) return 7;
        if (currentLevel == 7) return 15;
        if (currentLevel == 15) return 30;
        return 0; // Completed all stages
    }
}
