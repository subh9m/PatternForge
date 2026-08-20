package com.patternforge;

import com.patternforge.dto.AIRequest;
import com.patternforge.dto.AIResponse;
import com.patternforge.exception.AIProviderException;
import com.patternforge.service.AIGateway;
import com.patternforge.service.AIProvider;
import com.patternforge.service.AIMonitoringService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

public class AIGatewayFallbackTest {

    private AIProvider geminiProvider;
    private AIProvider groqProvider;
    private AIProvider githubProvider;
    private AIProvider openrouterProvider;
    private AIMonitoringService aiMonitoringService;

    private AIGateway aiGateway;

    @BeforeEach
    public void setUp() {
        geminiProvider = mock(AIProvider.class);
        groqProvider = mock(AIProvider.class);
        githubProvider = mock(AIProvider.class);
        openrouterProvider = mock(AIProvider.class);
        aiMonitoringService = mock(AIMonitoringService.class);

        when(geminiProvider.providerName()).thenReturn("Gemini");
        when(groqProvider.providerName()).thenReturn("Groq");
        when(githubProvider.providerName()).thenReturn("GitHub");
        when(openrouterProvider.providerName()).thenReturn("OpenRouter");

        when(geminiProvider.isConfigured()).thenReturn(true);
        when(groqProvider.isConfigured()).thenReturn(true);
        when(githubProvider.isConfigured()).thenReturn(true);
        when(openrouterProvider.isConfigured()).thenReturn(true);

        // Simple default retryability checks matching the provider implementation logic
        lenient().when(geminiProvider.isRetryable(any(Exception.class))).thenAnswer(invocation -> {
            Exception e = invocation.getArgument(0);
            if (e instanceof AIProviderException) return ((AIProviderException) e).isRetryable();
            return true;
        });
        lenient().when(groqProvider.isRetryable(any(Exception.class))).thenAnswer(invocation -> {
            Exception e = invocation.getArgument(0);
            if (e instanceof AIProviderException) return ((AIProviderException) e).isRetryable();
            return true;
        });
        lenient().when(githubProvider.isRetryable(any(Exception.class))).thenAnswer(invocation -> {
            Exception e = invocation.getArgument(0);
            if (e instanceof AIProviderException) return ((AIProviderException) e).isRetryable();
            return true;
        });
        lenient().when(openrouterProvider.isRetryable(any(Exception.class))).thenAnswer(invocation -> {
            Exception e = invocation.getArgument(0);
            if (e instanceof AIProviderException) return ((AIProviderException) e).isRetryable();
            return true;
        });

        // Initialize AIGateway with the mocked list
        aiGateway = new AIGateway(List.of(geminiProvider, groqProvider, githubProvider, openrouterProvider), aiMonitoringService);
    }

    @Test
    public void testGeminiSuccess() throws Exception {
        AIRequest request = AIRequest.builder().prompt("Hello").build();
        AIResponse mockResponse = AIResponse.builder()
                .content("Gemini content")
                .providerName("Gemini")
                .modelName("gemini-3.6-flash")
                .latencyMs(120)
                .build();

        when(geminiProvider.generate(any(AIRequest.class))).thenReturn(mockResponse);

        AIResponse actualResponse = aiGateway.generate(request);

        assertNotNull(actualResponse);
        assertEquals("Gemini content", actualResponse.getContent());
        assertEquals("Gemini", actualResponse.getProviderName());
        
        verify(geminiProvider, times(1)).generate(any(AIRequest.class));
        verify(groqProvider, never()).generate(any(AIRequest.class));
    }

    @Test
    public void testFallbackToGroqOnGeminiFailure() throws Exception {
        AIRequest request = AIRequest.builder().prompt("Hello").build();
        
        // Mock Gemini failing with a retryable 429 error
        Exception retryableEx = new AIProviderException("Gemini", 429, "Rate limit exceeded", true);
        when(geminiProvider.generate(any(AIRequest.class))).thenThrow(retryableEx);

        AIResponse mockGroqResponse = AIResponse.builder()
                .content("Groq content")
                .providerName("Groq")
                .modelName("openai/gpt-oss-120b")
                .latencyMs(150)
                .build();
        when(groqProvider.generate(any(AIRequest.class))).thenReturn(mockGroqResponse);

        AIResponse actualResponse = aiGateway.generate(request);

        assertNotNull(actualResponse);
        assertEquals("Groq content", actualResponse.getContent());
        assertEquals("Groq", actualResponse.getProviderName());

        verify(geminiProvider, times(1)).generate(any(AIRequest.class));
        verify(groqProvider, times(1)).generate(any(AIRequest.class));
        verify(githubProvider, never()).generate(any(AIRequest.class));
    }

    @Test
    public void testFallbackToGithubOnGeminiAndGroqFailure() throws Exception {
        AIRequest request = AIRequest.builder().prompt("Hello").build();

        when(geminiProvider.generate(any(AIRequest.class))).thenThrow(new AIProviderException("Gemini", 429, "Rate limit exceeded", true));
        when(groqProvider.generate(any(AIRequest.class))).thenThrow(new AIProviderException("Groq", 503, "Service Unavailable", true));

        AIResponse mockGithubResponse = AIResponse.builder()
                .content("GitHub content")
                .providerName("GitHub")
                .modelName("gpt-4o-mini")
                .latencyMs(200)
                .build();
        when(githubProvider.generate(any(AIRequest.class))).thenReturn(mockGithubResponse);

        AIResponse actualResponse = aiGateway.generate(request);

        assertNotNull(actualResponse);
        assertEquals("GitHub content", actualResponse.getContent());
        assertEquals("GitHub", actualResponse.getProviderName());

        verify(geminiProvider, times(1)).generate(any(AIRequest.class));
        verify(groqProvider, times(1)).generate(any(AIRequest.class));
        verify(githubProvider, times(1)).generate(any(AIRequest.class));
        verify(openrouterProvider, never()).generate(any(AIRequest.class));
    }

    @Test
    public void testFallbackToOpenRouterOnThreeFailures() throws Exception {
        AIRequest request = AIRequest.builder().prompt("Hello").build();

        when(geminiProvider.generate(any(AIRequest.class))).thenThrow(new AIProviderException("Gemini", 429, "Rate limit", true));
        when(groqProvider.generate(any(AIRequest.class))).thenThrow(new AIProviderException("Groq", 503, "Unavailable", true));
        when(githubProvider.generate(any(AIRequest.class))).thenThrow(new AIProviderException("GitHub", 408, "Timeout", true));

        AIResponse mockOpenRouterResponse = AIResponse.builder()
                .content("OpenRouter content")
                .providerName("OpenRouter")
                .modelName("google/gemini-3.6-flash")
                .latencyMs(300)
                .build();
        when(openrouterProvider.generate(any(AIRequest.class))).thenReturn(mockOpenRouterResponse);

        AIResponse actualResponse = aiGateway.generate(request);

        assertNotNull(actualResponse);
        assertEquals("OpenRouter content", actualResponse.getContent());
        assertEquals("OpenRouter", actualResponse.getProviderName());

        verify(geminiProvider, times(1)).generate(any(AIRequest.class));
        verify(groqProvider, times(1)).generate(any(AIRequest.class));
        verify(githubProvider, times(1)).generate(any(AIRequest.class));
        verify(openrouterProvider, times(1)).generate(any(AIRequest.class));
    }

    @Test
    public void testAllFailuresThrowsException() throws Exception {
        AIRequest request = AIRequest.builder().prompt("Hello").build();

        when(geminiProvider.generate(any(AIRequest.class))).thenThrow(new AIProviderException("Gemini", 401, "Auth Failure", false));
        when(groqProvider.generate(any(AIRequest.class))).thenThrow(new AIProviderException("Groq", 429, "Rate limit", true));
        when(githubProvider.generate(any(AIRequest.class))).thenThrow(new AIProviderException("GitHub", 408, "Timeout", true));
        when(openrouterProvider.generate(any(AIRequest.class))).thenThrow(new AIProviderException("OpenRouter", 500, "Internal Server Error", true));

        Exception exception = assertThrows(RuntimeException.class, () -> {
            aiGateway.generate(request);
        });

        String msg = exception.getMessage();
        assertTrue(msg.contains("All AI Providers failed"));
        assertTrue(msg.contains("Gemini failed"));
        assertTrue(msg.contains("Groq failed"));
        assertTrue(msg.contains("GitHub failed"));
        assertTrue(msg.contains("OpenRouter failed"));

        verify(geminiProvider, times(1)).generate(any(AIRequest.class));
        verify(groqProvider, times(1)).generate(any(AIRequest.class));
        verify(githubProvider, times(1)).generate(any(AIRequest.class));
        verify(openrouterProvider, times(1)).generate(any(AIRequest.class));
    }

    @Test
    public void testNonRetryableFailureMovesToNextProvider() throws Exception {
        AIRequest request = AIRequest.builder().prompt("Hello").build();

        // Gemini returns non-retryable 401 Auth Failure
        when(geminiProvider.generate(any(AIRequest.class))).thenThrow(new AIProviderException("Gemini", 401, "Invalid API Key", false));

        AIResponse mockGroqResponse = AIResponse.builder()
                .content("Groq content")
                .providerName("Groq")
                .modelName("openai/gpt-oss-120b")
                .latencyMs(150)
                .build();
        when(groqProvider.generate(any(AIRequest.class))).thenReturn(mockGroqResponse);

        AIResponse actualResponse = aiGateway.generate(request);

        assertNotNull(actualResponse);
        assertEquals("Groq content", actualResponse.getContent());
        
        verify(geminiProvider, times(1)).generate(any(AIRequest.class));
        verify(groqProvider, times(1)).generate(any(AIRequest.class));
    }
}
