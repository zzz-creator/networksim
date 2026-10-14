/* course6.js — Course 6 content (split out of course.js; loaded on demand via course-core.js) */
/* ============================================================
   COURSE 6 — Redundancy: Spanning Tree (problem-first; sim icons; STP engine)
   ============================================================ */
// L1M1 — We want a backup
function renderC6BackupWhy(){
  const svg='<svg id="c6asvg" viewBox="0 0 640 180" width="100%" style="display:block">'
    +'<line x1="170" y1="90" x2="470" y2="90" style="stroke:var(--green);stroke-width:1.8"/>'
    +'<g id="c6aglow"></g>'
    +csDev(150,90,'l2switch','SW-A')+csDev(490,90,'l2switch','SW-B')+csHost(64,90,'desktop','--blue','PC1')+csHost(576,90,'server','--green','SERVER')
    +'<line x1="84" y1="90" x2="130" y2="90" style="stroke:var(--line2);stroke-width:1.4"/><line x1="510" y1="90" x2="556" y2="90" style="stroke:var(--line2);stroke-width:1.4"/>'
    +'<g id="c6adyn"></g></svg>';
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'From the Network security course you know that <b>one device or link = a single point of failure</b> (<b>SPOF</b> for short; you’ll meet the term often). Here we’ll fix that – and hit an unexpected problem. Between two switches runs <b>one cable</b>. If you cut that cable (or it breaks), <b>half the network is cut off</b>. The logical fix: add a <b>backup cable</b>. But that very move – as you’ll see in a moment – can bring the whole network <b>down</b>.'+'</p>'
    +'<div class="osi-stage">'+svg+'</div>'
    +'<div class="m1-cap" id="c6acap"></div>'
    +courseStepControls('c6a')
    +abbrBox([['redundancy','an extra backup device/link so the network survives the failure of the primary.'],['single point of failure (SPOF)','<b>S</b>ingle <b>P</b>oint <b>o</b>f <b>F</b>ailure – a device whose failure brings down the whole network; we want a backup to remove it.']]);
}
function mountC6BackupWhy(){
  const STEPS=[
    {glow:csGlow(150,90,'--green',22)+csGlow(490,90,'--green',22), dyn:'', cap:'Two switches, <b>one cable</b> between them. PC1 reaches the SERVER through them. It works – while that cable holds.'},
    {glow:csGlow(150,90,'--red',22)+csGlow(490,90,'--red',22), dyn:'<line x1="170" y1="90" x2="470" y2="90" style="stroke:var(--red);stroke-width:2;stroke-dasharray:5 5"/><text x="320" y="74" text-anchor="middle" style="font:800 16px var(--mono);fill:var(--red)">✕</text>', cap:'The cable <b>breaks</b> → SW-B (and the SERVER) is cut off. A <b>single point of failure</b>. We want a backup.'},
    {glow:csGlow(150,90,'--cyan',22)+csGlow(490,90,'--cyan',22), dyn:'<line x1="176" y1="76" x2="464" y2="76" style="stroke:var(--cyan);stroke-width:1.8"/><text x="320" y="66" text-anchor="middle" style="font:700 8px var(--sans);fill:var(--cyan)">'+esc('+ backup cable = a loop')+'</text>', cap:'You add a <b>second cable</b> as a backup. Now you survive one failure… but you have a <b>loop</b> between the switches (two paths). And that, believe it or not, is a <b>disaster</b> – next module.'}
  ];
  function show(i){const g=$('c6aglow');if(g)g.innerHTML=STEPS[i].glow||'';const d=$('c6adyn');if(d)d.innerHTML=STEPS[i].dyn||'';const c=$('c6acap');if(c)c.innerHTML='<span>'+STEPS[i].cap+'</span>';}
  courseStepper('c6a',STEPS.length,show);
}
// L1M2 — Broadcast storm
function renderC6Storm(){
  const svg='<svg id="c6bsvg" viewBox="0 0 640 190" width="100%" style="display:block">'
    +'<line x1="178" y1="82" x2="462" y2="82" style="stroke:var(--line2);stroke-width:1.8"/><line x1="178" y1="108" x2="462" y2="108" style="stroke:var(--line2);stroke-width:1.8"/>'
    +'<text x="320" y="76" text-anchor="middle" style="font:600 7.5px var(--sans);fill:var(--muted)">'+esc('two links = a loop')+'</text>'
    +'<g id="c6bglow"></g>'
    +csDev(160,95,'l2switch','SW-A')+csDev(480,95,'l2switch','SW-B')+csHost(64,95,'desktop','--blue','PC')
    +'<line x1="84" y1="95" x2="140" y2="95" style="stroke:var(--line2);stroke-width:1.4"/>'
    +'<g id="c6bdyn"></g></svg>';
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'Recall the <b>broadcast</b> from the Switching and VLANs course: a switch <b>floods it to all ports</b>. Now you have <b>two links (a loop)</b> between the switches. The PC sends one broadcast – SW-A sends it on both links to SW-B. SW-B floods it to all ports… <b>including the other link back</b> to SW-A. And again. The frame <b>circles and multiplies endlessly</b> – each switch sends a <b>copy</b> to every port, so one frame becomes two, four, eight… saturating every link within seconds. This is a <b>broadcast storm</b> – and the network <b>collapses</b>.'+'</p>'
    +'<div class="osi-stage">'+svg+'</div>'
    +'<div class="m1-cap" id="c6bcap"></div>'
    +courseStepControls('c6b')
    +abbrBox([['broadcast storm','a broadcast endlessly circles a loop, multiplies and saturates the network – it stops working.'],['L2 loop','two or more active paths between switches → frames have a way to keep coming back forever.']]);
}
function mountC6Storm(){
  const loopAnim='<rect x="-6" y="-4" width="12" height="8" rx="2" style="fill:var(--red)"><animateMotion path="M190 82 L450 82 L450 108 L190 108 Z" dur="1s" repeatCount="indefinite"/></rect><rect x="-6" y="-4" width="12" height="8" rx="2" style="fill:var(--red)"><animateMotion path="M450 108 L190 108 L190 82 L450 82 Z" dur="1s" repeatCount="indefinite"/></rect>';
  const STEPS=[
    {glow:csGlow(64,95,'--blue')+csGlow(160,95,'--cyan',22), dyn:csPkt('M84 95 L140 95','--amber'), cap:'The PC sends <b>one broadcast</b> (e.g. ARP) to SW-A. Nothing unusual yet.'},
    {glow:csGlow(160,95,'--amber',22)+csGlow(480,95,'--amber',22), dyn:'<rect x="-6" y="-4" width="12" height="8" rx="2" style="fill:var(--amber)"><animateMotion path="M190 82 L450 82" dur="1s" repeatCount="indefinite"/></rect><rect x="-6" y="-4" width="12" height="8" rx="2" style="fill:var(--amber)"><animateMotion path="M190 108 L450 108" dur="1s" repeatCount="indefinite"/></rect>', cap:'SW-A <b>floods it to all ports</b> → on <b>both</b> links to SW-B. The broadcast has split in two.'},
    {glow:csGlow(160,95,'--red',22)+csGlow(480,95,'--red',22), dyn:loopAnim, cap:'SW-B floods it to all ports too – <b>including the other link back</b> to SW-A. Which floods again… The frame <b>circles round and multiplies</b>.'},
    {glow:csGlow(160,95,'--red',22)+csGlow(480,95,'--red',22), dyn:loopAnim+'<text x="320" y="160" text-anchor="middle" style="font:700 8.5px var(--sans);fill:var(--red)">'+esc('broadcast storm → network saturated → down')+'</text>', cap:'Within a few <b>seconds</b> the loop is full of copies of one broadcast. Links clog, switches overload – <b>the whole network goes down</b>. One loop, total outage.'}
  ];
  function show(i){const g=$('c6bglow');if(g)g.innerHTML=STEPS[i].glow||'';const d=$('c6bdyn');if(d)d.innerHTML=STEPS[i].dyn||'';const c=$('c6bcap');if(c)c.innerHTML='<span>'+STEPS[i].cap+'</span>';}
  courseStepper('c6b',STEPS.length,show);
}
// L1M3 — MAC instability
function renderC6MacFlap(){
  const svg='<svg id="c6csvg" viewBox="0 0 640 198" width="100%" style="display:block">'
    +'<rect x="360" y="40" width="240" height="96" rx="9" style="fill:var(--panel);stroke:var(--line2);stroke-width:1.2"/>'
    +'<text x="380" y="60" style="font:700 8px var(--sans);fill:var(--muted)">'+'SW-A MAC table'+'</text>'
    +'<line x1="120" y1="64" x2="120" y2="112" style="stroke:var(--line2);stroke-width:1.4"/>'
    +'<path d="M 116 108 Q 84 124 116 144" fill="none" style="stroke:var(--line2);stroke-width:1.6"/>'
    +'<path d="M 124 108 Q 156 124 124 144" fill="none" style="stroke:var(--line2);stroke-width:1.6"/>'
    +'<text x="152" y="72" style="font:600 7px var(--mono);fill:var(--muted)">'+esc('port 1 (to PC)')+'</text>'
    +'<text x="58" y="129" text-anchor="middle" style="font:600 7px var(--mono);fill:var(--muted)">'+esc('port 2')+'</text>'
    +'<text x="182" y="129" text-anchor="middle" style="font:600 7px var(--mono);fill:var(--muted)">'+esc('port 3')+'</text>'
    +'<g id="c6cglow"></g>'
    +csDev(120,88,'l2switch','SW-A')+csHost(64,64,'desktop','--blue','PC')+csDev(120,160,'l2switch','SW-B',1.0)
    +'<g id="c6cdyn"></g></svg>';
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'And here’s the loop’s second nasty trick: an <b>unstable MAC table</b>. A switch learns which port each MAC address is on (the ISO/OSI and TCP/IP course). When a frame from the PC <b>circles the loop</b>, it reaches SW-A once from one port, then from the other. So the switch sees the <b>same MAC alternating on two ports</b> and keeps <b>overwriting</b> it (MAC flapping). The table stops making sense and the switch doesn’t know where to send things. The storm gets <b>address chaos</b> on top.'+'</p>'
    +'<div class="osi-stage">'+svg+'</div>'
    +'<div class="m1-cap" id="c6ccap"></div>'
    +courseStepControls('c6c')
    +abbrBox([['MAC flapping','a switch sees one MAC alternating on different ports and keeps overwriting it – the table is unstable.'],['MAC table','the MAC-address → port mapping; a loop scrambles it and the switch doesn’t know where to forward.']]);
}
function mountC6MacFlap(){
  const row=(t,c)=>'<text x="380" y="82" style="font:600 9px var(--mono);fill:var('+c+')">'+esc(t)+'</text>';
  const STEPS=[
    {glow:csGlow(64,64,'--blue')+csGlow(120,88,'--cyan',22), dyn:row('MAC PC … port 1 (to the PC)','--green'), cap:'SW-A learns: <b>the PC’s MAC is on port 1</b> (where the PC is directly attached). Correct.'},
    {glow:csGlow(120,88,'--amber',22), dyn:row('MAC PC … port 2 (from the loop!)','--amber'), cap:'But a copy of the frame <b>circled the loop</b> and arrived on <b>port 2</b>. SW-A thinks: "ah, the PC is on port 2 now" and <b>overwrites</b> the table.'},
    {glow:csGlow(120,88,'--red',22), dyn:'<text x="380" y="82" style="font:600 9px var(--mono);fill:var(--red)">MAC PC … port 1? 2? 1? 2?…</text>', cap:'And round and round: port 1, port 2, port 1… <b>MAC flapping</b>. The switch <b>no longer knows where the PC is</b>, and delivery falls apart. A loop wrecks the network <b>two ways</b> – the storm and MAC chaos.'},
    {glow:csGlow(120,88,'--red',22), dyn:'<text x="200" y="92" text-anchor="middle" style="font:700 8px var(--mono);fill:var(--red)">'+esc('STORM')+'</text>', cap:'<b>Try it yourself.</b> In the simulator build a <b>loop from two switches</b> (two links between them), switch on <b>Advanced mode</b> and open each switch’s modal → <b>STP mode → Off</b>. The looped links turn red and start flashing with a <b>“STORM”</b> tag. Then turn on <b>RSTP</b> on one switch – the storm vanishes and one link becomes <b>“STP block”</b> (a backup). That’s exactly the difference we’ll cover next.'},
    {glow:csGlow(120,88,'--green',22), dyn:'', cap:'Bottom line: <b>a backup link is essential, but an active loop is deadly.</b> We need a backup that <b>makes no loop</b> until needed. That’s exactly what <b>Spanning Tree</b> solves – the next lesson (and you’ll see it act in the simulator).'}
  ];
  function show(i){const g=$('c6cglow');if(g)g.innerHTML=STEPS[i].glow||'';const d=$('c6cdyn');if(d)d.innerHTML=STEPS[i].dyn||'';const c=$('c6ccap');if(c)c.innerHTML='<span>'+STEPS[i].cap+'</span>';}
  courseStepper('c6c',STEPS.length,show);
}
// ---- L2 shared scene: triangle of switches (loop) + 2 hosts ----
function c6STPScene(pfx){
  return '<svg id="'+pfx+'svg" viewBox="0 0 640 200" width="100%" style="display:block">'
    +'<line x1="302" y1="74" x2="202" y2="140" style="stroke:var(--line2);stroke-width:1.8"/><line x1="338" y1="74" x2="438" y2="140" style="stroke:var(--line2);stroke-width:1.8"/>'
    +'<line x1="200" y1="150" x2="440" y2="150" style="stroke:var(--line2);stroke-width:1.8"/>'
    +'<line x1="100" y1="150" x2="160" y2="150" style="stroke:var(--line2);stroke-width:1.4"/><line x1="480" y1="150" x2="556" y2="150" style="stroke:var(--line2);stroke-width:1.4"/>'
    +'<g id="'+pfx+'glow"></g>'
    +csDev(320,56,'l2switch','SW1')+csDev(180,150,'l2switch','SW2')+csDev(460,150,'l2switch','SW3')+csHost(80,150,'desktop','--blue','PC1')+csHost(576,150,'server','--green','SRV')
    +'<g id="'+pfx+'dyn"></g></svg>';
}
// L2M1 — The idea of STP
function renderC6StpIdea(){
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'We want a backup, but no loop. The <b>Spanning Tree Protocol (STP)</b> solves it elegantly: switches talk to each other, <b>find loops</b> and for each one <b>logically block one port</b>, leaving a <b>loop-free tree</b> (hence "spanning tree"). The backup link is <b>physically there</b>, but STP keeps it <b>blocked</b> until needed. No storm – yet redundancy. All of this runs <b>in this simulator too</b>.'+'</p>'
    +'<div class="osi-stage">'+c6STPScene('c6d')+'</div>'
    +'<div class="m1-cap" id="c6dcap"></div>'
    +courseStepControls('c6d')
    +abbrBox([['STP','Spanning Tree Protocol – automatically finds loops and blocks ports to leave a loop-free tree.'],['spanning tree','a loop-free subgraph connecting all switches; STP computes it from the topology.']]);
}
function mountC6StpIdea(){
  const blk='<line x1="200" y1="150" x2="440" y2="150" style="stroke:var(--amber);stroke-width:2;stroke-dasharray:6 5"/><text x="320" y="172" text-anchor="middle" style="font:700 8px var(--mono);fill:var(--amber)">'+esc('STP block')+'</text>';
  const STEPS=[
    {glow:csGlow(320,56,'--red',22)+csGlow(180,150,'--red',22)+csGlow(460,150,'--red',22), dyn:'<text x="320" y="190" text-anchor="middle" style="font:700 8px var(--sans);fill:var(--red)">'+esc('three switches in a ring = a loop')+'</text>', cap:'Three switches wired in a <b>ring</b> = a <b>loop</b>. With no protection a broadcast storm would erupt instantly.'},
    {glow:csGlow(320,56,'--cyan',22)+csGlow(180,150,'--cyan',22)+csGlow(460,150,'--cyan',22), dyn:'', cap:'We turn on <b>STP</b>. The switches exchange messages (BPDUs), <b>spot the loop</b> and agree which port to sacrifice.'},
    {glow:csGlow(320,56,'--green',22)+csGlow(180,150,'--green',22)+csGlow(460,150,'--green',22), dyn:blk, cap:'STP <b>blocks one port</b> (here the SW2–SW3 link). The loop is gone → a <b>loop-free tree</b>. No storm, traffic flows.'},
    {glow:csGlow(180,150,'--green',22)+csGlow(460,150,'--green',22), dyn:blk, cap:'And note: the cable is <b>physically still there</b> – just logically off. When the main path fails, STP <b>turns it on</b>. A backup without a loop! <b>How STP decides what to block</b> is the next modules.'}
  ];
  function show(i){const g=$('c6dglow');if(g)g.innerHTML=STEPS[i].glow||'';const d=$('c6ddyn');if(d)d.innerHTML=STEPS[i].dyn||'';const c=$('c6dcap');if(c)c.innerHTML='<span>'+STEPS[i].cap+'</span>';}
  courseStepper('c6d',STEPS.length,show);
}
// L2M2 — Root bridge
function renderC6RootBridge(){
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'For switches to agree which port to block, they need <b>one fixed point</b> – an anchor the whole tree is built from. It’s called the <b>root bridge</b>. It’s elected <b>automatically</b>: each switch has a <b>bridge ID</b> (priority + its MAC address) and the <b>lowest wins</b>. The root is the center of the network – distances are measured from it and decide which ports stay active. The priority is configurable, so you can pick the root yourself (ideally the most powerful central switch) – and you can try it right here: in <b>Advanced mode</b> open a switch’s modal and set the <b>"STP priority (bridge priority)"</b> field. The default is <b>32768</b> and it only moves in steps of <b>4096</b>. That odd step has a reason: the lower 12 bits of the priority were taken over by the <b>VLAN number</b> (the extended system ID), so only 16 values are left for the priority itself – the multiples of 4096.'+'</p>'
    +'<div class="osi-stage">'+c6STPScene('c6e')+'</div>'
    +'<div class="m1-cap" id="c6ecap"></div>'
    +courseStepControls('c6e')
    +abbrBox([['root bridge','the root switch the tree is built from; the one with the lowest bridge ID is elected.'],['bridge ID','a switch’s priority + MAC address; the lowest wins the root election. Priority is configurable.'],['extended system ID','the VLAN number is stored in the lower 12 bits of the bridge priority – hence the priority only steps by 4096 (0, 4096, …, 61440).']]);
}
function mountC6RootBridge(){
  const crown=(x,y)=>'<g><rect x="'+(x-26)+'" y="'+(y-46)+'" width="52" height="16" rx="8" style="fill:var(--green);fill-opacity:.18;stroke:var(--green);stroke-width:1.2"/><text x="'+x+'" y="'+(y-34)+'" text-anchor="middle" style="font:700 9px var(--mono);fill:var(--green)">ROOT</text></g>';
  const bl=(x,y,t,c)=>'<text x="'+x+'" y="'+y+'" text-anchor="middle" style="font:700 7.5px var(--mono);fill:var('+c+')">'+esc(t)+'</text>';
  const bids=bl(132,124,'priority 32768','--muted')+bl(508,124,'priority 32768','--muted');
  const STEPS=[
    {glow:csGlow(320,56,'--cyan',22)+csGlow(180,150,'--cyan',22)+csGlow(460,150,'--cyan',22), dyn:bids+bl(320,26,'priority 4096','--cyan'), cap:'Three switches. Each has its <b>bridge ID</b> (priority + MAC). SW1 has its priority manually lowered to <b>4096</b>, the other two keep the default <b>32768</b>. Before the tree is built, a <b>root</b> must be chosen.'},
    {glow:csGlow(320,56,'--green',22), dyn:bids+crown(320,56)+bl(320,114,'4096 < 32768 → SW1 wins','--green'), cap:'The switches compare bridge IDs and the <b>lowest wins</b>: <b>4096 &lt; 32768</b>, so <b>SW1</b> becomes the <b>root bridge</b> – the anchor of the whole tree.'},
    {glow:csGlow(320,56,'--green',22)+csGlow(180,150,'--cyan',22)+csGlow(460,150,'--cyan',22), dyn:crown(320,56)+bl(232,98,'cost 1','--cyan')+bl(410,98,'cost 1','--cyan')+bl(320,168,'farther from root → the block lands here','--amber'), cap:'From the <b>root</b> we now measure how far each switch is (path cost). Both upper links cost 1; the bottom link between SW2 and SW3 is farthest from the root – that’s where a port gets blocked. Details in the next module.'}
  ];
  function show(i){const g=$('c6eglow');if(g)g.innerHTML=STEPS[i].glow||'';const d=$('c6edyn');if(d)d.innerHTML=STEPS[i].dyn||'';const c=$('c6ecap');if(c)c.innerHTML='<span>'+STEPS[i].cap+'</span>';}
  courseStepper('c6e',STEPS.length,show);
}
// L2M3 — Port states
function renderC6PortStates(){
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'STP doesn’t switch off whole switches, but individual <b>ports</b>. A port can be in two main states: <b>forwarding</b> (passes traffic – normal operation) or <b>blocking</b> (does <b>not</b> pass traffic, only <b>listens</b> to STP messages so it knows if it should come up). So a blocked port isn’t "dead" – it’s a <b>ready backup</b> that just stays silent. (When switching over, a port passes through brief <b>listening</b> and <b>learning</b> states before it forwards – which is why classic STP takes a while.) In <b>RSTP</b>, the newer and now default version (next lesson), the blocking state is called <b>discarding</b> – it’s the same thing: the port drops traffic and only listens. When you see "the port is discarding" somewhere, read it as "blocked".'+'</p>'
    +'<div class="osi-stage">'+c6STPScene('c6f')+'</div>'
    +'<div class="m1-cap" id="c6fcap"></div>'
    +courseStepControls('c6f')
    +abbrBox([['forwarding','the port forwards traffic normally – the active state.'],['blocking','the port doesn’t forward, only listens to STP – a ready, silent backup.'],['discarding','the RSTP name for the blocking state – the port drops traffic and only listens to STP.']]);
}
function mountC6PortStates(){
  const fwd='<line x1="302" y1="74" x2="202" y2="140" style="stroke:var(--green);stroke-width:2.6;opacity:.7"/><line x1="338" y1="74" x2="438" y2="140" style="stroke:var(--green);stroke-width:2.6;opacity:.7"/>';
  const blk='<line x1="200" y1="150" x2="440" y2="150" style="stroke:var(--amber);stroke-width:2;stroke-dasharray:6 5"/><text x="320" y="172" text-anchor="middle" style="font:700 8px var(--mono);fill:var(--amber)">'+esc('blocking')+'</text>';
  const STEPS=[
    {glow:csGlow(320,56,'--green',22)+csGlow(180,150,'--green',22)+csGlow(460,150,'--green',22), dyn:fwd+'<text x="250" y="100" text-anchor="middle" style="font:700 7.5px var(--sans);fill:var(--green)">'+esc('forwarding')+'</text>', cap:'The ports on the tree are in <b>forwarding</b> state – they pass traffic normally. Data flows here.'},
    {glow:csGlow(180,150,'--amber',22)+csGlow(460,150,'--amber',22), dyn:fwd+blk, cap:'The redundant port (SW2–SW3) is in <b>blocking</b> state: it does <b>not</b> forward traffic but <b>listens</b> to STP. This breaks the loop.'},
    {glow:csGlow(180,150,'--cyan',22)+csGlow(460,150,'--cyan',22), dyn:fwd+blk, cap:'The blocked port <b>isn’t dead</b> – it’s a <b>silent backup</b>. Whenever needed, STP switches it to forwarding. (Classic STP takes a moment due to the listening/learning states – RSTP speeds that up, next lesson.)'}
  ];
  function show(i){const g=$('c6fglow');if(g)g.innerHTML=STEPS[i].glow||'';const d=$('c6fdyn');if(d)d.innerHTML=STEPS[i].dyn||'';const c=$('c6fcap');if(c)c.innerHTML='<span>'+STEPS[i].cap+'</span>';}
  courseStepper('c6f',STEPS.length,show);
}
// L2M4 — Choosing the blocked port
function renderC6BlockChoice(){
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'So which port gets blocked? STP computes the <b>cost of the path to the root</b> (by link speed – fast = cheap). On each link between two switches, the port of the switch that is <b>closer to the root</b> wins (it stays <b>forwarding</b>); the port of the <b>further</b> one is <b>blocked</b>. Ties are broken by the lower bridge ID, and if those match too (typically two cables between the same pair of switches), the very last tie-break is the <b>lowest port ID</b> – the port’s number on the neighbor. The ports also take on <b>roles</b>: the <b>root port</b> is the single port on each non-root switch with the cheapest path to the root; the <b>designated port</b> is the one serving a segment away from the root (on the root bridge every port is designated); and a port left with no role becomes an <b>alternate port</b> – and that’s the one that gets blocked. So when we keep saying "blocked port", the proper name is alternate port. In short: at each loop STP keeps active the path that leads <b>most cheaply to the root</b> and sacrifices the "extra" one.'+'</p>'
    +'<div class="osi-stage">'+c6STPScene('c6g')+'</div>'
    +'<div class="m1-cap" id="c6gcap"></div>'
    +courseStepControls('c6g')
    +abbrBox([['root path cost','the sum of link costs from a switch to the root bridge; it decides which port to block.'],['link cost','by link speed (fast = low). In this simulator you set it by right-clicking a link.'],['root port','the one port on each non-root switch with the cheapest path to the root bridge.'],['designated port','the port serving a given segment away from the root; on the root bridge all ports are such.'],['alternate port','a port left with no role – STP blocks it. The proper name for the "blocked port".']]);
}
function mountC6BlockChoice(){
  const lbl=(x,y,t,c)=>'<text x="'+x+'" y="'+y+'" text-anchor="middle" style="font:700 7px var(--mono);fill:var('+c+')">'+esc(t)+'</text>';
  const blk='<line x1="200" y1="150" x2="440" y2="150" style="stroke:var(--amber);stroke-width:2;stroke-dasharray:6 5"/><text x="320" y="172" text-anchor="middle" style="font:700 8px var(--mono);fill:var(--amber)">'+esc('blocked (furthest from root)')+'</text>';
  const STEPS=[
    {glow:csGlow(320,56,'--green',22), dyn:'<g><rect x="294" y="10" width="52" height="16" rx="8" style="fill:var(--green);fill-opacity:.18;stroke:var(--green);stroke-width:1.2"/><text x="320" y="22" text-anchor="middle" style="font:700 9px var(--mono);fill:var(--green)">ROOT</text></g>', cap:'<b>SW1 = root.</b> SW2 and SW3 are <b>one hop</b> from it (a direct link). These links to the root stay <b>forwarding</b>.'},
    {glow:csGlow(180,150,'--cyan',22)+csGlow(460,150,'--cyan',22), dyn:lbl(250,108,'to root: cheap','--green')+lbl(390,108,'to root: cheap','--green'), cap:'That leaves the <b>extra SW2–SW3 link</b> (the one that made the loop). Both its ends reach the root by another, better path. This link is <b>spare</b>.'},
    {glow:csGlow(460,150,'--amber',22), dyn:blk, cap:'STP <b>blocks it</b> at the end of the switch that is "further" from the root (higher cost / higher bridge ID). The loop is gone, the best paths to the root remain. <b>You set the link cost in the simulator yourself</b> and watch the block move.'}
  ];
  function show(i){const g=$('c6gglow');if(g)g.innerHTML=STEPS[i].glow||'';const d=$('c6gdyn');if(d)d.innerHTML=STEPS[i].dyn||'';const c=$('c6gcap');if(c)c.innerHTML='<span>'+STEPS[i].cap+'</span>';}
  courseStepper('c6g',STEPS.length,show);
}
// L2M5 — Failure and failover + task
function renderC6Failover(){
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'And now the best part – why we do all this. When the <b>active link fails</b>, STP detects it, <b>recomputes the tree</b> and <b>switches the blocked port to forwarding</b>. The backup comes up <b>by itself</b> and the network keeps running. You’ve got redundancy <b>without</b> a loop or a storm. You’ll <b>try exactly this in the simulator</b>: in the <b>stp-loop</b> task a loop is wired, STP has auto-blocked one port (you’ll see "STP block"), traffic still flows – and when you down the active switch, the backup comes up.'+'</p>'
    +'<div class="osi-stage">'+c6STPScene('c6h')+'</div>'
    +'<div class="m1-cap" id="c6hcap"></div>'
    +courseStepControls('c6h')
    +abbrBox([['convergence','after a failure STP recomputes the tree and switches the backup port to forwarding – the network self-heals.']]);
}
function mountC6Failover(){
  const blk='<line x1="200" y1="150" x2="440" y2="150" style="stroke:var(--amber);stroke-width:2;stroke-dasharray:6 5"/><text x="320" y="172" text-anchor="middle" style="font:700 8px var(--mono);fill:var(--amber)">'+esc('STP block')+'</text>';
  const fwd1='<line x1="302" y1="74" x2="202" y2="140" style="stroke:var(--green);stroke-width:2.6;opacity:.7"/><line x1="338" y1="74" x2="438" y2="140" style="stroke:var(--green);stroke-width:2.6;opacity:.7"/>';
  const STEPS=[
    {glow:csGlow(320,56,'--green',22)+csGlow(180,150,'--green',22)+csGlow(460,150,'--green',22), dyn:fwd1+blk, cap:'Normal state: the tree via SW1, the SW2–SW3 backup link <b>blocked</b>. PC1 reaches the SRV. All good.'},
    {glow:csGlow(320,56,'--red',22)+csGlow(460,150,'--red',22), dyn:'<line x1="338" y1="74" x2="438" y2="140" style="stroke:var(--red);stroke-width:2;stroke-dasharray:5 5"/><text x="400" y="100" text-anchor="middle" style="font:800 16px var(--mono);fill:var(--red)">✕</text>'+blk, cap:'The <b>SW1–SW3 link fails.</b> SW3 (and the SRV) loses its path to the root. Normally an outage – but we have a backup.'},
    {glow:csGlow(180,150,'--green',22)+csGlow(460,150,'--green',22), dyn:'<line x1="302" y1="74" x2="202" y2="140" style="stroke:var(--green);stroke-width:2.6;opacity:.7"/><line x1="200" y1="150" x2="440" y2="150" style="stroke:var(--green);stroke-width:2.6;opacity:.7"/><text x="320" y="172" text-anchor="middle" style="font:700 8px var(--sans);fill:var(--green)">'+esc('backup → forwarding')+'</text>', cap:'STP recomputes the tree and <b>unblocks SW2–SW3</b> (switches it to forwarding). The SRV is reachable via SW2. <b>The network healed itself.</b>'},
    {glow:csGlow(320,56,'--cyan',22)+csGlow(180,150,'--cyan',22)+csGlow(460,150,'--cyan',22), dyn:fwd1+blk, cap:'That’s all of STP: <b>a backup without a loop</b>, automatic switchover on failure. <b>Open the stp-loop task</b> and try it live – down a switch and watch the block move.'}
  ];
  function show(i){const g=$('c6hglow');if(g)g.innerHTML=STEPS[i].glow||'';const d=$('c6hdyn');if(d)d.innerHTML=STEPS[i].dyn||'';const c=$('c6hcap');if(c)c.innerHTML='<span>'+STEPS[i].cap+'</span>';}
  courseStepper('c6h',STEPS.length,show);
}
// L3M1 — Why classic STP is slow
function renderC6StpSlow(){
  const seg=(x,w,t,c)=>'<g><rect x="'+x+'" y="70" width="'+w+'" height="26" rx="4" style="fill:var('+c+');fill-opacity:.18;stroke:var('+c+');stroke-width:1.1"/><text x="'+(x+w/2)+'" y="87" text-anchor="middle" style="font:700 8px var(--sans);fill:var('+c+')">'+esc(t)+'</text></g>';
  const svg='<svg id="c6isvg" viewBox="0 0 640 150" width="100%" style="display:block">'
    +'<text x="60" y="40" style="font:700 9px var(--sans);fill:var(--muted)">'+'Classic STP: before a port forwards (~30–50 s)'+'</text>'
    +seg(60,150,'Blocking','--amber')+seg(214,150,'Listening ~15 s','--blue')+seg(368,150,'Learning ~15 s','--violet')+seg(522,58,'Fwd','--green')
    +'<text x="60" y="120" style="font:600 8px var(--mono);fill:var(--muted)">0 s</text><text x="500" y="120" style="font:600 8px var(--mono);fill:var(--muted)">~30–50 s</text>'
    +'<g id="c6idyn"></g></svg>';
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'STP has one annoyance: it’s <b>slow</b>. Classic (original) STP makes a port pass through <b>intermediate states</b> – listening and learning – before forwarding, and each takes around <b>15 seconds</b>. Together that’s <b>30 to 50 seconds</b> before a backup comes up after a failure or a newly plugged device can communicate. In today’s networks that’s an <b>eternity</b> (a call drops, an app times out). Hence a <b>faster version – RSTP</b> (next module).'+'</p>'
    +'<div class="osi-stage">'+svg+'</div>'
    +'<div class="m1-cap" id="c6icap"></div>'
    +courseStepControls('c6i')
    +abbrBox([['listening / learning','classic STP intermediate states (~15 s each) a port passes through before forwarding.'],['convergence time','how long the network takes to settle after a change; tens of seconds with classic STP.']]);
}
function mountC6StpSlow(){
  const arr=(x)=>'<line x1="'+x+'" y1="66" x2="'+x+'" y2="100" style="stroke:var(--txt);stroke-width:1.5;opacity:.5"/>';
  const STEPS=[
    {dyn:arr(62), cap:'After a failure (or plug-in) the port starts in <b>Blocking</b> – it doesn’t forward, only listens.'},
    {dyn:arr(216), cap:'Then <b>Listening</b> (~15 s): the port listens to BPDUs but still <b>doesn’t forward</b> or learn MACs.'},
    {dyn:arr(370), cap:'Then <b>Learning</b> (~15 s): the port now learns MAC addresses but <b>still doesn’t forward</b> traffic.'},
    {dyn:arr(524), cap:'Only now <b>Forwarding</b>. The whole thing took <b>30–50 s</b> – far too long. <b>RSTP</b> cuts it to ~a second (next module).'}
  ];
  function show(i){const d=$('c6idyn');if(d)d.innerHTML=STEPS[i].dyn||'';const c=$('c6icap');if(c)c.innerHTML='<span>'+STEPS[i].cap+'</span>';}
  courseStepper('c6i',STEPS.length,show);
}
// L3M2 — RSTP
function renderC6Rstp(){
  const bar=(y,w,t,c)=>'<g><rect x="120" y="'+(y-11)+'" width="'+w+'" height="22" rx="5" style="fill:var('+c+');fill-opacity:.18;stroke:var('+c+');stroke-width:1.1"/><text x="130" y="'+(y+4)+'" style="font:700 8.5px var(--sans);fill:var('+c+')">'+esc(t)+'</text></g>';
  const svg='<svg id="c6jsvg" viewBox="0 0 640 150" width="100%" style="display:block">'
    +bar(52,360,'Classic STP: 30–50 s','--amber')
    +bar(100,20,'RSTP','--green')+'<text x="150" y="104" style="font:700 8.5px var(--sans);fill:var(--green)">'+'RSTP: ~1 s'+'</text>'
    +'<g id="c6jglow"></g><g id="c6jdyn"></g></svg>';
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'<b>RSTP</b> (Rapid Spanning Tree, 802.1w) does exactly what STP does – just <b>much faster</b>. Instead of waiting for fixed timers, neighboring switches <b>actively negotiate</b> (a "proposal / agreement" handshake): one proposes "I’ll forward", the other agrees at once. Convergence drops from tens of seconds to a <b>fraction of a second</b> (~1 s). Today RSTP is the <b>standard</b> – you’ll rarely meet classic STP. The idea (root, blocked port) stays the same, only the speed differs. Besides RSTP there are other variants (e.g. <b>MSTP</b> for scaling and <b>PVST+</b> from Cisco – a tree per VLAN, which is how this simulator computes it too); you don’t need to know them to grasp the principle.'+'</p>'
    +'<div class="osi-stage">'+svg+'</div>'
    +'<div class="m1-cap" id="c6jcap"></div>'
    +courseStepControls('c6j')
    +abbrBox([['RSTP','Rapid STP (802.1w) – the fast version of STP; converges in ~1 s instead of tens of seconds.'],['proposal / agreement','a quick handshake between switches instead of waiting for timers – hence the speed.']]);
}
function mountC6Rstp(){
  const STEPS=[
    {dyn:'<rect x="120" y="46.5" width="7" height="11" rx="2" style="fill:var(--amber)"><animate attributeName="x" from="120" to="466" dur="3s" repeatCount="indefinite"/></rect><text x="486" y="57" style="font:700 8px var(--sans);fill:var(--amber)">'+esc('still waiting…')+'</text>', cap:'Top: <b>classic STP</b>: the port comes up <b>slowly</b> (30–50 s) – the marker crawls across the whole bar. Bottom: <b>RSTP</b>: almost instant.'},
    {dyn:'<rect x="120" y="94.5" width="7" height="11" rx="2" style="fill:var(--green)"><animate attributeName="x" from="120" to="126" dur="0.5s" repeatCount="indefinite"/></rect><text x="150" y="126" style="font:700 8px var(--sans);fill:var(--cyan)">'+esc('"I propose: forward" → "I agree" → done')+'</text>', cap:'RSTP doesn’t wait for timers – neighbors <b>actively say</b> "I forward / I agree" and the port comes up in <b>~1 second</b>.'},
    {dyn:'<text x="214" y="105" style="font:700 12px var(--sans);fill:var(--green)">✓ '+esc('the default')+'</text>', cap:'The principle (root, blocked port, tree) is the <b>same</b> as STP – RSTP just greatly <b>speeds up the switchover</b> after a failure. That’s why it’s the <b>default</b> today.'}
  ];
  function show(i){const g=$('c6jglow');if(g)g.innerHTML=STEPS[i].glow||'';const d=$('c6jdyn');if(d)d.innerHTML=STEPS[i].dyn||'';const c=$('c6jcap');if(c)c.innerHTML='<span>'+STEPS[i].cap+'</span>';}
  courseStepper('c6j',STEPS.length,show);
}
// L3M3 — PortFast
function renderC6PortFast(){
  const svg='<svg id="c6ksvg" viewBox="0 0 640 176" width="100%" style="display:block">'
    +'<line x1="84" y1="90" x2="262" y2="90" style="stroke:var(--green);stroke-width:1.6"/>'
    +'<g id="c6kglow"></g>'
    +csHost(64,90,'desktop','--blue','PC')+csDev(320,90,'l2switch','SWITCH')
    +'<g id="c6kdyn"></g></svg>';
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'Slow switchover hurts most on <b>access ports</b> – the ones an <b>end device</b> (PC, printer) plugs into. There <b>no loop can form</b> (there’s no switch on the other end), so it makes no sense to wait 30 seconds before a PC gets the network after powering on. <b>PortFast</b> lets such a port <b>forward immediately</b> – it skips the intermediate states. Result: the PC has the network right after plugging in. Note: PortFast belongs <b>only</b> on access ports to end devices, <b>never</b> between switches.'+'</p>'
    +'<div class="osi-stage">'+svg+'</div>'
    +'<div class="m1-cap" id="c6kcap"></div>'
    +courseStepControls('c6k')
    +abbrBox([['PortFast','an access-port setting that skips the STP wait and forwards immediately (only to end devices).'],['access port','a port to an end device (PC, printer); it doesn’t lead to another switch → no loop risk.']]);
}
function mountC6PortFast(){
  const STEPS=[
    {glow:csGlow(64,90,'--blue')+csGlow(320,90,'--cyan',22), dyn:'<text x="200" y="60" text-anchor="middle" style="font:700 7.5px var(--sans);fill:var(--muted)">'+esc('access port – a PC on the other end, not a switch')+'</text>', cap:'On this port there’s a <b>PC</b>, not a switch. <b>No loop can form here.</b> So why wait 30 s?'},
    {glow:csGlow(64,90,'--green')+csGlow(320,90,'--green',22), dyn:csPkt('M84 90 L262 90','--green')+'<text x="200" y="116" text-anchor="middle" style="font:700 7.5px var(--sans);fill:var(--green)">'+esc('PortFast → forwards immediately')+'</text>', cap:'With <b>PortFast</b> the port skips the intermediate states and <b>forwards immediately</b>. The PC has the network right after power-on.'},
    {glow:csGlow(320,90,'--amber',22), dyn:'', cap:'Key rule: PortFast <b>only on access ports</b> to end devices. If you put it between switches by mistake, you’d bring back the risk of an <b>unguarded loop</b>. That’s why PortFast is protected – next module.'}
  ];
  function show(i){const g=$('c6kglow');if(g)g.innerHTML=STEPS[i].glow||'';const d=$('c6kdyn');if(d)d.innerHTML=STEPS[i].dyn||'';const c=$('c6kcap');if(c)c.innerHTML='<span>'+STEPS[i].cap+'</span>';}
  courseStepper('c6k',STEPS.length,show);
}
// L3M4 — BPDU Guard
function renderC6BpduGuard(){
  const svg='<svg id="c6lsvg" viewBox="0 0 640 176" width="100%" style="display:block">'
    +'<line x1="84" y1="90" x2="262" y2="90" style="stroke:var(--line2);stroke-width:1.6"/>'
    +'<g id="c6lglow"></g>'
    +csDev(64,90,'l2switch','foreign SW')+csDev(320,90,'l2switch','SWITCH')+csHost(540,90,'desktop','--blue','PC')
    +'<line x1="378" y1="90" x2="520" y2="90" style="stroke:var(--green);stroke-width:1.4"/>'
    +'<g id="c6ldyn"></g></svg>';
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'PortFast is fast but <b>trusting</b> – it assumes an end device on the access port, not a switch. What if someone (by mistake or on purpose) <b>plugs a switch</b> into such a socket? An <b>unguarded loop</b> could form, or a foreign switch could take over the root-bridge role. <b>BPDU Guard</b> watches for this: a PortFast access port should <b>never receive an STP message (BPDU)</b>. The moment one arrives, BPDU Guard <b>shuts the port down immediately</b> (err-disabled). Safe and simple.'+'</p>'
    +'<div class="osi-stage">'+svg+'</div>'
    +'<div class="m1-cap" id="c6lcap"></div>'
    +courseStepControls('c6l')
    +abbrBox([['BPDU Guard','protection for a PortFast port: if an STP message (BPDU) arrives on it, the port is shut down at once.'],['BPDU','Bridge PDU – the message switches exchange for STP. It has no business on an access port.']]);
}
function mountC6BpduGuard(){
  const STEPS=[
    {glow:csGlow(320,90,'--green',22)+csGlow(540,90,'--blue'), dyn:'<text x="430" y="62" text-anchor="middle" style="font:700 7.5px var(--sans);fill:var(--green)">'+esc('access port + PortFast (a PC expected)')+'</text>', cap:'An access port with <b>PortFast</b> – a PC is expected here. All fine, the port forwards immediately.'},
    {glow:csGlow(64,90,'--red',22)+csGlow(320,90,'--red',22), dyn:csPkt('M84 90 L262 90','--red')+'<text x="180" y="74" text-anchor="middle" style="font:700 7.5px var(--sans);fill:var(--red)">'+esc('someone plugged a switch → sends BPDUs!')+'</text>', cap:'But someone <b>plugged a switch</b> into that socket and it starts sending <b>BPDUs</b>. On a PortFast port that <b>shouldn’t happen</b> – a loop or root takeover looms.'},
    {glow:csGlow(320,90,'--amber',22), dyn:'<line x1="84" y1="90" x2="262" y2="90" style="stroke:var(--amber);stroke-width:2;stroke-dasharray:5 5"/><text x="180" y="76" text-anchor="middle" style="font:800 16px var(--mono);fill:var(--amber)">✕</text><text x="180" y="120" text-anchor="middle" style="font:700 7.5px var(--sans);fill:var(--amber)">'+esc('BPDU Guard → port shut (err-disabled)')+'</text>', cap:'<b>BPDU Guard</b> reacts: the moment it sees a BPDU on a PortFast port, it <b>shuts the port down</b>. The foreign switch is cut off, no loop forms, the root stays yours. Safe.'}
  ];
  function show(i){const g=$('c6lglow');if(g)g.innerHTML=STEPS[i].glow||'';const d=$('c6ldyn');if(d)d.innerHTML=STEPS[i].dyn||'';const c=$('c6lcap');if(c)c.innerHTML='<span>'+STEPS[i].cap+'</span>';}
  courseStepper('c6l',STEPS.length,show);
}
// ---- L4 scene: two switches with multiple links ----
function c6EcScene(pfx){
  return '<svg id="'+pfx+'svg" viewBox="0 0 640 176" width="100%" style="display:block">'
    +'<g id="'+pfx+'links"></g>'
    +'<g id="'+pfx+'glow"></g>'
    +csDev(170,88,'l2switch','SW-A')+csDev(470,88,'l2switch','SW-B')
    +'<g id="'+pfx+'dyn"></g></svg>';
}
// L4M1 — STP wastes bandwidth
function renderC6EcWaste(){
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'STP saved us from a loop – but at a cost now visible. Between two switches you have <b>two links</b> (say 2× 1 Gb/s), yet STP <b>blocks one</b>. So although you ran <b>two cables</b>, you really use only <b>one</b> (1 Gb/s); the other just sits as a backup and <b>wastes bandwidth</b>. What if we could have a backup <b>and use both links</b> at once? That’s what <b>EtherChannel</b> solves.'+'</p>'
    +'<div class="osi-stage">'+c6EcScene('c6m')+'</div>'
    +'<div class="m1-cap" id="c6mcap"></div>'
    +courseStepControls('c6m')
    +abbrBox([['bandwidth','a link’s capacity (e.g. 1 Gb/s). STP leaves one of a pair unused – we want to change that.'],['EtherChannel','bundling several physical links into one logical link – backup and bandwidth at once.']]);
}
function mountC6EcWaste(){
  const two='<line x1="190" y1="80" x2="450" y2="80" style="stroke:var(--green);stroke-width:2.4"/><line x1="190" y1="96" x2="450" y2="96" style="stroke:var(--line2);stroke-width:2.4"/>';
  const set=(h)=>{var e=$('c6mlinks');if(e)e.innerHTML=h;};
  const STEPS=[
    {h:two, dyn:'<text x="320" y="66" text-anchor="middle" style="font:700 7.5px var(--mono);fill:var(--green)">'+esc('2× 1 Gb/s cabled')+'</text>', cap:'You ran <b>two cables</b> between SW-A and SW-B – for backup and for performance. Logically you want <b>2 Gb/s</b>.'},
    {h:two, dyn:'<text x="320" y="120" text-anchor="middle" style="font:800 14px var(--mono);fill:var(--amber)">'+esc('STP block')+'</text>', cap:'But STP <b>blocks one</b> link (else a loop). The second cable <b>lies idle</b>. You really have just <b>1 Gb/s</b> – you paid for half of it for nothing.'},
    {h:two, dyn:'', cap:'We want both: <b>redundancy and full capacity</b>. The fix: make the switches treat the two cables as <b>one link</b> – then there’s nothing to block. That’s <b>EtherChannel</b> (next module).'}
  ];
  function show(i){set(STEPS[i].h);const d=$('c6mdyn');if(d)d.innerHTML=STEPS[i].dyn||'';const c=$('c6mcap');if(c)c.innerHTML='<span>'+STEPS[i].cap+'</span>';}
  courseStepper('c6m',STEPS.length,show);
}
// L4M2 — EtherChannel: bundle them into one
function renderC6EcBundle(){
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'<b>EtherChannel</b> (a.k.a. "port channel" or link aggregation) <b>bundles several physical links into one logical link</b>. Both switches agree to treat those, say, <b>four cables</b> as <b>one big port</b>. What follows: <b>STP sees only one link</b> → nothing to block → <b>no waste</b>. The bandwidth <b>adds up</b> (4× 1 Gb/s = up to 4 Gb/s) – but note it adds up for the <b>sum of many connections at once</b>; a single transfer still rides one link only (you’ll see why shortly, under load balancing). And if one cable in the bundle breaks, the others carry on (just at lower capacity) – <b>redundancy is built in</b>. One clever trick solves performance and backup at once.'+'</p>'
    +'<div class="osi-stage">'+c6EcScene('c6n')+'</div>'
    +'<div class="m1-cap" id="c6ncap"></div>'
    +courseStepControls('c6n')
    +abbrBox([['EtherChannel','a bundle of several links treated as one logical link; STP sees one port (doesn’t block it).'],['link aggregation','the general term for bundling links for higher capacity and redundancy.']]);
}
function mountC6EcBundle(){
  const four=(c)=>'<line x1="190" y1="72" x2="450" y2="72" style="stroke:var('+c+');stroke-width:2"/><line x1="190" y1="82" x2="450" y2="82" style="stroke:var('+c+');stroke-width:2"/><line x1="190" y1="92" x2="450" y2="92" style="stroke:var('+c+');stroke-width:2"/><line x1="190" y1="102" x2="450" y2="102" style="stroke:var('+c+');stroke-width:2"/>';
  const set=(h)=>{var e=$('c6nlinks');if(e)e.innerHTML=h;};
  const STEPS=[
    {h:four('--line2'), dyn:'', cap:'Several <b>cables</b> run between the switches (four here). Without EtherChannel STP would keep only one active.'},
    {h:four('--cyan'), dyn:'<rect x="196" y="64" width="248" height="46" rx="9" style="fill:none;stroke:var(--cyan);stroke-width:1.8;stroke-dasharray:4 3"/><text x="320" y="132" text-anchor="middle" style="font:700 8px var(--mono);fill:var(--cyan)">'+esc('1 logical link (port channel)')+'</text>', cap:'EtherChannel <b>bundles them into one logical link</b>. Both switches now treat them as <b>one port</b>.'},
    {h:four('--green'), dyn:csGlow(170,88,'--green',22)+csGlow(470,88,'--green',22)+csPkt('M190 72 L450 72','--green')+csPkt('M190 82 L450 82','--green','2.1s')+csPkt('M190 92 L450 92','--green')+csPkt('M190 102 L450 102','--green','2.1s')+'<text x="320" y="132" text-anchor="middle" style="font:700 8px var(--sans);fill:var(--green)">'+esc('STP blocks nothing → 4 Gb/s used')+'</text>', cap:'STP now sees <b>one link</b> → <b>blocks nothing</b>. Traffic flows over <b>all</b> the cables, capacity <b>adds up</b> (4× 1 Gb/s). No waste.'},
    {h:four('--green'), dyn:'<line x1="190" y1="82" x2="450" y2="82" style="stroke:var(--red);stroke-width:2;stroke-dasharray:4 3"/><text x="320" y="132" text-anchor="middle" style="font:700 7.5px var(--sans);fill:var(--amber)">'+esc('one cable fails → the rest carry on')+'</text>', cap:'And if <b>one cable breaks</b>, the bundle runs on over the rest (just at lower capacity). <b>Redundancy and performance</b> in one. How the bundle forms is the next module (LACP).'}
  ];
  function show(i){set(STEPS[i].h);const d=$('c6ndyn');if(d)d.innerHTML=STEPS[i].dyn||'';const c=$('c6ncap');if(c)c.innerHTML='<span>'+STEPS[i].cap+'</span>';}
  courseStepper('c6n',STEPS.length,show);
}
// L4M3 — LACP
function renderC6Lacp(){
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'How do the switches know to bundle those cables? You can set it <b>statically by hand</b> on both ends – but if you slip up (one side has the bundle, the other doesn’t), a <b>loop forms</b>. Safer is <b>LACP</b> (Link Aggregation Control Protocol): both switches <b>exchange messages and agree</b> to aggregate the links. The bundle forms <b>only if both sides agree</b>. If not, the ports stay separate (and STP guards them). That’s why in practice <b>LACP</b> is used, not manual config.'+'</p>'
    +'<div class="osi-stage">'+c6EcScene('c6o')+'</div>'
    +'<div class="m1-cap" id="c6ocap"></div>'
    +courseStepControls('c6o')
    +abbrBox([['LACP','the protocol by which switches agree to aggregate links; the bundle forms only on mutual agreement.'],['static EtherChannel','a bundle configured by hand with no negotiation; it is error-prone (a loop on mismatch) – LACP safeguards with negotiation.']]);
}
function mountC6Lacp(){
  const four=(c)=>'<line x1="190" y1="72" x2="450" y2="72" style="stroke:var('+c+');stroke-width:2"/><line x1="190" y1="82" x2="450" y2="82" style="stroke:var('+c+');stroke-width:2"/><line x1="190" y1="92" x2="450" y2="92" style="stroke:var('+c+');stroke-width:2"/><line x1="190" y1="102" x2="450" y2="102" style="stroke:var('+c+');stroke-width:2"/>';
  const set=(h)=>{var e=$('c6olinks');if(e)e.innerHTML=h;};
  const STEPS=[
    {h:four('--line2'), dyn:csGlow(170,88,'--cyan',22)+csGlow(470,88,'--cyan',22)+csPkt('M190 87 L450 87','--cyan')+csPkt('M450 87 L190 87','--cyan')+'<text x="320" y="130" text-anchor="middle" style="font:700 8px var(--mono);fill:var(--cyan)">'+esc('LACP: "shall we bundle?" – "yes"')+'</text>', cap:'The switches exchange <b>LACP</b> messages: "want to aggregate these ports?" When <b>both sides agree</b>…'},
    {h:four('--green'), dyn:'<rect x="196" y="64" width="248" height="46" rx="9" style="fill:none;stroke:var(--green);stroke-width:1.8"/><text x="320" y="130" text-anchor="middle" style="font:700 8px var(--sans);fill:var(--green)">'+esc('✓ bundle formed')+'</text>', cap:'…the <b>bundle forms</b>. Safely – both sides have it the same, so no loop from a misunderstanding.'},
    {h:four('--amber'), dyn:'<text x="320" y="130" text-anchor="middle" style="font:700 7.5px var(--sans);fill:var(--amber)">'+esc('if only one side agrees → no bundle')+'</text>', cap:'And if <b>only one side</b> agreed, LACP <b>won’t form</b> the bundle – the ports stay separate and STP guards them. That’s why LACP is <b>safer</b> than manual config.'}
  ];
  function show(i){set(STEPS[i].h);const d=$('c6odyn');if(d)d.innerHTML=STEPS[i].dyn||'';const c=$('c6ocap');if(c)c.innerHTML='<span>'+STEPS[i].cap+'</span>';}
  courseStepper('c6o',STEPS.length,show);
}
// L4M4 — Load balancing
function renderC6EcBalance(){
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'One last question: with several cables in the bundle, <b>how is traffic split between them</b>? EtherChannel uses a <b>hash</b> of the addresses (source/destination IP or MAC): by it each <b>connection</b> gets <b>one specific cable</b> from the bundle. This <b>spreads</b> the traffic so no cable is overloaded. Note: a <b>single flow</b> (one transfer) always uses <b>just one cable</b> – so one huge transfer won’t go faster than a single link; the benefit is in the <b>sum of many connections</b>. And as you know, if one cable fails the hash is recomputed and it carries on.'+'</p>'
    +'<div class="osi-stage">'+c6EcScene('c6p')+'</div>'
    +'<div class="m1-cap" id="c6pcap"></div>'
    +courseStepControls('c6p')
    +abbrBox([['load balancing','spreading connections across the bundle’s cables by an address hash – even utilization.'],['hash / flow hashing','a single number – a hash – is computed from the addresses (source + destination) and picks a cable. The same connection always uses the same cable; the speed-up is in the sum of many connections, not one.']]);
}
function mountC6EcBalance(){
  const four=(c)=>'<line x1="190" y1="72" x2="450" y2="72" style="stroke:var('+c+');stroke-width:2"/><line x1="190" y1="82" x2="450" y2="82" style="stroke:var('+c+');stroke-width:2"/><line x1="190" y1="92" x2="450" y2="92" style="stroke:var('+c+');stroke-width:2"/><line x1="190" y1="102" x2="450" y2="102" style="stroke:var('+c+');stroke-width:2"/>';
  const set=(h)=>{var e=$('c6plinks');if(e)e.innerHTML=h;};
  const STEPS=[
    {h:four('--green'), dyn:csGlow(170,88,'--cyan',22)+csGlow(470,88,'--cyan',22)+csPkt('M190 72 L450 72','--blue')+csPkt('M190 82 L450 82','--amber')+csPkt('M190 92 L450 92','--green')+csPkt('M190 102 L450 102','--violet'), cap:'Several connections (different colors) are split between the cables by an <b>address hash</b> – each connection gets <b>its own cable</b>. Traffic is spread evenly.'},
    {h:four('--green'), dyn:csGlow(170,88,'--blue',22)+csGlow(470,88,'--blue',22)+csPkt('M190 82 L450 82','--blue')+'<text x="320" y="132" text-anchor="middle" style="font:700 7.5px var(--sans);fill:var(--muted)">'+esc('one big transfer = just one cable')+'</text>', cap:'But note: a <b>single flow</b> (one big transfer) still uses <b>one cable</b>. EtherChannel speeds up the <b>sum of many connections</b>, not one giant file.'},
    {h:four('--green'), dyn:'<line x1="190" y1="92" x2="450" y2="92" style="stroke:var(--red);stroke-width:2;stroke-dasharray:4 3"/>'+csGlow(170,88,'--cyan',22)+csGlow(470,88,'--cyan',22)+csPkt('M190 72 L450 72','--blue')+csPkt('M190 82 L450 82','--amber')+csPkt('M190 82 L450 82','--green','2.2s')+csPkt('M190 102 L450 102','--violet')+'<text x="320" y="132" text-anchor="middle" style="font:700 7.5px var(--sans);fill:var(--green)">'+esc('cable failed → the green flow re-hashed onto another cable')+'</text>', cap:'When one cable <b>fails</b>, its connections are <b>re-hashed</b> onto the remaining cables and carry on. <b>Redundancy, performance and balancing</b> – that’s EtherChannel in full.'}
  ];
  function show(i){set(STEPS[i].h);const d=$('c6pdyn');if(d)d.innerHTML=STEPS[i].dyn||'';const c=$('c6pcap');if(c)c.innerHTML='<span>'+STEPS[i].cap+'</span>';}
  courseStepper('c6p',STEPS.length,show);
}
// L5M1 — VLAN pruning
function renderC6Pruning(){
  const svg='<svg id="c6usvg" viewBox="0 0 640 176" width="100%" style="display:block">'
    +'<line x1="190" y1="90" x2="450" y2="90" style="stroke:var(--cyan);stroke-width:2.6"/><text x="320" y="76" text-anchor="middle" style="font:700 7px var(--mono);fill:var(--cyan)">TRUNK</text>'
    +'<g id="c6uglow"></g>'
    +csDev(170,90,'l2switch','SW-A')+csDev(470,90,'l2switch','SW-B')
    +'<text x="170" y="142" text-anchor="middle" style="font:600 7px var(--mono);fill:var(--muted)">V10 V20 V30</text><text x="470" y="142" text-anchor="middle" style="font:600 7px var(--mono);fill:var(--muted)">V10 V20</text>'
    +'<g id="c6udyn"></g></svg>';
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'A trunk by default carries <b>all VLANs</b>. But not every switch needs every VLAN. Here SW-B has no <b>VLAN 30</b> – yet broadcasts from VLAN 30 would still be dragged to it over the trunk, where they <b>have no business</b> (wasting bandwidth and loading SW-B). <b>VLAN pruning</b> prevents this: on the trunk you <b>allow only the VLANs the other side actually uses</b>. Less needless traffic, a cleaner network.'+'</p>'
    +'<div class="osi-stage">'+svg+'</div>'
    +'<div class="m1-cap" id="c6ucap"></div>'
    +courseStepControls('c6u')
    +abbrBox([['VLAN pruning','restricting a trunk to only the VLANs the other side uses – less needless broadcast.'],['allowed VLANs','the list of VLANs allowed on a trunk; what isn’t in it isn’t carried over the trunk.']]);
}
function mountC6Pruning(){
  const STEPS=[
    {glow:csGlow(170,90,'--cyan',22)+csGlow(470,90,'--cyan',22), dyn:'', cap:'SW-A has VLANs 10, 20, 30. SW-B only <b>10 and 20</b> (no VLAN 30 at all). The trunk between them carries <b>all</b> by default.'},
    {glow:csGlow(170,90,'--amber',22)+csGlow(470,90,'--amber',22), dyn:csPkt('M190 90 L450 90','--amber')+'<text x="320" y="110" text-anchor="middle" style="font:700 7px var(--sans);fill:var(--amber)">'+esc('VLAN 30 broadcast needlessly reaches SW-B')+'</text>', cap:'A <b>VLAN 30</b> broadcast is still dragged over the trunk to SW-B – which has <b>no VLAN 30</b> at all. Wasted bandwidth and load.'},
    {glow:csGlow(170,90,'--green',22)+csGlow(470,90,'--green',22), dyn:'<text x="320" y="110" text-anchor="middle" style="font:700 7.5px var(--sans);fill:var(--green)">'+esc('trunk allows only V10, V20 → V30 not carried')+'</text>', cap:'<b>Pruning:</b> you allow <b>only V10 and V20</b> on the trunk. VLAN 30 is no longer carried over it – its broadcasts stay where they belong. A cleaner, faster network.'}
  ];
  function show(i){const g=$('c6uglow');if(g)g.innerHTML=STEPS[i].glow||'';const d=$('c6udyn');if(d)d.innerHTML=STEPS[i].dyn||'';const c=$('c6ucap');if(c)c.innerHTML='<span>'+STEPS[i].cap+'</span>';}
  courseStepper('c6u',STEPS.length,show);
}
// L5M2 — Native VLAN left as VLAN 1 (= the attacker's VLAN) → VLAN hopping (double-tagging)
function renderC6VlanHop(){
  const svg='<svg id="c6vsvg" viewBox="0 0 640 176" width="100%" style="display:block">'
    +'<line x1="190" y1="90" x2="450" y2="90" style="stroke:var(--cyan);stroke-width:2.4"/>'
    +'<g id="c6vglow"></g>'
    +csDev(170,90,'l2switch','SW-A')+csDev(470,90,'l2switch','SW-B')+csHost(64,90,'desktop','--red','attacker')+csHost(576,90,'nas','--green','secret VLAN')
    +'<line x1="84" y1="90" x2="150" y2="90" style="stroke:var(--line2);stroke-width:1.4"/><line x1="490" y1="90" x2="556" y2="90" style="stroke:var(--line2);stroke-width:1.4"/>'
    +'<g id="c6vdyn"></g></svg>';
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'Recall the <b>native VLAN</b> from the Switching and VLANs course (untagged traffic on a trunk – otherwise VLANs on a trunk are told apart by a <b>tag</b> carrying the VLAN number). Here’s a <b>security trap</b>: when the <b>trunk’s native VLAN</b> is left as the default <b>VLAN 1</b> – the same VLAN an attacker can sit in – the attacker can do <b>VLAN hopping</b> (more in the switch in depth course) – by "double-tagging" a frame they <b>slip into a foreign VLAN</b> they shouldn’t reach (the first switch strips the outer tag because it matches its native, exposing the inner one – step by step below). Defense: use a <b>dedicated unused VLAN</b> for the native VLAN (not VLAN 1 where users sit), set it the same on both ends and ideally forbid untagged traffic on the trunk.'+'</p>'
    +'<div class="osi-stage">'+svg+'</div>'
    +'<div class="m1-cap" id="c6vcap"></div>'
    +courseStepControls('c6v')
    +abbrBox([['VLAN hopping','an attack where double-tagging gets the attacker into a foreign VLAN; enabled by leaving the native VLAN as VLAN 1 (where the attacker sits).'],['native VLAN','the VLAN of untagged trunk traffic; ideally dedicated and unused (not user VLAN 1), matched on both ends.']]);
}
function mountC6VlanHop(){
  // a frame = a row of boxes; fbox(x,text,color,off?) – off = outer tag removed/struck through
  const fbox=(x,txt,col,off)=>'<rect x="'+x+'" y="120" width="46" height="20" rx="4" style="fill:var(--panel);stroke:var('+col+');stroke-width:1.2'+(off?';stroke-dasharray:3 2;opacity:.4':'')+'"/><text x="'+(x+23)+'" y="134" text-anchor="middle" style="font:700 8px var(--mono);fill:var('+col+')'+(off?';opacity:.4':'')+'">'+esc(txt)+'</text>';
  const lbl=(x,txt,col)=>'<text x="'+x+'" y="158" text-anchor="middle" style="font:700 7.5px var(--sans);fill:var('+col+')">'+esc(txt)+'</text>';
  const T_OUT=234, T_IN=282, T_DAT=330; // outer tag / inner tag / data
  const STEPS=[
    {glow:csGlow(170,90,'--red',22)+csGlow(64,90,'--red'), dyn:'<text x="320" y="80" text-anchor="middle" style="font:700 7px var(--mono);fill:var(--red)">trunk native = VLAN 1 (✗) = '+'attacker VLAN'+'</text>', cap:'The trunk’s native VLAN is left as the default <b>VLAN 1</b> – the same one the attacker sits in. That’s the hole the attack exploits.'},
    {glow:csGlow(64,90,'--red'), dyn:fbox(T_OUT,'VLAN 1','--amber')+fbox(T_IN,'VLAN 20','--red')+fbox(T_DAT,'DATA','--muted')+lbl(305,'outer = native (1) · inner = target (20)','--muted'), cap:'The attacker crafts a frame with <b>TWO</b> 802.1Q tags: an <b>outer VLAN 1</b> (the trunk native) and beneath it an <b>inner VLAN 20</b> (the secret target VLAN).'},
    {glow:csGlow(170,90,'--red',22)+csGlow(470,90,'--red',22), dyn:fbox(T_OUT,'VLAN 1','--amber',true)+fbox(T_IN,'VLAN 20','--red')+fbox(T_DAT,'DATA','--muted')+lbl(305,'SW-A: outer tag (VLAN 1) = its native → stripped','--red')+csPkt('M190 90 L450 90','--red'), cap:'<b>SW-A</b> looks at the <b>outer</b> tag = VLAN 1 = its <b>native</b> → it <b>strips</b> the tag and forwards the frame over the trunk. The <b>inner</b> tag VLAN 20 is now exposed.'},
    {glow:csGlow(470,90,'--red',22)+csGlow(576,90,'--red'), dyn:fbox(T_IN,'VLAN 20','--red')+fbox(T_DAT,'DATA','--muted')+lbl(305,'SW-B reads tag 20 → delivers to secret VLAN','--red')+csPkt('M490 90 L556 90','--red'), cap:'<b>SW-B</b> reads the remaining <b>VLAN 20</b> tag and delivers the frame to the <b>secret VLAN</b> the attacker shouldn’t reach. <b>VLAN hopping</b> – and it’s <b>one-way</b> (no reply returns the same way).'},
    {glow:csGlow(170,90,'--green',22)+csGlow(470,90,'--green',22), dyn:lbl(305,'native VLAN matched on both ends + unused (not VLAN 1)','--green'), cap:'Defense: <b>native VLAN the same on both ends</b>, set to an <b>unused</b> VLAN (not VLAN 1). Then the outer tag has nothing to abuse and the attack fizzles.'}
  ];
  function show(i){const g=$('c6vglow');if(g)g.innerHTML=STEPS[i].glow||'';const d=$('c6vdyn');if(d)d.innerHTML=STEPS[i].dyn||'';const c=$('c6vcap');if(c)c.innerHTML='<span>'+STEPS[i].cap+'</span>';}
  courseStepper('c6v',STEPS.length,show);
}
// L5M3 — The redundant network as a whole
function renderC6FullRedundant(){
  const svg='<svg id="c6wsvg" viewBox="0 0 640 210" width="100%" style="display:block">'
    +'<line x1="240" y1="59" x2="400" y2="59" style="stroke:var(--cyan);stroke-width:2.2"/>'
    +'<line x1="240" y1="69" x2="400" y2="69" style="stroke:var(--cyan);stroke-width:2.2"/>'
    +'<line x1="209.9" y1="81.3" x2="180.1" y2="132.7" style="stroke:var(--line2);stroke-width:1.6"/><line x1="430.1" y1="81.3" x2="459.9" y2="132.7" style="stroke:var(--line2);stroke-width:1.6"/>'
    +'<line x1="238.9" y1="70.5" x2="451.1" y2="143.5" style="stroke:var(--line2);stroke-width:1.2;stroke-dasharray:3 3"/><line x1="401.1" y1="70.5" x2="188.9" y2="143.5" style="stroke:var(--line2);stroke-width:1.2;stroke-dasharray:3 3"/>'
    +'<g id="c6wglow"></g>'
    +csDev(220,64,'l2switch','DIST-1')+csDev(420,64,'l2switch','DIST-2')+csDev(170,150,'l2switch','ACC-A')+csDev(470,150,'l2switch','ACC-B')+csHost(64,150,'desktop','--blue','PC')+csHost(576,150,'server','--green','SRV')
    +'<line x1="84" y1="150" x2="150" y2="150" style="stroke:var(--line2);stroke-width:1.3"/><line x1="490" y1="150" x2="556" y2="150" style="stroke:var(--line2);stroke-width:1.3"/>'
    +'<g id="c6wdyn"></g></svg>';
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'Let’s put it together into a <b>resilient network</b>. Two <b>distribution</b> switches (DIST-1, DIST-2) joined by an <b>EtherChannel</b> (full capacity); below them <b>access</b> switches (ACC-A, ACC-B) with PCs and servers attached. Each access switch is connected <b>twice</b> upward (to both distribution switches) – so if one path or switch fails, there’s another. And to stop those doubled links <b>making a loop</b>, <b>STP/RSTP</b> guards them (blocking the spare and switching over after a failure). Redundancy at every level, no storm.'+'</p>'
    +'<div class="osi-stage">'+svg+'</div>'
    +'<div class="m1-cap" id="c6wcap"></div>'
    +courseStepControls('c6w')
    +abbrBox([['distribution / access','network layers: access = where devices connect, distribution = the backbone joining them.'],['dual-homing','each access switch links to two distribution switches – it survives one path failing.']]);
}
function mountC6FullRedundant(){
  const STEPS=[
    {glow:csGlow(220,64,'--cyan',22)+csGlow(420,64,'--cyan',22), dyn:'<text x="320" y="50" text-anchor="middle" style="font:700 7px var(--sans);fill:var(--cyan)">'+esc('EtherChannel (full capacity)')+'</text>', cap:'At the top two <b>distribution</b> switches, joined by an <b>EtherChannel</b> – both links used, redundancy inside the bundle.'},
    {glow:csGlow(170,150,'--green',22)+csGlow(470,150,'--green',22), dyn:'', cap:'Below, <b>access</b> switches with PCs and servers. Each is <b>dual-homed</b> upward – to both distribution switches. If one fails, the other holds.'},
    {glow:csGlow(420,64,'--amber',22)+csGlow(170,150,'--amber',22), dyn:'<line x1="401.1" y1="70.5" x2="188.9" y2="143.5" style="stroke:var(--amber);stroke-width:2.2;stroke-dasharray:5 4"/><text x="295" y="98" text-anchor="middle" style="font:700 7.5px var(--mono);fill:var(--amber)">'+esc('STP block')+'</text>', cap:'Those doubled uplinks form loops – so <b>STP/RSTP</b> guards them: it keeps one <b>blocked</b> (dashed amber – here the ACC-A → DIST-2 uplink) so no storm erupts. After the primary uplink fails it unblocks that one.'},
    {glow:csGlow(220,64,'--green',22)+csGlow(420,64,'--green',22)+csGlow(170,150,'--green',22)+csGlow(470,150,'--green',22), dyn:'', cap:'The result: <b>no single point of failure</b> at L2. EtherChannel gives capacity, dual-homing and STP/RSTP give resilience. What happens on a failure is the last module.'}
  ];
  function show(i){const g=$('c6wglow');if(g)g.innerHTML=STEPS[i].glow||'';const d=$('c6wdyn');if(d)d.innerHTML=STEPS[i].dyn||'';const c=$('c6wcap');if(c)c.innerHTML='<span>'+STEPS[i].cap+'</span>';}
  courseStepper('c6w',STEPS.length,show);
}
// L5M4 — Failure and what next
function renderC6Wrap(){
  const svg='<svg id="c6xsvg" viewBox="0 0 640 200" width="100%" style="display:block">'
    +'<line x1="240" y1="64" x2="400" y2="64" style="stroke:var(--cyan);stroke-width:2.4"/>'
    +'<line x1="209.9" y1="81.3" x2="180.1" y2="132.7" style="stroke:var(--line2);stroke-width:1.6"/><line x1="430.1" y1="81.3" x2="459.9" y2="132.7" style="stroke:var(--line2);stroke-width:1.6"/>'
    +'<line x1="401.1" y1="70.5" x2="188.9" y2="143.5" style="stroke:var(--line2);stroke-width:1.2;stroke-dasharray:3 3"/>'
    +'<g id="c6xglow"></g>'
    +csDev(220,64,'l2switch','DIST-1')+csDev(420,64,'l2switch','DIST-2')+csDev(170,150,'l2switch','ACC-A')+csDev(470,150,'l2switch','ACC-B')
    +'<g id="c6xdyn"></g></svg>';
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'The design’s final exam: <b>something fails</b>. Say switch DIST-1 or its link. In a <b>flat network without redundancy</b> that would mean an outage. Not here: <b>STP/RSTP recomputes the tree</b>, unblocks the backup uplink and traffic flows <b>within a second</b> via DIST-2. The user doesn’t even notice. That’s the point of the whole course: <b>redundancy + STP/RSTP + EtherChannel = a network that survives a failure</b>. And what’s next? You have the L2 and L3 foundation; the journey continues with <b>the OSPF in depth course</b> and after it <b>Advanced security (DPI, IDS/IPS)</b>.'+'</p>'
    +'<div class="osi-stage">'+svg+'</div>'
    +'<div class="m1-cap" id="c6xcap"></div>'
    +courseStepControls('c6x')
    +abbrBox([['resilient network','a design that survives a device/link failure without a service outage – the goal of redundancy.'],['high availability','the combination of redundancy, fast convergence and aggregation – a network that "just keeps running".']]);
}
function mountC6Wrap(){
  const STEPS=[
    {glow:csGlow(220,64,'--green',22)+csGlow(420,64,'--green',22)+csGlow(170,150,'--green',22)+csGlow(470,150,'--green',22), dyn:'<line x1="209.9" y1="81.3" x2="180.1" y2="132.7" style="stroke:var(--green);stroke-width:2.4;opacity:.7"/>', cap:'Normal state: ACC-A runs via <b>DIST-1</b> (the main uplink), the backup uplink to DIST-2 is <b>blocked</b>.'},
    {glow:csGlow(220,64,'--red',22), dyn:'<line x1="209.9" y1="81.3" x2="180.1" y2="132.7" style="stroke:var(--red);stroke-width:2;stroke-dasharray:5 5"/><text x="180" y="108" text-anchor="middle" style="font:800 16px var(--mono);fill:var(--red)">✕</text>', cap:'<b>DIST-1 (or its link) fails.</b> ACC-A’s main uplink is gone. In a network without a backup this would be an outage.'},
    {glow:csGlow(420,64,'--green',22)+csGlow(170,150,'--green',22), dyn:'<line x1="401.1" y1="70.5" x2="188.9" y2="143.5" style="stroke:var(--green);stroke-width:2.4;opacity:.7"/><text x="320" y="180" text-anchor="middle" style="font:700 8px var(--sans);fill:var(--green)">'+esc('RSTP switched the backup uplink → runs via DIST-2')+'</text>', cap:'But <b>RSTP</b> fixes it within a second: it unblocks the backup uplink, ACC-A now runs via <b>DIST-2</b>. <b>No outage.</b>'},
    {glow:csGlow(220,64,'--cyan',22)+csGlow(420,64,'--cyan',22)+csGlow(170,150,'--cyan',22)+csGlow(470,150,'--cyan',22), dyn:'', cap:'And that’s all of <b>the redundancy and STP course</b>: you’ve built a network that <b>survives a failure</b>, and you understand how it does it. Congratulations – you have a solid L2 and L3 networking foundation. And it keeps going: next is <b>the OSPF in depth course</b>, followed by <b>Advanced security (DPI, IDS/IPS)</b>. <b>See you there!</b>'}
  ];
  function show(i){const g=$('c6xglow');if(g)g.innerHTML=STEPS[i].glow||'';const d=$('c6xdyn');if(d)d.innerHTML=STEPS[i].dyn||'';const c=$('c6xcap');if(c)c.innerHTML='<span>'+STEPS[i].cap+'</span>';}
  courseStepper('c6x',STEPS.length,show);
}
const COURSE_6_DEF = {
  id:'course6',
title:'Redundancy and Spanning Tree',
  blurb:'Why one link isn’t enough: loops and broadcast storms, Spanning Tree (root bridge, port states), RSTP, EtherChannel.',
  lessons:[
    { id:'c6l1', title:'The loop that kills a network', taskId:'storm-stp', quizId:'c6q_l1', modules:[
      { id:'c6l1m1', title:'We want a backup', render:renderC6BackupWhy, mount:mountC6BackupWhy },
      { id:'c6l1m2', title:'Broadcast storm', render:renderC6Storm, mount:mountC6Storm },
      { id:'c6l1m3', title:'MAC instability', render:renderC6MacFlap, mount:mountC6MacFlap }
    ]},
    { id:'c6l2', title:'Spanning Tree', taskId:'stp-loop', quizId:'c6q_l2', modules:[
      { id:'c6l2m1', title:'The idea of STP', render:renderC6StpIdea, mount:mountC6StpIdea },
      { id:'c6l2m2', title:'The root bridge', render:renderC6RootBridge, mount:mountC6RootBridge },
      { id:'c6l2m3', title:'Port states', render:renderC6PortStates, mount:mountC6PortStates },
      { id:'c6l2m4', title:'Choosing the blocked port', render:renderC6BlockChoice, mount:mountC6BlockChoice },
      { id:'c6l2m5', title:'Failure and switchover', render:renderC6Failover, mount:mountC6Failover }
    ]},
    { id:'c6l3', title:'RSTP and PortFast', taskId:null, quizId:'c6q_l3', modules:[
      { id:'c6l3m1', title:'Why classic STP is slow', render:renderC6StpSlow, mount:mountC6StpSlow },
      { id:'c6l3m2', title:'RSTP: rapid convergence', render:renderC6Rstp, mount:mountC6Rstp },
      { id:'c6l3m3', title:'PortFast', render:renderC6PortFast, mount:mountC6PortFast },
      { id:'c6l3m4', title:'BPDU Guard', render:renderC6BpduGuard, mount:mountC6BpduGuard }
    ]},
    { id:'c6l4', title:'EtherChannel', taskId:'lag-uplink', quizId:'c6q_l4', modules:[
      { id:'c6l4m1', title:'STP wastes bandwidth', render:renderC6EcWaste, mount:mountC6EcWaste },
      { id:'c6l4m2', title:'Bundle them into one', render:renderC6EcBundle, mount:mountC6EcBundle },
      { id:'c6l4m3', title:'LACP', render:renderC6Lacp, mount:mountC6Lacp },
      { id:'c6l4m4', title:'Load balancing', render:renderC6EcBalance, mount:mountC6EcBalance }
    ]},
    { id:'c6l5', title:'Trunks in depth and synthesis', taskId:'stp-redundant', quizId:'c6q_l5', modules:[
      { id:'c6l5m1', title:'VLAN pruning', render:renderC6Pruning, mount:mountC6Pruning },
      { id:'c6l5m2', title:'Native VLAN and VLAN hopping', render:renderC6VlanHop, mount:mountC6VlanHop },
      { id:'c6l5m3', title:'A redundant network together', render:renderC6FullRedundant, mount:mountC6FullRedundant },
      { id:'c6l5m4', title:'Failure and what’s next', render:renderC6Wrap, mount:mountC6Wrap }
    ]}
  ]
};
const COURSE_6_QUIZZES_DEF = {
  c6q_l1:{ title:'Quiz: A loop in the network', qs:[
    { q:'Why do we add a <b>backup link</b> between switches?',
      opts:['so one cut cable doesn’t cut off part of the network (removing a point of failure)','so the internet connection is noticeably faster for the whole company network','so there are far fewer needless broadcast frames and collisions in the network'],
      correct:0, why:'One cable = a single point of failure. A backup lets the network survive one link failing. But two active links form a loop.' },
    { q:'What is a <b>broadcast storm</b>?',
      opts:['a broadcast endlessly circles a loop, multiplies and saturates the network','too many users connect at the very same moment all at once','a targeted attack from the internet that floods company servers with requests'],
      correct:0, why:'A switch floods a broadcast to all ports; in a loop it returns and is flooded again. Within seconds it saturates all links and the network collapses.' },
    { q:'How does a loop break a switch’s <b>MAC table</b>?',
      opts:['the same MAC arrives alternately from different ports → the switch keeps overwriting it (flapping)','the switch wipes its whole MAC address table at once and starts learning from scratch again','the switch rather encrypts the entire contents of its MAC table because of the loop'],
      correct:0, why:'The circling frame arrives once from one port, then the other. The switch sees one MAC on two ports and keeps overwriting it – the table becomes useless.' }
  ]},
  c6q_l2:{ title:'Quiz: Spanning Tree', qs:[
    { q:'What does <b>Spanning Tree (STP)</b> do?',
      opts:['finds loops and logically blocks a port to leave a loop-free tree','it greatly speeds up all the links running between connected switches','it encrypts all the traffic flowing between the individual switches'],
      correct:0, why:'STP lets you have backup links without a loop: it keeps the redundant port blocked (a backup) until needed. No broadcast storm.' },
    { q:'How is the <b>root bridge</b> chosen?',
      opts:['automatically – the switch with the lowest bridge ID (priority + MAC) wins','by hand – the admin must set the root bridge on every network change','randomly – it changes again on every single packet that is forwarded'],
      correct:0, why:'Bridge ID = priority + MAC; the lowest wins. The priority is configurable, so you can influence the root (ideally a central, powerful switch).' },
    { q:'What state is the redundant (backup) port in?',
      opts:['blocking – it doesn’t forward traffic, only listens to STP and waits until needed','completely off and physically disconnected until the admin turns it on by hand','forwarding – it forwards traffic exactly like all the other ports do'],
      correct:0, why:'A blocked port isn’t dead – it’s a silent backup. It listens to STP and the protocol can switch it to forwarding at any time.' },
    { q:'What happens when the <b>active link fails</b>?',
      opts:['STP recomputes the tree and switches the backup (blocked) port to forwarding – the network keeps running','the whole network shuts down at once over the loss of a single active link and stops working completely','the admin must plug in a new spare patch cable by hand as fast as possible'],
      correct:0, why:'That’s the point of redundancy with STP: after a failure the backup activates itself (convergence) and traffic flows another way – with no human intervention.' }
  ]},
  c6q_l3:{ title:'Quiz: RSTP and PortFast', qs:[
    { q:'Why is <b>classic STP</b> a problem in today’s networks?',
      opts:['it converges slowly (30–50 s) due to the listening and learning states','it needlessly blocks too many ports and so wastes the whole network’s capacity','it can’t work at all in a network that has several VLANs deployed at once'],
      correct:0, why:'A port must pass through listening (~15 s) and learning (~15 s) before forwarding. That’s too long today – hence RSTP.' },
    { q:'How is <b>RSTP</b> better than classic STP?',
      opts:['it converges in ~1 s (a handshake instead of timers), the principle stays the same','besides the higher speed it also reliably encrypts all the BPDU messages being exchanged','it lets you have several root bridges at once in one and the same network'],
      correct:0, why:'RSTP doesn’t wait for timers; neighbors actively negotiate (proposal/agreement) and the port comes up within a second. It’s the standard today.' },
    { q:'What is <b>PortFast</b> for and where does it belong?',
      opts:['on an access port to an end device – it forwards immediately (no loop risk there)','it belongs only between two switches to make the link between them much faster','on the uplink port that leads up to the network’s edge router'],
      correct:0, why:'On an access port to a PC no loop can form, so there’s no point waiting. PortFast lets it forward at once. Between switches NEVER.' },
    { q:'What does <b>BPDU Guard</b> do when a BPDU arrives on a PortFast port?',
      opts:['it shuts the port down at once (err-disabled) – someone likely plugged in a switch','it starts forwarding the received BPDU on into the entire rest of the network at once','it immediately turns that port into the new root port of the topology'],
      correct:0, why:'A BPDU has no business on an access port. If one arrives, it means a foreign switch → BPDU Guard shuts the port to prevent a loop or root takeover.' }
  ]},
  c6q_l4:{ title:'Quiz: EtherChannel', qs:[
    { q:'What problem does <b>EtherChannel</b> solve compared to STP alone?',
      opts:['STP blocks the backup link (wasting capacity); EtherChannel uses all links at once','besides bundling the links, EtherChannel also reliably encrypts all the traffic passing between the switches','to bundle the links, EtherChannel removes and discards all the configured VLANs'],
      correct:0, why:'With STP one of two links lies idle. EtherChannel bundles them into one logical link – capacity adds up and nothing is blocked.' },
    { q:'How does STP see an <b>EtherChannel</b>?',
      opts:['as one logical link → nothing to block','as a classic loop, so it blocks it at once','it doesn’t see it at all because it’s completely hidden from it'],
      correct:0, why:'STP perceives the bundled cables as one port, so there’s no loop and nothing is blocked. Hence full capacity is used.' },
    { q:'What is <b>LACP</b> for?',
      opts:['switches use it to agree to bundle links; the bundle forms only on mutual agreement','it automatically assigns connected devices their IPs and default gateway on the bundled links','it reliably blocks incoming BPDU messages so they can’t break the freshly formed bundle'],
      correct:0, why:'LACP is safer than a static bundle: if only one side agrees, the bundle doesn’t form and there’s no loop from a mismatch.' },
    { q:'Does EtherChannel speed up <b>one big transfer</b> beyond a single link’s speed?',
      opts:['no – one flow uses one cable; the speed-up is in the sum of many connections','yes – for every single transfer it sums the speed of all the cables','no – EtherChannel doesn’t speed up passing traffic'],
      correct:0, why:'Load balancing splits CONNECTIONS by a hash, but one flow stays on one cable. The benefit is in the sum of many simultaneous connections.' }
  ]},
  c6q_l5:{ title:'Quiz: Trunks and synthesis', qs:[
    { q:'What is <b>VLAN pruning</b> on a trunk?',
      opts:['allowing only the VLANs the other side uses – less needless broadcast','the complete, irreversible deletion of all VLANs from that trunk link','speeding up the trunk by physically doubling the patch cable between the switches'],
      correct:0, why:'A trunk by default carries all VLANs. Pruning limits it to the needed ones, so needless broadcasts aren’t carried.' },
    { q:'Why is a <b>wrong native VLAN</b> on a trunk a security problem?',
      opts:['it enables VLAN hopping – double-tagging gets an attacker into a foreign VLAN','it markedly slows down the whole trunk link running between the two connected switches','it irreversibly wipes the switch’s entire learned MAC address table'],
      correct:0, why:'When the trunk’s native VLAN is left as VLAN 1 (the one the attacker sits in), the first switch strips the outer tag and double-tagging slips the attacker into a foreign VLAN. Hence use a dedicated unused native VLAN, not VLAN 1.' },
    { q:'What does a <b>resilient L2 network</b> from this course look like?',
      opts:['dual-homed access switches + EtherChannel + STP/RSTP = no single point of failure','one single very large and powerful switch that handles absolutely everything in the company network alone','a completely flat network with no split into VLANs at all and no backup links whatsoever'],
      correct:0, why:'Redundancy at every level: access switches link to two distribution switches joined by an EtherChannel, and STP/RSTP guards loops and switches over after a failure.' },
    { q:'Switch DIST-1 fails. What happens in a well-designed redundant network?',
      opts:['STP/RSTP switches traffic to the backup path via DIST-2 within a second – no outage','the whole network crashes at once over one single switch failing and stops working entirely','the admin must rewire the whole network to the backup path by hand as fast as possible'],
      correct:0, why:'Thanks to dual-homing and STP/RSTP, after DIST-1 fails the backup uplink unblocks and traffic flows via DIST-2. The user notices nothing.' }
  ]}
};
const COURSE_6_FINAL_EXTRA_DEF=[{ q:'You add a second cable between two switches for backup. What’s the risk without STP, and what solves it?', opts:['a broadcast storm in the loop – STP logically blocks one of the paths','the two links add up and all the traffic then runs twice as fast','the switch shuts one cable off by itself just to save energy'], correct:0, why:'The second cable forms a loop and a broadcast circles in it forever (a storm). STP finds the loop and blocks one port – the backup stays, but loop-free.' },{ q:'Who becomes the root bridge in STP, and what improves with RSTP?', opts:['the lowest bridge ID (priority+MAC); RSTP converges in ~1 s, not tens of seconds','a completely random switch is chosen and RSTP also reliably encrypts all the traffic','the one with the most ports wins and RSTP just adds more VLANs to the network'], correct:0, why:'The root is the switch with the lowest bridge ID (priority, then MAC). RSTP does what STP does, but neighbors negotiate instead of waiting on timers – converging in a second.' },{ q:'You bundle two parallel cables between switches into an EtherChannel. What does STP think, and what do you gain?', opts:['it sees one logical link – nothing to block, so you use both at once','it treats them together as a classic loop and so rather blocks both right away','because of the bundling it just stops working in the network entirely'], correct:0, why:'EtherChannel merges the cables into one logical link, so STP sees no loop and blocks nothing – both links carry traffic at once. Without it, STP would block one.' }];
__regCourse(6,COURSE_6_DEF,COURSE_6_QUIZZES_DEF,COURSE_6_FINAL_EXTRA_DEF);
