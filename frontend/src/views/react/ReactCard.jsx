import React, { useState } from 'react';
import { HelpCircle, AlertTriangle, CheckSquare, Sparkles, ChevronDown, ChevronUp, ArrowRight } from 'lucide-react';

const renderDiagram = (conceptId) => {
  switch (conceptId) {
    case 'react_fundamentals':
      return (
        <div className="space-y-3">
          <span className="block text-[10px] font-black text-slate-450 uppercase tracking-widest font-mono">
            Virtual DOM Diffing & Patching Strategy
          </span>
          <div className="p-5 bg-white/80 dark:bg-neutral-950/40 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-900 rounded-xl space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center font-mono text-[10.5px]">
              <div className="p-3.5 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 bg-white dark:bg-neutral-950 rounded-lg">
                <span className="px-1.5 py-0.2 bg-sky-500/10 text-sky-500 rounded block font-bold mb-1">1. Generate VDOM</span>
                <span className="text-neutral-500 dark:text-neutral-400">State change creates new plain JS object tree representing UI.</span>
              </div>
              <div className="p-3.5 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 bg-white dark:bg-neutral-950 rounded-lg">
                <span className="px-1.5 py-0.2 bg-sky-500/10 text-sky-500 rounded block font-bold mb-1">2. Diffing (O(N))</span>
                <span className="text-neutral-500 dark:text-neutral-400">React compares new VDOM tree with old VDOM tree level-by-level.</span>
              </div>
              <div className="p-3.5 border border-sky-500/25 bg-sky-500/5 rounded-lg text-sky-500 font-bold shadow-sm">
                <span className="px-1.5 py-0.2 bg-sky-500 text-white rounded block font-bold mb-1">3. Reconcile DOM</span>
                <span className="text-neutral-700 dark:text-neutral-300">Applies only minimal diff patches to the Real browser DOM.</span>
              </div>
            </div>
          </div>
        </div>
      );

    case 'react_state':
      return (
        <div className="space-y-3">
          <span className="block text-[10px] font-black text-slate-450 uppercase tracking-widest font-mono">
            React Hook Mount & Update Lifecycle Pipeline
          </span>
          <div className="p-5 bg-white/80 dark:bg-neutral-950/40 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-900 rounded-xl space-y-3">
            <div className="flex flex-col md:flex-row items-center justify-around gap-2 font-mono text-[10px] text-center">
              <div className="p-2.5 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 rounded-lg w-full md:w-1/5">
                <strong className="text-gray-800 dark:text-gray-200 block font-bold">1. Render</strong>
                <span className="text-neutral-500 dark:text-neutral-400">Evaluate JSX layout</span>
              </div>
              <ArrowRight className="h-4.5 w-4.5 text-sky-500 hidden md:block" />
              <div className="p-2.5 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 rounded-lg w-full md:w-1/5">
                <strong className="text-gray-800 dark:text-gray-200 block font-bold">2. Paint DOM</strong>
                <span className="text-neutral-500 dark:text-neutral-400">Browser updates UI</span>
              </div>
              <ArrowRight className="h-4.5 w-4.5 text-sky-500 hidden md:block" />
              <div className="p-2.5 bg-sky-500/5 border border-sky-500/25 rounded-lg w-full md:w-1/5 shadow-sm">
                <strong className="text-sky-500 block font-black">3. Run Effect</strong>
                <span className="text-neutral-500 dark:text-neutral-400">Run callback side-effects</span>
              </div>
              <ArrowRight className="h-4.5 w-4.5 text-sky-500 hidden md:block" />
              <div className="p-2.5 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 rounded-lg w-full md:w-1/5">
                <strong className="text-gray-800 dark:text-gray-200 block font-bold">4. Cleanup</strong>
                <span className="text-red-500 font-bold">Clear before next run</span>
              </div>
            </div>
          </div>
        </div>
      );

    case 'react_perf':
      return (
        <div className="space-y-3">
          <span className="block text-[10px] font-black text-slate-450 uppercase tracking-widest font-mono">
            useMemo vs useCallback Selection Matrix
          </span>
          <div className="p-5 bg-white/80 dark:bg-neutral-950/40 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-900 rounded-xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center font-mono text-[10.5px]">
              <div className="p-4 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 bg-white dark:bg-neutral-950 rounded-xl space-y-2">
                <span className="px-2 py-0.5 bg-sky-500/10 text-sky-500 text-[8.5px] font-bold uppercase rounded inline-block">useMemo</span>
                <p className="text-[10px] text-gray-550 dark:text-gray-350">Memoizes value outputs (caching computation results).</p>
                <p className="text-[9.5px] text-gray-400">Usage: Caching filtered lists or complex arithmetic calculations.</p>
              </div>
              <div className="p-4 border border-sky-500/25 bg-sky-500/5 rounded-xl space-y-2 text-sky-500 font-bold">
                <span className="px-2 py-0.5 bg-sky-500 text-white text-[8.5px] font-bold uppercase rounded inline-block">useCallback</span>
                <p className="text-[10px] text-neutral-700 dark:text-neutral-300">Memoizes function references (preserving memory addresses).</p>
                <p className="text-[9.5px] text-gray-450">Usage: Passing stable callback props to React.memo children.</p>
              </div>
            </div>
          </div>
        </div>
      );

    case 'react_routing_state':
      return (
        <div className="space-y-3">
          <span className="block text-[10px] font-black text-slate-450 uppercase tracking-widest font-mono">
            State Management Tool Profiles Comparison
          </span>
          <div className="p-5 bg-white/80 dark:bg-neutral-950/40 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-900 rounded-xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center font-mono text-[10.5px]">
              <div className="p-4 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 bg-white dark:bg-neutral-950 rounded-xl space-y-2">
                <span className="px-2 py-0.5 bg-sky-500/10 text-sky-500 text-[8px] font-bold uppercase rounded inline-block">Context API</span>
                <p className="text-[10px] text-gray-500">Frequency: 🔴 Low (Theme, Auth)</p>
                <p className="text-[9px] text-gray-400">Triggers re-render for all consumers on value change.</p>
              </div>
              <div className="p-4 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 bg-white dark:bg-neutral-950 rounded-xl space-y-2">
                <span className="px-2 py-0.5 bg-sky-500/10 text-sky-500 text-[8px] font-bold uppercase rounded inline-block">Zustand</span>
                <p className="text-[10px] text-gray-500">Frequency: 🟢 High (Cart, Filters)</p>
                <p className="text-[9px] text-gray-400">Simple hooks with selector-driven surgical updates.</p>
              </div>
              <div className="p-4 border border-sky-500/25 bg-sky-500/5 rounded-xl space-y-2 text-sky-500 font-bold">
                <span className="px-2 py-0.5 bg-sky-500 text-white text-[8px] font-bold uppercase rounded inline-block">Redux Toolkit</span>
                <p className="text-[10px] text-neutral-700 dark:text-neutral-300">Frequency: 🟢 High (Enterprise)</p>
                <p className="text-[9px] text-gray-400">Unidirectional flow, global actions, devtools log traces.</p>
              </div>
            </div>
          </div>
        </div>
      );

    case 'react_testing':
      return (
        <div className="space-y-3">
          <span className="block text-[10px] font-black text-slate-450 uppercase tracking-widest font-mono">
            React Testing Library Query Priority Flow
          </span>
          <div className="p-5 bg-white/80 dark:bg-neutral-950/40 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-900 rounded-xl space-y-3">
            <div className="flex flex-col md:flex-row items-center justify-around gap-2 font-mono text-[10px] text-center">
              <div className="p-2.5 bg-sky-500/5 border border-sky-500/25 rounded-lg w-full md:w-1/3 shadow-sm">
                <strong className="text-sky-500 block font-black">1. Accessible to All</strong>
                <span className="text-neutral-500 dark:text-neutral-400">getByRole, getByLabelText, getByText</span>
              </div>
              <ArrowRight className="h-4.5 w-4.5 text-sky-500 hidden md:block" />
              <div className="p-2.5 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 rounded-lg w-full md:w-1/3">
                <strong className="text-gray-800 dark:text-gray-200 block font-bold">2. Semantic HTML</strong>
                <span className="text-neutral-500 dark:text-neutral-400">getByAltText, getByTitle</span>
              </div>
              <ArrowRight className="h-4.5 w-4.5 text-sky-500 hidden md:block" />
              <div className="p-2.5 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 rounded-lg w-full md:w-1/3">
                <strong className="text-gray-800 dark:text-gray-200 block font-bold">3. Test Escape Hatch</strong>
                <span className="text-red-500 font-bold">getByTestId (fallback only)</span>
              </div>
            </div>
          </div>
        </div>
      );

    case 'react_ssr_perf':
      return (
        <div className="space-y-3">
          <span className="block text-[10px] font-black text-slate-450 uppercase tracking-widest font-mono">
            React SSR Page Hydration Pipeline
          </span>
          <div className="p-5 bg-white/80 dark:bg-neutral-950/40 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-900 rounded-xl space-y-3">
            <div className="flex flex-col md:flex-row items-center justify-around gap-2 font-mono text-[10px] text-center">
              <div className="p-2.5 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 rounded-lg w-full md:w-1/4">
                <strong className="text-gray-800 dark:text-gray-200 block font-bold">1. Build Server HTML</strong>
                <span className="text-neutral-500 dark:text-neutral-400">Renders nodes to static layout</span>
              </div>
              <ArrowRight className="h-4.5 w-4.5 text-sky-500 hidden md:block" />
              <div className="p-2.5 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 rounded-lg w-full md:w-1/4">
                <strong className="text-gray-800 dark:text-gray-200 block font-bold">2. Send bytes to client</strong>
                <span className="text-neutral-500 dark:text-neutral-400">Fast visual paint (FCP)</span>
              </div>
              <ArrowRight className="h-4.5 w-4.5 text-sky-500 hidden md:block" />
              <div className="p-2.5 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 rounded-lg w-full md:w-1/4">
                <strong className="text-gray-800 dark:text-gray-200 block font-bold">3. Load JavaScript</strong>
                <span className="text-neutral-500 dark:text-neutral-400">Browser downloads bundles</span>
              </div>
              <ArrowRight className="h-4.5 w-4.5 text-sky-500 hidden md:block" />
              <div className="p-2.5 bg-sky-500/5 border border-sky-500/25 rounded-lg w-full md:w-1/4 shadow-sm">
                <strong className="text-sky-500 block font-black">4. Hydration Active</strong>
                <span className="text-neutral-500 dark:text-neutral-400">React binds handlers to HTML</span>
              </div>
            </div>
          </div>
        </div>
      );

    default:
      return null;
  }
};

export default function ReactCard({ data }) {
  const [expandedSubtopic, setExpandedSubtopic] = useState(0);

  return (
    <section 
      id={data.id}
      className="w-full bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-850 rounded-2xl p-6 md:p-8 shadow-xl transition-all duration-300 hover:border-sky-500/25 relative"
    >
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-neutral-200 dark:border-neutral-800 dark:border-neutral-800">
        <div className="flex items-center space-x-3">
          <span className="px-3 py-1 bg-sky-500/10 text-sky-500 text-[10px] font-black uppercase font-mono tracking-wider rounded-md">
            {data.num}
          </span>
          <h2 className="text-xl font-black text-gray-900 dark:text-white font-mono uppercase tracking-wide">
            {data.title}
          </h2>
        </div>
      </div>

      {/* Description */}
      <p className="text-base text-gray-755 dark:text-neutral-250 font-normal leading-relaxed mb-6">
        {data.desc}
      </p>

      {/* Render custom schematic diagram */}
      {data.internalImplementation && (
        <div className="mb-6">
          {renderDiagram(data.id)}
        </div>
      )}

      {/* Accordion List */}
      <div className="space-y-4">
        {data.subtopics && data.subtopics.map((sub, idx) => {
          const isExpanded = expandedSubtopic === idx;
          return (
            <div 
              key={idx}
              className="border border-neutral-200 dark:border-neutral-800 dark:border-neutral-900 rounded-xl overflow-hidden bg-white/10 dark:bg-neutral-900/10"
            >
              <button
                onClick={() => setExpandedSubtopic(isExpanded ? null : idx)}
                className="w-full px-5 py-4 flex items-center justify-between hover:bg-white/20 dark:hover:bg-neutral-900/30 transition-all font-mono text-left cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <span className="h-2 w-2 rounded-full bg-sky-500"></span>
                  <span className="text-sm font-bold text-gray-800 dark:text-gray-255">{sub.name}</span>
                </div>
                {isExpanded ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
              </button>

              {isExpanded && (
                <div className="p-6 border-t border-neutral-200 dark:border-neutral-800 dark:border-neutral-900 space-y-7 animate-fadeIn">
                  
                  {/* One-Liner Summary */}
                  <div className="p-5 bg-sky-500/[0.03] border-l-3 border-sky-500 text-neutral-805 dark:text-neutral-200 rounded-r-lg font-sans text-[14px] md:text-[15px] flex items-center space-x-3.5 leading-relaxed">
                    <Sparkles className="h-5 w-5 text-sky-500 flex-shrink-0" />
                    <div>
                      <span className="font-mono text-[10px] font-black text-sky-500 uppercase tracking-widest block mb-1">Interview One-Liner</span>
                      <blockquote className="italic text-neutral-700 dark:text-neutral-250">"{sub.oneLiner}"</blockquote>
                    </div>
                  </div>

                  {/* Core Conceptual Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-5 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-900 rounded-xl">
                      <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono mb-2">🎯 Interview Definition</span>
                      <p className="text-[14px] md:text-[15px] text-gray-700 dark:text-neutral-250 font-normal leading-relaxed">{sub.definition}</p>
                    </div>

                    <div className="p-5 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-900 rounded-xl">
                      <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono mb-2">❓ Why Do We Need It?</span>
                      <p className="text-[14px] md:text-[15px] text-gray-700 dark:text-neutral-250 font-normal leading-relaxed">{sub.whyNeed}</p>
                    </div>

                    <div className="p-5 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-900 rounded-xl">
                      <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono mb-2">🌍 Real World Example</span>
                      <p className="text-[14px] md:text-[15px] text-gray-700 dark:text-neutral-250 font-normal leading-relaxed">{sub.example}</p>
                    </div>

                    <div className="p-5 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-900 rounded-xl">
                      <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono mb-2">💻 SDE Perspective</span>
                      <p className="text-[14px] md:text-[15px] text-gray-700 dark:text-neutral-250 font-normal leading-relaxed">{sub.devPerspective}</p>
                    </div>
                  </div>

                  {/* Questions & Troubleshooting */}
                  <div className="space-y-5 pt-3 border-t border-dashed border-neutral-200 dark:border-neutral-800 dark:border-neutral-900">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono mb-3 flex items-center space-x-1.5">
                          <HelpCircle className="h-4 w-4 text-blue-500" />
                          <span>Interview Questions</span>
                        </span>
                        <ul className="space-y-2.5 text-[14px] md:text-[15px] text-neutral-700 dark:text-neutral-300 list-decimal pl-5">
                          {sub.questions.map((q, i) => <li key={i}>{q}</li>)}
                        </ul>
                      </div>

                      <div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono mb-3 flex items-center space-x-1.5">
                          <HelpCircle className="h-4 w-4 text-purple-500" />
                          <span>Important Follow-ups</span>
                        </span>
                        <ul className="space-y-2.5 text-[14px] md:text-[15px] text-neutral-700 dark:text-neutral-300 list-disc pl-5">
                          {sub.followups.map((f, i) => <li key={i}>{f}</li>)}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Confusions & Takeaways */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-neutral-200 dark:border-neutral-800 dark:border-neutral-900">
                    <div className="p-5 bg-amber-500/[0.02] border border-amber-500/10 rounded-xl">
                      <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest font-mono mb-2.5 flex items-center space-x-1.5">
                        <AlertTriangle className="h-4 w-4" />
                        <span>⚠️ Common Confusions</span>
                      </span>
                      <ul className="space-y-2 text-[14px] md:text-[15px] text-neutral-700 dark:text-neutral-300 list-disc pl-5">
                        {sub.confusions.map((c, i) => <li key={i}>{c}</li>)}
                      </ul>
                    </div>

                    <div className="p-5 bg-emerald-500/[0.02] border border-emerald-500/10 rounded-xl">
                      <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest font-mono mb-2.5 flex items-center space-x-1.5">
                        <CheckSquare className="h-4 w-4" />
                        <span>✅ Key Takeaways</span>
                      </span>
                      <ul className="space-y-2 text-[14px] md:text-[15px] text-neutral-700 dark:text-neutral-300 list-disc pl-5">
                        {sub.takeaways.map((t, i) => <li key={i}>{t}</li>)}
                      </ul>
                    </div>
                  </div>

                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
