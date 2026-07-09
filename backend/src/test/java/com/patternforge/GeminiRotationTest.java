package com.patternforge;

import com.patternforge.service.APIKeyManager;
import com.patternforge.service.GeminiClient;
import com.patternforge.service.RetryExecutor;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;

import java.net.http.HttpResponse;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

@SpringBootTest
public class GeminiRotationTest {

    @Autowired
    private APIKeyManager apiKeyManager;

    @Autowired
    private RetryExecutor retryExecutor;

    @MockBean
    private GeminiClient geminiClient;

    @Test
    public void testKeyRotationAndSkipOnCooldown() throws Exception {
        System.out.println("==================================================");
        System.out.println("RUNNING GEMINI ROTATION & FAILBACK TEST");
        System.out.println("==================================================");

        List<String> allKeys = apiKeyManager.getAllKeysRaw();
        assertTrue(allKeys.size() >= 2, "Test requires at least 2 keys in the pool");

        System.out.println("=========================================");
        System.out.println("ACTUAL RUNTIME KEY POOL STATUS:");
        for (int i = 0; i < allKeys.size(); i++) {
            String k = allKeys.get(i);
            System.out.println("Index " + i);
            System.out.println("Key: " + apiKeyManager.maskKey(k));
            System.out.println("State: " + apiKeyManager.getKeyState(k));
        }
        System.out.println("=========================================");

        // Get the first two keys in the list to setup mocks
        String key1 = allKeys.get(0);
        String key2 = allKeys.get(1);

        // Reset key states in case they were left in cooldown from previous tests
        apiKeyManager.markSuccess(key1);
        apiKeyManager.markSuccess(key2);

        // Create mock responses
        HttpResponse<String> response429 = Mockito.mock(HttpResponse.class);
        when(response429.statusCode()).thenReturn(429);
        when(response429.body()).thenReturn("{\"error\": {\"message\": \"Resource exhausted\", \"details\": [{\"@type\": \"type.googleapis.com/google.rpc.QuotaFailure\"}]}}");

        HttpResponse<String> response200 = Mockito.mock(HttpResponse.class);
        when(response200.statusCode()).thenReturn(200);
        when(response200.body()).thenReturn("Mocked Gemini success response content");

        // Mock geminiClient executeRequest
        // Key 1 returns 429
        when(geminiClient.executeRequest(eq(key1), anyString(), anyString(), anyString()))
                .thenReturn(response429);
        when(geminiClient.parseRetryDelay(anyString())).thenReturn(30);

        // Key 2 returns 200
        when(geminiClient.executeRequest(eq(key2), anyString(), anyString(), anyString()))
                .thenReturn(response200);

        // Call the retry executor
        String result = retryExecutor.executeWithFallback("Hello", "text/plain");

        // Verify result
        assertEquals("Mocked Gemini success response content", result);

        // Verify that Key 1 entered COOLDOWN state
        assertEquals(APIKeyManager.KeyState.COOLDOWN, apiKeyManager.getKeyState(key1));

        // Verify that Key 2 remained AVAILABLE/success
        assertEquals(APIKeyManager.KeyState.AVAILABLE, apiKeyManager.getKeyState(key2));

        System.out.println("==================================================");
        System.out.println("GEMINI ROTATION & FAILBACK TEST PASSED");
        System.out.println("==================================================");
    }
}
