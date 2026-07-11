import React, { useEffect, useState } from 'react';
import { X, Copy, Check } from 'lucide-react';
import MonacoEditor from '@monaco-editor/react';

interface FullscreenCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  code: string;
  language: string;
  title: string;
  /** Kept for API compatibility – no longer used internally */
  highlightFn?: (code: string, language: string) => string;
}

const FullscreenCodeModal: React.FC<FullscreenCodeModalProps> = ({
  isOpen,
  onClose,
  code,
  language,
  title,
}) => {
  // Normalise language identifier for Monaco
  const monacoLanguage =
    language === 'cpp' ? 'cpp' :
    language === 'java' ? 'java' :
    language === 'python' || language === 'py' ? 'python' :
    language === 'sql' ? 'sql' :
    language === 'js' || language === 'javascript' ? 'javascript' :
    language === 'ts' || language === 'typescript' ? 'typescript' :
    'cpp';
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

        {/* Monaco Editor Body */}
        <div className="flex-1 min-h-0 w-full">
          <MonacoEditor
            height="100%"
            language={monacoLanguage}
            value={code || ''}
            theme="vs-dark"
            options={{
              readOnly: true,
              minimap: { enabled: true },
              fontSize: 13,
              lineNumbers: 'on',
              scrollBeyondLastLine: false,
              wordWrap: 'off',
              automaticLayout: true,
              renderLineHighlight: 'line',
              smoothScrolling: true,
              cursorBlinking: 'phase',
              folding: true,
              contextmenu: false,
              scrollbar: {
                verticalScrollbarSize: 8,
                horizontalScrollbarSize: 8,
              },
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default FullscreenCodeModal;
