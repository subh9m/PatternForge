export const gitConcepts = [
  {
    id: "git_basics_vcs",
    num: "GIT.1",
    title: "Introduction & Git vs GitHub",
    desc: "Understanding Version Control Systems (VCS), the history of Git, and key architectural differences between local version software and cloud hosting portals.",
    declaration: `// Git Basics & VCS Summary
- Local VCS: Local delta patches. High risk (disk failure = total loss).
- Centralized VCS (CVCS): Single master server (SVN, Perforce). Single point of failure, no offline work.
- Distributed VCS (DVCS): Every developer has a complete clone of the repository history (Git, Mercurial). Offline-safe, fast.
- Git: Local Command Line engine. GitHub: Remote Cloud hosting, pull request web UI, issues, actions.`,
    diagramUrl: "/images/git_vcs_types.png",
    methods: [
      { 
        method: "What is Version Control?", 
        syntax: "VCS Architecture Model", 
        params: "Tracking directories, file versions", 
        output: "Safe history, revision recovery", 
        complexity: "Git check: O(1) commit pointer reads", 
        desc: `Version Control systems coordinate and restore file histories over time.
<table class="prose-table">
  <thead>
    <tr><th>VCS Model</th><th>Data Storage Method</th><th>Single Point of Failure?</th><th>Offline Mode?</th></tr>
  </thead>
  <tbody>
    <tr><td>Local VCS</td><td>Patches/deltas stored on local disk</td><td>Yes (Local disk crash = dead)</td><td>Yes</td></tr>
    <tr><td>Centralized VCS (SVN)</td><td>Database on single central server</td><td>Yes (Server crash = all blocked)</td><td>No (Requires network)</td></tr>
    <tr><td>Distributed VCS (Git)</td><td>Full repository mirrors on every client</td><td>No (Any clone is a complete backup)</td><td>Yes (Full offline history)</td></tr>
  </tbody>
</table>`
      },
      { 
        method: "Git vs GitHub: Core Differences", 
        syntax: "Local CLI Tool vs Remote Cloud Portal", 
        params: "Executable software vs Hosting service", 
        output: "Repository tracking vs Repository hosting", 
        complexity: "Direct CLI processing vs Cloud API calls", 
        desc: `Comparison of Git and GitHub attributes.
<table class="prose-table">
  <thead>
    <tr><th>Feature</th><th>🛠️ Git (Local software)</th><th>☁️ GitHub (Cloud Hosting)</th></tr>
  </thead>
  <tbody>
    <tr><td>Nature</td><td>Command line program installed locally</td><td>Web-based platform hosting git repos</td></tr>
    <tr><td>Creator</td><td>Linus Torvalds (2005)</td><td>Microsoft (acquired in 2018)</td></tr>
    <tr><td>Core Role</td><td>Creates commits, branches, merges, track files</td><td>Hosts remote repos, provides PR UI, Actions, Issues</td></tr>
    <tr><td>Connectivity</td><td>Works completely offline</td><td>Requires active internet connection</td></tr>
    <tr><td>Alternatives</td><td>Mercurial, SVN, Perforce</td><td>GitLab, Bitbucket, Azure DevOps</td></tr>
  </tbody>
</table>`
      }
    ]
  },
  {
    id: "git_architecture_model",
    num: "GIT.2",
    title: "Git Architecture & Object Model",
    desc: "Understanding the four primary working zones in Git and how files are saved internally using SHA-1 hashing, Blobs, Trees, and Commits.",
    declaration: `// Git Architecture Cheat Sheet
- Working Directory: The actual files currently editable on your disk.
- Staging Area (Index): Draft file index specifying what will go into the next commit snapshot.
- Local Repository: The hidden .git folder housing all commit objects, refs, and hashes.
- Remote Repository: Cloud repository (origin) shared among teams on GitHub.`,
    diagramUrl: "/images/git_four_areas.png",
    methods: [
      { 
        method: "The Four Git Working Zones", 
        syntax: "Working -> Index -> Local Ref -> Remote Ref", 
        params: "File staging lifecycle operations", 
        output: "Synchronized project nodes", 
        complexity: "Transition calls: O(1) object references", 
        desc: `How data moves between areas in Git.
<table class="prose-table">
  <thead>
    <tr><th>Git Area</th><th>Logical Purpose</th><th>Typical Commands Triggered</th></tr>
  </thead>
  <tbody>
    <tr><td>Working Directory</td><td>Active sandboxed code files on local drive</td><td>IDE edits, file writes</td></tr>
    <tr><td>Staging Area (Index)</td><td>Staging table preparing next commit snapshot</td><td>git add, git restore --staged</td></tr>
    <tr><td>Local Repository</td><td>Immutable database containing historical commits</td><td>git commit, git reset, git rebase</td></tr>
    <tr><td>Remote Repository</td><td>Shared server repository in cloud</td><td>git push, git pull, git fetch</td></tr>
  </tbody>
</table>`
      },
      { 
        method: "Git Internal Objects Map", 
        syntax: "Blobs + Trees + Commits + Ref pointers", 
        params: "SHA-1 hashes, directory hierarchies", 
        output: "DAG (Directed Acyclic Graph) of snapshots", 
        complexity: "Lookup: O(1) hash table keys index", 
        desc: `Git does not store diffs; it stores snapshots using an elegant object graph:
<table class="prose-table">
  <thead>
    <tr><th>Object Type</th><th>Stored Attributes</th><th>Description</th></tr>
  </thead>
  <tbody>
    <tr><td>Blob (Binary Large)</td><td>File binary content bytes only</td><td>No filename or directory path stored here</td></tr>
    <tr><td>Tree</td><td>List of [Filename, Hash reference, Permissions]</td><td>Maps filenames to blobs or nested directories</td></tr>
    <tr><td>Commit</td><td>Root tree hash, parent commit hash, author info, timestamp</td><td>Points to root directory snapshot</td></tr>
    <tr><td>HEAD</td><td>Reference string pointing to active branch pointer</td><td>Usually points to refs/heads/main</td></tr>
  </tbody>
</table>
<br/>
<img src='/images/git_object_model.png' alt='Git Internal Object Model Graph' class='max-w-full my-3 rounded-lg border border-gray-250 dark:border-neutral-800 bg-neutral-950/10 p-2' />`
      }
    ]
  },
  {
    id: "git_setup_init",
    num: "GIT.3",
    title: "Repository Setup & Initialization",
    desc: "Installing Git, configuring global username and email signatures, and initiating empty workspaces or cloning remote repositories.",
    declaration: `// Repository Setup & Init Commands
- git config --global user.name "Your Name"
- git config --global user.email "email@example.com"
- git init: Creates hidden .git/ folder.
- git clone: Downloads full object database and checks out HEAD.`,
    diagramUrl: null,
    methods: [
      { 
        method: "Git Config and Initialization", 
        syntax: "git config / git init", 
        params: "User details, repository folder setup", 
        output: "Global config file (.gitconfig), local .git/", 
        complexity: "O(1) directory setup", 
        desc: `Initial setup and repository creation:
<table class="prose-table">
  <thead>
    <tr><th>Command</th><th>Purpose</th><th>Technical Working Details</th></tr>
  </thead>
  <tbody>
    <tr><td>git config --global user.name</td><td>Saves developer commit signature</td><td>Writes details to ~/.gitconfig globally</td></tr>
    <tr><td>git config --global user.email</td><td>Saves email identifier</td><td>Used by GitHub to match profile commits</td></tr>
    <tr><td>git init</td><td>Creates a brand new local repository</td><td>Creates a hidden .git/ directory holding config, refs, and objects</td></tr>
  </tbody>
</table>
<br/>
<b>Q: What happens if you run git init inside an existing Git repository?</b><br/>
It is safe. It will not destroy existing commits or overwrite files; it simply refreshes the `.git` directory config parameters.`
      },
      { 
        method: "Git Clone Options", 
        syntax: "git clone <url>", 
        params: "Remote repository address, local directory name", 
        output: "Complete mirror of remote database locally", 
        complexity: "Network download and checkout time", 
        desc: `Downloads existing remote repositories:
<table class="prose-table">
  <thead>
    <tr><th>Clone Variant</th><th>Command Syntax</th><th>Benefit / Performance Effect</th></tr>
  </thead>
  <tbody>
    <tr><td>Standard Clone</td><td><code>git clone &lt;url&gt;</code></td><td>Downloads entire commit history and all branches</td></tr>
    <tr><td>Single Branch Clone</td><td><code>git clone -b &lt;branch&gt; --single-branch &lt;url&gt;</code></td><td>Downloads only the specified branch (saves disk space & bandwidth)</td></tr>
    <tr><td>Shallow Clone</td><td><code>git clone --depth 1 &lt;url&gt;</code></td><td>Truncates history to last commit only (fastest for large legacy systems)</td></tr>
  </tbody>
</table>`
      }
    ]
  },
  {
    id: "git_tracking_changes",
    num: "GIT.4",
    title: "Tracking Changes & Commits",
    desc: "Staging modifications, checking workspace status, creating commit snapshots, moving, and removing tracked files.",
    declaration: `// Staging & Commits
- git status: Lists modified (unstaged), staged, and untracked files.
- git add <file>: Places file snapshot into index Staging Area.
- git commit -m "msg": Creates commit object with Staging snapshot details.
- git rm <file>: Deletes file from working directory and stages removal.`,
    diagramUrl: null,
    methods: [
      { 
        method: "Staging & Commits Lifecycle", 
        syntax: "git add / git commit", 
        params: "File paths, commit message tags", 
        output: "Staged index update -> new commit hash", 
        complexity: "O(1) staging updates", 
        desc: `Moving modifications from the local drive to historical records:
<table class="prose-table">
  <thead>
    <tr><th>Command</th><th>Transition Direction</th><th>Under-the-Hood Actions</th></tr>
  </thead>
  <tbody>
    <tr><td><code>git add &lt;file&gt;</code></td><td>Working Dir ➔ Staging Area</td><td>Compresses file, saves blob to .git/objects, updates index table</td></tr>
    <tr><td><code>git commit -m "msg"</code></td><td>Staging Area ➔ Local Repo</td><td>Generates Tree object mapping index files, creates Commit object pointing to Tree</td></tr>
    <tr><td><code>git commit -a -m "msg"</code></td><td>Working Dir ➔ Local Repo</td><td>Combines staging (for tracked files only) and committing in one step</td></tr>
  </tbody>
</table>
<br/>
<b>Q: What does --amend do during commits?</b><br/>
<code>git commit --amend -m "New message"</code> takes the current Staging Area contents and replaces the active 'HEAD' commit. It generates a completely new SHA-1 hash, effectively overwriting the last local commit.`
      },
      { 
        method: "Removing & Moving files (rm, mv)", 
        syntax: "git rm / git mv", 
        params: "Target files, destination paths", 
        output: "Staged file removal or relocation updates", 
        complexity: "O(1) index modifications", 
        desc: `Deletions and file relocations:
<table class="prose-table">
  <thead>
    <tr><th>Action</th><th>Command Syntax</th><th>Result in Working Dir & Staging</th></tr>
  </thead>
  <tbody>
    <tr><td>Remove Tracked File</td><td><code>git rm &lt;file&gt;</code></td><td>Deletes file from disk and stages the removal</td></tr>
    <tr><td>Unstage File Removal</td><td><code>git rm --cached &lt;file&gt;</code></td><td>Keeps file on local disk but stops tracking it in Git</td></tr>
    <tr><td>Move / Rename File</td><td><code>git mv &lt;src&gt; &lt;dest&gt;</code></td><td>Renames file on disk and stages the relocation in one step</td></tr>
  </tbody>
</table>`
      }
    ]
  },
  {
    id: "git_history_inspection",
    num: "GIT.5",
    title: "History & Code Inspection",
    desc: "Reviewing historical logs, calculating differences between files and branches, and tracing code authorship down to individual lines.",
    declaration: `// History Commands
- git log: Displays chronologically sorted commit graph parents.
- git diff: Compares working directory changes against Staging index.
- git show <hash>: Displays metadata and code changes of a specific commit.
- git blame <file>: Lists author and commit hash for each line of a file.`,
    diagramUrl: null,
    methods: [
      { 
        method: "Querying Logs and Histories", 
        syntax: "git log [options]", 
        params: "Search limits, formatting tags", 
        output: "Chronological lists of commits", 
        complexity: "O(N) traversal of commit parent links", 
        desc: `Viewing project history with filters:
<table class="prose-table">
  <thead>
    <tr><th>Goal</th><th>Command Syntax</th><th>Output Format</th></tr>
  </thead>
  <tbody>
    <tr><td>Short summary</td><td><code>git log --oneline</code></td><td>Displays hash prefix + commit message per line</td></tr>
    <tr><td>Visual Graph</td><td><code>git log --graph --all</code></td><td>Shows text-based branching tree diagrams</td></tr>
    <tr><td>Filter by Author</td><td><code>git log --author="Linus"</code></td><td>Displays commits authored by matching string</td></tr>
    <tr><td>Limit count</td><td><code>git log -n 5</code></td><td>Displays only the latest 5 commits</td></tr>
  </tbody>
</table>`
      },
      { 
        method: "Deltas and Authorship (diff, blame)", 
        syntax: "git diff / git blame", 
        params: "Files, commit SHAs", 
        output: "Line changes highlights, line-by-line author stamps", 
        complexity: "Diff calculation: O(N) string comparison", 
        desc: `Inspecting code changes and tracking down bugs:
<table class="prose-table">
  <thead>
    <tr><th>Inspection Command</th><th>Comparison Scope</th><th>Best Used For</th></tr>
  </thead>
  <tbody>
    <tr><td><code>git diff</code></td><td>Unstaged changes vs Staging Index</td><td>Reviewing modifications before running 'git add'</td></tr>
    <tr><td><code>git diff --staged</code></td><td>Staging Index vs Local Repo (HEAD)</td><td>Final review of staged changes before running 'git commit'</td></tr>
    <tr><td><code>git diff main..feature</code></td><td>Branch 'main' vs Branch 'feature'</td><td>Comparing changes between two branches</td></tr>
    <tr><td><code>git blame &lt;file&gt;</code></td><td>Line-by-line list of file with author/hash</td><td>Finding who introduced a bug or modified a config line</td></tr>
  </tbody>
</table>`
      }
    ]
  },
  {
    id: "git_branching_navigation",
    num: "GIT.6",
    title: "Branching & Navigation",
    desc: "Creating isolated environments, renaming and deleting branches, and switching the working directory HEAD pointers safely.",
    declaration: `// Branching & Head Navigation
- git branch <name>: Creates new branch pointer pointing to current HEAD commit.
- git switch <name>: Points HEAD to target branch, updating working directory files.
- git switch -c <name>: Creates and switches to new branch in one step.
- git branch -d <name>: Deletes a local branch (safeguards check).`,
    diagramUrl: null,
    methods: [
      { 
        method: "Branch Creation and Management", 
        syntax: "git branch [options]", 
        params: "Branch names, source commits", 
        output: "Created, renamed, or deleted references", 
        complexity: "O(1) reference file write", 
        desc: `Managing branch pointers:
<table class="prose-table">
  <thead>
    <tr><th>Action</th><th>Command Syntax</th><th>Safety constraints / Rules</th></tr>
  </thead>
  <tbody>
    <tr><td>List branches</td><td><code>git branch</code></td><td>Lists local branches; active branch highlighted with '*'</td></tr>
    <tr><td>Create branch</td><td><code>git branch &lt;name&gt;</code></td><td>Creates new pointer file at current commit; does not change branch</td></tr>
    <tr><td>Delete (Safe)</td><td><code>git branch -d &lt;name&gt;</code></td><td>Fails if branch has unmerged changes to prevent code loss</td></tr>
    <tr><td>Delete (Force)</td><td><code>git branch -D &lt;name&gt;</code></td><td>Forcibly deletes branch, discarding unmerged changes</td></tr>
  </tbody>
</table>`
      },
      { 
        method: "Navigating Branches & Detached HEAD", 
        syntax: "git switch <target>", 
        params: "Branch name or commit SHA hash", 
        output: "HEAD pointer reassignment, disk files update", 
        complexity: "O(1) pointer updates + disk write time", 
        desc: `Switching workspaces and the "Detached HEAD" trap:
<table class="prose-table">
  <thead>
    <tr><th>Navigation Goal</th><th>Command Syntax</th><th>HEAD Pointer Behavior</th></tr>
  </thead>
  <tbody>
    <tr><td>Switch Branch</td><td><code>git switch &lt;branch-name&gt;</code></td><td>HEAD points to branch name (e.g., main), updates disk files</td></tr>
    <tr><td>Create and Switch</td><td><code>git switch -c &lt;new-branch&gt;</code></td><td>Creates new branch name, points HEAD to it, and switches to it</td></tr>
    <tr><td>Checkout SHA Commit</td><td><code>git switch --detach &lt;commit-sha&gt;</code></td><td><b>Detached HEAD!</b> HEAD points directly to a commit hash instead of a branch name</td></tr>
  </tbody>
</table>
<br/>
<b>⚠️ Warning: What happens in a Detached HEAD state?</b><br/>
If you commit code in a Detached HEAD state, those commits are not tied to any branch. If you switch back to 'main', those new commits will be orphaned and eventually removed by Git's garbage collector. To save them, immediately run: 'git switch -c &lt;new-branch-name&gt;'.`
      }
    ]
  },
  {
    id: "git_integrating_changes",
    num: "GIT.7",
    title: "Integrating Changes",
    desc: "Merging diverged branches, rebasing commit histories, and cherry-picking individual commits to construct clean codebases.",
    declaration: `// Branch Integration Strategies
- git merge <branch>: Joins two branch histories with a new "Merge Commit".
- git rebase <branch>: Reposition base of current branch onto the tip of target.
- git cherry-pick <sha>: Copies one specific commit from another branch onto current HEAD.`,
    diagramUrl: "/images/git_object_model.png",
    methods: [
      { 
        method: "Integrating Code: Merge, Rebase, Cherry-Pick", 
        syntax: "git merge / git rebase / git cherry-pick", 
        params: "Source branch names, commit SHA hashes", 
        output: "Divergent branches integrated together", 
        complexity: "Merge: O(N) 3-way calculation. Rebase: O(N) commit replays.", 
        desc: `Comparing code integration strategies:
<table class="prose-table">
  <thead>
    <tr><th>Strategy</th><th>Command Syntax</th><th>Under-the-Hood action</th><th>Pros / Cons</th></tr>
  </thead>
  <tbody>
    <tr><td><b>Merge</b></td><td><code>git merge &lt;branch&gt;</code></td><td>Creates a new "Merge Commit" with two parent commits</td><td>Preserves true history; but creates cluttered commit logs</td></tr>
    <tr><td><b>Rebase</b></td><td><code>git rebase &lt;branch&gt;</code></td><td>Saves branch commits, updates base to target tip, replays commits</td><td>Clean linear history; but rewrites SHAs, dangerous if public</td></tr>
    <tr><td><b>Cherry-Pick</b></td><td><code>git cherry-pick &lt;sha&gt;</code></td><td>Applies changes of a single commit hash onto current HEAD</td><td>Highly targeted; but duplicates code changes under new hashes</td></tr>
  </tbody>
</table>`
      }
    ]
  },
  {
    id: "git_remote_sync",
    num: "GIT.8",
    title: "Remote Synchronization",
    desc: "Exchanging code with remote databases using pushes, pulls, and background fetching, and managing remote aliases.",
    declaration: `// Remote Synchronization Commands
- git remote add origin <url>: Links local repository to remote URL alias.
- git fetch <remote>: Downloads new objects without merging.
- git pull <remote> <branch>: Downloads and merges remote changes (fetch + merge).
- git push <remote> <branch>: Uploads local commits to remote server.`,
    diagramUrl: null,
    methods: [
      { 
        method: "Remote Aliases and Uploads (push)", 
        syntax: "git remote / git push", 
        params: "Remote alias (origin), branch names, flags", 
        output: "Local commits uploaded to remote database", 
        complexity: "Network transaction and compression packet transfers", 
        desc: `Configuring remotes and uploading code:
<table class="prose-table">
  <thead>
    <tr><th>Action</th><th>Command Syntax</th><th>Technical detail</th></tr>
  </thead>
  <tbody>
    <tr><td>Link Remote</td><td><code>git remote add origin &lt;url&gt;</code></td><td>Creates tracking alias named "origin" pointing to target URL</td></tr>
    <tr><td>Push (First time)</td><td><code>git push -u origin &lt;branch&gt;</code></td><td>Uploads commits and configures upstream tracking relationship</td></tr>
    <tr><td>Standard Push</td><td><code>git push</code></td><td>Uploads local commits of active branch to its tracked upstream remote</td></tr>
    <tr><td>Force Push</td><td><code>git push --force</code></td><td>Overwrites remote branch commits with local history. <b>Dangerous!</b> Can delete teammates' work.</td></tr>
  </tbody>
</table>`
      },
      { 
        method: "Remote Downloads: Pull vs Fetch", 
        syntax: "git pull vs git fetch", 
        params: "Remote references (origin), branch sources", 
        output: "Remote data downloaded, locally merged (pull) or kept in refs (fetch)", 
        complexity: "Fetch: network speed. Pull: fetch + merge conflict checks", 
        desc: `Comparing Git's download commands:
<table class="prose-table">
  <thead>
    <tr><th>Metric</th><th>git fetch origin</th><th>git pull origin main</th></tr>
  </thead>
  <tbody>
    <tr><td>Core Action</td><td>Downloads remote commits to <code>refs/remotes/origin/*</code></td><td>Downloads and immediately merges remote changes into active branch</td></tr>
    <tr><td>Safety profile</td><td><b>100% Safe.</b> Does not touch your working directory files</td><td><b>Interactive.</b> Modifies disk files and can trigger merge conflicts</td></tr>
    <tr><td>Equation</td><td>Stand-alone background task</td><td><code>git pull = git fetch + git merge</code></td></tr>
  </tbody>
</table>`
      }
    ]
  },
  {
    id: "git_branching_strategies",
    num: "GIT.9",
    title: "Branching Strategies",
    desc: "Comparing workflow models used in software development: Git Flow, GitHub Flow, and Trunk-Based Development.",
    declaration: `// Development Workflows
- Git Flow: Multi-branch, strict lifecycle. Best for release cycles.
- GitHub Flow: Main + Feature branches. Best for Agile continuous deployment.
- Trunk-Based: Everyone commits directly to Main. Requires Feature Flags.`,
    diagramUrl: null,
    methods: [
      { 
        method: "Comparing Git Workflows", 
        syntax: "Flow Models comparison", 
        params: "Teams size, release frequency", 
        output: "Team code integration structure", 
        complexity: "Git Flow: high merge overhead. Trunk-Based: high test automation requirement.", 
        desc: `Comparison of primary branching strategies.
<table class="prose-table">
  <thead>
    <tr><th>Strategy</th><th>Branch Setup</th><th>Pros</th><th>Best Suited For</th></tr>
  </thead>
  <tbody>
    <tr><td><b>Git Flow</b></td><td><code>main</code>, <code>develop</code>, <code>feature/*</code>, <code>release/*</code>, <code>hotfix/*</code></td><td>Strict controls, isolated release cycles</td><td>Enterprise desktop systems, healthcare, banks</td></tr>
    <tr><td><b>GitHub Flow</b></td><td><code>main</code> + short-lived <code>feature/*</code> branches</td><td>Simple, rapid deployment, minimal overhead</td><td>Web SaaS, Agile teams, open-source projects</td></tr>
    <tr><td><b>Trunk-Based</b></td><td>Developers merge directly to <code>main</code> (trunk) daily</td><td>High speed, eliminates "merge hell"</td><td>Elite DevOps teams with mature test automation</td></tr>
  </tbody>
</table>`
      }
    ]
  },
  {
    id: "git_merge_vs_rebase_deep",
    num: "GIT.10",
    title: "Merge vs Rebase Deep Dive",
    desc: "Understanding the underlying mechanics, advantages, and drawbacks of merges and rebases, and the Golden Rule of Rebasing.",
    declaration: `// Rebase Rule
"NEVER rebase a public branch that other developers are collaborating on."
Rebasing public branches rewrites commit histories, causing teammates to experience duplicate commits and divergent histories.`,
    diagramUrl: "/images/git_object_model.png",
    methods: [
      { 
        method: "Comparing Merge & Rebase Mechanics", 
        syntax: "3-Way Merge Commit vs Commit Replay SHA rewrite", 
        params: "Commit parent hashes, branch tips", 
        output: "Linear vs Non-linear histories", 
        complexity: "Merge: O(1) merge commit. Rebase: O(N) rewriting overhead.", 
        desc: `Detailed comparison between Merging and Rebasing:
<table class="prose-table">
  <thead>
    <tr><th>Attribute</th><th>Git Merge</th><th>Git Rebase</th></tr>
  </thead>
  <tbody>
    <tr><td>Commit History</td><td>Non-linear (cluttered tree, multiple paths)</td><td>Linear (straight chronological line)</td></tr>
    <tr><td>Underlying Action</td><td>Creates a new "Merge Commit" (2 parent links)</td><td>Replays and rewrites commits with new SHA-1 hashes</td></tr>
    <tr><td>Traceability</td><td>Preserves true chronological context</td><td>Alters history (dates/hashes are rewritten)</td></tr>
    <tr><td>Safety profile</td><td>Safe for any branch</td><td><b>Dangerous!</b> Violates identity if run on public branches</td></tr>
  </tbody>
</table>`
      }
    ]
  },
  {
    id: "git_resolving_conflicts",
    num: "GIT.11",
    title: "Resolving Merge Conflicts",
    desc: "Why merge conflicts occur, how Git injects conflict markers into files, and the step-by-step procedure to resolve them.",
    declaration: `// Conflict Markers Format
<<<<<<< HEAD
[Your local code changes]
=======
[Teammate's incoming code changes]
>>>>>>> branch-name`,
    diagramUrl: "/images/git_merge_conflict.png",
    methods: [
      { 
        method: "Why Conflicts Occur & How to Fix Them", 
        syntax: "Conflict markers parsing", 
        params: "Competing line modifications on same file", 
        output: "Clean resolved file staged for commit", 
        complexity: "Manual resolution time", 
        desc: `Resolving code overlap step-by-step:
<table class="prose-table">
  <thead>
    <tr><th>Step</th><th>Action Required</th><th>Commands triggered</th></tr>
  </thead>
  <tbody>
    <tr><td>1. Git Alert</td><td>Git pauses the merge/rebase and warns of conflict</td><td><code>git status</code> reveals conflicting files</td></tr>
    <tr><td>2. Review Markers</td><td>Open file and find <code>&lt;&lt;&lt;&lt;&lt;&lt;&lt;</code>, <code>=======</code>, and <code>&gt;&gt;&gt;&gt;&gt;&gt;&gt;</code> markers</td><td>Keep Local, Keep Incoming, or merge both manually</td></tr>
    <tr><td>3. Stage File</td><td>Remove markers, save the file, and stage changes</td><td><code>git add &lt;file&gt;</code></td></tr>
    <tr><td>4. Complete</td><td>Finalize the merge transaction</td><td><code>git commit -m "Resolve conflicts"</code></td></tr>
  </tbody>
</table>`
      }
    ]
  },
  {
    id: "git_pr_workflow_ssh",
    num: "GIT.12",
    title: "PR Workflows, SSH vs HTTPS",
    desc: "The Fork & Pull Request developer workflow and comparing HTTPS and SSH network protocols for repository authentications.",
    declaration: `// Fork & PR Loop
1. Fork upstream repo to personal account.
2. Clone fork locally.
3. Commit and push modifications to fork.
4. Open a Pull Request (PR) from fork to upstream repository.`,
    diagramUrl: "/images/git_pr_workflow.png",
    methods: [
      { 
        method: "HTTPS vs SSH authentication protocols", 
        syntax: "PAT credentials vs cryptographic keys", 
        params: "URL formats, credentials", 
        output: "Authenticated secure transmission", 
        complexity: "Setup: SSH takes minutes. Connection speed: Identical.", 
        desc: `Comparing HTTPS and SSH remote repository connections.
<table class="prose-table">
  <thead>
    <tr><th>Feature</th><th>🌐 HTTPS Protocol</th><th>🔑 SSH Protocol</th></tr>
  </thead>
  <tbody>
    <tr><td>URL format</td><td><code>https://github.com/user/repo.git</code></td><td><code>git@github.com:user/repo.git</code></td></tr>
    <tr><td>Authentication</td><td>Requires Personal Access Token (PAT)</td><td>Requires cryptographic key pairs (Private/Public)</td></tr>
    <tr><td>Usage Profile</td><td>Password prompt setup; tokens expire</td><td>Passwordless once keys are added to GitHub account</td></tr>
    <tr><td>Enterprise Standard</td><td>Low (often blocked on corporate servers)</td><td><b>High.</b> Secure, standard for automated CI/CD servers</td></tr>
  </tbody>
</table>
<br/>
<b>Q: How do you generate an SSH key?</b><br/>
Run: <code>ssh-keygen -t ed25519 -C "your_email@example.com"</code>. Copy the **public key** ('id_ed25519.pub') into GitHub settings; keep the **private key** secure on your local machine.`
      }
    ]
  },
  {
    id: "git_undo_operations",
    num: "GIT.13",
    title: "Undo Operations (The Big 4)",
    desc: "Undoing mistakes at any stage using git restore, git revert, git reset, and recovering deleted files using git reflog.",
    declaration: `// Undo Commands
- git restore <file>: Discards unstaged modifications in working directory.
- git revert <hash>: Creates a new commit that rolls back target commit changes.
- git reset --soft HEAD~1: Uncommits last commit, keeps changes in Staging index.
- git reset --hard HEAD~1: Destroys last commit, resets Staging index & working directory.`,
    diagramUrl: "/images/git_undo_decision.png",
    methods: [
      { 
        method: "The Big 4 Undo Options", 
        syntax: "restore vs revert vs reset vs reflog", 
        params: "Mistake status, staging position, remote status", 
        output: "Repository state restored to target commit", 
        complexity: "O(1) reference and HEAD adjustments", 
        desc: `Selecting the correct undo option:
<table class="prose-table">
  <thead>
    <tr><th>Command</th><th>Target Zone</th><th>Destructive?</th><th>Safe for Public branches?</th></tr>
  </thead>
  <tbody>
    <tr><td><code>git restore</code></td><td>Working Directory / Staging</td><td>Yes (Uncommitted changes are lost)</td><td>Yes</td></tr>
    <tr><td><code>git revert</code></td><td>Local & Remote Repository</td><td>No (Creates a new commit reversing changes)</td><td><b>Yes (Best for shared main branch)</b></td></tr>
    <tr><td><code>git reset</code></td><td>Local Repository only</td><td>Yes (if --hard used)</td><td><b>No.</b> Destroys commits; causes conflicts if pushed</td></tr>
    <tr><td><code>git reflog</code></td><td>Local journal database</td><td>No (Tracks all pointer movements)</td><td>Yes (Used to restore from accidental resets)</td></tr>
  </tbody>
</table>`
      },
      { 
        method: "Reset Modes: Soft, Mixed, Hard", 
        syntax: "git reset [--soft | --mixed | --hard] HEAD~1", 
        params: "HEAD pointer distance offset", 
        output: "HEAD moved, target areas updated", 
        complexity: "O(1) pointer updates", 
        desc: `Comparing git reset modes:
<table class="prose-table">
  <thead>
    <tr><th>Reset Flag</th><th>Moves HEAD?</th><th>Unstages changes? (Index)</th><th>Discards changes? (Working Dir)</th></tr>
  </thead>
  <tbody>
    <tr><td><b>--soft</b></td><td>Yes</td><td>No (Changes stay staged)</td><td>No (Files remain unchanged on disk)</td></tr>
    <tr><td><b>--mixed</b> (default)</td><td>Yes</td><td>Yes (Changes are unstaged)</td><td>No (Files remain unchanged on disk)</td></tr>
    <tr><td><b>--hard</b></td><td>Yes</td><td>Yes (Staging is cleared)</td><td><b>Yes. Discards all working directory changes!</b></td></tr>
  </tbody>
</table>`
      }
    ]
  },
  {
    id: "git_interview_qa_best",
    num: "GIT.14",
    title: "Interview Q&As, Cheat Sheets & Best Practices",
    desc: "Reviewing SDE interview questions, atomic commit strategies, commit message naming conventions, and pull request etiquette.",
    declaration: `// SDE Git Best Practices
1. Atomic Commits: Each commit does exactly one thing.
2. Naming Conventions: Use prefixes (feat/, bugfix/, hotfix/).
3. Commit Messages: Use the imperative mood ("Fix layout issue", not "fixed layout").
4. Pull Requests: Keep PRs small (<400 lines) for thorough reviews.`,
    diagramUrl: null,
    methods: [
      { 
        method: "Intermediate & Advanced Interview Q&A", 
        syntax: "FAANG SDE technical evaluations", 
        params: "Internal designs, debugging", 
        output: "Mastery answers", 
        complexity: "SDE assessments", 
        desc: `High-yield questions asked in engineering interviews:
<table class="prose-table">
  <thead>
    <tr><th>SDE Interview Question</th><th>Model Answer</th></tr>
  </thead>
  <tbody>
    <tr><td><b>What is git reflog?</b></td><td>A local journal tracking every HEAD change. Useful for recovering deleted branches or commits from accidental <code>git reset --hard</code> runs.</td></tr>
    <tr><td><b>How does git bisect work?</b></td><td>A binary search tool to find which commit introduced a bug. You label a commit 'good' and 'bad', and Git splits commits to find the exact source.</td></tr>
    <tr><td><b>What is git stash?</b></td><td>Temporarily shelves dirty working directory changes, returning index to clean HEAD, so you can switch branches without committing unfinished work.</td></tr>
    <tr><td><b>How does git gc work?</b></td><td>Garbage collector that removes unreachable orphaned objects, packs commits, and compresses metadata database into packfiles to optimize speed.</td></tr>
  </tbody>
</table>`
      },
      { 
        method: "Git Command Cheat Sheet", 
        syntax: "Git Reference sheet", 
        params: "Daily commands", 
        output: "Syntax references", 
        complexity: "O(1) syntax check", 
        desc: `Commonly used commands for quick reference:
<table class="prose-table">
  <thead>
    <tr><th>Action</th><th>Command Syntax</th><th>Action</th><th>Command Syntax</th></tr>
  </thead>
  <tbody>
    <tr><td>Initialize</td><td><code>git init</code></td><td>Save changes</td><td><code>git commit -m "msg"</code></td></tr>
    <tr><td>Clone URL</td><td><code>git clone &lt;url&gt;</code></td><td>Create branch</td><td><code>git switch -c &lt;name&gt;</code></td></tr>
    <tr><td>Add file</td><td><code>git add &lt;file&gt;</code></td><td>Push branch</td><td><code>git push -u origin &lt;name&gt;</code></td></tr>
    <tr><td>Check status</td><td><code>git status</code></td><td>Download changes</td><td><code>git pull</code></td></tr>
  </tbody>
</table>`
      }
    ]
  }
];
