export const springConcepts = [
  {
    id: "spring_core",
    num: "SP.1",
    title: "Spring Core, IoC & Beans",
    desc: "The core engine of Spring. Understand loose coupling, Inversion of Control (IoC), Dependency Injection (DI) injection types, stereotypic annotations, and the differences between BeanFactory and ApplicationContext.",
    declaration: `// Core Dependency Injection Injection Styles
@Service
public class OrderService {
    private final PaymentService paymentService;

    // Constructor Injection (Recommended)
    public OrderService(PaymentService paymentService) {
        this.paymentService = paymentService;
    }
}`,
    internalImplementation: `/* ----------------- SPRING IoC CONTAINER LIFECYCLE -----------------
   1. Scan Classpath (@ComponentScan) -> Register BeanDefinitions
   2. Instantiate Beans (new up instances)
   3. Inject Dependencies (wire constructors / setter methods)
   4. Initialize Beans (@PostConstruct, afterPropertiesSet)
   5. Ready to serve client requests
   6. Destroy Beans (@PreDestroy, destroy) on Context shutdown
*/`,
    subtopics: [
      {
        name: "IoC & Dependency Injection",
        oneLiner: "IoC is the design principle of shifting control to a container; DI is the actual wiring mechanism.",
        definition: "Inversion of Control (IoC) delegates object instantiation and lifecycle management to the Spring container. Dependency Injection (DI) wires objects via Constructor, Setter, or Field injection.",
        whyNeed: "Eliminates hardcoded dependencies (e.g. 'new Class()') inside classes, making components loosely coupled, highly modular, and easily swappable with mock implementations during unit tests.",
        example: "An OrderService receiving a database-configured PaymentService mock in test classes instead of instantiating Hikari pools.",
        devPerspective: "SDEs prefer Constructor Injection: it guarantees dependencies are non-null/immutable (final fields) and does not lock unit tests into using Spring reflection mock utilities.",
        questions: [
          "Differentiate between Inversion of Control (IoC) and Dependency Injection (DI).",
          "Compare Constructor Injection vs Setter Injection vs Field Injection.",
          "Why is Field Injection (@Autowired on fields) generally discouraged in modern development?"
        ],
        followups: [
          "How does constructor injection support writing immutable components?",
          "Can you explain self-invocation proxy bypass in Spring?"
        ],
        confusions: [
          "Spring IoC vs. Java Reflection: Spring manages objects and handles standard instantiations dynamically at startup; it does not introduce runtime reflection overhead for regular business methods."
        ],
        takeaways: [
          "IoC is the concept; DI is the practice.",
          "Constructor injection is best practice for required dependencies.",
          "Field injection makes testing harder due to manual Mockito triggers."
        ]
      },
      {
        name: "Stereotypes & Autowiring",
        oneLiner: "Stereotype annotations register classes as beans; autowiring resolves dependencies by type.",
        definition: "Stereotype annotations (@Component, @Service, @Repository, @Controller) register beans in the context. @Autowired flags automatic injection, resolved byType first, and fallback to byName.",
        whyNeed: "Allows automated class detection during classpath scans. Using specific stereotypes activates layered features (e.g., @Repository enables DB exception translation to Spring's DataAccessException).",
        example: "Using @Repository on an OrderDao class automatically converts Hibernate SQLite exceptions to Spring's DataAccessExceptions.",
        devPerspective: "If multiple beans of the same interface exist, SDEs use @Qualifier(\"name\") to eliminate NoUniqueBeanDefinitionExceptions, or designate a default candidate using @Primary.",
        questions: [
          "Differentiate the purposes of @Component, @Service, @Repository, and @Controller.",
          "What happens if multiple beans of the same type exist in the context? How do you resolve it?",
          "What is the difference between @Autowired and CDI's @Inject?"
        ],
        followups: [
          "How does Spring's Exception Translation mechanism work at the @Repository layer?",
          "Explain the implicit autowiring feature introduced in Spring 4.3+."
        ],
        confusions: [
          "Duplicates: @Autowired maps by type. If two beans implement the same interface, Spring crashes at startup unless you specify a @Qualifier or @Primary bean."
        ],
        takeaways: [
          "@Component is the parent; other stereotypes are specialized sub-types.",
          "@Repository maps persistence exceptions to DataAccessException.",
          "Use @Qualifier to bind exact bean instances by name."
        ]
      },
      {
        name: "BeanFactory vs ApplicationContext",
        oneLiner: "BeanFactory is the core basic container; ApplicationContext adds enterprise capabilities.",
        definition: "BeanFactory provides basic DI and lazy bean initialization. ApplicationContext extends BeanFactory, providing eager initialization by default, AOP, Event publishing, Profiles, and internationalization (i18n).",
        whyNeed: "BeanFactory has a minimal memory footprint for resource-constrained systems, but standard enterprise applications need ApplicationContext to enable listeners, aspect proxies, and hot-swaps.",
        example: "Spring Boot starts an AnnotationConfigApplicationContext to parse YAML files and load MVC parameters at boot.",
        devPerspective: "Spring Boot's SpringApplication.run() method automatically bootstraps the active ApplicationContext, exposing container endpoints.",
        questions: [
          "Compare BeanFactory and ApplicationContext.",
          "Explain Lazy vs Eager instantiation in Spring containers.",
          "How does ApplicationContext load properties and active environment Profiles?"
        ],
        followups: [
          "Can you manually fetch a bean directly from the ApplicationContext? [Yes, via context.getBean()]",
          "What are the major ApplicationContext implementations?"
        ],
        confusions: [
          "ApplicationContext memory: Eager loading means all singleton beans are created at startup. This increases startup times but catches configuration bugs immediately."
        ],
        takeaways: [
          "ApplicationContext is a superset of BeanFactory.",
          "ApplicationContext initializes singleton beans eagerly by default.",
          "BeanFactory is rarely used directly in modern SDE setups."
        ]
      }
    ]
  },
  {
    id: "spring_lifecycle",
    num: "SP.2",
    title: "Bean Lifecycle & Scopes",
    desc: "Life and death in the IoC container. Explore bean creation pipelines, @PostConstruct/@PreDestroy initializations, and standard scopes (Singleton, Prototype, Request, Session).",
    declaration: `// Custom Bean Lifecycles
@Component
public class CacheService {
    @PostConstruct
    public void loadCache() {
        // Run database queries on startup
    }

    @PreDestroy
    public void flushCache() {
        // Save dirty cache buffers to database on shutdown
    }
}`,
    internalImplementation: `/* ----------------- LIFECYCLE CALLBACK STAGES -----------------
   1. Instantiation (Constructor)
   2. Populate Properties (Dependency Injection)
   3. Aware Interfaces execution (BeanNameAware, BeanFactoryAware)
   4. BeanPostProcessor Before Initialization
   5. @PostConstruct / InitializingBean.afterPropertiesSet()
   6. BeanPostProcessor After Initialization (AOP Proxy wrapped here)
   7. Bean is ready for use
   8. Context closes -> @PreDestroy / DisposableBean.destroy()
*/`,
    subtopics: [
      {
        name: "Bean Lifecycle Stages",
        oneLiner: "The lifecycle spans from instantiation and injection to @PostConstruct initialization and @PreDestroy cleanup.",
        definition: "The exact sequence a bean undergoes: Instantiation -> Populate Properties -> Aware Interfaces -> BeanPostProcessors -> Initializing callbacks -> Ready -> Destruction callbacks.",
        whyNeed: "Required to seed cache registers, set default variables post-injection, or close persistent resources like DB pools or socket connections during context teardowns.",
        example: "A WebhookClient class initializing its HTTP client wrapper in a @PostConstruct method once URLs are injected.",
        devPerspective: "SDEs use @PostConstruct instead of constructors for setup logic because dependencies (like @Value fields) are not yet injected when constructors execute.",
        questions: [
          "Describe the complete lifecycle of a Spring Bean.",
          "Why should initialization logic not be placed in the bean's constructor? [Dependencies aren't injected yet]",
          "What is the role of BeanPostProcessors in the lifecycle?"
        ],
        followups: [
          "Explain the difference between InitializingBean and @PostConstruct.",
          "Does Spring manage the complete lifecycle of a prototype-scoped bean? [No, context does not execute destroy callbacks on prototype beans]"
        ],
        confusions: [
          "Constructor vs PostConstruct: Fields marked with @Value or injected with @Autowired are NULL inside the constructor. They are only populated and ready inside the @PostConstruct callback."
        ],
        takeaways: [
          "Instantiation -> DI -> @PostConstruct -> Ready -> @PreDestroy.",
          "BeanPostProcessors are crucial for wrapping beans with AOP proxies.",
          "SDEs clean up file descriptors and database connections in @PreDestroy."
        ]
      },
      {
        name: "Bean Scopes & Thread Safety",
        oneLiner: "Singleton is the default scope (one per container); Prototype creates a new instance per request.",
        definition: "Spring supports: Singleton (one per context), Prototype (new instance per get), Request (one per HTTP request), Session (one per session), and Application (one per ServletContext).",
        whyNeed: "Controls state pollution. Use singletons for stateless services, and prototype/session for stateful objects like user shopping carts.",
        example: "A stateless OrderService service is created once (Singleton); a UserCart class holding cart items is mapped per Session.",
        devPerspective: "Singleton beans are shared across threads. SDEs must not store mutable variables in singleton class fields to avoid concurrency race conditions.",
        questions: [
          "List and explain the different scopes supported by Spring.",
          "Are Spring singletons thread-safe? How should you manage state in singletons?",
          "What happens if you inject a prototype bean into a singleton bean? How do you resolve it? [Scope mismatch, resolve with Lookup Injection]"
        ],
        followups: [
          "Is a Spring singleton the same as a design-pattern Gang of Four (GoF) singleton? [No, Spring singleton is one per container, GoF is one per ClassLoader]",
          "Explain Request and Session scopes in Spring MVC."
        ],
        confusions: [
          "Prototype DI loop: If a singleton injects a prototype, the prototype is only resolved once during singleton instantiation. To get a fresh prototype instance dynamically, use Method Injection (@Lookup)."
        ],
        takeaways: [
          "Singleton is default and must remain stateless.",
          "Prototype creation is managed by Spring, but destruction is not.",
          "Resolve scope mismatches using @Lookup or ObjectFactory."
        ]
      }
    ]
  },
  {
    id: "spring_mvc",
    num: "SP.3",
    title: "Spring MVC & Web Layer",
    desc: "Building RESTful web endpoints. Understand DispatcherServlet routing, HTTP method mapping annotations, model bindings, global exception handlers, and validation rules.",
    declaration: `// REST Controller Exception Framework
@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(ResourceNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ErrorResponse handleNotFound(ResourceNotFoundException ex) {
        return new ErrorResponse(404, ex.getMessage());
    }
}`,
    internalImplementation: `/* ----------------- DISPATCHER SERVLET FLOW -----------------
   Request (GET /user/5)
     ├──► [DispatcherServlet] (Front Controller)
     │      ├──► queries [HandlerMapping] -> matches UserController
     │      └──► executes [HandlerAdapter] -> UserController.getUser(5)
     ├──► UserController return User object
     │      └──► Bypasses ViewResolver (due to @ResponseBody / @RestController)
     └──► [HttpMessageConverter] (Jackson) serializes to JSON -> Response
*/`,
    subtopics: [
      {
        name: "DispatcherServlet Routing Flow",
        oneLiner: "DispatcherServlet acts as the Front Controller, dispatching HTTP requests to controllers via HandlerMapping.",
        definition: "The core engine of Spring MVC. It intercepts all web requests, resolved by HandlerMapping, adapts parameters via HandlerAdapter, executes the handler, and writes JSON via HttpMessageConverter.",
        whyNeed: "Provides a single point of control for cross-cutting web needs like request parsing, localization, locale routing, security filters, and JSON serialization.",
        example: "DispatcherServlet matching `/api/users` request to `UserController.getUsers()` method, automatically writing the returned array to JSON via Jackson.",
        devPerspective: "For REST APIs, @ResponseBody bypasses logical ViewResolvers, instructing Jackson converters to serialize raw Java POJOs directly to JSON streams.",
        questions: [
          "Explain the complete request execution flow of DispatcherServlet in Spring MVC.",
          "What is the role of HandlerMapping and HandlerAdapter?",
          "How does content negotiation map requests to JSON vs XML?"
        ],
        followups: [
          "What happens when a controller returns a logical view name string vs a raw object? [String goes to ViewResolver; object goes to HttpMessageConverter if annotated with @ResponseBody]",
          "What is the default servlet container utilized by Spring Boot? [Apache Tomcat]"
        ],
        confusions: [
          "ViewResolvers in REST: In modern REST APIs using @RestController, ViewResolvers are completely bypassed because @ResponseBody sends data directly to the HTTP write socket."
        ],
        takeaways: [
          "DispatcherServlet is the Front Controller.",
          "HttpMessageConverter handles JSON serialization (Jackson).",
          "HandlerMapping locates controllers based on URL patterns."
        ]
      },
      {
        name: "REST Validations & Advice",
        oneLiner: "Validate parameters with JSR-380 annotations; handle errors globally using @RestControllerAdvice.",
        definition: "Bean Validation (JSR-380) checks inputs before execution using @Valid/@NotNull. @RestControllerAdvice maps exceptions to custom responses using @ExceptionHandler.",
        whyNeed: "Prevents dirty data from hitting database entities. Centralized exception advice removes duplicate try-catch blocks from controller class files.",
        example: "A client posts an empty email; validation rejects it with 400 Bad Request, returning a structured JSON list of validation error strings.",
        devPerspective: "SDEs catch MethodArgumentNotValidException globally in RestControllerAdvice to extract field-level errors, formatting them into clear client-facing JSON objects.",
        questions: [
          "How do you perform parameter validation in Spring MVC? Explain @Valid vs @Validated.",
          "What is the purpose of @RestControllerAdvice and @ExceptionHandler?",
          "How do you return custom HTTP status codes from REST controllers?"
        ],
        followups: [
          "How do you capture field-level validation errors inside a @ControllerAdvice class?",
          "What is BindingResult and where must it be positioned in handler method arguments? [Must immediately follow the validated model parameter]"
        ],
        confusions: [
          "BindingResult gotcha: If you use BindingResult in the controller signature, Spring will NOT throw MethodArgumentNotValidException automatically. You must manually verify result.hasErrors() and raise errors."
        ],
        takeaways: [
          "Use JSR-380 annotations (@NotBlank, @Size) on DTO properties.",
          "Use @RestControllerAdvice to handle API errors globally.",
          "@ExceptionHandler registers methods to catch specific exceptions."
        ]
      }
    ]
  },
  {
    id: "spring_boot",
    num: "SP.4",
    title: "Spring Boot & Configurations",
    desc: "Convention over configuration. Understand Boot starters, auto-configurations, @SpringBootApplication internals, embedded Tomcat servers, profiles, and external configs.",
    declaration: `// Auto-Configuration conditional mappings
@Configuration
@ConditionalOnClass(DataSource.class)
@ConditionalOnProperty(name = "spring.datasource.url")
public class DatabaseAutoConfiguration {
    @Bean
    @ConditionalOnMissingBean
    public DataSource dataSource() {
        return new HikariDataSource();
    }
}`,
    internalImplementation: `/* ----------------- @SpringBootApplication COMPONENTS -----------------
   @SpringBootApplication is a composite annotation:
   1. @SpringBootConfiguration : Semantically marks the class as a configuration source.
   2. @EnableAutoConfiguration : Scans spring.factories / AutoConfiguration.imports to load beans.
   3. @ComponentScan           : Registers beans inside the current package and sub-packages.
*/`,
    subtopics: [
      {
        name: "Auto-Configuration Mechanics",
        oneLiner: "Auto-configuration registers beans conditionally based on classpath contents.",
        definition: "Spring Boot's engine driven by @EnableAutoConfiguration. It reads metadata imports and loads beans using @Conditional annotations (e.g. @ConditionalOnClass).",
        whyNeed: "Eliminates duplicate boilerplate setups. If Hibernate and database drivers are present, Boot registers DataSources and JPA managers automatically.",
        example: "Adding `h2` driver automatically instantiates an in-memory SQL database without writing connection pool config beans.",
        devPerspective: "To see exactly why beans were or weren't auto-configured, run the application with the `--debug` flag or query the Actuator `/conditions` endpoint.",
        questions: [
          "How does Spring Boot Auto-Configuration work under the hood?",
          "What are conditional annotations? Explain @ConditionalOnMissingBean.",
          "How can you exclude a specific Auto-Configuration class from loading?"
        ],
        followups: [
          "Where does @EnableAutoConfiguration look for auto-config classes? [In spring.factories or AutoConfiguration.imports files]",
          "What is the difference between Spring Framework and Spring Boot? [Spring is the framework; Boot adds auto-config, starters, and embedded servers]"
        ],
        confusions: [
          "Starters vs Auto-Config: Starters only pull in Maven/Gradle jars; Auto-Configuration is the actual code in Spring Boot that instantiates beans based on those jars."
        ],
        takeaways: [
          "Driven by @EnableAutoConfiguration.",
          "Conditional annotations check properties, classpaths, and registered beans.",
          "Disable auto-configs using the 'exclude' property of @SpringBootApplication."
        ]
      },
      {
        name: "External Config & Actuators",
        oneLiner: "Properties are injected via @Value or @ConfigurationProperties. Actuators monitor health.",
        definition: "External values are defined in application.yml and bound to POJOs using @ConfigurationProperties. Actuators expose metrics, thread pools, and health metrics.",
        whyNeed: "Ensures configuration settings remain external to code packages. Actuator provides out-of-the-box endpoints for Kubernetes health probes.",
        example: "A Kubernetes pod querying `/actuator/health` to verify database and queue connection statuses before routing traffic.",
        devPerspective: "SDEs prefer @ConfigurationProperties over `@Value`: it supports hierarchical binding, type safety, field validation, and group encapsulation.",
        questions: [
          "Compare @Value with @ConfigurationProperties for property injections.",
          "Explain how Spring Profiles are used to handle environment-specific configurations.",
          "What is Spring Boot Actuator? List 3 key endpoints it exposes."
        ],
        followups: [
          "How do you write a custom health check metric using Actuator? [Implement HealthIndicator interface]",
          "How can you secure non-public Actuator endpoints in production? [Using Spring Security rules]"
        ],
        confusions: [
          "YML Lists: Injecting list structures with `@Value` is difficult and error-prone. Use `@ConfigurationProperties` to bind arrays to Java Lists automatically."
        ],
        takeaways: [
          "@ConfigurationProperties provides type-safe, grouped binding.",
          "Activate profiles via `-Dspring.profiles.active=prod` at boot.",
          "Actuator endpoints (/health, /metrics) provide observability."
        ]
      }
    ]
  },
  {
    id: "spring_data",
    num: "SP.5",
    title: "Database Layer & JPA",
    desc: "Persistence engines. Covers Spring Data JpaRepository abstractions, entity mapping associations, declarative transactions (@Transactional), and Hibernate query optimization.",
    declaration: `// JPA Entity Mapping with Lazy Collections
@Entity
@Table(name = "customers")
public class Customer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToMany(mappedBy = "customer", fetch = FetchType.LAZY)
    private List<Order> orders;
}`,
    internalImplementation: `/* ----------------- JPA ENTITY STATE TRANSITIONS -----------------
   Transient (new) ──► persist() ──► Managed (persistent) ──► close() ──► Detached
                                          │
                                          ▼
                                       remove()
                                          │
                                          ▼
                                       Removed
*/`,
    subtopics: [
      {
        name: "Spring Data JPA Repositories",
        oneLiner: "JpaRepository eliminates DAO boilerplate by generating SQL implementations from method names.",
        definition: "An abstraction layer over JPA. Extending JpaRepository<T, ID> auto-generates CRUD, pagination, and sorting queries based on Java interface definitions.",
        whyNeed: "Drastically reduces repository code. Writing interfaces like `findByEmail` generates the SQL under the hood, removing manual database management.",
        example: "UserRepository extending JpaRepository to support paginated searches automatically through Pageable parameters.",
        devPerspective: "For complex database queries, SDEs bypass method names to write optimized JPQL or native SQL queries using `@Query`.",
        questions: [
          "What is Spring Data JPA and how does it relate to Hibernate and JPA?",
          "Explain JpaRepository method query derivation (e.g. findByEmailAndStatus).",
          "How do you implement database pagination and sorting using Spring Data?"
        ],
        followups: [
          "What is the purpose of the @Query annotation?",
          "When should you use the @Modifying annotation? [Required for custom update/delete query methods]"
        ],
        confusions: [
          "Specification vs ORM: JPA is the specification interface; Hibernate is the active ORM implementation; Spring Data JPA is the repository abstraction layer."
        ],
        takeaways: [
          "JpaRepository provides basic CRUD, pagination, and sorting.",
          "Method query names are parsed to generate SQL queries.",
          "Use @Query for advanced JPQL or native SQL."
        ]
      },
      {
        name: "JPA Entities & N+1 Problem",
        oneLiner: "Use LAZY fetching for collections, mapping owning sides, and resolve N+1 queries with Join Fetches.",
        definition: "Entities map classes to tables. N+1 occurs when a query fetches parent entities, then executes N separate queries to load lazy child relations.",
        whyNeed: "Lazy loading prevents pulling huge tables into RAM. Resolving N+1 anomalies prevents server lockups on simple index calls.",
        example: "A database query fetches 100 posts, then triggers 100 queries to retrieve comments. Resolved by using a single JOIN FETCH query.",
        devPerspective: "SDEs use `FetchType.LAZY` as default for collections, and write `@Query(\"SELECT p FROM Post p JOIN FETCH p.comments\")` to retrieve them in one query.",
        questions: [
          "Explain the JPA Entity lifecycle states (Transient, Managed, Detached, Removed).",
          "What is the JPA N+1 query problem? How do you diagnose and resolve it?",
          "Differentiate FetchType.LAZY vs FetchType.EAGER."
        ],
        followups: [
          "How does a JOIN FETCH resolve N+1 issues? [Fetches parents and children in a single SQL join query]",
          "What is the owning side in a JPA bidirectional relationship? [The side containing the @JoinColumn]"
        ],
        confusions: [
          "LazyInitializationException: Occurs when you access a LAZY loaded relationship after the Hibernate Session/Transaction has already closed. Resolve by using DTOs or Join Fetches."
        ],
        takeaways: [
          "LAZY fetching is default and recommended for collections.",
          "N+1 is resolved via JOIN FETCH or Entity Graphs.",
          "EntityManager persistent context acts as the first-level cache."
        ]
      },
      {
        name: "Transactional Management",
        oneLiner: "@Transactional declaratively manages transactions, rolling back on RuntimeExceptions.",
        definition: "Declarative transaction management. Spring AOP proxies wrap methods, committing on completion or rolling back if Exceptions occur.",
        whyNeed: "Guarantees database consistency (ACID principles). Service updates succeed completely or revert entirely on errors.",
        example: "An inventory deduction and payment processing succeeding together or rolling back if either operation fails.",
        devPerspective: "By default, @Transactional only rolls back on unchecked (RuntimeException) exceptions. To roll back on checked exceptions, SDEs must write `@Transactional(rollbackFor = Exception.class)`.",
        questions: [
          "How does declarative transaction management (@Transactional) work under the hood?",
          "What are the transaction propagation levels? Explain REQUIRED vs REQUIRES_NEW.",
          "Under what conditions will a @Transactional rollback fail to occur? [Checked exceptions, intra-class method calls]"
        ],
        followups: [
          "Why does calling a @Transactional method from another method in the same class bypass the transaction? [Bypasses the AOP proxy]",
          "What is the transaction isolation level and how does it map to database isolation levels?"
        ],
        confusions: [
          "Self-Invocation Bypass: AOP proxies intercept calls from external beans. Calling method B from method A inside the same class does not pass through the proxy, so @Transactional on B is completely ignored."
        ],
        takeaways: [
          "Rolls back on RuntimeException by default; use rollbackFor for checked exceptions.",
          "REQUIRED joins existing transaction; REQUIRES_NEW starts a new one.",
          "Intra-class method calls bypass AOP proxies."
        ]
      }
    ]
  }
];
