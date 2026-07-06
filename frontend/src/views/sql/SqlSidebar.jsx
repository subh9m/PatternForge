import React, { createContext, useContext } from 'react';

export const SqlSidebarContext = createContext({ activeTab: '', onTabChange: () => {} });

const NavItem = ({ href, children }) => {
  const { activeTab, onTabChange } = useContext(SqlSidebarContext);
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
          ? 'bg-red-500/10 text-red-500 shadow-[0_0_15px_rgba(255,0,0,0.15)] border-l-2 border-red-500 pl-3.5' 
          : 'text-gray-750 hover:text-red-500 dark:text-gray-300 dark:hover:text-red-500 hover:shadow-[0_0_15px_rgba(255,0,0,0.2)] hover:-translate-y-px pl-4'
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

export default function SqlSidebar({ isOpen, activeTab, onTabChange }) {
  return (
    <SqlSidebarContext.Provider value={{ activeTab, onTabChange }}>
      <aside
        className={`fixed top-16 left-0 z-35 h-[calc(100vh-64px)] w-64 
                    bg-white/80 dark:bg-black/80 backdrop-blur-md 
                    border-r border-gray-200 dark:border-[#333]
                    transform transition-all duration-500 ease-in-out
                    ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="h-full px-3 py-4 overflow-y-auto">
          {/* Title */}
          <h2 className="p-4 text-2xl font-medium uppercase tracking-wider 
                         text-gray-900 dark:text-white font-mono">
            SQL REFERENCE
          </h2>
          
          <nav className="mt-4 space-y-4 font-mono">
            <div>
              <NavHeading>A. PRACTICE DATABASE</NavHeading>
              <ul className="space-y-1">
                <li><NavItem href="#sql_practice_db">A.1 NorthPeak Schema</NavItem></li>
              </ul>
            </div>
            <div>
              <NavHeading>B. SQL COMMAND TYPES</NavHeading>
              <ul className="space-y-1">
                <li><NavItem href="#sql_ddl">B.1 DDL Commands</NavItem></li>
                <li><NavItem href="#sql_dml">B.2 DML Commands</NavItem></li>
                <li><NavItem href="#sql_dql">B.3 DQL Commands</NavItem></li>
                <li><NavItem href="#sql_dcl">B.4 DCL Commands</NavItem></li>
                <li><NavItem href="#sql_tcl">B.5 TCL Commands</NavItem></li>
              </ul>
            </div>
            <div>
              <NavHeading>C. PHASE 2: FILTER & SORT</NavHeading>
              <ul className="space-y-1">
                <li><NavItem href="#sql_topic1">C.1 SELECT / FROM / WHERE</NavItem></li>
                <li><NavItem href="#sql_topic2">C.2 Logical Operators</NavItem></li>
                <li><NavItem href="#sql_topic3">C.3 Patterns & Sorting</NavItem></li>
                <li><NavItem href="#sql_topic4">C.4 LIMIT & OFFSET</NavItem></li>
                <li><NavItem href="#sql_topic5">C.5 NULL Handling</NavItem></li>
                <li><NavItem href="#sql_topic6">C.6 SQL Execution Order</NavItem></li>
              </ul>
            </div>
            <div>
              <NavHeading>D. PHASE 3: GROUPS, JOINS & SETS</NavHeading>
              <ul className="space-y-1">
                <li><NavItem href="#sql_topic7">D.1 GROUP BY & HAVING</NavItem></li>
                <li><NavItem href="#sql_topic8">D.2 Join Operators</NavItem></li>
                <li><NavItem href="#sql_topic9">D.3 Self-Referential Joins</NavItem></li>
                <li><NavItem href="#sql_topic10">D.4 Set Operations</NavItem></li>
              </ul>
            </div>
            <div>
              <NavHeading>E. PHASE 4: SUBQUERIES & CTEs</NavHeading>
              <ul className="space-y-1">
                <li><NavItem href="#sql_topic11">E.1 Subqueries</NavItem></li>
                <li><NavItem href="#sql_topic12">E.2 Correlated Subqueries</NavItem></li>
                <li><NavItem href="#sql_topic13">E.3 EXISTS, IN, ANY, ALL</NavItem></li>
                <li><NavItem href="#sql_topic14">E.4 CTE Pipelines</NavItem></li>
                <li><NavItem href="#sql_topic15">E.5 Recursive CTEs</NavItem></li>
              </ul>
            </div>
            <div>
              <NavHeading>F. PHASE 5: WINDOWS & PIVOTING</NavHeading>
              <ul className="space-y-1">
                <li><NavItem href="#sql_topic16">F.1 Window Core</NavItem></li>
                <li><NavItem href="#sql_topic17">F.2 Ranking Functions</NavItem></li>
                <li><NavItem href="#sql_topic18">F.3 Positional Functions</NavItem></li>
                <li><NavItem href="#sql_topic19">F.4 Aggregate Frames</NavItem></li>
                <li><NavItem href="#sql_topic20">F.5 Pivoting & CASE</NavItem></li>
              </ul>
            </div>
          </nav>
        </div>
      </aside>
    </SqlSidebarContext.Provider>
  );
}
