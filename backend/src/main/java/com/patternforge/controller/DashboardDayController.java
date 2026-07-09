package com.patternforge.controller;

import com.patternforge.model.*;
import com.patternforge.repository.*;
import com.patternforge.service.DailyBoundaryService;
import com.patternforge.service.DailyResetService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardDayController {

    private final AttemptRepository attemptRepository;
    private final StudyHistoryRepository studyHistoryRepository;
    private final RevisionSessionRepository revisionSessionRepository;
    private final DailyTaskRepository dailyTaskRepository;
    private final DailyResetService dailyResetService;
    private final DailyBoundaryService dailyBoundaryService;

    public DashboardDayController(AttemptRepository attemptRepository,
                                  StudyHistoryRepository studyHistoryRepository,
                                  RevisionSessionRepository revisionSessionRepository,
                                  DailyTaskRepository dailyTaskRepository,
                                  DailyResetService dailyResetService,
                                  DailyBoundaryService dailyBoundaryService) {
        this.attemptRepository = attemptRepository;
        this.studyHistoryRepository = studyHistoryRepository;
        this.revisionSessionRepository = revisionSessionRepository;
        this.dailyTaskRepository = dailyTaskRepository;
        this.dailyResetService = dailyResetService;
        this.dailyBoundaryService = dailyBoundaryService;
    }

    @GetMapping("/day")
    public ResponseEntity<?> getDayDetail(
            Authentication authentication,
            @RequestParam String date) {

        UUID userId = (UUID) authentication.getPrincipal();
        dailyResetService.ensureDailyReset(userId);
        Settings settings = dailyResetService.getOrCreateSettings(userId);

        LocalDate targetDate;
        try {
            targetDate = LocalDate.parse(date, DateTimeFormatter.ISO_LOCAL_DATE);
        } catch (DateTimeParseException e) {
            return ResponseEntity.badRequest().body("Invalid date format. Use yyyy-MM-dd.");
        }

        List<Attempt> attempts = attemptRepository.findByUserId(userId);

        List<Map<String, Object>> solvedProblems = attempts.stream()
                .filter(a -> "SOLVED".equals(a.getStatus()) && a.getLastAttemptedAt() != null)
                .filter(a -> targetDate.equals(dailyBoundaryService.getEffectiveDateForTimestamp(a.getLastAttemptedAt(), settings)))
                .map(a -> {
                    Problem p = a.getProblem();
                    Map<String, Object> pm = new HashMap<>();
                    pm.put("id", p.getId().toString());
                    pm.put("name", p.getName());
                    pm.put("leetcodeNumber", p.getLeetcodeNumber());
                    pm.put("difficulty", p.getDifficulty());
                    pm.put("topicName", p.getTopic().getName());
                    return pm;
                })
                .collect(Collectors.toList());

        long questionsRevised = attempts.stream()
                .filter(a -> "SOLVED".equals(a.getStatus()) && a.getLastRevisedAt() != null)
                .filter(a -> targetDate.equals(dailyBoundaryService.getEffectiveDateForTimestamp(a.getLastRevisedAt(), settings)))
                .count();

        int revisionTimeSecs = revisionSessionRepository.findByUserId(userId).stream()
                .filter(s -> targetDate.equals(s.getDate()))
                .mapToInt(RevisionSession::getElapsedTime)
                .sum();

        List<Map<String, Object>> readingSessions = new ArrayList<>();

        List<StudyHistory> historyRows = studyHistoryRepository.findByUserIdAndDate(userId, targetDate);
        if (historyRows != null && !historyRows.isEmpty()) {
            for (StudyHistory sh : historyRows) {
                Map<String, Object> session = new HashMap<>();
                session.put("module", sh.getModule());
                session.put("targetTimeMins", sh.getTargetTimeMins());
                session.put("actualTimeSecs", sh.getActualTimeSecs());
                session.put("completed", sh.getCompleted());
                session.put("status", sh.getStatus() != null ? sh.getStatus() : (Boolean.TRUE.equals(sh.getCompleted()) ? "COMPLETED" : "NOT_STARTED"));
                readingSessions.add(session);
            }
        } else {
            // Fallback to archived or active daily task for that calendar date
            dailyTaskRepository.findByUserIdAndDate(userId, targetDate).ifPresent(dt -> {
                if (dt.getSelectedModules() == null || dt.getSelectedModules().trim().isEmpty()) return;
                Map<String, Integer> targetMap = parseDurations(dt.getTargetDurations());
                Map<String, Integer> elapsedMap = parseDurations(dt.getElapsedDurations());
                Map<String, String> statusMap = parseStatuses(dt.getStatuses());
                Set<String> completedSet = new HashSet<>();
                if (dt.getCompletedModules() != null && !dt.getCompletedModules().trim().isEmpty()) {
                    completedSet.addAll(Arrays.asList(dt.getCompletedModules().split(",")));
                }
                for (String module : dt.getSelectedModules().split(",")) {
                    module = module.trim();
                    if (module.isEmpty()) continue;
                    int target = targetMap.getOrDefault(module, 25);
                    int elapsed = elapsedMap.getOrDefault(module, 0);
                    boolean completed = completedSet.contains(module) || (elapsed >= target * 60);
                    Map<String, Object> session = new HashMap<>();
                    session.put("module", module);
                    session.put("targetTimeMins", target);
                    session.put("actualTimeSecs", elapsed);
                    session.put("completed", completed);
                    session.put("status", statusMap.getOrDefault(module, completed ? "COMPLETED" : "NOT_STARTED"));
                    readingSessions.add(session);
                }
            });
        }

        int studyTimeSecs = readingSessions.stream()
                .mapToInt(s -> ((Number) s.get("actualTimeSecs")).intValue())
                .sum();

        Map<String, Object> response = new HashMap<>();
        response.put("date", targetDate.format(DateTimeFormatter.ISO_LOCAL_DATE));
        response.put("questionsSolved", solvedProblems.size());
        response.put("questionsRevised", questionsRevised);
        response.put("revisionTimeSecs", revisionTimeSecs);
        response.put("studyTimeSecs", studyTimeSecs);
        response.put("solvedProblems", solvedProblems);
        response.put("readingSessions", readingSessions);

        return ResponseEntity.ok(response);
    }

    private Map<String, Integer> parseDurations(String str) {
        Map<String, Integer> map = new HashMap<>();
        if (str == null || str.trim().isEmpty()) return map;
        for (String part : str.split(",")) {
            String[] pair = part.split(":");
            if (pair.length == 2) {
                try {
                    map.put(pair[0].trim(), Integer.parseInt(pair[1].trim()));
                } catch (Exception e) { /* skip */ }
            }
        }
        return map;
    }

    private Map<String, String> parseStatuses(String str) {
        Map<String, String> map = new HashMap<>();
        if (str == null || str.trim().isEmpty()) return map;
        for (String part : str.split(",")) {
            String[] pair = part.split(":");
            if (pair.length == 2) {
                map.put(pair[0].trim(), pair[1].trim());
            }
        }
        return map;
    }
}
