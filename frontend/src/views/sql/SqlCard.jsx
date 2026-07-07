import React, { useState } from 'react';
import { Play, Check, Copy, Database } from 'lucide-react';
import { 
  departmentsData, 
  employeesData, 
  salariesData, 
  projectsData, 
  employeeProjectsData, 
  fullSqlScript 
} from './sqlSeedData';

// Syntax highlighter for SQL queries
function highlightCode(code) {
  if (!code) return '';
  // Simple regex-based SQL syntax highlighting
  const keywords = [
    'SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'NOT', 'IN', 'EXISTS', 'JOIN', 
    'LEFT', 'RIGHT', 'INNER', 'OUTER', 'FULL', 'ON', 'GROUP BY', 'HAVING', 
    'ORDER BY', 'LIMIT', 'OFFSET', 'UNION', 'ALL', 'INTERSECT', 'EXCEPT', 
    'CREATE TABLE', 'INSERT INTO', 'UPDATE', 'DELETE', 'SET', 'CREATE', 
    'ALTER', 'DROP', 'TRUNCATE', 'GRANT', 'REVOKE', 'BEGIN', 'COMMIT', 
    'ROLLBACK', 'SAVEPOINT', 'OVER', 'PARTITION BY', 'ROWS BETWEEN', 'RANGE BETWEEN',
    'UNBOUNDED PRECEDING', 'CURRENT ROW', 'UNBOUNDED FOLLOWING', 'PRECEDING', 'FOLLOWING',
    'BETWEEN', 'LIKE', 'DESC', 'ASC', 'NULLS LAST', 'NULLS FIRST', 'ROUND', 'AVG', 'SUM',
    'COUNT', 'MAX', 'MIN', 'ROW_NUMBER', 'RANK', 'DENSE_RANK', 'LAG', 'LEAD', 'FIRST_VALUE', 'LAST_VALUE'
  ];

  let escaped = code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Highlight numbers first (before we introduce any span tags containing class numbers like 500, 400, 650)
  escaped = escaped.replace(/\b(\d+)\b/g, '<span class="text-purple-650 dark:text-violet-400">$1</span>');

  // Highlight keywords
  keywords.forEach(kw => {
    const reg = new RegExp(`\\b(${kw})\\b`, 'gi');
    escaped = escaped.replace(reg, '<span class="text-blue-500 dark:text-cyan-400 font-extrabold">$1</span>');
  });

  // Highlight comments
  escaped = escaped.replace(/(--.*)/g, '<span class="text-gray-400 dark:text-slate-500 italic">$1</span>');
  escaped = escaped.replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="text-gray-400 dark:text-slate-500 italic">$1</span>');

  return escaped;
}

const tableHeaders = {
  departments: ["dept_id", "dept_name", "location", "budget"],
  employees: ["emp_id", "first_name", "last_name", "email", "dept_id", "manager_id", "hire_date", "job_title"],
  salaries: ["salary_id", "emp_id", "amount", "effective_date", "currency"],
  projects: ["project_id", "project_name", "dept_id", "start_date", "end_date", "status"],
  employee_projects: ["emp_id", "project_id", "role", "hours_logged"]
};

const tableDataSources = {
  departments: departmentsData,
  employees: employeesData,
  salaries: salariesData,
  projects: projectsData,
  employee_projects: employeeProjectsData
};

export default function SqlCard({ data }) {
  const [selectedQueryIdx, setSelectedQueryIdx] = useState(0);
  const [executed, setExecuted] = useState(false);
  const [activeFullTable, setActiveFullTable] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFullScriptModal, setShowFullScriptModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleRunQuery = () => {
    setExecuted(true);
  };

  const handleCopyCode = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredRows = activeFullTable ? (tableDataSources[activeFullTable] || []).filter(row => {
    if (!searchQuery) return true;
    return Object.values(row).some(val => 
      val !== null && String(val).toLowerCase().includes(searchQuery.toLowerCase())
    );
  }) : [];

  const isPracticeDb = data.id === "sql_practice_db";

  return (
    <section 
      id={data.id}
      className="w-full bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-850 rounded-2xl p-6 md:p-8 shadow-xl transition-all duration-300 hover:border-red-500/25 relative"
    >
      {/* Concept Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-neutral-200 dark:border-neutral-800 dark:border-neutral-800">
        <div className="flex items-center space-x-3">
          <span className="px-3 py-1 bg-red-500/10 text-red-500 text-[10px] font-black uppercase font-mono tracking-wider rounded-md">
            {data.num}
          </span>
          <h2 className="text-xl font-black text-gray-900 dark:text-white font-mono uppercase tracking-wide">
            {data.title}
          </h2>
        </div>

        {/* Database Exporter Button */}
        {isPracticeDb && (
          <button
            onClick={() => setShowFullScriptModal(true)}
            className="px-4 py-2 bg-red-650 hover:bg-red-500 text-white font-mono text-[10px] font-black uppercase tracking-wider rounded-lg flex items-center space-x-2 cursor-pointer shadow-lg hover:shadow-red-500/20 transition-all duration-300"
          >
            <Database className="h-3.5 w-3.5" />
            <span>Get Full Setup SQL Script</span>
          </button>
        )}
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 dark:text-gray-300 font-sans font-light leading-relaxed mb-6">
        {data.desc}
      </p>

      {/* SQL DDL / DML Schema Table Preview */}
      {isPracticeDb && data.methods && (
        <div className="mb-6 bg-gray-50/50 dark:bg-neutral-900/30 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-850 rounded-xl p-5">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono mb-4 flex items-center space-x-2">
            <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full"></span>
            <span>Relational Schema (Click table name to view all records)</span>
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
            {data.methods.map((tbl, i) => (
              <div 
                key={i} 
                onClick={() => { setActiveFullTable(tbl.method); setSearchQuery(""); }}
                className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 hover:border-red-500/50 hover:shadow-md p-3.5 rounded-xl cursor-pointer transition-all duration-300 group text-center"
              >
                <span className="block text-xs font-mono font-bold text-gray-800 dark:text-gray-200 group-hover:text-red-500 uppercase tracking-wide">
                  {tbl.method}
                </span>
                <span className="block text-[10px] font-mono text-gray-450 dark:text-gray-500 mt-1">
                  {tbl.output}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Concept Declaration/Syntax code block */}
      <div className="relative mb-6">
        <div className="absolute right-3 top-3 z-10 flex space-x-2">
          <button
            onClick={() => handleCopyCode(data.declaration)}
            className="p-1.5 bg-white/80 dark:bg-neutral-950/80 hover:bg-gray-100 dark:hover:bg-neutral-900 text-gray-600 dark:text-gray-400 rounded-md border border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 transition-colors duration-200 cursor-pointer"
            title="Copy Syntax"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
        </div>
        <pre className="bg-neutral-100/50 dark:bg-neutral-900/50 text-neutral-800 dark:text-neutral-300 p-5 font-mono text-xs overflow-x-auto border border-neutral-200 dark:border-neutral-800 dark:border-neutral-850 rounded-xl pr-14 leading-relaxed">
          <code dangerouslySetInnerHTML={{ __html: highlightCode(data.declaration) }} />
        </pre>
      </div>

      {/* Concept Internals Theory block */}
      {data.internalImplementation && (
        <div className="mb-6">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono mb-2.5">
            Technical Internals / Compilation Details
          </h4>
          <pre className="bg-red-500/[0.01] dark:bg-red-500/[0.01] text-gray-500 dark:text-gray-400 p-5 font-mono text-xs overflow-x-auto border border-dashed border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 rounded-xl leading-relaxed">
            <code>{data.internalImplementation}</code>
          </pre>
        </div>
      )}

      {/* Interactive Execution Playground */}
      {data.queries && data.queries.length > 0 && (
        <div className="border-t border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 pt-6 mt-6">
          <h3 className="text-xs font-black text-gray-900 dark:text-white font-mono uppercase tracking-wider mb-4 flex items-center space-x-2">
            <span>Query Playground</span>
            <span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-500 text-[8px] tracking-widest uppercase rounded-sm">SANDBOX</span>
          </h3>
          
          {/* Query Selector dropdown */}
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
            <pre className="bg-neutral-100/90 dark:bg-neutral-900/90 text-neutral-800 dark:text-neutral-300 p-4 font-mono text-xs overflow-x-auto border border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 select-all leading-relaxed rounded-xl pr-28">
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
              
              <div className="overflow-x-auto border border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 rounded-lg">
                <table className="w-full text-left text-xs font-mono text-neutral-800 dark:text-neutral-300">
                  <thead className="bg-neutral-100/50 dark:bg-neutral-900/50 border-b border-neutral-200 dark:border-neutral-800 dark:border-neutral-800">
                    <tr>
                      {data.queries[selectedQueryIdx].columns.map((col, idx) => (
                        <th key={idx} className="px-4 py-2 font-bold uppercase tracking-wider text-[10px] text-gray-500 font-bold">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-250 dark:divide-[#333]">
                    {data.queries[selectedQueryIdx].rows.length === 0 ? (
                      <tr>
                        <td colSpan={data.queries[selectedQueryIdx].columns.length} className="px-4 py-4 text-center text-gray-500 italic">
                          Empty set returned (0 rows)
                        </td>
                      </tr>
                    ) : (
                      data.queries[selectedQueryIdx].rows.map((row, idx) => (
                        <tr key={idx} className="hover:bg-emerald-500/5 transition-colors duration-150">
                          {row.map((cell, cellIdx) => (
                            <td key={cellIdx} className="px-4 py-2.5">
                              {cell === null ? (
                                <span className="text-red-400 bg-red-400/5 px-1 py-0.2 rounded-sm font-bold font-bold">NULL</span>
                              ) : typeof cell === 'number' && data.queries[selectedQueryIdx].columns[cellIdx]?.includes('salary') ? (
                                <span className="text-emerald-550 dark:text-emerald-450 font-semibold">{cell.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                              ) : (
                                String(cell)
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

      {/* Table Data Modal */}
      {activeFullTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 w-full max-w-5xl max-h-[85vh] rounded-2xl overflow-hidden flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="p-6 border-b border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 bg-gray-50/50 dark:bg-neutral-900/50 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-black text-gray-900 dark:text-white font-mono uppercase">
                  Table View: {activeFullTable.toUpperCase()}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-light">
                  Showing {filteredRows.length} of {tableDataSources[activeFullTable].length} rows.
                </p>
              </div>
              <button 
                onClick={() => { setActiveFullTable(null); setSearchQuery(""); }}
                className="px-4 py-2 bg-red-650 hover:bg-red-500 text-white font-mono text-xs font-bold rounded-lg cursor-pointer transition-all duration-200"
              >
                Close View
              </button>
            </div>
            
            {/* Search filter bar */}
            <div className="p-4 bg-gray-55/20 dark:bg-neutral-950/20 border-b border-neutral-200 dark:border-neutral-800 dark:border-neutral-800">
              <input
                type="text"
                placeholder={`Search records in ${activeFullTable}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 text-gray-800 dark:text-gray-200 text-xs font-mono px-4 py-3 rounded-xl focus:outline-none focus:border-red-500"
              />
            </div>
            
            {/* Table Body Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="border border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-gray-100 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 sticky top-0">
                    <tr>
                      {tableHeaders[activeFullTable].map(header => (
                        <th key={header} className="px-5 py-3 font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-150 dark:divide-neutral-900/50 text-neutral-800 dark:text-neutral-300">
                    {filteredRows.length === 0 ? (
                      <tr>
                        <td colSpan={tableHeaders[activeFullTable].length} className="px-5 py-8 text-center text-gray-500 italic">
                          No matching records found.
                        </td>
                      </tr>
                    ) : (
                      filteredRows.map((row, i) => (
                        <tr key={i} className="hover:bg-red-500/5 dark:hover:bg-red-500/5 even:bg-gray-50/10 dark:even:bg-neutral-900/10">
                          {tableHeaders[activeFullTable].map(col => {
                            const val = row[col];
                            return (
                              <td key={col} className="px-5 py-3">
                                {val === null ? (
                                  <span className="text-red-400 font-bold bg-red-400/5 px-1.5 py-0.5 rounded-sm font-bold">NULL</span>
                                ) : col === 'amount' || col === 'budget' ? (
                                  <span className="text-emerald-550 dark:text-emerald-450 font-semibold">{Number(val).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                                ) : (
                                  String(val)
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SQL Script View Modal */}
      {showFullScriptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 w-full max-w-5xl max-h-[85vh] rounded-2xl overflow-hidden flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="p-6 border-b border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 bg-gray-50/50 dark:bg-neutral-900/50 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-black text-gray-900 dark:text-white font-mono uppercase">
                  Complete Seed Script (DDL & DML)
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-light">
                  Copy and paste this script directly into any PostgreSQL/SQLite client to set up the practice database.
                </p>
              </div>
              <button 
                onClick={() => setShowFullScriptModal(false)}
                className="px-4 py-2 bg-red-650 hover:bg-red-500 text-white font-mono text-xs font-bold rounded-lg cursor-pointer transition-all duration-200"
              >
                Close Script
              </button>
            </div>
            
            {/* Script body */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-950 text-gray-300 font-mono text-[11px] select-all leading-relaxed whitespace-pre-wrap">
              <code>{fullSqlScript}</code>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
