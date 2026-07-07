export const cnConcepts = [
  {
    id: "cn_fundamentals",
    num: "CN.1",
    title: "Network Classifications & Topologies",
    desc: "The hardware blueprints of connectivity. This section covers network definitions, nodes and links, geographic classifications (LAN, WAN, MAN), and physical topologies.",
    declaration: `// Network Structural Entities
const topologySchema = {
  elements: ["Nodes (Hosts, Switches)", "Links (Copper, Fiber)"],
  classes: ["PAN", "LAN", "MAN", "WAN"],
  topologies: ["Bus", "Star", "Ring", "Mesh", "Tree"]
};`,
    internalImplementation: `/* ----------------- TOPOLOGY SCHEMATICS -----------------
   Star:   [Node 1] ──┐
   		            ├──► [Central Switch/Hub] ◄── [Node 3]
           [Node 2] ──┘
   Mesh:   [Node A] ◄───► [Node B]
             ▲              ▲
             └──────────────┘
*/`,
    subtopics: [
      {
        name: "Network & Nodes/Links",
        oneLiner: "A network is an interconnected group of nodes sharing data over communication links.",
        definition: "A computer network is a system of interconnected host devices (nodes) connected by communication channels (links) that share resources and exchange information using standard protocols.",
        whyNeed: "Without networks, computers are isolated silos. Networks enable dynamic data sharing, distributed cloud architectures, and real-time collaboration.",
        example: "A corporate office network connecting laptops, print servers, and file databases over local switches.",
        devPerspective: "SDEs design applications that exchange data over sockets. Every network connection maps back to a client node opening a channel to a server node.",
        questions: [
          "What is a computer network and what are its core components?",
          "Differentiate between nodes and links in a network diagram.",
          "What are client nodes vs server nodes?"
        ],
        followups: [
          "Explain the difference between point-to-point and broadcast links.",
          "What are the parameters used to measure network performance (throughput, latency)?"
        ],
        confusions: [
          "Nodes vs Clients: All hosts are nodes (including printers and switches), but not all nodes are active users/clients requesting files."
        ],
        takeaways: [
          "A node is any device capable of communicating.",
          "A link is the communication medium (wired/wireless).",
          "Protocols govern how nodes communicate over links."
        ]
      },
      {
        name: "Network Classifications (LAN/WAN/MAN)",
        oneLiner: "Networks are classified by geographic size, from local rooms to global infrastructure.",
        definition: "The categorization of networks based on their geographic span: LAN (Local Area Network - single building/home), MAN (Metropolitan Area Network - city size), and WAN (Wide Area Network - country/global scale).",
        whyNeed: "Geographic scale determines the wiring medium, routing requirements, speeds, and costs. A LAN uses cheap local switches; a WAN requires internet service providers (ISPs) and routers.",
        example: "Your home Wi-Fi is a LAN; the internet is the ultimate global WAN connecting local networks.",
        devPerspective: "SDEs must design apps keeping network speeds in mind: LAN operations are low-latency (~1ms), while WAN requests (e.g. cross-region database queries) introduce high latency (100ms+).",
        questions: [
          "How are networks classified based on geographical distribution?",
          "Explain LAN, MAN, and WAN with examples.",
          "What is an Enterprise Network?"
        ],
        followups: [
          "Compare wired LAN (Ethernet) vs wireless LAN (Wi-Fi) in terms of security and collision domains.",
          "What is PAN (Personal Area Network) and when is it used?"
        ],
        confusions: [
          "WAN = Internet: The internet is a public WAN, but companies also build private WANs to connect remote branches securely."
        ],
        takeaways: [
          "LAN: Small area, high speed, cheap setup.",
          "WAN: Large area, slower speed, requires ISPs and routing protocols.",
          "WLAN utilizes Wi-Fi (802.11 standards)."
        ]
      },
      {
        name: "Network Topologies",
        oneLiner: "Topologies define the physical or logical layout of nodes and connection cables.",
        definition: "The physical or logical arrangement of devices, links, and nodes in a network, including Bus, Star, Ring, Mesh, Tree, and Hybrid structures.",
        whyNeed: "Topology affects fault tolerance, cost, and cabling complexity. Mesh provides maximum redundancy but is expensive; Star is robust and easy to troubleshoot but has a single point of failure.",
        example: "Modern offices use Star topology connected to central switches. If one ethernet cord breaks, only that laptop loses connection.",
        devPerspective: "Infrastructure SDEs map physical servers in database clusters using tree or hybrid topologies to ensure high availability and route efficiency.",
        questions: [
          "Define network topology and name its primary types.",
          "Explain Star topology. Why is it the most popular in corporate offices?",
          "Compare Ring topology vs Mesh topology."
        ],
        followups: [
          "What is the formula for the number of links in a fully connected mesh network with N nodes? [N*(N-1)/2]",
          "What is a hybrid topology?"
        ],
        confusions: [
          "Logical vs Physical: A network can have a physical Star layout (cables to a hub) but act logically as a Bus (broadcasting signals)."
        ],
        takeaways: [
          "Star topology is the modern standard for local offices.",
          "Mesh topology provides maximum redundancy at high cost.",
          "If the central hub in a Star network fails, the entire segment collapses."
        ]
      }
    ]
  },
  {
    id: "ip_addressing",
    num: "CN.2",
    title: "IP Addressing & Subnetting",
    desc: "Targeting nodes in a global matrix. Covers IPv4 routing classes, private IP reserves, subnet masks, CIDR blocks, IPv6 transitions, and NAT translating.",
    declaration: `// IP Variable Matrix
const ipConfig = {
  ipv4Bits: 32,
  ipv6Bits: 128,
  privateRanges: ["10.0.0.0/8", "172.16.0.0/12", "192.168.0.0/16"],
  specialIPs: { loopback: "127.0.0.1" }
};`,
    internalImplementation: `/* ----------------- NETWORK ADDRESS TRANSLATION -----------------
   Private IP [192.168.1.10:8000] ──► [NAT Router (maps port)] ──► Public IP [203.0.113.5:80]
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
    id: "osi_tcpip",
    num: "CN.3",
    title: "Reference Models & Network Layers",
    desc: "The stack of protocols organizing traffic. Differentiate between the 7-layer OSI model and the 4-layer TCP/IP framework, mapping packet conversions.",
    declaration: `// Layer Mapping Configurations
const modelsMap = {
  osi: ["Physical", "DataLink", "Network", "Transport", "Session", "Presentation", "Application"],
  tcpip: ["Network Access", "Internet", "Transport", "Application"]
};`,
    internalImplementation: `/* ----------------- LAYER DATA ENCAPSULATION -----------------
   [Application Data] ──► [Segment (TCP)] ──► [Packet (IP)] ──► [Frame (Ethernet)] ──► Bits
*/`,
    subtopics: [
      {
        name: "OSI Reference Model",
        oneLiner: "The OSI model is a 7-layer theoretical blueprint standardizing open network communications.",
        definition: "A conceptual framework developed by the ISO dividing network communication into seven layers: Physical, Data Link, Network, Transport, Session, Presentation, and Application.",
        whyNeed: "Standardizes development. Software engineers and hardware vendors can implement protocols at specific layers that plug-and-play together.",
        example: "A web browser runs at the Application layer, calling the Transport layer (TCP) to send byte arrays down to physical cables.",
        devPerspective: "SDEs use the OSI model to diagnose bugs: 'Connection refused' points to the Transport layer; 'JSON parsing error' is at the Presentation/Application layer.",
        questions: [
          "What is the OSI model and why is it used?",
          "List the 7 layers of the OSI model in order.",
          "Differentiate between physical layer data (bits) and data link layer data (frames)."
        ],
        followups: [
          "Which layer is responsible for routing? [Network layer]",
          "What is error detection at the Data Link layer? [CRC/checksum checks]"
        ],
        confusions: [
          "Practical implementation: The OSI model is a theoretical framework. Real operating systems implement the simpler TCP/IP model."
        ],
        takeaways: [
          "7 layers: Physical, DataLink, Network, Transport, Session, Presentation, Application.",
          "Encapsulation wraps data with headers at each downward layer.",
          "Decapsulation strips headers at each upward layer."
        ]
      },
      {
        name: "TCP/IP Reference Model",
        oneLiner: "The TCP/IP model is a 4-layer practical framework powering the actual internet.",
        definition: "The core protocol suite of the internet, dividing network structures into four functional layers: Network Access, Internet, Transport, and Application.",
        whyNeed: "Provides a lightweight, performant framework. Condenses the OSI model's top three layers into one Application layer and bottom two layers into Network Access.",
        example: "The Linux kernel network stack implements TCP/IP configurations directly to route server web traffic.",
        devPerspective: "Understanding TCP/IP is key when configuring backend system parameters like TCP socket backlogs or maximum segment sizes (MSS) in deployment.",
        questions: [
          "Describe the TCP/IP Reference Model.",
          "List the 4 layers of the TCP/IP model.",
          "How does the TCP/IP model compare to the OSI model?"
        ],
        followups: [
          "Explain the roles of TCP and IP protocols in this model.",
          "What is the Network Access layer responsible for?"
        ],
        confusions: [
          "TCP/IP name: Although named after TCP and IP, the model also encompasses other protocols like UDP, ICMP, DNS, and HTTP."
        ],
        takeaways: [
          "The practical model that runs the internet.",
          "Combines Session, Presentation, and Application into the 'Application' layer.",
          "Highly efficient and implementable in hardware drivers."
        ]
      },
      {
        name: "Gateways vs Routers",
        oneLiner: "Routers forward packets between similar networks; Gateways translate dissimilar protocol stacks.",
        definition: "A router is a L3 device forwarding data packets based on IP addresses. A gateway is a protocol translator connecting distinct network architectures.",
        whyNeed: "Connecting home LANs to public ISP lines needs a router. Connecting distinct protocols (like corporate mainframe protocols to HTTP web servers) needs a gateway.",
        example: "An API gateway translating HTTP client queries into internal gRPC microservice messages.",
        devPerspective: "SDEs use Cloud API Gateways (Kong, AWS API Gateway) to manage client security, rate limiting, and route translations before requests reach microservices.",
        questions: [
          "What is a router and how does it function?",
          "How is a gateway different from a router?",
          "What is the default gateway in network configuration?"
        ],
        followups: [
          "What layer does a router operate at? [Network layer - Layer 3]",
          "Can a gateway operate across all seven OSI layers? [Yes, since it performs protocol translations]"
        ],
        confusions: [
          "Home routers: Consumer home boxes are routers, switches, gateways, and access points combined into a single physical shell."
        ],
        takeaways: [
          "Routers connect networks using similar IP stacks.",
          "Gateways translate protocols between dissimilar structures.",
          "Default gateway is the outbound portal for local subnets."
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
    title: "Data Transmission & Protocols",
    desc: "How packets travel across routers. Covers hardware (Switches, Routers, Bridges), network latency delays, ping diagnostics, and TLS handshakes.",
    declaration: `// Transmission Parameters
const travelSpec = {
  diagnosticTools: ["ping", "traceroute"],
  delays: ["Propagation", "Transmission", "Processing", "Queuing"],
  securityTunnel: "SSL / TLS Handshake"
};`,
    internalImplementation: `/* ----------------- TLS HANDSHAKE STAGES -----------------
   Client ──► [ClientHello: cipher list] ──► Server
   Client ◄── [ServerHello + CA Cert + PubKey] ◄── Server
   Client ──► [Verify Cert + Send SessionKey (Encrypted)] ──► Server
   Client ◄──► [Symmetric Encrypted Session] ◄──► Server
*/`,
    subtopics: [
      {
        name: "Switch vs Router vs Bridge",
        oneLiner: "Switches connect local LAN devices; Routers connect separate IP networks.",
        definition: "A bridge connects two L2 segments; a switch is a multiport bridge connecting LAN devices using MAC addresses; a router is a L3 device routing packets between IP networks.",
        whyNeed: "Local computers share files via high-speed switches. Connecting those computers to other offices globally requires routers resolving IP destinations.",
        example: "A local office switch forwards local prints to print-servers; the office router forwards browser requests to Google servers.",
        devPerspective: "SDEs deploying database replicas inside AWS partition nodes across different subnets, routing sync traffic through Virtual Routers.",
        questions: [
          "What is the difference between a switch, a router, and a bridge?",
          "At what layers of the OSI model do switches and routers operate?",
          "Explain a MAC address table in switches."
        ],
        followups: [
          "What is a Layer 3 switch and how does it merge switching with routing?",
          "Why did switches replace hubs in local area networks? [Switches prevent collision domains]"
        ],
        confusions: [
          "Bridge vs Switch: Bridges are software-based and have few ports; switches are hardware-based (ASIC chips) and support many ports."
        ],
        takeaways: [
          "Switch/Bridge: Layer 2 (MAC addressing).",
          "Router: Layer 3 (IP addressing).",
          "Switches segment collision domains; routers segment broadcast domains."
        ]
      },
      {
        name: "Network Delays & Latency",
        oneLiner: "Latency is the sum of transmission, propagation, processing, and queuing delays.",
        definition: "The total time required for a packet to travel from source to destination, computed as: Latency = Transmission + Propagation + Processing + Queuing delay.",
        whyNeed: "Performance optimization requires identifying network bottlenecks. High propagation delay needs CDNs; high queuing delay indicates server overload.",
        example: "Ping latency is high over satellite internet because of propagation delay (distance to space).",
        devPerspective: "SDEs optimize app latency by compressing payloads (reducing transmission delay) and using cache pools (reducing server processing delays).",
        questions: [
          "What are the four components of network delay?",
          "Explain the difference between propagation delay and transmission delay.",
          "What causes queuing delay?"
        ],
        followups: [
          "How does distance affect propagation delay?",
          "Differentiate bandwidth from latency using the highway analogy. [Bandwidth = lanes, Latency = speed limit]"
        ],
        confusions: [
          "Bandwidth vs Latency: High bandwidth (large network pipeline) does not decrease the physical time a single packet takes to travel to the moon and back."
        ],
        takeaways: [
          "Propagation delay = Distance / Speed of Medium.",
          "Transmission delay = Packet Length / Bandwidth.",
          "Queuing delay depends on traffic congestion and buffer size."
        ]
      },
      {
        name: "Diagnostics (Ping, TTL, Traceroute)",
        oneLiner: "Ping validates reachability; TTL prevents infinite loops; Traceroute maps routers.",
        definition: "Utilities for network diagnostics. Ping checks node reachability; TTL (Time to Live) is a packet hop counter; Traceroute registers the path of routers to a host.",
        whyNeed: "Debugging outages needs trace points. Ping tells you if a server is online; Traceroute locates the specific router node where packets are being dropped.",
        example: "Running `ping 8.8.8.8` sends ICMP requests, getting replies back with round-trip milliseconds.",
        devPerspective: "SDEs run ping scripts inside status health checks to trigger automated failovers if host servers fail to respond for consecutive cycles.",
        questions: [
          "What is a ping command and what protocol does it use? [ICMP]",
          "What is TTL and why is it essential?",
          "How does traceroute work under the hood using TTL increments?"
        ],
        followups: [
          "If ping works but HTTP requests fail, what does this indicate? [L3 connectivity is fine, but L7 app/port is blocked]",
          "What is a SYN flood attack?"
        ],
        confusions: [
          "Ping block: Some secure production firewalls block ICMP packets, so a server can be running fine even if it blocks ping replies."
        ],
        takeaways: [
          "Ping uses ICMP Echo Request/Reply.",
          "TTL decreases by 1 at each router; drops at 0 to prevent circular loop storms.",
          "Traceroute lists router hops by incrementing TTL starting from 1."
        ]
      },
      {
        name: "TLS / SSL Handshake",
        oneLiner: "The TLS handshake performs key exchange to establish secure symmetric encryption.",
        definition: "A protocol process establishing a secure session, executing asymmetric encryption to safely exchange keys, and then utilizing symmetric encryption for subsequent data.",
        whyNeed: "Safely transfers private keys over public, unencrypted channels. Allows client and server to verify identities and agree on encryption algorithms.",
        example: "Loading an HTTPS site runs a handshake in milliseconds, showing a padlock icon once keys match.",
        devPerspective: "SDEs optimize TLS latency by enabling TLS Session Resumption, reducing subsequent handshake steps for recurring clients.",
        questions: [
          "Explain the steps of a TLS/SSL handshake in detail.",
          "Why is asymmetric encryption used during the handshake and symmetric encryption used for data transfer?",
          "What is a Certificate Authority (CA)?"
        ],
        followups: [
          "Differentiate TLS 1.2 vs TLS 1.3 handshakes in terms of round-trip times (RTTs). [1.3 reduces handshake to 1 RTT]",
          "How does a client verify a server's SSL certificate?"
        ],
        confusions: [
          "Asymmetric speed: Asymmetric encryption is computationally expensive, which is why it is only used to agree on the session key, not to encrypt the main body of site data."
        ],
        takeaways: [
          "Asymmetric is used for key exchange; symmetric is used for session transfer.",
          "Handshake steps: ClientHello -> ServerHello + Cert -> Key exchange -> Finished.",
          "Protects against packet interception and eavesdropping."
        ]
      }
    ]
  }
];
