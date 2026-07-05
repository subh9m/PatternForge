package com.patternforge.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "revisions", indexes = {
    @Index(name = "idx_revisions_user_status", columnList = "user_id, status")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Revision {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "problem_id", nullable = false)
    private Problem problem;

    private Integer level; // 1, 3, 7, 15, 30 (representing days) or custom (e.g. 0)

    @Column(nullable = false)
    private LocalDateTime scheduledDate;

    private LocalDateTime completedAt;

    @Column(nullable = false)
    private String status; // "PENDING", "COMPLETED", "SKIPPED"
}
