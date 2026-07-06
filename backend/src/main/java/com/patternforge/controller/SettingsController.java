package com.patternforge.controller;

import com.patternforge.dto.SettingsDto;
import com.patternforge.model.Settings;
import com.patternforge.repository.SettingsRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/settings")
public class SettingsController {

    private final SettingsRepository settingsRepository;

    public SettingsController(SettingsRepository settingsRepository) {
        this.settingsRepository = settingsRepository;
    }

    @GetMapping
    public ResponseEntity<?> getSettings(Authentication authentication) {
        UUID userId = (UUID) authentication.getPrincipal();
        Settings settings = settingsRepository.findByUserId(userId)
                .orElseGet(() -> Settings.builder()
                        .darkMode(true)
                        .editorTheme("vs-dark")
                        .fontSize(14)
                        .tabSize(4)
                        .autosaveInterval(30)
                        .keyboardShortcutsEnabled(true)
                        .dailyGoal(3)
                        .build());
        
        return ResponseEntity.ok(SettingsDto.builder()
                .darkMode(settings.getDarkMode())
                .editorTheme(settings.getEditorTheme())
                .fontSize(settings.getFontSize())
                .tabSize(settings.getTabSize())
                .autosaveInterval(settings.getAutosaveInterval())
                .keyboardShortcutsEnabled(settings.getKeyboardShortcutsEnabled())
                .dailyGoal(settings.getDailyGoal() != null ? settings.getDailyGoal() : 3)
                .build());
    }

    @PutMapping
    public ResponseEntity<?> updateSettings(Authentication authentication, @RequestBody SettingsDto dto) {
        UUID userId = (UUID) authentication.getPrincipal();
        Settings settings = settingsRepository.findByUserId(userId)
                .orElseGet(() -> Settings.builder().build());

        settings.setDarkMode(dto.getDarkMode());
        settings.setEditorTheme(dto.getEditorTheme());
        settings.setFontSize(dto.getFontSize());
        settings.setTabSize(dto.getTabSize());
        settings.setAutosaveInterval(dto.getAutosaveInterval());
        settings.setKeyboardShortcutsEnabled(dto.getKeyboardShortcutsEnabled());
        settings.setDailyGoal(dto.getDailyGoal() != null ? dto.getDailyGoal() : 3);

        settingsRepository.save(settings);
        return ResponseEntity.ok(Map.of("success", true));
    }
}
