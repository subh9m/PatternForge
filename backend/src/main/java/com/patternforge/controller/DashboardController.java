package com.patternforge.controller;

import com.patternforge.dto.DashboardStats;
import com.patternforge.dto.ProblemDto;
import com.patternforge.model.*;
import com.patternforge.repository.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/dashboard/stats")
public class DashboardController {

    private final ProblemRepository problemRepository;
    private final TopicRepository topicRepository;
    private final AttemptRepository attemptRepository;
    private final SubmissionRepository submissionRepository;
    private final RevisionRepository revisionRepository;
    private final SettingsRepository settingsRepository;
    private final DailyTaskRepository dailyTaskRepository;

    public DashboardController(ProblemRepository problemRepository,
                               TopicRepository topicRepository,
                               AttemptRepository attemptRepository,
                               SubmissionRepository submissionRepository,
                               RevisionRepository revisionRepository,
                               SettingsRepository settingsRepository,
                               DailyTaskRepository dailyTaskRepository) {
        this.problemRepository = problemRepository;
        this.topicRepository = topicRepository;
        this.attemptRepository = attemptRepository;
        this.submissionRepository = submissionRepository;
        this.revisionRepository = revisionRepository;
        this.settingsRepository = settingsRepository;
        this.dailyTaskRepository = dailyTaskRepository;
    }

    @GetMapping
    public ResponseEntity<?> getStats(
            Authentication authentication,
            @org.springframework.web.bind.annotation.RequestParam(required = false) Integer year
    ) {
        UUID userId = (UUID) authentication.getPrincipal();

        List<Problem> problems = problemRepository.findAll();
        List<Topic> topics = topicRepository.findAll();
        List<Attempt> attempts = attemptRepository.findByUserId(userId);
        List<Submission> submissions = submissionRepository.findByUserIdOrderByCreatedAtDesc(userId);
        
        LocalDate todayDate = LocalDate.now();
        long solvedCount = attempts.stream().filter(a -> "SOLVED".equals(a.getStatus())).count();
        long attemptedCount = attempts.size();

        long revisedTodayCount = attempts.stream()
                .filter(a -> "SOLVED".equals(a.getStatus()) && a.getLastRevisedAt() != null && a.getLastRevisedAt().toLocalDate().equals(todayDate))
                .count();
                
        long revisionDueTodayCount = solvedCount - revisedTodayCount;

        // Calculate approach accuracy defensively
        long approachSavedCount = attempts.stream().filter(a -> Boolean.TRUE.equals(a.getApproachSaved())).count();
        double approachAccuracy = attemptedCount > 0 ? ((double) approachSavedCount / attemptedCount) * 100 : 0.0;

        // Load daily goal from settings
        Settings userSettings = settingsRepository.findByUserId(userId).orElse(null);
        int dailyGoal = (userSettings != null && userSettings.getDailyGoal() != null) ? userSettings.getDailyGoal() : 3;

        // Calculate study minutes
        long studyMinutes = 0;
        Optional<DailyTask> todayTaskOpt = dailyTaskRepository.findByUserIdAndDate(userId, todayDate);
        if (todayTaskOpt.isPresent()) {
            DailyTask dt = todayTaskOpt.get();
            String elapsedStr = dt.getElapsedDurations();
            long totalSecs = 0;
            if (elapsedStr != null && !elapsedStr.trim().isEmpty()) {
                for (String part : elapsedStr.split(",")) {
                    String[] pair = part.split(":");
                    if (pair.length == 2) {
                        try {
                            totalSecs += Integer.parseInt(pair[1].trim());
                        } catch (Exception e) {}
                    }
                }
            }
            studyMinutes = totalSecs / 60;
        }

        // Count solved problems per day to see if they met daily goal for streak
        Map<LocalDate, Long> solvedCountByDate = attempts.stream()
                .filter(a -> "SOLVED".equals(a.getStatus()) && a.getLastAttemptedAt() != null)
                .collect(Collectors.groupingBy(
                        a -> a.getLastAttemptedAt().toLocalDate(),
                        Collectors.counting()
                ));

        // Load all daily tasks for the user to factor into streak
        List<DailyTask> allDailyTasks = dailyTaskRepository.findByUserIdAndDateBetween(
                userId, LocalDate.now().minusYears(2), LocalDate.now());
        if (allDailyTasks == null) {
            allDailyTasks = new ArrayList<>();
        }
        Map<LocalDate, DailyTask> dailyTaskMapAll = allDailyTasks.stream()
                .collect(Collectors.toMap(DailyTask::getDate, t -> t, (t1, t2) -> t1));

        Set<LocalDate> activityDates = new HashSet<>();
        solvedCountByDate.forEach((date, count) -> {
            if (count >= dailyGoal) {
                // If they have selected modules for this day, they MUST complete them to count the day!
                DailyTask dt = dailyTaskMapAll.get(date);
                if (dt == null || dt.getSelectedModules() == null || dt.getSelectedModules().trim().isEmpty()) {
                    activityDates.add(date);
                }
            }
        });

        // Add daily tasks completions
        dailyTaskMapAll.forEach((date, dt) -> {
            if (dt.getSelectedModules() != null && !dt.getSelectedModules().trim().isEmpty()) {
                Set<String> selectedSet = new HashSet<>(Arrays.asList(dt.getSelectedModules().split(",")));
                Set<String> completedSet = new HashSet<>();
                if (dt.getCompletedModules() != null && !dt.getCompletedModules().trim().isEmpty()) {
                    completedSet.addAll(Arrays.asList(dt.getCompletedModules().split(",")));
                }
                if (completedSet.containsAll(selectedSet)) {
                    activityDates.add(date);
                }
            }
        });

        // Streaks engine
        int streak = calculateStreak(activityDates);

        // Topic progress map
        Map<UUID, List<Problem>> problemsByTopic = problems.stream()
                .collect(Collectors.groupingBy(p -> p.getTopic().getId()));
        
        Map<UUID, Long> solvedByTopic = attempts.stream()
                .filter(a -> a.getStatus().equals("SOLVED"))
                .collect(Collectors.groupingBy(a -> a.getProblem().getTopic().getId(), Collectors.counting()));

        Map<String, Long> problemsPerTopicSolved = new HashMap<>();
        Map<String, Long> problemsPerTopicTotal = new HashMap<>();

        String strongestTopic = "N/A";
        double maxRatio = -1.0;
        String weakestTopic = "N/A";
        double minRatio = 2.0; // greater than 1.0

        for (Topic t : topics) {
            List<Problem> topicProblems = problemsByTopic.getOrDefault(t.getId(), Collections.emptyList());
            long total = topicProblems.size();
            long solved = solvedByTopic.getOrDefault(t.getId(), 0L);

            problemsPerTopicSolved.put(t.getName(), solved);
            problemsPerTopicTotal.put(t.getName(), total);

            if (total > 0) {
                double ratio = (double) solved / total;
                if (ratio > maxRatio && solved > 0) {
                    maxRatio = ratio;
                    strongestTopic = t.getName();
                }
                if (ratio < minRatio && (solved < total)) {
                    minRatio = ratio;
                    weakestTopic = t.getName();
                }
            }
        }

        if (strongestTopic.equals("N/A") && !topics.isEmpty()) {
            strongestTopic = topics.get(0).getName();
        }
        if (weakestTopic.equals("N/A") && !topics.isEmpty()) {
            weakestTopic = "Dynamic Programming"; // Standard hard topic default
        }

        String strongestPattern = strongestTopic + " Patterns";
        String weakestPattern = weakestTopic + " Patterns";

        // Recently Solved Problems (latest 5 solved)
        List<ProblemDto> recentlySolved = attempts.stream()
                .filter(a -> a.getStatus().equals("SOLVED"))
                .sorted(Comparator.comparing(Attempt::getLastAttemptedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(5)
                .map(a -> mapToDto(a.getProblem(), a))
                .collect(Collectors.toList());

        // Continue last session (the very last active problem)
        ProblemDto continueLastSession = null;
        if (!attempts.isEmpty()) {
            Attempt lastActiveAttempt = attempts.stream()
                    .sorted(Comparator.comparing(Attempt::getLastAttemptedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                    .findFirst()
                    .orElse(null);
            if (lastActiveAttempt != null) {
                continueLastSession = mapToDto(lastActiveAttempt.getProblem(), lastActiveAttempt);
            }
        }

        // Submissions activity (calendar heatmap with problem arrays for selected year)
        List<Map<String, Object>> monthlyHeatmap = getHeatmapData(userId, attempts, year);

        // Weekly activity (last 7 days counts)
        List<Map<String, Object>> weeklyActivity = getWeeklyActivityData(attempts);

        // Calculate solve goal for today
        long todayGoalSolved = attempts.stream()
                .filter(a -> "SOLVED".equals(a.getStatus()) && a.getLastAttemptedAt() != null && a.getLastAttemptedAt().toLocalDate().equals(LocalDate.now()))
                .count();

        return ResponseEntity.ok(DashboardStats.builder()
                .currentStreak(streak)
                .problemsSolved(solvedCount)
                .problemsAttempted(attemptedCount)
                .approachAccuracy(approachAccuracy)
                .todayGoalSolved((int) todayGoalSolved)
                .todayGoalTarget(dailyGoal)
                .weakestPattern(weakestPattern)
                .strongestPattern(strongestPattern)
                .recentlySolved(recentlySolved)
                .continueLastSession(continueLastSession)
                .revisionDueTodayCount((int) revisionDueTodayCount)
                .todayRevisedCount((int) revisedTodayCount)
                .studyMinutes((int) studyMinutes)
                .weakestTopic(weakestTopic)
                .strongestTopic(strongestTopic)
                .problemsPerTopicSolved(problemsPerTopicSolved)
                .problemsPerTopicTotal(problemsPerTopicTotal)
                .weeklyActivity(weeklyActivity)
                .monthlyHeatmap(monthlyHeatmap)
                .build());
    }

    private ProblemDto mapToDto(Problem p, Attempt a) {
        return ProblemDto.builder()
                .id(p.getId())
                .masterNumber(p.getMasterNumber())
                .topicNumber(p.getTopicNumber())
                .leetcodeNumber(p.getLeetcodeNumber())
                .name(p.getName())
                .topicName(p.getTopic().getName())
                .difficulty(p.getDifficulty())
                .status(a != null ? a.getStatus() : "UNSOLVED")
                .isFavorite(a != null && a.getConfidenceRating() != null && a.getConfidenceRating() > 3)
                .needRevision(a != null && Boolean.TRUE.equals(a.getNeedRevision()))
                .confidenceRating(a != null && a.getConfidenceRating() != null ? a.getConfidenceRating() : 0)
                .approachSaved(a != null && Boolean.TRUE.equals(a.getApproachSaved()))
                .isAiReady(p.isAiReady())
                .build();
    }

    private int calculateStreak(Set<LocalDate> activityDates) {
        if (activityDates.isEmpty()) return 0;

        LocalDate today = LocalDate.now();
        LocalDate yesterday = today.minusDays(1);

        if (!activityDates.contains(today) && !activityDates.contains(yesterday)) {
            return 0;
        }

        int currentStreak = 0;
        LocalDate checkDate = activityDates.contains(today) ? today : yesterday;

        while (activityDates.contains(checkDate)) {
            currentStreak++;
            checkDate = checkDate.minusDays(1);
        }

        return currentStreak;
    }

    private List<Map<String, Object>> getHeatmapData(UUID userId, List<Attempt> attempts, Integer selectedYear) {
        LocalDate today = LocalDate.now();
        int activeYear = (selectedYear != null) ? selectedYear : today.getYear();

        LocalDate startDate = LocalDate.of(activeYear, 1, 1);
        LocalDate endDate;
        if (activeYear == today.getYear()) {
            endDate = today;
        } else {
            endDate = LocalDate.of(activeYear, 12, 31);
        }

        Map<LocalDate, List<Problem>> solvedByDate = attempts.stream()
                .filter(a -> "SOLVED".equals(a.getStatus()) && a.getLastAttemptedAt() != null)
                .filter(a -> {
                    LocalDate date = a.getLastAttemptedAt().toLocalDate();
                    return !date.isBefore(startDate) && !date.isAfter(endDate);
                })
                .collect(Collectors.groupingBy(
                        a -> a.getLastAttemptedAt().toLocalDate(),
                        Collectors.mapping(Attempt::getProblem, Collectors.toList())
                ));

        List<DailyTask> dailyTasks = dailyTaskRepository.findByUserIdAndDateBetween(userId, startDate, endDate);
        if (dailyTasks == null) {
            dailyTasks = new ArrayList<>();
        }
        Map<LocalDate, DailyTask> dailyTaskMap = dailyTasks.stream()
                .collect(Collectors.toMap(DailyTask::getDate, t -> t, (t1, t2) -> t1));

        List<Map<String, Object>> heatmapList = new ArrayList<>();
        DateTimeFormatter dtf = DateTimeFormatter.ofPattern("yyyy-MM-dd");

        for (LocalDate date = startDate; !date.isAfter(endDate); date = date.plusDays(1)) {
            Map<String, Object> cell = new HashMap<>();
            cell.put("date", date.format(dtf));

            List<Problem> dateProblems = solvedByDate.getOrDefault(date, Collections.emptyList());
            List<Map<String, Object>> problemDetailsList = dateProblems.stream()
                    .distinct()
                    .map(p -> {
                        Map<String, Object> pm = new HashMap<>();
                        pm.put("id", p.getId().toString());
                        pm.put("name", p.getName());
                        pm.put("leetcodeNumber", p.getLeetcodeNumber());
                        pm.put("difficulty", p.getDifficulty());
                        pm.put("topicName", p.getTopic().getName());
                        return pm;
                    })
                    .collect(Collectors.toList());

            cell.put("count", problemDetailsList.size());
            cell.put("problems", problemDetailsList);

            DailyTask dt = dailyTaskMap.get(date);
            boolean hasDailyTask = false;
            boolean isDailyTaskCompleted = false;
            String selectedModulesStr = "";
            String completedModulesStr = "";

            if (dt != null && dt.getSelectedModules() != null && !dt.getSelectedModules().trim().isEmpty()) {
                hasDailyTask = true;
                selectedModulesStr = dt.getSelectedModules();
                completedModulesStr = dt.getCompletedModules() != null ? dt.getCompletedModules() : "";

                Set<String> selectedSet = new HashSet<>(Arrays.asList(dt.getSelectedModules().split(",")));
                Set<String> completedSet = new HashSet<>();
                if (dt.getCompletedModules() != null && !dt.getCompletedModules().trim().isEmpty()) {
                    completedSet.addAll(Arrays.asList(dt.getCompletedModules().split(",")));
                }
                isDailyTaskCompleted = completedSet.containsAll(selectedSet);
            }

            cell.put("hasDailyTask", hasDailyTask);
            cell.put("isDailyTaskCompleted", isDailyTaskCompleted);
            cell.put("selectedModules", selectedModulesStr);
            cell.put("completedModules", completedModulesStr);

            heatmapList.add(cell);
        }
        return heatmapList;
    }

    private List<Map<String, Object>> getWeeklyActivityData(List<Attempt> attempts) {
        LocalDate today = LocalDate.now();
        Map<LocalDate, Long> dateCounts = attempts.stream()
                .filter(a -> "SOLVED".equals(a.getStatus()) && a.getLastAttemptedAt() != null)
                .map(a -> a.getLastAttemptedAt().toLocalDate())
                .filter(date -> date.isAfter(today.minusDays(7)))
                .collect(Collectors.groupingBy(date -> date, Collectors.counting()));

        List<Map<String, Object>> weeklyList = new ArrayList<>();
        DateTimeFormatter dtf = DateTimeFormatter.ofPattern("E");

        for (int i = 6; i >= 0; i--) {
            LocalDate date = today.minusDays(i);
            Map<String, Object> day = new HashMap<>();
            day.put("dayName", date.format(dtf));
            day.put("count", dateCounts.getOrDefault(date, 0L));
            weeklyList.add(day);
        }
        return weeklyList;
    }
}
