package com.patternforge.service;

import com.patternforge.model.DailyTask;
import com.patternforge.model.StudyHistory;
import com.patternforge.model.User;
import com.patternforge.repository.DailyTaskRepository;
import com.patternforge.repository.RevisionSessionRepository;
import com.patternforge.repository.StudyHistoryRepository;
import com.patternforge.repository.UserRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.*;

/**
 * Runs at 2:00 AM IST (20:30 UTC) every night to:
 *  1. Archive all past DailyTask records (so reading tasks are cleared for the new day)
 *  2. Finish any dangling revision sessions left from the previous day
 *
 * NOTE: isRevisedToday in RevisionController is computed dynamically by comparing
 * lastRevisedAt.toLocalDate() with today's date, so the date rollover at midnight
 * automatically marks everything as "pending" again — no explicit reset needed.
 */
@Component
public class DailyResetScheduler {

    private final DailyTaskRepository dailyTaskRepository;
    private final UserRepository userRepository;
    private final StudyHistoryRepository studyHistoryRepository;
    private final RevisionSessionRepository revisionSessionRepository;

    public DailyResetScheduler(DailyTaskRepository dailyTaskRepository,
                                UserRepository userRepository,
                                StudyHistoryRepository studyHistoryRepository,
                                RevisionSessionRepository revisionSessionRepository) {
        this.dailyTaskRepository = dailyTaskRepository;
        this.userRepository = userRepository;
        this.studyHistoryRepository = studyHistoryRepository;
        this.revisionSessionRepository = revisionSessionRepository;
    }

    /**
     * Cron: 0 0 0 * * ? — runs at midnight UTC (05:30 AM IST) every day.
     *
     * Server-side archiving runs once per day at midnight.
     * The user-configurable reset time (stored in Settings.dailyResetHour) controls
     * only the FRONTEND cache-clear timers (MasterDashboard + RevisionView) which
     * clear localStorage and re-fetch data at the user's chosen hour.
     */
    @Scheduled(cron = "0 0 0 * * ?", zone = "UTC")
    public void performDailyReset() {
        System.out.println("[DailyResetScheduler] Running 2AM IST nightly reset...");

        LocalDate today = LocalDate.now();

        // 1. Archive all past DailyTask records for all users (so reading tasks are cleared)
        archiveAllPastTasks(today);

        // 2. Finish any orphaned revision sessions from previous days
        finishOrphanedRevisionSessions(today);

        System.out.println("[DailyResetScheduler] Nightly reset complete.");
    }

    /**
     * Archives all DailyTask records older than today for all users.
     * This is the same logic as archivePastTasks() in DailyTaskController, but
     * applied globally so users who don't open the app still get a clean state.
     */
    private void archiveAllPastTasks(LocalDate today) {
        List<DailyTask> pastTasks = dailyTaskRepository.findByDateBeforeAndArchivedFalse(today);
        if (pastTasks == null || pastTasks.isEmpty()) return;

        for (DailyTask dt : pastTasks) {
            if (Boolean.TRUE.equals(dt.getArchived())) continue;

            User user = dt.getUser();
            if (user == null) {
                dt.setArchived(true);
                dailyTaskRepository.save(dt);
                continue;
            }

            String selected = dt.getSelectedModules();
            if (selected == null || selected.trim().isEmpty()) {
                dt.setArchived(true);
                dailyTaskRepository.save(dt);
                continue;
            }

            // Persist to StudyHistory (same logic as DailyTaskController.archivePastTasks)
            Map<String, Integer> targetMap = parseDurations(dt.getTargetDurations());
            Map<String, Integer> elapsedMap = parseDurations(dt.getElapsedDurations());
            Set<String> completedSet = new HashSet<>();
            if (dt.getCompletedModules() != null && !dt.getCompletedModules().trim().isEmpty()) {
                completedSet.addAll(Arrays.asList(dt.getCompletedModules().split(",")));
            }

            for (String module : selected.split(",")) {
                module = module.trim();
                if (module.isEmpty()) continue;

                UUID userId = user.getId();
                if (!studyHistoryRepository.existsByUserIdAndDateAndModule(userId, dt.getDate(), module)) {
                    int target = targetMap.getOrDefault(module, 25);
                    int elapsed = elapsedMap.getOrDefault(module, 0);
                    boolean completed = completedSet.contains(module) || (elapsed >= target * 60);

                    studyHistoryRepository.save(StudyHistory.builder()
                            .user(user)
                            .date(dt.getDate())
                            .module(module)
                            .targetTimeMins(target)
                            .actualTimeSecs(elapsed)
                            .completed(completed)
                            .build());
                }
            }

            dt.setArchived(true);
            dailyTaskRepository.save(dt);
        }

        System.out.println("[DailyResetScheduler] Archived " + pastTasks.size() + " past daily task(s).");
    }

    /**
     * Marks any RUNNING or PAUSED revision sessions from previous days as FINISHED.
     * This prevents stale sessions from cluttering the active session check.
     */
    private void finishOrphanedRevisionSessions(LocalDate today) {
        var orphanedSessions = revisionSessionRepository.findAll().stream()
                .filter(s -> (s.getStatus().equals("RUNNING") || s.getStatus().equals("PAUSED"))
                        && s.getDate() != null && s.getDate().isBefore(today))
                .toList();

        for (var session : orphanedSessions) {
            session.setStatus("FINISHED");
            revisionSessionRepository.save(session);
        }

        if (!orphanedSessions.isEmpty()) {
            System.out.println("[DailyResetScheduler] Finished " + orphanedSessions.size() + " orphaned revision session(s).");
        }
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
}
