import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { 
  Search, CheckCircle2, Bookmark, BookmarkCheck,
  AlertCircle, ArrowUpDown, XCircle, Grid
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

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTopicSlug, setSelectedTopicSlug] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [onlyBookmarked, setOnlyBookmarked] = useState(false);
  const [onlyNeedRevision, setOnlyNeedRevision] = useState(false);
  const [sortBy, setSortBy] = useState<string>('masterNumber');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [problemsData, topicsData] = await Promise.all([
          api.get<ProblemDto[]>('/problems'),
          api.get<TopicStats[]>('/problems/topics')
        ]);
        setProblems(problemsData);
        setTopics(topicsData);
      } catch (e) {
        console.error("Failed to load explorer data", e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

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

  // Filter Logic client-side for absolute lag-free speeds
  const filteredProblems = problems
    .filter(p => {
      if (selectedDifficulty !== 'ALL' && p.difficulty !== selectedDifficulty) return false;
      if (selectedTopicSlug) {
        const slug = p.topicName.toLowerCase().replaceAll(" & ", "-").replaceAll(" ", "-");
        if (slug !== selectedTopicSlug) return false;
      }
      if (selectedStatus !== 'ALL') {
        if (selectedStatus === 'SOLVED' && p.status !== 'SOLVED') return false;
        if (selectedStatus === 'UNSOLVED' && p.status !== 'UNSOLVED') return false;
        if (selectedStatus === 'ATTEMPTED' && p.status !== 'ATTEMPTED' && p.status !== 'WRONG') return false;
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
      <div className="lg:col-span-1 glass-panel rounded-2xl p-5 h-fit max-h-[85vh] overflow-y-auto">
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
        <div className="glass-panel rounded-2xl p-5 space-y-4">
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
          </div>
        </div>

        {/* Problems catalog table */}
        <div className="glass-panel rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/20 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-4 px-5 w-16">{selectedTopicSlug ? 'Topic #' : 'Master #'}</th>
                  <th className="py-4 px-2 w-16">Leet</th>
                  <th className="py-4 px-4">Problem Name</th>
                  <th className="py-4 px-4 w-28">Topic</th>
                  <th className="py-4 px-4 w-20">Difficulty</th>
                  <th className="py-4 px-4 w-16 text-center">Status</th>
                  <th className="py-4 px-5 w-12 text-center"></th>
                </tr>
              </thead>
              <tbody>
                {filteredProblems.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500 font-medium">
                      No problems match the current filter selection.
                    </td>
                  </tr>
                ) : (
                  filteredProblems.map((p) => (
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
                      <td className="py-3.5 px-5 text-center">
                        <button
                          onClick={(e) => toggleBookmark(p.id, e)}
                          className="text-slate-600 hover:text-amber-400 transition-smooth p-1"
                        >
                          {p.isFavorite ? (
                            <BookmarkCheck className="h-4 w-4 text-amber-400 fill-amber-500/20" />
                          ) : (
                            <Bookmark className="h-4 w-4" />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Explorer;
