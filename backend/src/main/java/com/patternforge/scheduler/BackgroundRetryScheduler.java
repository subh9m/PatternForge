package com.patternforge.scheduler;

import com.patternforge.model.Problem;
import com.patternforge.repository.ProblemRepository;
import com.patternforge.service.AIGateway;
import com.patternforge.service.AIProvider;
import com.patternforge.service.LocalFallbackGenerator;
import com.patternforge.service.ProblemGenerationService;
import com.patternforge.service.JobPriority;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@Slf4j
public class BackgroundRetryScheduler {

    private final ProblemRepository problemRepository;
    private final ProblemGenerationService problemGenerationService;
    private final AIGateway aiGateway;

    public BackgroundRetryScheduler(ProblemRepository problemRepository,
                                    ProblemGenerationService problemGenerationService,
                                    AIGateway aiGateway) {
        this.problemRepository = problemRepository;
        this.problemGenerationService = problemGenerationService;
        this.aiGateway = aiGateway;
    }

    // Run every 2 minutes (120,000 ms)
    @Scheduled(fixedRate = 120000)
    public void retryFailedGenerations() {
        // Only run if there is at least one healthy & configured provider
        boolean anyHealthy = aiGateway.getProviders().stream()
                .anyMatch(p -> p.isConfigured() && 
                        aiGateway.getMetrics().get(p.providerName()).getHealthState() != com.patternforge.dto.ProviderMetrics.HealthState.UNAVAILABLE &&
                        !aiGateway.getMetrics().get(p.providerName()).isManuallyDisabled());

        if (!anyHealthy) {
            log.info("BackgroundRetryScheduler: No healthy AI providers are currently available. Skipping background retries.");
            return;
        }

        java.util.Set<java.util.UUID> failedIds = problemGenerationService.getFailedProblems();
        if (failedIds.isEmpty()) {
            return;
        }

        log.info("BackgroundRetryScheduler: Scanning for explicitly requested failed problems to retry...");
        int retriedCount = 0;

        for (java.util.UUID problemId : failedIds) {
            // Skip if already in the running/queued set
            if (problemGenerationService.isGenerating(problemId)) {
                continue;
            }

            int retries = problemGenerationService.getRetryCount(problemId);
            if (retries >= 3) {
                log.info("BackgroundRetryScheduler: Problem {} has failed {} times. Skipping automatic retry.", problemId, retries);
                continue;
            }

            java.util.Optional<Problem> pOpt = problemRepository.findById(problemId);
            if (pOpt.isPresent()) {
                Problem p = pOpt.get();
                boolean needsGeneration = (LocalFallbackGenerator.isBoilerplateBasicDetails(p.getBasicDetailsJson()) ||
                                           LocalFallbackGenerator.isBoilerplateSolutionDetails(p.getSolutionDetailsJson()));

                if (needsGeneration) {
                    log.info("BackgroundRetryScheduler: Re-submitting '{}' (attempt {}) to generation queue.", p.getName(), retries + 1);
                    problemGenerationService.incrementRetryCount(problemId);
                    problemGenerationService.submitJob(p.getId(), JobPriority.LOWEST);
                    retriedCount++;
                } else {
                    problemGenerationService.clearJobStatus(p.getId());
                }
            }
        }

        if (retriedCount > 0) {
            log.info("BackgroundRetryScheduler: successfully queued {} failed problems for background generation.", retriedCount);
        }
    }
}
