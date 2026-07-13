package com.patternforge.controller;

import com.patternforge.model.LeetCodeSyncToken;
import com.patternforge.model.UserLeetCodeMetadata;
import com.patternforge.model.UserLeetCodeSync;
import com.patternforge.repository.LeetCodeSyncTokenRepository;
import com.patternforge.repository.ProblemRepository;
import com.patternforge.repository.UserLeetCodeMetadataRepository;
import com.patternforge.repository.UserLeetCodeSyncRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/leetcode")
public class LeetCodeSyncController {

    private final UserLeetCodeSyncRepository syncRepository;
    private final UserLeetCodeMetadataRepository metadataRepository;
    private final LeetCodeSyncTokenRepository tokenRepository;
    private final ProblemRepository problemRepository;
    private final SecureRandom secureRandom = new SecureRandom();

    public LeetCodeSyncController(
            UserLeetCodeSyncRepository syncRepository,
            UserLeetCodeMetadataRepository metadataRepository,
            LeetCodeSyncTokenRepository tokenRepository,
            ProblemRepository problemRepository) {
        this.syncRepository = syncRepository;
        this.metadataRepository = metadataRepository;
        this.tokenRepository = tokenRepository;
        this.problemRepository = problemRepository;
    }

    @PostMapping("/sync")
    @Transactional
    public ResponseEntity<?> syncLeetCode(Authentication authentication, @RequestBody Map<String, List<Integer>> payload) {
        UUID userId = (UUID) authentication.getPrincipal();
        List<Integer> solvedIdsRaw = payload.get("solvedIds");

        // 1. Validate payload: prevent deleting all problems if LeetCode returns empty list unexpectedly
        if (solvedIdsRaw == null || solvedIdsRaw.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "Legitimate solved problems list is required. Sync ignored to prevent data loss."
            ));
        }

        // 2. Remove duplicates and filter out nulls/zeros/negatives
        Set<Integer> cleanSolvedIds = solvedIdsRaw.stream()
                .filter(Objects::nonNull)
                .filter(id -> id > 0)
                .collect(Collectors.toSet());

        if (cleanSolvedIds.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "No valid positive problem IDs found in sync payload."
            ));
        }

        // 3. Fetch current solved IDs stored for user
        List<UserLeetCodeSync> currentSyncList = syncRepository.findByUserId(userId);
        Set<Integer> previousSolvedIds = currentSyncList.stream()
                .map(UserLeetCodeSync::getLeetcodeNumber)
                .collect(Collectors.toSet());

        // 4. Calculate newly solved and removed IDs
        Set<Integer> newlySolvedIds = cleanSolvedIds.stream()
                .filter(id -> !previousSolvedIds.contains(id))
                .collect(Collectors.toSet());

        Set<Integer> removedSolvedIds = previousSolvedIds.stream()
                .filter(id -> !cleanSolvedIds.contains(id))
                .collect(Collectors.toSet());

        LocalDateTime now = LocalDateTime.now();

        // 5. Update local database (inside transaction)
        if (!newlySolvedIds.isEmpty()) {
            List<UserLeetCodeSync> newEntities = newlySolvedIds.stream()
                    .map(id -> UserLeetCodeSync.builder()
                            .userId(userId)
                            .leetcodeNumber(id)
                            .syncedAt(now)
                            .build())
                    .collect(Collectors.toList());
            syncRepository.saveAll(newEntities);
        }

        if (!removedSolvedIds.isEmpty()) {
            syncRepository.deleteByUserIdAndLeetcodeNumberIn(userId, removedSolvedIds);
        }

        // 6. Calculate matched PatternForge problems
        long matchedProblemsCount = problemRepository.countDistinctByLeetcodeNumberIn(cleanSolvedIds);

        // 7. Update or insert metadata
        UserLeetCodeMetadata metadata = metadataRepository.findById(userId)
                .orElseGet(() -> UserLeetCodeMetadata.builder().userId(userId).build());

        metadata.setLastSyncedAt(now);
        metadata.setTotalSolved(cleanSolvedIds.size());
        metadata.setMatchedProblems((int) matchedProblemsCount);
        metadata.setNewlySolvedLastSync(newlySolvedIds.size());

        metadataRepository.save(metadata);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "totalSolved", cleanSolvedIds.size(),
                "newlySolved", newlySolvedIds.size(),
                "removed", removedSolvedIds.size(),
                "syncedAt", now.toString()
        ));
    }

    @GetMapping("/status")
    public ResponseEntity<?> getSyncStatus(Authentication authentication) {
        UUID userId = (UUID) authentication.getPrincipal();
        Optional<UserLeetCodeMetadata> metadataOpt = metadataRepository.findById(userId);

        if (metadataOpt.isPresent()) {
            UserLeetCodeMetadata metadata = metadataOpt.get();
            return ResponseEntity.ok(Map.of(
                    "connected", true,
                    "totalSolved", metadata.getTotalSolved(),
                    "matchedProblems", metadata.getMatchedProblems(),
                    "lastSyncedAt", metadata.getLastSyncedAt().toString(),
                    "newlySolvedLastSync", metadata.getNewlySolvedLastSync()
            ));
        } else {
            Map<String, Object> status = new HashMap<>();
            status.put("connected", false);
            status.put("totalSolved", 0);
            status.put("matchedProblems", 0);
            status.put("lastSyncedAt", null);
            status.put("newlySolvedLastSync", 0);
            return ResponseEntity.ok(status);
        }
    }

    @PostMapping("/token/generate")
    @Transactional
    public ResponseEntity<?> generateSyncToken(Authentication authentication) {
        UUID userId = (UUID) authentication.getPrincipal();

        // Generate raw token: pf_lc_ + secure random hex string
        byte[] randomBytes = new byte[24];
        secureRandom.nextBytes(randomBytes);
        String rawToken = "pf_lc_" + bytesToHex(randomBytes);

        String hash = hashToken(rawToken);

        // Revoke/Delete old token if it exists
        Optional<LeetCodeSyncToken> existingOpt = tokenRepository.findByUserId(userId);
        LeetCodeSyncToken token = existingOpt.orElseGet(() -> LeetCodeSyncToken.builder().userId(userId).build());

        token.setTokenHash(hash);
        token.setCreatedAt(LocalDateTime.now());
        token.setRevoked(false);

        tokenRepository.save(token);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "token", rawToken
        ));
    }

    @PostMapping("/token/revoke")
    @Transactional
    public ResponseEntity<?> revokeSyncToken(Authentication authentication) {
        UUID userId = (UUID) authentication.getPrincipal();
        Optional<LeetCodeSyncToken> tokenOpt = tokenRepository.findByUserId(userId);

        if (tokenOpt.isPresent()) {
            LeetCodeSyncToken token = tokenOpt.get();
            token.setRevoked(true);
            tokenRepository.save(token);
        }

        return ResponseEntity.ok(Map.of("success", true));
    }

    @GetMapping("/token/status")
    public ResponseEntity<?> getTokenStatus(Authentication authentication) {
        UUID userId = (UUID) authentication.getPrincipal();
        Optional<LeetCodeSyncToken> tokenOpt = tokenRepository.findByUserId(userId);

        if (tokenOpt.isPresent() && !tokenOpt.get().isRevoked()) {
            return ResponseEntity.ok(Map.of(
                    "exists", true,
                    "createdAt", tokenOpt.get().getCreatedAt().toString()
            ));
        } else {
            return ResponseEntity.ok(Map.of("exists", false));
        }
    }

    private String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes(StandardCharsets.UTF_8));
            return bytesToHex(hash);
        } catch (Exception e) {
            throw new RuntimeException("Failed to hash token", e);
        }
    }

    private String bytesToHex(byte[] bytes) {
        StringBuilder hexString = new StringBuilder();
        for (byte b : bytes) {
            String hex = Integer.toHexString(0xff & b);
            if (hex.length() == 1) hexString.append('0');
            hexString.append(hex);
        }
        return hexString.toString();
    }
}
