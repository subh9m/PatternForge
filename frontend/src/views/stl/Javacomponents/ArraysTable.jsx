// Data for the Arrays class component
const arraysData = [
  { method: 'sort()', syntax: 'Arrays.sort(array)', params: 'array', output: 'void', complexity: 'O(n log n)', desc: 'Sorts array in ascending order', worksWith: 'Primitive arrays, Object arrays', doesNotWorkWith: 'Collections (List, Set, Map)' },
  { method: 'sort()', syntax: 'Arrays.sort(array, comp)', params: 'array, Comparator', output: 'void', complexity: 'O(n log n)', desc: 'Sorts array using comparator', worksWith: 'Object arrays only', doesNotWorkWith: 'Primitive arrays, Collections' },
  { method: 'binarySearch()', syntax: 'Arrays.binarySearch(array, key)', params: 'array, key', output: 'int', complexity: 'O(log n)', desc: 'Searches in sorted array', worksWith: 'Sorted primitive/Object arrays', doesNotWorkWith: 'Unsorted arrays, Collections' },
  { method: 'fill()', syntax: 'Arrays.fill(array, value)', params: 'array, value', output: 'void', complexity: 'O(n)', desc: 'Fills array with value', worksWith: 'Primitive arrays, Object arrays', doesNotWorkWith: 'Collections (List, Set, Map)' },
  { method: 'fill()', syntax: 'Arrays.fill(array, from, to, value)', params: 'array, indices, value', output: 'void', complexity: 'O(n)', desc: 'Fills array range with value', worksWith: 'Primitive arrays, Object arrays', doesNotWorkWith: 'Collections (List, Set, Map)' },
  { method: 'copyOf()', syntax: 'Arrays.copyOf(array, length)', params: 'array, length', output: 'array', complexity: 'O(n)', desc: 'Copies array to new length', worksWith: 'Primitive arrays, Object arrays', doesNotWorkWith: 'Collections (List, Set, Map)' },
  { method: 'copyOfRange()', syntax: 'Arrays.copyOfRange(array, from, to)', params: 'array, indices', output: 'array', complexity: 'O(n)', desc: 'Copies array range', worksWith: 'Primitive arrays, Object arrays', doesNotWorkWith: 'Collections (List, Set, Map)' },
  { method: 'equals()', syntax: 'Arrays.equals(arr1, arr2)', params: 'two arrays', output: 'boolean', complexity: 'O(n)', desc: 'Checks if arrays are equal', worksWith: 'Primitive arrays, Object arrays', doesNotWorkWith: 'Collections, Multi-dimensional arrays' },
  { method: 'deepEquals()', syntax: 'Arrays.deepEquals(arr1, arr2)', params: 'two arrays', output: 'boolean', complexity: 'O(n)', desc: 'Checks deep equality', worksWith: 'Multi-dimensional Object arrays', doesNotWorkWith: 'Primitive arrays, Single-dimensional arrays' },
  { method: 'toString()', syntax: 'Arrays.toString(array)', params: 'array', output: 'String', complexity: 'O(n)', desc: 'Converts array to string', worksWith: 'Primitive arrays, 1D Object arrays', doesNotWorkWith: 'Multi-dimensional arrays, Collections' },
  { method: 'deepToString()', syntax: 'Arrays.deepToString(array)', params: 'array', output: 'String', complexity: 'O(n)', desc: 'Converts nested arrays to string', worksWith: 'Multi-dimensional Object arrays', doesNotWorkWith: 'Primitive arrays, Single-dimensional arrays' },
  { method: 'asList()', syntax: 'Arrays.asList(elements...)', params: 'elements', output: 'List', complexity: 'O(1)', desc: 'Returns fixed-size list', worksWith: 'Object arrays, varargs', doesNotWorkWith: 'Primitive arrays (int[], char[] etc.)' },
  { method: 'stream()', syntax: 'Arrays.stream(array)', params: 'array', output: 'Stream', complexity: 'O(1)', desc: 'Returns stream of array', worksWith: 'Primitive arrays, Object arrays', doesNotWorkWith: 'Collections (use collection.stream())' },
  { method: 'parallelSort()', syntax: 'Arrays.parallelSort(array)', params: 'array', output: 'void', complexity: 'O(n log n)', desc: 'Sorts array using parallel threads', worksWith: 'Large primitive/Object arrays', doesNotWorkWith: 'Small arrays (overhead not worth it)' },
  { method: 'compare()', syntax: 'Arrays.compare(arr1, arr2)', params: 'two arrays', output: 'int', complexity: 'O(n)', desc: 'Lexicographically compares arrays', worksWith: 'Primitive arrays, Object arrays', doesNotWorkWith: 'Collections' },
  { method: 'mismatch()', syntax: 'Arrays.mismatch(arr1, arr2)', params: 'two arrays', output: 'int', complexity: 'O(n)', desc: 'Finds first index where arrays differ', worksWith: 'Primitive arrays, Object arrays', doesNotWorkWith: 'Collections' },
  { method: 'setAll()', syntax: 'Arrays.setAll(array, generator)', params: 'array, IntFunction', output: 'void', complexity: 'O(n)', desc: 'Sets all elements using generator', worksWith: 'Object arrays only', doesNotWorkWith: 'Primitive arrays, Collections' },
  { method: 'parallelSetAll()', syntax: 'Arrays.parallelSetAll(array, generator)', params: 'array, IntFunction', output: 'void', complexity: 'O(n)', desc: 'Sets elements using parallel generator', worksWith: 'Large Object arrays', doesNotWorkWith: 'Small arrays, Primitive arrays' }
];

// Updated headers to include the 2 new columns
const tableHeaders = ['Method', 'Syntax', 'Input / Parameters', 'Output / Return', 'Time Complexity', 'Description', 'Works With', 'Does NOT Work With'];

export default function ArraysTable() {
  return (
    <section 
      id="arrays" // ID for sidebar anchor
      className="bg-white/60 dark:bg-black/60 backdrop-blur-md 
                 border border-gray-200 dark:border-[#333] 
                 rounded-2xl overflow-hidden shadow-lg
                 hover:shadow-[0_0_25px_rgba(255,0,0,0.25)] hover:-translate-y-1 
                 transition-all duration-500 ease-in-out"
    >
      {/* Card Header */}
      <div className="p-6 md:p-8 border-b border-gray-200 dark:border-[#333]">
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 dark:text-white">
          <span className="font-mono text-red-500 mr-3">E.2</span>
          <span className="font-inter">Arrays Class (Array Operations)</span>
        </h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400 font-light">
          A utility class with static methods for manipulating arrays.
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
            {arraysData.map((row) => (
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