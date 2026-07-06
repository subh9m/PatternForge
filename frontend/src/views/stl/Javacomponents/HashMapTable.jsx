// Data for the HashMap component
const hashMapData = [
  { method: 'put()', syntax: 'map.put(key, value)', params: 'key, value', output: 'value', complexity: 'O(1) average', desc: 'Inserts or updates key-value pair' },
  { method: 'get()', syntax: 'map.get(key)', params: 'key', output: 'value', complexity: 'O(1) average', desc: 'Returns value for key' },
  { method: 'remove()', syntax: 'map.remove(key)', params: 'key', output: 'value', complexity: 'O(1) average', desc: 'Removes entry by key' },
  { method: 'containsKey()', syntax: 'map.containsKey(key)', params: 'key', output: 'boolean', complexity: 'O(1) average', desc: 'Checks if key exists' },
  { method: 'containsValue()', syntax: 'map.containsValue(value)', params: 'value', output: 'boolean', complexity: 'O(n)', desc: 'Checks if value exists' },
  { method: 'keySet()', syntax: 'map.keySet()', params: '—', output: 'Set', complexity: 'O(1)', desc: 'Returns set of all keys' },
  { method: 'values()', syntax: 'map.values()', params: '—', output: 'Collection', complexity: 'O(1)', desc: 'Returns collection of all values' },
  { method: 'entrySet()', syntax: 'map.entrySet()', params: '—', output: 'Set', complexity: 'O(1)', desc: 'Returns set of key-value pairs' },
  { method: 'size()', syntax: 'map.size()', params: '—', output: 'int', complexity: 'O(1)', desc: 'Returns number of entries' },
  { method: 'isEmpty()', syntax: 'map.isEmpty()', params: '—', output: 'boolean', complexity: 'O(1)', desc: 'Checks if map is empty' },
  { method: 'clear()', syntax: 'map.clear()', params: '—', output: 'void', complexity: 'O(n)', desc: 'Removes all entries' },
  { method: 'getOrDefault()', syntax: 'map.getOrDefault(key, def)', params: 'key, default', output: 'value', complexity: 'O(1) average', desc: 'Returns value or default' },
  { method: 'putIfAbsent()', syntax: 'map.putIfAbsent(key, value)', params: 'key, value', output: 'value', complexity: 'O(1) average', desc: 'Puts if key not present' }
];

const tableHeaders = ['Method', 'Syntax', 'Input / Parameters', 'Output / Return', 'Time Complexity', 'Description'];

export default function HashMapTable() {
  return (
    <section 
      id="hashMap" // ID for sidebar anchor
      className="bg-white/60 dark:bg-black/60 backdrop-blur-md 
                 border border-gray-200 dark:border-[#333] 
                 rounded-2xl overflow-hidden shadow-lg
                 hover:shadow-[0_0_25px_rgba(255,0,0,0.25)] hover:-translate-y-1 
                 transition-all duration-500 ease-in-out"
    >
      {/* Card Header */}
      <div className="p-6 md:p-8 border-b border-gray-200 dark:border-[#333]">
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 dark:text-white">
          <span className="font-mono text-red-500 mr-3">D.1</span>
          <span className="font-inter">HashMap (Hash-Based, Unordered)</span>
        </h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400 font-light">
          An unordered collection of unique key-value pairs, implemented using a hash table.
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
            {hashMapData.map((row) => (
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
          No ordering guaranteed. Allows one null key and multiple null values.
        </p>
      </div>
    </section>
  );
}