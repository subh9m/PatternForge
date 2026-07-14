package com.patternforge.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.patternforge.dto.AudioJobProgress;
import com.patternforge.model.AudioLearningGuide;
import com.patternforge.model.Problem;
import com.patternforge.repository.AudioLearningGuideRepository;
import com.patternforge.repository.ProblemRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@Service
@Slf4j
public class AudioLearningGuideService {

    private final AudioLearningGuideRepository guideRepository;
    private final ProblemRepository problemRepository;
    private final GeminiService geminiService;
    private final RetryExecutor retryExecutor;

    private final ExecutorService executor = Executors.newFixedThreadPool(2);
    private static final Map<String, AudioJobProgress> activeAudioJobs = new ConcurrentHashMap<>();

    public AudioLearningGuideService(AudioLearningGuideRepository guideRepository,
                                     ProblemRepository problemRepository,
                                     GeminiService geminiService,
                                     RetryExecutor retryExecutor) {
        this.guideRepository = guideRepository;
        this.problemRepository = problemRepository;
        this.geminiService = geminiService;
        this.retryExecutor = retryExecutor;
    }

    public static void cleanRegistry() {
        long now = System.currentTimeMillis();
        activeAudioJobs.entrySet().removeIf(entry -> {
            AudioJobProgress p = entry.getValue();
            return ("COMPLETED".equals(p.getStatus()) || "FAILED".equals(p.getStatus()))
                    && (now - p.getEndTime() > 300000); // 5 minutes
        });
    }

    public List<AudioJobProgress> getActiveJobsList() {
        cleanRegistry();
        return new ArrayList<>(activeAudioJobs.values());
    }

    public AudioLearningGuide getGuide(UUID problemId, String language) {
        Optional<AudioLearningGuide> opt = guideRepository.findByProblemIdAndLanguage(problemId, language.toUpperCase());
        if (opt.isPresent()) {
            AudioLearningGuide guide = opt.get();
            // Migrate/interpret existing guides with script as READY
            if (guide.getSpokenScript() != null && !guide.getSpokenScript().trim().isEmpty()) {
                if (!"READY".equals(guide.getGenerationStatus())) {
                    log.info("AUDIO_GUIDE_MIGRATION: Existing guide has spokenScript but status is {}. Marking READY.", guide.getGenerationStatus());
                    guide.setGenerationStatus("READY");
                    guide.setErrorMessage(null);
                    guideRepository.save(guide);
                }
                log.info("AUDIO_GUIDE_CACHE_HIT: Returning stored script for problem {} ({})", problemId, language.toUpperCase());
            } else if ("READY".equals(guide.getGenerationStatus())) {
                log.warn("AUDIO_GUIDE_CORRUPTION: Guide is marked READY but spokenScript is empty. Resetting status to FAILED.");
                guide.setGenerationStatus("FAILED");
                guideRepository.save(guide);
            } else if ("GENERATING".equals(guide.getGenerationStatus())) {
                LocalDateTime cutoff = LocalDateTime.now().minusMinutes(2);
                LocalDateTime timeToCheck = guide.getUpdatedAt() != null ? guide.getUpdatedAt() : guide.getCreatedAt();
                if (timeToCheck != null && timeToCheck.isBefore(cutoff)) {
                    log.warn("AUDIO_GUIDE_TIMEOUT: Guide f287eb68 is stuck in GENERATING since {}. Resetting status to FAILED.", timeToCheck);
                    guide.setGenerationStatus("FAILED");
                    guide.setErrorMessage("Generation timed out.");
                    guideRepository.save(guide);
                }
            }
            return guide;
        }
        return null;
    }

    public AudioJobProgress getJobStatus(UUID problemId, String language) {
        return activeAudioJobs.get(getJobKey(problemId, language));
    }

    private String getJobKey(UUID problemId, String language) {
        return problemId.toString() + "_" + language.toUpperCase();
    }

    public synchronized AudioLearningGuide startGeneration(UUID problemId, String language) {
        String lang = language.toUpperCase();
        Optional<AudioLearningGuide> existingOpt = guideRepository.findByProblemIdAndLanguage(problemId, lang);
        
        if (existingOpt.isPresent()) {
            AudioLearningGuide guide = existingOpt.get();
            if (guide.getSpokenScript() != null && !guide.getSpokenScript().trim().isEmpty()) {
                if (!"READY".equals(guide.getGenerationStatus())) {
                    guide.setGenerationStatus("READY");
                    guide.setErrorMessage(null);
                    guideRepository.save(guide);
                }
                log.info("AUDIO_GUIDE_CACHE_HIT: Returning stored script for problem {} ({})", problemId, lang);
                return guide;
            }
            if ("GENERATING".equals(guide.getGenerationStatus())) {
                return guide;
            }
            
            guide.setGenerationStatus("GENERATING");
            guide.setErrorMessage(null);
            guideRepository.save(guide);
            
            triggerBackgroundJob(problemId, lang, guide);
            return guide;
        }

        // Fresh guide creation
        AudioLearningGuide guide = AudioLearningGuide.builder()
                .problemId(problemId)
                .language(lang)
                .generationStatus("GENERATING")
                .createdAt(LocalDateTime.now())
                .build();
        guideRepository.save(guide);

        triggerBackgroundJob(problemId, lang, guide);
        return guide;
    }

    private void triggerBackgroundJob(UUID problemId, String language, AudioLearningGuide guide) {
        String jobKey = getJobKey(problemId, language);
        Problem problem = problemRepository.findById(problemId).orElseThrow(() -> new IllegalArgumentException("Problem not found"));
        
        AudioJobProgress progress = AudioJobProgress.builder()
                .problemId(problemId)
                .problemName(problem.getName())
                .status("GENERATING")
                .startTime(System.currentTimeMillis())
                .jobType("HI".equalsIgnoreCase(language) ? "AUDIO_HI" : "AUDIO_EN")
                .build();
        activeAudioJobs.put(jobKey, progress);

        executor.submit(() -> {
            try {
                // Script generation with validation & retry
                ScriptGenerationResult result = generateSpokenScript(problem, language);
                if (!validateGeneratedScript(result.getSpokenScript(), problem.getDifficulty())) {
                    log.warn("AUDIO_SCRIPT_VALIDATION: First attempt failed validation. Retrying once...");
                    result = generateSpokenScript(problem, language);
                    if (!validateGeneratedScript(result.getSpokenScript(), problem.getDifficulty())) {
                        throw new IllegalStateException("Generated script failed validation checks twice. Aborting.");
                    }
                }
                
                guide.setSpokenScript(result.getSpokenScript());
                guide.setEstimatedDurationSeconds(result.getEstimatedDurationSeconds());
                guide.setGenerationModel(result.getGenerationModel());
                guide.setGenerationStatus("READY");
                guide.setErrorMessage(null);
                guide.setUpdatedAt(LocalDateTime.now());
                guideRepository.save(guide);
                
                log.info("AUDIO_SCRIPT_GENERATION: Script generated successfully");
                log.info("AUDIO_SCRIPT_GENERATION: Guide stored and marked READY");

                progress.setStatus("COMPLETED");
                progress.setEndTime(System.currentTimeMillis());
            } catch (Exception e) {
                log.error("Audio guide script generation failed for problem: {}, lang: {}", problemId, language, e);
                guide.setGenerationStatus("FAILED");
                guide.setErrorMessage(e.getMessage());
                guide.setUpdatedAt(LocalDateTime.now());
                guideRepository.save(guide);

                progress.setStatus("FAILED");
                progress.setEndTime(System.currentTimeMillis());
            }
        });
    }

    public synchronized AudioLearningGuide regenerateGuide(UUID problemId, String language) {
        String lang = language.toUpperCase();
        Problem problem = problemRepository.findById(problemId).orElseThrow(() -> new IllegalArgumentException("Problem not found"));
        
        Optional<AudioLearningGuide> existingOpt = guideRepository.findByProblemIdAndLanguage(problemId, lang);
        AudioLearningGuide guide;
        if (existingOpt.isPresent()) {
            guide = existingOpt.get();
        } else {
            guide = AudioLearningGuide.builder()
                    .problemId(problemId)
                    .language(lang)
                    .createdAt(LocalDateTime.now())
                    .build();
        }
        
        // Mark GENERATING but do NOT clear spokenScript immediately
        guide.setGenerationStatus("GENERATING");
        guide.setErrorMessage(null);
        guideRepository.save(guide);
        
        triggerBackgroundJobForRegeneration(problemId, lang, guide);
        return guide;
    }

    private void triggerBackgroundJobForRegeneration(UUID problemId, String language, AudioLearningGuide guide) {
        String jobKey = getJobKey(problemId, language);
        Problem problem = problemRepository.findById(problemId).orElseThrow(() -> new IllegalArgumentException("Problem not found"));
        
        final String oldScript = guide.getSpokenScript();
        final Integer oldDuration = guide.getEstimatedDurationSeconds();
        
        AudioJobProgress progress = AudioJobProgress.builder()
                .problemId(problemId)
                .problemName(problem.getName())
                .status("GENERATING")
                .startTime(System.currentTimeMillis())
                .jobType("HI".equalsIgnoreCase(language) ? "AUDIO_HI" : "AUDIO_EN")
                .build();
        activeAudioJobs.put(jobKey, progress);

        executor.submit(() -> {
            try {
                // Generate and validate
                ScriptGenerationResult result = generateSpokenScript(problem, language);
                if (!validateGeneratedScript(result.getSpokenScript(), problem.getDifficulty())) {
                    log.warn("AUDIO_SCRIPT_VALIDATION: First attempt failed. Retrying...");
                    result = generateSpokenScript(problem, language);
                    if (!validateGeneratedScript(result.getSpokenScript(), problem.getDifficulty())) {
                        throw new IllegalStateException("Script failed validation twice.");
                    }
                }
                
                guide.setSpokenScript(result.getSpokenScript());
                guide.setEstimatedDurationSeconds(result.getEstimatedDurationSeconds());
                guide.setGenerationModel(result.getGenerationModel());
                guide.setGenerationStatus("READY");
                guide.setErrorMessage(null);
                guide.setUpdatedAt(LocalDateTime.now());
                guideRepository.save(guide);
                
                log.info("AUDIO_SCRIPT_GENERATION: Script regenerated successfully");
                progress.setStatus("COMPLETED");
                progress.setEndTime(System.currentTimeMillis());
            } catch (Exception e) {
                log.error("Audio guide script regeneration failed. Rolling back to old script.", e);
                // Rollback
                guide.setSpokenScript(oldScript);
                guide.setEstimatedDurationSeconds(oldDuration);
                guide.setGenerationStatus(oldScript != null ? "READY" : "FAILED");
                guide.setErrorMessage(e.getMessage());
                guide.setUpdatedAt(LocalDateTime.now());
                guideRepository.save(guide);

                progress.setStatus("FAILED");
                progress.setEndTime(System.currentTimeMillis());
            }
        });
    }

    private boolean validateGeneratedScript(String spokenScript, String difficulty) {
        if (spokenScript == null || spokenScript.trim().isEmpty()) {
            return false;
        }
        String trimmed = spokenScript.trim();
        if (trimmed.startsWith("{") && trimmed.endsWith("}")) return false;
        if (trimmed.contains("```json") || trimmed.contains("```")) return false;
        
        // Reject verbatim full reference code copies
        if (trimmed.contains("class Solution") || trimmed.contains("public static void main") || trimmed.contains("public static")) {
            return false;
        }
        
        int length = trimmed.length();
        if ("EASY".equalsIgnoreCase(difficulty)) {
            if (length < 300) return false;
        } else if ("MEDIUM".equalsIgnoreCase(difficulty)) {
            if (length < 600) return false;
        } else {
            if (length < 900) return false;
        }
        return true;
    }

    @lombok.Getter
    @lombok.AllArgsConstructor
    public static class ScriptGenerationResult {
        private final String spokenScript;
        private final int estimatedDurationSeconds;
        private final String generationModel;
    }

    private ScriptGenerationResult generateSpokenScript(Problem problem, String language) throws Exception {
        String problemName = problem.getName();
        String topicName = problem.getTopic() != null ? problem.getTopic().getName() : "DSA";
        
        String pattern = "N/A";
        String optimalTime = "N/A";
        String optimalSpace = "N/A";
        String fullExplanation = "";
        String observation = "";
        String optimalApproach = "";
        String bruteForceApproach = "";
        String betterApproach = "";
        String referenceSolution = "";
        
        if (problem.getSolutionDetailsJson() != null && !problem.getSolutionDetailsJson().trim().isEmpty()) {
            try {
                ObjectMapper mapper = new ObjectMapper();
                JsonNode solutionNode = mapper.readTree(problem.getSolutionDetailsJson());
                pattern = solutionNode.path("pattern").asText("N/A");
                optimalTime = solutionNode.path("optimalTimeComplexity").asText("N/A");
                optimalSpace = solutionNode.path("optimalSpaceComplexity").asText("N/A");
                fullExplanation = solutionNode.path("fullExplanation").asText("");
                observation = solutionNode.path("observation").asText("");
                optimalApproach = solutionNode.path("approach").asText("");
                
                // Extract optimal reference code solution
                JsonNode refSolNode = solutionNode.path("referenceSolution");
                if (refSolNode.isTextual() && !refSolNode.asText().isEmpty()) {
                    referenceSolution = refSolNode.asText();
                } else {
                    JsonNode refSolsNode = solutionNode.path("referenceSolutions");
                    if (refSolsNode.isObject() && !refSolsNode.isEmpty()) {
                        Iterator<Map.Entry<String, JsonNode>> fields = refSolsNode.fields();
                        if (fields.hasNext()) {
                            Map.Entry<String, JsonNode> field = fields.next();
                            referenceSolution = "Language: " + field.getKey() + "\nCode:\n" + field.getValue().asText();
                        }
                    }
                }

                // Brute force
                JsonNode bruteNode = solutionNode.path("bruteForce");
                if (bruteNode.isObject() && !bruteNode.isEmpty()) {
                    bruteForceApproach = bruteNode.path("approach").asText("");
                }

                // Better
                JsonNode betterNode = solutionNode.path("better");
                if (betterNode.isObject() && !betterNode.isEmpty()) {
                    betterApproach = betterNode.path("approach").asText("");
                }
            } catch (Exception e) {
                log.warn("Failed to parse solutionDetailsJson for problem: {}", problem.getId(), e);
            }
        }
        
        String simplifiedStatement = problem.getSimplifiedStatement() != null ? problem.getSimplifiedStatement() : "";
        String simplifiedApproach = problem.getSimplifiedApproach() != null ? problem.getSimplifiedApproach() : "";
        
        // Format reference solution context for Gemini to force mental model matching
        String codeContext = (referenceSolution != null && !referenceSolution.trim().isEmpty()) 
                ? "\n- OPTIMAL CODE FOR REFERENCE:\n" + referenceSolution + "\n"
                : "";

        String prompt;
        if ("HI".equalsIgnoreCase(language)) {
            prompt = "You are a friendly, expert software engineer and DSA mentor. Your task is to write a SPOKEN explanation script for the problem '" + problemName + "'.\n"
                    + "The listener has the problem details but wants a quick, casual, high-intuition audio walkthrough instead of reading the full statement.\n\n"
                    + "Here is the existing stored problem data:\n"
                    + "- Topic: " + topicName + "\n"
                    + "- Pattern: " + pattern + "\n"
                    + "- Optimal Time Complexity: " + optimalTime + "\n"
                    + "- Optimal Space Complexity: " + optimalSpace + "\n"
                    + "- Simplified Statement: " + simplifiedStatement + "\n"
                    + "- Intuition/Observation: " + observation + "\n"
                    + "- Optimal Approach: " + optimalApproach + "\n"
                    + (bruteForceApproach.isEmpty() ? "" : "- Brute Force Approach: " + bruteForceApproach + "\n")
                    + (betterApproach.isEmpty() ? "" : "- Better Approach: " + betterApproach + "\n")
                    + "- Full Explanation: " + fullExplanation + "\n"
                    + codeContext + "\n"
                    + "CRITICAL REQUIREMENT FOR MATCHING CODE:\n"
                    + "Your verbal code walkthrough MUST EXACTLY match the implementation steps and variable names used in the 'OPTIMAL CODE FOR REFERENCE' block above. E.g., if the code uses left/right pointers, talk about left/right pointers. If it uses a priority_queue, talk about a priority_queue.\n\n"
                    + "LANGUAGE REQUIREMENT:\n"
                    + "- Natural conversational Hinglish as spoken in regular conversation. Do NOT use formal Hindi (avoid words like 'tatva', 'nirikshan', 'shreni').\n"
                    + "- Use standard English terms for technical jargon: array, string, index, pointer, loop, recursion, stack, queue, heap, hash map, binary search, sliding window, prefix sum, dynamic programming, DFS, BFS, node, edge, time complexity, space complexity.\n"
                    + "- Keep the script friendly, casual, and high-intuition, like a senior teaching a junior.\n\n"
                    + "STRUCTURE THE SPOKEN SCRIPT INTO THESE PARTS (Do not write headings, let it flow naturally):\n"
                    + "1. PROBLEM IN PLAIN LANGUAGE (First 20-30s): Explain what the problem wants in very simple terms. Use a tiny conceptual example if needed.\n"
                    + "2. CORE OBSERVATION/INTUITION: Explain WHY we choose the optimal pattern (e.g. why binary search or DP appears, not just that we use it).\n"
                    + "3. APPROACH: Explain the optimal algorithm in execution/iteration order so the listener can mentally simulate it.\n"
                    + "4. CODE MENTAL MODEL: Explain the code skeleton, critical variables, loops, conditions, and return value so they can start coding immediately.\n"
                    + "5. COMPLEXITY: Briefly state time and space complexity with a quick reason.\n\n"
                    + "SCRIPT QUALITY RULES:\n"
                    + "- NEVER read the entire problem statement, example list, constraints, or code line-by-line.\n"
                    + "- Do NOT use filler words like 'Let's dive deep', 'Let's explore', 'Certainly', 'Of course', 'In conclusion', or other artificial AI transitions.\n"
                    + "- Keep sentences short and clear.\n"
                    + "- Target script length: approximately 1.5-2.5 minutes for EASY problems, 2.5-4 minutes for MEDIUM, and 4-6 minutes for HARD.\n\n"
                    + "Return EXACTLY a JSON object with this format:\n"
                    + "{\n"
                    + "  \"spokenScript\": \"Your conversational Hinglish script here\",\n"
                    + "  \"estimatedDurationSeconds\": 150\n"
                    + "}";
        } else {
            prompt = "You are a friendly, expert software engineer and DSA mentor. Your task is to write a SPOKEN explanation script for the problem '" + problemName + "'.\n"
                    + "The listener has the problem details but wants a quick, casual, high-intuition audio walkthrough instead of reading the full statement.\n\n"
                    + "Here is the existing stored problem data:\n"
                    + "- Topic: " + topicName + "\n"
                    + "- Pattern: " + pattern + "\n"
                    + "- Optimal Time Complexity: " + optimalTime + "\n"
                    + "- Optimal Space Complexity: " + optimalSpace + "\n"
                    + "- Simplified Statement: " + simplifiedStatement + "\n"
                    + "- Intuition/Observation: " + observation + "\n"
                    + "- Optimal Approach: " + optimalApproach + "\n"
                    + (bruteForceApproach.isEmpty() ? "" : "- Brute Force Approach: " + bruteForceApproach + "\n")
                    + (betterApproach.isEmpty() ? "" : "- Better Approach: " + betterApproach + "\n")
                    + "- Full Explanation: " + fullExplanation + "\n"
                    + codeContext + "\n"
                    + "CRITICAL REQUIREMENT FOR MATCHING CODE:\n"
                    + "Your verbal code walkthrough MUST EXACTLY match the implementation steps and variable names used in the 'OPTIMAL CODE FOR REFERENCE' block above. E.g., if the code uses left/right pointers, talk about left/right pointers. If it uses a priority_queue, talk about a priority_queue.\n\n"
                    + "LANGUAGE REQUIREMENT:\n"
                    + "- Conversational, friendly English. Keep the script casual and high-intuition, like a senior teaching a junior.\n"
                    + "- Avoid dry, formal, or overly academic/textbook language.\n\n"
                    + "STRUCTURE THE SPOKEN SCRIPT INTO THESE PARTS (Do not write headings, let it flow naturally):\n"
                    + "1. PROBLEM IN PLAIN LANGUAGE (First 20-30s): Explain what the problem wants in very simple terms. Use a tiny conceptual example if needed.\n"
                    + "2. CORE OBSERVATION/INTUITION: Explain WHY we choose the optimal pattern (e.g. why binary search or DP appears, not just that we use it).\n"
                    + "3. APPROACH: Explain the optimal algorithm in execution/iteration order so the listener can mentally simulate it.\n"
                    + "4. CODE MENTAL MODEL: Explain the code skeleton, critical variables, loops, conditions, and return value so they can start coding immediately.\n"
                    + "5. COMPLEXITY: Briefly state time and space complexity with a quick reason.\n\n"
                    + "SCRIPT QUALITY RULES:\n"
                    + "- NEVER read the entire problem statement, example list, constraints, or code line-by-line.\n"
                    + "- Do NOT use filler words like 'Let's dive deep', 'Let's explore', 'Certainly', 'Of course', 'In conclusion', or other artificial AI transitions.\n"
                    + "- Keep sentences short and clear.\n"
                    + "- Target script length: approximately 1.5-2.5 minutes for EASY problems, 2.5-4 minutes for MEDIUM, and 4-6 minutes for HARD.\n\n"
                    + "Return EXACTLY a JSON object with this format:\n"
                    + "{\n"
                    + "  \"spokenScript\": \"Your conversational English script here\",\n"
                    + "  \"estimatedDurationSeconds\": 150\n"
                    + "}";
        }
        
        log.info("AUDIO_SCRIPT_GENERATION: Requesting script generation for problem {} ({})", problem.getId(), language);
        RetryExecutor.ExecutionResult execResult = retryExecutor.executeWithFallbackDetailed(prompt, "application/json");
        String rawJson = execResult.responseBody;
        String candidateText = geminiService.extractCandidateText(rawJson);
        String cleanJson = GeminiService.cleanJsonString(candidateText != null ? candidateText : rawJson);
        
        ObjectMapper mapper = new ObjectMapper();
        JsonNode root = mapper.readTree(cleanJson);
        
        String spokenScript = root.path("spokenScript").asText();
        int estimatedDurationSeconds = root.path("estimatedDurationSeconds").asInt(0);
        if (estimatedDurationSeconds <= 0) {
            estimatedDurationSeconds = Math.max(30, (int) Math.round(spokenScript.length() * 0.12));
        }
        
        return new ScriptGenerationResult(spokenScript, estimatedDurationSeconds, execResult.modelName);
    }
}
