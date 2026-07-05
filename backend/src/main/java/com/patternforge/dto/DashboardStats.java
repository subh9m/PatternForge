package com.patternforge.dto;

import com.patternforge.model.Problem;
import lombok.*;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardStats {
    private Integer currentStreak;
    private Long problemsSolved;
    private Long problemsAttempted;
    private Double approachAccuracy; // % of solved problems that have pre-solving approach notes
    private Integer todayGoalSolved;
    private Integer todayGoalTarget; // e.g. 3 problems
    
    private String weakestPattern;
    private String strongestPattern;
    
    private List<ProblemDto> recentlySolved;
    private ProblemDto continueLastSession;
    private Integer revisionDueTodayCount;
    
    private String weakestTopic;
    private String strongestTopic;

    private Map<String, Long> problemsPerTopicSolved; // solved per topic
    private Map<String, Long> problemsPerTopicTotal;  // total per topic
    
    private List<Map<String, Object>> weeklyActivity; // heat activity
    private List<Map<String, Object>> monthlyHeatmap; // heatmap for github-like display
}
