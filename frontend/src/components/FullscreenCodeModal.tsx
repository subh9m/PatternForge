import React, { useEffect, useState } from 'react';
import { X, Copy, Check } from 'lucide-react';

interface FullscreenCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  code: string;
  language: string;
  title: string;
  highlightFn: (code: string, language: string) => string;
}

const FullscreenCodeModal: React.FC<FullscreenCodeModalProps> = ({
  isOpen,
  onClose,
  code,
  language,
  title,
  highlightFn
}) => {
  const [copied, setCopied] = useState(false);

  // Esc key closure
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCopy = () => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = (code || '').split('\n');
  const lineNumbers = lines.map((_, i) => i + 1).join('\n');
  const highlightedHtml = highlightFn(code || '', language);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/85 backdrop-blur-md transition-opacity duration-300">
      <div className="bg-[#1e1e1e] border border-slate-800 rounded-2xl w-full max-w-[95vw] h-[90vh] flex flex-col shadow-2xl overflow-hidden relative transform scale-100 transition-transform duration-300 animate-scaleIn">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-900 bg-slate-950/60 flex items-center justify-between text-xs shrink-0 select-none">
          <div className="space-y-0.5">
            <h3 className="text-slate-100 text-sm font-black tracking-wide">{title}</h3>
            <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Fullscreen View Mode</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="px-2 py-0.5 bg-slate-900 border border-slate-800 rounded text-[9px] font-bold text-slate-400 uppercase font-mono">
              {language}
            </span>

            <div className="flex items-center space-x-1.5 border-l border-slate-900 pl-4">
              {/* Copy Code */}
              <button
                onClick={handleCopy}
                title="Copy Code"
                className="p-1.5 hover:bg-slate-900 rounded-lg text-slate-400 hover:text-slate-200 transition-colors duration-150 cursor-pointer relative group"
              >
                {copied ? (
                  <Check className="h-4.5 w-4.5 text-emerald-400" />
                ) : (
                  <Copy className="h-4.5 w-4.5" />
                )}
                <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-slate-950 text-slate-200 text-[10px] px-2 py-1 rounded border border-slate-800 whitespace-nowrap shadow-md transition-opacity duration-150 z-50">
                  Copy code
                </span>
              </button>

              {/* Close Fullscreen */}
              <button
                onClick={onClose}
                title="Exit Fullscreen"
                className="p-1.5 hover:bg-slate-900 rounded-lg text-slate-400 hover:text-red-400 transition-colors duration-150 cursor-pointer relative group"
              >
                <X className="h-4.5 w-4.5" />
                <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-slate-950 text-slate-200 text-[10px] px-2 py-1 rounded border border-slate-800 whitespace-nowrap shadow-md transition-opacity duration-150 z-50">
                  Exit Fullscreen
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Code Body */}
        <div className="flex-1 w-full overflow-y-auto bg-[#1e1e1e] flex select-text min-h-0 relative">
          <div className="flex-1 flex items-stretch font-mono text-[12.5px] leading-relaxed w-full">
            {/* Gutter / Line Numbers */}
            <pre className="select-none text-right pr-4 text-slate-600 bg-slate-950/20 border-r border-slate-900 py-5 pl-4 shrink-0 font-mono text-right min-w-[3.5rem] leading-relaxed">
              {lineNumbers}
            </pre>
            {/* Highlighted Code block */}
            <pre className="flex-1 p-5 overflow-auto text-[#d4d4d4] whitespace-pre select-text font-mono leading-relaxed custom-scrollbar">
              <code dangerouslySetInnerHTML={{ __html: highlightedHtml }} />
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FullscreenCodeModal;
