package com.patternforge.service;

import com.patternforge.config.GeminiConfig;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@Slf4j
public class APIKeyManager {

    private final GeminiConfig geminiConfig;
    private final List<String> allKeys = new ArrayList<>();
    private final Map<String, Long> disabledKeys = new ConcurrentHashMap<>();

    public APIKeyManager(GeminiConfig geminiConfig) {
        this.geminiConfig = geminiConfig;
        initializeKeys();
    }

    private void initializeKeys() {
        // 1. Add keys from configuration
        if (geminiConfig.getApiKeys() != null) {
            for (String key : geminiConfig.getApiKeys()) {
                if (key != null && !key.trim().isEmpty() && !allKeys.contains(key.trim())) {
                    allKeys.add(key.trim());
                }
            }
        }

        // 2. Add key from fallback env variable
        String envKey = System.getenv("GEMINI_API_KEY");
        if (envKey != null && !envKey.trim().isEmpty() && !allKeys.contains(envKey.trim())) {
            allKeys.add(envKey.trim());
        }

        // Add keys from fallback env variable GEMINI_API_KEYS (comma-separated list)
        String envKeys = System.getenv("GEMINI_API_KEYS");
        if (envKeys != null && !envKeys.trim().isEmpty()) {
            for (String part : envKeys.split(",")) {
                String trimmed = part.trim();
                if (!trimmed.isEmpty() && !allKeys.contains(trimmed)) {
                    allKeys.add(trimmed);
                }
            }
        }

        // 3. Add key from fallback Verfalarm .env file
        File envFile = new File("C:\\Users\\rajsh\\Desktop\\Verfalarm\\.env");
        if (envFile.exists()) {
            try {
                List<String> lines = Files.readAllLines(envFile.toPath());
                for (String line : lines) {
                    line = line.trim();
                    if (line.startsWith("GEMINI_API_KEY=")) {
                        String key = line.substring("GEMINI_API_KEY=".length()).trim();
                        if (!key.isEmpty() && !allKeys.contains(key)) {
                            allKeys.add(key);
                            log.info("APIKeyManager: Found API key fallback in Verfalarm .env file.");
                        }
                    }
                }
            } catch (IOException e) {
                log.error("APIKeyManager: Failed to read Verfalarm .env file", e);
            }
        }

        log.info("APIKeyManager: Initialized with {} API key(s) in the pool.", allKeys.size());
    }

    public synchronized List<String> getActiveKeys() {
        long now = System.currentTimeMillis();
        List<String> activeKeys = new ArrayList<>();
        for (String key : allKeys) {
            Long disableUntil = disabledKeys.get(key);
            if (disableUntil == null || now >= disableUntil) {
                activeKeys.add(key);
            }
        }
        if (activeKeys.isEmpty()) {
            // Last resort fallback: if all keys are disabled, try all of them anyway
            return new ArrayList<>(allKeys);
        }
        return activeKeys;
    }

    public void disableKey(String key, long cooldownMs) {
        long disableUntil = System.currentTimeMillis() + cooldownMs;
        disabledKeys.put(key, disableUntil);
        log.warn("APIKeyManager: Temporarily disabling API key {} due to quota limit or error. Cooldown: {} ms",
                maskKey(key), cooldownMs);
    }

    public void markKeySuccess(String key) {
        disabledKeys.remove(key);
    }

    private String maskKey(String key) {
        if (key == null || key.length() < 10) return "***";
        return key.substring(0, 5) + "..." + key.substring(key.length() - 5);
    }
}
