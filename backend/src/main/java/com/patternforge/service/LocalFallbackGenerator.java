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
        public String referenceSolution;

        public FallbackProblemData(String statement, String optimal, String better, String brute, String observation, String timeComplexity, String spaceComplexity) {
            this(statement, optimal, better, brute, observation, timeComplexity, spaceComplexity, "");
        }

        public FallbackProblemData(String statement, String optimal, String better, String brute, String observation, String timeComplexity, String spaceComplexity, String referenceSolution) {
            this.statement = statement;
            this.optimal = optimal;
            this.better = better;
            this.brute = brute;
            this.observation = observation;
            this.timeComplexity = timeComplexity;
            this.spaceComplexity = spaceComplexity;
            this.referenceSolution = referenceSolution;
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

        db.put("Sort an Array", new FallbackProblemData(
            "Sort an array of integers in ascending order using various standard sorting techniques (Selection, Bubble, Insertion, Merge, Quick, Heap).",
            "Implement and compare Merge Sort, Quick Sort, and Heap Sort for O(N log N) time complexity. Merge Sort uses divide-and-conquer with extra space. Quick Sort uses a partition pivot. Heap Sort uses a binary heap structure.",
            "",
            "Bubble Sort, Selection Sort, and Insertion Sort run in O(N^2) time by repeatedly swapping, selecting minimums, or shifting elements.",
            "Different sorting algorithms have different trade-offs. O(N^2) algorithms are simple but inefficient for large arrays. Merge Sort is stable but uses O(N) space. Quick Sort is in-place but has O(N^2) worst-case. Heap Sort is in-place and guaranteed O(N log N) but unstable.",
            "O(N log N)",
            "O(N)",
            "// 1. Selection Sort - O(N^2) Time, O(1) Space\nvoid selectionSort(vector<int>& arr) {\n    int n = arr.size();\n    for (int i = 0; i < n - 1; i++) {\n        int minIdx = i;\n        for (int j = i + 1; j < n; j++) {\n            if (arr[j] < arr[minIdx]) minIdx = j;\n        }\n        swap(arr[i], arr[minIdx]);\n    }\n}\n\n// 2. Bubble Sort - O(N^2) Time, O(1) Space\nvoid bubbleSort(vector<int>& arr) {\n    int n = arr.size();\n    for (int i = 0; i < n - 1; i++) {\n        bool swapped = false;\n        for (int j = 0; j < n - i - 1; j++) {\n            if (arr[j] > arr[j+1]) {\n                swap(arr[j], arr[j+1]);\n                swapped = true;\n            }\n        }\n        if (!swapped) break;\n    }\n}\n\n// 3. Insertion Sort - O(N^2) Time, O(1) Space\nvoid insertionSort(vector<int>& arr) {\n    int n = arr.size();\n    for (int i = 1; i < n; i++) {\n        int key = arr[i];\n        int j = i - 1;\n        while (j >= 0 && arr[j] > key) {\n            arr[j + 1] = arr[j];\n            j--;\n        }\n        arr[j + 1] = key;\n    }\n}\n\n// 4. Merge Sort - O(N log N) Time, O(N) Space\nvoid merge(vector<int>& arr, int l, int m, int r) {\n    vector<int> temp;\n    int i = l, j = m + 1;\n    while (i <= m && j <= r) {\n        if (arr[i] <= arr[j]) temp.push_back(arr[i++]);\n        else temp.push_back(arr[j++]);\n    }\n    while (i <= m) temp.push_back(arr[i++]);\n    while (j <= r) temp.push_back(arr[j++]);\n    for (int k = 0; k < temp.size(); k++) arr[l + k] = temp[k];\n}\nvoid mergeSort(vector<int>& arr, int l, int r) {\n    if (l >= r) return;\n    int m = l + (r - l) / 2;\n    mergeSort(arr, l, m);\n    mergeSort(arr, m + 1, r);\n    merge(arr, l, m, r);\n}\n\n// 5. Quick Sort - O(N log N) Time, O(log N) Space\nint partition(vector<int>& arr, int low, int high) {\n    int pivot = arr[high];\n    int i = low - 1;\n    for (int j = low; j < high; j++) {\n        if (arr[j] < pivot) {\n            i++;\n            swap(arr[i], arr[j]);\n        }\n    }\n    swap(arr[i + 1], arr[high]);\n    return i + 1;\n}\nvoid quickSort(vector<int>& arr, int low, int high) {\n    if (low < high) {\n        int pi = partition(arr, low, high);\n        quickSort(arr, low, pi - 1);\n        quickSort(arr, pi + 1, high);\n    }\n}\n\n// 6. Heap Sort - O(N log N) Time, O(1) Space\nvoid heapify(vector<int>& arr, int n, int i) {\n    int largest = i;\n    int l = 2 * i + 1;\n    int r = 2 * i + 2;\n    if (l < n && arr[l] > arr[largest]) largest = l;\n    if (r < n && arr[r] > arr[largest]) largest = r;\n    if (largest != i) {\n        swap(arr[i], arr[largest]);\n        heapify(arr, n, largest);\n    }\n}\nvoid heapSort(vector<int>& arr) {\n    int n = arr.size();\n    for (int i = n / 2 - 1; i >= 0; i--) heapify(arr, n, i);\n    for (int i = n - 1; i > 0; i--) {\n        swap(arr[0], arr[i]);\n        heapify(arr, i, 0);\n    }\n}"
        ));

        db.put("Valid Parentheses", new FallbackProblemData(
            "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid. An input string is valid if open brackets are closed by the same type of brackets, open brackets are closed in the correct order, and every close bracket has a corresponding open bracket of the same type.",
            "Use a stack to store opening brackets. Iterate through the string character by character. For each opening bracket, push it onto the stack. For each closing bracket, check if the stack is empty or if the top of the stack is not of the matching opening type. If so, return false. Otherwise, pop the opening bracket. At the end, return true if the stack is empty.",
            "",
            "Repeatedly replace adjacent matching bracket pairs (i.e. '()', '[]', '{}') with empty strings until no more replacements can be made. If the final string is empty, it is valid. This takes O(N^2) time due to string shifting on replacements.",
            "Brackets must be closed in the reverse order of their opening. This Last-In-First-Out (LIFO) property maps perfectly to a stack. The top of the stack always represents the most recent unmatched opening bracket.",
            "O(N)",
            "O(N)",
            "#include <string>\n#include <stack>\nusing namespace std;\n\nclass Solution {\npublic:\n    bool isValid(string s) {\n        stack<char> st;\n        for (char c : s) {\n            if (c == '(' || c == '{' || c == '[') {\n                st.push(c);\n            } else {\n                if (st.empty()) return false;\n                if (c == ')' && st.top() != '(') return false;\n                if (c == '}' && st.top() != '{') return false;\n                if (c == ']' && st.top() != '[') return false;\n                st.pop();\n            }\n        }\n        return st.empty();\n    }\n};"
        ));

        db.put("Edit Distance", new FallbackProblemData(
            "Given two strings word1 and word2, return the minimum number of operations required to convert word1 to word2. You have the following three operations permitted on a word: Insert a character, Delete a character, Replace a character.",
            "Use a 2D Dynamic Programming table dp[m+1][n+1], where dp[i][j] represents the minimum edit distance between word1[0...i-1] and word2[0...j-1]. If word1[i-1] == word2[j-1], then dp[i][j] = dp[i-1][j-1]. Otherwise, dp[i][j] = 1 + min({dp[i-1][j] (delete), dp[i][j-1] (insert), dp[i-1][j-1] (replace)}). Base cases are dp[i][0] = i and dp[0][j] = j.",
            "",
            "Use a recursive function solve(i, j) that tries all three operations for mismatched characters and returns the minimum path. Without memoization, this runs in exponential O(3^(M+N)) time.",
            "We solve the edit distance by finding subproblems matching prefixes of both words. Since subproblems overlap, we can memoize the results. The 2D table can be optimized to 1D space since we only need the current and previous row to compute updates.",
            "O(M * N)",
            "O(M * N)",
            "#include <string>\n#include <vector>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    int minDistance(string word1, string word2) {\n        int m = word1.length();\n        int n = word2.length();\n        vector<vector<int>> dp(m + 1, vector<int>(n + 1, 0));\n        \n        for (int i = 0; i <= m; i++) dp[i][0] = i;\n        for (int j = 0; j <= n; j++) dp[0][j] = j;\n        \n        for (int i = 1; i <= m; i++) {\n            for (int j = 1; j <= n; j++) {\n                if (word1[i-1] == word2[j-1]) {\n                    dp[i][j] = dp[i-1][j-1];\n                } else {\n                    dp[i][j] = 1 + min({dp[i-1][j],    // Delete\n                                        dp[i][j-1],    // Insert\n                                        dp[i-1][j-1]}); // Replace\n                } \n            }\n        }\n        return dp[m][n];\n    }\n};"
        ));

        db.put("Kth Largest Element in a Stream", new FallbackProblemData(
            "Design a class to find the kth largest element in a stream. Note that it is the kth largest element in the sorted order, not the kth distinct element. Implement the KthLargest class: KthLargest(int k, int[] nums) Initializes the object with the integer k and the stream of integers nums. int add(int val) Appends the integer val to the stream and returns the element representing the kth largest element in the stream.",
            "Use a Min-Heap (priority_queue in C++) of maximum size k. The heap will store the k largest elements seen so far. When adding a new value, push it to the heap. If the heap size exceeds k, pop the smallest element. The top of the min-heap will always represent the kth largest element.",
            "",
            "Store all numbers in a dynamic array. Each time add() is called, append the value, sort the entire array in descending order, and return the element at index k-1. This takes O(N log N) per insertion.",
            "We only care about the k largest elements, not the rest. A min-heap allows us to efficiently keep track of the k largest elements. The smallest of these k elements (the heap root) is the kth largest overall. Inserting into a heap of size k takes O(log k) time.",
            "O(log k) per add()",
            "O(k)",
            "#include <vector>\n#include <queue>\nusing namespace std;\n\nclass KthLargest {\nprivate:\n    priority_queue<int, vector<int>, greater<int>> minHeap;\n    int kSize;\n\npublic:\n    KthLargest(int k, vector<int>& nums) {\n        kSize = k;\n        for (int num : nums) {\n            add(num);\n        }\n    }\n    \n    int add(int val) {\n        minHeap.push(val);\n        if (minHeap.size() > kSize) {\n            minHeap.pop();\n        }\n        return minHeap.top();\n    }\n};"
        ));
    }

    public static FallbackProblemData getFallback(String name, String topicName) {
        if (db.containsKey(name)) {
            return db.get(name);
        }
        // Generic fallback based on topicName
        String statement = "Analyze and implement the algorithm for " + name + ".";
        String optimal = "Apply key algorithmic techniques under the " + topicName + " category to process inputs efficiently.";
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
            map.put("referenceSolution", (data.referenceSolution != null && !data.referenceSolution.isEmpty()) ? data.referenceSolution : "# Reference solution not available.");
            
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

    public static boolean isBoilerplateSimplifiedApproach(String str) {
        if (str == null || str.trim().isEmpty() || "{}".equals(str.trim())) return true;
        String lower = str.toLowerCase().trim();
        return lower.contains("optimal solution using standard categories") ||
               lower.contains("optimal solution using standard patterns") ||
               lower.contains("short optimal strategy") ||
               lower.equals("optimal solution using standard patterns.") ||
               lower.equals("optimal solution using standard categories.") ||
               lower.equals("short optimal strategy.");
    }

    public static boolean isBoilerplateSimplifiedStatement(String str) {
        if (str == null || str.trim().isEmpty()) return true;
        String lower = str.toLowerCase();
        return lower.contains("please solve ") ||
               lower.contains("solve the coding puzzle for") ||
               lower.contains("solve the puzzle in brief");
    }

    public static boolean isBoilerplateSolutionDetails(String str) {
        if (str == null || str.trim().isEmpty() || "{}".equals(str.trim())) return true;
        String lower = str.toLowerCase();
        return lower.contains("ai solution details unavailable") ||
               lower.contains("ai details not available") ||
               lower.contains("refer to standard patterns under") ||
               lower.contains("analyze the problem constraints and identify");
    }

    public static boolean isBoilerplateBasicDetails(String str) {
        if (str == null || str.trim().isEmpty() || "{}".equals(str.trim())) return true;
        String lower = str.toLowerCase();
        return lower.contains("problem details not loaded") ||
               lower.contains("please refer to leetcode") ||
               lower.contains("standard parameters as defined in") ||
               lower.contains("expected optimal output type") ||
               lower.contains("standard leetcode constraints") ||
               lower.contains("analyze and implement the algorithm for") ||
               (lower.contains("problem: ") && lower.contains("(leetcode #"));
    }
}
