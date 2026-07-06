import React from 'react'; // Make sure React is imported

// NavItem and NavHeading are unchanged
const NavItem = ({ href, children }) => (
  <a
    href={href}
    className="block px-4 py-2 rounded-lg 
               text-gray-700 hover:text-red-500 
               dark:text-gray-300 dark:hover:text-red-500
               hover:shadow-[0_0_15px_rgba(255,0,0,0.3)] hover:-translate-y-px 
               transition-all duration-300 ease-in-out"
  >
    {children}
  </a>
);

const NavHeading = ({ children }) => (
  <h3 className="px-4 pt-4 pb-2 text-sm font-mono uppercase tracking-widest text-gray-500 dark:text-gray-500">
    {children}
  </h3>
);

// C++ Links Component
const CppNavLinks = () => (
  <nav className="mt-4 space-y-4">
    <div>
      <NavHeading>A. Sequence Containers</NavHeading>
      <ul className="space-y-1">
        <li><NavItem href="#vector">A.1 Vector</NavItem></li>
        <li><NavItem href="#list">A.2 List</NavItem></li>
        <li><NavItem href="#deque">A.3 Deque</NavItem></li>
      </ul>
    </div>
    <div>
      <NavHeading>B. Container Adapters</NavHeading>
      <ul className="space-y-1">
        <li><NavItem href="#stack">B.1 Stack</NavItem></li>
        <li><NavItem href="#queue">B.2 Queue</NavItem></li>
        <li><NavItem href="#priority_queue">B.3 Priority Queue</NavItem></li>
      </ul>
    </div>
    <div>
      <NavHeading>C. Associative (Ordered)</NavHeading>
      <ul className="space-y-1">
        <li><NavItem href="#set">C.1 Set</NavItem></li>
        <li><NavItem href="#multiset">C.2 Multiset</NavItem></li>
        <li><NavItem href="#map">C.3 Map</NavItem></li>
        <li><NavItem href="#multimap">C.4 Multimap</NavItem></li>
      </ul>
    </div>
    <div>
      <NavHeading>D. Associative (Unordered)</NavHeading>
      <ul className="space-y-1">
        <li><NavItem href="#unordered_set">D.1 Unordered Set</NavItem></li>
        <li><NavItem href="#unordered_multiset">D.2 Unordered Multiset</NavItem></li>
        <li><NavItem href="#unordered_map">D.3 Unordered Map</NavItem></li>
        <li><NavItem href="#unordered_multimap">D.4 Unordered Multimap</NavItem></li>
      </ul>
    </div>
    <div>
      <NavHeading>E. Utility Components</NavHeading>
      <ul className="space-y-1">
        <li><NavItem href="#pair">E.1 Pair</NavItem></li>
        <li><NavItem href="#string">E.2 String</NavItem></li>
      </ul>
    </div>
    <div>
      <NavHeading>F. STL Algorithms</NavHeading>
      <ul className="space-y-1">
        <li><NavItem href="#sorting">F.1 Sorting & Searching</NavItem></li>
        <li><NavItem href="#minmax">F.2 Min/Max</NavItem></li>
        <li><NavItem href="#modifying">F.3 Modifying</NavItem></li>
        <li><NavItem href="#permutations">F.4 Permutations</NavItem></li>
        <li><NavItem href="#partitioning">F.5 Partitioning</NavItem></li>
        <li><NavItem href="#numeric">F.6 Numeric</NavItem></li>
      </ul>
    </div>
  </nav>
);

// Java Links Component
const JavaNavLinks = () => (
  <nav className="mt-4 space-y-4">
    <div>
      <NavHeading>A. List Interface</NavHeading>
      <ul className="space-y-1">
        <li><NavItem href="#arrayList">A.1 ArrayList</NavItem></li>
        <li><NavItem href="#linkedList">A.2 LinkedList</NavItem></li>
        <li><NavItem href="#vector-java">A.3 Vector</NavItem></li>
        <li><NavItem href="#stack-java">A.4 Stack</NavItem></li>
      </ul>
    </div>
    <div>
      <NavHeading>B. Queue Interface</NavHeading>
      <ul className="space-y-1">
        <li><NavItem href="#queue-java">B.1 Queue</NavItem></li>
        <li><NavItem href="#deque-java">B.2 Deque</NavItem></li>
        <li><NavItem href="#priorityQueue-java">B.3 PriorityQueue</NavItem></li>
      </ul>
    </div>
    <div>
      <NavHeading>C. Set Interface</NavHeading>
      <ul className="space-y-1">
        <li><NavItem href="#hashSet">C.1 HashSet</NavItem></li>
        <li><NavItem href="#linkedHashSet">C.2 LinkedHashSet</NavItem></li>
        <li><NavItem href="#treeSet">C.3 TreeSet</NavItem></li>
      </ul>
    </div>
    <div>
      <NavHeading>D. Map Interface</NavHeading>
      <ul className="space-y-1">
        <li><NavItem href="#hashMap">D.1 HashMap</NavItem></li>
        <li><NavItem href="#linkedHashMap">D.2 LinkedHashMap</NavItem></li>
        <li><NavItem href="#treeMap">D.3 TreeMap</NavItem></li>
        <li><NavItem href="#hashtable">D.4 Hashtable</NavItem></li>
      </ul>
    </div>
    <div>
      <NavHeading>E. Utility Classes</NavHeading>
      <ul className="space-y-1">
        <li><NavItem href="#collections">E.1 Collections</NavItem></li>
        <li><NavItem href="#arrays">E.2 Arrays</NavItem></li>
      </ul>
    </div>
    <div>
      <NavHeading>F. Other Classes</NavHeading>
      <ul className="space-y-1">
        <li><NavItem href="#stringBuilder">F.1 StringBuilder</NavItem></li>
        <li><NavItem href="#stringBuffer">F.2 StringBuffer</NavItem></li>
      </ul>
    </div>
  </nav>
);

export default function Sidebar({ isOpen, activeView }) {
  return (
    <aside
      className={`fixed top-16 left-0 z-35 h-[calc(100vh-64px)] w-64 
                  bg-white/80 dark:bg-black/80 backdrop-blur-md 
                  border-r border-gray-200 dark:border-[#333]
                  transform transition-all duration-500 ease-in-out
                  ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
    >
      <div className="h-full px-3 py-4 overflow-y-auto">
        {/* Title */}
        <h2 className="p-4 text-2xl font-medium uppercase tracking-wider 
                       text-gray-900 dark:text-white font-mono">
          {activeView === 'cpp' ? 'C++ STL' : 'Java Collections'}
        </h2>
        
        {/* Conditionally render navigation links */}
        {activeView === 'cpp' ? <CppNavLinks /> : <JavaNavLinks />}
      </div>
    </aside>
  );
}