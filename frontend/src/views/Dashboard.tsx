import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { ProblemDto } from './Explorer';
import { 
  Flame, Award, Brain, 
  Shuffle, ChevronRight,
  Calendar, AlertCircle
} from 'lucide-react';

interface HeatmapProblem {
  id: string;
  name: string;
  leetcodeNumber: number;
  difficulty: string;
  topicName: string;
}

interface HeatmapDay {
  date: string;
  count: number;
  problems?: HeatmapProblem[];
}

interface DashboardStats {
  currentStreak: number;
  problemsSolved: number;
  problemsAttempted: number;
  approachAccuracy: number;
  todayGoalSolved: number;
  todayGoalTarget: number;
  weakestPattern: string;
  strongestPattern: string;
  recentlySolved: ProblemDto[];
  continueLastSession: ProblemDto | null;
  revisionDueTodayCount: number;
  weakestTopic: string;
  strongestTopic: string;
  problemsPerTopicSolved: Record<string, number>;
  problemsPerTopicTotal: Record<string, number>;
  weeklyActivity: { dayName: string; count: number }[];
  monthlyHeatmap: HeatmapDay[];
}

interface DashboardProps {
  navigateToProblem: (id: string) => void;
  setActiveTab: (tab: 'dashboard' | 'explorer' | 'problem' | 'settings') => void;
}

const Dashboard: React.FC<DashboardProps> = ({ navigateToProblem, setActiveTab }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<HeatmapDay | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await api.get<DashboardStats>('/dashboard/stats');
        setStats(data);
      } catch (e) {
        console.error("Failed to load dashboard stats", e);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  const triggerRandomizer = async (type: string) => {
    try {
      const data = await api.get<ProblemDto>(`/problems/random?type=${type}`);
      if (data && data.id) {
        navigateToProblem(data.id);
      }
    } catch (e) {
      alert("No matching problems found for this randomizer filter.");
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!stats) return null;


  // Split 365 days into continuous weeks of 7 days for the LeetCode-style view
  const weeks: HeatmapDay[][] = [];
  let currentWeek: HeatmapDay[] = [];

  stats.monthlyHeatmap.forEach((day) => {
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });
  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner / Continue Session */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch justify-between">
        <div className="flex-1 glass-panel rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-100 mb-1">Welcome back, Solver!</h1>
            <p className="text-slate-400 text-sm">
              Today is a great day to strengthen your approach before you code. 
            </p>
          </div>
          {stats.continueLastSession && (
            <div className="mt-4 flex items-center justify-between bg-slate-900/60 border border-slate-800/80 p-3 rounded-xl">
              <div>
                <span className="text-[10px] text-blue-400 uppercase tracking-widest font-bold">Continue Last Session</span>
                <h4 className="text-sm font-bold text-slate-200 mt-0.5">{stats.continueLastSession.name}</h4>
              </div>
              <button 
                onClick={() => navigateToProblem(stats.continueLastSession!.id)}
                className="p-2 rounded-lg bg-primary hover:bg-primary-hover text-white transition-smooth flex items-center space-x-1"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Today's Goal Card */}
        <div className="w-full md:w-80 glass-panel rounded-2xl p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-300">Today's Goal</h3>
            <span className="text-xs text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
              {stats.todayGoalSolved}/{stats.todayGoalTarget} Solved
            </span>
          </div>
          <div className="my-4">
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full"
                style={{ width: `${Math.min((stats.todayGoalSolved / stats.todayGoalTarget) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
          <p className="text-xs text-slate-400">
            {stats.todayGoalSolved >= stats.todayGoalTarget 
              ? "Daily goal achieved! Keep pushing for excellence." 
              : `Solve ${stats.todayGoalTarget - stats.todayGoalSolved} more problems to hit your target today.`}
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Streak */}
        <div className="glass-panel rounded-2xl p-5 flex items-center space-x-4">
          <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400">
            <Flame className="h-6 w-6 fill-amber-500/20" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Current Streak</span>
            <span className="text-2xl font-black text-slate-100">{stats.currentStreak} Days</span>
          </div>
        </div>

        {/* Problems Solved */}
        <div className="glass-panel rounded-2xl p-5 flex items-center space-x-4">
          <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Problems Solved</span>
            <span className="text-2xl font-black text-slate-100">{stats.problemsSolved}</span>
          </div>
        </div>

        {/* Approach Accuracy */}
        <div className="glass-panel rounded-2xl p-5 flex items-center space-x-4">
          <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400">
            <Brain className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Approach Accuracy</span>
            <span className="text-2xl font-black text-slate-100">{stats.approachAccuracy.toFixed(0)}%</span>
          </div>
        </div>

        {/* Revisions Queue */}
        <div className="glass-panel rounded-2xl p-5 flex items-center space-x-4">
          <div className="p-3 bg-red-500/10 rounded-xl text-red-400">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Revisions Due</span>
            <span className="text-2xl font-black text-slate-100">{stats.revisionDueTodayCount} Problems</span>
          </div>
        </div>
      </div>

      {/* Randomizer Deck */}
      <div className="glass-panel rounded-2xl p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Shuffle className="h-5 w-5 text-blue-400 animate-spin-slow" />
          <h3 className="text-base font-extrabold text-slate-200">Approach Randomizer</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          <button 
            onClick={() => triggerRandomizer('ALL')}
            className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl hover:border-blue-500/50 hover:bg-slate-900 transition-smooth text-center"
          >
            <span className="text-xs font-semibold text-slate-300 block">Random Problem</span>
          </button>
          <button 
            onClick={() => triggerRandomizer('UNSOLVED')}
            className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl hover:border-blue-500/50 hover:bg-slate-900 transition-smooth text-center"
          >
            <span className="text-xs font-semibold text-slate-300 block">Random Unsolved</span>
          </button>
          <button 
            onClick={() => triggerRandomizer('EASY')}
            className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl hover:border-emerald-500/50 hover:bg-slate-900 transition-smooth text-center"
          >
            <span className="text-xs font-semibold text-emerald-400 block">Random Easy</span>
          </button>
          <button 
            onClick={() => triggerRandomizer('MEDIUM')}
            className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl hover:border-amber-500/50 hover:bg-slate-900 transition-smooth text-center"
          >
            <span className="text-xs font-semibold text-amber-400 block">Random Medium</span>
          </button>
          <button 
            onClick={() => triggerRandomizer('HARD')}
            className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl hover:border-red-500/50 hover:bg-slate-900 transition-smooth text-center"
          >
            <span className="text-xs font-semibold text-red-400 block">Random Hard</span>
          </button>
          <button 
            onClick={() => triggerRandomizer('REVISION')}
            className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl hover:border-purple-500/50 hover:bg-slate-900 transition-smooth text-center"
          >
            <span className="text-xs font-semibold text-purple-400 block">Random Revision</span>
          </button>
        </div>
      </div>

      {/* Grid Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Weak/Strong & History */}
        <div className="lg:col-span-2 space-y-6">
          {/* Heatmap Calendar */}
          <div className="glass-panel rounded-2xl p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Calendar className="h-5 w-5 text-text-primary" />
              <h3 className="text-base font-extrabold font-heading text-text-primary uppercase tracking-wider">Progress History</h3>
            </div>
            
            {/* LeetCode-style Continuous Heatmap */}
            <div className="w-full overflow-x-auto custom-scrollbar p-4 bg-surface/30 border border-border">
              <div className="flex gap-2 min-w-[760px] py-1 select-none">
                {/* Day Labels Column */}
                <div className="flex flex-col justify-between text-[9px] text-text-secondary font-mono pt-5 pb-1 pr-1.5 h-[112px]">
                  <span>Mon</span>
                  <span>Wed</span>
                  <span>Fri</span>
                </div>

                {/* Heatmap Grid */}
                <div className="flex flex-1 flex-col">
                  {/* Months Row */}
                  <div className="flex text-[9px] text-text-secondary font-mono pb-1.5 pl-0.5 h-[16px]">
                    {weeks.map((week, idx) => {
                      const firstDay = week[0];
                      if (!firstDay) return null;
                      const parts = firstDay.date.split('-');
                      const monthIndex = parseInt(parts[1]) - 1;
                      const monthNamesShort = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                      const monthName = monthNamesShort[monthIndex];

                      // Show month name if it's the first week of the month
                      let showMonth = false;
                      if (idx === 0) {
                        showMonth = true;
                      } else {
                        const prevFirstDay = weeks[idx - 1][0];
                        if (prevFirstDay) {
                          const prevParts = prevFirstDay.date.split('-');
                          const prevMonthIndex = parseInt(prevParts[1]) - 1;
                          if (monthIndex !== prevMonthIndex) {
                            showMonth = true;
                          }
                        }
                      }

                      return (
                        <div key={idx} className="w-[14px] shrink-0 text-left overflow-visible">
                          {showMonth ? monthName : ""}
                        </div>
                      );
                    })}
                  </div>

                  {/* Columns of Days */}
                  <div className="flex gap-[3px]">
                    {weeks.map((week, weekIdx) => (
                      <div key={weekIdx} className="flex flex-col gap-[3px] shrink-0">
                        {week.map((day, dayIdx) => {
                          const count = day.count;
                          
                          // LeetCode / GitHub green shades
                          let bgClass = "bg-[#18181b] border border-border/40 hover:border-text-primary";
                          
                          if (count > 0 && count <= 2) {
                            bgClass = "bg-[#2cbb5d]/20 border border-[#2cbb5d]/30 text-[#2cbb5d] hover:border-[#2cbb5d]";
                          } else if (count > 2 && count <= 4) {
                            bgClass = "bg-[#2cbb5d]/50 border border-[#2cbb5d]/60 text-white hover:border-[#2cbb5d]";
                          } else if (count > 4) {
                            bgClass = "bg-[#2cbb5d] border border-[#2cbb5d] text-white hover:border-text-primary shadow-[0_0_8px_rgba(44,187,93,0.3)]";
                          }

                          return (
                            <div
                              key={dayIdx}
                              onClick={() => {
                                if (day.problems && day.problems.length > 0) {
                                  setSelectedDay(day === selectedDay ? null : day);
                                }
                              }}
                              className={`h-[11px] w-[11px] rounded-[2px] cursor-pointer transition-smooth ${bgClass}`}
                              title={`${day.date}: ${count} solved`}
                            />
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-3.5 text-[10px] text-text-secondary font-mono uppercase tracking-wider">
              <span>Activity Legend</span>
              <div className="flex items-center space-x-2">
                <span>Less</span>
                <div className="h-3 w-3 bg-[#18181b] border border-border rounded-[2px]"></div>
                <div className="h-3 w-3 bg-[#2cbb5d]/20 border border-[#2cbb5d]/30 rounded-[2px]"></div>
                <div className="h-3 w-3 bg-[#2cbb5d]/50 border border-[#2cbb5d]/60 rounded-[2px]"></div>
                <div className="h-3 w-3 bg-[#2cbb5d] rounded-[2px]"></div>
                <span>More</span>
              </div>
            </div>

            {/* Interactive Day Details Card */}
            {selectedDay && (
              <div className="mt-4 p-4 border border-border bg-surface/50 space-y-3 transition-smooth">
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <span className="text-xs font-black font-heading uppercase tracking-widest text-text-primary">
                    Activity on {selectedDay.date}
                  </span>
                  <span className="text-[10px] font-bold font-mono text-accent uppercase bg-accent/10 border border-accent/20 px-2 py-0.5">
                    {selectedDay.count} Solved
                  </span>
                </div>
                
                <div className="space-y-2">
                  {selectedDay.problems && selectedDay.problems.length > 0 ? (
                    selectedDay.problems.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => navigateToProblem(p.id)}
                        className="flex items-center justify-between p-2.5 border border-border hover:border-text-primary bg-background cursor-pointer transition-smooth"
                      >
                        <div className="flex items-center space-x-2">
                          <span className="text-[11px] font-bold font-mono text-text-secondary">#{p.leetcodeNumber}</span>
                          <span className="text-xs font-bold text-text-primary hover:underline">{p.name}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] text-text-secondary uppercase tracking-wider">{p.topicName}</span>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                            p.difficulty === 'EASY' ? 'text-emerald-400 bg-emerald-500/10' :
                            p.difficulty === 'MEDIUM' ? 'text-amber-400 bg-amber-500/10' : 'text-red-400 bg-red-500/10'
                          }`}>
                            {p.difficulty}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <span className="text-xs text-text-secondary font-mono">No problems solved on this day.</span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Strength Analysis */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="glass-panel rounded-2xl p-5 border border-emerald-500/10">
              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest block mb-1">Strongest Pattern</span>
              <h4 className="text-lg font-black text-slate-200">{stats.strongestPattern}</h4>
              <p className="text-xs text-slate-400 mt-2">
                Highest completion accuracy. Your logic structures in this area are sharp.
              </p>
            </div>
            <div className="glass-panel rounded-2xl p-5 border border-red-500/10">
              <span className="text-[10px] text-red-400 font-bold uppercase tracking-widest block mb-1">Weakest Pattern</span>
              <h4 className="text-lg font-black text-slate-200">{stats.weakestPattern}</h4>
              <p className="text-xs text-slate-400 mt-2">
                Lowest accuracy. Focus revision efforts here to close the logic gap.
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Revisions List & Recently Solved */}
        <div className="space-y-6">
          {/* Recently Solved */}
          <div className="glass-panel rounded-2xl p-6">
            <h3 className="text-base font-extrabold text-slate-200 mb-4 flex items-center justify-between">
              <span>Recently Solved</span>
              <button 
                onClick={() => setActiveTab('explorer')}
                className="text-xs text-primary hover:underline font-semibold"
              >
                View all
              </button>
            </h3>
            {stats.recentlySolved.length === 0 ? (
              <div className="text-center py-6 text-slate-500 text-xs font-sans">
                No problems solved yet. Start explorer to practice!
              </div>
            ) : (
              <div className="space-y-3">
                {stats.recentlySolved.map((p, idx) => (
                  <div 
                    key={idx}
                    onClick={() => navigateToProblem(p.id)}
                    className="flex items-center justify-between p-3 bg-slate-900/40 hover:bg-slate-900/80 border border-slate-800 rounded-xl cursor-pointer transition-smooth"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-slate-200">{p.name}</h4>
                      <span className="text-[10px] text-slate-500 mt-0.5 block">{p.topicName}</span>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      p.difficulty === 'EASY' ? 'text-emerald-400 bg-emerald-500/10' :
                      p.difficulty === 'MEDIUM' ? 'text-amber-400 bg-amber-500/10' : 'text-red-400 bg-red-500/10'
                    }`}>
                      {p.difficulty}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
