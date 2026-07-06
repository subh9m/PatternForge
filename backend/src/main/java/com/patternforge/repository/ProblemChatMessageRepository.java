package com.patternforge.repository;

import com.patternforge.model.ProblemChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ProblemChatMessageRepository extends JpaRepository<ProblemChatMessage, UUID> {
    List<ProblemChatMessage> findByUserIdAndProblemIdOrderByCreatedAtAsc(UUID userId, UUID problemId);
}
