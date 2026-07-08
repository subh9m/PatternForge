package com.patternforge.service;

public enum JobPriority {
    HIGHEST(0), // Problem user currently opened
    MEDIUM(1),  // Previously interrupted/stuck jobs
    LOWEST(2);  // Background generation

    private final int value;

    JobPriority(int value) {
        this.value = value;
    }

    public int getValue() {
        return value;
    }
}
