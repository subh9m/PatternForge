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
  const combinedRegex = /(\/\/.*|--.*|\/\*[\s\S]*?\*\/)|("[^"]*"|'[^']*')|\b(\d+)\b|\b(class|template|typename|struct|public|private|protected|void|int|const|return|new|delete|import|package|static|final|transient|synchronized|extends|instanceof|true|false|null|boolean|char|double|float|long|short|byte|super|this|interface|namespace|std|auto|using|include|define|SELECT|FROM|WHERE|AND|OR|NOT|INSERT|INTO|VALUES|UPDATE|SET|DELETE|CREATE|TABLE|ALTER|ADD|COLUMN|DROP|TRUNCATE|JOIN|ON|INNER|LEFT|RIGHT|FULL|OUTER|GROUP|BY|HAVING|ORDER|ASC|DESC|LIMIT|OFFSET|UNION|ALL|WITH|AS|OVER|PARTITION|RANK|DENSE_RANK|ROW_NUMBER|LEAD|LAG|CASE|WHEN|THEN|ELSE|END|BETWEEN|IN|LIKE|IS|NULL|EXTRACT|DATE_TRUNC|DATE_PART|CEIL|FLOOR|ROUND|SUM|AVG|COUNT|BEGIN|COMMIT|ROLLBACK|SAVEPOINT|TRANSACTION)\b|\b(vector|string|list|deque|stack|queue|priority_queue|set|multiset|map|multimap|unordered_set|unordered_multiset|unordered_map|unordered_multimap|pair|ArrayList|LinkedList|Vector|Stack|Queue|Deque|PriorityQueue|HashSet|LinkedHashSet|TreeSet|HashMap|LinkedHashMap|TreeMap|Hashtable|StringBuilder|StringBuffer|Object|Integer|String|greater|CustomCompare|SERIAL|VARCHAR|NUMERIC|DATE|FLOAT)\b/g;

  escaped = escaped.replace(combinedRegex, (match, comment, string, number, keyword, type) => {
    if (comment) return `<span class="text-slate-500 italic">${match}</span>`;
    if (string) return `<span class="text-amber-600 dark:text-emerald-450 font-medium">${match}</span>`;
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
  const [selectedQueryIdx, setSelectedQueryIdx] = useState(0);
  const [executed, setExecuted] = useState(false);

  const handleRunQuery = () => {
    setExecuted(true);
  };

  return (
    <section 
      id={data.id}
      className="bg-white/60 dark:bg-black/60 backdrop-blur-md 
                 border border-gray-200 dark:border-[#333] 
                 rounded-2xl overflow-hidden shadow-lg
                 hover:shadow-[0_0_25px_rgba(255,59,48,0.2)] hover:-translate-y-0.5
                 transition-all duration-500 ease-in-out mb-10"
    >
      {/* Card Header */}
      <div className="p-6 md:p-8 border-b border-gray-200 dark:border-[#333]">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white flex items-center">
            <span className="font-mono text-red-500 mr-3">{data.num}</span>
            <span className="font-heading tracking-wide">{data.title}</span>
          </h2>
        </div>
        <p className="mt-2 text-gray-600 dark:text-gray-400 font-light text-sm max-w-4xl leading-relaxed">
          {data.desc}
        </p>
      </div>

      {/* Grid for Code Actions */}
      <div className="p-6 md:p-8 bg-gray-50/30 dark:bg-neutral-950/20 border-b border-gray-200 dark:border-[#333] grid grid-cols-1 gap-6">
        {/* Declaration Section Accordion */}
        {data.declaration && (
          <div>
            <button
              onClick={() => setShowDeclaration(!showDeclaration)}
              className="w-full flex items-center justify-between p-3.5 bg-gray-100/60 dark:bg-neutral-950/60 hover:bg-gray-200/50 dark:hover:bg-neutral-900/50 border border-gray-200 dark:border-[#333] transition-smooth font-mono text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 cursor-pointer"
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
              <div className="border-x border-b border-gray-200 dark:border-[#333] bg-gray-50/40 dark:bg-neutral-950/40 p-4">
                <pre 
                  className="bg-gray-100/80 dark:bg-black/80 text-gray-800 dark:text-gray-300 p-4 font-mono text-xs overflow-x-auto border border-gray-200 dark:border-[#333] leading-relaxed select-all"
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
              className="w-full flex items-center justify-between p-3.5 bg-gray-100/60 dark:bg-neutral-950/60 hover:bg-gray-200/50 dark:hover:bg-neutral-900/50 border border-gray-200 dark:border-[#333] transition-smooth font-mono text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 cursor-pointer"
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
                <div className="border-x border-b border-gray-200 dark:border-[#333] bg-gray-50/40 dark:bg-neutral-950/40 p-6 md:p-8 space-y-8">
                  {/* ER Diagram Section */}
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 font-mono">Entity-Relationship (ER) Diagram</h4>
                    <div className="bg-black/20 dark:bg-black/60 border border-gray-200 dark:border-[#333] rounded-xl p-4 flex justify-center">
                      <img 
                        src="/northpeak_er_diagram.png" 
                        alt="NorthPeak Corp ER Diagram" 
                        className="max-w-full h-auto rounded-lg shadow-md border border-gray-250 dark:border-neutral-800"
                      />
                    </div>
                  </div>
                  
                  {/* Seed Data Tables Section */}
                  <div className="space-y-6">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider font-mono">Seed Data Entries Reference</h4>
                    
                    {/* 1. Departments Sample Table */}
                    <div className="border border-gray-200 dark:border-[#333] rounded-xl overflow-hidden bg-white/40 dark:bg-black/40">
                      <div className="px-4 py-2.5 bg-gray-100/50 dark:bg-neutral-950/50 border-b border-gray-200 dark:border-[#333] flex justify-between items-center">
                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300 font-mono">TABLE: DEPARTMENTS (8 rows)</span>
                      </div>
                      <div className="overflow-x-auto text-[11px] font-mono">
                        <table className="w-full text-left">
                          <thead className="bg-gray-150/30 dark:bg-neutral-900/30 border-b border-gray-200 dark:border-[#333]">
                            <tr>
                              <th className="px-4 py-2 font-bold text-gray-500">dept_id (PK)</th>
                              <th className="px-4 py-2 font-bold text-gray-500">dept_name</th>
                              <th className="px-4 py-2 font-bold text-gray-500">location</th>
                              <th className="px-4 py-2 font-bold text-gray-500">budget</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 dark:divide-[#333] text-gray-700 dark:text-gray-300">
                            <tr><td className="px-4 py-2">1</td><td className="px-4 py-2 font-bold">Engineering</td><td className="px-4 py-2">Bengaluru</td><td className="px-4 py-2 text-emerald-500">5000000.00</td></tr>
                            <tr><td className="px-4 py-2">2</td><td className="px-4 py-2 font-bold">Sales</td><td className="px-4 py-2">Mumbai</td><td className="px-4 py-2 text-emerald-500">2000000.00</td></tr>
                            <tr><td className="px-4 py-2">3</td><td className="px-4 py-2 font-bold">Marketing</td><td className="px-4 py-2">Delhi</td><td className="px-4 py-2 text-emerald-500">1200000.00</td></tr>
                            <tr><td className="px-4 py-2">4</td><td className="px-4 py-2 font-bold">HR</td><td className="px-4 py-2">Bengaluru</td><td className="px-4 py-2 text-emerald-500">800000.00</td></tr>
                            <tr><td className="px-4 py-2">5</td><td className="px-4 py-2 font-bold">Finance</td><td className="px-4 py-2">Mumbai</td><td className="px-4 py-2 text-emerald-500">1500000.00</td></tr>
                            <tr><td className="px-4 py-2">6</td><td className="px-4 py-2 font-bold">Customer Support</td><td className="px-4 py-2">Pune</td><td className="px-4 py-2 text-emerald-500">900000.00</td></tr>
                            <tr><td className="px-4 py-2">7</td><td className="px-4 py-2 font-bold text-gray-400">Legal</td><td className="px-4 py-2">Delhi</td><td className="px-4 py-2 text-emerald-500">600000.00</td></tr>
                            <tr><td className="px-4 py-2">8</td><td className="px-4 py-2 font-bold text-gray-400">R&D Satellite</td><td className="px-4 py-2">Hyderabad</td><td className="px-4 py-2 text-red-400 font-bold">NULL</td></tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* 2. Employees Sample Table */}
                    <div className="border border-gray-200 dark:border-[#333] rounded-xl overflow-hidden bg-white/40 dark:bg-black/40">
                      <div className="px-4 py-2.5 bg-gray-100/50 dark:bg-neutral-950/50 border-b border-gray-200 dark:border-[#333] flex justify-between items-center">
                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300 font-mono">TABLE: EMPLOYEES (Sample of 40 rows)</span>
                      </div>
                      <div className="overflow-x-auto text-[11px] font-mono">
                        <table className="w-full text-left">
                          <thead className="bg-gray-150/30 dark:bg-neutral-900/30 border-b border-gray-200 dark:border-[#333]">
                            <tr>
                              <th className="px-4 py-2 font-bold text-gray-500">emp_id</th>
                              <th className="px-4 py-2 font-bold text-gray-500">name</th>
                              <th className="px-4 py-2 font-bold text-gray-500">email</th>
                              <th className="px-4 py-2 font-bold text-gray-500">dept_id</th>
                              <th className="px-4 py-2 font-bold text-gray-500">manager_id</th>
                              <th className="px-4 py-2 font-bold text-gray-500">job_title</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 dark:divide-[#333] text-gray-700 dark:text-gray-300">
                            <tr><td className="px-4 py-2">1</td><td className="px-4 py-2">Ravi Sharma</td><td className="px-4 py-2">ravi.sharma@np.com</td><td className="px-4 py-2">1</td><td className="px-4 py-2 text-red-400">NULL</td><td className="px-4 py-2 font-bold">VP Engineering</td></tr>
                            <tr><td className="px-4 py-2">2</td><td className="px-4 py-2">Anita Verma</td><td className="px-4 py-2">anita.verma@np.com</td><td className="px-4 py-2">1</td><td className="px-4 py-2">1</td><td className="px-4 py-2">Engineering Manager</td></tr>
                            <tr><td className="px-4 py-2">3</td><td className="px-4 py-2">Alex Kim</td><td className="px-4 py-2">alex.kim1@np.com</td><td className="px-4 py-2">1</td><td className="px-4 py-2">2</td><td className="px-4 py-2">Senior Software Engineer</td></tr>
                            <tr><td className="px-4 py-2">6</td><td className="px-4 py-2">Divya Rao</td><td className="px-4 py-2 text-red-400">NULL</td><td className="px-4 py-2">1</td><td className="px-4 py-2">3</td><td className="px-4 py-2">Junior Engineer</td></tr>
                            <tr><td className="px-4 py-2">34</td><td className="px-4 py-2">Simran Chadha</td><td className="px-4 py-2">simran.chadha@np.com</td><td className="px-4 py-2 text-red-400">NULL</td><td className="px-4 py-2 text-red-400">NULL</td><td className="px-4 py-2">Contractor</td></tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* 3. Salaries Sample Table */}
                    <div className="border border-gray-200 dark:border-[#333] rounded-xl overflow-hidden bg-white/40 dark:bg-black/40">
                      <div className="px-4 py-2.5 bg-gray-100/50 dark:bg-neutral-950/50 border-b border-gray-200 dark:border-[#333] flex justify-between items-center">
                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300 font-mono">TABLE: SALARIES (Sample of 48 rows)</span>
                      </div>
                      <div className="overflow-x-auto text-[11px] font-mono">
                        <table className="w-full text-left">
                          <thead className="bg-gray-150/30 dark:bg-neutral-900/30 border-b border-gray-200 dark:border-[#333]">
                            <tr>
                              <th className="px-4 py-2 font-bold text-gray-500">salary_id</th>
                              <th className="px-4 py-2 font-bold text-gray-500">emp_id</th>
                              <th className="px-4 py-2 font-bold text-gray-500">amount</th>
                              <th className="px-4 py-2 font-bold text-gray-500">effective_date</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 dark:divide-[#333] text-gray-700 dark:text-gray-300">
                            <tr><td className="px-4 py-2">1</td><td className="px-4 py-2">1</td><td className="px-4 py-2 text-emerald-500">4500000.00</td><td className="px-4 py-2">2015-03-01</td></tr>
                            <tr><td className="px-4 py-2">2</td><td className="px-4 py-2">1</td><td className="px-4 py-2 text-emerald-500">5200000.00</td><td className="px-4 py-2">2020-01-01 (Raise)</td></tr>
                            <tr><td className="px-4 py-2">8</td><td className="px-4 py-2">4</td><td className="px-4 py-2 text-emerald-500">1500000.00</td><td className="px-4 py-2">2018-02-20</td></tr>
                            <tr><td className="px-4 py-2">10</td><td className="px-4 py-2">5</td><td className="px-4 py-2 text-emerald-500">1500000.00</td><td className="px-4 py-2">2019-07-01 (Tie)</td></tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* 4. Projects Table */}
                    <div className="border border-gray-200 dark:border-[#333] rounded-xl overflow-hidden bg-white/40 dark:bg-black/40">
                      <div className="px-4 py-2.5 bg-gray-100/50 dark:bg-neutral-950/50 border-b border-gray-200 dark:border-[#333] flex justify-between items-center">
                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300 font-mono">TABLE: PROJECTS (Sample of 12 rows)</span>
                      </div>
                      <div className="overflow-x-auto text-[11px] font-mono">
                        <table className="w-full text-left">
                          <thead className="bg-gray-150/30 dark:bg-neutral-900/30 border-b border-gray-200 dark:border-[#333]">
                            <tr>
                              <th className="px-4 py-2 font-bold text-gray-500">project_id</th>
                              <th className="px-4 py-2 font-bold text-gray-500">project_name</th>
                              <th className="px-4 py-2 font-bold text-gray-500">dept_id</th>
                              <th className="px-4 py-2 font-bold text-gray-500">start_date</th>
                              <th className="px-4 py-2 font-bold text-gray-500">end_date</th>
                              <th className="px-4 py-2 font-bold text-gray-500">status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 dark:divide-[#333] text-gray-700 dark:text-gray-300">
                            <tr><td className="px-4 py-2">1</td><td className="px-4 py-2 font-bold">Checkout Revamp</td><td className="px-4 py-2">1</td><td className="px-4 py-2">2023-01-01</td><td className="px-4 py-2">2023-08-01</td><td className="px-4 py-2 text-blue-400">Completed</td></tr>
                            <tr><td className="px-4 py-2">2</td><td className="px-4 py-2 font-bold">Mobile App v2</td><td className="px-4 py-2">1</td><td className="px-4 py-2">2023-06-01</td><td className="px-4 py-2 text-red-400 font-bold">NULL</td><td className="px-4 py-2 text-emerald-450">Active</td></tr>
                            <tr><td className="px-4 py-2">12</td><td className="px-4 py-2 font-bold">Unassigned Research</td><td className="px-4 py-2 text-red-400">NULL</td><td className="px-4 py-2">2024-01-01</td><td className="px-4 py-2 text-red-400">NULL</td><td className="px-4 py-2 text-yellow-500">Planned</td></tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="border-x border-b border-gray-200 dark:border-[#333] bg-gray-50/40 dark:bg-neutral-950/40 p-4">
                  <pre 
                    className="bg-gray-100/80 dark:bg-black/80 text-gray-800 dark:text-gray-300 p-4 font-mono text-xs overflow-x-auto border border-gray-200 dark:border-[#333] leading-relaxed max-h-[400px] select-all"
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
        <div className="p-6 md:p-8 bg-gray-50/20 dark:bg-neutral-950/10 border-b border-gray-200 dark:border-[#333]">
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
                className="w-full bg-white dark:bg-black border border-gray-200 dark:border-[#333] text-gray-800 dark:text-gray-200 text-xs font-mono px-3 py-2 rounded-lg focus:outline-none focus:border-red-500"
              >
                {data.queries.map((q, idx) => (
                  <option key={idx} value={idx}>Query {idx + 1}: {q.sql.split('\n')[0].replace('-- ', '')}</option>
                ))}
              </select>
            </div>
          )}
          
          {/* Query Display Block */}
          <div className="relative mb-4">
            <pre className="bg-gray-100/90 dark:bg-black/90 text-gray-800 dark:text-gray-300 p-4 font-mono text-xs overflow-x-auto border border-gray-200 dark:border-[#333] select-all leading-relaxed rounded-xl pr-28">
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
                <table className="w-full text-left text-xs font-mono text-gray-800 dark:text-gray-300">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-neutral-800">
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
                            <td key={j} className="py-1.5 pr-4 text-gray-850 dark:text-gray-250">
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
            <thead className="bg-gray-50/70 dark:bg-neutral-950/70 border-b border-gray-200 dark:border-[#333]">
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
                <tr key={index} className="hover:bg-gray-100/50 dark:hover:bg-neutral-900/50 transition-colors duration-200">
                  {/* Method */}
                  <td className="px-6 py-4 font-mono font-bold text-red-600 dark:text-red-500 whitespace-nowrap">
                    {row.method}
                  </td>
                  {/* Syntax */}
                  <td className="px-6 py-4 font-mono text-gray-800 dark:text-gray-300 whitespace-nowrap">
                    <code>{row.syntax}</code>
                  </td>
                  {/* Params */}
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-400 font-light whitespace-nowrap text-xs">
                    {row.params}
                  </td>
                  {/* Output */}
                  <td className="px-6 py-4 font-mono text-gray-800 dark:text-gray-300 whitespace-nowrap">
                    <code>{row.output}</code>
                  </td>
                  {/* Complexity */}
                  <td className="px-6 py-4 font-mono text-gray-700 dark:text-gray-300 whitespace-nowrap text-xs font-bold">
                    {row.complexity}
                  </td>
                  {/* Description */}
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-400 font-light text-xs max-w-sm">
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
