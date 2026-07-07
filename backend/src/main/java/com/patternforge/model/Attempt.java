package com.patternforge.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "attempts", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "problem_id"})
}, indexes = {
    @Index(name = "idx_attempts_user_problem", columnList = "user_id, problem_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Attempt {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "problem_id", nullable = false)
    private Problem problem;

    @Column(nullable = false)
    private String status; // "SOLVED", "ATTEMPTED", "WRONG"

    @Builder.Default
    private Boolean approachSaved = false;
    @Builder.Default
    private Boolean codeSaved = false;
    private LocalDateTime lastAttemptedAt;
    private Integer confidenceRating; // 1 to 5
    @Builder.Default
    private Boolean isFavorite = false;
    @Builder.Default
    private Boolean needRevision = false;
    @Builder.Default
    private Integer revisionLevel = 0; // 0, 1, 2, 3, 4, 5 corresponding to days (1, 3, 7, 15, 30)
    private LocalDateTime nextRevisionDate;
    private LocalDateTime lastRevisedAt;
    @Builder.Default
    private Integer timeTaken = 0; // seconds
    @Builder.Default
    private Integer hintsUsed = 0;
    @Builder.Default
    private Integer wrongAttemptsCount = 0;
}
