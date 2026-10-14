/* course23.js — content of Course 23 (DHCP: how a device gets an address; loaded on demand via course-core.js) */
/* ============================================================
   COURSE 23 — DHCP: how a device gets an address (why not by hand, DORA, the range
   and the lease and reservations, a relay into remote networks, a rogue server and starvation).
   It builds on addresses from the course <i>Why networks exist and how data travels</i> and <i>Routing and IP addresses</i>, on L2 defense from the course <i>The switch in depth</i> and on DNS from the course <i>DNS and names in the network</i>.
   Scene d23Net: PC + PC-2 — SW — R (relay) — DHCP; under the switch a ROGUE server,
   behind the router a remote network BRANCH.
   ============================================================ */
var C23R={pc:[64,110],sw:[196,110],rtr:[330,110],srv:[520,110],pc2:[64,196],evil:[196,196],far:[520,196]};
function d23Net(pfx){
  return '<svg id="'+pfx+'svg" viewBox="0 0 640 262" width="100%" style="display:block">'
    +'<line x1="79" y1="110" x2="181" y2="110" style="stroke:var(--line2);stroke-width:1.6"/>'
    +'<line x1="79" y1="190" x2="183" y2="122" style="stroke:var(--line2);stroke-width:1.6"/>'
    +'<line x1="211" y1="110" x2="315" y2="110" style="stroke:var(--line2);stroke-width:1.6"/>'
    +'<line x1="345" y1="110" x2="505" y2="110" style="stroke:var(--line2);stroke-width:1.6"/>'
    +'<line x1="196" y1="181" x2="196" y2="125" style="stroke:var(--line2);stroke-width:1.5;stroke-dasharray:2 3"/>'
    +'<line x1="338" y1="122" x2="508" y2="186" style="stroke:var(--line2);stroke-width:1.6"/>'
    +'<g id="'+pfx+'glow"></g>'
    +csHost(64,110,'desktop','--green','PC')
    +csDev(196,110,'l2switch','SW')
    +csDev(330,110,'router','R')
    +csHost(520,110,'server','--blue','DHCP')
    +csHost(64,196,'desktop','--green','PC-2')
    +csHost(196,196,'shield','--red','ROGUE DHCP')
    +csHost(520,196,'lan','--violet','BRANCH')
    +'<g id="'+pfx+'dyn"></g></svg>';
}
function d23P(pfx,intro,terms){
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+intro+'</p>'
    +'<div class="osi-stage">'+d23Net(pfx)+'</div><div class="m1-cap" id="'+pfx+'cap"></div>'
    +courseStepControls(pfx)+abbrBox(terms);
}
function d23Mount(pfx,STEPS){
  function show(i){var g=$(pfx+'glow');if(g)g.innerHTML=STEPS[i].glow||'';var d=$(pfx+'dyn');if(d)d.innerHTML=STEPS[i].dyn||'';var c=$(pfx+'cap');if(c)c.innerHTML='<span>'+STEPS[i].cap+'</span>';}
  courseStepper(pfx,STEPS.length,show);
}
function d23g(name,color){var p=C23R[name];return csGlow(p[0],p[1],color,20);}
function d23lbl(x,y,tx,c){return '<text x="'+x+'" y="'+y+'" text-anchor="middle" style="font:700 7.5px var(--mono);fill:var('+c+')">'+esc(tx)+'</text>';}
function d23pkt(path,color,dur){return '<rect x="-6" y="-4" width="12" height="9" rx="2" style="fill:var('+color+')"><animateMotion path="'+path+'" dur="'+(dur||'1.4s')+'" repeatCount="indefinite"/></rect>';}

/* ---------- L1M1 — Manual addresses and their limits ---------- */
function renderC23Manual(){return d23P('d23a',
  'Every device in a network needs an <b>IP address</b> – without one it has no way to ask for data. In the courses <i>Why networks exist and how data travels</i> and <i>Routing and IP addresses</i> you set addresses by hand, and with three machines that is perfectly fine. But manual addresses hit a hard ceiling. <b>Nobody keeps the register.</b> The addresses live in the admin’s head or in a table that stops matching reality the moment somebody brings in a laptop. <b>Two machines get the same number</b> – and that is a conflict: the machines notice it themselves (they ask who owns the address), but a human has to fix it – the network suddenly does not know whose data is whose, and it fails for <i>both</i>. <b>A visitor has no chance.</b> Whoever comes for a meeting would have to request an address from the admin. And when the gateway or the DNS server changes, you walk around <b>every</b> machine one by one. That is why <b>DHCP</b> exists: a service that <b>lends addresses itself</b>, makes sure none repeats, and packs the rest of the settings in with the address.',
  [['DHCP','Dynamic Host Configuration Protocol – the service that automatically lends clients an address and the rest of the network settings.'],
   ['address conflict','two machines hold the same IP address; connections break for both of them, not just for the other one.']]);}
function mountC23Manual(){d23Mount('d23a',[
  {glow:d23g('pc','--green'),dyn:d23lbl(64,74,'address set by hand','--green'),cap:'With <b>one</b> machine a manual address is the simplest thing in the world: you type a number and you are done. The problem is not the first machine.'},
  {glow:d23g('pc','--red')+d23g('pc2','--red'),dyn:d23lbl(64,251,'both 192.168.1.10 → conflict','--red'),cap:'A second machine arrives and somebody mistypes. <b>The same address twice</b> = a conflict, and connections break for <b>both</b>. The nasty part is that it does not look like an addressing mistake, but like “it works sometimes”.'},
  {glow:d23g('pc2','--amber')+d23g('sw','--amber'),dyn:d23pkt('M 64 196 L 196 110','--amber')+d23lbl(196,251,'a visitor: which address should they take?','--amber'),cap:'Now a visitor arrives with a laptop. The manual system has no answer for them – they either bother the admin or <b>guess</b> and cause a conflict.'},
  {glow:d23g('srv','--blue')+d23g('rtr','--blue')+d23g('sw','--blue')+d23g('pc','--blue'),dyn:d23pkt('M 520 110 L 64 110','--blue')+d23lbl(330,74,'DHCP: one place lends the addresses','--blue'),cap:'<b>DHCP</b> reverses the direction: you do not set the address, you <b>ask for</b> it. One place keeps the register, so one number cannot go to two machines.'}
]);}

/* ---------- L1M2 — What a client actually needs ---------- */
function renderC23Needs(){return d23P('d23b',
  'If DHCP only lent an address, it would be useless. A device needs <b>four</b> pieces of information to actually work in a network. <b>1) The IP address</b> – its own number, by which the others find it. <b>2) The subnet mask</b> – from it the device knows who its neighbors are and whom it may send data to directly (how a mask does that is taken apart in the course <i>ISO/OSI and TCP/IP: the network map</i>). <b>3) The default gateway</b> – the router’s address, where it sends everything that is not a neighbor; without it you reach your own network but no further (exactly the default route from the course <i>Routing and IP addresses</i>, seen from the client’s side). <b>4) The DNS server</b> – without it addresses work but names do not; the user describes this as “the internet is down” even though technically it is not. So DHCP does not send a number, it sends a <b>whole settings bundle</b>. That is its second, less visible half: when you change the DNS server, you rewrite it in <b>one</b> place and it spreads on its own.',
  [['subnet mask','it says which part of the address is the network and which is the device – from that follows who is a neighbor.'],
   ['default gateway','the router’s address, where the client sends traffic bound outside its own network.']]);}
function mountC23Needs(){d23Mount('d23b',[
  {glow:d23g('pc','--green'),dyn:d23lbl(64,74,'IP 192.168.1.50','--green'),cap:'The <b>address</b> alone means only “this is my number”. So far you do not know whom you may talk to.'},
  {glow:d23g('pc','--blue')+d23g('sw','--blue')+d23g('pc2','--blue'),dyn:d23pkt('M 64 110 L 196 110 L 64 196','--blue')+d23lbl(196,251,'the mask: who is a neighbor','--blue'),cap:'The <b>mask</b> lets the client decide who counts as a neighbor. To a neighbor it sends a frame directly through the switch, with no router.'},
  {glow:d23g('pc','--amber')+d23g('sw','--amber')+d23g('rtr','--amber'),dyn:d23pkt('M 64 110 L 330 110','--amber')+d23lbl(330,74,'the gateway: everything else this way','--amber'),cap:'The <b>gateway</b> is the router’s address. Without it the client moves only inside its own network – it cannot get out, and that looks like an internet outage.'},
  {glow:d23g('pc','--violet')+d23g('sw','--violet')+d23g('rtr','--violet')+d23g('srv','--violet'),dyn:d23pkt('M 64 110 L 520 110','--violet')+d23lbl(330,251,'DNS: without it addresses work, names do not','--violet'),cap:'And the <b>DNS server</b>: without it you reach an address but not a name. The user reports “nothing works” – while the network is running fine (the course <i>DNS and names in the network</i>).'}
]);}

/* ---------- L1M3 — Where the DHCP server lives ---------- */
function renderC23Where(){return d23P('d23c',
  'Many people picture a “DHCP server” as a special box in the server room. In fact it is a <b>role</b>, not a piece of hardware – and networks of different sizes hand it to different devices. In a <b>home</b> the ISP router does it; that is why everything works by itself at home and you have never heard of DHCP. In a <b>smaller company</b> the role usually sits on the router or the firewall at the network edge, since that box is the gateway anyway. In a <b>larger company</b> DHCP runs on a server or an L3 switch – closer to whoever needs the addresses, and able to manage several networks from one place. The simulator is the same: you switch the <b>DHCP</b> role on in the detail of a router, a firewall, an L3 switch or an ordinary server. What matters is that in one network <b>one</b> device holds this role. Two servers handing out from the same range start stepping on each other – and that is exactly what the last lesson is about.',
  [['role','a property you switch on for a device (DHCP, DNS) – it is not a separate kind of device.']]);}
function mountC23Where(){d23Mount('d23c',[
  {glow:d23g('rtr','--green'),dyn:d23lbl(330,74,'at home: the router holds the role','--green'),cap:'<b>At home</b> DHCP hides inside the ISP router. That is why your connection just works and you never set anything up.'},
  {glow:d23g('rtr','--amber')+d23g('sw','--amber')+d23g('pc','--amber'),dyn:d23pkt('M 330 110 L 64 110','--amber')+d23lbl(196,74,'smaller company: the router or firewall','--amber'),cap:'In a <b>smaller company</b> the role usually sits on the edge router or firewall – it is everyone’s gateway anyway.'},
  {glow:d23g('srv','--blue')+d23g('rtr','--blue')+d23g('sw','--blue')+d23g('pc2','--blue'),dyn:d23pkt('M 520 110 L 196 110 L 64 196','--blue')+d23lbl(520,74,'larger company: a dedicated server','--blue'),cap:'In a <b>larger company</b> DHCP runs on a server or an L3 switch – one place can serve several networks at once.'},
  {glow:d23g('srv','--red')+d23g('evil','--red'),dyn:d23lbl(330,251,'two servers on one range = trouble','--red'),cap:'Whoever you give the role to, one rule holds: <b>one</b> DHCP server per network. What two of them do you will see in the last lesson.'}
]);}

/* ---------- L2M1 — Discover ---------- */
function renderC23Discover(){return d23P('d23d',
  'You switch a laptop on. It has no address, no mask, no gateway – it <b>knows nothing at all about the network</b>, not even whether a DHCP server is in it or where to look for one. Yet it has to start somehow. It solves this the only way it can: it shouts into the dark. It sends a <b>DHCP Discover</b> as a <b>broadcast</b> – a frame addressed to “everyone”, which the switch floods across the network (more precisely across that VLAN; from the course <i>Switching and VLANs</i> you know the wall stops it there). Its header carries <b>0.0.0.0</b> as the sender, because it has no address yet, and <b>255.255.255.255</b> as the destination, meaning “anyone who hears this” (all-ones in an address means “everyone”, all-zeros means “nobody yet” – which is why the sender is 0.0.0.0). It also attaches its <b>MAC address</b> – which it always has, burned into the network card – so that someone can identify it in the reply. (Careful: “burned in” means from the factory, not unchangeable – what a machine writes into the frames it sends is up to the machine, and that is exactly what the attack in the last lesson exploits.) This first step is also why DHCP does not cross a router unaided: a broadcast stops at the network boundary. We will get to that in the fourth lesson.',
  [['broadcast','a frame for everyone in the network; the switch floods it to every port of that VLAN.'],
   ['Discover','the client’s first message: “is there a DHCP server here?” – as a broadcast, with no address of its own.']]);}
function mountC23Discover(){d23Mount('d23d',[
  {glow:d23g('pc','--amber'),dyn:d23lbl(64,74,'no address, no gateway','--amber'),cap:'After power-on the client knows <b>nothing</b>: no address, no gateway, no idea who is in the network.'},
  {glow:d23g('pc','--amber')+d23g('sw','--amber'),dyn:d23pkt('M 64 110 L 196 110','--amber')+d23lbl(196,74,'0.0.0.0 → 255.255.255.255','--amber'),cap:'It sends a <b>Discover</b>: from <b>0.0.0.0</b> (I have no address) to <b>255.255.255.255</b> (to anyone). It attaches its <b>MAC</b> so the reply can find it.'},
  {glow:d23g('sw','--amber')+d23g('pc2','--amber')+d23g('evil','--amber')+d23g('rtr','--amber'),dyn:d23pkt('M 196 110 L 64 196','--amber')+d23lbl(196,251,'the switch floods every port','--amber'),cap:'The switch <b>floods the frame to every port</b> of that VLAN. Machines it does not concern hear it too – a property an attacker will later abuse.'},
  {glow:d23g('sw','--red')+d23g('rtr','--red'),dyn:d23lbl(330,74,'the router does not pass a broadcast ⚠','--red'),cap:'The router <b>does not pass the broadcast</b> – the search ends there. That is why remote networks need the help the fourth lesson is about.'}
]);}

/* ---------- L2M2 — Offer ---------- */
function renderC23Offer(){return d23P('d23e',
  'The Discover reaches the DHCP server, which speaks up for the first time with an <b>Offer</b>. This is not an assignment yet; it is “I have this address for you, do you want it?”. The server first picks a free address from its <b>range</b>, and before offering it, <b>sets it aside temporarily</b> so it does not offer the same one to somebody else meanwhile. Into the offer it packs the rest of the bundle from the second module: the mask, the gateway, DNS and how long the address is lent for. It replies to the client’s <b>MAC address</b>, because the client still has no IP. If the client does not answer with a Request within a short window, the server releases the set-aside address again – otherwise it would hold it forever for a machine that has since been switched off. The word <b>offer</b> is not accidental. A network may hold several servers and a client may receive several offers – the decision is the client’s. And this is exactly the property a rogue server exploits when it tries to be faster than the real one.',
  [['Offer','the server’s offer: a specific address plus mask, gateway, DNS and the lease time.'],
   ['range (pool)','the set of addresses the server lends from.']]);}
function mountC23Offer(){d23Mount('d23e',[
  {glow:d23g('srv','--blue'),dyn:d23lbl(520,74,'pick a free address from the range','--blue'),cap:'The server got the Discover and reaches into its <b>range</b> for a free address. It <b>sets the chosen one aside</b> so it will not offer it twice.'},
  {glow:d23g('srv','--blue')+d23g('rtr','--blue')+d23g('sw','--blue')+d23g('pc','--blue'),dyn:d23pkt('M 520 110 L 64 110','--blue')+d23lbl(330,74,'Offer: 192.168.1.50','--blue'),cap:'It sends the <b>Offer</b>. It replies to the client’s <b>MAC</b> – the client still has no IP address, so there would be no other way to address it.'},
  {glow:d23g('pc','--violet'),dyn:d23lbl(64,251,'in the offer: address, mask, gateway, DNS, time','--violet'),cap:'The offer is not just a number – it holds the <b>whole bundle</b> from the second module, including how long the address is lent for.'},
  {glow:d23g('evil','--red')+d23g('sw','--red')+d23g('pc','--red'),dyn:d23pkt('M 196 196 L 196 110 L 64 110','--red')+d23lbl(196,251,'a rogue server can offer too ⚠','--red'),cap:'It is an <b>offer</b>, not an order. Anyone can offer – including a rogue server trying to be first. The fifth lesson shows what follows from that.'}
]);}

/* ---------- L2M3 — Request and Acknowledge ---------- */
function renderC23RequestAck(){return d23P('d23f',
  'The client picks one of the offers – usually the one that arrived <b>first</b> – and answers with a <b>Request</b>. The odd part is that this also goes as a <b>broadcast</b>, even though the client now knows whom it is talking to. There is a good reason: this way the <b>other</b> DHCP servers learn of the decision too and can release their set-aside offers back into the range. If the Request went only to the chosen server, the others would hold addresses for nothing. The server then confirms with an <b>Acknowledge</b>, and only at that moment is the address truly <b>leased</b>: it is written into the lease table with a time and the client’s MAC address. The four messages together – Discover, Offer, Request, Acknowledge – are shortened by their initials to <b>DORA</b>. If you remember one thing, make it this: the first two messages are <b>asking and offering</b>, the second two are <b>choosing and confirming</b>.',
  [['DORA','Discover – Offer – Request – Acknowledge: the four messages by which a client obtains an address.'],
   ['lease table','the server’s list: which address is lent to which MAC and until when.']]);}
function mountC23RequestAck(){d23Mount('d23f',[
  {glow:d23g('pc','--amber')+d23g('sw','--amber'),dyn:d23pkt('M 64 110 L 196 110','--amber')+d23lbl(196,74,'Request – as a broadcast again','--amber'),cap:'The client picks an offer and sends a <b>Request</b>. As a broadcast again, even though it already knows whom it chose.'},
  {glow:d23g('sw','--amber')+d23g('evil','--amber')+d23g('srv','--amber')+d23g('rtr','--amber'),dyn:d23pkt('M 196 110 L 520 110','--amber')+d23lbl(330,251,'other servers: they can release the offer','--amber'),cap:'That is why it is a broadcast: the <b>other servers</b> learn they were not chosen and return their set-aside address to the range.'},
  {glow:d23g('srv','--green')+d23g('rtr','--green')+d23g('sw','--green')+d23g('pc','--green'),dyn:d23pkt('M 520 110 L 64 110','--green')+d23lbl(330,74,'Acknowledge – now the address is leased','--green'),cap:'The <b>Acknowledge</b> is the moment the address is genuinely <b>leased</b>. The server writes it into the table with a time and the MAC address.'},
  {glow:d23g('pc','--cyan')+d23g('srv','--cyan'),dyn:d23lbl(330,251,'D → O → R → A','--cyan'),cap:'Four messages = <b>DORA</b>. The first two are asking and offering, the second two choosing and confirming.'}
]);}

/* ---------- L2M4 — When two answer ---------- */
function renderC23TwoAnswer(){return d23P('d23g',
  'Let us pause on one sentence from the third module, because it matters more than it looks: the client usually picks the offer that arrived <b>first</b>. Not the best one, not the one from the right server – simply the fastest. DHCP has <b>no authentication</b> whatsoever. The client has no way to tell whether the answer came from the company server or from the laptop of somebody playing around in the network. It knows no password, checks no signature, holds no list of permitted servers. It trusts whoever was quicker. Two things follow. First: having two DHCP servers in one network <b>by accident</b> (say when somebody brings a home router and plugs it into a socket) disrupts the network in a way that is surprisingly hard to track down – some machines get addresses from somewhere other than the rest. Second: an attacker can do it <b>deliberately</b>, and because the offer also carries the gateway and DNS, they can write themselves in as the way out. The fifth lesson takes both apart.',
  [['no authentication','the client has no way to verify who answered – it trusts the first offer that arrives.']]);}
function mountC23TwoAnswer(){d23Mount('d23g',[
  {glow:d23g('pc','--amber')+d23g('sw','--amber'),dyn:d23pkt('M 64 110 L 196 110','--amber')+d23lbl(196,74,'Discover','--amber'),cap:'The client shouts a Discover. Nothing new so far – except that <b>everyone</b> in the network hears this broadcast.'},
  {glow:d23g('srv','--blue')+d23g('rtr','--blue')+d23g('sw','--blue')+d23g('pc','--blue'),dyn:d23pkt('M 520 110 L 64 110','--blue','1.8s')+d23lbl(330,74,'the real server: further away, the answer takes longer','--blue'),cap:'The real server is <b>further away</b> – across a router and a switch. Its offer is correct, but it takes longer to arrive.'},
  {glow:d23g('evil','--red')+d23g('sw','--red')+d23g('pc','--red'),dyn:d23pkt('M 196 196 L 196 110 L 64 110','--red','0.6s')+d23lbl(196,251,'the rogue is closer → it gets there first','--red'),cap:'The rogue is <b>closer</b>, so its offer arrives <b>sooner</b>. And the first offer wins.'},
  {glow:d23g('pc','--red')+d23g('evil','--red'),dyn:d23lbl(64,251,'the client cannot tell who is who','--red'),cap:'The client has <b>no</b> way to verify the sender. It trusts speed – and the offer also carries the gateway and DNS.'}
]);}

/* ---------- L3M1 — The range ---------- */
function renderC23Pool(){return d23P('d23h',
  'The <b>range</b> – also called a <i>pool</i> or a <i>scope</i>, you will meet all three words – is the main thing you configure on a DHCP server: from which address to which it may lend. It sounds like a trivial field, but it decides two things at once. <b>How many</b> devices the network can carry – a range from .100 to .150 feeds fifty clients, and the fifty-first is out of luck no matter how large the subnet is. And <b>what is left</b> for addresses that must not be lent: the router, servers, printers. That is why a range almost never spans the whole subnet. A typical design leaves the lower part manual (say .1 to .99 for infrastructure) and gives clients the upper part (.100 to .200). The rest stays as reserve. In the simulator you find the range in the network settings – separately for each network, because each subnet has its own addresses and its own boundaries. And beware: a range that is too <b>small</b> does not show up right away. It shows up on the day more people arrive than usual.',
  [['range (scope)','from which address to which DHCP may lend in a given network.']]);}
function mountC23Pool(){d23Mount('d23h',[
  {glow:d23g('srv','--blue'),dyn:d23lbl(520,74,'192.168.1.100 – .200','--blue'),cap:'The <b>range</b> says from where to where the server may lend. Here a hundred addresses for clients.'},
  {glow:d23g('rtr','--amber')+d23g('srv','--amber'),dyn:d23lbl(330,74,'.1 to .99 stays manual','--amber'),cap:'The lower part of the subnet stays <b>manual</b>: router, servers, printers. Those addresses must not be lent to anyone else.'},
  {glow:d23g('pc','--green')+d23g('pc2','--green')+d23g('sw','--green'),dyn:d23pkt('M 196 110 L 64 110','--green','0.8s')+d23lbl(196,251,'clients take from the upper part','--green'),cap:'Clients get addresses from the <b>upper</b> part. Infrastructure and clients then stay out of each other’s way.'},
  {glow:d23g('srv','--red')+d23g('pc2','--red'),dyn:d23lbl(520,251,'a small range = one day it simply runs out','--red'),cap:'A small range does not show today, but on the day more people arrive. Then the machines are not asking wrongly – there is simply <b>nothing left</b>.'}
]);}

/* ---------- L3M2 — What does not belong in a range ---------- */
function renderC23Exclude(){return d23P('d23i',
  'Three kinds of address do not belong in a range, each for a different reason. <b>1) Addresses somebody already holds manually.</b> The router, the DNS server, the printer, the cameras – everything you set fixed. If the server lent them out, you would get exactly the conflict from the first lesson, only this time caused by DHCP itself. <b>2) The network and broadcast addresses.</b> The first and last address of every subnet carry a special meaning – the first names the whole subnet, the last means “everyone in here at once” (the course <i>Splitting a network: subnets in practice</i> takes this apart) – and must not be assigned to a client – so the server skips them by itself. <b>3) Addresses you keep in reserve.</b> Next time you add a server, you will appreciate having somewhere to put it. The practical rule reads: <b>whatever has a fixed address should lie outside the range</b>. The alternative is a reservation, the subject of this lesson’s last module – it leaves the address inside the range but ties it to one specific device. Both are correct; the worse third option is a fixed address in the middle of the range that the DHCP server knows nothing about.',
  [['excluded address','an address inside the subnet that DHCP must not lend – typically it belongs to something with fixed settings.']]);}
function mountC23Exclude(){d23Mount('d23i',[
  {glow:d23g('rtr','--amber')+d23g('srv','--amber'),dyn:d23lbl(330,74,'router and servers: fixed, outside the range','--amber'),cap:'Whatever has a <b>fixed</b> address should lie <b>outside</b> the range. Otherwise the server will lend it to somebody else one day.'},
  {glow:d23g('srv','--blue'),dyn:d23lbl(520,74,'first and last address: skip them','--blue'),cap:'The network address and the broadcast address carry a special meaning. The server <b>skips them itself</b> and never assigns them to a client.'},
  {glow:d23g('pc','--red')+d23g('rtr','--red')+d23g('sw','--red'),dyn:d23pkt('M 64 110 L 330 110','--red')+d23lbl(196,251,'a fixed address inside the range = conflict ⚠','--red'),cap:'The worst case: a fixed address <b>in the middle</b> of the range that the server does not know about. One day it lends it and you have a conflict.'},
  {glow:d23g('srv','--green')+d23g('pc2','--green')+d23g('rtr','--green')+d23g('sw','--green'),dyn:d23pkt('M 520 110 L 330 110 L 196 110 L 64 196','--green')+d23lbl(330,251,'a clean range = no surprises','--green'),cap:'With a clean range DHCP does exactly what it should – and the address conflicts from the first lesson disappear entirely.'}
]);}

/* ---------- L3M3 — Lease ---------- */
function renderC23Lease(){return d23P('d23j',
  'An address is not given, it is <b>lent</b> – for a time called a <b>lease</b>. Along with the address the client receives the information on how long it holds; typically hours to days. Why on a timer at all? If addresses were lent permanently, the range would gradually fill with machines nobody has powered on for ages – a visitor who spent an hour here once would hold an address forever. The lease solves this by itself: whatever is not renewed falls back into the range. Meanwhile the client does not lose its address mid-work. At roughly <b>half</b> the time it quietly asks for an extension and the server usually grants it – which is why you never notice renewals. The lease length is a design decision: in an office with the same people every day a <b>long</b> one fits (less traffic, more stable addresses). At an airport or a café a <b>short</b> one instead, because people come and go quickly and addresses have to come back.',
  [['lease','the time an address is lent for; when it expires it falls back into the range.'],
   ['renewal','at roughly half the time the client asks for an extension so it does not lose the address.']]);}
function mountC23Lease(){d23Mount('d23j',[
  {glow:d23g('srv','--green')+d23g('rtr','--green')+d23g('sw','--green')+d23g('pc','--green'),dyn:d23pkt('M 520 110 L 64 110','--green')+d23lbl(330,74,'the address for 8 hours','--green'),cap:'With the address comes the <b>time</b> it holds for. It is not a gift, it is a loan.'},
  {glow:d23g('pc','--blue')+d23g('sw','--blue')+d23g('rtr','--blue')+d23g('srv','--blue'),dyn:d23pkt('M 64 110 L 520 110','--blue')+d23lbl(330,251,'at half the time: please extend','--blue'),cap:'At roughly <b>half</b> the time the client quietly asks for an extension. That is why you never lose the address mid-work.'},
  {glow:d23g('pc2','--amber')+d23g('srv','--amber'),dyn:d23lbl(64,251,'a powered-off machine does not renew → the address returns','--amber'),cap:'Whoever stays silent loses the address and it <b>falls back</b> into the range. That is how the pool cleans itself.'},
  {glow:d23g('srv','--violet'),dyn:d23lbl(520,251,'office: long · café: short','--violet'),cap:'You choose the length by the traffic: <b>long</b> where the same people stay, <b>short</b> where they come and go quickly.'}
]);}

/* ---------- L3M4 — Reservations ---------- */
function renderC23Reserve(){return d23P('d23k',
  'Sometimes you want both at once: for a device to get its address automatically from DHCP, but <b>always the same one</b>. Typically a printer, a camera, a NAS or a server that somebody refers to by a fixed address. The solution is a <b>reservation</b>: on the server you say “the device with this <b>MAC address</b> always gets this IP”. The client notices nothing – it asks for an address through DORA as usual and receives it as usual, only it is the same one every time. Why the MAC? Because it is the one thing the client holds <b>even before it has an address</b>, as you know from the Discover. Compared to manual configuration a reservation has one large advantage: <b>the settings stay in one place</b>. When you change the gateway or DNS, the printer gets it too – whereas a machine with a hand-set address would stay behind with the old one, and one day you would wonder why that particular machine is the one that fails.',
  [['reservation','a rule on the DHCP server: a specific MAC address always gets the same IP.'],
   ['MAC','the network card’s fixed address; the client always has it, even with no IP address.']]);}
function mountC23Reserve(){d23Mount('d23k',[
  {glow:d23g('pc2','--amber')+d23g('sw','--amber'),dyn:d23pkt('M 64 196 L 196 110','--amber')+d23lbl(196,251,'the printer: it needs the same address every time','--amber'),cap:'A printer behaves like any other client – except people and systems refer to it by a <b>fixed</b> address.'},
  {glow:d23g('srv','--blue'),dyn:d23lbl(520,74,'MAC AA:BB:CC → always .40','--blue'),cap:'On the server you create a <b>reservation</b>: this MAC address always gets this IP.'},
  {glow:d23g('srv','--green')+d23g('rtr','--green')+d23g('sw','--green')+d23g('pc2','--green'),dyn:d23pkt('M 520 110 L 330 110 L 196 110 L 64 196','--green')+d23lbl(330,74,'the client notices nothing – ordinary DORA','--green'),cap:'The client asks for the address entirely <b>normally</b> through DORA. It just happens to come out the same every time.'},
  {glow:d23g('srv','--violet')+d23g('pc','--violet')+d23g('pc2','--violet')+d23g('rtr','--violet')+d23g('sw','--violet'),dyn:d23pkt('M 520 110 L 64 110','--violet')+d23lbl(330,251,'a gateway change reaches the printer too','--violet'),cap:'The advantage over a manual address: the settings stay in <b>one</b> place, so a gateway or DNS change reaches here too.'}
]);}

/* ---------- L4M1 — A broadcast does not cross a router ---------- */
function renderC23NoCross(){return d23P('d23l',
  'Let us return to where the second lesson ended. The client looks for a server with a <b>broadcast</b> – and a broadcast stops at the network boundary, because the router does not pass it on. That is neither a bug nor an oversight; it is exactly why routers exist. If broadcasts crossed, the whole internet would be one giant network where everyone hears everyone. But it means a client in a branch office will <b>never</b> hear the DHCP server at headquarters. However powerful the server, however good the link – the Discover simply does not reach it. Three solutions offer themselves. <b>A DHCP server in every network</b> – it works, but it means managing ranges in ten places instead of one. <b>Manual addresses in the branch</b> – that is a step back into the first lesson. Or a <b>relay</b>: let somebody who is in both networks carry the message across. That is the next module’s subject.',
  [['network boundary','the router: it does not pass a broadcast on, but it does pass traffic with a specific destination.']]);}
function mountC23NoCross(){d23Mount('d23l',[
  {glow:d23g('far','--amber'),dyn:d23lbl(520,251,'the branch: a client with no address','--amber'),cap:'In the <b>branch</b> a machine with no address powers on. It behaves exactly as at headquarters: it shouts a Discover.'},
  {glow:d23g('far','--amber')+d23g('rtr','--amber'),dyn:d23pkt('M 520 196 L 330 110','--amber')+d23lbl(330,251,'Discover → ?','--amber'),cap:'The Discover reaches the <b>router</b>, which is in the branch network too. And there it ends.'},
  {glow:d23g('rtr','--red'),dyn:d23lbl(330,74,'the router does not pass the broadcast on','--red'),cap:'The router <b>does not forward</b> the broadcast – and rightly so. If it did, the internet would be one giant network.'},
  {glow:d23g('srv','--red')+d23g('far','--red'),dyn:d23lbl(520,74,'the server never learns of the client','--red'),cap:'The server at headquarters <b>never learns</b> of the client. No amount of performance or link speed helps – the message does not arrive.'}
]);}

/* ---------- L4M2 — Relay agent ---------- */
function renderC23Relay(){return d23P('d23m',
  'A <b>DHCP relay</b> (sometimes a <i>relay agent</i>) is a router function that solves this problem with a simple trick. The router <b>is</b> in the branch network – it hears the broadcast. With the relay switched on it does not drop it but <b>repackages</b> it: it turns it into an ordinary addressed packet sent straight to the DHCP server’s address, which you enter <b>manually</b> when you turn the relay on. And since it is no longer a broadcast, it crosses the whole network to headquarters without trouble. The trick has a second half, without which it would not work: the relay <b>adds which network the client came from</b>. That way the server knows which range to lend from – otherwise it would hold ten ranges and have no idea which to use. The answer then travels back the same way to the relay, which delivers it to the client. In the simulator you switch the relay on at the router and enter the server’s address; the branch client then gets an address exactly like the one at headquarters.',
  [['relay (agent)','a router function: it repackages a DHCP broadcast into an addressed packet for a server in another network.']]);}
function mountC23Relay(){d23Mount('d23m',[
  {glow:d23g('far','--amber')+d23g('rtr','--amber'),dyn:d23pkt('M 520 196 L 330 110','--amber')+d23lbl(520,251,'the broadcast reaches the router','--amber'),cap:'The client shouts as always and the router hears it – it <b>is</b> in the branch network after all.'},
  {glow:d23g('rtr','--blue'),dyn:d23lbl(330,74,'relay: I repackage it as an addressed packet','--blue'),cap:'With the <b>relay</b> on, the router does not drop it but <b>repackages</b> it into an ordinary packet aimed straight at the server.'},
  {glow:d23g('rtr','--blue')+d23g('srv','--blue'),dyn:d23pkt('M 330 110 L 520 110','--blue')+d23lbl(430,74,'and adds: this came from the branch','--blue'),cap:'It also <b>adds which network</b> the client came from – otherwise the server would not know which range to lend from.'},
  {glow:d23g('srv','--green')+d23g('rtr','--green')+d23g('far','--green'),dyn:d23pkt('M 520 110 L 330 110 L 520 196','--green')+d23lbl(430,251,'the answer back through the relay to the client','--green'),cap:'The answer returns <b>the same way</b> and the relay delivers it to the client, which knows nothing of the trick.'}
]);}

/* ---------- L4M3 — One server for several networks ---------- */
function renderC23Central(){return d23P('d23n',
  'A relay pays off for what it enables: <b>one DHCP server for the whole company</b>. In one place you keep ranges for every network, one view of the leases, one place where you change the DNS server or the gateway. If instead you had DHCP in each network separately, you face ten places to manage and with them ten opportunities for something to drift apart. There is another side to it. When the central server <b>fails</b>, <b>nobody</b> gets an address – whereas with a server in each network the outage would hit only one. So a design usually does not stake everything on one card: either DHCP is doubled (two servers, each lending from a different half of the range), or at least its availability is watched. It is the same reasoning as for DNS in the course <i>DNS and names in the network</i> and the same as for resilience in general: centralizing saves work but concentrates the risk into one point. Nothing is free, you only choose which outcome is worse for your network.',
  [['central DHCP','one server serves several networks through relays – one place to manage, but also one point of failure.']]);}
function mountC23Central(){d23Mount('d23n',[
  {glow:d23g('srv','--blue')+d23g('rtr','--blue')+d23g('sw','--blue')+d23g('pc','--blue'),dyn:d23pkt('M 520 110 L 64 110','--blue')+d23lbl(330,74,'the range for headquarters','--blue'),cap:'The server holds the range for <b>headquarters</b> and serves it directly, unaided.'},
  {glow:d23g('srv','--violet')+d23g('rtr','--violet')+d23g('far','--violet'),dyn:d23pkt('M 520 110 L 330 110 L 520 196','--violet')+d23lbl(430,251,'and through the relay the branch range too','--violet'),cap:'And through the relay it holds the <b>branch</b> range too. One place, one overview, one DNS change for everyone.'},
  {glow:d23g('srv','--red'),dyn:d23lbl(520,74,'the server fails → nobody gets one ⚠','--red'),cap:'But when this server <b>fails</b>, <b>nobody</b> gets an address – neither headquarters nor the branch.'},
  {glow:d23g('srv','--green')+d23g('rtr','--green'),dyn:d23lbl(330,251,'that is why DHCP gets doubled','--green'),cap:'That is why DHCP gets <b>doubled</b>: two servers, each lending from a different half of the range. The same reasoning as for DNS.'}
]);}

/* ---------- L5M1 — A rogue DHCP server ---------- */
function renderC23Rogue(){return d23P('d23o',
  'The second lesson leads to an unpleasant conclusion: the client trusts the <b>first</b> offer and has no way to verify who sent it. So it suffices to get your own DHCP server into the network, be closer than the real one – and clients will take your settings themselves. Most often this is not an attack. Somebody brings a <b>home router</b>, plugs it into a socket to get more ports, and does not notice that the box hands out addresses too. The result looks like a mystery: for some machines the network works, for others it does not, and it depends on which server happened to be faster. The deliberate variant is nastier. The offer also carries the <b>gateway</b> and <b>DNS</b> – so an attacker needs to break nothing, it is enough to write themselves in as the way out. From that moment <b>all the victims’ traffic flows</b> through their machine, and they can read or change it. It is one of the cheapest routes into the middle of somebody else’s communication, and it needs no vulnerability at all – just a socket.',
  [['rogue DHCP','an unapproved DHCP server in the network; clients take an address, gateway and DNS from it.'],
   ['man in the middle','an attacker whose machine the victim’s traffic flows through, because they wrote themselves in as the gateway.']]);}
function mountC23Rogue(){d23Mount('d23o',[
  {glow:d23g('evil','--red')+d23g('sw','--red'),dyn:d23lbl(196,251,'somebody plugged in their own box','--red'),cap:'A <b>rogue DHCP</b> appears in the network. Usually not by attack – a home router plugged in “for the ports” is enough.'},
  {glow:d23g('pc','--amber')+d23g('sw','--amber')+d23g('evil','--amber')+d23g('rtr','--amber'),dyn:d23pkt('M 64 110 L 196 110 L 196 196','--amber')+d23lbl(196,74,'both hear the Discover','--amber'),cap:'The Discover is a broadcast, so <b>both</b> servers hear it. Both may offer.'},
  {glow:d23g('evil','--red')+d23g('sw','--red')+d23g('pc','--red'),dyn:d23pkt('M 196 196 L 196 110 L 64 110','--red','0.6s')+d23lbl(64,251,'the closer offer wins','--red'),cap:'The closer server is <b>faster</b> and the client takes the first offer. Distance wins, not authorization.'},
  {glow:d23g('pc','--red')+d23g('evil','--red')+d23g('sw','--red'),dyn:d23pkt('M 64 110 L 196 110 L 196 196','--red')+d23lbl(330,251,'gateway = attacker → sees all the traffic','--red'),cap:'The offer also carried the <b>gateway</b>. From now on the victim’s traffic flows <b>through the attacker</b>, who can read it.'}
]);}

/* ---------- L5M2 — Starvation ---------- */
function renderC23Starvation(){return d23P('d23p',
  'The second attack goes at it the other way round: it does not try to answer, it tries to <b>exhaust</b>. The attacker sends Discover after Discover, each with a <b>different made-up MAC address</b>, and the server honestly answers each with an offer and sets that address aside. Before long the whole range is parceled out among machines that do not exist at all. This is called <b>DHCP starvation</b>. To users it looks innocent: a new device simply <b>does not connect</b>, while the others carry on because they already have addresses. That is why it gets blamed on a cable or on Wi-Fi so easily. You recognize it by the server reporting a <b>full range</b> while that many devices are not physically present. The sequel is nasty too: once the range runs dry the attacker can step in with their <b>own</b> server from the previous module – and since the real one has nothing left to offer, there is nobody to compete with. Two attacks that merely annoy on their own take over the network together.',
  [['starvation','the attacker drains the range with offers to made-up MAC addresses; new clients then get nothing.']]);}
function mountC23Starvation(){d23Mount('d23p',[
  {glow:d23g('evil','--red')+d23g('sw','--red'),dyn:d23pkt('M 196 196 L 196 125','--red','0.5s')+d23lbl(196,251,'Discover with a made-up MAC, again and again','--red'),cap:'The attacker sends Discover after Discover, each with a <b>different made-up MAC</b> address.'},
  {glow:d23g('sw','--amber')+d23g('rtr','--amber')+d23g('srv','--amber'),dyn:d23pkt('M 196 110 L 520 110','--amber','0.5s')+d23lbl(430,74,'the server honestly answers every one','--amber'),cap:'The server has no reason to doubt – it answers <b>every</b> Discover with an offer and sets that address aside.'},
  {glow:d23g('srv','--red'),dyn:d23lbl(520,74,'range full: nothing but machines that do not exist','--red'),cap:'Before long the <b>range is full</b> – parceled out among machines that are not in the network at all.'},
  {glow:d23g('pc2','--red')+d23g('sw','--red')+d23g('srv','--red')+d23g('rtr','--red'),dyn:d23pkt('M 64 196 L 196 110 L 330 110 L 520 110','--red')+d23lbl(64,251,'a new machine: it gets no address','--red'),cap:'A new device <b>does not connect</b> while the others carry on. That is why it gets blamed on a cable – and why it takes so long to find.'}
]);}

/* ---------- L5M3 — Defense ---------- */
function renderC23Snooping(){return d23P('d23q',
  'Both share one cause: the switch does not distinguish <b>which port</b> something arrived on, and treats everything alike. So the defense sits exactly there – on the switch, and you know it from the course <i>The switch in depth</i>. <b>DHCP snooping</b> splits ports into <b>trusted</b> and <b>untrusted</b>. Trusted is the one that genuinely has a DHCP server behind it, or the path to one; all the others are untrusted and the switch <b>simply discards offers</b> from them. The rogue server can offer whatever it likes – it reaches no client. Against range exhaustion, <b>port security</b> from the same course helps: it limits how many different MAC addresses may live behind one port. An attacker wanting to cycle through hundreds hits the wall at the first few. That leaves the operational half: <b>paying attention</b>. A range filling faster than usual, or a device that got its gateway from somewhere other than the rest – those are exactly the traces that logs are collected for (the course <i>Monitoring, logging and detection</i>).',
  [['DHCP snooping','the switch splits ports into trusted and untrusted and discards DHCP offers arriving on untrusted ones.'],
   ['port security','a limit on how many MAC addresses may sit behind one port; it slows range exhaustion.']]);}
function mountC23Snooping(){d23Mount('d23q',[
  {glow:d23g('sw','--blue')+d23g('rtr','--blue'),dyn:d23lbl(196,74,'port toward the server: trusted','--blue'),cap:'<b>DHCP snooping</b> marks the port that genuinely has a server behind it (or the path to one) as <b>trusted</b>.'},
  {glow:d23g('evil','--red')+d23g('sw','--green'),dyn:d23pkt('M 196 196 L 196 130','--red','0.7s')+d23lbl(196,251,'an offer from an untrusted port → discarded','--green'),cap:'From <b>untrusted</b> ports the switch <b>discards</b> offers. The rogue may offer; it reaches no client.'},
  {glow:d23g('sw','--amber')+d23g('evil','--amber'),dyn:d23lbl(196,74,'port security: how many MACs may sit behind a port','--amber'),cap:'Against range exhaustion <b>port security</b> helps: it limits MAC addresses behind a port, so hundreds of made-up ones do not pass.'},
  {glow:d23g('srv','--violet')+d23g('rtr','--violet')+d23g('sw','--violet')+d23g('pc','--violet'),dyn:d23pkt('M 520 110 L 64 110','--violet')+d23lbl(330,251,'and pay attention: the range, gateways, logs','--violet'),cap:'And the operational half: <b>pay attention</b>. A fast-filling range or a machine with a foreign gateway are exactly the traces from the course <i>Monitoring, logging and detection</i>.'}
]);}

const COURSE_23_DEF = {
  id:'course23',
title:'DHCP: how a device gets an address',
  blurb:'Addresses are not handed out by hand: the four DORA messages, the whole settings bundle (address, mask, gateway, DNS), the range and the lease time, reservations by MAC, relays into remote networks – and finally the rogue server, the drained range and the defense on the switch.',
  lessons:[
    { id:'c23l1', title:'Why addresses are not handed out by hand', taskId:null, quizId:'c23q_l1', modules:[
      { id:'c23l1m1', title:'Manual addresses and their limits', render:renderC23Manual, mount:mountC23Manual },
      { id:'c23l1m2', title:'What a client actually needs', render:renderC23Needs, mount:mountC23Needs },
      { id:'c23l1m3', title:'Where the DHCP server lives', render:renderC23Where, mount:mountC23Where }
    ]},
    { id:'c23l2', title:'DORA: the four messages', taskId:null, quizId:'c23q_l2', modules:[
      { id:'c23l2m1', title:'Discover: a shout into the dark', render:renderC23Discover, mount:mountC23Discover },
      { id:'c23l2m2', title:'Offer: an offer, not an order', render:renderC23Offer, mount:mountC23Offer },
      { id:'c23l2m3', title:'Request and Acknowledge', render:renderC23RequestAck, mount:mountC23RequestAck },
      { id:'c23l2m4', title:'When two answer', render:renderC23TwoAnswer, mount:mountC23TwoAnswer }
    ]},
    { id:'c23l3', title:'Range, lease and reservations', taskId:'ch-dhcppool', quizId:'c23q_l3', modules:[
      { id:'c23l3m1', title:'The range: from where to where', render:renderC23Pool, mount:mountC23Pool },
      { id:'c23l3m2', title:'What does not belong in a range', render:renderC23Exclude, mount:mountC23Exclude },
      { id:'c23l3m3', title:'The lease: lent for a time', render:renderC23Lease, mount:mountC23Lease },
      { id:'c23l3m4', title:'Reservations by MAC', render:renderC23Reserve, mount:mountC23Reserve }
    ]},
    { id:'c23l4', title:'When the server is elsewhere: the relay', taskId:'ch-dhcp', quizId:'c23q_l4', modules:[
      { id:'c23l4m1', title:'A broadcast does not cross a router', render:renderC23NoCross, mount:mountC23NoCross },
      { id:'c23l4m2', title:'The relay: repackage and forward', render:renderC23Relay, mount:mountC23Relay },
      { id:'c23l4m3', title:'One server for several networks', render:renderC23Central, mount:mountC23Central }
    ]},
    { id:'c23l5', title:'When DHCP misbehaves', taskId:'dhcp-starvation', quizId:'c23q_l5', modules:[
      { id:'c23l5m1', title:'A rogue DHCP server', render:renderC23Rogue, mount:mountC23Rogue },
      { id:'c23l5m2', title:'Starvation: a drained range', render:renderC23Starvation, mount:mountC23Starvation },
      { id:'c23l5m3', title:'Defense: snooping and port security', render:renderC23Snooping, mount:mountC23Snooping }
    ]}
  ]
};

const COURSE_23_QUIZZES_DEF = {
  c23q_l1:{ title:'Quiz: Why addresses are not handed out by hand', qs:[
    { q:'Why do manual addresses become a problem as soon as a network grows a little?',
      opts:['because a manually set address always erases itself after a reboot and has to be entered again','because nobody keeps a reliable register, so sooner or later two machines get the same number','because manual addresses are technically slower than assigned ones and connections take longer to set up'],
      correct:1, why:'A register in somebody’s head or in a table stops matching reality the moment somebody brings a laptop. An address conflict then breaks not one machine but both.' },
    { q:'Which four pieces of information does a client need to actually work in a network?',
      opts:['the address, the mask, the default gateway and a DNS server – only together do they make a working connection','the address, the computer name, a network password and the workgroup name it should join','the address, the network card speed, the protocol version and the port number it will listen on'],
      correct:0, why:'Without a gateway you reach your own network but no further. Without DNS addresses work but names do not – and the user reports it as “the internet is down”.' },
    { q:'Where in a network can the DHCP server role run?',
      opts:['solely on a standalone server dedicated to this purpose; the protocol allows nothing else','on a router, a firewall, an L3 switch or an ordinary server – it is a role, not a special kind of device','only on the element that is also the network’s default gateway; elsewhere the answers would not arrive'],
      correct:1, why:'At home the ISP router holds the role, in a smaller company the router or firewall, in a larger one a server or L3 switch. What matters is that one element holds it per network.' },
    { q:'Why is it worth changing the DNS server through DHCP rather than by hand on every machine?',
      opts:['because a hand-entered DNS server stops being valid after a few days and the client finds it out anyway','because the settings stay in one place and spread on their own, instead of you walking around every device','because a DNS server handed out by DHCP answers noticeably faster than the same one entered by hand'],
      correct:1, why:'That is DHCP’s less visible half: it lends not just an address but a whole settings bundle. A change in one place spreads to everyone.' }
  ]},
  c23q_l2:{ title:'Quiz: DORA', qs:[
    { q:'Why does the client send its first message as a broadcast?',
      opts:['because a broadcast spreads faster than an ordinary addressed packet, so the answer comes sooner','because it has no address yet and no idea where to look for a DHCP server – it has nobody to address','because a broadcast is the only thing that crosses a router, so it reaches a server in a remote network'],
      correct:1, why:'The sender is 0.0.0.0 and the destination 255.255.255.255, meaning “anyone who hears this”. The client attaches its MAC so it can be answered.' },
    { q:'Why does the third message (Request) also go as a broadcast when the client already knows whom it chose?',
      opts:['so the other servers learn of the choice too and can return their set-aside addresses to the range','because the client still has no address of its own, so it could not technically send an addressed packet','so the switch stores the message and can later decide from it which port is trusted'],
      correct:0, why:'If the Request went only to the chosen server, the others would hold their offered addresses far too long. This way they release them at once.' },
    { q:'At which moment is the address genuinely leased?',
      opts:['already when the server sends the offer, since that removes the address from the range','only at the Acknowledge, when the lease is written into the table with a time and a MAC address','when the client first successfully uses the gateway and sends data outside its own network'],
      correct:1, why:'The offer is only “I have this address for you” and the server merely sets it aside. The commitment arises at the confirmation.' },
    { q:'How does a client choose when it receives offers from two servers?',
      opts:['it compares both offers and takes the one with the longer lease, as that suits it better','it verifies both servers’ signatures and accepts only the offer from an approved source','it usually takes the one that arrived first – DHCP cannot verify the sender at all'],
      correct:2, why:'This is the core of both attacks in the fifth lesson. The client knows no password or signature and holds no list of permitted servers – it trusts speed.' }
  ]},
  c23q_l3:{ title:'Quiz: Range, lease and reservations', qs:[
    { q:'Why does a range usually not span the whole subnet?',
      opts:['because a server can manage only a limited number of addresses and could not handle a bigger range','because some addresses belong to elements with fixed settings and lending them again would cause a conflict','because a subnet must always be split into two halves, or routing between them would not work'],
      correct:1, why:'The router, servers and printers hold fixed addresses. A typical design leaves the lower part manual and gives clients the upper one.' },
    { q:'What happens when an address is leased and the client then stays silent for a long time?',
      opts:['the lease expires and the address falls back into the range, from where it can go to somebody else','the address stays with the client forever, since the server never releases a number once assigned','the server takes the address away instantly and gives it to the next asker the moment the client stops replying'],
      correct:0, why:'That is exactly why addresses are lent on a timer: the range cleans itself of machines nobody has powered on for ages.' },
    { q:'What is a reservation on a DHCP server for?',
      opts:['it blocks an address so nobody gets it at all and it stays free for later manual use','it ensures the device with a given MAC address gets the same IP through DHCP every time','it extends a chosen device’s lease indefinitely, so it never has to be renewed again'],
      correct:1, why:'The client notices nothing – it goes through DORA as usual, only the same address comes out every time. And the settings stay in one place.' },
    { q:'Where is a short lease time useful in practice?',
      opts:['in an office where the same people sit every day and addresses barely change','where people come and go quickly, such as a café or an airport, so addresses come back','in a network with a single server, since a shorter lease lowers the load and the server lasts longer'],
      correct:1, why:'The length is a design decision. Long means less traffic and more stable addresses, short means addresses return to the range sooner.' }
  ]},
  c23q_l4:{ title:'Quiz: The relay', qs:[
    { q:'Why can a client in a remote network not reach the headquarters DHCP server on its own?',
      opts:['because it searches with a broadcast, and that stops at the router, which does not forward it','because the remote network has its own numbering and the server could not lend from it anyway','because the server’s answer would exceed the allowed hop count on the way and the router would drop it'],
      correct:0, why:'And rightly so: if broadcasts crossed routers, the internet would be one giant network where everyone hears everyone.' },
    { q:'What does a router with DHCP relay switched on do?',
      opts:['it starts lending addresses from its own range, so the headquarters server is no longer needed','it repackages the broadcast into an addressed packet for the server and adds which network the client came from','it stores the broadcast in memory and forwards it once the server actively asks for it'],
      correct:1, why:'Both halves are necessary. Without repackaging the message does not get out; without the network information the server would not know which range to lend from.' },
    { q:'What is the drawback of one central DHCP server for a whole company?',
      opts:['it cannot serve more than one network at a time, so branches must always have their own server','it concentrates the risk into one point: when it fails, nobody gets a new address at all','it requires every network in the company to use the same address range and the same subnet mask'],
      correct:1, why:'The same reasoning as for DNS: centralizing saves work but concentrates risk. That is why DHCP is usually doubled.' },
    { q:'Why does the server need to know which network the client came from?',
      opts:['so it can verify the client belongs to the company and refuse requests from foreign networks','so it knows which of its ranges to lend from – otherwise it would have no idea which to use','so it can send the answer straight to the client instead of returning it through the relay agent'],
      correct:1, why:'A central server holds ranges for several networks at once. Without the relay’s information it could not tell whether it is lending to headquarters or to a branch.' }
  ]},
  c23q_l5:{ title:'Quiz: When DHCP misbehaves', qs:[
    { q:'Why is a rogue DHCP server in a network so dangerous?',
      opts:['because it can read passwords stored in the clients’ systems once they accept an address from it','because the offer also carries the gateway and DNS, so the attacker writes themselves in as the way out and sees all the traffic','because it overloads the switch with answers and the network noticeably slows down for everyone'],
      correct:1, why:'It needs no vulnerability – just a socket and being closer than the real server. Most often, though, it is not an attack but a home router.' },
    { q:'How does DHCP starvation show from the outside?',
      opts:['every machine in the network loses connectivity at once and the switch must be restarted to restore it','new devices do not connect, while those that already hold an address carry on without trouble','traffic becomes noticeably slow, because the server answers queries with a long delay'],
      correct:1, why:'That is why it gets blamed on a cable or Wi-Fi so easily. The telltale sign is a full range while that many devices are not physically present.' },
    { q:'What does DHCP snooping do on a switch?',
      opts:['it encrypts DHCP messages, so an attacker on the cable cannot read them even if they capture them','it splits ports into trusted and untrusted and discards DHCP offers arriving on untrusted ones','it limits how often one client may ask for an address, so it cannot drain the range by repeating'],
      correct:1, why:'A trusted port is one that genuinely has a server or the path to one behind it. The rogue may then offer; it reaches no client.' },
    { q:'Why do both attacks from this lesson often appear together?',
      opts:['because the same tool launches them and neither would technically work without the other','because a drained range sidelines the real server, so the rogue offer then has nothing to compete with','because the defense against one of them always inadvertently opens the way for the other'],
      correct:1, why:'Two attacks that merely annoy on their own take over the network together. So the defense is twofold too: snooping and port security.' }
  ]}
};

const COURSE_23_FINAL_EXTRA_DEF=[
  { q:'Users at a branch report that new devices get no address while the old ones work. Where do you start?',
    opts:['you replace the branch switch, since the old devices evidently use a different, working port','you look at the range: the working machines already hold an address, so a drained or small pool is indicated','you set an address by hand on every new device, which reliably works around the problem'],
    correct:1, why:'The “old ones work, new ones do not” split is the typical fingerprint of an exhausted range – whether from a small pool or from starvation. A manual address hides the problem, it does not solve it.' },
    { q:'Some machines in one network route traffic differently from the rest and hold a different gateway. What does that resemble?',
    opts:['a normal state, since the gateway is assigned to each client at random by router load','a second DHCP server in the network: clients take the first offer, so it depends which was faster','a DNS server outage, because of which the clients computed the gateway themselves from the subnet mask'],
    correct:1, why:'A network split by who was faster is the classic fingerprint of a rogue DHCP – whether malicious or a home router in a socket.' }
];

__regCourse(23,COURSE_23_DEF,COURSE_23_QUIZZES_DEF,COURSE_23_FINAL_EXTRA_DEF);
