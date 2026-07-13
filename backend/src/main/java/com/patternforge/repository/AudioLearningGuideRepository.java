package com.patternforge.repository;

import com.patternforge.model.AudioLearningGuide;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AudioLearningGuideRepository extends JpaRepository<AudioLearningGuide, UUID> {
    List<AudioLearningGuide> findByProblemId(UUID problemId);
    Optional<AudioLearningGuide> findByProblemIdAndLanguage(UUID problemId, String language);
}
