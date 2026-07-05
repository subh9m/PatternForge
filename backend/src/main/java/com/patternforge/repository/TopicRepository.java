package com.patternforge.repository;

import com.patternforge.model.Topic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface TopicRepository extends JpaRepository<Topic, UUID> {
    Optional<Topic> findByName(String name);
    Optional<Topic> findBySlug(String slug);
}
