// Data for the Unordered Map component
const unorderedMapData = [
  { method: 'insert()', syntax: 'um.insert({k, v})', params: 'pair', output: 'pair<iterator, bool>', complexity: 'O(1) average', desc: 'Inserts key-value pair' },
  { method: 'erase()', syntax: 'um.erase(k)', params: 'key', output: 'size_t', complexity: 'O(1) average', desc: 'Removes element by key' },
  { method: 'find()', syntax: 'um.find(k)', params: 'key', output: 'iterator', complexity: 'O(1) average', desc: 'Finds element, returns iterator' },
  { method: 'count()', syntax: 'um.count(k)', params: 'key', output: 'size_t', complexity: 'O(1) average', desc: 'Returns 1 if key exists, 0 otherwise' },
  { method: 'operator[]', syntax: 'um[k]', params: 'key', output: 'value&', complexity: 'O(1) average', desc: 'Access/insert value at key' },
  { method: 'at()', syntax: 'um.at(k)', params: 'key', output: 'value&', complexity: 'O(1) average', desc: 'Access value with bounds checking' },
  { method: 'size()', syntax: 'um.size()', params: '—', output: 'size_t', complexity: 'O(1)', desc: 'Returns number of key-value pairs' },
  { method: 'empty()', syntax: 'um.empty()', params: '—', output: 'bool', complexity: 'O(1)', desc: 'Checks if unordered map is empty' },
  { method: 'clear()', syntax: 'um.clear()', params: '—', output: 'void', complexity: 'O(n)', desc: 'Removes all elements' }
];

const tableHeaders = ['Method', 'Syntax', 'Input / Parameters', 'Output / Return', 'Time Complexity', 'Description'];

export default function UnorderedMapTable() {
  return (
    <section 
      id="unordered_map" // ID for sidebar anchor
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
          <span className="font-inter">Unordered Map (Hash-Based, Unique Keys)</span>
        </h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400 font-light">
          A hash-table-based container that stores key-value pairs with unique keys.
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
            {unorderedMapData.map((row) => (
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
      
      {/* Footer Note Section */}
      <div className="p-6 bg-gray-50/70 dark:bg-neutral-950/70 border-t border-gray-200 dark:border-[#333]">
        <h4 className="font-mono text-sm font-medium text-gray-700 dark:text-gray-300">
          Note
        </h4>
        <p className="mt-2 font-mono text-xs text-gray-600 dark:text-gray-400">
          No ordering guaranteed. Worst case complexity: O(n).
        </p>
      </div>
    </section>
  );
}