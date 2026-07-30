import React, { createContext, useContext } from 'react';

export const OsSidebarContext = createContext({ activeTab: '', onTabChange: () => {} });

const NavItem = ({ href, children }) => {
  const { activeTab, onTabChange } = useContext(OsSidebarContext);
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
          ? 'bg-amber-500/10 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.15)] border-l-2 border-amber-500 pl-3.5' 
          : 'text-gray-700 hover:text-amber-500 dark:text-gray-300 dark:hover:text-amber-500 hover:shadow-[0_0_15px_rgba(245,158,11,0.2)] hover:-translate-y-px pl-4'
        }`}
    >
      {children}
    </a>
  );
};

const NavHeading = ({ children }) => (
  <h3 className="px-4 pt-4 pb-2 text-sm font-mono uppercase tracking-widest text-gray-500 dark:text-gray-500">
    {children}
  </h3>
);

export default function OsSidebar({ isOpen, activeTab, onTabChange }) {
  return (
    <OsSidebarContext.Provider value={{ activeTab, onTabChange }}>
      <aside
        className={`fixed top-16 left-0 z-35 h-[calc(100vh-64px)] w-64 
                    bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md 
                    border-r border-neutral-200 dark:border-neutral-800 dark:border-neutral-800
                    transform transition-all duration-500 ease-in-out
                    ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="h-full px-3 py-4 overflow-y-auto">
          <h2 className="p-4 text-2xl font-medium uppercase tracking-wider 
                         text-gray-900 dark:text-white font-mono">
            OS REVISION
          </h2>
          
          <nav className="mt-4 space-y-4 font-mono">
            <div>
              <NavHeading>1. OS Architectures</NavHeading>
              <ul className="space-y-1">
                <li><NavItem href="#os_basics_arch">OS.1 Basics & Arch</NavItem></li>
              </ul>
            </div>
            <div>
              <NavHeading>2. Processes & Threads</NavHeading>
              <ul className="space-y-1">
                <li><NavItem href="#os_process_threads">OS.2 Process & Threads</NavItem></li>
              </ul>
            </div>
            <div>
              <NavHeading>3. CPU Schedulers</NavHeading>
              <ul className="space-y-1">
                <li><NavItem href="#os_cpu_scheduling">OS.3 CPU Scheduling</NavItem></li>
              </ul>
            </div>
            <div>
              <NavHeading>4. Virtual Memory</NavHeading>
              <ul className="space-y-1">
                <li><NavItem href="#os_memory_paging">OS.4 Memory & Paging</NavItem></li>
              </ul>
            </div>
            <div>
              <NavHeading>5. Locks & Deadlocks</NavHeading>
              <ul className="space-y-1">
                <li><NavItem href="#os_sync_deadlocks">OS.5 Sync & Deadlocks</NavItem></li>
              </ul>
            </div>
            <div>
              <NavHeading>6. Files & Devices</NavHeading>
              <ul className="space-y-1">
                <li><NavItem href="#os_storage_files">OS.6 Storage & FS</NavItem></li>
              </ul>
            </div>
            <div>
              <NavHeading>7. Practice Numericals</NavHeading>
              <ul className="space-y-1">
                <li><NavItem href="#os_numerical_problems">OS.7 Solved Calculations</NavItem></li>
              </ul>
            </div>
          </nav>
        </div>
      </aside>
    </OsSidebarContext.Provider>
  );
}
