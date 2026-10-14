/* course10.js — content of Course 10 (split out of course.js; loaded on demand via course-core.js) */
/* ============================================================
   COURSE 10 — The router in depth (L3 internal mechanics + advanced routing + security). Scene c10Net (PC–SW–R1/R2–internet).
   ============================================================ */
var C10R={pc:[80,110],sw:[190,110],r1:[310,74],r2:[310,146],net:[510,110]};
function c10Net(pfx){
  return '<svg id="'+pfx+'svg" viewBox="0 0 600 200" width="100%" style="display:block">'
    +'<line x1="96" y1="110" x2="174" y2="110" style="stroke:var(--line2);stroke-width:1.6"/>'
    +'<line x1="206" y1="104" x2="294" y2="82" style="stroke:var(--line2);stroke-width:1.6"/>'
    +'<line x1="206" y1="116" x2="294" y2="138" style="stroke:var(--line2);stroke-width:1.6"/>'
    +'<line x1="326" y1="82" x2="494" y2="104" style="stroke:var(--line2);stroke-width:1.6"/>'
    +'<line x1="326" y1="138" x2="494" y2="116" style="stroke:var(--line2);stroke-width:1.6"/>'
    +'<g id="'+pfx+'glow"></g>'
    +csHost(80,110,'desktop','--blue','PC')+csDev(190,110,'l2switch','SW')+csDev(310,74,'router','R1')+csDev(310,146,'router','R2')+csHost(510,110,'globe','--red','Internet')
    +'<g id="'+pfx+'dyn"></g></svg>';
}
function c10P(pfx,intro,terms){
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+intro+'</p>'
    +'<div class="osi-stage">'+c10Net(pfx)+'</div><div class="m1-cap" id="'+pfx+'cap"></div>'
    +courseStepControls(pfx)+abbrBox(terms);
}
function c10Mount(pfx,STEPS){
  function show(i){var g=$(pfx+'glow');if(g)g.innerHTML=STEPS[i].glow||'';var d=$(pfx+'dyn');if(d)d.innerHTML=STEPS[i].dyn||'';var c=$(pfx+'cap');if(c)c.innerHTML='<span>'+STEPS[i].cap+'</span>';}
  courseStepper(pfx,STEPS.length,show);
}
function c10g(name,color){var p=C10R[name];return csGlow(p[0],p[1],color,20);}
function c10lbl(x,y,tx,c){return '<text x="'+x+'" y="'+y+'" text-anchor="middle" style="font:700 7.5px var(--mono);fill:var('+c+')">'+esc(tx)+'</text>';}
function c10pkt(p1,p2,color,dur){return '<rect x="-6" y="-4" width="12" height="9" rx="2" style="fill:var('+color+')"><animateMotion path="M '+p1+' L '+p2+'" dur="'+(dur||'1.4s')+'" repeatCount="indefinite"/></rect>';}
// routing table as a mini listing
function c10rt(rows){var o='<g transform="translate(236,6)"><rect x="0" y="0" width="150" height="'+(11+(rows.items||[]).length*10)+'" rx="3" style="fill:var(--panel2);stroke:var(--line2);stroke-width:1"/><text x="6" y="8" style="font:700 6.5px var(--mono);fill:var(--muted)">'+esc(rows.title||'route → next-hop')+'</text>';(rows.items||[]).forEach(function(r,i){o+='<text x="6" y="'+(18+i*10)+'" style="font:6.5px var(--mono);fill:var('+(r[2]||'--txt')+')">'+esc(r[0])+' → '+esc(r[1])+'</text>';});return o+'</g>';}
// L1M1 — how the routing table is built
function renderC10RtSources(){return c10P('caa',
  'Friday afternoon, half the company has no internet – and you are standing at the router, needing to read what it is doing right now and why it sends packets somewhere other than you expect. That is exactly what this course is for: looking under the router’s hood. And everything starts at its heart. The heart of a router is its <b>routing table</b> – a list of "to reach this network, go this way". Where do the entries come from? From three sources. <b>(1) Connected</b> – networks the router has <b>directly attached</b> to its interfaces (it knows them automatically). <b>(2) Static</b> – routes the admin <b>enters by hand</b> (the Routing and IP addresses course). <b>(3) Dynamic</b> – routes the router <b>learns from a protocol</b> like OSPF (the OSPF in depth course). Then for each packet the router looks in this table for where to send it. One aside about interfaces: a single <b>physical</b> interface can be split into several logical <b>subinterfaces</b>, each with its own IP and its own VLAN. That is exactly how <b>router-on-a-stick</b> from the Switching and VLANs course works – the router hangs off the switch on <b>one cable</b> and the table gains <b>connected routes into all those VLANs</b>, as if it had a separate interface for each.',
  [['connected route','a network directly attached to a router interface; it knows it automatically.'],['routing table','a list "network → which way/to whom"; the router decides where to send a packet by it.'],['subinterface','a logical interface on one physical port, each with its own IP and VLAN – the basis of router-on-a-stick.']]);}
function mountC10RtSources(){c10Mount('caa',[
  {glow:c10g('r1','--green'),dyn:c10rt({title:'connected',items:[['10.0.1.0/24',''+'direct','--green'],['10.0.2.0/24',''+'direct','--green']]}),cap:'<b>Connected</b>: networks on its own interfaces the router knows <b>immediately</b>, no config.'},
  {glow:c10g('r1','--cyan'),dyn:c10rt({title:'+ static',items:[['10.0.1.0/24',''+'conn','--green'],['10.0.9.0/24','R2 (static)','--cyan']]}),cap:'<b>Static</b>: remote networks the admin <b>adds by hand</b> – "to 10.0.9.0/24 via R2".'},
  {glow:c10g('r1','--violet'),dyn:c10rt({title:'+ dynamic (OSPF)',items:[['10.0.1.0/24',''+'conn','--green'],['10.0.20.0/24','OSPF','--violet']]}),cap:'<b>Dynamic</b>: the rest the router <b>learns from OSPF</b> itself. Three sources, one table.'}
]);}
// L1M2 — administrative distance
function renderC10Ad(){return c10P('cab',
  'What if <b>multiple sources</b> know a route to the <b>same</b> network – say the router hears it from OSPF and also has a manual static one? The router must decide whom to <b>trust more</b>. That’s what <b>administrative distance (AD)</b> is for – a trustworthiness number per source, where <b>lower wins</b>. A connected network has AD <b>0</b> (most trusted – I see it directly), static <b>1</b>, EIGRP <b>90</b>, OSPF <b>110</b>, RIP <b>120</b> – and the least trusted is <b>iBGP</b> at AD <b>200</b> (routes from a peer inside your own network that the router knows nothing about itself). So if you have both a static (1) and an OSPF (110) route to the same network, the router uses the <b>static</b> one. AD is "who is right"; only then does the metric inside the protocol matter. (We are simplifying: AD is just one step of the decision – the full order, where the <b>longest prefix</b> speaks first, comes in the very next module.)',
  [['administrative distance (AD)','the trustworthiness of a route source; lower wins (connected 0, static 1, EIGRP 90, OSPF 110, RIP 120, iBGP 200).'],['metric','decides only WITHIN one protocol (e.g. OSPF cost); AD decides BETWEEN sources.']]);}
function mountC10Ad(){c10Mount('cab',[
  {glow:c10g('r1','--cyan'),dyn:c10rt({title:'2 sources, 1 net',items:[['10.0.9.0 static','AD 1','--green'],['10.0.9.0 OSPF','AD 110','--amber']]}),cap:'For 10.0.9.0/24 the router has <b>two</b> routes: static (AD 1) and from OSPF (AD 110).'},
  {glow:c10g('r1','--green'),dyn:c10rt({title:'lower AD wins',items:[['10.0.9.0','static (AD 1) ✓','--green']]}),cap:'<b>Lower AD wins</b> → the router uses the <b>static</b> one (1 &lt; 110). It keeps the OSPF one in reserve.'},
  {glow:c10g('r1','--violet'),dyn:c10lbl(310,122,'connected 0 · static 1 · OSPF 110','--violet'),cap:'Trust order: <b>connected 0 → static 1 → EIGRP 90 → OSPF 110 → RIP 120 → iBGP 200</b>. The metric (cost) decides only within one protocol.'}
]);}
// L1M3 — longest prefix
function renderC10Lpm(){return c10P('cac',
  'One more rule, and it’s the <b>most important</b>: when <b>multiple routes</b> in the table match a destination, the one with the <b>longest prefix (longest prefix match)</b> wins – the most specific network (the slash notation, e.g. /24, you know from subnetting in the ISO/OSI and TCP/IP course – a higher number = a narrower, more specific network). Example: you have a route to <b>10.0.0.0/8</b> (broad) and to <b>10.0.5.0/24</b> (narrow) and a packet heads to 10.0.5.10. Both "match", but the router picks <b>/24</b> because it’s <b>more specific</b>. Note – this decision <b>takes precedence over</b> administrative distance (it is made first): the longest prefix is chosen first, and only <b>among equal-length</b> prefixes do AD and then the metric decide. That’s also why the default route (0.0.0.0/0, the shortest possible prefix) is used only when nothing more specific matches.',
  [['longest prefix match','the most specific (longest) prefix matching the destination wins; it decides first.'],['default route','0.0.0.0/0 – the shortest prefix; used only when nothing more specific matches.']]);}
function mountC10Lpm(){c10Mount('cac',[
  {glow:c10g('r1','--cyan'),dyn:c10rt({title:'dest 10.0.5.10',items:[['10.0.0.0/8','…','--amber'],['10.0.5.0/24','…','--green'],['0.0.0.0/0','default','--muted']]}),cap:'Three routes <b>match</b> 10.0.5.10: /8, /24 and the default /0. Which to pick?'},
  {glow:c10g('r1','--green'),dyn:c10rt({title:'longest prefix',items:[['10.0.5.0/24','✓ '+'most specific','--green']]}),cap:'<b>/24</b> wins – the <b>longest (most specific)</b> prefix. /8 and the default are too broad.'},
  {glow:c10g('r1','--violet'),dyn:c10lbl(310,122,'LPM > AD > '+'metric','--violet'),cap:'Decision order: <b>longest prefix first</b>, then (among equals) AD, then metric. The default is the last resort.'}
]);}
// L2M1 — packet processing
function renderC10Forward(){return c10P('cad',
  'What does a router <b>physically do</b> with a packet? The packet arrives on an interface. The router looks at the <b>destination IP</b>, finds the <b>best route</b> in the table (longest prefix) and from it the <b>next hop</b> and the outgoing interface. Then it <b>rewrites the packet at Layer 2</b>: rewrites both <b>MACs</b> (the physical address for the local network, from the How networks work course; new source = its outgoing interface, new destination = the next-hop’s MAC), <b>decrements TTL</b> by 1 and sends it out. The <b>IP addresses stay</b> (who→whom doesn’t change, only the MAC at each hop). The router repeats this hop by hop until the packet reaches the destination.',
  [['next hop','the IP of the next router I hand the packet to per the table.'],['TTL','Time To Live – a hop counter; each router decrements it by 1, at zero the packet is dropped (loop protection).']]);}
function mountC10Forward(){c10Mount('cad',[
  {glow:c10g('sw','--cyan')+c10g('r1','--cyan'),dyn:c10pkt('206 104','294 82','--cyan')+c10lbl(310,122,'dest IP → table','--cyan'),cap:'The packet arrives. The router reads the <b>destination IP</b> and finds the best route (next hop) in the table.'},
  {glow:c10g('r1','--violet'),dyn:c10lbl(310,122,'new dst MAC + TTL−1','--violet'),cap:'It rewrites the <b>L2 header</b>: new destination MAC = next hop, decrements <b>TTL by 1</b>. The IPs stay.'},
  {glow:c10g('r1','--green')+c10g('net','--green'),dyn:c10pkt('326 82','494 104','--green'),cap:'It sends the packet out the right interface. And this repeats <b>hop by hop</b> to the destination.'}
]);}
// L2M2 — ARP for the next hop
function renderC10Arp(){return c10P('cae',
  'Wait – the router knows the <b>IP</b> of the next hop, but at Layer 2 it needs its <b>MAC</b>. How does it get it? <b>ARP</b> (Address Resolution Protocol): the router asks on that network by broadcast "<b>who has IP 10.0.2.1?</b>", the owner replies "<b>me, and here’s my MAC</b>". The router stores the <b>IP→MAC</b> pair in its <b>ARP cache</b> (for next time) and only now fills in the destination MAC and sends the packet. That’s why the first packet to a new next hop briefly "waits for ARP". This small detail joins the L3 decision (where) with L2 delivery (to whom physically).',
  [['ARP','resolving IP → MAC by asking on the network; the result is stored in the ARP cache.'],['ARP cache','a memory of learned IP→MAC pairs so it needn’t ask for every packet.']]);}
function mountC10Arp(){c10Mount('cae',[
  {glow:c10g('r1','--cyan')+c10g('net','--cyan'),dyn:c10pkt('326 82','494 104','--cyan')+c10lbl(400,100,'"who has 10.0.2.1?"','--cyan'),cap:'The router knows the next hop’s IP but not its MAC. It sends an <b>ARP request</b>: "who has this IP?".'},
  {glow:c10g('r1','--green')+c10g('net','--green'),dyn:c10pkt('494 104','326 82','--green')+c10lbl(400,100,'"me, MAC = …"','--green'),cap:'The owner replies with its <b>MAC</b>. The router stores the <b>IP→MAC</b> pair in its ARP cache.'},
  {glow:c10g('r1','--violet')+c10g('net','--violet'),dyn:c10pkt('326 82','494 104','--violet'),cap:'Now it fills in the destination MAC and <b>sends</b> the packet. Next time it doesn’t ask – it’s in the cache.'}
]);}
// L2M3 — when there's no route
function renderC10NoRoute(){return c10P('caf',
  'And what if the router has <b>no route</b> for the destination (neither specific nor default)? It can’t send the packet "nowhere" – so it <b>drops</b> it. A well-behaved router then sends the sender back an <b>ICMP "destination unreachable"</b> ("I can’t deliver this"). A packet is likewise dropped when its <b>TTL expires</b> (reaches 0) – this protects against forever-circling in a loop and generates "time exceeded" (which <code>traceroute</code> relies on). A drop isn’t a router fault – it’s the correct reaction to a missing route or a loop. The same "I can’t deliver, and I’ll say so" family includes <b>MTU</b> – the largest packet a link can carry (on Ethernet usually <b>1500 bytes</b>). When the router must send a bigger packet onto a link with a smaller MTU, it either <b>splits it into fragments</b> (the destination reassembles them) or – if the packet has the <b>DF bit</b> set ("don’t fragment") – it <b>drops</b> the packet and sends back an ICMP "<b>fragmentation needed</b>". From that the sender learns to send smaller packets (Path MTU Discovery). If someone blocks this ICMP on a firewall, you get a nasty fault: small packets get through, big ones vanish and the connection "freezes" mid-transfer.',
  [['ICMP unreachable','a "can’t deliver" message the router sends the source when it has no route to the destination.'],['TTL expires','the hop counter reaches 0 → the packet is dropped (loop protection); the basis of traceroute.'],['MTU','the largest packet a link can carry (Ethernet usually 1500 B); anything bigger gets fragmented.'],['DF bit','the "don’t fragment" flag; the router drops the oversized packet and sends ICMP "fragmentation needed".']]);}
function mountC10NoRoute(){c10Mount('caf',[
  {glow:c10g('r1','--amber'),dyn:c10rt({title:'dest 8.8.8.8?',items:[['10.0.0.0/8','…','--muted'],['??? 8.8.8.8','—','--red']]}),cap:'The packet heads to 8.8.8.8, but the router has <b>no route</b> for it (not even a default). Now what?'},
  {glow:c10g('r1','--red')+c10g('sw','--red'),dyn:c10pkt('294 82','206 104','--red')+c10lbl(250,100,'ICMP unreachable','--red'),cap:'The router <b>drops</b> the packet and sends the sender <b>ICMP "unreachable"</b> – "I can’t deliver this".'},
  {glow:c10g('r1','--amber'),dyn:c10lbl(310,122,'TTL = 0 → dropped','--amber'),cap:'A packet whose <b>TTL expires</b> (a loop) ends the same. The drop is correct – it protects the network.'}
]);}
// L3M1 — static NAT
function renderC10NatStatic(){return c10P('cag',
  'Routers often also do <b>NAT</b> (address translation) – from the Routing and IP addresses course you know it hides a private network behind a public IP (in the simulator NAT is done by the edge device – router or firewall; <b>port forwarding</b> is configured on the router as well as the firewall – see the ch-rtpf challenge – while <b>static 1:1 NAT</b> is firewall-only). Now in detail, by type. <b>Static NAT</b> is a <b>fixed 1:1</b> mapping: one private IP ↔ one public, permanently. It’s useful when an internal server must be <b>permanently reachable from outside at a fixed public address</b> (and also goes out under the same one). It’s predictable, but "consumes" one public IP per server.',
  [['static NAT','a fixed 1:1 mapping private ↔ public IP; for a permanently reachable server.'],['NAT','Network Address Translation – translation between private and public IP addresses.']]);}
function mountC10NatStatic(){c10Mount('cag',[
  {glow:c10g('r1','--cyan'),dyn:c10lbl(310,122,'10.0.0.20 ↔ 203.0.113.20','--cyan'),cap:'<b>Static NAT</b>: server 10.0.0.20 has the public 203.0.113.20 <b>permanently</b> assigned.'},
  {glow:c10g('net','--green')+c10g('r1','--green'),dyn:c10pkt('494 104','326 82','--green'),cap:'Anyone from the internet hits <b>203.0.113.20</b> → the router translates to <b>10.0.0.20</b>. The server is always reachable.'},
  {glow:c10g('r1','--violet'),dyn:c10lbl(310,122,'1:1 '+'permanent','--violet'),cap:'It’s <b>1:1 permanent</b> – predictable, but consumes one public IP per server. <b>Try it</b> in the task “Expose a server from outside (static NAT 1:1)” – in the simulator.'}
]);}
// L3M2 — dynamic NAT + PAT
function renderC10Pat(){return c10P('cah',
  'Public IPs are scarce, and a home/company has dozens inside. <b>Dynamic NAT</b> assigns private addresses a public one from a <b>pool</b> (first come), but still needs as many publics as there are devices communicating at once. The solution everyone uses: <b>PAT (Port Address Translation) / NAT overload</b> – <b>all inside hosts share one public IP</b>, and the router tells them apart by <b>source port</b>. PC-A:50000 and PC-B:50000 both go out as 203.0.113.1, but with a <b>different assigned port</b>; by it the router returns replies to the right one. This is how thousands of devices hide behind one public IP.',
  [['PAT','Port Address Translation (NAT overload) – many inside hosts behind one public IP, told apart by port.'],['dynamic NAT','assigning a public from a pool by order; without overload it needs a public per simultaneously communicating device.']]);}
function mountC10Pat(){c10Mount('cah',[
  {glow:c10g('pc','--cyan')+c10g('sw','--cyan')+c10g('r1','--cyan'),dyn:c10pkt('96 110','174 110','--cyan')+c10lbl(310,122,'10.0.0.10:50000','--cyan'),cap:'PC outbound: source 10.0.0.10:50000. A private address can’t go on the internet.'},
  {glow:c10g('r1','--green'),dyn:c10lbl(310,122,'→ 203.0.113.1:40001','--green'),cap:'<b>PAT</b> rewrites the source to the <b>public IP + an assigned port</b> (203.0.113.1:40001) and records the pair.'},
  {glow:c10g('r1','--violet'),dyn:c10lbl(310,122,'port tells whom to return to','--violet'),cap:'The reply comes to port 40001 → the router knows it’s the PC’s. <b>Thousands of devices behind one IP.</b>'}
]);}
// L3M3 — port forwarding + hairpin
function renderC10PortFwd(){return c10P('cai',
  'PAT handles the way <b>out</b>. But what if an inside server should accept connections <b>from outside</b>? From outside there’s no one to reply to – the router doesn’t know which inside host to give it to. Hence <b>port forwarding (static PAT / DNAT)</b>: you set a rule "inbound to <b>public IP:443</b> redirect to <b>10.0.0.20:443</b>". This exposes one inside port to the world (exactly what the simulator task does). A special case is <b>hairpin NAT</b>: an inside client wants to reach its own server <b>via its public IP</b> (say, by typing the domain). But the public address is <b>not on the local network</b>, so the packet heads to the gateway – and the router has to "turn it back" inside. You get to try the static NAT from the first module in the task that follows.',
  [['port forwarding (DNAT)','redirects an inbound public port to a specific inside IP:port – exposes an inside service.'],['hairpin NAT','an inside client reaches an inside server via its PUBLIC IP; traffic turns around at the router.']]);}
function mountC10PortFwd(){c10Mount('cai',[
  {glow:c10g('net','--cyan')+c10g('r1','--cyan'),dyn:c10pkt('494 104','326 82','--cyan')+c10lbl(310,122,'from outside to :443','--cyan'),cap:'A connection arrives from the internet to <b>public IP:443</b>. Which inside host to give it to? The router can’t tell by itself.'},
  {glow:c10g('r1','--green'),dyn:c10lbl(310,122,'→ 10.0.0.20:443','--green'),cap:'<b>Port forwarding</b>: a rule ":443 → 10.0.0.20:443". Now the router knows where to send it. The server is reachable from outside.'},
  {glow:c10g('pc','--violet')+c10g('sw','--violet')+c10g('r1','--violet'),dyn:c10pkt('96 110','294 82','--violet')+c10pkt('294 82','96 110','--violet','1.9s')+c10lbl(310,122,'hairpin','--violet'),cap:'<b>Hairpin</b>: even an inside PC reaching the server via its <b>public</b> IP goes through the router and "turns back" inside.'}
]);}
// L4M1 — default route
function renderC10Default(){return c10P('caj',
  'You can’t hold the <b>whole internet</b> in the table (millions of networks). Hence the <b>default route (0.0.0.0/0)</b> – "whatever I don’t recognize, send <b>here</b>" (typically to the ISP). It’s the <b>shortest possible prefix</b>, so it’s used <b>last of all</b>, when nothing more specific matches (longest prefix from lesson 1). It’s also called the <b>gateway of last resort</b>. For end ("stub") networks with only one way out, a <b>single</b> default route suffices instead of thousands of entries.',
  [['default route','0.0.0.0/0 – "where to send the unknown"; the gateway of last resort, typically to the ISP.'],['stub network','an end network with a single way out; a default route alone suffices.']]);}
function mountC10Default(){c10Mount('caj',[
  {glow:c10g('r1','--cyan'),dyn:c10rt({title:'inside known…',items:[['10.0.0.0/8',''+'internal','--green'],['0.0.0.0/0','??? ','--amber']]}),cap:'The router knows internal networks. But the internet (millions of nets) won’t fit. What about an unknown destination?'},
  {glow:c10g('r1','--green')+c10g('net','--green'),dyn:c10rt({title:'default out',items:[['0.0.0.0/0',''+'to ISP','--green']]})+c10pkt('326 82','494 104','--green'),cap:'<b>Default route 0.0.0.0/0 → to the ISP</b>. The unknown goes here. One entry instead of the whole internet.'},
  {glow:c10g('r1','--violet'),dyn:c10lbl(310,122,'gateway of last resort','--violet'),cap:'It’s used <b>last</b> (shortest prefix). For stub networks with a single way out it’s all you need.'}
]);}
// L4M2 — floating static
function renderC10Floating(){return c10P('cak',
  'You want a <b>backup</b>: the main path via R1, and if it fails, let it go via R2. The trick is a <b>floating static route</b> – a backup static route with an <b>artificially raised administrative distance</b>. The main route has, say, AD 1, the backup you set to AD 5. As long as the main lives (lower AD), the router uses <b>only it</b>; the backup "floats" outside the table. As soon as the main disappears (typically its interface goes down or its next-hop stops being reachable – a static route has no "heartbeat" of its own), the <b>backup pops into</b> the table and traffic flows via R2. It’s a simple <b>backup without a dynamic protocol</b> – cheap and predictable.',
  [['floating static','a backup static route with a higher AD; it activates when the main (lower AD) disappears.'],['backup path','a second path that takes over after the main fails – here without a dynamic protocol.']]);}
function mountC10Floating(){c10Mount('cak',[
  {glow:c10g('sw','--green')+c10g('r1','--green'),dyn:c10rt({title:'main vs backup',items:[['… via R1','AD 1 ✓','--green'],['… via R2','AD 5','--muted']]})+c10pkt('206 104','294 82','--green'),cap:'Main path via R1 (AD 1). The backup via R2 has a <b>higher AD 5</b> → unused for now.'},
  {glow:c10g('r1','--red'),dyn:'<line x1="206" y1="104" x2="294" y2="82" style="stroke:var(--red);stroke-width:2.4;stroke-dasharray:5 4"/>'+c10lbl(250,96,'R1 down','--red'),cap:'R1 <b>fails</b>. The main route (AD 1) disappears from the table.'},
  {glow:c10g('sw','--green')+c10g('r2','--green'),dyn:c10rt({title:'backup pops in',items:[['… via R2','AD 5 ✓','--green']]})+c10pkt('206 116','294 138','--green'),cap:'The <b>floating static</b> (AD 5) <b>pops into</b> the table and traffic flows via R2. A backup without dynamic routing.'}
]);}
// L4M3 — stub vs transit
function renderC10StubTransit(){return c10P('cal',
  'When is a default enough and when not? It depends on the router’s <b>role</b>. A <b>stub (edge) router</b> has only <b>one way out</b> and only "its own" networks behind it – a <b>default route is plenty</b> (send everything unknown out). A <b>transit router</b>, by contrast, <b>connects several networks together</b> and traffic <b>flows through it</b> in various directions – it must know <b>specific routes</b> to all those networks (a default would send everything one way and miss the rest). Same box, different role = different demands on the table. So a large network combines a default (at the edge) with dynamic routing (inside).',
  [['stub router','an edge router with a single way out; a default route suffices.'],['transit router','connects several networks, traffic flows through it; needs specific routes, not just a default.']]);}
function mountC10StubTransit(){c10Mount('cal',[
  {glow:c10g('r1','--green')+c10g('net','--green'),dyn:c10rt({title:'R1 (stub): table',items:[['0.0.0.0/0','out','--green']]})+c10pkt('326 82','494 104','--green')+c10lbl(310,122,'stub: 1 way out','--green'),cap:'<b>Stub router</b>: one way out, its own networks behind it. <b>A default route is plenty.</b>'},
  {glow:c10g('sw','--amber')+c10g('r2','--amber')+c10g('net','--amber'),dyn:c10rt({title:'R2 (transit): table',items:[['10.0.0.0/24','SW','--amber'],['192.168.0.0/24','R1','--amber'],['0.0.0.0/0','?','--red']]})+c10pkt('206 116','294 138','--amber')+c10pkt('326 138','494 116','--amber','1.0s')+c10lbl(310,193,'transit: flows many ways','--amber'),cap:'<b>Transit router</b>: connects several networks, traffic flows in various ways. A default <b>isn’t enough</b>.'},
  {glow:c10g('pc','--violet')+c10g('sw','--violet')+c10g('r1','--violet'),dyn:c10rt({title:'the combination in practice',items:[['10.0.0.0/24','inside: OSPF','--violet'],['0.0.0.0/0','edge: default','--green']]})+c10pkt('96 110','174 110','--violet')+c10pkt('206 104','294 82','--violet','1.0s')+c10lbl(310,122,'edge: default · inside: dynamic','--violet'),cap:'So you combine: <b>default at the edge</b>, <b>dynamic routing (OSPF) inside</b>. The role drives the table.'}
]);}
// L5M1 — the single-gateway problem
function renderC10FhrpWhy(){return c10P('cam',
  'End devices have <b>one default gateway</b> in their settings (one router IP). But that’s a <b>single point of failure</b>: when that router fails, the whole network loses its way out – even if a second, backup router stands right next to it. Because clients only know <b>that one IP</b>, and rewriting it by hand on hundreds of PCs isn’t feasible. We need <b>two routers to appear as one gateway</b> to the outside and quietly take turns between themselves. That’s exactly what <b>FHRP</b> (First-Hop Redundancy Protocol) solves – next module (HSRP/VRRP).',
  [['default gateway','the single router IP a client has set as its way out – and thus a point of failure.'],['FHRP','First-Hop Redundancy Protocol – two routers appear as one gateway and back each other up.']]);}
function mountC10FhrpWhy(){c10Mount('cam',[
  {glow:c10g('pc','--cyan')+c10g('r1','--cyan'),dyn:c10lbl(190,100,'gateway = 10.0.0.1 (R1)','--cyan'),cap:'The PC has <b>one gateway</b> set = R1’s IP. All outbound traffic goes via R1.'},
  {glow:c10g('r1','--red'),dyn:'<line x1="206" y1="104" x2="294" y2="82" style="stroke:var(--red);stroke-width:2.4;stroke-dasharray:5 4"/>'+c10lbl(240,110,'R1 down → no way out','--red'),cap:'R1 <b>fails</b> → the PC loses its gateway. R2 is right there, but the PC <b>doesn’t know</b> its IP. Rewrite hundreds of PCs by hand? No.'},
  {glow:c10g('r1','--green')+c10g('r2','--green'),dyn:c10lbl(310,193,'we want: 2 routers = 1 gateway','--green'),cap:'We need <b>two routers to appear as one gateway</b> and back each other up. That’s FHRP – next module.'}
]);}
// L5M2 — HSRP/VRRP
function renderC10Hsrp(){return c10P('can',
  '<b>HSRP</b> (and its open-standard counterpart <b>VRRP</b>) turns two routers into <b>one virtual gateway</b>. It creates a <b>virtual IP</b> and a <b>virtual MAC</b> that clients get as their default gateway – and they have no idea two physical routers stand behind it. One is <b>active</b> (forwards traffic), the other <b>standby</b> (waits). Who is active is decided by <b>priority</b> (the higher number wins). Both send short <b>hellos</b>; when the active goes quiet, the standby <b>takes over within a few seconds</b> the same virtual IP and MAC. For clients <b>nothing changed</b> – the gateway "is still the same". A router failure without a network outage.',
  [['HSRP / VRRP','First-Hop Redundancy: a virtual IP+MAC, one router active, one standby; VRRP is the open standard.'],['virtual IP/MAC','a shared gateway address held by the active router; the standby takes it over on failure.']]);}
function mountC10Hsrp(){c10Mount('can',[
  {glow:c10g('r1','--green')+c10g('r2','--cyan'),dyn:c10lbl(310,36,'virtual gateway 10.0.0.1','--green')+c10lbl(310,48,'R1 active · R2 standby','--muted'),cap:'R1+R2 share a <b>virtual IP+MAC</b> 10.0.0.1. R1 is <b>active</b> (forwards), R2 is <b>standby</b>.'},
  {glow:c10g('pc','--green')+c10g('sw','--green')+c10g('r1','--green'),dyn:c10pkt('96 110','294 82','--green'),cap:'The PC has <b>that virtual IP</b> as its gateway. It has no idea there are two routers – it talks "to the gateway".'},
  {glow:c10g('r1','--red')+c10g('sw','--green')+c10g('r2','--green'),dyn:'<line x1="206" y1="104" x2="294" y2="82" style="stroke:var(--red);stroke-width:2.2;stroke-dasharray:5 4"/>'+c10pkt('206 116','294 138','--green')+c10lbl(310,193,'R2 took over','--green'),cap:'R1 fails → <b>R2 takes over within seconds</b> the same virtual IP+MAC. For the PC <b>nothing changed</b>. No outage.'}
]);}
// L5M3 — gateway load balancing
function renderC10Glbp(){return c10P('cao',
  'HSRP/VRRP have one "shortcoming": the <b>standby router just waits</b> and does nothing – wasteful. There are variants that can also <b>balance the load</b> across both gateways (e.g. <b>GLBP</b>): client traffic is split (in practice GLBP has one virtual IP gateway, but it answers ARP queries "who has the gateway IP?" with alternating virtual MAC addresses – so different clients end up pointed at different physical routers) so <b>both routers work at once</b>, and if one fails the other takes over. But don’t confuse it: this is redundancy of the <b>first gateway</b> (where I send a packet out of my network) – different from redundancy of the <b>path</b> inside (OSPF from the OSPF in depth course) or redundancy of the <b>link</b> at L2 (STP from the Redundancy and Spanning Tree course). Each layer has its own backup; together they keep the network up.',
  [['GLBP','an FHRP variant that also balances load across gateways (both routers work at once).'],['three layers of redundancy','gateway (FHRP) vs path (OSPF) vs link (STP) – each handles a different level of failure.']]);}
function mountC10Glbp(){c10Mount('cao',[
  {glow:c10g('r2','--muted'),dyn:c10lbl(310,193,'standby just waits = waste','--amber'),cap:'With HSRP the <b>standby just waits</b>. The second router goes unused. A waste of capacity.'},
  {glow:c10g('pc','--green')+c10g('sw','--green')+c10g('r1','--green')+c10g('r2','--green'),dyn:c10pkt('96 110','294 82','--green')+c10pkt('96 110','294 138','--green')+c10lbl(310,193,'GLBP: '+'both work','--green'),cap:'<b>GLBP</b> splits traffic → <b>both routers forward at once</b>, and if one fails the other takes over.'},
  {glow:c10g('r1','--violet')+c10g('r2','--violet'),dyn:c10lbl(310,193,'gateway (FHRP) ≠ path (OSPF) ≠ link (STP)','--violet'),cap:'Don’t confuse three redundancies: <b>gateway (FHRP)</b>, <b>path (OSPF)</b>, <b>link (STP)</b>. Each a different level.'}
]);}
// L6M1 — control vs data plane
function renderC10Planes(){return c10P('cap',
  'For router security it’s key to distinguish <b>two planes</b>. The <b>data plane</b> = <b>transit traffic</b> that merely <b>flows through</b> the router from one network to another. The <b>control plane</b> = the <b>router’s own</b> processes: routing protocols (OSPF), management (SSH), ARP… i.e. traffic <b>aimed at the router</b>. Why separate them? Because an attack on the <b>control plane</b> (flooding the router with fake OSPF/ARP/management packets) can take down its "brain", even if the data plane would otherwise handle the traffic. The defense is called <b>CoPP</b> (Control Plane Policing) – it limits how much traffic may reach the control plane so no one can overwhelm it.',
  [['data plane','transit traffic that merely flows through the router between networks.'],['control plane','the router’s own processes (routing, management, ARP); CoPP protects them from overload.'],['CoPP','Control Plane Policing – a limit on how much traffic may reach the router’s control plane.']]);}
function mountC10Planes(){c10Mount('cap',[
  {glow:c10g('pc','--green')+c10g('sw','--green')+c10g('r1','--green')+c10g('net','--green'),dyn:c10pkt('96 110','294 82','--green')+c10pkt('326 82','494 104','--green')+c10lbl(310,122,'data plane: '+'flows through','--green'),cap:'<b>Data plane</b>: traffic merely <b>flows through</b> the router (PC → internet). That’s its everyday job.'},
  {glow:c10g('r1','--cyan'),dyn:c10lbl(310,122,'control plane: OSPF, SSH, ARP','--cyan'),cap:'<b>Control plane</b>: traffic <b>for the router itself</b> – its "brain" (routing protocols, management).'},
  {glow:c10g('r1','--red'),dyn:c10lbl(310,122,'brain flood → CoPP','--red'),cap:'An attack floods the <b>control plane</b> with fake packets → the router "freezes". Defense: <b>CoPP</b> limits traffic to the brain.'}
]);}
// L6M4 — wildcard mask
function renderC10Wildcard(){return c10P('cav',
  'In someone else’s configuration you hit a line like <b>10.0.0.0 0.0.0.255</b> and you think somebody got the mask wrong. They didn’t – it’s a <b>wildcard mask</b>, and it is a <b>subnet mask turned inside out</b>. You read it bit by bit and it has only two rules: <b>0 = this bit must match</b>, <b>1 = this bit doesn’t matter</b>. So the subnet mask 255.255.255.0 (that is /24) looks like <b>0.0.0.255</b> as a wildcard: the first three octets must match exactly, the last one is free – together "the whole /24 network". The conversion is mechanical: <b>255 minus each octet</b> of the subnet mask. Why does that work? At the bit level a wildcard is the <b>mirror of the mask</b>: where the mask has a one (the bit belongs to the network), the wildcard has a zero (must match) – and vice versa. The /24 mask is 11111111.11111111.11111111.00000000, its wildcard 00000000.00000000.00000000.11111111, i.e. 0.0.0.255. Subtracting from 255 is just a faster way of writing that flip. The typical cases are worth knowing by heart: <b>0.0.0.0</b> = <b>one specific address</b> (everything must match – it is written as <b>host</b>; careful, here it is a keyword for an exact match, not "host = a device on the network" as you know it from the mask), <b>0.0.0.255</b> = a whole /24, <b>0.0.255.255</b> = a whole /16 and <b>255.255.255.255</b> = <b>anything</b> (nothing matters – the shorthand is <b>any</b>). Where do you meet it? In two places: in <b>ACLs</b>, where the wildcard says which addresses a rule applies to (the very next module), and in <b>OSPF</b>, where the <b>network</b> command picks which interfaces join the protocol. There is nothing magical about it, it is just an older notational habit – but you have to be able to read it, because configurations and exams throw it at you without warning. (You never type a wildcard in this simulator; ranges are written as CIDR here.)',
  [['wildcard mask','a subnet mask inverted: 0 = the bit must match, 1 = the bit doesn’t matter (255.255.255.0 → 0.0.0.255).'],['host / any','host = wildcard 0.0.0.0 (a single address); any = 255.255.255.255 (anything).']]);}
function mountC10Wildcard(){c10Mount('cav',[
  {glow:c10g('r1','--cyan'),dyn:c10rt({title:'mask → wildcard',items:[['255.255.255.0','0.0.0.255','--cyan']]})+c10lbl(310,122,'255 minus each octet','--cyan'),cap:'A <b>wildcard mask</b> is a <b>subnet mask inside out</b>. Conversion: <b>255 minus each octet</b> (255.255.255.0 → 0.0.0.255).'},
  {glow:c10g('r1','--amber'),dyn:c10lbl(310,122,'0 = must match · 1 = don’t care','--amber'),cap:'You read it bit by bit: <b>0</b> means "this bit <b>must match</b>", <b>1</b> means "this one <b>doesn’t matter</b>". That’s all there is to it.'},
  {glow:c10g('r1','--green'),dyn:c10rt({title:'wildcard → what it selects',items:[['0.0.0.0','one address (host)','--green'],['0.0.0.255','a whole /24','--green'],['255.255.255.255','anything (any)','--green']]}),cap:'Three cases that cover most of practice: <b>one address</b>, <b>a whole /24</b> and <b>anything</b>.'},
  {glow:c10g('sw','--violet')+c10g('r1','--violet'),dyn:c10pkt('206 104','294 82','--violet')+c10lbl(310,122,'ACL: who a rule applies to · OSPF: network','--violet'),cap:'Use: in an <b>ACL</b> the wildcard picks the addresses a rule applies to (next module), and in <b>OSPF</b> the <b>network</b> command uses it to pick interfaces.'}
]);}
// L6M2 — ACL on an interface
function renderC10Acl(){return c10P('caq',
  'The most common filter on a router is an <b>ACL</b> (Access Control List) – a list of "permit/deny" rules by source, destination, protocol and port (you know it from the Switching and VLANs and Network security courses). But on a router it matters <b>where and which way</b> you apply it: an ACL is attached <b>to a specific interface</b> and <b>a direction</b> – <b>in</b> (traffic coming <b>into</b> the interface) or <b>out</b> (leaving <b>out</b>). The same rules on the wrong direction catch nothing, or block what they shouldn’t. A practical rule (for <b>extended</b> ACLs, which also match destination and port like here): filter <b>as close to the source</b> as possible (drop unwanted traffic early so it doesn’t needlessly cross the network). Networks are written in classic ACLs with a <b>wildcard mask</b> – you read about it in the <b>previous module</b>. A whole line then looks like this: <span class="mono">permit tcp 10.0.10.0 0.0.0.255 host 10.0.20.5 eq 443</span> – read it as "permit from the whole 10.0.10.0/24 network to the single address 10.0.20.5, port 443". And remember – at the end of an ACL there’s a <b>hidden "deny all"</b>. A boundary of this simulator: here an ACL is configured <b>on the whole device</b> (one rule list in its modal), not per interface, and you don’t pick an <b>in/out direction</b>. The principle is the same, just without that fine choice of placement.',
  [['ACL','Access Control List – permit/deny rules on an interface; applied to a direction in/out.'],['implicit deny','at the end of an ACL is an invisible "deny all" – what no rule permits falls here.']]);}
function mountC10Acl(){c10Mount('caq',[
  {glow:c10g('r1','--cyan'),dyn:c10lbl(310,122,'ACL on interface + direction (in/out)','--cyan'),cap:'You attach an ACL to a <b>specific interface</b> and <b>direction</b>: <b>in</b> (into the interface) or <b>out</b>.'},
  {glow:c10g('sw','--green')+c10g('r1','--green'),dyn:c10pkt('206 104','294 82','--green')+c10lbl(232,74,'filter near source','--green'),cap:'Practical rule: filter <b>as close to the source</b> as possible – drop unwanted traffic early.'},
  {glow:c10g('r1','--red'),dyn:c10lbl(310,122,'end of ACL = hidden "deny all"','--red'),cap:'And note: at the end of an ACL is a <b>hidden "deny all"</b>. What no rule permits falls through and is blocked.'}
]);}
// L6M3 — anti-spoofing + management
function renderC10Hardening(){return c10P('car',
  'Let’s finish router hardening. <b>Anti-spoofing</b>: an attacker likes to forge the <b>source IP</b> to hide or slip past a filter. <b>uRPF</b> (Unicast Reverse Path Forwarding) catches it – for an incoming packet it checks whether the router <b>would send a reply back the same way</b> to that source IP; if not, it’s likely a forgery and the packet is <b>dropped</b>. And <b>secure management</b>: log into the router only <b>encrypted via SSH</b> (never Telnet – it sends the password in clear), use <b>strong login (AAA)</b> and disable unused services. A router is the network’s <b>gateway and brain</b> – whoever controls the router controls the traffic.',
  [['uRPF','Unicast Reverse Path Forwarding – drops a packet with a forged source IP (anti-spoofing).'],['SSH','encrypted router management; replaces Telnet, which sends the password in clear.']]);}
function mountC10Hardening(){c10Mount('car',[
  {glow:c10g('pc','--amber')+c10g('sw','--amber')+c10g('r1','--cyan'),dyn:c10pkt('96 110','294 82','--amber')+'<text x="250" y="100" text-anchor="middle" style="font:700 6px var(--mono);fill:var(--amber)">'+esc('forged source IP')+'</text>',cap:'The attacker sends a packet with a <b>fake source IP</b> (to hide / bypass a filter).'},
  {glow:c10g('r1','--green'),dyn:c10lbl(310,122,'uRPF: would I reply this way?','--green'),cap:'<b>uRPF</b> checks: would I send a reply to that source IP <b>back the same way</b>? If not → a forgery, <b>drop</b>.'},
  {glow:c10g('r1','--violet'),dyn:c10lbl(310,122,'mgmt: SSH (not Telnet) + AAA','--violet'),cap:'And manage the router only <b>via SSH</b> (not Telnet – it sends the password in clear), with strong login. The router controls all traffic.'}
]);}
// L7M1 — VRF
function renderC10Vrf(){return c10P('cas',
  'An advanced trick: <b>VRF</b> (Virtual Routing and Forwarding). One physical router can hold <b>several separate routing tables</b> at once – as if it became <b>several independent virtual routers</b>. Traffic in one VRF <b>knows nothing</b> about the others, even when they use the same IP ranges. Uses: a provider serves <b>many customers</b> on one router without them seeing into each other’s networks; or a company <b>separates</b>, say, the operations network from the camera network. It’s <b>segmentation at L3</b> – the counterpart of what VLANs do at L2.',
  [['VRF','several separate routing tables in one router; L3 segmentation (the counterpart of VLANs at L2).'],['L3 segmentation','separating traffic at the routing level; VRFs don’t see into each other even with identical IPs.']]);}
function mountC10Vrf(){c10Mount('cas',[
  {glow:c10g('r1','--cyan'),dyn:c10lbl(310,122,'1 router','--cyan'),cap:'One physical router. Normally it has <b>one</b> routing table for everything.'},
  {glow:c10g('r1','--violet'),dyn:c10rt({title:'VRF-A | VRF-B',items:[['VRF-A: 10.0.0.0/24','…','--cyan'],['VRF-B: 10.0.0.0/24','…','--green']]}),cap:'With <b>VRF</b> it holds <b>several separate tables</b> – here VRF-A and VRF-B with the same range, and they <b>can’t see each other</b>.'},
  {glow:c10g('r1','--green'),dyn:c10lbl(310,122,'L3 segmentation (like VLANs at L2)','--green'),cap:'It’s <b>L3 segmentation</b> – many customers/networks on one router with no mutual access. The VLAN counterpart.'}
]);}
// L7M2 — monitoring
function renderC10Monitor(){return c10P('cat',
  'For a network to be <b>manageable and tunable</b>, a router can <b>report on itself</b>. <b>SNMP</b> collects <b>state and metrics</b> (interface load, CPU, outages) into central monitoring. <b>Syslog</b> sends <b>event logs</b> (who logged in, what failed) to a log server – ideally into the <b>SIEM</b> from the Advanced security course. And <b>NetFlow</b> reports <b>who talked to whom and how much</b> (flows), useful for capacity and security analysis (unusual flows = suspicion). Without monitoring you’re <b>blind</b> in the network: you don’t know what’s happening until it breaks. This is everyday operational reality.',
  [['SNMP / Syslog','SNMP collects state/metrics, Syslog sends event logs to central monitoring.'],['NetFlow','a report of flows "who talked to whom and how much"; for capacity and security analysis.']]);}
function mountC10Monitor(){c10Mount('cat',[
  {glow:c10g('r1','--cyan')+c10g('sw','--cyan'),dyn:c10pkt('310 74','190 110','--cyan')+c10lbl(250,100,'SNMP / Syslog','--cyan'),cap:'The router reports <b>state and logs</b> (SNMP, Syslog) to central monitoring – ideally a SIEM.'},
  {glow:c10g('r1','--violet'),dyn:c10lbl(310,122,'NetFlow: '+'who↔whom, how much','--violet'),cap:'<b>NetFlow</b> reports <b>flows</b> – who with whom and how much. For capacity and security (an unusual flow = suspicion).'},
  {glow:c10g('r1','--red'),dyn:c10lbl(310,122,'without monitoring you’re blind','--red'),cap:'Without monitoring you <b>don’t know what’s happening</b> until it breaks. So it’s an operational necessity.'}
]);}
// L7M3 — synthesis
function renderC10Wrap(){return c10P('cau',
  'Let’s sum up the router <b>in depth</b>. We dissected the <b>routing table</b> (connected/static/dynamic, administrative distance, longest prefix), how a router <b>processes a packet</b> (next hop, ARP, TTL, ICMP), <b>NAT/PAT types</b> and port forwarding, <b>default and floating</b> routes, <b>first-hop</b> redundancy (HSRP/VRRP), and <b>security</b> (control vs data plane, ACL, uRPF, SSH, VRF, monitoring). A router is the network’s <b>crossroads and brain</b> – and now you know how it decides and how to protect it. That completes the <b>per-device deep dive</b> – the switch (Switch in depth) and the router (this course); the firewall you already dissected in <b>Network security</b> and <b>Advanced security</b>. Together, the full picture of a modern network. We deliberately left out one practical service: a router (and likewise a firewall or L3 switch) can forward a DHCP request into another network as a <b>DHCP relay</b>, so one <b>central DHCP server</b> is enough for the whole company – you’ll build that in the Build your first company network course.',
  [['routing decision','longest prefix → administrative distance → metric; then next hop, ARP, TTL.'],['router security','control vs data plane (CoPP), interface ACLs, uRPF, SSH/AAA, VRF, monitoring.']]);}
function mountC10Wrap(){c10Mount('cau',[
  {glow:c10g('r1','--cyan'),dyn:c10lbl(310,122,'table: LPM → AD → metric','--cyan'),cap:'The router decides by the <b>table</b> (longest prefix → AD → metric), then next hop, ARP, TTL.'},
  {glow:c10g('r1','--green')+c10g('r2','--green'),dyn:c10lbl(310,193,'NAT/PAT · default/floating · HSRP','--green'),cap:'It does <b>NAT/PAT</b>, <b>default and floating</b> routes and <b>first-hop</b> redundancy (HSRP/VRRP).'},
  {glow:c10g('r1','--violet'),dyn:c10lbl(310,122,'switch → router → firewall done','--violet'),cap:'And secured (planes, ACL, uRPF, SSH). The <b>per-device deep dive is complete</b>: switch → router → firewall.'}
]);}
const COURSE_10_DEF = {
  id:'course10',
title:'The router in depth',
  blurb:'L3 mechanics and security: the routing table and administrative distance, packet processing, NAT/PAT types, default and floating routes, HSRP/VRRP, router hardening.',
  lessons:[
    { id:'c10l1', title:'The routing table in depth', taskId:'two-nets', quizId:'c10q_l1', modules:[
      { id:'c10l1m1', title:'Three route sources', render:renderC10RtSources, mount:mountC10RtSources },
      { id:'c10l1m2', title:'Administrative distance', render:renderC10Ad, mount:mountC10Ad },
      { id:'c10l1m3', title:'Longest prefix match', render:renderC10Lpm, mount:mountC10Lpm }
    ]},
    { id:'c10l2', title:'How a router processes a packet', taskId:null, quizId:'c10q_l2', modules:[
      { id:'c10l2m1', title:'Lookup and next hop', render:renderC10Forward, mount:mountC10Forward },
      { id:'c10l2m2', title:'ARP for the next hop', render:renderC10Arp, mount:mountC10Arp },
      { id:'c10l2m3', title:'When there’s no route', render:renderC10NoRoute, mount:mountC10NoRoute }
    ]},
    { id:'c10l3', title:'NAT and PAT in depth', taskId:'static-nat', quizId:'c10q_l3', modules:[
      { id:'c10l3m1', title:'Static NAT (1:1)', render:renderC10NatStatic, mount:mountC10NatStatic },
      { id:'c10l3m2', title:'Dynamic NAT and PAT', render:renderC10Pat, mount:mountC10Pat },
      { id:'c10l3m3', title:'Port forwarding and hairpin', render:renderC10PortFwd, mount:mountC10PortFwd }
    ]},
    { id:'c10l4', title:'Ways out and backups', taskId:'wan-failover', quizId:'c10q_l4', modules:[
      { id:'c10l4m1', title:'The default route', render:renderC10Default, mount:mountC10Default },
      { id:'c10l4m2', title:'Floating static (backup)', render:renderC10Floating, mount:mountC10Floating },
      { id:'c10l4m3', title:'Stub vs transit router', render:renderC10StubTransit, mount:mountC10StubTransit }
    ]},
    { id:'c10l5', title:'First-hop redundancy', taskId:'hsrp', quizId:'c10q_l5', modules:[
      { id:'c10l5m1', title:'The single-gateway problem', render:renderC10FhrpWhy, mount:mountC10FhrpWhy },
      { id:'c10l5m2', title:'HSRP and VRRP', render:renderC10Hsrp, mount:mountC10Hsrp },
      { id:'c10l5m3', title:'Load sharing and three redundancies', render:renderC10Glbp, mount:mountC10Glbp }
    ]},
    { id:'c10l6', title:'Router security', taskId:null, quizId:'c10q_l6', modules:[
      { id:'c10l6m1', title:'Control plane vs data plane', render:renderC10Planes, mount:mountC10Planes },
      { id:'c10l6m4', title:'The wildcard mask', render:renderC10Wildcard, mount:mountC10Wildcard },
      { id:'c10l6m2', title:'ACLs on the interface', render:renderC10Acl, mount:mountC10Acl },
      { id:'c10l6m3', title:'Anti-spoofing and secure management', render:renderC10Hardening, mount:mountC10Hardening }
    ]},
    { id:'c10l7', title:'The router in practice and synthesis', taskId:'port-fwd', quizId:'c10q_l7', modules:[
      { id:'c10l7m1', title:'VRF: separate tables', render:renderC10Vrf, mount:mountC10Vrf },
      { id:'c10l7m2', title:'Monitoring and logging', render:renderC10Monitor, mount:mountC10Monitor },
      { id:'c10l7m3', title:'The complete router and what’s next', render:renderC10Wrap, mount:mountC10Wrap }
    ]}
  ]
};
const COURSE_10_QUIZZES_DEF = {
  c10q_l1:{ title:'Quiz: The routing table', qs:[
    { q:'From which three sources is the <b>routing table</b> filled?',
      opts:['connected (directly attached), static (by hand), dynamic (learned from a protocol, e.g. OSPF)','solely from the DHCP protocol, which automatically assigns the router its individual routes','solely and only from the ARP protocol, which the router continuously builds itself from the passing traffic'],
      correct:0, why:'Connected the router knows automatically, static the admin enters, dynamic it learns from a protocol. Three sources, one table.' },
    { q:'What is <b>administrative distance (AD)</b> for?',
      opts:['it decides which route SOURCE to trust when several know the same network (lower AD wins)','it precisely measures the real physical distance to the target network in kilometers from the cable length','it sets the order in which the router walks the individual rows of the routing table from top to bottom'],
      correct:0, why:'Connected 0, static 1, OSPF 110, RIP 120. The metric decides within one protocol; AD decides between sources.' },
    { q:'A /8, a /24 and the default /0 all match destination 10.0.5.10. What does the router pick?',
      opts:['/24 – the longest (most specific) prefix; longest prefix match decides first','the /0 default, and only because it is listed as the very first one in the whole routing table','the /8 prefix, because of the three it covers by far the largest address range'],
      correct:0, why:'The longest prefix wins first; only among equal lengths do AD and then the metric decide. The default is the last resort.' }
  ]},
  c10q_l2:{ title:'Quiz: Packet processing', qs:[
    { q:'What does a router do to a packet before forwarding it?',
      opts:['rewrites the destination/source MAC (destination = next hop) and decrements TTL by 1; the IPs stay','it rewrites the destination and source IP address inside the packet, while leaving both MAC addresses unchanged','it checks and recomputes the packet’s content (payload) and repairs damaged packets itself en route'],
      correct:0, why:'The IP "who→whom" doesn’t change en route; only the MAC changes at each hop and TTL drops (loop protection).' },
    { q:'Why does a router need <b>ARP</b> even when it already knows the next hop’s IP?',
      opts:['at Layer 2 it needs the next hop’s MAC; ARP resolves IP→MAC and stores it in the ARP cache','it needs it to first find out the current speed and load of the link leading to the next hop','it needs it to automatically assign its own IP address to the neighboring device at the next hop'],
      correct:0, why:'L3 decides where (IP), but delivery is to a MAC. So the first packet to a new next hop "waits for ARP".' },
    { q:'What does a router do when it has <b>no route</b> for a destination (not even a default)?',
      opts:['it drops the packet and sends the sender ICMP "destination unreachable"','it sends the packet on at random and just hopes it somehow arrives in the end','it stores the given packet in memory and then patiently waits for as long as it takes until a route appears'],
      correct:0, why:'Dropping for a missing route is the correct reaction. A packet with expired TTL is likewise dropped (loop protection).' }
  ]},
  c10q_l3:{ title:'Quiz: NAT and PAT', qs:[
    { q:'What is <b>static NAT</b>?',
      opts:['a fixed 1:1 mapping of one private and one public IP – for a permanently reachable server','sharing one single public IP address among many different internal devices at once','the reliable encryption of the source and destination IP address in absolutely every packet passing the network'],
      correct:0, why:'Static NAT is a predictable 1:1, but consumes one public IP per server. Many-behind-one is PAT.' },
    { q:'How does <b>PAT (NAT overload)</b> hide thousands of devices behind one public IP?',
      opts:['everyone goes out under one public IP, told apart by a different source port','each individual connected device ends up getting its own separate public IP address','because of it the router turns off the whole NAT address translation and sends everything straight out directly'],
      correct:0, why:'The router remembers the pair "inside IP:port ↔ public port", so it returns the reply to the right device.' },
    { q:'What is <b>port forwarding (DNAT)</b> for?',
      opts:['exposes an inside service from outside – inbound to a public port redirects to a specific inside IP:port','it markedly speeds up all the outbound traffic heading from the internal network to the internet','it reliably blocks and immediately discards absolutely all the traffic inside the whole local network between the individual devices'],
      correct:0, why:'PAT handles the way out; for inbound connections to an inside server you need a port-forwarding rule (static PAT/DNAT).' }
  ]},
  c10q_l4:{ title:'Quiz: Ways out and backups', qs:[
    { q:'What is the <b>default route (0.0.0.0/0)</b> for?',
      opts:['"whatever I don’t recognize, send here" (to the ISP); used last, when nothing more specific matches','it reliably blocks and discards absolutely all the traffic that would otherwise be heading out of the local network','it is by far the very fastest of all the routes in the whole table, and so it is always used first'],
      correct:0, why:'The default has the shortest prefix, so it loses to any more specific route (longest prefix). A stub network needs only it.' },
    { q:'How does a <b>floating static route</b> work?',
      opts:['it’s a backup static route with a higher AD; it activates when the main (lower AD) disappears','it is the fastest and most direct of all the routes in the table','it floats around the network at random and changes its target and direction'],
      correct:0, why:'While the main (lower AD) lives, the floating one is unused. After a failure it pops in – a simple backup without a dynamic protocol.' },
    { q:'Why isn’t a default route enough for a <b>transit</b> router?',
      opts:['it connects several networks and traffic flows through it in various directions – it needs specific routes to all','by its very own nature it is simply far too slow to make do with just a single route','by its very own nature it has no NAT address translation available at all, and that is why it isn’t enough'],
      correct:0, why:'A default would send everything one way. A stub (edge) router with one way out is fine with a default, a transit one isn’t.' }
  ]},
  c10q_l5:{ title:'Quiz: Gateway redundancy', qs:[
    { q:'Why is a single <b>default gateway</b> a problem?',
      opts:['it’s a single point of failure – when that router fails, clients only know its IP and lose their way out','by its very own nature it is simply far too slow to handle all the outbound traffic of the whole network','it needlessly uses up far more public and private IP addresses than is actually really needed at all'],
      correct:0, why:'Rewriting the gateway on hundreds of PCs by hand isn’t feasible. Hence FHRP: two routers appear as one gateway.' },
    { q:'How do <b>HSRP/VRRP</b> work?',
      opts:['two routers share a virtual IP+MAC (one gateway); one active, the standby takes over within seconds on failure','every single router in the whole network gets and manages its own completely separate and isolated default gateway for clients','to save energy, one of the two routers in the network is shut off permanently'],
      correct:0, why:'The client knows only the virtual IP and has no idea there are two routers. On failure the standby takes over and nothing changes for the client.' },
    { q:'Which three <b>different</b> redundancies shouldn’t be confused?',
      opts:['the gateway (FHRP/HSRP), the path inside (OSPF), the L2 link (STP) – each handles a different failure level','they are in fact just three different technical names for one and the same thing that does exactly the same every time','together they are the protocols DHCP, DNS and NAT, which jointly provide the whole network redundancy'],
      correct:0, why:'FHRP backs up the first hop, OSPF the paths inside, STP physical links. Together they keep the network up at all levels.' }
  ]},
  c10q_l6:{ title:'Quiz: Router security', qs:[
    { q:'What’s the difference between the <b>control plane</b> and the <b>data plane</b>?',
      opts:['data plane = transit traffic flowing through; control plane = the router’s own processes (routing, management). CoPP protects the control plane','control plane = user traffic passing through the router; data plane = the router’s own processes (routing, management). CoPP protects the data plane','the data plane runs on a separate backup router, while the control plane always runs only on the main active router'],
      correct:0, why:'Flooding the control plane (fake OSPF/ARP/management) downs the router’s "brain". CoPP limits how much may reach it.' },
    { q:'What must you not forget about an <b>ACL on a router</b>?',
      opts:['it’s applied to a specific interface and direction (in/out) and has a hidden "deny all" at the end','it always works globally on the whole router all at once and does not deal with any direction at all','by its very nature it always and under all circumstances automatically permits absolutely all the traffic'],
      correct:0, why:'The wrong direction catches nothing or blocks legitimate traffic. And what no rule permits falls to the implicit deny.' },
    { q:'What does <b>uRPF</b> do and why manage a router via <b>SSH</b>?',
      opts:['uRPF drops a packet with a forged source IP (anti-spoofing); SSH encrypts management (Telnet sends the password in clear)','uRPF speeds the whole router up markedly, whereas SSH is noticeably slower at management than Telnet','together both of them serve mainly to let the router automatically assign their IP addresses to the connected devices on the network itself'],
      correct:0, why:'uRPF checks the reply would go back the same way. And whoever controls the router (via unencrypted Telnet) controls the traffic – hence SSH.' }
  ]},
  c10q_l7:{ title:'Quiz: The router in practice', qs:[
    { q:'What does <b>VRF</b> enable?',
      opts:['several separate routing tables in one router – L3 segmentation (the VLAN counterpart at L2)','a marked doubling of the overall throughput and speed of the whole router at once','the reliable and strong encryption of the entire routing table so that no unauthorized person can read it'],
      correct:0, why:'Traffic in one VRF knows nothing of the others, even with identical IP ranges. A provider thus serves many customers on one router.' },
    { q:'What is <b>monitoring (SNMP/Syslog/NetFlow)</b> for?',
      opts:['the router reports state, logs and flows to central monitoring – without it you’re blind in the network','it markedly speeds up the internet connection for all the devices in the network','it automatically assigns absolutely all the connected devices in the whole network their IP addresses and default gateway'],
      correct:0, why:'SNMP metrics, Syslog logs (ideally into the SIEM from the Advanced security course), NetFlow flows for capacity and security. Without them you don’t know what’s happening.' },
    { q:'In what order does a router pick a route from the table?',
      opts:['longest prefix first (LPM), then (among equals) administrative distance, then the metric','it picks one of the available routes in the table completely at random each time','always strictly by the alphabetical order of the names of absolutely all the individual target networks listed in the table'],
      correct:0, why:'Specificity (prefix) takes precedence over source trust (AD) and over the protocol’s metric. The default is last.' }
  ]}
};
const COURSE_10_FINAL_EXTRA_DEF=[{ q:'The same network is known both statically and via OSPF. Which does the router use, and what does it do to TTL on forwarding?', opts:['the lower administrative distance wins; TTL is decremented by 1 (dropped at zero)','OSPF always and in every case wins, and the TTL value is left completely unchanged','the longer of the routes wins instead, and the TTL is incremented by 1 each forward'], correct:0, why:'When two sources know the same network, administrative distance decides (lower = more trusted). On forwarding the router decrements TTL by 1; at zero it drops the packet and sends ICMP.' },{ q:'A router forwards a packet onward. What does it rewrite and what stays, and why does it need ARP?', opts:['it rewrites the destination MAC to the next hop (IP stays); ARP finds that IP’s MAC','it rewrites the destination IP instead and keeps the MAC; ARP resolves the name to an IP','it keeps absolutely everything and just increments TTL by one; no ARP is needed here at all'], correct:0, why:'At L3 the IPs stay, L2 changes: destination MAC = the next hop’s MAC (and TTL−1). To learn it, ARP resolves the next hop’s IP to its MAC and caches it.' },{ q:'Clients have one router IP as their gateway – it fails. What solves this, and at what level?', opts:['gateway redundancy (HSRP): two routers share a virtual IP and the standby takes over at once','a somewhat faster, higher-quality link to the internet provider will eventually sort it out all by itself','just add a few more backup DNS servers into the clients’ network settings as a fallback'], correct:0, why:'If clients know only one gateway IP and that router dies, they lose their way out. HSRP/FHRP gives two routers one virtual IP (and MAC) – the standby takes over instantly. The gateway is just one redundancy layer (alongside OSPF and STP).' }];
__regCourse(10,COURSE_10_DEF,COURSE_10_QUIZZES_DEF,COURSE_10_FINAL_EXTRA_DEF);
