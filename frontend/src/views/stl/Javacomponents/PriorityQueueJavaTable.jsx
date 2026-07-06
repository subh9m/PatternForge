// Data for the PriorityQueue component
const priorityQueueData = [
  { method: 'add()', syntax: 'pq.add(element)', params: 'element', output: 'boolean', complexity: 'O(log n)', desc: 'Adds element to queue' },
  { method: 'offer()', syntax: 'pq.offer(element)', params: 'element', output: 'boolean', complexity: 'O(log n)', desc: 'Adds element to queue' },
  { method: 'remove()', syntax: 'pq.remove()', params: '—', output: 'element', complexity: 'O(log n)', desc: 'Removes and returns min element' },
  { method: 'poll()', syntax: 'pq.poll()', params: '—', output: 'element', complexity: 'O(log n)', desc: 'Removes and returns min, null if empty' },
  { method: 'peek()', syntax: 'pq.peek()', params: '—', output: 'element', complexity: 'O(1)', desc: 'Returns min element without removing' },
  { method: 'size()', syntax: 'pq.size()', params: '—', output: 'int', complexity: 'O(1)', desc: 'Returns number of elements' },
  { method: 'clear()', syntax: 'pq.clear()', params: '—', output: 'void', complexity: 'O(n)', desc: 'Removes all elements' }
];

const tableHeaders = ['Method', 'Syntax', 'Input / Parameters', 'Output / Return', 'Time Complexity', 'Description'];

export default function PriorityQueueJavaTable() {
  return (
    <section 
      id="priorityQueue-java" // ID for sidebar anchor
      className="bg-white/60 dark:bg-black/60 backdrop-blur-md 
                 border border-gray-200 dark:border-[#333] 
                 rounded-2xl overflow-hidden shadow-lg
                 hover:shadow-[0_0_25px_rgba(255,0,0,0.25)] hover:-translate-y-1 
                 transition-all duration-500 ease-in-out"
    >
      {/* Card Header */}
      <div className="p-6 md:p-8 border-b border-gray-200 dark:border-[#333]">
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 dark:text-white">
          <span className="font-mono text-red-500 mr-3">B.3</span>
          <span className="font-inter">PriorityQueue (Min-Heap by Default)</span>
        </h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400 font-light">
          An unbounded priority queue based on a priority heap (min-heap by default).
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
            {priorityQueueData.map((row) => (
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
          Note: Max-Heap Declaration
        </h4>
        <p className="mt-2 font-mono text-xs text-red-600 dark:text-red-500 bg-gray-100 dark:bg-black p-3 rounded-md">
          <code>new PriorityQueue&lt;&gt;(Collections.reverseOrder())</code>
        </p>
      </div>
    </section>
  );
}