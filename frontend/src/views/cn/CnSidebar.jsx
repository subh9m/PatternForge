import React, { createContext, useContext } from 'react';

export const CnSidebarContext = createContext({ activeTab: '', onTabChange: () => {} });

const NavItem = ({ href, children }) => {
  const { activeTab, onTabChange } = useContext(CnSidebarContext);
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
          ? 'bg-cyan-500/10 text-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.15)] border-l-2 border-cyan-500 pl-3.5' 
          : 'text-gray-700 hover:text-cyan-500 dark:text-gray-300 dark:hover:text-cyan-500 hover:shadow-[0_0_15px_rgba(6,182,212,0.2)] hover:-translate-y-px pl-4'
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

export default function CnSidebar({ isOpen, activeTab, onTabChange }) {
  return (
    <CnSidebarContext.Provider value={{ activeTab, onTabChange }}>
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
            CN INTERVIEWS
          </h2>
          
          <nav className="space-y-3 font-mono">
            <div>
              <NavHeading>1. Architecture & Topologies</NavHeading>
              <ul className="space-y-0.5">
                <li><NavItem href="#cn_fundamentals">CN.1 Classifications & Topologies</NavItem></li>
              </ul>
            </div>
            
            <div>
              <NavHeading>2. IP & Routing Layer</NavHeading>
              <ul className="space-y-0.5">
                <li><NavItem href="#ip_addressing">CN.2 IP & Subnetting</NavItem></li>
              </ul>
            </div>

            <div>
              <NavHeading>3. Reference Models</NavHeading>
              <ul className="space-y-0.5">
                <li><NavItem href="#osi_tcpip">CN.3 Layer Models</NavItem></li>
              </ul>
            </div>

            <div>
              <NavHeading>4. Protocols & Endpoints</NavHeading>
              <ul className="space-y-0.5">
                <li><NavItem href="#protocols_ports">CN.4 Protocols & Ports</NavItem></li>
              </ul>
            </div>

            <div>
              <NavHeading>5. Diagnostic & Security</NavHeading>
              <ul className="space-y-0.5">
                <li><NavItem href="#routing_delivery">CN.5 Data Transmission</NavItem></li>
              </ul>
            </div>

            <div>
              <NavHeading>6. Glossary & Sandbox</NavHeading>
              <ul className="space-y-0.5">
                <li><NavItem href="#cn_cheat_sheet">📋 Protocols Cheat Sheet</NavItem></li>
                <li><NavItem href="#cn_playground">🎮 CN Interactive Sandbox</NavItem></li>
              </ul>
            </div>
          </nav>
        </div>
      </aside>
    </CnSidebarContext.Provider>
  );
}
