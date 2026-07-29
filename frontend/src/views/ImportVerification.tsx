import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { ShieldCheck, Upload, AlertCircle, FileText, CheckCircle, Database } from 'lucide-react';

interface ImportResultDto {
  totalFound: number;
  successfullyImported: number;
  duplicatesCount: number;
  failedImports: number;
  finalDbCount: number;
  status: string;
  duplicatesLog: string[];
  failedLog: string[];
}

const ImportVerificationView: React.FC = () => {
  const [status, setStatus] = useState<ImportResultDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const fetchStatus = async () => {
    try {
      const data = await api.get<ImportResultDto>('/problems/import-status');
      setStatus(data);
    } catch (e) {
      console.error("Failed to load verification status", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      // Direct raw fetch because API service expects JSON content-type default
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8081'}/api/problems/import`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Import upload failed');
      }

      const data = await response.json();
      setStatus(data);
    } catch (e) {
      alert("Failed to upload and import PDF. Check server logs.");
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const isVerified = status && status.finalDbCount >= 789;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold flex items-center gap-3">
          <ShieldCheck className="text-primary h-8 w-8" />
          Import Verification
        </h1>
        <p className="text-slate-400 mt-2">
          Verify data completeness and import progress directly from Striver's 841 DSA Sheet PDF source of truth.
        </p>
      </div>

      {status && (
        <div className={`p-5 rounded-xl border flex items-start gap-4 transition-all duration-300 ${
          isVerified 
            ? 'bg-emerald-950/30 border-emerald-500/20 text-emerald-100' 
            : 'bg-amber-950/20 border-amber-500/25 text-amber-100'
        }`}>
          {isVerified ? (
            <CheckCircle className="text-emerald-400 h-6 w-6 mt-1 flex-shrink-0" />
          ) : (
            <AlertCircle className="text-amber-400 h-6 w-6 mt-1 flex-shrink-0" />
          )}
          <div>
            <h3 className="font-bold text-lg">
              {isVerified ? "✅ Import Verified Successfully" : "⚠️ Database Verification Incomplete"}
            </h3>
            <p className="text-sm opacity-90 mt-1">
              {isVerified 
                ? `100% data completeness reached! All 789 unique problems are indexed in the repository.`
                : `Currently have ${status.finalDbCount} / 789 unique problems. Please upload the master PDF to import missing problems.`
              }
            </p>
          </div>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="glass-panel p-5 rounded-xl flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Expected in PDF</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-slate-100">841</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Master Problems Count</p>
        </div>

        <div className="glass-panel p-5 rounded-xl flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Successfully Imported</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-emerald-400">{status?.successfullyImported || 0}</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">From PDF parsing</p>
        </div>

        <div className="glass-panel p-5 rounded-xl flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Duplicates Logged</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-amber-400">{status?.duplicatesCount || 0}</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Duplicate LeetCode IDs logged</p>
        </div>

        <div className="glass-panel p-5 rounded-xl flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Failed Imports</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-rose-500">{status?.failedImports || 0}</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Formatting skips</p>
        </div>

        <div className="glass-panel p-5 rounded-xl flex flex-col justify-between border-primary/20">
          <span className="text-xs font-semibold text-primary uppercase tracking-wider flex items-center gap-1">
            <Database className="h-3 w-3" /> Database Count
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-primary">{status?.finalDbCount || 0}</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Active problems count</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Container */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-panel p-6 rounded-xl space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Upload className="text-primary h-5 w-5" />
              Upload Master PDF
            </h2>
            <p className="text-sm text-slate-400">
              Drag and drop your `Striver_A2Z_Master_DSA_Database.pdf` to parse and build the 841 problem registry.
            </p>

            <div 
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center transition-all ${
                dragActive ? 'border-primary bg-primary/5' : 'border-slate-800 hover:border-slate-700 bg-slate-900/10'
              }`}
            >
              <FileText className={`h-12 w-12 mb-3 transition-colors ${dragActive ? 'text-primary' : 'text-slate-500'}`} />
              {uploading ? (
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                  <p className="text-sm font-semibold text-slate-300">Parsing PDF & seeding database...</p>
                  <p className="text-xs text-slate-400 mt-1">This might take a few seconds...</p>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-sm font-semibold text-slate-200">Drag & drop your PDF file here, or click to browse</p>
                  <p className="text-xs text-slate-500 mt-1">Support files: .pdf formats up to 10MB</p>
                  <input 
                    type="file" 
                    accept=".pdf" 
                    onChange={(e) => e.target.files && handleFileUpload(e.target.files[0])}
                    className="mt-4 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-lg cursor-pointer"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Info Column */}
        <div className="space-y-4">
          <div className="glass-panel p-6 rounded-xl space-y-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <FileText className="text-primary h-5 w-5" />
              File Requirements
            </h2>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>Matches 841 LeetCode problems structured topic-wise.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>PDF table columns: Master #, Topic #, LeetCode #, Problem Name.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>The importer parses multiple columns, handles wrapped lines, and logs duplicate problems automatically.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Duplicates Log Console */}
      {status && status.duplicatesLog && status.duplicatesLog.length > 0 && (
        <div className="glass-panel p-6 rounded-xl space-y-3">
          <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
            <AlertCircle className="text-amber-500 h-5 w-5" />
            Duplicate LeetCode IDs Log ({status.duplicatesCount})
          </h3>
          <p className="text-xs text-slate-400">
            Below are duplicate LeetCode IDs detected in different chapters. The database preserves their unique master sequence mapping.
          </p>
          <div className="bg-slate-950 p-4 rounded-lg border border-slate-900 font-mono text-xs max-h-48 overflow-y-auto space-y-1">
            {status.duplicatesLog.map((log, idx) => (
              <div key={idx} className="text-amber-400/90">
                [DUPLICATE] {log}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImportVerificationView;
