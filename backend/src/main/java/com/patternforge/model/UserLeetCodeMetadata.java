package com.patternforge.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "user_leetcode_metadata")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserLeetCodeMetadata {

    @Id
    @Column(name = "userId", nullable = false)
    private UUID userId;

    private LocalDateTime lastSyncedAt;

    private Integer totalSolved;

    private Integer matchedProblems;

    private Integer newlySolvedLastSync;
}
