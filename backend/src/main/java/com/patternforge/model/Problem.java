package com.patternforge.model;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "problems", indexes = {
    @Index(name = "idx_problems_leetcode", columnList = "leetcodeNumber"),
    @Index(name = "idx_problems_master", columnList = "masterNumber")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Problem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true)
    private Integer masterNumber;

    @Column(nullable = false)
    private Integer topicNumber;

    private Integer leetcodeNumber;

    @Column(nullable = false, length = 1000)
    private String name;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "topic_id", nullable = false)
    private Topic topic;

    @Column(nullable = false)
    private String difficulty; // "EASY", "MEDIUM", "HARD"

    @Column(columnDefinition = "TEXT")
    private String problemDetailsJson;
}
