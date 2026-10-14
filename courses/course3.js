/* course3.js — Course 3 content (split out of course.js; loaded on demand via course-core.js) */
/* ============================================================
   COURSE 3 — Switching and VLANs (practice: build and configure)
   ============================================================ */
// L1M1 — An office without walls (motivational: on a flat network everyone can reach everyone)
function renderC3OfficeNoWalls(){
  const svg='<svg id="c3owsvg" viewBox="0 0 640 230" width="100%" style="display:block">'
    +'<line x1="93.4" y1="53" x2="297.7" y2="106.3" style="stroke:var(--line2);stroke-width:1.2;stroke-dasharray:2 3"/><line x1="93.5" y1="163.6" x2="297.6" y2="117.1" style="stroke:var(--line2);stroke-width:1.2;stroke-dasharray:2 3"/><line x1="546.6" y1="53" x2="342.3" y2="106.3" style="stroke:var(--line2);stroke-width:1.2;stroke-dasharray:2 3"/><line x1="546.5" y1="163.6" x2="342.4" y2="117.1" style="stroke:var(--line2);stroke-width:1.2;stroke-dasharray:2 3"/><line x1="320" y1="174" x2="320" y2="135" style="stroke:var(--line2);stroke-width:1.2;stroke-dasharray:2 3"/>'
    +'<g id="c3owglow"></g>'
    +csDev(320,112,'l2switch','SWITCH')
    +csHost(74,48,'laptop','--green','guest')+csHost(74,168,'printer','--cyan','printer')+csHost(566,48,'server','--amber','accounting')+csHost(566,168,'db','--red','database')+csHost(320,190,'iot','--violet','smart bulb')
    +'<g id="c3owdyn"></g></svg>';
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'Let’s start with the <b>problem</b>, not the technology. Most small companies never designed their network – as they grew, whatever came along was simply plugged into one switch: staff laptops, a guest laptop, the printer, the accounting server, the database, cameras and a smart bulb in the meeting room. It works – but it created something dangerous: one big <b>flat network</b> where <b>no boundary</b> separates the devices. Anyone can reach anyone. Click through to see what can talk to what (and absolutely shouldn’t).'+'</p>'
    +'<div class="osi-stage">'+svg+'</div>'
    +'<div class="m1-cap" id="c3owcap"></div>'
    +courseStepControls('c3ow')
    +abbrBox([['flat network','one large undivided network – every device can reach every other.'],['blast radius','how far an attacker gets from one hacked device; in a flat network, practically everywhere.'],['segmentation','splitting a network into smaller separate parts – the solution this lesson is heading toward.']]);
}
function mountC3OfficeNoWalls(){
  // [cx, cy, switch-entry x, switch-entry y] per device — traffic follows the cables THROUGH the switch
  const D={ntb:[74,48,297.7,106.3],ucto:[566,48,342.3,106.3],tisk:[74,168,297.6,117.1],db:[566,168,342.4,117.1],iot:[320,190,320,135]}; // switch entry points on the edge of the glow circle (r=23), not inside
  const RAD=20,rp=n=>{const dx=n[2]-n[0],dy=n[3]-n[1],d=Math.hypot(dx,dy)||1;return [n[0]+dx*RAD/d,n[1]+dy*RAD/d];}; // both the link and the packet start on the node's circle (r=20), not at its center
  function reach(src,dst){
    const s=D[src],d=D[dst],sr=rp(s),dr=rp(d);
    const path='M'+sr[0]+' '+sr[1]+' L'+s[2]+' '+s[3]+' L'+d[2]+' '+d[3]+' L'+dr[0]+' '+dr[1];
    const cab=(x1,y1,x2,y2)=>'<line x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'" style="stroke:var(--red);stroke-width:2.4;opacity:.55"/>';
    const pkt='<rect x="-7" y="-5" width="14" height="10" rx="2" style="fill:var(--red)"><animateMotion path="'+path+'" dur="'+CRS_DUR+'" repeatCount="indefinite"/></rect>';
    return {glow:csGlow(s[0],s[1],'--red')+csGlow(320,112,'--red',23)+csGlow(d[0],d[1],'--red'), dyn:cab(sr[0],sr[1],s[2],s[3])+cab(d[2],d[3],dr[0],dr[1])+pkt};
  }
  const R=(r,cap)=>({glow:r.glow,dyn:r.dyn,cap:cap});
  const STEPS=[
    {glow:'',dyn:'', cap:'One flat network: <b>guest, printer, accounting, database and a smart bulb</b> – all in one switch, nothing between them. It grew this way over time; nobody “drew it up” like this.'},
    R(reach('ntb','ucto'), 'A visitor connects to the network. Their laptop – possibly carrying malware they don’t know about – can <b>scan the whole network</b>, try logging into shared drives and reach the <b>accounting server</b>. This (not a clever hack, just a flat network) is how many breaches start.'),
    R(reach('iot','db'), 'A <b>smart bulb</b> or IP camera often has weak security and rarely gets firmware updates. Yet on a flat network it sits <b>right next to the database</b> – if someone takes it over (often easy with IoT), they have a path to company data from there.'),
    R(reach('tisk','ucto'), 'Even the <b>printer</b> can “see” accounting. It doesn’t need to, but nothing stops it. Every extra device on a flat network = another possible entry point through which an attack spreads.'),
    {glow:'',dyn:'', cap:'Bottom line: on a flat network <b>everyone sees everyone</b> – no boundaries. So one hacked device reaches practically everything (a large <b>blast radius</b>). The next module breaks this into three concrete problems – security, performance and chaos.'}
  ];
  function show(i){const g=$('c3owglow');if(g)g.innerHTML=STEPS[i].glow||'';const d=$('c3owdyn');if(d)d.innerHTML=STEPS[i].dyn;const c=$('c3owcap');if(c)c.innerHTML='<span>'+STEPS[i].cap+'</span>';}
  courseStepper('c3ow',STEPS.length,show);
}
// L1M2 — Three problems of one big network (security / performance / chaos)
function renderC3ThreeProblems(){
  const svg='<svg id="c3prsvg" viewBox="0 0 640 196" width="100%" style="display:block">'
    +'<line x1="93.5" y1="48.3" x2="300.5" y2="93.7" style="stroke:var(--line2);stroke-width:1.2;stroke-dasharray:2 3"/><line x1="93.5" y1="147.7" x2="300.5" y2="102.3" style="stroke:var(--line2);stroke-width:1.2;stroke-dasharray:2 3"/><line x1="546.5" y1="48.3" x2="339.5" y2="93.7" style="stroke:var(--line2);stroke-width:1.2;stroke-dasharray:2 3"/><line x1="546.5" y1="147.7" x2="339.5" y2="102.3" style="stroke:var(--line2);stroke-width:1.2;stroke-dasharray:2 3"/>'
    +'<g id="c3prglow"></g>'
    +csDev(320,98,'l2switch','SWITCH')
    +csHost(74,44,'laptop','--green','PC')+csHost(566,44,'server','--amber','SRV')+csHost(74,152,'iot','--cyan','IoT')+csHost(566,152,'desktop','--violet','PC2')
    +'<g id="c3prdyn"></g></svg>';
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'One big flat network brings <b>three concrete problems</b>, and each costs a company real money and headaches: <b>security</b> (who can reach whom), <b>performance</b> (traffic "for everyone" burdens even those it doesn’t affect) and <b>chaos</b> (nobody knows what’s actually running on the network). We’ll go through them one by one, with concrete situations.'+'</p>'
    +'<div class="osi-stage">'+svg+'</div>'
    +'<div class="m1-cap" id="c3prcap"></div>'
    +courseStepControls('c3pr')
    +abbrBox([['blast radius','how far an attack from one hacked device reaches – on a flat network, everywhere.'],['lateral movement','an attacker spreading sideways through the network – from a hacked PC to a server, then on.'],['broadcast','"to everyone" traffic on the network – on a flat network literally everyone gets it.']]);
}
function mountC3ThreeProblems(){
  const D={pc:[74,44,300.5,93.7],srv:[566,44,339.5,93.7],iot:[74,152,300.5,102.3],pc2:[566,152,339.5,102.3]};
  const RAD=20,rp=n=>{const dx=n[2]-n[0],dy=n[3]-n[1],d=Math.hypot(dx,dy)||1;return [n[0]+dx*RAD/d,n[1]+dy*RAD/d];}; // both the link and the packet start on the node's circle (r=20), not at its center
  const cab=(x1,y1,x2,y2,c)=>'<line x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'" style="stroke:var('+c+');stroke-width:2.3;opacity:.55"/>';
  const pkt=(p,c,dur)=>'<rect x="-6" y="-4.5" width="13" height="9" rx="2" style="fill:var('+c+')"><animateMotion path="'+p+'" dur="'+(dur||CRS_DUR)+'" repeatCount="indefinite"/></rect>';
  function reach(src,dst,c){const s=D[src],d=D[dst],sr=rp(s),dr=rp(d);const p='M'+sr[0]+' '+sr[1]+' L'+s[2]+' '+s[3]+' L'+d[2]+' '+d[3]+' L'+dr[0]+' '+dr[1];return {glow:csGlow(s[0],s[1],c)+csGlow(320,98,c,22)+csGlow(d[0],d[1],c),dyn:cab(sr[0],sr[1],s[2],s[3],c)+cab(d[2],d[3],dr[0],dr[1],c)+pkt(p,c)};}
  function flood(src,c){const s=D[src],sr=rp(s);let dyn=cab(sr[0],sr[1],s[2],s[3],c)+pkt('M'+sr[0]+' '+sr[1]+' L'+s[2]+' '+s[3],c);let glow=csGlow(s[0],s[1],c)+csGlow(320,98,c,22);Object.keys(D).forEach(function(k){if(k===src)return;const d=D[k],dr=rp(d);dyn+=cab(d[2],d[3],dr[0],dr[1],c)+pkt('M'+d[2]+' '+d[3]+' L'+dr[0]+' '+dr[1],c);glow+=csGlow(d[0],d[1],c);});return {glow:glow,dyn:dyn};}
  const q=(x,y)=>'<text x="'+x+'" y="'+y+'" text-anchor="middle" style="font:800 13px var(--mono);fill:var(--amber)">?</text>';
  const R=(r,cap,extra)=>({glow:r.glow,dyn:r.dyn+(extra||''),cap:cap});
  const STEPS=[
    R(reach('pc','srv','--red'), '<b>1) Security.</b> A hacked PC <b>reaches the server through the switch</b> – nothing is in its way. One piece of malware can <b>work its way across the whole network</b> (lateral movement): from a PC to a shared drive, then a server, then the database. It spreads not because the attacker is clever, but because the network has no internal boundaries.', '<text x="74" y="16" text-anchor="middle" style="font:700 7.5px var(--sans);fill:var(--red)">'+esc('hacked')+'</text>'),
    R(flood('pc','--amber'), '<b>2) Performance.</b> Some traffic doesn’t go to one receiver but to <b>everyone</b> (a broadcast – e.g. "who has this IP?"). The switch floods it to all ports. A few devices won’t notice, but on a network with hundreds of devices there are so many broadcasts that every device and switch processes lots of messages that <b>don’t concern it at all</b> – the network gets "noisy" and slows down.'),
    // the bottom ? next to the icons (outside) – at y=184 it collided with the IoT/PC2 labels
    {glow:'',dyn:q(74,20)+q(566,20)+q(38,158)+q(602,158), cap:'<b>3) Chaos.</b> On a large flat network, over time <b>nobody really knows</b> what runs on it and who talks to whom. A device is added here, another there – and a year later it’s hard to tell what is what, harder to manage and harder still to watch. Without segmentation you have neither overview nor control.'}
  ];
  function show(i){const g=$('c3prglow');if(g)g.innerHTML=STEPS[i].glow||'';const d=$('c3prdyn');if(d)d.innerHTML=STEPS[i].dyn;const c=$('c3prcap');if(c)c.innerHTML='<span>'+STEPS[i].cap+'</span>';}
  courseStepper('c3pr',STEPS.length,show);
}
// L1M3 — The physical fix (three switches, three cables): it works, but it is expensive and inflexible
function renderC3PhysicalFix(){
  const grp=(x,c)=>'<line x1="'+(x-22)+'" y1="54" x2="'+(x-11)+'" y2="120" style="stroke:var(--line2);stroke-width:1.3"/><line x1="'+(x+22)+'" y1="54" x2="'+(x+11)+'" y2="120" style="stroke:var(--line2);stroke-width:1.3"/>'
    +csHost(x-22,42,'desktop',c)+csHost(x+22,42,'desktop',c)+csDev(x,130,'l2switch','',1.05);
  const svg='<svg id="c3phsvg" viewBox="0 0 640 196" width="100%" style="display:block">'
    +grp(130,'--green')+grp(320,'--amber')+grp(510,'--cyan')
    +'<text x="130" y="166" text-anchor="middle" style="font:600 8px var(--sans);fill:var(--muted)">'+'offices'+'</text><text x="320" y="166" text-anchor="middle" style="font:600 8px var(--sans);fill:var(--muted)">'+'servers'+'</text><text x="510" y="166" text-anchor="middle" style="font:600 8px var(--sans);fill:var(--muted)">'+'guests'+'</text>'
    +'<g id="c3phdyn"></g></svg>';
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'How do you split a network? The simplest idea is <b>physically</b>: for each group (offices, servers, guests) <b>buy its own switch</b> and run its own cabling. The groups are then truly separated – no wire runs between them, so they can’t see each other. How a network is actually <b>wired</b> is called the <b>physical topology</b>. It works perfectly… but at what cost, and how flexibly?'+'</p>'
    +'<div class="osi-stage">'+svg+'</div>'
    +'<div class="m1-cap" id="c3phcap"></div>'
    +courseStepControls('c3ph')
    +abbrBox([['physical topology','how a network is actually wired – which cables and switches go where.'],['logical topology','how devices are grouped and who can talk to whom; need not match the physical wiring – which is exactly what VLANs enable.'],['segmentation','splitting a network into smaller separate parts (physically = more switches, logically = VLANs).']]);
}
function mountC3PhysicalFix(){
  const cost=(x)=>'<text x="'+x+'" y="100" text-anchor="middle" style="font:800 12px var(--mono);fill:var(--red)">$</text>';
  const costAll=cost(130)+cost(320)+cost(510);
  const sw4='<text x="320" y="186" text-anchor="middle" style="font:700 8px var(--sans);fill:var(--red)">'+esc('4th group (cameras) → 4th switch + more cables')+'</text>';
  const vlanNote='<text x="320" y="186" text-anchor="middle" style="font:700 8px var(--sans);fill:var(--cyan)">'+esc('→ VLAN: one switch, separation by config alone')+'</text>';
  const STEPS=[
    {dyn:'', cap:'Three groups = <b>three switches</b> and three sets of cables. Offices, servers and guests are physically <b>separated</b> – no wire runs between them. This is the <b>physical topology</b>: a split you literally see in the cabling. And it <b>works</b> – no one in one group can reach another.'},
    {dyn:costAll, cap:'The cost: <b>3× hardware + 3× cabling</b>. And the switches are often <b>half-empty</b> – you buy three 24-port switches but use maybe 6 ports each. You pay for 72 ports and use 18. The more groups, the more boxes, cables and rack space.'},
    {dyn:costAll+sw4, cap:'And above all <b>inflexible</b>: when an employee moves to a different part of the office, you have to <b>physically re-cable</b> them to another switch (maybe even move their desk). A new group, say cameras? <b>Buy a fourth switch.</b>'},
    {dyn:costAll+vlanNote, cap:'Notice: here the <b>physical wiring = the network split</b> – physical and logical topology are the same. A <b>VLAN</b> does the same split <b>logically on ONE switch</b>: it separates groups by <b>port configuration</b> alone, not wires. Moving a person = re-assign the port’s VLAN (seconds), not pulling cables. That’s the <b>logical topology</b> – and it’s the next lesson.'}
  ];
  function show(i){const d=$('c3phdyn');if(d)d.innerHTML=STEPS[i].dyn;const c=$('c3phcap');if(c)c.innerHTML='<span>'+STEPS[i].cap+'</span>';}
  courseStepper('c3ph',STEPS.length,show);
}
function renderC3WhyVlan(){
  const svg='<svg id="c3bdsvg" viewBox="0 0 700 202" width="100%" style="display:block">'
    +'<line x1="80" y1="101" x2="300" y2="101" style="stroke:var(--line2);stroke-width:1.4"/>'
    +'<line x1="339.5" y1="96.4" x2="560.5" y2="44.6" style="stroke:var(--line2);stroke-width:1;stroke-dasharray:2 3"/><line x1="340" y1="101" x2="560" y2="101" style="stroke:var(--line2);stroke-width:1;stroke-dasharray:2 3"/><line x1="339.5" y1="105.6" x2="560.5" y2="157.4" style="stroke:var(--line2);stroke-width:1;stroke-dasharray:2 3"/>'
    +'<g id="c3bdglow"></g>'
    +csDev(320,101,'l2switch','SWITCH')
    +csHost(60,101,'laptop','--green','A')+csHost(580,40,'desktop','--cyan','B')+csHost(580,101,'desktop','--cyan','C')+csHost(580,162,'desktop','--cyan','D')
    +'<g id="c3bddyn"></g></svg>';
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'A switch forwards frames by <b>MAC address</b> (you know MAC and IP addresses from the How networks work course: a MAC is a device’s factory label, an IP its postal address) – it never looks at IP (that’s the router’s job). But some frames have no single receiver: their destination is the <b>"to everyone"</b> address and they’re called <b>broadcasts</b> (typically an ARP request, "who has this IP?"). That "to everyone" address is also a <b>MAC</b> (ff:ff:ff:ff:ff:ff) – the target IP being looked up sits <b>inside</b> the request, which the switch doesn’t read. The switch recognizes that "to everyone" address and <b>floods the frame to all ports</b> – still by address, not by content. The set of devices a broadcast reaches is a <b>broadcast domain</b>. In one large <b>flat</b> network it is huge: every broadcast disturbs everyone, there is more and more of it, and anyone can <b>see</b> it (including sensitive things). The fix is to <b>split</b> the network – which is exactly what <b>VLANs</b> do (next module).'+'</p>'
    +'<div class="osi-stage">'+svg+'</div>'
    +'<div class="m1-cap" id="c3bdcap"></div>'
    +courseStepControls('c3bd')
    +abbrBox([['broadcast','a message meant for everyone on the local network at once (not a single receiver).'],['broadcast domain','the set of devices a broadcast reaches – in a flat network, that’s everyone.'],['flat network','one large undivided network – everyone in a single broadcast domain.']]);
}
function mountC3WhyVlan(){
  const toSw=csPkt('M80 101 L300 101','--green');
  const litRed='<line x1="339.5" y1="96.4" x2="560.5" y2="44.6" style="stroke:var(--red);stroke-width:2.4;opacity:.55"/><line x1="340" y1="101" x2="560" y2="101" style="stroke:var(--red);stroke-width:2.4;opacity:.55"/><line x1="339.5" y1="105.6" x2="560.5" y2="157.4" style="stroke:var(--red);stroke-width:2.4;opacity:.55"/>';
  const flood=csPkt('M340 101 L560 44','--red')+csPkt('M340 101 L560 101','--red')+csPkt('M340 101 L560 158','--red');
  const tag=(y,t,c)=>'<text x="608" y="'+y+'" style="font:700 7.5px var(--sans);fill:var('+c+')">'+esc(t)+'</text>';
  const tagsGot=tag(34,'got it','--red')+tag(99,'got it','--red')+tag(164,'got it','--red');
  const tagsSee=tag(34,'⚠ sees it','--red')+tag(99,'⚠ sees it','--red')+tag(164,'⚠ sees it','--red');
  const glow1=csGlow(60,101,'--green')+csGlow(320,101,'--green',23);
  const glow2=csGlow(60,101,'--green')+csGlow(320,101,'--red',23)+csGlow(580,40,'--red')+csGlow(580,101,'--red')+csGlow(580,162,'--red');
  const STEPS=[
    {glow:glow1, dyn:toSw, cap:'<b>A</b> sends a <b>broadcast</b> – a frame whose destination is the "to everyone" address (e.g. ARP "who has this IP?"). It reaches the switch.'},
    {glow:glow2, dyn:litRed+flood+tagsGot, cap:'The switch <b>floods it to all ports</b> → <b>B, C and D</b> all get it. This group = the <b>broadcast domain</b>.'},
    {glow:glow2, dyn:litRed+flood+tagsSee, cap:'In a <b>flat</b> network this domain is huge: more noise and <b>everyone sees</b> foreign traffic. Fix: split it into <b>VLANs</b> (next module).'}
  ];
  function show(i){const g=$('c3bdglow');if(g)g.innerHTML=STEPS[i].glow||'';const d=$('c3bddyn');if(d)d.innerHTML=STEPS[i].dyn;const c=$('c3bdcap');if(c)c.innerHTML='<span>'+STEPS[i].cap+'</span>';}
  courseStepper('c3bd',STEPS.length,show);
}
function renderC3VlanConcept(){
  const svg='<svg id="c3vlsvg" viewBox="0 0 640 210" width="100%" style="display:block">'
    +'<text x="150" y="16" text-anchor="middle" style="font:700 9px var(--mono);fill:var(--blue)">VLAN 10</text>'
    +'<text x="490" y="16" text-anchor="middle" style="font:700 9px var(--mono);fill:var(--amber)">VLAN 20</text>'
    +'<g id="c3vlglow"></g>'
    +'<line x1="83.6" y1="61.8" x2="297.4" y2="103.6" style="stroke:var(--blue);stroke-width:1.6"/><line x1="83.6" y1="157.9" x2="300.4" y2="112.1" style="stroke:var(--blue);stroke-width:1.6"/>'
    +'<line x1="342.6" y1="103.6" x2="556.4" y2="61.8" style="stroke:var(--amber);stroke-width:1.4;stroke-dasharray:2 3;opacity:.5"/><line x1="339.6" y1="112.1" x2="556.4" y2="157.9" style="stroke:var(--amber);stroke-width:1.4;stroke-dasharray:2 3;opacity:.5"/>'
    +csDev(320,108,'l2switch','SWITCH')
    +csHost(64,58,'desktop','--blue','A')+csHost(64,162,'desktop','--blue','B')+csHost(576,58,'desktop','--amber','C')+csHost(576,162,'desktop','--amber','D')
    +'<g id="c3vldyn"></g></svg>';
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'A <b>VLAN</b> (Virtual LAN) is a <b>logical network</b> built on top of the physical switches. One switch carries <b>several separate networks</b> at once – as if you had several standalone switches, but it’s just one. Each port gets a <b>VLAN number</b> (e.g. 10 or 20) and the device on it belongs to that VLAN. Devices in <b>different VLANs cannot see each other</b> – their broadcasts are separated (each VLAN = its own broadcast domain). This splits a large flat network into smaller ones: offices apart, cameras apart, guests apart – for <b>security, performance and order</b>. (How a VLAN is assigned to a port is the next lesson: access and trunk.)'+'</p>'
    +'<div class="osi-stage">'+svg+'</div>'
    +'<div class="m1-cap" id="c3vlcap"></div>'
    +courseStepControls('c3vl')
    +abbrBox([['VLAN','a logical network on shared switches; each VLAN = its own (separated) broadcast domain.'],['VLAN ID','the VLAN number (1–4094), e.g. 10 or 20 – distinguishes the VLANs.']]);
}
function mountC3VlanConcept(){
  const tag=(x,y,t,c)=>'<text x="'+x+'" y="'+y+'" text-anchor="middle" style="font:700 7.5px var(--sans);fill:var('+c+')">'+esc(t)+'</text>';
  const blocked=tag(470,66,'✗ other VLAN','--muted')+tag(470,150,'✗ other VLAN','--muted');
  const litLineB='<line x1="300.4" y1="112.1" x2="83.6" y2="157.9" style="stroke:var(--blue);stroke-width:2.6;opacity:.7"/>';
  const glowAS=csGlow(64,58,'--blue')+csGlow(320,108,'--blue',23);
  const glowASB=glowAS+csGlow(64,162,'--blue');
  const STEPS=[
    {glow:glowAS, dyn:csPkt('M84 62 L300.4 104.2','--blue'), cap:'<b>A</b> (VLAN 10) sends a <b>broadcast</b> – it travels to the switch.'},
    {glow:glowASB, dyn:litLineB+csPkt('M300.4 112.1 L84 158','--blue')+blocked, cap:'The switch forwards it <b>only within VLAN 10</b> → <b>only B</b> gets it. <b>C and D</b> (VLAN 20) <b>do not</b> – they’re in another VLAN, as if hung off a completely different switch.'},
    {glow:glowASB, dyn:litLineB+blocked+'<text x="320" y="202" text-anchor="middle" style="font:700 8px var(--sans);fill:var(--muted)">'+esc('VLAN 10 and VLAN 20 = two separate broadcast domains')+'</text>', cap:'Each VLAN = <b>its own broadcast domain</b>. For VLAN 10 and 20 to talk at all, you need an <b>L3</b> device (a router / L3 switch) – that’s a later lesson.'}
  ];
  function show(i){const g=$('c3vlglow');if(g)g.innerHTML=STEPS[i].glow||'';const d=$('c3vldyn');if(d)d.innerHTML=STEPS[i].dyn;const c=$('c3vlcap');if(c)c.innerHTML='<span>'+STEPS[i].cap+'</span>';}
  courseStepper('c3vl',STEPS.length,show);
}
// L2M2 — How a switch knows where a packet belongs (port = VLAN; the switch does not pass between VLANs)
function renderC3VlanPorts(){
  const chip=(x,y,t,c)=>'<g><rect x="'+(x-25)+'" y="'+(y-9)+'" width="50" height="16" rx="4" style="fill:var('+c+');fill-opacity:.12;stroke:var('+c+');stroke-width:1"/><text x="'+x+'" y="'+(y+3)+'" text-anchor="middle" style="font:700 7px var(--mono);fill:var('+c+')">'+t+'</text></g>';
  const svg='<svg id="c3vpsvg" viewBox="0 0 640 214" width="100%" style="display:block">'
    +'<line x1="83.6" y1="60" x2="300.4" y2="104" style="stroke:var(--blue);stroke-width:1.5"/><line x1="83.6" y1="157.9" x2="300.4" y2="112.1" style="stroke:var(--blue);stroke-width:1.5"/><line x1="556.4" y1="60" x2="339.6" y2="104" style="stroke:var(--amber);stroke-width:1.5"/><line x1="556.4" y1="157.9" x2="339.6" y2="112.1" style="stroke:var(--amber);stroke-width:1.5"/>'
    +'<g id="c3vpglow"></g>'
    +csDev(320,108,'l2switch','SWITCH')
    +chip(262,86,'P1·V10','--blue')+chip(262,130,'P2·V10','--blue')+chip(378,86,'P3·V20','--amber')+chip(378,130,'P4·V20','--amber')
    +csHost(64,56,'desktop','--blue','A')+csHost(64,162,'desktop','--blue','B')+csHost(576,56,'desktop','--amber','C')+csHost(576,162,'desktop','--amber','D')
    +'<text x="320" y="206" text-anchor="middle" style="font:600 7.5px var(--sans);fill:var(--muted)">'+'physical ports (RJ-45) – a VLAN is assigned to the port, not to an IP'+'</text>'
    +'<g id="c3vpdyn"></g></svg>';
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'How does the switch <b>know</b> where each frame belongs? Simple: <b>every physical port is assigned to a VLAN</b> (P1 and P2 to VLAN 10, P3 and P4 to VLAN 20). Note – the VLAN sits on the <b>port (that RJ-45 socket)</b>, not on the device’s IP: whatever you plug into P1, it’s VLAN 10. The switch remembers each port’s VLAN and <b>will not pass traffic between different VLANs</b> – it acts as if they were two separate switches.'+'</p>'
    +'<div style="border-left:3px solid var(--violet);background:var(--violet-soft,rgba(139,92,246,.07));padding:8px 12px;margin:0 0 10px;border-radius:0 6px 6px 0;font-size:12px;line-height:1.5;color:var(--txt)">'+'Only a <b>managed switch</b> can do this – one where you can configure a port’s VLAN. A <b>dumb (unmanaged) switch</b> knows no VLANs: it takes a frame and forwards it, treating all ports the same. So VLANs require a managed switch.'+'</div>'
    +'<div class="osi-stage">'+svg+'</div>'
    +'<div class="m1-cap" id="c3vpcap"></div>'
    +courseStepControls('c3vp')
    +abbrBox([['physical port','an RJ-45 socket on the switch (P1, P2…). A VLAN is assigned to the port – not to a device’s IP.'],['managed switch','a switch you can configure (VLANs, trunk…). A dumb/unmanaged switch cannot.'],['VLAN ID','the VLAN number (1–4094) the switch groups ports by.']]);
}
function mountC3VlanPorts(){
  const grn=csPkt('M83.6 60 L300.4 104 L300.4 112.1 L83.6 157.9','--blue')+'<line x1="83.6" y1="60" x2="300.4" y2="104" style="stroke:var(--blue);stroke-width:2.6;opacity:.6"/><line x1="300.4" y1="112.1" x2="83.6" y2="157.9" style="stroke:var(--blue);stroke-width:2.6;opacity:.6"/>';
  const blk=csPkt('M84 56 L300.4 104','--blue')+'<line x1="83.6" y1="60" x2="300.4" y2="104" style="stroke:var(--blue);stroke-width:2.6;opacity:.6"/><text x="320" y="72" text-anchor="middle" style="font:800 22px var(--mono);fill:var(--red)">✕</text>';
  const gAB=csGlow(64,56,'--blue')+csGlow(320,108,'--blue',23)+csGlow(64,162,'--blue');
  const gAC=csGlow(64,56,'--blue')+csGlow(320,108,'--red',23);
  const STEPS=[
    {glow:'', dyn:'', cap:'Each <b>port</b> has its VLAN: <b>P1, P2 → VLAN 10</b>, <b>P3, P4 → VLAN 20</b>. The switch remembers this per port (not by IP).'},
    {glow:gAB, dyn:grn, cap:'<b>A → B</b>: both ports are in <b>VLAN 10</b> → the switch connects them. Same VLAN, no problem.'},
    {glow:gAC, dyn:blk, cap:'<b>A → C</b>: A’s port is in VLAN 10, C’s in VLAN 20 → the switch <b>STOPS</b> it. It won’t pass traffic between different VLANs.'}
  ];
  function show(i){const g=$('c3vpglow');if(g)g.innerHTML=STEPS[i].glow||'';const d=$('c3vpdyn');if(d)d.innerHTML=STEPS[i].dyn;const c=$('c3vpcap');if(c)c.innerHTML='<span>'+STEPS[i].cap+'</span>';}
  courseStepper('c3vp',STEPS.length,show);
}
// L2M3 — VLAN ID (numbers 1-4094, VLAN 1, named by role)
function renderC3VlanId(){
  const row=(y,id,c,lbl)=>'<g><rect id="c3virow'+id+'" x="120" y="'+(y-15)+'" width="400" height="26" rx="5" style="fill:var('+c+');fill-opacity:0;stroke:var('+c+');stroke-width:1.1;stroke-opacity:.35"/><text x="138" y="'+(y+3)+'" style="font:700 11px var(--mono);fill:var('+c+')">VLAN '+id+'</text><text x="250" y="'+(y+3)+'" style="font:500 10px var(--sans);fill:var(--txt)">'+esc(lbl)+'</text></g>';
  const svg='<svg id="c3visvg" viewBox="0 0 640 190" width="100%" style="display:block">'
    +'<text x="320" y="22" text-anchor="middle" style="font:700 9px var(--mono);fill:var(--muted)">'+'VLAN ID — range 1 to 4094'+'</text>'
    +row(54,'1','--muted','default — don’t use in production')
    +row(90,'10','--blue','users')
    +row(126,'20','--amber','servers')
    +row(162,'99','--violet','management')
    +'</svg>';
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'How do we tell VLANs apart? In the previous modules you saw the numbers <b>10</b> and <b>20</b> next to ports – and exactly these numbers are <b>VLAN IDs</b>. Every VLAN has its own, in the range <b>1 to 4094</b>, and the switch uses it to remember which VLAN each port belongs to. The number itself doesn’t "do" anything – it’s just a <b>label</b>. That’s why in practice it pays to follow a convention, so the numbers still make sense a year later.'+'</p>'
    +'<div class="osi-stage">'+svg+'</div>'
    +'<div class="m1-cap" id="c3vicap"></div>'
    +courseStepControls('c3vi')
    +abbrBox([['VLAN 1','the default VLAN ports start in; not relied upon in production (security).'],['VLAN ID','the VLAN number 1–4094; in practice chosen by role (10 users, 20 servers…).']]);
}
function mountC3VlanId(){
  const hi=(id)=>{['1','10','20','99'].forEach(function(r){var el=$('c3virow'+r);if(el)el.style.fillOpacity=(r===id||id==='*')?'0.14':'0';});};
  const STEPS=[
    {hl:'*', cap:'A VLAN ID is a number <b>1 to 4094</b>. The switch tells VLANs apart by it – it’s just a label.'},
    {hl:'1', cap:'<b>VLAN 1</b> always exists (the default) and all ports start in it. In practice it is <b>not relied on</b> (all devices start in it — including an attacker — and it is usually the default <b>native VLAN</b> of trunks – we explain both in the very next lesson) – you put production in its own VLANs (security).'},
    {hl:'*', cap:'In practice VLANs are numbered <b>by role</b>: e.g. <b>10 = users, 20 = servers, 99 = management</b>. It’s a team convention, not a rule.'}
  ];
  function show(i){hi(STEPS[i].hl);const c=$('c3vicap');if(c)c.innerHTML='<span>'+STEPS[i].cap+'</span>';}
  courseStepper('c3vi',STEPS.length,show);
}
// L2M4 — What a VLAN does not solve (it isolates traffic, but is not security by itself)
function renderC3VlanLimits(){
  const svg='<svg id="c3vlimsvg" viewBox="0 0 640 188" width="100%" style="display:block">'
    +'<rect x="40" y="40" width="240" height="108" rx="10" style="fill:var(--blue);fill-opacity:.06;stroke:var(--blue);stroke-width:1.3"/><text x="160" y="62" text-anchor="middle" style="font:700 9px var(--mono);fill:var(--blue)">VLAN 10</text>'
    +'<rect x="360" y="40" width="240" height="108" rx="10" style="fill:var(--amber);fill-opacity:.06;stroke:var(--amber);stroke-width:1.3"/><text x="480" y="62" text-anchor="middle" style="font:700 9px var(--mono);fill:var(--amber)">VLAN 20</text>'
    +'<line x1="320" y1="34" x2="320" y2="154" style="stroke:var(--muted);stroke-width:2;stroke-dasharray:4 4"/>'
    +'<g id="c3vlimglow"></g>'
    +csHost(140,98,'desktop','--blue','A')+csHost(500,98,'desktop','--amber','C')
    +'<g id="c3vlimdyn"></g></svg>';
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'A VLAN is great for <b>separating traffic</b>, but it helps to know <b>what it does NOT solve</b>. By itself it is <b>not a security wall</b>: it relies on being configured correctly. Put a port in the wrong VLAN – or misconfigure a <b>trunk</b> (the link between switches that carries several VLANs at once; we’ll cover it in detail in the very next lesson) – and the isolation falls apart.'+'</p>'
    +'<div class="osi-stage">'+svg+'</div>'
    +'<div class="m1-cap" id="c3vlimcap"></div>'
    +courseStepControls('c3vlim')
    +abbrBox([['ACL','an access list (permit/deny) – controls who may cross between VLANs; that’s a later lesson and the security course.']]);
}
function mountC3VlanLimits(){
  const wall='<line x1="320" y1="34" x2="320" y2="154" style="stroke:var(--green);stroke-width:3"/><text x="320" y="172" text-anchor="middle" style="font:700 8px var(--sans);fill:var(--green)">'+esc('separated (L2)')+'</text>';
  const leak='<line x1="320" y1="34" x2="320" y2="154" style="stroke:var(--red);stroke-width:2;stroke-dasharray:4 4"/>'+csPkt('M160 98 L480 98','--red')+'<text x="320" y="172" text-anchor="middle" style="font:700 8px var(--sans);fill:var(--red)">'+esc('wrong port → leak')+'</text>';
  const acl='<rect x="300" y="84" width="40" height="28" rx="5" style="fill:var(--panel);stroke:var(--cyan);stroke-width:1.4"/><text x="320" y="102" text-anchor="middle" style="font:700 7px var(--mono);fill:var(--cyan)">ACL</text>'+csPkt('M160 98 L296 98','--red')+'<text x="320" y="172" text-anchor="middle" style="font:700 8px var(--sans);fill:var(--cyan)">'+esc('VLAN + ACL / firewall')+'</text>';
  const STEPS=[
    {glow:csGlow(140,98,'--blue')+csGlow(500,98,'--amber'), dyn:wall, cap:'A VLAN separates traffic at <b>L2</b> – VLAN 10 and 20 don’t see each other. That’s good and correct.'},
    {glow:csGlow(140,98,'--red')+csGlow(500,98,'--red'), dyn:leak, cap:'But it is <b>not a security wall by itself</b>: a <b>misconfigured port</b> (in the wrong VLAN) or a misconfigured trunk (the switch-to-switch link) and the isolation falls apart.'},
    {glow:csGlow(140,98,'--blue')+csGlow(500,98,'--amber'), dyn:acl, cap:'Real security = <b>VLAN + rules for the traffic between VLANs</b>. Those come from an <b>ACL</b> (Access Control List – a permit/deny rule list) on a managed L2 / L3 switch, or from a <b>firewall</b> – depending on where the inter-VLAN traffic passes. The VLAN divides, the rules guard. More in the security course.'}
  ];
  function show(i){const g=$('c3vlimglow');if(g)g.innerHTML=STEPS[i].glow||'';const d=$('c3vlimdyn');if(d)d.innerHTML=STEPS[i].dyn;const c=$('c3vlimcap');if(c)c.innerHTML='<span>'+STEPS[i].cap+'</span>';}
  courseStepper('c3vlim',STEPS.length,show);
}
/* ---------- COURSE 3 / Lesson 3 — Trunk: how a VLAN crosses a cable ---------- */
// L3M1 — The multiple-switch problem (one cable per VLAN does not scale)
function renderC3TrunkWhy(){
  const svg='<svg id="c3t1svg" viewBox="0 0 640 200" width="100%" style="display:block">'
    +'<line x1="81.6" y1="61.6" x2="128.9" y2="87.5" style="stroke:var(--blue);stroke-width:1.4"/><line x1="81.2" y1="139.8" x2="129.4" y2="111.2" style="stroke:var(--amber);stroke-width:1.4"/><line x1="558.4" y1="61.6" x2="511.1" y2="87.5" style="stroke:var(--blue);stroke-width:1.4"/><line x1="558.8" y1="139.8" x2="510.6" y2="111.2" style="stroke:var(--amber);stroke-width:1.4"/>'
    +'<g id="c3t1glow"></g>'
    +csDev(150,99,'l2switch','SW-A')+csDev(490,99,'l2switch','SW-B')
    +csHost(64,52,'desktop','--blue','V10')+csHost(64,150,'desktop','--amber','V20')+csHost(576,52,'desktop','--blue','V10')+csHost(576,150,'desktop','--amber','V20')
    +'<g id="c3t1dyn"></g></svg>';
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'So far VLANs lived on <b>one</b> switch. What if you want <b>VLAN 10 on switch A and on switch B</b> (a company with two floors)? VLAN 10 hosts must be linked over a cable between the switches – and so must VLAN 20. How do you do it without the VLANs getting mixed up?'+'</p>'
    +'<div class="osi-stage">'+svg+'</div>'
    +'<div class="m1-cap" id="c3t1cap"></div>'
    +courseStepControls('c3t1')
    +abbrBox([['uplink','the cable between switches (or to a router) – ties them together.']]);
}
function mountC3TrunkWhy(){
  const oneCable='<line x1="173.7" y1="95" x2="466.3" y2="95" style="stroke:var(--blue);stroke-width:2.4"/><text x="320" y="78" text-anchor="middle" style="font:700 7.5px var(--mono);fill:var(--blue)">'+esc('cable for VLAN 10')+'</text>';
  const twoCable=oneCable+'<line x1="173.7" y1="107" x2="466.3" y2="107" style="stroke:var(--amber);stroke-width:2.4"/><text x="320" y="132" text-anchor="middle" style="font:700 7.5px var(--mono);fill:var(--amber)">'+esc('+ cable for VLAN 20')+'</text>';
  const many=twoCable+'<text x="320" y="150" text-anchor="middle" style="font:700 8px var(--sans);fill:var(--red)">'+esc('10 VLANs = 10 cables?!')+'</text>';
  const gSW=csGlow(150,99,'--cyan',24)+csGlow(490,99,'--cyan',24);
  const STEPS=[
    {glow:'', dyn:'', cap:'Two floors, two switches. Both have <b>VLAN 10</b> and <b>VLAN 20</b>. You want VLAN 10 on A to reach VLAN 10 on B – but not VLAN 20.'},
    {glow:gSW, dyn:oneCable, cap:'You add <b>one cable</b> between the switches for VLAN 10. It works – VLAN 10 gets through. But what about VLAN 20?'},
    {glow:gSW, dyn:twoCable, cap:'A second cable for VLAN 20. Now both work – but <b>one cable per VLAN</b>. One cable for every VLAN.'},
    {glow:gSW, dyn:many, cap:'10 VLANs = 10 cables between every pair of switches. <b>It doesn’t scale.</b> You want <b>ONE cable that carries all VLANs</b> – that’s a <b>trunk</b> (next module).'}
  ];
  function show(i){const g=$('c3t1glow');if(g)g.innerHTML=STEPS[i].glow||'';const d=$('c3t1dyn');if(d)d.innerHTML=STEPS[i].dyn;const c=$('c3t1cap');if(c)c.innerHTML='<span>'+STEPS[i].cap+'</span>';}
  courseStepper('c3t1',STEPS.length,show);
}
// L3M2 — 802.1Q tag (the switch attaches a tag with the VLAN; the next one reads it and removes it)
function renderC3Tag(){
  const svg='<svg id="c3t2svg" viewBox="0 0 640 184" width="100%" style="display:block">'
    +'<line x1="84" y1="95" x2="176" y2="95" style="stroke:var(--blue);stroke-width:1.5"/><text x="124" y="78" text-anchor="middle" style="font:600 6.5px var(--sans);fill:var(--muted)">access</text>'
    +'<line x1="224" y1="95" x2="416" y2="95" style="stroke:var(--cyan);stroke-width:2.2"/><text x="320" y="74" text-anchor="middle" style="font:700 6.5px var(--mono);fill:var(--cyan)">TRUNK</text>'
    +'<line x1="464" y1="95" x2="556" y2="95" style="stroke:var(--blue);stroke-width:1.5"/><text x="516" y="78" text-anchor="middle" style="font:600 6.5px var(--sans);fill:var(--muted)">access</text>'
    +'<g id="c3t2glow"></g>'
    +csDev(200,95,'l2switch','SW-A')+csDev(440,95,'l2switch','SW-B')
    +csHost(64,95,'desktop','--blue','V10')+csHost(576,95,'desktop','--blue','V10')
    +'<g id="c3t2dyn"></g></svg>';
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'A trunk is a <b>link between switches</b> (a port switched into trunk mode) where <b>traffic of several VLANs runs over a single cable at once</b>. But how does the other switch tell which VLAN a frame belongs to? On the trunk the switch <b>attaches a small tag</b> with the VLAN number – this is the <b>802.1Q tag</b>. The other switch <b>reads</b> the tag, knows where the frame belongs, and <b>removes</b> it again before delivering to the end device. Follow one frame.'+'</p>'
    +'<div class="osi-stage">'+svg+'</div>'
    +'<div class="m1-cap" id="c3t2cap"></div>'
    +courseStepControls('c3t2')
    +abbrBox([['802.1Q','the VLAN tag standard – the VLAN number added to the frame on a trunk.'],['tag','a label with the VLAN number; carried only on a trunk, removed at an access port.']]);
}
function mountC3Tag(){
  const frame=(path,tagged)=>'<g><rect x="-12" y="-6" width="24" height="12" rx="2" style="fill:var(--blue)"/>'+(tagged?'<rect x="-12" y="-6" width="9" height="12" rx="2" style="fill:var(--cyan)"/><text x="-7.5" y="3" text-anchor="middle" style="font:800 6px var(--mono);fill:#06231f">10</text>':'')+'<animateMotion path="'+path+'" dur="'+CRS_DUR+'" repeatCount="indefinite"/></g>'; // a flying frame (SMIL, following csPkt); tagged = with an 802.1Q tag
  const STEPS=[
    {glow:csGlow(64,95,'--blue')+csGlow(200,95,'--cyan',24), dyn:frame('M84 95 L176 95'), cap:'A host in <b>VLAN 10</b> sends a frame. On the <b>access port</b> (a port for an end device, belonging to one VLAN – next module) it is <b>untagged</b> – the host knows nothing about VLANs.'},
    {glow:csGlow(200,95,'--cyan',24)+csGlow(440,95,'--cyan',24), dyn:frame('M224 95 L416 95',true), cap:'SW-A puts it on the <b>trunk</b> and <b>attaches the 802.1Q tag "10"</b>. On the trunk the frame now travels <b>tagged</b> – the other switch knows it’s VLAN 10.'},
    {glow:csGlow(440,95,'--cyan',24)+csGlow(576,95,'--blue'), dyn:frame('M464 95 L556 95'), cap:'SW-B <b>reads</b> the tag (→ VLAN 10), <b>removes it</b> and delivers the frame to the VLAN 10 host – <b>untagged</b> again. The receiver also knows nothing about VLANs.'}
  ];
  function show(i){const g=$('c3t2glow');if(g)g.innerHTML=STEPS[i].glow||'';const d=$('c3t2dyn');if(d)d.innerHTML=STEPS[i].dyn;const c=$('c3t2cap');if(c)c.innerHTML='<span>'+STEPS[i].cap+'</span>';}
  courseStepper('c3t2',STEPS.length,show);
}
// L3M3 — Access port vs trunk port
function renderC3AccessTrunk(){
  const svg='<svg id="c3t3svg" viewBox="0 0 640 200" width="100%" style="display:block">'
    +'<line x1="83.7" y1="55.7" x2="296.4" y2="95.6" style="stroke:var(--blue);stroke-width:1.6"/><text x="134" y="62" text-anchor="middle" style="font:700 7px var(--sans);fill:var(--blue)">access · V10</text>'
    +'<line x1="83.7" y1="144.3" x2="296.4" y2="104.4" style="stroke:var(--amber);stroke-width:1.6"/><text x="134" y="146" text-anchor="middle" style="font:700 7px var(--sans);fill:var(--amber)">access · V20</text>'
    +'<line x1="344" y1="100" x2="556" y2="100" style="stroke:var(--cyan);stroke-width:2.4"/><text x="452" y="88" text-anchor="middle" style="font:700 7.5px var(--mono);fill:var(--cyan)">TRUNK · V10+V20</text>'
    +'<g id="c3t3glow"></g>'
    +csDev(320,100,'l2switch','SWITCH')+csDev(580,100,'l2switch','SW-B')
    +csHost(64,52,'desktop','--blue','PC')+csHost(64,148,'printer','--amber','PRINT')
    +'<g id="c3t3dyn"></g></svg>';
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'A switch port has two main roles: <b>access</b> and <b>trunk</b>. (There is also automatic mode negotiation – DTP; it is a security risk and gets disabled in practice – covered in detail in the switch in depth course.) An <b>access port</b> carries <b>one VLAN</b> and shows no tags – an <b>end device</b> sits on it (PC, printer) that knows nothing about VLANs. A <b>trunk port</b> carries <b>several VLANs with tags</b> – it runs <b>between switches</b>, to a router or an L3 switch. Watch the difference.'+'</p>'
    +'<div class="osi-stage">'+svg+'</div>'
    +'<div class="m1-cap" id="c3t3cap"></div>'
    +courseStepControls('c3t3')
    +abbrBox([['access port','one VLAN, untagged – for an end device (PC, printer).'],['trunk port','several VLANs with tags (802.1Q) – between switches / to a router / to an L3 switch.']]);
}
function mountC3AccessTrunk(){
  const frame=(path,color,tag,begin)=>'<g><rect x="-12" y="-6" width="24" height="12" rx="2" style="fill:var('+color+')"/>'+(tag?'<rect x="-12" y="-6" width="9" height="12" rx="2" style="fill:var(--cyan)"/><text x="-7.5" y="3" text-anchor="middle" style="font:800 6px var(--mono);fill:#06231f">'+tag+'</text>':'')+'<animateMotion path="'+path+'" dur="'+CRS_DUR+'"'+(begin?' begin="'+begin+'"':'')+' repeatCount="indefinite"/></g>'; // a flying frame (SMIL, following csPkt); tag = 802.1Q tag
  const accFrames=frame('M84 55.7 L296.4 95.6','--blue')+frame('M84 144.3 L296.4 104.4','--amber'); // access side: no tag
  const trunkFrames=frame('M344 96 L556 96','--blue','10')+frame('M344 104 L556 104','--amber','20'); // trunk: with tags
  const STEPS=[
    {glow:csGlow(64,52,'--blue')+csGlow(64,148,'--amber')+csGlow(320,100,'--cyan',24), dyn:'<circle cx="185" cy="73" r="16" style="fill:none;stroke:var(--blue);stroke-width:2"/><circle cx="185" cy="127" r="16" style="fill:none;stroke:var(--amber);stroke-width:2"/>'+accFrames, cap:'<b>Access ports</b>: on the left. The PC is in <b>one VLAN</b> (V10), the printer in another (V20). No tags – end devices don’t know about VLANs.'},
    {glow:csGlow(320,100,'--cyan',24)+csGlow(580,100,'--cyan',24), dyn:'<rect x="356" y="86" width="196" height="28" rx="8" style="fill:none;stroke:var(--cyan);stroke-width:2"/>'+trunkFrames, cap:'<b>Trunk port</b>: on the right, the cable to the other switch. It carries <b>both VLANs (V10 and V20) tagged</b> at once – one cable for everything.'},
    {glow:csGlow(64,52,'--blue')+csGlow(64,148,'--amber')+csGlow(320,100,'--cyan',24)+csGlow(580,100,'--cyan',24), dyn:'', cap:'Rule: <b>access to end devices</b> (one VLAN, untagged), <b>trunk between switches/to a router</b> (several VLANs, tagged). That’s the whole difference.'}
  ];
  function show(i){const g=$('c3t3glow');if(g)g.innerHTML=STEPS[i].glow||'';const d=$('c3t3dyn');if(d)d.innerHTML=STEPS[i].dyn;const c=$('c3t3cap');if(c)c.innerHTML='<span>'+STEPS[i].cap+'</span>';}
  courseStepper('c3t3',STEPS.length,show);
}
// L3M4 — Native VLAN (untagged traffic on the trunk)
function renderC3NativeVlan(){
  const svg='<svg id="c3t4svg" viewBox="0 0 640 176" width="100%" style="display:block">'
    +'<line x1="96" y1="87" x2="544" y2="87" style="stroke:var(--cyan);stroke-width:2.4"/><text x="320" y="56" text-anchor="middle" style="font:700 7.5px var(--mono);fill:var(--cyan)">TRUNK</text>'
    +'<g id="c3t4glow"></g>'
    +csDev(72,87,'l2switch','SW-A')+csDev(568,87,'l2switch','SW-B')
    +'<g id="c3t4dyn"></g></svg>';
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'Almost everything on a trunk is tagged. But what about a frame with <b>no tag</b> (a trunk typically links two switches, yet untagged traffic still appears on it — sent by the switch’s own management protocols or by older devices that cannot do tags)? It belongs to the <b>native VLAN</b> – the trunk’s default VLAN (usually VLAN 1). Key rule: <b>the native VLAN must match on both ends of the trunk</b> – the receiving switch files an untagged frame into <b>its own</b> native VLAN (it has no idea what the sender meant), so on a mismatch it lands in the <b>wrong VLAN</b>.'+'</p>'
    +'<div class="osi-stage">'+svg+'</div>'
    +'<div class="m1-cap" id="c3t4cap"></div>'
    +courseStepControls('c3t4')
    +abbrBox([['native VLAN','the VLAN that untagged traffic on a trunk belongs to (default VLAN 1).']]);
}
function mountC3NativeVlan(){
  const TRK='M96 87 L544 87'; // path along the trunk (edge of glow SW-A → edge of glow SW-B)
  const tagged='<g><rect x="-12" y="-6" width="24" height="12" rx="2" style="fill:var(--blue)"/><rect x="-12" y="-6" width="9" height="12" rx="2" style="fill:var(--cyan)"/><text x="-7.5" y="3" text-anchor="middle" style="font:800 6px var(--mono);fill:#06231f">10</text><animateMotion path="'+TRK+'" dur="'+CRS_DUR+'" repeatCount="indefinite"/></g>'; // a flying frame with a tag (SMIL, following csPkt)
  const untag=tagged+'<g><rect x="-12" y="-6" width="24" height="12" rx="2" style="fill:var(--muted)"/><animateMotion path="'+TRK+'" dur="'+CRS_DUR+'" begin="0.75s" repeatCount="indefinite"/></g><text x="320" y="116" text-anchor="middle" style="font:700 7px var(--sans);fill:var(--muted)">'+esc('gray frame: untagged')+'</text>';
  const ok='<text x="320" y="140" text-anchor="middle" style="font:700 8px var(--sans);fill:var(--green)">'+esc('same native VLAN on both ends → OK')+'</text>';
  const bad='<text x="320" y="140" text-anchor="middle" style="font:700 8px var(--sans);fill:var(--red)">'+esc('native VLAN mismatch → traffic in the wrong VLAN')+'</text>';
  const gOK=csGlow(72,87,'--cyan',24)+csGlow(568,87,'--cyan',24);
  const gBad=csGlow(72,87,'--cyan',24)+csGlow(568,87,'--red',24);
  const STEPS=[
    {glow:gOK, dyn:tagged, cap:'Frames cross the trunk <b>tagged</b> (here VLAN 10). The switch knows where they go by the tag.'},
    {glow:gOK, dyn:untag, cap:'But a frame arrives <b>untagged</b>. Where does it go? To the <b>native VLAN</b> – the trunk’s default VLAN (typically VLAN 1).'},
    {glow:gBad, dyn:untag+bad, cap:'So the <b>native VLAN must match on both ends</b>. If it doesn’t, untagged traffic <b>lands in the wrong VLAN</b> – a mess and a security hole. Keep it the same everywhere.'}
  ];
  function show(i){const g=$('c3t4glow');if(g)g.innerHTML=STEPS[i].glow||'';const d=$('c3t4dyn');if(d)d.innerHTML=STEPS[i].dyn;const c=$('c3t4cap');if(c)c.innerHTML='<span>'+STEPS[i].cap+'</span>';}
  courseStepper('c3t4',STEPS.length,show);
}
/* ---------- COURSE 3 / Lesson 4 — Why VLANs do not talk to each other ---------- */
// L4M1 — The wall works (too) well
function renderC3WallTooGood(){
  const svg='<svg id="c3w1svg" viewBox="0 0 640 196" width="100%" style="display:block">'
    +'<line x1="84" y1="100" x2="300" y2="100" style="stroke:var(--blue);stroke-width:1.6"/>'
    +'<line x1="340" y1="100" x2="556" y2="100" style="stroke:var(--amber);stroke-width:1.6"/>'
    +'<text x="150" y="80" text-anchor="middle" style="font:700 7.5px var(--mono);fill:var(--blue)">VLAN 10</text>'
    +'<text x="490" y="80" text-anchor="middle" style="font:700 7.5px var(--mono);fill:var(--amber)">VLAN 20</text>'
    +'<g id="c3w1glow"></g>'
    +csDev(320,100,'l2switch','SWITCH')
    +csHost(64,100,'desktop','--blue','A')+csHost(576,100,'server','--amber','SERVER')
    +'<g id="c3w1dyn"></g></svg>';
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'We split the VLANs so well that we now hit the <b>opposite problem</b>. <b>A</b> is a user in <b>VLAN 10</b> and needs to reach the <b>company server</b> in <b>VLAN 20</b>. But the switch <b>won’t pass</b> traffic between VLANs – to it they are two completely foreign networks. The isolation works <b>too</b> well: it also separates what <b>should</b> talk.'+'</p>'
    +'<div class="osi-stage">'+svg+'</div>'
    +'<div class="m1-cap" id="c3w1cap"></div>'
    +courseStepControls('c3w1')
    +abbrBox([['default gateway','the address a device sends off-network/VLAN traffic to. A switch alone is not a gateway – it needs an L3 device.'],['L3 device','a router or L3 switch – works with IP addresses and moves traffic between networks/VLANs.']]);
}
function mountC3WallTooGood(){
  const blk=csPkt('M84 100 L300 100','--blue')+'<text x="320" y="66" text-anchor="middle" style="font:800 22px var(--mono);fill:var(--red)">✕</text>';
  const STEPS=[
    {glow:csGlow(64,100,'--blue')+csGlow(576,100,'--amber'), dyn:'', cap:'<b>A</b> (VLAN 10) wants to reach the <b>SERVER</b> (VLAN 20). Two different VLANs = two different networks.'},
    {glow:csGlow(64,100,'--blue')+csGlow(320,100,'--red',23), dyn:blk, cap:'A sends traffic – the switch receives it, but <b>won’t pass it between VLANs</b>. To the switch VLAN 20 is a foreign world. <b>Stopped.</b>'},
    {glow:csGlow(64,100,'--blue')+csGlow(576,100,'--amber'), dyn:'', cap:'This is <b>correct</b> (isolation), but sometimes VLANs <b>must</b> talk. A switch (L2) can’t do it – it only looks at MAC (you know the L2 and L3 layers from the ISO/OSI course — the data-link and network layers). We need something that understands <b>IP addresses</b> and can cross between networks: an <b>L3 device</b> (next module).'}
  ];
  function show(i){const g=$('c3w1glow');if(g)g.innerHTML=STEPS[i].glow||'';const d=$('c3w1dyn');if(d)d.innerHTML=STEPS[i].dyn;const c=$('c3w1cap');if(c)c.innerHTML='<span>'+STEPS[i].cap+'</span>';}
  courseStepper('c3w1',STEPS.length,show);
}
// L4M2 — L3 as a translator (a router with a gateway in each VLAN)
function renderC3L3Translator(){
  const svg='<svg id="c3w2svg" viewBox="0 0 640 210" width="100%" style="display:block">'
    +'<line x1="80" y1="56" x2="196" y2="98" style="stroke:var(--blue);stroke-width:1.5"/><line x1="80" y1="158" x2="196" y2="116" style="stroke:var(--amber);stroke-width:1.5"/>'
    +'<line x1="244" y1="100" x2="418" y2="105" style="stroke:var(--blue);stroke-width:2.2"/>'
    +'<line x1="244" y1="114" x2="418" y2="109" style="stroke:var(--amber);stroke-width:2.2"/>'
    +'<text x="330" y="86" text-anchor="middle" style="font:700 7px var(--mono);fill:var(--blue)">'+esc('leg in VLAN 10')+'</text>'
    +'<text x="330" y="136" text-anchor="middle" style="font:700 7px var(--mono);fill:var(--amber)">'+esc('leg in VLAN 20')+'</text>'
    +'<text x="60" y="28" text-anchor="middle" style="font:700 7.5px var(--mono);fill:var(--blue)">VLAN 10</text><text x="60" y="130" text-anchor="middle" style="font:700 7.5px var(--mono);fill:var(--amber)">VLAN 20</text>'
    +'<g id="c3w2glow"></g>'
    +csDev(220,107,'l2switch','SWITCH')+csDev(440,107,'router','ROUTER')
    +csHost(64,56,'desktop','--blue','A')+csHost(64,158,'server','--amber','SERVER')
    +'<circle cx="472" cy="94" r="3" style="fill:var(--blue)"/><text x="480" y="97" style="font:700 7px var(--mono);fill:var(--blue)">'+esc('gateway .1 · VLAN 10')+'</text>'
    +'<circle cx="472" cy="120" r="3" style="fill:var(--amber)"/><text x="480" y="123" style="font:700 7px var(--mono);fill:var(--amber)">'+esc('gateway .1 · VLAN 20')+'</text>'
    +'<g id="c3w2dyn"></g></svg>';
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'Between VLANs we need an <b>L3 device</b> – typically a <b>router</b> (or an L3 switch, next lesson). The trick is this: the router has <b>one IP address in each VLAN</b> – it is the <b>default gateway</b> for both (.1 = the usual last digit of a gateway’s address, e.g. 10.0.10.1). When A wants the SERVER in another VLAN, it sends it <b>to its gateway first</b> (the router). The router has <b>a foot in each network</b>, so it <b>receives in VLAN 10 and hands out in VLAN 20</b> – it works as a translator between networks.'+'</p>'
    +'<div class="osi-stage">'+svg+'</div>'
    +'<div class="m1-cap" id="c3w2cap"></div>'
    +courseStepControls('c3w2')
    +abbrBox([['default gateway','the router’s IP in a VLAN, where devices send traffic out of the VLAN (e.g. .1).'],['routing','moving traffic between networks (VLANs) by IP address – the L3 device’s job.']]);
}
function mountC3L3Translator(){
  const up=csPkt('M84 56 L200 98','--blue')+csPkt('M244 100 L418 105','--blue');
  const down=csPkt('M418 109 L244 114','--amber')+csPkt('M200 116 L84 158','--amber');
  const STEPS=[
    {glow:csGlow(64,56,'--blue')+csGlow(220,107,'--blue',23)+csGlow(440,107,'--cyan',24), dyn:up, cap:'A doesn’t know the way to VLAN 20, so it sends the traffic to <b>its default gateway</b> = the router’s IP in VLAN 10 (.1). The traffic reaches <b>the router</b> via the switch.'},
    {glow:csGlow(440,107,'--cyan',24)+csGlow(220,107,'--amber',23)+csGlow(64,158,'--amber'), dyn:down, cap:'The router looks at the <b>destination IP</b>, sees it belongs to VLAN 20, and <b>sends the traffic out its other leg</b> – in VLAN 20. Via the switch it reaches the <b>SERVER</b>. Done.'},
    {glow:csGlow(64,56,'--blue')+csGlow(220,107,'--line2',23)+csGlow(440,107,'--cyan',24)+csGlow(64,158,'--amber'), dyn:'', cap:'Key: the router has a <b>gateway (IP) in each VLAN</b> and <b>routes</b> traffic between them by IP. The VLANs stay separated at L2 – only something with a foot in both links them. <b>How those two cables can be replaced by one</b> is the next module.'}
  ];
  function show(i){const g=$('c3w2glow');if(g)g.innerHTML=STEPS[i].glow||'';const d=$('c3w2dyn');if(d)d.innerHTML=STEPS[i].dyn;const c=$('c3w2cap');if(c)c.innerHTML='<span>'+STEPS[i].cap+'</span>';}
  courseStepper('c3w2',STEPS.length,show);
}
// L4M3 — Router-on-a-stick (one trunk + subinterfaces)
function renderC3RoaS(){
  const svg='<svg id="c3w3svg" viewBox="0 0 640 210" width="100%" style="display:block">'
    +'<line x1="80" y1="56" x2="196" y2="98" style="stroke:var(--blue);stroke-width:1.5"/><line x1="80" y1="158" x2="196" y2="116" style="stroke:var(--amber);stroke-width:1.5"/>'
    +'<line x1="244" y1="107" x2="416" y2="107" style="stroke:var(--cyan);stroke-width:2.6"/><text x="326" y="96" text-anchor="middle" style="font:700 7px var(--mono);fill:var(--cyan)">TRUNK (V10+V20)</text>'
    +'<text x="60" y="28" text-anchor="middle" style="font:700 7.5px var(--mono);fill:var(--blue)">VLAN 10</text><text x="60" y="130" text-anchor="middle" style="font:700 7.5px var(--mono);fill:var(--amber)">VLAN 20</text>'
    +'<g id="c3w3glow"></g>'
    +csDev(220,107,'l2switch','SWITCH')+csDev(440,107,'router','ROUTER')
    +csHost(64,56,'desktop','--blue','A')+csHost(64,158,'server','--amber','SERVER')
    +'<text x="512" y="92" style="font:700 7px var(--mono);fill:var(--blue)">G0/0.10</text><text x="512" y="128" style="font:700 7px var(--mono);fill:var(--amber)">G0/0.20</text>'
    +'<g id="c3w3dyn"></g></svg>';
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'The router would need <b>one physical port per VLAN</b> – the same problem as cables on a trunk. The fix: a <b>single trunk</b> runs to the switch, and on the router that port is split into <b>subinterfaces</b> (logical sub-ports) – one per VLAN. Each subinterface holds <b>its VLAN’s gateway</b> (G0/0.10 = .1 in V10, G0/0.20 = .1 in V20). Physically it is still <b>one cable and one port</b> – the router tells which subinterface a frame belongs to by its <b>802.1Q tag</b>. This is called <b>router-on-a-stick</b> – the router hangs off one cable "on a stick".'+'</p>'
    +'<div class="osi-stage">'+svg+'</div>'
    +'<div class="m1-cap" id="c3w3cap"></div>'
    +courseStepControls('c3w3')
    +abbrBox([['router-on-a-stick','a router routing between VLANs over ONE trunk split into subinterfaces (one per VLAN).'],['subinterface','a logical sub-port of a physical interface, assigned to one VLAN and holding its gateway.']]);
}
function mountC3RoaS(){
  const up=csPkt('M84 56 L200 98','--blue')+'<rect x="-13" y="-6" width="26" height="12" rx="2" style="fill:var(--blue)"><animateMotion path="M244 104 L408 104" dur="'+CRS_DUR+'" repeatCount="indefinite"/></rect>';
  const down='<rect x="-13" y="-6" width="26" height="12" rx="2" style="fill:var(--amber)"><animateMotion path="M408 110 L244 110" dur="'+CRS_DUR+'" repeatCount="indefinite"/></rect>'+csPkt('M200 116 L84 158','--amber');
  const STEPS=[
    {glow:csGlow(220,107,'--cyan',24)+csGlow(440,107,'--cyan',24), dyn:'', cap:'Between the switch and the router runs a <b>single trunk</b> carrying <b>both VLANs tagged</b>. On the router the port splits into <b>subinterfaces</b>: G0/0.10 (V10) and G0/0.20 (V20).'},
    {glow:csGlow(64,56,'--blue')+csGlow(220,107,'--blue',24)+csGlow(440,107,'--cyan',24), dyn:up, cap:'A (V10) sends traffic to the gateway. It travels the trunk <b>tagged as VLAN 10</b> and the router receives it on <b>subinterface G0/0.10</b>.'},
    {glow:csGlow(440,107,'--cyan',24)+csGlow(220,107,'--amber',24)+csGlow(64,158,'--amber'), dyn:down, cap:'The router reroutes to VLAN 20, sends it back over the <b>same trunk tagged as VLAN 20</b>, the switch removes the tag and delivers to the <b>SERVER</b>.'},
    {glow:csGlow(220,107,'--cyan',24)+csGlow(440,107,'--cyan',24), dyn:'', cap:'Router-on-a-stick is <b>cheap</b> (one cable), but <b>all</b> inter-VLAN traffic flows up to the router and back – that <b>single link is a bottleneck</b>. A better fix inside the switch is the <b>L3 switch</b> (next lesson).'}
  ];
  function show(i){const g=$('c3w3glow');if(g)g.innerHTML=STEPS[i].glow||'';const d=$('c3w3dyn');if(d)d.innerHTML=STEPS[i].dyn;const c=$('c3w3cap');if(c)c.innerHTML='<span>'+STEPS[i].cap+'</span>';}
  courseStepper('c3w3',STEPS.length,show);
}
/* ---------- COURSE 3 / Lesson 5 — L3 switch ---------- */
// L5M1 — Where router-on-a-stick falls short (bottleneck)
function renderC3RoaSLimit(){
  const svg='<svg id="c3s1svg" viewBox="0 0 640 210" width="100%" style="display:block">'
    +'<line x1="82.9" y1="56.5" x2="208.2" y2="99.5" style="stroke:var(--blue);stroke-width:1.5"/><line x1="80" y1="104" x2="205" y2="107" style="stroke:var(--blue);stroke-width:1.5"/><line x1="83.3" y1="159.1" x2="208.3" y2="114.7" style="stroke:var(--amber);stroke-width:1.5"/>'
    +'<line x1="250" y1="107" x2="428" y2="107" style="stroke:var(--cyan);stroke-width:2.8"/><text x="341" y="94" text-anchor="middle" style="font:700 7px var(--mono);fill:var(--cyan)">'+'single trunk'+'</text>'
    +'<g id="c3s1glow"></g>'
    +csDev(230,107,'l2switch','SWITCH')+csDev(452,107,'router','ROUTER')
    +csHost(64,50,'desktop','--blue','A·V10')+csHost(64,104,'desktop','--blue','B·V10')+csHost(64,166,'server','--amber','SRV·V20')
    +'<g id="c3s1dyn"></g></svg>';
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'Router-on-a-stick works, but it has a weakness. <b>All</b> inter-VLAN traffic must go <b>up to the router and back</b> over that <b>single trunk</b>. The more users and servers talk across VLANs, the more that one cable <b>clogs up</b> – it’s a <b>bottleneck</b>. And every packet takes a needless <b>detour</b> out of the switch and back (a "hairpin"). In a big network it isn’t enough.'+'</p>'
    +'<div class="osi-stage">'+svg+'</div>'
    +'<div class="m1-cap" id="c3s1cap"></div>'
    +courseStepControls('c3s1')
    +abbrBox([['bottleneck','the point all traffic must pass through and piles up at – here the single trunk to the router.'],['hairpin','traffic leaves the switch to the router and returns the same way – a wasteful detour.']]);
}
function mountC3RoaSLimit(){
  const jam='<rect x="-12" y="-5" width="24" height="10" rx="2" style="fill:var(--red)"><animateMotion path="M259 103 L423 103" dur="'+CRS_DUR+'" repeatCount="indefinite"/></rect><rect x="-12" y="-5" width="24" height="10" rx="2" style="fill:var(--red)"><animateMotion path="M423 111 L259 111" dur="'+CRS_DUR+'" repeatCount="indefinite"/></rect><text x="341" y="130" text-anchor="middle" style="font:700 8px var(--sans);fill:var(--red)">'+esc('congested')+'</text>';
  const hair=csPkt('M84 52 L205 98 L259 107 L432 107','--blue')+csPkt('M432 107 L259 107 L205 116 L84 164','--amber');
  const STEPS=[
    {glow:csGlow(230,107,'--cyan',23)+csGlow(452,107,'--cyan',24), dyn:'', cap:'Recap: between the switch and the router there is <b>one trunk</b>, and <b>all</b> inter-VLAN traffic flows through it.'},
    {glow:csGlow(452,107,'--red',24), dyn:jam, cap:'More and more inter-VLAN traffic crowds onto <b>one cable</b>. It becomes a <b>bottleneck</b> – the router and the link can’t keep up.'},
    {glow:csGlow(64,50,'--blue')+csGlow(230,107,'--cyan',23)+csGlow(452,107,'--cyan',24)+csGlow(64,166,'--amber'), dyn:hair, cap:'And even a single packet takes a <b>detour</b>: A → switch → <b>out to the router</b> → back into the switch → SERVER. A pointless round trip (a <b>hairpin</b>).'},
    {glow:csGlow(230,107,'--green',23), dyn:'', cap:'What if the switch could route <b>inside itself</b> – with no detour to an external router? That’s exactly what an <b>L3 switch</b> does (next module).'}
  ];
  function show(i){const g=$('c3s1glow');if(g)g.innerHTML=STEPS[i].glow||'';const d=$('c3s1dyn');if(d)d.innerHTML=STEPS[i].dyn;const c=$('c3s1cap');if(c)c.innerHTML='<span>'+STEPS[i].cap+'</span>';}
  courseStepper('c3s1',STEPS.length,show);
}
// L5M2 — SVI (a gateway inside the switch)
function renderC3SVI(){
  const svg='<svg id="c3s2svg" viewBox="0 0 640 210" width="100%" style="display:block">'
    +'<line x1="83.7" y1="67.4" x2="296.3" y2="103.9" style="stroke:var(--blue);stroke-width:1.6"/><line x1="83.7" y1="146.8" x2="296.3" y2="111.9" style="stroke:var(--amber);stroke-width:1.6"/>'
    +'<g id="c3s2glow"></g>'
    +csDev(320,108,'l3switch','L3 SWITCH')
    +csHost(64,64,'desktop','--blue','A·V10')+csHost(64,150,'server','--amber','SRV·V20')
    +'<g><rect x="392" y="84" width="92" height="16" rx="4" style="fill:var(--blue);fill-opacity:.12;stroke:var(--blue);stroke-width:1"/><text x="438" y="96" text-anchor="middle" style="font:700 7px var(--mono);fill:var(--blue)">SVI 10 · .1</text></g>'
    +'<g><rect x="392" y="116" width="92" height="16" rx="4" style="fill:var(--amber);fill-opacity:.12;stroke:var(--amber);stroke-width:1"/><text x="438" y="128" text-anchor="middle" style="font:700 7px var(--mono);fill:var(--amber)">SVI 20 · .1</text></g>'
    +'<g id="c3s2dyn"></g></svg>';
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'An <b>L3 switch</b> is a switch that can also <b>route</b>. Instead of an external router it has, for each VLAN, a <b>virtual interface – an SVI</b> (Switch Virtual Interface). The SVI is <b>that VLAN’s gateway (.1)</b>, but it lives <b>inside the switch</b>. Unlike the <b>subinterface</b> from the previous lesson (one physical port split by tags), an SVI needs no extra physical port. Inter-VLAN traffic is then switched <b>within one device</b>, at full hardware speed and with <b>no detour</b> out. No hairpin, no single-trunk bottleneck.'+'</p>'
    +'<div class="osi-stage">'+svg+'</div>'
    +'<div class="m1-cap" id="c3s2cap"></div>'
    +courseStepControls('c3s2')
    +abbrBox([['SVI','Switch Virtual Interface – a switch’s virtual L3 interface for one VLAN; it is that VLAN’s gateway (.1).'],['L3 switch','a switch that can route between VLANs on its own (via SVIs), without an external router.']]);
}
function mountC3SVI(){
  const up=csPkt('M84 64 L300.3 104.6','--blue');
  const down=csPkt('M300.3 111.2 L84 150','--amber');
  const STEPS=[
    {glow:csGlow(320,108,'--green',24), dyn:'', cap:'The L3 switch has an <b>SVI for each VLAN</b> inside: SVI 10 (.1) and SVI 20 (.1). Each is <b>its VLAN’s gateway</b> – right inside the switch.'},
    {glow:csGlow(64,64,'--blue')+csGlow(320,108,'--blue',24), dyn:up, cap:'A (VLAN 10) sends traffic to its gateway = <b>SVI 10</b>. It’s right inside the switch – nothing leaves the box.'},
    {glow:csGlow(320,108,'--green',24)+csGlow(64,150,'--amber'), dyn:down, cap:'The switch <b>internally</b> routes from SVI 10 to SVI 20 and delivers to the <b>SERVER</b> (VLAN 20). <b>No detour to a router</b>, full speed.'},
    {glow:csGlow(320,108,'--green',24), dyn:'', cap:'An SVI = a <b>switch’s virtual L3 interface</b> for one VLAN. The gateway lives in the switch and inter-VLAN traffic is switched inside – cleanly and fast. <b>How the switch knows where to route</b> is the next module.'}
  ];
  function show(i){const g=$('c3s2glow');if(g)g.innerHTML=STEPS[i].glow||'';const d=$('c3s2dyn');if(d)d.innerHTML=STEPS[i].dyn;const c=$('c3s2cap');if(c)c.innerHTML='<span>'+STEPS[i].cap+'</span>';}
  courseStepper('c3s2',STEPS.length,show);
}
// L5M3 — The routing table on the switch (directly-connected VLAN subnets)
function renderC3L3Table(){
  const row=(y,vlan,subnet,svi,c)=>'<g><rect id="c3s3row'+vlan+'" x="70" y="'+(y-15)+'" width="500" height="28" rx="5" style="fill:var('+c+');fill-opacity:0;stroke:var('+c+');stroke-width:1.1;stroke-opacity:.4"/><text x="86" y="'+(y+4)+'" style="font:700 10px var(--mono);fill:var('+c+')">VLAN '+vlan+'</text><text x="200" y="'+(y+4)+'" style="font:600 10px var(--mono);fill:var(--txt)">'+subnet+'</text><text x="420" y="'+(y+4)+'" style="font:600 9px var(--mono);fill:var('+c+')">'+svi+'</text></g>';
  const svg='<svg id="c3s3svg" viewBox="0 0 640 168" width="100%" style="display:block">'
    +'<text x="86" y="26" style="font:700 8.5px var(--sans);fill:var(--muted)">'+'L3 switch routing table'+'</text>'
    +'<text x="86" y="46" style="font:700 7px var(--sans);fill:var(--muted)">'+'NETWORK (VLAN)'+'</text><text x="200" y="46" style="font:700 7px var(--sans);fill:var(--muted)">'+'SUBNET'+'</text><text x="420" y="46" style="font:700 7px var(--sans);fill:var(--muted)">'+'OUT VIA'+'</text>'
    +row(74,'10','10.0.10.0/24','SVI 10 ('+'connected'+')','--blue')
    +row(110,'20','10.0.20.0/24','SVI 20 ('+'connected'+')','--amber')
    +'<g id="c3s3dyn"></g></svg>';
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'How does the L3 switch <b>know where to send a packet</b>? It has a <b>routing table</b> – a list of networks and how to reach them. Each VLAN with its SVI is a <b>directly connected network</b> for the switch: VLAN 10 = 10.0.10.0/24 (the /24 notation = the network size, which you know from subnetting in the ISO/OSI course) out via SVI 10, VLAN 20 = 10.0.20.0/24 out via SVI 20. The switch looks at the destination IP, <b>finds the row</b> and sends the packet out the right SVI.'+'</p>'
    +'<div class="osi-stage">'+svg+'</div>'
    +'<div class="m1-cap" id="c3s3cap"></div>'
    +courseStepControls('c3s3')
    +abbrBox([['routing table','a list of destination networks and how to reach each – the L3 device decides by it.'],['directly connected','a network the device is directly attached to (here via an SVI); it knows it automatically.']]);
}
function mountC3L3Table(){
  const hi=(v)=>{['10','20'].forEach(function(r){var el=$('c3s3row'+r);if(el)el.style.fillOpacity=(r===v)?'0.16':'0';});};
  const arrow=(t,c)=>'<text x="86" y="150" style="font:700 8.5px var(--sans);fill:var('+c+')">'+esc(t)+'</text>';
  const STEPS=[
    {hl:'', dyn:'', cap:'The table has <b>two rows</b> – one per VLAN. Both networks are <b>directly connected</b> via their SVIs, the switch knows them on its own.'},
    {hl:'20', dyn:arrow('dest 10.0.20.5 → looking up the table…','--amber'), cap:'A sends a packet to <b>10.0.20.5</b>. The switch scans the table and <b>finds a match</b>: 10.0.20.0/24 = <b>VLAN 20</b>.'},
    {hl:'20', dyn:arrow('→ out via SVI 20, delivered to VLAN 20','--green'), cap:'Per the row it sends the packet <b>out via SVI 20</b> into VLAN 20 – to the server. Routing happened <b>inside the switch</b>.'},
    {hl:'', dyn:'', cap:'An L3 switch knows directly-connected VLANs <b>automatically</b> (thanks to SVIs). For destinations <b>outside</b> these networks (e.g. the internet) it needs a <b>default route</b> to a router – that’s the routing course.'}
  ];
  function show(i){hi(STEPS[i].hl);const d=$('c3s3dyn');if(d)d.innerHTML=STEPS[i].dyn;const c=$('c3s3cap');if(c)c.innerHTML='<span>'+STEPS[i].cap+'</span>';}
  courseStepper('c3s3',STEPS.length,show);
}
// L5M4 — When a router and when an L3 switch
function renderC3RouterVsL3(){
  const svg='<svg id="c3s4svg" viewBox="0 0 640 176" width="100%" style="display:block">'
    +'<line x1="320" y1="20" x2="320" y2="156" style="stroke:var(--line2);stroke-width:1.2;stroke-dasharray:4 4"/>'
    +'<g id="c3s4glow"></g>'
    +csDev(150,60,'router','ROUTER')+csDev(490,60,'l3switch','L3 SWITCH')
    +'<g id="c3s4dyn"></g></svg>';
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'So <b>when a router and when an L3 switch</b>? Both move traffic between networks, but each is good at something different. A <b>router</b> sits at the <b>network edge</b>: internet uplink (WAN), <b>NAT</b>, firewall (you’ve met NAT and the firewall briefly in the ISO/OSI course; they’re covered in depth in the routing course and the network security course) and VPN – but it has only <b>a few interfaces</b>. It can do inter-VLAN too, yet it has neither the capacity for tens of gigabits inside the LAN nor the ports to plug them into. An <b>L3 switch</b> is the <b>backbone inside the LAN</b>: dozens of ports and inter-VLAN routing in <b>hardware</b>, so it carries huge volumes – but it has <b>no WAN interface</b> for the provider’s line and its <b>NAT and firewall features are thin</b> (if present at all). In practice they <b>work together</b>: the L3 switch routes inside, the router holds the edge.'+'</p>'
    +'<div class="osi-stage">'+svg+'</div>'
    +'<div class="m1-cap" id="c3s4cap"></div>'
    +courseStepControls('c3s4')
    +abbrBox([['router','the network edge: WAN/internet, NAT, firewall, VPN; routes between VLANs too, but has few ports and little capacity for it.'],['L3 switch','the internal backbone: many ports, hardware inter-VLAN routing; no WAN interface and no rich NAT/firewall.']]);
}
function mountC3RouterVsL3(){
  const li=(x,y,t,c)=>'<text x="'+x+'" y="'+y+'" text-anchor="middle" style="font:600 8.5px var(--sans);fill:var('+c+')">'+esc(t)+'</text>';
  const routerB=li(150,108,'• WAN / internet','--txt')+li(150,124,'• NAT, firewall, VPN','--txt')+li(150,140,'• only a few ports','--muted');
  const l3B=li(490,108,'• many ports','--txt')+li(490,124,'• inter-VLAN in hardware','--txt')+li(490,140,'• no WAN interface','--muted');
  const STEPS=[
    {glow:'', dyn:'', cap:'Two tools for moving between networks. They look similar but suit different spots.'},
    {glow:csGlow(150,60,'--cyan',24), dyn:routerB, cap:'A <b>router</b> = the <b>network edge</b>: internet (WAN), NAT, firewall, VPN. It can route between VLANs, but it has <b>too few ports and too little capacity</b> for it.'},
    {glow:csGlow(490,60,'--green',24), dyn:routerB+l3B, cap:'An <b>L3 switch</b> = the <b>backbone inside the LAN</b>: many ports and inter-VLAN routing in <b>hardware</b>. But <b>no WAN interface</b> and no proper NAT/firewall.'},
    {glow:csGlow(150,60,'--cyan',24)+csGlow(490,60,'--green',24), dyn:routerB+l3B+'<line x1="192" y1="86" x2="448" y2="86" style="stroke:var(--cyan);stroke-width:1.8"/>'+li(320,78,'in practice they cooperate','--cyan'), cap:'Rule: <b>inter-VLAN inside the company → L3 switch</b>, <b>network edge (internet, NAT, firewall) → router</b>. In a large network commonly <b>both together</b>.'}
  ];
  function show(i){const g=$('c3s4glow');if(g)g.innerHTML=STEPS[i].glow||'';const d=$('c3s4dyn');if(d)d.innerHTML=STEPS[i].dyn;const c=$('c3s4cap');if(c)c.innerHTML='<span>'+STEPS[i].cap+'</span>';}
  courseStepper('c3s4',STEPS.length,show);
}
/* ---------- COURSE 3 / Lesson 6 — Guests and IoT: isolation in practice ---------- */
// L6M1 — Three worlds on one network
function renderC3ThreeWorlds(){
  const svg='<svg id="c3i1svg" viewBox="0 0 640 210" width="100%" style="display:block">'
    +'<line x1="83.6" y1="56.1" x2="300.4" y2="101.9" style="stroke:var(--green);stroke-width:1.5"/><line x1="556.4" y1="56.1" x2="339.6" y2="101.9" style="stroke:var(--green);stroke-width:1.5"/><line x1="83.6" y1="155.9" x2="300.4" y2="110.1" style="stroke:var(--cyan);stroke-width:1.5"/><line x1="556.4" y1="155.9" x2="339.6" y2="110.1" style="stroke:var(--amber);stroke-width:1.5"/>'
    +'<g id="c3i1glow"></g>'
    +csDev(320,106,'l2switch','SWITCH')
    +csHost(64,52,'desktop','--green','PC·corp')+csHost(576,52,'server','--green','SERVER')+csHost(64,160,'mobile','--cyan','GUEST')+csHost(576,160,'camera','--amber','CAMERA·IoT')
    +'<g id="c3i1dyn"></g></svg>';
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'In a real company not all devices are equal. There are <b>three worlds</b> with very different levels of trust: <b>corporate</b> (employee PCs, servers – sensitive data), <b>guests</b> (strangers’ phones and laptops on Wi-Fi – you trust them not at all) and <b>IoT</b> (cameras, bulbs, sensors – weakly secured, rarely updated). When they all hang on <b>one flat network</b>, a guest and a camera sit right next to the accounting server. That’s a problem.'+'</p>'
    +'<div class="osi-stage">'+svg+'</div>'
    +'<div class="m1-cap" id="c3i1cap"></div>'
    +courseStepControls('c3i1')
    +abbrBox([['trust level','how much you trust a device: corporate (high), guest (none), IoT (weakly secured).'],['flat network','everything in one network/VLAN – anyone reaches anyone. Dangerous for a mix of trust levels.']]);
}
function mountC3ThreeWorlds(){
  const STEPS=[
    {glow:csGlow(64,52,'--green')+csGlow(576,52,'--green')+csGlow(64,160,'--cyan')+csGlow(576,160,'--amber'), dyn:'', cap:'Three kinds of device, three trust levels: <b>corporate</b> (green, sensitive), <b>guest</b> (cyan, foreign), <b>IoT</b> (amber, vulnerable).'},
    {glow:csGlow(64,160,'--cyan')+csGlow(320,106,'--red',23)+csGlow(576,52,'--red'), dyn:csPkt('M84 158 L293 112 L347 100 L556 54','--red'), cap:'On a flat network a guest <b>reaches the company SERVER</b> – nothing stops it. A stranger’s phone right next to the accounting server. <b>That’s wrong.</b>'},
    {glow:csGlow(576,160,'--amber')+csGlow(320,106,'--red',23)+csGlow(64,52,'--red'), dyn:csPkt('M556 158 L347 112 L293 100 L84 54','--red'), cap:'And a vulnerable <b>IoT camera</b> sits right next to corporate <b>PCs</b>. If someone takes it over, they get straight in further. The weak link infects the whole.'},
    {glow:csGlow(64,52,'--green')+csGlow(576,52,'--green')+csGlow(64,160,'--cyan')+csGlow(576,160,'--amber'), dyn:'', cap:'You know the fix: put <b>each world in its own VLAN</b> and control who may cross. Corporate, guest and IoT apart. How to do it in practice – next modules.'}
  ];
  function show(i){const g=$('c3i1glow');if(g)g.innerHTML=STEPS[i].glow||'';const d=$('c3i1dyn');if(d)d.innerHTML=STEPS[i].dyn;const c=$('c3i1cap');if(c)c.innerHTML='<span>'+STEPS[i].cap+'</span>';}
  courseStepper('c3i1',STEPS.length,show);
}
// L6M2 — Guest VLAN in practice (internet only, no LAN)
function renderC3GuestVlan(){
  const svg='<svg id="c3i2svg" viewBox="0 0 640 210" width="100%" style="display:block">'
    +'<line x1="83.7" y1="146.8" x2="230.3" y2="123.2" style="stroke:var(--cyan);stroke-width:1.6"/>'
    +'<line x1="269.2" y1="114.5" x2="436.9" y2="66.6" style="stroke:var(--line2);stroke-width:1.5"/><line x1="269.5" y1="124.6" x2="440.5" y2="165.4" style="stroke:var(--line2);stroke-width:1.5"/>'
    +'<g id="c3i2glow"></g>'
    +csDev(250,120,'l2switch','SWITCH')+csDev(460,60,'internet','INTERNET')
    +csHost(64,150,'mobile','--cyan','HOST·guest')+csHost(460,170,'server','--green','CORP SERVER')
    +'<g id="c3i2dyn"></g></svg>';
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'A <b>guest VLAN</b> is completely routine – visitor Wi-Fi in an office, café, clinic. The guest gets <b>their own VLAN</b> from which they <b>only see the internet</b>, but <b>not the company network</b>. A <b>rule (ACL / firewall)</b> between the guest VLAN and the corporate VLANs enforces it: "out to the internet yes, into the LAN no." The guest can browse, but <b>can’t reach</b> servers, printers or cameras. We’ll show exactly how such a rule is written in a moment.'+'</p>'
    +'<div class="osi-stage">'+svg+'</div>'
    +'<div class="m1-cap" id="c3i2cap"></div>'
    +courseStepControls('c3i2')
    +abbrBox([['guest VLAN','a separate VLAN for visitors – internet only, access to the corporate LAN denied.'],['ACL','a permit/deny rule list between networks (VLANs) – here "guest → internet yes, → LAN no".']]);
}
function mountC3GuestVlan(){
  const ok=csPkt('M84 150 L223 124 L277 112 L440.8 65.5','--green')+'<text x="350" y="150" text-anchor="middle" style="font:700 8px var(--sans);fill:var(--green)">'+esc('internet → allowed')+'</text>';
  const blk=csPkt('M84 150 L230.3 123.2','--red')+'<text x="300" y="120" text-anchor="middle" style="font:800 20px var(--mono);fill:var(--red)">✕</text><text x="330" y="160" text-anchor="middle" style="font:700 8px var(--sans);fill:var(--red)">'+esc('into corporate LAN → blocked')+'</text>';
  const STEPS=[
    {glow:csGlow(64,150,'--cyan'), dyn:'', cap:'The guest is in <b>their own guest VLAN</b>. Now we decide where they may go: to the internet, or into the company?'},
    {glow:csGlow(64,150,'--cyan')+csGlow(250,120,'--green',22)+csGlow(460,60,'--green',24), dyn:ok, cap:'<b>To the internet</b>: traffic passes through the switch and out – the guest browses normally. This is <b>allowed</b>.'},
    {glow:csGlow(64,150,'--cyan')+csGlow(250,120,'--red',22)+csGlow(460,170,'--green'), dyn:blk, cap:'<b>To the company SERVER</b>: the inter-VLAN rule <b>blocks</b> it. The guest <b>cannot reach</b> corporate data.'},
    {glow:csGlow(64,150,'--cyan'), dyn:'', cap:'The guest-VLAN rule: <b>internet yes, LAN no</b>. Visitors get Wi-Fi, the company stays safe. You’ll try exactly this in the <b>guest-iso</b> task.'}
  ];
  function show(i){const g=$('c3i2glow');if(g)g.innerHTML=STEPS[i].glow||'';const d=$('c3i2dyn');if(d)d.innerHTML=STEPS[i].dyn;const c=$('c3i2cap');if(c)c.innerHTML='<span>'+STEPS[i].cap+'</span>';}
  courseStepper('c3i2',STEPS.length,show);
}
// L6M3 — IoT and blast radius
function renderC3IoTBlast(){
  const svg='<svg id="c3i3svg" viewBox="0 0 640 210" width="100%" style="display:block">'
    +'<line x1="84" y1="106" x2="260" y2="106" style="stroke:var(--amber);stroke-width:1.6"/>'
    +'<line x1="302.6" y1="101.6" x2="520.4" y2="59.8" style="stroke:var(--green);stroke-width:1.5"/><line x1="299.6" y1="110.2" x2="520.4" y2="157.8" style="stroke:var(--green);stroke-width:1.5"/>'
    +'<g id="c3i3glow"></g>'
    +csDev(280,106,'l2switch','SWITCH')
    +csHost(64,106,'camera','--amber','CAMERA·IoT')+csHost(540,56,'server','--green','SERVER')+csHost(540,162,'nas','--green','DATA / NAS')
    +'<g id="c3i3dyn"></g></svg>';
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'IoT devices (cameras, bulbs, sensors) tend to be <b>weakly secured</b>: default passwords, no updates, cheap firmware. An attacker <b>takes over such a camera easily</b>. The question is then: <b>how far can they get from there?</b> That’s the <b>blast radius</b>. On a flat network it’s huge – from the camera they hop to servers and data. In a <b>dedicated IoT VLAN</b> it’s tiny – the camera reaches nowhere further.'+'</p>'
    +'<div class="osi-stage">'+svg+'</div>'
    +'<div class="m1-cap" id="c3i3cap"></div>'
    +courseStepControls('c3i3')
    +abbrBox([['blast radius','how far an attacker gets from a compromised device. Smaller = better. A VLAN shrinks it.'],['lateral movement','an attacker hopping from one device to the next inside the network.']]);
}
function mountC3IoTBlast(){
  const spread=csPkt('M84 106 L260 106','--red')+csPkt('M299.6 102.2 L520.4 59.8','--red')+csPkt('M299.6 110.2 L520.4 157.8','--red')+'<text x="400" y="200" text-anchor="middle" style="font:700 8px var(--sans);fill:var(--red)">'+esc('blast radius large – attacker hops onward')+'</text>';
  const contained=csPkt('M84 106 L260 106','--red')+'<text x="300" y="76" text-anchor="middle" style="font:800 20px var(--mono);fill:var(--red)">✕</text><text x="430" y="200" text-anchor="middle" style="font:700 8px var(--sans);fill:var(--green)">'+esc('blast radius small – isolated in a VLAN')+'</text>';
  const STEPS=[
    {glow:csGlow(64,106,'--red'), dyn:'', cap:'The <b>camera</b> has a default password and years without updates. The attacker <b>takes it over</b>. Now what?'},
    {glow:csGlow(64,106,'--red')+csGlow(280,106,'--red',23)+csGlow(540,56,'--red')+csGlow(540,162,'--red'), dyn:spread, cap:'<b>Flat network</b>: from the camera the attacker <b>hops onward</b> – to the SERVER and the DATA. The <b>blast radius is huge</b>, one weak device endangers everything (lateral movement).'},
    {glow:csGlow(64,106,'--red')+csGlow(280,106,'--red',23)+csGlow(540,56,'--green')+csGlow(540,162,'--green'), dyn:contained, cap:'<b>Dedicated IoT VLAN</b>: the camera is <b>boxed in</b>. The attacker has it, but <b>can’t get further</b> – the SERVER and DATA are safe. <b>Blast radius tiny.</b>'},
    {glow:csGlow(64,106,'--amber')+csGlow(540,56,'--green')+csGlow(540,162,'--green'), dyn:'', cap:'Principle: <b>isolate weak devices</b> (IoT) into their own VLAN. If one falls, <b>the damage stays small</b>. That’s defense in depth – more in the security course.'}
  ];
  function show(i){const g=$('c3i3glow');if(g)g.innerHTML=STEPS[i].glow||'';const d=$('c3i3dyn');if(d)d.innerHTML=STEPS[i].dyn;const c=$('c3i3cap');if(c)c.innerHTML='<span>'+STEPS[i].cap+'</span>';}
  courseStepper('c3i3',STEPS.length,show);
}
// L6M4 — ACL: who may cross between VLANs (a list of rules, first match, default policy)
function renderC3Acl(){
  const svg='<svg id="c3aclsvg" viewBox="0 0 640 232" width="100%" style="display:block">'
    +'<line x1="100" y1="74" x2="278" y2="74" style="stroke:var(--cyan);stroke-width:1.6"/>'
    +'<line x1="322" y1="66" x2="500" y2="50" style="stroke:var(--line2);stroke-width:1.5;stroke-dasharray:2 3"/>'
    +'<line x1="322" y1="78" x2="500" y2="102" style="stroke:var(--line2);stroke-width:1.5;stroke-dasharray:2 3"/>'
    +'<g id="c3aclglow"></g>'
    +csDev(300,70,'l3switch','L3 / FW')
    +csHost(80,70,'mobile','--cyan','HOST·guest')
    +csDev(520,45,'internet','INTERNET')
    +csHost(520,105,'server','--green','CORP LAN')
    +'<g id="c3acldyn"></g></svg>';
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'You’ve seen the guest VLAN and IoT isolation – but what exactly decides that a guest <b>may</b> reach the internet and <b>may not</b> reach the corporate LAN? A VLAN can only <b>separate</b> (it builds a wall). What may pass <b>through</b> is decided by a <b>list of rules = an ACL</b> (Access Control List). Without an ACL, it’s either <b>everything</b> or <b>nothing</b> between VLANs – no fine control. Let’s see what such a rule looks like and how it’s evaluated.'+'</p>'
    +'<div class="osi-stage">'+svg+'</div>'
    +'<div class="m1-cap" id="c3aclcap"></div>'
    +courseStepControls('c3acl')
    +abbrBox([['ACL','Access Control List – a permit/deny rule list that controls who may cross between VLANs (networks).'],['first match','rules are read top-down; the FIRST one that matches the traffic wins – the rest is not read.'],['default policy','what happens when no rule matches – typically "deny all" (whatever isn’t permitted is denied).']]);
}
function mountC3Acl(){
  const okPkt='<rect x="-7" y="-5" width="14" height="10" rx="2" style="fill:var(--green)"><animateMotion path="M100 74 L280 74 L505 50" dur="'+CRS_DUR+'" repeatCount="indefinite"/></rect>';
  const rulesNote='<text x="300" y="150" text-anchor="middle" style="font:700 8px var(--sans);fill:var(--cyan)">'+esc('ACL = a list of rules')+'</text>';
  const whereNote='<text x="300" y="150" text-anchor="middle" style="font:700 8px var(--sans);fill:var(--muted)">'+esc('L3 switch · managed switch · firewall')+'</text>';
  const struct2=okPkt
    +'<text x="300" y="150" text-anchor="middle" style="font:700 8px var(--sans);fill:var(--muted)">'+esc('source → destination · protocol/port · action')+'</text>'
    +'<text x="300" y="170" text-anchor="middle" style="font:700 8px var(--sans);fill:var(--green)">'+esc('guest → internet : PERMIT')+'</text>'
    +'<text x="300" y="188" text-anchor="middle" style="font:700 8px var(--sans);fill:var(--red)">'+esc('guest → corporate LAN : DENY')+'</text>';
  const rrow=(y,n,rule,act,c)=>'<g><rect x="150" y="'+(y-13)+'" width="340" height="22" rx="5" style="fill:var('+c+');fill-opacity:.08;stroke:var('+c+');stroke-width:1;stroke-opacity:.5"/>'
    +'<text x="162" y="'+(y+3)+'" style="font:700 9px var(--mono);fill:var('+c+')">'+n+'</text>'
    +'<text x="186" y="'+(y+3)+'" style="font:500 9px var(--sans);fill:var(--txt)">'+esc(rule)+'</text>'
    +'<text x="478" y="'+(y+3)+'" text-anchor="end" style="font:700 8px var(--mono);fill:var('+c+')">'+esc(act)+'</text></g>';
  const fall='<line x1="132" y1="150" x2="132" y2="208" style="stroke:var(--muted);stroke-width:1;stroke-dasharray:2 3;opacity:.5"/><rect x="-6" y="-4" width="12" height="8" rx="2" style="fill:var(--cyan)"><animateMotion path="M132 150 L132 183" dur="'+CRS_DUR+'" repeatCount="indefinite"/></rect>'
    +'<text x="132" y="145" text-anchor="middle" style="font:700 7px var(--sans);fill:var(--cyan)">'+esc('guest → internet')+'</text>';
  const evalDyn=rrow(158,'1','guest → CORP LAN','DENY','--muted')
    +rrow(183,'2','guest → internet','PERMIT','--green')
    +rrow(208,'3','* default policy','DENY ALL','--muted')
    +fall+'<text x="500" y="186" style="font:800 13px var(--mono);fill:var(--green)">✓</text>';
  const STEPS=[
    {glow:csGlow(300,70,'--cyan',22), dyn:rulesNote, cap:'A VLAN is a <b>wall</b> – by itself it lets either <b>everything</b> or <b>nothing</b> between VLANs. An <b>ACL</b> (Access Control List) is a <b>list of rules</b> that decides exactly what may pass through. It is what provides the fine control "this yes, that no".'},
    {glow:csGlow(300,70,'--cyan',22), dyn:whereNote, cap:'Where does an ACL sit? On the device <b>the inter-VLAN traffic passes through</b> – an <b>L3 switch</b>, a <b>managed switch</b> or a <b>firewall</b>. How do you tell which one? Trace the path from source to destination in the topology – the rule belongs on the <b>first L3 device</b> that actually carries the traffic between those VLANs. In these examples there is only one such device; in a larger network you meet several along the path, and the one that matters is where inter-VLAN traffic first turns. The VLAN divides, the <b>rules guard</b>. Without such a device the VLANs wouldn’t meet at all (you know that from earlier lessons).'},
    {glow:csGlow(80,70,'--cyan')+csGlow(300,70,'--green',22)+csGlow(520,45,'--green',22), dyn:struct2, cap:'What a rule is made of: <b>source → destination</b>, <b>protocol/port</b> and an <b>action</b> (permit / deny). Example: "<b>guest → internet: permit</b>" and "<b>guest → corporate LAN: deny</b>". Exactly these two rules make the guest VLAN from the previous module.'},
    {glow:csGlow(300,70,'--cyan',22), dyn:evalDyn, cap:'How it’s evaluated: rules are read <b>top-down</b> and the <b>FIRST MATCH wins</b>. The "guest → internet" packet skips rule 1 (different destination), <b>matches rule 2 → permitted</b>, and no further rule is read. If nothing matched, the <b>default policy</b> applies (rule 3, "deny all"). <b>Rule order matters.</b>'},
    {glow:csGlow(300,70,'--cyan',22), dyn:whereNote, cap:'In the <b>simulator</b>: on an <b>L3 / managed switch</b> open the <b>ACL rules</b> section (on a firewall the <b>Rules</b> tab) and write source → destination → action rules. You’ll use exactly this in the <b>guest-iso</b> and <b>vlan-design</b> tasks. More advanced topics (shadowed rules, a stateful firewall) come in the <b>network security course</b>.'}
  ];
  function show(i){const g=$('c3aclglow');if(g)g.innerHTML=STEPS[i].glow||'';const d=$('c3acldyn');if(d)d.innerHTML=STEPS[i].dyn||'';const c=$('c3aclcap');if(c)c.innerHTML='<span>'+STEPS[i].cap+'</span>';}
  courseStepper('c3acl',STEPS.length,show);
}
/* ---------- COURSE 3 / Lesson 7 — The whole journey together ---------- */
// Shared full-topology SVG used by L7 M1 (layers) and M2 (journey)
function c3FullTopoSvg(pfx){
  return '<svg id="'+pfx+'svg" viewBox="0 0 640 236" width="100%" style="display:block">'
    +'<line x1="60" y1="66" x2="60" y2="114" style="stroke:var(--line2);stroke-width:1.4"/>'
    +'<line x1="76" y1="126" x2="178" y2="99.6" style="stroke:var(--green);stroke-width:1.6"/>'
    +'<line x1="222.1" y1="80.7" x2="344" y2="54" style="stroke:var(--cyan);stroke-width:1.8"/><line x1="221.7" y1="100.2" x2="344" y2="146" style="stroke:var(--cyan);stroke-width:1.8"/>'
    +'<line x1="376" y1="48" x2="504" y2="28" style="stroke:var(--blue);stroke-width:1.4"/><line x1="376" y1="53" x2="504" y2="81" style="stroke:var(--cyan);stroke-width:1.4"/>'
    +'<line x1="376" y1="149" x2="504" y2="145" style="stroke:var(--amber);stroke-width:1.4"/><line x1="376" y1="155" x2="504" y2="193" style="stroke:var(--violet);stroke-width:1.4"/>'
    +'<g id="'+pfx+'glow"></g>'
    +csDev(60,50,'internet','INTERNET')+csDev(60,130,'router','ROUTER')+csDev(200,90,'l3switch','L3 core')+csDev(360,50,'l2switch','SW-A')+csDev(360,150,'l2switch','SW-B')
    +csHost(520,26,'desktop','--blue','PC·V10')+csHost(520,84,'mobile','--cyan','HOST·guest')+csHost(520,144,'server','--amber','SRV·V20')+csHost(520,198,'camera','--violet','CAM·IoT')
    +'<g id="'+pfx+'dyn"></g></svg>';
}
// L7M1 — The whole topology layer by layer
function renderC3FullTopo(){
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'Let’s put it all together. This is a <b>whole small-company network</b> built from exactly what you know: <b>access switches</b> with VLANs on ports, <b>trunks</b> between them, an <b>L3 core switch</b> that routes between VLANs via SVIs, and a <b>router</b> at the edge to the internet. Corporate (V10), servers (V20), guests and IoT – each in its own VLAN. A network is built in <b>tiers</b>: the <b>access layer</b> (switches end devices plug into), the <b>core / backbone</b> (a powerful L3 switch in the middle where VLANs meet and route) and the <b>edge</b> (a router out to the internet). In large networks there is also a <b>distribution layer</b> between access and core – we skip it here for simplicity. We’ll walk it <b>layer by layer</b>.'+'</p>'
    +'<div class="osi-stage">'+c3FullTopoSvg('c3f1')+'</div>'
    +'<div class="m1-cap" id="c3f1cap"></div>'
    +courseStepControls('c3f1')
    +abbrBox([['access layer','the switches end devices plug into; ports are access (one VLAN).'],['core (backbone)','the central L3 switch that routes between VLANs (SVIs) – the network backbone where VLANs meet.'],['distribution layer','a middle tier between access and core in large networks; a small company doesn’t need it.'],['edge','the router at the network edge – internet uplink, NAT, firewall.']]);
}
function mountC3FullTopo(){
  const trunkHi='<line x1="222.1" y1="80.7" x2="344" y2="54" style="stroke:var(--cyan);stroke-width:3.4"/><line x1="221.7" y1="100.2" x2="344" y2="146" style="stroke:var(--cyan);stroke-width:3.4"/>';
  const STEPS=[
    {glow:'', cap:'The whole network together. Four kinds of device, four VLANs, one smart topology. Let’s go layer by layer from the bottom.'},
    {glow:csGlow(360,50,'--cyan',24)+csGlow(360,150,'--cyan',24)+csGlow(520,26,'--blue')+csGlow(520,84,'--cyan',14)+csGlow(520,144,'--amber')+csGlow(520,198,'--violet',14), cap:'<b>Access layer</b>: end devices hang off the access ports of switches SW-A and SW-B. Each port has <b>its own VLAN</b> (V10 corporate, V20 servers, guest, IoT).'},
    {glow:csGlow(360,50,'--cyan',24)+csGlow(360,150,'--cyan',24)+csGlow(200,90,'--cyan',24), dyn:trunkHi, cap:'<b>Trunks</b>: between the access switches and the core run trunk links that carry <b>all VLANs at once</b> (with 802.1Q tags).'},
    {glow:csGlow(200,90,'--green',24), cap:'<b>L3 core switch</b>: this is where VLANs meet. Via <b>SVIs</b> (each VLAN’s gateway) it routes traffic between them – fast, inside one device.'},
    {glow:csGlow(60,50,'--cyan',24)+csGlow(60,130,'--green',24), cap:'<b>Edge</b>: the router connects the network to the <b>internet</b> (NAT, firewall). Corporate may go out, <b>guests only to the internet</b>, IoT nowhere out. The whole path makes sense.'}
  ];
  function show(i){const g=$('c3f1glow');if(g)g.innerHTML=STEPS[i].glow||'';const d=$('c3f1dyn');if(d)d.innerHTML=STEPS[i].dyn||'';const c=$('c3f1cap');if(c)c.innerHTML='<span>'+STEPS[i].cap+'</span>';}
  courseStepper('c3f1',STEPS.length,show);
}
// L7M2 — A packet traveling across the whole network
function renderC3FullJourney(){
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'And now the best part: we’ll send <b>one packet</b> from a corporate <b>PC (VLAN 10)</b> to the <b>SERVER (VLAN 20)</b> and follow it <b>all the way</b> – through the access port, the trunk, the L3 core and back. You’ll see how every piece fits together. At the end we’ll add a <b>guest to the internet</b> too.'+'</p>'
    +'<div class="osi-stage">'+c3FullTopoSvg('c3f2')+'</div>'
    +'<div class="m1-cap" id="c3f2cap"></div>'
    +courseStepControls('c3f2')
    +abbrBox([['end-to-end path','PC → access switch → trunk → L3 core (routing) → trunk → access switch → server.'],['default gateway','the PC sends traffic to another VLAN to its gateway first = an SVI on the L3 core switch.']]);
}
function mountC3FullJourney(){
  const p1=csPkt('M500 28 L380 48','--blue');
  const p2=csPkt('M340 54 L220 82','--blue');
  const p3=csPkt('M220 98 L340 146','--amber');
  const p4=csPkt('M380 149 L500 145','--amber');
  const pg=csPkt('M500 81 L376 53 L344 54 L216 82 L184 98 L80 114','--cyan');
  const STEPS=[
    {glow:csGlow(520,26,'--blue')+csGlow(520,144,'--amber'), dyn:'', cap:'Goal: <b>PC (V10)</b> → <b>SERVER (V20)</b>. A different VLAN, so it must go via the L3 core. Watch the packet.'},
    {glow:csGlow(520,26,'--blue')+csGlow(360,50,'--cyan',24), dyn:p1, cap:'1) The PC sends the packet to <b>its gateway</b> (an SVI on the core). Over the <b>V10 access port</b> it reaches <b>SW-A</b> – untagged.'},
    {glow:csGlow(360,50,'--cyan',24)+csGlow(200,90,'--cyan',24), dyn:p2, cap:'2) SW-A sends it over the <b>trunk</b> to the L3 core – now <b>tagged as VLAN 10</b> (802.1Q).'},
    {glow:csGlow(200,90,'--green',24)+csGlow(360,150,'--cyan',24), dyn:p3, cap:'3) The <b>L3 core routes</b> from V10 to V20 (via SVIs) and sends the packet over the trunk to <b>SW-B</b> – now <b>tagged as VLAN 20</b>.'},
    {glow:csGlow(360,150,'--cyan',24)+csGlow(520,144,'--amber'), dyn:p4, cap:'4) SW-B <b>removes the tag</b> and over the <b>V20 access port</b> delivers the packet to the <b>SERVER</b>. Done – all the way across the network.'},
    {glow:csGlow(520,84,'--cyan',14)+csGlow(360,50,'--cyan',24)+csGlow(200,90,'--cyan',24)+csGlow(60,130,'--cyan',24), dyn:pg, cap:'And the <b>guest</b>? Their traffic goes via the core straight to the <b>router</b> (and from there to the internet) – the rule keeps it out of corporate VLANs. <b>Everyone goes where they belong.</b>'}
  ];
  function show(i){const g=$('c3f2glow');if(g)g.innerHTML=STEPS[i].glow||'';const d=$('c3f2dyn');if(d)d.innerHTML=STEPS[i].dyn||'';const c=$('c3f2cap');if(c)c.innerHTML='<span>'+STEPS[i].cap+'</span>';}
  courseStepper('c3f2',STEPS.length,show);
}
// L7M3 — What is still missing (redundancy → Course 6)
function renderC3WhatsMissing(){
  const svg='<svg id="c3f3svg" viewBox="0 0 640 188" width="100%" style="display:block">'
    +'<line x1="174" y1="94" x2="466" y2="94" style="stroke:var(--green);stroke-width:1.8"/>'
    +'<g id="c3f3glow"></g>'
    +csDev(150,94,'l2switch','SW-A')+csDev(490,94,'l2switch','SW-B')
    +'<g id="c3f3dyn"></g></svg>';
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'You can do a lot – but one thing is still <b>missing</b> in this network: <b>reliability</b>. What if that <b>single cable</b> between the switches fails? Half the network goes down. The fix is a <b>backup link</b> – except two active paths between switches create a <b>loop</b>, which can completely flood the network. How to have a backup <b>without</b> a loop is solved by <b>Spanning Tree</b> – and that’s the whole <b>redundancy and STP course</b>.'+'</p>'
    +'<div class="osi-stage">'+svg+'</div>'
    +'<div class="m1-cap" id="c3f3cap"></div>'
    +courseStepControls('c3f3')
    +abbrBox([['redundancy','a backup path/device so the network survives the failure of one cable or switch.'],['loop','two active paths between switches → frames circle forever and flood the network (a broadcast storm).'],['Spanning Tree','a protocol that keeps one backup link blocked until needed – it prevents the loop. (the redundancy and STP course)']]);
}
function mountC3WhatsMissing(){
  const single='<line x1="174" y1="94" x2="466" y2="94" style="stroke:var(--green);stroke-width:2.6"/>'+csPkt('M170 94 L470 94','--green');
  const dead='<line x1="174" y1="94" x2="466" y2="94" style="stroke:var(--red);stroke-width:2;stroke-dasharray:5 5"/><text x="320" y="78" text-anchor="middle" style="font:800 20px var(--mono);fill:var(--red)">✕</text><text x="320" y="120" text-anchor="middle" style="font:700 8px var(--sans);fill:var(--red)">'+esc('cable fails → half the network offline')+'</text>';
  const loop='<line x1="174" y1="94" x2="466" y2="94" style="stroke:var(--amber);stroke-width:2.4"/><path d="M174 94 Q320 58 466 94" style="fill:none;stroke:var(--amber);stroke-width:2.4"/><rect x="-7" y="-5" width="14" height="10" rx="2" style="fill:var(--red)"><animateMotion path="M180 94 L460 94 Q320 60 180 94 Z" dur="1.2s" repeatCount="indefinite"/></rect><text x="320" y="126" text-anchor="middle" style="font:700 8px var(--sans);fill:var(--red)">'+esc('two active links → loop → broadcast storm')+'</text>';
  const fixed='<line x1="174" y1="94" x2="466" y2="94" style="stroke:var(--green);stroke-width:2.4"/><path d="M174 94 Q320 58 466 94" style="fill:none;stroke:var(--muted);stroke-width:2;stroke-dasharray:4 4"/><text x="320" y="112" text-anchor="middle" style="font:700 7.5px var(--sans);fill:var(--green)">'+esc('active')+'</text><text x="320" y="50" text-anchor="middle" style="font:700 7.5px var(--sans);fill:var(--muted)">'+esc('STP: backup blocked')+'</text>';
  const STEPS=[
    {glow:csGlow(150,94,'--cyan',24)+csGlow(490,94,'--cyan',24), dyn:single, cap:'Between the switches there’s <b>a single cable</b>. It works – until it doesn’t. It’s a <b>single point of failure</b>.'},
    {glow:csGlow(150,94,'--red',24)+csGlow(490,94,'--red',24), dyn:dead, cap:'If that cable <b>breaks</b>, SW-B is cut off – <b>half the network is offline</b>. We want a <b>backup link</b>.'},
    {glow:csGlow(150,94,'--red',24)+csGlow(490,94,'--red',24), dyn:loop, cap:'But <b>two active links</b> form a <b>loop</b>: each switch forwards the broadcast out every port – including back over the other link – so one frame becomes <b>two, four, eight…</b> and the network <b>drowns</b> (a broadcast storm; an L2 frame has no time-to-live counter — it never "expires"). This kills the network.'},
    {glow:csGlow(150,94,'--green',24)+csGlow(490,94,'--green',24), dyn:fixed, cap:'The fix = <b>Spanning Tree (STP)</b>: it keeps <b>one link active</b> and the backup <b>blocked</b> until needed. A backup without a loop. That’s the <b>redundancy and STP course</b> – we\'ll come back to it there.'}
  ];
  function show(i){const g=$('c3f3glow');if(g)g.innerHTML=STEPS[i].glow||'';const d=$('c3f3dyn');if(d)d.innerHTML=STEPS[i].dyn||'';const c=$('c3f3cap');if(c)c.innerHTML='<span>'+STEPS[i].cap+'</span>';}
  courseStepper('c3f3',STEPS.length,show);
}
const COURSE_3_DEF = {
  id:'course3',
title:'Switching and VLANs',
  blurb:'Switching in practice: split the network into VLANs, set up access and trunk ports, route between VLANs at L3 and secure L2.',
  lessons:[
    { id:'c3l1', title:'Everyone on one network', taskId:null, quizId:'c3q_l1', modules:[
      { id:'c3l1m1', title:'An office with no walls', render:renderC3OfficeNoWalls, mount:mountC3OfficeNoWalls },
      { id:'c3l1m2', title:'Three problems', render:renderC3ThreeProblems, mount:mountC3ThreeProblems },
      { id:'c3l1m3', title:'The physical fix is costly', render:renderC3PhysicalFix, mount:mountC3PhysicalFix }
    ]},
    { id:'c3l2', title:'VLAN: a wall you can’t see', taskId:'vlan-split', quizId:'c3q_l2', modules:[
      { id:'c3l2m0', title:'Broadcast: a message for everyone', render:renderC3WhyVlan, mount:mountC3WhyVlan },
      { id:'c3l2m1', title:'What a VLAN is', render:renderC3VlanConcept, mount:mountC3VlanConcept },
      { id:'c3l2m2', title:'How the switch knows where a frame belongs', render:renderC3VlanPorts, mount:mountC3VlanPorts },
      { id:'c3l2m3', title:'VLAN ID', render:renderC3VlanId, mount:mountC3VlanId },
      { id:'c3l2m4', title:'What a VLAN does not solve', render:renderC3VlanLimits, mount:mountC3VlanLimits }
    ]},
    { id:'c3l3', title:'Trunk: how a VLAN crosses a cable', taskId:'trunk-setup', quizId:'c3q_l3', modules:[
      { id:'c3l3m1', title:'The multiple-switch problem', render:renderC3TrunkWhy, mount:mountC3TrunkWhy },
      { id:'c3l3m2', title:'The 802.1Q tag', render:renderC3Tag, mount:mountC3Tag },
      { id:'c3l3m3', title:'Access port vs trunk port', render:renderC3AccessTrunk, mount:mountC3AccessTrunk },
      { id:'c3l3m4', title:'Native VLAN', render:renderC3NativeVlan, mount:mountC3NativeVlan }
    ]},
    { id:'c3l4', title:'Why VLANs can’t talk to each other', taskId:'router-intro', quizId:'c3q_l4', modules:[
      { id:'c3l4m1', title:'The wall works too well', render:renderC3WallTooGood, mount:mountC3WallTooGood },
      { id:'c3l4m2', title:'L3 as a translator', render:renderC3L3Translator, mount:mountC3L3Translator },
      { id:'c3l4m3', title:'Router-on-a-stick', render:renderC3RoaS, mount:mountC3RoaS }
    ]},
    { id:'c3l5', title:'The L3 switch', taskId:'inter-vlan', quizId:'c3q_l5', modules:[
      { id:'c3l5m1', title:'Where router-on-a-stick falls short', render:renderC3RoaSLimit, mount:mountC3RoaSLimit },
      { id:'c3l5m2', title:'SVI: a gateway inside the switch', render:renderC3SVI, mount:mountC3SVI },
      { id:'c3l5m3', title:'A routing table on the switch', render:renderC3L3Table, mount:mountC3L3Table },
      { id:'c3l5m4', title:'When a router, when an L3 switch', render:renderC3RouterVsL3, mount:mountC3RouterVsL3 }
    ]},
    { id:'c3l6', title:'Guests and IoT: isolation in practice', taskId:'guest-iso', quizId:'c3q_l6', modules:[
      { id:'c3l6m1', title:'Three worlds on one network', render:renderC3ThreeWorlds, mount:mountC3ThreeWorlds },
      { id:'c3l6m2', title:'Guest VLAN in practice', render:renderC3GuestVlan, mount:mountC3GuestVlan },
      { id:'c3l6m3', title:'IoT and blast radius', render:renderC3IoTBlast, mount:mountC3IoTBlast },
      { id:'c3l6m4', title:'ACL: who may cross between VLANs', render:renderC3Acl, mount:mountC3Acl }
    ]},
    { id:'c3l7', title:'The whole path together', taskId:'vlan-design', quizId:'c3q_l7', modules:[
      { id:'c3l7m1', title:'The whole topology, layer by layer', render:renderC3FullTopo, mount:mountC3FullTopo },
      { id:'c3l7m2', title:'A packet across the whole network', render:renderC3FullJourney, mount:mountC3FullJourney },
      { id:'c3l7m3', title:'What is still missing', render:renderC3WhatsMissing, mount:mountC3WhatsMissing }
    ]}
  ]
};
const COURSE_3_QUIZZES_DEF = {
  c3q_l1:{ title:'Quiz: Everyone on one network', qs:[
    { q:'What is the main problem with a <b>flat</b> network (everything in one)?',
      opts:['anyone can reach anyone – a risk to security and order','it is noticeably slower because all devices share one medium','it needs pricier cabling and beefier switches than a split network'],
      correct:0, why:'On one big network there are no boundaries between devices – the guest sees the company disk, the bulb sits next to the database. We want to separate that.' },
    { q:'A guest laptop on a flat company network can reach the accounting server. Is that intended?',
      opts:['no – nothing separates them, and that’s what we want to fix','yes, a guest on the company network may reach the accounting server','only if the guest knows the correct login password'],
      correct:0, why:'It’s not intended – it’s a side effect of a flat network. The goal is for the guest to see only the internet, not company servers.' },
    { q:'Why do we want to <b>split</b> the network into smaller parts at all?',
      opts:['so devices see only what they should – a smaller blast radius','to make the internet noticeably faster for all connected devices','so the whole network needs far fewer public IP addresses'],
      correct:0, why:'Splitting limits who can reach whom: security (guests can’t see servers), performance (less noise) and order. How to do it – next lesson.' }
  ]},
  c3q_l2:{ title:'Quiz: VLAN', qs:[
    { q:'What is a "broadcast domain"?',
      opts:['the set of devices a single broadcast reaches','a list of allowed MAC addresses configured on a port','the table where a switch stores the MACs it has learned'],
      correct:0, why:'A broadcast domain is how far a "to everyone" message reaches. In a flat network that’s the whole network.' },
    { q:'Why is a large flat network (one VLAN for everything) a problem?',
      opts:['broadcasts disturb everyone and anyone can see them – performance and security','the switches would overload and overheat from all the traffic','you would very quickly run out of free IP addresses for newly connected devices'],
      correct:0, why:'The bigger the broadcast domain, the more noise and the further sensitive traffic spreads. That’s why we split into VLANs.' },
    { q:'What is a VLAN?',
      opts:['a logical network separating devices on shared switches','a faster type of network cable used for backbone links','an encrypted tunnel joining two company branches over the internet'],
      correct:0, why:'A VLAN is a virtual network – one switch carries several separate networks, each with its own broadcast.' },
    { q:'Two devices on the same switch but in different VLANs. Can they see each other (with nothing else added)?',
      opts:['no, different VLANs are separate networks','yes, they are on the same switch after all','only if both were given the same IP address'],
      correct:0, why:'Different VLANs = different networks. To talk they need an L3 device (router / L3 switch) – that’s a later lesson.' },
    { q:'How many broadcast domains are on one switch that has two VLANs?',
      opts:['two – each VLAN is its own broadcast domain','one – it is still just a single physical switch','four – two domains for each configured VLAN'],
      correct:0, why:'Each VLAN is a separate broadcast domain, even though they run on one physical switch.' }
  ]},
  c3q_l3:{ title:'Quiz: Trunk', qs:[
    { q:'What is a <b>trunk</b> port for?',
      opts:['it carries several VLANs over one cable (between switches)','it connects a single end PC into its assigned VLAN','it speeds up the internet connection for the whole network'],
      correct:0, why:'A trunk = one cable for many VLANs. Without it you’d need one cable per VLAN.' },
    { q:'What does the <b>802.1Q</b> tag do?',
      opts:['it adds the VLAN number to the frame on a trunk','it encrypts the whole frame before it goes on the trunk','it assigns the sending device its IP address'],
      correct:0, why:'The tag carries the VLAN number so the other switch knows where the frame belongs. It’s removed again at an access port.' },
    { q:'Where do you put an <b>access</b> vs a <b>trunk</b> port?',
      opts:['access to an end device (1 VLAN), trunk between switches (many VLANs)','a trunk always runs to an end PC, an access port goes between two switches','it doesn’t matter which goes where – both work exactly the same'],
      correct:0, why:'Access = one VLAN to an end device – the tag is removed here because an ordinary PC doesn’t understand 802.1Q tags. Trunk = several tagged VLANs between switches / to a router.' },
    { q:'A frame arrives on a trunk <b>untagged</b>. Which VLAN does it belong to?',
      opts:['to the native VLAN (the trunk’s default VLAN)','nowhere – the switch always drops an untagged frame','to the VLAN with the highest number'],
      correct:0, why:'Untagged traffic belongs to the native VLAN. That’s why the native VLAN must match on both ends, or it ends up in the wrong VLAN.' }
  ]},
  c3q_l4:{ title:'Quiz: Why VLANs can’t talk', qs:[
    { q:'A device in <b>VLAN 10</b> wants a server in <b>VLAN 20</b>. What does the switch (L2) alone do?',
      opts:['it won’t pass it – it doesn’t move traffic between VLANs','it forwards it just fine, it ignores VLANs entirely','it encrypts the frame first and only then sends it on'],
      correct:0, why:'The switch only looks at MAC and keeps VLANs separate. It won’t carry traffic between VLANs – that needs an L3 device.' },
    { q:'What is needed for two VLANs to communicate?',
      opts:['an L3 device (router or L3 switch) with a gateway in each VLAN','a beefier and faster cable between the two connected switches','a few more switches plugged into a shared backbone'],
      correct:0, why:'Inter-VLAN traffic is routing – it must be done by an L3 device that has an IP (gateway) in both VLANs.' },
    { q:'What is a device’s <b>default gateway</b>?',
      opts:['the address it sends traffic destined out of its network/VLAN to','its own IP address, the one it was given in that particular VLAN','the DNS server’s address, which resolves names to IPs'],
      correct:0, why:'When the destination isn’t in its own network, the device doesn’t know the way – it sends it to the gateway (router), which forwards it on.' },
    { q:'What is <b>router-on-a-stick</b>?',
      opts:['a router routing between VLANs over one trunk split into subinterfaces','a router working completely without cables, linking all the VLANs over Wi-Fi','a plain switch fitted with only two physical ports for VLANs'],
      correct:0, why:'One physical link (trunk) carries all VLANs; on the router it splits into subinterfaces, each with its VLAN’s gateway. Cheap, but that link is a bottleneck.' }
  ]},
  c3q_l5:{ title:'Quiz: The L3 switch', qs:[
    { q:'What is the main weakness of <b>router-on-a-stick</b> in a large network?',
      opts:['all inter-VLAN traffic flows over one trunk – a bottleneck','it doesn’t work at all if you have more than two VLANs configured','it needs no separate router at all to function'],
      correct:0, why:'A single trunk to the router carries all inter-VLAN traffic and every packet hairpins out and back. In a big network that isn’t enough.' },
    { q:'What is an <b>SVI</b> on an L3 switch?',
      opts:['a switch’s virtual L3 interface for one VLAN – its gateway','a physical switch port reserved exclusively for trunk links','a special type of cable that connects an L3 switch to a router'],
      correct:0, why:'An SVI (Switch Virtual Interface) is a VLAN’s gateway (.1) inside the switch. Thanks to it inter-VLAN traffic is switched internally, with no external router.' },
    { q:'How does an L3 switch know which SVI to send a packet out of?',
      opts:['by its routing table – it finds the destination network (connected VLANs)','it picks one of the currently available SVI interfaces completely at random','it always and in every case sends each packet out via VLAN 1'],
      correct:0, why:'Each VLAN with its SVI is a directly connected network. The switch finds the destination network in the table and sends the packet out the matching SVI.' },
    { q:'When an <b>L3 switch</b> and when a <b>router</b>?',
      opts:['L3 switch for fast inter-VLAN inside the LAN, router for the edge (WAN, NAT, firewall)','use a router for absolutely everything in the LAN, an L3 switch only for the internet','it doesn’t matter which goes where – both devices do exactly the same'],
      correct:0, why:'An L3 switch routes inter-VLAN very fast in hardware but can’t do WAN/NAT. The router holds the network edge. In a large network they commonly work together.' }
  ]},
  c3q_l6:{ title:'Quiz: Guests and IoT', qs:[
    { q:'Why not put guests, IoT and corporate devices on <b>one flat network</b>?',
      opts:['they have different trust levels – a guest and weak IoT next to sensitive data','a flat network tends to be much slower and far harder to troubleshoot traffic on','you would quickly run out of available VLAN IDs for new devices'],
      correct:0, why:'Corporate data, foreign guests and vulnerable IoT each belong apart. On a flat network anyone reaches anyone – we want to separate them into VLANs.' },
    { q:'What may a device in a <b>guest VLAN</b> typically do?',
      opts:['only reach the internet – not the corporate LAN','everything across the company’s internal network','it may only print on the shared company printer'],
      correct:0, why:'A guest VLAN permits the internet and denies the corporate LAN (via a rule / ACL). The guest browses but can’t reach servers.' },
    { q:'What is the <b>blast radius</b> of a compromised device?',
      opts:['how far the attacker gets from it – a VLAN shrinks it','the measured connection speed of the compromised device','the total number of ports the compromised device physically has'],
      correct:0, why:'Blast radius = the attacker’s reach from the compromised point. Isolating into a VLAN shrinks it: only that one device falls, not the whole network.' },
    { q:'Why isolate <b>IoT</b> devices specifically?',
      opts:['they’re weakly secured (default passwords, no updates) – an easy entry point','they are among the most expensive and most sensitive devices in the firm','they need their own separate connection straight to the internet to run normally'],
      correct:0, why:'IoT is a common attack entry point. In its own VLAN a compromised camera reaches nowhere further – the damage stays small.' }
  ]},
  c3q_l7:{ title:'Quiz: The whole path', qs:[
    { q:'In the complete network: a PC in <b>VLAN 10</b> sends data to a server in <b>VLAN 20</b>. Which way does it go?',
      opts:['the SW-A access port → trunk → the L3 core switch (re-routes V10→V20) → trunk → the SW-B access port','straight from PC to server – the switch links them directly after all','out to the internet to the provider and back the very same way'],
      correct:0, why:'Different VLANs must meet at an L3 device. The packet goes over the access port, tagged on the trunk to the L3 core, which routes it into V20 and sends it back to the destination access port.' },
    { q:'What role does the <b>L3 core switch</b> play in this topology?',
      opts:['it routes between VLANs (via SVIs) – the backbone','it connects the whole internal network out to the internet','it serves purely as a backup cable in case of an outage'],
      correct:0, why:'The core L3 switch is where VLANs meet and route between each other. The internet is handled by the edge router.' },
    { q:'Why is a <b>single cable</b> between two switches a risk?',
      opts:['it’s a single point of failure – if it drops, part of the network is offline','it is simply far too fast for carrying the traffic of all those VLANs together','it can only ever carry one single VLAN at a time'],
      correct:0, why:'With no backup, that cable failing cuts off a whole branch. That’s why we want redundancy – but without creating a loop.' },
    { q:'What does <b>Spanning Tree (STP)</b> solve?',
      opts:['it allows a backup link without a loop – keeps one active, blocks the other','it greatly speeds up the routing itself between the individual VLANs in the network','it automatically assigns each VLAN its numeric VLAN ID'],
      correct:0, why:'Two active links between switches = a loop and a broadcast storm. STP keeps one path active and the backup blocked until needed. More in the redundancy and STP course.' }
  ]}
};
const COURSE_3_FINAL_EXTRA_DEF=[{ q:'A PC in VLAN 10 (access port) can’t reach a server in VLAN 20, even on the same switch. Why, and what fixes it?', opts:['different VLANs are separate networks – traffic between them needs an L3 device','they will connect only if you set both ports as trunk instead of access','restarting the switch and waiting for the MAC table usually sorts it out'], correct:0, why:'VLANs separate networks at L2. Only an L3 device (router or L3 switch) with a gateway in each VLAN moves traffic between VLANs – a trunk or a restart won’t do it.' },{ q:'A company has 4 VLANs and wants fast routing between them with no bottleneck. What’s the best choice?', opts:['an L3 switch with SVIs – it routes between VLANs in the switch hardware','router-on-a-stick, where all inter-VLAN traffic flows over one trunk','adding one more separate switch into each of the VLANs'], correct:0, why:'An L3 switch routes between VLANs via SVIs in hardware – no bottleneck. Router-on-a-stick pushes everything through one trunk (slower); more switches don’t do routing.' },{ q:'Why do you put guests and IoT into their own VLANs separated from the corporate network?', opts:['lower trust – a VLAN shrinks the blast radius and keeps them off sensitive data','without it the guest Wi-Fi would be noticeably slower for everyone','so that every connected device eventually gets its own public IP address'], correct:0, why:'Guests and weak IoT have lower trust. Their own VLAN keeps them off sensitive data and shrinks the blast radius – if abused, the attacker gets no further.' }];
__regCourse(3,COURSE_3_DEF,COURSE_3_QUIZZES_DEF,COURSE_3_FINAL_EXTRA_DEF);
