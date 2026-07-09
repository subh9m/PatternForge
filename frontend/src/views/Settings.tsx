import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Settings, Save, Monitor, Terminal } from 'lucide-react';

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

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await api.get<SettingsDto>('/settings');
        setSettings(data);
        // Seed localStorage with "HH:mm" so timer components always have the latest reset time
        const h = String(data.dailyResetHour ?? 2).padStart(2, '0');
        const m = String(data.dailyResetMinute ?? 0).padStart(2, '0');
        localStorage.setItem('patternforge_reset_time', `${h}:${m}`);
      } catch (e) {
        console.error("Failed to load settings", e);
      } finally {
        setLoading(false);
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
    loadSettings();
    checkSyncFile();
  }, []);

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

  const handleSave = async () => {
    setSaving(true);
    setSuccessMsg('');
    try {
      await api.put('/settings', settings);
      // Cache the full "HH:mm" reset time in localStorage so timer components can read it instantly
      const h = String(settings.dailyResetHour ?? 2).padStart(2, '0');
      const m = String(settings.dailyResetMinute ?? 0).padStart(2, '0');
      localStorage.setItem('patternforge_reset_time', `${h}:${m}`);
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
              <div className="flex items-center gap-2">
                <select
                  value={settings.dailyResetHour ?? 2}
                  onChange={(e) => setSettings({ ...settings, dailyResetHour: Number(e.target.value), dailyResetMinute: 0 })}
                  className="glass-input rounded-lg px-3 py-1.5 text-xs font-semibold w-28 bg-slate-900 border border-slate-800"
                >
                  {Array.from({ length: 24 }, (_, h) => {
                    const display = h === 0 ? '12:00 AM' : h < 12 ? `${h}:00 AM` : h === 12 ? '12:00 PM' : `${h - 12}:00 PM`;
                    return (
                      <option key={h} value={h} className="bg-slate-900">{display}</option>
                    );
                  })}
                </select>
                <input
                  type="time"
                  value={`${String(settings.dailyResetHour ?? 2).padStart(2, '0')}:${String(settings.dailyResetMinute ?? 0).padStart(2, '0')}`}
                  onChange={(e) => {
                    const [h, m] = (e.target.value || '02:00').split(':').map(Number);
                    setSettings({ ...settings, dailyResetHour: h, dailyResetMinute: m });
                  }}
                  className="glass-input rounded-lg px-3 py-1.5 text-xs font-semibold w-28 bg-slate-900 border border-slate-800 text-slate-200 [color-scheme:dark] cursor-pointer"
                  title="Enter exact time with minutes"
                />
              </div>
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
