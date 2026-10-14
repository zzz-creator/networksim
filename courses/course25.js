/* course25.js — content of Course 25 (IPv6; loaded on demand via course-core.js) */
/* ============================================================
   COURSE 25 — IPv6. Why IPv4 ran out, how a 128-bit address is really written and
   what it fixes, why the router does not do NAT any more, addresses by hand (SLAAC
   vs DHCPv6), link-local and multicast, the transition (dual-stack, tunnels) and
   how you plan a dual-stack network with room left behind.
   Scene d25Net: PC — R — R2; under the router v4 LAN / v6 LAN side by side.
   ============================================================ */
var C25R={pc:[100,80],r:[330,80],r2:[560,80],v4:[200,200],v6:[460,200]};
function d25Net(pfx){
  return '<svg id="'+pfx+'svg" viewBox="0 0 640 262" width="100%" style="display:block">'
    +'<line x1="115" y1="80" x2="315" y2="80" style="stroke:var(--line2);stroke-width:1.6"/>'
    +'<line x1="345" y1="80" x2="545" y2="80" style="stroke:var(--line2);stroke-width:1.6"/>'
    +'<line x1="322" y1="92" x2="205" y2="188" style="stroke:var(--line2);stroke-width:1.6"/>'
    +'<line x1="330" y1="95" x2="330" y2="185" style="stroke:var(--line2);stroke-width:1.6"/>'
    +'<line x1="338" y1="92" x2="455" y2="188" style="stroke:var(--line2);stroke-width:1.6"/>'
    +'<g id="'+pfx+'glow"></g>'
    +csHost(100,80,'desktop','--green','PC')
    +csDev(330,80,'router','R')
    +csDev(560,80,'globe','R2')
    +csHost(200,200,'lan','--amber','IPv4 LAN')
    +csHost(460,200,'network','--cyan','IPv6 LAN')
    +'<g id="'+pfx+'dyn"></g></svg>';
}
function d25P(pfx,intro,terms){
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+intro+'</p>'
    +'<div class="osi-stage">'+d25Net(pfx)+'</div><div class="m1-cap" id="'+pfx+'cap"></div>'
    +courseStepControls(pfx)+abbrBox(terms);
}
function d25Mount(pfx,STEPS){
  function show(i){d25lblReset();var g=$(pfx+'glow');if(g)g.innerHTML=STEPS[i].glow||'';var d=$(pfx+'dyn');if(d)d.innerHTML=STEPS[i].dyn||'';var c=$(pfx+'cap');if(c)c.innerHTML='<span>'+STEPS[i].cap+'</span>';}
  courseStepper(pfx,STEPS.length,show);
}
function d25g(name,color){var p=C25R[name];return csGlow(p[0],p[1],color,20);}
// Labels stack downward inside the diagram (y <= 250) so two of them can never
// overprint; below it the caller's row is kept. A label whose argument went
// missing renders nothing -- esc() would make it a stray empty <text>.
var D25Y=1;
function d25lbl(x,y,tx,c){
  if(tx==null||tx==='')return '';
  if(y!=null&&y<=250){ D25Y=Math.max(D25Y,y+14); y=D25Y; }
  return '<text x="'+x+'" y="'+y+'" text-anchor="middle" style="font:700 7.5px var(--mono);fill:var('+c+')">'+esc(tx)+'</text>';
}
function d25lblReset(){D25Y=1;}
function d25pkt(path,color,dur){return '<rect x="-6" y="-4" width="12" height="9" rx="2" style="fill:var('+color+')"><animateMotion path="'+path+'" dur="'+(dur||'1.4s')+'" repeatCount="indefinite"/></rect>';}

/* ---------- L1M1 — Why IPv6 exists ---------- */
function renderC25Why(){return d25P('d25a',
  'IPv4 gives each interface a <b>32-bit</b> address. Written out, that is about <b>4.3 billion</b> – and it ran out. Not gradually: the last blocks were handed out years ago. You can stretch the life of IPv4 for years with NAT, and a whole industry grew up around that trick (you met it in the courses <i>Routing and IP addresses</i> and <i>The router in depth</i>). But NAT is a patch, not a solution: one public address shared by hundreds of machines breaks every protocol that wants to reach <i>you</i> rather than your gateway, and it hides who is talking. IPv6 is the replacement: <b>128 bits</b>. Written in full that is 39 digits and about <b>340 undecillion</b> addresses – a space so large that exhaustion is not something anyone can plan around.',
  [['exhaustion','running out of unique addresses; for IPv4 it happened on the public internet.']]);}
function mountC25Why(){d25Mount('d25a',[
  {glow:d25g('r','--amber')+d25g('v4','--amber'),dyn:d25lbl(200,254,'32 bits · 4.3 billion','--amber')+d25lbl(330,44,'IPv4','--amber'),cap:'IPv4: <b>32 bits</b> per address – about <b>4.3 billion</b> in total.'},
  {glow:d25g('v4','--red'),dyn:d25lbl(200,254,'the last blocks are gone','--red'),cap:'They ran out. The final unassigned blocks were handed out years ago.'},
  {glow:d25g('r','--cyan')+d25g('v6','--cyan'),dyn:d25lbl(460,254,'128 bits · 340 undecillion','--cyan')+d25lbl(330,44,'IPv6','--cyan'),cap:'IPv6: <b>128 bits</b>. The number is so large that exhaustion is not on anyone’s planning horizon.'},
  {glow:d25g('r','--muted')+d25g('v4','--muted')+d25g('v6','--muted'),dyn:d25lbl(330,254,'both at once, on the same wire','--muted'),cap:'The answer is not to replace v4 overnight, but to run <b>both</b> – which is exactly what dual-stack means.'}
]);}

/* ---------- L1M2 — Writing an address ---------- */
function renderC25Write(){return d25P('d25b',
  'An IPv6 address is <b>128 bits</b> written as <b>eight groups of four hex digits</b>, e.g. <b>2001:0db8:0000:0000:0000:ff00:0042:8329</b>. That is the full form and nobody types it. The rules that make it writable are two: <b>leading zeros inside a group may be dropped</b> (so <b>0db8</b> becomes <b>db8</b>), and a <b>run of one or more all-zero groups may be replaced by <b>::</b> exactly once. So the same address is usually written <b>2001:db8::ff00:42:8329</b>. Read the shortened form carefully: <b>::</b> can only appear <b>once</b>, otherwise the reader could not know how many groups are hidden – that is the one place people make mistakes. Finally, an IPv6 address is normally divided at the <b>/64</b>: the first four groups identify the network, the last four belong to the interface.',
  [['hexadecimal','base 16: 0–9 and a–f, so four hex digits cover exactly 16 bits.']]);}
function mountC25Write(){d25Mount('d25b',[
  {glow:d25g('v6','--muted'),dyn:d25lbl(460,254,'2001:0db8:0000:0000:0000:ff00:0042:8329','--muted'),cap:'The full form: <b>eight groups</b> of four hex digits – exactly 128 bits.'},
  {glow:d25g('v6','--amber'),dyn:d25lbl(460,254,'2001:db8:0:0:0:ff00:42:8329','--amber'),cap:'First rule: <b>leading zeros may go</b>. <b>0db8</b> becomes <b>db8</b>.'},
  {glow:d25g('v6','--cyan'),dyn:d25lbl(460,254,'2001:db8::ff00:42:8329','--cyan'),cap:'Second rule: one run of zero groups collapses into <b>::</b>.'},
  {glow:d25g('v6','--green')+d25g('r','--green'),dyn:d25lbl(460,220,'network /64','--green')+d25lbl(560,220,'this interface','--green')+d25lbl(330,140,':: may appear only once','--amber'),cap:'The address is split at the <b>/64</b>: network in front, interface behind. And <b>::</b> may appear only once.'}
]);}

/* ---------- L1M3 — What 128 bits fixes ---------- */
function renderC25Fixes(){return d25P('d25c',
  'The extra room is not the interesting part – it is what the designers did with it. <b>Autoconfiguration.</b> A machine can invent its own address from the network prefix (you saw the idea in the course <i>DHCP: how a device gets an address</i>, now built into the protocol), so plugging in a computer needs no configuration at all. <b>End-to-end again.</b> There are addresses enough for every interface on earth, so <b>NAT is no longer necessary</b> – a public server is genuinely reachable without a port-forward. <b>Simpler headers.</b> The fixed 40-byte header removes fields IPv4 needed (checksums, options), so routers process a packet with less work. <b>Built-in security and auto-configuration for addressing</b> come along in the same design. That is why IPv6 is not just “more addresses”: the same protocol solves several old problems at once.',
  [['SLAAC','stateless address autoconfiguration: the device forms its own address from a prefix advertised by the router.']]);}
function mountC25Fixes(){d25Mount('d25c',[
  {glow:d25g('v6','--cyan')+d25g('pc','--cyan'),dyn:d25pkt('M 330 80 L 105 80','--cyan','1s')+d25lbl(460,254,'its own address, formed itself','--cyan'),cap:'<b>Autoconfiguration:</b> the device builds its own address. Plug it in, and it works.'},
  {glow:d25g('v6','--green')+d25g('r2','--green'),dyn:d25lbl(330,140,'no NAT needed','--green'),cap:'<b>End-to-end again:</b> enough addresses exist, so NAT is unnecessary and a public server is directly reachable.'},
  {glow:d25g('v6','--amber'),dyn:d25lbl(460,220,'fixed 40-byte header','--amber'),cap:'<b>Simpler header:</b> a fixed 40 bytes, so a router does less work per packet.'},
  {glow:d25g('pc','--green')+d25g('v6','--green'),dyn:d25lbl(330,140,'fewer moving parts, fewer NAT rules','--green'),cap:'The same redesign solved several old problems at once – which is why IPv6 is more than “more addresses”.'}
]);}

/* ---------- L2M1 — No more NAT ---------- */
function renderC25NoNat(){return d25P('d25d',
  'In IPv4 the router does <b>NAT</b>: it rewrites the source address of everything leaving, so a whole office appears as one public address (the courses <i>Routing and IP addresses</i> and <i>The router in depth</i>). IPv6 does <b>not</b> do this – and that is intentional, not an omission. With enough addresses every device gets a <b>globally unique</b> one, so there is nothing to hide behind a shared address. What replaces NAT is <b>stateful firewalling</b>: the router still decides <b>who may start a connection</b>, but it no longer hides who is who. The result is that you can reach a server directly, inbound connections work without juggling port forwards, and logs finally carry a real source address. NAT’s other trick – keeping a client reachable for outgoing traffic – is now the job of <b>state</b> on the firewall, which you already know from the course <i>Network security</i>.',
  [['stateful firewall','a firewall that remembers which connections were started from inside and lets their replies back.']]);}
function mountC25NoNat(){d25Mount('d25d',[
  {glow:d25g('r','--muted')+d25g('v4','--muted'),dyn:d25lbl(200,254,'IPv4: one public address for all','--muted'),cap:'IPv4: <b>NAT</b> rewrites the source address, so the whole office looks like one machine.'},
  {glow:d25g('r','--red')+d25g('v4','--red'),dyn:d25pkt('M 330 80 L 545 80','--red','0.9s')+d25lbl(330,44,'answers arrive at the router, not at you','--red'),cap:'The price: replies come back <b>to the router</b>, and inbound connections need port forwards.'},
  {glow:d25g('r','--cyan')+d25g('v6','--cyan'),dyn:d25lbl(460,254,'IPv6: every device has its own address','--cyan'),cap:'IPv6: no NAT. Every device gets a <b>globally unique</b> address.'},
  {glow:d25g('r','--green'),dyn:d25lbl(330,140,'the router still filters – it just does not hide you','--green'),cap:'What remains is a <b>stateful firewall</b>: it decides who may <i>start</i> a connection, without hiding who is who.'}
]);}

/* ---------- L2M2 — Addresses without a server ---------- */
function renderC25Slaac(){return d25P('d25e',
  'On IPv4 a device normally asks a <b>DHCP server</b> for its address (the course <i>DHCP: how a device gets an address</i>). IPv6 offers two ways. <b>SLAAC</b> – stateless autoconfiguration: the router broadcasts a <b>prefix</b>, and each device picks the <b>interface part</b> itself, usually from its MAC address. Nothing has to be maintained, and a guest device is online before anyone visits the DHCP server. <b>DHCPv6</b> hands out addresses centrally, the way IPv4 does, and is used where you need exact control over which host gets which address. The two can be combined: the router advertises the prefix, but the authoritative list of addresses comes from DHCPv6. What must still come from somewhere is the <b>DNS server</b> – the router advertises it, but it does not invent one.',
  [['prefix','the leading part of an address (normally /64) that the network shares; the device adds its own part to it.']]);}
function mountC25Slaac(){d25Mount('d25e',[
  {glow:d25g('r','--cyan')+d25g('v6','--cyan'),dyn:d25lbl(460,220,'here is my prefix','--cyan')+d25pkt('M 330 95 L 330 185','--cyan','0.8s'),cap:'The router <b>advertises a prefix</b> to the network – no server involved.'},
  {glow:d25g('pc','--cyan'),dyn:d25lbl(100,110,'I choose the rest myself','--cyan'),cap:'<b>SLAAC:</b> the device forms the rest of the address itself, often from its MAC address.'},
  {glow:d25g('pc','--amber')+d25g('r','--amber'),dyn:d25lbl(330,140,'or: a DHCPv6 server hands it out','--amber'),cap:'<b>DHCPv6</b> keeps central control – used when you need to know exactly who has which address.'},
  {glow:d25g('pc','--green')+d25g('r','--green'),dyn:d25lbl(330,140,'but DNS still has to come from somewhere','--green'),cap:'Addresses can be automatic; the <b>DNS server</b> is still advertised, never invented.'}
]);}

/* ---------- L2M3 — Special addresses ---------- */
function renderC25Special(){return d25P('d25f',
  'Three kinds of address come with IPv6 and you will meet them in configuration. <b>Global unicast</b> addresses (starting <b>2000::/3</b>) are the normal ones: unique worldwide, routable on the internet. <b>Link-local</b> addresses (<b>fe80::/10</b>) exist only on the local link and are <b>never routed</b> – every interface has one automatically, and the router uses it for its own neighbours. That is also why “ping fe80::1%eth0” sometimes needs the <b>zone</b> after the %: the same link-local address exists on every interface, so you have to say which one you mean. <b>Multicast</b> replaces broadcast: <b>ff02::1</b> is “all nodes on this link”, <b>ff02::2</b> “all routers”. IPv6 has <b>no broadcast at all</b>, which is a real advantage in a large network.',
  [['link-local','an address valid only on the local link (fe80::/10); never routed beyond it.'],
   ['zone / scope id','the %eth0 or %2 after a link-local address, naming which interface it is meant on.']]);}
function mountC25Special(){d25Mount('d25f',[
  {glow:d25g('v6','--cyan'),dyn:d25lbl(460,254,'2001:db8::1','--cyan'),cap:'<b>Global unicast</b> (2000::/3): unique worldwide, routable.'},
  {glow:d25g('r','--amber'),dyn:d25lbl(330,220,'fe80::1','--amber'),cap:'<b>Link-local</b> (fe80::/10): every interface has one, and it is <b>never routed</b>.'},
  {glow:d25g('r','--amber'),dyn:d25lbl(330,140,'fe80::1%eth0','--amber'),cap:'Because the same link-local address exists on every interface, you add a <b>zone</b> (%eth0) to say which one.'},
  {glow:d25g('v6','--violet'),dyn:d25lbl(330,250,'ff02::1','--violet')+d25pkt('M 460 200 L 330 185 L 200 200','--violet','1.2s'),cap:'<b>Multicast</b> replaces broadcast – ff02::1 is “all nodes here”. IPv6 has <b>no broadcast</b> at all.'}
]);}

/* ---------- L3M1 — One network, two families ---------- */
function renderC25Dual(){return d25P('d25g',
  'The transition is <b>dual-stack</b>: the same network carries IPv4 and IPv6 at once, and each host has an address in both. Two parallel stacks, on one cable, for as long as the old world needs it. The point where the two meet is the <b>dual-stack host</b>: it runs both protocols independently, and applications choose (or try both, the “happy eyeballs” technique). Inside the network nothing special happens – they are two separate networks in terms of routing. The consequence for you as an administrator is mostly <b>planning</b>: you now run two networks side by side, so a /64 is allocated for each, and you should build it the way the course <i>Splitting a network: subnets in practice</i> teaches – largest first, with room left behind each network.',
  [['dual-stack','running IPv4 and IPv6 at the same time, so old and new work in parallel during the transition.']]);}
function mountC25Dual(){d25Mount('d25g',[
  {glow:d25g('r','--amber')+d25g('v4','--amber'),dyn:d25lbl(200,254,'IPv4 still runs','--amber'),cap:'During the transition IPv4 keeps working – nothing is switched off.'},
  {glow:d25g('r','--cyan')+d25g('v6','--cyan'),dyn:d25lbl(460,254,'IPv6 runs beside it','--cyan'),cap:'<b>Dual-stack:</b> both on the same cable, as two separate networks to the router.'},
  {glow:d25g('pc','--green'),dyn:d25lbl(100,110,'two addresses on one interface','--green'),cap:'Each host ends up with an address in <b>both</b> families.'},
  {glow:d25g('r','--green')+d25g('v4','--green')+d25g('v6','--green'),dyn:d25lbl(330,140,'two networks to plan, not one','--amber'),cap:'So you plan <b>two</b> networks side by side – largest first, room left behind each (the course <i>Splitting a network: subnets in practice</i>).'}
]);}

/* ---------- L3M2 — When the other side speaks only v4 ---------- */
function renderC25Trans(){return d25P('d25h',
  'While some networks only speak IPv4, something has to translate – and this time translation is <b>not NAT</b>. <b>Tunnelling</b> wraps an IPv6 packet inside an IPv4 packet, so it can cross an IPv4-only stretch; the receiver unwraps it. Two families of this exist. <b>6to4</b> and its successor <b>Teredo</b> give a machine an IPv6 address even behind an IPv4-only NAT, by tunnelling through a public server. <b>ISATAP</b> is for inside one organisation: IPv6 traffic is carried inside IPv4 <b>inside</b> the company network, so you can introduce IPv6 host by host without touching the infrastructure. A translation proxy (<b>NAT64</b>) is the other direction: it lets an IPv6-only client reach an IPv4-only server. All of these are <b>transitional</b> – the goal is a network where the whole thing can be switched off.',
  [['tunnelling','carrying one protocol inside another, so traffic crosses a network that only understands the outer one.']]);}
function mountC25Trans(){d25Mount('d25h',[
  {glow:d25g('v6','--cyan')+d25g('r2','--red'),dyn:d25lbl(460,254,'IPv6 network','--cyan')+d25lbl(560,140,'IPv4 only','--red'),cap:'A new network on one side, an <b>IPv4-only</b> provider in the middle.'},
  {glow:d25g('r','--amber')+d25g('r2','--amber'),dyn:d25pkt('M 330 80 L 545 80','--amber','1.2s')+d25lbl(330,44,'IPv6 packet wrapped in IPv4','--amber'),cap:'<b>Tunnelling:</b> the IPv6 packet is wrapped inside IPv4 and unwrapped at the far end.'},
  {glow:d25g('v6','--violet'),dyn:d25lbl(200,254,'ISATAP: inside the company','--violet')+d25lbl(460,254,'6to4 / Teredo: across it','--violet'),cap:'<b>ISATAP</b> carries IPv6 within your own network; <b>6to4/Teredo</b> reach out over IPv4 only.'},
  {glow:d25g('r2','--green')+d25g('v6','--green'),dyn:d25lbl(330,140,'all transitional – the goal is to switch it off','--green'),cap:'All of it is <b>transitional</b>. The end state is a pure IPv6 network with no translation left.'}
]);}

/* ---------- L3M3 — Planning a v6 network ---------- */
function renderC25Plan(){return d25P('d25i',
  'Planning IPv6 is easier than IPv4 in one way and stricter in another. <b>Easier</b>: you do not have to be frugal. Every network gets a <b>/64</b> as a matter of course – 18 quintillion addresses – and the rules from the course <i>Splitting a network: subnets in practice</i> still apply, but there is no pressure to squeeze. <b>Shorter prefixes are illegal in practice</b>: /64 is the size an ordinary LAN gets; a /48 is what a site gets from its provider and contains 65 536 networks of that size. <b>Stricter</b> are the conventions you should keep: <b>/64 is the network boundary</b> for privacy extensions, and subnetting inside a /64 breaks neighbour discovery. Address planning for IPv6 therefore means <b>how many /48s do I need and how do I hand out /64s</b> – not which mask fits the device count.',
  [['/48','the usual size a site receives from its provider; it holds 65 536 networks of /64.']]);}
function mountC25Plan(){d25Mount('d25i',[
  {glow:d25g('r','--amber')+d25g('v6','--amber'),dyn:d25lbl(330,44,'you get a /48','--amber'),cap:'A site normally receives a <b>/48</b> from its provider.'},
  {glow:d25g('v6','--cyan'),dyn:d25lbl(460,220,'= 65 536 networks of /64','--cyan'),cap:'That /48 holds <b>65 536</b> ordinary networks.'},
  {glow:d25g('pc','--green')+d25g('v6','--green'),dyn:d25lbl(100,110,'each LAN gets a whole /64','--green'),cap:'Every LAN gets a <b>/64</b> as a matter of course – 18 quintillion addresses, no squeezing.'},
  {glow:d25g('v6','--red'),dyn:d25lbl(460,220,'do not subnet inside a /64','--red'),cap:'But <b>do not split inside a /64</b>: it breaks neighbour discovery and privacy extensions.'}
]);}

/* ---------- L4M1 — The AAAA record ---------- */
function renderC25Aaaa(){return d25P('d25j',
  'For a name to lead to an IPv6 address, DNS needs a new record type: <b>AAAA</b> (four A’s because it returns a <b>128-bit</b> address, against 32 bits for A). A host with both families simply has <b>two records for the same name</b> – an A and an AAAA. That single detail explains most of what happens on the day you switch IPv6 on: a client asks for both, gets both, and (depending on its implementation) tries one, the other, or both at once. If <b>no AAAA record exists</b> while the A record does, the name works on IPv4 only. And if a <b>wrong</b> AAAA record is published, you have a name that resolves perfectly and then fails to connect – a fault that is easy to overlook, because the name resolution in the path test (the courses <i>DNS and names in the network</i> and <i>When the network breaks: troubleshooting</i>) looks entirely healthy.',
  [['AAAA','the DNS record type that maps a name to an IPv6 address, alongside A for IPv4.']]);}
function mountC25Aaaa(){d25Mount('d25j',[
  {glow:d25g('pc','--muted')+d25g('r','--muted'),dyn:d25lbl(330,140,'what is the address of www.example?','--muted'),cap:'A client asks DNS: what address does this name have?'},
  {glow:d25g('v4','--amber')+d25g('v6','--cyan'),dyn:d25lbl(200,254,'A → 192.168.1.5','--amber')+d25lbl(460,254,'AAAA → 2001:db8::5','--cyan'),cap:'It gets <b>both</b>: an A record for v4, an <b>AAAA</b> record for v6.'},
  {glow:d25g('v6','--green'),dyn:d25pkt('M 100 80 L 330 80 L 460 200','--green','1.2s'),cap:'One name, two addresses – so the client picks, or races, both (happy eyeballs).'},
  {glow:d25g('v6','--red'),dyn:d25lbl(330,140,'a wrong AAAA: the name resolves, the connection does not','--red'),cap:'A <b>wrong</b> AAAA record is the nasty one: resolution looks healthy, the connection fails.'}
]);}

/* ---------- L4M2 — Checklist before switching on ---------- */
function renderC25Check(){return d25P('d25k',
  'IPv6 on an existing network is easy to break, because most of what you already know does not apply. <b>ACLs</b> written for v4 do not cover v6 – an interface or zone firewall often has separate rule sets, and a gap there is an open door. <b>DNS</b> must serve AAAA records, or names keep working by accident on v4 only. <b>Monitoring and logs</b> built around four fields have to learn about eight groups. <b>Tunneling</b> hides a broken path instead of fixing it. The safe order is the one you would use for any change: prepare in parallel, verify on the side, then switch – never delete the old path until the new one has proven itself. Everything from the course <i>Zero Trust and microsegmentation</i> about least privilege applies twice: once per family.',
  [['AAAA','the DNS record type that maps a name to an IPv6 address, alongside A for IPv4.']]);}
function mountC25Check(){d25Mount('d25k',[
  {glow:d25g('r','--amber'),dyn:d25lbl(330,44,'ACLs cover v4 only','--amber'),cap:'<b>ACLs</b> do not carry over: a v6 rule set is separate – and a gap there is an open door.'},
  {glow:d25g('v6','--amber'),dyn:d25lbl(460,220,'DNS without AAAA','--amber'),cap:'Without <b>AAAA</b> records, names keep working on v4 by accident – so it looks fine until it does not.'},
  {glow:d25g('pc','--amber'),dyn:d25lbl(100,110,'logs built for 4 fields','--amber'),cap:'<b>Monitoring and logs</b> have to learn eight groups.'},
  {glow:d25g('v6','--green')+d25g('r','--green'),dyn:d25lbl(330,140,'build in parallel, cut over, then remove v4','--green'),cap:'Verify on the side first, keep v4 until IPv6 has proven itself – the rule you know from the course <i>When the network breaks: troubleshooting</i>.'}
]);}

const COURSE_25_DEF = {
  id:'course25',
title:'IPv6: why it exists and how to plan it',
  blurb:'The biggest gap in a network from A to Z: why IPv4 ran out, how a 128-bit address is really written and read, what the extra room fixes, why the router stops doing NAT, addresses without a server (SLAAC and DHCPv6), link-local and multicast, the transition (dual-stack and tunnels) and how you plan a dual-stack network with room left behind.',
  lessons:[
    { id:'c25l1', title:'Why IPv6 exists', taskId:null, quizId:'c25q_l1', modules:[
      { id:'c25l1m1', title:'4.3 billion, and then nothing', render:renderC25Why, mount:mountC25Why },
      { id:'c25l1m2', title:'Writing a 128-bit address', render:renderC25Write, mount:mountC25Write },
      { id:'c25l1m3', title:'What the extra room fixes', render:renderC25Fixes, mount:mountC25Fixes }
    ]},
    { id:'c25l2', title:'How IPv6 behaves differently', taskId:'nat-lab', quizId:'c25q_l2', modules:[
      { id:'c25l2m1', title:'The router stops doing NAT', render:renderC25NoNat, mount:mountC25NoNat },
      { id:'c25l2m2', title:'Addresses without a server', render:renderC25Slaac, mount:mountC25Slaac },
      { id:'c25l2m3', title:'Link-local, zones and multicast', render:renderC25Special, mount:mountC25Special }
    ]},
    { id:'c25l3', title:'Getting there: the transition', taskId:null, quizId:'c25q_l3', modules:[
      { id:'c25l3m1', title:'One network, two families', render:renderC25Dual, mount:mountC25Dual },
      { id:'c25l3m2', title:'When the other side speaks only v4', render:renderC25Trans, mount:mountC25Trans },
      { id:'c25l3m3', title:'Planning a v6 network', render:renderC25Plan, mount:mountC25Plan }
    ]},
    { id:'c25l4', title:'Before you switch it on', taskId:'dns-alias', quizId:'c25q_l4', modules:[
      { id:'c25l4m1', title:'DNS and the AAAA record', render:renderC25Aaaa, mount:mountC25Aaaa },
      { id:'c25l4m2', title:'A checklist before the switch-on', render:renderC25Check, mount:mountC25Check }
    ]}
  ]
};

const COURSE_25_QUIZZES_DEF = {
  c25q_l1:{ title:'Quiz: Why IPv6 exists', qs:[
    { q:'Why did IPv4 run out?',
      opts:['because 32 bits were a poor choice for the number of devices, and there is no clean way to extend an address in place','because most of the addresses were wasted on networks that never used them, and the missing piece could simply be freed up','because routers could not handle 32 bits efficiently once the tables grew'],
      correct:0, why:'The space is 4.3 billion in total. NAT stretched it for years, but the fix is a different address size – which cannot be done in place.' },
    { q:'How many bits does an IPv6 address have?',
      opts:['64','128','256'],
      correct:1, why:'128 bits – eight groups of four hex digits, about 340 undecillion addresses.' },
    { q:'In 2001:db8::ff00:42:8329, what does the :: stand for?',
      opts:['nothing in particular, it is only for readability','one or more all-zero groups, and it may appear only once in an address','the interface part, which the router fills in for you'],
      correct:1, why:'That is exactly why :: may appear only once: otherwise a reader could not tell how many groups are hidden.' },
    { q:'What does the /64 at the end of an IPv6 prefix mean in practice?',
      opts:['nothing, IPv6 has no prefixes','the first four groups are the network and the last four belong to the interface','the address may be shortened by four digits'],
      correct:1, why:'The split is at /64: network in front, interface behind. It is the normal size of an ordinary LAN.' }
  ]},
  c25q_l2:{ title:'Quiz: How IPv6 behaves differently', qs:[
    { q:'What does an IPv6 router normally NOT do that its IPv4 counterpart does?',
      opts:['filter traffic','translate source addresses (NAT)','route packets'],
      correct:1, why:'With enough addresses for everyone there is nothing to hide, so NAT is not needed. Filtering still happens.' },
    { q:'What replaces NAT on an IPv6 network?',
      opts:['nothing – the network becomes open','a stateful firewall that decides who may start a connection','static port forwards on every host'],
      correct:1, why:'The router still decides who may begin a connection – it simply no longer hides who is who.' },
    { q:'What is SLAAC?',
      opts:['a protocol that gives every device the same address','stateless address autoconfiguration: the device forms its own address from an advertised prefix','automatic configuration of the DNS server'],
      correct:1, why:'The router advertises the prefix and the device picks the rest. DHCPv6 is the alternative when you need central control.' },
    { q:'For which address is the zone (for example %eth0) needed?',
      opts:['a global unicast address','a link-local address, because the same one exists on every interface','a multicast address'],
      correct:1, why:'fe80::/10 exists on every interface, so you must name which one you mean. Global addresses are unique anyway.' },
    { q:'How does IPv6 handle what IPv4 does with broadcast?',
      opts:['it uses multicast instead: ff02::1 is all nodes on the link','it keeps broadcast, but in a reduced form','it has no way to address a group at all'],
      correct:0, why:'IPv6 has no broadcast at all – a real advantage in a large network.' }
  ]},
  c25q_l3:{ title:'Quiz: The transition', qs:[
    { q:'What is dual-stack?',
      opts:['running IPv4 and IPv6 in parallel on the same network','routing between an IPv4 and an IPv6 network at the border','using two ISPs, one for each protocol'],
      correct:0, why:'Both families on one cable, treated as two separate networks. It is how the transition is actually done.' },
    { q:'How is tunnelling different from NAT?',
      opts:['tunnelling rewrites addresses, NAT wraps packets','tunnelling wraps an IPv6 packet inside IPv4 and unwraps it at the far end','there is no difference, they are two names for the same thing'],
      correct:1, why:'Tunnelling changes nothing about the inner addresses – it only carries them across an IPv4-only stretch.' },
    { q:'Which of these is meant for introducing IPv6 inside one organisation?',
      opts:['ISATAP','Teredo','a /48 from the provider'],
      correct:0, why:'ISATAP carries IPv6 inside IPv4 within your own network, so you can go host by host. Teredo and 6to4 reach across the internet.' },
    { q:'How large is a network an ordinary LAN normally receives?',
      opts:['a /64','a /48','a /32'],
      correct:0, why:'A site gets a /48 from its provider; each LAN inside it gets a /64.' },
    { q:'Why should you not subnet inside a /64?',
      opts:['because it is forbidden by the standard','because it breaks neighbour discovery and privacy extensions','because a /64 then holds too few addresses'],
      correct:1, why:'There are 18 quintillion addresses in it – the reason to stop is technical, not about size.' }
  ]},
  c25q_l4:{ title:'Quiz: Before you switch it on', qs:[
    { q:'Which DNS record maps a name to an IPv6 address?',
      opts:['A','AAAA','PTR'],
      correct:1, why:'Four A’s because it returns 128 bits, against 32 for A. A host with both families simply has both records.' },
    { q:'A name resolves correctly but no connection is established. What is the likely cause?',
      opts:['the A record points to the wrong host','a wrong AAAA record – resolution looks healthy while the connection fails','the DNS server is down'],
      correct:1, why:'The nastiest IPv6 fault, because the name-and-address test from the troubleshooting course passes. Check both record types.' },
    { q:'Which of these does NOT carry over automatically to IPv6?',
      opts:['the routing table','ACLs and rules','neighbour discovery'],
      correct:1, why:'ACLs written for IPv4 do not cover IPv6 – an open rule set is an open door, and a gap hides in plain sight.' },
    { q:'What is the safe order for enabling IPv6 on a running network?',
      opts:['switch IPv6 on and remove IPv4 at the same time','build it in parallel, verify it, then keep IPv4 until IPv6 has proven itself','remove IPv4 first so the problems become visible'],
      correct:1, why:'The rule you already know from the course <i>When the network breaks: troubleshooting</i>: never delete the old path before the new one is proven.' }
  ]}
};

const COURSE_25_FINAL_EXTRA_DEF = [
  { q:'IPv6 is not merely “more addresses”. Which of its design changes matters most for a server that the internet must reach?',
    opts:['the fixed 40-byte header','that every interface can have a globally unique address, so NAT is no longer needed','the possibility of tunnelling'],
    correct:1, why:'End-to-end reachability is the practical change: inbound connections work without juggling port forwards, and logs carry a real source address.' },
  { q:'Why does a device with both IPv4 and IPv6 usually have two DNS records for the same name?',
    opts:['so DNS can answer faster','because A returns an IPv4 and AAAA an IPv6 address','because one of them is a redirect to the other'],
    correct:1, why:'A is 32-bit, AAAA is 128-bit. With both, a client can try either family – and that is also how a wrong AAAA hides a failure.' }
];

__regCourse(25,COURSE_25_DEF,COURSE_25_QUIZZES_DEF,COURSE_25_FINAL_EXTRA_DEF);