package com.patternforge.repository;

import com.patternforge.model.UserLeetCodeSync;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserLeetCodeSyncRepository extends JpaRepository<UserLeetCodeSync, UUID> {
    List<UserLeetCodeSync> findByUserId(UUID userId);
    Optional<UserLeetCodeSync> findByUserIdAndLeetcodeNumber(UUID userId, Integer leetcodeNumber);
    void deleteByUserId(UUID userId);
    void deleteByUserIdAndLeetcodeNumberIn(UUID userId, java.util.Collection<Integer> leetcodeNumbers);
}
