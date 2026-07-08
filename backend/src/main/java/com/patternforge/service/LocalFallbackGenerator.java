package com.patternforge.service;

import java.util.*;
import com.fasterxml.jackson.databind.ObjectMapper;

public class LocalFallbackGenerator {

    private static final ObjectMapper mapper = new ObjectMapper();

    public static class FallbackProblemData {
        public String statement;
        public String optimal;
        public String better;
        public String brute;
        public String observation;
        public String timeComplexity;
        public String spaceComplexity;

        public FallbackProblemData(String statement, String optimal, String better, String brute, String observation, String timeComplexity, String spaceComplexity) {
            this.statement = statement;
            this.optimal = optimal;
            this.better = better;
            this.brute = brute;
            this.observation = observation;
            this.timeComplexity = timeComplexity;
            this.spaceComplexity = spaceComplexity;
        }
    }

    private static final Map<String, FallbackProblemData> db = new HashMap<>();

    static {
        // Linked List
        db.put("Middle of the Linked List", new FallbackProblemData(
            "Find the middle node of a singly linked list. If there are two middle nodes, return the second middle node.",
            "Use Floyd's Tortoise and Hare algorithm. Initialize slow and fast pointers at the head. Traverse the list moving slow by one step and fast by two steps. When fast reaches the end, slow will be at the middle node.",
            "",
            "Traverse the entire linked list to count the total number of nodes N. Then, perform a second traversal to reach and return the (N/2)-th node.",
            "Moving one pointer at twice the speed of another naturally finds the midpoint when the faster one reaches the end.",
            "O(N)",
            "O(1)"
        ));

        db.put("Reverse Linked List", new FallbackProblemData(
            "Reverse a singly linked list in-place and return the new head node.",
            "Iterate through the list using three pointers: prev (initially null), curr (initially head), and next. In each step, save curr.next, reverse the link to point to prev, and advance the pointers forward.",
            "Use recursion. Reverse the rest of the list, and then make the next node point back to the current node, setting current.next to null.",
            "Traverse the list and push all node values onto a stack. Then, traverse the list again, popping values from the stack to overwrite node values in reverse order.",
            "Reversing links in-place requires keeping track of the previous and next nodes to avoid losing the list reference.",
            "O(N)",
            "O(1)"
        ));

        db.put("Linked List Cycle", new FallbackProblemData(
            "Determine if a singly linked list contains a cycle (loop).",
            "Use Floyd's Cycle-Finding Algorithm (slow and fast pointers). Move slow by one node and fast by two nodes. If there is a cycle, the two pointers will eventually meet.",
            "",
            "Traverse the list and store each visited node in a Hash Set. If you encounter a node that is already in the set, a cycle exists.",
            "If a cycle exists, the fast pointer will eventually lap the slow pointer, similar to two runners on a circular track.",
            "O(N)",
            "O(1)"
        ));

        // Arrays
        db.put("Two Sum", new FallbackProblemData(
            "Find two numbers in an array that add up to a specific target sum and return their indices.",
            "Use a Hash Map to store elements and their indices. For each element, compute its complement (target - element). If the complement is in the map, return its index along with the current index.",
            "Sort the array and use the two-pointer approach (low and high) to find the sum, adjusting pointers based on the current sum relative to the target. Note: This changes the original indices.",
            "Use nested loops to check every possible pair of elements in the array and return their indices if they sum up to the target.",
            "A Hash Map allows us to look up the complement of the current number in O(1) time, reducing the complexity from quadratic to linear.",
            "O(N)",
            "O(N)"
        ));

        db.put("Sort Colors", new FallbackProblemData(
            "Sort an array containing 0s, 1s, and 2s in-place so that elements of the same color are adjacent.",
            "Use the Dutch National Flag algorithm with three pointers: low, mid, and high. Keep 0s before low, 2s after high, and 1s between low and mid. Swap elements based on mid's value.",
            "Perform a counting sort: count the occurrences of 0s, 1s, and 2s, then overwrite the original array with the counted colors in order.",
            "Use a standard sorting algorithm like Merge Sort or Quick Sort to sort the array.",
            "By partitioning the array into three sections, we can sort it in a single pass using constant extra space.",
            "O(N)",
            "O(1)"
        ));

        db.put("Majority Element", new FallbackProblemData(
            "Find the majority element in an array of size n, which is the element that appears more than n/2 times.",
            "Use Boyer-Moore Voting Algorithm. Maintain a candidate element and a counter. Traverse the array; increment the counter if the element matches the candidate, decrement otherwise. If counter hits zero, pick a new candidate.",
            "Use a Hash Map to count occurrences of each element, then iterate through the map to find the element with a frequency count greater than n/2.",
            "Sort the array. The majority element will always be at index n/2.",
            "The majority element appears more times than all other elements combined, meaning it will always win in a pairwise cancellation vote.",
            "O(N)",
            "O(1)"
        ));

        // Basics
        db.put("Palindrome Number", new FallbackProblemData(
            "Check if an integer is a palindrome without converting it to a string.",
            "Revert the second half of the integer digits and compare it to the first half. (e.g., 121 -> revert second half '1' -> compare 12 with 12/10).",
            "",
            "Convert the integer to a string (or character array) and use the two-pointer approach to check if the string reads the same backwards.",
            "Reversing only half of the integer avoids potential integer overflow errors during the reversion process.",
            "O(log N)",
            "O(1)"
        ));

        db.put("Fibonacci Number", new FallbackProblemData(
            "Compute the n-th Fibonacci number, where each number is the sum of the two preceding ones.",
            "Use iterative space optimization. Maintain two variables representing the last two Fibonacci numbers, and update them as you loop from 2 up to n.",
            "Use Dynamic Programming (Memoization or Tabulation) to store intermediate Fibonacci numbers in an array to avoid redundant calculations.",
            "Use simple recursion: f(n) = f(n-1) + f(n-2). This results in highly redundant computations.",
            "We only need the previous two terms to calculate the current Fibonacci term, so storing the entire sequence is unnecessary.",
            "O(N)",
            "O(1)"
        ));

        db.put("Subtract the Product and Sum of Digits of an Integer", new FallbackProblemData(
            "Find the difference between the product of digits and the sum of digits of a given integer.",
            "Extract digits one by one using modulo 10 operations inside a loop. Accumulate the product and the sum, then return (product - sum).",
            "",
            "Convert the integer to a string, parse each character back to a digit, compute the product and sum, and return the difference.",
            "Modulo and division operations allow digit extraction without string conversion overhead.",
            "O(log N)",
            "O(1)"
        ));
    }

    public static FallbackProblemData getFallback(String name, String topicName) {
        if (db.containsKey(name)) {
            return db.get(name);
        }
        // Generic fallback based on topicName
        String statement = "Solve the coding puzzle for '" + name + "' under the topic '" + topicName + "'.";
        String optimal = "Utilize standard optimal patterns for " + topicName + " (such as hashing, two pointers, binary search, or dynamic programming transitions) to process inputs in optimal time.";
        String brute = "Implement a naive solution using linear scans, nested loops, or brute-force combinations first to verify correctness.";
        String observation = "Identify core properties, constraints, and relationships in the input data to select the correct algorithmic pattern.";
        
        return new FallbackProblemData(statement, optimal, "", brute, observation, "O(N)", "O(1)");
    }

    public static String getBasicDetailsFallbackJson(String name, Integer leetcodeNumber, String topicName) {
        FallbackProblemData data = getFallback(name, topicName);
        try {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("problemStatement", data.statement);
            map.put("inputFormat", "Standard parameters as defined in the LeetCode signature.");
            map.put("outputFormat", "Expected optimal output type.");
            map.put("examples", Collections.emptyList());
            map.put("constraints", List.of("Standard LeetCode constraints."));
            map.put("edgeCases", List.of("Empty inputs", "Single element bounds"));
            map.put("followUp", "");
            map.put("hints", List.of(
                "Observe structural constraints.",
                "Consider spatial and temporal tradeoffs.",
                "Look for subproblems under " + topicName
            ));
            return mapper.writeValueAsString(map);
        } catch (Exception e) {
            return "{}";
        }
    }

    public static String getSolutionDetailsFallbackJson(String name, Integer leetcodeNumber, String topicName) {
        FallbackProblemData data = getFallback(name, topicName);
        try {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("observation", data.observation);
            map.put("pattern", topicName);
            map.put("approach", data.optimal);
            map.put("optimalTimeComplexity", data.timeComplexity);
            map.put("optimalSpaceComplexity", data.spaceComplexity);
            map.put("fullExplanation", "Refer to standard patterns under " + topicName + ".");
            map.put("referenceSolution", "# Reference solution not available.");
            
            Map<String, Object> bruteMap = new LinkedHashMap<>();
            bruteMap.put("approach", data.brute);
            bruteMap.put("timeComplexity", data.timeComplexity.equals("O(N)") ? "O(N^2)" : "O(2^N)");
            bruteMap.put("spaceComplexity", "O(1)");
            map.put("bruteForce", bruteMap);
            
            map.put("better", null);
            
            Map<String, Object> optimalMap = new LinkedHashMap<>();
            optimalMap.put("approach", data.optimal);
            optimalMap.put("timeComplexity", data.timeComplexity);
            optimalMap.put("spaceComplexity", data.spaceComplexity);
            map.put("optimal", optimalMap);
            
            return mapper.writeValueAsString(map);
        } catch (Exception e) {
            return "{}";
        }
    }

    public static Map<String, String> getSimplifiedFallback(String name, String topicName) {
        FallbackProblemData data = getFallback(name, topicName);
        Map<String, String> res = new HashMap<>();
        res.put("simplifiedStatement", data.statement);
        res.put("simplifiedOptimal", data.optimal);
        res.put("simplifiedBetter", data.better);
        res.put("simplifiedBrute", data.brute);
        return res;
    }
}
