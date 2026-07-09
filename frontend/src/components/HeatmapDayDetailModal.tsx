import React, { useEffect, useState } from 'react';
import { X, Calendar, CheckCircle2, BookOpen } from 'lucide-react';
import { api } from '../services/api';

export interface DayDetailData {
  date: string;
  questionsSolved: number;
  questionsRevised: number;
  revisionTimeSecs: number;
  studyTimeSecs: number;
  solvedProblems: {
    id: string;
    name: string;
    leetcodeNumber: number;
    difficulty: string;
    topicName: string;
  }[];
  readingSessions: {
    module: string;
    targetTimeMins: number;
    actualTimeSecs: number;
    completed: boolean;
    status: string;
  }[];
}

const MODULE_NAMES: Record<string, string> = {
  dsa: 'DSA Practice',
  stl: 'STL & Collections',
  sql: 'SQL Playground',
  os: 'Operating Systems',
  git: 'Git & GitHub',
  aiml: 'AI / ML System',
  cn: 'Computer Networks',
  spring: 'Spring Boot',
  react: 'React JS',
  projects: 'Projects Architecture',
};

const formatDuration = (seconds: number): string => {
  if (!seconds || seconds <= 0) return '0m';
  const mins = Math.floor(seconds / 60);
  const hrs = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  if (hrs > 0) {
    return `${hrs}h ${remainingMins.toString().padStart(2, '0')}m`;
  }
  return `${mins}m`;
};

interface HeatmapDayDetailModalProps {
  date: string | null;
  onClose: () => void;
  onNavigateProblem?: (id: string) => void;
}

const HeatmapDayDetailModal: React.FC<HeatmapDayDetailModalProps> = ({
  date,
  onClose,
  onNavigateProblem,
}) => {
  const [detail, setDetail] = useState<DayDetailData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!date) {
      setDetail(null);
      return;
    }

    const loadDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await api.get<DayDetailData>(`/dashboard/day?date=${date}`);
        setDetail(data);
      } catch (e: any) {
        setError(e.message || 'Failed to load day details');
      } finally {
        setLoading(false);
      }
    };
    loadDetail();
  }, [date]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (date) {
      document.addEventListener('keydown', handleEsc);
      return () => document.removeEventListener('keydown', handleEsc);
    }
  }, [date, onClose]);

  if (!date) return null;

  const displayDate = new Date(date + 'T12:00:00').toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-800 bg-slate-900/95 backdrop-blur px-5 py-4">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-blue-400" />
            <h3 className="text-sm font-extrabold text-slate-100">{displayDate}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-smooth"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {loading && (
            <div className="flex justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          )}

          {error && (
            <div className="text-xs text-red-400 text-center py-4">{error}</div>
          )}

          {detail && !loading && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-3 text-center">
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Questions Solved</span>
                  <span className="text-2xl font-black text-emerald-400 mt-1 block">{detail.questionsSolved}</span>
                </div>
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-3 text-center">
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Questions Revised</span>
                  <span className="text-2xl font-black text-purple-400 mt-1 block">{detail.questionsRevised}</span>
                </div>
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-3 text-center">
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Revision Time</span>
                  <span className="text-lg font-black text-slate-200 mt-1 block">{formatDuration(detail.revisionTimeSecs)}</span>
                </div>
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-3 text-center">
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Study Time</span>
                  <span className="text-lg font-black text-slate-200 mt-1 block">{formatDuration(detail.studyTimeSecs)}</span>
                </div>
              </div>

              {detail.readingSessions.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
                    <BookOpen className="h-4 w-4 text-amber-400" />
                    <span className="text-xs font-extrabold text-slate-300 uppercase tracking-wider">Reading Sessions</span>
                  </div>
                  {detail.readingSessions.map((session) => (
                    <div key={session.module} className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-200">
                          {MODULE_NAMES[session.module] || session.module}
                        </span>
                        {session.completed && (
                          <span className="flex items-center space-x-1 text-[10px] font-bold text-emerald-400">
                            <CheckCircle2 className="h-3 w-3" />
                            <span>Completed</span>
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[10px]">
                        <div>
                          <span className="text-slate-500 block">Target</span>
                          <span className="text-slate-300 font-bold">{session.targetTimeMins} min</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Actual</span>
                          <span className="text-slate-300 font-bold">{formatDuration(session.actualTimeSecs)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {detail.solvedProblems.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-extrabold text-slate-300 uppercase tracking-wider block border-b border-slate-800 pb-2">
                    Problems Solved
                  </span>
                  {detail.solvedProblems.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => onNavigateProblem?.(p.id)}
                      className={`flex items-center justify-between p-2.5 rounded-lg border border-slate-800 bg-slate-800/20 ${
                        onNavigateProblem ? 'cursor-pointer hover:border-slate-600' : ''
                      } transition-smooth`}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-mono text-slate-500">#{p.leetcodeNumber}</span>
                        <span className="text-xs font-bold text-slate-200">{p.name}</span>
                      </div>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        p.difficulty === 'EASY' ? 'text-emerald-400 bg-emerald-500/10' :
                        p.difficulty === 'MEDIUM' ? 'text-amber-400 bg-amber-500/10' : 'text-red-400 bg-red-500/10'
                      }`}>
                        {p.difficulty}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {detail.questionsSolved === 0 && detail.questionsRevised === 0 && detail.readingSessions.length === 0 && (
                <p className="text-xs text-slate-500 text-center py-4">No activity recorded for this day.</p>
              )}

              <div className="border-t border-slate-800 pt-3 flex items-center justify-between">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Total Study Time</span>
                <span className="text-sm font-black text-slate-200">{formatDuration(detail.studyTimeSecs)}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default HeatmapDayDetailModal;
