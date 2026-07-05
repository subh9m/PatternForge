import problemsSeed from '../problems_seed.json';

let unauthorizedListener: (() => void) | null = null;

export const setUnauthorizedListener = (listener: () => void) => {
  unauthorizedListener = listener;
};

// Types matching backend models
interface User {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
}

interface Attempt {
  userId: string;
  problemId: string;
  status: 'SOLVED' | 'ATTEMPTED' | 'WRONG' | 'UNSOLVED';
  approachSaved: boolean;
  codeSaved: boolean;
  lastAttemptedAt?: string;
  confidenceRating?: number;
  isFavorite: boolean;
  needRevision: boolean;
  revisionLevel: number;
  nextRevisionDate?: string;
  timeTaken: number;
  hintsUsed: number;
  wrongAttemptsCount: number;
  approach?: string;
  codeTemplate?: string;
  thinkingChecked?: boolean;
}

interface Submission {
  id: string;
  userId: string;
  problemId: string;
  status: string; // "SUBMIT_SUCCESS", "COMPILE_ERROR", "WRONG_ANSWER"
  code: string;
  language: string;
  createdAt: string;
}

interface UserSettings {
  theme: 'dark' | 'light';
  geminiApiKey: string;
  preferredLanguage: string;
  codingLevel: string;
  dailyGoal: number;
}

// Local Storage helper utilities
function getLocalItem<T>(key: string, defaultValue: T): T {
  const item = localStorage.getItem(key);
  try {
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    return defaultValue;
  }
}

function setLocalItem<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

// Initialise default user credentials on load (subham / password123)
const initializeDatabase = () => {
  const users = getLocalItem<User[]>('pf_users', []);
  if (users.length === 0) {
    users.push({
      id: 'demo-user-id',
      username: 'subham',
      email: 'subham@gmail.com',
      passwordHash: 'password123'
    });
    setLocalItem('pf_users', users);
  }
};
initializeDatabase();

// Helper to estimate difficulty dynamically from topic information
function getDifficultyEstimate(topicName: string, topicNumber: number): 'EASY' | 'MEDIUM' | 'HARD' {
  switch (topicName) {
    case 'Basics':
      return 'EASY';
    case 'Sorting Techniques':
      return topicNumber <= 5 ? 'EASY' : (topicNumber <= 12 ? 'MEDIUM' : 'HARD');
    case 'Arrays':
      return topicNumber <= 25 ? 'EASY' : (topicNumber <= 60 ? 'MEDIUM' : 'HARD');
    case 'Binary Search':
      return topicNumber <= 12 ? 'EASY' : (topicNumber <= 30 ? 'MEDIUM' : 'HARD');
    case 'Strings':
      return topicNumber <= 15 ? 'EASY' : (topicNumber <= 35 ? 'MEDIUM' : 'HARD');
    case 'Linked List':
      return topicNumber <= 10 ? 'EASY' : (topicNumber <= 30 ? 'MEDIUM' : 'HARD');
    case 'Recursion & Backtracking':
      return topicNumber <= 8 ? 'EASY' : (topicNumber <= 28 ? 'MEDIUM' : 'HARD');
    case 'Bit Manipulation':
      return topicNumber <= 8 ? 'EASY' : (topicNumber <= 18 ? 'MEDIUM' : 'HARD');
    case 'Stacks and Queues':
      return topicNumber <= 10 ? 'EASY' : (topicNumber <= 28 ? 'MEDIUM' : 'HARD');
    case 'Sliding Window & Two Pointers':
      return topicNumber <= 5 ? 'EASY' : (topicNumber <= 22 ? 'MEDIUM' : 'HARD');
    case 'Heaps':
      return topicNumber <= 6 ? 'EASY' : (topicNumber <= 18 ? 'MEDIUM' : 'HARD');
    case 'Greedy Algorithms':
      return topicNumber <= 8 ? 'EASY' : (topicNumber <= 20 ? 'MEDIUM' : 'HARD');
    case 'Binary Trees':
      return topicNumber <= 15 ? 'EASY' : (topicNumber <= 38 ? 'MEDIUM' : 'HARD');
    case 'Binary Search Trees':
      return topicNumber <= 8 ? 'EASY' : (topicNumber <= 20 ? 'MEDIUM' : 'HARD');
    case 'Graphs':
      return topicNumber <= 10 ? 'EASY' : (topicNumber <= 45 ? 'MEDIUM' : 'HARD');
    case 'Dynamic Programming':
      return topicNumber <= 15 ? 'EASY' : (topicNumber <= 60 ? 'MEDIUM' : 'HARD');
    case 'Tries':
      return topicNumber <= 5 ? 'EASY' : (topicNumber <= 15 ? 'MEDIUM' : 'HARD');
    default:
      return 'MEDIUM';
  }
}

// Get the authenticated user ID. Throws 401 redirect if not found
const getActiveUserId = (): string => {
  const token = localStorage.getItem('token');
  if (!token) {
    if (unauthorizedListener) {
      unauthorizedListener();
    }
    throw new Error('Session expired or unauthorized');
  }
  const users = getLocalItem<User[]>('pf_users', []);
  const userExists = users.some(u => u.id === token);
  if (!userExists) {
    localStorage.removeItem('token');
    if (unauthorizedListener) {
      unauthorizedListener();
    }
    throw new Error('Session expired or unauthorized');
  }
  return token;
};

// Retrieve user attempt for a specific problem (or initialize a default empty state)
function getProblemAttempt(userId: string, problemId: string): Attempt {
  const attempts = getLocalItem<Attempt[]>('pf_attempts', []);
  let attempt = attempts.find(a => a.userId === userId && a.problemId === problemId);
  if (!attempt) {
    attempt = {
      userId,
      problemId,
      status: 'UNSOLVED',
      approachSaved: false,
      codeSaved: false,
      isFavorite: false,
      needRevision: false,
      revisionLevel: 0,
      timeTaken: 0,
      hintsUsed: 0,
      wrongAttemptsCount: 0
    };
  }
  return attempt;
}

// Save or update user attempt
function saveProblemAttempt(attempt: Attempt): void {
  const attempts = getLocalItem<Attempt[]>('pf_attempts', []);
  const idx = attempts.findIndex(a => a.userId === attempt.userId && a.problemId === attempt.problemId);
  if (idx > -1) {
    attempts[idx] = attempt;
  } else {
    attempts.push(attempt);
  }
  setLocalItem('pf_attempts', attempts);
}

// Calculate current streak dynamically based on activity
function calculateUserStreak(userId: string): number {
  const submissions = getLocalItem<Submission[]>('pf_submissions', []);
  const userSubs = submissions.filter(s => s.userId === userId);
  
  const attempts = getLocalItem<Attempt[]>('pf_attempts', []);
  const userAttempts = attempts.filter(a => a.userId === userId);

  const datesSet = new Set<string>();
  userSubs.forEach(s => {
    datesSet.add(s.createdAt.split('T')[0]);
  });
  userAttempts.forEach(a => {
    if (a.lastAttemptedAt) {
      datesSet.add(a.lastAttemptedAt.split('T')[0]);
    }
  });

  const uniqueDates = Array.from(datesSet).map(d => new Date(d));
  if (uniqueDates.length === 0) return 0;

  // Sort descending (latest date first)
  uniqueDates.sort((a, b) => b.getTime() - a.getTime());

  const today = new Date();
  today.setHours(0,0,0,0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const firstDate = uniqueDates[0];
  firstDate.setHours(0,0,0,0);

  // If the last activity date is older than yesterday, streak is broken
  if (firstDate.getTime() < yesterday.getTime()) {
    return 0;
  }

  let streak = 1;
  let currentRef = firstDate;

  for (let i = 1; i < uniqueDates.length; i++) {
    const prevDate = new Date(currentRef);
    prevDate.setDate(prevDate.getDate() - 1);
    prevDate.setHours(0,0,0,0);

    const checkDate = uniqueDates[i];
    checkDate.setHours(0,0,0,0);

    if (checkDate.getTime() === prevDate.getTime()) {
      streak++;
      currentRef = checkDate;
    } else if (checkDate.getTime() < prevDate.getTime()) {
      break; // Gap found, streak ends
    }
  }

  return streak;
}

// Dynamic Mock Router Engine
export const _mockRouter = async (method: 'GET' | 'POST' | 'PUT', url: string, body?: any): Promise<any> => {
  // Add a small artificial network latency (50ms) to feel realistic
  await new Promise(resolve => setTimeout(resolve, 50));

  const parsedUrl = new URL(url, 'http://localhost');
  const path = parsedUrl.pathname;

  // ------------------ AUTH ENDPOINTS ------------------
  if (path === '/api/auth/register' && method === 'POST') {
    const { username, email, password } = body;
    const users = getLocalItem<User[]>('pf_users', []);
    
    if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
      throw new Error('Username already exists');
    }
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('Email already exists');
    }

    const newUser: User = {
      id: 'usr-' + Math.random().toString(36).substring(2, 11),
      username,
      email,
      passwordHash: password
    };
    users.push(newUser);
    setLocalItem('pf_users', users);
    
    localStorage.setItem('token', newUser.id);
    return { token: newUser.id, username: newUser.username, userId: newUser.id, email: newUser.email };
  }

  if (path === '/api/auth/login' && method === 'POST') {
    const { username, password } = body; // username can be email or username
    const users = getLocalItem<User[]>('pf_users', []);
    
    const user = users.find(u => 
      u.username.toLowerCase() === username.toLowerCase() || 
      u.email.toLowerCase() === username.toLowerCase()
    );

    if (!user || user.passwordHash !== password) {
      throw new Error('Invalid username or password');
    }

    localStorage.setItem('token', user.id);
    return { token: user.id, username: user.username, userId: user.id, email: user.email };
  }

  if (path === '/api/auth/me' && method === 'GET') {
    const userId = getActiveUserId();
    const users = getLocalItem<User[]>('pf_users', []);
    const user = users.find(u => u.id === userId);
    return { username: user!.username, userId: user!.id, email: user!.email };
  }

  // ------------------ AUTHORIZED ENDPOINTS ------------------
  const userId = getActiveUserId();

  // ------------------ SETTINGS ENDPOINTS ------------------
  if (path === '/api/settings' && method === 'GET') {
    const allSettings = getLocalItem<Record<string, UserSettings>>('pf_settings', {});
    if (!allSettings[userId]) {
      allSettings[userId] = {
        theme: 'dark',
        geminiApiKey: '',
        preferredLanguage: 'cpp',
        codingLevel: 'INTERMEDIATE',
        dailyGoal: 3
      };
      setLocalItem('pf_settings', allSettings);
    }
    return allSettings[userId];
  }

  if (path === '/api/settings' && method === 'PUT') {
    const allSettings = getLocalItem<Record<string, UserSettings>>('pf_settings', {});
    allSettings[userId] = { ...allSettings[userId], ...body };
    setLocalItem('pf_settings', allSettings);
    return allSettings[userId];
  }

  // ------------------ PROBLEMS ENDPOINTS ------------------
  if (path === '/api/problems' && method === 'GET') {
    const attempts = getLocalItem<Attempt[]>('pf_attempts', []).filter(a => a.userId === userId);
    const attemptMap = new Map(attempts.map(a => [a.problemId, a]));

    return problemsSeed.map(p => {
      const probId = 'prob-' + p.masterNumber;
      const att = attemptMap.get(probId);
      return {
        id: probId,
        masterNumber: p.masterNumber,
        topicNumber: p.topicNumber,
        leetcodeNumber: String(p.leetcodeNumber),
        name: p.name,
        topicName: p.topicName,
        difficulty: getDifficultyEstimate(p.topicName, p.topicNumber),
        status: att ? att.status : 'UNSOLVED',
        isFavorite: att ? att.isFavorite : false,
        needRevision: att ? att.needRevision : false,
        confidenceRating: att ? att.confidenceRating || 0 : 0,
        approachSaved: att ? att.approachSaved : false
      };
    });
  }

  if (path === '/api/problems/topics' && method === 'GET') {
    const attempts = getLocalItem<Attempt[]>('pf_attempts', []).filter(a => a.userId === userId);
    const attemptMap = new Map(attempts.map(a => [a.problemId, a]));

    // Group seed problems by topicName
    const groups: Record<string, { total: number; solved: number; attempted: number }> = {};
    
    problemsSeed.forEach(p => {
      const probId = 'prob-' + p.masterNumber;
      const att = attemptMap.get(probId);
      if (!groups[p.topicName]) {
        groups[p.topicName] = { total: 0, solved: 0, attempted: 0 };
      }
      groups[p.topicName].total++;
      if (att) {
        if (att.status === 'SOLVED') {
          groups[p.topicName].solved++;
        } else if (att.status === 'ATTEMPTED' || att.status === 'WRONG') {
          groups[p.topicName].attempted++;
        }
      }
    });

    return Object.entries(groups).map(([name, stats]) => ({
      id: 'topic-' + name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      name,
      slug: name.toLowerCase().replaceAll(' ', '-'),
      total: stats.total,
      solved: stats.solved,
      attempted: stats.attempted,
      remaining: stats.total - stats.solved
    }));
  }

  // Random problem selector
  if (path === '/api/problems/random' && method === 'GET') {
    const type = parsedUrl.searchParams.get('type') || 'ALL';
    const attempts = getLocalItem<Attempt[]>('pf_attempts', []).filter(a => a.userId === userId);
    const attemptMap = new Map(attempts.map(a => [a.problemId, a]));

    const candidates = problemsSeed.map(p => {
      const probId = 'prob-' + p.masterNumber;
      const att = attemptMap.get(probId);
      return {
        id: probId,
        masterNumber: p.masterNumber,
        topicNumber: p.topicNumber,
        leetcodeNumber: String(p.leetcodeNumber),
        name: p.name,
        topicName: p.topicName,
        difficulty: getDifficultyEstimate(p.topicName, p.topicNumber),
        status: att ? att.status : 'UNSOLVED',
        isFavorite: att ? att.isFavorite : false,
        needRevision: att ? att.needRevision : false,
        confidenceRating: att ? att.confidenceRating || 0 : 0,
        approachSaved: att ? att.approachSaved : false
      };
    });

    const filtered = candidates.filter(p => {
      switch (type.toUpperCase()) {
        case 'EASY':
          return p.difficulty === 'EASY';
        case 'MEDIUM':
          return p.difficulty === 'MEDIUM';
        case 'HARD':
          return p.difficulty === 'HARD';
        case 'SOLVED':
          return p.status === 'SOLVED';
        case 'UNSOLVED':
          return p.status === 'UNSOLVED';
        case 'REVISION':
          return p.needRevision;
        default:
          return true;
      }
    });

    const chosenList = filtered.length > 0 ? filtered : candidates;
    const randomItem = chosenList[Math.floor(Math.random() * chosenList.length)];
    return randomItem;
  }

  if (path === '/api/problems/import-status' && method === 'GET') {
    return { totalProblems: 626, importedProblems: 626, status: 'SYNCED' };
  }

  // Helper to generate brute force, better, and optimal reference solutions
  function generateReferenceSolutions(p: any) {
    const topic = p.topicName || 'General';
    const name = p.name || 'Problem';

    let bruteForceApproach = '';
    let bruteForceTime = 'O(N²)';
    let bruteForceSpace = 'O(1)';
    let bruteForceCpp = '';
    let bruteForceJava = '';

    let betterApproach = '';
    let betterTime = 'O(N)';
    let betterSpace = 'O(N)';
    let betterCpp = '';
    let betterJava = '';

    let optimalApproach = '';
    let optimalTime = 'O(N)';
    let optimalSpace = 'O(1)';
    let optimalCpp = '';
    let optimalJava = '';

    if (topic === 'Basics' || topic === 'Arrays' || topic === 'Sorting') {
      bruteForceApproach = `**Brute Force approach for "${name}"**:\nUse nested loops to check all possible pairs or subarrays in the input, resolving the condition directly.\n\n- Time Complexity: O(N²)\n- Space Complexity: O(1)`;
      bruteForceCpp = `// Brute Force C++ Solution\nclass Solution {\npublic:\n    int solve(vector<int>& nums) {\n        int n = nums.size();\n        int result = 0;\n        for (int i = 0; i < n; i++) {\n            for (int j = i + 1; j < n; j++) {\n                // Nested comparison logic\n            }\n        }\n        return result;\n    }\n};`;
      bruteForceJava = `// Brute Force Java Solution\nclass Solution {\n    public int solve(int[] nums) {\n        int n = nums.length;\n        int result = 0;\n        for (int i = 0; i < n; i++) {\n            for (int j = i + 1; j < n; j++) {\n                // Nested comparison logic\n            }\n        }\n        return result;\n    }\n}`;

      betterApproach = `**Better approach for "${name}"**:\nSort the array first. Sorting simplifies the comparisons, allowing you to resolve search queries in O(N log N) time using binary search or single-pass traversal.\n\n- Time Complexity: O(N log N)\n- Space Complexity: O(log N) or O(N) depending on sort algorithm`;
      betterTime = 'O(N log N)';
      betterSpace = 'O(log N)';
      betterCpp = `// Better C++ Solution (Sorting)\nclass Solution {\npublic:\n    int solve(vector<int>& nums) {\n        sort(nums.begin(), nums.end());\n        int result = 0;\n        // Single pass scanning\n        return result;\n    }\n};`;
      betterJava = `// Better Java Solution (Sorting)\nimport java.util.Arrays;\nclass Solution {\n    public int solve(int[] nums) {\n        Arrays.sort(nums);\n        int result = 0;\n        // Single pass scanning\n        return result;\n    }\n}`;

      optimalApproach = `**Optimal approach for "${name}"**:\nUse a Hash Map or Hash Set to store previously seen values. This allows finding target complements in a single O(N) pass with O(N) auxiliary space, or if space optimization is needed, use two-pointers on pre-sorted configurations.\n\n- Time Complexity: O(N)\n- Space Complexity: O(N) (or O(1) if sorting in place)`;
      optimalCpp = `// Optimal C++ Solution (Hashing / Hash Map)\n#include <unordered_map>\nclass Solution {\npublic:\n    int solve(vector<int>& nums) {\n        unordered_map<int, int> seen;\n        for (int i = 0; i < nums.size(); i++) {\n            // Optimal O(N) complement matching logic\n            seen[nums[i]] = i;\n        }\n        return 0;\n    }\n};`;
      optimalJava = `// Optimal Java Solution (Hashing / Hash Map)\nimport java.util.HashMap;\nclass Solution {\n    public int solve(int[] nums) {\n        HashMap<Integer, Integer> seen = new HashMap<>();\n        for (int i = 0; i < nums.length; i++) {\n            // Optimal O(N) complement matching logic\n            seen.put(nums[i], i);\n        }\n        return 0;\n    }\n}`;
    } else if (topic.includes('Two Pointers') || topic.includes('Sliding Window')) {
      bruteForceApproach = `**Brute Force approach for "${name}"**:\nCheck all possible subarrays or substrings using nested loops to evaluate the window constraint. This results in quadratic complexity.\n\n- Time Complexity: O(N²)\n- Space Complexity: O(1)`;
      bruteForceCpp = `// Brute Force C++ Solution\nclass Solution {\npublic:\n    int solve(string s) {\n        int n = s.length(), maxLen = 0;\n        for (int i = 0; i < n; i++) {\n            for (int j = i; j < n; j++) {\n                // Evaluate subarray/substring constraint\n            }\n        }\n        return maxLen;\n    }\n};`;
      bruteForceJava = `// Brute Force Java Solution\nclass Solution {\n    public int solve(String s) {\n        int n = s.length(), maxLen = 0;\n        for (int i = 0; i < n; i++) {\n            for (int j = i; j < n; j++) {\n                // Evaluate subarray/substring constraint\n            }\n        }\n        return maxLen;\n    }\n}`;

      betterApproach = `**Better approach for "${name}"**:\nUse a sliding window with a frequency map/set, but shrink the left pointer step-by-step in a nested loop. This ensures we don't recalculate the entire window from scratch.\n\n- Time Complexity: O(N)\n- Space Complexity: O(K) where K is size of character set`;
      betterTime = 'O(N)';
      betterSpace = 'O(K)';
      betterCpp = `// Better C++ Solution (Sliding Window)\n#include <unordered_set>\nclass Solution {\npublic:\n    int solve(string s) {\n        unordered_set<char> set;\n        int l = 0, r = 0, res = 0;\n        while (r < s.length()) {\n            while (set.count(s[r])) {\n                set.erase(s[l++]);\n            }\n            set.insert(s[r++]);\n            res = max(res, r - l);\n        }\n        return res;\n    }\n};`;
      betterJava = `// Better Java Solution (Sliding Window)\nimport java.util.HashSet;\nclass Solution {\n    public int solve(String s) {\n        HashSet<Character> set = new HashSet<>();\n        int l = 0, r = 0, res = 0;\n        while (r < s.length()) {\n            while (set.contains(s.charAt(r))) {\n                set.remove(s.charAt(l++));\n            }\n            set.add(s.charAt(r++));\n            res = Math.max(res, r - l);\n        }\n        return res;\n    }\n}`;

      optimalApproach = `**Optimal approach for "${name}"**:\nUse an optimized sliding window using a direct access array or map that records the last index of each element. This allows the left pointer to jump directly without step-by-step shrinking.\n\n- Time Complexity: O(N) (Single Pass)\n- Space Complexity: O(K) (Alphabet size)`;
      optimalCpp = `// Optimal C++ Solution (Jump-optimized Sliding Window)\n#include <vector>\nclass Solution {\npublic:\n    int solve(string s) {\n        vector<int> lastIdx(256, -1);\n        int l = 0, res = 0;\n        for (int r = 0; r < s.length(); r++) {\n            if (lastIdx[s[r]] >= l) {\n                l = lastIdx[s[r]] + 1;\n            }\n            lastIdx[s[r]] = r;\n            res = max(res, r - l + 1);\n        }\n        return res;\n    }\n};`;
      optimalJava = `// Optimal Java Solution (Jump-optimized Sliding Window)\nimport java.util.Arrays;\nclass Solution {\n    public int solve(String s) {\n        int[] lastIdx = new int[256];\n        Arrays.fill(lastIdx, -1);\n        int l = 0, res = 0;\n        for (int r = 0; r < s.length(); r++) {\n            if (lastIdx[s.charAt(r)] >= l) {\n                l = lastIdx[s.charAt(r)] + 1;\n            }\n            lastIdx[s.charAt(r)] = r;\n            res = Math.max(res, r - l + 1);\n        }\n        return res;\n    }\n}`;
    } else if (topic.includes('Dynamic Programming') || topic.includes('BST') || topic.includes('Trees')) {
      bruteForceApproach = `**Brute Force approach for "${name}"**:\nUse recursive backtracking to explore all options. In tree nodes or grid paths, this results in exponential time complexity as subproblems are computed repeatedly.\n\n- Time Complexity: O(2^N) or O(3^N)\n- Space Complexity: O(N) recursion stack`;
      bruteForceTime = 'O(2^N)';
      bruteForceSpace = 'O(N)';
      bruteForceCpp = `// Brute Force C++ (Exponential Recursion)\nclass Solution {\npublic:\n    int solve(int n) {\n        if (n <= 1) return n;\n        return solve(n - 1) + solve(n - 2); // Overlapping subproblems\n    }\n};`;
      bruteForceJava = `// Brute Force Java (Exponential Recursion)\nclass Solution {\n    public int solve(int n) {\n        if (n <= 1) return n;\n        return solve(n - 1) + solve(n - 2);\n    }\n}`;

      betterApproach = `**Better approach for "${name}"**:\nUse Top-Down Dynamic Programming (Memoization) or Bottom-Up Dynamic Programming (Tabulation). By storing results of subproblems in an array/table, we reduce duplicate computations.\n\n- Time Complexity: O(N)\n- Space Complexity: O(N) (For the cache array/table)`;
      betterTime = 'O(N)';
      betterSpace = 'O(N)';
      betterCpp = `// Better C++ (DP Tabulation / Memoization)\n#include <vector>\nclass Solution {\npublic:\n    int solve(int n) {\n        if (n <= 1) return n;\n        vector<int> dp(n + 1);\n        dp[0] = 0; dp[1] = 1;\n        for (int i = 2; i <= n; i++) {\n            dp[i] = dp[i-1] + dp[i-2];\n        }\n        return dp[n];\n    }\n};`;
      betterJava = `// Better Java (DP Tabulation)\nclass Solution {\n    public int solve(int n) {\n        if (n <= 1) return n;\n        int[] dp = new int[n + 1];\n        dp[0] = 0; dp[1] = 1;\n        for (int i = 2; i <= n; i++) {\n            dp[i] = dp[i-1] + dp[i-2];\n        }\n        return dp[n];\n    }\n}`;

      optimalApproach = `**Optimal approach for "${name}"**:\nSpace-optimized dynamic programming. Since we only need values from the last few steps, we can discard the entire table and use variables to maintain states, reducing auxiliary space to O(1).\n\n- Time Complexity: O(N)\n- Space Complexity: O(1)`;
      optimalCpp = `// Optimal C++ (Space-Optimized DP)\nclass Solution {\npublic:\n    int solve(int n) {\n        if (n <= 1) return n;\n        int prev2 = 0, prev1 = 1;\n        for (int i = 2; i <= n; i++) {\n            int curr = prev1 + prev2;\n            prev2 = prev1;\n            prev1 = curr;\n        }\n        return prev1;\n    }\n};`;
      optimalJava = `// Optimal Java (Space-Optimized DP)\nclass Solution {\n    public int solve(int n) {\n        if (n <= 1) return n;\n        int prev2 = 0, prev1 = 1;\n        for (int i = 2; i <= n; i++) {\n            int curr = prev1 + prev2;\n            prev2 = prev1;\n            prev1 = curr;\n        }\n        return prev1;\n    }\n}`;
    } else {
      // Default fallback
      bruteForceApproach = `**Brute Force approach for "${name}"**:\nSolve using recursive backtracking or nested iterations checking all possible solutions.\n\n- Time Complexity: O(N²)\n- Space Complexity: O(1)`;
      bruteForceCpp = `// Brute Force C++ Solution\nclass Solution {\npublic:\n    void solve() {\n        // Brute force logic\n    }\n};`;
      bruteForceJava = `// Brute Force Java Solution\nclass Solution {\n    public void solve() {\n        // Brute force logic\n    }\n}`;

      betterApproach = `**Better approach for "${name}"**:\nUse pre-sorting or hash-maps to search and index values to avoid duplicate lookups.\n\n- Time Complexity: O(N log N)\n- Space Complexity: O(N)`;
      betterTime = 'O(N log N)';
      betterSpace = 'O(N)';
      betterCpp = `// Better C++ Solution\nclass Solution {\npublic:\n    void solve() {\n        // Better logic using Hash Map or sorting\n    }\n};`;
      betterJava = `// Better Java Solution\nclass Solution {\n    public void solve() {\n        // Better logic using Hash Map or sorting\n    }\n}`;

      optimalApproach = `**Optimal approach for "${name}"**:\nImplement the most efficient, space-optimized linear traversal or mathematical derivation to solve in a single pass.\n\n- Time Complexity: O(N)\n- Space Complexity: O(1)`;
      optimalCpp = `// Optimal C++ Solution\nclass Solution {\npublic:\n    void solve() {\n        // Optimal linear logic\n    }\n};`;
      optimalJava = `// Optimal Java Solution\nclass Solution {\n    public void solve() {\n        // Optimal linear logic\n    }\n}`;
    }

    return {
      optimalTimeComplexity: optimalTime,
      optimalSpaceComplexity: optimalSpace,
      approach: optimalApproach,
      fullExplanation: `### Detailed Explanation of "${name}"\n\n1. **Brute Force**: Attempt to search all paths/pairs. Run time is ${bruteForceTime}.\n2. **Better**: Reduce lookup times using caching or sorting. Runs in ${betterTime}.\n3. **Optimal**: Single scan with optimal pointers/hashing. Runs in ${optimalTime} and takes ${optimalSpace} space.`,
      referenceSolution: optimalCpp,
      referenceSolutions: {
        cpp: optimalCpp,
        java: optimalJava
      },
      bruteForce: {
        approach: bruteForceApproach,
        timeComplexity: bruteForceTime,
        spaceComplexity: bruteForceSpace,
        code: {
          cpp: bruteForceCpp,
          java: bruteForceJava
        }
      },
      better: {
        approach: betterApproach,
        timeComplexity: betterTime,
        spaceComplexity: betterSpace,
        code: {
          cpp: betterCpp,
          java: betterJava
        }
      },
      optimal: {
        approach: optimalApproach,
        timeComplexity: optimalTime,
        spaceComplexity: optimalSpace,
        code: {
          cpp: optimalCpp,
          java: optimalJava
        }
      }
    };
  }

  // ------------------ SPECIFIC PROBLEM PARAM MATCHERS ------------------
  const problemMatch = path.match(/^\/api\/problems\/(prob-\d+)(?:\/(\w+-?\w+))?$/);
  if (problemMatch) {
    const problemId = problemMatch[1];
    const subRoute = problemMatch[2]; // "notes", "bookmark", "revision", "run", "submit", "check-thinking", "reattempt", "toggle-completed", "details"

    const seedIdx = parseInt(problemId.split('-')[1]) - 1;
    const p = problemsSeed[seedIdx];
    if (!p) throw new Error('Problem not found');

    const attempt = getProblemAttempt(userId, problemId);

    if (!subRoute) {
      if (method === 'GET') {
        return {
          id: problemId,
          masterNumber: p.masterNumber,
          topicNumber: p.topicNumber,
          leetcodeNumber: String(p.leetcodeNumber),
          name: p.name,
          topicName: p.topicName,
          difficulty: getDifficultyEstimate(p.topicName, p.topicNumber),
          status: attempt.status,
          isFavorite: attempt.isFavorite,
          needRevision: attempt.needRevision,
          confidenceRating: attempt.confidenceRating || 0,
          approachSaved: attempt.approachSaved
        };
      }
    }

    if (subRoute === 'details' && method === 'GET') {
      const refSols = generateReferenceSolutions(p);
      return {
        problemStatement: `Implement code for ${p.name}. (LeetCode Problem #${p.leetcodeNumber}).\n\nGiven the constraints and description from LeetCode, write an optimal implementation matching the topics of ${p.topicName}.`,
        inputFormat: 'Standard LeetCode function signature format.',
        outputFormat: 'Standard LeetCode target return types.',
        examples: [
          {
            input: 'Sample inputs as defined by LeetCode description.',
            output: 'Sample output.',
            explanation: 'Dry run logic summary.'
          }
        ],
        constraints: ['Standard runtime constraint < 1s', 'Memory limit 256MB'],
        edgeCases: ['Empty inputs or null node references', 'Out of bounds values', 'Single element vectors'],
        followUp: 'Can you solve this with O(1) auxiliary space and linear time?',
        hints: [
          'Begin with the basic search layout.',
          `Leverage the logic of ${p.topicName}.`,
          'Use two pointers or hashing helper tables to reduce execution complexity.'
        ],
        observation: `Optimisation can be performed using ${p.topicName}.`,
        pattern: p.topicName,
        ...refSols
      };
    }

    if (subRoute === 'notes') {
      if (method === 'GET') {
        return {
          approach: attempt.approach || '',
          codeTemplate: attempt.codeTemplate || '',
          thinkingChecked: attempt.thinkingChecked || false
        };
      }
      if (method === 'POST') {
        const { approach, codeTemplate, thinkingChecked } = body;
        attempt.approach = approach;
        attempt.codeTemplate = codeTemplate;
        attempt.thinkingChecked = thinkingChecked;
        attempt.approachSaved = !!approach && approach.trim().length > 0;
        attempt.codeSaved = !!codeTemplate && codeTemplate.trim().length > 0;
        saveProblemAttempt(attempt);
        return { success: true };
      }
    }

    if (subRoute === 'bookmark' && method === 'POST') {
      attempt.isFavorite = !attempt.isFavorite;
      saveProblemAttempt(attempt);
      return { bookmarked: attempt.isFavorite };
    }

    if (subRoute === 'revision' && method === 'POST') {
      const { needRevision, revisionLevel } = body;
      attempt.needRevision = needRevision;
      attempt.revisionLevel = revisionLevel || 0;
      saveProblemAttempt(attempt);
      return { success: true };
    }

    if (subRoute === 'check-thinking' && method === 'POST') {
      attempt.thinkingChecked = true;
      saveProblemAttempt(attempt);

      const possiblePatterns = body.possiblePatterns || '';
      const timeComplexityGuess = body.timeComplexityGuess || 'O(n)';
      const spaceComplexityGuess = body.spaceComplexityGuess || 'O(1)';

      return {
        ...body,
        thinkingChecked: true,
        aiFeedback: `### AI Evaluation Feedback\n\nYour analysis looks very solid!\n\n* **Observations**: Good identification of the key elements.\n* **Complexity**: Your guesses (Time: ${timeComplexityGuess}, Space: ${spaceComplexityGuess}) align with the optimal constraints.\n* **Approach**: Excellent logic outline. You are ready to start coding!`,
        patternsMatchResult: `SUCCESS: Selected pattern (${possiblePatterns}) matches ${p.topicName} perfectly.`,
        timeComplexityResult: `CORRECT: Expected optimal time complexity is ${timeComplexityGuess}.`,
        spaceComplexityResult: `CORRECT: Expected optimal space complexity is ${spaceComplexityGuess}.`
      };
    }

    if (subRoute === 'reattempt' && method === 'POST') {
      attempt.status = 'UNSOLVED';
      saveProblemAttempt(attempt);
      return { success: true };
    }

    if (subRoute === 'run' && method === 'POST') {
      return {
        output: 'Mock execution completed.\n\nAll standard sample test cases passed successfully.',
        error: '',
        success: true
      };
    }

    if (subRoute === 'submit' && method === 'POST') {
      const { code, language } = body;
      
      // Save submission log
      const submissions = getLocalItem<Submission[]>('pf_submissions', []);
      const newSub: Submission = {
        id: 'sub-' + Math.random().toString(36).substring(2, 11),
        userId,
        problemId,
        status: 'SUBMIT_SUCCESS',
        code,
        language,
        createdAt: new Date().toISOString()
      };
      submissions.push(newSub);
      setLocalItem('pf_submissions', submissions);

      // Save solved attempt
      attempt.status = 'SOLVED';
      attempt.lastAttemptedAt = new Date().toISOString();
      attempt.wrongAttemptsCount = 0;
      saveProblemAttempt(attempt);

      // Solved counts
      const attempts = getLocalItem<Attempt[]>('pf_attempts', []).filter(a => a.userId === userId);
      const solvedCount = attempts.filter(a => a.status === 'SOLVED').length;

      return {
        success: true,
        status: 'SUBMIT_SUCCESS',
        error: '',
        runTimeMs: 25,
        testCasesPassed: 10,
        totalTestCases: 10,
        newStreak: calculateUserStreak(userId),
        newSolvedCount: solvedCount
      };
    }

    if (subRoute === 'toggle-completed' && method === 'POST') {
      const isSolved = attempt.status === 'SOLVED';
      attempt.status = isSolved ? 'UNSOLVED' : 'SOLVED';
      attempt.lastAttemptedAt = new Date().toISOString();
      saveProblemAttempt(attempt);

      if (attempt.status === 'SOLVED') {
        const submissions = getLocalItem<Submission[]>('pf_submissions', []);
        submissions.push({
          id: 'sub-' + Math.random().toString(36).substring(2, 11),
          userId,
          problemId,
          status: 'SUBMIT_SUCCESS',
          code: '',
          language: 'cpp',
          createdAt: new Date().toISOString()
        });
        setLocalItem('pf_submissions', submissions);
      }

      const attempts = getLocalItem<Attempt[]>('pf_attempts', []).filter(a => a.userId === userId);
      const solvedCount = attempts.filter(a => a.status === 'SOLVED').length;

      return {
        success: true,
        status: attempt.status,
        newStreak: calculateUserStreak(userId),
        newSolvedCount: solvedCount
      };
    }
  }

  // ------------------ DASHBOARD STATS AGGREGATOR ------------------
  if (path === '/api/dashboard/stats' && method === 'GET') {
    const attempts = getLocalItem<Attempt[]>('pf_attempts', []).filter(a => a.userId === userId);
    const submissions = getLocalItem<Submission[]>('pf_submissions', []).filter(s => s.userId === userId);

    const problemsSolved = attempts.filter(a => a.status === 'SOLVED').length;
    const problemsAttempted = attempts.length;

    // Group attempts by topicName to calculate accuracy rates
    const topicStats: Record<string, { total: number; solved: number }> = {};
    problemsSeed.forEach(p => {
      if (!topicStats[p.topicName]) {
        topicStats[p.topicName] = { total: 0, solved: 0 };
      }
      topicStats[p.topicName].total++;
    });

    attempts.forEach(a => {
      const seedIdx = parseInt(a.problemId.split('-')[1]) - 1;
      const p = problemsSeed[seedIdx];
      if (p && topicStats[p.topicName]) {
        if (a.status === 'SOLVED') {
          topicStats[p.topicName].solved++;
        }
      }
    });

    let strongestPattern = 'Basics';
    let maxPct = -1;
    let weakestPattern = 'Dynamic Programming';
    let minPct = 101;

    Object.entries(topicStats).forEach(([name, stats]) => {
      const pct = stats.total > 0 ? (stats.solved / stats.total) * 100 : 0;
      if (pct > maxPct) {
        maxPct = pct;
        strongestPattern = name;
      }
      if (pct < minPct && stats.solved < stats.total) {
        minPct = pct;
        weakestPattern = name;
      }
    });

    // Generate last 7 days of activity counts
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weeklyActivity = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dateStr = d.toISOString().split('T')[0];
      const count = submissions.filter(s => s.createdAt.split('T')[0] === dateStr).length +
                    attempts.filter(a => a.lastAttemptedAt?.split('T')[0] === dateStr).length;
      return {
        dayName: daysOfWeek[d.getDay()],
        count
      };
    });

    // Generate 365 days LeetCode-style activity map
    const monthlyHeatmap = Array.from({ length: 365 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (364 - i));
      const dateStr = d.toISOString().split('T')[0];
      
      const dayAttempts = attempts.filter(a => a.lastAttemptedAt?.split('T')[0] === dateStr);
      const dayProblems = dayAttempts.map(a => {
        const seedIdx = parseInt(a.problemId.split('-')[1]) - 1;
        const p = problemsSeed[seedIdx];
        return {
          id: a.problemId,
          leetcodeNumber: p ? p.leetcodeNumber : 0,
          name: p ? p.name : 'Unknown Problem',
          topicName: p ? p.topicName : 'General',
          difficulty: p ? getDifficultyEstimate(p.topicName, p.topicNumber) : 'MEDIUM'
        };
      });

      return {
        date: dateStr,
        count: dayProblems.length,
        problems: dayProblems
      };
    });

    const approachSavedCount = attempts.filter(a => a.approachSaved).length;
    const approachAccuracy = problemsAttempted > 0 ? (approachSavedCount / problemsAttempted) * 100 : 0.0;

    // Calculate solve goal for today
    const todayStr = new Date().toISOString().split('T')[0];
    const todayGoalSolved = attempts.filter(a => 
      a.status === 'SOLVED' && a.lastAttemptedAt && a.lastAttemptedAt.split('T')[0] === todayStr
    ).length;

    // Populate problemsPerTopicSolved and problemsPerTopicTotal maps from topicStats
    const problemsPerTopicSolved: Record<string, number> = {};
    const problemsPerTopicTotal: Record<string, number> = {};
    Object.entries(topicStats).forEach(([name, st]) => {
      problemsPerTopicSolved[name] = st.solved;
      problemsPerTopicTotal[name] = st.total;
    });

    const strongestTopic = strongestPattern;
    const weakestTopic = weakestPattern;
    const strongestPatternStr = strongestTopic + ' Patterns';
    const weakestPatternStr = weakestTopic + ' Patterns';

    // DTO Mapper helper
    const mapToDto = (a: Attempt) => {
      const seedIdx = parseInt(a.problemId.split('-')[1]) - 1;
      const p = problemsSeed[seedIdx];
      return {
        id: a.problemId,
        masterNumber: p.masterNumber,
        topicNumber: p.topicNumber,
        leetcodeNumber: String(p.leetcodeNumber),
        name: p.name,
        topicName: p.topicName,
        difficulty: getDifficultyEstimate(p.topicName, p.topicNumber),
        status: a.status,
        isFavorite: a.isFavorite,
        needRevision: a.needRevision,
        confidenceRating: a.confidenceRating || 0,
        approachSaved: a.approachSaved
      };
    };

    // recentlySolved: latest 5 solved sorted by lastAttemptedAt desc
    const solvedAttempts = attempts.filter(a => a.status === 'SOLVED' && a.lastAttemptedAt);
    solvedAttempts.sort((a, b) => new Date(b.lastAttemptedAt!).getTime() - new Date(a.lastAttemptedAt!).getTime());
    const recentlySolved = solvedAttempts.slice(0, 5).map(mapToDto);

    // continueLastSession: very last active attempt sorted by lastAttemptedAt desc
    const activeAttempts = attempts.filter(a => a.lastAttemptedAt);
    activeAttempts.sort((a, b) => new Date(b.lastAttemptedAt!).getTime() - new Date(a.lastAttemptedAt!).getTime());
    const continueLastSession = activeAttempts.length > 0 ? mapToDto(activeAttempts[0]) : null;

    // revisionDueTodayCount
    const todayDate = new Date();
    const revisionDueTodayCount = attempts.filter(a => 
      a.needRevision && a.nextRevisionDate && new Date(a.nextRevisionDate) <= todayDate
    ).length;

    return {
      totalProblems: 626,
      problemsSolved,
      problemsAttempted,
      currentStreak: calculateUserStreak(userId),
      approachAccuracy,
      todayGoalSolved,
      todayGoalTarget: 3,
      strongestPattern: strongestPatternStr,
      weakestPattern: weakestPatternStr,
      recentlySolved,
      continueLastSession,
      revisionDueTodayCount,
      weakestTopic,
      strongestTopic,
      problemsPerTopicSolved,
      problemsPerTopicTotal,
      weeklyActivity,
      monthlyHeatmap
    };
  }

  throw new Error(`Endpoint not found: ${method} ${url}`);
};

// ==========================================
// FILE AUTO-SYNC AND INDEXEDDB PERSISTENCE
// ==========================================
const SYNC_DB_NAME = 'PatternForgeSyncDB';
const SYNC_STORE_NAME = 'handles';
const SYNC_KEY = 'syncFile';

function getSyncDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(SYNC_DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(SYNC_STORE_NAME)) {
        db.createObjectStore(SYNC_STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function saveSyncFileHandle(handle: any): Promise<void> {
  const db = await getSyncDB();
  return new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(SYNC_STORE_NAME, 'readwrite');
    const store = transaction.objectStore(SYNC_STORE_NAME);
    const request = store.put(handle, SYNC_KEY);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

async function getSyncFileHandle(): Promise<any | null> {
  const db = await getSyncDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(SYNC_STORE_NAME, 'readonly');
    const store = transaction.objectStore(SYNC_STORE_NAME);
    const request = store.get(SYNC_KEY);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}

async function deleteSyncFileHandle(): Promise<void> {
  const db = await getSyncDB();
  return new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(SYNC_STORE_NAME, 'readwrite');
    const store = transaction.objectStore(SYNC_STORE_NAME);
    const request = store.delete(SYNC_KEY);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

let activeFileHandle: any | null = null;
let isWriting = false;

// Initialise active handle from storage
getSyncFileHandle().then(handle => {
  if (handle) {
    activeFileHandle = handle;
  }
}).catch(() => {});

export async function _autoSaveToSyncFile() {
  if (!activeFileHandle || isWriting) return;
  
  try {
    const options = { mode: 'readwrite' };
    const permission = await activeFileHandle.queryPermission(options);
    if (permission !== 'granted') {
      return; // No active permission session, wait for click verification
    }
    
    isWriting = true;
    const keysToExport = ['token', 'pf_users', 'pf_attempts', 'pf_submissions', 'pf_settings'];
    const exportObj: Record<string, string | null> = {};
    keysToExport.forEach(key => {
      exportObj[key] = localStorage.getItem(key);
    });

    const writable = await activeFileHandle.createWritable();
    await writable.write(JSON.stringify(exportObj, null, 2));
    await writable.close();
  } catch (e) {
    console.error('Auto-sync write failed', e);
  } finally {
    isWriting = false;
  }
}

const BASE_URL = 'http://localhost:8081';

export const api = {
  get: async <T>(endpoint: string): Promise<T> => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${BASE_URL}/api${endpoint}`, {
      method: 'GET',
      headers,
    });
    if (response.status === 401) {
      localStorage.removeItem('token');
      if (unauthorizedListener) unauthorizedListener();
      throw new Error('Session expired or unauthorized');
    }
    if (!response.ok) {
      const errorMsg = await response.text();
      throw new Error(errorMsg || `GET request failed with status ${response.status}`);
    }
    const contentType = response.headers.get('Content-Type');
    if (contentType && contentType.includes('application/json')) {
      return response.json() as Promise<T>;
    } else {
      return response.text() as unknown as Promise<T>;
    }
  },

  post: async <T>(endpoint: string, body: any): Promise<T> => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${BASE_URL}/api${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
    if (response.status === 401) {
      localStorage.removeItem('token');
      if (unauthorizedListener) unauthorizedListener();
      throw new Error('Session expired or unauthorized');
    }
    if (!response.ok) {
      const errorMsg = await response.text();
      throw new Error(errorMsg || `POST request failed with status ${response.status}`);
    }
    const contentType = response.headers.get('Content-Type');
    if (contentType && contentType.includes('application/json')) {
      return response.json() as Promise<T>;
    } else {
      return response.text() as unknown as Promise<T>;
    }
  },

  put: async <T>(endpoint: string, body: any): Promise<T> => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${BASE_URL}/api${endpoint}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body),
    });
    if (response.status === 401) {
      localStorage.removeItem('token');
      if (unauthorizedListener) unauthorizedListener();
      throw new Error('Session expired or unauthorized');
    }
    if (!response.ok) {
      const errorMsg = await response.text();
      throw new Error(errorMsg || `PUT request failed with status ${response.status}`);
    }
    const contentType = response.headers.get('Content-Type');
    if (contentType && contentType.includes('application/json')) {
      return response.json() as Promise<T>;
    } else {
      return response.text() as unknown as Promise<T>;
    }
  },

  // Exported helpers for Settings View integration
  getSyncFileName: async (): Promise<string | null> => {
    const handle = await getSyncFileHandle();
    return handle ? handle.name : null;
  },

  linkSyncFile: async (action: 'create' | 'open'): Promise<string | null> => {
    try {
      let handle: any;
      if (action === 'create') {
        handle = await (window as any).showSaveFilePicker({
          suggestedName: 'patternforge-dsa-sync.json',
          types: [{
            description: 'JSON File',
            accept: { 'application/json': ['.json'] }
          }]
        });
      } else {
        const [h] = await (window as any).showOpenFilePicker({
          types: [{
            description: 'JSON File',
            accept: { 'application/json': ['.json'] }
          }],
          multiple: false
        });
        handle = h;
      }

      await saveSyncFileHandle(handle);
      activeFileHandle = handle;

      if (action === 'open') {
        const file = await handle.getFile();
        const text = await file.text();
        if (text && text.trim().length > 0) {
          const importObj = JSON.parse(text);
          const keys = ['token', 'pf_users', 'pf_attempts', 'pf_submissions', 'pf_settings'];
          keys.forEach(key => {
            if (key in importObj) {
              const val = importObj[key];
              if (val === null) {
                localStorage.removeItem(key);
              } else {
                localStorage.setItem(key, val);
              }
            }
          });
        }
      } else {
        // Sync active state right away
        const keysToExport = ['token', 'pf_users', 'pf_attempts', 'pf_submissions', 'pf_settings'];
        const exportObj: Record<string, string | null> = {};
        keysToExport.forEach(key => {
          exportObj[key] = localStorage.getItem(key);
        });
        const writable = await handle.createWritable();
        await writable.write(JSON.stringify(exportObj, null, 2));
        await writable.close();
      }

      return handle.name;
    } catch (e) {
      console.error('File link failed', e);
      return null;
    }
  },

  unlinkSyncFile: async (): Promise<void> => {
    await deleteSyncFileHandle();
    activeFileHandle = null;
  },

  verifySyncPermission: async (): Promise<boolean> => {
    const handle = await getSyncFileHandle();
    if (!handle) return false;
    try {
      const options = { mode: 'readwrite' };
      const permission = await handle.requestPermission(options);
      if (permission === 'granted') {
        activeFileHandle = handle;
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  },

  checkSyncPermissionGranted: async (): Promise<boolean> => {
    const handle = await getSyncFileHandle();
    if (!handle) return false;
    const options = { mode: 'readwrite' };
    const permission = await handle.queryPermission(options);
    return permission === 'granted';
  }
};
