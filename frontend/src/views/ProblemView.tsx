import React, { useEffect, useState, useRef } from 'react';
import MonacoEditor from '@monaco-editor/react';
import { api } from '../services/api';
import { 
  ArrowLeft, Bookmark, BookmarkCheck, 
  Play, Clock, Lock,
  Code, FileText, Brain, HelpCircle, 
  CheckCircle, ChevronDown, ChevronUp, Save,
  Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProblemDetails {
  id: string;
  masterNumber: number;
  topicNumber: number;
  leetcodeNumber: number;
  name: string;
  topicName: string;
  difficulty: string;
  status: string;
  isFavorite: boolean;
  needRevision: boolean;
  revisionLevel: number;
  confidenceRating: number;
  timeTaken: number;
  hintsUsed: number;
  wrongAttemptsCount: number;
}

interface NoteData {
  observations: string;
  bruteForce: string;
  possiblePatterns: string; // comma-separated
  chosenPattern: string;
  timeComplexityGuess: string;
  spaceComplexityGuess: string;
  approach: string;
  mistakes: string;
  optimizedIdea: string;
  alternativeSolution: string;
  futureReminder: string;
  
  // Validation fields
  thinkingChecked: boolean;
  aiFeedback: string;
  patternsMatchResult: string;
  timeComplexityResult: string;
  spaceComplexityResult: string;
  explanationScore?: string;
}

interface SolutionTabInfo {
  approach: string;
  timeComplexity: string;
  spaceComplexity: string;
  code: {
    cpp: string;
    java: string;
  };
}

interface ProblemDetailsJson {
  problemStatement: string;
  inputFormat: string;
  outputFormat: string;
  examples: Array<{ input: string; output: string; explanation: string }>;
  constraints: string[];
  edgeCases: string[];
  followUp: string;
  hints: string[];
  observation: string;
  pattern: string;
  approach: string;
  optimalTimeComplexity: string;
  optimalSpaceComplexity: string;
  fullExplanation: string;
  referenceSolution: string;
  referenceSolutions?: Record<string, string>;
  bruteForce?: SolutionTabInfo;
  better?: SolutionTabInfo;
  optimal?: SolutionTabInfo;
}

interface ProblemViewProps {
  problemId: string;
  onBack: () => void;
}

const ALL_DSA_PATTERNS = [
  "Arrays", "Hashing", "Two Pointers", "Sliding Window", "Prefix Sum", 
  "Prefix Maximum", "Suffix", "Binary Search", "Binary Search on Answer", 
  "Greedy", "Recursion", "Backtracking", "Stack", "Monotonic Stack", 
  "Queue", "Monotonic Queue", "Heap", "Trie", "Bit Manipulation", 
  "Linked List", "Tree", "BST", "Graph", "Topological Sort", "Union Find", 
  "DFS", "BFS", "Shortest Path", "DP", "1D DP", "2D DP", "State DP", 
  "Digit DP", "Bitmask DP", "Interval DP", "Game DP", "Math", "Simulation", 
  "Strings", "Sorting", "Divide and Conquer", "Segment Tree", "Fenwick Tree", 
  "Sparse Table", "Others"
];

const COMPLEXITY_GUESSES = [
  "O(1)", "O(log n)", "O(n)", "O(n log n)", "O(n²)", "O(n³)", "Other"
];

const SPACE_COMPLEXITY_GUESSES = [
  "O(1)", "O(log n)", "O(n)", "O(n²)", "Other"
];

const isPlatformAvailable = (platform: 'leetcode' | 'gfg' | 'tuf', masterNumber: number, topicName: string) => {
  if (platform === 'leetcode') return true;
  if (platform === 'gfg') {
    return (masterNumber % 7 !== 0);
  }
  if (platform === 'tuf') {
    if (topicName === 'Basics') return false;
    return (masterNumber % 8 !== 0);
  }
  return false;
};

const isComplexityMatch = (guess: string, optimal: string) => {
  if (!guess || !optimal) return false;
  const clean = (s: string) => s.toLowerCase().replace(/\s+/g, '').replace(/[*_]/g, '');
  return clean(guess) === clean(optimal);
};

const getLeetCodeUrl = (name: string) => {
  const slug = name.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replaceAll(/\s+/g, '-');
  return `https://leetcode.com/problems/${slug}/`;
};

const CODE_TEMPLATES: Record<string, string> = {
  javascript: `// Write your approach logic before coding!\nfunction solve(nums, target) {\n    // Write your solution here\n    \n    return null;\n}`,
  python: `# Write your approach logic before coding!\ndef solve(nums, target):\n    # Write your solution here\n    pass`,
  java: `// Write your approach logic before coding!\nimport java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        // Read stdin or call your methods\n    }\n}`,
  cpp: `// Write your approach logic before coding!\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    // Write your solution here\n    return 0;\n}`
};

const TIMELINE_ITEMS = [
  "Problem Summary",
  "Input & Output",
  "Examples",
  "Constraints",
  "Hints",
  "Pattern Recognition",
  "Brute Force",
  "Better Solution",
  "Optimal Solution",
  "Complexity Analysis",
  "Reference Code",
  "Revision Notes"
];

const AiGenerationLoadingScreen: React.FC<{
  onRetry?: () => void;
  failed?: boolean;
}> = ({ onRetry, failed }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [currentMessage, setCurrentMessage] = useState("Analyzing algorithmic patterns...");
  const [timeLeft, setTimeLeft] = useState(35);

  // Backward countdown timer
  useEffect(() => {
    if (failed) return;
    const countdown = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(countdown);
  }, [failed]);

  const messages = [
    "Analyzing algorithmic patterns...",
    "Finding optimal approach...",
    "Generating interviewer-quality explanation...",
    "Preparing revision notes...",
    "Checking important edge cases...",
    "Optimizing complexity analysis..."
  ];

  // Rotate steps
  useEffect(() => {
    if (failed) return;
    const stepInterval = setInterval(() => {
      setActiveStep(prev => (prev < TIMELINE_ITEMS.length - 1 ? prev + 1 : prev));
    }, 2500);

    return () => clearInterval(stepInterval);
  }, [failed]);

  // Rotate messages
  useEffect(() => {
    if (failed) return;
    const msgInterval = setInterval(() => {
      setCurrentMessage(prev => {
        const filtered = messages.filter(m => m !== prev);
        return filtered[Math.floor(Math.random() * filtered.length)];
      });
    }, 4000);

    return () => clearInterval(msgInterval);
  }, [failed]);

  if (failed) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center text-center p-6 bg-slate-900/40 rounded-2xl border border-slate-800 shadow-2xl w-full">
        <div className="text-5xl mb-4">🤖</div>
        <h2 className="text-base font-black text-red-400 uppercase tracking-wider mb-2 font-mono">Generation Failed</h2>
        <p className="text-slate-400 text-xs max-w-sm mb-6 font-medium leading-relaxed">
          We encountered an issue communicating with Gemini API or all loaded keys are temporarily throttled.
        </p>
        <button
          onClick={onRetry}
          className="px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-red-500 hover:bg-red-600 text-white shadow-[0_0_15px_rgba(239,68,68,0.35)] transition-all hover:scale-105 active:scale-95 cursor-pointer"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 bg-slate-900/45 rounded-2xl border border-slate-900 shadow-2xl w-full min-h-[70vh]">
      <div className="text-5xl mb-5 animate-bounce">🤖</div>
      
      <h2 className="text-base font-black text-slate-100 uppercase tracking-widest font-mono">
        Generating AI Learning Guide
      </h2>
      <p className="text-slate-400 text-[11px] font-bold text-center mt-2 max-w-md leading-relaxed">
        This only happens once. The generated content will be permanently stored and will load instantly next time.
      </p>

      {/* Animated progress timeline */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-8 gap-y-3.5 my-10 max-w-lg w-full px-4 py-6 rounded-2xl bg-slate-950/50 border border-slate-900 font-mono text-[11px] font-bold">
        {TIMELINE_ITEMS.map((item, idx) => {
          let symbol = "○";
          let colorClass = "text-slate-600";
          let isCurrent = idx === activeStep;

          if (idx < activeStep) {
            symbol = "✓";
            colorClass = "text-emerald-400";
          } else if (isCurrent) {
            symbol = "⟳";
            colorClass = "text-blue-400";
          }

          return (
            <div key={item} className={`flex items-center space-x-2 transition-all duration-300 ${colorClass}`}>
              <span className={`text-[12px] ${isCurrent ? 'animate-spin inline-block' : ''}`}>{symbol}</span>
              <span className={isCurrent ? 'text-blue-200 font-black' : ''}>{item}</span>
            </div>
          );
        })}
      </div>

      {/* Rotating Friendly Messages */}
      <div className="h-6 flex items-center justify-center">
        <p className="text-blue-400 text-xs font-bold font-mono tracking-wide animate-pulse">
          {currentMessage}
        </p>
      </div>

      {/* Estimated Time */}
      <div className="mt-8 text-center bg-slate-900/40 border border-slate-800/80 px-6 py-3 rounded-xl min-w-[220px]">
        <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block font-mono">Estimated Waiting Time</span>
        <span className="text-slate-300 text-sm font-black font-mono mt-0.5 block">{timeLeft} seconds</span>
      </div>
    </div>
  );
};

const isBoilerplateDetails = (data: any) => {
  if (!data) return true;
  const statement = data.problemStatement || "";
  const lower = statement.toLowerCase();
  const approach = data.approach || "";
  const lowerApproach = approach.toLowerCase();
  return lower.includes("problem details not loaded") ||
         lower.includes("please refer to leetcode") ||
         lower.includes("standard parameters as defined in") ||
         lower.includes("expected optimal output type") ||
         lower.includes("standard leetcode constraints") ||
         lower.includes("analyze and implement the algorithm for") ||
         (lower.includes("problem: ") && lower.includes("(leetcode #")) ||
         !approach ||
         lowerApproach.includes("optimal solution using standard") ||
         lowerApproach.includes("short optimal strategy") ||
         lowerApproach.includes("refer to standard patterns under");
};

const ProblemView: React.FC<ProblemViewProps> = ({ problemId, onBack }) => {
  const [problem, setProblem] = useState<ProblemDetails | null>(null);
  const [details, setDetails] = useState<ProblemDetailsJson | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(true);
  const [loadingSolutions, setLoadingSolutions] = useState(true);
  const [generationFailed, setGenerationFailed] = useState(false);

  const handleRetry = () => {
    setGenerationFailed(false);
    setLoadingDetails(true);
    setLoadingSolutions(true);
    loadData();
  };
  
  const [notes, setNotes] = useState<NoteData>({
    observations: '', bruteForce: '', possiblePatterns: '', chosenPattern: '',
    timeComplexityGuess: '', spaceComplexityGuess: '', approach: '',
    mistakes: '', optimizedIdea: '', alternativeSolution: '', futureReminder: '',
    thinkingChecked: false, aiFeedback: '', patternsMatchResult: '',
    timeComplexityResult: '', spaceComplexityResult: '',
    explanationScore: ''
  });

  const renderSolutionLoadingPlaceholder = () => (
    <div className="p-4 border-t border-slate-900 flex flex-col space-y-3 animate-pulse">
      <div className="h-2 bg-slate-900 rounded w-3/4 animate-pulse"></div>
      <div className="h-2 bg-slate-900 rounded w-5/6 animate-pulse"></div>
      <div className="h-2 bg-slate-900 rounded w-2/3 animate-pulse"></div>
      <div className="flex items-center space-x-2 pt-2">
        <div className="h-3.5 w-3.5 animate-spin rounded-full border border-emerald-500 border-t-transparent"></div>
        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono">Loading solutions in background...</span>
      </div>
    </div>
  );
  
  // Workspace UI states
  const [activeTab, setActiveTab] = useState<'approach' | 'coding' | 'solutions' | 'reflections'>('approach');
  const [solutionLanguage, setSolutionLanguage] = useState<'java' | 'cpp'>('cpp');
  const [selectedSolutionTab, setSelectedSolutionTab] = useState<'brute' | 'better' | 'optimal'>('optimal');
  const [language, setLanguage] = useState<'java' | 'cpp'>('cpp');
  const [code, setCode] = useState(CODE_TEMPLATES.cpp);
  const [customInput, setCustomInput] = useState('');
  const [consoleOutput, setConsoleOutput] = useState('');
  const [consoleError, setConsoleError] = useState('');
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [testResult, setTestResult] = useState<{ passed?: number; total?: number; status?: string } | null>(null);
  const [checkingThinking, setCheckingThinking] = useState(false);

  // Spaced repetition dropdown
  const [revisionLevel, setRevisionLevel] = useState(0);

  // Thinking Mode & Timer
  const [thinkingStarted, setThinkingStarted] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [customMins, setCustomMins] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const timerIntervalRef = useRef<any>(null);

  // Resizable Splitter states & handlers
  const [leftWidthPercent, setLeftWidthPercent] = useState<number>(50);
  const [isResizing, setIsResizing] = useState<boolean>(false);
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 1024);



  useEffect(() => {
    const handleResize = () => {
      setIsLargeScreen(window.innerWidth >= 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const startResizing = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const container = document.getElementById('main-split-container');
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const relativeX = e.clientX - rect.left;
      let newPercent = (relativeX / rect.width) * 100;
      
      if (newPercent < 25) newPercent = 25;
      if (newPercent > 75) newPercent = 75;
      
      setLeftWidthPercent(newPercent);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  // Accordion details
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);
  const [unlockedHintCount, setUnlockedHintCount] = useState<number>(1);
  const [revealSolution, setRevealSolution] = useState(false);

  // Autosave tracker
  const notesRef = useRef(notes);
  notesRef.current = notes;

  const loadData = async () => {
    setGenerationFailed(false);
    setLoadingDetails(true);
    setLoadingSolutions(true);
    try {
      const [probData, notesData] = await Promise.all([
        api.get<ProblemDetails>(`/problems/${problemId}`),
        api.get<NoteData>(`/problems/${problemId}/notes`)
      ]);
      setProblem(probData);
      setRevisionLevel(probData.revisionLevel);
      setNotes(notesData);
      
      // If they already validated thinking previously, set state to loaded
      if (notesData.thinkingChecked) {
        setThinkingStarted(true);
        setActiveTab('coding');
      }

      // Check browser cache for details first
      const cacheKey = `pf_details_${problemId}`;
      const cachedDetails = localStorage.getItem(cacheKey);
      if (cachedDetails) {
        try {
          const parsed = JSON.parse(cachedDetails);
          if (!isBoilerplateDetails(parsed)) {
            setDetails(parsed);
            setLoadingDetails(false);
            setLoadingSolutions(false);
            return;
          }
        } catch (e) {
          // ignore cache error
        }
      }

      // 1. Fetch basic details (fast description render)
      try {
        const basicData = await api.get<ProblemDetailsJson>(`/problems/${problemId}/basic-details`);
        setDetails(prev => {
          const merged = prev ? { ...prev, ...basicData } : basicData;
          localStorage.setItem(cacheKey, JSON.stringify(merged));
          return merged;
        });
        setLoadingDetails(false);
      } catch (err) {
        console.error("Failed to load basic details", err);
        setGenerationFailed(true);
        setLoadingDetails(false);
        return;
      }

      // 2. Fetch solution details in background (complexities, approach)
      try {
        const solData = await api.get<ProblemDetailsJson>(`/problems/${problemId}/solution-details`);
        setDetails(prev => {
          const merged = prev ? { ...prev, ...solData } : solData;
          localStorage.setItem(cacheKey, JSON.stringify(merged));
          return merged;
        });
        setLoadingSolutions(false);
      } catch (err) {
        console.error("Failed to load solution details", err);
        setLoadingSolutions(false);
      }

    } catch (e) {
      console.error("Failed to load problem workspace data", e);
      setGenerationFailed(true);
      setLoadingDetails(false);
      setLoadingSolutions(false);
    }
  };

  useEffect(() => {
    loadData();

    // Autosave notes interval every 15s
    const saveInterval = setInterval(async () => {
      try {
        await api.post(`/problems/${problemId}/notes`, notesRef.current);
      } catch (err) {
        // Silently skip
      }
    }, 15000);

    return () => {
      clearInterval(saveInterval);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [problemId]);

  // Update template on language switch
  const handleLanguageChange = (lang: 'java' | 'cpp') => {
    setLanguage(lang);
    setCode(CODE_TEMPLATES[lang]);
  };

  // Timer functions
  const startTimer = (minutes: number) => {
    setSecondsRemaining(minutes * 60);
    setTimerRunning(true);
    setThinkingStarted(true);

    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

    timerIntervalRef.current = setInterval(() => {
      setSecondsRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timerIntervalRef.current!);
          setTimerRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleCustomTimerStart = () => {
    const mins = parseInt(customMins);
    if (!isNaN(mins) && mins > 0) {
      startTimer(mins);
      setShowCustomInput(false);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const toggleBookmark = async () => {
    if (!problem) return;
    const originalFav = problem.isFavorite;

    // Optimistic Update
    setProblem({ ...problem, isFavorite: !originalFav });

    try {
      const res = await api.post<{ bookmarked: boolean }>(`/problems/${problemId}/bookmark`, {});
      setProblem(prev => prev ? { ...prev, isFavorite: res.bookmarked } : null);
    } catch (e) {
      console.error("Failed to toggle bookmark", e);
      // Rollback
      setProblem(prev => prev ? { ...prev, isFavorite: originalFav } : null);
    }
  };

  const handleRevisionChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const days = Number(e.target.value);
    const revise = days > 0;
    const originalRevisionLevel = revisionLevel;

    // Optimistic Update
    setRevisionLevel(days);

    try {
      await api.post(`/problems/${problemId}/revision`, {
        needRevision: revise,
        revisionLevel: days
      });
    } catch (err) {
      console.error("Failed to update revision level", err);
      // Rollback
      setRevisionLevel(originalRevisionLevel);
    }
  };

  // Run Code
  const handleRun = async () => {
    setRunning(true);
    setConsoleOutput('');
    setConsoleError('');
    setTestResult(null);

    try {
      const res = await api.post<{ output: string; error: string; success: boolean }>((`/problems/${problemId}/run`), {
        code,
        language,
        customInput
      });
      setConsoleOutput(res.output);
      setConsoleError(res.error);
    } catch (e: any) {
      setConsoleError(e.message || 'Execution error');
    } finally {
      setRunning(false);
    }
  };

  // Submit Code
  const handleSubmitCode = async () => {
    setSubmitting(true);
    setConsoleOutput('');
    setConsoleError('');
    setTestResult(null);

    try {
      const res = await api.post<{ 
        success: boolean; 
        status: string; 
        error: string; 
        testCasesPassed: number; 
        totalTestCases: number;
        newStreak: number;
        newSolvedCount: number;
      }>(
        `/problems/${problemId}/submit`, {
          code,
          language
        }
      );
      setTestResult({
        passed: res.testCasesPassed,
        total: res.totalTestCases,
        status: res.status
      });
      if (!res.success) {
        setConsoleError(res.error);
      } else {
        setConsoleOutput("All test cases passed! Submissions verified successfully.");
        setProblem(prev => prev ? { ...prev, status: 'SOLVED' } : null);
      }
      // Instantly dispatch absolute counts returned by the backend for all submissions
      window.dispatchEvent(new CustomEvent('refresh-stats', {
        detail: { newStreak: res.newStreak, newSolved: res.newSolvedCount }
      }));
    } catch (e: any) {
      setConsoleError(e.message || 'Submission error');
    } finally {
      setSubmitting(false);
    }
  };

  // Check Thinking AI evaluation
  const handleCheckThinking = async () => {
    setCheckingThinking(true);
    try {
      // Simulate real-time AI processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      const checkedNote = await api.post<NoteData>(`/problems/${problemId}/check-thinking`, {
        possiblePatterns: notes.possiblePatterns,
        timeComplexityGuess: notes.timeComplexityGuess,
        spaceComplexityGuess: notes.spaceComplexityGuess,
        observations: "",
        bruteForce: "",
        approach: notes.approach
      });
      setNotes(checkedNote);
      
      // Stop timer and reveal editor
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      setTimerRunning(false);
    } catch (e) {
      console.error("Failed to verify thinking", e);
    } finally {
      setCheckingThinking(false);
    }
  };

  // Reattempt problem (reset thinking mode status)
  const handleReattempt = async () => {
    if (!window.confirm("Are you sure you want to reattempt this problem? This will lock the coding workspace and reset your predictions so you can check your thinking again.")) return;
    try {
      await api.post(`/problems/${problemId}/reattempt`, {});
      setNotes(prev => ({
        ...prev,
        thinkingChecked: false,
        aiFeedback: '',
        patternsMatchResult: '',
        timeComplexityResult: '',
        spaceComplexityResult: ''
      }));
      setThinkingStarted(false);
      setProblem(prev => prev ? { ...prev, status: 'UNSOLVED' } : null);
      setActiveTab('approach');
    } catch (e) {
      alert("Failed to reset problem for reattempt.");
    }
  };

  const toggleCompletedStatus = async () => {
    if (!problem) return;
    const originalStatus = problem.status;
    const nextStatus = originalStatus === 'SOLVED' ? 'UNSOLVED' : 'SOLVED';

    // Optimistic Update
    setProblem(prev => prev ? { ...prev, status: nextStatus } : null);

    const solvedDelta = nextStatus === 'SOLVED' ? 1 : -1;
    const streakDelta = nextStatus === 'SOLVED' ? 1 : -1;

    // Dispatch optimistic updates instantly to header stats
    window.dispatchEvent(new CustomEvent('refresh-stats', {
      detail: { solvedDelta, streakDelta }
    }));

    try {
      const res = await api.post<{ success: boolean; status: string; newStreak: number; newSolvedCount: number }>(`/problems/${problemId}/toggle-completed`, {});
      if (!res.success || res.status !== nextStatus) {
        // Rollback if not successful
        setProblem(prev => prev ? { ...prev, status: originalStatus } : null);
        window.dispatchEvent(new CustomEvent('refresh-stats', {
          detail: { solvedDelta: -solvedDelta, streakDelta: -streakDelta }
        }));
      } else {
        // Overwrite optimistic values with accurate backend absolute stats
        window.dispatchEvent(new CustomEvent('refresh-stats', {
          detail: { newStreak: res.newStreak, newSolved: res.newSolvedCount }
        }));
      }
    } catch (err) {
      console.error("Failed to toggle completed status", err);
      // Rollback on error
      setProblem(prev => prev ? { ...prev, status: originalStatus } : null);
      window.dispatchEvent(new CustomEvent('refresh-stats', {
        detail: { solvedDelta: -solvedDelta, streakDelta: -streakDelta }
      }));
    }
  };

  const handlePatternToggle = (pattern: string) => {
    const list = notes.possiblePatterns ? notes.possiblePatterns.split(',') : [];
    let updated;
    if (list.includes(pattern)) {
      updated = list.filter(p => p !== pattern);
    } else {
      updated = [...list, pattern];
    }
    setNotes({ ...notes, possiblePatterns: updated.join(',') });
  };

  const parseInlineMarkdown = (text: string): React.ReactNode[] => {
    if (!text) return [];
    
    // Split by ** first to find bold text
    let parts: (string | React.ReactNode)[] = [text];
    
    if (text.includes('**')) {
      const splitParts = text.split('**');
      parts = splitParts.map((part, i) => 
        i % 2 === 1 ? <strong key={`b-${i}`} className="text-slate-50 font-black">{part}</strong> : part
      );
    }
    
    // Split each string element by ` for inline code blocks
    const finalParts: React.ReactNode[] = [];
    parts.forEach((part, partIdx) => {
      if (typeof part !== 'string') {
        finalParts.push(part);
      } else if (!part.includes('`')) {
        finalParts.push(part);
      } else {
        const splitParts = part.split('`');
        splitParts.forEach((subPart, i) => {
          if (i % 2 === 1) {
            finalParts.push(
              <code key={`code-${partIdx}-${i}`} className="bg-slate-900 px-1.5 py-0.5 rounded text-[12px] font-mono text-amber-400 font-bold border border-slate-800/80">
                {subPart}
              </code>
            );
          } else {
            finalParts.push(subPart);
          }
        });
      }
    });
    
    return finalParts;
  };

  const renderMarkdown = (text: string) => {
    if (!text) return null;
    return text.split('\n').map((para, idx) => {
      const trimmed = para.trim();
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        return (
          <li key={idx} className="ml-4 list-disc text-slate-200 my-1.5 font-sans text-[13.5px] leading-relaxed font-medium">
            {parseInlineMarkdown(trimmed.substring(2))}
          </li>
        );
      }
      if (trimmed.startsWith('### ')) {
        return (
          <h4 key={idx} className="text-xs font-bold text-slate-100 mt-3 mb-1.5 uppercase tracking-wider font-sans">
            {parseInlineMarkdown(trimmed.substring(4))}
          </h4>
        );
      }
      if (trimmed.startsWith('## ')) {
        return (
          <h3 key={idx} className="text-sm font-extrabold text-slate-50 mt-4 mb-2 font-sans">
            {parseInlineMarkdown(trimmed.substring(3))}
          </h3>
        );
      }
      return (
        <p key={idx} className="text-[13.5px] text-slate-200 my-2 leading-relaxed font-sans font-medium">
          {parseInlineMarkdown(para)}
        </p>
      );
    });
  };

  if (!problem) {
    return (
      <div className="flex h-[60vh] items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-slate-400 text-sm animate-pulse">Loading Workspace...</p>
        </div>
      </div>
    );
  }

  // Determine if code editing is allowed
  const isCodeEditable = thinkingStarted && !timerRunning && notes.thinkingChecked;

  return (
    <div className="space-y-6">
      {/* Header controls bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800/80 pb-4 gap-3">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-xs font-bold text-slate-400 hover:text-slate-200 transition-smooth self-start"
        >
          <ArrowLeft className="h-4.5 w-4.5" />
          <span>Back to catalog</span>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          {/* Streak or Timer status pill */}
          {timerRunning && (
            <div className="flex items-center space-x-2 bg-blue-500/10 border border-blue-500/30 shadow-glow-blue px-3.5 py-1.5 rounded-full text-blue-400 font-mono text-xs font-bold select-none animate-pulse">
              <Clock className="h-4 w-4" />
              <span>Thinking Mode: {formatTime(secondsRemaining)}</span>
            </div>
          )}

          {/* Spaced Repetition Dropdown */}
          <div className="flex items-center space-x-2 bg-slate-900/60 border border-slate-800 px-3.5 py-1.5 rounded-xl text-xs">
            <span className="text-slate-500 font-bold uppercase tracking-wider text-[9px]">Spaced Repetition:</span>
            <select
              value={revisionLevel}
              onChange={handleRevisionChange}
              className="bg-transparent text-slate-200 outline-none border-none font-extrabold cursor-pointer"
            >
              <option value="0" className="bg-slate-950">None</option>
              <option value="1" className="bg-slate-950">1 Day</option>
              <option value="3" className="bg-slate-950">3 Days</option>
              <option value="7" className="bg-slate-950">7 Days</option>
              <option value="15" className="bg-slate-950">15 Days</option>
              <option value="30" className="bg-slate-950">30 Days</option>
            </select>
          </div>

          {/* Reattempt Button */}
          {notes.thinkingChecked && (
            <button
              onClick={handleReattempt}
              className="px-3 py-1.5 rounded-xl bg-slate-900/60 hover:bg-slate-850 border border-slate-800 hover:border-blue-500/40 text-xs font-bold text-slate-300 hover:text-slate-100 transition-smooth flex items-center space-x-1"
            >
              <span>Reattempt</span>
            </button>
          )}

          {/* Mark completed/done Button */}
          <button
            onClick={toggleCompletedStatus}
            className={`px-3 py-1.5 rounded-sm border text-xs font-bold transition-smooth flex items-center space-x-1.5 ${
              problem.status === 'SOLVED'
                ? 'bg-text-primary text-background border-text-primary hover:bg-text-primary/95'
                : 'border-border text-text-secondary hover:text-text-primary hover:border-text-primary'
            }`}
          >
            <CheckCircle className="h-4 w-4" />
            <span>{problem.status === 'SOLVED' ? 'Completed ✓' : 'Mark Completed'}</span>
          </button>

          {/* Bookmark Button */}
          <button
            onClick={toggleBookmark}
            className="p-2 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-amber-400 transition-smooth"
          >
            {problem.isFavorite ? (
              <BookmarkCheck className="h-4.5 w-4.5 text-amber-400 fill-amber-400/10" />
            ) : (
              <Bookmark className="h-4.5 w-4.5" />
            )}
          </button>
        </div>
      </div>

      {/* Main Double Column Workspace Layout */}
      <AnimatePresence mode="wait">
        {loadingDetails || loadingSolutions || generationFailed ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
            className="w-full font-sans"
          >
            <AiGenerationLoadingScreen 
              failed={generationFailed} 
              onRetry={handleRetry} 
            />
          </motion.div>
        ) : (
          <motion.div
            key="workspace"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
            id="main-split-container"
            className={`flex flex-col lg:flex-row gap-4 min-h-[calc(100vh-10rem)] items-stretch w-full ${isResizing ? 'select-none' : ''}`}
            style={isResizing ? { cursor: 'col-resize' } : undefined}
          >
        
        {/* LEFT PANEL: Scrollable Problem Details and Locked Accordion Hints */}
        <div 
          className="glass-panel rounded-2xl p-6 flex flex-col space-y-6 max-h-[85vh] overflow-y-auto custom-scrollbar"
          style={isLargeScreen ? { flex: `0 0 calc(${leftWidthPercent}% - 0.5rem)` } : undefined}
        >
          
          {/* Header Metadata */}
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] text-slate-500 font-mono font-bold uppercase">Master #{problem.masterNumber}</span>
              <span className="text-slate-700 font-bold">•</span>
              <span className="text-[10px] text-blue-400 font-bold uppercase">{problem.topicName}</span>
            </div>
            
            <h1 className="text-2xl font-black text-slate-100 mt-1.5 flex items-center space-x-3">
              <span>{problem.name}</span>
              <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                problem.difficulty === 'EASY' ? 'text-emerald-400 bg-emerald-500/10' :
                problem.difficulty === 'MEDIUM' ? 'text-amber-400 bg-amber-500/10' : 'text-red-400 bg-red-500/10'
              }`}>
                {problem.difficulty}
              </span>
            </h1>

            {/* Solve on other platforms */}
            <div className="flex items-center space-x-3 mt-3 flex-wrap gap-y-2 select-none">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Solve on:</span>
              
              {/* LeetCode Button */}
              {isPlatformAvailable('leetcode', problem.masterNumber, problem.topicName) ? (
                <a
                  href={getLeetCodeUrl(problem.name)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-[10px] font-extrabold bg-[#ffa116]/10 text-[#ffa116] border border-[#ffa116]/30 hover:border-[#ffa116] hover:bg-[#ffa116]/20 shadow-[0_0_8px_rgba(255,161,22,0.15)] transition-all hover:scale-105"
                >
                  <span className="w-2 h-2 rounded-full bg-[#ffa116]" />
                  <span>LeetCode</span>
                </a>
              ) : (
                <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-800/40 text-slate-500 border border-slate-700/30 cursor-not-allowed select-none">
                  <span className="w-2 h-2 rounded-full bg-slate-600" />
                  <span>LeetCode</span>
                </div>
              )}

              {/* GeeksforGeeks Button */}
              {isPlatformAvailable('gfg', problem.masterNumber, problem.topicName) ? (
                <a
                  href={`https://www.geeksforgeeks.org/explore?page=1&search=${encodeURIComponent(problem.name)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-[10px] font-extrabold bg-[#2f8d46]/10 text-[#2f8d46] border border-[#2f8d46]/30 hover:border-[#2f8d46] hover:bg-[#2f8d46]/20 shadow-[0_0_8px_rgba(47,141,70,0.15)] transition-all hover:scale-105"
                >
                  <span className="w-2 h-2 rounded-full bg-[#2f8d46]" />
                  <span>GeeksforGeeks</span>
                </a>
              ) : (
                <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-800/40 text-slate-500 border border-slate-700/30 cursor-not-allowed select-none opacity-40">
                  <span className="w-2 h-2 rounded-full bg-slate-600" />
                  <span>GeeksforGeeks</span>
                </div>
              )}

              {/* TakeUForward Button */}
              {isPlatformAvailable('tuf', problem.masterNumber, problem.topicName) ? (
                <a
                  href={`https://takeuforward.org/?s=${encodeURIComponent(problem.name)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-[10px] font-extrabold bg-[#3b82f6]/10 text-[#3b82f6] border border-[#3b82f6]/30 hover:border-[#3b82f6] hover:bg-[#3b82f6]/20 shadow-[0_0_8px_rgba(59,130,246,0.15)] transition-all hover:scale-105"
                >
                  <span className="w-2 h-2 rounded-full bg-[#3b82f6]" />
                  <span>TakeUForward</span>
                </a>
              ) : (
                <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-800/40 text-slate-500 border border-slate-700/30 cursor-not-allowed select-none opacity-40">
                  <span className="w-2 h-2 rounded-full bg-slate-600" />
                  <span>TakeUForward</span>
                </div>
              )}
            </div>
          </div>

          {details ? (
            <div className="space-y-6">
                        {/* Problem Description Content */}
              <div className="space-y-4 text-slate-200">
                <div>
                  <h3 className="text-xs font-extrabold text-slate-200 uppercase tracking-wider mb-2 font-mono">Description</h3>
                  <div className="text-[14px] leading-relaxed text-slate-200 font-medium">{renderMarkdown(details.problemStatement)}</div>
                </div>

                {/* Input / Output Format */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-900 pt-4">
                  <div>
                    <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">Input Format</h4>
                    <div className="text-[13.5px] text-slate-200 font-medium">{renderMarkdown(details.inputFormat)}</div>
                  </div>
                  <div>
                    <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">Output Format</h4>
                    <div className="text-[13.5px] text-slate-200 font-medium">{renderMarkdown(details.outputFormat)}</div>
                  </div>
                </div>

                {/* Examples */}
                <div className="space-y-3 border-t border-slate-900 pt-4">
                  <h3 className="text-xs font-extrabold text-slate-200 uppercase tracking-wider font-mono">Examples</h3>
                  {details.examples && details.examples.map((ex, idx) => (
                    <div key={idx} className="bg-slate-955/60 border border-slate-900 rounded-xl p-4 space-y-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Example {idx + 1}</span>
                      <div className="font-mono text-[13px] space-y-1">
                        <div className="text-slate-200 font-medium"><span className="text-slate-500 font-bold">Input:</span> {ex.input}</div>
                        <div className="text-emerald-300 font-bold"><span className="text-slate-500 font-bold">Output:</span> {ex.output}</div>
                      </div>
                      {ex.explanation && (
                        <div className="text-slate-350 text-[13px] mt-2 border-t border-slate-900/60 pt-2 font-sans leading-relaxed font-medium">
                          <span className="text-slate-400 font-black block text-[9px] uppercase mb-0.5 font-mono">Explanation:</span>
                          {ex.explanation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Constraints */}
                <div className="border-t border-slate-900 pt-4 space-y-2">
                  <h3 className="text-xs font-extrabold text-slate-200 uppercase tracking-wider font-mono">Constraints</h3>
                  <ul className="space-y-1.5">
                    {details.constraints && details.constraints.map((c, idx) => (
                      <li key={idx} className="text-[13px] text-slate-200 font-mono flex items-center space-x-2 font-medium">
                        <span className="h-1.5 w-1.5 rounded-full bg-slate-500"></span>
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Edge cases & Follow Up */}
                {(details.edgeCases?.length > 0 || details.followUp) && (
                  <div className="border-t border-slate-900 pt-4 space-y-3">
                    {details.edgeCases?.length > 0 && (
                      <div>
                        <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">Challenge Edge Cases</h4>
                        <ul className="space-y-1.5">
                          {details.edgeCases.map((e, idx) => (
                            <li key={idx} className="text-[13px] text-slate-200 font-sans flex items-center space-x-2 font-medium">
                              <span className="h-1.5 w-1.5 rounded-full bg-red-500/50"></span>
                              <span>{e}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {details.followUp && (
                      <div>
                        <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1 font-mono">Follow Up Challenge</h4>
                        <div className="text-[13px] text-slate-200 italic font-medium">{renderMarkdown(details.followUp)}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* HINTS & ACCORDION SECTIONS */}
              <div className="border-t border-slate-800/80 pt-6 space-y-4">
                <h3 className="text-sm font-black text-slate-200 uppercase tracking-wider flex items-center space-x-2">
                  <span>Hints & Strategy Guide</span>
                </h3>

                {!notes.thinkingChecked ? (
                  /* Locked Banner */
                  <div className="border border-slate-900 bg-slate-950/60 rounded-xl p-6 flex flex-col items-center text-center space-y-3">
                    <Lock className="h-6 w-6 text-slate-600 animate-pulse" />
                    <div>
                      <p className="text-xs font-bold text-slate-400">Tactical Strategy Locked</p>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Think first. Complete the Approach Builder and validate your reasoning to unlock solutions.
                      </p>
                    </div>
                  </div>
                ) : (
                  /* Unlocked Accordion Deck */
                  <div className="space-y-2">
                    
                    {/* Hint 1 */}
                    <div className="border border-slate-900 rounded-xl overflow-hidden bg-slate-955/20">
                      <button
                        onClick={() => {
                          setOpenAccordion(openAccordion === 'hint1' ? null : 'hint1');
                          setUnlockedHintCount(Math.max(unlockedHintCount, 2));
                        }}
                        className="w-full px-4 py-3 flex items-center justify-between text-slate-300 hover:text-slate-100 text-xs font-bold font-mono transition-smooth bg-slate-900/40"
                      >
                        <span className="flex items-center space-x-2">
                          <HelpCircle className="h-4 w-4 text-blue-400" />
                          <span>▶ Hint 1</span>
                        </span>
                        <span>{openAccordion === 'hint1' ? <ChevronUp className="h-4 w-4"/> : <ChevronDown className="h-4 w-4"/>}</span>
                      </button>
                      {openAccordion === 'hint1' && (
                        <div className="p-4 border-t border-slate-900 text-xs text-slate-350 leading-relaxed font-sans">
                          {details.hints && details.hints[0]}
                        </div>
                      )}
                    </div>

                    {/* Hint 2 */}
                    <div className="border border-slate-900 rounded-xl overflow-hidden bg-slate-955/20">
                      <button
                        onClick={() => {
                          if (unlockedHintCount >= 2) {
                            setOpenAccordion(openAccordion === 'hint2' ? null : 'hint2');
                            setUnlockedHintCount(Math.max(unlockedHintCount, 3));
                          }
                        }}
                        className={`w-full px-4 py-3 flex items-center justify-between text-xs font-bold font-mono transition-smooth bg-slate-900/40 ${
                          unlockedHintCount < 2 ? 'opacity-40 cursor-not-allowed' : 'text-slate-300 hover:text-slate-100'
                        }`}
                      >
                        <span className="flex items-center space-x-2">
                          {unlockedHintCount < 2 ? <Lock className="h-3.5 w-3.5" /> : <HelpCircle className="h-4 w-4 text-blue-400" />}
                          <span>▶ Hint 2</span>
                        </span>
                        <span>{openAccordion === 'hint2' ? <ChevronUp className="h-4 w-4"/> : <ChevronDown className="h-4 w-4"/>}</span>
                      </button>
                      {openAccordion === 'hint2' && unlockedHintCount >= 2 && (
                        <div className="p-4 border-t border-slate-900 text-xs text-slate-350 leading-relaxed font-sans">
                          {details.hints && details.hints[1]}
                        </div>
                      )}
                    </div>

                    {/* Hint 3 */}
                    <div className="border border-slate-900 rounded-xl overflow-hidden bg-slate-955/20">
                      <button
                        onClick={() => {
                          if (unlockedHintCount >= 3) {
                            setOpenAccordion(openAccordion === 'hint3' ? null : 'hint3');
                          }
                        }}
                        className={`w-full px-4 py-3 flex items-center justify-between text-xs font-bold font-mono transition-smooth bg-slate-900/40 ${
                          unlockedHintCount < 3 ? 'opacity-40 cursor-not-allowed' : 'text-slate-300 hover:text-slate-100'
                        }`}
                      >
                        <span className="flex items-center space-x-2">
                          {unlockedHintCount < 3 ? <Lock className="h-3.5 w-3.5" /> : <HelpCircle className="h-4 w-4 text-blue-400" />}
                          <span>▶ Hint 3</span>
                        </span>
                        <span>{openAccordion === 'hint3' ? <ChevronUp className="h-4 w-4"/> : <ChevronDown className="h-4 w-4"/>}</span>
                      </button>
                      {openAccordion === 'hint3' && unlockedHintCount >= 3 && (
                        <div className="p-4 border-t border-slate-900 text-xs text-slate-350 leading-relaxed font-sans">
                          {details.hints && details.hints[2]}
                        </div>
                      )}
                    </div>

                    {/* Observation */}
                    <div className="border border-slate-900 rounded-xl overflow-hidden bg-slate-955/20">
                      <button
                        onClick={() => setOpenAccordion(openAccordion === 'observation' ? null : 'observation')}
                        className="w-full px-4 py-3 flex items-center justify-between text-slate-300 hover:text-slate-100 text-xs font-bold font-mono transition-smooth bg-slate-900/40"
                      >
                        <span className="flex items-center space-x-2">
                          <Brain className="h-4 w-4 text-emerald-400" />
                          <span>▶ Observation Insights</span>
                        </span>
                        <span>{openAccordion === 'observation' ? <ChevronUp className="h-4 w-4"/> : <ChevronDown className="h-4 w-4"/>}</span>
                      </button>
                      {openAccordion === 'observation' && (
                        loadingSolutions ? renderSolutionLoadingPlaceholder() : (
                          <div className="p-4 border-t border-slate-900 text-xs text-slate-355 leading-relaxed font-sans">
                            {renderMarkdown(details.observation)}
                          </div>
                        )
                      )}
                    </div>

                    {/* Pattern */}
                    <div className="border border-slate-900 rounded-xl overflow-hidden bg-slate-955/20">
                      <button
                        onClick={() => setOpenAccordion(openAccordion === 'pattern' ? null : 'pattern')}
                        className="w-full px-4 py-3 flex items-center justify-between text-slate-300 hover:text-slate-100 text-xs font-bold font-mono transition-smooth bg-slate-900/40"
                      >
                        <span className="flex items-center space-x-2">
                          <Brain className="h-4 w-4 text-emerald-400" />
                          <span>▶ Optimal Pattern Category</span>
                        </span>
                        <span>{openAccordion === 'pattern' ? <ChevronUp className="h-4 w-4"/> : <ChevronDown className="h-4 w-4"/>}</span>
                      </button>
                      {openAccordion === 'pattern' && (
                        loadingSolutions ? renderSolutionLoadingPlaceholder() : (
                          <div className="p-4 border-t border-slate-900 text-xs text-slate-200 font-bold font-sans">
                            Optimal Pattern: <span className="text-blue-400">{details.pattern}</span>
                          </div>
                        )
                      )}
                    </div>

                    {/* Approach */}
                    <div className="border border-slate-900 rounded-xl overflow-hidden bg-slate-955/20">
                      <button
                        onClick={() => setOpenAccordion(openAccordion === 'approach' ? null : 'approach')}
                        className="w-full px-4 py-3 flex items-center justify-between text-slate-300 hover:text-slate-100 text-xs font-bold font-mono transition-smooth bg-slate-900/40"
                      >
                        <span className="flex items-center space-x-2">
                          <Brain className="h-4 w-4 text-emerald-400" />
                          <span>▶ Optimal Approach Strategy</span>
                        </span>
                        <span>{openAccordion === 'approach' ? <ChevronUp className="h-4 w-4"/> : <ChevronDown className="h-4 w-4"/>}</span>
                      </button>
                      {openAccordion === 'approach' && (
                        loadingSolutions ? renderSolutionLoadingPlaceholder() : (
                          <div className="p-4 border-t border-slate-900 text-xs text-slate-350 leading-relaxed font-sans">
                            {renderMarkdown(details.approach)}
                          </div>
                        )
                      )}
                    </div>

                    {/* Complexities */}
                    <div className="border border-slate-900 rounded-xl overflow-hidden bg-slate-955/20">
                      <button
                        onClick={() => setOpenAccordion(openAccordion === 'complexity' ? null : 'complexity')}
                        className="w-full px-4 py-3 flex items-center justify-between text-slate-300 hover:text-slate-100 text-xs font-bold font-mono transition-smooth bg-slate-900/40"
                      >
                        <span className="flex items-center space-x-2">
                          <Brain className="h-4 w-4 text-emerald-400" />
                          <span>▶ Optimal Complexities</span>
                        </span>
                        <span>{openAccordion === 'complexity' ? <ChevronUp className="h-4 w-4"/> : <ChevronDown className="h-4 w-4"/>}</span>
                      </button>
                      {openAccordion === 'complexity' && (
                        loadingSolutions ? renderSolutionLoadingPlaceholder() : (
                          <div className="p-4 border-t border-slate-900 text-xs space-y-2 font-mono">
                            <div className="text-slate-300">Time Complexity: <span className="text-emerald-400 font-bold">{details.optimalTimeComplexity}</span></div>
                            <div className="text-slate-300">Space Complexity: <span className="text-emerald-400 font-bold">{details.optimalSpaceComplexity}</span></div>
                          </div>
                        )
                      )}
                    </div>

                    {/* Full Explanation */}
                    <div className="border border-slate-900 rounded-xl overflow-hidden bg-slate-955/20">
                      <button
                        onClick={() => setOpenAccordion(openAccordion === 'explanation' ? null : 'explanation')}
                        className="w-full px-4 py-3 flex items-center justify-between text-slate-300 hover:text-slate-100 text-xs font-bold font-mono transition-smooth bg-slate-900/40"
                      >
                        <span className="flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-amber-400" />
                          <span>▶ Optimal Explanation Walkthrough</span>
                        </span>
                        <span>{openAccordion === 'explanation' ? <ChevronUp className="h-4 w-4"/> : <ChevronDown className="h-4 w-4"/>}</span>
                      </button>
                      {openAccordion === 'explanation' && (
                        loadingSolutions ? renderSolutionLoadingPlaceholder() : (
                          <div className="p-4 border-t border-slate-900 text-xs text-slate-350 leading-relaxed font-sans">
                            {renderMarkdown(details.fullExplanation)}
                          </div>
                        )
                      )}
                    </div>

                    {/* Reference Solution */}
                    <div className="border border-slate-900 rounded-xl overflow-hidden bg-slate-955/20">
                      <button
                        onClick={() => setOpenAccordion(openAccordion === 'solution' ? null : 'solution')}
                        className="w-full px-4 py-3 flex items-center justify-between text-slate-300 hover:text-slate-100 text-xs font-bold font-mono transition-smooth bg-slate-900/40"
                      >
                        <span className="flex items-center space-x-2">
                          <Code className="h-4 w-4 text-emerald-400" />
                          <span>▶ Reference Solution</span>
                        </span>
                        <span>{openAccordion === 'solution' ? <ChevronUp className="h-4 w-4"/> : <ChevronDown className="h-4 w-4"/>}</span>
                      </button>
                      {openAccordion === 'solution' && (
                        loadingSolutions ? renderSolutionLoadingPlaceholder() : (
                          <div className="p-4 border-t border-slate-900 space-y-4">
                            {!revealSolution ? (
                              <div className="text-center py-2">
                                <button
                                  onClick={() => setRevealSolution(true)}
                                  className="px-4 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/35 text-xs font-bold text-emerald-400 transition-smooth"
                                >
                                  Reveal Reference Solution
                                </button>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block font-mono">Reference Code (C++):</span>
                                <div className="h-64 rounded-xl overflow-hidden border border-slate-900 bg-[#1e1e1e]">
                                  <MonacoEditor
                                    height="100%"
                                    language="cpp"
                                    theme="vs-dark"
                                    value={details.referenceSolution || '// Code not available.'}
                                    options={{
                                      readOnly: true,
                                      minimap: { enabled: false },
                                      scrollBeyondLastLine: false,
                                      automaticLayout: true,
                                      fontSize: 12,
                                      fontFamily: "'Fira Code', 'Courier New', monospace",
                                    }}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      )}
                    </div>

                  </div>
                )}
              </div>

            </div>
          ) : (
            <p className="text-xs text-slate-500 font-sans italic">Details could not be fetched.</p>
          )}

        </div>

        {/* Splitter slider handler */}
        <div
          onMouseDown={startResizing}
          className="hidden lg:flex w-2 cursor-col-resize hover:bg-blue-500/20 active:bg-blue-500/40 rounded-full bg-slate-900 border border-slate-800 transition-all select-none items-center justify-center group"
          title="Drag to resize panel spacing"
        >
          <div className="w-1.5 h-10 rounded bg-slate-700 group-hover:bg-blue-400 group-active:bg-blue-400 transition-colors" />
        </div>

        {/* RIGHT PANEL: Workspace containing Timer, Approach Builder and Monaco IDE */}
        <div 
          className="flex-grow flex flex-col space-y-4"
          style={isLargeScreen ? { flex: `0 0 calc(${100 - leftWidthPercent}% - 0.5rem)` } : undefined}
        >
          
          {!thinkingStarted ? (
            /* STAGE 1: Thinking Mode selection selector */
            <div className="flex-1 glass-panel rounded-2xl p-8 flex flex-col items-center justify-center text-center space-y-6">
              <div className="p-4 bg-primary/10 rounded-full text-primary border border-primary/20">
                <Brain className="h-10 w-10 animate-pulse" />
              </div>
              
              <div>
                <h3 className="text-lg font-black text-slate-100">Ready to Think First?</h3>
                <p className="text-slate-400 text-xs mt-2 max-w-sm font-sans">
                  PatternForge prioritizes analytical design. Lock coding to read the description and formulate the optimal time, space, and strategy predictions first.
                </p>
              </div>

              {!showCustomInput ? (
                <div className="space-y-4 w-full max-w-xs">
                  <div className="grid grid-cols-3 gap-2">
                    {[2, 5, 10, 15, 20].map(mins => (
                      <button
                        key={mins}
                        onClick={() => startTimer(mins)}
                        className="py-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-blue-500/40 text-xs font-bold text-slate-300 transition-smooth"
                      >
                        {mins} min
                      </button>
                    ))}
                    <button
                      onClick={() => setShowCustomInput(true)}
                      className="py-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-xs font-bold text-slate-400 transition-smooth"
                    >
                      Custom
                    </button>
                  </div>
                  
                  <button
                    onClick={() => {
                      setThinkingStarted(true);
                      setNotes({ ...notes, thinkingChecked: true });
                    }}
                    className="w-full py-2.5 rounded-xl border border-slate-855 text-slate-400 hover:text-slate-205 text-xs font-bold transition-smooth"
                  >
                    Bypass to Coding Mode
                  </button>
                </div>
              ) : (
                <div className="space-y-3 w-full max-w-xs">
                  <input
                    type="number"
                    value={customMins}
                    onChange={(e) => setCustomMins(e.target.value)}
                    placeholder="Enter minutes..."
                    className="w-full glass-input rounded-xl p-3 text-xs text-center font-bold"
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setShowCustomInput(false)}
                      className="flex-1 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-400"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCustomTimerStart}
                      className="flex-1 py-2 rounded-xl bg-primary text-xs font-bold text-white shadow-glow-primary"
                    >
                      Start
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* STAGE 2 & 3: Unlocked / Working panels */
            <div className="flex-1 glass-panel rounded-2xl p-5 flex flex-col space-y-4">
              
              {/* Header Tab Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800/80 pb-3 gap-2">
                <div className="flex items-center space-x-2">
                  <Brain className="h-4.5 w-4.5 text-blue-400" />
                  <span className="text-xs font-black text-slate-200 uppercase tracking-wider">Workspace Panel</span>
                </div>
                
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setActiveTab('approach')}
                    className={`px-4 py-2 text-xs font-bold uppercase tracking-widest transition-smooth ${
                      activeTab === 'approach'
                        ? 'bg-text-primary text-background border border-text-primary'
                        : 'border border-border text-text-secondary hover:text-text-primary hover:border-text-primary'
                    }`}
                  >
                    Approach Builder
                  </button>
                  
                  <button
                    disabled={!notes.thinkingChecked}
                    onClick={() => setActiveTab('coding')}
                    className={`px-4 py-2 text-xs font-bold uppercase tracking-widest transition-smooth flex items-center space-x-2 ${
                      !notes.thinkingChecked
                        ? 'opacity-40 cursor-not-allowed border border-border/40 text-text-secondary/40'
                        : activeTab === 'coding'
                        ? 'bg-text-primary text-background border border-text-primary'
                        : 'border border-border text-text-secondary hover:text-text-primary hover:border-text-primary'
                    }`}
                  >
                    {!notes.thinkingChecked && <Lock className="h-3.5 w-3.5" />}
                    <span>Coding Workspace</span>
                  </button>
                  
                  <button
                    disabled={!notes.thinkingChecked}
                    onClick={() => setActiveTab('solutions')}
                    className={`px-4 py-2 text-xs font-bold uppercase tracking-widest transition-smooth flex items-center space-x-2 ${
                      !notes.thinkingChecked
                        ? 'opacity-40 cursor-not-allowed border border-border/40 text-text-secondary/40'
                        : activeTab === 'solutions'
                        ? 'bg-text-primary text-background border border-text-primary'
                        : 'border border-border text-text-secondary hover:text-text-primary hover:border-text-primary'
                    }`}
                  >
                    {!notes.thinkingChecked && <Lock className="h-3.5 w-3.5" />}
                    <span>Solution Details</span>
                  </button>

                  <button
                    disabled={!notes.thinkingChecked}
                    onClick={() => setActiveTab('reflections')}
                    className={`px-4 py-2 text-xs font-bold uppercase tracking-widest transition-smooth flex items-center space-x-2 ${
                      !notes.thinkingChecked
                        ? 'opacity-40 cursor-not-allowed border border-border/40 text-text-secondary/40'
                        : activeTab === 'reflections'
                        ? 'bg-text-primary text-background border border-text-primary'
                        : 'border border-border text-text-secondary hover:text-text-primary hover:border-text-primary'
                    }`}
                  >
                    {!notes.thinkingChecked && <Lock className="h-3.5 w-3.5" />}
                    <span>Reflection Notes</span>
                  </button>
                </div>
              </div>

              {/* RENDER TABS */}

              {/* TAB 1: APPROACH BUILDER */}
              {activeTab === 'approach' && (
                <div className="space-y-4 flex flex-col flex-1">
                  <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                    <div className="flex items-center space-x-2">
                      <Brain className="h-4.5 w-4.5 text-blue-400" />
                      <span className="text-xs font-black text-slate-200 uppercase tracking-wider">Approach Builder & Predictions</span>
                    </div>
                    {notes.thinkingChecked && (
                      <div className="flex items-center space-x-1 bg-emerald-500/10 border border-emerald-500/20 px-2 rounded-full text-emerald-400 text-[9px] font-extrabold uppercase">
                        <CheckCircle className="h-2.5 w-2.5" />
                        <span>Verified</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4 flex-1 overflow-y-auto pr-1">
                      {/* AI Review Match Banner if checked */}
                      {notes.thinkingChecked && notes.aiFeedback && (
                        <div className="bg-slate-955 border border-slate-900 rounded-xl p-4 space-y-3">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            <div className="bg-slate-900/50 border border-slate-855 p-2.5 rounded-lg text-center">
                              <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider block">Pattern Match</span>
                              <span className={`text-[10px] font-black block mt-0.5 ${
                                notes.patternsMatchResult?.toLowerCase().includes('incorrect') ? 'text-red-400' :
                                notes.patternsMatchResult?.toLowerCase().includes('partially') ? 'text-amber-400' : 'text-emerald-400'
                              }`}>
                                {notes.patternsMatchResult || 'N/A'}
                              </span>
                            </div>
                            <div className="bg-slate-900/50 border border-slate-855 p-2.5 rounded-lg text-center">
                              <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider block">Time Guess</span>
                              <span className={`text-[10px] font-black block mt-0.5 ${
                                notes.timeComplexityResult?.toLowerCase().includes('incorrect') ? 'text-red-400' : 'text-emerald-400'
                              }`}>
                                {notes.timeComplexityResult || 'N/A'}
                              </span>
                            </div>
                            <div className="bg-slate-900/50 border border-slate-855 p-2.5 rounded-lg text-center">
                              <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider block">Space Guess</span>
                              <span className={`text-[10px] font-black block mt-0.5 ${
                                notes.spaceComplexityResult?.toLowerCase().includes('incorrect') ? 'text-red-400' : 'text-emerald-400'
                              }`}>
                                {notes.spaceComplexityResult || 'N/A'}
                              </span>
                            </div>
                            <div className="bg-slate-900/50 border border-slate-855 p-2.5 rounded-lg text-center col-span-2 md:col-span-1">
                              <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider block">Explanation Score</span>
                              <span className="text-[10px] font-black block mt-0.5 text-blue-400">
                                {notes.explanationScore || 'N/A'}
                              </span>
                            </div>
                          </div>
                          <div className="text-xs text-slate-350 border-t border-slate-900/80 pt-3 leading-relaxed max-h-48 overflow-y-auto font-sans pr-1">
                            <span className="text-slate-400 font-bold block text-[9px] uppercase mb-1 font-mono">Gemini Mentor Review:</span>
                            {renderMarkdown(notes.aiFeedback)}
                          </div>
                        </div>
                      )}

                      <div className="space-y-4">
                        {/* Multi-select patterns pills */}
                        <div>
                          <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-wider mb-2 font-mono">Candidate Pattern(s)</label>
                          <div className="flex flex-wrap gap-1.5 p-2 bg-slate-955/40 rounded-xl border border-slate-900">
                            {ALL_DSA_PATTERNS.map((pat) => {
                              const selectedList = notes.possiblePatterns ? notes.possiblePatterns.split(',') : [];
                              const isSelected = selectedList.includes(pat);
                              
                              let pillClass = '';
                              if (notes.thinkingChecked && details) {
                                const correctPattern = details.pattern;
                                if (pat === correctPattern) {
                                  pillClass = 'bg-emerald-500/20 border border-emerald-500/35 text-emerald-400';
                                } else if (isSelected) {
                                  pillClass = 'bg-orange-500/20 border border-orange-500/35 text-orange-400';
                                } else {
                                  pillClass = 'bg-slate-900/60 border border-slate-855 text-slate-650 opacity-40';
                                }
                              } else {
                                pillClass = isSelected
                                  ? 'bg-primary/20 border border-primary/30 text-blue-400'
                                  : 'bg-slate-900/60 border border-slate-855 text-slate-500 hover:text-slate-300 disabled:opacity-70';
                              }

                              return (
                                <button
                                  key={pat}
                                  type="button"
                                  disabled={notes.thinkingChecked}
                                  onClick={() => handlePatternToggle(pat)}
                                  className={`px-2.5 py-1 rounded-lg text-[9px] font-bold transition-smooth ${pillClass}`}
                                >
                                  {pat}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Complexities guesses */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-wider mb-1 font-mono">Expected Time</label>
                            {notes.thinkingChecked && details ? (
                              <div className="space-y-1">
                                <div className={`w-full rounded-xl px-3 py-2 text-xs font-bold font-mono border flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1.5 ${
                                  isComplexityMatch(notes.timeComplexityGuess, details.optimalTimeComplexity)
                                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                    : 'bg-orange-500/10 border-orange-500/30 text-orange-400'
                                }`}>
                                  <span>Guessed: {notes.timeComplexityGuess || 'None'}</span>
                                  {!isComplexityMatch(notes.timeComplexityGuess, details.optimalTimeComplexity) && (
                                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/30 font-extrabold font-mono">Correct: {details.optimalTimeComplexity}</span>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <>
                                <input
                                  type="text"
                                  list="time-guesses"
                                  disabled={notes.thinkingChecked}
                                  value={notes.timeComplexityGuess}
                                  onChange={(e) => setNotes({ ...notes, timeComplexityGuess: e.target.value })}
                                  className="w-full glass-input rounded-xl px-3 py-2 text-xs font-bold font-sans outline-none focus:border-emerald-500/40"
                                  placeholder="Select or type..."
                                />
                                <datalist id="time-guesses">
                                  {COMPLEXITY_GUESSES.filter(cg => cg !== "Other").map(cg => (
                                    <option key={cg} value={cg} />
                                  ))}
                                </datalist>
                              </>
                            )}
                          </div>

                          <div>
                            <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-wider mb-1 font-mono">Expected Space</label>
                            {notes.thinkingChecked && details ? (
                              <div className="space-y-1">
                                <div className={`w-full rounded-xl px-3 py-2 text-xs font-bold font-mono border flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1.5 ${
                                  isComplexityMatch(notes.spaceComplexityGuess, details.optimalSpaceComplexity)
                                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                    : 'bg-orange-500/10 border-orange-500/30 text-orange-400'
                                }`}>
                                  <span>Guessed: {notes.spaceComplexityGuess || 'None'}</span>
                                  {!isComplexityMatch(notes.spaceComplexityGuess, details.optimalSpaceComplexity) && (
                                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/30 font-extrabold font-mono">Correct: {details.optimalSpaceComplexity}</span>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <>
                                <input
                                  type="text"
                                  list="space-guesses"
                                  disabled={notes.thinkingChecked}
                                  value={notes.spaceComplexityGuess}
                                  onChange={(e) => setNotes({ ...notes, spaceComplexityGuess: e.target.value })}
                                  className="w-full glass-input rounded-xl px-3 py-2 text-xs font-bold font-sans outline-none focus:border-emerald-500/40"
                                  placeholder="Select or type..."
                                />
                                <datalist id="space-guesses">
                                  {SPACE_COMPLEXITY_GUESSES.filter(cg => cg !== "Other").map(cg => (
                                    <option key={cg} value={cg} />
                                  ))}
                                </datalist>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Solution approach explanation */}
                        <div>
                          <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-wider mb-1 font-mono">Solution Approach Strategy (Written Explanation)</label>
                          <textarea
                            disabled={notes.thinkingChecked}
                            value={notes.approach}
                            onChange={(e) => setNotes({ ...notes, approach: e.target.value })}
                            placeholder="Describe your solution strategy here (include key observations, brute force ideas, and your chosen optimal steps). Gemini will cross-verify this explanation for logical bugs, edge cases, and pattern correctness."
                            className="w-full h-44 glass-input rounded-xl p-3 text-[13px] font-sans leading-relaxed"
                          />
                        </div>
                  </div>

                  {/* Validate Actions */}
                  {!notes.thinkingChecked && (
                    <button
                      onClick={handleCheckThinking}
                      disabled={checkingThinking}
                      className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 shadow-glow-primary text-xs font-bold text-white flex items-center justify-center space-x-2 transition-smooth disabled:opacity-50 mt-2"
                    >
                      {checkingThinking ? (
                        <>
                          <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                          <span>Evaluating Predictions...</span>
                        </>
                      ) : (
                        <>
                          <Brain className="h-4 w-4" />
                          <span>Check My Thinking & Solve</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            )}

              {/* TAB 2: CODING WORKSPACE */}
              {activeTab === 'coding' && (
                <div className="space-y-4 flex flex-col flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-900 pb-2.5">
                    <div className="flex items-center space-x-2">
                      <Code className="h-4 w-4 text-emerald-400" />
                      <span className="text-xs font-black text-slate-200 uppercase tracking-wider">Coding Environment</span>
                    </div>

                    {/* Run & Submit controls at middle top */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={handleRun}
                        disabled={running || submitting || !isCodeEditable}
                        className="px-3.5 py-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-[10px] font-extrabold text-slate-300 flex items-center space-x-1.5 transition-smooth disabled:opacity-40 rounded-lg cursor-pointer"
                      >
                        <Play className="h-3 w-3 fill-slate-300 text-slate-300" />
                        <span>Run Code</span>
                      </button>
                      <button
                        onClick={handleSubmitCode}
                        disabled={running || submitting || !isCodeEditable}
                        className="px-3.5 py-1.5 bg-primary hover:bg-primary-hover text-[10px] font-extrabold text-white flex items-center space-x-1.5 transition-smooth disabled:opacity-40 rounded-lg cursor-pointer shadow-glow-primary"
                      >
                        <Award className="h-3.5 w-3.5 text-white" />
                        <span>Submit Code</span>
                      </button>
                    </div>

                    <div className="flex items-center space-x-2">
                      <select
                        value={language}
                        onChange={(e) => handleLanguageChange(e.target.value as any)}
                        className="bg-slate-900 border border-slate-855 text-xs text-slate-300 font-bold rounded-lg px-2.5 py-1 outline-none cursor-pointer"
                      >
                        <option value="cpp">C++</option>
                        <option value="java">Java</option>
                      </select>
                    </div>
                  </div>

                  {/* Vertically taller Monaco editor container */}
                  <div className="flex-1 min-h-[500px] border border-slate-900 rounded-xl overflow-hidden bg-[#1e1e1e] relative">
                    <MonacoEditor
                      height="100%"
                      language={language}
                      theme="vs-dark"
                      value={code}
                      onChange={(val) => setCode(val || '')}
                      options={{
                        fontSize: 13,
                        minimap: { enabled: false },
                        tabSize: 4,
                        lineNumbersMinChars: 3,
                        scrollBeyondLastLine: false,
                        readOnly: !isCodeEditable
                      }}
                    />
                  </div>

                  {/* Stdin Inputs */}
                  <div>
                    <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block mb-1 font-mono">Custom Input (Stdin):</span>
                    <textarea
                      value={customInput}
                      onChange={(e) => setCustomInput(e.target.value)}
                      placeholder="Mock inputs here..."
                      className="w-full h-12 glass-input rounded-xl px-3 py-2 text-xs font-mono resize-none"
                    />
                  </div>

                  {/* Console Terminal Logs */}
                  <div className="h-28 rounded-xl bg-slate-950 border border-slate-900 p-3 overflow-y-auto font-mono text-[10px] space-y-1">
                    {running && <div className="text-blue-400 animate-pulse">Running compiler process...</div>}
                    {submitting && <div className="text-blue-400 animate-pulse">Running solutions test cases...</div>}
                    {testResult && (
                      <div className={`font-bold uppercase tracking-wider border-b border-slate-900 pb-1.5 mb-1.5 ${
                        testResult.status === 'SUBMIT_SUCCESS' ? 'text-emerald-400' : 'text-red-400'
                      }`}>
                        {testResult.status === 'SUBMIT_SUCCESS'
                          ? `Submission Passed (${testResult.passed}/${testResult.total})`
                          : `Submission Failed: ${testResult.status} (${testResult.passed}/${testResult.total} passed)`
                        }
                      </div>
                    )}
                    {consoleOutput && (
                      <div className="text-slate-300">
                        <span className="text-slate-500 font-semibold block uppercase tracking-wider text-[8px] mb-0.5">Stdout:</span>
                        <pre className="whitespace-pre-wrap">{consoleOutput}</pre>
                      </div>
                    )}
                    {consoleError && (
                      <div className="text-red-400">
                        <span className="text-red-500 font-semibold block uppercase tracking-wider text-[8px] mb-0.5">Stderr / Output:</span>
                        <pre className="whitespace-pre-wrap">{consoleError}</pre>
                      </div>
                    )}
                    {!consoleOutput && !consoleError && !running && !submitting && (
                      <div className="text-slate-600">Compiler output will display here.</div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: SOLUTIONS WORKSPACE */}
              {activeTab === 'solutions' && (
                loadingSolutions ? (
                  <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-4 animate-pulse">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider font-mono">Generating optimal reference codes...</p>
                  </div>
                ) : details && (() => {
                    const optimalCpp = (details.optimal?.code?.cpp || details.referenceSolutions?.cpp || details.referenceSolution || '').trim();
                const optimalApproach = (details.optimal?.approach || details.approach || '').trim();

                const bruteCpp = (details.bruteForce?.code?.cpp || '').trim();
                const bruteApproach = (details.bruteForce?.approach || '').trim();

                const betterCpp = (details.better?.code?.cpp || '').trim();
                const betterApproach = (details.better?.approach || '').trim();

                // A brute force is distinct if it exists and is different from optimal
                const hasDistinctBrute = details.bruteForce && 
                  bruteCpp !== '' && 
                  bruteCpp !== optimalCpp && 
                  bruteApproach !== optimalApproach;

                // A better solution is distinct if it exists and is different from both optimal and brute force
                const hasDistinctBetter = details.better && 
                  betterCpp !== '' && 
                  betterCpp !== optimalCpp && 
                  (!hasDistinctBrute || betterCpp !== bruteCpp) &&
                  betterApproach !== optimalApproach;

                const activeSubTab = (selectedSolutionTab === 'brute' && hasDistinctBrute)
                  ? 'brute'
                  : (selectedSolutionTab === 'better' && hasDistinctBetter)
                  ? 'better'
                  : 'optimal';

                const currentSol = (activeSubTab === 'brute' ? details.bruteForce : null)
                  || (activeSubTab === 'better' ? details.better : null)
                  || details.optimal
                  || {
                      approach: details.approach,
                      timeComplexity: details.optimalTimeComplexity,
                      spaceComplexity: details.optimalSpaceComplexity,
                      code: {
                        cpp: details.referenceSolutions?.cpp || details.referenceSolution || '',
                        java: details.referenceSolutions?.java || details.referenceSolution || ''
                      }
                    };

                return (
                  <div className="space-y-4 flex flex-col flex-1 overflow-y-auto pr-1">
                    <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                      <div className="flex items-center space-x-2">
                        <HelpCircle className="h-4 w-4 text-emerald-400" />
                        <span className="text-xs font-black text-slate-200 uppercase tracking-wider">Reference Solutions</span>
                      </div>
                      <select
                        value={solutionLanguage}
                        onChange={(e) => setSolutionLanguage(e.target.value as any)}
                        className="bg-slate-900 border border-slate-855 text-xs text-slate-300 font-bold rounded-lg px-2.5 py-1 outline-none cursor-pointer"
                      >
                        <option value="cpp">C++</option>
                        <option value="java">Java</option>
                      </select>
                    </div>

                    {/* Sub-Tab Selector for Brute Force, Better, Optimal */}
                    {(hasDistinctBrute || hasDistinctBetter) && (
                      <div className="flex border-b border-slate-900/60 pb-1 gap-2">
                        {hasDistinctBrute && (
                          <button
                            onClick={() => setSelectedSolutionTab('brute')}
                            className={`px-3 py-1.5 text-[11px] font-extrabold transition-smooth border-b-2 uppercase tracking-wider ${
                              activeSubTab === 'brute'
                                ? 'border-red-500 text-red-400'
                                : 'border-transparent text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            Brute Force
                          </button>
                        )}
                        {hasDistinctBetter && (
                          <button
                            onClick={() => setSelectedSolutionTab('better')}
                            className={`px-3 py-1.5 text-[11px] font-extrabold transition-smooth border-b-2 uppercase tracking-wider ${
                              activeSubTab === 'better'
                                ? 'border-amber-500 text-amber-400'
                                : 'border-transparent text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            Better
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedSolutionTab('optimal')}
                          className={`px-3 py-1.5 text-[11px] font-extrabold transition-smooth border-b-2 uppercase tracking-wider ${
                            activeSubTab === 'optimal'
                              ? 'border-emerald-500 text-emerald-400'
                              : 'border-transparent text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          Optimal
                        </button>
                      </div>
                    )}

                    {/* Details stats */}
                    <div className="grid grid-cols-2 gap-3 bg-slate-950/40 p-3 rounded-xl border border-slate-900">
                      <div className="text-xs">
                        <span className="text-slate-500 font-mono font-bold block uppercase text-[9px] mb-0.5">Time Complexity</span>
                        <span className="text-emerald-400 font-bold font-mono text-[13px]">{currentSol.timeComplexity}</span>
                      </div>
                      <div className="text-xs">
                        <span className="text-slate-500 font-mono font-bold block uppercase text-[9px] mb-0.5">Space Complexity</span>
                        <span className="text-emerald-400 font-bold font-mono text-[13px]">{currentSol.spaceComplexity}</span>
                      </div>
                    </div>

                    {/* Reference code display */}
                    <div className="space-y-2">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block font-mono">Solution Code:</span>
                      <div className="h-80 rounded-xl overflow-hidden border border-slate-900 bg-[#1e1e1e]">
                        <MonacoEditor
                          height="100%"
                          language={solutionLanguage === 'cpp' ? 'cpp' : 'java'}
                          theme="vs-dark"
                          value={
                            currentSol.code && currentSol.code[solutionLanguage]
                              ? currentSol.code[solutionLanguage]
                              : '// Reference solution code not available for this language.'
                          }
                          options={{
                            readOnly: true,
                            minimap: { enabled: false },
                            scrollBeyondLastLine: false,
                            automaticLayout: true,
                            fontSize: 12.5,
                            fontFamily: "'Fira Code', 'Courier New', monospace",
                          }}
                        />
                      </div>
                    </div>

                    {/* Explanation details */}
                    <div className="border-t border-slate-900 pt-3 space-y-3">
                      <div>
                        <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1 font-mono">Approach Details</h4>
                        <div className="text-xs text-slate-200 font-sans leading-relaxed">{renderMarkdown(currentSol.approach)}</div>
                      </div>
                      {selectedSolutionTab === 'optimal' && (
                        <div>
                          <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1 font-mono">Full Strategy Walkthrough</h4>
                          <div className="text-xs text-slate-200 font-sans leading-relaxed">{renderMarkdown(details.fullExplanation)}</div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()
            )}

              {/* TAB 4: REFLECTION NOTES (SEPARATE ROOT TAB) */}
              {activeTab === 'reflections' && (
                <div className="space-y-4 flex flex-col flex-1">
                  <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4.5 w-4.5 text-blue-400" />
                      <span className="text-xs font-black text-slate-200 uppercase tracking-wider">Reflection Notes & Learnings</span>
                    </div>
                  </div>

                  <div className="space-y-4 flex-1 overflow-y-auto pr-1">
                    <div>
                      <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-wider mb-1 font-mono">Common Pitfalls & Mistakes</label>
                      <textarea
                        value={notes.mistakes}
                        onChange={(e) => setNotes({ ...notes, mistakes: e.target.value })}
                        placeholder="What details did you overlook? Integer overflow? Null lists?"
                        className="w-full h-16 glass-input rounded-xl p-3 text-xs resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-wider mb-1 font-mono">Optimized Idea</label>
                      <textarea
                        value={notes.optimizedIdea}
                        onChange={(e) => setNotes({ ...notes, optimizedIdea: e.target.value })}
                        placeholder="Can we improve runtimes? Avoid auxiliary maps?"
                        className="w-full h-16 glass-input rounded-xl p-3 text-xs resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-wider mb-1 font-mono">Alternative Solutions</label>
                      <textarea
                        value={notes.alternativeSolution}
                        onChange={(e) => setNotes({ ...notes, alternativeSolution: e.target.value })}
                        placeholder="E.g. Queue BFS vs Stack DFS, binary search vs two pointers..."
                        className="w-full h-16 glass-input rounded-xl p-3 text-xs resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-wider mb-1 font-mono">Future Revision Reminders</label>
                      <textarea
                        value={notes.futureReminder}
                        onChange={(e) => setNotes({ ...notes, futureReminder: e.target.value })}
                        placeholder="E.g. Pay attention to array lengths during recursive returns..."
                        className="w-full h-16 glass-input rounded-xl p-3 text-xs resize-none"
                      />
                    </div>
                  </div>

                  {/* Manual Save Reflections Button */}
                  <button
                    onClick={async () => {
                      try {
                        await api.post(`/problems/${problemId}/notes`, notes);
                        alert('Reflection notes saved successfully!');
                      } catch (err) {
                        alert('Failed to save reflection notes.');
                      }
                    }}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 shadow-glow-primary text-xs font-bold text-white flex items-center justify-center space-x-2 transition-smooth"
                  >
                    <Save className="h-4 w-4" />
                    <span>Save Reflection Notes</span>
                  </button>
                </div>
              )}

            </div>
          )}

        </div>

      </motion.div>
    )}
  </AnimatePresence>

    </div>
  );
};

export default ProblemView;
