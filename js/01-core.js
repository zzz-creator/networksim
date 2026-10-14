"use strict";

const STRINGS = {
  tabDiagram: "Diagram",
  tabMatrix: "Matrix",
  btnPresets: "Examples ▾",
  btnImport: "Import JSON",
  btnExport: "Export JSON",
  btnExportPng: "Export image",
  btnShare: "Share topology by link",
  btnNew: "New",
  expImgTitle: "Export image",
  expImgDesc:
    "PNG = universal image (shows everywhere). SVG = crisp vector for printing and further editing.",
  expPngBtn: "PNG (image)",
  expSvgBtn: "SVG (vector)",
  snapTitle: "Snap to grid",
  ovTitle: "Topology overview",
  ovDevices: "Network devices",
  ovSegments: "Networks / VLANs",
  ovHosts: "End nodes",
  ovRules: "Rules (FW+ACL)",
  ovWarnings: "Warnings",
  btnLearn: "Learn",
  learnTutorial: "App tour",
  crsMinAria: "Minimized lesson",
  crsMinSub: "continue reading",
  crsMinClose: "Discard the minimized lesson",
  learnCourse: "Networking course",
  learnCourseSub: "learn networking from scratch",
  learnTutorialSub: "a quick tour of the app",
  learnPractice: "Tasks & challenges",
  learnPracticeSub: "practice and troubleshoot faults",
  catBasics: "Basics & connectivity",
  catVlan: "VLANs & switching",
  catRouting: "Routing, IP & NAT",
  catRedundancy: "Redundancy, HA & dynamic routing",
  catWifi: "Wi-Fi",
  catServices: "DNS & DHCP",
  catFirewall: "Firewall & VPN",
  catSecurity: "L2 security & IDS/IPS",
  catOt: "Industrial networks (OT)",
  challengeTag: "challenge",
  btnMoreTitle: "Settings & file (import, export, theme)",
  modeLbl: "Mode",
  prefTheme: "Theme",
  prefHints: "Tips",
  prefHintsTitle: "The tip bar at the bottom of the canvas",
  hintsOn: "On",
  hintsOff: "Off",
  stHintsOn: "Tips at the bottom of the canvas are on",
  stHintsOff: "Tips at the bottom of the canvas are off",
  hdrCollapse: "Hide the top bar (more room for the canvas)",
  hdrExpand: "Show the top bar",
  tutBadge: "TOUR",
  tutSkip: "Skip",
  tutGo: "Let's go",
  tutPrev: "‹ Back",
  tutNext: "Next ›",
  tutGoCourse: "Networking course",
  tutGoTasks: "Learning tasks",
  tour1t: "Welcome to networksim",
  tour1b:
    "This tour walks you through the <b>simulator's interface</b> – not networking theory. New to networks? Take the <b>course</b> first (Learn → Networking course). Otherwise just click Next.",
  tour2t: "Device palette",
  tour2b:
    'From here you <b>drag</b> devices onto the canvas – grab a tile and drop it anywhere on the board. The basics are up top (host, L2 switch, router, Internet); the rest (Wi-Fi AP, firewall, IDS/IPS, load balancer, Managed L2 switch…) live under the collapsible <b>"Advanced devices"</b> section. Need more room? <b>Unpin</b> the panel with the pin button at the top – it tucks away to the edge and reveals on hover (the right-hand test panel works the same way).',
  tour3t: "The canvas",
  tour3b:
    "This is where you build the network. <b>Move</b> a node by dragging it, <b>pan</b> by dragging the empty background, <b>zoom</b> with the scroll wheel. Delete a link by clicking it and pressing <b>Delete</b> (or right-clicking).",
  tourWiret: "Wire devices (a cable)",
  tourWireb:
    "Hover over a node's <b>edge</b> – a <b>\"+\" port</b> appears. <b>Drag from it to another node</b> and release = a cable between them. Typically: <b>host → switch or router</b>, and <b>router → Internet</b>. Once connected, the host joins that node's network automatically.",
  tourConfigt: "Configure a device (double-click)",
  tourConfigb:
    "<b>Double-click</b> a node to open its settings. What's where: <b>Host</b> – type (PC/server/…), open ports/services and Wi-Fi. <b>Router / L3 switch</b> – <b>ACL</b> rules. <b>Firewall</b> – <b>zones and rules</b>. <b>Wi-Fi AP / router</b> – <b>SSIDs</b> and which network/VLAN they map to. <b>IDS/IPS</b> – threat signatures. <b>Load balancer</b> – the VIP and the servers behind it.",
  tour2bt:
    'From here you <b>add</b> devices to the canvas – <b>tap</b> a tile (or drag it with your finger). The basics are up top (host, L2 switch, router, Internet); the rest live under the collapsible <b>"Advanced devices"</b> section. On a phone the palette is a horizontal strip – swipe it sideways.',
  tour3bt:
    "This is where you build the network. <b>Move</b> a node by dragging it, <b>pan</b> by dragging the empty background, <b>pinch</b> to zoom. Delete a link by <b>pressing and holding</b> it (or via its settings).",
  tourWirebt:
    "Tap a node's <b>edge</b> – a <b>\"+\" port</b> appears. Drag from it <b>with your finger to another device</b> to create a cable. Typically: <b>host → switch or router</b>, and <b>router → Internet</b>. A host joins that device's network automatically once connected.",
  tourConfigbt:
    "<b>Double-tap</b> a node to open its settings. What's where: <b>Host</b> – type (PC/server/…), open ports/services and Wi-Fi. <b>Router / L3 switch</b> – <b>ACL</b> rules. <b>Firewall</b> – <b>zones and rules</b>. <b>Wi-Fi AP / router</b> – <b>SSIDs</b> and which network/VLAN they map to. <b>IDS/IPS</b> – threat signatures. <b>Load balancer</b> – the VIP and the servers behind it.",
  tourWifit: "Connect to Wi-Fi (no cable)",
  tourWifib:
    "Wireless instead of a cable: for something to join, a <b>router, firewall or Wi-Fi AP</b> must broadcast – in its settings you add an <b>SSID</b> and map it to a network/VLAN. Then <b>double-click a host → the Wi-Fi section → turn it on → pick a network</b> (enter a password if needed). The device joins the <b>nearest</b> broadcaster of that SSID.",
  tourWifibt:
    "Wireless instead of a cable: for something to join, a <b>router, firewall or Wi-Fi AP</b> must broadcast – in its settings you add an <b>SSID</b> and map it to a network/VLAN. Then <b>double-tap a host → the Wi-Fi section → turn it on → pick a network</b> (enter a password if needed). The device joins the <b>nearest</b> broadcaster of that SSID.",
  tourLogst: "Traffic and logs",
  tourLogsb:
    "The second tab on the right is your window into the network. <b>Live traffic</b> shows what is flying across the canvas right now – background traffic (ARP, DHCP, broadcast) runs on its own all the time. In advanced mode you also get <b>Connection overview</b> (who talks to whom – your network's normal picture) and <b>Syslog</b> (what the firewall blocked, what the probe flagged). This is exactly where you look for traces when something is off – and the <b>build report</b> button assembles an incident timeline out of it.",
  tour4t: "Traffic test",
  tour4b:
    'Pick a <b>source</b> and <b>destination</b> and click <b>Test traffic</b> – the basic test is a ping; you\'ll see the route and, step by step, where and why traffic passes or fails. Under <b>"Advanced: analysis & simulation"</b> you can change the traffic type and run blast-radius and the resilience test; start the <b>live traffic simulation</b> with the button below it.',
  tour5t: "Examples",
  tour5b:
    "Fastest start: load a ready-made network (enterprise, home…) and explore how it works.",
  tour6t: "Learn",
  tour6b:
    "Here you'll find the <b>networking courses</b> (from the basics to advanced – VLANs, routing, firewalls, OSPF, security…), this tour, the <b>learning tasks</b> (a prepared network you fix per the goal), and <b>challenges</b> – \"something's broken, find and fix the cause\".",
  tourTaskst: "Tasks and challenges",
  tourTasksb:
    "Under <b>Learn</b> you will find <b>Tasks and challenges</b> – briefs like ‘wire this up’ or ‘make sure nobody gets in here’. When you start one, a <b>task bar</b> appears at the top: what to do and why. You build it on the canvas, then hit <b>✓ Check</b> in that bar – the app tells you whether the solution holds, or what is still missing. The ✕ on the right closes the task anytime.",
  tour7t: "Simple / advanced mode",
  tour7b:
    "The Simple / Advanced toggle. Advanced unlocks <b>manual network settings</b> (IP addresses and gateways, MAC, DHCP pool – simple mode sets them for you), <b>security</b> (DHCP snooping, DAI, port security, STP mode), <b>physical ports</b> (limit, speed/duplex, SFP slots, shutdown, WAN, coloring), <b>manual static routes</b> and <b>DPI</b> (deep content inspection, custom signatures). Simple mode stays without them. Find the full overview by clicking the Mode label.",
  tour8t: "That's it!",
  tour8b:
    "Recommended path: the <b>course</b> first (understand networks from the ground up), then the <b>learning tasks</b> (apply it hands-on), and finally the <b>challenges</b> (find and fix a fault like in the real world).",
  taskStarted: "Task started:",
  taskEnded: "Task ended",
  taskConfirm: 'Start task "{0}"? The current topology will be replaced.',
  taskCheckBtn: "✓ Check",
  taskObserveTag: "Observe",
  taskEndTitle: "End task",
  taskPass: "Solved!",
  taskFail: "Not yet",
  taskPassMsg: "Great – all criteria met!",
  taskFailMsg: "Adjust the configuration per the goal and try again.",
  taskBackToList: "← Back to tasks",
  taskBackToCourse: "← Back to the course",
  taskDoneTag: "✓ done",
  taskReplayHint: "Click a criterion to replay the traffic on the canvas",
  tasksDoneLbl: "done",
  tasksIntro:
    "Pick a challenge – a prepared topology loads. Adjust it per the goal and click Check. Note: starting replaces the current topology.",
  tasksTutBtn: "New to the interface? Take the 2-min tour",
  lvlBasic: "Basic",
  lvlInter: "Intermediate",
  lvlAdvanced: "Advanced",
  tk_webdmz_t: "Expose the web, protect the internal network",
  tk_webdmz_g:
    "A company hosts its public website in the DMZ and keeps its internal network behind the firewall. From the internet, the web must be reachable over HTTPS (443), but nobody outside may reach the internal network. The firewall currently blocks everything – open it and add a rule: from zone outside to zone DMZ, proto TCP, port 443, permit.",
  tk_webdmz_1: "Internet → WEB (TCP 443) passes",
  tk_webdmz_2:
    "Internet → internal server (TCP 445) is blocked by the firewall",
  tk_webdmz_3:
    "Internet → WEB on another port (80) is blocked by the firewall (only 443 exposed, not the whole DMZ)",
  tk_drt_3: "Router R has a default route 0.0.0.0/0 in its table",
  tk_vsp_4:
    "Marketing (both PC and NAS) sits in its own network and still hangs off the switch",
  tk_vsp_t: "Split a flat network into VLANs",
  tk_vsp_g:
    "Accounting and marketing hang off one switch on the same network, so they can see each other’s servers. Separate them: leave accounting where it is and <b>move marketing (both the PC and the NAS) into its own VLAN</b>. Create a new network in the <b>Networks / VLANs</b> panel on the right, connect it to the switch, and move both marketing machines into it. You need no router and no ACL – the VLAN itself is the wall.",
  tk_wband_t: "2.4 GHz is not the only band",
  tk_wband_g:
    "The notebook joined the office Wi-Fi and reaches the file server, but the link is slow. The AP is broadcasting the STAFF network on <b>2.4 GHz</b> – the crowded, slower band. <b>Double-click the AP</b> and switch that SSID to <b>5 GHz</b>. Then watch the link label on the canvas: the capacity is worked out from the band, the transmit power and the distance, so changing the band really does change the speed.",
  tk_wband_1: "The notebook is on the 5 GHz network",
  tk_wband_2: "The wireless link now carries at least 400 Mbit/s",
  tk_wrange_t: "A client at the far end of the hall",
  tk_wrange_g:
    "The notebook at the end of the hall barely holds on, and traffic crawls. A Wi-Fi link carries no cable speed you can set – its capacity follows the signal, and the signal follows <b>transmit power</b> and distance. Open the AP and raise its <b>transmit power</b> so the cell reaches the desk. Do it on the real control, not by dragging the devices closer: the point is that coverage is a radio setting.",
  tk_wrange_1: "The notebook still reaches the file server",
  tk_wrange_2: "The wireless link now carries at least 300 Mbit/s",
  tk_wchplan_t: "Two APs fighting over the same channel",
  tk_wchplan_g:
    "Both access points broadcast the same 2.4 GHz network <b>on channel 6</b>, so their cells overlap and each one steals airtime from the other – both notebooks are slower than they should be. Plan the channels: on 2.4 GHz only <b>1, 6 and 11</b> do not overlap, so give one AP channel 1 and the other channel 11. Open each AP and set the channel on that SSID.",
  tk_wchplan_1: "Notebook 1 is on a non-overlapping 2.4 GHz channel (11)",
  tk_wchplan_2: "With the overlap gone the link carries at least 400 Mbit/s",
  tk_stovlan_t: "Storage belongs on its own VLAN",
  tk_stovlan_g:
    "The application server must reach the NAS over NFS, but the VLANs never cross between the switches: the links are left as plain access ports, so only one VLAN gets through at a time. Make the two links that join <b>SW-1, SW-2 and the firewall</b> into <b>trunks carrying all three VLANs</b>. Double-click a switch, hover the port that faces the other device, set its mode to trunk and tick VLAN10, VLAN20 and VLAN30. The firewall rules stay as they are: once every VLAN is carried, the firewall is what still stops a client PC from reading the storage.",
  tk_stovlan_1: "The application server reaches the NAS over NFS (2049)",
  tk_stovlan_2: "A client PC is still stopped by the firewall before the storage",
  tk_voicevlan_t: "Give the calls priority on the busy link",
  tk_voicevlan_g:
    "The phone reaches the call manager, but the links it crosses are congested – and a call cannot wait its turn. Turn on <b>voice priority (QoS)</b> on both congested links so SIP (5060) goes first in the queue. Find them by right-clicking the link → Link properties. Mind the trade-off: priority adds no capacity, so everything else waits a little longer.",
  tk_voicevlan_1: "The phone reaches the call manager on SIP (5060)",
  tk_voicevlan_2: "Both links on that path have voice priority enabled",
  tk_vsp_1: "Accounting PC → accounting server (445) works",
  tk_vsp_2: "Marketing PC → accounting server (445) no longer gets through",
  tk_vsp_3: "Marketing PC → marketing NAS (445) still works",
  tk_trs_t: "Carry both VLANs over one cable",
  tk_trs_g:
    "A single cable runs between SW-A and SW-B and someone left it as an <b>access port for VLAN10</b>. Sales can therefore reach their file server, but the admin in VLAN20 cannot reach theirs. <b>Double-click SW-A</b>. At the bottom, under <b>Ports (physical)</b>, there is a strip of numbered ports – hover over them and find the one that shows <b>SW-B</b>. Click it, switch it from <b>access</b> to <b>trunk</b>, and tick that it should carry <b>both VLAN10 and VLAN20</b>.",
  tk_trs_1: "Sales PC B → the sales file server (VLAN10) works",
  tk_trs_2: "Admin PC → server (VLAN20) works",
  tk_trs_3:
    "The SW-A – SW-B link is a trunk and carries both VLAN10 and VLAN20",
  tk_guest_t: "Isolate the Guest network",
  tk_guest_g:
    "Visitors connect to a separate Guest network (VLAN30) – it must not reach the internal servers (SMB 445), but may reach the internet; workstations may reach the servers. Open Core L3 and add an ACL rule blocking Guest (VLAN30) → Servers (VLAN20).",
  tk_guest_1: "Guest → server (445) is blocked by the L3 switch ACL",
  tk_guest_2: "Guest → internet (443) passes",
  tk_guest_3: "Workstation → server (445) passes",
  tk_guest_4:
    "Guest → server on another port (3389) is blocked by the ACL (block covers all traffic)",
  tk_idsips_t: "IDS only logs – turn on prevention",
  tk_idsips_g:
    "The perimeter sensor is in IDS mode (only detects and alerts), so it lets malware through to the web. Double-click it and switch to IPS mode (inline prevention) so it blocks the threat outright.",
  tk_idsips_1: "Malware to the web is blocked by the IPS (inline)",
  tk_idsips_2: "Benign HTTPS (443) passes",
  tk_tls_t: "An attack over HTTPS slips past the IPS",
  tk_tls_g:
    "A <b>SQL injection</b> is aimed at the web server. Over <b>HTTP (80)</b> the IPS catches it reliably – but over <b>HTTPS (443)</b> it goes straight through, as if the sensor were not there. It is not broken: it simply cannot see inside <b>encrypted</b> traffic, so a content signature has nothing to match. Open the <b>IPS</b> (double-click) and switch on <b>TLS inspection</b>. Note what it costs: for this to work in reality, every client in the network must trust the company certificate authority.",
  tk_tls_1: "The SQLi over HTTP (80) is blocked",
  tk_tls_2: "The SQLi over HTTPS (443) is blocked too",
  tk_tls_3: "Ordinary HTTPS traffic to the web server still gets through",
  tk_sqli_t: "Catch SQL injection on the IPS",
  tk_sqli_g:
    "Your public web server is being hit by SQL injection attacks. Configure the IPS to block them, while letting benign HTTPS traffic through. Open the IPS and enable the 'SQL injection' threat category.",
  tk_sqli_1: "SQL injection is blocked by the IPS",
  tk_sqli_2: "Benign HTTPS (443) passes",
  tk_wt_t: "Wiretap: a password in plain sight",
  tk_wt_g:
    "The admin logs in to the server over <b>Telnet</b>. Put a tap on the wire: right-click the link between the <b>Admin PC</b> and the switch, choose <b>Capture traffic</b> and let it run – you will see the username and password readable straight off the cable (with HTTPS you would only see metadata). Then fix it: <b>ban Telnet (23)</b> – delete the port 23 rule on the firewall and drop service 23 on the server. <b>SSH (22) must keep working</b>, or the admin locks themselves out.",
  tk_wt_1: "Telnet (23) no longer reaches the server",
  tk_wt_3:
    "Telnet no longer runs on the server – a closed service beats a blocked port",
  tk_wt_2: "SSH (22) still works to the server",
  tk_telnet_t: "Ban unencrypted Telnet",
  tk_telnet_g:
    "A security audit found the management server is still reachable over unencrypted Telnet (23) alongside SSH (22). Block Telnet, keep SSH. Open Core L3 and add an ACL rule: Workstations (VLAN10) → Mgmt (VLAN20), TCP port 23, deny.",
  tk_telnet_1: "PC → server Telnet (TCP 23) is blocked by the ACL",
  tk_telnet_2: "PC → server SSH (TCP 22) passes",
  tk_pivot_t: "DMZ must not pivot inside",
  tk_pivot_g:
    "The internet can reach the web in the DMZ (443) – that's correct. But there is a bad rule allowing traffic from DMZ into the internal network, so a compromised web server could jump to the database. Find and delete that bad rule (firewall → rules).",
  tk_pivot_1: "Internet → WEB (443) still passes",
  tk_pivot_2: "WEB (DMZ) → DB (internal, 1433) is blocked by the firewall",
  tk_pivot_3:
    "WEB → DB on another port (445) is also blocked by the firewall (no pivot inside)",
  tk_deny_t: "Default-deny: close the leaky firewall",
  tk_deny_g:
    "You inherited a firewall with a default 'permit all' policy – even the database is reachable from the internet. Open the firewall, switch the default policy to 'block everything (deny any)', and add a rule that permits only Internet → DMZ on TCP 443.",
  tk_deny_1: "Internet → WEB (TCP 443) passes",
  tk_deny_2: "Internet → DB (TCP 1433) is blocked by the firewall",
  tk_deny_3:
    "Internet → WEB on another port (80) is blocked by the firewall (only 443 allowed, not everything)",
  tk_ivlan_t: "Connect two VLANs (L3 routing)",
  tk_ivlan_g:
    "The PC (VLAN10) and the file server (VLAN20) are each behind their own switch and not connected – and they are in different subnets, so they need L3 routing. Drag an <b>L3 switch</b> from the palette and connect it to both switches (link L3 ↔ SW VLAN10 and L3 ↔ SW VLAN20). Then click ✓ Check.",
  tk_ivlan_1: "PC → server (SMB 445) passes",
  tk_ospf_t: "OSPF: the cheapest path wins",
  tk_ospf_g:
    "From <b>LAN A</b> to <b>LAN B</b> there are two paths: a short one via a <b>slow router</b> (R-slow, high cost 50+50) and a longer one via <b>two fast routers</b> (R-fast, low cost 5+5+5). The links have an <b>OSPF cost</b> set, so the engine seeks the <b>CHEAPEST</b> path (Dijkstra), not the shortest. Run the test <b>PC → WEB (80)</b> and notice in the animation that traffic takes the <b>longer path over the fast links</b> – because its total cost is lower. Then click ✓ Check.",
  tk_ospf_1: "PC → WEB (HTTP 80) passes via the cheapest path",
  tk_stp_t: "STP: a backup without a loop",
  tk_stp_g:
    "Three switches are wired in a <b>ring (a loop)</b>. With no protection a broadcast storm would erupt – but <b>STP has automatically blocked one port</b> (find it on the canvas by the amber <b>'STP block'</b>) and broken the loop. Verify that PC1 still reaches the <b>SERVER</b> (traffic flows over the STP tree). Tip: right-click to <b>down the active switch</b> and watch the block move to the backup. Then click ✓ Check.",
  tk_stp_1: "PC1 → SERVER (80) passes over the STP tree",
  tk_stpr_t: "A resilient network: dual uplinks + STP",
  tk_stpr_g:
    "A realistic redundant network: two <b>distribution</b> switches (DIST-1, DIST-2) and two <b>access</b> switches, each <b>dual-homed</b> upward. That makes plenty of loops – but <b>STP has handled them all</b> (on the canvas you’ll see amber 'STP block' on the backups and 'ROOT' on DIST-1). Verify that <b>PC reaches the SERVER</b> over the tree. Tip: right-click to down DIST-1 and watch STP switch to the backups. Then click ✓ Check.",
  tk_stpr_1: "PC → SERVER (80) passes through the redundant network",
  tk_ofix_2:
    "Traffic between the PC and the server does not pass through R-mgmt",
  tk_pfwd_2: "The firewall has a port forward: public 443 → WEB",
  tk_snat_3:
    "The server has static NAT on the firewall (its own public address)",
  tk_chweb_2: "The firewall still denies by default",
  tk_irule_2:
    "The firewall still denies by default (you did not wipe the whole policy)",
  tk_srt_2: "R1 has a route to 192.168.2.0/24 in its table",
  tk_chrt_2: "R1 has a route to 10.0.2.0/24 in its table",
  tk_chpv_2: "The port toward the switch is an access port in the right VLAN",
  tk_chtr_2: "The link between the switches is set as a trunk",
  tk_chvh_3: "The attacker’s port is pinned to access, not dynamic",
  tk_ofix_t: "OSPF: steer onto the fast path",
  tk_ofix_g:
    "The PC can’t reach the <b>SERVER</b> (port 80). Traffic now takes the shortest path through router <b>R-mgmt</b>, but that’s management-only and drops the traffic. The other, longer path via <b>R-A</b> and <b>R-B</b> is fine. Make the routers choose it: <b>right-click the link between R1 and R-mgmt</b>, open “Link properties…” and set a <b>higher cost</b> (e.g. 50). The routers will then pick the cheaper fast path. Then click ✓ Check.",
  tk_ofix_1: "PC → SERVER (80) passes via the fast path",
  tk_snat_t: "Expose a server from outside (static NAT 1:1)",
  tk_snat_g:
    "A server in the DMZ has two services (<b>HTTPS 443</b> and <b>SSH 22</b>) and nobody from the internet can reach it (the firewall protects it). Expose it with <b>static NAT (1:1)</b>: open the <b>firewall</b>, in the Rules tab find the <b>Static NAT</b> section and assign the server a public IP (e.g. 203.0.113.20). Unlike port forwarding, this exposes <b>all its services</b> at once. Then click ✓ Check.",
  tk_snat_1: "Internet → server HTTPS (443) passes",
  tk_snat_2:
    "Internet → server SSH (22) passes – static NAT exposes all ports",
  tk_hsrp_t: "A redundant gateway (HSRP/VRRP)",
  tk_hsrp_g:
    "The PC reaches the internet through <b>two gateways</b> – R1 and R2 – that together act as <b>one redundant gateway</b> (the HSRP/VRRP idea). Traffic flows through one of them. <b>Try the redundancy:</b> right-click <b>R1 → Simulate failure</b> and run the test again – traffic is <b>taken over by R2</b> and the network keeps running, with no outage. That’s first-hop redundancy.",
  tk_hsrp_1: "PC → internet (HTTPS 443) passes",
  tk_pfwd_t: "Expose a server from outside (port forward)",
  tk_pfwd_g:
    "The web server <b>WEB</b> (10.0.0.20, port 443) is inside behind the firewall and nobody from the internet can reach it (NAT/firewall protects it). Expose it: open the <b>firewall</b> and add a <b>port forwarding (DNAT)</b> rule – redirect inbound public IP:443 to <b>10.0.0.20:443</b>. Then click ✓ Check.",
  tk_pfwd_1: "Internet → WEB (HTTPS 443) passes",
  tk_chpv_t: "The PC is on the wrong network",
  tk_chpv_g:
    "An employee’s PC <b>can’t reach the file server</b>, even though both are on the <b>same network</b> and plugged in. It’s as if the PC were 'somewhere else'. Something is <b>misconfigured on its port</b> on the switch – find it and fix it. Then click ✓ Check. (Advanced mode – port settings live in the Ports tab.)",
  tk_chpv_1: "PC → file server (445) passes",
  tk_chdn_t: "The server is unreachable",
  tk_chdn_g:
    "Accounting reports they <b>can’t reach the server</b> in another VLAN at all. The network is wired correctly, but <b>one device on the path is in trouble</b>. Find it on the canvas and bring it back into service. Then click ✓ Check.",
  tk_chdn_1: "Accounting PC → server (445) passes",
  tk_chids_t: "Malware got through to the web",
  tk_chids_g:
    "Security reports that <b>malware</b> reached the <b>web server</b> from the internet, even though there’s a security <b>sensor (IDS/IPS)</b> at the entrance. The sensor only <b>logged</b> the attack but didn’t <b>stop</b> it. Switch it to the mode where it also <b>blocks</b> attacks (harmless traffic must still pass). Then click ✓ Check.",
  tk_chids_1: "Malware → WEB is blocked by the sensor",
  tk_chids_2: "Harmless traffic → WEB (443) still passes",
  tk_chrt_t: "A remote network is unreachable",
  tk_chrt_g:
    "A PC in <b>network A</b> can’t reach the <b>server in network B</b> (the networks are joined by two routers R1–R2). The link and server are fine – but <b>router R1 has no route in its routing table</b> to remote network B, so packets die there. Open <b>R1</b> (double-click) → <b>Routes</b> tab and add a static route to <b>10.0.2.0/24</b> (next hop = R2). (Advanced mode.) Then click ✓ Check.",
  tk_chrt_1: "PC (net A) → server (net B, 445) passes",
  tk_drt_t: "Give the router a default route",
  tk_drt_g:
    "Inside the company LAN everything works – the PC reaches the internal server. Outward it does not: router <b>R</b> uses manual routing and has not a single route in its table, so it has no idea what to do with traffic that is not headed for the network it knows. Open <b>R</b> (double-click) and add a <b>default route</b> – destination <b>0.0.0.0/0</b> via the <b>ISP router</b>. It is the one line that says “send everything else this way”.",
  tk_drt_1: "PC → internal server (443) works even with no route (same LAN)",
  tk_drt_2: "PC → internet (443) works thanks to the default route",
  tk_spl_t: "Split a network into three subnets",
  tk_spl_g:
    "The company got a single network, <b>192.168.10.0/24</b>, and has to split it into three: <b>offices</b> (50 devices), the <b>warehouse</b> (20) and <b>servers</b> (10). Right now all three carry a /24 mask, so they overlap each other and traffic has no way to decide. Open each network (double-click its bubble) and give it its <b>own range</b>: large enough for its devices, not needlessly large, and with no overlap with the others. Start with the biggest one.",
  tk_spl_1: "Office PC → file server (445) works",
  tk_spl_2: "Warehouse terminal → file server (445) works",
  tk_spl_3:
    "Three subnets inside the /24: each one fits, none is needlessly large and they do not overlap",
  tk_srt_t: "Write a static route",
  tk_srt_g:
    "The PC in <b>LAN A</b> (192.168.1.0/24) <b>can’t reach the server in LAN B</b> (192.168.2.0/24). Router <b>R1</b> uses static routing and only knows its <b>directly connected networks</b> – the route to LAN B is missing from its routing table, so it drops the packets. Fix it: 1) open <b>R1</b> (double-click) → the <b>Routes</b> tab, 2) click <b>+ Add route</b>, 3) destination network <b>192.168.2.0/24</b>, next hop <b>R2</b>, save. Then click ✓ Check.",
  tk_srt_1: "PC (LAN A) → server (LAN B, 443) passes",
  tk_chbip_t: "The PC won’t communicate – wrong IP",
  tk_chbip_g:
    "The PC <b>can’t reach the server</b>, even though both are on the <b>same network</b> and connected. It looks like the PC has a <b>manually set IP that doesn’t fit its subnet</b> (a typo in the address / mask). Open the PC (double-click) and fix its IP. (Advanced mode.) Then click ✓ Check.",
  tk_chbip_1: "PC → server (445) passes",
  tk_chdp_t: "The third PC gets no IP",
  tk_chdp_g:
    "Two office PCs work, but the <b>third (new) PC won’t connect</b> to anything. DHCP is on and the cabling is fine – but the <b>DHCP pool is too small</b> and ran out of addresses. Open the network and <b>enlarge the DHCP pool</b> (or give the PC a static IP). (Advanced mode.) Then click ✓ Check.",
  tk_chdp_1: "PC-3 → server (445) passes",
  tk_chps_t: "The new PC won’t pass through the switch",
  tk_chps_g:
    "We swapped the old PC for a new one, but the new one can’t reach the server through the <b>managed switch</b> at all – even though it’s on the <b>right network</b> and the cabling is fine. Something on the <b>access port</b> won’t let this particular PC through. Open the managed switch (double-click) → <b>Ports</b> tab and find it – the setting lives in the <b>Detail</b> of the specific port. Fix it. (Advanced mode.) Then click ✓ Check.",
  tk_chps_1: "New PC → server (445) passes",
  tk_chdh_t: "The PC gets no IP address",
  tk_chdh_g:
    "A PC in the office can’t connect to <b>anything</b> – not even the local file server on the <b>same network</b>. Cabling and the switch are fine and the server is up. The problem is the PC <b>gets no IP address</b>. Open the network (double-click) and find out why – then fix it. (Advanced mode.) Then click ✓ Check.",
  tk_chdh_1: "PC → file server (445) passes",
  tk_chgw_t: "The PC can’t get off its network",
  tk_chgw_g:
    "A PC in <b>VLAN10</b> can’t reach the <b>server in another VLAN</b> at all, even though routing (the L3 switch) is wired correctly and the server is up. The problem is in the <b>PC’s own settings</b> – open it (double-click) and check its network configuration, especially the <b>default gateway</b>. Fix it. (Advanced mode.) Then click ✓ Check.",
  tk_chgw_1: "PC → server (445) passes",
  tk_chtr_t: "A VLAN won’t cross between switches",
  tk_chtr_g:
    "The PC and server are <b>both in VLAN10</b>, but on <b>different switches</b> – and they can’t see each other at all. The link between the switches is <b>misconfigured</b>, so VLAN10 won’t cross it. Fix the port settings on that link (the <b>Ports</b> tab on the switch → port Detail) so the needed VLANs cross between the switches. Then click ✓ Check. (Advanced mode – the Ports tab.)",
  tk_chtr_1: "PC → VLAN10 server (445) passes",
  tk_chvh_t: "An attacker hops into the server VLAN",
  tk_chvh_g:
    "A security audit found a hole: a <b>user PC in VLAN10</b> can reach a <b>server in VLAN20</b> it shouldn’t – with no router between the VLANs. Its <b>access port on the managed switch is left in “dynamic” (DTP) mode</b>, so the attacker can negotiate a trunk and tag frames into another VLAN (<i>switch spoofing / VLAN hopping</i>). Open the managed switch (double-click) → <b>Ports</b> tab and <b>pin the attacker’s port to access VLAN10</b>. The user must still reach their file server in VLAN10. (Advanced mode.) Then click ✓ Check.",
  tk_chvh_1: "Attacker (VLAN10) → VLAN20 server (445) is blocked",
  tk_chvh_2: "User → VLAN10 file server (445) still passes",
  nVlanHop: "VLAN hopping – frame tagged into another VLAN (switch spoofing)",
  portDynWarn:
    "Insecure: a dynamic (DTP) port can be negotiated to a trunk – an attacker can hop into another VLAN. Pin the port to access.",
  tk_chrd_t: "A rogue DHCP hands out a wrong gateway",
  tk_chrd_g:
    "A security audit found a <b>MITM</b>: the attacker’s PC in the office runs a <b>rogue DHCP server</b> (handing clients a <b>wrong gateway</b> – itself) and also does <b>ARP spoofing</b> (forging ARP to redirect traffic to itself). The <b>client PC</b> then can’t reach the <b>server (445) in the server room</b> at all. Open the <b>managed switch</b> (double-click) → <b>Ports</b> tab and deploy both defenses: turn on <b>DHCP snooping</b> and <b>DAI</b>, and mark <b>trusted</b> only the port to the <b>legitimate DHCP server</b> (click that port → Detail and tick trusted; the attacker runs on an untrusted port, so it’s dropped). (Advanced mode.) Then click ✓ Check.",
  tk_chrd_1: "Client PC → server room server (445) passes",
  portSnoop: "DHCP snooping",
  portSnoopTitle:
    "Drops DHCP offers from untrusted ports – stops a rogue DHCP server.",
  portTrust: "trusted",
  portTrustTitle:
    "Trusted port: DHCP snooping / DAI allow DHCP offers and ARP here – set only on the port to the legitimate DHCP server / uplink.",
  portDai: "DAI (ARP inspection)",
  portDaiTitle:
    "Dynamic ARP Inspection: drops forged ARP from untrusted ports (validated against DHCP snooping bindings) – stops ARP spoofing.",
  nArpSpoof:
    "ARP spoofing (MITM) – off-network traffic redirected to the attacker; enable DAI",
  tk_chmulti_t: "The new branch is completely down",
  tk_chmulti_g:
    "A new branch: employees <b>can’t reach the servers</b> in another VLAN. <b>PC2</b> has no connection and neither does <b>PC1</b>. It looks like <b>several faults at once</b> – go through the network, find and fix <b>all</b> of them. (Once PC2 works, you’ve fixed one of them; PC1 has an additional problem.) Then click ✓ Check. (Advanced mode – one of the faults is in a port setting, the Ports tab.)",
  tk_chmulti_1: "PC2 → server (445) passes",
  tk_chmulti_2: "PC1 → server (445) passes",
  tk_chots_t: "IT can reach the PLC directly",
  tk_chots_g:
    "A security audit at the factory found a <b>hole</b>: an <b>office PC (IT LAN) can reach the PLC directly</b> (Modbus 502) in the OT LAN. That is serious – if malware from IT reached the controller, it could halt production or endanger people. Traffic between IT and OT goes through the <b>Inter-FW</b>, which currently permits everything. Configure it so <b>IT may reach only the Historian in the DMZ (SQL 1433)</b>, but <b>not the PLC directly</b> – while the historian must keep collecting data from the PLC (502) and the HMI must keep driving the PLC. Open the firewall (double-click), turn on <b>default deny</b> and add only the needed rules. Then click ✓ Check.",
  tk_chots_1: "IT-PC → PLC (502) is blocked",
  tk_chots_2: "IT-PC → Historian (1433) passes",
  tk_chots_3: "Historian → PLC (502) passes",
  tk_chots_4: "HMI → PLC (502) passes (local control)",
  tk_chrtpf_t: "The NAS is unreachable from the internet",
  tk_chrtpf_g:
    "A friend is supposed to download data from your <b>NAS (HTTPS 443)</b>, but can’t reach it from the internet – yet everything works inside the home LAN and the PC reaches the internet just fine. The home router does <b>NAT</b>: it drops unsolicited inbound traffic. Open the router (double-click) and set up <b>port forwarding</b> so public port 443 points at the NAS. Then click ✓ Check.",
  tk_chrtpf_1: "PC → internet (443) passes",
  tk_chrtpf_2: "Internet → NAS (443) passes",
  tk_chweb_t: "Web is down from the internet",
  tk_chweb_g:
    "Customers report the company <b>web can’t be opened from the internet</b> (HTTPS 443 to the WEB server in the DMZ). The server and network are up. Find why traffic doesn’t reach it and fix it – then click ✓ Check.",
  tk_chweb_1: "Internet → WEB (HTTPS 443) passes",
  tk_chvlan_t: "Accounting can’t reach the server",
  tk_chvlan_g:
    "<b>Accounting (a PC in VLAN10)</b> complains they <b>can’t reach the file server (445)</b> in VLAN20 at all. Both devices are plugged in and on. Work out what’s missing on the path and add it – then click ✓ Check.",
  tk_chvlan_1: "Accounting PC → file server (445) passes",
  tk_chguest_t: "Guests can reach the DB",
  tk_chguest_g:
    "A security audit found a <b>hole</b>: <b>guests (VLAN30) can reach the company DB (1433)</b> in VLAN20. Employees of course must reach the DB. Close the hole so a guest can’t reach the DB but an employee still can – then click ✓ Check.",
  tk_chguest_1: "Guest (VLAN30) → DB (1433) is blocked",
  tk_chguest_2: "Employee → DB (1433) still passes",
  tk_vd_t: "VLAN design: connect and isolate",
  tk_vd_g:
    "The final task of the course <i>Switching and VLANs</i> – it brings everything together. The network has four VLANs: workstations (V10), servers (V20), guests (V30) and IoT (V40). But so far <b>nothing routes between them</b> and there is no <b>isolation</b>. Your job: <b>1)</b> drag an <b>L3 switch</b> from the palette and connect it to the access switch (enables inter-VLAN routing). <b>2)</b> On the L3 switch add <b>ACL</b> rules that <b>deny Guest → Servers</b> and <b>IoT → Servers</b>. Goal: workstations can reach the servers, guests and IoT cannot. Then click ✓ Check.",
  tk_vd_1: "Workstation (V10) → server (SMB 445) passes",
  tk_vd_2: "Guest (V30) → server (445) is blocked",
  tk_vd_3: "IoT camera (V40) → server (445) is blocked",
  tk_shadow_t: "Shadowed rule: fix the ACL order",
  tk_shadow_g:
    "The ACL on Core L3 has a specific 'block Guest → servers' rule AFTER a broad 'permit all'. First match wins, so the block never applies. Open Core L3 and move the deny rule ABOVE the permit.",
  tk_shadow_1: "Guest → server (445) is blocked by the ACL",
  tk_shadow_2: "PC (workstation) → server (445) still passes",
  tk_vpn_t: "Remote-access VPN: let the client in",
  tk_vpn_g:
    "A remote employee connects over VPN to the internal server (RDP 3389), but the interface to the VPN pool is mistakenly in a zone with role 'outside' → the firewall blocks it. Open firewall → zones and change the 'VPN-pool' zone role to <b>VPN</b>.",
  tk_vpn_1: "VPN client → internal server (RDP 3389) passes",
  tk_vpn_2: "Directly from the internet → internal server is blocked",
  tk_custom_t: "Write a custom signature (DPI)",
  tk_custom_g:
    "An attack aimed at the web has a payload containing the string '/etc/passwd' (reading system files). No built-in category catches it – in the IPS (advanced mode) write a custom signature (DPI pattern) that catches that string. Benign traffic must pass.",
  tk_custom_1: "Attack with '/etc/passwd' is blocked by the IPS",
  tk_custom_2: "Benign request (GET /index.html) passes",
  tk_fs_t: "Connect the PC",
  tk_fs_g:
    "The router is already wired to the internet and the home network – only the <b>PC</b> needs connecting. <b>1)</b> Hover the edge of the <b>PC</b>, hold and drag a cable onto the <b>Router</b> (release = linked). <b>2)</b> On the right, in the <b>Traffic Test</b> panel, set Source = <b>PC</b> and Destination = <b>Internet</b> and click <b>▸ Test traffic</b> – you'll see the packet gets through. <b>3)</b> Click <b>✓ Check</b> at the top and the task is done.",
  tk_fs_1: "PC → Internet (HTTPS 443) passes",
  tk_ri_t: "Why we need an L3 switch",
  tk_ri_g:
    "Two networks are completely isolated – each has its own switch and nothing connects them. Drag an L3 switch from the palette and connect it to both switches. Then click ✓ Check.",
  tk_ri_1: "PC-A → PC-B (TCP 445) passes",
  tk_tn_t: "The routing table: which traffic goes where",
  tk_tn_g:
    "The router's table has two directly connected networks (192.168.1.0/24, 10.0.5.0/24) and a default route (0.0.0.0/0). Verify that traffic to the server takes the most specific route (/24) and traffic to the internet the default route. That is longest-prefix match. Then click ✓ Check.",
  tk_tn_1: "PC → Server (most specific /24 route) passes",
  tk_tn_2: "PC → Internet (default route 0.0.0.0/0) passes",
  tk_pt_t: "Ports decide",
  tk_pt_g:
    "The firewall only allows HTTPS (443). In the path test on the right, verify that HTTPS (443) passes and HTTP (80) is blocked – then click ✓ Check.",
  tk_pt_1: "PC → Web (HTTPS 443) passes",
  tk_pt_2: "PC → Web (HTTP 80) is blocked by the firewall",
  tk_sl_t: "Subnets in practice",
  tk_sl_g:
    "The network has two /26 subnets connected by an L3 switch (router). Verify that a PC in each subnet can reach the server in the other. Then click ✓ Check.",
  tk_sl_1: "PC-A → Server B (HTTPS 443) passes",
  tk_sl_2: "PC-B → Server A (HTTPS 443) passes",
  tk_nl_t: "NAT: private network to the internet",
  tk_nl_g:
    "The PC has a private address (192.168.1.10) and needs to reach the internet through a router with NAT. Verify the PC reaches the internet over both HTTPS (443) and HTTP (80). Then click ✓ Check.",
  tk_nl_1: "PC → Internet (HTTPS 443) passes",
  tk_nl_2: "PC → Internet (HTTP 80) passes",
  tk_wc_t: "Connect to Wi-Fi",
  tk_wc_g:
    "The network is already built – don't add anything from the palette. Just connect the computer to Wi-Fi: <b>double-click the computer (PC)</b> at the bottom, turn Wi-Fi on, pick HomeNet (password 1234) and connect. Then click ✓ Check.",
  tk_wc_1: "Computer reaches the internet over Wi-Fi",
  tk_hvs_t: "Hub vs. Switch",
  tk_hvs_g:
    "Run a path test from PC-A to PC-B (through the hub) – the steps show the hub flooding the frame to ALL ports. Then try PC-D to PC-E (through the switch) – it sends the frame only to the target port. Then click ✓ Check.",
  tk_hvs_1: "Traffic through the hub passes",
  tk_hvs_2: "Traffic through the switch passes",
  tk_wm_t: "Wi-Fi roaming and mesh (demo)",
  tk_wm_g:
    "A live coverage demo: the Router/AP broadcasts <b>HomeNet</b>, the upstairs mesh AP repeats the same SSID <b>with no cable</b> (mesh backhaul) and the garden repeater just repeats the signal (halving throughput). <b>Drag the phone around the canvas</b> and watch it re-associate (roam) to the nearest AP live – the dashed line shows the association. Nothing to fix here, just observe. Then click ✓ Check.",
  tk_wm_1: "The phone reaches the internet over Wi-Fi",
  tk_lag_t: "EtherChannel: bundle two links into one",
  tk_lag_g:
    "There are <b>two links</b> between the access switch and the core, but STP <b>blocks</b> one of them – the capacity stays at a single link while the other idles as a backup. Bundle them into an <b>EtherChannel</b>: right-click a link and choose to merge it into a bundle. Then both run at once as one logical link – more capacity <b>and</b> redundancy.",
  tk_lag_1: "Both links form one bundle and the PC reaches the server",
  tk_qc_t: "Stop the spread: isolate the compromised machine",
  tk_qc_g:
    "The log shows <b>PC-04</b> trying one connection after another against the file server – it looks like a compromised machine spreading further. Your job is <b>containment</b>: right-click <b>PC-04</b> and choose <b>Isolate (quarantine)</b>. The device gets cut off from the network, but <b>the rest of the company must keep running</b> – other machines still reach the server and the internet. Powering off the whole switch would stop the spread too, but it would take down the entire floor.",
  tk_qc_1: "The compromised PC-04 can no longer reach the file server",
  tk_qc_2: "Other machines still reach the server (only PC-04 is isolated)",
  tk_qc_3: "The rest of the offices still have internet",
  tk_spf_2: "The new path runs through SW-spare (around the dead core)",
  tk_slow_2: "The new path runs through SW-spare, not the congested link",
  tk_d1x_t: "The meeting-room socket lets anyone in",
  tk_d1x_g:
    "Anyone can plug a laptop into the meeting-room socket and they are on the <b>company network</b> – nothing authenticates them. Open the <b>managed switch</b> (double-click) and switch <b>802.1X</b> on for <b>both access ports</b> – the company PC and the visitor laptop. Tick <b>802.1X</b> on each and pick the <b>RADIUS server</b>. (In practice authentication goes on every socket, not just the suspicious one.) The company PC authenticates and carries on working. And keep the other side of this coin in mind: <b>when RADIUS goes down, company machines cannot authenticate either</b> – which is why it gets doubled in practice.",
  tk_d1x_1: "Company PC → file server (445) works",
  tk_d1x_2: "The visitor laptop cannot get onto the network",
  tk_d1x_3: "Both access ports run 802.1X against the RADIUS server",
  tk_qos_t: "Calls stutter on a congested link",
  tk_qos_g:
    "Users complain that <b>calls stutter</b>. The connection works, but the uplink between the access switch and the core is <b>congested</b> – and voice tolerates delay badly, while a file copy does not even notice it. Adding capacity is not an option right now. <b>Right-click the link between SW-access and SW-core</b> and pick <b>“Link properties…”</b> – that dialog also holds <b>Voice priority (QoS)</b>. Switch it on. Note what that means: the calls get fixed, but <b>files will not copy any faster</b> – priority is not magic, it is the order in the queue.",
  tk_qos_1b: "PC → file server still works",
  tk_qos_2: "…but it still feels the congestion – only voice got priority",
  tk_d1x_4:
    "The visitor laptop was turned away by 802.1X, not by something else",
  tk_qos_1: "Phone → PBX (SIP) no longer suffers from congestion",
  tk_qos_3: "The link is still congested, it just gives voice priority",
  tk_slow_t: "It works, but it is slow",
  tk_slow_g:
    "Users complain that files take forever to open – but the <b>connection works</b>, the path test says it passes. Look at the warning in the result: the only path to the servers crosses a <b>congested link</b> between the access switch and the core. An unplugged <b>SW-spare</b> waits on the canvas: run a second path through it (<b>SW-access → SW-spare → SW-core</b>) and <b>shut down the congested link</b>: double-click <b>SW-access</b> → physical ports → click the port that leads to <b>SW-core</b> → <b>Port state → down</b>. Traffic then takes the free path (you shut the port on the switch, not the cable – exactly like the shutdown command on a real interface).",
  tk_slow_1:
    "The PC reaches the server, and no longer over the congested link",
  tk_sysb_t: "Logs never arrive: the firewall holds port 514",
  tk_sysb_g:
    "A server in the offices should send events to the <b>log collector</b> in the datacenter – but the <b>Syslog</b> panel only keeps counting “event not delivered”. Syslog rides on <b>UDP port 514</b> and the firewall between the offices and the datacenter only permits web traffic (443). Add a rule that permits <b>UDP 514 from Offices to Datacenter</b> – and nothing more, so the rest of the datacenter stays closed.",
  tk_sysb_1: "The server delivers logs to the collector (UDP 514)",
  tk_sysb_2: "The PC still reaches the internet",
  tk_sysb_3: "File sharing into the datacenter stays closed",
  tk_sysb_4: "And DNS too – you really opened syslog only",
  tk_lay_t: "Layered defense: put a WAF in front of the web",
  tk_lay_g:
    "The firewall only allows port 443 to the web server – but an <b>application attack</b> (SQL injection) also travels over 443 and the firewall cannot see into the content. The DMZ has a <b>decoy (honeypot)</b> that reports anyone who touches it. What is missing is the layer that stops the attack itself: drop a <b>WAF</b> onto the canvas and wire it <b>between the firewall and the DMZ switch</b>, so all web traffic passes through it.",
  tk_lay_1: "The WAF stops the SQL injection against the web server",
  tk_lay_2: "Ordinary web traffic (443) still passes",
  tk_n1m_t: "The redundancy map: what survives a failure",
  tk_n1m_g:
    "The network looks doubled up – two firewalls in an <b>HA pair</b>, each with its own uplink. But between them and the users sits a <b>single switch</b>. Run the <b>Resilience test (N-1)</b> under “Advanced: analysis & simulation” and read the map: the firewalls survive a failure, the switch is a <b>single point of failure</b>. Try right-click → Simulate failure on FW-A and verify the connection holds.",
  tk_n1m_1: "The PC reaches the internet through the active firewall",
  tk_dio_t: "Data diode: let data out, commands never in",
  tk_dio_g:
    "The historian in the office should collect data from the plant, but the <b>data diode</b> points the wrong way – it passes traffic <b>into</b> the plant. That is exactly the dangerous direction: IT could send a command to a PLC. Open the <b>diode</b> and set its <b>output side</b> so data flows from the plant to IT (and the opposite direction is physically impossible).",
  tk_dio_1: "The PLC sends data to the historian (plant → IT)",
  tk_dio_2:
    "The diode passes nothing from IT into the plant (a command to the PLC fails)",
  tk_wan_t: "ISP outage: add a backup uplink",
  tk_wan_g:
    "The company has a single link to <b>ISP A</b> and it is currently down – nobody can reach the internet. A second provider, <b>ISP B</b>, is waiting on the canvas. Cable it to the router; the router is in <b>failover</b> mode, so when the primary link fails traffic automatically takes the backup.",
  tk_wan_1: "The PC reaches the internet via the backup provider",
  tk_sto_t: "Broadcast storm: turn on STP",
  tk_sto_g:
    "There are <b>two links</b> between the switches and <b>STP is off</b>. Frames circle the loop forever, the network is swamped and nothing gets through – a classic <b>broadcast storm</b>. Turn on <b>STP</b> on both switches (switch detail): it blocks one of the links and keeps it as a backup. Tip: background traffic (broadcast) runs on its own in advanced mode – start the live simulation and watch the storm with your own eyes. (This task runs in advanced mode – that is where STP is configured.)",
  tk_sto_1: "The PC reaches the server (the loop is under STP control)",
  tk_dal_t: "DNS alias: add a CNAME",
  tk_dal_g:
    'The web server runs under the name <span class="mono">web.acme.local</span>, but people type <span class="mono">www.acme.local</span> – and that name does not resolve. Open the <b>DNS</b> server and add a <b>CNAME</b> record pointing <span class="mono">www.acme.local</span> to <span class="mono">web.acme.local</span>. Then pick the destination by name in the path test.',
  tk_dal_1: "www.acme.local resolves to WEB and the connection passes",
  tk_went_t: "802.1X: Wi-Fi asks RADIUS",
  tk_went_g:
    "The company SSID <b>Corp</b> uses <b>802.1X</b> – instead of a shared password, every sign-in is verified by a <b>RADIUS server</b> in the datacenter. But nobody can connect: the firewall between the offices and the datacenter <b>doesn't pass UDP port 1812</b>, so the AP can't reach RADIUS (you can see the warning on the AP). Add a firewall rule to <b>permit UDP 1812 from Offices to Datacenter</b>, then <b>connect the NTB</b> to the Corp network (NTB detail → Wi-Fi) and verify with the test that it gets out via the enterprise Wi-Fi.",
  tk_went_1:
    "The NTB signs in via 802.1X (RADIUS reachable) and reaches the internet",
  tk_vrad_t: "The VPN lets nobody in: RADIUS is down",
  tk_vrad_g:
    "Users haven't been able to sign in to the VPN all morning. The firewall is fine, the tunnel is configured – but the VPN authenticates users against a <b>RADIUS server</b>, and that server is <b>powered off</b>. This is exactly what an authentication-infrastructure outage looks like: the network runs, the VPN \"doesn't work\". Right-click <b>RADIUS</b> → <b>Restore service</b> and verify with the test that the VPN client reaches the internal server.",
  tk_vrad_1:
    "After authentication the VPN client reaches the internal server",
  tk_wsec_t: "Open Wi-Fi: turn on WPA2/WPA3",
  tk_wsec_g:
    "The company Wi-Fi <b>Office</b> is <b>open</b> – it works, but traffic flies through the air unencrypted and the path test warns you about eavesdropping. Open the <b>AP</b> and set <b>WPA2 or WPA3 security</b> with a password on the SSID. Then verify with the test that the laptop reaches the internet over a secured network.",
  tk_wsec_1: "The NTB reaches the internet over Wi-Fi",
  tk_wsec_2: "The Wi-Fi is secured (WPA2/WPA3), not open",
  tk_etw_t: "Evil twin: a rogue AP with the same name",
  tk_etw_g:
    'A <b>second AP with the same SSID</b> "CafeWifi" showed up in the café – open, with a stronger signal, and owned by an attacker. The laptop now hangs on it and its traffic crosses the attacker\'s network. Open the <b>NTB</b>, disconnect and reconnect to the <b>real café AP</b> (it asks for the password <span class="mono">kafe123</span> – the real network is secured, the twin is not). Then verify with the test that it goes out via the real AP.',
  tk_etw_1:
    "The NTB is connected to the real café AP and reaches the internet",
  tk_bpdu_t: "A rogue switch took over as root bridge",
  tk_bpdu_g:
    "Somebody plugged their <b>own switch</b> in under a desk to get more sockets. But that box has the <b>lowest priority</b>, so Spanning Tree elected it <b>root bridge</b> – and the whole network now computes its paths around a desk under the stairs. Open <b>SW-access</b> (double-click), find the port in the strip that leads to the rogue switch, and switch on <b>BPDU guard</b> in its detail. An access port that hears a switch is then shut down.",
  tk_bpdu_1: "PC → server (445) works",
  tk_bpdu_2: "Core is the root bridge again, not the rogue switch",
  tk_bpdu_3: "The port to the rogue switch has BPDU guard on",
  tk_spf_t: "A single point of failure: build a backup path",
  tk_spf_g:
    "The whole path from the office to the server runs through a single <b>core switch</b> – and it just failed. A classic <b>single point of failure</b>: one device, and everything stops. An unplugged <b>SW-spare</b> is waiting on the canvas – run cables so traffic reaches the server even without the core switch (<b>SW-access → SW-spare → SW-servers</b>), and verify with the traffic test that the <b>PC</b> reaches <b>WEB</b> (port 443).",
  tk_spf_1: "The PC reaches WEB (443) even with the core switch down",
  tk_haf_t: "Firewall HA pair: failover",
  tk_haf_g:
    "Two firewalls form an <b>HA pair</b> – <b>FW-A</b> works, <b>FW-B</b> waits as a standby (they share a virtual IP). LAN traffic now flows through the active FW-A. Try a <b>failover</b>: right-click <b>FW-A</b> → <b>Simulate failure (HA)</b>. The standby FW-B takes over instantly and the connection <b>survives</b> – verify with the traffic test again. (Right-click → Restore service to undo.)",
  tk_haf_1:
    "The PC reaches the internet (via the active FW; the standby takes over on failure)",
  tk_lbw_t: "Load balancer: spreading the load",
  tk_lbw_g:
    "A <b>load balancer</b> with a single <b>VIP :443</b> sits in front of two web servers. Internet traffic goes to the VIP and the LB <b>spreads</b> it across WEB-1 and WEB-2 (round-robin). Run the test several times and watch which backend the LB picked in the path. Try another <b>algorithm</b> (double-click the LB) or take one web server down (right-click → Simulate failure) – the LB drops it and sends everything to the healthy one.",
  tk_lbw_1: "Traffic to VIP :443 gets through (the LB picks a backend)",
  tk_c2d_t: "Catch the C2 channel on the IPS",
  tk_c2d_g:
    "One PC on the company LAN is compromised and sends a <b>C2 beacon</b> out, hidden in DNS – a classic firewall lets it pass (DNS is commonly allowed). Your task: on the <b>IPS</b> enable the <b>C2 (botnet)</b> threat category so the covert channel is blocked. Be careful not to block normal encrypted traffic (HTTPS 443) going out. (Tip: pick the malicious C2 content in the traffic test.)",
  tk_c2d_1: "The C2 beacon is blocked on the IPS",
  tk_c2d_2: "Normal HTTPS (443) passes out",
  tk_s2s_t: "Site-to-site VPN: two sites, one network",
  tk_s2s_g:
    "The branch and headquarters are joined by a <b>site-to-site tunnel</b> between VPN gateways – to the devices it is one company network, no client turns anything on. Watch: a branch PC reaches the HQ server <b>through the tunnel</b> (the route shows the encrypted transit), while the internet cannot get in. Test it in the traffic test and inspect the route steps.",
  tk_s2s_1: "The branch PC reaches the HQ server (via the tunnel)",
  tk_s2s_2: "Nobody reaches the server from the internet",
  tk_s2s_3: "The branch has internet as usual",
  tk_wgs_t: "Guest Wi-Fi for a visitor",
  tk_wgs_g:
    "The visitor is on your main SSID <b>Office</b> – they can see your NAS! Give them their own Wi-Fi: add a <b>second SSID ‘Guest’</b> on the router mapped to the <b>Guests</b> network, reconnect the visitor's phone to Guest (double-click the phone → Wi-Fi) and in the router's rules allow guests only the internet (<b>Guests → Internet</b> permit; nothing into the home network – the default denies). The visitor's internet must work.",
  tk_wgs_1: "The visitor's phone can NOT reach the NAS",
  tk_wgs_2: "The visitor's phone has internet over Wi-Fi",
  tk_wgs_3: "Your PC still reaches the NAS",
  tk_rap_t: "Rogue AP: a hole behind the firewall",
  tk_rap_g:
    "An employee plugged their own <b>passwordless</b> AP into the switch for better signal. Watch what that does: an attacker in the parking lot joins the open <b>FreeWifi</b> and lands straight <b>inside the company network</b> – the edge firewall never stood in their way. Test both directions in the traffic test and inspect the path.",
  tk_rap_1:
    "The attacker reaches the server via the rogue AP (that's the hole!)",
  tk_rap_2:
    "From the internet the firewall blocks the attack – the perimeter holds",
  tk_rap_3: "The office PC has internet as usual",
  tk_wk2_t: "Wi-Fi connection (L2)",
  tk_wk2_g:
    "Connect the computer to AP “Office” (password pass). The AP acts as an L2 bridge onto the company network. The network is already built – don't add anything, just <b>double-click the computer (PC)</b>, pick Office and connect. Then click ✓ Check.",
  tk_wk2_1: "Computer reaches the internet via Wi-Fi and the L2 switch",
  tk_mac_t: "Look inside the switch’s MAC table",
  tk_mac_g:
    "A switch does not learn addresses out of thin air – it records <b>which address it saw on which port</b>, and forwards frames only where they belong. You configure nothing here: run both tests, then open <b>SW-A</b> (double-click) and find the <b>MAC table</b>. Notice that PC-C and PC-D both sit behind a <b>single port</b> – the one leading to SW-B. The switch cannot see how many machines hide behind it; it only knows the port.",
  tk_mac_1: "PC-A → server (445) works",
  tk_mac_2: "PC-C (behind SW-B) → server (445) works",
  tk_opn_t: "See what is exposed from the internet",
  tk_opn_g:
    "There <b>is</b> a firewall in this network – it is just set to <b>“allow everything”</b>. A box on the network edge protects nothing by itself; what protects you is what is written in it. You configure nothing here: run all three tests in turn and notice what gets through. File sharing and remote desktop on the internal server are open to the whole internet. This is exactly the situation the rest of the course fixes.",
  tk_opn_1: "Internet → file server, file sharing (445) gets through",
  tk_opn_2: "Internet → file server, remote desktop (3389) gets through",
  tk_opn_3: "PC → internet (443) gets through",
  tk_fo_t: "Firewall in action",
  tk_fo_g:
    "This task is about observing — you do not configure anything. Test traffic from the internet to the web server on port 443 (HTTPS) and then on port 80 (HTTP). You will see the firewall allow 443 and block 80 — because its rule permits HTTPS only. Then click ✓ Check.",
  tk_fo_1: "HTTPS (443) passes the firewall",
  tk_fo_2: "HTTP (80) is blocked by the firewall",
  btnFeedbackTitle: "About · roadmap · feedback",
  btnFeedbackLabel: "Feedback",
  btnThemeTitle: "Dark / light mode",
  topoNameLabel: "Topology name",
  themeLightLbl: "Light mode",
  themeDarkLbl: "Dark mode",
  wTitle: "Welcome to networksim",
  wIntro:
    "networksim is a <b>computer-network simulator with a built-in learning platform</b>. In the <b>courses</b> (from the basics to advanced level) you’ll understand how networks work — visual, step by step and jargon-free. In the <b>simulator</b> you then build and test your own network: where traffic flows, how far an attacker reaches, and what survives a failure. Not sure where to start? Take the course.",
  wStep1:
    "Drag devices from the left palette onto the canvas (switches, firewall, hosts…).",
  wStep2:
    'Draw links by dragging from the "+" port on a node\'s edge. Double-click = device settings.',
  wStep3:
    'On the right, pick a source and destination and run a path test (the basic test is a ping). Blast-radius and the resilience (N-1) test are under the "Advanced: analysis & simulation" section; start the live traffic simulation with the button below it.',
  wStep4:
    'Fastest start: load a ready-made network from "Examples ▾" at the top and explore how it works.',
  wCourseCta: "Start the courses (from the very basics)",
  wSimLead: "Prefer to poke around the simulator?",
  wClose: "Close",
  btnHowStart: "How to start",
  btnProgress: "Progress backup",
  learnProgress: "What I know",
  learnProgressSub: "your progress in courses and tasks",
  progOvTitle: "What I know",
  progOvLead2:
    "Courses finished: <b>{0}</b> of {1} · tasks completed: <b>{2}</b> of {3}.",
  tk_iarp_t: "Half the floor cannot get out",
  tk_iarp_g:
    "Something is going on in the network and all you have is what users report. Find it and stop it: use <b>Traffic &amp; logs</b>, the <b>ARP tables</b> in a device detail, the <b>connections overview</b> and the <b>Topology check</b>. Users in one office report that “the internet is down” – while colleagues a few desks away are fine. You are done when traffic flows normally again and the culprit can do no harm.",
  tk_iarp_1:
    "The incident is stopped (click for an explanation of what was going on)",
  tk_idhcp_t: "New devices on floor 2 do not work",
  tk_idhcp_g:
    "Something is going on in the network and all you have is what users report. Find it and stop it: use <b>Traffic &amp; logs</b>, the <b>ARP tables</b> in a device detail, the <b>connections overview</b> and the <b>Topology check</b>. Anything switched on or restarted on floor 2 never reaches the network. Devices running since morning keep working. You are done when a newly connected device gets the right settings.",
  tk_idhcp_1:
    "The incident is stopped (click for an explanation of what was going on)",
  tk_idns_t: "The intranet does not look right",
  tk_idns_g:
    "Something is going on in the network and all you have is what users report. Find it and stop it: use <b>Traffic &amp; logs</b>, the <b>ARP tables</b> in a device detail, the <b>connections overview</b> and the <b>Topology check</b>. Users type the correct intranet name but something foreign opens. By IP address everything works fine. You are done when the name leads where it belongs again.",
  tk_idns_1:
    "The incident is stopped (click for an explanation of what was going on)",
  tk_itwin_t: "Laptops join the wrong Wi-Fi",
  tk_itwin_g:
    "Something is going on in the network and all you have is what users report. Find it and stop it: use <b>Traffic &amp; logs</b>, the <b>ARP tables</b> in a device detail, the <b>connections overview</b> and the <b>Topology check</b>. People connect to the familiar company Wi-Fi but cannot reach the company servers – and nothing protects what they send. You are done when only the genuine network is left.",
  tk_itwin_1:
    "The incident is stopped (click for an explanation of what was going on)",
  tk_iexf_t: "Something is leaving one workstation",
  tk_iexf_g:
    "Something is going on in the network and all you have is what users report. Find it and stop it: use <b>Traffic &amp; logs</b>, the <b>ARP tables</b> in a device detail, the <b>connections overview</b> and the <b>Topology check</b>. A pair that was not there before shows up in the connections overview, heading out to the internet. Nobody is using that computer. You are done when the outflow stops.",
  tk_iexf_1:
    "The incident is stopped (click for an explanation of what was going on)",
  tk_irule_t: "The internet can see more than it should",
  tk_irule_g:
    "Something is going on in the network and all you have is what users report. Find it and stop it: use <b>Traffic &amp; logs</b>, the <b>ARP tables</b> in a device detail, the <b>connections overview</b> and the <b>Topology check</b>. Tests suddenly pass where they should not – straight from the internet to the servers. It is as if segmentation was gone. You are done when the firewall holds again.",
  tk_irule_1:
    "The incident is stopped (click for an explanation of what was going on)",
  catIncident: "Incidents",
  progOvCourses: "Courses in progress and finished",
  progOvStarted:
    "Courses in progress: {0} – just finish them, the progress is remembered.",
  progOvNothing:
    "Nothing finished yet – start a course or a task and this page will fill up.",
  ctxCapture: "Capture traffic (tap)",
  capTitle: "Link capture",
  capIntro:
    "A tap on the cable shows what an attacker would see there. Metadata (who talks to whom, which service) is <b>always</b> visible – encryption hides only the content. Let traffic run and watch what is readable.",
  capEmpty:
    "Nothing has passed yet – let the simulation run or test across this link.",
  capPlain: "readable!",
  capEnc: "encrypted",
  capMeta: "metadata only",
  wBtnFirstTask: "Try the first task (guided)",
  coachTitle: "The first task, step by step",
  coachS1:
    "Drag a cable from the <b>PC</b> to the <b>Router</b> – hover the PC edge, hold and drag.",
  coachS2:
    "On the right set Source = <b>PC</b>, Destination = <b>Internet</b> and click <b>Test traffic</b>.",
  coachS3:
    "Solved – confirm it with the <b>Check</b> button in the task bar.",
  coachHide: "Hide",
  drillRevArp:
    "What happened: a machine (PC-107) appeared in the user VLAN spoofing ARP – posing as the gateway so neighbors' traffic flows through it. The trace was in any victim's ARP table (gateway row flagged as spoofed), in the audit, and in failing outbound tests. Fix: quarantine the attacker.",
  drillRevDhcp:
    "What happened: a rogue DHCP server appeared on floor 2 (PRN-207 – posing as a printer), handing clients the attacker's gateway. The trace was in the Topology check (critical finding) and in floor-2 clients losing their proper gateway. Fix: quarantine, or DHCP snooping on the switch.",
  drillRevRule:
    "What happened: a planted permit any-any rule showed up at the top of the firewall – everything passed everywhere, including internet to the servers. The trace was in the Topology check and in tests suddenly passing where they should not. Fix: delete the foreign rule in the firewall settings.",
  drillRevDns:
    "What happened: someone rewrote the DNS record of the internal web to the attacker's server (SRV-CACHE-02 on floor 2) – users typed the right name and landed on a foreign machine. Trace: a test by name pointed elsewhere, and a new pair appeared in the connections overview. Fix: restore the DNS record, or isolate the attacker.",
  drillRevTwin:
    "What happened: a second access point appeared with the same Wi-Fi name, but open and on a different network – a classic evil twin. Trace: the Topology check reports the same SSID from multiple APs with different security. Fix: turn the foreign AP off or isolate it.",
  drillRevExfil:
    "What happened: workstation PC-104 was regularly carrying data out (C2 traffic to the internet). Trace: a new PC → internet pair in the connections overview that was not there before, plus an alert on the probe. Fix: quarantine the workstation.",
  progTitle: "Progress backup",
  progIntro:
    "Your progress (finished course modules, quizzes and tasks) lives only in this browser. Download it to a file – and load it again in another browser or after clearing data. Import never deletes anything, it only adds.",
  progStats: "Currently: {0} finished modules/quizzes · {1} tasks.",
  progExport: "Download backup",
  progImport: "Load backup",
  progExported: "Backup downloaded.",
  progImported: "Progress restored from the backup.",
  progBadFile: "This does not look like a networksim progress backup.",
  wWhatsNewOpen: "What's new",
  wTutorialCta: "Tour the simulator interface",
  wPrivacy:
    "Everything runs in your browser — no sign-up. Topologies are stored locally and you can export or import them as a file anytime.",
  wDontShow: "Don't show this again",
  wBtnStart: "Start from scratch",
  wBtnExample: "Explore an example network",
  wBack: "← Back to welcome",
  portConnectTip: "connect a cable",
  wnMoreLink: "More news in About",
  eaBannerTitle: "Feedback welcome",
  eaBannerMsg:
    "networksim is in early development – tell me about bugs, ideas or missing features.",
  eaBannerCta: "Give feedback",
  eaBannerDismiss: "Dismiss",
  eaBannerClose: "Close",
  eaWelcomeLine:
    "The app is in active development – something broken or missing? Let me know (bugs, ideas, what's missing).",
  fbNudgeMsg: "Anything unclear or missing?",
  fbNudgeCta: "Send feedback",
  fbTabFeedback: "Feedback",
  fbTabRoadmap: "Roadmap",
  fbDiagTitle: "Having a problem? Copy the diagnostics",
  fbDiagHint:
    "Pasting this into the message field tells me the version, browser and screen size, so I can reproduce what you see.",
  fbDiagBtn: "Copy diagnostics",
  fbDiagShow: "Show text",
  fbDiagHide: "Hide text",
  fbDiagCopied: "Diagnostics copied — paste them into the message field.",
  fbDiagFallback:
    "Copy blocked by the browser. Select the text and copy it manually.",
  fbFormNote:
    "The feedback form has not been connected yet. The form URL is still the placeholder in js/19-boot.js (GOOGLE_FORM_URL).",
  abRoadH: "Roadmap",
  abSoon: "coming soon",
  abIdea: "considering",
  abDone: "done",
  abGoal: "long-term goal",
  abRoadCatDone: "Done",
  abRoadCD1: "Learning tasks (real-world scenarios) + interface tour",
  abRoadCD2: "Simple / advanced mode",
  abRoadCD3:
    "DPI – traffic content inspection on IDS/IPS; attacks in the live simulation",
  abRoadCD8:
    "Cleaner UI – unified header (mode/theme), tabbed firewall editor",
  abRoadCD6: "Topology overview",
  abRoadCD7: "Snap to grid",
  abRoadCD4: "PNG/SVG export and topology sharing by link",
  abRoadCD5: "Undo / redo",
  abRoadCD9: "Improved mobile controls",
  abRoadV1a: "Visual topology editor (drag & drop), zoom/pan, auto-layout",
  abRoadV1b: "Networks / VLANs with subnets, L3 routing and inter-VLAN ACLs",
  abRoadV1c:
    "Firewall – zones and rules (first-match) plus simple mode, stateful return traffic, VPN termination",
  abRoadV1d: "IDS/IPS and load balancer (algorithms, HA / failover)",
  abRoadV1e: "Traffic path test (step by step) + quick service probes",
  abRoadV1f:
    "Reachability matrix, blast-radius (attacker reach), N-1 resilience test (single point of failure)",
  abRoadV1g: "Live traffic simulation",
  abRoadV1h:
    "Light/dark theme, welcome screen, example topologies",
  abRoadV3a:
    "Two interactive networking courses from the ground up – the course <i>Why networks exist and how data travels</i> (how networks work) and the course <i>ISO/OSI and TCP/IP: the network map</i> (ISO/OSI and TCP/IP); visual, step by step and jargon-free",
  abRoadV3b:
    "A quiz after every lesson with instant feedback; progress saved locally in your browser",
  abRoadV3c:
    "The course linked to the simulator and learning tasks; a searchable glossary",
  abRoadV3d:
    "Real Wi-Fi – an AP can broadcast multiple SSIDs (corporate + guest); a device joins the NEAREST AP and roams live to the nearest one as you drag it across the canvas. A router or firewall can broadcast Wi-Fi too, as a home all-in-one",
  abRoadV3f:
    "New device: Managed L2 switch – an L2 switch that enforces an ACL but does not route between VLANs",
  abRoadV3g:
    'Cleaner UI – the device palette and the test panel tuck advanced items into collapsible "Advanced" sections; the basic test is a ping and the quick service probes are advanced-only. Example networks (Enterprise, Smart home, Flat) reworked: more Wi-Fi SSIDs and managed switches with ACLs',
  abRoadV3e:
    "New device: hub; new learning tasks; canvas notes; unified wording and minor UI improvements",
  abRoadV4a:
    "Eight new interactive courses (3–10), now also for more advanced networkers: VLANs and switching, routing and IP addressing, firewalls and zones, redundancy and Spanning Tree, OSPF, advanced security (DPI/IDS/IPS), and in-depth courses on the switch and the router.",
  abRoadV4b: "New learning tasks and fixes to existing ones.",
  abRoadV4c:
    "Port configuration – access/trunk, port security, a physical port count, shutdown and a clearer detail; SFP/SFP+ uplinks.",
  abRoadV4d:
    "OSPF by link cost and Spanning Tree – loop blocking with the blocked port and root bridge shown; a visible TTL in the test result.",
  abRoadV4e:
    "Manual static routing tables on routers, L3 switches and the firewall.",
  abRoadV4f:
    "Inbound port forwarding (DNAT) and a real stateful firewall (only the reply to a requested connection passes).",
  abRoadV4g:
    "EtherChannel/LAG – bundling parallel links into one port-channel (more capacity and redundancy).",
  abRoadV4h:
    "Backup internet (multi-WAN) – several ISPs, failover and load balancing.",
  abRoadV4i:
    "Wi-Fi improvements – AP uplink (cable, mesh, repeater); phones and tablets connect over Wi-Fi only.",
  abRoadV4j:
    "Advanced realism (advanced mode) – real IPs, MAC/ARP, DHCP, NAT/PAT and longest-prefix right in the test result; multiple NICs on servers.",
  abRoadV4k:
    "Minor UI improvements – a clearer interface, better controls on mobile too, and accessibility.",
  abRoadV7a:
    "New courses: <b>DHCP</b> – how a device comes by an address at all, from the four DORA messages through lease time and reservations to a drained range and a rogue server on the network. And <b>splitting a network into subnets</b> – how many addresses you really need, where a subnet starts and ends, and what breaks your own plan.",
  abRoadV7b:
    "Hands-on tasks where there used to be only text: split a flat network into VLANs, build a trunk between switches, add a default route, look inside the MAC table – and walk a network with no rules at all to see just how much gets through.",
  abRoadV7c:
    "<b>TLS inspection</b> on the IDS/IPS sensor: the sensor cannot see into encrypted traffic until you turn it on. And the cost is right there – it can read the content only because every client has to trust the company authority.",
  abRoadV7d:
    "<b>802.1X on the socket</b>: the port opens only after authentication against RADIUS. A visitor laptop has nothing to identify itself with and stays out – and when RADIUS goes down, company machines cannot authenticate either. You get to try both sides of that coin.",
  abRoadV7e:
    "<b>BPDU guard</b>: an access port shuts down when a switch shows up behind it, so a foreign box under a desk cannot take over as root bridge and reroute the traffic.",
  abRoadV7f:
    "<b>Voice priority (QoS)</b> on a congested link: calls stop stuttering, but file copies get no faster – priority is not magic, it is the order in the queue. The test result tells you so.",
  abRoadV7g:
    "You can set a lesson aside: a click beside it folds it into a bar under the top strip, and one click takes you back exactly where you stopped – the bar even survives a browser restart. And the course you are in the middle of is the first item in the course overview.",
  abRoadV7h:
    "An unfinished task survives a page reload and a shared link – its bar comes back together with the topology.",
  abRoadV7i:
    "On mobile <b>press and hold</b> opens the same menu as a right click, so you can delete a link or a device, isolate a machine or set up a link. Tasks and courses adapt too: on a touch screen they say “press and hold” instead of right-click.",
  abRoadV7j:
    "The incident drills are now ordinary tasks in their own category, so you find them among the rest instead of hunting for a separate mode. The school and e-shop example networks are rebuilt so there is something to explore in them.",
  abRoadV7k:
    "Small things that used to annoy: a stray click beside a lesson or quiz no longer closes it (there is an ✕ in the header), labels on the canvas move with the node you drag, a backup DNS can be set in the Networks/VLANs panel, and a congested link has its tooltip where you can actually click.",
  abRoadV6a:
    "Easier first steps – in simple mode addresses, masks and gateways set themselves, so you can focus on what matters. And the truth about the network holds in both modes: a wrong address, a conflict, a bad gateway, spoofed ARP or a locked port are flagged always, not only in advanced.",
  abRoadV6b:
    "Real Wi-Fi security: an SSID now has an open / WPA2 / WPA3 / 802.1X setting. A connection over an open network warns you about eavesdropping in the test, and the network list shows at a glance which one is secured.",
  abRoadV6c:
    "Enterprise authentication with RADIUS – a server running RADIUS verifies Wi-Fi sign-in (802.1X) and VPN access. When it is unreachable (down, blocked port), nobody connects and the app tells you why.",
  abRoadV6d:
    "The network lives without you: background traffic (ARP, DHCP, broadcast) flies across the canvas on its own, and the live simulation adds user traffic on top. It shows nicely what a VLAN, a switch and a router really do – and where a frame stops.",
  abRoadV6e:
    "Event collection (syslog) – add a log server to your network and see in one place what the firewall blocked, what the IDS flagged and what went down. With no log server nothing is collected, and if an event never arrives, the app counts it.",
  abRoadV6f:
    "New courses: troubleshooting step by step, Zero Trust and microsegmentation, monitoring with logs and detection, networking to the cloud, incident response, and encryption in the network – from the Caesar cipher through hashing and TLS to certificates and the limits of encryption.",
  abRoadV6g:
    "New tasks for things the simulator could do but you could not try: the data diode, link bundling, a broadcast storm, the redundancy map, an ISP outage, a DNS alias and layered defense with a WAF.",
  abRoadV6h:
    "Tasks and challenges are grouped by topic more clearly (Wi-Fi, DNS and DHCP, industrial networks), and the About card again shows what is coming.",
  abRoadV6i:
    "Devices show what is on their mind: the detail view gains an ARP table (IP → MAC, with a spoofed row flagged) and, on a firewall, a NAT table of translations – static NAT, port forwards and live PAT from traffic.",
  abRoadV6j:
    "The test result shows the path like traceroute – device by device, with the TTL counting down; where the path stops, there is the fault. And the Topology check now watches the time source: collecting logs without NTP means timestamps that cannot be aligned.",
  abRoadV6k:
    "Course text is larger, and every lesson has A− / A+ buttons to tune it to your liking – the setting is remembered.",
  abRoadV6l:
    "A one-click incident report: the Syslog panel assembles the event timeline, isolated devices and observed connections into a text you can copy or download.",
  abRoadV6n:
    "Wiretap on a cable: right-click a link to attach a tap and see what an attacker would see there – the password itself on unencrypted services, only who-talks-to-whom on encrypted ones.",
  abRoadV6p:
    "Two new example networks: a school (classrooms, staff room, student Wi-Fi and a guest network) and an online shop (web in the DMZ, apps with a payment gateway behind it, and the customer database right at the back) – load them from the Examples menu and take apart why they are built the way they are.",
  abRoadV6q:
    "With twenty-two courses the list outgrew itself, so it can be switched: by learning path (from the basics through building a network to operations and incidents), or by topic (security, wireless, routing…). The choice is remembered.",
  abRoadV6r:
    'The Topology check now spots attacks, not just design flaws: spoofed ARP, a "permit everything" rule on the firewall, a rogue DHCP server, and the same Wi-Fi name from several access points (evil twin). Each finding comes with the defense against it.',
  abRoadV6s:
    "Quarantine a device in one click: right-click a node to cut it off from traffic while keeping it visible on the canvas – exactly what containment looks like when you catch someone. The same click lets it back in.",
  abRoadV6t:
    "Links now carry a speed and a delay, so they can be saturated: push more traffic through one than it can take and the app flags it, so a test shows you a bottleneck rather than a fault.",
  abRoadV6u:
    "The connections overview shows who really talks to whom – the pair, the service and how much has flowed. A new pair that was not there before is the fastest way to notice something is going on.",
  abRoadV6v:
    "The “What I know” page gathers your progress in one place: courses in progress and finished, and tasks completed.",
  abRoadV6x:
    "We went through the course animations module by module so they show exactly what the text is talking about – this one comes straight from your feedback, thank you for it.",
  abRoadV6o:
    "You can back your progress up to a file and load it in another browser (menu … → Progress backup), and from the welcome screen a step guide walks you through the first task, ticking off what you have already done.",
  abRoadV5a:
    "Devices have names and a network has its DNS server. The path test and the live simulation run by name, and Step by step shows the resolution itself. Simple mode gains a “Test as a user” block.",
  abRoadV5b:
    "DNS in depth: A, CNAME and MX records (a “Mail for domain” test), TTL and cache, and a backup server for when the primary goes down. The DNS role runs on a server, router, firewall or L3 switch – as a forwarder or a full DNS.",
  abRoadV5c:
    "DHCP grew up: one panel with an address range per network, a server on a router, firewall, L3 switch or server, a DHCP relay into remote networks, and MAC address reservations.",
  abRoadV5d:
    "The router behaves like a real NAT router – it drops unsolicited inbound traffic from the internet; inbound port forwarding can newly be configured on the router too.",
  abRoadV5e:
    "New devices: a WAF / reverse proxy against web attacks, a honeypot as a decoy, and the industrial trio PLC, HMI and Historian. Plus a data diode – a one-way gateway between the office and the control network.",
  abRoadV5f:
    "New courses – from building your first company network through DNS and names to Wi-Fi, industrial networks and resilience. Existing courses gained new modules, clearer explanations where beginners were getting lost, and the glossary more entries.",
  abRoadV5g:
    "New learning tasks and challenges – from a firewall HA pair and a load balancer through a poisoned DNS and a guest network to a rogue AP or an attacker's covert channel in DNS.",
  abRoadV5h:
    "A more accurate network: a packet can run out of its allowed hop count on the way and the result says so plainly, and a cable from a switch back into itself behaves like a real loop. Devices can now be powered off with a right-click.",
  abRoadV5i:
    "Topology check – a one-click weak-spot audit: loops, the internet edge, overly broad rules, single points of failure and weak spots of names. The example networks gained their own DNS, a WAF, a honeypot, plus a new network with the office and the control network separated.",
  abRoadV5j:
    "Canvas zones – colored hulls derived automatically from the zone firewall (inside, outside, DMZ, VPN), toggleable with a button.",
  abRoadV5k:
    "Faster canvas work: dropping a host pops up a device-kind picker (nothing is added until you pick a kind), rename by double-clicking the label, and Re-layout arranges the network as a connectivity tree – wide levels wrap onto further rows so the network fits the screen instead of stretching into a thin strip.",
  abRoadV5l:
    "The top bar collapses, hints can be switched off, on mobile a floating button takes you to the test, and small phones make better use of space. The whole app works from the keyboard and in a screen reader.",

  abRoadCatSoon: "Coming up",
  abRoadS6a:
    "More courses – further topics, based on what you find missing in practice. IPv6, the physical layer, multicast, first-hop redundancy, QoS in depth and storage networks are done; BGP/IS-IS and IPv4 packet internals (MTU, fragmentation) are the obvious next candidates. Say which you would rather have.",
  abRoadCat5: "Where this is heading",
  abRoadC5a:
    "A complete simulator – covering networking from A to Z, so you can build and test practically any topology",
  abRoadC5c:
    "Complete courses – a coherent path from the very basics to advanced topics, with everything along the way",
  abRoadNote:
    "Nothing here is set in stone — the roadmap evolves with your feedback. Tell me below what you want most",
  cfYes: "OK",
  cfNo: "Cancel",
  wPickTitle: "Pick an example network",
  palTitle: "Device Palette",
  palNet: "Network",
  palAdvanced: "Advanced devices",
  rpAdvanced: "Advanced: analysis & simulation",
  devL2Desc: "connects devices on a network",
  devHubDesc: "sends to all ports",
  devApDesc: "Wi-Fi access point",
  devL3Desc: "routing + switching",
  devRouterDesc: "routing · NAT",
  devFwDesc: "zones + rules · VPN",
  devIpsDesc: "threat detection / blocking",
  devLbDesc: "load distribution",
  devDiodeDesc: "one-way gateway",
  devWafDesc: "web firewall (L7)",
  nWafTitle: "WAF (web application firewall)",
  wafInfo:
    "A WAF (Web Application Firewall) is a <b>reverse proxy in front of web servers</b> that understands <b>HTTP/HTTPS content (layer 7)</b> and drops typical web-app attacks – <b>SQL injection, XSS and exploits</b> – before they reach the server. It complements the network firewall (ports/zones) with an ‘application-layer gatekeeper’. Other traffic passes unchanged. Place it in the path in front of a web server (e.g. in the DMZ).",
  nWafPass: "WAF – L7 inspection, no attack match (passed)",
  nWafBlocked: 'WAF blocked at L7 (attack "{0}")',
  nWafReason:
    'The WAF (web application firewall) dropped traffic matching the "{0}" attack at the application layer.',
  devIntDesc: "entry to the internet",
  devHostDesc: "a PC, server, phone…",
  diodeInfo:
    "A data diode is a <b>one-way gateway at the physical layer (L1)</b>: it is a one-way optical fiber – a transmitter on one side, only a receiver on the other, so <b>nothing can physically return</b> (not even an ACK). Use it where you only need to <b>read</b> telemetry and a back channel would be a risk (typically out of OT/production toward data collection). Pick which side data may flow to.",
  diodeOut: "Output side (where data may flow to)",
  diodeOutNone: "— both ways for now (unset) —",
  diodeOutHint:
    "Traffic passes only toward the chosen neighbor; the reverse direction is dropped by the diode.",
  diodeNeedLinks:
    "First connect the diode with two links (input and output), then choose the direction.",
  nDiodeFwd: "Data diode: one-way pass (permitted direction)",
  nDiodePass: "Data diode: direction not set – passing both ways for now",
  nDiodeBlock:
    "Data diode: reverse direction – the one-way gateway drops return traffic.",
  btnRelayout: "↺ Re-layout",
  zoomOutTitle: "Zoom out",
  zoomFitTitle: "Fit",
  zoomInTitle: "Zoom in",
  undoTitle: "Undo (Ctrl+Z)",
  redoTitle: "Redo (Ctrl+Y)",
  btnAddNote: "+ Note",
  noteTitle: "Note",
  notePh: "Note text… (Enter = new line)",
  noteSave: "Save",
  noteDelete: "Delete",
  stNoteAdded: "Note added",
  stNoteDeleted: "Note deleted",
  btnLinkLabels: "Link labels",
  btnLinkLabelsTitle: "Show speed and cost on links",
  btnZones: "Firewall zones",
  stRenamed: "Renamed",
  stZonesOn:
    "Firewall zones shown – colored hulls by the zone firewall's interfaces",
  stZonesOff: "Firewall zones hidden",
  zoneNoneHint:
    "No zones to show – zones are derived from the zone firewall (assign its interfaces to inside/outside/DMZ/VPN zones).",
  hintLabel: "Tip:",
  hintInit:
    'Drag a device from the palette. Draw a link by dragging from a "+" port to another node. Double-click a device = open its settings. Click a link and press Delete (or right-click) = delete link.',
  hintInitTouch:
    "Tap a device in the palette to add it. Drag from a + port to another node to link them. Double-tap a node to edit.",
  hints: [
    'Start by dragging a network and an L3 switch / firewall from the palette. Draw a link by dragging from the "+" port on the node edge to another node.',
    "Two networks connected only through an L2 switch can't communicate — different subnets need an L3 gateway. Add an L3 switch or firewall.",
    "Double-click a node to edit. On a firewall you set zones and rules; on an L3 switch, inter-VLAN ACLs.",
    "A firewall zone is an independent object with a role (inside / DMZ / outside) — multiple interfaces can belong to one zone. Internet is automatically treated as outside.",
    "The firewall supports a simple mode (no zones, rules directly between networks) — toggle it in the firewall editor.",
    'Handle internet access on the firewall (also for specific VLANs via the "Source network" column). Inter-VLAN traffic between internal networks belongs on the L3 switch.',
    "Zoom the canvas with the scroll wheel or the +/− buttons top-left; pan by dragging empty space. Delete a link with click + Delete.",
    "The Matrix tab shows reachability of all networks at once; click a cell to jump to a detailed test.",
    "Keyboard shortcuts: Delete removes the selected node/link, Ctrl+Z = undo, Ctrl+Y = redo, mouse wheel = zoom.",
    "The new hub sends a frame to all ports (unlike a switch, which learns MAC addresses). Find it in the palette next to the L2 switch.",
    'Join Wi-Fi by clicking an end device → the "Connect to Wi-Fi" section → pick a network and enter the password. An AP or all-in-one router/firewall must broadcast an SSID.',
    'Add a canvas note with the "+ Note" button above the canvas; drag to move it, double-click to edit the text.',
    "The fastest way to rename a device is a double-click right on its label on the canvas — no need to open its settings for that.",
    "Esc is the universal way out: it closes an open dialog, clears the canvas selection and exits the tour.",
    "Ran into an unfamiliar term? A searchable glossary lives in the networking courses (the “Glossary” button at the bottom of the course list).",
    "Your own DNS: add a Server and turn on the DNS (port 53) service in its detail – that unlocks the records. Then pick it as the DNS server in the network settings. The path test can then target a host “By name (DNS)”.",
  ],
  matrixTitle: "Reachability Matrix",
  matrixHint: "Click a cell for a detailed test",
  matrixNoSegs: "No networks.",
  rtTest: "Traffic Test",
  rtLogs: "Traffic & logs",
  rtNets: "Networks / VLANs",
  testTitle: "Traffic Path Test",
  labelSrc: "Source (from)",
  labelDst: "Destination (to)",
  labelTraffic: "What are you sending? (traffic type)",
  labelThreat: "Content / threat",
  labelThreatClean: "Benign traffic (clean)",
  labelPayload:
    "Payload (what the IPS matches against the signature pattern)",
  labelProto: "Protocol",
  labelPort: "Port",
  taskActWebLbl: "Website",
  taskActWeb: "Open a web page",
  taskActWebNone:
    "There is no web name or web server in the topology yet. Add a DNS record, or enable an HTTP/HTTPS service on a server.",
  taskActMailLbl: "Mail domain",
  taskActMail: "Send an email",
  taskActMailNone:
    "There is no mail domain (MX) in the topology yet. Add a domain to a mail server on its Mail tab.",
  taskActPing: "Ping the target",
  btnTest: "▸ Test traffic",
  tmUser: "As a user",
  testPingHint:
    "The basic test is a ping (reachability). To test a specific service/port, open the Advanced section.",
  btnBlast: "Blast-radius (how far an attacker reaches from here)",
  btnHA: "Resilience / HA test (device failure)",
  btnAudit: "Topology check (weak-spot audit)",
  audCrit: "critical",
  audWarn: "warning",
  audTip: "tip",
  btnDisNeedEp:
    "Nothing to test yet – I need at least two endpoints (a device such as a PC or server, or the Internet).",
  btnDisNeedDev:
    "Nothing to fail yet – there is no network device in the topology.",
  btnDisNeedNodes: "Nothing to check yet – the canvas is empty.",
  audEmpty: "Nothing to check – the canvas is empty",
  audEmptyExpl:
    "There is no device or network here yet, so the audit has nothing to go through. Drag at least one network and a few devices from the palette on the left, connect them with a cable – then run the audit again.",
  audOkAll: "The audit found no weak spots",
  audOkExpl:
    "I checked loops and STP, the internet edge, firewall rule breadth, single points of failure, name resolution (DNS) and the canvas warnings – and I have nothing to flag. Nice work.",
  audFound:
    "The audit reported findings: {0} (sorted by severity; one finding can cover several devices)",
  audStorm:
    "Broadcast storm in {0} – a loop with no STP flooded the broadcast domain. Enable STP on at least one switch in the loop.",
  audEdgeRouter:
    "{0} sits directly on the internet. NAT drops unsolicited inbound traffic, but without a firewall there are no rules or inspection – consider a firewall at the edge.",
  audEdgeNoFw:
    "{0} is connected straight to the internet with no firewall at the edge – the inside network is exposed.",
  audAnyIn:
    "{0}: rule #{1} permits EVERYTHING from the internet inside (permit any outside→inside) – that effectively turns the firewall off.",
  audOutDmzBroad:
    "{0}: rule #{1} permits all protocols and ports from the internet into the DMZ – permit only the specific service (e.g. 443).",
  audDmzInside:
    "{0}: rule #{1} permits everything from the DMZ inside – a breached DMZ server then has a free path to your data. Permit only the specific port.",
  audSpof:
    "{0} is the only connection between parts of the network – its failure splits the network – it is a single point of failure. Consider redundancy (a second device / an HA pair / a backup path).",
  audSpofEdge:
    "{0} is the only path to the internet – its failure cuts the whole network off. Consider a backup uplink or an HA pair.",
  audSpofLeafAgg:
    "A device failure would cut off its edge network: {0}. Common with access switches – just be aware of it.",
  audQuar:
    "In quarantine (deliberately cut off from the network): {0}. Release it once the reason is gone (right-click).",
  audCongested:
    "Congested links (high latency, loss): {0}. It passes, but slowly – consider more capacity or a second path.",
  audDnsSpof:
    "{0} is the only DNS server in the network. If it fails, every name stops working – even though the networks themselves keep running (a ping to an IP still gets through). Add a second DNS server.",
  audDnsNoResolver:
    "Network {0} has no DNS server set even though it can reach {1} – its clients cannot resolve names. Set its DNS server in the network detail.",
  audDnsDangling:
    "The configured DNS server is not in the topology (you probably deleted it) – name resolution will fail in: {0}.",
  audDnsDangling2:
    "The configured backup DNS server is not in the topology (you probably deleted it) – name-resolution failover will not work in: {0}.",
  audDnsDanglingHost:
    "Device {0} has its own DNS server set that is not in the topology (you probably deleted it) – name resolution on it will fail.",
  audDnsDanglingHost2:
    "Device {0} has its own backup DNS server set that is not in the topology (you probably deleted it) – name-resolution failover will not work.",
  btnTrafficSim: "▶ Live traffic simulation",
  btnTrafficStop: "⏹ Stop simulation",
  logsIntro:
    "The network lives on its own – background traffic (ARP, DHCP, broadcast) runs all the time. The simulation adds user traffic on top: web, mail, transfers.",
  trafficSpeed: "Rate",
  trafficUnit: "pkt/s",
  trafficTitle: "Live traffic",
  flowsTitle: "Connection overview",
  flowsHint:
    "Who talks to whom – a summary from the live simulation. This is the network's normal picture; whatever suddenly joins it is worth a look.",
  flowsEmpty:
    "No connections yet. Start the traffic simulation and you will see who talks to whom.",
  flowsPass: "passes",
  flowsBlocked: "blocked",
  flowsFail: "does not arrive",
  flowsMixed: "{0}× passes · {1}× blocked",
  sysTitle2: "Syslog",
  sysReportBtn: "build report",
  sysReportTitle: "Incident report",
  sysReportIntro:
    "A summary of what the network saw: the event timeline, isolated devices and observed connections. Copy or download it – and add your own steps with times.",
  sysReportCopy: "Copy",
  sysReportDl: "Download .txt",
  sysReportCopied: "Report copied to the clipboard.",
  btnCloseModal: "Close",
  sysNoServer:
    "There is no <b>log server</b> in the network – events are collected nowhere. Add a server running <b>Log collection (Syslog)</b> and you will see what happens in the network.",
  sysEmpty:
    "No events yet. Start the traffic simulation or power off a device.",
  sysLost:
    "{0} event(s) were not delivered – the log server is unreachable (port 514 blocked, no path, or not running).",
  sysEvDeny: "blocked traffic {0} → {1}",
  sysEvIds: "ALERT: suspicious traffic from {0}",
  sysEvDown: "device is down",
  sysEvUp: "device is back in service",
  sysEvQuar: "device placed in quarantine (cut off)",
  simBcastAll: "everyone on the network",
  simBcastDomain: "broadcast · {0} links in domain {1}",
  trafficClear: "clear",
  subResult: "Result",
  subSteps: "Step by step",
  resDetails: "Details: addresses, ARP, TTL, route",
  probesTitle: "Quick service probes",
  probesSimpleHint:
    "Does web, mail, or file sharing get through from the selected source…?",
  hostNetInfoLabel: "Network info",
  hostIpLabel: "IP address",
  hostMacLabel: "MAC address",
  hostAutoTag: "(automatic)",
  hostManualNote:
    "This device has a manually set address (from a task or a shared topology).",
  hostManualBrokenNote:
    "This device has a manually set address that doesn't fit (outside the subnet, a conflict or a wrong gateway).",
  hostIpResetBtn: "Set automatically",
  hostIpResetDone: "The address is now set automatically.",
  netsTitle: "Networks / VLANs",
  netsDesc:
    "A VLAN is shared across the network. The gateway is chosen <b>automatically</b> — the closest L3 device (L3 switch / firewall) connected to its hosts. Inter-VLAN traffic is thus routed on the L3 switch and its ACL is applied.",
  addVlan: "+ New VLAN / network",
  cancel: "Cancel",
  save: "Save",
  stLinkExists: "Link already exists",
  stEndpointRehomed: "Device reconnected (one cable only)",
  stLinkCreated: "Link created",
  stCablePickVlan:
    "Cable connected — open the host and pick its network/VLAN.",
  stLinkDeleted: "Link deleted",
  stDeleted: "Deleted",
  stCidrInvalid: "Invalid CIDR format",
  stSegCreated: "Network created",
  stSegSaved: "Network saved",
  stInternetAdded: "Internet added",
  stAdded: "Added",
  wanSecTitle: "WAN (multiple ISPs)",
  wanModeLbl: "Mode:",
  wanModeFailover: "Failover (primary/backup)",
  wanModeBalance: "Load balancing",
  wanPrimaryLbl: "primary",
  wanStActive: "Active: {0}",
  wanStSwitched: "Primary down → switched to {0}",
  wanStAllDown: "All WAN links down",
  wanStBalance: "Traffic is balanced across {0} WAN links",
  nWanBalance: "balanced across {0} WANs",
  stWanBadDevice:
    "{0}: connect the internet to a routing/security device (router, firewall…), not an L2 switch/hub/AP",
  linkLabelsTitle: "Show speed and cost on links (STP/OSPF debugging)",
  linkLabelsChk: "Show speed and cost on links",
  stLinkLabelsOn: "Link labels (speed · cost) on",
  stLinkLabelsOff: "Link labels (speed · cost) off",
  stFwNeedsZone: "Firewall must have at least one zone",
  stPickSrcDst: "Select source and destination",
  stPickSrc: "Select source network",
  stSaved: "Saved",
  stLbSaved: "Load balancer saved",
  stIdsSaved: "IDS/IPS saved",
  stHaSaved: "Saved + replicated to HA peer",
  stExportCanceled: "Export canceled",
  stExportFallback: "Exported (to downloads)",
  stSimRunning: "Traffic simulation running",
  stNeedEndpoints: "Add at least two hosts (or the Internet)",
  stDown: "is down",
  stRestored: "restored",
  stQuar: "quarantined (cut off from the network)",
  stUnquar: "back in the network",
  stBroadcast: "Blast-radius",
  stResilientN1: "Resilient to any single device failure (N-1)",
  stSpof: "Single point of failure",
  stHostSaved: "Host saved",
  stUndone: "Undone",
  stRedone: "Redone",
  stPngExported: "Image saved (PNG)",
  stPngEmpty: "Canvas is empty",
  stPngError: "PNG export failed",
  stSvgExported: "Vector saved (SVG)",
  stSnapOn: "Snap to grid enabled",
  stSnapOff: "Snap to grid disabled",
  stLinkCopied: "Topology link copied to clipboard",
  stLinkLoaded: "Loaded shared topology from link",
  stLinkError: "Sharing failed",
  mobileHintMsg:
    "The app works on phones, but it's cramped. For a smoother experience I recommend a computer.",
  mobileHintOk: "Got it",
  shareTitle: "Share topology by link",
  shareDesc:
    "This link contains the whole topology encoded right in the URL — anyone who opens it sees the same network. No server, no sign-up.",
  shareCopy: "Copy",
  shareCopied: "✓ Copied",
  stImportError: "Invalid topology file",
  stImportTooBig: "The file is too large (20 MB limit)",
  verdSameSegment: "SAME NETWORK",
  verdUnreachable: "UNREACHABLE",
  verdBlocked: "BLOCKED",
  verdTtlExpired: "PACKET LOST (TTL)",
  verdTtlExpiredSimple: "PACKET LOST – TOO MANY ROUTERS ALONG THE WAY",
  explTtlExpiredSimple:
    "The traffic never reached the destination, but nobody blocked it: the packet crossed too many routers and ran out of its allowed hop count (TTL) at {0}. That device discarded it and sent an ICMP Time Exceeded message back to the source – traceroute is built on exactly that. The path is most likely looping or needlessly long.",
  verdAllow: "PASSES",
  verdBlast: "BLAST-RADIUS",
  verdResilience: "RESILIENCE TEST",
  verdResilientOk: "RESILIENT (N-1)",
  verdSpof: "SINGLE POINT OF FAILURE",
  explSameSegment:
    "Source and destination are the same network — traffic stays local (L2), does not pass through any gateway.",
  explAllowSimple:
    "The traffic gets through — the connection from source to destination works.",
  explBlockedSimple: "The traffic can't get through — it's stopped by",
  explResilienceNotWorking:
    "Connection is not passing right now ({0}). Resilience testing makes sense on a working connection — first ensure the path is open.",
  explBlocked: "was stopped at device",
  explZone: "zone",
  explTrafficThrough: "passes through",
  explAddrSrc: "Source:",
  explAddrDst: "Destination:",
  arpTarget: "target",
  arpGw: "gateway",
  explDevices: "devices",
  explStatefulReturn:
    "A stateful firewall remembers established connections: return traffic gets through because it matches an outbound connection the firewall permitted (reverse direction).",
  explTtlHops: "(−1 for each of the {0} L3 hops)",
  nVpnTransit:
    "encrypted VPN tunnel – transit (contents can't be inspected en route)",
  nVpnNoPhys:
    "The VPN client has no physical path to the firewall terminating the tunnel. A VPN client connects FROM the internet – the VPN network is the RESULT of the tunnel, not a place you plug a cable into. Cable the client to the internet; the established tunnel is what puts it on the VPN network.",
  stVpnCableHint:
    "A VPN client connects from the internet – the VPN network is the result of the tunnel, not a place you plug a cable into. Cable it to the internet.",
  nTtlExpired:
    "TTL reached 0 – packet discarded, ICMP Time Exceeded sent back",
  nTtlExpiredReason:
    "The packet's TTL expired at {0}. Every router decrements TTL by 1 and discards the packet when it hits zero (starting at {1}) – that is what stops a packet from circling the network forever. An ICMP Time Exceeded (type 11) goes back to the source; traceroute is built on exactly that.",
  explSplitTunnel:
    "Split-tunnel: the client's internet traffic goes <b>directly out</b> (bypassing the corporate network and firewall) – only corporate traffic is tunneled to the firewall.",
  stepsSplitTunnel:
    "split-tunnel – straight to the internet, outside the corporate network and firewall",
  explLbPicked: "Load balancer selected backend",
  explLbPickedSimple: "The load balancer sent the connection to server",
  explLbAlgo: "algorithm",
  explLbFrom: "of",
  explLbServers: "servers",
  explWifiOpen:
    'This connection crosses the <b>open Wi-Fi</b> "{0}" – it travels through the air unencrypted and anyone in range can eavesdrop. Set WPA2/WPA3 security on the SSID.',
  explInsecure:
    "is an <b>unencrypted protocol</b> — data travels in plaintext (eavesdropping risk). Consider the secure alternative:",
  explAlertIDS: "<b>IDS Detection:</b>",
  explAlertNote:
    "detected suspicious traffic and generated an alert (traffic passed — IDS only detects, does not block).",
  explResilientOk:
    "will survive the failure of <b>any single</b> device — no single point of failure on the path.",
  explSpof:
    "Failure of these devices will break the connection (single point of failure):",
  explSpofAdvice: "For high availability add a redundant device/path.",
  explResilientTip:
    'Tip: right-click a device and choose "Simulate failure" to manually verify failover. Click empty space to clear highlights.',
  explBlastAttacker: "Attacker from",
  explBlastReaches: "can reach:",
  explBlastMachines: "machines",
  explBlastMachine: "machine",
  explBlastSegments: "networks",
  explBlastSegment: "network",
  explBlastProtected: "Protected",
  explBlastTip:
    "The fewer machines an attacker can reach, the better the segmentation (limiting lateral movement). A flat network = from one machine they reach everything. Click empty space to clear highlights.",
  explBlastOf: "of",
  stepsNoRoute: "No path found.",
  stepsSameSeg: "Source = destination, no hops.",
  stepsReached: "Destination reached",
  stepsReturnAuto:
    "Stateful return: matches an established outbound connection",
  stepsZone: "zone",
  probesPass: "Passes",
  probesFail: "Doesn't pass",
  probesNone: "no services",
  probesSameSeg:
    "Source and destination are the same network — traffic stays local (does not pass through any gateway).",
  probesNoRoute: "no route",
  probesBlocked: "blocked",
  probesInsecureTitle: "Unencrypted — consider",
  ctxEdit: "Edit…",
  ctxDown: "Simulate failure (HA)",
  ctxRestore: "Restore service",
  ctxHostDown: "Power off (simulate failure)",
  ctxHostUp: "Power on",
  ctxQuar: "Isolate (quarantine)",
  ctxUnquar: "Release from quarantine",
  ctxDelete: "Delete",
  ctxDeleteLink: "Delete link",
  ctxLinkLabel: "Link:",
  ctxLinkCost: "Link properties…",
  ctxLagBundle: "Bundle with parallels into LAG",
  ctxLagUnbundle: "Unbundle LAG (EtherChannel)",
  lagBundled: "EtherChannel bundled ({0} links)",
  lagUnbundled: "EtherChannel unbundled",
  lcTitle: "Link properties: speed, congestion, cost",
  lcHint:
    "Cost by link speed: fast = low, slow = high. Unset = auto: the link counts as 1G (<b>cost 10</b>). Cost protocols (OSPF/EIGRP) pick the path with the <b>lowest total cost</b> (Dijkstra). <b>RIP ignores this cost</b> – it counts only hops.",
  lcLabel: "Manual cost:",
  lcAutoPh: "auto",
  lcSave: "Save",
  lcReset: "Default (auto)",
  lcSaved: "Link properties saved",
  lcSpeedLabel: "Speed:",
  lcSpeedAuto: "— auto",
  lcDuplexFull: "full-duplex",
  lcDuplexHalf: "half-duplex",
  lcHalfNote: "half-duplex (collisions)",
  lcDerivedManual: "manual cost {0}",
  lcDerivedAuto: "cost {0}",
  lcQos: "Voice priority (QoS)",
  lcQosTitle:
    "Calls go first in the queue. It adds no capacity – everything else waits that much longer.",
  explQosVoice:
    "Voice has priority on this link – congestion does not affect it. The rest of the traffic still feels the slowdown.",
  lcCongested: "congested link (high latency, loss)",
  explCongested:
    "The connection does get through, but it <b>crosses a congested link</b> – high latency and packet loss. From the outside it looks like a “slow internet”, not an outage. Route the traffic elsewhere (a second path, an EtherChannel), give voice priority (QoS), or switch congestion off in Link properties. Raising the link speed alone will not clear congestion – it is a switch of its own.",
  noServices: "no open ports",
  openPorts: "Open ports:",
  warnDnsDeadRec:
    "A DNS record points to a device that is not in the topology: {0}. Resolving that name will fail – fix the record’s target or delete the record.",
  warnDnsEmptyRec:
    "The DNS server has a record with no name – it will never be used. Fill in a name or delete the record.",
  warnHostNoSeg:
    "Host is not placed in any network (open editor and select a network).",
  warnHostPortVlan:
    "The switch access port the host connects to is set to a different VLAN – the host can't reach its own VLAN.",
  warnHostBadIp:
    "The host has a static IP outside its subnet (wrong IP or mask).",
  warnHostIpConflict:
    "IP conflict – another host on the same network has the same address.",
  warnStaticInPool:
    "The host's static IP is inside the DHCP range but has no reservation – DHCP could hand the same address to another host.",
  nStaticInPool:
    "Static IP sits inside the DHCP pool without a reservation – risk of a clash with a dynamically assigned address.",
  warnSegNoLinks: "Network is not connected to any device.",
  warnSegNoL3:
    "This network has no router or L3 switch — it can't talk to other networks.",
  warnSubnetOverlap: 'Subnet {0} overlaps with {1} on network "{2}".',
  warnDevNoLinks: "This device is not connected to anything.",
  warnRouteViaGone:
    "A static route has a next hop that is not a neighbor of this device (deleted link?) – fix the route in the routing table.",
  warnFwNoOutside:
    'Firewall has a path to the Internet but no interface is in the "outside" zone. Traffic out would behave as inside→inside and pass through (outside rules won\'t apply). Place the outbound interface (e.g. toward IDS/IPS or Internet) in a zone with role outside.',
  customTraffic: "Custom…",
  hkNotebook: "Laptop",
  hkPrinter: "Printer",
  hkPhone: "IP Phone",
  hkCamera: "IP Camera",
  hkNas: "NAS / Storage",
  hkIot: "IoT / OT",
  hkMobile: "Mobile / smartphone",
  hkTablet: "Tablet",
  hkTv: "Smart TV",
  hkPlc: "PLC (controller)",
  hkHmi: "HMI (operator panel)",
  hkHistorian: "Historian (data store)",
  hkHoneypot: "Honeypot (decoy)",
  dnsFqdnLabel: "DNS name (FQDN)",
  dnsFqdnPh: "e.g. web.acme.local",
  dnsFqdnHint:
    "Optional. The name the device should be found under. For the name to actually resolve, a DNS server must have it in its records.",
  dnsRecLabel: "DNS records (name → IP address)",
  dnsColName: "Name",
  dnsColType: "Type",
  dnsColTarget: "Target",
  dnsColTtl: "TTL (s)",
  dnsPaneIntro:
    "This server answers DNS queries (port 53). Here you manage its records – the name → target pairs it can resolve.",
  webPaneIntro:
    "This server serves the web (port 80/443). A DNS server can learn the site addresses it should answer to via “Fill from device names” and resolve them here.",
  webAddrLabel: "Website addresses (hostnames)",
  webAddrPh: "e.g. www.company.com",
  webAddrAdd: "Add address",
  webAddrDel: "Remove address",
  webAddrHint:
    "The names the site should be reachable under. DNS can learn them and resolve them to this server (so one server can host several sites).",
  dcacheTab: "DNS cache",
  dcachePaneIntro:
    "What this device remembers from DNS so it doesn’t have to ask over and over. It fills up when you run a by-name test. It also remembers “does not exist” (negative caching).",
  dcacheColAnswer: "Answer",
  dcacheEmpty:
    "Empty for now – run a by-name test and the answer lands here.",
  dcacheFlush: "Flush cache",
  dcacheFlushed: "Local DNS cache flushed",
  dcacheNeg: "does not exist (NXDOMAIN)",
  dcacheFromClient: " (from the client’s local cache)",
  dnsSimpleMore:
    "Record types (CNAME), TTL, forwarding and the network's backup DNS server appear in advanced mode.",
  dnsCnameAdvTitle: "CNAME (alias) – the type switch is in advanced mode.",
  dnsRecAdd: "Add record",
  dnsRecDel: "Remove record",
  dnsRecNamePh: "name (e.g. web.acme.local)",
  dnsRecPick: "— pick a target —",
  dnsRecHint:
    "When a client asks me for a name from this list, I answer with the IP address of the selected device. (I bind the address to the device, so the record stays valid even if its IP changes.)",
  dnsFill: "Fill from device names",
  dnsFillHint:
    "Goes through devices that have a name (FQDN) or website addresses and adds the missing records. Existing records are left alone.",
  dnsFillDone: "Records added: {0}",
  dnsFillNone:
    "Nothing to add – either no device has a name (FQDN) or a website address, or I already have them all in my records.",
  dnsFwdLabel: "Forward unknown names out (to the internet)",
  dnsFwdHint:
    "On = a name I don’t know gets forwarded out to the internet. Off = I answer that no such name exists.",
  dnsSegLabel: "DNS server for this network",
  dnsSegNone: "— none (names won’t resolve) —",
  dnsSegHint:
    "Clients on this network ask this server to resolve names. A rogue server = the name sends you elsewhere and the network sees nothing odd about it.",
  dnsSeg2Label: "Backup DNS server (secondary)",
  dnsSeg2None: "— none —",
  dnsSeg2Hint:
    "When the primary DNS can’t be reached (down, blocked port 53), the client asks this one. NXDOMAIN does not fail over – “no such name” is a valid answer.",
  stDns2Promoted:
    "A backup without a primary makes no sense – I saved the selected server as the network's primary DNS server.",
  stDns2Same:
    "The primary and backup DNS server were the same – I did not save the backup (one server under two labels is not redundancy).",
  dhcpSrvSegLabel: "Network DHCP server",
  dhcpSrvSegDefault: "default: this network",
  dhcpSrvSegHint:
    "Default = DHCP is served by the network itself (range and reservations above). Or pick a DHCP server on a device (router, firewall or L3 switch with the role) or a server host (port 67) – the pool and reservations then come from it.",
  dhcpPoolExternalNote:
    "The range and reservations above are not used – addresses are handed out by the selected network DHCP server.",
  dhcpRelayWarn:
    "The selected DHCP server is on another network and no relay is set. Without one the clients' requests never get out and nobody gets an IP address.",
  dhcpRelayLabel: "DHCP relay (gateway)",
  dhcpRelayNone: "— none —",
  dhcpRelayHint:
    "When the DHCP server is on another network, the network gateway must forward requests to it (relay). Without a relay – or if the server can’t be reached over L3 (port 67) – clients get no IP.",
  devDhcpIntro:
    "This device can be a DHCP server – hand out IP addresses on the network it serves. Then assign it to a network in that network’s settings (Network DHCP server).",
  devDhcpRoleLabel: "Act as DHCP server (hand out IPs)",
  dhcpFromPh: "from (e.g. .10)",
  dhcpToPh: "to (e.g. .200)",
  dhcpRangeHint:
    "A range is also called a <b>pool</b> or a <b>scope</b> in documentation and on exams – same thing. Empty = the rest of the subnet (from .10). Addresses must always lie within the served network’s subnet. Static IPs and reservations are skipped in the pool.",
  dhcpScopesLabel: "DHCP ranges – which networks to serve",
  dhcpScopesHint:
    "Each row says which network the range and reservations apply to. “Default” applies to every served network that has no row of its own; a row for a specific network overrides it for that network. One server can serve several networks (remote ones via DHCP relay) – they pick it in their own settings (Network DHCP server).",
  dhcpScopeAdd: "Add a range",
  dhcpScopeSegPick: "— pick a network —",
  dhcpScopeDefaultOpt: "— default: all served networks —",
  dhcpScopeUsedOpt: "(already has a row)",
  dhcpScopeEmptyHint:
    "No rows yet – in every served network the server hands out the rest of the subnet (from .10). Add a custom range with the button below.",
  devBadgeDnsSrv: "DNS server – holds its own name records",
  devBadgeDnsFwd: "DNS forwarder – relays queries onward",
  devBadgeDhcp: "DHCP server – hands out IP addresses",
  warnDevDnsNoRec:
    "DNS role “server” with no records – it resolves no names.",
  warnDnsUpUnreach:
    "DNS forwarder: the upstream server is unreachable – name resolution will fail.",
  warnDhcpNoSeg:
    "DHCP server, but no network uses it – pick it in the network’s settings (Network DHCP server).",
  warnDhcpScopeOut:
    "The DHCP range lies outside the subnet of network {0} – clients get no valid IP.",
  audDhcpDangling:
    "Network {0} has a DHCP server set that is not in the topology (you probably deleted it) – clients get no IP. Pick a valid server, or switch to default (this network).",
  audDhcpUnreach:
    "Network {0} has its DHCP server on another network, but it is unreachable (no DHCP relay on the gateway, the server is off, or port 67 is blocked) – clients get no IP.",
  dnsFailoverNote: " – answered by the backup DNS server",
  dnsFwdViaNote: " (via forwarder {0})",
  devDnsIntro:
    "This device can handle clients’ DNS queries. A forwarder has no records of its own – it just relays queries onward (typically a home router → the provider’s DNS). In the DNS server role it has its own name records (A/CNAME/MX).",
  devDnsRoleLabel: "DNS role",
  devDnsRoleOff: "off (does not serve DNS)",
  devDnsRoleFwd: "forwarder (relays queries onward)",
  devDnsRoleSrv: "DNS server (own records)",
  devDnsUpstreamLabel: "Upstream DNS server",
  devDnsUpstreamNone: "— default: out to the internet —",
  devDnsUpstreamHint:
    "Where queries are relayed. With no selection they go out to the internet (like a home router to the provider’s DNS) – this forwarder then knows no local names.",
  dnsGroupLabel: "By name (DNS)",
  dnsMxGroupLabel: "Mail for domain (MX)",
  dnsMxStep: "MX: mail for {0} → {1} (via {2})",
  mailDomLabel: "Mail domains (MX)",
  mailDomPh: "e.g. acme.local",
  mailDomAdd: "Add domain",
  mailDomDel: "Remove domain",
  mailDomHint:
    "Domains this server receives mail for (@domain). DNS can learn them as an <b>MX record</b> (where mail for a domain goes) via “Fill from device names”.",
  mailPaneIntro:
    "This server handles mail (port 25/143). The domains it receives mail for can be learned by a DNS server as MX records – in the test you then pick the “Mail for domain (MX)” target.",
  dnsStep: "DNS: {0} → {1} (via {2})",
  dnsStepsPhase: "Name resolution (DNS)",
  dnsStepsQuery: "Query for {0} → the client asks the server {1} (UDP 53).",
  dnsStepsFwdLeg:
    "The forwarder has no records of its own – it relays the query to {0} (UDP 53).",
  dnsStepsAnswer: "Answer",
  dnsStepsFailHdr: "Resolution failed",
  dnsStepsConn: "Only now does the connection itself start.",
  dnsStepsNoPath: "The query never even reached the server {0}.",
  dnsStepsCacheHit:
    "The client already has the answer cached – no query is sent.",
  dnsStepsTried:
    "The client asked the server {0} first – it did not answer (the UDP 53 query never got there). So it tries the backup DNS server.",
  dnsStepsTriedAt:
    "The client asked the server {0} first – but the query (UDP 53) was stopped by {1}. So it tries the backup DNS server.",
  dnsStepsTriedFwd:
    "The client asked the server {0} first – it is a forwarder and had nobody to relay the query to. So it tries the backup DNS server.",
  dnsVerdFail: "Name did not resolve",
  dnsErrNoResolver:
    "The source network has no DNS server set – the client has nobody to ask about the name.",
  dnsErrResolverOff:
    "The configured DNS server ({0}) no longer runs the DNS service (port 53) – the network does have a DNS server set, it just does not answer names. Open that device (double-click) and give it the DNS service back, or set a different DNS server on the network.",
  dnsErrUnreach:
    "The DNS server is unreachable – the query (UDP 53) never got there.",
  dnsErrBothDown:
    "The backup DNS server failed too – no one is left to resolve names.",
  dnsErrUnreachAt:
    "The DNS server is unreachable – the query (UDP 53) was stopped by {0}.",
  dnsErrNx: "DNS server {0} does not know this name (NXDOMAIN).",
  dnsRecCnamePh: "target (e.g. web.acme.local)",
  dnsRecTtlTitle:
    "TTL in seconds – how long a client may keep the answer in its cache (default 300).",
  dnsErrCnameLoop:
    "DNS server {0}: the CNAME loops – the name points through aliases back to itself and never reaches an address.",
  dnsErrCnameDead:
    "DNS server {0}: the CNAME points to the name {1}, which this server does not know – the alias leads nowhere.",
  dnsCacheNote: "answer from the DNS server's cache ({0} s left)",
  dnsCacheClientNote:
    "the client remembers this from an earlier query to the server shown – it asked no one this time ({0} s left in cache)",
  dnsChainNote: "via an alias (CNAME): {0}",
  dnsErrForward:
    "DNS server {0} does not know the name and cannot reach the internet to ask further.",
  dnsHintIp:
    "Try picking the same target directly as a device. If it works by address but not by name, the fault is in DNS, not in the network.",
  dnsResolvedInet: "external address (internet)",
  dnsConflictNote:
    "Careful: DNS server {0} points the same name at a different device ({1}). The client trusts the server it is configured with – that is exactly how a rogue DNS works. The firewall won’t catch it: the connection to the returned address looks perfectly normal.",
  tk_dnsdown_t: "The network is fine, nothing works (DNS)",
  tk_dnsdown_g:
    "A helpdesk classic: the site won’t open by name, but answers on its address. The firewall blocks DNS queries (UDP 53) to the DNS-1 server. In the path test on the right pick <b>web.acme.local</b> in the destination under “By name (DNS)” and then try the same target as the device <b>Web</b> – you’ll see the difference. This is a demo only, nothing to fix.",
  tk_dnsdown_1:
    "PC → web.acme.local: the name does not resolve (DNS unreachable)",
  tk_dnsdown_2:
    "PC → Web (HTTPS 443) by address passes – the network itself is fine",
  tk_dnsrogue_t: "Rogue DNS",
  tk_dnsrogue_g:
    "There are two DNS servers on the network. The client network is configured with the attacker’s one – and it answers the name <b>web.acme.local</b> with the attacker’s address. Pick the name as the destination of the test and look at what it pointed to. Neither firewall nor IPS reports anything: to the network the connection looks perfectly normal. Just observe.",
  tk_dnsrogue_1:
    "PC → web.acme.local: the name points at the attacker (and the connection passes)",
  tk_dnsrogue_2:
    "PC → Web (HTTPS 443) by address passes – the real server is still alive",
  tk_dnsbk_t: "DNS with no backup – add a backup DNS server",
  tk_dnsbk_g:
    "The company DNS server <b>DNS-1 has failed</b> and nobody resolves names now – <b>web.acme.local</b> won’t open even though the web server is up (try the target by name vs. by address). Luckily there is a second working DNS server <b>DNS-2</b> on the network with the same records, it just isn’t set as a backup. Open the settings of the <b>“Company LAN” network</b> – double-click its bubble on the canvas, or use the gear next to it in the <b>Networks / VLANs</b> panel on the right. Pick <b>DNS-2</b> as the <b>Backup DNS server (secondary)</b>. Then click ✓ Check. (Advanced mode.)",
  tk_dhstv_t: "DHCP starvation – the new PC gets no IP",
  tk_dhstv_g:
    "The <b>new PC</b> won’t connect in the office – it gets no IP address. An <b>attacker</b> has joined the network and <b>exhausted the whole DHCP pool</b> (forging lots of fake leases from many MAC addresses – <i>DHCP starvation</i>). On the attacker’s <b>access port</b> on the managed switch, enable <b>port security</b>: open its link / port on the switch, set <b>Max MACs = 1</b> and copy the connected PC’s address into <b>Allowed MAC</b> (you see it in the port detail) – the attacker can’t request more addresses and the pool frees up. Then click ✓ Check. (Advanced mode.)",
  tk_dhstv_1: "New PC → file server (445) passes – it got an IP address",
  tk_dnsbk_1: "PC → web.acme.local: the name resolves (via the backup DNS)",
  tk_dnsbk_2:
    "PC → Web (HTTPS 443) by address passes – the network and server are fine",
  explHoneypot:
    "<b>Honeypot – a decoy!</b> Someone touched the decoy device. A honeypot should see <b>no legitimate traffic</b> – any access is suspicious and, in a real network, raises an alarm and exposes the attacker.",
  kindPickTitle: "Which device?",
  kindPickMore: "Detailed settings…",
  mobTest: "Test",
  mobTestAria: "Go to the test panel",
  dcacheAsks: "This device asks <b>{0}</b> to resolve names.",
  dcacheAsks2:
    "This device asks <b>{0}</b> to resolve names; if it can’t reach it, it tries <b>{1}</b>.",
  siLan: "Network / LAN",
  siDesktop: "Workstations",
  siLaptop: "Laptops",
  siServer: "Servers",
  siNas: "Storage / NAS",
  siDb: "Databases",
  siPrinter: "Printers",
  siPhone: "VoIP / Phones",
  siUsers: "Users",
  siCamera: "Cameras / CCTV",
  siIot: "IoT / OT",
  siWifi: "Wi-Fi / Guest",
  siCloud: "Cloud",
  siGlobe: "Internet",
  siShield: "DMZ / Secure",
  presetEntName: "Enterprise network – best practice",
  presetEntShort:
    "~65 nodes: HA firewalls, ACLs, DMZ, VPN, 2× load balancers, DNS, WAF",
  presetEntBullets: [
    "A mid-size company with everything a secure network needs – redundancy, segmentation, controlled access",
    "HA firewall pair (active/passive) + IPS in front of the DMZ web farm",
    "Two core L3 switches (active/active) with tight inter-VLAN ACLs",
    "Public web in a DMZ behind a load balancer, company intranet behind a second (internal) LB",
    "VPN for remote workers, isolated guest, cameras may only reach the NVR (RTSP 554)",
    "Two ISPs with WAN failover on the firewalls (ISP A primary) and 10G SFP uplinks from the core to the floors",
    "Its own DNS (SRV-DNS-01 + backup SRV-DNS-02) resolves acme.local names, a WAF shields the web farm from SQLi/XSS, and a decoy (honeypot) waits among the servers",
    "The company Wi-Fi runs 802.1X – sign-in is verified by SRV-AD-01 (RADIUS), guests get their own network with a password; SRV-MON-01 collects logs (Syslog panel) and the uplink to the cameras is deliberately congested",
    "Try: PC-101 → intranet (HTTPS 443 traffic), a by-name test to intranet.acme.local, blast-radius from the guest VLAN, N-1 resilience test",
  ],
  presetHomeName: "Home network / homelab",
  presetHomeShort:
    "Smart home: IoT, cameras, NAS with Plex – no HA, but with rules",
  presetHomeBullets: [
    "A real household: NAS with Plex, two TVs, cameras, door lock, vacuum, game console…",
    "A single router/firewall in simple mode – rules directly between networks",
    "LAN manages IoT, but IoT cannot reach the LAN; guests get internet only",
    "IoT may only go out over HTTPS – no sneaky telemetry over HTTP",
    "No HA at home – the router is a single point of failure (try the Resilience test)",
    "Upstairs is covered by a mesh AP (wireless backhaul), the garden by a repeater; the NAS runs on a 2.5G link",
    "Try: PC-living-room → NAS (SMB 445 traffic) vs. IOT-thermostat → NAS (blocked)",
  ],
  presetFlatName: "Flat company network – anti-pattern",
  presetFlatShort: "The whole company in one subnet – how NOT to do it",
  presetSchoolName: "School – students, staff and guests",
  presetSchoolShort:
    "Four worlds on one network: staff, students, cameras and guests – plus Wi-Fi login against RADIUS",
  presetSchoolBullets: [
    "Staff, students, servers and cameras – each in its own VLAN, separated by the core (L3 switch) and the firewall",
    "Wi-Fi has three names: staff over <b>802.1X against RADIUS</b>, the student one with a password, and an open guest one",
    "Students reach the school system over HTTPS only, the staff file share not at all – and neither the cameras",
    "The classroom uplink is only 100 Mbps and <b>congested</b>: “the lab is slow” is not an excuse, the path test shows it",
    "Try it: can a camera reach the internet? And what exactly does a guest laptop see?",
  ],
  presetShopName: "Online shop – public web, payments and warehouse",
  presetShopShort:
    "The chain from the internet down to the customer database – with the office deliberately beside production, not inside it",
  presetShopBullets: [
    "A real-world chain: internet → firewall → WAF → load balancer → three web servers, then the apps and the database right at the back",
    "The payment gateway and the customer database have no inbound path from the internet – verify it with a path test",
    "The link from the load balancer to the web servers is <b>congested</b> at peak: orders still pass, just slowly",
    "Office, warehouse and monitoring each sit beside production, not in it – a compromised accounting PC does not open the database",
    "Try it: does the design hold when someone takes over a web server? And what does an attacker in the DMZ hit first – data, or the decoy?",
  ],
  presetOtIcsName: "OT/ICS network – IT/OT segmentation",
  presetOtIcsShort:
    "An industrial network: PLC, HMI, historian; IT and OT split by a firewall (Purdue model)",
  presetOtIcsBullets: [
    "IT LAN — Inter-FW — industrial DMZ (historian) — OT LAN (PLC, HMI)",
    "IT may reach only the historian in the DMZ (SQL 1433), NOT the PLC directly – protecting control",
    "The historian collects data from the PLC (Modbus 502); the HMI drives the PLC locally in the OT LAN",
    "Try: in the path test verify IT-PC → PLC:502 is blocked, but → Historian:1433 passes",
    "All default-deny – the firewall works between internal networks too, not just at the internet edge",
  ],
  presetFlatBullets: [
    "Accounting, mail, web servers, cameras and guests in ONE subnet",
    "A single firewall without HA, a core without ACLs, daisy-chained switches",
    "Public web servers inside the network – the internet is one step from company data",
    "Try: blast-radius from NTB-Guest – free lateral movement to everything",
    "Wi-Fi stretched with a dumb repeater – the AP→repeater chain halves client throughput",
    "Compare with the enterprise example: same company, two different worlds",
  ],
  // --- Roadmap: move the shipped "Coming up" items into the Done list ---
  abRoadV8a: "v0.8 — coming up: wireless capacity is now derived",
  abRoadV8b:
    "A Wi-Fi link no longer has a hand-set cable speed. Capacity follows the band and channel the SSID broadcasts on, the access point's transmit power and how far the client is on the canvas — so 2.4 GHz next to the AP really is slower than 5 GHz, and moving a laptop across the floor costs you signal. Co-channel neighbours on 2.4 GHz steal airtime from each other, and a repeater gets about half the airtime of a normal hop. The cost protocols use the derived rate, too.",
  abRoadV8c:
    "Roaming got sticky: a client stays on its access point until another one is clearly closer, so nudging a laptop by a pixel no longer flips it between two APs.",
  abRoadV8d:
    "New example networks: a data centre with a leaf-spine fabric and separate storage VLAN, a campus with 802.1X and guest isolation, branch offices over WAN with dual uplinks and site-to-site VPN, a call centre with a voice VLAN and QoS, and a hotel separating guests, rooms and point of sale.",
  abRoadV8e:
    "The OT/ICS example was built but never listed in the Examples menu, so it could not be opened at all — that is fixed.",
  abRoadV8f:
    "Five new hands-on tasks built on those networks: move an SSID to 5 GHz, widen a cell with transmit power, plan 2.4 GHz channels, see a storage VLAN carried over trunks, and give calls priority on a congested link.",
  abRoadV8g:
    "The verification harness now checks that each example network actually behaves the way its own description claims – the load test was never the interesting part.",
  abRoadV8h: "Six new courses: IPv6, the physical layer, multicast, first-hop redundancy (HSRP/VRRP/GLBP), quality of service in depth, and storage networks.",
  abRoadV8i:
    "The course path was rebuilt into a single coherent route: address planning, addressing and services, then building and securing, then deepening, security, wireless, traffic handling and operations – with every course reachable and no orphans.",
  abRoadV8j:
    "The glossary gained about sixty terms for the new courses – IPv6 and AAAA, the physical layer, multicast and PIM, virtual IP and MAC, DSCP and the QoS tools, and the storage world.",
  presetDcName: "Data centre – leaf-spine with storage",
  presetDcShort:
    "Spine-and-leaf fabric, dual-homed servers, a separate storage VLAN and an out-of-band management network",
  presetDcBullets: [
    "Two spines, two leaf switches (ToR) – every server has two uplinks, so nothing is a single point of failure",
    "Uplinks are bundled with EtherChannel (LAG) – the fabric has real capacity, not one thin cable",
    "Public web in the DMZ, application servers on VLAN 10, database on VLAN 20, storage (iSCSI/NFS) on VLAN 30",
    "Management is a separate out-of-band VLAN 99 – the one network you can still reach when everything else fails",
    "Try: blast-radius from a compromised web server – it should reach the app tier, never the storage",
    "Try: down SPINE-1 and re-run a test – traffic shifts to SPINE-2 with no outage",
  ],
  presetCampusName: "Campus – students, staff, guests",
  presetCampusShort:
    "Several buildings, 802.1X everywhere, BYOD and guest Wi-Fi on separate networks",
  presetCampusBullets: [
    "Staff, Student, BYOD and Guest each get their own VLAN and their own access rules",
    "Guests are denied the campus file server outright, but they still reach the internet – an ACL, not a dead end",
    "Wi-Fi authenticates against RADIUS (802.1X) – a laptop that cannot authenticate gets no network at all",
    "Open a network page and look at the Wi-Fi cell: 2.4 GHz and 5 GHz APs carry very different speed, and distance costs you capacity",
    "Guests get internet only – no route to the staff file server, no matter which SSID they joined",
    "A rogue AP broadcasting the staff SSID is what the evil-twin task is about",
    "Try: move a laptop across campus and watch it roam – and watch the link speed fall with distance",
  ],
  presetBranchName: "Branches over WAN – two links, one network",
  presetBranchShort:
    "Head office with two branches, dual ISP uplinks and site-to-site VPN between all sites",
  presetBranchBullets: [
    "HQ and two branches, each branch on two ISPs – the router fails over to the second uplink by itself",
    "Sites are joined by VPN, so a branch PC reaches an HQ file server as if it were local",
    "Split tunnelling: internet traffic leaves via the local ISP, corporate traffic goes through the tunnel to HQ",
    "Try: right-click the router at Branch 1 and simulate a failure of ISP A – ISP B takes over",
    "Try: down the branch router and see exactly what the HQ loses",
  ],
  presetVoipName: "Call centre – voice on its own VLAN",
  presetVoipShort:
    "IP phones, a SIP trunk, a voice VLAN and QoS so calls survive a busy link",
  presetVoipBullets: [
    "Phones live on the Voice VLAN 50 and reach the call manager there – data has its own VLAN 10",
    "The SIP trunk leaves over the internet; the call manager registers there (SIP 5060)",
    "The desk-to-LAN link is congested and marked with voice priority – look what QoS does to a call (SIP 5060)",
    "Try: turn voice priority off on that link and re-run the call test – the same link now stutters",
    "Guests and data shares never reach the phones, and the phones never browse",
  ],
  presetHotelName: "Hotel – guests, rooms, back office",
  presetHotelShort:
    "Captive-portal guest Wi-Fi, room devices, point of sale and the property management system",
  presetHotelBullets: [
    "Guest Wi-Fi is an open SSID with no route into the hotel network – internet only",
    "Rooms have their own VLAN for the TV and the smart devices, kept away from the point-of-sale systems",
    "Point of sale, the property system and the back office sit behind the firewall and must not be reachable from the rooms",
    "The front desk PC reaches everything it needs; a guest laptop reaches none of it",
    "Try: blast-radius from a guest laptop – internet yes, room TV no, point of sale definitely no",
  ],
  presetConfirm: 'Load example "{0}"? The current topology will be replaced.',
  presetStatus: "Loaded example:",
  presetLoadBtn: "▶ Load example",
  pageTitle: "networksim — Free Network Simulator & Learning Platform",
  topoDefault: "New topology",
  topoNewConfirm: "Delete the current topology and start over?",
  simPass: "✔ passes",
  simBlock: "✖ blocked",
  simNoRoute: "⛌ no route",
  simDnsFail: "✖ name did not resolve (DNS)",
  simViaDns2: "(via the backup DNS server)",
  hostModalTitle: "Name",
  hostModalKind: "Device type",
  hostModalSeg: "Network / VLAN (host placement)",
  hostModalNoNet: "— select network —",
  hostModalNoNetEmpty:
    "— no network (add a router, L3 switch or firewall first) —",
  hostModalPorts: "Open ports / services (listening)",
  hostModalCustomPort: "custom port",
  hostModalAddPort: "+ Add port",
  hostModalPortHint:
    "Incoming traffic only passes on an open port. Without open ports the host listens on nothing (typical client).",
  hDhcpNoPool:
    "DHCP is on, but the pool yields no address – set the IP manually or adjust the range.",
  hDhcpExhausted: "The DHCP pool is exhausted – this host won't get an IP.",
  aclRangeBad:
    'Rule {n}: the port range has "from" greater than "to". Fix the order (from ≤ to), otherwise the rule makes no sense.',
  aclPortMissing:
    'Rule {n}: a port comparison is selected but no port is filled in. Add it (or switch to "any port") – otherwise the rule would apply to the whole protocol.',
  wAclShadowed:
    "Rule {n} is shadowed – an earlier rule already covers the same traffic, so it never applies (first-match).",
  wPfDup:
    "Duplicate port-forward: {0} port {1} targets multiple hosts – only the first rule applies.",
  hostModalVpnLabel: "VPN tunnel (to internet)",
  hostModalVpnFull: "Full-tunnel (all traffic via firewall)",
  hostModalVpnSplit: "Split-tunnel (internet traffic direct)",
  hostModalVpnHint:
    "<b>Full</b>: all client internet traffic goes encrypted to the corporate firewall (inspection, NAT out). <b>Split</b>: internet goes directly, only corporate traffic tunnels to the firewall.",
  segModalNew: "New network",
  segModalInetPfx: "Internet: ",
  segModalSegPfx: "Network: ",
  segModalName: "Name",
  segModalSubnet: "Subnet (CIDR)",
  segModalVlan: "VLAN (optional)",
  segModalInetNote:
    'Internet represents everything outside your network (0.0.0.0/0). It has no IP range or VLAN — that\'s why the range is fixed. The firewall automatically treats it as the <b style="color:var(--red)">outside</b> zone.',
  segModalColor: "Color",
  segModalMoreColors: "More colors",
  segModalPickPalette: "Pick from palette",
  segModalCustomColor: "custom…",
  segModalCreate: "Create",
  devModalName: "Device name",
  devModalName2: "Name",
  devL2Info:
    "Type: <b>L2 switch</b> (unmanaged)<br>Switches frames at L2 by MAC, does not understand IP. <b>Nothing to configure</b> — it does not filter traffic (no ACL) and has no per-port settings (access/trunk). To connect different subnets you need an L3 device (L3 switch / router). Need ACLs or port configuration (access/trunk, VLANs)? Use the <b>Managed L2 switch</b>. It still keeps a MAC (CAM) table like any switch – shown below for reference.",
  devHubInfo:
    "Type: <b>Hub</b><br>Sends every frame to <b>all ports</b> except the source — no MAC (CAM) table, never learns addresses. All devices share one medium. The older, ‘dumber’ predecessor of the switch.",
  devVpnInfo:
    "Type: <b>VPN Gateway</b><br>Terminates an <b>encrypted tunnel</b> — traffic through it is protected (confidentiality + integrity). Typically remote-access (remote users) or site-to-site between branches. Routes between interfaces (counts as an L3 gateway).",
  devLbVip:
    "VIP ports (Virtual IP – shared service address, comma-separated)",
  devLbAlgo: "Load balancing algorithm",
  devLbPool: "Server pool (check which servers to balance across) — active:",
  devLbInfo:
    'Client connects to <b>VIP</b>; load balancer picks a server from the pool according to the algorithm and forwards the connection (server must listen on the VIP port). Test with destination <b>"{0} (VIP)"</b> or run <b>Traffic Simulation</b>.',
  devLbNoServers:
    "No servers connected behind LB — connect servers with a cable behind the load balancer (directly or via L2 switch).",
  devIpsName: "Name",
  devIpsMode: "Mode",
  devIpsAddInsecure: "+ Insecure protocols",
  devL3Info:
    "Acts as gateway for VLANs you assign in the <b>Networks / VLANs</b> panel (right). ACL is used for <b>inter-VLAN rules</b>.",
  devL3Acl: "ACL rules (top-down, first-match)",
  devL3NoAcl: "No ACL rules — only the default policy applies (see below).",
  devL3AddAcl: "+ Add ACL rule",
  devL3ImplicitPol:
    '▸ <b>Implicit policy</b> (selection above): when no rule matches, traffic follows the selected default action. A real Cisco router has a hidden <span style="color:var(--red)">deny any</span> at the end — new ACLs therefore start as <b>deny</b>.',
  portTab: "Ports",
  routeTab: "Routes",
  portIntro:
    "Each switch link = a <b>port</b>. An <b>access</b> port carries one VLAN (for an end device), a <b>trunk</b> carries several VLANs (802.1Q – typically between switches). With no setting a port carries <b>all</b> VLANs (like a trunk).",
  portModeAll: "carries all (trunk)",
  portPickVlan: "— pick a VLAN —",
  portSecPh: "max MACs",
  portSecTitle:
    "Port security: maximum number of devices (MAC addresses) on this access port",
  portSecMacPh: "allowed MAC",
  portSecMacTitle:
    "Port security: lock the port to a specific MAC address (only it passes)",
  linkCongestedBadge: "congested",
  linkCongestedTip:
    "A congested link: more is flowing over it than it can keep up with – traffic gets through, but slowly. This is not the same as a low link speed: speed decides which way routing goes, congestion slows down what travels there. Right-click the link and pick “Link properties” to switch it on or off.",
  audArpSpoof:
    "Device {0} is spoofing ARP – posing as the gateway so its neighbors' traffic flows through it (eavesdropping, MITM). Quarantine it; Dynamic ARP Inspection on the switch fixes it for good.",
  audAnyAny:
    "Firewall {0} has a rule that permits absolutely everything (any source to any destination, any protocol). That cancels all segmentation behind it – check whether it belongs there.",
  audRogueDhcp:
    "A rogue DHCP server ({0}) is running on the network and nothing filters it – clients will get the attacker's gateway from it. Enable DHCP snooping on the switch and mark the legitimate server's port as trusted.",
  audEvilTwin:
    'The Wi-Fi name "{0}" is broadcast by multiple access points with different security or a different network behind them – it looks like an evil twin. Verify which AP is yours and remove the impostor.',
  audNoNtp:
    "You collect logs, but there is no accurate time source (NTP, port 123) on the network. Without a common time, records from different machines carry shifted timestamps and you cannot reconstruct an incident – add service 123 to a server.",
  audNtpUnreach:
    "The log collector {0} cannot reach the time source (NTP). Check the rules along the path – otherwise the clocks drift apart and timestamps stop matching.",
  traceTitle: "Route (traceroute)",
  traceTarget: "target",
  traceNote:
    "Every device that decides by IP lowers the TTL by one. This is exactly what tracert/traceroute shows – where the route stops, that is where the fault is.",
  arpTblTitle: "ARP table (IP → MAC)",
  arpTblNote:
    "Which addresses the device knows on its own network. For traffic going out it asks ARP for the gateway’s MAC – that is exactly the row an attacker spoofs.",
  arpTblPoisoned: "⚠ spoofed",
  natTblTitle: "NAT table (translations)",
  natTblStatic: "static NAT 1:1",
  natTblDnat: "port forward",
  natTblPat: "outbound PAT (from traffic)",
  natTblNote:
    "Static NAT and port forwards are configured permanently; outbound PAT appears as traffic flows – run a test or the simulation and rows will show up.",
  macTblTitle: "CAM table (learned MACs)",
  macTblHost: "Device",
  macTblNote:
    "The switch keeps in its CAM table which MAC address is on which port/VLAN – it forwards frames accordingly.",
  stpBadgeTip:
    "Rapid STP (RSTP) – a backup port; when the main path fails it comes up almost instantly. You can change the root and link cost (switch priority, right-click a link).",
  stpBadgeTipStp:
    "Classic STP – a backup port; when the main path fails it converges slowly (in reality ~30 s before the port starts forwarding). RSTP does it almost instantly. You can change the root and link cost (switch priority, right-click a link).",
  portNoLinks: "This switch has no links yet – connect a cable first.",
  portNoVlans:
    "No VLANs/networks yet. Add them in the Networks / VLANs panel.",
  portsPhysLabel: "Ports (physical)",
  portsUsed: "{0} / {1} used",
  portsFull: "{0}: out of ports ({1}/{1})",
  portsCountTitle:
    "Number of physical ports on the device. In advanced mode the limit is enforced – you can't plug another cable into a full device.",
  portOn: "On",
  portOff: "Off",
  portFree: "— free —",
  portPreset: "preset",
  portStateLabel: "Port state",
  portAdminDown:
    "Port administratively down (shutdown) – the connected device has lost its link.",
  portAdminDownBadge: "admin down",
  portsAllLabel: "All ports",
  portLabel: "Port",
  portDetails: "details",
  portIp: "IP address",
  portMac: "MAC address",
  portSpeed: "Link speed",
  portDuplex: "Duplex",
  portCost: "OSPF cost",
  portConnType: "Connected to",
  hostNoCreds: "No company credentials (802.1X)",
  hostNoCredsTitle:
    "A device with nothing to identify itself with – on a port running 802.1X, RADIUS turns it away. Typically a visitor laptop in a meeting room.",
  portDot1xLabel: "802.1X (authenticate against RADIUS)",
  portDot1xTitle:
    "The port opens only after the device behind it authenticates against a RADIUS server. When RADIUS is down or unreachable, the port lets nobody through – that is the operational price of the check.",
  portDot1xNoRad: "— pick a RADIUS server —",
  nSrcDot1xCreds:
    "The source port runs 802.1X and this device has nothing to identify itself with – RADIUS turned it away.",
  nDstDot1xCreds:
    "The destination port runs 802.1X and this device has nothing to identify itself with – RADIUS turned it away.",
  nSrcDot1x:
    "The source port runs 802.1X and the device has nowhere to authenticate – the RADIUS server is down or traffic cannot reach it. So the port stayed closed.",
  nDstDot1x:
    "The destination port runs 802.1X and the device has nowhere to authenticate – the RADIUS server is down or traffic cannot reach it. So the port stayed closed.",
  portBpduLabel: "BPDU guard",
  portBpduTitle:
    "An access port should have an end device behind it. If a switch shows up there, the port shuts down – so a foreign box cannot take over as root bridge and reroute the traffic.",
  portSecMaxLabel: "Max MACs",
  portSecMacLabel: "Allowed MAC",
  portColorMode: "Coloring",
  pcmState: "State",
  pcmVlan: "VLAN",
  pcmSpeed: "Speed",
  pcmUp: "active",
  pcmFree: "free",
  pcmDown: "down",
  pcmTrunk: "trunk",
  pcmFe: "FE (10/100M)",
  pcm1g: "1G",
  pcm25g: "2.5G",
  pcm5g: "5G",
  pcm10g: "10G",
  pcmAuto: "auto",
  pcmDisconnected: "disconnected",
  pcmWan: "WAN (Internet)",
  portDetail: "Details",
  portModeLabel: "Port mode",
  portTrunkVlans: "Trunk VLANs",
  portFreeDlgHint:
    "The settings activate once a cable is plugged in – they stay saved on the physical port.",
  portWholeSwitch: "(whole switch)",
  portTrustLong: "trusted (trusted port for DHCP snooping / DAI)",
  portClose: "Close",
  portMoveLabel: "Move cable to port",
  sfpDlgHint: "SFP/SFP+ module (1G/10G)",
  sfpCountTitle:
    "Number of SFP/SFP+ uplink slots. Slots are numbered after the RJ-45 ports; an occupied slot can't be removed.",
  portsWifiOnlyNote:
    "This device connects over Wi-Fi only – it has no wired port.",
  stWifiOnlyNoCable:
    "{0}: a phone/tablet connects over Wi-Fi only, not by cable.",
  apNoUplinkBadge: "no uplink",
  hostOffBadge: "⏻ POWERED OFF",
  apRepHalfNote:
    "Repeater wireless backhaul – one radio must receive and re-send, so it gets about half the airtime of a normal hop.",
  wlBandLabel: "Band",
  wlChLabel: "Channel",
  wlTxLabel: "Transmit power",
  wlTxHint:
    "The radio's output power in dBm. More power reaches further, so clients keep a strong signal as they move away – the trade-off is that neighbours hear each other more too.",
  wlSpeedDerived: "derived",
  wlSpeedDerivedHint:
    "A wireless link has no cable speed to set. Capacity is worked out from the band and channel the SSID broadcasts on, the transmit power, and how far the two devices are apart on the canvas.",
  wlOutOfRange:
    "Too far to hear: below the client's sensitivity, so this link carries nothing.",
  wlSignalLabel: "Signal",
  wlChHint:
    "Neighbouring access points on the same or an adjacent channel steal airtime from each other. On 2.4 GHz only channels 1, 6 and 11 do not overlap.",
  wlWeakSignal: "weak",
  fwHaLabel: "HA pair (config replication + failover)",
  fwHaNoDevice: "— no other device of the same type —",
  fwHaStackHint:
    "On <b>switches</b> a paired couple behaves as <b>one logical switch</b> (a stack): a downstream device can uplink to <b>both members at once</b>, STP blocks neither, and the connection survives the failure of either one.",
  fwHaNoPeer: "— no HA pair —",
  fwHaAA: "Active / Active (both active, share traffic)",
  fwHaAPActive: "Active / Passive — this is ACTIVE",
  fwHaAPStandby: "Active / Passive — this is STANDBY",
  fwHaHint:
    "Paired devices share configuration ({0}). <b>Active/Active</b>: traffic can go through either. <b>Active/Passive</b>: all goes through active, standby waits and takes over on failure.",
  fwInterfaceNote:
    "Firewall interfaces = VLANs/networks it is the closest L3 gateway for + physical links (e.g. to Internet). Modern firewalls also <b>terminate remote-access VPN</b> (encrypted tunnel for remote users) — a separate VPN gateway is not needed.",
  fwZoneToggle: "Use zones (zone-based firewall)",
  fwTabZones: "Zones & interfaces",
  fwTabRules: "Rules",
  fwTabHa: "HA (failover)",
  fwZoneDesc:
    'A zone is an <b>independent logical object</b> with a role (<b style="color:var(--green)">inside</b> / <b style="color:var(--amber)">DMZ</b> / <b style="color:var(--red)">outside</b>). <b>Multiple interfaces</b> can belong to one zone. Internet is automatically assigned to <b style="color:var(--red)">outside</b>.',
  fwZones: "Zones",
  fwNoZones: "No zones.",
  fwAddZone: "+ Add zone",
  fwIfaceZones: "Interfaces and networks → zones",
  fwIfaceNote:
    'Assign interfaces and individual <b>VLANs/networks</b> to zones. This is mainly for the <b style="color:var(--violet)">VPN</b> pool (zone with role VPN) and directly attached <b style="color:var(--amber)">DMZ</b> — creating their logical interface on the firewall; for VPN, connect clients with a cable to <b>Internet</b>. Internal VLANs behind an L3 switch don\'t need to go here (FW sees them through its interface). Internet = <b style="color:var(--red)">outside</b> automatically.',
  fwNoIface:
    'No interfaces or VLANs — create a VLAN in the "Networks / VLANs" panel, or draw a link (e.g. to Internet).',
  fwRules: "Rules (top-down, first-match)",
  fwRulesNote:
    'The "Source/Dest network" columns are optional — leave <span class="mono">* (any)</span> for the whole zone, or select a specific network/VLAN (e.g. controlling a single VLAN\'s internet access).',
  fwNoRules: "No explicit rules — only default policy applies.",
  fwAddRule: "+ Add rule",
  fwPfTitle: "Port forwarding (DNAT)",
  fwPfNote:
    "Expose an internal service from the internet: traffic to a public port is forwarded to a chosen host and its internal port. Without a rule the firewall drops unsolicited inbound traffic.",
  fwPfPub: "Public port",
  fwPfHost: "→ Host",
  fwPfInt: "Internal port",
  fwPfNone: "No rules — internal services are unreachable from outside.",
  fwPfAdd: "+ Add port forward",
  fwPfNoHosts:
    "Add a host/server to the topology first to forward traffic to.",
  fwSnatTitle: "Static NAT (1:1)",
  fwSnatNote:
    "Permanently maps an inside host to its own public IP – the host is then reachable from the internet on ALL its services (unlike port forwarding, which exposes just one port). The host still only answers on its open ports.",
  fwSnatPub: "Public IP",
  fwSnatNone: "No static NAT",
  fwSnatAdd: "+ Add static NAT",
  fwDefaultPol:
    '<b>▸ Default policy</b> (always at end, not editable):<br>• same zone → same zone = <span style="color:var(--green)">permit</span> (intra-zone)<br>• <span style="color:var(--violet)">VPN</span> → anything = <span style="color:var(--green)">permit</span> (authenticated remote-access user is trusted)<br>• inside → DMZ / outside = <span style="color:var(--green)">permit</span>; &nbsp;inside → <span style="color:var(--violet)">VPN</span> = <span style="color:var(--red)">deny</span> (inside never initiates to remote clients)<br>• outside / DMZ → inside / DMZ / VPN = <span style="color:var(--red)">deny</span><br>• anything → outside = <span style="color:var(--green)">permit</span> (NAT)<br><span style="color:var(--muted)">Stateful: return traffic for permitted connections passes automatically.</span>',
  fwSimpleDesc:
    "Simple mode <b>without zones</b> — rules are entered directly between networks (like ACL). Suitable if you don't want to deal with a zone model.",
  fwSimpleDefaultLabel: "Default policy (when no rule matches)",
  fwSimpleDenyAll: "block everything (deny any)",
  fwSimplePermitAll: "allow everything (permit any)",
  fwSimpleNoRules: "No rules — only the default policy above applies.",
  fwSimpleStateful:
    "Stateful: return traffic for permitted connections passes automatically.",
  fwColFrom: "From zone",
  fwColFromSeg: "Source network",
  fwColTo: "To zone",
  fwColToSeg: "Dest network",
  fwColProto: "Proto",
  fwColPortOp: "Port match",
  fwColPort: "Port",
  fwColPort2: "Port (to)",
  fwColAction: "Action",
  fwPermit: "permit",
  fwDeny: "deny",
  fwAclColFromSeg: "Source network",
  fwAclColToSeg: "Dest network",
  fwZoneEmpty: '<span style="color:var(--muted)">empty</span>',
  fwIfaceRemove: "— remove from firewall —",
  fwVlanAutoZone: "✓ automatic {0} (via {1})",
  fwVlanNoZone: "— not in any zone —",
  lbRR: "Round-robin (cycles through)",
  lbLeastConn: "Least connections",
  lbWeighted: "Weighted",
  lbSrcIP: "Source-IP affinity (sticky session)",
  aclUp: "up",
  aclDown: "down",
  aclDel: "delete",
  fbIntro:
    "<b>networksim</b> is a network simulator and learning platform in one. Something not working, or have an idea to improve it? <b>Tell me in the form.</b>",
  fbTitle: "Feedback",
  fbCancel: "Close",
  ipsInlineMode:
    "<b>IPS</b> is <b>inline</b> — traffic matching a signature will be <b style='color:var(--red)'>blocked</b>.",
  idsPassiveMode:
    "<b>IDS</b> is <b>out-of-path</b> (TAP/SPAN) — traffic is only <b style='color:var(--amber)'>logged / alerted</b>, not blocked.",
  thr_sqli: "SQL injection",
  thr_xss: "XSS (cross-site scripting)",
  thr_creds: "Plaintext passwords",
  thr_malware: "Malware / EICAR",
  thr_c2: "C2 beacon (botnet)",
  thr_exploit: "Known CVE exploit",
  thr_portscan: "Port scan",
  thr_dnstunnel: "DNS tunneling / exfiltration",
  sev_critical: "critical",
  sev_high: "high",
  sev_medium: "medium",
  sev_low: "low",
  modeSimple: "Simple",
  modeAdvanced: "Advanced",
  modeTitle:
    "Simple / Advanced mode – Advanced unlocks more realistic settings, security and configuration. Click Mode for an overview.",
  modeInfoTitle: "What Advanced mode unlocks",
  miTitle: "Advanced mode",
  miHintTitle: "You turned on Advanced mode",
  miLead:
    "Advanced mode adds layers of realism and configuration. It unlocks:",
  miHintLead: "You now also have access to:",
  miSec: "Security",
  miSec1:
    "Configuring DHCP snooping and DAI (ARP protection applies in both modes)",
  miSec2:
    "Configuring port security – MAC limit and lockdown (the effect applies in both modes)",
  miSec3: "STP mode – manual choice of loop blocking",
  miReal: "Realism",
  miReal1:
    "Manual IP addresses, default gateway and MAC – simple mode assigns them for you, here you set them yourself (a wrong address is flagged in both modes)",
  miReal2: "DHCP pool – range and reservations",
  miReal3: "Static routes and routing protocol choice",
  miReal4:
    "Longest-prefix, administrative distance, physical ports (limit, speed/duplex, SFP slots, shutdown, WAN, coloring)",
  miReal5:
    "The network's backup DNS server and TTL on DNS records (answers from cache)",
  miReal6:
    "Background network traffic – ARP, DHCP and broadcast the network generates itself (always on; the simulation adds user traffic)",
  miCfg: "Configuration",
  miCfg1: "Manual static routing tables",
  miCfg2: "DPI signatures and payloads in the traffic test",
  miCfg3: "Service probes",
  miCfg4:
    "DNS and DHCP right on a router, firewall or L3 switch – role, upstream and ranges for several networks (plus their badge on the canvas)",
  miCfg5: "Load balancer algorithm choice",
  miLoseSimple:
    "The other way round: the “Test as a user” block (open a web page, send an email, ping) exists only in simple mode – in advanced mode you lose it and test via Source/Destination and traffic type. You can switch back any time.",
  miGotIt: "Got it",
  miShowTour: "Show the tour",
  miSwitchAdv: "Switch to Advanced",
  miClose: "Close",
  ipsTlsLabel: "TLS inspection (decrypt encrypted traffic)",
  ipsTlsHint:
    "Without it the sensor cannot see inside encrypted traffic and content signatures never match. With it it can – but every client must then trust the company certificate authority.",
  nIpsEncBlind:
    "The traffic is encrypted – the sensor cannot see the content, so content signatures do not match. TLS inspection would help (at the price of every client having to trust the company CA).",
  ipsRulesetH: "Detected threats (ruleset)",
  ipsRulesetHint:
    "Click what the sensor should watch for. Color = severity. Then send the threat in the Traffic Test (Content / threat).",
  ipsNotFw:
    "Unlike a firewall it decides by content (signatures), not addresses/ports.",
  ipsCustomH: "Custom signatures (DPI patterns)",
  ipsCustomHint:
    "A pattern the sensor looks for in the payload (rx = regular expression). Bad pattern → threat passes; too broad → false positives.",
  ipsColPattern: "Pattern",
  ipsNoCustom: "No custom patterns.",
  ipsAddPattern: "+ Custom pattern",
  ipsAddExamples: "+ Examples",
  ipsPortH: "Port-based detection",
  ipsPortHint: "Supplementary – e.g. insecure protocols (Telnet, FTP…).",
  ipsNoPort: "No port rules.",
  ipsAddPort: "+ Port rule",
  ipsPortsNote:
    'An inline device ("bump in the wire") – traffic just passes through transparently; physical ports aren\'t configured.',
  lbWeightTitle: "weight",
  devLbNoVip: "not listening on VIP",
  nPermitRule: "Permitted by explicit rule #{0}",
  nDenyRule: "Blocked by explicit rule #{0}",
  nIntraZone: 'Permitted by default policy (traffic within zone "{0}")',
  nVpnAny: "Permitted by default policy (VPN → *)",
  nVpnAuthDown:
    "VPN authentication failed – the RADIUS server is unreachable (not running, behind a blocked port 1812, or no path to it). Without authentication a VPN client can't enter the tunnel.",
  fwVpnRadius: "VPN client authentication (RADIUS)",
  fwVpnRadiusNote:
    "Optional: the remote-access VPN authenticates users against a RADIUS server (a host running service 1812). When it is unreachable, clients can't enter the tunnel.",
  fwVpnRadiusNone: "— no RADIUS (shared secret only) —",
  ssidNeedRadius:
    "802.1X needs a RADIUS server: add a server running the RADIUS service (1812) to the network and pick it here.",
  warnRadiusUnreach:
    'SSID "{0}" (802.1X): the RADIUS server is unreachable – clients can\'t connect.',
  warnVpnRadiusUnreach:
    "VPN authentication: the RADIUS server is unreachable – VPN clients can't sign in.",
  nInsideAny: "Permitted by default policy (inside → *)",
  nNatOut: "Permitted by default policy (* → outside, NAT)",
  nInsideToVpn:
    "Blocked by default policy (inside → VPN: connections to remote-access VPN clients are never initiated from inside – allow with an explicit inside → VPN rule)",
  nDefaultDeny: "Blocked by default policy (outside/DMZ → inside/DMZ/VPN)",
  nStatefulReturn:
    "Stateful return: matches an established outbound connection (reverse direction is permitted)",
  nDnat: "Port forward (DNAT): public port {0} → {1}:{2}",
  nRouterNatDeny:
    "Router NAT: unsolicited inbound traffic from the internet was dropped by the router – inside addresses behind NAT aren't visible from outside. Expose a service via port forwarding (router detail).",
  rtPfNote:
    "The router does NAT: it drops unsolicited inbound traffic from the internet. A rule here forwards a public port to a chosen host and its internal port.",
  nSnat:
    "Static NAT (1:1): inside host {0} is exposed at its own public IP (all services)",
  nSimplePermitRule: "Permitted by rule #{0}",
  nSimpleDenyRule: "Blocked by rule #{0}",
  nSimpleDefPermit: "Permitted by default policy (implicit permit)",
  nSimpleDefDeny: "Blocked by default policy (implicit deny)",
  nAclPermit: "Permitted by ACL rule #{0}",
  nAclDeny: "Blocked by ACL rule #{0}",
  nAclImplicit: "ACL: implicit permit (no rule matched)",
  nAclImplicitDeny: "ACL: implicit deny (no rule matched)",
  aclDefaultLabel: "ACL default policy (when no rule matches)",
  nDevAclCount: "{0} ACL rules",
  nDevSigCount: "{0} signatures",
  nDevVip: "VIP ports: {0}",
  nDevDetect: "detection",
  nNoL3:
    "Traffic between different subnets needs an L3 gateway (L3 switch or firewall) reachable from this subnet. Two different subnets can't communicate through L2 switches alone.",
  nNoPath: "There is no path between the networks – a link is missing.",
  nL2Forward: "L2 switching (transparent to routing)",
  nRouteNat: "Routing + NAT on WAN interface",
  nRoute: "Routing",
  nRouteInter: "Routing between subnets",
  nLpm: "longest-prefix match → {0}",
  nDefRoute: "0.0.0.0/0 (default route)",
  nNatXlate: "NAT {0} → {1}",
  nNoStaticRoute:
    "The router has no route to the destination network – no static route (nor default route) and the network isn't directly connected.",
  nRipHopLimit:
    "RIP: the destination is more than 15 hops away (16 = unreachable) – RIP won't deliver to this network. Try OSPF (it counts cost, not hops).",
  nRouteVia: "via {0} (AD {1})",
  rpProtoLabel: "Routing protocol",
  rpProtoConnected: "connected",
  rpProtoStatic: "static",
  rpProtoRip: "RIP",
  rpProtoOspf: "OSPF",
  rpProtoEigrp: "EIGRP",
  rpProtoHintStatic:
    "Only directly connected networks + manually entered static routes. AD: connected 0, static 1.",
  rpProtoHintRip:
    "Dynamic, metric = hop count (ignores link speed). Max 15 hops. AD 120.",
  rpProtoHintOspf: "Dynamic, metric = cost by link speed (Dijkstra). AD 110.",
  rpProtoHintEigrp:
    "Dynamic, composite metric (bandwidth + delay), fast convergence. AD 90.",
  nAclTag: " · ACL #{0} (permit)",
  nAclTagImplicit: " · ACL: implicit permit",
  nIdsAlert:
    'IDS – ALERT: signature match ("{0}"), traffic passed (out-of-path)',
  nIdsPassive: "IDS – passive monitoring (does not block)",
  nIpsBlockedInline: 'IPS blocked inline (signature "{0}")',
  nIpsReason:
    'IPS (inline prevention) blocked traffic matching signature "{0}".',
  nIpsInlineNoMatch: "IPS – inline inspection, no signature match",
  nLbTransit:
    "Load balancer (transit – VIP port filtering only applies to connections targeting the VIP)",
  nVpnTunnel:
    "VPN gateway – encrypted tunnel (traffic in the tunnel is protected)",
  nVpnGw: "VPN gateway",
  nFwSimpleInfo: "{0} rules · no zones",
  nFwZonesInfo: "{0} zones · {1} rules",
  nHaPairWith: "HA pair with: {0} (shared configuration)",
  nLbNoBackends:
    'Load balancer "{0}" has no backend servers listening on the VIP port behind it (connect servers behind the LB and check them in the pool).',
  nLbDown: 'Load balancer "{0}" is down — the VIP is unreachable.',
  nLbStandby:
    'Load balancer "{0}" is a passive standby — the active peer holds the VIP.',
  nSameVlanBlocked:
    'Both hosts are in the same VLAN/subnet, but the path between them goes through a {0} ("{1}") which terminates the L2 broadcast domain (routes/filters, does not bridge VLANs). The same subnet cannot be routed through it – connect them via L2 / L3 switches only (trunk).',
  nSameVlanNoLink:
    "Hosts are in the same VLAN/subnet, but there is no link between their locations.",
  nStpStorm:
    "Broadcast storm — a loop with no STP flooded the network; traffic in this broadcast domain won't pass.",
  stpModeLabel: "STP mode",
  stpModeRstp: "RSTP (default)",
  stpModeStp: "STP",
  stpModeOff: "Off",
  stpStormBadge: "STORM",
  stpBlockBadge: "STP block",
  stpStormTip:
    "A loop with no STP – a broadcast storm flooded the network. Turn STP on for at least one switch in the loop.",
  explStormOnCanvas: "(the loop flashes red on the canvas)",
  nL3Elem: "L3 device",
  hostsGroupLabel: "Hosts / servers",
  hostNoSeg: " (no network)",
  lbGroupLabel: "Load balancers (VIP)",
  nIdsAlertShort: 'IDS – ALERT (signature "{0}")',
  nIdsPassiveShort: "IDS – passive monitoring",
  nIpsInlineNoMatchShort: "IPS – inline inspection, no match",
  nIpsSameVlan:
    'IPS (inline prevention) blocked traffic matching signature "{0}" within the same VLAN.',
  nHostNoPorts:
    'Host "{0}" has no open ports – it listens on nothing (typical client).',
  nHostNoSvc:
    'The network allows the traffic, but host "{0}" has no service on port {1} (open: {2}).',
  nNoPort: "(no port)",
  netsOpenTip: "Open network settings (DNS, DHCP relay, reservations)",
  netsEmpty:
    "No VLANs yet. Add the first one with the button below and place hosts into it (edit host → pick network, then cable to a switch).",
  stVlanAdded: "Added VLAN",
  haCfgFw: "zones + rules",
  ipsBtnInline: "IPS · inline (blocks)",
  idsBtnPassive: "IDS · out-of-path (alert only)",
  sigDescPh: "description",
  sigColDesc: "Description",
  tType: "Type:",
  devTypeRouter: "Router · routes + NAT",
  devTypeL3: "L3 switch · routes between subnets",
  devTypeL2m: "Managed L2 switch · filters (ACL), no routing",
  devL2mInfo:
    "A managed L2 switch: unlike an ordinary (unmanaged) switch it supports an <b>ACL</b> (access control list) – it filters traffic by source/destination and port right at L2. It does <b>not route</b> between networks (VLANs) – that needs an L3 switch or a router. Rules are evaluated top-down; anything matching none passes implicitly.",
  devL2mDesc: "L2 switch + filters (ACL)",
  fwZoneNameTitle: "zone name",
  fwZoneIfacesTitle: "interfaces in zone",
  fwZoneDelTitle: "delete zone",
  fwNetTag: "network/VLAN",
  stImported: "Imported",
  stModalGone:
    "I closed the dialog – the device it showed is no longer in the topology (undone with Ctrl+Z, or deleted).",
  stSaveFailed:
    "Saving to browser storage failed (storage blocked or full). Your changes only last until you close this tab – export the topology to a file.",
  stOtherTab:
    "You changed the topology in another tab too. The last change overwrites the other one – better to work in a single tab.",
  matrixTooBig:
    "The matrix handles at most {0} networks, this topology has {1}. It would take too long to compute in the browser – test paths one by one on the canvas.",
  btnDisTooBig:
    "The topology is too large for this computation ({0} nodes, the cap is {1}) – the browser would freeze. Test paths one by one instead.",
  nLbVipOnly: "Load balancer only listens on VIP ports: {0}.",
  nSrcHostNoSeg: "Source host is not placed in any network.",
  nDstHostNoSeg: "Destination host is not placed in any network.",
  nSrcHostUnplugged: "Source host is not connected (no cable or Wi-Fi).",
  nDstHostUnplugged: "Destination host is not connected (no cable or Wi-Fi).",
  quarBadge: "QUARANTINE",
  nSrcQuar:
    "The source device is in quarantine – it has been cut off from the network (containment). Release it (right-click → Release from quarantine).",
  nDstQuar:
    "The destination device is in quarantine – it is cut off from the network even though a path leads to it. Release it if traffic is allowed there.",
  nSrcHostOff:
    "The source host is powered off – it sends nothing. Turn it on (right-click → power on).",
  nDstHostOff:
    "The destination host is powered off – it does not answer even though a path leads to it. Turn it on (right-click → power on).",
  nSrcAccessDown:
    "The source host is cut off – there's no active path to its network (check the cabling and active devices).",
  nBadGw:
    "The source host has a wrong default gateway – it can't get off its subnet.",
  nSrcNoIp:
    "The source host has no IP address – DHCP gave it none (off, no usable range, or an exhausted pool) and it has no manual IP set.",
  nDstNoIp:
    "The destination host has no IP address – DHCP gave it none (off, no usable range, or an exhausted pool) and it has no manual IP set.",
  nSrcPortSec:
    "Source host: port security – the access port is locked to a different MAC address, this host can't pass through it.",
  nSrcPortSecMax:
    'Source host: port security – the access port sees more MAC addresses than the "Max MACs" limit allows. The port drops the traffic.',
  nDstPortSec:
    "Destination host: port security – the access port is locked to a different MAC address, this host can't pass through it.",
  nDstPortSecMax:
    'Destination host: port security – the access port sees more MAC addresses than the "Max MACs" limit allows. The port drops the traffic.',
  nSrcBadIp:
    "The source host has an IP outside its subnet (wrong IP / mask) – it can't communicate.",
  nDstBadIp:
    "The destination host has an IP outside its subnet (wrong IP / mask) – it can't be reached.",
  nSrcIpConflict:
    "IP address conflict – another host on the same network has the same address. The source can't communicate reliably.",
  nDstIpConflict:
    "IP address conflict – another host on the same network has the same address. The destination can't communicate reliably.",
  nDstAccessDown:
    "The destination host is cut off – there's no active path to it from the network (check the cabling and active devices).",
  nSrcAccessDownNamed:
    "The source host is cut off – its access device {0} is turned off. Turn it back on (double-click → power on).",
  nDstAccessDownNamed:
    "The destination host is cut off – its access device {0} is turned off. Turn it back on (double-click → power on).",
  nSrcPortVlan:
    "Source host: the switch access port is set to a different VLAN – it won't carry the host's own VLAN.",
  nDstPortVlan:
    "Destination host: the switch access port is set to a different VLAN – it won't carry the host's own VLAN.",
  nL2SameVlan: "L2 switching (same VLAN, no routing)",
  nHubFlood: "Hub – flooded the frame to ALL ports (no MAC (CAM) table)",
  nApSameVlan: "Wi-Fi bridge (AP) – bridging within the same VLAN",
  nL3SameVlan:
    "L3 switch forwards within the VLAN (same subnet → acts as an L2 bridge, no routing)",
};

function _ls(k) {
  try {
    return localStorage.getItem(k);
  } catch (e) {
    return null;
  }
}
function t(key) {
  const v = STRINGS[key];
  return v !== undefined ? v : key;
}
function tf(key, ...args) {
  return t(key).replace(/\{(\d+)\}/g, (_, i) => args[i] ?? "");
}
let appMode = _ls("netsim_mode") || "simple";
if (appMode !== "simple" && appMode !== "advanced") appMode = "simple";
function isAdvanced() {
  return appMode === "advanced";
}

function segActive(segId, attr, val) {
  const s = document.getElementById(segId);
  if (!s) return;
  s.querySelectorAll("button").forEach((b) => {
    const on = b.getAttribute(attr) === val;
    b.classList.toggle("on", on);
    b.setAttribute("aria-pressed", on ? "true" : "false");
  });
}
function setMode(m, byUser) {
  const wasSimple = appMode !== "advanced";
  if (
    m !== "advanced" &&
    typeof showLogTab === "function" &&
    $("syslogPanel") &&
    ($("syslogPanel").style.display !== "none" ||
      $("flowsPanel").style.display !== "none")
  )
    showLogTab("Traffic");
  appMode = m === "advanced" ? "advanced" : "simple";
  try {
    localStorage.setItem("netsim_mode", appMode);
  } catch (e) {}
  document.body.classList.toggle("adv", isAdvanced());
  segActive("segMode", "data-mode", appMode);
  try {
    renderNetsView();
  } catch (e) {}

  try {
    if (typeof window.netRender === "function") window.netRender();
  } catch (e) {}

  if (
    !activeTask &&
    lastResult &&
    $("result") &&
    $("result").style.display !== "none"
  ) {
    showResult(lastResult, currentTraffic());
    const s = $("selSrc").value,
      d = dstEndpoint(s, $("selDst").value);
    if (s && d) runProbes(s, d);
  }

  if (byUser && isAdvanced() && wasSimple) {
    let hinted = false;
    try {
      hinted = localStorage.getItem("netsim_adv_hinted") === "1";
    } catch (e) {}
    if (!hinted) {
      try {
        localStorage.setItem("netsim_adv_hinted", "1");
      } catch (e) {}
      if (typeof openModeInfo === "function") openModeInfo("hint");
    }
  }
}

function modeInfoGroups() {
  return `<div class="mig-groups">
    <div class="mig-g"><h4>${icon("shieldcheck")}${t("miSec")}</h4><ul><li>${t("miSec1")}</li><li>${t("miSec2")}</li><li>${t("miSec3")}</li></ul></div>
    <div class="mig-g"><h4>${icon("network")}${t("miReal")}</h4><ul><li>${t("miReal1")}</li><li>${t("miReal2")}</li><li>${t("miReal3")}</li><li>${t("miReal4")}</li><li>${t("miReal5")}</li><li>${t("miReal6")}</li></ul></div>
    <div class="mig-g"><h4>${icon("pencil")}${t("miCfg")}</h4><ul><li>${t("miCfg1")}</li><li>${t("miCfg2")}</li><li>${t("miCfg3")}</li><li>${t("miCfg4")}</li><li>${t("miCfg5")}</li></ul></div>
  </div>
  <p style="font-size:12px;color:var(--muted);line-height:1.5;margin:10px 0 0">${t("miLoseSimple")}</p>`;
}
function openModeInfo(variant) {
  const isHint = variant === "hint";
  const lead = `<p class="mig-lead">${isHint ? t("miHintLead") : t("miLead")}</p>`;
  let foot;
  if (isHint) {
    foot = `<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:14px"><button class="btn primary" id="miOk">${t("miGotIt")}</button><button class="btn" id="miTour">${icon("learn")}${t("miShowTour")}</button></div>`;
  } else if (!isAdvanced()) {
    foot = `<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:14px"><button class="btn primary" id="miSwitch">${icon("unlock")}${t("miSwitchAdv")}</button><button class="btn" id="miClose">${t("miClose")}</button></div>`;
  } else {
    foot = `<div style="display:flex;margin-top:14px"><button class="btn primary" id="miClose" style="margin-left:auto">${t("miClose")}</button></div>`;
  }
  openModal(
    `<h2 style="font-family:var(--mono)">${icon("info")}${isHint ? t("miHintTitle") : t("miTitle")}</h2>${lead}${modeInfoGroups()}${foot}`,
  );
  modalBox.style.width = "min(460px,92vw)";
  modalCloseHook = () => {
    modalBox.style.width = "";
  };
  if ($("miClose")) $("miClose").onclick = closeModal;
  if ($("miOk")) $("miOk").onclick = closeModal;
  if ($("miSwitch"))
    $("miSwitch").onclick = () => {
      closeModal();
      setMode("advanced", true);
    };
  if ($("miTour"))
    $("miTour").onclick = () => {
      closeModal();
      openTutorial(TOUR_STEPS.findIndex((s) => s.k === "tour7"));
    };
}
const ICONS = {
  share:
    '<path d="M13 6.5a2.5 2.5 0 1 0 5 0 2.5 2.5 0 0 0-5 0"/><path d="M6 12a2.5 2.5 0 1 0 5 0 2.5 2.5 0 0 0-5 0" transform="translate(-4)"/><path d="M13 17.5a2.5 2.5 0 1 0 5 0 2.5 2.5 0 0 0-5 0"/><path d="M9 10.8 13.2 8M9 13.2l4.2 2.7"/>',
  dns: '<path d="M4 12h16"/><path d="M12 4a13 13 0 0 1 0 16 13 13 0 0 1 0-16Z"/><circle cx="12" cy="12" r="8"/>',
  iot: '<rect x="4" y="9" width="10" height="7" rx="1.5"/><path d="M17 7v10M20 5v14"/><path d="M7 12h4"/>',
  learn:
    '<path d="M2.5 9 12 5l9.5 4-9.5 4z"/><path d="M7 11.2V15c0 1.3 2.5 2.6 5 2.6s5-1.3 5-2.6v-3.8"/><path d="M21.5 9v4.3"/>',
  book: '<path d="M12 6.5C10.4 5.4 8 4.8 4 5.2v12.6c4-.4 6.4.2 8 1.2 1.6-1 4-1.6 8-1.2V5.2c-4-.4-6.4.2-8 1.3z"/><path d="M12 6.5v12.5"/>',
  tasks:
    '<rect x="5" y="5" width="14" height="16" rx="2"/><path d="M9 5V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1"/><path d="M8.8 13.2 11 15.4l4.4-4.6"/>',
  chart:
    '<path d="M4 20h16"/><path d="M7 20v-6"/><path d="M12 20V8"/><path d="M17 20v-9"/>',
  sparkle:
    '<path d="M12 3.5 13.7 9 19 10.7 13.7 12.4 12 18l-1.7-5.6L5 10.7 10.3 9z"/>',
  target:
    '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><path d="M12 1.5v3M12 19.5v3M1.5 12h3M19.5 12h3"/>',
  shield: '<path d="M12 3 20 6v6c0 4.8-3.4 7.5-8 9-4.6-1.5-8-4.2-8-9V6z"/>',
  shieldcheck:
    '<path d="M12 3 20 6v6c0 4.8-3.4 7.5-8 9-4.6-1.5-8-4.2-8-9V6z"/><path d="M8.5 12 11 14.5 15.5 9.8"/>',
  plug: '<path d="M9 2.5V8M15 2.5V8"/><path d="M7 8h10v2.5a5 5 0 0 1-10 0z"/><path d="M12 15.5V21.5"/>',
  file: '<path d="M13.5 3H7a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V7.5z"/><path d="M13.5 3v4.5H18"/><path d="M9 13h6M9 16.5h6"/>',
  link: '<path d="M10 14a3.5 3.5 0 0 0 5 0l3-3a3.5 3.5 0 0 0-5-5l-1.5 1.5"/><path d="M14 10a3.5 3.5 0 0 0-5 0l-3 3a3.5 3.5 0 0 0 5 5l1.5-1.5"/>',
  monitor:
    '<rect x="3" y="4" width="18" height="13" rx="2"/><path d="M9 21h6M12 17v4"/>',
  network:
    '<rect x="9" y="3" width="6" height="5" rx="1"/><rect x="3" y="16" width="6" height="5" rx="1"/><rect x="15" y="16" width="6" height="5" rx="1"/><path d="M12 8v3M6 16v-2.5h12V16"/>',
  lock: '<rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/>',
  unlock:
    '<rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8 10.5V7a4 4 0 0 1 7.7-1.4"/>',
  chat: '<path d="M20 4H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3v4l4-4h9a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1z"/>',
  trash:
    '<path d="M4 7h16"/><path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/><path d="M6.5 7 7.5 20a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1L17.5 7"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9 6.7 6.7M17.3 17.3l1.8 1.8M19.1 4.9l-1.8 1.8M6.7 17.3l-1.8 1.8"/>',
  moon: '<path d="M20.5 14.5A8.5 8.5 0 1 1 9.5 3.5a6.6 6.6 0 0 0 11 11z"/>',
  home: '<path d="M3.5 11 12 4l8.5 7"/><path d="M5.5 9.5V20h13V9.5"/><path d="M10 20v-5.5h4V20"/>',
  alert:
    '<path d="M12 4 21 20H3z"/><path d="M12 10v4.5"/><path d="M12 17.4v.1"/>',
  checkcircle:
    '<circle cx="12" cy="12" r="9"/><path d="M8 12.3 10.7 15 16 9.5"/>',
  image:
    '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9.5" r="1.8"/><path d="M4.5 18 10 12.5l4 4 2.5-2.5 3 3"/>',
  pencil: '<path d="M4 20h4L18.5 9.5l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>',
  power: '<path d="M12 3v8"/><path d="M7.5 6.5a8 8 0 1 0 9 0"/>',
  balance:
    '<path d="M12 4v16"/><path d="M7 20.5h10"/><path d="M5 9 12 6l7 3"/><path d="M2.5 14 5 9l2.5 5a2.5 2.5 0 0 1-5 0z"/><path d="M16.5 14 19 9l2.5 5a2.5 2.5 0 0 1-5 0z"/>',
  flame:
    '<path d="M12 3c2 3.5-1.2 4.8.8 7.5 1.4 1.9 3.7 1.2 3.7 4.6a4.5 4.5 0 0 1-9 0c0-2.4 1.6-2.6 1.6-4.8C9.1 8.4 11 6 12 3z"/>',
  bell: '<path d="M6 9a6 6 0 0 1 12 0c0 5 2 6.5 2 6.5H4S6 14 6 9z"/><path d="M10 19a2 2 0 0 0 4 0"/>',
  layers:
    '<path d="M12 3 21 8 12 13 3 8z"/><path d="M3 12 12 17 21 12"/><path d="M3 16 12 21 21 16"/>',
  energy:
    '<rect x="8" y="4" width="8" height="17" rx="2"/><path d="M8 7.5h8"/><path d="M12.5 9.5 10.8 13.5h1.5L11.3 18"/>',
  chevL: '<path d="M15 6 9 12l6 6"/>',
  chevR: '<path d="M9 6l6 6-6 6"/>',
  chevU: '<path d="M6 15l6-6 6 6"/>',
  chevD: '<path d="M6 9l6 6 6-6"/>',
  pin: '<path d="M12 17v5"/><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1z"/>',
  pinOff:
    '<path d="M12 17v5"/><path d="M15 9.34V6h1a2 2 0 0 0 0-4H7.89"/><path d="M2 2l20 20"/><path d="M9 9v1.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V17h11"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5.5"/><path d="M12 7.6v.1"/>',
  sliders:
    '<path d="M4 7h9M17 7h3"/><path d="M4 12h3M11 12h9"/><path d="M4 17h11M19 17h1"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="17" r="2"/>',
  globe:
    '<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a13.5 13.5 0 0 1 0 18 13.5 13.5 0 0 1 0-18z"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3.5 6.5 8.5 6.5 8.5-6.5"/>',
  ping: '<circle cx="12" cy="12" r="1.6"/><path d="M8.5 8.5a5 5 0 0 0 0 7"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M5.7 5.7a9 9 0 0 0 0 12.6"/><path d="M18.3 5.7a9 9 0 0 1 0 12.6"/>',
};
function icon(n, cls) {
  return (
    '<svg class="ico' +
    (cls ? " " + cls : "") +
    '" viewBox="0 0 24 24" aria-hidden="true">' +
    (ICONS[n] || "") +
    "</svg>"
  );
}
function initIcons() {
  document.querySelectorAll("[data-ico]").forEach((el) => {
    if (el.querySelector(":scope>.ico")) return;
    el.insertAdjacentHTML(
      "afterbegin",
      icon(el.getAttribute("data-ico"), el.getAttribute("data-ico-cls") || ""),
    );
  });
}

function initPanelToggles() {
  const main = document.querySelector("main");
  if (!main || document.getElementById("palRail")) return;
  const pal = $("palette"),
    tp = $("testpanel");
  if (!pal || !tp) return;

  const mkRail = (side) => {
    const r = document.createElement("button");
    r.id = side === "left" ? "palRail" : "tpRail";
    r.className = "panel-rail" + (side === "right" ? " right" : "");
    r.title = "Rozbalit panel";
    return r;
  };
  const mkColl = (side) => {
    const b = document.createElement("button");
    b.className = "panel-collapse";
    b.title = "Hide the panel (hover your mouse or click its edge to expand it)";
    return b;
  };
  const palRail = mkRail("left"),
    tpRail = mkRail("right");
  main.insertBefore(palRail, pal);
  main.appendChild(tpRail);
  const palC = mkColl("left"),
    tpC = mkColl("right");
  pal.insertBefore(palC, pal.firstChild);
  tp.insertBefore(tpC, tp.firstChild);
  let st = { left: false, right: false };
  try {
    const s = JSON.parse(localStorage.getItem("netsim_panels") || "{}");
    st.left = !!s.left;
    st.right = !!s.right;
  } catch (e) {}
  function apply() {
    pal.classList.toggle("collapsed", st.left);
    palRail.style.display = st.left ? "" : "none";
    if (!st.left) pal.classList.remove("peek");
    tp.classList.toggle("collapsed", st.right);
    tpRail.style.display = st.right ? "" : "none";
    if (!st.right) tp.classList.remove("peek");

    palC.innerHTML = icon(st.left ? "pinOff" : "pin");
    tpC.innerHTML = icon(st.right ? "pinOff" : "pin");
    palC.title = st.left
      ? "Pin the panel"
      : "Unpin the panel – it hides; hover its edge to expand it";
    tpC.title = st.right
      ? "Pin the panel"
      : "Unpin the panel – it hides; hover its edge to expand it";
    palRail.innerHTML = icon("chevR");
    tpRail.innerHTML = icon("chevL");
    try {
      localStorage.setItem("netsim_panels", JSON.stringify(st));
    } catch (e) {}
  }
  palC.onclick = () => {
    st.left = !st.left;
    apply();
  };
  tpC.onclick = () => {
    st.right = !st.right;
    apply();
  };
  window.pinPanels = () => {
    if (st.left || st.right) {
      st.left = false;
      st.right = false;
      apply();
    }
  };
  palRail.onclick = () => {
    st.left = false;
    apply();
  };
  tpRail.onclick = () => {
    st.right = false;
    apply();
  };
  palRail.onmouseenter = () => {
    if (st.left) pal.classList.add("peek");
  };
  pal.onmouseleave = () => {
    if (st.left) pal.classList.remove("peek");
  };
  tpRail.onmouseenter = () => {
    if (st.right) tp.classList.add("peek");
  };
  tp.onmouseleave = () => {
    if (st.right) tp.classList.remove("peek");
  };
  apply();
}

const SVGNS = "http://www.w3.org/2000/svg";
const TRAFFIC = {
  icmp: { label: "ICMP ping", proto: "icmp", port: null },
  http: {
    label: "HTTP (80)",
    proto: "tcp",
    port: 80,
    insecure: true,
    alt: "HTTPS (443)",
  },
  https: { label: "HTTPS (443)", proto: "tcp", port: 443 },
  ssh: { label: "SSH (22)", proto: "tcp", port: 22 },
  rdp: { label: "RDP (3389)", proto: "tcp", port: 3389 },
  smb: { label: "SMB (445)", proto: "tcp", port: 445 },
  dns: { label: "DNS (53)", proto: "udp", port: 53 },
  dhcp: { label: "DHCP (67)", proto: "udp", port: 67 },
  ftp: {
    label: "FTP (21)",
    proto: "tcp",
    port: 21,
    insecure: true,
    alt: "SFTP / FTPS",
  },
  telnet: {
    label: "Telnet (23)",
    proto: "tcp",
    port: 23,
    insecure: true,
    alt: "SSH (22)",
  },
  smtp: {
    label: "SMTP (25)",
    proto: "tcp",
    port: 25,
    insecure: true,
    alt: "SMTPS / STARTTLS",
  },
  ldap: {
    label: "LDAP (389)",
    proto: "tcp",
    port: 389,
    insecure: true,
    alt: "LDAPS (636)",
  },
  ldaps: { label: "LDAPS (636)", proto: "tcp", port: 636 },
  kerberos: { label: "Kerberos (88)", proto: "tcp", port: 88 },
  mssql: { label: "MSSQL (1433)", proto: "tcp", port: 1433 },
  mysql: { label: "MySQL (3306)", proto: "tcp", port: 3306 },
  postgres: { label: "PostgreSQL (5432)", proto: "tcp", port: 5432 },
  snmp: {
    label: "SNMP (161)",
    proto: "udp",
    port: 161,
    insecure: true,
    alt: "SNMPv3",
  },
  ntp: { label: "NTP (123)", proto: "udp", port: 123 },
  radius: { label: "RADIUS (1812)", proto: "udp", port: 1812 },
  syslog: { label: "Syslog (514)", proto: "udp", port: 514 },
  iscsi: { label: "iSCSI (3260)", proto: "tcp", port: 3260 },
  nfs: { label: "NFS (2049)", proto: "tcp", port: 2049 },
  sip: { label: "SIP signalling (5060)", proto: "udp", port: 5060 },
  sips: { label: "SIP over TLS (5061)", proto: "tcp", port: 5061 },
  custom: {
    get label() {
      return t("customTraffic");
    },
    proto: "tcp",
    port: 8080,
  },
};

const PROBE_FRIENDLY = {
  icmp: { en: "Ping" },
  http: { en: "Web (HTTP, unencrypted)" },
  https: { en: "Web (HTTPS)" },
  ssh: { en: "Remote admin (SSH)" },
  rdp: { en: "Remote desktop (RDP)" },
  smb: { en: "File sharing (SMB)" },
  dns: { en: "Name lookup (DNS)" },
  dhcp: { en: "Address assignment (DHCP)" },
  ftp: { en: "File transfer (FTP)" },
  telnet: { en: "Telnet (unencrypted)" },
  smtp: { en: "Email – sending (SMTP)" },
  ldap: { en: "Company directory (LDAP)" },
  ldaps: { en: "Company directory, encrypted (LDAPS)" },
  kerberos: { en: "Sign-in (Kerberos)" },
  mssql: { en: "Database (MS SQL)" },
  mysql: { en: "Database (MySQL)" },
  postgres: { en: "Database (PostgreSQL)" },
  snmp: { en: "Monitoring (SNMP)" },
  ntp: { en: "Time (NTP)" },
  radius: { en: "User authentication (RADIUS)" },
  syslog: { en: "Log collection (Syslog)" },
  iscsi: { en: "Storage, block level (iSCSI)" },
  nfs: { en: "Storage, file level (NFS)" },
  sip: { en: "VoIP call setup (SIP)" },
  sips: { en: "VoIP call setup, encrypted (SIP/TLS)" },
};
const SEG_COLORS = [
  "#16c6b4",
  "#2dd4bf",
  "#5eead4",
  "#22b8cf",
  "#7dd3fc",
  "#3ddc97",
  "#a3e635",
  "#fbbf24",
  "#fb923c",
  "#fb7185",
  "#f472b6",
  "#c084fc",
];
const NODE = {
  seg: { w: 168, h: 84 },
  dev: { w: 188, h: 68 },
  host: { w: 152, h: 56 },
};
const L3TYPES = ["l3switch", "router", "firewall", "loadbalancer", "vpn"];
const HOST_KINDS = [
  {
    id: "pc",
    get name() {
      return "PC";
    },
    icon: "desktop",
    prefix: "PC",
    svc: [],
  },
  {
    id: "ntb",
    get name() {
      return t("hkNotebook");
    },
    icon: "laptop",
    prefix: "NTB",
    svc: [],
  },
  {
    id: "server",
    get name() {
      return "Server";
    },
    icon: "server",
    prefix: "SRV",
    svc: [443, 80],
    ports: [1, 2, 4],
  },
  {
    id: "printer",
    get name() {
      return t("hkPrinter");
    },
    icon: "printer",
    prefix: "PRN",
    svc: [9100, 631],
  },
  {
    id: "voip",
    get name() {
      return t("hkPhone");
    },
    icon: "phone",
    prefix: "TEL",
    svc: [5060],
  },
  {
    id: "camera",
    get name() {
      return t("hkCamera");
    },
    icon: "camera",
    prefix: "CAM",
    svc: [554],
  },
  {
    id: "nas",
    get name() {
      return t("hkNas");
    },
    icon: "nas",
    prefix: "NAS",
    svc: [445],
    ports: [1, 2],
  },
  {
    id: "iot",
    get name() {
      return t("hkIot");
    },
    icon: "iot",
    prefix: "IOT",
    svc: [80],
  },
  {
    id: "mobile",
    get name() {
      return t("hkMobile");
    },
    icon: "mobile",
    prefix: "MOB",
    svc: [],
    wifiOnly: true,
  },
  {
    id: "tablet",
    get name() {
      return t("hkTablet");
    },
    icon: "tablet",
    prefix: "TAB",
    svc: [],
    wifiOnly: true,
  },
  {
    id: "tv",
    get name() {
      return t("hkTv");
    },
    icon: "tv",
    prefix: "TV",
    svc: [],
  },
  {
    id: "plc",
    get name() {
      return t("hkPlc");
    },
    icon: "plc",
    prefix: "PLC",
    svc: [502],
  },
  {
    id: "hmi",
    get name() {
      return t("hkHmi");
    },
    icon: "hmi",
    prefix: "HMI",
    svc: [],
  },
  {
    id: "historian",
    get name() {
      return t("hkHistorian");
    },
    icon: "historian",
    prefix: "HIST",
    svc: [1433],
  },
  {
    id: "honeypot",
    get name() {
      return t("hkHoneypot");
    },
    icon: "honeypot",
    prefix: "HONEY",
    svc: [22, 80, 445],
  },
];
function hostKind(id) {
  return HOST_KINDS.find((k) => k.id === id) || HOST_KINDS[0];
}

let DB = null;
