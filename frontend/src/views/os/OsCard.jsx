import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

// Syntax highlighter optimized for OS configurations and code/ascii diagrams
function highlightCode(code) {
  if (!code) return '';
  let escaped = code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Highlight comments or diagram boundaries
  escaped = escaped.replace(/(\/\/.*)/g, '<span class="text-slate-500 dark:text-slate-500 italic">$1</span>');
  escaped = escaped.replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="text-slate-500 dark:text-slate-500 italic">$1</span>');
  escaped = escaped.replace(/([┌┐└┘├┤─│▲▼◄►├─┬┴┼]+)/g, '<span class="text-amber-500 font-bold">$1</span>');
  escaped = escaped.replace(/\b(User Space|Kernel Space|Ring 3|Ring 0|Stack|Heap|BSS Segment|Data Segment|Text Segment|Virtual Address|Physical Address|TLB|Page Table|Resource|Process|Interrupt|Trap|Exception)\b/g, '<span class="text-blue-500 dark:text-cyan-400 font-black">$1</span>');

  return escaped;
}

export default function OsCard({ data }) {
  const [showDeclaration, setShowDeclaration] = useState(true);
  const [showInternal, setShowInternal] = useState(true);

  return (
    <section 
      id={data.id}
      className="bg-white/60 dark:bg-black/60 backdrop-blur-md 
                 border border-gray-250 dark:border-[#333] 
                 rounded-2xl overflow-hidden shadow-lg
                 hover:shadow-[0_0_25px_rgba(245,158,11,0.15)] hover:border-amber-500/30 hover:-translate-y-0.5
                 transition-all duration-500 ease-in-out mb-10"
    >
      {/* Card Header */}
      <div className="p-6 md:p-8 border-b border-gray-250 dark:border-[#333]">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-3.5">
            <span className="px-3 py-1 bg-amber-500/10 text-amber-500 text-[10px] font-black uppercase font-mono tracking-wider rounded-md border border-amber-500/20">
              {data.num}
            </span>
            <h2 className="text-xl font-black text-gray-900 dark:text-white font-mono uppercase tracking-wide">
              {data.title}
            </h2>
          </div>
        </div>
        <p className="mt-3.5 text-sm text-gray-600 dark:text-gray-400 font-light leading-relaxed max-w-4xl">
          {data.desc}
        </p>
      </div>

      {/* Revision Key Concepts Section */}
      <div className="border-b border-gray-200 dark:border-[#222]">
        <button
          onClick={() => setShowDeclaration(!showDeclaration)}
          className="w-full flex items-center justify-between p-5 bg-gray-50/50 dark:bg-[#111]/30 hover:bg-gray-100/50 dark:hover:bg-[#111]/60 transition-colors duration-200 text-left font-mono font-bold text-xs uppercase text-gray-800 dark:text-gray-300"
        >
          <span className="flex items-center space-x-2">
            <span>Key Concept Cheat Sheet & Formula Sheets</span>
          </span>
          {showDeclaration ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        
        {showDeclaration && (
          <div className="p-6 bg-gray-100/30 dark:bg-[#070707]/30 border-t border-gray-150 dark:border-[#222]">
            <pre className="text-xs font-mono text-gray-700 dark:text-gray-300 overflow-x-auto whitespace-pre-wrap leading-relaxed">
              <code>{data.declaration}</code>
            </pre>
          </div>
        )}
      </div>

      {/* Visual / Execution Diagrams Section */}
      {data.internalImplementation && (
        <div className="border-b border-gray-200 dark:border-[#222]">
          <button
            onClick={() => setShowInternal(!showInternal)}
            className="w-full flex items-center justify-between p-5 bg-gray-50/50 dark:bg-[#111]/30 hover:bg-gray-100/50 dark:hover:bg-[#111]/60 transition-colors duration-200 text-left font-mono font-bold text-xs uppercase text-gray-800 dark:text-gray-300"
          >
            <span>Logical Executions & Architectural Flowcharts</span>
            {showInternal ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          
          {showInternal && (
            <div className="p-6 bg-black/95 text-gray-300 border-t border-gray-250 dark:border-[#222] overflow-x-auto">
              <pre className="text-[11px] font-mono leading-relaxed whitespace-pre">
                <code dangerouslySetInnerHTML={{ __html: highlightCode(data.internalImplementation) }} />
              </pre>
            </div>
          )}
        </div>
      )}

      {/* OS Q&A Index Table */}
      {data.methods && data.methods.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-neutral-900 border-b border-gray-250 dark:border-[#333]">
                <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest font-mono">Question / Concept</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest font-mono">Mechanism / Command</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest font-mono">Inputs / Context</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest font-mono">Result / Output</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest font-mono">Complexity / Overhead</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest font-mono">Revision Explanation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-150 dark:divide-neutral-900/50">
              {data.methods.map((row, idx) => (
                <tr 
                  key={idx} 
                  className="hover:bg-amber-500/[0.02] dark:hover:bg-amber-500/[0.02] transition-colors duration-150"
                >
                  {/* Question */}
                  <td className="px-6 py-4 font-mono font-bold text-gray-900 dark:text-gray-100 text-xs">
                    {row.method}
                  </td>
                  {/* System Call / Mechanism */}
                  <td className="px-6 py-4 font-mono text-amber-600 dark:text-amber-400 text-xs font-semibold whitespace-nowrap">
                    {row.syntax}
                  </td>
                  {/* Parameters / Inputs */}
                  <td className="px-6 py-4 text-gray-650 dark:text-gray-400 font-light text-xs whitespace-nowrap">
                    {row.params}
                  </td>
                  {/* Output */}
                  <td className="px-6 py-4 font-mono text-gray-800 dark:text-gray-300 text-xs">
                    <code>{row.output}</code>
                  </td>
                  {/* Complexity */}
                  <td className="px-6 py-4 font-mono text-slate-700 dark:text-slate-400 font-semibold text-xs whitespace-nowrap">
                    {row.complexity}
                  </td>
                  {/* Explanation */}
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300 font-light text-xs leading-relaxed max-w-sm">
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
