package com.patternforge.repository;

import com.patternforge.model.RevisionSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

@Repository
public interface RevisionSessionRepository extends JpaRepository<RevisionSession, UUID> {
    List<RevisionSession> findByUserId(UUID userId);
    List<RevisionSession> findByUserIdAndDate(UUID userId, LocalDate date);
    List<RevisionSession> findByUserIdAndStatusIn(UUID userId, Collection<String> statuses);
}
