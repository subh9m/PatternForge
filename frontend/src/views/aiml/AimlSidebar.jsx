import React, { createContext, useContext } from 'react';

export const AimlSidebarContext = createContext({ activeTab: '', onTabChange: () => {} });

const NavItem = ({ href, children }) => {
  const { activeTab, onTabChange } = useContext(AimlSidebarContext);
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
          ? 'bg-indigo-500/10 text-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.15)] border-l-2 border-indigo-500 pl-3.5' 
          : 'text-gray-700 hover:text-indigo-500 dark:text-gray-300 dark:hover:text-indigo-500 hover:shadow-[0_0_15px_rgba(99,102,241,0.2)] hover:-translate-y-px pl-4'
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

export default function AimlSidebar({ isOpen, activeTab, onTabChange }) {
  return (
    <AimlSidebarContext.Provider value={{ activeTab, onTabChange }}>
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
            AI & ML SYSTEM
          </h2>
          
          <nav className="space-y-3 font-mono">
            <div>
              <NavHeading>1. Foundations</NavHeading>
              <ul className="space-y-0.5">
                <li><NavItem href="#aiml_fundamentals">AI.1 AI & ML Fundamentals</NavItem></li>
                <li><NavItem href="#core_terminology">AI.2 Core ML Terminology</NavItem></li>
              </ul>
            </div>
            
            <div>
              <NavHeading>2. Classical & Deep ML</NavHeading>
              <ul className="space-y-0.5">
                <li><NavItem href="#ml_basics">AI.3 Machine Learning Basics</NavItem></li>
                <li><NavItem href="#deep_learning">AI.4 Deep Learning Core</NavItem></li>
              </ul>
            </div>

            <div>
              <NavHeading>3. LLM Architectures</NavHeading>
              <ul className="space-y-0.5">
                <li><NavItem href="#llms_deep">AI.5 LLM Deep Dive</NavItem></li>
                <li><NavItem href="#embeddings_db">AI.6 Vector DBs & Embeddings</NavItem></li>
              </ul>
            </div>

            <div>
              <NavHeading>4. Retrieval & Systems</NavHeading>
              <ul className="space-y-0.5">
                <li><NavItem href="#rag_agents">AI.7 RAG & AI Agents</NavItem></li>
                <li><NavItem href="#system_deployment">AI.8 Deployment & Sys Design</NavItem></li>
              </ul>
            </div>

            <div>
              <NavHeading>5. Applications & Hardware</NavHeading>
              <ul className="space-y-0.5">
                <li><NavItem href="#nlp_vision_speech">AI.9 Vision, NLP & Speech</NavItem></li>
                <li><NavItem href="#applied_ethics">AI.10 Applied ML & Ethics</NavItem></li>
                <li><NavItem href="#infra_architecture">AI.11 Infrastructure & Design</NavItem></li>
              </ul>
            </div>

            <div>
              <NavHeading>6. Revision & Sandbox</NavHeading>
              <ul className="space-y-0.5">
                <li><NavItem href="#aiml_cheat_sheet">📋 Terminology Cheat Sheet</NavItem></li>
                <li><NavItem href="#aiml_playground">🎮 AI/ML Interactive Sandbox</NavItem></li>
              </ul>
            </div>
          </nav>
        </div>
      </aside>
    </AimlSidebarContext.Provider>
  );
}
