package com.patternforge.service;

import com.patternforge.config.GeminiConfig;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.util.*;
import java.util.concurrent.*;

@Service
@Slf4j
public class APIKeyManager {

    public enum KeyState {
        AVAILABLE,
        COOLDOWN,
        INVALID,
        DISABLED
    }

    private final GeminiConfig geminiConfig;
    private final List<String> allKeys = new ArrayList<>();
    private final Map<String, KeyState> keyStates = new ConcurrentHashMap<>();
    private final Map<String, Long> cooldowns = new ConcurrentHashMap<>();
    private final Map<String, String> lastErrors = new ConcurrentHashMap<>();
    
    private final ScheduledExecutorService scheduler = Executors.newSingleThreadScheduledExecutor(r -> {
        Thread t = new Thread(r, "api-key-recovery-scheduler");
        t.setDaemon(true);
        return t;
    });

    public APIKeyManager(GeminiConfig geminiConfig, ModelSelector modelSelector) {
        this.geminiConfig = geminiConfig;
        initializeKeys();
        startRecoveryTask();

        int keysCount = allKeys.size();
        int modelsCount = modelSelector.getLoadedModelsCount();
        System.out.println("========================================");
        System.out.println("Loaded Keys:\n" + keysCount);
        System.out.println("Loaded Models:\n" + modelsCount);
        System.out.println("Total combinations:\n" + (keysCount * modelsCount));
        System.out.println("========================================");
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

        // 2. Add keys from gemini_keys.txt
        File localKeysFile = new File("gemini_keys.txt");
        if (!localKeysFile.exists()) {
            localKeysFile = new File("backend/gemini_keys.txt");
        }
        if (localKeysFile.exists()) {
            try {
                List<String> lines = Files.readAllLines(localKeysFile.toPath());
                for (String line : lines) {
                    line = line.trim();
                    if (!line.isEmpty() && !line.startsWith("#") && !allKeys.contains(line)) {
                        allKeys.add(line);
                    }
                }
                log.info("APIKeyManager: Loaded keys from local gemini_keys.txt file at: {}", localKeysFile.getAbsolutePath());
            } catch (IOException e) {
                log.error("APIKeyManager: Failed to read local gemini_keys.txt", e);
            }
        }

        // 3. Add key from fallback env variable
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

        // 4. Add key from fallback Verfalarm .env file
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

        // Initialize all keys as AVAILABLE
        for (String key : allKeys) {
            keyStates.put(key, KeyState.AVAILABLE);
        }

        log.info("APIKeyManager: Initialized with {} API key(s) in the pool.", allKeys.size());
    }

    private void startRecoveryTask() {
        scheduler.scheduleAtFixedRate(this::evaluateCooldowns, 1, 1, TimeUnit.MINUTES);
    }

    public synchronized void evaluateCooldowns() {
        long now = System.currentTimeMillis();
        for (String key : allKeys) {
            if (keyStates.get(key) == KeyState.COOLDOWN) {
                Long until = cooldowns.get(key);
                if (until != null && now >= until) {
                    keyStates.put(key, KeyState.AVAILABLE);
                    cooldowns.remove(key);
                    log.info("APIKeyManager: Key {} automatically recovered from COOLDOWN and is now AVAILABLE.", maskKey(key));
                    notifyAll();
                }
            }
        }
    }

    public synchronized List<String> getAvailableKeys() {
        evaluateCooldowns();
        List<String> available = new ArrayList<>();
        for (String key : allKeys) {
            if (keyStates.get(key) == KeyState.AVAILABLE) {
                available.add(key);
            }
        }
        return available;
    }

    public synchronized void markCooldown(String key, long cooldownMs, String reason) {
        keyStates.put(key, KeyState.COOLDOWN);
        cooldowns.put(key, System.currentTimeMillis() + cooldownMs);
        lastErrors.put(key, reason != null ? reason : "Quota / Rate Limit Exceeded");
        log.warn("APIKeyManager: Key {} entered COOLDOWN state due to: {}. Cooldown duration: {} ms",
                maskKey(key), reason, cooldownMs);
    }

    public synchronized void markInvalid(String key, String reason) {
        keyStates.put(key, KeyState.INVALID);
        cooldowns.remove(key);
        lastErrors.put(key, reason != null ? reason : "Invalid credentials / authorization failure");
        log.error("APIKeyManager: Key {} permanently marked INVALID due to: {}.", maskKey(key), reason);
    }

    public synchronized void markSuccess(String key) {
        keyStates.put(key, KeyState.AVAILABLE);
        cooldowns.remove(key);
        lastErrors.remove(key);
    }

    public List<String> getAllKeysRaw() {
        return new ArrayList<>(allKeys);
    }

    public synchronized KeyState getKeyState(String key) {
        return keyStates.getOrDefault(key, KeyState.AVAILABLE);
    }

    public synchronized Long getCooldownUntil(String key) {
        return cooldowns.get(key);
    }

    public synchronized String getLastError(String key) {
        return lastErrors.get(key);
    }

    public synchronized Long getEarliestCooldownExpiry() {
        long earliest = Long.MAX_VALUE;
        for (Map.Entry<String, Long> entry : cooldowns.entrySet()) {
            if (keyStates.get(entry.getKey()) == KeyState.COOLDOWN) {
                earliest = Math.min(earliest, entry.getValue());
            }
        }
        return earliest == Long.MAX_VALUE ? null : earliest;
    }

    public Map<String, Object> getStatusMap(int queueSize, int runningJobs, int loadedModels, int supportedModels) {
        Map<String, Object> map = new LinkedHashMap<>();
        int available = 0;
        int cooldown = 0;
        int invalid = 0;
        int disabled = 0;

        for (String key : allKeys) {
            KeyState state = keyStates.get(key);
            if (state == null) continue;
            switch (state) {
                case AVAILABLE -> available++;
                case COOLDOWN -> cooldown++;
                case INVALID -> invalid++;
                case DISABLED -> disabled++;
            }
        }

        map.put("Loaded Keys", allKeys.size());
        map.put("Available Keys", available);
        map.put("Cooldown Keys", cooldown);
        map.put("Invalid Keys", invalid);
        map.put("Loaded Models", loadedModels);
        map.put("Supported Models", supportedModels);
        map.put("Queue Size", queueSize);
        map.put("Current Running Job", runningJobs);

        return map;
    }

    public String maskKey(String key) {
        if (key == null || key.length() < 10) return "***";
        return key.substring(0, 5) + "..." + key.substring(key.length() - 5);
    }
}
