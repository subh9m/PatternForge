import React, { useState } from 'react';
import { HelpCircle, AlertTriangle, CheckSquare, Sparkles, ChevronDown, ChevronUp, ArrowRight } from 'lucide-react';

const renderDiagram = (conceptId) => {
  switch (conceptId) {
    case 'spring_core':
      return (
        <div className="space-y-3">
          <span className="block text-[10px] font-black text-slate-450 uppercase tracking-widest font-mono">
            Spring IoC Container Lifecycle Stages
          </span>
          <div className="p-5 bg-neutral-50/60 dark:bg-neutral-950/40 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-900 rounded-xl space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-center font-mono text-[10.5px]">
              <div className="p-3 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 bg-white dark:bg-neutral-950 rounded-lg">
                <span className="px-1.5 py-0.2 bg-green-500/10 text-green-500 rounded block font-bold mb-1">1. Scan & Register</span>
                <span className="text-neutral-500 dark:text-neutral-400">Scans packages, registers BeanDefinitions.</span>
              </div>
              <div className="p-3 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 bg-white dark:bg-neutral-950 rounded-lg">
                <span className="px-1.5 py-0.2 bg-green-500/10 text-green-500 rounded block font-bold mb-1">2. Instantiate</span>
                <span className="text-neutral-500 dark:text-neutral-400">Creates instances (new Class()).</span>
              </div>
              <div className="p-3 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 bg-white dark:bg-neutral-950 rounded-lg">
                <span className="px-1.5 py-0.2 bg-green-500/10 text-green-500 rounded block font-bold mb-1">3. Wire & Inject</span>
                <span className="text-neutral-500 dark:text-neutral-400">Injects constructor or setter values.</span>
              </div>
              <div className="p-3 border border-green-500/25 bg-green-500/5 rounded-lg text-green-500 font-bold shadow-sm">
                <span className="px-1.5 py-0.2 bg-green-500 text-white rounded block font-bold mb-1">4. Initialize</span>
                <span className="text-neutral-700 dark:text-neutral-300">Runs @PostConstruct callbacks.</span>
              </div>
            </div>
          </div>
        </div>
      );

    case 'spring_lifecycle':
      return (
        <div className="space-y-3">
          <span className="block text-[10px] font-black text-slate-450 uppercase tracking-widest font-mono">
            Spring Bean Initialization Pipeline
          </span>
          <div className="p-5 bg-neutral-50/60 dark:bg-neutral-950/40 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-900 rounded-xl space-y-3">
            <div className="flex flex-col md:flex-row items-center justify-around gap-2 font-mono text-[10px] text-center">
              <div className="p-2.5 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 rounded-lg w-full md:w-1/5">
                <strong className="text-gray-800 dark:text-gray-200 block font-bold">1. Constructor</strong>
                <span className="text-neutral-500 dark:text-neutral-400">Instantiation</span>
              </div>
              <ArrowRight className="h-4.5 w-4.5 text-green-500 hidden md:block" />
              <div className="p-2.5 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 rounded-lg w-full md:w-1/5">
                <strong className="text-gray-800 dark:text-gray-200 block font-bold">2. Setters / DI</strong>
                <span className="text-green-500">Inject dependencies</span>
              </div>
              <ArrowRight className="h-4.5 w-4.5 text-green-500 hidden md:block" />
              <div className="p-2.5 bg-green-500/5 border border-green-500/25 rounded-lg w-full md:w-1/5 shadow-sm">
                <strong className="text-green-500 block font-black">3. Post-Construct</strong>
                <span className="text-neutral-500 dark:text-neutral-400">@PostConstruct logic</span>
              </div>
              <ArrowRight className="h-4.5 w-4.5 text-green-500 hidden md:block" />
              <div className="p-2.5 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 rounded-lg w-full md:w-1/5">
                <strong className="text-gray-800 dark:text-gray-200 block font-bold">4. Destruction</strong>
                <span className="text-red-500">@PreDestroy triggers</span>
              </div>
            </div>
          </div>
        </div>
      );

    case 'spring_mvc':
      return (
        <div className="space-y-3">
          <span className="block text-[10px] font-black text-slate-450 uppercase tracking-widest font-mono">
            DispatcherServlet Routing Flow Pipeline
          </span>
          <div className="p-5 bg-neutral-50/60 dark:bg-neutral-950/40 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-900 rounded-xl space-y-4">
            <div className="flex flex-col space-y-3 font-mono text-[10.5px]">
              <div className="p-3 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 rounded-xl flex items-start space-x-3">
                <span className="px-1.5 py-0.2 bg-green-500/10 text-green-500 rounded">1. Intercept</span>
                <span className="text-neutral-600 dark:text-neutral-450">HTTP Request arrives at DispatcherServlet (Front Controller).</span>
              </div>
              <div className="p-3 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 rounded-xl flex items-start space-x-3">
                <span className="px-1.5 py-0.2 bg-green-500/10 text-green-500 rounded">2. Resolve</span>
                <span className="text-neutral-600 dark:text-neutral-450">DispatcherServlet queries HandlerMapping to locate the correct controller method.</span>
              </div>
              <div className="p-3 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 rounded-xl flex items-start space-x-3">
                <span className="px-1.5 py-0.2 bg-green-500/10 text-green-500 rounded">3. Execute</span>
                <span className="text-neutral-600 dark:text-neutral-450">HandlerAdapter runs the controller method, validating parameters (@Valid).</span>
              </div>
              <div className="p-3 bg-green-500/5 border border-green-500/25 rounded-xl flex items-start space-x-3">
                <span className="px-1.5 py-0.2 bg-green-500 text-white rounded font-bold">4. Serialize</span>
                <span className="text-neutral-700 dark:text-neutral-300 font-bold">HttpMessageConverter converts Java return POJO directly to HTTP JSON stream.</span>
              </div>
            </div>
          </div>
        </div>
      );

    case 'spring_boot':
      return (
        <div className="space-y-3">
          <span className="block text-[10px] font-black text-slate-450 uppercase tracking-widest font-mono">
            @SpringBootApplication Composite Metadata
          </span>
          <div className="p-5 bg-neutral-50/60 dark:bg-neutral-950/40 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-900 rounded-xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center font-mono text-[10.5px]">
              <div className="p-4 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 bg-white dark:bg-neutral-950 rounded-xl space-y-2">
                <span className="px-2 py-0.5 bg-green-500/10 text-green-500 text-[8px] font-bold uppercase rounded inline-block">@SpringBootConfiguration</span>
                <p className="text-[10px] text-gray-500">Declares the class as a configuration source containing additional bean definitions.</p>
              </div>
              <div className="p-4 border border-green-500/25 bg-green-500/5 rounded-xl space-y-2 text-green-500 font-bold">
                <span className="px-2 py-0.5 bg-green-500 text-white text-[8px] font-bold uppercase rounded inline-block">@EnableAutoConfiguration</span>
                <p className="text-[10px] text-gray-700 dark:text-gray-350">Triggers auto-config engine conditionally using conditional properties on classpath.</p>
              </div>
              <div className="p-4 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 bg-white dark:bg-neutral-950 rounded-xl space-y-2">
                <span className="px-2 py-0.5 bg-green-500/10 text-green-500 text-[8px] font-bold uppercase rounded inline-block">@ComponentScan</span>
                <p className="text-[10px] text-gray-500">Scans all components, repositories, and services in base class packages downward.</p>
              </div>
            </div>
          </div>
        </div>
      );

    case 'spring_data':
      return (
        <div className="space-y-3">
          <span className="block text-[10px] font-black text-slate-450 uppercase tracking-widest font-mono">
            JPA Entity Lifecycle State Transitions
          </span>
          <div className="p-5 bg-neutral-50/60 dark:bg-neutral-950/40 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-900 rounded-xl overflow-x-auto">
            <table className="w-full text-left font-mono text-[10.5px] border-collapse min-w-[500px]">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 text-gray-450">
                  <th className="py-2 pr-4 font-black uppercase">JPA Entity State</th>
                  <th className="py-2 px-4 font-black uppercase">EntityManager Binding</th>
                  <th className="py-2 pl-4 font-black uppercase">Database Synchronization</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-250 dark:divide-neutral-900 text-neutral-700 dark:text-neutral-300">
                <tr>
                  <td className="py-2 pr-4">Transient</td>
                  <td className="py-2 px-4 text-red-500 font-bold">Unbound</td>
                  <td className="py-2 pl-4 text-gray-400">None (not in DB yet)</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4">Managed</td>
                  <td className="py-2 px-4 text-green-500 font-bold">Bound to PersistenceContext</td>
                  <td className="py-2 pl-4 text-emerald-500">Auto-flushed on commit or query execution</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4">Detached</td>
                  <td className="py-2 px-4 text-amber-500 font-bold">Session Closed / Evicted</td>
                  <td className="py-2 pl-4 text-gray-400">Changes ignored unless merged back</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4">Removed</td>
                  <td className="py-2 px-4 text-red-500 font-bold">Flagged for Deletion</td>
                  <td className="py-2 pl-4 text-gray-400">Deleted from table on transaction flush</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      );

    case 'spring_testing':
      return (
        <div className="space-y-3">
          <span className="block text-[10px] font-black text-slate-450 uppercase tracking-widest font-mono">
            Spring Testing Layer Comparison
          </span>
          <div className="p-5 bg-neutral-50/60 dark:bg-neutral-950/40 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-900 rounded-xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center font-mono text-[10.5px]">
              <div className="p-4 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 bg-white dark:bg-neutral-950 rounded-xl space-y-2">
                <span className="px-2 py-0.5 bg-green-500/10 text-green-500 text-[8px] font-bold uppercase rounded inline-block">Unit Test (Mockito)</span>
                <p className="text-[10px] text-gray-500">Speed: 🚀 Ultra Fast (~ms)</p>
                <p className="text-[9px] text-gray-400">Loads NO context. Stub outputs using pure Mockito extensions.</p>
              </div>
              <div className="p-4 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 bg-white dark:bg-neutral-950 rounded-xl space-y-2">
                <span className="px-2 py-0.5 bg-green-500/10 text-green-500 text-[8px] font-bold uppercase rounded inline-block">Slice Test (@WebMvcTest)</span>
                <p className="text-[10px] text-gray-500">Speed: ⚡ Fast (~100ms)</p>
                <p className="text-[9px] text-gray-400">Loads partial layer beans. Tests controllers or db mapping queries.</p>
              </div>
              <div className="p-4 border border-green-500/25 bg-green-500/5 rounded-xl space-y-2 text-green-500 font-bold">
                <span className="px-2 py-0.5 bg-green-500 text-white text-[8px] font-bold uppercase rounded inline-block">Integration Test (@SpringBootTest)</span>
                <p className="text-[10px] text-neutral-700 dark:text-neutral-300">Speed: 🐢 Slower (~seconds)</p>
                <p className="text-[9px] text-gray-400">Loads full context. Runs real API paths using Testcontainers.</p>
              </div>
            </div>
          </div>
        </div>
      );

    case 'spring_aop':
      return (
        <div className="space-y-3">
          <span className="block text-[10px] font-black text-slate-450 uppercase tracking-widest font-mono">
            Spring AOP Runtime Proxy Flow
          </span>
          <div className="p-5 bg-neutral-50/60 dark:bg-neutral-950/40 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-900 rounded-xl space-y-3">
            <div className="flex flex-col md:flex-row items-center justify-around gap-2 font-mono text-[10px] text-center">
              <div className="p-2.5 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 rounded-lg w-full md:w-1/4">
                <strong className="text-gray-800 dark:text-gray-200 block font-bold">1. Caller</strong>
                <span className="text-neutral-500 dark:text-neutral-400">Requests bean method</span>
              </div>
              <ArrowRight className="h-4.5 w-4.5 text-green-500 hidden md:block" />
              <div className="p-2.5 bg-green-500/5 border border-green-500/25 rounded-lg w-full md:w-1/4 shadow-sm">
                <strong className="text-green-500 block font-black">2. Spring Proxy</strong>
                <span className="text-neutral-500 dark:text-neutral-400">JDK dynamic / CGLIB wrapper</span>
              </div>
              <ArrowRight className="h-4.5 w-4.5 text-green-500 hidden md:block" />
              <div className="p-2.5 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 rounded-lg w-full md:w-1/4">
                <strong className="text-gray-800 dark:text-gray-200 block font-bold">3. Aspect Advice</strong>
                <span className="text-purple-500 font-bold">Runs custom Aspects</span>
              </div>
              <ArrowRight className="h-4.5 w-4.5 text-green-500 hidden md:block" />
              <div className="p-2.5 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 rounded-lg w-full md:w-1/4">
                <strong className="text-gray-800 dark:text-gray-200 block font-bold">4. Target Bean</strong>
                <span className="text-gray-450">Executes real code</span>
              </div>
            </div>
            <div className="p-3 bg-amber-500/5 border border-amber-500/25 rounded-lg text-center font-mono text-[9.5px] text-amber-500">
              ⚠️ <strong>Proxy Limitation:</strong> Intra-class calls (self-invocation) bypass the proxy completely, disabling @Transactional, @Async, and @Cacheable!
            </div>
          </div>
        </div>
      );

    default:
      return null;
  }
};

export default function SpringCard({ data }) {
  const [expandedSubtopic, setExpandedSubtopic] = useState(0);

  return (
    <section 
      id={data.id}
      className="w-full bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-850 rounded-2xl p-6 md:p-8 shadow-xl transition-all duration-300 hover:border-green-500/25 relative"
    >
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-neutral-200 dark:border-neutral-800 dark:border-neutral-800">
        <div className="flex items-center space-x-3">
          <span className="px-3 py-1 bg-green-500/10 text-green-500 text-[10px] font-black uppercase font-mono tracking-wider rounded-md">
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

      {/* Pipeline execution diagram */}
      {data.internalImplementation && (
        <div className="mb-6">
          {renderDiagram(data.id)}
        </div>
      )}

      {/* Subtopics Listing */}
      <div className="space-y-4">
        {data.subtopics && data.subtopics.map((sub, idx) => {
          const isExpanded = expandedSubtopic === idx;
          return (
            <div 
              key={idx}
              className="border border-neutral-200 dark:border-neutral-800 dark:border-neutral-900 rounded-xl overflow-hidden bg-neutral-100/10 dark:bg-neutral-900/10"
            >
              {/* Accordion Toggle */}
              <button
                onClick={() => setExpandedSubtopic(isExpanded ? null : idx)}
                className="w-full px-5 py-4 flex items-center justify-between hover:bg-neutral-100/20 dark:hover:bg-neutral-900/30 transition-all font-mono text-left cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <span className="h-2 w-2 rounded-full bg-green-500"></span>
                  <span className="text-sm font-bold text-neutral-800 dark:text-neutral-200">{sub.name}</span>
                </div>
                {isExpanded ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
              </button>

              {/* Accordion Content */}
              {isExpanded && (
                <div className="p-5 border-t border-neutral-200 dark:border-neutral-800 dark:border-neutral-900 space-y-6 animate-fadeIn">
                  
                  {/* Highlighted One-Liner */}
                  <div className="p-3.5 bg-green-500/[0.03] border-l-3 border-green-500 text-neutral-700 dark:text-neutral-300 rounded-r-lg font-sans text-xs flex items-center space-x-3 leading-relaxed">
                    <Sparkles className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <div>
                      <span className="font-mono text-[9px] font-black text-green-500 uppercase tracking-widest block mb-0.5">Interview One-Liner</span>
                      <blockquote className="italic">"{sub.oneLiner}"</blockquote>
                    </div>
                  </div>

                  {/* Core Conceptual Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Definition */}
                    <div className="p-4 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-900 rounded-xl">
                      <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest font-mono mb-1.5">🎯 Interview Definition</span>
                      <p className="text-xs text-gray-600 dark:text-gray-300 font-light leading-relaxed">{sub.definition}</p>
                    </div>

                    {/* Why Need */}
                    <div className="p-4 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-900 rounded-xl">
                      <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest font-mono mb-1.5">❓ Why Do We Need It?</span>
                      <p className="text-xs text-gray-600 dark:text-gray-300 font-light leading-relaxed">{sub.whyNeed}</p>
                    </div>

                    {/* Real World Example */}
                    <div className="p-4 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-900 rounded-xl">
                      <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest font-mono mb-1.5">🌍 Real World Example</span>
                      <p className="text-xs text-gray-600 dark:text-gray-300 font-light leading-relaxed">{sub.example}</p>
                    </div>

                    {/* Developer Perspective */}
                    <div className="p-4 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-900 rounded-xl">
                      <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest font-mono mb-1.5">💻 SDE Perspective</span>
                      <p className="text-xs text-gray-600 dark:text-gray-300 font-light leading-relaxed">{sub.devPerspective}</p>
                    </div>
                  </div>

                  {/* Questions & Troubleshooting */}
                  <div className="space-y-4 pt-2 border-t border-dashed border-neutral-200 dark:border-neutral-800 dark:border-neutral-900">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* Interview Questions */}
                      <div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono mb-3 flex items-center space-x-1.5">
                          <HelpCircle className="h-3.5 w-3.5 text-blue-500" />
                          <span>Interview Questions</span>
                        </span>
                        <ul className="space-y-2 text-xs text-neutral-600 dark:text-neutral-400 list-decimal pl-4">
                          {sub.questions.map((q, i) => <li key={i}>{q}</li>)}
                        </ul>
                      </div>

                      {/* Follow-up Questions */}
                      <div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono mb-3 flex items-center space-x-1.5">
                          <HelpCircle className="h-3.5 w-3.5 text-purple-500" />
                          <span>Important Follow-ups</span>
                        </span>
                        <ul className="space-y-2 text-xs text-neutral-600 dark:text-neutral-400 list-disc pl-4">
                          {sub.followups.map((f, i) => <li key={i}>{f}</li>)}
                        </ul>
                      </div>

                    </div>
                  </div>

                  {/* Common Confusions & Key Takeaways */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-neutral-200 dark:border-neutral-800 dark:border-neutral-900">
                    {/* Common Confusions */}
                    <div className="p-4 bg-amber-500/[0.02] border border-amber-500/10 rounded-xl">
                      <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest font-mono mb-2 flex items-center space-x-1.5">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        <span>⚠️ Common Confusions</span>
                      </span>
                      <ul className="space-y-1.5 text-xs text-neutral-600 dark:text-neutral-400 list-disc pl-4">
                        {sub.confusions.map((c, i) => <li key={i}>{c}</li>)}
                      </ul>
                    </div>

                    {/* Key Takeaways */}
                    <div className="p-4 bg-emerald-500/[0.02] border border-emerald-500/10 rounded-xl">
                      <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest font-mono mb-2 flex items-center space-x-1.5">
                        <CheckSquare className="h-3.5 w-3.5" />
                        <span>✅ Key Takeaways</span>
                      </span>
                      <ul className="space-y-1.5 text-xs text-neutral-600 dark:text-neutral-400 list-disc pl-4">
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
