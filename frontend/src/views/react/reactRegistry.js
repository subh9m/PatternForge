export const reactConcepts = [
  {
    id: "react_fundamentals",
    num: "RE.1",
    title: "React Fundamentals",
    desc: "Understand React's core principles: component-based design, declarative vs. imperative UIs, the Virtual DOM diffing heuristics, JSX compilation outputs, and the differences between React elements and component factories.",
    declaration: `// JSX Compiles to React.createElement
const element = <h1 className="title">Hello World</h1>;

// Compiled Output
const element = React.createElement(
  'h1',
  { className: 'title' },
  'Hello World'
);`,
    internalImplementation: `/* ----------------- VIRTUAL DOM RECONCILIATION -----------------
   1. Component State changes -> Trigger Render
   2. React builds a new Virtual DOM tree (plain JS object)
   3. Diffing Heuristic compares new tree with old tree level-by-level
   4. If Element Type differs: Teardown old subtree (unmount) & rebuild
   5. If Same Type: Keep node, update changed attributes/props only
   6. Commit minimal updates in batches to browser's Real DOM
*/`,
    subtopics: [
      {
        name: "Virtual DOM & Reconciliation",
        oneLiner: "The Virtual DOM is an in-memory JS tree; Reconciliation matches updates to apply minimal DOM patches.",
        definition: "Virtual DOM is a lightweight, plain JavaScript representation of the browser DOM. Reconciliation is the diffing algorithm (optimized to O(N) using heuristics) that compares virtual trees to execute targeted DOM writes.",
        whyNeed: "Updating the browser's Real DOM triggers expensive layout reflows and repaints. Diffing in memory isolates changes, batching updates to optimize rendering speed.",
        example: "Updating a single comment in a list of 50 items re-renders the comment node only, leaving the other 49 DOM nodes intact.",
        devPerspective: "SDEs use stable, unique keys (like database IDs) when rendering arrays. Keys act as stable identifiers, allowing React to match and reorder list elements instead of recreating them.",
        questions: [
          "Explain the Virtual DOM and its role in React's performance.",
          "How does React's Reconciliation diffing algorithm achieve O(N) complexity?",
          "What is the difference between updating the Virtual DOM vs updating the Real DOM?"
        ],
        followups: [
          "Why is using array index as a key prop highly discouraged for dynamic lists? [Can cause state leakage and rendering bugs on reorder]",
          "What is React Fiber and how does it make reconciliation interruptible?"
        ],
        confusions: [
          "Rebuilding DOM: React does not skip component execution; it executes components to build the VDOM tree. The optimization occurs when it decides not to touch the browser's real HTML tree if the output matches."
        ],
        takeaways: [
          "Virtual DOM diffing runs level-by-level (O(N) heuristics).",
          "Types change = complete unmount and rebuild of the subtree.",
          "Keys are stable markers for list reconciliation."
        ]
      },
      {
        name: "JSX Compilation & Elements",
        oneLiner: "JSX is syntactic sugar that compiles to React.createElement() plain object calls.",
        definition: "JSX (JavaScript XML) allows nesting HTML structure inside JS files. Babel/SWC transpiles JSX tags into nested 'React.createElement(type, props, ...children)' object calls.",
        whyNeed: "Improves readability by keeping visual layout markup close to event-handling JS logic in a single declarative component file.",
        example: "`<div className='card'>Item</div>` translates to `React.createElement('div', { className: 'card' }, 'Item')`.",
        devPerspective: "Since React Elements are immutable plain objects representing the target UI, components serve as the dynamic factories that output these elements.",
        questions: [
          "What is JSX? Is it mandatory to use JSX when writing React applications?",
          "Compare a React Element vs a React Component.",
          "Why does JSX require returning a single root element or a Fragment?"
        ],
        followups: [
          "What does React.createElement return under the hood? [A plain immutable object describing the node]",
          "Explain why JSX properties use camelCase names like className and htmlFor."
        ],
        confusions: [
          "JSX execution: JSX does not execute inside browsers directly. It is pre-compiled into standard nested ES5/ES6 function statements before server bundling."
        ],
        takeaways: [
          "JSX compiles directly to React.createElement plain objects.",
          "Elements are static descriptors; Components are functional factories.",
          "Fragments (<>...</>) wrap elements without nesting useless divs."
        ]
      }
    ]
  },
  {
    id: "react_state",
    num: "RE.2",
    title: "Hooks & State Lifecycle",
    desc: "State flows and hook closures. Study useState closures, the role of dependency arrays in useEffect, useContext re-render profiles, and custom hook abstractions.",
    declaration: `// Stable state updater references
const [count, setCount] = useState(0);

// Use functional update to avoid stale closures
const increment = () => {
  setCount(prev => prev + 1);
};`,
    internalImplementation: `/* ----------------- EFFECT MOUNT-UPDATE LIFECYCLE -----------------
   Render Component -> Executes return JSX
     ├──► Dependency array values checked
     │      ├──► [] : Run effect callback ONCE on mount
     │      ├──► [a, b] : Run callback if 'a' or 'b' changed (by Object.is)
     │      └──► No array : Run callback after EVERY render
     └──► Cleanup phase (return fn): Runs BEFORE next effect run & on unmount
*/`,
    subtopics: [
      {
        name: "State Updates & Closures",
        oneLiner: "State setters are asynchronous; utilize functional updates to resolve stale closure issues.",
        definition: "State is mutable data managed locally. Because setters batch state updates asynchronously, querying state immediately after a setter returns old closure data.",
        whyNeed: "Asynchronous batching prevents rendering pipelines from locking up on multiple consecutive state updates.",
        example: "Clicking a button that fires `setCount(count + 1)` three times only increments count by 1. Use `prev => prev + 1` to increment by 3.",
        devPerspective: "SDEs use functional updaters when the next state relies on the current state. This ensures closures read from the fresh, queued state value.",
        questions: [
          "Why are React state updates asynchronous?",
          "What is a stale closure in React hooks? How do functional updates resolve it?",
          "Explain the state batching updates introduced in React 18."
        ],
        followups: [
          "How does React merge state objects in class components vs functional useState hooks?",
          "What is lazy state initialization and when is it useful? [Passing a function to useState to run expensive setup once]"
        ],
        confusions: [
          "Immediate state query: Writing `setCount(5)` followed immediately by `console.log(count)` prints the old value of count. The fresh value is only active in the next render cycle."
        ],
        takeaways: [
          "State setters batch updates for performance.",
          "Functional setters `prev =>` always receive the queued state.",
          "Lazy initialization saves CPU during startup calculations."
        ]
      },
      {
        name: "useEffect & Cleanup Cycles",
        oneLiner: "useEffect manages side effects; dependency arrays determine re-run cycles, and cleanups prevent memory leaks.",
        definition: "A hook that runs asynchronous side effects after paint cycles. It takes a callback that returns an optional cleanup method (to cancel listeners, timers, or sockets).",
        whyNeed: "Required to sync components with external systems (APIs, WebSockets, DOM scroll events) without blocking UI rendering flows.",
        example: "Establishing a WebSocket client in useEffect, and returning a socket close function in the cleanup block.",
        devPerspective: "SDEs avoid array/object references directly inside dependency arrays because React checks references (Object.is) on every render, triggering infinite loops.",
        questions: [
          "Explain how the dependency array in useEffect determines its execution cycle.",
          "What is the purpose of the cleanup function returned by useEffect?",
          "How do you resolve infinite loops caused by object dependencies in hooks?"
        ],
        followups: [
          "Explain how you would handle race conditions during API data fetching inside useEffect.",
          "What is the difference between useEffect and useLayoutEffect? [useLayoutEffect runs synchronously before browser paint]"
        ],
        confusions: [
          "Empty dependencies: Passing `[]` means the effect runs once on mount. If you reference variables outside without adding them to dependencies, your effect gets locked to stale mount closures."
        ],
        takeaways: [
          "No dependency array = run after every render.",
          "Cleanups cancel timers, event listeners, and socket streams.",
          "Stable hook closures require honest dependency array declarations."
        ]
      }
    ]
  },
  {
    id: "react_perf",
    num: "RE.3",
    title: "Performance & Rendering Hooks",
    desc: "Resource optimization techniques. Covers useMemo/useCallback memoization boundaries, React.memo reference checks, and React 18 concurrent hooks (useTransition, useDeferredValue).",
    declaration: `// Memoizing callbacks to preserve references
const handleClick = useCallback(() => {
  doAction(id);
}, [id]); // reference remains identical unless id changes`,
    internalImplementation: `/* ----------------- MEMOIZATION CRITERIA -----------------
   Is calculation heavy? (e.g. sorting 10k items) ──► use useMemo
   Passing callback to React.memo child? ────────────► use useCallback
   Does component render frequently with same props? ──► wrap in React.memo
   Note: Premature memoization adds memory overhead; prioritize profiling first.
*/`,
    subtopics: [
      {
        name: "useMemo vs useCallback",
        oneLiner: "useMemo caches computed values; useCallback caches function references.",
        definition: "useMemo stores calculated results. useCallback stores function references to keep them identical across render cycles, avoiding child prop mismatches.",
        whyNeed: "Prevents recalculating complex math or objects on every render, and keeps function prop references stable to avoid breaking React.memo checks.",
        example: "Caching a sorted list of products via useMemo, and memoizing click handlers via useCallback for child cards.",
        devPerspective: "Only add useMemo/useCallback after profiling performance issues. Premature memoization adds code clutter and checks that can slow down fast mounts.",
        questions: [
          "Differentiate between useMemo and useCallback with code examples.",
          "What is reference equality in React? How does it relate to re-rendering?",
          "When does memoizing a function reference actually yield performance benefits?"
        ],
        followups: [
          "How does React.memo determine whether to skip a component re-render? [Perform shallow comparison on props]",
          "What is the performance cost of declaring useMemo on cheap calculations?"
        ],
        confusions: [
          "Inline handlers: Passing an inline arrow function `<Button onClick={() => doIt()} />` creates a new function on every render, rendering React.memo on Button completely useless."
        ],
        takeaways: [
          "useMemo returns a value; useCallback returns a function.",
          "Both hooks require a dependency array to recalculate caches.",
          "Use stable references to prevent child component renders."
        ]
      },
      {
        name: "Concurrent Rendering Hooks",
        oneLiner: "useTransition marks states as non-urgent; useDeferredValue defers value changes to maintain responsiveness.",
        definition: "React 18 concurrent APIs. useTransition lets state changes run in the background (non-blocking). useDeferredValue delays updating slow screen parts.",
        whyNeed: "Prevents heavy UI renders (like typing search query lists) from locking up input fields, keeping the app responsive.",
        example: "Typing in a text field updates state instantly, but filters a large grid in the background via useTransition.",
        devPerspective: "SDEs use useTransition to show active loading states using its `isPending` indicator, improving UX during heavy renders.",
        questions: [
          "What is Concurrent Rendering in React 18?",
          "Explain the useTransition hook. How does it separate urgent vs non-urgent updates?",
          "Compare useDeferredValue vs Debounce/Throttle techniques."
        ],
        followups: [
          "What is time-slicing in the context of React Fiber? [Splitting long renders into chunks, yielding control to browser input events]",
          "How does useDeferredValue help in caching old search values during queries?"
        ],
        confusions: [
          "Concurrent behavior: useTransition doesn't skip calculations; it schedules them in the background, allowing user input interrupts to stop outdated renders."
        ],
        takeaways: [
          "useTransition provides an isPending loading state.",
          "Urgent updates (input fields) run first; transition updates follow.",
          "Prevents slow renders from blocking main UI threads."
        ]
      }
    ]
  },
  {
    id: "react_advanced",
    num: "RE.4",
    title: "Advanced Patterns & Architecture",
    desc: "Patterns for clean applications. Explore React Portals, custom Context systems, Higher-Order Components (HOC), refs forwarding, and error handling boundaries.",
    declaration: `// DOM Portals for escaping overflows
return ReactDOM.createPortal(
  <div className="modal">
    {children}
  </div>,
  document.getElementById('modal-root')
);`,
    internalImplementation: `/* ----------------- COMPONENT INTERACTION METRICS -----------------
   State Container (useContext) ──► Good for global data (theme, auth status)
   Ref Forwarding (forwardRef) ──► Exposes native child DOM input nodes to parent
   Error Boundary (componentDidCatch) ──► Prevents component failures from crashing entire app
*/`,
    subtopics: [
      {
        name: "Refs, Forwarding & Portals",
        oneLiner: "useRef stores values without re-rendering; forwardRef passes refs to children; Portals render nodes outside the parent DOM hierarchy.",
        definition: "useRef holds a mutable object. forwardRef passes refs down to child elements. Portals render DOM elements in a different root container (e.g. modals).",
        whyNeed: "Accessing raw DOM methods (like focusing or scrolling inputs) and escaping parent CSS z-index/overflow clips for overlays.",
        example: "Focusing a nested input element using forwardRef, and rendering absolute-positioned modals at document body roots.",
        devPerspective: "Even though Portals render content in different DOM nodes, they stay in the React virtual tree. This means event bubbling and context subscriptions work normally.",
        questions: [
          "Explain React Portals. When and why should you use them?",
          "What is ref forwarding? How do you implement forwardRef?",
          "How is useRef different from storing a mutable variable in global scope?"
        ],
        followups: [
          "Can you listen to events bubbling up from a React Portal at the parent level? [Yes, event bubbling works normally]",
          "Explain the useImperativeHandle hook and when it is useful."
        ],
        confusions: [
          "DOM vs. Virtual hierarchy: A modal rendered via Portal at the body level still receives events and context from its parent component inside the React code tree."
        ],
        takeaways: [
          "Portals escape parent CSS overlays while preserving context.",
          "forwardRef is required to expose child DOM nodes.",
          "useRef updates do not trigger component re-renders."
        ]
      },
      {
        name: "Error Boundaries & HOCs",
        oneLiner: "Error Boundaries catch runtime errors; HOCs enhance components with reusable logic.",
        definition: "Error Boundaries are class components implementing getDerivedStateFromError to catch failures. HOCs are pure wrappers adding props to components.",
        whyNeed: "Prevents runtime JS errors in a single component from crashing the entire app. HOCs isolate logic like auth check guards.",
        example: "A profile page crashing on bad API data shows a localized error message, leaving the navigation bar functional.",
        devPerspective: "Modern React apps prefer custom hooks over HOCs because hooks compose logic cleanly without creating deep component nesting wrapper trees.",
        questions: [
          "What is an Error Boundary in React? Can functional components act as Error Boundaries? [No, requires class methods]",
          "Explain the Higher-Order Component (HOC) design pattern.",
          "Compare custom hooks vs HOCs for code reuse."
        ],
        followups: [
          "What errors do Error Boundaries fail to catch? [Event handlers, async code, SSR, errors thrown in the boundary itself]",
          "How do you implement getDerivedStateFromError and componentDidCatch?"
        ],
        confusions: [
          "Async catches: Error boundaries only catch errors thrown during React's render phase. Errors inside fetch promises or event handlers must be caught manually using try-catch blocks."
        ],
        takeaways: [
          "Error boundaries require class components.",
          "Prevent complete app crashes on rendering errors.",
          "Hooks have mostly replaced HOCs due to cleaner composition."
        ]
      }
    ]
  },
  {
    id: "react_routing_state",
    num: "RE.5",
    title: "Routing & State Managers",
    desc: "Application routing and global data stores. Analyze React Router routes mappings, and compare state managers: Redux vs. Context API vs. Zustand.",
    declaration: `// Zustand global store hooks
import create from 'zustand';
const useStore = create(set => ({
  count: 0,
  inc: () => set(state => ({ count: state.count + 1 }))
}));`,
    internalImplementation: `/* ----------------- STATE MANAGER PROFILES -----------------
   Context API  ──► Good for low-frequency variables (Theme, Auth). Re-renders ALL consumers.
   Redux Toolkit──► Highly structured, global actions. Uses selector pools to map exact fields.
   Zustand      ──► Simple hooks, minimal boilerplate, out-of-box selector tracking.
*/`,
    subtopics: [
      {
        name: "React Router Mechanics",
        oneLiner: "React Router intercepts URL requests, matching paths to components via nested router outlets.",
        definition: "A declarative routing engine matching URL paths to components using HTML5 history APIs, supporting parameters, query hooks, and nested layouts.",
        whyNeed: "Creates SPA (Single Page Application) navigation experiences, maintaining logical paths without full browser document reloads.",
        example: "Typing `/users/15` parses route parameters using `useParams()` to query user details dynamically.",
        devPerspective: "Using `<Outlet />` allows layout structures to nest child sub-routes seamlessly, preserving the nav header state between page transitions.",
        questions: [
          "How does client-side routing differ from server-side routing?",
          "Explain the purpose of the <Outlet /> component in React Router.",
          "Compare useNavigate() and <Link /> for route navigation."
        ],
        followups: [
          "What is the difference between path params (useParams) and query strings (useSearchParams)?",
          "Explain route lazy loading with React.lazy and Suspense."
        ],
        confusions: [
          "Link reload: Using standard `<a href=\"...\">` tags bypasses React Router, executing a full document reload. Always use `<Link to=\"...\">` to preserve SPA state caches."
        ],
        takeaways: [
          "Client routing uses HTML5 History pushState APIs.",
          "<Outlet /> renders child route viewports dynamically.",
          "Lazy routes split bundles to speed up initial loads."
        ]
      },
      {
        name: "Global State Managers",
        oneLiner: "Choose Context for static config data; choose Zustand or Redux for high-frequency updates.",
        definition: "Libraries (Zustand, Redux) that store data in global pools, allowing components to subscribe to slices using custom selectors.",
        whyNeed: "Context API triggers re-renders on all consumer components whenever the value changes. Specialized managers isolate renders via shallow selector checks.",
        example: "Selecting only the user avatar from a Zustand store avoids re-rendering the component when the user updates their notification preferences.",
        devPerspective: "SDEs use Context for themes, locales, and authentication. For complex business modules like a checkout basket or chat, they use Zustand or Redux.",
        questions: [
          "Compare Redux Toolkit, Zustand, and Context API.",
          "Why does Context API cause performance issues on high-frequency state updates?",
          "What is a selector in state management and why is it important?"
        ],
        followups: [
          "How does Zustand achieve state subscription updates without wrapping components in Providers?",
          "Explain unidirectional data flow in Redux (Action -> Dispatcher -> Reducer -> Store)."
        ],
        confusions: [
          "Context is not state management: Context is a transport pipeline for values; the actual state lives inside a useState/useReducer hook on the Provider component."
        ],
        takeaways: [
          "Context causes all subscribed consumers to re-render.",
          "Zustand uses selector tracking for surgical rendering updates.",
          "Redux is useful for large teams needing trace logs."
        ]
      }
    ]
  },
  {
    id: "react_testing",
    num: "RE.6",
    title: "React Testing & RTL",
    desc: "Validating user interfaces. Covers React Testing Library query hierarchies (getBy, queryBy, findBy), mocking user events, and stubbing mock servers with MSW.",
    declaration: `// React Testing Library rendering test
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

test('renders and clicks button', async () => {
  render(<Button label="Submit" />);
  const btn = screen.getByRole('button', { name: /submit/i });
  await userEvent.click(btn);
});`,
    internalImplementation: `/* ----------------- RTL QUERY PRIORITY MATRIX -----------------
   1. Queries accessible to all ──► getByRole, getByLabelText, getByText
   2. Semantic HTML selectors   ──► getByAltText, getByTitle
   3. Testing Escape Hatches    ──► getByTestId (use only when text/role matches fail)
*/`,
    subtopics: [
      {
        name: "RTL Query Strategies",
        oneLiner: "Use getBy for elements that must exist; queryBy for missing items; findBy for async elements.",
        definition: "Query methods provided by React Testing Library. getBy raises errors on missing elements; queryBy returns null; findBy resolves promises asynchronously.",
        whyNeed: "Ensures testing suites match user accessible queries (text/role matching) instead of brittle HTML structure selectors.",
        example: "Using `screen.queryByText(/loading/i)` to assert that the spinner is successfully removed from the DOM after data loads.",
        devPerspective: "SDEs write queries targeting semantic roles (e.g. `getByRole('button')`) to ensure the application conforms to accessibility (ARIA) standards.",
        questions: [
          "Compare getBy, queryBy, and findBy query types in React Testing Library.",
          "Why is selecting elements by role preferred over selecting by class name or id?",
          "When is it acceptable to use getByTestId?"
        ],
        followups: [
          "What is the difference between fireEvent and userEvent libraries? [userEvent simulates full browser user event sequences, including focus changes]",
          "How do you test error responses thrown from async operations using findBy queries?"
        ],
        confusions: [
          "Testing implementation details: Do not assert state values directly inside test cases. Assert what the user actually sees on screen (e.g. text blocks or modal headers)."
        ],
        takeaways: [
          "getBy fails instantly if the element is not found.",
          "queryBy is required to assert that elements are not in the DOM.",
          "findBy runs async, checking up to a default 1000ms timeout."
        ]
      },
      {
        name: "Mocking & MSW (Mock Service Worker)",
        oneLiner: "MSW intercepts network calls at the browser layer, returning stable mock responses.",
        definition: "A network mocking tool that intercepts HTTP queries using Service Worker APIs, avoiding mocking raw fetch or axios packages directly.",
        whyNeed: "Mocking axios directly leaks implementation details. MSW mocks the actual network boundary, allowing tests to run unchanged if libraries swap.",
        example: "Configuring a mock server handler to return a 500 Server Error response when testing error boundary widgets.",
        devPerspective: "SDEs run MSW handlers inside Jest/Vitest setups (`beforeAll`, `afterEach`, `afterAll`) to clean handlers between tests, avoiding test leaks.",
        questions: [
          "What is Mock Service Worker (MSW) and why is it preferred over mocking fetch/axios?",
          "How do you verify loading, success, and error states inside a React data component?",
          "Explain how to mock third-party libraries (like react-router-dom) in Vitest."
        ],
        followups: [
          "How do you handle mock cleanup between test assertions to prevent leakage?",
          "What is screen.debug() and how do you use it to trace HTML trees during failures?"
        ],
        confusions: [
          "Mock scopes: Fetch mocking must be cleaned after every test case run. Otherwise, a mocked profile response might leak and cause unrelated tests to fail."
        ],
        takeaways: [
          "MSW intercepts HTTP calls at the browser level.",
          "Avoid mocking fetch directly; mock the network boundary instead.",
          "Clean mock states between tests to prevent test leakage."
        ]
      }
    ]
  },
  {
    id: "react_ssr_perf",
    num: "RE.7",
    title: "SSR & Next.js Core",
    desc: "Modern React frameworks. Learn Client-Side Rendering vs Server-Side Rendering (SSR), React Server Components (RSC) patterns, and how to debug hydration mismatches.",
    declaration: `// React Server Component (Default in Next.js App Router)
async function ServerProfile({ userId }) {
  const user = await db.getUser(userId); // Runs directly on server
  return <ProfileCard name={user.name} />;
}`,
    internalImplementation: `/* ----------------- HYDRATION MISMATCH CRITERIA -----------------
   Renders static HTML on server (e.g. Server Date)
     ├──► Client receives HTML tree
     │      ├──► Client compares HTML with first JS render output
     │      └──► Date mismatch (Time updated on client) -> Hydration Error!
   Fix: Keep server/client markup matching. Use useEffect for client-only changes.
*/`,
    subtopics: [
      {
        name: "CSR vs SSR vs Server Components",
        oneLiner: "SSR pre-renders HTML per request; Server Components execute on the server, sending static nodes without JS weight.",
        definition: "CSR renders views in the browser. SSR renders HTML on the server on demand. React Server Components (RSC) fetch data and render directly on the server, removing dependency code from the client bundle.",
        whyNeed: "CSR causes slow initial page loads and poor SEO indexings. Server Components stream UI elements, shrinking the JavaScript package size sent to the client.",
        example: "A database-heavy dashboard page fetches data and renders layout panels on the server, leaving only interactive buttons as client components.",
        devPerspective: "In Next.js, components are Server Components by default. You add the `'use client'` directive at the top to declare state or hooks (Client Components).",
        questions: [
          "Compare Client-Side Rendering (CSR), Server-Side Rendering (SSR), and Static Site Generation (SSG).",
          "What are React Server Components (RSC)? How do they differ from SSR?",
          "Explain the difference between Server Components and Client Components ('use client')."
        ],
        followups: [
          "Can a Server Component import a Client Component? Can a Client Component import a Server Component? [Yes, but Server Components must be passed as children props to Client Components]",
          "How does data caching behave in Server Components compared to client requests?"
        ],
        confusions: [
          "'use client' executes on server: The `'use client'` directive does NOT mean the component only runs in the browser. It is still pre-rendered to static HTML on the server before client-side hydration."
        ],
        takeaways: [
          "Server components reduce client JavaScript bundle size.",
          "SSR renders HTML per request; SSG renders once at build time.",
          "Use Client Components for events, state, and browser APIs."
        ]
      },
      {
        name: "Hydration Mismatches",
        oneLiner: "Hydration matches HTML markup between server and client; date/time shifts trigger mismatches.",
        definition: "Hydration is the client-side process where React binds event listeners to the server-rendered HTML. A mismatch happens if the client's first render output differs from the server HTML.",
        whyNeed: "Understanding hydration prevents blank screen flashes and React runtime console errors that break page interactions.",
        example: "Rendering the current local timestamp (`new Date()`) directly in JSX. The server and client will evaluate different seconds, causing a hydration error.",
        devPerspective: "To render client-specific values (like window sizes or timestamps), SDEs check `mounted` state inside useEffect, rendering placeholder layouts until the client runs.",
        questions: [
          "What is Hydration in React SSR?",
          "What causes a Hydration Mismatch error? Give 3 common examples.",
          "How do you resolve hydration errors caused by rendering client-specific dates/timezones?"
        ],
        followups: [
          "How can you temporarily bypass a hydration mismatch check on a specific element? [Use suppressHydrationWarning prop]",
          "Explain how window or document access crashes Server-Side Rendering environments."
        ],
        confusions: [
          "Window access: Referencing `window` or `document` directly in global scope crashes the Node.js server. Always place these checks inside `useEffect` or behind `typeof window !== 'undefined'` checks."
        ],
        takeaways: [
          "Hydration attaches event bindings to static HTML trees.",
          "Timezones, dates, and random numbers trigger hydration warnings.",
          "Run client-only logic inside useEffect after the component mounts."
        ]
      }
    ]
  }
];
