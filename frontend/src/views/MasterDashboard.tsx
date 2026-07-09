import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { 
  Flame, BookOpen, Code2, Database, Cpu, 
  GitBranch, Brain, Globe, Coffee, Atom, FolderGit2, 
  Calendar, Play, AlertTriangle, Plus, Sparkles
} from 'lucide-react';

interface HeatmapDay {
  date: string;
  count: number;
  hasDailyTask?: boolean;
  isDailyTaskCompleted?: boolean;
  selectedModules?: string;
  completedModules?: string;
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
  monthlyHeatmap: HeatmapDay[];
}

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
  { id: 'dsa', name: 'DSA Practice', icon: Code2, color: 'text-blue-400', border: 'hover:border-blue-500', bg: 'bg-blue-500/10' },
  { id: 'stl', name: 'STL & Collections', icon: BookOpen, color: 'text-emerald-400', border: 'hover:border-emerald-500', bg: 'bg-emerald-500/10' },
  { id: 'sql', name: 'SQL Playground', icon: Database, color: 'text-purple-400', border: 'hover:border-purple-500', bg: 'bg-purple-500/10' },
  { id: 'os', name: 'OS Revision', icon: Cpu, color: 'text-amber-400', border: 'hover:border-amber-500', bg: 'bg-amber-500/10' },
  { id: 'git', name: 'Git & GitHub', icon: GitBranch, color: 'text-red-400', border: 'hover:border-red-500', bg: 'bg-red-500/10' },
  { id: 'aiml', name: 'AI / ML System', icon: Brain, color: 'text-indigo-400', border: 'hover:border-indigo-500', bg: 'bg-indigo-500/10' },
  { id: 'cn', name: 'CN Revision', icon: Globe, color: 'text-cyan-400', border: 'hover:border-cyan-500', bg: 'bg-cyan-500/10' },
  { id: 'spring', name: 'Spring Boot', icon: Coffee, color: 'text-green-400', border: 'hover:border-green-500', bg: 'bg-green-500/10' },
  { id: 'react', name: 'React JS', icon: Atom, color: 'text-sky-400', border: 'hover:border-sky-500', bg: 'bg-sky-400/10' },
  { id: 'projects', name: 'Projects Architecture', icon: FolderGit2, color: 'text-fuchsia-400', border: 'hover:border-fuchsia-500', bg: 'bg-fuchsia-500/10' }
] as const;

const MOTIVATION_QUOTES = [
  "Mastery is not a destination, it is a constant pursuit of pattern recognition.",
  "Great algorithms are simple ideas refined through relentless consistency.",
  "Success is the sum of small daily targets completed day in and day out.",
  "Your focus determines your reality. Enter flow mode and forge your path.",
  "One solved problem at a time, one focused session after another.",
  "Consistency is the ultimate competitive advantage."
];

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

  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return "Good Morning";
    if (hr < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  const loadDashboardData = async () => {
    setLoading(true);
    setHeatmapError(null);

    // 1. Fetch dashboard stats
    try {
      const statsData = await api.get<DashboardStats>(`/dashboard/stats?year=${selectedYear}`);
      setStats(statsData);
    } catch (err: any) {
      console.error("Failed to load dashboard stats", err);
      setHeatmapError(err.message || String(err));
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

    // 2. Fetch daily tasks selection
    try {
      const dailyData = await api.get<DailyTaskData>(`/daily-tasks/today`);
      setDailyTask(dailyData);
    } catch (err: any) {
      console.error("Failed to load daily tasks today data", err);
      setDailyTask({
        selectedModules: '',
        completedModules: '',
        targetDurations: '',
        elapsedDurations: '',
        statuses: ''
      });
    }

    setLoading(false);
  };

  useEffect(() => {
    loadDashboardData();
  }, [selectedYear]);

  const handleStartReadingTask = async (moduleId: string, duration: number) => {
    const selectedList = dailyTask.selectedModules ? dailyTask.selectedModules.split(',') : [];
    if (selectedList.includes(moduleId)) {
      // Resume focus mode
      let remainingSeconds = undefined;
      if (dailyTask.remainingDurations) {
        const match = dailyTask.remainingDurations.split(',').find(item => item.startsWith(`${moduleId}:`));
        if (match) {
          remainingSeconds = parseInt(match.split(':')[1]);
        }
      }
      onEnterFocusMode(moduleId as any, duration, remainingSeconds);
      return;
    }

    const nextSelected = [...selectedList, moduleId];
    const selectedStr = nextSelected.join(',');
    
    // Parse target durations
    const durationMap = new Map<string, number>();
    if (dailyTask.targetDurations) {
      dailyTask.targetDurations.split(',').forEach(item => {
        const [id, dur] = item.split(':');
        if (id && dur) durationMap.set(id, parseInt(dur));
      });
    }
    durationMap.set(moduleId, duration);
    const targetDurationsStr = nextSelected.map(id => `${id}:${durationMap.get(id) || 25}`).join(',');

    // Save and launch
    setDailyTask(prev => ({
      ...prev,
      selectedModules: selectedStr,
      targetDurations: targetDurationsStr
    }));

    try {
      await api.post<DailyTaskData>(`/daily-tasks/today/select`, {
        selectedModules: selectedStr,
        targetDurations: targetDurationsStr
      });
      // Start focus timer immediately
      onEnterFocusMode(moduleId as any, duration);
    } catch (err) {
      console.error("Failed to save and start focus task", err);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-955">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
          <p className="text-slate-400 text-sm animate-pulse font-sans">Syncing Master Dashboard...</p>
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
      percent: Math.min(100, (stats.todayGoalSolved / stats.todayGoalTarget) * 100),
      isCompleted: stats.todayGoalSolved >= stats.todayGoalTarget,
      warningText: stats.todayGoalSolved < stats.todayGoalTarget ? 'Pending goal completion' : ''
    },
    {
      id: 'revision_goal',
      name: 'Daily Revision Center',
      progressText: `${stats.todayRevisedCount} Revised`,
      // Total due is pending due + completed revisions today
      percent: (stats.revisionDueTodayCount + stats.todayRevisedCount) > 0 
        ? Math.round((stats.todayRevisedCount / (stats.revisionDueTodayCount + stats.todayRevisedCount)) * 100)
        : 100,
      isCompleted: stats.revisionDueTodayCount === 0,
      warningText: stats.revisionDueTodayCount > 0 ? `${stats.revisionDueTodayCount} revisions remaining` : ''
    }
  ];

  return (
    <div className="min-h-screen w-screen bg-[#07070e] text-slate-100 px-4 py-8 relative overflow-y-auto font-sans">
      
      {/* Sign Out Button */}
      <div className="absolute top-6 right-6 z-50">
        <button
          onClick={onLogout}
          className="px-4 py-2 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-red-500/50 hover:text-red-400 text-slate-400 transition-smooth flex items-center space-x-2 text-xs font-black cursor-pointer"
        >
          <span>SIGN OUT</span>
        </button>
      </div>

      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Banner Header */}
        <div className="glass-panel p-8 rounded-2xl border border-slate-900 relative overflow-hidden bg-slate-950/20">
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/5 rounded-full blur-[120px] pointer-events-none"></div>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-3 max-w-xl">
              <span className="text-[10px] text-blue-400 font-extrabold uppercase tracking-widest font-mono">
                Command Center
              </span>
              <h1 className="text-3xl font-black bg-gradient-to-r from-blue-400 via-cyan-300 to-emerald-400 bg-clip-text text-transparent uppercase tracking-tight font-heading">
                {getGreeting()}, User
              </h1>
              <p className="text-xs text-slate-400 leading-relaxed font-medium italic">
                "{motivationQuote}"
              </p>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3 bg-slate-900/50 border border-slate-800/80 p-4 rounded-2xl">
                <Flame className="h-7 w-7 text-orange-500 fill-orange-500/10 animate-pulse" />
                <div>
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block font-mono">Consistency Streak</span>
                  <span className="text-lg font-black font-heading text-slate-100">{stats.currentStreak} Days</span>
                </div>
              </div>

              <button
                onClick={onGoToModules}
                className="px-5 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black tracking-wider uppercase transition-smooth shadow-glow-primary cursor-pointer flex items-center space-x-2"
              >
                <Code2 className="h-4 w-4" />
                <span>LAUNCH MODULE PORTALS</span>
              </button>
            </div>
          </div>
        </div>

        {/* REDESIGNED DAILY TASKS SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* LEFT: Permanent Daily Goals */}
          <div className="space-y-6 lg:col-span-1">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-4 w-4 text-amber-400" />
              <h3 className="text-xs font-extrabold text-slate-300 uppercase tracking-widest font-mono">Permanent Goals</h3>
            </div>

            <div className="space-y-4">
              {permanentTasks.map(task => (
                <div key={task.id} className="glass-panel p-5 rounded-2xl border border-slate-900 bg-slate-950/20 space-y-4 relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black text-slate-200 uppercase tracking-wider">{task.name}</h4>
                    {task.isCompleted ? (
                      <span className="h-6 w-6 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold">✓</span>
                    ) : (
                      <span className="text-[9px] font-bold text-amber-500 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-md uppercase tracking-wider animate-pulse">⚠️ Goal Due</span>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-slate-400 font-bold">{task.progressText}</span>
                      <span className={`${task.isCompleted ? 'text-emerald-400' : 'text-slate-500'} font-black`}>{task.percent}%</span>
                    </div>

                    <div className="h-2 bg-slate-900 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${task.isCompleted ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]' : 'bg-amber-500'}`} 
                        style={{ width: `${task.percent}%` }}
                      ></div>
                    </div>
                  </div>

                  {!task.isCompleted && task.warningText && (
                    <p className="text-[10px] text-amber-500/80 font-bold font-mono uppercase tracking-wide">
                      ⚡ {task.warningText}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: Reading Tasks Modules Progress cards */}
          <div className="space-y-6 lg:col-span-2">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-blue-400" />
              <h3 className="text-xs font-extrabold text-slate-300 uppercase tracking-widest font-mono">Reading & Revision Tasks</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {MODULES_CONFIG.map(mod => {
                const isSelected = selectedList.includes(mod.id);
                const isCompleted = completedList.includes(mod.id);
                const status = statusMap.get(mod.id) || "NOT_STARTED";
                const targetMins = targetMap.get(mod.id) || 25;
                const elapsedSecs = elapsedMap.get(mod.id) || 0;
                
                // Duration configuration local state handler
                const [localDur, setLocalDur] = useState(targetMins);

                // Progress Bar percentages
                const targetSeconds = targetMins * 60;
                const progressPercent = Math.min(100, (elapsedSecs / targetSeconds) * 100);

                // Render Timer text
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
                    className={`p-5 rounded-2xl border transition-all duration-300 flex flex-col justify-between min-h-[175px] ${
                      isCompleted ? 'bg-emerald-950/5 border-emerald-500/25 shadow-[0_0_15px_rgba(16,185,129,0.08)]' :
                      isSelected ? 'bg-slate-900/40 border-slate-800' :
                      'bg-slate-950/15 border-slate-900 hover:border-slate-800'
                    }`}
                  >
                    {/* Header: Icon, Name, and Status Badge */}
                    <div className="flex items-start justify-between w-full">
                      <div className="flex items-center space-x-3">
                        <div className={`h-8.5 w-8.5 rounded-xl flex items-center justify-center ${mod.bg} ${mod.color}`}>
                          <mod.icon className="h-4.5 w-4.5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-black uppercase text-slate-200">{mod.name}</h4>
                          <span className="text-[9px] text-slate-500 font-mono tracking-wider font-extrabold uppercase">
                            {mod.id === 'dsa' ? 'Coding Portal' : 'Theory Portal'}
                          </span>
                        </div>
                      </div>

                      {/* Status label */}
                      {isSelected ? (
                        <span className={`px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider border ${
                          isCompleted ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
                          status === 'RUNNING' ? 'bg-blue-500/10 border-blue-500/30 text-blue-400 animate-pulse' :
                          status === 'PAUSED' ? 'bg-orange-500/10 border-orange-500/30 text-orange-400' :
                          'bg-slate-900/60 border-slate-800 text-slate-400'
                        }`}>
                          {isCompleted ? 'Completed' : status.replace('_', ' ')}
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest font-mono">Not Set</span>
                      )}
                    </div>

                    {/* Content Section */}
                    {isSelected ? (
                      <div className="space-y-3 pt-3">
                        <div className="flex items-center justify-between text-[10px] font-bold font-mono">
                          <span className="text-slate-400">{renderTimerDisplay()}</span>
                          <span className={`${isCompleted ? 'text-emerald-400' : 'text-blue-400'}`}>{Math.round(progressPercent)}%</span>
                        </div>

                        <div className="h-1.5 bg-slate-900/80 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-300 ${isCompleted ? 'bg-emerald-500' : 'bg-blue-500'}`} 
                            style={{ width: `${progressPercent}%` }}
                          ></div>
                        </div>

                        {/* Resume / Launch Action */}
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[9px] font-bold text-slate-500 font-mono tracking-wide">
                            {isCompleted ? 'Focus target achieved' : `${formatTime(Math.max(0, targetSeconds - elapsedSecs))} remaining`}
                          </span>
                          
                          <button
                            onClick={() => handleStartReadingTask(mod.id, targetMins)}
                            className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider flex items-center space-x-1 transition-smooth cursor-pointer ${
                              isCompleted 
                                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20' 
                                : 'bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 shadow-glow-primary'
                            }`}
                          >
                            <Play className="h-3 w-3 fill-current" />
                            <span>{isCompleted ? 'Study More' : 'Resume Focus'}</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      // Module configuration (choose time and select task)
                      <div className="space-y-4 pt-3">
                        <div className="flex items-center justify-between text-[10px] font-bold font-mono">
                          <span className="text-slate-500">Configure focus time:</span>
                          <span className="text-blue-400">{localDur} Minutes</span>
                        </div>

                        <div className="flex items-center space-x-3.5">
                          <input 
                            type="range"
                            min="20"
                            max="45"
                            step="5"
                            value={localDur}
                            onChange={(e) => setLocalDur(parseInt(e.target.value))}
                            className="flex-1 h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-blue-500"
                          />
                          <button
                            onClick={() => handleStartReadingTask(mod.id, localDur)}
                            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white border border-transparent text-[9px] font-black uppercase tracking-wider rounded-xl transition-smooth flex items-center space-x-1 cursor-pointer"
                          >
                            <Plus className="h-3 w-3" />
                            <span>Start Focus</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Heatmap Section */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-900 bg-slate-950/20">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-slate-300" />
              <h3 className="text-xs font-extrabold font-heading text-slate-350 uppercase tracking-wider">Consistency Heatmap</h3>
            </div>
            
            {/* Heatmap Legend */}
            <div className="flex items-center space-x-4 text-[9px] font-mono text-slate-500">
              <div className="flex items-center space-x-1.5">
                <div className="h-3 w-3 bg-[#18181b] border border-border/40 rounded-sm"></div>
                <span>No Task Set</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <div className="h-3 w-3 bg-red-900 border border-red-850 rounded-sm"></div>
                <span>Task Failed</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <div className="h-3 w-3 bg-[#2cbb5d]/50 border border-[#2cbb5d]/60 rounded-sm"></div>
                <span>Completed</span>
              </div>
            </div>
          </div>

          {heatmapError && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center space-x-2 animate-fade-in font-sans">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>Failed to fetch stats: {heatmapError}. Click on "Logout" and re-authenticate to refresh your session.</span>
            </div>
          )}

          {/* Heatmap component */}
          <div className="w-full overflow-x-auto p-4 bg-slate-950/50 border border-slate-900 custom-scrollbar rounded-xl">
            <div className="flex gap-2 min-w-[760px] select-none">
              <div className="flex flex-col justify-between text-[9px] text-slate-500 font-mono pt-5 pb-1 pr-1.5 h-[112px]">
                <span>Mon</span>
                <span>Wed</span>
                <span>Fri</span>
              </div>

              <div className="flex flex-1 flex-col">
                <div className="flex text-[9px] text-slate-500 font-mono pb-1.5 pl-0.5 h-[16px]">
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
                            
                            let bgClass = "bg-[#18181b] border border-border/40 hover:border-text-primary";
                            
                            if (isDaily) {
                              if (isDone) {
                                bgClass = "bg-[#2cbb5d]/60 border border-[#2cbb5d]/85 text-white hover:border-emerald-400 shadow-[0_0_8px_rgba(44,187,93,0.2)]";
                              } else {
                                bgClass = "bg-red-900 border border-red-800 text-red-200 hover:border-red-500 shadow-[0_0_8px_rgba(239,68,68,0.2)]";
                              }
                            } else if (count > 0) {
                              if (count <= 2) {
                                bgClass = "bg-[#2cbb5d]/20 border border-[#2cbb5d]/30 text-[#2cbb5d] hover:border-[#2cbb5d]";
                              } else if (count <= 4) {
                                bgClass = "bg-[#2cbb5d]/50 border border-[#2cbb5d]/60 text-white hover:border-[#2cbb5d]";
                              } else {
                                bgClass = "bg-[#2cbb5d] border border-[#2cbb5d] text-white hover:border-text-primary shadow-[0_0_8px_rgba(44,187,93,0.3)]";
                              }
                            }

                            return (
                              <div
                                key={dayIdx}
                                onClick={() => setSelectedDay(day === selectedDay ? null : day)}
                                className={`h-[11px] w-[11px] rounded-sm transition-all duration-150 cursor-pointer ${bgClass}`}
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
            <div className="mt-4 p-4 bg-slate-900/60 border border-slate-800 rounded-xl animate-fade-in text-xs font-sans space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-350">Date: {new Date(selectedDay.date).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
                {selectedDay.hasDailyTask && (
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${selectedDay.isDailyTaskCompleted ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border border-red-500/30 text-red-400'}`}>
                    {selectedDay.isDailyTaskCompleted ? 'Focus Goal Completed' : 'Focus Goal Failed'}
                  </span>
                )}
              </div>
              {selectedDay.selectedModules && (
                <div className="text-slate-400">Scheduled: <span className="text-slate-200 font-mono font-bold uppercase">{selectedDay.selectedModules}</span></div>
              )}
              {selectedDay.completedModules && (
                <div className="text-slate-400 font-medium">Completed: <span className="text-emerald-400 font-mono font-bold uppercase">{selectedDay.completedModules}</span></div>
              )}
              {selectedDay.count > 0 && (
                <div className="text-slate-400">DSA Problems Solved: <span className="text-blue-400 font-bold">{selectedDay.count}</span></div>
              )}
            </div>
          )}
        </div>

        {/* BOTTOM STATS GRID */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-900 bg-slate-950/20">
          <div className="flex items-center space-x-2 mb-6">
            <Sparkles className="h-4.5 w-4.5 text-blue-400" />
            <h3 className="text-xs font-extrabold text-slate-300 uppercase tracking-widest font-mono">Today's Performance Stats</h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-slate-950/40 border border-slate-900 p-4.5 rounded-2xl text-center">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block font-mono">Questions Solved</span>
              <span className="text-2xl font-black text-blue-400 mt-1 block">{stats.todayGoalSolved}</span>
            </div>

            <div className="bg-slate-950/40 border border-slate-900 p-4.5 rounded-2xl text-center">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block font-mono">Questions Revised</span>
              <span className="text-2xl font-black text-purple-400 mt-1 block">{stats.todayRevisedCount}</span>
            </div>

            <div className="bg-slate-950/40 border border-slate-900 p-4.5 rounded-2xl text-center">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block font-mono">Study Minutes</span>
              <span className="text-2xl font-black text-emerald-400 mt-1 block">{stats.studyMinutes} Min</span>
            </div>

            <div className="bg-slate-950/40 border border-slate-900 p-4.5 rounded-2xl text-center">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block font-mono">Current Streak</span>
              <span className="text-2xl font-black text-orange-500 mt-1 block">{stats.currentStreak} Days</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default MasterDashboard;
