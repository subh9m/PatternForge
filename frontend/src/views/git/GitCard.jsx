import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, GitBranch, Terminal, RefreshCw, Undo2, Award, HelpCircle, HardDrive, Share2 } from 'lucide-react';

// Syntax highlighter optimized for Git commands and logs
function highlightCode(code) {
  if (!code) return '';
  let escaped = code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Highlight comments or command lines
  escaped = escaped.replace(/(\/\/.*)/g, '<span class="text-slate-500 dark:text-slate-500 italic">$1</span>');
  escaped = escaped.replace(/(^\$.*)/gm, '<span class="text-amber-500 font-bold">$1</span>');
  escaped = escaped.replace(/\b(git add|git commit|git push|git pull|git fetch|git merge|git rebase|git checkout|git switch|git init|git clone|git status|git diff|git log|git blame|git revert|git reset|git reflog|git stash|git restore)\b/g, '<span class="text-blue-500 dark:text-cyan-400 font-bold">$1</span>');

  return escaped;
}

// Function to generate a fun, real-world analogy for complex Git topics
function getAnalogy(methodName) {
  const name = methodName.toLowerCase();
  
  if (name.includes("version control")) {
    return "Without version control, you have folders like 'report_final_v2_FINAL_fixed.docx'. With Git, you have one clean file and a complete ledger tracking every single character ever typed.";
  }
  if (name.includes("git vs github")) {
    return "Git is your personal journal on your desk (private, offline). GitHub is a copying machine and a public display board where you share pages of your journal with the world.";
  }
  if (name.includes("working zones") || name.includes("four git areas")) {
    return "Working directory is raw wood on your workbench. Staging area is the shipping conveyor belt where you inspect items. Local repository is your home storage room. Remote repository is the Amazon retail store.";
  }
  if (name.includes("object model") || name.includes("internal objects")) {
    return "Blobs are loose file sheets of content. Trees are folders mapping file names to those sheets. Commits are locked snapshots with a stamp containing who, when, and pointing to the root tree.";
  }
  if (name.includes("config and initialization")) {
    return "Like renting an office. You write your nameplate on the door (git config) and initialize empty drawers (git init) to start organizing files.";
  }
  if (name.includes("clone options")) {
    return "Standard clone downloads the entire library shelf. Depth-1 shallow clone is like requesting a photocopy of just the active pages of the books to save trip time.";
  }
  if (name.includes("staging & commits")) {
    return "Staging (git add) is like adding items to a supermarket cart. Committing (git commit) is like paying at the checkout register. Until you pay, the items aren't yours permanently.";
  }
  if (name.includes("removing & moving")) {
    return "Moving a file (git mv) is like relocating a book from shelf A to shelf B and immediately updating the library catalog card in one transaction.";
  }
  if (name.includes("querying logs")) {
    return "Logging is opening your bank statement history. You can search by date, amount (oneline), or author of the transactions.";
  }
  if (name.includes("deltas and authorship")) {
    return "Diff is like comparing two spot-the-difference drawings. Blame is like seeing a Post-It note next to a dirty coffee cup in the sink showing exactly who put it there.";
  }
  if (name.includes("branch creation") || name.includes("navigating branches")) {
    return "A branch is like a sticky bookmark on a book page. You can duplicate a bookmark, name it 'feature', read down that path, and switch back to the original bookmark in 1 second.";
  }
  if (name.includes("integrating code") || name.includes("merge & rebase")) {
    return "Merging is like tying two ropes together with a knot (merge commit). Rebasing is like untying your rope and weaving it perfectly into the base of the main rope so it looks like one single strand.";
  }
  if (name.includes("remote aliases") || name.includes("pull vs fetch")) {
    return "Fetch is looking at the mail notification on your lock screen. Pull is unlocking your phone, opening the letter, and integrating it into your active plans.";
  }
  if (name.includes("branching strategies")) {
    return "Git Flow is a multi-lane highway with traffic lights and safety checkpoints. GitHub Flow is a simple single-lane road. Trunk-based is a high-speed express train track.";
  }
  if (name.includes("merge conflicts")) {
    return "Like two people trying to place different pictures in the exact same picture frame on the wall. Git stops and says, 'I can't override. You both must decide which image stays.'";
  }
  if (name.includes("https vs ssh")) {
    return "HTTPS is logging in with a username/password token every time. SSH is like having a fingerprint lock on the gate: once setup, you walk through password-free.";
  }
  if (name.includes("undo options") || name.includes("reset modes")) {
    return "Restore is erasing a pencil mark. Revert is writing a correction note: 'Ignore line 4' (safe). Reset --soft is putting code back in the staging basket. Reset --hard is throwing it in the incinerator.";
  }
  if (name.includes("interview q&a")) {
    return "Like mock flight simulator checks. Knowing how to pull the emergency eject (git reflog) is just as important as knowing how to steer the plane.";
  }

  return "A robust workflow design ensuring code changes are tracked, auditable, and easily restorable in enterprise environments.";
}

// Icon helper to dynamically get visual representations for topics
function getTopicIcon(id) {
  if (id.includes("basics")) return <Terminal className="h-5 w-5 text-amber-500" />;
  if (id.includes("architecture")) return <HardDrive className="h-5 w-5 text-amber-500" />;
  if (id.includes("setup")) return <Terminal className="h-5 w-5 text-amber-500" />;
  if (id.includes("tracking")) return <RefreshCw className="h-5 w-5 text-amber-500" />;
  if (id.includes("history")) return <Undo2 className="h-5 w-5 text-amber-500" />;
  if (id.includes("branching")) return <GitBranch className="h-5 w-5 text-amber-500" />;
  if (id.includes("integrating")) return <Share2 className="h-5 w-5 text-amber-500" />;
  return <Award className="h-5 w-5 text-amber-500" />;
}

export default function GitCard({ data }) {
  const [showDeclaration, setShowDeclaration] = useState(false);
  const [showInternal, setShowInternal] = useState(false);
  const [expandedQuestions, setExpandedQuestions] = useState({});

  const toggleQuestion = (idx) => {
    setExpandedQuestions(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  // Scopes and wraps dynamically loaded images within collapsed tags
  useEffect(() => {
    const images = document.querySelectorAll('.git-rich-content img');
    images.forEach((img) => {
      if (img.dataset.wrapped) return;
      img.dataset.wrapped = "true";

      // Collapse by default
      img.style.display = 'none';
      img.style.maxWidth = '100%';
      img.style.borderRadius = '8px';
      img.style.marginTop = '12px';

      // Create a toggle button
      const btn = document.createElement('button');
      btn.className = 'inline-flex items-center space-x-2 px-3 py-1.5 mt-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/20 hover:border-amber-500/40 rounded-lg text-[10px] font-mono font-bold cursor-pointer transition-all duration-150';
      btn.innerHTML = '<span>🖼️ View Architectural Diagram</span>';

      // Insert button before the image
      img.parentNode.insertBefore(btn, img);

      btn.onclick = (e) => {
        e.preventDefault();
        if (img.style.display === 'none') {
          img.style.display = 'block';
          btn.innerHTML = '<span>❌ Close Diagram</span>';
          btn.className = 'inline-flex items-center space-x-2 px-3 py-1.5 mt-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 hover:border-red-500/40 rounded-lg text-[10px] font-mono font-bold cursor-pointer transition-all duration-150';
        } else {
          img.style.display = 'none';
          btn.innerHTML = '<span>🖼️ View Architectural Diagram</span>';
          btn.className = 'inline-flex items-center space-x-2 px-3 py-1.5 mt-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/20 hover:border-amber-500/40 rounded-lg text-[10px] font-mono font-bold cursor-pointer transition-all duration-150';
        }
      };
    });
  }, [expandedQuestions, data]);

  return (
    <section 
      id={data.id}
      className="bg-white/80 dark:bg-neutral-950/70 backdrop-blur-md 
                 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 
                 rounded-2xl overflow-hidden shadow-lg
                 hover:shadow-[0_0_25px_rgba(245,158,11,0.15)] hover:border-amber-500/30 hover:-translate-y-0.5
                 transition-all duration-500 ease-in-out mb-10"
    >
      {/* Styles for rendering clean, lined tables and bullet lists in the descriptions */}
      <style>{`
        .git-rich-content table {
          width: 100% !important;
          border-collapse: collapse !important;
          margin: 20px 0 !important;
          font-family: monospace !important;
          font-size: 13.5px !important;
          border: 1px solid #444 !important;
        }
        .git-rich-content th {
          border: 1px solid #444 !important;
          padding: 10px 14px !important;
          background-color: rgba(245, 158, 11, 0.08) !important;
          font-weight: bold !important;
          text-transform: uppercase !important;
          letter-spacing: 0.05em !important;
          color: #f59e0b !important;
          text-align: left !important;
        }
        .git-rich-content td {
          border: 1px solid #333 !important;
          padding: 10px 14px !important;
          color: #e2e8f0 !important;
          line-height: 1.6 !important;
        }
        .light .git-rich-content table {
          border: 1px solid #ccc !important;
        }
        .light .git-rich-content th {
          border: 1px solid #ccc !important;
          background-color: rgba(245, 158, 11, 0.05) !important;
          color: #b45309 !important;
        }
        .light .git-rich-content td {
          border: 1px solid #ddd !important;
          color: #1e293b !important;
        }
        .git-rich-content ul {
          list-style-type: disc !important;
          padding-left: 24px !important;
          margin: 12px 0 !important;
        }
        .git-rich-content li {
          margin-bottom: 8px !important;
          line-height: 1.625 !important;
        }
      `}</style>

      {/* Card Header */}
      <div className="p-6 md:p-8 border-b border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 bg-gradient-to-r from-amber-500/[0.03] to-transparent">
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
        <p className="mt-4 text-[15px] md:text-base text-gray-700 dark:text-neutral-300 font-normal leading-relaxed max-w-4xl">
          {data.desc}
        </p>
      </div>

      {/* Revision Key Concepts Summary Sheet */}
      <div className="border-b border-neutral-200 dark:border-neutral-800 dark:border-neutral-850">
        <button
          onClick={() => setShowDeclaration(!showDeclaration)}
          className="w-full flex items-center justify-between p-5 bg-white/80 dark:bg-[#111]/30 hover:bg-white/50 dark:hover:bg-[#111]/60 transition-colors duration-200 text-left font-mono font-bold text-xs uppercase text-neutral-800 dark:text-neutral-300"
        >
          <span className="flex items-center space-x-2">
            <span>🚀 Module Core Quick Revision Summary</span>
          </span>
          {showDeclaration ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        
        {showDeclaration && (
          <div className="p-6 bg-gray-100/30 dark:bg-[#070707]/30 border-t border-neutral-200 dark:border-neutral-800 dark:border-neutral-850">
            <pre className="text-xs font-mono text-neutral-700 dark:text-neutral-300 overflow-x-auto whitespace-pre-wrap leading-relaxed">
              <code>{data.declaration}</code>
            </pre>
          </div>
        )}
      </div>

      {/* Visual / Execution Diagrams Section */}
      {(data.diagramUrl || data.internalImplementation) && (
        <div className="border-b border-neutral-200 dark:border-neutral-800 dark:border-neutral-850">
          <button
            onClick={() => setShowInternal(!showInternal)}
            className="w-full flex items-center justify-between p-5 bg-white/80 dark:bg-[#111]/30 hover:bg-white/50 dark:hover:bg-[#111]/60 transition-colors duration-200 text-left font-mono font-bold text-xs uppercase text-neutral-800 dark:text-neutral-300"
          >
            <span>📊 Architectural Diagrams & Executions</span>
            {showInternal ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          
          {showInternal && (
            <div className="border-t border-neutral-200 dark:border-neutral-800 dark:border-neutral-850 bg-black/90 dark:bg-black/90 p-6 flex flex-col items-center space-y-6 overflow-x-auto">
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
                className={`border border-neutral-200 dark:border-neutral-800 dark:border-neutral-850 rounded-xl overflow-hidden transition-all duration-300
                  ${isExpanded 
                    ? 'bg-amber-500/[0.01] dark:bg-amber-500/[0.01] border-amber-500/20 shadow-md' 
                    : 'bg-white/80 dark:bg-neutral-950/30 hover:border-amber-500/10'
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
                  <div className="px-5 pb-5 pt-1 space-y-4 border-t border-dashed border-neutral-200 dark:border-neutral-800 dark:border-neutral-850 animate-fadeIn">
                    
                    {/* Fun Analogy Callout Box */}
                    <div className="p-5 bg-amber-500/[0.05] dark:bg-amber-500/[0.03] border-l-2 border-amber-500/70 rounded-r-lg">
                      <span className="block text-[10px] font-black text-amber-500 uppercase tracking-widest font-mono mb-1.5">
                        💡 Real-World Analogy
                      </span>
                      <p className="text-[14px] md:text-[15px] italic text-gray-700 dark:text-neutral-250 font-sans leading-relaxed">
                        {getAnalogy(row.method)}
                      </p>
                    </div>

                    {/* Detailed Technical Explanation */}
                    <div className="space-y-2">
                      <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono mb-2">
                        🔬 In-Depth Explanation & Workings
                      </span>
                      <div 
                        className="git-rich-content text-[14px] md:text-[15px] text-gray-700 dark:text-neutral-300 font-sans font-normal leading-relaxed space-y-3"
                        dangerouslySetInnerHTML={{ __html: row.desc }} 
                      />
                    </div>

                    {/* Micro-Stats Parameter Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-3">
                      <div className="p-3.5 bg-white/80 dark:bg-neutral-900/30 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-850 rounded-lg">
                        <span className="block text-[9.5px] font-black text-gray-400 uppercase tracking-wider font-mono">Mechanic / Command</span>
                        <span className="block text-[13px] md:text-[14px] font-mono font-semibold text-amber-600 dark:text-amber-400 mt-1.5 break-words">
                          {row.syntax}
                        </span>
                      </div>
                      
                      <div className="p-3.5 bg-white/80 dark:bg-neutral-900/30 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-850 rounded-lg">
                        <span className="block text-[9.5px] font-black text-gray-400 uppercase tracking-wider font-mono">Inputs / Context</span>
                        <span className="block text-[13px] md:text-[14px] font-sans font-medium text-neutral-700 dark:text-neutral-300 mt-1.5 break-words">
                          {row.params}
                        </span>
                      </div>
                      
                      <div className="p-3.5 bg-white/80 dark:bg-neutral-900/30 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-850 rounded-lg">
                        <span className="block text-[9.5px] font-black text-gray-400 uppercase tracking-wider font-mono">Result / Output</span>
                        <span className="block text-[13px] md:text-[14px] font-mono text-neutral-700 dark:text-neutral-300 mt-1.5 break-words">
                          {row.output}
                        </span>
                      </div>
                      
                      <div className="p-3.5 bg-white/80 dark:bg-neutral-900/30 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-850 rounded-lg">
                        <span className="block text-[9.5px] font-black text-gray-400 uppercase tracking-wider font-mono">Overhead / Complexity</span>
                        <span className="block text-[13px] md:text-[14px] font-mono font-bold text-gray-800 dark:text-gray-200 mt-1.5 break-words">
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
