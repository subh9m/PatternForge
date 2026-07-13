package com.patternforge.repository;

import com.patternforge.model.AudioContent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface AudioContentRepository extends JpaRepository<AudioContent, UUID> {
    Optional<AudioContent> findByGuideId(UUID guideId);
    void deleteByGuideId(UUID guideId);
}
