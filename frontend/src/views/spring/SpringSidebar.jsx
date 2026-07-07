import React, { createContext, useContext } from 'react';

export const SpringSidebarContext = createContext({ activeTab: '', onTabChange: () => {} });

const NavItem = ({ href, children }) => {
  const { activeTab, onTabChange } = useContext(SpringSidebarContext);
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
          ? 'bg-green-500/10 text-green-500 shadow-[0_0_15px_rgba(34,197,94,0.15)] border-l-2 border-green-500 pl-3.5' 
          : 'text-gray-700 hover:text-green-500 dark:text-gray-300 dark:hover:text-green-500 hover:shadow-[0_0_15px_rgba(34,197,94,0.2)] hover:-translate-y-px pl-4'
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

export default function SpringSidebar({ isOpen, activeTab, onTabChange }) {
  return (
    <SpringSidebarContext.Provider value={{ activeTab, onTabChange }}>
      <aside
        className={`fixed top-16 left-0 z-35 h-[calc(100vh-64px)] w-64 
                    bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md 
                    border-r border-neutral-200 dark:border-neutral-800 dark:border-neutral-800
                    transform transition-all duration-500 ease-in-out
                    ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="h-full px-3 py-4 overflow-y-auto">
          <h2 className="p-4 text-xl font-bold uppercase tracking-wider 
                         text-gray-900 dark:text-white font-mono border-b border-neutral-200 dark:border-neutral-800 dark:border-neutral-800/80 mb-2">
            SPRING BOOT
          </h2>
          
          <nav className="space-y-3 font-mono">
            <div>
              <NavHeading>1. Spring Core Framework</NavHeading>
              <ul className="space-y-0.5">
                <li><NavItem href="#spring_core">SP.1 Core, IoC & Beans</NavItem></li>
                <li><NavItem href="#spring_lifecycle">SP.2 Lifecycle & Scopes</NavItem></li>
              </ul>
            </div>
            
            <div>
              <NavHeading>2. Web & MVC Layers</NavHeading>
              <ul className="space-y-0.5">
                <li><NavItem href="#spring_mvc">SP.3 MVC & Web Layer</NavItem></li>
              </ul>
            </div>

            <div>
              <NavHeading>3. Spring Boot Engine</NavHeading>
              <ul className="space-y-0.5">
                <li><NavItem href="#spring_boot">SP.4 Boot & Configurations</NavItem></li>
              </ul>
            </div>

            <div>
              <NavHeading>4. Persistence & JPA</NavHeading>
              <ul className="space-y-0.5">
                <li><NavItem href="#spring_data">SP.5 Database Layer & JPA</NavItem></li>
              </ul>
            </div>

            <div>
              <NavHeading>5. Testing & Advanced AOP</NavHeading>
              <ul className="space-y-0.5">
                <li><NavItem href="#spring_testing">SP.6 Testing & Mocks</NavItem></li>
                <li><NavItem href="#spring_aop">SP.7 AOP & Systems Layer</NavItem></li>
              </ul>
            </div>

            <div>
              <NavHeading>6. Glossary & Sandbox</NavHeading>
              <ul className="space-y-0.5">
                <li><NavItem href="#spring_cheat_sheet">📋 Key Annotations Reference</NavItem></li>
                <li><NavItem href="#spring_playground">🎮 Spring Container Sandbox</NavItem></li>
              </ul>
            </div>
          </nav>
        </div>
      </aside>
    </SpringSidebarContext.Provider>
  );
}
