// Data for the TreeSet component
const treeSetData = [
  { method: 'add()', syntax: 'set.add(element)', params: 'element', output: 'boolean', complexity: 'O(log n)', desc: 'Adds element if not present' },
  { method: 'remove()', syntax: 'set.remove(object)', params: 'object', output: 'boolean', complexity: 'O(log n)', desc: 'Removes element' },
  { method: 'contains()', syntax: 'set.contains(object)', params: 'object', output: 'boolean', complexity: 'O(log n)', desc: 'Checks if element exists' },
  { method: 'first()', syntax: 'set.first()', params: '—', output: 'element', complexity: 'O(log n)', desc: 'Returns smallest element' },
  { method: 'last()', syntax: 'set.last()', params: '—', output: 'element', complexity: 'O(log n)', desc: 'Returns largest element' },
  { method: 'lower()', syntax: 'set.lower(element)', params: 'element', output: 'element', complexity: 'O(log n)', desc: 'Returns greatest element < given' },
  { method: 'higher()', syntax: 'set.higher(element)', params: 'element', output: 'element', complexity: 'O(log n)', desc: 'Returns smallest element > given' },
  { method: 'floor()', syntax: 'set.floor(element)', params: 'element', output: 'element', complexity: 'O(log n)', desc: 'Returns greatest element ≤ given' },
  { method: 'ceiling()', syntax: 'set.ceiling(element)', params: 'element', output: 'element', complexity: 'O(log n)', desc: 'Returns smallest element ≥ given' },
  { method: 'pollFirst()', syntax: 'set.pollFirst()', params: '—', output: 'element', complexity: 'O(log n)', desc: 'Removes and returns smallest' },
  { method: 'pollLast()', syntax: 'set.pollLast()', params: '—', output: 'element', complexity: 'O(log n)', desc: 'Removes and returns largest' },
  { method: 'size()', syntax: 'set.size()', params: '—', output: 'int', complexity: 'O(1)', desc: 'Returns number of elements' }
];

const tableHeaders = ['Method', 'Syntax', 'Input / Parameters', 'Output / Return', 'Time Complexity', 'Description'];

export default function TreeSetTable() {
  return (
    <section 
      id="treeSet" // ID for sidebar anchor
      className="bg-white/60 dark:bg-black/60 backdrop-blur-md 
                 border border-gray-200 dark:border-[#333] 
                 rounded-2xl overflow-hidden shadow-lg
                 hover:shadow-[0_0_25px_rgba(255,0,0,0.25)] hover:-translate-y-1 
                 transition-all duration-500 ease-in-out"
    >
      {/* Card Header */}
      <div className="p-6 md:p-8 border-b border-gray-200 dark:border-[#333]">
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 dark:text-white">
          <span className="font-mono text-red-500 mr-3">C.3</span>
          <span className="font-inter">TreeSet (Red-Black Tree, Sorted)</span>
        </h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400 font-light">
          A NavigableSet implementation based on a Red-Black Tree, storing elements in sorted order.
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
            {treeSetData.map((row) => (
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
          Elements stored in sorted order. No null elements allowed.
        </p>
      </div>
    </section>
  );
}