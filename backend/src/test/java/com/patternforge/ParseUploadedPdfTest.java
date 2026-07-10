package com.patternforge;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.junit.jupiter.api.Test;
import java.io.File;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class ParseUploadedPdfTest {

    private final List<String> knownTopics = Arrays.asList(
            "Basics", "Sorting Techniques", "Arrays", "Binary Search", "Strings",
            "Linked List", "Recursion & Backtracking", "Bit Manipulation",
            "Stacks and Queues", "Sliding Window & Two Pointers", "Heaps",
            "Greedy Algorithms", "Binary Trees", "Binary Search Trees", "Graphs",
            "Dynamic Programming", "Tries"
    );

    @Test
    public void testFullImport() throws Exception {
        String pdfPath = "C:\\Users\\rajsh\\.gemini\\antigravity-ide\\brain\\516239a5-06ae-4f40-af9d-c6edfc9baf50\\media__1783224148669.pdf";
        File file = new File(pdfPath);
        
        try (PDDocument document = PDDocument.load(file)) {
            PDFTextStripper stripper = new PDFTextStripper();
            stripper.setStartPage(3);
            stripper.setEndPage(26);
            String text = stripper.getText(document);
            String[] lines = text.split("\\r?\\n");
            
            System.out.println(">>> STARTING ANALYSIS OF UPLOADED PDF <<<");
            System.out.println("Total raw lines: " + lines.length);
            
            Pattern rowPattern = Pattern.compile("^\\s*(\\d+)\\s+(\\d+)\\s+(\\d+)\\s*(.*)$");
            
            String currentTopicName = "Basics";
            List<ParsedProblem> parsedProblems = new ArrayList<>();
            ParsedProblem lastProblem = null;
            
            Set<Integer> masterIds = new HashSet<>();
            Set<Integer> leetcodeIds = new HashSet<>();
            List<String> duplicatesLog = new ArrayList<>();
            
            for (String line : lines) {
                line = line.trim();
                if (line.isEmpty()) continue;
                
                // Skip header/footer noise
                if (line.contains("Striver A2Z") || line.contains("Page ") || line.contains("Master #") || line.contains("Table of Contents")) {
                    continue;
                }
                
                // Check if topic header
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
                    int masterNumber = Integer.parseInt(matcher.group(1));
                    int topicNumber = Integer.parseInt(matcher.group(2));
                    int leetcodeNumber = Integer.parseInt(matcher.group(3));
                    String problemName = matcher.group(4).trim();
                    
                    if (masterIds.contains(masterNumber)) {
                        System.out.println("WARNING: Duplicate Master ID found: " + masterNumber);
                    }
                    masterIds.add(masterNumber);
                    
                    if (leetcodeIds.contains(leetcodeNumber)) {
                        duplicatesLog.add("LeetCode ID: " + leetcodeNumber + " (Master ID: " + masterNumber + ")");
                    }
                    leetcodeIds.add(leetcodeNumber);
                    
                    lastProblem = new ParsedProblem(masterNumber, topicNumber, leetcodeNumber, problemName, currentTopicName);
                    parsedProblems.add(lastProblem);
                } else if (lastProblem != null) {
                    // Continuation of name
                    if (!line.matches("^\\d+.*") && line.length() > 2) {
                        String currentName = lastProblem.name;
                        if (currentName.isEmpty()) {
                            lastProblem.name = line;
                        } else {
                            lastProblem.name = currentName + " " + line;
                        }
                    }
                }
            }
            
            System.out.println("Total parsed problems: " + parsedProblems.size());
            System.out.println("Duplicate LeetCode count: " + duplicatesLog.size());
            if (duplicatesLog.size() > 0) {
                System.out.println("Duplicates Log:");
                for (String log : duplicatesLog) {
                    System.out.println("  " + log);
                }
            }
            
            // Check missing Master numbers from 1 to 841
            List<Integer> missingMaster = new ArrayList<>();
            for (int i = 1; i <= 841; i++) {
                if (!masterIds.contains(i)) {
                    missingMaster.add(i);
                }
            }
            System.out.println("Missing Master IDs count: " + missingMaster.size());
            if (missingMaster.size() > 0) {
                System.out.println("Missing Master IDs: " + missingMaster);
            }
        }
    }
    
    private static class ParsedProblem {
        int masterNumber;
        int topicNumber;
        int leetcodeNumber;
        String name;
        String topic;
        
        ParsedProblem(int masterNumber, int topicNumber, int leetcodeNumber, String name, String topic) {
            this.masterNumber = masterNumber;
            this.topicNumber = topicNumber;
            this.leetcodeNumber = leetcodeNumber;
            this.name = name;
            this.topic = topic;
        }
    }
}
