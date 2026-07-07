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
    patternsAndOops: {
      designPatterns: [
        {
          name: "Dependency Injection / Inversion of Control (IoC)",
          where: "SecurityConfig.java, AuthService.java, EmailService.java, EmailNotificationScheduler.java, AuthContext.tsx",
          why: "Spring's ApplicationContext IoC container creates, configures, and dynamically injects component collaborators (e.g. PasswordEncoder, JwtAuthenticationFilter, or repositories) using constructor injection. This avoids hardcoding class instantiations inside business logic layers, promoting high modularity and mock-based unit testability. On the frontend, React Context API acts as a localized IoC injector, making global authentication states available to deeply nested components without prop-drilling.",
          analogy: "A restaurant kitchen where the head chef receives prepared ingredients from specialized suppliers instead of personally growing and harvesting everything."
        },
        {
          name: "Singleton Pattern",
          where: "Spring Beans (Services, Repositories, Configurations) by default scope",
          why: "Spring manages beans as Singletons within the ApplicationContext scope by default. This guarantees that only one shared, stateless instance of classes like PasswordEncoder or EmailService exists in the JVM heap, saving memory resources and ensuring centralized configuration state. If stateful beans are needed, scope settings are overridden to Prototype.",
          analogy: "A building's central control room that everyone references instead of every single floor installing its own independent power grid."
        },
        {
          name: "Template Method Pattern",
          where: "JwtAuthenticationFilter extending OncePerRequestFilter, React ErrorBoundary extending React.Component",
          why: "The superclass provides the framework's skeleton execution algorithm (e.g. OncePerRequestFilter guarantees execution exactly once per request chain), while subclasses override specific hook methods (doFilterInternal) to implement custom JWT claim validation. In React, Component defines standard lifecycle trees while ErrorBoundary implements custom fallback UI rendering overrides.",
          analogy: "A standardized tax form with fixed calculation paths, but customizable fields for your personal deductions."
        },
        {
          name: "Strategy Pattern",
          where: "EmailService selecting mail providers or dynamic algorithms dynamically",
          why: "Allows switching backend implementations at runtime without code changes at the call site. For instance, the system can choose between sending via local SMTP, SendGrid, or Resend based on active configurations, keeping client controllers decoupled.",
          analogy: "A courier app selecting between bicycle, car, or truck depending on packet weights and destination distances."
        },
        {
          name: "Repository Pattern",
          where: "UserRepository, PantryItemRepository extending JpaRepository",
          why: "Isolates direct database querying logic behind clean interfaces. The service layer works with clean CRUD signatures without dealing with EntityManager scopes, low-level JDBC queries, or dialect constraints.",
          analogy: "A library catalog desk that retrieves books from the vaults, hiding the warehouse layout from readers."
        },
        {
          name: "Observer Pattern (Pub-Sub)",
          where: "React Context API (AuthContext, ThemeContext) subscriber updates",
          why: "A change in shared state (e.g. login updates user profile parameters) notifies all registered subscriber components, triggering automated re-renders of elements observing that slice of state.",
          analogy: "A newsletter distribution list where adding an article broadcasts warnings to all registered readers instantly."
        },
        {
          name: "Facade Pattern",
          where: "AuthService and PantryService orchestrating multiple helper subsystems",
          why: "Exposes a simplified interface to Controllers. PantryService acts as a facade that coordinates user checkouts, database validation, transactional persistence, and email warnings, shielding the endpoint controller from multi-class complexities.",
          analogy: "A hotel front desk coordinating billing, housekeeping, and room keys without requiring the guest to visit each department."
        }
      ],
      oopConcepts: [
        {
          concept: "Encapsulation",
          where: "Private fields in Entity classes (User.java, PantryItem.java) with Getter/Setter structures; private state hooks inside AuthContext.tsx",
          detail: "Protects class internal states from direct outer manipulation. Access is strictly funneled through public APIs or setter validation logic (e.g. verifying input ranges before writing variables), preserving domain state integrity.",
          analogy: "A digital thermometer that allows reading temperatures, but hides the internal sensor calibration circuits from users."
        },
        {
          concept: "Abstraction",
          where: "Service interfaces (RecipeAIService), Data Transfer Objects (PantryItemDTO), and React hooks (useAuth)",
          detail: "Hides unnecessary structural details from the consumer. A Controller works with a PantryItemDTO payload without needing to know database schema columns, and components call useAuth() without managing HTTP token storage.",
          analogy: "Driving a car using the steering wheel and accelerator pedal without needing to study mechanical combustion or fuel injector timers."
        },
        {
          concept: "Inheritance",
          where: "Custom exceptions extending RuntimeException, filter classes extending OncePerRequestFilter",
          detail: "Enables code reuse by inheriting existing behaviors from standard classes and extending or overriding them for project requirements.",
          analogy: "Building an electric bicycle by starting with a traditional bicycle frame and adding a battery and motor."
        },
        {
          concept: "Polymorphism",
          where: "Injecting JPA repositories by interface type, overriding CustomUserDetailsService loadUserByUsername",
          detail: "Allows the same interface call to execute different runtime actions. For example, injecting mock repository dependencies inside test suites instead of active database connection handlers.",
          analogy: "A universal remote where pressing the power button operates TV, audio system, or projector components differently."
        },
        {
          concept: "Composition",
          where: "PantryService composing PantryItemRepository and UserRepository; AppLayout composing UI buttons and sidebars",
          detail: "Assembles complex behaviors by combining small, focused objects instead of relying on subclassing trees (favoring Has-A relationships over Is-A).",
          analogy: "A laptop built by assembling processor, memory, and monitor modules rather than fusing everything as one plastic piece."
        },
        {
          concept: "Association / Aggregation",
          where: "PantryItem referencing User via @ManyToOne annotation",
          detail: "Defines relationships between entities that can exist independently (Aggregation) or are lifecycled together (Composition with CASCADE deletion).",
          analogy: "A professor associated with a university course; the course details reference the professor, but both continue to exist separately."
        }
      ]
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
        section: "1. Product And Architecture",
        questions: [
          {
            q: "What problem does Verfalarm solve?",
            followups: [
              "Why is this a real problem and not just a nice-to-have?",
              "Who is the target user?",
              "What is the business value of solving it?",
              "What would happen if this product did not exist?"
            ],
            a: "It helps users reduce food waste by combining pantry tracking, expiry alerts, OCR intake, and AI recipe suggestions in one workflow."
          },
          {
            q: "Why did you choose a 3-tier architecture?",
            followups: [
              "Why not a monolith with a single UI and database layer?",
              "What are the benefits of separating frontend, backend, and database?",
              "What are the downsides of this separation?",
              "When would you reconsider this architecture?"
            ],
            a: "It separates UI, business logic, and data access, which makes the system easier to test and maintain; the tradeoff is more coordination overhead than a single-layer app."
          },
          {
            q: "Why did you split the code into frontend and backend repositories/folders?",
            followups: [
              "What does this give you in terms of maintainability?",
              "What are the tradeoffs in local development and deployment?",
              "Would a monorepo still be reasonable here?"
            ],
            a: "The split matches how the app is deployed and lets each side evolve independently, even though it adds some development and integration overhead."
          },
          {
            q: "What are the most important non-functional requirements in this project?",
            followups: [
              "Which is more important here: accuracy, speed, cost, or reliability?",
              "What did you do to optimize for each one?",
              "Which requirement was the hardest to balance?"
            ],
            a: "Reliability and correctness matter most because the app is only useful if expiry tracking and alerts are trustworthy; performance and cost matter too, but they are secondary."
          },
          {
            q: "If you had to explain the whole system in one minute, how would you do it?",
            followups: [
              "What is the one flow that best represents the product?",
              "What parts are core, and what parts are supporting features?"
            ],
            a: "Verfalarm is a zero-waste pantry assistant that scans receipts, tracks inventory, reminds users before items expire, and suggests recipes that use what they already have."
          }
        ]
      },
      {
        section: "2. Frontend React And UI",
        questions: [
          {
            q: "Why did you choose React for the frontend?",
            followups: [
              "Why not Angular, Vue, or Svelte?",
              "What advantages did React give you for this app?",
              "What are the disadvantages of React in this context?",
              "Why was component composition a good fit?"
            ],
            a: "The app is highly stateful and component-driven, so React fits naturally and gives a strong ecosystem for routing, data fetching, and reusable UI."
          },
          {
            q: "Why did you use Vite instead of Create React App or Next.js?",
            followups: [
              "What does Vite improve during development?",
              "What do you lose by not using Next.js?",
              "When would SSR or SSG matter for this product?"
            ],
            a: "Vite gives a faster development loop and simpler setup for a SPA; Next.js would add SSR and routing features I do not need for this use case."
          },
          {
            q: "Why did you use TypeScript?",
            followups: [
              "What bugs did it help prevent?",
              "What is the cost of using it?",
              "Could this have been built in plain JavaScript?"
            ],
            a: "It catches shape and API-contract mistakes early, which matters in a feature-rich app; the downside is more typing overhead, but the safety gain is worth it."
          },
          {
            q: "Why did you use React Context for auth and theme state?",
            followups: [
              "Why not Redux, Zustand, or MobX?",
              "What are the risks of Context for frequent updates?",
              "Why was Context enough for this project?"
            ],
            a: "Auth and theme are cross-cutting concerns that many components need, and Context keeps the implementation simple; Redux or Zustand would be reasonable alternatives, but they would be heavier for this scope."
          },
          {
            q: "Why did you use TanStack Query?",
            followups: [
              "Why not fetch calls directly in useEffect?",
              "Why not Redux Toolkit Query?",
              "What problems does caching solve here?",
              "What are the downsides of client-side caching?"
            ],
            a: "It handles caching, background refetching, and mutation state cleanly, which reduces boilerplate and improves perceived performance."
          },
          {
            q: "Why did you keep UI components reusable and atomic?",
            followups: [
              "Why not build each screen as a one-off page?",
              "What does this buy you later?",
              "When can over-reuse become a problem?"
            ],
            a: "Reusable primitives keep the UI consistent and speed up future feature work, though I avoid over-abstracting when a component is only used once."
          },
          {
            q: "Why did you add the command palette in the layout?",
            followups: [
              "Is this a real user need or a polish feature?",
              "What is the complexity cost of adding it?",
              "What would be the minimal alternative?"
            ],
            a: "It improves navigation speed and makes the app feel more productively designed; the downside is extra UI complexity, so it only makes sense because the app has many routes."
          },
          {
            q: "Why did you use Framer Motion and richer UI effects?",
            followups: [
              "Why not keep animations minimal?",
              "What are the performance costs of animation-heavy UIs?",
              "When do animations hurt usability?"
            ],
            a: "The motion improves polish and helps the app feel responsive, but I would keep animations restrained because they can hurt performance or accessibility if overused."
          },
          {
            q: "Why did you add an ErrorBoundary?",
            followups: [
              "What kinds of failures does it catch?",
              "What does it not catch?",
              "Why is a boundary better than letting the app crash?"
            ],
            a: "It isolates rendering failures so one broken screen does not take down the whole app; it does not replace proper async error handling, but it protects the UI from crashes."
          },
          {
            q: "Why does the frontend store auth/session data in localStorage?",
            followups: [
              "What is the security risk of localStorage?",
              "Why not HttpOnly cookies?",
              "What happens on refresh or offline use?",
              "How would you harden this in production?"
            ],
            a: "It keeps the SPA simple and makes refresh persistence easy, but the tradeoff is XSS exposure, so an HttpOnly cookie would be safer in a stricter security model."
          }
        ]
      },
      {
        section: "3. Backend Spring Boot And Service Design",
        questions: [
          {
            q: "Why did you choose Spring Boot for the backend?",
            followups: [
              "Why not Node.js/Express, Django, or FastAPI?",
              "What does Spring Boot simplify for you?",
              "What is the learning/maintenance cost?"
            ],
            a: "Spring Boot gives mature support for REST, security, scheduling, JPA, and dependency injection, which matches the project’s needs well."
          },
          {
            q: "Why did you structure the backend into controller, service, repository, config, and model layers?",
            followups: [
              "Why not put all business logic in controllers?",
              "What problems does the service layer solve?",
              "What are the disadvantages of too many layers?"
            ],
            a: "The layering keeps HTTP, business rules, and persistence separate, which makes the code easier to understand, test, and change."
          },
          {
            q: "Why did you use constructor-based dependency injection?",
            followups: [
              "Why not field injection?",
              "What makes constructor injection more testable?",
              "Can it create circular dependency problems?"
            ],
            a: "Constructor injection makes dependencies explicit and improves testability, while field injection hides requirements and is harder to reason about."
          },
          {
            q: "Why did you use Spring Data JPA repositories?",
            followups: [
              "Why not write raw SQL everywhere?",
              "Why not use MyBatis or jOOQ?",
              "What abstraction does JPA give you?",
              "What are the downsides of ORM?"
            ],
            a: "Repositories remove most CRUD boilerplate and keep persistence logic out of services; the tradeoff is less direct control than hand-written SQL."
          },
          {
            q: "Why did you use DTOs instead of exposing entities directly?",
            followups: [
              "What security issue can happen if entities are returned directly?",
              "Why does it help with API stability?",
              "What is the downside of DTO mapping?"
            ],
            a: "DTOs prevent leaking internal model details and let the API contract evolve independently of the database schema."
          },
          {
            q: "Why did you mark many service methods as transactional?",
            followups: [
              "What problem does @Transactional solve?",
              "What happens if a transaction fails halfway?",
              "What can go wrong with oversized transactions?"
            ],
            a: "It keeps multi-step database changes atomic, so a failure rolls back cleanly instead of leaving partial state behind."
          },
          {
            q: "Why did you build separate services for auth, pantry, email, and analytics?",
            followups: [
              "Why not a single large service class?",
              "How does this help testing?",
              "When does splitting services become too fragmented?"
            ],
            a: "Each service owns a clear business boundary, which keeps the code easier to maintain than one large service class."
          },
          {
            q: "Why did you use OncePerRequestFilter for JWT processing?",
            followups: [
              "Why is a filter the right place for token validation?",
              "Why not validate tokens inside controllers?",
              "What can go wrong if the filter chain is misordered?"
            ],
            a: "Authentication needs to happen before the request reaches controllers, and a filter is the right place to validate the token once per request."
          }
        ]
      },
      {
        section: "4. Authentication, Authorization, And Security",
        questions: [
          {
            q: "Why did you use JWT instead of server sessions?",
            followups: [
              "What benefits does stateless auth give you?",
              "What are the downsides of JWTs?",
              "When would sessions be better?"
            ],
            a: "JWT keeps the backend stateless and easier to scale horizontally, while sessions would require server-side state or a shared session store."
          },
          {
            q: "Why did you choose stateless security?",
            followups: [
              "What does statelessness improve operationally?",
              "How does this affect scaling?",
              "What are the tradeoffs for logout and token revocation?"
            ],
            a: "Stateless auth reduces server coupling and fits a SPA well, but it makes token revocation and logout less immediate."
          },
          {
            q: "Why did you use BCrypt for password hashing?",
            followups: [
              "Why not SHA-256 or plain hashing?",
              "What makes BCrypt suitable for passwords?",
              "What is the downside of slow hashing?"
            ],
            a: "BCrypt is intentionally slow and salted, which makes password cracking much harder than simple hashes like SHA-256."
          },
          {
            q: "Why did you disable CSRF?",
            followups: [
              "When is disabling CSRF acceptable?",
              "Why would that be dangerous in a cookie-based app?",
              "How would your answer change if auth moved to cookies?"
            ],
            a: "The API is designed around explicit bearer tokens rather than browser-attached cookies, so classical CSRF protection is less relevant."
          },
          {
            q: "Why did you use role-based authorization?",
            followups: [
              "Why not just trust the frontend to hide buttons?",
              "What can go wrong if backend authorization is missing?",
              "How would you expand this to admin roles later?"
            ],
            a: "Role checks enforce security on the backend, which is necessary because frontend-only restrictions can always be bypassed."
          },
          {
            q: "Why did you store the token in a browser-managed client state instead of a secure cookie?",
            followups: [
              "What threat model does this expose?",
              "What attack class becomes more important because of this?",
              "What would you change for a production-hardening pass?"
            ],
            a: "It simplifies the SPA flow, but the safer production option would be an HttpOnly cookie to reduce XSS token theft risk."
          },
          {
            q: "Why did you add Google login?",
            followups: [
              "Why not support only email/password?",
              "What does Google login improve for users?",
              "What dependency or risk does it introduce?"
            ],
            a: "It lowers friction for users and improves signup completion, though it adds dependency on a third-party identity provider."
          }
        ]
      },
      {
        section: "5. Database, JPA, And Migrations",
        questions: [
          {
            q: "Why did you choose PostgreSQL?",
            followups: [
              "Why not MongoDB or another NoSQL database?",
              "What makes relational storage a better fit here?",
              "Where could NoSQL still be useful?"
            ],
            a: "The app needs relational integrity, transactions, and efficient joins, so PostgreSQL fits better than a document database."
          },
          {
            q: "Why did you use Flyway for migrations?",
            followups: [
              "Why not rely on Hibernate auto-DDL?",
              "Why is schema versioning important?",
              "What are the risks of unmanaged schema changes?"
            ],
            a: "Flyway gives versioned, repeatable schema changes, which is much safer than relying on implicit schema generation."
          },
          {
            q: "Why did you model pantry items, recipes, and notifications as relational entities?",
            followups: [
              "What relationships are strongest in your domain?",
              "Why does relational integrity matter here?",
              "What would break if those relationships were duplicated in app logic only?"
            ],
            a: "The domain has real relationships and constraints, and relational modeling keeps that structure explicit and enforceable."
          },
          {
            q: "Why did you use UUIDs as primary keys?",
            followups: [
              "Why not use auto-increment integers?",
              "What are the tradeoffs of UUIDs in indexing and storage?",
              "Why can UUIDs be safer for public APIs?"
            ],
            a: "UUIDs are safer to expose externally and easier for distributed generation, though they can be less index-friendly than integers."
          },
          {
            q: "Why did you use LAZY loading on entity relationships?",
            followups: [
              "What is the N+1 problem?",
              "Why not always use EAGER loading?",
              "What can go wrong if lazy loading is accessed outside a transaction?"
            ],
            a: "It avoids loading unnecessary data and helps prevent N+1-style waste, but it needs to be managed carefully inside transactions."
          },
          {
            q: "Why did you keep some logic in services instead of database triggers?",
            followups: [
              "What are the pros and cons of application-level rules vs DB-level rules?",
              "Which rules belong in the database and which in the app?"
            ],
            a: "Business rules are easier to test and evolve in application code, while the database should mainly enforce structural integrity."
          },
          {
            q: "Why did you add indexes or discuss them in the documentation?",
            followups: [
              "What happens when a query hits a large table without the right index?",
              "How do you decide which columns should be indexed?",
              "What is the downside of too many indexes?"
            ],
            a: "Indexes matter because the app will quickly feel slow if common lookups on user or status fields scan large tables."
          }
        ]
      },
      {
        section: "6. Scheduling, Email, And Background Jobs",
        questions: [
          {
            q: "Why did you use a scheduler for alerts and reports?",
            followups: [
              "Why not compute everything on demand when the user opens the app?",
              "What user value does background automation create?",
              "What are the downsides of scheduled jobs?"
            ],
            a: "Expiry reminders are a background concern, so scheduling lets the app notify users automatically without requiring them to open the app."
          },
          {
            q: "Why did you send separate email summaries and expiry alerts?",
            followups: [
              "Why not send one combined email only?",
              "What is the tradeoff between fewer emails and more useful emails?"
            ],
            a: "Separate messages make the alerts more actionable; a single combined email would be simpler but less focused."
          },
          {
            q: "Why did you load email templates from resources?",
            followups: [
              "Why not build all email HTML in Java code?",
              "What does template-based email rendering improve?",
              "What are the risks of raw string replacement?"
            ],
            a: "Templates keep the HTML maintainable and make branding or layout changes easier than hardcoding the entire message in Java."
          },
          {
            q: "Why did you implement fallback email delivery providers?",
            followups: [
              "Why support Brevo, Resend, and SMTP?",
              "What happens if the primary provider fails?",
              "What is the downside of supporting multiple providers?"
            ],
            a: "It reduces dependency on a single provider and improves resilience, although it adds configuration and operational complexity."
          },
          {
            q: "Why did you check user preferences before sending notifications?",
            followups: [
              "Why is user opt-in important here?",
              "What happens if you ignore preferences?",
              "How would you make notification rules more flexible?"
            ],
            a: "User settings prevent notification spam and keep the system aligned with opt-in behavior."
          },
          {
            q: "Why did you use hourly scheduling?",
            followups: [
              "Why not run every minute or only once a day?",
              "What is the tradeoff between freshness and cost?",
              "How would you avoid duplicate sends?"
            ],
            a: "Hourly jobs are frequent enough for reminders while still being cheap and predictable; more frequent jobs would increase load for little benefit."
          }
        ]
      },
      {
        section: "7. OCR, AI, And External Integrations",
        questions: [
          {
            q: "Why did you use client-side OCR with Tesseract.js?",
            followups: [
              "Why not send the image to the backend for OCR?",
              "What benefits does running OCR in the browser give you?",
              "What are the downsides of browser-side OCR?"
            ],
            a: "It offloads image processing from the backend and gives users immediate feedback, but browser-side OCR can be slower and less accurate on poor images."
          },
          {
            q: "Why did you parse OCR output with regex and heuristics on the backend?",
            followups: [
              "Why not use a more advanced ML model immediately?",
              "What kinds of receipts break heuristic parsing?",
              "What is the advantage of predictable rule-based parsing?"
            ],
            a: "Heuristics are predictable, fast, and easy to debug, which makes them a good first pass before adding heavier ML logic."
          },
          {
            q: "Why did you use Google Gemini for recipe suggestions?",
            followups: [
              "Why not generate recipes with static rules only?",
              "Why not use another model or provider?",
              "What are the downsides of relying on a third-party AI API?"
            ],
            a: "Gemini is a practical way to generate flexible, human-like recipe ideas from pantry data, whereas static rules would be too limited."
          },
          {
            q: "Why did you cache AI or recipe-related results?",
            followups: [
              "Why is caching useful for repeat ingredient sets?",
              "What are the risks of stale AI outputs?",
              "When would you invalidate the cache?"
            ],
            a: "Caching avoids repeated calls for the same ingredient set and improves latency, though it introduces the risk of stale results."
          },
          {
            q: "Why did you add fallback behavior when an external API fails?",
            followups: [
              "Why is graceful degradation important?",
              "What should the user see if AI/email providers go down?",
              "How do you keep the app useful offline or during outages?"
            ],
            a: "Graceful degradation keeps the app useful when providers are slow or down, which is important because AI and email APIs are not fully under your control."
          }
        ]
      },
      {
        section: "8. Design Patterns And OOP Questions",
        questions: [
          {
            q: "Why did you use Dependency Injection?",
            followups: [
              "What problem does it solve in testing and maintainability?",
              "What are the alternatives?",
              "What are the disadvantages of heavy DI usage?"
            ],
            a: "It makes the code loosely coupled, easier to test, and easier to replace piece by piece."
          },
          {
            q: "Why did you rely on the Repository pattern?",
            followups: [
              "Why not let services talk directly to the database?",
              "What does the repository abstraction hide?",
              "What is the downside of abstraction if it gets too deep?"
            ],
            a: "It hides persistence complexity behind a clean interface and keeps business logic focused on the domain."
          },
          {
            q: "Why did you use the Observer-style pattern in React Context and UI state?",
            followups: [
              "Why is shared state propagation useful?",
              "Why not pass props through every level?",
              "What are the downsides of global state?"
            ],
            a: "Shared state propagation lets many components react to the same source of truth without prop drilling."
          },
          {
            q: "Why did you use inheritance for framework extension points?",
            followups: [
              "Why not favor composition everywhere?",
              "What is the cost of inheritance-based coupling?",
              "When is inheritance the wrong choice?"
            ],
            a: "I used it where the framework expects it, because it is the simplest way to plug into the lifecycle; otherwise I prefer composition."
          },
          {
            q: "Why did you use polymorphism in service and bean design?",
            followups: [
              "What makes the code more flexible?",
              "What breaks if every implementation is hardcoded?",
              "What is the tradeoff of many interfaces?"
            ],
            a: "Polymorphism lets callers depend on a contract instead of a specific implementation, which gives flexibility as the system grows."
          },
          {
            q: "Why did you use encapsulation in entities and stateful UI modules?",
            followups: [
              "Why should internal state stay hidden?",
              "What can go wrong if everything is public?",
              "How does encapsulation help debugging?"
            ],
            a: "Encapsulation protects invariants and keeps internal state changes controlled, which reduces accidental misuse."
          },
          {
            q: "Why did you favor composition in the frontend layout and services?",
            followups: [
              "Why is composition usually safer than inheritance in UI code?",
              "What is the risk of over-composition or prop drilling?"
            ],
            a: "Composition keeps the UI modular and easier to rearrange than deep inheritance chains."
          },
          {
            q: "Why did you choose abstraction through DTOs and interfaces?",
            followups: [
              "What is the cost of adding abstraction layers?",
              "How do you know if a layer is actually useful?"
            ],
            a: "Abstraction keeps each layer focused on one job and prevents the whole app from becoming tightly coupled to implementation details."
          }
        ]
      },
      {
        section: "9. Performance And Scalability",
        questions: [
          {
            q: "What are the biggest performance bottlenecks in this project?",
            followups: [
              "Which parts are CPU-bound and which are I/O-bound?",
              "Where does latency matter most?"
            ],
            a: "The most likely bottlenecks are OCR work, external API calls, database queries, and email scheduling."
          },
          {
            q: "Why did you use client-side caching and memoization in the frontend?",
            followups: [
              "What did you optimize for?",
              "What are the downsides of stale client state?"
            ],
            a: "They reduce unnecessary re-fetching and re-rendering, which improves responsiveness in a data-heavy interface."
          },
          {
            q: "Why did you use background jobs instead of synchronous processing?",
            followups: [
              "What improves in user experience?",
              "What new failure modes appear?"
            ],
            a: "Background jobs keep the user experience fast because long-running work does not block the request cycle."
          },
          {
            q: "Why did you mention N+1 queries and indexing in the docs?",
            followups: [
              "How would you detect these issues in production?",
              "What metrics would you watch?"
            ],
            a: "They are the kinds of problems that appear early in apps with relational data, and calling them out shows awareness of future bottlenecks."
          },
          {
            q: "Why did you keep the app stateless on the backend?",
            followups: [
              "Why does that help scaling horizontally?",
              "What tradeoffs does statelessness create?"
            ],
            a: "Statelessness makes scaling and deployment simpler because any instance can handle any request."
          },
          {
            q: "Why did you choose in-memory structures like ConcurrentHashMap in some places?",
            followups: [
              "Why not Redis or another distributed cache?",
              "What happens in a multi-instance deployment?"
            ],
            a: "They are simple and fast for MVP-scale caching, but they do not work well for multi-node consistency."
          }
        ]
      },
      {
        section: "10. Testing, Reliability, And Maintainability",
        questions: [
          {
            q: "How would you test the auth flow?",
            followups: [
              "What unit tests would you write?",
              "What integration tests are most valuable?"
            ],
            a: "I would cover registration, login, token validation, role checks, and failure cases with a mix of unit and integration tests."
          },
          {
            q: "How would you test OCR parsing?",
            followups: [
              "What kinds of sample receipts would you use?",
              "How do you test messy real-world input?"
            ],
            a: "I would use real and synthetic receipt samples with noisy text, edge cases, and malformed formats."
          },
          {
            q: "How would you test email scheduling?",
            followups: [
              "How do you avoid sending real emails in tests?",
              "How do you verify duplicate suppression?"
            ],
            a: "I would mock the mail provider, verify scheduling conditions, and assert that duplicate sends are suppressed."
          },
          {
            q: "How would you test AI integrations?",
            followups: [
              "What should be mocked?",
              "What should be contract-tested?"
            ],
            a: "I would mock the AI API at the boundary and add contract tests for the request/response shape."
          },
          {
            q: "Why is reliability important in a food-waste product?",
            followups: [
              "What is the user impact if alerts are missed?",
              "What should happen on partial failure?"
            ],
            a: "If alerts are missed, users lose trust quickly because the core value of the product depends on timely reminders."
          },
          {
            q: "What is the hardest part of maintaining this codebase?",
            followups: [
              "Which abstraction is likely to change first?",
              "What would you refactor next if you had time?"
            ],
            a: "The hardest part is keeping the integration points stable while multiple features, providers, and UI flows continue to evolve."
          }
        ]
      },
      {
        section: "11. Deployment And DevOps",
        questions: [
          {
            q: "Why did you use Docker Compose?",
            followups: [
              "Why not run everything manually?",
              "What does Compose make easier for local dev?",
              "What is the downside of containerizing everything?"
            ],
            a: "It makes the local environment reproducible by starting the app stack with one command."
          },
          {
            q: "Why did you use separate Dockerfiles for frontend and backend?",
            followups: [
              "Why is a multi-stage build useful?",
              "What do you gain in production image size?"
            ],
            a: "The two services have very different build steps and runtime images, so separating them keeps each image smaller and cleaner."
          },
          {
            q: "Why did you choose the deployment targets in the guide?",
            followups: [
              "Why Neon for DB, Render for backend, and Vercel for frontend?",
              "What tradeoffs exist with managed services?"
            ],
            a: "They are practical managed services that reduce operational overhead while still fitting the stack well."
          },
          {
            q: "What environment variables are most critical?",
            followups: [
              "What breaks if one is missing?",
              "Which values should never be committed to source control?"
            ],
            a: "Database credentials, JWT secret, and email/API keys are the most critical because missing or weak values can break core flows or weaken security."
          },
          {
            q: "What would you monitor in production?",
            followups: [
              "Which logs or metrics matter for emails, auth, and OCR?",
              "How would you detect provider outages?"
            ],
            a: "I would watch auth failures, scheduler success rates, email provider errors, OCR latency, and external API failures."
          }
        ]
      },
      {
        section: "12. Good Final Interview Questions To Practice",
        questions: [
          {
            q: "If you had one week to improve this project, what would you change first?",
            followups: [
              "Why that change instead of a cosmetic one?",
              "What is the highest leverage improvement?"
            ],
            a: "I would focus on reliability and observability first, because that has the highest leverage for a system that depends on scheduling and integrations."
          },
          {
            q: "What is the biggest technical debt in the system?",
            followups: [
              "Why did you accept it for now?",
              "What is the risk of leaving it in place?"
            ],
            a: "The biggest debt is probably the number of integration points and the amount of logic tied to external providers, because that makes change riskier."
          },
          {
            q: "What would do differently if you started over?",
            followups: [
              "Which technology choice would you reconsider?",
              "Which architecture decision would stay the same?"
            ],
            a: "I would separate some provider-specific logic earlier and add more test scaffolding around the integration boundaries."
          },
          {
            q: "How would you scale this from an MVP into a production-grade SaaS?",
            followups: [
              "What would you change in auth, caching, email, and observability?",
              "What would you keep as-is?"
            ],
            a: "I would add stronger observability, better token handling, distributed caching if needed, queued background processing, and more robust provider fallbacks."
          },
          {
            q: "What is your strongest technical decision in this project?",
            followups: [
              "Why is that decision defensible?",
              "What is the main downside?"
            ],
            a: "The strongest decision is the layered architecture with clear service boundaries, because it keeps the app understandable even as features grow."
          },
          {
            q: "What is the weakest technical decision in this project?",
            followups: [
              "What would be the alternative?",
              "Why was the current choice still acceptable for the current scope?"
            ],
            a: "The weakest decision is the reliance on browser-side token storage, because it is convenient but not the safest long-term choice."
          }
        ]
      }
    ]
  }
];
