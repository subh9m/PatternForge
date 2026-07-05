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

    private Boolean darkMode = true;
    private String editorTheme = "vs-dark";
    private Integer fontSize = 14;
    private Integer tabSize = 4;
    private Integer autosaveInterval = 30; // seconds
    private Boolean keyboardShortcutsEnabled = true;
}
