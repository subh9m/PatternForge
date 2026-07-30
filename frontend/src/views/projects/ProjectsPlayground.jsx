import React, { useState } from 'react';
import { Play, RotateCcw, ArrowRight } from 'lucide-react';

export default function ProjectsPlayground() {
  const [scenario, setScenario] = useState('ocr'); // 'ocr', 'jwt', 'cron'
  const [isRunning, setIsRunning] = useState(false);
  const [activeStep, setActiveStep] = useState(-1);
  const [logs, setLogs] = useState(['Select a scenario and click Simulate Request to begin the architectural trace.']);

  const runSimulation = () => {
    if (isRunning) return;
    setIsRunning(true);
    setActiveStep(0);
    setLogs([]);

    if (scenario === 'ocr') {
      const steps = [
        {
          log: "[Client] Receipt image uploaded. Spinning up Tesseract Web Worker thread...",
          node: 0
        },
        {
          log: "[WebWorker] OCR execution complete. Extracted raw multiline text: '1 MILK - 2.99, 2 EGGS - 4.50'. Sending POST request with JWT header...",
          node: 0
        },
        {
          log: "[Tomcat Filter] JWT Authorization signature verified mathematically. UsernamePasswordAuthenticationToken stored in SecurityContext.",
          node: 1
        },
        {
          log: "[Controller] DispatcherServlet maps payload to OCRController.parseReceiptText(). Direct reference checks valid.",
          node: 2
        },
        {
          log: "[Service] OCRService.java intercepts text. Regex matcher separates values, lookaheads filter out 'TAX' and 'SUBTOTAL'.",
          node: 3
        },
        {
          log: "[Database] Batch save executed. Hibernate compiles queries, executing schema writes on 'pantry_items'. Transaction committed successfully.",
          node: 4
        },
        {
          log: "🟢 OCR Ingestion complete. Client React Query cache updated, UI inventory table refreshes.",
          node: 0
        }
      ];
      runSteps(steps);
    } else if (scenario === 'jwt') {
      const steps = [
        {
          log: "[Client] Submitting email and password credentials to /api/auth/login...",
          node: 0
        },
        {
          log: "[Security] AuthenticationManager matches request. BCrypt verifies salted database password hash.",
          node: 1
        },
        {
          log: "[Service] Token provider constructs header and claims (sub, iat, exp). Secret signature appended.",
          node: 3
        },
        {
          log: "[Client] Receives JWT token, storing it inside localStorage. Local AuthContext triggers user state login.",
          node: 0
        },
        {
          log: "[Client] Outbound GET /api/pantry requests intercept token, attaching Authorization Header.",
          node: 0
        },
        {
          log: "[Tomcat Filter] JwtAuthenticationFilter resolves signature. Injects authenticated principal context into ThreadLocal.",
          node: 1
        },
        {
          log: "🟢 Authentication Trace Finished. Request securely served without database session states.",
          node: 2
        }
      ];
      runSteps(steps);
    } else {
      const steps = [
        {
          log: "[Scheduler] Hourly email cron daemon activates: @Scheduled(cron = '0 0 * * * *').",
          node: 3
        },
        {
          log: "[Database] Repository queries database for items expiring in <= 3 days: findByExpiryDateLessThanEqual().",
          node: 4
        },
        {
          log: "[Database] Hibernate executes JOIN FETCH query retrieving User mappings, resolving N+1 fetch bottlenecks.",
          node: 4
        },
        {
          log: "[Service] EmailNotificationScheduler groups expiring items by distinct user, loading Thymeleaf HTML templates.",
          node: 3
        },
        {
          log: "[SMTP Server] MimeMessageHelper sends emails via SMTP Server connection. Isolated to background threads to prevent queue blocks.",
          node: 3
        },
        {
          log: "🟢 Notification Cron Complete. Expiring item warnings successfully dispatched to user mailboxes.",
          node: 0
        }
      ];
      runSteps(steps);
    }
  };

  const runSteps = (steps) => {
    let index = 0;
    const interval = setInterval(() => {
      if (index < steps.length) {
        setActiveStep(steps[index].node);
        setLogs(prev => [...prev, steps[index].log]);
        index++;
      } else {
        clearInterval(interval);
        setIsRunning(false);
        setActiveStep(-1);
      }
    }, 1500);
  };

  const resetSimulation = () => {
    setIsRunning(false);
    setActiveStep(-1);
    setLogs(['Select a scenario and click Simulate Request to begin the architectural trace.']);
  };

  return (
    <div className="bg-white/80 dark:bg-neutral-950/70 backdrop-blur-md border border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 rounded-2xl p-6 md:p-8 shadow-lg space-y-6">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 pb-4">
        <div>
          <h2 className="text-lg font-black text-neutral-950 dark:text-neutral-50 font-mono uppercase tracking-wide">
            ⚙️ Interactive Request Lifecycle Trace Simulator
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1.5 font-light leading-relaxed">
            Select a project subsystem scenario and trigger an end-to-end traversal across architectural boundaries.
          </p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={resetSimulation}
            className="flex items-center space-x-2 px-3 py-1.5 bg-fuchsia-500/10 hover:bg-fuchsia-500/25 text-fuchsia-500 border border-fuchsia-500/20 rounded-lg text-xs font-mono font-black cursor-pointer transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset</span>
          </button>
          <button
            onClick={runSimulation}
            disabled={isRunning}
            className="flex items-center space-x-2 px-4 py-1.5 bg-fuchsia-600 hover:bg-fuchsia-500 text-white rounded-lg text-xs font-mono font-black cursor-pointer transition-colors shadow-lg hover:shadow-fuchsia-500/20 disabled:bg-gray-400"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            <span>{isRunning ? 'Tracing...' : 'Simulate Request'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Scenarios Sidebar */}
        <div className="lg:col-span-1 bg-white/15 dark:bg-neutral-900/30 dark:bg-neutral-900/30 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-900 rounded-xl p-4 space-y-4 font-mono text-xs">
          <span className="text-[10px] font-black text-neutral-500 dark:text-neutral-400 uppercase tracking-widest block border-b border-neutral-800 pb-1.5 font-bold">Subsystem Scenario</span>
          <div className="flex flex-col space-y-2">
            <label className={`flex items-center space-x-2 p-2 rounded-lg border cursor-pointer transition-all
              ${scenario === 'ocr' ? 'border-fuchsia-500/30 bg-fuchsia-500/5 text-fuchsia-500' : 'border-transparent text-gray-400'}`}>
              <input type="radio" checked={scenario === 'ocr'} onChange={() => setScenario('ocr')} disabled={isRunning} className="hidden" />
              <span>OCR Receipt Processing</span>
            </label>
            <label className={`flex items-center space-x-2 p-2 rounded-lg border cursor-pointer transition-all
              ${scenario === 'jwt' ? 'border-fuchsia-500/30 bg-fuchsia-500/5 text-fuchsia-500' : 'border-transparent text-gray-400'}`}>
              <input type="radio" checked={scenario === 'jwt'} onChange={() => setScenario('jwt')} disabled={isRunning} className="hidden" />
              <span>Stateless JWT Auth Flow</span>
            </label>
            <label className={`flex items-center space-x-2 p-2 rounded-lg border cursor-pointer transition-all
              ${scenario === 'cron' ? 'border-fuchsia-500/30 bg-fuchsia-500/5 text-fuchsia-500' : 'border-transparent text-gray-400'}`}>
              <input type="radio" checked={scenario === 'cron'} onChange={() => setScenario('cron')} disabled={isRunning} className="hidden" />
              <span>Scheduled Expiry Cron</span>
            </label>
          </div>
        </div>

        {/* Visual Architectural Nodes Layout */}
        <div className="lg:col-span-3 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-900 bg-neutral-950/65 rounded-xl p-5 min-h-[220px] flex flex-col justify-center relative overflow-hidden font-mono text-[10.5px]">
          <div className="flex flex-col md:flex-row justify-around items-center w-full gap-4 relative z-10">
            
            {/* Node 0: Client Browser */}
            <div className={`p-3 border rounded-xl text-center w-full md:w-1/5 transition-all duration-500
              ${activeStep === 0 ? 'border-fuchsia-500 bg-fuchsia-500/10 text-fuchsia-400 shadow-glow-fuchsia' : 'border-neutral-800 text-gray-500 bg-transparent'}`}>
              <strong className="block">React UI</strong>
              <span className="text-[8px]">Client browser</span>
            </div>

            <ArrowRight className="h-4 w-4 text-neutral-800 hidden md:block" />

            {/* Node 1: Tomcat Security Gate */}
            <div className={`p-3 border rounded-xl text-center w-full md:w-1/5 transition-all duration-500
              ${activeStep === 1 ? 'border-fuchsia-500 bg-fuchsia-500/10 text-fuchsia-400 shadow-glow-fuchsia' : 'border-neutral-800 text-gray-500 bg-transparent'}`}>
              <strong className="block">Tomcat Guard</strong>
              <span className="text-[8px]">Security Filters</span>
            </div>

            <ArrowRight className="h-4 w-4 text-neutral-800 hidden md:block" />

            {/* Node 2: Spring MVC Controller */}
            <div className={`p-3 border rounded-xl text-center w-full md:w-1/5 transition-all duration-500
              ${activeStep === 2 ? 'border-fuchsia-500 bg-fuchsia-500/10 text-fuchsia-400 shadow-glow-fuchsia' : 'border-neutral-800 text-gray-500 bg-transparent'}`}>
              <strong className="block">Controller</strong>
              <span className="text-[8px]">API Dispatcher</span>
            </div>

            <ArrowRight className="h-4 w-4 text-neutral-800 hidden md:block" />

            {/* Node 3: JPA Transactional Service */}
            <div className={`p-3 border rounded-xl text-center w-full md:w-1/5 transition-all duration-500
              ${activeStep === 3 ? 'border-fuchsia-500 bg-fuchsia-500/10 text-fuchsia-400 shadow-glow-fuchsia' : 'border-neutral-800 text-gray-500 bg-transparent'}`}>
              <strong className="block">Service Layer</strong>
              <span className="text-[8px]">JPA Transactions</span>
            </div>

            <ArrowRight className="h-4 w-4 text-neutral-800 hidden md:block" />

            {/* Node 4: PostgreSQL Database */}
            <div className={`p-3 border rounded-xl text-center w-full md:w-1/5 transition-all duration-500
              ${activeStep === 4 ? 'border-fuchsia-500 bg-fuchsia-500/10 text-fuchsia-400 shadow-glow-fuchsia' : 'border-neutral-800 text-gray-500 bg-transparent'}`}>
              <strong className="block">PostgreSQL</strong>
              <span className="text-[8px]">Database Engine</span>
            </div>

          </div>
        </div>
      </div>

      {/* Tracing Logs Display */}
      <div className="bg-black border border-neutral-900 rounded-xl p-4 font-mono text-xs text-fuchsia-400 space-y-1 max-h-48 overflow-y-auto">
        <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest font-mono block border-b border-neutral-900 pb-1 mb-2">Architectural trace logs</span>
        {logs.map((log, idx) => (
          <div key={idx} className="flex items-start space-x-1">
            <span>$</span>
            <span className={log.includes('🟢') ? 'text-emerald-400' : 'text-fuchsia-400'}>{log}</span>
          </div>
        ))}
      </div>

    </div>
  );
}
