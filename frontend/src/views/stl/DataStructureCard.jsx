import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Braces, Code, Terminal } from 'lucide-react';

export default function DataStructureCard({ data }) {
  const [showInternal, setShowInternal] = useState(false);

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
        {/* Declaration Section */}
        {data.declaration && (
          <div>
            <div className="flex items-center space-x-2 mb-2 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 font-mono">
              <Code className="h-4 w-4 text-red-500" />
              <span>How to Declare & Initialize</span>
            </div>
            <pre className="bg-gray-100/80 dark:bg-black/80 text-gray-800 dark:text-gray-300 p-4 font-mono text-xs overflow-x-auto border border-gray-200 dark:border-[#333] leading-relaxed select-all">
              {data.declaration}
            </pre>
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
              <div className="border-x border-b border-gray-200 dark:border-[#333] bg-gray-50/40 dark:bg-neutral-950/40 p-4">
                <pre className="bg-gray-100/80 dark:bg-black/80 text-gray-800 dark:text-gray-300 p-4 font-mono text-xs overflow-x-auto border border-gray-200 dark:border-[#333] leading-relaxed max-h-[400px] select-all">
                  {data.internalImplementation}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>

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
