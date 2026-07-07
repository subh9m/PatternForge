import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function ProjectsCard({ data, activeTab }) {
  const [expandedQa, setExpandedQa] = useState(null);
  const [expandedTech, setExpandedTech] = useState(null);

  const toggleQa = (idx) => {
    setExpandedQa(expandedQa === idx ? null : idx);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Active Section Renderer */}
      {activeTab === 'overview' && (
        <section className="bg-white/60 dark:bg-black/60 backdrop-blur-md border border-gray-255 dark:border-[#333] rounded-2xl p-6 md:p-8 shadow-xl space-y-6">
          <div className="border-b border-gray-150 dark:border-[#333] pb-4">
            <span className="px-2 py-0.5 bg-fuchsia-500/10 text-fuchsia-500 text-[9px] font-mono font-black uppercase rounded">System Overview</span>
            <h2 className="text-xl font-black text-gray-900 dark:text-white font-mono uppercase tracking-wide mt-1.5">{data.title} Architecture</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 border border-gray-200 dark:border-neutral-900 rounded-xl bg-white/40 dark:bg-neutral-950/20 space-y-2">
              <span className="text-[10px] font-mono font-bold text-fuchsia-500 uppercase tracking-wider block">⚠️ Problem Statement</span>
              <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed font-light">{data.overview.problem}</p>
            </div>
            
            <div className="p-5 border border-gray-200 dark:border-neutral-900 rounded-xl bg-white/40 dark:bg-neutral-950/20 space-y-2">
              <span className="text-[10px] font-mono font-bold text-fuchsia-500 uppercase tracking-wider block">🎯 Real-World Use Case</span>
              <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed font-light">{data.overview.useCase}</p>
            </div>

            <div className="p-5 border border-gray-200 dark:border-neutral-900 rounded-xl bg-white/40 dark:bg-neutral-950/20 space-y-2">
              <span className="text-[10px] font-mono font-bold text-fuchsia-500 uppercase tracking-wider block">💡 Core Motivation</span>
              <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed font-light">{data.overview.motivation}</p>
            </div>

            <div className="p-5 border border-gray-200 dark:border-neutral-900 rounded-xl bg-white/40 dark:bg-neutral-950/20 space-y-2">
              <span className="text-[10px] font-mono font-bold text-fuchsia-500 uppercase tracking-wider block">🏗️ Architecture Blueprint</span>
              <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed font-light">{data.overview.architecture}</p>
            </div>
          </div>

          {/* End-to-End Walkthrough */}
          <div className="p-5 border border-fuchsia-500/25 bg-fuchsia-500/5 rounded-xl space-y-4">
            <span className="text-[10px] font-mono font-black text-fuchsia-500 uppercase tracking-widest block">⚡ request lifecycle: marking item as used</span>
            <ol className="list-decimal pl-4 space-y-2 text-xs text-gray-600 dark:text-gray-350 leading-relaxed">
              <li><strong>UI Interaction:</strong> User clicks "Used" in the browser (React 19). The <code>useMutation</code> hook triggers state queries.</li>
              <li><strong>Interceptor Authorization:</strong> Axios interceptors capture the request, reading the token from <code>localStorage</code> to inject the <code>Authorization: Bearer</code> header.</li>
              <li><strong>Spring filter gate:</strong> Tomcat routes request payload to backend. The <code>JwtAuthenticationFilter</code> extracts security claims and validates token signatures.</li>
              <li><strong>Controller Resolution:</strong> Request payload maps to <code>PantryController.useItem()</code> injection arguments.</li>
              <li><strong>Transactional service logic:</strong> The method invokes <code>PantryService</code> under a active <code>@Transactional</code> context, fetching the entity and checking ownership.</li>
              <li><strong>Dirty snapshot write:</strong> Hibernate ORM maps state changes. When transaction exits, Hibernate automatically flushes <code>UPDATE</code> SQL queries to PostgreSQL.</li>
              <li><strong>UI Cache Sync:</strong> Client receives HTTP 200, updating the React query cache, which triggers localized visual render refreshes.</li>
            </ol>
          </div>
        </section>
      )}

      {activeTab === 'tech_stack' && (
        <section className="bg-white/60 dark:bg-black/60 backdrop-blur-md border border-gray-255 dark:border-[#333] rounded-2xl p-6 md:p-8 shadow-xl space-y-6">
          <div className="border-b border-gray-150 dark:border-[#333] pb-4">
            <span className="px-2 py-0.5 bg-fuchsia-500/10 text-fuchsia-500 text-[9px] font-mono font-black uppercase rounded">Technical Stack</span>
            <h2 className="text-xl font-black text-gray-900 dark:text-white font-mono uppercase tracking-wide mt-1.5">Stack Details</h2>
            <p className="text-xs text-gray-500 mt-1 font-sans">Click on any core framework/library below to expand L5-level architectural summaries and technical rationale.</p>
          </div>

          <div className="space-y-4">
            {/* React 19 */}
            <div className="border border-gray-200 dark:border-neutral-900 rounded-xl overflow-hidden bg-gray-50/[0.15] dark:bg-neutral-900/10">
              <button
                onClick={() => setExpandedTech(expandedTech === 'react' ? null : 'react')}
                className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-55/20 dark:hover:bg-neutral-900/30 transition-all font-mono text-left cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <span className="h-2 w-2 rounded-full bg-sky-500"></span>
                  <span className="text-xs font-bold text-gray-800 dark:text-gray-255">React 19 & React Router v7 (Frontend Core)</span>
                </div>
                {expandedTech === 'react' ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
              </button>
              {expandedTech === 'react' && (
                <div className="p-5 border-t border-gray-200 dark:border-neutral-900 bg-white/50 dark:bg-black/40 text-xs text-gray-650 dark:text-gray-300 leading-relaxed font-sans space-y-2">
                  <p><strong>Rationale:</strong> Declarative rendering matching active state changes dynamically. Reusable modular design pattern using custom hooks to segregate layout logic from side effects.</p>
                  <p><strong>Internal Workings:</strong> Utilizes React's Fiber engine to batch rendering updates and schedule non-blocking updates. React Router handles path routing entirely client-side, avoiding server requests on tab transitions.</p>
                  <p><strong>Why Chosen:</strong> Blazing-fast virtual DOM reconciliation, excellent hydration controls, and a huge library ecosystem (TanStack Query, Recharts).</p>
                </div>
              )}
            </div>

            {/* TanStack Query */}
            <div className="border border-gray-200 dark:border-neutral-900 rounded-xl overflow-hidden bg-gray-50/[0.15] dark:bg-neutral-900/10">
              <button
                onClick={() => setExpandedTech(expandedTech === 'query' ? null : 'query')}
                className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-55/20 dark:hover:bg-neutral-900/30 transition-all font-mono text-left cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <span className="h-2 w-2 rounded-full bg-cyan-400"></span>
                  <span className="text-xs font-bold text-gray-800 dark:text-gray-255">TanStack Query / React Query (Remote State Engine)</span>
                </div>
                {expandedTech === 'query' ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
              </button>
              {expandedTech === 'query' && (
                <div className="p-5 border-t border-gray-200 dark:border-neutral-900 bg-white/50 dark:bg-black/40 text-xs text-gray-650 dark:text-gray-300 leading-relaxed font-sans space-y-2">
                  <p><strong>Rationale:</strong> Manages remote server-state in-memory caches, removing boilerplate <code>useEffect</code> fetch loops.</p>
                  <p><strong>Internal Workings:</strong> Maintains an absolute client-side cache registry. Automatically triggers background refetches when window focus updates, when network reconnects, or when manual queries are invalidated via mutations.</p>
                  <p><strong>Why Chosen:</strong> Optimistic updates (immediate visual confirmation of checkoffs or removals) and robust loading/error wrappers built-in.</p>
                </div>
              )}
            </div>

            {/* Tesseract.js */}
            <div className="border border-gray-200 dark:border-neutral-900 rounded-xl overflow-hidden bg-gray-50/[0.15] dark:bg-neutral-900/10">
              <button
                onClick={() => setExpandedTech(expandedTech === 'tesseract' ? null : 'tesseract')}
                className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-55/20 dark:hover:bg-neutral-900/30 transition-all font-mono text-left cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <span className="h-2 w-2 rounded-full bg-fuchsia-400"></span>
                  <span className="text-xs font-bold text-gray-800 dark:text-gray-255">Tesseract.js (Client-Side OCR)</span>
                </div>
                {expandedTech === 'tesseract' ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
              </button>
              {expandedTech === 'tesseract' && (
                <div className="p-5 border-t border-gray-200 dark:border-neutral-900 bg-white/50 dark:bg-black/40 text-xs text-gray-650 dark:text-gray-300 leading-relaxed font-sans space-y-2">
                  <p><strong>Rationale:</strong> Allows client-side image character recognition directly in the browser, eliminating GPU/CPU intensive OCR loads on the server.</p>
                  <p><strong>Internal Workings:</strong> Loads compiled WebAssembly (WASM) packages containing the C++ engine. Spawns asynchronous Web Workers to process receipt images off the main thread, keeping the UI thread responsive.</p>
                  <p><strong>Why Chosen:</strong> Offline capability, zero cost per scan, and simple integration wrappers.</p>
                </div>
              )}
            </div>

            {/* Spring Boot 3.3.0 */}
            <div className="border border-gray-200 dark:border-neutral-900 rounded-xl overflow-hidden bg-gray-50/[0.15] dark:bg-neutral-900/10">
              <button
                onClick={() => setExpandedTech(expandedTech === 'spring' ? null : 'spring')}
                className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-55/20 dark:hover:bg-neutral-900/30 transition-all font-mono text-left cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <span className="h-2 w-2 rounded-full bg-green-500"></span>
                  <span className="text-xs font-bold text-gray-800 dark:text-gray-255">Spring Boot 3.3.0 & Spring Web (Backend Core)</span>
                </div>
                {expandedTech === 'spring' ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
              </button>
              {expandedTech === 'spring' && (
                <div className="p-5 border-t border-gray-200 dark:border-neutral-900 bg-white/50 dark:bg-black/40 text-xs text-gray-650 dark:text-gray-300 leading-relaxed font-sans space-y-2">
                  <p><strong>Rationale:</strong> Highly standardized enterprise MVC routing and inversion-of-control container.</p>
                  <p><strong>Internal Workings:</strong> Spawns an embedded Apache Tomcat servlet engine on port 8080. <code>DispatcherServlet</code> captures inbound REST routes and maps them to Controller handlers. Spring's IoC container instantiates and wires singletons using dependency injection.</p>
                  <p><strong>Why Chosen:</strong> Excellent multithreaded capacity, declarative configuration, and robust transactional boundaries.</p>
                </div>
              )}
            </div>

            {/* Spring Data JPA & Hibernate */}
            <div className="border border-gray-200 dark:border-neutral-900 rounded-xl overflow-hidden bg-gray-50/[0.15] dark:bg-neutral-900/10">
              <button
                onClick={() => setExpandedTech(expandedTech === 'jpa' ? null : 'jpa')}
                className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-55/20 dark:hover:bg-neutral-900/30 transition-all font-mono text-left cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <span className="h-2 w-2 rounded-full bg-emerald-450"></span>
                  <span className="text-xs font-bold text-gray-800 dark:text-gray-255">Spring Data JPA & Hibernate (Database ORM)</span>
                </div>
                {expandedTech === 'jpa' ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
              </button>
              {expandedTech === 'jpa' && (
                <div className="p-5 border-t border-gray-200 dark:border-neutral-900 bg-white/50 dark:bg-black/40 text-xs text-gray-650 dark:text-gray-300 leading-relaxed font-sans space-y-2">
                  <p><strong>Rationale:</strong> Decouples Java objects from physical SQL schema definitions, managing relationships cleanly.</p>
                  <p><strong>Internal Workings:</strong> Generates dynamic proxies for JPA interface repositories. Integrates Hibernate to snapshot active entities and flush database updates automatically at transaction boundaries via dirty checking.</p>
                  <p><strong>Why Chosen:</strong> Mitigates boilerplate SQL mapping, handles schema relations (One-to-Many cascade deletions), and optimizes transactions via connections pool caching.</p>
                </div>
              )}
            </div>

            {/* PostgreSQL */}
            <div className="border border-gray-200 dark:border-neutral-900 rounded-xl overflow-hidden bg-gray-50/[0.15] dark:bg-neutral-900/10">
              <button
                onClick={() => setExpandedTech(expandedTech === 'postgres' ? null : 'postgres')}
                className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-55/20 dark:hover:bg-neutral-900/30 transition-all font-mono text-left cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <span className="h-2 w-2 rounded-full bg-blue-600"></span>
                  <span className="text-xs font-bold text-gray-800 dark:text-gray-255">PostgreSQL & Flyway Migrations (Persistence Layer)</span>
                </div>
                {expandedTech === 'postgres' ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
              </button>
              {expandedTech === 'postgres' && (
                <div className="p-5 border-t border-gray-200 dark:border-neutral-900 bg-white/50 dark:bg-black/40 text-xs text-gray-650 dark:text-gray-300 leading-relaxed font-sans space-y-2">
                  <p><strong>Rationale:</strong> Reliable transactional persistence offering structured integrity checks.</p>
                  <p><strong>Internal Workings:</strong> Relational engine executing ACID-compliant B-Tree indexing. Flyway hooks compile migrations, executing incremental SQL versions from the database classpath before app boot to ensure repeatable builds.</p>
                  <p><strong>Why Chosen:</strong> Zero data loss reliability (WAL logging), foreign key checks, and clean composite index lookup performance.</p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {activeTab === 'patterns' && (
        <section className="bg-white/60 dark:bg-black/60 backdrop-blur-md border border-gray-255 dark:border-[#333] rounded-2xl p-6 md:p-8 shadow-xl space-y-6 animate-fadeIn">
          <div className="border-b border-gray-150 dark:border-[#333] pb-4">
            <span className="px-2 py-0.5 bg-fuchsia-500/10 text-fuchsia-500 text-[9px] font-mono font-black uppercase rounded">Architecture Patterns</span>
            <h2 className="text-xl font-black text-gray-900 dark:text-white font-mono uppercase tracking-wide mt-1.5">Design Patterns & OOP Concepts</h2>
            <p className="text-xs text-gray-500 mt-1 font-sans">Exhaustive architectural breakdown of software design principles and OOP contracts implemented in Verfalarm.</p>
          </div>

          <div className="space-y-8">
            {/* Design Patterns */}
            <div className="space-y-4">
              <h3 className="text-xs font-mono font-black text-fuchsia-500 uppercase tracking-widest border-b border-neutral-900 pb-2">📂 Creational, Structural & Behavioral Patterns</h3>
              <div className="grid grid-cols-1 gap-4">
                {data.patternsAndOops.designPatterns.map((pat, idx) => (
                  <div key={idx} className="p-5 border border-gray-200 dark:border-neutral-900 bg-white/40 dark:bg-neutral-950/20 rounded-xl space-y-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-900 pb-1.5">
                      <span className="text-xs font-bold text-gray-900 dark:text-white font-mono">{pat.name}</span>
                      <span className="text-[9px] bg-fuchsia-550/15 text-fuchsia-400 border border-fuchsia-550/20 px-1.5 py-0.5 rounded font-mono uppercase font-black">Pattern</span>
                    </div>
                    <div className="text-xs space-y-1.5">
                      <div><span className="text-gray-400 font-mono font-bold text-[10px] uppercase">Where:</span> <code className="bg-neutral-950 px-1.5 py-0.5 rounded text-fuchsia-300 font-mono text-[10.5px] border border-neutral-900">{pat.where}</code></div>
                      <div><span className="text-gray-400 font-mono font-bold text-[10px] uppercase">Why:</span> <span className="text-gray-650 dark:text-gray-300 font-light">{pat.why}</span></div>
                      <div className="pt-1.5 border-t border-neutral-900 text-gray-500 dark:text-neutral-500 flex items-center space-x-1.5 italic text-[11px]">
                        <span>💡 Analogy:</span>
                        <span>{pat.analogy}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* OOP Concepts */}
            <div className="space-y-4">
              <h3 className="text-xs font-mono font-black text-fuchsia-500 uppercase tracking-widest border-b border-neutral-900 pb-2">☕ Core Object-Oriented Programming (OOP) Principles</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.patternsAndOops.oopConcepts.map((oop, idx) => (
                  <div key={idx} className="p-5 border border-gray-200 dark:border-neutral-900 bg-white/40 dark:bg-neutral-950/20 rounded-xl flex flex-col justify-between space-y-3">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center border-b border-neutral-900 pb-1.5">
                        <span className="text-xs font-bold text-gray-900 dark:text-white font-mono">{oop.concept}</span>
                        <span className="text-[9px] bg-sky-500/10 text-sky-400 border border-sky-500/20 px-1.5 py-0.5 rounded font-mono uppercase font-black">OOP</span>
                      </div>
                      <div className="text-xs space-y-1.5 font-light">
                        <div><span className="text-gray-400 font-mono font-bold text-[9px] uppercase block mb-0.5">Where:</span> <code className="bg-neutral-950 px-1 py-0.5 rounded text-fuchsia-300 font-mono text-[10px] border border-neutral-900 block overflow-x-auto whitespace-pre-wrap">{oop.where}</code></div>
                        <p className="text-gray-650 dark:text-gray-300 pt-1">{oop.detail}</p>
                      </div>
                    </div>
                    <div className="border-t border-neutral-900 pt-2 text-[10px] text-gray-500 italic">
                      <span>💡 Analogy: {oop.analogy}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {activeTab === 'folders' && (
        <section className="bg-white/60 dark:bg-black/60 backdrop-blur-md border border-gray-255 dark:border-[#333] rounded-2xl p-6 md:p-8 shadow-xl space-y-6">
          <div className="border-b border-gray-150 dark:border-[#333] pb-4">
            <span className="px-2 py-0.5 bg-fuchsia-500/10 text-fuchsia-500 text-[9px] font-mono font-black uppercase rounded">Workspaces</span>
            <h2 className="text-xl font-black text-gray-900 dark:text-white font-mono uppercase tracking-wide mt-1.5">Directory Configurations</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Backend Tree */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider block">Backend Directory (/backend)</span>
              <div className="p-4 bg-neutral-950 border border-neutral-900 rounded-xl overflow-x-auto">
                <pre className="text-[10px] text-fuchsia-400 font-mono leading-relaxed whitespace-pre">
                  {data.workspaceTrees.backend.join('\n')}
                </pre>
              </div>
            </div>

            {/* Frontend Tree */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider block">Frontend Directory (/frontend)</span>
              <div className="p-4 bg-neutral-950 border border-neutral-900 rounded-xl overflow-x-auto">
                <pre className="text-[10px] text-fuchsia-400 font-mono leading-relaxed whitespace-pre">
                  {data.workspaceTrees.frontend.join('\n')}
                </pre>
              </div>
            </div>
          </div>
        </section>
      )}

      {activeTab === 'frontend' && (
        <section className="bg-white/60 dark:bg-black/60 backdrop-blur-md border border-gray-255 dark:border-[#333] rounded-2xl p-6 md:p-8 shadow-xl space-y-6">
          <div className="border-b border-gray-150 dark:border-[#333] pb-4">
            <span className="px-2 py-0.5 bg-fuchsia-500/10 text-fuchsia-500 text-[9px] font-mono font-black uppercase rounded">Frontend Deep Dive</span>
            <h2 className="text-xl font-black text-gray-900 dark:text-white font-mono uppercase tracking-wide mt-1.5">React Component Design</h2>
          </div>

          <div className="space-y-6">
            {data.deepDives.frontend.map((item, idx) => (
              <div key={idx} className="p-5 border border-gray-200 dark:border-neutral-900 bg-white/40 dark:bg-neutral-950/20 rounded-xl space-y-3">
                <div className="flex items-center justify-between border-b border-neutral-850 pb-2">
                  <strong className="text-sm font-mono text-gray-800 dark:text-gray-200">{item.file}</strong>
                  <span className="px-2 py-0.5 bg-fuchsia-500/10 text-fuchsia-500 text-[8px] font-mono font-black uppercase rounded">React Primitive</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-300 font-light"><strong className="font-semibold">Purpose:</strong> {item.purpose}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono pt-1 text-gray-500">
                  <div><strong>Hooks:</strong> {item.hooks}</div>
                  <div><strong>Lifecycle:</strong> {item.lifecycle}</div>
                </div>
                <div className="p-3 bg-neutral-100/60 dark:bg-neutral-900/30 border-l-2 border-slate-400 dark:border-neutral-700 rounded-r-lg text-xs leading-normal">
                  <span className="block text-[8px] font-mono text-slate-400 uppercase tracking-widest font-black mb-0.5">Performance optimizations</span>
                  <p className="text-gray-550 dark:text-gray-400 italic">{item.perfNotes}</p>
                </div>
                
                {/* Embedded QA Block */}
                <div className="pt-2 border-t border-dashed border-gray-200 dark:border-neutral-900">
                  <span className="text-[9px] font-mono font-bold text-fuchsia-500 uppercase tracking-wider block mb-1">Interview Prep QA</span>
                  <div className="bg-fuchsia-500/[0.02] border border-fuchsia-500/10 rounded-lg p-3 text-xs space-y-1.5">
                    <p className="font-bold text-gray-850 dark:text-gray-200">Q: {item.qa.q}</p>
                    <p className="text-gray-600 dark:text-gray-350 leading-relaxed font-light">{item.qa.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {activeTab === 'backend' && (
        <section className="bg-white/60 dark:bg-black/60 backdrop-blur-md border border-gray-255 dark:border-[#333] rounded-2xl p-6 md:p-8 shadow-xl space-y-6">
          <div className="border-b border-gray-150 dark:border-[#333] pb-4">
            <span className="px-2 py-0.5 bg-fuchsia-500/10 text-fuchsia-500 text-[9px] font-mono font-black uppercase rounded">Backend Deep Dive</span>
            <h2 className="text-xl font-black text-gray-900 dark:text-white font-mono uppercase tracking-wide mt-1.5">Spring Boot Architecture</h2>
          </div>

          <div className="space-y-6">
            {data.deepDives.backend.map((item, idx) => (
              <div key={idx} className="p-5 border border-gray-200 dark:border-neutral-900 bg-white/40 dark:bg-neutral-950/20 rounded-xl space-y-3">
                <div className="flex items-center justify-between border-b border-neutral-850 pb-2">
                  <strong className="text-sm font-mono text-gray-800 dark:text-gray-200">{item.file}</strong>
                  <span className="px-2 py-0.5 bg-fuchsia-500/10 text-fuchsia-500 text-[8px] font-mono font-black uppercase rounded">Spring Bean</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-300 font-light"><strong className="font-semibold">Purpose:</strong> {item.purpose}</p>
                
                {item.endpoints && (
                  <div className="text-xs font-mono">
                    <span className="text-[9px] text-gray-400 block uppercase mb-1">Endpoints Exponent</span>
                    <ul className="list-disc pl-4 text-fuchsia-400 space-y-0.5">
                      {item.endpoints.map((ep, i) => <li key={i}>{ep}</li>)}
                    </ul>
                  </div>
                )}

                {item.flow && <p className="text-xs font-mono text-gray-500"><strong>Call Flow:</strong> {item.flow}</p>}
                {item.caching && <p className="text-xs font-mono text-gray-500"><strong>Caching Details:</strong> {item.caching}</p>}
                {item.trigger && <p className="text-xs font-mono text-gray-500"><strong>Cron Trigger:</strong> {item.trigger}</p>}

                {/* Embedded QA Block */}
                <div className="pt-2 border-t border-dashed border-gray-200 dark:border-neutral-900">
                  <span className="text-[9px] font-mono font-bold text-fuchsia-500 uppercase tracking-wider block mb-1">Interview Prep QA</span>
                  <div className="bg-fuchsia-500/[0.02] border border-fuchsia-500/10 rounded-lg p-3 text-xs space-y-1.5">
                    <p className="font-bold text-gray-850 dark:text-gray-200">Q: {item.qa.q}</p>
                    <p className="text-gray-600 dark:text-gray-350 leading-relaxed font-light">{item.qa.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {activeTab === 'tradeoffs' && (
        <section className="bg-white/60 dark:bg-black/60 backdrop-blur-md border border-gray-255 dark:border-[#333] rounded-2xl p-6 md:p-8 shadow-xl space-y-6">
          <div className="border-b border-gray-150 dark:border-[#333] pb-4">
            <span className="px-2 py-0.5 bg-fuchsia-500/10 text-fuchsia-500 text-[9px] font-mono font-black uppercase rounded">Design Trade-offs</span>
            <h2 className="text-xl font-black text-gray-900 dark:text-white font-mono uppercase tracking-wide mt-1.5">Architectural Decisions</h2>
          </div>

          <div className="space-y-4">
            {data.designTradeoffs.map((item, idx) => (
              <div key={idx} className="p-5 border border-gray-200 dark:border-neutral-900 bg-white/40 dark:bg-neutral-950/20 rounded-xl space-y-2">
                <span className="text-sm font-mono font-bold text-gray-800 dark:text-gray-200 block border-b border-neutral-900 pb-1.5">{item.title}</span>
                <p className="text-xs text-gray-600 dark:text-gray-305 leading-relaxed font-light pt-1">{item.tradeoff}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {activeTab === 'qa' && (
        <section className="bg-white/60 dark:bg-black/60 backdrop-blur-md border border-gray-255 dark:border-[#333] rounded-2xl p-6 md:p-8 shadow-xl space-y-6">
          <div className="border-b border-gray-150 dark:border-[#333] pb-4">
            <span className="px-2 py-0.5 bg-fuchsia-500/10 text-fuchsia-500 text-[9px] font-mono font-black uppercase rounded">Systems Review</span>
            <h2 className="text-xl font-black text-gray-900 dark:text-white font-mono uppercase tracking-wide mt-1.5">L5 Technical Interview Prep</h2>
          </div>

          <div className="space-y-4">
            {data.interviewQA.map((item, idx) => {
              const isExpanded = expandedQa === idx;
              return (
                <div 
                  key={idx}
                  className="border border-gray-200 dark:border-neutral-900 rounded-xl overflow-hidden bg-gray-50/[0.15] dark:bg-neutral-900/10"
                >
                  <button
                    onClick={() => toggleQa(idx)}
                    className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-55/20 dark:hover:bg-neutral-900/30 transition-all font-mono text-left cursor-pointer"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="h-2 w-2 rounded-full bg-fuchsia-500"></span>
                      <span className="text-xs font-bold text-gray-800 dark:text-gray-255">Q: {item.q}</span>
                    </div>
                    {isExpanded ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
                  </button>

                  {isExpanded && (
                    <div className="p-5 border-t border-gray-200 dark:border-neutral-900 bg-white/50 dark:bg-black/40 text-xs text-gray-600 dark:text-gray-300 leading-relaxed font-light font-sans space-y-2">
                      <span className="block text-[8px] font-mono text-fuchsia-500 uppercase tracking-widest font-black">Google L5 Answer</span>
                      <p>{item.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

    </div>
  );
}
