package com.patternforge.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "study_history", indexes = {
    @Index(name = "idx_study_history_user_date", columnList = "user_id, date")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudyHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private LocalDate date;

    @Column(nullable = false)
    private String module;

    @Column(nullable = false)
    private Integer targetTimeMins;

    @Column(nullable = false)
    private Integer actualTimeSecs;

    @Column(nullable = false)
    private Boolean completed;
}
