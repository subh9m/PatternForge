package com.patternforge.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "ai_request_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AIRequestLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private Instant timestamp;

    @Column(name = "problem_id")
    private String problemId;

    @Column(name = "problem_name")
    private String problemName;

    @Column(name = "provider_name", nullable = false)
    private String providerName;

    @Column(name = "model_name")
    private String modelName;

    @Column(name = "latency_ms")
    private Long latencyMs;

    @Column(name = "http_status")
    private Integer httpStatus;

    @Column(name = "input_tokens")
    private Integer inputTokens;

    @Column(name = "output_tokens")
    private Integer outputTokens;

    @Column(name = "estimated_cost")
    private Double estimatedCost;

    @Column(name = "cache_hit")
    private Boolean cacheHit;

    @Column(name = "generation_type")
    private String generationType;

    @Column(nullable = false)
    private Boolean success;

    @Column(name = "error_message", length = 4000)
    private String errorMessage;

    @Column(name = "response_body", length = 10000)
    private String responseBody;

    @Column(name = "provider_switched")
    private Boolean providerSwitched;

    @Column(name = "retry_count")
    private Integer retryCount;
}
