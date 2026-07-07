import React from 'react';
import DataStructureCard from './DataStructureCard';
import { cppDataStructures, javaDataStructures } from './dataStructuresRegistry';

// --- ICONS ---
const MenuIcon = ({ isOpen }) => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} className="transition-all duration-300 ease-in-out" />
  </svg>
);
const ThemeIcon = ({ isDarkMode }) => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2500/svg">
    {isDarkMode ? (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    ) : (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    )}
  </svg>
);

const CppContent = ({ activeTab }) => {
  const ds = cppDataStructures.find(item => item.id === activeTab) || cppDataStructures[0];
  return ds ? <DataStructureCard key={ds.id} data={ds} /> : null;
};

const JavaContent = ({ activeTab }) => {
  const ds = javaDataStructures.find(item => item.id === activeTab) || javaDataStructures[0];
  return ds ? <DataStructureCard key={ds.id} data={ds} /> : null;
};

export default function MainContent({ isOpen, toggleSidebar, isDarkMode, toggleTheme, activeView, activeTab }) {
  return (
    <main
      className={`relative min-h-[calc(100vh-64px)] w-full
                  bg-background
                  transition-all duration-500 ease-in-out
                  ${isOpen ? 'pl-0 sm:pl-64' : 'pl-0'}`}
    >
      {/* Sidebar Toggle Button */}
      <button
        onClick={toggleSidebar}
        className={`fixed top-20 z-40 p-3 
                    bg-white/80 dark:bg-neutral-950/70 backdrop-blur-md 
                    border border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 
                    rounded-full text-neutral-700 dark:text-neutral-300 
                    hover:text-red-500 dark:hover:text-red-500 
                    hover:shadow-[0_0_20px_rgba(255,0,0,0.4)]
                    transition-all duration-500 ease-in-out
                    ${isOpen ? 'left-1/2 -translate-x-1/2 sm:left-64 sm:ml-4 sm:translate-x-0' : 'left-6 translate-x-0'}`}
      >
        <MenuIcon isOpen={isOpen} />
      </button>

      {/* Content grid */}
      <div className="max-w-7xl mx-auto p-6 md:p-10 pt-10 space-y-8">
        {activeView === 'cpp' ? (
          <CppContent activeTab={activeTab} />
        ) : (
          <JavaContent activeTab={activeTab} />
        )}
      </div>
    </main>
  );
}