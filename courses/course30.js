/* course30.js — content of Course 30 (Storage networks; loaded on demand via course-core.js) */
/* ============================================================
   COURSE 30 — Storage networks. Why storage is a network problem, block versus file (SAN
   versus NAS), the protocols (iSCSI, NFS, SMB, Fibre Channel), the array in the middle and
   why latency matters more than bandwidth, the dedicated storage VLAN and why it must be
   isolated, and capacity and resilience (RAID, snapshots, replication). Scene d30Net:
   a server and a storage array over a dedicated VLAN.
   ============================================================ */
var C30R={srv:[100,80],host:[100,210],sw:[320,145],sto:[560,80],net:[560,210]};
function d30Net(pfx){
  return '<svg id="'+pfx+'svg" viewBox="0 0 640 262" width="100%" style="display:block">'
    +'<line x1="115" y1="80" x2="305" y2="130" style="stroke:var(--line2);stroke-width:1.6"/>'
    +'<line x1="115" y1="210" x2="305" y2="160" style="stroke:var(--line2);stroke-width:1.6"/>'
    +'<line x1="335" y1="145" x2="545" y2="95" style="stroke:var(--line2);stroke-width:1.6"/>'
    +'<line x1="335" y1="155" x2="545" y2="205" style="stroke:var(--line2);stroke-width:1.6"/>'
    +'<g id="'+pfx+'glow"></g>'
    +csHost(100,80,'server','--green','SERVER')
    +csHost(100,210,'desktop','--amber','USER')
    +csDev(320,145,'l2switch','SW')
    +csHost(560,80,'nas','--violet','ARRAY')
    +csHost(560,210,'lan','--cyan','USERS')
    +'<g id="'+pfx+'dyn"></g></svg>';
}
function d30P(pfx,intro,terms){
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+intro+'</p>'
    +'<div class="osi-stage">'+d30Net(pfx)+'</div><div class="m1-cap" id="'+pfx+'cap"></div>'
    +courseStepControls(pfx)+abbrBox(terms);
}
function d30Mount(pfx,STEPS){
  function show(i){d30lblReset();var g=$(pfx+'glow');if(g)g.innerHTML=STEPS[i].glow||'';var d=$(pfx+'dyn');if(d)d.innerHTML=STEPS[i].dyn||'';var c=$(pfx+'cap');if(c)c.innerHTML='<span>'+STEPS[i].cap+'</span>';}
  courseStepper(pfx,STEPS.length,show);
}
function d30g(name,color){var p=C30R[name];return csGlow(p[0],p[1],color,20);}
// Labels stack downward inside the diagram (y <= 250) so two of them can never
// overprint; below it the caller's row is kept. A label whose argument went
// missing renders nothing -- esc() would make it a stray empty <text>.
var D30Y=1;
function d30lbl(x,y,tx,c){
  if(tx==null||tx==='')return '';
  if(y!=null&&y<=250){ D30Y=Math.max(D30Y,y+14); y=D30Y; }
  return '<text x="'+x+'" y="'+y+'" text-anchor="middle" style="font:700 7.5px var(--mono);fill:var('+c+')">'+esc(tx)+'</text>';
}
function d30lblReset(){D30Y=1;}
function d30pkt(path,color,dur){return '<rect x="-6" y="-4" width="12" height="9" rx="2" style="fill:var('+color+')"><animateMotion path="'+path+'" dur="'+(dur||'1.4s')+'" repeatCount="indefinite"/></rect>';}

/* ---------- L1M1 — Why storage is a network problem ---------- */
function renderC30Why(){return d30P('d30a',
  'For a long time storage was something a server simply had inside it. Then two things happened: the data grew beyond what fits in one machine, and it needed to be <b>shared</b> – between servers, between sites, between people. At that point storage became <b>a service across the network</b>, and it inherited every problem the network has always had. A block the server cannot read is an application failure, not a hardware one; a congested link in front of the array is an outage for everyone behind it; and a firewall rule that nobody thought about can separate a database from the storage it cannot run without. The shift matters because the expectations changed too: storage used to be <b>slow and safe</b>, and now it has to be <b>fast and still safe</b>. That is the whole design tension of this course. The practical consequence for the rest of your networking: storage traffic is <b>not</b> ordinary traffic, and it wants a network designed differently.',
  [['array','the collection of drives presented as one unit of storage; the unit that fails, not the disk inside it.']]);}
function mountC30Why(){d30Mount('d30a',[
  {glow:d30g('srv','--muted'),dyn:d30lbl(100,56,'the disk was inside the server','--muted'),cap:'Once, storage was a disk <b>inside</b> the server, and the network was not involved.'},
  {glow:d30g('sto','--cyan')+d30g('srv','--cyan'),dyn:d30pkt('M 335 145 L 545 95','--cyan','1.1s')+d30lbl(445,140,'then it grew, and it had to be shared','--cyan'),cap:'Data outgrew one machine and had to be <b>shared</b> – so storage became a service across the network.'},
  {glow:d30g('sto','--red'),dyn:d30lbl(445,254,'a block it cannot read is an application outage','--red'),cap:'From then on a <b>storage</b> fault is an <b>application</b> fault. A firewall rule can separate a database from what it cannot run without.'},
  {glow:d30g('sto','--amber')+d30g('srv','--amber'),dyn:d30lbl(245,140,'now it must be fast AND still safe','--amber'),cap:'Storage used to be slow and safe. Now it has to be <b>fast and still safe</b> – that is the tension.'}
]);}

/* ---------- L1M2 — Block or file ---------- */
function renderC30BlockFile(){return d30P('d30b',
  'The first decision is whether the network delivers <b>blocks</b> or <b>files</b>, because it decides everything else. With <b>block storage</b> the array presents raw disk to the server, which formats it as it likes; the network sees only opaque blocks and cannot tell what is stored. That is what a database wants, because a database reads and writes precise byte ranges and needs to control the disk itself. With <b>file storage</b> the array understands files and folders and serves them over the network; the server asks for a path and gets the file. That is what users and applications want. <b>SAN</b> (Storage Area Network) is block storage over a dedicated network; <b>NAS</b> (Network Attached Storage) is file storage that simply attaches to the network. The trade is the classic one: block gives <b>performance and control</b> at the cost of complexity and a network of its own; file gives <b>simplicity and reachability</b> at the cost of protocol overhead. Do not treat one as a cheaper version of the other – a database server given NAS will work and will be measurably slower.',
  [['SAN','Storage Area Network: block storage presented raw over a dedicated network, for databases.'],
   ['NAS','Network Attached Storage: file storage served over the network, for users and shares.']]);}
function mountC30BlockFile(){d30Mount('d30b',[
  {glow:d30g('sto','--violet')+d30g('srv','--violet'),dyn:d30lbl(445,140,'block: the array shows raw disk','--violet'),cap:'<b>Block storage:</b> the network carries opaque blocks; the server owns the filesystem.'},
  {glow:d30g('srv','--green'),dyn:d30lbl(100,56,'a database wants exactly that','--green'),cap:'A <b>database</b> wants this: precise byte ranges, and control of the disk itself. That is a <b>SAN</b>.'},
  {glow:d30g('sto','--amber')+d30g('net','--amber'),dyn:d30lbl(560,232,'file: the array knows about files','--amber'),cap:'<b>File storage:</b> the array understands paths and shares. That is a <b>NAS</b>.'},
  {glow:d30g('srv','--amber'),dyn:d30lbl(245,140,'simple and reachable, but slower per operation','--amber'),cap:'The trade: <b>performance and control</b> versus <b>simplicity and reachability</b>. Neither is a cheap version of the other.'}
]);}

/* ---------- L2M1 — The protocols ---------- */
function renderC30Proto(){return d30P('d30c',
  'You meet storage as ports, and the port tells you which problem you are looking at. <b>NFS</b> (2049) and <b>SMB/CIFS</b> (445) are <b>file</b> protocols: NFS is the Unix one and is how the simulator’s NAS and the storage-vlan task present storage; SMB is what Windows uses and you already know it from the course <i>Switching and VLANs</i> as file sharing. <b>iSCSI</b> (3260) is the interesting one: it carries <b>block</b> storage over ordinary TCP, so a SAN can run over the network you already have instead of needing dedicated Fibre Channel hardware. That is its whole appeal and its main risk. <b>Fibre Channel</b> is the dedicated protocol for block storage, and it is a different world – its own addressing, its own switches, its own terminology. The pattern worth noticing: <b>block protocols care about latency, file protocols care about throughput</b>. A file copy wants a fast pipe; a database write wants a fast <i>answer</i>. Everything in how you design the network follows from that sentence.',
  [['iSCSI','block storage carried inside TCP (port 3260), so a SAN can use the existing network.'],
   ['Fibre Channel','the dedicated protocol for block storage, with its own fabric, addressing and switches.']]);}
function mountC30Proto(){d30Mount('d30c',[
  {glow:d30g('sto','--amber')+d30g('net','--amber'),dyn:d30lbl(445,220,'NFS 2049 · SMB 445 → files','--amber'),cap:'<b>File protocols:</b> NFS (2049) and SMB (445) – the array serves paths and shares.'},
  {glow:d30g('sto','--violet')+d30g('srv','--violet'),dyn:d30lbl(445,140,'iSCSI 3260 → blocks over TCP','--violet'),cap:'<b>iSCSI (3260)</b> carries <b>block</b> storage over ordinary TCP – a SAN without dedicated hardware.'},
  {glow:d30g('srv','--cyan'),dyn:d30lbl(100,56,'Fibre Channel: a whole separate world','--cyan'),cap:'<b>Fibre Channel</b> is the dedicated block protocol, with its own fabric and addressing.'},
  {glow:d30g('sto','--green'),dyn:d30lbl(245,140,'file wants throughput; block wants latency','--green'),cap:'The pattern to remember: <b>file wants throughput, block wants latency</b> – and the design follows from it.'}
]);}

/* ---------- L2M2 — Why latency beats bandwidth ---------- */
function renderC30Latency(){return d30P('d30d',
  'This is the single most important idea in the course, and it is the opposite of what everyone assumes. People think storage performance is about <b>bandwidth</b>. It is not. Bandwidth is how much you can move per second; <b>latency</b> is how long one operation takes to be answered. A database transaction does thousands of small reads and writes; a hundred of them can arrive in the same instant and each still needs its own answer. Widen the pipe and nothing improves, because they were never queuing behind one another – they were waiting for <b>round trips</b>. Halve the latency and all of them finish sooner. That is why the rules in this area look odd compared with the rest of networking: <b>many small queues beat one big one</b>; keep the storage traffic <b>off the user network</b> so it is not competing with anything; and never put a device that adds latency in the middle. A device that adds a millisecond “for security” can cost more than every bandwidth optimisation you did, because it taxes every single operation rather than the total.',
  [['latency','the time for one operation to be answered; for storage it dominates over raw bandwidth.'],
   ['round trip','request to the array and the answer back; add latency here and every small operation pays it.']]);}
function mountC30Latency(){d30Mount('d30d',[
  {glow:d30g('srv','--muted')+d30g('sto','--muted'),dyn:d30lbl(445,140,'a thousand small reads','--muted'),cap:'A transaction is <b>thousands of small reads</b> and writes – each needing its own answer.'},
  {glow:d30g('srv','--amber')+d30g('sto','--amber'),dyn:d30lbl(445,220,'a wider pipe changes nothing','--amber'),cap:'A wider pipe does not help: they were not queuing behind one another, they were waiting for <b>round trips</b>.'},
  {glow:d30g('srv','--green')+d30g('sto','--green'),dyn:d30lbl(245,140,'halve the latency and they all finish sooner','--green'),cap:'Halve the <b>latency</b> and every one of them finishes sooner. That is the lever.'},
  {glow:d30g('srv','--red')+d30g('sto','--red'),dyn:d30lbl(445,254,'a device adding 1 ms taxes every operation','--red'),cap:'So an “inspection” device costing one millisecond taxes <b>every</b> operation, not the total.'}
]);}

/* ---------- L3M1 — The storage VLAN ---------- */
function renderC30Vlan(){return d30P('d30e',
  'Storage must have its <b>own VLAN</b>, and the reason is not tidiness. The array is the one thing a database cannot work without, so it should be reachable from the servers and from <b>nothing else</b>. Putting it on the user VLAN means a laptop, a printer or – the realistic case – a compromised workstation can address it directly, and its backup credentials or its management interface are one misconfiguration away from the open. A dedicated VLAN gives you three things at once: a place to put an <b>ACL</b> that says “the application servers yes, everyone else no”; a place to apply <b>QoS</b> so backup jobs cannot starve live traffic (the course <i>Quality of Service in depth</i>); and a place to keep the array <b>off the user network</b> entirely. The pattern is exactly the one from the course <i>Splitting a network: subnets in practice</i> – storage gets its own subnet, carried over <b>trunks</b> that are not user traffic. You can build exactly this in the simulator: the storage-vlan task asks you to trunk the storage VLAN across the switches while the firewall keeps the clients out.',
  [['storage VLAN','a dedicated VLAN for storage traffic, allowing an ACL and QoS to be applied to it independently.']]);}
function mountC30Vlan(){d30Mount('d30e',[
  {glow:d30g('srv','--muted')+d30g('host','--muted')+d30g('sto','--muted'),dyn:d30lbl(445,140,'everything on one VLAN','--muted'),cap:'With everything on one VLAN, anything on the network can <b>address the array directly</b>.'},
  {glow:d30g('host','--red')+d30g('sto','--red'),dyn:d30lbl(445,254,'a compromised laptop, one misconfiguration away','--red'),cap:'A compromised workstation is then one misconfiguration away from the array’s management interface.'},
  {glow:d30g('sto','--violet'),dyn:d30lbl(560,56,'storage VLAN','--violet'),cap:'Give storage its <b>own VLAN</b> – its own subnet, carried on trunks.'},
  {glow:d30g('srv','--green')+d30g('sto','--green'),dyn:d30lbl(245,140,'one place for the ACL, for QoS, and to keep users out','--green'),cap:'One place to put an <b>ACL</b>, one for <b>QoS</b>, and to keep users off it entirely.'}
]);}

/* ---------- L3M2 — Capacity and survival ---------- */
function renderC30Resil(){return d30P('d30f',
  'At the storage layer, resilience is bought with copies, and the vocabulary is worth knowing. <b>RAID</b> combines several drives so that one failing does not lose the data – RAID 1 mirrors, RAID 5 and 6 spread parity across drives. <b>Snapshots</b> are cheap point-in-time copies: the array records only what changed, so you can undo a mistake, and that single feature is what makes ransomware survivable, because restoring a snapshot is a normal operation rather than a restore from tape. <b>Replication</b> copies to a second site, which is the only thing that survives the loss of the building. Two warnings close the course. First, <b>RAID is not a backup</b>: it protects against a disk failing and against nothing else – it faithfully replicates a deletion, a corruption or an attacker. Second, <b>replication is not resilience</b> unless the copy is isolated: replication that ransomware can reach, replicates the damage too. Then the networking lesson applies as always – a second copy that <b>cannot be reached</b> is not a backup either, so backups need their own path and their own monitoring, like everything else in the resilience course.',
  [['RAID','combining drives so one can fail without losing data; it is availability, not a backup.'],
   ['snapshot','a cheap point-in-time copy recording only changes; the main defence against ransomware.'],
   ['replication','a live copy at a second site; the only thing that survives losing the building.']]);}
function mountC30Resil(){d30Mount('d30f',[
  {glow:d30g('sto','--muted'),dyn:d30lbl(560,56,'RAID: survives a disk failing','--muted'),cap:'<b>RAID</b> survives a disk failing. It is availability, not a backup.'},
  {glow:d30g('sto','--red'),dyn:d30lbl(560,232,'and faithfully replicates a deletion','--red'),cap:'It replicates a deletion, a corruption, or an attacker just as faithfully. <b>RAID is not a backup</b>.'},
  {glow:d30g('sto','--green')+d30g('srv','--green'),dyn:d30lbl(445,140,'snapshots: undo a mistake in minutes','--green'),cap:'<b>Snapshots</b> are cheap and make ransomware survivable – restoring one is a normal operation.'},
  {glow:d30g('sto','--amber'),dyn:d30lbl(245,254,'replication only helps if the copy is isolated','--amber'),cap:'<b>Replication</b> survives losing the building – but only if the copy is <b>out of reach</b> of the damage.'}
]);}

const COURSE_30_DEF = {
  id:'course30',
title:'Storage networks: block, file and the array',
  blurb:'Where storage became a network service. Block versus file (SAN versus NAS) and why a database wants one and users the other, the protocols (NFS, SMB, iSCSI, Fibre Channel), the idea that undoes most assumptions – latency matters more than bandwidth – the dedicated storage VLAN and its ACL, and resilience with RAID, snapshots and replication.',
  lessons:[
    { id:'c30l1', title:'Why storage is a network problem', taskId:null, quizId:'c30q_l1', modules:[
      { id:'c30l1m1', title:'From a disk inside the server to a service', render:renderC30Why, mount:mountC30Why },
      { id:'c30l1m2', title:'Block or file: SAN versus NAS', render:renderC30BlockFile, mount:mountC30BlockFile }
    ]},
    { id:'c30l2', title:'How storage speaks', taskId:'slow-link', quizId:'c30q_l2', modules:[
      { id:'c30l2m1', title:'The protocols you meet as ports', render:renderC30Proto, mount:mountC30Proto },
      { id:'c30l2m2', title:'Latency beats bandwidth', render:renderC30Latency, mount:mountC30Latency }
    ]},
    { id:'c30l3', title:'Designing for it', taskId:'storage-vlan', quizId:'c30q_l3', modules:[
      { id:'c30l3m1', title:'The storage VLAN', render:renderC30Vlan, mount:mountC30Vlan },
      { id:'c30l3m2', title:'Capacity and survival', render:renderC30Resil, mount:mountC30Resil }
    ]}
  ]
};

const COURSE_30_QUIZZES_DEF = {
  c30q_l1:{ title:'Quiz: Why storage is a network problem', qs:[
    { q:'What changed to make storage a network concern?',
      opts:['disks became smaller','the data outgrew one machine and had to be shared','copies became more expensive'],
      correct:1, why:'Once storage is shared across servers and sites, it inherits every network problem – and a storage fault becomes an application fault.' },
    { q:'In block storage, what can the network see?',
      opts:['the filenames in each block','nothing about the content: it carries opaque blocks','the database schema'],
      correct:1, why:'The array presents raw disk and the server owns the filesystem, so the network cannot tell what is stored.' },
    { q:'Why does a database prefer block storage?',
      opts:['it is always cheaper','it reads and writes precise byte ranges and needs to control the disk itself','because block storage needs no network'],
      correct:1, why:'File storage adds protocol overhead per operation. A database doing many small operations feels that directly.' },
    { q:'What is the difference between a SAN and a NAS?',
      opts:['SAN is cheaper, NAS is faster','SAN is block storage, usually on a dedicated network; NAS is file storage attached to the network','they are the same thing with different vendors'],
      correct:1, why:'Block gives performance and control; file gives simplicity and reachability. Neither is a cheap version of the other.' },
    { q:'A database server given a NAS will work. What will be true?',
      opts:['it will be faster','it will be measurably slower','it will refuse to start'],
      correct:1, why:'Protocol overhead on many small operations. Correct and workable, but slower – and the difference grows with the operation count.' }
  ]},
  c30q_l2:{ title:'Quiz: How storage speaks', qs:[
    { q:'Which of these is a file protocol?',
      opts:['iSCSI','NFS','Fibre Channel'],
      correct:1, why:'NFS (2049) and SMB (445) serve files. iSCSI and Fibre Channel carry blocks.' },
    { q:'What is iSCSI for?',
      opts:['carrying block storage over ordinary TCP, so a SAN can use the existing network','encrypting file shares','serving printers'],
      correct:0, why:'That is its whole appeal: SAN semantics without dedicated Fibre Channel hardware – and that is also its main risk.' },
    { q:'For storage, which matters more: bandwidth or latency?',
      opts:['bandwidth, as with any network','latency','they are always equal'],
      correct:1, why:'Block workloads are many small operations, not one big transfer. They wait on round trips, not on capacity.' },
    { q:'Why would widening the link not help a slow database?',
      opts:['because the cable is the limit','because the operations were never queuing behind one another – each waits its own round trip','because storage ignores the network'],
      correct:1, why:'They arrive in the same instant and each needs its own answer. Halve the latency and they all finish sooner.' },
    { q:'A security device adds one millisecond to traffic on the storage path. What is the consequence?',
      opts:['none measurable','it taxes every single small operation rather than the total','it adds 1 ms to the total only'],
      correct:1, why:'Latency is per operation. A per-operation tax is a very different thing from a per-megabyte cost.' }
  ]},
  c30q_l3:{ title:'Quiz: Designing for it', qs:[
    { q:'Why should storage have its own VLAN?',
      opts:['to make the topology look tidier','so an ACL and QoS can be applied to it independently, and users cannot address it directly','because storage protocols require it'],
      correct:1, why:'The array is what a database cannot work without, so it should be reachable from the servers and from nothing else.' },
    { q:'A trunk between switches is left as an access port, so the storage VLAN cannot cross. What are the symptoms?',
      opts:['everything works but slowly','the servers lose access to the array while the user network is unaffected','the firewall blocks the database'],
      correct:1, why:'The VLAN never arrives where it should – which is exactly the storage-vlan task in the simulator.' },
    { q:'What does RAID protect against?',
      opts:['deletion and ransomware','a drive failing','a lost building'],
      correct:1, why:'RAID gives availability across drive failures. It faithfully replicates a deletion, a corruption, or an attacker.' },
    { q:'Why are snapshots the main defence against ransomware?',
      opts:['they encrypt the data','they make restoring to a known-good point a normal operation','they block the infection'],
      correct:1, why:'Restoring becomes a routine operation rather than a tape restore under pressure.' },
    { q:'When does replication not help?',
      opts:['when the copy is reachable by the same attacker, or when the backup network path is down','never','when it runs over iSCSI'],
      correct:0, why:'Replication that ransomware can reach replicates the damage. A copy that cannot be reached is not a backup either.' }
  ]}
};

const COURSE_30_FINAL_EXTRA_DEF = [
  { q:'A storage array is fast and the link is fast, yet the database is slow. What should you look at first?',
    opts:['the array’s throughput','the number of hops and devices adding latency on the storage path','the DNS server'],
    correct:1, why:'With many small operations, every millisecond of added latency is paid thousands of times. This is the lesson of the latency module.' },
  { q:'Why should the array be on a VLAN with no user devices on it?',
    opts:['so it can be reached more quickly','so an ACL can name the application servers and deny everything else','because switches cannot route without VLANs'],
    correct:1, why:'Isolation is the point. A workstation with any credentials to the array on the same VLAN is one misconfiguration from exposing it.' }
];

__regCourse(30,COURSE_30_DEF,COURSE_30_QUIZZES_DEF,COURSE_30_FINAL_EXTRA_DEF);