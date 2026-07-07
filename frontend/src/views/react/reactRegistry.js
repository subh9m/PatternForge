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
  }
];
