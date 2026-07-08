package com.patternforge.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.http.HttpResponse;
import java.util.List;

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
    }

    public String executeWithFallback(String textPrompt, String responseMimeType) {
        List<String> availableKeys = apiKeyManager.getAvailableKeys();
        if (availableKeys.isEmpty()) {
            throw new IllegalStateException("All Gemini API keys in the pool are currently disabled or exhausted.");
        }

        List<String> preferredModels = modelSelector.getPreferredModels();

        for (String key : availableKeys) {
            boolean keyHasInvalidError = false;
            for (String model : preferredModels) {
                if (keyHasInvalidError) {
                    break;
                }

                log.info("RetryExecutor: Attempting request using model: {} with key: {}", model, apiKeyManager.maskKey(key));

                int maxTransientAttempts = 3;
                int transientBackoffMs = 1000;

                for (int attempt = 1; attempt <= maxTransientAttempts; attempt++) {
                    try {
                        HttpResponse<String> response = geminiClient.executeRequest(key, model, textPrompt, responseMimeType);

                        int statusCode = response.statusCode();
                        if (statusCode == 200) {
                            apiKeyManager.markSuccess(key);
                            log.info("RetryExecutor: Success with key: {} and model: {}", apiKeyManager.maskKey(key), model);
                            return response.body();
                        } else if (statusCode == 401 || statusCode == 403) {
                            String reason = "Auth Failure (status " + statusCode + "): " + response.body();
                            log.error("RetryExecutor: Key {} failed with: {}", apiKeyManager.maskKey(key), reason);
                            apiKeyManager.markInvalid(key, reason);
                            keyHasInvalidError = true;
                            break; 
                        } else if (statusCode == 429) {
                            int delaySec = geminiClient.parseRetryDelay(response.body());
                            log.warn("RetryExecutor: Key {} hit 429 Quota/Rate limit on model {}. suggested delay: {}s.",
                                    apiKeyManager.maskKey(key), model, delaySec);
                            apiKeyManager.markCooldown(key, delaySec * 1000L, "Quota / Rate limit hit on " + model);
                            break; 
                        } else if (statusCode >= 500) {
                            log.warn("RetryExecutor: Key {} hit 5xx Server Error ({}) on model {} (attempt {}/{}). Retrying...",
                                    apiKeyManager.maskKey(key), statusCode, model, attempt, maxTransientAttempts);
                            if (attempt < maxTransientAttempts) {
                                Thread.sleep(transientBackoffMs);
                                transientBackoffMs *= 2;
                            }
                        } else {
                            log.warn("RetryExecutor: Key {} hit non-retryable error ({}) on model {}. Proceeding...",
                                    apiKeyManager.maskKey(key), statusCode, model);
                            break; 
                        }
                    } catch (IOException | InterruptedException e) {
                        log.warn("RetryExecutor: Network/IO exception on key {} with model {} (attempt {}/{}): {}",
                                apiKeyManager.maskKey(key), model, attempt, maxTransientAttempts, e.getMessage());
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
