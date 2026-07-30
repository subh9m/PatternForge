import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { 
  Activity, ShieldCheck, Server, AlertTriangle, Play, 
  RefreshCw, Cpu, Database, Key, Clock, ShieldAlert, 
  Sparkles, Check, X, Search, ChevronDown, ChevronUp, 
  History, Sliders, Settings 
} from 'lucide-react';

interface OverviewStats {
  gatewayUptime: string;
  overallGatewayStatus: string;
  healthyProviders: string[];
  unavailableProviders: string[];
  rateLimitedProviders: string[];
  disabledProviders: string[];
  currentPrimaryProvider: string;
  currentFallbackOrder: string[];
  gatewaySuccessRate: number;
  averageResponseTime: number;
  averageGenerationTime: number;
  cacheHitRate: number;
  problemsGeneratedToday: number;
  problemsGeneratedTotal: number;
  aiRequestsToday: number;
  aiRequestsTotal: number;
  successfulRequests: number;
  failedRequests: number;
}

interface ProviderStats {
  providerName: string;
  configured: boolean;
  apiKeyExists: boolean;
  apiKeyNotEmpty: boolean;
  endpointConfigured: boolean;
  apiKeyMasked: string;
  configuredModel: string;
  temperature: number;
  timeout: number;
  retries: number;
  maxOutputTokens: number;
  creditsRemaining?: string;
  dailyLimits: string;
  remainingRequests?: string;
  statusColor: string; // "Green" | "Yellow" | "Orange" | "Red" | "Gray"
  healthState: string; // "Healthy" | "Disabled" | "Offline" | "Rate Limited" | "Slow"
  circuitState: string; // "CLOSED" | "OPEN" | "HALF_OPEN"
  requestsToday: number;
  requestsTotal: number;
  successfulRequests: number;
  failedRequests: number;
  latency: number;
  averageLatency: number;
  lastUsed: string;
  lastSuccessfulRequest: string;
  lastFailure: string;
  failureReason: string;
}

interface RequestLog {
  id: string;
  timestamp: string;
  problemId: string;
  problemName: string;
  providerName: string;
  modelName: string;
  latencyMs: number;
  httpStatus: number;
  inputTokens: number;
  outputTokens: number;
  estimatedCost: number;
  cacheHit: boolean;
  generationType: string;
  success: boolean;
  errorMessage?: string;
  responseBody?: string;
  providerSwitched: boolean;
  retryCount: number;
}

const AiDashboard: React.FC = () => {
  const [overview, setOverview] = useState<OverviewStats | null>(null);
  const [providers, setProviders] = useState<ProviderStats[]>([]);
  const [history, setHistory] = useState<RequestLog[]>([]);
  const [activeProviderDetail, setActiveProviderDetail] = useState<{name: string, type: 'req' | 'res'} | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterProvider, setFilterProvider] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Interactive Action States
  const [testingProvider, setTestingProvider] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ [key: string]: any }>({});
  const [togglingProvider, setTogglingProvider] = useState<string | null>(null);
  const [resettingCircuit, setResettingCircuit] = useState<string | null>(null);

  // Expanded Logs State
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const fetchDashboardData = async (isSilent = false) => {
    if (!isSilent) setRefreshing(true);
    try {
      const [over, prov, hist] = await Promise.all([
        api.get<OverviewStats>('/admin/ai/overview'),
        api.get<ProviderStats[]>('/admin/ai/providers'),
        api.get<RequestLog[]>('/admin/ai/history')
      ]);
      setOverview(over);
      setProviders(prov);
      setHistory(hist);
    } catch (e) {
      console.error("Failed to load dashboard data", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // 30 seconds Auto Refresh
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchDashboardData(true);
    }, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const handleTestProvider = async (name: string) => {
    setTestingProvider(name);
    setTestResult(prev => ({ ...prev, [name]: null }));
    try {
      const res = await api.post<any>(`/admin/ai/providers/${name}/test`, {});
      setTestResult(prev => ({ ...prev, [name]: res }));
      fetchDashboardData(true);
    } catch (e: any) {
      setTestResult(prev => ({
        ...prev,
        [name]: { success: false, httpStatus: 500, responseBody: "Connection Failure: " + e.message }
      }));
    } finally {
      setTestingProvider(null);
    }
  };

  const handleToggleProvider = async (name: string) => {
    setTogglingProvider(name);
    try {
      await api.post(`/admin/ai/providers/${name}/toggle`, {});
      fetchDashboardData(true);
    } catch (e) {
      alert("Failed to toggle provider status.");
    } finally {
      setTogglingProvider(null);
    }
  };

  const handleResetCircuit = async (name: string) => {
    setResettingCircuit(name);
    try {
      await api.post(`/admin/ai/providers/${name}/reset-circuit`, {});
      fetchDashboardData(true);
    } catch (e) {
      alert("Failed to reset circuit breaker.");
    } finally {
      setResettingCircuit(null);
    }
  };

  // Filter & Search Logic
  const filteredHistory = history.filter(log => {
    const matchesSearch = 
      log.problemName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.problemId?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesProvider = 
      filterProvider === 'ALL' || log.providerName.toUpperCase() === filterProvider.toUpperCase();
    
    const matchesStatus = 
      filterStatus === 'ALL' ||
      (filterStatus === 'SUCCESS' && log.success) ||
      (filterStatus === 'FAILURE' && !log.success);

    return matchesSearch && matchesProvider && matchesStatus;
  });

  const getStatusBadgeClass = (color: string) => {
    switch (color) {
      case 'Green':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Yellow':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse';
      case 'Orange':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'Red':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'Gray':
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Loading AI Monitoring Infrastructure...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-black text-slate-100 uppercase tracking-widest flex items-center space-x-2">
            <Activity className="h-5 w-5 text-blue-400" />
            <span>AI Gateway Control Room</span>
          </h2>
          <p className="text-[10px] text-slate-500 mt-1 uppercase font-bold tracking-wider">
            Real-time multi-provider routing diagnostic dashboard.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Auto Refresh Toggle */}
          <label className="flex items-center space-x-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl cursor-pointer">
            <input 
              type="checkbox" 
              checked={autoRefresh} 
              onChange={() => setAutoRefresh(!autoRefresh)}
              className="accent-primary h-3.5 w-3.5"
            />
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">
              Auto Refresh (30s)
            </span>
          </label>

          <button
            onClick={() => fetchDashboardData()}
            disabled={refreshing}
            className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-blue-500/40 rounded-xl transition-smooth text-slate-300 hover:text-slate-100"
            title="Force refresh"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin text-blue-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* OVERVIEW STATS GRID */}
      {overview && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-panel p-4 rounded-2xl flex flex-col justify-between">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Gateway Health</span>
            <span className="text-lg font-black text-slate-100 mt-1 block">{overview.overallGatewayStatus}</span>
            <span className="text-[10px] font-bold text-slate-400 mt-2 block uppercase">Uptime: {overview.gatewayUptime}</span>
          </div>

          <div className="glass-panel p-4 rounded-2xl flex flex-col justify-between">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Failover Performance</span>
            <span className="text-lg font-black text-emerald-400 mt-1 block">{overview.gatewaySuccessRate.toFixed(1)}% Success</span>
            <span className="text-[10px] font-bold text-slate-400 mt-2 block uppercase">Active Primary: {overview.currentPrimaryProvider}</span>
          </div>

          <div className="glass-panel p-4 rounded-2xl flex flex-col justify-between">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Response Latency</span>
            <span className="text-lg font-black text-blue-400 mt-1 block">~ {overview.averageResponseTime.toFixed(2)} sec</span>
            <span className="text-[10px] font-bold text-slate-400 mt-2 block uppercase">Est. Generation: {overview.averageGenerationTime.toFixed(2)}s</span>
          </div>

          <div className="glass-panel p-4 rounded-2xl flex flex-col justify-between">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Local Cache Hit Rate</span>
            <span className="text-lg font-black text-purple-400 mt-1 block">{overview.cacheHitRate.toFixed(1)}% hits</span>
            <span className="text-[10px] font-bold text-slate-400 mt-2 block uppercase">Generations Today: {overview.problemsGeneratedToday}</span>
          </div>
        </div>
      )}

      {/* OVERVIEW STATS EXTENDED */}
      {overview && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Active order list */}
          <div className="glass-panel p-4 rounded-2xl space-y-3">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block border-b border-slate-800 pb-1.5">
              Current Active Router Sequence
            </span>
            <div className="space-y-1.5">
              {overview.currentFallbackOrder.map((name, i) => (
                <div key={name} className="flex items-center justify-between text-xs p-1.5 rounded-lg bg-slate-950/40 border border-slate-800">
                  <span className="font-bold text-slate-300">
                    {i + 1}. {name}
                  </span>
                  {overview.healthyProviders.includes(name) ? (
                    <span className="text-[10px] font-bold text-emerald-400">Primary Candidate</span>
                  ) : overview.disabledProviders.includes(name) ? (
                    <span className="text-[10px] font-bold text-slate-500">Disabled</span>
                  ) : (
                    <span className="text-[10px] font-bold text-red-400">Offline / Tripped</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Request logs quick view */}
          <div className="glass-panel p-4 rounded-2xl space-y-3 md:col-span-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block border-b border-slate-800 pb-1.5">
              Gateway Request Counters
            </span>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-1">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-black block">Total Attempts</span>
                <span className="text-md font-extrabold text-slate-200 mt-0.5 block">{overview.aiRequestsTotal}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-black block">Attempts Today</span>
                <span className="text-md font-extrabold text-slate-200 mt-0.5 block">{overview.aiRequestsToday}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-black block">Successful Calls</span>
                <span className="text-md font-extrabold text-emerald-400 mt-0.5 block">{overview.successfulRequests}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-black block">Failed Calls</span>
                <span className="text-md font-extrabold text-red-400 mt-0.5 block">{overview.failedRequests}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PROVIDER DASHBOARD CARDS */}
      <div className="space-y-4">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-2">
          PROVIDER METRIC DECKS
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {providers.map((p) => {
            const hasTestRes = testResult[p.providerName];
            return (
              <div key={p.providerName} className="glass-panel rounded-2xl p-6 flex flex-col justify-between gap-6 border border-slate-800 hover:border-slate-800 transition-smooth">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h4 className="text-md font-black text-slate-200">{p.providerName}</h4>
                    <span className="text-[9px] font-mono text-slate-500">{p.configuredModel}</span>
                  </div>

                  <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-extrabold border ${getStatusBadgeClass(p.statusColor)}`}>
                    {p.healthState} ({p.circuitState})
                  </span>
                </div>

                {/* Configuration Stats */}
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="space-y-2">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Temperature / Limit</span>
                      <span className="font-semibold text-slate-300">
                        Temp: {p.temperature.toFixed(1)} / Max: {p.maxOutputTokens} tokens
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 block">Uptime Performance</span>
                      <span className="font-semibold text-slate-300">
                        {p.requestsTotal > 0 ? ((p.successfulRequests / p.requestsTotal) * 100).toFixed(1) : 100.0}% success
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 block">Average / Last Latency</span>
                      <span className="font-semibold text-slate-300">
                        {p.averageLatency.toFixed(2)}s / {(p.latency / 1000).toFixed(2)}s
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Requests (Today / Total)</span>
                      <span className="font-semibold text-slate-300">
                        {p.requestsToday} / {p.requestsTotal}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 block">Limits / Quotas</span>
                      <span className="font-semibold text-slate-400 break-words max-w-[150px]">
                        {p.dailyLimits}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 block">Last Successful Call</span>
                      <span className="font-mono text-[9px] text-slate-400">
                        {p.lastSuccessfulRequest !== 'Never' ? new Date(p.lastSuccessfulRequest).toLocaleTimeString() : 'Never'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Expandable diagnostic results */}
                {hasTestRes && (
                  <div className={`p-3 rounded-xl border text-[10px] font-mono space-y-1 ${
                    hasTestRes.success ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400' : 'bg-red-500/5 border-red-500/20 text-red-400'
                  }`}>
                    <div className="font-bold uppercase tracking-wider">Test Completed:</div>
                    <div>Status: {hasTestRes.success ? 'Success (200)' : `Failed (${hasTestRes.httpStatus})`}</div>
                    <div>Latency: {hasTestRes.latencyMs}ms</div>
                    <div className="truncate">Response: {hasTestRes.responseBody}</div>
                  </div>
                )}

                {/* Card Control Actions */}
                <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800 mt-auto">
                  <button
                    onClick={() => handleTestProvider(p.providerName)}
                    disabled={testingProvider !== null}
                    className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 hover:border-emerald-500/40 rounded-lg text-[10px] font-extrabold uppercase tracking-wider text-slate-300 hover:text-slate-100 transition-smooth"
                    title="Execute a tiny generation check"
                  >
                    {testingProvider === p.providerName ? 'Testing...' : 'Run Gen Test'}
                  </button>

                  <button
                    onClick={() => {
                      alert(p.configured ? `${p.providerName} is correctly configured and reachable.` : `${p.providerName} is not configured.`);
                    }}
                    className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 hover:border-blue-500/40 rounded-lg text-[10px] font-extrabold uppercase tracking-wider text-slate-300 hover:text-slate-100 transition-smooth"
                    title="Verify API settings"
                  >
                    Run Health Check
                  </button>

                  <button
                    onClick={() => handleResetCircuit(p.providerName)}
                    disabled={resettingCircuit !== null || p.circuitState === 'CLOSED'}
                    className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 hover:border-amber-500/45 rounded-lg text-[10px] font-extrabold uppercase tracking-wider text-slate-300 hover:text-slate-100 disabled:opacity-30 transition-smooth"
                    title="Reset circuit breaker state"
                  >
                    Reset Circuit
                  </button>

                  <button
                    onClick={() => handleToggleProvider(p.providerName)}
                    disabled={togglingProvider !== null}
                    className={`px-2.5 py-1.5 border rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition-smooth ${
                      p.healthState === 'Disabled' 
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20'
                        : 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20'
                    }`}
                  >
                    {p.healthState === 'Disabled' ? 'Enable Provider' : 'Disable Provider'}
                  </button>

                  <button
                    onClick={() => fetchDashboardData(true)}
                    className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 hover:border-purple-500/40 rounded-lg text-[10px] font-extrabold uppercase tracking-wider text-slate-300 hover:text-slate-100 transition-smooth"
                    title="Reload stats"
                  >
                    Refresh Usage
                  </button>

                  <button
                    onClick={() => {
                      setFilterProvider(p.providerName.toUpperCase());
                      const el = document.getElementById("log-history-section");
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 hover:border-indigo-500/45 rounded-lg text-[10px] font-extrabold uppercase tracking-wider text-slate-300 hover:text-slate-100 transition-smooth"
                    title="Filter history table"
                  >
                    View Logs
                  </button>

                  <button
                    onClick={() => {
                      const lastLog = history.find(l => l.providerName.toLowerCase() === p.providerName.toLowerCase());
                      if (lastLog) {
                        setActiveProviderDetail({ name: p.providerName, type: 'req' });
                      } else {
                        alert("No recent request logs found for this provider.");
                      }
                    }}
                    className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 hover:border-slate-500 rounded-lg text-[10px] font-extrabold uppercase tracking-wider text-slate-300 hover:text-slate-100 transition-smooth"
                  >
                    View Last Request
                  </button>

                  <button
                    onClick={() => {
                      const lastLog = history.find(l => l.providerName.toLowerCase() === p.providerName.toLowerCase());
                      if (lastLog) {
                        setActiveProviderDetail({ name: p.providerName, type: 'res' });
                      } else {
                        alert("No recent response logs found for this provider.");
                      }
                    }}
                    className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 hover:border-slate-500 rounded-lg text-[10px] font-extrabold uppercase tracking-wider text-slate-300 hover:text-slate-100 transition-smooth"
                  >
                    View Last Response
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* DETAILED REQUEST HISTORY LOGS */}
      <div id="log-history-section" className="glass-panel p-6 rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <History className="h-4.5 w-4.5 text-blue-400" />
            <h3 className="text-xs font-black text-slate-300 uppercase tracking-wider">
              AI Request Log History
            </h3>
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search problem..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="glass-input rounded-xl pl-8 pr-3 py-1.5 text-[11px] w-40"
              />
              <Search className="h-3 w-3 text-slate-500 absolute left-2.5 top-2.5" />
            </div>

            {/* Provider Filter */}
            <select
              value={filterProvider}
              onChange={(e) => setFilterProvider(e.target.value)}
              className="glass-input rounded-xl px-2 py-1.5 text-[11px] bg-slate-900 border border-slate-800"
            >
              <option value="ALL">All Providers</option>
              <option value="GEMINI">Gemini</option>
              <option value="GROQ">Groq</option>
              <option value="GITHUB">GitHub</option>
              <option value="OPENROUTER">OpenRouter</option>
            </select>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="glass-input rounded-xl px-2 py-1.5 text-[11px] bg-slate-900 border border-slate-800"
            >
              <option value="ALL">All Statuses</option>
              <option value="SUCCESS">Success Only</option>
              <option value="FAILURE">Failures Only</option>
            </select>
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/40">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/80 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Problem Name</th>
                <th className="px-4 py-3">Provider</th>
                <th className="px-4 py-3">Model</th>
                <th className="px-4 py-3">Latency</th>
                <th className="px-4 py-3">Tokens (In / Out)</th>
                <th className="px-4 py-3">Est. Cost</th>
                <th className="px-4 py-3">Result</th>
                <th className="px-2 py-3 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-xs">
              {filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-slate-500 font-bold uppercase tracking-wider">
                    No requests found matching filters.
                  </td>
                </tr>
              ) : (
                filteredHistory.map((log) => {
                  const isExpanded = expandedLogId === log.id;
                  return (
                    <React.Fragment key={log.id}>
                      <tr className="hover:bg-slate-900/20">
                        <td className="px-4 py-3 text-slate-400">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </td>
                        <td className="px-4 py-3 font-bold text-slate-300 truncate max-w-[180px]" title={log.problemName}>
                          {log.problemName}
                        </td>
                        <td className="px-4 py-3 text-slate-300 font-semibold">{log.providerName}</td>
                        <td className="px-4 py-3 font-mono text-[10px] text-slate-500">{log.modelName}</td>
                        <td className="px-4 py-3 text-slate-300 font-bold">{(log.latencyMs / 1000).toFixed(2)}s</td>
                        <td className="px-4 py-3 text-slate-400 font-mono text-[10px]">
                          {log.inputTokens} / {log.outputTokens}
                        </td>
                        <td className="px-4 py-3 text-slate-400 font-mono text-[10px]">
                          ${log.estimatedCost.toFixed(5)}
                        </td>
                        <td className="px-4 py-3">
                          {log.success ? (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              HTTP {log.httpStatus}
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-red-500/10 text-red-400 border border-red-500/20 animate-pulse">
                              HTTP {log.httpStatus}
                            </span>
                          )}
                        </td>
                        <td className="px-2 py-3 text-center">
                          <button
                            onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                            className="p-1 hover:bg-slate-900 rounded-md text-slate-500 hover:text-slate-200 transition-smooth"
                          >
                            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </button>
                        </td>
                      </tr>

                      {/* Expandable failure/content deck */}
                      {isExpanded && (
                        <tr className="bg-slate-950/80">
                          <td colSpan={9} className="px-6 py-4 space-y-3 border-t border-slate-900 text-[10px] font-mono leading-relaxed">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Request Audit Metadata</span>
                                <div>Log ID: {log.id}</div>
                                <div>Problem ID: {log.problemId}</div>
                                <div>Generation Type: {log.generationType}</div>
                                <div>Retry Count: {log.retryCount}</div>
                                <div>Router Switched: {log.providerSwitched ? "Yes" : "No"}</div>
                              </div>

                              <div className="space-y-1">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Response Logs</span>
                                {log.errorMessage ? (
                                  <div className="text-red-400 bg-red-950/20 p-2 rounded border border-red-950/30 break-all select-all">
                                    Error Details: {log.errorMessage}
                                  </div>
                                ) : (
                                  <div className="text-emerald-400 bg-emerald-950/20 p-2 rounded border border-emerald-950/30 break-all select-all truncate max-h-32 overflow-y-auto">
                                    Response Content: {log.responseBody}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* Last Request / Response Modal Overlay */}
      {activeProviderDetail && (() => {
        const lastLog = history.find(l => l.providerName.toLowerCase() === activeProviderDetail.name.toLowerCase());
        const isReq = activeProviderDetail.type === 'req';
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div className="glass-panel w-full max-w-2xl rounded-2xl p-6 space-y-4 max-h-[85vh] overflow-y-auto relative border border-slate-800">
              <button 
                onClick={() => setActiveProviderDetail(null)}
                className="absolute top-4 right-4 p-1.5 hover:bg-slate-900 rounded-lg text-slate-400 hover:text-slate-200 transition-smooth"
              >
                <X className="h-5 w-5" />
              </button>

              <h4 className="text-sm font-black text-slate-200 uppercase tracking-widest flex items-center space-x-2">
                <span>{activeProviderDetail.name}</span>
                <span className="text-[10px] text-slate-500 font-bold">— Last {isReq ? 'Request' : 'Response'}</span>
              </h4>

              <div className="text-[11px] font-mono leading-relaxed bg-slate-950 p-4 rounded-xl border border-slate-800 overflow-x-auto text-slate-300 whitespace-pre-wrap select-all">
                {isReq ? (
                  <>
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">Request Meta & Prompt Estimate</div>
                    <div>Timestamp: {lastLog ? new Date(lastLog.timestamp).toLocaleString() : 'N/A'}</div>
                    <div>Problem ID: {lastLog?.problemId}</div>
                    <div>Problem Name: {lastLog?.problemName}</div>
                    <div>Generation Type: {lastLog?.generationType}</div>
                    <div>Input Tokens Estimate: {lastLog?.inputTokens} tokens</div>
                    <div className="mt-3 border-t border-slate-900 pt-2 text-slate-400">
                      Prompt generation requested details for problem: {lastLog?.problemName}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">Response Body or Error</div>
                    {lastLog?.success ? (
                      <div>{lastLog.responseBody}</div>
                    ) : (
                      <div className="text-red-400">{lastLog?.errorMessage || "Unknown error occurred"}</div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default AiDashboard;
