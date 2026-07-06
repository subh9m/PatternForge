export const osConcepts = [
  {
    id: "os_basics_arch",
    num: "OS.1",
    title: "OS Basics & System Architectures",
    desc: "Fundamentals of Operating Systems: types of systems, system calls vs library calls, user mode vs kernel mode, bootstrap procedures, and NUMA vs SMP memory topologies.",
    declaration: `// OS Core Architecture Cheat Sheet
- Mode Switch Overhead: User Mode (limited privileges) <--> Kernel Mode (full hardware privileges via trap).
- Boot Sequence: Power-On -> Execution of ROM Bootstrap (BIOS/UEFI) -> Load Bootloader -> Load Kernel -> Init Process.
- System Calls: Trap instruction triggers a context switch to ring 0; library calls are wrapper functions in user space.
- Multiprocessing Topologies: SMP (Shared central bus, unified RAM latency) vs NUMA (Local bus per CPU node, variable memory access times).`,
    internalImplementation: `/* ----------------- SYSTEM CALL EXECUTION FLOW (TRAP MECHANISM) ----------------- */

   [ User Space ] (Ring 3)                 | [ Kernel Space ] (Ring 0)
   User Application                        |
       │                                   |
       ▼ (Library Call: e.g. printf())     |
   C Library Wrapper                       |
       │                                   |
       ▼ (Set call number in EAX)          |
   TRAP / INT 0x80 / SYSENTER ─────────────┼────────► System Call Handler
                                           |              │
                                           |              ▼
                                           |          Execute Kernel Service
                                           |              │
                                           |              ▼
   Resume Execution ◄──────────────────────┼────────── Sysret / IRET
   (Clear register state)                  |`,
    methods: [
      { 
        method: "What is an OS & its functions?", 
        syntax: "Kernel + Shell + Daemons", 
        params: "Hardware, Software, CPU, RAM", 
        output: "Resource coordination, protection", 
        complexity: "O(1) scheduling / management", 
        desc: "An intermediary software managing hardware resources. Functions: memory, process, device, file management, and security." 
      },
      { 
        method: "Why is the OS important?", 
        syntax: "Interface Layer", 
        params: "User <-> Hardware", 
        output: "Hardware abstraction, execution", 
        complexity: "Negligible wrapper overhead", 
        desc: "Without an OS, computer hardware cannot coordinate or run applications; it provides the execution environment and standard system calls." 
      },
      { 
        method: "Multiprocessor System Benefits", 
        syntax: "Shared memory multiprocessor", 
        params: "N CPUs, 1 Shared Memory", 
        output: "Increased throughput, reliability", 
        complexity: "Throughput: < N * (Single CPU speed)", 
        desc: "Wide throughput scaling and high reliability (if one processor fails, others pick up tasks). Cost-effective due to shared peripherals/RAM." 
      },
      { 
        method: "What is GUI?", 
        syntax: "Graphical User Interface", 
        params: "Windows, icons, pointers", 
        output: "WIMP graphics interface", 
        complexity: "High memory/render overhead", 
        desc: "Visual-based interface allowing users to point-and-click instead of typing command-line instructions. Examples: Windows, macOS, iOS." 
      },
      { 
        method: "Bootstrap Program in OS", 
        syntax: "BIOS / UEFI -> Grub -> Kernel", 
        params: "Non-volatile ROM (EEPROM)", 
        output: "Kernel loaded into RAM", 
        complexity: "Executed once on boot", 
        desc: "The initial code executed on system startup. Initializes hardware registers, locates the OS kernel on disk, and loads it into memory." 
      },
      { 
        method: "RTOS (Real Time OS)", 
        syntax: "VxWorks, FreeRTOS, QNX", 
        params: "Hard vs Soft task deadlines", 
        output: "Deterministic event handling", 
        complexity: "Deterministic scheduling O(1)", 
        desc: "OS for time-critical systems where execution must happen in a guaranteed timeframe. Hard (fail on miss), Firm (degrade), Soft (delayed)." 
      },
      { 
        method: "Time Sharing System", 
        syntax: "Rapid CPU task switching", 
        params: "Timer interrupts (10-100ms)", 
        output: "Simultaneous multi-user illusion", 
        complexity: "Context switch overhead", 
        desc: "Switches the CPU rapidly among multiple active users/processes using time slices (quantum) so they can interact concurrently." 
      },
      { 
        method: "Latency vs Throughput", 
        syntax: "Response Time vs Work Done", 
        params: "Interrupt triggers, I/O tasks", 
        output: "System performance metrics", 
        complexity: "Tradeoff based on scheduling", 
        desc: "Latency: time taken to respond to an event/request. Throughput: total jobs completed in unit time. Optimized differently based on use case." 
      },
      { 
        method: "Interrupt vs Trap vs Exception", 
        syntax: "Asynchronous vs Synchronous", 
        params: "Hardware signals, INT, software error", 
        output: "ISR / Trap handler execution", 
        complexity: "Context saving + vector table seek", 
        desc: "Interrupt: hardware event (I/O done). Trap: deliberate software request (system call). Exception: execution error (divide-by-zero)." 
      },
      { 
        method: "System Call vs Library Call", 
        syntax: "sys_read() vs fread()", 
        params: "User mode to Kernel mode boundary", 
        output: "Direct hardware execution vs buffer", 
        complexity: "Syscall is ~10-100x slower", 
        desc: "System call requests kernel privilege services (e.g. read()). Library call is a user-space wrapper (e.g. fread() with caching)." 
      },
      { 
        method: "User Mode vs Kernel Mode", 
        syntax: "Ring 3 (User) vs Ring 0 (Kernel)", 
        params: "Hardware privilege flags", 
        output: "Crash isolation, protected memory", 
        complexity: "Hardware bit check", 
        desc: "User Mode blocks raw hardware access. Kernel Mode allows direct CPU/memory control, preventing user program faults from crashing the machine." 
      },
      { 
        method: "Asymmetric Clustering", 
        syntax: "Active-Passive failover nodes", 
        params: "Primary worker + Hot Standby Node", 
        output: "High availability fallback", 
        complexity: "Heartbeat monitoring polling", 
        desc: "One cluster node acts as a standby, monitoring the active primary node. If primary fails, the standby instantly boots to resume services." 
      },
      { 
        method: "NUMA vs SMP architecture", 
        syntax: "Non-Uniform vs Symmetric RAM", 
        params: "Memory bus, core locality", 
        output: "Scale-up multi-socket platforms", 
        complexity: "NUMA local access is ~2x faster", 
        desc: "SMP shares one memory bus (bottleneck). NUMA allocates local memory banks to specific CPU sockets to reduce memory access latency." 
      },
      { 
        method: "OS vs Kernel", 
        syntax: "System Software vs Core Engine", 
        params: "Utilities, GUI, File managers", 
        output: "Complete distribution suite", 
        complexity: "OS manages Kernel + Userspace", 
        desc: "Kernel is the inner core that controls hardware and process lifecycles. OS is the full software package including shell, compilers, and GUI." 
      }
    ]
  },
  {
    id: "os_process_threads",
    num: "OS.2",
    title: "Process & Thread Management",
    desc: "Process address space segments, thread models, lightweight processes (LWP), zombie and orphan states, context switching mechanisms, and IPC communication strategies.",
    declaration: `// Process Layout & Lifecycle Cheat Sheet
- Process Control Block (PCB): Holds PID, Program Counter, registers, memory limits, list of open files.
- Thread control block (TCB): Holds TID, stack pointer, registers, and program counter.
- Address Space: [ Text (Code) ] -> [ Data (Static/Globals) ] -> [ Heap (Dynamic malloc) ] -> [ Stack (Local variables, calls) ].
- Orphan Process: Parent dies first, process is adopted by init/systemd (PID 1).
- Zombie Process: Process terminates, parent hasn't read exit status via wait().`,
    internalImplementation: `/* ----------------- PROCESS ADDRESS SPACE SEGMENTS ----------------- */

   High Memory Address  ┌────────────────────────────────────┐
                        │   Stack (Grows Downward)           │
                        │   - Arguments, local variables     │
                        ├─────────────────┬──────────────────┤
                        │                 ▼                  │
                        │                                    │
                        │                 ▲                  │
                        ├─────────────────┴──────────────────┤
                        │   Heap (Grows Upward via brk/sbrk) │
                        │   - Dynamically allocated memory   │
                        ├────────────────────────────────────┤
                        │   BSS Segment (Uninitialized data) │
                        ├────────────────────────────────────┤
                        │   Data Segment (Initialized globals)│
                        ├────────────────────────────────────┤
                        │   Text Segment (Compiled code)     │
   Low Memory Address   └────────────────────────────────────┘`,
    methods: [
      { 
        method: "What is a Process?", 
        syntax: "A program in execution state", 
        params: "PID, PCB, virtual address space", 
        output: "Active memory entity", 
        complexity: "Heavyweight creation overhead", 
        desc: "An active entity containing program code, registers, stack pointer, data segment, and heap allocated dynamically at runtime." 
      },
      { 
        method: "States of a Process", 
        syntax: "New -> Ready -> Running -> Wait -> Terminated", 
        params: "OS Schedulers state hooks", 
        output: "State machine transitions", 
        complexity: "O(1) state queue insertion", 
        desc: "Processes transition: New (created), Ready (waiting for CPU), Running (on CPU), Waiting (I/O block), Terminated (finished)." 
      },
      { 
        method: "What is a Thread?", 
        syntax: "Lightweight Process (LWP)", 
        params: "TID, Registers, Stack, PC", 
        output: "Parallel execution flow within process", 
        complexity: "Fast context switch / creation", 
        desc: "A basic unit of CPU utilization. Multiple threads of a process share the same text, data, heap, and file descriptors but have unique stacks." 
      },
      { 
        method: "Process vs Thread", 
        syntax: "Fork vs Thread Spawn", 
        params: "Isolation, address space", 
        output: "IPC vs direct memory share", 
        complexity: "Process creation is ~10x slower", 
        desc: "Processes are independent, secure, and share memory via IPC only. Threads share address spaces directly, risking data races but saving overhead." 
      },
      { 
        method: "What is Context Switching?", 
        syntax: "Save registers -> Load next registers", 
        params: "CPU Registers, PC, Page Tables", 
        output: "Active execution transfer", 
        complexity: "Microsecond cost (depends on cache flushes)", 
        desc: "The OS saves the execution context of the active process/thread into its PCB/TCB and restores the context of the next scheduled task." 
      },
      { 
        method: "Process CS vs Thread CS", 
        syntax: "Cache Flush vs Cache Keep", 
        params: "MMU Page tables, TLB cache entries", 
        output: "Different MMU translation mappings", 
        complexity: "Thread CS is significantly faster", 
        desc: "Process switch requires swapping page directory bases (CR3 in x86), which invalidates the TLB cache. Thread switches preserve TLB mapping." 
      },
      { 
        method: "Zombie Process", 
        syntax: "Status: Z (Defunct)", 
        params: "Terminated child, active parent", 
        output: "PCB entry remains in process table", 
        complexity: "Consumes 1 slot in process table", 
        desc: "A process that completed execution but its parent hasn't reaped its exit status via wait(). Entry is kept to report status." 
      },
      { 
        method: "Cascading Termination", 
        syntax: "Parent exits -> Kill all children", 
        params: "Process Tree hierarchy", 
        output: "Recursive process deletion", 
        complexity: "O(N) process tree traversal", 
        desc: "Triggered by the OS. If a parent terminates, the kernel recursively terminates all its children, preventing orphan processes." 
      },
      { 
        method: "IPC Mechanisms", 
        syntax: "Inter-Process Communication", 
        params: "Pipes, MQ, Shared Memory, Sockets", 
        output: "Data sharing across boundaries", 
        complexity: "Shared memory is fastest (no copies)", 
        desc: "Allows processes to exchange data. Pipes (local streaming), Message Queues (discrete packets), Sockets (networked), Shared Memory (fast direct access)." 
      },
      { 
        method: "Pipes in OS", 
        syntax: "pipe(fd[2])", 
        params: "fd[0] (read), fd[1] (write)", 
        output: "Unidirectional data stream", 
        complexity: "Buffer copy overhead", 
        desc: "A unidirectional channel where the output of one process is directed as input to another. Handled as a circular buffer in memory." 
      },
      { 
        method: "Sockets in OS", 
        syntax: "socket(domain, type, protocol)", 
        params: "IP Address + Port Number", 
        output: "Bidirectional network endpoints", 
        complexity: "TCP/IP stack processing overhead", 
        desc: "An endpoint for communication between processes across a network or locally. Stream (TCP) or Datagram (UDP) types." 
      },
      { 
        method: "Process Sections", 
        syntax: "Text + Data + BSS + Heap + Stack", 
        params: "Compiler, MMU mappings", 
        output: "Runtime virtual address sections", 
        complexity: "Dynamic mapping per segment", 
        desc: "Text (compiled instructions), Data (initialized globals), BSS (uninitialized globals), Heap (malloc'd bytes), Stack (local variables, registers)." 
      }
    ]
  },
  {
    id: "os_cpu_scheduling",
    num: "OS.3",
    title: "CPU Scheduling Algorithms",
    desc: "CPU dispatcher mechanisms, preemptive vs non-preemptive algorithms, First-Come-First-Serve (FCFS), Round Robin (RR), Shortest-Job-First (SJF), and Multi-Level Feedback Queues.",
    declaration: `// Scheduling Metrics & Formulas
- Turnaround Time (TAT) = Completion Time - Arrival Time
- Waiting Time (WT) = Turnaround Time - Burst Time
- Response Time (RT) = Time of first CPU allocation - Arrival Time
- Scheduling goals: Maximize CPU Utilization and Throughput; Minimize TAT, WT, and Response Latency.`,
    internalImplementation: `/* ----------------- CPU DISPATCHER & SCHEDULING QUEUE ----------------- */

  [ Ready Queue ] ────────► [ CPU Scheduler ] ────────► [ Dispatcher ] ────────► [ CPU Core ]
     Process 1                    │                          │                     (Running)
     Process 2                    ├─ Selects Next Process    ├─ Context Switch
     Process 3                    └─ (e.g. SJF, RR)          ├─ Load PC
                                                             └─ Switch to User Mode`,
    methods: [
      { 
        method: "Scheduling Algorithm Definition", 
        syntax: "Dispatcher scheduling loop", 
        params: "Ready processes queue", 
        output: "CPU time allocation", 
        complexity: "O(log N) min-heap / queue select", 
        desc: "A mechanism used by the OS to allocate CPU cores to processes in the ready queue, aiming for fairness, efficiency, and throughput." 
      },
      { 
        method: "Preemptive vs Non-Preemptive", 
        syntax: "Yield on Interrupt vs Run to Finish", 
        params: "Timer ticks, priorities", 
        output: "Forced context switch vs voluntary yield", 
        complexity: "Preemptive increases context switch frequency", 
        desc: "Preemptive schedules can interrupt a running process mid-execution (timer tick). Non-preemptive runs the process until termination or I/O block." 
      },
      { 
        method: "FCFS (First Come First Serve)", 
        syntax: "FIFO queue scheduler", 
        params: "Arrival order selection", 
        output: "Non-preemptive execution", 
        complexity: "O(1) queue management", 
        desc: "Simplest scheduler. Processes execute in order of arrival. Suffers from the Convoy Effect (long process blocks short ones)." 
      },
      { 
        method: "Round Robin (RR)", 
        syntax: "Time slice quantum (Q)", 
        params: "Preemptive timer ticks", 
        output: "Cyclic time-sliced execution", 
        complexity: "O(1) cyclic queue rotation", 
        desc: "Each process gets a slice of CPU time (quantum). If Q is large, it acts as FCFS. If Q is tiny, context switch overhead dominates." 
      },
      { 
        method: "Shortest Job First (SJF)", 
        syntax: "Select minimum burst time", 
        params: "Burst time prediction", 
        output: "Optimal average waiting time", 
        complexity: "O(log N) sorting heap", 
        desc: "Selects the process with the shortest CPU burst next. Provably optimal for average waiting time. Suffers from starvation of long processes." 
      },
      { 
        method: "Starvation vs Aging", 
        syntax: "Lack of CPU access vs Priority bump", 
        params: "Waiting time threshold", 
        output: "Fair resource access fallback", 
        complexity: "Periodic scan O(N) aging routine", 
        desc: "Starvation: low priority jobs wait indefinitely. Aging: mitigates this by gradually raising the priority of waiting processes over time." 
      },
      { 
        method: "MLFQ (Multi-Level Feedback Queue)", 
        syntax: "Multiple priority queues with promotion", 
        params: "Quantum length scaling per level", 
        output: "Dynamic priority CPU allocation", 
        complexity: "O(1) queue lookups", 
        desc: "Adapts priority based on behavior. I/O-bound jobs stay high priority; CPU-bound jobs drop to lower queues with longer quantums." 
      },
      { 
        method: "Multiprogramming Objective", 
        syntax: "Overlapping CPU with I/O", 
        params: "RAM capacity, job pool", 
        output: "Maximized CPU utilization", 
        complexity: "Monitored via CPU usage metrics", 
        desc: "Ensures the CPU always has something to run. When one process blocks for disk I/O, the scheduler immediately switches to another." 
      }
    ]
  },
  {
    id: "os_memory_paging",
    num: "OS.4",
    title: "Memory Management & Paging",
    desc: "Physical and virtual address translation, Paging vs Segmentation, Translation Lookaside Buffers (TLB), Page Replacement Algorithms, Thrashing, and Fragmentation mitigation.",
    declaration: `// Memory Mappings & Equations
- Virtual Address (VA) = [ Page Number (p) | Offset (d) ]
- Physical Address (PA) = [ Frame Number (f) | Offset (d) ]
- Effective Memory Access Time (EAT) = (1 - Hit Ratio) * (2 * Memory Access Time) + Hit Ratio * (TLB Lookup + Memory Access Time)
- Thrashing Criteria: \u03a3 (Working Set Sizes of all active processes) > Total Physical RAM.`,
    internalImplementation: `/* ----------------- VIRTUAL-TO-PHYSICAL ADDRESS TRANSLATION (MMU) ----------------- */

   Virtual Address: [ Page Number (p) | Offset (d) ]
                         │               │
                         ├──► [ TLB ]    │  (TLB Hit: Fast path)
                         │     │         │
                         │     ├─► Frame Number (f) ──┐
                         │     └─► (TLB Miss)         │
                         ▼                            ▼
                 [ Page Table in RAM ] ──────► Physical Address: [ Frame Number (f) | Offset (d) ]`,
    methods: [
      { 
        method: "Primary vs Secondary Memory", 
        syntax: "Volatile (RAM) vs Non-Volatile (Disk)", 
        params: "Access speed, addressing, persistence", 
        output: "CPU direct access vs block read", 
        complexity: "RAM: ~100ns | SSD: ~100us", 
        desc: "Primary (RAM) is fast, volatile, byte-addressable. Secondary (SSD/HDD) is slow, persistent, and block-addressable." 
      },
      { 
        method: "Paging vs Segmentation", 
        syntax: "Fixed-size pages vs Logical segments", 
        params: "Physical frames vs logical divisions", 
        output: "Non-contiguous hardware allocation", 
        complexity: "Paging avoids external fragmentation", 
        desc: "Paging divides memory into fixed-size physical blocks (e.g. 4KB). Segmentation divides memory logically based on program modules." 
      },
      { 
        method: "Demand Paging & Page Faults", 
        syntax: "Lazy loading page allocation", 
        params: "Present/Absent bit check in Page Table", 
        output: "Hardware trap, disk read page-in", 
        complexity: "Page fault disk fetch is extremely slow (~ms)", 
        desc: "Pages are loaded only when referenced. Accessing a non-loaded page raises a page fault trap, prompting the OS to read it from swap space." 
      },
      { 
        method: "TLB (Translation Lookaside Buffer)", 
        syntax: "Hardware associative cache in MMU", 
        params: "Virtual page translations lookup", 
        output: "Speed-up address translation", 
        complexity: "O(1) associative lookup time (~0.5ns)", 
        desc: "A small, ultra-fast hardware cache in the MMU storing recent page table translations, avoiding two-trip memory reads." 
      },
      { 
        method: "Fragmentation: Internal vs External", 
        syntax: "Wasted slot bytes vs Scattered free gaps", 
        params: "Fixed partition limits vs Dynamic placement", 
        output: "Compaction or paging resolution", 
        complexity: "Compaction is highly resource expensive", 
        desc: "Internal: unused bytes inside allocated fixed pages. External: scattered free blocks too small to fit new processes." 
      },
      { 
        method: "Thrashing", 
        syntax: "Page fault loop: swap in <-> swap out", 
        params: "Lack of allocated physical frames", 
        output: "CPU utilization drops to near zero", 
        complexity: "Computer collapses (swapping bottleneck)", 
        desc: "Occurs when processes spend more time paging in/out than executing. Solved by allocating more frames or killing processes." 
      },
      { 
        method: "Copy-On-Write (COW)", 
        syntax: "Share page -> Mark read-only -> Copy on write", 
        params: "fork() execution optimizations", 
        output: "Zero-copy instant process spawn", 
        complexity: "O(1) creation, page copy on mutate", 
        desc: "Allows child and parent to share memory pages safely. Pages are duplicated only when one attempts a write mutation." 
      },
      { 
        method: "Overlays in OS", 
        syntax: "Manual code block swaps", 
        params: "User-space linker overlays loader", 
        output: "Run large files on small RAM", 
        complexity: "High manual programming overhead", 
        desc: "A legacy technique where programs swap code modules manually into memory. Replaced by modern Virtual Memory paging." 
      },
      { 
        method: "Page Size vs Frame Size", 
        syntax: "Virtual bytes partition == Physical partition", 
        params: "MMU address page table configuration", 
        output: "Perfect alignment of blocks mapping", 
        complexity: "Typically configured as 4KB pages", 
        desc: "Page size refers to the partition of virtual memory; frame size is the partition of physical memory. They must be mathematically equal." 
      }
    ]
  },
  {
    id: "os_sync_deadlocks",
    num: "OS.5",
    title: "Process Synchronization & Deadlocks",
    desc: "Critical Section problem, Semaphores (Wait/Signal), Mutexes vs Semaphores, Monitors, Priority Inversion, and Deadlock detection, prevention, and avoidance.",
    declaration: `// Synchronization & Deadlock Cheat Sheet
- Semaphores: Integer variables modified only via atomic wait() [P] and signal() [V] operations.
- Mutex: Binary locking mechanism with a strict ownership contract.
- Priority Inversion: High priority thread blocks on a lock held by low priority thread, which gets preempted by medium priority thread.
- Deadlock: Coffman conditions must hold simultaneously: Mutual Exclusion, Hold & Wait, No Preemption, Circular Wait.`,
    internalImplementation: `/* ----------------- COFFMAN CONDITIONS FOR DEADLOCK ----------------- */

       ┌──────────────┐                  ┌──────────────┐
  ┌───►│  Resource 1  │                  │  Resource 2  │◄───┐
  │    └──────┬───────┘                  └──────┬───────┘    │
  │           ▲                                 ▲            │
  │ Hold      │ Request                         │ Request    │ Hold
  │           │                                 │            │
  │    ┌──────┴───────┐                  ┌──────┴───────┐    │
  └────┤  Process A   │                  │  Process B   │────┘
       └──────────────┘                  └──────────────┘`,
    methods: [
      { 
        method: "Process Synchronization", 
        syntax: "Mutex locks, Semaphores, Monitors", 
        params: "Cooperating processes shared variables", 
        output: "Data consistency, thread-safe memory", 
        complexity: "Lock contention and blocking delay", 
        desc: "Coordinating concurrent access to shared resources to prevent race conditions and preserve data consistency." 
      },
      { 
        method: "Semaphore Operations", 
        syntax: "Wait(S) [P] and Signal(S) [V]", 
        params: "Integer variable S", 
        output: "Atomic wait-loop decrement / increment", 
        complexity: "Atomic check, context switch on block", 
        desc: "Wait(): decrements S. If S <= 0, process blocks. Signal(): increments S. If any processes blocked, unblocks one." 
      },
      { 
        method: "Mutex vs Semaphore", 
        syntax: "Binary Lock vs Counting Signal", 
        params: "Ownership contract, lock recursion", 
        output: "Mutual exclusion vs Signaling mechanism", 
        complexity: "Mutex has lower overhead and is ownership-bound", 
        desc: "Mutex: locking tool with ownership (only lock owner can unlock). Semaphore: signaling mechanism (any thread can trigger signal())." 
      },
      { 
        method: "Reentrancy", 
        syntax: "Concurrently enterable functions", 
        params: "No static/global variables modification", 
        output: "Interrupt-safe execution handlers", 
        complexity: "O(1) stack-based allocation", 
        desc: "A function is reentrant if it can be interrupted mid-execution, re-entered by another thread, and resumed without state corruption." 
      },
      { 
        method: "Priority Inversion & Inheritance", 
        syntax: "Low priority gets priority of high priority", 
        params: "Shared lock thread queues", 
        output: "Starvation bypass for high priority", 
        complexity: "Priority promotion logic processing", 
        desc: "High priority task blocks on a resource held by a low-priority task, while a medium task preempts the low-priority task. Solved by Priority Inheritance." 
      },
      { 
        method: "What is Deadlock?", 
        syntax: "Circular block of resource requests", 
        params: "Processes, resources, locking flags", 
        output: "Locked system state (freeze)", 
        complexity: "O(P * R^2) detection cycle check", 
        desc: "A state where a set of processes are permanently blocked because each process holds a resource and waits for another resource held by another." 
      },
      { 
        method: "Deadlock Conditions (Coffman)", 
        syntax: "Mutual Exclusion + Hold & Wait + No Preemption + Circular Wait", 
        params: "Resource Allocation Graph (RAG) cycles", 
        output: "Deadlock identification criteria", 
        complexity: "All 4 must hold simultaneously", 
        desc: "1. Mutual Exclusion (non-shareable resource). 2. Hold & Wait. 3. No Preemption (cannot force release). 4. Circular Wait (loop dependency)." 
      },
      { 
        method: "Deadlock Prevention vs Avoidance", 
        syntax: "Restricting constraints vs Safe State checks", 
        params: "RAG cycles check, Bankers algorithm", 
        output: "Deadlock-free system guarantee", 
        complexity: "Avoidance check: O(P^2 * R) Banker's cost", 
        desc: "Prevention: breaks one of the 4 Coffman conditions at build-time. Avoidance: dynamically checks state safety before allocating resources." 
      },
      { 
        method: "Monitors in OS", 
        syntax: "Object-oriented ADT encapsulation", 
        params: "Condition variables wait/signal", 
        output: "High-level thread safety wrapper", 
        complexity: "Compiler-generated lock/unlock routines", 
        desc: "An abstract data type providing mutual exclusion automatically. Only one thread can execute a monitor procedure at any given time." 
      },
      { 
        method: "Producer-Consumer Problem", 
        syntax: "Bounded buffer sync coordination", 
        params: "Mutex lock + Empty semaphore + Full semaphore", 
        output: "Synchronized concurrent reads/writes", 
        complexity: "No busy-wait CPU polling", 
        desc: "A classic sync problem. Senders (Producers) write to buffer and wait if full; Receivers (Consumers) read and wait if empty." 
      }
    ]
  },
  {
    id: "os_storage_files",
    num: "OS.6",
    title: "Storage, File Systems & I/O",
    desc: "Disk virtualization using RAID arrays, Index Node (Inode) filesystem lookups, Soft links vs Hard links, Spooling subsystems, and kernel crash diagnostics.",
    declaration: `// File System & Disk Virtualization Metrics
- Hard Link: Creates a directory entry pointing directly to the target file Inode number. Deleting original preserves hard link.
- Soft Link (Symlink): Creates a file whose contents is the string path to target. Deleting original breaks the symlink.
- Inode Data: Metadata container holding File Size, Permissions, Owner UID, Timestamps, and Direct/Indirect block pointers.`,
    internalImplementation: `/* ----------------- HARD LINK VS SYMLINK INODE GRAPH ----------------- */

   Directory Entry [file.txt]  ─────┐
                                    ├────► Inode 12345 (File Metadata) ──► Data Blocks on Disk
   Hard Link Entry [link.txt]  ─────┘

   Symlink Entry [sym.txt] ────────► Path String: "/file.txt" (Needs resolution)`,
    methods: [
      { 
        method: "RAID Levels Configuration", 
        syntax: "RAID 0, 1, 5, 6, 10", 
        params: "Mirroring, Striping, Distributed Parity", 
        output: "Fault tolerance and high speed", 
        complexity: "Throughput scales with physical disk count", 
        desc: "RAID 0 (Striping: fast, zero redundancy). RAID 1 (Mirroring: duplicate). RAID 5 (Block parity: tolerates 1 disk loss). RAID 6 (Double parity: 2 disks)." 
      },
      { 
        method: "What is an Inode?", 
        syntax: "Index Node structure lookup", 
        params: "Inode table key ID", 
        output: "Block mapping, file metadata", 
        complexity: "O(1) inode access time", 
        desc: "A data structure in Unix file systems storing file attributes and disk block pointers, containing all metadata except filename and contents." 
      },
      { 
        method: "Hard Link vs Soft Link", 
        syntax: "Direct pointer vs Path text file", 
        params: "Inode reference counts, cross-volume limits", 
        output: "Inode mapping variations", 
        complexity: "Resolving symlink requires secondary seek", 
        desc: "Hard link points directly to the Inode (shares data, same inode count). Soft link is a path redirect (breaks if target is moved)." 
      },
      { 
        method: "Spooling in OS", 
        syntax: "Simultaneous Peripheral Operations On-Line", 
        params: "Disk buffers printer queues", 
        output: "Non-blocking slow device access", 
        complexity: "O(N) queue stream buffering", 
        desc: "Saves slow peripheral output to disk buffers first, allowing the CPU to resume execution immediately instead of waiting for printers." 
      },
      { 
        method: "Process Crash Handling", 
        syntax: "SIGSEGV trap -> Core Dump -> Clean resources", 
        params: "PID crash interrupt vectors", 
        output: "Core dump diagnostic file", 
        complexity: "Releases page tables and memory mappings", 
        desc: "When a process crashes, the CPU throws a trap. The OS captures the registers, writes a Core Dump file, and releases its RAM pages." 
      },
      { 
        method: "Memory Protection", 
        syntax: "Base and Limit registers / page flags", 
        params: "MMU boundary segment checks", 
        output: "Process isolation sandbox", 
        complexity: "O(1) hardware comparison step", 
        desc: "Ensures a process cannot access another's memory space. Enforced via Base/Limit registers in CPU or page-table permission bits." 
      }
    ]
  }
];
