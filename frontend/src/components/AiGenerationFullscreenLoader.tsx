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
  "Consulting the Gemini oracle...",
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
  const [timeLeft, setTimeLeft] = useState(35);
  const [displayEstimate, setDisplayEstimate] = useState("Usually takes around 35 seconds");
  const [currentPhrase, setCurrentPhrase] = useState(FRIENDLY_PHRASES[0]);
  const [failed, setFailed] = useState(false);
  const [loading, setLoading] = useState(true);

  const startRef = useRef(false);

  // Rotate friendly phrases
  useEffect(() => {
    if (failed || !loading) return;
    const phraseInterval = setInterval(() => {
      setCurrentPhrase(prev => {
        const idx = FRIENDLY_PHRASES.indexOf(prev);
        const nextIdx = (idx + 1) % FRIENDLY_PHRASES.length;
        return FRIENDLY_PHRASES[nextIdx];
      });
    }, 4500);
    return () => clearInterval(phraseInterval);
  }, [failed, loading]);

  // Backward countdown timer
  useEffect(() => {
    if (failed || !loading) return;
    const countdown = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(countdown);
  }, [failed, loading]);

  const loadDataAndGenerate = async () => {
    setLoading(true);
    setFailed(false);
    
    try {
      // 1. Fetch current rolling average estimate from backend
      try {
        const est = await api.get<{ averageSeconds: number; displayString: string }>('/problems/generation-estimate');
        setTimeLeft(est.averageSeconds || 35);
        setDisplayEstimate(est.displayString || "Usually takes around 35 seconds");
      } catch (e) {
        // Fallback to default
        setTimeLeft(35);
        setDisplayEstimate("Usually takes around 35 seconds");
      }

      // 2. Fetch basic details and solution details in parallel
      const cacheKey = `pf_details_${problemId}`;
      const [basicData, solData] = await Promise.all([
        api.get<any>(`/problems/${problemId}/basic-details`),
        api.get<any>(`/problems/${problemId}/solution-details`)
      ]);

      // 3. Merge details and save to local storage cache
      const mergedDetails = { ...basicData, ...solData };
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
              <h2 className="text-lg font-black text-slate-100 uppercase tracking-wide">Generating AI Details</h2>
              <p className="text-slate-400 text-xs leading-relaxed max-w-xs mx-auto">
                PatternForge is analyzing problem structures to cache optimal strategies.
              </p>
            </div>

            {/* Rotating Phrases */}
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
                Estimated Time: {timeLeft}s remaining
              </span>
            </div>

            <button
              onClick={onCancel}
              className="text-slate-500 hover:text-slate-300 text-xs font-bold uppercase tracking-wider font-mono cursor-pointer transition-colors pt-2"
            >
              Cancel & Go Back
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
                The Gemini API is currently experiencing traffic congestion. Please try again.
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
