package com.patternforge.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;

@Service
@Slf4j
public class GeminiClient {

    private final HttpClient httpClient;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public GeminiClient() {
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(15))
                .build();
    }

    public HttpResponse<String> executeRequest(String key, String model, String textPrompt, String responseMimeType) throws IOException, InterruptedException {
        String escapedPrompt = escapeJsonString(textPrompt);

        StringBuilder requestBodyBuilder = new StringBuilder();
        requestBodyBuilder.append("{")
                .append("\"contents\": [{")
                .append("  \"parts\": [{")
                .append("    \"text\": \"").append(escapedPrompt).append("\"")
                .append("  }]")
                .append("}]");

        if ("application/json".equalsIgnoreCase(responseMimeType)) {
            requestBodyBuilder.append(",")
                    .append("\"generationConfig\": {")
                    .append("  \"responseMimeType\": \"application/json\"")
                    .append("}");
        }

        requestBodyBuilder.append("}");

        String url = "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent?key=" + key;

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(requestBodyBuilder.toString(), StandardCharsets.UTF_8))
                .timeout(Duration.ofSeconds(60))
                .build();

        return httpClient.send(request, HttpResponse.BodyHandlers.ofString());
    }

    private String escapeJsonString(String raw) {
        if (raw == null) return "";
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < raw.length(); i++) {
            char ch = raw.charAt(i);
            switch (ch) {
                case '\\': sb.append("\\\\"); break;
                case '"': sb.append("\\\""); break;
                case '\b': sb.append("\\b"); break;
                case '\f': sb.append("\\f"); break;
                case '\n': sb.append("\\n"); break;
                case '\r': sb.append("\\r"); break;
                case '\t': sb.append("\\t"); break;
                default:
                    if (ch < ' ') {
                        String hex = "000" + Integer.toHexString(ch);
                        sb.append("\\u").append(hex.substring(hex.length() - 4));
                    } else {
                        sb.append(ch);
                    }
                    break;
            }
        }
        return sb.toString();
    }

    /**
     * Extracts retry delay in seconds if 429 occurs. Returns default (e.g. 60) if not found.
     *
     * Two distinct 429 causes:
     * 1. QuotaFailure  — daily/per-project quota exhausted. Needs a LONG cooldown (~24h).
     *    Retrying in 30s is wrong; it just hammers the same exhausted key in a tight loop.
     * 2. RetryInfo     — short per-minute rate-limit. The API supplies the actual retry delay.
     */
    public int parseRetryDelay(String responseBody) {
        try {
            JsonNode root = objectMapper.readTree(responseBody);
            JsonNode errorNode = root.path("error");
            if (!errorNode.isMissingNode()) {
                JsonNode detailsNode = errorNode.path("details");
                if (detailsNode.isArray()) {
                    // First pass: look for RetryInfo
                    for (JsonNode detail : detailsNode) {
                        String type = detail.path("@type").asText("");

                        if (type.contains("RetryInfo")) {
                            // Short rate-limit (RPM). Use the supplied delay.
                            String delayStr = detail.path("retryDelay").asText("");
                            if (!delayStr.isEmpty() && delayStr.endsWith("s")) {
                                int delaySec = (int) Math.ceil(
                                        Double.parseDouble(delayStr.substring(0, delayStr.length() - 1)));
                                log.warn("GeminiClient: 429 RetryInfo detected — RPM rate-limit. Retry after {}s.", delaySec);
                                return Math.max(delaySec, 10); // at least 10s
                            }
                            log.warn("GeminiClient: 429 RetryInfo detected but no retryDelay field — defaulting to 60s.");
                            return 60;
                        }
                    }

                    // Second pass: look for QuotaFailure
                    for (JsonNode detail : detailsNode) {
                        String type = detail.path("@type").asText("");

                        if (type.contains("QuotaFailure")) {
                            boolean isDaily = false;
                            JsonNode violations = detail.path("violations");
                            if (violations.isArray()) {
                                for (JsonNode violation : violations) {
                                    String desc = violation.path("description").asText("").toLowerCase();
                                    String subject = violation.path("subject").asText("").toLowerCase();
                                    if (desc.contains("daily") || desc.contains("day") || desc.contains("per_day") ||
                                        subject.contains("daily") || subject.contains("day") || subject.contains("per_day")) {
                                        // Guard against it being a minute limit that happens to contain "day" or similar incorrectly
                                        if (!desc.contains("minute") && !subject.contains("minute") &&
                                            !desc.contains("rpm") && !subject.contains("rpm")) {
                                            isDaily = true;
                                        }
                                    }
                                }
                            }
                            // Also check top-level error message
                            String topMsg = errorNode.path("message").asText("").toLowerCase();
                            if (topMsg.contains("daily") || topMsg.contains("day") || topMsg.contains("per_day")) {
                                if (!topMsg.contains("minute") && !topMsg.contains("rpm")) {
                                    isDaily = true;
                                }
                            }

                            if (isDaily) {
                                log.warn("GeminiClient: 429 QuotaFailure detected — daily/long-term quota exhausted. Cooling down for 24h.");
                                return 86400; // 24 hours
                            } else {
                                log.warn("GeminiClient: 429 QuotaFailure detected but classified as transient/minute rate limit. Cooling down for 60s.");
                                return 60; // 60 seconds
                            }
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.warn("GeminiClient: Failed to parse retry delay from error payload.", e);
        }
        // Unknown 429 — treat as a short rate-limit, back off 60s
        log.warn("GeminiClient: 429 received but could not classify — defaulting to 60s cooldown.");
        return 60;
    }
}
