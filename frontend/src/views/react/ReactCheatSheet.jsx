import React, { useState } from 'react';
import { Search, Copy, Check, Filter, Code, BookOpen } from 'lucide-react';

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

const REACT_SNIPPETS = [
  {
    name: "useDebounce Hook",
    desc: "Delays state changes until typing actions stop for a set duration.",
    code: `import { useState, useEffect } from 'react';

export function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}`
  },
  {
    name: "useLocalStorage Hook",
    desc: "Syncs state variables directly with browser localStorage key stores.",
    code: `import { useState, useEffect } from 'react';

export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error(error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}`
  },
  {
    name: "React ErrorBoundary",
    desc: "Class component that catches rendering errors and prevents complete app crashes.",
    code: `import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log details to an external logging service
    console.error("ErrorBoundary log:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div style={{ padding: '20px', border: '1px solid red', borderRadius: '8px' }}>
          <h2>Something went wrong.</h2>
          <p>{this.state.error?.toString()}</p>
        </div>
      );
    }
    return this.props.children;
  }
}`
  },
  {
    name: "Context API Boilerplate",
    desc: "Compact state provider pattern integrating useReducer for scoped state containers.",
    code: `import React, { createContext, useContext, useReducer } from 'react';

const StateContext = createContext();

const appReducer = (state, action) => {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'RESET':
      return { user: null };
    default:
      return state;
  }
};

export const StateProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, { user: null });
  return (
    <StateContext.Provider value={{ state, dispatch }}>
      {children}
    </StateContext.Provider>
  );
};

export const useGlobalStore = () => useContext(StateContext);`
  }
];

export default function ReactCheatSheet() {
  const [viewMode, setViewMode] = useState('glossary'); // 'glossary' or 'snippets'
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('ALL');
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [activeSnippetIdx, setActiveSnippetIdx] = useState(0);

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
    <div className="bg-white/80 dark:bg-neutral-950/70 backdrop-blur-md border border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 rounded-2xl p-6 md:p-8 shadow-lg space-y-6">
      
      {/* Header */}
      <div className="border-b border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 pb-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-gray-900 dark:text-white font-mono uppercase tracking-wide">
            📋 React Cheat Sheets & Boilerplates
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 font-light leading-relaxed">
            Quick-lookup glossary details and copy-paste functional code boilerplates for senior React interviews.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex bg-gray-100 dark:bg-neutral-900 p-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 dark:border-neutral-800">
          <button
            onClick={() => setViewMode('glossary')}
            className={`flex items-center space-x-1.5 px-4 py-1.5 text-xs font-mono font-bold rounded-lg transition-all cursor-pointer
              ${viewMode === 'glossary' 
                ? 'bg-sky-500 text-white shadow-md' 
                : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'}`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>Glossary</span>
          </button>
          <button
            onClick={() => setViewMode('snippets')}
            className={`flex items-center space-x-1.5 px-4 py-1.5 text-xs font-mono font-bold rounded-lg transition-all cursor-pointer
              ${viewMode === 'snippets' 
                ? 'bg-sky-500 text-white shadow-md' 
                : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'}`}
          >
            <Code className="h-3.5 w-3.5" />
            <span>Code Snippets</span>
          </button>
        </div>
      </div>

      {viewMode === 'glossary' ? (
        <>
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
                className="w-full pl-9 pr-4 py-2 text-xs bg-gray-55/50 dark:bg-black/40 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-905 rounded-xl font-mono text-gray-800 dark:text-gray-300 focus:outline-none focus:border-sky-500 transition-all"
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
                      : 'bg-transparent text-gray-500 dark:text-gray-400 border-neutral-200 dark:border-neutral-800 dark:border-neutral-900 hover:border-sky-500/20'}`}
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
                  className="p-5 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-900 bg-white/40 dark:bg-neutral-950/20 hover:border-sky-500/30 rounded-xl flex flex-col justify-between space-y-4 hover:shadow-md transition-all group relative"
                >
                  {/* Top Row */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 bg-sky-500/10 text-sky-500 text-[8px] font-mono font-black uppercase rounded">
                        {item.category}
                      </span>
                      <button
                        onClick={() => handleCopy(`${item.term}: ${item.definition}`, idx)}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-neutral-900 rounded text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-all opacity-0 group-hover:opacity-100 absolute right-3 top-3 animate-fadeIn"
                        title="Copy definition"
                      >
                        {copiedIndex === idx ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                    <h3 className="text-sm font-black text-neutral-800 dark:text-neutral-200 font-mono">
                      {item.term}
                    </h3>
                  </div>

                  {/* Definition */}
                  <p className="text-[14px] md:text-[15px] text-gray-700 dark:text-neutral-300 font-normal leading-relaxed">
                    {item.definition}
                  </p>

                  {/* Analogy Box */}
                  <div className="p-4 bg-neutral-100/60 dark:bg-neutral-900/30 border-l-2 border-slate-400 dark:border-neutral-700 rounded-r-lg">
                    <span className="block text-[9.5px] font-mono text-slate-400 dark:text-neutral-500 uppercase tracking-widest font-black mb-1">💡 SDE Analogy</span>
                    <p className="text-[13px] md:text-[14px] italic text-gray-600 dark:text-gray-400 leading-relaxed font-sans">
                      {item.analogy}
                    </p>
                  </div>

                  {/* Speak-ready summary */}
                  <div className="space-y-0.5">
                    <span className="block text-[9.5px] font-mono text-sky-500/80 uppercase tracking-widest font-black">🗣️ Speak-ready Answer</span>
                    <p className="text-[13px] md:text-[14px] font-mono font-bold text-sky-500/90 leading-relaxed">
                      {item.oneLiner}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-2 flex flex-col items-center justify-center py-10 border border-dashed border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 rounded-xl text-center text-gray-400">
                <span className="text-2xl">🔎</span>
                <span className="text-xs font-mono mt-2">No matching items found.</span>
              </div>
            )}
          </div>
        </>
      ) : (
        /* CODE BOILERPLATES VIEW */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-mono text-xs">
          {/* Sidebar selector */}
          <div className="lg:col-span-1 space-y-2.5">
            {REACT_SNIPPETS.map((snip, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setActiveSnippetIdx(idx);
                  setCopiedIndex(null);
                }}
                className={`w-full p-4 border rounded-xl text-left transition-all cursor-pointer flex flex-col justify-between space-y-1
                  ${activeSnippetIdx === idx 
                    ? 'border-sky-500/30 bg-sky-500/5 text-sky-500 shadow-md shadow-sky-500/5' 
                    : 'border-neutral-200 dark:border-neutral-800 dark:border-neutral-900 hover:border-sky-500/10 text-neutral-700 dark:text-neutral-300'}`}
              >
                <strong className="text-[11px] font-black">{snip.name}</strong>
                <span className="text-[9.5px] text-gray-400 dark:text-gray-500 font-light leading-normal">{snip.desc}</span>
              </button>
            ))}
          </div>

          {/* Code Viewer Panel */}
          <div className="lg:col-span-2 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-900 bg-neutral-950/70 rounded-xl p-5 flex flex-col justify-between min-h-[300px] relative">
            <div className="absolute right-4 top-4 z-10">
              <button
                onClick={() => handleCopy(REACT_SNIPPETS[activeSnippetIdx].code, activeSnippetIdx)}
                className="flex items-center space-x-1 px-3 py-1.5 bg-sky-500/10 hover:bg-sky-500/25 text-sky-500 border border-sky-500/20 rounded-lg text-[10px] font-black cursor-pointer transition-colors"
              >
                {copiedIndex === activeSnippetIdx ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy Snippet</span>
                  </>
                )}
              </button>
            </div>

            <div className="overflow-x-auto pt-8 select-all">
              <pre className="text-[10px] text-sky-400 font-mono leading-normal whitespace-pre">
                {REACT_SNIPPETS[activeSnippetIdx].code}
              </pre>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
