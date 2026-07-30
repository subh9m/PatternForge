import React, { useState } from 'react';
import { HelpCircle, AlertTriangle, CheckSquare, Sparkles, ChevronDown, ChevronUp, ArrowRight, ArrowDown } from 'lucide-react';

const renderDiagram = (conceptId) => {
  switch (conceptId) {
    case 'aiml_fundamentals':
      return (
        <div className="space-y-3">
          <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">
            Intelligence Paradigm Hierarchy
          </span>
          <div className="p-5 bg-white/80 dark:bg-neutral-950/40 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-900 rounded-xl">
            <div className="border border-neutral-300 dark:border-neutral-800 p-4 rounded-xl bg-white dark:bg-neutral-950">
              <span className="px-2 py-0.5 bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-300 text-[8px] font-mono font-black uppercase rounded mb-2 inline-block">AI (Broadest Field)</span>
              <p className="text-[11.5px] font-bold text-neutral-700 dark:text-neutral-300 mb-3">Artificial Intelligence: Heuristic and algorithmic cognitive simulation.</p>
              
              <div className="border border-blue-200 dark:border-blue-900 p-4 rounded-xl bg-blue-500/[0.01]">
                <span className="px-2 py-0.5 bg-blue-500/10 text-blue-500 text-[8px] font-mono font-black uppercase rounded mb-2 inline-block">ML (Subset)</span>
                <p className="text-[11.5px] font-bold text-neutral-700 dark:text-neutral-300 mb-3">Machine Learning: Models learning representations from mathematical dataset patterns.</p>
                
                <div className="border border-purple-200 dark:border-purple-900 p-4 rounded-xl bg-purple-500/[0.01]">
                  <span className="px-2 py-0.5 bg-purple-500/10 text-purple-500 text-[8px] font-mono font-black uppercase rounded mb-2 inline-block">DL (Sub-subset)</span>
                  <p className="text-[11.5px] font-bold text-neutral-700 dark:text-neutral-300 mb-3">Deep Learning: Deep multi-layered neural network feature representations.</p>
                  
                  <div className="border border-indigo-300 dark:border-indigo-950 p-4 rounded-xl bg-indigo-500/[0.01]">
                    <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-500 text-[8px] font-mono font-black uppercase rounded mb-1 inline-block">GenAI (Core Core)</span>
                    <p className="text-[11.5px] font-bold text-neutral-700 dark:text-neutral-300">Generative AI: Probability distribution modeling to generate original samples.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );

    case 'core_terminology':
      return (
        <div className="space-y-3">
          <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">
            Model Input & parameter variables pipeline
          </span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 bg-white/80 dark:bg-neutral-950/40 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-900 rounded-xl">
            {/* Column 1: Input Data */}
            <div className="p-4 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 rounded-xl bg-white dark:bg-neutral-950 space-y-3">
              <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 text-[8px] font-mono font-black uppercase rounded inline-block">Dataset Structures</span>
              <div className="space-y-2 text-xs">
                <div className="p-2 border border-dashed border-neutral-200 dark:border-neutral-800 dark:border-neutral-900 rounded">
                  <strong className="text-gray-800 dark:text-gray-200 font-mono block">Features (Inputs - X)</strong>
                  <span className="text-gray-500 text-[11px]">Values fed into network (e.g. house sqft, rooms, local ratings).</span>
                </div>
                <div className="p-2 border border-dashed border-neutral-200 dark:border-neutral-800 dark:border-neutral-900 rounded">
                  <strong className="text-gray-800 dark:text-gray-200 font-mono block">Labels (Targets - Y)</strong>
                  <span className="text-gray-500 text-[11px]">The ground-truth answers the model attempts to predict (e.g. house sale price).</span>
                </div>
              </div>
            </div>

            {/* Column 2: Parameters */}
            <div className="p-4 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 rounded-xl bg-white dark:bg-neutral-950 space-y-3">
              <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-[8px] font-mono font-black uppercase rounded inline-block">Control Parameters</span>
              <div className="space-y-2 text-xs">
                <div className="p-2 border border-dashed border-neutral-200 dark:border-neutral-800 dark:border-neutral-900 rounded">
                  <strong className="text-gray-800 dark:text-gray-200 font-mono block">Hyperparameters (Set by SDE)</strong>
                  <span className="text-gray-500 text-[11px]">Configurations set before training begins (e.g. learning rate α, batch sizes).</span>
                </div>
                <div className="p-2 border border-dashed border-neutral-200 dark:border-neutral-800 dark:border-neutral-900 rounded">
                  <strong className="text-gray-800 dark:text-gray-200 font-mono block">Model Parameters (Learned)</strong>
                  <span className="text-gray-500 text-[11px]">Weights and biases calculated dynamically during backpropagation updates.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      );

    case 'ml_basics':
      return (
        <div className="space-y-3">
          <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">
            Classic ML Boundaries & Outputs
          </span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 bg-white/80 dark:bg-neutral-950/40 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-900 rounded-xl">
            {/* Linear Regression */}
            <div className="p-4 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 rounded-xl bg-white dark:bg-neutral-950 space-y-2">
              <span className="px-2 py-0.5 bg-amber-500/10 text-amber-500 text-[8px] font-mono font-black uppercase rounded inline-block">Linear Regression</span>
              <h4 className="text-xs font-bold text-neutral-800 dark:text-neutral-200">Continuous Numeric Predictions</h4>
              <p className="text-gray-500 text-[11px] leading-relaxed">Fits a straight line (<code className="bg-gray-100 dark:bg-neutral-900 px-1 py-0.2 rounded">y = wx + b</code>) through features to predict numbers like pricing or growth projections.</p>
              <div className="h-10 w-full flex items-center justify-center bg-gray-50 dark:bg-black/20 border border-dashed border-neutral-200 dark:border-neutral-800 dark:border-neutral-900 rounded font-mono text-[9px] text-gray-400">
                [ linear trend line: y ───↗─── x ]
              </div>
            </div>

            {/* Logistic Classification */}
            <div className="p-4 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 rounded-xl bg-white dark:bg-neutral-950 space-y-2">
              <span className="px-2 py-0.5 bg-purple-500/10 text-purple-400 text-[8px] font-mono font-black uppercase rounded inline-block">Logistic Classification</span>
              <h4 className="text-xs font-bold text-neutral-800 dark:text-neutral-200">Discrete Binary Outputs</h4>
              <p className="text-gray-500 text-[11px] leading-relaxed">Uses a sigmoid function to map values between [0,1], representing the probability of classification classes (e.g. spam/legit).</p>
              <div className="h-10 w-full flex items-center justify-center bg-gray-50 dark:bg-black/20 border border-dashed border-neutral-200 dark:border-neutral-800 dark:border-neutral-900 rounded font-mono text-[9px] text-gray-400">
                [ probability sigmoid: y ───S─── x ]
              </div>
            </div>
          </div>
        </div>
      );

    case 'deep_learning':
      return (
        <div className="space-y-3">
          <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">
            Transformer Self-Attention Data Flow
          </span>
          <div className="p-5 bg-white/80 dark:bg-neutral-950/40 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-900 rounded-xl overflow-x-auto">
            <div className="flex items-center space-x-3 text-xs font-mono min-w-[600px] py-2">
              <div className="p-3 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 rounded-lg text-center shadow-sm">
                <strong>Input Tokens</strong>
                <span className="block text-[9px] text-gray-400 mt-1">String characters</span>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
              
              <div className="p-3 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 rounded-lg text-center shadow-sm">
                <strong>Positional Encoding</strong>
                <span className="block text-[9px] text-gray-400 mt-1">Order position vectors</span>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400 flex-shrink-0" />

              <div className="p-3 bg-indigo-500/5 border border-indigo-500/25 rounded-lg text-center shadow-sm">
                <strong className="text-indigo-500">Self-Attention Grid</strong>
                <span className="block text-[9px] text-gray-400 mt-1">Multi-head attention matrices</span>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400 flex-shrink-0" />

              <div className="p-3 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 rounded-lg text-center shadow-sm">
                <strong>Layer Norm / Add</strong>
                <span className="block text-[9px] text-gray-400 mt-1">Residual linkages</span>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400 flex-shrink-0" />

              <div className="p-3 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 rounded-lg text-center shadow-sm">
                <strong>Feed-Forward Net</strong>
                <span className="block text-[9px] text-gray-400 mt-1">Final predictions projection</span>
              </div>
            </div>
          </div>
        </div>
      );

    case 'llms_deep':
      return (
        <div className="space-y-3">
          <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">
            LLM Training Stages Pipeline
          </span>
          <div className="p-5 bg-white/80 dark:bg-neutral-950/40 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-900 rounded-xl space-y-4">
            {/* Step 1 */}
            <div className="p-4 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 bg-white dark:bg-neutral-950 rounded-xl relative flex items-start space-x-4">
              <span className="px-2 py-0.5 bg-blue-500/10 text-blue-500 text-[9px] font-mono font-black rounded-lg">1</span>
              <div>
                <h4 className="text-xs font-bold text-gray-800 dark:text-gray-200">PRE-TRAINING (Unsupervised prediction)</h4>
                <p className="text-[11px] text-gray-500 mt-0.5">Learns core language syntax, vocabulary structures, and world facts by predicting the next tokens across terabytes of raw internet texts.</p>
              </div>
            </div>
            
            <div className="flex justify-center"><ArrowDown className="h-4 w-4 text-gray-400" /></div>

            {/* Step 2 */}
            <div className="p-4 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 bg-white dark:bg-neutral-950 rounded-xl relative flex items-start space-x-4">
              <span className="px-2 py-0.5 bg-purple-500/10 text-purple-500 text-[9px] font-mono font-black rounded-lg">2</span>
              <div>
                <h4 className="text-xs font-bold text-gray-800 dark:text-gray-200">INSTRUCTION TUNING (Supervised format scaling)</h4>
                <p className="text-[11px] text-gray-500 mt-0.5">Aligns the model structure to behave like an assistant, training on strict prompt/response datasets (e.g. Q&A pairs).</p>
              </div>
            </div>

            <div className="flex justify-center"><ArrowDown className="h-4 w-4 text-gray-400" /></div>

            {/* Step 3 */}
            <div className="p-4 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 bg-white dark:bg-neutral-950 rounded-xl relative flex items-start space-x-4">
              <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 text-[9px] font-mono font-black rounded-lg">3</span>
              <div>
                <h4 className="text-xs font-bold text-gray-800 dark:text-gray-200">RLHF ALIGNMENT (Reinforcement preferences)</h4>
                <p className="text-[11px] text-gray-500 mt-0.5">Fine-tunes response generation using human feedback reward models, scoring output safety, helpfulness, and style patterns.</p>
              </div>
            </div>
          </div>
        </div>
      );

    case 'embeddings_db':
      return (
        <div className="space-y-3">
          <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">
            Semantic Retrieval Index Lookup
          </span>
          <div className="p-5 bg-white/80 dark:bg-neutral-950/40 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-900 rounded-xl overflow-x-auto">
            <div className="flex items-center space-x-4 text-xs font-mono min-w-[550px] py-1">
              <div className="p-3 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 rounded-lg shadow-sm text-center">
                <strong>Input Query</strong>
                <span className="block text-[9.5px] text-gray-400 mt-0.5">"What is RAG?"</span>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400 flex-shrink-0" />

              <div className="p-3 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 rounded-lg shadow-sm text-center">
                <strong>Embedding API</strong>
                <span className="block text-[9.5px] text-emerald-500 mt-0.5">[0.15, -0.84, 0.02...]</span>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400 flex-shrink-0" />

              <div className="p-3 bg-purple-500/5 border border-purple-500/20 rounded-lg shadow-sm text-center">
                <strong className="text-purple-500">Vector Search (HNSW)</strong>
                <span className="block text-[9.5px] text-gray-400 mt-0.5">Nearest similarity</span>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400 flex-shrink-0" />

              <div className="p-3 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 rounded-lg shadow-sm text-center">
                <strong>Context Retrieved</strong>
                <span className="block text-[9.5px] text-gray-400 mt-0.5">Ground-truth facts</span>
              </div>
            </div>
          </div>
        </div>
      );

    case 'rag_agents':
      return (
        <div className="space-y-3">
          <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">
            Autonomous Agent Reasoning Loop
          </span>
          <div className="p-5 bg-white/80 dark:bg-neutral-950/40 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-900 rounded-xl space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-around gap-4 font-mono text-xs text-center">
              <div className="p-3 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 rounded-lg w-full sm:w-1/4">
                <strong className="text-indigo-500 block">1. Agent Planner</strong>
                <span className="text-[10px] text-gray-400">Decodes goal directives</span>
              </div>
              
              <div className="p-3 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 rounded-lg w-full sm:w-1/4">
                <strong className="text-blue-500 block">2. Tool Selection</strong>
                <span className="text-[10px] text-gray-400">Triggers API / database</span>
              </div>

              <div className="p-3 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 rounded-lg w-full sm:w-1/4">
                <strong className="text-purple-500 block">3. Observation</strong>
                <span className="text-[10px] text-gray-400">Analyzes tool response</span>
              </div>

              <div className="p-3 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 rounded-lg w-full sm:w-1/4">
                <strong className="text-emerald-500 block">4. Evaluation</strong>
                <span className="text-[10px] text-gray-400">Checks loop completion</span>
              </div>
            </div>
            <div className="text-center text-[10px] text-neutral-500 dark:text-neutral-400 font-mono italic">
              🔁 ReAct loop cycles: Observations feed back into Planner until the goal conditions are satisfied.
            </div>
          </div>
        </div>
      );

    case 'system_deployment':
      return (
        <div className="space-y-3">
          <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">
            Semantic Caching Decision Boundary
          </span>
          <div className="p-5 bg-white/80 dark:bg-neutral-950/40 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-900 rounded-xl space-y-4">
            <div className="p-3 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 rounded-lg text-center font-mono text-xs">
              <strong>Incoming Prompt Query</strong>
              <ArrowDown className="h-4 w-4 mx-auto text-gray-400 my-1" />
              <strong>Vector Database Similarity Check</strong>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 border border-emerald-500/20 bg-emerald-500/[0.01] rounded-xl text-center space-y-1">
                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 text-[8px] font-mono font-black uppercase rounded">HIT (Sim &gt; 0.96)</span>
                <h5 className="text-xs font-bold text-gray-800 dark:text-gray-200">Return Cached Response</h5>
                <p className="text-[10px] text-gray-500">Bypasses LLM model generation. Latency: ~10ms, Cost: $0.</p>
              </div>

              <div className="p-4 border border-indigo-500/20 bg-indigo-500/[0.01] rounded-xl text-center space-y-1">
                <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-500 text-[8px] font-mono font-black uppercase rounded">MISS (Sim &lt; 0.96)</span>
                <h5 className="text-xs font-bold text-gray-800 dark:text-gray-200">Call LLM API Endpoint</h5>
                <p className="text-[10px] text-gray-500">Runs full model token inference, saves output to cache. Latency: &gt;1s.</p>
              </div>
            </div>
          </div>
        </div>
      );

    case 'nlp_vision_speech':
      return (
        <div className="space-y-3">
          <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">
            Speech-To-Text Transcription Pipeline
          </span>
          <div className="p-5 bg-white/80 dark:bg-neutral-950/40 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-900 rounded-xl overflow-x-auto">
            <div className="flex items-center space-x-4 text-xs font-mono min-w-[550px] py-1">
              <div className="p-3 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 rounded-lg shadow-sm text-center">
                <strong>Audio Input</strong>
                <span className="block text-[9.5px] text-gray-400 mt-0.5">Raw waveform (.wav)</span>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400 flex-shrink-0" />

              <div className="p-3 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 rounded-lg shadow-sm text-center">
                <strong>Mel-Spectrogram</strong>
                <span className="block text-[9.5px] text-gray-400 mt-0.5">2D sound visualization</span>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400 flex-shrink-0" />

              <div className="p-3 bg-blue-500/5 border border-blue-500/20 rounded-lg shadow-sm text-center">
                <strong className="text-blue-500">Encoder-Decoder</strong>
                <span className="block text-[9.5px] text-gray-400 mt-0.5">Whisper Transformer</span>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400 flex-shrink-0" />

              <div className="p-3 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 rounded-lg shadow-sm text-center">
                <strong>Token Output</strong>
                <span className="block text-[9.5px] text-emerald-500 mt-0.5">"Transcript text..."</span>
              </div>
            </div>
          </div>
        </div>
      );

    case 'applied_ethics':
      return (
        <div className="space-y-3">
          <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">
            Collaborative Filtering Matrix Matching
          </span>
          <div className="p-5 bg-white/80 dark:bg-neutral-950/40 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-900 rounded-xl">
            <div className="flex flex-col sm:flex-row items-center justify-around gap-4 font-mono text-xs">
              <div className="space-y-2 w-full sm:w-1/3">
                <div className="p-3 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 rounded-lg text-center shadow-sm">
                  <strong>User Profile Vector</strong>
                  <span className="block text-[9px] text-gray-400 mt-0.5">Preferences: [0.94, -0.12]</span>
                </div>
                <div className="p-3 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 rounded-lg text-center shadow-sm">
                  <strong>Item Metadata Vector</strong>
                  <span className="block text-[9px] text-gray-400 mt-0.5">Categories: [0.81, 0.05]</span>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center"><ArrowRight className="h-4 w-4 text-gray-400 hidden sm:block" /></div>

              <div className="p-4 bg-purple-500/5 border border-purple-500/20 rounded-xl text-center w-full sm:w-1/3">
                <strong className="text-purple-500 block font-bold">Dot Product Similarity</strong>
                <span className="text-[10px] text-gray-500">Calculates alignment angle</span>
              </div>

              <div className="flex flex-col items-center justify-center"><ArrowRight className="h-4 w-4 text-gray-400 hidden sm:block" /></div>

              <div className="p-3 bg-emerald-500/5 border border-emerald-500/25 rounded-lg text-center w-full sm:w-1/3">
                <strong className="text-emerald-500 block">Recommendation Score</strong>
                <span className="text-[10px] text-emerald-500 font-bold">Similarity: 0.88</span>
              </div>
            </div>
          </div>
        </div>
      );

    case 'infra_architecture':
      return (
        <div className="space-y-3">
          <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">
            Distributed LLM Pipeline Parallelism
          </span>
          <div className="p-5 bg-white/80 dark:bg-neutral-950/40 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-900 rounded-xl overflow-x-auto">
            <div className="flex items-center space-x-4 text-xs font-mono min-w-[550px] py-1">
              <div className="p-3 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 rounded-lg shadow-sm text-center">
                <strong>Training Inputs</strong>
                <span className="block text-[9.5px] text-gray-400 mt-0.5">Prompt batch</span>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400 flex-shrink-0" />

              <div className="p-3 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 rounded-lg shadow-sm text-center">
                <strong>Parallel Splitter</strong>
                <span className="block text-[9.5px] text-gray-400 mt-0.5">Divides layers</span>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400 flex-shrink-0" />

              <div className="p-3 bg-indigo-500/5 border border-indigo-500/20 rounded-lg shadow-sm text-center">
                <strong className="text-indigo-500">GPU Nodes Cluster</strong>
                <span className="block text-[9.5px] text-gray-400 mt-0.5">Layer pipeline splits</span>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400 flex-shrink-0" />

              <div className="p-3 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 rounded-lg shadow-sm text-center">
                <strong>Weight Updates</strong>
                <span className="block text-[9.5px] text-emerald-500 mt-0.5">Parameters saved</span>
              </div>
            </div>
          </div>
        </div>
      );

    default:
      return null;
  }
};

export default function AimlCard({ data }) {
  const [expandedSubtopic, setExpandedSubtopic] = useState(0);

  return (
    <section 
      id={data.id}
      className="w-full bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 rounded-2xl p-6 md:p-8 shadow-xl transition-all duration-300 hover:border-indigo-500/25 relative"
    >
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-neutral-200 dark:border-neutral-800 dark:border-neutral-800">
        <div className="flex items-center space-x-3">
          <span className="px-3 py-1 bg-indigo-500/10 text-indigo-500 text-[10px] font-black uppercase font-mono tracking-wider rounded-md">
            {data.num}
          </span>
          <h2 className="text-xl font-black text-gray-900 dark:text-white font-mono uppercase tracking-wide">
            {data.title}
          </h2>
        </div>
      </div>

      {/* Description */}
      <p className="text-base text-gray-700 dark:text-neutral-300 font-normal leading-relaxed mb-6">
        {data.desc}
      </p>

      {/* Interactive CSS Diagram representation */}
      {data.internalImplementation && (
        <div className="mb-6">
          {renderDiagram(data.id)}
        </div>
      )}

      {/* Subtopics Listing */}
      <div className="space-y-4">
        {data.subtopics && data.subtopics.map((sub, idx) => {
          const isExpanded = expandedSubtopic === idx;
          return (
            <div 
              key={idx}
              className="border border-neutral-200 dark:border-neutral-800 dark:border-neutral-900 rounded-xl overflow-hidden bg-white/10 dark:bg-neutral-900/10"
            >
              {/* Accordion Toggle */}
              <button
                onClick={() => setExpandedSubtopic(isExpanded ? null : idx)}
                className="w-full px-5 py-4 flex items-center justify-between hover:bg-white/20 dark:hover:bg-neutral-900/30 transition-all font-mono text-left cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <span className="h-2 w-2 rounded-full bg-indigo-500"></span>
                  <span className="text-sm font-bold text-neutral-800 dark:text-neutral-200">{sub.name}</span>
                </div>
                {isExpanded ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
              </button>

              {/* Accordion Content */}
              {isExpanded && (
                <div className="p-6 border-t border-neutral-200 dark:border-neutral-800 dark:border-neutral-900 space-y-7 animate-fadeIn">
                  
                  {/* Highlighted One-Liner */}
                  <div className="p-5 bg-indigo-500/[0.03] border-l-3 border-indigo-500 text-neutral-800 dark:text-neutral-200 rounded-r-lg font-sans text-[14px] md:text-[15px] flex items-center space-x-3.5 leading-relaxed">
                    <Sparkles className="h-5 w-5 text-indigo-500 flex-shrink-0" />
                    <div>
                      <span className="font-mono text-[10px] font-black text-indigo-500 uppercase tracking-widest block mb-1">Interview One-Liner</span>
                      <blockquote className="italic text-neutral-700 dark:text-neutral-300">"{sub.oneLiner}"</blockquote>
                    </div>
                  </div>

                  {/* Core Conceptual Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Definition */}
                    <div className="p-5 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-900 rounded-xl">
                      <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono mb-2">🎯 Interview Definition</span>
                      <p className="text-[14px] md:text-[15px] text-gray-700 dark:text-neutral-300 font-normal leading-relaxed">{sub.definition}</p>
                    </div>

                    {/* Why Need */}
                    <div className="p-5 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-900 rounded-xl">
                      <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono mb-2">❓ Why Do We Need It?</span>
                      <p className="text-[14px] md:text-[15px] text-gray-700 dark:text-neutral-300 font-normal leading-relaxed">{sub.whyNeed}</p>
                    </div>

                    {/* Real World Example */}
                    <div className="p-5 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-900 rounded-xl">
                      <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono mb-2">🌍 Real World Example</span>
                      <p className="text-[14px] md:text-[15px] text-gray-700 dark:text-neutral-300 font-normal leading-relaxed">{sub.example}</p>
                    </div>

                    {/* Developer Perspective */}
                    <div className="p-5 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-900 rounded-xl">
                      <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono mb-2">💻 SDE Perspective</span>
                      <p className="text-[14px] md:text-[15px] text-gray-700 dark:text-neutral-300 font-normal leading-relaxed">{sub.devPerspective}</p>
                    </div>
                  </div>

                  {/* Questions & Troubleshooting */}
                  <div className="space-y-5 pt-3 border-t border-dashed border-neutral-200 dark:border-neutral-800 dark:border-neutral-900">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* Interview Questions */}
                      <div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono mb-3 flex items-center space-x-1.5">
                          <HelpCircle className="h-4 w-4 text-blue-500" />
                          <span>Interview Questions</span>
                        </span>
                        <ul className="space-y-2.5 text-[14px] md:text-[15px] text-neutral-700 dark:text-neutral-300 list-decimal pl-5">
                          {sub.questions.map((q, i) => <li key={i}>{q}</li>)}
                        </ul>
                      </div>

                      {/* Follow-up Questions */}
                      <div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono mb-3 flex items-center space-x-1.5">
                          <HelpCircle className="h-4 w-4 text-purple-500" />
                          <span>Important Follow-ups</span>
                        </span>
                        <ul className="space-y-2.5 text-[14px] md:text-[15px] text-neutral-700 dark:text-neutral-300 list-disc pl-5">
                          {sub.followups.map((f, i) => <li key={i}>{f}</li>)}
                        </ul>
                      </div>

                    </div>
                  </div>

                  {/* Common Confusions & Key Takeaways */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-neutral-200 dark:border-neutral-800 dark:border-neutral-900">
                    {/* Common Confusions */}
                    <div className="p-5 bg-amber-500/[0.02] border border-amber-500/10 rounded-xl">
                      <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest font-mono mb-2.5 flex items-center space-x-1.5">
                        <AlertTriangle className="h-4 w-4" />
                        <span>⚠️ Common Confusions</span>
                      </span>
                      <ul className="space-y-2 text-[14px] md:text-[15px] text-neutral-700 dark:text-neutral-300 list-disc pl-5">
                        {sub.confusions.map((c, i) => <li key={i}>{c}</li>)}
                      </ul>
                    </div>

                    {/* Key Takeaways */}
                    <div className="p-5 bg-emerald-500/[0.02] border border-emerald-500/10 rounded-xl">
                      <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest font-mono mb-2.5 flex items-center space-x-1.5">
                        <CheckSquare className="h-4 w-4" />
                        <span>✅ Key Takeaways</span>
                      </span>
                      <ul className="space-y-2 text-[14px] md:text-[15px] text-neutral-700 dark:text-neutral-300 list-disc pl-5">
                        {sub.takeaways.map((t, i) => <li key={i}>{t}</li>)}
                      </ul>
                    </div>
                  </div>

                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
