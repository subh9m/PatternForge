import React, { useState } from 'react';
import { Search, Copy, Check, Filter } from 'lucide-react';

const SPRING_GLOSSARY_ITEMS = [
  {
    term: "@Component",
    category: "CORE",
    definition: "Marks a Java class as a generic Spring-managed bean candidate for autowiring scanning.",
    analogy: "A registered contractor license: it lets the company know this entity is available for hire in the registry.",
    oneLiner: "@Component registers a generic bean in the Spring container, serving as the parent of other stereotypes."
  },
  {
    term: "@Service",
    category: "CORE",
    definition: "A semantic specialization of @Component, marking the class as a business logic layer component.",
    analogy: "The head chef in a restaurant: does not deal with clients or buy groceries directly, but runs the recipe instructions.",
    oneLiner: "@Service designates business logic execution layer classes in the ApplicationContext."
  },
  {
    term: "@Repository",
    category: "DATA",
    definition: "Stereotype specialization for the DAO/Persistence layer that automatically translates database exceptions.",
    analogy: "A bilingual translator in a foreign port: converts raw local port issues into standard expressions the ship crew understands.",
    oneLiner: "@Repository registers persistence classes and translates JDBC/SQL exceptions to Spring's DataAccessException."
  },
  {
    term: "@RestController",
    category: "WEB",
    definition: "Combines @Controller and @ResponseBody, serializing returned objects directly to JSON or XML response streams.",
    analogy: "A drive-thru speaker box: you order and receive food directly on the spot, without going inside to sit at a table.",
    oneLiner: "@RestController bypasses ViewResolvers to write JSON directly to the client response pipeline."
  },
  {
    term: "@Transactional",
    category: "DATA",
    definition: "Enables declarative transaction boundaries on classes/methods, ensuring atomicity via Spring AOP proxies.",
    analogy: "A bank wire agreement: either the transfer happens completely or both accounts revert back to their starting balance.",
    oneLiner: "@Transactional wraps database queries in ACID transaction boundaries, rolling back on RuntimeExceptions."
  },
  {
    term: "@Async",
    category: "SYSTEMS",
    definition: "Instructs the container to run the target method asynchronously on a separate managed thread pool.",
    analogy: "Handing tasks to a helper assistant: you continue writing code while they run to the post office to mail letters.",
    oneLiner: "@Async delegates task execution to a background ThreadPoolTaskExecutor, returning Future or void."
  },
  {
    term: "@Cacheable",
    category: "SYSTEMS",
    definition: "Caches the return value of a method execution; subsequent calls with identical arguments skip method runs.",
    analogy: "A student writing answers on a scratchpad: if the teacher asks the exact same question, they read the scratchpad directly.",
    oneLiner: "@Cacheable avoids slow method calculations by loading results from cache storage if parameters match."
  },
  {
    term: "@Qualifier",
    category: "CORE",
    definition: "Resolves bean injection ambiguity when multiple candidates of the same type exist in the context.",
    analogy: "Calling a friend by their nickname: if two friends are named John, you call for 'John the Builder' to specify.",
    oneLiner: "@Qualifier specifies the exact bean name to inject when type matching returns multiple candidates."
  }
];

export default function SpringCheatSheet() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('ALL');
  const [copiedIndex, setCopiedIndex] = useState(null);

  const categories = ['ALL', 'CORE', 'WEB', 'DATA', 'SYSTEMS'];

  const filtered = SPRING_GLOSSARY_ITEMS.filter(item => {
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
          📋 Key Spring Annotations Reference
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 font-light leading-relaxed">
          Quick-lookup glossary details for stereotypes, transactional propagation, scopes, and context configurations.
        </p>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search annotations or keywords..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-gray-55/50 dark:bg-black/40 border border-gray-200 dark:border-neutral-800 rounded-xl font-mono text-gray-800 dark:text-gray-300 focus:outline-none focus:border-green-500 transition-all"
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
                  ? 'bg-green-500/10 text-green-500 border-green-500/30' 
                  : 'bg-transparent text-gray-555 dark:text-gray-450 border-gray-200 dark:border-neutral-900 hover:border-green-500/20'}`}
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
              className="p-5 border border-gray-200 dark:border-neutral-900 bg-white/40 dark:bg-neutral-950/20 hover:border-green-500/30 rounded-xl flex flex-col justify-between space-y-4 hover:shadow-md transition-all group relative"
            >
              {/* Top Row */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 bg-green-500/10 text-green-500 text-[8px] font-mono font-black uppercase rounded">
                    {item.category}
                  </span>
                  <button
                    onClick={() => handleCopy(`${item.term}: ${item.definition}`, idx)}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-neutral-900 rounded text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-all opacity-0 group-hover:opacity-100 absolute right-3 top-3"
                    title="Copy definition"
                  >
                    {copiedIndex === idx ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
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
                <span className="block text-[8px] font-mono text-green-500/80 uppercase tracking-widest font-black mb-0.5">🗣️ Speak-ready Answer</span>
                <p className="text-[10.5px] font-mono font-bold text-green-500/90 leading-normal">
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
