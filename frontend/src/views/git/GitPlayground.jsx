import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, Terminal, ArrowRight, GitBranch, Share2 } from 'lucide-react';

// Help tooltips for Git commands in the playground
const COMMAND_HELP = {
  'git init': 'Initializes a new local repository. Sets up the hidden .git directory and structures.',
  'modify file': 'Simulates writing or changing code in your working directory. Files turn red/orange.',
  'git add <file>': 'Stages changes for index snapshots. Moves files from the Working Directory into the Staging index (turns green).',
  'git commit -m "msg"': 'Generates a commit object in your local history pointing to the staging root tree (generates a node).',
  'git branch <name>': 'Creates a new pointer pointing to your active HEAD commit hash without switching contexts.',
  'git switch <branch>': 'Switches HEAD pointer to target branch, replacing desktop files with target commits.',
  'git push origin': 'Transfers local commit objects over network stream to update remote branch references on GitHub.',
  'git reset --hard HEAD~1': 'Moves active branch pointer backwards, discarding staging index and working directory changes (destructive).',
  'git revert <sha>': 'Applies opposite changes in a brand new commit, safely reversing code without rewriting history.'
};

export default function GitPlayground() {
  const [isInitialized, setIsInitialized] = useState(true);
  const [terminalLogs, setTerminalLogs] = useState([
    'Welcome to PatternForge Git Interactive Playground!',
    'Local repository initialized in /workspace/.git/',
    'Type a command or click one of the quick actions below to see Git work in real-time.',
  ]);
  const [inputText, setInputText] = useState('');
  
  // Working Directory files
  const [files, setFiles] = useState([
    { name: 'index.html', status: 'clean', originalContent: '<h1>Hello</h1>', currentContent: '<h1>Hello</h1>' },
    { name: 'app.js', status: 'clean', originalContent: 'console.log("init");', currentContent: 'console.log("init");' },
  ]);

  // Staging index
  const [stagingArea, setStagingArea] = useState([]);

  // Local repo commits
  const [commits, setCommits] = useState([
    { id: 'c1', sha: 'e8f5e97', label: 'C1', message: 'Initial commit', parentId: null, branch: 'main', files: ['index.html', 'app.js'] },
  ]);

  // Remote repo commits
  const [remoteCommits, setRemoteCommits] = useState(['c1']);

  // Branch tracking
  const [branches, setBranches] = useState({
    main: 'c1',
  });
  const [activeBranch, setActiveBranch] = useState('main');

  const logsEndRef = useRef(null);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalLogs]);

  const addLog = (log) => {
    setTerminalLogs(prev => [...prev, log]);
  };

  // Helper to generate random commit SHA
  const generateSha = () => {
    const chars = '0123456789abcdef';
    let result = '';
    for (let i = 0; i < 7; i++) {
      result += chars[Math.floor(Math.random() * 16)];
    }
    return result;
  };

  // 1. Simulate File Modification
  const modifyFile = (fileName) => {
    if (!isInitialized) {
      addLog('error: Not a git repository (run git init first)');
      return;
    }
    setFiles(prev => prev.map(f => {
      if (f.name === fileName) {
        const appended = `\n// Edit made at ${new Date().toLocaleTimeString()}`;
        const newContent = f.currentContent + appended;
        return {
          ...f,
          currentContent: newContent,
          status: f.status === 'clean' ? 'modified' : f.status
        };
      }
      return f;
    }));
    addLog(`$ local-edit: modified contents of ${fileName}`);
  };

  // 2. Simulate git add
  const handleGitAdd = (fileName) => {
    if (!isInitialized) {
      addLog('error: Not a git repository (run git init first)');
      return;
    }

    if (fileName === '.') {
      const modifiedOrUntracked = files.filter(f => f.status === 'modified' || f.status === 'untracked');
      if (modifiedOrUntracked.length === 0) {
        addLog('$ git add .');
        addLog('Nothing to add (working directory clean)');
        return;
      }
      setFiles(prev => prev.map(f => (f.status === 'modified' || f.status === 'untracked') ? { ...f, status: 'staged' } : f));
      setStagingArea(prev => {
        const next = [...prev];
        modifiedOrUntracked.forEach(f => {
          if (!next.includes(f.name)) next.push(f.name);
        });
        return next;
      });
      addLog(`$ git add .`);
      addLog(`staged ${modifiedOrUntracked.length} files: ${modifiedOrUntracked.map(f => f.name).join(', ')}`);
    } else {
      const file = files.find(f => f.name === fileName);
      if (!file) {
        addLog(`error: pathspec '${fileName}' did not match any files`);
        return;
      }
      if (file.status === 'clean' || file.status === 'staged') {
        addLog(`$ git add ${fileName}`);
        addLog(`File '${fileName}' has no unstaged changes`);
        return;
      }
      setFiles(prev => prev.map(f => f.name === fileName ? { ...f, status: 'staged' } : f));
      setStagingArea(prev => prev.includes(fileName) ? prev : [...prev, fileName]);
      addLog(`$ git add ${fileName}`);
      addLog(`staged ${fileName} to staging area (index)`);
    }
  };

  // 3. Simulate git commit
  const handleGitCommit = (msg = 'Update codebase') => {
    if (!isInitialized) {
      addLog('error: Not a git repository (run git init first)');
      return;
    }

    if (stagingArea.length === 0) {
      addLog('$ git commit -m "' + msg + '"');
      addLog('On branch ' + activeBranch + '\nNothing to commit, working tree clean (stage your changes with git add first)');
      return;
    }

    const sha = generateSha();
    const newId = 'c_' + sha;
    const parentId = branches[activeBranch];

    const newCommit = {
      id: newId,
      sha: sha,
      label: 'C_' + sha.toUpperCase().slice(0, 2),
      message: msg,
      parentId: parentId,
      branch: activeBranch,
      files: [...stagingArea]
    };

    setCommits(prev => [...prev, newCommit]);
    setBranches(prev => ({
      ...prev,
      [activeBranch]: newId
    }));
    setFiles(prev => prev.map(f => stagingArea.includes(f.name) ? { ...f, status: 'clean', originalContent: f.currentContent } : f));
    setStagingArea([]);

    addLog(`$ git commit -m "${msg}"`);
    addLog(`[${activeBranch} ${sha}] ${msg}`);
    addLog(` ${stagingArea.length} files changed, staging flushed.`);
  };

  // 4. Simulate git branch
  const handleGitBranch = (branchName) => {
    if (!isInitialized) {
      addLog('error: Not a git repository (run git init first)');
      return;
    }
    if (!branchName || branchName.trim() === '') {
      addLog('$ git branch');
      Object.keys(branches).forEach(b => {
        addLog(b === activeBranch ? `* ${b}` : `  ${b}`);
      });
      return;
    }

    const name = branchName.trim().toLowerCase().replace(/\s+/g, '-');
    if (branches[name]) {
      addLog(`fatal: A branch named '${name}' already exists.`);
      return;
    }

    const currentHeadId = branches[activeBranch];
    setBranches(prev => ({
      ...prev,
      [name]: currentHeadId
    }));
    addLog(`$ git branch ${name}`);
    addLog(`Created branch '${name}' pointing to commit ${currentHeadId.replace('c_', '')}`);
  };

  // 5. Simulate git switch
  const handleGitSwitch = (branchName) => {
    if (!isInitialized) {
      addLog('error: Not a git repository (run git init first)');
      return;
    }
    if (!branches[branchName]) {
      addLog(`fatal: invalid branch name '${branchName}'. Run git branch first.`);
      return;
    }
    if (branchName === activeBranch) {
      addLog(`Already on branch '${branchName}'`);
      return;
    }

    setActiveBranch(branchName);
    addLog(`$ git switch ${branchName}`);
    addLog(`Switched to branch '${branchName}'`);
  };

  // 6. Simulate git push
  const handleGitPush = () => {
    if (!isInitialized) {
      addLog('error: Not a git repository');
      return;
    }

    // Traverse local commits starting from the active branch head
    // and collect all commit IDs that are not present in remoteCommits
    const activeHeadId = branches[activeBranch];
    const commitsToPush = [];
    let currentId = activeHeadId;

    while (currentId) {
      if (remoteCommits.includes(currentId)) {
        break;
      }
      commitsToPush.push(currentId);
      const c = commits.find(x => x.id === currentId);
      currentId = c ? c.parentId : null;
    }

    if (commitsToPush.length === 0) {
      addLog('$ git push origin');
      addLog('Everything up-to-date');
      return;
    }

    setRemoteCommits(prev => [...prev, ...commitsToPush]);
    addLog(`$ git push origin`);
    addLog(`Enumerating objects: ${commitsToPush.length}, done.`);
    addLog(`Counting objects: 100% (3/3), done.`);
    addLog(`Writing objects: 100% (3/3), done.`);
    addLog(`To https://github.com/subh9m/PatternForge.git`);
    addLog(`   ${remoteCommits[remoteCommits.length - 1].replace('c_', '')}..${activeHeadId.replace('c_', '')}  ${activeBranch} -> ${activeBranch}`);
  };

  // 7. Simulate git reset --hard
  const handleGitResetHard = () => {
    if (!isInitialized) {
      addLog('error: Not a git repository');
      return;
    }

    const currentHeadId = branches[activeBranch];
    const currentCommit = commits.find(c => c.id === currentHeadId);
    
    if (!currentCommit || !currentCommit.parentId) {
      addLog(`$ git reset --hard HEAD~1`);
      addLog('fatal: Cannot reset, no parent commit available');
      return;
    }

    // Move branch pointer to parent
    setBranches(prev => ({
      ...prev,
      [activeBranch]: currentCommit.parentId
    }));
    
    // Discard unstaged and staged changes
    setStagingArea([]);
    setFiles(prev => prev.map(f => ({
      ...f,
      currentContent: f.originalContent,
      status: 'clean'
    })));

    addLog(`$ git reset --hard HEAD~1`);
    addLog(`HEAD is now at ${currentCommit.parentId.replace('c_', '')} ${commits.find(x => x.id === currentCommit.parentId)?.message || 'Parent commit'}`);
  };

  // 8. Revert a commit
  const handleGitRevert = (sha) => {
    if (!isInitialized) {
      addLog('error: Not a git repository');
      return;
    }
    const cleanSha = sha.trim().toLowerCase();
    const commitToRevert = commits.find(c => c.sha === cleanSha || c.id === cleanSha);

    if (!commitToRevert) {
      addLog(`error: commit '${sha}' not found`);
      return;
    }

    const newSha = generateSha();
    const newId = 'c_' + newSha;
    const parentId = branches[activeBranch];

    const newCommit = {
      id: newId,
      sha: newSha,
      label: 'C_' + newSha.toUpperCase().slice(0, 2),
      message: `Revert "${commitToRevert.message}"`,
      parentId: parentId,
      branch: activeBranch,
      files: []
    };

    setCommits(prev => [...prev, newCommit]);
    setBranches(prev => ({
      ...prev,
      [activeBranch]: newId
    }));
    
    addLog(`$ git revert ${cleanSha}`);
    addLog(`[${activeBranch} ${newSha}] Revert "${commitToRevert.message}"`);
    addLog(` 1 commit reverted safely.`);
  };

  // 9. Reset Playground State
  const resetPlayground = () => {
    setIsInitialized(true);
    setFiles([
      { name: 'index.html', status: 'clean', originalContent: '<h1>Hello</h1>', currentContent: '<h1>Hello</h1>' },
      { name: 'app.js', status: 'clean', originalContent: 'console.log("init");', currentContent: 'console.log("init");' },
    ]);
    setStagingArea([]);
    setCommits([
      { id: 'c1', sha: 'e8f5e97', label: 'C1', message: 'Initial commit', parentId: null, branch: 'main', files: ['index.html', 'app.js'] },
    ]);
    setRemoteCommits(['c1']);
    setBranches({ main: 'c1' });
    setActiveBranch('main');
    setTerminalLogs([
      'Playground reset successfully.',
      'Local repository re-initialized in /workspace/.git/',
    ]);
  };

  // Handle Terminal Input submit
  const handleTerminalSubmit = (e) => {
    e.preventDefault();
    if (!inputText) return;
    const query = inputText.trim();
    setInputText('');

    if (query === 'git init') {
      resetPlayground();
    } else if (query === 'git add .') {
      handleGitAdd('.');
    } else if (query.startsWith('git add ')) {
      const file = query.replace('git add ', '').trim();
      handleGitAdd(file);
    } else if (query.startsWith('git commit -m ')) {
      const msg = query.split('-m ')[1]?.replace(/['"]/g, '').trim() || 'Custom commit';
      handleGitCommit(msg);
    } else if (query === 'git commit') {
      handleGitCommit('Update repo');
    } else if (query.startsWith('git branch ')) {
      const bName = query.replace('git branch ', '').trim();
      handleGitBranch(bName);
    } else if (query === 'git branch') {
      handleGitBranch();
    } else if (query.startsWith('git switch ')) {
      const bName = query.replace('git switch ', '').trim();
      handleGitSwitch(bName);
    } else if (query === 'git push' || query === 'git push origin') {
      handleGitPush();
    } else if (query === 'git reset --hard HEAD~1') {
      handleGitResetHard();
    } else if (query.startsWith('git revert ')) {
      const shaVal = query.replace('git revert ', '').trim();
      handleGitRevert(shaVal);
    } else if (query === 'clear') {
      setTerminalLogs([]);
    } else if (query === 'help') {
      addLog('Available commands:');
      addLog('  git init                       - resets repository state');
      addLog('  git add <file> or git add .    - stages file modifications');
      addLog('  git commit -m "msg"            - records staged changes as commit');
      addLog('  git branch <name>              - creates a new branch pointer');
      addLog('  git switch <branch>            - moves active HEAD to branch');
      addLog('  git push origin                - pushes local commits to GitHub');
      addLog('  git reset --hard HEAD~1        - undoes last commit and changes');
      addLog('  git revert <sha>               - reverts targeted commit safely');
      addLog('  clear                          - clears terminal window');
    } else {
      addLog(`$ ${query}`);
      addLog(`sh: command not found: ${query}. Type 'help' for support.`);
    }
  };

  // Helper to layout commits in SVG coordinate grid
  // We lay out nodes based on branch name: main on middle row, feature on top, etc.
  const computeNodePositions = () => {
    const coords = {};
    const branchRows = {
      main: 150,
      feature: 60,
      develop: 240,
    };

    // Keep horizontal counters per branch to track spacing
    const depthMap = {};
    
    // Sort commits: root first
    // Since commits are appended chronologically, we can assign index directly.
    commits.forEach((c) => {
      const bName = c.branch || 'main';
      if (!depthMap[bName]) {
        depthMap[bName] = 1;
      } else {
        depthMap[bName] += 1;
      }

      // Base X spacing
      let x = depthMap[bName] * 110;
      
      // If it has a parent, try to align X relative to parent to show flow
      if (c.parentId && coords[c.parentId]) {
        const parentX = coords[c.parentId].x;
        // Make sure child node is always to the right of its parent
        if (x <= parentX) {
          x = parentX + 110;
        }
      }

      const y = branchRows[bName] || 150;
      coords[c.id] = { x, y, sha: c.sha, message: c.message, branch: bName };
    });

    return coords;
  };

  const nodeCoords = computeNodePositions();

  return (
    <div className="space-y-6">
      {/* Visual Workspace Dashboard */}
      <div className="bg-white/60 dark:bg-black/60 backdrop-blur-md border border-gray-250 dark:border-[#333] rounded-2xl p-6 md:p-8 shadow-lg">
        <div className="flex items-center justify-between flex-wrap gap-4 border-b border-gray-250 dark:border-neutral-800 pb-5">
          <div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white font-mono uppercase tracking-wide flex items-center space-x-2">
              <span className="animate-pulse h-3 w-3 bg-green-500 rounded-full inline-block"></span>
              <span>🎮 SDE Git Interactive Sandbox</span>
            </h1>
            <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400 font-light">
              Explore staging indexes, branch switches, merges, and remote uploads. Click options or type in the console below to visualise operations!
            </p>
          </div>
          <button
            onClick={resetPlayground}
            className="flex items-center space-x-2 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/25 text-red-500 border border-red-500/20 hover:border-red-500/40 rounded-lg text-xs font-mono font-black cursor-pointer transition-all duration-150"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Workspace</span>
          </button>
        </div>

        {/* 4 WORKING ZONES GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mt-6">
          
          {/* ZONE 1: WORKING DIRECTORY */}
          <div className="bg-gray-50/50 dark:bg-neutral-950/20 border border-gray-200 dark:border-neutral-900 rounded-xl p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-gray-250 dark:border-neutral-900 pb-2 mb-3">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest font-mono">💻 Working Directory</span>
                <span className="h-2 w-2 rounded-full bg-blue-500"></span>
              </div>
              
              <div className="space-y-3">
                {files.map((file, idx) => {
                  let statusBg = 'border-gray-250 bg-gray-50/30 text-gray-500';
                  if (file.status === 'modified') statusBg = 'border-red-500/35 bg-red-500/[0.04] text-red-400';
                  if (file.status === 'staged') statusBg = 'border-green-500/35 bg-green-500/[0.04] text-green-400';
                  
                  return (
                    <div key={idx} className={`p-2.5 border rounded-lg ${statusBg} transition-all duration-200`}>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-gray-700 dark:text-gray-300">{file.name}</span>
                        <span className="text-[8px] uppercase tracking-widest font-mono font-semibold px-1 rounded-sm bg-neutral-900/10 dark:bg-neutral-950/60">
                          {file.status}
                        </span>
                      </div>
                      
                      {/* Interactive edit button */}
                      <button
                        onClick={() => modifyFile(file.name)}
                        className="mt-2 text-[9px] font-mono font-bold text-amber-500 hover:text-amber-600 flex items-center space-x-1 cursor-pointer"
                        title="Simulate typing content into file"
                      >
                        <span>✍️ Edit Code</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-dashed border-gray-200 dark:border-neutral-900">
              <button
                onClick={() => handleGitAdd('.')}
                className="w-full flex items-center justify-center space-x-2 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-mono font-black cursor-pointer transition-all duration-150 shadow-sm"
              >
                <span>git add .</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </div>

          {/* ZONE 2: STAGING AREA */}
          <div className="bg-gray-50/50 dark:bg-neutral-950/20 border border-gray-200 dark:border-neutral-900 rounded-xl p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-gray-250 dark:border-neutral-900 pb-2 mb-3">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest font-mono">📦 Staging Area (Index)</span>
                <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
              </div>

              {stagingArea.length > 0 ? (
                <div className="space-y-2.5">
                  {stagingArea.map((name, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-green-500/[0.05] border border-green-500/20 text-green-500 rounded-lg">
                      <span className="font-mono text-xs font-bold">{name}</span>
                      <span className="text-[9px] font-mono font-bold text-green-400/80">Staged (Ready)</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-28 text-center border border-dashed border-gray-250 dark:border-neutral-800 rounded-lg">
                  <span className="text-xl">🧺</span>
                  <span className="text-[10px] font-mono text-gray-400 mt-1">Staging index empty</span>
                </div>
              )}
            </div>

            {stagingArea.length > 0 && (
              <div className="mt-4 pt-3 border-t border-dashed border-gray-200 dark:border-neutral-900 space-y-2">
                <input
                  type="text"
                  id="commitMsg"
                  placeholder="Enter commit message..."
                  defaultValue="Modify component styling"
                  className="w-full px-2.5 py-1.5 text-xs bg-gray-100 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-lg font-mono text-gray-800 dark:text-gray-300 focus:outline-none"
                />
                <button
                  onClick={() => {
                    const val = document.getElementById('commitMsg')?.value || 'Update config files';
                    handleGitCommit(val);
                  }}
                  className="w-full flex items-center justify-center space-x-2 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-mono font-black cursor-pointer transition-all duration-150 shadow-sm"
                >
                  <span>git commit -m</span>
                </button>
              </div>
            )}
          </div>

          {/* ZONE 3: LOCAL REPOSITORY (COMMIT GRAPH) */}
          <div className="col-span-1 lg:col-span-2 bg-gray-50/50 dark:bg-neutral-950/20 border border-gray-200 dark:border-neutral-900 rounded-xl p-4 flex flex-col justify-between min-h-[300px]">
            <div>
              <div className="flex items-center justify-between border-b border-gray-250 dark:border-neutral-900 pb-2 mb-3">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest font-mono">🗂️ Local Repo & Commit History</span>
                <div className="flex items-center space-x-1">
                  <span className="px-2 py-0.5 bg-amber-500/10 text-amber-500 text-[8px] font-mono font-bold rounded-sm border border-amber-500/20">
                    Active: {activeBranch}
                  </span>
                </div>
              </div>

              {/* Dynamic SVG Visual Commit Graph */}
              <div className="relative border border-gray-200 dark:border-neutral-900/50 bg-black/40 rounded-xl overflow-hidden min-h-[220px]">
                
                {/* SVG canvas */}
                <svg className="absolute inset-0 w-full h-full" style={{ minWidth: '400px' }}>
                  {/* Arrows connecting parent commits */}
                  {commits.map((c) => {
                    if (!c.parentId || !nodeCoords[c.parentId] || !nodeCoords[c.id]) return null;
                    const parent = nodeCoords[c.parentId];
                    const child = nodeCoords[c.id];
                    
                    // Bezier curves for branching visually
                    const midX = (parent.x + child.x) / 2;
                    return (
                      <g key={`link-${c.id}`}>
                        <path
                          d={`M ${parent.x} ${parent.y} C ${midX} ${parent.y}, ${midX} ${child.y}, ${child.x} ${child.y}`}
                          fill="none"
                          stroke={c.branch === 'main' ? '#f59e0b' : '#3b82f6'}
                          strokeWidth="2.5"
                          strokeDasharray={remoteCommits.includes(c.id) ? 'none' : '4,4'}
                          className="transition-all duration-500"
                        />
                      </g>
                    );
                  })}

                  {/* Draw commits bubbles */}
                  {commits.map((c) => {
                    const node = nodeCoords[c.id];
                    if (!node) return null;
                    const isHeadCommit = branches[activeBranch] === c.id;
                    const isPushed = remoteCommits.includes(c.id);
                    
                    return (
                      <g 
                        key={`node-${c.id}`} 
                        transform={`translate(${node.x}, ${node.y})`}
                        className="group cursor-pointer transition-transform duration-300 hover:scale-110"
                        onClick={() => addLog(`Commit details [${c.sha}]: "${c.message}" | Modified: ${c.files.join(', ')}`)}
                      >
                        {/* Ring highlight if HEAD */}
                        {isHeadCommit && (
                          <circle r="18" fill="none" stroke="#ef4444" strokeWidth="2.5" className="animate-ping opacity-60" />
                        )}

                        <circle 
                          r="13" 
                          fill={c.branch === 'main' ? '#f59e0b' : '#3b82f6'} 
                          stroke={isHeadCommit ? '#ef4444' : (isPushed ? '#22c55e' : '#666')} 
                          strokeWidth="2.5"
                        />
                        
                        {/* Label abbreviation */}
                        <text 
                          textAnchor="middle" 
                          dy=".3em" 
                          fill="#000" 
                          className="font-mono text-[9px] font-black select-none"
                        >
                          {c.label}
                        </text>

                        {/* Tooltip on hover */}
                        <title>{`[SHA: ${c.sha}] - ${c.message}`}</title>
                      </g>
                    );
                  })}

                  {/* Branch Pointers and labels */}
                  {Object.entries(branches).map(([bName, cId]) => {
                    const node = nodeCoords[cId];
                    if (!node) return null;
                    const isActive = bName === activeBranch;
                    
                    return (
                      <g key={`branch-tag-${bName}`} transform={`translate(${node.x - 30}, ${node.y - 30})`}>
                        <rect
                          width="55"
                          height="16"
                          rx="4"
                          fill={isActive ? 'rgba(239, 68, 68, 0.9)' : 'rgba(38, 38, 38, 0.85)'}
                          stroke={isActive ? '#ef4444' : '#555'}
                          strokeWidth="1"
                        />
                        <text
                          x="27.5"
                          y="11"
                          textAnchor="middle"
                          fill="#fff"
                          className="font-mono text-[8px] font-bold"
                        >
                          {isActive ? `*${bName}` : bName}
                        </text>
                      </g>
                    );
                  })}
                </svg>

                {/* Legend Overlay info */}
                <div className="absolute bottom-2 left-2 flex items-center space-x-3 text-[8px] font-mono text-gray-400 bg-neutral-900/80 px-2 py-1.5 rounded border border-neutral-800">
                  <div className="flex items-center space-x-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
                    <span>main</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
                    <span>feature</span>
                  </div>
                  <div className="flex items-center space-x-1 border-l border-neutral-700 pl-2">
                    <span className="h-1.5 w-1.5 rounded-full border border-dashed border-green-500"></span>
                    <span>local-only</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
                    <span>pushed</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Commits Action Toolbar */}
            <div className="mt-4 pt-3 border-t border-dashed border-gray-200 dark:border-neutral-900 grid grid-cols-2 md:grid-cols-4 gap-2">
              <button
                onClick={() => handleGitBranch('feature')}
                className="flex items-center justify-center space-x-1.5 py-1 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-gray-200 hover:text-white rounded text-[10px] font-mono cursor-pointer transition-colors"
                title="git branch feature: Create feature branch pointer"
              >
                <GitBranch className="h-3 w-3 text-blue-500" />
                <span>git branch feature</span>
              </button>
              
              <button
                onClick={() => handleGitSwitch('feature')}
                className="flex items-center justify-center space-x-1.5 py-1 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-gray-200 hover:text-white rounded text-[10px] font-mono cursor-pointer transition-colors"
                title="git switch feature: Switch working folder to feature"
              >
                <ArrowRight className="h-3 w-3 text-blue-400" />
                <span>git switch feature</span>
              </button>
              
              <button
                onClick={() => handleGitSwitch('main')}
                className="flex items-center justify-center space-x-1.5 py-1 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-gray-200 hover:text-white rounded text-[10px] font-mono cursor-pointer transition-colors"
                title="git switch main: Switch working folder back to main"
              >
                <ArrowRight className="h-3 w-3 text-amber-500" />
                <span>git switch main</span>
              </button>

              <button
                onClick={handleGitPush}
                className="flex items-center justify-center space-x-1.5 py-1 bg-green-600/10 hover:bg-green-600/25 border border-green-500/20 hover:border-green-500/40 text-green-500 rounded text-[10px] font-mono cursor-pointer transition-colors"
                title="git push origin: Send commits upstream to GitHub remote repo"
              >
                <Share2 className="h-3 w-3" />
                <span>git push origin</span>
              </button>
            </div>
          </div>
        </div>

        {/* REMOTE CLOUD SERVER (GITHUB SHIELD) */}
        <div className="mt-4 p-4 bg-green-500/[0.02] border border-green-500/10 dark:border-green-500/5 rounded-xl flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-500/10 rounded-lg border border-green-500/20 text-green-500">
              <Share2 className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[9px] font-black text-green-500 uppercase tracking-widest font-mono">☁️ GitHub Remote Portal (origin)</span>
              <p className="text-[11px] text-gray-650 dark:text-gray-400 leading-relaxed font-sans mt-0.5">
                Target URL tracking: <code className="text-[10px] text-green-600 dark:text-green-400 select-all">https://github.com/subh9m/PatternForge.git</code>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold text-gray-500">Remote Commits ({remoteCommits.length}):</span>
            <div className="flex items-center -space-x-1.5">
              {remoteCommits.map((id, idx) => {
                const c = commits.find(x => x.id === id);
                return (
                  <div 
                    key={idx} 
                    className="h-6 w-6 rounded-full bg-green-500 border border-black dark:border-neutral-900 flex items-center justify-center text-[8px] font-mono font-black text-black"
                    title={c ? `[SHA: ${c.sha}] - ${c.message}` : 'Initial commit'}
                  >
                    {c ? c.label : 'C1'}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* QUICK COMMAND ACTION & GLOSSARY CHEAT BOX */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* INTERACTIVE GLOSSARY / COMMAND TIPS */}
        <div className="bg-white/60 dark:bg-black/60 backdrop-blur-md border border-gray-250 dark:border-[#333] rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest font-mono mb-3">
              💡 Interactive Command Help Box
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-4">
              Hover or click on any command helper below to reveal its exact technical function:
            </p>
            
            <div className="space-y-1.5 overflow-y-auto max-h-56 pr-1">
              {Object.entries(COMMAND_HELP).map(([cmd, definition], idx) => (
                <div 
                  key={idx} 
                  className="p-2 border border-gray-150 dark:border-neutral-900 hover:border-amber-500/20 bg-gray-50/30 dark:bg-black/30 rounded-lg group transition-all"
                >
                  <code className="text-[10.5px] font-mono font-black text-amber-500">{cmd}</code>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-normal font-sans mt-0.5 select-none hidden group-hover:block transition-all">
                    {definition}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* TERMINAL INTERACTIVE TERMINAL */}
        <div className="col-span-1 md:col-span-2 bg-neutral-950 border border-neutral-800 rounded-2xl p-4 shadow-2xl flex flex-col justify-between font-mono text-xs h-[300px]">
          <div>
            {/* Terminal Top bar */}
            <div className="flex items-center justify-between border-b border-neutral-900 pb-2 mb-3">
              <div className="flex items-center space-x-1.5">
                <Terminal className="h-4 w-4 text-gray-500" />
                <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">git-sandbox-shell</span>
              </div>
              <div className="flex space-x-1.5">
                <span className="h-2 w-2 rounded-full bg-red-500/50"></span>
                <span className="h-2 w-2 rounded-full bg-yellow-500/50"></span>
                <span className="h-2 w-2 rounded-full bg-green-500/50"></span>
              </div>
            </div>

            {/* Terminal Streams */}
            <div className="overflow-y-auto h-48 space-y-1 font-mono text-gray-300 pr-1 text-[11px] leading-relaxed">
              {terminalLogs.map((log, idx) => {
                let textClass = 'text-slate-400';
                if (log.startsWith('$')) textClass = 'text-amber-500 font-semibold';
                if (log.startsWith('error') || log.startsWith('fatal')) textClass = 'text-red-500 font-semibold';
                if (log.includes('commit') && !log.startsWith('$')) textClass = 'text-green-400';
                
                return (
                  <div key={idx} className={textClass}>
                    {log}
                  </div>
                );
              })}
              <div ref={logsEndRef} />
            </div>
          </div>

          {/* Terminal Input Form */}
          <form onSubmit={handleTerminalSubmit} className="mt-3 flex items-center border-t border-neutral-900 pt-2.5">
            <span className="text-amber-500 font-bold pr-2 select-none">$</span>
            <input
              type="text"
              placeholder="Type 'help' for options (e.g. git add ., git commit -m 'message', git push)..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none font-mono text-xs text-white placeholder-neutral-700"
            />
            <button
              type="submit"
              className="p-1 bg-amber-500 hover:bg-amber-600 rounded text-black transition-colors cursor-pointer"
            >
              <Play className="h-3 w-3 fill-current" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
