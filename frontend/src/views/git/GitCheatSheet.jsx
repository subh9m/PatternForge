import React, { useState } from 'react';
import { Search, Copy, Check, Terminal, Settings, GitBranch, Eye, Share2, ShieldAlert, FolderMinus } from 'lucide-react';

const CATEGORIES = [
  { id: 'all', label: 'All Commands', icon: Terminal },
  { id: 'setup', label: 'Setup & Config', icon: Settings },
  { id: 'snapshot', label: 'Stage & Commit', icon: FolderMinus },
  { id: 'branch', label: 'Branch & Merge', icon: GitBranch },
  { id: 'inspect', label: 'Inspect & Compare', icon: Eye },
  { id: 'share', label: 'Share & Update', icon: Share2 },
  { id: 'advanced', label: 'History & Stash', icon: ShieldAlert },
];

const COMMANDS = [
  {
    cmd: 'git config --global user.name "First Last"',
    desc: 'Configure the username globally for all your commits.',
    layman: 'Tell Git who you are so your contributions are labeled with your name.',
    category: 'setup'
  },
  {
    cmd: 'git config --global user.email "email@example.com"',
    desc: 'Configure the email address associated with your commits.',
    layman: 'Connect your commits to your GitHub profile email to show up on your contribution graph.',
    category: 'setup'
  },
  {
    cmd: 'git config --global color.ui auto',
    desc: 'Enable automatic coloring of command line outputs for better readability.',
    layman: 'Make logs, branches, and diff outputs colorful and easier to scan.',
    category: 'setup'
  },
  {
    cmd: 'git config --global core.excludesfile [file]',
    desc: 'Set a global ignore file template for all local repositories on this machine.',
    layman: 'Setup rules to ignore files like .DS_Store or system logs across all your projects.',
    category: 'setup'
  },
  {
    cmd: 'git init',
    desc: 'Initialize a new local Git repository by creating a hidden .git directory.',
    layman: 'Create an empty tracking ledger inside your folder so you can start recording changes.',
    category: 'setup'
  },
  {
    cmd: 'git clone [url]',
    desc: 'Clone (copy) a remote repository locally, setting up tracking branch relations.',
    layman: 'Download a complete copy of an online project with all its folders, files, and edit history.',
    category: 'setup'
  },
  {
    cmd: 'git status',
    desc: 'Show status of working directory: modified, staged, and untracked files.',
    layman: 'See what files you are currently editing, what is ready to be committed, and what Git is ignoring.',
    category: 'snapshot'
  },
  {
    cmd: 'git add [file]',
    desc: 'Stage modifications or new files, preparing them for the next commit snapshot.',
    layman: 'Put your changed files into the staging basket, getting them ready to be locked into history.',
    category: 'snapshot'
  },
  {
    cmd: 'git add .',
    desc: 'Stage all modified, deleted, and untracked files in the current directory.',
    layman: 'Put every single modification on your workbench into the staging area in one go.',
    category: 'snapshot'
  },
  {
    cmd: 'git reset [file]',
    desc: 'Unstage a file, keeping the actual modifications intact on your disk.',
    layman: 'Take a file out of the staging basket because you changed your mind, without losing your work.',
    category: 'snapshot'
  },
  {
    cmd: 'git diff',
    desc: 'Show file changes made in your working directory that are not staged.',
    layman: 'Compare your active edits with the last saved state to see exactly what lines were added/deleted.',
    category: 'snapshot'
  },
  {
    cmd: 'git diff --staged',
    desc: 'Show file changes staged for your next commit (difference between Staging index and HEAD).',
    layman: 'Review the modifications waiting inside your staging basket before you finalize the commit.',
    category: 'snapshot'
  },
  {
    cmd: 'git commit -m "[message]"',
    desc: 'Record a snapshot of the staged changes in the local repository history.',
    layman: 'Lock in your staged modifications, add a short descriptive message, and assign a unique hash tag.',
    category: 'snapshot'
  },
  {
    cmd: 'git commit --amend -m "[new-message]"',
    desc: 'Replace the last commit (HEAD) with your current staged modifications and update message.',
    layman: 'Fix a typo or add missed changes to your very last commit without creating a brand new one.',
    category: 'snapshot'
  },
  {
    cmd: 'git rm [file]',
    desc: 'Delete file from working directory and stage the removal in Git.',
    layman: 'Erase a file from your folder and tell Git to stop tracking it in the next commit.',
    category: 'snapshot'
  },
  {
    cmd: 'git rm --cached [file]',
    desc: 'Unrack a file in Git but keep the file physically on your local disk.',
    layman: 'Tell Git to stop tracking changes on a file, but keep it on your laptop (good for secrets or logs).',
    category: 'snapshot'
  },
  {
    cmd: 'git mv [src] [dest]',
    desc: 'Rename or move a file/directory on disk, staging the relocation immediately.',
    layman: 'Relocate a file to a new folder and update Git’s tracker index in a single step.',
    category: 'snapshot'
  },
  {
    cmd: 'git branch',
    desc: 'List all local branches in the repository. The active branch is starred (*).',
    layman: 'Show all alternate development paths available, highlighting the one you are currently working in.',
    category: 'branch'
  },
  {
    cmd: 'git branch [branch-name]',
    desc: 'Create a new branch pointer pointing to the current commit.',
    layman: 'Spawn a new alternate timeline starting from your current code state.',
    category: 'branch'
  },
  {
    cmd: 'git switch [branch]',
    desc: 'Switch the HEAD pointer to the specified branch, updating working directory files.',
    layman: 'Hop over to an alternate timeline, swapping the files on your desktop to match that branch.',
    category: 'branch'
  },
  {
    cmd: 'git switch -c [branch-name]',
    desc: 'Create a new branch and immediately switch to it in a single command.',
    layman: 'Create a new development timeline and jump straight into it in one swift action.',
    category: 'branch'
  },
  {
    cmd: 'git merge [branch]',
    desc: 'Integrate commits from the target branch into the current active branch.',
    layman: 'Combine work from another branch into your current branch, resolving any conflicts manually.',
    category: 'branch'
  },
  {
    cmd: 'git branch -d [branch-name]',
    desc: 'Delete a local branch. Fails if the branch has unmerged changes.',
    layman: 'Clean up and delete a branch that you are done with, keeping things safe from accidental code loss.',
    category: 'branch'
  },
  {
    cmd: 'git branch -D [branch-name]',
    desc: 'Forcibly delete a local branch, discarding all unmerged changes.',
    layman: 'Purge a branch completely, even if it contains experimental code that was never merged.',
    category: 'branch'
  },
  {
    cmd: 'git log',
    desc: 'Show commit history list for the active branch in reverse chronological order.',
    layman: 'Open the history journal to see a list of all commits, their authors, dates, and messages.',
    category: 'inspect'
  },
  {
    cmd: 'git log --oneline --graph --all',
    desc: 'Display a compact, text-based visual tree diagram of all commits and branches.',
    layman: 'Visualize how your branches diverge and merge together in a neat, color-coded ascii tree map.',
    category: 'inspect'
  },
  {
    cmd: 'git log branchB..branchA',
    desc: 'List commits present on branchA that are not present on branchB.',
    layman: 'See what new work has been done on branchA since it split off from branchB.',
    category: 'inspect'
  },
  {
    cmd: 'git log --follow [file]',
    desc: 'Show commits that modified the specified file, even tracking across renames.',
    layman: 'Trace the complete origin story of a single file, even if it was moved or renamed in the past.',
    category: 'inspect'
  },
  {
    cmd: 'git diff branchB...branchA',
    desc: 'Show differences between the common ancestor of branchB and branchA and branchA.',
    layman: 'See what changes were introduced in branchA since it diverged from branchB, ignoring main changes.',
    category: 'inspect'
  },
  {
    cmd: 'git show [SHA]',
    desc: 'Show detailed metadata and code line additions/deletions for a specific commit.',
    layman: 'Zoom in on a specific commit node to inspect exactly what lines of code were modified.',
    category: 'inspect'
  },
  {
    cmd: 'git blame [file]',
    desc: 'Annotate each line of a file with the commit hash, author, and timestamp.',
    layman: 'See exactly who wrote or modified every single line of a file, and in which commit.',
    category: 'inspect'
  },
  {
    cmd: 'git remote add [alias] [url]',
    desc: 'Link your local repository to a remote repository URL using an alias name.',
    layman: 'Save an address bookmark (usually named "origin") pointing to your GitHub cloud repository.',
    category: 'share'
  },
  {
    cmd: 'git fetch [remote]',
    desc: 'Download all history, references, and objects from the remote database, without merging.',
    layman: 'Check the cloud mailbox to download new branches and commits, without touching your current code files.',
    category: 'share'
  },
  {
    cmd: 'git pull',
    desc: 'Fetch remote updates and immediately merge them into your active branch (fetch + merge).',
    layman: 'Fetch updates from the cloud repository and merge them directly into your editor files.',
    category: 'share'
  },
  {
    cmd: 'git push [remote] [branch]',
    desc: 'Upload local commits of the active branch to the specified remote repository branch.',
    layman: 'Send your newly completed commits up to the cloud repository to share them with your team.',
    category: 'share'
  },
  {
    cmd: 'git push -u origin [branch]',
    desc: 'Push local branch and configure it to track its upstream remote counterpart.',
    layman: 'Publish your local branch to GitHub for the first time and establish a permanent linking tracker.',
    category: 'share'
  },
  {
    cmd: 'git rebase [branch]',
    desc: 'Reposition the entire commit sequence of the current branch onto the tip of the target branch.',
    layman: 'Rewrite history by moving your feature commits so they start directly at the very latest main commit.',
    category: 'advanced'
  },
  {
    cmd: 'git reset --soft HEAD~1',
    desc: 'Undo the last commit locally, keeping all files and changes staged in your index.',
    layman: 'Un-commit your last package, but keep all your edited code staged in the basket so you can re-edit it.',
    category: 'advanced'
  },
  {
    cmd: 'git reset --hard HEAD~1',
    desc: 'Undo the last commit and completely wipe out all working directory and index modifications.',
    layman: 'Erase your last commit and delete all active code changes on your disk, resetting back to the parent commit.',
    category: 'advanced'
  },
  {
    cmd: 'git restore [file]',
    desc: 'Discard unstaged modifications in your working directory for the specified file.',
    layman: 'Undo all edits made to a file since your last commit or stage, reverting it back to a clean state.',
    category: 'advanced'
  },
  {
    cmd: 'git revert [SHA]',
    desc: 'Create a brand new commit that reverses the exact changes of a targeted historic commit.',
    layman: 'Safely undo a past commit by committing an "opposite" change, preserving historical commit hashes.',
    category: 'advanced'
  },
  {
    cmd: 'git reflog',
    desc: 'Show a local log of all reference changes (HEAD branch switches, commits, resets).',
    layman: 'View Git’s secret flight recorder. Indispensable for recovering commits deleted by hard resets.',
    category: 'advanced'
  },
  {
    cmd: 'git stash',
    desc: 'Temporarily shelve dirty working directory changes, reverting working directory to clean HEAD.',
    layman: 'Put your unfinished edits into a drawer so you have a clean slate to switch branches and work on other tasks.',
    category: 'advanced'
  },
  {
    cmd: 'git stash list',
    desc: 'List all currently stored stashes in your local repository stack.',
    layman: 'See what unfinished change packets you have stored in your temporary workbench drawers.',
    category: 'advanced'
  },
  {
    cmd: 'git stash pop',
    desc: 'Remove the top stash from the stack and apply its changes to your working directory.',
    layman: 'Retrieve your unfinished edits from the top drawer, apply them to your files, and clear the drawer.',
    category: 'advanced'
  },
  {
    cmd: 'git stash drop',
    desc: 'Permanently discard the top stash from your local repository stash stack.',
    layman: 'Delete the stored stash packet from your drawer without applying its changes.',
    category: 'advanced'
  }
];

export default function GitCheatSheet() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedCmd, setCopiedCmd] = useState('');

  const handleCopy = (cmd) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(cmd);
    setTimeout(() => setCopiedCmd(''), 2000);
  };

  const filteredCommands = COMMANDS.filter(c => {
    const matchesCategory = activeCategory === 'all' || c.category === activeCategory;
    const matchesSearch = c.cmd.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.layman.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-white/80 dark:bg-neutral-950/70 backdrop-blur-md border border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 rounded-2xl p-6 md:p-8 shadow-lg">
        <h1 className="text-2xl font-black text-gray-900 dark:text-white font-mono uppercase tracking-wide">
          📋 Interactive SDE Git Cheat Sheet
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 font-light leading-relaxed">
          Quick-reference card listing the most important Git command invocations. Use this index to study command signatures, search by keyword, view simple analogies, and copy syntaxes to your clipboard.
        </p>

        {/* Search Input */}
        <div className="mt-6 relative max-w-xl">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search commands, definitions, or analogies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 rounded-xl text-sm font-mono text-neutral-800 dark:text-neutral-200 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all duration-150"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORIES.map(cat => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center space-x-2 px-4 py-2 border rounded-full text-xs font-mono font-bold whitespace-nowrap cursor-pointer transition-all duration-200
                ${isActive 
                  ? 'bg-amber-500/10 text-amber-500 border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.1)]' 
                  : 'bg-white/40 border-neutral-200 dark:border-neutral-800 hover:border-amber-500/30 text-gray-700 dark:bg-black/40 dark:border-neutral-800 dark:text-gray-300 dark:hover:text-amber-500'
                }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Commands Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredCommands.length > 0 ? (
          filteredCommands.map((item, idx) => {
            const isCopied = copiedCmd === item.cmd;
            return (
              <div
                key={idx}
                className="bg-white/80 dark:bg-neutral-950/70 backdrop-blur-md border border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 rounded-xl p-5 shadow-sm hover:shadow-[0_0_20px_rgba(245,158,11,0.06)] hover:border-amber-500/20 transition-all duration-350 flex flex-col justify-between"
              >
                <div>
                  {/* Command Row */}
                  <div className="flex items-start justify-between gap-3">
                    <code className="text-sm font-mono font-black text-amber-600 dark:text-amber-400 bg-amber-500/[0.04] dark:bg-amber-500/[0.03] px-2.5 py-1.5 rounded-lg border border-amber-500/10 select-all break-all">
                      {item.cmd}
                    </code>
                    <button
                      onClick={() => handleCopy(item.cmd)}
                      className={`p-1.5 rounded-lg border transition-all duration-150 cursor-pointer flex-shrink-0
                        ${isCopied 
                          ? 'bg-green-500/10 border-green-500/30 text-green-500' 
                          : 'bg-gray-50 border-neutral-200 dark:border-neutral-800 text-gray-400 hover:text-amber-500 hover:border-amber-500/30 dark:bg-neutral-900 dark:border-neutral-800'
                        }`}
                      title="Copy command to clipboard"
                    >
                      {isCopied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>

                  {/* Description */}
                  <p className="mt-4 text-[14px] md:text-[15px] text-gray-800 dark:text-gray-200 font-sans font-medium leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                {/* Layman Callout */}
                <div className="mt-4 pt-3.5 border-t border-dashed border-neutral-200 dark:border-neutral-800 dark:border-neutral-800">
                  <span className="block text-[9.5px] font-black text-gray-400 uppercase tracking-widest font-mono mb-1.5">
                    💡 Layman analogy
                  </span>
                  <p className="text-[13px] md:text-[14px] text-gray-600 dark:text-gray-405 font-sans italic leading-relaxed">
                    {item.layman}
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-12 text-center border border-dashed border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 rounded-2xl">
            <span className="text-2xl">🔍</span>
            <h3 className="mt-2 text-sm font-mono font-bold text-gray-600 dark:text-gray-400">
              No matching commands found
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Try search keywords like 'rebase', 'reset', 'stash', or change the active category tab.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
