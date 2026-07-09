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

        for (String key : availableKeys) {
            boolean skipKey = false;
            
            // Retrieve preferred models list dynamically inside the loop in case models are blacklisted in real-time
            List<String> preferredModels = modelSelector.getPreferredModels();

            for (String model : preferredModels) {
                if (skipKey) {
                    break;
                }

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
                            return response.body();
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
                            apiKeyManager.markCooldown(key, delaySec * 1000L, "Quota / Rate limit hit on " + model);
                            skipKey = true;
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
