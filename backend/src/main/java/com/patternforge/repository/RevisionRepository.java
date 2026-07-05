package com.patternforge.repository;

import com.patternforge.model.Revision;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface RevisionRepository extends JpaRepository<Revision, UUID> {
    List<Revision> findByUserIdAndStatus(UUID userId, String status);
    List<Revision> findByUserIdAndScheduledDateBeforeAndStatus(UUID userId, LocalDateTime date, String status);
    List<Revision> findByUserIdAndProblemIdAndStatus(UUID userId, UUID problemId, String status);
}
