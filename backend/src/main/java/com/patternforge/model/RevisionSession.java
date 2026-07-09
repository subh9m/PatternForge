package com.patternforge.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "revision_sessions", indexes = {
    @Index(name = "idx_revision_sessions_user_date", columnList = "user_id, date"),
    @Index(name = "idx_revision_sessions_user_status", columnList = "user_id, status")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RevisionSession {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private LocalDate date;

    @Column(nullable = false)
    private LocalDateTime startTime;

    @Column(nullable = false)
    private Integer elapsedTime; // in seconds

    @Column(nullable = false)
    private String status; // "RUNNING", "PAUSED", "FINISHED"

    @Column(nullable = false)
    private Integer questionsRevised;
}
