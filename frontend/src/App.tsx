import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Dashboard from './views/Dashboard';
import Explorer from './views/Explorer';
import ProblemView from './views/ProblemView';
import Settings from './views/Settings';
import AuthScreen from './views/AuthScreen';
import PortalSelection from './views/PortalSelection';
import StlGuide from './views/stl/StlGuide';
import SqlGuide from './views/sql/SqlGuide';
import OsGuide from './views/os/OsGuide';

const MainApp: React.FC = () => {
  const { user, loading } = useAuth();
  const [activePortal, setActivePortal] = useState<'selection' | 'dsa' | 'stl' | 'sql' | 'os'>(() => {
    const saved = localStorage.getItem('activePortal');
    return (saved === 'dsa' || saved === 'stl' || saved === 'sql' || saved === 'os') ? saved : 'selection';
  });
  const [activeTab, setActiveTab] = useState<'dashboard' | 'explorer' | 'problem' | 'settings'>('dashboard');
  const [activeProblemId, setActiveProblemId] = useState<string | null>(null);

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

  if (activePortal === 'selection') {
    return (
      <PortalSelection
        onSelectPortal={(portal) => {
          localStorage.setItem('activePortal', portal);
          setActivePortal(portal);
        }}
      />
    );
  }

  if (activePortal === 'stl') {
    return (
      <StlGuide
        onBackToPortal={() => {
          localStorage.removeItem('activePortal');
          setActivePortal('selection');
        }}
      />
    );
  }

  if (activePortal === 'sql') {
    return (
      <SqlGuide
        onBackToPortal={() => {
          localStorage.removeItem('activePortal');
          setActivePortal('selection');
        }}
      />
    );
  }

  if (activePortal === 'os') {
    return (
      <OsGuide
        onBackToPortal={() => {
          localStorage.removeItem('activePortal');
          setActivePortal('selection');
        }}
      />
    );
  }

  const navigateToProblem = (id: string) => {
    setActiveProblemId(id);
    setActiveTab('problem');
  };

  return (
    <div className="flex flex-col min-h-screen bg-transparent">
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onSwitchPortal={() => {
          localStorage.removeItem('activePortal');
          setActivePortal('selection');
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
