import React, { useEffect, useState, useRef } from 'react';
import { api } from '../services/api';
import { Pause, Award, RefreshCw, AlertTriangle } from 'lucide-react';

interface FocusTimerOverlayProps {
  module: 'dsa' | 'stl' | 'sql' | 'os' | 'git' | 'aiml' | 'cn' | 'spring' | 'react' | 'projects';
  initialDurationMins: number;
  initialRemainingSecs?: number;
  onExit: () => void;
}

const MODULE_NAMES: Record<string, string> = {
  dsa: 'DSA Practice',
  stl: 'STL & Collections',
  sql: 'SQL Playground',
  os: 'OS Revision',
  git: 'Git & GitHub',
  aiml: 'AI / ML System',
  cn: 'CN Revision',
  spring: 'Spring Boot',
  react: 'React JS',
  projects: 'Projects Architecture'
};

const FocusTimerOverlay: React.FC<FocusTimerOverlayProps> = ({ module, initialDurationMins, initialRemainingSecs, onExit }) => {
  const [secondsRemaining, setSecondsRemaining] = useState(
    initialRemainingSecs !== undefined && initialRemainingSecs > 0
      ? initialRemainingSecs
      : initialDurationMins * 60
  );
  const [isFocusActive, setIsFocusActive] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [savingProgress, setSavingProgress] = useState(false);

  const timerIntervalRef = useRef<any>(null);

  // Monitor Fullscreen changes
  useEffect(() => {
    const checkFullscreen = () => {
      const isFs = !!document.fullscreenElement;
      setIsFocusActive(isFs);
    };

    // Try to request fullscreen initially when mounted
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {
        // Ignored, user will click resume button
      });
    } else {
      setIsFocusActive(true);
    }

    document.addEventListener('fullscreenchange', checkFullscreen);
    return () => {
      document.removeEventListener('fullscreenchange', checkFullscreen);
    };
  }, []);

  // Timer Tick implementation
  useEffect(() => {
    if (isFocusActive && secondsRemaining > 0 && !isCompleted) {
      timerIntervalRef.current = setInterval(() => {
        setSecondsRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timerIntervalRef.current!);
            handleSessionCompletion();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isFocusActive, secondsRemaining, isCompleted]);

  const handleSessionCompletion = async () => {
    setIsCompleted(true);
    setSavingProgress(true);
    
    // Exit fullscreen
    if (document.fullscreenElement) {
      try {
        await document.exitFullscreen();
      } catch (err) {
        // ignore
      }
    }

    try {
      await api.post(`/daily-tasks/today/complete`, { module });
    } catch (err) {
      console.error("Failed to complete focus task", err);
    } finally {
      setSavingProgress(false);
    }
  };

  const handleResumeFocus = () => {
    document.documentElement.requestFullscreen().then(() => {
      setIsFocusActive(true);
    }).catch(() => {
      alert("Failed to enter focus mode. Please click again.");
    });
  };

  const saveProgressAndExit = async () => {
    if (secondsRemaining > 0 && !isCompleted) {
      try {
        await api.post(`/daily-tasks/today/pause`, { module, remainingSeconds: secondsRemaining });
      } catch (err) {
        console.error("Failed to save paused progress", err);
      }
    }

    if (document.fullscreenElement) {
      try {
        await document.exitFullscreen();
      } catch (err) {
        // ignore
      }
    }
    onExit();
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  const progressPercent = ((initialDurationMins * 60 - secondsRemaining) / (initialDurationMins * 60)) * 100;

  return (
    <>
      {/* Top Floating Glass Bar (when active) */}
      {isFocusActive && !isCompleted && (
        <div className="fixed top-0 left-0 w-full z-[9999] bg-slate-950/80 backdrop-blur-md border-b border-emerald-500/20 px-6 py-2 flex items-center justify-between text-white select-none animate-fade-in font-sans">
          <div className="flex items-center space-x-3">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">
              Focus Session: <strong className="text-slate-100">{MODULE_NAMES[module] || module}</strong>
            </span>
          </div>

          <div className="flex items-center space-x-6">
            {/* Progress indicator */}
            <div className="hidden sm:flex items-center space-x-2 w-32 md:w-48">
              <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${progressPercent}%` }}></div>
              </div>
              <span className="text-[9px] font-mono text-slate-400 font-bold">{Math.round(progressPercent)}%</span>
            </div>

            {/* Timer digits */}
            <span className="text-sm font-black font-mono tracking-wider bg-slate-900 border border-slate-800 px-3 py-1 rounded-lg text-emerald-400">
              {formatTime(secondsRemaining)}
            </span>

            {/* Pause controls */}
            <button
              onClick={saveProgressAndExit}
              className="px-3 py-1 bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 text-red-400 font-extrabold uppercase rounded-lg text-[9px] flex items-center space-x-1 cursor-pointer transition-smooth"
            >
              <Pause className="h-3 w-3" />
              <span>Pause & Exit</span>
            </button>
          </div>
        </div>
      )}

      {/* Focus Mode Suspended Overlay */}
      {!isFocusActive && !isCompleted && (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-slate-950/95 backdrop-blur-md px-4 font-sans select-none">
          <div className="glass-panel border border-slate-900 rounded-2xl w-full max-w-sm p-6 text-center space-y-6 shadow-2xl relative">
            <div className="h-12 w-12 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center mx-auto animate-pulse">
              <AlertTriangle className="h-6 w-6" />
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-extrabold uppercase tracking-wider text-slate-200">Focus Mode Suspended</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                You have exited full-screen mode. The focus timer is currently paused. Please enter full screen to continue.
              </p>
            </div>

            <div className="flex flex-col space-y-2.5 pt-2">
              <button
                onClick={handleResumeFocus}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase text-xs rounded-xl transition-smooth shadow-glow-emerald cursor-pointer"
              >
                Resume Focus Mode
              </button>
              <button
                onClick={saveProgressAndExit}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 font-extrabold uppercase text-xs rounded-xl transition-smooth cursor-pointer"
              >
                Pause Timer & Exit Session
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Focus Session Completed Celebration Modal */}
      {isCompleted && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/98 backdrop-blur-lg px-4 font-sans select-none animate-fade-in">
          <div className="glass-panel border border-emerald-500/20 rounded-2xl w-full max-w-sm p-8 text-center space-y-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-[60px] pointer-events-none"></div>

            <div className="h-16 w-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-glow-emerald animate-bounce">
              <Award className="h-8 w-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-black uppercase tracking-wider text-slate-100">Daily Task Completed!</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                Awesome job! You focused on <strong className="text-emerald-400 uppercase">{MODULE_NAMES[module] || module}</strong> for <strong className="text-emerald-400">{initialDurationMins} minutes</strong> today. Your daily heatmap progress has been updated!
              </p>
            </div>

            <button
              onClick={saveProgressAndExit}
              disabled={savingProgress}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase text-xs rounded-xl transition-smooth shadow-glow-primary cursor-pointer disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {savingProgress ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Logging progress...</span>
                </>
              ) : (
                <span>Return to Dashboard</span>
              )}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default FocusTimerOverlay;
