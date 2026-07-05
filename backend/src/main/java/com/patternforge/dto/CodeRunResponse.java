package com.patternforge.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CodeRunResponse {
    private Boolean success;
    private String output;
    private String error;
    private Long runTimeMs;
    private Boolean isTimeout;
    
    // For submissions
    private Integer testCasesPassed;
    private Integer totalTestCases;
    private String status; // "RUN_SUCCESS", "SUBMIT_SUCCESS", "COMPILE_ERROR", "WRONG_ANSWER", "RUNTIME_ERROR"
    private Integer newStreak;
    private Integer newSolvedCount;
}
