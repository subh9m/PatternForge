package com.patternforge.service;

import java.util.Objects;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

public class GenerationJob implements Comparable<GenerationJob> {
    private final UUID problemId;
    private final JobPriority priority;
    private final CompletableFuture<Void> future = new CompletableFuture<>();
    private final long createdAt = System.currentTimeMillis();

    public GenerationJob(UUID problemId, JobPriority priority) {
        this.problemId = problemId;
        this.priority = priority;
    }

    public UUID getProblemId() {
        return problemId;
    }

    public JobPriority getPriority() {
        return priority;
    }

    public CompletableFuture<Void> getFuture() {
        return future;
    }

    @Override
    public int compareTo(GenerationJob other) {
        int comp = Integer.compare(this.priority.getValue(), other.priority.getValue());
        if (comp != 0) {
            return comp;
        }
        return Long.compare(this.createdAt, other.createdAt);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof GenerationJob)) return false;
        GenerationJob that = (GenerationJob) o;
        return Objects.equals(problemId, that.problemId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(problemId);
    }
}
