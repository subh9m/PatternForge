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
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    {isDarkMode ? (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    ) : (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    )}
  </svg>
);

const CppContent = () => (
  <>
    {cppDataStructures.map((ds) => (
      <DataStructureCard key={ds.id} data={ds} />
    ))}
  </>
);

const JavaContent = () => (
  <>
    {javaDataStructures.map((ds) => (
      <DataStructureCard key={ds.id} data={ds} />
    ))}
  </>
);

export default function MainContent({ isOpen, toggleSidebar, isDarkMode, toggleTheme, activeView }) {
  return (
    <main
      className={`relative min-h-screen 
                  bg-gray-50 dark:bg-[#0a0a0a] 
                  transition-all duration-500 ease-in-out
                  ${isOpen ? 'pl-0 sm:pl-64' : 'pl-0'}`}
    >
      {/* Sidebar Toggle Button */}
      <button
        onClick={toggleSidebar}
        className={`fixed top-6 z-50 p-3 
                    bg-white/60 dark:bg-black/60 backdrop-blur-md 
                    border border-gray-200 dark:border-[#333] 
                    rounded-full text-gray-700 dark:text-gray-300 
                    hover:text-red-500 dark:hover:text-red-500 
                    hover:shadow-[0_0_20px_rgba(255,0,0,0.4)]
                    transition-all duration-500 ease-in-out
                    ${isOpen ? 'left-1/2 -translate-x-1/2 sm:left-64 sm:ml-4 sm:translate-x-0' : 'left-6 translate-x-0'}`}
      >
        <MenuIcon isOpen={isOpen} />
      </button>

      {/* Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        className="fixed top-6 right-6 z-50 p-3 
                   bg-white/60 dark:bg-black/60 backdrop-blur-md 
                   border border-gray-200 dark:border-[#333] 
                   rounded-full text-gray-700 dark:text-gray-300 
                   hover:text-red-500 dark:hover:text-red-500 
                   hover:shadow-[0_0_20px_rgba(255,0,0,0.4)]
                   transition-all duration-300 ease-in-out"
      >
        <ThemeIcon isDarkMode={isDarkMode} />
      </button>
      
      {/* Content grid */}
      <div className="max-w-7xl mx-auto p-6 md:p-10 pt-24 space-y-8">
        {activeView === 'cpp' ? <CppContent /> : <JavaContent />}
      </div>
    </main>
  );
}