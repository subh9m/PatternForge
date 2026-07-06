// Data for the Modifying Operations component
const modifyingData = [
  { algorithm: 'reverse()', syntax: 'reverse(first, last)', params: 'iterators', output: 'void', complexity: 'O(n)', desc: 'Reverses elements in range' },
  { algorithm: 'rotate()', syntax: 'rotate(first, middle, last)', params: 'iterators', output: 'void', complexity: 'O(n)', desc: 'Rotates elements in range' },
  { algorithm: 'swap()', syntax: 'swap(a, b)', params: 'two variables', output: 'void', complexity: 'O(1)', desc: 'Swaps two values' },
  { algorithm: 'fill()', syntax: 'fill(first, last, val)', params: 'iterators, value', output: 'void', complexity: 'O(n)', desc: 'Fills range with value' },
  { algorithm: 'replace()', syntax: 'replace(first, last, old, new)', params: 'iterators, values', output: 'void', complexity: 'O(n)', desc: 'Replaces old value with new value' },
  { algorithm: 'remove()', syntax: 'remove(first, last, val)', params: 'iterators, value', output: 'iterator', complexity: 'O(n)', desc: 'Moves elements ≠ val to front' },
  { algorithm: 'unique()', syntax: 'unique(first, last)', params: 'iterators', output: 'iterator', complexity: 'O(n)', desc: 'Removes consecutive duplicates' }
];

const tableHeaders = ['Algorithm', 'Syntax', 'Input / Parameters', 'Output / Return', 'Time Complexity', 'Description'];

export default function ModifyingTable() {
  return (
    <section 
      id="modifying" // ID for sidebar anchor
      className="bg-white/60 dark:bg-black/60 backdrop-blur-md 
                 border border-gray-200 dark:border-[#333] 
                 rounded-2xl overflow-hidden shadow-lg
                 hover:shadow-[0_0_25px_rgba(255,0,0,0.25)] hover:-translate-y-1 
                 transition-all duration-500 ease-in-out"
    >
      {/* Card Header */}
      <div className="p-6 md:p-8 border-b border-gray-200 dark:border-[#333]">
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 dark:text-white">
          <span className="font-mono text-red-500 mr-3">F.3</span>
          <span className="font-inter">Modifying Operations (&lt;algorithm&gt;)</span>
        </h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400 font-light">
          Algorithms that modify the order or content of elements in a range.
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
            {modifyingData.map((row) => (
              <tr key={row.algorithm} className="hover:bg-gray-100/50 dark:hover:bg-neutral-900/50 
                                           transition-colors duration-200">
                <td className="px-6 py-4 font-mono font-medium text-red-600 dark:text-red-500 whitespace-nowrap">{row.algorithm}</td>
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