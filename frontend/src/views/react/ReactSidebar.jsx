import React, { createContext, useContext } from 'react';

export const ReactSidebarContext = createContext({ activeTab: '', onTabChange: () => {} });

const NavItem = ({ href, children }) => {
  const { activeTab, onTabChange } = useContext(ReactSidebarContext);
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
          ? 'bg-sky-500/10 text-sky-500 shadow-[0_0_15px_rgba(14,165,233,0.15)] border-l-2 border-sky-500 pl-3.5' 
          : 'text-gray-700 hover:text-sky-500 dark:text-gray-300 dark:hover:text-sky-500 hover:shadow-[0_0_15px_rgba(14,165,233,0.2)] hover:-translate-y-px pl-4'
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

export default function ReactSidebar({ isOpen, activeTab, onTabChange }) {
  return (
    <ReactSidebarContext.Provider value={{ activeTab, onTabChange }}>
      <aside
        className={`fixed top-16 left-0 z-35 h-[calc(100vh-64px)] w-64 
                    bg-white/80 dark:bg-black/80 backdrop-blur-md 
                    border-r border-gray-200 dark:border-[#333]
                    transform transition-all duration-500 ease-in-out
                    ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="h-full px-3 py-4 overflow-y-auto">
          <h2 className="p-4 text-xl font-bold uppercase tracking-wider 
                         text-gray-900 dark:text-white font-mono border-b border-gray-200 dark:border-neutral-800/80 mb-2">
            REACT CORE
          </h2>
          
          <nav className="space-y-3 font-mono">
            <div>
              <NavHeading>1. Core Architecture</NavHeading>
              <ul className="space-y-0.5">
                <li><NavItem href="#react_fundamentals">RE.1 Fundamentals</NavItem></li>
                <li><NavItem href="#react_state">RE.2 Hooks & State Lifecycle</NavItem></li>
              </ul>
            </div>
            
            <div>
              <NavHeading>2. Optimization & Tuning</NavHeading>
              <ul className="space-y-0.5">
                <li><NavItem href="#react_perf">RE.3 Performance Hooks</NavItem></li>
              </ul>
            </div>

            <div>
              <NavHeading>3. Advanced Layout patterns</NavHeading>
              <ul className="space-y-0.5">
                <li><NavItem href="#react_advanced">RE.4 Advanced Architecture</NavItem></li>
              </ul>
            </div>

            <div>
              <NavHeading>4. Reference & Sandbox</NavHeading>
              <ul className="space-y-0.5">
                <li><NavItem href="#react_cheat_sheet">📋 Key Hooks Reference</NavItem></li>
                <li><NavItem href="#react_playground">🎮 Virtual DOM Sandbox</NavItem></li>
              </ul>
            </div>
          </nav>
        </div>
      </aside>
    </ReactSidebarContext.Provider>
  );
}
