package com.patternforge.controller;

import com.patternforge.model.DailyTask;
import com.patternforge.model.User;
import com.patternforge.repository.DailyTaskRepository;
import com.patternforge.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/daily-tasks")
public class DailyTaskController {

    private final DailyTaskRepository dailyTaskRepository;
    private final UserRepository userRepository;

    public DailyTaskController(DailyTaskRepository dailyTaskRepository, UserRepository userRepository) {
        this.dailyTaskRepository = dailyTaskRepository;
        this.userRepository = userRepository;
    }

    @GetMapping("/today")
    public ResponseEntity<?> getTodayTask(Authentication authentication) {
        UUID userId = (UUID) authentication.getPrincipal();
        if (!userRepository.existsById(userId)) {
            return ResponseEntity.status(401).body("Session invalid. User not found.");
        }
        LocalDate today = LocalDate.now();
        Optional<DailyTask> taskOpt = dailyTaskRepository.findByUserIdAndDate(userId, today);
        
        if (taskOpt.isEmpty()) {
            Map<String, Object> empty = new HashMap<>();
            empty.put("selectedModules", "");
            empty.put("completedModules", "");
            empty.put("targetDurations", "");
            empty.put("remainingDurations", "");
            return ResponseEntity.ok(empty);
        }
        
        return ResponseEntity.ok(taskOpt.get());
    }

    @PostMapping("/today/select")
    public ResponseEntity<?> selectModules(Authentication authentication, @RequestBody Map<String, String> body) {
        UUID userId = (UUID) authentication.getPrincipal();
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).body("Session invalid. User not found.");
        }
        User user = userOpt.get();
        LocalDate today = LocalDate.now();
        
        String selected = body.getOrDefault("selectedModules", "");
        String durations = body.getOrDefault("targetDurations", "");
        
        DailyTask task = dailyTaskRepository.findByUserIdAndDate(userId, today)
                .orElseGet(() -> DailyTask.builder()
                        .user(user)
                        .date(today)
                        .completedModules("")
                        .build());
                
        task.setSelectedModules(selected);
        task.setTargetDurations(durations);
        
        dailyTaskRepository.save(task);
        return ResponseEntity.ok(task);
    }

    @PostMapping("/today/complete")
    public ResponseEntity<?> completeModule(Authentication authentication, @RequestBody Map<String, String> body) {
        UUID userId = (UUID) authentication.getPrincipal();
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).body("Session invalid. User not found.");
        }
        User user = userOpt.get();
        LocalDate today = LocalDate.now();
        String module = body.get("module"); // e.g. "dsa"
        
        if (module == null || module.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Module name is required");
        }
        
        DailyTask task = dailyTaskRepository.findByUserIdAndDate(userId, today)
                .orElseGet(() -> DailyTask.builder()
                        .user(user)
                        .date(today)
                        .selectedModules("")
                        .targetDurations("")
                        .completedModules("")
                        .build());
                
        String completed = task.getCompletedModules();
        Set<String> completedSet = new LinkedHashSet<>();
        if (completed != null && !completed.trim().isEmpty()) {
            completedSet.addAll(Arrays.asList(completed.split(",")));
        }
        completedSet.add(module);
        
        task.setCompletedModules(String.join(",", completedSet));
        dailyTaskRepository.save(task);
        
        return ResponseEntity.ok(task);
    }

    @PostMapping("/today/pause")
    public ResponseEntity<?> pauseModule(Authentication authentication, @RequestBody Map<String, Object> body) {
        UUID userId = (UUID) authentication.getPrincipal();
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).body("Session invalid. User not found.");
        }
        User user = userOpt.get();
        LocalDate today = LocalDate.now();
        String module = (String) body.get("module");
        Integer remainingSeconds = (Integer) body.get("remainingSeconds");

        if (module == null || remainingSeconds == null) {
            return ResponseEntity.badRequest().body("Module name and remainingSeconds are required");
        }

        DailyTask task = dailyTaskRepository.findByUserIdAndDate(userId, today)
                .orElseGet(() -> DailyTask.builder()
                        .user(user)
                        .date(today)
                        .selectedModules("")
                        .targetDurations("")
                        .completedModules("")
                        .build());

        String currentRem = task.getRemainingDurations();
        Map<String, Integer> remMap = new LinkedHashMap<>();
        if (currentRem != null && !currentRem.trim().isEmpty()) {
            for (String part : currentRem.split(",")) {
                String[] pair = part.split(":");
                if (pair.length == 2) {
                    try {
                        remMap.put(pair[0], Integer.parseInt(pair[1]));
                    } catch (Exception e) {
                        // skip invalid
                    }
                }
            }
        }
        remMap.put(module, remainingSeconds);

        List<String> list = new ArrayList<>();
        remMap.forEach((k, v) -> list.add(k + ":" + v));
        task.setRemainingDurations(String.join(",", list));

        dailyTaskRepository.save(task);
        return ResponseEntity.ok(task);
    }
}
