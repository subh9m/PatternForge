package com.patternforge.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "ai.gateway")
@Data
public class AIGatewayConfig {
    private String geminiApiKey;
    private String geminiModel = "gemini-2.5-flash";

    private String groqApiKey;
    private String groqModel = "llama-3.3-70b-versatile";

    private String githubModelsApiKey;
    private String githubModelsModel = "gpt-4o-mini";

    private String openrouterApiKey;
    private String openrouterModel = "google/gemini-2.5-flash";
}
