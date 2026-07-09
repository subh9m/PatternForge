package com.patternforge.model;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "settings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Settings {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Builder.Default
    private Boolean darkMode = true;

    @Builder.Default
    private String editorTheme = "vs-dark";

    @Builder.Default
    private Integer fontSize = 14;

    @Builder.Default
    private Integer tabSize = 4;

    @Builder.Default
    private Integer autosaveInterval = 30; // seconds

    @Builder.Default
    private Boolean keyboardShortcutsEnabled = true;

    @Builder.Default
    private Integer dailyGoal = 3;

    // Hour of day (0-23) when daily progress resets (default: 2 = 2:00 AM)
    @Builder.Default
    private Integer dailyResetHour = 2;

    // Minute (0-59) of the reset time (default: 0)
    @Builder.Default
    private Integer dailyResetMinute = 0;
}
