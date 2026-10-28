/* course31.js — content of Course 31 (BGP and IS-IS; loaded on demand via course-core.js) */
function d31P(pfx,intro){return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+intro+'</p><div class="m1-cap" id="'+pfx+'cap"></div>'+courseStepControls(pfx);}
function d31Mount(pfx,STEPS){function show(i){var c=$(pfx+'cap');if(c)c.innerHTML='<span>'+STEPS[i].cap+'</span>';}courseStepper(pfx,STEPS.length,show);}

/* ---------- L1M1 ---------- */
function renderC31AsPath(){return d31P('d31a','An <b>autonomous system (AS)</b> is a network under one administrative control with its own routing policy. <b>BGP</b> is the protocol that carries reachability <i>between</i> autonomous systems: it is a <b>path-vector</b> protocol, meaning every route announcement carries the full list of ASes it has crossed (the AS path). That list is what makes BGP loop-free across the whole internet without a shared map.');}
function mountC31AsPath(){d31Mount('d31a',[
 {cap:'An <b>AS</b> is one administrative network with its own policy.'},
 {cap:'BGP runs <b>between</b> ASes and announces which prefixes are reachable.'},
 {cap:'Each announcement carries the <b>AS path</b> it has crossed.'},
 {cap:'The AS path makes BGP <b>loop-free</b> without a shared map.'}
]);}
/* ---------- L1M2 ---------- */
function renderC31EiBgp(){return d31P('d31b','<b>eBGP</b> runs between different autonomous systems (across an external link); <b>iBGP</b> runs inside one AS so that every router learns the same external reachability. The rule that matters: iBGP does not re-advertise a route learned from another iBGP peer (to prevent loops), so a full mesh – or a route reflector – is needed inside the AS.');}
function mountC31EiBgp(){d31Mount('d31b',[
 {cap:'<b>eBGP</b>: between different ASes.'},
 {cap:'<b>iBGP</b>: inside one AS, sharing external reachability.'},
 {cap:'iBGP does not re-advertise iBGP-learned routes.'},
 {cap:'Hence a full mesh or a <b>route reflector</b> is needed.'}
]);}
/* ---------- L2M1 ---------- */
function renderC31Attrs(){return d31P('d31c','BGP does not use a simple metric. It compares <b>attributes</b> in a fixed order: prefer the highest <b>LOCAL_PREF</b>, then the shortest <b>AS path</b>, then the lowest <b>MED</b>, then eBGP over iBGP, then the closest next-hop (IGP cost), then the lowest router ID. Local preference is the knob you set to steer outbound traffic; AS-path length is what the internet sees.');}
function mountC31Attrs(){d31Mount('d31c',[
 {cap:'<b>LOCAL_PREF</b> first: steer your own outbound traffic.'},
 {cap:'Then <b>AS-path length</b>: shorter is better.'},
 {cap:'Then <b>MED</b>, then eBGP over iBGP.'},
 {cap:'Then IGP cost to the next-hop, then router ID.'}
]);}
/* ---------- L2M2 ---------- */
function renderC31Peering(){return d31P('d31d','BGP neighbours (<b>peers</b>) are configured manually – there is no discovery. Between two ASes you usually filter what you announce and what you accept with <b>prefix lists</b> and <b>route maps</b>, and you set local preference or prepend your own AS to the path to influence how traffic enters and leaves. The golden rule: only announce what you intend to carry, and never accept a default you did not ask for.');}
function mountC31Peering(){d31Mount('d31d',[
 {cap:'Peers are <b>configured by hand</b> – no auto-discovery.'},
 {cap:'Filter announcements and accepts with prefix lists / route maps.'},
 {cap:'Influence entry and exit with local preference or AS-path prepending.'},
 {cap:'Announce only what you will carry; accept only what you asked for.'}
]);}
/* ---------- L3M1 ---------- */
function renderC31IsisLevels(){return d31P('d31e','<b>IS-IS</b> is a link-state protocol like OSPF, but its hierarchy is built on <b>levels</b>, not areas in the OSPF sense. <b>Level 1</b> routers know their own area; <b>Level 2</b> routers form the backbone between areas; a router can be both (L1/L2) and connects its area to the backbone. Areas are identified by the address, not by a number, and the backbone is not a single area 0.');}
function mountC31IsisLevels(){d31Mount('d31e',[
 {cap:'IS-IS is <b>link-state</b>, like OSPF.'},
 {cap:'<b>Level 1</b>: knows its own area.'},
 {cap:'<b>Level 2</b>: backbone between areas.'},
 {cap:'L1/L2 routers connect an area to the backbone.'}
]);}
/* ---------- L3M2 ---------- */
function renderC31IsisAdj(){return d31P('d31f','IS-IS routers discover neighbours with <b>Hello</b> packets on each interface and build <b>adjacencies</b> only with compatible settings. Like OSPF, they flood link-state PDUs so every router in a level builds the same map, then run Dijkstra. IS-IS runs directly on top of the data link layer (it does not need IP), which is why it can carry both IPv4 and IPv6 reachability in the same protocol.');}
function mountC31IsisAdj(){d31Mount('d31f',[
 {cap:'Neighbours are found with <b>Hello</b> packets.'},
 {cap:'Adjacencies form only with compatible settings.'},
 {cap:'Link-state PDUs flood so everyone gets the same map.'},
 {cap:'IS-IS runs on L2 and can carry IPv4 and IPv6 together.'}
]);}
/* ---------- L4M1 ---------- */
function renderC31Choice(){return d31P('d31g','Reach for <b>IS-IS or OSPF</b> inside one organisation: they converge fast and know the topology. Reach for <b>BGP</b> at the edge, between organisations or providers: it scales to the whole internet, carries policy, and does not need a shared map. Many networks run both – an IGP inside, BGP at the border – and redistribute between them with care.');}
function mountC31Choice(){d31Mount('d31g',[
 {cap:'IGP (OSPF/IS-IS) inside one organisation.'},
 {cap:'BGP at the edge, between organisations.'},
 {cap:'BGP scales to the internet and carries policy.'},
 {cap:'Most networks run both and redistribute carefully.'}
]);}

const COURSE_31_DEF={
 id:'course31', title:'BGP and IS-IS: routing at scale',
 blurb:'Routing when the network stops being one company. How BGP carries paths between autonomous systems (path vector, AS numbers, eBGP and iBGP), which attributes decide the best path, and how IS-IS does link-state routing at scale (levels, areas, adjacencies) – and when you reach for which.',
 lessons:[
  {id:'c31l1',title:'BGP: paths between autonomous systems',taskId:null,quizId:'c31q_l1',modules:[
    {id:'c31l1m1',title:'Autonomous systems and the path vector',render:renderC31AsPath,mount:mountC31AsPath},
    {id:'c31l1m2',title:'eBGP and iBGP',render:renderC31EiBgp,mount:mountC31EiBgp}
  ]},
  {id:'c31l2',title:'How BGP chooses',taskId:null,quizId:'c31q_l2',modules:[
    {id:'c31l2m1',title:'Attributes and best path',render:renderC31Attrs,mount:mountC31Attrs},
    {id:'c31l2m2',title:'Peering and policy',render:renderC31Peering,mount:mountC31Peering}
  ]},
  {id:'c31l3',title:'IS-IS: link-state at scale',taskId:null,quizId:'c31q_l3',modules:[
    {id:'c31l3m1',title:'Levels and areas',render:renderC31IsisLevels,mount:mountC31IsisLevels},
    {id:'c31l3m2',title:'Adjacencies and the shared map',render:renderC31IsisAdj,mount:mountC31IsisAdj}
  ]},
  {id:'c31l4',title:'Choosing a protocol',taskId:null,quizId:'c31q_l4',modules:[
    {id:'c31l4m1',title:'BGP or IS-IS?',render:renderC31Choice,mount:mountC31Choice}
  ]}
 ]
};

const COURSE_31_QUIZZES_DEF={
 c31q_l1:{title:'Quiz: BGP paths',qs:[
  {q:'What does BGP carry in an announcement to stay loop-free?',opts:['a hop count','the AS path','a sequence number'],correct:1,why:'BGP is a path-vector protocol: the announcement carries the list of ASes it has crossed.'},
  {q:'eBGP runs between …',opts:['two routers in the same AS','two different autonomous systems','two areas of one AS'],correct:1,why:'eBGP connects different ASes; iBGP runs inside one AS.'},
 {q:'What does the AS path in a BGP announcement prevent?',opts:['loops across autonomous systems','packet loss','duplicate addresses'],correct:0,why:'The AS path lists every AS crossed, so a route that would loop back to an AS already in the path is discarded.'}
 ]},
 c31q_l2:{title:'Quiz: BGP best path',qs:[
  {q:'Which attribute is compared first in BGP best-path selection?',opts:['AS-path length','LOCAL_PREF','MED'],correct:1,why:'LOCAL_PREF is compared first; a higher value wins.'},
  {q:'Why does iBGP need a full mesh or a route reflector?',opts:['because iBGP does not re-advertise iBGP-learned routes','because eBGP forbids it','because of area boundaries'],correct:0,why:'iBGP does not re-advertise a route learned from another iBGP peer, to prevent loops.'},
 {q:'Which attribute steers your own outbound traffic?',opts:['MED','LOCAL_PREF','router ID'],correct:1,why:'LOCAL_PREF is compared first; raise it to prefer an exit.'}
 ]},
 c31q_l3:{title:'Quiz: IS-IS',qs:[
  {q:'How does IS-IS build its hierarchy?',opts:['with numbered areas like OSPF','with levels (L1, L2, L1/L2)','with AS numbers'],correct:1,why:'IS-IS uses levels; the backbone is Level 2, not a single area 0.'},
  {q:'On which layer does IS-IS run?',opts:['on IP','directly on the data link layer','on TCP'],correct:1,why:'IS-IS runs on L2 and can carry both IPv4 and IPv6 reachability.'},
 {q:'What is a Level 2 router in IS-IS?',opts:['a router inside one area only','a backbone router between areas','a host'],correct:1,why:'Level 2 forms the backbone between areas.'}
 ]},
 c31q_l4:{title:'Quiz: choosing',qs:[
  {q:'Which protocol do you use inside one organisation?',opts:['BGP','an IGP such as OSPF or IS-IS','static routes only'],correct:1,why:'An IGP converges fast and knows the topology; BGP is for the edge.'},
 {q:'Which protocol carries policy between organisations?',opts:['OSPF','IS-IS','BGP'],correct:2,why:'BGP is the edge protocol that carries policy between ASes.'},
 {q:'What do you need when you run both an IGP and BGP?',opts:['nothing special','careful redistribution between them','a single area'],correct:1,why:'Redistribution between IGP and BGP must be done with care.'}
 ]}
};
const COURSE_31_FINAL_EXTRA_DEF=[
 {q:'Why can BGP scale to the whole internet where an IGP cannot?',opts:['because it floods link-state everywhere','because it is a path vector that needs no shared map','because it uses UDP'],correct:1,why:'BGP does not build a shared map; it propagates paths, which scales to the internet.'}
];

__regCourse(31,COURSE_31_DEF,COURSE_31_QUIZZES_DEF,COURSE_31_FINAL_EXTRA_DEF);