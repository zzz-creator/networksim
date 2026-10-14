/* course29.js — content of Course 29 (QoS in depth; loaded on demand via course-core.js) */
/* ============================================================
   COURSE 29 — QoS in depth. From one boolean to a mechanism: what a congested link does,
   classification (marking DSCP/802.1p and trust boundaries), queuing and scheduling,
   policing versus shaping, the tools (CBWFQ, LLQ, WRED) and where VoIP's trust
   requirement comes from. Scene d29Net: a voice and a data host behind one congested link.
   ============================================================ */
var C29R={voice:[90,80],data:[90,210],sw:[320,145],srv:[560,80],net:[560,210]};
function d29Net(pfx){
  return '<svg id="'+pfx+'svg" viewBox="0 0 640 262" width="100%" style="display:block">'
    +'<line x1="105" y1="80" x2="305" y2="130" style="stroke:var(--line2);stroke-width:1.6"/>'
    +'<line x1="105" y1="210" x2="305" y2="160" style="stroke:var(--line2);stroke-width:1.6"/>'
    +'<line x1="335" y1="145" x2="545" y2="95" style="stroke:var(--line2);stroke-width:1.6"/>'
    +'<line x1="335" y1="155" x2="545" y2="205" style="stroke:var(--line2);stroke-width:1.6"/>'
    +'<g id="'+pfx+'glow"></g>'
    +csHost(90,80,'phone','--violet','VOICE')
    +csHost(90,210,'desktop','--amber','DATA')
    +csDev(320,145,'l2switch','SW')
    +csHost(560,80,'server','--green','SERVER')
    +csHost(560,210,'lan','--cyan','NET')
    +'<g id="'+pfx+'dyn"></g></svg>';
}
function d29P(pfx,intro,terms){
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+intro+'</p>'
    +'<div class="osi-stage">'+d29Net(pfx)+'</div><div class="m1-cap" id="'+pfx+'cap"></div>'
    +courseStepControls(pfx)+abbrBox(terms);
}
function d29Mount(pfx,STEPS){
  function show(i){d29lblReset();var g=$(pfx+'glow');if(g)g.innerHTML=STEPS[i].glow||'';var d=$(pfx+'dyn');if(d)d.innerHTML=STEPS[i].dyn||'';var c=$(pfx+'cap');if(c)c.innerHTML='<span>'+STEPS[i].cap+'</span>';}
  courseStepper(pfx,STEPS.length,show);
}
function d29g(name,color){var p=C29R[name];return csGlow(p[0],p[1],color,20);}
// Labels stack downward inside the diagram (y <= 250) so two of them can never
// overprint; below it the caller's row is kept. A label whose argument went
// missing renders nothing -- esc() would make it a stray empty <text>.
var D29Y=1;
function d29lbl(x,y,tx,c){
  if(tx==null||tx==='')return '';
  if(y!=null&&y<=250){ D29Y=Math.max(D29Y,y+14); y=D29Y; }
  return '<text x="'+x+'" y="'+y+'" text-anchor="middle" style="font:700 7.5px var(--mono);fill:var('+c+')">'+esc(tx)+'</text>';
}
function d29lblReset(){D29Y=1;}
function d29pkt(path,color,dur){return '<rect x="-6" y="-4" width="12" height="9" rx="2" style="fill:var('+color+')"><animateMotion path="'+path+'" dur="'+(dur||'1.4s')+'" repeatCount="indefinite"/></rect>';}

/* ---------- L1M1 — What a congested link does ---------- */
function renderC29Congest(){return d29P('d29a',
  'The engine behind every QoS mechanism is one plain fact: <b>a link has a fixed capacity</b>, and when more data arrives per second than can be sent, something has to wait. The queue in front of the link grows, and with it <b>latency</b>. If it keeps growing, packets begin to be dropped – tail drop – because routers do not wait forever. And that is where QoS earns its place: <b>a voice call cannot tolerate delay or loss</b>. Ten milliseconds is fine; a quarter-second and the conversation is already stuttering. File transfers and email can wait without complaint, so when a link is full it is better for the <b>download to slow down</b> and the <b>call to stay clear</b>. QoS is simply the arrangement that makes that happen deliberately, instead of leaving it to luck. Note the important consequence: <b>QoS adds no capacity</b>. It reorders who suffers on a link that is already full.',
  [['tail drop','discarding packets when a queue is full – what happens by default on a congested link.']]);}
function mountC29Congest(){d29Mount('d29a',[
  {glow:d29g('data','--muted')+d29g('sw','--muted'),dyn:d29lbl(445,140,'one link, fixed capacity','--muted'),cap:'A link has a <b>fixed capacity</b>. When more arrives than can be sent, something must wait.'},
  {glow:d29g('sw','--amber'),dyn:d29lbl(445,220,'the queue grows → latency grows','--amber'),cap:'The queue in front of the link fills, and with it the <b>latency</b>.'},
  {glow:d29g('data','--red'),dyn:d29lbl(445,254,'queue full → packets dropped','--red'),cap:'Then packets are <b>dropped</b> – tail drop, the default behaviour.'},
  {glow:d29g('voice','--violet')+d29g('data','--amber'),dyn:d29lbl(245,140,'a call cannot wait; a download can','--violet'),cap:'A <b>call</b> cannot tolerate delay or loss. So on a full link, let the download wait instead.'}
]);}

/* ---------- L1M2 — Classifying: what deserves better ---------- */
function renderC29Class(){return d29P('d29b',
  'QoS cannot act until it knows <b>what</b> the traffic is, and that is <b>classification</b>. The usual method is to look at the protocol and port: TCP 5060 is signalling, RTP carries the audio, HTTP is a web download. But that is the least trustworthy method, because the <b>endpoint decides</b> what it sends and an endpoint is exactly what an attacker controls. So the reliable method is to have the <b>device itself mark</b> its packets, and let the network sort them out. The marks are <b>DSCP</b> in the IP header and the older <b>802.1p</b> in the Ethernet frame (a “CoS” byte). The design pattern that follows is a <b>trust boundary</b>: the access port where the phone is connected is marked <b>trusting</b> – the phone’s own mark is believed – while the port towards the internet is <b>untrusted</b>, so any mark arriving from outside is <b>discarded and rewritten</b>. Without that rule an attacker would simply mark his bulk download as “voice” and your QoS would hand him the priority.',
  [['DSCP','a 6-bit field in the IP header classifying a packet’s priority; 46/EF is the usual real-time mark.'],
   ['trust boundary','where you believe a device’s own marking (access ports) and where you overwrite it (untrusted edges).']]);}
function mountC29Class(){d29Mount('d29b',[
  {glow:d29g('voice','--violet'),dyn:d29lbl(90,56,'DSCP EF / 802.1p 5','--violet'),cap:'The phone <b>marks its own packets</b> as real time (DSCP EF / 802.1p 5).'},
  {glow:d29g('data','--amber'),dyn:d29lbl(90,232,'mark: best effort','--amber'),cap:'The data host marks its traffic as ordinary <b>best effort</b>.'},
  {glow:d29g('sw','--green'),dyn:d29lbl(445,220,'access port: trust the mark','--green'),cap:'On the <b>access port</b> you trust the device’s mark – it really is a phone.'},
  {glow:d29g('srv','--red'),dyn:d29lbl(445,254,'edge port: discard and rewrite any mark','--red'),cap:'On the <b>edge</b> you do not – otherwise anyone could mark a download as voice.'}
]);}

/* ---------- L2M1 — Queues and how they are served ---------- */
function renderC29Queue(){return d29P('d29c',
  'Classification produces queues: separate waiting rooms for different classes, each served in turn. Which <b>queue</b> a packet lands in is the easy part; how the queues are <b>drained</b> is where the design is. <b>Priority queuing (PQ)</b> always serves the highest queue first and, if that queue is never empty, starves everything below it – unacceptable for data. <b>Weighted fair queuing (WFQ)</b> serves all queues in turn, giving each a guaranteed share, so nothing starves but latency varies. <b>CBWFQ</b> puts these together: a <b>class-based</b> grouping with <b>fair queuing inside</b> it, which is what most real configurations use – a small guaranteed share for voice, fair sharing among the data classes. In the simulator you can see the effect directly: the link-properties dialog on a congested link carries a <b>voice priority</b> setting, and the traffic path test reports the difference for a call against a download.',
  [['WFQ','weighted fair queuing – serve all queues in turn so none starves.'],
   ['CBWFQ','class-based weighted fair queuing – a class for each traffic type, fair queuing within it.']]);}
function mountC29Queue(){d29Mount('d29c',[
  {glow:d29g('sw','--muted'),dyn:d29lbl(445,254,'packets land in queues by class','--muted'),cap:'After classification, each class waits in its own <b>queue</b>.'},
  {glow:d29g('voice','--violet'),dyn:d29pkt('M 335 145 L 545 95','--violet','0.9s')+d29lbl(445,220,'PQ: voice first, always','--violet'),cap:'<b>Priority queuing</b> serves the top queue first – and <b>starves</b> everything below it.'},
  {glow:d29g('data','--amber'),dyn:d29pkt('M 335 155 L 545 205','--amber','1.4s')+d29lbl(445,220,'WFQ: everyone gets a turn','--amber'),cap:'<b>WFQ</b> gives each queue a fair share – nothing starves, but latency varies.'},
  {glow:d29g('voice','--violet')+d29g('data','--amber'),dyn:d29lbl(245,140,'CBWFQ: a class per type, fair queuing inside','--green'),cap:'<b>CBWFQ</b> combines them: a guaranteed share for voice, fair sharing for data.'}
]);}

/* ---------- L2M2 — Shaping or policing ---------- */
function renderC29Shape(){return d29P('d29d',
  'Two ways to make a flow conform to a rate, and the difference matters more than it looks. <b>Policing</b> simply <b>checks</b> each arriving packet against the limit and drops or re-marks what exceeds it. It acts in nanoseconds, needs almost no memory, and is how a WAN edge rate-limits a site – but the punishment is instant and it treats the good packets in the same burst as the bad ones. <b>Shaping</b> actually <b>holds</b> the excess in a buffer and releases it smoothly, so the sender is slowed rather than punished. The cost is that shaping <b>adds latency</b> – it is a queue – and it needs memory, which is why shaping lives on a switch you own and policing lives on a carrier’s edge device. A third tool belongs here: <b>WRED</b> drops traffic <b>early</b> and deliberately (rather than when the buffer is full), which signals “slow down” without penalising the majority. For <b>real-time voice</b> the combination to remember is <b>LLQ</b> (low-latency queuing): a small priority queue for voice with <b>shaping</b> on the rest, so priority traffic never has to queue behind bulk.',
  [['policing','checking a rate and dropping or re-marking the excess – instant, cheap, punishing.'],
   ['shaping','holding the excess in a buffer and releasing it smoothly – adds latency, but slows the sender.'],
   ['LLQ','low-latency queuing: a small priority queue for voice plus shaping for everything else.']]);}
function mountC29Shape(){d29Mount('d29d',[
  {glow:d29g('data','--red'),dyn:d29lbl(445,220,'policing: drop the excess, now','--red'),cap:'<b>Policing</b> checks the rate and drops or re-marks what exceeds it – instantly, cheaply, punishingly.'},
  {glow:d29g('data','--amber'),dyn:d29pkt('M 335 155 L 545 205','--amber','2.2s')+d29lbl(445,220,'shaping: hold it back and release smoothly','--amber'),cap:'<b>Shaping</b> buffers the excess and releases it smoothly – the sender slows down instead.'},
  {glow:d29g('data','--amber'),dyn:d29lbl(445,254,'but the buffer itself adds latency','--amber'),cap:'Shaping costs <b>latency</b> and memory – which is why it lives on your switch and policing on the carrier’s edge.'},
  {glow:d29g('voice','--violet'),dyn:d29lbl(245,140,'LLQ: voice prioritised and shaped, not policed','--green'),cap:'For voice the answer is <b>LLQ</b>: priority for the call, shaping for the rest – never policed.'}
]);}

/* ---------- L3M1 — The VoIP trust problem ---------- */
function renderC29Trust(){return d29P('d29e',
  'This is the failure that makes QoS coursework memorable. A voice packet crosses <b>many links</b>, and on each one it must still be recognisable as voice. So every switch and router in the path must <b>preserve</b> the marking, and each of them must be told which ports to <b>trust</b>. Now the surprising part: many VoIP phones and call-manager software do <b>not</b> mark their own packets – they expect the first switch port to do it, based on the fact that the cable goes to a phone. That is <b>trusting the port</b> rather than the packet, and it is how you deploy it. But the moment the phone is replaced by a laptop, or a user plugs in their own device, something that does not mark anything – or worse, something that marks its download as voice – is sitting on a port you trust. Then the network honours the mark, gives bulk traffic the voice queue, and the <b>real calls</b> are the ones that suffer. The whole QoS design has been defeated by one changed cable. This is why the security course keeps saying the same thing: <b>every trust decision is a security decision</b>.',
  [['trust the port','honouring marks from anything plugged into an access port, because a real phone on it may not mark for itself.']]);}
function mountC29Trust(){d29Mount('d29e',[
  {glow:d29g('voice','--violet')+d29g('sw','--violet'),dyn:d29pkt('M 105 80 L 305 130 L 545 95','--violet','1.3s')+d29lbl(245,140,'every hop must preserve the mark','--violet'),cap:'A call crosses <b>many links</b>; each one must still recognise it as voice.'},
  {glow:d29g('sw','--amber'),dyn:d29lbl(445,220,'so: mark it here, on the first port','--amber'),cap:'Many phones <b>do not mark</b> for themselves – so the access port is trusted to do it.'},
  {glow:d29g('data','--red'),dyn:d29pkt('M 105 210 L 305 160','--red','0.9s')+d29lbl(245,254,'now a laptop sits in that port','--red'),cap:'Replace the phone with a laptop – or let a user plug one in – and the trust is misplaced.'},
  {glow:d29g('voice','--red')+d29g('data','--red'),dyn:d29lbl(445,220,'bulk data takes the voice queue; real calls suffer','--red'),cap:'QoS is defeated by <b>one changed cable</b>. Every trust decision is a security decision.'}
]);}

/* ---------- L3M2 — Getting it right ---------- */
function renderC29Plan(){return d29P('d29f',
  'Putting the pieces together in the order that actually works. <b>First fix the capacity if you can.</b> QoS reorders who suffers; it does not create bandwidth, and a link that is permanently oversubscribed will feel bad no matter how well it is queued. <b>Mark at the edge</b>, on the access port, and trust nothing arriving from outside. <b>Preserve the marking</b> across every hop, and verify it – a QoS configuration that is silently re-marking somewhere is the most common cause of “the QoS is not working”. <b>Give voice a small, guaranteed share</b> and shape the rest, rather than a large queue that will reintroduce latency. <b>Watch the result</b> on the interface, not in the configuration: drops and queue depth tell you whether the policy is doing anything. And <b>document what you trust and why</b>, because the next person to change a cable will not know what they have broken. This is the same discipline as any other control in the courses <i>Network resilience and scaling</i> and <i>Zero Trust and microsegmentation</i>: a policy nobody monitors is a policy that has quietly stopped working.',
  [['marking','the DSCP/802.1p value on a packet; it must be set at the edge and preserved at every hop.']]);}
function mountC29Plan(){d29Mount('d29f',[
  {glow:d29g('sw','--red'),dyn:d29lbl(445,254,'first: is the link simply too small?','--red'),cap:'<b>First, fix the capacity if you can.</b> QoS reorders who suffers; it creates no bandwidth.'},
  {glow:d29g('voice','--violet')+d29g('sw','--violet'),dyn:d29lbl(445,220,'mark at the edge, trust nothing from outside','--violet'),cap:'<b>Mark at the edge</b> and trust nothing arriving from outside.'},
  {glow:d29g('sw','--amber'),dyn:d29lbl(445,220,'preserve the mark on every hop – and verify it','--amber'),cap:'<b>Preserve and verify:</b> silent re-marking is why “the QoS is not working”.'},
  {glow:d29g('data','--green'),dyn:d29lbl(245,140,'small guaranteed share for voice, shaped rest, then measure','--green'),cap:'<b>Give voice a small guaranteed share</b>, shape the rest, and measure on the interface.'}
]);}

const COURSE_29_DEF = {
  id:'course29',
title:'Quality of Service in depth',
  blurb:'Beyond the one checkbox. What a congested link actually does to a call, how traffic is classified and marked (DSCP and 802.1p) and why the trust boundary is the whole security story, queues and how they are served (PQ, WFQ, CBWFQ), policing versus shaping and why voice wants shaping, the VoIP trust problem that one changed cable can cause, and the order in which a QoS design should actually be done.',
  lessons:[
    { id:'c29l1', title:'The problem', taskId:'qos-voice', quizId:'c29q_l1', modules:[
      { id:'c29l1m1', title:'What a congested link does', render:renderC29Congest, mount:mountC29Congest },
      { id:'c29l1m2', title:'Classifying: what deserves better', render:renderC29Class, mount:mountC29Class }
    ]},
    { id:'c29l2', title:'The mechanisms', taskId:null, quizId:'c29q_l2', modules:[
      { id:'c29l2m1', title:'Queues and how they are served', render:renderC29Queue, mount:mountC29Queue },
      { id:'c29l2m2', title:'Shaping or policing', render:renderC29Shape, mount:mountC29Shape }
    ]},
    { id:'c29l3', title:'Doing it properly', taskId:null, quizId:'c29q_l3', modules:[
      { id:'c29l3m1', title:'The VoIP trust problem', render:renderC29Trust, mount:mountC29Trust },
      { id:'c29l3m2', title:'Getting it right', render:renderC29Plan, mount:mountC29Plan }
    ]}
  ]
};

const COURSE_29_QUIZZES_DEF = {
  c29q_l1:{ title:'Quiz: The problem', qs:[
    { q:'What happens on a link that receives more traffic than it can send?',
      opts:['packets are immediately refused at the sender','a queue grows, latency rises, and then packets are dropped','the link automatically raises its speed'],
      correct:1, why:'Queue, then latency, then tail drop. That sequence is the reason QoS exists at all.' },
    { q:'Why is QoS useful specifically for voice?',
      opts:['because voice uses less bandwidth','because a call cannot tolerate delay or loss, while a download can simply wait','because routers cannot prioritise by port'],
      correct:1, why:'Delay is imperceptible to a file transfer and fatal to a conversation – so on a full link the download should suffer.' },
    { q:'Does QoS add capacity to a link?',
      opts:['yes, priority traffic effectively gets more bandwidth','no – it only decides who waits when the link is already full','yes, if configured correctly'],
      correct:1, why:'That is the point to hold on to. QoS reorders the suffering; it does not create bandwidth.' },
    { q:'Why is marking by the endpoint less trustworthy than classification by port?',
      opts:['it is slower','the endpoint is what an attacker controls, so a mark can be forged','it uses more memory'],
      correct:1, why:'A mark says “trust me”. Leaving it to the sending device lets anyone claim priority – so the edge is where the mark is set.' },
    { q:'What is a trust boundary?',
      opts:['the edge of the network where marks from outside are discarded and rewritten','the point where a router changes an address','the bandwidth you are licensed for'],
      correct:0, why:'You believe marks on the access ports you control and overwrite anything arriving from the internet.' }
  ]},
  c29q_l2:{ title:'Quiz: The mechanisms', qs:[
    { q:'What is the problem with pure priority queuing?',
      opts:['it is too complex to configure','if the top queue is never empty, the lower queues starve','it cannot carry voice'],
      correct:1, why:'Fair queuing exists precisely to give every queue a turn. Priority alone starves the data.' },
    { q:'What does WFQ give you that PQ does not?',
      opts:['lower latency for everything','a guaranteed share per queue, so nothing starves','more total bandwidth'],
      correct:1, why:'WFQ serves all queues in turn. The cost is that latency varies rather than being constant.' },
    { q:'What is the difference between policing and shaping?',
      opts:['policing buffers, shaping drops','policing checks and drops or re-marks the excess; shaping buffers it and releases it smoothly','they are two names for the same thing'],
      correct:1, why:'Policing is instant and punishing; shaping slows the sender but adds latency because the buffer is a queue.' },
    { q:'Why should real-time voice not be policed?',
      opts:['because it is too important','because policing drops the excess instantly, which is exactly what a call cannot tolerate','because policing needs more memory'],
      correct:1, why:'A dropped voice packet is a dropout. LLQ instead prioritises a small voice queue and shapes the rest.' },
    { q:'What does WRED do?',
      opts:['drops traffic early and deliberately, before the buffer is full','compresses the payload','encrypts real-time traffic'],
      correct:0, why:'Dropping early signals “slow down” without punishing the majority the way full-buffer tail drop does.' }
  ]},
  c29q_l3:{ title:'Quiz: Doing it properly', qs:[
    { q:'Why is “trusting the access port” the normal way to deploy voice QoS?',
      opts:['because many phones do not mark their own packets and expect the first switch to do it','because ports cannot be configured per device','because marking is not supported on phones'],
      correct:0, why:'The switch marks on the phone’s behalf. The risk is what happens when something else is plugged into that port.' },
    { q:'A user replaces a phone with a laptop on the trusted port. What is the consequence?',
      opts:['nothing, QoS adapts automatically','the laptop’s unmarked or forged traffic may take the voice queue, and real calls suffer','the port goes down for security'],
      correct:1, why:'The policy has been defeated by one changed cable. This is the whole security lesson of QoS: every trust decision is a security decision.' },
    { q:'What should you do before tuning queues at all?',
      opts:['raise the priority of everything','check whether the link is simply undersized','disable tail drop'],
      correct:1, why:'A permanently oversubscribed link feels bad however well it is queued. Capacity first, then QoS.' },
    { q:'What is the most common cause of “the QoS is not working”?',
      opts:['the mark being silently discarded or rewritten somewhere along the path','too many VLANs','the wrong DNS server'],
      correct:0, why:'A mark lost at one hop makes everything downstream meaningless. Always verify that it survives the whole path.' }
  ]}
};

const COURSE_29_FINAL_EXTRA_DEF = [
  { q:'Why is policing the wrong tool for voice traffic on a WAN link?',
    opts:['it is too expensive','because it drops the excess instantly, and a dropped voice packet is an audible dropout','because it cannot run at line rate'],
    correct:1, why:'Policing protects the link by punishing the flow. For real time you want LLQ: a small priority queue plus shaping for everything else.' },
  { q:'What single field, if discarded anywhere on the path, silently makes every QoS policy useless?',
    opts:['the source IP address','the DSCP/802.1p marking','the VLAN tag'],
    correct:1, why:'The mark is how the network knows what the packet is. Lose it and every queue, class and policy downstream is guessing.' }
];

__regCourse(29,COURSE_29_DEF,COURSE_29_QUIZZES_DEF,COURSE_29_FINAL_EXTRA_DEF);