import React, { useState } from 'react';
import { Play, RotateCcw, Cpu, Network, ArrowRight } from 'lucide-react';

export default function ReactPlayground() {
  const [activeTab, setActiveTab] = useState('diff'); // 'diff' or 'perf'

  // --- VIRTUAL DOM SIMULATOR STATE ---
  const [nodeType, setNodeType] = useState('same'); // 'same' (div -> div) or 'diff' (div -> span)
  const [propsChanged, setPropsChanged] = useState(true); // toggle if attributes update
  const [keyStyle, setKeyStyle] = useState('stable'); // 'stable' vs 'random'
  const [isDiffRunning, setIsDiffRunning] = useState(false);
  const [diffLogs, setDiffLogs] = useState(['Reconciliation engine is idle. Configure nodes and run diff.']);
  const [diffResults, setDiffResults] = useState(null); // 'rebuild', 'patch', etc.

  const runReconciliation = () => {
    if (isDiffRunning) return;
    setIsDiffRunning(true);
    setDiffLogs([
      `[Reconciler] State change detected in parent component.`,
      `[VDOM] Building new Virtual DOM tree in memory...`
    ]);

    setTimeout(() => {
      setDiffLogs(prev => [
        ...prev,
        `[Diff] Running reconciliation traversal (level-by-level breadth-first search)...`,
        `[Diff] Comparing root node: <Card> type matching old root... OK.`
      ]);

      setTimeout(() => {
        if (nodeType === 'diff') {
          setDiffLogs(prev => [
            ...prev,
            `[Diff] Comparing Child Node 1: Old type <div> vs New type <span>. Mismatch!`,
            `[Reconciliation] Heuristic triggers: Element types differ. Tearing down entire old subtree.`,
            `[Lifecycle] Unmounting Component tree and running cleanup handlers...`,
            `[DOM Write] Tearing down DOM element <div> and mounting fresh <span>.`
          ]);
          setDiffResults('rebuild');
        } else {
          setDiffLogs(prev => [
            ...prev,
            `[Diff] Comparing Child Node 1: Old type <div> vs New type <div>. Match.`,
            propsChanged 
              ? `[Reconciliation] Props updated (className: 'card' -> 'card bg-sky-50'). Keeping DOM node, patching attributes in place.`
              : `[Reconciliation] No props changed. Skipping DOM updates for this node.`
          ]);
          setDiffResults(propsChanged ? 'patch' : 'noop');
        }

        setTimeout(() => {
          if (keyStyle === 'random') {
            setDiffLogs(prev => [
              ...prev,
              `[Diff] Comparing List items: No stable keys provided (indices shifted / dynamic keys changed).`,
              `[Reconciliation] Unable to resolve node identities. Tearing down all list nodes and appending fresh elements.`,
              `[DOM Write] Re-rendering entire array list (O(N) full rewrite).`
            ]);
          } else {
            setDiffLogs(prev => [
              ...prev,
              `[Diff] Comparing List items: Stable unique keys matched ('user-101', 'user-102').`,
              `[Reconciliation] Items matched. Reordering indices inside DOM instead of rebuilding.`,
              `[DOM Write] Reordered elements in place (O(N) index swap).`
            ]);
          }

          setDiffLogs(prev => [
            ...prev,
            `🟢 Reconciliation complete. Batched writes committed to Real browser DOM successfully.`
          ]);
          setIsDiffRunning(false);
        }, 1200);

      }, 1200);

    }, 1200);
  };

  const resetDiff = () => {
    setDiffLogs(['Reconciliation engine is idle. Configure nodes and run diff.']);
    setDiffResults(null);
    setIsDiffRunning(false);
  };

  // --- PERF SIMULATOR STATE ---
  const [useMemoizedChild, setUseMemoizedChild] = useState(false);
  const [useCallbackRef, setUseCallbackRef] = useState(false);
  const [renderCount, setRenderCount] = useState({ parent: 0, child: 0, grandchild: 0 });
  const [flashStates, setFlashStates] = useState({ parent: false, child: false, grandchild: false });

  const triggerRenderCycle = () => {
    // 1. Parent always re-renders
    setRenderCount(prev => ({ ...prev, parent: prev.parent + 1 }));
    setFlashStates(prev => ({ ...prev, parent: true }));
    
    // Reset parent flash
    setTimeout(() => {
      setFlashStates(prev => ({ ...prev, parent: false }));
    }, 500);

    // 2. Child re-render check
    // Child re-renders if NOT memoized OR if callback ref changes (which happens if useCallback is disabled)
    const childWillReRender = !useMemoizedChild || !useCallbackRef;

    if (childWillReRender) {
      setTimeout(() => {
        setRenderCount(prev => ({ ...prev, child: prev.child + 1 }));
        setFlashStates(prev => ({ ...prev, child: true }));
        
        setTimeout(() => {
          setFlashStates(prev => ({ ...prev, child: false }));
        }, 500);

        // 3. Grandchild re-renders if child re-renders (unless grandchild itself is memoized, but in this basic tree it follows child)
        setTimeout(() => {
          setRenderCount(prev => ({ ...prev, grandchild: prev.grandchild + 1 }));
          setFlashStates(prev => ({ ...prev, grandchild: true }));
          
          setTimeout(() => {
            setFlashStates(prev => ({ ...prev, grandchild: false }));
          }, 500);
        }, 200);

      }, 200);
    }
  };

  const resetPerf = () => {
    setRenderCount({ parent: 0, child: 0, grandchild: 0 });
    setFlashStates({ parent: false, child: false, grandchild: false });
  };

  return (
    <div className="space-y-6">
      
      {/* Tab selectors */}
      <div className="flex border-b border-neutral-200 dark:border-neutral-800 dark:border-neutral-900 pb-3 gap-3">
        <button
          onClick={() => setActiveTab('diff')}
          className={`px-4 py-2 text-xs font-mono font-black uppercase rounded-lg border transition-all cursor-pointer flex items-center space-x-2
            ${activeTab === 'diff' 
              ? 'bg-sky-500/10 text-sky-500 border-sky-500/30 shadow-[0_0_15px_rgba(14,165,233,0.15)]' 
              : 'bg-transparent text-gray-555 dark:text-gray-455 border-neutral-200 dark:border-neutral-800 dark:border-neutral-900 hover:border-sky-500/20'}`}
        >
          <Cpu className="h-4 w-4" />
          <span>Virtual DOM Diffing</span>
        </button>
        <button
          onClick={() => setActiveTab('perf')}
          className={`px-4 py-2 text-xs font-mono font-black uppercase rounded-lg border transition-all cursor-pointer flex items-center space-x-2
            ${activeTab === 'perf' 
              ? 'bg-sky-500/10 text-sky-500 border-sky-500/30 shadow-[0_0_15px_rgba(14,165,233,0.15)]' 
              : 'bg-transparent text-gray-555 dark:text-gray-455 border-neutral-200 dark:border-neutral-800 dark:border-neutral-900 hover:border-sky-500/20'}`}
        >
          <Network className="h-4 w-4" />
          <span>Memo & References</span>
        </button>
      </div>

      {activeTab === 'diff' ? (
        // RECONCILIATION DIFFER CANVAS
        <div className="bg-white/80 dark:bg-neutral-950/70 backdrop-blur-md border border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 rounded-2xl p-6 md:p-8 shadow-lg space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 pb-4">
            <div>
              <h2 className="text-lg font-black text-gray-900 dark:text-white font-mono uppercase tracking-wide">
                <span>⚛️ Virtual DOM Reconciliation & Diffing Simulator</span>
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 font-light leading-relaxed">
                Toggle element properties to watch React diff tree nodes and generate targeted DOM write operations.
              </p>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={resetDiff}
                className="flex items-center space-x-2 px-3 py-1.5 bg-sky-500/10 hover:bg-sky-500/25 text-sky-500 border border-sky-500/20 rounded-lg text-xs font-mono font-black cursor-pointer transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset</span>
              </button>
              <button
                onClick={runReconciliation}
                disabled={isDiffRunning}
                className="flex items-center space-x-2 px-4 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-mono font-black cursor-pointer transition-colors shadow-lg hover:shadow-sky-500/20 disabled:bg-gray-400"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>{isDiffRunning ? 'Reconciling...' : 'Run Reconciliation'}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            
            {/* Control Sidebar */}
            <div className="lg:col-span-1 bg-white/15 dark:bg-neutral-900/30 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-900 rounded-xl p-4 space-y-4 font-mono text-xs">
              <span className="text-[10px] font-black text-slate-450 uppercase tracking-widest block border-b border-neutral-800 pb-1.5 font-bold">Heuristic Variables</span>
              
              <div className="space-y-1.5">
                <label className="text-[10px] text-gray-400 uppercase font-black tracking-wider">Node Type Comparison:</label>
                <div className="flex flex-col space-y-1">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="radio" checked={nodeType === 'same'} onChange={() => setNodeType('same')} className="text-sky-500 focus:ring-sky-500" />
                    <span>Same (div → div)</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="radio" checked={nodeType === 'diff'} onChange={() => setNodeType('diff')} className="text-sky-500 focus:ring-sky-500" />
                    <span>Differ (div → span)</span>
                  </label>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-gray-400 uppercase font-black tracking-wider">Props / Attributes:</label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" checked={propsChanged} onChange={(e) => setPropsChanged(e.target.checked)} className="text-sky-500 rounded focus:ring-sky-500" />
                  <span>Modify Props Class</span>
                </label>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-gray-400 uppercase font-black tracking-wider">List Array Key Style:</label>
                <div className="flex flex-col space-y-1">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="radio" checked={keyStyle === 'stable'} onChange={() => setKeyStyle('stable')} className="text-sky-500 focus:ring-sky-500" />
                    <span>Stable (key='101')</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="radio" checked={keyStyle === 'random'} onChange={() => setKeyStyle('random')} className="text-sky-500 focus:ring-sky-500" />
                    <span>Missing / Index key</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Tree Canvas */}
            <div className="lg:col-span-3 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-900 bg-neutral-950/65 rounded-xl p-5 min-h-[220px] flex flex-col justify-center relative overflow-hidden font-mono text-[10.5px]">
              
              <div className="flex justify-around items-center w-full z-10">
                
                {/* Node representation */}
                <div className="flex flex-col items-center space-y-4 w-full">
                  <div className="text-[8px] font-black uppercase text-gray-500 mb-2">Visual Rendering Update Status</div>
                  
                  <div className="flex justify-around items-center w-full gap-4">
                    {/* Root card */}
                    <div className="p-3 border border-sky-500 bg-sky-500/5 text-sky-400 rounded-xl text-center w-1/3">
                      <strong className="block">&lt;Card /&gt;</strong>
                      <span className="text-[8px] text-gray-500">Root Node</span>
                    </div>

                    <ArrowRight className="h-4 w-4 text-neutral-800" />

                    {/* Child Node status */}
                    <div className={`p-4 border rounded-xl text-center w-1/3 transition-all duration-500
                      ${diffResults === 'rebuild' ? 'border-red-500 bg-red-500/10 text-red-400 shadow-lg shadow-red-500/5' : 
                        diffResults === 'patch' ? 'border-yellow-500 bg-yellow-500/10 text-yellow-400' : 
                        diffResults === 'noop' ? 'border-neutral-800 bg-transparent text-gray-500' : 'border-neutral-800 text-gray-600'}`}>
                      <strong className="block">&lt;{nodeType === 'diff' && diffResults ? 'span' : 'div'}&gt;</strong>
                      <span className="text-[8px] opacity-75">
                        {diffResults === 'rebuild' ? '🚨 REBUILT (Unmounted)' : 
                         diffResults === 'patch' ? '⚠️ PATCHED Props' : 'Retained'}
                      </span>
                    </div>
                  </div>
                </div>

              </div>

              {diffResults && (
                <div className="mt-6 p-2 border border-neutral-900 bg-black/60 rounded-lg text-center text-gray-400 text-[10px] space-y-1">
                  List Reconciliation Status: <strong>{keyStyle === 'stable' ? '🟢 O(N) Match & Reordered in place' : '🔴 full unmount and write (Index shifted)'}</strong>
                </div>
              )}

            </div>

          </div>

          {/* Reconciler Trace Logs */}
          <div className="bg-black border border-neutral-900 rounded-xl p-4 font-mono text-xs text-sky-400 space-y-1 max-h-48 overflow-y-auto">
            <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest font-mono block border-b border-neutral-900 pb-1 mb-2">Reconciliation Engine logs</span>
            {diffLogs.map((log, idx) => (
              <div key={idx} className="flex items-start space-x-1">
                <span>$</span>
                <span className={log.includes('[Error]') || log.includes('🚨') ? 'text-red-400' : log.includes('🟢') ? 'text-emerald-400' : log.includes('⚠️') ? 'text-yellow-400' : 'text-sky-400'}>{log}</span>
              </div>
            ))}
          </div>

        </div>
      ) : (
        // MEMO RENDERING PERFORMANCE VISUALIZER
        <div className="bg-white/80 dark:bg-neutral-950/70 backdrop-blur-md border border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 rounded-2xl p-6 md:p-8 shadow-lg space-y-6">
          <div className="border-b border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 pb-4">
            <h2 className="text-lg font-black text-gray-900 dark:text-white font-mono uppercase tracking-wide">
              <span>⚛️ React.memo & stable callbacks visualizer</span>
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 font-light leading-relaxed">
              Verify how state changes propagate down the tree. Toggle Memo wrappers to watch rendering optimization passes.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            
            {/* Options Toggle Panel */}
            <div className="lg:col-span-1 bg-white/15 dark:bg-neutral-900/30 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-900 rounded-xl p-4 space-y-4 font-mono text-xs">
              <span className="text-[10px] font-black text-slate-450 uppercase tracking-widest block border-b border-neutral-800 pb-1.5 font-bold">Optimization Hooks</span>
              
              <div className="space-y-1.5">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" checked={useMemoizedChild} onChange={(e) => setUseMemoizedChild(e.target.checked)} className="text-sky-500 rounded focus:ring-sky-500" />
                  <span>React.memo(Child)</span>
                </label>
              </div>

              <div className="space-y-1.5">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" checked={useCallbackRef} onChange={(e) => setUseCallbackRef(e.target.checked)} className="text-sky-500 rounded focus:ring-sky-500" />
                  <span>useCallback(handler)</span>
                </label>
              </div>

              <button
                onClick={triggerRenderCycle}
                className="w-full py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded font-black text-[10px] uppercase shadow cursor-pointer transition-colors"
              >
                Trigger Parent Render
              </button>

              <button
                onClick={resetPerf}
                className="w-full py-1.5 border border-neutral-850 hover:bg-neutral-900 text-gray-400 rounded font-black text-[10px] uppercase cursor-pointer transition-colors"
              >
                Reset Counts
              </button>
            </div>

            {/* Render Tree visualization nodes */}
            <div className="lg:col-span-3 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-900 bg-neutral-950/60 rounded-xl p-5 flex flex-col justify-around items-center font-mono">
              <div className="text-[8px] font-black text-gray-500 uppercase tracking-widest block border-b border-neutral-900 pb-1.5 mb-2 w-full text-left">Rendering propagation Tree</div>
              
              <div className="flex flex-col items-center space-y-6 w-full max-w-sm text-center text-xs">
                
                {/* Parent Component */}
                <div className={`p-3 border rounded-xl w-3/4 transition-all duration-300
                  ${flashStates.parent ? 'border-sky-500 bg-sky-500/10 shadow-glow-sky' : 'border-neutral-800 bg-transparent text-gray-300'}`}>
                  <strong>ParentComponent (App)</strong>
                  <div className="text-[9px] text-gray-500 mt-1">Renders: <span className="text-sky-400 font-bold">{renderCount.parent}</span></div>
                </div>

                <div className="h-4 w-0.5 bg-neutral-800"></div>

                {/* Child Component */}
                <div className={`p-3 border rounded-xl w-3/4 transition-all duration-300
                  ${flashStates.child ? 'border-red-500 bg-red-500/10 shadow-lg' : 'border-neutral-800 bg-transparent text-gray-300'}`}>
                  <strong>MiddleChild {useMemoizedChild && ' (Memoized)'}</strong>
                  <div className="text-[9px] text-gray-500 mt-1">Renders: <span className={flashStates.child ? 'text-red-400 font-bold' : 'text-gray-400'}>{renderCount.child}</span></div>
                </div>

                <div className="h-4 w-0.5 bg-neutral-800"></div>

                {/* Grandchild Component */}
                <div className={`p-3 border rounded-xl w-3/4 transition-all duration-300
                  ${flashStates.grandchild ? 'border-red-500 bg-red-500/10 shadow-lg' : 'border-neutral-800 bg-transparent text-gray-300'}`}>
                  <strong>GrandchildComponent</strong>
                  <div className="text-[9px] text-gray-500 mt-1">Renders: <span className={flashStates.grandchild ? 'text-red-400 font-bold' : 'text-gray-400'}>{renderCount.grandchild}</span></div>
                </div>

              </div>
            </div>

          </div>

          {/* Educational summary matching settings */}
          <div className="p-4 bg-black border border-neutral-900 rounded-xl font-mono text-[10.5px] text-gray-400 leading-relaxed space-y-2">
            <span className="text-[9px] font-black text-sky-400 uppercase tracking-widest font-mono block">Performance Audit Summary</span>
            {useMemoizedChild && useCallbackRef ? (
              <p className="text-emerald-400 font-bold">🟢 Perfectly Optimized: Child component skips re-renders on parent state updates because stable callbacks and React.memo prevent prop reference shifts.</p>
            ) : useMemoizedChild && !useCallbackRef ? (
              <p className="text-yellow-500 font-bold">⚠️ Broken Memoization: Although Child is wrapped in React.memo, it still re-renders because passing an inline function handler updates its reference address on every render cycle. Fix by checking 'useCallback(handler)'.</p>
            ) : (
              <p className="text-red-400">🔴 Unoptimized cascade rendering: Every single state update on Parent propagates down the tree, re-rendering all child structures. Toggle 'React.memo' to optimize.</p>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
