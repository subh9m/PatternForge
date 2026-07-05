package com.patternforge.repository;

import com.patternforge.model.TestCase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TestCaseRepository extends JpaRepository<TestCase, UUID> {
    List<TestCase> findByProblemId(UUID problemId);
    List<TestCase> findByProblemIdAndIsPublic(UUID problemId, Boolean isPublic);
}
