package com.patternforge.service.provider;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.patternforge.config.AIGatewayConfig;
import com.patternforge.dto.AIRequest;
import com.patternforge.dto.AIResponse;
import com.patternforge.exception.AIProviderException;
import com.patternforge.service.AIProvider;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class OpenRouterProvider implements AIProvider {

    private final AIGatewayConfig gatewayConfig;
    private final HttpClient httpClient;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public OpenRouterProvider(AIGatewayConfig gatewayConfig) {
        this.gatewayConfig = gatewayConfig;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(15))
                .build();
    }

    @Override
    public String providerName() {
        return "OpenRouter";
    }

    @Override
    public boolean isConfigured() {
        String key = getApiKey();
        return key != null && !key.trim().isEmpty();
    }

    private String getApiKey() {
        String key = gatewayConfig.getOpenrouterApiKey();
        if (key == null || key.trim().isEmpty()) {
            key = System.getenv("OPENROUTER_API_KEY");
        }
        return key;
    }

    @Override
    public AIResponse generate(AIRequest request) throws Exception {
        String apiKey = getApiKey();
        if (apiKey == null || apiKey.trim().isEmpty()) {
            throw new AIProviderException(providerName(), -1, "OpenRouter API Key is not configured.", false);
        }

        String model = "google/gemini-2.5-flash";
        String url = "https://openrouter.ai/api/v1/chat/completions";

        Map<String, Object> message = Map.of("role", "user", "content", request.getPrompt());
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", model);
        requestBody.put("messages", List.of(message));
        requestBody.put("temperature", request.getTemperature() != null ? request.getTemperature() : 0.2);

        if (request.getMaxTokens() != null) {
            requestBody.put("max_tokens", request.getMaxTokens());
        }

        if ("application/json".equalsIgnoreCase(request.getResponseMimeType())) {
            requestBody.put("response_format", Map.of("type", "json_object"));
        }

        String jsonBody = objectMapper.writeValueAsString(requestBody);

        HttpRequest httpRequest = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + apiKey)
                .header("HTTP-Referer", "http://localhost:8081")
                .header("X-Title", "PatternForge")
                .POST(HttpRequest.BodyPublishers.ofString(jsonBody, StandardCharsets.UTF_8))
                .timeout(Duration.ofSeconds(60))
                .build();

        long startTime = System.currentTimeMillis();
        HttpResponse<String> httpResponse = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofString());
        long latencyMs = System.currentTimeMillis() - startTime;

        int statusCode = httpResponse.statusCode();
        if (statusCode != 200) {
            boolean retryable = (statusCode == 429 || statusCode == 408 || statusCode >= 500);
            throw new AIProviderException(providerName(), statusCode, "OpenRouter API error. Status: " + statusCode + ", Body: " + httpResponse.body(), retryable);
        }

        // Parse response
        String contentText = extractText(httpResponse.body());

        return AIResponse.builder()
                .content(contentText)
                .providerName(providerName())
                .modelName(model)
                .latencyMs(latencyMs)
                .build();
    }

    private String extractText(String responseBody) {
        try {
            JsonNode root = objectMapper.readTree(responseBody);
            JsonNode choices = root.path("choices");
            if (choices.isArray() && !choices.isEmpty()) {
                JsonNode message = choices.get(0).path("message");
                if (!message.isMissingNode() && message.has("content")) {
                    return message.path("content").asText();
                }
            }
        } catch (Exception e) {
            log.error("Failed to parse OpenRouter response", e);
        }
        return responseBody;
    }

    @Override
    public boolean isRetryable(Exception e) {
        if (e instanceof AIProviderException) {
            return ((AIProviderException) e).isRetryable();
        }
        return e instanceof java.io.IOException || 
               e instanceof java.lang.InterruptedException || 
               e instanceof java.util.concurrent.TimeoutException ||
               e.getCause() instanceof java.io.IOException;
    }
}
