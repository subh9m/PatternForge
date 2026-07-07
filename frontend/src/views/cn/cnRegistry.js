export const cnConcepts = [
  {
    id: "cn_fundamentals",
    num: "CN.1",
    title: "Networking Fundamentals & Topologies",
    desc: "The basic components and physical blueprints of data exchange. Covers network performance metrics (throughput, latency components, jitter), geographic scopes, unicast/multicast/broadcast schemes, and physical/logical network topologies.",
    declaration: `// Network Performance & Topology Config
const fundamentals = {
  criteria: ["Performance", "Reliability", "Security"], // PRS
  latencyComponents: ["Transmission", "Propagation", "Queuing", "Processing"],
  scopes: ["PAN (~1m)", "LAN (Building)", "MAN (City)", "WAN (Global)"],
  topologies: {
    meshLinks: (n) => (n * (n - 1)) / 2,
    meshPorts: (n) => n - 1
  }
};`,
    internalImplementation: `/* ----------------- PERFORMANCE METRICS & TOPOLOGIES -----------------
   Latency = (L / B) + (d / v) + Queuing + Processing
   Unicast   : [1 -> 1]  (Client ──► Server)
   Multicast : [1 -> N]  (Client ──► Subnet Group)
   Broadcast : [1 -> All](Client ──► LAN Broadcast ID)

   Full Mesh (n=4):  [A]───[B] (Links = 4 * 3 / 2 = 6)
                      │╲   /│
                      │  ╳  │
                      │/   ╲│
                     [D]───[C]
*/`,
    subtopics: [
      {
        name: "Core Terminology & Metrics",
        oneLiner: "A network is an interconnected group of nodes sharing data over communication links, judged by PRS (Performance, Reliability, Security).",
        definition: "A network consists of hosts (nodes) connected by transmission links. Key parameters include Bandwidth (theoretical capacity, bps), Throughput (actual speed, bps), Latency (total time delay), and Jitter (packet arrival time variations).",
        whyNeed: "Critical for designing SLAs. Bandwidth is the highway's width, throughput is the actual number of cars passing, and jitter affects real-time services like video streaming and VoIP.",
        example: "A fiber link with 10 Gbps bandwidth delivering 8.5 Gbps throughput during peak office hours with < 5ms jitter.",
        devPerspective: "SDEs optimize network calls: compress payloads to reduce transmission delay, locate servers near users (CDN) to drop propagation delay, and choose UDP over TCP for VoIP to tolerate jitter.",
        questions: [
          "Differentiate between bandwidth, throughput, and latency.",
          "What are the three essential criteria for a good network?",
          "Explain the difference between point-to-point and multipoint configurations."
        ],
        followups: [
          "What is Jitter, and why is it problematic for real-time traffic?",
          "Why is throughput almost always less than or equal to the link bandwidth?"
        ],
        confusions: [
          "Bandwidth vs Latency: Having a 1 Gbps connection does not speed up propagation latency; it only increases the volume of packets pushed per second."
        ],
        takeaways: [
          "PRS: Performance, Reliability, Security.",
          "Throughput ≤ Bandwidth.",
          "Jitter is the standard deviation/variation of packet latency."
        ]
      },
      {
        name: "Latency Components & Formulas",
        oneLiner: "Total Latency = Transmission + Propagation + Queuing + Processing delay.",
        definition: "Transmission Delay (L/B) is the time to push all packet bits onto the wire. Propagation Delay (d/v) is the time for a bit to travel the physical distance. Queuing delay is buffer wait time, and Processing delay is router header parsing time.",
        whyNeed: "Allows engineers to target the bottleneck: long-distance links are dominated by propagation delay (speed of light), while saturated routers are dominated by queuing delay.",
        example: "Satellite networks have low transmission delay (high bandwidth) but high propagation delay due to orbital distance (~36,000 km).",
        devPerspective: "When deploying globally, database replication times are restricted by propagation delay (approx 1ms per 100 miles over fiber).",
        questions: [
          "Explain the four types of delays in a computer network.",
          "What is the mathematical formula for Transmission Delay? How does it differ from Propagation Delay?",
          "What factors cause queuing delay in switch buffers?"
        ],
        followups: [
          "Calculate transmission delay for a 1 KB packet over a 1 Mbps link. [1024 bytes * 8 / 1,000,000 bps = 8.19 ms]",
          "How does the medium's propagation velocity affect overall latency?"
        ],
        confusions: [
          "Propagation vs Transmission: Transmission depends on bandwidth and packet size; propagation depends on distance and the physical speed of the medium."
        ],
        takeaways: [
          "Transmission = L / B (Packet length / Bandwidth).",
          "Propagation = d / v (Distance / Signal velocity).",
          "Queuing is variable; processing is usually fixed and small."
        ]
      },
      {
        name: "Network Types & Transmission Modes",
        oneLiner: "Networks range from PAN (~1m) to WAN (Global). Modes range from Simplex to Full-Duplex.",
        definition: "Networks are grouped by geographic span: PAN (Personal Area Network, Bluetooth), LAN (Local Area Network), MAN (Metropolitan Area Network), and WAN (Wide Area Network). Transmission is Simplex (one-way), Half-Duplex (two-way, alternating), or Full-Duplex (simultaneous two-way).",
        whyNeed: "Geographic scale dictates routing protocols, medium limits, and costs. Duplex modes determine collision potential on media.",
        example: "A home Wi-Fi is a LAN operating in half-duplex, while a fiber link between data centers is a WAN operating in full-duplex.",
        devPerspective: "WebSockets enable full-duplex communication over a single TCP connection, replacing half-duplex HTTP polling loops.",
        questions: [
          "Classify networks based on their geographical distribution.",
          "Differentiate between Simplex, Half-Duplex, and Full-Duplex transmission with examples.",
          "Explain Unicast, Multicast, and Broadcast modes."
        ],
        followups: [
          "Is a walkie-talkie half-duplex or full-duplex? Why? [Half-duplex; cannot transmit and receive on the same frequency at the exact same time]",
          "What is PAN and how does it relate to wearable tech?"
        ],
        confusions: [
          "APIPA address range: If a client fails to reach a DHCP server, it auto-assigns an address from the 169.254.0.0/16 private subnet."
        ],
        takeaways: [
          "Simplex is one-way only.",
          "Half-duplex is both ways, but not at the same time.",
          "Full-duplex is simultaneous two-way communication."
        ]
      },
      {
        name: "Network Topologies & Comparison",
        oneLiner: "Topologies map nodes physically or logically; star is modern standard, mesh is fully redundant.",
        definition: "Arrangement of links and nodes: Bus (single backbone with terminators, uses CSMA/CD), Star (central hub/switch), Ring (token-passing, no collisions), Mesh (fully interconnected), and Tree/Hybrid (hierarchical systems).",
        whyNeed: "Determines cabling cost, installation complexity, and fault tolerance. In a star network, a node drop doesn't affect others, making it highly serviceable.",
        example: "Modern offices use Star topology connected to switches. The global internet backbone runs a partial mesh for redundancy.",
        devPerspective: "Cloud architects deploy VPC subnets in redundant layouts, treating availability zones as logical Star setups mapping to a Mesh backbone.",
        questions: [
          "Compare Star, Bus, Ring, and Mesh topologies.",
          "Write the formula for the number of links in a fully connected mesh network of N nodes.",
          "What are the pros and cons of Mesh topology?"
        ],
        followups: [
          "If a full mesh network has 6 nodes, how many physical cables are required? [6 * 5 / 2 = 15 cables]",
          "Explain Tree topology and when it is deployed."
        ],
        confusions: [
          "Hub vs Switch topology: A hub-based network is physically a Star but logically a Bus because all signals are broadcast to all ports."
        ],
        takeaways: [
          "Mesh links = N * (N - 1) / 2.",
          "Bus topology relies on terminators to prevent signal reflection.",
          "Star topology has a single central point of failure (switch)."
        ]
      }
    ]
  },
  {
    id: "osi_tcpip",
    num: "CN.2",
    title: "Reference Models & Network Layers",
    desc: "The structural architecture of communication. Compares the 7 layers of the OSI model with the 4 layers of the TCP/IP model, detailing headers, encapsulation workflows, and protocol data units (PDUs).",
    declaration: `// OSI vs TCP/IP Mapping
const layersMap = {
  osiMnemonics: {
    topDown: "All People Seem To Need Data Processing",
    bottomUp: "Please Do Not Throw Sausage Pizza Away"
  },
  pdus: ["Bit (L1)", "Frame (L2)", "Packet (L3)", "Segment/Datagram (L4)", "Data (L5-7)"]
};`,
    internalImplementation: `/* ----------------- ENCAPSULATION PROCESS -----------------
   [Application] Data  (HTTP, DNS, SMTP)
   [Transport]   Segment = [TCP Header] + Data
   [Network]     Packet  = [IP Header] + Segment
   [Data Link]   Frame   = [MAC Header] + Packet + [Trailer (CRC)]
   [Physical]    Bits    = 01011001 on transmission medium
*/`,
    subtopics: [
      {
        name: "OSI 7-Layer Architecture",
        oneLiner: "OSI is a 7-layer theoretical reference framework standardizing open network communications.",
        definition: "Divided into 7 layers: Physical (bits/repeater), Data Link (frames/switch), Network (packets/router), Transport (segments/end-to-end), Session (synchronization), Presentation (encryption/compression), and Application (user interface).",
        whyNeed: "Provides modularity. A hardware manufacturer can build a network interface card (L1/L2) without needing to understand web browser software (L7).",
        example: "A secure website transaction passes from L7 (browser) through L6 (TLS encryption) down to L1 (Ethernet fiber transceiver).",
        devPerspective: "SDEs use layer separation for debugging: a connection timeout is a L3/L4 issue; a syntax parsing failure or TLS handshake failure is a L5/L6 issue.",
        questions: [
          "List the 7 layers of the OSI model in order (bottom-up and top-down).",
          "What is the PDU (Protocol Data Unit) at each of the 7 OSI layers?",
          "Explain the roles of the Presentation and Session layers."
        ],
        followups: [
          "State the mnemonic to remember the OSI layers.",
          "Which layer is responsible for translating, encrypting, and compressing data? [Presentation Layer]"
        ],
        confusions: [
          "Reference vs Protocol: OSI is a reference model; no operating system implements it literally. Operating systems implement the TCP/IP model."
        ],
        takeaways: [
          "OSI: Physical, Data Link, Network, Transport, Session, Presentation, Application.",
          "Mnemonics: 'Please Do Not Throw Sausage Pizza Away'.",
          "L1=Bits, L2=Frames, L3=Packets, L4=Segments, L5-7=Data."
        ]
      },
      {
        name: "TCP/IP 4-Layer Model",
        oneLiner: "TCP/IP is a 4-layer practical framework developed by DARPA that runs the actual internet.",
        definition: "Consists of 4 layers: Network Access (Physical & Data Link), Internet (Network/IP), Transport (TCP/UDP), and Application (Session, Presentation, & Application combined).",
        whyNeed: "Simplicity and execution speed. By folding administrative layers into the application space, performance is optimized for actual operating system kernels.",
        example: "The Unix kernel implements the socket API mapping directly to the TCP/IP stack layers.",
        devPerspective: "SDEs configure TCP parameters (e.g. TCP keepalive, window scaling) directly in Linux configurations to optimize server capacity.",
        questions: [
          "Describe the 4 layers of the TCP/IP model.",
          "Map the 7 OSI layers to the 4 TCP/IP layers.",
          "What are the major differences between the OSI and TCP/IP models?"
        ],
        followups: [
          "Which model came first historically? [TCP/IP was developed before the OSI model became a standard]",
          "Why did TCP/IP combine OSI's top three layers?"
        ],
        confusions: [
          "Network Access Layer: Also called Link Layer. It handles physical hardware connections as well as MAC address framing."
        ],
        takeaways: [
          "TCP/IP is the practical architecture of the internet.",
          "Layers: Network Access, Internet, Transport, Application.",
          "Session and Presentation layers are merged into Application."
        ]
      },
      {
        name: "Encapsulation & Decapsulation",
        oneLiner: "Encapsulation wraps data with headers downward; decapsulation strips headers upward.",
        definition: "The process where each layer adds control headers (and trailers at L2) to the PDU of the layer above it during transmission. Decapsulation is the reverse process at the receiver.",
        whyNeed: "Allows routers, switches, and hosts to process traffic at their designated layers without reading the inner payload.",
        example: "A Layer 2 switch reads only the MAC header of an Ethernet frame to forward it, ignoring the IP payload inside.",
        devPerspective: "SDEs must keep MTU (Maximum Transmission Unit, typically 1500 bytes) in mind. Encapsulation headers consume bytes; exceeding MTU causes IP packet fragmentation.",
        questions: [
          "Explain the process of encapsulation and decapsulation.",
          "What information does the Network Layer add during encapsulation? [Source and Destination IP addresses]",
          "What is an Ethernet trailer and what does it contain? [Contains CRC checksum for error detection]"
        ],
        followups: [
          "Describe how a router decapsulates a frame to read IP headers.",
          "What is MTU and how does encapsulation overhead impact it?"
        ],
        confusions: [
          "Switch processing: A standard L2 switch does not decapsulate the IP header; it only decapsulates up to the MAC frame header."
        ],
        takeaways: [
          "Encapsulation adds headers downward.",
          "Decapsulation strips headers upward.",
          "Frame trailers contain the Cyclic Redundancy Check (CRC)."
        ]
      }
    ]
  },
  {
    id: "ip_addressing",
    num: "CN.3",
    title: "IP Addressing & Subnetting",
    desc: "Targeting nodes in a global matrix. Covers IPv4 classes, private and special IP reserves, subnet calculations, CIDR slash prefixes, NAT port mapping, and IPv6 differences.",
    declaration: `// IP Variable Matrix
const ipConfig = {
  ipv4Bits: 32,
  ipv6Bits: 128,
  privateRanges: ["10.0.0.0/8", "172.16.0.0/12", "192.168.0.0/16"],
  specialIPs: { loopback: "127.0.0.1" }
};`,
    internalImplementation: `/* ----------------- NETWORK ADDRESS TRANSLATION -----------------
   Private IP [192.168.1.10:8000] ──► [NAT Router (maps port)] ──► Public IP [203.0.113.5:1425]
*/`,
    subtopics: [
      {
        name: "IPv4 Addressing & Classes",
        oneLiner: "IPv4 uses 32-bit addresses split into classes based on host capacity.",
        definition: "A 32-bit logical address assigned to network interfaces, represented in dot-decimal format (four 8-bit octets), and classified into Classes A, B, C, D, and E.",
        whyNeed: "Every node needs a unique identifier to route packets. Class boundaries split networks into network bits and host bits to structure routing hierarchies.",
        example: "Class C address `192.168.1.25` has first three octets representing the local network.",
        devPerspective: "SDEs set up server configurations. Knowing class ranges tells you how many usable servers (hosts) you can deploy on a subnet.",
        questions: [
          "What is an IPv4 address?",
          "Differentiate Classes A, B, C, D, and E based on their IP range.",
          "What is the loopback address and what is it used for?"
        ],
        followups: [
          "How many hosts does a Class C network support? [254 usable]",
          "What is Class D used for? [Multicast applications]"
        ],
        confusions: [
          "Dynamic vs Static: An IP address is dynamic by default (DHCP); a MAC address is permanently burned into the hardware interface."
        ],
        takeaways: [
          "IPv4 is 32-bits.",
          "Class A (1.0.0.0 - 126.255.255.255) for huge corporate networks.",
          "127.0.0.1 (Loopback) is reserved for local host diagnostic testing."
        ]
      },
      {
        name: "Private & Special IP Ranges",
        oneLiner: "Private IPs route within local LANs and cannot access the public internet directly.",
        definition: "Specific ranges of IP addresses reserved by RFC 1918 for internal private networks that are not routable on the public internet.",
        whyNeed: "Public IPv4 space is scarce. Re-using private IPs inside separate LANs globally saves millions of IP addresses.",
        example: "A home Wi-Fi assigns `192.168.1.X` to your laptop and mobile phone locally.",
        devPerspective: "Enterprise backends run within VPCs (Virtual Private Clouds) using private IP blocks (e.g. `10.0.0.0/16`) to hide databases and servers from the internet.",
        questions: [
          "What are private IP addresses and why do we need them?",
          "List the reserved private IP ranges for Class A, B, and C.",
          "Can private IPs route packets over the public internet?"
        ],
        followups: [
          "How do private networks connect to the internet? [Through NAT routers]",
          "What is APIPA (Automatic Private IP Addressing)?"
        ],
        confusions: [
          "Private vs Public: You can ping a private IP inside your office network, but you cannot ping it from home without VPN tunnel access."
        ],
        takeaways: [
          "Private ranges: `10.X.X.X`, `172.16.X.X - 172.31.X.X`, `192.168.X.X`.",
          "Provides a natural firewall security barrier.",
          "Saves public IPv4 address space."
        ]
      },
      {
        name: "Subnetting & CIDR Suffixes",
        oneLiner: "Subnetting splits large networks into smaller sub-networks using CIDR notations.",
        definition: "Subnetting is the division of a single network address space into smaller logical sub-nets using a mask. CIDR (Classless Inter-Domain Routing) represents this using a slash `/` suffix notation.",
        whyNeed: "Without subnets, broad broadcast traffic floods the entire network. CIDR allows dynamic allocation of IP addresses, optimizing routing table entries.",
        example: "`192.168.1.0/24` means the first 24 bits are network, leaving 8 bits for host addresses (256 addresses, 254 usable).",
        devPerspective: "SDEs designing cloud environments (like AWS VPCs) configure CIDR masks (e.g., `/24` subnets) to segment web tiers, worker groups, and databases.",
        questions: [
          "Explain Subnetting and its advantages.",
          "What does CIDR notation signify? Explain with `/24` vs `/25`.",
          "Why are the first and last IP addresses in a subnet range unusable?"
        ],
        followups: [
          "How many usable IP addresses are in a `/26` subnet? [62 usable]",
          "What is a subnet mask and how does a router perform logical AND operations with it?"
        ],
        confusions: [
          "Subnet size: Suffix `/24` holds 256 IPs; `/25` holds 128 IPs. Larger CIDR numbers indicate smaller host capacities."
        ],
        takeaways: [
          "CIDR replaced the wasteful class-based system.",
          "First IP is network ID; last IP is broadcast address.",
          "Subnetting limits the scope of network broadcast storms."
        ]
      },
      {
        name: "NAT (Network Address Translation)",
        oneLiner: "NAT maps many local private IPs to a single public IP to communicate externally.",
        definition: "A method of mapping local private IP spaces to public IPs at the router level during packet transmission, often using PAT (Port Address Translation) to track connections.",
        whyNeed: "Allows thousands of office computers to access the web using a single public IP subscription, acting as an implicit security barrier.",
        example: "Ten colleagues download files simultaneously; the router NAT table translates incoming packets using specific source ports.",
        devPerspective: "SDEs designing backend APIs must place database servers in private subnets with NAT Gateways to access external APIs securely without open incoming ports.",
        questions: [
          "What is NAT and why is it essential in modern networking?",
          "Differentiate between Static NAT, Dynamic NAT, and PAT (NAT Overload).",
          "What is the purpose of a NAT translation table?"
        ],
        followups: [
          "How does PAT use port numbers to differentiate connections?",
          "Explain why NAT breaks end-to-end connectivity and what port forwarding solves."
        ],
        confusions: [
          "NAT is routing: NAT translates IPs inside headers; it doesn't decide the destination path (which is the router's job)."
        ],
        takeaways: [
          "PAT maps private IP + private port to public IP + public port.",
          "Essential for saving public IPv4 addresses.",
          "NAT blocks direct outside connections (implicit security)."
        ]
      },
      {
        name: "IPv6 vs IPv4",
        oneLiner: "IPv6 uses 128-bit hexadecimal addresses to prevent address exhaustion.",
        definition: "The next-generation IP protocol replacing IPv4, using 128-bit hex-encoded addresses, removing the need for NAT, and adding built-in security features.",
        whyNeed: "IPv4 address space is fully exhausted. IPv6 provides 3.4 x 10^38 unique addresses, enough to assign public IPs to every device globally.",
        example: "An IPv6 address: `2001:0db8:85a3:0000:0000:8a2e:0370:7334`.",
        devPerspective: "Modern SDEs write code supporting dual-stack networking to ensure APIs bind to both IPv4 and IPv6 ports successfully.",
        questions: [
          "What is IPv6 and why was it introduced?",
          "Compare IPv6 vs IPv4 in terms of address size and representation.",
          "Does IPv6 use NAT?"
        ],
        followups: [
          "Explain SLAAC (Stateless Address Autoconfiguration) in IPv6.",
          "How does IPv6 handle broadcasts? [It replaces broadcasts with multicast routing]"
        ],
        confusions: [
          "Compatibility: IPv4 and IPv6 cannot communicate directly without transition mechanisms like dual-stack or tunneling."
        ],
        takeaways: [
          "IPv6 is 128-bits; IPv4 is 32-bits.",
          "Simplifies router headers for faster routing.",
          "Enables globally unique public IPs for all IoT devices."
        ]
      }
    ]
  },
  {
    id: "protocols_ports",
    num: "CN.4",
    title: "Protocols & Sockets",
    desc: "The language of client-server requests. Understand stateless HTTP vs encrypted HTTPS, DNS address lookup registers, and socket port boundaries.",
    declaration: `// Ports and Socket Configurations
const portMapping = {
  dns: 53,
  http: 80,
  https: 443,
  smtp: 25,
  ssh: 22
};`,
    internalImplementation: `/* ----------------- DNS LOOKUP QUERY FLOW -----------------
   Client ──► [DNS Server (Port 53)] ──► Query "google.com" ──► Return [142.250.190.46]
*/`,
    subtopics: [
      {
        name: "HTTP vs HTTPS",
        oneLiner: "HTTP is plaintext communication; HTTPS adds SSL/TLS encryption for security.",
        definition: "HTTP (HyperText Transfer Protocol) is a stateless application protocol for WWW data transfer. HTTPS is HTTP wrapped inside an SSL/TLS cryptographic tunnel.",
        whyNeed: "Plain HTTP is vulnerable to man-in-the-middle sniffing attacks. HTTPS encrypts header keys, cookies, and payloads to secure credentials and private data.",
        example: "Credit card checkout pages require HTTPS to prevent hackers from capturing card numbers on local networks.",
        devPerspective: "SDEs configure reverse proxies (Nginx) to redirect all HTTP port 80 traffic to HTTPS port 443, terminating TLS at the load balancer.",
        questions: [
          "What is HTTP? Explain why it is called a stateless protocol.",
          "How does HTTPS secure web traffic?",
          "Compare ports 80 and 443."
        ],
        followups: [
          "What is a stateless protocol and how do SDEs manage state? [Using cookies/sessions]",
          "What happens if an SSL certificate expires on a website?"
        ],
        confusions: [
          "Data storage: HTTP being stateless doesn't mean servers can't write to databases. It means each HTTP request is processed independently without context of past calls."
        ],
        takeaways: [
          "HTTP uses port 80; HTTPS uses port 443.",
          "HTTPS terminates SSL/TLS certificates.",
          "HTTPS is essential for SEO ranking and data security."
        ]
      },
      {
        name: "DNS (Domain Name System)",
        oneLiner: "DNS translates human-readable domain names into machine-routable IP addresses.",
        definition: "A hierarchical, decentralized naming system that resolves domain names (e.g. `google.com`) into network IP addresses (e.g. `142.250.190.46`).",
        whyNeed: "Humans remember names; routers only understand numbers. DNS acts as the address book directory of the internet.",
        example: "Typing `interviewbit.com` requests a DNS server on port 53 to get the target server's IP address.",
        devPerspective: "SDEs set up DNS records: A records map domain names to IPv4, AAAA records to IPv6, and CNAME records map alias names to other domains.",
        questions: [
          "What is the Domain Name System (DNS)?",
          "Explain the DNS query lookup hierarchy (Root, TLD, Authoritative).",
          "What port does DNS use? [Port 53 over UDP/TCP]"
        ],
        followups: [
          "Explain the difference between recursive and iterative DNS queries.",
          "What is DNS caching and where does it occur?"
        ],
        confusions: [
          "DNS speed: DNS lookups add latency. SDEs use CDN caching and DNS pre-fetching to prevent slow page load times."
        ],
        takeaways: [
          "Translates domains to IPs.",
          "Mainly uses UDP port 53 for fast query speed; uses TCP for zone transfers.",
          "A records = IPv4; AAAA = IPv6; CNAME = Alias."
        ]
      },
      {
        name: "Sockets & Port Categories",
        oneLiner: "A socket is an IP address and port combination identifying a unique application connection.",
        definition: "A socket is a communication endpoint defined by an IP address and a port number. Port numbers range from 0 to 65535, categorized into system, registered, and ephemeral spaces.",
        whyNeed: "A server with one IP address runs multiple processes (databases, web servers, email). Ports direct packets to the correct application listener.",
        example: "A socket connection: `127.0.0.1:443` routes to the local secure web server process.",
        devPerspective: "SDEs open socket channels when building WebSockets chat apps, ensuring firewall rules permit incoming traffic on that specific port.",
        questions: [
          "What is a socket in computer networking?",
          "Explain the port number categories (Well-known, Registered, Ephemeral).",
          "Can two active services listen on the same port at the same time?"
        ],
        followups: [
          "What is the maximum port number value? [65535, based on 16-bits allocation]",
          "What are ephemeral ports and how does a client use them?"
        ],
        confusions: [
          "Port conflicts: Two applications cannot bind to the same port on the same IP and protocol (TCP/UDP) concurrently."
        ],
        takeaways: [
          "Socket = IP Address + Port Number.",
          "Well-known ports: 0 - 1023 (HTTP 80, SSH 22, SMTP 25).",
          "Clients utilize dynamic ephemeral ports randomly assigned for replies."
        ]
      }
    ]
  },
  {
    id: "routing_delivery",
    num: "CN.5",
    title: "Transmission, Media & Switching",
    desc: "The hardware mechanics of routing packets. Covers network devices (hubs, switches, bridges, routers, gateways), switch forwarding modes, STP, transmission media specs, wireless bands, data limits (Nyquist/Shannon), and modulation metrics.",
    declaration: `// Physical & Link Layer Transmission Specifications
const transportSpec = {
  dataLimits: {
    nyquist: "Max Rate = 2 * B * log2(V)",
    shannon: "Capacity = B * log2(1 + SNR)"
  },
  devices: ["Hub (L1)", "Switch (L2)", "Router (L3)", "Gateway (L4-7)"],
  mediaCat: ["Cat 5 (100 Mbps)", "Cat 5e (1 Gbps)", "Cat 6 (10 Gbps)"],
  fiberTypes: ["Single-mode (laser)", "Multi-mode (LED)"]
};`,
    internalImplementation: `/* ----------------- DATA RATE LIMITS & STP -----------------
   Noiseless Nyquist Rate = 2 * B * log2(V)
   Noisy Shannon Capacity = B * log2(1 + SNR)
   SNR(dB) = 10 * log10(SNR) (+10 dB = SNR * 10)

   STP Port Transition States:
   [Blocking] ──► [Listening] ──► [Learning] ──► [Forwarding]
   (No Tx, BPDU)  (Assess path)   (MAC build)    (Normal Tx)
*/`,
    subtopics: [
      {
        name: "Network Hardware & Domains",
        oneLiner: "Switches connect local LANs (L2 MAC); Routers route across networks (L3 IP); Hubs duplicate bits (L1).",
        definition: "Classification of devices: Hubs (L1, half-duplex broadcasts), Bridges (L2 software filters), Switches (L2 hardware filters, CAM table), Routers (L3, IP routing tables, separates broadcast domains), and Gateways (L4-7 protocol translators).",
        whyNeed: "Required to construct logical segments. Swapping hubs for switches eliminates network collision loops; adding routers limits broadcast packet storm propagation.",
        example: "An enterprise LAN with 24-port switches connected to a central router directing traffic to the internet gateway.",
        devPerspective: "Understanding device limits helps in deploying Kubernetes clusters. Pod communication uses virtual bridges (L2) while routing between nodes uses flannel/calico (L3).",
        questions: [
          "Compare Hub, Switch, Bridge, Router, and Gateway.",
          "Explain the difference between Collision Domains and Broadcast Domains.",
          "How many collision and broadcast domains does an 8-port switch have? [8 collision, 1 broadcast]"
        ],
        followups: [
          "Do routers forward broadcast packets by default? Why? [No, routers block L2/L3 broadcasts to prevent internet congestion]",
          "What is the function of a Repeater?"
        ],
        confusions: [
          "Switch vs Router: Standard switches route internally within the same IP subnet using MACs; routers route externally between subnets using IPs."
        ],
        takeaways: [
          "Hub: 1 collision, 1 broadcast domain.",
          "Switch: Separate collision domain per port, 1 broadcast domain.",
          "Router: Separate collision and broadcast domains per interface."
        ]
      },
      {
        name: "Switch Internals, VLANs & STP",
        oneLiner: "Switches map MACs to ports using CAM tables, split VLAN segments, and run STP to block loops.",
        definition: "Switch CAM table stores MAC-to-port bindings (aging timer ~300s). Forwarding is Store-and-Forward (checks CRC), Cut-Through (checks dest MAC), or Fragment-Free (checks 64 bytes). VLANs isolate L2 broadcast zones (802.1Q tags). STP (Spanning Tree) prevents loops by blocking redundant links.",
        whyNeed: "CAM tables enable wire-speed forwarding. STP is required to prevent loop storms in networks with redundant cables, maintaining a loop-free layout.",
        example: "A switch detecting a link loop blocks Port 5, changing state from Listening to Blocking to save the network from collapsing.",
        devPerspective: "VLAN mapping allows SDEs to logically isolate staging, production, and corporate test environments sharing the same hardware rack switches.",
        questions: [
          "What happens when a switch's CAM table is fully saturated? [Acts as a hub, floods all ports]",
          "Compare Store-and-Forward, Cut-Through, and Fragment-Free forwarding modes.",
          "Explain Spanning Tree Protocol (STP) and its port states."
        ],
        followups: [
          "Explain 802.1Q tagging on trunk links. How many bits are allocated for VLAN ID? [12 bits, support 4096 VLANs]",
          "What are the port states in STP? [Blocking, Listening, Learning, Forwarding, Disabled]"
        ],
        confusions: [
          "MAC flooding attack: Attacker fills CAM table with random dummy MACs, forcing the switch to fail-open and act as a hub, exposing packets."
        ],
        takeaways: [
          "Store-and-Forward checks entire frame CRC; Cut-Through is fastest.",
          "VLAN ID is 12 bits (4094 usable).",
          "STP elects a Root Bridge based on the lowest Bridge ID (Priority + MAC)."
        ]
      },
      {
        name: "Transmission Media & Wireless",
        oneLiner: "Guided media includes Copper (UTP/STP Cat 3-7) and Optical Fiber (Single/Multi-mode).",
        definition: "Twisted pair (UTP/STP Cat 5e/6/7) twisted to cancel EMI. Coaxial cable offers shielding. Fiber Optic uses total internal reflection (Single-mode has a small core for long-distance laser; Multi-mode has a wider core for LED LANs). Wireless uses Radio, Microwave (line-of-sight), or Infrared.",
        whyNeed: "Media dictates speed limits and maximum runs. UTP is limited to 100m; Multi-mode fiber spans ~2km; Single-mode spans 100+km without repeaters.",
        example: "Deploying Cat 6a cables in an office for 10 Gbps speeds, and using single-mode fiber to link the building to the regional carrier.",
        devPerspective: "Choosing the correct media affects cloud data replication speeds: fiber lines enable cross-region database synching with light-speed limits.",
        questions: [
          "Explain twisted-pair cabling. Why are the wires twisted?",
          "Differentiate between Single-mode and Multi-mode optical fiber.",
          "Compare UTP Category 5, 5e, and 6 cabling capacities."
        ],
        followups: [
          "Why is fiber optic immune to electromagnetic interference (EMI)? [Uses light photons instead of electrical copper currents]",
          "Explain the difference between Ground, Sky, and Line-of-Sight wireless propagation."
        ],
        confusions: [
          "Fiber cladding: The cladding around the fiber core has a lower refractive index than the core itself to ensure total internal reflection."
        ],
        takeaways: [
          "All standard UTP cabling is rated for 100m max distance.",
          "Single-mode fiber: Small core, laser, long distance.",
          "Multi-mode fiber: Large core, LED, short distance."
        ]
      },
      {
        name: "Physical Limits, Modulation & Multiplexing",
        oneLiner: "Nyquist limits noiseless rates; Shannon limits noisy capacities. MUX combines lines via FDM/TDM.",
        definition: "Nyquist formula: 2 * B * log2(V). Shannon formula: B * log2(1 + SNR). Modulation encodes data by shifting carrier waves: ASK (amplitude), FSK (frequency), PSK (phase), or QAM (amplitude + phase). Multiplexing joins channels: FDM (analog frequency), TDM (digital time slots), WDM (wavelength color), or CDMA.",
        whyNeed: "Defines hardware limits. Shows why we cannot send infinite data over noisy lines. Modulation enables wireless networks like 4G (QAM-64) and 5G (QAM-256).",
        example: "A telephone copper line with 3000 Hz bandwidth and 30 dB SNR has a Shannon capacity limit of ~30 Kbps.",
        devPerspective: "SDEs deploying video streaming apps must compress streams when client networks drop to low-QAM connections (low SNR).",
        questions: [
          "State Nyquist and Shannon's channel capacity theorems.",
          "Differentiate between ASK, FSK, PSK, and QAM modulation.",
          "Explain the difference between Synchronous and Statistical TDM."
        ],
        followups: [
          "If Baud rate is 2000 and QAM-16 modulation is used, what is the Bit rate? [2000 * log2(16) = 8000 bps]",
          "What is the transmission speed of T1 and E1 carrier lines? [T1 = 1.544 Mbps, E1 = 2.048 Mbps]"
        ],
        confusions: [
          "Baud rate vs Bit rate: Baud rate is the frequency of signal changes per second; Bit rate is the number of actual binary bits transmitted per second."
        ],
        takeaways: [
          "Nyquist = noiseless channels; Shannon = noisy channels.",
          "Bit Rate = Baud Rate * log2(V).",
          "TDM splits time; FDM splits frequency; WDM splits optical light colors."
        ]
      },
      {
        name: "Diagnostics & TLS Handshake",
        oneLiner: "Ping uses ICMP; Traceroute logs router hops via TTL; TLS handshake securely exchanges keys.",
        definition: "Ping validates reachability. TTL limits packet lifespan to prevent loop storms. Traceroute maps path hops. TLS Handshake establishes secure communication (asymmetric key exchange for key sync, followed by symmetric encryption for session data transfer).",
        whyNeed: "Core SDE troubleshooting tools. Allows developers to verify L3 connection paths and audit TLS cryptographic performance.",
        example: "Troubleshooting a slow website response: ping confirms L3 host availability, traceroute finds where packets drop, and curl audits TLS handshake speed.",
        devPerspective: "SDEs configure servers to handle TLS Session Resumption, saving round-trip times (RTT) for returning clients.",
        questions: [
          "How does traceroute use incrementing TTL to identify router hops?",
          "Explain the difference between symmetric and asymmetric encryption in a TLS handshake.",
          "What happens if ping responds successfully but HTTP requests fail?"
        ],
        followups: [
          "What protocol does ping rely on? [ICMP - Internet Control Message Protocol]",
          "Differentiate TLS 1.2 vs TLS 1.3 handshakes. [1.3 completes key exchange in 1 RTT instead of 2 RTTs]"
        ],
        confusions: [
          "Firewall blocks: Some security configurations block ICMP packets, meaning ping might fail even if the server's web service is running fine."
        ],
        takeaways: [
          "Traceroute starts with TTL = 1, incrementing by 1 on timeout responses.",
          "Asymmetric is used for key exchange; symmetric is used for session transfer.",
          "TTL prevents packet loops from running forever."
        ]
      }
    ]
  }
];
