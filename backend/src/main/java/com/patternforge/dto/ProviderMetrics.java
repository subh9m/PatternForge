package com.patternforge.dto;

import lombok.Data;
import java.time.Instant;

@Data
public class ProviderMetrics {
    
    public enum HealthState {
        HEALTHY,
        DEGRADED,
        UNAVAILABLE,
        UNKNOWN
    }

    public enum CircuitState {
        CLOSED,
        OPEN,
        HALF_OPEN
    }

    // Health and Circuit breaker variables
    private HealthState healthState = HealthState.UNKNOWN;
    private CircuitState circuitState = CircuitState.CLOSED;
    private int healthScore = 10; // Capped between 0 and 10. Start with 10 (initially UNKNOWN state).
    private long lastFailureTime = 0;
    private boolean manuallyDisabled = false;
    private long cooldownDurationMs = 5 * 60 * 1000; // 5 minutes default cooldown for OPEN circuit

    // Error monitoring
    private String lastErrorMessage = "";

    // Counter statistics
    private int totalRequests = 0;
    private int successfulRequests = 0;
    private int failedRequests = 0;
    private int count429 = 0;
    private int countTimeout = 0;
    private int permanentFailureCount = 0;
    
    // Latencies
    private long totalLatencyMs = 0;
    private long fastestLatencyMs = Long.MAX_VALUE;
    private long slowestLatencyMs = 0;

    // Timestamps
    private Instant lastSuccessfulGeneration = null;
    private Instant lastFailureTimeInstant = null;

    public synchronized void recordSuccess(long latencyMs) {
        totalRequests++;
        successfulRequests++;
        totalLatencyMs += latencyMs;
        lastSuccessfulGeneration = Instant.now();

        if (latencyMs < fastestLatencyMs) fastestLatencyMs = latencyMs;
        if (latencyMs > slowestLatencyMs) slowestLatencyMs = latencyMs;

        // Smart health scoring: Success +1 (max 10)
        if (healthScore < 10) {
            healthScore++;
        }

        // Recover circuit
        if (circuitState == CircuitState.HALF_OPEN) {
            circuitState = CircuitState.CLOSED;
            healthScore = 10; // Reset score fully on successful test call
            healthState = HealthState.HEALTHY;
        } else if (healthState == HealthState.UNKNOWN) {
            healthState = HealthState.HEALTHY;
        } else if (healthScore > 5) {
            healthState = HealthState.HEALTHY;
        }
    }

    public synchronized void recordFailure(boolean isPermanent, boolean is429, boolean isTimeout, String errorMsg) {
        totalRequests++;
        failedRequests++;
        lastFailureTimeInstant = Instant.now();
        lastFailureTime = System.currentTimeMillis();
        lastErrorMessage = errorMsg != null ? errorMsg : "";

        if (is429) count429++;
        if (isTimeout) countTimeout++;
        if (isPermanent) permanentFailureCount++;

        // Smart health scoring: Temp -2, Permanent -5
        if (isPermanent) {
            healthScore = Math.max(0, healthScore - 5);
        } else {
            healthScore = Math.max(0, healthScore - 2);
        }

        // State machine transitions
        if (healthScore <= 0) {
            circuitState = CircuitState.OPEN;
            healthState = HealthState.UNAVAILABLE;
        } else {
            healthState = HealthState.DEGRADED;
            if (circuitState == CircuitState.HALF_OPEN) {
                // If it fails again during half-open, open the circuit immediately
                circuitState = CircuitState.OPEN;
                healthState = HealthState.UNAVAILABLE;
            }
        }
    }

    public synchronized boolean checkCircuitState() {
        if (manuallyDisabled) {
            return false; // Skip if manually disabled from the admin page
        }
        if (circuitState == CircuitState.OPEN) {
            long elapsed = System.currentTimeMillis() - lastFailureTime;
            if (elapsed >= cooldownDurationMs) {
                circuitState = CircuitState.HALF_OPEN;
                return true; // Transition to HALF-OPEN: allow one test request
            }
            return false; // Circuit is OPEN and cooldown has not expired: skip provider
        }
        return true; // CLOSED or HALF_OPEN: allow requests
    }

    public synchronized void restore() {
        healthScore = 10;
        healthState = HealthState.HEALTHY;
        circuitState = CircuitState.CLOSED;
        lastFailureTime = 0;
        lastErrorMessage = "";
    }

    public synchronized double getAverageLatencySeconds() {
        if (successfulRequests == 0) return 0.0;
        return (double) totalLatencyMs / successfulRequests / 1000.0;
    }

    public synchronized double getFastestLatencySeconds() {
        return fastestLatencyMs == Long.MAX_VALUE ? 0.0 : (double) fastestLatencyMs / 1000.0;
    }

    public synchronized double getSlowestLatencySeconds() {
        return (double) slowestLatencyMs / 1000.0;
    }
}
