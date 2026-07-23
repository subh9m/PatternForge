package com.patternforge.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "ai.gateway")
@Data
public class AIGatewayConfig {
    private String geminiApiKey;
    private String groqApiKey;
    private String githubModelsApiKey;
    private String openrouterApiKey;
}
