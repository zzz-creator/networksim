/* course4.js — Course 4 content (split out of course.js; loaded on demand via course-core.js) */
/* ============================================================
   COURSE 4 — Routing and IP addresses (problem-first; sim icons)
   ============================================================ */
// L1M1 — A packet at the crossroads
function renderC4Crossroads(){
  const svg='<svg id="c4asvg" viewBox="0 0 640 210" width="100%" style="display:block">'
    +'<line x1="80" y1="105" x2="218" y2="105" style="stroke:var(--green);stroke-width:1.6"/>'
    +'<line x1="258" y1="98" x2="444" y2="50" style="stroke:var(--line2);stroke-width:1.5"/><line x1="262" y1="105" x2="444" y2="105" style="stroke:var(--line2);stroke-width:1.5"/><line x1="258" y1="112" x2="444" y2="160" style="stroke:var(--line2);stroke-width:1.5"/>'
    +'<g id="c4aglow"></g>'
    +csHost(64,105,'desktop','--green','PC')+csDev(240,105,'router','R1')+csDev(460,44,'router','R2')+csDev(460,105,'internet','INTERNET')+csDev(460,166,'router','R3')
    +'<g id="c4adyn"></g></svg>';
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'In the previous course traffic stayed inside the company. Now the <b>PC</b> wants to send data to a <b>remote network</b> – somewhere across the internet, through several routers. The first stop is <b>R1</b>, and it stands at a <b>crossroads</b>: three paths lead out of it (to R2, to R3 and to the internet). How does R1 know <b>which</b> one to send the packet down? Trying them all is not an option.'+'</p>'
    +'<div class="osi-stage">'+svg+'</div>'
    +'<div class="m1-cap" id="c4acap"></div>'
    +courseStepControls('c4a')
    +abbrBox([['router','a device that forwards packets between networks (L3) by destination IP.'],['next hop','the next router on the path, where this router sends the packet.']]);
}
function mountC4Crossroads(){
  const exits='<line x1="258" y1="98" x2="444" y2="50" style="stroke:var(--cyan);stroke-width:2.6;opacity:.6"/><line x1="262" y1="105" x2="444" y2="105" style="stroke:var(--cyan);stroke-width:2.6;opacity:.6"/><line x1="258" y1="112" x2="444" y2="160" style="stroke:var(--cyan);stroke-width:2.6;opacity:.6"/><text x="350" y="150" text-anchor="middle" style="font:700 8px var(--sans);fill:var(--cyan)">'+esc('which way?')+'</text>';
  const STEPS=[
    {glow:csGlow(64,105,'--green')+csGlow(240,105,'--cyan',22), dyn:csPkt('M84 105 L220 105','--green'), cap:'The PC sends a packet with a <b>destination IP</b> somewhere far away. It reaches <b>R1</b> – the first router on the path.'},
    {glow:csGlow(240,105,'--cyan',22)+csGlow(460,44,'--cyan',20)+csGlow(460,105,'--cyan',20)+csGlow(460,166,'--cyan',20), dyn:exits, cap:'R1 is a <b>crossroads</b>: three possible ways out. But the packet belongs on only <b>one</b> of them. Which?'},
    {glow:csGlow(240,105,'--green',22), dyn:'', cap:'The router can’t guess blindly. It needs a <b>map</b> – a list of "to reach this network, go this way." That map is the <b>routing table</b> (next modules). Without it the packet goes nowhere.'}
  ];
  function show(i){const g=$('c4aglow');if(g)g.innerHTML=STEPS[i].glow||'';const d=$('c4adyn');if(d)d.innerHTML=STEPS[i].dyn||'';const c=$('c4acap');if(c)c.innerHTML='<span>'+STEPS[i].cap+'</span>';}
  courseStepper('c4a',STEPS.length,show);
}
// L1M2 — The router as a junction (signs = next hop by destination network)
function renderC4RouterJunction(){
  const svg='<svg id="c4bsvg" viewBox="0 0 640 210" width="100%" style="display:block">'
    +'<line x1="80" y1="105" x2="218" y2="105" style="stroke:var(--green);stroke-width:1.6"/>'
    +'<line x1="258" y1="98" x2="444" y2="50" style="stroke:var(--line2);stroke-width:1.5"/><line x1="262" y1="105" x2="444" y2="105" style="stroke:var(--line2);stroke-width:1.5"/><line x1="258" y1="112" x2="444" y2="160" style="stroke:var(--line2);stroke-width:1.5"/>'
    +'<text x="372" y="42" style="font:700 7px var(--mono);fill:var(--blue)">10.2.0.0/16</text><text x="360" y="98" style="font:700 7px var(--mono);fill:var(--muted)">0.0.0.0/0</text><text x="372" y="180" style="font:700 7px var(--mono);fill:var(--amber)">10.3.0.0/16</text>'
    +'<g id="c4bglow"></g>'
    +csHost(64,105,'desktop','--green','PC')+csDev(240,105,'router','R1')+csDev(460,44,'router','R2')+csDev(460,105,'internet','INTERNET')+csDev(460,166,'router','R3')
    +'<g id="c4bdyn"></g></svg>';
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'Each path out of the router leads to a different <b>network</b> – like <b>signs</b> at a junction: "left for 10.2.0.0/16", "right for 10.3.0.0/16", "straight on for everything else to the internet". The router looks at the packet’s <b>destination IP</b>, finds the <b>matching sign</b> and sends the packet that way (to the so-called <b>next hop</b>). Follow one packet.'+'</p>'
    +'<div class="osi-stage">'+svg+'</div>'
    +'<div class="m1-cap" id="c4bcap"></div>'
    +courseStepControls('c4b')
    +abbrBox([['destination network','which network an IP belongs to (e.g. 10.3.5.20 → network 10.3.0.0/16).'],['next hop','the neighbor (router) the packet is handed to as the next step toward the destination.']]);
}
function mountC4RouterJunction(){
  const probe='<text x="150" y="92" text-anchor="middle" style="font:700 8px var(--mono);fill:var(--green)">'+esc('dest 10.3.5.20')+'</text>';
  const STEPS=[
    {glow:csGlow(460,44,'--blue',20)+csGlow(460,105,'--muted',20)+csGlow(460,166,'--amber',20), dyn:'', cap:'Three signs: <b>10.2.0.0/16</b> via R2, <b>10.3.0.0/16</b> via R3, and <b>0.0.0.0/0</b> (everything else) to the internet.'},
    {glow:csGlow(64,105,'--green')+csGlow(240,105,'--cyan',22), dyn:csPkt('M84 105 L220 105','--green')+probe, cap:'A packet arrives for <b>10.3.5.20</b>. R1 asks: which network does this address belong to?'},
    {glow:csGlow(240,105,'--amber',22)+csGlow(460,166,'--amber',20), dyn:'<line x1="258" y1="112" x2="444" y2="160" style="stroke:var(--amber);stroke-width:2.8;opacity:.7"/>'+csPkt('M260 112 L440 160','--amber'), cap:'<b>10.3.5.20</b> belongs to <b>10.3.0.0/16</b> → the sign points to <b>R3</b>. R1 sends the packet that way.'},
    {glow:csGlow(240,105,'--green',22), dyn:'', cap:'The router does this for <b>every</b> packet: destination IP → matching network → next hop. Where it keeps those signs is the <b>routing table</b> – the next module.'}
  ];
  function show(i){const g=$('c4bglow');if(g)g.innerHTML=STEPS[i].glow||'';const d=$('c4bdyn');if(d)d.innerHTML=STEPS[i].dyn||'';const c=$('c4bcap');if(c)c.innerHTML='<span>'+STEPS[i].cap+'</span>';}
  courseStepper('c4b',STEPS.length,show);
}
// L1M3 — The routing table (rows + longest-prefix match)
function renderC4RoutingTable(){
  const row=(y,net,nh,iface,c)=>'<g><rect id="c4crow'+y+'" x="60" y="'+(y-15)+'" width="520" height="28" rx="5" style="fill:var('+c+');fill-opacity:0;stroke:var('+c+');stroke-width:1.1;stroke-opacity:.4"/><text x="76" y="'+(y+4)+'" style="font:700 9.5px var(--mono);fill:var('+c+')">'+net+'</text><text x="280" y="'+(y+4)+'" style="font:600 9.5px var(--mono);fill:var(--txt)">'+nh+'</text><text x="470" y="'+(y+4)+'" style="font:600 9px var(--mono);fill:var('+c+')">'+iface+'</text></g>';
  const svg='<svg id="c4csvg" viewBox="0 0 640 176" width="100%" style="display:block">'
    +'<text x="76" y="26" style="font:700 8.5px var(--sans);fill:var(--muted)">'+'R1 routing table'+'</text>'
    +'<text x="76" y="46" style="font:700 7px var(--sans);fill:var(--muted)">'+'DESTINATION'+'</text><text x="280" y="46" style="font:700 7px var(--sans);fill:var(--muted)">NEXT HOP</text><text x="470" y="46" style="font:700 7px var(--sans);fill:var(--muted)">'+'IFACE'+'</text>'
    +row(74,'10.2.0.0/16','R2','g0/1','--blue')
    +row(106,'10.3.0.0/16','R3','g0/2','--amber')
    +row(138,'0.0.0.0/0 ('+'default'+')','Internet','g0/0','--muted')
    +'<g id="c4cdyn"></g></svg>';
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'The router keeps those signs in a <b>routing table</b>. Each row says: <b>destination network → next hop → out which interface</b>. The last row <b>0.0.0.0/0</b> is the <b>default route</b> – "anything that doesn’t match elsewhere, send here" (usually to the internet). If a packet matches <b>several rows</b>, the <b>most specific</b> one wins (the longest mask) – this is <b>longest-prefix match</b>.'+'</p>'
    +'<div class="osi-stage">'+svg+'</div>'
    +'<div class="m1-cap" id="c4ccap"></div>'
    +courseStepControls('c4c')
    +abbrBox([['default route','0.0.0.0/0 – catches all traffic that doesn’t match a more specific row (usually out to the internet).'],['longest-prefix match','when several rows match, the one with the longest (most specific) mask wins.']]);
}
function mountC4RoutingTable(){
  const hi=(y)=>{[74,106,138].forEach(function(r){var el=$('c4crow'+r);if(el)el.style.fillOpacity=(r===y)?'0.16':'0';});};
  const note=(t,c)=>'<text x="76" y="162" style="font:700 8.5px var(--sans);fill:var('+c+')">'+esc(t)+'</text>';
  const STEPS=[
    {hl:0, dyn:'', cap:'Three rows: two specific networks (via R2 and R3) and a <b>default route</b> 0.0.0.0/0 to the internet for everything else.'},
    {hl:106, dyn:note('dest 10.3.5.20 → matches 10.3.0.0/16 and 0.0.0.0/0','--amber'), cap:'A packet to <b>10.3.5.20</b> matches <b>two</b> rows: the specific 10.3.0.0/16 <b>and</b> the default 0.0.0.0/0. Now what?'},
    {hl:106, dyn:note('→ /16 wins (more specific) → next hop R3','--green'), cap:'<b>Longest-prefix match</b>: the <b>longest mask</b> /16 wins (more specific than /0). The packet goes to <b>R3</b>. The default route is used only when nothing more specific matches.'},
    {hl:138, dyn:note('dest 198.51.100.9 → matches nothing specific → default route','--muted'), cap:'And a packet to, say, <b>198.51.100.9</b>? It matches no specific network → the <b>default route</b> is used and it goes to the internet. That’s how a router serves the whole world with a few rows.'}
  ];
  function show(i){hi(STEPS[i].hl);const d=$('c4cdyn');if(d)d.innerHTML=STEPS[i].dyn||'';const c=$('c4ccap');if(c)c.innerHTML='<span>'+STEPS[i].cap+'</span>';}
  courseStepper('c4c',STEPS.length,show);
}
// L2M1 — You cannot know the whole world
function renderC4DefaultWhy(){
  const rowT=(y,t,c)=>'<text x="232" y="'+y+'" style="font:600 9.5px var(--mono);fill:var('+c+')">'+esc(t)+'</text>';
  const svg='<svg id="c4dsvg" viewBox="0 0 640 200" width="100%" style="display:block">'
    +'<rect x="212" y="30" width="396" height="150" rx="9" style="fill:var(--panel);stroke:var(--line2);stroke-width:1.3"/>'
    +'<text x="232" y="52" style="font:700 8.5px var(--sans);fill:var(--muted)">'+'R1 routing table — what to know?'+'</text>'
    +rowT(78,'10.0.0.0/8 → '+'local','--green')
    +rowT(100,'192.168.1.0/24 → '+'local','--green')
    +'<g id="c4ddyn"></g>'
    +'<g id="c4dglow"></g>'
    +csDev(110,104,'router','R1')
    +'</svg>';
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'A router knows its <b>local networks</b> – for those it has a row and knows the way. But the internet has <b>nearly a million networks</b>. A row for <b>each</b> of them? Impossible: huge memory, unmanageable upkeep, and new ones keep appearing. A router simply <b>can’t know the whole world</b>. It needs a clever shortcut.'+'</p>'
    +'<div class="osi-stage">'+svg+'</div>'
    +'<div class="m1-cap" id="c4dcap"></div>'
    +courseStepControls('c4d')
    +abbrBox([['local network','a network directly attached to the router – it knows it and has a row for it.'],['default route','0.0.0.0/0 – one row "send everything else here", instead of a million rows.']]);
}
function mountC4DefaultWhy(){
  const rowT=(y,t,c)=>'<text x="232" y="'+y+'" style="font:600 9.5px var(--mono);fill:var('+c+')">'+esc(t)+'</text>';
  const STEPS=[
    {glow:csGlow(110,104,'--green',22), dyn:'', cap:'R1 has rows for its <b>local networks</b> (10.0.0.0/8, 192.168.1.0/24). It knows them and the way to them.'},
    {glow:csGlow(110,104,'--red',22), dyn:rowT(128,'+ ~900 000 '+'internet networks'+' → ?!','--red'), cap:'But what about the <b>rest of the internet</b>? Nearly a million networks. The router <b>can’t have rows</b> for them – memory and upkeep won’t bear it.'},
    {glow:csGlow(110,104,'--cyan',22), dyn:rowT(128,'+ ~900 000 '+'internet networks'+' → ?!','--red')+rowT(154,'0.0.0.0/0 → '+'provider (everything else)','--cyan'), cap:'The shortcut: <b>one row</b> "<b>0.0.0.0/0</b> = send everything else to the provider". That’s the <b>default route</b> – next module.'}
  ];
  function show(i){const g=$('c4dglow');if(g)g.innerHTML=STEPS[i].glow||'';const d=$('c4ddyn');if(d)d.innerHTML=STEPS[i].dyn||'';const c=$('c4dcap');if(c)c.innerHTML='<span>'+STEPS[i].cap+'</span>';}
  courseStepper('c4d',STEPS.length,show);
}
// L2M2 — The default route = the way out (gateway of last resort)
function renderC4DefaultRoute(){
  const svg='<svg id="c4esvg" viewBox="0 0 640 200" width="100%" style="display:block">'
    +'<line x1="83.7" y1="63.3" x2="280.3" y2="96.7" style="stroke:var(--green);stroke-width:1.5"/><line x1="83.6" y1="145.9" x2="280.4" y2="104.1" style="stroke:var(--blue);stroke-width:1.5"/>'
    +'<line x1="320" y1="100" x2="520" y2="100" style="stroke:var(--line2);stroke-width:1.6"/>'
    +'<g id="c4eglow"></g>'
    +csHost(64,60,'desktop','--green','LAN A')+csHost(64,150,'desktop','--blue','LAN B')+csDev(300,100,'router','R1')+csDev(540,100,'internet','ISP')
    +'<g id="c4edyn"></g></svg>';
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'The <b>default route</b> is the row <b>0.0.0.0/0</b>: "anything that doesn’t match a specific network, send here". It usually leads to the <b>provider</b> (ISP) – out to the internet. It’s also called the <b>gateway of last resort</b>. Thanks to it a router serves the whole internet while knowing only its few networks + one default route.'+'</p>'
    +'<div class="osi-stage">'+svg+'</div>'
    +'<div class="m1-cap" id="c4ecap"></div>'
    +courseStepControls('c4e')
    +abbrBox([['LAN','Local Area Network – a local network (one site/branch); here LAN A and LAN B are the router’s two local networks. You know the term from the How networks work course.'],['default route','0.0.0.0/0 → where to send traffic that matches no more specific row.'],['gateway of last resort','another name for the default route – the "last resort" when nothing else matches.']]);
}
function mountC4DefaultRoute(){
  const STEPS=[
    {glow:csGlow(64,60,'--green')+csGlow(64,150,'--blue')+csGlow(300,100,'--cyan',22), dyn:'<text x="322" y="150" text-anchor="middle" style="font:700 7.5px var(--mono);fill:var(--green)">10.0.0.0/24 → LAN A</text><text x="300" y="164" text-anchor="middle" style="font:700 7.5px var(--mono);fill:var(--blue)">10.0.1.0/24 → LAN B</text>', cap:'R1 knows its <b>local networks</b> LAN A and LAN B – it has specific rows for them in its table.'},
    {glow:csGlow(300,100,'--amber',22), dyn:'<text x="300" y="150" text-anchor="middle" style="font:700 8px var(--mono);fill:var(--amber)">'+esc('dest 198.51.100.x – unknown network')+'</text>', cap:'A packet arrives for an <b>unknown network</b> (somewhere on the internet). <b>No specific row matches.</b> What now?'},
    {glow:csGlow(300,100,'--cyan',22)+csGlow(540,100,'--cyan',22), dyn:'<line x1="320" y1="100" x2="520" y2="100" style="stroke:var(--cyan);stroke-width:2.8;opacity:.7"/>'+csPkt('M320 100 L520 100','--cyan')+'<text x="419" y="86" text-anchor="middle" style="font:700 7.5px var(--mono);fill:var(--cyan)">0.0.0.0/0</text>', cap:'The <b>default route</b> kicks in → the packet goes to the <b>provider</b>. R1 needn’t know where exactly that website is – just "send it upstream".'},
    {glow:csGlow(540,100,'--cyan',22), dyn:'<line x1="566" y1="100" x2="618" y2="100" style="stroke:var(--cyan);stroke-width:1.6;stroke-dasharray:4 4"/>'+csPkt('M566 100 L618 100','--cyan')+'<text x="592" y="86" text-anchor="middle" style="font:700 7.5px var(--mono);fill:var(--cyan)">0.0.0.0/0 →</text><text x="592" y="120" text-anchor="middle" style="font:700 7.5px var(--mono);fill:var(--cyan)">'+esc('next ISP')+'</text>', cap:'And the ISP has its own default route even higher up. A <b>chain of default routes</b> carries the packet anywhere in the world – and almost nobody needs to know the whole internet. The chain only ends at the <b>backbone routers</b>, which do hold the full internet table (via the BGP protocol). Elegant.'}
  ];
  function show(i){const g=$('c4eglow');if(g)g.innerHTML=STEPS[i].glow||'';const d=$('c4edyn');if(d)d.innerHTML=STEPS[i].dyn||'';const c=$('c4ecap');if(c)c.innerHTML='<span>'+STEPS[i].cap+'</span>';}
  courseStepper('c4e',STEPS.length,show);
}
// L2M3 — The default gateway at your home
function renderC4DefaultGw(){
  const svg='<svg id="c4fsvg" viewBox="0 0 640 180" width="100%" style="display:block">'
    +'<line x1="84" y1="90" x2="280" y2="90" style="stroke:var(--green);stroke-width:1.6"/><line x1="320" y1="90" x2="520" y2="90" style="stroke:var(--line2);stroke-width:1.6"/>'
    +'<text x="170" y="78" text-anchor="middle" style="font:700 7px var(--mono);fill:var(--green)">'+'local net'+'</text>'
    +'<g id="c4fglow"></g>'
    +csHost(64,90,'desktop','--green','PC')+csDev(300,90,'router',''+'home router')+csDev(540,90,'internet','INTERNET')
    +'<text x="300" y="142" text-anchor="middle" style="font:700 7px var(--mono);fill:var(--cyan)">'+'default gateway = 192.168.1.1'+'</text>'
    +'<g id="c4fdyn"></g></svg>';
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'You have the same principle <b>at home on your PC</b>. Your computer knows only <b>its local network</b> (say 192.168.1.0/24). Everything else – the whole internet – it sends to its <b>default gateway</b>, which is the <b>router’s IP</b> (e.g. 192.168.1.1). The PC doesn’t work out the way to that website; it just hands it to the router, which takes it from there. <b>The default gateway is the default route seen from an end device.</b>'+'</p>'
    +'<div class="osi-stage">'+svg+'</div>'
    +'<div class="m1-cap" id="c4fcap"></div>'
    +courseStepControls('c4f')
    +abbrBox([['default gateway','the router IP a PC sends all off-local traffic to. The default route from a host’s point of view.']]);
}
function mountC4DefaultGw(){
  const STEPS=[
    {glow:csGlow(64,90,'--green'), dyn:'', cap:'Your <b>PC</b> knows only its <b>local network</b> (192.168.1.0/24). It doesn’t know the internet at all.'},
    {glow:csGlow(64,90,'--green')+csGlow(300,90,'--cyan',22), dyn:csPkt('M84 90 L280 90','--green')+'<text x="170" y="116" text-anchor="middle" style="font:700 7.5px var(--sans);fill:var(--cyan)">'+esc('unknown dest → default gateway')+'</text>', cap:'You open a website in another network. The PC doesn’t know the way → it sends it to its <b>default gateway</b> = its <b>router</b> (192.168.1.1).'},
    {glow:csGlow(300,90,'--cyan',22)+csGlow(540,90,'--cyan',22), dyn:csPkt('M320 90 L520 90','--cyan'), cap:'The router does <b>the same</b>: by its default route it sends it to the provider and on into the internet. Everyone sends "the unknown one level up".'},
    {glow:csGlow(64,90,'--green')+csGlow(300,90,'--cyan',22), dyn:'', cap:'So a <b>default gateway on a host</b> = a <b>default route on a router</b> – the same idea at every level. That’s why you set a "gateway" on a PC: it’s the door out.'}
  ];
  function show(i){const g=$('c4fglow');if(g)g.innerHTML=STEPS[i].glow||'';const d=$('c4fdyn');if(d)d.innerHTML=STEPS[i].dyn||'';const c=$('c4fcap');if(c)c.innerHTML='<span>'+STEPS[i].cap+'</span>';}
  courseStepper('c4f',STEPS.length,show);
}
// L3M1 — When a static route (hand-written)
function renderC4StaticWhy(){
  const svg='<svg id="c4gsvg" viewBox="0 0 640 188" width="100%" style="display:block">'
    +'<line x1="80" y1="112" x2="205" y2="112" style="stroke:var(--green);stroke-width:1.6"/><line x1="235" y1="112" x2="405" y2="112" style="stroke:var(--line2);stroke-width:1.6"/><line x1="435" y1="112" x2="560" y2="112" style="stroke:var(--blue);stroke-width:1.6"/>'
    +'<g id="c4gglow"></g>'
    +csHost(64,112,'desktop','--green','LAN A')+csDev(220,112,'router','R1')+csDev(420,112,'router','R2')+csHost(576,112,'desktop','--blue','LAN B')
    +'<text x="576" y="160" text-anchor="middle" style="font:600 7px var(--mono);fill:var(--blue)">10.0.2.0/24</text>'
    +'<g id="c4gdyn"></g></svg>';
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'A router automatically knows only the networks it is <b>directly connected</b> to. Here R1 knows <b>LAN A</b> and the link to R2 – but it <b>doesn’t know LAN B behind R2</b>, nobody told it. When there are few networks, the simplest fix is to <b>write the route by hand</b>: "to reach 10.0.2.0/24, go via R2". This is a <b>static route</b> – a fixed row the admin enters.'+'</p>'
    +'<div class="osi-stage">'+svg+'</div>'
    +'<div class="m1-cap" id="c4gcap"></div>'
    +courseStepControls('c4g')
    +abbrBox([['static route','a route entered manually by the admin (destination → next hop); it doesn’t change on its own.'],['directly connected','a network the router is directly attached to – known automatically, without configuration.'],['LAN','Local Area Network – a local network; LAN A and LAN B are two local networks (each behind its router).']]);
}
function mountC4StaticWhy(){
  const chip=(t,c)=>'<g><rect x="146" y="44" width="148" height="20" rx="5" style="fill:var('+c+');fill-opacity:.13;stroke:var('+c+');stroke-width:1.1"/><text x="220" y="58" text-anchor="middle" style="font:700 8px var(--mono);fill:var('+c+')">'+esc(t)+'</text></g>';
  const STEPS=[
    {glow:csGlow(220,112,'--cyan',22), dyn:chip('LAN A ✓  ·  LAN B ✗','--muted'), cap:'R1 knows <b>LAN A</b> (directly) and the link to R2. But <b>LAN B</b> (10.0.2.0/24) behind R2 is <b>not in its table</b>.'},
    {glow:csGlow(64,112,'--green')+csGlow(220,112,'--red',22), dyn:csPkt('M84 112 L200 112','--green')+'<text x="245" y="86" text-anchor="middle" style="font:800 18px var(--mono);fill:var(--red)">✕</text>', cap:'A PC in LAN A wants LAN B. The packet reaches R1 – which <b>has no idea where next</b>. <b>Dropped</b> (no route).'},
    {glow:csGlow(220,112,'--cyan',22), dyn:chip('+ static: 10.0.2.0/24 → R2','--green'), cap:'The admin <b>manually adds a static route</b>: "to 10.0.2.0/24 go via R2". Now R1 knows the way.'},
    {glow:csGlow(64,112,'--green')+csGlow(220,112,'--green',22)+csGlow(420,112,'--green',22)+csGlow(576,112,'--blue'), dyn:csPkt('M84 112 L200 112','--green')+csPkt('M240 112 L400 112','--cyan')+csPkt('M440 112 L556 112','--blue'), cap:'And the packet <b>gets through</b>: LAN A → R1 → R2 → LAN B. A static route is simple and reliable – when there are few networks.'}
  ];
  function show(i){const g=$('c4gglow');if(g)g.innerHTML=STEPS[i].glow||'';const d=$('c4gdyn');if(d)d.innerHTML=STEPS[i].dyn||'';const c=$('c4gcap');if(c)c.innerHTML='<span>'+STEPS[i].cap+'</span>';}
  courseStepper('c4g',STEPS.length,show);
}
// L3M2 — What a static route looks like (anatomy)
function renderC4StaticHow(){
  const box=(x,w,t,c)=>'<g><rect x="'+x+'" y="64" width="'+w+'" height="30" rx="6" style="fill:var('+c+');fill-opacity:.12;stroke:var('+c+');stroke-width:1.3"/><text x="'+(x+w/2)+'" y="84" text-anchor="middle" style="font:700 11px var(--mono);fill:var('+c+')">'+esc(t)+'</text></g>';
  const lbl=(x,w,t,c)=>'<text x="'+(x+w/2)+'" y="116" text-anchor="middle" style="font:700 8px var(--sans);fill:var('+c+')">'+esc(t)+'</text>';
  const svg='<svg id="c4hsvg" viewBox="0 0 640 150" width="100%" style="display:block">'
    +'<text x="40" y="84" style="font:700 11px var(--mono);fill:var(--muted)">ip route</text>'
    +box(140,150,'10.0.2.0','--blue')+box(300,170,'255.255.255.0','--amber')+box(484,116,'10.0.0.2','--green')
    +'<g id="c4hglow"></g>'
    +lbl(140,150,'destination net','--blue')+lbl(300,170,'mask','--amber')+lbl(484,116,'next hop (R2)','--green')
    +'<g id="c4hdyn"></g></svg>';
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'What does such a static route actually <b>look like</b>? It has three key parts: the <b>destination network</b> (where you want to go), the <b>mask</b> (how big that network is) and the <b>next hop</b> (whom to hand the packet to next). E.g. "to network 10.0.2.0 with mask 255.255.255.0, go via neighbor 10.0.0.2 (R2)". Instead of a next hop you sometimes give an <b>exit interface</b>. Let’s light up the parts.'+'</p>'
    +'<div class="osi-stage">'+svg+'</div>'
    +'<div class="m1-cap" id="c4hcap"></div>'
    +courseStepControls('c4h')
    +abbrBox([['subnet mask','defines how big a network is (how many addresses) – e.g. /24 = 255.255.255.0; the prefix and mask are covered in detail in the ISO/OSI and TCP/IP course.'],['next hop','the neighbor IP the router hands the packet to as the next step.']]);
}
function mountC4StaticHow(){
  const ring=(x,w,c)=>'<rect x="'+(x-3)+'" y="61" width="'+(w+6)+'" height="36" rx="8" style="fill:none;stroke:var('+c+');stroke-width:2.2"/>';
  const STEPS=[
    {glow:'', cap:'A static route = a command with three parts. Let’s go through them.'},
    {glow:ring(140,150,'--blue'), cap:'<b>Destination network</b> – 10.0.2.0. "This route applies to packets heading into this network."'},
    {glow:ring(300,170,'--amber'), cap:'<b>Mask</b> – 255.255.255.0 (/24). It says <b>how big</b> the destination network is (which addresses belong to it).'},
    {glow:ring(484,116,'--green'), cap:'<b>Next hop</b> – 10.0.0.2 (R2). <b>Whom</b> to hand the packet to next. (Sometimes an exit interface is given instead.)'}
  ];
  function show(i){const g=$('c4hglow');if(g)g.innerHTML=STEPS[i].glow||'';const c=$('c4hcap');if(c)c.innerHTML='<span>'+STEPS[i].cap+'</span>';}
  courseStepper('c4h',STEPS.length,show);
}
// L3M3 — Floating static (backup route)
function renderC4FloatingStatic(){
  const svg='<svg id="c4isvg" viewBox="0 0 640 200" width="100%" style="display:block">'
    +'<line x1="139.5" y1="95.7" x2="310.5" y2="58.3" style="stroke:var(--line2);stroke-width:1.6"/><line x1="139.5" y1="104.6" x2="310.5" y2="145.4" style="stroke:var(--line2);stroke-width:1.6"/>'
    +'<line x1="349.6" y1="58" x2="536.4" y2="96" style="stroke:var(--line2);stroke-width:1.6"/><line x1="349.5" y1="145.7" x2="536.5" y2="104.3" style="stroke:var(--line2);stroke-width:1.6"/>'
    +'<g id="c4iglow"></g>'
    +csDev(120,100,'router','R1')+csDev(330,54,'router','R2')+csDev(330,150,'router','R3')+csHost(556,100,'desktop','--blue','LAN B')
    +'<text x="220" y="58" text-anchor="middle" style="font:700 7px var(--sans);fill:var(--green)">'+'primary'+'</text><text x="268" y="58" text-anchor="middle" style="font:700 7px var(--mono);fill:var(--green)">AD 1</text>'
    +'<text x="220" y="150" text-anchor="middle" style="font:700 7px var(--sans);fill:var(--muted)">'+'backup'+'</text><text x="268" y="150" text-anchor="middle" style="font:700 7px var(--mono);fill:var(--amber)">AD 5</text>'
    +'<g id="c4idyn"></g></svg>';
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'What if you want a <b>backup</b>? Two paths lead to LAN B: the <b>primary</b> via R2 and a <b>backup</b> via R3. You make two static routes to the same destination, but give the backup <b>worse trustworthiness</b> (a higher <b>administrative distance</b> – a number the router notes down with the route and uses to pick between several offers for the same destination: <b>the lower number wins</b>. It says nothing about the length or speed of the path, only who to trust first; you set it yourself. Detailed in the lesson The internet and who wins). The router then uses only the primary; the backup just "<b>floats</b>" in the background and <b>kicks in only when the primary fails</b>. This is a <b>floating static route</b>.'+'</p>'
    +'<div class="osi-stage">'+svg+'</div>'
    +'<div class="m1-cap" id="c4icap"></div>'
    +courseStepControls('c4i')
    +abbrBox([['floating static','a backup static route with a higher administrative distance – it activates only when the primary fails.'],['administrative distance','the trustworthiness of a route source (not a metric) – lower wins. You give the backup a higher one so it waits.']]);
}
function mountC4FloatingStatic(){
  const prim='<line x1="139.5" y1="95.7" x2="310.5" y2="58.3" style="stroke:var(--green);stroke-width:2.8;opacity:.7"/><line x1="349.6" y1="58" x2="536.4" y2="96" style="stroke:var(--green);stroke-width:2.8;opacity:.7"/>';
  const primPkt=csPkt('M140 92 L310.5 58.3','--green')+csPkt('M349.6 58 L536.4 96','--green');
  const back='<line x1="139.5" y1="104.6" x2="310.5" y2="145.4" style="stroke:var(--amber);stroke-width:2.8;opacity:.7"/><line x1="349.5" y1="145.7" x2="536.5" y2="104.3" style="stroke:var(--amber);stroke-width:2.8;opacity:.7"/>';
  const backPkt=csPkt('M140 108 L310.5 145.4','--amber')+csPkt('M349.5 145.7 L536.5 104.3','--amber');
  const STEPS=[
    {glow:csGlow(120,100,'--cyan',22)+csGlow(556,100,'--blue'), dyn:'', cap:'Two paths to LAN B: <b>primary via R2</b>, <b>backup via R3</b>. The backup has a <b>higher administrative distance</b> (AD 5 vs AD 1), so for now it <b>waits</b>.'},
    {glow:csGlow(120,100,'--green',22)+csGlow(330,54,'--green',20)+csGlow(556,100,'--blue'), dyn:prim+primPkt, cap:'Normally traffic flows the <b>primary path via R2</b>. The backup via R3 is unused – it just quietly "floats".'},
    {glow:csGlow(330,54,'--red',20), dyn:'<line x1="139.5" y1="95.7" x2="310.5" y2="58.3" style="stroke:var(--red);stroke-width:2;stroke-dasharray:5 5"/><text x="220" y="40" text-anchor="middle" style="font:800 16px var(--mono);fill:var(--red)">✕</text>', cap:'The link to <b>R2 fails</b>. The primary route drops from the table. Without a backup, LAN B would now be unreachable.'},
    {glow:csGlow(120,100,'--amber',22)+csGlow(330,150,'--amber',20)+csGlow(556,100,'--blue'), dyn:back+backPkt, cap:'The <b>floating static kicks in</b>: traffic switches to the <b>backup path via R3</b>. Redundancy without a dynamic protocol – manual, but it works.'}
  ];
  function show(i){const g=$('c4iglow');if(g)g.innerHTML=STEPS[i].glow||'';const d=$('c4idyn');if(d)d.innerHTML=STEPS[i].dyn||'';const c=$('c4icap');if(c)c.innerHTML='<span>'+STEPS[i].cap+'</span>';}
  courseStepper('c4i',STEPS.length,show);
}
// L3M4 — Where static falls short
function renderC4StaticLimit(){
  const svg='<svg id="c4jsvg" viewBox="0 0 640 200" width="100%" style="display:block">'
    +'<line x1="140" y1="70" x2="300" y2="70" style="stroke:var(--line2);stroke-width:1.5"/><line x1="120" y1="90" x2="120" y2="130" style="stroke:var(--line2);stroke-width:1.5"/><line x1="340" y1="70" x2="500" y2="70" style="stroke:var(--line2);stroke-width:1.5"/><line x1="320" y1="90" x2="320" y2="130" style="stroke:var(--line2);stroke-width:1.5"/><line x1="520" y1="90" x2="520" y2="130" style="stroke:var(--line2);stroke-width:1.5"/><line x1="140" y1="150" x2="300" y2="150" style="stroke:var(--line2);stroke-width:1.5"/><line x1="340" y1="150" x2="500" y2="150" style="stroke:var(--line2);stroke-width:1.5"/>'
    +'<g id="c4jglow"></g>'
    +csDev(120,70,'router','R1')+csDev(320,70,'router','R2')+csDev(520,70,'router','R3')+csDev(120,150,'router','R4')+csDev(320,150,'router','R5')+csDev(520,150,'router','R6')
    +'<g id="c4jdyn"></g></svg>';
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'Static routes are great while there are <b>few</b> networks. But imagine <b>dozens of routers</b> and hundreds of networks. You’d have to <b>write every route by hand</b> on every router – and rewrite it all on every change. And crucially: when a <b>link fails</b>, a static route <b>doesn’t notice</b> and happily sends packets into a dead end. That’s unmanageable. We need routers to <b>tell each other the routes</b> and <b>react to outages</b> – <b>dynamic routing</b>. Before we get there: in this lesson’s task you’ll <b>write a static route yourself</b> – router R1 has an empty table and you’ll fill in the missing route.'+'</p>'
    +'<div class="osi-stage">'+svg+'</div>'
    +'<div class="m1-cap" id="c4jcap"></div>'
    +courseStepControls('c4j')
    +abbrBox([['dynamic routing','routers exchange routes automatically via a protocol (e.g. OSPF) and react to changes on their own.'],['scaling','how a solution copes with growth – static is fine for few networks, not for a large one.']]);
}
function mountC4StaticLimit(){
  const allglow=csGlow(120,70,'--cyan',20)+csGlow(320,70,'--cyan',20)+csGlow(520,70,'--cyan',20)+csGlow(120,150,'--cyan',20)+csGlow(320,150,'--cyan',20)+csGlow(520,150,'--cyan',20);
  const STEPS=[
    {glow:csGlow(120,70,'--green',20)+csGlow(320,70,'--green',20), dyn:'', cap:'With <b>two or three routers</b> writing routes by hand is fine. A few lines and done.'},
    {glow:allglow, dyn:'<text x="320" y="197" text-anchor="middle" style="font:700 8px var(--sans);fill:var(--amber)">'+esc('6 routers → dozens of routes by hand on each')+'</text>', cap:'But like this? <b>Every router</b> must know a route to <b>every network</b> – that’s <b>a lot of lines by hand</b>, rewritten on every change. Unmanageable.'},
    {glow:csGlow(320,70,'--red',20)+csGlow(520,70,'--red',20), dyn:'<line x1="340" y1="70" x2="500" y2="70" style="stroke:var(--red);stroke-width:2;stroke-dasharray:5 5"/><text x="420" y="58" text-anchor="middle" style="font:800 16px var(--mono);fill:var(--red)">✕</text><text x="420" y="190" text-anchor="middle" style="font:700 8px var(--sans);fill:var(--red)">'+esc('link fails → static doesn’t notice → black hole')+'</text>', cap:'And when a <b>link fails</b>, the static route <b>still points</b> at it – packets vanish into nothing. Nobody can fix that by hand in time.'},
    {glow:allglow, dyn:'<text x="320" y="197" text-anchor="middle" style="font:700 8px var(--sans);fill:var(--green)">'+esc('fix: let routers share routes themselves')+'</text>', cap:'The fix: <b>dynamic routing</b> – routers <b>share routes themselves</b> and <b>recompute</b> after an outage. How they actually talk is the next lesson (and then OSPF).'}
  ];
  function show(i){const g=$('c4jglow');if(g)g.innerHTML=STEPS[i].glow||'';const d=$('c4jdyn');if(d)d.innerHTML=STEPS[i].dyn||'';const c=$('c4jcap');if(c)c.innerHTML='<span>'+STEPS[i].cap+'</span>';}
  courseStepper('c4j',STEPS.length,show);
}
// L4M1 — Why NAT
function renderC4NatWhy(){
  const svg='<svg id="c4ksvg" viewBox="0 0 640 184" width="100%" style="display:block">'
    +'<line x1="84" y1="96" x2="280" y2="96" style="stroke:var(--green);stroke-width:1.6"/><line x1="320" y1="96" x2="520" y2="96" style="stroke:var(--line2);stroke-width:1.6"/>'
    +'<g id="c4kglow"></g>'
    +csHost(64,96,'desktop','--green','PC')+csDev(300,96,'router','R')+csDev(540,96,'internet','INTERNET')
    +'<text x="64" y="148" text-anchor="middle" style="font:700 7px var(--mono);fill:var(--green)">192.168.1.10</text><text x="300" y="148" text-anchor="middle" style="font:700 7px var(--mono);fill:var(--cyan)">'+'public 203.0.113.5'+'</text>'
    +'<g id="c4kdyn"></g></svg>';
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'IPv4 addresses are <b>scarce</b> – the registries have practically <b>handed out</b> the free blocks (around 2019–2020) and new ones are allocated only rarely, otherwise expensively resold. So almost every home and company uses <b>private addresses</b> (10.x, 192.168.x) that <b>must not be used on the internet</b> (they’re not routable). So how do you get out? The edge router does <b>NAT</b> (Network Address Translation): on the way out it <b>rewrites the private source address to its single public one</b>. The whole network thus appears outside under <b>one public IP</b>.'+'</p>'
    +'<div class="osi-stage">'+svg+'</div>'
    +'<div class="m1-cap" id="c4kcap"></div>'
    +courseStepControls('c4k')
    +abbrBox([['NAT','address translation – the router changes the private source IP to a public one (and back).'],['private address','10.x / 172.16–31.x / 192.168.x – valid only in the local network, not on the internet.']]);
}
function mountC4NatWhy(){
  const tag=(x,y,t,c)=>'<text x="'+x+'" y="'+y+'" text-anchor="middle" style="font:700 7.5px var(--mono);fill:var('+c+')">'+esc(t)+'</text>';
  const STEPS=[
    {glow:csGlow(64,96,'--green'), dyn:'', cap:'The PC has a <b>private</b> IP 192.168.1.10. It’s valid only at home – <b>invalid on the internet</b>.'},
    {glow:csGlow(64,96,'--green')+csGlow(300,96,'--cyan',22), dyn:csPkt('M84 96 L280 96','--green')+tag(170,82,'src 192.168.1.10','--green'), cap:'The PC sends a packet out with source <b>192.168.1.10</b>. A reply could never come back – that address "doesn’t exist" on the internet.'},
    {glow:csGlow(300,96,'--cyan',22)+csGlow(540,96,'--cyan',22), dyn:csPkt('M320 96 L520 96','--cyan')+tag(420,82,'src 203.0.113.5','--cyan'), cap:'The router does <b>NAT</b>: it rewrites the source to <b>its public IP 203.0.113.5</b>. Now it’s a valid address and the internet knows where to reply.'},
    {glow:csGlow(64,96,'--green')+csGlow(300,96,'--cyan',22)+csGlow(540,96,'--cyan',22), dyn:csPkt('M520 96 L320 96','--amber')+csPkt('M280 96 L84 96','--green')+tag(420,82,'→ 203.0.113.5','--amber'), cap:'The reply returns to <b>203.0.113.5</b>, the router <b>translates it back</b> to 192.168.1.10 and delivers it. <b>The whole LAN shares one public IP.</b>'}
  ];
  function show(i){const g=$('c4kglow');if(g)g.innerHTML=STEPS[i].glow||'';const d=$('c4kdyn');if(d)d.innerHTML=STEPS[i].dyn||'';const c=$('c4kcap');if(c)c.innerHTML='<span>'+STEPS[i].cap+'</span>';}
  courseStepper('c4k',STEPS.length,show);
}
// L4M2 — PAT (one public IP for everyone, distinguished by port)
function renderC4Pat(){
  const svg='<svg id="c4lsvg" viewBox="0 0 640 200" width="100%" style="display:block">'
    +'<line x1="83.7" y1="63.3" x2="280.3" y2="96.7" style="stroke:var(--green);stroke-width:1.5"/><line x1="83.6" y1="145.9" x2="280.4" y2="104.1" style="stroke:var(--blue);stroke-width:1.5"/><line x1="320" y1="100" x2="520" y2="100" style="stroke:var(--line2);stroke-width:1.6"/>'
    +'<g id="c4lglow"></g>'
    +csHost(64,60,'desktop','--green','PC1')+csHost(64,150,'desktop','--blue','PC2')+csDev(300,100,'router','R (PAT)')+csDev(540,100,'internet','INTERNET')
    +'<g id="c4ldyn"></g></svg>';
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'When the <b>whole network has just one public IP</b>, how does the router know who to return a reply to? It uses the <b>port</b> (the connection number, from the ISO/OSI and TCP/IP course). This enhanced NAT is called <b>PAT</b> (Port Address Translation, a.k.a. "NAT overload"). It assigns each outbound connection a <b>unique source port</b> and records in a <b>NAT table</b>: who (internal IP:port) = which public port. By the port it then <b>sorts replies back</b>. This is how one IP can hide hundreds of devices.'+'</p>'
    +'<div class="osi-stage">'+svg+'</div>'
    +'<div class="m1-cap" id="c4lcap"></div>'
    +courseStepControls('c4l')
    +abbrBox([['PAT','NAT with ports – many internal devices share one public IP, told apart by port.'],['NAT table','a record of who (internal IP:port) maps to which public port – so replies find their way back.']]);
}
function mountC4Pat(){
  const tag=(y,t,c)=>'<text x="320" y="'+y+'" text-anchor="middle" style="font:700 7px var(--mono);fill:var('+c+')">'+esc(t)+'</text>';
  const STEPS=[
    {glow:csGlow(64,60,'--green')+csGlow(64,150,'--blue')+csGlow(300,100,'--cyan',22), dyn:'', cap:'Two PCs, <b>one public IP</b> (203.0.113.5). When both go out, how does the router tell their replies apart?'},
    {glow:csGlow(64,60,'--green')+csGlow(300,100,'--cyan',22), dyn:csPkt('M84 60 L280.3 96.7','--green')+tag(176,'PC1 → 203.0.113.5:40001','--green'), cap:'PC1 goes out. The router translates to the public IP with <b>port 40001</b> and records it in the <b>NAT table</b>.'},
    {glow:csGlow(64,150,'--blue')+csGlow(300,100,'--cyan',22), dyn:csPkt('M84 150 L280.4 104.1','--blue')+tag(176,'PC2 → 203.0.113.5:40002','--blue'), cap:'PC2 goes out too – same public IP, but <b>port 40002</b>. They differ only by port.'},
    {glow:csGlow(64,60,'--green')+csGlow(64,150,'--blue')+csGlow(300,100,'--cyan',22)+csGlow(540,100,'--cyan',22), dyn:csPkt('M520 100 L320 100','--amber')+csPkt('M280.3 96.7 L83.7 63.3','--green')+csPkt('M280.4 104.1 L83.6 145.9','--blue')+tag(176,'port 40001 → PC1 · 40002 → PC2','--amber'), cap:'Replies come back to different ports. By the <b>port in the NAT table</b> the router knows whose they are and sorts them back. That’s <b>PAT</b>.'}
  ];
  function show(i){const g=$('c4lglow');if(g)g.innerHTML=STEPS[i].glow||'';const d=$('c4ldyn');if(d)d.innerHTML=STEPS[i].dyn||'';const c=$('c4lcap');if(c)c.innerHTML='<span>'+STEPS[i].cap+'</span>';}
  courseStepper('c4l',STEPS.length,show);
}
// L4M3 — Port forwarding (DNAT, inbound)
function renderC4PortForward(){
  const svg='<svg id="c4msvg" viewBox="0 0 640 184" width="100%" style="display:block">'
    +'<line x1="84" y1="96" x2="280" y2="96" style="stroke:var(--line2);stroke-width:1.6"/><line x1="320" y1="96" x2="520" y2="96" style="stroke:var(--amber);stroke-width:1.6"/>'
    +'<g id="c4mglow"></g>'
    +csDev(64,96,'internet','CLIENT')+csDev(300,96,'router','R')+csHost(540,96,'server','--amber','WEB')
    +'<text x="540" y="148" text-anchor="middle" style="font:700 7px var(--mono);fill:var(--amber)">192.168.1.20:443</text>'
    +'<g id="c4mdyn"></g></svg>';
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'Normally nobody outside can reach the inside. But mind <b>why</b>: not because addresses get translated, but because an <b>unsolicited</b> connection from outside has <b>no state record</b> in the table. What is that? When someone <b>inside</b> opens a connection outward, the router writes down a line about it ("this computer asked for this connection") and uses it to recognize the reply when it comes back. A packet arriving from outside on its own has no such line – the router doesn’t know who inside it would belong to, so it drops it. <b>What protects you is that connection table, not the address translation</b>: <b>NAT on its own is not a security feature</b>, "hiding" the network is a side effect. But what if you want your <b>own web or game server</b> reachable from the internet? The server is inside with a private IP. The fix is <b>port forwarding</b> (a.k.a. <b>DNAT</b>, Destination NAT – translating the <i>destination</i> address): on the router you say "incoming to <b>public IP:443</b>, send to <b>192.168.1.20:443</b>". The router then <b>redirects that specific incoming connection to the internal server</b>. (In the simulator you configure this directly on the router as well as the firewall.)'+'</p>'
    +'<div class="osi-stage">'+svg+'</div>'
    +'<div class="m1-cap" id="c4mcap"></div>'
    +courseStepControls('c4m')
    +abbrBox([['port forwarding','a rule "incoming to public IP:port → send to internal device:port" – exposes an internal server from outside.'],['DNAT','Destination NAT – translating the DESTINATION of inbound traffic (the opposite of normal source NAT).']]);
}
function mountC4PortForward(){
  const STEPS=[
    {glow:csGlow(540,96,'--amber'), dyn:'', cap:'The WEB server is <b>inside</b> with private IP 192.168.1.20. From the internet <b>nobody can reach it</b> – an unsolicited connection has no state record.'},
    {glow:csGlow(64,96,'--red')+csGlow(300,96,'--red',22), dyn:csPkt('M84 96 L280 96','--red')+'<text x="300" y="64" text-anchor="middle" style="font:800 18px var(--mono);fill:var(--red)">✕</text>', cap:'The client tries <b>public IP:443</b>. But the router doesn’t know who inside it’s for → it <b>drops it</b>. Without a rule you can’t get in.'},
    {glow:csGlow(300,96,'--cyan',22), dyn:'<text x="300" y="64" text-anchor="middle" style="font:700 7.5px var(--mono);fill:var(--cyan)">'+esc('+ rule :443 → 192.168.1.20:443')+'</text>', cap:'You add a <b>port-forward</b>: "incoming to public IP:443 → 192.168.1.20:443". Now the router knows where inside to send it.'},
    {glow:csGlow(64,96,'--green')+csGlow(300,96,'--cyan',22)+csGlow(540,96,'--amber'), dyn:csPkt('M84 96 L280 96','--green')+csPkt('M320 96 L520 96','--amber'), cap:'The client connects: the router <b>redirects (DNAT)</b> the incoming :443 to the internal WEB. The server is reachable from the internet; the rest of the network still can’t be reached unsolicited.'}
  ];
  function show(i){const g=$('c4mglow');if(g)g.innerHTML=STEPS[i].glow||'';const d=$('c4mdyn');if(d)d.innerHTML=STEPS[i].dyn||'';const c=$('c4mcap');if(c)c.innerHTML='<span>'+STEPS[i].cap+'</span>';}
  courseStepper('c4m',STEPS.length,show);
}
// L4M4 — Hairpin NAT (reaching your own public IP from inside)
function renderC4Hairpin(){
  const svg='<svg id="c4nsvg" viewBox="0 0 640 200" width="100%" style="display:block">'
    +'<line x1="83.6" y1="145.9" x2="280.4" y2="104.1" style="stroke:var(--green);stroke-width:1.5"/><line x1="83.7" y1="59.7" x2="280.3" y2="96.3" style="stroke:var(--amber);stroke-width:1.5"/><line x1="320" y1="100" x2="520" y2="100" style="stroke:var(--line2);stroke-width:1.4;stroke-dasharray:3 3"/>'
    +'<g id="c4nglow"></g>'
    +csHost(64,150,'desktop','--green','PC')+csHost(64,56,'server','--amber','WEB')+csDev(300,100,'router','R')+csDev(540,100,'internet','INTERNET')
    +'<g id="c4ndyn"></g></svg>';
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'One last trick. You have a <b>web server inside</b> that’s also reachable from outside (port forward) via a <b>public IP</b> / domain. What if a <b>PC on the same network</b> wants it, but via that <b>public</b> address (e.g. types the domain)? The traffic heads out toward the router (the gateway), the router sees that the public IP belongs to <b>its own internal server</b> and <b>turns the traffic back inside</b>. This "U-turn" is called <b>hairpin NAT</b> (NAT loopback).'+'</p>'
    +'<div class="osi-stage">'+svg+'</div>'
    +'<div class="m1-cap" id="c4ncap"></div>'
    +courseStepControls('c4n')
    +abbrBox([['hairpin NAT','reaching your own public IP from inside – the router "turns" the traffic back in (NAT loopback).']]);
}
function mountC4Hairpin(){
  const STEPS=[
    {glow:csGlow(64,150,'--green')+csGlow(64,56,'--amber'), dyn:'', cap:'The WEB server is inside and also has a <b>public address</b> (port forward). The PC is on the <b>same network</b>.'},
    {glow:csGlow(64,150,'--green')+csGlow(300,100,'--cyan',22), dyn:csPkt('M84 150 L280.4 104.1','--green')+'<text x="170" y="142" text-anchor="middle" style="font:700 7px var(--sans);fill:var(--green)">'+esc('dest = web’s public IP')+'</text>', cap:'The PC enters the server’s <b>public IP</b> (domain). As it’s not a local address, it sends it to the <b>gateway = router</b>.'},
    {glow:csGlow(300,100,'--cyan',22)+csGlow(64,56,'--amber'), dyn:'<path d="M280.4 104.1 C262 107 262 93 280.3 96.3" fill="none" style="stroke:var(--amber);stroke-width:2.6"/>'+csPkt('M280.3 96.3 L83.7 59.7','--amber')+'<text x="300" y="160" text-anchor="middle" style="font:700 7.5px var(--sans);fill:var(--amber)">'+esc('hairpin: U-turn back inside at the router')+'</text>', cap:'The router sees the public IP belongs to <b>its own internal server</b> and <b>turns the traffic back</b> to WEB. It never goes out to the internet.'},
    {glow:csGlow(64,150,'--green')+csGlow(64,56,'--amber'), dyn:'', cap:'That’s <b>hairpin NAT</b> (NAT loopback). It isn’t always on by default – which is why "a home server via its domain doesn’t work from inside" until you enable it on the router.'}
  ];
  function show(i){const g=$('c4nglow');if(g)g.innerHTML=STEPS[i].glow||'';const d=$('c4ndyn');if(d)d.innerHTML=STEPS[i].dyn||'';const c=$('c4ncap');if(c)c.innerHTML='<span>'+STEPS[i].cap+'</span>';}
  courseStepper('c4n',STEPS.length,show);
}
// L5M1 — A company has several branches (WAN)
function renderC4Wan(){
  const svg='<svg id="c4osvg" viewBox="0 0 640 200" width="100%" style="display:block">'
    +'<line x1="302.1" y1="78.9" x2="157.9" y2="151.1" style="stroke:var(--line2);stroke-width:1.6"/><line x1="337.9" y1="78.9" x2="482.1" y2="151.1" style="stroke:var(--line2);stroke-width:1.6"/>'
    +'<text x="214" y="112" text-anchor="middle" style="font:700 7px var(--mono);fill:var(--cyan)">WAN</text><text x="426" y="112" text-anchor="middle" style="font:700 7px var(--mono);fill:var(--cyan)">WAN</text>'
    +'<g id="c4oglow"></g>'
    +csDev(320,70,'router','HQ')+csDev(140,160,'router','Branch A')+csDev(500,160,'router','Branch B')
    +'<g id="c4odyn"></g></svg>';
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'So far we’ve been in one building. A real company has a <b>headquarters and branches</b> – each its own network, joined over a <b>WAN</b> (leased lines, the internet, VPN). Traffic between branches must be <b>routed</b>: a user in branch A to a server at HQ, A to B… Static routes can do it – as long as there are <b>two or three</b> branches. But what about <b>twenty</b>?'+'</p>'
    +'<div class="osi-stage">'+svg+'</div>'
    +'<div class="m1-cap" id="c4ocap"></div>'
    +courseStepControls('c4o')
    +abbrBox([['WAN','a network spanning long distances outside your building — from leased lines between branches to the internet itself; the opposite of a LAN.'],['VPN','an encrypted tunnel over the internet — securely links branches or remote users; in detail in the network-security course.'],['branch','a remote company site with its own network, linked over the WAN to HQ.']]);
}
function mountC4Wan(){
  const STEPS=[
    {glow:csGlow(320,70,'--cyan',22)+csGlow(140,160,'--green',20)+csGlow(500,160,'--blue',20), dyn:'', cap:'HQ and two <b>branches</b>, each its own network, joined over the <b>WAN</b>. Three networks that must talk to each other.'},
    {glow:csGlow(140,160,'--green',20)+csGlow(320,70,'--cyan',22), dyn:csPkt('M157.9 151.1 L300 84','--green'), cap:'A user from <b>branch A</b> to a server at <b>HQ</b> → traffic routes over the WAN. With static routes it <b>works</b> for now.'},
    {glow:csGlow(320,70,'--amber',22)+csGlow(140,160,'--amber',20)+csGlow(500,160,'--amber',20), dyn:'<text x="320" y="196" text-anchor="middle" style="font:700 8px var(--sans);fill:var(--amber)">'+esc('20 branches → each needs routes to all the others')+'</text>', cap:'But with <b>twenty branches</b> each router needs routes to all the other networks. That’s <b>a lot of lines by hand</b> and it grows dizzyingly. Static can’t bear it.'}
  ];
  function show(i){const g=$('c4oglow');if(g)g.innerHTML=STEPS[i].glow||'';const d=$('c4odyn');if(d)d.innerHTML=STEPS[i].dyn||'';const c=$('c4ocap');if(c)c.innerHTML='<span>'+STEPS[i].cap+'</span>';}
  courseStepper('c4o',STEPS.length,show);
}
// L5M2 — The WAN link fails (we want an automatic switchover/failover)
function renderC4WanFail(){
  const svg='<svg id="c4psvg" viewBox="0 0 640 200" width="100%" style="display:block">'
    +'<line x1="302.1" y1="78.9" x2="157.9" y2="151.1" style="stroke:var(--line2);stroke-width:1.6"/><line x1="337.9" y1="78.9" x2="482.1" y2="151.1" style="stroke:var(--line2);stroke-width:1.6"/><line x1="160" y1="160" x2="480" y2="160" style="stroke:var(--line2);stroke-width:1.4;stroke-dasharray:3 3"/>'
    +'<text x="320" y="178" text-anchor="middle" style="font:600 6.5px var(--sans);fill:var(--muted)">'+'backup path A↔B'+'</text>'
    +'<g id="c4pglow"></g>'
    +csDev(320,70,'router','HQ')+csDev(140,160,'router','Branch A')+csDev(500,160,'router','Branch B')
    +'<g id="c4pdyn"></g></svg>';
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'And then the worst happens: a <b>WAN link fails</b>. With a static route that’s a problem – it <b>still points at the dead link</b> and traffic vanishes. The branch is <b>cut off</b> until someone manually switches to a backup path (e.g. via the other branch). For critical traffic that’s <b>unacceptably slow</b>. We’d want the switchover to happen <b>by itself and instantly</b>.'+'</p>'
    +'<div class="osi-stage">'+svg+'</div>'
    +'<div class="m1-cap" id="c4pcap"></div>'
    +courseStepControls('c4p')
    +abbrBox([['failover','automatic switchover to a backup path after the primary fails – ideally within seconds.'],['isolated network','a network with no working path after a failure – unreachable.']]);
}
function mountC4WanFail(){
  const STEPS=[
    {glow:csGlow(140,160,'--green',20)+csGlow(320,70,'--cyan',22), dyn:'<line x1="302.1" y1="78.9" x2="157.9" y2="151.1" style="stroke:var(--green);stroke-width:2.6;opacity:.7"/>'+csPkt('M157.9 151.1 L300 84','--green'), cap:'Normally traffic flows <b>HQ ↔ branch A</b> over the WAN link. All good.'},
    {glow:csGlow(320,70,'--red',22)+csGlow(140,160,'--red',20), dyn:'<line x1="302.1" y1="78.9" x2="157.9" y2="151.1" style="stroke:var(--red);stroke-width:2;stroke-dasharray:5 5"/><text x="235" y="104" text-anchor="middle" style="font:800 16px var(--mono);fill:var(--red)">✕</text>', cap:'The <b>WAN link to A fails.</b> But the static route <b>still points</b> at it – traffic pours into nothing.'},
    {glow:csGlow(140,160,'--red',20), dyn:'<line x1="302.1" y1="78.9" x2="157.9" y2="151.1" style="stroke:var(--red);stroke-width:2;stroke-dasharray:5 5"/><text x="140" y="126" text-anchor="middle" style="font:700 8px var(--sans);fill:var(--red)">'+esc('branch A cut off')+'</text>', cap:'Branch A is <b>cut off</b>. A backup path exists (A↔B↔HQ), but static <b>won’t use it by itself</b> – someone would have to bring it up by hand.'},
    {glow:csGlow(140,160,'--amber',20)+csGlow(500,160,'--amber',20)+csGlow(320,70,'--amber',22), dyn:'<line x1="302.1" y1="78.9" x2="157.9" y2="151.1" style="stroke:var(--red);stroke-width:2;stroke-dasharray:5 5"/><line x1="160" y1="160" x2="480" y2="160" style="stroke:var(--amber);stroke-width:2.4;opacity:.8;stroke-dasharray:6 5"/><line x1="337.9" y1="78.9" x2="482.1" y2="151.1" style="stroke:var(--amber);stroke-width:2.4;opacity:.8;stroke-dasharray:6 5"/><text x="320" y="134" text-anchor="middle" style="font:700 7.5px var(--sans);fill:var(--amber)">'+esc('the wish – static won’t do it itself')+'</text>', cap:'We’d want traffic to <b>reroute itself</b> via B (A→B→HQ) <b>within seconds</b>. <b>Dashed = the wish, not reality</b>: branch A stays cut off until someone switches over by hand. Static can’t do this – we need the routers to <b>cooperate</b>.'}
  ];
  function show(i){const g=$('c4pglow');if(g)g.innerHTML=STEPS[i].glow||'';const d=$('c4pdyn');if(d)d.innerHTML=STEPS[i].dyn||'';const c=$('c4pcap');if(c)c.innerHTML='<span>'+STEPS[i].cap+'</span>';}
  courseStepper('c4p',STEPS.length,show);
}
// L5M3 — What we would want (a wish → dynamic routing)
function renderC4Wishlist(){
  const svg='<svg id="c4qsvg" viewBox="0 0 640 184" width="100%" style="display:block">'
    +'<text x="40" y="26" style="font:700 9px var(--sans);fill:var(--muted)">'+'Wishlist: what routers should do on their own'+'</text>'
    +'<g id="c4qrows"></g>'
    +'</svg>';
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'Let’s <b>write a wishlist</b>. For a large network to work, we’d want routers to do <b>three things on their own</b>, without manual entry: <b>learn</b> where networks lead; <b>pick the best path</b> when there are several; and <b>recompute after a failure</b>. This is exactly what <b>dynamic routing</b> does – routers talk to each other and keep the network map themselves. How they do it is the <b>next lesson</b>.'+'</p>'
    +'<div class="osi-stage">'+svg+'</div>'
    +'<div class="m1-cap" id="c4q2cap"></div>'
    +courseStepControls('c4q2')
    +abbrBox([['dynamic routing','routers exchange routes via a protocol and react to changes on their own – the opposite of manual static routes.'],['convergence','the state where, after a change, all routers again agree on the current network map.']]);
}
function mountC4Wishlist(){
  const wish=(y,n,t,c)=>'<g><circle cx="60" cy="'+y+'" r="13" style="fill:var('+c+');fill-opacity:.16;stroke:var('+c+');stroke-width:1.6"/><text x="60" y="'+(y+4)+'" text-anchor="middle" style="font:800 11px var(--mono);fill:var('+c+')">'+n+'</text><text x="88" y="'+(y+4)+'" style="font:600 11px var(--sans);fill:var(--txt)">'+esc(t)+'</text></g>';
  const w1=wish(64,'1','Learn networks themselves (no hand-entry)','--blue');
  const w2=w1+wish(104,'2','Pick the best path when there are several','--amber');
  const w3=w2+wish(144,'3','Recompute by themselves after a failure','--green');
  const STEPS=[
    {rows:w1, cap:'<b>1) Learn networks themselves.</b> No more "I don’t know" – let the router find out where each network leads, without my hand-entry.'},
    {rows:w2, cap:'<b>2) Pick the best path.</b> When several paths exist, let the router choose the best (fastest / shortest), not a random one.'},
    {rows:w3, cap:'<b>3) Recompute after a failure.</b> When something breaks, let the network <b>reroute itself</b> quickly – no night calls for the admin.'},
    {rows:w3, cap:'A <b>dynamic routing protocol</b> grants these three wishes. Routers talk, share a map and compute paths. <b>How exactly they talk</b> is the very next lesson.'}
  ];
  function show(i){const r=$('c4qrows');if(r)r.innerHTML=STEPS[i].rows;const c=$('c4q2cap');if(c)c.innerHTML='<span>'+STEPS[i].cap+'</span>';}
  courseStepper('c4q2',STEPS.length,show);
}
// L6M1 — Routers talk to each other
function renderC4RoutersTalk(){
  const svg='<svg id="c4rsvg" viewBox="0 0 640 184" width="100%" style="display:block">'
    +'<line x1="140" y1="88" x2="300" y2="88" style="stroke:var(--line2);stroke-width:1.6"/><line x1="340" y1="88" x2="500" y2="88" style="stroke:var(--line2);stroke-width:1.6"/>'
    +'<g id="c4rglow"></g>'
    +csDev(120,88,'router','R1')+csDev(320,88,'router','R2')+csDev(520,88,'router','R3')
    +'<text x="120" y="140" text-anchor="middle" style="font:700 7px var(--mono);fill:var(--green)">'+'knows net A'+'</text><text x="320" y="140" text-anchor="middle" style="font:700 7px var(--mono);fill:var(--blue)">'+'knows net B'+'</text><text x="520" y="140" text-anchor="middle" style="font:700 7px var(--mono);fill:var(--amber)">'+'knows net C'+'</text>'
    +'<g id="c4rdyn"></g></svg>';
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'The heart of dynamic routing is surprisingly simple: <b>routers talk to each other</b>. Each <b>tells its neighbors</b> what networks it knows ("I can reach network A"), and what it learns it <b>passes on</b>. The information thus <b>spreads across the whole network</b> and soon <b>every router knows a path to every network</b> – without a single hand-written line. Watch the message spread.'+'</p>'
    +'<div class="osi-stage">'+svg+'</div>'
    +'<div class="m1-cap" id="c4rcap"></div>'
    +courseStepControls('c4r')
    +abbrBox([['neighbor','a router directly connected at the other end of a link – the one route info is shared with.'],['route update','a "I know these networks" message routers exchange and pass on.']]);
}
function mountC4RoutersTalk(){
  const STEPS=[
    {glow:csGlow(120,88,'--green',20)+csGlow(320,88,'--blue',20)+csGlow(520,88,'--amber',20), dyn:'', cap:'At the start each router knows only <b>its directly connected network</b>: R1 net A, R2 net B, R3 net C. It doesn’t know the others.'},
    {glow:csGlow(120,88,'--green',20)+csGlow(320,88,'--blue',20), dyn:csPkt('M140 88 L300 88','--green')+'<text x="220" y="74" text-anchor="middle" style="font:700 7px var(--mono);fill:var(--green)">'+esc('"I know net A"')+'</text>', cap:'R1 <b>tells its neighbor R2</b>: "I can reach net A". R2 notes it down: net A is via R1.'},
    {glow:csGlow(320,88,'--blue',20)+csGlow(520,88,'--amber',20), dyn:csPkt('M340 88 L500 88','--blue')+'<text x="420" y="74" text-anchor="middle" style="font:700 7px var(--mono);fill:var(--blue)">'+esc('"I know A and B"')+'</text>', cap:'R2 <b>passes it on</b> to R3 – and adds its own net B. The information <b>spreads</b> across the network, further and further.'},
    {glow:csGlow(120,88,'--green',20)+csGlow(320,88,'--blue',20)+csGlow(520,88,'--amber',20), dyn:'<text x="320" y="160" text-anchor="middle" style="font:700 8px var(--sans);fill:var(--green)">'+esc('every router now knows A, B and C')+'</text>', cap:'Soon <b>everyone knows a path to every network</b> – automatically, no hand-entry. And when something changes, a new message goes out. That’s <b>dynamic routing</b>.'}
  ];
  function show(i){const g=$('c4rglow');if(g)g.innerHTML=STEPS[i].glow||'';const d=$('c4rdyn');if(d)d.innerHTML=STEPS[i].dyn||'';const c=$('c4rcap');if(c)c.innerHTML='<span>'+STEPS[i].cap+'</span>';}
  courseStepper('c4r',STEPS.length,show);
}
// L6M2 — Distance-vector vs link-state
function renderC4DvVsLs(){
  const svg='<svg id="c4ssvg" viewBox="0 0 640 196" width="100%" style="display:block">'
    +'<line x1="320" y1="18" x2="320" y2="180" style="stroke:var(--line2);stroke-width:1.2;stroke-dasharray:4 4"/>'
    +'<text x="160" y="30" text-anchor="middle" style="font:700 9px var(--sans);fill:var(--amber)">Distance-vector (RIP)</text>'
    +'<text x="480" y="30" text-anchor="middle" style="font:700 9px var(--sans);fill:var(--green)">Link-state (OSPF)</text>'
    +'<g id="c4sglow"></g>'
    +csDev(90,90,'router','')+csDev(230,90,'router','')+csDev(410,90,'router','')+csDev(550,90,'router','')
    +'<g id="c4sdyn"></g></svg>';
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'How exactly do routers tell each other the routes? There are <b>two approaches</b>. <b>Distance-vector</b> (e.g. RIP): "<b>I tell neighbors how far</b> (how many hops) I am from each network" – the neighbor trusts it and computes second-hand. Simple, but slower (it re-advertises whole tables, not just the changes) and "short-sighted". <b>Link-state</b> (e.g. <b>OSPF</b>): "<b>everyone publishes their links</b>, all build a <b>complete map</b> of the network and <b>compute the best path themselves</b>". Smarter and faster – and that’s what we’re heading for.'+'</p>'
    +'<div class="osi-stage">'+svg+'</div>'
    +'<div class="m1-cap" id="c4scap"></div>'
    +courseStepControls('c4s')
    +abbrBox([['distance-vector','"second-hand" – a router trusts a neighbor’s distance to each network (hop count). E.g. RIP.'],['link-state','every router knows the full map and computes the best path itself. E.g. OSPF.']]);
}
function mountC4DvVsLs(){
  const STEPS=[
    {glow:'', dyn:'', cap:'Two ways routers share routes. Let’s take both.'},
    {glow:csGlow(90,90,'--amber',20)+csGlow(230,90,'--amber',20), dyn:csPkt('M110 90 L210 90','--amber')+'<text x="160" y="124" text-anchor="middle" style="font:700 7px var(--mono);fill:var(--amber)">'+esc('"net X is 2 hops away"')+'</text>', cap:'<b>Distance-vector</b>: a router tells its neighbor only the <b>distance</b> ("2 hops"), not the whole map. The neighbor trusts it. Simple, but after a failure it spreads <b>slowly</b> and can get confused.'},
    {glow:csGlow(410,90,'--green',20)+csGlow(550,90,'--green',20), dyn:csPkt('M430 90 L530 90','--green')+csPkt('M530 90 L430 90','--green')+'<text x="480" y="124" text-anchor="middle" style="font:700 7px var(--mono);fill:var(--green)">'+esc('"here are MY links"')+'</text>', cap:'<b>Link-state</b>: each publishes <b>its links to everyone</b>. From that <b>each builds a complete map</b> itself and computes the best path. More work, but <b>accurate and fast</b>.'},
    {glow:csGlow(410,90,'--green',20)+csGlow(550,90,'--green',20), dyn:'<text x="480" y="150" text-anchor="middle" style="font:700 8px var(--sans);fill:var(--green)">'+esc('OSPF = link-state → our target')+'</text>', cap:'Modern enterprise networks run <b>link-state – specifically OSPF</b>. It has the full map, so it reacts fast and smart. <b>How OSPF works inside</b> is the next lesson (and we’ll build it).'}
  ];
  function show(i){const g=$('c4sglow');if(g)g.innerHTML=STEPS[i].glow||'';const d=$('c4sdyn');if(d)d.innerHTML=STEPS[i].dyn||'';const c=$('c4scap');if(c)c.innerHTML='<span>'+STEPS[i].cap+'</span>';}
  courseStepper('c4s',STEPS.length,show);
}
// L6M3 — Hello and adjacency
function renderC4HelloNeighbor(){
  const svg='<svg id="c4tsvg" viewBox="0 0 640 176" width="100%" style="display:block">'
    +'<line x1="180" y1="88" x2="460" y2="88" style="stroke:var(--line2);stroke-width:1.6"/>'
    +'<g id="c4tglow"></g>'
    +csDev(160,88,'router','R1')+csDev(480,88,'router','R2')
    +'<g id="c4tdyn"></g></svg>';
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'Before routers exchange routes, they must <b>find each other</b> and agree. So they send small <b>Hello</b> packets ("hi, I’m here"). When two neighbors exchange Hellos, they <b>recognize each other</b> and become <b>neighbors</b> (form an <b>adjacency</b>). Hellos then keep going like a <b>heartbeat</b> – "alive, the link works". And <b>when Hellos stop</b>, the other side detects the failure within <b>tens of seconds</b> (the default dead interval; with timer tuning or BFD even sub-second) and triggers a <b>route recompute</b>.'+'</p>'
    +'<div class="osi-stage">'+svg+'</div>'
    +'<div class="m1-cap" id="c4tcap"></div>'
    +courseStepControls('c4t')
    +abbrBox([['Hello','a small "I’m here" packet by which routers find neighbors and check the link is alive.'],['adjacency','an established relationship between two routers that exchange route information.']]);
}
function mountC4HelloNeighbor(){
  const STEPS=[
    {glow:csGlow(160,88,'--cyan',22)+csGlow(480,88,'--cyan',22), dyn:csPkt('M180 88 L460 88','--cyan')+'<text x="320" y="74" text-anchor="middle" style="font:700 8px var(--mono);fill:var(--cyan)">Hello</text>', cap:'R1 and R2 send each other <b>Hello</b> packets – "hi, I’m here, I speak OSPF".'},
    {glow:csGlow(160,88,'--green',22)+csGlow(480,88,'--green',22), dyn:'<line x1="180" y1="88" x2="460" y2="88" style="stroke:var(--green);stroke-width:2.8;opacity:.7"/><text x="320" y="74" text-anchor="middle" style="font:700 8px var(--sans);fill:var(--green)">'+esc('✓ neighbors (adjacency)')+'</text>', cap:'They exchange and <b>recognize each other</b> → they become <b>neighbors</b>. Now they can start exchanging route information.'},
    {glow:csGlow(160,88,'--green',22)+csGlow(480,88,'--green',22), dyn:csPkt('M180 88 L460 88','--green',('0.9s'))+csPkt('M460 88 L180 88','--green',('0.9s'))+'<text x="320" y="112" text-anchor="middle" style="font:700 7.5px var(--sans);fill:var(--green)">'+esc('Hello ~every 10 s = heartbeat')+'</text>', cap:'Hellos keep going <b>round and round</b> like a heartbeat: "alive, the link works". This <b>maintains</b> the adjacency.'},
    {glow:csGlow(480,88,'--red',22), dyn:'<line x1="180" y1="88" x2="460" y2="88" style="stroke:var(--red);stroke-width:2;stroke-dasharray:5 5"/><text x="320" y="74" text-anchor="middle" style="font:800 16px var(--mono);fill:var(--red)">✕</text><text x="320" y="116" text-anchor="middle" style="font:700 7.5px var(--sans);fill:var(--red)">'+esc('Hellos stopped → failure → recompute')+'</text>', cap:'When <b>Hellos stop</b>, R1 detects within <b>tens of seconds</b> that R2 (or the link) is <b>down</b> and triggers a <b>route recompute</b>. This is how the network reacts fast to failures.'}
  ];
  function show(i){const g=$('c4tglow');if(g)g.innerHTML=STEPS[i].glow||'';const d=$('c4tdyn');if(d)d.innerHTML=STEPS[i].dyn||'';const c=$('c4tcap');if(c)c.innerHTML='<span>'+STEPS[i].cap+'</span>';}
  courseStepper('c4t',STEPS.length,show);
}
// L6M4 — Metric: which path is best
function renderC4Metric(){
  const svg='<svg id="c4usvg" viewBox="0 0 640 200" width="100%" style="display:block">'
    +'<line x1="129.8" y1="97" x2="480.2" y2="43" style="stroke:var(--line2);stroke-width:1.6"/><line x1="505.5" y1="57.1" x2="527.5" y2="125.6" style="stroke:var(--line2);stroke-width:1.6"/>'
    +'<line x1="129.1" y1="106" x2="280.9" y2="154" style="stroke:var(--line2);stroke-width:1.6"/><line x1="280.9" y1="154" x2="480" y2="159.5" style="stroke:var(--line2);stroke-width:1.6"/><line x1="512.5" y1="144.4" x2="527.5" y2="125.6" style="stroke:var(--line2);stroke-width:1.6"/>'
    +'<text x="300" y="58" text-anchor="middle" style="font:700 7px var(--sans);fill:var(--amber)">'+'1 hop · slow link'+'</text>'
    +'<text x="400" y="184" text-anchor="middle" style="font:700 7px var(--sans);fill:var(--green)">'+'2 hops · fast links'+'</text>'
    +'<g id="c4uglow"></g>'
    +csDev(110,100,'router','A')+csDev(300,160,'router','R')+csDev(500,160,'router','')+csDev(500,40,'router','')+csHost(540,110,'server','--blue','B')
    +'<g id="c4udyn"></g></svg>';
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'When there are <b>several paths</b> to a destination, how do you pick the best? That criterion is the <b>metric</b>. <b>RIP</b> counts <b>hops</b> (hop count) – it picks the path through the <b>fewest routers</b>, even if it runs over a <b>slow</b> link. <b>OSPF</b> uses <b>cost based on link speed</b> – it prefers several <b>fast</b> hops over one <b>slow</b> one. That’s why OSPF chooses <b>smarter</b>. Watch the difference.'+'</p>'
    +'<div class="osi-stage">'+svg+'</div>'
    +'<div class="m1-cap" id="c4ucap"></div>'
    +courseStepControls('c4u')
    +abbrBox([['metric','the number a protocol uses to pick the best path (hops in RIP, cost in OSPF).'],['cost (OSPF)','a path’s cost by link speed – a fast link = low cost. The lower total wins.']]);
}
function mountC4Metric(){
  const slow='<line x1="129.8" y1="97" x2="480.2" y2="43" style="stroke:var(--amber);stroke-width:2.8;opacity:.7"/><line x1="505.5" y1="57.1" x2="527.5" y2="125.6" style="stroke:var(--amber);stroke-width:2.8;opacity:.7"/>'+csPkt('M130 100 L500 40','--amber')+csPkt('M500 40 L527.5 125.6','--amber');
  const fast='<line x1="129.1" y1="106" x2="280.9" y2="154" style="stroke:var(--green);stroke-width:2.8;opacity:.7"/><line x1="280.9" y1="154" x2="480" y2="159.5" style="stroke:var(--green);stroke-width:2.8;opacity:.7"/><line x1="512.5" y1="144.4" x2="527.5" y2="125.6" style="stroke:var(--green);stroke-width:2.8;opacity:.7"/>'+csPkt('M130 100 L300 160 L500 160 L527.5 125.6','--green');
  const STEPS=[
    {glow:csGlow(110,100,'--cyan',20)+csGlow(540,110,'--blue'), dyn:'', cap:'From <b>A</b> to <b>B</b> there are two paths: the upper <b>1 hop but a slow link</b>; the lower <b>2 hops over fast links</b>. Which is better?'},
    {glow:csGlow(110,100,'--amber',20)+csGlow(500,40,'--amber',20)+csGlow(540,110,'--blue'), dyn:slow, cap:'<b>RIP (hop count)</b> counts hops → it picks the <b>upper</b> path (1 hop). But that runs over a <b>slow</b> link – actually worse.'},
    {glow:csGlow(110,100,'--green',20)+csGlow(300,160,'--green',20)+csGlow(500,160,'--green',20)+csGlow(540,110,'--blue'), dyn:fast, cap:'<b>OSPF (cost)</b> goes by speed → it picks the <b>lower</b> path: more hops, but over <b>fast</b> links = lower cost. Genuinely better.'},
    {glow:csGlow(110,100,'--green',20)+csGlow(540,110,'--blue'), dyn:'', cap:'That’s why a <b>speed-based metric</b> (OSPF) is smarter than just counting hops. How OSPF computes that cost and finds the best path is the <b>next lesson</b> – and <b>we’ll build it into the simulator</b>.'}
  ];
  function show(i){const g=$('c4uglow');if(g)g.innerHTML=STEPS[i].glow||'';const d=$('c4udyn');if(d)d.innerHTML=STEPS[i].dyn||'';const c=$('c4ucap');if(c)c.innerHTML='<span>'+STEPS[i].cap+'</span>';}
  courseStepper('c4u',STEPS.length,show);
}
// ---- L7 OSPF — shared by 4 routers (mesh) for LSDB/Dijkstra ----
function c4MeshSvg(pfx){
  return '<svg id="'+pfx+'svg" viewBox="0 0 640 196" width="100%" style="display:block">'
    +'<line x1="170" y1="60" x2="300" y2="60" style="stroke:var(--line2);stroke-width:1.6"/><line x1="150" y1="80" x2="150" y2="120" style="stroke:var(--line2);stroke-width:1.6"/><line x1="338.1" y1="68.5" x2="471.9" y2="131.5" style="stroke:var(--line2);stroke-width:1.6"/><line x1="170" y1="140" x2="470" y2="140" style="stroke:var(--line2);stroke-width:1.6"/><line x1="301.9" y1="68.5" x2="168.1" y2="131.5" style="stroke:var(--line2);stroke-width:1.6"/>'
    +'<g id="'+pfx+'glow"></g>'
    +csDev(150,60,'router','R1')+csDev(320,60,'router','R2')+csDev(150,140,'router','R3')+csDev(490,140,'router','R4')
    +'<g id="'+pfx+'dyn"></g></svg>';
}
// L7M1 — LSDB
function renderC4Lsdb(){
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'<b>OSPF</b> is a link-state protocol and its principle is surprisingly simple: each router <b>tells the others what links it has</b> (who its neighbor is, how fast the link). Once routers exchange this, <b>everyone holds the same complete map</b> of the whole network – called the <b>LSDB</b> (Link-State Database). And from that map each router computes the <b>cheapest path</b> to every network <b>by itself</b> (the <b>Dijkstra</b> algorithm; a path’s cost = the sum of link costs). The same map everywhere → the paths fit together without loops.'+'</p>'
    +'<div class="osi-stage">'+c4MeshSvg('c4v')+'</div>'
    +'<div class="m1-cap" id="c4vcap"></div>'
    +courseStepControls('c4v')
    +abbrBox([['LSDB','Link-State Database – the shared network map; after the exchange every router holds the same one.'],['Dijkstra','the algorithm a router uses to compute the cheapest path to every network from the map by itself.']]);
}
function mountC4Lsdb(){
  const flood=csPkt('M150 60 L320 60','--cyan')+csPkt('M150 60 L150 140','--cyan')+csPkt('M320 60 L490 140','--cyan')+csPkt('M150 140 L490 140','--cyan')+csPkt('M320 60 L150 140','--cyan');
  const all=csGlow(150,60,'--cyan',20)+csGlow(320,60,'--cyan',20)+csGlow(150,140,'--cyan',20)+csGlow(490,140,'--cyan',20);
  const allG=csGlow(150,60,'--green',20)+csGlow(320,60,'--green',20)+csGlow(150,140,'--green',20)+csGlow(490,140,'--green',20);
  const cl=(x,y,t,c)=>'<text x="'+x+'" y="'+y+'" text-anchor="middle" style="font:700 7.5px var(--mono);fill:var('+c+')">'+esc(t)+'</text>';
  const costs=cl(235,52,'cost 10','--muted')+cl(126,102,'cost 10','--muted')+cl(320,132,'cost 10','--muted')+cl(428,94,'cost 50','--muted')+cl(226,114,'cost 50','--muted');
  const tree='<line x1="170" y1="60" x2="300" y2="60" style="stroke:var(--green);stroke-width:3"/><line x1="150" y1="80" x2="150" y2="120" style="stroke:var(--green);stroke-width:3"/><line x1="170" y1="140" x2="470" y2="140" style="stroke:var(--green);stroke-width:3"/>';
  const STEPS=[
    {glow:csGlow(150,60,'--blue',20), dyn:'', cap:'At the start <b>each router knows only its own links</b> (who it’s directly attached to). It can’t see the whole network.'},
    {glow:all, dyn:flood, cap:'Each <b>tells the others what it sees</b> – the link information spreads across the whole network neighbor to neighbor.'},
    {glow:allG, dyn:costs+'<text x="320" y="180" text-anchor="middle" style="font:700 8px var(--sans);fill:var(--green)">'+esc('every router = the same map (LSDB)')+'</text>', cap:'The result: <b>every router holds an identical map</b> of the whole network – the <b>LSDB</b>. No one has an edge or a blind spot.'},
    {glow:csGlow(150,60,'--green',22)+csGlow(490,140,'--green',20), dyn:costs+tree, cap:'From the map each <b>computes the cheapest path</b> to every network by itself (Dijkstra; path cost = sum of link costs). From R1 to R4: via R3 <b>10+10 = 20</b>, via R2 it would be 10+50 = 60 → the green tree wins. That fills the <b>routing table</b>. That’s OSPF in a nutshell.'}
  ];
  function show(i){const g=$('c4vglow');if(g)g.innerHTML=STEPS[i].glow||'';const d=$('c4vdyn');if(d)d.innerHTML=STEPS[i].dyn||'';const c=$('c4vcap');if(c)c.innerHTML='<span>'+STEPS[i].cap+'</span>';}
  courseStepper('c4v',STEPS.length,show);
}
// L7M3 — Cost (how it is calculated) + tie-in to the simulator
function renderC4OspfCost(){
  const svg='<svg id="c4xsvg" viewBox="0 0 640 200" width="100%" style="display:block">'
    +'<line x1="129.8" y1="97.3" x2="500" y2="46" style="stroke:var(--line2);stroke-width:1.6"/><line x1="500" y1="46" x2="520.4" y2="112.1" style="stroke:var(--line2);stroke-width:1.6"/>'
    +'<line x1="129.1" y1="105.8" x2="280.9" y2="152.2" style="stroke:var(--line2);stroke-width:1.6"/><line x1="319.6" y1="153.9" x2="520.4" y2="112.1" style="stroke:var(--line2);stroke-width:1.6"/>'
    +'<text x="300" y="58" text-anchor="middle" style="font:700 7px var(--mono);fill:var(--amber)">100 Mb/s · cost 100</text>'
    +'<text x="205" y="146" text-anchor="middle" style="font:700 7px var(--mono);fill:var(--green)">1 Gb/s · 10</text><text x="405" y="152" text-anchor="middle" style="font:700 7px var(--mono);fill:var(--green)">1 Gb/s · 10</text>'
    +'<g id="c4xglow"></g>'
    +csDev(110,100,'router','A')+csDev(300,158,'router','R')+csHost(540,108,'server','--blue','B')
    +'<g id="c4xdyn"></g></svg>';
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'Where does OSPF get a link’s <b>cost</b>? From its <b>speed</b>: a faster link = a lower cost (roughly cost ≈ reference speed ÷ link speed). A slow 100Mb/s link has a high cost, a fast 1Gb/s a low one. The <b>path cost = the sum of link costs</b> along it. OSPF then picks the path with the <b>lowest total</b> – happily more hops over fast links. <b>And this is exactly what this simulator can now do</b>: set a link’s cost and traffic takes the cheapest path.'+'</p>'
    +'<div class="osi-stage">'+svg+'</div>'
    +'<div class="m1-cap" id="c4xcap"></div>'
    +courseStepControls('c4x')
    +abbrBox([['cost','a link’s cost by speed (fast = low). A path’s cost = the sum of link costs along it.'],['reference bandwidth','the basis for the cost; cost ≈ reference bandwidth ÷ link speed. It’s configurable – the example above uses 10 Gb/s so faster links get distinct costs (100Mb/s = 100, 1Gb/s = 10). Cisco’s historical default is 100 Mb/s – there both links come out almost the same (cost 1), which is why the reference is raised nowadays. But "faster = cheaper" always holds.']]);
}
function mountC4OspfCost(){
  const slow='<line x1="129.8" y1="97.3" x2="500" y2="46" style="stroke:var(--amber);stroke-width:3;opacity:.7"/><line x1="500" y1="46" x2="520.4" y2="112.1" style="stroke:var(--amber);stroke-width:3;opacity:.7"/>'+csPkt('M130 100 L500 46','--amber')+csPkt('M500 46 L520.4 112.1','--amber');
  const fast='<line x1="129.1" y1="105.8" x2="280.9" y2="152.2" style="stroke:var(--green);stroke-width:3;opacity:.7"/><line x1="319.6" y1="153.9" x2="520.4" y2="112.1" style="stroke:var(--green);stroke-width:3;opacity:.7"/>'+csPkt('M130 100 L300 158 L500 120 L520.4 112.1','--green');
  const STEPS=[
    {glow:csGlow(110,100,'--cyan',20)+csGlow(540,108,'--blue'), dyn:'', cap:'From <b>A</b> to <b>B</b>: the upper path = <b>1 hop over 100Mb/s</b> (cost 100). The lower = <b>2 hops over 1Gb/s</b> (cost 10 + 10 = 20).'},
    {glow:csGlow(110,100,'--amber',20)+csGlow(540,108,'--blue'), dyn:slow, cap:'If OSPF counted <b>hops</b> like RIP, it would pick the upper path (1 hop). But its <b>cost 100</b> is high – over a slow link. A bad choice.'},
    {glow:csGlow(110,100,'--green',20)+csGlow(300,158,'--green',20)+csGlow(540,108,'--blue'), dyn:fast, cap:'OSPF adds up the <b>costs</b>: the lower path <b>20 &lt; 100</b> → it picks that, even with more hops. <b>Lower cost = better path.</b>'},
    {glow:csGlow(110,100,'--green',20)+csGlow(540,108,'--blue'), dyn:'', cap:'<b>In the simulator:</b> this logic is now built into the engine – once you set a link’s cost, routers seek the <b>cheapest</b> path (Dijkstra), not the shortest. The link speed now sets the cost by itself (faster = cheaper), and a right-click on the link lets you override it manually. Try it in the task.'}
  ];
  function show(i){const g=$('c4xglow');if(g)g.innerHTML=STEPS[i].glow||'';const d=$('c4xdyn');if(d)d.innerHTML=STEPS[i].dyn||'';const c=$('c4xcap');if(c)c.innerHTML='<span>'+STEPS[i].cap+'</span>';}
  courseStepper('c4x',STEPS.length,show);
}
// L7M6 — a bridge to Course 7
function renderC4OspfBridge(){
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'That’s the <b>principle of OSPF</b> – and for practical network work it’s all you need for now. There’s of course more under the hood: <b>exactly how</b> routers find each other and form adjacencies (Hello, DR/BDR), how the map is spread and maintained (LSAs, flooding), how Dijkstra builds the path tree step by step – and how a large network is split into <b>areas</b> so it scales. All of that is covered in depth in <b>the OSPF in depth course</b>. Now let’s see how fast a network recovers from a change – <b>convergence</b>.'+'</p>'
    +abbrBox([['area','how OSPF splits a large network into smaller pieces so it scales – detailed in the OSPF in depth course.']]);
}
// (Areas and e2e detail moved to Course 7)
// L8M1 — What convergence is
function renderC4Convergence(){
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'A network is <b>converged</b> when <b>all routers agree</b> on the current map and paths – traffic flows where it should. But the moment something <b>changes</b> (a link fails, a network appears), there’s a brief window where <b>someone doesn’t know yet</b> and the paths disagree. Routers flood an update, recompute Dijkstra and <b>re-align</b>. That settling is called <b>convergence</b>, and the time to it the <b>convergence time</b>. Watch it happen.'+'</p>'
    +'<div class="osi-stage">'+c4MeshSvg('c4ca')+'</div>'
    +'<div class="m1-cap" id="c4cacap"></div>'
    +courseStepControls('c4ca')
    +abbrBox([['convergence','the state where, after a change, all routers re-agree on the map and best paths.'],['convergence time','how long it takes the network to settle after a change – shorter = better.']]);
}
function mountC4Convergence(){
  const flow='<line x1="338.1" y1="68.5" x2="471.9" y2="131.5" style="stroke:var(--green);stroke-width:2.8;opacity:.7"/>'+csPkt('M150 60 L320 60','--green')+csPkt('M320 60 L490 140','--green');
  const fail='<line x1="338.1" y1="68.5" x2="471.9" y2="131.5" style="stroke:var(--red);stroke-width:2;stroke-dasharray:5 5"/><text x="405" y="92" text-anchor="middle" style="font:800 16px var(--mono);fill:var(--red)">✕</text>';
  const reroute='<line x1="301.9" y1="68.5" x2="168.1" y2="131.5" style="stroke:var(--green);stroke-width:2.8;opacity:.7"/><line x1="170" y1="140" x2="470" y2="140" style="stroke:var(--green);stroke-width:2.8;opacity:.7"/>'+csPkt('M320 60 L150 140 L490 140','--green');
  const STEPS=[
    {glow:csGlow(150,60,'--green',20)+csGlow(320,60,'--green',20)+csGlow(490,140,'--green',20), dyn:flow, cap:'The network is <b>converged</b>: traffic from R1 to R4 goes via R2. Everyone agrees, all works.'},
    {glow:csGlow(320,60,'--red',20)+csGlow(490,140,'--red',20), dyn:fail, cap:'The <b>R2–R4 link fails.</b> Suddenly the path everyone computed is gone. The network is briefly <b>out of sync</b>.'},
    {glow:csGlow(320,60,'--amber',20)+csGlow(150,140,'--amber',20)+csGlow(490,140,'--amber',20), dyn:fail+'<text x="320" y="180" text-anchor="middle" style="font:700 8px var(--sans);fill:var(--amber)">'+esc('new LSA → everyone recomputes Dijkstra')+'</text>', cap:'A <b>new LSA</b> is flooded ("R2–R4 is gone"). Each router <b>recomputes</b> the cheapest paths from the current map.'},
    {glow:csGlow(150,60,'--green',20)+csGlow(320,60,'--green',20)+csGlow(150,140,'--green',20)+csGlow(490,140,'--green',20), dyn:reroute, cap:'Done: traffic now goes <b>R2 → R3 → R4</b>. The network is <b>converged again</b>. This all happens <b>in seconds and automatically</b>.'}
  ];
  function show(i){const g=$('c4caglow');if(g)g.innerHTML=STEPS[i].glow||'';const d=$('c4cadyn');if(d)d.innerHTML=STEPS[i].dyn||'';const c=$('c4cacap');if(c)c.innerHTML='<span>'+STEPS[i].cap+'</span>';}
  courseStepper('c4ca',STEPS.length,show);
}
// L8M2 — How fast (overview; timer details in Course 7)
function renderC4ConvSpeed(){
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'<b>How fast</b> does the network settle? With OSPF, on the order of <b>seconds</b>: the longest part is <b>noticing</b> a neighbor has failed; spreading the news and recomputing paths take fractions of a second. Fast convergence is one of OSPF’s main strengths – older protocols like <b>RIP</b> can take <b>minutes</b> to recover after a change (why, you’ll see in the next lesson when we compare protocols). And how failure detection can be tuned – <b>Hello/dead intervals and BFD</b> – is covered in <b>the OSPF in depth course</b>.'+'</p>'
    +abbrBox([['convergence time','how long the network takes to settle after a change – shorter = better. OSPF: seconds; RIP: up to minutes.']]);
}
/* ============================================================
   COURSE 4 — Routing protocols (RIP/OSPF/EIGRP/IS-IS/BGP). Shared rpNet scene: two paths PC→SRV
   — the direct SLOW R1–R4 (min. hops) vs. the fast CHAIN R1–R2–R3–R4 (min. cost). Shows the metric hops vs. cost.
   ============================================================ */
var RPN={pc:[44,110],r1:[130,110],r2:[255,52],r3:[375,52],r4:[490,110],srv:[556,110]};
function rpNet(pfx){
  return '<svg id="'+pfx+'svg" viewBox="0 0 600 190" width="100%" style="display:block">'
    +'<line x1="60" y1="110" x2="110" y2="110" style="stroke:var(--line2);stroke-width:1.6"/>'
    +'<line x1="148.1" y1="101.6" x2="236.9" y2="60.4" style="stroke:var(--line2);stroke-width:1.6"/>'
    +'<line x1="275" y1="52" x2="355" y2="52" style="stroke:var(--line2);stroke-width:1.6"/>'
    +'<line x1="392.9" y1="61" x2="472.1" y2="101" style="stroke:var(--line2);stroke-width:1.6"/>'
    +'<line x1="150" y1="110" x2="470" y2="110" style="stroke:var(--line2);stroke-width:1.6"/>'
    +'<line x1="510" y1="110" x2="540" y2="110" style="stroke:var(--line2);stroke-width:1.6"/>'
    +'<g id="'+pfx+'glow"></g>'
    +csDev(130,110,'router','R1')+csDev(255,52,'router','R2')+csDev(375,52,'router','R3')+csDev(490,110,'router','R4')
    +csHost(44,110,'desktop','--blue','PC')+csHost(556,110,'server','--green','SRV')
    +'<g id="'+pfx+'dyn"></g></svg>';
}
function rpP(pfx,intro,terms){
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+intro+'</p>'
    +'<div class="osi-stage">'+rpNet(pfx)+'</div>'
    +'<div class="m1-cap" id="'+pfx+'cap"></div>'
    +courseStepControls(pfx)+abbrBox(terms);
}
function rpMount(pfx,STEPS){
  function show(i){var g=$(pfx+'glow');if(g)g.innerHTML=STEPS[i].glow||'';var d=$(pfx+'dyn');if(d)d.innerHTML=STEPS[i].dyn||'';var c=$(pfx+'cap');if(c)c.innerHTML='<span>'+STEPS[i].cap+'</span>';}
  courseStepper(pfx,STEPS.length,show);
}
function rpg(name,color){var p=RPN[name];return csGlow(p[0],p[1],color,22);}
function rplbl(x,y,tx,c){return '<text x="'+x+'" y="'+y+'" text-anchor="middle" style="font:700 8px var(--mono);fill:var('+c+')">'+esc(tx)+'</text>';}
function RP_COST(){return '<text x="310" y="22" text-anchor="middle" style="font:700 7.5px var(--mono);fill:var(--green)">'+esc('fast path: 10+10+10 = cost 30')+'</text>'
  +'<text x="310" y="126" text-anchor="middle" style="font:700 7.5px var(--mono);fill:var(--amber)">'+esc('direct slow link: cost 100')+'</text>';}
var RP_HL_SLOW='<line x1="150" y1="110" x2="470" y2="110" style="stroke:var(--amber);stroke-width:3.5;opacity:.7"/>';
var RP_HL_FAST='<line x1="148.1" y1="101.6" x2="236.9" y2="60.4" style="stroke:var(--green);stroke-width:3.5;opacity:.7"/><line x1="275" y1="52" x2="355" y2="52" style="stroke:var(--green);stroke-width:3.5;opacity:.7"/><line x1="392.9" y1="61" x2="472.1" y2="101" style="stroke:var(--green);stroke-width:3.5;opacity:.7"/>';
var RP_PKT_SLOW=csPkt('M60 110 L540 110','--amber');
var RP_PKT_FAST=csPkt('M60 110 L130 110 L255 52 L375 52 L490 110 L540 110','--green');
// L?M1 — how a router learns routes
function renderRpIntro(){return rpP('rpa',
  'Back to what you already know: static routes don’t scale (the static routes lesson), and routers can exchange maps on their own — you saw <b>how</b> (hello, adjacency, metric) and <b>how fast</b> (convergence). Now we widen the question to <b>WHAT makes the individual protocols differ</b>. In practice you’ll meet five: <b>RIP, OSPF, EIGRP, IS-IS and BGP</b>. They don’t differ in the "exchange routes" principle, but in the <b>metric</b>, convergence speed and above all <b>where they’re deployed</b> — LAN, ISP backbone, or the internet edge. And since several can run on one router at once, in the course’s final lesson we tackle a new question: <b>which one wins?</b>',
  [['metric','how a protocol picks the best path (hops, cost, a composite metric).'],['convergence','how fast routers agree on new paths after a change.']]);}
function mountRpIntro(){rpMount('rpa',[
  {glow:rpg('pc','--green')+rpg('r1','--green'),dyn:'',cap:'R1 only knows its <b>directly connected</b> networks (e.g. the PC side). It has no route to the remote SRV yet.'},
  {glow:rpg('pc','--cyan')+rpg('r1','--cyan')+rpg('r2','--cyan')+rpg('r3','--cyan')+rpg('r4','--cyan')+rpg('srv','--cyan'),dyn:RP_HL_FAST+RP_PKT_FAST,cap:'R1 learns the route to SRV statically or dynamically – you know that. The new question: <b>which protocol</b>? The choice decides which path wins.'},
  {glow:rpg('pc','--green')+rpg('r1','--green')+rpg('r2','--green')+rpg('r3','--green')+rpg('r4','--green')+rpg('srv','--green'),dyn:RP_HL_SLOW+RP_HL_FAST+RP_PKT_SLOW+RP_PKT_FAST+rplbl(310,18,'OSPF: by speed','--green')+rplbl(310,132,'RIP: by hop count','--amber'),cap:'On the <b>same network</b> each protocol picks a <b>different path</b>, because it measures with a different <b>metric</b>: RIP counts hops (the direct slow link wins), OSPF a cost based on speed (the longer but fast chain wins). We’ll go from the simplest: RIP – next.'}
]);}
// L?M2 — RIP
function renderRpRip(){return rpP('rpb',
  'You already know <b>distance-vector</b>: a router trusts a neighbor’s "it’s this far" and never sees the whole map. <b>RIP</b> is its oldest and purest embodiment – and here are the concrete numbers you didn’t have yet: metric = <b>hop count</b>, capped at <b>15</b> (16 = "unreachable"), the whole table re-advertised every <b>30 seconds</b> plus long <b>hold-down timers</b> after a failure (hence the slow convergence you saw last time), trustworthiness <b>AD 120</b> – the worst of the common protocols. And the practical weakness: fewest hops ≠ fastest path. Today it’s <b>obsolete</b> – you’ll only meet it in an old network or a lab.',
  [['RIP','Routing Information Protocol – distance-vector, metric = hop count, max 15, AD 120, obsolete today.'],['distance-vector','a router trusts a neighbor’s "how far" (hop count); it doesn’t know the whole map.'],['hop','each router on the path = one hop. RIP counts only these.']]);}
function mountRpRip(){rpMount('rpb',[
  {glow:rpg('r1','--amber')+rpg('r4','--amber'),dyn:RP_COST(),cap:'Two paths PC→SRV: a <b>direct</b> one with 1 hop between (R1→R4, but slow), and a <b>fast chain</b> via R2+R3 (more hops, fast links).'},
  {glow:rpg('r1','--amber')+rpg('r4','--amber'),dyn:RP_COST()+RP_HL_SLOW,cap:'<b>RIP</b> counts only hops: the direct path = <b>fewer routers</b>, so it wins – even over the slow link. RIP doesn’t care about speed.'},
  {glow:rpg('pc','--amber')+rpg('r1','--amber')+rpg('r4','--amber')+rpg('srv','--amber'),dyn:RP_COST()+RP_HL_SLOW+RP_PKT_SLOW,cap:'Traffic flows the <b>slow</b> direct path. That’s RIP’s weakness: <b>fewest hops ≠ best path</b>. Hence OSPF came – next.'}
]);}
// L?M3 — OSPF
function renderRpOspf(){return rpP('rpc',
  'You already know the principle of <b>OSPF</b> – a shared map (LSDB) and the cheapest path by cost (Dijkstra). Here we place it in the family and add what you didn’t have yet: it’s an <b>open standard</b> (an RFC – runs on every vendor’s boxes, no vendor lock-in), it has <b>AD 110</b>, and it’s today’s <b>default choice</b> in enterprise networks. Above all, we’ll pit it against RIP <b>on the same topology</b>: where RIP blindly picked the slow "short" path, OSPF – with cost based on speed – picks the longer but faster one.',
  [['OSPF','Open Shortest Path First – link-state, metric = cost (by speed), Dijkstra, AD 110, open standard.'],['cost','a link’s cost by speed; a path’s cost = sum of link costs. Lowest wins.'],['link-state','every router holds the whole map first-hand and computes paths itself.']]);}
function mountRpOspf(){rpMount('rpc',[
  {glow:rpg('r1','--green')+rpg('r4','--green'),dyn:RP_COST(),cap:'Same network, but <b>OSPF</b> looks at <b>cost</b>: the direct slow link = 100, the fast chain via R2+R3 = 10+10+10 = <b>30</b>.'},
  {glow:rpg('r1','--green')+rpg('r2','--green')+rpg('r3','--green')+rpg('r4','--green'),dyn:RP_COST()+RP_HL_FAST,cap:'Dijkstra picks the <b>cheapest</b> path: the chain (30) &lt; the direct one (100). <b>More hops, but faster</b> – exactly the opposite of RIP.'},
  {glow:rpg('pc','--green')+rpg('r1','--green')+rpg('r2','--green')+rpg('r3','--green')+rpg('r4','--green')+rpg('srv','--green'),dyn:RP_COST()+RP_HL_FAST+RP_PKT_FAST,cap:'Traffic flows the <b>fast chain</b>. That’s OSPF’s strength: it decides by <b>real speed</b>, not the number of routers.'}
]);}
// L?M4 — EIGRP
function renderRpEigrp(){return rpP('rpd',
  '<b>EIGRP</b> is Cisco’s: the metric is <b>composite</b> – mainly <b>bandwidth and delay</b>, not just hops or a single cost. It keeps a <b>pre-computed backup route</b> (feasible successor), so on a failure it switches almost instantly (<b>fast convergence</b>). Once proprietary; Cisco later published it (<b>partially open</b>). In the simulator it picks the "best path" much like OSPF – the real difference is the <b>metric type</b> and its <b>lower administrative distance (90)</b>, so running next to OSPF, <b>EIGRP wins</b>.',
  [['EIGRP','advanced distance-vector (Cisco, later published); composite metric, DUAL, AD 90.'],['feasible successor','a pre-computed backup route – on the primary’s failure it switches almost instantly.'],['composite metric','combines bandwidth and delay (not just hops or a single cost).']]);}
function mountRpEigrp(){var down='<line x1="392.9" y1="61" x2="472.1" y2="101" style="stroke:var(--red);stroke-width:2.6;stroke-dasharray:5 4"/>'+rplbl(430,72,'down','--red');rpMount('rpd',[
  {glow:rpg('pc','--violet')+rpg('r1','--violet')+rpg('r2','--violet')+rpg('r3','--violet')+rpg('r4','--violet')+rpg('srv','--violet'),dyn:RP_HL_FAST+RP_PKT_FAST,cap:'<b>EIGRP</b>, like OSPF, picks the <b>fast</b> path (composite metric). On top of that it keeps a <b>backup</b> route pre-computed.'},
  {glow:rpg('r3','--red')+rpg('r4','--red'),dyn:down,cap:'The fast link <b>fails</b>. Thanks to the <b>feasible successor</b>, EIGRP already has the backup computed – it doesn’t wait to recompute the whole map.'},
  {glow:rpg('pc','--violet')+rpg('r1','--violet')+rpg('r4','--violet')+rpg('srv','--violet'),dyn:down+RP_HL_SLOW+RP_PKT_SLOW,cap:'The switch is <b>almost instant</b> onto the backup (direct) path. And since EIGRP has <b>AD 90</b>, next to OSPF (110) it would win.'}
]);}
// L?M5 — IS-IS + BGP
function renderRpBgp(){return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'<b>IS-IS</b> is link-state like OSPF (also Dijkstra, also cost) but runs directly on <b>L2</b> and is popular on <b>ISP backbones</b> – it scales very well. Think of it as "the providers’ OSPF". <b>BGP</b> is a different league – <b>between autonomous systems (AS)</b>, it’s the <b>internet’s protocol</b>. It doesn’t pick by speed but by <b>policy</b> (AS-path length = how many carriers the path crosses, preferences, business relationships between carriers). Slow but stable; it holds the <b>whole global routing table</b>. In the simulator you won’t see it as a choice on a LAN router – it belongs at the <b>internet edge</b> (a border router "speaks BGP to the ISP").'+'</p>'
  +'<div class="osi-stage"><svg id="rpesvg" viewBox="0 0 600 180" width="100%" style="display:block">'
    +'<line x1="60" y1="100" x2="146" y2="100" style="stroke:var(--line2);stroke-width:1.6"/>'
    +'<line x1="174" y1="100" x2="306" y2="100" style="stroke:var(--line2);stroke-width:1.6"/>'
    +'<line x1="334" y1="100" x2="498" y2="100" style="stroke:var(--line2);stroke-width:1.6"/>'
    +'<g><rect x="272" y="140" width="96" height="16" rx="4" style="fill:var(--violet);fill-opacity:.14;stroke:var(--violet);stroke-width:1"/><text x="320" y="152" text-anchor="middle" style="font:700 7.5px var(--mono);fill:var(--violet)">BGP → ISP</text></g>'
    +'<g><rect x="452" y="140" width="120" height="16" rx="4" style="fill:var(--cyan);fill-opacity:.12;stroke:var(--cyan);stroke-width:1"/><text x="512" y="152" text-anchor="middle" style="font:700 7px var(--mono);fill:var(--cyan)">'+esc('IS-IS (ISP backbone)')+'</text></g>'
    +'<g id="rpeglow"></g>'
    +csDev(160,100,'router','R-LAN')+csDev(320,100,'router','R-EDGE')
    +csHost(44,100,'desktop','--blue','PC')+csHost(512,100,'internet','--cyan','Internet')
    +'<g id="rpedyn"></g></svg></div>'
  +'<div class="m1-cap" id="rpecap"></div>'+courseStepControls('rpe')
  +abbrBox([['BGP','Border Gateway Protocol – routes between AS by policy; the internet’s protocol, AD (eBGP) 20.'],['IS-IS','link-state like OSPF (Dijkstra, cost), runs on L2; popular on ISP backbones.'],['AS','autonomous system – one carrier’s network with its own policy; BGP routes between them.']]);}
function mountRpBgp(){function show(i){var g=$('rpeglow'),d=$('rpedyn'),c=$('rpecap');var S=[
  {glow:rpg2(44,100,'--green')+rpg2(160,100,'--green'),dyn:'',cap:'Inside the company the routing runs, say, <b>OSPF</b> (R-LAN). But how does a packet reach the <b>internet</b>?'},
  {glow:rpg2(320,100,'--violet')+rpg2(512,100,'--cyan'),dyn:'<line x1="334" y1="100" x2="498" y2="100" style="stroke:var(--violet);stroke-width:3.5;opacity:.7"/>',cap:'At the <b>edge</b>, R-EDGE talks to the provider via <b>BGP</b> – the protocol <b>between carriers</b>. It picks by <b>policy</b>, not speed.'},
  {glow:rpg2(44,100,'--cyan')+rpg2(160,100,'--cyan')+rpg2(320,100,'--cyan')+rpg2(512,100,'--cyan'),dyn:csPkt('M60 100 L160 100 L320 100 L512 100','--cyan'),cap:'Traffic to unknown targets goes out the <b>default route</b> – in the path test you’ll see "<b>via eBGP (AD 20)</b>". The ISP backbone often runs <b>IS-IS</b>.'}
];g.innerHTML=S[i].glow||'';d.innerHTML=S[i].dyn||'';c.innerHTML='<span>'+S[i].cap+'</span>';}
  courseStepper('rpe',3,show);}
function rpg2(x,y,color){return csGlow(x,y,color,22);}
// L?M6 — administrative distance
function renderRpAd(){var rows=[['connected','0','--green'],['static','1','--green'],['eBGP','20','--violet'],['EIGRP','90','--violet'],['OSPF','110','--cyan'],['IS-IS','115','--cyan'],['RIP','120','--amber']];
  var y0=34,rh=17;
  var tbl=rows.map(function(r,i){var y=y0+i*rh;return '<rect x="150" y="'+(y-12)+'" width="300" height="15" rx="3" style="fill:var('+r[2]+');fill-opacity:.10;stroke:var('+r[2]+');stroke-width:.8"/>'
    +'<text x="162" y="'+(y-1)+'" style="font:700 8.5px var(--sans);fill:var('+r[2]+')">'+esc(r[0])+'</text>'
    +'<text x="438" y="'+(y-1)+'" text-anchor="end" style="font:800 9px var(--mono);fill:var('+r[2]+')">AD '+r[1]+'</text>';}).join('');
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'What if a router has a route to the <b>same network</b> from <b>several sources</b>? <b>Administrative distance</b> decides – the <b>lower, the more trusted</b>. Order: connected 0 · static 1 · eBGP 20 · EIGRP 90 · OSPF 110 · IS-IS 115 · RIP 120. So if a router runs <b>both OSPF and RIP</b>, <b>OSPF</b> wins (110 &lt; 120). Where do those numbers come from? They are neither a physical constant nor a standard – it is a <b>vendor convention</b> (Cisco introduced the order and others adopted it) and an admin can <b>override</b> them on their own router. That is why AD is a <b>local decision of a single router</b>, not a protocol metric: the neighbor next door may have the order set differently.'+'</p>'
   +'<div class="osi-stage"><svg id="rpfsvg" viewBox="0 0 600 165" width="100%" style="display:block">'+tbl+'<g id="rpfhl"></g></svg></div>'
   +'<div class="m1-cap" id="rpfcap"></div>'+courseStepControls('rpf')
   +abbrBox([['administrative distance (AD)','the trustworthiness of a route source; lower wins. The metric picks a path WITHIN one protocol, AD picks which SOURCE to trust.']]);}
function mountRpAd(){function show(i){var hl=$('rpfhl'),c=$('rpfcap');var S=[
  {hl:'',cap:'Every route <b>source</b> has its <b>AD</b>. A connected network (0) and a static route (1) always beat dynamic routing.'},
  {hl:'<rect x="147" y="90" width="306" height="16" rx="3" style="fill:none;stroke:var(--cyan);stroke-width:2"/><rect x="147" y="124" width="306" height="16" rx="3" style="fill:none;stroke:var(--amber);stroke-width:2"/>',cap:'Both <b>OSPF (110)</b> and <b>RIP (120)</b> run and both know a route to the same network. Who wins?'},
  {hl:'<rect x="147" y="90" width="306" height="16" rx="3" style="fill:var(--cyan);fill-opacity:.18;stroke:var(--cyan);stroke-width:2.4"/><text x="300" y="158" text-anchor="middle" style="font:800 9px var(--sans);fill:var(--cyan)">'+esc('OSPF wins: 110 < 120')+'</text>',cap:'<b>OSPF</b> – it has the <b>lower AD</b> (110 &lt; 120), so it’s more trusted. The RIP route doesn’t even make it into the table. And that wraps up the routing course: the network can find a path anywhere. But for now <b>anyone</b> can use that path – guarding and filtering that traffic is <b>the network security course</b>.'}
];hl.innerHTML=S[i].hl||'';c.innerHTML='<span>'+S[i].cap+'</span>';}
  courseStepper('rpf',3,show);}
const COURSE_4_DEF = {
  id:'course4',
title:'Routing and IP addresses',
  blurb:'How a router picks a path: the routing table and longest-prefix, default and static routes, NAT/PAT — and then further: why static isn’t enough, how routers learn routes on their own (RIP vs OSPF), metrics, convergence and administrative distance.',
  lessons:[
    { id:'c4l1', title:'Why networks need a map', taskId:null, quizId:'c4q_l1', modules:[
      { id:'c4l1m1', title:'A packet at the crossroads', render:renderC4Crossroads, mount:mountC4Crossroads },
      { id:'c4l1m2', title:'The router as a junction', render:renderC4RouterJunction, mount:mountC4RouterJunction },
      { id:'c4l1m3', title:'The routing table', render:renderC4RoutingTable, mount:mountC4RoutingTable }
    ]},
    { id:'c4l2', title:'The default route', taskId:'def-route', quizId:'c4q_l2', modules:[
      { id:'c4l2m1', title:'You can’t know the whole world', render:renderC4DefaultWhy, mount:mountC4DefaultWhy },
      { id:'c4l2m2', title:'The default route = the way out', render:renderC4DefaultRoute, mount:mountC4DefaultRoute },
      { id:'c4l2m3', title:'The default gateway at home', render:renderC4DefaultGw, mount:mountC4DefaultGw }
    ]},
    { id:'c4l3', title:'Static routes', taskId:'static-route', quizId:'c4q_l3', modules:[
      { id:'c4l3m1', title:'When a static route', render:renderC4StaticWhy, mount:mountC4StaticWhy },
      { id:'c4l3m2', title:'What it looks like', render:renderC4StaticHow, mount:mountC4StaticHow },
      { id:'c4l3m3', title:'Floating static (backup)', render:renderC4FloatingStatic, mount:mountC4FloatingStatic },
      { id:'c4l3m4', title:'Where static falls short', render:renderC4StaticLimit, mount:mountC4StaticLimit }
    ]},
    { id:'c4l4', title:'NAT and PAT', taskId:'nat-lab', quizId:'c4q_l4', modules:[
      { id:'c4l4m1', title:'Why NAT', render:renderC4NatWhy, mount:mountC4NatWhy },
      { id:'c4l4m2', title:'PAT: one IP for everyone', render:renderC4Pat, mount:mountC4Pat },
      { id:'c4l4m3', title:'Port forwarding (DNAT)', render:renderC4PortForward, mount:mountC4PortForward },
      { id:'c4l4m4', title:'Hairpin NAT', render:renderC4Hairpin, mount:mountC4Hairpin }
    ]},
    { id:'c4l5', title:'When a router isn’t enough', taskId:null, quizId:'c4q_l5', modules:[
      { id:'c4l5m1', title:'A company with many branches (WAN)', render:renderC4Wan, mount:mountC4Wan },
      { id:'c4l5m2', title:'A WAN link fails', render:renderC4WanFail, mount:mountC4WanFail },
      { id:'c4l5m3', title:'What we would want', render:renderC4Wishlist, mount:mountC4Wishlist }
    ]},
    { id:'c4l6', title:'How routers share maps', taskId:null, quizId:'c4q_l6', modules:[
      { id:'c4l6m1', title:'Routers talk to each other', render:renderC4RoutersTalk, mount:mountC4RoutersTalk },
      { id:'c4l6m2', title:'Distance-vector vs link-state', render:renderC4DvVsLs, mount:mountC4DvVsLs },
      { id:'c4l6m3', title:'Hello and adjacency', render:renderC4HelloNeighbor, mount:mountC4HelloNeighbor },
      { id:'c4l6m4', title:'Metric: the best path', render:renderC4Metric, mount:mountC4Metric }
    ]},
    { id:'c4l7', title:'Inside OSPF', taskId:'ospf-cost', quizId:'c4q_l7', modules:[
      { id:'c4l7m1', title:'Same map, own computation', render:renderC4Lsdb, mount:mountC4Lsdb },
      { id:'c4l7m3', title:'Cost: how it’s computed', render:renderC4OspfCost, mount:mountC4OspfCost },
      { id:'c4l7m6', title:'What’s under the hood → <i>OSPF in depth</i>', render:renderC4OspfBridge }
    ]},
    { id:'c4l8', title:'Convergence', taskId:null, quizId:'c4q_l8', modules:[
      { id:'c4l8m1', title:'What convergence is', render:renderC4Convergence, mount:mountC4Convergence },
      { id:'c4l8m2', title:'How fast', render:renderC4ConvSpeed }
    ]},
    { id:'c4l9', title:'Protocols in the company network', taskId:null, quizId:'c4q_l9', modules:[
      { id:'c4l9m1', title:'How a router learns routes', render:renderRpIntro, mount:mountRpIntro },
      { id:'c4l9m2', title:'RIP — counting hops', render:renderRpRip, mount:mountRpRip },
      { id:'c4l9m3', title:'OSPF — the cheapest path', render:renderRpOspf, mount:mountRpOspf },
      { id:'c4l9m4', title:'EIGRP — a composite metric', render:renderRpEigrp, mount:mountRpEigrp }
    ]},
    { id:'c4l10', title:'The internet and who wins', taskId:null, quizId:'c4q_l10', modules:[
      { id:'c4l9m5', title:'IS-IS and BGP — backbones and the internet', render:renderRpBgp, mount:mountRpBgp },
      { id:'c4l9m6', title:'Which one wins? Administrative distance', render:renderRpAd, mount:mountRpAd }
    ]}
  ]
};
const COURSE_4_QUIZZES_DEF = {
  c4q_l9:{ title:'Protocols in the company network', qs:[
    { q:'How does RIP pick a path?',
      opts:['by hop count (how many routers to the destination)','by the link speed along the route (lowest cost)','by bandwidth and delay combined together'],
      correct:0, why:'RIP is distance-vector with hop count as its metric; it ignores link speed. So it can pick a slow but "shorter" path.' },
    { q:'What is RIP’s signature limitation?',
      opts:['max 15 hops – 16 means unreachable','max 15 routers allowed to be connected in a single VLAN','max 15 static routes per router'],
      correct:0, why:'RIP treats 16 as "infinity". A destination more than 15 hops away is unreachable for RIP – which is why it only fits small networks.' },
    { q:'OSPF picks a path by…',
      opts:['lowest total cost (Dijkstra over a map of the network)','the fewest hops on the route between the routers','the alphabetical order of absolutely all the router names on the path'],
      correct:0, why:'OSPF is link-state: every router knows the full map and uses Dijkstra to find the cheapest path. A longer route over fast links can win.' },
    { q:'What is typical of EIGRP?',
      opts:['a composite metric (bandwidth + delay) and fast convergence via a backup route','it counts only the number of hops, exactly like the older RIP protocol does','it was a vendor-neutral open standard right from the very beginning, tied to no maker'],
      correct:0, why:'EIGRP (Cisco) uses a composite metric and keeps a feasible successor = a pre-computed backup route, so it switches almost instantly on a failure.' }
  ]},
  c4q_l10:{ title:'The internet and who wins', qs:[
    { q:'How is BGP fundamentally different from OSPF/RIP?',
      opts:['it routes between autonomous systems by policy – it’s the internet’s protocol','it’s just a somewhat faster and more modern OSPF meant for one single company','it’s a Layer-2 protocol that neighboring switches use to talk to one another'],
      correct:0, why:'BGP is an EGP – it runs between autonomous systems (carriers) and decides by policy (AS-path, preferences), not by speed. It holds the internet’s global table.' },
    { q:'A router runs both OSPF and RIP and both know a route to the same network. Which is used?',
      opts:['OSPF – it has the lower administrative distance (110 < 120)','RIP – it’s simpler and older, so it takes priority here','both at once, and the traffic splits fifty-fifty between them'],
      correct:0, why:'When a router has a route from several sources, administrative distance decides – lower = more trusted. OSPF 110 < RIP 120, so OSPF wins.' }
  ]},
  c4q_l1:{ title:'Quiz: Why networks need a map', qs:[
    { q:'What does a router use to decide where to send a packet next?',
      opts:['the destination IP address and its routing table','the source MAC address and its ARP table','the shortest physical cable to the destination'],
      correct:0, why:'A router (L3) looks at the destination IP, finds the matching network in its routing table and sends the packet to the right next hop.' },
    { q:'What is the <b>default route</b> 0.0.0.0/0?',
      opts:['the route for all traffic that doesn’t match a more specific row','the router\'s public IP address on the interface toward the internet provider','a rule that drops traffic to unknown networks'],
      correct:0, why:'The default route catches everything else – usually to the internet. Thanks to it the router needn’t know every network in the world.' },
    { q:'A packet’s destination matches both 10.3.0.0/16 and 0.0.0.0/0. Where does it go?',
      opts:['by the longest mask → 10.3.0.0/16 (the more specific wins)','by 0.0.0.0/0 – the default route always takes precedence','split evenly across both paths (load balancing)'],
      correct:0, why:'Longest-prefix match: of all matching rows the one with the longest (most specific) mask wins. /16 is more specific than /0.' }
  ]},
  c4q_l2:{ title:'Quiz: The default route', qs:[
    { q:'Why can’t a router have a row for every network on the internet?',
      opts:['there are nearly a million – impossible to store and maintain','the networks on the internet change far too fast to ever write down','a router only knows directly connected networks'],
      correct:0, why:'The internet has hundreds of thousands to millions of networks. Instead of a row for each, one default route handles "everything else".' },
    { q:'What does the row <b>0.0.0.0/0</b> mean in a routing table?',
      opts:['the default route – where to send anything that doesn’t match','a rule to block traffic to all networks outside your own company','the default IP the router gets from the ISP'],
      correct:0, why:'0.0.0.0/0 is the default route (gateway of last resort) – usually to the provider, serving all unknown destinations.' },
    { q:'What is your PC’s <b>default gateway</b>?',
      opts:['the router IP the PC sends off-local traffic to','the DNS server address that resolves names to IPs','the public IP the whole internet sees you under'],
      correct:0, why:'A PC knows only its local network; everything else goes to the default gateway = its router. It’s the default route from an end device’s view.' }
  ]},
  c4q_l3:{ title:'Quiz: Static routes', qs:[
    { q:'What is a <b>static route</b>?',
      opts:['a route entered by hand by the admin (destination → next hop)','a route the router computes itself from traffic','a route the router exchanges automatically with its neighboring routers'],
      correct:0, why:'A static route is entered by hand and doesn’t change on its own. Good when there are few networks and a stable topology.' },
    { q:'What does a static route consist of?',
      opts:['destination network + mask + next hop (where next)','the destination IP and the target service port','the neighbor’s MAC and the interface number'],
      correct:0, why:'"To this network (with this mask) go via this neighbor." Instead of a next hop you can give an exit interface.' },
    { q:'What is a <b>floating static</b> route for?',
      opts:['a backup with a worse cost – it kicks in when the primary fails','splits traffic over two paths for more speed','a temporary route that automatically expires after a few minutes of inactivity'],
      correct:0, why:'A floating static has a higher administrative distance, so it waits in the background and activates only after the primary fails. Manual redundancy.' },
    { q:'Why aren’t static routes enough in a large, changing network?',
      opts:['they’d need writing by hand and don’t notice a link failure','they forward packets noticeably slower than dynamically learned routes','they take more router memory than dynamic routes'],
      correct:0, why:'With many routers manual upkeep is unbearable and a static route keeps pointing into nothing after a failure. Hence dynamic routing.' }
  ]},
  c4q_l4:{ title:'Quiz: NAT and PAT', qs:[
    { q:'What is <b>NAT</b> for?',
      opts:['translates private addresses to one public IP so the whole network goes out','it encrypts all outgoing traffic so the internet provider cannot eavesdrop on it','automatically assigns devices on the network their private IPs'],
      correct:0, why:'Private addresses aren’t routable on the internet. NAT rewrites them to the router’s public IP on the way out and translates replies back.' },
    { q:'How does <b>PAT</b> tell apart several devices behind one public IP?',
      opts:['by port – each connection gets a unique port, recorded in the NAT table','by each device’s MAC address, which it stores in the NAT table','by the private IP address, which it leaves unchanged in the packet header'],
      correct:0, why:'PAT (NAT overload) assigns each outbound connection a unique source port. By the port it sorts replies back to the right device.' },
    { q:'You want to expose an internal web server to the internet. What do you set up?',
      opts:['port forwarding (DNAT): incoming public IP:port → internal server:port','give the server a public IP and expose it straight to the internet without NAT','open a port on the server and wait for the router to link it'],
      correct:0, why:'Port forwarding (DNAT) redirects a specific inbound connection to the internal server. You don’t give the server a public IP – public addresses are scarce and a server exposed straight to the internet is needlessly at risk; the rest of the network stays hidden behind NAT.' },
    { q:'What is <b>hairpin NAT</b> (NAT loopback)?',
      opts:['reaching your own public IP from inside – the router turns it back in','a NAT that rewrites the whole packet content besides the address','translation that hides public servers behind one private IP'],
      correct:0, why:'When you target your own server’s public IP from inside, the router sees it’s its own and "turns" the traffic back in. Sometimes it must be enabled explicitly.' }
  ]},
  c4q_l5:{ title:'Quiz: When a router isn’t enough', qs:[
    { q:'Why don’t static routes suffice for a company with many branches (WAN)?',
      opts:['every router would need manual routes to all networks – unmanageable','WAN links tend to be far too slow for static routes to ever keep up with','branches use private IPs, which a static route can’t handle'],
      correct:0, why:'The number of needed routes grows fast with branches and every change means hand-editing many routers. It can’t be sustained.' },
    { q:'What happens to a static route when a WAN link fails?',
      opts:['it keeps pointing at the dead link – traffic vanishes until a manual switch','the router automatically reroutes it by itself to the nearest working backup link','after seconds it deletes itself and the router rebuilds it'],
      correct:0, why:'Static doesn’t react to a failure. Even if a backup path exists, it won’t use it by itself. We want automatic failover.' },
    { q:'What do we want from routers in a large network (and what dynamic routing does)?',
      opts:['to learn networks themselves, pick the best path and recompute on failure','to have as many ports as possible so they can handle more simultaneously connected networks','to encrypt traffic and protect it from eavesdropping on the WAN'],
      correct:0, why:'These are the three wishes a dynamic routing protocol grants: learning routes, choosing the best and automatic convergence after a change.' }
  ]},
  c4q_l6:{ title:'Quiz: How routers share maps', qs:[
    { q:'How does the core of dynamic routing work?',
      opts:['routers tell each other what networks they know and spread the info','each router asks a DNS server where the target network is','the admin uploads the routes once at installation and they never change again'],
      correct:0, why:'Routers exchange route info with neighbors and pass it on, so the map spreads across the whole network automatically.' },
    { q:'What’s the difference between <b>distance-vector</b> and <b>link-state</b>?',
      opts:['distance-vector trusts a neighbor’s \'how far\'; link-state builds the full map and computes itself','distance-vector always finds the fastest path, link-state only the one with the fewest hops','they differ only in name, the principle is exactly the same'],
      correct:0, why:'Distance-vector (RIP) shares only second-hand distances; link-state (OSPF) shares links, each has the full map and computes the best path itself.' },
    { q:'What are <b>Hello</b> packets for?',
      opts:['to find and keep neighbors; when they stop, a failure is detected','to carry the actual user data between neighboring routers as fast as possible','to assign neighboring routers their IP addresses'],
      correct:0, why:'Hello packets form adjacencies and act as a heartbeat. When Hellos stop, the other side detects the failure and recomputes routes.' },
    { q:'Why is a metric by <b>link speed</b> (OSPF cost) better than counting hops (RIP)?',
      opts:['it picks the genuinely faster path, even with more hops over fast links','it always picks the path with the absolute fewest routers to the target','it uses less memory and fewer IPs on the routers'],
      correct:0, why:'Hop count blindly counts routers and may send traffic over a slow link. OSPF cost accounts for speed and picks the genuinely better path.' }
  ]},
  c4q_l7:{ title:'Quiz: Inside OSPF', qs:[
    { q:'What is the <b>LSDB</b> in OSPF?',
      opts:['the complete network map (LSAs), identical on every router','a list of neighbors the router establishes adjacency with','a table where the router remembers address translations'],
      correct:0, why:'Routers exchange LSAs (descriptions of their links) and assemble them into a Link-State Database = the same map of the whole network.' },
    { q:'What does a router do with the LSDB using <b>Dijkstra (SPF)</b>?',
      opts:['computes the cheapest path from itself to every network (a shortest-path tree)','deletes all old routes and waits for neighbors to send the current map','sends its map to its neighbors so they have it too'],
      correct:0, why:'Each router puts itself at the root and uses Dijkstra to find the cheapest paths to all destinations. From that tree it fills the routing table.' },
    { q:'How does OSPF determine a link’s <b>cost</b>?',
      opts:['by speed – fast link = low cost; path cost = sum of link costs','by the number of routers on the path – more means higher cost','by the cable’s physical length – a longer cable = higher cost'],
      correct:0, why:'Cost ≈ reference bandwidth ÷ link speed. OSPF sums the costs along a path and picks the lowest total – hence it prefers fast links.' },
    { q:'What does the OSPF principle of <b>“same map, own computation”</b> mean?',
      opts:['everyone holds the same network map (LSDB), each computes its cheapest paths itself','each router draws the map its own way and takes ready-made paths from its neighbors','one central router computes the map and all the paths and sends them out to the others'],
      correct:0, why:'By exchanging link information everyone ends up with an identical LSDB. But no one hands out paths from it – each router computes them itself with Dijkstra.' }
  ]},
  c4q_l8:{ title:'Quiz: Convergence', qs:[
    { q:'What does it mean that a network is <b>converged</b>?',
      opts:['all routers agree on the current map and the best paths','all links run at full speed and no packet is lost','every router has exactly one route to each destination'],
      correct:0, why:'After a change routers flood an update, recompute and re-agree. That settling is called convergence.' },
    { q:'Which phase of convergence typically takes the <b>longest</b>?',
      opts:['realizing a neighbor has failed and the old path is gone','recomputing the cheapest paths from the current map','spreading the news of the change to all the routers'],
      correct:0, why:'Spreading the change and recomputing take fractions of a second. The longest part is noticing a neighbor has gone silent – tuning that detection is covered in the OSPF in depth course.' },
    { q:'What happens when a <b>link fails</b> in an OSPF network?',
      opts:['the router notices, floods an update and everyone recomputes their paths','nothing happens at all until an admin repairs the failure by hand','every router in the network reboots and rebuilds the map from scratch'],
      correct:0, why:'The failure triggers a map update, each router recomputes its cheapest paths and traffic flows another way – within seconds and with no human.' }
  ]}
};
const COURSE_4_FINAL_EXTRA_DEF=[{ q:'A router has routes 0.0.0.0/0, 10.0.0.0/8 and 10.0.5.0/24. Where does it send a packet to 10.0.5.10?', opts:['via 10.0.5.0/24 – the longest (most specific) prefix wins','via the default 0.0.0.0/0, because a default always takes precedence','it spreads it evenly across all three matching routes'], correct:0, why:'A router picks by longest prefix match: /24 is more specific than /8 or the default /0, so it wins – not the default.' },{ q:'The main link has a static route, the backup a "floating static" with a worse cost. What happens when the main fails?', opts:['the backup floating static (worse cost) kicks in and traffic flows over it','traffic drops into a dead end until someone manually reroutes to the backup','the two routes merge and traffic is split evenly between them'], correct:0, why:'A floating static has a worse cost, so it sits idle. When the main route leaves the table, the backup activates by itself – unlike a plain static, which would just lose the traffic.' },{ q:'A PC behind the router can’t reach the internet. Which two things must be right on the router?', opts:['a default route out (where to send the unknown) and NAT to a public IP','just a noticeably faster, higher-quality link to the internet provider','it’s enough that the edge router has its Wi-Fi switched on and broadcasting'], correct:0, why:'To reach the internet you need both: a default route (0.0.0.0/0) for traffic to unknown networks, and NAT to translate the private address to a public one. Missing either and you’re stuck.' }];
__regCourse(4,COURSE_4_DEF,COURSE_4_QUIZZES_DEF,COURSE_4_FINAL_EXTRA_DEF);
