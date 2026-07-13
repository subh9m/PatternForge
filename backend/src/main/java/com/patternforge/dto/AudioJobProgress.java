package com.patternforge.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AudioJobProgress {
    private UUID problemId;
    private String problemName;
    private String status; // "QUEUED", "GENERATING", "COMPLETED", "FAILED"
    private long startTime;
    private long endTime;
    private String jobType; // "AUDIO_HI" or "AUDIO_EN"
}
