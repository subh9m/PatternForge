package com.patternforge.service;

import com.patternforge.dto.ImportResultDto;
import com.patternforge.model.Problem;
import com.patternforge.model.Topic;
import com.patternforge.repository.ProblemRepository;
import com.patternforge.repository.TopicRepository;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;
import java.io.InputStream;
import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.IOException;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class PdfProblemImporter implements CommandLineRunner {

    private final TopicRepository topicRepository;
    private final ProblemRepository problemRepository;
    private final ProblemGenerationService problemGenerationService;

    @Value("${patternforge.pdf.path}")
    private String configuredPdfPath;

    // List of topics in order
    private final List<String> knownTopics = Arrays.asList(
            "Basics", "Sorting Techniques", "Arrays", "Binary Search", "Strings",
            "Linked List", "Recursion & Backtracking", "Bit Manipulation",
            "Stacks and Queues", "Sliding Window & Two Pointers", "Heaps",
            "Greedy Algorithms", "Binary Trees", "Binary Search Trees", "Graphs",
            "Dynamic Programming", "Tries"
    );

    public PdfProblemImporter(TopicRepository topicRepository, ProblemRepository problemRepository, ProblemGenerationService problemGenerationService) {
        this.topicRepository = topicRepository;
        this.problemRepository = problemRepository;
        this.problemGenerationService = problemGenerationService;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        System.out.println("PatternForge Importer: Syncing database problems from JSON on boot...");
        
        // Setup topic maps
        Map<String, Topic> topicMap = getOrCreateTopicMap();

        // 1. Try seeding/syncing from problems_seed.json
        boolean success = importFromJson(topicMap);

        if (!success && problemRepository.count() < 626) {
            System.out.println("PatternForge Importer: JSON seeding unsuccessful/missing. Seeding database from PDF on boot...");
            // Fallback candidate paths for local development
            List<String> candidatePaths = Arrays.asList(
                    "C:\\Users\\rajsh\\.gemini\\antigravity-ide\\brain\\516239a5-06ae-4f40-af9d-c6edfc9baf50\\media__1783224148669.pdf",
                    configuredPdfPath,
                    "C:\\Users\\rajsh\\Downloads\\Striver_A2Z_Master_DSA_Database.pdf",
                    "C:\\Users\\rajsh\\Downloads\\Striver_A2Z_Master_DSA_Database (1).pdf"
            );

            for (String path : candidatePaths) {
                if (path == null || path.trim().isEmpty()) continue;
                File file = new File(path);
                if (file.exists()) {
                    System.out.println("PatternForge Importer: Found candidate PDF at " + file.getAbsolutePath());
                    try {
                        ImportResultDto result = importPdfFile(file, topicMap);
                        if (result.getSuccessfullyImported() >= 626) {
                            System.out.println("PatternForge Importer: Boot seeding completed. Count = " + result.getSuccessfullyImported());
                            success = true;
                            break;
                        }
                    } catch (Exception e) {
                        System.err.println("PatternForge Importer: Failed to parse candidate " + path + ": " + e.getMessage());
                    }
                }
            }
        }

        if (!success && problemRepository.count() < 626) {
            System.err.println("PatternForge Importer: Could not seed full 626 problems from PDF/JSON. Falling back to representative seed...");
            importFallbackSeedData(topicMap);
        }

        // Boot-time auto-generation scan for boilerplate/missing data
        System.out.println("PatternForge Importer: Initiating background boot-time auto-generation scan for boilerplate/missing data...");
        new Thread(() -> {
            try {
                // Wait 5 seconds for Spring Context boot logs to finalize
                Thread.sleep(5000);
                List<Problem> problems = problemRepository.findAll();
                int queuedCount = 0;
                for (Problem p : problems) {
                    boolean needsGeneration = (LocalFallbackGenerator.isBoilerplateBasicDetails(p.getBasicDetailsJson()) ||
                                               LocalFallbackGenerator.isBoilerplateSolutionDetails(p.getSolutionDetailsJson()) ||
                                               LocalFallbackGenerator.isBoilerplateSimplifiedStatement(p.getSimplifiedStatement()) ||
                                               LocalFallbackGenerator.isBoilerplateSimplifiedApproach(p.getSimplifiedApproach()));
                    if (needsGeneration) {
                        problemGenerationService.queueGeneration(p.getId());
                        queuedCount++;
                    }
                }
                System.out.println("PatternForge Importer: Queued " + queuedCount + " problems for auto-generation sequentially.");
            } catch (Exception e) {
                System.err.println("PatternForge Importer: Error in boot-time auto-generation scan: " + e.getMessage());
            }
        }).start();
    }

    private boolean importFromJson(Map<String, Topic> topicMap) {
        System.out.println("PatternForge Importer: Attempting to seed from problems_seed.json...");
        try (InputStream is = getClass().getResourceAsStream("/problems_seed.json")) {
            if (is == null) {
                System.out.println("PatternForge Importer: problems_seed.json not found in classpath.");
                return false;
            }
            ObjectMapper mapper = new ObjectMapper();
            List<Map<String, Object>> seedProblems = mapper.readValue(is, new TypeReference<List<Map<String, Object>>>() {});
            
            int successfullyImported = 0;
            for (Map<String, Object> pMap : seedProblems) {
                int masterNumber = (Integer) pMap.get("masterNumber");
                int topicNumber = (Integer) pMap.get("topicNumber");
                int leetcodeNumber = (Integer) pMap.get("leetcodeNumber");
                String problemName = (String) pMap.get("name");
                String topicName = (String) pMap.get("topicName");

                Topic topic = topicMap.get(topicName);
                String difficulty = getDifficultyEstimate(topicName, topicNumber);

                Optional<Problem> existingOpt = problemRepository.findByMasterNumber(masterNumber);
                if (existingOpt.isPresent()) {
                    Problem existing = existingOpt.get();
                    existing.setTopicNumber(topicNumber);
                    existing.setLeetcodeNumber(leetcodeNumber);
                    existing.setName(problemName);
                    existing.setTopic(topic);
                    existing.setDifficulty(difficulty);
                    problemRepository.save(existing);
                } else {
                    Problem newProblem = Problem.builder()
                            .masterNumber(masterNumber)
                            .topicNumber(topicNumber)
                            .leetcodeNumber(leetcodeNumber)
                            .name(problemName)
                            .topic(topic)
                            .difficulty(difficulty)
                            .build();
                    problemRepository.save(newProblem);
                }
                successfullyImported++;
            }
            System.out.println("PatternForge Importer: Successfully seeded " + successfullyImported + " problems from JSON.");
            return successfullyImported >= 626;
        } catch (Exception e) {
            System.err.println("PatternForge Importer: Failed to seed from JSON: " + e.getMessage());
            return false;
        }
    }

    @Transactional
    public ImportResultDto importPdfBytes(byte[] pdfBytes) throws IOException {
        Map<String, Topic> topicMap = getOrCreateTopicMap();
        try (PDDocument document = PDDocument.load(new ByteArrayInputStream(pdfBytes))) {
            return parseAndImportDocument(document, topicMap);
        }
    }

    @Transactional
    public ImportResultDto importPdfFile(File file, Map<String, Topic> topicMap) throws IOException {
        try (PDDocument document = PDDocument.load(file)) {
            return parseAndImportDocument(document, topicMap);
        }
    }

    private Map<String, Topic> getOrCreateTopicMap() {
        Map<String, Topic> topicMap = new HashMap<>();
        for (String topicName : knownTopics) {
            String slug = topicName.toLowerCase()
                    .replace(" & ", "-")
                    .replace(" ", "-");
            Topic topic = topicRepository.findByName(topicName)
                    .orElseGet(() -> topicRepository.save(
                            Topic.builder()
                                    .name(topicName)
                                    .slug(slug)
                                    .build()
                    ));
            topicMap.put(topicName, topic);
        }
        return topicMap;
    }

    private ImportResultDto parseAndImportDocument(PDDocument document, Map<String, Topic> topicMap) throws IOException {
        PDFTextStripper stripper = new PDFTextStripper();
        stripper.setStartPage(3);
        stripper.setEndPage(26);
        String text = stripper.getText(document);

        String[] lines = text.split("\\r?\\n");
        
        String currentTopicName = "Basics";
        Problem lastProblem = null;
        
        Pattern rowPattern = Pattern.compile("^\\s*(\\d+)\\s+(\\d+)\\s+(\\d+)\\s*(.*)$");
        
        int successfullyImported = 0;
        int failedImports = 0;
        int totalFound = 0;
        
        Set<Integer> leetcodeIds = new HashSet<>();
        List<String> duplicatesLog = new ArrayList<>();
        List<String> failedLog = new ArrayList<>();
        
        // We will temporarily cache problems to process updates/saves correctly
        for (String line : lines) {
            line = line.trim();
            if (line.isEmpty()) continue;

            // Skip header/footer noise
            if (line.contains("Striver A2Z") || line.contains("Page ") || line.contains("Master #") || line.contains("Table of Contents")) {
                continue;
            }

            // Skip final page summary text blocks to prevent appending them to the last problem name
            if (line.toLowerCase().startsWith("summary") 
                    || line.toLowerCase().startsWith("total problems") 
                    || line.toLowerCase().startsWith("distribution by topic") 
                    || line.toLowerCase().contains("this list preserves every leetcode-mappable problem")) {
                lastProblem = null;
                continue;
            }

            // Check if the line is a topic header
            boolean isTopicHeader = false;
            for (String topicName : knownTopics) {
                if (line.equalsIgnoreCase(topicName)) {
                    currentTopicName = topicName;
                    isTopicHeader = true;
                    lastProblem = null;
                    break;
                }
            }
            if (isTopicHeader) continue;

            Matcher matcher = rowPattern.matcher(line);
            if (matcher.matches()) {
                totalFound++;
                try {
                    int masterNumber = Integer.parseInt(matcher.group(1));
                    int topicNumber = Integer.parseInt(matcher.group(2));
                    int leetcodeNumber = Integer.parseInt(matcher.group(3));
                    String problemName = matcher.group(4).trim();

                    // Detect duplicates in the PDF
                    if (leetcodeIds.contains(leetcodeNumber)) {
                        duplicatesLog.add("LeetCode ID: " + leetcodeNumber + " (Master ID: " + masterNumber + ")");
                    }
                    leetcodeIds.add(leetcodeNumber);

                    Topic topic = topicMap.get(currentTopicName);
                    String difficulty = getDifficultyEstimate(currentTopicName, topicNumber);

                    // Check if it already exists
                    Optional<Problem> existingOpt = problemRepository.findByMasterNumber(masterNumber);
                    if (existingOpt.isPresent()) {
                        Problem existing = existingOpt.get();
                        existing.setTopicNumber(topicNumber);
                        existing.setLeetcodeNumber(leetcodeNumber);
                        existing.setName(problemName);
                        existing.setTopic(topic);
                        existing.setDifficulty(difficulty);
                        lastProblem = problemRepository.save(existing);
                    } else {
                        Problem newProblem = Problem.builder()
                                .masterNumber(masterNumber)
                                .topicNumber(topicNumber)
                                .leetcodeNumber(leetcodeNumber)
                                .name(problemName)
                                .topic(topic)
                                .difficulty(difficulty)
                                .build();
                        lastProblem = problemRepository.save(newProblem);
                    }
                    successfullyImported++;
                } catch (Exception ex) {
                    failedImports++;
                    failedLog.add("Line error: '" + line + "' -> " + ex.getMessage());
                }
            } else if (lastProblem != null) {
                // Continuation of name wrapping
                if (!line.matches("^\\d+.*") && line.length() > 2) {
                    String currentName = lastProblem.getName();
                    if (currentName.isEmpty()) {
                        lastProblem.setName(line);
                    } else {
                        lastProblem.setName(currentName + " " + line);
                    }
                    problemRepository.save(lastProblem);
                }
            }
        }

        long finalDbCount = problemRepository.count();
        String status = (finalDbCount >= 626) ? "✅ Import Verified Successfully" : "❌ Import Failed (Mismatch)";

        return ImportResultDto.builder()
                .totalFound(totalFound)
                .successfullyImported(successfullyImported)
                .duplicatesCount(duplicatesLog.size())
                .failedImports(failedImports)
                .finalDbCount(finalDbCount)
                .status(status)
                .duplicatesLog(duplicatesLog)
                .failedLog(failedLog)
                .build();
    }

    private String getDifficultyEstimate(String topicName, int topicNumber) {
        switch (topicName) {
            case "Basics":
                return "EASY";
            case "Sorting Techniques":
                return topicNumber <= 5 ? "EASY" : (topicNumber <= 12 ? "MEDIUM" : "HARD");
            case "Arrays":
                return topicNumber <= 25 ? "EASY" : (topicNumber <= 60 ? "MEDIUM" : "HARD");
            case "Binary Search":
                return topicNumber <= 12 ? "EASY" : (topicNumber <= 30 ? "MEDIUM" : "HARD");
            case "Strings":
                return topicNumber <= 15 ? "EASY" : (topicNumber <= 35 ? "MEDIUM" : "HARD");
            case "Linked List":
                return topicNumber <= 10 ? "EASY" : (topicNumber <= 30 ? "MEDIUM" : "HARD");
            case "Recursion & Backtracking":
                return topicNumber <= 8 ? "EASY" : (topicNumber <= 28 ? "MEDIUM" : "HARD");
            case "Bit Manipulation":
                return topicNumber <= 8 ? "EASY" : (topicNumber <= 18 ? "MEDIUM" : "HARD");
            case "Stacks and Queues":
                return topicNumber <= 10 ? "EASY" : (topicNumber <= 28 ? "MEDIUM" : "HARD");
            case "Sliding Window & Two Pointers":
                return topicNumber <= 5 ? "EASY" : (topicNumber <= 22 ? "MEDIUM" : "HARD");
            case "Heaps":
                return topicNumber <= 6 ? "EASY" : (topicNumber <= 18 ? "MEDIUM" : "HARD");
            case "Greedy Algorithms":
                return topicNumber <= 8 ? "EASY" : (topicNumber <= 20 ? "MEDIUM" : "HARD");
            case "Binary Trees":
                return topicNumber <= 15 ? "EASY" : (topicNumber <= 38 ? "MEDIUM" : "HARD");
            case "Binary Search Trees":
                return topicNumber <= 8 ? "EASY" : (topicNumber <= 20 ? "MEDIUM" : "HARD");
            case "Graphs":
                return topicNumber <= 10 ? "EASY" : (topicNumber <= 45 ? "MEDIUM" : "HARD");
            case "Dynamic Programming":
                return topicNumber <= 15 ? "EASY" : (topicNumber <= 60 ? "MEDIUM" : "HARD");
            case "Tries":
                return topicNumber <= 5 ? "EASY" : (topicNumber <= 15 ? "MEDIUM" : "HARD");
            default:
                return "MEDIUM";
        }
    }

    private void importFallbackSeedData(Map<String, Topic> topicMap) {
        System.out.println("PatternForge Importer: Seeding database using fallback list of core problems...");
        
        List<Object[]> seedProblems = new ArrayList<>();
        seedProblems.add(new Object[]{1, 1, 1281, "Subtract the Product and Sum of Digits of an Integer", "Basics", "EASY"});
        seedProblems.add(new Object[]{2, 2, 9, "Palindrome Number", "Basics", "EASY"});
        seedProblems.add(new Object[]{3, 3, 1979, "Find Greatest Common Divisor of Array", "Basics", "EASY"});
        seedProblems.add(new Object[]{4, 4, 509, "Fibonacci Number", "Basics", "EASY"});
        seedProblems.add(new Object[]{26, 1, 912, "Sort an Array", "Sorting Techniques", "MEDIUM"});
        seedProblems.add(new Object[]{27, 2, 75, "Sort Colors", "Sorting Techniques", "MEDIUM"});
        seedProblems.add(new Object[]{49, 9, 1, "Two Sum", "Arrays", "EASY"});
        seedProblems.add(new Object[]{50, 10, 75, "Sort Colors", "Arrays", "MEDIUM"});
        seedProblems.add(new Object[]{51, 11, 169, "Majority Element", "Arrays", "EASY"});
        seedProblems.add(new Object[]{52, 12, 53, "Maximum Subarray", "Arrays", "MEDIUM"});
        seedProblems.add(new Object[]{64, 24, 15, "3Sum", "Arrays", "MEDIUM"});
        seedProblems.add(new Object[]{116, 1, 704, "Binary Search", "Binary Search", "EASY"});
        seedProblems.add(new Object[]{117, 2, 35, "Search Insert Position", "Binary Search", "EASY"});
        seedProblems.add(new Object[]{119, 4, 33, "Search in Rotated Sorted Array", "Binary Search", "MEDIUM"});
        seedProblems.add(new Object[]{124, 9, 4, "Median of Two Sorted Arrays", "Binary Search", "HARD"});
        seedProblems.add(new Object[]{155, 1, 14, "Longest Common Prefix", "Strings", "EASY"});
        seedProblems.add(new Object[]{156, 2, 242, "Valid Anagram", "Strings", "EASY"});
        seedProblems.add(new Object[]{161, 7, 5, "Longest Palindromic Substring", "Strings", "MEDIUM"});
        seedProblems.add(new Object[]{199, 1, 707, "Design Linked List", "Linked List", "MEDIUM"});
        seedProblems.add(new Object[]{200, 2, 206, "Reverse Linked List", "Linked List", "EASY"});
        seedProblems.add(new Object[]{202, 4, 141, "Linked List Cycle", "Linked List", "EASY"});
        seedProblems.add(new Object[]{240, 5, 22, "Generate Parentheses", "Recursion & Backtracking", "MEDIUM"});
        seedProblems.add(new Object[]{249, 14, 51, "N-Queens", "Recursion & Backtracking", "HARD"});
        seedProblems.add(new Object[]{270, 1, 191, "Number of 1 Bits", "Bit Manipulation", "EASY"});
        seedProblems.add(new Object[]{292, 1, 20, "Valid Parentheses", "Stacks and Queues", "EASY"});
        seedProblems.add(new Object[]{313, 22, 146, "LRU Cache", "Stacks and Queues", "MEDIUM"});
        seedProblems.add(new Object[]{328, 1, 3, "Longest Substring Without Repeating Characters", "Sliding Window & Two Pointers", "MEDIUM"});
        seedProblems.add(new Object[]{333, 6, 76, "Minimum Window Substring", "Sliding Window & Two Pointers", "HARD"});
        seedProblems.add(new Object[]{356, 1, 703, "Kth Largest Element in a Stream", "Heaps", "EASY"});
        seedProblems.add(new Object[]{364, 9, 295, "Find Median from Data Stream", "Heaps", "HARD"});
        seedProblems.add(new Object[]{380, 1, 455, "Assign Cookies", "Greedy Algorithms", "EASY"});
        seedProblems.add(new Object[]{406, 1, 144, "Binary Tree Preorder Traversal", "Binary Trees", "EASY"});
        seedProblems.add(new Object[]{407, 2, 94, "Binary Tree Inorder Traversal", "Binary Trees", "EASY"});
        seedProblems.add(new Object[]{415, 10, 236, "Lowest Common Ancestor of a Binary Tree", "Binary Trees", "MEDIUM"});
        seedProblems.add(new Object[]{451, 1, 700, "Search in a Binary Search Tree", "Binary Search Trees", "EASY"});
        seedProblems.add(new Object[]{455, 5, 98, "Validate Binary Search Tree", "Binary Search Trees", "MEDIUM"});
        seedProblems.add(new Object[]{477, 1, 547, "Number of Provinces", "Graphs", "MEDIUM"});
        seedProblems.add(new Object[]{478, 2, 200, "Number of Islands", "Graphs", "MEDIUM"});
        seedProblems.add(new Object[]{534, 1, 70, "Climbing Stairs", "Dynamic Programming", "EASY"});
        seedProblems.add(new Object[]{548, 15, 322, "Coin Change", "Dynamic Programming", "MEDIUM"});
        seedProblems.add(new Object[]{608, 1, 208, "Implement Trie (Prefix Tree)", "Tries", "MEDIUM"});

        for (Object[] seed : seedProblems) {
            Topic topic = topicMap.get((String) seed[4]);
            if (problemRepository.findByMasterNumber((Integer) seed[0]).isPresent()) continue;
            Problem p = Problem.builder()
                    .masterNumber((Integer) seed[0])
                    .topicNumber((Integer) seed[1])
                    .leetcodeNumber((Integer) seed[2])
                    .name((String) seed[3])
                    .topic(topic)
                    .difficulty((String) seed[5])
                    .build();
            problemRepository.save(p);
        }
        System.out.println("PatternForge Importer: Seeded fallback database with " + problemRepository.count() + " core problems.");
    }
}
