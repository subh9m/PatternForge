package com.patternforge.service;

import com.patternforge.model.DailyTask;
import com.patternforge.model.RevisionSession;
import com.patternforge.model.Settings;
import com.patternforge.model.StudyHistory;
import com.patternforge.model.User;
import com.patternforge.repository.DailyTaskRepository;
import com.patternforge.repository.RevisionSessionRepository;
import com.patternforge.repository.SettingsRepository;
import com.patternforge.repository.StudyHistoryRepository;
import com.patternforge.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;

@Service
public class DailyResetService {

    private final UserRepository userRepository;
    private final SettingsRepository settingsRepository;
    private final DailyTaskRepository dailyTaskRepository;
    private final StudyHistoryRepository studyHistoryRepository;
    private final RevisionSessionRepository revisionSessionRepository;
    private final DailyBoundaryService dailyBoundaryService;

    public DailyResetService(UserRepository userRepository,
                             SettingsRepository settingsRepository,
                             DailyTaskRepository dailyTaskRepository,
                             StudyHistoryRepository studyHistoryRepository,
                             RevisionSessionRepository revisionSessionRepository,
                             DailyBoundaryService dailyBoundaryService) {
        this.userRepository = userRepository;
        this.settingsRepository = settingsRepository;
        this.dailyTaskRepository = dailyTaskRepository;
        this.studyHistoryRepository = studyHistoryRepository;
        this.revisionSessionRepository = revisionSessionRepository;
        this.dailyBoundaryService = dailyBoundaryService;
    }

    /**
     * Ensures all completed study days before the current effective day are archived.
     * Called on API requests and by the scheduled reset job.
     */
    @Transactional
    public void ensureDailyReset(UUID userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) return;

        Settings settings = settingsRepository.findByUserId(userId).orElse(null);
        if (settings == null) {
            settings = Settings.builder().user(user).build();
            settings = settingsRepository.save(settings);
        }

        LocalDate currentEffective = dailyBoundaryService.getCurrentEffectiveDate(settings);
        LocalDate lastProcessed = settings.getLastProcessedEffectiveDate();

        if (lastProcessed == null) {
            // First run: archive all past effective days (handles migration from calendar-date tasks)
            LocalDate cursor = currentEffective.minusYears(1);
            while (cursor.isBefore(currentEffective)) {
                archiveDailyTaskForDate(user, cursor);
                finishRevisionSessionsForDate(user, cursor);
                cursor = cursor.plusDays(1);
            }
            settings.setLastProcessedEffectiveDate(currentEffective);
            settingsRepository.save(settings);
            return;
        }

        if (!lastProcessed.isBefore(currentEffective)) {
            return;
        }

        LocalDate dateToArchive = lastProcessed;
        while (dateToArchive.isBefore(currentEffective)) {
            archiveDailyTaskForDate(user, dateToArchive);
            finishRevisionSessionsForDate(user, dateToArchive);
            dateToArchive = dateToArchive.plusDays(1);
        }

        settings.setLastProcessedEffectiveDate(currentEffective);
        settingsRepository.save(settings);
    }

    @Transactional
    public void ensureDailyResetForAllUsers() {
        settingsRepository.findAll().forEach(settings -> {
            if (settings.getUser() != null) {
                ensureDailyReset(settings.getUser().getId());
            }
        });
    }

    public void archiveDailyTaskForDate(User user, LocalDate date) {
        Optional<DailyTask> taskOpt = dailyTaskRepository.findByUserIdAndDate(user.getId(), date);
        if (taskOpt.isEmpty()) return;

        DailyTask dt = taskOpt.get();
        if (Boolean.TRUE.equals(dt.getArchived())) return;

        String selected = dt.getSelectedModules();
        if (selected == null || selected.trim().isEmpty()) {
            dt.setArchived(true);
            dailyTaskRepository.save(dt);
            return;
        }

        Map<String, Integer> targetMap = parseDurations(dt.getTargetDurations());
        Map<String, Integer> elapsedMap = parseDurations(dt.getElapsedDurations());
        Map<String, String> statusMap = parseStatuses(dt.getStatuses());
        Set<String> completedSet = new HashSet<>();
        if (dt.getCompletedModules() != null && !dt.getCompletedModules().trim().isEmpty()) {
            completedSet.addAll(Arrays.asList(dt.getCompletedModules().split(",")));
        }

        for (String module : selected.split(",")) {
            module = module.trim();
            if (module.isEmpty()) continue;

            if (!studyHistoryRepository.existsByUserIdAndDateAndModule(user.getId(), dt.getDate(), module)) {
                int target = targetMap.getOrDefault(module, 25);
                int elapsed = elapsedMap.getOrDefault(module, 0);
                boolean completed = completedSet.contains(module) || (elapsed >= target * 60);
                String status = statusMap.getOrDefault(module, completed ? "COMPLETED" : "NOT_STARTED");

                studyHistoryRepository.save(StudyHistory.builder()
                        .user(user)
                        .date(dt.getDate())
                        .module(module)
                        .targetTimeMins(target)
                        .actualTimeSecs(elapsed)
                        .completed(completed)
                        .status(status)
                        .build());
            }
        }

        dt.setArchived(true);
        dailyTaskRepository.save(dt);
    }

    public void finishRevisionSessionsForDate(User user, LocalDate date) {
        revisionSessionRepository.findByUserIdAndDate(user.getId(), date).stream()
                .filter(s -> "RUNNING".equals(s.getStatus()) || "PAUSED".equals(s.getStatus()))
                .forEach(session -> {
                    session.setStatus("FINISHED");
                    revisionSessionRepository.save(session);
                });
    }

    public Settings getOrCreateSettings(UUID userId) {
        return settingsRepository.findByUserId(userId).orElseGet(() -> {
            User user = userRepository.findById(userId).orElseThrow();
            return settingsRepository.save(Settings.builder().user(user).build());
        });
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
