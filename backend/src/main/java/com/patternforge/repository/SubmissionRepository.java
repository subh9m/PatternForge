package com.patternforge.repository;

import com.patternforge.model.Submission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SubmissionRepository extends JpaRepository<Submission, UUID> {
    List<Submission> findByUserIdAndProblemIdOrderByCreatedAtDesc(UUID userId, UUID problemId);
    List<Submission> findByUserIdOrderByCreatedAtDesc(UUID userId);
    List<Submission> findByProblemId(UUID problemId);
}
