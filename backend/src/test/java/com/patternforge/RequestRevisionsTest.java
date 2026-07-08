package com.patternforge;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import java.util.UUID;
import com.patternforge.config.JwtUtils;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class RequestRevisionsTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtUtils jwtUtils;

    @Test
    public void testRevisionsEndpoint() throws Exception {
        System.out.println("==================================================");
        System.out.println("RUNNING REVISIONS ENDPOINT INTEGRATION TEST");
        System.out.println("==================================================");
        
        // Mock authentication for user 'new' (ID: 026386b9-9461-4b85-8889-1a19aa4394ff)
        UUID userId = UUID.fromString("026386b9-9461-4b85-8889-1a19aa4394ff");
        String token = jwtUtils.generateToken("new", userId);
        
        // Perform GET request with bearer token
        String responseContent = mockMvc.perform(get("/api/revisions")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();
        
        System.out.println("REVISIONS RESPONSE: " + responseContent);
        
        // Sleep 6 seconds to let the background threads run and finish
        System.out.println("Sleeping to let background threads execute...");
        Thread.sleep(6000);
        
        System.out.println("==================================================");
        System.out.println("REVISIONS ENDPOINT INTEGRATION TEST END");
        System.out.println("==================================================");
    }
}
