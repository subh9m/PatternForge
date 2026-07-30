import React, { useState, useEffect } from 'react';
import { Play, RotateCcw, Brain, Database, Plus, Minus } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AimlPlayground() {
  const [activePlayground, setActivePlayground] = useState('nn'); // 'nn' or 'rag'

  // --- NEURAL NETWORK STATE ---
  const [hiddenNodes, setHiddenNodes] = useState(3);
  const [activation, setActivation] = useState('relu');
  const [learningRate, setLearningRate] = useState(0.1);
  const [isNNTraining, setIsNNTraining] = useState(false);
  const [nnEpoch, setNnEpoch] = useState(0);
  const [nnLoss, setNnLoss] = useState(0.98);
  const [lossHistory, setLossHistory] = useState([0.98]);
  const [nnInput1, setNnInput1] = useState(1);
  const [nnInput2, setNnInput2] = useState(0);
  const [nnOutput, setNnOutput] = useState(0.0);
  const [nnWeights, setNnWeights] = useState([]);
  const [nnStatus, setNnStatus] = useState('Network initialized. Click "Train Cycle" or adjust inputs.');

  // Initialize random weights
  useEffect(() => {
    resetNNWeights();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hiddenNodes]);

  const resetNNWeights = () => {
    const weights = [];
    // Input (2) -> Hidden (hiddenNodes)
    for (let i = 0; i < 2; i++) {
      for (let j = 0; j < hiddenNodes; j++) {
        weights.push({ from: `in-${i}`, to: `hid-${j}`, weight: Math.random() * 2 - 1 });
      }
    }
    // Hidden (hiddenNodes) -> Output (1)
    for (let j = 0; j < hiddenNodes; j++) {
      weights.push({ from: `hid-${j}`, to: `out-0`, weight: Math.random() * 2 - 1 });
    }
    setNnWeights(weights);
    setNnLoss(0.98);
    setLossHistory([0.98]);
    setNnEpoch(0);
    setNnOutput(0.0);
    setNnStatus('Network reset with random weight distributions.');
  };

  const handleTrainStep = () => {
    setIsNNTraining(true);
    setNnStatus('Running Feedforward (features mapping)...');

    setTimeout(() => {
      // Feedforward calculation
      const hiddens = [];
      const in1 = nnInput1;
      const in2 = nnInput2;

      for (let j = 0; j < hiddenNodes; j++) {
        const w1 = nnWeights.find(w => w.from === 'in-0' && w.to === `hid-${j}`)?.weight || 0.1;
        const w2 = nnWeights.find(w => w.from === 'in-1' && w.to === `hid-${j}`)?.weight || 0.1;
        let sum = in1 * w1 + in2 * w2 + 0.1; // adding small bias
        // apply activation
        let actVal = activation === 'relu' ? Math.max(0, sum) : 1 / (1 + Math.exp(-sum));
        hiddens.push(actVal);
      }

      // Hidden -> Output
      let outSum = 0;
      for (let j = 0; j < hiddenNodes; j++) {
        const w = nnWeights.find(w => w.from === `hid-${j}` && w.to === 'out-0')?.weight || 0.1;
        outSum += hiddens[j] * w;
      }
      outSum += 0.05; // output bias
      let outVal = 1 / (1 + Math.exp(-outSum)); // Sigmoid output squishing
      setNnOutput(outVal);
      setNnStatus('Running Backpropagation (computing gradients & adjusting weights)...');

      setTimeout(() => {
        // Adjust weights slightly towards mock targets (Target = XOR-like: 1^0 = 1, so target should be 1)
        const target = (nnInput1 === 1 && nnInput2 === 0) || (nnInput1 === 0 && nnInput2 === 1) ? 0.9 : 0.1;
        const error = target - outVal;
        const newLoss = Math.max(0.01, nnLoss * 0.82 - (learningRate * Math.abs(error) * 0.1));
        
        setNnLoss(newLoss);
        setLossHistory(prev => [...prev, newLoss].slice(-10));
        setNnEpoch(prev => prev + 1);

        // Perturb weights towards error adjustment
        setNnWeights(prev => prev.map(w => ({
          ...w,
          weight: w.weight + (Math.random() - 0.5) * learningRate * error
        })));

        setIsNNTraining(false);
        setNnStatus(`Epoch ${nnEpoch + 1} complete. Loss: ${newLoss.toFixed(4)}. Accuracy increased.`);
      }, 700);

    }, 700);
  };

  // --- RAG PIPELINE STATE ---
  const [ragDoc, setRagDoc] = useState(
    "PatternForge is a premium SDE learning framework designed by Google DeepMind. It supports interactive browser-based compiler modules. Candidates use Git to commit their sandbox changes. SQL reference databases store company schemas."
  );
  const [ragQuery, setRagQuery] = useState("What is PatternForge?");
  const [ragLogs, setRagLogs] = useState([]);
  const [ragStep, setRagStep] = useState(0); // 0: Idle, 1: Chunking, 2: Embedding, 3: DB Search, 4: LLM Generation
  const [retrievedChunk, setRetrievedChunk] = useState('');
  const [generatedText, setGeneratedText] = useState('');
  const [isRagRunning, setIsRagRunning] = useState(false);

  const runRagPipeline = () => {
    if (isRagRunning) return;
    setIsRagRunning(true);
    setRagStep(1);
    setGeneratedText('');
    setRetrievedChunk('');
    setRagLogs(['Starting RAG Pipeline...', '1. Chunking Document: Splitting text into syntactic sentences.']);

    // Step 1: Chunking
    setTimeout(() => {
      const sentences = ragDoc.split('. ').map(s => s.trim()).filter(s => s.length > 0);
      setRagLogs(prev => [...prev, `Found ${sentences.length} text chunks in the document database.`]);
      setRagStep(2);

      // Step 2: Embedding
      setTimeout(() => {
        setRagLogs(prev => [...prev, '2. Embedding Generation: Converting text chunks to dense vectors.', `Computing vector arrays (1536 float coords) for each chunk.`, `Query vector generated for: "${ragQuery}"`]);
        setRagStep(3);

        // Step 3: Retrieval database search
        setTimeout(() => {
          // Find closest matching chunk using a mock search
          let bestChunk = sentences[0];
          let bestScore = 0.45;
          sentences.forEach(sentence => {
            const queryWords = ragQuery.toLowerCase().replace(/[?.,]/g, '').split(' ');
            const matchedWords = queryWords.filter(w => sentence.toLowerCase().includes(w));
            const score = matchedWords.length / queryWords.length + Math.random() * 0.2;
            if (score > bestScore) {
              bestScore = score;
              bestChunk = sentence;
            }
          });

          setRetrievedChunk(bestChunk);
          setRagLogs(prev => [...prev, `3. Vector search complete. Closest match: "${bestChunk}" (Cosine Similarity Score: ${bestScore.toFixed(2)})`]);
          setRagStep(4);

          // Step 4: LLM generation
          setTimeout(() => {
            setRagLogs(prev => [...prev, `4. Augmented prompt constructed. Prompt context injected.`, `Streaming answer word-by-word...`]);
            const finalAnswer = `According to the document records, PatternForge is a premium SDE learning framework designed by Google DeepMind. It supports interactive browser-based compiler modules to practice coding patterns.`;
            const words = finalAnswer.split(' ');
            let currentWordIdx = 0;
            
            const timer = setInterval(() => {
              if (currentWordIdx < words.length) {
                setGeneratedText(prev => prev + (prev ? ' ' : '') + words[currentWordIdx]);
                currentWordIdx++;
              } else {
                clearInterval(timer);
                setIsRagRunning(false);
                setRagLogs(prev => [...prev, 'LLM Answer Generation Successful. Pipeline Complete!']);
              }
            }, 100);

          }, 1200);

        }, 1200);

      }, 1200);

    }, 1200);
  };

  return (
    <div className="space-y-6">
      
      {/* Selector Tabs */}
      <div className="flex border-b border-neutral-200 dark:border-neutral-800 dark:border-neutral-900 pb-3 gap-3">
        <button
          onClick={() => setActivePlayground('nn')}
          className={`px-4 py-2 text-xs font-mono font-black uppercase rounded-lg border transition-all cursor-pointer flex items-center space-x-2
            ${activePlayground === 'nn' 
              ? 'bg-indigo-500/10 text-indigo-500 border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.15)]' 
              : 'bg-transparent text-gray-500 dark:text-gray-400 border-neutral-200 dark:border-neutral-800 dark:border-neutral-900 hover:border-indigo-500/20'}`}
        >
          <Brain className="h-4 w-4" />
          <span>Neural Network Simulator</span>
        </button>
        <button
          onClick={() => setActivePlayground('rag')}
          className={`px-4 py-2 text-xs font-mono font-black uppercase rounded-lg border transition-all cursor-pointer flex items-center space-x-2
            ${activePlayground === 'rag' 
              ? 'bg-indigo-500/10 text-indigo-500 border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.15)]' 
              : 'bg-transparent text-gray-500 dark:text-gray-400 border-neutral-200 dark:border-neutral-800 dark:border-neutral-900 hover:border-indigo-500/20'}`}
        >
          <Database className="h-4 w-4" />
          <span>RAG Pipeline Simulator</span>
        </button>
      </div>

      {activePlayground === 'nn' ? (
        // NEURAL NETWORK SIMULATOR
        <div className="bg-white/80 dark:bg-neutral-950/70 backdrop-blur-md border border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 rounded-2xl p-6 md:p-8 shadow-lg space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 pb-4">
            <div>
              <h2 className="text-lg font-black text-gray-900 dark:text-white font-mono uppercase tracking-wide flex items-center space-x-2">
                <span>🧠 Feedforward & Backpropagation Sandbox</span>
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-light leading-relaxed">
                Add hidden layer nodes, change activations, toggle input signals, and click train to watch weights adjust in real-time.
              </p>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={resetNNWeights}
                className="flex items-center space-x-2 px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/25 text-indigo-500 border border-indigo-500/20 rounded-lg text-xs font-mono font-black cursor-pointer transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset</span>
              </button>
              <button
                onClick={handleTrainStep}
                disabled={isNNTraining}
                className="flex items-center space-x-2 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-mono font-black cursor-pointer transition-colors shadow-lg hover:shadow-indigo-500/20 disabled:bg-gray-400"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>{isNNTraining ? 'Training...' : 'Train Cycle'}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            
            {/* Interactive Settings Dashboard */}
            <div className="lg:col-span-1 bg-gray-55/10 dark:bg-neutral-900/30 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 rounded-xl p-4 space-y-4">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono block border-b border-neutral-800 pb-1.5">Hyperparameters</span>
              
              {/* Node count */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5 font-mono">Hidden Neurons:</label>
                <div className="flex items-center space-x-3">
                  <button 
                    onClick={() => hiddenNodes > 2 && setHiddenNodes(prev => prev - 1)}
                    className="p-1 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 rounded hover:border-indigo-500 cursor-pointer"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="font-mono text-xs font-black text-neutral-800 dark:text-neutral-200">{hiddenNodes}</span>
                  <button 
                    onClick={() => hiddenNodes < 5 && setHiddenNodes(prev => prev + 1)}
                    className="p-1 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 rounded hover:border-indigo-500 cursor-pointer"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
              </div>

              {/* Activation */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5 font-mono">Activation:</label>
                <select
                  value={activation}
                  onChange={(e) => setActivation(e.target.value)}
                  className="w-full bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 text-gray-800 dark:text-gray-200 text-xs font-mono px-2 py-1.5 rounded-lg focus:outline-none focus:border-indigo-500"
                >
                  <option value="relu">ReLU</option>
                  <option value="sigmoid">Sigmoid</option>
                </select>
              </div>

              {/* Learning Rate */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5 font-mono">Learning Rate (α):</label>
                <select
                  value={learningRate}
                  onChange={(e) => setLearningRate(parseFloat(e.target.value))}
                  className="w-full bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 text-gray-800 dark:text-gray-200 text-xs font-mono px-2 py-1.5 rounded-lg focus:outline-none focus:border-indigo-500"
                >
                  <option value={0.5}>0.5 (Fast/Noisy)</option>
                  <option value={0.1}>0.1 (Recommended)</option>
                  <option value={0.01}>0.01 (Stable/Slow)</option>
                </select>
              </div>

              {/* Input values trigger */}
              <div className="pt-2 border-t border-dashed border-neutral-200 dark:border-neutral-800 dark:border-neutral-800">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5 font-mono">Toggle Input Signals:</span>
                <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                  <button 
                    onClick={() => setNnInput1(prev => prev === 1 ? 0 : 1)}
                    className={`py-1.5 border rounded-lg transition-all cursor-pointer ${nnInput1 === 1 ? 'bg-indigo-500/10 border-indigo-500 text-indigo-500' : 'border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 text-gray-400'}`}
                  >
                    Input X1: {nnInput1}
                  </button>
                  <button 
                    onClick={() => setNnInput2(prev => prev === 1 ? 0 : 1)}
                    className={`py-1.5 border rounded-lg transition-all cursor-pointer ${nnInput2 === 1 ? 'bg-indigo-500/10 border-indigo-500 text-indigo-500' : 'border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 text-gray-400'}`}
                  >
                    Input X2: {nnInput2}
                  </button>
                </div>
              </div>
            </div>

            {/* Neural Net Live Visual Graph */}
            <div className="lg:col-span-3 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-900 bg-neutral-950/60 rounded-xl p-5 min-h-[300px] flex flex-col justify-between relative overflow-hidden">
              <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest font-mono absolute top-2 left-3">Live Feedforward Weights Graph</span>
              
              {/* Graphic SVG Canvas */}
              <div className="flex-1 flex items-center justify-center min-h-[220px]">
                <svg className="w-full h-[220px]" style={{ minWidth: '400px' }}>
                  {/* Lines representing weights */}
                  {nnWeights.map((w, idx) => {
                    const fromNode = w.from.startsWith('in') ? 0 : 1;
                    const fromIdx = parseInt(w.from.split('-')[1]);
                    const toIdx = parseInt(w.to.split('-')[1]);
                    
                    let startX = 60;
                    let startY = fromNode === 0 ? (fromIdx === 0 ? 70 : 150) : (50 + fromIdx * (120 / (hiddenNodes - 1)));
                    
                    let endX = fromNode === 0 ? 200 : 340;
                    let endY = fromNode === 0 
                      ? (50 + toIdx * (120 / (hiddenNodes - 1))) 
                      : 110;
                    
                    const weightColor = w.weight >= 0 ? '#10b981' : '#ef4444'; // Emerald for positive, red for negative
                    const weightThickness = Math.max(1, Math.min(6, Math.abs(w.weight) * 4));

                    return (
                      <g key={idx}>
                        <motion.line
                          x1={startX}
                          y1={startY}
                          x2={endX}
                          y2={endY}
                          stroke={weightColor}
                          strokeWidth={weightThickness}
                          strokeOpacity={0.6}
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 0.5 }}
                        />
                        {/* Interactive flow particles during training */}
                        {isNNTraining && (
                          <motion.circle
                            r="3"
                            fill="#ffffff"
                            animate={{
                              cx: [startX, endX],
                              cy: [startY, endY],
                            }}
                            transition={{
                              duration: 0.8,
                              repeat: Infinity,
                              ease: "easeInOut",
                              delay: idx * 0.05
                            }}
                          />
                        )}
                      </g>
                    );
                  })}

                  {/* Input Nodes (Layer 0) */}
                  <g>
                    <circle cx="60" cy="70" r="18" fill="#ef4444" stroke="#ffffff" strokeWidth="2" className="cursor-pointer" />
                    <text x="60" y="74" textAnchor="middle" fill="#fff" className="font-mono text-xs font-bold pointer-events-none">X1</text>
                    
                    <circle cx="60" cy="150" r="18" fill="#ef4444" stroke="#ffffff" strokeWidth="2" className="cursor-pointer" />
                    <text x="60" y="154" textAnchor="middle" fill="#fff" className="font-mono text-xs font-bold pointer-events-none">X2</text>
                  </g>

                  {/* Hidden Nodes (Layer 1) */}
                  {Array.from({ length: hiddenNodes }).map((_, idx) => {
                    const cy = 50 + idx * (120 / (hiddenNodes - 1));
                    return (
                      <g key={idx}>
                        <circle cx="200" cy={cy} r="16" fill="#2563eb" stroke="#ffffff" strokeWidth="2" />
                        <text x="200" y={cy + 4} textAnchor="middle" fill="#fff" className="font-mono text-[9px] font-bold pointer-events-none">H{idx+1}</text>
                      </g>
                    );
                  })}

                  {/* Output Node (Layer 2) */}
                  <g>
                    <circle cx="340" cy="110" r="18" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
                    <text x="340" y="114" textAnchor="middle" fill="#fff" className="font-mono text-xs font-bold pointer-events-none">Y</text>
                  </g>
                </svg>
              </div>

              {/* Status and output panel */}
              <div className="border-t border-neutral-900 pt-3 flex flex-wrap items-center justify-between gap-4 font-mono text-[11px] text-gray-300">
                <div className="flex items-center space-x-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-neutral-500 dark:text-neutral-400">Target Output: <strong className="text-white">{nnOutput.toFixed(4)}</strong></span>
                </div>
                <div className="flex space-x-4">
                  <span>Epochs: <strong className="text-white">{nnEpoch}</strong></span>
                  <span>Loss: <strong className="text-indigo-400">{nnLoss.toFixed(4)}</strong></span>
                </div>
              </div>
            </div>

          </div>

          {/* Loss graph and logger status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-neutral-200 dark:border-neutral-800 dark:border-neutral-900">
            {/* Terminal Log Console */}
            <div className="md:col-span-2 bg-black border border-neutral-900 rounded-xl p-4 font-mono text-xs text-green-400 min-h-[100px] flex items-center">
              <div className="space-y-1">
                <div className="text-[10px] text-gray-500 uppercase tracking-widest font-black mb-1">Status Feed</div>
                <div>$ {nnStatus}</div>
              </div>
            </div>

            {/* Falling Loss History graph */}
            <div className="md:col-span-1 bg-black border border-neutral-900 rounded-xl p-4 flex flex-col justify-between min-h-[100px]">
              <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest font-mono mb-2">Training Loss Convergence</span>
              <div className="flex items-end justify-between h-14 pb-1 border-b border-l border-neutral-800 px-2">
                {lossHistory.map((l, i) => {
                  const height = Math.min(100, Math.max(10, l * 50));
                  return (
                    <div 
                      key={i} 
                      className="w-4 bg-indigo-500/80 rounded-t"
                      style={{ height: `${height}%` }}
                      title={`Loss: ${l.toFixed(4)}`}
                    />
                  );
                })}
              </div>
              <span className="text-[8px] text-gray-500 text-center font-mono mt-1">First Epoch ──► Latest Epoch</span>
            </div>
          </div>

        </div>
      ) : (
        // RAG PIPELINE SIMULATOR
        <div className="bg-white/80 dark:bg-neutral-950/70 backdrop-blur-md border border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 rounded-2xl p-6 md:p-8 shadow-lg space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 pb-4">
            <div>
              <h2 className="text-lg font-black text-gray-900 dark:text-white font-mono uppercase tracking-wide">
                <span>⚡ RAG Retrieval Pipeline Simulator</span>
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-light leading-relaxed">
                Connect external unstructured knowledge to live prompts dynamically to ground answer facts.
              </p>
            </div>
            
            <button
              onClick={runRagPipeline}
              disabled={isRagRunning}
              className="flex items-center space-x-2 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-mono font-black cursor-pointer transition-colors shadow-lg hover:shadow-indigo-500/20 disabled:bg-gray-400"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              <span>{isRagRunning ? 'Pipeline Running...' : 'Query Database'}</span>
            </button>
          </div>

          {/* RAG Grid panels */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Input Data Source */}
            <div className="bg-gray-55/10 dark:bg-neutral-900/30 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 rounded-xl p-4 space-y-4">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono block border-b border-neutral-800 pb-1.5">Unstructured Document</span>
              <textarea
                value={ragDoc}
                onChange={(e) => setRagDoc(e.target.value)}
                rows={5}
                className="w-full p-2.5 bg-neutral-950 text-gray-300 font-mono text-xs border border-neutral-900 rounded-lg focus:outline-none focus:border-indigo-500 leading-normal resize-none"
                placeholder="Insert documents here..."
              />
              
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5 font-mono">User Query Prompt:</label>
                <input
                  type="text"
                  value={ragQuery}
                  onChange={(e) => setRagQuery(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-neutral-950 border border-neutral-900 rounded-lg font-mono text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Visual Process Flow */}
            <div className="border border-neutral-200 dark:border-neutral-800 dark:border-neutral-900 bg-neutral-950/60 rounded-xl p-4 flex flex-col justify-between min-h-[250px]">
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest font-mono block border-b border-neutral-900 pb-1.5">Visual Pipeline Execution</span>
              
              <div className="flex-1 flex flex-col justify-center space-y-3.5 font-mono text-[10.5px] py-4">
                {/* Step 1: Chunking */}
                <div className={`flex items-center space-x-3 p-2 rounded-lg transition-all ${ragStep === 1 ? 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-500' : 'text-gray-500'}`}>
                  <span className="px-1.5 py-0.2 border border-current rounded text-[9px]">STEP 1</span>
                  <span>Text Chunk Splitting</span>
                </div>

                {/* Step 2: Embedding */}
                <div className={`flex items-center space-x-3 p-2 rounded-lg transition-all ${ragStep === 2 ? 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-500' : 'text-gray-500'}`}>
                  <span className="px-1.5 py-0.2 border border-current rounded text-[9px]">STEP 2</span>
                  <span>Dense Embedding Mapping</span>
                </div>

                {/* Step 3: DB search similarity */}
                <div className={`flex items-center space-x-3 p-2 rounded-lg transition-all ${ragStep === 3 ? 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-500' : 'text-gray-500'}`}>
                  <span className="px-1.5 py-0.2 border border-current rounded text-[9px]">STEP 3</span>
                  <span>Cosine Similarity Match</span>
                </div>

                {/* Step 4: Generation */}
                <div className={`flex items-center space-x-3 p-2 rounded-lg transition-all ${ragStep === 4 ? 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-500' : 'text-gray-500'}`}>
                  <span className="px-1.5 py-0.2 border border-current rounded text-[9px]">STEP 4</span>
                  <span>LLM Answer Generation</span>
                </div>
              </div>
            </div>

            {/* Retrieve matched vector DB */}
            <div className="bg-gray-55/10 dark:bg-neutral-900/30 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono block border-b border-neutral-800 pb-1.5">Retrieved Database Chunk</span>
                {retrievedChunk ? (
                  <div className="p-3 bg-indigo-500/[0.04] border border-indigo-500/20 rounded-xl mt-3 font-sans text-xs text-neutral-700 dark:text-neutral-300 italic">
                    "{retrievedChunk}"
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-24 border border-dashed border-neutral-800 rounded-xl mt-3 text-center text-gray-500 text-[10px] font-mono">
                    <span>No match retrieved yet.</span>
                  </div>
                )}
              </div>

              <div className="pt-4">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono block border-b border-neutral-800 pb-1.5">LLM Stream Answer</span>
                <div className="p-3 bg-neutral-950 text-green-400 font-mono text-xs border border-neutral-900 rounded-xl mt-3 min-h-[80px] leading-relaxed">
                  {generatedText ? generatedText : 'Waiting for generation stream...'}
                </div>
              </div>
            </div>

          </div>

          {/* RAG pipeline execution logger */}
          <div className="bg-black border border-neutral-900 rounded-xl p-4 font-mono text-xs text-emerald-400 space-y-1 max-h-40 overflow-y-auto">
            <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest font-mono block border-b border-neutral-900 pb-1 mb-2">Internal execution log</span>
            {ragLogs.map((log, idx) => (
              <div key={idx}>$ {log}</div>
            ))}
          </div>

        </div>
      )}

    </div>
  );
}
