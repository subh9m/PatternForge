// Data for the Vector component
const vectorData = [
  { method: 'add()', syntax: 'vector.add(element)', params: 'element', output: 'boolean', complexity: 'O(1) amortized', desc: 'Adds element at end' },
  { method: 'get()', syntax: 'vector.get(index)', params: 'index', output: 'element', complexity: 'O(1)', desc: 'Returns element at index' },
  { method: 'set()', syntax: 'vector.set(index, element)', params: 'index, element', output: 'element', complexity: 'O(1)', desc: 'Replaces element at index' },
  { method: 'remove()', syntax: 'vector.remove(index)', params: 'index', output: 'element', complexity: 'O(n)', desc: 'Removes element at index' },
  { method: 'size()', syntax: 'vector.size()', params: '—', output: 'int', complexity: 'O(1)', desc: 'Returns number of elements' },
  { method: 'capacity()', syntax: 'vector.capacity()', params: '—', output: 'int', complexity: 'O(1)', desc: 'Returns current capacity' }, // <-- THIS LINE IS FIXED
  { method: 'clear()', syntax: 'vector.clear()', params: '—', output: 'void', complexity: 'O(n)', desc: 'Removes all elements' }
];

const tableHeaders = ['Method', 'Syntax', 'Input / Parameters', 'Output / Return', 'Time Complexity', 'Description'];

export default function VectorJavaTable() {
  return (
    <section 
      id="vector-java" // ID for sidebar anchor
      className="bg-white/60 dark:bg-black/60 backdrop-blur-md 
                 border border-gray-200 dark:border-[#333] 
                 rounded-2xl overflow-hidden shadow-lg
                 hover:shadow-[0_0_25px_rgba(255,0,0,0.25)] hover:-translate-y-1 
                 transition-all duration-500 ease-in-out"
    >
      {/* Card Header */}
      <div className="p-6 md:p-8 border-b border-gray-200 dark:border-[#333]">
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 dark:text-white">
          <span className="font-mono text-red-500 mr-3">A.3</span>
          <span className="font-inter">Vector (Synchronized Dynamic Array)</span>
        </h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400 font-light">
          A thread-safe, synchronized implementation of the List interface.
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
            {vectorData.map((row) => (
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
          Vector is synchronized (thread-safe) but slower than ArrayList.
        </p>
      </div>
    </section>
  );
}