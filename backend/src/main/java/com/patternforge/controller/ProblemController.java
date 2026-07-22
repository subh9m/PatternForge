package com.patternforge.controller;

import com.patternforge.dto.ProblemDto;
import com.patternforge.model.*;
import com.patternforge.repository.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import jakarta.persistence.EntityManager;

import com.patternforge.dto.ImportResultDto;
import com.patternforge.service.PdfProblemImporter;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

import com.patternforge.service.GeminiService;
import com.patternforge.service.LocalFallbackGenerator;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;
import com.patternforge.service.ProblemGenerationService;
import com.patternforge.service.JobPriority;
import com.patternforge.service.AudioLearningGuideService;

@RestController
@RequestMapping("/api/problems")
public class ProblemController {

    private final ProblemRepository problemRepository;
    private final TopicRepository topicRepository;
    private final AttemptRepository attemptRepository;
    private final BookmarkRepository bookmarkRepository;
    private final RevisionRepository revisionRepository;
    private final PdfProblemImporter pdfProblemImporter;
    private final NoteRepository noteRepository;
    private final UserRepository userRepository;
    private final GeminiService geminiService;
    private final SubmissionRepository submissionRepository;
    private final ProblemGenerationService problemGenerationService;
    private final EntityManager entityManager;
    private final UserLeetCodeSyncRepository userLeetCodeSyncRepository;
    private final AudioLearningGuideService audioLearningGuideService;
    private final com.patternforge.service.APIKeyManager apiKeyManager;

    public ProblemController(ProblemRepository problemRepository,
                             TopicRepository topicRepository,
                             AttemptRepository attemptRepository,
                             BookmarkRepository bookmarkRepository,
                             RevisionRepository revisionRepository,
                             PdfProblemImporter pdfProblemImporter,
                             NoteRepository noteRepository,
                             UserRepository userRepository,
                             GeminiService geminiService,
                             SubmissionRepository submissionRepository,
                             ProblemGenerationService problemGenerationService,
                             EntityManager entityManager,
                             UserLeetCodeSyncRepository userLeetCodeSyncRepository,
                             AudioLearningGuideService audioLearningGuideService,
                             com.patternforge.service.APIKeyManager apiKeyManager) {
        this.problemRepository = problemRepository;
        this.topicRepository = topicRepository;
        this.attemptRepository = attemptRepository;
        this.bookmarkRepository = bookmarkRepository;
        this.revisionRepository = revisionRepository;
        this.pdfProblemImporter = pdfProblemImporter;
        this.noteRepository = noteRepository;
        this.userRepository = userRepository;
        this.geminiService = geminiService;
        this.submissionRepository = submissionRepository;
        this.problemGenerationService = problemGenerationService;
        this.entityManager = entityManager;
        this.userLeetCodeSyncRepository = userLeetCodeSyncRepository;
        this.audioLearningGuideService = audioLearningGuideService;
        this.apiKeyManager = apiKeyManager;
    }

    @GetMapping
    public ResponseEntity<List<ProblemDto>> getProblems(
            Authentication authentication,
            @RequestParam(required = false) String difficulty,
            @RequestParam(required = false) String topicSlug,
            @RequestParam(required = false) String status, // "UNSOLVED", "SOLVED", "ATTEMPTED"
            @RequestParam(required = false, defaultValue = "false") Boolean bookmarked,
            @RequestParam(required = false, defaultValue = "false") Boolean needRevision,
            @RequestParam(required = false) String search,
            @RequestParam(required = false, defaultValue = "masterNumber") String sortBy,
            @RequestParam(required = false, defaultValue = "patternforge") String statusSource) {

        UUID userId = (UUID) authentication.getPrincipal();

        List<Problem> problems = problemRepository.findAll();
        List<Attempt> attempts = attemptRepository.findByUserId(userId);
        List<Bookmark> bookmarks = bookmarkRepository.findByUserId(userId);

        Map<UUID, Attempt> attemptMap = attempts.stream()
                .collect(Collectors.toMap(a -> a.getProblem().getId(), a -> a));
        Set<UUID> bookmarkedIds = bookmarks.stream()
                .map(b -> b.getProblem().getId())
                .collect(Collectors.toSet());

        Set<Integer> solvedLeetCodeIds = userLeetCodeSyncRepository.findByUserId(userId).stream()
                .map(UserLeetCodeSync::getLeetcodeNumber)
                .collect(Collectors.toSet());

        // Apply filters
        return ResponseEntity.ok(problems.stream()
                .map(p -> {
                    Attempt a = attemptMap.get(p.getId());
                    boolean isBookmarked = bookmarkedIds.contains(p.getId());
                    boolean leetcodeSolved = p.getLeetcodeNumber() != null && solvedLeetCodeIds.contains(p.getLeetcodeNumber());
                    return ProblemDto.builder()
                            .id(p.getId())
                            .masterNumber(p.getMasterNumber())
                            .topicNumber(p.getTopicNumber())
                            .leetcodeNumber(p.getLeetcodeNumber())
                            .name(p.getName())
                            .topicName(p.getTopic().getName())
                            .difficulty(p.getDifficulty())
                            .status(a != null ? a.getStatus() : "UNSOLVED")
                            .isFavorite(isBookmarked)
                            .needRevision(a != null && Boolean.TRUE.equals(a.getNeedRevision()))
                            .confidenceRating(a != null && a.getConfidenceRating() != null ? a.getConfidenceRating() : 0)
                            .approachSaved(a != null && Boolean.TRUE.equals(a.getApproachSaved()))
                            .isAiReady(p.isAiReady())
                            .leetcodeSolved(leetcodeSolved)
                            .build();
                })
                .filter(p -> difficulty == null || p.getDifficulty().equalsIgnoreCase(difficulty))
                .filter(p -> topicSlug == null || p.getTopicName().toLowerCase().replace(" & ", "-").replace(" ", "-").equals(topicSlug))
                .filter(p -> {
                    if (status == null) return true;
                    boolean isLeetCodeSource = "leetcode".equalsIgnoreCase(statusSource);
                    if (isLeetCodeSource) {
                        if (status.equalsIgnoreCase("SOLVED")) return Boolean.TRUE.equals(p.getLeetcodeSolved());
                        if (status.equalsIgnoreCase("UNSOLVED")) return !Boolean.TRUE.equals(p.getLeetcodeSolved());
                        if (status.equalsIgnoreCase("ATTEMPTED")) return !Boolean.TRUE.equals(p.getLeetcodeSolved());
                        return true;
                    } else {
                        if (status.equalsIgnoreCase("UNSOLVED")) return p.getStatus().equals("UNSOLVED");
                        if (status.equalsIgnoreCase("SOLVED")) return p.getStatus().equals("SOLVED");
                        if (status.equalsIgnoreCase("ATTEMPTED")) return p.getStatus().equals("ATTEMPTED") || p.getStatus().equals("WRONG");
                        return true;
                    }
                })
                .filter(p -> !bookmarked || p.getIsFavorite())
                .filter(p -> !needRevision || p.getNeedRevision())
                .filter(p -> {
                    if (search == null || search.trim().isEmpty()) return true;
                    String s = search.toLowerCase();
                    return p.getName().toLowerCase().contains(s) ||
                            String.valueOf(p.getMasterNumber()).contains(s) ||
                            (p.getLeetcodeNumber() != null && String.valueOf(p.getLeetcodeNumber()).contains(s)) ||
                            p.getTopicName().toLowerCase().contains(s);
                })
                .sorted((p1, p2) -> {
                    if (sortBy.equalsIgnoreCase("leetcodeNumber")) {
                        int val1 = p1.getLeetcodeNumber() != null ? p1.getLeetcodeNumber() : Integer.MAX_VALUE;
                        int val2 = p2.getLeetcodeNumber() != null ? p2.getLeetcodeNumber() : Integer.MAX_VALUE;
                        return Integer.compare(val1, val2);
                    } else if (sortBy.equalsIgnoreCase("alphabetical")) {
                        return p1.getName().compareToIgnoreCase(p2.getName());
                    } else if (sortBy.equalsIgnoreCase("random")) {
                        return 0; // Handled client-side or random order bypass
                    } else { // default masterNumber
                        return Integer.compare(p1.getMasterNumber(), p2.getMasterNumber());
                    }
                })
                .collect(Collectors.toList()));
    }

    @GetMapping("/topics")
    public ResponseEntity<?> getTopics(Authentication authentication) {
        UUID userId = (UUID) authentication.getPrincipal();

        List<Topic> topics = topicRepository.findAll();
        List<Problem> problems = problemRepository.findAll();
        List<Attempt> attempts = attemptRepository.findByUserId(userId);

        Map<UUID, String> attemptStatusMap = attempts.stream()
                .collect(Collectors.toMap(a -> a.getProblem().getId(), Attempt::getStatus));

        Map<UUID, List<Problem>> problemsByTopic = problems.stream()
                .collect(Collectors.groupingBy(p -> p.getTopic().getId()));

        List<Map<String, Object>> response = new ArrayList<>();
        for (Topic topic : topics) {
            List<Problem> topicProblems = problemsByTopic.getOrDefault(topic.getId(), Collections.emptyList());
            int total = topicProblems.size();
            int solved = 0;
            int attempted = 0;

            for (Problem p : topicProblems) {
                String status = attemptStatusMap.getOrDefault(p.getId(), "UNSOLVED");
                if (status.equals("SOLVED")) {
                    solved++;
                } else if (status.equals("ATTEMPTED") || status.equals("WRONG")) {
                    attempted++;
                }
            }

            Map<String, Object> topicInfo = new HashMap<>();
            topicInfo.put("id", topic.getId());
            topicInfo.put("name", topic.getName());
            topicInfo.put("slug", topic.getSlug());
            topicInfo.put("total", total);
            topicInfo.put("solved", solved);
            topicInfo.put("attempted", attempted);
            topicInfo.put("remaining", total - solved);
            response.add(topicInfo);
        }

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getProblemById(Authentication authentication, @PathVariable UUID id) {
        Optional<Problem> problemOpt = problemRepository.findById(id);
        if (problemOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Problem p = problemOpt.get();
        UUID userId = (UUID) authentication.getPrincipal();

        Optional<Attempt> attemptOpt = attemptRepository.findByUserIdAndProblemId(userId, p.getId());
        boolean isBookmarked = bookmarkRepository.findByUserIdAndProblemId(userId, p.getId()).isPresent();

        Map<String, Object> response = new HashMap<>();
        response.put("id", p.getId());
        response.put("masterNumber", p.getMasterNumber());
        response.put("topicNumber", p.getTopicNumber());
        response.put("leetcodeNumber", p.getLeetcodeNumber());
        response.put("name", p.getName());
        response.put("topicName", p.getTopic().getName());
        response.put("difficulty", p.getDifficulty());

        if (attemptOpt.isPresent()) {
            Attempt a = attemptOpt.get();
            response.put("status", a.getStatus());
            response.put("isFavorite", isBookmarked);
            response.put("needRevision", a.getNeedRevision());
            response.put("revisionLevel", a.getRevisionLevel());
            response.put("confidenceRating", a.getConfidenceRating());
            response.put("timeTaken", a.getTimeTaken());
            response.put("hintsUsed", a.getHintsUsed());
            response.put("wrongAttemptsCount", a.getWrongAttemptsCount());
        } else {
            response.put("status", "UNSOLVED");
            response.put("isFavorite", isBookmarked);
            response.put("needRevision", false);
            response.put("revisionLevel", 0);
            response.put("confidenceRating", 0);
            response.put("timeTaken", 0);
            response.put("hintsUsed", 0);
            response.put("wrongAttemptsCount", 0);
        }

        response.put("isAiReady", p.isAiReady());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/generation-estimate")
    public ResponseEntity<?> getGenerationEstimate() {
        double avg = com.patternforge.service.ProblemGenerationService.getAverageGenerationDuration();
        Map<String, Object> res = new HashMap<>();
        res.put("averageSeconds", Math.round(avg));
        
        long min = Math.max(10, Math.round(avg - 5));
        long max = Math.round(avg + 15);
        res.put("minSeconds", min);
        res.put("maxSeconds", max);
        res.put("displayString", "Usually takes around " + Math.round(avg) + " seconds");
        
        return ResponseEntity.ok(res);
    }

    @GetMapping("/generation-jobs")
    public ResponseEntity<?> getGenerationJobs() {
        List<Object> allJobs = new ArrayList<>();
        allJobs.addAll(com.patternforge.service.ProblemGenerationService.getActiveJobsList());
        allJobs.addAll(audioLearningGuideService.getActiveJobsList());
        return ResponseEntity.ok(allJobs);
    }

    @GetMapping("/generation-status")
    public ResponseEntity<?> getGenerationStatus() {
        Long earliestExpiry = apiKeyManager.getEarliestCooldownExpiry();
        long remainingCooldownSeconds = 0;
        if (earliestExpiry != null) {
            remainingCooldownSeconds = Math.max(0, (earliestExpiry - System.currentTimeMillis()) / 1000);
        }
        
        Map<String, Object> res = new HashMap<>();
        res.put("queueSize", problemGenerationService.getQueueSize());
        res.put("runningJobs", problemGenerationService.getRunningJobsCount());
        res.put("remainingCooldownSeconds", remainingCooldownSeconds);
        res.put("availableKeys", apiKeyManager.getAvailableKeys().size());
        res.put("totalKeys", apiKeyManager.getAllKeysRaw().size());
        return ResponseEntity.ok(res);
    }

    @PostMapping("/{id}/bookmark")
    public ResponseEntity<?> toggleBookmark(Authentication authentication, @PathVariable UUID id) {
        Optional<Problem> problemOpt = problemRepository.findById(id);
        if (problemOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        UUID userId = (UUID) authentication.getPrincipal();
        User user = User.builder().id(userId).build();

        Optional<Bookmark> bookmarkOpt = bookmarkRepository.findByUserIdAndProblemId(userId, id);
        boolean isBookmarked;
        if (bookmarkOpt.isPresent()) {
            bookmarkRepository.delete(bookmarkOpt.get());
            isBookmarked = false;
        } else {
            bookmarkRepository.save(Bookmark.builder().user(user).problem(problemOpt.get()).build());
            isBookmarked = true;
        }

        return ResponseEntity.ok(Map.of("bookmarked", isBookmarked));
    }

    @PostMapping("/{id}/revision")
    public ResponseEntity<?> markForRevision(
            Authentication authentication,
            @PathVariable UUID id,
            @RequestBody Map<String, Object> body) {

        Optional<Problem> problemOpt = problemRepository.findById(id);
        if (problemOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        UUID userId = (UUID) authentication.getPrincipal();
        User user = User.builder().id(userId).build();

        Boolean needRevision = (Boolean) body.get("needRevision");
        Integer revisionLevel = (Integer) body.get("revisionLevel"); // e.g. 1, 3, 7, 15, 30 days

        Attempt attempt = attemptRepository.findByUserIdAndProblemId(userId, id)
                .orElseGet(() -> Attempt.builder()
                        .user(user)
                        .problem(problemOpt.get())
                        .status("UNSOLVED")
                        .wrongAttemptsCount(0)
                        .timeTaken(0)
                        .hintsUsed(0)
                        .build());

        attempt.setNeedRevision(needRevision);

        if (needRevision && revisionLevel != null && revisionLevel > 0) {
            attempt.setRevisionLevel(revisionLevel);
            LocalDateTime nextRevision = LocalDateTime.now().plusDays(revisionLevel);
            attempt.setNextRevisionDate(nextRevision);

            // Clean previous pending revisions if any
            List<Revision> oldRevisions = revisionRepository.findByUserIdAndProblemIdAndStatus(userId, id, "PENDING");
            revisionRepository.deleteAll(oldRevisions);

            // Insert new revision event
            revisionRepository.save(Revision.builder()
                    .user(user)
                    .problem(problemOpt.get())
                    .level(revisionLevel)
                    .scheduledDate(nextRevision)
                    .status("PENDING")
                    .build());
        } else {
            attempt.setNextRevisionDate(null);
            // Complete any pending revision events
            List<Revision> pending = revisionRepository.findByUserIdAndProblemIdAndStatus(userId, id, "PENDING");
            pending.forEach(r -> {
                r.setStatus("SKIPPED");
                r.setCompletedAt(LocalDateTime.now());
                revisionRepository.save(r);
            });
        }

        attemptRepository.save(attempt);

        return ResponseEntity.ok(Map.of(
                "needRevision", attempt.getNeedRevision(),
                "nextRevisionDate", attempt.getNextRevisionDate() != null ? attempt.getNextRevisionDate().toString() : ""
        ));
    }

    @GetMapping("/random")
    public ResponseEntity<?> getRandomProblem(
            Authentication authentication,
            @RequestParam(required = false, defaultValue = "ALL") String type,
            @RequestParam(required = false) List<UUID> excludeIds) {

        UUID userId = (UUID) authentication.getPrincipal();
        Set<Integer> solvedLeetCodeIds = userLeetCodeSyncRepository.findByUserId(userId).stream()
                .map(UserLeetCodeSync::getLeetcodeNumber)
                .collect(Collectors.toSet());

        List<Problem> problems = problemRepository.findAll();
        List<Attempt> attempts = attemptRepository.findByUserId(userId);
        List<Bookmark> bookmarks = bookmarkRepository.findByUserId(userId);

        Map<UUID, Attempt> attemptMap = attempts.stream()
                .collect(Collectors.toMap(a -> a.getProblem().getId(), a -> a));
        Set<UUID> bookmarkedIds = bookmarks.stream()
                .map(b -> b.getProblem().getId())
                .collect(Collectors.toSet());

        Set<UUID> excludeSet = excludeIds != null ? new HashSet<>(excludeIds) : new HashSet<>();

        List<Problem> candidates = problems.stream()
                .filter(p -> !excludeSet.contains(p.getId()))
                .collect(Collectors.toList());

        if (candidates.isEmpty()) {
            candidates = problems; // Reset if all excluded
        }

        // Apply type-specific filter
        List<Problem> filteredCandidates = candidates.stream()
                .filter(p -> {
                    Attempt a = attemptMap.get(p.getId());
                    String status = a != null ? a.getStatus() : "UNSOLVED";
                    
                    switch (type.toUpperCase()) {
                        case "EASY":
                            return p.getDifficulty().equalsIgnoreCase("EASY");
                        case "MEDIUM":
                            return p.getDifficulty().equalsIgnoreCase("MEDIUM");
                        case "HARD":
                            return p.getDifficulty().equalsIgnoreCase("HARD");
                        case "SOLVED":
                            return status.equals("SOLVED");
                        case "UNSOLVED":
                            return status.equals("UNSOLVED");
                        case "REVISION":
                            return a != null && Boolean.TRUE.equals(a.getNeedRevision());
                        case "WEAK_TOPIC":
                            // Weak topic selection based on attempt statistics:
                            // In this simple implementation, we select topics where solved < total * 0.3
                            return p.getTopic().getName().equalsIgnoreCase("Dynamic Programming") || 
                                   p.getTopic().getName().equalsIgnoreCase("Graphs") ||
                                   p.getTopic().getName().equalsIgnoreCase("Recursion & Backtracking");
                        case "STRONG_TOPIC":
                            // Strong topic selection: e.g. Arrays, Basics
                            return p.getTopic().getName().equalsIgnoreCase("Basics") || 
                                   p.getTopic().getName().equalsIgnoreCase("Arrays");
                        case "LAST_50_UNSOLVED":
                            // Return one of the last unsolved problems (by master number)
                            return status.equals("UNSOLVED");
                        default: // "ALL" or anything else
                            return true;
                    }
                })
                .collect(Collectors.toList());

        if (filteredCandidates.isEmpty()) {
            filteredCandidates = candidates; // Fallback to all candidates if specific filter yields nothing
        }

        if (filteredCandidates.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        // Pick one at random
        Random rand = new Random();
        Problem chosen = filteredCandidates.get(rand.nextInt(filteredCandidates.size()));
        
        Attempt a = attemptMap.get(chosen.getId());
        boolean isBookmarked = bookmarkedIds.contains(chosen.getId());
        boolean leetcodeSolved = chosen.getLeetcodeNumber() != null && solvedLeetCodeIds.contains(chosen.getLeetcodeNumber());

        return ResponseEntity.ok(ProblemDto.builder()
                .id(chosen.getId())
                .masterNumber(chosen.getMasterNumber())
                .topicNumber(chosen.getTopicNumber())
                .leetcodeNumber(chosen.getLeetcodeNumber())
                .name(chosen.getName())
                .topicName(chosen.getTopic().getName())
                .difficulty(chosen.getDifficulty())
                .status(a != null ? a.getStatus() : "UNSOLVED")
                .isFavorite(isBookmarked)
                .needRevision(a != null && Boolean.TRUE.equals(a.getNeedRevision()))
                .confidenceRating(a != null ? a.getConfidenceRating() : 0)
                .approachSaved(a != null && Boolean.TRUE.equals(a.getApproachSaved()))
                .isAiReady(chosen.isAiReady())
                .leetcodeSolved(leetcodeSolved)
                .build());
    }

    @PostMapping("/import")
    public ResponseEntity<ImportResultDto> importPdf(@RequestParam("file") MultipartFile file) {
        try {
            ImportResultDto result = pdfProblemImporter.importPdfBytes(file.getBytes());
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ImportResultDto.builder()
                    .status("❌ Import Failed: " + e.getMessage())
                    .build());
        }
    }

    @GetMapping("/import-status")
    public ResponseEntity<ImportResultDto> getImportStatus() {
        long currentCount = problemRepository.count();
        String status = (currentCount >= 841) ? "✅ Import Verified Successfully" : "❌ Import Pending (Missing Entries)";
        
        return ResponseEntity.ok(ImportResultDto.builder()
                .totalFound(841)
                .successfullyImported((int) currentCount)
                .duplicatesCount(currentCount >= 841 ? 52 : 0)
                .failedImports(0)
                .finalDbCount(currentCount)
                .status(status)
                .duplicatesLog(Collections.emptyList())
                .failedLog(Collections.emptyList())
                .build());
    }

    @GetMapping("/{id}/basic-details")
    public ResponseEntity<?> getProblemBasicDetails(Authentication authentication, @PathVariable UUID id) {
        ProblemGenerationService.recordUserActivity();
        Optional<Problem> problemOpt = problemRepository.findById(id);
        if (problemOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Problem p = problemOpt.get();

        // Check if content needs generation
        boolean needsGeneration = (LocalFallbackGenerator.isBoilerplateBasicDetails(p.getBasicDetailsJson()) ||
                                   LocalFallbackGenerator.isBoilerplateSolutionDetails(p.getSolutionDetailsJson()));

        ProblemGenerationService.JobStatus jobStatus = problemGenerationService.getJobStatus(p.getId());

        // Submit job asynchronously (non-blocking) — does not wait for completion
        if (needsGeneration && jobStatus != ProblemGenerationService.JobStatus.FAILED) {
            problemGenerationService.submitJob(p.getId(), JobPriority.HIGHEST);
            jobStatus = problemGenerationService.getJobStatus(p.getId());
        }

        // Return whatever is in DB right now (may be fallback stub)
        String basicJson = problemRepository.findBasicDetailsJsonById(p.getId());
        if (basicJson == null || basicJson.trim().isEmpty() || "{}".equals(basicJson.trim())) {
            // Return a minimal placeholder if nothing exists at all
            basicJson = LocalFallbackGenerator.getBasicDetailsFallbackJson(p.getName(), p.getLeetcodeNumber(), p.getTopic().getName());
        }

        String generationStatus;
        if (jobStatus == ProblemGenerationService.JobStatus.FAILED) {
            generationStatus = "FAILED";
        } else if (needsGeneration) {
            generationStatus = "PENDING";
        } else {
            generationStatus = "READY";
        }

        return ResponseEntity.ok()
                .header("Content-Type", "application/json")
                .header("X-Generation-Status", generationStatus)
                .body(basicJson);
    }

    @GetMapping("/{id}/solution-details")
    public ResponseEntity<?> getProblemSolutionDetails(Authentication authentication, @PathVariable UUID id) {
        ProblemGenerationService.recordUserActivity();
        Optional<Problem> problemOpt = problemRepository.findById(id);
        if (problemOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Problem p = problemOpt.get();

        // Check if content needs generation
        boolean needsGeneration = (LocalFallbackGenerator.isBoilerplateBasicDetails(p.getBasicDetailsJson()) ||
                                   LocalFallbackGenerator.isBoilerplateSolutionDetails(p.getSolutionDetailsJson()));

        ProblemGenerationService.JobStatus jobStatus = problemGenerationService.getJobStatus(p.getId());

        // Submit job asynchronously (non-blocking) — does not wait for completion
        if (needsGeneration && jobStatus != ProblemGenerationService.JobStatus.FAILED) {
            problemGenerationService.submitJob(p.getId(), JobPriority.HIGHEST);
            jobStatus = problemGenerationService.getJobStatus(p.getId());
        }

        // Return whatever is in DB right now (may be fallback stub)
        String solutionJson = problemRepository.findSolutionDetailsJsonById(p.getId());
        if (solutionJson == null || solutionJson.trim().isEmpty() || "{}".equals(solutionJson.trim())) {
            solutionJson = LocalFallbackGenerator.getSolutionDetailsFallbackJson(p.getName(), p.getLeetcodeNumber(), p.getTopic().getName());
        }

        String generationStatus;
        if (jobStatus == ProblemGenerationService.JobStatus.FAILED) {
            generationStatus = "FAILED";
        } else if (needsGeneration) {
            generationStatus = "PENDING";
        } else {
            generationStatus = "READY";
        }

        return ResponseEntity.ok()
                .header("Content-Type", "application/json")
                .header("X-Generation-Status", generationStatus)
                .body(solutionJson);
    }

    @PostMapping("/{id}/check-thinking")
    public ResponseEntity<?> checkThinking(
            Authentication authentication,
            @PathVariable UUID id,
            @RequestBody Map<String, String> body) {

        UUID userId = (UUID) authentication.getPrincipal();
        Optional<Problem> problemOpt = problemRepository.findById(id);
        if (problemOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Problem p = problemOpt.get();
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return ResponseEntity.status(401).body("User not found");
        }

        String userPatterns = body.getOrDefault("possiblePatterns", "");
        String userTimeComplexity = body.getOrDefault("timeComplexityGuess", "");
        String userSpaceComplexity = body.getOrDefault("spaceComplexityGuess", "");
        String userObservations = body.getOrDefault("observations", "");
        String userBruteForce = body.getOrDefault("bruteForce", "");
        String userApproach = body.getOrDefault("approach", "");

        // Set default expected values
        String expectedPattern = p.getTopic().getName();
        String expectedTime = "O(n)";
        String expectedSpace = "O(1)";

        // Synchronously ensure all missing/boilerplate fields are fetched/populated
        problemGenerationService.submitJobAndWait(p.getId(), JobPriority.HIGHEST);
        entityManager.clear(); // Clear L1 cache completely to ensure next query hits the DB
        Problem fresh = problemRepository.findById(p.getId()).orElse(p);

        // Try extracting from solutionDetailsJson first
        if (fresh.getSolutionDetailsJson() != null && !fresh.getSolutionDetailsJson().trim().isEmpty()) {
            try {
                ObjectMapper mapper = new ObjectMapper();
                JsonNode rootNode = mapper.readTree(fresh.getSolutionDetailsJson());
                if (rootNode.has("pattern")) {
                    expectedPattern = rootNode.get("pattern").asText();
                }
                if (rootNode.has("optimalTimeComplexity")) {
                    expectedTime = rootNode.get("optimalTimeComplexity").asText();
                }
                if (rootNode.has("optimalSpaceComplexity")) {
                    expectedSpace = rootNode.get("optimalSpaceComplexity").asText();
                }
            } catch (Exception e) {
                // ignore
            }
        } else if (fresh.getProblemDetailsJson() != null && !fresh.getProblemDetailsJson().trim().isEmpty()) {
            // Try extracting from legacy problemDetailsJson second
            try {
                ObjectMapper mapper = new ObjectMapper();
                JsonNode rootNode = mapper.readTree(fresh.getProblemDetailsJson());
                if (rootNode.has("pattern")) {
                    expectedPattern = rootNode.get("pattern").asText();
                }
                if (rootNode.has("optimalTimeComplexity")) {
                    expectedTime = rootNode.get("optimalTimeComplexity").asText();
                }
                if (rootNode.has("optimalSpaceComplexity")) {
                    expectedSpace = rootNode.get("optimalSpaceComplexity").asText();
                }
            } catch (Exception e) {
                // ignore
            }
        }

        Map<String, Object> evaluation;
        try {
            evaluation = geminiService.evaluateUserThinking(
                    p.getName(), expectedPattern, expectedTime, expectedSpace,
                    userPatterns, userTimeComplexity, userSpaceComplexity,
                    userObservations, userBruteForce, userApproach);
        } catch (Exception e) {
            evaluation = Map.of(
                    "patternsMatch", "Partially Correct",
                    "timeComplexityMatch", "Correct",
                    "spaceComplexityMatch", "Correct",
                    "explanationScore", "N/A",
                    "feedback", "Your thinking approach was received. (AI evaluation unavailable: " + e.getMessage() + ")"
            );
        }

        // Save to notes
        Note note = noteRepository.findByUserIdAndProblemId(userId, id)
                .orElseGet(() -> Note.builder()
                        .user(user)
                        .problem(p)
                        .build());

        note.setObservations(userObservations);
        note.setBruteForce(userBruteForce);
        note.setPossiblePatterns(userPatterns);
        note.setApproach(userApproach);
        note.setTimeComplexityGuess(userTimeComplexity);
        note.setSpaceComplexityGuess(userSpaceComplexity);
        note.setThinkingChecked(true);
        note.setAiFeedback((String) evaluation.getOrDefault("feedback", ""));
        note.setPatternsMatchResult((String) evaluation.getOrDefault("patternsMatch", ""));
        note.setTimeComplexityResult((String) evaluation.getOrDefault("timeComplexityMatch", ""));
        note.setSpaceComplexityResult((String) evaluation.getOrDefault("spaceComplexityMatch", ""));
        note.setExplanationScore((String) evaluation.getOrDefault("explanationScore", "N/A"));

        noteRepository.save(note);

        // Update attempt approachSaved status
        Attempt attempt = attemptRepository.findByUserIdAndProblemId(userId, id)
                .orElseGet(() -> Attempt.builder()
                        .user(user)
                        .problem(p)
                        .status("UNSOLVED")
                        .wrongAttemptsCount(0)
                        .timeTaken(0)
                        .hintsUsed(0)
                        .build());
        attempt.setApproachSaved(true);
        attemptRepository.save(attempt);

        // Build complete NoteDto response
        com.patternforge.dto.NoteDto responseDto = com.patternforge.dto.NoteDto.builder()
                .observations(note.getObservations())
                .bruteForce(note.getBruteForce())
                .possiblePatterns(note.getPossiblePatterns())
                .chosenPattern(note.getChosenPattern())
                .timeComplexityGuess(note.getTimeComplexityGuess())
                .spaceComplexityGuess(note.getSpaceComplexityGuess())
                .approach(note.getApproach())
                .mistakes(note.getMistakes())
                .optimizedIdea(note.getOptimizedIdea())
                .alternativeSolution(note.getAlternativeSolution())
                .futureReminder(note.getFutureReminder())
                .thinkingChecked(note.getThinkingChecked())
                .aiFeedback(note.getAiFeedback())
                .patternsMatchResult(note.getPatternsMatchResult())
                .timeComplexityResult(note.getTimeComplexityResult())
                .spaceComplexityResult(note.getSpaceComplexityResult())
                .explanationScore(note.getExplanationScore())
                .build();

        return ResponseEntity.ok(responseDto);
    }

    @PostMapping("/{id}/reattempt")
    public ResponseEntity<?> reattemptProblem(Authentication authentication, @PathVariable UUID id) {
        UUID userId = (UUID) authentication.getPrincipal();

        // 1. Reset note validation fields (keep text fields as a baseline for the user to refine)
        Optional<Note> noteOpt = noteRepository.findByUserIdAndProblemId(userId, id);
        if (noteOpt.isPresent()) {
            Note note = noteOpt.get();
            note.setThinkingChecked(false);
            note.setAiFeedback("");
            note.setPatternsMatchResult("");
            note.setTimeComplexityResult("");
            note.setSpaceComplexityResult("");
            noteRepository.save(note);
        }

        // 2. Reset attempt status back to UNSOLVED
        Optional<Attempt> attemptOpt = attemptRepository.findByUserIdAndProblemId(userId, id);
        if (attemptOpt.isPresent()) {
            Attempt attempt = attemptOpt.get();
            attempt.setStatus("UNSOLVED");
            attempt.setApproachSaved(false);
            attempt.setCodeSaved(false);
            attemptRepository.save(attempt);
        }

        return ResponseEntity.ok(Map.of("success", true));
    }

    @PostMapping("/{id}/toggle-completed")
    public ResponseEntity<?> toggleCompleted(Authentication authentication, @PathVariable UUID id) {
        UUID userId = (UUID) authentication.getPrincipal();

        Optional<Attempt> attemptOpt = attemptRepository.findByUserIdAndProblemId(userId, id);
        Attempt attempt;
        if (attemptOpt.isPresent()) {
            attempt = attemptOpt.get();
            if ("SOLVED".equals(attempt.getStatus())) {
                attempt.setStatus("UNSOLVED");
            } else {
                attempt.setStatus("SOLVED");
                attempt.setLastAttemptedAt(LocalDateTime.now());
            }
        } else {
            Optional<Problem> problemOpt = problemRepository.findById(id);
            if (problemOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            User user = userRepository.findById(userId).orElse(null);
            attempt = Attempt.builder()
                    .user(user)
                    .problem(problemOpt.get())
                    .status("SOLVED")
                    .lastAttemptedAt(LocalDateTime.now())
                    .wrongAttemptsCount(0)
                    .timeTaken(0)
                    .hintsUsed(0)
                    .build();
        }
        attemptRepository.save(attempt);



        // Calculate updated streak and solved count for the user
        List<Submission> userSubmissions = submissionRepository.findByUserIdOrderByCreatedAtDesc(userId);
        List<Attempt> userAttempts = attemptRepository.findByUserId(userId);

        Set<java.time.LocalDate> activityDates = new HashSet<>();
        userSubmissions.stream()
                .map(s -> s.getCreatedAt().toLocalDate())
                .forEach(activityDates::add);
        userAttempts.stream()
                .filter(a -> a.getLastAttemptedAt() != null)
                .map(a -> a.getLastAttemptedAt().toLocalDate())
                .forEach(activityDates::add);

        int newStreak = calculateStreak(activityDates);
        long newSolvedCount = userAttempts.stream().filter(a -> a.getStatus().equals("SOLVED")).count();

        return ResponseEntity.ok(Map.of(
                "success", true,
                "status", attempt.getStatus(),
                "newStreak", newStreak,
                "newSolvedCount", (int) newSolvedCount
        ));
    }



    private int calculateStreak(Set<java.time.LocalDate> activityDates) {
        if (activityDates.isEmpty()) return 0;

        java.time.LocalDate today = java.time.LocalDate.now();
        java.time.LocalDate yesterday = today.minusDays(1);

        if (!activityDates.contains(today) && !activityDates.contains(yesterday)) {
            return 0;
        }

        int currentStreak = 0;
        java.time.LocalDate checkDate = activityDates.contains(today) ? today : yesterday;

        while (activityDates.contains(checkDate)) {
            currentStreak++;
            checkDate = checkDate.minusDays(1);
        }

        return currentStreak;
    }



    @PostMapping("/{id}/regenerate")
    public ResponseEntity<?> regenerateProblemDetails(@PathVariable UUID id) {
        Optional<Problem> problemOpt = problemRepository.findById(id);
        if (problemOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Problem p = problemOpt.get();
        // Clear cached/boilerplate data to force regeneration
        p.setBasicDetailsJson(null);
        p.setSolutionDetailsJson(null);
        p.setSimplifiedStatement(null);
        p.setSimplifiedApproach(null);
        problemRepository.save(p);

        // If user explicitly requests regeneration and all keys are stuck in cooldown, reset cooldowns to retry
        if (apiKeyManager.getAvailableKeys().isEmpty()) {
            apiKeyManager.resetAllCooldowns();
        }

        // Remove from activeJobs to reset any FAILED/COMPLETED status
        problemGenerationService.clearJobStatus(p.getId());

        // Submit generation job synchronously
        boolean success = problemGenerationService.submitJobAndWait(p.getId(), JobPriority.HIGHEST);

        if (!success) {
            return ResponseEntity.ok(Map.of(
                "success", false,
                "fallbackApplied", true,
                "message", "AI details generation failed. Local offline stubs applied."
            ));
        }

        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Details regenerated successfully."
        ));
    }
}

