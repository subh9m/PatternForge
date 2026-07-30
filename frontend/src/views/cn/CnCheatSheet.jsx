import React, { useState } from 'react';
import { Search, Copy, Check, Filter } from 'lucide-react';

const CN_GLOSSARY_ITEMS = [
  {
    term: "DNS (Domain Name System) - Port 53",
    category: "L7 (APP)",
    definition: "Resolves human-friendly domain names (e.g. google.com) to machine-routable IP addresses.",
    analogy: "The contact address book in your phone: instead of dialing numbers, you click the name and let the system resolve the digits.",
    oneLiner: "DNS translates hostnames to IP addresses, operating mainly over UDP port 53."
  },
  {
    term: "HTTPS (HyperText Transfer Protocol Secure) - Port 443",
    category: "L7 (APP)",
    definition: "Secure HTTP data transfer wrapped inside an SSL/TLS encrypted tunnel to protect credentials.",
    analogy: "Sending letters inside a sealed, heavy steel lockbox instead of writing on an open postcard.",
    oneLiner: "HTTPS secures web traffic by encrypting request headers and payloads on port 443."
  },
  {
    term: "TCP Three-way Handshake",
    category: "L4 (TRANSPORT)",
    definition: "A synchronization protocol (SYN -> SYN-ACK -> ACK) that establishes a reliable connection before data transfer.",
    analogy: "A telephone conversation starter: 'Hello can you hear me?' -> 'Yes I can, can you hear me?' -> 'Yes let's talk.'",
    oneLiner: "The 3-way handshake synchronizes sequence numbers to ensure reliable data channels."
  },
  {
    term: "CIDR (Classless Inter-Domain Routing)",
    category: "L3 (NETWORK)",
    definition: "A flexible IP allocation notation indicating the number of fixed network bits (e.g. /24 leaves 8 bits for host addresses).",
    analogy: "A postal zip code prefix: smaller suffixes point to huge geographic states; larger suffixes drill down to single neighborhoods.",
    oneLiner: "CIDR defines subnet sizes by explicitly setting network mask bits using slash notation."
  },
  {
    term: "NAT (Network Address Translation)",
    category: "L3 (NETWORK)",
    definition: "Translates private internal IP addresses to a single public IP to route internet traffic, saving IP spaces.",
    analogy: "A corporate receptionist: outsiders mail to a single office address, and the receptionist forwards it internally by office desk.",
    oneLiner: "NAT translates private local subnets to public IPs to slow IPv4 address exhaustion."
  },
  {
    term: "TTL (Time to Live)",
    category: "L3 (NETWORK)",
    definition: "A packet counter decremented by 1 at each router hop. When it hits 0, the packet drops to prevent loop storms.",
    analogy: "An expiration date on a coupon: it ensures the ticket doesn't circulate in the mail forever.",
    oneLiner: "TTL acts as a hop count safeguard to prevent packets from circulating endlessly in routing loops."
  },
  {
    term: "VLAN (Virtual Local Area Network)",
    category: "L2 (DATALINK)",
    definition: "Divides a physical switch network into separate logical broadcast domains, segregating departments.",
    analogy: "Dividing a single shared office space into separate cubicles: you can only talk to colleagues in your cubicle unless you use the door (router).",
    oneLiner: "VLANs isolate network broadcast domains at Layer 2 using 802.1Q tags."
  },
  {
    term: "Forward Proxy vs Reverse Proxy",
    category: "SYSTEMS",
    definition: "Forward proxy acts in front of client to hide client identity; Reverse proxy acts in front of server to load-balance/cache.",
    analogy: "Forward proxy: a lawyer signing on your behalf. Reverse proxy: a restaurant host taking orders and handing them to chefs.",
    oneLiner: "Forward proxy protects client anonymity; reverse proxy secures and distributes server traffic."
  }
];

export default function CnCheatSheet() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('ALL');
  const [copiedIndex, setCopiedIndex] = useState(null);

  const categories = ['ALL', 'L7 (APP)', 'L4 (TRANSPORT)', 'L3 (NETWORK)', 'L2 (DATALINK)', 'SYSTEMS'];

  const filtered = CN_GLOSSARY_ITEMS.filter(item => {
    const matchesSearch = item.term.toLowerCase().includes(search.toLowerCase()) || 
                          item.definition.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'ALL' || item.category === category;
    return matchesSearch && matchesCategory;
  });

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="bg-white/80 dark:bg-neutral-950/70 backdrop-blur-md border border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 rounded-2xl p-6 md:p-8 shadow-lg space-y-6">
      
      {/* Header */}
      <div className="border-b border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 pb-4">
        <h2 className="text-xl font-black text-gray-900 dark:text-white font-mono uppercase tracking-wide">
          📋 Networking Protocols Cheat Sheet
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 font-light leading-relaxed">
          Quick-lookup reference for SDE socket configurations, ports, RFC terms, and diagnostics.
        </p>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search ports or protocols..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-white/80 dark:bg-neutral-950/40 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 rounded-xl font-mono text-neutral-800 dark:text-neutral-300 focus:outline-none focus:border-cyan-500 transition-all"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <Filter className="h-3.5 w-3.5 text-gray-400 flex-shrink-0 mr-1" />
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1 text-[10px] font-mono font-bold rounded-lg border transition-all cursor-pointer
                ${category === cat 
                  ? 'bg-cyan-500/10 text-cyan-500 border-cyan-500/30' 
                  : 'bg-transparent text-gray-555 dark:text-gray-450 border-neutral-200 dark:border-neutral-800 dark:border-neutral-900 hover:border-cyan-500/20'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.length > 0 ? (
          filtered.map((item, idx) => (
            <div 
              key={idx}
              className="p-5 border border-neutral-200 dark:border-neutral-800 dark:border-neutral-900 bg-white/40 dark:bg-neutral-950/20 hover:border-cyan-500/30 rounded-xl flex flex-col justify-between space-y-4 hover:shadow-md transition-all group relative"
            >
              {/* Top Row */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 bg-cyan-500/10 text-cyan-500 text-[8px] font-mono font-black uppercase rounded">
                    {item.category}
                  </span>
                  <button
                    onClick={() => handleCopy(`${item.term}: ${item.definition}`, idx)}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-neutral-900 rounded text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-all opacity-0 group-hover:opacity-100 absolute right-3 top-3"
                    title="Copy definition"
                  >
                    {copiedIndex === idx ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
                <h3 className="text-sm font-black text-neutral-800 dark:text-neutral-200 font-mono">
                  {item.term}
                </h3>
              </div>

              {/* Definition */}
              <p className="text-[14px] md:text-[15px] text-gray-700 dark:text-neutral-250 font-normal leading-relaxed">
                {item.definition}
              </p>

              {/* Analogy Box */}
              <div className="p-4 bg-neutral-100/60 dark:bg-neutral-900/30 border-l-2 border-slate-400 dark:border-neutral-700 rounded-r-lg">
                <span className="block text-[9.5px] font-mono text-slate-400 dark:text-neutral-500 uppercase tracking-widest font-black mb-1">💡 SDE Analogy</span>
                <p className="text-[13px] md:text-[14px] italic text-gray-550 dark:text-gray-405 leading-relaxed font-sans">
                  {item.analogy}
                </p>
              </div>

              {/* Speak-ready summary */}
              <div className="space-y-0.5">
                <span className="block text-[9.5px] font-mono text-cyan-400/80 uppercase tracking-widest font-black">🗣️ Speak-ready Answer</span>
                <p className="text-[13px] md:text-[14px] font-mono font-bold text-cyan-500/90 leading-relaxed">
                  {item.oneLiner}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-2 flex flex-col items-center justify-center py-10 border border-dashed border-neutral-200 dark:border-neutral-800 dark:border-neutral-800 rounded-xl text-center text-gray-450">
            <span className="text-2xl">🔎</span>
            <span className="text-xs font-mono mt-2">No matching glossary items found.</span>
          </div>
        )}
      </div>

    </div>
  );
}
