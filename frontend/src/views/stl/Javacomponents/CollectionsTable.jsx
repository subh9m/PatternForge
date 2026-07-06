// Data for the Collections class component
const collectionsData = [
  { method: 'sort()', syntax: 'Collections.sort(list)', params: 'List', output: 'void', complexity: 'O(n log n)', desc: 'Sorts list in natural order', worksWith: 'ArrayList, LinkedList, Vector', doesNotWorkWith: 'Set, Map, Arrays, Fixed-size lists' },
  { method: 'sort()', syntax: 'Collections.sort(list, comp)', params: 'List, Comparator', output: 'void', complexity: 'O(n log n)', desc: 'Sorts list using comparator', worksWith: 'ArrayList, LinkedList, Vector', doesNotWorkWith: 'Set, Map, Arrays, Fixed-size lists' },
  { method: 'reverse()', syntax: 'Collections.reverse(list)', params: 'List', output: 'void', complexity: 'O(n)', desc: 'Reverses list', worksWith: 'ArrayList, LinkedList, Vector', doesNotWorkWith: 'Set, Map, Arrays, Fixed-size lists' },
  { method: 'shuffle()', syntax: 'Collections.shuffle(list)', params: 'List', output: 'void', complexity: 'O(n)', desc: 'Randomly shuffles list', worksWith: 'ArrayList, LinkedList, Vector', doesNotWorkWith: 'Set, Map, Arrays, Fixed-size lists' },
  { method: 'binarySearch()', syntax: 'Collections.binarySearch(list, key)', params: 'List, key', output: 'int', complexity: 'O(log n)', desc: 'Searches in sorted list', worksWith: 'Sorted ArrayList, LinkedList, Vector', doesNotWorkWith: 'Unsorted lists, Set, Map, Arrays' },
  { method: 'max()', syntax: 'Collections.max(collection)', params: 'Collection', output: 'element', complexity: 'O(n)', desc: 'Returns maximum element', worksWith: 'All Collection types (List, Set, Queue)', doesNotWorkWith: 'Map, Arrays' },
  { method: 'min()', syntax: 'Collections.min(collection)', params: 'Collection', output: 'element', complexity: 'O(n)', desc: 'Returns minimum element', worksWith: 'All Collection types (List, Set, Queue)', doesNotWorkWith: 'Map, Arrays' },
  { method: 'frequency()', syntax: 'Collections.frequency(col, obj)', params: 'Collection, object', output: 'int', complexity: 'O(n)', desc: 'Counts occurrences', worksWith: 'All Collection types (List, Set, Queue)', doesNotWorkWith: 'Map, Arrays' },
  { method: 'swap()', syntax: 'Collections.swap(list, i, j)', params: 'List, indices', output: 'void', complexity: 'O(1)', desc: 'Swaps elements at indices', worksWith: 'ArrayList, LinkedList, Vector', doesNotWorkWith: 'Set, Map, Arrays, Fixed-size lists' },
  { method: 'fill()', syntax: 'Collections.fill(list, obj)', params: 'List, object', output: 'void', complexity: 'O(n)', desc: 'Fills list with object', worksWith: 'ArrayList, LinkedList, Vector', doesNotWorkWith: 'Set, Map, Arrays, Fixed-size lists' },
  { method: 'copy()', syntax: 'Collections.copy(dest, src)', params: 'Lists', output: 'void', complexity: 'O(n)', desc: 'Copies source to destination', worksWith: 'ArrayList, LinkedList, Vector (dest size ≥ src)', doesNotWorkWith: 'Set, Map, Arrays, Undersized dest' },
  { method: 'reverseOrder()', syntax: 'Collections.reverseOrder()', params: '—', output: 'Comparator', complexity: 'O(1)', desc: 'Returns reverse order comparator', worksWith: 'With sort(), TreeSet, TreeMap, PriorityQueue', doesNotWorkWith: 'Direct usage on collections' },
  { method: 'addAll()', syntax: 'Collections.addAll(col, elem...)', params: 'Collection, elements', output: 'boolean', complexity: 'O(n)', desc: 'Adds all elements to collection', worksWith: 'All Collection types (List, Set, Queue)', doesNotWorkWith: 'Map, Arrays, Fixed-size collections' },
  { method: 'disjoint()', syntax: 'Collections.disjoint(c1, c2)', params: 'Collections', output: 'boolean', complexity: 'O(n*m)', desc: 'Checks if no common elements', worksWith: 'All Collection types', doesNotWorkWith: 'Map, Arrays' },
  { method: 'replaceAll()', syntax: 'Collections.replaceAll(list, old, new)', params: 'List, values', output: 'boolean', complexity: 'O(n)', desc: 'Replaces all occurrences', worksWith: 'ArrayList, LinkedList, Vector', doesNotWorkWith: 'Set, Map, Arrays, Fixed-size lists' },
  { method: 'rotate()', syntax: 'Collections.rotate(list, distance)', params: 'List, int', output: 'void', complexity: 'O(n)', desc: 'Rotates elements by distance', worksWith: 'ArrayList, LinkedList, Vector', doesNotWorkWith: 'Set, Map, Arrays, Fixed-size lists' },
  { method: 'nCopies()', syntax: 'Collections.nCopies(n, obj)', params: 'count, object', output: 'List', complexity: 'O(1)', desc: 'Returns immutable list with n copies', worksWith: 'Read operations only', doesNotWorkWith: 'Modification operations' },
  { method: 'singleton()', syntax: 'Collections.singleton(obj)', params: 'object', output: 'Set', complexity: 'O(1)', desc: 'Returns immutable set with one element', worksWith: 'Read operations only', doesNotWorkWith: 'Modification operations' },
  { method: 'singletonList()', syntax: 'Collections.singletonList(obj)', params: 'object', output: 'List', complexity: 'O(1)', desc: 'Returns immutable list with one element', worksWith: 'Read operations only', doesNotWorkWith: 'Modification operations' },
  { method: 'emptyList()', syntax: 'Collections.emptyList()', params: '—', output: 'List', complexity: 'O(1)', desc: 'Returns immutable empty list', worksWith: 'Read operations only', doesNotWorkWith: 'Modification operations' },
  { method: 'emptySet()', syntax: 'Collections.emptySet()', params: '—', output: 'Set', complexity: 'O(1)', desc: 'Returns immutable empty set', worksWith: 'Read operations only', doesNotWorkWith: 'Modification operations' },
  { method: 'emptyMap()', syntax: 'Collections.emptyMap()', params: '—', output: 'Map', complexity: 'O(1)', desc: 'Returns immutable empty map', worksWith: 'Read operations only', doesNotWorkWith: 'Modification operations' },
  { method: 'synchronizedList()', syntax: 'Collections.synchronizedList(list)', params: 'List', output: 'List', complexity: 'O(1)', desc: 'Returns thread-safe list wrapper', worksWith: 'Multi-threaded environments', doesNotWorkWith: 'Single-threaded (adds overhead)' },
  { method: 'synchronizedSet()', syntax: 'Collections.synchronizedSet(set)', params: 'Set', output: 'Set', complexity: 'O(1)', desc: 'Returns thread-safe set wrapper', worksWith: 'Multi-threaded environments', doesNotWorkWith: 'Single-threaded (adds overhead)' },
  { method: 'synchronizedMap()', syntax: 'Collections.synchronizedMap(map)', params: 'Map', output: 'Map', complexity: 'O(1)', desc: 'Returns thread-safe map wrapper', worksWith: 'Multi-threaded environments', doesNotWorkWith: 'Single-threaded (adds overhead)' },
  { method: 'unmodifiableList()', syntax: 'Collections.unmodifiableList(list)', params: 'List', output: 'List', complexity: 'O(1)', desc: 'Returns read-only list view', worksWith: 'Read-only access', doesNotWorkWith: 'Modification operations' },
  { method: 'unmodifiableSet()', syntax: 'Collections.unmodifiableSet(set)', params: 'Set', output: 'Set', complexity: 'O(1)', desc: 'Returns read-only set view', worksWith: 'Read-only access', doesNotWorkWith: 'Modification operations' },
  { method: 'unmodifiableMap()', syntax: 'Collections.unmodifiableMap(map)', params: 'Map', output: 'Map', complexity: 'O(1)', desc: 'Returns read-only map view', worksWith: 'Read-only access', doesNotWorkWith: 'Modification operations' }
];

// Updated headers to include the 2 new columns
const tableHeaders = ['Method', 'Syntax', 'Input / Parameters', 'Output / Return', 'Time Complexity', 'Description', 'Works With', 'Does NOT Work With'];

export default function CollectionsTable() {
  return (
    <section 
      id="collections" // ID for sidebar anchor
      className="bg-white/60 dark:bg-black/60 backdrop-blur-md 
                 border border-gray-200 dark:border-[#333] 
                 rounded-2xl overflow-hidden shadow-lg
                 hover:shadow-[0_0_25px_rgba(255,0,0,0.25)] hover:-translate-y-1 
                 transition-all duration-500 ease-in-out"
    >
      {/* Card Header */}
      <div className="p-6 md:p-8 border-b border-gray-200 dark:border-[#333]">
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 dark:text-white">
          <span className="font-mono text-red-500 mr-3">E.1</span>
          <span className="font-inter">Collections Class (Utility Methods)</span>
        </h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400 font-light">
          A utility class with static methods that operate on or return collections.
        </p>
      </div>

      {/* Responsive Table Wrapper */}
      <div className="overflow-x-auto">
        {/* Increased min-width to accommodate new columns */}
        <table className="w-full min-w-[1280px] text-left text-sm"> 
          <thead className="bg-gray-50/70 dark:bg-neutral-950/70 
                          border-b border-gray-200 dark:border-[#333]">
            <tr>
              {tableHeaders.map((header) => (
                <th 
                  key={header} 
                  scope="col" 
                  className="px-6 py-4 font-medium 
                             text-gray-600 dark:text-gray-300 
                             font-mono uppercase tracking-wider"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-[#333]">
            {collectionsData.map((row) => (
              <tr key={row.method + row.syntax} className="hover:bg-gray-100/50 dark:hover:bg-neutral-900/50 
                                           transition-colors duration-200">
                <td className="px-6 py-4 font-mono font-medium text-red-600 dark:text-red-500 whitespace-nowrap">{row.method}</td>
                <td className="px-6 py-4 font-mono text-gray-700 dark:text-gray-300 whitespace-nowrap"><code>{row.syntax}</code></td>
                <td className="px-6 py-4 text-gray-600 dark:text-gray-400 font-light whitespace-nowrap">{row.params}</td>
                <td className="px-6 py-4 font-mono text-gray-700 dark:text-gray-300 whitespace-nowrap"><code>{row.output}</code></td>
                <td className="px-6 py-4 font-mono text-gray-700 dark:text-gray-300 whitespace-nowrap">{row.complexity}</td>
                <td className="px-6 py-4 text-gray-600 dark:text-gray-400 font-light">{row.desc}</td>
                {/* New Columns */}
                <td className="px-6 py-4 text-gray-600 dark:text-gray-400 font-light">{row.worksWith}</td>
                <td className="px-6 py-4 text-gray-600 dark:text-gray-400 font-light">{row.doesNotWorkWith}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}