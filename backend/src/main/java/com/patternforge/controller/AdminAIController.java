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

import java.util.*;

@RestController
@RequestMapping("/admin/ai")
public class AdminAIController {

    private final AIGateway aiGateway;
    private final ProblemGenerationService problemGenerationService;

    public AdminAIController(AIGateway aiGateway, ProblemGenerationService problemGenerationService) {
        this.aiGateway = aiGateway;
        this.problemGenerationService = problemGenerationService;
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
}
