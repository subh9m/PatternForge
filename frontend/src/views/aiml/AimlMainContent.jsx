import React from 'react';
import AimlCard from './AimlCard';
import AimlCheatSheet from './AimlCheatSheet';
import AimlPlayground from './AimlPlayground';
import { aimlConcepts } from './aimlRegistry';

const MenuIcon = ({ isOpen }) => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} className="transition-all duration-300 ease-in-out" />
  </svg>
);

export default function AimlMainContent({ isOpen, toggleSidebar, activeTab }) {
  const currentConcept = aimlConcepts.find(item => item.id === activeTab);

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
                    bg-white/60 dark:bg-black/60 backdrop-blur-md 
                    border border-gray-200 dark:border-[#333] 
                    rounded-full text-gray-700 dark:text-gray-300 
                    hover:text-red-500 dark:hover:text-red-500 
                    hover:shadow-[0_0_20px_rgba(239,68,68,0.4)]
                    transition-all duration-500 ease-in-out
                    ${isOpen ? 'left-1/2 -translate-x-1/2 sm:left-64 sm:ml-4 sm:translate-x-0' : 'left-6 translate-x-0'}`}
      >
        <MenuIcon isOpen={isOpen} />
      </button>

      {/* Content Grid */}
      <div className="max-w-7xl mx-auto p-6 md:p-10 pt-10 space-y-8">
        {activeTab === 'aiml_cheat_sheet' ? (
          <AimlCheatSheet />
        ) : activeTab === 'aiml_playground' ? (
          <AimlPlayground />
        ) : currentConcept ? (
          <AimlCard key={currentConcept.id} data={currentConcept} />
        ) : (
          <AimlCard key={aimlConcepts[0].id} data={aimlConcepts[0]} />
        )}
      </div>
    </main>
  );
}
