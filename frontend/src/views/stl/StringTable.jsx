// Data for the String component
const stringData = [
  { method: 'length() / size()', syntax: 's.length()', params: '—', output: 'size_t', complexity: 'O(1)', desc: 'Returns length of string' },
  { method: 'push_back()', syntax: 's.push_back(c)', params: 'char', output: 'void', complexity: 'O(1) amortized', desc: 'Adds character at end' },
  { method: 'pop_back()', syntax: 's.pop_back()', params: '—', output: 'void', complexity: 'O(1)', desc: 'Removes last character' },
  { method: 'substr()', syntax: 's.substr(pos, len)', params: 'index, length', output: 'string', complexity: 'O(n)', desc: 'Returns substring' },
  { method: 'find()', syntax: 's.find(str)', params: 'substring', output: 'size_t', complexity: 'O(n*m)', desc: 'Returns index of first occurrence' },
  { method: 'at()', syntax: 's.at(i)', params: 'index', output: 'char&', complexity: 'O(1)', desc: 'Access character with bounds checking' },
  { method: 'operator[]', syntax: 's[i]', params: 'index', output: 'char&', complexity: 'O(1)', desc: 'Access character without bounds checking' },
  { method: 'append()', syntax: 's.append(str)', params: 'string', output: 'string&', complexity: 'O(m)', desc: 'Appends string to end' },
  { method: 'clear()', syntax: 's.clear()', params: '—', output: 'void', complexity: 'O(n)', desc: 'Removes all characters' },
  { method: 'empty()', syntax: 's.empty()', params: '—', output: 'bool', complexity: 'O(1)', desc: 'Checks if string is empty' },
  { method: 'insert()', syntax: 's.insert(pos, str)', params: 'index, string', output: 'string&', complexity: 'O(n)', desc: 'Inserts string at position' },
  { method: 'erase()', syntax: 's.erase(pos, len)', params: 'index, length', output: 'string', complexity: 'O(n)', desc: 'Erases portion of string' },
  { method: 'compare()', syntax: 's.compare(str)', params: 'string', output: 'int', complexity: 'O(n)', desc: 'Compares strings lexicographically' },
  { method: 'to_string()', syntax: 'to_string(num)', params: 'number', output: 'string', complexity: 'O(log n)', desc: 'Converts number to string' },
  { method: 'stoi()', syntax: 'stoi(str)', params: 'string', output: 'int', complexity: 'O(n)', desc: 'Converts string to integer' },
  { method: 'reverse()', syntax: 'reverse(s.begin(), s.end())', params: 'iterators', output: 'void', complexity: 'O(n)', desc: 'Reverses string' }
];

const tableHeaders = ['Method', 'Syntax', 'Input / Parameters', 'Output / Return', 'Time Complexity', 'Description'];

export default function StringTable() {
  return (
    <section 
      id="string" // ID for sidebar anchor
      className="bg-white/60 dark:bg-black/60 backdrop-blur-md 
                 border border-gray-200 dark:border-[#333] 
                 rounded-2xl overflow-hidden shadow-lg
                 hover:shadow-[0_0_25px_rgba(255,0,0,0.25)] hover:-translate-y-1 
                 transition-all duration-500 ease-in-out"
    >
      {/* Card Header */}
      <div className="p-6 md:p-8 border-b border-gray-200 dark:border-[#333]">
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 dark:text-white">
          <span className="font-mono text-red-500 mr-3">E.2</span>
          <span className="font-inter">String</span>
        </h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400 font-light">
          A class in C++ that represents a sequence of characters.
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
            {stringData.map((row) => (
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