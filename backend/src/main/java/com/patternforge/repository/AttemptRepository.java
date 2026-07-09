package com.patternforge.repository;

import com.patternforge.model.Attempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AttemptRepository extends JpaRepository<Attempt, UUID> {
    Optional<Attempt> findByUserIdAndProblemId(UUID userId, UUID problemId);
    List<Attempt> findByUserId(UUID userId);
    List<Attempt> findByUserIdAndStatus(UUID userId, String status);
    long countByUserIdAndStatus(UUID userId, String status);
    
    // For bookmarks or favorites
    List<Attempt> findByUserIdAndIsFavorite(UUID userId, Boolean isFavorite);
    List<Attempt> findByProblemId(UUID problemId);
}
