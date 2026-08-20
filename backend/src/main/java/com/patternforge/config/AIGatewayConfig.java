package com.patternforge.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "ai.gateway")
@Data
public class AIGatewayConfig {
    private String geminiApiKey;
    private String geminiModel = "gemini-3.6-flash";

    private String groqApiKey;
    private String groqModel = "openai/gpt-oss-120b";

    private String githubModelsApiKey;
    private String githubModelsModel = "gpt-4o-mini";

    private String openrouterApiKey;
    private String openrouterModel = "google/gemini-3.6-flash";
}
