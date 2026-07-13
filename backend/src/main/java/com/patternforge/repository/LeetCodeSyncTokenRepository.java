package com.patternforge.repository;

import com.patternforge.model.LeetCodeSyncToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface LeetCodeSyncTokenRepository extends JpaRepository<LeetCodeSyncToken, UUID> {
    Optional<LeetCodeSyncToken> findByUserId(UUID userId);
    Optional<LeetCodeSyncToken> findByTokenHash(String tokenHash);
}
