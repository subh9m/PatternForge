package com.patternforge.repository;

import com.patternforge.model.DailyTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DailyTaskRepository extends JpaRepository<DailyTask, UUID> {
    Optional<DailyTask> findByUserIdAndDate(UUID userId, LocalDate date);
    List<DailyTask> findByUserIdAndDateBetween(UUID userId, LocalDate startDate, LocalDate endDate);
}
