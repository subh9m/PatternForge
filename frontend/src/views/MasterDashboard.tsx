import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { 
  Flame, BookOpen, Code2, Database, Cpu, 
  GitBranch, Brain, Globe, Coffee, Atom, FolderGit2, 
  Calendar, Play, AlertTriangle, Plus, Sparkles, X, Pause,
  Sun, Moon, ShieldCheck, LogOut
} from 'lucide-react';

interface HeatmapDay {
  date: string;
  count: number;
  hasDailyTask?: boolean;
  isDailyTaskCompleted?: boolean;
  selectedModules?: string;
  completedModules?: string;
  revisionCount?: number;
  revisionTime?: number;
}

interface DashboardStats {
  currentStreak: number;
  problemsSolved: number;
  problemsAttempted: number;
  todayGoalSolved: number;
  todayGoalTarget: number;
  revisionDueTodayCount: number;
  todayRevisedCount: number;
  studyMinutes: number;
  revisionTimeTodaySecs?: number;
  monthlyHeatmap: HeatmapDay[];
}

const formatRevisionTime = (seconds: number): string => {
  if (!seconds || seconds <= 0) return "0m";
  const mins = Math.floor(seconds / 60);
  const hrs = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  if (hrs > 0) {
    return `${hrs}h ${remainingMins.toString().padStart(2, '0')}m`;
  }
  return `${mins}m`;
};

interface DailyTaskData {
  selectedModules: string;
  completedModules: string;
  targetDurations: string;
  remainingDurations?: string;
  elapsedDurations?: string;
  statuses?: string;
}

interface MasterDashboardProps {
  onEnterFocusMode: (
    portal: 'dsa' | 'stl' | 'sql' | 'os' | 'git' | 'aiml' | 'cn' | 'spring' | 'react' | 'projects',
    duration: number,
    remainingSeconds?: number
  ) => void;
  onGoToModules: () => void;
  onLogout: () => void;
}

const MODULES_CONFIG = [
  { id: 'dsa', name: 'DSA Practice', icon: Code2, color: 'text-text-primary', border: 'hover:border-accent hover:shadow-[0_0_15px_rgba(255,59,48,0.1)]', bg: 'bg-surface' },
  { id: 'stl', name: 'STL & Collections', icon: BookOpen, color: 'text-text-primary', border: 'hover:border-accent hover:shadow-[0_0_15px_rgba(255,59,48,0.1)]', bg: 'bg-surface' },
  { id: 'sql', name: 'SQL Playground', icon: Database, color: 'text-text-primary', border: 'hover:border-accent hover:shadow-[0_0_15px_rgba(255,59,48,0.1)]', bg: 'bg-surface' },
  { id: 'os', name: 'OS Revision', icon: Cpu, color: 'text-text-primary', border: 'hover:border-accent hover:shadow-[0_0_15px_rgba(255,59,48,0.1)]', bg: 'bg-surface' },
  { id: 'git', name: 'Git & GitHub', icon: GitBranch, color: 'text-text-primary', border: 'hover:border-accent hover:shadow-[0_0_15px_rgba(255,59,48,0.1)]', bg: 'bg-surface' },
  { id: 'aiml', name: 'AI / ML System', icon: Brain, color: 'text-text-primary', border: 'hover:border-accent hover:shadow-[0_0_15px_rgba(255,59,48,0.1)]', bg: 'bg-surface' },
  { id: 'cn', name: 'CN Revision', icon: Globe, color: 'text-text-primary', border: 'hover:border-accent hover:shadow-[0_0_15px_rgba(255,59,48,0.1)]', bg: 'bg-surface' },
  { id: 'spring', name: 'Spring Boot', icon: Coffee, color: 'text-text-primary', border: 'hover:border-accent hover:shadow-[0_0_15px_rgba(255,59,48,0.1)]', bg: 'bg-surface' },
  { id: 'react', name: 'React JS', icon: Atom, color: 'text-text-primary', border: 'hover:border-accent hover:shadow-[0_0_15px_rgba(255,59,48,0.1)]', bg: 'bg-surface' },
  { id: 'projects', name: 'Projects Architecture', icon: FolderGit2, color: 'text-text-primary', border: 'hover:border-accent hover:shadow-[0_0_15px_rgba(255,59,48,0.1)]', bg: 'bg-surface' }
] as const;

const MOTIVATION_QUOTES = [
  "Mastery is not a destination, it is a constant pursuit of pattern recognition.",
  "Great algorithms are simple ideas refined through relentless consistency.",
  "Success is the sum of small daily targets completed day in and day out.",
  "Your focus determines your reality. Enter flow mode and forge your path.",
  "One solved problem at a time, one focused session after another.",
  "Consistency is the ultimate competitive advantage."
];

const DURATIONS = [20, 25, 30, 35, 40, 45] as const;

const MasterDashboard: React.FC<MasterDashboardProps> = ({ onEnterFocusMode, onGoToModules, onLogout }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [dailyTask, setDailyTask] = useState<DailyTaskData>({
    selectedModules: '',
    completedModules: '',
    targetDurations: '',
    elapsedDurations: '',
    statuses: ''
  });
  
  const [loading, setLoading] = useState(true);
  const [selectedYear] = useState<number>(() => new Date().getFullYear());
  const [selectedDay, setSelectedDay] = useState<HeatmapDay | null>(null);
  const [heatmapError, setHeatmapError] = useState<string | null>(null);
  const [motivationQuote] = useState(() => MOTIVATION_QUOTES[Math.floor(Math.random() * MOTIVATION_QUOTES.length)]);

  // Reading Task Dropdown Creator State
  const [showCreator, setShowCreator] = useState(false);
  const [creatorModule, setCreatorModule] = useState<string>('');
  const [creatorDuration, setCreatorDuration] = useState<number>(25);

  // Theme State & Toggle Handler
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'light') {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
      return 'light';
    }
    document.documentElement.classList.add('dark');
    document.documentElement.classList.remove('light');
    return 'dark';
  });

  const toggleTheme = () => {
    if (theme === 'dark') {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setTheme('light');
    } else {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      localStorage.setItem('theme', 'dark');
      setTheme('dark');
    }
  };

  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return "Good Morning";
    if (hr < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const actualSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${actualSecs.toString().padStart(2, '0')}`;
  };

  const loadDashboardData = async (showSpinner = false) => {
    if (showSpinner) {
      setLoading(true);
    }
    setHeatmapError(null);

    // 1. Fetch dashboard stats
    try {
      const statsData = await api.get<DashboardStats>(`/dashboard/stats?year=${selectedYear}`);
      setStats(statsData);
    } catch (err: any) {
      console.error("Failed to load dashboard stats", err);
      setHeatmapError(err.message || String(err));
      if (!stats) {
        setStats({
          currentStreak: 0,
          problemsSolved: 0,
          problemsAttempted: 0,
          todayGoalSolved: 0,
          todayGoalTarget: 3,
          revisionDueTodayCount: 0,
          todayRevisedCount: 0,
          studyMinutes: 0,
          monthlyHeatmap: []
        });
      }
    }

    // 2. Fetch daily tasks selection
    try {
      const dailyData = await api.get<DailyTaskData>(`/daily-tasks/today`);
      setDailyTask(dailyData);
    } catch (err: any) {
      console.error("Failed to load daily tasks today data", err);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadDashboardData(stats === null);
  }, [selectedYear]);

  // 2AM IST Nightly Reset: Clear stale caches and re-fetch when the day rolls over
  useEffect(() => {
    const scheduleMidnightReset = () => {
      const now = new Date();
      // Read the user's configured reset hour from localStorage (set by Settings page, default 2)
      const resetHour = parseInt(localStorage.getItem('patternforge_reset_hour') || '2', 10);
      const nextReset = new Date();
      nextReset.setHours(resetHour, 0, 0, 0);
      if (nextReset <= now) {
        // Already past the reset hour today, schedule for tomorrow
        nextReset.setDate(nextReset.getDate() + 1);
      }
      const msUntilReset = nextReset.getTime() - now.getTime();

      const timer = setTimeout(() => {
        // Clear revision cache so the tab shows fresh pending state
        localStorage.removeItem('patternforge_revisions');
        // Reload dashboard data to get today's fresh empty daily task
        loadDashboardData(true);
        // Reschedule for the following day
        scheduleMidnightReset();
      }, msUntilReset);

      return timer;
    };

    const timer = scheduleMidnightReset();
    return () => clearTimeout(timer);
  }, []);

  // BUTTON 1: Add Task only (does not launch timer)
  const handleAddTaskOnly = async () => {
    if (!creatorModule) return;

    const selectedList = dailyTask.selectedModules ? dailyTask.selectedModules.split(',') : [];
    if (selectedList.includes(creatorModule)) {
      setShowCreator(false);
      return;
    }

    const nextSelected = [...selectedList, creatorModule];
    const selectedStr = nextSelected.join(',');

    // Parse target durations
    const durationMap = new Map<string, number>();
    if (dailyTask.targetDurations) {
      dailyTask.targetDurations.split(',').forEach(item => {
        const [id, dur] = item.split(':');
        if (id && dur) durationMap.set(id, parseInt(dur));
      });
    }
    durationMap.set(creatorModule, creatorDuration);
    const targetDurationsStr = nextSelected.map(id => `${id}:${durationMap.get(id) || 25}`).join(',');

    // Optimistically update the list in the UI immediately
    const originalDailyTask = { ...dailyTask };
    const statusList = dailyTask.statuses ? dailyTask.statuses.split(',') : [];
    if (!statusList.some(s => s.startsWith(`${creatorModule}:`))) {
      statusList.push(`${creatorModule}:NOT_STARTED`);
    }
    const elapsedList = dailyTask.elapsedDurations ? dailyTask.elapsedDurations.split(',') : [];
    if (!elapsedList.some(e => e.startsWith(`${creatorModule}:`))) {
      elapsedList.push(`${creatorModule}:0`);
    }

    setDailyTask(prev => ({
      ...prev,
      selectedModules: selectedStr,
      targetDurations: targetDurationsStr,
      statuses: statusList.join(','),
      elapsedDurations: elapsedList.join(',')
    }));

    // Instantly close creator view
    setShowCreator(false);
    setCreatorModule('');
    setCreatorDuration(25);

    // Save in the background
    api.post<DailyTaskData>(`/daily-tasks/today/select`, {
      selectedModules: selectedStr,
      targetDurations: targetDurationsStr
    }).then(updated => {
      setDailyTask(updated);
      loadDashboardData(false);
    }).catch(err => {
      console.error("Failed to add task", err);
      setDailyTask(originalDailyTask);
    });
  };

  // BUTTON 2: Start Focus Mode (creates task if necessary and immediately starts timer)
  const handleStartFocusMode = async () => {
    if (!creatorModule) return;

    const selectedList = dailyTask.selectedModules ? dailyTask.selectedModules.split(',') : [];
    const nextSelected = selectedList.includes(creatorModule) ? selectedList : [...selectedList, creatorModule];
    const selectedStr = nextSelected.join(',');

    // Parse target durations
    const durationMap = new Map<string, number>();
    if (dailyTask.targetDurations) {
      dailyTask.targetDurations.split(',').forEach(item => {
        const [id, dur] = item.split(':');
        if (id && dur) durationMap.set(id, parseInt(dur));
      });
    }
    durationMap.set(creatorModule, creatorDuration);
    const targetDurationsStr = nextSelected.map(id => `${id}:${durationMap.get(id) || 25}`).join(',');

    const moduleToLaunch = creatorModule;
    const durationToLaunch = creatorDuration;

    // Optimistically update the list in the UI immediately
    const statusList = dailyTask.statuses ? dailyTask.statuses.split(',') : [];
    if (!statusList.some(s => s.startsWith(`${creatorModule}:`))) {
      statusList.push(`${creatorModule}:NOT_STARTED`);
    }
    const elapsedList = dailyTask.elapsedDurations ? dailyTask.elapsedDurations.split(',') : [];
    if (!elapsedList.some(e => e.startsWith(`${creatorModule}:`))) {
      elapsedList.push(`${creatorModule}:0`);
    }

    setDailyTask(prev => ({
      ...prev,
      selectedModules: selectedStr,
      targetDurations: targetDurationsStr,
      statuses: statusList.join(','),
      elapsedDurations: elapsedList.join(',')
    }));

    // Instantly close creator view and launch focus mode timer overlay
    setShowCreator(false);
    setCreatorModule('');
    setCreatorDuration(25);

    onEnterFocusMode(moduleToLaunch as any, durationToLaunch);

    // Save in the background
    api.post<DailyTaskData>(`/daily-tasks/today/select`, {
      selectedModules: selectedStr,
      targetDurations: targetDurationsStr
    }).then(updated => {
      setDailyTask(updated);
    }).catch(err => {
      console.error("Failed to start focus mode", err);
    });
  };

  // Resume Focus for an already scheduled card
  const handleResumeFocus = (moduleId: string, targetMins: number) => {
    let remainingSeconds = undefined;
    if (dailyTask.remainingDurations) {
      const match = dailyTask.remainingDurations.split(',').find(item => item.startsWith(`${moduleId}:`));
      if (match) {
        remainingSeconds = parseInt(match.split(':')[1]);
      }
    }
    onEnterFocusMode(moduleId as any, targetMins, remainingSeconds);
  };

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-accent border-t-transparent"></div>
          <p className="text-text-secondary text-xs tracking-widest font-mono uppercase animate-pulse">Syncing Command Center...</p>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  // Safely partition monthly heatmap
  const weeks: HeatmapDay[][] = [];
  let currentWeek: HeatmapDay[] = [];

  const heatmapData = stats.monthlyHeatmap || [];
  heatmapData.forEach((day) => {
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });
  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

  const selectedList = dailyTask.selectedModules ? dailyTask.selectedModules.split(',') : [];
  const completedList = dailyTask.completedModules ? dailyTask.completedModules.split(',') : [];

  // Parse durations & elapsed times & statuses
  const targetMap = new Map<string, number>();
  if (dailyTask.targetDurations) {
    dailyTask.targetDurations.split(',').forEach(item => {
      const [id, dur] = item.split(':');
      if (id && dur) targetMap.set(id, parseInt(dur));
    });
  }

  const elapsedMap = new Map<string, number>();
  if (dailyTask.elapsedDurations) {
    dailyTask.elapsedDurations.split(',').forEach(item => {
      const [id, elap] = item.split(':');
      if (id && elap) elapsedMap.set(id, parseInt(elap));
    });
  }

  const statusMap = new Map<string, string>();
  if (dailyTask.statuses) {
    dailyTask.statuses.split(',').forEach(item => {
      const [id, stat] = item.split(':');
      if (id && stat) statusMap.set(id, stat);
    });
  }

  // Split modules into Permanent and Reading Tasks
  const permanentTasks = [
    {
      id: 'dsa_goal',
      name: 'Daily DSA Practice',
      progressText: `${stats.todayGoalSolved} / ${stats.todayGoalTarget} Solved`,
      percent: stats.todayGoalTarget > 0 ? Math.min(100, Math.round((stats.todayGoalSolved / stats.todayGoalTarget) * 100)) : 100,
      isCompleted: stats.todayGoalSolved >= stats.todayGoalTarget,
      warningText: stats.todayGoalSolved < stats.todayGoalTarget ? 'Pending goal completion' : '',
    },
    {
      id: 'revision_goal',
      name: 'Daily Revision Center',
      progressText: `${stats.todayRevisedCount} Revised`,
      percent: (stats.revisionDueTodayCount + stats.todayRevisedCount) > 0 
        ? Math.round((stats.todayRevisedCount / (stats.revisionDueTodayCount + stats.todayRevisedCount)) * 100)
        : 100,
      isCompleted: stats.revisionDueTodayCount === 0,
      warningText: stats.revisionDueTodayCount > 0 ? `${stats.revisionDueTodayCount} revisions remaining` : '',
    }
  ];

  return (
    <div className="min-h-screen w-screen bg-background text-text-primary px-4 py-8 relative overflow-y-auto font-sans scrollbar-none transition-colors duration-300">
      
      {/* Top Floating Control Toolbar */}
      <div className="absolute top-6 right-6 z-50 flex items-center space-x-3 bg-surface border border-border backdrop-blur-md px-3.5 py-2 rounded-2xl">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
          className="p-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-background transition-smooth cursor-pointer"
        >
          {theme === 'dark' ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
        </button>

        <div className="h-4 w-px bg-border"></div>

        {/* Logout */}
        <button
          onClick={onLogout}
          title="Sign Out Session"
          className="p-2 rounded-xl text-text-secondary hover:text-accent hover:bg-accent/10 transition-smooth cursor-pointer flex items-center space-x-1"
        >
          <LogOut className="h-4.5 w-4.5" />
        </button>
      </div>

      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Dynamic Header Banner */}
        <div className="glass-panel p-8 rounded-3xl border border-border relative overflow-hidden bg-surface">
          <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-[150px] pointer-events-none"></div>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 relative z-10">
            <div className="space-y-3 max-w-xl">
              <span className="text-[9px] text-accent font-extrabold uppercase tracking-widest font-mono bg-accent/10 border border-accent/20 px-3 py-1 rounded-full">
                Nothing OS Command Center
              </span>
              <h1 className="text-3xl md:text-4xl font-black text-text-primary tracking-tight font-heading uppercase">
                {getGreeting()}, Developer
              </h1>
              <p className="text-xs text-text-secondary leading-relaxed font-sans italic opacity-85">
                "{motivationQuote}"
              </p>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3.5 bg-background border border-border px-5 py-4 rounded-2xl">
                <div className="h-10 w-10 bg-accent/10 border border-accent/20 rounded-xl flex items-center justify-center">
                  <Flame className="h-6 w-6 text-accent fill-accent/25 animate-pulse" />
                </div>
                <div>
                  <span className="text-[9px] text-text-secondary font-bold uppercase tracking-wider block font-mono">Streak</span>
                  <span className="text-xl font-bold font-heading text-text-primary">{stats.currentStreak} Days</span>
                </div>
              </div>

              <button
                onClick={onGoToModules}
                className="px-6 py-4 rounded-2xl bg-text-primary hover:bg-text-primary/95 text-background text-xs font-bold tracking-wider uppercase transition-all duration-300 hover:-translate-y-0.5 shadow-md cursor-pointer flex items-center space-x-2.5"
              >
                <Code2 className="h-4.5 w-4.5" />
                <span>Launch Portals</span>
              </button>
            </div>
          </div>
        </div>

        {/* PERMANENT DAILY GOALS */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-4.5 w-4.5 text-accent" />
            <h3 className="text-xs font-bold text-text-secondary uppercase tracking-widest font-mono">Permanent Goals</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {permanentTasks.map(task => (
              <div 
                key={task.id} 
                className={`glass-panel p-6 rounded-2xl border bg-surface space-y-4 relative overflow-hidden transition-all duration-300 ${
                  task.isCompleted 
                    ? 'border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.04)]' 
                    : 'border-border hover:border-border-hover'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">{task.name}</h4>
                  {task.isCompleted ? (
                    <span className="h-6 w-6 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-xs font-bold shadow-[0_0_10px_rgba(16,185,129,0.15)]">✓</span>
                  ) : (
                    <span className="text-[9px] font-bold text-accent bg-accent/10 border border-accent/20 px-2 py-0.5 rounded-md uppercase tracking-wider animate-pulse">Pending</span>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-text-secondary font-bold">{task.progressText}</span>
                    <span className={`${task.isCompleted ? 'text-emerald-400 font-bold' : 'text-text-secondary'} font-bold`}>{task.percent}%</span>
                  </div>

                  <div className="h-1.5 bg-background border border-border rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${
                        task.isCompleted 
                          ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]' 
                          : 'bg-accent'
                      }`} 
                      style={{ width: `${task.percent}%` }}
                    ></div>
                  </div>
                </div>

                {!task.isCompleted && task.warningText && (
                  <p className="text-[10px] text-accent font-bold font-mono uppercase tracking-wide">
                    ⚡ {task.warningText}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* READING & REVISION TASKS */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4.5 w-4.5 text-text-secondary" />
              <h3 className="text-xs font-bold text-text-secondary uppercase tracking-widest font-mono">Reading & Theory Tasks</h3>
            </div>
            
            {!showCreator && (
              <button
                onClick={() => setShowCreator(true)}
                className="px-4 py-2 bg-text-primary text-background hover:opacity-90 text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all duration-300 hover:-translate-y-0.5 cursor-pointer flex items-center space-x-1.5"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Reading Task</span>
              </button>
            )}
          </div>

          {/* Reading Task Creator Panel (Improved Nothing OS Grid UI) */}
          {showCreator && (
            <div className="glass-panel p-6 rounded-3xl border border-border bg-surface space-y-6 animate-fade-in relative shadow-md">
              <button
                onClick={() => {
                  setShowCreator(false);
                  setCreatorModule('');
                }}
                className="absolute top-5 right-5 text-text-secondary hover:text-text-primary transition-smooth cursor-pointer"
              >
                <X className="h-4.5 w-4.5" />
              </button>

              <div className="space-y-1">
                <h4 className="text-sm font-bold uppercase text-text-primary tracking-wide">Select Portal Subject</h4>
                <p className="text-[10px] text-text-secondary">Click on any portal subject chip to configure your focus target.</p>
              </div>

              {/* Tactical Subject Chips Grid instead of HTML Select */}
              <div className="space-y-2">
                <label className="text-[9px] font-bold text-text-secondary uppercase tracking-widest block font-mono">Available Subjects</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                  {(() => {
                    const available = MODULES_CONFIG.filter(mod => !selectedList.includes(mod.id));
                    if (available.length === 0) {
                      return (
                        <div className="col-span-full py-4 text-center text-xs text-text-secondary border border-dashed border-border rounded-xl">
                          All portals have been added to your dashboard for today.
                        </div>
                      );
                    }
                    return available.map(mod => {
                      const isSelected = creatorModule === mod.id;
                      return (
                        <button
                          key={mod.id}
                          type="button"
                          onClick={() => setCreatorModule(mod.id)}
                          className={`p-3 border rounded-xl flex flex-col items-center justify-center text-center space-y-2 transition-all duration-300 cursor-pointer ${
                            isSelected
                              ? 'border-accent text-accent bg-accent/5 font-bold shadow-[0_0_15px_rgba(255,59,48,0.1)]'
                              : 'border-border text-text-secondary hover:border-text-primary hover:text-text-primary hover:bg-background/40'
                          }`}
                        >
                          <mod.icon className="h-5 w-5" />
                          <span className="text-[10px] uppercase font-mono tracking-wider">{mod.name.replace(' Revision', '').replace(' Practice', '')}</span>
                        </button>
                      );
                    });
                  })()}
                </div>
              </div>

              {/* Tacticle Target Time Chips instead of basic slider */}
              {creatorModule && (
                <div className="space-y-3.5 pt-2 animate-fade-in">
                  <div className="flex items-center justify-between text-[9px] font-bold font-mono">
                    <span className="text-text-secondary uppercase tracking-widest">Select Target Duration</span>
                    <span className="text-accent bg-accent/10 px-2 py-0.5 border border-accent/20 rounded-md font-bold">{creatorDuration} Minutes</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {DURATIONS.map(mins => (
                      <button
                        key={mins}
                        type="button"
                        onClick={() => setCreatorDuration(mins)}
                        className={`flex-1 min-w-[70px] py-2 border rounded-xl text-xs font-mono text-center transition-all duration-200 cursor-pointer ${
                          creatorDuration === mins
                            ? 'border-accent text-accent bg-accent/5 font-extrabold shadow-[0_0_10px_rgba(255,59,48,0.15)]'
                            : 'border-border text-text-secondary hover:border-text-primary hover:text-text-primary hover:bg-background/40'
                        }`}
                      >
                        {mins} Min
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {creatorModule && (
                <div className="flex gap-3 pt-3">
                  <button
                    onClick={handleAddTaskOnly}
                    className="flex-1 py-3 bg-background hover:bg-surface border border-border text-text-primary font-bold uppercase text-xs rounded-xl transition-smooth cursor-pointer"
                  >
                    Add Task
                  </button>
                  <button
                    onClick={handleStartFocusMode}
                    className="flex-1 py-3 bg-accent hover:bg-accent-hover text-white border border-transparent font-bold uppercase text-xs rounded-xl transition-smooth shadow-glow-accent cursor-pointer"
                  >
                    Start Focus Mode
                  </button>
                </div>
              )}
            </div>
          )}

            {/* List of active reading task cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(() => {
                const activeModules = MODULES_CONFIG.filter(mod => selectedList.includes(mod.id));
                
                if (activeModules.length === 0) {
                  return (
                    <div className="col-span-1 md:col-span-2 lg:col-span-3 glass-panel p-8 text-center rounded-2xl border border-border bg-surface space-y-2">
                      <p className="text-xs text-text-secondary font-medium">
                        No reading or theory tasks scheduled for today yet.
                      </p>
                      <p className="text-[10px] text-accent font-bold uppercase tracking-wider font-mono">
                        Click "Add Reading Task" above to plan a task!
                      </p>
                    </div>
                  );
                }

                return activeModules.map(mod => {
                  const isCompleted = completedList.includes(mod.id);
                  const status = statusMap.get(mod.id) || "NOT_STARTED";
                  const targetMins = targetMap.get(mod.id) || 25;
                  const elapsedSecs = elapsedMap.get(mod.id) || 0;
                  
                  const targetSeconds = targetMins * 60;
                  const progressPercent = Math.min(100, (elapsedSecs / targetSeconds) * 100);

                  const renderTimerDisplay = () => {
                    const formatSecs = (total: number) => {
                      const m = Math.floor(total / 60);
                      const s = total % 60;
                      return `${m}m ${s}s`;
                    };
                    if (elapsedSecs >= targetSeconds) {
                      return `${formatSecs(elapsedSecs)} / ${targetMins}m (+${formatSecs(elapsedSecs - targetSeconds)})`;
                    } else {
                      return `${formatSecs(elapsedSecs)} / ${targetMins}m`;
                    }
                  };

                  return (
                    <div 
                      key={mod.id} 
                      className={`p-5 rounded-2xl border transition-all duration-300 flex flex-col justify-between min-h-[185px] bg-surface group ${
                        isCompleted ? 'border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.04)]' :
                        'border-border hover:border-border-hover'
                      }`}
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between w-full">
                        <div className="flex items-center space-x-3">
                          <div className={`h-9 w-9 rounded-xl flex items-center justify-center border border-border bg-background transition-all duration-300 group-hover:scale-105 text-text-primary`}>
                            <mod.icon className="h-5 w-5" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold uppercase text-text-primary">{mod.name}</h4>
                            <span className="text-[9px] text-text-secondary font-mono tracking-wider font-extrabold uppercase">
                              {mod.id === 'dsa' ? 'Coding Portal' : 'Theory Portal'}
                            </span>
                          </div>
                        </div>

                        {/* Status tag */}
                        <span className={`px-2.5 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wider border flex items-center space-x-1.5 ${
                          isCompleted ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
                          status === 'RUNNING' ? 'bg-text-primary/10 border-text-primary/30 text-text-primary animate-pulse' :
                          status === 'PAUSED' ? 'bg-text-secondary/15 border-border text-text-secondary' :
                          'bg-background border-border text-text-secondary'
                        }`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${
                            isCompleted ? 'bg-emerald-400 animate-pulse' :
                            status === 'RUNNING' ? 'bg-text-primary animate-ping' :
                            status === 'PAUSED' ? 'bg-text-secondary' :
                            'bg-border'
                          }`}></span>
                          <span>{isCompleted ? '✓ Completed' : status.replace('_', ' ')}</span>
                        </span>
                      </div>

                      {/* Main progress bar section */}
                      <div className="space-y-3 pt-4">
                        <div className="flex items-center justify-between text-[10px] font-bold font-mono">
                          <span className="text-text-secondary">{renderTimerDisplay()}</span>
                          <span className={`${isCompleted ? 'text-emerald-400 font-bold' : 'text-text-primary'}`}>{Math.round(progressPercent)}%</span>
                        </div>

                        {/* Custom Nothing Style Bordered Progress bar */}
                        <div className="h-2 bg-background border border-border rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-300 ${
                              isCompleted ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]' :
                              status === 'RUNNING' ? 'bg-text-primary animate-pulse' : 'bg-text-secondary'
                            }`} 
                            style={{ width: `${progressPercent}%` }}
                          ></div>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[9px] font-bold text-text-secondary font-mono tracking-wide">
                            {isCompleted ? 'Focus target achieved' : `${formatTime(Math.max(0, targetSeconds - elapsedSecs))} remaining`}
                          </span>
                          
                          <div className="flex gap-2">
                            {/* Pause button */}
                            <button
                              disabled
                              className="p-1.5 rounded-xl bg-background border border-border text-text-secondary opacity-40 cursor-not-allowed"
                              title="Timer can only be paused from full-screen overlay"
                            >
                              <Pause className="h-3.5 w-3.5" />
                            </button>

                            <button
                              onClick={() => handleResumeFocus(mod.id, targetMins)}
                              className={`px-3.5 py-1.5 rounded-xl text-[9px] font-bold uppercase tracking-wider flex items-center space-x-1.5 transition-all duration-300 hover:-translate-y-0.5 cursor-pointer ${
                                isCompleted 
                                  ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20' 
                                  : 'bg-text-primary text-background hover:opacity-95'
                              }`}
                            >
                              <Play className="h-3.5 w-3.5 fill-current" />
                              <span>{isCompleted ? 'Study More' : 'Resume'}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>

        {/* Heatmap Section */}
        <div className="glass-panel rounded-3xl p-6 border border-border bg-surface">
          <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
            <div className="flex items-center space-x-2.5">
              <Calendar className="h-5 w-5 text-text-secondary" />
              <h3 className="text-xs font-bold font-heading text-text-primary uppercase tracking-widest">Consistency Heatmap</h3>
            </div>
            
            {/* Heatmap Legend */}
            <div className="flex items-center space-x-4 text-[9px] font-mono text-text-secondary">
              <div className="flex items-center space-x-1.5">
                <div className="h-3 w-3 bg-background border border-border rounded-sm"></div>
                <span>No Task Set</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <div className="h-3 w-3 bg-accent/10 border border-accent/30 rounded-sm"></div>
                <span>Task Failed</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <div className="h-3 w-3 bg-accent border border-accent rounded-sm"></div>
                <span>Completed</span>
              </div>
            </div>
          </div>

          {heatmapError && (
            <div className="mb-4 p-3 rounded-xl bg-accent/10 border border-accent/20 text-accent text-xs flex items-center space-x-2 animate-fade-in font-sans">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>Failed to fetch stats: {heatmapError}. Click logout and re-authenticate to refresh your session.</span>
            </div>
          )}

          {/* Heatmap component */}
          <div className="w-full overflow-x-auto p-4 bg-background border border-border custom-scrollbar rounded-2xl">
            <div className="flex gap-2 min-w-[760px] select-none">
              <div className="flex flex-col justify-between text-[9px] text-text-secondary font-mono pt-5 pb-1 pr-2 h-[112px]">
                <span>Mon</span>
                <span>Wed</span>
                <span>Fri</span>
              </div>

              <div className="flex flex-1 flex-col">
                <div className="flex text-[9px] text-text-secondary font-mono pb-1.5 pl-0.5 h-[16px]">
                  {(() => {
                    let lastRenderedWeekIdx = -10;
                    return weeks.map((week, idx) => {
                      const firstDay = week[0];
                      if (!firstDay) return null;
                      const parts = firstDay.date.split('-');
                      const monthIndex = parseInt(parts[1]) - 1;
                      const monthName = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][monthIndex];

                      let showMonth = false;
                      if (idx === 0) {
                        showMonth = true;
                        lastRenderedWeekIdx = idx;
                      } else {
                        const prevFirstDay = weeks[idx - 1][0];
                        if (prevFirstDay) {
                          const prevParts = prevFirstDay.date.split('-');
                          const prevMonthIndex = parseInt(prevParts[1]) - 1;
                          if (monthIndex !== prevMonthIndex && (idx - lastRenderedWeekIdx >= 4)) {
                            showMonth = true;
                            lastRenderedWeekIdx = idx;
                          }
                        }
                      }

                      const nextWeek = weeks[idx + 1];
                      let hasMonthTransition = false;
                      if (nextWeek && nextWeek[0]) {
                        const nextMonthIndex = parseInt(nextWeek[0].date.split('-')[1]) - 1;
                        if (monthIndex !== nextMonthIndex) {
                          hasMonthTransition = true;
                        }
                      }

                      return (
                        <React.Fragment key={idx}>
                          <div className="w-[14px] shrink-0 text-left overflow-visible">
                            {showMonth ? monthName : ""}
                          </div>
                          {hasMonthTransition && (
                            <div className="w-[14px] shrink-0" aria-hidden="true" />
                          )}
                        </React.Fragment>
                      );
                    });
                  })()}
                </div>

                <div className="flex gap-[3px]">
                  {weeks.map((week, weekIdx) => {
                    const firstDay = week[0];
                    let hasMonthTransition = false;
                    if (firstDay) {
                      const monthIndex = parseInt(firstDay.date.split('-')[1]) - 1;
                      const nextWeek = weeks[weekIdx + 1];
                      if (nextWeek && nextWeek[0]) {
                        const nextMonthIndex = parseInt(nextWeek[0].date.split('-')[1]) - 1;
                        if (monthIndex !== nextMonthIndex) {
                          hasMonthTransition = true;
                        }
                      }
                    }

                    return (
                      <React.Fragment key={weekIdx}>
                        <div className="flex flex-col gap-[3px] shrink-0">
                          {week.map((day, dayIdx) => {
                            const count = day.count;
                            const isDaily = day.hasDailyTask;
                            const isDone = day.isDailyTaskCompleted;
                            
                            let bgClass = "bg-background border border-border hover:border-text-primary";
                            
                            if (isDaily) {
                              if (isDone) {
                                bgClass = "bg-accent border border-accent text-white hover:opacity-90 shadow-[0_0_8px_rgba(255,59,48,0.2)]";
                              } else {
                                bgClass = "bg-accent/10 border border-accent/30 text-accent hover:bg-accent/20";
                              }
                            } else if (count > 0) {
                              if (count <= 2) {
                                bgClass = "bg-text-primary/20 border border-text-primary/30 text-text-primary hover:border-text-primary";
                              } else if (count <= 4) {
                                bgClass = "bg-text-primary/50 border border-text-primary/60 text-background hover:border-text-primary";
                              } else {
                                bgClass = "bg-text-primary border border-text-primary text-background hover:opacity-90 shadow-[0_0_8px_rgba(0,0,0,0.1)]";
                              }
                            }

                            return (
                              <div
                                key={dayIdx}
                                onClick={() => setSelectedDay(day === selectedDay ? null : day)}
                                className={`h-[11px] w-[11px] rounded-sm transition-all duration-150 cursor-pointer ${bgClass}`}
                                title={`Solved: ${count}\nRevised: ${day.revisionCount || 0}\nRevision Time: ${formatRevisionTime(day.revisionTime || 0)}`}
                              />
                            );
                          })}
                        </div>
                        {hasMonthTransition && (
                          <div className="w-[11px] shrink-0" aria-hidden="true" />
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {selectedDay && (
            <div className="mt-4 p-4 bg-background border border-border rounded-xl animate-fade-in text-xs font-sans space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-text-primary">Date: {new Date(selectedDay.date).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
                {selectedDay.hasDailyTask && (
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${selectedDay.isDailyTaskCompleted ? 'bg-accent/10 border border-accent/20 text-accent' : 'bg-accent/5 border border-accent/20 text-accent/80'}`}>
                    {selectedDay.isDailyTaskCompleted ? 'Focus Goal Completed' : 'Focus Goal Failed'}
                  </span>
                )}
              </div>
              {selectedDay.selectedModules && (
                <div className="text-text-secondary font-medium">Scheduled: <span className="text-text-primary font-mono font-bold uppercase">{selectedDay.selectedModules}</span></div>
              )}
              {selectedDay.completedModules && (
                <div className="text-text-secondary font-medium">Completed: <span className="text-accent font-mono font-bold uppercase">{selectedDay.completedModules}</span></div>
              )}
              <div className="text-text-secondary font-medium">
                Solved: <span className="text-text-primary font-bold">{selectedDay.count} {selectedDay.count === 1 ? 'Question' : 'Questions'}</span>
              </div>
              <div className="text-text-secondary font-medium">
                Revision: <span className="text-accent font-mono font-bold">{selectedDay.revisionCount || 0} {selectedDay.revisionCount === 1 ? 'Question' : 'Questions'}</span> <span className="text-text-primary font-bold font-mono">({formatRevisionTime(selectedDay.revisionTime || 0)})</span>
              </div>
            </div>
          )}
        </div>

        {/* BOTTOM STATS GRID */}
        <div className="glass-panel p-6 rounded-3xl border border-border bg-surface">
          <div className="flex items-center space-x-2 mb-6">
            <Sparkles className="h-4.5 w-4.5 text-accent" />
            <h3 className="text-xs font-bold text-text-secondary uppercase tracking-widest font-mono">Performance Indicators</h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            <div className="bg-background border border-border p-5 rounded-2xl text-center transition-all duration-300 hover:border-border-hover">
              <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider block font-mono">Questions Solved</span>
              <span className="text-3xl font-black text-text-primary mt-1 block tracking-tight font-heading">{stats.todayGoalSolved}</span>
            </div>

            <div className="bg-background border border-border p-5 rounded-2xl text-center transition-all duration-300 hover:border-border-hover">
              <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider block font-mono">Questions Revised</span>
              <span className="text-3xl font-black text-text-primary mt-1 block tracking-tight font-heading">{stats.todayRevisedCount}</span>
            </div>

            <div className="bg-background border border-border p-5 rounded-2xl text-center transition-all duration-300 hover:border-border-hover">
              <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider block font-mono">Revision Time Today</span>
              <span className="text-3xl font-black text-text-primary mt-1 block tracking-tight font-heading">{formatRevisionTime(stats.revisionTimeTodaySecs || 0)}</span>
            </div>

            <div className="bg-background border border-border p-5 rounded-2xl text-center transition-all duration-300 hover:border-border-hover">
              <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider block font-mono">Study Minutes</span>
              <span className="text-3xl font-black text-text-primary mt-1 block tracking-tight font-heading">{stats.studyMinutes} Min</span>
            </div>

            <div className="bg-background border border-border p-5 rounded-2xl text-center transition-all duration-300 hover:border-border-hover">
              <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider block font-mono">Consistency Streak</span>
              <span className="text-3xl font-black text-accent mt-1 block tracking-tight font-heading">{stats.currentStreak} Days</span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-center space-x-2.5 text-[10px] text-text-secondary font-sans tracking-wide">
          <ShieldCheck className="h-3.5 w-3.5 text-accent" />
          <span>PatternForge command center synchronization is active and secure</span>
        </div>

      </div>
    </div>
  );
};

export default MasterDashboard;
