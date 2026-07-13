import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { 
  Search, CheckCircle2, Bookmark, BookmarkCheck,
  AlertCircle, ArrowUpDown, XCircle, Grid, Sparkles,
  TableProperties, LayoutGrid, List as ListIcon, Code2
} from 'lucide-react';

export interface ProblemDto {
  id: string;
  masterNumber: number;
  topicNumber: number;
  leetcodeNumber: number;
  name: string;
  topicName: string;
  difficulty: string;
  status: string;
  isFavorite: boolean;
  needRevision: boolean;
  confidenceRating: number;
  approachSaved: boolean;
  isAiReady: boolean;
  leetcodeSolved?: boolean;
}

interface TopicStats {
  id: string;
  name: string;
  slug: string;
  total: number;
  solved: number;
  attempted: number;
  remaining: number;
}

interface ExplorerProps {
  navigateToProblem: (id: string) => void;
}

const Explorer: React.FC<ExplorerProps> = ({ navigateToProblem }) => {
  const [problems, setProblems] = useState<ProblemDto[]>([]);
  const [topics, setTopics] = useState<TopicStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingIds, setGeneratingIds] = useState<Record<string, boolean>>({});

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTopicSlug, setSelectedTopicSlug] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [onlyBookmarked, setOnlyBookmarked] = useState(false);
  const [onlyNeedRevision, setOnlyNeedRevision] = useState(false);
  const [sortBy, setSortBy] = useState<string>('masterNumber');

  const [viewMode, setViewMode] = useState<'table' | 'cards' | 'list'>(() => {
    const saved = localStorage.getItem('patternforge_explorer_viewmode');
    return (saved === 'table' || saved === 'cards' || saved === 'list') ? saved : 'table';
  });

  const [statusSource, setStatusSource] = useState<'patternforge' | 'leetcode'>(() => {
    return (localStorage.getItem('patternforge_explorer_status_source') as any) || 'patternforge';
  });

  const [leetcodeStatus, setLeetcodeStatus] = useState<any>(null);

  useEffect(() => {
    localStorage.setItem('patternforge_explorer_viewmode', viewMode);
  }, [viewMode]);

  useEffect(() => {
    localStorage.setItem('patternforge_explorer_status_source', statusSource);
  }, [statusSource]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [problemsData, topicsData, lcStatusData] = await Promise.all([
          api.get<ProblemDto[]>('/problems'),
          api.get<TopicStats[]>('/problems/topics'),
          api.get<any>('/leetcode/status').catch(() => null)
        ]);
        const uniqueProblemsMap = new Map<number, ProblemDto>();
        const uniqueProblemsList: ProblemDto[] = [];
        (problemsData || []).forEach(p => {
          if (p.leetcodeNumber && p.leetcodeNumber > 0) {
            if (!uniqueProblemsMap.has(p.leetcodeNumber)) {
              uniqueProblemsMap.set(p.leetcodeNumber, p);
              uniqueProblemsList.push(p);
            }
          } else {
            uniqueProblemsList.push(p);
          }
        });
        setProblems(uniqueProblemsList);
        setTopics(topicsData);
        setLeetcodeStatus(lcStatusData);
      } catch (e) {
        console.error("Failed to load explorer data", e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Background polling to automatically refresh problem list on sync
  useEffect(() => {
    const pollSyncStatus = async () => {
      try {
        const currentStatus = await api.silentGet<any>('/leetcode/status');
        if (currentStatus) {
          const hasChanged = !leetcodeStatus || 
            currentStatus.lastSyncedAt !== leetcodeStatus.lastSyncedAt ||
            currentStatus.totalSolved !== leetcodeStatus.totalSolved;

          if (hasChanged) {
            const [problemsData, topicsData] = await Promise.all([
              api.get<ProblemDto[]>('/problems'),
              api.get<TopicStats[]>('/problems/topics')
            ]);
            const uniqueProblemsMap = new Map<number, ProblemDto>();
            const uniqueProblemsList: ProblemDto[] = [];
            (problemsData || []).forEach(p => {
              if (p.leetcodeNumber && p.leetcodeNumber > 0) {
                if (!uniqueProblemsMap.has(p.leetcodeNumber)) {
                  uniqueProblemsMap.set(p.leetcodeNumber, p);
                  uniqueProblemsList.push(p);
                }
              } else {
                uniqueProblemsList.push(p);
              }
            });
            setProblems(uniqueProblemsList);
            setTopics(topicsData);
            setLeetcodeStatus(currentStatus);
          }
        }
      } catch (err) {
        console.error("Poller failed to check sync status", err);
      }
    };

    const interval = setInterval(pollSyncStatus, 5000);
    return () => clearInterval(interval);
  }, [leetcodeStatus]);

  const toggleBookmark = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Stop navigation click
    try {
      const res = await api.post<{ bookmarked: boolean }>(`/problems/${id}/bookmark`, {});
      setProblems(prev => prev.map(p => {
        if (p.id === id) {
          return { ...p, isFavorite: res.bookmarked };
        }
        return p;
      }));
    } catch (err) {
      // Ignored
    }
  };

  const handleAiClick = async (id: string, e: React.MouseEvent, isAlreadyReady: boolean) => {
    e.stopPropagation();
    if (isAlreadyReady || generatingIds[id]) {
      return;
    }
    setGeneratingIds(prev => ({ ...prev, [id]: true }));
    try {
      await api.post(`/problems/${id}/regenerate`, {});
      setProblems(prev => prev.map(p => {
        if (p.id === id) {
          return { ...p, isAiReady: true };
        }
        return p;
      }));
    } catch (err) {
      console.error("AI details generation failed", err);
    } finally {
      setGeneratingIds(prev => ({ ...prev, [id]: false }));
    }
  };

  // Filter Logic client-side for absolute lag-free speeds
  const filteredProblems = problems
    .filter(p => {
      if (selectedDifficulty !== 'ALL' && p.difficulty !== selectedDifficulty) return false;
      if (selectedTopicSlug) {
        const slug = p.topicName.toLowerCase().replaceAll(" & ", "-").replaceAll(" ", "-");
        if (slug !== selectedTopicSlug) return false;
      }
      if (selectedStatus !== 'ALL') {
        const isLeetCode = statusSource === 'leetcode';
        if (isLeetCode) {
          if (selectedStatus === 'SOLVED' && !p.leetcodeSolved) return false;
          if (selectedStatus === 'UNSOLVED' && p.leetcodeSolved) return false;
          if (selectedStatus === 'ATTEMPTED' && p.leetcodeSolved) return false;
        } else {
          if (selectedStatus === 'SOLVED' && p.status !== 'SOLVED') return false;
          if (selectedStatus === 'UNSOLVED' && p.status !== 'UNSOLVED') return false;
          if (selectedStatus === 'ATTEMPTED' && p.status !== 'ATTEMPTED' && p.status !== 'WRONG') return false;
        }
      }
      if (onlyBookmarked && !p.isFavorite) return false;
      if (onlyNeedRevision && !p.needRevision) return false;
      
      if (searchTerm.trim()) {
        const s = searchTerm.toLowerCase();
        return p.name.toLowerCase().includes(s) ||
               String(p.masterNumber).includes(s) ||
               (p.leetcodeNumber && String(p.leetcodeNumber).includes(s)) ||
               p.topicName.toLowerCase().includes(s);
      }
      return true;
    })
    .sort((p1, p2) => {
      if (sortBy === 'leetcodeNumber') {
        const l1 = p1.leetcodeNumber ?? Infinity;
        const l2 = p2.leetcodeNumber ?? Infinity;
        return l1 - l2;
      } else if (sortBy === 'alphabetical') {
        return p1.name.localeCompare(p2.name);
      } else { // default
        if (selectedTopicSlug) {
          return p1.topicNumber - p2.topicNumber;
        }
        return p1.masterNumber - p2.masterNumber;
      }
    });

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      
      {/* Sidebar: Topics checklists */}
      <div className="lg:col-span-1 glass-panel glass-panel-hover rounded-2xl p-5 h-fit max-h-[85vh] overflow-y-auto">
        <h3 className="text-sm font-extrabold text-slate-200 uppercase tracking-wider mb-4 flex items-center space-x-1.5">
          <Grid className="h-4 w-4 text-blue-400" />
          <span>Topic Chapters</span>
        </h3>
        
        <div className="space-y-1">
          <button
            onClick={() => setSelectedTopicSlug(null)}
            className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-smooth ${
              selectedTopicSlug === null
                ? 'bg-primary/10 border border-primary/20 text-blue-400'
                : 'text-slate-400 hover:bg-slate-900/40 hover:text-slate-200'
            }`}
          >
            <span>All Topics</span>
            <span className="bg-slate-800 text-[10px] text-slate-300 px-2 py-0.5 rounded-full font-mono">
              {problems.length}
            </span>
          </button>

          {topics.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedTopicSlug(t.slug)}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-smooth ${
                selectedTopicSlug === t.slug
                  ? 'bg-primary/10 border border-primary/20 text-blue-400'
                  : 'text-slate-400 hover:bg-slate-900/40 hover:text-slate-200'
              }`}
            >
              <div className="truncate pr-2">
                <span>{t.name}</span>
              </div>
              <div className="flex items-center space-x-1 flex-shrink-0 font-mono text-[9px]">
                <span className="text-emerald-400">{t.solved}</span>
                <span className="text-slate-600">/</span>
                <span className="text-slate-400">{t.total}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Area: Problems catalog list */}
      <div className="lg:col-span-3 space-y-4">
        
        {/* Controls: Search, filter widgets */}
        <div className="glass-panel glass-panel-hover rounded-2xl p-5 space-y-4">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, master number, or LeetCode id..."
                className="w-full glass-input glass-input-search rounded-xl pr-4 py-2.5 text-sm"
              />
            </div>

            {/* Sorting selector */}
            <div className="flex items-center space-x-2 bg-slate-900/40 border border-slate-800 rounded-xl px-3 py-1">
              <ArrowUpDown className="h-4 w-4 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-xs text-slate-300 border-none outline-none font-semibold cursor-pointer"
              >
                <option value="masterNumber" className="bg-slate-900">Master Order</option>
                <option value="leetcodeNumber" className="bg-slate-900">LeetCode ID</option>
                <option value="alphabetical" className="bg-slate-900">Alphabetical</option>
              </select>
            </div>
          </div>

          {/* Quick Filters buttons Row */}
          <div className="flex flex-wrap gap-2 items-center">
            {/* Difficulty Filter */}
            <div className="flex bg-slate-900/60 p-1 rounded-xl border border-slate-800 text-[10px] font-bold">
              {['ALL', 'EASY', 'MEDIUM', 'HARD'].map(d => (
                <button
                  key={d}
                  onClick={() => setSelectedDifficulty(d)}
                  className={`px-3 py-1.5 rounded-lg uppercase tracking-wider transition-smooth ${
                    selectedDifficulty === d 
                      ? 'bg-accent text-white shadow-glow-accent font-black' 
                      : 'text-slate-500 hover:text-slate-300 font-semibold'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>

            {/* Status Filter */}
            <div className="flex bg-slate-900/60 p-1 rounded-xl border border-slate-800 text-[10px] font-bold">
              {['ALL', 'UNSOLVED', 'SOLVED', 'ATTEMPTED'].map(s => (
                <button
                  key={s}
                  onClick={() => setSelectedStatus(s)}
                  className={`px-3 py-1.5 rounded-lg uppercase tracking-wider transition-smooth ${
                    selectedStatus === s 
                      ? 'bg-accent text-white shadow-glow-accent font-black' 
                      : 'text-slate-500 hover:text-slate-300 font-semibold'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Status Source Toggle */}
            <div className="flex bg-slate-900/60 p-1 rounded-xl border border-slate-800 text-[10px] font-bold">
              <button
                onClick={() => setStatusSource('patternforge')}
                className={`px-3 py-1.5 rounded-lg uppercase tracking-wider transition-smooth cursor-pointer ${
                  statusSource === 'patternforge'
                    ? 'bg-accent text-white shadow-glow-accent font-black'
                    : 'text-slate-500 hover:text-slate-300 font-semibold'
                }`}
              >
                PatternForge
              </button>
              <button
                onClick={() => setStatusSource('leetcode')}
                className={`px-3 py-1.5 rounded-lg uppercase tracking-wider transition-smooth cursor-pointer ${
                  statusSource === 'leetcode'
                    ? 'bg-amber-500 text-slate-950 font-black shadow-[0_0_8px_rgba(245,158,11,0.15)]'
                    : 'text-slate-500 hover:text-slate-300 font-semibold'
                }`}
              >
                LeetCode
              </button>
            </div>

            {/* Bookmark Filter */}
            <button
              onClick={() => setOnlyBookmarked(!onlyBookmarked)}
              className={`px-3 py-1.5 rounded-xl border text-[10px] font-bold uppercase tracking-wider transition-smooth ${
                onlyBookmarked 
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' 
                  : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:text-slate-300'
              }`}
            >
              Bookmarked
            </button>

            {/* Revision Filter */}
            <button
              onClick={() => setOnlyNeedRevision(!onlyNeedRevision)}
              className={`px-3 py-1.5 rounded-xl border text-[10px] font-bold uppercase tracking-wider transition-smooth ${
                onlyNeedRevision 
                  ? 'bg-red-500/10 border-red-500/30 text-red-400' 
                  : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:text-slate-300'
              }`}
            >
              Needs Revision
            </button>

            {/* Layout Mode Toggles */}
            <div className="flex items-center space-x-1.5 bg-slate-900/60 p-1 rounded-xl border border-slate-800/80 ml-auto self-end sm:self-auto">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider font-mono px-1">Layout</span>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-smooth cursor-pointer ${
                  viewMode === 'table' ? 'bg-slate-800 text-blue-400 border border-slate-700/60' : 'text-slate-505 hover:text-slate-350'
                }`}
                title="Table List View"
              >
                <TableProperties className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded-lg transition-smooth cursor-pointer ${
                  viewMode === 'cards' ? 'bg-slate-800 text-blue-400 border border-slate-700/60' : 'text-slate-505 hover:text-slate-350'
                }`}
                title="2-Column Cards Grid View"
              >
                <LayoutGrid className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-smooth cursor-pointer ${
                  viewMode === 'list' ? 'bg-slate-800 text-blue-400 border border-slate-700/60' : 'text-slate-505 hover:text-slate-350'
                }`}
                title="2-Column Compact List View"
              >
                <ListIcon className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Problems catalog view */}
        {statusSource === 'leetcode' && !leetcodeStatus?.connected ? (
          <div className="glass-panel text-center py-12 border border-amber-500/10 rounded-2xl space-y-4 max-w-xl mx-auto">
            <AlertCircle className="h-10 w-10 text-amber-500 mx-auto" />
            <div className="space-y-1">
              <h4 className="text-slate-200 font-extrabold text-sm">LeetCode has not been synced yet</h4>
              <p className="text-slate-500 text-xs px-6">
                Sync your solved problems to use LeetCode filters and display solved markers in your Problems List.
              </p>
            </div>
            <button
              onClick={() => {
                window.dispatchEvent(new CustomEvent('switch-tab', { detail: 'settings' }));
              }}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 shadow-glow-accent text-xs font-black text-slate-950 transition-smooth"
            >
              Setup Sync
            </button>
          </div>
        ) : filteredProblems.length === 0 ? (
          <div className="glass-panel text-center py-12 border border-slate-900 rounded-2xl text-slate-500 font-medium">
            No problems match the current filter selection.
          </div>
        ) : viewMode === 'table' ? (
          <div className="glass-panel glass-panel-hover rounded-2xl overflow-hidden animate-fade-in">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/20 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-4 px-5 w-16">{selectedTopicSlug ? 'Topic #' : 'Master #'}</th>
                    <th className="py-4 px-2 w-16">Leet</th>
                    <th className="py-4 px-4">Problem Name</th>
                    <th className="py-4 px-4 w-28">Topic</th>
                    <th className="py-4 px-4 w-20">Difficulty</th>
                    <th className="py-4 px-4 w-16 text-center">LC</th>
                    <th className="py-4 px-4 w-16 text-center">Status</th>
                    <th className="py-4 px-2 w-12 text-center"></th>
                    <th className="py-4 px-5 w-12 text-center"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProblems.map((p) => (
                    <tr
                      key={p.id}
                      onClick={() => navigateToProblem(p.id)}
                      className="border-b border-slate-800 hover:bg-slate-900/30 cursor-pointer transition-smooth group"
                    >
                      <td className="py-3.5 px-5 font-mono text-slate-500 font-semibold">
                        #{selectedTopicSlug ? p.topicNumber : p.masterNumber}
                      </td>
                      <td className="py-3.5 px-2 font-mono text-slate-400 font-medium">
                        {p.leetcodeNumber}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-200 group-hover:text-primary transition-smooth">
                        <div className="flex items-center space-x-2">
                          <span>{p.name}</span>
                          {p.needRevision && (
                            <span className="bg-red-500/10 text-red-400 text-[9px] font-bold px-1.5 py-0.5 rounded-md flex items-center space-x-1 select-none flex-shrink-0 border border-red-500/10">
                              <AlertCircle className="h-3 w-3" />
                              <span>Revise</span>
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 font-medium">
                        {p.topicName}
                      </td>
                      <td className="py-3.5 px-4 font-semibold">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          p.difficulty === 'EASY' ? 'text-emerald-400 bg-emerald-500/10' :
                          p.difficulty === 'MEDIUM' ? 'text-amber-400 bg-amber-500/10' : 'text-red-400 bg-red-500/10'
                        }`}>
                          {p.difficulty}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center" title={!leetcodeStatus?.connected ? "LeetCode not synced yet" : p.leetcodeSolved ? "Solved on LeetCode" : "Not solved on LeetCode"}>
                        <div className="flex justify-center">
                          {!leetcodeStatus?.connected ? (
                            <Code2 className="h-4 w-4 text-slate-600/40 cursor-default" />
                          ) : p.leetcodeSolved ? (
                            <Code2 className="h-4 w-4 text-emerald-400 cursor-default filter drop-shadow-[0_0_5px_rgba(52,211,153,0.3)]" />
                          ) : (
                            <Code2 className="h-4 w-4 text-slate-650 cursor-default" />
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex justify-center">
                          {p.status === 'SOLVED' && (
                            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                          )}
                          {p.status === 'WRONG' && (
                            <XCircle className="h-5 w-5 text-red-400" />
                          )}
                          {p.status === 'ATTEMPTED' && (
                            <div className="h-2 w-2 rounded-full bg-amber-500 shadow-glow-accent animate-pulse"></div>
                          )}
                          {p.status === 'UNSOLVED' && (
                            <div className="h-2.5 w-2.5 rounded-full border border-slate-700 bg-transparent"></div>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-2 text-center">
                        <div className="flex justify-center">
                          {generatingIds[p.id] ? (
                            <span 
                              title="Generating AI details..."
                              className="inline-flex items-center justify-center p-1 text-blue-400 cursor-default"
                            >
                              <Sparkles className="h-[16px] w-[16px] animate-spin" />
                            </span>
                          ) : p.isAiReady ? (
                            <span 
                              title="AI details already generated. Loaded instantly from MongoDB."
                              className="inline-flex items-center justify-center p-1 text-emerald-400 hover:drop-shadow-[0_0_8px_rgba(16,185,129,0.3)] cursor-default transition-all duration-300"
                            >
                              <Sparkles className="h-[16px] w-[16px]" />
                            </span>
                          ) : (
                            <span 
                              onClick={(e) => handleAiClick(p.id, e, false)}
                              title="AI details not generated. Open the problem or click this icon to generate and permanently cache the AI data."
                              className="inline-flex items-center justify-center p-1 text-slate-500 hover:text-slate-350 hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.15)] cursor-pointer transition-all duration-300"
                            >
                              <Sparkles className="h-[16px] w-[16px]" />
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-5 text-center">
                        <button
                          onClick={(e) => toggleBookmark(p.id, e)}
                          className="text-slate-650 hover:text-amber-400 transition-smooth p-1"
                        >
                          {p.isFavorite ? (
                            <BookmarkCheck className="h-4 w-4 text-amber-400 fill-amber-500/20" />
                          ) : (
                            <Bookmark className="h-4 w-4" />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : viewMode === 'cards' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
            {filteredProblems.map((p) => (
              <div 
                key={p.id}
                onClick={() => navigateToProblem(p.id)}
                className={`glass-panel border p-4 rounded-xl hover:border-slate-750 transition-all duration-300 flex flex-col justify-between space-y-3 cursor-pointer relative overflow-hidden group ${
                  p.status === 'SOLVED' ? 'bg-emerald-950/5 border-emerald-500/10' : 'bg-slate-900/20 border-slate-900'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-550 font-mono">
                    #{selectedTopicSlug ? p.topicNumber : p.masterNumber} {p.leetcodeNumber > 0 && `(LC ${p.leetcodeNumber})`}
                  </span>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                    p.difficulty === 'EASY' ? 'text-emerald-400 bg-emerald-500/10' :
                    p.difficulty === 'MEDIUM' ? 'text-amber-400 bg-amber-500/10' : 'text-red-400 bg-red-500/10'
                  }`}>
                    {p.difficulty}
                  </span>
                </div>
                
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-200 group-hover:text-primary transition-smooth flex items-center gap-1.5">
                    <span className="truncate">{p.name}</span>
                    {p.needRevision && (
                      <span className="bg-red-500/10 text-red-400 text-[8px] font-extrabold px-1 py-0.5 rounded border border-red-500/10 uppercase tracking-wider flex-shrink-0">
                        Revise
                      </span>
                    )}
                  </h4>
                  <p className="text-[10px] text-slate-550 font-mono">{p.topicName}</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-900/40">
                  <div className="flex items-center space-x-1.5">
                    {p.status === 'SOLVED' && <span className="text-[9px] font-bold text-emerald-400 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Solved</span>}
                    {p.status === 'WRONG' && <span className="text-[9px] font-bold text-red-400 flex items-center gap-1"><XCircle className="h-3 w-3" /> Wrong</span>}
                    {p.status === 'ATTEMPTED' && <span className="text-[9px] font-bold text-amber-400 flex items-center gap-1"><div className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse"></div> Attempted</span>}
                    {p.status === 'UNSOLVED' && <span className="text-[9px] font-bold text-slate-500">Unsolved</span>}

                    {leetcodeStatus?.connected && (
                      <span className="text-[10px] text-slate-800 font-bold px-1">|</span>
                    )}
                    {leetcodeStatus?.connected && p.leetcodeSolved && (
                      <span className="text-[9px] font-bold text-emerald-400 flex items-center gap-1" title="Solved on LeetCode">
                        <Code2 className="h-3.5 w-3.5 filter drop-shadow-[0_0_4px_rgba(52,211,153,0.3)] text-emerald-400" />
                        <span>LC Solved</span>
                      </span>
                    )}
                    {leetcodeStatus?.connected && !p.leetcodeSolved && (
                      <span className="text-[9px] font-bold text-slate-500 flex items-center gap-1" title="Not solved on LeetCode">
                        <Code2 className="h-3.5 w-3.5 text-slate-700" />
                        <span>LC Unsolved</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-2" onClick={e => e.stopPropagation()}>
                    {generatingIds[p.id] ? (
                      <Sparkles className="h-3.5 w-3.5 text-blue-400 animate-spin" />
                    ) : p.isAiReady ? (
                      <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                    ) : (
                      <Sparkles 
                        onClick={(e) => handleAiClick(p.id, e, false)}
                        className="h-3.5 w-3.5 text-slate-500 hover:text-slate-350 cursor-pointer transition-colors" 
                      />
                    )}

                    <button onClick={(e) => toggleBookmark(p.id, e)} className="text-slate-650 hover:text-amber-400 p-0.5 animate-pulse-none">
                      {p.isFavorite ? (
                        <BookmarkCheck className="h-3.5 w-3.5 text-amber-400 fill-amber-500/20" />
                      ) : (
                        <Bookmark className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 animate-fade-in">
            {filteredProblems.map((p) => (
              <div 
                key={p.id}
                onClick={() => navigateToProblem(p.id)}
                className={`glass-panel border px-4 py-2.5 rounded-xl hover:border-slate-750 transition-all duration-300 flex items-center justify-between gap-3 cursor-pointer relative overflow-hidden group ${
                  p.status === 'SOLVED' ? 'bg-emerald-950/5 border-emerald-500/10' : 'bg-slate-900/20 border-slate-900'
                }`}
              >
                <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                  {p.status === 'SOLVED' && <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />}
                  {p.status === 'WRONG' && <XCircle className="h-4 w-4 text-red-400 shrink-0" />}
                  {p.status === 'ATTEMPTED' && <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse shrink-0"></div>}
                  {p.status === 'UNSOLVED' && <div className="h-2.5 w-2.5 rounded-full border border-slate-700 bg-transparent shrink-0"></div>}
                  
                  {leetcodeStatus?.connected && (
                    p.leetcodeSolved ? (
                      <span className="shrink-0 flex items-center" title="Solved on LeetCode">
                        <Code2 className="h-4 w-4 text-emerald-400 filter drop-shadow-[0_0_4px_rgba(52,211,153,0.3)] animate-fade-in" />
                      </span>
                    ) : (
                      <span className="shrink-0 flex items-center" title="Not solved on LeetCode">
                        <Code2 className="h-4 w-4 text-slate-700 animate-fade-in" />
                      </span>
                    )
                  )}

                  <span className="text-[10px] font-bold text-slate-550 font-mono shrink-0">#{selectedTopicSlug ? p.topicNumber : p.masterNumber}</span>
                  
                  <h4 className="text-xs font-bold text-slate-200 group-hover:text-primary transition-smooth truncate">
                    {p.name}
                  </h4>
                </div>

                <div className="flex items-center space-x-3 shrink-0">
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                    p.difficulty === 'EASY' ? 'text-emerald-400 bg-emerald-500/10' :
                    p.difficulty === 'MEDIUM' ? 'text-amber-400 bg-amber-500/10' : 'text-red-400 bg-red-500/10'
                  }`}>
                    {p.difficulty}
                  </span>
                  
                  <div className="flex items-center space-x-1.5" onClick={e => e.stopPropagation()}>
                    {generatingIds[p.id] ? (
                      <Sparkles className="h-3.5 w-3.5 text-blue-400 animate-spin" />
                    ) : p.isAiReady ? (
                      <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                    ) : (
                      <Sparkles onClick={(e) => handleAiClick(p.id, e, false)} className="h-3.5 w-3.5 text-slate-500 hover:text-slate-350 cursor-pointer" />
                    )}
                    <button onClick={(e) => toggleBookmark(p.id, e)} className="text-slate-650 hover:text-amber-400 p-0.5">
                      {p.isFavorite ? <BookmarkCheck className="h-3.5 w-3.5 text-amber-400 fill-amber-500/10" /> : <Bookmark className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Explorer;
