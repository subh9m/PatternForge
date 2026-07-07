import React, { useState } from 'react';
import { HelpCircle, AlertTriangle, CheckSquare, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';

export default function AimlCard({ data }) {
  const [expandedSubtopic, setExpandedSubtopic] = useState(0);

  return (
    <section 
      id={data.id}
      className="w-full bg-white dark:bg-neutral-950 border border-gray-250 dark:border-[#222] rounded-2xl p-6 md:p-8 shadow-xl transition-all duration-300 hover:border-red-500/25 relative"
    >
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-150 dark:border-[#333]">
        <div className="flex items-center space-x-3">
          <span className="px-3 py-1 bg-red-500/10 text-red-500 text-[10px] font-black uppercase font-mono tracking-wider rounded-md">
            {data.num}
          </span>
          <h2 className="text-xl font-black text-gray-900 dark:text-white font-mono uppercase tracking-wide">
            {data.title}
          </h2>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 dark:text-gray-300 font-sans font-light leading-relaxed mb-6">
        {data.desc}
      </p>

      {/* ASCII Architecture Flowchart */}
      {data.internalImplementation && (
        <div className="mb-6">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono mb-2.5">
            Architecture / Compilation Pipeline
          </h4>
          <pre className="bg-gray-100/50 dark:bg-black/50 text-gray-800 dark:text-gray-300 p-5 font-mono text-xs overflow-x-auto border border-gray-200 dark:border-[#222] rounded-xl pr-14 leading-relaxed">
            <code>{data.internalImplementation}</code>
          </pre>
        </div>
      )}

      {/* Subtopics Listing */}
      <div className="space-y-4">
        {data.subtopics && data.subtopics.map((sub, idx) => {
          const isExpanded = expandedSubtopic === idx;
          return (
            <div 
              key={idx}
              className="border border-gray-200 dark:border-neutral-900 rounded-xl overflow-hidden bg-gray-50/[0.15] dark:bg-neutral-900/10"
            >
              {/* Accordion Toggle */}
              <button
                onClick={() => setExpandedSubtopic(isExpanded ? null : idx)}
                className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-55/20 dark:hover:bg-neutral-900/30 transition-all font-mono text-left cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <span className="h-2 w-2 rounded-full bg-red-500"></span>
                  <span className="text-sm font-bold text-gray-800 dark:text-gray-250">{sub.name}</span>
                </div>
                {isExpanded ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
              </button>

              {/* Accordion Content */}
              {isExpanded && (
                <div className="p-5 border-t border-gray-200 dark:border-neutral-900 space-y-6 animate-fadeIn">
                  
                  {/* Highlighted One-Liner */}
                  <div className="p-3.5 bg-red-500/[0.03] border-l-3 border-red-500 text-gray-700 dark:text-gray-300 rounded-r-lg font-sans text-xs flex items-center space-x-3 leading-relaxed">
                    <Sparkles className="h-4 w-4 text-red-500 flex-shrink-0" />
                    <div>
                      <span className="font-mono text-[9px] font-black text-red-500 uppercase tracking-widest block mb-0.5">Interview One-Liner</span>
                      <blockquote className="italic">"{sub.oneLiner}"</blockquote>
                    </div>
                  </div>

                  {/* Core Conceptual Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Definition */}
                    <div className="p-4 bg-white dark:bg-black border border-gray-200 dark:border-neutral-900 rounded-xl">
                      <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest font-mono mb-1.5">🎯 Interview Definition</span>
                      <p className="text-xs text-gray-600 dark:text-gray-300 font-light leading-relaxed">{sub.definition}</p>
                    </div>

                    {/* Why Need */}
                    <div className="p-4 bg-white dark:bg-black border border-gray-200 dark:border-neutral-900 rounded-xl">
                      <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest font-mono mb-1.5">❓ Why Do We Need It?</span>
                      <p className="text-xs text-gray-600 dark:text-gray-300 font-light leading-relaxed">{sub.whyNeed}</p>
                    </div>

                    {/* Real World Example */}
                    <div className="p-4 bg-white dark:bg-black border border-gray-200 dark:border-neutral-900 rounded-xl">
                      <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest font-mono mb-1.5">🌍 Real World Example</span>
                      <p className="text-xs text-gray-600 dark:text-gray-300 font-light leading-relaxed">{sub.example}</p>
                    </div>

                    {/* Developer Perspective */}
                    <div className="p-4 bg-white dark:bg-black border border-gray-200 dark:border-neutral-900 rounded-xl">
                      <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest font-mono mb-1.5">💻 SDE Perspective</span>
                      <p className="text-xs text-gray-600 dark:text-gray-300 font-light leading-relaxed">{sub.devPerspective}</p>
                    </div>
                  </div>

                  {/* Questions & Troubleshooting */}
                  <div className="space-y-4 pt-2 border-t border-dashed border-gray-200 dark:border-neutral-900">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* Interview Questions */}
                      <div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono mb-3 flex items-center space-x-1.5">
                          <HelpCircle className="h-3.5 w-3.5 text-blue-500" />
                          <span>Interview Questions</span>
                        </span>
                        <ul className="space-y-2 text-xs text-gray-600 dark:text-gray-350 list-decimal pl-4">
                          {sub.questions.map((q, i) => <li key={i}>{q}</li>)}
                        </ul>
                      </div>

                      {/* Follow-up Questions */}
                      <div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono mb-3 flex items-center space-x-1.5">
                          <HelpCircle className="h-3.5 w-3.5 text-purple-500" />
                          <span>Important Follow-ups</span>
                        </span>
                        <ul className="space-y-2 text-xs text-gray-600 dark:text-gray-350 list-disc pl-4">
                          {sub.followups.map((f, i) => <li key={i}>{f}</li>)}
                        </ul>
                      </div>

                    </div>
                  </div>

                  {/* Common Confusions & Key Takeaways */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-200 dark:border-neutral-900">
                    {/* Common Confusions */}
                    <div className="p-4 bg-amber-500/[0.02] border border-amber-500/10 rounded-xl">
                      <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest font-mono mb-2 flex items-center space-x-1.5">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        <span>⚠️ Common Confusions</span>
                      </span>
                      <ul className="space-y-1.5 text-xs text-gray-600 dark:text-gray-350 list-disc pl-4">
                        {sub.confusions.map((c, i) => <li key={i}>{c}</li>)}
                      </ul>
                    </div>

                    {/* Key Takeaways */}
                    <div className="p-4 bg-emerald-500/[0.02] border border-emerald-500/10 rounded-xl">
                      <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest font-mono mb-2 flex items-center space-x-1.5">
                        <CheckSquare className="h-3.5 w-3.5" />
                        <span>✅ Key Takeaways</span>
                      </span>
                      <ul className="space-y-1.5 text-xs text-gray-600 dark:text-gray-350 list-disc pl-4">
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
