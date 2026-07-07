import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import MonacoEditor from '@monaco-editor/react';
import { 
  CheckCircle2, Circle, Play, Search, Award, 
  BookOpen, Code2, X, Info, CheckCircle, Brain
} from 'lucide-react';

interface RevisionItem {
  id: string;
  masterNumber: number;
  name: string;
  topicName: string;
  difficulty: string;
  simplifiedStatement: string;
  simplifiedApproach: string;
  userCode: string;
  language: string;
  timeComplexity: string;
  isRevisedToday: boolean;
  solutionDetails?: string;
}

interface RevisionViewProps {
  navigateToProblem: (id: string) => void;
}

const RevisionView: React.FC<RevisionViewProps> = ({ navigateToProblem }) => {
  const [items, setItems] = useState<RevisionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'revised'>('all');
  const [selectedItem, setSelectedItem] = useState<RevisionItem | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeApproach, setActiveApproach] = useState<'bruteForce' | 'better' | 'optimal'>('optimal');
  const [codeView, setCodeView] = useState<'reference' | 'user'>('reference');

  // Reset modal tabs when selecting a new problem
  useEffect(() => {
    if (selectedItem) {
      setActiveApproach('optimal');
      setCodeView('reference');
    }
  }, [selectedItem]);

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const data = await api.get<RevisionItem[]>('/revisions');
      setItems(data || []);
    } catch (e) {
      console.error('Failed to load revision queue', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleMarkRevised = async (problemId: string) => {
    setActionLoading(true);
    try {
      await api.post(`/revisions/${problemId}/complete`, {});
      
      // Update state local list
      setItems(prev => prev.map(item => {
        if (item.id === problemId) {
          return { ...item, isRevisedToday: true };
        }
        return item;
      }));
      
      // Update active selection state if open
      if (selectedItem && selectedItem.id === problemId) {
        setSelectedItem(prev => prev ? { ...prev, isRevisedToday: true } : null);
      }

      // Notify stats components to refresh navbar
      window.dispatchEvent(new CustomEvent('refresh-stats', {
        detail: { solvedDelta: 0 }
      }));
    } catch (e) {
      console.error('Failed to mark problem revised', e);
    } finally {
      setActionLoading(false);
    }
  };

  const totalSolved = items.length;
  const completedToday = items.filter(i => i.isRevisedToday).length;
  const pendingToday = totalSolved - completedToday;
  const progressPercent = totalSolved > 0 ? Math.round((completedToday / totalSolved) * 100) : 0;

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.topicName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          String(item.masterNumber).includes(searchTerm);
    
    if (activeFilter === 'pending') {
      return matchesSearch && !item.isRevisedToday;
    }
    if (activeFilter === 'revised') {
      return matchesSearch && item.isRevisedToday;
    }
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Top Header Card */}
      <div className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row items-stretch justify-between gap-6 border border-border">
        <div className="flex-1 space-y-2">
          <h1 className="text-2xl font-extrabold text-slate-100 flex items-center space-x-2">
            <Award className="h-6 w-6 text-purple-400" />
            <span>Daily Revision Center</span>
          </h1>
          <p className="text-slate-400 text-xs leading-relaxed max-w-2xl font-medium">
            Cement your logical models by revisiting your solved tasks. Review the simplified brief statements and intuitive approaches, inspect your past code, and mark them as done daily to maintain your consistency streak.
          </p>
        </div>

        {/* Progress gauge card */}
        <div className="w-full md:w-80 bg-slate-950/40 border border-slate-900 rounded-xl p-4 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-bold uppercase tracking-wider font-mono">Today's Progress</span>
            <span className="text-emerald-400 font-black font-mono bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
              {completedToday}/{totalSolved} Solved
            </span>
          </div>

          <div className="space-y-2">
            <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-500 font-semibold font-mono">
              <span>{progressPercent}% Complete</span>
              <span>{pendingToday} Pending</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/10 p-3 rounded-2xl border border-slate-900">
        
        {/* Tabs Filter */}
        <div className="flex bg-slate-950/60 p-1 rounded-xl border border-slate-900 self-start">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-150 ${
              activeFilter === 'all'
                ? 'bg-slate-900 text-slate-100 shadow-sm border border-slate-800'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All ({totalSolved})
          </button>
          <button
            onClick={() => setActiveFilter('pending')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-150 ${
              activeFilter === 'pending'
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Pending ({pendingToday})
          </button>
          <button
            onClick={() => setActiveFilter('revised')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-150 ${
              activeFilter === 'revised'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Revised ({completedToday})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search solved problems or topics..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950/60 border border-slate-900 focus:border-slate-800 focus:ring-0 rounded-xl text-xs text-slate-200 placeholder-slate-500 outline-none"
          />
        </div>
      </div>

      {/* Main Grid View */}
      {filteredItems.length === 0 ? (
        <div className="glass-panel text-center py-16 border border-slate-900 rounded-2xl flex flex-col items-center justify-center space-y-4">
          <CheckCircle2 className="h-12 w-12 text-slate-650" />
          <div className="space-y-1">
            <h3 className="text-sm font-extrabold text-slate-300">No Revision Problems Found</h3>
            <p className="text-slate-500 text-xs max-w-md mx-auto">
              {searchTerm 
                ? "No solved tasks matched your search query. Try typing something else." 
                : "Your revision queue is empty. Practice and solve problems in Explorer to add items to your daily queue!"}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map(item => (
            <div 
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className={`glass-panel border p-5 rounded-2xl hover:border-slate-750 transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-4 relative overflow-hidden group ${
                item.isRevisedToday ? 'bg-emerald-950/5 border-emerald-500/20' : 'bg-slate-900/20 border-slate-900'
              }`}
            >
              
              {/* Corner completion glow */}
              {item.isRevisedToday && (
                <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/10 rounded-full blur-xl pointer-events-none"></div>
              )}

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500 font-mono uppercase">#{item.masterNumber}</span>
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                    item.difficulty === 'EASY' ? 'bg-emerald-500/10 text-emerald-400' :
                    item.difficulty === 'MEDIUM' ? 'bg-amber-500/10 text-amber-400' :
                    'bg-red-500/10 text-red-400'
                  }`}>
                    {item.difficulty}
                  </span>
                </div>
                
                <h3 className="text-sm font-extrabold text-slate-200 group-hover:text-slate-100 transition-colors">
                  {item.name}
                </h3>
                
                <div className="flex items-center space-x-1.5 pt-1">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 bg-slate-950/60 px-2 py-0.5 rounded border border-slate-900">
                    {item.topicName}
                  </span>
                  {item.timeComplexity && (
                    <span className="text-[9px] font-bold text-slate-400 font-mono">
                      {item.timeComplexity}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-900/60 pt-3">
                <span className="text-[10px] font-semibold text-slate-500 flex items-center space-x-1">
                  <BookOpen className="h-3 w-3" />
                  <span>Click to review details</span>
                </span>

                {item.isRevisedToday ? (
                  <span className="flex items-center space-x-1 text-emerald-400 text-[10px] font-black uppercase font-mono">
                    <CheckCircle className="h-3.5 w-3.5" />
                    <span>Revised</span>
                  </span>
                ) : (
                  <span className="flex items-center space-x-1 text-amber-400 text-[10px] font-black uppercase font-mono">
                    <Circle className="h-3.5 w-3.5" />
                    <span>Pending</span>
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Premium Detail Overlay Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-fade-in">
          {(() => {
            // Parse details JSON
            let details: any = null;
            if (selectedItem.solutionDetails) {
              try {
                details = JSON.parse(selectedItem.solutionDetails);
              } catch (e) {
                console.error("Failed to parse solution details", e);
              }
            }

            // Parse approach maps
            let simplifiedMap = { optimal: "", better: "", bruteForce: "" };
            if (selectedItem.simplifiedApproach) {
              try {
                const parsed = JSON.parse(selectedItem.simplifiedApproach);
                if (typeof parsed === 'object' && parsed !== null) {
                  simplifiedMap = {
                    optimal: parsed.optimal || "",
                    better: parsed.better || "",
                    bruteForce: parsed.bruteForce || ""
                  };
                } else {
                  simplifiedMap.optimal = selectedItem.simplifiedApproach;
                }
              } catch (e) {
                simplifiedMap.optimal = selectedItem.simplifiedApproach;
              }
            }

            // Determine available approaches
            const hasBrute = !!(simplifiedMap.bruteForce || (details?.bruteForce?.code?.cpp || details?.bruteForce?.code?.java || details?.bruteForce?.code?.python || details?.bruteForce?.code));
            const hasBetter = !!(simplifiedMap.better || (details?.better?.code?.cpp || details?.better?.code?.java || details?.better?.code?.python || details?.better?.code));

            // Get active approach info
            let activeExplanation = "";
            let activeCode = "";
            let activeComplexity = "";

            if (activeApproach === 'bruteForce' && hasBrute) {
              activeExplanation = simplifiedMap.bruteForce || "Brute force strategy.";
              activeCode = details?.bruteForce?.code?.cpp || details?.bruteForce?.code?.java || details?.bruteForce?.code?.python || details?.bruteForce?.code || "";
              activeComplexity = details?.bruteForce?.timeComplexity || "O(2^N) or O(N^2)";
            } else if (activeApproach === 'better' && hasBetter) {
              activeExplanation = simplifiedMap.better || "Better/improved strategy.";
              activeCode = details?.better?.code?.cpp || details?.better?.code?.java || details?.better?.code?.python || details?.better?.code || "";
              activeComplexity = details?.better?.timeComplexity || "O(N log N)";
            } else {
              activeExplanation = simplifiedMap.optimal || "Optimal strategy.";
              activeCode = details?.optimal?.code?.cpp || details?.optimal?.code?.java || details?.optimal?.code?.python || details?.optimal?.code || details?.referenceSolutions?.cpp || details?.referenceSolutions?.java || details?.referenceSolution || "";
              activeComplexity = details?.optimal?.timeComplexity || selectedItem.timeComplexity || "O(N)";
            }

            const displayedCode = codeView === 'user' && selectedItem.userCode
              ? selectedItem.userCode
              : activeCode;

            return (
              <div className="glass-panel border border-slate-800 rounded-2xl w-full max-w-5xl h-[80vh] flex flex-col shadow-2xl relative">
                
                {/* Modal Header */}
                <div className="flex items-center justify-between p-5 border-b border-slate-900 bg-slate-950/30">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 bg-purple-500/10 rounded-xl text-purple-400">
                      <Award className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-bold text-slate-500 font-mono">#{selectedItem.masterNumber}</span>
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                          selectedItem.difficulty === 'EASY' ? 'bg-emerald-500/10 text-emerald-400' :
                          selectedItem.difficulty === 'MEDIUM' ? 'bg-amber-500/10 text-amber-400' :
                          'bg-red-500/10 text-red-400'
                        }`}>
                          {selectedItem.difficulty}
                        </span>
                      </div>
                      <h2 className="text-base font-extrabold text-slate-100">{selectedItem.name}</h2>
                    </div>
                  </div>

                  <button 
                    onClick={() => setSelectedItem(null)}
                    className="p-1.5 hover:bg-slate-900 rounded-lg text-slate-500 hover:text-slate-350 cursor-pointer"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Approach Selector tabs row */}
                <div className="flex px-6 py-2.5 bg-slate-950/40 border-b border-slate-900 gap-2 shrink-0 select-none">
                  <button
                    onClick={() => {
                      setActiveApproach('optimal');
                      setCodeView('reference');
                    }}
                    className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-150 border ${
                      activeApproach === 'optimal'
                        ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.15)]'
                        : 'bg-slate-950/20 border-slate-900 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Optimal Approach
                  </button>

                  {hasBetter && (
                    <button
                      onClick={() => {
                        setActiveApproach('better');
                        setCodeView('reference');
                      }}
                      className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-150 border ${
                        activeApproach === 'better'
                          ? 'bg-blue-500/10 border-blue-500/40 text-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.15)]'
                          : 'bg-slate-950/20 border-slate-900 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Better Approach
                    </button>
                  )}

                  {hasBrute && (
                    <button
                      onClick={() => {
                        setActiveApproach('bruteForce');
                        setCodeView('reference');
                      }}
                      className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-150 border ${
                        activeApproach === 'bruteForce'
                          ? 'bg-red-500/10 border-red-500/40 text-red-400 shadow-[0_0_8px_rgba(239,68,68,0.15)]'
                          : 'bg-slate-950/20 border-slate-900 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Brute Force Approach
                    </button>
                  )}
                </div>

                {/* Modal Body Columns */}
                <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
                  
                  {/* Left Column - Simplified Brief Details */}
                  <div className="space-y-6 overflow-y-auto pr-2 custom-scrollbar">
                    
                    {/* Simplified Statement */}
                    <div className="space-y-2">
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono flex items-center space-x-1">
                        <Info className="h-3.5 w-3.5 text-blue-400" />
                        <span>Brief Task Description</span>
                      </h4>
                      <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-900 text-slate-300 text-xs leading-relaxed font-sans">
                        {selectedItem.simplifiedStatement}
                      </div>
                    </div>

                    {/* Simplified Active Approach */}
                    <div className="space-y-2">
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono flex items-center space-x-1">
                        <Brain className="h-3.5 w-3.5 text-emerald-400" />
                        <span>Simplified Approach ({activeApproach === 'bruteForce' ? 'Brute Force' : (activeApproach === 'better' ? 'Better' : 'Optimal')})</span>
                      </h4>
                      <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-900 text-slate-300 text-xs leading-relaxed font-sans min-h-[70px]">
                        {activeExplanation}
                      </div>
                    </div>

                    {/* Meta details */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-950/40 p-3.5 rounded-xl border border-slate-900 space-y-1">
                        <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider block font-mono">Topic Category</span>
                        <span className="text-xs font-bold text-slate-200 uppercase">{selectedItem.topicName}</span>
                      </div>
                      <div className="bg-slate-950/40 p-3.5 rounded-xl border border-slate-900 space-y-1">
                        <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider block font-mono">Time Complexity</span>
                        <span className="text-xs font-bold text-blue-400 font-mono">{activeComplexity}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Code Editor View */}
                  <div className="flex flex-col h-full border border-slate-900 rounded-2xl overflow-hidden bg-[#1e1e1e] min-h-[300px]">
                    <div className="px-4 py-2 border-b border-slate-900 bg-slate-950/50 flex items-center justify-between text-xs shrink-0">
                      <div className="flex bg-slate-950 p-0.5 rounded-lg border border-slate-900 select-none">
                        <button
                          onClick={() => setCodeView('reference')}
                          className={`px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider transition-all duration-150 ${
                            codeView === 'reference'
                              ? 'bg-slate-900 text-slate-100 shadow-sm'
                              : 'text-slate-400 hover:text-slate-250'
                          }`}
                        >
                          Reference Solution
                        </button>
                        {selectedItem.userCode && (
                          <button
                            onClick={() => setCodeView('user')}
                            className={`px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider transition-all duration-150 ${
                              codeView === 'user'
                                ? 'bg-slate-900 text-slate-100 shadow-sm'
                                : 'text-slate-400 hover:text-slate-250'
                            }`}
                          >
                            My Submission
                          </button>
                        )}
                      </div>
                      <span className="px-2 py-0.5 bg-slate-900 rounded text-[9px] font-bold text-slate-400 uppercase font-mono">
                        {selectedItem.language || 'cpp'}
                      </span>
                    </div>

                    <div className="flex-1 w-full relative">
                      {displayedCode ? (
                        <MonacoEditor
                          height="100%"
                          language={selectedItem.language === 'cpp' ? 'cpp' : (selectedItem.language === 'java' ? 'java' : 'python')}
                          theme="vs-dark"
                          value={displayedCode.trim()}
                          options={{
                            readOnly: true,
                            minimap: { enabled: false },
                            scrollBeyondLastLine: false,
                            automaticLayout: true,
                            fontSize: 12.5,
                            fontFamily: "'Fira Code', 'Courier New', monospace"
                          }}
                        />
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 text-xs font-sans p-6 text-center select-none">
                          <Code2 className="h-8 w-8 mb-2 animate-pulse" />
                          <span>No code snippet is configured for this approach category level.</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Modal Footer Controls */}
                <div className="p-4 border-t border-slate-900 bg-slate-950/30 flex items-center justify-between shrink-0">
                  <button
                    onClick={() => {
                      setSelectedItem(null);
                      navigateToProblem(selectedItem.id);
                    }}
                    className="px-4 py-2 bg-slate-950 hover:bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer transition-smooth flex items-center space-x-2"
                  >
                    <Play className="h-3.5 w-3.5" />
                    <span>Launch Full Console</span>
                  </button>

                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setSelectedItem(null)}
                      className="px-4 py-2 text-slate-450 hover:text-slate-350 text-xs font-bold uppercase tracking-wider cursor-pointer"
                    >
                      Close
                    </button>
                    
                    {selectedItem.isRevisedToday ? (
                      <div className="px-5 py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs font-black uppercase flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4" />
                        <span>Revised Today</span>
                      </div>
                    ) : (
                      <button
                        disabled={actionLoading}
                        onClick={() => handleMarkRevised(selectedItem.id)}
                        className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer shadow-glow-primary transition-smooth flex items-center space-x-2"
                      >
                        {actionLoading ? (
                          <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                        ) : (
                          <CheckCircle className="h-4 w-4" />
                        )}
                        <span>Mark as Done</span>
                      </button>
                    )}
                  </div>
                </div>

              </div>
            );
          })()}
        </div>
      )}

    </div>
  );
};

export default RevisionView;
