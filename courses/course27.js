/* course27.js — content of Course 27 (Multicast; loaded on demand via course-core.js) */
/* ============================================================
   COURSE 27 — Multicast. Why one-to-many is its own problem, IP multicast addresses and
   groups, IGMP and who joins, the last-member problem and leave, how multicast crosses
   routers (and why it does not by itself), the RP and shared trees, and the two protocols
   that make it work in practice (SSM and PIM). Scene d27Net: three receivers under a router.
   ============================================================ */
var C27R={pc:[90,80],r:[330,80],r2:[560,80],a:[170,220],b:[330,220],c:[490,220]};
function d27Net(pfx){
  return '<svg id="'+pfx+'svg" viewBox="0 0 640 262" width="100%" style="display:block">'
    +'<line x1="105" y1="80" x2="315" y2="80" style="stroke:var(--line2);stroke-width:1.6"/>'
    +'<line x1="345" y1="80" x2="545" y2="80" style="stroke:var(--line2);stroke-width:1.6"/>'
    +'<line x1="322" y1="92" x2="175" y2="208" style="stroke:var(--line2);stroke-width:1.6"/>'
    +'<line x1="330" y1="95" x2="330" y2="208" style="stroke:var(--line2);stroke-width:1.6"/>'
    +'<line x1="338" y1="92" x2="485" y2="208" style="stroke:var(--line2);stroke-width:1.6"/>'
    +'<g id="'+pfx+'glow"></g>'
    +csHost(90,80,'server','--green','SERVER')
    +csDev(330,80,'router','R')
    +csDev(560,80,'router','R2')
    +csHost(170,220,'desktop','--cyan','A')
    +csHost(330,220,'desktop','--cyan','B')
    +csHost(490,220,'desktop','--cyan','C')
    +'<g id="'+pfx+'dyn"></g></svg>';
}
function d27P(pfx,intro,terms){
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+intro+'</p>'
    +'<div class="osi-stage">'+d27Net(pfx)+'</div><div class="m1-cap" id="'+pfx+'cap"></div>'
    +courseStepControls(pfx)+abbrBox(terms);
}
function d27Mount(pfx,STEPS){
  function show(i){d27lblReset();var g=$(pfx+'glow');if(g)g.innerHTML=STEPS[i].glow||'';var d=$(pfx+'dyn');if(d)d.innerHTML=STEPS[i].dyn||'';var c=$(pfx+'cap');if(c)c.innerHTML='<span>'+STEPS[i].cap+'</span>';}
  courseStepper(pfx,STEPS.length,show);
}
function d27g(name,color){var p=C27R[name];return csGlow(p[0],p[1],color,20);}
// Labels stack downward inside the diagram (y <= 250) so two of them can never
// overprint; below it the caller's row is kept. A label whose argument went
// missing renders nothing -- esc() would make it a stray empty <text>.
var D27Y=1;
function d27lbl(x,y,tx,c){
  if(tx==null||tx==='')return '';
  if(y!=null&&y<=250){ D27Y=Math.max(D27Y,y+14); y=D27Y; }
  return '<text x="'+x+'" y="'+y+'" text-anchor="middle" style="font:700 7.5px var(--mono);fill:var('+c+')">'+esc(tx)+'</text>';
}
function d27lblReset(){D27Y=1;}
function d27pkt(path,color,dur){return '<rect x="-6" y="-4" width="12" height="9" rx="2" style="fill:var('+color+')"><animateMotion path="'+path+'" dur="'+(dur||'1.4s')+'" repeatCount="indefinite"/></rect>';}

/* ---------- L1M1 — Why one-to-many is its own problem ---------- */
function renderC27Why(){return d27P('d27a',
  'Almost everything on a network is one-to-one: a client talks to a server, and the reply comes back along the same path. <b>Multicast</b> is the different case – <b>one sender, many receivers at once</b>. Think of a live stream, a market-data feed, a lecture, or a stock-ticker: a hundred viewers of the same content. Sending that hundred times over the network is <b>N times the traffic for one copy of the data</b>, and it gets worse with every viewer. Multicast sends <b>one copy</b> into the network and lets the network deliver it to everyone who asked – like a radio broadcast rather than a phone call. The catch is that it is <b>not a normal point-to-point conversation</b>: there is no reply, there is no acknowledgement per receiver, and the network has to know <b>where the receivers are</b> so it does not send into empty rooms.',
  [['unicast','sending to one receiver at a time; the default for almost all traffic.']]);}
function mountC27Why(){d27Mount('d27a',[
  {glow:d27g('pc','--muted')+d27g('a','--muted')+d27g('b','--muted')+d27g('c','--muted'),dyn:d27lbl(330,44,'one stream, three viewers','--muted'),cap:'A server sends one stream; three viewers want it.'},
  {glow:d27g('a','--red')+d27g('b','--red')+d27g('c','--red'),dyn:d27lbl(330,254,'unicast: the same data three times','--red'),cap:'With <b>unicast</b> the same data travels <b>three times</b> – and the cost grows with every viewer.'},
  {glow:d27g('pc','--cyan')+d27g('a','--cyan')+d27g('b','--cyan')+d27g('c','--cyan'),dyn:d27pkt('M 100 90 L 330 95 L 175 208','--cyan','0.7s')+d27pkt('M 330 95 L 330 208','--cyan','0.7s')+d27pkt('M 330 95 L 485 208','--cyan','0.7s')+d27lbl(330,140,'one copy in, copied out only where someone is listening','--cyan'),cap:'<b>Multicast:</b> one copy into the network, copied out only where a receiver exists.'},
  {glow:d27g('a','--amber')+d27g('c','--amber'),dyn:d27lbl(330,254,'so: no replies, no per-receiver ack, and the router must know who listens','--amber'),cap:'Which means new questions: no reply, no per-receiver acknowledgement, and the network must <b>know where the receivers are</b>.'}
]);}

/* ---------- L1M2 — Multicast addresses ---------- */
function renderC27Addr(){return d27P('d27b',
  'A multicast address is not the address of a device – it is the <b>address of a group</b>. In IPv4 it always begins with <b>224.0.0.0/4</b>, and because it names a group rather than a host it is <b>never</b> used as a source address. Within that space, some ranges are <b>local to one link</b>: <b>224.0.0.0/24</b> (often called 224.0.0.0 “the local network”) never leaves the segment it was sent on, and <b>239.0.0.0/8</b> is <b>administratively scoped</b> to your own organisation, so it cannot leak onto the internet. Multicast traffic stays inside your network; that scoping is the safety feature. A receiver subscribes by asking to join a group, and it usually does so not with its own address but by <b>asking the local host to join on its behalf</b> (this is what IGMP is for, the topic below). Note the comparison with IPv6, which has no broadcast at all and uses <b>ff02::</b>-style addresses for exactly this purpose.',
  [['group','a set of receivers identified by one address; in multicast the destination names the group, not a host.'],
   ['scoped','limited to an administrative boundary, so multicast cannot leak onto the public internet.']]);}
function mountC27Addr(){d27Mount('d27b',[
  {glow:d27g('pc','--amber')+d27g('a','--amber')+d27g('b','--amber')+d27g('c','--amber'),dyn:d27lbl(330,44,'destination = 239.1.2.3 (a group)','--amber'),cap:'The destination names a <b>group</b>, and in IPv4 it always begins <b>224.0.0.0/4</b>.'},
  {glow:d27g('a','--green'),dyn:d27lbl(175,254,'A and B joined the group','--green'),cap:'Receivers that want it <b>join the group</b>; those that do not never see it.'},
  {glow:d27g('pc','--cyan'),dyn:d27lbl(330,140,'224.0.0.0/24 never leaves the segment','--cyan')+d27lbl(445,220,'239.0.0.0/8 stays inside your org','--cyan'),cap:'<b>Scoped</b> ranges: link-local ones stay on the segment, <b>239/8</b> stays inside your organisation.'},
  {glow:d27g('a','--green')+d27g('b','--green')+d27g('c','--green'),dyn:d27lbl(330,254,'so multicast can never leak onto the internet','--green'),cap:'That scoping is the safety feature: multicast traffic does not escape your network by accident.'}
]);}

/* ---------- L2M1 — IGMP: joining and leaving ---------- */
function renderC27Igmp(){return d27P('d27c',
  'If the network must deliver only where receivers are, it must know who they are, and <b>IGMP</b> (Internet Group Management Protocol) is how a host tells its local router “I want to receive this group”. A receiver does not talk to the router itself: the <b>host</b> joins the group on the host’s behalf, and the router keeps a table of which ports lead to members of which group. Joining is simple – an <b>IGMP membership report</b>. Leaving is the interesting part, because a host that simply stops listening cannot be distinguished from one whose network is broken. So the router does not wait for an announcement; it <b>sends a query</b> to the group and waits: if nobody answers, it removes the port. That is the <b>last-member problem</b>, and it is why a router holds state for a group even after the last viewer has gone. The exit you should know: <b>IGMP snooping</b> lets a switch read these reports and forward multicast only where it is wanted, instead of flooding it everywhere like a broadcast.',
  [['IGMP','the protocol a host uses to join and leave multicast groups on its local router.']]);}
function mountC27Igmp(){d27Mount('d27c',[
  {glow:d27g('a','--amber'),dyn:d27lbl(175,254,'I want group 239.1.2.3','--amber')+d27pkt('M 175 208 L 330 100','--amber','0.7s'),cap:'A viewer asks its router to join the group – an <b>IGMP report</b>.'},
  {glow:d27g('a','--green')+d27g('b','--green'),dyn:d27lbl(330,140,'the router now knows where the members are','--green'),cap:'The router keeps a table of which <b>ports</b> lead to members of which group.'},
  {glow:d27g('c','--red'),dyn:d27lbl(490,254,'C leaves without saying anything','--red'),cap:'A viewer that just stops listening is indistinguishable from a broken one – so it cannot simply announce “I am gone”.'},
  {glow:d27g('c','--cyan')+d27g('r','--cyan'),dyn:d27lbl(445,220,'router queries the group; no answer → drop the port','--cyan'),cap:'So the router <b>queries</b> and removes the port if nobody answers – the <b>last-member problem</b>.'}
]);}

/* ---------- L2M2 — Switches and multicast floods ---------- */
function renderC27Switch(){return d27P('d27d',
  'A switch that does not understand IGMP treats multicast like a broadcast: it floods the frame to <b>every port</b>. That is wasteful, and it is the reason the traffic exists at all in a switched LAN – the whole point of multicast was to avoid sending N copies, and a naive switch reinstates them. The fix is <b>IGMP snooping</b>: the switch listens to the membership reports on its own ports and builds a table of where each group lives, forwarding the stream only there. The effect is exactly what you would hope: the stream crosses one uplink into the switch and leaves only the ports with a viewer. This is a good example of a general principle from the course <i>The switch in depth</i> – a switch makes forwarding decisions from a table, and every protocol the network runs has to be either understood by the switch or trick it into learning what it needs. (The simulator’s port strip and connection overview show the same idea at work when you run a live multicast-like flow.)',
  [['IGMP snooping','the switch reading IGMP reports itself so it forwards multicast only to ports that have members.']]);}
function mountC27Switch(){d27Mount('d27d',[
  {glow:d27g('a','--green')+d27g('b','--green')+d27g('c','--red'),dyn:d27lbl(330,254,'members: A and B only','--green'),cap:'Two of three hosts have joined the group.'},
  {glow:d27g('r','--red')+d27g('c','--red'),dyn:d27lbl(445,220,'naive switch: floods to every port','--red'),cap:'A switch that does not understand IGMP <b>floods</b> the stream to every port – which reinstates the copies multicast was meant to avoid.'},
  {glow:d27g('r','--cyan'),dyn:d27lbl(445,220,'with IGMP snooping: only A and B','--cyan')+d27pkt('M 330 95 L 175 208','--cyan','0.7s')+d27pkt('M 330 95 L 330 208','--cyan','0.7s'),cap:'<b>IGMP snooping</b> makes the switch learn where the group is: the stream goes only where there is a viewer.'},
  {glow:d27g('c','--muted'),dyn:d27lbl(490,254,'C never sees it at all','--muted'),cap:'The stream crosses <b>one uplink</b> and leaves only the ports with a member.'}
]);}

/* ---------- L3M1 — Why routers do not forward it by default ---------- */
function renderC27Route(){return d27P('d27e',
  'Here is the part that surprises people: <b>a router does not forward multicast on its own</b>. It knows how to route unicast – it forwards towards a destination address – but multicast has <b>no single destination</b> to point at, so the question “where does this go?” has no answer until the router has multicast-specific knowledge of where the receivers are, beyond its own segment. So multicast <b>stops at the router by default</b>, and something must be configured to let it through. This is a deliberate safety property: without configuration, a multicast stream could flood an entire provider network. The tool that supplies the missing knowledge is <b>PIM</b> (Protocol Independent Multicast), which is where the rest of this course goes. Until it is set up, your receivers on the far side of a router get nothing – and that is a configuration fault, not a broken network.',
  [['PIM','the multicast routing protocol that tells routers where to forward a group’s traffic.']]);}
function mountC27Route(){d27Mount('d27e',[
  {glow:d27g('pc','--cyan')+d27g('a','--cyan')+d27g('b','--cyan')+d27g('c','--cyan'),dyn:d27lbl(330,44,'members are on this segment','--cyan'),cap:'IGMP handles everything <b>within</b> one segment: A, B and C all get the stream.'},
  {glow:d27g('r','--amber')+d27g('r2','--red'),dyn:d27lbl(445,220,'but a router forwards no multicast by default','--red'),cap:'But a router <b>does not forward multicast</b> on its own – there is no single destination to route towards.'},
  {glow:d27g('r2','--red')+d27g('a','--red'),dyn:d27lbl(490,140,'across the router: nothing arrives','--red'),cap:'So the stream <b>stops at the router</b> by default, and receivers beyond it get nothing.'},
  {glow:d27g('r','--cyan')+d27g('r2','--cyan'),dyn:d27lbl(330,254,'PIM supplies the missing knowledge','--cyan'),cap:'Deliberately safe: without configuration, a stream cannot flood an entire network. <b>PIM</b> is what lets it through.'}
]);}

/* ---------- L3M2 — Trees and rendezvous points ---------- */
function renderC27Tree(){return d27P('d27f',
  'Once multicast crosses routers, the network needs a shape for the stream, and the two classic shapes are worth knowing. The <b>shared tree</b> names a <b>rendezvous point (RP)</b>: senders send their stream <i>to the RP</i>, and receivers join <i>at the RP</i>, so all traffic meets at one known address. That is simple and it saves traffic, but every stream passes through one machine, and every router must know where the RP is. The <b>source tree</b> instead builds a tree rooted at the <b>source</b> for each group: the shortest path from the sender to each receiver, with no central point. It is the most efficient shape and needs no RP – but the routers have to build a separate tree per group. The compromise most networks settle on is <b>SSM</b> (source-specific multicast): restrict a group so that only receivers are allowed to join, no senders. For one-to-many content like a video stream that is exactly right, and it removes the RP and the shared-tree problem entirely.',
  [['RP (rendezvous point)','a router where senders and receivers meet on a shared tree; every stream passes through it.'],
   ['SSM','source-specific multicast: receivers join a (source, group) pair, so senders need no RP.']]);}
function mountC27Tree(){d27Mount('d27f',[
  {glow:d27g('pc','--amber')+d27g('a','--amber')+d27g('b','--amber')+d27g('c','--amber'),dyn:d27lbl(330,140,'shared tree: meet at the RP','--amber')+d27lbl(560,140,'RP','--amber'),cap:'<b>Shared tree:</b> everything meets at a <b>rendezvous point</b>, which every router must be able to find.'},
  {glow:d27g('pc','--amber')+d27g('r2','--amber'),dyn:d27lbl(445,220,'simple and bandwidth-saving, but one bottleneck','--amber'),cap:'Simple and efficient on traffic – but <b>every stream goes through one machine</b>.'},
  {glow:d27g('pc','--cyan')+d27g('a','--cyan')+d27g('b','--cyan'),dyn:d27pkt('M 100 90 L 175 208','--cyan','0.8s')+d27pkt('M 100 90 L 330 208','--cyan','0.8s'),cap:'<b>Source tree:</b> a tree rooted at the sender, the shortest path to each viewer, no central point.'},
  {glow:d27g('pc','--green')+d27g('a','--green')+d27g('b','--green'),dyn:d27lbl(330,254,'SSM: viewers join (source, group) – no RP needed','--green'),cap:'Most one-to-many content settles on <b>SSM</b>, which drops the RP and the shared-tree problem altogether.'}
]);}

/* ---------- L4M1 — When multicast is the right tool ---------- */
function renderC27When(){return d27P('d27g',
  'Multicast is not a general-purpose way to send data faster, and choosing it wrongly causes real problems. It is the right tool when <b>many receivers want the same thing at the same time</b> and their count can grow – live video and audio, financial feeds, a lecture or a sports match, a stock ticker, software distribution, and increasingly the delivery of container images and video streams inside a data centre. It is the wrong tool when the receivers differ, when you need each one acknowledged, when you need a reply, or when the number of receivers is small and fixed. The failure modes to know: a multicast stream that the <b>switches flood</b> instead of forwarding (see IGMP snooping above); a stream that <b>stops at a router</b> that was never configured for multicast; and a stream whose <b>last viewer leaves</b> but the router keeps forwarding because it never got a clean “goodbye”. In the simulator you can watch all of these: send one flow to many hosts and watch whether it crosses the router.',
  [['one-to-many','a single sender and many receivers – the shape multicast is built for.']]);}
function mountC27When(){d27Mount('d27g',[
  {glow:d27g('pc','--green')+d27g('a','--green')+d27g('b','--green')+d27g('c','--green'),dyn:d27lbl(330,254,'good fit: one stream, many viewers','--green'),cap:'<b>Good fit:</b> many receivers wanting the same thing at once – live video, feeds, a lecture.'},
  {glow:d27g('pc','--red')+d27g('a','--red')+d27g('b','--red'),dyn:d27lbl(445,220,'bad fit: replies, per-receiver acks, differing content','--red'),cap:'<b>Bad fit:</b> you need replies, per-receiver acknowledgement, or the receivers want different things.'},
  {glow:d27g('r','--amber'),dyn:d27lbl(445,220,'flooding switches and stuck routers are the two classic faults','--amber'),cap:'The two classic faults: switches that <b>flood</b> instead of forwarding, and a <b>router</b> never configured for multicast.'},
  {glow:d27g('pc','--green')+d27g('a','--green')+d27g('b','--green')+d27g('c','--green'),dyn:d27lbl(330,140,'watch it in the simulator: one flow, many hosts','--green'),cap:'Watch it yourself: send one flow to several hosts and see whether it crosses the router.'}
]);}

const COURSE_27_DEF = {
  id:'course27',
title:'Multicast: one sender, many receivers',
  blurb:'The other traffic shape. Why one-to-many deserves its own machinery, multicast addresses and why they are scoped, IGMP – who joins and the awkward question of who leaves, why a naive switch floods a stream meant for a few, why routers do not forward multicast at all until PIM is configured, and the shapes a stream can take (shared tree, source tree, SSM).',
  lessons:[
    { id:'c27l1', title:'What multicast is for', taskId:null, quizId:'c27q_l1', modules:[
      { id:'c27l1m1', title:'Why one-to-many is its own problem', render:renderC27Why, mount:mountC27Why },
      { id:'c27l1m2', title:'Multicast addresses and groups', render:renderC27Addr, mount:mountC27Addr }
    ]},
    { id:'c27l2', title:'Joining and leaving', taskId:'ch-vlan', quizId:'c27q_l2', modules:[
      { id:'c27l2m1', title:'IGMP: joining and leaving', render:renderC27Igmp, mount:mountC27Igmp },
      { id:'c27l2m2', title:'Switches and multicast floods', render:renderC27Switch, mount:mountC27Switch }
    ]},
    { id:'c27l3', title:'Across routers', taskId:null, quizId:'c27q_l3', modules:[
      { id:'c27l3m1', title:'Why routers do not forward it by default', render:renderC27Route, mount:mountC27Route },
      { id:'c27l3m2', title:'Trees and rendezvous points', render:renderC27Tree, mount:mountC27Tree }
    ]},
    { id:'c27l4', title:'Choosing it well', taskId:null, quizId:'c27q_l4', modules:[
      { id:'c27l4m1', title:'When multicast is the right tool', render:renderC27When, mount:mountC27When }
    ]}
  ]
};

const COURSE_27_QUIZZES_DEF = {
  c27q_l1:{ title:'Quiz: What multicast is for', qs:[
    { q:'What is the advantage of multicast over sending the same stream separately to each viewer?',
      opts:['each viewer can change the content independently','one copy travels into the network instead of one per viewer','it is encrypted more easily'],
      correct:1, why:'That is the entire point: N copies become one, and the network copies it out only where someone is listening.' },
    { q:'What does a multicast destination address identify?',
      opts:['the one receiver that should get the packet','the group that should receive the packet','the sender’s own address'],
      correct:1, why:'A multicast address names a group, not a host – and it is never used as a source address.' },
    { q:'Which IPv4 range is administratively scoped so that multicast cannot leak onto the internet?',
      opts:['224.0.0.0/24','239.0.0.0/8','255.0.0.0/8'],
      correct:1, why:'239/8 is scoped to your own organisation. Link-local ranges like 224.0.0.0/24 never leave the segment either.' },
    { q:'Why is multicast not simply “faster networking”?',
      opts:['because it uses less bandwidth','because there are no replies and no per-receiver acknowledgement, and the network must know where receivers are','because it works only over fibre'],
      correct:1, why:'It trades reliability and acknowledgement for scale. That is why it fits a stream and not a request/reply conversation.' }
  ]},
  c27q_l2:{ title:'Quiz: Joining and leaving', qs:[
    { q:'How does a viewer join a multicast group?',
      opts:['by sending an IGMP report to the local router','by asking the sender for a copy','by being assigned the group address as its own IP'],
      correct:0, why:'The host joins on behalf of the application and the router notes which port has a member.' },
    { q:'Why does a router query the group instead of waiting for members to announce their departure?',
      opts:['to confirm the sender is still alive','because a viewer that simply stops is indistinguishable from one whose network is broken','to work out the bandwidth needed'],
      correct:1, why:'That is the last-member problem. Silence cannot be trusted, so the router asks and removes the port if nobody answers.' },
    { q:'What does a switch that does not understand IGMP do with a multicast frame?',
      opts:['drops it','floods it to every port, undoing the point of multicast','forwards it only to the router'],
      correct:1, why:'It treats it like a broadcast. With a hundred viewers that reinstates the hundred copies multicast existed to avoid.' },
    { q:'What does IGMP snooping give the switch?',
      opts:['the ability to compress the stream','a table of which ports have members, so it forwards only there','a faster link'],
      correct:1, why:'The switch learns where each group lives and forwards only that way – a general theme from the course <i>The switch in depth</i>.' }
  ]},
  c27q_l3:{ title:'Quiz: Across routers', qs:[
    { q:'Why does a router not forward multicast without configuration?',
      opts:['it is too slow to do so','a multicast packet has no single destination to route towards until receivers beyond it are known','multicast is only defined for IPv6'],
      correct:1, why:'Without knowledge of where the receivers are, there is nothing to point at. The default stop is deliberate, so a stream cannot flood a provider network.' },
    { q:'What supplies the knowledge a router needs to forward multicast?',
      opts:['a static route to every viewer','PIM, the multicast routing protocol','a DHCP option'],
      correct:1, why:'PIM is that protocol. Without it, the stream simply stops at the router – a configuration fault, not a fault in the network.' },
    { q:'What is a rendezvous point (RP)?',
      opts:['the router where a shared tree is rooted, so senders and receivers meet there','the first router a packet reaches','the router with the most viewers'],
      correct:0, why:'On a shared tree everything passes through one known address. Simple and efficient, but a single point through which every stream flows.' },
    { q:'Which approach builds a tree rooted at the sender, with no central point?',
      opts:['the shared tree','the source tree','the rendezvous tree'],
      correct:1, why:'The source tree is the shortest path from sender to each receiver and needs no RP – at the cost of one tree per group.' },
    { q:'In SSM, who is allowed to join a group?',
      opts:['any sender','receivers only, for a specific source','only the RP'],
      correct:1, why:'Source-specific multicast restricts a group to (source, group) pairs, so no RP is needed at all – ideal for one-to-many content.' }
  ]},
  c27q_l4:{ title:'Quiz: Choosing it well', qs:[
    { q:'Which of these is a good fit for multicast?',
      opts:['a client downloading a file from a known server','a live video stream watched by thousands','a web request from a browser'],
      correct:1, why:'One stream, many viewers, all wanting the same thing at once – that is the shape multicast was built for.' },
    { q:'Multicast is a poor choice when you need…',
      opts:['more than one viewer','a reply from each receiver, or acknowledgement that each got it','less than 1 Gbit/s'],
      correct:1, why:'There are no per-receiver acknowledgements by design. That is the trade that makes it scale.' },
    { q:'A multicast stream reaches the local segment but not the far side of the router. What is the likely cause?',
      opts:['the viewers are too far away','the router has no multicast routing configured, so it stops forwarding','the switches flooded it'],
      correct:1, why:'Routers do not forward multicast until PIM (or equivalent) tells them where the receivers are.' }
  ]}
};

const COURSE_27_FINAL_EXTRA_DEF = [
  { q:'Why does a receiver signal membership with IGMP rather than simply being configured with the group address?',
    opts:['because IGMP is faster','because the address names a group, not the host; the host joins on the application’s behalf','because group addresses cannot be stored in a host'],
    correct:1, why:'The destination names a group. IGMP is the host telling its router “there is someone here who wants this group”.' },
  { q:'A switch floods a multicast stream to every port and the network is under load. What single feature addresses this?',
    opts:['a larger MTU','IGMP snooping','a longer lease time'],
    correct:1, why:'Snooping makes the switch learn where each group actually is, so it forwards only to the ports with members.' }
];

__regCourse(27,COURSE_27_DEF,COURSE_27_QUIZZES_DEF,COURSE_27_FINAL_EXTRA_DEF);