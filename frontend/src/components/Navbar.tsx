import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Flame, Terminal, CheckCircle2, Sun, Moon, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  activeTab: 'dashboard' | 'explorer' | 'problem' | 'settings' | 'revision';
  setActiveTab: (tab: 'dashboard' | 'explorer' | 'problem' | 'settings' | 'revision') => void;
  onSwitchPortal?: () => void;
  onGoToDashboard?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, onSwitchPortal, onGoToDashboard }) => {
  const { logout, user } = useAuth();
  const [streak, setStreak] = useState(0);
  const [solved, setSolved] = useState(0);
  const [pendingRevisions, setPendingRevisions] = useState(0);

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

  useEffect(() => {
    let fetchTimeout: number | undefined;

    const fetchNavbarStats = async () => {
      try {
        const stats = await api.get<{ currentStreak: number; problemsSolved: number; revisionDueTodayCount?: number }>('/dashboard/stats');
        setStreak(stats.currentStreak);
        setSolved(stats.problemsSolved);
        if (stats.revisionDueTodayCount !== undefined) {
          setPendingRevisions(stats.revisionDueTodayCount);
        }
      } catch (e) {
        // Silently capture
      }
    };

    const handleRefresh = (e: Event) => {
      const customEvent = e as CustomEvent<{ solvedDelta?: number; streakDelta?: number; newStreak?: number; newSolved?: number; revisionDueDelta?: number }>;
      if (customEvent.detail) {
        if (typeof customEvent.detail.newSolved === 'number') {
          setSolved(customEvent.detail.newSolved);
        } else if (typeof customEvent.detail.solvedDelta === 'number') {
          setSolved(prev => Math.max(0, prev + customEvent.detail.solvedDelta!));
        }

        if (typeof customEvent.detail.newStreak === 'number') {
          setStreak(customEvent.detail.newStreak);
        } else if (typeof customEvent.detail.streakDelta === 'number') {
          setStreak(prev => Math.max(0, prev + customEvent.detail.streakDelta!));
        }

        if (typeof customEvent.detail.revisionDueDelta === 'number') {
          setPendingRevisions(prev => Math.max(0, prev + customEvent.detail.revisionDueDelta!));
        }
      }
      if (fetchTimeout) clearTimeout(fetchTimeout);
      fetchTimeout = window.setTimeout(fetchNavbarStats, 500);
    };

    fetchNavbarStats();

    window.addEventListener('refresh-stats', handleRefresh);
    return () => {
      window.removeEventListener('refresh-stats', handleRefresh);
      if (fetchTimeout) clearTimeout(fetchTimeout);
    };
  }, [activeTab]); // Refetch when changing tab to stay up to date

  return (
    <header className="sticky top-0 w-full border-b border-border bg-surface/80 backdrop-blur-md z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <div 
          onClick={() => {
            if (onGoToDashboard) {
              onGoToDashboard();
            } else {
              setActiveTab('dashboard');
            }
          }} 
          className="flex items-center space-x-2.5 cursor-pointer group"
        >
          <Terminal className="h-5 w-5 text-text-primary" />
          <span className="text-[17px] font-black uppercase tracking-widest font-heading text-text-primary">
            PATTERN//FORGE
          </span>
        </div>

        {/* Tab Links */}
        <nav className="hidden md:flex space-x-1.5 p-1">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1 rounded-sm text-xs font-bold uppercase tracking-wider transition-smooth ${
              activeTab === 'dashboard'
                ? 'border border-text-primary text-text-primary bg-surface/40'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('explorer')}
            className={`px-3 py-1 rounded-sm text-xs font-bold uppercase tracking-wider transition-smooth ${
              activeTab === 'explorer' || activeTab === 'problem'
                ? 'border border-text-primary text-text-primary bg-surface/40'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Problems
          </button>
          <button
            onClick={() => setActiveTab('revision')}
            className={`px-3 py-1 rounded-sm text-xs font-bold uppercase tracking-wider transition-smooth flex items-center space-x-1.5 ${
              activeTab === 'revision'
                ? 'border border-text-primary text-text-primary bg-surface/40'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <span>Revision</span>
            {pendingRevisions > 0 && (
              <span className="inline-block text-[10px] animate-pulse text-red-500 font-extrabold" title={`${pendingRevisions} pending revisions`}>⚠️</span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3 py-1 rounded-sm text-xs font-bold uppercase tracking-wider transition-smooth ${
              activeTab === 'settings'
                ? 'border border-text-primary text-text-primary bg-surface/40'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Settings
          </button>
        </nav>

        {/* Profile, Streak, and Theme controls */}
        <div className="flex items-center space-x-3.5">
          {/* Streak count */}
          <div className="flex items-center space-x-1 border border-accent/40 bg-accent/5 px-2.5 py-0.5 rounded-sm text-accent text-[10px] font-bold uppercase tracking-wider select-none font-mono">
            <Flame className="h-3.5 w-3.5 fill-accent text-accent animate-pulse" />
            <span>{streak} DAY STREAK</span>
          </div>

          {/* Solved Problems */}
          <div className="hidden sm:flex items-center space-x-1 border border-text-primary/45 px-2.5 py-0.5 rounded-sm text-text-primary text-[10px] font-bold uppercase tracking-wider select-none font-mono">
            <CheckCircle2 className="h-3.5 w-3.5 text-text-primary" />
            <span>{solved} SOLVED</span>
          </div>

          {/* Switch Portal / Module Button */}
          {onSwitchPortal && (
            <>
              <button
                onClick={onSwitchPortal}
                title="Switch Portal / Module"
                className="px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-text-secondary hover:text-text-primary border border-border hover:border-text-primary transition-smooth rounded-sm cursor-pointer"
              >
                Modules
              </button>
              <div className="h-5 w-px bg-border"></div>
            </>
          )}

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
            className="p-1.5 rounded-sm text-text-secondary hover:text-text-primary hover:bg-surface/50 transition-smooth"
          >
            {theme === 'dark' ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
          </button>

          {/* Logout Button */}
          {user && (
            <>
              <div className="h-5 w-px bg-border"></div>
              <button
                onClick={logout}
                title="Logout"
                className="p-1.5 rounded-sm text-text-secondary hover:text-red-400 hover:bg-red-500/10 transition-smooth flex items-center space-x-1.5"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden md:inline text-[10px] font-extrabold uppercase tracking-wider text-slate-400">{user.username}</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
