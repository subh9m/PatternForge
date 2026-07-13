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

    @Column(columnDefinition = "TEXT")
    private String script;

    private String audioUrl;

    private Integer durationSeconds;

    private String voiceProvider;

    private String voiceModel;

    private String voiceId;

    @Column(nullable = false)
    private String generationStatus; // "FAILED", "GENERATING", "READY"

    @Column(columnDefinition = "TEXT")
    private String errorMessage;

    @Column(nullable = false)
    private LocalDateTime createdAt;
}
