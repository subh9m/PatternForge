package com.patternforge.dto;

import lombok.Data;
import java.time.Instant;

@Data
public class ProviderMetrics {
    private int successfulRequests = 0;
    private int failedRequests = 0;
    private long totalLatencyMs = 0;
    private int count429 = 0;
    private int countTimeout = 0;
    private Instant lastSuccessfulGeneration = null;

    public synchronized void recordSuccess(long latencyMs) {
        successfulRequests++;
        totalLatencyMs += latencyMs;
        lastSuccessfulGeneration = Instant.now();
    }

    public synchronized void recordFailure(boolean is429, boolean isTimeout) {
        failedRequests++;
        if (is429) count429++;
        if (isTimeout) countTimeout++;
    }

    public synchronized double getAverageLatencySeconds() {
        if (successfulRequests == 0) return 0.0;
        return (double) totalLatencyMs / successfulRequests / 1000.0;
    }
}
