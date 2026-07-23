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

        log.info("BackgroundRetryScheduler: Scanning for failed/boilerplate problems to retry generation in background...");
        List<Problem> problems = problemRepository.findAll();
        int retriedCount = 0;

        for (Problem p : problems) {
            boolean needsGeneration = (LocalFallbackGenerator.isBoilerplateBasicDetails(p.getBasicDetailsJson()) ||
                                       LocalFallbackGenerator.isBoilerplateSolutionDetails(p.getSolutionDetailsJson()));

            if (needsGeneration) {
                // Skip if already in the running/queued set
                if (problemGenerationService.isGenerating(p.getId())) {
                    continue;
                }

                ProblemGenerationService.JobStatus status = problemGenerationService.getJobStatus(p.getId());
                // If it is failed or null (cleared from registry), re-submit it!
                if (status == null || status == ProblemGenerationService.JobStatus.FAILED) {
                    log.info("BackgroundRetryScheduler: Re-submitting '{}' to generation queue.", p.getName());
                    problemGenerationService.clearJobStatus(p.getId());
                    problemGenerationService.submitJob(p.getId(), JobPriority.LOWEST);
                    retriedCount++;
                }
            }
        }

        if (retriedCount > 0) {
            log.info("BackgroundRetryScheduler: successfully queued {} failed problems for background generation.", retriedCount);
        }
    }
}
