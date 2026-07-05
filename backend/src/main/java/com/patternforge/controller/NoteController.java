package com.patternforge.controller;

import com.patternforge.dto.NoteDto;
import com.patternforge.model.Attempt;
import com.patternforge.model.Note;
import com.patternforge.model.Problem;
import com.patternforge.model.User;
import com.patternforge.repository.AttemptRepository;
import com.patternforge.repository.NoteRepository;
import com.patternforge.repository.ProblemRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/problems/{problemId}/notes")
public class NoteController {

    private final NoteRepository noteRepository;
    private final ProblemRepository problemRepository;
    private final AttemptRepository attemptRepository;

    public NoteController(NoteRepository noteRepository,
                          ProblemRepository problemRepository,
                          AttemptRepository attemptRepository) {
        this.noteRepository = noteRepository;
        this.problemRepository = problemRepository;
        this.attemptRepository = attemptRepository;
    }

    @GetMapping
    public ResponseEntity<?> getNotes(Authentication authentication, @PathVariable UUID problemId) {
        UUID userId = (UUID) authentication.getPrincipal();
        Optional<Note> noteOpt = noteRepository.findByUserIdAndProblemId(userId, problemId);

        if (noteOpt.isEmpty()) {
            return ResponseEntity.ok(NoteDto.builder()
                    .observations("")
                    .bruteForce("")
                    .possiblePatterns("")
                    .chosenPattern("")
                    .timeComplexityGuess("")
                    .spaceComplexityGuess("")
                    .approach("")
                    .mistakes("")
                    .optimizedIdea("")
                    .alternativeSolution("")
                    .futureReminder("")
                    .thinkingChecked(false)
                    .aiFeedback("")
                    .patternsMatchResult("")
                    .timeComplexityResult("")
                    .spaceComplexityResult("")
                    .build());
        }

        Note n = noteOpt.get();
        return ResponseEntity.ok(NoteDto.builder()
                .observations(n.getObservations())
                .bruteForce(n.getBruteForce())
                .possiblePatterns(n.getPossiblePatterns())
                .chosenPattern(n.getChosenPattern())
                .timeComplexityGuess(n.getTimeComplexityGuess())
                .spaceComplexityGuess(n.getSpaceComplexityGuess())
                .approach(n.getApproach())
                .mistakes(n.getMistakes())
                .optimizedIdea(n.getOptimizedIdea())
                .alternativeSolution(n.getAlternativeSolution())
                .futureReminder(n.getFutureReminder())
                .thinkingChecked(n.getThinkingChecked())
                .aiFeedback(n.getAiFeedback())
                .patternsMatchResult(n.getPatternsMatchResult())
                .timeComplexityResult(n.getTimeComplexityResult())
                .spaceComplexityResult(n.getSpaceComplexityResult())
                .build());
    }

    @PostMapping
    public ResponseEntity<?> saveNotes(
            Authentication authentication,
            @PathVariable UUID problemId,
            @RequestBody NoteDto dto) {

        UUID userId = (UUID) authentication.getPrincipal();
        User user = User.builder().id(userId).build();

        Optional<Problem> problemOpt = problemRepository.findById(problemId);
        if (problemOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Problem problem = problemOpt.get();

        Note note = noteRepository.findByUserIdAndProblemId(userId, problemId)
                .orElseGet(() -> Note.builder()
                        .user(user)
                        .problem(problem)
                        .build());

        note.setObservations(dto.getObservations());
        note.setBruteForce(dto.getBruteForce());
        note.setPossiblePatterns(dto.getPossiblePatterns());
        note.setChosenPattern(dto.getChosenPattern());
        note.setTimeComplexityGuess(dto.getTimeComplexityGuess());
        note.setSpaceComplexityGuess(dto.getSpaceComplexityGuess());
        note.setApproach(dto.getApproach());
        note.setMistakes(dto.getMistakes());
        note.setOptimizedIdea(dto.getOptimizedIdea());
        note.setAlternativeSolution(dto.getAlternativeSolution());
        note.setFutureReminder(dto.getFutureReminder());

        noteRepository.save(note);

        // Update attempt metadata
        Attempt attempt = attemptRepository.findByUserIdAndProblemId(userId, problemId)
                .orElseGet(() -> Attempt.builder()
                        .user(user)
                        .problem(problem)
                        .status("UNSOLVED")
                        .wrongAttemptsCount(0)
                        .timeTaken(0)
                        .hintsUsed(0)
                        .build());

        // Check if any notes are typed, if so, mark approach as saved
        boolean isApproachSaved = (dto.getObservations() != null && !dto.getObservations().trim().isEmpty()) ||
                (dto.getBruteForce() != null && !dto.getBruteForce().trim().isEmpty()) ||
                (dto.getApproach() != null && !dto.getApproach().trim().isEmpty());
        
        attempt.setApproachSaved(isApproachSaved);
        attemptRepository.save(attempt);

        return ResponseEntity.ok(Map.of("success", true));
    }
}
