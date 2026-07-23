import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { setResetTime } from '../hooks/useDailyReset';
import { Settings, Save, Monitor, Terminal, RefreshCw, ShieldCheck, Copy, Check } from 'lucide-react';

interface SettingsDto {
  darkMode: boolean;
  editorTheme: string;
  fontSize: number;
  tabSize: number;
  autosaveInterval: number;
  keyboardShortcutsEnabled: boolean;
  dailyGoal: number;
  dailyResetHour: number;   // 0-23
  dailyResetMinute: number; // 0-59
}

const SettingsView: React.FC = () => {
  const [settings, setSettings] = useState<SettingsDto>({
    darkMode: true,
    editorTheme: 'vs-dark',
    fontSize: 14,
    tabSize: 4,
    autosaveInterval: 30,
    keyboardShortcutsEnabled: true,
    dailyGoal: 3,
    dailyResetHour: 2,
    dailyResetMinute: 0,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [syncFileName, setSyncFileName] = useState<string | null>(null);
  const [syncPermissionGranted, setSyncPermissionGranted] = useState(false);

  // LeetCode Integration State
  const [leetcodeStatus, setLeetcodeStatus] = useState<any>(null);
  const [tokenStatus, setTokenStatus] = useState<any>(null);
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  // AI Gateway Health Check State
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [checkingHealth, setCheckingHealth] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await api.get<SettingsDto>('/settings');
        setSettings(data);
        // Seed localStorage with "HH:mm" so timer components always have the latest reset time
        setResetTime(data.dailyResetHour ?? 2, data.dailyResetMinute ?? 0);
      } catch (e) {
        console.error("Failed to load settings", e);
      } finally {
        setLoading(false);
      }
    };
    const loadLeetcodeData = async () => {
      try {
        const statusData = await api.get<any>('/leetcode/status');
        setLeetcodeStatus(statusData);
        const tStatus = await api.get<any>('/leetcode/token/status');
        setTokenStatus(tStatus);
      } catch (e) {
        console.error("Failed to load LeetCode status", e);
      }
    };
    const checkSyncFile = async () => {
      if ((api as any).getSyncFileName) {
        const name = await (api as any).getSyncFileName();
        setSyncFileName(name);
        if (name) {
          const granted = await (api as any).checkSyncPermissionGranted();
          setSyncPermissionGranted(granted);
        }
      }
    };
    const loadHealthStatus = async () => {
      try {
        const hData = await api.get<any>('/admin/ai/health');
        setHealthStatus(hData);
      } catch (e) {
        console.error("Failed to load initial AI health status", e);
      }
    };
    loadSettings();
    loadLeetcodeData();
    checkSyncFile();
    loadHealthStatus();
  }, []);

  const handleGenerateToken = async () => {
    try {
      const res = await api.post<any>('/leetcode/token/generate', {});
      setGeneratedToken(res.token);
      setTokenStatus({ exists: true, createdAt: new Date().toISOString() });
    } catch (e) {
      alert("Failed to generate sync token");
    }
  };

  const handleRevokeToken = async () => {
    if (!confirm("Are you sure you want to revoke the sync token? This will break any existing userscripts using it.")) return;
    try {
      await api.post('/leetcode/token/revoke', {});
      setGeneratedToken(null);
      setTokenStatus({ exists: false, createdAt: null });
      alert("Token revoked successfully.");
    } catch (e) {
      alert("Failed to revoke token");
    }
  };

  const handleCopyToken = () => {
    if (generatedToken) {
      navigator.clipboard.writeText(generatedToken);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const handleExportData = () => {
    const keysToExport = ['token', 'pf_users', 'pf_attempts', 'pf_submissions', 'pf_settings'];
    const exportObj: Record<string, string | null> = {};
    keysToExport.forEach(key => {
      exportObj[key] = localStorage.getItem(key);
    });

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href",     dataStr);
    downloadAnchor.setAttribute("download", `patternforge-dsa-backup-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    const files = e.target.files;
    if (!files || files.length === 0) return;

    fileReader.readAsText(files[0], "UTF-8");
    fileReader.onload = (event) => {
      try {
        const importObj = JSON.parse(event.target?.result as string);
        const keys = ['token', 'pf_users', 'pf_attempts', 'pf_submissions', 'pf_settings'];
        
        let importedCount = 0;
        keys.forEach(key => {
          if (key in importObj) {
            const val = importObj[key];
            if (val === null) {
              localStorage.removeItem(key);
            } else {
              localStorage.setItem(key, val);
            }
            importedCount++;
          }
        });

        if (importedCount > 0) {
          alert('Progress imported successfully! The page will now reload.');
          window.location.reload();
        } else {
          alert('Invalid backup file structure.');
        }
      } catch (err) {
        alert('Error parsing JSON backup file.');
      }
    };
  };

  const handleLinkSyncFile = async (action: 'create' | 'open') => {
    if (!(api as any).linkSyncFile) return;
    const name = await (api as any).linkSyncFile(action);
    if (name) {
      setSyncFileName(name);
      setSyncPermissionGranted(true);
    }
  };

  const handleUnlinkSyncFile = async () => {
    if (!(api as any).unlinkSyncFile) return;
    await (api as any).unlinkSyncFile();
    setSyncFileName(null);
    setSyncPermissionGranted(false);
  };

  const handleVerifyPermission = async () => {
    if (!(api as any).verifySyncPermission) return;
    const granted = await (api as any).verifySyncPermission();
    setSyncPermissionGranted(granted);
  };

  const handleRunHealthCheck = async () => {
    setCheckingHealth(true);
    try {
      const data = await api.get<any>('/admin/ai/health');
      setHealthStatus(data);
    } catch (e) {
      console.error("Failed to run diagnostics check", e);
      alert("Failed to run AI Gateway diagnostics check.");
    } finally {
      setCheckingHealth(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccessMsg('');
    try {
      await api.put('/settings', settings);
      // Cache the full "HH:mm" reset time in localStorage so timer components can read it instantly
      setResetTime(settings.dailyResetHour ?? 2, settings.dailyResetMinute ?? 0);
      window.dispatchEvent(new CustomEvent('settings-saved'));
      setSuccessMsg('Settings saved successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (e) {
      alert("Failed to save settings. Please check connections.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex items-center space-x-2">
        <Settings className="h-6 w-6 text-blue-400" />
        <h2 className="text-xl font-extrabold text-slate-100">Preferences</h2>
      </div>

      <div className="glass-panel rounded-2xl p-6 space-y-6">
        
        {/* Success Alert */}
        {successMsg && (
          <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs text-emerald-400 font-bold text-center">
            {successMsg}
          </div>
        )}

        {/* Editor Configs */}
        <div className="space-y-4">
          <h3 className="text-sm font-extrabold text-slate-300 uppercase tracking-wider flex items-center space-x-2 border-b border-slate-800 pb-2">
            <Terminal className="h-4 w-4 text-blue-400" />
            <span>Monaco Code Editor</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Editor Theme */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">
                Editor Theme
              </label>
              <select
                value={settings.editorTheme}
                onChange={(e) => setSettings({ ...settings, editorTheme: e.target.value })}
                className="w-full glass-input rounded-lg px-3 py-2 text-xs font-semibold"
              >
                <option value="vs-dark" className="bg-slate-900">Dark VS</option>
                <option value="light" className="bg-slate-900">Light VS</option>
                <option value="hc-black" className="bg-slate-900">High Contrast Black</option>
              </select>
            </div>

            {/* Font Size */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">
                Font Size (px)
              </label>
              <select
                value={settings.fontSize}
                onChange={(e) => setSettings({ ...settings, fontSize: Number(e.target.value) })}
                className="w-full glass-input rounded-lg px-3 py-2 text-xs font-semibold"
              >
                {[12, 14, 16, 18, 20].map(sz => (
                  <option key={sz} value={sz} className="bg-slate-900">{sz}px</option>
                ))}
              </select>
            </div>

            {/* Tab Size */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">
                Tab Indentation Size
              </label>
              <select
                value={settings.tabSize}
                onChange={(e) => setSettings({ ...settings, tabSize: Number(e.target.value) })}
                className="w-full glass-input rounded-lg px-3 py-2 text-xs font-semibold"
              >
                {[2, 4, 8].map(sz => (
                  <option key={sz} value={sz} className="bg-slate-900">{sz} Spaces</option>
                ))}
              </select>
            </div>

            {/* Autosave Intervals */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">
                Notes Autosave Interval
              </label>
              <select
                value={settings.autosaveInterval}
                onChange={(e) => setSettings({ ...settings, autosaveInterval: Number(e.target.value) })}
                className="w-full glass-input rounded-lg px-3 py-2 text-xs font-semibold"
              >
                <option value="10" className="bg-slate-900">10 Seconds</option>
                <option value="30" className="bg-slate-900">30 Seconds</option>
                <option value="60" className="bg-slate-900">60 Seconds</option>
              </select>
            </div>
          </div>
        </div>

        {/* Accessibility & Modes */}
        <div className="space-y-4 pt-2">
          <h3 className="text-sm font-extrabold text-slate-300 uppercase tracking-wider flex items-center space-x-2 border-b border-slate-800 pb-2">
            <Monitor className="h-4 w-4 text-emerald-400" />
            <span>Application Interface</span>
          </h3>

          <div className="space-y-3">
            {/* Dark Mode */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-200 block">Dark Mode Force</span>
                <span className="text-[10px] text-slate-500">Apply a curated dark theme across the workspace.</span>
              </div>
              <input
                type="checkbox"
                checked={settings.darkMode}
                onChange={(e) => setSettings({ ...settings, darkMode: e.target.checked })}
                className="h-4 w-4 accent-primary rounded bg-slate-900 border-slate-850 cursor-pointer"
              />
            </div>

            {/* Shortcuts */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-200 block">Keyboard Shortcuts</span>
                <span className="text-[10px] text-slate-500">Enable hotkeys (e.g. Ctrl + Enter to run code).</span>
              </div>
              <input
                type="checkbox"
                checked={settings.keyboardShortcutsEnabled}
                onChange={(e) => setSettings({ ...settings, keyboardShortcutsEnabled: e.target.checked })}
                className="h-4 w-4 accent-primary rounded bg-slate-900 border-slate-850 cursor-pointer"
              />
            </div>

            {/* Daily Goal */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-200 block">Daily Goal Target</span>
                <span className="text-[10px] text-slate-500">Minimum solved problems per day to keep/increment your streak.</span>
              </div>
              <select
                value={settings.dailyGoal || 3}
                onChange={(e) => setSettings({ ...settings, dailyGoal: Number(e.target.value) })}
                className="glass-input rounded-lg px-3 py-1.5 text-xs font-semibold w-28 bg-slate-900 border border-slate-800"
              >
                {[1, 2, 3, 4, 5, 8, 10].map(val => (
                  <option key={val} value={val} className="bg-slate-900">{val} {val === 1 ? 'Problem' : 'Problems'}</option>
                ))}
              </select>
            </div>

            {/* Daily Reset Time */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-200 block">Daily Progress Reset Time</span>
                <span className="text-[10px] text-slate-500">Time each night when the revision tab and daily tasks reset for the new day.</span>
              </div>
              <input
                type="time"
                value={`${String(settings.dailyResetHour ?? 2).padStart(2, '0')}:${String(settings.dailyResetMinute ?? 0).padStart(2, '0')}`}
                onChange={(e) => {
                  const [h, m] = (e.target.value || '02:00').split(':').map(Number);
                  setSettings({ ...settings, dailyResetHour: h, dailyResetMinute: m });
                  setResetTime(h, m);
                  window.dispatchEvent(new CustomEvent('reset-time-changed'));
                }}
                className="glass-input rounded-lg px-3 py-1.5 text-xs font-semibold w-32 bg-slate-900 border border-slate-800 text-slate-200 [color-scheme:dark] cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Backup & Sync */}
        <div className="space-y-4 pt-2">
          <h3 className="text-sm font-extrabold text-slate-300 uppercase tracking-wider flex items-center space-x-2 border-b border-slate-800 pb-2">
            <Monitor className="h-4 w-4 text-emerald-400" />
            <span>Backup & Sync (Multi-Device)</span>
          </h3>
          <p className="text-[10px] text-slate-500 leading-relaxed">
            Since your progress is stored entirely in this browser, you can export your data as a JSON backup file and import it on another device to sync your problems solved, daily streaks, and stats.
          </p>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleExportData}
              className="px-4 py-2 rounded-xl bg-slate-900/60 hover:bg-slate-850 border border-slate-800 hover:border-blue-500/40 text-xs font-semibold text-slate-300 hover:text-slate-100 transition-smooth flex items-center space-x-2"
            >
              <span>Export Progress JSON</span>
            </button>

            <label className="px-4 py-2 rounded-xl bg-slate-900/60 hover:bg-slate-850 border border-slate-800 hover:border-emerald-500/40 text-xs font-semibold text-slate-300 hover:text-slate-100 transition-smooth flex items-center space-x-2 cursor-pointer">
              <span>Import Progress JSON</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportData}
                className="hidden"
              />
            </label>
          </div>

          <div className="border-t border-slate-800/60 pt-4 mt-2 space-y-3">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Real-time Local Auto-Sync</span>
            <p className="text-[10px] text-slate-500 leading-relaxed">
              Link a specific file on your computer hard drive. Whenever you make any changes (completing problems, adding notes, setting bookmarks), the app will silently auto-save your database to this file in the background. If your browser cache gets wiped, simply re-link your backup file to restore all progress!
            </p>

            {syncFileName ? (
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-slate-200">Linked File:</span>
                    <span className="text-xs font-mono font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 border border-blue-500/20 rounded-md">{syncFileName}</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className={`w-2 h-2 rounded-full ${syncPermissionGranted ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500 animate-pulse'}`} />
                    <span className="text-[10px] text-slate-400 font-semibold">
                      {syncPermissionGranted ? 'Auto-Sync Active (Write Permission Granted)' : 'Permission Required (Write Permission Revoked)'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {!syncPermissionGranted && (
                    <button
                      onClick={handleVerifyPermission}
                      className="px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 hover:border-amber-500 text-[10px] font-extrabold text-amber-400 transition-smooth"
                    >
                      Authorize Write
                    </button>
                  )}
                  <button
                    onClick={handleUnlinkSyncFile}
                    className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30 hover:border-red-500 text-[10px] font-extrabold text-red-400 transition-smooth"
                  >
                    Unlink File
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => handleLinkSyncFile('create')}
                  className="px-4 py-2 rounded-xl bg-slate-900/60 hover:bg-slate-850 border border-slate-800 hover:border-blue-500/45 text-xs font-bold text-blue-400 transition-smooth"
                >
                  Create & Link Sync File
                </button>
                <button
                  onClick={() => handleLinkSyncFile('open')}
                  className="px-4 py-2 rounded-xl bg-slate-900/60 hover:bg-slate-850 border border-slate-800 hover:border-emerald-500/45 text-xs font-bold text-emerald-400 transition-smooth"
                >
                  Link Existing Sync File
                </button>
              </div>
            )}
          </div>
        </div>

        {/* LeetCode Sync Integration */}
        <div className="space-y-4 pt-4 border-t border-slate-800/60">
          <h3 className="text-sm font-extrabold text-slate-300 uppercase tracking-wider flex items-center space-x-2 border-b border-slate-800 pb-2">
            <RefreshCw className="h-4 w-4 text-amber-500" />
            <span>LeetCode Sync Integration</span>
          </h3>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
            {/* Status Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Sync Status</span>
                {leetcodeStatus?.connected ? (
                  <div className="flex items-center space-x-1.5 mt-1 text-emerald-400 font-extrabold text-xs">
                    <ShieldCheck className="h-4 w-4" />
                    <span>Connected</span>
                  </div>
                ) : (
                  <span className="text-xs font-bold text-slate-400 mt-1 block">Not Synced</span>
                )}
              </div>

              {leetcodeStatus?.connected && (
                <>
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Total LeetCode Solved</span>
                    <span className="text-xs font-bold text-slate-200 mt-1 block">{leetcodeStatus.totalSolved} Problems</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Matched PatternForge Problems</span>
                    <span className="text-xs font-bold text-slate-200 mt-1 block">{leetcodeStatus.matchedProblems} Problems</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Last Synced</span>
                    <span className="text-xs font-bold text-slate-200 mt-1 block">
                      {new Date(leetcodeStatus.lastSyncedAt).toLocaleString()}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Token Section */}
            <div className="border-t border-slate-800/80 pt-3 space-y-3">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">PatternForge LeetCode Sync Token</span>
              <p className="text-[10px] text-slate-500 leading-relaxed">
                Use this token to authorize the browser userscript to sync your solved LeetCode problems list. Never share this token.
              </p>

              {tokenStatus?.exists ? (
                <div className="flex items-center space-x-2 text-[10px] text-emerald-400 font-bold bg-emerald-500/5 px-3 py-1.5 border border-emerald-500/10 rounded-lg w-max">
                  <span>✓ Sync Token Active (Created: {new Date(tokenStatus.createdAt).toLocaleDateString()})</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2 text-[10px] text-slate-500 font-bold bg-slate-850 px-3 py-1.5 border border-slate-800 rounded-lg w-max">
                  <span>No active Sync Token found. Generate one below to start syncing.</span>
                </div>
              )}

              {generatedToken && (
                <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20 space-y-2">
                  <span className="text-[10px] font-bold text-amber-500 block">⚠️ Save this token now! It will not be shown again:</span>
                  <div className="flex items-center space-x-2 bg-slate-950 p-2 rounded border border-slate-850">
                    <span className="text-[11px] font-mono font-bold text-slate-200 break-all select-all flex-1">{generatedToken}</span>
                    <button
                      onClick={handleCopyToken}
                      className="p-1 text-slate-400 hover:text-slate-100 transition-smooth"
                      title="Copy token"
                    >
                      {copySuccess ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  onClick={handleGenerateToken}
                  className="px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/30 hover:border-blue-500 text-[10px] font-extrabold text-blue-400 transition-smooth"
                >
                  {tokenStatus?.exists ? 'Regenerate Token' : 'Generate Sync Token'}
                </button>
                {tokenStatus?.exists && (
                  <button
                    onClick={handleRevokeToken}
                    className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30 hover:border-red-500 text-[10px] font-extrabold text-red-400 transition-smooth"
                  >
                    Revoke Token
                  </button>
                )}
              </div>
            </div>

            {/* Setup Instructions */}
            <div className="border-t border-slate-800/80 pt-3 space-y-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Instructions: How to Setup Sync</span>
              <ol className="list-decimal pl-4 text-[10px] text-slate-500 space-y-1.5 leading-relaxed">
                <li>Install the <a href="https://www.tampermonkey.net/" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">Tampermonkey</a> browser extension.</li>
                <li>Create a new script in Tampermonkey and paste the code from <code className="text-slate-400 bg-slate-950 px-1 py-0.5 rounded border border-slate-850">tools/patternforge-leetcode-sync.user.js</code>.</li>
                <li>Click <strong>Generate Sync Token</strong> above and copy the generated token.</li>
                <li>Go to LeetCode and click the <strong>⚙ (Gear)</strong> icon on the bottom-right PatternForge sync widget.</li>
                <li>Paste the Sync Token and your PatternForge Backend URL (e.g. <code className="text-slate-400 bg-slate-950 px-1 py-0.5 rounded">http://localhost:8081</code>).</li>
                <li>Log in to LeetCode, then click the floating orange <strong>PF ↻</strong> button in the bottom-right corner to synchronize!</li>
              </ol>
            </div>
          </div>
        </div>

        {/* AI Provider Health Check */}
        <div className="space-y-4 pt-4 border-t border-slate-800/60">
          <h3 className="text-sm font-extrabold text-slate-300 uppercase tracking-wider flex items-center space-x-2 border-b border-slate-800 pb-2">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>AI Gateway Provider Diagnostics</span>
          </h3>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Diagnostic Status</span>
                {healthStatus ? (
                  <div className="flex items-center space-x-1.5 mt-1">
                    <span className={`w-2 h-2 rounded-full ${healthStatus.healthyCount === healthStatus.totalCount ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500 animate-pulse'}`} />
                    <span className="text-xs font-bold text-slate-200">
                      {healthStatus.overallStatus}
                    </span>
                  </div>
                ) : (
                  <span className="text-xs font-bold text-slate-400 mt-1 block">Not run yet</span>
                )}
              </div>

              <button
                onClick={handleRunHealthCheck}
                disabled={checkingHealth}
                className="px-4 py-2 rounded-xl bg-slate-900/60 hover:bg-slate-850 border border-slate-800 hover:border-blue-500/40 text-xs font-semibold text-slate-300 hover:text-slate-100 transition-smooth flex items-center space-x-2 disabled:opacity-50"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${checkingHealth ? 'animate-spin text-blue-400' : ''}`} />
                <span>{checkingHealth ? 'Running Diagnostic...' : 'Run Gateway Diagnostics'}</span>
              </button>
            </div>

            {healthStatus?.providers && (
              <div className="overflow-x-auto rounded-lg border border-slate-850 bg-slate-950/60">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-850 bg-slate-950/80 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                      <th className="px-3 py-2">Provider</th>
                      <th className="px-3 py-2">Status</th>
                      <th className="px-3 py-2">Model</th>
                      <th className="px-3 py-2">Latency</th>
                      <th className="px-3 py-2">HTTP</th>
                      <th className="px-3 py-2">Output/Error Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850/60">
                    {healthStatus.providers.map((p: any) => (
                      <tr key={p.providerName} className="hover:bg-slate-900/40 text-xs">
                        <td className="px-3 py-2.5 font-bold text-slate-200">{p.providerName}</td>
                        <td className="px-3 py-2.5">
                          {p.healthy ? (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-extrabold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                              Healthy
                            </span>
                          ) : !p.configured ? (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-extrabold bg-slate-800 text-slate-400 border border-slate-700/50">
                              Unconfigured
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-extrabold bg-red-500/10 text-red-400 border border-red-500/25 animate-pulse">
                              Unhealthy
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2.5 font-mono text-[10px] text-slate-400">{p.configuredModel}</td>
                        <td className="px-3 py-2.5 text-slate-300 font-semibold">{p.healthy ? `${(p.latencyMs / 1000).toFixed(2)}s` : 'N/A'}</td>
                        <td className="px-3 py-2.5 font-bold text-slate-400">{p.httpStatus !== -1 ? p.httpStatus : 'N/A'}</td>
                        <td className="px-3 py-2.5 font-mono text-[10px] text-slate-500 truncate max-w-[200px]" title={p.responseBody}>
                          {p.responseBody}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-hover shadow-glow-primary text-xs font-semibold text-white flex items-center space-x-2 transition-smooth disabled:opacity-50"
          >
            {saving ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

export default SettingsView;
