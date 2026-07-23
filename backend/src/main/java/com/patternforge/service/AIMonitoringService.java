package com.patternforge.service;

import com.patternforge.dto.AIRequest;
import com.patternforge.dto.ProviderMetrics;
import com.patternforge.model.AIRequestLog;
import com.patternforge.repository.AIRequestLogRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class AIMonitoringService {

    private final AIRequestLogRepository logRepository;
    private final Instant startupTime = Instant.now();
    
    private final AtomicLong cacheHits = new AtomicLong(0);
    private final AtomicLong cacheMisses = new AtomicLong(0);

    public AIMonitoringService(AIRequestLogRepository logRepository) {
        this.logRepository = logRepository;
    }

    public void recordCacheHit() {
        cacheHits.incrementAndGet();
    }

    public void recordCacheMiss() {
        cacheMisses.incrementAndGet();
    }

    public long getCacheHits() {
        return cacheHits.get();
    }

    public long getCacheMisses() {
        return cacheMisses.get();
    }

    public Instant getStartupTime() {
        return startupTime;
    }

    public void logRequest(AIRequest request, String providerName, String modelName, 
                           long latencyMs, int httpStatus, String responseBody, 
                           boolean success, String errorMessage, boolean providerSwitched, int retryCount) {
        
        int inputChars = request.getPrompt() != null ? request.getPrompt().length() : 0;
        int inputTokens = (int) Math.ceil(inputChars / 4.0);
        int outputChars = responseBody != null ? responseBody.length() : 0;
        int outputTokens = (int) Math.ceil(outputChars / 4.0);
        
        double estimatedCost = estimateCost(providerName, modelName, inputTokens, outputTokens);

        AIRequestLog logEntry = AIRequestLog.builder()
                .timestamp(Instant.now())
                .problemId(request.getProblemId() != null ? request.getProblemId() : "N/A")
                .problemName(request.getProblemTitle() != null ? request.getProblemTitle() : "N/A")
                .providerName(providerName)
                .modelName(modelName)
                .latencyMs(latencyMs)
                .httpStatus(httpStatus)
                .inputTokens(inputTokens)
                .outputTokens(outputTokens)
                .estimatedCost(estimatedCost)
                .cacheHit(false)
                .generationType(request.getGenerationType() != null ? request.getGenerationType() : "USER_REQUEST")
                .success(success)
                .errorMessage(errorMessage != null && errorMessage.length() > 3900 ? errorMessage.substring(0, 3900) : errorMessage)
                .responseBody(responseBody != null && responseBody.length() > 9900 ? responseBody.substring(0, 9900) : responseBody)
                .providerSwitched(providerSwitched)
                .retryCount(retryCount)
                .build();

        try {
            logRepository.save(logEntry);
        } catch (Exception e) {
            System.err.println("Failed to save AIRequestLog: " + e.getMessage());
        }
    }

    private double estimateCost(String providerName, String modelName, int inputTokens, int outputTokens) {
        if (providerName == null) return 0.0;
        String name = providerName.toLowerCase();
        double inputRate = 0.0;
        double outputRate = 0.0;

        if (name.contains("gemini")) {
            inputRate = 0.075 / 1_000_000.0;
            outputRate = 0.30 / 1_000_000.0;
        } else if (name.contains("groq")) {
            inputRate = 0.59 / 1_000_000.0;
            outputRate = 0.79 / 1_000_000.0;
        } else if (name.contains("openrouter")) {
            inputRate = 0.075 / 1_000_000.0;
            outputRate = 0.30 / 1_000_000.0;
        } // github models is free/public sandbox

        return (inputTokens * inputRate) + (outputTokens * outputRate);
    }

    public java.util.Map<String, Object> getOverviewStats(AIGateway aiGateway) {
        java.util.Map<String, Object> stats = new java.util.LinkedHashMap<>();
        
        long uptimeSecs = java.time.Duration.between(startupTime, Instant.now()).getSeconds();
        stats.put("gatewayUptime", formatUptime(uptimeSecs));

        // In-memory circuit & config states
        int healthyCount = 0;
        int totalCount = aiGateway.getProviders().size();
        java.util.List<String> healthy = new java.util.ArrayList<>();
        java.util.List<String> unavailable = new java.util.ArrayList<>();
        java.util.List<String> rateLimited = new java.util.ArrayList<>();
        java.util.List<String> disabled = new java.util.ArrayList<>();
        java.util.List<String> fallbackOrder = new java.util.ArrayList<>();

        String primaryProvider = "None";

        for (AIProvider p : aiGateway.getProviders()) {
            ProviderMetrics pm = aiGateway.getMetrics().get(p.providerName());
            fallbackOrder.add(p.providerName());
            if (pm != null) {
                if (pm.isManuallyDisabled()) {
                    disabled.add(p.providerName());
                } else if (pm.getCircuitState() == ProviderMetrics.CircuitState.OPEN) {
                    unavailable.add(p.providerName());
                } else if (pm.getCount429() > 0 && pm.getLastFailureTimeInstant() != null && pm.getLastFailureTimeInstant().isAfter(Instant.now().minusSeconds(300))) {
                    rateLimited.add(p.providerName());
                    healthyCount++;
                } else {
                    healthy.add(p.providerName());
                    healthyCount++;
                    if ("None".equals(primaryProvider)) {
                        primaryProvider = p.providerName();
                    }
                }
            }
        }

        stats.put("overallGatewayStatus", healthyCount + " / " + totalCount + " Healthy");
        stats.put("healthyProviders", healthy);
        stats.put("unavailableProviders", unavailable);
        stats.put("rateLimitedProviders", rateLimited);
        stats.put("disabledProviders", disabled);
        stats.put("currentPrimaryProvider", primaryProvider);
        stats.put("currentFallbackOrder", fallbackOrder);

        // Fetch logs to compute averages
        java.util.List<AIRequestLog> logs = logRepository.findAll();
        long totalRequests = logs.size();
        long successfulRequests = logs.stream().filter(AIRequestLog::getSuccess).count();
        long failedRequests = totalRequests - successfulRequests;

        double successRate = totalRequests > 0 ? (double) successfulRequests / totalRequests * 100.0 : 100.0;
        double avgResponseTime = logs.stream()
                .filter(AIRequestLog::getSuccess)
                .mapToLong(AIRequestLog::getLatencyMs)
                .average()
                .orElse(0.0) / 1000.0;

        // Cache Hit rate
        long hits = cacheHits.get();
        long misses = cacheMisses.get();
        double cacheHitRate = (hits + misses) > 0 ? (double) hits / (hits + misses) * 100.0 : 0.0;

        Instant todayStart = java.time.LocalDate.now().atStartOfDay(java.time.ZoneOffset.UTC).toInstant();
        long generatedToday = logRepository.countDistinctProblemsGeneratedSince(todayStart);
        long generatedTotal = logRepository.countDistinctProblemsGeneratedTotal();

        long requestsToday = logRepository.countRequestsSince(todayStart);

        stats.put("gatewaySuccessRate", successRate);
        stats.put("averageResponseTime", avgResponseTime);
        stats.put("averageGenerationTime", avgResponseTime); 
        stats.put("cacheHitRate", cacheHitRate);
        stats.put("problemsGeneratedToday", generatedToday);
        stats.put("problemsGeneratedTotal", generatedTotal);
        stats.put("aiRequestsToday", requestsToday);
        stats.put("aiRequestsTotal", totalRequests);
        stats.put("successfulRequests", successfulRequests);
        stats.put("failedRequests", failedRequests);

        return stats;
    }

    public java.util.List<java.util.Map<String, Object>> getProvidersStats(AIGateway aiGateway, com.patternforge.config.AIGatewayConfig gatewayConfig) {
        java.util.List<java.util.Map<String, Object>> resultList = new java.util.ArrayList<>();
        
        for (AIProvider provider : aiGateway.getProviders()) {
            java.util.Map<String, Object> pMap = new java.util.LinkedHashMap<>();
            pMap.put("providerName", provider.providerName());
            
            ProviderMetrics pm = aiGateway.getMetrics().get(provider.providerName());
            
            // Configuration verification
            boolean configured = provider.isConfigured();
            pMap.put("configured", configured);
            pMap.put("apiKeyExists", configured);
            pMap.put("apiKeyNotEmpty", configured);
            pMap.put("endpointConfigured", true); 
            
            // Masked API key
            String maskedKey = "Not Configured";
            if (configured) {
                String fullKey = "";
                if ("Gemini".equals(provider.providerName())) fullKey = gatewayConfig.getGeminiApiKey();
                else if ("Groq".equals(provider.providerName())) fullKey = gatewayConfig.getGroqApiKey();
                else if ("GitHub".equals(provider.providerName())) fullKey = gatewayConfig.getGithubModelsApiKey();
                else if ("OpenRouter".equals(provider.providerName())) fullKey = gatewayConfig.getOpenrouterApiKey();
                
                if (fullKey != null && fullKey.length() > 4) {
                    maskedKey = "************" + fullKey.substring(fullKey.length() - 4);
                } else {
                    maskedKey = "************";
                }
            }
            pMap.put("apiKeyMasked", maskedKey);

            // Fetch model name
            String model = "";
            if ("Gemini".equals(provider.providerName())) model = gatewayConfig.getGeminiModel();
            else if ("Groq".equals(provider.providerName())) model = gatewayConfig.getGroqModel();
            else if ("GitHub".equals(provider.providerName())) model = gatewayConfig.getGithubModelsModel();
            else if ("OpenRouter".equals(provider.providerName())) model = gatewayConfig.getOpenrouterModel();
            pMap.put("configuredModel", model);

            // Default limits & configs
            pMap.put("temperature", 0.0);
            pMap.put("timeout", 30000); 
            pMap.put("retries", 3);
            pMap.put("maxOutputTokens", 3000);

            // Exposed data estimation
            if ("OpenRouter".equals(provider.providerName())) {
                pMap.put("creditsRemaining", "Available in OpenRouter settings");
                pMap.put("dailyLimits", "Not exposed by provider");
            } else if ("Groq".equals(provider.providerName())) {
                pMap.put("dailyLimits", "6,000 requests/day");
                pMap.put("remainingRequests", "Rate limit headers tracked on API responses");
            } else {
                pMap.put("dailyLimits", "Not exposed by provider");
            }

            if (pm != null) {
                // Status mapping with health colors:
                // Green (Healthy), Yellow (Rate Limited), Orange (Slow), Red (Offline), Gray (Disabled)
                String statusColor = "Green";
                String stateStr = "Healthy";
                
                if (pm.isManuallyDisabled()) {
                    statusColor = "Gray";
                    stateStr = "Disabled";
                } else if (pm.getCircuitState() == ProviderMetrics.CircuitState.OPEN) {
                    statusColor = "Red";
                    stateStr = "Offline";
                } else if (pm.getCount429() > 0 && pm.getLastFailureTimeInstant() != null && pm.getLastFailureTimeInstant().isAfter(Instant.now().minusSeconds(300))) {
                    statusColor = "Yellow";
                    stateStr = "Rate Limited";
                } else if (pm.getAverageLatencySeconds() > 5.0) {
                    statusColor = "Orange";
                    stateStr = "Slow";
                }
                
                pMap.put("statusColor", statusColor);
                pMap.put("healthState", stateStr);
                pMap.put("circuitState", pm.getCircuitState().toString());
                
                pMap.put("requestsToday", logRepository.countRequestsSince(Instant.now().minus(24, java.time.temporal.ChronoUnit.HOURS))); 
                pMap.put("requestsTotal", pm.getTotalRequests());
                pMap.put("successfulRequests", pm.getSuccessfulRequests());
                pMap.put("failedRequests", pm.getFailedRequests());
                
                pMap.put("latency", pm.getLastSuccessfulGeneration() != null ? pm.getAverageLatencySeconds() * 1000 : 0.0);
                pMap.put("averageLatency", pm.getAverageLatencySeconds());
                
                pMap.put("lastUsed", pm.getLastSuccessfulGeneration() != null ? pm.getLastSuccessfulGeneration().toString() : "Never");
                pMap.put("lastSuccessfulRequest", pm.getLastSuccessfulGeneration() != null ? pm.getLastSuccessfulGeneration().toString() : "Never");
                pMap.put("lastFailure", pm.getLastFailureTimeInstant() != null ? pm.getLastFailureTimeInstant().toString() : "Never");
                pMap.put("failureReason", pm.getLastErrorMessage());
            }

            resultList.add(pMap);
        }
        return resultList;
    }

    private String formatUptime(long seconds) {
        long d = seconds / (24 * 3600);
        long h = (seconds % (24 * 3600)) / 3600;
        long m = (seconds % 3600) / 60;
        long s = seconds % 60;
        if (d > 0) {
            return String.format("%dd %dh %dm", d, h, m);
        } else if (h > 0) {
            return String.format("%dh %dm %ds", h, m, s);
        } else {
            return String.format("%dm %ds", m, s);
        }
    }
}
