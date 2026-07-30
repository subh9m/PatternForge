import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Braces, Code, Play } from 'lucide-react';

// Single-pass regex syntax highlighter
function highlightCode(code) {
  if (!code) return '';
  
  // Escape HTML characters
  let escaped = code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Combined regex matching comments, strings, numbers, keywords, and types in one pass
  const combinedRegex = /(\/\/.*|--.*|\/\*[\s\S]*?\*\/)|("[^"]*"|'[^']*')|\b(\d+)\b|\b(class|template|typename|struct|public|private|protected|void|int|const|return|new|delete|import|package|static|final|transient|synchronized|extends|instanceof|true|false|null|boolean|char|double|float|long|short|byte|super|this|interface|namespace|std|auto|using|include|define)\b|\b(vector|string|list|deque|stack|queue|priority_queue|set|multiset|map|multimap|unordered_set|unordered_multiset|unordered_map|unordered_multimap|pair|ArrayList|LinkedList|Vector|Stack|Queue|Deque|PriorityQueue|HashSet|LinkedHashSet|TreeSet|HashMap|LinkedHashMap|TreeMap|Hashtable|StringBuilder|StringBuffer|Object|Integer|String|greater|CustomCompare)\b/g;

  escaped = escaped.replace(combinedRegex, (match, comment, string, number, keyword, type) => {
    if (comment) return `<span class="text-slate-500 italic">${match}</span>`;
    if (string) return `<span class="text-amber-600 dark:text-emerald-400 font-medium">${match}</span>`;
    if (number) return `<span class="text-purple-600 dark:text-violet-400">${match}</span>`;
    if (keyword) return `<span class="text-blue-600 dark:text-sky-400 font-bold">${match}</span>`;
    if (type) return `<span class="text-cyan-600 dark:text-teal-400 font-semibold">${match}</span>`;
    return match;
  });

  return escaped;
}

export default function DataStructureCard({ data }) {
  const [showDeclaration, setShowDeclaration] = useState(false);
  const [showInternal, setShowInternal] = useState(false);


  return (
    <section 
      id={data.id}
      className="bg-white/80 dark:bg-neutral-950/70 backdrop-blur-md 
                 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 
                 rounded-2xl overflow-hidden shadow-lg
                 hover:shadow-[0_0_25px_rgba(255,59,48,0.2)] hover:-translate-y-0.5
                 transition-all duration-500 ease-in-out mb-10"
    >
      {/* Card Header */}
      <div className="p-6 md:p-8 border-b border-neutral-200 dark:border-neutral-800 dark:border-neutral-800">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white flex items-center">
            <span className="font-mono text-red-500 mr-3">{data.num}</span>
            <span className="font-heading tracking-wide">{data.title}</span>
          </h2>
        </div>
        <p className="mt-2.5 text-gray-700 dark:text-neutral-300 font-normal text-base max-w-4xl leading-relaxed">
          {data.desc}
        </p>
      </div>

      {/* Grid for Code Actions */}
      <div className="p-6 md:p-8 bg-gray-50/30 dark:bg-neutral-950/20 border-b border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 grid grid-cols-1 gap-6">
        {/* Declaration Section Accordion */}
        {data.declaration && (
          <div>
            <button
              onClick={() => setShowDeclaration(!showDeclaration)}
              className="w-full flex items-center justify-between p-3.5 bg-gray-100/60 dark:bg-neutral-950/60 hover:bg-gray-200/50 dark:hover:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 transition-smooth font-mono text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 cursor-pointer"
            >
              <div className="flex items-center space-x-2">
                <Code className="h-4 w-4 text-red-500" />
                <span>Declaration & Initialization</span>
              </div>
              <div>
                {showDeclaration ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </div>
            </button>
            
            {showDeclaration && (
              <div className="border-x border-b border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 bg-gray-50/40 dark:bg-neutral-950/40 p-4">
                <pre 
                  className="bg-white/80 dark:bg-neutral-900/80 text-neutral-800 dark:text-neutral-300 p-4 font-mono text-xs overflow-x-auto border border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 leading-relaxed select-all"
                  dangerouslySetInnerHTML={{ __html: highlightCode(data.declaration) }}
                />
              </div>
            )}
          </div>
        )}

        {/* Internal Implementation Accordion */}
        {data.internalImplementation && (
          <div>
            <button
              onClick={() => setShowInternal(!showInternal)}
              className="w-full flex items-center justify-between p-3.5 bg-gray-100/60 dark:bg-neutral-950/60 hover:bg-gray-200/50 dark:hover:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 transition-smooth font-mono text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 cursor-pointer"
            >
              <div className="flex items-center space-x-2">
                <Braces className="h-4 w-4 text-red-500" />
                <span>Internal Structure & Implementation</span>
              </div>
              <div>
                {showInternal ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </div>
            </button>
            
            {showInternal && (
              data.id === 'sql_practice_db' ? (
                <div className="border-x border-b border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 bg-gray-50/40 dark:bg-neutral-950/40 p-6 md:p-8 space-y-8">
                  {/* ER Diagram Section */}
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 font-mono">Entity-Relationship (ER) Diagram</h4>
                    <div className="bg-black/20 dark:bg-black/60 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 rounded-xl p-4 flex justify-center">
                      <img 
                        src="/northpeak_er_diagram.png" 
                        alt="NorthPeak Corp ER Diagram" 
                        className="max-w-full h-auto rounded-lg shadow-md border border-neutral-200 dark:border-neutral-800 dark:border-neutral-800"
                      />
                    </div>
                  </div>
                  
                  {/* Seed Data Tables Section */}
                  <div className="space-y-6">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider font-mono">Seed Data Entries Reference</h4>
                      <button
                        onClick={() => setShowFullScriptModal(true)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-[10px] font-black uppercase rounded-lg tracking-wider transition-all duration-300 hover:shadow-[0_0_12px_rgba(16,185,129,0.3)] cursor-pointer"
                      >
                        Get Full Setup SQL Script
                      </button>
                    </div>
                    
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-light leading-relaxed">
                      Below are interactive snippets of the tables. <strong className="text-red-500 font-bold">Click on the table headers</strong> to view and search the full table dataset.
                    </p>

                    {/* 1. Departments Table Hook */}
                    <div className="border border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 rounded-xl overflow-hidden bg-white/80 dark:bg-neutral-950/30">
                      <button
                        onClick={() => setActiveFullTable('departments')}
                        className="w-full px-4 py-2.5 bg-white/50 dark:bg-neutral-950/50 hover:bg-red-500/5 dark:hover:bg-red-500/5 border-b border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 flex justify-between items-center transition-colors font-mono cursor-pointer"
                      >
                        <span className="text-xs font-black text-neutral-800 dark:text-neutral-200 flex items-center">
                          <span className="h-2 w-2 rounded-full bg-red-500 mr-2 animate-pulse" />
                          TABLE: DEPARTMENTS (Click to open full table)
                        </span>
                        <span className="text-[10px] text-gray-400 font-bold">PK: dept_id · 8 rows</span>
                      </button>
                      <div className="overflow-x-auto text-[11px] font-mono">
                        <table className="w-full text-left">
                          <thead className="bg-gray-150/30 dark:bg-neutral-900/30 border-b border-neutral-200 dark:border-neutral-800 dark:border-neutral-800">
                            <tr>
                              <th className="px-4 py-2 font-bold text-gray-500">dept_id (PK)</th>
                              <th className="px-4 py-2 font-bold text-gray-500">dept_name</th>
                              <th className="px-4 py-2 font-bold text-gray-500">location</th>
                              <th className="px-4 py-2 font-bold text-gray-500">budget</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 dark:divide-[#333] text-neutral-700 dark:text-neutral-300">
                            {departmentsData.slice(0, 4).map((row, i) => (
                              <tr key={i}>
                                <td className="px-4 py-2">{row.dept_id}</td>
                                <td className="px-4 py-2 font-bold">{row.dept_name}</td>
                                <td className="px-4 py-2">{row.location}</td>
                                <td className="px-4 py-2 text-emerald-500">{row.budget ? row.budget.toLocaleString() : "NULL"}</td>
                              </tr>
                            ))}
                            <tr className="bg-gray-50/20 dark:bg-neutral-900/10">
                              <td colSpan="4" className="text-center px-4 py-1.5 text-[10px] text-red-500 font-semibold uppercase tracking-wider">
                                + 4 more rows (Click table header to view all)
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* 2. Employees Table Hook */}
                    <div className="border border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 rounded-xl overflow-hidden bg-white/80 dark:bg-neutral-950/30">
                      <button
                        onClick={() => setActiveFullTable('employees')}
                        className="w-full px-4 py-2.5 bg-white/50 dark:bg-neutral-950/50 hover:bg-red-500/5 dark:hover:bg-red-500/5 border-b border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 flex justify-between items-center transition-colors font-mono cursor-pointer"
                      >
                        <span className="text-xs font-black text-neutral-800 dark:text-neutral-200 flex items-center">
                          <span className="h-2 w-2 rounded-full bg-red-500 mr-2 animate-pulse" />
                          TABLE: EMPLOYEES (Click to open full table)
                        </span>
                        <span className="text-[10px] text-gray-400 font-bold">PK: emp_id · 40 rows</span>
                      </button>
                      <div className="overflow-x-auto text-[11px] font-mono">
                        <table className="w-full text-left">
                          <thead className="bg-gray-150/30 dark:bg-neutral-900/30 border-b border-neutral-200 dark:border-neutral-800 dark:border-neutral-800">
                            <tr>
                              <th className="px-4 py-2 font-bold text-gray-500">emp_id</th>
                              <th className="px-4 py-2 font-bold text-gray-500">name</th>
                              <th className="px-4 py-2 font-bold text-gray-500">email</th>
                              <th className="px-4 py-2 font-bold text-gray-500">dept_id</th>
                              <th className="px-4 py-2 font-bold text-gray-500">job_title</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 dark:divide-[#333] text-neutral-700 dark:text-neutral-300">
                            {employeesData.slice(0, 4).map((row, i) => (
                              <tr key={i}>
                                <td className="px-4 py-2">{row.emp_id}</td>
                                <td className="px-4 py-2 font-bold">{row.first_name} {row.last_name}</td>
                                <td className="px-4 py-2">{row.email || <span className="text-red-400 font-bold">NULL</span>}</td>
                                <td className="px-4 py-2">{row.dept_id || <span className="text-red-400 font-bold">NULL</span>}</td>
                                <td className="px-4 py-2">{row.job_title}</td>
                              </tr>
                            ))}
                            <tr className="bg-gray-50/20 dark:bg-neutral-900/10">
                              <td colSpan="5" className="text-center px-4 py-1.5 text-[10px] text-red-500 font-semibold uppercase tracking-wider">
                                + 36 more rows (Click table header to view all)
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* 3. Salaries Table Hook */}
                    <div className="border border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 rounded-xl overflow-hidden bg-white/80 dark:bg-neutral-950/30">
                      <button
                        onClick={() => setActiveFullTable('salaries')}
                        className="w-full px-4 py-2.5 bg-white/50 dark:bg-neutral-950/50 hover:bg-red-500/5 dark:hover:bg-red-500/5 border-b border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 flex justify-between items-center transition-colors font-mono cursor-pointer"
                      >
                        <span className="text-xs font-black text-neutral-800 dark:text-neutral-200 flex items-center">
                          <span className="h-2 w-2 rounded-full bg-red-500 mr-2 animate-pulse" />
                          TABLE: SALARIES (Click to open full table)
                        </span>
                        <span className="text-[10px] text-gray-400 font-bold">PK: salary_id · 48 rows</span>
                      </button>
                      <div className="overflow-x-auto text-[11px] font-mono">
                        <table className="w-full text-left">
                          <thead className="bg-gray-150/30 dark:bg-neutral-900/30 border-b border-neutral-200 dark:border-neutral-800 dark:border-neutral-800">
                            <tr>
                              <th className="px-4 py-2 font-bold text-gray-500">salary_id</th>
                              <th className="px-4 py-2 font-bold text-gray-500">emp_id</th>
                              <th className="px-4 py-2 font-bold text-gray-500">amount</th>
                              <th className="px-4 py-2 font-bold text-gray-500">effective_date</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 dark:divide-[#333] text-neutral-700 dark:text-neutral-300">
                            {salariesData.slice(0, 4).map((row, i) => (
                              <tr key={i}>
                                <td className="px-4 py-2">{row.salary_id}</td>
                                <td className="px-4 py-2">{row.emp_id}</td>
                                <td className="px-4 py-2 text-emerald-500 font-semibold">{row.amount.toLocaleString()}</td>
                                <td className="px-4 py-2">{row.effective_date}</td>
                              </tr>
                            ))}
                            <tr className="bg-gray-50/20 dark:bg-neutral-900/10">
                              <td colSpan="4" className="text-center px-4 py-1.5 text-[10px] text-red-500 font-semibold uppercase tracking-wider">
                                + 44 more rows (Click table header to view all)
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* 4. Projects Table Hook */}
                    <div className="border border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 rounded-xl overflow-hidden bg-white/80 dark:bg-neutral-950/30">
                      <button
                        onClick={() => setActiveFullTable('projects')}
                        className="w-full px-4 py-2.5 bg-white/50 dark:bg-neutral-950/50 hover:bg-red-500/5 dark:hover:bg-red-500/5 border-b border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 flex justify-between items-center transition-colors font-mono cursor-pointer"
                      >
                        <span className="text-xs font-black text-neutral-800 dark:text-neutral-200 flex items-center">
                          <span className="h-2 w-2 rounded-full bg-red-500 mr-2 animate-pulse" />
                          TABLE: PROJECTS (Click to open full table)
                        </span>
                        <span className="text-[10px] text-gray-400 font-bold">PK: project_id · 12 rows</span>
                      </button>
                      <div className="overflow-x-auto text-[11px] font-mono">
                        <table className="w-full text-left">
                          <thead className="bg-gray-150/30 dark:bg-neutral-900/30 border-b border-neutral-200 dark:border-neutral-800 dark:border-neutral-800">
                            <tr>
                              <th className="px-4 py-2 font-bold text-gray-500">project_id</th>
                              <th className="px-4 py-2 font-bold text-gray-500">project_name</th>
                              <th className="px-4 py-2 font-bold text-gray-500">status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 dark:divide-[#333] text-neutral-700 dark:text-neutral-300">
                            {projectsData.slice(0, 4).map((row, i) => (
                              <tr key={i}>
                                <td className="px-4 py-2">{row.project_id}</td>
                                <td className="px-4 py-2 font-bold">{row.project_name}</td>
                                <td className="px-4 py-2">{row.status}</td>
                              </tr>
                            ))}
                            <tr className="bg-gray-50/20 dark:bg-neutral-900/10">
                              <td colSpan="3" className="text-center px-4 py-1.5 text-[10px] text-red-500 font-semibold uppercase tracking-wider">
                                + 8 more rows (Click table header to view all)
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* 5. Employee Projects Table Hook */}
                    <div className="border border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 rounded-xl overflow-hidden bg-white/80 dark:bg-neutral-950/30">
                      <button
                        onClick={() => setActiveFullTable('employee_projects')}
                        className="w-full px-4 py-2.5 bg-white/50 dark:bg-neutral-950/50 hover:bg-red-500/5 dark:hover:bg-red-500/5 border-b border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 flex justify-between items-center transition-colors font-mono cursor-pointer"
                      >
                        <span className="text-xs font-black text-neutral-800 dark:text-neutral-200 flex items-center">
                          <span className="h-2 w-2 rounded-full bg-red-500 mr-2 animate-pulse" />
                          TABLE: EMPLOYEE_PROJECTS (Click to open full table)
                        </span>
                        <span className="text-[10px] text-gray-400 font-bold">Bridge Table · 25 rows</span>
                      </button>
                      <div className="overflow-x-auto text-[11px] font-mono">
                        <table className="w-full text-left">
                          <thead className="bg-gray-150/30 dark:bg-neutral-900/30 border-b border-neutral-200 dark:border-neutral-800 dark:border-neutral-800">
                            <tr>
                              <th className="px-4 py-2 font-bold text-gray-500">emp_id</th>
                              <th className="px-4 py-2 font-bold text-gray-500">project_id</th>
                              <th className="px-4 py-2 font-bold text-gray-500">role</th>
                              <th className="px-4 py-2 font-bold text-gray-500">hours_logged</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 dark:divide-[#333] text-neutral-700 dark:text-neutral-300">
                            {employeeProjectsData.slice(0, 4).map((row, i) => (
                              <tr key={i}>
                                <td className="px-4 py-2">{row.emp_id}</td>
                                <td className="px-4 py-2">{row.project_id}</td>
                                <td className="px-4 py-2 font-bold">{row.role}</td>
                                <td className="px-4 py-2 text-indigo-500">{row.hours_logged} hrs</td>
                              </tr>
                            ))}
                            <tr className="bg-gray-50/20 dark:bg-neutral-900/10">
                              <td colSpan="4" className="text-center px-4 py-1.5 text-[10px] text-red-500 font-semibold uppercase tracking-wider">
                                + 21 more rows (Click table header to view all)
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="border-x border-b border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 bg-gray-50/40 dark:bg-neutral-950/40 p-4">
                  <pre 
                    className="bg-white/80 dark:bg-neutral-900/80 text-neutral-800 dark:text-neutral-300 p-4 font-mono text-xs overflow-x-auto border border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 leading-relaxed max-h-[400px] select-all"
                    dangerouslySetInnerHTML={{ __html: highlightCode(data.internalImplementation) }}
                  />
                </div>
              )
            )}
          </div>
        )}
      </div>

      {/* Interactive Query Playground */}
      {data.queries && data.queries.length > 0 && (
        <div className="p-6 md:p-8 bg-gray-50/20 dark:bg-neutral-950/10 border-b border-neutral-200 dark:border-neutral-800 dark:border-neutral-800">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center font-mono uppercase tracking-wider">
            <Play className="h-4 w-4 text-emerald-500 mr-2" />
            Interactive Query Playground
          </h3>
          
          {/* Query Selector */}
          {data.queries.length > 1 && (
            <div className="mb-4">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5 font-mono">Select Query Pattern:</label>
              <select 
                value={selectedQueryIdx}
                onChange={(e) => {
                  setSelectedQueryIdx(parseInt(e.target.value));
                  setExecuted(false);
                }}
                className="w-full bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 text-gray-800 dark:text-gray-200 text-xs font-mono px-3 py-2 rounded-lg focus:outline-none focus:border-red-500"
              >
                {data.queries.map((q, idx) => (
                  <option key={idx} value={idx}>Query {idx + 1}: {q.sql.split('\n')[0].replace('-- ', '')}</option>
                ))}
              </select>
            </div>
          )}
          
          {/* Query Display Block */}
          <div className="relative mb-4">
            <pre className="bg-white/90 dark:bg-neutral-900/90 text-neutral-800 dark:text-neutral-300 p-4 font-mono text-xs overflow-x-auto border border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 select-all leading-relaxed rounded-xl pr-28">
              <code dangerouslySetInnerHTML={{ __html: highlightCode(data.queries[selectedQueryIdx].sql) }} />
            </pre>
            <button
              onClick={handleRunQuery}
              className="absolute right-3 top-3 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-[10px] font-extrabold uppercase rounded-md tracking-wider flex items-center space-x-1 cursor-pointer transition-all duration-300 hover:shadow-[0_0_15px_rgba(16,185,129,0.4)]"
            >
              <Play className="h-3 w-3 fill-current" />
              <span>Run Query</span>
            </button>
          </div>
          
          {/* Output Results Pane */}
          {executed && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 transition-all duration-500 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2 mb-3">
                <span className="text-[10px] font-black text-emerald-500 font-mono tracking-wider">QUERY EXECUTION SUCCESSFUL</span>
                <span className="text-[9px] text-slate-400 font-mono">Time: 0.08ms | Rows: {data.queries[selectedQueryIdx].rows.length}</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono text-neutral-800 dark:text-neutral-300">
                  <thead>
                    <tr className="border-b border-neutral-200 dark:border-neutral-800 dark:border-neutral-800">
                      {data.queries[selectedQueryIdx].columns.map((col) => (
                        <th key={col} className="pb-2 font-bold text-gray-500 dark:text-gray-400">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.queries[selectedQueryIdx].rows.length === 0 ? (
                      <tr>
                        <td colSpan={data.queries[selectedQueryIdx].columns.length} className="py-4 text-center text-slate-400 italic">
                          Empty set (0 rows returned)
                        </td>
                      </tr>
                    ) : (
                      data.queries[selectedQueryIdx].rows.map((row, i) => (
                        <tr key={i} className="border-b border-gray-100/50 dark:border-neutral-900/50 last:border-0 hover:bg-emerald-500/5">
                          {row.map((cell, j) => (
                            <td key={j} className="py-1.5 pr-4 text-gray-800 dark:text-gray-300">
                              {cell === null ? (
                                <span className="text-red-400 font-bold text-[10px] bg-red-400/5 px-1 py-0.5 rounded-sm">NULL</span>
                              ) : (
                                cell
                              )}
                            </td>
                          ))}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Member Functions Table */}
      {data.methods && data.methods.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1024px] text-left text-sm">
            <thead className="bg-gray-50/70 dark:bg-neutral-950/70 border-b border-neutral-200 dark:border-neutral-800 dark:border-neutral-800">
              <tr>
                {['Method', 'Syntax', 'Input / Parameters', 'Output / Return', 'Time Complexity', 'Description'].map((header) => (
                  <th 
                    key={header} 
                    scope="col" 
                    className="px-6 py-4 font-bold text-gray-600 dark:text-gray-300 font-mono uppercase tracking-wider text-xs"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-[#333]">
              {data.methods.map((row, index) => (
                <tr key={index} className="hover:bg-white/50 dark:hover:bg-neutral-900/50 transition-colors duration-200">
                  {/* Method */}
                  <td className="px-6 py-4 font-mono font-bold text-red-600 dark:text-red-500 whitespace-nowrap">
                    {row.method}
                  </td>
                  {/* Syntax */}
                  <td className="px-6 py-4 font-mono text-neutral-800 dark:text-neutral-300 whitespace-nowrap">
                    <code>{row.syntax}</code>
                  </td>
                  {/* Params */}
                  <td className="px-6 py-4 text-gray-700 dark:text-neutral-300 font-normal whitespace-nowrap text-[13px] md:text-sm">
                    {row.params}
                  </td>
                  {/* Output */}
                  <td className="px-6 py-4 font-mono text-neutral-800 dark:text-neutral-300 whitespace-nowrap">
                    <code>{row.output}</code>
                  </td>
                  {/* Complexity */}
                  <td className="px-6 py-4 font-mono text-neutral-700 dark:text-neutral-200 whitespace-nowrap text-[13px] md:text-sm font-bold">
                    {row.complexity}
                  </td>
                  {/* Description */}
                  <td className="px-6 py-4 text-gray-700 dark:text-neutral-300 font-normal text-[13px] md:text-sm max-w-sm">
                    {row.desc}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
