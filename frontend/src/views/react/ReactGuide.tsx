import React, { useState } from 'react';
import ReactSidebar from './ReactSidebar';
import ReactMainContent from './ReactMainContent';
import { Terminal, Sun, Moon } from 'lucide-react';

interface ReactGuideProps {
  onBackToPortal: () => void;
}

const ReactGuide: React.FC<ReactGuideProps> = ({ onBackToPortal }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('react_fundamentals');
  
  const [fontScale, setFontScale] = useState<number>(() => {
    const saved = localStorage.getItem('reading-font-scale');
    const parsed = saved ? parseFloat(saved) : 1.0;
    document.documentElement.style.setProperty('--font-scale', parsed.toString());
    return parsed;
  });

  const handleFontScaleChange = (val: number) => {
    setFontScale(val);
    localStorage.setItem('reading-font-scale', val.toString());
    document.documentElement.style.setProperty('--font-scale', val.toString());
  };

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

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

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

  return (
    <div className="relative min-h-screen flex flex-col bg-transparent">
      {/* Header Banner */}
      <header className="sticky top-0 w-full border-b border-border bg-surface/80 backdrop-blur-md z-45">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand */}
          <div 
            onClick={onBackToPortal} 
            className="flex items-center space-x-2.5 cursor-pointer group"
          >
            <Terminal className="h-5 w-5 text-text-primary" />
            <span className="text-[17px] font-black uppercase tracking-widest font-heading text-text-primary">
              PATTERN//FORGE
            </span>
          </div>

          {/* Module descriptor */}
          <div className="font-mono text-xs font-black uppercase tracking-widest text-text-primary px-3 py-1 border border-border rounded-sm bg-surface/40">
            React Interview Revision
          </div>

          {/* Right Action Menu */}
          <div className="flex items-center space-x-3.5">
            <div className="flex items-center space-x-2 border border-border px-2.5 py-1 rounded-sm bg-surface/30">
              <span className="text-[9px] font-mono font-black text-text-secondary uppercase">SIZE</span>
              <input
                type="range"
                min="0.85"
                max="1.4"
                step="0.05"
                value={fontScale}
                onChange={(e) => handleFontScaleChange(parseFloat(e.target.value))}
                className="w-16 sm:w-20 cursor-pointer h-1 accent-text-primary bg-border rounded-lg appearance-none"
              />
              <span className="text-[9px] font-mono font-black text-text-primary">{Math.round(fontScale * 100)}%</span>
            </div>

            <div className="h-5 w-px bg-border"></div>
            <button
              onClick={onBackToPortal}
              title="Switch Portal / Module"
              className="px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-text-secondary hover:text-text-primary border border-border hover:border-text-primary transition-smooth rounded-sm cursor-pointer"
            >
              Modules
            </button>

            <div className="h-5 w-px bg-border"></div>

            <button
              onClick={toggleTheme}
              title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
              className="p-1.5 rounded-sm text-text-secondary hover:text-text-primary hover:bg-surface/50 transition-smooth cursor-pointer"
            >
              {theme === 'dark' ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Layout Grid */}
      <div className="flex-1 flex relative">
        <ReactSidebar 
          isOpen={isSidebarOpen} 
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        
        <ReactMainContent 
          isOpen={isSidebarOpen} 
          toggleSidebar={toggleSidebar} 
          activeTab={activeTab}
        />
      </div>
    </div>
  );
};

export default ReactGuide;
