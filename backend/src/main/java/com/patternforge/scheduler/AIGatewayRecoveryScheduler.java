package com.patternforge.scheduler;

import com.patternforge.dto.AIRequest;
import com.patternforge.dto.AIResponse;
import com.patternforge.dto.ProviderMetrics;
import com.patternforge.service.AIGateway;
import com.patternforge.service.AIProvider;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class AIGatewayRecoveryScheduler {

    private final AIGateway aiGateway;

    public AIGatewayRecoveryScheduler(AIGateway aiGateway) {
        this.aiGateway = aiGateway;
    }

    // Every 15 minutes (900,000 ms)
    @Scheduled(fixedRate = 900000)
    public void runRecoveryCheck() {
        log.info("AIGatewayRecoveryScheduler: Running recovery checks for unavailable/OPEN providers...");
        
        for (AIProvider provider : aiGateway.getProviders()) {
            ProviderMetrics pm = aiGateway.getMetrics().get(provider.providerName());
            if (pm == null) continue;

            if (pm.getCircuitState() == ProviderMetrics.CircuitState.OPEN || 
                pm.getHealthState() == ProviderMetrics.HealthState.UNAVAILABLE) {
                
                log.info("AIGatewayRecoveryScheduler: Provider '{}' is currently unhealthy. Sending test ping request...", provider.providerName());
                try {
                    AIRequest request = AIRequest.builder()
                            .prompt("ping")
                            .responseMimeType("text/plain")
                            .build();
                    provider.generate(request);
                    
                    log.info("AIGatewayRecoveryScheduler: Health check for '{}' succeeded! Restoring provider and closing circuit.", provider.providerName());
                    pm.restore();
                } catch (Exception e) {
                    log.warn("AIGatewayRecoveryScheduler: Health check for '{}' failed: {}", provider.providerName(), e.getMessage());
                }
            }
        }
    }
}
