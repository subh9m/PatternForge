package com.patternforge.repository;

import com.patternforge.model.Note;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface NoteRepository extends JpaRepository<Note, UUID> {
    Optional<Note> findByUserIdAndProblemId(UUID userId, UUID problemId);
}
