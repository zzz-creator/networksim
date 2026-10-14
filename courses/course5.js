/* course5.js — Course 5 content (split out of course.js; loaded on demand via course-core.js) */
/* ============================================================
   COURSE 5 — Network security / Firewall (problem-first; sim icons)
   ============================================================ */
// L1M1 — A network with no doors
function renderC5OpenNet(){
  const svg='<svg id="c5asvg" viewBox="0 0 640 200" width="100%" style="display:block">'
    +'<line x1="84" y1="100" x2="262" y2="100" style="stroke:var(--line2);stroke-width:1.6"/><line x1="339.7" y1="96.4" x2="520.3" y2="63.6" style="stroke:var(--green);stroke-width:1.5"/><line x1="342.4" y1="105.1" x2="520.5" y2="145.6" style="stroke:var(--green);stroke-width:1.5"/>'
    +'<g id="c5aglow"></g>'
    +csDev(64,100,'internet','INTERNET')+csDev(320,100,'l2switch','SWITCH')+csHost(540,60,'server','--green','SERVER')+csHost(540,150,'nas','--green','DATA')
    +'<g id="c5adyn"></g></svg>';
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'From the previous courses you have a network that <b>works</b> – it can connect anyone to anyone. But that’s now a <b>problem</b>. The company is connected to the <b>internet</b> and inside it has <b>servers and sensitive data</b>. When there’s <b>no boundary</b> between the internet and the inside, <b>anyone in the world</b> can simply connect to them. And inside, everyone <b>trusts everyone</b> – nothing is watching. An open network = an open door.'+'</p>'
    +'<div class="osi-stage">'+svg+'</div>'
    +'<div class="m1-cap" id="c5acap"></div>'
    +courseStepControls('c5a')
    +abbrBox([['open network','a network with no boundary to the internet – the inside servers are reachable directly from outside.'],['implicit trust','devices inside trust each other unchecked; once someone gets in, they have free rein.']]);
}
function mountC5OpenNet(){
  const STEPS=[
    {glow:csGlow(540,60,'--green')+csGlow(540,150,'--green'), dyn:'', cap:'A company on the internet: inside a <b>SERVER</b> and <b>DATA</b>. Between the internet and the inside there’s <b>no boundary</b>.'},
    {glow:csGlow(64,100,'--red')+csGlow(320,100,'--red',23)+csGlow(540,60,'--red'), dyn:csPkt('M84 100 L262 100','--red')+csPkt('M339.7 96.4 L520.3 63.6','--red'), cap:'Anyone on the <b>internet</b> sends a packet – and it <b>goes straight inside</b> to the SERVER. Nothing stops it on the way.'},
    {glow:csGlow(64,100,'--red')+csGlow(320,100,'--red',23)+csGlow(540,150,'--red'), dyn:csPkt('M84 100 L262 100','--red')+csPkt('M339.5 104.4 L520.5 145.6','--red')+'<text x="430" y="186" text-anchor="middle" style="font:700 8px var(--sans);fill:var(--red)">'+esc('and on to sensitive DATA')+'</text>', cap:'And likewise to the <b>DATA</b>. Inside everyone trusts everyone, so an attacker who gets in <b>can reach everything</b>. That’s a serious problem.'},
    {glow:csGlow(320,100,'--cyan',23), dyn:'', cap:'We need someone at the <b>boundary</b> to decide <b>what may come in and what may not</b>. That gatekeeper is a <b>firewall</b> – and this whole course is about it.'}
  ];
  function show(i){const g=$('c5aglow');if(g)g.innerHTML=STEPS[i].glow||'';const d=$('c5adyn');if(d)d.innerHTML=STEPS[i].dyn||'';const c=$('c5acap');if(c)c.innerHTML='<span>'+STEPS[i].cap+'</span>';}
  courseStepper('c5a',STEPS.length,show);
}
// L1M2 — What's at risk
function renderC5Threats(){
  const svg='<svg id="c5bsvg" viewBox="0 0 640 184" width="100%" style="display:block">'
    +'<text x="40" y="24" style="font:700 9px var(--sans);fill:var(--muted)">'+'What an open network lets an attacker do:'+'</text>'
    +'<g id="c5brows"></g></svg>';
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'What can actually happen when a network is open? The attacker needn’t "break" anything – it’s enough that they can <b>see the servers</b>. First they <b>scan</b> what’s running (which ports/services are open). Then they try to <b>reach the sensitive stuff</b> (databases, admin interfaces, backups). And if they succeed, they <b>carry the data out</b> (exfiltration) or settle in. All because nothing stands in their way.'+'</p>'
    +'<div class="osi-stage">'+svg+'</div>'
    +'<div class="m1-cap" id="c5bcap"></div>'
    +courseStepControls('c5b')
    +abbrBox([['port scan','the attacker probes which services/ports are open on a target – mapping the terrain.'],['wiretap','anyone on the wire reads unencrypted traffic including passwords; in the simulator right-click a link → Capture traffic.'],['exfiltration','quietly carrying (stealing) data out of the network.']]);
}
function mountC5Threats(){
  const row=(y,n,t,c)=>'<g><circle cx="56" cy="'+y+'" r="13" style="fill:var('+c+');fill-opacity:.16;stroke:var('+c+');stroke-width:1.6"/><text x="56" y="'+(y+4)+'" text-anchor="middle" style="font:800 10px var(--mono);fill:var('+c+')">'+n+'</text><text x="84" y="'+(y+4)+'" style="font:600 10.5px var(--sans);fill:var(--txt)">'+esc(t)+'</text></g>';
  const r1=row(50,'1','Scan the network – what’s open?','--amber');
  const r2=r1+row(92,'2','Reach the database / admin / backups','--red');
  const r3=r2+row(134,'3','Exfiltrate data or settle in','--red');
  const STEPS=[
    {rows:r1, cap:'<b>1) Scan.</b> The attacker first <b>maps</b> what runs on your servers and what’s reachable. For free, just looking.'},
    {rows:r2, cap:'<b>2) Reach.</b> They find an open service and <b>reach the valuable bits</b> – the database, admin interface, backups. In an open network nothing stops them.'},
    {rows:r3, cap:'<b>3) Damage.</b> They <b>take the data out</b> (exfiltration), encrypt it (ransomware) or <b>settle</b> in the network for later. This is where it hurts.'},
    {rows:r3, cap:'The common thread: <b>nothing guards the boundary</b>. With a firewall there, most of this would be stopped right at the entrance. Let’s put one there.'}
  ];
  function show(i){const r=$('c5brows');if(r)r.innerHTML=STEPS[i].rows;const c=$('c5bcap');if(c)c.innerHTML='<span>'+STEPS[i].cap+'</span>';}
  courseStepper('c5b',STEPS.length,show);
}
// L1M3 — Firewall = gatekeeper
function renderC5FirewallGate(){
  const svg='<svg id="c5csvg" viewBox="0 0 640 196" width="100%" style="display:block">'
    +'<line x1="84" y1="98" x2="300" y2="98" style="stroke:var(--line2);stroke-width:1.6"/><line x1="342.6" y1="93.6" x2="520.4" y2="59.8" style="stroke:var(--green);stroke-width:1.5"/><line x1="339.5" y1="102.6" x2="520.5" y2="145.4" style="stroke:var(--green);stroke-width:1.5"/>'
    +'<g id="c5cglow"></g>'
    +csDev(64,98,'internet','INTERNET')+csDev(320,98,'firewall','FIREWALL')+csHost(540,56,'server','--green','WEB')+csHost(540,150,'nas','--green','DATA')
    +'<g id="c5cdyn"></g></svg>';
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'The solution is a <b>firewall</b> – we place it exactly on the <b>boundary</b> between the internet and the internal network. It acts as a <b>gatekeeper</b>: every <b>packet</b> (a chunk of data with an address, from the How networks work course) that wants through is <b>judged against rules</b> and either <b>allowed</b> or <b>blocked</b>. Legitimate things (a customer to the web server) pass; uninvited ones (anyone from the internet to the database) are stopped. Nothing crosses the boundary "just like that".'+'</p>'
    +'<div class="osi-stage">'+svg+'</div>'
    +'<div class="m1-cap" id="c5ccap"></div>'
    +courseStepControls('c5c')
    +abbrBox([['firewall','a device at the network boundary that permits or blocks traffic between networks by rules.'],['permit / deny','the two basic firewall actions on each piece of traffic it judges.']]);
}
function mountC5FirewallGate(){
  const STEPS=[
    {glow:csGlow(320,98,'--cyan',23), dyn:'', cap:'On the boundary stands a <b>firewall</b>. All traffic between the internet and the inside must now go <b>through it</b>.'},
    {glow:csGlow(64,98,'--green')+csGlow(320,98,'--green',23)+csGlow(540,56,'--green'), dyn:csPkt('M84 98 L300 98','--green')+csPkt('M339.6 94.2 L520.4 59.8','--green')+'<text x="430" y="44" text-anchor="middle" style="font:700 8px var(--sans);fill:var(--green)">'+esc('web → allowed')+'</text>', cap:'A customer wants the <b>WEB</b> (port 443). That’s <b>fine</b> → the firewall <b>lets it through</b>.'},
    {glow:csGlow(64,98,'--red')+csGlow(320,98,'--red',23), dyn:csPkt('M84 98 L300 98','--red')+'<text x="320" y="64" text-anchor="middle" style="font:800 20px var(--mono);fill:var(--red)">✕</text><text x="430" y="150" text-anchor="middle" style="font:700 8px var(--sans);fill:var(--red)">'+esc('internet → DATA: blocked')+'</text>', cap:'Someone from the internet wants the <b>DATA</b>. That <b>has no business</b> → the firewall <b>blocks</b> it. The boundary holds.'},
    {glow:csGlow(320,98,'--cyan',23), dyn:'', cap:'A firewall decides by <b>rules</b>, not at random. What those rules look like and how networks split into <b>zones</b> (of trust) is the content of the next lessons.'}
  ];
  function show(i){const g=$('c5cglow');if(g)g.innerHTML=STEPS[i].glow||'';const d=$('c5cdyn');if(d)d.innerHTML=STEPS[i].dyn||'';const c=$('c5ccap');if(c)c.innerHTML='<span>'+STEPS[i].cap+'</span>';}
  courseStepper('c5c',STEPS.length,show);
}
// ---- L2 shared scene with three zones ----
function c5ZoneScene(pfx){
  return '<svg id="'+pfx+'svg" viewBox="0 0 640 200" width="100%" style="display:block">'
    +'<rect x="14" y="62" width="120" height="86" rx="9" style="fill:var(--red);fill-opacity:.05;stroke:var(--red);stroke-width:1.2"/><text x="74" y="56" text-anchor="middle" style="font:700 8px var(--mono);fill:var(--red)">OUTSIDE</text>'
    +'<rect x="498" y="22" width="132" height="68" rx="9" style="fill:var(--green);fill-opacity:.05;stroke:var(--green);stroke-width:1.2"/><text x="564" y="16" text-anchor="middle" style="font:700 8px var(--mono);fill:var(--green)">INSIDE</text>'
    +'<rect x="498" y="118" width="132" height="68" rx="9" style="fill:var(--amber);fill-opacity:.05;stroke:var(--amber);stroke-width:1.2"/><text x="564" y="112" text-anchor="middle" style="font:700 8px var(--mono);fill:var(--amber)">DMZ</text>'
    +'<line x1="94" y1="105.2" x2="300" y2="107.8" style="stroke:var(--line2);stroke-width:1.5"/><line x1="339.6" y1="103.8" x2="544.4" y2="60.2" style="stroke:var(--line2);stroke-width:1.5"/><line x1="339.7" y1="111.5" x2="544.3" y2="148.5" style="stroke:var(--line2);stroke-width:1.5"/>'
    +'<g id="'+pfx+'glow"></g>'
    +csDev(74,105,'internet','')+csDev(320,108,'firewall','FW')+csHost(564,56,'desktop','--green','PC')+csHost(564,152,'server','--amber','WEB')
    +'<g id="'+pfx+'dyn"></g></svg>';
}
// L2M1 — Zones of trust
function renderC5Zones(){
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'A firewall doesn’t work with individual cables but with <b>zones</b> – groups of networks by <b>how much you trust them</b>. The three classics: <b>OUTSIDE</b> (the internet – you trust no one), <b>INSIDE</b> (the internal network – fully trusted) and the <b>DMZ</b> (semi-trusted – for <b>public servers</b> that must be reachable from the internet, e.g. a web server). A zone isn’t a property of the packet but of the firewall’s <b>interface</b> – whichever interface (cable) a packet arrives on decides its zone. Think of it as a <b>label</b> you stick on a port during configuration: “this port leads to the internet = outside, this one to the internal network = inside”. The firewall then handles one thing: <b>who from which zone may go to which</b>.'+'</p>'
    +'<div class="osi-stage">'+c5ZoneScene('c5d')+'</div>'
    +'<div class="m1-cap" id="c5dcap"></div>'
    +courseStepControls('c5d')
    +abbrBox([['zone','a group of networks with the same trust level; the firewall decides traffic BETWEEN zones.'],['DMZ','a demilitarized zone – a separate place for public servers (web, mail) so a breach there doesn’t endanger the inside.']]);
}
function mountC5Zones(){
  const STEPS=[
    {glow:csGlow(320,108,'--cyan',23), dyn:'', cap:'In the middle a <b>firewall</b>, around it three <b>zones</b>. Each has a different trust level. Let’s go through them.'},
    {glow:csGlow(74,105,'--red',22), dyn:'', cap:'<b>OUTSIDE</b> = the internet. You <b>trust no one</b> – anything from here is a potential threat.'},
    {glow:csGlow(564,56,'--green'), dyn:'', cap:'<b>INSIDE</b> = your internal network (PCs, servers, data). <b>Fully trusted</b> – this is what you protect.'},
    {glow:csGlow(564,152,'--amber'), dyn:'', cap:'<b>DMZ</b> = semi-trusted. Here go <b>public servers</b> (web) that must be reached from the internet – but kept apart from the inside. <b>Who may go where</b> the firewall decides by rules (next modules).'}
  ];
  function show(i){const g=$('c5dglow');if(g)g.innerHTML=STEPS[i].glow||'';const d=$('c5ddyn');if(d)d.innerHTML=STEPS[i].dyn||'';const c=$('c5dcap');if(c)c.innerHTML='<span>'+STEPS[i].cap+'</span>';}
  courseStepper('c5d',STEPS.length,show);
}
// L2M2 — Default deny outside→inside
function renderC5DefaultDeny(){
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'The basic firewall rule is really common sense: <b>trust outward, not inward</b>. <b>INSIDE → OUTSIDE</b> (an employee to the internet) is <b>allowed</b> – replies to what you asked for may come back (how the firewall tells a reply from an unsolicited connection comes in the <b>Stateful firewall</b> lesson). But <b>OUTSIDE → INSIDE</b> (someone on the internet starting a connection) is <b>denied by default</b>. No uninvited outsider gets in. Exceptions (e.g. to the web in the DMZ) are made with <b>specific rules</b>.'+'</p>'
    +'<div class="osi-stage">'+c5ZoneScene('c5e')+'</div>'
    +'<div class="m1-cap" id="c5ecap"></div>'
    +courseStepControls('c5e')
    +abbrBox([['default deny','what isn’t explicitly permitted is denied. From the internet inward you get nowhere without a rule.'],['connection direction','who STARTED the connection. Outbound-initiated is allowed, externally-initiated inbound is not.']]);
}
function mountC5DefaultDeny(){
  const STEPS=[
    {glow:csGlow(564,56,'--green')+csGlow(320,108,'--green',23)+csGlow(74,105,'--green'), dyn:csPkt('M544.4 60.2 L339.6 103.8','--green')+csPkt('M300 107.8 L94 105.2','--green')+csPkt('M94 105.2 L300 107.8','--cyan')+csPkt('M339.6 103.8 L544.4 60.2','--cyan')+'<text x="200" y="92" text-anchor="middle" style="font:700 7.5px var(--sans);fill:var(--green)">'+esc('inside → internet: allowed')+'</text><text x="200" y="138" text-anchor="middle" style="font:700 7.5px var(--sans);fill:var(--cyan)">'+esc('the reply back: allowed')+'</text>', cap:'<b>PC (inside) to the internet</b>: an employee browses. The firewall <b>allows</b> it – and lets the replies back.'},
    {glow:csGlow(74,105,'--red',22)+csGlow(320,108,'--red',23), dyn:csPkt('M94 105.2 L300 107.8','--red')+'<text x="320" y="74" text-anchor="middle" style="font:800 20px var(--mono);fill:var(--red)">✕</text><text x="200" y="138" text-anchor="middle" style="font:700 7.5px var(--sans);fill:var(--red)">'+esc('internet → inside: DEFAULT DENY')+'</text>', cap:'<b>Someone on the internet starts a connection inward</b>: the firewall <b>denies it by default</b>. The uninvited guest doesn’t get in.'},
    {glow:csGlow(320,108,'--cyan',23), dyn:'', cap:'This is the <b>core</b>: trust outward, not inward. Anything that should still get in from outside (the web) is permitted by a <b>targeted rule</b> – and ideally into the <b>DMZ</b>, not straight inside. That’s the next module.'}
  ];
  function show(i){const g=$('c5eglow');if(g)g.innerHTML=STEPS[i].glow||'';const d=$('c5edyn');if(d)d.innerHTML=STEPS[i].dyn||'';const c=$('c5ecap');if(c)c.innerHTML='<span>'+STEPS[i].cap+'</span>';}
  courseStepper('c5e',STEPS.length,show);
}
// L2M3 — DMZ: public servers kept separate
function renderC5Dmz(){
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'Why a <b>DMZ</b> at all? You have a <b>web server</b> that <b>anyone</b> on the internet must reach. If you put it <b>inside</b> and opened a hole to it, an attacker who breaches that web server <b>stands right in your internal network</b> – at the data, at everything. So public servers go in the <b>DMZ</b>: their own zone between the internet and the inside. When the DMZ web is breached, the attacker is <b>trapped in the DMZ</b> and <b>can’t reach</b> the inside (the firewall won’t let them).'+'</p>'
    +'<div class="osi-stage">'+c5ZoneScene('c5f')+'</div>'
    +'<div class="m1-cap" id="c5fcap"></div>'
    +courseStepControls('c5f')
    +abbrBox([['DMZ','a separate zone for public servers (web/mail). A breach of a DMZ server doesn’t endanger the internal network.'],['blast radius','how far an attacker gets. A DMZ keeps them out of inside – the damage stays small.']]);
}
function mountC5Dmz(){
  const STEPS=[
    {glow:csGlow(74,105,'--green',22)+csGlow(320,108,'--green',23)+csGlow(564,152,'--amber'), dyn:csPkt('M94 105.2 L300 107.8','--green')+csPkt('M339.7 111.5 L544.3 148.5','--green')+'<text x="200" y="138" text-anchor="middle" style="font:700 7.5px var(--sans);fill:var(--green)">'+esc('internet → WEB in DMZ: allowed')+'</text>', cap:'Customers must reach the <b>WEB</b>. It’s in the <b>DMZ</b>, so the firewall allows <b>internet → DMZ (web)</b>. The web works.'},
    {glow:csGlow(564,152,'--red')+csGlow(74,105,'--red',22), dyn:'<text x="200" y="138" text-anchor="middle" style="font:700 7.5px var(--sans);fill:var(--red)">'+esc('⚠ DMZ web breached')+'</text>', cap:'Say the <b>DMZ web is breached</b> (a vulnerability). The attacker now controls a server in the DMZ. How far can they get?'},
    {glow:csGlow(564,152,'--red')+csGlow(320,108,'--red',23), dyn:csPkt('M544.3 148.5 L339.7 111.5','--red')+'<text x="320" y="74" text-anchor="middle" style="font:800 20px var(--mono);fill:var(--red)">✕</text><text x="200" y="138" text-anchor="middle" style="font:700 7.5px var(--sans);fill:var(--red)">'+esc('DMZ → inside: blocked')+'</text>', cap:'From the DMZ the attacker tries to go <b>inside</b> – for the data. The firewall <b>blocks DMZ → inside</b>. They’re <b>trapped in the DMZ</b>.'},
    {glow:csGlow(564,56,'--green')+csGlow(564,152,'--amber'), dyn:'', cap:'That’s the point of a DMZ: the public server is reachable, but its <b>breach doesn’t endanger the inside</b>. A small blast radius. The specific inter-zone rules are the next module.'}
  ];
  function show(i){const g=$('c5fglow');if(g)g.innerHTML=STEPS[i].glow||'';const d=$('c5fdyn');if(d)d.innerHTML=STEPS[i].dyn||'';const c=$('c5fcap');if(c)c.innerHTML='<span>'+STEPS[i].cap+'</span>';}
  courseStepper('c5f',STEPS.length,show);
}
// L2M4 — Rules between zones (matrix)
function renderC5ZoneRules(){
  const svg='<svg id="c5gsvg" viewBox="0 0 640 184" width="100%" style="display:block">'
    +'<text x="40" y="22" style="font:700 9px var(--sans);fill:var(--muted)">'+'Who from which zone may go where (typical):'+'</text>'
    +'<g id="c5grows"></g></svg>';
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'Putting it together gives a simple <b>matrix</b> – who from which zone may go where: <b>INSIDE → anywhere</b> (out and to the DMZ, it’s trusted). <b>OUTSIDE → DMZ for the web only</b> (port 443, by a targeted rule). <b>OUTSIDE → INSIDE never</b> (default deny). <b>DMZ → INSIDE never</b> (so a breached web can’t get inside). These four rules are the backbone of almost every firewall.'+'</p>'
    +'<div class="osi-stage">'+svg+'</div>'
    +'<div class="m1-cap" id="c5gcap"></div>'
    +courseStepControls('c5g')
    +abbrBox([['zone matrix','an overview of allowed directions between zones – the firewall’s basic security policy.'],['targeted rule','an exception to the default deny for specific traffic (e.g. internet → web 443).']]);
}
function mountC5ZoneRules(){
  const row=(y,t,act,c)=>'<g><text x="56" y="'+(y+4)+'" style="font:600 11px var(--sans);fill:var(--txt)">'+esc(t)+'</text><text x="470" y="'+(y+4)+'" style="font:800 10px var(--mono);fill:var('+c+')">'+esc(act)+'</text></g>';
  const r1=row(52,'INSIDE → OUTSIDE / DMZ','✓ PERMIT','--green');
  const r2=r1+row(90,'OUTSIDE → DMZ (web 443)','✓ PERMIT','--green');
  const r3=r2+row(128,'OUTSIDE → INSIDE','✕ DENY','--red');
  const r4=r3+row(166,'DMZ → INSIDE','✕ DENY','--red');
  const STEPS=[
    {rows:r1, cap:'<b>INSIDE → out and to the DMZ: permitted.</b> The internal network is trusted, it may initiate connections anywhere.'},
    {rows:r2, cap:'<b>OUTSIDE → DMZ (web 443): permitted</b> by a targeted rule. Just this one service, nothing more.'},
    {rows:r3, cap:'<b>OUTSIDE → INSIDE: denied</b> (default deny). No one reaches internal data from the internet.'},
    {rows:r4, cap:'<b>DMZ → INSIDE: denied.</b> Even if the DMZ web falls, the attacker can’t get inside. These four rules = the firewall’s skeleton. <b>What a rule looks like exactly</b> is the next lesson.'}
  ];
  function show(i){const r=$('c5grows');if(r)r.innerHTML=STEPS[i].rows;const c=$('c5gcap');if(c)c.innerHTML='<span>'+STEPS[i].cap+'</span>';}
  courseStepper('c5g',STEPS.length,show);
}
// L2M5 — The whole picture + task
function renderC5ZonesWhole(){
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'Let’s put it together. A firewall splits the network into <b>zones by trust</b> and between them allows only what makes sense: out yes, in by invitation only, public servers off to the side in the <b>DMZ</b>. One design buys you both order and safety. You’ll <b>try this in the web-dmz task</b>: the DMZ web server should be reachable from the internet on port 443, but the internal database should not.'+'</p>'
    +'<div class="osi-stage">'+c5ZoneScene('c5h')+'</div>'
    +'<div class="m1-cap" id="c5hcap"></div>'
    +courseStepControls('c5h')
    +abbrBox([['security policy','the set of rules of who may go where – with zones it’s a clear matrix of directions.'],['web-dmz','the task: from the internet permit only the web (443) into the DMZ, keep the internal database unreachable.']]);
}
function mountC5ZonesWhole(){
  const STEPS=[
    {glow:csGlow(320,108,'--cyan',23), dyn:'', cap:'Three zones, one firewall, clear rules. This is a <b>design that protects</b> while keeping the web working.'},
    {glow:csGlow(564,56,'--green')+csGlow(320,108,'--green',23)+csGlow(74,105,'--green',22)+csGlow(564,152,'--amber'), dyn:csPkt('M544.4 60.2 L339.6 103.8','--green')+csPkt('M300 107.8 L94 105.2','--green')+csPkt('M339.7 111.5 L544.3 148.5','--green'), cap:'<b>INSIDE</b> works normally – out to the internet and to the DMZ web. No restriction for the trusted zone.'},
    {glow:csGlow(74,105,'--green',22)+csGlow(320,108,'--green',23)+csGlow(564,152,'--amber'), dyn:csPkt('M94 105.2 L300 107.8','--green')+csPkt('M339.7 111.5 L544.3 148.5','--green'), cap:'<b>Customers from the internet</b> reach only the <b>DMZ web</b> (443). Exactly what you want.'},
    {glow:csGlow(74,105,'--red',22)+csGlow(320,108,'--red',23), dyn:csPkt('M94 105.2 L300 107.8','--red')+'<text x="320" y="74" text-anchor="middle" style="font:800 20px var(--mono);fill:var(--red)">✕</text>', cap:'But <b>internet → internal database</b>? <b>Blocked.</b> And if the DMZ web fell, it still couldn’t get inside. You’ll now <b>build this in the web-dmz task</b>.'}
  ];
  function show(i){const g=$('c5hglow');if(g)g.innerHTML=STEPS[i].glow||'';const d=$('c5hdyn');if(d)d.innerHTML=STEPS[i].dyn||'';const c=$('c5hcap');if(c)c.innerHTML='<span>'+STEPS[i].cap+'</span>';}
  courseStepper('c5h',STEPS.length,show);
}
// L3M1 — What a rule is made of (anatomy)
function renderC5RuleAnatomy(){
  const box=(x,w,t,c)=>'<g><rect x="'+x+'" y="58" width="'+w+'" height="30" rx="6" style="fill:var('+c+');fill-opacity:.12;stroke:var('+c+');stroke-width:1.3"/><text x="'+(x+w/2)+'" y="78" text-anchor="middle" style="font:700 10px var(--mono);fill:var('+c+')">'+esc(t)+'</text></g>';
  const lbl=(x,w,t,c)=>'<text x="'+(x+w/2)+'" y="108" text-anchor="middle" style="font:700 7.5px var(--sans);fill:var('+c+')">'+esc(t)+'</text>';
  const svg='<svg id="c5isvg" viewBox="0 0 640 140" width="100%" style="display:block">'
    +box(20,96,'PERMIT','--green')+box(124,104,'inside','--blue')+box(238,116,'DMZ-web','--amber')+box(366,64,'TCP','--cyan')+box(442,70,'443','--violet')
    +'<g id="c5iglow"></g>'
    +lbl(20,96,'action','--green')+lbl(124,104,'source','--blue')+lbl(238,116,'destination','--amber')+lbl(366,64,'protocol','--cyan')+lbl(442,70,'port','--violet')
    +'</svg>';
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'What does a <b>firewall rule</b> actually look like? It’s a sentence with five parts: an <b>action</b> (permit / deny), a <b>source</b> (from where), a <b>destination</b> (to where), a <b>protocol</b> (TCP/UDP/…) and a <b>port</b> (which service). E.g. "<b>permit</b> traffic from <b>inside</b> to the <b>DMZ web</b> over <b>TCP 443</b>". Every passing packet is compared against these parts – and if they match, the firewall does that action. (The structure is the same as an <b>ACL</b> from the Switching and VLANs course; a firewall adds <b>zones</b> and <b>tracks connection state</b> – coming up in the next lesson.)'+'</p>'
    +'<div class="osi-stage">'+svg+'</div>'
    +'<div class="m1-cap" id="c5icap"></div>'
    +courseStepControls('c5i')
    +abbrBox([['action','what to do with the traffic: permit or deny.'],['source / destination','where the traffic comes from and goes to – zones, networks or specific addresses.'],['port','the service number (443 = HTTPS, 22 = SSH, 23 = Telnet…) – it says which application.']]);
}
function mountC5RuleAnatomy(){
  const ring=(x,w,c)=>'<rect x="'+(x-3)+'" y="55" width="'+(w+6)+'" height="36" rx="8" style="fill:none;stroke:var('+c+');stroke-width:2.2"/>';
  const STEPS=[
    {glow:'', cap:'A rule = five parts. Let’s go through them on the example "permit inside → DMZ web on 443".'},
    {glow:ring(20,96,'--green'), cap:'<b>Action</b> – <b>PERMIT</b> (or DENY). What happens to matching traffic.'},
    {glow:ring(124,104,'--blue')+ring(238,116,'--amber'), cap:'<b>Source</b> and <b>destination</b> – from where (inside) and to where (DMZ web). The rule applies only to this direction.'},
    {glow:ring(366,64,'--cyan')+ring(442,70,'--violet'), cap:'<b>Protocol</b> and <b>port</b> – TCP and 443 (HTTPS). This targets exactly one service (the web), not everything.'}
  ];
  function show(i){const g=$('c5iglow');if(g)g.innerHTML=STEPS[i].glow||'';const c=$('c5icap');if(c)c.innerHTML='<span>'+STEPS[i].cap+'</span>';}
  courseStepper('c5i',STEPS.length,show);
}
// ---- L3 rule-list helper ----
function c5RuleRows(rows,hi){
  return rows.map(function(r,i){
    var on=(hi===i);
    var c=r.act==='permit'?'--green':(r.act==='deny'?'--red':'--muted');
    var act=r.act==='permit'?('PERMIT'):(r.act==='deny'?'DENY':'(default) DENY ALL');
    var y=40+i*34;
    return '<g><rect x="60" y="'+(y-15)+'" width="520" height="28" rx="5" style="fill:var('+c+');fill-opacity:'+(on?'0.18':'0.05')+';stroke:var('+c+');stroke-width:'+(on?'1.8':'1')+'"/>'
      +'<text x="76" y="'+(y+4)+'" style="font:800 9px var(--mono);fill:var('+c+')">'+esc(act)+'</text>'
      +'<text x="210" y="'+(y+4)+'" style="font:600 9.5px var(--sans);fill:var(--txt)">'+esc(r.txt||'')+'</text></g>';
  }).join('');
}
// L3M2 — First-match: order matters
function renderC5FirstMatch(){
  const svg='<svg id="c5jsvg" viewBox="0 0 640 170" width="100%" style="display:block">'
    +'<text x="60" y="22" style="font:700 9px var(--sans);fill:var(--muted)">'+'Rules are read TOP-DOWN, the FIRST match wins:'+'</text>'
    +'<g id="c5jrows"></g><g id="c5jdyn"></g></svg>';
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'There’s usually more than one rule and the firewall reads them <b>top-down</b>. As soon as a packet <b>matches the first</b> rule, it does that action and <b>reads no further</b> – the <b>first match</b> wins. This means <b>order matters</b>: specific denies must be <b>above</b> general permits, or they’ll never be reached. Watch a packet travel down the list.'+'</p>'
    +'<div class="osi-stage">'+svg+'</div>'
    +'<div class="m1-cap" id="c5jcap"></div>'
    +courseStepControls('c5j')
    +abbrBox([['first-match','the first rule the traffic matches wins; the rest aren’t read.'],['rule order','specific rules (deny) go above general ones (permit), or they never take effect.']]);
}
function mountC5FirstMatch(){
  const rows=[{act:'deny',txt:'inside → mgmt · TCP 23 (Telnet)'},{act:'permit',txt:'inside → mgmt · TCP anything'}];
  const set=(hi)=>{var r=$('c5jrows');if(r)r.innerHTML=c5RuleRows(rows,hi);};
  const STEPS=[
    {hi:-1, dyn:'', cap:'Two rules: <b>1)</b> deny Telnet (23), <b>2)</b> permit anything to mgmt. A packet for <b>Telnet (23)</b> arrives.'},
    {hi:0, dyn:'<text x="320" y="150" text-anchor="middle" style="font:700 8px var(--sans);fill:var(--red)">'+esc('matches rule 1 → DENY → stop')+'</text>', cap:'The firewall reads from the <b>top</b>: rule 1 (deny Telnet) <b>matches</b> → packet <b>denied</b>. Rule 2 is <b>not read</b>.'},
    {hi:-1, dyn:'<text x="320" y="150" text-anchor="middle" style="font:700 8px var(--sans);fill:var(--amber)">'+esc('if the order were swapped → Telnet would pass!')+'</text>', cap:'And note: if <b>permit anything</b> were on top, it would <b>match first</b> and Telnet would <b>pass</b> – the deny below would never apply. <b>That’s why order matters.</b>'}
  ];
  function show(i){set(STEPS[i].hi);const d=$('c5jdyn');if(d)d.innerHTML=STEPS[i].dyn||'';const c=$('c5jcap');if(c)c.innerHTML='<span>'+STEPS[i].cap+'</span>';}
  courseStepper('c5j',STEPS.length,show);
}
// L3M3 — Default deny at the end
function renderC5DefaultDenyEnd(){
  const svg='<svg id="c5ksvg" viewBox="0 0 640 184" width="100%" style="display:block">'
    +'<text x="60" y="22" style="font:700 9px var(--sans);fill:var(--muted)">'+'At the end of the list is an invisible "deny all":'+'</text>'
    +'<g id="c5krows"></g><g id="c5kdyn"></g></svg>';
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'And what about traffic that <b>matches no</b> rule? At the end of every firewall there’s an <b>invisible default "deny all"</b> (implicit deny). So: <b>what isn’t explicitly permitted is denied</b>. That’s the safe setting – forgotten traffic is blocked rather than accidentally let through. So you write only <b>permits</b> for what you actually want; the rest is handled by the default deny.'+'</p>'
    +'<div class="osi-stage">'+svg+'</div>'
    +'<div class="m1-cap" id="c5kcap"></div>'
    +courseStepControls('c5k')
    +abbrBox([['implicit deny','the invisible default rule at the end: whatever didn’t match above is denied.'],['default-deny posture','the safe approach – you write only permits, the rest falls to the default deny.']]);
}
function mountC5DefaultDenyEnd(){
  const rows=[{act:'permit',txt:'inside → internet · TCP 443'},{act:'permit',txt:'outside → DMZ-web · TCP 443'},{act:'deny',txt:'EVERYTHING ELSE (invisible)'}];
  const rows0=rows.slice(0,2);
  const set=(arr,hi)=>{var r=$('c5krows');if(r)r.innerHTML=c5RuleRows(arr,hi);};
  const STEPS=[
    {arr:rows0, hi:-1, dyn:'', cap:'You write only <b>permits</b>: inside out on 443 and outside to the DMZ web. Nothing more.'},
    {arr:rows, hi:2, dyn:'', cap:'But at the end there’s always an <b>invisible "deny all"</b>. Everything that didn’t match a permit falls here.'},
    {arr:rows, hi:2, dyn:'<text x="320" y="172" text-anchor="middle" style="font:700 8px var(--sans);fill:var(--red)">'+esc('outside → internal DB: matches nothing → denied')+'</text>', cap:'An <b>outside → internal database</b> packet arrives. It matches no permit → falls to the <b>default deny</b> → <b>denied</b>. Exactly as you want, without writing a special deny.'}
  ];
  function show(i){set(STEPS[i].arr,STEPS[i].hi);const d=$('c5kdyn');if(d)d.innerHTML=STEPS[i].dyn||'';const c=$('c5kcap');if(c)c.innerHTML='<span>'+STEPS[i].cap+'</span>';}
  courseStepper('c5k',STEPS.length,show);
}
// L3M4 — Example: block Telnet
function renderC5BlockTelnet(){
  const svg='<svg id="c5lsvg" viewBox="0 0 640 184" width="100%" style="display:block">'
    +'<line x1="84" y1="100" x2="262" y2="100" style="stroke:var(--line2);stroke-width:1.6"/><line x1="378" y1="100" x2="520" y2="100" style="stroke:var(--line2);stroke-width:1.6"/>'
    +'<g id="c5lglow"></g>'
    +csHost(64,100,'desktop','--blue','PC')+csDev(320,100,'l3switch','L3 / FW')+csHost(540,100,'server','--green','MGMT')
    +'<text x="540" y="152" text-anchor="middle" style="font:600 7px var(--mono);fill:var(--green)">SSH 22 · Telnet 23</text>'
    +'<g id="c5ldyn"></g></svg>';
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'A concrete real-world example. You connect to the <b>management server (MGMT)</b> – but <b>Telnet</b> (port 23) is <b>unencrypted</b> and dangerous, while <b>SSH</b> (22) is encrypted and safe. So you want: <b>permit SSH, deny Telnet</b>. You make a rule "<b>deny</b> PC → MGMT, TCP <b>23</b>". For SSH to pass, something has to let it: in the <b>block-telnet</b> task the device has its <b>ACL default policy deliberately set to "allow everything"</b> (the opposite of the implicit deny from the previous module – so you can see what that implicit deny protects you from), so whatever doesn’t match the deny goes through. If the default were <b>"block everything"</b> (the implicit deny from the previous module – and that’s the usual real-world setting), you would also have to <b>explicitly permit</b> SSH on 22. You’ll <b>try exactly this in the block-telnet task</b> – and mind the rule <b>order</b>.'+'</p>'
    +'<div class="osi-stage">'+svg+'</div>'
    +'<div class="m1-cap" id="c5lcap"></div>'
    +courseStepControls('c5l')
    +abbrBox([['Telnet / SSH','Telnet (23) is unencrypted – passwords go in clear text; SSH (22) is the encrypted replacement.'],['block-telnet','the task: on the firewall/L3 deny Telnet (23) from PC to MGMT, but let SSH (22) through.']]);
}
function mountC5BlockTelnet(){
  const STEPS=[
    {glow:csGlow(64,100,'--blue')+csGlow(540,100,'--green'), dyn:'', cap:'An admin connects from the <b>PC</b> to the <b>MGMT</b> server. It listens on <b>SSH (22)</b> and <b>Telnet (23)</b>.'},
    {glow:csGlow(64,100,'--green')+csGlow(320,100,'--green',23)+csGlow(540,100,'--green'), dyn:csPkt('M84 100 L262 100','--green')+csPkt('M378 100 L520 100','--green')+'<text x="320" y="68" text-anchor="middle" style="font:700 7.5px var(--sans);fill:var(--green)">'+esc('SSH 22 → allowed')+'</text>', cap:'<b>SSH (22)</b> is encrypted and safe → <b>let it through</b>. The admin works normally.'},
    {glow:csGlow(64,100,'--red')+csGlow(320,100,'--red',23), dyn:csPkt('M84 100 L262 100','--red')+'<text x="320" y="66" text-anchor="middle" style="font:800 18px var(--mono);fill:var(--red)">✕</text><text x="320" y="150" text-anchor="middle" style="font:700 7.5px var(--sans);fill:var(--red)">'+esc('Telnet 23 → denied')+'</text>', cap:'<b>Telnet (23)</b> is unencrypted (passwords in clear text) → you <b>deny</b> it with a rule. The firewall stops it.'},
    {glow:csGlow(320,100,'--cyan',23), dyn:'', cap:'One targeted rule (deny TCP 23) + the default management permit = safe. Mind the <b>order</b> so the deny isn’t below the permit. <b>Build it in the block-telnet task.</b>'}
  ];
  function show(i){const g=$('c5lglow');if(g)g.innerHTML=STEPS[i].glow||'';const d=$('c5ldyn');if(d)d.innerHTML=STEPS[i].dyn||'';const c=$('c5lcap');if(c)c.innerHTML='<span>'+STEPS[i].cap+'</span>';}
  courseStepper('c5l',STEPS.length,show);
}
// ---- L4 shared scene PC — FW — WEB ----
function c5StateScene(pfx){
  return '<svg id="'+pfx+'svg" viewBox="0 0 640 196" width="100%" style="display:block">'
    +'<line x1="84" y1="100" x2="262" y2="100" style="stroke:var(--line2);stroke-width:1.6"/><line x1="378" y1="100" x2="520" y2="100" style="stroke:var(--line2);stroke-width:1.6"/>'
    +'<g id="'+pfx+'glow"></g>'
    +csHost(64,100,'desktop','--green','PC inside')+csDev(320,100,'firewall','FW')+csDev(540,100,'internet','WEB')
    +'<g id="'+pfx+'dyn"></g></svg>';
}
// L4M1 — The problem of replies
function renderC5StateProblem(){
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'Here’s the catch we promised to resolve back in the zones lesson. We learned: <b>inside → outside permitted, outside → inside denied</b>. But when a <b>PC requests a web page</b>, the server <b>sends a reply</b> – and that goes <b>outside → inside</b>! By the default deny it should be <b>blocked</b> and the web wouldn’t work at all. Manually permitting all return traffic from the internet would be a <b>huge hole</b>. So how do you let <b>replies</b> in, but not <b>uninvited</b> connections?'+'</p>'
    +'<div class="osi-stage">'+c5StateScene('c5m')+'</div>'
    +'<div class="m1-cap" id="c5mcap"></div>'
    +courseStepControls('c5m')
    +abbrBox([['return traffic','traffic returning on a connection someone inside asked for themselves.'],['unsolicited connection','a connection initiated from outside that no one inside started – we want to block this.']]);
}
function mountC5StateProblem(){
  const STEPS=[
    {glow:csGlow(64,100,'--green')+csGlow(320,100,'--green',23)+csGlow(540,100,'--green'), dyn:csPkt('M84 100 L262 100','--green')+csPkt('M378 100 L520 100','--green')+'<text x="320" y="68" text-anchor="middle" style="font:700 7.5px var(--sans);fill:var(--green)">'+esc('request out → allowed')+'</text>', cap:'The PC requests the <b>web</b>. That’s <b>inside → outside</b> → the firewall <b>allows</b> it. So far so good.'},
    {glow:csGlow(540,100,'--amber')+csGlow(320,100,'--red',23), dyn:csPkt('M520 100 L378 100','--amber')+'<text x="320" y="64" text-anchor="middle" style="font:800 18px var(--mono);fill:var(--red)">?</text><text x="320" y="150" text-anchor="middle" style="font:700 7.5px var(--sans);fill:var(--red)">'+esc('reply goes outside → inside')+'</text>', cap:'The server <b>replies</b>. But the reply goes <b>outside → inside</b> – which is <b>default deny</b>! A dumb firewall would block it and the web wouldn’t work.'},
    {glow:csGlow(320,100,'--cyan',23), dyn:'', cap:'Manually allowing everything back from the internet = <b>flinging the gates wide open</b>. We need a smarter firewall that <b>recognizes the reply to what the PC itself asked for</b>. That’s a <b>stateful firewall</b> – next module.'}
  ];
  function show(i){const g=$('c5mglow');if(g)g.innerHTML=STEPS[i].glow||'';const d=$('c5mdyn');if(d)d.innerHTML=STEPS[i].dyn||'';const c=$('c5mcap');if(c)c.innerHTML='<span>'+STEPS[i].cap+'</span>';}
  courseStepper('c5m',STEPS.length,show);
}
// L4M2 — Connection table
function renderC5ConnTable(){
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'The solution is a <b>stateful firewall</b>. It <b>remembers connections</b> that started from inside. When the PC opens a connection out, the firewall records it in a <b>connection table</b>: who, to where, which port. This table is its <b>memory</b> – it knows what’s "in progress". Thanks to it, it recognizes that an incoming reply belongs to an existing connection and lets it in – without you writing a single extra rule.'+'</p>'
    +'<div class="osi-stage">'+c5StateScene('c5n')+'</div>'
    +'<div class="m1-cap" id="c5ncap"></div>'
    +courseStepControls('c5n')
    +abbrBox([['stateful firewall','remembers active connections; lets their replies through automatically, blocks unsolicited ones.'],['connection table','a table of active connections (who↔where:port) the firewall keeps as its memory.']]);
}
function mountC5ConnTable(){
  const tbl=(rows)=>'<g><rect x="120" y="128" width="400" height="'+(20+rows.length*16)+'" rx="6" style="fill:var(--panel);stroke:var(--cyan);stroke-width:1.2"/><text x="132" y="142" style="font:700 7.5px var(--sans);fill:var(--cyan)">'+esc('connection table')+'</text>'+rows.map(function(r,i){return '<text x="132" y="'+(160+i*16)+'" style="font:600 8.5px var(--mono);fill:var(--txt)">'+esc(r)+'</text>';}).join('')+'</g>';
  const STEPS=[
    {glow:csGlow(64,100,'--green'), dyn:'', cap:'The PC is about to open a connection out to the web. The stateful firewall will <b>pay attention</b>.'},
    {glow:csGlow(64,100,'--green')+csGlow(320,100,'--cyan',23)+csGlow(540,100,'--green'), dyn:csPkt('M84 100 L262 100','--green')+csPkt('M378 100 L520 100','--green'), cap:'The PC opens a connection <b>PC → WEB:443</b>. The firewall lets it through and, crucially, <b>records</b> it.'},
    {glow:csGlow(320,100,'--cyan',23), dyn:tbl(['PC:51000  →  WEB:443   ('+'active'+')']), cap:'The <b>connection table</b> now holds: "PC ↔ WEB:443, active". The firewall remembers this connection <b>started from inside</b> – and that memory is the whole trick. <b>How it uses it for the reply</b> is the very next module.'}
  ];
  function show(i){const g=$('c5nglow');if(g)g.innerHTML=STEPS[i].glow||'';const d=$('c5ndyn');if(d)d.innerHTML=STEPS[i].dyn||'';const c=$('c5ncap');if(c)c.innerHTML='<span>'+STEPS[i].cap+'</span>';}
  courseStepper('c5n',STEPS.length,show);
}
// L4M3 — The reply gets through, uninvited traffic doesn't
function renderC5StateReply(){
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'Now we use the trick. When traffic comes <b>outside → inside</b>, the firewall first checks the <b>connection table</b>. <b>Does it match an active connection?</b> → it’s a <b>reply to what the PC asked for</b> → <b>let it in</b>. <b>Matches nothing?</b> → no one inside started it → it’s <b>unsolicited</b> → <b>block it</b>. So replies pass on their own and an attacker’s connections don’t. Safe <b>and</b> convenient.'+'</p>'
    +'<div class="osi-stage">'+c5StateScene('c5o')+'</div>'
    +'<div class="m1-cap" id="c5ocap"></div>'
    +courseStepControls('c5o')
    +abbrBox([['state match','incoming traffic that matches a connection-table entry = belongs to a permitted connection.'],['return traffic','replies to connections started from inside; thanks to state they pass automatically – you don’t hand-permit them.']]);
}
function mountC5StateReply(){
  const STEPS=[
    {glow:csGlow(540,100,'--amber')+csGlow(320,100,'--cyan',23), dyn:csPkt('M520 100 L378 100','--amber'), cap:'A reply comes from the <b>WEB</b> (outside → inside). The firewall doesn’t pass it blindly – it first <b>checks the table</b>.'},
    {glow:csGlow(540,100,'--green')+csGlow(320,100,'--green',23)+csGlow(64,100,'--green'), dyn:csPkt('M520 100 L378 100','--green')+csPkt('M262 100 L84 100','--green')+'<text x="320" y="68" text-anchor="middle" style="font:700 7.5px var(--sans);fill:var(--green)">'+esc('matches an active connection → allow')+'</text>', cap:'The reply <b>matches the entry</b> "PC ↔ WEB:443" → it’s a <b>requested reply</b> → the firewall <b>lets it</b> through to the PC. The web works.'},
    {glow:csGlow(540,100,'--red')+csGlow(320,100,'--red',23), dyn:csPkt('M520 100 L378 100','--red')+'<text x="320" y="66" text-anchor="middle" style="font:800 18px var(--mono);fill:var(--red)">✕</text><text x="320" y="150" text-anchor="middle" style="font:700 7.5px var(--sans);fill:var(--red)">'+esc('matches nothing → unsolicited → block')+'</text>', cap:'Now <b>someone on the internet starts on their own</b>. <b>Nothing matches</b> in the table (no one inside started it) → <b>unsolicited</b> → the firewall <b>blocks</b> it. The attacker doesn’t get in.'},
    {glow:csGlow(320,100,'--cyan',23), dyn:'', cap:'That’s how elegantly it holds: <b>replies yes, unsolicited connections no</b> – and you write no rule for return traffic. That’s the power of a stateful firewall.'}
  ];
  function show(i){const g=$('c5oglow');if(g)g.innerHTML=STEPS[i].glow||'';const d=$('c5odyn');if(d)d.innerHTML=STEPS[i].dyn||'';const c=$('c5ocap');if(c)c.innerHTML='<span>'+STEPS[i].cap+'</span>';}
  courseStepper('c5o',STEPS.length,show);
}
// L4M4 — UDP and ICMP
function renderC5StateUdp(){
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'One subtlety. <b>TCP</b> has a clear <b>start and end of a connection</b> (a handshake) – state is easy to track. But <b>UDP</b> (e.g. a DNS query) and <b>ICMP</b> (ping) have no "connection" – they’re single messages. How to track them? The firewall creates a <b>temporary entry</b> for them too (pseudo-state) with a <b>timeout</b>: after a query goes out it waits a few seconds for the reply and lets it in; then it discards the entry. Thanks to this a DNS reply or a ping reply passes without you permitting anything by hand.'+'</p>'
    +'<div class="osi-stage">'+c5StateScene('c5p')+'</div>'
    +'<div class="m1-cap" id="c5pcap"></div>'
    +courseStepControls('c5p')
    +abbrBox([['pseudo-state','a temporary, timed entry for UDP/ICMP – it mimics a "connection" where there isn’t one.'],['timeout','when it expires the firewall drops the entry; a late "reply" won’t be let in.']]);
}
function mountC5StateUdp(){
  const STEPS=[
    {glow:csGlow(320,100,'--cyan',23), dyn:'<text x="320" y="68" text-anchor="middle" style="font:700 7.5px var(--sans);fill:var(--cyan)">'+esc('TCP: a clear connection (handshake)')+'</text>', cap:'For <b>TCP</b> the firewall knows exactly when a connection <b>started and ended</b> (handshake, teardown). State is easy to keep.'},
    {glow:csGlow(64,100,'--green')+csGlow(320,100,'--cyan',23)+csGlow(540,100,'--green'), dyn:csPkt('M84 100 L262 100','--green')+csPkt('M378 100 L520 100','--green')+'<text x="320" y="68" text-anchor="middle" style="font:700 7.5px var(--sans);fill:var(--amber)">'+esc('UDP/ICMP: no connection (DNS, ping)')+'</text>', cap:'But a <b>UDP query (DNS)</b> or <b>ICMP (ping)</b> have no connection – they’re standalone messages. How to let the reply in?'},
    {glow:csGlow(320,100,'--cyan',23), dyn:'<text x="320" y="68" text-anchor="middle" style="font:700 7.5px var(--sans);fill:var(--cyan)">'+esc('pseudo-state with a timeout (a few seconds)')+'</text>', cap:'The firewall still makes a <b>temporary entry</b> with a <b>timeout</b>: "expecting a reply to this DNS query for a few seconds". It then lets that reply in.'},
    {glow:csGlow(64,100,'--green')+csGlow(320,100,'--green',23)+csGlow(540,100,'--green'), dyn:csPkt('M520 100 L378 100','--green')+csPkt('M262 100 L84 100','--green'), cap:'So a DNS reply or ping reply <b>passes</b> in time. A late or unsolicited "reply" won’t (the entry expired). Thus stateful inspection covers connectionless protocols <b>too</b>.'}
  ];
  function show(i){const g=$('c5pglow');if(g)g.innerHTML=STEPS[i].glow||'';const d=$('c5pdyn');if(d)d.innerHTML=STEPS[i].dyn||'';const c=$('c5pcap');if(c)c.innerHTML='<span>'+STEPS[i].cap+'</span>';}
  courseStepper('c5p',STEPS.length,show);
}
// L5M1 — Shadowed rule
function renderC5Shadow(){
  const svg='<svg id="c5qsvg" viewBox="0 0 640 160" width="100%" style="display:block">'
    +'<text x="60" y="22" style="font:700 9px var(--sans);fill:var(--muted)">'+'Rule order on the firewall:'+'</text>'
    +'<g id="c5qrows"></g><g id="c5qdyn"></g></svg>';
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'The most common firewall mistake follows from <b>first-match</b>: a <b>shadowed rule</b>. You want to deny "guest → file-server", but you put that <b>deny BELOW</b> a broad "permit all to the file-server". Because the first match wins, the guest matches the <b>permit on top</b> and your <b>deny never takes effect</b> – it’s in the shadow. It looks like you have protection, but you don’t. Watch.'+'</p>'
    +'<div class="osi-stage">'+svg+'</div>'
    +'<div class="m1-cap" id="c5qcap"></div>'
    +courseStepControls('c5q3')
    +abbrBox([['shadowed rule','a rule never reached because a more general rule above it matches first – it’s "in the shadow".'],['fix','move the specific deny ABOVE the general permit – then it applies first.']]);
}
function mountC5Shadow(){
  const bad=[{act:'permit',txt:'* → file-server · TCP 445'},{act:'deny',txt:'guest → file-server · TCP 445  (shadowed)'}];
  const good=[{act:'deny',txt:'guest → file-server · TCP 445  ✓'},{act:'permit',txt:'* → file-server · TCP 445'}];
  const set=(arr,hi)=>{var r=$('c5qrows');if(r)r.innerHTML=c5RuleRows(arr,hi);};
  const STEPS=[
    {arr:bad, hi:-1, dyn:'', cap:'You want to deny <b>guest → file-server</b>. But the deny is <b>below</b> a broad "permit all to the file-server". A packet from the <b>guest</b> arrives.'},
    {arr:bad, hi:0, dyn:'<text x="320" y="138" text-anchor="middle" style="font:700 8px var(--sans);fill:var(--red)">'+esc('guest matches the PERMIT on top → passes!')+'</text>', cap:'First-match: the guest <b>matches the permit on top</b> → <b>passes</b>. Your deny below is <b>never read</b>. The protection is only on paper.'},
    {arr:good, hi:0, dyn:'<text x="320" y="138" text-anchor="middle" style="font:700 8px var(--sans);fill:var(--green)">'+esc('deny on top → guest denied → OK')+'</text>', cap:'Fix: <b>move the deny ABOVE the permit</b>. Now the guest matches the <b>deny first</b> → <b>denied</b>, while the permit still lets others through. This is exactly the <b>shadow-rule</b> task.'}
  ];
  function show(i){set(STEPS[i].arr,STEPS[i].hi);const d=$('c5qdyn');if(d)d.innerHTML=STEPS[i].dyn||'';const c=$('c5qcap');if(c)c.innerHTML='<span>'+STEPS[i].cap+'</span>';}
  courseStepper('c5q3',STEPS.length,show);
}
// L5M2 — Overly permissive rule
function renderC5TooPermissive(){
  const svg='<svg id="c5rsvg" viewBox="0 0 640 150" width="100%" style="display:block">'
    +'<text x="60" y="22" style="font:700 9px var(--sans);fill:var(--muted)">'+'An over-broad rule:'+'</text>'
    +'<g id="c5rrows"></g><g id="c5rdyn"></g></svg>';
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'The second classic mistake: an <b>over-permissive rule</b>. "<b>Permit any → any</b>" (anything anywhere) is convenient – everything works – but it opens <b>absolutely everything</b>, including what you never meant to allow. A rule should be <b>as narrow as possible</b>: an exact source, destination, protocol and port. Instead of "permit all to the server" prefer "permit only web 443 from the internet to that one server". Less open = less risk.'+'</p>'
    +'<div class="osi-stage">'+svg+'</div>'
    +'<div class="m1-cap" id="c5rcap"></div>'
    +courseStepControls('c5r')
    +abbrBox([['any → any','a rule that permits all traffic – maximum convenience, maximum hole.'],['least privilege','permit only what’s genuinely needed – the narrowest possible rules.']]);
}
function mountC5TooPermissive(){
  const broad=[{act:'permit',txt:'any → any · any port'}];
  const narrow=[{act:'permit',txt:'outside → web-server · TCP 443'}];
  const set=(arr,hi)=>{var r=$('c5rrows');if(r)r.innerHTML=c5RuleRows(arr,hi);};
  const STEPS=[
    {arr:broad, hi:0, dyn:'', cap:'This single "<b>any → any</b>" rule permits <b>everything</b>. The web works, but… so does everything else.'},
    {arr:broad, hi:0, dyn:'<text x="320" y="120" text-anchor="middle" style="font:700 8px var(--sans);fill:var(--red)">'+esc('even internet → internal DB passes!')+'</text>', cap:'An attacker tries <b>internet → internal database</b> – and it <b>passes</b>, because "any → any" permits it. A convenient rule = an open gate.'},
    {arr:narrow, hi:0, dyn:'<text x="320" y="120" text-anchor="middle" style="font:700 8px var(--sans);fill:var(--green)">'+esc('only web 443 → all else falls to default deny')+'</text>', cap:'Fix: <b>narrow</b> the rule to exactly what you need – "outside → web-server, TCP 443". Everything else falls to the <b>default deny</b>. <b>The principle of least privilege.</b>'}
  ];
  function show(i){set(STEPS[i].arr,STEPS[i].hi);const d=$('c5rdyn');if(d)d.innerHTML=STEPS[i].dyn||'';const c=$('c5rcap');if(c)c.innerHTML='<span>'+STEPS[i].cap+'</span>';}
  courseStepper('c5r',STEPS.length,show);
}
// L5M3 — Forgotten rule
function renderC5StaleRule(){
  const svg='<svg id="c5ssvg" viewBox="0 0 640 150" width="100%" style="display:block">'
    +'<text x="60" y="22" style="font:700 9px var(--sans);fill:var(--muted)">'+'A temporary rule that was forgotten:'+'</text>'
    +'<g id="c5srows"></g><g id="c5sdyn"></g></svg>';
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'The third mistake is <b>human</b>: a <b>forgotten rule</b>. A vendor needed remote access (RDP 3389) to one server for a week, so a "temporary" permit was added. The work ended – but the <b>rule stayed</b>. A year later no one knows why it’s there, and it’s an <b>open hole</b> an attacker will eventually find. Rules <b>age</b> and pile up.'+'</p>'
    +'<div class="osi-stage">'+svg+'</div>'
    +'<div class="m1-cap" id="c5scap"></div>'
    +courseStepControls('c5s')
    +abbrBox([['temporary rule','an exception added "for a moment" that gets forgotten and stays open.'],['rule hygiene','give temporary rules an expiry date and clean them up regularly.']]);
}
function mountC5StaleRule(){
  const rows=[{act:'permit',txt:'outside → server · TCP 3389 (RDP)  — "temporary" for a vendor'}];
  const set=(hi)=>{var r=$('c5srows');if(r)r.innerHTML=c5RuleRows(rows,hi);};
  const STEPS=[
    {hi:0, dyn:'', cap:'A "<b>temporary</b>" permit is added: <b>internet → server, RDP 3389</b>, so a vendor can connect for a week.'},
    {hi:0, dyn:'<text x="320" y="120" text-anchor="middle" style="font:700 8px var(--sans);fill:var(--amber)">'+esc('job done… the rule stayed')+'</text>', cap:'The vendor leaves, the work ends – but <b>no one deletes the rule</b>. It stays for months, years.'},
    {hi:0, dyn:'<text x="320" y="120" text-anchor="middle" style="font:700 8px var(--sans);fill:var(--red)">'+esc('an attacker finds the open RDP → breach')+'</text>', cap:'And one day an <b>attacker finds the open RDP</b> from the internet and tries passwords. The forgotten exception became an <b>entry point</b>. That’s why rules must be <b>cleaned up regularly</b> – next module.'}
  ];
  function show(i){set(STEPS[i].hi);const d=$('c5sdyn');if(d)d.innerHTML=STEPS[i].dyn||'';const c=$('c5scap');if(c)c.innerHTML='<span>'+STEPS[i].cap+'</span>';}
  courseStepper('c5s',STEPS.length,show);
}
// L5M4 — Audit / cleanup
function renderC5Audit(){
  const svg='<svg id="c5tsvg" viewBox="0 0 640 170" width="100%" style="display:block">'
    +'<text x="60" y="22" style="font:700 9px var(--sans);fill:var(--muted)">'+'A regular rule audit looks for:'+'</text>'
    +'<g id="c5trows"></g></svg>';
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'The fix for all three mistakes is one: a <b>regular audit</b> (clean-up) of rules. You go through the list looking for three things: <b>shadowed</b> rules (never apply – fix or delete), <b>over-broad</b> rules (narrow them) and <b>forgotten / unused</b> rules (delete). Fewer rules that are <b>narrow and meaningful</b> is safer and clearer than a hundred old exceptions. You’ll try this in the <b>shadow-rule</b> task.'+'</p>'
    +'<div class="osi-stage">'+svg+'</div>'
    +'<div class="m1-cap" id="c5tcap"></div>'
    +courseStepControls('c5t')
    +abbrBox([['rule audit','a regular review of the list: find and fix shadowed, over-broad and forgotten rules.']]);
}
function mountC5Audit(){
  const row=(y,n,t,c)=>'<g><circle cx="56" cy="'+y+'" r="13" style="fill:var('+c+');fill-opacity:.16;stroke:var('+c+');stroke-width:1.6"/><text x="56" y="'+(y+4)+'" text-anchor="middle" style="font:800 10px var(--mono);fill:var('+c+')">'+n+'</text><text x="84" y="'+(y+4)+'" style="font:600 10.5px var(--sans);fill:var(--txt)">'+esc(t)+'</text></g>';
  const r1=row(50,'1','Shadowed rules → fix order or delete','--amber');
  const r2=r1+row(92,'2','Over-broad rules → narrow (least privilege)','--amber');
  const r3=r2+row(134,'3','Forgotten / unused → delete','--red');
  const STEPS=[
    {rows:r1, cap:'<b>1) Shadowed.</b> Find rules that order never reaches, and <b>fix the order</b> (or delete).'},
    {rows:r2, cap:'<b>2) Over-broad.</b> Narrow "any → any" and the like to exactly what’s needed.'},
    {rows:r3, cap:'<b>3) Forgotten.</b> <b>Delete</b> temporary exceptions and unused rules. Every rule should have a reason.'},
    {rows:r3, cap:'A regular audit keeps the firewall <b>narrow, clean and understandable</b>. That ends the rule theory – now <b>fix one mistake in the shadow-rule task</b>.'}
  ];
  function show(i){const r=$('c5trows');if(r)r.innerHTML=STEPS[i].rows;const c=$('c5tcap');if(c)c.innerHTML='<span>'+STEPS[i].cap+'</span>';}
  courseStepper('c5t',STEPS.length,show);
}
// ---- L6 shared scene HOME — internet — FW — server ----
function c5VpnScene(pfx){
  return '<svg id="'+pfx+'svg" viewBox="0 0 640 196" width="100%" style="display:block">'
    +'<line x1="84" y1="108" x2="260" y2="108" style="stroke:var(--line2);stroke-width:1.5"/><line x1="300" y1="108" x2="440" y2="108" style="stroke:var(--line2);stroke-width:1.5"/><line x1="480" y1="108" x2="552" y2="108" style="stroke:var(--line2);stroke-width:1.5"/>'
    +'<g id="'+pfx+'glow"></g>'
    +csHost(64,108,'mobile','--blue','HOME')+csDev(280,108,'internet','')+csDev(460,108,'firewall','FW')+csHost(572,108,'server','--green','internal server')
    +'<g id="'+pfx+'dyn"></g></svg>';
}
// L6M1 — Remote access
function renderC5VpnWhy(){
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'An employee is working <b>from home</b> and needs the <b>internal server</b> at the company (shared drives, systems). But that’s exactly what the whole course taught us to <b>deny</b>: no one gets in from the internet (default deny). So how do you let <b>your own</b> person in, but not an attacker? Exposing the server to the internet would be a hole. We need something that <b>safely "carries" the remote employee inside</b>.'+'</p>'
    +'<div class="osi-stage">'+c5VpnScene('c5u')+'</div>'
    +'<div class="m1-cap" id="c5ucap"></div>'
    +courseStepControls('c5u')
    +abbrBox([['remote access','the need to reach internal company resources from outside (home) – securely.'],['VPN','Virtual Private Network – an encrypted tunnel that securely "plugs you into" the network.']]);
}
function mountC5VpnWhy(){
  const STEPS=[
    {glow:csGlow(64,108,'--blue')+csGlow(572,108,'--green'), dyn:'', cap:'A <b>HOME</b> employee wants the <b>internal server</b>. Between them is the whole internet and the company firewall.'},
    {glow:csGlow(64,108,'--red')+csGlow(460,108,'--red',23)+csGlow(280,108,'--red'), dyn:csPkt('M84 108 L260 108','--red')+csPkt('M300 108 L440 108','--red')+'<text x="460" y="74" text-anchor="middle" style="font:800 18px var(--mono);fill:var(--red)">✕</text>', cap:'Connect directly? The <b>firewall denies it</b> (outside → inside = default deny). And rightly so – otherwise an attacker could connect too.'},
    {glow:csGlow(64,108,'--cyan')+csGlow(460,108,'--cyan',23), dyn:'', cap:'We don’t want to open the server to the whole world. We want to let in <b>only a verified employee</b> and <b>protect</b> their traffic even across the internet. The solution = a <b>VPN</b> (next module).'}
  ];
  function show(i){const g=$('c5uglow');if(g)g.innerHTML=STEPS[i].glow||'';const d=$('c5udyn');if(d)d.innerHTML=STEPS[i].dyn||'';const c=$('c5ucap');if(c)c.innerHTML='<span>'+STEPS[i].cap+'</span>';}
  courseStepper('c5u',STEPS.length,show);
}
// L6M2 — What a VPN does
function renderC5VpnWhat(){
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'A <b>VPN</b> (Virtual Private Network) does two things at once. <b>1) A tunnel:</b> it creates an <b>encrypted "tunnel"</b> across the internet between you and the company – anything passing through is <b>unreadable</b> on the way (even if intercepted). <b>2) "You’re inside":</b> after logging in the VPN gateway assigns you an address from the internal range (much like DHCP at home) and you behave <b>as if sitting in the office</b> – you reach the internal server normally. And you never "opened" the public internet.'+'</p>'
    +'<div class="osi-stage">'+c5VpnScene('c5v')+'</div>'
    +'<div class="m1-cap" id="c5vcap"></div>'
    +courseStepControls('c5v')
    +abbrBox([['tunnel','an encrypted "pipe" across the internet; the contents are unreadable to outsiders.'],['encryption','turning data into an unreadable form – eavesdropping en route gains nothing useful.']]);
}
function mountC5VpnWhat(){
  const tunnel='<line x1="84" y1="108" x2="440" y2="108" style="stroke:var(--cyan);stroke-width:5;opacity:.25"/><line x1="84" y1="108" x2="440" y2="108" style="stroke:var(--cyan);stroke-width:1.6;stroke-dasharray:3 3"/><text x="260" y="88" text-anchor="middle" style="font:700 7.5px var(--mono);fill:var(--cyan)">'+esc('encrypted tunnel')+'</text>';
  const STEPS=[
    {glow:csGlow(64,108,'--cyan')+csGlow(460,108,'--cyan',23), dyn:tunnel, cap:'The VPN client and the firewall build an <b>encrypted tunnel</b> across the internet. Everything inside is <b>unreadable</b> to anyone en route.'},
    {glow:csGlow(64,108,'--green')+csGlow(460,108,'--green',23)+csGlow(572,108,'--green')+csGlow(280,108,'--green'), dyn:'<line x1="84" y1="108" x2="440" y2="108" style="stroke:var(--cyan);stroke-width:5;opacity:.25"/>'+csPkt('M84 108 L440 108','--green')+csPkt('M480 108 L552 108','--green'), cap:'After logging in the employee behaves <b>as if sitting in the office</b> – through the tunnel they reach the <b>internal server</b>. The firewall allows it because it came via the <b>authenticated tunnel</b>.'},
    {glow:csGlow(460,108,'--cyan',23), dyn:'', cap:'Two wins at once: <b>safety</b> (encryption) and <b>reach</b> (you’re "inside") – and you never <b>exposed</b> the server to the whole internet. That’s the magic of a VPN.'}
  ];
  function show(i){const g=$('c5vglow');if(g)g.innerHTML=STEPS[i].glow||'';const d=$('c5vdyn');if(d)d.innerHTML=STEPS[i].dyn||'';const c=$('c5vcap');if(c)c.innerHTML='<span>'+STEPS[i].cap+'</span>';}
  courseStepper('c5v',STEPS.length,show);
}
// L6M3 — Remote-access vs site-to-site
function renderC5VpnTypes(){
  const svg='<svg id="c5wsvg" viewBox="0 0 640 200" width="100%" style="display:block">'
    +'<line x1="320" y1="20" x2="320" y2="180" style="stroke:var(--line2);stroke-width:1.2;stroke-dasharray:4 4"/>'
    +'<text x="160" y="30" text-anchor="middle" style="font:700 9px var(--sans);fill:var(--blue)">'+'Remote-access (1 person)'+'</text>'
    +'<text x="480" y="30" text-anchor="middle" style="font:700 9px var(--sans);fill:var(--amber)">'+'Site-to-site (a whole site)'+'</text>'
    +'<line x1="84" y1="118" x2="236" y2="118" style="stroke:var(--cyan);stroke-width:1.6;stroke-dasharray:3 3"/>'
    +'<line x1="404" y1="118" x2="536" y2="118" style="stroke:var(--cyan);stroke-width:1.6;stroke-dasharray:3 3"/>'
    +'<g id="c5wglow"></g>'
    +csHost(64,118,'mobile','--blue','HOME')+csDev(256,118,'firewall','FW')+csDev(384,118,'firewall','FW-A')+csDev(556,118,'firewall','FW-B')
    +'<g id="c5wdyn"></g></svg>';
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'A VPN comes in two main forms. <b>Remote-access VPN</b>: <b>one person</b> (laptop, phone) connects to the company via a client – exactly our home-office case. <b>Site-to-site VPN</b>: a permanent encrypted tunnel <b>between two networks</b> (e.g. HQ ↔ branch) that joins whole locations as if they were one network. Employees at the branch don’t even know about it – "it just works".'+'</p>'
    +'<div class="osi-stage">'+svg+'</div>'
    +'<div class="m1-cap" id="c5wcap"></div>'
    +courseStepControls('c5w')
    +abbrBox([['remote-access VPN','a single user with a client connects into the company network (home office).'],['site-to-site VPN','a permanent tunnel between two networks (HQ ↔ branch) – joins whole locations.']]);
}
function mountC5VpnTypes(){
  const STEPS=[
    {glow:csGlow(64,118,'--blue')+csGlow(256,118,'--cyan',22), dyn:csPkt('M84 118 L236 118','--blue'), cap:'<b>Remote-access:</b> one employee with a VPN client (laptop, phone) connects into the company. For <b>individuals</b>.'},
    {glow:csGlow(384,118,'--amber',22)+csGlow(556,118,'--amber',22), dyn:csPkt('M404 118 L560 118','--amber')+csPkt('M560 118 L404 118','--amber'), cap:'<b>Site-to-site:</b> a permanent tunnel between <b>two firewalls</b> (HQ ↔ branch). It joins whole networks – users install nothing.'},
    {glow:csGlow(256,118,'--cyan',22)+csGlow(384,118,'--amber',22), dyn:'', cap:'The same idea (an encrypted tunnel), two scales: <b>one person</b> vs <b>a whole branch</b>. Both terminate at the <b>firewall</b> – and where exactly is the next module.'}
  ];
  function show(i){const g=$('c5wglow');if(g)g.innerHTML=STEPS[i].glow||'';const d=$('c5wdyn');if(d)d.innerHTML=STEPS[i].dyn||'';const c=$('c5wcap');if(c)c.innerHTML='<span>'+STEPS[i].cap+'</span>';}
  courseStepper('c5w',STEPS.length,show);
}
// L6M4 — Where the VPN sits on the firewall
function renderC5VpnFirewall(){
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'Where does a VPN <b>end</b>? The tunnel <b>typically "unwraps" at the firewall</b> (or a dedicated VPN concentrator) – it verifies the login and places the VPN traffic into its own <b>"VPN" zone</b>. That zone has <b>higher trust</b> than the internet (it’s a verified employee), so it may reach permitted internal servers – but still under the control of rules. A zone is still just a <b>label on an interface</b> (you know that from the zones lesson) – and that exact label can be stuck on wrong: if the VPN interface is mistakenly in the "outside" zone, the firewall <b>blocks</b> the logged-in user like anyone from the internet. That exact mistake is the <b>remote-vpn</b> task.'+'</p>'
    +'<div class="osi-stage">'+c5VpnScene('c5x')+'</div>'
    +'<div class="m1-cap" id="c5xcap"></div>'
    +courseStepControls('c5x')
    +abbrBox([['VPN zone','a firewall zone for verified VPN users – higher trust than the internet, but still under rules.'],['remote-vpn','the task: the VPN-pool interface is wrongly in the "outside" zone → change its role to VPN.']]);
}
function mountC5VpnFirewall(){
  const STEPS=[
    {glow:csGlow(64,108,'--cyan')+csGlow(460,108,'--cyan',23)+csGlow(280,108,'--cyan'), dyn:'<line x1="84" y1="108" x2="440" y2="108" style="stroke:var(--cyan);stroke-width:5;opacity:.22"/>'+csPkt('M84 108 L440 108','--cyan'), cap:'The tunnel from the HOME client <b>ends at the firewall</b>. It verifies the login (credentials, certificate) – is this really our employee?'},
    {glow:csGlow(460,108,'--green',23), dyn:'<text x="460" y="162" text-anchor="middle" style="font:700 7.5px var(--mono);fill:var(--green)">'+esc('VPN zone (higher trust)')+'</text>', cap:'After verifying, the firewall puts the traffic into the <b>"VPN" zone</b> – <b>higher trust</b> than outside. It may reach permitted internal servers, still by the rules.'},
    {glow:csGlow(460,108,'--green',23)+csGlow(572,108,'--green'), dyn:csPkt('M480 108 L552 108','--green'), cap:'And there it is: the verified employee reaches the <b>internal server</b>. Mind the pitfall – if the VPN interface were in the "outside" zone, the firewall would block them as a stranger. <b>You’ll fix that in the remote-vpn task.</b>'}
  ];
  function show(i){const g=$('c5xglow');if(g)g.innerHTML=STEPS[i].glow||'';const d=$('c5xdyn');if(d)d.innerHTML=STEPS[i].dyn||'';const c=$('c5xcap');if(c)c.innerHTML='<span>'+STEPS[i].cap+'</span>';}
  courseStepper('c5x',STEPS.length,show);
}
// L6M5 — Split vs full tunnel
function renderC5VpnSplit(){
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'The last VPN decision: <b>where should the client’s internet traffic go?</b> A <b>full tunnel</b> sends <b>everything</b> through the tunnel – even ordinary browsing goes to the company first, passes the corporate firewall (and its inspections) and only then out. Safer, but slower and it loads the company link. A <b>split tunnel</b> tunnels <b>corporate traffic only</b> – the internal server is reached via the tunnel, but the web is reached <b>directly from the client’s own connection</b>, bypassing the corporate network and firewall. Faster, but the company cannot see (or protect) the employee’s internet traffic. In the simulator you switch it in the VPN host’s settings under <b>"VPN tunnel (to internet)"</b> – the options <b>"Full-tunnel (all traffic via firewall)"</b> and <b>"Split-tunnel (internet traffic direct)"</b>. Try both modes in the traffic test and watch the route.'+'</p>'
    +'<div class="osi-stage">'+c5VpnScene('c5va')+'</div>'
    +'<div class="m1-cap" id="c5vacap"></div>'
    +courseStepControls('c5va')
    +abbrBox([['full tunnel','all client traffic goes through the tunnel via the company – internet included.'],['split tunnel','only corporate traffic is tunneled; internet goes straight out, bypassing the corporate firewall.']]);
}
function mountC5VpnSplit(){
  const tun='<line x1="84" y1="108" x2="440" y2="108" style="stroke:var(--cyan);stroke-width:5;opacity:.25"/>';
  const STEPS=[
    {glow:csGlow(64,108,'--cyan')+csGlow(460,108,'--cyan',23), dyn:tun+'<text x="260" y="88" text-anchor="middle" style="font:700 7.5px var(--mono);fill:var(--cyan)">'+esc('tunnel to the company')+'</text>', cap:'Starting point: the client has a <b>VPN tunnel</b> to the company. The question: which way does their <b>internet</b> traffic go?'},
    {glow:csGlow(64,108,'--green')+csGlow(460,108,'--green',23)+csGlow(280,108,'--green'), dyn:tun+csPkt('M84 108 L440 108','--green')+csPkt('M440 108 L300 108','--green','2s')+'<text x="260" y="66" text-anchor="middle" style="font:700 7.5px var(--mono);fill:var(--green)">'+esc('FULL: everything tunneled, out via the corporate FW')+'</text>', cap:'<b>Full tunnel:</b> even browsing goes <b>through the tunnel to the company</b> first, passes the firewall and only then reaches the internet. The company sees and protects everything – at the cost of a longer path.'},
    {glow:csGlow(64,108,'--amber')+csGlow(280,108,'--amber'), dyn:tun+csPkt('M84 108 L260 108','--amber')+'<text x="170" y="66" text-anchor="middle" style="font:700 7.5px var(--mono);fill:var(--amber)">'+esc('SPLIT: internet directly, outside the corporate FW')+'</text>', cap:'<b>Split tunnel:</b> internet traffic goes <b>straight out</b> – fast, but <b>outside the corporate firewall</b>. Corporate traffic is still protected by the tunnel; browsing, though, the company no longer sees.'},
    {glow:csGlow(460,108,'--cyan',23), dyn:'', cap:'The choice is a trade-off: <b>full</b> = control and protection, <b>split</b> = performance and link savings. Security-sensitive companies enforce a full tunnel; split suits e.g. video calls. In the simulator: double-click the VPN host → <b>VPN tunnel (to internet)</b>.'}
  ];
  function show(i){const g=$('c5vaglow');if(g)g.innerHTML=STEPS[i].glow||'';const d=$('c5vadyn');if(d)d.innerHTML=STEPS[i].dyn||'';const c=$('c5vacap');if(c)c.innerHTML='<span>'+STEPS[i].cap+'</span>';}
  courseStepper('c5va',STEPS.length,show);
}
// ---- L7 security topology (firewall + zones + inside VLAN) ----
function c5SecTopo(pfx){
  return '<svg id="'+pfx+'svg" viewBox="0 0 640 222" width="100%" style="display:block">'
    +'<line x1="80" y1="96" x2="188" y2="96" style="stroke:var(--line2);stroke-width:1.5"/><line x1="227.1" y1="90" x2="352.9" y2="50" style="stroke:var(--line2);stroke-width:1.5"/><line x1="227" y1="102.3" x2="353" y2="143.7" style="stroke:var(--line2);stroke-width:1.5"/><line x1="391.5" y1="145.6" x2="540.5" y2="112.4" style="stroke:var(--blue);stroke-width:1.4"/><line x1="391.7" y1="153.6" x2="540.3" y2="180.4" style="stroke:var(--green);stroke-width:1.4"/>'
    +'<g id="'+pfx+'glow"></g>'
    +csDev(60,96,'internet','')+csDev(208,96,'firewall','FW')+csHost(372,44,'server','--amber','WEB·DMZ')+csDev(372,150,'l3switch','CORE')+csHost(560,108,'desktop','--blue','PC·V10')+csHost(560,184,'nas','--green','DB·V20')
    +'<g id="'+pfx+'dyn"></g></svg>';
}
// L7M1 — VLAN + firewall together
function renderC5WholeSec(){
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'Let’s combine two courses. From <b>the Switching and VLANs course</b> you can <b>split a network into VLANs</b> (users apart, servers apart, guests apart). From this course you know <b>firewalls and zones</b> (boundaries, rules, DMZ). Together they form <b>defense in layers</b>: the firewall guards the <b>boundary</b> (internet ↔ DMZ ↔ inside) and VLANs with ACLs guard traffic <b>inside</b> (users can’t just reach the DB). One layer catches what another lets through.'+'</p>'
    +'<div class="osi-stage">'+c5SecTopo('c5y')+'</div>'
    +'<div class="m1-cap" id="c5ycap"></div>'
    +courseStepControls('c5y')
    +abbrBox([['defense in depth','multiple independent layers (firewall at the boundary + VLAN/ACL inside) – if one fails, another holds.'],['segmentation','splitting the network into smaller separated parts (VLANs/zones) so a problem can’t spread.']]);
}
function mountC5WholeSec(){
  const STEPS=[
    {glow:csGlow(208,96,'--cyan',22), dyn:'', cap:'At the <b>boundary</b> stands the <b>firewall</b> with zones: internet (outside), the <b>WEB in the DMZ</b> and the internal network (inside). You know this from this course.'},
    {glow:csGlow(372,150,'--cyan',22)+csGlow(560,108,'--blue')+csGlow(560,184,'--green'), dyn:'', cap:'And <b>inside</b> the network is split into <b>VLANs</b> (PC in V10, DB in V20) with a <b>CORE L3</b> and ACLs – from the Switching and VLANs course. Users and data are separated.'},
    {glow:csGlow(208,96,'--green',22)+csGlow(372,150,'--green',22), dyn:'', cap:'This is <b>defense in depth</b>: a firewall at the boundary + segmentation inside. An attacker must break <b>several independent layers</b>, not one. Let’s walk two scenarios.'}
  ];
  function show(i){const g=$('c5yglow');if(g)g.innerHTML=STEPS[i].glow||'';const d=$('c5ydyn');if(d)d.innerHTML=STEPS[i].dyn||'';const c=$('c5ycap');if(c)c.innerHTML='<span>'+STEPS[i].cap+'</span>';}
  courseStepper('c5y',STEPS.length,show);
}
// L7M2 — Two scenarios
function renderC5TwoScenarios(){
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'Let’s walk two scenarios and see the layers cooperate. <b>Scenario A (legitimate):</b> a customer from the internet wants the <b>DMZ web</b> – that’s fine, the firewall allows port 443 into the DMZ. <b>Scenario B (attack):</b> someone from the internet (or the breached DMZ web) wants the <b>internal database</b> – here <b>two</b> layers stop them: the firewall (the inside zone is closed) and segmentation (the DB is in its own VLAN with an ACL). Watch.'+'</p>'
    +'<div class="osi-stage">'+c5SecTopo('c5z')+'</div>'
    +'<div class="m1-cap" id="c5zcap"></div>'
    +courseStepControls('c5z')
    +abbrBox([['scenario','a specific path of traffic through the network – it shows what each layer does.'],['layered defense','legitimate traffic passes, an attack hits the firewall and then the segmentation in turn.']]);
}
function mountC5TwoScenarios(){
  const STEPS=[
    {glow:csGlow(60,96,'--green',20)+csGlow(208,96,'--green',22)+csGlow(372,44,'--green'), dyn:csPkt('M80 96 L188 96','--green')+csPkt('M227.1 90 L352.9 50','--green')+'<text x="270" y="30" text-anchor="middle" style="font:700 7.5px var(--sans);fill:var(--green)">'+esc('A) customer → WEB 443: allowed')+'</text>', cap:'<b>Scenario A:</b> a customer from the internet to the <b>DMZ web</b> (443). The firewall <b>allows</b> it – that’s exactly what the DMZ is for. The web works.'},
    {glow:csGlow(60,96,'--red',20)+csGlow(208,96,'--red',22), dyn:csPkt('M80 96 L188 96','--red')+'<text x="208" y="62" text-anchor="middle" style="font:800 18px var(--mono);fill:var(--red)">✕</text><text x="300" y="136" text-anchor="middle" style="font:700 7.5px var(--sans);fill:var(--red)">'+esc('B) internet → DB: stopped at firewall')+'</text>', cap:'<b>Scenario B:</b> an attack from the internet on the <b>internal DB</b>. <b>Layer 1 – the firewall:</b> the inside zone is closed (default deny) → <b>stop</b>. It doesn’t get in.'},
    {glow:csGlow(372,44,'--red')+csGlow(208,96,'--red',22)+csGlow(372,150,'--red',22), dyn:csPkt('M352.9 50 L227.1 90','--red')+csPkt('M227 102.3 L353 143.7','--red')+'<text x="466" y="173" text-anchor="middle" style="font:800 16px var(--mono);fill:var(--red)">✕</text><text x="300" y="212" text-anchor="middle" style="font:700 7.5px var(--sans);fill:var(--red)">'+esc('even if DMZ web fell → VLAN/ACL on CORE holds the DB')+'</text>', cap:'And even if the attacker <b>took over the DMZ web</b> and tried the DB from there: <b>layer 2 – segmentation</b> (the DB in its own VLAN + an ACL on CORE) <b>stops them too</b>. Two layers, a double safeguard.'},
    {glow:csGlow(208,96,'--green',22)+csGlow(372,150,'--green',22), dyn:'', cap:'That’s the point: <b>legitimate traffic passes, an attack hits wall after wall</b>. Firewall + VLANs = more than the sum of parts. With this you have the core of network security down.'}
  ];
  function show(i){const g=$('c5zglow');if(g)g.innerHTML=STEPS[i].glow||'';const d=$('c5zdyn');if(d)d.innerHTML=STEPS[i].dyn||'';const c=$('c5zcap');if(c)c.innerHTML='<span>'+STEPS[i].cap+'</span>';}
  courseStepper('c5z',STEPS.length,show);
}
// L7M3 — What's next → Course 6
function renderC5WhatsNextC6(){
  const svg='<svg id="c5zzsvg" viewBox="0 0 640 188" width="100%" style="display:block">'
    +'<line x1="84" y1="94" x2="262" y2="94" style="stroke:var(--green);stroke-width:1.8"/>'
    +'<g id="c5zzglow"></g>'
    +csDev(64,94,'internet','INTERNET')+csDev(320,94,'firewall','FW')+csHost(556,94,'server','--green','servery')
    +'<line x1="378" y1="94" x2="500" y2="94" style="stroke:var(--green);stroke-width:1.8"/>'
    +'<g id="c5zzdyn"></g></svg>';
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'You have a solid secure network – but one thing is still <b>missing</b>: <b>reliability</b>. All traffic flows through <b>one firewall</b>. What if that <b>single firewall</b> (or its link) <b>fails</b>? The whole company is <b>offline</b> – traffic has no way out. (Not unprotected, luckily: a firewall typically shuts on failure, <b>fail-closed</b>, so it would rather pass nothing than pass everything.) One device = a <b>single point of failure</b>. The fix – <b>backup paths and devices</b>, redundancy, high availability – lives in two places: <b>the redundancy and STP course</b> covers backup links and switches (L2), and <b>the router in depth course</b> covers gateway redundancy (HSRP/VRRP) and firewall HA pairs. There you’ll learn how a network survives an outage.'+'</p>'
    +'<div class="osi-stage">'+svg+'</div>'
    +'<div class="m1-cap" id="c5zzcap"></div>'
    +courseStepControls('c5zz')
    +abbrBox([['single point of failure','a device whose failure brings down the whole network. The fix is redundancy (the redundancy and STP course; for the gateway and firewall the router in depth course).'],['high availability','a design with backups so the network survives a device failure without an outage (HSRP/VRRP and HA pairs – the router in depth course).']]);
}
function mountC5WhatsNextC6(){
  const STEPS=[
    {glow:csGlow(64,94,'--green',20)+csGlow(320,94,'--green',22)+csGlow(556,94,'--green'), dyn:csPkt('M84 94 L262 94','--green')+csPkt('M378 94 L500 94','--green'), cap:'This network is secure and works: all traffic flows through the <b>firewall</b> to the <b>servers</b>. But it hangs on <b>one</b> firewall.'},
    {glow:csGlow(320,94,'--red',22), dyn:'<line x1="84" y1="94" x2="262" y2="94" style="stroke:var(--red);stroke-width:2;stroke-dasharray:5 5"/><line x1="378" y1="94" x2="500" y2="94" style="stroke:var(--red);stroke-width:2;stroke-dasharray:5 5"/><text x="320" y="60" text-anchor="middle" style="font:800 18px var(--mono);fill:var(--red)">✕</text><text x="320" y="146" text-anchor="middle" style="font:700 8px var(--sans);fill:var(--red)">'+esc('firewall fails → everything offline (fail-closed)')+'</text>', cap:'If that <b>one firewall fails</b>, the company is <b>offline</b> – it shuts (fail-closed), so nothing flows at all. A <b>single point of failure.</b>'},
    {glow:csGlow(320,94,'--cyan',22), dyn:'', cap:'We’d want a <b>backup</b> firewall, backup links, devices that <b>fail over by themselves</b>. That’s <b>redundancy and high availability</b> – links and switches in <b>the redundancy and STP course</b>, gateway backup and firewall HA pairs in <b>the router in depth course</b>. You have a secure network; now we’ll make it <b>resilient</b>. And before you move on, you can put the whole course into practice – in the task below you’ll build firewall rules on the <b>default deny</b> principle.'}
  ];
  function show(i){const g=$('c5zzglow');if(g)g.innerHTML=STEPS[i].glow||'';const d=$('c5zzdyn');if(d)d.innerHTML=STEPS[i].dyn||'';const c=$('c5zzcap');if(c)c.innerHTML='<span>'+STEPS[i].cap+'</span>';}
  courseStepper('c5zz',STEPS.length,show);
}
const COURSE_5_DEF = {
  id:'course5',
title:'Network security',
  blurb:'Firewalls in practice: inside/outside/DMZ zones, rules, stateful inspection, VPN and common misconfigurations.',
  lessons:[
    { id:'c5l1', title:'The open-network problem', taskId:'open-net', quizId:'c5q_l1', modules:[
      { id:'c5l1m1', title:'A network with no door', render:renderC5OpenNet, mount:mountC5OpenNet },
      { id:'c5l1m2', title:'What’s at risk', render:renderC5Threats, mount:mountC5Threats },
      { id:'c5l1m3', title:'The firewall = a gatekeeper', render:renderC5FirewallGate, mount:mountC5FirewallGate }
    ]},
    { id:'c5l2', title:'Zones: inside, outside, DMZ', taskId:'web-dmz', quizId:'c5q_l2', modules:[
      { id:'c5l2m1', title:'Trust zones', render:renderC5Zones, mount:mountC5Zones },
      { id:'c5l2m2', title:'Default deny inbound', render:renderC5DefaultDeny, mount:mountC5DefaultDeny },
      { id:'c5l2m3', title:'DMZ: public servers apart', render:renderC5Dmz, mount:mountC5Dmz },
      { id:'c5l2m4', title:'Rules between zones', render:renderC5ZoneRules, mount:mountC5ZoneRules },
      { id:'c5l2m5', title:'The whole picture', render:renderC5ZonesWhole, mount:mountC5ZonesWhole }
    ]},
    { id:'c5l3', title:'Anatomy of a rule', taskId:'block-telnet', quizId:'c5q_l3', modules:[
      { id:'c5l3m1', title:'What a rule is made of', render:renderC5RuleAnatomy, mount:mountC5RuleAnatomy },
      { id:'c5l3m2', title:'First-match: order matters', render:renderC5FirstMatch, mount:mountC5FirstMatch },
      { id:'c5l3m3', title:'Default deny at the end', render:renderC5DefaultDenyEnd, mount:mountC5DefaultDenyEnd },
      { id:'c5l3m4', title:'Example: block Telnet', render:renderC5BlockTelnet, mount:mountC5BlockTelnet }
    ]},
    { id:'c5l4', title:'Stateful firewall', taskId:'firewall-observe', quizId:'c5q_l4', modules:[
      { id:'c5l4m1', title:'The reply problem', render:renderC5StateProblem, mount:mountC5StateProblem },
      { id:'c5l4m2', title:'The connection table', render:renderC5ConnTable, mount:mountC5ConnTable },
      { id:'c5l4m3', title:'Replies pass, unsolicited don’t', render:renderC5StateReply, mount:mountC5StateReply },
      { id:'c5l4m4', title:'UDP and ICMP', render:renderC5StateUdp, mount:mountC5StateUdp }
    ]},
    { id:'c5l5', title:'Shadowed rules and mistakes', taskId:'shadow-rule', quizId:'c5q_l5', modules:[
      { id:'c5l5m1', title:'A shadowed rule', render:renderC5Shadow, mount:mountC5Shadow },
      { id:'c5l5m2', title:'An over-permissive rule', render:renderC5TooPermissive, mount:mountC5TooPermissive },
      { id:'c5l5m3', title:'A forgotten rule', render:renderC5StaleRule, mount:mountC5StaleRule },
      { id:'c5l5m4', title:'Audit and clean-up', render:renderC5Audit, mount:mountC5Audit }
    ]},
    { id:'c5l6', title:'VPN: remote access', taskId:'remote-vpn', quizId:'c5q_l6', modules:[
      { id:'c5l6m1', title:'Remote access', render:renderC5VpnWhy, mount:mountC5VpnWhy },
      { id:'c5l6m2', title:'What a VPN does', render:renderC5VpnWhat, mount:mountC5VpnWhat },
      { id:'c5l6m3', title:'Remote-access vs site-to-site', render:renderC5VpnTypes, mount:mountC5VpnTypes },
      { id:'c5l6m4', title:'Where a VPN sits on the firewall', render:renderC5VpnFirewall, mount:mountC5VpnFirewall },
      { id:'c5l6m5', title:'Split vs full tunnel', render:renderC5VpnSplit, mount:mountC5VpnSplit }
    ]},
    { id:'c5l7', title:'The whole path together', taskId:'default-deny', quizId:'c5q_l7', modules:[
      { id:'c5l7m1', title:'VLAN + firewall together', render:renderC5WholeSec, mount:mountC5WholeSec },
      { id:'c5l7m2', title:'Two scenarios', render:renderC5TwoScenarios, mount:mountC5TwoScenarios },
      { id:'c5l7m3', title:'What is still missing → <i>Redundancy and Spanning Tree</i>', render:renderC5WhatsNextC6, mount:mountC5WhatsNextC6 }
    ]}
  ]
};
const COURSE_5_QUIZZES_DEF = {
  c5q_l1:{ title:'Quiz: The open-network problem', qs:[
    { q:'Why is an <b>open network</b> (no boundary to the internet) a problem?',
      opts:['anyone on the internet can directly reach internal servers and data','it tends to be slower because no firewall guards its boundary','it uses far more public IP addresses than a network with a clear edge'],
      correct:0, why:'With no boundary, anyone can connect to the servers. And since everything inside is trusted, an attacker then reaches everything.' },
    { q:'What does an attacker typically do <b>first</b> when they can see a network?',
      opts:['scans which services/ports are open (maps the terrain)','immediately encrypts all the data and demands a ransom','instantly disconnects the whole breached network from the internet'],
      correct:0, why:'A port scan is reconnaissance: the attacker learns what’s running and where they might get in. Only then do they attack a specific service.' },
    { q:'What is the role of a <b>firewall</b>?',
      opts:['a gatekeeper at the boundary – permits or blocks traffic by rules','it speeds up the internet connection for all connected devices','it assigns all connected devices their internal IP addresses'],
      correct:0, why:'A firewall sits at the network boundary and judges all traffic by rules: it permits the legitimate and blocks the uninvited.' }
  ]},
  c5q_l2:{ title:'Quiz: Firewall zones', qs:[
    { q:'What is a <b>zone</b> in firewall terms?',
      opts:['a group of networks with the same trust level; the firewall controls traffic between zones','one single specific IP address permanently assigned to the firewall’s outside interface','a special type of cable running between the firewall and the core switch'],
      correct:0, why:'A firewall works with zones (outside/inside/DMZ), not individual cables, and decides who from which may go where.' },
    { q:'What is the firewall’s <b>default</b> behavior for <b>OUTSIDE → INSIDE</b>?',
      opts:['deny – from the internet inward you get nowhere without a rule','permit all – any traffic gets in from the internet','permit only ping so internal server reachability can be checked'],
      correct:0, why:'The "trust outward, not inward" principle: outbound is allowed, but connections initiated from the internet inward are denied by default.' },
    { q:'Why put a public web server in the <b>DMZ</b>, not inside?',
      opts:['if it’s breached, the attacker stays in the DMZ and can’t reach the internal network','in the DMZ the server has faster internet than anywhere inside','putting the server in the DMZ saves both public and private IP addresses for the company'],
      correct:0, why:'A DMZ isolates public servers. The firewall blocks DMZ → inside, so a web breach doesn’t endanger internal data. A small blast radius.' },
    { q:'Which direction does a firewall typically <b>deny</b>?',
      opts:['DMZ → INSIDE (so a breached web can’t reach internal data)','INSIDE → OUTSIDE (so employees can’t get out to the internet at all)','INSIDE → DMZ (so the firm can’t reach its own web server)'],
      correct:0, why:'DMZ → inside is denied precisely so a breached public server can’t pivot into the trusted internal network.' }
  ]},
  c5q_l3:{ title:'Quiz: Anatomy of a rule', qs:[
    { q:'What parts make up a firewall rule?',
      opts:['action + source + destination + protocol + port','just the source and destination IP address alone','a username, a password and the target zone name'],
      correct:0, why:'"Permit/deny traffic from here to there, this protocol on this port." The firewall matches these against each packet.' },
    { q:'What does it mean that a firewall uses <b>first-match</b>?',
      opts:['it reads top-down and the first rule the traffic matches wins','it reads the whole list bottom-up and the last matching rule wins','it goes through all rules and applies the strictest of them'],
      correct:0, why:'Once a packet matches a rule, its action is taken and reading stops. So specific denies must sit above general permits.' },
    { q:'Traffic matches none of the written rules. What happens?',
      opts:['it falls to the default "deny all" (implicit deny) → denied','it’s permitted automatically because no rule explicitly denied it','the whole firewall crashes and stops passing any further traffic'],
      correct:0, why:'At the end is an invisible "deny all". What isn’t explicitly permitted is denied – the safe default.' },
    { q:'Why deny Telnet (23) but permit SSH (22) to a <b>management server</b>?',
      opts:['Telnet is unencrypted (passwords in clear text), SSH is the encrypted safe replacement','Telnet is noticeably slower and far less efficient with transferred data than modern SSH is','SSH is much older and time-proven, and therefore the more secure one'],
      correct:0, why:'Telnet sends passwords in clear text – eavesdroppable. SSH does the same encrypted. So Telnet is blocked and SSH used.' }
  ]},
  c5q_l4:{ title:'Quiz: Stateful firewall', qs:[
    { q:'With outside→inside denied, how does the <b>reply</b> to a web request the PC made get through?',
      opts:['the stateful firewall remembers the connection and lets the reply through automatically','you must manually permit all the incoming traffic from the whole internet inward','no way at all – the web simply wouldn’t work with such a setup'],
      correct:0, why:'A stateful firewall records the outbound connection in its table. The incoming reply matches it, so it passes – with no manual rule.' },
    { q:'What is the <b>connection table</b>?',
      opts:['the memory of active connections the firewall tracks (who↔where:port)','a list of blocked IP addresses no traffic may arrive from','a table where the firewall stores all the MAC addresses it learns'],
      correct:0, why:'It’s a record of "in-progress" connections. By it the firewall tells whether incoming traffic belongs to something started inside.' },
    { q:'Incoming traffic <b>matches no</b> entry in the connection table. What does the firewall do?',
      opts:['it’s an unsolicited connection → block it','it just permits it onward right away','it adds it to the table and allows it'],
      correct:0, why:'If traffic matches no active connection, no one inside asked for it = unsolicited = block. That’s how an attacker’s connections are stopped.' },
    { q:'How does a stateful firewall track <b>UDP and ICMP</b>, which have no connection?',
      opts:['it makes a temporary entry (pseudo-state) with a timeout for the reply','it never lets them through because they lack any properly established connection','it permits them all permanently with no timeout whatsoever'],
      correct:0, why:'UDP/ICMP have no handshake, so the firewall creates a temporary timed state: it lets a reply in within a few seconds, then drops the entry.' }
  ]},
  c5q_l5:{ title:'Quiz: Shadowed rules and mistakes', qs:[
    { q:'What is a <b>shadowed</b> rule?',
      opts:['a rule never reached because a more general rule above it matches first','a rule that is entirely missing any configured source and destination of traffic','the very newest rule added by hand to the very end of the list'],
      correct:0, why:'Due to first-match, traffic matches the general rule on top and the specific rule below never applies. Fix = move it higher.' },
    { q:'Why is an "<b>any → any</b>" rule dangerous?',
      opts:['it permits all traffic, including what you never meant to allow','it\'s very slow because the firewall must evaluate it each time','it blocks even perfectly legitimate traffic you’d actually want to allow'],
      correct:0, why:'An over-broad rule opens more than you need. Rules should be as narrow as possible – exact source, destination, protocol, port (least privilege).' },
    { q:'What risk does a <b>forgotten "temporary"</b> rule pose?',
      opts:['it stays an open hole an attacker will eventually find','it needlessly slows the firewall on every rule evaluation','over time it deletes the other surrounding rules in the list by itself'],
      correct:0, why:'A temporary permit (e.g. RDP for a vendor) that’s forgotten is a permanent hole. Hence expiry dates and regular clean-up.' },
    { q:'What does a <b>rule audit</b> do?',
      opts:['regularly finds and fixes shadowed, over-broad and forgotten rules','it regularly backs up the whole firewall config to a remote backup server','it automatically adds new rules based on the current network traffic'],
      correct:0, why:'An audit keeps the list narrow and meaningful: fixes the order of shadowed rules, narrows over-broad ones and deletes unused ones.' }
  ]},
  c5q_l6:{ title:'Quiz: VPN', qs:[
    { q:'What is a <b>VPN</b> for?',
      opts:['to securely connect a remote user/network inside via an encrypted tunnel','to speed up the internet by cleverly bundling several WAN links into one','to replace the corporate firewall, since encrypted traffic no longer needs filtering'],
      correct:0, why:'A VPN builds an encrypted tunnel across the internet and "carries" a verified user inside – without exposing servers to the whole internet.' },
    { q:'What does a VPN tunnel do to the data crossing the internet?',
      opts:['encrypts it – eavesdropping en route gains nothing useful','it speeds it up a lot thanks to a shorter, more direct route','after reading it deletes it on the other side for safety'],
      correct:0, why:'The tunnel contents are encrypted, so even if intercepted en route, only unreadable data is seen.' },
    { q:'What’s the difference between <b>remote-access</b> and <b>site-to-site</b> VPN?',
      opts:['remote-access = one user; site-to-site = a permanent tunnel between two networks','remote-access is always faster because only one single person is using it at a time','they’re exactly the same thing, differing only in name and vendor brand'],
      correct:0, why:'Remote-access connects an individual (home office) with a client; site-to-site joins whole locations (HQ ↔ branch) by a tunnel between firewalls.' },
    { q:'Where does a VPN tunnel <b>end</b> and what happens to it there?',
      opts:['at the firewall – it verifies the login and puts traffic into the VPN zone (higher trust)','at the DNS server, which first resolves the target\'s name and only then forwards the traffic on','nowhere really – traffic from the tunnel goes straight out to the open internet'],
      correct:0, why:'The tunnel unwraps at the firewall, which verifies the user and places them in the VPN zone. If the interface is wrongly in the outside zone, the logged-in user is blocked.' }
  ]},
  c5q_l7:{ title:'Quiz: The whole path', qs:[
    { q:'How do <b>VLANs</b> and a <b>firewall</b> work together in a secure network?',
      opts:['the firewall guards the boundary (zones), VLANs separate traffic inside – defense in depth','they do the same thing in the network, so deploying just one of them is enough','VLANs replace the firewall, so there’s no need to add one'],
      correct:0, why:'The firewall handles the boundary (internet/DMZ/inside), VLAN segmentation handles separation inside. Together an attacker must break several independent layers.' },
    { q:'An attacker takes over the DMZ web and tries to reach the internal database. What stops them?',
      opts:['the firewall (DMZ→inside deny) and segmentation (DB in its own VLAN with an ACL)','nothing, because the DMZ usually has full default access to the internal network','only an antivirus program installed on the database server itself'],
      correct:0, why:'Two layers at once: the firewall blocks DMZ → inside, and even then the DB is in its own VLAN with an ACL. Layered defense in practice.' },
    { q:'Why is a network with a <b>single firewall</b> a risk (and what does the redundancy and STP course address)?',
      opts:['it’s a single point of failure – if it dies, all is offline; the fix is redundancy/HA','a single firewall is simply too slow and easily overloaded under heavier traffic','one firewall needs needlessly many public IP addresses to operate'],
      correct:0, why:'One firewall = a single point of failure. If it dies, the company is offline (and possibly unprotected). Redundancy and high availability are the subject of the redundancy and STP course.' }
  ]}
};
const COURSE_5_FINAL_EXTRA_DEF=[{ q:'Someone from the internet wants your internal server, but no rule allows it. What does the firewall do?', opts:['it blocks it – it falls to the default "deny all" (implicit deny)','it allows it automatically, since no rule explicitly denied it','it lets it inside but just keeps a log record of it'], correct:0, why:'Rules are read top-down; whatever matches no allow falls to the hidden "deny all" at the end. So you get nowhere inbound without an explicit rule.' },{ q:'You open a website (outbound). The server’s reply comes back in, though there’s no inbound rule for it. Why?', opts:['the stateful firewall remembers your connection and lets the reply back itself','you’d have to manually allow all the inbound traffic from the whole internet','otherwise the web couldn’t actually work at all'], correct:0, why:'A stateful firewall keeps a table of active connections. It recognizes the reply to what you requested and lets it in automatically – no inbound rule needed.' },{ q:'Above a specific rule you have a broader "allow all". What does that do to the specific rule?', opts:['it shadows it – through the broader rule above, the firewall never reaches it','on the contrary it speeds it up, since it’s now evaluated a bit earlier','the two rules merge in the firewall’s memory into one stronger combined whole'], correct:0, why:'A firewall takes the first matching rule from the top. A broader "allow all" matches first, so the specific rule below is never reached – shadowed and silently ineffective.' }];
__regCourse(5,COURSE_5_DEF,COURSE_5_QUIZZES_DEF,COURSE_5_FINAL_EXTRA_DEF);
