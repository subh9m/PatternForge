import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Code2, BookOpen, LogOut, Sun, Moon } from 'lucide-react';

interface PortalSelectionProps {
  onSelectPortal: (portal: 'dsa' | 'stl') => void;
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-955 px-4 relative py-12">
      {/* Theme Toggler & Logout buttons in top-right */}
      <div className="absolute top-6 right-6 flex items-center space-x-3">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-text-primary text-text-primary hover:text-white transition-smooth flex items-center justify-center cursor-pointer shadow-md"
          title="Toggle Theme"
        >
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
        <button
          onClick={logout}
          className="px-4 py-2 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-red-500 hover:text-red-400 text-slate-400 transition-smooth flex items-center space-x-2 text-xs font-extrabold cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
          <span>SIGN OUT</span>
        </button>
      </div>

      {/* Brand / Greeting */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 via-cyan-300 to-emerald-400 bg-clip-text text-transparent uppercase font-heading">
          PatternForge
        </h1>
        <p className="mt-3 text-sm text-slate-400 font-medium">
          Welcome back, <span className="text-slate-200 font-extrabold uppercase">{user?.username}</span>. Select your module to get started.
        </p>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        {/* DSA Workspace Portal Card */}
        <div
          onClick={() => onSelectPortal('dsa')}
          className="glass-panel glass-panel-hover flex flex-col justify-between items-start text-left cursor-pointer group p-8"
        >
          <div className="w-full">
            <div className="h-12 w-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-6 group-hover:shadow-glow-blue transition-smooth">
              <Code2 className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-black text-slate-100 uppercase tracking-wider mb-3">
              DSA Workspace
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed font-medium mb-6">
              Solve curated DSA pattern problems, analyze edge cases, write code drafts, and trace dynamic progress stats with our interactive compiler.
            </p>
          </div>
          <span className="text-xs font-bold text-blue-400 group-hover:text-blue-300 transition-smooth flex items-center space-x-1.5 pt-2">
            <span>ENTER WORKSPACE</span>
            <span className="transform group-hover:translate-x-1 transition-transform">→</span>
          </span>
        </div>

        {/* STL/Java Collections Portal Card */}
        <div
          onClick={() => onSelectPortal('stl')}
          className="glass-panel glass-panel-hover flex flex-col justify-between items-start text-left cursor-pointer group p-8"
        >
          <div className="w-full">
            <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-6 group-hover:shadow-glow-emerald transition-smooth">
              <BookOpen className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-black text-slate-100 uppercase tracking-wider mb-3">
              STL & Java Collections
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed font-medium mb-6">
              Access the ultimate reference guide for C++ Standard Template Library algorithms and Java Collections Framework structures with syntax examples.
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-400 group-hover:text-emerald-300 transition-smooth flex items-center space-x-1.5 pt-2">
            <span>OPEN REFERENCE SHEET</span>
            <span className="transform group-hover:translate-x-1 transition-transform">→</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default PortalSelection;
