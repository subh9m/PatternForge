export const osConcepts = [
  {
    id: "os_basics_arch",
    num: "OS.1",
    title: "OS Basics & System Architectures",
    desc: "Fundamentals of Operating Systems: kernel functions, system calls vs library calls, user mode vs kernel mode privilege separation, and multiprocessor architectures.",
    declaration: `// OS Core Architecture Cheat Sheet
- Mode Switch: Ring 3 (User) to Ring 0 (Kernel) via TRAP instruction. Restores register context back via sysret.
- Boot Sequence: ROM BIOS/UEFI -> Master Boot Record (MBR) -> Bootloader (GRUB) -> Load Kernel -> Init (PID 1).
- System Call: Safe gate allowing user code to request privileged actions (e.g. read()). Wrapper: glibc wrapper calls sys_read.
- Memory Topologies: SMP (Shared system bus, uniform RAM access time) vs NUMA (Divided local RAM nodes per socket, local memory access is ~2x faster than remote).`,
    diagramUrl: "/os_syscall_flow.png",
    methods: [
      { 
        method: "What is an OS & its functions?", 
        syntax: "Kernel + Shell + Daemons", 
        params: "Hardware, Software, CPU, RAM", 
        output: "Resource coordination, protection", 
        complexity: "O(1) scheduler loops", 
        desc: "An intermediary software managing hardware. Core subtopics: 1) Memory Management (tracking free bytes, page tables), 2) Processor Management (scheduling queues, CPU dispatching), 3) Device Control (drivers, I/O ports), 4) File Systems (directories, inodes), 5) Security (user permissions, rings)." 
      },
      { 
        method: "User Mode vs Kernel Mode", 
        syntax: "Privilege Ring 3 vs Ring 0", 
        params: "CPU Mode Bit (0=Kernel, 1=User)", 
        output: "Hardware protection, sandbox", 
        complexity: "O(1) register bit check", 
        desc: "Privilege levels enforced by CPU hardware. Subtopics: 1) User Mode: applications run here, restricted from direct hardware/memory access. 2) Kernel Mode: full access to hardware, physical RAM, and privileged CPU instructions (CLI, STI). Mode switch is triggered via software interrupt/trap.<br/><br/><img src='/images/usermode_vs_kernelmode.png' alt='User vs Kernel mode' class='max-w-full my-3 rounded-lg border border-gray-250 dark:border-neutral-800 bg-neutral-950/10 p-2' />" 
      },
      { 
        method: "System Call vs Library Call", 
        syntax: "sys_write() vs printf()", 
        params: "Syscall number in EAX register", 
        output: "Kernel Trap vs Userspace buffer", 
        complexity: "Syscall is ~15-50x more expensive", 
        desc: "Subtopics: 1) System Call: Direct entry point to kernel mode (e.g., fork(), write()), executing in Ring 0. 2) Library Call: User-space function (e.g., printf(), malloc()) that wraps system calls with buffering mechanisms to avoid frequent kernel traps." 
      },
      { 
        method: "Microkernel vs Monolithic", 
        syntax: "Minix/Mach vs Linux/UNIX", 
        params: "IPC message passing vs Direct calls", 
        output: "Stability/Modular vs High Performance", 
        complexity: "Microkernel has IPC overhead", 
        desc: "Subtopics: 1) Monolithic: All services (scheduling, memory, drivers) run inside the kernel address space in Ring 0. Fast but unstable (one driver crash crashes OS). 2) Microkernel: Only core services (IPC, scheduling) run in Ring 0; drivers/file systems run in user space (Ring 3). Highly stable, modular, but slower due to message-passing overhead.<br/><br/><img src='/images/monolithic_vs_microkernel.png' alt='Monolithic vs Microkernel' class='max-w-full my-3 rounded-lg border border-gray-250 dark:border-neutral-800 bg-neutral-955/10 p-2' />" 
      },
      { 
        method: "🔥 Gotcha: Double Fault & Kernel Panic", 
        syntax: "ISR Exception vector 8 (x86)", 
        params: "Nested kernel exceptions, stack overflow", 
        output: "Blue Screen / System Halt", 
        complexity: "Immediate CPU shutdown", 
        desc: "<b>Q: What happens if a page fault handler itself page faults? Or if a kernel exception occurs inside another handler?</b><br/><ul><li><b>Double Fault:</b> A special CPU trap triggered if the CPU encounters an exception while trying to call an exception handler (nested exceptions).</li><li><b>Triple Fault:</b> If the Double Fault handler itself exceptions, x86 triggers a triple fault, forcing an immediate hardware reset (reboot).</li><li><b>Kernel Panic:</b> If the kernel detects an unrecoverable state in Ring 0 (e.g., dereferencing a null pointer in driver space), it halts the CPU and writes debug logs (panic() or BSOD) to prevent filesystem corruption.</li></ul>" 
      },
      { 
        method: "🔥 Gotcha: CLI/STI User Privilege Block", 
        syntax: "Instruction check (IOPL bits)", 
        params: "EFLAGS register privilege check", 
        output: "General Protection Fault (GPF)", 
        complexity: "O(1) instruction bit trap", 
        desc: "<b>Q: Why are userspace programs strictly blocked from executing instructions like CLI (Clear Interrupt Flag) and STI (Set Interrupt Flag)?</b><br/><ul><li><b>CLI/STI Power:</b> These CPU instructions disable and enable hardware interrupts.</li><li><b>Security Risk:</b> If a user application could disable interrupts, it could freeze the system timer clock. The scheduler would never run, effectively hijacking the CPU indefinitely.</li><li><b>Hardware Enforced Trap:</b> The CPU verifies the current privilege ring (CPL). If CPL &gt; IOPL (User Ring 3 attempting Ring 0 instruction), the CPU immediately triggers a General Protection Fault trap (SIGSEGV in Linux), terminating the process.</li></ul>" 
      }
    ]
  },
  {
    id: "os_process_threads",
    num: "OS.2",
    title: "Process & Thread Management",
    desc: "Process memory segments, state lifecycles, lightweight processes, Zombie/Orphan recovery, thread stacks, context switching cost, and IPC structures.",
    declaration: `// Process Layout & States Cheat Sheet
- Process: Program in execution. Segments: Text (code), Data (initialized globals), BSS (uninitialized globals), Heap (malloc), Stack (local variables).
- Thread: Basic unit of CPU utilization. Shares Heap, Global Variables, and Address Space of parent process; has own Registers, PC, and Stack.
- Orphan: Parent process dies first. Adopted by systemd/init (PID 1).
- Zombie: Child terminates, parent hasn't reaped status using wait(). Consumes process table slot.`,
    diagramUrl: "/os_process_states.png",
    methods: [
      { 
        method: "Process States & Lifecycle", 
        syntax: "PCB struct -> state queue", 
        params: "Ready List, Wait Queue, CPU Core", 
        output: "Transition: Ready -> Running -> Waiting", 
        complexity: "O(1) state queue inserts", 
        desc: "Subtopics: 1) New: Process created. 2) Ready: Waiting in RAM to be assigned to CPU. 3) Running: Instructions executing on CPU. 4) Waiting: Blocked on I/O or event completion. 5) Terminated: Finished. Suspended states (Ready-Suspended, Blocked-Suspended) exist when memory pressure forces pages to swap disk.<br/><br/><img src='/images/process_states_lifecycle.png' alt='Process state transition' class='max-w-full my-3 rounded-lg border border-gray-250 dark:border-neutral-800 bg-neutral-955/10 p-2' />" 
      },
      { 
        method: "What is Context Switching?", 
        syntax: "PCB/TCB Save -> Context Load", 
        params: "Instruction pointer, CPU registers, SP", 
        output: "Active thread swap execution", 
        complexity: "Microsecond overhead + Cache flushes", 
        desc: "Subtopics: 1) Saving State: CPU registers, Program Counter (PC), and Stack Pointer (SP) of running process are stored in its PCB. 2) Loading State: Context of next process is loaded into CPU registers. 3) Cache Penalty: Instruction/data caches become cold, causing memory latency spikes immediately after switch." 
      },
      { 
        method: "Process vs Thread Context Switch", 
        syntax: "CR3 Register swap vs Register copy", 
        params: "MMU page directory base, TLB cache entries", 
        output: "Page directory change mapping", 
        complexity: "Thread switch is significantly faster", 
        desc: "Subtopics: 1) Process Switch: Requires changing page directory base register (CR3 in x86). This invalidates Translation Lookaside Buffer (TLB) caches. 2) Thread Switch: Threads share the same virtual address space. Switching between threads of the same process preserves TLB entries, avoiding cache flush penalties." 
      },
      { 
        method: "Zombie vs Orphan Processes", 
        syntax: "wait() harvest vs init adoption", 
        params: "Parent PID, child exit status codes", 
        output: "Defunct processes reap structures", 
        complexity: "Zombie occupies 1 slot in process table", 
        desc: "Subtopics: 1) Zombie: Children that finished execution but parent hasn't reaped status via wait(). Remains 'defunct'. Avoided by handling SIGCHLD or double-forking. 2) Orphan: Active children whose parent terminated. Automatically adopted by systemd/init (PID 1) which regularly calls wait() to reap them." 
      },
      { 
        method: "🔥 Gotcha: Double-Forking to Prevent Zombies", 
        syntax: "fork() -> fork() -> exit()", 
        params: "Process hierarchy IDs", 
        output: "Orphaned grandchild process adopted by init", 
        complexity: "Two context switches overhead", 
        desc: "<b>Q: Explain the exact mechanism of double-forking to prevent zombie processes.</b><br/><ul><li><b>Step 1:</b> Parent forks child A. Child A immediately forks child B (grandchild) and then immediately calls exit().</li><li><b>Step 2:</b> The parent immediately reaps child A (since child A exits immediately, it spends practically zero time as a zombie).</li><li><b>Step 3:</b> The grandchild (child B) becomes an orphan because its direct parent (child A) is dead.</li><li><b>Step 4:</b> The OS automatically re-parents the grandchild to systemd/init (PID 1). When the grandchild finishes, init automatically wait()s on it, preventing it from ever becoming a zombie.</li></ul>" 
      },
      { 
        method: "🔥 Gotcha: Shared vs Independent Stack Spaces", 
        syntax: "pthread_create() stack mapping", 
        params: "Threads allocated segments in Heap/Data", 
        output: "Independent thread stacks, shared heaps", 
        complexity: "O(1) thread memory dereference", 
        desc: "<b>Q: Since threads share the virtual address space, what keeps thread local variables separate?</b><br/><ul><li><b>Independent Stacks:</b> Every thread is allocated its own stack space inside the process's virtual address space during creation (usually ~2MB to 8MB).</li><li><b>Registration:</b> Thread Control Blocks (TCBs) store the distinct stack pointers (ESP/RSP) of each thread.</li><li><b>No Isolation Protection:</b> Because there is no address separation, Thread A *can* theoretically corrupt the stack of Thread B if it obtains a pointer to it (no compiler or MMU protection exists between threads of the exact same process).</li></ul>" 
      }
    ]
  },
  {
    id: "os_cpu_scheduling",
    num: "OS.3",
    title: "CPU Scheduling Algorithms",
    desc: "Long-term, medium-term, and short-term schedulers, dispatcher actions, preemptive scheduling, Gantt chart wait time equations, SJF, Priority, and MLFQ queues.",
    declaration: `// Scheduling Equations & Performance Metrics
- Turnaround Time (TAT) = Completion Time (CT) - Arrival Time (AT)
- Waiting Time (WT) = Turnaround Time (TAT) - Burst Time (BT)
- Response Time (RT) = First allocation time - Arrival Time (AT)
- Gantt Chart: Visual timeline representation of CPU core allocations over time.
- Schedulers: Long-term (job admission), Medium-term (swapping), Short-term (CPU dispatcher select).`,
    diagramUrl: "/os_process_states.png",
    methods: [
      { 
        method: "Preemptive vs Non-Preemptive", 
        syntax: "Voluntary Yield vs Preempt Interrupt", 
        params: "Timer ticks, priorities, I/O blocks", 
        output: "CPU state context switch swap", 
        complexity: "Preemption increases system overhead", 
        desc: "Subtopics: 1) Non-Preemptive: Running process retains CPU until it voluntarily terminates or blocks for I/O (e.g., early FCFS, SJF). 2) Preemptive: Kernel can forcibly suspend a healthy running process (e.g., when a higher-priority task arrives, or at timer interrupt slice expiry). Improves system responsiveness." 
      },
      { 
        method: "First-Come-First-Serve (FCFS)", 
        syntax: "Queue FIFO scheduling", 
        params: "Arrival timestamps queue", 
        output: "Ready queue process execution", 
        complexity: "Selection: O(1) queue peek", 
        desc: "Subtopics: 1) Convoy Effect: A CPU-bound process with long burst time blocks multiple short I/O-bound processes, causing poor average waiting times and low device utilization. Non-preemptive, simple FIFO queue implementation." 
      },
      { 
        method: "Shortest Job First (SJF & SRTF)", 
        syntax: "Select minimum burst duration", 
        params: "Predicted burst sizes", 
        output: "Optimal waiting times Gantt timeline", 
        complexity: "Selection: O(log N) heap structure", 
        desc: "Subtopics: 1) SJF (Non-preemptive): Runs shortest burst job. 2) SRTF (Preemptive): If a new job arrives with a remaining burst shorter than current job's remaining time, it preempts. Provably optimal for minimizing average waiting times, but suffers from burst prediction overhead and starvation." 
      },
      { 
        method: "Round Robin (RR)", 
        syntax: "Time slice quantum (Q)", 
        params: "Preemptive timer clock cycles", 
        output: "Cyclic time-sliced execution", 
        complexity: "Selection: O(1) queue rotation", 
        desc: "Subtopics: 1) Time Quantum (Q): If Q is too large, RR degrades to FCFS. If Q is too small, context switch overhead dominates, dropping CPU efficiency. 2) Priority and Fairness: Ensures fair CPU sharing and low response times for interactive applications." 
      },
      { 
        method: "🔥 Gotcha: Priority Inversion & Inheritance", 
        syntax: "Priority Promotion Rule", 
        params: "Lock ownership state, dynamic priority mapping", 
        output: "Prevent high priority task starvation", 
        complexity: "O(1) thread priority upgrade", 
        desc: "<b>Q: What is priority inversion and how does inheritance solve it?</b><br/><ul><li><b>The Scenario:</b> A Low-priority thread (L) holds a mutex. A High-priority thread (H) arrives and blocks waiting for L's mutex. Suddenly, a Medium-priority thread (M) arrives. Since M has higher priority than L, it preempts L. H remains blocked on L's lock indefinitely, while M runs.</li><li><b>Priority Inversion:</b> Medium-priority M effectively halts High-priority H!</li><li><b>The Solution:</b> Priority Inheritance. When H blocks waiting for L's lock, the kernel temporarily promotes L's priority to match H's priority. This prevents M from preempting L. As soon as L unlocks the mutex, its priority drops back to low.</li></ul>" 
      },
      { 
        method: "🔥 Gotcha: Context Switch vs Thread Quantum", 
        syntax: "Quantum size optimization", 
        params: "Context switch latency: ~10us, quantum: 10ms", 
        output: "Optimal scheduler throughput efficiency", 
        complexity: "Select quantum to cover > 80% burst length", 
        desc: "<b>Q: How does the OS determine the time quantum in Round Robin scheduling?</b><br/><ul><li><b>Lower Bound:</b> Must be much larger than context switch overhead. If switch latency is 1ms and quantum is 1ms, 50% of CPU time is wasted on scheduling.</li><li><b>Upper Bound:</b> If quantum is too long (e.g. 5 seconds), responsiveness collapses, degrading RR into FCFS.</li><li><b>Heuristic Rule:</b> Around <b>80%</b> of CPU burst lengths in the system should be shorter than the time quantum, ensuring tasks block on I/O rather than timing out.</li></ul>" 
      }
    ]
  },
  {
    id: "os_memory_paging",
    num: "OS.4",
    title: "Memory Management & Paging",
    desc: "Address binding, Paging vs Segmentation, Translation Lookaside Buffers (TLB) performance math, Page fault triggers, and Thrashing resolution.",
    declaration: `// Memory Mapping & Translation Cheat Sheet
- Virtual Address (VA): [ Page Number (p) | Offset (d) ]
- Physical Address (PA): [ Frame Number (f) | Offset (d) ]
- Offset Size (d) = log2(Page Size in Bytes)
- Effective Access Time (EAT) = Hit Ratio * (TLB + Memory) + (1 - Hit Ratio) * (TLB + 2 * Memory)
- Frame allocation algorithms: Equal allocation, Proportional allocation (based on process virtual size).`,
    diagramUrl: "/os_page_translation.png",
    methods: [
      { 
        method: "Paging vs Segmentation", 
        syntax: "Fixed-size block vs variable segment", 
        params: "Frame slots vs Base-Limit descriptors", 
        output: "Non-contiguous hardware partitions", 
        complexity: "Paging lookup: O(1) index array", 
        desc: "Subtopics: 1) Paging: Physical memory split into fixed frames; virtual memory split into identical pages. Avoids external fragmentation. 2) Segmentation: Logical division based on compiler modules (code, data, stack). Variable sizes. Prone to external fragmentation, requiring memory compaction.<br/><br/><img src='/images/paging_in_os.png' alt='Paging memory mapping schematic' class='max-w-full my-3 rounded-lg border border-gray-250 dark:border-neutral-800 bg-neutral-955/10 p-2' />" 
      },
      { 
        method: "Demand Paging & Page Faults", 
        syntax: "Lazy page-in -> page table present bit", 
        params: "Valid/Invalid Present bit flags", 
        output: "Hardware interrupt trap -> disk read", 
        complexity: "Page fault disk read: ~5-15 milliseconds", 
        desc: "Subtopics: 1) Present Bit: Table check. If bit is 0, a page fault occurs. 2) Page Fault handling: CPU traps to kernel -> locates page in swap disk -> finds free physical frame (or evicts one) -> reads page into frame -> updates page table Present bit -> restarts interrupted CPU instruction." 
      },
      { 
        method: "Translation Lookaside Buffer (TLB)", 
        syntax: "Associative SRAM hardware cache", 
        params: "Virtual Page Number translation key", 
        output: "Physical Frame base address hit", 
        complexity: "TLB search lookup: < 1 nanosecond", 
        desc: "Subtopics: 1) Cache hits: Returns physical frame index immediately, bypassing page table read in RAM. 2) TLB misses: Requires a slow page table lookup in main memory, and updates TLB. 3) TLB Shootdown: Multi-core processors must synchronize TLB entries when page mappings change." 
      },
      { 
        method: "🔥 Gotcha: Belady's Anomaly & Stack Property", 
        syntax: "FIFO page allocation tracking", 
        params: "Frames count vs total page faults", 
        output: "Increasing frame count increases fault rate", 
        complexity: "FIFO page tracing checks", 
        desc: "<b>Q: What is Belady's Anomaly? Which page replacement algorithms are immune to it and why?</b><br/><ul><li><b>Belady's Anomaly:</b> The counter-intuitive phenomenon where increasing the number of physical memory frames results in an *increase* in the number of page faults.</li><li><b>Affected Algorithms:</b> FIFO (First-In-First-Out).</li><li><b>Immune Algorithms:</b> LRU (Least Recently Used) and Optimal.</li><li><b>The Stack Property:</b> Immune algorithms satisfy the Stack Property, where the set of pages in memory for $N$ frames is always a subset of the pages in memory for $N+1$ frames. FIFO does not preserve this hierarchy.</li></ul><br/><img src='/images/beladys_anomaly.png' alt='Beladys anomaly diagram' class='max-w-full my-3 rounded-lg border border-gray-250 dark:border-neutral-800 bg-neutral-955/10 p-2' />" 
      },
      { 
        method: "🔥 Gotcha: Inverted Page Table Overhead", 
        syntax: "Hashed table search key", 
        params: "Logical Page Number + PID hashing", 
        output: "Single global page table translation", 
        complexity: "Lookup: O(1) hash check, O(N) chain search", 
        desc: "<b>Q: Why does an Inverted Page Table solve memory overhead, and what is its main drawback?</b><br/><ul><li><b>Overhead Solution:</b> Standard page tables require one table *per process*, consuming massive RAM on 64-bit systems. Inverted page tables have exactly *one entry per physical frame* in the system, massively reducing memory overhead.</li><li><b>The Drawback:</b> Searching. Instead of direct indexing (which is $O(1)$), we must search the table matching both virtual address and PID. This requires hardware hashing, which can suffer from collision chain latency. Also, sharing memory pages becomes difficult.</li></ul>" 
      }
    ]
  },
  {
    id: "os_sync_deadlocks",
    num: "OS.5",
    title: "Process Synchronization & Deadlocks",
    desc: "Critical Section criteria, atomic Semaphores (Wait/Signal), Mutex locks, Monitors, Priority Inversion issues, and Coffman deadlock conditions.",
    declaration: `// Synchronization & Deadlock Cheat Sheet
- Critical Section Requirements: Mutual Exclusion (only 1 inside), Progress (no blocks outside), Bounded Waiting (no starvation).
- Deadlock: System freeze due to circular resource requests.
- Coffman Conditions: Mutual Exclusion, Hold & Wait, No Preemption, Circular Wait. (All 4 must hold).
- Bankers Algorithm: Avoidance algorithm using Max, Allocation, Need matrices to verify if a state is 'Safe' before resource allocation.`,
    diagramUrl: "/os_deadlock_circular.png",
    methods: [
      { 
        method: "The Critical Section Problem", 
        syntax: "Entry Section -> CRITICAL -> Exit Section", 
        params: "Concurrent thread synchronization flags", 
        output: "Mutual exclusion of execution code", 
        complexity: "Busy wait CPU cycles (spinlocks) vs sleep", 
        desc: "Subtopics: 1) Race Condition: Output depends on non-deterministic thread execution order. 2) Solution Criteria: Mutual Exclusion (only one thread executes CS at once), Progress (threads outside CS cannot block threads entering), Bounded Waiting (limit on threads entering before a waiting thread enters)." 
      },
      { 
        method: "Semaphores: Binary & Counting", 
        syntax: "wait(S) [P] and signal(S) [V]", 
        params: "Atomic integer variable S", 
        output: "Atomic state increments / blocks", 
        complexity: "Atomic locks processing checks", 
        desc: "Subtopics: 1) Binary Semaphore: S can only be 0 or 1. Functions like a mutex but has no ownership check. 2) Counting Semaphore: S initializes to N (number of available resources). wait() decrements S, blocks thread if S < 0. signal() increments S, wakes up blocked threads in FIFO queue." 
      },
      { 
        method: "Mutex vs Semaphore", 
        syntax: "Mutex Lock vs Semaphore Signal", 
        params: "Owner thread pointer verification", 
        output: "Exclusion lock vs Thread signaling", 
        complexity: "Mutex has lower scheduling overhead", 
        desc: "Subtopics: 1) Ownership: Mutex has a strict ownership contract. Only the thread that locked the mutex can unlock it. Semaphores have no owner (Thread A can call wait(), Thread B can call signal()). 2) Locking: Mutex is used for mutual exclusion. Semaphore is used for synchronization and signaling." 
      },
      { 
        method: "🔥 Gotcha: Spinlock vs Semaphore in Kernel", 
        syntax: "spin_lock() vs down_semaphore()", 
        params: "Thread context sleep flags", 
        output: "Busy wait CPU loop vs Sleep queue block", 
        complexity: "Spinlocks are O(1) loop checks", 
        desc: "<b>Q: Why are spinlocks preferred in kernel space code (like drivers) but avoided in user space applications?</b><br/><ul><li><b>Kernel Space context:</b> Thread switching is expensive. If a lock is expected to be held for a very short duration (e.g., microsecond register writes), busy-waiting in a spinlock consumes fewer clock cycles than putting the thread to sleep (context switch).</li><li><b>No Sleep Context:</b> Interrupt service routines (ISRs) cannot sleep. Hence, they *must* use spinlocks.</li><li><b>User Space:</b> User threads have no control over the scheduler. If a user thread spins, it wastes its entire time quantum doing zero work, blocking the lock owner from completing. Hence, user space uses sleep locks (Semaphores/Mutexes).</li></ul>" 
      },
      { 
        method: "🔥 Gotcha: Livelock vs Deadlock vs Starvation", 
        syntax: "Active status change loops", 
        params: "Locks, state loops, CPU consumption", 
        output: "Infinite busy-wait loops vs absolute freezes", 
        complexity: "Livelock consumes 100% CPU cycles", 
        desc: "<b>Q: What is the difference between Deadlock, Livelock, and Starvation?</b><br/><ul><li><b>Deadlock:</b> Two or more threads are permanently blocked, waiting for each other to release resources. Threads are in a *sleeping* state (consuming 0% CPU).</li><li><b>Livelock:</b> Threads actively change their states in response to each other, but make zero forward progress (like two polite people trying to pass each other in a hallway, repeatedly stepping to the same side). Threads are in a *running* state (consuming 100% CPU).</li><li><b>Starvation:</b> A thread is healthy but is repeatedly bypassed by the scheduler or resource allocator due to priority bias. The thread *could* run, but never gets the chance.</li></ul>" 
      }
    ]
  },
  {
    id: "os_storage_files",
    num: "OS.6",
    title: "Storage, File Systems & I/O",
    desc: "Disk scheduling algorithms, RAID virtualization levels, Unix file system Inodes, Soft links vs Hard links, and process crash diagnostics.",
    declaration: `// Storage & File System Metrics
- Hard Link: Directory entry maps directly to target Inode number. Share same inode.
- Soft Link (Symlink): A text file containing path string to target. If target deleted, symlink is broken.
- Disk Scheduling: Compares Head Seek movements (cylinders traveled) to minimize arm latency.
- Inode Table: Array of file metadata blocks on disk mapping physical disk blocks.`,
    diagramUrl: "/os_deadlock_circular.png",
    methods: [
      { 
        method: "RAID Configuration Levels", 
        syntax: "RAID 0, 1, 5, 6, 10", 
        params: "Striping, Mirroring, Parity equations", 
        output: "Fault-tolerance virtual disk arrays", 
        complexity: "Disk read speed scales with drive count", 
        desc: "Subtopics: 1) RAID 0 (Striping): Spreads blocks across drives. High speed, zero fault tolerance. 2) RAID 1 (Mirroring): Duplicates data. Safe, read-speed scaling, 50% capacity overhead. 3) RAID 5 (Distributed Parity): Stripes data and parity. Tolerates 1 drive loss, requires minimum 3 drives. 4) RAID 6 (Double Parity): Tolerates 2 drive losses, requires minimum 4 drives.<br/><br/><img src='/images/raid_levels.png' alt='RAID array levels' class='max-w-full my-3 rounded-lg border border-gray-250 dark:border-neutral-800 bg-neutral-955/10 p-2' />" 
      },
      { 
        method: "What is an Inode?", 
        syntax: "Index Node database structure", 
        params: "Inode ID, file block pointers", 
        output: "File metadata block mappings", 
        complexity: "Inode lookup: O(1) array seek", 
        desc: "Subtopics: 1) Inode Contents: Holds file size, permissions, owner UID, timestamps, and data block pointers. Does NOT hold filename. 2) Pointers: Uses direct pointers for small files, and single/double/triple indirect block pointers on disk for large files.<br/><br/><img src='/images/inode_structure.png' alt='Unix Inode blocks mapping schema' class='max-w-full my-3 rounded-lg border border-gray-250 dark:border-neutral-800 bg-neutral-955/10 p-2' />" 
      },
      { 
        method: "Hard Link vs Soft Link (Symlink)", 
        syntax: "Same Inode mapping vs Path file", 
        params: "Reference counts, partition boundaries", 
        output: "Inode references pointer redirection", 
        complexity: "Soft link resolution requires path lookup", 
        desc: "Subtopics: 1) Hard Link: Points directly to same inode. File contents only deleted when reference count is 0. Cannot cross file system partitions. 2) Soft Link: Independent file containing target path. Can span partitions, breaks if target file is renamed or moved." 
      },
      { 
        method: "🔥 Gotcha: Directory Layout & Inode Mapping", 
        syntax: "unlink() and link() actions", 
        params: "Dir filename mapping string to Inode ID", 
        output: "File access point redirection", 
        complexity: "File link removal is O(1) metadata write", 
        desc: "<b>Q: If filenames are not stored inside an Inode, where are they stored?</b><br/><ul><li><b>Directory Structure:</b> A directory is simply a special file containing a list of pairs: <b>[Filename, Inode Number]</b>.</li><li><b>File Lookup:</b> To open '/usr/bin/go', the OS looks up '/' inode to find the block containing directory mappings, reads it to find 'usr' inode, reads 'usr' directory block to find 'bin' inode, and so on.</li><li><b>Reference Counts:</b> Hard links increment the reference count inside the inode. Calling rm (unlink()) decreases the count. The disk blocks are reclaimed only when reference count drops to 0.</li></ul>" 
      },
      { 
        method: "🔥 Gotcha: File Journaling & Crash Recovery", 
        syntax: "Write-Ahead Logging (WAL)", 
        params: "Journal circular log buffer on disk", 
        output: "Atomic transactions commit states", 
        complexity: "O(1) journal playback seek on boot", 
        desc: "<b>Q: How does filesystem journaling prevent corruption during a sudden power loss?</b><br/><ul><li><b>The Problem:</b> Writing a file requires modifying: 1) Inode bitmap, 2) Data blocks, 3) Directory entry. If power cuts mid-write, filesystem state becomes inconsistent.</li><li><b>The Journal:</b> A reserved circular log on disk. Before any writes are made to the actual filesystem, the changes are written to the journal (Write-Ahead).</li><li><b>Recovery:</b> On boot after power failure, the OS checks the journal. Unfinished transactions are rolled back; finished but unwritten transactions are replayed, restoring consistency in seconds without scanning the whole disk (fsck).</li></ul>" 
      }
    ]
  },
  {
    id: "os_numerical_problems",
    num: "OS.7",
    title: "Numerical Solved Problems",
    desc: "Numerical calculations, step-by-step solved examples, and equations for CPU Scheduling Gantt Charts, Paging translations, Effective Memory Access Time, and Banker's safety state.",
    declaration: `// OS Interview Numerical Formulas
1. CPU Scheduling: Wait Time (WT) = Turnaround Time (TAT) - Burst Time (BT)
2. Paging Offset bits: d = log2(Page Size). Page Number bits: p = Logical Address bits - d
3. EAT = Hit Ratio * (TLB + Memory) + (1 - Hit Ratio) * (TLB + 2 * Memory)
4. Banker's Need Matrix: Need[i][j] = Max[i][j] - Allocation[i][j]
5. Page Replacement Hit/Fault count calculation.`,
    methods: [
      { 
        method: "CPU Scheduling Calculations (All Schedulers)", 
        syntax: "FCFS, SJF, SRTF, RR, Priority", 
        params: "Processes: P1(AT=0, BT=4, Pri=2), P2(AT=1, BT=3, Pri=1), P3(AT=2, BT=1, Pri=3), P4(AT=3, BT=2, Pri=2)", 
        output: "Comparative Average WT & TAT results", 
        complexity: "SJF is optimal for minimum WT", 
        desc: `Here is a comprehensive breakdown of all scheduling algorithms using a shared process set. Lower Priority number represents higher priority.
<br/><br/>
<b>1. First-Come-First-Serve (FCFS)</b>
<ul>
  <li>Gantt Chart Execution: [P1: 0-4] -> [P2: 4-7] -> [P3: 7-8] -> [P4: 8-10]</li>
</ul>
<table class="prose-table">
  <thead>
    <tr>
      <th>Process</th>
      <th>Arrival Time (AT)</th>
      <th>Burst Time (BT)</th>
      <th>Completion Time (CT)</th>
      <th>Turnaround Time (TAT = CT-AT)</th>
      <th>Waiting Time (WT = TAT-BT)</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>P1</td><td>0</td><td>4</td><td>4</td><td>4</td><td>0</td></tr>
    <tr><td>P2</td><td>1</td><td>3</td><td>7</td><td>6</td><td>3</td></tr>
    <tr><td>P3</td><td>2</td><td>1</td><td>8</td><td>6</td><td>5</td></tr>
    <tr><td>P4</td><td>3</td><td>2</td><td>10</td><td>7</td><td>5</td></tr>
  </tbody>
</table>
<ul>
  <li><b>Average Turnaround Time:</b> (4 + 6 + 6 + 7) / 4 = <b>5.75 ms</b></li>
  <li><b>Average Waiting Time:</b> (0 + 3 + 5 + 5) / 4 = <b>3.25 ms</b></li>
</ul>

<br/>
<b>2. Shortest Job First (SJF - Non-Preemptive)</b>
<ul>
  <li>Gantt Chart Execution:
    <ul>
      <li>At t=0, only P1 is available. Run [P1: 0-4].</li>
      <li>At t=4, P2, P3, and P4 have arrived. Burst times: P3(1) &lt; P4(2) &lt; P2(3).</li>
      <li>Run [P3: 4-5] -> [P4: 5-7] -> [P2: 7-10].</li>
    </ul>
  </li>
</ul>
<table class="prose-table">
  <thead>
    <tr>
      <th>Process</th>
      <th>AT</th>
      <th>BT</th>
      <th>CT</th>
      <th>TAT</th>
      <th>WT</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>P1</td><td>0</td><td>4</td><td>4</td><td>4</td><td>0</td></tr>
    <tr><td>P2</td><td>1</td><td>3</td><td>10</td><td>9</td><td>6</td></tr>
    <tr><td>P3</td><td>2</td><td>1</td><td>5</td><td>3</td><td>2</td></tr>
    <tr><td>P4</td><td>3</td><td>2</td><td>7</td><td>4</td><td>2</td></tr>
  </tbody>
</table>
<ul>
  <li><b>Average Turnaround Time:</b> (4 + 9 + 3 + 4) / 4 = <b>5.00 ms</b></li>
  <li><b>Average Waiting Time:</b> (0 + 6 + 2 + 2) / 4 = <b>2.50 ms</b></li>
</ul>

<br/>
<b>3. Shortest Remaining Time First (SRTF - Preemptive SJF)</b>
<ul>
  <li>Gantt Chart Execution:
    <ul>
      <li>t=0: Run P1 (Remaining BT=4).</li>
      <li>t=1: P2 arrives (BT=3). Since P2's BT=3 &lt; P1's remaining BT=3, P2 preempts P1. Run [P2: 1-2].</li>
      <li>t=2: P3 arrives (BT=1). Since P3's BT=1 &lt; P2's remaining BT=2, P3 preempts P2. Run [P3: 2-3] (Terminates).</li>
      <li>t=3: P4 arrives (BT=2). Queue contains: P1(3), P2(2), P4(2). Select P2 (remaining BT=2). Run [P2: 3-5] (Terminates).</li>
      <li>t=5: Select P4 (remaining BT=2). Run [P4: 5-7] (Terminates).</li>
      <li>t=7: Run P1 (remaining BT=3) until t=10.</li>
    </ul>
  </li>
</ul>
<table class="prose-table">
  <thead>
    <tr>
      <th>Process</th>
      <th>AT</th>
      <th>BT</th>
      <th>CT</th>
      <th>TAT</th>
      <th>WT</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>P1</td><td>0</td><td>4</td><td>10</td><td>10</td><td>6</td></tr>
    <tr><td>P2</td><td>1</td><td>3</td><td>5</td><td>4</td><td>1</td></tr>
    <tr><td>P3</td><td>2</td><td>1</td><td>3</td><td>1</td><td>0</td></tr>
    <tr><td>P4</td><td>3</td><td>2</td><td>7</td><td>4</td><td>2</td></tr>
  </tbody>
</table>
<ul>
  <li><b>Average Turnaround Time:</b> (10 + 4 + 1 + 4) / 4 = <b>4.75 ms</b></li>
  <li><b>Average Waiting Time:</b> (6 + 1 + 0 + 2) / 4 = <b>2.25 ms</b></li>
</ul>

<br/>
<b>4. Round Robin (RR - Time Quantum = 2)</b>
<ul>
  <li>Ready Queue Trace: P1 [0] -> P2, P1 [2] -> P1, P3, P4, P2 [4] ...</li>
  <li>Gantt Chart Execution: [P1: 0-2] -> [P2: 2-4] -> [P1: 4-6] (P1 Terminated) -> [P3: 6-7] -> [P4: 7-9] -> [P2: 9-10]</li>
</ul>
<table class="prose-table">
  <thead>
    <tr>
      <th>Process</th>
      <th>AT</th>
      <th>BT</th>
      <th>CT</th>
      <th>TAT</th>
      <th>WT</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>P1</td><td>0</td><td>4</td><td>6</td><td>6</td><td>2</td></tr>
    <tr><td>P2</td><td>1</td><td>3</td><td>10</td><td>9</td><td>6</td></tr>
    <tr><td>P3</td><td>2</td><td>1</td><td>7</td><td>5</td><td>4</td></tr>
    <tr><td>P4</td><td>3</td><td>2</td><td>9</td><td>6</td><td>4</td></tr>
  </tbody>
</table>
<ul>
  <li><b>Average Turnaround Time:</b> (6 + 9 + 5 + 6) / 4 = <b>6.50 ms</b></li>
  <li><b>Average Waiting Time:</b> (2 + 6 + 4 + 4) / 4 = <b>4.00 ms</b></li>
</ul>

<br/>
<b>5. Preemptive Priority (Lower number = Higher Priority)</b>
<ul>
  <li>Gantt Chart Execution:
    <ul>
      <li>t=0: Run P1 (Priority 2).</li>
      <li>t=1: P2 arrives (Priority 1). P2 has higher priority, preempts P1. Run [P2: 1-4] (Terminates).</li>
      <li>t=4: Queue has: P1(Pri 2, remaining 3), P3(Pri 3), P4(Pri 2). Run P1 (Pri 2, arrived first). Run [P1: 4-7] (Terminates).</li>
      <li>t=7: Run P4 (Pri 2). Run [P4: 7-9] (Terminates).</li>
      <li>t=9: Run P3 (Pri 3). Run [P3: 9-10] (Terminates).</li>
    </ul>
  </li>
</ul>
<table class="prose-table">
  <thead>
    <tr>
      <th>Process</th>
      <th>AT</th>
      <th>BT</th>
      <th>CT</th>
      <th>TAT</th>
      <th>WT</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>P1</td><td>0</td><td>4</td><td>7</td><td>7</td><td>3</td></tr>
    <tr><td>P2</td><td>1</td><td>3</td><td>4</td><td>3</td><td>0</td></tr>
    <tr><td>P3</td><td>2</td><td>1</td><td>10</td><td>8</td><td>7</td></tr>
    <tr><td>P4</td><td>3</td><td>2</td><td>9</td><td>6</td><td>4</td></tr>
  </tbody>
</table>
<ul>
  <li><b>Average Turnaround Time:</b> (7 + 3 + 8 + 6) / 4 = <b>6.00 ms</b></li>
  <li><b>Average Waiting Time:</b> (3 + 0 + 7 + 4) / 4 = <b>3.50 ms</b></li>
</ul>`
      },
      { 
        method: "Virtual Memory Paging Mathematics", 
        syntax: "Page, Frame & Offset Slicing", 
        params: "32-bit Logical Address, 8KB Page size, 16GB Physical Memory RAM", 
        output: "Page bits: 19, Frame bits: 21, Offset bits: 13", 
        complexity: "O(1) address translation index", 
        desc: `Detailed step-by-step memory space bit slicing math.
<br/><br/>
<b>1. Calculating Offset Bits (d)</b>
<ul>
  <li>Page Size = 8 KB = 8 * 1024 Bytes = 8192 Bytes = 2^13 Bytes.</li>
  <li>The number of bits required to address each byte in a page is: <b>d = log2(8192) = 13 bits</b>.</li>
</ul>

<b>2. Calculating Page Number Bits (p)</b>
<ul>
  <li>Logical Address Size = 32 bits.</li>
  <li>Logical Address structure: [ Page Number (p) | Offset (d) ]</li>
  <li>Page Number bits (p) = Logical Address Bits - Offset Bits = 32 - 13 = <b>19 bits</b>.</li>
  <li>Maximum number of Pages in virtual memory = 2^19 pages = 524,288 pages.</li>
</ul>

<b>3. Calculating Frame Number Bits (f)</b>
<ul>
  <li>Physical Memory RAM Size = 16 GB = 16 * 1024 * 1024 * 1024 Bytes = 17,179,869,184 Bytes = 2^34 Bytes.</li>
  <li>Physical Address size = 34 bits.</li>
  <li>Physical Address structure: [ Frame Number (f) | Offset (d) ]</li>
  <li>Frame Number bits (f) = Physical Address Bits - Offset Bits = 34 - 13 = <b>21 bits</b>.</li>
  <li>Number of frames in physical RAM = 2^21 frames = 2,097,152 frames.</li>
</ul>

<b>4. Slicing Example</b>
<ul>
  <li>Consider Logical Address: <b>0x00A23BC5</b>.</li>
  <li>Convert to binary: 0000 0000 1010 0010 0011 1011 1100 0101</li>
  <li>Group the lower 13 bits (Offset): 1 1011 1100 0101 -> <b>0x1BC5</b></li>
  <li>Group the upper 19 bits (Page Number): 0000 0000 1010 0010 001 -> <b>0x00511</b></li>
  <li>Hence, the MMU checks Page Table entry at index <b>0x00511</b>. If it maps to Frame <b>0x12A4</b>, the resulting Physical Address is: Frame (0x12A4) + Offset (0x1BC5) = <b>0x02489BC5</b>.</li>
</ul>`
      },
      { 
        method: "Effective Access Time (EAT) equations", 
        syntax: "TLB Hit/Miss equations", 
        params: "TLB time=2ns, RAM access=80ns, hit ratios: 90% vs 99%", 
        output: "EAT: 90% = 91.8ns, 99% = 82.78ns", 
        complexity: "O(1) associative lookup", 
        desc: `Detailed calculation comparing memory access latencies across varying Translation Lookaside Buffer cache hit ratios.
<br/><br/>
<b>1. General Equations</b>
<ul>
  <li>Let <b>c</b> = TLB Lookup time.</li>
  <li>Let <b>m</b> = Main Memory (RAM) access time.</li>
  <li>Let <b>p</b> = TLB Hit Ratio.</li>
  <li><b>Effective Access Time (EAT):</b>
    <br/>
    <code>EAT = p * (c + m) + (1 - p) * (c + 2 * m)</code>
    <br/>
    *(Note: On a TLB Miss, we do 2 memory accesses: first to read the page table entry, second to access the actual data frame).*
  </li>
</ul>

<b>2. Step-by-step Calculation (90% Hit Ratio, c=2ns, m=80ns)</b>
<ul>
  <li>TLB Hit Case: 2ns + 80ns = 82ns</li>
  <li>TLB Miss Case: 2ns + 2 * 80ns = 162ns</li>
  <li>EAT = 0.90 * (82ns) + 0.10 * (162ns)</li>
  <li>EAT = 73.8ns + 16.2ns = <b>90.0 nanoseconds</b></li>
</ul>

<b>3. Step-by-step Calculation (99% Hit Ratio, c=2ns, m=80ns)</b>
<ul>
  <li>TLB Hit Case: 82ns</li>
  <li>TLB Miss Case: 162ns</li>
  <li>EAT = 0.99 * (82ns) + 0.01 * (162ns)</li>
  <li>EAT = 81.18ns + 1.62ns = <b>82.8 nanoseconds</b></li>
</ul>

<br/>
<b>4. Comparative Benchmark Table</b>
<table class="prose-table">
  <thead>
    <tr>
      <th>Hit Ratio (p)</th>
      <th>TLB Hit Time</th>
      <th>TLB Miss Time</th>
      <th>Effective Access Time (EAT)</th>
      <th>Speedup vs No-TLB (160ns)</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>0% (No TLB)</td><td>-</td><td>160ns</td><td>160.0 ns</td><td>1.00x (Baseline)</td></tr>
    <tr><td>80%</td><td>82ns</td><td>162ns</td><td>98.0 ns</td><td>1.63x faster</td></tr>
    <tr><td>90%</td><td>82ns</td><td>162ns</td><td>90.0 ns</td><td>1.77x faster</td></tr>
    <tr><td>95%</td><td>82ns</td><td>162ns</td><td>86.0 ns</td><td>1.86x faster</td></tr>
    <tr><td>99%</td><td>82ns</td><td>162ns</td><td>82.8 ns</td><td>1.93x faster</td></tr>
  </tbody>
</table>

<br/>
<b>5. Gotcha: EAT with Page Fault Service Rate</b>
<ul>
  <li><b>Q: How do you calculate EAT if the page fault rate is 1%?</b></li>
  <li>Let Memory Access = 100ns, Page Fault Service Time = 10ms = 10,000,000ns.</li>
  <li>Formula: <code>EAT = (1 - p) * Memory + p * Page_Fault_Service_Time</code></li>
  <li>EAT = 0.99 * 100ns + 0.01 * 10,000,000ns = 99ns + 100,000ns = <b>100,099ns = ~100us</b>.</li>
  <li><i>Takeaway: Even a 1% page fault rate slows access times by 1000x! This is why page fault reduction is critical.</i></li>
</ul>`
      },
      { 
        method: "Banker's Safety State Math", 
        syntax: "Resource Safety Matrices", 
        params: "Available=[3 3 2], 5 processes (P0-P4), 3 resource types (A, B, C)", 
        output: "Safe Sequence: P1 -> P3 -> P4 -> P0 -> P2", 
        complexity: "O(P^2 * R) time safety loop", 
        desc: `Detailed calculation check to prove if the system is in a Safe State.
<br/><br/>
<b>1. Input Matrices & Available Vector</b>
<ul>
  <li><b>Available Vector:</b> [A=3, B=3, C=2]</li>
  <li><b>Need Matrix Equation:</b> <code>Need[i] = Max[i] - Allocation[i]</code></li>
</ul>
<table class="prose-table">
  <thead>
    <tr>
      <th>Process</th>
      <th>Allocation [A B C]</th>
      <th>Max [A B C]</th>
      <th>Need [A B C]</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>P0</td><td>0 1 0</td><td>7 5 3</td><td><b>7 4 3</b></td></tr>
    <tr><td>P1</td><td>2 0 0</td><td>3 2 2</td><td><b>1 2 2</b></td></tr>
    <tr><td>P2</td><td>3 0 2</td><td>9 0 2</td><td><b>6 0 0</b></td></tr>
    <tr><td>P3</td><td>2 1 1</td><td>2 2 2</td><td><b>0 1 1</b></td></tr>
    <tr><td>P4</td><td>0 0 2</td><td>4 3 3</td><td><b>4 3 1</b></td></tr>
  </tbody>
</table>

<br/>
<b>2. Safety Sequence Determination Procedure</b>
<ul>
  <li><b>Step 1 (Check P0):</b> Is Need [7 4 3] &lt;= Available [3 3 2]? <b>No.</b> P0 must wait.</li>
  <li><b>Step 2 (Check P1):</b> Is Need [1 2 2] &lt;= Available [3 3 2]? <b>Yes.</b>
    <ul>
      <li>P1 enters execution, completes, and releases resources.</li>
      <li>New Available = Current Available + P1's Allocation = [3 3 2] + [2 0 0] = <b>[5 3 2]</b>.</li>
      <li>Safe sequence list: <b>[P1]</b>.</li>
    </ul>
  </li>
  <li><b>Step 3 (Check P2):</b> Is Need [6 0 0] &lt;= Available [5 3 2]? <b>No.</b> P2 must wait.</li>
  <li><b>Step 4 (Check P3):</b> Is Need [0 1 1] &lt;= Available [5 3 2]? <b>Yes.</b>
    <ul>
      <li>P3 executes, completes, and releases resources.</li>
      <li>New Available = [5 3 2] + [2 1 1] = <b>[7 4 3]</b>.</li>
      <li>Safe sequence list: <b>[P1, P3]</b>.</li>
    </ul>
  </li>
  <li><b>Step 5 (Check P4):</b> Is Need [4 3 1] &lt;= Available [7 4 3]? <b>Yes.</b>
    <ul>
      <li>P4 executes, completes, and releases resources.</li>
      <li>New Available = [7 4 3] + [0 0 2] = <b>[7 4 5]</b>.</li>
      <li>Safe sequence list: <b>[P1, P3, P4]</b>.</li>
    </ul>
  </li>
  <li><b>Step 6 (Recheck P0):</b> Is Need [7 4 3] &lt;= Available [7 4 5]? <b>Yes.</b>
    <ul>
      <li>P0 executes, completes, and releases resources.</li>
      <li>New Available = [7 4 5] + [0 1 0] = <b>[7 5 5]</b>.</li>
      <li>Safe sequence list: <b>[P1, P3, P4, P0]</b>.</li>
    </ul>
  </li>
  <li><b>Step 7 (Recheck P2):</b> Is Need [6 0 0] &lt;= Available [7 5 5]? <b>Yes.</b>
    <ul>
      <li>P2 executes, completes, and releases resources.</li>
      <li>New Available = [7 5 5] + [3 0 2] = <b>[10 5 7]</b>.</li>
      <li>Safe sequence list: <b>[P1, P3, P4, P0, P2]</b>.</li>
    </ul>
  </li>
</ul>
<ul>
  <li><b>Conclusion:</b> The system is in a <b>Safe State</b> because there exists a sequence <b>P1 -> P3 -> P4 -> P0 -> P2</b> that completes all allocations without deadlock.</li>
</ul>`
      },
      { 
        method: "Page Replacement Trace (FIFO, LRU, Optimal)", 
        syntax: "Solved Paging Fault metrics", 
        params: "3 Frames, Reference String: 7, 0, 1, 2, 0, 3, 0, 4, 2, 3", 
        output: "Faults: FIFO = 7, LRU = 7, Optimal = 6", 
        complexity: "Optimal requires future foresight", 
        desc: `Detailed frame tracing and fault count analysis for page replacements.
<br/><br/>
<b>1. First-In-First-Out (FIFO)</b>
<ul>
  <li>Mechanism: Evicts the oldest page that arrived in memory first.</li>
</ul>
<table class="prose-table">
  <thead>
    <tr>
      <th>Ref</th><th>7</th><th>0</th><th>1</th><th>2</th><th>0</th><th>3</th><th>0</th><th>4</th><th>2</th><th>3</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>F1</td><td>7</td><td>7</td><td>7</td><td>2</td><td>2</td><td>2</td><td>2</td><td>4</td><td>4</td><td>4</td></tr>
    <tr><td>F2</td><td>-</td><td>0</td><td>0</td><td>0</td><td>0</td><td>3</td><td>3</td><td>3</td><td>2</td><td>2</td></tr>
    <tr><td>F3</td><td>-</td><td>-</td><td>1</td><td>1</td><td>1</td><td>1</td><td>0</td><td>0</td><td>0</td><td>3</td></tr>
    <tr><td><b>Stat</b></td><td>Fault</td><td>Fault</td><td>Fault</td><td>Fault</td><td>Hit</td><td>Fault</td><td>Fault</td><td>Fault</td><td>Fault</td><td>Fault</td></tr>
  </tbody>
</table>
<ul>
  <li><b>Total FIFO Faults:</b> <b>9</b></li>
  <li><b>Total FIFO Hits:</b> <b>1</b></li>
</ul>

<br/>
<b>2. Least Recently Used (LRU)</b>
<ul>
  <li>Mechanism: Evicts page that has not been referenced for the longest time.</li>
</ul>
<table class="prose-table">
  <thead>
    <tr>
      <th>Ref</th><th>7</th><th>0</th><th>1</th><th>2</th><th>0</th><th>3</th><th>0</th><th>4</th><th>2</th><th>3</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>F1</td><td>7</td><td>7</td><td>7</td><td>2</td><td>2</td><td>2</td><td>2</td><td>4</td><td>4</td><td>3</td></tr>
    <tr><td>F2</td><td>-</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>2</td><td>2</td></tr>
    <tr><td>F3</td><td>-</td><td>-</td><td>1</td><td>1</td><td>1</td><td>3</td><td>3</td><td>3</td><td>3</td><td>0</td></tr>
    <tr><td><b>Stat</b></td><td>Fault</td><td>Fault</td><td>Fault</td><td>Fault</td><td>Hit</td><td>Fault</td><td>Hit</td><td>Fault</td><td>Fault</td><td>Fault</td></tr>
  </tbody>
</table>
<ul>
  <li><b>Total LRU Faults:</b> <b>8</b></li>
  <li><b>Total LRU Hits:</b> <b>2</b></li>
</ul>

<br/>
<b>3. Optimal (OPT)</b>
<ul>
  <li>Mechanism: Evicts page that will not be used for the longest period in the future.</li>
</ul>
<table class="prose-table">
  <thead>
    <tr>
      <th>Ref</th><th>7</th><th>0</th><th>1</th><th>2</th><th>0</th><th>3</th><th>0</th><th>4</th><th>2</th><th>3</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>F1</td><td>7</td><td>7</td><td>7</td><td>2</td><td>2</td><td>2</td><td>2</td><td>4</td><td>4</td><td>4</td></tr>
    <tr><td>F2</td><td>-</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>2</td><td>2</td></tr>
    <tr><td>F3</td><td>-</td><td>-</td><td>1</td><td>1</td><td>1</td><td>3</td><td>3</td><td>3</td><td>3</td><td>3</td></tr>
    <tr><td><b>Stat</b></td><td>Fault</td><td>Fault</td><td>Fault</td><td>Fault</td><td>Hit</td><td>Fault</td><td>Hit</td><td>Fault</td><td>Fault</td><td>Hit</td></tr>
  </tbody>
</table>
<ul>
  <li><b>Total OPT Faults:</b> <b>7</b></li>
  <li><b>Total OPT Hits:</b> <b>3</b></li>
</ul>`
      },
      { 
        method: "Disk Scheduling Seek track calculations", 
        syntax: "FCFS, SSTF, SCAN, LOOK, C-SCAN, C-LOOK", 
        params: "Initial Head = 53, Cylinder queue = [98, 183, 37, 122, 14, 124, 65, 67], Range = 0 to 199", 
        output: "SSTF: 236 tracks, SCAN: 208 tracks, C-SCAN: 382 tracks", 
        complexity: "Arm seek time is the primary latency factor", 
        desc: `Detailed trace path and total cylinder head movements (seeks) for all major disk scheduling algorithms.
<br/><br/>
<b>1. First-Come-First-Serve (FCFS)</b>
<ul>
  <li>Trace Path: 53 -> 98 -> 183 -> 37 -> 122 -> 14 -> 124 -> 65 -> 67</li>
  <li>Calculation: |98-53| + |183-98| + |37-183| + |122-37| + |14-122| + |124-14| + |65-124| + |67-65| = 45 + 85 + 146 + 85 + 108 + 110 + 59 + 2 = <b>640 cylinders</b>.</li>
</ul>

<b>2. Shortest Seek Time First (SSTF)</b>
<ul>
  <li>Trace Path: 53 -> 65 -> 67 -> 37 -> 14 -> 98 -> 122 -> 124 -> 183</li>
  <li>Calculation: |65-53| + |67-65| + |37-67| + |14-37| + |98-14| + |122-98| + |124-122| + |183-124| = 12 + 2 + 30 + 23 + 84 + 24 + 2 + 59 = <b>236 cylinders</b>.</li>
</ul>

<b>3. SCAN (Elevator Algorithm - moving towards 0)</b>
<ul>
  <li>Trace Path: 53 -> 37 -> 14 -> 0 -> 65 -> 67 -> 98 -> 122 -> 124 -> 183</li>
  <li>Calculation: (53 - 0) + (183 - 0) = 53 + 183 = <b>236 cylinders</b>.</li>
</ul>

<b>4. LOOK (moving towards 0 - stops at minimum request 14)</b>
<ul>
  <li>Trace Path: 53 -> 37 -> 14 -> 65 -> 67 -> 98 -> 122 -> 124 -> 183</li>
  <li>Calculation: (53 - 14) + (183 - 14) = 39 + 169 = <b>208 cylinders</b>.</li>
</ul>

<b>5. C-SCAN (Circular SCAN - moving towards 199)</b>
<ul>
  <li>Trace Path: 53 -> 65 -> 67 -> 98 -> 122 -> 124 -> 183 -> 199 -> 0 -> 14 -> 37</li>
  <li>Calculation: (199 - 53) + (199 - 0) + (37 - 0) = 146 + 199 + 37 = <b>382 cylinders</b>.</li>
</ul>

<b>6. C-LOOK (Circular LOOK - stops at max and jumps to min)</b>
<ul>
  <li>Trace Path: 53 -> 65 -> 67 -> 98 -> 122 -> 124 -> 183 -> 14 -> 37</li>
  <li>Calculation: (183 - 53) + (183 - 14) + (37 - 14) = 130 + 169 + 23 = <b>322 cylinders</b>.</li>
</ul>

<br/>
<b>7. Comparative Benchmark Summary</b>
<table class="prose-table">
  <thead>
    <tr>
      <th>Algorithm</th>
      <th>Seek Sequence Path</th>
      <th>Total Head Movement (Cylinders)</th>
      <th>Pros / Cons</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>FCFS</td><td>53➔98➔183➔37➔122➔14➔124➔65➔67</td><td>640</td><td>Simple, fair / Massive head swings</td></tr>
    <tr><td>SSTF</td><td>53➔65➔67➔37➔14➔98➔122➔124➔183</td><td>236</td><td>Efficient / Starves extreme cylinders</td></tr>
    <tr><td>SCAN</td><td>53➔37➔14➔0➔65➔67➔98➔122➔124➔183</td><td>236</td><td>No starvation / Long wait at edges</td></tr>
    <tr><td>LOOK</td><td>53➔37➔14➔65➔67➔98➔122➔124➔183</td><td>208</td><td>Saves seek to 0 / Slightly complex</td></tr>
    <tr><td>C-SCAN</td><td>53➔65➔67➔98➔122➔124➔183➔199➔0➔14➔37</td><td>382</td><td>Uniform wait times / Long reset jump</td></tr>
    <tr><td>C-LOOK</td><td>53➔65➔67➔98➔122➔124➔183➔14➔37</td><td>322</td><td>Saves edge seeks / High seek on jump</td></tr>
  </tbody>
</table>`
      }
    ]
  }
];
