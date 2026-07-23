package com.patternforge.service;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.patternforge.dto.AIRequest;
import com.patternforge.dto.AIResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@Slf4j
public class GeminiService {

    private final AIGateway aiGateway;
    private final ObjectMapper objectMapper;

    public GeminiService(AIGateway aiGateway) {
        this.aiGateway = aiGateway;
        this.objectMapper = new ObjectMapper()
                .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false)
                .configure(JsonParser.Feature.ALLOW_UNQUOTED_CONTROL_CHARS, true);
    }

    public static String cleanJsonString(String rawJson) {
        if (rawJson == null) return "";
        String trimmed = rawJson.trim();
        if (trimmed.startsWith("```")) {
            int firstNewline = trimmed.indexOf("\n");
            if (firstNewline != -1) {
                trimmed = trimmed.substring(firstNewline + 1);
            } else {
                trimmed = trimmed.substring(3);
            }
            if (trimmed.endsWith("```")) {
                trimmed = trimmed.substring(0, trimmed.length() - 3);
            }
            trimmed = trimmed.trim();
        }
        return trimmed;
    }

    public AIResponse generateAllProblemDetailsJson(String problemName, Integer leetcodeNumber, String topicName) {
        String prompt = "Generate comprehensive LeetCode-like problem description details, optimal solution details, and simplified daily revision contents in a single structured JSON object for the problem '" 
                + problemName + "' (LeetCode #" + leetcodeNumber + ") under topic '" + topicName + "'.\n\n"
                + "Return EXACTLY a single JSON object with the following properties:\n"
                + "{\n"
                + "  \"basicDetails\": {\n"
                + "    \"problemStatement\": \"Detailed description markdown text explaining the problem context and goals.\",\n"
                + "    \"inputFormat\": \"Markdown text detailing parameters and constraints.\",\n"
                + "    \"outputFormat\": \"Markdown text detailing what needs to be returned.\",\n"
                + "    \"examples\": [\n"
                + "      {\n"
                + "        \"input\": \"string representing input parameters\",\n"
                + "        \"output\": \"string representing expected output\",\n"
                + "        \"explanation\": \"markdown string explaining the example\"\n"
                + "      }\n"
                + "    ],\n"
                + "    \"constraints\": [\"string constraints, e.g. n <= 10^5\"],\n"
                + "    \"edgeCases\": [\"2 to 3 string edge cases\"],\n"
                + "    \"followUp\": \"markdown string follow-up questions if available\",\n"
                + "    \"hints\": [\"exactly 3 progressive hint strings\"]\n"
                + "  },\n"
                + "  \"solutionDetails\": {\n"
                + "    \"observation\": \"markdown string of key patterns/notes to observe\",\n"
                + "    \"pattern\": \"the master algorithmic pattern name (e.g. 'Two Pointers')\",\n"
                + "    \"approach\": \"short summary markdown string of the optimal approach strategy\",\n"
                + "    \"optimalTimeComplexity\": \"optimal time complexity, e.g. 'O(n)'\",\n"
                + "    \"optimalSpaceComplexity\": \"optimal space complexity, e.g. 'O(1)'\",\n"
                + "    \"fullExplanation\": \"in-depth markdown explanation of optimal code strategy\",\n"
                + "    \"referenceSolution\": \"C++ optimal code snippet\",\n"
                + "    \"referenceSolutions\": {\n"
                + "      \"cpp\": \"clean C++ code\",\n"
                + "      \"java\": \"clean Java code\"\n"
                + "    },\n"
                + "    \"bruteForce\": {\n"
                + "      \"approach\": \"summary markdown\",\n"
                + "      \"timeComplexity\": \"complexity string\",\n"
                + "      \"spaceComplexity\": \"complexity string\",\n"
                + "      \"code\": {\n"
                + "        \"cpp\": \"C++ code\",\n"
                + "        \"java\": \"Java code\"\n"
                + "      }\n"
                + "    },\n"
                + "    \"better\": {\n"
                + "      \"approach\": \"summary markdown (or null if not distinct)\",\n"
                + "      \"timeComplexity\": \"complexity string\",\n"
                + "      \"spaceComplexity\": \"complexity string\",\n"
                + "      \"code\": {\n"
                + "        \"cpp\": \"C++ code\",\n"
                + "        \"java\": \"Java code\"\n"
                + "      }\n"
                + "    },\n"
                + "    \"optimal\": {\n"
                + "      \"approach\": \"summary markdown\",\n"
                + "      \"timeComplexity\": \"complexity string\",\n"
                + "      \"spaceComplexity\": \"complexity string\",\n"
                + "      \"code\": {\n"
                + "        \"cpp\": \"C++ code\",\n"
                + "        \"java\": \"Java code\"\n"
                + "      }\n"
                + "    }\n"
                + "  },\n"
                + "  \"revisionDetails\": {\n"
                + "    \"simplifiedStatement\": \"A very brief and simple description of the problem statement (2-3 lines in simple, plain, easy-to-understand words, focusing only on the core goal).\",\n"
                + "    \"simplifiedOptimal\": \"A very brief explanation of the optimal strategy/approach in simple, plain words (2-3 lines explaining the core pattern or intuition).\",\n"
                + "    \"simplifiedBetter\": \"A very brief explanation of the better/improved strategy/approach if it exists in the details (else empty/null).\",\n"
                + "    \"simplifiedBrute\": \"A very brief explanation of the brute force strategy/approach if it exists in the details (else empty/null).\"\n"
                + "  }\n"
                + "}";

        try {
            AIRequest aiRequest = AIRequest.builder()
                    .prompt(prompt)
                    .responseMimeType("application/json")
                    .build();
            AIResponse aiResponse = aiGateway.generate(aiRequest);
            aiResponse.setContent(cleanJsonString(aiResponse.getContent()));
            return aiResponse;
        } catch (Exception e) {
            log.error("Failed to generate unified problem details via AI Gateway", e);
            throw new RuntimeException("Failed to generate unified problem details: " + e.getMessage(), e);
        }
    }

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
        String prompt = "Perform a detailed evaluation review of the candidate's strategic solution approach draft for LeetCode problem: '" + problemName + "'.\n\n"
                + "Optimal Solution Information:\n"
                + "- Expected Pattern: " + optimalPattern + "\n"
                + "- Expected Time Complexity: " + optimalTime + "\n"
                + "- Expected Space Complexity: " + optimalSpace + "\n\n"
                + "User Predictions:\n"
                + "- Selected Candidate Patterns: " + userPossiblePatterns + "\n"
                + "- Time Complexity Guess: " + userTimeComplexity + "\n"
                + "- Space Complexity Guess: " + userSpaceComplexity + "\n"
                + "- User Solution Approach Draft (Written Explanation): " + userApproach + "\n\n"
                + "Compare user's values against expected. Award a score out of 100 for every single parameter.\n"
                + "You MUST structure your response EXACTLY as follows (do not use JSON, just plain text with these exact headers):\n\n"
                + "PATTERNS_MATCH: [Correct/Partially Correct/Incorrect (Score: X/100)]\n"
                + "TIME_COMPLEXITY_MATCH: [Correct/Incorrect (Score: X/100)]\n"
                + "SPACE_COMPLEXITY_MATCH: [Correct/Incorrect (Score: X/100)]\n"
                + "EXPLANATION_SCORE: [Score: X/100]\n\n"
                + "FEEDBACK_START\n"
                + "[Detailed feedback text in markdown...]\n"
                + "   - A clear score breakdown for each of the parameters out of 100.\n"
                + "   - A thorough verification of the user's written explanation of the solution (from 'User Solution Approach Draft'). Compare it against the optimal logic, cross-verify its correctness, highlight any logical bugs/flaws or missing edge cases in their description, and explain the 'Explanation Score' out of 100 for logic clarity and correctness.\n"
                + "   - Why their patterns guesses are correct/incorrect relative to " + optimalPattern + ".\n"
                + "   - If their complexity estimates match optimal thresholds.\n"
                + "   - Constructive interview advice on their solution approach.\n"
                + "   - DO NOT reveal the final code solution.";

        try {
            AIRequest aiRequest = AIRequest.builder()
                    .prompt(prompt)
                    .responseMimeType("text/plain")
                    .build();
            AIResponse aiResponse = aiGateway.generate(aiRequest);
            String extractedText = aiResponse.getContent();

            String patternsMatch = "Partially Correct";
            String timeComplexityMatch = "Correct";
            String spaceComplexityMatch = "Correct";
            String explanationScore = "N/A";
            String feedback = extractedText;

            String[] lines = extractedText.split("\n");
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
                } else if (trimmed.toUpperCase().startsWith("EXPLANATION_SCORE:")) {
                    explanationScore = line.substring(line.indexOf(":") + 1).trim();
                } else if (trimmed.equalsIgnoreCase("FEEDBACK_START") || trimmed.toUpperCase().startsWith("FEEDBACK:")) {
                    foundStart = true;
                } else {
                    if (foundStart) {
                        feedbackBuilder.append(line).append("\n");
                    } else if (!trimmed.isEmpty() && 
                               !trimmed.toUpperCase().startsWith("PATTERNS_MATCH:") && 
                               !trimmed.toUpperCase().startsWith("TIME_COMPLEXITY_MATCH:") && 
                               !trimmed.toUpperCase().startsWith("SPACE_COMPLEXITY_MATCH:") &&
                               !trimmed.toUpperCase().startsWith("EXPLANATION_SCORE:")) {
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
                    "explanationScore", explanationScore,
                    "feedback", feedback
            );
        } catch (Exception e) {
            log.error("Failed to check approach evaluation via AI Gateway", e);
            return Map.of(
                    "patternsMatch", "Partially Correct",
                    "timeComplexityMatch", "Correct",
                    "spaceComplexityMatch", "Correct",
                    "explanationScore", "N/A",
                    "feedback", "Approach received. (Note: AI Gateway feedback check failed: " + e.getMessage() + ")"
            );
        }
    }
}
