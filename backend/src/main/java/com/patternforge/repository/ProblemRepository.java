package com.patternforge.repository;

import com.patternforge.model.Problem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProblemRepository extends JpaRepository<Problem, UUID> {
    Optional<Problem> findByMasterNumber(Integer masterNumber);
    Optional<Problem> findByLeetcodeNumber(Integer leetcodeNumber);
    List<Problem> findByTopicId(UUID topicId);

    @Query("SELECT p FROM Problem p WHERE LOWER(p.name) LIKE LOWER(CONCAT('%', :query, '%')) OR CAST(p.leetcodeNumber as string) LIKE %:query% OR CAST(p.masterNumber as string) LIKE %:query%")
    List<Problem> searchProblems(@Param("query") String query);

    @Query(value = "SELECT * FROM problems ORDER BY RANDOM() LIMIT 1", nativeQuery = true)
    Optional<Problem> findRandomProblem();

    @Query(value = "SELECT basic_details_json FROM problems WHERE id = :id", nativeQuery = true)
    String findBasicDetailsJsonById(@Param("id") UUID id);

    @Query(value = "SELECT solution_details_json FROM problems WHERE id = :id", nativeQuery = true)
    String findSolutionDetailsJsonById(@Param("id") UUID id);
}
