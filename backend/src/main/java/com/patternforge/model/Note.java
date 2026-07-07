package com.patternforge.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "notes", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "problem_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Note {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "problem_id", nullable = false)
    private Problem problem;

    // Pre-coding notes
    @Column(columnDefinition = "TEXT")
    private String observations;

    @Column(columnDefinition = "TEXT")
    private String bruteForce;

    @Column(columnDefinition = "TEXT")
    private String possiblePatterns; // Comma-separated or JSON

    private String chosenPattern;
    private String timeComplexityGuess;
    private String spaceComplexityGuess;

    @Column(columnDefinition = "TEXT")
    private String approach;

    // Post-solving notes
    @Column(columnDefinition = "TEXT")
    private String mistakes;

    @Column(columnDefinition = "TEXT")
    private String optimizedIdea;

    @Column(columnDefinition = "TEXT")
    private String alternativeSolution;

    @Column(columnDefinition = "TEXT")
    private String futureReminder;

    @Builder.Default
    private Boolean thinkingChecked = false;

    @Column(columnDefinition = "TEXT")
    private String aiFeedback;

    private String patternsMatchResult;
    private String timeComplexityResult;
    private String spaceComplexityResult;
    private String explanationScore;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
