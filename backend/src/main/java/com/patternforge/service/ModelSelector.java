package com.patternforge.service;

import com.patternforge.config.GeminiConfig;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Service
@Slf4j
public class ModelSelector {

    private final GeminiConfig geminiConfig;
    private final List<String> preferredModels = new ArrayList<>();
    private final Set<String> unsupportedModels = ConcurrentHashMap.newKeySet();

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
            preferredModels.add("gemini-2.5-flash");
            preferredModels.add("gemini-2.0-flash");
            preferredModels.add("gemini-1.5-flash");
        }

        log.info("ModelSelector: Initialized with preferred model order: {}", preferredModels);
    }

    public List<String> getPreferredModels() {
        List<String> active = new ArrayList<>();
        for (String m : preferredModels) {
            if (!unsupportedModels.contains(m)) {
                active.add(m);
            }
        }
        return active;
    }

    public void markUnsupported(String model) {
        if (model != null && !model.trim().isEmpty()) {
            unsupportedModels.add(model.trim());
            log.warn("ModelSelector: Model '{}' marked UNSUPPORTED and blacklisted from pool.", model);
        }
    }

    public int getLoadedModelsCount() {
        return preferredModels.size();
    }

    public int getSupportedModelsCount() {
        return getPreferredModels().size();
    }
}
