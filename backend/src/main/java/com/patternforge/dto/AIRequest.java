package com.patternforge.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AIRequest {
    private String prompt;
    private String responseMimeType; // "application/json" or "text/plain"
    private Double temperature;
    private Integer maxTokens;
    private String expectedJsonSchema;
    private String language;
    private String difficulty;
    private String problemId;
    private String problemTitle;
    private String generationType;
    private Integer queueSize;
}
