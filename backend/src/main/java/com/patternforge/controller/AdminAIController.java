package com.patternforge.controller;

import com.patternforge.dto.AIRequest;
import com.patternforge.dto.AIResponse;
import com.patternforge.dto.ProviderMetrics;
import com.patternforge.exception.AIProviderException;
import com.patternforge.service.AIGateway;
import com.patternforge.service.AIProvider;
import com.patternforge.service.ProblemGenerationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.*;

@RestController
@RequestMapping("/api/admin/ai")
public class AdminAIController {

    private final AIGateway aiGateway;
    private final ProblemGenerationService problemGenerationService;
    private final com.patternforge.config.AIGatewayConfig gatewayConfig;
    private final com.patternforge.service.AIMonitoringService aiMonitoringService;
    private final com.patternforge.repository.AIRequestLogRepository aiRequestLogRepository;

    public AdminAIController(AIGateway aiGateway, 
                             ProblemGenerationService problemGenerationService,
                             com.patternforge.config.AIGatewayConfig gatewayConfig,
                             com.patternforge.service.AIMonitoringService aiMonitoringService,
                             com.patternforge.repository.AIRequestLogRepository aiRequestLogRepository) {
        this.aiGateway = aiGateway;
        this.problemGenerationService = problemGenerationService;
        this.gatewayConfig = gatewayConfig;
        this.aiMonitoringService = aiMonitoringService;
        this.aiRequestLogRepository = aiRequestLogRepository;
    }

    @GetMapping("/status")
    public ResponseEntity<?> getAIStatus() {
        Map<String, Object> status = new LinkedHashMap<>();
        status.put("AIGateway Active", true);
        
        Map<String, ProviderMetrics> gatewayMetrics = aiGateway.getMetrics();
        for (Map.Entry<String, ProviderMetrics> entry : gatewayMetrics.entrySet()) {
            String provider = entry.getKey();
            ProviderMetrics pm = entry.getValue();
            Map<String, Object> pMap = new LinkedHashMap<>();
            pMap.put("Successful Requests", pm.getSuccessfulRequests());
            pMap.put("Failed Requests", pm.getFailedRequests());
            pMap.put("Average Latency (s)", pm.getAverageLatencySeconds());
            pMap.put("Fastest Latency (s)", pm.getFastestLatencySeconds());
            pMap.put("Slowest Latency (s)", pm.getSlowestLatencySeconds());
            pMap.put("429 Count", pm.getCount429());
            pMap.put("Timeout Count", pm.getCountTimeout());
            pMap.put("Permanent Failure Count", pm.getPermanentFailureCount());
            pMap.put("Health State", pm.getHealthState().toString());
            pMap.put("Circuit State", pm.getCircuitState().toString());
            pMap.put("Health Score", pm.getHealthScore());
            pMap.put("Manually Disabled", pm.isManuallyDisabled());
            pMap.put("Last Error Message", pm.getLastErrorMessage());
            pMap.put("Last Successful Generation", pm.getLastSuccessfulGeneration() != null ? pm.getLastSuccessfulGeneration().toString() : "N/A");
            pMap.put("Last Failure Time", pm.getLastFailureTimeInstant() != null ? pm.getLastFailureTimeInstant().toString() : "N/A");
            status.put(provider, pMap);
        }
        
        status.put("Queue Size", problemGenerationService.getQueueSize());
        status.put("Current Running Job", problemGenerationService.getRunningJobsCount());
        
        return ResponseEntity.ok(status);
    }

    @GetMapping("/test")
    public ResponseEntity<?> testAIKeys(@RequestParam(value = "provider", required = false) String providerName) {
        Map<String, Map<String, String>> results = new LinkedHashMap<>();
        
        for (AIProvider provider : aiGateway.getProviders()) {
            if (providerName != null && !providerName.equalsIgnoreCase(provider.providerName())) {
                continue;
            }

            Map<String, String> providerStatus = new LinkedHashMap<>();
            ProviderMetrics pm = aiGateway.getMetrics().get(provider.providerName());

            if (pm != null && pm.isManuallyDisabled()) {
                providerStatus.put("status", "manually disabled");
                results.put(provider.providerName(), providerStatus);
                continue;
            }

            if (!provider.isConfigured()) {
                providerStatus.put("status", "not configured");
                results.put(provider.providerName(), providerStatus);
                continue;
            }
            
            try {
                // Use the smallest valid prompt to minimize cost and check availability
                AIRequest testRequest = AIRequest.builder()
                        .prompt("ping")
                        .responseMimeType("text/plain")
                        .build();
                
                long startTime = System.currentTimeMillis();
                AIResponse response = provider.generate(testRequest);
                long latencyMs = System.currentTimeMillis() - startTime;
                
                if (pm != null) {
                    pm.recordSuccess(latencyMs);
                }

                providerStatus.put("status", "working");
                providerStatus.put("latency", latencyMs + "ms");
                providerStatus.put("model", response.getModelName());
            } catch (Exception e) {
                int statusCode = -1;
                boolean isPermanent = false;
                if (e instanceof AIProviderException) {
                    AIProviderException ape = (AIProviderException) e;
                    statusCode = ape.getStatusCode();
                    isPermanent = !ape.isRetryable();
                }
                
                if (pm != null) {
                    boolean is429 = (statusCode == 429) || (e.getMessage() != null && e.getMessage().contains("429"));
                    boolean isTimeout = (statusCode == 408) || (e instanceof java.net.http.HttpConnectTimeoutException) || (e instanceof java.util.concurrent.TimeoutException);
                    pm.recordFailure(isPermanent, is429, isTimeout, e.getMessage());
                }

                providerStatus.put("status", "failed");
                providerStatus.put("error", e.getMessage());
                providerStatus.put("statusCode", String.valueOf(statusCode));
                providerStatus.put("retryable", String.valueOf(provider.isRetryable(e)));
            }
            results.put(provider.providerName(), providerStatus);
        }
        
        return ResponseEntity.ok(results);
    }

    @RequestMapping("/toggle-disable")
    public ResponseEntity<?> toggleDisable(@RequestParam("provider") String providerName) {
        Map<String, ProviderMetrics> metricsMap = aiGateway.getMetrics();
        ProviderMetrics pm = null;
        for (Map.Entry<String, ProviderMetrics> entry : metricsMap.entrySet()) {
            if (entry.getKey().equalsIgnoreCase(providerName)) {
                pm = entry.getValue();
                break;
            }
        }
        
        if (pm == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Provider not found. Available: Gemini, Groq, GitHub, OpenRouter"));
        }

        pm.setManuallyDisabled(!pm.isManuallyDisabled());
        return ResponseEntity.ok(Map.of(
                "provider", providerName,
                "manuallyDisabled", pm.isManuallyDisabled(),
                "message", "Provider manual disable toggled successfully."
        ));
    }

    @RequestMapping("/reset-cooldowns")
    public ResponseEntity<?> resetCooldowns() {
        aiGateway.getMetrics().forEach((provider, pm) -> {
            pm.restore();
            pm.setTotalRequests(0);
            pm.setSuccessfulRequests(0);
            pm.setFailedRequests(0);
            pm.setCount429(0);
            pm.setCountTimeout(0);
            pm.setPermanentFailureCount(0);
            pm.setTotalLatencyMs(0);
            pm.setFastestLatencyMs(Long.MAX_VALUE);
            pm.setSlowestLatencyMs(0);
            pm.setLastSuccessfulGeneration(null);
            pm.setLastFailureTimeInstant(null);
        });
        return ResponseEntity.ok(Map.of("message", "AIGateway metrics and circuit states reset to zero."));
    }

    @GetMapping("/health")
    public ResponseEntity<?> runHealthCheck() {
        Map<String, Object> response = new LinkedHashMap<>();
        List<Map<String, Object>> providerResults = new ArrayList<>();
        int healthyCount = 0;
        
        String testPrompt = "Reply with exactly: PatternForge OK";
        int estimatedInputTokens = (int) Math.ceil(testPrompt.length() / 4.0);

        for (AIProvider provider : aiGateway.getProviders()) {
            Map<String, Object> result = new LinkedHashMap<>();
            result.put("providerName", provider.providerName());
            
            // Config Validation
            boolean configured = provider.isConfigured();
            result.put("configured", configured);
            
            // Get model configured
            String model = "";
            if ("Gemini".equals(provider.providerName())) {
                model = gatewayConfig.getGeminiModel();
                if (model == null || model.isEmpty()) model = "gemini-2.5-flash";
            } else if ("Groq".equals(provider.providerName())) {
                model = gatewayConfig.getGroqModel();
                if (model == null || model.isEmpty()) model = "llama-3.3-70b-versatile";
            } else if ("GitHub".equals(provider.providerName())) {
                model = gatewayConfig.getGithubModelsModel();
                if (model == null || model.isEmpty()) model = "gpt-4o-mini";
            } else if ("OpenRouter".equals(provider.providerName())) {
                model = gatewayConfig.getOpenrouterModel();
                if (model == null || model.isEmpty()) model = "google/gemini-2.5-flash";
            }
            result.put("configuredModel", model);

            // API key validation
            result.put("apiKeyExists", configured);
            result.put("apiKeyNotEmpty", configured);
            result.put("endpointConfigured", true); // Default built-in endpoints
            
            // Max tokens and temperature config
            int maxTokensLimit = 3000; // configurable limit
            result.put("maxTokensConfigured", maxTokensLimit);
            result.put("temperatureConfigured", 0.0); // health check temp 0.0 for deterministic output

            result.put("timestamp", java.time.Instant.now().toString());
            result.put("estimatedInputTokens", estimatedInputTokens);

            if (!configured) {
                result.put("healthy", false);
                result.put("httpStatus", -1);
                result.put("latencyMs", 0);
                result.put("responseBody", "Not Configured");
                result.put("estimatedOutputTokens", 0);
                result.put("errorReason", "API Key is missing or empty.");
                providerResults.add(result);
                continue;
            }

            long startTime = System.currentTimeMillis();
            try {
                AIRequest checkRequest = AIRequest.builder()
                        .prompt(testPrompt)
                        .responseMimeType("text/plain")
                        .temperature(0.0)
                        .maxTokens(maxTokensLimit)
                        .problemId("HEALTH_CHECK")
                        .problemTitle("Health Check Ping")
                        .generationType("HEALTH_CHECK")
                        .queueSize(0)
                        .build();

                AIResponse aiResponse = provider.generate(checkRequest);
                long latencyMs = System.currentTimeMillis() - startTime;
                
                result.put("healthy", true);
                result.put("httpStatus", 200);
                result.put("latencyMs", latencyMs);
                result.put("responseBody", aiResponse.getContent());
                
                int outputChars = aiResponse.getContent() != null ? aiResponse.getContent().length() : 0;
                result.put("estimatedOutputTokens", (int) Math.ceil(outputChars / 4.0));
                
                healthyCount++;
            } catch (Exception e) {
                long latencyMs = System.currentTimeMillis() - startTime;
                result.put("healthy", false);
                result.put("latencyMs", latencyMs);
                result.put("estimatedOutputTokens", 0);
                
                int statusCode = 500;
                String errorReason = e.getMessage() != null ? e.getMessage() : "Unknown connection failure";
                
                if (e instanceof AIProviderException) {
                    AIProviderException ape = (AIProviderException) e;
                    statusCode = ape.getStatusCode() > 0 ? ape.getStatusCode() : 500;
                } else {
                    String msg = errorReason.toLowerCase();
                    if (msg.contains("401") || msg.contains("unauthorized")) {
                        statusCode = 401;
                        errorReason = "401 Unauthorized: Invalid API key.";
                    } else if (msg.contains("403") || msg.contains("forbidden")) {
                        statusCode = 403;
                        errorReason = "403 Forbidden: Permission missing.";
                    } else if (msg.contains("404") || msg.contains("not found")) {
                        statusCode = 404;
                        errorReason = "404 Not Found: Invalid model name or endpoint URL.";
                    } else if (msg.contains("429") || msg.contains("rate limit")) {
                        statusCode = 429;
                        errorReason = "429 Too Many Requests: Rate limit exceeded.";
                    } else if (msg.contains("timeout") || msg.contains("connecttimedout")) {
                        statusCode = 408;
                        errorReason = "408 Request Timeout: Provider connection timed out.";
                    }
                }
                
                result.put("httpStatus", statusCode);
                result.put("responseBody", "Failed: " + errorReason);
                result.put("errorReason", errorReason);
            }
            
            providerResults.add(result);
        }
        
        response.put("overallStatus", healthyCount + " / " + aiGateway.getProviders().size() + " Healthy");
        response.put("healthyCount", healthyCount);
        response.put("totalCount", aiGateway.getProviders().size());
        response.put("providers", providerResults);
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/overview")
    public ResponseEntity<?> getOverview() {
        return ResponseEntity.ok(aiMonitoringService.getOverviewStats(aiGateway));
    }

    @GetMapping("/providers")
    public ResponseEntity<?> getProviders() {
        return ResponseEntity.ok(aiMonitoringService.getProvidersStats(aiGateway, gatewayConfig));
    }

    @GetMapping("/history")
    public ResponseEntity<?> getHistory() {
        List<?> logs = aiRequestLogRepository.findByOrderByTimestampDesc();
        if (logs.size() > 200) {
            logs = logs.subList(0, 200);
        }
        return ResponseEntity.ok(logs);
    }

    @PostMapping("/providers/{name}/toggle")
    public ResponseEntity<?> toggleProvider(@PathVariable("name") String providerName) {
        for (Map.Entry<String, ProviderMetrics> entry : aiGateway.getMetrics().entrySet()) {
            if (entry.getKey().equalsIgnoreCase(providerName)) {
                ProviderMetrics pm = entry.getValue();
                pm.setManuallyDisabled(!pm.isManuallyDisabled());
                return ResponseEntity.ok(Map.of(
                        "provider", entry.getKey(),
                        "manuallyDisabled", pm.isManuallyDisabled()
                ));
            }
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/providers/{name}/reset-circuit")
    public ResponseEntity<?> resetCircuit(@PathVariable("name") String providerName) {
        for (Map.Entry<String, ProviderMetrics> entry : aiGateway.getMetrics().entrySet()) {
            if (entry.getKey().equalsIgnoreCase(providerName)) {
                ProviderMetrics pm = entry.getValue();
                pm.restore();
                return ResponseEntity.ok(Map.of(
                        "provider", entry.getKey(),
                        "circuitState", pm.getCircuitState().toString()
                ));
            }
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/providers/{name}/test")
    public ResponseEntity<?> testProvider(@PathVariable("name") String providerName) {
        AIProvider targetProvider = null;
        for (AIProvider p : aiGateway.getProviders()) {
            if (p.providerName().equalsIgnoreCase(providerName)) {
                targetProvider = p;
                break;
            }
        }

        if (targetProvider == null) {
            return ResponseEntity.badRequest().body("Provider " + providerName + " not found.");
        }

        long startTime = System.currentTimeMillis();
        try {
            AIRequest testRequest = AIRequest.builder()
                    .prompt("Reply exactly: PatternForge OK")
                    .responseMimeType("text/plain")
                    .temperature(0.0)
                    .maxTokens(100)
                    .problemId("HEALTH_CHECK")
                    .problemTitle("Health Check Ping")
                    .generationType("HEALTH_CHECK")
                    .queueSize(0)
                    .build();

            AIResponse response = targetProvider.generate(testRequest);
            long latencyMs = System.currentTimeMillis() - startTime;
            
            ProviderMetrics pm = aiGateway.getMetrics().get(targetProvider.providerName());
            if (pm != null) {
                pm.recordSuccess(latencyMs);
            }

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "latencyMs", latencyMs,
                    "httpStatus", 200,
                    "responseBody", response.getContent()
            ));
        } catch (Exception e) {
            long latencyMs = System.currentTimeMillis() - startTime;
            int code = 500;
            if (e instanceof AIProviderException) {
                code = ((AIProviderException) e).getStatusCode();
            }
            
            ProviderMetrics pm = aiGateway.getMetrics().get(targetProvider.providerName());
            if (pm != null) {
                pm.recordFailure(false, code == 429, code == 408, e.getMessage());
            }

            return ResponseEntity.ok(Map.of(
                    "success", false,
                    "latencyMs", latencyMs,
                    "httpStatus", code,
                    "responseBody", "Failed: " + e.getMessage()
            ));
        }
    }
}
