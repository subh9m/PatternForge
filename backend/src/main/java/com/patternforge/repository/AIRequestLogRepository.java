package com.patternforge.repository;

import com.patternforge.model.AIRequestLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Repository
public interface AIRequestLogRepository extends JpaRepository<AIRequestLog, UUID> {

    List<AIRequestLog> findByOrderByTimestampDesc();

    @Query("SELECT COUNT(DISTINCT l.problemId) FROM AIRequestLog l WHERE l.timestamp >= :since AND l.problemId IS NOT NULL AND l.problemId != 'N/A' AND l.problemId != 'HEALTH_CHECK'")
    long countDistinctProblemsGeneratedSince(@Param("since") Instant since);

    @Query("SELECT COUNT(DISTINCT l.problemId) FROM AIRequestLog l WHERE l.problemId IS NOT NULL AND l.problemId != 'N/A' AND l.problemId != 'HEALTH_CHECK'")
    long countDistinctProblemsGeneratedTotal();

    @Query("SELECT COUNT(l) FROM AIRequestLog l WHERE l.timestamp >= :since")
    long countRequestsSince(@Param("since") Instant since);
}
