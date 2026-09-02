package com.patternforge.controller;

import com.patternforge.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@Slf4j
public class HealthController {

    private final UserRepository userRepository;

    public HealthController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping({"/health", "/api/health"})
    public ResponseEntity<Map<String, Object>> getHealth() {
        boolean dbConnected = true;
        try {
            userRepository.count();
        } catch (Exception e) {
            dbConnected = false;
            log.warn("Health check DB query warning: {}", e.getMessage());
        }

        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("service", "PatternForge Backend");
        response.put("database", dbConnected ? "CONNECTED" : "DISCONNECTED");
        response.put("timestamp", System.currentTimeMillis());

        return ResponseEntity.ok(response);
    }
}
