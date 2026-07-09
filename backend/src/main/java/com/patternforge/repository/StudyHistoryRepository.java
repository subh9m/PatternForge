package com.patternforge.repository;

import com.patternforge.model.StudyHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface StudyHistoryRepository extends JpaRepository<StudyHistory, UUID> {
    List<StudyHistory> findByUserId(UUID userId);
    List<StudyHistory> findByUserIdAndDate(UUID userId, LocalDate date);
    boolean existsByUserIdAndDateAndModule(UUID userId, LocalDate date, String module);
}
