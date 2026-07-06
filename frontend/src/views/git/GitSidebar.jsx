import React, { createContext, useContext } from 'react';

export const GitSidebarContext = createContext({ activeTab: '', onTabChange: () => {} });

const NavItem = ({ href, children }) => {
  const { activeTab, onTabChange } = useContext(GitSidebarContext);
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
  <h3 className="px-4 pt-3 pb-1 text-[10px] font-mono font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">
    {children}
  </h3>
);

export default function GitSidebar({ isOpen, activeTab, onTabChange }) {
  return (
    <GitSidebarContext.Provider value={{ activeTab, onTabChange }}>
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
            GIT & GITHUB
          </h2>
          
          <nav className="space-y-3 font-mono">
            <div>
              <NavHeading>1. Intro & Concepts</NavHeading>
              <ul className="space-y-0.5">
                <li><NavItem href="#git_basics_vcs">GIT.1 Git vs GitHub</NavItem></li>
                <li><NavItem href="#git_architecture_model">GIT.2 Git Architecture</NavItem></li>
              </ul>
            </div>
            
            <div>
              <NavHeading>2. Getting Started</NavHeading>
              <ul className="space-y-0.5">
                <li><NavItem href="#git_setup_init">GIT.3 Setup & Init</NavItem></li>
                <li><NavItem href="#git_tracking_changes">GIT.4 Tracking Changes</NavItem></li>
                <li><NavItem href="#git_history_inspection">GIT.5 History & Logs</NavItem></li>
              </ul>
            </div>

            <div>
              <NavHeading>3. Git Operations</NavHeading>
              <ul className="space-y-0.5">
                <li><NavItem href="#git_branching_navigation">GIT.6 Branch Navigation</NavItem></li>
                <li><NavItem href="#git_integrating_changes">GIT.7 Integrating Code</NavItem></li>
                <li><NavItem href="#git_remote_sync">GIT.8 Remote Sync</NavItem></li>
              </ul>
            </div>

            <div>
              <NavHeading>4. Workflows & Strategies</NavHeading>
              <ul className="space-y-0.5">
                <li><NavItem href="#git_branching_strategies">GIT.9 Git Workflows</NavItem></li>
                <li><NavItem href="#git_merge_vs_rebase_deep">GIT.10 Merge vs Rebase</NavItem></li>
                <li><NavItem href="#git_resolving_conflicts">GIT.11 Resolving Conflicts</NavItem></li>
                <li><NavItem href="#git_pr_workflow_ssh">GIT.12 PRs, SSH vs HTTPS</NavItem></li>
              </ul>
            </div>

            <div>
              <NavHeading>5. Recovery & Resources</NavHeading>
              <ul className="space-y-0.5">
                <li><NavItem href="#git_undo_operations">GIT.13 Undo Operations</NavItem></li>
                <li><NavItem href="#git_interview_qa_best">GIT.14 Q&As & Practice</NavItem></li>
              </ul>
            </div>
          </nav>
        </div>
      </aside>
    </GitSidebarContext.Provider>
  );
}
