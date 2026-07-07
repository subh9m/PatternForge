import React, { useState } from 'react';
import { Play, RotateCcw, Cpu, Database, Network, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SpringPlayground() {
  const [activeTab, setActiveTab] = useState('ioc'); // 'ioc' or 'mvc'

  // --- IOC SIMULATOR STATE ---
  const [diStyle, setDiStyle] = useState('constructor'); // 'constructor' or 'field'
  const [beanScope, setBeanScope] = useState('singleton'); // 'singleton' or 'prototype'
  const [hasPostConstruct, setHasPostConstruct] = useState(true);
  const [isIocRunning, setIsIocRunning] = useState(false);
  const [iocStep, setIocStep] = useState(0); // 0: Idle, 1: Scan, 2: Instantiate, 3: Populate, 4: PostConstruct, 5: Ready
  const [iocLogs, setIocLogs] = useState([]);
  const [beanReferences, setBeanReferences] = useState([]);

  const runIocBootstrap = () => {
    if (isIocRunning) return;
    setIsIocRunning(true);
    setIocStep(1);
    setIocLogs([
      `[Container] Starting ApplicationContext bootstrap...`,
      `[ComponentScan] Scanning base package 'com.example' for stereotype annotations...`,
      `[ComponentScan] Found '@Service OrderService' and '@Repository PaymentRepository'.`
    ]);

    // Step 2: Instantiation
    setTimeout(() => {
      setIocStep(2);
      setIocLogs(prev => [
        ...prev,
        `[BeanDefinition] Creating bean definitions in memory...`,
        `[Instantiation] Invoking constructors to instantiate OrderService and PaymentRepository...`,
        diStyle === 'constructor' 
          ? `[DI] Constructor Injection: Passing PaymentRepository dependency directly inside OrderService constructor.`
          : `[Instantiation] OrderService instantiated with empty/null dependencies.`
      ]);

      // Step 3: Populate/Inject
      setTimeout(() => {
        setIocStep(3);
        setIocLogs(prev => [
          ...prev,
          diStyle === 'field'
            ? `[DI] Field Injection: Using Java Reflection to force-populate private field 'paymentRepository' in OrderService.`
            : `[DI] Dependencies already satisfied via constructor. Skipping reflection updates.`
        ]);

        // Step 4: PostConstruct
        setTimeout(() => {
          setIocStep(4);
          if (hasPostConstruct) {
            setIocLogs(prev => [
              ...prev,
              `[Lifecycle] Invoking '@PostConstruct' init() method in OrderService...`,
              `[Initialization] Cache registers warmed. Services verified.`
            ]);
          } else {
            setIocLogs(prev => [
              ...prev,
              `[Lifecycle] No bean initialization callbacks declared. Skipping initialization.`
            ]);
          }

          // Step 5: Ready / Scopes query
          setTimeout(() => {
            setIocStep(5);
            const ref1 = beanScope === 'singleton' ? '@OrderService#2f48a1' : `@OrderService#${Math.random().toString(16).substr(2, 6)}`;
            const ref2 = beanScope === 'singleton' ? '@OrderService#2f48a1' : `@OrderService#${Math.random().toString(16).substr(2, 6)}`;
            setBeanReferences([ref1, ref2]);
            setIocLogs(prev => [
              ...prev,
              `[Container] ApplicationContext initialized successfully.`,
              `[Query] client.getBean(OrderService.class) -> returned Reference: ${ref1}`,
              `[Query] client.getBean(OrderService.class) -> returned Reference: ${ref2}`,
              beanScope === 'singleton'
                ? `🟢 Singleton Scope verified: Both bean queries returned the exact same context instance.`
                : `🟡 Prototype Scope verified: Each bean query returned a brand new unique instance.`
            ]);
            setIsIocRunning(false);
          }, 1200);

        }, 1200);

      }, 1200);

    }, 1200);
  };

  const resetIoc = () => {
    setIocStep(0);
    setIocLogs(['Spring container is idle. Configure variables and click Boot.']);
    setBeanReferences([]);
    setIsIocRunning(false);
  };

  // --- MVC SIMULATOR STATE ---
  const [userName, setUserName] = useState('John Doe');
  const [userEmail, setUserEmail] = useState('john@example.com');
  const [isMvcRunning, setIsMvcRunning] = useState(false);
  const [mvcLogs, setMvcLogs] = useState([]);
  const [httpResponse, setHttpResponse] = useState(null);

  const sendMvcRequest = () => {
    if (isMvcRunning) return;
    setIsMvcRunning(true);
    setHttpResponse(null);
    setMvcLogs([
      `[HTTP Request] POST /api/users`,
      `[DispatcherServlet] Front Controller intercepted inbound request...`
    ]);

    // Step 2: Mapping
    setTimeout(() => {
      setMvcLogs(prev => [
        ...prev,
        `[HandlerMapping] Searching mappings... Matched route to UserController.createUser(UserDto)`,
        `[HandlerAdapter] Reading request body, converting payload bytes to UserDto POJO...`
      ]);

      // Step 3: Validation
      setTimeout(() => {
        const isNameEmpty = !userName.trim();
        const isEmailInvalid = !userEmail.includes('@') || !userEmail.includes('.');
        
        if (isNameEmpty || isEmailInvalid) {
          setMvcLogs(prev => [
            ...prev,
            `[Validation] @Valid triggered. Constraints validation failed!`,
            isNameEmpty ? `[Error] Name constraint violated: @NotBlank required.` : '',
            isEmailInvalid ? `[Error] Email constraint violated: @Email structure invalid.` : '',
            `[AOP Exception] Raising MethodArgumentNotValidException...`,
            `[ExceptionAdvice] Caught by @RestControllerAdvice GlobalExceptionHandler...`
          ].filter(Boolean));

          setTimeout(() => {
            setHttpResponse({
              status: '400 Bad Request',
              headers: {
                'Content-Type': 'application/json',
                'Date': new Date().toUTCString()
              },
              body: JSON.stringify({
                timestamp: new Date().toISOString(),
                status: 400,
                error: 'Bad Request',
                message: 'Validation failed for field values.',
                errors: [
                  isNameEmpty ? { field: 'name', message: 'must not be blank' } : null,
                  isEmailInvalid ? { field: 'email', message: 'must be a well-formed email address' } : null
                ].filter(Boolean)
              }, null, 2)
            });
            setIsMvcRunning(false);
          }, 1200);

        } else {
          setMvcLogs(prev => [
            ...prev,
            `[Validation] @Valid triggered. Check constraints passed successfully.`,
            `[Controller] UserController invoked. Saving user to repository...`,
            `[Repository] Saved Entity: Customer { name: "${userName}", email: "${userEmail}" }`
          ]);

          setTimeout(() => {
            setHttpResponse({
              status: '201 Created',
              headers: {
                'Content-Type': 'application/json',
                'Location': '/api/users/102',
                'Date': new Date().toUTCString()
              },
              body: JSON.stringify({
                id: 102,
                name: userName,
                email: userEmail,
                created: new Date().toISOString()
              }, null, 2)
            });
            setIsMvcRunning(false);
          }, 1200);
        }

      }, 1200);

    }, 1200);
  };

  return (
    <div className="space-y-6">
      
      {/* Selector Tabs */}
      <div className="flex border-b border-neutral-200 dark:border-neutral-800 dark:border-neutral-900 pb-3 gap-3">
        <button
          onClick={() => setActiveTab('ioc')}
          className={`px-4 py-2 text-xs font-mono font-black uppercase rounded-lg border transition-all cursor-pointer flex items-center space-x-2
            ${activeTab === 'ioc' 
              ? 'bg-green-500/10 text-green-500 border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.15)]' 
              : 'bg-transparent text-gray-555 dark:text-gray-455 border-neutral-200 dark:border-neutral-800 dark:border-neutral-900 hover:border-green-500/20'}`}
        >
          <Cpu className="h-4 w-4" />
          <span>Spring Bean & IoC Container</span>
        </button>
        <button
          onClick={() => setActiveTab('mvc')}
          className={`px-4 py-2 text-xs font-mono font-black uppercase rounded-lg border transition-all cursor-pointer flex items-center space-x-2
            ${activeTab === 'mvc' 
              ? 'bg-green-500/10 text-green-500 border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.15)]' 
              : 'bg-transparent text-gray-555 dark:text-gray-455 border-neutral-200 dark:border-neutral-800 dark:border-neutral-900 hover:border-green-500/20'}`}
        >
          <Network className="h-4 w-4" />
          <span>DispatcherServlet MVC</span>
        </button>
      </div>

      {activeTab === 'ioc' ? (
        // IOC CONTAINER SIMULATOR
        <div className="bg-white/80 dark:bg-neutral-950/70 backdrop-blur-md border border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 rounded-2xl p-6 md:p-8 shadow-lg space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 pb-4">
            <div>
              <h2 className="text-lg font-black text-gray-900 dark:text-white font-mono uppercase tracking-wide">
                <span>☕ ApplicationContext IoC Engine Simulator</span>
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 font-light leading-relaxed">
                Configure injection styles, scopes, and lifecycle callbacks to watch the Spring container initialize beans.
              </p>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={resetIoc}
                className="flex items-center space-x-2 px-3 py-1.5 bg-green-500/10 hover:bg-green-500/25 text-green-500 border border-green-500/20 rounded-lg text-xs font-mono font-black cursor-pointer transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset</span>
              </button>
              <button
                onClick={runIocBootstrap}
                disabled={isIocRunning || iocStep === 5}
                className="flex items-center space-x-2 px-4 py-1.5 bg-green-600 hover:bg-green-500 text-white rounded-lg text-xs font-mono font-black cursor-pointer transition-colors shadow-lg hover:shadow-green-500/20 disabled:bg-gray-400"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>{isIocRunning ? 'Booting...' : 'Bootstrap ApplicationContext'}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            
            {/* Input Config Panel */}
            <div className="lg:col-span-1 bg-white/15 dark:bg-neutral-900/30 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-900 rounded-xl p-4 space-y-4 font-mono text-xs">
              <span className="text-[10px] font-black text-slate-450 uppercase tracking-widest block border-b border-neutral-800 pb-1.5 font-bold">Container Configs</span>
              
              <div className="space-y-1.5">
                <label className="text-[10px] text-gray-400 uppercase font-black tracking-wider">Dependency Injection:</label>
                <div className="flex flex-col space-y-1">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="radio" checked={diStyle === 'constructor'} onChange={() => setDiStyle('constructor')} className="text-green-500 focus:ring-green-500" />
                    <span>Constructor Injection</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="radio" checked={diStyle === 'field'} onChange={() => setDiStyle('field')} className="text-green-500 focus:ring-green-500" />
                    <span>Field Injection</span>
                  </label>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-gray-400 uppercase font-black tracking-wider">Bean Scope:</label>
                <div className="flex flex-col space-y-1">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="radio" checked={beanScope === 'singleton'} onChange={() => setBeanScope('singleton')} className="text-green-500 focus:ring-green-500" />
                    <span>@Scope("singleton")</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="radio" checked={beanScope === 'prototype'} onChange={() => setBeanScope('prototype')} className="text-green-500 focus:ring-green-500" />
                    <span>@Scope("prototype")</span>
                  </label>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-gray-400 uppercase font-black tracking-wider">Callbacks:</label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" checked={hasPostConstruct} onChange={(e) => setHasPostConstruct(e.target.checked)} className="text-green-500 rounded focus:ring-green-500" />
                  <span>Enable @PostConstruct</span>
                </label>
              </div>
            </div>

            {/* Animation Canvas */}
            <div className="lg:col-span-3 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-900 bg-neutral-950/65 rounded-xl p-5 min-h-[200px] flex flex-col justify-center relative overflow-hidden">
              
              <div className="flex items-center justify-around gap-4 z-10 text-center font-mono text-xs">
                
                {/* Dependency repository */}
                <div className={`p-4 border rounded-xl w-1/3 transition-all ${iocStep >= 1 ? 'border-green-500 bg-green-500/5 text-green-500 shadow-sm' : 'border-neutral-800 text-gray-600'}`}>
                  <Database className="h-6 w-6 mx-auto mb-1" />
                  <strong className="block text-[10px] font-bold">PaymentRepository</strong>
                  <span className="text-[8px] opacity-75">@Repository</span>
                </div>

                {/* Wire flow */}
                <div className="flex-1 flex flex-col items-center justify-center">
                  {iocStep === 3 && (
                    <motion.div
                      className="px-2 py-0.5 bg-green-500 text-white rounded text-[8px] font-black uppercase shadow-lg absolute"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1.1, opacity: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      DI: Injected!
                    </motion.div>
                  )}
                  <ArrowRight className={`h-6 w-6 transition-all ${iocStep >= 3 ? 'text-green-500' : 'text-neutral-800'}`} />
                </div>

                {/* Main Service */}
                <div className={`p-4 border rounded-xl w-1/3 transition-all ${iocStep >= 2 ? 'border-green-500 bg-green-500/5 text-green-500 shadow-sm' : 'border-neutral-800 text-gray-600'}`}>
                  <Cpu className="h-6 w-6 mx-auto mb-1" />
                  <strong className="block text-[10px] font-bold">OrderService</strong>
                  <span className="text-[8px] opacity-75">@Service</span>
                  {iocStep === 4 && hasPostConstruct && (
                    <span className="block text-[8px] text-yellow-500 font-bold mt-1">@PostConstruct running...</span>
                  )}
                </div>

              </div>

              {beanReferences.length > 0 && (
                <div className="mt-6 p-3 border border-neutral-900 bg-black/60 rounded-lg text-center font-mono text-[10px] text-gray-400 space-y-1 animate-fadeIn">
                  <div className="text-gray-500 uppercase tracking-widest text-[8px] font-black">Context Bean Fetch References</div>
                  <div className="flex justify-around">
                    <div>Query #1 Ref: <strong className="text-green-500">{beanReferences[0]}</strong></div>
                    <div>Query #2 Ref: <strong className="text-green-500">{beanReferences[1]}</strong></div>
                  </div>
                </div>
              )}

            </div>

          </div>

          {/* Dialogue Log Console */}
          <div className="bg-black border border-neutral-900 rounded-xl p-4 font-mono text-xs text-green-400 space-y-1 max-h-48 overflow-y-auto">
            <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest font-mono block border-b border-neutral-900 pb-1 mb-2">Bootstrap Trace log console</span>
            {iocLogs.map((log, idx) => (
              <div key={idx}>$ {log}</div>
            ))}
          </div>

        </div>
      ) : (
        // DISPATCHER SERVLET FLOW SIMULATOR
        <div className="bg-white/80 dark:bg-neutral-950/70 backdrop-blur-md border border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 rounded-2xl p-6 md:p-8 shadow-lg space-y-6">
          <div className="border-b border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 pb-4">
            <h2 className="text-lg font-black text-gray-900 dark:text-white font-mono uppercase tracking-wide">
              <span>☕ Front Controller DispatcherServlet Routing</span>
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 font-light leading-relaxed">
              Submit a request to trigger validations. Watch the DispatcherServlet route, parse constraints, and execute Global Exception Advisors.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            
            {/* Form Input Variables */}
            <div className="lg:col-span-1 bg-white/15 dark:bg-neutral-900/30 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-900 rounded-xl p-4 space-y-4 font-mono text-xs">
              <span className="text-[10px] font-black text-slate-450 uppercase tracking-widest block border-b border-neutral-800 pb-1.5 font-bold">Request Payload</span>
              
              <div>
                <label className="block text-[10px] text-gray-400 uppercase tracking-wide mb-1">Name (@NotBlank):</label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full px-2 py-1 bg-neutral-950 border border-neutral-900 rounded text-white focus:outline-none focus:border-green-500"
                />
              </div>

              <div>
                <label className="block text-[10px] text-gray-400 uppercase tracking-wide mb-1">Email (@Email):</label>
                <input
                  type="text"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  className="w-full px-2 py-1 bg-neutral-950 border border-neutral-900 rounded text-white focus:outline-none focus:border-green-500"
                />
              </div>

              <button
                onClick={sendMvcRequest}
                disabled={isMvcRunning}
                className="w-full py-1.5 bg-green-600 hover:bg-green-500 text-white rounded font-black text-[10px] uppercase shadow cursor-pointer transition-colors"
              >
                {isMvcRunning ? 'Processing...' : 'Send HTTP POST'}
              </button>
            </div>

            {/* HTTP Output response viewer */}
            <div className="lg:col-span-3 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-900 bg-neutral-950/60 rounded-xl p-5 min-h-[220px] flex flex-col justify-between font-mono">
              <div className="text-[9px] font-black text-gray-500 uppercase tracking-widest block border-b border-neutral-900 pb-1.5 mb-2">HTTP Response Viewer</div>
              
              {httpResponse ? (
                <div className="text-xs space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] text-gray-500">STATUS:</span>
                      <strong className={`px-2 py-0.5 rounded text-[10px] ${httpResponse.status.includes('201') ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                        {httpResponse.status}
                      </strong>
                    </div>
                    <div className="text-[10px] text-gray-400">
                      <div>Content-Type: {httpResponse.headers['Content-Type']}</div>
                      {httpResponse.headers['Location'] && <div>Location: {httpResponse.headers['Location']}</div>}
                      <div>Date: {httpResponse.headers['Date']}</div>
                    </div>
                  </div>

                  <pre className="p-3 bg-black border border-neutral-900 rounded-lg text-[10.5px] text-gray-300 overflow-x-auto whitespace-pre-wrap flex-1 mt-2 max-h-48 overflow-y-auto">
                    {httpResponse.body}
                  </pre>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-600 text-xs">
                  {isMvcRunning ? (
                    <div className="space-y-2 text-center">
                      <div className="h-5 w-5 border-2 border-green-500 border-t-transparent animate-spin rounded-full mx-auto"></div>
                      <span className="text-[10px] text-green-500 uppercase tracking-widest font-black block">Routing request steps...</span>
                    </div>
                  ) : (
                    <span>Waiting for HTTP Request submission...</span>
                  )}
                </div>
              )}
            </div>

          </div>

          {/* Diagnostic Step Logs */}
          {mvcLogs.length > 0 && (
            <div className="bg-black border border-neutral-900 rounded-xl p-4 font-mono text-xs text-green-400 space-y-1">
              <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest font-mono block border-b border-neutral-900 pb-1 mb-2">DispatcherServlet Execution trace logs</span>
              {mvcLogs.map((log, idx) => (
                <div key={idx} className="flex items-start space-x-1">
                  <span>$</span>
                  <span className={log.includes('[Error]') ? 'text-red-400' : log.includes('🟢') ? 'text-emerald-400' : 'text-green-400'}>{log}</span>
                </div>
              ))}
            </div>
          )}

        </div>
      )}

    </div>
  );
}
