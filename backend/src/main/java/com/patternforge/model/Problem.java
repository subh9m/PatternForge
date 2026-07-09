package com.patternforge.model;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "problems", indexes = {
    @Index(name = "idx_problems_leetcode", columnList = "leetcodeNumber"),
    @Index(name = "idx_problems_master", columnList = "masterNumber")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Problem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true)
    private Integer masterNumber;

    @Column(nullable = false)
    private Integer topicNumber;

    private Integer leetcodeNumber;

    @Column(nullable = false, length = 1000)
    private String name;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "topic_id", nullable = false)
    private Topic topic;

    @Column(nullable = false)
    private String difficulty; // "EASY", "MEDIUM", "HARD"

    @Column(columnDefinition = "TEXT")
    private String problemDetailsJson;

    @Column(columnDefinition = "TEXT")
    private String basicDetailsJson;

    @Column(columnDefinition = "TEXT")
    private String solutionDetailsJson;

    @Column(columnDefinition = "TEXT")
    private String simplifiedStatement;

    @Column(columnDefinition = "TEXT")
    private String simplifiedApproach;

    public boolean isAiReady() {
        return (basicDetailsJson != null && !basicDetailsJson.trim().isEmpty() && !com.patternforge.service.LocalFallbackGenerator.isBoilerplateBasicDetails(basicDetailsJson))
            && (solutionDetailsJson != null && !solutionDetailsJson.trim().isEmpty() && !com.patternforge.service.LocalFallbackGenerator.isBoilerplateSolutionDetails(solutionDetailsJson))
            && (simplifiedStatement != null && !simplifiedStatement.trim().isEmpty() && !com.patternforge.service.LocalFallbackGenerator.isBoilerplateSimplifiedStatement(simplifiedStatement))
            && (simplifiedApproach != null && !simplifiedApproach.trim().isEmpty() && !com.patternforge.service.LocalFallbackGenerator.isBoilerplateSimplifiedApproach(simplifiedApproach));
    }

    public String getEffectiveProblemStatement() {
        if (basicDetailsJson != null && !basicDetailsJson.trim().isEmpty()) {
            try {
                com.fasterxml.jackson.databind.JsonNode node = new com.fasterxml.jackson.databind.ObjectMapper().readTree(basicDetailsJson);
                if (node.has("problemStatement")) {
                    return node.get("problemStatement").asText();
                }
            } catch (Exception e) {
                // ignore
            }
        }
        if (problemDetailsJson != null && !problemDetailsJson.trim().isEmpty()) {
            try {
                com.fasterxml.jackson.databind.JsonNode node = new com.fasterxml.jackson.databind.ObjectMapper().readTree(problemDetailsJson);
                if (node.has("problemStatement")) {
                    return node.get("problemStatement").asText();
                }
            } catch (Exception e) {
                // ignore
            }
        }
        return "Problem details not loaded.";
    }
}
