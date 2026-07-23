import React, { useEffect, useState, useRef } from 'react';
import { api } from '../services/api';
import { Sparkles, AlertCircle, RefreshCw, XCircle } from 'lucide-react';

interface AiGenerationFullscreenLoaderProps {
  problemId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const FRIENDLY_PHRASES = [
  "Structuring algorithm constraints...",
  "Consulting the AI oracle...",
  "Drafting optimal C++ solutions...",
  "Analyzing spatial & temporal tradeoffs...",
  "Formulating brute-force strategies...",
  "Double-checking edge cases..."
];

const AiGenerationFullscreenLoader: React.FC<AiGenerationFullscreenLoaderProps> = ({
  problemId,
  onSuccess,
  onCancel
}) => {
  const [timeLeft, setTimeLeft] = useState(6);
  const [displayEstimate, setDisplayEstimate] = useState("Estimating...");
  const [currentPhrase, setCurrentPhrase] = useState(FRIENDLY_PHRASES[0]);
  const [failed, setFailed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isAlreadyGenerating, setIsAlreadyGenerating] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [queuePosition, setQueuePosition] = useState<number | null>(null);

  const startRef = useRef(false);

  // Track elapsed seconds
  useEffect(() => {
    if (failed || !loading) return;
    const interval = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [failed, loading]);

  // Rotate friendly phrases if no specific stage is reported by backend
  useEffect(() => {
    if (failed || !loading || currentPhrase.includes("...")) {
      // If we have active stage reported from polling, don't auto-rotate
      return;
    }
    const phraseInterval = setInterval(() => {
      setCurrentPhrase(prev => {
        const idx = FRIENDLY_PHRASES.indexOf(prev);
        if (idx === -1) return FRIENDLY_PHRASES[0];
        const nextIdx = (idx + 1) % FRIENDLY_PHRASES.length;
        return FRIENDLY_PHRASES[nextIdx];
      });
    }, 4500);
    return () => clearInterval(phraseInterval);
  }, [failed, loading, currentPhrase]);

  // Backward countdown timer (does not count below 1, switches to Almost Done)
  useEffect(() => {
    if (failed || !loading) return;
    const countdown = setInterval(() => {
      setTimeLeft(prev => (prev > 1 ? prev - 1 : 1));
    }, 1000);
    return () => clearInterval(countdown);
  }, [failed, loading]);

  // Dynamic status polling to update stage, active provider, queue, and ETA
  useEffect(() => {
    if (failed || !loading) return;

    const pollStatus = async () => {
      try {
        const jobs = await api.get<any[]>('/problems/generation-jobs');
        const existingJob = jobs.find(j => j.problemId === problemId);

        if (existingJob) {
          if (existingJob.status === 'QUEUED') {
            const pos = jobs.filter(j => j.status === 'QUEUED' && j.startTime < existingJob.startTime).length + 1;
            setQueuePosition(pos);
            setCurrentPhrase("Queued");
            setDisplayEstimate(`Position: ${pos}`);
          } else if (existingJob.status === 'GENERATING') {
            setQueuePosition(null);
            setIsAlreadyGenerating(true);
            
            // Set current stage
            if (existingJob.stage) {
              setCurrentPhrase(existingJob.stage);
            }
            
            if (existingJob.activeProvider) {
              setDisplayEstimate(`Generating using ${existingJob.activeProvider}...`);
            }
          }
        }
      } catch (e) {
        // Silently ignore polling errors
      }
    };

    pollStatus();
    const interval = setInterval(pollStatus, 2000);
    return () => clearInterval(interval);
  }, [failed, loading, problemId]);

  const loadDataAndGenerate = async () => {
    setLoading(true);
    setFailed(false);
    setElapsedSeconds(0);
    
    let alreadyGenerating = false;
    try {
      // 1. Fetch current active jobs
      try {
        const jobs = await api.get<any[]>('/problems/generation-jobs');
        const existingJob = jobs.find(j => j.problemId === problemId);
        if (existingJob && (existingJob.status === 'QUEUED' || existingJob.status === 'GENERATING')) {
          alreadyGenerating = true;
          setIsAlreadyGenerating(true);
          if (existingJob.status === 'GENERATING') {
            setCurrentPhrase(existingJob.stage || "Contacting AI provider...");
          }
        }
      } catch (e) {
        // Silently skip
      }

      // 2. Fetch rolling average estimate from backend
      try {
        const est = await api.get<{ averageSeconds: number; displayString: string; confidence: string }>('/problems/generation-estimate');
        setTimeLeft(est.averageSeconds || 5);
        setDisplayEstimate(est.displayString || "Estimating...");
      } catch (e) {
        setTimeLeft(5);
        setDisplayEstimate("Estimating...");
      }

      // 3. Fetch basic details and solution details in parallel
      const cacheKey = `pf_details_${problemId}`;
      const [basicData, solData] = await Promise.all([
        api.get<any>(`/problems/${problemId}/basic-details`),
        api.get<any>(`/problems/${problemId}/solution-details`)
      ]);

      const mergedDetails = { ...basicData, ...solData };
      
      // Store in cache only if not failed
      localStorage.setItem(cacheKey, JSON.stringify(mergedDetails));

      setLoading(false);
      onSuccess();
    } catch (err) {
      console.error("AI Generation workflow failed:", err);
      setFailed(true);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!startRef.current) {
      startRef.current = true;
      loadDataAndGenerate();
    }
  }, [problemId]);

  // Determine dynamic message to show the user
  const getSubtextMessage = () => {
    if (queuePosition !== null) {
      return `Waiting in line. System is processing other generation jobs.`;
    }
    if (elapsedSeconds >= 15) {
      return "Still working... We're making sure everything is generated correctly.";
    }
    if (elapsedSeconds >= 10) {
      return "This problem is taking a little longer because the AI is generating a detailed explanation.";
    }
    if (elapsedSeconds > timeLeft) {
      return "Taking a little longer than usual...";
    }
    return "PatternForge is analyzing problem structures to cache optimal strategies.";
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] py-12 px-6 text-center select-none font-sans">
      <div className="glass-panel border border-slate-800 rounded-3xl p-8 max-w-md w-full shadow-2xl bg-slate-950/20 backdrop-blur-sm relative overflow-hidden">
        
        {/* Glow indicator */}
        <div className={`absolute -top-24 -left-24 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none transition-colors duration-500 ${failed ? 'bg-red-500' : 'bg-blue-500'}`} />

        {!failed ? (
          <div className="flex flex-col items-center space-y-6">
            <div className="p-4 bg-blue-500/10 text-blue-400 rounded-2xl border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)] relative">
              <Sparkles className="h-8 w-8 animate-pulse" />
              <div className="absolute inset-0 rounded-2xl border border-blue-400/40 animate-ping pointer-events-none opacity-20" />
            </div>

            <div className="space-y-1">
              <h2 className="text-lg font-black text-slate-100 uppercase tracking-wide">
                {queuePosition !== null ? "Queued in Background" : (isAlreadyGenerating ? "Generating Explanation..." : "Generating AI Details")}
              </h2>
              <p className="text-slate-400 text-xs leading-relaxed max-w-xs mx-auto min-h-[40px]">
                {getSubtextMessage()}
              </p>
            </div>

            {/* Stage Progress */}
            <div className="h-6 flex items-center justify-center">
              <p className="text-blue-400 text-xs font-bold font-mono tracking-wide animate-pulse">
                {currentPhrase}
              </p>
            </div>

            {/* Estimate Timer */}
            <div className="bg-slate-900/40 border border-slate-800/80 px-6 py-3 rounded-xl min-w-[240px] space-y-0.5">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block font-mono">
                {displayEstimate}
              </span>
              <span className="text-slate-300 text-sm font-black font-mono block">
                {elapsedSeconds > timeLeft ? "Almost done..." : `Estimated wait: ~${timeLeft - elapsedSeconds}s`}
              </span>
            </div>

            <button
              onClick={onCancel}
              className="text-slate-500 hover:text-slate-300 text-xs font-bold uppercase tracking-wider font-mono cursor-pointer transition-colors pt-2 bg-slate-900/60 border border-slate-800 px-4 py-2 rounded-xl hover:border-slate-700"
            >
              Explore More
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-6">
            <div className="p-4 bg-red-500/10 text-red-400 rounded-2xl border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]">
              <AlertCircle className="h-8 w-8" />
            </div>

            <div className="space-y-1">
              <h2 className="text-lg font-black text-slate-100 uppercase tracking-wide">Generation Failed</h2>
              <p className="text-slate-400 text-xs leading-relaxed max-w-xs mx-auto">
                All configured AI providers are currently experiencing heavy traffic congestion or auth cooldowns. We will automatically retry in the background.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full pt-2">
              <button
                onClick={loadDataAndGenerate}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-smooth cursor-pointer shadow-md hover:shadow-blue-500/10"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Retry Generation</span>
              </button>
              
              <button
                onClick={onCancel}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 rounded-xl text-xs font-black uppercase tracking-wider transition-smooth cursor-pointer"
              >
                <XCircle className="h-3.5 w-3.5" />
                <span>Cancel</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AiGenerationFullscreenLoader;
