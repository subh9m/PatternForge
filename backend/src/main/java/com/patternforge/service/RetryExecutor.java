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

        Set<String> triedKeys = new HashSet<>();

        for (int i = 0; i < poolSize; i++) {
            String key = apiKeyManager.nextAvailableKey();

            // BUG FIX: previously a `break` here caused the loop to exit on the very
            // first miss, throwing "exhausted" even with 9 other keys available.
            // Now we log and continue — the next iteration may find a different key.
            if (key == null) {
                log.warn("RetryExecutor: nextAvailableKey() returned null on iteration {} of {} " +
                         "(all remaining keys are in cooldown). Skipping iteration.", i + 1, poolSize);
                continue;
            }

            // Guard against wrap-around (same key returned twice)
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
                            break; 
                        } else if (statusCode == 404) {
                            System.out.println("↓\n404 (Model Unavailable)");
                            modelSelector.markUnsupported(model);
                            break; 
                        } else if (statusCode == 429) {
                            int delaySec = geminiClient.parseRetryDelay(response.body());
                            System.out.println("↓\n429");
                            apiKeyManager.markCooldown(key, delaySec * 1000L, "Quota / Rate limit hit on " + model + " (cooldown=" + delaySec + "s)");
                            skipKey = true;

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

                            break; 
                        } else if (statusCode >= 500) {
                            System.out.println("↓\n500 (attempt " + attempt + "/" + maxTransientAttempts + ")");
                            if (attempt < maxTransientAttempts) {
                                Thread.sleep(transientBackoffMs);
                                transientBackoffMs *= 2;
                            }
                        } else {
                            System.out.println("↓\nNon-retryable error: " + statusCode);
                            break; 
                        }
                    } catch (IOException | InterruptedException e) {
                        System.out.println("↓\nNetwork/IO failure (attempt " + attempt + "/" + maxTransientAttempts + "): " + e.getMessage());
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

        throw new RuntimeException("All Gemini API keys and fallback models in the pool have been completely exhausted.");
    }
}
