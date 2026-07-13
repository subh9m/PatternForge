package com.patternforge.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "user_leetcode_syncs", uniqueConstraints = {
    @UniqueConstraint(name = "uc_user_leetcode", columnNames = {"userId", "leetcodeNumber"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserLeetCodeSync {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "userId", nullable = false)
    private UUID userId;

    @Column(nullable = false)
    private Integer leetcodeNumber;

    @Column(nullable = false)
    private LocalDateTime syncedAt;
}
