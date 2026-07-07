import React, { useState, useEffect } from 'react';
import { Play, RotateCcw, Globe, Network, Plus, Minus } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CnPlayground() {
  const [activePlayground, setActivePlayground] = useState('handshake'); // 'handshake' or 'subnet'

  // --- TCP HANDSHAKE STATE ---
  const [handshakeStep, setHandshakeStep] = useState(0); // 0: Idle, 1: SYN, 2: SYN-ACK, 3: ACK (Established)
  const [clientSeq, setClientSeq] = useState(100);
  const [serverSeq, setServerSeq] = useState(500);
  const [isHandshakeRunning, setIsHandshakeRunning] = useState(false);
  const [handshakeLogs, setHandshakeLogs] = useState([]);
  const [clientSocketState, setClientSocketState] = useState('CLOSED');
  const [serverSocketState, setServerSocketState] = useState('LISTEN');

  const startHandshake = () => {
    if (isHandshakeRunning) return;
    setIsHandshakeRunning(true);
    setHandshakeStep(1);
    setClientSocketState('SYN_SENT');
    const cSeq = Math.floor(Math.random() * 800) + 100;
    setClientSeq(cSeq);
    setHandshakeLogs([
      `[Client] Initiating TCP connection...`,
      `[Client ──► Server] SYN Packet Sent. Seq: ${cSeq}, ACK: 0`
    ]);

    // Step 2: Server receives SYN, sends SYN-ACK
    setTimeout(() => {
      setHandshakeStep(2);
      setServerSocketState('SYN_RCVD');
      const sSeq = Math.floor(Math.random() * 800) + 500;
      setServerSeq(sSeq);
      setHandshakeLogs(prev => [
        ...prev,
        `[Server] Received SYN. Synchronizing sockets...`,
        `[Server ──► Client] SYN-ACK Packet Sent. Seq: ${sSeq}, ACK: ${cSeq + 1}`
      ]);

      // Step 3: Client receives SYN-ACK, sends ACK
      setTimeout(() => {
        setHandshakeStep(3);
        setClientSocketState('ESTABLISHED');
        setHandshakeLogs(prev => [
          ...prev,
          `[Client] Received SYN-ACK. Confirming channel parameters...`,
          `[Client ──► Server] ACK Packet Sent. Seq: ${cSeq + 1}, ACK: ${sSeq + 1}`
        ]);

        // Step 4: Server receives ACK, connection established
        setTimeout(() => {
          setHandshakeStep(4);
          setServerSocketState('ESTABLISHED');
          setHandshakeLogs(prev => [
            ...prev,
            `[Server] Received ACK. Handshake complete.`,
            `🟢 TCP Connection established between Client and Server (Full-Duplex channel open).`
          ]);
          setIsHandshakeRunning(false);
        }, 1200);

      }, 1200);

    }, 1200);
  };

  const resetHandshake = () => {
    setHandshakeStep(0);
    setClientSocketState('CLOSED');
    setServerSocketState('LISTEN');
    setHandshakeLogs(['TCP sockets reset. Ready to initialize.']);
    setIsHandshakeRunning(false);
  };

  // --- SUBNET & CIDR CALCULATOR ---
  const [baseIp, setBaseIp] = useState('192.168.1.0');
  const [cidr, setCidr] = useState(24); // /24 to /30
  const [subnetDetails, setSubnetDetails] = useState(null);

  useEffect(() => {
    const calculateSubnets = () => {
      // Basic CIDR calculations
      const totalIps = Math.pow(2, 32 - cidr);
      const usableHosts = Math.max(0, totalIps - 2);
      
      // Subnet masks mapping
      const masks = {
        24: '255.255.255.0',
        25: '255.255.255.128',
        26: '255.255.255.192',
        27: '255.255.255.224',
        28: '255.255.255.240',
        29: '255.255.255.248',
        30: '255.255.255.252'
      };

      const mask = masks[cidr] || '255.255.255.0';

      // Parse base IP
      const parts = baseIp.split('.').map(p => parseInt(p) || 0);
      const networkPart = `${parts[0]}.${parts[1]}.${parts[2]}`;
      
      // Generate split ranges
      const rangeStart = 1;
      const rangeEnd = totalIps - 2;
      const broadcastVal = totalIps - 1;

      setSubnetDetails({
        subnetMask: mask,
        networkAddress: `${networkPart}.0`,
        broadcastAddress: `${networkPart}.${broadcastVal}`,
        usableRange: `${networkPart}.${rangeStart} - ${networkPart}.${rangeEnd}`,
        hostCapacity: usableHosts,
        totalAddresses: totalIps
      });
    };

    calculateSubnets();
  }, [baseIp, cidr]);

  return (
    <div className="space-y-6">
      
      {/* Selector Tabs */}
      <div className="flex border-b border-gray-250 dark:border-neutral-900 pb-3 gap-3">
        <button
          onClick={() => setActivePlayground('handshake')}
          className={`px-4 py-2 text-xs font-mono font-black uppercase rounded-lg border transition-all cursor-pointer flex items-center space-x-2
            ${activePlayground === 'handshake' 
              ? 'bg-cyan-500/10 text-cyan-500 border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.15)]' 
              : 'bg-transparent text-gray-550 dark:text-gray-450 border-gray-200 dark:border-neutral-900 hover:border-cyan-500/20'}`}
        >
          <Network className="h-4 w-4" />
          <span>TCP Handshake Simulator</span>
        </button>
        <button
          onClick={() => setActivePlayground('subnet')}
          className={`px-4 py-2 text-xs font-mono font-black uppercase rounded-lg border transition-all cursor-pointer flex items-center space-x-2
            ${activePlayground === 'subnet' 
              ? 'bg-cyan-500/10 text-cyan-500 border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.15)]' 
              : 'bg-transparent text-gray-550 dark:text-gray-450 border-gray-200 dark:border-neutral-900 hover:border-cyan-500/20'}`}
        >
          <Globe className="h-4 w-4" />
          <span>CIDR & Subnet Calculator</span>
        </button>
      </div>

      {activePlayground === 'handshake' ? (
        // HANDSHAKE SIMULATOR
        <div className="bg-white/60 dark:bg-black/60 backdrop-blur-md border border-gray-250 dark:border-[#333] rounded-2xl p-6 md:p-8 shadow-lg space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-250 dark:border-neutral-800 pb-4">
            <div>
              <h2 className="text-lg font-black text-gray-900 dark:text-white font-mono uppercase tracking-wide">
                <span>⚡ TCP Connection Handshake Simulator</span>
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-light leading-relaxed">
                Step through sequence and acknowledgment synchronization loops to build reliable socket connections.
              </p>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={resetHandshake}
                className="flex items-center space-x-2 px-3 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/25 text-cyan-500 border border-cyan-500/20 rounded-lg text-xs font-mono font-black cursor-pointer transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset</span>
              </button>
              <button
                onClick={startHandshake}
                disabled={isHandshakeRunning || handshakeStep === 4}
                className="flex items-center space-x-2 px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-mono font-black cursor-pointer transition-colors shadow-lg hover:shadow-cyan-500/20 disabled:bg-gray-405"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>{isHandshakeRunning ? 'Syncing...' : 'Initiate Connect'}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            
            {/* Left Side Client Node */}
            <div className="lg:col-span-1 border border-gray-200 dark:border-neutral-900 bg-neutral-950/60 rounded-xl p-4 text-center space-y-3">
              <span className="px-2 py-0.5 bg-cyan-500/10 text-cyan-500 text-[8px] font-mono font-black uppercase rounded">Client Endpoint</span>
              <div className="h-16 w-16 bg-cyan-500/5 border border-cyan-500/20 rounded-full flex items-center justify-center text-cyan-500 mx-auto">
                <Globe className="h-7 w-7 animate-pulse" />
              </div>
              <div className="font-mono text-xs space-y-1">
                <div className="text-[10px] text-gray-500">SOCKET STATE</div>
                <div className="text-white font-bold">{clientSocketState}</div>
              </div>
            </div>

            {/* Animation Pathway */}
            <div className="lg:col-span-2 border border-gray-250 dark:border-neutral-900 bg-neutral-950/60 rounded-xl p-5 min-h-[160px] flex flex-col justify-center relative overflow-hidden">
              <div className="h-0.5 w-full bg-neutral-800 absolute top-1/2 left-0 transform -translate-y-1/2"></div>
              
              {/* SYN Packet animation */}
              {handshakeStep === 1 && (
                <motion.div
                  className="px-2.5 py-1 bg-cyan-500 text-white text-[9px] font-mono font-black rounded shadow-lg absolute"
                  initial={{ left: "10%" }}
                  animate={{ left: "75%" }}
                  transition={{ duration: 1.1, ease: "linear" }}
                >
                  SYN (Seq: {clientSeq})
                </motion.div>
              )}

              {/* SYN-ACK Packet animation */}
              {handshakeStep === 2 && (
                <motion.div
                  className="px-2.5 py-1 bg-purple-500 text-white text-[9px] font-mono font-black rounded shadow-lg absolute"
                  initial={{ right: "10%" }}
                  animate={{ right: "75%" }}
                  transition={{ duration: 1.1, ease: "linear" }}
                >
                  SYN-ACK (Seq: {serverSeq}, ACK: {clientSeq + 1})
                </motion.div>
              )}

              {/* ACK Packet animation */}
              {handshakeStep === 3 && (
                <motion.div
                  className="px-2.5 py-1 bg-emerald-500 text-white text-[9px] font-mono font-black rounded shadow-lg absolute"
                  initial={{ left: "10%" }}
                  animate={{ left: "75%" }}
                  transition={{ duration: 1.1, ease: "linear" }}
                >
                  ACK (Seq: {clientSeq + 1}, ACK: {serverSeq + 1})
                </motion.div>
              )}

              <div className="text-center font-mono text-[10px] text-gray-500 z-10 pt-16">
                Packet Transmission Line (TCP Stream)
              </div>
            </div>

            {/* Right Side Server Node */}
            <div className="lg:col-span-1 border border-gray-200 dark:border-neutral-900 bg-neutral-950/60 rounded-xl p-4 text-center space-y-3">
              <span className="px-2 py-0.5 bg-cyan-500/10 text-cyan-500 text-[8px] font-mono font-black uppercase rounded">Server Endpoint</span>
              <div className="h-16 w-16 bg-cyan-500/5 border border-cyan-500/20 rounded-full flex items-center justify-center text-cyan-500 mx-auto">
                <Network className="h-7 w-7" />
              </div>
              <div className="font-mono text-xs space-y-1">
                <div className="text-[10px] text-gray-500">SOCKET STATE</div>
                <div className="text-white font-bold">{serverSocketState}</div>
              </div>
            </div>

          </div>

          {/* Dialogue Log Terminal */}
          <div className="bg-black border border-neutral-900 rounded-xl p-4 font-mono text-xs text-cyan-400 space-y-1 max-h-40 overflow-y-auto">
            <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest font-mono block border-b border-neutral-900 pb-1 mb-2">Diagnostic Packet Trace logs</span>
            {handshakeLogs.length > 0 ? (
              handshakeLogs.map((log, idx) => (
                <div key={idx}>$ {log}</div>
              ))
            ) : (
              <div className="text-gray-600">Waiting for connection handshake request...</div>
            )}
          </div>

        </div>
      ) : (
        // CIDR CALCULATOR
        <div className="bg-white/60 dark:bg-black/60 backdrop-blur-md border border-gray-250 dark:border-[#333] rounded-2xl p-6 md:p-8 shadow-lg space-y-6">
          <div className="border-b border-gray-250 dark:border-neutral-800 pb-4">
            <h2 className="text-lg font-black text-gray-900 dark:text-white font-mono uppercase tracking-wide">
              <span>⚡ Classless Inter-Domain Routing (CIDR) Calculator</span>
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-light leading-relaxed">
              Input a network prefix and change host bit masks to dynamically divide subnets.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Input Config Panel */}
            <div className="bg-gray-55/10 dark:bg-neutral-900/30 border border-gray-200 dark:border-[#333] rounded-xl p-4 space-y-4">
              <span className="text-[10px] font-black text-slate-450 uppercase tracking-widest font-mono block border-b border-neutral-800 pb-1.5 font-bold">Subnet Inputs</span>
              
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5 font-mono">Base Network IP:</label>
                <input
                  type="text"
                  value={baseIp}
                  onChange={(e) => setBaseIp(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-neutral-950 border border-neutral-900 rounded-lg font-mono text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5 font-mono">CIDR Mask Suffix:</label>
                <div className="flex items-center space-x-3">
                  <button 
                    onClick={() => cidr > 24 && setCidr(prev => prev - 1)}
                    className="p-1.5 border border-gray-200 dark:border-neutral-800 rounded hover:border-cyan-500 cursor-pointer"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="font-mono text-xs font-black text-gray-800 dark:text-gray-250">/{cidr}</span>
                  <button 
                    onClick={() => cidr < 30 && setCidr(prev => prev + 1)}
                    className="p-1.5 border border-gray-200 dark:border-neutral-800 rounded hover:border-cyan-500 cursor-pointer"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>

            {/* Calculations Output */}
            {subnetDetails && (
              <div className="md:col-span-2 border border-gray-200 dark:border-neutral-900 bg-neutral-950/60 rounded-xl p-5 space-y-4">
                <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest font-mono block border-b border-neutral-900 pb-1.5">Calculated Address Boundaries</span>
                
                <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                  <div className="p-3 border border-neutral-900 bg-neutral-950 rounded-lg">
                    <span className="text-[10px] text-gray-500 block">SUBNET MASK</span>
                    <strong className="text-white">{subnetDetails.subnetMask}</strong>
                  </div>

                  <div className="p-3 border border-neutral-900 bg-neutral-950 rounded-lg">
                    <span className="text-[10px] text-gray-500 block">HOST CAPACITY</span>
                    <strong className="text-cyan-400">{subnetDetails.hostCapacity} usable IPs</strong>
                  </div>

                  <div className="p-3 border border-neutral-900 bg-neutral-950 rounded-lg">
                    <span className="text-[10px] text-gray-500 block">NETWORK ID IP</span>
                    <strong className="text-white">{subnetDetails.networkAddress}</strong>
                  </div>

                  <div className="p-3 border border-neutral-900 bg-neutral-950 rounded-lg">
                    <span className="text-[10px] text-gray-500 block">BROADCAST IP</span>
                    <strong className="text-white">{subnetDetails.broadcastAddress}</strong>
                  </div>
                </div>

                <div className="p-3 border border-neutral-900 bg-neutral-950 rounded-lg text-xs font-mono text-center">
                  <span className="text-[10px] text-gray-500 block">USABLE HOST RANGE</span>
                  <strong className="text-emerald-400 text-sm">{subnetDetails.usableRange}</strong>
                </div>
              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
}
