/* course26.js — content of Course 26 (The physical layer; loaded on demand via course-core.js) */
/* ============================================================
   COURSE 26 — The physical layer. What a cable actually is, copper against fibre and
   where the limit lies, straight-through against crossover, link speed and duplex and
   what a mismatch does, PoE and how power reaches a device, and how a link is diagnosed
   from both ends. Scene d26Net: PC — SW — SW with a link between them.
   ============================================================ */
var C26R={pc:[100,80],sw1:[330,80],sw2:[560,80],lan:[215,210],srv:[475,210]};
function d26Net(pfx){
  return '<svg id="'+pfx+'svg" viewBox="0 0 640 262" width="100%" style="display:block">'
    +'<line x1="115" y1="80" x2="315" y2="80" style="stroke:var(--line2);stroke-width:1.6"/>'
    +'<line x1="345" y1="80" x2="545" y2="80" style="stroke:var(--line2);stroke-width:1.6"/>'
    +'<line x1="322" y1="92" x2="220" y2="198" style="stroke:var(--line2);stroke-width:1.6"/>'
    +'<line x1="338" y1="92" x2="470" y2="198" style="stroke:var(--line2);stroke-width:1.6"/>'
    +'<g id="'+pfx+'glow"></g>'
    +csHost(100,80,'desktop','--green','PC')
    +csDev(330,80,'l2switch','SW-1')
    +csDev(560,80,'l2switch','SW-2')
    +csHost(215,210,'lan','--amber','LAN')
    +csHost(475,210,'server','--cyan','SRV')
    +'<g id="'+pfx+'dyn"></g></svg>';
}
function d26P(pfx,intro,terms){
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+intro+'</p>'
    +'<div class="osi-stage">'+d26Net(pfx)+'</div><div class="m1-cap" id="'+pfx+'cap"></div>'
    +courseStepControls(pfx)+abbrBox(terms);
}
function d26Mount(pfx,STEPS){
  function show(i){d26lblReset();var g=$(pfx+'glow');if(g)g.innerHTML=STEPS[i].glow||'';var d=$(pfx+'dyn');if(d)d.innerHTML=STEPS[i].dyn||'';var c=$(pfx+'cap');if(c)c.innerHTML='<span>'+STEPS[i].cap+'</span>';}
  courseStepper(pfx,STEPS.length,show);
}
function d26g(name,color){var p=C26R[name];return csGlow(p[0],p[1],color,20);}
// Labels stack downward inside the diagram (y <= 250) so two of them can never
// overprint; below it the caller's row is kept. A label whose argument went
// missing renders nothing -- esc() would make it a stray empty <text>.
var D26Y=1;
function d26lbl(x,y,tx,c){
  if(tx==null||tx==='')return '';
  if(y!=null&&y<=250){ D26Y=Math.max(D26Y,y+14); y=D26Y; }
  return '<text x="'+x+'" y="'+y+'" text-anchor="middle" style="font:700 7.5px var(--mono);fill:var('+c+')">'+esc(tx)+'</text>';
}
function d26lblReset(){D26Y=1;}
function d26pkt(path,color,dur){return '<rect x="-6" y="-4" width="12" height="9" rx="2" style="fill:var('+color+')"><animateMotion path="'+path+'" dur="'+(dur||'1.4s')+'" repeatCount="indefinite"/></rect>';}

/* ---------- L1M1 — What a cable actually is ---------- */
function renderC26Cable(){return d26P('d26a',
  'Everything above the physical layer assumes one thing: that bits arrive. <b>A cable is not a pipe for data</b> – it is a pair of copper conductors carrying a <b>differing electrical voltage</b>, and a bit is a pattern over time. One wire is roughly 0 volts, the other is roughly +5: the receiver watches the <b>difference</b> between them, which is why a cable that is not properly twisted and shielded picks up noise as if it were signal. The <b>twist</b> is not decoration: twisting two wires together means that any interference hits both equally and cancels out at the receiver. The same idea explains <b>crosstalk</b> – when one pair in the cable interferes with a neighbour – and why good cables are twisted more tightly and better shielded. Nothing above L1 knows about frames or addresses: at this layer there are only voltages and timing.',
  [['crosstalk','interference between neighbouring wire pairs inside the same cable.']]);}
function mountC26Cable(){d26Mount('d26a',[
  {glow:d26g('pc','--muted')+d26g('sw1','--muted'),dyn:d26lbl(215,254,'pair 1: 0 V and +5 V','--muted'),cap:'A copper pair carries a <b>differing voltage</b> between the two wires. The receiver reads the difference, not either wire.'},
  {glow:d26g('sw1','--amber'),dyn:d26lbl(330,140,'the twist makes noise hit both wires','--amber'),cap:'Because the receiver reads a <b>difference</b>, noise hitting both wires cancels out. That is what the twist is for.'},
  {glow:d26g('sw1','--red')+d26g('sw2','--red'),dyn:d26lbl(445,140,'noise hitting only one → crosstalk','--red'),cap:'Noise on just one wire is read as signal – and a neighbour pair interfering is <b>crosstalk</b>.'},
  {glow:d26g('pc','--muted')+d26g('sw1','--muted')+d26g('sw2','--muted'),dyn:d26lbl(330,254,'above L1 nobody cares about volts','--muted'),cap:'At this layer there are only voltages and timing – no addresses, no frames.'}
]);}

/* ---------- L1M2 — Copper and fibre ---------- */
function renderC26Media(){return d26P('d26b',
  'There are two families of cable, and the difference is where each one stops working. <b>Copper</b> (twisted pair) is cheap, easy to terminate and good for <b>100 metres</b> – that limit is not marketing, it is the point at which the signal weakens and interference adds up. Inside that limit it comfortably carries 1, 2.5 and even <b>10 Gbit/s</b>, which is why a building floor is copper. <b>Fibre</b> carries light, and its limits are entirely different: <b>kilometres</b>, immunity to electrical interference of any kind, and no risk of a ground loop or a lightning strike travelling along it. Its price is the tooling and the skill to terminate it. The rule that follows: <b>copper inside the building, fibre between buildings</b> – which is why a campus network has fibre in the backbone and copper at the desk.',
  [['media','the physical medium a signal travels through: twisted-pair copper, coaxial, or fibre.']]);}
function mountC26Media(){d26Mount('d26b',[
  {glow:d26g('sw1','--amber')+d26g('sw2','--amber'),dyn:d26lbl(445,254,'copper: up to ~100 m','--amber'),cap:'<b>Copper</b> is cheap and easy – but the signal weakens, and <b>100 metres</b> is the real limit.'},
  {glow:d26g('sw1','--green'),dyn:d26lbl(445,254,'1 / 2.5 / 10 Gbit/s within that limit','--green'),cap:'Within 100 m it comfortably carries <b>10 Gbit/s</b> – so a floor is copper.'},
  {glow:d26g('sw1','--cyan')+d26g('sw2','--cyan'),dyn:d26lbl(445,220,'fibre: kilometres, no electrical noise','--cyan'),cap:'<b>Fibre</b> carries light: <b>kilometres</b> of range, and immune to electrical interference.'},
  {glow:d26g('pc','--green')+d26g('sw2','--green'),dyn:d26lbl(330,254,'copper to the desk, fibre between buildings','--green'),cap:'The rule: <b>copper inside, fibre between</b> – which is why a campus has both.'}
]);}

/* ---------- L1M3 — Crossover and auto-MDI ---------- */
function renderC26Xover(){return d26P('d26c',
  'A detail that used to matter and now mostly does not. Two devices send and receive on the <b>same pair of wires</b>, so a straight-through cable connecting like to like (switch to switch) would have each transmitter facing its own receiver. The old answer was a <b>crossover cable</b>: transmit wires crossed to receive wires. Since both fast Ethernet and gigabit ports auto-negotiate and cross internally, <b>Auto-MDI/Auto-MDI-X</b> means an ordinary straight-through cable now works between any two devices. You still meet crossover cables in older equipment and in some console cables, and you may still read “use a crossover” in an exam or an old manual – so know the rule rather than assuming it. The pattern to remember: <b>like devices (switch–switch, PC–PC) used to need a crossover; unlike devices (switch–PC) did not.</b>',
  [['crossover','a cable with transmit and receive pairs crossed; needed once between like devices, now usually automatic.']]);}
function mountC26Xover(){d26Mount('d26c',[
  {glow:d26g('sw1','--amber')+d26g('sw2','--amber'),dyn:d26lbl(445,254,'TX meets TX','--red'),cap:'Both devices transmit on the <b>same wires</b>, so a straight cable would wire transmitter to transmitter.'},
  {glow:d26g('sw1','--cyan')+d26g('sw2','--cyan'),dyn:d26lbl(445,220,'crossover: TX → RX','--cyan'),cap:'The old fix: a <b>crossover</b> cable, swapping transmit and receive pairs.'},
  {glow:d26g('sw1','--green')+d26g('sw2','--green'),dyn:d26lbl(445,254,'Auto-MDI/X does it inside the port','--green'),cap:'Modern ports do this themselves: <b>Auto-MDI/Auto-MDI-X</b>. A straight cable now works anywhere.'},
  {glow:d26g('pc','--muted'),dyn:d26lbl(215,254,'like devices needed it, unlike ones did not','--muted'),cap:'The rule to remember: <b>like</b> devices (switch–switch) needed a crossover; <b>unlike</b> (switch–PC) did not.'}
]);}

/* ---------- L2M1 — Speed and duplex ---------- */
function renderC26Duplex(){return d26P('d26d',
  'A link has two settings that are negotiated separately, and mistaking one for the other is a classic fault. <b>Speed</b> is how many bits per second the link carries: 100, 1000, 2500 or 10 000 Mbit/s. <b>Duplex</b> is whether both ends can talk <b>at the same time</b>: <b>full</b> duplex is simultaneous, <b>half</b> duplex takes turns. The nasty combination is <b>one end full, the other half</b>: the full-duplex side keeps transmitting, the half-duplex side waits for its turn, and because the waiting side also runs at the configured speed, the fast side overruns it. The result is not “half the speed” but <b>collisions and retries</b> – the link looks up, pings pass, and throughput collapses. Because both settings are negotiated automatically, this only happens when one side is pinned manually – so the first question at a slow link is always: was anything set by hand?',
  [['duplex','whether both ends of a link can transmit simultaneously (full) or take turns (half).']]);}
function mountC26Duplex(){d26Mount('d26d',[
  {glow:d26g('pc','--muted')+d26g('sw1','--muted'),dyn:d26lbl(215,254,'speed 1000 Mbit/s','--muted')+d26lbl(445,254,'full duplex','--muted'),cap:'A healthy link negotiates <b>speed</b> (here 1000 Mbit/s) and <b>duplex</b> (here full) separately.'},
  {glow:d26g('sw1','--amber'),dyn:d26lbl(445,220,'full ←→ half: a mismatch','--amber'),cap:'The nasty case: one end <b>full</b>, the other <b>half</b> duplex.'},
  {glow:d26g('pc','--red')+d26g('sw1','--red'),dyn:d26lbl(330,254,'collisions and retries, not “half speed”','--red'),cap:'The fast side overruns the slow one → <b>collisions and retries</b>. It looks up and yet crawls.'},
  {glow:d26g('sw1','--green'),dyn:d26lbl(445,220,'only happens if someone pinned a setting','--green'),cap:'Negotiation is automatic, so this means something was <b>set by hand</b>. Start there on any slow link.'}
]);}

/* ---------- L2M2 — Power over Ethernet ---------- */
function renderC26Poe(){return d26P('d26e',
  'The cable in an office carries two things you do not expect: data <b>and electricity</b>. <b>Power over Ethernet (PoE)</b> sends DC power in the same pairs as the data, which saves a separate power supply, a second cable and a socket at every desk. <b>PoE</b> supplies about <b>15.4 W</b> per port, <b>PoE+</b> up to <b>30 W</b>, and the budget belongs to the <b>switch</b>, not the port: a switch that provides 370 W can feed many ports, and a device may negotiate a lower class if the switch cannot afford its full request. This is why an access point, an IP phone or a camera can be cabled and simply work. The operational rule that matters: <b>exceed the budget and the switch may shut ports down or reboot devices</b> – and the symptom is a device that works in one room and not another. PoE budget is the physical-layer answer to “why does this AP only restart when I move it?”.',
  [['PoE','power over Ethernet: DC power delivered to a device in the same cable as the data.']]);}
function mountC26Poe(){d26Mount('d26e',[
  {glow:d26g('sw1','--amber'),dyn:d26lbl(330,254,'the switch is the power supply','--amber'),cap:'One cable carries <b>data and power</b>. The switch becomes the power supply for the device.'},
  {glow:d26g('sw2','--cyan')+d26g('srv','--cyan'),dyn:d26lbl(475,254,'PoE+ ≈ 30 W per port','--cyan'),cap:'<b>PoE</b> ≈ 15.4 W, <b>PoE+</b> ≈ 30 W per port.'},
  {glow:d26g('sw1','--amber'),dyn:d26lbl(445,220,'the budget belongs to the switch','--amber'),cap:'The limit is the <b>switch’s total budget</b>, not one port – devices may be fed a lower class.'},
  {glow:d26g('sw2','--red')+d26g('srv','--red'),dyn:d26lbl(445,254,'over budget → ports shut down, devices reboot','--red'),cap:'Over budget and the switch may <b>shut ports down</b>: the device works in one room and not another.'}
]);}

/* ---------- L2M3 — Reading a link ---------- */
function renderC26Diag(){return d26P('d26f',
  'The physical layer has its own small vocabulary of symptoms, and reading it correctly saves hours. <b>Link down</b> means no signal at all: cable, port or device. <b>Link up but no traffic</b> points above L1 – wrong VLAN, wrong port mode. <b>Flapping link</b> (up and down repeatedly) is a physical problem: a loose connector, a damaged cable, or a device failing to power on properly. <b>Errors</b> rising on a port mean frames arrived but were not valid: that is interference, a wrong duplex, or a failing transceiver. In the simulator you can see all of this directly: the port strip on a switch shows each port’s state and speed, and the physical-port view is where you read it. The habit to build is <b>bottom-up</b> – prove the physical layer before you accuse anything above it (the course <i>When the network breaks: troubleshooting</i> makes the same point).',
  [['flapping','a link that goes up and down repeatedly; almost always a physical or power problem.']]);}
function mountC26Diag(){d26Mount('d26f',[
  {glow:d26g('pc','--red')+d26g('sw1','--red'),dyn:d26lbl(215,254,'link down: no signal at all','--red'),cap:'<b>Link down</b> → cable, port or device. Nothing above L1 even runs.'},
  {glow:d26g('sw1','--amber'),dyn:d26lbl(445,220,'up but silent → look above L1','--amber'),cap:'<b>Up but no traffic</b> → wrong VLAN or port mode, not the cable.'},
  {glow:d26g('pc','--red')+d26g('sw1','--red'),dyn:d26lbl(330,254,'flapping: loose connector or power fault','--red'),cap:'<b>Flapping</b> is physical: a loose connector, damaged cable, or a device failing to power.'},
  {glow:d26g('sw1','--green')+d26g('sw2','--green'),dyn:d26lbl(445,254,'read the port strip, prove L1 first','--green'),cap:'<b>Bottom-up:</b> the port strip shows state and speed. Prove the physical layer before blaming anything above it.'}
]);}

const COURSE_26_DEF = {
  id:'course26',
title:'The physical layer: cables, media and links',
  blurb:'The layer everything else assumes. What a cable actually carries and why the twist matters, copper against fibre and where each stops working, straight-through against crossover and Auto-MDI, speed and duplex and why a mismatch is not “half speed”, power over Ethernet and its budget, and how to read a link from both ends.',
  lessons:[
    { id:'c26l1', title:'The medium itself', taskId:'ch-down', quizId:'c26q_l1', modules:[
      { id:'c26l1m1', title:'What a cable actually is', render:renderC26Cable, mount:mountC26Cable },
      { id:'c26l1m2', title:'Copper and fibre', render:renderC26Media, mount:mountC26Media },
      { id:'c26l1m3', title:'Crossover and Auto-MDI', render:renderC26Xover, mount:mountC26Xover }
    ]},
    { id:'c26l2', title:'A working link', taskId:null, quizId:'c26q_l2', modules:[
      { id:'c26l2m1', title:'Speed and duplex', render:renderC26Duplex, mount:mountC26Duplex },
      { id:'c26l2m2', title:'Power over Ethernet', render:renderC26Poe, mount:mountC26Poe },
      { id:'c26l2m3', title:'Reading a link', render:renderC26Diag, mount:mountC26Diag }
    ]}
  ]
};

const COURSE_26_QUIZZES_DEF = {
  c26q_l1:{ title:'Quiz: The medium itself', qs:[
    { q:'What does a receiver on a copper pair actually measure?',
      opts:['the voltage on the first wire','the voltage on the second wire','the voltage difference between the two wires'],
      correct:2, why:'That is precisely why the twist helps: noise hitting both wires cancels out in the difference.' },
    { q:'Why is the pair in a network cable twisted?',
      opts:['to make the cable more flexible','so interference hits both wires equally and cancels at the receiver','to fit more pairs into the same sheath'],
      correct:1, why:'Because the receiver reads a difference. Crosstalk – a neighbour pair interfering – is what tighter, better-shielded twisting reduces.' },
    { q:'What is the practical range limit of twisted-pair copper?',
      opts:['10 metres','100 metres','several kilometres'],
      correct:1, why:'About 100 m. That is where the signal weakens enough and interference accumulates enough to matter. Fibre is the answer beyond it.' },
    { q:'Why does a campus backbone use fibre between buildings but copper to the desk?',
      opts:['because fibre is cheaper in bulk','because copper is limited to about 100 m and is sensitive to interference between buildings, while fibre is not','because copper cannot carry more than 1 Gbit/s'],
      correct:1, why:'Distance and immunity decide it. Copper reaches 10 Gbit/s comfortably inside a building.' },
    { q:'Which pairing used to need a crossover cable?',
      opts:['switch to PC','switch to switch','router to switch'],
      correct:1, why:'Like devices put transmitters opposite transmitters. Auto-MDI/Auto-MDI-X now makes that irrelevant on modern ports.' }
  ]},
  c26q_l2:{ title:'Quiz: A working link', qs:[
    { q:'One end of a link is full duplex, the other half duplex. What happens?',
      opts:['throughput is exactly halved','the link runs at the lower speed','collisions and retries: the link works but is very slow'],
      correct:2, why:'The full-duplex side keeps talking; the half-duplex side waits and is overrun. That is not “half speed” but retransmissions.' },
    { q:'Why does this mismatch arise at all, when speed and duplex are negotiated automatically?',
      opts:['because negotiation is unreliable','because one side has been set by hand','because the cable is too long'],
      correct:1, why:'Something was pinned manually. On any inexplicably slow link, ask first whether a setting was changed by hand.' },
    { q:'How much power can PoE+ deliver per port?',
      opts:['about 15.4 W','about 30 W','about 100 W'],
      correct:1, why:'PoE is about 15.4 W, PoE+ up to about 30 W. But the real ceiling is the switch’s total budget.' },
    { q:'A switch exceeds its PoE budget. What is a likely symptom?',
      opts:['the data link stops working entirely','ports shut down or powered devices reboot','only the highest-numbered ports fail'],
      correct:1, why:'Budget is enforced per switch. A device that works in one room and not another is a classic PoE-budget symptom.' },
    { q:'A port is up but nothing gets through. Where do you look first?',
      opts:['replace the cable','above the physical layer: VLAN or port mode','the device’s power supply'],
      correct:1, why:'If the link is up, signal is fine. Wrong VLAN or port mode is the usual cause – that is the bottom-up habit from the troubleshooting course.' }
  ]}
};

const COURSE_26_FINAL_EXTRA_DEF = [
  { q:'Why does the twist in a network cable actually improve error resistance?',
    opts:['it makes the cable thinner','the receiver reads the difference between the wires, so common-mode noise cancels out','it cools the conductors'],
    correct:1, why:'Because the measurement is a difference. That is the whole reason the design works – and also why fibre, carrying light, is immune to it entirely.' },
  { q:'Which symptom most strongly suggests a physical-layer rather than a VLAN problem?',
    opts:['a link that flaps up and down repeatedly','traffic blocked between two VLANs','a slow route to a remote network'],
    correct:0, why:'Flapping is a connector, cable or power symptom. VLAN and routing faults are all above L1, where the link stays solidly up.' }
];

__regCourse(26,COURSE_26_DEF,COURSE_26_QUIZZES_DEF,COURSE_26_FINAL_EXTRA_DEF);