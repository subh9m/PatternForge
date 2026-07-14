package com.patternforge.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "audio_learning_guides", uniqueConstraints = {
    @UniqueConstraint(name = "uq_problem_language", columnNames = {"problemId", "language"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AudioLearningGuide {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private UUID problemId;

    @Column(nullable = false, length = 10)
    private String language; // "HI" or "EN"

    @Column(name = "script", columnDefinition = "TEXT")
    private String spokenScript;

    @Column(name = "duration_seconds")
    private Integer estimatedDurationSeconds;

    @Column(nullable = false)
    private String generationStatus; // "FAILED", "GENERATING", "READY"

    private String generationModel;

    @Column(columnDefinition = "TEXT")
    private String errorMessage;

    @Column(nullable = false)
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
