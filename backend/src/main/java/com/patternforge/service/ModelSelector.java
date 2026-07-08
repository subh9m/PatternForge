package com.patternforge.service;

import com.patternforge.config.GeminiConfig;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@Slf4j
public class ModelSelector {

    private final GeminiConfig geminiConfig;
    private final List<String> preferredModels = new ArrayList<>();

    public ModelSelector(GeminiConfig geminiConfig) {
        this.geminiConfig = geminiConfig;
        initializeModels();
    }

    private void initializeModels() {
        if (geminiConfig.getModels() != null && !geminiConfig.getModels().isEmpty()) {
            for (String model : geminiConfig.getModels()) {
                if (model != null && !model.trim().isEmpty()) {
                    preferredModels.add(model.trim());
                }
            }
        }

        if (preferredModels.isEmpty()) {
            // Default fallbacks
            preferredModels.add("gemini-2.5-flash");
            preferredModels.add("gemini-2.0-flash");
            preferredModels.add("gemini-1.5-flash");
        }

        log.info("ModelSelector: Initialized with preferred model order: {}", preferredModels);
    }

    public List<String> getPreferredModels() {
        return new ArrayList<>(preferredModels);
    }
}
