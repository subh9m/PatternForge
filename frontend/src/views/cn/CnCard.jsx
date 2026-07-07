import React, { useState } from 'react';
import { HelpCircle, AlertTriangle, CheckSquare, Sparkles, ChevronDown, ChevronUp, ArrowRight } from 'lucide-react';

const renderDiagram = (conceptId) => {
  switch (conceptId) {
    case 'cn_fundamentals':
      return (
        <div className="space-y-3">
          <span className="block text-[10px] font-black text-slate-450 uppercase tracking-widest font-mono">
            Network Topology Schematics
          </span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 bg-neutral-50/60 dark:bg-neutral-950/40 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-900 rounded-xl">
            {/* Star Topology */}
            <div className="p-4 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 bg-white dark:bg-neutral-950 rounded-xl space-y-2 text-center">
              <span className="px-2 py-0.5 bg-cyan-500/10 text-cyan-500 text-[8px] font-mono font-black uppercase rounded inline-block">Star Topology</span>
              <div className="flex items-center justify-center h-20 relative font-mono text-[10px]">
                <div className="absolute top-2 left-2 p-1 border border-neutral-300 dark:border-neutral-800 rounded bg-white dark:bg-neutral-900">Node 1</div>
                <div className="absolute top-2 right-2 p-1 border border-neutral-300 dark:border-neutral-800 rounded bg-white dark:bg-neutral-900">Node 2</div>
                <div className="p-2 border border-cyan-500 bg-cyan-500/5 text-cyan-500 rounded-lg font-bold shadow-sm z-10">Hub / Switch</div>
                <div className="absolute bottom-2 left-2 p-1 border border-neutral-300 dark:border-neutral-800 rounded bg-white dark:bg-neutral-900">Node 3</div>
                <div className="absolute bottom-2 right-2 p-1 border border-neutral-300 dark:border-neutral-800 rounded bg-white dark:bg-neutral-900">Node 4</div>
              </div>
              <p className="text-[10px] text-gray-500 mt-1">Single central connector; failure in node is isolated, switch failure collapses network.</p>
            </div>

            {/* Mesh Topology */}
            <div className="p-4 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 bg-white dark:bg-neutral-950 rounded-xl space-y-2 text-center">
              <span className="px-2 py-0.5 bg-cyan-500/10 text-cyan-500 text-[8px] font-mono font-black uppercase rounded inline-block">Mesh Topology (Full)</span>
              <div className="flex items-center justify-center h-20 relative font-mono text-[10px]">
                <div className="absolute top-2 left-10 p-1 border border-cyan-500/30 rounded bg-white dark:bg-neutral-900">A</div>
                <div className="absolute top-10 left-2 p-1 border border-cyan-500/30 rounded bg-white dark:bg-neutral-900">B</div>
                <div className="absolute top-10 right-2 p-1 border border-cyan-500/30 rounded bg-white dark:bg-neutral-900">C</div>
                <div className="absolute bottom-2 left-10 p-1 border border-cyan-500/30 rounded bg-white dark:bg-neutral-900">D</div>
                <div className="text-[9px] text-cyan-500 font-bold z-10">[Fully Interconnected]</div>
              </div>
              <p className="text-[10px] text-gray-500 mt-1">Every node maps directly to all other nodes. Extremely redundant, high cabling cost.</p>
            </div>
          </div>
        </div>
      );

    case 'ip_addressing':
      return (
        <div className="space-y-3">
          <span className="block text-[10px] font-black text-slate-450 uppercase tracking-widest font-mono">
            Network Address Translation (NAT) Mapping
          </span>
          <div className="p-5 bg-neutral-50/60 dark:bg-neutral-950/40 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-900 rounded-xl space-y-3">
            <div className="flex flex-col sm:flex-row items-center justify-around gap-4 font-mono text-xs text-center">
              <div className="p-3 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 rounded-lg w-full sm:w-1/3">
                <strong className="text-gray-800 dark:text-gray-200 block">Private local IP</strong>
                <span className="text-[10.5px] text-emerald-500">192.168.1.10:8080</span>
              </div>
              
              <div className="flex flex-col items-center"><ArrowRight className="h-4 w-4 text-cyan-500" /></div>

              <div className="p-3 bg-cyan-500/5 border border-cyan-500/25 rounded-lg w-full sm:w-1/3 shadow-sm">
                <strong className="text-cyan-500 block font-bold">NAT Router</strong>
                <span className="text-[9.5px] text-gray-400">Maps IP + Port translation</span>
              </div>

              <div className="flex flex-col items-center"><ArrowRight className="h-4 w-4 text-cyan-500" /></div>

              <div className="p-3 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 rounded-lg w-full sm:w-1/3">
                <strong className="text-gray-800 dark:text-gray-200 block">Public Internet IP</strong>
                <span className="text-[10.5px] text-blue-500">203.0.113.5:1425</span>
              </div>
            </div>
          </div>
        </div>
      );

    case 'osi_tcpip':
      return (
        <div className="space-y-3">
          <span className="block text-[10px] font-black text-slate-450 uppercase tracking-widest font-mono">
            OSI 7-Layer vs TCP/IP 4-Layer Mapping
          </span>
          <div className="p-5 bg-neutral-50/60 dark:bg-neutral-950/40 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-900 rounded-xl overflow-x-auto">
            <table className="w-full text-left font-mono text-[10.5px] border-collapse min-w-[500px]">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 text-gray-450">
                  <th className="py-2 pr-4 font-black uppercase">OSI 7 Layers</th>
                  <th className="py-2 px-4 font-black uppercase">TCP/IP Layers</th>
                  <th className="py-2 pl-4 font-black uppercase">Data Unit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-250 dark:divide-neutral-900 text-neutral-700 dark:text-neutral-300">
                <tr>
                  <td className="py-2 pr-4">Application, Presentation, Session</td>
                  <td className="py-2 px-4 text-cyan-500 font-bold">Application</td>
                  <td className="py-2 pl-4 text-gray-400">Messages / Data</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4">Transport</td>
                  <td className="py-2 px-4 text-cyan-500 font-bold">Transport</td>
                  <td className="py-2 pl-4 text-emerald-500">Segments (TCP) / Datagrams (UDP)</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4">Network</td>
                  <td className="py-2 px-4 text-cyan-500 font-bold">Internet</td>
                  <td className="py-2 pl-4 text-blue-400">Packets (IP)</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4">Data Link, Physical</td>
                  <td className="py-2 px-4 text-cyan-500 font-bold">Network Access</td>
                  <td className="py-2 pl-4 text-purple-400">Frames (MAC) / Raw Bits</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      );

    case 'protocols_ports':
      return (
        <div className="space-y-3">
          <span className="block text-[10px] font-black text-slate-450 uppercase tracking-widest font-mono">
            DNS Domain Translation Lookup Flow
          </span>
          <div className="p-5 bg-neutral-50/60 dark:bg-neutral-950/40 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-900 rounded-xl space-y-3">
            <div className="flex flex-col sm:flex-row items-center justify-around gap-4 font-mono text-xs text-center">
              <div className="p-3 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 rounded-lg w-full sm:w-1/3">
                <strong className="text-gray-800 dark:text-gray-200 block">Browser Request</strong>
                <span className="text-[10px] text-gray-400">"http://interviewbit.com"</span>
              </div>
              
              <div className="flex flex-col items-center"><ArrowRight className="h-4 w-4 text-cyan-500" /></div>

              <div className="p-3 bg-cyan-500/5 border border-cyan-500/25 rounded-lg w-full sm:w-1/3 shadow-sm">
                <strong className="text-cyan-500 block font-bold">DNS Server (Port 53)</strong>
                <span className="text-[9.5px] text-gray-400">Resolves Domain Index</span>
              </div>

              <div className="flex flex-col items-center"><ArrowRight className="h-4 w-4 text-cyan-500" /></div>

              <div className="p-3 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 rounded-lg w-full sm:w-1/3">
                <strong className="text-gray-800 dark:text-gray-200 block">Resolved IP Output</strong>
                <span className="text-[10.5px] text-emerald-500">172.217.166.36</span>
              </div>
            </div>
          </div>
        </div>
      );

    case 'routing_delivery':
      return (
        <div className="space-y-3">
          <span className="block text-[10px] font-black text-slate-450 uppercase tracking-widest font-mono">
            SSL / TLS Handshake Sequence
          </span>
          <div className="p-5 bg-neutral-50/60 dark:bg-neutral-950/40 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-900 rounded-xl space-y-4">
            <div className="flex flex-col space-y-3 font-mono text-[10.5px]">
              <div className="p-3 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 rounded-xl flex items-start space-x-3">
                <span className="px-1.5 py-0.2 bg-cyan-500/10 text-cyan-500 rounded">1. ClientHello</span>
                <span className="text-neutral-600 dark:text-neutral-450">Browser sends supported TLS versions and active cipher list.</span>
              </div>
              <div className="p-3 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 rounded-xl flex items-start space-x-3">
                <span className="px-1.5 py-0.2 bg-cyan-500/10 text-cyan-500 rounded">2. ServerHello</span>
                <span className="text-neutral-600 dark:text-neutral-450">Server responds with selected cipher and its CA Digital Certificate.</span>
              </div>
              <div className="p-3 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 rounded-xl flex items-start space-x-3">
                <span className="px-1.5 py-0.2 bg-cyan-500/10 text-cyan-500 rounded">3. Key Exchange</span>
                <span className="text-neutral-600 dark:text-neutral-450">Client verifies Certificate and exchanges session key using Asymmetric encryption.</span>
              </div>
              <div className="p-3 bg-cyan-500/5 border border-cyan-500/25 rounded-xl flex items-start space-x-3">
                <span className="px-1.5 py-0.2 bg-cyan-500 text-white rounded font-bold">4. Encrypted Session</span>
                <span className="text-neutral-700 dark:text-neutral-300 font-bold">Both sides utilize fast Symmetric encryption for all web packet exchanges.</span>
              </div>
            </div>
          </div>
        </div>
      );

    default:
      return null;
  }
};

export default function CnCard({ data }) {
  const [expandedSubtopic, setExpandedSubtopic] = useState(0);

  return (
    <section 
      id={data.id}
      className="w-full bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-850 rounded-2xl p-6 md:p-8 shadow-xl transition-all duration-300 hover:border-cyan-500/25 relative"
    >
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-neutral-200 dark:border-neutral-800 dark:border-neutral-800">
        <div className="flex items-center space-x-3">
          <span className="px-3 py-1 bg-cyan-500/10 text-cyan-500 text-[10px] font-black uppercase font-mono tracking-wider rounded-md">
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
                  <span className="h-2 w-2 rounded-full bg-cyan-500"></span>
                  <span className="text-sm font-bold text-neutral-800 dark:text-neutral-200">{sub.name}</span>
                </div>
                {isExpanded ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
              </button>

              {/* Accordion Content */}
              {isExpanded && (
                <div className="p-5 border-t border-neutral-200 dark:border-neutral-800 dark:border-neutral-900 space-y-6 animate-fadeIn">
                  
                  {/* Highlighted One-Liner */}
                  <div className="p-3.5 bg-cyan-500/[0.03] border-l-3 border-cyan-500 text-neutral-700 dark:text-neutral-300 rounded-r-lg font-sans text-xs flex items-center space-x-3 leading-relaxed">
                    <Sparkles className="h-4 w-4 text-cyan-500 flex-shrink-0" />
                    <div>
                      <span className="font-mono text-[9px] font-black text-cyan-500 uppercase tracking-widest block mb-0.5">Interview One-Liner</span>
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
