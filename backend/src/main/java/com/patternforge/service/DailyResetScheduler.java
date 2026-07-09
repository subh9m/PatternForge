package com.patternforge.service;

import com.patternforge.model.DailyTask;
import com.patternforge.model.RevisionSession;
import com.patternforge.repository.DailyTaskRepository;
import com.patternforge.repository.RevisionSessionRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

/**
 * Runs every minute to process daily resets for all users whose effective study day
 * has advanced since their last processed date.
 *
 * Archives reading tasks into Study History, finishes orphaned revision sessions,
 * and advances lastProcessedEffectiveDate. DSA/revision daily counts reset
 * automatically via effective-date bucketing — no mutation of Attempt records needed.
 */
@Component
public class DailyResetScheduler {

    private final DailyResetService dailyResetService;
    private final DailyTaskRepository dailyTaskRepository;
    private final RevisionSessionRepository revisionSessionRepository;

    public DailyResetScheduler(DailyResetService dailyResetService,
                               DailyTaskRepository dailyTaskRepository,
                               RevisionSessionRepository revisionSessionRepository) {
        this.dailyResetService = dailyResetService;
        this.dailyTaskRepository = dailyTaskRepository;
        this.revisionSessionRepository = revisionSessionRepository;
    }

    @Scheduled(cron = "0 * * * * ?", zone = "UTC")
    public void performDailyReset() {
        dailyResetService.ensureDailyResetForAllUsers();
        archiveOrphanedPastTasks();
        finishOrphanedRevisionSessions();
    }

    private void archiveOrphanedPastTasks() {
        LocalDate today = LocalDate.now();
        List<DailyTask> pastTasks = dailyTaskRepository.findByDateBeforeAndArchivedFalse(today);
        if (pastTasks == null || pastTasks.isEmpty()) return;

        for (DailyTask dt : pastTasks) {
            if (dt.getUser() != null) {
                dailyResetService.archiveDailyTaskForDate(dt.getUser(), dt.getDate());
            }
        }
    }

    private void finishOrphanedRevisionSessions() {
        LocalDate today = LocalDate.now();
        revisionSessionRepository.findAll().stream()
                .filter(s -> ("RUNNING".equals(s.getStatus()) || "PAUSED".equals(s.getStatus()))
                        && s.getDate() != null && s.getDate().isBefore(today))
                .forEach(session -> {
                    session.setStatus("FINISHED");
                    revisionSessionRepository.save(session);
                });
    }
}
