package com.patternforge.model;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "audio_contents")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AudioContent {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true)
    private UUID guideId;

    @Column(nullable = false, columnDefinition = "bytea")
    private byte[] data;
}
