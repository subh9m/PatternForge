import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Braces, Code } from 'lucide-react';

// Regex-based syntax highlighter for Monaco editor-style code rendering
function highlightCode(code) {
  if (!code) return '';
  
  // Escape HTML characters
  let escaped = code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Regex patterns
  const commentPattern = /(\/\/.*|\/\*[\s\S]*?\*\/)/g;
  const stringPattern = /("[^"]*"|'[^']*')/g;
  const numberPattern = /\b(\d+)\b/g;

  // Keywords
  const keywords = [
    'class', 'template', 'typename', 'struct', 'public', 'private', 'protected',
    'void', 'int', 'const', 'return', 'new', 'delete', 'import', 'package',
    'static', 'final', 'transient', 'synchronized', 'extends', 'instanceof',
    'true', 'false', 'null', 'boolean', 'char', 'double', 'float', 'long',
    'short', 'byte', 'super', 'this', 'interface', 'namespace', 'std', 'auto',
    'using', 'include', 'define'
  ];
  const keywordPattern = new RegExp('\\b(' + keywords.join('|') + ')\\b', 'g');

  // Types / Containers
  const types = [
    'vector', 'string', 'list', 'deque', 'stack', 'queue', 'priority_queue',
    'set', 'multiset', 'map', 'multimap', 'unordered_set', 'unordered_multiset',
    'unordered_map', 'unordered_multimap', 'pair', 'ArrayList', 'LinkedList',
    'Vector', 'Stack', 'Queue', 'Deque', 'PriorityQueue', 'HashSet',
    'LinkedHashSet', 'TreeSet', 'HashMap', 'LinkedHashMap', 'TreeMap',
    'Hashtable', 'StringBuilder', 'StringBuffer', 'Object', 'Integer', 'String',
    'greater', 'CustomCompare'
  ];
  const typePattern = new RegExp('\\b(' + types.join('|') + ')\\b', 'g');

  const placeholders = [];
  
  // Extract Comments
  escaped = escaped.replace(commentPattern, (match) => {
    const placeholder = `___COMMENT_PLACEHOLDER_${placeholders.length}___`;
    placeholders.push({ placeholder, html: `<span class="text-slate-500 italic">${match}</span>` });
    return placeholder;
  });

  // Extract Strings
  escaped = escaped.replace(stringPattern, (match) => {
    const placeholder = `___STRING_PLACEHOLDER_${placeholders.length}___`;
    placeholders.push({ placeholder, html: `<span class="text-amber-600 dark:text-emerald-450 font-medium">${match}</span>` });
    return placeholder;
  });

  // Highlight Keywords
  escaped = escaped.replace(keywordPattern, '<span class="text-blue-600 dark:text-sky-400 font-bold">$1</span>');

  // Highlight Types
  escaped = escaped.replace(typePattern, '<span class="text-cyan-600 dark:text-teal-400 font-semibold">$1</span>');

  // Highlight Numbers
  escaped = escaped.replace(numberPattern, '<span class="text-purple-600 dark:text-violet-400">$1</span>');

  // Restore placeholders
  for (let i = placeholders.length - 1; i >= 0; i--) {
    escaped = escaped.replace(placeholders[i].placeholder, placeholders[i].html);
  }

  return escaped;
}

export default function DataStructureCard({ data }) {
  const [showDeclaration, setShowDeclaration] = useState(false);
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
              <div className="border-x border-b border-gray-200 dark:border-[#333] bg-gray-50/40 dark:bg-neutral-950/40 p-4">
                <pre 
                  className="bg-gray-100/80 dark:bg-black/80 text-gray-800 dark:text-gray-300 p-4 font-mono text-xs overflow-x-auto border border-gray-200 dark:border-[#333] leading-relaxed max-h-[400px] select-all"
                  dangerouslySetInnerHTML={{ __html: highlightCode(data.internalImplementation) }}
                />
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
