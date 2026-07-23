package com.patternforge.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.http.HttpResponse;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@Slf4j
public class RetryExecutor {

    private final APIKeyManager apiKeyManager;
    private final ModelSelector modelSelector;
    private final GeminiClient geminiClient;

    public RetryExecutor(APIKeyManager apiKeyManager, ModelSelector modelSelector, GeminiClient geminiClient) {
        this.apiKeyManager = apiKeyManager;
        this.modelSelector = modelSelector;
        this.geminiClient = geminiClient;
        System.out.println("========================================");
        System.out.println("RetryExecutor Instance Hash Code: " + System.identityHashCode(this));
        System.out.println("RetryExecutor's Injected APIKeyManager Hash Code: " + System.identityHashCode(this.apiKeyManager));
        System.out.println("========================================");
    }

    public static class ExecutionResult {
        public final String responseBody;
        public final String modelName;

        public ExecutionResult(String responseBody, String modelName) {
            this.responseBody = responseBody;
            this.modelName = modelName;
        }
    }

    public String executeWithFallback(String textPrompt, String responseMimeType) {
        return executeWithFallbackDetailed(textPrompt, responseMimeType).responseBody;
    }

    public ExecutionResult executeWithFallbackDetailed(String textPrompt, String responseMimeType) {
        int poolSize = apiKeyManager.getAllKeysRaw().size();
        if (poolSize == 0) {
            throw new IllegalStateException("All Gemini API keys in the pool are currently disabled or exhausted.");
        }

        int consecutive429s = 0;
        boolean shareRateLimits = false;
        int maxRounds = 3;
        for (int round = 0; round < maxRounds; round++) {
            Set<String> triedKeys = new HashSet<>();

            for (int i = 0; i < poolSize; i++) {
                String key = apiKeyManager.nextAvailableKey();

                if (key == null) {
                    log.warn("RetryExecutor: nextAvailableKey() returned null on iteration {} of {} " +
                             "(all remaining keys are in cooldown/disabled). Breaking inner loop for round {}.", i + 1, poolSize, round + 1);
                    break;
                }

                // Guard against wrap-around (same key returned twice in same round)
                if (triedKeys.contains(key)) {
                    log.debug("RetryExecutor: Key {} already tried this round — skipping.", apiKeyManager.maskKey(key));
                    continue;
                }
                triedKeys.add(key);

                boolean skipKey = false;
                
                // Retrieve preferred models list dynamically inside the loop in case models are blacklisted in real-time
                List<String> preferredModels = modelSelector.getPreferredModels();

                for (String model : preferredModels) {
                    if (skipKey) {
                        break;
                    }

                    // Trace print required before every request
                    System.out.println("Current key index: " + apiKeyManager.getKeyIndex(key));
                    System.out.println("Current key id: " + apiKeyManager.maskKey(key));
                    System.out.println("Total keys: " + poolSize);

                    System.out.println("Trying Key " + apiKeyManager.maskKey(key));
                    System.out.println("Model " + model);

                    int maxTransientAttempts = 3;
                    int transientBackoffMs = 1000;

                    for (int attempt = 1; attempt <= maxTransientAttempts; attempt++) {
                        try {
                            HttpResponse<String> response = geminiClient.executeRequest(key, model, textPrompt, responseMimeType);

                            int statusCode = response.statusCode();
                            if (statusCode == 200) {
                                apiKeyManager.markSuccess(key);
                                System.out.println("↓\nSuccess");
                                return new ExecutionResult(response.body(), model);
                            } else if (statusCode == 401 || statusCode == 403) {
                                String reason = "Auth Failure (status " + statusCode + ")";
                                System.out.println("↓\n" + reason);
                                apiKeyManager.markInvalid(key, reason);
                                skipKey = true;
                                consecutive429s = 0;
                                break; 
                            } else if (statusCode == 404) {
                                System.out.println("↓\n404 (Model Unavailable)");
                                modelSelector.markUnsupported(model);
                                consecutive429s = 0;
                                break; 
                            } else if (statusCode == 429) {
                                int delaySec = geminiClient.parseRetryDelay(response.body());
                                System.out.println("↓\n429");
                                apiKeyManager.markCooldown(key, delaySec * 1000L, "Quota / Rate limit hit on " + model + " (cooldown=" + delaySec + "s)");
                                skipKey = true;
                                consecutive429s++;

                                // --- Diagnostic log after every 429 ---
                                List<String> availableSuffixes = new ArrayList<>();
                                List<String> cooldownSuffixes  = new ArrayList<>();
                                for (String k : apiKeyManager.getAllKeysRaw()) {
                                    APIKeyManager.KeyState state = apiKeyManager.getKeyState(k);
                                    if (state == APIKeyManager.KeyState.AVAILABLE) {
                                        availableSuffixes.add(apiKeyManager.maskKey(k));
                                    } else if (state == APIKeyManager.KeyState.COOLDOWN) {
                                        cooldownSuffixes.add(apiKeyManager.maskKey(k));
                                    }
                                }
                                log.warn("RetryExecutor 429 DIAGNOSTIC: key={} entered COOLDOWN for {}s | " +
                                         "available={} {} | cooldown={} {}",
                                         apiKeyManager.maskKey(key), delaySec,
                                         availableSuffixes.size(), availableSuffixes,
                                         cooldownSuffixes.size(), cooldownSuffixes);
                                // ---------------------------------------

                                 long sleepMs = 2000;
                                 if (consecutive429s >= 2 || shareRateLimits) {
                                     shareRateLimits = true;
                                     sleepMs = delaySec * 1000L + 2000L; // cooldown + 2s safety buffer
                                     log.warn("RetryExecutor: Detected sharing rate limits or consecutive 429s. Waiting {} ms before next attempt.", sleepMs);
                                     consecutive429s = 0;
                                     apiKeyManager.setGlobalCooldown(sleepMs);
                                 }

                                try {
                                    Thread.sleep(sleepMs);
                                } catch (InterruptedException ie) {
                                    Thread.currentThread().interrupt();
                                    throw new RuntimeException("Execution interrupted during pacing/cooldown delay", ie);
                                }

                                break; 
                            } else if (statusCode >= 500) {
                                System.out.println("↓\n500 (attempt " + attempt + "/" + maxTransientAttempts + ")");
                                consecutive429s = 0;
                                if (attempt < maxTransientAttempts) {
                                    Thread.sleep(transientBackoffMs);
                                    transientBackoffMs *= 2;
                                }
                            } else {
                                System.out.println("↓\nNon-retryable error: " + statusCode);
                                consecutive429s = 0;
                                break; 
                            }
                        } catch (IOException | InterruptedException e) {
                            System.out.println("↓\nNetwork/IO failure (attempt " + attempt + "/" + maxTransientAttempts + "): " + e.getMessage());
                            consecutive429s = 0;
                            if (e instanceof InterruptedException) {
                                Thread.currentThread().interrupt();
                                throw new RuntimeException("Execution interrupted", e);
                            }
                            if (attempt < maxTransientAttempts) {
                                try {
                                    Thread.sleep(transientBackoffMs);
                                    transientBackoffMs *= 2;
                                } catch (InterruptedException ie) {
                                    Thread.currentThread().interrupt();
                                    throw new RuntimeException("Backoff sleep interrupted", ie);
                                }
                            }
                        }
                    }
                }
            }

            // If round failed because keys are in COOLDOWN, wait for earliest key recovery before next round
            if (round < maxRounds - 1) {
                Long earliestExpiry = apiKeyManager.getEarliestCooldownExpiry();
                long now = System.currentTimeMillis();
                log.info("RetryExecutor Wait Block Diagnostic: round={} earliestExpiry={} now={} diff={}", 
                        round, earliestExpiry, now, (earliestExpiry != null ? (earliestExpiry - now) : "null"));
                if (earliestExpiry != null) {
                    long waitMs = earliestExpiry - now + 1000;
                    if (waitMs > 0) {
                        waitMs = Math.min(waitMs, 65000L);
                        log.info("RetryExecutor: All available keys in pool are currently in COOLDOWN. Waiting {} ms for earliest key to recover (round {}/{})...", waitMs, round + 1, maxRounds);
                        try {
                            Thread.sleep(waitMs);
                            apiKeyManager.evaluateCooldowns();
                        } catch (InterruptedException ie) {
                            Thread.currentThread().interrupt();
                            throw new RuntimeException("Wait for key recovery interrupted", ie);
                        }
                    }
                }
            }
        }

        throw new RuntimeException("All Gemini API keys and fallback models in the pool have been completely exhausted.");
    }
}
