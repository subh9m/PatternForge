import React, { useState } from 'react';
import AimlSidebar from './AimlSidebar';
import AimlMainContent from './AimlMainContent';
import { Terminal, Sun, Moon } from 'lucide-react';

interface AimlGuideProps {
  onBackToPortal: () => void;
}

const AimlGuide: React.FC<AimlGuideProps> = ({ onBackToPortal }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('aiml_fundamentals');
  
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
      {/* Sticky Header */}
      <header className="sticky top-0 w-full border-b border-border bg-surface/80 backdrop-blur-md z-45">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <div 
            onClick={onBackToPortal} 
            className="flex items-center space-x-2.5 cursor-pointer group"
          >
            <Terminal className="h-5 w-5 text-text-primary" />
            <span className="text-[17px] font-black uppercase tracking-widest font-heading text-text-primary">
              PATTERN//FORGE
            </span>
          </div>

          {/* Module Heading */}
          <div className="font-mono text-xs font-black uppercase tracking-widest text-text-primary px-3 py-1 border border-border rounded-sm bg-surface/40">
            AI & ML Revision System
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center space-x-3.5">
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

      {/* Main Layout Container */}
      <div className="flex-1 flex relative">
        <AimlSidebar 
          isOpen={isSidebarOpen} 
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        
        <AimlMainContent 
          isOpen={isSidebarOpen} 
          toggleSidebar={toggleSidebar} 
          activeTab={activeTab}
        />
      </div>
    </div>
  );
};

export default AimlGuide;
