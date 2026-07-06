// Data for the TreeMap component
const treeMapData = [
  { method: 'put()', syntax: 'map.put(key, value)', params: 'key, value', output: 'value', complexity: 'O(log n)', desc: 'Inserts or updates key-value pair' },
  { method: 'get()', syntax: 'map.get(key)', params: 'key', output: 'value', complexity: 'O(log n)', desc: 'Returns value for key' },
  { method: 'remove()', syntax: 'map.remove(key)', params: 'key', output: 'value', complexity: 'O(log n)', desc: 'Removes entry by key' },
  { method: 'containsKey()', syntax: 'map.containsKey(key)', params: 'key', output: 'boolean', complexity: 'O(log n)', desc: 'Checks if key exists' },
  { method: 'firstKey()', syntax: 'map.firstKey()', params: '—', output: 'key', complexity: 'O(log n)', desc: 'Returns smallest key' },
  { method: 'lastKey()', syntax: 'map.lastKey()', params: '—', output: 'key', complexity: 'O(log n)', desc: 'Returns largest key' },
  { method: 'lowerKey()', syntax: 'map.lowerKey(key)', params: 'key', output: 'key', complexity: 'O(log n)', desc: 'Returns greatest key < given' },
  { method: 'higherKey()', syntax: 'map.higherKey(key)', params: 'key', output: 'key', complexity: 'O(log n)', desc: 'Returns smallest key > given' },
  { method: 'floorKey()', syntax: 'map.floorKey(key)', params: 'key', output: 'key', complexity: 'O(log n)', desc: 'Returns greatest key ≤ given' },
  { method: 'ceilingKey()', syntax: 'map.ceilingKey(key)', params: 'key', output: 'key', complexity: 'O(log n)', desc: 'Returns smallest key ≥ given' },
  { method: 'pollFirstEntry()', syntax: 'map.pollFirstEntry()', params: '—', output: 'Entry', complexity: 'O(log n)', desc: 'Removes and returns smallest entry' },
  { method: 'pollLastEntry()', syntax: 'map.pollLastEntry()', params: '—', output: 'Entry', complexity: 'O(log n)', desc: 'Removes and returns largest entry' },
  { method: 'size()', syntax: 'map.size()', params: '—', output: 'int', complexity: 'O(1)', desc: 'Returns number of entries' }
];

const tableHeaders = ['Method', 'Syntax', 'Input / Parameters', 'Output / Return', 'Time Complexity', 'Description'];

export default function TreeMapTable() {
  return (
    <section 
      id="treeMap" // ID for sidebar anchor
      className="bg-white/60 dark:bg-black/60 backdrop-blur-md 
                 border border-gray-200 dark:border-[#333] 
                 rounded-2xl overflow-hidden shadow-lg
                 hover:shadow-[0_0_25px_rgba(255,0,0,0.25)] hover:-translate-y-1 
                 transition-all duration-500 ease-in-out"
    >
      {/* Card Header */}
      <div className="p-6 md:p-8 border-b border-gray-200 dark:border-[#333]">
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 dark:text-white">
          <span className="font-mono text-red-500 mr-3">D.3</span>
          <span className="font-inter">TreeMap (Red-Black Tree, Sorted by Keys)</span>
        </h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400 font-light">
          A NavigableMap implementation based on a Red-Black Tree, storing entries sorted by key.
        </p>
      </div>

      {/* Responsive Table Wrapper */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1024px] text-left text-sm">
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
            {treeMapData.map((row) => (
              <tr key={row.method + (row.params || '')} className="hover:bg-gray-100/50 dark:hover:bg-neutral-900/50 
                                           transition-colors duration-200">
                <td className="px-6 py-4 font-mono font-medium text-red-600 dark:text-red-500 whitespace-nowrap">{row.method}</td>
                <td className="px-6 py-4 font-mono text-gray-700 dark:text-gray-300 whitespace-nowrap"><code>{row.syntax}</code></td>
                <td className="px-6 py-4 text-gray-600 dark:text-gray-400 font-light whitespace-nowrap">{row.params}</td>
                <td className="px-6 py-4 font-mono text-gray-700 dark:text-gray-300 whitespace-nowrap"><code>{row.output}</code></td>
                <td className="px-6 py-4 font-mono text-gray-700 dark:text-gray-300 whitespace-nowrap">{row.complexity}</td>
                <td className="px-6 py-4 text-gray-600 dark:text-gray-400 font-light">{row.desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer Note Section */}
      <div className="p-6 bg-gray-50/70 dark:bg-neutral-950/70 border-t border-gray-200 dark:border-[#333]">
        <h4 className="font-mono text-sm font-medium text-gray-700 dark:text-gray-300">
          Note
        </h4>
        <p className="mt-2 font-mono text-xs text-gray-600 dark:text-gray-400">
          Keys stored in sorted order. No null keys allowed.
        </p>
      </div>
    </section>
  );
}