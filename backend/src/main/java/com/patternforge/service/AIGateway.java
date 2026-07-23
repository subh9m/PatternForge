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
            ProviderMetrics pm = metrics.get(provider.providerName());
            
            // 스마트 selection: skip if manually disabled or circuit is OPEN
            if (pm != null && !pm.checkCircuitState()) {
                String reason = pm.isManuallyDisabled() ? "Manually Disabled" : "Circuit Open";
                log.info("Trying {}...\nSkipped.\nReason:\n{}.", provider.providerName(), reason);
                errors.add(provider.providerName() + " skipped (Reason: " + reason + ")");
                continue;
            }

            if (!provider.isConfigured()) {
                log.info("Trying {}...\nSkipped.\nReason:\nNot Configured.", provider.providerName());
                errors.add(provider.providerName() + " skipped (Reason: Not Configured)");
                continue;
            }

            log.info("Trying {}...", provider.providerName());
            long providerStartTime = System.currentTimeMillis();

            try {
                AIResponse response = provider.generate(request);
                long latencyMs = System.currentTimeMillis() - providerStartTime;
                
                log.info("{}\nSuccess.\nLatency:\n{} sec.\nProvider:\n{}.", 
                        provider.providerName(), String.format("%.2f", latencyMs / 1000.0), provider.providerName());

                // Record metrics
                if (pm != null) {
                    pm.recordSuccess(latencyMs);
                }

                return response;
            } catch (Exception e) {
                long latencyMs = System.currentTimeMillis() - providerStartTime;
                
                int statusCode = -1;
                boolean isPermanent = false;
                
                if (e instanceof AIProviderException) {
                    AIProviderException ape = (AIProviderException) e;
                    statusCode = ape.getStatusCode();
                    isPermanent = !ape.isRetryable();
                } else {
                    // Try to guess if it's a permanent or temporary error
                    String msg = e.getMessage() != null ? e.getMessage().toLowerCase() : "";
                    if (msg.contains("401") || msg.contains("403") || msg.contains("404") || msg.contains("unauthorized") || msg.contains("forbidden") || msg.contains("unsupported")) {
                        isPermanent = true;
                    }
                }

                log.warn("AIGateway: Provider '{}' failed. StatusCode: {}, Message: {}. Permanent Failure: {}", 
                        provider.providerName(), statusCode, e.getMessage(), isPermanent);

                // Record failure metrics
                if (pm != null) {
                    boolean is429 = (statusCode == 429) || (e.getMessage() != null && e.getMessage().contains("429"));
                    boolean isTimeout = (statusCode == 408) || (e instanceof java.net.http.HttpConnectTimeoutException) || (e instanceof java.util.concurrent.TimeoutException);
                    pm.recordFailure(isPermanent, is429, isTimeout, e.getMessage());
                }

                errors.add(provider.providerName() + " failed (" + (statusCode != -1 ? "Status " + statusCode : e.getClass().getSimpleName()) + "): " + e.getMessage());
                log.info("Failure on {}. Moving to next provider.", provider.providerName());
            }
        }

        // If all providers failed
        long totalGatewayTime = System.currentTimeMillis() - gatewayStartTime;
        String combinedMessage = "All AI Providers failed. Latency: " + (totalGatewayTime / 1000.0) + "s. Errors: " + String.join(" | ", errors);
        log.error("AIGateway: " + combinedMessage);
        throw new RuntimeException(combinedMessage);
    }

    public double getEstimatedWaitTimeSeconds() {
        // Find the first configured and healthy provider
        for (AIProvider provider : providers) {
            ProviderMetrics pm = metrics.get(provider.providerName());
            if (pm != null && pm.checkCircuitState() && provider.isConfigured() && pm.getHealthState() != ProviderMetrics.HealthState.UNAVAILABLE) {
                double avgSecs = pm.getAverageLatencySeconds();
                if (avgSecs == 0.0) {
                    // Default estimate based on typical provider response speed
                    if ("Gemini".equals(provider.providerName())) return 4.5;
                    if ("Groq".equals(provider.providerName())) return 3.5;
                    return 5.0;
                }
                return avgSecs + 0.2; // Add 200ms buffer for validation & save
            }
        }
        return 5.0; // Default fallback estimate
    }

    public Map<String, ProviderMetrics> getMetrics() {
        return metrics;
    }

    public List<AIProvider> getProviders() {
        return providers;
    }
}
