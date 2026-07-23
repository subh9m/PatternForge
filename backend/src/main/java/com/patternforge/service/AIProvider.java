package com.patternforge.service;

import com.patternforge.dto.AIRequest;
import com.patternforge.dto.AIResponse;

public interface AIProvider {
    AIResponse generate(AIRequest request) throws Exception;
    String providerName();
    boolean isRetryable(Exception e);
    boolean isConfigured();
}
