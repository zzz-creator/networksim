/* course24.js — content of Course 24 (Splitting a network: subnets in practice; loaded on demand via course-core.js) */
/* ============================================================
   COURSE 24 — Splitting a network: subnets in practice. IT BUILDS on the course <i>ISO/OSI and TCP/IP: the network map</i> (the modules “Bits and numbers”
   and “Subnetting: how to split a network” – there is the bit ruler and the calculation of a single mask)
   and does not start from scratch: this course deals with how to SPLIT one allocated network into several
   pieces of different sizes, how it is planned and where it most often breaks.
   Scene d24Net: PC — R — R2; under the router three subnets OFFICES / WAREHOUSE / SERVERS.
   ============================================================ */
var C24R={pc:[100,80],r:[330,80],r2:[560,80],off:[140,200],wh:[330,200],srv:[520,200]};
function d24Net(pfx){
  return '<svg id="'+pfx+'svg" viewBox="0 0 640 262" width="100%" style="display:block">'
    +'<line x1="115" y1="80" x2="315" y2="80" style="stroke:var(--line2);stroke-width:1.6"/>'
    +'<line x1="345" y1="80" x2="545" y2="80" style="stroke:var(--line2);stroke-width:1.6"/>'
    +'<line x1="322" y1="92" x2="148" y2="188" style="stroke:var(--line2);stroke-width:1.6"/>'
    +'<line x1="330" y1="95" x2="330" y2="185" style="stroke:var(--line2);stroke-width:1.6"/>'
    +'<line x1="338" y1="92" x2="512" y2="188" style="stroke:var(--line2);stroke-width:1.6"/>'
    +'<g id="'+pfx+'glow"></g>'
    +csHost(100,80,'desktop','--green','PC')
    +csDev(330,80,'l3switch','R')
    +csDev(560,80,'router','R2')
    +csHost(140,200,'lan','--cyan','OFFICES')
    +csHost(330,200,'lan','--amber','WAREHOUSE')
    +csHost(520,200,'lan','--violet','SERVERS')
    +'<g id="'+pfx+'dyn"></g></svg>';
}
function d24P(pfx,intro,terms){
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+intro+'</p>'
    +'<div class="osi-stage">'+d24Net(pfx)+'</div><div class="m1-cap" id="'+pfx+'cap"></div>'
    +courseStepControls(pfx)+abbrBox(terms);
}
function d24Mount(pfx,STEPS){
  function show(i){var g=$(pfx+'glow');if(g)g.innerHTML=STEPS[i].glow||'';var d=$(pfx+'dyn');if(d)d.innerHTML=STEPS[i].dyn||'';var c=$(pfx+'cap');if(c)c.innerHTML='<span>'+STEPS[i].cap+'</span>';}
  courseStepper(pfx,STEPS.length,show);
}
function d24g(name,color){var p=C24R[name];return csGlow(p[0],p[1],color,20);}
function d24lbl(x,y,tx,c){return '<text x="'+x+'" y="'+y+'" text-anchor="middle" style="font:700 7.5px var(--mono);fill:var('+c+')">'+esc(tx)+'</text>';}
function d24pkt(path,color,dur){return '<rect x="-6" y="-4" width="12" height="9" rx="2" style="fill:var('+color+')"><animateMotion path="'+path+'" dur="'+(dur||'1.4s')+'" repeatCount="indefinite"/></rect>';}

/* ---------- L1M1 — One large network ---------- */
function renderC24WhySplit(){return d24P('d24a',
  'The provider hands you one network – say <b>192.168.10.0/24</b>, meaning 254 usable addresses – and you could pour everything into it: office computers, the warehouse, servers, printers, cameras. It would work. And yet nobody does it, for three reasons you already know from earlier courses. <b>Broadcast.</b> Every broadcast frame (ARP, the DHCP Discover from the course <i>DHCP: how a device gets an address</i>) reaches <b>everyone</b> – the more devices, the more noise everyone has to process. <b>Security.</b> In one network everybody talks to everybody directly and there is nowhere to place a rule; a camera reaches the accounting server because nothing stops it (the courses <i>Switching and VLANs</i> and <i>Network security</i>). <b>Clarity.</b> When the warehouse has its own range, you can tell where traffic comes from by its address alone – and that holds for rules, for logs and for fault-finding. So splitting a network is first of all a <b>design decision</b>, not a math exercise. The math is merely the tool for writing it down.',
  [['subnet','a smaller piece of the allocated network with its own address range and its own boundary.'],
   ['broadcast domain','the area a broadcast frame reaches; it ends at the router.']]);}
function mountC24WhySplit(){d24Mount('d24a',[
  {glow:d24g('r','--muted')+d24g('off','--muted')+d24g('wh','--muted')+d24g('srv','--muted'),dyn:d24lbl(330,44,'192.168.10.0/24','--muted'),cap:'You got <b>one</b> network. Technically everything would fit into it – 254 usable addresses.'},
  {glow:d24g('r','--red')+d24g('off','--red')+d24g('wh','--red')+d24g('srv','--red'),dyn:d24pkt('M 330 80 L 140 200','--red','0.8s')+d24pkt('M 330 80 L 520 200','--red','0.8s')+d24lbl(330,140,'a broadcast reaches everyone','--red'),cap:'But a <b>broadcast</b> reaches everyone. The more devices in one network, the more noise everyone has to process.'},
  {glow:d24g('off','--amber')+d24g('srv','--amber')+d24g('r','--amber'),dyn:d24pkt('M 140 200 L 330 80 L 520 200','--amber')+d24lbl(330,254,'in one network there is nowhere to put a rule','--amber'),cap:'And <b>security</b>: in one network everybody talks directly and a rule has nowhere to bite. The camera reaches the accounting server.'},
  {glow:d24g('off','--cyan')+d24g('wh','--amber')+d24g('srv','--violet'),dyn:d24lbl(140,254,'.0/26','--cyan')+d24lbl(330,254,'.64/27','--amber')+d24lbl(520,254,'.96/28','--violet'),cap:'Splitting creates three <b>boundaries</b>. Broadcasts stop, rules have somewhere to bite, and the address alone tells you where traffic is from.'}
]);}

/* ---------- L1M2 — How many addresses you need ---------- */
function renderC24HowMany(){return d24P('d24b',
  'Before you reach for a mask you need one number: <b>how many devices</b> that particular part will hold. And note: it is not the number of people. A warehouse with twenty workers also holds scanners, a label printer, a tablet at the ramp and an access point – easily double. So add a <b>reserve for the future</b> to every number; a network is not rebuilt every six months. At the same time the opposite holds: a range should not be needlessly large. Inflating every subnet to a /24 “just in case” looks comfortable, but addresses are finite – out of one /24 you get either three sensible subnets or one huge one and then nothing. So the practical procedure is always the same: <b>1)</b> list the parts of the network, <b>2)</b> write the device count including reserve next to each, <b>3)</b> and only then look for the prefix that fits it most tightly. That last sentence is the whole second lesson, and the key word in it is <b>most tightly</b>.',
  [['reserve','extra room for devices yet to come; it counts toward the subnet size.']]);}
function mountC24HowMany(){d24Mount('d24b',[
  {glow:d24g('off','--cyan'),dyn:d24lbl(140,254,'offices: 50 devices','--cyan'),cap:'Start with the <b>device count</b>, not the mask. Offices: fifty machines including printers and reserve.'},
  {glow:d24g('wh','--amber'),dyn:d24lbl(330,254,'warehouse: 20 – but scanners and an AP too','--amber'),cap:'Twenty people work in the warehouse, but there are more devices: scanners, a label printer, a tablet, an access point.'},
  {glow:d24g('srv','--violet'),dyn:d24lbl(520,254,'servers: 10, they grow slowly','--violet'),cap:'Servers grow more slowly than users – the reserve here can be smaller. Each part has a different character.'},
  {glow:d24g('r','--red')+d24g('off','--red')+d24g('wh','--red')+d24g('srv','--red'),dyn:d24lbl(330,140,'everything a /24 “just in case” = you run out','--red'),cap:'Inflating every part “just in case” does not work: out of one /24 you get three sensible subnets, or one huge one and then nothing.'}
]);}

/* ---------- L1M3 — Private ranges ---------- */
function renderC24Private(){return d24P('d24c',
  'Where do the numbers actually come from? Inside a company, from the <b>private ranges</b> – three blocks reserved for internal networks and not routed on the internet: <b>10.0.0.0/8</b> (enormous, over 16 million addresses), <b>172.16.0.0/12</b> and <b>192.168.0.0/16</b>. For now read the number after the slash as <b>the smaller it is, the bigger the block</b> – the next lesson unpacks why. Anyone may use these addresses, because traffic reaches the outside through NAT anyway (the courses <i>Routing and IP addresses</i> and <i>The router in depth</i>) and nobody addresses them from outside. Which block you pick is a matter of convenience, not correctness. <b>192.168.x.x</b> is familiar to everyone from home routers and suits small networks. <b>10.x.x.x</b> is used in larger companies, because a legible plan builds nicely in it – say one digit for the branch, another octet for the VLAN. And one practical warning: if you plan a VPN between two sites (the course <i>Networking to the cloud</i>), avoid the utterly ordinary ranges such as 192.168.0.0/24 or 192.168.1.0/24. When both ends hold the same one, the tunnel comes up but the traffic will not know where it belongs.',
  [['private range','10.0.0.0/8, 172.16.0.0/12 and 192.168.0.0/16 – addresses for internal networks, not routed on the internet.'],
   ['NAT','translation of internal addresses to a public one on the way out; that is why everyone can use private addresses.']]);}
function mountC24Private(){d24Mount('d24c',[
  {glow:d24g('off','--cyan')+d24g('wh','--cyan')+d24g('srv','--cyan'),dyn:d24lbl(330,140,'10.0.0.0/8 · 172.16.0.0/12 · 192.168.0.0/16','--cyan'),cap:'Inside a company you draw from <b>three private blocks</b>. Anyone may use them – they are not routed on the internet.'},
  {glow:d24g('off','--green')+d24g('wh','--green'),dyn:d24lbl(140,254,'small network: 192.168.x.x','--green'),cap:'<b>192.168.x.x</b> is familiar from every home router and is the most convenient for a small network.'},
  {glow:d24g('r','--violet')+d24g('r2','--violet'),dyn:d24pkt('M 330 80 L 560 80','--violet')+d24lbl(330,44,'several branches: 10.x.x.x plans better','--violet'),cap:'In a larger company <b>10.x.x.x</b> fits: in such a large block you can build a legible plan – an octet for the branch, an octet for the VLAN.'},
  {glow:d24g('r','--red')+d24g('r2','--red'),dyn:d24lbl(330,140,'both ends 192.168.1.0/24 → the VPN will not help ⚠','--red'),cap:'Beware with VPNs: when both ends hold the <b>same</b> range, the tunnel comes up but traffic will not know where it belongs.'}
]);}

/* ---------- L2M1 — The prefix as a line ---------- */
function renderC24Prefix(){return d24P('d24d',
  'In the course <i>ISO/OSI and TCP/IP: the network map</i>, in the modules <i>Bits and numbers</i> and <i>Subnetting</i>, you got a feel for the bit ruler: the prefix is a <b>line inside the address</b> splitting it into the <b>network</b> part (left) and the <b>host</b> part (right). We build on that here, so just the one sentence you need under your skin: <b>the further right you move the line, the smaller each subnet gets – and the more of them you have</b>. Every extra bit in the prefix halves the size and doubles the count. Out of a /24 (256 addresses), a /25 makes two networks of 128, a /26 four of 64, a /27 eight of 32. From this follows how you find the right prefix for a known device count: you move right from /24 until the required count still fits. Fifty devices? A /26 gives 62 usable – it fits. A /27 would give 30 – it does not. So a /26. (Why not 64 and 32? Two addresses in every subnet are reserved – that is the very next module.) No arithmetic, just moving the line.',
  [['prefix','the number after the slash: how many bits of the address belong to the network. The rest belongs to hosts.'],
   ['one more bit','each extra prefix bit halves the subnet size and doubles their count.']]);}
function mountC24Prefix(){d24Mount('d24d',[
  {glow:d24g('r','--muted'),dyn:d24lbl(330,44,'/24 = 256 addresses in one piece','--muted'),cap:'The starting point: a <b>/24</b>, one piece of 256 addresses. The line sits after the third octet.'},
  {glow:d24g('off','--cyan')+d24g('wh','--cyan'),dyn:d24lbl(140,254,'/25 = 128','--cyan')+d24lbl(330,254,'/25 = 128','--cyan'),cap:'Move the line <b>one bit</b> right: a /25. You get <b>two</b> networks of 128 addresses.'},
  {glow:d24g('off','--amber')+d24g('wh','--amber')+d24g('srv','--amber')+d24g('r','--amber'),dyn:d24lbl(330,140,'/26 = 4 × 64 · /27 = 8 × 32','--amber'),cap:'Every further bit <b>halves</b> the size and <b>doubles</b> the count. A /26 gives four of 64, a /27 eight of 32.'},
  {glow:d24g('off','--green'),dyn:d24lbl(140,254,'50 devices → /26 (62 usable)','--green'),cap:'That is how you find a prefix: move right while the count <b>still fits</b>. Fifty devices = a /26, because a /27 would give only 30.'}
]);}

/* ---------- L2M2 — Network address, broadcast, usable ---------- */
function renderC24NetBcast(){return d24P('d24e',
  'In every subnet there are <b>two addresses no device gets</b>. The <b>first</b> is the network address – the name of the whole subnet, what you write into the routing table and into rules. The <b>last</b> is the broadcast – “everyone in this subnet”. That is why <b>two are always subtracted</b> from the size: a /26 holds 64 addresses but <b>62 usable</b>. With small subnets this hurts most: a /29 holds eight addresses and only six usable. It is also the most common place where a plan misses by one device – you count 30 addresses for a /27 and forget that only 30 of the 32 are usable. The practical consequence: when your device count comes out <b>exactly</b> at the subnet size, you are already over the line. Sixty-two devices do not belong in a /26, even though 64 looks like enough. And the last usable address is customarily the <b>gateway</b> – or the first, depending on convention; what matters is keeping it the same across the company.',
  [['network address','the subnet’s first address – the name of the whole network; no device gets it.'],
   ['broadcast','the subnet’s last address – “everyone here”; no device gets it either.']]);}
function mountC24NetBcast(){d24Mount('d24e',[
  {glow:d24g('off','--blue'),dyn:d24lbl(140,254,'first: 192.168.10.0 = the network address','--blue'),cap:'The <b>first</b> address is the name of the whole subnet. You write it into routing tables and rules – no device gets it.'},
  {glow:d24g('off','--red')+d24g('r','--red'),dyn:d24pkt('M 140 200 L 330 80','--red','0.8s')+d24lbl(140,140,'last: .63 = broadcast','--red'),cap:'The <b>last</b> address is the broadcast – “everyone in this subnet”. No device gets that one either.'},
  {glow:d24g('off','--green'),dyn:d24lbl(140,254,'/26: 64 addresses, but 62 usable','--green'),cap:'That is why <b>two are always subtracted</b>. A /26 holds 64 addresses, but 62 are usable.'},
  {glow:d24g('srv','--amber'),dyn:d24lbl(520,254,'/29: eight addresses, six usable','--amber'),cap:'With small subnets it hurts most: a <b>/29</b> holds eight addresses and six usable. This is where a plan most often misses by one device.'}
]);}

/* ---------- L2M3 — The step between subnets ---------- */
function renderC24Step(){return d24P('d24f',
  'One mechanical thing remains: <b>where each subnet begins</b>. Subnets follow one another in <b>steps equal to their size</b>. For a /26 (64 addresses) the starts are <b>.0, .64, .128, .192</b>. For a /27 (32 addresses) they are <b>.0, .32, .64, .96</b> and so on. Nothing exists in between – a subnet <b>cannot</b> begin at .50 or .100, however much tidier that might look to you. This is exactly the source of plans that look pretty and do not work: splitting a /24 into pieces “of a hundred” simply cannot be done, because a hundred is not a power of two. That is just another name for what you know from the previous module: every extra bit halves the size, so subnet sizes are always 2, 4, 8, 16, 32, 64 – never 100. A trick worth having: <b>write the starts down before you start assigning</b>. Once you know that for a /26 they are .0, .64, .128 and .192, the whole plan almost assembles itself and can produce neither a gap nor an overlap. And one more connection: the network address from the previous module is always <b>exactly one of those starts</b> – so it doubles as a check on whether the mask is written correctly.',
  [['step','the distance between the starts of neighboring subnets; it equals their size.']]);}
function mountC24Step(){d24Mount('d24f',[
  {glow:d24g('off','--cyan'),dyn:d24lbl(140,254,'/26 → .0','--cyan'),cap:'The first /26 begins at <b>.0</b> and takes 64 addresses, that is .0 to .63.'},
  {glow:d24g('off','--cyan')+d24g('wh','--amber'),dyn:d24lbl(140,254,'.0','--cyan')+d24lbl(330,254,'.64','--amber'),cap:'The next begins exactly where the previous ended: at <b>.64</b>. The step equals the size.'},
  {glow:d24g('off','--cyan')+d24g('wh','--amber')+d24g('srv','--violet')+d24g('r','--green'),dyn:d24lbl(330,140,'.0 · .64 · .128 · .192','--green'),cap:'All the /26 starts inside one /24: <b>.0, .64, .128, .192</b>. Nothing exists in between.'},
  {glow:d24g('wh','--red'),dyn:d24lbl(330,254,'.50 or .100 cannot be a start ⚠','--red'),cap:'That is why you cannot split “by hundreds” – a hundred is not a power of two. A plan can look pretty and still not work.'}
]);}

/* ---------- L3M1 — Equal-sized pieces ---------- */
function renderC24Equal(){return d24P('d24g',
  'The simplest split is into <b>equal-sized pieces</b>. Need four parts? Move the line two bits (/24 → /26) and you have four subnets of 64 addresses, each with 62 usable. Done, no thinking required. This approach has a big advantage: it is <b>easy to follow</b>. Everyone on the team knows networks start every 64, and the plan can be worked out from memory a year later. As long as the addresses suffice, it is an entirely legitimate choice, and school examples use it almost always. The downside shows once the parts are <b>very unequal</b>. Three subnets of 62 addresses look fair, but when one of them holds fifty people, the second twenty and the third ten, you are wasting – and above all you are left with a single free /26 for everything else still to come. For such a case a more flexible procedure exists, and it is the next module’s content.',
  [['equal split','the whole network is split into equal-sized subnets by one shift of the prefix.']]);}
function mountC24Equal(){d24Mount('d24g',[
  {glow:d24g('r','--muted'),dyn:d24lbl(330,44,'one /24, I need four parts','--muted'),cap:'The task: split one /24 into <b>four</b> parts. The simplest way is to give them all the same size.'},
  {glow:d24g('off','--cyan')+d24g('wh','--cyan')+d24g('srv','--cyan')+d24g('r','--cyan'),dyn:d24lbl(330,140,'shift two bits: /24 → /26','--cyan'),cap:'A <b>two-bit</b> shift makes four subnets of 64 addresses. No extra arithmetic.'},
  {glow:d24g('off','--green')+d24g('wh','--green')+d24g('srv','--green'),dyn:d24lbl(140,254,'.0/26','--green')+d24lbl(330,254,'.64/26','--green')+d24lbl(520,254,'.128/26','--green'),cap:'The result is <b>legible</b>: starts every 64, everyone on the team remembers them and can work the plan out a year later.'},
  {glow:d24g('srv','--red')+d24g('wh','--red'),dyn:d24lbl(330,140,'10 devices in a /26: 62 − 10 = 52 addresses idle','--red'),cap:'The cost shows with <b>unequal</b> parts: ten servers in a /26 leave 52 addresses idle, and you are left with a single free /26.'}
]);}

/* ---------- L3M2 — VLSM ---------- */
function renderC24Vlsm(){return d24P('d24h',
  'The more flexible procedure is called <b>VLSM</b> – variable length subnet masking (a mask is just another way to write a prefix, as you know from the course <i>ISO/OSI and TCP/IP: the network map</i>). It sounds academic but means something plain: <b>each subnet gets its own prefix according to its size</b>, not one shared by all. Offices with fifty devices get a /26 (62 usable), the warehouse with twenty a /27 (30), and the servers with ten a /28 (14). Together they take 64 + 32 + 16 = 112 addresses out of 256 – the rest stays free for whatever comes next. Had they been given equal masks, 192 addresses would have gone and a single /26 would remain. The difference lies exactly in that remainder. In practice VLSM is done by taking <b>one large network and biting pieces off it</b> – the largest subnet first, the next behind it, and what remains is still one contiguous free block. And because each piece begins at a multiple of its own size (the second lesson), they stack tightly, with no gaps.',
  [['VLSM','variable length subnet masking: each subnet has its own prefix according to its size.']]);}
function mountC24Vlsm(){d24Mount('d24h',[
  {glow:d24g('off','--cyan'),dyn:d24lbl(140,254,'offices 50 → /26 (.0 – .63)','--cyan'),cap:'The largest part first: the offices get a <b>/26</b> and take .0 to .63.'},
  {glow:d24g('off','--cyan')+d24g('wh','--amber'),dyn:d24lbl(330,254,'warehouse 20 → /27 (.64 – .95)','--amber'),cap:'The warehouse needs less, so it gets a <b>/27</b> – and begins exactly where the offices ended.'},
  {glow:d24g('off','--cyan')+d24g('wh','--amber')+d24g('srv','--violet'),dyn:d24lbl(520,254,'servers 10 → /28 (.96 – .111)','--violet'),cap:'The servers get a <b>/28</b>. Three different masks in one network – that is exactly what the abbreviation VLSM means.'},
  {glow:d24g('r','--green')+d24g('r2','--green'),dyn:d24pkt('M 330 80 L 560 80','--green')+d24lbl(330,140,'144 addresses remain free, in one block','--green'),cap:'112 of 256 went and the rest stayed <b>in one piece</b>. With equal masks a single /26 would remain.'}
]);}

/* ---------- L3M3 — Largest first ---------- */
function renderC24Order(){return d24P('d24i',
  'One VLSM rule deserves its own module, because beginners break it almost every time: <b>assign from the largest subnet to the smallest</b>. The reason lies in the steps from the second lesson. A large subnet must begin at a multiple of <b>its own</b> size – a /26 only at .0, .64, .128 or .192. If you start with the small ones and crumble the beginning of the network into sixteens, you find that plenty of addresses remain, but <b>not in one piece in the right place</b> – there is nowhere to lay the large /26. Going from the largest cannot have this problem: every further piece is the same size or smaller, and a smaller piece always fits on a larger one’s boundary. So the practical recipe reads: <b>1)</b> sort the parts by device count, descending, <b>2)</b> put the first at the start of the network, <b>3)</b> lay each next one right behind the previous. Then just check that the last one ended inside the original network.',
  [['order','from the largest subnet to the smallest – otherwise the large one has nowhere to fit.']]);}
function mountC24Order(){d24Mount('d24i',[
  {glow:d24g('srv','--red'),dyn:d24lbl(520,254,'I started with the smallest: a /28 at .0','--red'),cap:'The wrong start: the smallest subnet <b>at the beginning</b> of the network. It looks innocent.'},
  {glow:d24g('srv','--red')+d24g('wh','--red'),dyn:d24lbl(330,140,'and a /27 behind it → the beginning is crumbled','--red'),cap:'Another small one behind it. The beginning of the network is <b>crumbled</b> into small pieces.'},
  {glow:d24g('off','--red')+d24g('r','--red'),dyn:d24lbl(140,254,'the /26 has nowhere to go ⚠','--red'),cap:'And now the large /26: there would be enough addresses, but <b>not in one piece at a multiple of 64</b>. It has nowhere to go.'},
  {glow:d24g('off','--green')+d24g('wh','--green')+d24g('srv','--green')+d24g('r','--green'),dyn:d24lbl(330,140,'largest to smallest → it always works out','--green'),cap:'From <b>largest</b> to smallest this problem cannot arise: a smaller piece always fits on a larger one’s boundary.'}
]);}

/* ---------- L3M4 — /30 and /31 ---------- */
function renderC24P2p(){return d24P('d24j',
  'A special case you will hit in almost every plan: the <b>link between two routers</b>. It carries exactly two devices and never will carry more – yet it needs its own subnet, because it is a separate network between two L3 devices. Giving it a /24 would be waste in its purest form: 254 addresses for two machines. So such links use a <b>/30</b>: four addresses, of which <b>two are usable</b> (the first is the network address, the last the broadcast) – exactly enough for two routers, not one to spare. It is the most common prefix you will see in a real network outside user subnets. And there is an even thriftier variant, the <b>/31</b>: two addresses and both usable. It is a <b>deliberate exception</b> to the two-reserved-addresses rule: on a point-to-point link a broadcast would have nobody to serve anyway – the two neighbors already know each other – so both addresses were freed up for use. You need not use it, but you should recognize it when you meet it in somebody else’s configuration and start thinking that such a small mask surely makes no sense.',
  [['/30','four addresses, two usable – the standard prefix for a link between two routers.'],
   ['/31','two addresses and both usable; only for point-to-point links where no broadcast is needed.']]);}
function mountC24P2p(){d24Mount('d24j',[
  {glow:d24g('r','--amber')+d24g('r2','--amber'),dyn:d24pkt('M 330 80 L 560 80','--amber')+d24lbl(330,44,'a link between routers: two devices','--amber'),cap:'A link between two routers carries <b>exactly two</b> devices – and never will carry more.'},
  {glow:d24g('r','--red')+d24g('r2','--red'),dyn:d24lbl(330,140,'a /24 on a link = 254 addresses for two ⚠','--red'),cap:'Giving it a /24 is waste in its purest form: <b>254 addresses for two machines</b>.'},
  {glow:d24g('r','--green')+d24g('r2','--green'),dyn:d24pkt('M 330 80 L 560 80','--green','0.8s')+d24lbl(330,44,'/30: four addresses, two usable','--green'),cap:'So a <b>/30</b>: four addresses, two of them usable – exactly enough for two routers, not one to spare.'},
  {glow:d24g('r','--violet')+d24g('r2','--violet'),dyn:d24lbl(330,140,'/31: two addresses and both usable','--violet'),cap:'Thriftier still is the <b>/31</b> – only for point-to-point links where no broadcast is needed. Recognize it when you meet it.'}
]);}

/* ---------- L4M1 — Overlap ---------- */
function renderC24Overlap(){return d24P('d24k',
  'The most common mistake in a plan is an <b>overlap</b>: two subnets claiming the same addresses. It almost always arises by accident – somebody adds a new network and eyeballs the range, or forgets that a /26 reaches all the way to .63, so the next one starts at .32. The bad part is that it <b>does not fail immediately</b>. The router suddenly has two paths to the same addresses and picks one; some traffic goes correctly, some disappears, and it depends on which path is “better” in the table. The user describes it as “sometimes it works and sometimes it does not”, which is the hardest category of fault to track down. The defense is simple and boring: <b>write the plan down before you click it in</b>, and note the <b>last address</b> next to each subnet’s range. An overlap is then visible at a glance – one’s end is greater than the other’s start. The simulator also flags overlaps in the Topology check, so you can verify it there too.',
  [['overlap','two subnets share some addresses; the router has two paths to the same destination and some traffic disappears.']]);}
function mountC24Overlap(){d24Mount('d24k',[
  {glow:d24g('off','--cyan'),dyn:d24lbl(140,254,'.0/26 → .0 to .63','--cyan'),cap:'The first subnet: a <b>/26</b> from .0, so it reaches all the way to <b>.63</b>. That last address is the crux.'},
  {glow:d24g('off','--cyan')+d24g('wh','--red'),dyn:d24lbl(330,254,'.32/27 → begins inside the first one ⚠','--red'),cap:'The second begins at <b>.32</b> – but that is still inside the first one. An <b>overlap</b> has appeared.'},
  {glow:d24g('r','--red')+d24g('off','--red')+d24g('wh','--red'),dyn:d24pkt('M 330 80 L 140 200','--red','0.7s')+d24lbl(330,140,'the router has two paths to the same addresses','--red'),cap:'The router suddenly has <b>two paths</b> to the same addresses. It picks one – and some traffic quietly disappears.'},
  {glow:d24g('off','--green')+d24g('wh','--green'),dyn:d24lbl(330,140,'note the last address too → the overlap is visible','--green'),cap:'The defense is boring: note the <b>last address</b> alongside each range. One’s end greater than another’s start = an overlap, at a glance.'}
]);}

/* ---------- L4M2 — A wrong mask ---------- */
function renderC24BadMask(){return d24P('d24l',
  'The second classic is a <b>wrong mask on a single machine</b>. The address is right, the cable holds, but the device carries, say, a /24 where a /26 belongs. What happens? The mask decides one single question: <b>who is a neighbor</b>. With a wrong mask the machine believes that somebody actually lying in a different subnet is a neighbor – and instead of sending the data to the <b>gateway</b>, it tries to deliver it directly. Nobody answers. From outside this looks like the strangest fault under the sun: it reaches some addresses and not others, while both are “in the same network”. And because a ping to the gateway often goes through – its address tends to sit near the start of the range, so it still comes out as a neighbor even under the wrong mask – you easily blame something else. A tip for practice: when one machine cannot see what the others see, <b>compare its mask with a neighbor’s</b>. It is a ten-second question and it resolves an unexpectedly large share of cases. You can try exactly this scenario in the challenge linked to this lesson.',
  [['mask','it decides one single question: whom the device treats as a neighbor and therefore sends data to directly.']]);}
function mountC24BadMask(){d24Mount('d24l',[
  {glow:d24g('pc','--green')+d24g('r','--green'),dyn:d24pkt('M 100 80 L 330 80','--green')+d24lbl(330,44,'correct mask: a foreign network → via the gateway','--green'),cap:'With the right mask the machine knows the target is in a <b>different</b> subnet and sends the data to the <b>gateway</b>.'},
  {glow:d24g('pc','--red'),dyn:d24lbl(100,44,'it holds a /24 where a /26 belongs ⚠','--red'),cap:'Now the same machine holds a <b>/24</b> instead of a /26. The address is right, the cable holds – only its idea of neighbors changed.'},
  {glow:d24g('pc','--red')+d24g('off','--red')+d24g('r','--red'),dyn:d24pkt('M 100 80 L 330 80 L 140 200','--red','0.7s')+d24lbl(140,140,'it thinks that is a neighbor → delivers directly','--red'),cap:'It believes the target is a <b>neighbor</b>, so it tries to reach it directly instead of via the gateway. Nobody answers.'},
  {glow:d24g('pc','--amber')+d24g('r','--amber'),dyn:d24lbl(330,140,'some addresses yes, others no','--amber'),cap:'From outside: it reaches <b>some</b> addresses and not others. When one machine cannot see what the others see, compare its mask.'}
]);}

/* ---------- L4M3 — When the addresses run out ---------- */
function renderC24RunOut(){return d24P('d24m',
  'The last mistake is not in the math but in the estimate: <b>the subnet is small</b>. The warehouse came out at twenty devices, got a /27 with thirty usable – and a year later a second scanner, a tablet and a printer arrive and that is that. It shows up inconspicuously: new devices <b>get no address from DHCP</b>, because the range is exhausted (the course <i>DHCP: how a device gets an address</i>), while the old ones carry on. That is exactly the fingerprint you know from there, only this time the cause is not an attack but a plan. Two ways out exist and neither is free. <b>Enlarge the subnet</b> – but that works only when free space lies behind it; when the next network follows immediately, there is nowhere to grow and you must renumber. <b>Add another subnet</b> – quicker, but the plan fragments. The cheapest is to leave <b>room right behind every subnet</b> at design time, not once it happens. That is exactly why 144 addresses remained in one piece in the VLSM module.',
  [['renumbering','changing the range of a running network; an expensive operation, because it touches everything that holds an address fixed.']]);}
function mountC24RunOut(){d24Mount('d24m',[
  {glow:d24g('wh','--amber'),dyn:d24lbl(330,254,'warehouse: /27, thirty usable','--amber'),cap:'The warehouse got a <b>/27</b> for twenty devices. A reserve of ten addresses looked generous on design day.'},
  {glow:d24g('wh','--red')+d24g('r','--red'),dyn:d24pkt('M 330 200 L 330 80','--red','0.7s')+d24lbl(330,140,'a new device: it gets no address from DHCP','--red'),cap:'A year on the range is full. New devices <b>get no address</b> while the old ones carry on – you know that fingerprint from the course <i>DHCP: how a device gets an address</i>.'},
  {glow:d24g('wh','--red')+d24g('srv','--red'),dyn:d24lbl(330,140,'the next network starts right behind → nowhere to grow','--red'),cap:'Enlarging it is impossible: the <b>next</b> subnet starts right behind. That leaves renumbering, which is expensive.'},
  {glow:d24g('off','--green')+d24g('wh','--green')+d24g('srv','--green')+d24g('r','--green'),dyn:d24lbl(330,44,'leave room behind every subnet at design time','--green'),cap:'The cheapest defense is leaving <b>room right behind every subnet</b> at design time – exactly why 144 addresses remained whole under VLSM.'}
]);}

const COURSE_24_DEF = {
  id:'course24',
title:'Splitting a network: subnets in practice',
  blurb:'Building on the bit ruler from the course <i>ISO/OSI and TCP/IP: the network map</i>, this takes the next step: how to split one allocated network into several pieces of different sizes. How many addresses to ask for, where subnets begin, VLSM and the largest-first order, the /30 on router links – and the mistakes that break a plan (overlap, a wrong mask, exhausted addresses).',
  lessons:[
    { id:'c24l1', title:'Why split one network', taskId:null, quizId:'c24q_l1', modules:[
      { id:'c24l1m1', title:'One large network: noise and security', render:renderC24WhySplit, mount:mountC24WhySplit },
      { id:'c24l1m2', title:'How many addresses you actually need', render:renderC24HowMany, mount:mountC24HowMany },
      { id:'c24l1m3', title:'Where to draw from: private ranges', render:renderC24Private, mount:mountC24Private }
    ]},
    { id:'c24l2', title:'Where the network ends and the host begins', taskId:null, quizId:'c24q_l2', modules:[
      { id:'c24l2m1', title:'The prefix as a line in the address', render:renderC24Prefix, mount:mountC24Prefix },
      { id:'c24l2m2', title:'Network address, broadcast and the rest', render:renderC24NetBcast, mount:mountC24NetBcast },
      { id:'c24l2m3', title:'The step between subnets', render:renderC24Step, mount:mountC24Step }
    ]},
    { id:'c24l3', title:'Split one network into several', taskId:'subnet-plan', quizId:'c24q_l3', modules:[
      { id:'c24l3m1', title:'Equal-sized pieces', render:renderC24Equal, mount:mountC24Equal },
      { id:'c24l3m2', title:'VLSM: pieces of different sizes', render:renderC24Vlsm, mount:mountC24Vlsm },
      { id:'c24l3m3', title:'Largest first', render:renderC24Order, mount:mountC24Order },
      { id:'c24l3m4', title:'/30 and /31 on a link', render:renderC24P2p, mount:mountC24P2p }
    ]},
    { id:'c24l4', title:'Mistakes in a plan', taskId:'ch-badip', quizId:'c24q_l4', modules:[
      { id:'c24l4m1', title:'Overlapping subnets', render:renderC24Overlap, mount:mountC24Overlap },
      { id:'c24l4m2', title:'A wrong mask: a neighbor that is not one', render:renderC24BadMask, mount:mountC24BadMask },
      { id:'c24l4m3', title:'When the addresses run out', render:renderC24RunOut, mount:mountC24RunOut }
    ]}
  ]
};

const COURSE_24_QUIZZES_DEF = {
  c24q_l1:{ title:'Quiz: Why split one network', qs:[
    { q:'Why is a large network split into subnets when it would technically work whole?',
      opts:['because every network’s throughput drops with the number of addresses reserved in it','for broadcast, security and clarity – splitting creates boundaries you can build on','because one network may serve only a limited number of devices, beyond which it stops working'],
      correct:1, why:'It is a design decision, not a math exercise. A boundary stops broadcasts, gives rules somewhere to bite, and the address tells you where traffic is from.' },
    { q:'What is the first number you need when planning a subnet?',
      opts:['the device count including reserve – only then do you look for the tightest prefix','the prefix you want to use; the device count then adapts to it by splitting into more parts','the number of people in that part of the company, since devices are assigned one per person'],
      correct:0, why:'And it is not the number of people: a warehouse with twenty workers also holds scanners, a label printer, a tablet and an access point.' },
    { q:'Which ranges are used for internal company networks?',
      opts:['any free addresses the company registers with its connectivity provider','the private blocks 10.0.0.0/8, 172.16.0.0/12 and 192.168.0.0/16, which are not routed on the internet','solely the 192.168.0.0/16 range; the others are reserved for internet providers'],
      correct:1, why:'Anyone may use them, because traffic goes out through NAT anyway. Which one you choose is a matter of convenience, not correctness.' },
    { q:'Why is it not worth giving every part of a network a /24 “just in case”?',
      opts:['because a /24 mask is reserved for providers and must not be used in an internal network','because addresses are finite: out of one /24 you then get one huge subnet and nothing else','because the larger the subnet, the more slowly the router searches the routing table'],
      correct:1, why:'Reserve yes, waste no. The goal is the prefix that fits the device count most tightly, with free space behind it.' }
  ]},
  c24q_l2:{ title:'Quiz: The prefix and subnet boundaries', qs:[
    { q:'What happens when you move the prefix one bit to the right (say from /25 to /26)?',
      opts:['the subnet halves in size and at the same time the number of subnets you get doubles','the subnet doubles, since the prefix says how many bits are left available to hosts','the subnet size stays the same; only the network address and its broadcast address change'],
      correct:0, why:'That is the whole mechanic: a /24 gives 256, a /25 two of 128, a /26 four of 64, a /27 eight of 32. The prefix is the line between the network part and the host part.' },
    { q:'How many usable addresses does a subnet with a /26 prefix have?',
      opts:['64, because a /26 reserves exactly that many and all can be assigned to devices','62, because of the 64 addresses one goes to the network address and one to the broadcast','60, because besides the network and broadcast, two addresses are always reserved for the gateway'],
      correct:1, why:'Two are always subtracted. With small subnets it hurts most: a /29 holds eight addresses and six usable.' },
    { q:'At which addresses can /26 subnets begin inside the network 192.168.10.0/24?',
      opts:['anywhere free space happens to be, so at .50 or .100 as the plan requires','only at .0, .64, .128 and .192 – a subnet begins at a multiple of its own size','only at .1 and then every 64, since the .0 address is reserved for the whole network'],
      correct:1, why:'That is why you cannot split “by hundreds” – a hundred is not a power of two. Writing the starts down in advance is the best prevention of gaps and overlaps.' },
    { q:'How do you tell that a subnet’s mask is written correctly?',
      opts:['the network address matches one of the possible starts for that subnet size','the usable address count comes out even, otherwise the mask notation is wrong','the subnet’s last address ends in zero, since the broadcast is always rounded down'],
      correct:0, why:'The network address is always exactly one of those starts. When it does not match, either the address or the prefix is wrong.' }
  ]},
  c24q_l3:{ title:'Quiz: Splitting into several subnets', qs:[
    { q:'What does VLSM mean?',
      opts:['that a subnet mask changes automatically during operation according to the current device count','that each subnet gets its own prefix according to its size, not one shared by all','that two masks are reserved for each subnet – one for clients and one for infrastructure'],
      correct:1, why:'Offices a /26, warehouse a /27, servers a /28. They take 112 of 256 instead of 192 with equal masks – and the rest stays in one piece.' },
    { q:'Why are subnets assigned from the largest to the smallest?',
      opts:['because a large subnet must begin at a multiple of its own size and otherwise has nowhere to go','because a routing table orders paths by size and a smaller subnet would override the larger one','because addresses are assigned in descending order in every network, so the plan builds back to front'],
      correct:0, why:'Starting with small ones crumbles the beginning of the network and the large /26 has nowhere to fit – even though plenty of addresses remain.' },
    { q:'Which prefix is used on a link between two routers?',
      opts:['a /24, because a link between routers must be the same size as the networks it joins','a /30 with four addresses, two of them usable – exactly enough for two routers','a /28, because a smaller subnet could not carry routing protocol overhead'],
      correct:1, why:'It is the most common prefix outside user subnets. Thriftier still is the /31 with two usable, reserved precisely for point-to-point links.' },
    { q:'When is splitting into equal-sized pieces a good choice?',
      opts:['always, because different masks in one network cause routing problems between subnets','when the parts are roughly equal and addresses are plentiful – it is legible and easy to remember','never, because modern networks use variable length masking by device count exclusively'],
      correct:1, why:'Legibility is a real advantage: everyone knows networks start every 64. The cost shows only once the parts are very unequal.' }
  ]},
  c24q_l4:{ title:'Quiz: Mistakes in a plan', qs:[
    { q:'How does an overlap of two subnets show from the outside?',
      opts:['the whole network goes down at once, so the fault is immediately obvious and easy to find','some traffic goes correctly and some disappears – the user describes it as “sometimes it works”','the router refuses to install either subnet into its table and reports an error until it is fixed'],
      correct:1, why:'That is exactly why it is nasty: it does not fail at once. The router has two paths to the same addresses and picks one.' },
    { q:'What does a wrongly set mask on a single computer cause?',
      opts:['the computer mistakes who its neighbor is and tries to deliver data for a foreign network directly instead of via the gateway','the computer loses its address and must ask the DHCP server for a new one, or it stays without connectivity','the computer starts answering traffic meant for neighboring machines, since it accepts foreign frames'],
      correct:0, why:'The mask decides one single question: who is a neighbor. When one machine cannot see what the others see, compare its mask with a neighbor’s.' },
    { q:'The warehouse subnet is full and new devices get no address. Why can it not simply be enlarged?',
      opts:['because a subnet size can no longer be changed after the first addresses are assigned, short of replacing the router','because the next subnet may begin right behind it, so there is nowhere to grow and renumbering is needed','because enlarging a subnet would change the gateway address and every device would lose it'],
      correct:1, why:'That is why it pays to leave room right behind every subnet at design time – not once it happens.' },
    { q:'What is the cheapest way to prevent an overlap while planning?',
      opts:['rely on the router, which reorders overlapping subnets by priority on its own','note the last address alongside each subnet’s range and write the plan down before clicking it in','assign subnets with large gaps between them so they can never meet'],
      correct:1, why:'One’s end greater than another’s start is visible at a glance. The simulator also flags overlaps in the Topology check.' }
  ]}
};

const COURSE_24_FINAL_EXTRA_DEF=[
  { q:'You have 192.168.20.0/24 and need parts for 100, 50 and 25 devices. Which prefixes do you choose?',
    opts:['a /25 for the hundred, a /26 for the fifty and a /27 for the twenty-five – each the tightest that fits','a /24 for all three, since otherwise that many devices do not fit into one network','a /26 for the hundred, a /27 for the fifty and a /28 for the twenty-five, each one step smaller'],
    correct:0, why:'A /25 gives 126 usable, a /26 gives 62 and a /27 gives 30. Assign in that order, largest first: the /25 takes .0 to .127, the /26 then .128 to .191 and the /27 .192 to .223.' },
  { q:'A colleague reports a new server cannot see the printer even though they are “on the same network”. It works for everyone else. Where do you start?',
    opts:['you replace the cable and the switch port, since a single failing machine is always a physical layer fault','you compare its mask with a neighboring machine – a lone machine with a different mask has a different idea of neighbors','you restart the DHCP server so every device fetches its settings again and falls back in line'],
    correct:1, why:'A ten-second question that resolves an unexpectedly large share of cases. A ping to the gateway often goes through, so it is easily blamed on something else.' }
];

__regCourse(24,COURSE_24_DEF,COURSE_24_QUIZZES_DEF,COURSE_24_FINAL_EXTRA_DEF);
