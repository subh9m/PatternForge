import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Code2, BookOpen, Database, LogOut, Sun, Moon } from 'lucide-react';

interface PortalSelectionProps {
  onSelectPortal: (portal: 'dsa' | 'stl' | 'sql') => void;
}

const PortalSelection: React.FC<PortalSelectionProps> = ({ onSelectPortal }) => {
  const { user, logout } = useAuth();
  
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'light') {
      document.documentElement.classList.add('light');
      return 'light';
    }
    document.documentElement.classList.remove('light');
    return 'dark';
  });

  const toggleTheme = () => {
    if (theme === 'dark') {
      document.documentElement.classList.add('light');
      localStorage.setItem('theme', 'light');
      setTheme('light');
    } else {
      document.documentElement.classList.remove('light');
      localStorage.setItem('theme', 'dark');
      setTheme('dark');
    }
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-background px-4 relative overflow-hidden select-none">
      {/* Floating Theme Toggle & Sign Out on the top-right of page */}
      <div className="absolute top-6 right-6 flex items-center space-x-3 z-50">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl bg-surface/60 border border-border hover:border-text-primary text-text-secondary hover:text-text-primary transition-smooth flex items-center justify-center cursor-pointer shadow-md"
          title="Toggle Theme"
        >
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
        <button
          onClick={logout}
          className="px-4 py-2 rounded-xl bg-surface/60 border border-border hover:border-red-500 hover:text-red-400 text-text-secondary transition-smooth flex items-center space-x-2 text-xs font-extrabold cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
          <span>SIGN OUT</span>
        </button>
      </div>

      {/* Decorative Blur Spheres */}
      <div className="absolute top-1/4 left-1/4 h-64 w-64 rounded-full bg-blue-500/5 blur-[90px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full bg-emerald-500/5 blur-[90px] pointer-events-none"></div>

      {/* Unified Single Central Card */}
      <div className="glass-panel w-full max-w-3xl p-8 sm:p-10 shadow-2xl border border-border relative z-10">
        {/* Header / Branding */}
        <div className="text-center mb-8 border-b border-border pb-6">
          <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-blue-400 via-cyan-300 to-emerald-400 bg-clip-text text-transparent uppercase font-heading">
            PatternForge
          </h1>
          <p className="mt-2 text-xs text-text-secondary font-medium">
            Welcome, <span className="text-text-primary font-bold uppercase">{user?.username}</span>. Select your active workspace.
          </p>
        </div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* DSA Workspace */}
          <div
            onClick={() => onSelectPortal('dsa')}
            className="p-6 border border-border hover:border-text-primary bg-background/50 hover:bg-background/80 transition-smooth flex flex-col justify-between items-start text-left cursor-pointer group"
          >
            <div className="w-full">
              <div className="h-10 w-10 bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4 group-hover:shadow-glow-blue transition-smooth">
                <Code2 className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-black text-text-primary uppercase tracking-wider mb-2">
                DSA Practice
              </h2>
              <p className="text-xs text-text-secondary leading-relaxed font-light mb-4">
                Solve pattern-based algorithm tasks, run code tests, and build streak statistics.
              </p>
            </div>
            <span className="text-xs font-bold text-blue-400 group-hover:text-blue-300 transition-smooth flex items-center space-x-1 pt-2">
              <span>LAUNCH</span>
              <span className="transform group-hover:translate-x-1 transition-transform">→</span>
            </span>
          </div>

          {/* STL / Collections Reference */}
          <div
            onClick={() => onSelectPortal('stl')}
            className="p-6 border border-border hover:border-text-primary bg-background/50 hover:bg-background/80 transition-smooth flex flex-col justify-between items-start text-left cursor-pointer group"
          >
            <div className="w-full">
              <div className="h-10 w-10 bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4 group-hover:shadow-glow-emerald transition-smooth">
                <BookOpen className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-black text-text-primary uppercase tracking-wider mb-2">
                STL & Collections
              </h2>
              <p className="text-xs text-text-secondary leading-relaxed font-light mb-4">
                Lookup C++ standard template library and Java collections specifications and complexities.
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-400 group-hover:text-emerald-300 transition-smooth flex items-center space-x-1 pt-2">
              <span>EXPLORE</span>
              <span className="transform group-hover:translate-x-1 transition-transform">→</span>
            </span>
          </div>

          {/* SQL Reference Playground */}
          <div
            onClick={() => onSelectPortal('sql')}
            className="p-6 border border-border hover:border-text-primary bg-background/50 hover:bg-background/80 transition-smooth flex flex-col justify-between items-start text-left cursor-pointer group"
          >
            <div className="w-full">
              <div className="h-10 w-10 bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-4 group-hover:shadow-glow-purple transition-smooth">
                <Database className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-black text-text-primary uppercase tracking-wider mb-2">
                SQL Playground
              </h2>
              <p className="text-xs text-text-secondary leading-relaxed font-light mb-4">
                Execute relational queries, inspect corporate databases, and practice advanced commands.
              </p>
            </div>
            <span className="text-xs font-bold text-purple-400 group-hover:text-purple-300 transition-smooth flex items-center space-x-1 pt-2">
              <span>QUERY</span>
              <span className="transform group-hover:translate-x-1 transition-transform">→</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortalSelection;
