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
        List<String> activeKeys = apiKeyManager.getActiveKeys();
        if (activeKeys.isEmpty()) {
            throw new IllegalStateException("All Gemini API keys in the pool are currently disabled or exhausted.");
        }

        List<String> preferredModels = modelSelector.getPreferredModels();

        for (String key : activeKeys) {
            for (String model : preferredModels) {
                log.info("RetryExecutor: Attempting request using model: {} with key: {}", model, maskKey(key));

                int maxTransientAttempts = 3;
                int transientBackoffMs = 1000;

                for (int attempt = 1; attempt <= maxTransientAttempts; attempt++) {
                    try {
                        HttpResponse<String> response = geminiClient.executeRequest(key, model, textPrompt, responseMimeType);

                        int statusCode = response.statusCode();
                        if (statusCode == 200) {
                            apiKeyManager.markKeySuccess(key);
                            return response.body();
                        } else if (statusCode == 429) {
                            log.warn("RetryExecutor: Hit 429 Rate/Quota limit for model {} with key {}.", model, maskKey(key));
                            int delaySec = geminiClient.parseRetryDelay(response.body());
                            log.info("RetryExecutor: Gemini suggested retry delay is {}s", delaySec);
                            break; 
                        } else if (statusCode >= 500) {
                            log.warn("RetryExecutor: Received server error {} from Gemini (attempt {}/{}). Retrying...",
                                    statusCode, attempt, maxTransientAttempts);
                            if (attempt < maxTransientAttempts) {
                                Thread.sleep(transientBackoffMs);
                                transientBackoffMs *= 2;
                            }
                        } else {
                            log.error("RetryExecutor: Gemini request failed with unretryable status code {}: {}",
                                    statusCode, response.body());
                            break; 
                        }
                    } catch (IOException | InterruptedException e) {
                        log.warn("RetryExecutor: Network/IO exception during execute (attempt {}/{}): {}",
                                attempt, maxTransientAttempts, e.getMessage());
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

            apiKeyManager.disableKey(key, 5 * 60 * 1000);
        }

        throw new RuntimeException("All Gemini API keys and fallback models in the pool have been completely exhausted.");
    }

    private String maskKey(String key) {
        if (key == null || key.length() < 10) return "***";
        return key.substring(0, 5) + "..." + key.substring(key.length() - 5);
    }
}
