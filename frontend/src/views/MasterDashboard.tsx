import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { 
  Flame, BookOpen, Code2, Database, Cpu, 
  GitBranch, Brain, Globe, Coffee, Atom, FolderGit2, 
  Calendar, CheckCircle, Play, AlertTriangle, Monitor, X
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
  monthlyHeatmap: HeatmapDay[];
}

interface DailyTaskData {
  selectedModules: string;
  completedModules: string;
  targetDurations: string;
}

interface MasterDashboardProps {
  onEnterFocusMode: (portal: 'dsa' | 'stl' | 'sql' | 'os' | 'git' | 'aiml' | 'cn' | 'spring' | 'react' | 'projects', duration: number) => void;
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

const MasterDashboard: React.FC<MasterDashboardProps> = ({ onEnterFocusMode, onGoToModules, onLogout }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [dailyTask, setDailyTask] = useState<DailyTaskData>({
    selectedModules: '',
    completedModules: '',
    targetDurations: ''
  });
  
  const [loading, setLoading] = useState(true);
  const [selectedYear] = useState<number>(() => new Date().getFullYear());
  const [selectedDay, setSelectedDay] = useState<HeatmapDay | null>(null);
  
  // Focus Modal warning state
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [pendingModule, setPendingModule] = useState<'dsa' | 'stl' | 'sql' | 'os' | 'git' | 'aiml' | 'cn' | 'spring' | 'react' | 'projects' | null>(null);

  const getTodayDateString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [statsData, dailyData] = await Promise.all([
        api.get<DashboardStats>(`/dashboard/stats?year=${selectedYear}`),
        api.get<DailyTaskData>(`/daily-tasks/today`)
      ]);
      setStats(statsData);
      setDailyTask(dailyData);
    } catch (e) {
      console.error("Failed to load master dashboard data, using fallbacks", e);
      // Fallback data to prevent rendering black screen (returning null)
      setStats({
        currentStreak: 0,
        problemsSolved: 0,
        problemsAttempted: 0,
        monthlyHeatmap: []
      });
      setDailyTask({
        selectedModules: '',
        completedModules: '',
        targetDurations: ''
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [selectedYear]);

  const handleToggleModuleSelection = async (moduleId: string) => {
    const selectedList = dailyTask.selectedModules ? dailyTask.selectedModules.split(',') : [];
    const isSelected = selectedList.includes(moduleId);
    
    let nextSelected: string[];
    if (isSelected) {
      nextSelected = selectedList.filter(id => id !== moduleId);
    } else {
      nextSelected = [...selectedList, moduleId];
    }
    
    // Parse target durations
    const durationMap = new Map<string, number>();
    if (dailyTask.targetDurations) {
      dailyTask.targetDurations.split(',').forEach(item => {
        const [id, dur] = item.split(':');
        if (id && dur) durationMap.set(id, parseInt(dur));
      });
    }
    
    // Ensure duration for new selection is set (default to 25)
    if (!isSelected && !durationMap.has(moduleId)) {
      durationMap.set(moduleId, 25);
    }
    
    const nextSelectedStr = nextSelected.join(',');
    const targetDurationsStr = nextSelected
      .map(id => `${id}:${durationMap.get(id) || 25}`)
      .join(',');

    // Optimistic cache for rollback
    const prevDailyTask = { ...dailyTask };
    const prevStats = stats ? { ...stats } : null;

    // 1. Optimistically update dailyTask state
    setDailyTask(prev => ({
      ...prev,
      selectedModules: nextSelectedStr,
      targetDurations: targetDurationsStr
    }));

    // 2. Optimistically update today's heatmap cell to change colors instantly
    if (stats) {
      const todayStr = getTodayDateString();
      const updatedHeatmap = (stats.monthlyHeatmap || []).map(cell => {
        if (cell.date === todayStr) {
          const completedSet = new Set(dailyTask.completedModules ? dailyTask.completedModules.split(',') : []);
          const selectedSet = new Set(nextSelected);
          
          let isDone = true;
          selectedSet.forEach(m => {
            if (!completedSet.has(m)) isDone = false;
          });

          return {
            ...cell,
            hasDailyTask: nextSelected.length > 0,
            isDailyTaskCompleted: nextSelected.length > 0 ? isDone : false,
            selectedModules: nextSelectedStr
          };
        }
        return cell;
      });
      setStats(prev => prev ? { ...prev, monthlyHeatmap: updatedHeatmap } : null);
    }

    // Call API in the background
    api.post<DailyTaskData>(`/daily-tasks/today/select`, {
      selectedModules: nextSelectedStr,
      targetDurations: targetDurationsStr
    }).catch(err => {
      console.error("Failed to update module selection in background, rolling back", err);
      setDailyTask(prevDailyTask);
      setStats(prevStats);
    });
  };

  const handleDurationChange = async (moduleId: string, newDuration: number) => {
    const selectedList = dailyTask.selectedModules ? dailyTask.selectedModules.split(',') : [];
    if (!selectedList.includes(moduleId)) return;

    const durationMap = new Map<string, number>();
    if (dailyTask.targetDurations) {
      dailyTask.targetDurations.split(',').forEach(item => {
        const [id, dur] = item.split(':');
        if (id && dur) durationMap.set(id, parseInt(dur));
      });
    }
    durationMap.set(moduleId, newDuration);

    const targetDurationsStr = selectedList
      .map(id => `${id}:${durationMap.get(id) || 25}`)
      .join(',');

    const prevDailyTask = { ...dailyTask };

    // Optimistically update targetDurations
    setDailyTask(prev => ({
      ...prev,
      targetDurations: targetDurationsStr
    }));

    api.post<DailyTaskData>(`/daily-tasks/today/select`, {
      selectedModules: dailyTask.selectedModules,
      targetDurations: targetDurationsStr
    }).catch(err => {
      console.error("Failed to update focus duration in background, rolling back", err);
      setDailyTask(prevDailyTask);
    });
  };

  const triggerLaunchModule = (moduleId: any) => {
    setPendingModule(moduleId);
    setShowWarningModal(true);
  };

  const handleAcceptFocusMode = () => {
    if (!pendingModule) return;
    setShowWarningModal(false);
    
    // Parse target duration for module
    let duration = 25;
    if (dailyTask.targetDurations) {
      const match = dailyTask.targetDurations.split(',').find(item => item.startsWith(`${pendingModule}:`));
      if (match) {
        duration = parseInt(match.split(':')[1]) || 25;
      }
    }
    
    onEnterFocusMode(pendingModule, duration);
  };

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
          <p className="text-slate-400 text-sm animate-pulse font-sans">Syncing Master Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  // Split heatmap data into 7-day weeks safely
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

  return (
    <div className="min-h-screen w-screen bg-background text-text-primary px-4 py-8 relative overflow-y-auto select-none">
      
      {/* Absolute top controls */}
      <div className="absolute top-6 right-6 flex items-center space-x-3 z-50">
        <button
          onClick={onLogout}
          className="px-4 py-2 rounded-xl bg-surface/60 border border-border hover:border-red-500 hover:text-red-400 text-text-secondary transition-smooth flex items-center space-x-2 text-xs font-extrabold cursor-pointer"
        >
          <span>SIGN OUT</span>
        </button>
      </div>

      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Banner header */}
        <div className="glass-panel p-8 rounded-2xl flex flex-col md:flex-row md:items-center md:justify-between border border-border relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none"></div>
          
          <div className="space-y-2">
            <h1 className="text-3xl font-black bg-gradient-to-r from-blue-400 via-cyan-300 to-emerald-400 bg-clip-text text-transparent uppercase tracking-tight font-heading">
              Study Core Dashboard
            </h1>
            <p className="text-xs text-text-secondary font-medium">
              Schedule your daily study tasks, launch locked focus timers, and visualize your progress heatmaps.
            </p>
          </div>

          <div className="mt-4 md:mt-0 flex items-center space-x-6">
            <div className="flex items-center space-x-3 bg-slate-900/50 border border-border p-3.5 rounded-2xl">
              <Flame className="h-7 w-7 text-orange-500 fill-orange-500/20 animate-pulse" />
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block font-mono">Current Streak</span>
                <span className="text-xl font-black font-heading text-slate-100">{stats.currentStreak} Days</span>
              </div>
            </div>

            <button
              onClick={onGoToModules}
              className="px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black tracking-wider uppercase transition-smooth shadow-glow-primary cursor-pointer flex items-center space-x-2"
            >
              <Code2 className="h-4 w-4" />
              <span>LAUNCH MODULE PORTALS</span>
            </button>
          </div>
        </div>

        {/* Heatmap Grid Section */}
        <div className="glass-panel rounded-2xl p-6 border border-border">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-text-primary" />
              <h3 className="text-base font-extrabold font-heading text-text-primary uppercase tracking-wider">Consistency Heatmap</h3>
            </div>
            
            {/* Legend info */}
            <div className="flex items-center space-x-4 text-[9px] font-mono text-slate-500">
              <div className="flex items-center space-x-1.5">
                <div className="h-3 w-3 bg-[#18181b] border border-border/40 rounded-sm"></div>
                <span>No Task Set</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <div className="h-3 w-3 bg-red-900 border border-red-800 rounded-sm"></div>
                <span>Task Failed</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <div className="h-3 w-3 bg-[#2cbb5d]/50 border border-[#2cbb5d]/60 rounded-sm"></div>
                <span>Completed</span>
              </div>
            </div>
          </div>

          {/* Heatmap component */}
          <div className="w-full overflow-x-auto p-4 bg-surface/30 border border-border custom-scrollbar rounded-xl">
            <div className="flex gap-2 min-w-[760px] select-none">
              <div className="flex flex-col justify-between text-[9px] text-text-secondary font-mono pt-5 pb-1 pr-1.5 h-[112px]">
                <span>Mon</span>
                <span>Wed</span>
                <span>Fri</span>
              </div>

              <div className="flex flex-1 flex-col">
                {/* Months Row */}
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

                      // Check if there is a month change to the next week
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

                {/* Grid cells */}
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
                              bgClass = "bg-[#2cbb5d]/30 border border-[#2cbb5d]/40 text-[#2cbb5d] hover:border-emerald-500";
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

          {/* Click details banner */}
          {selectedDay && (
            <div className="mt-4 p-4 bg-slate-900/60 border border-border/80 rounded-xl animate-fade-in text-xs font-sans space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-300">Date: {new Date(selectedDay.date).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
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

        {/* Focus Goals Configuration */}
        <div className="glass-panel rounded-2xl p-6 border border-border">
          <div className="flex items-center space-x-2 mb-6">
            <Monitor className="h-5 w-5 text-emerald-400" />
            <h3 className="text-base font-extrabold font-heading text-text-primary uppercase tracking-wider">Focus Mode Scheduler</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {MODULES_CONFIG.map(mod => {
              const isSelected = selectedList.includes(mod.id);
              const isCompleted = completedList.includes(mod.id);
              
              // Get current set duration
              let currentDuration = 25;
              if (dailyTask.targetDurations) {
                const match = dailyTask.targetDurations.split(',').find(item => item.startsWith(`${mod.id}:`));
                if (match) {
                  currentDuration = parseInt(match.split(':')[1]) || 25;
                }
              }

              return (
                <div 
                  key={mod.id}
                  className={`p-5 rounded-2xl border transition-all duration-300 flex flex-col justify-between space-y-4 ${
                    isCompleted ? 'bg-emerald-950/10 border-emerald-500/30' :
                    isSelected ? 'bg-slate-900/50 border-slate-700' :
                    'bg-slate-900/20 border-slate-900 hover:border-slate-800'
                  }`}
                >
                  <div className="flex items-start justify-between w-full">
                    <div className="flex items-center space-x-3">
                      <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${mod.bg} ${mod.color}`}>
                        <mod.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-black uppercase text-slate-200">{mod.name}</h4>
                        <span className="text-[10px] text-slate-500 font-mono">Goal status</span>
                      </div>
                    </div>

                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleModuleSelection(mod.id)}
                        className="rounded bg-slate-950 border-border text-blue-500 focus:ring-blue-500/30 w-4 h-4 cursor-pointer"
                      />
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider select-none">Focus Goal</span>
                    </label>
                  </div>

                  {isSelected && (
                    <div className="space-y-3 bg-slate-950/40 p-4 rounded-xl border border-slate-900 animate-fade-in">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400 font-semibold font-mono">Timer Duration:</span>
                        <span className="text-emerald-400 font-extrabold">{currentDuration} Minutes</span>
                      </div>
                      
                      <input
                        type="range"
                        min="25"
                        max="50"
                        disabled={isCompleted}
                        value={currentDuration}
                        onChange={(e) => handleDurationChange(mod.id, parseInt(e.target.value))}
                        className="w-full h-1.5 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                      />

                      <div className="flex items-center justify-between pt-2">
                        <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">
                          {isCompleted ? 'Goal Completed' : 'Goal Pending'}
                        </span>
                        
                        {isCompleted ? (
                          <div className="flex items-center space-x-1.5 text-emerald-400 text-xs font-bold font-mono">
                            <CheckCircle className="h-4 w-4" />
                            <span>COMPLETED</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => triggerLaunchModule(mod.id)}
                            className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 text-[10px] font-black uppercase rounded-lg flex items-center space-x-1.5 cursor-pointer transition-smooth"
                          >
                            <Play className="h-3 w-3 fill-emerald-400 text-emerald-400" />
                            <span>LAUNCH FOCUS MODE</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Fullscreen Warning Modal */}
      {showWarningModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm px-4 animate-fade-in">
          <div className="glass-panel border border-border rounded-2xl w-full max-w-md p-6 space-y-6 shadow-2xl relative">
            <button 
              onClick={() => setShowWarningModal(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-350 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center space-x-3 text-amber-500">
              <AlertTriangle className="h-6 w-6" />
              <h3 className="text-base font-extrabold uppercase tracking-wider font-heading text-slate-100">Focus Mode Activation</h3>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-slate-400 font-medium">
              <p>
                To study this module and log your consistency streak, you must enter <strong className="text-slate-200">Locked Focus Mode</strong>.
              </p>
              <ul className="list-disc pl-4 space-y-1.5">
                <li>This will put the browser into <strong className="text-slate-200">Full Screen Mode</strong>.</li>
                <li>Exiting full screen will <strong className="text-slate-200">pause the timer</strong>.</li>
                <li>To exit the session manually, you must first pause the study timer.</li>
                <li>When the timer is exhausted, the focus session is auto-saved as completed!</li>
              </ul>
            </div>

            <button
              onClick={handleAcceptFocusMode}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase text-xs rounded-xl transition-smooth shadow-glow-emerald cursor-pointer"
            >
              Enter Focus Mode & Start Timer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MasterDashboard;
