import React, { useEffect, useState, useRef } from 'react';
import { api } from '../services/api';
import { Sparkles, CheckCircle, AlertCircle, HelpCircle, Loader2 } from 'lucide-react';

export interface JobProgress {
  problemId: string;
  problemName: string;
  status: 'QUEUED' | 'GENERATING' | 'COMPLETED' | 'FAILED';
  startTime: number;
  endTime: number;
}

interface AiActivityCenterProps {
  onOpenProblem: (id: string) => void;
  onJobCompleted?: (job: JobProgress) => void;
  onJobFailed?: (job: JobProgress) => void;
}

const AiActivityCenter: React.FC<AiActivityCenterProps> = ({ onOpenProblem, onJobCompleted, onJobFailed }) => {
  const [jobs, setJobs] = useState<JobProgress[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Track previously seen completed/failed jobs to avoid duplicate snackbars
  const seenCompletedRef = useRef<Set<string>>(new Set());
  const seenFailedRef = useRef<Set<string>>(new Set());

  const fetchJobs = async () => {
    try {
      const data = await api.get<JobProgress[]>('/problems/generation-jobs');
      setJobs(data || []);
      
      // Check for newly completed or failed jobs to notify parent
      data.forEach(job => {
        if (job.status === 'COMPLETED' && !seenCompletedRef.current.has(job.problemId)) {
          seenCompletedRef.current.add(job.problemId);
          if (onJobCompleted) {
            onJobCompleted(job);
          }
        } else if (job.status === 'FAILED' && !seenFailedRef.current.has(job.problemId)) {
          seenFailedRef.current.add(job.problemId);
          if (onJobFailed) {
            onJobFailed(job);
          }
        }
      });
    } catch (e) {
      console.error("Failed to fetch active generation jobs", e);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchJobs();
    
    // Polling interval
    const interval = setInterval(fetchJobs, 3000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeCount = jobs.filter(j => j.status === 'QUEUED' || j.status === 'GENERATING').length;

  return (
    <div className="relative font-sans" ref={dropdownRef}>
      {/* Navbar Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        title="AI Activity Center"
        className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 hover:bg-slate-900/90 text-slate-300 hover:text-slate-100 transition-all cursor-pointer relative group select-none"
      >
        <Sparkles className={`h-4 w-4 text-blue-400 ${activeCount > 0 ? 'animate-pulse' : ''}`} />
        <span className="text-xs font-mono font-bold">AI Tasks</span>
        
        {activeCount > 0 && (
          <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-blue-500 px-1 text-[9px] font-bold text-white font-mono animate-bounce ml-1">
            {activeCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu Overlay */}
      {isOpen && (
        <div className="absolute right-0 mt-2.5 w-80 bg-slate-950/95 border border-slate-800 rounded-2xl shadow-2xl p-4 z-50 backdrop-blur-md animate-fadeIn max-h-[420px] overflow-y-auto custom-scrollbar">
          <div className="flex items-center justify-between pb-3 border-b border-slate-900 mb-2">
            <span className="text-xs font-black uppercase text-slate-400 tracking-wider">AI Activity Center</span>
            {activeCount > 0 && (
              <span className="text-[10px] font-extrabold text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded-full font-mono">
                {activeCount} Active
              </span>
            )}
          </div>

          <div className="space-y-2 mt-1">
            {jobs.length === 0 ? (
              <div className="text-center py-6 text-slate-500 text-xs font-medium">
                No active or recent generation tasks.
              </div>
            ) : (
              jobs.map(job => (
                <div 
                  key={job.problemId}
                  onClick={() => {
                    if (job.status === 'COMPLETED') {
                      onOpenProblem(job.problemId);
                      setIsOpen(false);
                    }
                  }}
                  className={`p-3 rounded-xl border flex flex-col space-y-1.5 transition-all duration-200 ${
                    job.status === 'COMPLETED' 
                      ? 'bg-slate-900/40 border-slate-800/80 hover:bg-slate-900/80 cursor-pointer hover:border-slate-700' 
                      : 'bg-slate-950/20 border-slate-900 cursor-default'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-slate-200 truncate pr-2 max-w-[170px]" title={job.problemName}>
                      {job.problemName}
                    </span>
                    
                    {/* Status Badge */}
                    <div className="flex items-center space-x-1 shrink-0">
                      {job.status === 'QUEUED' && (
                        <>
                          <HelpCircle className="h-3 w-3 text-slate-500" />
                          <span className="text-[9px] font-bold text-slate-500 uppercase font-mono">Queued</span>
                        </>
                      )}
                      {job.status === 'GENERATING' && (
                        <>
                          <Loader2 className="h-3 w-3 text-blue-400 animate-spin" />
                          <span className="text-[9px] font-bold text-blue-400 uppercase font-mono animate-pulse">Generating</span>
                        </>
                      )}
                      {job.status === 'COMPLETED' && (
                        <>
                          <CheckCircle className="h-3 w-3 text-emerald-400" />
                          <span className="text-[9px] font-bold text-emerald-400 uppercase font-mono">Completed</span>
                        </>
                      )}
                      {job.status === 'FAILED' && (
                        <>
                          <AlertCircle className="h-3 w-3 text-red-400" />
                          <span className="text-[9px] font-bold text-red-400 uppercase font-mono">Failed</span>
                        </>
                      )}
                    </div>
                  </div>

                  {job.status === 'COMPLETED' && (
                    <div className="flex items-center justify-between text-[9px] font-mono text-slate-500 mt-1 pt-1 border-t border-slate-900/30">
                      <span>Click to open workspace</span>
                      <span className="text-emerald-500/80 font-bold hover:text-emerald-400">OPEN &rarr;</span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AiActivityCenter;
