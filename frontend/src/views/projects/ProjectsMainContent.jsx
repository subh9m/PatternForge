import React from 'react';
import ProjectsCard from './ProjectsCard';
import ProjectsPlayground from './ProjectsPlayground';

const MenuIcon = ({ isOpen }) => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} className="transition-all duration-300 ease-in-out" />
  </svg>
);

export default function ProjectsMainContent({ isOpen, toggleSidebar, activeProject, activeTab }) {
  return (
    <main
      className={`relative min-h-[calc(100vh-64px)] w-full
                  bg-background
                  transition-all duration-500 ease-in-out
                  ${isOpen ? 'pl-0 sm:pl-64' : 'pl-0'}`}
    >
      {/* Sidebar Toggle */}
      <button
        onClick={toggleSidebar}
        className={`fixed top-20 z-40 p-3 
                    bg-white/80 dark:bg-neutral-950/70 backdrop-blur-md 
                    border border-gray-200 dark:border-neutral-800 
                    rounded-full text-gray-700 dark:text-gray-300 
                    hover:text-fuchsia-500 dark:hover:text-fuchsia-500 
                    hover:shadow-[0_0_20px_rgba(217,70,239,0.4)]
                    transition-all duration-500 ease-in-out
                    ${isOpen ? 'left-1/2 -translate-x-1/2 sm:left-64 sm:ml-4 sm:translate-x-0' : 'left-6 translate-x-0'}`}
      >
        <MenuIcon isOpen={isOpen} />
      </button>

      {/* Content Container */}
      <div className="max-w-7xl mx-auto p-6 md:p-10 pt-10 space-y-8">
        
        {/* Project Header Banner */}
        <div className="bg-white/80 dark:bg-neutral-950/70 backdrop-blur-md border border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 rounded-2xl p-6 md:p-8 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <span className="px-3 py-1 bg-fuchsia-500/10 text-fuchsia-500 text-[10px] font-black uppercase font-mono tracking-wider rounded-md">
              Project Showcase
            </span>
            <h1 className="text-2xl font-black text-gray-950 dark:text-white font-mono uppercase tracking-wide">
              {activeProject.title}
            </h1>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 font-light leading-relaxed">
              {activeProject.tagline}
            </p>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-4 text-center font-mono">
            <div className="p-3 border border-gray-200 dark:border-neutral-900 bg-neutral-50/50 dark:bg-neutral-900/30 rounded-xl">
              <span className="text-[9px] text-gray-400 block uppercase">Language</span>
              <strong className="text-xs text-neutral-800 dark:text-neutral-200 dark:text-neutral-700 dark:text-neutral-300">Java / TS</strong>
            </div>
            <div className="p-3 border border-gray-200 dark:border-neutral-900 bg-neutral-50/50 dark:bg-neutral-900/30 rounded-xl">
              <span className="text-[9px] text-gray-400 block uppercase">Review Tier</span>
              <strong className="text-xs text-fuchsia-500 font-black">Google L5</strong>
            </div>
          </div>
        </div>

        {activeTab === 'playground' ? (
          <ProjectsPlayground />
        ) : (
          <ProjectsCard data={activeProject} activeTab={activeTab} />
        )}
        
      </div>
    </main>
  );
}
