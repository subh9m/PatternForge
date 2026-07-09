package com.patternforge.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SettingsDto {
    private Boolean darkMode;
    private String editorTheme;
    private Integer fontSize;
    private Integer tabSize;
    private Integer autosaveInterval;
    private Boolean keyboardShortcutsEnabled;
    private Integer dailyGoal;
    private Integer dailyResetHour; // 0-23, hour of day to reset daily progress
}
