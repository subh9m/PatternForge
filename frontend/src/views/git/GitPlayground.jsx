import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, Terminal, GitBranch, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Tooltips for instructions
const COMMAND_HELP = {
  'git add <file>': 'Stages file changes, moving them to the Index. (File status card turns Green).',
  'git commit -m "msg"': 'Locks index snapshot into local history, generating a new commit node.',
  'git switch <branch>': 'Switches HEAD pointer to targeted branch, swapping workspace folders.',
  'git branch <name>': 'Creates a new branch pointer at current HEAD commit without switching.',
  'git merge <branch>': 'Merges code. Performs fast-forward or creates a convergence merge commit.',
  'git rebase <branch>': 'Unplugs commits, replays them with new hashes on tip of targeted branch.',
  'git push origin': 'Sends local commits upstream, updating GitHub repositories with line animations.',
  'git reset --hard HEAD~1': 'Rolls back active branch pointer, discarding working edits.',
  'git revert <sha>': 'Applies an opposite change in a new commit to safely reverse past commits.'
};

export default function GitPlayground() {
  const [terminalLogs, setTerminalLogs] = useState([
    'Local workspace ready in /workspace/.git/',
    'Graph pre-populated with a divergent history for demonstration purposes.',
    'Type commands or click action triggers below to play with Git.',
    'Type "help" in the terminal for a full syntax list.'
  ]);
  const [inputText, setInputText] = useState('');
  
  // Working Directory files
  const [files, setFiles] = useState([
    { name: 'index.html', status: 'clean', originalContent: '<h1>Hello World</h1>\n<p>Welcome to PatternForge</p>', currentContent: '<h1>Hello World</h1>\n<p>Welcome to PatternForge</p>' },
    { name: 'app.js', status: 'clean', originalContent: '// Authentication utility\nfunction login() {\n  console.log("Logged in");\n}', currentContent: '// Authentication utility\nfunction login() {\n  console.log("Logged in");\n}' },
  ]);

  // Selected file for code editor
  const [selectedFile, setSelectedFile] = useState('index.html');

  // Staging area
  const [stagingArea, setStagingArea] = useState([]);

  // Commit history pre-populated with C1, C2, and C3 (on feature branch) to show divergent trees on load
  const [commits, setCommits] = useState([
    { id: 'c1', sha: 'e8f5e97', label: 'C1', message: 'Initial commit', parentId: null, parent2Id: null, branch: 'main', files: ['index.html', 'app.js'] },
    { id: 'c2', sha: 'a9b2c34', label: 'C2', message: 'Add login page structure', parentId: 'c1', parent2Id: null, branch: 'main', files: ['index.html'] },
    { id: 'c3', sha: 'f4d5e67', label: 'C3', message: 'Implement OAuth logic', parentId: 'c2', parent2Id: null, branch: 'feature', files: ['app.js'] }
  ]);

  // Remote repository commits (Initial commits pushed)
  const [remoteCommits, setRemoteCommits] = useState(['c1', 'c2']);

  // Branch tracking pointers
  const [branches, setBranches] = useState({
    main: 'c2',
    feature: 'c3'
  });
  const [activeBranch, setActiveBranch] = useState('main');

  // Hover states for SDE Graph Inspector
  const [hoveredNode, setHoveredNode] = useState(null);
  const [hoveredBranch, setHoveredBranch] = useState(null);

  // Push animation trigger state
  const [isPushing, setIsPushing] = useState(false);
  const [pushSourceCoords, setPushSourceCoords] = useState({ x: 130, y: 110 });

  const logsEndRef = useRef(null);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalLogs]);

  const addLog = (log) => {
    setTerminalLogs(prev => [...prev, log]);
  };

  const generateSha = () => {
    const chars = '0123456789abcdef';
    let result = '';
    for (let i = 0; i < 7; i++) {
      result += chars[Math.floor(Math.random() * 16)];
    }
    return result;
  };

  // Handle live code edits
  const handleCodeChange = (e) => {
    const text = e.target.value;
    setFiles(prev => prev.map(f => {
      if (f.name === selectedFile) {
        const isModified = text !== f.originalContent;
        return {
          ...f,
          currentContent: text,
          status: isModified ? 'modified' : 'clean'
        };
      }
      return f;
    }));
  };

  // git add
  const handleGitAdd = (fileName) => {
    if (fileName === '.') {
      const targets = files.filter(f => f.status === 'modified' || f.status === 'untracked');
      if (targets.length === 0) {
        addLog('$ git add .');
        addLog('Nothing to add (working tree clean)');
        return;
      }
      setFiles(prev => prev.map(f => (f.status === 'modified' || f.status === 'untracked') ? { ...f, status: 'staged' } : f));
      setStagingArea(prev => {
        const next = [...prev];
        targets.forEach(t => {
          if (!next.includes(t.name)) next.push(t.name);
        });
        return next;
      });
      addLog(`$ git add .`);
      addLog(`Staged files: ${targets.map(t => t.name).join(', ')}`);
    } else {
      const file = files.find(f => f.name === fileName);
      if (!file) {
        addLog(`error: pathspec '${fileName}' did not match any files`);
        return;
      }
      if (file.status === 'clean' || file.status === 'staged') {
        addLog(`File '${fileName}' has no unstaged modifications`);
        return;
      }
      setFiles(prev => prev.map(f => f.name === fileName ? { ...f, status: 'staged' } : f));
      setStagingArea(prev => prev.includes(fileName) ? prev : [...prev, fileName]);
      addLog(`$ git add ${fileName}`);
      addLog(`Staged '${fileName}'`);
    }
  };

  // git commit
  const handleGitCommit = (msg = 'Update codebase') => {
    if (stagingArea.length === 0) {
      addLog('$ git commit -m "' + msg + '"');
      addLog('On branch ' + activeBranch + '\nNothing to commit, working tree clean (run git add first)');
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
      parent2Id: null,
      branch: activeBranch,
      files: [...stagingArea]
    };

    setCommits(prev => [...prev, newCommit]);
    setBranches(prev => ({
      ...prev,
      [activeBranch]: newId
    }));
    setFiles(prev => prev.map(f => {
      if (stagingArea.includes(f.name)) {
        return {
          ...f,
          status: 'clean',
          originalContent: f.currentContent
        };
      }
      return f;
    }));
    setStagingArea([]);

    addLog(`$ git commit -m "${msg}"`);
    addLog(`[${activeBranch} ${sha}] ${msg}`);
  };

  // git branch
  const handleGitBranch = (branchName) => {
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
    addLog(`Created branch '${name}' pointing to ${currentHeadId.replace('c_', '')}`);
  };

  // git switch
  const handleGitSwitch = (branchName) => {
    if (!branches[branchName]) {
      addLog(`fatal: invalid branch name '${branchName}'`);
      return;
    }
    setActiveBranch(branchName);
    
    // Switch working file values
    const headId = branches[branchName];
    const commit = commits.find(c => c.id === headId);
    if (commit) {
      setFiles(prev => prev.map(f => ({
        ...f,
        status: 'clean',
        originalContent: f.originalContent,
        currentContent: f.originalContent
      })));
    }
    setStagingArea([]);
    
    addLog(`$ git switch ${branchName}`);
    addLog(`Switched to branch '${branchName}'`);
  };

  // git merge
  const handleGitMerge = (targetBranchName) => {
    if (!branches[targetBranchName]) {
      addLog(`fatal: branch '${targetBranchName}' not found`);
      return;
    }
    if (targetBranchName === activeBranch) {
      addLog(`Already on branch '${activeBranch}' (nothing to merge)`);
      return;
    }

    const activeHead = branches[activeBranch];
    const targetHead = branches[targetBranchName];

    if (activeHead === targetHead) {
      addLog(`$ git merge ${targetBranchName}`);
      addLog('Already up-to-date.');
      return;
    }

    // Check if activeHead is ancestor of targetHead (Fast-Forward)
    let isAncestor = false;
    let curr = targetHead;
    while (curr) {
      if (curr === activeHead) {
        isAncestor = true;
        break;
      }
      const c = commits.find(x => x.id === curr);
      curr = c ? c.parentId : null;
    }

    if (isAncestor) {
      setBranches(prev => ({
        ...prev,
        [activeBranch]: targetHead
      }));
      addLog(`$ git merge ${targetBranchName}`);
      addLog(`Updating ${activeHead.replace('c_', '')}..${targetHead.replace('c_', '')}`);
      addLog(`Fast-forward: merged '${targetBranchName}' into '${activeBranch}'`);
      return;
    }

    // Check if targetHead is ancestor of activeHead
    let isTargetAncestor = false;
    curr = activeHead;
    while (curr) {
      if (curr === targetHead) {
        isTargetAncestor = true;
        break;
      }
      const c = commits.find(x => x.id === curr);
      curr = c ? c.parentId : null;
    }

    if (isTargetAncestor) {
      addLog(`$ git merge ${targetBranchName}`);
      addLog('Already up-to-date (active branch contains target commits).');
      return;
    }

    // Perform 3-Way Merge Commit
    const sha = generateSha();
    const newId = 'c_' + sha;
    const mergeCommit = {
      id: newId,
      sha: sha,
      label: 'C_' + sha.toUpperCase().slice(0, 2),
      message: `Merge branch '${targetBranchName}' into ${activeBranch}`,
      parentId: activeHead,
      parent2Id: targetHead,
      branch: activeBranch,
      files: []
    };

    setCommits(prev => [...prev, mergeCommit]);
    setBranches(prev => ({
      ...prev,
      [activeBranch]: newId
    }));
    addLog(`$ git merge ${targetBranchName}`);
    addLog(`Merge made by the 'ort' strategy.`);
    addLog(`Created merge commit ${sha} (convergence node).`);
  };

  // git rebase
  const handleGitRebase = (targetBranchName) => {
    if (!branches[targetBranchName]) {
      addLog(`fatal: branch '${targetBranchName}' not found`);
      return;
    }
    if (targetBranchName === activeBranch) {
      addLog(`Already on branch '${activeBranch}' (nothing to rebase)`);
      return;
    }

    const activeHead = branches[activeBranch];
    const targetHead = branches[targetBranchName];

    // Find Lowest Common Ancestor
    const lcaId = findLCA(activeHead, targetHead);
    if (!lcaId) {
      addLog('fatal: No common ancestor found. Cannot rebase.');
      return;
    }

    if (lcaId === targetHead) {
      addLog(`$ git rebase ${targetBranchName}`);
      addLog('Current branch is already up-to-date with target branch.');
      return;
    }

    const commitsToReplay = [];
    let curr = activeHead;
    while (curr && curr !== lcaId) {
      const c = commits.find(x => x.id === curr);
      if (!c) break;
      commitsToReplay.unshift(c);
      curr = c.parentId;
    }

    if (commitsToReplay.length === 0) {
      setBranches(prev => ({
        ...prev,
        [activeBranch]: targetHead
      }));
      addLog(`$ git rebase ${targetBranchName}`);
      addLog(`Successfully rebased (fast-forwarded refs/heads/${activeBranch} to references of ${targetBranchName}).`);
      return;
    }

    let newParentId = targetHead;
    let updatedCommits = [...commits];
    let lastNewId = null;

    addLog(`$ git rebase ${targetBranchName}`);
    commitsToReplay.forEach((c) => {
      const sha = generateSha();
      const newId = 'c_' + sha;
      const replayed = {
        id: newId,
        sha: sha,
        label: 'C_' + sha.toUpperCase().slice(0, 2),
        message: `${c.message} (rebased)`,
        parentId: newParentId,
        parent2Id: null,
        branch: activeBranch,
        files: [...c.files]
      };
      updatedCommits.push(replayed);
      addLog(`  Replaying commit ${c.sha.slice(0, 7)}: "${c.message}" on top of target tip`);
      newParentId = newId;
      lastNewId = newId;
    });

    setCommits(updatedCommits);
    setBranches(prev => ({
      ...prev,
      [activeBranch]: lastNewId
    }));
    addLog(`Successfully rebased and updated refs/heads/${activeBranch}.`);
  };

  // git push origin
  const handleGitPush = () => {
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

    const coords = nodeCoords[activeHeadId] || { x: 130, y: 110 };
    setPushSourceCoords(coords);
    setIsPushing(true);

    setTimeout(() => {
      setRemoteCommits(prev => [...prev, ...commitsToPush]);
      setIsPushing(false);
      addLog(`$ git push origin`);
      addLog(`Enumerating objects: ${commitsToPush.length}, done.`);
      addLog(`Writing objects: 100% (3/3), done.`);
      addLog(`To https://github.com/subh9m/PatternForge.git`);
      addLog(`   refs/heads/${activeBranch} -> origin/${activeBranch}`);
    }, 1200);
  };

  // git reset --hard HEAD~1
  const handleGitResetHard = () => {
    const currentHeadId = branches[activeBranch];
    const currentCommit = commits.find(c => c.id === currentHeadId);
    
    if (!currentCommit || !currentCommit.parentId) {
      addLog(`$ git reset --hard HEAD~1`);
      addLog('fatal: Cannot reset, no parent commit available');
      return;
    }

    setBranches(prev => ({
      ...prev,
      [activeBranch]: currentCommit.parentId
    }));
    
    setStagingArea([]);
    setFiles(prev => prev.map(f => ({
      ...f,
      currentContent: f.originalContent,
      status: 'clean'
    })));

    addLog(`$ git reset --hard HEAD~1`);
    addLog(`HEAD is now at ${currentCommit.parentId.replace('c_', '')}`);
  };

  // git revert <sha>
  const handleGitRevert = (sha) => {
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
      parent2Id: null,
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
  };

  // Reset Playground State
  const resetPlayground = () => {
    setFiles([
      { name: 'index.html', status: 'clean', originalContent: '<h1>Hello World</h1>\n<p>Welcome to PatternForge</p>', currentContent: '<h1>Hello World</h1>\n<p>Welcome to PatternForge</p>' },
      { name: 'app.js', status: 'clean', originalContent: '// Authentication utility\nfunction login() {\n  console.log("Logged in");\n}', currentContent: '// Authentication utility\nfunction login() {\n  console.log("Logged in");\n}' },
    ]);
    setSelectedFile('index.html');
    setStagingArea([]);
    setCommits([
      { id: 'c1', sha: 'e8f5e97', label: 'C1', message: 'Initial commit', parentId: null, parent2Id: null, branch: 'main', files: ['index.html', 'app.js'] },
    ]);
    setRemoteCommits(['c1']);
    setBranches({ main: 'c1' });
    setActiveBranch('main');
    setTerminalLogs([
      'Playground reset successfully.',
      'Local repository re-initialized in /workspace/.git/',
    ]);
  };

  // Handle Terminal Inputs
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
    } else if (query.startsWith('git merge ')) {
      const bName = query.replace('git merge ', '').trim();
      handleGitMerge(bName);
    } else if (query.startsWith('git rebase ')) {
      const bName = query.replace('git rebase ', '').trim();
      handleGitRebase(bName);
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
      addLog('  git add .                     - stages working modifications');
      addLog('  git commit -m "msg"           - locks staged snapshot to repo');
      addLog('  git branch <name>             - creates branch pointer');
      addLog('  git switch <branch>           - switch HEAD to branch context');
      addLog('  git merge <branch>            - merge branch into current HEAD');
      addLog('  git rebase <branch>           - replays commits on top of branch');
      addLog('  git push origin               - push changes upstream to GitHub');
      addLog('  git reset --hard HEAD~1       - rewind and wipe unstaged files');
      addLog('  git revert <sha>              - reverse a commit safely');
      addLog('  clear                         - clears terminal logs');
    } else {
      addLog(`$ ${query}`);
      addLog(`sh: command not found: ${query}. Type 'help' for support.`);
    }
  };

  // Layout node coordinates with wider spacing (135px)
  const computeNodePositions = () => {
    const coords = {};
    const branchRows = {
      main: 110,
      feature: 50,
      bugfix: 170,
    };

    const depths = {};
    commits.forEach(c => {
      if (!c.parentId) {
        depths[c.id] = 0;
      } else {
        const d1 = depths[c.parentId] !== undefined ? depths[c.parentId] : 0;
        const d2 = c.parent2Id && depths[c.parent2Id] !== undefined ? depths[c.parent2Id] : 0;
        depths[c.id] = Math.max(d1, d2) + 1;
      }

      const x = (depths[c.id] + 1) * 135;
      const y = branchRows[c.branch] || 110;
      coords[c.id] = { x, y, sha: c.sha, message: c.message, branch: c.branch };
    });

    return coords;
  };

  const nodeCoords = computeNodePositions();
  const currentSelectedFileObj = files.find(f => f.name === selectedFile) || files[0];

  return (
    <div className="space-y-6">
      {/* Visual Workspace Dashboard */}
      <div className="bg-white/80 dark:bg-neutral-950/70 backdrop-blur-md border border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 rounded-2xl p-6 md:p-8 shadow-lg">
        <div className="flex items-center justify-between flex-wrap gap-4 border-b border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 pb-5">
          <div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white font-mono uppercase tracking-wide flex items-center space-x-2.5">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              <span>🎮 SDE Git Interactive Sandbox</span>
            </h1>
            <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400 font-light">
              Visually observe commits sliding into place, branches merging, and push packet transmissions.
            </p>
          </div>
          <button
            onClick={resetPlayground}
            className="flex items-center space-x-2 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/25 text-red-500 border border-red-500/20 hover:border-red-500/40 rounded-lg text-xs font-mono font-black cursor-pointer transition-all duration-150"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Repository</span>
          </button>
        </div>

        {/* 1. VISUAL COMMIT GRAPH (SVG - SPANS ACROSS TOP FOR WIDTH) */}
        <div className="mt-6 space-y-2">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest font-mono block">🌿 Visual Commit Graph & Network Alias</span>
          
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            
            {/* Left 3/4 Graph Canvas */}
            <div className="xl:col-span-3 relative border border-neutral-200 dark:border-neutral-800 dark:border-neutral-900 bg-neutral-950/60 dark:bg-black/60 rounded-xl overflow-x-auto p-4 min-h-[240px] scrollbar-thin">
              {/* SVG Graph Drawing Canvas */}
              <svg className="w-full h-full" style={{ minWidth: '950px', height: '220px' }}>
                {/* Connecting lines with stroke drawing effect */}
                {commits.map((c) => {
                  const child = nodeCoords[c.id];
                  if (!child) return null;

                  return (
                    <g key={`links-${c.id}`}>
                      {/* Primary Parent Line */}
                      {c.parentId && nodeCoords[c.parentId] && (
                        <motion.path
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1, d: `M ${nodeCoords[c.parentId].x} ${nodeCoords[c.parentId].y} C ${(nodeCoords[c.parentId].x + child.x) / 2} ${nodeCoords[c.parentId].y}, ${(nodeCoords[c.parentId].x + child.x) / 2} ${child.y}, ${child.x} ${child.y}` }}
                          transition={{ duration: 0.6, ease: "easeOut" }}
                          fill="none"
                          stroke={c.branch === 'main' ? '#f59e0b' : (c.branch === 'feature' ? '#0ea5e9' : '#d946ef')}
                          strokeWidth="4"
                          strokeDasharray={remoteCommits.includes(c.id) ? 'none' : '5,4'}
                        />
                      )}

                      {/* Secondary Parent Line (Convergence during merge) */}
                      {c.parent2Id && nodeCoords[c.parent2Id] && (
                        <motion.path
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1, d: `M ${nodeCoords[c.parent2Id].x} ${nodeCoords[c.parent2Id].y} C ${(nodeCoords[c.parent2Id].x + child.x) / 2} ${nodeCoords[c.parent2Id].y}, ${(nodeCoords[c.parent2Id].x + child.x) / 2} ${child.y}, ${child.x} ${child.y}` }}
                          transition={{ duration: 0.6, ease: "easeOut" }}
                          fill="none"
                          stroke={c.branch === 'main' ? '#f59e0b' : (c.branch === 'feature' ? '#0ea5e9' : '#d946ef')}
                          strokeWidth="4"
                          strokeDasharray={remoteCommits.includes(c.id) ? 'none' : '5,4'}
                        />
                      )}
                    </g>
                  );
                })}

                {/* Commits (Large Animated Circles with High-Contrast Text Labels) */}
                {commits.map((c) => {
                  const node = nodeCoords[c.id];
                  if (!node) return null;
                  const isHeadCommit = branches[activeBranch] === c.id;
                  const isPushed = remoteCommits.includes(c.id);

                  return (
                    <g 
                      key={`node-${c.id}`} 
                      className="cursor-pointer group"
                      onClick={() => addLog(`commit ${c.sha} | message: "${c.message}" | branch: ${c.branch} | modified: ${c.files.join(', ') || 'none'}`)}
                      onMouseEnter={() => setHoveredNode(c)}
                      onMouseLeave={() => setHoveredNode(null)}
                    >
                      {/* Ring highlight animation if HEAD */}
                      {isHeadCommit && (
                        <circle cx={node.x} cy={node.y} r="28" fill="none" stroke="#ef4444" strokeWidth="2.5" className="animate-ping opacity-45" />
                      )}

                      <motion.circle
                        layout
                        initial={{ scale: 0 }}
                        animate={{ scale: 1, cx: node.x, cy: node.y }}
                        transition={{ type: 'spring', stiffness: 220, damping: 20 }}
                        r="21"
                        fill={c.branch === 'main' ? '#f59e0b' : (c.branch === 'feature' ? '#0ea5e9' : '#d946ef')}
                        stroke={isHeadCommit ? '#ef4444' : (isPushed ? '#22c55e' : '#666')}
                        strokeWidth="3.5"
                      />

                      {/* High-Contrast Commit label text */}
                      <motion.text
                        layout
                        animate={{ x: node.x, y: node.y + 3.5 }}
                        textAnchor="middle"
                        fill="#ffffff"
                        className="font-mono text-[9px] font-black select-none pointer-events-none drop-shadow-[0_1.5px_1.5px_rgba(0,0,0,0.95)]"
                      >
                        {c.label}
                      </motion.text>

                      {/* Hover title tooltip */}
                      <title>{`[Commit SHA: ${c.sha}] "${c.message}" (${c.branch})`}</title>
                    </g>
                  );
                })}

                {/* Branch references tags sliding smoothly */}
                {Object.entries(branches).map(([bName, cId]) => {
                  const node = nodeCoords[cId];
                  if (!node) return null;
                  const isActive = bName === activeBranch;

                  return (
                    <motion.g
                      key={`ref-${bName}`}
                      layout
                      animate={{ x: node.x - 30, y: node.y - 38 }}
                      transition={{ type: 'spring', stiffness: 180, damping: 18 }}
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredBranch({ name: bName, commitId: cId })}
                      onMouseLeave={() => setHoveredBranch(null)}
                    >
                      <rect
                        width="60"
                        height="15"
                        rx="3"
                        fill={isActive ? '#ef4444' : '#262626'}
                        stroke={isActive ? '#ef4444' : '#444'}
                        strokeWidth="1"
                      />
                      <text
                        x="30"
                        y="10"
                        textAnchor="middle"
                        fill="#fff"
                        className="font-mono text-[8px] font-bold select-none"
                      >
                        {isActive ? `*${bName}` : bName}
                      </text>
                    </motion.g>
                  );
                })}

                {/* Push packet sliding particle animation */}
                {isPushing && (
                  <motion.circle
                    initial={{ cx: pushSourceCoords.x, cy: pushSourceCoords.y, r: 8, fill: '#22c55e', opacity: 1 }}
                    animate={{ cx: 900, cy: 110, r: 2, opacity: 0.1 }}
                    transition={{ duration: 1.1, ease: "easeInOut" }}
                  />
                )}
              </svg>

              {/* Commit Graph Legend */}
              <div className="absolute bottom-2 left-2 flex items-center space-x-3 text-[8.5px] font-mono text-gray-400 bg-neutral-900/80 px-2 py-1.5 border border-neutral-800 rounded">
                <div className="flex items-center space-x-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
                  <span>main</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-sky-500"></span>
                  <span>feature</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-fuchsia-500"></span>
                  <span>bugfix</span>
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

            {/* Right 1/4 SDE Live Inspector Panel */}
            <div className="xl:col-span-1 bg-neutral-900/40 border border-neutral-800 rounded-xl p-5 flex flex-col justify-between min-h-[220px]">
              <div>
                <h3 className="text-xs font-black text-amber-500 uppercase tracking-widest font-mono border-b border-neutral-800 pb-2 mb-3">
                  🔍 Live Inspector
                </h3>
                
                <AnimatePresence mode="wait">
                  {hoveredNode ? (
                    <motion.div
                      key={`inspect-node-${hoveredNode.id}`}
                      initial={{ opacity: 0, x: 5 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -5 }}
                      className="space-y-3"
                    >
                      <div>
                        <span className="block text-[8px] font-mono uppercase tracking-wider text-gray-500">Selected Commit</span>
                        <span className="text-sm font-black text-white font-mono">{hoveredNode.label} ({hoveredNode.sha})</span>
                      </div>
                      <div>
                        <span className="block text-[8px] font-mono uppercase tracking-wider text-gray-500">Message</span>
                        <span className="text-xs text-gray-300 font-sans block italic">"{hoveredNode.message}"</span>
                      </div>
                      <div>
                        <span className="block text-[8px] font-mono uppercase tracking-wider text-gray-500">Scope Files</span>
                        <span className="text-xs font-mono text-amber-400">{hoveredNode.files.join(', ') || 'None (merge commit)'}</span>
                      </div>
                      <div className="pt-2 border-t border-neutral-800/80">
                        <span className="block text-[9px] font-bold text-gray-400">💡 What is a Commit Node?</span>
                        <p className="text-[10.5px] text-gray-500 leading-normal font-sans mt-0.5">
                          A Commit is an immutable snapshot in your git database. It points to a root Directory Tree and saves metadata (author, message, parent link) so your code state is safely cached.
                        </p>
                      </div>
                    </motion.div>
                  ) : hoveredBranch ? (
                    <motion.div
                      key={`inspect-branch-${hoveredBranch.name}`}
                      initial={{ opacity: 0, x: 5 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -5 }}
                      className="space-y-3"
                    >
                      <div>
                        <span className="block text-[8px] font-mono uppercase tracking-wider text-gray-500">Branch Name</span>
                        <span className="text-sm font-black text-sky-400 font-mono">refs/heads/{hoveredBranch.name}</span>
                      </div>
                      <div>
                        <span className="block text-[8px] font-mono uppercase tracking-wider text-gray-500">Points to Hash</span>
                        <span className="text-xs text-gray-300 font-mono block">{hoveredBranch.commitId.replace('c_', '')}</span>
                      </div>
                      <div className="pt-2 border-t border-neutral-800/80">
                        <span className="block text-[9px] font-bold text-gray-400">💡 What is a Branch pointer?</span>
                        <p className="text-[10.5px] text-gray-500 leading-normal font-sans mt-0.5">
                          In Git, a branch is NOT a directory or copy of code files. It is simply a lightweight, movable 40-character text pointer pointing to a commit hash. Switching branches swaps HEAD to point here.
                        </p>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="inspect-default"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-3.5"
                    >
                      <span className="block text-[10px] font-bold text-neutral-500 dark:text-neutral-400 font-mono">Visual commit helper:</span>
                      <ul className="text-[10.5px] text-gray-500 space-y-2 list-disc pl-3 font-sans leading-relaxed">
                        <li><strong>Commit Circle:</strong> Represents a saved file snapshot.</li>
                        <li><strong>Lines:</strong> Visual parent-child lineage paths.</li>
                        <li><strong>Branch Tag:</strong> Movable pointers to specific commits.</li>
                        <li><strong>Red Glow:</strong> HEAD (current active editor checkout commit).</li>
                      </ul>
                      <p className="text-[9.5px] text-gray-650 italic mt-3">
                        👉 Hover over any Commit node or Branch tag inside the graph to inspect metadata!
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
            
          </div>
        </div>

        {/* 2. GITHUB REMOTE PORTAL (origin) */}
        <div className="mt-4 p-4 bg-green-500/[0.02] border border-green-500/10 rounded-xl flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-500/10 rounded-lg border border-green-500/20 text-green-500">
              <Share2 className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[9px] font-black text-green-500 uppercase tracking-widest font-mono">☁️ GitHub Remote Portal (origin)</span>
              <p className="text-[11px] text-gray-600 dark:text-gray-400 mt-0.5">
                Target upstream: <code className="text-[10px] text-green-600 dark:text-green-400 select-all">https://github.com/subh9m/PatternForge.git</code>
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

        {/* 3. WORKING DIRECTORY & STAGING INDEX */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          
          {/* File Explorer (Left sidebar in Directory Panel) */}
          <div className="bg-white/80 dark:bg-neutral-950/20 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-900 rounded-xl p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 dark:border-neutral-900 pb-2 mb-3">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest font-mono">📂 File Explorer</span>
                <span className="h-2 w-2 rounded-full bg-blue-500"></span>
              </div>
              
              <div className="space-y-2">
                {files.map((file, idx) => {
                  const isSelected = file.name === selectedFile;
                  let statusColor = 'text-gray-400';
                  let borderStyle = isSelected ? 'border-amber-500 bg-amber-500/[0.04]' : 'border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 bg-white/40 dark:bg-black/30';
                  
                  if (file.status === 'modified') statusColor = 'text-red-500';
                  if (file.status === 'staged') statusColor = 'text-green-500';
                  
                  return (
                    <motion.div 
                      key={idx} 
                      onClick={() => setSelectedFile(file.name)}
                      className={`p-3 border rounded-xl flex items-center justify-between cursor-pointer hover:border-amber-500/40 transition-all ${borderStyle}`}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-xs">📄</span>
                        <span className="font-mono text-xs font-bold text-neutral-700 dark:text-neutral-300">{file.name}</span>
                      </div>
                      <span className={`text-[8.5px] font-mono font-bold uppercase tracking-wider ${statusColor}`}>
                        {file.status}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-dashed border-neutral-200 dark:border-neutral-800 dark:border-neutral-900 grid grid-cols-2 gap-2">
              <button
                onClick={() => handleGitAdd(selectedFile)}
                className="flex items-center justify-center space-x-1 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-mono font-bold cursor-pointer transition-colors shadow-sm"
              >
                <span>Stage file</span>
              </button>
              <button
                onClick={() => handleGitAdd('.')}
                className="flex items-center justify-center space-x-1 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-500 rounded-lg text-xs font-mono font-bold cursor-pointer transition-colors"
              >
                <span>Stage All</span>
              </button>
            </div>
          </div>

          {/* Interactive Code Editor (Center pane in Directory Panel) */}
          <div className="bg-white/80 dark:bg-neutral-950/20 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-900 rounded-xl p-4 flex flex-col justify-between min-h-[220px]">
            <div>
              <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 dark:border-neutral-900 pb-2 mb-3">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest font-mono">📝 Code Editor: {selectedFile}</span>
                <span className="text-[8px] font-mono text-gray-400 uppercase">Write actual code here</span>
              </div>

              {/* Styled Textarea styled like an SDE code editor */}
              <div className="relative">
                <textarea
                  value={currentSelectedFileObj.currentContent}
                  onChange={handleCodeChange}
                  rows={6}
                  className="w-full p-3 bg-neutral-950 text-green-400 font-mono text-xs border border-neutral-900 rounded-lg focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 leading-relaxed overflow-y-auto whitespace-pre"
                />
              </div>
            </div>

            <div className="mt-2 text-[9.5px] font-mono text-gray-400 flex items-center justify-between">
              <span>Status: {currentSelectedFileObj.status === 'modified' ? '🔴 Unsaved changes' : '🟢 Saved & Clean'}</span>
              {currentSelectedFileObj.status === 'modified' && (
                <button
                  onClick={() => {
                    setFiles(prev => prev.map(f => f.name === selectedFile ? { ...f, currentContent: f.originalContent, status: 'clean' } : f));
                    addLog(`$ git restore ${selectedFile}`);
                  }}
                  className="text-[9.5px] text-red-500 hover:text-red-600 font-bold underline cursor-pointer"
                >
                  Discard edits
                </button>
              )}
            </div>
          </div>

          {/* Staging Index (Right pane in Directory Panel) */}
          <div className="bg-white/80 dark:bg-neutral-950/20 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-900 rounded-xl p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 dark:border-neutral-900 pb-2 mb-3">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest font-mono">📦 Staging Area (Index)</span>
                <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
              </div>

              <AnimatePresence>
                {stagingArea.length > 0 ? (
                  <div className="space-y-2">
                    {stagingArea.map((name) => (
                      <motion.div 
                        key={name}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="flex items-center justify-between p-2.5 bg-green-500/[0.05] border border-green-500/20 text-green-500 rounded-lg"
                      >
                        <span className="font-mono text-xs font-bold">{name}</span>
                        <span className="text-[8px] font-mono font-bold text-green-400/80 uppercase">Staged</span>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-28 text-center border border-dashed border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 rounded-lg">
                    <span className="text-xl">🧺</span>
                    <span className="text-[10px] font-mono text-gray-400 mt-1">Staging index empty</span>
                  </div>
                )}
              </AnimatePresence>
            </div>

            {stagingArea.length > 0 && (
              <div className="mt-4 pt-3 border-t border-dashed border-neutral-200 dark:border-neutral-800 dark:border-neutral-900 space-y-2">
                <input
                  type="text"
                  id="commitMsg"
                  placeholder="Enter commit message..."
                  defaultValue="Modify config structure"
                  className="w-full px-2.5 py-1.5 text-xs bg-gray-150 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 rounded-lg font-mono text-neutral-800 dark:text-neutral-300 focus:outline-none"
                />
                <button
                  onClick={() => {
                    const val = document.getElementById('commitMsg')?.value || 'Modify config structure';
                    handleGitCommit(val);
                  }}
                  className="w-full flex items-center justify-center space-x-2 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-mono font-black cursor-pointer transition-all duration-150 shadow-sm"
                >
                  <span>git commit -m</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* QUICK COMMAND ACTION & GLOSSARY CHEAT BOX */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* INTERACTIVE GLOSSARY / COMMAND TIPS */}
        <div className="bg-white/80 dark:bg-neutral-950/70 backdrop-blur-md border border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest font-mono mb-3">
              💡 Command Tooltips
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-4">
              Hover over any command helper below to reveal its exact technical functionality:
            </p>
            
            <div className="space-y-1.5 overflow-y-auto max-h-56 pr-1">
              {Object.entries(COMMAND_HELP).map(([cmd, definition], idx) => (
                <div 
                  key={idx} 
                  className="p-2 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-900 hover:border-amber-500/20 bg-gray-50/30 dark:bg-black/30 rounded-lg group transition-all"
                >
                  <code className="text-[10.5px] font-mono font-black text-amber-500">{cmd}</code>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-normal font-sans mt-0.5 select-none hidden group-hover:block transition-all animate-fadeIn">
                    {definition}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* TERMINAL INTERACTIVE TERMINAL */}
        <div className="col-span-1 lg:col-span-2 bg-neutral-950 border border-neutral-800 rounded-2xl p-4 shadow-2xl flex flex-col justify-between font-mono text-xs h-[300px]">
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
                if (log.includes('rebase') && !log.startsWith('$')) textClass = 'text-blue-400';
                if (log.includes('merge') && !log.startsWith('$')) textClass = 'text-purple-400';
                
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
              placeholder="Type 'help' for options (e.g. git add ., git commit -m 'message', git merge feature)..."
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

      {/* QUICK ACTIONS PANEL (Merges & Rebases quick test triggers) */}
      <div className="bg-white/80 dark:bg-neutral-950/70 backdrop-blur-md border border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 rounded-2xl p-6 shadow-lg">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest font-mono mb-4 flex items-center space-x-1.5">
          <GitBranch className="h-4 w-4 text-amber-500" />
          <span>Quick Branch Merges & Rebases Sandbox Triggers</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <button
            onClick={() => handleGitBranch('feature')}
            className="flex items-center justify-center space-x-2 py-2 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-gray-200 hover:text-white rounded-lg text-xs font-mono font-bold cursor-pointer transition-colors"
          >
            <span>🌿 Create Branch 'feature'</span>
          </button>

          <button
            onClick={() => handleGitSwitch('feature')}
            className="flex items-center justify-center space-x-2 py-2 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-gray-200 hover:text-white rounded-lg text-xs font-mono font-bold cursor-pointer transition-colors"
          >
            <span>🔀 Switch to 'feature'</span>
          </button>

          <button
            onClick={() => handleGitSwitch('main')}
            className="flex items-center justify-center space-x-2 py-2 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-gray-200 hover:text-white rounded-lg text-xs font-mono font-bold cursor-pointer transition-colors"
          >
            <span>🔀 Switch to 'main'</span>
          </button>

          <button
            onClick={() => handleGitMerge('feature')}
            className="flex items-center justify-center space-x-2 py-2 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 text-purple-400 rounded-lg text-xs font-mono font-bold cursor-pointer transition-colors"
            title="Merge 'feature' branch into current branch context"
          >
            <span>🧬 Merge 'feature'</span>
          </button>

          <button
            onClick={() => handleGitRebase('main')}
            className="flex items-center justify-center space-x-2 py-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-400 rounded-lg text-xs font-mono font-bold cursor-pointer transition-colors"
            title="Rebase current branch onto tip of 'main'"
          >
            <span>🏹 Rebase onto 'main'</span>
          </button>

          <button
            onClick={() => handleGitRebase('feature')}
            className="flex items-center justify-center space-x-2 py-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-400 rounded-lg text-xs font-mono font-bold cursor-pointer transition-colors"
            title="Rebase current branch onto tip of 'feature'"
          >
            <span>🏹 Rebase onto 'feature'</span>
          </button>

          <button
            onClick={handleGitResetHard}
            className="flex items-center justify-center space-x-2 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-500 rounded-lg text-xs font-mono font-bold cursor-pointer transition-colors"
          >
            <span>💥 Reset --hard HEAD~1</span>
          </button>

          <button
            onClick={handleGitPush}
            className="flex items-center justify-center space-x-2 py-2 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 text-green-400 rounded-lg text-xs font-mono font-bold cursor-pointer transition-colors"
          >
            <span>📤 Git Push origin</span>
          </button>
        </div>
      </div>
    </div>
  );
}
