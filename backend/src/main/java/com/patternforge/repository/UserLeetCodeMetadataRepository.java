package com.patternforge.repository;

import com.patternforge.model.UserLeetCodeMetadata;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface UserLeetCodeMetadataRepository extends JpaRepository<UserLeetCodeMetadata, UUID> {
}
