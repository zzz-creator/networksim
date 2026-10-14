/* course28.js — content of Course 28 (First-hop redundancy; loaded on demand via course-core.js) */
/* ============================================================
   COURSE 28 — First-hop redundancy: HSRP, VRRP and GLBP. The single-gateway problem, a
   virtual IP and a virtual MAC, the active and the standby, how the pair agrees and what
   happens when the active dies, the cost of a redundancy protocol, and the third kind of
   redundancy you have already met (load balancing). Scene d28Net: PC under two routers.
   ============================================================ */
var C28R={pc:[130,80],r1:[360,60],r2:[360,200],lan:[130,220],wan:[560,130]};
function d28Net(pfx){
  return '<svg id="'+pfx+'svg" viewBox="0 0 640 262" width="100%" style="display:block">'
    +'<line x1="145" y1="80" x2="345" y2="70" style="stroke:var(--line2);stroke-width:1.6"/>'
    +'<line x1="145" y1="90" x2="345" y2="200" style="stroke:var(--line2);stroke-width:1.6"/>'
    +'<line x1="375" y1="70" x2="545" y2="130" style="stroke:var(--line2);stroke-width:1.6"/>'
    +'<line x1="375" y1="200" x2="545" y2="140" style="stroke:var(--line2);stroke-width:1.6"/>'
    +'<line x1="130" y1="95" x2="130" y2="208" style="stroke:var(--line2);stroke-width:1.6"/>'
    +'<g id="'+pfx+'glow"></g>'
    +csHost(130,80,'desktop','--green','PC')
    +csDev(360,60,'router','R1')
    +csDev(360,200,'router','R2')
    +csHost(130,220,'lan','--amber','LAN')
    +csHost(560,130,'globe','--cyan','WAN')
    +'<g id="'+pfx+'dyn"></g></svg>';
}
function d28P(pfx,intro,terms){
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+intro+'</p>'
    +'<div class="osi-stage">'+d28Net(pfx)+'</div><div class="m1-cap" id="'+pfx+'cap"></div>'
    +courseStepControls(pfx)+abbrBox(terms);
}
function d28Mount(pfx,STEPS){
  function show(i){d28lblReset();var g=$(pfx+'glow');if(g)g.innerHTML=STEPS[i].glow||'';var d=$(pfx+'dyn');if(d)d.innerHTML=STEPS[i].dyn||'';var c=$(pfx+'cap');if(c)c.innerHTML='<span>'+STEPS[i].cap+'</span>';}
  courseStepper(pfx,STEPS.length,show);
}
function d28g(name,color){var p=C28R[name];return csGlow(p[0],p[1],color,20);}
// Labels stack downward inside the diagram (y <= 250) so two of them can never
// overprint; below it the caller's row is kept. A label whose argument went
// missing renders nothing -- esc() would make it a stray empty <text>.
var D28Y=1;
function d28lbl(x,y,tx,c){
  if(tx==null||tx==='')return '';
  if(y!=null&&y<=250){ D28Y=Math.max(D28Y,y+14); y=D28Y; }
  return '<text x="'+x+'" y="'+y+'" text-anchor="middle" style="font:700 7.5px var(--mono);fill:var('+c+')">'+esc(tx)+'</text>';
}
function d28lblReset(){D28Y=1;}
function d28pkt(path,color,dur){return '<rect x="-6" y="-4" width="12" height="9" rx="2" style="fill:var('+color+')"><animateMotion path="'+path+'" dur="'+(dur||'1.4s')+'" repeatCount="indefinite"/></rect>';}

/* ---------- L1M1 — The single-gateway problem ---------- */
function renderC28Problem(){return d28P('d28a',
  'Every host on a network needs one address to send everything else to – the <b>default gateway</b> (the course <i>How networks exist and how data travels</i>). For years that was one router, and for years one router was a <b>single point of failure</b>: if it died, every host on the network lost its way out at once, even though a perfectly good second router was sitting right there unused. The obvious fix – give the network two routers and two gateway addresses – creates a new problem: hosts send to <i>a</i> gateway, and there is no way to tell them which one to use, or to move them over when one dies. Adding a static route by hand works, but it is manual, slow, and exactly the kind of clever solution nobody remembers to redo after a failure at 3 a.m. <b>First-hop redundancy</b> is the answer: the two routers agree between themselves on a <b>single virtual address</b> that hosts use, and behind the scenes they take turns actually forwarding.',
  [['SPOF','a single point of failure – here, the one router that everything depends on.']]);}
function mountC28Problem(){d28Mount('d28a',[
  {glow:d28g('pc','--muted')+d28g('lan','--muted'),dyn:d28lbl(130,254,'every host has exactly one way out','--muted'),cap:'Every host knows <b>one</b> address to send everything else to – its default gateway.'},
  {glow:d28g('r1','--red')+d28g('r2','--muted'),dyn:d28lbl(445,254,'and it was one router for a long time','--muted'),cap:'For years that was <b>one</b> router – so it was a <b>single point of failure</b>.'},
  {glow:d28g('r1','--red')+d28g('pc','--red')+d28g('lan','--red'),dyn:d28lbl(245,140,'it dies → every host is stranded, at once','--red'),cap:'If it dies, every host on the network loses its way out <b>at once</b> – even though R2 is right there.'},
  {glow:d28g('r1','--cyan')+d28g('r2','--cyan'),dyn:d28lbl(445,220,'so: two routers must look like one gateway','--cyan'),cap:'Giving hosts two gateways does not help – they send to <i>a</i> gateway. The pair has to <b>look like one</b>.'}
]);}

/* ---------- L1M2 — The virtual address ---------- */
function renderC28Virtual(){return d28P('d28b',
  'Here is the trick that makes it work. The two routers share a <b>virtual IP address (VIP)</b>, and hosts are configured to use <i>that</i> as their gateway – not a router’s real address. Behind the scenes, exactly one of the routers is <b>active</b> and actually answers for the VIP; the other is <b>standby</b>, watching and ready. Because the VIP is not a real interface address on either device, the moment the active router fails, the standby simply starts answering for it. Hosts need not know, learn a new gateway, or even notice: their packets go to the same address they always used. For it to be completely transparent the pair also shares a <b>virtual MAC address</b>, because frames on an Ethernet segment are delivered to a MAC address – so the active router must also answer to the virtual MAC, or the hosts’ traffic would still be sent to the dead device’s hardware address. This is the piece that makes the failover look instantaneous rather than merely fast.',
  [['virtual IP (VIP)','an address that belongs to the pair, not to one device, and that hosts use as their gateway.']]);}
function mountC28Virtual(){d28Mount('d28b',[
  {glow:d28g('r1','--muted')+d28g('r2','--muted'),dyn:d28lbl(445,254,'hosts are configured with 10.0.0.1','--muted'),cap:'Hosts use the <b>VIP</b> as their gateway – an address that belongs to <i>neither</i> router alone.'},
  {glow:d28g('r1','--green'),dyn:d28lbl(360,36,'ACTIVE','--green')+d28lbl(445,220,'it answers for the VIP','--green'),cap:'One router is <b>active</b> and actually forwards for that address.'},
  {glow:d28g('r2','--amber'),dyn:d28lbl(360,222,'STANDBY','--amber'),cap:'The other is <b>standby</b> – watching, and ready to take over.'},
  {glow:d28g('pc','--green')+d28g('r1','--green'),dyn:d28lbl(245,140,'the shared virtual MAC makes it transparent','--green'),cap:'A shared <b>virtual MAC</b> completes the trick: frames go to the right hardware even as the role moves.'}
]);}

/* ---------- L2M1 — The roles and who wins ---------- */
function renderC28Roles(){return d28P('d28c',
  'Every first-hop redundancy protocol (HSRP on Cisco, VRRP on other vendors) has the same idea with different numbers and names. The pair exchanges small <b>hello</b> messages on a LAN interface or a dedicated link. <b>Priority</b> decides who leads: higher wins, and if you want the backup to lead when the primary is gone you set it higher on the second device. Two more ideas are worth knowing. <b>Preemption</b> is whether the backup may take the active role when the original returns – enable it and the old primary takes the role back; leave it off and the backup, now active, keeps it and the network does not change hands twice. <b>Tracking</b> is how a router notices that it is not really fit to lead: you watch the <i>upstream</i> link, not your own interfaces, because a router whose only route to the internet is down is useless as a gateway even though every port it owns is green. Without tracking, a router that has lost its way out keeps the role and keeps dropping your traffic.',
  [['preemption','allowing the higher-priority router to reclaim the active role when it returns.'],
   ['tracking','watching an upstream interface or route so a router that cannot reach anything steps down as active.']]);}
function mountC28Roles(){d28Mount('d28c',[
  {glow:d28g('r1','--green')+d28g('r2','--amber'),dyn:d28lbl(360,36,'ACTIVE (priority 110)','--green')+d28lbl(360,222,'STANDBY (priority 100)','--amber'),cap:'<b>Priority</b> decides who leads: higher wins. Hello messages keep both informed.'},
  {glow:d28g('r2','--cyan'),dyn:d28lbl(445,220,'preemption: who takes the role back','--cyan'),cap:'<b>Preemption</b>: may the standby reclaim the role when the original returns?'},
  {glow:d28g('r1','--red'),dyn:d28lbl(445,254,'tracking: my route to the internet is gone','--red'),cap:'<b>Tracking</b> watches the <i>upstream</i> link, not the local ports.'},
  {glow:d28g('r2','--green'),dyn:d28lbl(245,140,'a router that cannot reach anything must not lead','--green'),cap:'Without tracking, a router that has lost its way out keeps the role – and keeps dropping your traffic.'}
]);}

/* ---------- L2M2 — When the active fails ---------- */
function renderC28Failover(){return d28P('d28d',
  'The moment to be clear about is the failover. The active router dies. The standby has not noticed instantly – it discovers it from <b>missing hellos</b>, not from an announcement of death, so the detection time is what you configure. Then it checks it really should take over: is my own uplink healthy, do I still have a route to the destination? It promotes itself to active, claims the <b>VIP and the virtual MAC</b>, and starts answering. It then sends gratuitous ARP packets to refresh neighbours’ caches, so hosts and switches stop sending frames to the dead hardware address. Hosts notice nothing. The whole thing is measured in <b>seconds</b> at worst, which is far below what a user perceives as an outage. Three consequences worth stating plainly: the failover costs you <b>capacity</b>, because the standby was idle and is now doing the work; it costs you <b>a moment of loss</b> while the protocol detects and switches; and if the <b>only link between the two routers</b> fails, you can get <b>split brain</b> – both thinking the other is dead, both becoming active, which is why a redundancy protocol is never built on a single link (the course <i>Network resilience and scaling</i>).',
  [['split brain','both members of a pair believing the other is dead, and both taking the active role.']]);}
function mountC28Failover(){d28Mount('d28d',[
  {glow:d28g('r1','--green'),dyn:d28lbl(360,36,'R1 active','--green')+d28lbl(130,110,'traffic flows fine','--green'),cap:'Everything normal: R1 is active and carries the traffic.'},
  {glow:d28g('r1','--red'),dyn:d28lbl(360,36,'R1 DIES','--red')+d28lbl(245,140,'the standby notices only when hellos stop','--red'),cap:'R1 dies. The standby learns of it from <b>missing hellos</b>, so detection time is a setting, not a fact.'},
  {glow:d28g('r2','--amber')+d28g('r2','--green'),dyn:d28lbl(360,236,'STANDBY → ACTIVE','--green')+d28lbl(130,254,'claims the VIP and the virtual MAC','--green'),cap:'It checks its own uplink, promotes itself, claims the <b>VIP and virtual MAC</b>.'},
  {glow:d28g('r2','--green')+d28g('pc','--green'),dyn:d28lbl(245,140,'gratuitous ARP → hosts notice nothing','--green')+d28lbl(445,254,'cost: idle capacity, a moment of loss, and split-brain risk','--amber'),cap:'Gratuitous ARP refreshes the caches and hosts see nothing. The price is idle standby capacity and a second of loss.'}
]);}

/* ---------- L3M1 — What it costs and what it does not fix ---------- */
function renderC28Cost(){return d28P('d28e',
  'It is worth being honest about what first-hop redundancy does <b>not</b> do, because it is often bought as a general answer to “the network is unreliable”. It does not make the <b>segment</b> reliable – if the switch between the routers and the hosts dies, the VIP lives on the routers and nothing works. It does not make the <b>link</b> reliable, which is what EthernetChannel is for (the course <i>Redundancy and Spanning Tree</i>). It does not help when the problem is <b>capacity</b>, because a standby router cannot add bandwidth to a link that is already full. And it is not free: you pay for the second router, for its share of configuration, and for a protocol that has its own failure modes (split brain above all). It solves exactly one problem – <b>the single gateway</b> – and it solves it well. This is the reasoning from the course <i>Network resilience and scaling</i> in one paragraph: layer your redundancies and match each one to the failure it covers.',
  [['gratuitous ARP','a broadcast a device sends unasked to refresh other devices’ ARP caches after a change.']]);}
function mountC28Cost(){d28Mount('d28e',[
  {glow:d28g('r1','--green')+d28g('r2','--green'),dyn:d28lbl(445,254,'solved: the single gateway','--green'),cap:'<b>Solved:</b> the single gateway. One problem, solved well.'},
  {glow:d28g('lan','--red'),dyn:d28lbl(245,254,'not solved: the switch in the middle','--red'),cap:'<b>Not solved:</b> the access switch. If it dies, the VIP is on the routers and nothing works.'},
  {glow:d28g('pc','--amber')+d28g('r2','--amber'),dyn:d28lbl(445,220,'not solved: a full link (that is EtherChannel’s job)','--amber'),cap:'<b>Not solved:</b> capacity or link failure. That is what <b>EtherChannel</b> and a redundant switch are for.'},
  {glow:d28g('r2','--red')+d28g('r1','--red'),dyn:d28lbl(245,140,'costs: a router, configuration, and a new failure mode to know','--red'),cap:'And it is not free: a router, its configuration, and split brain as a new failure mode to understand.'}
]);}

/* ---------- L3M2 — The third kind: load balancing ---------- */
function renderC28Glbp(){return d28P('d28f',
  'HSRP and VRRP waste half the pair: one router works, the other idles. <b>GLBP</b> (Gateway Load Balancing Protocol) removes the waste by letting <b>both</b> routers forward, with the <b>virtual gateway</b> as an address that load-balances over <b>real MAC addresses</b> instead of one virtual MAC. Hosts still see one gateway; behind it, R1 takes some MACs and R2 takes others, so both are carrying traffic. The trade is that neither router may run at 100%, so the pair must be sized for when one fails – you buy redundancy and get load sharing, but you have to plan for the surviving member. This is the third member of the family you should recognise, next to <b>STP</b> (a backup path on the layer below, the course <i>Redundancy and Spanning Tree</i>) and <b>HA</b> on devices (the course <i>Network resilience and scaling</i>). All three answer the same question at different layers: <b>what happens when this one thing dies?</b>',
  [['GLBP','a first-hop redundancy protocol that load-balances across both routers while presenting one virtual gateway.']]);}
function mountC28Glbp(){d28Mount('d28f',[
  {glow:d28g('r1','--amber')+d28g('r2','--amber'),dyn:d28lbl(445,254,'HSRP/VRRP: one works, one idles','--amber'),cap:'<b>HSRP/VRRP:</b> one router forwards, the other idles. Redundant, but half the pair is unused.'},
  {glow:d28g('r1','--green')+d28g('r2','--green'),dyn:d28lbl(445,220,'GLBP: both forward, MACs split between them','--green'),cap:'<b>GLBP:</b> both routers forward, with the real MAC addresses <b>split</b> between them.'},
  {glow:d28g('pc','--cyan'),dyn:d28lbl(245,140,'hosts still see exactly one gateway','--cyan'),cap:'Hosts are unchanged: there is still exactly <b>one gateway address</b>.'},
  {glow:d28g('r1','--red')+d28g('r2','--red')+d28g('r1','--red'),dyn:d28lbl(445,254,'but the pair must be sized for one to fail','--red'),cap:'The cost: neither may run at 100%, so size the pair for <b>when one dies</b>. Three layers, one question.'}
]);}

const COURSE_28_DEF = {
  id:'course28',
title:'First-hop redundancy: HSRP, VRRP, GLBP',
  blurb:'The failure the redundancy map is easiest to forget. Why the single default gateway is a single point of failure, how a virtual IP and a virtual MAC make two routers behave like one, how the pair agrees on who leads and how failover actually happens, what it costs and what it does not fix, and the load-balancing variant GLBP.',
  lessons:[
    { id:'c28l1', title:'The single-gateway problem', taskId:'hsrp', quizId:'c28q_l1', modules:[
      { id:'c28l1m1', title:'One gateway, one single point of failure', render:renderC28Problem, mount:mountC28Problem },
      { id:'c28l1m2', title:'The virtual address', render:renderC28Virtual, mount:mountC28Virtual }
    ]},
    { id:'c28l2', title:'How the pair works', taskId:'spof-fix', quizId:'c28q_l2', modules:[
      { id:'c28l2m1', title:'Roles, priority, preemption and tracking', render:renderC28Roles, mount:mountC28Roles },
      { id:'c28l2m2', title:'When the active router fails', render:renderC28Failover, mount:mountC28Failover }
    ]},
    { id:'c28l3', title:'Judgement', taskId:null, quizId:'c28q_l3', modules:[
      { id:'c28l3m1', title:'What it costs and what it does not fix', render:renderC28Cost, mount:mountC28Cost },
      { id:'c28l3m2', title:'The third kind: load balancing', render:renderC28Glbp, mount:mountC28Glbp }
    ]}
  ]
};

const COURSE_28_QUIZZES_DEF = {
  c28q_l1:{ title:'Quiz: The single-gateway problem', qs:[
    { q:'Why is a single default gateway a single point of failure?',
      opts:['because gateways cannot be backed up','because every host depends on it to reach anything else, so its failure disconnects all of them at once','because routers cannot carry traffic and routing at the same time'],
      correct:1, why:'Hosts send everything else to one address. If it dies, they all lose their way out simultaneously – even with a second router idle nearby.' },
    { q:'Why does giving hosts two gateway addresses not solve the problem?',
      opts:['hosts cannot hold two addresses','because there is no way to tell them which to use, or to move them over when one fails','because routers reject traffic from a second gateway'],
      correct:1, why:'Hosts would still send to *a* gateway with no agreement about which. That is what the virtual IP replaces.' },
    { q:'What is the virtual IP (VIP)?',
      opts:['an address on the backup router','an address that belongs to the pair, which hosts use as their gateway','a second address on the same interface'],
      correct:1, why:'It belongs to neither device alone. One is active and answers for it; the other stands by to take over.' },
    { q:'Why does the pair also need a virtual MAC address?',
      opts:['so the two devices can be told apart in logs','because Ethernet frames are delivered to a MAC, so the active router must answer to the right hardware address','to allow the VIP to be routed'],
      correct:1, why:'Without it, hosts’ frames would still go to the dead device’s hardware. The virtual MAC is what makes failover look instantaneous.' }
  ]},
  c28q_l2:{ title:'Quiz: How the pair works', qs:[
    { q:'How do the two routers learn about each other?',
      opts:['by exchanging small hello messages','by pinging each other continuously','by reading each other’s logs'],
      correct:0, why:'Hellos are the mechanism – and their absence is how a failure is detected, which is why detection time is a setting.' },
    { q:'What does tracking watch?',
      opts:['the router’s own interfaces','the upstream link or route, so a router that cannot reach anything steps down','the number of clients connected'],
      correct:1, why:'A router whose only route out is down is useless as a gateway even though all its own ports are green.' },
    { q:'What is preemption?',
      opts:['both routers forwarding at once','the higher-priority router reclaiming the active role when it returns','the standby taking over without checking its uplink'],
      correct:1, why:'With it, the old primary takes the role back; without it, the current active keeps it and the network does not change hands twice.' },
    { q:'How does the network learn that the VIP has moved?',
      opts:['the standby broadcasts gratuitous ARP to refresh neighbours’ caches','DNS is updated','the hosts poll for a new gateway'],
      correct:0, why:'Gratuitous ARP makes devices and switches stop sending frames to the dead hardware address. Hosts then notice nothing.' },
    { q:'Why should a redundancy protocol never rely on a single link between the pair?',
      opts:['it would be slower','because if only that link fails, both may believe the other is dead and both take the active role','because hellos would be duplicated'],
      correct:1, why:'That is split brain – two actives claiming the same VIP. Layer your redundancy, as the resilience course says.' }
  ]},
  c28q_l3:{ title:'Quiz: Judgement', qs:[
    { q:'Which failure does first-hop redundancy NOT fix?',
      opts:['the default router dying','the access switch between the routers and the hosts dying','the active router losing its route to the internet'],
      correct:1, why:'The VIP lives on the routers; if the switch in the middle dies, nothing works. That is a different layer’s redundancy.' },
    { q:'What does first-hop redundancy cost you?',
      opts:['nothing, it is free','the second router, its configuration, and idle standby capacity','reduced security'],
      correct:1, why:'The standby is idle until it is needed, so you pay for capacity that does not contribute while both are healthy.' },
    { q:'How does GLBP differ from HSRP/VRRP?',
      opts:['it encrypts the hellos','it lets both routers forward while presenting one virtual gateway, splitting real MACs between them','it works only on IPv6'],
      correct:1, why:'That removes the idle standby – at the price of no router running at 100%, so the pair must be sized for one to fail.' },
    { q:'What do STP, first-hop redundancy and device HA have in common?',
      opts:['they all use a virtual IP','they are all one answer, at different layers, to “what happens when this one thing dies?”','they all require a second physical link'],
      correct:1, why:'The redundancy map in the resilience course: match each layer’s redundancy to the failure it actually covers.' }
  ]}
};

const COURSE_28_FINAL_EXTRA_DEF = [
  { q:'Why does a redundancy protocol have to send gratuitous ARP after a failover?',
    opts:['to prove it is alive','because neighbours cache which MAC lives at the VIP, and without this they keep sending to the dead device','to renew the lease'],
    correct:1, why:'Without it the hardware address in everyone’s cache still points at the old router. This single detail is what makes failover look instantaneous.' },
  { q:'A router is active but has lost its only route to the internet, while all of its own ports are up. Traffic from the LAN is still failing. What would fix it?',
    opts:['a faster uplink','interface tracking, so the router steps down as active','increasing the MTU'],
    correct:1, why:'Tracking watches the upstream link. Without it the router keeps a role it cannot usefully perform.' }
];

__regCourse(28,COURSE_28_DEF,COURSE_28_QUIZZES_DEF,COURSE_28_FINAL_EXTRA_DEF);