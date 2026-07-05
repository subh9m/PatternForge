package com.patternforge.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "submissions", indexes = {
    @Index(name = "idx_submissions_user_problem", columnList = "user_id, problem_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Submission {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "problem_id", nullable = false)
    private Problem problem;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String code;

    @Column(nullable = false)
    private String language; // "cpp", "java", "python", "javascript"

    @Column(nullable = false)
    private String status; // "RUN_SUCCESS", "SUBMIT_SUCCESS", "COMPILE_ERROR", "WRONG_ANSWER", "RUNTIME_ERROR"

    @Column(columnDefinition = "TEXT")
    private String compileOutput;

    private Integer executionTime; // in milliseconds
    private Integer memoryUsed; // in kilobytes

    @Column(nullable = false)
    private LocalDateTime createdAt;
}
