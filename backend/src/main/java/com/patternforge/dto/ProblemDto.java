package com.patternforge.dto;

import lombok.*;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProblemDto {
    private UUID id;
    private Integer masterNumber;
    private Integer topicNumber;
    private Integer leetcodeNumber;
    private String name;
    private String topicName;
    private String difficulty;
    
    // User progress details
    private String status; // "UNSOLVED", "SOLVED", "ATTEMPTED", "WRONG"
    private Boolean isFavorite;
    private Boolean needRevision;
    private Integer confidenceRating;
    private Boolean approachSaved;
    private Boolean isAiReady;
    private Boolean leetcodeSolved;
}
