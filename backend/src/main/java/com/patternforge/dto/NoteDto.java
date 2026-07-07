package com.patternforge.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NoteDto {
    private String observations;
    private String bruteForce;
    private String possiblePatterns;
    private String chosenPattern;
    private String timeComplexityGuess;
    private String spaceComplexityGuess;
    private String approach;
    
    private String mistakes;
    private String optimizedIdea;
    private String alternativeSolution;
    private String futureReminder;

    private Boolean thinkingChecked;
    private String aiFeedback;
    private String patternsMatchResult;
    private String timeComplexityResult;
    private String spaceComplexityResult;
    private String explanationScore;
}
