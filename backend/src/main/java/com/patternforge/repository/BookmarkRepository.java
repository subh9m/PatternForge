package com.patternforge.repository;

import com.patternforge.model.Bookmark;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BookmarkRepository extends JpaRepository<Bookmark, UUID> {
    Optional<Bookmark> findByUserIdAndProblemId(UUID userId, UUID problemId);
    List<Bookmark> findByUserId(UUID userId);
}
