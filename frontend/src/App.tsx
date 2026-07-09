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

const MainApp: React.FC = () => {
  const { user, logout, loading } = useAuth();
  const [activePortal, setActivePortal] = useState<'selection' | 'master_dashboard' | 'dsa' | 'stl' | 'sql' | 'os' | 'git' | 'aiml' | 'cn' | 'spring' | 'react' | 'projects'>(() => {
    const saved = localStorage.getItem('activePortal');
    return (saved === 'dsa' || saved === 'stl' || saved === 'sql' || saved === 'os' || saved === 'git' || saved === 'aiml' || saved === 'cn' || saved === 'spring' || saved === 'react' || saved === 'projects' || saved === 'selection' || saved === 'master_dashboard') ? saved : 'master_dashboard';
  });
  const [activeTab, setActiveTab] = useState<'dashboard' | 'explorer' | 'problem' | 'settings' | 'revision'>(() => {
    const saved = localStorage.getItem('activeTab');
    return (saved === 'dashboard' || saved === 'explorer' || saved === 'problem' || saved === 'settings' || saved === 'revision') ? saved : 'dashboard';
  });
  const [activeProblemId, setActiveProblemId] = useState<string | null>(() => {
    return localStorage.getItem('activeProblemId');
  });

  const prevUserRef = React.useRef<any>(null);

  // Sync tab & problemId to localStorage
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

  // Enforce Master Dashboard default landing page on logout/login
  React.useEffect(() => {
    if (!user) {
      localStorage.setItem('activePortal', 'master_dashboard');
      setActivePortal('master_dashboard');
    } else if (user && sessionStorage.getItem('pf_login_redirect') === 'true') {
      // User just logged in (fresh login)
      sessionStorage.removeItem('pf_login_redirect');
      localStorage.setItem('activePortal', 'master_dashboard');
      setActivePortal('master_dashboard');
    }
    prevUserRef.current = user;
  }, [user]);

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

  const navigateToProblem = (id: string) => {
    setActiveProblemId(id);
    setActiveTab('problem');
  };

  return (
    <div className="flex flex-col min-h-screen bg-transparent">
      {renderFocusTimer()}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onSwitchPortal={() => {
          localStorage.setItem('activePortal', 'selection');
          setActivePortal('selection');
        }}
        onGoToDashboard={() => {
          localStorage.setItem('activePortal', 'master_dashboard');
          setActivePortal('master_dashboard');
        }}
      />
      
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <Dashboard navigateToProblem={navigateToProblem} setActiveTab={setActiveTab} />
        )}
        {activeTab === 'explorer' && (
          <Explorer navigateToProblem={navigateToProblem} />
        )}
        {activeTab === 'problem' && activeProblemId && (
          <ProblemView problemId={activeProblemId} onBack={() => setActiveTab('explorer')} />
        )}
        {activeTab === 'settings' && (
          <Settings />
        )}
        {activeTab === 'revision' && (
          <RevisionView navigateToProblem={navigateToProblem} />
        )}
      </main>
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
