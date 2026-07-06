// Data and headers are unchanged
const vectorData = [
  { method: 'push_back()', syntax: 'v.push_back(x)', params: 'element', output: 'void', complexity: 'O(1) amortized', desc: 'Adds element at end' },
  { method: 'pop_back()', syntax: 'v.pop_back()', params: '—', output: 'void', complexity: 'O(1)', desc: 'Removes last element' },
  { method: 'size()', syntax: 'v.size()', params: '—', output: 'size_t', complexity: 'O(1)', desc: 'Returns number of elements' },
  { method: 'empty()', syntax: 'v.empty()', params: '—', output: 'bool', complexity: 'O(1)', desc: 'Checks if vector is empty' },
  { method: 'clear()', syntax: 'v.clear()', params: '—', output: 'void', complexity: 'O(n)', desc: 'Removes all elements' },
  { method: 'front()', syntax: 'v.front()', params: '—', output: 'element&', complexity: 'O(1)', desc: 'Returns first element' },
  { method: 'back()', syntax: 'v.back()', params: '—', output: 'element&', complexity: 'O(1)', desc: 'Returns last element' },
  { method: 'at()', syntax: 'v.at(i)', params: 'index', output: 'element&', complexity: 'O(1)', desc: 'Access element with bounds checking' },
  { method: 'operator[]', syntax: 'v[i]', params: 'index', output: 'element&', complexity: 'O(1)', desc: 'Access element without bounds checking' },
  { method: 'insert()', syntax: 'v.insert(pos, x)', params: 'iterator, element', output: 'iterator', complexity: 'O(n)', desc: 'Inserts element at position' },
  { method: 'erase()', syntax: 'v.erase(pos)', params: 'iterator', output: 'iterator', complexity: 'O(n)', desc: 'Removes element at position' },
  { method: 'begin()', syntax: 'v.begin()', params: '—', output: 'iterator', complexity: 'O(1)', desc: 'Returns iterator to first element' },
  { method: 'end()', syntax: 'v.end()', params: '—', output: 'iterator', complexity: 'O(1)', desc: 'Returns iterator past last element' },
  { method: 'resize()', syntax: 'v.resize(n)', params: 'size', output: 'void', complexity: 'O(n)', desc: 'Changes size of vector' },
];
const tableHeaders = ['Method', 'Syntax', 'Input / Parameters', 'Output / Return', 'Time Complexity', 'Description'];

export default function VectorTable() {
  return (
    <section 
      id="vector"
      className="bg-white/60 dark:bg-black/60 backdrop-blur-md 
                 border border-gray-200 dark:border-[#333] 
                 rounded-2xl overflow-hidden shadow-lg
                 hover:shadow-[0_0_25px_rgba(255,0,0,0.25)] hover:-translate-y-1 
                 transition-all duration-500 ease-in-out"
    >
      {/* Card Header */}
      <div className="p-6 md:p-8 border-b border-gray-200 dark:border-[#333]">
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 dark:text-white">
          <span className="font-mono text-red-500 mr-3">A.1</span>
          <span className="font-inter">Vector (Dynamic Array)</span>
        </h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400 font-light">
          A sequence container that offers dynamic sizing and contiguous storage.
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
              <tr key={row.method} className="hover:bg-gray-100/50 dark:hover:bg-neutral-900/50 
                                           transition-colors duration-200">
                {/* Method */}
                <td className="px-6 py-4 font-mono font-medium text-red-600 dark:text-red-500 whitespace-nowrap">
                  {row.method}
                </td>
                {/* Syntax */}
                <td className="px-6 py-4 font-mono text-gray-700 dark:text-gray-300 whitespace-nowrap">
                  <code>{row.syntax}</code>
                </td>
                {/* Params */}
                <td className="px-6 py-4 text-gray-600 dark:text-gray-400 font-light whitespace-nowrap">
                  {row.params}
                </td>
                {/* Output */}
                <td className="px-6 py-4 font-mono text-gray-700 dark:text-gray-300 whitespace-nowrap">
                  <code>{row.output}</code>
                </td>
                {/* Complexity */}
                <td className="px-6 py-4 font-mono text-gray-700 dark:text-gray-300 whitespace-nowrap">
                  {row.complexity}
                </td>
                {/* Description */}
                <td className="px-6 py-4 text-gray-600 dark:text-gray-400 font-light">
                  {row.desc}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}