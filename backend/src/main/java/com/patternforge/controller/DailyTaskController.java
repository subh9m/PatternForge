package com.patternforge.controller;

import com.patternforge.model.DailyTask;
import com.patternforge.model.StudyHistory;
import com.patternforge.model.User;
import com.patternforge.repository.DailyTaskRepository;
import com.patternforge.repository.StudyHistoryRepository;
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
    private final StudyHistoryRepository studyHistoryRepository;

    public DailyTaskController(DailyTaskRepository dailyTaskRepository, 
                               UserRepository userRepository,
                               StudyHistoryRepository studyHistoryRepository) {
        this.dailyTaskRepository = dailyTaskRepository;
        this.userRepository = userRepository;
        this.studyHistoryRepository = studyHistoryRepository;
    }

    @GetMapping("/today")
    public ResponseEntity<?> getTodayTask(Authentication authentication) {
        UUID userId = (UUID) authentication.getPrincipal();
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).body("Session invalid. User not found.");
        }
        User user = userOpt.get();
        LocalDate today = LocalDate.now();

        // Archive past days' tasks first
        archivePastTasks(user, today);
        
        Optional<DailyTask> taskOpt = dailyTaskRepository.findByUserIdAndDate(userId, today);
        if (taskOpt.isEmpty()) {
            Map<String, Object> empty = new HashMap<>();
            empty.put("selectedModules", "");
            empty.put("completedModules", "");
            empty.put("targetDurations", "");
            empty.put("remainingDurations", "");
            empty.put("elapsedDurations", "");
            empty.put("statuses", "");
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
                        .elapsedDurations("")
                        .statuses("")
                        .build());
                
        task.setSelectedModules(selected);
        task.setTargetDurations(durations);

        // Initialize status as NOT_STARTED for the new module if absent
        Map<String, String> statusMap = parseStatuses(task.getStatuses());
        for (String m : selected.split(",")) {
            m = m.trim();
            if (!m.isEmpty() && !statusMap.containsKey(m)) {
                statusMap.put(m, "NOT_STARTED");
            }
        }
        List<String> statusList = new ArrayList<>();
        statusMap.forEach((k, v) -> statusList.add(k + ":" + v));
        task.setStatuses(String.join(",", statusList));

        // Initialize elapsed duration as 0 if absent
        Map<String, Integer> elapsedMap = parseDurations(task.getElapsedDurations());
        for (String m : selected.split(",")) {
            m = m.trim();
            if (!m.isEmpty() && !elapsedMap.containsKey(m)) {
                elapsedMap.put(m, 0);
            }
        }
        List<String> elapsedList = new ArrayList<>();
        elapsedMap.forEach((k, v) -> elapsedList.add(k + ":" + v));
        task.setElapsedDurations(String.join(",", elapsedList));
        
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
                        .elapsedDurations("")
                        .statuses("")
                        .build());
                
        String completed = task.getCompletedModules();
        Set<String> completedSet = new LinkedHashSet<>();
        if (completed != null && !completed.trim().isEmpty()) {
            completedSet.addAll(Arrays.asList(completed.split(",")));
        }
        completedSet.add(module);
        task.setCompletedModules(String.join(",", completedSet));

        // Update status for this completed module to COMPLETED
        Map<String, String> statusMap = parseStatuses(task.getStatuses());
        statusMap.put(module, "COMPLETED");
        List<String> statusList = new ArrayList<>();
        statusMap.forEach((k, v) -> statusList.add(k + ":" + v));
        task.setStatuses(String.join(",", statusList));
        
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
                        .elapsedDurations("")
                        .statuses("")
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

        // Calculate and save elapsed time based on target duration
        Map<String, Integer> targetMap = parseDurations(task.getTargetDurations());
        int targetMins = targetMap.getOrDefault(module, 25);
        int targetSeconds = targetMins * 60;
        int elapsedSeconds = Math.max(0, targetSeconds - remainingSeconds);

        Map<String, Integer> elapsedMap = parseDurations(task.getElapsedDurations());
        elapsedMap.put(module, elapsedSeconds);
        List<String> elapsedList = new ArrayList<>();
        elapsedMap.forEach((k, v) -> elapsedList.add(k + ":" + v));
        task.setElapsedDurations(String.join(",", elapsedList));

        // Set status to PAUSED
        Map<String, String> statusMap = parseStatuses(task.getStatuses());
        statusMap.put(module, "PAUSED");
        List<String> statusList = new ArrayList<>();
        statusMap.forEach((k, v) -> statusList.add(k + ":" + v));
        task.setStatuses(String.join(",", statusList));

        dailyTaskRepository.save(task);
        return ResponseEntity.ok(task);
    }

    @PostMapping("/today/progress")
    public ResponseEntity<?> updateProgress(Authentication authentication, @RequestBody Map<String, Object> body) {
        UUID userId = (UUID) authentication.getPrincipal();
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).body("Session invalid. User not found.");
        }
        User user = userOpt.get();
        LocalDate today = LocalDate.now();

        String module = (String) body.get("module");
        Integer elapsedSeconds = (Integer) body.get("elapsedSeconds");
        String status = (String) body.get("status");

        if (module == null || elapsedSeconds == null || status == null) {
            return ResponseEntity.badRequest().body("module, elapsedSeconds, and status are required");
        }

        DailyTask task = dailyTaskRepository.findByUserIdAndDate(userId, today)
                .orElseGet(() -> DailyTask.builder()
                        .user(user)
                        .date(today)
                        .selectedModules("")
                        .targetDurations("")
                        .completedModules("")
                        .elapsedDurations("")
                        .statuses("")
                        .build());

        // Update elapsedDurations
        Map<String, Integer> elapsedMap = parseDurations(task.getElapsedDurations());
        elapsedMap.put(module, elapsedSeconds);
        List<String> elapsedList = new ArrayList<>();
        elapsedMap.forEach((k, v) -> elapsedList.add(k + ":" + v));
        task.setElapsedDurations(String.join(",", elapsedList));

        // Update remainingDurations
        Map<String, Integer> targetMap = parseDurations(task.getTargetDurations());
        int targetMins = targetMap.getOrDefault(module, 25);
        int targetSeconds = targetMins * 60;
        int remainingSeconds = Math.max(0, targetSeconds - elapsedSeconds);

        Map<String, Integer> remainingMap = parseDurations(task.getRemainingDurations());
        remainingMap.put(module, remainingSeconds);
        List<String> remainingList = new ArrayList<>();
        remainingMap.forEach((k, v) -> remainingList.add(k + ":" + v));
        task.setRemainingDurations(String.join(",", remainingList));

        // Update statuses
        Map<String, String> statusMap = parseStatuses(task.getStatuses());
        statusMap.put(module, status);
        List<String> statusList = new ArrayList<>();
        statusMap.forEach((k, v) -> statusList.add(k + ":" + v));
        task.setStatuses(String.join(",", statusList));

        // Check completion
        Set<String> completedSet = new LinkedHashSet<>();
        String completed = task.getCompletedModules();
        if (completed != null && !completed.trim().isEmpty()) {
            completedSet.addAll(Arrays.asList(completed.split(",")));
        }
        if ("COMPLETED".equals(status) || elapsedSeconds >= targetSeconds) {
            completedSet.add(module);
            
            // Override status to COMPLETED if completed
            statusMap.put(module, "COMPLETED");
            statusList.clear();
            statusMap.forEach((k, v) -> statusList.add(k + ":" + v));
            task.setStatuses(String.join(",", statusList));
        }
        task.setCompletedModules(String.join(",", completedSet));

        dailyTaskRepository.save(task);
        return ResponseEntity.ok(task);
    }

    private void archivePastTasks(User user, LocalDate today) {
        List<DailyTask> pastTasks = dailyTaskRepository.findByUserIdAndDateBetween(
                user.getId(), today.minusYears(1), today.minusDays(1));
                
        if (pastTasks == null) return;
        
        for (DailyTask dt : pastTasks) {
            if (dt.getArchived() != null && dt.getArchived()) {
                continue;
            }
            
            String selected = dt.getSelectedModules();
            if (selected == null || selected.trim().isEmpty()) {
                dt.setArchived(true);
                dailyTaskRepository.save(dt);
                continue;
            }

            Map<String, Integer> targetMap = parseDurations(dt.getTargetDurations());
            Map<String, Integer> elapsedMap = parseDurations(dt.getElapsedDurations());
            Set<String> completedSet = new HashSet<>();
            if (dt.getCompletedModules() != null && !dt.getCompletedModules().trim().isEmpty()) {
                completedSet.addAll(Arrays.asList(dt.getCompletedModules().split(",")));
            }

            for (String module : selected.split(",")) {
                module = module.trim();
                if (module.isEmpty()) continue;
                
                if (!studyHistoryRepository.existsByUserIdAndDateAndModule(user.getId(), dt.getDate(), module)) {
                    int target = targetMap.getOrDefault(module, 25);
                    int elapsed = elapsedMap.getOrDefault(module, 0);
                    boolean completed = completedSet.contains(module) || (elapsed >= target * 60);
                    
                    studyHistoryRepository.save(StudyHistory.builder()
                            .user(user)
                            .date(dt.getDate())
                            .module(module)
                            .targetTimeMins(target)
                            .actualTimeSecs(elapsed)
                            .completed(completed)
                            .build());
                }
            }
            
            dt.setArchived(true);
            dailyTaskRepository.save(dt);
        }
    }
    
    private Map<String, Integer> parseDurations(String str) {
        Map<String, Integer> map = new HashMap<>();
        if (str == null || str.trim().isEmpty()) return map;
        for (String part : str.split(",")) {
            String[] pair = part.split(":");
            if (pair.length == 2) {
                try {
                    map.put(pair[0].trim(), Integer.parseInt(pair[1].trim()));
                } catch (Exception e) {}
            }
        }
        return map;
    }

    private Map<String, String> parseStatuses(String str) {
        Map<String, String> map = new HashMap<>();
        if (str == null || str.trim().isEmpty()) return map;
        for (String part : str.split(",")) {
            String[] pair = part.split(":");
            if (pair.length == 2) {
                map.put(pair[0].trim(), pair[1].trim());
            }
        }
        return map;
    }
}
