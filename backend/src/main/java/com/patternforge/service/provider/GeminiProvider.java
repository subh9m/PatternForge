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
public class GeminiProvider implements AIProvider {

    private final AIGatewayConfig gatewayConfig;
    private final HttpClient httpClient;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public GeminiProvider(AIGatewayConfig gatewayConfig) {
        this.gatewayConfig = gatewayConfig;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(15))
                .build();
    }

    @Override
    public String providerName() {
        return "Gemini";
    }

    @Override
    public boolean isConfigured() {
        String key = getApiKey();
        return key != null && !key.trim().isEmpty();
    }

    private String getApiKey() {
        String key = gatewayConfig.getGeminiApiKey();
        if (key == null || key.trim().isEmpty()) {
            key = System.getenv("GEMINI_API_KEY");
        }
        return key;
    }

    @Override
    public AIResponse generate(AIRequest request) throws Exception {
        String apiKey = getApiKey();
        if (apiKey == null || apiKey.trim().isEmpty()) {
            throw new AIProviderException(providerName(), -1, "Gemini API Key is not configured.", false);
        }

        String model = gatewayConfig.getGeminiModel();
        if (model == null || model.trim().isEmpty()) {
            model = "gemini-2.5-flash";
        }
        
        String url = "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent?key=" + apiKey;

        Map<String, Object> part = Map.of("text", request.getPrompt());
        Map<String, Object> contentObj = Map.of("parts", List.of(part));
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("contents", List.of(contentObj));

        Map<String, Object> generationConfig = new HashMap<>();
        if ("application/json".equalsIgnoreCase(request.getResponseMimeType())) {
            generationConfig.put("responseMimeType", "application/json");
        }
        if (request.getMaxTokens() != null) {
            generationConfig.put("maxOutputTokens", request.getMaxTokens());
        }
        if (!generationConfig.isEmpty()) {
            requestBody.put("generationConfig", generationConfig);
        }

        String jsonBody = objectMapper.writeValueAsString(requestBody);

        HttpRequest httpRequest = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(jsonBody, StandardCharsets.UTF_8))
                .timeout(Duration.ofSeconds(60))
                .build();

        long startTime = System.currentTimeMillis();
        HttpResponse<String> httpResponse = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofString());
        long latencyMs = System.currentTimeMillis() - startTime;

        int statusCode = httpResponse.statusCode();
        if (statusCode != 200) {
            boolean retryable = (statusCode == 429 || statusCode == 408 || statusCode >= 500) && (statusCode != 404);
            throw new AIProviderException(providerName(), statusCode, "Gemini API error. Status: " + statusCode + ", Body: " + httpResponse.body(), retryable);
        }

        // Parse Response
        String responseBody = httpResponse.body();
        String contentText = extractText(responseBody);
        
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
            JsonNode candidates = root.path("candidates");
            if (candidates.isArray() && !candidates.isEmpty()) {
                JsonNode parts = candidates.get(0).path("content").path("parts");
                if (parts.isArray() && !parts.isEmpty()) {
                    return parts.get(0).path("text").asText();
                }
            }
        } catch (Exception e) {
            log.error("Failed to parse Gemini response candidates", e);
        }
        return responseBody; // Return raw as fallback
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
