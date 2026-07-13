package com.patternforge.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.patternforge.dto.AudioJobProgress;
import com.patternforge.model.AudioContent;
import com.patternforge.model.AudioLearningGuide;
import com.patternforge.model.Problem;
import com.patternforge.repository.AudioContentRepository;
import com.patternforge.repository.AudioLearningGuideRepository;
import com.patternforge.repository.ProblemRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@Service
@Slf4j
public class AudioLearningGuideService {

    private final AudioLearningGuideRepository guideRepository;
    private final AudioContentRepository contentRepository;
    private final ProblemRepository problemRepository;
    private final GeminiService geminiService;
    private final RetryExecutor retryExecutor;

    private final ExecutorService executor = Executors.newFixedThreadPool(2);
    private static final Map<String, AudioJobProgress> activeAudioJobs = new ConcurrentHashMap<>();
    private final HttpClient httpClient;

    public AudioLearningGuideService(AudioLearningGuideRepository guideRepository,
                                     AudioContentRepository contentRepository,
                                     ProblemRepository problemRepository,
                                     GeminiService geminiService,
                                     RetryExecutor retryExecutor) {
        this.guideRepository = guideRepository;
        this.contentRepository = contentRepository;
        this.problemRepository = problemRepository;
        this.geminiService = geminiService;
        this.retryExecutor = retryExecutor;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(15))
                .build();
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
        return guideRepository.findByProblemIdAndLanguage(problemId, language).orElse(null);
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
            if ("READY".equals(guide.getGenerationStatus()) || "GENERATING".equals(guide.getGenerationStatus())) {
                return guide;
            }
            // If failed but script exists, we retry TTS only
            if ("FAILED".equals(guide.getGenerationStatus())) {
                guide.setGenerationStatus("GENERATING");
                guide.setErrorMessage(null);
                guideRepository.save(guide);
                
                triggerBackgroundJob(problemId, lang, guide);
                return guide;
            }
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
                // Step 1: Script generation if missing
                if (guide.getScript() == null || guide.getScript().trim().isEmpty()) {
                    String script = generateSpokenScript(problem, language);
                    guide.setScript(script);
                    guideRepository.save(guide);
                }

                // Step 2: TTS generation
                log.info("AUDIO_TTS_GENERATION: Starting audio synthesis for guide: {}", guide.getId());
                byte[] audioBytes = generateSpeech(guide.getScript(), "HI".equalsIgnoreCase(language) ? "hi" : "en");
                
                // Calculate estimated duration
                int duration = Math.max(30, (int) Math.round(guide.getScript().length() * 0.12)); // fallback heuristic
                guide.setDurationSeconds(duration);

                // Step 3: Save audio content binary
                contentRepository.deleteByGuideId(guide.getId()); // clean old failures if any
                AudioContent content = AudioContent.builder()
                        .guideId(guide.getId())
                        .data(audioBytes)
                        .build();
                contentRepository.save(content);

                // Step 4: Finalize guide details
                guide.setAudioUrl("/api/problems/audio-guides/stream/" + guide.getId());
                guide.setVoiceProvider("Google");
                guide.setVoiceModel("Translate TTS");
                guide.setVoiceId(language.toLowerCase() + "-female");
                guide.setGenerationStatus("READY");
                guideRepository.save(guide);

                progress.setStatus("COMPLETED");
                progress.setEndTime(System.currentTimeMillis());
                log.info("AUDIO_TTS_GENERATION: Finished successfully for guide: {}", guide.getId());
            } catch (Exception e) {
                log.error("Audio guide generation failed for problem: {}, lang: {}", problemId, language, e);
                guide.setGenerationStatus("FAILED");
                guide.setErrorMessage(e.getMessage());
                guideRepository.save(guide);

                progress.setStatus("FAILED");
                progress.setEndTime(System.currentTimeMillis());
            }
        });
    }

    private String generateSpokenScript(Problem problem, String language) throws Exception {
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
        String rawJson = retryExecutor.executeWithFallback(prompt, "application/json");
        String cleanJson = GeminiService.cleanJsonString(rawJson);
        
        ObjectMapper mapper = new ObjectMapper();
        JsonNode root = mapper.readTree(cleanJson);
        return root.path("spokenScript").asText();
    }

    private byte[] generateSpeech(String text, String lang) throws IOException {
        List<String> chunks = splitTextIntoChunks(text, 200);
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();

        for (String chunk : chunks) {
            String encodedChunk = URLEncoder.encode(chunk, StandardCharsets.UTF_8);
            String url = "https://translate.google.com/translate_tts?ie=UTF-8&tl=" + lang + "&client=tw-ob&q=" + encodedChunk;

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64)")
                    .GET()
                    .build();

            try {
                HttpResponse<byte[]> response = httpClient.send(request, HttpResponse.BodyHandlers.ofByteArray());
                if (response.statusCode() == 200) {
                    outputStream.write(response.body());
                } else {
                    throw new IOException("Failed to generate speech chunk, HTTP status: " + response.statusCode());
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                throw new IOException("Speech generation interrupted", e);
            }
        }
        return outputStream.toByteArray();
    }

    public static List<String> splitTextIntoChunks(String text, int maxLength) {
        List<String> chunks = new ArrayList<>();
        if (text == null || text.trim().isEmpty()) {
            return chunks;
        }

        String[] sentences = text.split("(?<=[.!?।])\\s+");
        StringBuilder currentChunk = new StringBuilder();

        for (String sentence : sentences) {
            sentence = sentence.trim();
            if (sentence.isEmpty()) continue;

            if (currentChunk.length() + sentence.length() + 1 <= maxLength) {
                if (currentChunk.length() > 0) {
                    currentChunk.append(" ");
                }
                currentChunk.append(sentence);
            } else {
                if (currentChunk.length() > 0) {
                    chunks.add(currentChunk.toString());
                    currentChunk = new StringBuilder();
                }

                if (sentence.length() > maxLength) {
                    String[] words = sentence.split("\\s+");
                    for (String word : words) {
                        if (currentChunk.length() + word.length() + 1 <= maxLength) {
                            if (currentChunk.length() > 0) {
                                currentChunk.append(" ");
                            }
                            currentChunk.append(word);
                        } else {
                            if (currentChunk.length() > 0) {
                                chunks.add(currentChunk.toString());
                                currentChunk = new StringBuilder();
                            }
                            if (word.length() > maxLength) {
                                int index = 0;
                                while (index < word.length()) {
                                    int end = Math.min(index + maxLength, word.length());
                                    chunks.add(word.substring(index, end));
                                    index = end;
                                }
                            } else {
                                currentChunk.append(word);
                            }
                        }
                    }
                } else {
                    currentChunk.append(sentence);
                }
            }
        }

        if (currentChunk.length() > 0) {
            chunks.add(currentChunk.toString());
        }

        return chunks;
    }
}
