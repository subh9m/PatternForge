package com.patternforge.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CodeRunRequest {
    private String code;
    private String language;
    private String customInput;
}
