import React, { useState } from 'react';
import Sidebar from './Sidebar';
import MainContent from './MainContent';
import { Home } from 'lucide-react';

interface StlGuideProps {
  onBackToPortal: () => void;
}

const StlGuide: React.FC<StlGuideProps> = ({ onBackToPortal }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeView, setActiveView] = useState<'cpp' | 'java'>('cpp');
  
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

  const toggleView = () => {
    setActiveView(activeView === 'cpp' ? 'java' : 'cpp');
  };

  return (
    <div className="relative min-h-screen bg-color">
      {/* Floating Home Back Button */}
      <button
        onClick={onBackToPortal}
        className="fixed top-6 left-6 z-50 p-3 rounded-full bg-slate-900/60 border border-slate-800 hover:border-text-primary text-text-primary hover:text-white transition-smooth flex items-center justify-center cursor-pointer shadow-md"
        title="Back to Modules Portal"
      >
        <Home className="h-5 w-5" />
      </button>

      <Sidebar 
        isOpen={isSidebarOpen} 
        activeView={activeView}
        toggleView={toggleView}
      />
      
      <MainContent 
        isOpen={isSidebarOpen} 
        toggleSidebar={toggleSidebar} 
        isDarkMode={theme === 'dark'}
        toggleTheme={toggleTheme}
        activeView={activeView}
      />
    </div>
  );
};

export default StlGuide;
