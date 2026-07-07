import React, { createContext, useContext } from 'react';
// No icons needed in sidebar

export const ProjectsSidebarContext = createContext({ activeTab: '', onTabChange: () => {} });

const NavItem = ({ href, children }) => {
  const { activeTab, onTabChange } = useContext(ProjectsSidebarContext);
  const targetId = href.replace('#', '');
  const isActive = activeTab === targetId;
  return (
    <a
      href={href}
      onClick={(e) => {
        e.preventDefault();
        onTabChange(targetId);
      }}
      className={`block px-4 py-1.5 rounded-lg text-xs font-mono font-bold transition-all duration-300 ease-in-out cursor-pointer
        ${isActive 
          ? 'bg-fuchsia-500/10 text-fuchsia-500 shadow-[0_0_15px_rgba(217,70,239,0.15)] border-l-2 border-fuchsia-500 pl-3.5' 
          : 'text-gray-700 hover:text-fuchsia-500 dark:text-gray-300 dark:hover:text-fuchsia-500 hover:shadow-[0_0_15px_rgba(217,70,239,0.2)] hover:-translate-y-px pl-4'
        }`}
    >
      {children}
    </a>
  );
};

const NavHeading = ({ children }) => (
  <h3 className="px-4 pt-3 pb-1 text-[10px] font-mono font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">
    {children}
  </h3>
);

export default function ProjectsSidebar({ isOpen, activeProject, onProjectChange, projects, activeTab, onTabChange }) {
  return (
    <ProjectsSidebarContext.Provider value={{ activeTab, onTabChange }}>
      <aside
        className={`fixed top-16 left-0 z-35 h-[calc(100vh-64px)] w-64 
                    bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md 
                    border-r border-neutral-200 dark:border-neutral-800 dark:border-neutral-800
                    transform transition-all duration-500 ease-in-out
                    ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="h-full px-3 py-4 overflow-y-auto flex flex-col justify-between">
          
          <div className="space-y-4">
            {/* Project Selector Header */}
            <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 dark:border-neutral-800/80 mb-2">
              <span className="text-[9px] font-mono font-black uppercase text-gray-400 dark:text-neutral-500 block mb-1">Active Project</span>
              <select
                value={activeProject.id}
                onChange={(e) => {
                  const selected = projects.find(p => p.id === e.target.value);
                  if (selected) onProjectChange(selected);
                }}
                className="w-full bg-gray-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-900 rounded-lg p-2 text-xs font-mono font-bold text-gray-800 dark:text-gray-200 focus:outline-none focus:border-fuchsia-500"
              >
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
            </div>
            
            {/* Section Links */}
            <nav className="space-y-3 font-mono">
              <div>
                <NavHeading>1. Architecture Overview</NavHeading>
                <ul className="space-y-0.5">
                  <li><NavItem href="#overview">Architecture Summary</NavItem></li>
                  <li><NavItem href="#patterns">OOP & Design Patterns</NavItem></li>
                  <li><NavItem href="#tech_stack">Technical Stack</NavItem></li>
                  <li><NavItem href="#folders">Folder Structures</NavItem></li>
                </ul>
              </div>
              
              <div>
                <NavHeading>2. Subsystem Deep Dives</NavHeading>
                <ul className="space-y-0.5">
                  <li><NavItem href="#frontend">Frontend (React)</NavItem></li>
                  <li><NavItem href="#backend">Backend (Spring Boot)</NavItem></li>
                </ul>
              </div>

              <div>
                <NavHeading>3. System Performance</NavHeading>
                <ul className="space-y-0.5">
                  <li><NavItem href="#tradeoffs">Design Trade-offs</NavItem></li>
                  <li><NavItem href="#qa">Interview Q&A</NavItem></li>
                </ul>
              </div>

              <div>
                <NavHeading>4. Interactive Tool</NavHeading>
                <ul className="space-y-0.5">
                  <li><NavItem href="#playground">🎮 Lifecycle Sandbox</NavItem></li>
                </ul>
              </div>
            </nav>
          </div>

          <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 dark:border-neutral-900 text-center font-mono text-[9px] text-gray-400">
            Google L5 System Review
          </div>

        </div>
      </aside>
    </ProjectsSidebarContext.Provider>
  );
}
