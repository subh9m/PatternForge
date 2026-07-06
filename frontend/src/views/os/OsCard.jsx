import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Cpu, Activity, Database, Key, Shield, HelpCircle, HardDrive } from 'lucide-react';

// Syntax highlighter optimized for OS configurations and code/ascii diagrams
function highlightCode(code) {
  if (!code) return '';
  let escaped = code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Highlight comments or diagram boundaries
  escaped = escaped.replace(/(\/\/.*)/g, '<span class="text-slate-500 dark:text-slate-500 italic">$1</span>');
  escaped = escaped.replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="text-slate-500 dark:text-slate-500 italic">$1</span>');
  escaped = escaped.replace(/([┌┐└┘├┤─│▲▼◄►├─┬┴┼]+)/g, '<span class="text-amber-500 font-bold">$1</span>');
  escaped = escaped.replace(/\b(User Space|Kernel Space|Ring 3|Ring 0|Stack|Heap|BSS Segment|Data Segment|Text Segment|Virtual Address|Physical Address|TLB|Page Table|Resource|Process|Interrupt|Trap|Exception)\b/g, '<span class="text-blue-500 dark:text-cyan-400 font-black">$1</span>');

  return escaped;
}

// Function to generate a fun, real-world analogy for complex OS topics
function getAnalogy(methodName) {
  const name = methodName.toLowerCase();
  if (name.includes("os & its functions") || name.includes("purpose of an os")) {
    return "Think of the OS as the manager of a busy hotel. Guests (applications) want rooms, room service, and towels (hardware/memory). The manager allocates resources fairly so no one starves and the hotel doesn't collapse.";
  }
  if (name.includes("multiprocessor")) {
    return "Like having multiple chefs in a single kitchen sharing one spice rack (memory). They cook food faster, but need to coordinate so they don't bump into each other.";
  }
  if (name.includes("bootstrap")) {
    return "The alarm clock and morning routine. You can't start your day (run applications) until you boot up, get out of bed, and load your consciousness (kernel) into memory.";
  }
  if (name.includes("rtos")) {
    return "Like an airbag system in a car. It doesn't matter if the system is average, the action *must* deploy in exactly 15 milliseconds, or it's a total failure.";
  }
  if (name.includes("user mode vs kernel mode") || name.includes("difference between user")) {
    return "User mode is like a dining customer (can't go into the kitchen). Kernel mode is the head chef (has knives, fire, and access to all ingredients). The kitchen door is the system call boundary.";
  }
  if (name.includes("context switching")) {
    return "Imagine reading Book A, writing down your page number, closing it, picking up Book B, finding your page, and reading. Do this 100 times a second. Useful, but exhausting!";
  }
  if (name.includes("zombie")) {
    return "A teenager who moved out (process finished) but hasn't updated their address yet (parent hasn't called wait()), so they still occupy a slot on the family tax registry.";
  }
  if (name.includes("deadlock")) {
    return "Two stubborn drivers facing each other in a narrow one-lane street. Driver A won't reverse until Driver B does, and Driver B won't reverse until Driver A does. No one moves.";
  }
  if (name.includes("paging") || name.includes("segmentation")) {
    return "Paging is cutting a book into identical 100-word blocks. Segmentation is dividing the book into logical chapters (Intro, Index). Paging is easier for the publisher, segments make sense to readers.";
  }
  if (name.includes("tlb")) {
    return "A sticky note on your monitor with your 5 most common phone numbers. Instead of opening the heavy phone book (RAM page table) every time, you look at the sticky note in 1 second.";
  }
  if (name.includes("thrashing")) {
    return "A student spending all their study time reorganizing their textbooks on the desk rather than actually reading them. Zero productive work is accomplished.";
  }
  if (name.includes("copy-on-write")) {
    return "Sharing a single Google Doc link. Everyone reads the same link. The second someone tries to edit a sentence, Google creates a private copy for them to write on.";
  }
  if (name.includes("mutex vs semaphore")) {
    return "Mutex is a bathroom key: only 1 person has it, and they must return it. Semaphore is a bike rental shop: 5 bikes available, customers take bikes and return them, count goes up/down.";
  }
  if (name.includes("hard link vs soft link")) {
    return "Hard link is two contacts in your phone pointing to the same physical person. Soft link is a shortcut card in your wallet saying 'Go look at the contact card in your phone'.";
  }
  return "A critical coordinator designed to keep system operations efficient, insulated, and protected against data corruption/crashes.";
}

// Icon helper to dynamically get visual representations for topics
function getTopicIcon(id) {
  if (id.includes("basics")) return <Cpu className="h-5 w-5 text-amber-500" />;
  if (id.includes("process")) return <Activity className="h-5 w-5 text-amber-500" />;
  if (id.includes("scheduling")) return <Database className="h-5 w-5 text-amber-500" />;
  if (id.includes("memory")) return <HardDrive className="h-5 w-5 text-amber-500" />;
  if (id.includes("sync")) return <Key className="h-5 w-5 text-amber-500" />;
  return <Shield className="h-5 w-5 text-amber-500" />;
}

export default function OsCard({ data }) {
  const [showDeclaration, setShowDeclaration] = useState(false);
  const [showInternal, setShowInternal] = useState(true);
  const [expandedQuestions, setExpandedQuestions] = useState({});

  const toggleQuestion = (idx) => {
    setExpandedQuestions(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  return (
    <section 
      id={data.id}
      className="bg-white/60 dark:bg-black/60 backdrop-blur-md 
                 border border-gray-250 dark:border-[#333] 
                 rounded-2xl overflow-hidden shadow-lg
                 hover:shadow-[0_0_25px_rgba(245,158,11,0.15)] hover:border-amber-500/30 hover:-translate-y-0.5
                 transition-all duration-500 ease-in-out mb-10"
    >
      {/* Card Header */}
      <div className="p-6 md:p-8 border-b border-gray-250 dark:border-[#333] bg-gradient-to-r from-amber-500/[0.03] to-transparent">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="p-2 bg-amber-500/10 rounded-xl border border-amber-500/20">
              {getTopicIcon(data.id)}
            </div>
            <div>
              <span className="px-2 py-0.5 bg-amber-500/10 text-amber-500 text-[9px] font-black uppercase font-mono tracking-wider rounded-md border border-amber-500/20">
                {data.num}
              </span>
              <h2 className="text-xl font-black text-gray-900 dark:text-white font-mono uppercase tracking-wide mt-1">
                {data.title}
              </h2>
            </div>
          </div>
        </div>
        <p className="mt-3.5 text-sm text-gray-600 dark:text-gray-400 font-light leading-relaxed max-w-4xl">
          {data.desc}
        </p>
      </div>

      {/* Revision Key Concepts Summary Sheet */}
      <div className="border-b border-gray-200 dark:border-[#222]">
        <button
          onClick={() => setShowDeclaration(!showDeclaration)}
          className="w-full flex items-center justify-between p-5 bg-gray-50/50 dark:bg-[#111]/30 hover:bg-gray-100/50 dark:hover:bg-[#111]/60 transition-colors duration-200 text-left font-mono font-bold text-xs uppercase text-gray-800 dark:text-gray-300"
        >
          <span className="flex items-center space-x-2">
            <span>🚀 Module Core Quick Revision Summary</span>
          </span>
          {showDeclaration ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        
        {showDeclaration && (
          <div className="p-6 bg-gray-100/30 dark:bg-[#070707]/30 border-t border-gray-150 dark:border-[#222]">
            <pre className="text-xs font-mono text-gray-700 dark:text-gray-300 overflow-x-auto whitespace-pre-wrap leading-relaxed">
              <code>{data.declaration}</code>
            </pre>
          </div>
        )}
      </div>

      {/* Visual / Execution Diagrams Section */}
      {(data.diagramUrl || data.internalImplementation) && (
        <div className="border-b border-gray-200 dark:border-[#222]">
          <button
            onClick={() => setShowInternal(!showInternal)}
            className="w-full flex items-center justify-between p-5 bg-gray-50/50 dark:bg-[#111]/30 hover:bg-gray-100/50 dark:hover:bg-[#111]/60 transition-colors duration-200 text-left font-mono font-bold text-xs uppercase text-gray-800 dark:text-gray-300"
          >
            <span>📊 Architectural Diagrams & Executions</span>
            {showInternal ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          
          {showInternal && (
            <div className="border-t border-gray-250 dark:border-[#222] bg-black/90 dark:bg-black/90 p-6 flex flex-col items-center space-y-6 overflow-x-auto">
              {data.diagramUrl && (
                <div className="flex flex-col items-center w-full max-w-2xl">
                  <img 
                    src={data.diagramUrl} 
                    alt={`${data.title} Diagram`}
                    className="max-w-full rounded-xl shadow-2xl border border-neutral-800"
                  />
                  <span className="text-[10px] text-gray-500 font-mono mt-3 uppercase tracking-wider text-center">
                    Figure: {data.title} System Schematic Map
                  </span>
                </div>
              )}

              {data.internalImplementation && (
                <div className="w-full text-left">
                  <span className="block text-[9px] font-black text-amber-500/80 uppercase tracking-widest font-mono mb-2">
                    Console Flowchart Representation
                  </span>
                  <pre className="text-[11px] font-mono leading-relaxed text-gray-300 whitespace-pre">
                    <code dangerouslySetInnerHTML={{ __html: highlightCode(data.internalImplementation) }} />
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Interactive Collapsible Flashcards List */}
      <div className="p-6 space-y-4">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest font-mono mb-4 flex items-center space-x-1.5">
          <HelpCircle className="h-4 w-4 text-amber-500" />
          <span>Interactive Study Flashcards ({data.methods.length} topics)</span>
        </h3>

        <div className="space-y-3">
          {data.methods.map((row, idx) => {
            const isExpanded = expandedQuestions[idx];
            return (
              <div 
                key={idx}
                className={`border border-gray-200 dark:border-[#222] rounded-xl overflow-hidden transition-all duration-300
                  ${isExpanded 
                    ? 'bg-amber-500/[0.01] dark:bg-amber-500/[0.01] border-amber-500/20 shadow-md' 
                    : 'bg-white/40 dark:bg-black/40 hover:border-amber-500/10'
                  }`}
              >
                {/* Accordion Trigger */}
                <button
                  onClick={() => toggleQuestion(idx)}
                  className="w-full flex items-center justify-between p-4 font-mono font-bold text-left text-xs text-gray-900 dark:text-gray-100 hover:text-amber-500 dark:hover:text-amber-500 transition-colors duration-150"
                >
                  <span className="flex items-center space-x-3.5 pr-4">
                    <span className="h-2 w-2 rounded-full bg-amber-500/80"></span>
                    <span>{row.method}</span>
                  </span>
                  {isExpanded ? <ChevronUp className="h-4 w-4 flex-shrink-0" /> : <ChevronDown className="h-4 w-4 flex-shrink-0" />}
                </button>

                {/* Accordion Content */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-1 space-y-4 border-t border-dashed border-gray-200 dark:border-[#222] animate-fadeIn">
                    
                    {/* Fun Analogy Callout Box */}
                    <div className="p-4 bg-amber-500/[0.05] dark:bg-amber-500/[0.03] border-l-2 border-amber-500/70 rounded-r-lg">
                      <span className="block text-[9px] font-black text-amber-500 uppercase tracking-widest font-mono mb-1">
                        💡 Real-World Analogy
                      </span>
                      <p className="text-xs italic text-gray-650 dark:text-gray-300 font-sans leading-relaxed">
                        {getAnalogy(row.method)}
                      </p>
                    </div>

                    {/* Detailed Technical Explanation */}
                    <div>
                      <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest font-mono mb-1.5">
                        🔬 In-Depth Explanation & Workings
                      </span>
                      <div 
                        className="text-xs text-gray-600 dark:text-gray-300 font-sans font-light leading-relaxed space-y-2
                                   prose-table:w-full prose-table:border-collapse prose-table:my-3 
                                   prose-th:border prose-th:border-gray-200 dark:prose-th:border-[#222] prose-th:px-3 prose-th:py-1.5 prose-th:bg-gray-50 dark:prose-th:bg-neutral-900/50 prose-th:font-mono prose-th:text-[10px] prose-th:font-bold
                                   prose-td:border prose-td:border-gray-200 dark:prose-td:border-[#222] prose-td:px-3 prose-td:py-1.5 prose-td:font-mono
                                   prose-ul:list-disc prose-ul:pl-5 prose-ul:space-y-1 prose-ul:my-2
                                   prose-li:text-gray-650 dark:prose-li:text-gray-400"
                        dangerouslySetInnerHTML={{ __html: row.desc }} 
                      />
                    </div>

                    {/* Micro-Stats Parameter Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
                      <div className="p-3 bg-gray-50/50 dark:bg-neutral-900/30 border border-gray-150 dark:border-[#222] rounded-lg">
                        <span className="block text-[8px] font-black text-gray-400 uppercase tracking-wider font-mono">Mechanic / Key term</span>
                        <span className="block text-[11px] font-mono font-semibold text-amber-600 dark:text-amber-400 mt-1 break-words">
                          {row.syntax}
                        </span>
                      </div>
                      
                      <div className="p-3 bg-gray-50/50 dark:bg-neutral-900/30 border border-gray-150 dark:border-[#222] rounded-lg">
                        <span className="block text-[8px] font-black text-gray-400 uppercase tracking-wider font-mono">Inputs / Context</span>
                        <span className="block text-[11px] font-sans font-medium text-gray-700 dark:text-gray-300 mt-1 break-words">
                          {row.params}
                        </span>
                      </div>
                      
                      <div className="p-3 bg-gray-50/50 dark:bg-neutral-900/30 border border-gray-150 dark:border-[#222] rounded-lg">
                        <span className="block text-[8px] font-black text-gray-400 uppercase tracking-wider font-mono">Result / Output</span>
                        <span className="block text-[11px] font-mono text-gray-700 dark:text-gray-300 mt-1 break-words">
                          {row.output}
                        </span>
                      </div>
                      
                      <div className="p-3 bg-gray-50/50 dark:bg-neutral-900/30 border border-gray-150 dark:border-[#222] rounded-lg">
                        <span className="block text-[8px] font-black text-gray-400 uppercase tracking-wider font-mono">Overhead / Complexity</span>
                        <span className="block text-[11px] font-mono font-bold text-gray-800 dark:text-gray-200 mt-1 break-words">
                          {row.complexity}
                        </span>
                      </div>
                    </div>

                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
