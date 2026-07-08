package com.patternforge.controller;

import com.patternforge.service.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.net.http.HttpResponse;
import java.util.*;

@RestController
@RequestMapping("/admin/ai")
public class AdminAIController {

    private final APIKeyManager apiKeyManager;
    private final ModelSelector modelSelector;
    private final GeminiClient geminiClient;
    private final ProblemGenerationService problemGenerationService;

    public AdminAIController(APIKeyManager apiKeyManager,
                              ModelSelector modelSelector,
                              GeminiClient geminiClient,
                              ProblemGenerationService problemGenerationService) {
        this.apiKeyManager = apiKeyManager;
        this.modelSelector = modelSelector;
        this.geminiClient = geminiClient;
        this.problemGenerationService = problemGenerationService;
    }

    @GetMapping("/status")
    public ResponseEntity<?> getAIStatus() {
        Map<String, Object> status = apiKeyManager.getStatusMap(
                problemGenerationService.getQueueSize(),
                problemGenerationService.getRunningJobsCount(),
                modelSelector.getLoadedModelsCount(),
                modelSelector.getSupportedModelsCount()
        );
        return ResponseEntity.ok(status);
    }

    @GetMapping("/test")
    public ResponseEntity<?> testAIKeys() {
        List<String> allKeys = apiKeyManager.getAllKeysRaw();
        List<String> preferredModels = modelSelector.getPreferredModels();
        
        Map<String, Map<String, String>> results = new LinkedHashMap<>();

        for (String key : allKeys) {
            String masked = apiKeyManager.maskKey(key);
            Map<String, String> modelMap = new LinkedHashMap<>();

            for (String model : preferredModels) {
                if (apiKeyManager.getKeyState(key) == APIKeyManager.KeyState.COOLDOWN) {
                    modelMap.put(model, "cooldown");
                    continue;
                }
                
                try {
                    HttpResponse<String> response = geminiClient.executeRequest(key, model, "Hello", "text/plain");
                    int code = response.statusCode();
                    if (code == 200) {
                        modelMap.put(model, "working");
                    } else if (code == 401 || code == 403) {
                        modelMap.put(model, "invalid key");
                    } else if (code == 429) {
                        modelMap.put(model, "quota exceeded");
                    } else if (code == 404) {
                        modelMap.put(model, "model unavailable");
                    } else {
                        modelMap.put(model, "network failure");
                    }
                } catch (Exception e) {
                    modelMap.put(model, "network failure");
                }
            }
            results.put(masked, modelMap);
        }

        return ResponseEntity.ok(results);
    }
}
