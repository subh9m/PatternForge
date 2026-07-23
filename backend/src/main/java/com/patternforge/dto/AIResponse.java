package com.patternforge.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AIResponse {
    private String content;
    private String providerName;
    private String modelName;
    private long latencyMs;
}
