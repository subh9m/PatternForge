import React, { useState } from 'react';
import { Search, Copy, Check, Filter } from 'lucide-react';

const REACT_GLOSSARY_ITEMS = [
  {
    term: "useState",
    category: "STATE",
    definition: "Adds local mutable state to a functional component, returning a getter variable and a setter function.",
    analogy: "A whiteboard in a study room: you read the current content and write fresh values on it when rules change.",
    oneLiner: "useState registers mutable data triggers that force a component re-render on value replacement."
  },
  {
    term: "useEffect",
    category: "EFFECTS",
    definition: "Executes side-effects asynchronously after painting, with an optional return callback cleanup handler.",
    analogy: "A mail carrier check schedule: they deliver letters after the house is built, and cancel old bookings on departure.",
    oneLiner: "useEffect triggers side-effects, cleaning up event listeners or socket connections during unmounts."
  },
  {
    term: "useRef",
    category: "DOM/REF",
    definition: "Returns a mutable object { current: value } that persists across renders without causing re-renders.",
    analogy: "A personal diary in your pocket: you write notes in it throughout the day, but it never triggers a home remodel.",
    oneLiner: "useRef persists reference metrics or inputs without triggering re-render cycles."
  },
  {
    term: "useMemo",
    category: "PERFORMANCE",
    definition: "Caches calculated results of heavy computations, recalculating only when dependency arrays modify.",
    analogy: "A calculator memory register: if the teacher asks the exact same math, read the cached result instead of calculating.",
    oneLiner: "useMemo preserves computed arrays/objects, skipping heavy filter recalculations on normal renders."
  },
  {
    term: "useCallback",
    category: "PERFORMANCE",
    definition: "Caches function references, returning the same callback instance to prevent re-rendering React.memo child elements.",
    analogy: "An identical copy of a contract: you reuse the same document reference instead of signing a new paper every meeting.",
    oneLiner: "useCallback stabilizes event handler references to satisfy shallow equality checks in child components."
  },
  {
    term: "useTransition",
    category: "CONCURRENCY",
    definition: "React 18 hook returning [isPending, startTransition] to schedule low-priority state updates in the background.",
    analogy: "An editor filing articles: they instantly post breaking news headlines first, sending full articles to print queues next.",
    oneLiner: "useTransition keeps text inputs responsive by deferring heavy list filters to background threads."
  },
  {
    term: "useDeferredValue",
    category: "CONCURRENCY",
    definition: "React 18 hook that defers updating a state value to keep UI interactions responsive during background computations.",
    analogy: "An audio streaming buffer: you hear music immediately while high-resolution files sync up in background buffers.",
    oneLiner: "useDeferredValue buffers slow components, displaying placeholder frames during intensive tree computations."
  },
  {
    term: "useId",
    category: "ACCESSIBILITY",
    definition: "Generates stable, unique IDs that prevent hydration mismatches during server-side renders (SSR).",
    analogy: "A numbered entry pass: server and client gatekeepers verify the exact same seat code on arrival.",
    oneLiner: "useId yields unique, stable accessibility element ids that survive SSR page hydration stages."
  }
];

export default function ReactCheatSheet() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('ALL');
  const [copiedIndex, setCopiedIndex] = useState(null);

  const categories = ['ALL', 'STATE', 'EFFECTS', 'DOM/REF', 'PERFORMANCE', 'CONCURRENCY'];

  const filtered = REACT_GLOSSARY_ITEMS.filter(item => {
    const matchesSearch = item.term.toLowerCase().includes(search.toLowerCase()) || 
                          item.definition.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'ALL' || item.category === category;
    return matchesSearch && matchesCategory;
  });

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="bg-white/60 dark:bg-black/60 backdrop-blur-md border border-gray-255 dark:border-[#333] rounded-2xl p-6 md:p-8 shadow-lg space-y-6">
      
      {/* Header */}
      <div className="border-b border-gray-150 dark:border-[#333] pb-4">
        <h2 className="text-xl font-black text-gray-900 dark:text-white font-mono uppercase tracking-wide">
          📋 Key React Hooks Reference
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 font-light leading-relaxed">
          Quick-lookup glossary details for standard hooks, concurrent render transitions, and accessibility.
        </p>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search hooks or categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-gray-55/50 dark:bg-black/40 border border-gray-250 dark:border-neutral-905 rounded-xl font-mono text-gray-805 dark:text-gray-300 focus:outline-none focus:border-sky-500 transition-all"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <Filter className="h-3.5 w-3.5 text-gray-400 flex-shrink-0 mr-1" />
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1 text-[10px] font-mono font-bold rounded-lg border transition-all cursor-pointer
                ${category === cat 
                  ? 'bg-sky-500/10 text-sky-500 border-sky-500/30' 
                  : 'bg-transparent text-gray-555 dark:text-gray-450 border-gray-200 dark:border-neutral-900 hover:border-sky-500/20'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.length > 0 ? (
          filtered.map((item, idx) => (
            <div 
              key={idx}
              className="p-5 border border-gray-200 dark:border-neutral-900 bg-white/40 dark:bg-neutral-950/20 hover:border-sky-500/30 rounded-xl flex flex-col justify-between space-y-4 hover:shadow-md transition-all group relative"
            >
              {/* Top Row */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 bg-sky-500/10 text-sky-500 text-[8px] font-mono font-black uppercase rounded">
                    {item.category}
                  </span>
                  <button
                    onClick={() => handleCopy(`${item.term}: ${item.definition}`, idx)}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-neutral-900 rounded text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-all opacity-0 group-hover:opacity-100 absolute right-3 top-3"
                    title="Copy definition"
                  >
                    {copiedIndex === idx ? <Check className="h-3.5 w-3.5 text-emerald-555" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
                <h3 className="text-sm font-black text-gray-800 dark:text-gray-250 font-mono">
                  {item.term}
                </h3>
              </div>

              {/* Definition */}
              <p className="text-xs text-gray-650 dark:text-gray-400 font-light leading-relaxed">
                {item.definition}
              </p>

              {/* Analogy Box */}
              <div className="p-3 bg-neutral-100/60 dark:bg-neutral-900/30 border-l-2 border-slate-400 dark:border-neutral-700 rounded-r-lg">
                <span className="block text-[8px] font-mono text-slate-400 dark:text-neutral-500 uppercase tracking-widest font-black mb-0.5">💡 SDE Analogy</span>
                <p className="text-[10.5px] italic text-gray-500 dark:text-gray-400 leading-normal font-sans">
                  {item.analogy}
                </p>
              </div>

              {/* Speak-ready summary */}
              <div>
                <span className="block text-[8px] font-mono text-sky-500/80 uppercase tracking-widest font-black mb-0.5">🗣️ Speak-ready Answer</span>
                <p className="text-[10.5px] font-mono font-bold text-sky-500/90 leading-normal">
                  {item.oneLiner}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-2 flex flex-col items-center justify-center py-10 border border-dashed border-gray-250 dark:border-neutral-800 rounded-xl text-center text-gray-450">
            <span className="text-2xl">🔎</span>
            <span className="text-xs font-mono mt-2">No matching items found.</span>
          </div>
        )}
      </div>

    </div>
  );
}
