/* course32.js — content of Course 32 (IPv4 packet internals; loaded on demand via course-core.js) */
function d32P(pfx,intro){return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+intro+'</p><div class="m1-cap" id="'+pfx+'cap"></div>'+courseStepControls(pfx);}
function d32Mount(pfx,STEPS){function show(i){var c=$(pfx+'cap');if(c)c.innerHTML='<span>'+STEPS[i].cap+'</span>';}courseStepper(pfx,STEPS.length,show);}

/* ---------- L1M1 ---------- */
function renderC32Header(){return d32P('d32a','An IPv4 packet starts with a <b>header</b> of at least 20 bytes: version and IHL, total length, identification, flags (DF/MF), fragment offset, TTL, protocol, header checksum, source and destination address. The header is what every router reads to forward the packet; the payload is what it carries.');}
function mountC32Header(){d32Mount('d32a',[
 {cap:'Version (4) and <b>IHL</b> (header length in 32-bit words).'},
 {cap:'<b>Total length</b>: header plus payload, in bytes.'},
 {cap:'<b>TTL</b> decrements per hop; <b>protocol</b> says what is inside.'},
 {cap:'Source and <b>destination</b> address drive forwarding.'}
]);}
/* ---------- L2M1 ---------- */
function renderC32Mtu(){return d32P('d32b','Every link has a <b>maximum transmission unit (MTU)</b>: the largest packet it can carry in one frame. Ethernet is 1500 bytes by default. If a packet is larger than the outgoing link’s MTU, it must be split – or dropped, if splitting is forbidden.');}
function mountC32Mtu(){d32Mount('d32b',[
 {cap:'<b>MTU</b> = largest packet a link can carry in one frame.'},
 {cap:'Ethernet default MTU is <b>1500 bytes</b>.'},
 {cap:'A packet bigger than the MTU must be split or dropped.'},
 {cap:'The limit is per link, not per path.'}
]);}
/* ---------- L3M1 ---------- */
function renderC32Frag(){return d32P('d32c','When a packet does not fit, IPv4 <b>fragments</b> it: the original is split into pieces, each a valid packet with its own header. The <b>identification</b> field ties the pieces together, the <b>fragment offset</b> says where each piece belongs, and the <b>MF (more fragments)</b> bit marks all but the last. The <b>DF (don’t fragment)</b> bit forbids splitting: if the packet does not fit, it is dropped and an error is returned instead.');}
function mountC32Frag(){d32Mount('d32c',[
 {cap:'<b>Identification</b> ties the fragments together.'},
 {cap:'<b>Fragment offset</b> says where each piece belongs.'},
 {cap:'<b>MF</b> marks all but the last fragment.'},
 {cap:'<b>DF</b> forbids splitting; the packet is dropped instead.'}
]);}
/* ---------- L3M2 ---------- */
function renderC32Reasm(){return d32P('d32d','Fragments are <b>reassembled</b> only at the destination, not in the routers along the way. The destination waits for all pieces (matched by identification, source and destination), orders them by offset, and rebuilds the original packet. If a piece is missing, the whole packet is discarded after a timeout – which is why fragmentation is costly and avoided where possible.');}
function mountC32Reasm(){d32Mount('d32d',[
 {cap:'Reassembly happens <b>only at the destination</b>.'},
 {cap:'Pieces are matched by identification, source and destination.'},
 {cap:'Ordered by <b>offset</b>, then rebuilt.'},
 {cap:'A missing piece discards the whole packet after a timeout.'}
]);}
/* ---------- L4M1 ---------- */
function renderC32Pmtu(){return d32P('d32e','<b>Path MTU discovery</b> avoids fragmentation by finding the smallest MTU along the whole path. The sender sends packets with the <b>DF bit set</b>; if a router cannot forward one, it drops it and returns an error naming the limiting MTU. The sender then lowers its packet size. Modern systems do this automatically, which is why large transfers usually travel unfragmented.');}
function mountC32Pmtu(){d32Mount('d32e',[
 {cap:'Send with <b>DF set</b> to probe the path.'},
 {cap:'A router that cannot forward drops it and reports the MTU.'},
 {cap:'The sender lowers its packet size accordingly.'},
 {cap:'Result: large transfers travel <b>unfragmented</b>.'}
]);}

const COURSE_32_DEF={
 id:'course32', title:'IPv4 packet internals: MTU and fragmentation',
 blurb:'What an IPv4 packet really is. The header field by field, why every link has a maximum transmission unit and what happens when a packet does not fit, fragmentation and reassembly (offsets and the MF/DF bits), and path MTU discovery – the mechanism that keeps large packets from being chopped up.',
 lessons:[
  {id:'c32l1',title:'The IPv4 header',taskId:null,quizId:'c32q_l1',modules:[
    {id:'c32l1m1',title:'Header fields, field by field',render:renderC32Header,mount:mountC32Header}
  ]},
  {id:'c32l2',title:'MTU: the link limit',taskId:null,quizId:'c32q_l2',modules:[
    {id:'c32l2m1',title:'Why a link has a maximum',render:renderC32Mtu,mount:mountC32Mtu}
  ]},
  {id:'c32l3',title:'Fragmentation',taskId:null,quizId:'c32q_l3',modules:[
    {id:'c32l3m1',title:'Chopping a packet up',render:renderC32Frag,mount:mountC32Frag},
    {id:'c32l3m2',title:'Reassembly',render:renderC32Reasm,mount:mountC32Reasm}
  ]},
  {id:'c32l4',title:'Path MTU discovery',taskId:null,quizId:'c32q_l4',modules:[
    {id:'c32l4m1',title:'Finding the smallest link',render:renderC32Pmtu,mount:mountC32Pmtu}
  ]}
 ]
};

const COURSE_32_QUIZZES_DEF={
 c32q_l1:{title:'Quiz: IPv4 header',qs:[
  {q:'Which field identifies the next protocol inside the packet?',opts:['protocol','identification','total length'],correct:0,why:'The protocol field says what is carried (TCP, UDP, ICMP, …).'},
  {q:'What does TTL do?',opts:['limits how long a packet may live in seconds','decrements per hop and kills stale packets','sets the fragment size'],correct:1,why:'TTL is decremented by every router; at zero the packet is discarded.'},
 {q:'Which field ties fragments of one packet together?',opts:['total length','identification','protocol'],correct:1,why:'The identification field is the same for all fragments of one packet.'}
 ]},
 c32q_l2:{title:'Quiz: MTU',qs:[
  {q:'What is the default Ethernet MTU?',opts:['576 bytes','1500 bytes','9000 bytes'],correct:1,why:'Ethernet defaults to 1500 bytes; jumbo frames are an exception.'},
  {q:'If a packet is larger than the outgoing link’s MTU …',opts:['it is always dropped','it must be fragmented or dropped','the link raises its MTU'],correct:1,why:'It is split into fragments, or dropped if DF is set.'},
 {q:'The MTU limits …',opts:['the whole path','one link','the payload only'],correct:1,why:'MTU is a per-link limit, not a path limit.'}
 ]},
 c32q_l3:{title:'Quiz: fragmentation',qs:[
  {q:'Which bit forbids fragmentation?',opts:['MF','DF','the offset'],correct:1,why:'DF (don’t fragment) forbids splitting; the packet is dropped instead.'},
  {q:'Where are fragments reassembled?',opts:['at every router along the path','only at the destination','at the first router'],correct:1,why:'Reassembly happens only at the destination, which is why fragmentation is costly.'},
 {q:'What does the fragment offset describe?',opts:['the size of the fragment','where the fragment belongs in the original packet','the number of fragments'],correct:1,why:'The offset says where the fragment belongs in the original packet.'}
 ]},
 c32q_l4:{title:'Quiz: PMTUD',qs:[
  {q:'How does path MTU discovery find the smallest link?',opts:['by fragmenting until nothing is dropped','by sending DF-set packets and learning from drop reports','by asking the routers'],correct:1,why:'DF-set probes are dropped by the limiting router, which reports the MTU.'},
 {q:'What does setting the DF bit request?',opts:['fragmentation','no fragmentation; drop instead','a larger MTU'],correct:1,why:'DF (don’t fragment) forbids splitting, so an oversized packet is dropped.'},
 {q:'Who reassembles fragments in PMTUD’s absence?',opts:['each router','the destination','the sender'],correct:1,why:'Fragments are reassembled only at the destination.'}
 ]}
};
const COURSE_32_FINAL_EXTRA_DEF=[
 {q:'Why is fragmentation avoided in practice?',opts:['because it is forbidden by IPv4','because reassembly only at the destination and a missing fragment discards the whole packet','because routers cannot read fragments'],correct:1,why:'Fragmentation is costly: reassembly only at the destination, and one missing piece loses the whole packet.'}
];

__regCourse(32,COURSE_32_DEF,COURSE_32_QUIZZES_DEF,COURSE_32_FINAL_EXTRA_DEF);