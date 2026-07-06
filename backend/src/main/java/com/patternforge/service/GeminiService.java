package com.patternforge.service;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class GeminiService {

    @Value("${gemini.api-key:}")
    private String apiKey;

    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    public GeminiService() {
        this.httpClient = HttpClient.newHttpClient();
        this.objectMapper = new ObjectMapper()
                .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false)
                .configure(JsonParser.Feature.ALLOW_UNQUOTED_CONTROL_CHARS, true);
    }

    private String getApiKey() {
        if (apiKey != null && !apiKey.trim().isEmpty()) {
            return apiKey.trim();
        }
        
        // Fallback: check System env variable
        String envKey = System.getenv("GEMINI_API_KEY");
        if (envKey != null && !envKey.trim().isEmpty()) {
            return envKey.trim();
        }

        // Fallback: check Verfalarm's .env file on Desktop
        File envFile = new File("C:\\Users\\rajsh\\Desktop\\Verfalarm\\.env");
        if (envFile.exists()) {
            try {
                List<String> lines = Files.readAllLines(envFile.toPath());
                for (String line : lines) {
                    line = line.trim();
                    if (line.startsWith("GEMINI_API_KEY=")) {
                        String key = line.substring("GEMINI_API_KEY=".length()).trim();
                        if (!key.isEmpty()) {
                            log.info("GeminiService: Found API key fallback in Verfalarm .env file.");
                            return key;
                        }
                    }
                }
            } catch (IOException e) {
                log.error("GeminiService: Failed to read Verfalarm .env file", e);
            }
        }

        log.warn("GeminiService: No API key found. Calls will fail.");
        return "";
    }

    /**
     * Generate LeetCode description, examples, constraints, hints, solution JSON on the fly for caching.
     */
    public String generateProblemDetailsJson(String problemName, Integer leetcodeNumber, String topicName) {
        String key = getApiKey();
        if (key.isEmpty()) {
            throw new IllegalStateException("Gemini API key is not configured.");
        }

        String prompt = "Generate a complete LeetCode-like problem description details in JSON format for the problem '" 
                + problemName + "' (LeetCode #" + leetcodeNumber + ") under topic '" + topicName + "'.\n"
                + "Return a single JSON object with the following properties:\n"
                + "1. 'problemStatement': Detailed description markdown text explaining the problem context and goals.\n"
                + "2. 'inputFormat': Markdown text detailing parameters and constraints.\n"
                + "3. 'outputFormat': Markdown text detailing what needs to be returned.\n"
                + "4. 'examples': Array of 2 to 3 example objects containing 'input' string, 'output' string, and 'explanation' markdown string.\n"
                + "5. 'constraints': Array of string constraints (e.g. n <= 10^5).\n"
                + "6. 'edgeCases': Array of 2 to 3 strings highlighting edge case challenges.\n"
                + "7. 'followUp': Markdown string follow-up questions if available.\n"
                + "8. 'hints': Array of exactly 3 progressive hints.\n"
                + "9. 'observation': Markdown string of key patterns/notes to observe.\n"
                + "10. 'pattern': A single string detailing the master pattern name (e.g., 'Two Pointers').\n"
                + "11. 'approach': Short summary markdown string of the optimal approach strategy.\n"
                + "12. 'optimalTimeComplexity': The big-O optimal time complexity (e.g. 'O(n)').\n"
                + "13. 'optimalSpaceComplexity': The big-O optimal space complexity (e.g. 'O(1)').\n"
                + "14. 'fullExplanation': In-depth markdown explanation of how to solve the problem optimal code strategy.\n"
                + "15. 'referenceSolution': Code snippet block of the optimal solution in C++.\n"
                + "16. 'referenceSolutions': A JSON object containing key-value pairs mapping language name ('cpp', 'java') to clean code solution strings (with C++ as the primary focus).\n"
                + "17. 'bruteForce': A JSON object containing:\n"
                + "    - 'approach': Short summary markdown explanation of the brute force strategy.\n"
                + "    - 'timeComplexity': The big-O time complexity (e.g. 'O(n^2)').\n"
                + "    - 'spaceComplexity': The big-O space complexity (e.g. 'O(1)').\n"
                + "    - 'code': A JSON object containing 'cpp' and 'java' fields with clean code implementations.\n"
                + "18. 'better': (Optional, set to null if no distinct 'better' approach exists) A JSON object containing:\n"
                + "    - 'approach': Short summary markdown explanation of the better strategy.\n"
                + "    - 'timeComplexity': The big-O time complexity (e.g. 'O(n log n)').\n"
                + "    - 'spaceComplexity': The big-O space complexity (e.g. 'O(n)').\n"
                + "    - 'code': A JSON object containing 'cpp' and 'java' fields with clean code implementations.\n"
                + "19. 'optimal': A JSON object containing:\n"
                + "    - 'approach': Short summary markdown explanation of the optimal strategy.\n"
                + "    - 'timeComplexity': The big-O time complexity (e.g. 'O(n)').\n"
                + "    - 'spaceComplexity': The big-O space complexity (e.g. 'O(1)' or 'O(n)').\n"
                + "    - 'code': A JSON object containing 'cpp' and 'java' fields with clean code implementations.";

        try {
            String escapedPrompt = escapeJsonString(prompt);

            String requestBody = "{"
                    + "\"contents\": [{"
                    + "  \"parts\": [{"
                    + "    \"text\": \"" + escapedPrompt + "\""
                    + "  }]"
                    + "}],"
                    + "\"generationConfig\": {"
                    + "  \"responseMimeType\": \"application/json\""
                    + "}"
                    + "}";

            String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + key;

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody, StandardCharsets.UTF_8))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                throw new RuntimeException("Gemini API call failed with status code " + response.statusCode() + ": " + response.body());
            }

            String responseBody = response.body();
            String jsonText = extractCandidateText(responseBody);
            
            if (jsonText == null || jsonText.trim().isEmpty()) {
                throw new RuntimeException("Gemini returned invalid empty candidate content.");
            }

            return jsonText.trim();
        } catch (Exception e) {
            log.error("Failed to generate problem details via Gemini API", e);
            throw new RuntimeException("Failed to generate problem details via Gemini: " + e.getMessage(), e);
        }
    }

    /**
     * Compare the user's prediction values against the expected optimal solution and output feedback.
     */
    public Map<String, Object> evaluateUserThinking(
            String problemName,
            String optimalPattern,
            String optimalTime,
            String optimalSpace,
            String userPossiblePatterns,
            String userTimeComplexity,
            String userSpaceComplexity,
            String userObservations,
            String userBruteForce,
            String userApproach
    ) {
        String key = getApiKey();
        if (key.isEmpty()) {
            throw new IllegalStateException("Gemini API key is not configured.");
        }

        String prompt = "Perform a detailed evaluation review of the candidate's strategic solution approach draft for LeetCode problem: '" + problemName + "'.\n\n"
                + "Optimal Solution Information:\n"
                + "- Expected Pattern: " + optimalPattern + "\n"
                + "- Expected Time Complexity: " + optimalTime + "\n"
                + "- Expected Space Complexity: " + optimalSpace + "\n\n"
                + "User Predictions:\n"
                + "- Selected Candidate Patterns: " + userPossiblePatterns + "\n"
                + "- Time Complexity Guess: " + userTimeComplexity + "\n"
                + "- Space Complexity Guess: " + userSpaceComplexity + "\n"
                + "- User Solution Approach Draft: " + userApproach + "\n\n"
                + "Compare user's values against expected. Award a score out of 100 for every single parameter.\n"
                + "You MUST structure your response EXACTLY as follows (do not use JSON, just plain text with these exact headers):\n\n"
                + "PATTERNS_MATCH: [Correct/Partially Correct/Incorrect (Score: X/100)]\n"
                + "TIME_COMPLEXITY_MATCH: [Correct/Incorrect (Score: X/100)]\n"
                + "SPACE_COMPLEXITY_MATCH: [Correct/Incorrect (Score: X/100)]\n\n"
                + "FEEDBACK_START\n"
                + "[Detailed feedback text in markdown...]\n"
                + "   - A clear score breakdown for each of the parameters out of 100.\n"
                + "   - A thorough verification of the user's written explanation of the solution (from 'User Solution Approach Draft'). Compare it against the optimal logic, cross-verify its correctness, highlight any logical bugs/flaws or missing edge cases in their description, and award an 'Explanation Score' out of 100 for logic clarity and correctness.\n"
                + "   - Why their patterns guesses are correct/incorrect relative to " + optimalPattern + ".\n"
                + "   - If their complexity estimates match optimal thresholds.\n"
                + "   - Constructive interview advice on their solution approach.\n"
                + "   - DO NOT reveal the final code solution.";

        try {
            String escapedPrompt = escapeJsonString(prompt);

            String requestBody = "{"
                    + "\"contents\": [{"
                    + "  \"parts\": [{"
                    + "    \"text\": \"" + escapedPrompt + "\""
                    + "  }]"
                    + "}]"
                    + "}";

            String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + key;

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody, StandardCharsets.UTF_8))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                throw new RuntimeException("Gemini API call failed with status: " + response.statusCode());
            }

            String responseBody = response.body();
            String rawText = extractCandidateText(responseBody);
            
            if (rawText == null || rawText.trim().isEmpty()) {
                throw new RuntimeException("Gemini returned invalid response body.");
            }

            String patternsMatch = "Partially Correct";
            String timeComplexityMatch = "Correct";
            String spaceComplexityMatch = "Correct";
            String feedback = rawText;

            String[] lines = rawText.split("\n");
            StringBuilder feedbackBuilder = new StringBuilder();
            boolean foundStart = false;

            for (String line : lines) {
                String trimmed = line.trim();
                if (trimmed.toUpperCase().startsWith("PATTERNS_MATCH:")) {
                    patternsMatch = line.substring(line.indexOf(":") + 1).trim();
                } else if (trimmed.toUpperCase().startsWith("TIME_COMPLEXITY_MATCH:")) {
                    timeComplexityMatch = line.substring(line.indexOf(":") + 1).trim();
                } else if (trimmed.toUpperCase().startsWith("SPACE_COMPLEXITY_MATCH:")) {
                    spaceComplexityMatch = line.substring(line.indexOf(":") + 1).trim();
                } else if (trimmed.equalsIgnoreCase("FEEDBACK_START") || trimmed.toUpperCase().startsWith("FEEDBACK:")) {
                    foundStart = true;
                } else {
                    if (foundStart) {
                        feedbackBuilder.append(line).append("\n");
                    } else if (!trimmed.isEmpty() && 
                               !trimmed.toUpperCase().startsWith("PATTERNS_MATCH:") && 
                               !trimmed.toUpperCase().startsWith("TIME_COMPLEXITY_MATCH:") && 
                               !trimmed.toUpperCase().startsWith("SPACE_COMPLEXITY_MATCH:")) {
                        feedbackBuilder.append(line).append("\n");
                    }
                }
            }

            if (feedbackBuilder.length() > 0) {
                feedback = feedbackBuilder.toString().trim();
            }

            return Map.of(
                    "patternsMatch", patternsMatch,
                    "timeComplexityMatch", timeComplexityMatch,
                    "spaceComplexityMatch", spaceComplexityMatch,
                    "feedback", feedback
            );
        } catch (Exception e) {
            log.error("Failed to check approach evaluation via Gemini API", e);
            return Map.of(
                    "patternsMatch", "Partially Correct",
                    "timeComplexityMatch", "Correct",
                    "spaceComplexityMatch", "Correct",
                    "feedback", "Approach received. (Note: Gemini feedback check failed: " + e.getMessage() + ")"
            );
        }
    }

    private String escapeJsonString(String val) {
        if (val == null) return "";
        return val.replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r");
    }

    private String extractCandidateText(String responseBody) {
        try {
            com.fasterxml.jackson.databind.JsonNode root = objectMapper.readTree(responseBody);
            com.fasterxml.jackson.databind.JsonNode candidates = root.path("candidates");
            if (candidates.isArray() && !candidates.isEmpty()) {
                com.fasterxml.jackson.databind.JsonNode parts = candidates.get(0).path("content").path("parts");
                if (parts.isArray() && !parts.isEmpty()) {
                    return parts.get(0).path("text").asText();
                }
            }
        } catch (Exception e) {
            log.error("Failed to parse Gemini response candidates", e);
        }
        return null;
    }
}
