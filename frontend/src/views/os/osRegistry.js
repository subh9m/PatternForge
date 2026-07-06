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
        desc: "Privilege levels enforced by CPU hardware. Subtopics: 1) User Mode: applications run here, restricted from direct hardware/memory access. 2) Kernel Mode: full access to hardware, physical RAM, and privileged CPU instructions (CLI, STI). Mode switch is triggered via software interrupt/trap." 
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
        desc: "Subtopics: 1) Monolithic: All services (scheduling, memory, drivers) run inside the kernel address space in Ring 0. Fast but unstable (one driver crash crashes OS). 2) Microkernel: Only core services (IPC, scheduling) run in Ring 0; drivers/file systems run in user space (Ring 3). Highly stable, modular, but slower due to message-passing overhead." 
      },
      { 
        method: "Real-Time OS (RTOS)", 
        syntax: "FreeRTOS, VxWorks, QNX", 
        params: "Hard vs Soft deadline structures", 
        output: "Deterministic event schedulers", 
        complexity: "O(1) worst-case response latency", 
        desc: "Subtopics: 1) Hard RTOS: Missed deadline constitutes total system failure (e.g., pacemakers, anti-lock brakes). 2) Soft RTOS: Deadlines are important but missing them is tolerated with degraded service quality (e.g., media streaming). Requires deterministic preemptive schedulers." 
      },
      { 
        method: "SMP vs NUMA Architectures", 
        syntax: "Symmetric vs Non-Uniform Memory", 
        params: "Shared central bus vs Local socket buses", 
        output: "Dual-socket scale-up configurations", 
        complexity: "NUMA local node access: ~50-80ns", 
        desc: "Subtopics: 1) SMP: Processors share a single central memory bus and RAM. Access latency is identical. 2) NUMA: System divided into nodes (each with local CPUs and RAM). Accessing local node RAM is extremely fast; accessing remote node RAM over inter-connects (QPI/UPI) is slow, requiring NUMA-aware scheduling." 
      },
      { 
        method: "Interrupt vs Trap vs Exception", 
        syntax: "Asynchronous vs Synchronous calls", 
        params: "Hardware pins, trap registers", 
        output: "Control branch to ISR handler", 
        complexity: "Save state registers to kernel stack", 
        desc: "Subtopics: 1) Interrupt: Asynchronous hardware event (e.g., keyboard input, timer tick). 2) Trap: Synchronous software event triggered by instruction (e.g., system call). 3) Exception: Synchronous error event during execution (e.g., divide-by-zero, page fault). Control is routed via the Interrupt Descriptor Table (IDT)." 
      },
      { 
        method: "Spooling vs Buffering", 
        syntax: "SPOOL vs Temp buffer cache", 
        params: "Print queues, socket blocks", 
        output: "Asynchronous device streams spooler", 
        complexity: "I/O queue disk overhead", 
        desc: "Subtopics: 1) Spooling: Temporary storage on disk (SPOOL) used to queue data for slow peripherals (e.g., printers), letting the CPU execute other processes. 2) Buffering: Small cache in RAM used to reconcile speed differences between CPU and devices during active data transfers." 
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
        desc: "Subtopics: 1) New: Process created. 2) Ready: Waiting in RAM to be assigned to CPU. 3) Running: Instructions executing on CPU. 4) Waiting: Blocked on I/O or event completion. 5) Terminated: Finished. Suspended states (Ready-Suspended, Blocked-Suspended) exist when memory pressure forces pages to swap disk." 
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
        method: "Inter-Process Communication (IPC)", 
        syntax: "Shared Memory vs Message Passing", 
        params: "Pipes, Shared RAM, Sockets, Signals", 
        output: "Data transmission across page barriers", 
        complexity: "Shared memory: O(1) read/write access", 
        desc: "Subtopics: 1) Shared Memory: Processes map a common physical RAM page to their virtual address space. Extremely fast, requires manual locks. 2) Message Passing: Direct kernel buffering (Pipes, Message Queues). Safe, but requires system calls and memory copies. 3) Sockets: Bidirectional network endpoints." 
      },
      { 
        method: "Pipes: Anonymous vs Named (FIFO)", 
        syntax: "pipe(fd) vs mkfifo(name)", 
        params: "Read/Write file descriptors", 
        output: "Unidirectional kernel buffer channel", 
        complexity: "Buffer queue copy overhead", 
        desc: "Subtopics: 1) Anonymous Pipe: Created via pipe(fd) syscall. Unidirectional, parent-child process communication only. Exists in kernel memory buffer. 2) Named Pipe (FIFO): Created via mkfifo() syscall. Appears as a file in directory tree. Allows unrelated processes to communicate." 
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
        method: "Starvation vs Aging", 
        syntax: "Starved queue vs Priority aging scale", 
        params: "Wait time thresholds", 
        output: "Gradual priority elevations", 
        complexity: "O(N) periodic queue scans", 
        desc: "Subtopics: 1) Starvation: Priority or SJF schedulers run high-priority tasks repeatedly, leaving low-priority processes blocked indefinitely. 2) Aging: Mitigation technique that slowly increments the priority of processes waiting in the ready queue, guaranteeing eventual execution." 
      },
      { 
        method: "Multi-Level Feedback Queue (MLFQ)", 
        syntax: "Priority queues + dynamic promotions", 
        params: "Time quantum scaling levels", 
        output: "Behavior-aware scheduling queues", 
        complexity: "O(1) ready queue queries", 
        desc: "Subtopics: 1) Dynamic Priority: Tasks start at top queue. If they use their entire time slice without blocking, they are demoted to a lower queue. I/O-bound tasks stay at high priority. 2) Prevention of Gaming: Prevents processes from running infinite short bursts to hijack CPU. Low queues have longer quantum lengths." 
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
        desc: "Subtopics: 1) Paging: Physical memory split into fixed frames; virtual memory split into identical pages. Avoids external fragmentation. 2) Segmentation: Logical division based on compiler modules (code, data, stack). Variable sizes. Prone to external fragmentation, requiring memory compaction." 
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
        method: "Fragmentation: Internal vs External", 
        syntax: "Wasted boundary bytes vs scattered free holes", 
        params: "Fixed page allocation limit vs Dynamic heaps", 
        output: "Compaction / Paging allocations", 
        complexity: "Compaction requires copying physical RAM blocks", 
        desc: "Subtopics: 1) Internal: Memory allocated to a process that is slightly larger than requested (e.g. process requests 3KB, gets 4KB page; 1KB is wasted). 2) External: Total free memory exists to satisfy request, but it is split into non-contiguous blocks, unable to fit process." 
      },
      { 
        method: "Thrashing Working Set Model", 
        syntax: "Page fault loop swap in/out", 
        params: "Total physical frames allocation limits", 
        output: "Swapping disk I/O bottleneck freezes", 
        complexity: "CPU utilization collapses to ~0%", 
        desc: "Subtopics: 1) Swapping overhead: When physical RAM is full, the OS repeatedly evicts and fetches pages for active processes. 2) Working Set Model: Tracks the active pages referenced by a process in a window. If sum of all working sets exceeds physical RAM, thrashing occurs. Resolved by suspending processes." 
      },
      { 
        method: "Copy-On-Write (COW)", 
        syntax: "fork() share memory page table", 
        params: "Read-only page protection flags", 
        output: "Duplicated private page copy on write", 
        complexity: "O(1) clone creation, O(page_size) write copy", 
        desc: "Subtopics: 1) Page Sharing: Child process shares parent's pages immediately after fork(). Pages marked Read-Only. 2) Write Fault: If either process attempts to write, a page fault trap triggers. The kernel copies the physical frame, maps it to the writing process as write-accessible, and resumes." 
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
        method: "Priority Inversion & Inheritance", 
        syntax: "Low priority promoted to high priority", 
        params: "Priority levels: High (H), Med (M), Low (L)", 
        output: "Lock release queue priority shifts", 
        complexity: "Priority queue metadata updates", 
        desc: "Subtopics: 1) Problem Scenario: L holds lock needed by H. H blocks. M preempts L because M has higher priority than L, preventing L from finishing and releasing lock, indirectly starving H. 2) Priority Inheritance: L's priority is temporarily elevated to H's level when H blocks on L's lock, preventing M from preempting L." 
      },
      { 
        method: "Deadlock Prevention vs Avoidance", 
        syntax: "Break conditions vs Safe State checks", 
        params: "Banker's vectors, allocation matrices", 
        output: "Deadlock-free execution scheduling", 
        complexity: "Avoidance check: O(P^2 * R) Bankers runtime", 
        desc: "Subtopics: 1) Prevention: Eliminates at least one Coffman condition at design time (e.g., locking resources in total ordering to break Circular Wait). 2) Avoidance: Dynamic checks. Allocator checks if allocating a resource leaves the system in a 'Safe State' (where at least one execution sequence exists that satisfies all maximum requests)." 
      },
      { 
        method: "Monitors in OS", 
        syntax: "Class wrapper + condition variables", 
        params: "wait() and signal() condition hooks", 
        output: "High-level compiler synchronization", 
        complexity: "Compiler generated mutex locks", 
        desc: "Subtopics: 1) Encapsulation: Object-oriented programming construct where only one thread can execute inside monitor methods at a time. 2) Condition Variables: Allows threads to release monitor lock and sleep inside monitor when waiting for conditions. Woken up via cv.signal()." 
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
    methods: [
      { 
        method: "RAID Configuration Levels", 
        syntax: "RAID 0, 1, 5, 6, 10", 
        params: "Striping, Mirroring, Parity equations", 
        output: "Fault-tolerance virtual disk arrays", 
        complexity: "Disk read speed scales with drive count", 
        desc: "Subtopics: 1) RAID 0 (Striping): Spreads blocks across drives. High speed, zero fault tolerance. 2) RAID 1 (Mirroring): Duplicates data. Safe, read-speed scaling, 50% capacity overhead. 3) RAID 5 (Distributed Parity): Stripes data and parity. Tolerates 1 drive loss, requires minimum 3 drives. 4) RAID 6 (Double Parity): Tolerates 2 drive losses, requires minimum 4 drives." 
      },
      { 
        method: "What is an Inode?", 
        syntax: "Index Node database structure", 
        params: "Inode ID, file block pointers", 
        output: "File metadata block mappings", 
        complexity: "Inode lookup: O(1) array seek", 
        desc: "Subtopics: 1) Inode Contents: Holds file size, permissions, owner UID, timestamps, and data block pointers. Does NOT hold filename. 2) Pointers: Uses direct pointers for small files, and single/double/triple indirect block pointers on disk for large files." 
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
        method: "Process Crash Handling", 
        syntax: "SIGSEGV Trap -> Core Dump -> GC", 
        params: "Interrupt Vector table, registers dump", 
        output: "Core dump debugging files", 
        complexity: "Releases page tables and frame maps", 
        desc: "Subtopics: 1) Segfault: CPU throws trap when process tries to access restricted memory space (violating limit register). 2) Core Dump: Kernel captures registers, CPU states, and memory maps to a file on disk for debugging (gdb). 3) Resource Cleanup: Kernel terminates process and reclaims all allocated page tables and physical frames." 
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
        method: "CPU Scheduling Waiting Time Math", 
        syntax: "Solved CPU Gantt Chart Wait Time", 
        params: "P1(BT=8, AT=0), P2(BT=4, AT=1), P3(BT=2, AT=2)", 
        output: "Gantt Timeline: [P1: 0-8][P3: 8-10][P2: 10-14]", 
        complexity: "Average Waiting Time = 4.0ms", 
        desc: "Step-by-step SJF Scheduling: 1) At t=0, only P1 is ready. CPU runs P1. Non-preemptive SJF runs P1 to finish at t=8. 2) At t=8, P2 and P3 are ready. SJF selects P3 (shorter BT=2). P3 runs 8 to 10. 3) P2 runs 10 to 14. \n- P1: Completion Time (CT)=8. TAT=8-0=8. WT=8-8=0. \n- P3: CT=10. TAT=10-2=8. WT=8-2=6. \n- P2: CT=14. TAT=14-1=13. WT=13-4=9. \n- Average WT = (0 + 6 + 9) / 3 = 5.0ms." 
      },
      { 
        method: "Virtual Memory Paging Bits Math", 
        syntax: "Logical to Physical Page Translation", 
        params: "16-bit Logical Address, 4KB Page Size, 8 frames RAM", 
        output: "Page Bits: 4, Offset Bits: 12", 
        complexity: "Offsets map directly to Physical Address", 
        desc: "Paging calculation: 1) Page Size = 4KB = 4096 Bytes = 2^12. Hence, Offset (d) = 12 bits. 2) Logical Address space = 16 bits. Page Number (p) bits = 16 - 12 = 4 bits (Max 16 pages). 3) Main memory has 8 frames = 2^3 frames. Frame Number (f) bits = 3 bits. 4) Physical Address space = f + d = 3 + 12 = 15 bits. 5) For Logical Address 0x3A2E -> Page = 0x3, Offset = 0xA2E. If Page 3 maps to Frame 5, Physical Address = Frame 5 (101 in binary) + Offset (0xA2E) = 0x5A2E." 
      },
      { 
        method: "EAT TLB Cache hit Math", 
        syntax: "Effective Access Time Calculation", 
        params: "TLB lookup = 2ns, RAM access = 100ns, Hit Ratio = 90%", 
        output: "EAT = 112 nanoseconds", 
        complexity: "Saves 90ns on 90% of requests", 
        desc: "EAT Formula: 1) TLB Hit Case (90%): TLB lookup + Memory access = 2ns + 100ns = 102ns. 2) TLB Miss Case (10%): TLB lookup + 2 * Memory access (one for page table, one for data) = 2ns + 200ns = 202ns. 3) Combined EAT = 0.90 * (102ns) + 0.10 * (202ns) = 91.8ns + 20.2ns = 112ns." 
      },
      { 
        method: "Banker's Safety State Math", 
        syntax: "Resource Allocation Need Matrix", 
        params: "Allocated=[0 1 0], Max=[7 5 3], Available=[3 3 2]", 
        output: "Need Matrix = [7 4 3]", 
        complexity: "Check if Available >= Need for safety", 
        desc: "Banker's calculation for Process P1: 1) Need[1] = Max[1] - Allocation[1] = [7 5 3] - [0 1 0] = [7 4 3]. 2) To check if P1 can be allocated: Is Need [7 4 3] <= Available [3 3 2]? No, request denied (insufficient resources). P1 must wait. 3) Safety Sequence: If another process P2 has Need [1 2 2] <= [3 3 2], allocate to P2. P2 terminates, releasing its allocation back, increasing Available vector." 
      },
      { 
        method: "FIFO vs LRU Page Replacement Math", 
        syntax: "Page fault trace comparison", 
        params: "3 Frames, Reference String: 7, 0, 1, 2, 0, 3", 
        output: "FIFO = 5 faults, LRU = 5 faults", 
        complexity: "LRU tracks usage recency", 
        desc: "Step-by-step Page replacements: \n- FIFO trace: 1) Load 7 [7,x,x] (fault 1). 2) Load 0 [7,0,x] (fault 2). 3) Load 1 [7,0,1] (fault 3). 4) Load 2, evict oldest 7 [2,0,1] (fault 4). 5) Access 0 [2,0,1] (Hit!). 6) Load 3, evict oldest 0 [2,3,1] (fault 5). Total FIFO Faults = 5. \n- LRU trace: 1) Load 7 [7,x,x] (fault 1). 2) Load 0 [7,0,x] (fault 2). 3) Load 1 [7,0,1] (fault 3). 4) Load 2, evict least recently used 7 [2,0,1] (fault 4). 5) Access 0, update recency [2,1,0] (Hit!). 6) Load 3, evict least recently used 1 [2,3,0] (fault 5). Total LRU Faults = 5." 
      },
      { 
        method: "Disk Scheduling Seek count Math", 
        syntax: "SSTF Seek Cylinder Distance", 
        params: "Initial Head = 50, Queue = [82, 170, 43, 140, 24]", 
        output: "Head Trace: 50 -> 43 -> 24 -> 82 -> 140 -> 170", 
        complexity: "Total Cylinder Seek distance = 172 cylinders", 
        desc: "SSTF (Shortest Seek Time First) Math: 1) Initial head is 50. Calculate distances to all pending cylinders: dist(43)=7, dist(24)=26, dist(82)=32. Closest is 43. Move Head to 43 (seek=7). 2) From 43, closest is 24 (seek=19). Head moves to 24. 3) Remaining: [82, 140, 170]. From 24, closest is 82 (seek=58). 4) From 82, closest is 140 (seek=58). 5) From 140, closest is 170 (seek=30). 6) Total head movement = 7 + 19 + 58 + 58 + 30 = 172 cylinders." 
      }
    ]
  }
];
