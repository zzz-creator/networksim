/* course7.js — Course 7 content (split out of course.js; loaded on demand via course-core.js) */
/* ============================================================
   COURSE 7 — OSPF in depth (dynamic routing). Shared scene c7Net (4 routers in a diamond + LAN A/B).
   ============================================================ */
function c7Net(pfx,h){
  return '<svg id="'+pfx+'svg" viewBox="0 0 600 '+(h||200)+'" width="100%" style="display:block">'
    +'<line x1="124" y1="93" x2="276" y2="55" style="stroke:var(--line2);stroke-width:1.8"/>'
    +'<line x1="304" y1="55" x2="456" y2="93" style="stroke:var(--line2);stroke-width:1.8"/>'
    +'<line x1="124" y1="107" x2="276" y2="145" style="stroke:var(--line2);stroke-width:1.8"/>'
    +'<line x1="304" y1="145" x2="456" y2="107" style="stroke:var(--line2);stroke-width:1.8"/>'
    +'<line x1="60" y1="100" x2="96" y2="100" style="stroke:var(--line2);stroke-width:1.4"/>'
    +'<line x1="484" y1="100" x2="526" y2="100" style="stroke:var(--line2);stroke-width:1.4"/>'
    +'<g id="'+pfx+'glow"></g>'
    +csDev(110,100,'router','R1')+csDev(290,48,'router','R2')+csDev(290,152,'router','R3')+csDev(470,100,'router','R4')
    +csHost(44,100,'desktop','--blue','PC')+csHost(540,100,'server','--green','SRV')
    +'<g id="'+pfx+'dyn"></g></svg>';
}
function c7P(pfx,intro,terms,h){
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+intro+'</p>'
    +'<div class="osi-stage">'+c7Net(pfx,h)+'</div>'
    +'<div class="m1-cap" id="'+pfx+'cap"></div>'
    +courseStepControls(pfx)+abbrBox(terms);
}
function c7Mount(pfx,STEPS){
  function show(i){const g=$(pfx+'glow');if(g)g.innerHTML=STEPS[i].glow||'';const d=$(pfx+'dyn');if(d)d.innerHTML=STEPS[i].dyn||'';const c=$(pfx+'cap');if(c)c.innerHTML='<span>'+STEPS[i].cap+'</span>';}
  courseStepper(pfx,STEPS.length,show);
}
var C7R={r1:[110,100],r2:[290,48],r3:[290,152],r4:[470,100]};
function c7g(name,color){var p=C7R[name];return csGlow(p[0],p[1],color,22);}
function c7all(color){return c7g('r1',color)+c7g('r2',color)+c7g('r3',color)+c7g('r4',color);}
function c7lbl(x,y,tx,c){return '<text x="'+x+'" y="'+y+'" text-anchor="middle" style="font:700 7.5px var(--mono);fill:var('+c+')">'+esc(tx)+'</text>';}
// highlighted path R1-R2-R4 (upper) or R1-R3-R4 (lower)
var C7PATH_TOP='<line x1="124" y1="93" x2="276" y2="55" style="stroke:var(--green);stroke-width:3;opacity:.75"/><line x1="304" y1="55" x2="456" y2="93" style="stroke:var(--green);stroke-width:3;opacity:.75"/>';
var C7PATH_BOT='<line x1="124" y1="107" x2="276" y2="145" style="stroke:var(--green);stroke-width:3;opacity:.75"/><line x1="304" y1="145" x2="456" y2="107" style="stroke:var(--green);stroke-width:3;opacity:.75"/>';
// L1M1 — manual routes can't keep up
function renderC7WhyDynamic(){return c7P('c7a',
  'In the Routing and IP addresses course you set routes <b>by hand</b> (static routes). Great for a few networks – but what if you have <b>dozens of routers and hundreds of networks</b>? On <b>every</b> router you’d have to maintain a route to <b>every</b> network by hand, and rewrite it everywhere on each change. That’s unmaintainable and error-prone. Hence <b>dynamic routing</b>: routers <b>tell each other</b> which networks they know and <b>together</b> compute the best paths. The most common interior protocol is <b>OSPF</b> – you know its principle from the Routing and IP addresses course, now we’ll look <b>under the hood</b>.',
  [['OSPF','Open Shortest Path First – a dynamic link-state protocol; routers share a map of the network and compute shortest paths.'],['static route','a route entered by hand; doesn’t scale and doesn’t self-heal after a failure.']]);}
function mountC7WhyDynamic(){c7Mount('c7a',[
  {glow:c7all('--cyan'),dyn:'',cap:'A network with four routers and two LANs. Imagine there are <b>dozens</b>.'},
  {glow:c7all('--red'),dyn:c7lbl(290,108,'by hand on EVERY router?!','--red'),cap:'With static routes you’d have to describe a route to <b>every</b> network by hand on <b>every</b> router. A nightmare.'},
  {glow:c7all('--green'),dyn:c7lbl(290,108,'OSPF: routers sort it out themselves','--green'),cap:'<b>OSPF</b> does it automatically: routers exchange information and compute the best paths themselves. How? That’s this whole course.'}
]);}
// L1M2 — a failure = a manual fix
function renderC7StaticFail(){return c7P('c7b',
  'The second problem with static routing: it <b>doesn’t survive failures</b>. When a link on the main path goes down, the static route <b>doesn’t know</b> – packets keep heading into a dead end until you rewrite it <b>by hand</b>. There’s a "floating static" backup, but it’s a crutch. A <b>dynamic protocol detects</b> the failure <b>within seconds</b>, recomputes and sends traffic <b>another way</b> – by itself. That’s called <b>convergence</b>.',
  [['convergence','after a topology change routers re-agree on the current best paths.'],['floating static','a backup static route with a worse metric; better than nothing, but doesn’t scale.']]);}
function mountC7StaticFail(){var down='<line x1="124" y1="93" x2="276" y2="55" style="stroke:var(--red);stroke-width:2.4;stroke-dasharray:5 4"/>'+c7lbl(195,66,'down','--red');c7Mount('c7b',[
  {glow:c7g('r1','--green')+c7g('r2','--green')+c7g('r4','--green'),dyn:C7PATH_TOP,cap:'Traffic flows the top path R1→R2→R4. All good.'},
  {glow:c7g('r1','--red')+c7g('r4','--red'),dyn:down,cap:'The R1–R2 link <b>fails</b>. The static route doesn’t know → packets drop into the void until someone fixes it by hand.'},
  {glow:c7g('r1','--green')+c7g('r3','--green')+c7g('r4','--green'),dyn:down+C7PATH_BOT,cap:'With <b>OSPF</b> traffic would <b>reroute itself</b> the bottom path R1→R3→R4 within seconds. That’s the power of dynamic routing.'}
]);}
// L1M3 — the idea of OSPF
function renderC7Idea(){return c7P('c7c',
  'How does OSPF do it? You know the principle from the Routing and IP addresses course – here we’ll take it apart in depth, in three steps we’ll cover in the next lessons: <b>(1)</b> routers <b>find</b> each other and become neighbors. <b>(2)</b> Each <b>tells the others what it sees</b> (its links and networks) – so everyone ends up with the <b>same map</b> of the network (the LSDB). <b>(3)</b> From that map each router computes the <b>shortest paths</b> to all networks (Dijkstra’s algorithm). That’s why "link-state": everyone knows the <b>state of all links</b>, not just what a neighbor said.',
  [['link-state','every router knows the state of ALL links in the area and computes paths itself – unlike distance-vector.'],['LSDB','Link-State Database – the shared map of the network; after convergence all routers in the area hold the same one.']]);}
function mountC7Idea(){c7Mount('c7c',[
  {glow:c7all('--cyan'),dyn:c7lbl(290,108,'1) '+'find each other (neighbors)','--cyan'),cap:'<b>Step 1:</b> routers discover each other and become <b>neighbors</b> (lesson 2).'},
  {glow:c7all('--violet'),dyn:c7lbl(290,108,'2) '+'share the map (LSDB)','--violet'),cap:'<b>Step 2:</b> each tells what it sees; everyone gets the <b>same map</b> (lesson 3).'},
  {glow:c7all('--green'),dyn:C7PATH_TOP+c7lbl(290,108,'3) '+'compute shortest paths','--green'),cap:'<b>Step 3:</b> from the map each computes the <b>shortest paths</b> (Dijkstra, lesson 4). Let’s go step by step.'}
]);}
// L2M1 — Hello
function renderC7Hello(){return c7P('c7d',
  'Before routers share anything, they must <b>find</b> each other. On each OSPF interface they send small <b>Hello packets</b> (multicast to 224.0.0.5 – an address for a group of receivers, not everyone like broadcast nor one like unicast) – like "hi, I’m router R1, I’m here". When two routers on the same link see each other’s Hellos and <b>agree</b> on the basic parameters (area, masks, timers…), they recognize each other as <b>neighbors</b>. Hellos keep flowing periodically – they also act as a <b>heartbeat</b>: when they stop, the neighbor is considered <b>dead</b>.',
  [['Hello','a periodic packet by which OSPF routers discover each other and check the neighbor is alive (heartbeat).'],['neighbor','a router on the same link I exchange Hellos with and agree on parameters.']]);}
function mountC7Hello(){var hp=function(p1,p2){return '<rect x="-5" y="-4" width="10" height="8" rx="2" style="fill:var(--cyan)"><animateMotion path="M '+p1+' L '+p2+'" dur="1.2s" repeatCount="indefinite"/></rect>';};c7Mount('c7d',[
  {glow:c7g('r1','--cyan')+c7g('r2','--cyan')+c7g('r3','--cyan'),dyn:hp('110 100','290 48')+hp('110 100','290 152'),cap:'R1 sends <b>Hello</b> on all interfaces: "I’m here, I’m in area 0…".'},
  {glow:c7all('--cyan'),dyn:hp('290 48','110 100')+hp('290 152','110 100')+hp('290 48','470 100')+hp('290 152','470 100'),cap:'Neighbors reply with their own Hellos. If parameters <b>match</b>, they accept each other as <b>neighbors</b>.'},
  {glow:c7all('--green'),dyn:c7lbl(290,108,'neighbors established','--green'),cap:'Done – the routers know each other. Hello keeps flowing as a <b>heartbeat</b>; when it goes quiet, the neighbor is declared dead (dead interval).'}
]);}
// L2M2 — adjacency
function renderC7Adjacency(){return c7P('c7e',
  'Note the difference: a <b>neighbor</b> ≠ a fully <b>established adjacency</b>. Finding each other via Hello is the first step. To actually <b>exchange the database</b> of links (the LSDB), routers go through several states: from <b>Init</b> and <b>Two-Way</b> (we see each other) through exchanging a database description to <b>Full</b> – fully synchronized. Only in the <b>Full</b> state do both hold the <b>same map</b>. On an ordinary point-to-point link Full forms between both; on a shared network it’s handled smarter (next module).',
  [['adjacency','a fully established relationship between two OSPF routers (state Full) with a synchronized LSDB.'],['Full','the end state: both routers hold the same link database and exchange changes.']],216);}
function mountC7Adjacency(){var bar=function(active){var st=['Down','Init','2-Way','Exchange','Full'];var o='';for(var i=0;i<st.length;i++){var on=i<=active;o+='<text x="'+(70+i*115)+'" y="210" text-anchor="middle" style="font:700 8px var(--mono);fill:var('+(on?(i===4?'--green':'--cyan'):'--muted')+')">'+st[i]+(i<4?' →':'')+'</text>';}return o;};c7Mount('c7e',[
  {glow:c7g('r1','--cyan')+c7g('r2','--cyan'),dyn:bar(2),cap:'After Hello, R1 and R2 are <b>Two-Way</b> – they see each other. But they don’t <b>yet</b> share the map. (The states are shown simplified.)'},
  {glow:c7g('r1','--violet')+c7g('r2','--violet'),dyn:bar(3),cap:'They exchange a <b>database description</b> and fill in what each is missing (Exchange/Loading).'},
  {glow:c7g('r1','--green')+c7g('r2','--green'),dyn:bar(4),cap:'State <b>Full</b>: both hold an <b>identical</b> LSDB. Now they’re a true <b>adjacency</b> and can compute paths.'}
]);}
// L2M3 — DR/BDR
function renderC7DrBdr(){return c7P('c7f',
  'On a <b>shared network</b> (several routers on one switch) every router would form an adjacency with every other – the number of relationships would explode – with n routers it is n×(n−1)/2, so 6 for 4 routers but already 45 for 10. OSPF solves it by electing a <b>DR</b> (Designated Router) and a backup <b>BDR</b>. Everyone forms <b>Full only with the DR/BDR</b>, not among themselves; the DR then distributes changes to the rest. Election is by <b>priority</b> (router ID breaks ties). This keeps a shared network manageable even with many routers. (On a point-to-point link there’s no DR – there are only two; so <b>picture the four routers in the diagram below as sitting on one shared switch</b>, not on separate links.)',
  [['DR','Designated Router – the elected router on a shared network that everyone else forms an adjacency with.'],['BDR','Backup DR – a standby that instantly takes over if the DR fails.']]);}
function mountC7DrBdr(){var crown=function(x,y,tx,c){return '<g><rect x="'+(x-22)+'" y="'+(y-40)+'" width="44" height="15" rx="7" style="fill:var('+c+');fill-opacity:.18;stroke:var('+c+');stroke-width:1.1"/><text x="'+x+'" y="'+(y-29)+'" text-anchor="middle" style="font:700 8px var(--mono);fill:var('+c+')">'+tx+'</text></g>';};c7Mount('c7f',[
  {glow:c7all('--red'),dyn:'<line x1="132" y1="100" x2="448" y2="100" style="stroke:var(--red);stroke-width:1.3;stroke-dasharray:4 3;opacity:.7"/><path d="M 290 70 Q 352 100 290 130" fill="none" style="stroke:var(--red);stroke-width:1.3;stroke-dasharray:4 3;opacity:.7"/>'+c7lbl(290,20,'everyone with everyone = chaos','--red'),cap:'Four routers on <b>one shared network</b> = up to <b>6 relationships</b> (four around the edge plus two across, dashed). With ten routers, 45. Unsustainable.'},
  {glow:c7g('r2','--green')+c7g('r3','--cyan'),dyn:crown(290,48,'DR','--green')+crown(290,152,'BDR','--cyan'),cap:'A <b>DR</b> (and backup <b>BDR</b>) is elected by priority. Here DR = R2, BDR = R3.'},
  {glow:c7all('--green'),dyn:crown(290,48,'DR','--green')+crown(290,152,'BDR','--cyan'),cap:'Everyone forms <b>Full only with the DR and BDR</b>, not among themselves. The DR distributes changes to the rest; the BDR waits as a standby. The shared network stays manageable.'}
]);}
// L3M1 — LSA
function renderC7Lsa(){return c7P('c7g',
  'Now the routers <b>know each other</b> – but still <b>don’t know the whole network</b>. Each only knows its own direct links so far. So it sends an <b>LSA</b> (Link-State Advertisement) = a little note "I, R1, have a link to R2 (cost 10) and to R3 (cost 10) and network LAN-A". An LSA is a <b>piece of the map</b> – it describes only one router’s surroundings. When <b>every</b> router makes such a note, together they form the <b>complete map</b>.',
  [['LSA','Link-State Advertisement – a record of one router’s links and networks; the building block of the map.'],['cost','a link metric by speed (fast = low); OSPF picks the cheapest path by it.']]);}
function mountC7Lsa(){c7Mount('c7g',[
  {glow:c7g('r1','--cyan'),dyn:c7lbl(150,80,'LSA: R1',' --cyan'.trim()),cap:'<b>R1</b> creates its <b>LSA</b>: "I have links to R2 and R3 (cost 10) and network LAN-A".'},
  {glow:c7all('--violet'),dyn:c7lbl(290,108,'each router → its own LSA','--violet'),cap:'Every router does the same – each describes only <b>its</b> surroundings. Four routers = four pieces.'},
  {glow:c7all('--green'),dyn:C7PATH_TOP+C7PATH_BOT,cap:'The pieces together = the <b>complete map</b>. How LSAs reach everyone is the next module (flooding).'}
]);}
// L3M2 — flooding
function renderC7Flood(){return c7P('c7h',
  'How does an LSA reach <b>all</b> routers? Via <b>flooding</b>: when a router receives a new LSA, it <b>forwards it out every other</b> interface (except the one it came in on). The neighbor does the same – so the LSA spreads through the area <b>like an avalanche</b> in moments. To stop it looping forever, each LSA has a <b>sequence number</b>: a <b>duplicate</b> (same number) is <b>dropped</b>, and if a neighbor offers an <b>older</b> version the router sends its newer one back. That makes flooding terminate reliably.',
  [['flooding','spreading an LSA to all routers by forwarding it out every other interface.'],['sequence number','an LSA’s version; newer overrides older, an already-seen one is dropped → flooding ends.']]);}
function mountC7Flood(){var fp=function(p1,p2,c){return '<rect x="-5" y="-4" width="10" height="8" rx="2" style="fill:var('+(c||'--violet')+')"><animateMotion path="M '+p1+' L '+p2+'" dur="1.1s" repeatCount="indefinite"/></rect>';};c7Mount('c7h',[
  {glow:c7g('r1','--violet')+c7g('r2','--violet')+c7g('r3','--violet'),dyn:fp('110 100','290 48')+fp('110 100','290 152'),cap:'R1 floods its LSA to neighbors R2 and R3.'},
  {glow:c7all('--violet'),dyn:fp('290 48','470 100')+fp('290 152','470 100'),cap:'R2 and R3 <b>forward it on</b> to R4 (not back where it came from). The avalanche continues.'},
  {glow:c7all('--green'),dyn:c7lbl(290,108,'duplicate? drop (seq #)','--green'),cap:'R4 gets the LSA from both sides – the second is a <b>duplicate</b>, dropped by sequence number. Flooding ends, everyone has it.'}
]);}
// L3M3 — the same LSDB
function renderC7Lsdb(){return c7P('c7i',
  'After flooding, <b>every router in the area holds exactly the same database</b> of all LSAs – the <b>LSDB</b> (Link-State Database). That’s the key difference from older protocols (distance-vector), where a router only trusted what a neighbor told it ("second-hand"). Here <b>everyone has the complete map</b> first-hand. And from an <b>identical</b> map they all compute the <b>same, loop-free</b> paths. The map = a single truth everyone agrees on.',
  [['LSDB','the identical database of all LSAs in an area; the map every router computes paths from.'],['distance-vector','an older approach ("trust your neighbor"); OSPF is link-state – everyone has the whole map.']]);}
function mountC7Lsdb(){c7Mount('c7i',[
  {glow:c7all('--violet'),dyn:c7lbl(290,108,'everyone: same LSDB','--violet'),cap:'All four routers now hold an <b>identical</b> map of the network (LSDB).'},
  {glow:c7all('--green'),dyn:C7PATH_TOP+C7PATH_BOT,cap:'From that same map <b>each computes</b> paths itself – and because the map is the same, the results <b>fit together</b> without loops.'},
  {glow:c7all('--cyan'),dyn:c7lbl(290,108,'how exactly? Dijkstra →','--cyan'),cap:'How does the map turn into a <b>shortest path</b>? That’s <b>Dijkstra’s</b> algorithm – next lesson, no math.'}
]);}
// L4M1 — cost based on speed
function renderC7Cost(){return c7P('c7j',
  'OSPF doesn’t pick a path by <b>hop count</b>, but by <b>cost</b> – and cost goes by <b>link speed</b>: a fast link = <b>low</b> cost, a slow one = high. The cost of a whole path is the <b>sum</b> of the link costs along it. So OSPF will happily choose a <b>longer</b> path over more routers if it’s <b>faster</b> (cheaper) than a single slow link. That’s smarter than just "fewest hops".',
  [['cost','OSPF’s metric by link speed; a path = sum of costs. Lower = better.'],['hop','passing one router. OSPF does NOT go by hop count, but by cost.']]);}
function mountC7Cost(){var c=function(x,y,tx,col){return c7lbl(x,y,tx,col||'--amber');};c7Mount('c7j',[
  {glow:c7all('--cyan'),dyn:c(200,78,'10')+c(380,78,'10')+c(200,128,'5')+c(380,128,'5'),cap:'Each link has a <b>cost</b> by speed. Top path R1→R2→R4 = 10+10 = <b>20</b>. Bottom R1→R3→R4 = 5+5 = <b>10</b>.'},
  {glow:c7g('r1','--green')+c7g('r3','--green')+c7g('r4','--green'),dyn:C7PATH_BOT+c(200,128,'5')+c(380,128,'5'),cap:'Both paths have the <b>same hop count</b> (2), but the bottom is <b>cheaper</b> (10 < 20) → OSPF picks the <b>bottom</b>.'},
  {glow:c7all('--cyan'),dyn:C7PATH_BOT,cap:'By hop count alone it’d be a toss-up. OSPF is <b>smarter</b>: it decides by speed. You <b>set the cost in the simulator</b> by right-clicking a link.'}
]);}
// L4M2 — the shortest-path tree
function renderC7Spf(){return c7P('c7k',
  'The <b>Dijkstra</b> algorithm (SPF – Shortest Path First) sounds complex, but the idea is simple: each router puts <b>itself in the middle</b> of the map and gradually discovers the <b>cheapest path</b> to every network – always picking the nearest not-yet-discovered node and computing onward from it. The result is a <b>shortest-path tree</b> from that one router’s point of view (the SPF tree). It fills the <b>routing table</b>: the cheapest next hop to each network. Every router computes its own tree – but from the <b>same map</b>, so it all fits together.',
  [['SPF','Shortest Path First (Dijkstra) – computes a shortest-path tree from the map, from a given router’s view.'],['routing table','the result of SPF: the cheapest next hop to each network.']]);}
function mountC7Spf(){c7Mount('c7k',[
  {glow:c7g('r1','--green'),dyn:c7lbl(110,70,'"I am the center"','--green'),cap:'<b>R1</b> puts itself in the center: cost to itself = 0. It starts exploring outward.'},
  {glow:c7g('r1','--green')+c7g('r3','--cyan'),dyn:C7PATH_BOT.replace(/--green/g,'--cyan'),cap:'It finds the <b>nearest</b> node (lowest cost), locks it in and computes onward. Step by step it discovers the whole network.'},
  {glow:c7all('--green'),dyn:C7PATH_BOT,cap:'The result = R1’s <b>shortest-path tree</b>. It fills the routing table. Every router has its own tree from the same map.'}
]);}
// L4M3 — in the simulator
function renderC7SimTie(){return c7P('c7l',
  'All of this <b>runs in this simulator too</b>. Build a few routers with redundant paths, <b>right-click a link to set its cost</b> – and watch the cheapest path <b>recompute itself</b>. Raise the cost of the main path and traffic <b>spills over</b> to the other, cheaper one. That’s exactly what OSPF does: not the shortest <b>distance</b>, but the lowest <b>cost</b>. Try it in the <b>ospf-cost</b> task.',
  [['ospf-cost','the task: set link costs so traffic flows the faster (cheaper) path.'],['right-click a link','in the simulator opens the link’s OSPF cost setting.']]);}
function mountC7SimTie(){var c=function(x,y,tx,col){return c7lbl(x,y,tx,col||'--amber');};c7Mount('c7l',[
  {glow:c7g('r1','--green')+c7g('r3','--green')+c7g('r4','--green'),dyn:C7PATH_BOT+c(200,128,'5')+c(380,128,'5'),cap:'The cheap bottom path (5+5=10) is active.'},
  {glow:c7g('r1','--red')+c7g('r3','--red'),dyn:c(200,128,'50')+c(380,128,'50')+'<line x1="124" y1="107" x2="276" y2="145" style="stroke:var(--red);stroke-width:2.4;stroke-dasharray:5 4"/>',cap:'You raise the bottom path’s cost to 50+50=100. Now it’s <b>more expensive</b> than the top (20).'},
  {glow:c7g('r1','--green')+c7g('r2','--green')+c7g('r4','--green'),dyn:C7PATH_TOP+c(200,78,'10')+c(380,78,'10'),cap:'OSPF <b>recomputes itself</b> and sends traffic over the top (20 < 100). You see it live in the simulator.'}
]);}
// L5M1 — a large area = a problem
function renderC7AreaWhy(){return c7P('c7m',
  'OSPF with one big map is great up to a point. In a <b>large</b> network (hundreds of routers) one huge LSDB means: lots of memory, a long Dijkstra recompute, and every tiny change <b>floods the whole network</b>. The fix: split the network into <b>areas</b>. Inside an area routers know each other in detail; between areas only a <b>summary</b> is sent. A change in one area then <b>doesn’t bother</b> the others.',
  [['area','a part of an OSPF network with its own LSDB; only a summary is shared between areas.'],['scaling','splitting into areas limits the map size and the reach of changes.']]);}
function mountC7AreaWhy(){c7Mount('c7m',[
  {glow:c7all('--cyan'),dyn:c7lbl(290,110,'1 area: 1 huge map','--cyan'),cap:'A small network? One area is enough. But imagine <b>hundreds</b> of routers in one map…'},
  {glow:c7all('--red'),dyn:c7lbl(290,110,'every change floods EVERYTHING','--red'),cap:'A big map = lots of memory, slow recompute, and every change <b>floods the whole network</b>. That can’t scale forever.'},
  {glow:c7g('r1','--violet')+c7g('r2','--violet')+c7g('r3','--green')+c7g('r4','--green'),dyn:c7lbl(195,110,'area 0','--violet')+c7lbl(385,110,'area 1','--green'),cap:'The fix: <b>split into areas</b>. Each has its own smaller map; only a summary between them. Details next module.'}
]);}
// L5M2 — area 0
function renderC7Area0(){return c7P('c7n',
  'OSPF areas have a firm rule: there is a <b>backbone "area 0"</b> and <b>all other</b> areas attach <b>to it</b> (not to each other). Traffic between two areas always passes through area 0. This gives the area topology a <b>star</b> shape, loop-free and predictable. A router sitting on the <b>border</b> of two areas is called an <b>ABR</b> – and it does the important work (next module).',
  [['area 0','the backbone area; all other areas attach to it.'],['ABR','Area Border Router – a router on the border of two areas; it passes summaries between them.']]);}
function mountC7Area0(){c7Mount('c7n',[
  {glow:c7g('r1','--violet')+c7g('r2','--violet')+c7g('r3','--violet'),dyn:c7lbl(195,110,'area 0 (backbone)','--violet'),cap:'On the left and in the middle is <b>area 0</b> (R1, R2, R3) – the backbone everything connects to.'},
  {glow:c7g('r4','--green'),dyn:c7lbl(470,20,'area 1','--green'),cap:'Other areas (area 1, 2…) hang <b>off area 0</b>, never directly between themselves – here it lies behind R4. Inter-area traffic always goes through the backbone.'},
  {glow:c7g('r2','--amber')+c7g('r3','--amber'),dyn:c7lbl(290,20,'ABR',' --amber'.trim()),cap:'A router on the <b>border</b> of two areas = an <b>ABR</b>. Here there are <b>two</b> – R2 and R3 (both paths into area 1 run through them). They hold the maps of both areas and translate summaries between them.'}
]);}
// L5M3 — ABR + simplification
function renderC7Abr(){return c7P('c7o',
  'What an <b>ABR</b> does exactly: inside each area it knows the <b>full map</b>, but toward the other area it sends only a <b>reachability summary</b> – "behind me are the networks of the area (e.g. from the 10.1.0.0/16 block – you know the /16 notation from the Routing and IP addresses course) at this cost", i.e. where you can get and for how much, not the detailed link topology. So a foreign area <b>isn’t flooded</b> with every little thing and maps stay small. When a link fails inside an area, only <b>that area</b> recomputes; the others don’t even notice (the summary didn’t change). That’s the whole magic of OSPF scaling.',
  [['summary','condensed info about networks behind an ABR; just the range and cost instead of all details.'],['change isolation','a failure inside an area recomputes only that area; the others aren’t disturbed.']]);}
function mountC7Abr(){c7Mount('c7o',[
  {glow:c7g('r2','--amber')+c7g('r3','--amber'),dyn:c7lbl(290,110,'ABR: knows both areas','--amber'),cap:'An ABR (here both R2 and R3) holds the full map of <b>both</b> areas.'},
  {glow:c7g('r4','--green'),dyn:c7lbl(370,110,'just a summary: 10.1.0.0/16','--green'),cap:'To the other area it sends only a <b>summary</b> – not all the details. The foreign area stays small and calm.'},
  {glow:c7g('r1','--red')+c7g('r2','--violet'),dyn:'<line x1="124" y1="93" x2="276" y2="55" style="stroke:var(--red);stroke-width:2.4;stroke-dasharray:5 4"/>'+c7lbl(385,110,'area 1 doesn’t notice','--green'),cap:'A link fails in area 0 → only <b>area 0</b> recomputes. Area 1 doesn’t care – the summary didn’t change. <b>That’s how OSPF scales.</b>'}
]);}
// L6M1 — failure and reconvergence
function renderC7Conv(){return c7P('c7p',
  'Back to why we started with OSPF: <b>self-healing</b> after a failure (convergence). When a link fails, the router <b>detects it</b> (Hellos stop / the interface goes down), creates a <b>new LSA</b> "this link is gone", it <b>floods</b> the area, everyone <b>updates the map</b> and <b>recomputes Dijkstra</b>. The result: traffic flows <b>another way</b> – with no human action. The whole thing typically takes <b>a few seconds</b> (when the router detects the failure immediately; otherwise only after the dead interval – next module).',
  [['convergence','the time until all routers re-agree on the best paths after a change.'],['link failure','the router detects it (Hello/interface), sends a new LSA, the network recomputes and reroutes.']]);}
function mountC7Conv(){var down='<line x1="124" y1="93" x2="276" y2="55" style="stroke:var(--red);stroke-width:2.4;stroke-dasharray:5 4"/>';c7Mount('c7p',[
  {glow:c7g('r1','--green')+c7g('r2','--green')+c7g('r4','--green'),dyn:C7PATH_TOP,cap:'Traffic flows the top path R1→R2→R4.'},
  {glow:c7g('r1','--red')+c7g('r2','--red'),dyn:down+c7lbl(195,70,'new LSA: link gone','--red'),cap:'The R1–R2 link fails. R1 and R2 send a <b>new LSA</b>, it floods, everyone recomputes the map.'},
  {glow:c7g('r1','--green')+c7g('r3','--green')+c7g('r4','--green'),dyn:down+C7PATH_BOT,cap:'Dijkstra finds the new best path R1→R3→R4 and traffic <b>keeps flowing</b>. No human action. Done in a few seconds.'}
]);}
// L6M2 — speed (timers, BFD)
function renderC7Timers(){return c7P('c7q',
  'How <b>fast</b> does OSPF detect a failure? The <b>Hello/Dead</b> interval guards it: Hello goes out regularly (by default, say, every 10 s) and when none arrives for the whole <b>dead interval</b> (typically <b>4× hello</b>, i.e. 40 s), the neighbor is declared dead. That’s on the order of <b>seconds to tens of seconds</b> – and mind that this is only the time to <b>detect</b> the failure; the path recomputation itself (previous module) then takes just a few seconds. When an <b>even faster</b> reaction is needed (milliseconds), <b>BFD</b> is added – a tiny fast "heartbeat" on the link that tells OSPF "it’s down" before Hello would even notice. Timers can be <b>tuned</b>, but overly aggressive settings cause false alarms.',
  [['Hello/Dead interval','how often Hello is sent and after how much silence a neighbor is dead (typically 4× hello).'],['BFD','Bidirectional Forwarding Detection – very fast link-failure detection (ms) for instant reroute.']]);}
function mountC7Timers(){var hp=function(){return '<rect x="-5" y="-4" width="10" height="8" rx="2" style="fill:var(--cyan)"><animateMotion path="M 110 100 L 290 48" dur="1s" repeatCount="indefinite"/></rect>';};c7Mount('c7q',[
  {glow:c7g('r1','--cyan')+c7g('r2','--cyan'),dyn:hp()+c7lbl(195,70,'Hello … Hello … Hello','--cyan'),cap:'Hello flows regularly (by default, say, every 10 s) – the heartbeat between neighbors.'},
  {glow:c7g('r1','--amber')+c7g('r2','--red'),dyn:c7lbl(290,108,'silence for the dead interval → dead','--red'),cap:'When no Hello arrives for the whole <b>dead interval</b> (typically 4× hello), the neighbor is <b>dead</b> → recompute starts. On the order of seconds to tens of seconds.'},
  {glow:c7all('--green'),dyn:c7lbl(290,110,'BFD: ms',' --green'.trim()),cap:'Need <b>milliseconds</b>? Add <b>BFD</b> – a lightning heartbeat that reports a failure to OSPF instantly. Beware overly aggressive timers (false alarms).'}
]);}
// L6M3 — reroute in the simulator
function renderC7Reroute(){return c7P('c7r',
  'You’ll <b>try reroute live</b>: build redundant paths, set costs and then <b>down</b> the active device or link (in the simulator you can administratively disable it). Watch traffic move to the other path <b>by itself</b> – exactly like OSPF convergence. In the simulator the <b>ospf-fix</b> task shows this: raise the cost on the blocking path and traffic <b>spills over</b> to the clean one.',
  [['ospf-fix','the task: by changing cost you reroute traffic off a congested/blocking path to a better one.'],['administrative shutdown','in the simulator you can disable a device/link and watch the reroute.']]);}
function mountC7Reroute(){var down='<line x1="304" y1="55" x2="456" y2="93" style="stroke:var(--red);stroke-width:2.4;stroke-dasharray:5 4"/>';c7Mount('c7r',[
  {glow:c7g('r1','--green')+c7g('r2','--green')+c7g('r4','--green'),dyn:C7PATH_TOP,cap:'Traffic flows over the top. Now in the simulator we <b>down</b> the R4–R2 link.'},
  {glow:c7g('r2','--red')+c7g('r4','--red'),dyn:down,cap:'Link down → OSPF detects it and recomputes.'},
  {glow:c7g('r1','--green')+c7g('r3','--green')+c7g('r4','--green'),dyn:down+C7PATH_BOT,cap:'Traffic <b>spills over</b> to the bottom path by itself. You’ll click through this in the <b>ospf-fix</b> task.'}
]);}
// L7M1 — default route to the internet
function renderC7Default(){return c7P('c7s',
  'OSPF knows the company’s <b>internal</b> networks. But the internet is <b>far too big</b> for anyone to pour it whole into OSPF (flooding). The fix: one router (on the border to the ISP) has a <b>default route</b> (0.0.0.0/0) out and tells OSPF "<b>send everything unknown to me</b>" – this is called <b>default-information-originate</b>. OSPF spreads that default route to everyone and each internal router then knows: whatever I don’t know (= the internet) I send to that gateway.',
  [['default route','0.0.0.0/0 – "where to send what I don’t know"; typically out to the ISP.'],['default-information-originate','the command by which a border router injects the default route into OSPF for everyone.']]);}
function mountC7Default(){c7Mount('c7s',[
  {glow:c7g('r4','--cyan'),dyn:c7lbl(540,70,'R4 → ISP / internet','--cyan'),cap:'R4 is on the border to the ISP and has a <b>default route</b> 0.0.0.0/0 out.'},
  {glow:c7all('--violet'),dyn:c7lbl(290,110,'default-information-originate','--violet'),cap:'R4 tells OSPF "<b>send the unknown to me</b>". The default route spreads to everyone.'},
  {glow:c7all('--green'),dyn:C7PATH_TOP+c7lbl(290,110,'inside: OSPF · out: default','--green'),cap:'Every router now knows: internal networks from OSPF, <b>anything else → to R4</b> out. Inside and internet both covered.'}
]);}
// L7M2 — redistribution
function renderC7Redist(){return c7P('c7t',
  'In reality <b>everything</b> rarely runs in OSPF. Somewhere a <b>static</b> route stays (e.g. to a partner), elsewhere a <b>different protocol</b> runs. <b>Redistribution</b> is a "bridge": you take routes from one source (static, another protocol) and <b>let them into OSPF</b> so others know about them too. It’s powerful but handle with care – bad redistribution can cause <b>loops</b> (a packet circles between routers forever, never arrives and eventually its TTL expires) or break metrics. So what flows where is watched closely.',
  [['redistribution','letting routes from another source (static, another protocol) into OSPF.'],['caution','bad redistribution causes loops / broken metrics; watch what you inject and how.']]);}
function mountC7Redist(){c7Mount('c7t',[
  {glow:c7g('r1','--amber'),dyn:c7lbl(170,74,'static route','--amber'),cap:'R1 has a <b>static</b> route to a partner network – OSPF doesn’t know it yet.'},
  {glow:c7all('--violet'),dyn:c7lbl(290,110,'redistribution → into OSPF','--violet')+csPkt('M124 93 L276 55 L304 55 L456 93','--violet')+csPkt('M124 107 L276 145 L304 145 L456 107','--violet'),cap:'With <b>redistribution</b> you inject that static route into OSPF – it spreads as an <b>LSA</b> from R1 to R2, R3 and R4. Now everyone knows it.'},
  {glow:c7all('--red'),dyn:c7lbl(290,110,'loop: the packet circles around','--red')+csPkt('M124 93 L276 55 L304 55 L456 93 L456 107 L304 145 L276 145 L124 107 L124 93','--red','3.4s'),cap:'It works great – but <b>carefully</b>. Bad redistribution creates a <b>loop</b>: the packet circles between the routers, never arrives and eventually its TTL expires. So exactly what flows is controlled.'}
]);}
// L7M3 — synthesis / what next
function renderC7Wrap(){return c7P('c7u',
  'Let’s tie it together. <b>OSPF</b> gives a network <b>self-managing</b> routing: routers find each other (Hello), share a map (LSDB), compute shortest paths (Dijkstra), scale via areas and after a failure <b>reroute themselves</b> (convergence) – plus a default route to the internet and redistribution with the surroundings. That covers the <b>internal backbone</b>. What’s next? Traffic flows inside – now let’s <b>protect</b> it: deep inspection (DPI), IDS/IPS and real attacks. That’s the <b>Advanced security course</b>.',
  [['OSPF','dynamic link-state routing: find each other, share the map, compute paths, scale, converge.'],['what’s next','the Advanced security course: DPI, IDS/IPS, real attacks and layered defense.']]);}
function mountC7Wrap(){c7Mount('c7u',[
  {glow:c7all('--green'),dyn:C7PATH_TOP+C7PATH_BOT,cap:'The routers <b>found</b> each other, share a <b>map</b>, compute <b>shortest paths</b> and after a failure <b>self-heal</b>. That’s OSPF.'},
  {glow:c7g('r4','--cyan'),dyn:c7lbl(540,70,'+ default out','--cyan'),cap:'Plus a <b>default route</b> to the internet and <b>redistribution</b> with static/other protocols. The internal backbone is done.'},
  {glow:c7all('--violet'),dyn:c7lbl(290,110,'→ the Advanced security course','--violet'),cap:'Traffic flows reliably. Now let’s <b>protect it in depth</b> – DPI, IDS/IPS, real attacks. <b>The Advanced security course.</b>'}
]);}
// L7M4 — coda: OSPF vs. other protocols (link to Course 4 → The internet and who wins). Static module (no mount).
function renderC7VsOthers(){
  var row=function(y,name,metric,ad,c){return '<g><rect x="110" y="'+(y-13)+'" width="420" height="22" rx="5" style="fill:var('+c+');fill-opacity:.10;stroke:var('+c+');stroke-width:.9"/>'
    +'<text x="122" y="'+(y+3)+'" style="font:800 9px var(--mono);fill:var('+c+')">'+esc(name)+'</text>'
    +'<text x="238" y="'+(y+3)+'" style="font:600 8px var(--sans);fill:var(--muted)">'+esc(metric)+'</text>'
    +'<text x="518" y="'+(y+3)+'" text-anchor="end" style="font:800 8.5px var(--mono);fill:var('+c+')">'+esc(ad)+'</text></g>';};
  var svg='<svg viewBox="0 0 640 172" width="100%" style="display:block">'
    +row(28,'eBGP','policy · internet (between AS)','AD 20','--violet')
    +row(54,'EIGRP','composite metric · Cisco','AD 90','--green')
    +row(80,'OSPF','cost (speed) · standard','AD 110','--cyan')
    +row(106,'IS-IS','cost · ISP backbones','AD 115','--blue')
    +row(132,'RIP','hops · obsolete','AD 120','--amber')
    +'</svg>';
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'<b>OSPF</b> is just one of several routing protocols — they differ in their <b>metric</b> (how they pick a path) and their <b>purpose</b>. RIP counts hops (obsolete today), EIGRP has a composite metric (Cisco), IS-IS runs on ISP backbones and BGP holds the whole internet between carriers. Who wins when several run at once? <b>Administrative distance</b> decides. You walked through this comparison at the end of <b>the routing course</b> (the “The internet and who wins” lesson) – this is just a quick reminder, because this whole course goes deep on <b>OSPF</b> itself.'+'</p>'
    +'<div class="osi-stage">'+svg+'</div>'
    +abbrBox([['administrative distance','lower = more trusted source. eBGP 20 · EIGRP 90 · OSPF 110 · IS-IS 115 · RIP 120.']]);
}
const COURSE_7_DEF = {
  id:'course7',
title:'OSPF in depth',
  blurb:'Dynamic routing: why static isn’t enough, how OSPF routers find each other (Hello, DR/BDR), the shared map (LSDB), Dijkstra, areas, convergence and OSPF in context.',
  lessons:[
    { id:'c7l1', title:'When static isn’t enough', taskId:null, quizId:'c7q_l1', modules:[
      { id:'c7l1m1', title:'Hand-built routes don’t scale', render:renderC7WhyDynamic, mount:mountC7WhyDynamic },
      { id:'c7l1m2', title:'Static doesn’t survive failures', render:renderC7StaticFail, mount:mountC7StaticFail },
      { id:'c7l1m3', title:'The idea of OSPF', render:renderC7Idea, mount:mountC7Idea }
    ]},
    { id:'c7l2', title:'How OSPF routers find each other', taskId:null, quizId:'c7q_l2', modules:[
      { id:'c7l2m1', title:'Hello packets', render:renderC7Hello, mount:mountC7Hello },
      { id:'c7l2m2', title:'Adjacency', render:renderC7Adjacency, mount:mountC7Adjacency },
      { id:'c7l2m3', title:'DR and BDR', render:renderC7DrBdr, mount:mountC7DrBdr }
    ]},
    { id:'c7l3', title:'The shared map (LSDB)', taskId:null, quizId:'c7q_l3', modules:[
      { id:'c7l3m1', title:'LSA: a piece of the map', render:renderC7Lsa, mount:mountC7Lsa },
      { id:'c7l3m2', title:'Flooding', render:renderC7Flood, mount:mountC7Flood },
      { id:'c7l3m3', title:'The same LSDB for everyone', render:renderC7Lsdb, mount:mountC7Lsdb }
    ]},
    { id:'c7l4', title:'Dijkstra without the math', taskId:'ospf-cost', quizId:'c7q_l4', modules:[
      { id:'c7l4m1', title:'Cost by speed', render:renderC7Cost, mount:mountC7Cost },
      { id:'c7l4m2', title:'The shortest-path tree', render:renderC7Spf, mount:mountC7Spf },
      { id:'c7l4m3', title:'In the simulator', render:renderC7SimTie, mount:mountC7SimTie }
    ]},
    { id:'c7l5', title:'Areas', taskId:null, quizId:'c7q_l5', modules:[
      { id:'c7l5m1', title:'A big area = a problem', render:renderC7AreaWhy, mount:mountC7AreaWhy },
      { id:'c7l5m2', title:'The backbone: area 0', render:renderC7Area0, mount:mountC7Area0 },
      { id:'c7l5m3', title:'ABR and summaries', render:renderC7Abr, mount:mountC7Abr }
    ]},
    { id:'c7l6', title:'Convergence', taskId:'ospf-fix', quizId:'c7q_l6', modules:[
      { id:'c7l6m1', title:'Failure and recompute', render:renderC7Conv, mount:mountC7Conv },
      { id:'c7l6m2', title:'Speed: Hello/Dead and BFD', render:renderC7Timers, mount:mountC7Timers },
      { id:'c7l6m3', title:'Reroute in the simulator', render:renderC7Reroute, mount:mountC7Reroute }
    ]},
    { id:'c7l7', title:'OSPF in context', taskId:null, quizId:'c7q_l7', modules:[
      { id:'c7l7m1', title:'Default route to the internet', render:renderC7Default, mount:mountC7Default },
      { id:'c7l7m2', title:'Redistribution', render:renderC7Redist, mount:mountC7Redist },
      { id:'c7l7m3', title:'The whole path and what’s next', render:renderC7Wrap, mount:mountC7Wrap },
      { id:'c7l7m4', title:'OSPF vs. the others', render:renderC7VsOthers }
    ]}
  ]
};
const COURSE_7_QUIZZES_DEF = {
  c7q_l1:{ title:'Quiz: When static isn’t enough', qs:[
    { q:'Why isn’t <b>manual (static)</b> routing enough in a large network?',
      opts:['on every router you’d maintain a route to every network by hand – it doesn’t scale and is error-prone','manual routing is noticeably slower and less efficient at actually moving data than dynamic routing is','static routing cannot work across the public internet'],
      correct:0, why:'Static is fine for a few networks. With dozens of routers and hundreds of networks, manual upkeep is unsustainable – hence dynamic routing.' },
    { q:'What does a <b>static</b> route do when a link on the main path fails?',
      opts:['nothing – it doesn’t know, packets drop into a dead end until someone fixes it by hand','it recomputes itself at once and right away finds a new working backup route to the target','it automatically speeds up all the other working links in the whole network as a result'],
      correct:0, why:'A static route is "hard-wired". A dynamic protocol (OSPF) detects the failure and reroutes itself – that’s convergence.' },
    { q:'What does it mean that OSPF is a <b>link-state</b> protocol?',
      opts:['every router knows the state of all links (the whole map) and computes paths itself','it always trusts only what its direct neighbor tells it about remote networks','by its very nature it can only ever function on one single link'],
      correct:0, why:'Unlike distance-vector ("second-hand"), in link-state everyone has the complete map first-hand and computes paths themselves.' }
  ]},
  c7q_l2:{ title:'Quiz: How routers find each other', qs:[
    { q:'Two routers <b>see</b> each other via Hello but <b>no neighborship forms</b>. The most likely cause?',
      opts:['their Hello parameters disagree – a different area, subnet or intervals','one of them has noticeably more memory reserved for the LSA database','the link between them is too fast, so their Hello packets keep missing'],
      correct:0, why:'To become neighbors, the Hello must agree on area, subnet/mask and Hello/Dead intervals. If they differ, Hellos arrive but no neighborship forms.' },
    { q:'What’s the difference between a <b>neighbor</b> and a full <b>adjacency (Full)</b>?',
      opts:['a neighbor "just sees" via Hello; an adjacency (Full) = they hold the same synchronized database (LSDB)','a neighbor is the state after full database exchange; an adjacency (Full) forms right after the first received Hello','in the adjacency (Full) state the routers exchanged only their routing tables, not the whole link databases'],
      correct:0, why:'Seeing each other (Two-Way) isn’t enough. Only in Full do both hold an identical map and can compute paths.' },
    { q:'Why are <b>DR/BDR</b> elected on a <b>shared network</b>?',
      opts:['so not everyone forms an adjacency with everyone – all form Full only with the DR (and backup BDR)','so that all of the traffic between routers on the shared network is always reliably kept encrypted','so that the overall transfer speed of the shared link between them is greatly increased'],
      correct:0, why:'Without a DR the number of relationships grows quadratically (n×(n−1)/2). The DR flattens it: everyone talks via the DR, BDR is the backup.' }
  ]},
  c7q_l3:{ title:'Quiz: The shared map (LSDB)', qs:[
    { q:'What is an <b>LSA</b>?',
      opts:['a record of one router’s links and networks – the building block of the map','the complete finished routing table of one single particular router','a secret encryption key that secures all the traffic between routers'],
      correct:0, why:'An LSA is a piece: each router describes its surroundings with it. All LSAs together form the complete map (LSDB).' },
    { q:'How does an LSA reach all routers and why doesn’t it <b>loop</b> forever?',
      opts:['by flooding (it’s forwarded on); a duplicate is recognized by its sequence number and dropped','it’s sent just once directly and straight to all routers in the whole area all at once','it patiently waits in place for as long as it takes until every router asks for it itself'],
      correct:0, why:'Flooding saturates the area; the sequence number ensures an already-seen LSA is dropped – so flooding terminates reliably.' },
    { q:'What do <b>all</b> routers in an area have after convergence?',
      opts:['exactly the same link database (LSDB) – the same map of the network','each of them on the contrary has its own completely different map','only the bare address of its own default gateway stored and nothing more'],
      correct:0, why:'The same LSDB = the same truth. From an identical map everyone computes the same, loop-free paths.' }
  ]},
  c7q_l4:{ title:'Quiz: Dijkstra and cost', qs:[
    { q:'What does OSPF use to pick the best path?',
      opts:['by cost – which goes by link speed; a path = the sum of the link costs','by hop count – the path with the fewest routers always wins','by delay – the path with the lowest measured delay along the route wins'],
      correct:0, why:'OSPF does NOT go by hop count. A fast link has a low cost; the lowest sum of costs along the path wins.' },
    { q:'Two paths have equal hops: top 10+10, bottom 5+5. Which does OSPF pick?',
      opts:['the bottom – it has the lower total cost (10 < 20)','the top – because it is listed first in the list','it makes no difference at all, both have the same number of hops'],
      correct:0, why:'Cost decides, not hops. 5+5=10 is cheaper than 10+10=20, so OSPF picks the bottom path.' },
    { q:'What does the <b>Dijkstra (SPF)</b> algorithm compute?',
      opts:['a shortest-path tree from a given router’s view → fills the routing table','a complete list of absolutely all the direct neighbors of that router in the area','the secret encryption keys that secure all the communication between routers'],
      correct:0, why:'Each router puts itself in the center of the map and computes the cheapest paths to all networks – from the same map, so it fits.' }
  ]},
  c7q_l5:{ title:'Quiz: Areas', qs:[
    { q:'Why is a large OSPF network split into <b>areas</b>?',
      opts:['so the map is smaller and a change in one area doesn’t flood the whole network','so that all the traffic between the individual areas is always reliably encrypted','so the internet connection works noticeably faster for the whole large network'],
      correct:0, why:'One huge map = memory, slow recompute and flooding everywhere. Areas limit that: only a summary is shared between them.' },
    { q:'What’s the rule about <b>area 0</b>?',
      opts:['it’s the backbone – all other areas attach to it, not to each other','it\'s a special area in which, by its nature, there must be no routers','it’s by far the least important and at the same time the least used area in the whole OSPF network'],
      correct:0, why:'Inter-area traffic always passes through area 0. The area topology is thus a loop-free, predictable star.' },
    { q:'What does an <b>ABR</b> do and why does it help scaling?',
      opts:['at the area border it sends only a summary instead of all details → a change inside an area doesn’t disturb the others','at the border between areas it reliably and completely blocks and discards all the traffic passing between them','at the area border it translates OSPF routes into another routing protocol so the other areas can understand them too'],
      correct:0, why:'The ABR knows the full map of both areas, exporting only a summary. A failure inside an area then recomputes only that area.' }
  ]},
  c7q_l6:{ title:'Quiz: Convergence', qs:[
    { q:'What happens in OSPF when a <b>link fails</b>?',
      opts:['the router detects it, sends a new LSA, it floods, everyone recomputes Dijkstra and traffic flows another way','the whole network shuts down at once over one single link failing and stops working entirely until a manual fix','nothing changes at all and nothing happens for as long as it takes until an admin rewrites the new route by hand'],
      correct:0, why:'That’s the point of OSPF: after a failure the network self-heals (convergence) – typically in a few seconds, no human.' },
    { q:'What is the <b>Hello/Dead interval</b> for?',
      opts:['how often Hello is sent and after how much silence a neighbor is declared dead','it precisely determines how fast the physical link itself between two neighboring routers is','it determines how much memory the given router has reserved in total for running OSPF'],
      correct:0, why:'Typically dead = 4× hello. When Hello stops, after the dead interval the recompute starts. On the order of seconds.' },
    { q:'What is <b>BFD</b> used for?',
      opts:['very fast link-failure detection (milliseconds) for instant reroute','reliable encryption of all the OSPF communication between all neighboring routers','splitting one large flat OSPF network into several smaller separate areas'],
      correct:0, why:'BFD is a lightning "heartbeat" on the link; it reports a failure before Hello would notice. Beware overly aggressive timers.' }
  ]},
  c7q_l7:{ title:'Quiz: OSPF in context', qs:[
    { q:'How does OSPF handle the <b>internet</b> (the way out) when it’s too big to share?',
      opts:['a border router injects a default route 0.0.0.0/0 into OSPF (default-information-originate) – "send the unknown to me"','a border router slowly floods the entire public internet along with all its hundreds of thousands of networks straight into the whole shared OSPF database','the internet itself, by its very nature, simply cannot be reached via the OSPF protocol in any reasonable way at all'],
      correct:0, why:'OSPF knows internal networks; for "everything else" a single default route to the border router out to the ISP suffices.' },
    { q:'What is <b>redistribution</b> and what to watch out for?',
      opts:['letting routes from another source (static, another protocol) into OSPF – carefully, done wrong it makes loops','the complete and irreversible permanent shutdown of the entire OSPF protocol on all the border routers of the network','the reliable encryption of absolutely all the routes that the individual OSPF routers exchange with each other'],
      correct:0, why:'Redistribution bridges OSPF with its surroundings (static, other protocols). It’s powerful, but misconfigured it causes loops and broken metrics.' },
    { q:'What comes after routing?',
      opts:['advanced security – deep inspection (DPI), IDS/IPS and real attacks','nothing more at all – the whole series definitively ends with this course','the complete basics of switching and working with individual VLANs all over again from the start'],
      correct:0, why:'Traffic flows reliably (L2 and L3) – the next layer is protecting it in depth. That’s the Advanced security course.' }
  ]}
};
const COURSE_7_FINAL_EXTRA_DEF=[{ q:'How does OSPF (link-state) differ from hop counting, and what does it pick a path by?', opts:['everyone holds the whole map and picks by cost, which goes by link speed','it only trusts a neighbor’s "how far" and then blindly counts only hops','it picks completely at random by the current order of routes in the table'], correct:0, why:'In link-state every router holds the whole map first-hand and computes paths by cost (fast link = low cost). Hop counting (distance-vector) is just "second-hand".' },{ q:'A link fails in OSPF. How does the network learn of it, and what happens then?', opts:['it floods a new LSA, everyone fixes their LSDB and recomputes the paths','nothing happens at all until an admin rewrites it by hand themselves','the whole area reboots over a single link and re-establishes all neighborships'], correct:0, why:'The change is carried by a new LSA spread by flooding. Each router updates its LSDB and recomputes paths with Dijkstra – the network converges itself, no manual fix.' },{ q:'Why is a large OSPF network split into areas, and how does an internet route get into it?', opts:['a smaller map and change isolation; a border router injects a default 0.0.0.0/0','mainly to reliably encrypt the traffic between areas; the internet has OSPF built in','mainly to make the internet faster; each router then computes the default by itself'], correct:0, why:'Areas shrink the database and keep a change local so it doesn’t flood the whole network. The way out is added by a border router injecting a default 0.0.0.0/0 ("send the unknown to me").' }];
__regCourse(7,COURSE_7_DEF,COURSE_7_QUIZZES_DEF,COURSE_7_FINAL_EXTRA_DEF);
