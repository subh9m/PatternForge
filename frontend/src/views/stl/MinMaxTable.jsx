// Data for the Min/Max component
const minMaxData = [
  { algorithm: 'max_element()', syntax: 'max_element(first, last)', params: 'iterators', output: 'iterator', complexity: 'O(n)', desc: 'Returns iterator to maximum element' },
  { algorithm: 'min_element()', syntax: 'min_element(first, last)', params: 'iterators', output: 'iterator', complexity: 'O(n)', desc: 'Returns iterator to minimum element' },
  { algorithm: 'max()', syntax: 'max(a, b)', params: 'two values', output: 'value', complexity: 'O(1)', desc: 'Returns maximum of two values' },
  { algorithm: 'min()', syntax: 'min(a, b)', params: 'two values', output: 'value', complexity: 'O(1)', desc: 'Returns minimum of two values' }
];

// Note: First header is "Algorithm"
const tableHeaders = ['Algorithm', 'Syntax', 'Input / Parameters', 'Output / Return', 'Time Complexity', 'Description'];

export default function MinMaxTable() {
  return (
    <section 
      id="minmax" // ID for sidebar anchor
      className="bg-white/60 dark:bg-black/60 backdrop-blur-md 
                 border border-gray-200 dark:border-[#333] 
                 rounded-2xl overflow-hidden shadow-lg
                 hover:shadow-[0_0_25px_rgba(255,0,0,0.25)] hover:-translate-y-1 
                 transition-all duration-500 ease-in-out"
    >
      {/* Card Header */}
      <div className="p-6 md:p-8 border-b border-gray-200 dark:border-[#333]">
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 dark:text-white">
          <span className="font-mono text-red-500 mr-3">F.2</span>
          <span className="font-inter">Min/Max & Comparison (&lt;algorithm&gt;)</span>
        </h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400 font-light">
          Algorithms for finding the minimum or maximum values.
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
            {minMaxData.map((row) => (
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