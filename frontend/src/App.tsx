import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Dashboard from './views/Dashboard';
import Explorer from './views/Explorer';
import ProblemView from './views/ProblemView';
import Settings from './views/Settings';
import AuthScreen from './views/AuthScreen';
import PortalSelection from './views/PortalSelection';
import MasterDashboard from './views/MasterDashboard';
import FocusTimerOverlay from './components/FocusTimerOverlay';
import StlGuide from './views/stl/StlGuide';
import SqlGuide from './views/sql/SqlGuide';
import OsGuide from './views/os/OsGuide';
import GitGuide from './views/git/GitGuide';
import AimlGuide from './views/aiml/AimlGuide';
import CnGuide from './views/cn/CnGuide';
import SpringGuide from './views/spring/SpringGuide';
import ReactGuide from './views/react/ReactGuide';
import ProjectsGuide from './views/projects/ProjectsGuide';
import RevisionView from './views/RevisionView';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from './services/api';
import { seedResetTimeFromSettings, useDailyResetScheduler } from './hooks/useDailyReset';
import AiGenerationFullscreenLoader from './components/AiGenerationFullscreenLoader';

const MainApp: React.FC = () => {
  const { user, logout, loading } = useAuth();
  
  const [activePortal, setActivePortal] = useState<'selection' | 'master_dashboard' | 'dsa' | 'stl' | 'sql' | 'os' | 'git' | 'aiml' | 'cn' | 'spring' | 'react' | 'projects'>(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    if (tabParam === 'dashboard' || tabParam === 'explorer' || tabParam === 'problem' || tabParam === 'settings' || tabParam === 'revision') {
      return 'dsa';
    }
    const saved = localStorage.getItem('activePortal');
    return (saved === 'dsa' || saved === 'stl' || saved === 'sql' || saved === 'os' || saved === 'git' || saved === 'aiml' || saved === 'cn' || saved === 'spring' || saved === 'react' || saved === 'projects' || saved === 'selection' || saved === 'master_dashboard') ? saved : 'master_dashboard';
  });

  const [activeTab, setActiveTab] = useState<'dashboard' | 'explorer' | 'problem' | 'settings' | 'revision'>(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    if (tabParam === 'dashboard' || tabParam === 'explorer' || tabParam === 'problem' || tabParam === 'settings' || tabParam === 'revision') {
      return tabParam;
    }
    const saved = localStorage.getItem('activeTab');
    return (saved === 'dashboard' || saved === 'explorer' || saved === 'problem' || saved === 'settings' || saved === 'revision') ? saved : 'dashboard';
  });

  const [activeProblemId, setActiveProblemId] = useState<string | null>(() => {
    const params = new URLSearchParams(window.location.search);
    const probParam = params.get('problemId');
    if (probParam) return probParam;
    return localStorage.getItem('activeProblemId');
  });

  const [generatingProblemId, setGeneratingProblemId] = useState<string | null>(null);
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);
  const [snackbarProblemId, setSnackbarProblemId] = useState<string | null>(null);
  const [snackbarType, setSnackbarType] = useState<'success' | 'error'>('success');

  const handleJobCompleted = (job: any) => {
    setSnackbarMessage(`AI details generated successfully. "${job.problemName}" is ready.`);
    setSnackbarProblemId(job.problemId);
    setSnackbarType('success');
  };

  const handleJobFailed = (job: any) => {
    setSnackbarMessage(`AI details generation failed for "${job.problemName}". Local offline stubs applied.`);
    setSnackbarProblemId(job.problemId);
    setSnackbarType('error');
  };

  const prevUserRef = React.useRef<any>(null);

  // Sync portal, tab & problemId to localStorage
  React.useEffect(() => {
    localStorage.setItem('activePortal', activePortal);
  }, [activePortal]);

  React.useEffect(() => {
    localStorage.setItem('activeTab', activeTab);
  }, [activeTab]);

  React.useEffect(() => {
    if (activeProblemId) {
      localStorage.setItem('activeProblemId', activeProblemId);
    } else {
      localStorage.removeItem('activeProblemId');
    }
  }, [activeProblemId]);

  // Navigate function that synchronizes with browser history
  const navigateToTab = (tab: 'dashboard' | 'explorer' | 'problem' | 'settings' | 'revision', problemId: string | null = null) => {
    const params = new URLSearchParams(window.location.search);
    params.set('tab', tab);
    if (problemId) {
      params.set('problemId', problemId);
    } else {
      params.delete('problemId');
    }
    const newSearch = params.toString();
    const newUrl = window.location.pathname + (newSearch ? '?' + newSearch : '');
    window.history.pushState(null, '', newUrl);
    
    setActiveTab(tab);
    setActiveProblemId(problemId);
  };

  // Sync initial render URL
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (!params.has('tab')) {
      params.set('tab', activeTab);
      if (activeTab === 'problem' && activeProblemId) {
        params.set('problemId', activeProblemId);
      }
      window.history.replaceState(null, '', '?' + params.toString());
    }
  }, []);

  // Handle popstate event (browser Back/Forward buttons)
  React.useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      const probParam = params.get('problemId');
      
      if (tabParam === 'dashboard' || tabParam === 'explorer' || tabParam === 'problem' || tabParam === 'settings' || tabParam === 'revision') {
        setActiveTab(tabParam);
        if (tabParam === 'problem' && probParam) {
          setActiveProblemId(probParam);
        } else {
          setActiveProblemId(null);
        }
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  React.useEffect(() => {
    const handleSwitchTab = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        navigateToTab(customEvent.detail);
      }
    };
    window.addEventListener('switch-tab', handleSwitchTab);
    return () => window.removeEventListener('switch-tab', handleSwitchTab);
  }, []);

  // Enforce Master Dashboard default landing page on logout/login
  React.useEffect(() => {
    if (loading) return; // Wait for initial token check to finish
    
    if (!user) {
      localStorage.setItem('activePortal', 'master_dashboard');
      setActivePortal('master_dashboard');
    } else if (user && sessionStorage.getItem('pf_login_redirect') === 'true') {
      // User just logged in (fresh login)
      sessionStorage.removeItem('pf_login_redirect');
      localStorage.setItem('activePortal', 'master_dashboard');
      setActivePortal('master_dashboard');
      seedResetTimeFromSettings();
    }
    if (user) {
      seedResetTimeFromSettings();
    }
    prevUserRef.current = user;
  }, [user, loading]);

  // Single global daily-reset scheduler — fires instant UI refresh site-wide
  useDailyResetScheduler(!!user && !loading);

  // Focus mode session state
  const [focusSession, setFocusSession] = useState<{ 
    module: 'dsa' | 'stl' | 'sql' | 'os' | 'git' | 'aiml' | 'cn' | 'spring' | 'react' | 'projects'; 
    duration: number;
    remainingSeconds?: number;
  } | null>(null);

  const renderFocusTimer = () => {
    if (focusSession && focusSession.module === activePortal) {
      return (
        <FocusTimerOverlay
          module={focusSession.module}
          initialDurationMins={focusSession.duration}
          initialRemainingSecs={focusSession.remainingSeconds}
          onExit={() => {
            setFocusSession(null);
            localStorage.removeItem('activePortal');
            setActivePortal('master_dashboard');
          }}
        />
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-slate-400 text-sm animate-pulse font-sans">Connecting to PatternForge...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  if (activePortal === 'master_dashboard') {
    return (
      <MasterDashboard
        onEnterFocusMode={(portal, duration, remainingSeconds) => {
          localStorage.setItem('activePortal', portal);
          setFocusSession({ module: portal, duration, remainingSeconds });
          setActivePortal(portal);
        }}
        onGoToModules={() => {
          localStorage.setItem('activePortal', 'selection');
          setActivePortal('selection');
        }}
        onLogout={logout}
      />
    );
  }

  if (activePortal === 'selection') {
    return (
      <PortalSelection
        onSelectPortal={(portal) => {
          localStorage.setItem('activePortal', portal);
          setActivePortal(portal);
        }}
        onBackToDashboard={() => {
          localStorage.setItem('activePortal', 'master_dashboard');
          setActivePortal('master_dashboard');
        }}
      />
    );
  }

  if (activePortal === 'stl') {
    return (
      <>
        {renderFocusTimer()}
        <StlGuide
          onBackToPortal={() => {
            localStorage.removeItem('activePortal');
            setActivePortal('selection');
          }}
        />
      </>
    );
  }

  if (activePortal === 'sql') {
    return (
      <>
        {renderFocusTimer()}
        <SqlGuide
          onBackToPortal={() => {
            localStorage.removeItem('activePortal');
            setActivePortal('selection');
          }}
        />
      </>
    );
  }

  if (activePortal === 'os') {
    return (
      <>
        {renderFocusTimer()}
        <OsGuide
          onBackToPortal={() => {
            localStorage.removeItem('activePortal');
            setActivePortal('selection');
          }}
        />
      </>
    );
  }

  if (activePortal === 'git') {
    return (
      <>
        {renderFocusTimer()}
        <GitGuide
          onBackToPortal={() => {
            localStorage.removeItem('activePortal');
            setActivePortal('selection');
          }}
        />
      </>
    );
  }

  if (activePortal === 'aiml') {
    return (
      <>
        {renderFocusTimer()}
        <AimlGuide
          onBackToPortal={() => {
            localStorage.removeItem('activePortal');
            setActivePortal('selection');
          }}
        />
      </>
    );
  }

  if (activePortal === 'cn') {
    return (
      <>
        {renderFocusTimer()}
        <CnGuide
          onBackToPortal={() => {
            localStorage.removeItem('activePortal');
            setActivePortal('selection');
          }}
        />
      </>
    );
  }

  if (activePortal === 'spring') {
    return (
      <>
        {renderFocusTimer()}
        <SpringGuide
          onBackToPortal={() => {
            localStorage.removeItem('activePortal');
            setActivePortal('selection');
          }}
        />
      </>
    );
  }

  if (activePortal === 'react') {
    return (
      <>
        {renderFocusTimer()}
        <ReactGuide
          onBackToPortal={() => {
            localStorage.removeItem('activePortal');
            setActivePortal('selection');
          }}
        />
      </>
    );
  }

  if (activePortal === 'projects') {
    return (
      <>
        {renderFocusTimer()}
        <ProjectsGuide
          onBackToPortal={() => {
            localStorage.removeItem('activePortal');
            setActivePortal('selection');
          }}
        />
      </>
    );
  }

  const navigateToProblem = async (id: string) => {
    try {
      const data = await api.get<{ isAiReady: boolean }>(`/problems/${id}`);
      if (data.isAiReady) {
        navigateToTab('problem', id);
      } else {
        setGeneratingProblemId(id);
      }
    } catch (err) {
      console.error("Failed to check problem readiness", err);
      // Fallback
      navigateToTab('problem', id);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-transparent">
      {renderFocusTimer()}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={(tab) => navigateToTab(tab)} 
        onSwitchPortal={() => {
          localStorage.setItem('activePortal', 'selection');
          setActivePortal('selection');
        }}
        onGoToDashboard={() => {
          localStorage.setItem('activePortal', 'master_dashboard');
          setActivePortal('master_dashboard');
        }}
        onOpenProblem={navigateToProblem}
        onJobCompleted={handleJobCompleted}
        onJobFailed={handleJobFailed}
      />
      
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 relative">
        <AnimatePresence mode="wait">
          {generatingProblemId ? (
            <motion.div
              key="generating"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <AiGenerationFullscreenLoader 
                problemId={generatingProblemId} 
                onSuccess={() => {
                  navigateToTab('problem', generatingProblemId);
                  setGeneratingProblemId(null);
                }}
                onCancel={() => {
                  setGeneratingProblemId(null);
                }}
              />
            </motion.div>
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === 'dashboard' && (
                <Dashboard navigateToProblem={navigateToProblem} setActiveTab={(tab) => navigateToTab(tab)} />
              )}
              {activeTab === 'explorer' && (
                <Explorer navigateToProblem={navigateToProblem} />
              )}
              {activeTab === 'problem' && activeProblemId && (
                <ProblemView problemId={activeProblemId} onBack={() => navigateToTab('explorer')} />
              )}
              {activeTab === 'settings' && (
                <Settings />
              )}
              {activeTab === 'revision' && (
                <RevisionView navigateToProblem={navigateToProblem} />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Global Snackbar Toast Alert */}
      {snackbarMessage && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center space-x-3 bg-slate-900 border ${snackbarType === 'error' ? 'border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.15)]' : 'border-slate-800'} text-slate-100 px-4 py-3 rounded-2xl shadow-2xl animate-slideIn`}>
          {snackbarType === 'error' ? (
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-red-400">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          ) : (
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
          <div className="text-xs font-bold leading-tight">{snackbarMessage}</div>
          <div className="flex items-center space-x-2 pl-3 border-l border-slate-800 shrink-0 select-none">
            <button
              onClick={() => {
                if (snackbarProblemId) {
                  navigateToProblem(snackbarProblemId);
                }
                setSnackbarMessage(null);
                setSnackbarProblemId(null);
              }}
              className={`px-2.5 py-1 ${snackbarType === 'error' ? 'bg-red-600 hover:bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.2)]' : 'bg-emerald-600 hover:bg-emerald-500'} text-white rounded-lg text-[10px] font-black uppercase tracking-wider cursor-pointer transition-colors shadow-sm`}
            >
              Open
            </button>
            <button
              onClick={() => {
                setSnackbarMessage(null);
                setSnackbarProblemId(null);
              }}
              className="px-2 py-1 text-slate-400 hover:text-slate-200 text-[10px] font-extrabold uppercase tracking-wider cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
};

export default App;
