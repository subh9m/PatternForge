// Data for the Unordered Multimap component
const unorderedMultimapData = [
  { method: 'insert()', syntax: 'umm.insert({k, v})', params: 'pair', output: 'iterator', complexity: 'O(1) average', desc: 'Inserts key-value pair (allows duplicates)' },
  { method: 'erase()', syntax: 'umm.erase(k)', params: 'key', output: 'size_t', complexity: 'O(k) average', desc: 'Removes all elements with key' },
  { method: 'find()', syntax: 'umm.find(k)', params: 'key', output: 'iterator', complexity: 'O(1) average', desc: 'Finds element, returns iterator' },
  { method: 'count()', syntax: 'umm.count(k)', params: 'key', output: 'size_t', complexity: 'O(k) average', desc: 'Returns number of elements with key' },
  { method: 'size()', syntax: 'umm.size()', params: '—', output: 'size_t', complexity: 'O(1)', desc: 'Returns number of elements' }
];

const tableHeaders = ['Method', 'Syntax', 'Input / Parameters', 'Output / Return', 'Time Complexity', 'Description'];

export default function UnorderedMultimapTable() {
  return (
    <section 
      id="unordered_multimap" // ID for sidebar anchor
      className="bg-white/60 dark:bg-black/60 backdrop-blur-md 
                 border border-gray-200 dark:border-[#333] 
                 rounded-2xl overflow-hidden shadow-lg
                 hover:shadow-[0_0_25px_rgba(255,0,0,0.25)] hover:-translate-y-1 
                 transition-all duration-500 ease-in-out"
    >
      {/* Card Header */}
      <div className="p-6 md:p-8 border-b border-gray-200 dark:border-[#333]">
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 dark:text-white">
          <span className="font-mono text-red-500 mr-3">D.4</span>
          <span className="font-inter">Unordered Multimap (Hash-Based, Allows Duplicate Keys)</span>
        </h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400 font-light">
          A hash-table-based container that stores key-value pairs, allowing duplicate keys.
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
            {unorderedMultimapData.map((row) => (
              <tr key={row.method} className="hover:bg-gray-100/50 dark:hover:bg-neutral-900/50 
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
    </section>
  );
}