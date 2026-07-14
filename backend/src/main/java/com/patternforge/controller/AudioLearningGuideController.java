package com.patternforge.controller;

import com.patternforge.model.AudioLearningGuide;
import com.patternforge.service.AudioLearningGuideService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/problems")
public class AudioLearningGuideController {

    private final AudioLearningGuideService audioService;

    public AudioLearningGuideController(AudioLearningGuideService audioService) {
        this.audioService = audioService;
    }

    @GetMapping("/{problemId}/audio-guides")
    public ResponseEntity<?> getAudioGuides(@PathVariable UUID problemId) {
        List<AudioLearningGuide> guides = new ArrayList<>();
        AudioLearningGuide hi = audioService.getGuide(problemId, "HI");
        AudioLearningGuide en = audioService.getGuide(problemId, "EN");
        if (hi != null) guides.add(hi);
        if (en != null) guides.add(en);
        return ResponseEntity.ok(guides);
    }

    @PostMapping("/{problemId}/audio-guides/generate")
    public ResponseEntity<?> generateAudioGuide(@PathVariable UUID problemId, @RequestBody Map<String, String> requestBody) {
        String language = requestBody.get("language");
        if (language == null || (!"HI".equalsIgnoreCase(language) && !"EN".equalsIgnoreCase(language))) {
            return ResponseEntity.badRequest().body(Map.of("error", "Language must be either 'HI' or 'EN'"));
        }
        AudioLearningGuide guide = audioService.startGeneration(problemId, language);
        return ResponseEntity.ok(guide);
    }

    @GetMapping("/{problemId}/audio-guides/{language}/status")
    public ResponseEntity<?> getStatus(@PathVariable UUID problemId, @PathVariable String language) {
        if (!"HI".equalsIgnoreCase(language) && !"EN".equalsIgnoreCase(language)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Language must be 'HI' or 'EN'"));
        }
        AudioLearningGuide guide = audioService.getGuide(problemId, language);
        if (guide == null) {
            return ResponseEntity.ok(Map.of("generationStatus", "NOT_GENERATED"));
        }
        return ResponseEntity.ok(guide);
    }
}
