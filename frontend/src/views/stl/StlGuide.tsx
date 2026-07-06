import React, { useState } from 'react';
import Sidebar from './Sidebar';
import MainContent from './MainContent';
import { Terminal, Sun, Moon } from 'lucide-react';

interface StlGuideProps {
  onBackToPortal: () => void;
}

const StlGuide: React.FC<StlGuideProps> = ({ onBackToPortal }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeView, setActiveView] = useState<'cpp' | 'java' | 'sql'>('cpp');
  const [activeTab, setActiveTab] = useState<string>('vector');
  
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'light') {
      document.documentElement.classList.add('light');
      return 'light';
    }
    document.documentElement.classList.remove('light');
    return 'dark';
  });

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

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
    <div className="relative min-h-screen flex flex-col bg-transparent">
      {/* Sticky Header identical to the DSA Navbar */}
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

          {/* View Switcher Tabs (Center) */}
          <nav className="hidden md:flex space-x-1.5 p-1">
            <button
              onClick={() => { setActiveView('cpp'); setActiveTab('vector'); }}
              className={`px-3 py-1 rounded-sm text-xs font-bold uppercase tracking-wider transition-smooth cursor-pointer ${
                activeView === 'cpp'
                  ? 'border border-text-primary text-text-primary bg-surface/40'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              C++ STL
            </button>
            <button
              onClick={() => { setActiveView('java'); setActiveTab('arrayList'); }}
              className={`px-3 py-1 rounded-sm text-xs font-bold uppercase tracking-wider transition-smooth cursor-pointer ${
                activeView === 'java'
                  ? 'border border-text-primary text-text-primary bg-surface/40'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Java Collections
            </button>
            <button
              onClick={() => { setActiveView('sql'); setActiveTab('sql_practice_db'); }}
              className={`px-3 py-1 rounded-sm text-xs font-bold uppercase tracking-wider transition-smooth cursor-pointer ${
                activeView === 'sql'
                  ? 'border border-text-primary text-text-primary bg-surface/40'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              SQL Reference
            </button>
          </nav>

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
        <Sidebar 
          isOpen={isSidebarOpen} 
          activeView={activeView}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        
        <MainContent 
          isOpen={isSidebarOpen} 
          toggleSidebar={toggleSidebar} 
          isDarkMode={theme === 'dark'}
          toggleTheme={toggleTheme}
          activeView={activeView}
          activeTab={activeTab}
        />
      </div>
    </div>
  );
};

export default StlGuide;
