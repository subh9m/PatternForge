package com.patternforge.service;

import com.patternforge.dto.AIRequest;
import com.patternforge.dto.AIResponse;
import com.patternforge.dto.ProviderMetrics;
import com.patternforge.exception.AIProviderException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
@Slf4j
public class AIGateway {

    private final List<AIProvider> providers = new ArrayList<>();
    private final Map<String, ProviderMetrics> metrics = new ConcurrentHashMap<>();

    public AIGateway(List<AIProvider> providerList) {
        // Pre-initialize metrics for all expected providers
        metrics.put("Gemini", new ProviderMetrics());
        metrics.put("Groq", new ProviderMetrics());
        metrics.put("GitHub", new ProviderMetrics());
        metrics.put("OpenRouter", new ProviderMetrics());

        // Order: Gemini -> Groq -> GitHub Models -> OpenRouter
        Map<String, AIProvider> providerMap = new HashMap<>();
        for (AIProvider p : providerList) {
            providerMap.put(p.providerName().toLowerCase(), p);
            // Ensure any custom or unmapped provider has metrics initialized
            metrics.putIfAbsent(p.providerName(), new ProviderMetrics());
        }

        String[] order = {"gemini", "groq", "github", "openrouter"};
        for (String name : order) {
            AIProvider p = providerMap.get(name);
            if (p != null) {
                providers.add(p);
                log.info("AIGateway: Registered provider '{}'", p.providerName());
            }
        }

        // Add any other provider implementations that might be added in the future
        for (AIProvider p : providerList) {
            if (!providers.contains(p)) {
                providers.add(p);
                log.info("AIGateway: Registered extra provider '{}'", p.providerName());
            }
        }
    }

    public AIResponse generate(AIRequest request) {
        List<String> errors = new ArrayList<>();
        long gatewayStartTime = System.currentTimeMillis();

        for (AIProvider provider : providers) {
            if (!provider.isConfigured()) {
                log.info("AIGateway: Provider '{}' is not configured. Skipping.", provider.providerName());
                continue;
            }

            log.info("Trying {}...", provider.providerName());
            long providerStartTime = System.currentTimeMillis();

            try {
                AIResponse response = provider.generate(request);
                long latencyMs = System.currentTimeMillis() - providerStartTime;
                
                log.info("{} succeeded.", provider.providerName());
                log.info("Provider Used: {}", provider.providerName());
                log.info("Generation Time: {} seconds", String.format("%.2f", latencyMs / 1000.0));

                // Record metrics
                ProviderMetrics pm = metrics.get(provider.providerName());
                if (pm != null) {
                    pm.recordSuccess(latencyMs);
                }

                return response;
            } catch (Exception e) {
                long latencyMs = System.currentTimeMillis() - providerStartTime;
                boolean isRetryable = provider.isRetryable(e);
                
                int statusCode = -1;
                if (e instanceof AIProviderException) {
                    statusCode = ((AIProviderException) e).getStatusCode();
                }

                log.warn("AIGateway: Provider '{}' failed. StatusCode: {}, Message: {}. Retryable: {}", 
                        provider.providerName(), statusCode, e.getMessage(), isRetryable);

                // Record metrics
                ProviderMetrics pm = metrics.get(provider.providerName());
                if (pm != null) {
                    boolean is429 = (statusCode == 429) || (e.getMessage() != null && e.getMessage().contains("429"));
                    boolean isTimeout = (statusCode == 408) || (e instanceof java.net.http.HttpConnectTimeoutException) || (e instanceof java.util.concurrent.TimeoutException);
                    pm.recordFailure(is429, isTimeout);
                }

                errors.add(provider.providerName() + " failed (" + (statusCode != -1 ? "Status " + statusCode : e.getClass().getSimpleName()) + "): " + e.getMessage());

                // Log and move to next
                log.info("Failure on {}. Moving to next provider.", provider.providerName());
            }
        }

        // If all providers failed
        long totalGatewayTime = System.currentTimeMillis() - gatewayStartTime;
        String combinedMessage = "All AI Providers failed. Latency: " + (totalGatewayTime / 1000.0) + "s. Errors: " + String.join(" | ", errors);
        log.error("AIGateway: " + combinedMessage);
        throw new RuntimeException(combinedMessage);
    }

    public Map<String, ProviderMetrics> getMetrics() {
        return metrics;
    }

    public List<AIProvider> getProviders() {
        return providers;
    }
}
