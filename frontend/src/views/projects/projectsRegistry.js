export const projectsList = [
  {
    id: "verfalarm",
    title: "Verfalarm",
    subtitle: "Intelligent Zero-Waste Kitchen & Food Inventory Platform",
    tagline: "An automated inventory tracker with OCR receipt scanning, Gemini AI recipe generation, and reactive notification schedules.",
    signatureColor: "fuchsia",
    overview: {
      problem: "Food waste is a global crisis, with households contributing significantly due to forgotten pantry items and missed expiration dates. Consumers lack an automated, intelligent way to track their inventory, receive timely alerts before spoilage, and discover recipes that utilize soon-to-expire ingredients.",
      useCase: "Verfalarm is an intelligent zero-waste kitchen management platform. Users scan grocery receipts via OCR, which automatically populates their digital pantry. The system calculates estimated expiration dates, sends automated email alerts via scheduled crons, and utilizes AI (Google Gemini) to generate recipes based on expiring ingredients.",
      motivation: "To build a highly cohesive, robust full-stack application demonstrating mastery over modern architectural patterns: AI integration, background task scheduling, stateless JWT security, client-side OCR, and relational data integrity.",
      architecture: "The system follows a classic decoupled 3-tier architecture: 1. Frontend (React 19 SPA built with Vite and Tailwind CSS), 2. Backend (Java 21, Spring Boot 3.3.0 REST API), 3. Database (PostgreSQL 15 with Hibernate ORM, managed via Flyway migrations)."
    },
    techStack: {
      frontend: ["React 19", "TypeScript", "Vite", "React Router v7", "TanStack Query", "Tailwind CSS v4", "Lucide Icons", "Tesseract.js", "Recharts"],
      backend: ["Java 21", "Spring Boot 3.3.0 (Web, Data JPA, Security, Mail, Validation)", "Google Gemini API SDK"],
      database: ["PostgreSQL 15 (with Hibernate ORM)", "Flyway for schema versioning"],
      security: ["Spring Security", "Stateless JWT authentication", "BCrypt password hashing"],
      infrastructure: ["Maven", "Docker Compose", "Vercel", "Render", "Supabase / Neon"]
    },
    workspaceTrees: {
      backend: [
        "pom.xml (Maven config & dependencies)",
        "Dockerfile (Multi-stage JRE 21 alpine build)",
        "src/main/resources/",
        "  ├── application.yml (Environment configs for DB, JWT, SMTP, Gemini)",
        "  ├── db/migration/ (Flyway versioned SQL scripts: V1__Init.sql, V2__...)",
        "  └── templates/ (Thymeleaf HTML templates for dynamic email warning generation)",
        "src/main/java/com/verfalarm/backend/",
        "  ├── ai/ (GeminiClient, RecipeAIService interfacing with external model APIs)",
        "  ├── config/ (SecurityConfig, JwtAuthenticationFilter CORS setup, DataSeeder)",
        "  ├── controller/ (REST Endpoints exposing Pantry, OCR, Auth, and AI actions)",
        "  ├── dto/ (Data Transfer Objects decoupling internal entities from API payloads)",
        "  ├── exception/ (GlobalExceptionHandler mapped via @ControllerAdvice mapping exceptions)",
        "  ├── model/ (@Entity definitions representing SQL tables: User, PantryItem, Recipe)",
        "  ├── repository/ (JpaRepository interfaces executing DB queries)",
        "  ├── scheduler/ (@Scheduled cron jobs: AutoDiscardScheduler, EmailNotificationScheduler)",
        "  ├── service/ (Core business layers managing @Transactional database boundaries)",
        "  └── util/ (Pure static helper functions)"
      ],
      frontend: [
        "package.json (NPM scripts & React 19 dependencies)",
        "vite.config.ts (Vite bundler and proxy definitions forwarding /api -> Spring backend)",
        "tailwind.config.js (Tailwind stylesheet styles and extensions)",
        "src/",
        "  ├── assets/ (Static SVGs and brand assets)",
        "  ├── components/ (Atomic UI primitives: Button, Card, Modal, Input)",
        "  ├── context/ (React Context providers: AuthContext, ThemeContext)",
        "  ├── features/ (Domain modules: auth, pantry inventory, scanner page, recipes)",
        "  ├── services/ (Axios instances with interceptors to automatically attach Bearer JWTs)",
        "  ├── types/ (TypeScript interfaces for payload mappings)",
        "  ├── App.tsx (Root route mappings mapping layouts to page trees)",
        "  └── main.tsx (DOM target mounting QueryClient and global context providers)"
      ]
    },
    deepDives: {
      frontend: [
        {
          file: "PantryPage.tsx",
          purpose: "The central inventory dashboard where users view, filter, and manage their food items.",
          hooks: "useQuery (PantryItem[]), useMutation (create, useItem, discardItem).",
          lifecycle: "Fetches pantry database array on mount. Employs useMemo to cache filtered items, preventing search actions from triggering expensive layout updates across list siblings.",
          perfNotes: "Query client caches list cache instantly. If failures happen, rollback caches prevent UI lockouts.",
          qa: {
            q: "How do you handle rapid consecutive state updates when a user checks off multiple items quickly?",
            a: "We use optimistic UI updates via TanStack Query's onMutate callback. We immediately update the local cache to reflect the checked state and rollback to previous snapshot state if the backend mutation fails, ensuring zero-latency perceived performance."
          }
        },
        {
          file: "ScannerPage.tsx",
          purpose: "Handles automated data entry via client-side OCR on grocery receipts.",
          hooks: "Tesseract worker hook, state triggers tracking scanning progress.",
          lifecycle: "1. Upload receipt image -> 2. Tesseract.recognize runs in client Web Worker (prevents main thread lock) -> 3. Send text block to backend -> 4. Map structured pantry DTO list to confirmation table.",
          perfNotes: "Running client-side OCR keeps server instances free of GPU intensive calculations.",
          qa: {
            q: "How do you handle OCR reading errors or noisy scans?",
            a: "We present a reviewable confirmation spreadsheet before database ingestion. This allows users to double check quantities and change incorrect values before hitting Save Batch."
          }
        },
        {
          file: "AIRecipesPage.tsx",
          purpose: "Suggests zero-waste recipes based on the user's active expiring inventory.",
          hooks: "useMutation (ai-generate)",
          lifecycle: "Fires selected inventory ingredient IDs inside payload array to backend. Renders skeleton loading cards until Gemini returns details.",
          perfNotes: "Aggressively caches AI responses based on selected ingredient hash parameters to prevent redundant API fees.",
          qa: {
            q: "How do you prevent rapid clicks from overloading backend Gemini endpoints?",
            a: "We debounce the submit action button and store temporary session results to prevent multiple generation queries within short cooldown windows."
          }
        },
        {
          file: "AuthContext.tsx",
          purpose: "Provides global session contexts (token persistence, logout, routing).",
          hooks: "useContext",
          lifecycle: "Wraps root tree. Mounts user parameters. Saves JWT to localStorage on login; removes values and forces redirect on logout.",
          perfNotes: "Memoizes user parameters so that context providers don't trigger layout-wide resets.",
          qa: {
            q: "Is localStorage safe for JWT token storage in high-security applications?",
            a: "localStorage is vulnerable to XSS attacks if malicious scripts run on the domain. For commercial platforms, storing JWTs inside HttpOnly, Secure, SameSite cookies is preferred to prevent programmatic theft."
          }
        }
      ],
      backend: [
        {
          file: "PantryController.java",
          purpose: "Exposes REST endpoints for pantry management.",
          endpoints: [
            "GET /api/pantry (Returns User items)",
            "POST /api/pantry/batch (Validates list and saves batch)",
            "POST /api/pantry/{id}/use (Marks item as consumed)"
          ],
          flow: "Tomcat server -> DispatcherServlet -> JwtAuthenticationFilter (resolves user) -> Controller -> Service -> Repository -> Database.",
          qa: {
            q: "What happens if a user tries to delete an item belonging to another user?",
            a: "The Controller passes the authenticated User object. The Service layer queries the database item, and explicitly asserts 'if (!item.getUser().getId().equals(currentUser.getId()))'. If mismatched, it throws a custom SecurityException mapping to HTTP 403 Forbidden."
          }
        },
        {
          file: "RecipeAIService.java",
          purpose: "Constructs prompts and fetches recipe guidelines from Google Gemini.",
          caching: "Implements an in-memory ConcurrentHashMap cache using ingredient IDs hashes as keys.",
          qa: {
            q: "Why use an in-memory map instead of Redis for caching?",
            a: "For MVP scale, ConcurrentHashMap avoids the infrastructure overhead of deploying Redis. However, in a multi-node, horizontally scaled production environment, an in-memory cache leads to cache misses across different JVM instances. Redis would be necessary for distributed caching."
          }
        },
        {
          file: "EmailNotificationScheduler.java",
          purpose: "Background daemon verifying item status and dispatching warning emails.",
          trigger: "@Scheduled(cron = '0 0 * * * *') (Runs hourly checks)",
          qa: {
            q: "What happens if the mail server goes down mid-run?",
            a: "In a basic setup, the exception will crash the execution thread, halting alerts for subsequent users. In production, we push email tasks to an async Message Queue (like RabbitMQ or AWS SQS) and apply Spring Retry annotations (@Retryable) to isolate and retry failed runs."
          }
        }
      ]
    },
    architectureFlows: [
      {
        title: "stateless jwt authentication",
        description: "1. Register/Login POST request -> 2. AuthService encodes password via BCrypt -> 3. JwtTokenProvider generates HMAC-SHA256 signature containing email claims -> 4. Token returned to client. Subsequent requests attach token as Bearer header. JwtAuthenticationFilter intercepts and validates mathematically."
      },
      {
        title: "database relational schema",
        description: "users table: id (UUID, PK), email (Unique), password_hash, created_at.\npantry_items table: id (UUID, PK), user_id (FK -> users.id), name, expiry_date, status, created_at.\nConstraint: ON DELETE CASCADE automatically sweeps child inventory records if a parent profile is deleted. Composite indexes are placed on (user_id, status) to optimize retrieval performance from O(N) to O(log N)."
      },
      {
        title: "web-worker ocr scanner flow",
        description: "1. Image upload in ScannerPage -> 2. Initialize Tesseract WebAssembly worker (running on separate thread to keep UI interactive) -> 3. Extract text lines -> 4. POST lines to /api/ocr/text -> 5. OCRService parses text using regex lookaheads, filtering out noise words like TAX/TOTAL -> 6. DTO returned to React review grid."
      }
    ],
    designTradeoffs: [
      {
        title: "React (SPA) vs. Angular (Framework)",
        tradeoff: "React offers flexibility and a massive ecosystem of libraries like TanStack Query. However, it requires developers to make many custom architectural decisions (bundling, routing, state managers) that are batteries-included in Angular."
      },
      {
        title: "Spring Boot vs. Node.js/Express",
        tradeoff: "Spring Boot offers robust multithreading, enterprise-grade declarative transactions (@Transactional), and static compilation safety. Node.js is easier to prototype and performs well for I/O tasks, but becomes hard to maintain with highly complex transactional systems."
      },
      {
        title: "Stateless JWT vs. Stateful Sessions",
        tradeoff: "Stateless JWTs do not require session storage lookup, enabling seamless horizontal scaling of backend servers. However, this model makes instant token revocation difficult without deploying a Redis-backed token blocklist."
      }
    ],
    interviewQA: [
      {
        q: "The email scheduler is crashing because the database has grown, and pulling all users into memory causes an OutOfMemoryError. How do you fix this?",
        a: "I would refactor the database retrieval to process users in chunks using Pageable. Furthermore, I would decouple the processing: the scheduler queries user IDs and pushes them to an async queue (RabbitMQ), which worker threads then consume to generate and send emails."
      },
      {
        q: "How does TanStack Query handle stale data when the user switches browser tabs?",
        a: "By default, refetchOnWindowFocus is enabled. When the browser tab gains focus, TanStack Query triggers a background refetch. If the data has changed, it updates the cache and triggers a surgical layout re-render."
      },
      {
        q: "Your application uses @Transactional. What happens if you call a @Transactional method from another method inside the same class?",
        a: "The transaction will not be started! Spring implements transactions using AOP proxies. When a method calls another method internally (using 'this'), it bypasses the proxy container wrapper, which means the database transaction aspect is not invoked."
      },
      {
        q: "How do you protect your endpoints from Insecure Direct Object Reference (IDOR) attacks?",
        a: "We use UUIDs instead of auto-incrementing integer IDs to make entity identifiers unguessable. More importantly, we always validate ownership inside the service layer by checking if the resource's user ID matches the authenticated principal ID before completing any updates."
      },
      {
        q: "How should database connection pools (like HikariCP) be configured to optimize performance under high concurrency?",
        a: "A common mistake is oversizing the pool. According to PostgreSQL benchmarks, the optimal formula is: Pool Size = (Core Count * 2) + Effective Spindle Count. Oversizing leads to context switching overhead at the CPU level. We size HikariCP precisely, keep connection timeouts low, and use asynchronous query execution (CompletableFutures) for non-blocking I/O routes."
      },
      {
        q: "How do you identify and resolve Hibernate's N+1 query issue in your JPA relationships?",
        a: "The N+1 issue happens when querying parent objects (e.g. users) and accessing lazy-loaded children (e.g. pantry items) inside a loop, causing N additional SQL calls. We resolve this by using JOIN FETCH JPQL queries: 'SELECT u FROM User u JOIN FETCH u.pantryItems'. Alternatively, we can define @EntityGraph annotations to surgically describe which relationships should be eagerly fetched in single-join SQL queries."
      },
      {
        q: "If JWT authentication is stateless, how do you handle immediate token revocation (e.g. user logout, password reset, or account compromise)?",
        a: "Because stateless tokens are verified cryptographically without database checks, they cannot be revoked on the fly. To mitigate this: 1. Set short lifetimes (15 mins) on access tokens and use longer-term refresh tokens. 2. Implement a token blocklist in Redis, storing revoked token signatures for the duration of their remaining expiration time. The security filter checks Redis in O(1) time before validating signatures."
      },
      {
        q: "Explain what triggers a CORS preflight request and how you handle it inside Spring Security.",
        a: "Cross-Origin Resource Sharing (CORS) preflights are sent by browsers as an OPTIONS request before executing 'non-simple' requests (e.g. custom headers like Authorization, or content-types other than application/x-www-form-urlencoded). We handle this by configuring a CorsConfigurationSource bean in our SecurityFilterChain, permitting OPTIONS preflights explicitly and setting 'Access-Control-Allow-Origin' and 'Access-Control-Allow-Methods' headers."
      },
      {
        q: "When running Tesseract.js in a single-page React app, how do you prevent Web Worker memory leaks?",
        a: "Spawning a new Tesseract worker on every file upload can rapidly consume browser heap memory since workers are not automatically garbage collected. To prevent leaks: 1. Maintain a single, reusable worker instance cached in a hook context or global state. 2. Explicitly call worker.terminate() inside useEffect cleanup callbacks when components unmount."
      },
      {
        q: "If you needed to scale your backend horizontally, what changes would be required for scheduled background crons (@Scheduled)?",
        a: "Using Spring's native @Scheduled in a multi-instance deployment causes execution overlap: all instances will run the cron concurrently (e.g. sending duplicate emails). To resolve this, we must implement distributed lock managers like ShedLock. ShedLock uses a shared database table (or Redis) to ensure only one JVM instance obtains the cron execution lock at a time."
      }
    ]
  }
];
