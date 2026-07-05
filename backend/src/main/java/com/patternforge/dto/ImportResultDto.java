package com.patternforge.dto;

import lombok.*;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ImportResultDto {
    private int totalFound;
    private int successfullyImported;
    private int duplicatesCount;
    private int failedImports;
    private long finalDbCount;
    private String status;
    private List<String> duplicatesLog;
    private List<String> failedLog;
}
