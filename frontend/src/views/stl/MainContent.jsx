// --- 1. Import ALL C++ components ---
import VectorTable from './VectorTable';
import ListTable from './ListTable';
import DequeTable from './DequeTable';
import StackTable from './StackTable';
import QueueTable from './QueueTable';
import PriorityQueueTable from './PriorityQueueTable';
import SetTable from './SetTable';
import MultisetTable from './MultisetTable';
import MapTable from './MapTable';
import MultimapTable from './MultimapTable';
import UnorderedSetTable from './UnorderedSetTable';
import UnorderedMultisetTable from './UnorderedMultisetTable';
import UnorderedMapTable from './UnorderedMapTable';
import UnorderedMultimapTable from './UnorderedMultimapTable';
import PairTable from './PairTable';
import StringTable from './StringTable';
import SortingTable from './SortingTable';
import MinMaxTable from './MinMaxTable';
import ModifyingTable from './ModifyingTable';
import PermutationsTable from './PermutationsTable';
import PartitioningTable from './PartitioningTable';
import NumericTable from './NumericTable';

// --- 2. Import ALL new Java placeholders from the new folder ---
import {
  ArrayListTable, LinkedListTable, VectorJavaTable, StackJavaTable,
  QueueJavaTable, DequeJavaTable, PriorityQueueJavaTable,
  HashSetTable, LinkedHashSetTable, TreeSetTable,
  HashMapTable, LinkedHashMapTable, TreeMapTable, HashtableTable,
  CollectionsTable, ArraysTable,
  StringBuilderTable, StringBufferTable
} from './Javacomponents/JavaPlaceholders';


// --- ICONS (unchanged) ---
const MenuIcon = ({ isOpen }) => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} className="transition-all duration-300 ease-in-out" />
  </svg>
);
const ThemeIcon = ({ isDarkMode }) => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    {isDarkMode ? (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    ) : (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    )}
  </svg>
);

// --- 3. Create sub-components for C++ and Java content ---
const CppContent = () => (
  <>
    <VectorTable />
    <ListTable />
    <DequeTable />
    <StackTable />
    <QueueTable />
    <PriorityQueueTable />
    <SetTable />
    <MultisetTable />
    <MapTable />
    <MultimapTable />
    <UnorderedSetTable />
    <UnorderedMultisetTable />
    <UnorderedMapTable />
    <UnorderedMultimapTable />
    <PairTable />
    <StringTable />
    <SortingTable />
    <MinMaxTable />
    <ModifyingTable />
    <PermutationsTable />
    <PartitioningTable />
    <NumericTable />
  </>
);

const JavaContent = () => (
  <>
    <ArrayListTable />
    <LinkedListTable />
    <VectorJavaTable />
    <StackJavaTable />
    <QueueJavaTable />
    <DequeJavaTable />
    <PriorityQueueJavaTable />
    <HashSetTable />
    <LinkedHashSetTable />
    <TreeSetTable />
    <HashMapTable />
    <LinkedHashMapTable />
    <TreeMapTable />
    <HashtableTable />
    <CollectionsTable />
    <ArraysTable />
    <StringBuilderTable />
    <StringBufferTable />
  </>
);


// --- 4. Receives 'activeView' prop in its signature ---
export default function MainContent({ isOpen, toggleSidebar, isDarkMode, toggleTheme, activeView }) {
  return (
    <main
      className={`relative min-h-screen 
                  bg-gray-50 dark:bg-[#0a0a0a] 
                  transition-all duration-500 ease-in-out
                  ${isOpen ? 'pl-0 sm:pl-64' : 'pl-0'}`}
    >
      {/* Buttons are unchanged */}
      <button
        onClick={toggleSidebar}
        className={`fixed top-6 z-50 p-3 
                    bg-white/60 dark:bg-black/60 backdrop-blur-md 
                    border border-gray-200 dark:border-[#333] 
                    rounded-full text-gray-700 dark:text-gray-300 
                    hover:text-red-500 dark:hover:text-red-500 
                    hover:shadow-[0_0_20px_rgba(255,0,0,0.4)]
                    transition-all duration-500 ease-in-out
                    ${isOpen ? 'left-1/2 -translate-x-1/2 sm:left-64 sm:ml-4 sm:translate-x-0' : 'left-6 translate-x-0'}`}
      >
        <MenuIcon isOpen={isOpen} />
      </button>

      <button
        onClick={toggleTheme}
        className="fixed top-6 right-6 z-50 p-3 
                   bg-white/60 dark:bg-black/60 backdrop-blur-md 
                   border border-gray-200 dark:border-[#333] 
                   rounded-full text-gray-700 dark:text-gray-300 
                   hover:text-red-500 dark:hover:text-red-500 
                   hover:shadow-[0_0_20px_rgba(255,0,0,0.4)]
                   transition-all duration-300 ease-in-out"
      >
        <ThemeIcon isDarkMode={isDarkMode} />
      </button>
      
      {/* 5. Conditionally renders content based on 'activeView' */}
      <div className="max-w-7xl mx-auto p-6 md:p-10 pt-24 space-y-8">
        {activeView === 'cpp' ? <CppContent /> : <JavaContent />}
      </div>
    </main>
  );
}