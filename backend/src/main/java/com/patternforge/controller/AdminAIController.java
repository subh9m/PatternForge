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
            pMap.put("429 Count", pm.getCount429());
            pMap.put("Timeout Count", pm.getCountTimeout());
            pMap.put("Last Successful Generation", pm.getLastSuccessfulGeneration() != null ? pm.getLastSuccessfulGeneration().toString() : "N/A");
            status.put(provider + " Metrics", pMap);
        }
        
        status.put("Queue Size", problemGenerationService.getQueueSize());
        status.put("Current Running Job", problemGenerationService.getRunningJobsCount());
        
        return ResponseEntity.ok(status);
    }

    @GetMapping("/test")
    public ResponseEntity<?> testAIKeys() {
        Map<String, Map<String, String>> results = new LinkedHashMap<>();
        
        for (AIProvider provider : aiGateway.getProviders()) {
            Map<String, String> providerStatus = new LinkedHashMap<>();
            if (!provider.isConfigured()) {
                providerStatus.put("status", "not configured");
                results.put(provider.providerName(), providerStatus);
                continue;
            }
            
            try {
                AIRequest testRequest = AIRequest.builder()
                        .prompt("Hello")
                        .responseMimeType("text/plain")
                        .build();
                AIResponse response = provider.generate(testRequest);
                providerStatus.put("status", "working");
                providerStatus.put("latency", response.getLatencyMs() + "ms");
                providerStatus.put("model", response.getModelName());
            } catch (Exception e) {
                int statusCode = -1;
                if (e instanceof AIProviderException) {
                    statusCode = ((AIProviderException) e).getStatusCode();
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

    @RequestMapping("/reset-cooldowns")
    public ResponseEntity<?> resetCooldowns() {
        // Reset metrics for all providers
        aiGateway.getMetrics().forEach((provider, pm) -> {
            pm.setSuccessfulRequests(0);
            pm.setFailedRequests(0);
            pm.setTotalLatencyMs(0);
            pm.setCount429(0);
            pm.setCountTimeout(0);
            pm.setLastSuccessfulGeneration(null);
        });
        return ResponseEntity.ok(Map.of("message", "AIGateway metrics reset back to zero."));
    }
}
