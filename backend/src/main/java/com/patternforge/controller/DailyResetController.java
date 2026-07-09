package com.patternforge.controller;

import com.patternforge.service.DailyResetService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/daily-reset")
public class DailyResetController {

    private final DailyResetService dailyResetService;

    public DailyResetController(DailyResetService dailyResetService) {
        this.dailyResetService = dailyResetService;
    }

    @PostMapping("/execute")
    public ResponseEntity<?> executeReset(Authentication authentication) {
        UUID userId = (UUID) authentication.getPrincipal();
        dailyResetService.executeClientReset(userId);
        return ResponseEntity.ok(Map.of("success", true));
    }
}
