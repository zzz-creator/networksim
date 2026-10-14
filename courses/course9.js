/* course9.js — content of Course 9 (split out of course.js; loaded on demand via course-core.js) */
/* ============================================================
   COURSE 9 — The switch in depth (L2 internal mechanics + security). Shared scene c9Net (managed switch + 4 hosts).
   ============================================================ */
var C9R={sw:[300,92],a:[120,58],b:[120,142],c:[480,58],srv:[480,142]};
function c9Net(pfx){
  return '<svg id="'+pfx+'svg" viewBox="0 0 600 200" width="100%" style="display:block">'
    +'<line x1="284" y1="84" x2="138" y2="64" style="stroke:var(--line2);stroke-width:1.6"/>'
    +'<line x1="284" y1="100" x2="138" y2="136" style="stroke:var(--line2);stroke-width:1.6"/>'
    +'<line x1="316" y1="84" x2="462" y2="64" style="stroke:var(--line2);stroke-width:1.6"/>'
    +'<line x1="316" y1="100" x2="462" y2="136" style="stroke:var(--line2);stroke-width:1.6"/>'
    +'<g id="'+pfx+'glow"></g>'
    +csDev(300,92,'l2mgmt','SW')
    +csHost(120,58,'desktop','--blue','PC-A')+csHost(120,142,'desktop','--cyan','PC-B')+csDev(480,58,'l2mgmt','SW2')+csHost(480,142,'server','--green','SRV')
    +'<g id="'+pfx+'dyn"></g></svg>';
}
function c9P(pfx,intro,terms){
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+intro+'</p>'
    +'<div class="osi-stage">'+c9Net(pfx)+'</div><div class="m1-cap" id="'+pfx+'cap"></div>'
    +courseStepControls(pfx)+abbrBox(terms);
}
function c9Mount(pfx,STEPS){
  function show(i){var g=$(pfx+'glow');if(g)g.innerHTML=STEPS[i].glow||'';var d=$(pfx+'dyn');if(d)d.innerHTML=STEPS[i].dyn||'';var c=$(pfx+'cap');if(c)c.innerHTML='<span>'+STEPS[i].cap+'</span>';}
  courseStepper(pfx,STEPS.length,show);
}
function c9g(name,color){var p=C9R[name];return csGlow(p[0],p[1],color,20);}
function c9all(color){return c9g('sw',color)+c9g('a',color)+c9g('b',color)+c9g('c',color)+c9g('srv',color);}
function c9lbl(x,y,tx,c){return '<text x="'+x+'" y="'+y+'" text-anchor="middle" style="font:700 7.5px var(--mono);fill:var('+c+')">'+esc(tx)+'</text>';}
function c9pkt(p1,p2,color,dur){return '<rect x="-6" y="-4" width="12" height="9" rx="2" style="fill:var('+color+')"><animateMotion path="M '+p1+' L '+p2+'" dur="'+(dur||'1.3s')+'" repeatCount="indefinite"/></rect>';}
// MAC table as a mini listing
function c9mac(rows){var o='<g transform="translate(248,150)"><rect x="0" y="0" width="104" height="'+(11+rows.length*10)+'" rx="3" style="fill:var(--panel2);stroke:var(--line2);stroke-width:1"/><text x="6" y="8" style="font:700 6.5px var(--mono);fill:var(--muted)">MAC → port</text>';rows.forEach(function(r,i){o+='<text x="6" y="'+(18+i*10)+'" style="font:6.5px var(--mono);fill:var('+(r[2]||'--txt')+')">'+esc(r[0])+' → '+esc(r[1])+'</text>';});return o+'</g>';}
// L1M1 — MAC learning
function renderC9MacLearn(){return c9P('c9a',
  'A visitor in the meeting room plugs their laptop into a wall socket – and within minutes they can sniff other people’s traffic, or the whole company network is down. How that is possible and how to prevent it is what this entire course is about. And it starts with how a switch really works inside. How does a switch know where to send a frame? <b>It learns by itself.</b> For each incoming frame it reads the <b>source MAC address</b> and remembers <b>which port</b> it saw it on – into the <b>MAC table</b> (CAM). Next time it has something to deliver for that MAC, it sends it <b>only to that one port</b>, not everywhere. A switch never reads IP (that’s the router’s job) – it works purely with <b>MAC addresses at Layer 2</b>. This table is the heart of the switch.',
  [['MAC table (CAM)','a "MAC address → port" map the switch builds itself from incoming frames.'],['source MAC','the frame’s sender; the switch LEARNS from it (who is on which port).']]);}
function mountC9MacLearn(){c9Mount('c9a',[
  {glow:c9g('a','--cyan')+c9g('sw','--cyan'),dyn:c9pkt('138 64','284 84','--cyan')+c9mac([]),cap:'PC-A sends a frame. The switch reads its <b>source MAC</b> and the port it arrived on.'},
  {glow:c9g('sw','--green'),dyn:c9mac([['AA:..:A1','P1','--green']]),cap:'It writes to the <b>MAC table</b>: "AA:..:A1 is on port P1". It learned where PC-A is.'},
  {glow:c9g('sw','--green')+c9g('a','--green'),dyn:c9mac([['AA:..:A1','P1','--green'],['DD:..:S','P4','--green']])+c9pkt('284 84','138 64','--green'),cap:'When it has something for AA:..:A1, it sends it <b>only to P1</b> – not to all ports. The table saves the network.'}
]);}
// L1M2 — flooding unknown unicast
function renderC9Flood(){return c9P('c9b',
  'What if the switch <b>doesn’t yet know</b> the destination MAC (not in the table)? It doesn’t drop the frame – it does <b>flooding</b>: sends it out <b>all ports except the one it came in on</b> (unknown unicast flooding). The right recipient replies, the switch <b>learns</b> its port from that reply, and next time sends it directly. A <b>broadcast</b> (destination "everyone") is handled the same – it’s always sent everywhere within the VLAN. Flooding is normal and brief; trouble only arises when the table <b>breaks</b> (next lesson).',
  [['unknown unicast flooding','when a switch doesn’t know the destination MAC, it floods the frame to all ports (except the ingress).'],['broadcast','a frame for "everyone"; the switch always floods it everywhere within the VLAN.']]);}
function mountC9Flood(){var fl='<rect x="-5" y="-4" width="10" height="8" rx="2" style="fill:var(--amber)"><animateMotion path="M 284 84 L 138 64" dur="1s" repeatCount="indefinite"/></rect><rect x="-5" y="-4" width="10" height="8" rx="2" style="fill:var(--amber)"><animateMotion path="M 284 100 L 138 136" dur="1s" repeatCount="indefinite"/></rect><rect x="-5" y="-4" width="10" height="8" rx="2" style="fill:var(--amber)"><animateMotion path="M 316 84 L 462 64" dur="1s" repeatCount="indefinite"/></rect>';c9Mount('c9b',[
  {glow:c9g('srv','--cyan')+c9g('sw','--cyan'),dyn:c9pkt('462 136','316 100','--cyan')+c9lbl(300,64,'dest PC-B? unknown','--amber'),cap:'SRV wants to send to PC-B, but the switch <b>doesn’t know</b> PC-B’s MAC (not in the table).'},
  {glow:c9all('--amber'),dyn:fl,cap:'The switch <b>floods</b> the frame out <b>all other ports</b>. It reaches everyone, but only PC-B replies.'},
  {glow:c9g('b','--green')+c9g('sw','--green'),dyn:c9mac([['BB:..:B','P2','--green']]),cap:'From PC-B’s reply the switch <b>learns</b> its port. Next time no flood – it sends directly.'}
]);}
// L1M3 — aging + overflow
function renderC9Aging(){return c9P('c9c',
  'The MAC table is neither infinite nor permanent. Each entry has an <b>aging timer</b>, typically around <b>5 minutes</b>: if a given MAC goes quiet for a while, the switch <b>evicts</b> it (the device may have moved or powered off). The table also has a <b>limited size</b> (CAM capacity). When it fills up, the switch has nowhere to learn new MACs and starts <b>flooding</b> – which is exactly what the attack in lesson 3 abuses (CAM overflow). So aging and capacity aren’t just technical detail, they’re a <b>security</b> topic too.',
  [['aging timer','an entry’s timer in the MAC table; after inactivity the MAC is removed (typically ~5 min).'],['CAM capacity','the limited number of entries; once full the switch can’t learn and starts flooding.']]);}
function mountC9Aging(){c9Mount('c9c',[
  {glow:c9g('sw','--green'),dyn:c9mac([['AA:..:A1','P1','--green'],['BB:..:B','P2','--muted']]),cap:'The table is full of active entries. But PC-B has <b>gone quiet for a while</b>…'},
  {glow:c9g('b','--muted')+c9g('sw','--amber'),dyn:c9mac([['AA:..:A1','P1','--green']]),cap:'…so after the <b>aging timer</b> the switch <b>evicts</b> its entry. The table keeps only what’s active.'},
  {glow:c9g('sw','--red'),dyn:c9lbl(300,64,'table full → flood everything','--red'),cap:'And beware: if the table <b>fills up entirely</b>, the switch starts <b>flooding everything</b>. That is exactly what the attack we will show <b>in lesson 3</b> (CAM overflow) abuses.'}
]);}
// L2M1 — Ethernet frame
function renderC9Frame(){return c9P('c9d',
  'Let’s go inside the <b>frame</b> – the Layer-2 unit. The important fields are two addresses: the <b>destination MAC</b> (to whom) and the <b>source MAC</b> (from whom), then type/length and the <b>data</b> itself, and at the end a checksum (FCS). The switch decides <b>only by these MAC addresses</b> – it doesn’t care about the IP inside. It uses the source MAC to <b>learn</b> and the destination MAC to <b>deliver</b>. This is the whole "language" the switch speaks.',
  [['frame','the Layer-2 unit: destination MAC | source MAC | type | data | FCS.'],['FCS','Frame Check Sequence – a checksum at the end of the frame; detects corruption.']]);}
function mountC9Frame(){var fr=function(hi){var cells=[['dst MAC','--cyan'],['src MAC','--amber'],['type','--muted'],['data','--muted'],['FCS','--muted']];var o='<g transform="translate(150,150)">';var x=0;var w=[64,64,40,90,40];cells.forEach(function(c,i){var on=hi===i;o+='<rect x="'+x+'" y="0" width="'+w[i]+'" height="22" style="fill:'+(on?'var('+c[1]+')':'var(--panel2)')+';fill-opacity:'+(on?'.25':'1')+';stroke:var('+(on?c[1]:'--line2')+');stroke-width:'+(on?'1.6':'1')+'"/><text x="'+(x+w[i]/2)+'" y="14" text-anchor="middle" style="font:700 7px var(--mono);fill:var('+(on?c[1]:'--muted')+')">'+esc(c[0])+'</text>';x+=w[i];});return o+'</g>';};c9Mount('c9d',[
  {glow:c9g('sw','--cyan'),dyn:fr(0),cap:'The <b>destination MAC</b> = who the frame is for. By it the switch decides which port to deliver to.'},
  {glow:c9g('sw','--amber'),dyn:fr(1),cap:'The <b>source MAC</b> = from whom. By it the switch <b>learns</b> (records it for the ingress port).'},
  {glow:c9g('sw','--muted'),dyn:fr(3),cap:'Inside is the <b>data</b> (with the IP packet) and at the end the <b>FCS</b>. But the switch <b>doesn’t read</b> the IP – it goes purely by MAC. That’s L2.'}
]);}
// L2M2 — 802.1Q tag
function renderC9Dot1q(){return c9P('c9e',
  'When one link (a trunk) must carry <b>several VLANs</b> (what a VLAN is, you know from the Switching and VLANs course), how does the switch know which VLAN a frame belongs to? It inserts an <b>802.1Q tag</b> into the frame – a short <b>4-byte field</b> right after the source MAC, carrying mainly the <b>VLAN ID</b> (a number 1–4094). The second switch reads the tag, places the frame in the right VLAN and removes the tag again before handing it to the end device (which knows nothing about VLANs). So tagging happens only <b>between switches on a trunk</b>; the access port to an end device is always <b>untagged</b>. And one more connection: a switch can have <b>its own IP address inside a VLAN</b> – that’s called an <b>SVI</b> (Switch Virtual Interface), the VLAN’s virtual interface. On a plain L2 switch there is usually one SVI for <b>management</b> (you log in to that IP); and it is exactly thanks to SVIs that the <b>L3 switch from the Switching and VLANs course</b> can route between VLANs – each VLAN has its own SVI there, which is its <b>default gateway</b>.',
  [['802.1Q','the VLAN tagging standard; inserts 4 bytes with a VLAN ID (1–4094) into the frame.'],['VLAN ID','the VLAN number in the tag; by it the switch knows which VLAN the frame belongs to.'],['VLAN-aware','a device that understands 802.1Q tags (switches, trunks); an ordinary host is VLAN-unaware – it never sees tags, the access port strips them for it.'],['SVI','a VLAN’s virtual interface on a switch – its IP inside that VLAN (management, or a gateway on an L3 switch).']]);}
function mountC9Dot1q(){var tagged='<g transform="translate(170,144)"><rect x="0" y="0" width="56" height="28" style="fill:var(--panel2);stroke:var(--line2)"/><text x="28" y="18" text-anchor="middle" style="font:700 7px var(--mono);fill:var(--muted)">'+esc('dst MAC')+'</text><rect x="56" y="0" width="56" height="28" style="fill:var(--panel2);stroke:var(--line2)"/><text x="84" y="18" text-anchor="middle" style="font:700 7px var(--mono);fill:var(--muted)">'+esc('src MAC')+'</text><rect x="112" y="0" width="58" height="28" style="fill:var(--cyan);fill-opacity:.25;stroke:var(--cyan);stroke-width:1.6"/><text x="141" y="8" text-anchor="middle" style="font:700 6.5px var(--mono);fill:var(--cyan)">802.1Q</text><text x="141" y="25" text-anchor="middle" style="font:700 6.5px var(--mono);fill:var(--cyan)">VLAN 20</text><rect x="170" y="0" width="60" height="28" style="fill:var(--panel2);stroke:var(--line2)"/><text x="200" y="18" text-anchor="middle" style="font:700 7px var(--mono);fill:var(--muted)">data</text></g>';c9Mount('c9e',[
  {glow:c9g('a','--cyan')+c9g('sw','--cyan'),dyn:c9lbl(120,32,'access: untagged','--cyan'),cap:'PC-A sends a <b>plain untagged frame</b> (it knows nothing about VLANs). It arrives on an access port in VLAN 20.'},
  {glow:c9g('sw','--cyan')+c9g('c','--cyan'),dyn:tagged+c9pkt('316 84','462 64','--cyan'),cap:'Before sending the frame over the <b>trunk</b> to the other switch, it inserts an <b>802.1Q tag</b> with "VLAN 20". Now it’s clear where it belongs.'},
  {glow:c9g('c','--green')+c9g('sw','--green'),dyn:c9lbl(480,32,'tag removed → access','--green'),cap:'The second switch reads the tag, places it in VLAN 20 and <b>removes it again</b> before giving it to the end PC. Tagging is only between switches.'}
]);}
// L2M3 — native VLAN
function renderC9Native(){return c9P('c9f',
  'One exception: a trunk has a <b>native VLAN</b> – the single VLAN whose frames go <b>untagged</b>. Historically for devices that couldn’t do 802.1Q. But it’s a <b>security risk</b>: if two connected switches have a <b>different</b> native VLAN, frames can "jump" into the wrong VLAN (native VLAN mismatch). And the <b>VLAN hopping</b> attack via double-tagging abuses the native VLAN directly (lesson 4). Practical rules: <b>same native VLAN on both ends</b>, and ideally a <b>dedicated unused</b> VLAN with no data in it.',
  [['native VLAN','the VLAN whose frames go untagged on a trunk; must match on both ends.'],['native VLAN mismatch','different native VLANs on the trunk ends → frames can end up in the wrong VLAN.']]);}
function mountC9Native(){c9Mount('c9f',[
  {glow:c9g('sw','--cyan')+c9g('c','--cyan'),dyn:c9lbl(300,64,'SW: native = VLAN 1','--cyan')+c9lbl(480,32,'SW2: native = VLAN 1','--cyan')+c9pkt('316 84','462 64','--cyan')+c9lbl(300,182,'untagged frame → both ends read VLAN 1','--cyan'),cap:'On a trunk <b>one</b> VLAN goes untagged – the <b>native VLAN</b>. All others are tagged.'},
  {glow:c9g('sw','--amber')+c9g('c','--red'),dyn:c9lbl(300,64,'SW: native = VLAN 1','--amber')+c9lbl(480,32,'SW2: native = VLAN 99','--red')+c9pkt('316 84','462 64','--red')+c9lbl(300,182,'the same frame lands in VLAN 99 – it jumped','--red'),cap:'If the switches have a <b>different</b> native VLAN, an untagged frame lands in the <b>wrong</b> VLAN (mismatch). A security hole.'},
  {glow:c9g('sw','--green')+c9g('c','--green'),dyn:c9lbl(300,64,'SW: native = VLAN 999','--green')+c9lbl(480,32,'SW2: native = VLAN 999','--green')+c9pkt('316 84','462 64','--green')+c9lbl(300,182,'999 = a dedicated empty VLAN, no data','--green'),cap:'Rule: native VLAN <b>the same on both ends</b> and ideally <b>unused</b> (no data). That also closes VLAN hopping (lesson 4).'}
]);}
// L3M1 — CAM overflow
function renderC9CamOverflow(){return c9P('c9g',
  'Now the first L2 attack – and it ties straight to the MAC table. In <b>MAC flooding</b> the attacker spews a <b>flood of frames with bogus source MACs</b> into the switch. The switch dutifully tries to learn them until its <b>CAM table overflows</b>. A full switch can’t learn legitimate MACs – it has nowhere to store new/unknown destinations and <b>floods them to all ports</b>: it behaves more and more like a <b>hub</b>. The attacker thus <b>sniffs</b> traffic that would otherwise never reach them. The defense? Limit how many MACs are allowed on a port – <b>port security</b> (next modules).',
  [['MAC flooding','an attack that floods bogus MACs to overflow the switch’s CAM table.'],['CAM overflow','an overfilled MAC table → the switch floods everything to all ports (sniffable).']]);}
function mountC9CamOverflow(){var f=function(){var o='';for(var i=0;i<6;i++)o+='<rect x="-4" y="-3" width="8" height="6" rx="1" style="fill:var(--red)"><animateMotion path="M 138 136 L 284 100" dur="0.6s" begin="'+(i*0.1)+'s" repeatCount="indefinite"/></rect>';return o;};c9Mount('c9g',[
  {glow:c9g('b','--red')+c9g('sw','--amber'),dyn:f()+c9mac([['fake..01','P2','--red'],['fake..02','P2','--red'],['fake..03','P2','--red']]),cap:'The attacker on PC-B spews frames with <b>thousands of fake MACs</b>. The switch tries to learn them…'},
  {glow:c9g('sw','--red'),dyn:c9lbl(300,64,'CAM full → hub mode','--red'),cap:'…until the <b>CAM overflows</b>. A full switch floods unknown destinations to all ports – behaving more and more like a <b>hub</b>.'},
  {glow:c9all('--red'),dyn:c9pkt('462 136','138 136','--red'),cap:'SRV → PC-A traffic now also reaches the <b>attacker</b> (PC-B). Eavesdropping! The defense = <b>port security</b>.'}
]);}
// L3M2 — port security
function renderC9PortSec(){return c9P('c9h',
  '<b>Port security</b> is a defense right on the switch port. You tell it: "this access port may have <b>at most N</b> MAC addresses" (typically 1 – one computer). When more appear, it’s a <b>violation</b>. You can also <b>lock</b> a MAC (sticky): the switch remembers the first learned MAC and then only allows that one – nobody else gets through. That kills MAC flooding (the attacker can’t fill the table via one port) and plain "I’ll plug a foreign PC into the socket". You’ll try it in this simulator: on the managed switch’s <b>Ports</b> tab you set max MAC and an allowed MAC. (The "Allowed MAC" field only shows in <b>Advanced mode</b>.)',
  [['port security','limiting the number/specific MACs on a switch access port; a defense against L2 abuse.'],['sticky MAC','the switch locks the first learned MAC and only allows that one on the port.']]);}
function mountC9PortSec(){c9Mount('c9h',[
  {glow:c9g('b','--cyan')+c9g('sw','--cyan'),dyn:c9lbl(300,64,'max MAC = 1','--cyan'),cap:'On PC-B’s port you set <b>max 1 MAC</b>. One computer = fine.'},
  {glow:c9g('b','--green')+c9g('sw','--green'),dyn:c9lbl(300,64,'sticky: locked to BB:..:B','--green'),cap:'<b>Sticky</b>: the switch locks PC-B’s MAC. Only it passes on the port.'},
  {glow:c9g('b','--red')+c9g('sw','--red'),dyn:c9lbl(300,64,'foreign MAC / flood → block','--red'),cap:'The attacker tries to flood fake MACs or swap in a foreign PC → <b>violation</b>, the port acts. MAC flooding falls.'}
]);}
// L3M3 — violation actions
function renderC9Violation(){return c9P('c9i',
  'What happens on a port-security <b>violation</b>? There are three response modes. <b>Protect</b>: it <b>silently drops</b> the disallowed frames, reports nothing. <b>Restrict</b>: it drops them and also <b>logs</b> (a log/counter) – you know something’s happening. <b>Shutdown</b> (the default and strictest): it <b>fully disables</b> the port (err-disabled) until an admin manually restores it. The choice is a trade-off between <b>security and uptime</b>: shutdown is safest but one mistake downs a port; protect/restrict don’t interrupt traffic but only slow the attacker. So what is <b>protect</b> good for, if restrict does almost the same and logs on top? It fits where the records would <b>needlessly flood the log</b> – say a port where several MACs show up routinely and predictably (a shared meeting room, a printer with a built-in mini-switch, a phone with a PC behind it). There restrict would spew messages that drown out the important ones, so you drop silently instead. In practice access ports still most often use <b>restrict</b> or <b>shutdown</b>.',
  [['shutdown','on violation the port is fully disabled (err-disabled) – strictest, the default.'],['restrict / protect','restrict drops + logs; protect just silently drops. Neither interrupts traffic.']]);}
function mountC9Violation(){
  var log=function(title,rows,c){var o='<g transform="translate(248,150)"><rect x="0" y="0" width="104" height="'+(11+rows.length*10)+'" rx="3" style="fill:var(--panel2);stroke:var(--line2);stroke-width:1"/><text x="6" y="8" style="font:700 6.5px var(--mono);fill:var(--muted)">'+esc(title)+'</text>';rows.forEach(function(r,i){o+='<text x="6" y="'+(18+i*10)+'" style="font:6.5px var(--mono);fill:var('+c+')">'+esc(r)+'</text>';});return o+'</g>';};
  var drop=function(c){return c9lbl(258,112,'✕','--'+c);};
  c9Mount('c9i',[
  {glow:c9g('b','--amber')+c9g('sw','--amber'),dyn:c9pkt('138 136','284 100','--amber')+drop('amber')+log('log',['—'],'--muted')+c9lbl(300,64,'protect: '+'silent drop','--amber'),cap:'<b>Protect</b>: disallowed frames <b>silently vanish</b>. The mildest – but you don’t even know it happened.'},
  {glow:c9g('b','--cyan')+c9g('sw','--cyan'),dyn:c9pkt('138 136','284 100','--cyan')+drop('cyan')+log('log',['SEC-VIOLATION P2 #1','SEC-VIOLATION P2 #2','SEC-VIOLATION P2 #3'],'--cyan')+c9lbl(300,64,'restrict: '+'drop + log','--cyan'),cap:'<b>Restrict</b>: drops <b>and logs</b>. Traffic keeps flowing, but you have a trace to investigate.'},
  {glow:c9g('b','--red')+c9g('sw','--red'),dyn:'<line x1="284" y1="100" x2="138" y2="136" style="stroke:var(--red);stroke-width:2.4;stroke-dasharray:3 3"/>'+drop('red')+log('log',['P2 err-disabled'],'--red')+c9lbl(120,196,'err-disabled','--red')+c9lbl(300,64,'shutdown: '+'port disabled','--red'),cap:'<b>Shutdown</b> (default): the port is <b>fully disabled</b> until you restore it by hand. Safest, but harshest.'}
]);}
// L4M1 — VLAN hopping double tagging
function renderC9DoubleTag(){return c9P('c9j',
  '<b>VLAN hopping</b> = an attack that reaches a <b>foreign VLAN</b> it shouldn’t. You glimpsed it briefly in the redundancy course – here we <b>take it apart properly</b> and add the second variant (switch spoofing via DTP) and the full defense. The first variant: <b>double tagging</b>. The attacker (in the <b>native VLAN</b>) sends a frame with <b>two 802.1Q tags</b>. The first switch strips the <b>outer</b> tag (it’s its native VLAN, goes untagged) and forwards the frame – but underneath remains the <b>second</b> tag, aimed at the <b>victim’s target VLAN</b>. The second switch reads it and delivers it to that VLAN. Why doesn’t the first switch strip both? Because a switch always removes <b>only the outer tag</b> – whatever is underneath it treats as the frame’s data and never looks inside. So it never "sees" the second tag and passes it on untouched. And how does the attacker even build such a frame? An ordinary computer doesn’t tag – tagging is the switch’s job. So the attacker needs <b>a network card and software that can insert 802.1Q tags themselves</b> (standard equipment on Linux); only then can they send a frame that already carries two tags. It’s <b>one-way</b> – the victim’s reply travels back the normal way (with a single tag), so it never reaches the attacker; it works only from the native VLAN – but that’s enough to inject an attack. The defense is in the next module.',
  [['VLAN hopping','breaking into a foreign VLAN the attacker shouldn’t have access to.'],['double tagging','a frame with two 802.1Q tags; a switch always peels only the outer (native), the inner passes on and delivers to the victim.']]);}
function mountC9DoubleTag(){var dt='<g transform="translate(150,80)"><rect x="0" y="0" width="40" height="20" style="fill:var(--red);fill-opacity:.2;stroke:var(--red)"/><text x="20" y="13" text-anchor="middle" style="font:700 5px var(--mono);fill:var(--red)">tag1 native</text><rect x="40" y="0" width="40" height="20" style="fill:var(--amber);fill-opacity:.2;stroke:var(--amber)"/><text x="60" y="13" text-anchor="middle" style="font:700 5px var(--mono);fill:var(--amber)">'+esc('tag2 victim')+'</text><rect x="80" y="0" width="60" height="20" style="fill:var(--panel2);stroke:var(--line2)"/><text x="110" y="13" text-anchor="middle" style="font:700 6.5px var(--mono);fill:var(--muted)">'+esc('attack')+'</text></g>';c9Mount('c9j',[
  {glow:c9g('b','--red')+c9g('sw','--amber'),dyn:dt,cap:'The attacker (in the <b>native VLAN</b>) sends a frame with <b>two</b> tags: outer = native, inner = the victim’s VLAN.'},
  {glow:c9g('sw','--amber')+c9g('c','--amber'),dyn:c9pkt('316 84','462 64','--amber')+'<g transform="translate(170,80)"><rect x="0" y="0" width="40" height="20" style="fill:var(--amber);fill-opacity:.2;stroke:var(--amber)"/><text x="20" y="13" text-anchor="middle" style="font:700 5px var(--mono);fill:var(--amber)">'+esc('tag2 victim')+'</text><rect x="40" y="0" width="60" height="20" style="fill:var(--panel2);stroke:var(--line2)"/><text x="70" y="13" text-anchor="middle" style="font:700 6.5px var(--mono);fill:var(--muted)">'+esc('attack')+'</text></g>',cap:'The first switch <b>strips only the outer</b> tag (it’s its native → untagged) and forwards. It never looks underneath – <b>the second tag passes untouched</b>.'},
  {glow:c9g('c','--red')+c9g('sw','--red'),dyn:c9lbl(480,32,'delivered to victim VLAN','--red'),cap:'The second switch reads the remaining tag and <b>delivers the attack into the victim’s VLAN</b>. Hopping! One-way, but effective.'}
]);}
// L4M2 — DTP / switch spoofing
function renderC9Dtp(){return c9P('c9k',
  'The second VLAN-hopping variant: <b>switch spoofing</b> via <b>DTP</b> (Dynamic Trunking Protocol – the protocol two switches use to agree on their own that a trunk should form between them). Many switches have ports in a default mode where they <b>auto-negotiate a trunk</b> – for <b>convenience</b> (plug two switches together and the trunk comes up on its own), but that is also a hole. The attacker connects and pretends to be a switch wanting a <b>trunk</b>. When the port accepts DTP, a trunk forms – and the attacker suddenly <b>sees all VLANs</b> at once (a trunk carries everything). A one-computer access port becomes a gateway into the whole network. The cause: <b>automatic</b> trunk negotiation where it has no business being. The defense is obvious – next module.',
  [['DTP','Dynamic Trunking Protocol – automatic trunk negotiation; the attacker abuses it for "switch spoofing".'],['switch spoofing','the attacker pretends to be a switch and negotiates a trunk → sees all VLANs.']]);}
function mountC9Dtp(){c9Mount('c9k',[
  {glow:c9g('b','--cyan')+c9g('sw','--cyan'),dyn:c9lbl(300,64,'DTP: '+'want a trunk?','--cyan'),cap:'The port is willing to <b>negotiate a trunk</b> by default (DTP). It waits for a switch to speak up.'},
  {glow:c9g('b','--red')+c9g('sw','--amber'),dyn:c9lbl(300,64,'attacker: "I am a switch"','--red'),cap:'The attacker pretends to be a <b>switch</b> and asks for a trunk. The port agrees → a <b>trunk forms</b>.'},
  {glow:c9all('--red'),dyn:c9lbl(300,64,'sees ALL VLANs','--red'),cap:'A trunk carries <b>all VLANs</b> – the attacker sees them all at once. A one-PC port became a hole into the whole network.'}
]);}
// L4M3 — defense against VLAN hopping
function renderC9VlanDefend(){return c9P('c9l',
  'The defense against VLAN hopping is luckily straightforward – it’s <b>port hygiene</b>: <b>(1)</b> On ports to end devices <b>disable DTP</b> and hard-set them as <b>access</b> (no automatic trunk negotiation). <b>(2)</b> Set the <b>native VLAN</b> to a <b>dedicated unused</b> VLAN with no data in it – that kills double tagging. <b>(3)</b> On a trunk <b>allow only the needed VLANs</b> (pruning), not all. <b>(4)</b> <b>Administratively shut</b> unused ports. A few rules, and both hopping variants are gone.',
  [['disable DTP','hard-set end-device ports as access, no trunk negotiation.'],['port hygiene','hard access, a dedicated unused native VLAN, pruning, disabled unused ports.']]);}
function mountC9VlanDefend(){c9Mount('c9l',[
  {glow:c9g('b','--red')+c9g('sw','--green'),dyn:c9pkt('138 136','284 100','--red')+c9lbl(258,112,'✕','--red')+c9lbl(120,196,'"I am a switch, give me a trunk"','--red')+c9lbl(300,64,'port = hard access (DTP off)','--green'),cap:'You hard-set the PC port as <b>access</b> and disable DTP. Switch spoofing has no chance.'},
  {glow:c9g('sw','--green')+c9g('c','--green'),dyn:c9lbl(300,64,'native = VLAN 999','--green')+c9lbl(480,32,'native = VLAN 999','--green')+c9lbl(300,182,'no outer tag to strip → double tagging fails','--green'),cap:'You give the native VLAN a <b>dedicated unused</b> one. Double tagging has nothing to start from.'},
  {glow:c9g('sw','--green')+c9g('c','--green'),dyn:c9pkt('316 84','462 64','--green')+c9lbl(300,64,'trunk: only VLAN 10 and 20 allowed','--green')+c9lbl(480,32,'unused ports shut','--green'),cap:'On the trunk <b>only needed VLANs</b> and <b>shut unused ports</b>. Done – hopping closed.'}
]);}
// L5M1 — rogue DHCP
function renderC9RogueDhcp(){return c9P('c9m',
  'Another L2 threat targets <b>DHCP</b> (automatic IP assignment). The attacker plugs a <b>rogue DHCP server</b> into the network. When a client asks for an IP, the rogue can <b>answer before</b> the real one – and hand it <b>its own IP as the default gateway</b>. From then on <b>all the client’s traffic flows through the attacker</b> (man-in-the-middle): they can sniff or alter it. The client knows nothing – it got "an IP and a gateway", as always. This is dangerous precisely because DHCP isn’t normally verified by anyone. The defense? <b>DHCP snooping</b> – next module.',
  [['rogue DHCP','a rogue DHCP server that hands clients a wrong gateway (MITM).'],['MITM','Man-in-the-Middle – the attacker sits between the victim and the network and sees/alters traffic.']]);}
function mountC9RogueDhcp(){c9Mount('c9m',[
  {glow:c9g('a','--cyan')+c9g('sw','--cyan'),dyn:c9lbl(120,32,'"who gives me an IP?"','--cyan'),cap:'PC-A asks for an <b>IP via DHCP</b> (a broadcast "who can help me?").'},
  {glow:c9g('b','--red')+c9g('sw','--red')+c9g('a','--red'),dyn:c9pkt('138 136','284 100','--red')+c9lbl(120,32,'gateway = attacker!','--red'),cap:'The attacker’s <b>rogue DHCP</b> answers first: "here’s an IP and a <b>gateway = me</b>". PC-A has no idea.'},
  {glow:c9g('a','--red')+c9g('sw','--red')+c9g('b','--red'),dyn:c9pkt('138 64','284 84','--red')+c9pkt('284 100','138 136','--red'),cap:'Now <b>all of PC-A’s traffic flows through the attacker</b> (MITM). They can sniff and alter it. The defense = DHCP snooping.'}
]);}
// L5M2 — DHCP snooping
function renderC9DhcpSnoop(){return c9P('c9n',
  '<b>DHCP snooping</b> is a defense right on the switch. The principle: ports are split into <b>trusted</b> and <b>untrusted</b>. The switch accepts <b>DHCP replies</b> (IP/gateway offers) <b>only from trusted ports</b> – typically the uplink toward the <b>real</b> DHCP server. If a DHCP offer arrives from an <b>untrusted</b> port (where an end PC or attacker is connected), the switch <b>drops</b> it. That kills rogue DHCP. The switch also builds a <b>binding table</b> "MAC + IP + port", useful for a further defense (DAI – next module).',
  [['DHCP snooping','the switch accepts DHCP replies only from trusted ports → it drops rogue DHCP.'],['binding table','a "MAC + IP + port" table snooping builds; the basis for Dynamic ARP Inspection.']]);}
function mountC9DhcpSnoop(){c9Mount('c9n',[
  {glow:c9g('sw','--cyan'),dyn:c9lbl(480,32,'trusted ↑','--green')+c9lbl(120,32,'untrusted','--amber'),cap:'You split the ports: the uplink to the <b>real</b> DHCP = <b>trusted</b>, end-PC ports = <b>untrusted</b>.'},
  {glow:c9g('b','--red')+c9g('sw','--red'),dyn:c9pkt('138 136','284 100','--red')+c9lbl(300,64,'DHCP from untrusted → drop','--red'),cap:'The attacker tries a DHCP offer from an <b>untrusted</b> port → the switch <b>drops</b> it. Rogue DHCP falls.'},
  {glow:c9g('sw','--green'),dyn:c9mac([['AA:..:A1','10.0.0.10 / P1','--green'],['BB:..:B','10.0.0.12 / P2','--green']]),cap:'For legitimate clients the switch records <b>MAC + IP + port</b> in the binding table. It’ll be handy for DAI.'}
]);}
// L5M3 — DAI
function renderC9Dai(){return c9P('c9o',
  'The last of the trio is <b>Dynamic ARP Inspection (DAI)</b> – a defense against <b>ARP spoofing</b>. Recall from the How networks work course: ARP maps IP to MAC. An attacker can broadcast <b>forged ARP</b> ("the gateway IP = my MAC"), pulling the victim’s traffic to themselves (MITM again). DAI prevents this: on untrusted ports it <b>checks every ARP</b> against the <b>binding table</b> from DHCP snooping. Does "MAC + IP" match an entry? The ARP passes. Doesn’t match (a forgery)? It <b>drops</b> it. So DHCP snooping and DAI form a <b>pair</b>: snooping knows who has which IP, and DAI enforces it for ARP too.',
  [['DAI','Dynamic ARP Inspection – checks ARP against the binding table; drops forged ARP.'],['ARP spoofing','forged ARP ("the gateway IP = my MAC") that pulls the victim’s traffic to the attacker.']]);}
function mountC9Dai(){c9Mount('c9o',[
  {glow:c9g('b','--red')+c9g('a','--red'),dyn:c9lbl(300,64,'forged ARP: "gateway = me"','--red'),cap:'The attacker broadcasts <b>forged ARP</b>: "the gateway IP = my MAC". They want to pull the victim’s traffic.'},
  {glow:c9g('sw','--cyan'),dyn:c9lbl(300,64,'DAI: matches the binding table?','--cyan'),cap:'<b>DAI</b> compares that ARP with the <b>binding table</b> (from DHCP snooping): does that MAC really own that IP?'},
  {glow:c9g('b','--red')+c9g('sw','--green'),dyn:c9lbl(300,64,'no match → ARP dropped','--green'),cap:'No match (a forgery) → the ARP is <b>dropped</b>. ARP spoofing falls. Snooping + DAI = a strong pair against MITM.'}
]);}
// L6M1 — rogue root / BPDU attack
function renderC9RogueRoot(){return c9P('c9p',
  'You can also attack <b>Spanning Tree</b> (from the Redundancy and Spanning Tree course). STP elects the <b>root bridge</b> by the lowest bridge ID. (This simulator computes the tree per VLAN – like Cisco <b>PVST+</b>.) When an attacker connects a switch (or software) with an <b>artificially low priority</b>, it declares itself <b>root</b> and STP recomputes the tree so that <b>traffic starts flowing through it</b> – eavesdropping, or at least destabilizing the network. All it takes is sending <b>forged BPDUs</b> (the messages switches compute STP with). The cause: a switch trusts <b>any</b> BPDU on <b>any</b> port – even where only an end PC should be. The defense is in the next modules (BPDU Guard, Root Guard).',
  [['rogue root','an attacker’s switch declares itself root bridge via forged BPDUs and pulls traffic to itself.'],['BPDU','Bridge Protocol Data Unit – the messages switches compute STP with (and elect the root).']]);}
function mountC9RogueRoot(){c9Mount('c9p',[
  {glow:c9g('sw','--green'),dyn:c9lbl(300,64,'legit root = backbone switch','--green'),cap:'Normally the <b>root</b> is the central backbone switch. The tree is built sensibly around it.'},
  {glow:c9g('b','--red')+c9g('sw','--amber'),dyn:c9pkt('138 136','284 100','--red')+c9lbl(300,64,'forged BPDU: "I am root"','--red'),cap:'The attacker sends <b>forged BPDUs</b> with an extra-low priority: "<b>I am root</b>". STP believes it.'},
  {glow:c9g('b','--red')+c9all('--amber'),dyn:c9lbl(300,64,'traffic flows through attacker','--red'),cap:'The tree recomputes and <b>traffic starts flowing through the attacker</b>. Eavesdropping / destabilization. Defense → BPDU/Root Guard.'}
]);}
// L6M2 — BPDU Guard + PortFast
function renderC9BpduGuard(){return c9P('c9q',
  'The first STP protection: <b>PortFast</b> + <b>BPDU Guard</b> on <b>access ports</b> (where end PCs belong). <b>PortFast</b> lets such a port go straight to forwarding (a PC needn’t wait for STP). But that would make it vulnerable – so <b>BPDU Guard</b> is added: on a PortFast port <b>no BPDUs are expected</b>, it’s just a computer after all. If <b>any BPDU arrives</b> on such a port (someone connected a switch or attacker), BPDU Guard <b>instantly disables</b> the port (err-disabled). An STP attack thus ends before it begins. (You know PortFast and BPDU Guard from the Redundancy and Spanning Tree course – here you see them as a defense against a rogue-root attack.)',
  [['PortFast','an access port goes straight to forwarding (no STP wait) – for end devices.'],['BPDU Guard','on a PortFast port, any incoming BPDU instantly disables the port.']]);}
function mountC9BpduGuard(){c9Mount('c9q',[
  {glow:c9g('a','--green')+c9g('sw','--green'),dyn:c9lbl(120,32,'PortFast','--green'),cap:'On the access port to a PC you enable <b>PortFast</b> – the port forwards immediately, the PC doesn’t wait for STP.'},
  {glow:c9g('a','--cyan')+c9g('sw','--cyan'),dyn:c9lbl(120,32,'+ BPDU Guard: no BPDUs','--cyan'),cap:'You add <b>BPDU Guard</b>: on this port <b>no BPDUs are expected</b> – there’s a computer here.'},
  {glow:c9g('a','--red')+c9g('sw','--green'),dyn:c9lbl(300,64,'BPDU on port → port DISABLED','--red'),cap:'If someone connects a switch and a <b>BPDU</b> arrives, the port is <b>instantly disabled</b>. A rogue root can’t even get going.'}
]);}
// L6M3 — Root Guard
function renderC9RootGuard(){return c9P('c9r',
  'And what about ports where a switch <b>belongs</b> (a legitimate switch link) but you don’t want the other side to become the <b>root</b>? That’s what <b>Root Guard</b> is for. It watches: a BPDU may arrive on a protected port, but <b>NOT a "superior" BPDU</b> that would make the neighbor the new root. If such a one arrives, Root Guard puts the port in the <b>root-inconsistent</b> state (temporarily blocking) until it stops. This <b>pins the direction</b> the root may come from (toward the backbone) and prevents someone outside from taking over the tree’s root. BPDU Guard protects <b>access</b> ports, Root Guard protects ports <b>toward other switches</b> from which the root must not come.',
  [['Root Guard','blocks "superior" BPDUs on a port → the neighbor can’t become root (root-inconsistent).'],['superior BPDU','a BPDU with a better (lower) bridge ID that would make the sender the new root.']]);}
function mountC9RootGuard(){c9Mount('c9r',[
  {glow:c9g('sw','--green'),dyn:c9lbl(300,64,'root is in the backbone ✓','--green'),cap:'You want the root <b>in the backbone</b>. On the trunk to another switch you enable <b>Root Guard</b>.'},
  {glow:c9g('c','--amber')+c9g('sw','--cyan'),dyn:c9pkt('462 64','316 84','--amber')+c9lbl(300,64,'"superior" BPDU from neighbor?','--cyan'),cap:'The neighbor sends a <b>superior BPDU</b> ("I’d be a better root"). Root Guard <b>won’t allow it</b>.'},
  {glow:c9g('c','--red')+c9g('sw','--green'),dyn:c9lbl(300,64,'root-inconsistent → '+'block','--red'),cap:'The port goes <b>root-inconsistent</b> (blocks) until the superior BPDUs stop. The root stays where it belongs.'}
]);}
// L7M1 — SPAN / monitoring
function renderC9Span(){return c9P('c9s',
  'A slightly different but practical topic: how do you <b>see traffic</b> on a switch without being in its path? That’s what <b>SPAN</b> (port mirroring) is for: the switch sends a <b>copy</b> of traffic from one or more ports to a chosen <b>monitor port</b>. There you attach an analyzer or an <b>IDS</b> (recall the Advanced security course – an IDS sits "off-path" precisely thanks to SPAN/TAP). Traffic keeps flowing normally; SPAN only mirrors. It’s a basic tool for <b>diagnostics</b> (why isn’t it working) and <b>security</b> (what packets are flying around).',
  [['SPAN','port mirroring – the switch sends a copy of traffic to a monitor port (for an analyzer/IDS).'],['off-path','an analyzer/IDS gets only a copy (SPAN/TAP), so it isn’t in the traffic path.']]);}
function mountC9Span(){c9Mount('c9s',[
  {glow:c9g('a','--cyan')+c9g('sw','--cyan')+c9g('srv','--cyan'),dyn:c9pkt('138 64','462 136','--cyan'),cap:'Normal traffic flows between PC-A and the server. You want to see it, but <b>not be in the path</b>.'},
  {glow:c9g('sw','--violet')+c9g('b','--violet'),dyn:c9pkt('284 100','138 136','--violet')+c9lbl(120,112,'SPAN: copy here','--violet'),cap:'You enable <b>SPAN</b>: the switch sends a <b>copy</b> of the traffic to the monitor port (PC-B with an analyzer/IDS).'},
  {glow:c9all('--green'),dyn:c9lbl(300,64,'original keeps flowing','--green'),cap:'The original traffic flows on <b>untouched</b>; you have a copy for diagnostics and security. That’s how an IDS sits "off-path".'}
]);}
// L7M4 — the port's physical layer (duplex/autonegotiation, speed and SFP, PoE)
function renderC9Phy(){return c9P('c9v',
  'A colleague reports that "the internet is slow" – yet the link is up, the ping goes through and the switch reports nothing. The culprit is often the <b>port’s physical layer</b>. It starts with <b>duplex</b>: <b>full duplex</b> means the port <b>sends and receives at the same time</b> (the norm today), <b>half duplex</b> can only do one at a time and has to watch for collisions (a legacy of hubs and collisions – you saw both in the ISO/OSI and TCP/IP: the network map course). Both ends of the cable usually <b>negotiate</b> speed and duplex themselves – that is <b>autonegotiation</b>. But if you hard-set one end and leave the other on auto, the fixed side stops sending the negotiation signal – the auto side has nothing to read, it can still derive the speed from the signal on the wire, but not the duplex, so it safely falls back to <b>half duplex</b>. That is why a mismatch is almost always in duplex, not in speed. You get a <b>duplex mismatch</b>. That is the treacherous fault: the link "works", the ping goes through, but any real transfer is <b>desperately slow</b> and <b>collisions and errors</b> pile up on the port. The rule is simple: <b>either both ends on auto, or both hard-set the same</b> – never half and half. The same family includes <b>port speed</b> (100M / 1G / 2.5G / 10G) and <b>SFP uplinks</b>: an SFP is a small pluggable module in a switch slot that takes a copper or fiber cable – that is how fast switch-to-switch links and longer-distance links are built. Both are in this simulator too: you set <b>speed and duplex</b> by right-clicking a link (or in the port detail) and the number of <b>SFP slots</b> is in the switch’s port settings. Note though: duplex here is a property of the <b>whole link</b>, not of each end separately – so you cannot build the mismatch itself (one end hard-set, the other on auto) in the simulator; that one is knowledge for the real world. And thirdly <b>PoE (Power over Ethernet)</b>: the switch sends <b>power</b> over the data cable as well, so a Wi-Fi AP, camera or IP phone runs <b>without its own socket</b> – one ethernet cable is enough. How much power a device gets is set by <b>classes</b>: 802.3<b>af</b> about <b>15.4 W</b>, 802.3<b>at</b> (PoE+) <b>30 W</b> and 802.3<b>bt</b> up to <b>90 W</b> – that tells you whether the switch can power just a phone or also a pan-tilt camera. An honest note: <b>this simulator does not model PoE</b> – there is nowhere here to configure power, take it as knowledge for the real world.',
  [['duplex','full = the port sends and receives at once; half = one at a time (and watches for collisions).'],['autonegotiation','automatic speed/duplex negotiation between two ports; hard-set it only on both sides at once.'],['duplex mismatch','one end full, the other half – the link works but is slow and pours out collisions and errors.'],['SFP','a pluggable module in a switch slot for an uplink (copper or fiber, 1G/10G).'],['PoE','Power over Ethernet – powering a device over the data cable (AP, camera, phone).'],['PoE classes','802.3af ~15.4 W, 802.3at (PoE+) 30 W, 802.3bt up to 90 W – how much power the port delivers.']]);}
function mountC9Phy(){c9Mount('c9v',[
  {glow:c9g('a','--cyan')+c9g('sw','--cyan'),dyn:c9pkt('138 64','284 84','--cyan')+c9pkt('284 84','138 64','--green')+c9lbl(300,64,'full duplex: both ways at once','--cyan'),cap:'<b>Full duplex</b>: the port <b>sends and receives at the same time</b>. Both ends negotiate speed and duplex themselves – <b>autonegotiation</b>.'},
  {glow:c9g('a','--red')+c9g('sw','--red'),dyn:c9pkt('138 64','284 84','--red','3.4s')+c9lbl(300,64,'full ⇄ half: collisions and errors','--red'),cap:'<b>Duplex mismatch</b>: one end hard-set, the other on auto → the auto side falls back to half. The link "works" but is <b>desperately slow</b>.'},
  {glow:c9g('a','--green')+c9g('sw','--green'),dyn:c9lbl(300,64,'both auto – or both hard-set the same','--green'),cap:'The rule: <b>both ends on auto</b>, or <b>both hard-set the same</b>. Never half and half – that makes the mismatch go away.'},
  {glow:c9g('sw','--violet')+c9g('srv','--violet'),dyn:c9pkt('316 100','462 136','--violet','0.7s')+c9lbl(300,64,'uplink: SFP module, 10G','--violet'),cap:'<b>Port speed</b> and the <b>SFP uplink</b>: a pluggable module (copper/fiber) for fast links. In the simulator: right-click a link, and the port settings.'},
  {glow:c9g('sw','--amber'),dyn:c9lbl(300,64,'PoE: data + power','--amber'),cap:'<b>PoE</b>: one cable carries <b>data and power</b> (af 15.4 W / at 30 W / bt 90 W). Note – <b>the simulator does not model PoE</b>.'}
]);}
// L7M2 — link aggregation
function renderC9Agg(){return c9P('c9t',
  'One gigabit cable between switches is no longer enough – and replacing both switches with ten-gigabit ones is expensive. <b>Link aggregation (EtherChannel/LACP</b> – from the Redundancy and Spanning Tree course) offers a cheaper way: you bundle <b>several physical cables into one logical link</b>. This grows the <b>bundle’s total capacity</b> (two gigabits instead of one) – but <b>not the speed of a single transfer</b>. The switch does not spread individual frames; it spreads <b>whole flows</b>: from the sender/receiver pair it computes a "fingerprint" (a hash) and permanently pins that flow to one particular cable, so frames don’t arrive out of order. One download therefore still rides a single cable at a gigabit at most; the bundle helps where there are <b>many</b> connections – they spread across all the cables and together saturate them. The second benefit is <b>redundancy</b>: if a digger cuts one cable or someone yanks a connector, the bundle keeps going, just with less capacity. And the loop? There are several cables, so a physical loop <b>is</b> there – but the bundle acts as <b>one logical port</b>, which is how STP sees it, so there is nothing to block. The condition: <b>both ends</b> must be bundled into the same group and configured the same – otherwise you get exactly the loop you wanted to avoid instead of a bundle. In the simulator you build a bundle by <b>right-clicking a link</b> (Bundle parallel links into a LAG). The physical side of a port – duplex, speed, SFP and PoE – is covered by the <b>previous module</b>.',
  [['link aggregation','bundling several cables into one logical link (EtherChannel/LACP) – capacity + redundancy.'],['one logical port','STP sees the bundle as a single port, so it has nothing to block on the parallel cables.']]);}
function mountC9Agg(){c9Mount('c9t',[
  {glow:c9g('c','--cyan')+c9g('sw','--cyan'),dyn:'<line x1="316" y1="88" x2="462" y2="68" style="stroke:var(--cyan);stroke-width:2.4"/><line x1="316" y1="84" x2="462" y2="64" style="stroke:var(--cyan);stroke-width:2.4"/>'+c9lbl(300,64,'2 cables = 1 logical link','--cyan'),cap:'<b>Aggregation</b>: you bundle two cables into <b>one logical link</b>. The capacity adds up and traffic is spread across them.'},
  {glow:c9g('c','--green')+c9g('sw','--green'),dyn:'<line x1="316" y1="88" x2="462" y2="68" style="stroke:var(--red);stroke-width:2.4;stroke-dasharray:4 3"/><line x1="316" y1="84" x2="462" y2="64" style="stroke:var(--green);stroke-width:2.4"/>'+c9pkt('316 84','462 64','--green','0.8s')+c9lbl(300,64,'one cable gone → the bundle keeps going','--green'),cap:'One cable fails? The bundle <b>keeps going</b>, just with less capacity. That’s the free <b>redundancy</b>.'},
  {glow:c9g('sw','--violet')+c9g('c','--violet'),dyn:'<line x1="316" y1="88" x2="462" y2="68" style="stroke:var(--violet);stroke-width:2.4"/><line x1="316" y1="84" x2="462" y2="64" style="stroke:var(--violet);stroke-width:2.4"/>'+c9lbl(300,64,'STP sees one port → blocks nothing','--violet'),cap:'The physical loop <b>is</b> there, but STP sees <b>one logical port</b> – nothing to block. The condition: <b>both ends</b> configured the same.'}
]);}
// L7M3 — synthesis
function renderC9Wrap(){return c9P('c9u',
  'Let’s sum up the switch <b>in depth</b>. We taught the switch to <b>forward</b> (MAC table, flooding, aging), dissected the <b>frame and 802.1Q</b>, and above all went through <b>L2 security</b>: port security against MAC flooding, defense against VLAN hopping (disable DTP, mind the native VLAN), DHCP snooping + DAI against MITM, and BPDU/Root Guard against STP attacks. The access layer is the <b>first place an attacker reaches</b> – and now you know how to <b>harden</b> it. One question remains: port security watches the <b>MAC address</b> – but a MAC can be rewritten. What if the socket asked for an <b>identity</b> instead? That is exactly what <b>802.1X</b> does: before the port passes any data, the device has to sign in, and the switch asks a <b>RADIUS server</b> (the account authority) whether it knows it. An unknown machine stays behind a closed port, whatever MAC it makes up. The price is operational: <b>when RADIUS is down, nobody authenticates</b>, company machines included, which is why it gets doubled in practice. You get to try it in the task: a meeting-room socket that only opens after RADIUS authentication. The next stop in the course rhythm: the <b>router in depth</b>.',
  [['802.1X','port-based authentication: the device signs in and the switch asks a RADIUS server whether to let it in. It checks identity, not a MAC address.'],['RADIUS','the account server that a switch, AP or VPN asks "may this one in?". When it is down, nobody authenticates.'],['L2 security','port security, VLAN-hopping defense, DHCP snooping + DAI, BPDU/Root Guard.'],['access layer','the layer where end devices connect – the first line that must be hardened.']]);}
function mountC9Wrap(){c9Mount('c9u',[
  {glow:c9all('--cyan'),dyn:c9lbl(300,64,'forwarding: MAC table, 802.1Q','--cyan'),cap:'The switch <b>forwards</b> by the MAC table and tags VLANs via 802.1Q. That’s the L2 core.'},
  {glow:c9all('--green'),dyn:c9lbl(300,64,'hardened L2: port-sec, snooping, guards','--green'),cap:'And you can <b>harden</b> it: port security, hopping defense, DHCP snooping + DAI, BPDU/Root Guard.'},
  {glow:c9all('--violet'),dyn:c9lbl(300,64,'→ router in depth','--violet'),cap:'The access layer is secured. Next device in depth: the <b>router</b> (you already covered the firewall in the security courses).'}
]);}
const COURSE_9_DEF = {
  id:'course9',
title:'The switch in depth',
  blurb:'L2 mechanics and security: MAC table and flooding, the 802.1Q frame, port security, VLAN hopping, DHCP snooping and DAI, Spanning Tree protection.',
  lessons:[
    { id:'c9l1', title:'How a switch really forwards', taskId:'mac-table', quizId:'c9q_l1', modules:[
      { id:'c9l1m1', title:'MAC learning', render:renderC9MacLearn, mount:mountC9MacLearn },
      { id:'c9l1m2', title:'Flooding an unknown MAC', render:renderC9Flood, mount:mountC9Flood },
      { id:'c9l1m3', title:'Aging and table capacity', render:renderC9Aging, mount:mountC9Aging }
    ]},
    { id:'c9l2', title:'Inside the frame and 802.1Q', taskId:null, quizId:'c9q_l2', modules:[
      { id:'c9l2m1', title:'The Ethernet frame', render:renderC9Frame, mount:mountC9Frame },
      { id:'c9l2m2', title:'The 802.1Q tag', render:renderC9Dot1q, mount:mountC9Dot1q },
      { id:'c9l2m3', title:'The native VLAN', render:renderC9Native, mount:mountC9Native }
    ]},
    { id:'c9l3', title:'Port security in depth', taskId:'ch-portsec', quizId:'c9q_l3', modules:[ // hands-on task: port locked to a different MAC (exact match of the port security topic)
      { id:'c9l3m1', title:'CAM overflow (MAC flooding)', render:renderC9CamOverflow, mount:mountC9CamOverflow },
      { id:'c9l3m2', title:'Port security and sticky MAC', render:renderC9PortSec, mount:mountC9PortSec },
      { id:'c9l3m3', title:'Violation actions', render:renderC9Violation, mount:mountC9Violation }
    ]},
    { id:'c9l4', title:'VLAN hopping', taskId:'ch-vlanhop', quizId:'c9q_l4', modules:[ // hands-on task: switch spoofing via a dynamic (DTP) port → fix by pinning to an access VLAN
      { id:'c9l4m1', title:'Double tagging', render:renderC9DoubleTag, mount:mountC9DoubleTag },
      { id:'c9l4m2', title:'DTP and switch spoofing', render:renderC9Dtp, mount:mountC9Dtp },
      { id:'c9l4m3', title:'Defending against hopping', render:renderC9VlanDefend, mount:mountC9VlanDefend }
    ]},
    { id:'c9l5', title:'DHCP and ARP defense', taskId:'ch-roguedhcp', quizId:'c9q_l5', modules:[ // hands-on task: rogue DHCP + ARP spoofing → defense with DHCP snooping (trust) and DAI
      { id:'c9l5m1', title:'Rogue DHCP (MITM)', render:renderC9RogueDhcp, mount:mountC9RogueDhcp },
      { id:'c9l5m2', title:'DHCP snooping', render:renderC9DhcpSnoop, mount:mountC9DhcpSnoop },
      { id:'c9l5m3', title:'Dynamic ARP Inspection', render:renderC9Dai, mount:mountC9Dai }
    ]},
    { id:'c9l6', title:'Protecting Spanning Tree', taskId:'bpdu-guard', quizId:'c9q_l6', modules:[
      { id:'c9l6m1', title:'Rogue root and BPDU attack', render:renderC9RogueRoot, mount:mountC9RogueRoot },
      { id:'c9l6m2', title:'PortFast and BPDU Guard', render:renderC9BpduGuard, mount:mountC9BpduGuard },
      { id:'c9l6m3', title:'Root Guard', render:renderC9RootGuard, mount:mountC9RootGuard }
    ]},
    { id:'c9l7', title:'Operations and synthesis', taskId:'dot1x-wired', quizId:'c9q_l7', modules:[
      { id:'c9l7m1', title:'SPAN and monitoring', render:renderC9Span, mount:mountC9Span },
      { id:'c9l7m4', title:'The port’s physical layer', render:renderC9Phy, mount:mountC9Phy },
      { id:'c9l7m2', title:'Link aggregation', render:renderC9Agg, mount:mountC9Agg },
      { id:'c9l7m3', title:'A secured L2 and what’s next', render:renderC9Wrap, mount:mountC9Wrap }
    ]}
  ]
};
const COURSE_9_QUIZZES_DEF = {
  c9q_l1:{ title:'Quiz: How a switch forwards', qs:[
    { q:'How does a switch build its <b>MAC table</b>?',
      opts:['it reads the source MAC of incoming frames and remembers which port it saw it on','it reads the destination IPs inside packets and computes the shortest possible path from them','it gets the whole table fully pre-configured by hand from the network admin'],
      correct:0, why:'A switch learns from the source MAC (who is on which port) and delivers by the destination MAC. It doesn’t read IP at all – that’s L2.' },
    { q:'What does a switch do when it <b>doesn’t know</b> a frame’s destination MAC?',
      opts:['it floods it to all ports except the ingress (unknown unicast flooding)','it just quietly drops it altogether and makes no further attempt to deliver it','it returns the whole frame straight back to the sender with a "destination not found"'],
      correct:0, why:'A switch doesn’t drop an unknown destination MAC – it floods the frame everywhere (except the ingress) and learns the port from the reply.' },
    { q:'Why do the <b>aging timer</b> and MAC table capacity matter?',
      opts:['idle MACs are removed; and when the table fills, the switch starts flooding – which a CAM overflow attack abuses','together both of these markedly speed up the internet connection for all devices in the network','both serve only to let the switch reliably encrypt absolutely all the frames that pass through it between the individual ports'],
      correct:0, why:'Aging keeps the table current; the limited capacity is a weakness though – a full switch floods everything, enabling eavesdropping (lesson 3).' }
  ]},
  c9q_l2:{ title:'Quiz: Frame and 802.1Q', qs:[
    { q:'What in the frame does a switch decide by?',
      opts:['by the destination and source MAC addresses (L2) – not the IP inside','by the source and destination IP address inside every transferred packet','by the source and destination TCP port number of the given network service'],
      correct:0, why:'A switch is an L2 device: destination MAC = where to deliver, source MAC = what to learn from. IP is the router’s job.' },
    { q:'What is the <b>802.1Q</b> tag for?',
      opts:['it inserts a VLAN ID into the frame so a trunk carries several VLANs and the switch knows where the frame belongs','it inserts the MAC address of the next switch on the path into the frame so the trunk knows whom to hand it to','it adds a checksum to the frame, by which its possible corruption during transfer is detected'],
      correct:0, why:'Tagging happens only between switches on a trunk; the access port to an end device is always untagged.' },
    { q:'What is the <b>native VLAN</b> and why be careful with it?',
      opts:['the VLAN whose frames go untagged on a trunk; it must match on both ends, otherwise leaks and VLAN hopping threaten','it is a special dedicated VLAN that is meant exclusively just for connecting the whole company network out to the public internet','it is by far the very fastest VLAN of all the configured ones, and so all the priority frames are sent over it'],
      correct:0, why:'A mismatched native VLAN sends untagged frames into the wrong VLAN; it’s also the target of double-tagging hopping.' }
  ]},
  c9q_l3:{ title:'Quiz: Port security', qs:[
    { q:'How does the <b>MAC flooding / CAM overflow</b> attack work?',
      opts:['a flood of fake source MACs overflows the CAM table → the switch floods everything and the attacker sniffs','it gradually and systematically overloads the edge router’s CPU with so many requests that it stops coping entirely','by brute force it gradually and patiently guesses the administrator login password to the target switch itself'],
      correct:0, why:'A full switch behaves like a hub – it floods even traffic that wouldn’t reach the attacker. The defense is port security.' },
    { q:'What does <b>port security</b> with <b>sticky MAC</b> do?',
      opts:['it limits the number of MACs on a port and locks the first learned MAC – another won’t pass','it stores the allowed MAC addresses in the DHCP binding table and checks them against ARP replies','it markedly speeds up the given port and immediately doubles its transfer throughput'],
      correct:0, why:'That kills MAC flooding (it can’t fill the table via one port) and swapping a foreign PC into the socket.' },
    { q:'What are the three port-security <b>violation actions</b>?',
      opts:['protect (silent drop), restrict (drop + log), shutdown (disable the port) – the default is shutdown','to permit all traffic, deny it, or slow it down and limit it','they are three severity levels: low, medium and high'],
      correct:0, why:'The choice trades security vs uptime: shutdown is safest but harsh, protect/restrict don’t interrupt traffic.' }
  ]},
  c9q_l4:{ title:'Quiz: VLAN hopping', qs:[
    { q:'How does VLAN hopping via <b>double tagging</b> work?',
      opts:['the attacker (in the native VLAN) sends a frame with two 802.1Q tags; the first switch strips the outer (native), the second delivers to the victim VLAN','the attacker simply physically plugs two network cables into two different switches at once and thereby quietly joins both separate VLANs together','the attacker very quickly sends two entirely separate packets right one after another and thereby confuses the target switch so much that it passes both'],
      correct:0, why:'It’s one-way and works only from the native VLAN – which is why the native VLAN is made dedicated and unused.' },
    { q:'What is <b>switch spoofing</b> via <b>DTP</b>?',
      opts:['the attacker pretends to be a switch, negotiates a trunk and suddenly sees all VLANs','the attacker somehow steals and then misuses the target switch’s MAC address','the attacker overloads it with requests and thereby hard-shuts the whole target switch off'],
      correct:0, why:'Once a trunk forms, it carries all VLANs. So DTP is disabled and end-device ports are hard-set as access.' },
    { q:'How is VLAN hopping <b>defended</b>?',
      opts:['disable DTP (hard access), a dedicated unused native VLAN, trunk pruning, disabled unused ports','it suffices to enable and configure as many different VLANs on the switch as possible, even several dozen','it suffices to add a second switch and split both VLANs between them'],
      correct:0, why:'Port hygiene closes both variants: switch spoofing (DTP off) and double tagging (a clean native VLAN).' }
  ]},
  c9q_l5:{ title:'Quiz: DHCP and ARP defense', qs:[
    { q:'What does a <b>rogue DHCP</b> attack do?',
      opts:['a rogue DHCP server hands the client itself as the default gateway → the victim’s traffic flows through the attacker (MITM)','it permanently deletes the genuine DHCP server from the network, so nobody else gets any IP address','it markedly and very noticeably speeds up the whole automatic assignment of IP addresses to absolutely all newly connected clients in the network'],
      correct:0, why:'The client has no idea – it got "an IP and gateway" as always. So DHCP replies must be verified (DHCP snooping).' },
    { q:'How does <b>DHCP snooping</b> work?',
      opts:['it accepts DHCP replies only from trusted ports; drops them from untrusted, and builds a MAC+IP+port binding table','it authenticates DHCP clients by a password the admin set for them beforehand and rejects requests without the right password','it automatically assigns all the devices in the network one and the same IP address and default gateway'],
      correct:0, why:'Trusted = the uplink to the real DHCP. Rogue DHCP on an untrusted port is dropped. The binding table is then used by DAI.' },
    { q:'What does <b>Dynamic ARP Inspection (DAI)</b> protect against?',
      opts:['against ARP spoofing – it checks ARP against the binding table and drops forged ones (mismatched MAC+IP)','it protects mainly against dangerous viruses and malicious code hidden in the attachments of incoming emails','it protects the link running between two switches against its overload and saturation by too large an amount of traffic'],
      correct:0, why:'DAI builds on the DHCP-snooping binding table – that pair together protects against MITM via ARP.' }
  ]},
  c9q_l6:{ title:'Quiz: Protecting STP', qs:[
    { q:'What is a <b>rogue root</b> attack on Spanning Tree?',
      opts:['the attacker uses forged low-priority BPDUs to declare their switch the root → traffic reroutes through them','the attacker permanently and entirely irreversibly deletes the Spanning Tree protocol from the whole network, so it stops protecting against loops','the attacker switches all the ports on the switches into a faster mode just to gain higher throughput'],
      correct:0, why:'STP elects the root by the lowest bridge ID; the attacker abuses this to pull traffic to themselves. The defense: BPDU Guard and Root Guard.' },
    { q:'What does <b>BPDU Guard</b> do?',
      opts:['on a PortFast access port, any incoming BPDU instantly disables the port (err-disabled)','on absolutely all the switch’s ports without any exception it permanently and irreversibly blocks all the passing traffic','it markedly speeds up Spanning Tree convergence right after a link fails'],
      correct:0, why:'On a port to an end PC no BPDUs are expected – if one arrives, a switch/attacker is there, and the port is disabled.' },
    { q:'How does <b>Root Guard</b> differ from BPDU Guard?',
      opts:['Root Guard on a trunk to another switch blocks "superior" BPDUs (the neighbor can’t become root); BPDU Guard protects access ports','Root Guard protects access ports to end PCs, whereas BPDU Guard watches the root-bridge election on a trunk to another switch','on a superior BPDU, Root Guard permanently disables the port (err-disabled), so the admin must re-enable it by hand'],
      correct:0, why:'Root Guard pins where the root may come from (toward the backbone); on a superior BPDU it puts the port in root-inconsistent (blocking).' }
  ]},
  c9q_l7:{ title:'Quiz: Operations and synthesis', qs:[
    { q:'What is <b>SPAN</b> (port mirroring) for?',
      opts:['it sends a copy of traffic to a monitor port – for an analyzer or an off-path IDS','it markedly and very noticeably speeds up the given port and immediately doubles its throughput','it redirects all the port’s traffic onto a backup link whenever the original port gets congested'],
      correct:0, why:'The original flows on; SPAN only mirrors a copy. That’s how an IDS can watch traffic without being in the path (the Advanced security course).' },
    { q:'What does <b>PoE (Power over Ethernet)</b> enable?',
      opts:['sending power over the data cable too – a phone/camera/AP runs without a separate socket','automatically negotiating the link speed and duplex by the type of connected end device','powering even beefier devices such as servers or desktop computers over the data cable'],
      correct:0, why:'One ethernet cable brings data and power – a practical reality of the access layer.' },
    { q:'Why is the <b>access layer</b> (where the switch sits) security-critical?',
      opts:['it’s the first place an attacker physically reaches – so it’s hardened: port security, snooping, DAI, BPDU/Root Guard','on the contrary it is the layer most distant from end users, so there is no need to protect it in any special way','in reality it has no fundamental importance or any significant role at all from the point of view of the overall security of the whole network'],
      correct:0, why:'Most L2 attacks aim here. So the set of L2 defenses (this lesson) is the first line of security.' }
  ]}
};
const COURSE_9_FINAL_EXTRA_DEF=[{ q:'An attacker floods a switch with fake MAC addresses. What does it cause, and what stops it?', opts:['the CAM table overflows → the switch floods and the attacker sniffs; port security stops it','the switch hard-reboots itself over the flood and wipes absolutely all its VLAN settings','all the traffic gets automatically encrypted, so the attacker ends up gaining nothing useful'], correct:0, why:'When the CAM table fills, the switch doesn’t know where to send unicast and starts flooding to all ports – the attacker then sniffs. Port security caps MACs per port and stops it.' },{ q:'How does double-tagging VLAN hopping work, and what stops it?', opts:['two 802.1Q tags: the first switch strips the native, the second delivers to a foreign VLAN; a dedicated native stops it','the attacker somehow steals the switch’s MAC address and thereby switches itself over to another VLAN','two entirely separate packets sent right after each other confuse the target switch so much it finally passes both'], correct:0, why:'An attacker in the native VLAN sends a frame with two tags. The first switch strips the outer (native), the second delivers it by the inner tag to the victim VLAN. A dedicated unused native VLAN and disabled DTP help.' },{ q:'Which two access-switch defenses handle rogue DHCP/ARP and a foreign switch in the socket?', opts:['DHCP snooping + DAI against MITM, and BPDU Guard that shuts the port on a BPDU','install a stronger antivirus right on the switch and also set noticeably longer login passwords','get a faster uplink and configure as many different VLANs on the switch as possible'], correct:0, why:'DHCP snooping allows DHCP only from trusted ports and builds a binding table; DAI checks ARP against it and drops forgeries. BPDU Guard shuts an access port on a BPDU – a foreign switch does no harm.' }];
__regCourse(9,COURSE_9_DEF,COURSE_9_QUIZZES_DEF,COURSE_9_FINAL_EXTRA_DEF);
