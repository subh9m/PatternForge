// Data for the Numeric Algorithms component
const numericData = [
  { algorithm: 'accumulate()', syntax: 'accumulate(first, last, init)', params: 'iterators, initial value', output: 'sum', complexity: 'O(n)', desc: 'Calculates sum of range' },
  { algorithm: 'partial_sum()', syntax: 'partial_sum(first, last, result)', params: 'iterators', output: 'void', complexity: 'O(n)', desc: 'Computes partial sums' },
  { algorithm: 'inner_product()', syntax: 'inner_product(f1, l1, f2, init)', params: 'iterators, initial value', output: 'product', complexity: 'O(n)', desc: 'Calculates dot product' },
  { algorithm: 'iota()', syntax: 'iota(first, last, val)', params: 'iterators, value', output: 'void', complexity: 'O(n)', desc: 'Fills range with incrementing values' },
  { algorithm: 'gcd()', syntax: 'gcd(a, b)', params: 'two integers', output: 'int', complexity: 'O(log(min(a,b)))', desc: 'Returns greatest common divisor' },
  { algorithm: 'lcm()', syntax: 'lcm(a, b)', params: 'two integers', output: 'int', complexity: 'O(log(min(a,b)))', desc: 'Returns least common multiple' }
];

const tableHeaders = ['Algorithm', 'Syntax', 'Input / Parameters', 'Output / Return', 'Time Complexity', 'Description'];

export default function NumericTable() {
  return (
    <section 
      id="numeric" // ID for sidebar anchor
      className="bg-white/60 dark:bg-black/60 backdrop-blur-md 
                 border border-gray-200 dark:border-[#333] 
                 rounded-2xl overflow-hidden shadow-lg
                 hover:shadow-[0_0_25px_rgba(255,0,0,0.25)] hover:-translate-y-1 
                 transition-all duration-500 ease-in-out"
    >
      {/* Card Header */}
      <div className="p-6 md:p-8 border-b border-gray-200 dark:border-[#333]">
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 dark:text-white">
          <span className="font-mono text-red-500 mr-3">F.6</span>
          <span className="font-inter">Numeric Algorithms (&lt;numeric&gt;)</span>
        </h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400 font-light">
          Algorithms for performing numeric operations on ranges.
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
            {numericData.map((row) => (
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