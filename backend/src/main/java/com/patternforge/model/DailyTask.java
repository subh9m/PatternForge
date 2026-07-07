package com.patternforge.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "daily_tasks", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "date"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DailyTask {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private LocalDate date;

    // Comma-separated list of selected module portals (e.g. "dsa,stl,sql")
    @Column(columnDefinition = "TEXT")
    private String selectedModules;

    // Comma-separated list of completed module portals (e.g. "dsa")
    @Column(columnDefinition = "TEXT")
    private String completedModules;

    // JSON or comma-separated target durations in minutes corresponding to the selected modules (e.g., "dsa:30,stl:25")
    @Column(columnDefinition = "TEXT")
    private String targetDurations;
}
