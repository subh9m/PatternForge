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
                // Script generation
                ScriptGenerationResult result = generateSpokenScript(problem, language);
                
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
        
        if (problem.getSolutionDetailsJson() != null && !problem.getSolutionDetailsJson().trim().isEmpty()) {
            try {
                ObjectMapper mapper = new ObjectMapper();
                JsonNode solutionNode = mapper.readTree(problem.getSolutionDetailsJson());
                pattern = solutionNode.path("pattern").asText("N/A");
                optimalTime = solutionNode.path("optimalTimeComplexity").asText("N/A");
                optimalSpace = solutionNode.path("optimalSpaceComplexity").asText("N/A");
                fullExplanation = solutionNode.path("fullExplanation").asText("");
                observation = solutionNode.path("observation").asText("");
            } catch (Exception e) {
                log.warn("Failed to parse solutionDetailsJson for problem: {}", problem.getId(), e);
            }
        }
        
        String simplifiedStatement = problem.getSimplifiedStatement() != null ? problem.getSimplifiedStatement() : "";
        String simplifiedApproach = problem.getSimplifiedApproach() != null ? problem.getSimplifiedApproach() : "";
        
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
                    + "- Simplified Approach: " + simplifiedApproach + "\n"
                    + "- Full Explanation: " + fullExplanation + "\n\n"
                    + "Language requirement: Casual conversational Hinglish (Hindi + English mix). Use English for all technical programming terminology like 'array', 'pointer', 'binary search', 'index', 'loop', 'left', 'right', 'mid', 'time complexity', etc. Do not translate them into formal Hindi (e.g. do NOT use words like 'suchak' or 'pratham'). Talk like a mentor explaining to a student naturally.\n\n"
                    + "Structure the script naturally WITHOUT reading section headings (e.g. do not say 'Section A' or 'Approach'). Let the conversation flow organically through:\n"
                    + "1. What is the problem actually asking (very simple terms).\n"
                    + "2. The key intuition/observation.\n"
                    + "3. The optimal algorithm step-by-step.\n"
                    + "4. How to translate this into code (variables to track, loop conditions).\n\n"
                    + "Keep it concise (aim for a duration between 2 to 4 minutes). Avoid reading full code or constraints.\n\n"
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
                    + "- Simplified Approach: " + simplifiedApproach + "\n"
                    + "- Full Explanation: " + fullExplanation + "\n\n"
                    + "Language requirement: Simple, conversational, friendly English. Avoid academic, overly formal, or dry textbook explanations.\n\n"
                    + "Structure the script naturally WITHOUT reading section headings. Let the conversation flow organically through:\n"
                    + "1. What is the problem actually asking (very simple terms).\n"
                    + "2. The key intuition/observation.\n"
                    + "3. The optimal algorithm step-by-step.\n"
                    + "4. How to translate this into code (variables to track, loop conditions).\n\n"
                    + "Keep it concise (aim for a duration between 2 to 4 minutes). Avoid reading full code or constraints.\n\n"
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
