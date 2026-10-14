/* course2.js — Course 2 content (split out of course.js; loaded on demand via course-core.js) */
/* ============================================================
   LESSON 3 — OSI: the network map (examples the learner already knows; no protocols yet)
   ============================================================ */
// MOD 3.1 — Why layers (reuse postal analogy; spec's fixed intro)
function renderL3M1(){
  const rows=[
    {n:'Application',j:'write the letter (content)',c:'--lime'},
    {n:'Envelope & address',j:'wrap it, address it',c:'--violet'},
    {n:'Hand to the post office',j:'drop it off',c:'--green'},
    {n:'Transport',j:'vans, planes, roads',c:'--blue'}
  ];
  const RH=44,RW=300,RX=150,RY=56;
  let svg='<svg viewBox="0 0 640 '+(RY+rows.length*RH+18)+'" width="100%" style="display:block">';
  svg+='<text x="320" y="34" text-anchor="middle" style="font:700 11px var(--mono);fill:var(--cyan)">'+'EACH LAYER = ONE JOB'+'</text>';
  rows.forEach((r,i)=>{const y=RY+i*RH;
    svg+='<g id="l3m1-'+i+'"><rect x="'+RX+'" y="'+y+'" width="'+RW+'" height="'+(RH-8)+'" rx="8" style="fill:var('+r.c+');fill-opacity:.13;stroke:var('+r.c+');stroke-width:1.4"/>'
      +'<text x="'+(RX+14)+'" y="'+(y+16)+'" style="font:700 11px var(--sans);fill:var(--txt)">'+esc(r.n)+'</text>'
      +'<text x="'+(RX+14)+'" y="'+(y+30)+'" style="font:400 9.5px var(--sans);fill:var(--muted)">'+esc(r.j)+'</text>'
      +(i<rows.length-1?'<text x="'+(RX+RW+16)+'" y="'+(y+RH-2)+'" style="font:700 14px var(--mono);fill:var(--muted)">↕</text>':'')+'</g>';
  });
  svg+='</svg>';
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'At home your router is from one maker, your PC from another and your phone from a third – and they all understand each other without any trouble. How is that possible? They agreed on shared <b>rules</b> (called a <b>protocol</b>) and split the work into <b>layers</b> – each layer has <b>one job</b> and passes its result to the layer above and below. The postal system works the same way: you write a <b>letter</b>, put it in an <b>addressed envelope</b>, hand it to the <b>post office</b>, which uses <b>transport</b> (vans, planes). Each link does only its part and talks only to its neighbor. That is the point of layers: <b>each part does only its own job</b>. Your browser does not need to know whether you are on Wi-Fi or a cable – the lower layer handles that.'+'</p>'
    +'<div class="osi-stage">'+svg+'</div>'
    +'<div class="m1-cap" id="l3m1cap"></div>'+courseStepControls('l3m1')
    +abbrBox([['layer','one level of responsibility – it does one job and talks only to the neighboring layer.'],['protocol','the agreed rules for how layers and devices talk to each other.']]);
}
// MOD 3.2 — The 7 OSI layers (clickable ladder; examples only — protocols come in Lesson 5)
function renderL3M2(){
  const layers=[
    {n:7,name:'Application',ex:'your message, the browser, chat – what you actually see.',c:'--lime'},
    {n:6,name:'Presentation',ex:'the data format – how data is encoded (in practice the app handles it).',c:'--violet'},
    {n:5,name:'Session',ex:'keeping the conversation between two sides going (runs in the background).',c:'--violet'},
    {n:4,name:'Transport',ex:'splitting data into pieces and delivering them.',c:'--green'},
    {n:3,name:'Network',ex:'the IP address and the route between different networks (routing).',c:'--blue'},
    {n:2,name:'Data link',ex:'the MAC address and delivery within one local network.',c:'--amber'},
    {n:1,name:'Physical',ex:'the cable, the Wi-Fi signal and the bits themselves.',c:'--red'}
  ];
  const RX=110,RW=420,RY=18,RH=40,GAP=5;
  let svg='<svg id="osisvg" viewBox="0 0 640 '+(RY+layers.length*(RH+GAP)+4)+'" width="100%" style="display:block">';
  svg+='<g id="osihint"><text x="'+(RX+RW+10)+'" y="'+(RY+RH/2+4)+'" style="font:700 11px var(--mono);fill:var(--cyan)">'+'‹ click'+'<animate attributeName="opacity" values="1;0.25;1" dur="1.3s" repeatCount="indefinite"/></text></g>';
  layers.forEach((l,i)=>{const y=RY+i*(RH+GAP);
    svg+='<g class="osi-rung-c" data-n="'+l.n+'" data-ex="'+esc(l.ex)+'" style="cursor:pointer">'
      +'<rect x="'+RX+'" y="'+y+'" width="'+RW+'" height="'+RH+'" rx="8" style="fill:var('+l.c+');fill-opacity:.12;stroke:var('+l.c+');stroke-width:1.4"/>'
      +'<circle cx="'+(RX+20)+'" cy="'+(y+RH/2)+'" r="11" style="fill:var('+l.c+')"/>'
      +'<text x="'+(RX+20)+'" y="'+(y+RH/2+4)+'" text-anchor="middle" style="font:700 11px var(--mono);fill:var(--on-accent)">'+l.n+'</text>'
      +'<text x="'+(RX+40)+'" y="'+(y+RH/2+4)+'" style="font:700 12px var(--sans);fill:var(--txt)">'+esc(l.name)+'</text>'
      +'</g>';
  });
  svg+='</svg>';
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'The <b>ISO/OSI model</b> is a shared <b>map</b> of a network. It was drawn up by <b>ISO</b> – the International Organization for Standardization – as a common agreement so devices from different vendors understand each other and faults can be pinned down layer by layer (its ISO authorship is why it is called ISO/OSI). It splits communication into <b>7 named layers</b>, from the physical signal (1) up to the app you actually see (7). You have already met things that belong to some of these layers (MAC addresses, IP, cables and Wi-Fi) in the first course – now we give them names and place them. <b>Click any layer</b> to see an example. <i>In practice a simplified <b>TCP/IP</b> model with 4 layers is also used; ISO/OSI is just a better map for understanding. Why two models? <b>TCP/IP ran in practice first</b> (ARPANET, the 1970s); OSI came later as a standard, but the internet already ran on TCP/IP – so they never merged, and today OSI serves mainly as a teaching and diagnostic framework.</i>'+'</p>'
    +'<div class="osi-stage">'+svg+'</div>'
    +'<div class="m1-cap" id="osicap"><span>'+'Click a layer to see an example.'+'</span></div>'
    +abbrBox([['OSI','ISO’s reference model; splits a network into 7 layers.'],['L1–L7','layers 1 (physical) to 7 (application).'],['TCP/IP','the simplified 4-layer model the internet actually runs on (IP and TCP themselves are covered in other lessons).']])
    +'<p style="margin:12px 0 4px;font-size:13px;color:var(--muted)">'+'Each layer has its own name for the unit of data:'+'</p>'
    +abbrBox([['segment','L4 (transport) data unit – adds ports (and, for TCP, a sequence number).'],['packet','L3 (network) data unit – adds source and destination IP.'],['frame','L2 (data-link) data unit – adds MAC addresses and a checksum.']]);
}
function mountL3M2(){
  modalBox.querySelectorAll('.osi-rung-c').forEach(g=>g.onclick=()=>{
    var h=$('osihint');if(h)h.style.display='none';
    modalBox.querySelectorAll('.osi-rung-c rect').forEach(r=>r.setAttribute('opacity','0.55'));
    const rect=g.querySelector('rect');if(rect)rect.setAttribute('opacity','1');
    const n=g.getAttribute('data-n'),ex=g.getAttribute('data-ex');
    const c=$('osicap');if(c)c.innerHTML='<span><b>'+'Layer '+n+'</b> – '+esc(ex)+'</span>';
  });
}
/* ============================================================
   LESSON 5 — How devices understand each other (key protocols)
   ============================================================ */
// MOD 5.2 — TCP and UDP (clean purpose-built: 3-way handshake vs fire-and-forget; step-through, no play)
function renderL5M2(){
  const CX=90,SX=550,Y=66,WY=116;
  const box=(x,c,t)=>'<rect x="'+(x-46)+'" y="'+Y+'" width="92" height="40" rx="9" style="fill:var('+c+');fill-opacity:.14;stroke:var('+c+');stroke-width:1.5"/><text x="'+x+'" y="'+(Y+24)+'" text-anchor="middle" style="font:700 11px var(--sans);fill:var('+c+')">'+t+'</text>';
  const svg='<svg id="l5svg" viewBox="0 0 640 195" width="100%" style="display:block">'
    +'<line x1="'+(CX+46)+'" y1="'+WY+'" x2="'+(SX-46)+'" y2="'+WY+'" style="stroke:var(--line2);stroke-width:2;stroke-dasharray:5 5"/>'
    +box(CX,'--cyan','Client')+box(SX,'--violet','Server')
    +'<text id="l5bL" x="'+CX+'" y="'+(Y+58)+'" text-anchor="middle" style="font:700 9px var(--mono);fill:var(--muted)"></text>'
    +'<text id="l5bR" x="'+SX+'" y="'+(Y+58)+'" text-anchor="middle" style="font:700 9px var(--mono);fill:var(--muted)"></text>'
    +'<g id="l5pkt" class="crs-move" transform="translate('+CX+','+WY+')" opacity="0"><rect id="l5pktbox" x="-40" y="-13" width="80" height="26" rx="7" style="fill:var(--panel);stroke:var(--green);stroke-width:1.4;filter:drop-shadow(0 2px 6px rgba(0,0,0,.45))"/><text id="l5pktlab" x="0" y="4" text-anchor="middle" style="font:700 11px var(--mono);fill:var(--green)"></text></g></svg>';
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'You already met ports and TCP/UDP at a basic level in the <b>How networks work</b> course – here we go deeper. A device has one IP, but it runs many things at once – a browser, email, a game. To tell them apart there is the <b>port</b>: a service number (like an apartment number in a building). The server <b>listens</b> on a fixed, well-known number (web = 443, email…). For its own end the client uses <b>any free port</b> the system hands it – that is how the reply comes back to exactly this client. The second thing is <b>reliability</b> – and here there are two options. <b>TCP</b> is like registered mail: it agrees first (the <b>three-way handshake</b>) and resends what is lost. <b>UDP</b> is a postcard: it just fires the data and does not wait for confirmation – fast, but no guarantee. An app <b>deliberately picks</b> one based on what it needs (it is not random or alternating). Use the TCP/UDP toggle below to compare both step by step (‹ / ›).'+'</p>'
    +'<div class="m1-controls" style="margin:0 0 8px;justify-content:flex-start;flex-wrap:wrap;gap:10px"><span class="seg-group"><span class="seg-label" style="font:600 11px var(--mono);color:var(--muted)">'+'Protocol:'+'</span><span class="seg" id="l5seg"><button data-m="TCP" class="on">TCP</button><button data-m="UDP">UDP</button></span></span></div>'
    +'<div class="osi-stage" id="l5stage">'+svg+'</div>'
    +'<div class="m1-cap" id="l5cap"></div>'
    +courseStepControls('l5')
    +'<p style="color:var(--muted);font-size:11px;line-height:1.5;margin:8px 0 0">'+'Common ports: web HTTPS <b>443</b>, older web HTTP <b>80</b>, DNS <b>53</b>, SSH <b>22</b>.'+'</p>'
    +abbrBox([['port','a number (0–65535) that tells apps apart on one device – like an apartment number.'],['TCP','the reliable protocol: it opens a connection and resends lost pieces.'],['UDP','the fast protocol with no guarantee: send and do not wait for confirmation.'],['three-way handshake','TCP’s three-step agreement before transfer: SYN → SYN-ACK → ACK. It is a ONE-OFF transport agreement about a single connection — the longer-lived application "conversation" (session) is handled up at L5.'],['SYN / ACK','SYN = a request to connect, ACK = an acknowledgment.']]);
}
function mountL5M2(){
  const tcp=[
    {dir:'R',lab:'SYN',bL:'opening…',bR:'waiting',cap:'<b>Step 1 – SYN.</b> The client says: I’m starting, my number is <b>x</b>. It sends a connection request <b>SYN</b> with its sequence number <b>seq=x</b>.'},
    {dir:'L',lab:'SYN-ACK',bL:'opening…',bR:'agrees',cap:'<b>Step 2 – SYN-ACK.</b> The server <b>acknowledges x</b> AND at the same time sends its own number <b>y</b> — that is why it can’t shrink to two steps: each side must both send its number and get it acknowledged.'},
    {dir:'R',lab:'ACK',bL:'CONNECTED',bR:'CONNECTED',cap:'<b>Step 3 – ACK.</b> The client acknowledges <b>y</b>. Now both sides know the other is really there and listening → <b>connection established</b>. Both sequence numbers are synchronized in both directions; two steps would leave one side unconfirmed.'},
    {dir:'R',lab:'data',bL:'CONNECTED',bR:'CONNECTED',cap:'Only now does the <b>content</b> flow over the open connection.'},
    {dir:'L',lab:'got it',bL:'CONNECTED',bR:'CONNECTED',cap:'The server <b>acknowledges</b> receipt. If something is lost, TCP notices and resends it – that is why it is <b>reliable</b>.'}
  ];
  const udp=[
    {dir:'R',lab:'#1',cap:'<b>UDP doesn’t negotiate.</b> It just fires datagram <b>#1</b>.'},
    {dir:'R',lab:'#2',cap:'Datagram <b>#2</b> flies right after – no waiting, no acknowledgment.'},
    {dir:'R',lab:'#3',cap:'Datagram <b>#3</b>. If one is lost, nobody minds – but it is <b>fast</b> (video, games, calls).'}
  ];
  let mode='TCP',idx=0;
  const CX=90,SX=550,WY=116;
  const steps=()=>mode==='TCP'?tcp:udp;
  function glide(S,col){const g=$('l5pkt'),box=$('l5pktbox'),lab=$('l5pktlab');if(!g||!box||!lab)return;
    const arrow=S.dir==='R'?'→':'←',w=Math.max(48,(arrow+' '+S.lab).length*8+18);
    box.setAttribute('x',-w/2);box.setAttribute('width',w);box.style.stroke='var('+col+')';
    lab.style.fill='var('+col+')';lab.textContent=arrow+' '+S.lab;
    const fromX=S.dir==='R'?CX:SX, toX=S.dir==='R'?SX:CX;
    g.style.opacity='1';g.style.transition='none';g.setAttribute('transform','translate('+fromX+','+WY+')');
    void g.getBoundingClientRect();
    g.style.transition='';g.setAttribute('transform','translate('+toX+','+WY+')');}
  function show(i){const S=steps()[i],col=mode==='TCP'?'--green':'--cyan';
    glide(S,col);
    const bL=$('l5bL'),bR=$('l5bR');
    if(bL)bL.textContent=S.bL||(mode==='UDP'?'stateless':'');
    if(bR)bR.textContent=S.bR||(mode==='UDP'?'stateless':'');
    const c=$('l5cap');if(c)c.innerHTML='<span>'+S.cap+'</span>';
    const cnt=$('l5count');if(cnt)cnt.textContent=(i+1)+' / '+steps().length;
    const pb=$('l5prev');if(pb)pb.disabled=i===0;const nb=$('l5next');if(nb)nb.disabled=i===steps().length-1;}
  function go(d){idx=Math.max(0,Math.min(steps().length-1,idx+d));show(idx);}
  const pb=$('l5prev');if(pb)pb.onclick=()=>go(-1);
  const nb=$('l5next');if(nb)nb.onclick=()=>go(1);
  $('l5seg').querySelectorAll('button').forEach(b=>b.onclick=()=>{mode=b.getAttribute('data-m');idx=0;$('l5seg').querySelectorAll('button').forEach(x=>x.classList.toggle('on',x.getAttribute('data-m')===mode));show(0);});
  show(0);
}
/* ============================================================
   LESSON 6 — The whole journey together (encapsulation, subnetting, recap)
   ============================================================ */
// MOD 6.1 — Enkapsulace (reuse the down/up envelope-in-envelope animation; build()->{html,mount}, no play)
function buildL6M1(){
  const msg='hello';
  const layers=[
    {n:7,c:'--lime',name:'Application',hdr:'HTTP GET',pdu:'data',add:'application data (HTTP request)',read:'hands the clean message to the app'},
    {n:6,c:'--violet',name:'Presentation',hdr:'TLS',pdu:'data',add:'encrypts and normalizes format (TLS)',read:'decrypts into a readable form'},
    {n:5,c:'--cyan',name:'Session',hdr:'session',pdu:'data',add:'tags which session it belongs to',read:'matches it to the right session'},
    {n:4,c:'--green',name:'Transport',hdr:'TCP 50001->443 seq=1',pdu:'segment',add:'adds ports and a sequence number (TCP)',read:'reorders and acknowledges (ACK)'},
    {n:3,c:'--blue',name:'Network',hdr:'IP 10.0.0.5 -> 198.51.100.1',pdu:'packet',add:'adds source and destination IP',read:'checks the IP is for it'},
    {n:2,c:'--amber',name:'Data Link',hdr:'MAC AA:.. -> BB:.. + FCS',pdu:'frame',add:'adds MAC addresses and a checksum',read:'verifies the checksum (FCS) and MAC'},
    {n:1,c:'--red',name:'Physical',hdr:'bits',pdu:'bits',add:'encodes everything into a signal (bits)',read:'reads the signal back into bits'}
  ];
  const byN={};layers.forEach(l=>byN[l.n]=l);
  const col=n=>'var('+byN[n].c+')';
  const BX=14,BW=232,BX2=374,BY0=44,BH=30,BSTEP=34;
  const bandY=n=>BY0+(7-n)*BSTEP, bandCY=n=>bandY(n)+BH/2;
  const cxL=BX+BW/2, cxR=BX2+BW/2, wireY=bandCY(1), SVH=bandY(1)+BH+38;
  let idx=0;
  function band(side,l){const x=side==='L'?BX:BX2,y=bandY(l.n);
    return '<g id="m10-'+side+'-'+l.n+'" class="osi-rung" opacity="0.4">'
      +'<rect x="'+x+'" y="'+y+'" width="'+BW+'" height="'+BH+'" rx="7" style="fill:'+col(l.n)+';fill-opacity:.12;stroke:'+col(l.n)+';stroke-width:1.3"/>'
      +'<circle cx="'+(x+16)+'" cy="'+(y+BH/2)+'" r="9.5" style="fill:'+col(l.n)+'"/>'
      +'<text x="'+(x+16)+'" y="'+(y+BH/2+3.5)+'" text-anchor="middle" style="font:700 10px var(--mono);fill:var(--on-accent)">'+l.n+'</text>'
      +'<text x="'+(x+32)+'" y="'+(y+BH/2+4)+'" style="font:700 11.5px var(--sans);fill:var(--txt)">'+esc(l.name)+'</text>'
      +'<text x="'+(x+BW-8)+'" y="'+(y+BH/2+3.5)+'" text-anchor="end" style="font:600 9px var(--mono);fill:'+col(l.n)+'">'+esc(l.pdu)+'</text></g>';}
  function peerLines(){let s='';layers.forEach(l=>{if(l.n===1)return;const y=bandCY(l.n);
    s+='<line x1="'+(BX+BW)+'" y1="'+y+'" x2="'+BX2+'" y2="'+y+'" style="stroke:'+col(l.n)+';stroke-width:1;stroke-dasharray:2 5;opacity:.28"/>';});return s;}
  function mediumGfx(){const y=wireY;
    return '<line x1="'+(BX+BW)+'" y1="'+y+'" x2="'+BX2+'" y2="'+y+'" style="stroke:var(--red);stroke-width:3"/>';}
  function svgStr(){return '<svg id="m10svg" viewBox="0 0 620 '+SVH+'" width="100%" style="display:block">'
    +'<text x="'+cxL+'" y="18" text-anchor="middle" style="font:700 10.5px var(--mono);fill:var(--cyan)">'+'SENDER ↓ encapsulation'+'</text>'
    +'<text x="'+cxR+'" y="18" text-anchor="middle" style="font:700 10.5px var(--mono);fill:var(--cyan)">'+'RECEIVER ↑ decapsulation'+'</text>'
    +peerLines()+layers.map(l=>band('L',l)).join('')+layers.map(l=>band('R',l)).join('')+mediumGfx()
    +'<text x="310" y="'+(wireY+19)+'" text-anchor="middle" style="font:600 9px var(--mono);fill:var(--muted)">'+'medium (wire/wireless)'+'</text>'
    +'<g id="m10pkt" class="crs-move"></g></svg>';}
  function capDown(n){return ('Layer '+n+' – '+byN[n].name+': '+byN[n].add+'. It wraps a header ['+byN[n].hdr+'].');}
  function capUp(n){return ('Layer '+n+' – '+byN[n].name+': reads and peels off its header – '+byN[n].read+'.');}
  const STEPS=[];
  STEPS.push({side:'L',n:7,h:[],pdu:'data',cap:('Layer 7 – Application: your message "'+msg+'" enters the stack as plain data.')});
  STEPS.push({side:'L',n:6,h:[6],pdu:'data',cap:capDown(6)});
  STEPS.push({side:'L',n:5,h:[6,5],pdu:'data',cap:capDown(5)});
  STEPS.push({side:'L',n:4,h:[6,5,4],pdu:'segment',cap:capDown(4)});
  STEPS.push({side:'L',n:3,h:[6,5,4,3],pdu:'packet',cap:capDown(3)});
  STEPS.push({side:'L',n:2,h:[6,5,4,3,2],pdu:'frame',cap:capDown(2)});
  STEPS.push({side:'L',n:1,bits:true,h:[6,5,4,3,2],pdu:'bits',cap:'Layer 1 – Physical: the whole "envelope of envelopes" is encoded into bits and sent over the medium (wire/wireless).'});
  STEPS.push({side:'X',n:1,bits:true,h:[6,5,4,3,2],pdu:'bits',cross:true,cap:'The bits fly across the medium (wire/wireless) to the receiver. Here the link is direct, so nothing reads them in transit – just a signal. Had a router stood between them, it would peel the frame back to Layer 3 (see the text above the animation).'});
  STEPS.push({side:'R',n:1,bits:true,h:[6,5,4,3,2],pdu:'bits',cap:'Layer 1 – Physical: the receiver reads the signal back into bits. Now the way up.'});
  STEPS.push({side:'R',n:2,h:[6,5,4,3],pdu:'packet',peeled:2,cap:capUp(2)});
  STEPS.push({side:'R',n:3,h:[6,5,4],pdu:'segment',peeled:3,cap:capUp(3)});
  STEPS.push({side:'R',n:4,h:[6,5],pdu:'data',peeled:4,cap:capUp(4)});
  STEPS.push({side:'R',n:5,h:[6],pdu:'data',peeled:5,cap:capUp(5)});
  STEPS.push({side:'R',n:6,h:[],pdu:'data',peeled:6,cap:capUp(6)});
  STEPS.push({side:'R',n:7,h:[],pdu:'data',cap:('Layer 7 – Application: the receiver sees a clean "'+msg+'". Each layer talked to its peer. Done!')});
  const pduLabel=k=>({data:'data',segment:'segment',packet:'packet',frame:'frame',bits:'bits'}[k]);
  function render(){
    const s=STEPS[idx],sv=$('m10svg');if(!sv)return;
    sv.querySelectorAll('.osi-rung').forEach(r=>r.setAttribute('opacity','0.4'));
    if(s.side!=='X'){const a=document.getElementById('m10-'+s.side+'-'+s.n);if(a)a.setAttribute('opacity','1');}
    else{const a=document.getElementById('m10-L-1');if(a)a.setAttribute('opacity','1');const b=document.getElementById('m10-R-1');if(b)b.setAttribute('opacity','1');}
    let cx,cy;if(s.side==='X'){cx=310;cy=wireY;}else{cx=310;cy=bandCY(s.n);}
    const hs=(s.h||[]);const stripeW=12,stripeGap=2,dotR=6;let inner='';
    if(s.side!=='X'){const _edge=s.side==='L'?-64:64,_dir=s.side==='L'?-1:1,_cc=col(s.n);
      inner+='<line x1="0" y1="0" x2="'+_edge+'" y2="0" style="stroke:'+_cc+';stroke-width:2"/><path d="M'+_edge+' 0 L'+(_edge-_dir*7)+' -4.5 L'+(_edge-_dir*7)+' 4.5 Z" style="fill:'+_cc+'"/>';}
    if(s.bits){inner+='<circle class="simpacket" cx="0" cy="0" r="'+dotR+'" style="fill:var(--cyan);color:var(--cyan)"/><text x="0" y="-13" text-anchor="middle" style="font:700 9px var(--mono);fill:var(--cyan)">10110</text>';}
    else{const coreTxt=esc(msg);const coreW=dotR*2+6+coreTxt.length*7.2+6;const hdrSlots=hs.length;const pad=8;const cardW=pad+hdrSlots*(stripeW+stripeGap)+coreW+pad;const cardH=24;let x=-cardW/2;
      inner+='<rect x="'+x+'" y="'+(-cardH/2)+'" width="'+cardW+'" height="'+cardH+'" rx="7" style="fill:var(--panel);stroke:var(--cyan);stroke-width:1.3;filter:drop-shadow(0 2px 7px rgba(0,0,0,.5))"/>';x+=pad;
      const ordered=hs.slice().sort((a,b)=>a-b);
      ordered.forEach(n=>{inner+='<rect x="'+x+'" y="-9" width="'+stripeW+'" height="18" rx="2.5" style="fill:'+col(n)+'"/><text x="'+(x+stripeW/2)+'" y="3.5" text-anchor="middle" style="font:700 8px var(--mono);fill:var(--on-accent)">'+n+'</text>';x+=stripeW+stripeGap;});
      inner+='<circle class="simpacket" cx="'+(x+dotR)+'" cy="0" r="'+dotR+'" style="fill:var(--cyan);color:var(--cyan)"/><text x="'+(x+dotR*2+6)+'" y="4" style="font:700 11.5px var(--sans);fill:var(--txt)">'+coreTxt+'</text>';}
    if(s.peeled){inner+='<g transform="translate(0,-22)"><rect x="-46" y="-9" width="92" height="17" rx="8" style="fill:var(--accent-bg);stroke:'+col(s.peeled)+';stroke-width:1"/><text x="0" y="3" text-anchor="middle" style="font:700 8.5px var(--mono);fill:'+col(s.peeled)+'">'+esc(('✓ read by L'+s.peeled))+'</text></g>';}
    const g=$('m10pkt');g.innerHTML=inner;g.style.transform='translate('+cx+'px,'+cy+'px)';
    $('m10cap').textContent=s.cap;
    const pn=pduLabel(s.pdu);$('m10pdu').innerHTML='<span style="color:var(--muted)">'+'unit:'+'</span> <b style="color:var(--cyan)">'+esc(pn)+'</b>';
    $('m10count').textContent=(idx+1)+' / '+STEPS.length;$('m10prev').disabled=idx===0;$('m10next').disabled=idx===STEPS.length-1;
  }
  function go(d){idx=Math.max(0,Math.min(STEPS.length-1,idx+d));render();}
  const html='<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.5;margin:0 0 10px">'+('The grand finale – now it all comes together. The message "'+msg+'" travels down all 7 layers and each wraps <b>its own header</b> (like an <b>envelope inside an envelope</b>). At the bottom it collapses to bits, flies across the medium to the receiver, then <b>climbs back up</b> – each layer reads and peels its header until a clean message is left. That is <b>encapsulation</b>. (In the animation below the sender and receiver are connected <b>directly</b>. If a router sat between them, it would peel the frame back to Layer 3, read the destination IP, and build a new frame for the next hop – the upper layers would stay untouched.) Watch the unit name on the right change too (data → segment → packet → frame → bits).')+'</p>'
    +'<div class="m1-controls" style="margin:0 0 8px;justify-content:flex-end"><span id="m10pdu" style="font:600 11px var(--mono)"></span></div>'
    +'<div class="osi-stage" id="m10stage">'+svgStr()+'</div>'
    +'<div class="m1-cap" id="m10cap"></div>'
    +courseStepControls('m10')
    +abbrBox([['encapsulation','encapsulation – each layer wraps its own header around the data from the layer above (an envelope in an envelope).'],['header','the label a layer adds; the counterpart on the other side reads and peels it off.'],['PDU','the name of the "bundle" at each layer: data → segment (L4) → packet (L3) → frame (L2) → bits (L1).'],['FCS','the frame’s checksum – verifies the frame was not corrupted in transit.']])
    +'<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:10px 0 0">'+'And that wraps up the ISO/OSI course. You can now read a network layer by layer: you know what L1–L7 do, what hubs, switches and routers are for, how transport works (TCP/UDP), where the firewall fits and how encapsulation holds it all together. In <b>the Switching and VLANs course</b> we return to Layer 2 in practice: you’ll learn to split a network with <b>VLANs</b> and switches – the foundation of every real company network.'+'</p>';
  function mount(){
    const pb=$('m10prev');if(pb)pb.onclick=()=>go(-1);
    const nb=$('m10next');if(nb)nb.onclick=()=>go(1);
    render();
  }
  return {html,mount};
}
// MOD 6.2 — Subnetting (reuse the interactive bit-ruler; build()->{html,mount})
function buildL6M2(){
  let oct=[192,168,1,10],pfx=24;
  const X0=36,CW=16,GAP=14;
  const ipInt=()=>(((oct[0]<<24)|(oct[1]<<16)|(oct[2]<<8)|oct[3])>>>0);
  const dotted=n=>[(n>>>24)&255,(n>>>16)&255,(n>>>8)&255,n&255].join('.');
  function calc(){const ii=ipInt(),mask=pfx===0?0:((0xFFFFFFFF<<(32-pfx))>>>0),net=(ii&mask)>>>0,bc=(net|((~mask)>>>0))>>>0;let hosts,first,last;
    if(pfx<=30){hosts=Math.pow(2,32-pfx)-2;first=(net+1)>>>0;last=(bc-1)>>>0;}else if(pfx===31){hosts=2;first=net;last=bc;}else{hosts=1;first=net;last=net;}
    return {ii,mask,net,bc,hosts,first,last};}
  function ruler(){const c=calc();let s='';
    for(let g=0;g<4;g++){const gx=X0+g*(8*CW+GAP);
      for(let j=0;j<8;j++){const i=g*8+j,x=gx+j*CW,bit=(c.ii>>>(31-i))&1,isNet=i<pfx,col=isNet?'--blue':'--green';
        s+='<rect x="'+x+'" y="40" width="'+(CW-2)+'" height="22" rx="2" style="fill:var('+col+');fill-opacity:.16;stroke:var('+col+');stroke-width:1"/><text x="'+(x+(CW-2)/2)+'" y="55" text-anchor="middle" style="font:700 10px var(--mono);fill:var('+col+')">'+bit+'</text>';}
      s+='<text x="'+(gx+4*CW-1)+'" y="80" text-anchor="middle" style="font:700 13px var(--mono);fill:var(--txt)">'+oct[g]+'</text>';
      if(g<3)s+='<text x="'+(gx+8*CW+GAP/2-2)+'" y="55" text-anchor="middle" style="font:700 12px var(--mono);fill:var(--muted)">.</text>';}
    const gN=Math.floor(pfx/8),jN=pfx%8,dx=X0+gN*(8*CW+GAP)+jN*CW-1;
    if(pfx<32)s+='<line x1="'+dx+'" y1="34" x2="'+dx+'" y2="86" style="stroke:var(--amber);stroke-width:2.5"/><text x="'+dx+'" y="30" text-anchor="middle" style="font:700 9px var(--mono);fill:var(--amber)">/'+pfx+'</text>';
    s+='<text x="'+X0+'" y="20" style="font:700 10px var(--mono);fill:var(--blue)">'+'NETWORK'+'</text>';
    s+='<text x="584" y="20" text-anchor="end" style="font:700 10px var(--mono);fill:var(--green)">HOST</text>';
    return '<svg id="m12svg" viewBox="0 0 620 92" width="100%" style="display:block">'+s+'</svg>';}
  function resHtml(){const c=calc();
    const row=(k,v,col)=>'<div style="display:flex;justify-content:space-between;gap:8px;padding:6px 10px;border:1px solid var(--line);border-radius:8px;background:var(--panel2);margin-bottom:6px"><span style="color:var(--muted);font-size:12px">'+k+'</span><b style="font-family:var(--mono);font-size:var(--crs-fs,13.5px);color:'+(col||'var(--txt)')+'">'+v+'</b></div>';
    return row('Subnet mask',dotted(c.mask)+' (/'+pfx+')')+row('Network address',dotted(c.net),'var(--blue)')+row('Broadcast',dotted(c.bc),'var(--amber)')+row('Usable range',dotted(c.first)+' – '+dotted(c.last),'var(--green)')+row('Usable hosts',c.hosts.toLocaleString('en-US'));}
  function cap(){const c=calc();return ('A /'+pfx+' prefix splits the IP into two parts: the NETWORK (blue, first '+pfx+' bits = the "which street" part) and HOSTS (green, the other '+(32-pfx)+' bits = the "house number"). Two addresses are reserved – the first '+dotted(c.net)+' (the network itself) and the last '+dotted(c.bc)+' (broadcast = an announcement to all) – so you can really use '+c.hosts.toLocaleString('en-US')+' devices.');}
  function redraw(){$('m12stage').innerHTML=ruler();$('m12res').innerHTML=resHtml();$('m12cap').textContent=cap();const pv=$('m12pfxval');if(pv)pv.textContent='/'+pfx;}
  const html='<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'In this lesson you saw how a router moves traffic between networks by IP. Now we look at how you split such a network into smaller parts. <b>Why split a network into smaller subnets?</b> To separate groups of devices (departments, guests, servers), cut down broadcast traffic and make it easier to manage and secure. The tool for it is how an address splits into a network and a host part. Remember the postal address from the first course? Every <b>IP address</b> has two parts: the <b>NETWORK</b> (like the city – shared by a whole group of devices) and the <b>HOST</b> (like the house number – one specific device in that network). But how do you tell where one part ends and the other begins? That is what the <b>prefix</b> is for (written e.g. /24). It is not another part of the address – it is just a <b>marker of how many leading bits belong to the network</b> (and reading an address in bits you already know from the previous page); all the rest belong to hosts. The exact same thing written differently is the <b>mask</b> (e.g. /24 = 255.255.255.0). Two addresses are never given to a device: the <b>first</b> is the name of the whole network and the <b>last</b> is the <b>broadcast</b> – a single message "to everyone in this network" at once. Drag the prefix and change the IP, and watch the network address, the broadcast, and how many devices fit.'+'</p>'
    +'<div class="m1-controls" style="justify-content:flex-start;flex-wrap:wrap;gap:8px;margin:0 0 10px"><span style="font:600 11px var(--mono);color:var(--muted)">IP:</span>'
      +[0,1,2,3].map(i=>'<input class="m12oct" data-o="'+i+'" type="number" min="0" max="255" value="'+oct[i]+'" style="width:56px;text-align:center">').join('<span style="color:var(--muted)">.</span>')
      +'<span style="font:600 11px var(--mono);color:var(--muted);margin-left:10px">'+'Prefix'+':</span><input id="m12pfx" type="range" min="8" max="30" value="'+pfx+'" style="width:150px"><span id="m12pfxval" style="font:700 13px var(--mono);color:var(--cyan);min-width:34px">/'+pfx+'</span></div>'
    +'<div class="osi-stage" id="m12stage">'+ruler()+'</div>'
    +'<div id="m12res" style="margin-top:10px">'+resHtml()+'</div>'
    +'<div class="m1-cap" id="m12cap"></div>'
    +abbrBox([['IP','a device’s address in a network; it has a NETWORK part and a HOST part.'],['prefix','the number after the slash (e.g. /24) – how many leading bits of the address belong to the network; the rest to hosts.'],['mask','another way to write the same prefix (e.g. /24 = 255.255.255.0).'],['network / host','NETWORK = the shared part of the address for a group; HOST = the part that picks one specific device.'],['broadcast','the last address of a network – "to everyone in this network"; never assigned to a device.'],['subnet','a subnet – a smaller network you carve out by moving the prefix (more network bits = more, smaller networks).']]);
  function mount(){
    modalBox.querySelectorAll('.m12oct').forEach(inp=>inp.oninput=()=>{let v=parseInt(inp.value,10);if(isNaN(v))v=0;v=Math.max(0,Math.min(255,v));oct[+inp.getAttribute('data-o')]=v;redraw();});
    $('m12pfx').oninput=e=>{pfx=+e.target.value;redraw();};
    redraw();
  }
  return {html,mount};
}
// c2l4m5 — Bits and numbers: how eight bits make a decimal number 0–255 (place values 128…1)
function buildC2Bits(){
  const WT=[128,64,32,16,8,4,2,1];
  const B2D=[{oct:'11000000',dec:192},{oct:'10101000',dec:168}];
  function b2dSvg(exi,lit,cur){const ex=B2D[exi],bits=ex.oct.split('').map(Number),X0=54,CW=56,STEP=66;
    let s='<text x="310" y="16" text-anchor="middle" style="font:700 10px var(--mono);fill:var(--cyan)">'+esc('OCTET → NUMBER')+'</text>';
    for(let j=0;j<8;j++){const x=X0+j*STEP,cx=x+CW/2,on=bits[j]===1,summed=lit.indexOf(j)>=0,isCur=cur===j;
      const digCol=summed?'--green':(on?'--txt':'--muted'),fo=summed?'.30':'.10',stroke=isCur?'--amber':(summed?'--green':'--line2'),sw=isCur?2.6:1.2;
      s+='<rect x="'+x+'" y="42" width="'+CW+'" height="34" rx="6" style="fill:var('+(summed?'--green':'--panel2')+');fill-opacity:'+fo+';stroke:var('+stroke+');stroke-width:'+sw+'"/>';
      s+='<text x="'+cx+'" y="34" text-anchor="middle" style="font:700 10px var(--mono);fill:var('+(summed?'--green':'--muted')+')">'+WT[j]+'</text>';
      s+='<text x="'+cx+'" y="65" text-anchor="middle" style="font:700 15px var(--mono);fill:var('+digCol+')">'+bits[j]+'</text>';}
    const sub=lit.reduce((a,j)=>a+WT[j],0);
    const expr=lit.length?lit.slice().sort((a,b)=>a-b).map(j=>WT[j]).join(' + ')+' = '+sub:'pick the bits that are 1';
    s+='<text x="310" y="102" text-anchor="middle" style="font:700 13px var(--mono);fill:var(--green)">'+esc(expr)+'</text>';
    return '<svg id="b2dsvg" viewBox="0 0 620 116" width="100%" style="display:block">'+s+'</svg>';}
  const B2DSTEPS=[
    {ex:0,lit:[],cur:null,cap:'Octet <b>11000000</b>: above each bit is its <b>weight</b> (from the left 128, 64, 32, …, 1). We add only the bits that are <b>1</b>.'},
    {ex:0,lit:[0],cur:0,cap:'The first bit is <b>1</b> → add its weight <b>128</b>. Subtotal: <b>128</b>.'},
    {ex:0,lit:[0,1],cur:1,cap:'The second bit is <b>1</b> → add <b>64</b>. 128 + 64 = <b>192</b>. The rest are zeros and add nothing. So <b>11000000 = 192</b>.'},
    {ex:1,lit:[],cur:null,cap:'A second example — octet <b>10101000</b>. Exactly the same method.'},
    {ex:1,lit:[0],cur:0,cap:'The bit worth <b>128</b> is 1 → <b>128</b>.'},
    {ex:1,lit:[0,2],cur:2,cap:'The bit worth <b>32</b> is 1 → 128 + 32 = <b>160</b>.'},
    {ex:1,lit:[0,2,4],cur:4,cap:'The bit worth <b>8</b> is 1 → 160 + 8 = <b>168</b>. So <b>10101000 = 168</b>. This is exactly how eight bits (one octet) become a decimal number <b>0–255</b>.'}
  ];
  function b2dShow(i){const st=B2DSTEPS[i],stg=$('b2dstage');if(stg)stg.innerHTML=b2dSvg(st.ex,st.lit,st.cur);const c=$('b2dcap');if(c)c.innerHTML='<span>'+st.cap+'</span>';}
  const html='<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 12px">'+'Before we split a network into smaller subnets, we need to understand what an <b>IP address</b> is made of. Under the hood it’s just <b>bits</b> (0 and 1). How do eight ones and zeros become a number like <b>192</b>? An address is shown in <b>octets</b> (groups of 8 bits), e.g. 192.168.1.10. Each bit in an octet has a fixed <b>weight</b> – from the left 128, 64, 32, 16, 8, 4, 2, 1. The number is then simply the <b>sum of the weights of the bits that are 1</b>. Step through it (‹ / ›) – the next module builds subnetting on top of this.'+'</p>'
    +'<div class="osi-stage" id="b2dstage">'+b2dSvg(0,[],null)+'</div>'
    +'<div class="m1-cap" id="b2dcap"></div>'
    +abbrBox([['bit','the smallest unit – a 0 or a 1.'],['octet','a group of 8 bits; an IPv4 address has 4 octets (four numbers 0–255).'],['place value','a bit\'s value by its position – from the left 128, 64, 32, 16, 8, 4, 2, 1.']])
    +courseStepControls('b2d');
  function mount(){courseStepper('b2d',B2DSTEPS.length,b2dShow);}
  return {html,mount};
}
function mountL3M1(){courseRevealMount('l3m1',[
  '<b>Application</b>: you write the letter – the content you want to send.',
  '<b>Envelope & address</b>: you wrap the letter and write who it is for.',
  '<b>Hand to the post office</b>: you drop it off – the post handles delivery.',
  '<b>Transport</b>: vans and planes physically move it. Each layer does only its own part.']);}
/* ============================================================
   Navigation + dispatcher (override the legacy index.html course)
   ============================================================ */

/* ============================================================
   COURSE 2 — data (ISO/OSI and TCP/IP layers)
   ============================================================ */
const COURSE_2_DEF = {
  id:'course2',
title:'ISO/OSI and TCP/IP: the network map',
  blurb:'Name every layer and device. Walk the network layer by layer (L1–L7), add the TCP/IP model, cross-layer firewalling, and encapsulation.',
  lessons:[
    { id:'c2l1', title:'Why layers', taskId:null, quizId:'c2q_l1', modules:[
      { id:'c2l1m1', title:'Devices from different vendors understand each other', render:renderC2VendorInterop },
      { id:'c2l1m2', title:'The layered model: each part does one job', render:renderL3M1, mount:mountL3M1 },
      { id:'c2l1m3', title:'OSI and TCP/IP: two maps of one network', render:renderL3M2, mount:mountL3M2 }
    ]},
    { id:'c2l2', title:'L1: the physical layer', taskId:'qos-voice', quizId:'c2q_l2', modules:[
      { id:'c2l2m1', title:'What L1 does: signal, medium, bits', render:renderC2L1, mount:mountC2L1 },
      { id:'c2l2m2', title:'Interference: when noise talks into the signal', render:renderC2Noise, mount:mountC2Noise },
      { id:'c2l2m3', title:'Bandwidth, throughput, latency', render:renderC2Bandwidth }
    ]},
    { id:'c2l3', title:'L2: the data-link layer', taskId:'hub-vs-switch', quizId:'c2q_l3', modules:[
      { id:'c2l3m1', title:'What L2 does: frames and local delivery', render:renderC2L2Frame },
      { id:'c2l3m2', title:'Hub: sends to everyone — why that is not enough', render:renderC2Hub, mount:mountC2Hub },
      { id:'c2l3m3', title:'Switch and the MAC table', render:renderC2Switch, mount:mountC2Switch },
      { id:'c2l3m4', title:'WAP: the wireless access point at L2', render:renderC2Wap }
    ]},
    { id:'c2l4', title:'L3: the network layer', taskId:'subnet-lab', quizId:'c2q_l4', modules:[
      { id:'c2l4m1', title:'What L3 does: routing between networks', render:renderC2L3Routing },
      { id:'c2l4m2', title:'Router and the routing table', render:renderC2Router, mount:mountC2Router },
      { id:'c2l4m3', title:'NAT in practice: one address for the whole network', render:renderC2Nat, mount:mountC2Nat },
      { id:'c2l4m4', title:'L3 switch: when a switch can route', render:renderC2L3Switch },
      { id:'c2l4m5', title:'Bits and numbers: how 8 bits become 0–255', build:buildC2Bits },
      { id:'c2l4m6', title:'Subnetting: how to split a network', build:buildL6M2 }
    ]},
    { id:'c2l5', title:'L4: the transport layer', taskId:'port-test', quizId:'c2q_l5', modules:[
      { id:'c2l5m1', title:'What L4 does: end-to-end delivery', render:renderC2L4 },
      { id:'c2l5m2', title:'TCP in depth: handshake and acknowledgments', render:renderL5M2, mount:mountL5M2 },
      { id:'c2l5m3', title:'UDP: when speed beats reliability', render:renderC2Udp }
    ]},
    // L5+L6 have their own short lesson (the id is not sequential — the position in the array determines the order, between the L4 transport and the application/TCP-IP lesson)
    { id:'c2lsp', title:'L5 and L6: session and presentation', taskId:null, quizId:'c2q_lsp', modules:[
      { id:'c2lspm1', title:'L5 session: set up and keep the connection', render:renderC2Session },
      { id:'c2lspm2', title:'L6 presentation: the form of the data (encoding, encryption)', render:renderC2Present }
    ]},
    { id:'c2l6', title:'The application layer and the TCP/IP model', taskId:null, quizId:'c2q_l6', modules:[
      { id:'c2l6m1', title:'TCP/IP model: 4 layers in practice', render:renderC2TcpIp },
      { id:'c2l6m2', title:'Application layer: where DNS, HTTP and TLS live', render:renderC2AppLayer },
      { id:'c2l6m3', title:'How to read documentation and certifications', render:renderC2Docs }
    ]},
    { id:'c2l7', title:'Firewall: a device across multiple layers', taskId:'web-dmz', quizId:'c2q_l7', modules:[
      { id:'c2l7m1', title:'Why a firewall does not fit in one layer', render:renderC2FwLayers },
      { id:'c2l7m2', title:'Packet filter and stateful firewall', render:renderC2FwStateful, mount:mountC2FwStateful },
      { id:'c2l7m3', title:'Zones: inside, outside, DMZ', render:renderC2Zones }
    ]},
    { id:'c2l8', title:'Encapsulation: the stack in action', taskId:null, quizId:'c2q_l8', modules:[
      { id:'c2l8m1', title:'Each layer adds its own header', render:renderC2EncapIntro },
      { id:'c2l8m2', title:'Stack animation: sender and receiver', build:buildL6M1 }
    ]}
  ]
};
const COURSE_2_QUIZZES_DEF = {
  c2q_l1:{ title:'Quiz: Why layers', qs:[
    { q:'Why was the layered model (ISO/OSI) created?',
      opts:['so devices from different vendors interoperate and faults are found layer by layer','so the internet could handle far more users and traffic flowed even much faster','to save cables and connect everything with one common type of connector'],
      correct:0, why:'Layers are shared rules (protocols) – they let different brands interoperate and pin a fault to a layer.' },
    { q:'How many layers does ISO/OSI have, and TCP/IP?',
      opts:['ISO/OSI 7, TCP/IP 4','ISO/OSI 4, TCP/IP 7','ISO/OSI 5, TCP/IP 4'],
      correct:0, why:'ISO/OSI has 7 layers (a map for understanding), TCP/IP a simplified 4 (the real internet).' },
    { q:'What does "each layer does one job" mean?',
      opts:['it relies on the layer below and provides a service to the layer above','it handles the entire transfer alone and needs none of the other layers','it works only with network hardware from a single specific vendor'],
      correct:0, why:'A layer talks only to its neighbors: it takes a service from below and offers one above – the app ignores cables.' }
  ]},
  c2q_l2:{ title:'Quiz: L1 physical', qs:[
    { q:'What is the physical layer (L1) for?',
      opts:['carry a bit as a signal over the medium','translate a domain name to a destination IP','decide the route of a packet between networks'],
      correct:0, why:'L1 is a bare pipe for bits: voltage, light or radio – it ignores meaning and addresses.' },
    { q:'How does bandwidth differ from latency?',
      opts:['bandwidth = capacity (how much), latency = delay (how long)','they are two terms for exactly the same thing – overall connection speed','latency is the download speed, bandwidth the upload speed'],
      correct:0, why:'Bandwidth is the number of "lanes", latency is travel time – high capacity does not mean low delay.' },
    { q:'Why is throughput usually lower than bandwidth?',
      opts:['because of congestion, overhead and a weaker signal','because all the data gets automatically encrypted on the way','because the cable is too short to reach full speed'],
      correct:0, why:'Bandwidth is the theoretical capacity; in reality less flows (protocol overhead, interference, sharing).' },
    { q:'What happens when there is too much interference in the signal?',
      opts:['the receiver misreads a bit and a transmission error occurs','the signal speeds up instead so it can outrun the interference','the device changes its MAC address because of the interference'],
      correct:0, why:'When noise overwhelms the signal a 1 can be read as a 0 (and vice versa); the checksum catches it and the corrupted frame is discarded (a higher layer, typically TCP, handles resending).' }
  ]},
  c2q_l3:{ title:'Quiz: L2 data link', qs:[
    { q:'What is the main difference between a hub and a switch?',
      opts:['a hub sends a frame to everyone, a switch only to the right port (learns MACs)','a switch sends the frame to absolutely all ports, a hub only to the one right','there is no difference, just an older and a newer name for the same'],
      correct:0, why:'A switch remembers MAC→port and delivers precisely; a hub floods (wasteful and insecure).' },
    { q:'What does a switch store in its MAC table?',
      opts:['which MAC address is behind which port','which IP address belongs to which website name','which ports have incoming traffic allowed'],
      correct:0, why:'From incoming frames it learns MAC→port pairs so it can later deliver precisely.' },
    { q:'What does L2 use to deliver within a local network?',
      opts:['by the MAC address in the frame','by the destination IP in the packet','by the port number of the target service'],
      correct:0, why:'L2 = a frame with destination/source MAC; between networks it is L3 by IP.' },
    { q:'What is an access point (AP) from the network’s point of view?',
      opts:['an L2 bridge between Wi-Fi and the wired network – bridges clients onto a switch','a router that hands out IP addresses and a default gateway to wireless clients','a server that resolves domain names to IPs for wireless clients'],
      correct:0, why:'An AP works at L2: it bridges wireless clients onto the wired network; IP and routing are the router’s job.' }
  ]},
  c2q_l4:{ title:'Quiz: L3 network', qs:[
    { q:'How does a router decide where to send a packet?',
      opts:['by the destination IP and its routing table','by the destination MAC in its ARP table','by the port number of the target service in the packet'],
      correct:0, why:'A router is L3: it reads the destination IP and finds in its table which interface gets it closer.' },
    { q:'What is the TTL in a packet for?',
      opts:['it counts hops; at zero the packet is dropped (stops loops)','it marks the upper-layer protocol that is inside the packet','it limits the maximum packet size so it fits every link'],
      correct:0, why:'Each router lowers TTL by 1; if a packet looped, TTL would hit zero and the packet is dropped.' },
    { q:'What can an L3 switch do that an L2 switch cannot?',
      opts:['route between networks (VLANs)','broadcast its own Wi-Fi network for clients','encrypt the traffic passing through'],
      correct:0, why:'An L3 switch does both L2 switching and L3 routing between VLANs in one box.' },
    { q:'What does NAT do on the router?',
      opts:['swaps a private IP for a public one so the device can reach the internet','encrypts all the traffic passing between the internal network and the internet','automatically assigns devices on the local network their private IPs'],
      correct:0, why:'NAT translates a device’s private address to the router’s single public IP; PAT also tells individual connections apart by port number.' },
    { q:'What does the /24 mean in 192.168.1.0/24?',
      opts:['the first 24 bits are the network, the remaining 8 are for hosts','the address can hold exactly 24 different host devices in total','the network contains 24 routers joined into one whole'],
      correct:0, why:'A /24 prefix = mask 255.255.255.0: 24 network bits and 8 host bits (i.e. 254 usable addresses).' }
  ]},
  c2q_l5:{ title:'Quiz: L4 transport', qs:[
    { q:'What does the transport layer (L4) handle?',
      opts:['app-to-app delivery (ports)','the physical transfer of individual bits over the medium','translating domain names to IPs'],
      correct:0, why:'L4 handles the conversation of two specific apps; ports tell them apart (TCP/UDP).' },
    { q:'When is UDP better than TCP?',
      opts:['for live calls, video and games – speed and freshness','when downloading a file where not a single byte may be missing','always, because UDP is newer and therefore faster'],
      correct:0, why:'UDP does not wait for acks – resending a late frame is pointless; for reliable transfer TCP is better.' },
    { q:'What tells which app a connection belongs to on one device?',
      opts:['the port','the PID','the serial number'],
      correct:0, why:'IP finds the device, the port (apartment number) picks the app – IP+port is the connection’s address.' }
  ]},
  c2q_lsp:{ title:'Quiz: L5 and L6', qs:[
    { q:'What is the session layer (L5) in charge of?',
      opts:['set up, keep and close a session between apps','carry individual bits as an electrical signal over the physical network medium','assign the device its IP address and gateway'],
      correct:0, why:'L5 is like a phone call: it sets up, holds and cleanly closes the connection; in TCP/IP the app does it.' },
    { q:'What does the presentation layer (L6) deal with?',
      opts:['the form of data – encoding (UTF-8), compression and encryption (TLS)','routing packets between separate networks by their destination IP address','choosing between TCP and UDP per the app’s needs'],
      correct:0, why:'L6 gives data an understandable form: it encodes characters, shrinks them and encrypts (TLS).' },
    { q:'In the TCP/IP model, where is the work of OSI layers 5 and 6 handled?',
      opts:['in the application layer – the application itself handles it','in their own dedicated separate layer reserved just for them','in the transport layer together with port selection'],
      correct:0, why:'TCP/IP keeps no separate place for the session or presentation layer – the application does both jobs (e.g. the browser handles TLS and the login session).' }
  ]},
  c2q_l6:{ title:'Quiz: TCP/IP and applications', qs:[
    { q:'How many layers does the TCP/IP model have?',
      opts:['4 (application, transport, internet, link)','5 (application, session, transport, internet, physical)','7 (the same as the ISO/OSI reference model)'],
      correct:0, why:'TCP/IP merges OSI layers into 4; it is the model the internet actually runs on.' },
    { q:'Which layer of the TCP/IP model do DNS, HTTP and TLS live at?',
      opts:['application','session','network (internet)'],
      correct:0, why:'They are application protocols (OSI 5–7 / the TCP/IP application layer).' },
    { q:'Why is it useful to know layer numbers (L2, L3, L7)?',
      opts:['it is the shared language of docs, devices and troubleshooting','the layer numbers themselves directly speed up data transfer across the LAN','every cable must have its layer number marked by law'],
      correct:0, why:'"Which layer is it stuck at?" and "what layer does it work at?" are the field’s core questions.' }
  ]},
  c2q_l7:{ title:'Quiz: Firewall', qs:[
    { q:'Why does a firewall not fit a single layer?',
      opts:['it decides by IP (L3), port (L4) and content (L7)','it is a costly device with no place in a normal network','it broadcasts Wi-Fi, so it sits on L1 and L2 at the same time'],
      correct:0, why:'A firewall filters across layers – so "what layer it is at" depends on what it is doing.' },
    { q:'What does a stateful firewall add over a plain packet filter?',
      opts:['it remembers connections and lets the reply back automatically','it encrypts all traffic passing between the internal network and the internet','it assigns devices their IP addresses and default gateway'],
      correct:0, why:'A packet filter judges a packet alone; stateful knows the context, so it lets replies back.' },
    { q:'What is a DMZ for?',
      opts:['a separate zone for public servers – reachable from the internet, not the LAN','an isolated internal network with no connection out to the internet at all','a reserved spot on disk where data is regularly backed up'],
      correct:0, why:'A DMZ is a buffer: even a compromised server in the DMZ cannot reach the internal network.' }
  ]},
  c2q_l8:{ title:'Quiz: Encapsulation', qs:[
    { q:'In what order are headers added when sending?',
      opts:['top down: data → segment → packet → frame → bits','bottom up: bits → frame → packet → segment → data','all headers are added to the data at once in a single step'],
      correct:0, why:'Data goes down the stack and each layer adds its header (an envelope in an envelope).' },
    { q:'What does a router do with the L2 frame?',
      opts:['peels it off, decides by destination IP and builds a new frame for the next hop','leaves the frame completely unchanged and just forwards it on to the next interface','encrypts the whole frame so nobody can read it along the way'],
      correct:0, why:'A router works at L3: it drops the old frame, reads the destination IP and builds a new L2 frame.' },
    { q:'What is the data unit at layer 3 (network) called?',
      opts:['packet','frame','segment'],
      correct:0, why:'L4 = segment, L3 = packet, L2 = frame, L1 = bits.' }
  ]}
};
/* ============================================================
   COURSE 2 — modules (ISO/OSI and TCP/IP layers); static, descriptive names
   ============================================================ */
// c2l1m1 — Devices from different vendors understand each other
function renderC2VendorInterop(){
  const dev=(x,c,lbl)=>'<g transform="translate('+x+',95)"><rect x="-44" y="-22" width="88" height="44" rx="8" style="fill:var('+c+');fill-opacity:.13;stroke:var('+c+');stroke-width:1.5"/><text y="3" text-anchor="middle" style="font:700 9px var(--sans);fill:var('+c+')">'+esc(lbl)+'</text></g>';
  const svg='<svg viewBox="0 0 640 170" width="100%" style="display:block">'
    +dev(95,'--green','router (brand A)')+dev(320,'--blue','PC (brand B)')+dev(545,'--violet','phone (brand C)')
    +'<line x1="139" y1="95" x2="276" y2="95" style="stroke:var(--cyan);stroke-width:2"/><line x1="364" y1="95" x2="501" y2="95" style="stroke:var(--cyan);stroke-width:2"/>'
    +'<text x="320" y="150" text-anchor="middle" style="font:600 9.5px var(--mono);fill:var(--muted)">'+'they understand each other thanks to shared rules (protocols)'+'</text>'
    +'</svg>';
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'Welcome to the ISO/OSI course. In the first course you saw <b>how</b> data travels. Now we give it a <b>system and names</b>. We start with a question: how can a router from one maker, a PC from another and a phone from a third all talk without trouble? Because they all follow the same <b>rules</b> – <b>protocols</b> – and split the work into <b>layers</b>, each doing one job. That is the <b>layered model</b>. The two most important are <b>ISO/OSI</b> (7 layers, a map for understanding) and <b>TCP/IP</b> (4 layers the internet actually runs on). This whole course walks through them from the bottom up.'+'</p>'
    +'<div class="osi-stage">'+svg+'</div>'
    +'<div class="m1-cap"><span>'+'Shared rules (protocols) + layers = devices from different makers understand each other.'+'</span></div>'
    +abbrBox([['protocol','the agreed rules for how devices and layers talk.'],['layered model','splitting network work into layers – each does one job.']]);
}
// c2l2m1 — What L1 handles: signal, medium, bits
function renderC2L1(){
  const lane=(y,a,b,col)=>'<text x="12" y="'+(y-3)+'" style="font:700 8.5px var(--sans);fill:var('+col+')">'+a+'</text><text x="12" y="'+(y+9)+'" style="font:600 7.5px var(--sans);fill:var(--muted)">'+b+'</text>';
  const svg='<svg id="c2l1svg" viewBox="0 0 640 232" width="100%" style="display:block">'
    +'<text x="330" y="18" text-anchor="middle" style="font:700 10px var(--mono);fill:var(--red)">'+'LAYER 1 — PHYSICAL'+'</text>'
    +'<text x="12" y="44" style="font:700 8.5px var(--sans);fill:var(--txt)">'+'bits'+'</text><text x="12" y="55" style="font:600 7px var(--sans);fill:var(--muted)">'+'(click)'+'</text>'
    +lane(80,'Copper','voltage','--amber')
    +lane(140,'Fiber','light','--cyan')
    +lane(192,'Wi-Fi','radio','--green')
    +'<g id="c2l1bits"></g><g id="c2l1sig"></g>'
    +'<line x1="0" y1="60" x2="0" y2="206" style="stroke:var(--txt);stroke-width:1.4;opacity:.3"><animateTransform attributeName="transform" type="translate" from="140 0" to="500 0" dur="3.4s" repeatCount="indefinite"/></line>'
    +'</svg>';
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'From the first course you already know that data, at its lowest level, is just <b>bits</b> – ones and zeros. Now it is the turn of <b>layer 1 – the physical layer</b>: its only job is to get a bit from one place to another as a physical <b>signal</b> over some <b>medium</b>. <b>Copper</b> carries it as <b>voltage</b> (high = 1, low = 0), <b>fiber</b> as <b>light</b> (flash = 1, dark = 0) and <b>Wi-Fi</b> as a <b>radio wave</b> (transmitting = 1, silent = 0). L1 does not care what the bits mean or whose they are – it just pushes them down the wire, fiber or air. <i>Try flipping the bits below – watch how the same data is encoded into three different signals.</i>'+'</p>'
    +'<div class="osi-stage">'+svg+'</div>'
    +'<div class="m1-cap" id="c2l1cap"></div>'
    +abbrBox([['L1','the physical layer – carrying the signal (bits) over a medium.'],['signal','the physical form of a bit on the medium: voltage (copper), light (fiber) or a radio wave (Wi-Fi).'],['medium','what the signal travels over: a copper cable, an optical fiber or the air (Wi-Fi).']]);
}
function mountC2L1(){
  const X0=140,cw=60,N=6; const bits=[1,0,1,1,0,1];
  const cap=$('c2l1cap'); if(cap)cap.innerHTML='<span>'+'The same bits, three media: copper carries them as voltage, fiber as light, Wi-Fi as a radio wave. The moving line shows how the receiver reads the signal <b>over time</b> – bit by bit, as the communication unfolds. Click a bit to flip it.'+'</span>';
  function drawSig(){
    let s='',path='M'+X0+' 92';
    for(let i=0;i<N;i++){const x=X0+i*cw,xn=x+cw,y=bits[i]?64:92;path+=' L'+x+' '+y+' L'+xn+' '+y;}
    path+=' L'+(X0+N*cw)+' 92';
    s+='<path d="'+path+'" fill="none" style="stroke:var(--amber);stroke-width:2"/>';
    for(let i=0;i<N;i++){const cx=X0+i*cw+cw/2;s+=bits[i]?'<circle cx="'+cx+'" cy="140" r="8" style="fill:var(--cyan)"/>':'<circle cx="'+cx+'" cy="140" r="8" style="fill:none;stroke:var(--cyan);stroke-width:1.6"/>';}
    for(let i=0;i<N;i++){const x=X0+i*cw;if(bits[i]){let p='M'+x+' 192';const seg=cw/4;for(let k=0;k<4;k++){const xa=x+k*seg;p+=' Q'+(xa+seg/2)+' '+(k%2===0?180:204)+' '+(xa+seg)+' 192';}s+='<path d="'+p+'" fill="none" style="stroke:var(--green);stroke-width:1.8"/>';}else{s+='<line x1="'+x+'" y1="192" x2="'+(x+cw)+'" y2="192" style="stroke:var(--green);stroke-width:1.5;stroke-dasharray:3 3;opacity:.55"/>';}}
    const sig=$('c2l1sig');if(sig)sig.innerHTML=s;
  }
  function drawBits(){
    let s='';
    for(let i=0;i<N;i++){const x=X0+i*cw,on=bits[i];s+='<g class="c2l1bit" data-i="'+i+'" style="cursor:pointer"><rect x="'+(x+4)+'" y="34" width="'+(cw-8)+'" height="24" rx="4" style="fill:var(--panel);stroke:var('+(on?'--amber':'--line2')+');stroke-width:1.4"/><text x="'+(x+cw/2)+'" y="51" text-anchor="middle" style="font:700 13px var(--mono);fill:var('+(on?'--amber':'--muted')+')">'+on+'</text></g>';}
    const b=$('c2l1bits');if(b){b.innerHTML=s;b.querySelectorAll('.c2l1bit').forEach(g=>g.onclick=()=>{const i=+g.getAttribute('data-i');bits[i]=bits[i]?0:1;drawBits();drawSig();});}
  }
  drawBits();drawSig();
}
// c2l2m2 — Interference: noise in the signal (interactive)
function renderC2Noise(){
  const svg='<svg id="c2nsvg" viewBox="0 0 640 196" width="100%" style="display:block">'
    +'<text x="12" y="20" style="font:700 8.5px var(--sans);fill:var(--green)">'+'Sent'+'</text><g id="c2nsent"></g>'
    +'<text x="12" y="104" style="font:700 8.5px var(--sans);fill:var(--amber)">'+'Received'+'</text>'
    +'<line x1="120" y1="133" x2="552" y2="133" style="stroke:var(--line2);stroke-width:1;stroke-dasharray:4 4"/><text x="558" y="136" style="font:600 7px var(--sans);fill:var(--muted)">'+'threshold'+'</text><g id="c2nrecv"></g>'
    +'<text x="12" y="180" style="font:700 8.5px var(--sans);fill:var(--txt)">'+'Decoded'+'</text><g id="c2nbits"></g>'
    +'</svg>';
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'No medium is perfect. Along the way the signal picks up <b>noise</b> – interference from motors, a microwave, other transmitters, or <b>crosstalk</b> from a neighboring cable. As long as there is far more signal than noise, the receiver tells 1 from 0 with no trouble. But as interference grows, the signal gets jittery and the receiver may <b>misread a bit</b> – a 1 becomes a 0 or vice versa. That is how <b>transmission errors</b> happen. This is why every transmitted block of data carries a <b>checksum</b>: the transmitter computes a check number from the frame’s bits (typically a <b>CRC</b>) and appends it; the receiver computes the same and compares – a mismatch means corruption, so the frame is <b>discarded</b>. Getting it resent is up to a higher layer (typically TCP). And it is why shielded cabling (<b>STP</b>) is used in noisy places and Wi-Fi struggles in a congested band. <i>Drag the slider below to add interference and watch the received signal and bits degrade.</i>'+'</p>'
    +'<div class="osi-stage">'+svg+'</div>'
    +'<div style="margin:10px 2px 2px;display:flex;align-items:center;gap:10px"><span style="font-size:11.5px;color:var(--muted);white-space:nowrap">'+'Interference'+'</span><input type="range" id="c2nslider" min="0" max="100" value="0" style="flex:1;accent-color:var(--red)"><b id="c2nval" style="font-size:12px;min-width:42px;text-align:right;color:var(--txt)">0 %</b></div>'
    +'<div class="m1-cap" id="c2ncap"></div>'
    +abbrBox([['interference / noise','an unwanted signal that mixes into the useful one and can flip a bit.'],['crosstalk','interference that "leaks" over from a neighboring wire.']]);
}
function mountC2Noise(){
  const X0=120,cw=72,N=6,bits=[1,0,1,1,0,1],thr=[72,52,90,64,44,80];
  const prand=a=>{const s=Math.sin(a*12.9898)*43758.5453;return s-Math.floor(s);};
  const sentY=b=>b?48:74,recvY=b=>b?120:146;
  const plur=n=>n===1?'bit':(n<5?'bits':'bits');
  function draw(noise){
    let sp='M'+X0+' '+sentY(bits[0]),lbl='';
    for(let i=0;i<N;i++){const x=X0+i*cw,xn=x+cw,y=sentY(bits[i]);sp+=' L'+x+' '+y+' L'+xn+' '+y;lbl+='<text x="'+(x+cw/2)+'" y="36" text-anchor="middle" style="font:700 10px var(--mono);fill:var(--green)">'+bits[i]+'</text>';}
    const sent=$('c2nsent');if(sent)sent.innerHTML='<path d="'+sp+'" fill="none" style="stroke:var(--green);stroke-width:2"/>'+lbl;
    const flips=bits.map((b,i)=>noise>=thr[i]);
    const amp=noise/100*15,pts=[];
    for(let i=0;i<N;i++){const rb=flips[i]?(bits[i]?0:1):bits[i],baseY=recvY(rb);for(let k=0;k<=6;k++){const x=X0+i*cw+(k/6)*cw,jy=(prand(i*7.3+k*1.7)-0.5)*2*amp;pts.push([x,baseY+jy]);}}
    const rp=pts.map((p,idx)=>(idx?'L':'M')+p[0].toFixed(1)+' '+p[1].toFixed(1)).join(' ');
    const recv=$('c2nrecv');if(recv)recv.innerHTML='<path d="'+rp+'" fill="none" style="stroke:var('+(noise>50?'--red':'--amber')+');stroke-width:1.8"/>';
    let bs='';for(let i=0;i<N;i++){const rb=flips[i]?(bits[i]?0:1):bits[i],x=X0+i*cw+cw/2;bs+='<text x="'+x+'" y="180" text-anchor="middle" style="font:700 12px var(--mono);fill:var('+(flips[i]?'--red':'--muted')+')">'+rb+'</text>';}
    const bg=$('c2nbits');if(bg)bg.innerHTML=bs;
    const v=$('c2nval');if(v)v.textContent=noise+' %';
    const nbad=flips.filter(Boolean).length,cap=$('c2ncap');
    if(cap)cap.innerHTML='<span>'+(nbad===0?'Clean signal – the received bits exactly match what was sent.':('Interference flipped '+nbad+' '+plur(nbad)+' (in red). This is how errors arise – which is why frames are checked (FCS) and corrupted ones are <b>discarded</b>. Getting them resent is up to a higher layer (typically TCP).'))+'</span>';
  }
  const sl=$('c2nslider');if(sl)sl.oninput=()=>draw(+sl.value);
  draw(0);
}
// c2l2m3 — Bandwidth, throughput, latency
function renderC2Bandwidth(){
  const bar=(y,c,lbl,w)=>'<text x="20" y="'+(y+4)+'" style="font:700 9px var(--sans);fill:var('+c+')">'+esc(lbl)+'</text><rect x="180" y="'+(y-9)+'" width="'+w+'" height="16" rx="4" style="fill:var('+c+');fill-opacity:.3;stroke:var('+c+');stroke-width:1.2"/>';
  const svg='<svg viewBox="0 0 640 150" width="100%" style="display:block">'
    +bar(40,'--cyan','bandwidth',400)
    +bar(78,'--green','throughput',300)
    +'<text x="195" y="118" style="font:400 8.5px var(--sans);fill:var(--muted)">'+'latency = delay (round-trip time), not volume'+'</text>'
    +'</svg>';
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'At L1 three terms get confused. <b>Bandwidth</b> is the link’s <b>capacity</b> – how many bits the medium could carry per second (Mbps/Gbps), like the width of a highway. <b>Throughput</b> is how much data actually flows – often <b>less</b> than the bandwidth (congestion, overhead, weak signal). <b>Latency</b> is something else entirely: the <b>delay</b>, how long data takes to get there and back – like travel time, not the number of lanes. A fast link can have huge bandwidth but poor latency (say over satellite) and still ruin a game or a call. The task that follows shows the consequence: priority for voice fixes the call and changes nothing for a file copy.'+'</p>'
    +'<div class="osi-stage">'+svg+'</div>'
    +'<div class="m1-cap"><span>'+'Bandwidth = capacity, throughput = what really flows, latency = delay.'+'</span></div>'
    +abbrBox([['bandwidth','the link capacity – how many bits the medium could carry per second.'],['throughput','how much data actually flows per second (often less than the bandwidth).'],['latency','the delay – the time for data to get there and back.']]);
}
// c2l3m1 — What L2 handles: the frame and local delivery
function renderC2L2Frame(){
  const svg='<svg viewBox="0 0 640 150" width="100%" style="display:block">'
    +'<text x="320" y="24" text-anchor="middle" style="font:700 10px var(--mono);fill:var(--amber)">'+'LAYER 2 — DATA LINK (frame)'+'</text>'
    +'<rect x="120" y="50" width="400" height="46" rx="6" style="fill:none;stroke:var(--amber);stroke-width:1.6"/>'
    +'<rect x="128" y="58" width="90" height="30" rx="4" style="fill:var(--amber);fill-opacity:.16"/><text x="173" y="77" text-anchor="middle" style="font:700 8px var(--sans);fill:var(--amber)">'+'dst MAC'+'</text>'
    +'<rect x="222" y="58" width="90" height="30" rx="4" style="fill:var(--amber);fill-opacity:.16"/><text x="267" y="77" text-anchor="middle" style="font:700 8px var(--sans);fill:var(--amber)">'+'src MAC'+'</text>'
    +'<rect x="316" y="58" width="140" height="30" rx="4" style="fill:var(--blue);fill-opacity:.12"/><text x="386" y="77" text-anchor="middle" style="font:700 8px var(--sans);fill:var(--blue)">'+'data'+'</text>'
    +'<rect x="460" y="58" width="52" height="30" rx="4" style="fill:var(--green);fill-opacity:.16"/><text x="486" y="77" text-anchor="middle" style="font:700 8px var(--sans);fill:var(--green)">FCS</text>'
    +'<text x="320" y="120" text-anchor="middle" style="font:400 8.5px var(--sans);fill:var(--muted)">'+'MAC addresses + checksum — delivery within one local network'+'</text>'
    +'</svg>';
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'<b>Layer 2 – data link</b> handles <b>delivery within one local network</b>. It wraps data into a <b>frame</b>: it puts the <b>destination and source MAC addresses</b> at the front and a <b>checksum (FCS)</b> at the end, by which the receiver tells whether the frame got corrupted on the way. L2 does not think about reaching another network – that is L3’s job. It only handles one "hop": device to device (or to the gateway) within the same network, by MAC. Typical L2 devices are the <b>switch</b> and the <b>access point</b>.'+'</p>'
    +'<div class="osi-stage">'+svg+'</div>'
    +'<div class="m1-cap"><span>'+'L2 wraps data into a frame (MAC + FCS) and delivers within one local network.'+'</span></div>'
    +abbrBox([['L2','the data-link layer – delivery within one local network by MAC.'],['frame','the L2 unit: data + destination/source MAC + checksum (FCS).'],['FCS','the frame’s checksum – verifies the data was not corrupted in transit.']]);
}
// c2l3m2 — Hub: sends to everyone (step-through animation)
function renderC2Hub(){
  const pc=(x,y,c,lbl)=>'<g transform="translate('+x+','+y+')"><circle r="16" style="fill:var('+c+');fill-opacity:.15;stroke:var('+c+');stroke-width:1.5"/><text y="4" text-anchor="middle" style="font:700 9px var(--mono);fill:var('+c+')">'+lbl+'</text></g>';
  const frame='<svg id="c2hubsvg" viewBox="0 0 640 188" width="100%" style="display:block">'
    +pc(70,94,'--green','A')
    +'<rect x="278" y="76" width="84" height="36" rx="6" style="fill:var(--muted);fill-opacity:.14;stroke:var(--muted);stroke-width:1.6"/><text x="320" y="98" text-anchor="middle" style="font:700 11px var(--mono);fill:var(--muted)">HUB</text>'
    +pc(560,44,'--amber','B')+pc(560,94,'--cyan','C')+pc(560,144,'--cyan','D')
    +'<line x1="88" y1="94" x2="278" y2="94" style="stroke:var(--line2);stroke-width:1.6"/>'
    +'<line x1="362" y1="86" x2="544" y2="48" style="stroke:var(--line2);stroke-width:1;stroke-dasharray:2 3"/><line x1="362" y1="94" x2="544" y2="94" style="stroke:var(--line2);stroke-width:1;stroke-dasharray:2 3"/><line x1="362" y1="102" x2="544" y2="140" style="stroke:var(--line2);stroke-width:1;stroke-dasharray:2 3"/>'
    +'<g id="c2hubdyn"></g></svg>';
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'The oldest device for joining stations is the <b>hub</b> – and note, it works only at <b>L1</b> (it blindly repeats the electrical signal to all ports – it never reads the frame the signal carries). It is plain "dumb": <b>whatever you send, it repeats to everyone</b>. When a frame arrives it copies it to <b>all ports</b> (except the one it came from) – no memory, it never learns who is where. Crucially: <b>the hub decides nothing</b>. The "is this for me?" decision is made by the <b>end station</b> – its network card checks the destination MAC, keeps its own frame and drops the rest. But the foreign frame <b>still arrived</b>, so a curious host can <b>read</b> it (eavesdrop) – a serious security weakness. On top of that everyone shares one medium and easily talks over each other (collisions). <b>Today the hub is essentially obsolete</b> – the smarter <b>switch</b> replaced it (next up).'+'</p>'
    +'<div class="osi-stage" id="c2hubstage">'+frame+'</div>'
    +'<div class="m1-cap" id="c2hubcap"></div>'
    +courseStepControls('c2hub')
    +abbrBox([['hub','a "dumb" L1 device (repeater) – it repeats the signal to all ports and never reads MAC addresses; no longer used today.'],['collision domain','a group of devices sharing a medium where transmissions can collide.']]);
}
function mountC2Hub(){
  const pkt=(path,begin)=>'<rect x="-8" y="-5.5" width="16" height="11" rx="2" style="fill:var(--amber)"><animateMotion path="'+path+'" dur="'+CRS_DUR+'" begin="'+begin+'" repeatCount="indefinite"/></rect>';
  const toHub=pkt('M88 94 L278 94','0s');
  const litLines='<line x1="362" y1="88" x2="544" y2="48" style="stroke:var(--amber);stroke-width:2.4;opacity:.5"/><line x1="362" y1="94" x2="544" y2="94" style="stroke:var(--amber);stroke-width:2.4;opacity:.5"/><line x1="362" y1="100" x2="544" y2="140" style="stroke:var(--amber);stroke-width:2.4;opacity:.5"/>';
  const floodPkts=pkt('M362 94 L544 48','0s')+pkt('M362 94 L544 94','0s')+pkt('M362 94 L544 140','0s');
  const tag=(y,t,c)=>'<text x="582" y="'+y+'" style="font:700 7.5px var(--sans);fill:var('+c+')">'+esc(t)+'</text>';
  const decide=litLines+tag(47,'✓ for me','--green')+tag(97,'not for me','--muted')+tag(147,'not for me','--muted');
  const eaves=litLines+tag(47,'✓ for me','--green')+tag(97,'⚠ can read','--red')+tag(147,'⚠ can read','--red');
  const STEPS=[
    {dyn:toHub,cap:'PC-A sends <b>one</b> frame for PC-B – it travels to the hub.'},
    {dyn:toHub+litLines+floodPkts,cap:'The hub doesn’t look at addresses at all – it <b>blindly repeats the signal to all ports</b>, so the frame reaches everyone (flood).'},
    {dyn:decide,cap:'The decision is made by the <b>end stations</b>: each checks the destination MAC. <b>B</b> keeps the frame, <b>C and D</b> are supposed to drop it.'},
    {dyn:eaves,cap:'But the frame <b>was at C and D anyway</b> – a curious host can <b>read</b> the data (eavesdrop). That is why the hub is <b>obsolete today</b>.'}
  ];
  function show(idx){const d=$('c2hubdyn');if(d)d.innerHTML=STEPS[idx].dyn;const c=$('c2hubcap');if(c)c.innerHTML='<span>'+STEPS[idx].cap+'</span>';}
  courseStepper('c2hub',STEPS.length,show);
}
// c2l3m3 — Switch and the MAC table
function renderC2Switch(){
  const pc=(x,y,c,lbl)=>'<g transform="translate('+x+','+y+')"><circle r="15" style="fill:var('+c+');fill-opacity:.15;stroke:var('+c+');stroke-width:1.5"/><text y="4" text-anchor="middle" style="font:700 9px var(--mono);fill:var('+c+')">'+lbl+'</text></g>';
  const macRows=[['P1','…4D:5E (B)'],['P2','…4F:7A (C)'],['P3','…4E:6F (D)']];
  const svg='<svg id="c2swsvg" viewBox="0 0 640 214" width="100%" style="display:block">'
    +'<rect x="196" y="8" width="250" height="68" rx="8" style="fill:var(--panel);stroke:var(--cyan);stroke-width:1.2"/>'
    +'<text x="321" y="24" text-anchor="middle" style="font:700 8.5px var(--sans);fill:var(--cyan)">'+'MAC TABLE'+'</text>'
    +'<text x="236" y="39" text-anchor="middle" style="font:700 7px var(--mono);fill:var(--muted)">PORT</text><text x="368" y="39" text-anchor="middle" style="font:700 7px var(--mono);fill:var(--muted)">MAC</text>'
    +macRows.map((r,i)=>{const y=53+i*13;return '<text x="236" y="'+y+'" text-anchor="middle" style="font:700 8px var(--mono);fill:var(--cyan)">'+r[0]+'</text><text x="368" y="'+y+'" text-anchor="middle" style="font:400 7.5px var(--mono);fill:var(--txt)">'+r[1]+'</text>';}).join('')
    +'<line x1="76" y1="152" x2="186" y2="152" style="stroke:var(--line2);stroke-width:1.6"/>'
    +'<line x1="274" y1="144" x2="484" y2="112" style="stroke:var(--line2);stroke-width:1;stroke-dasharray:2 3"/><line x1="274" y1="152" x2="484" y2="152" style="stroke:var(--line2);stroke-width:1;stroke-dasharray:2 3"/><line x1="274" y1="160" x2="484" y2="192" style="stroke:var(--line2);stroke-width:1;stroke-dasharray:2 3"/>'
    +'<text x="286" y="124" style="font:700 6.5px var(--mono);fill:var(--muted)">P1</text><text x="286" y="150" style="font:700 6.5px var(--mono);fill:var(--muted)">P2</text><text x="286" y="176" style="font:700 6.5px var(--mono);fill:var(--muted)">P3</text>'
    +pc(60,152,'--green','A')
    +'<g transform="translate(230,152)"><rect x="-44" y="-20" width="88" height="40" rx="8" style="fill:var(--cyan);fill-opacity:.14;stroke:var(--cyan);stroke-width:1.6"/><text y="3" text-anchor="middle" style="font:700 10px var(--mono);fill:var(--cyan)">SWITCH</text></g>'
    +pc(500,112,'--violet','B')+pc(500,152,'--amber','C')+pc(500,192,'--violet','D')
    +'<g id="c2swdyn"></g></svg>';
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'The <b>switch</b> is the smart successor to the hub. It learns: for every frame it remembers the <b>source MAC and the port</b> it came in on, into a <b>MAC table</b>. Next time it sends the frame to <b>only the right port</b>, not to everyone. That saves bandwidth, limits eavesdropping, and each port is its own collision domain. When it does not yet know the target, it floods like a hub. Mind a common misconception: a switch learns <b>source</b> MACs only – the target gets into the table only once that host itself sends something (typically right in its reply). Until then it floods every time. A table entry has a <b>timer</b> (typically ~300 s) and expires without traffic; when a device is moved to another port, the switch relearns it on the first frame from there <i>(covered in detail in the Switch in depth course)</i>. The switch works at <b>L2</b>: it understands MAC, not IP – it will not carry you between different networks; that is the router (L3).'+'</p>'
    +'<div class="osi-stage">'+svg+'</div>'
    +'<div class="m1-cap" id="c2swcap"></div>'
    +courseStepControls('c2sw')
    +abbrBox([['L2 switch','switches frames within a local network by MAC; learns MAC→port.'],['MAC table','a switch remembers which MAC is behind which port.']]);
}
function mountC2Switch(){
  const frame=path=>'<rect x="-10" y="-7" width="20" height="14" rx="2" style="fill:var(--amber)"><animateMotion path="'+path+'" dur="'+CRS_DUR+'" repeatCount="indefinite"/></rect>';
  const litC='<line x1="274" y1="152" x2="484" y2="152" style="stroke:var(--amber);stroke-width:2.4;opacity:.6"/>';
  const tag=(y,t,c)=>'<text x="524" y="'+y+'" style="font:700 7.5px var(--sans);fill:var('+c+')">'+esc(t)+'</text>';
  const tags=tag(116,'nothing','--muted')+tag(156,'✓ delivered','--green')+tag(196,'nothing','--muted');
  const STEPS=[
    {dyn:'',cap:'The switch has learned <b>which station is behind which port</b> (MAC→port) – see the table.'},
    {dyn:frame('M76 152 L186 152'),cap:'PC-A wants to send a frame to <b>PC-C</b>.'},
    {dyn:litC+frame('M274 152 L484 152'),cap:'The switch finds C in the table on <b>port P2</b> → it sends the frame <b>only there</b>, not to P1/P3.'},
    {dyn:litC+tags,cap:'Unlike a hub, <b>B and D get nothing</b> – less traffic and no eavesdropping.'}
  ];
  function show(idx){const d=$('c2swdyn');if(d)d.innerHTML=STEPS[idx].dyn;const c=$('c2swcap');if(c)c.innerHTML='<span>'+STEPS[idx].cap+'</span>';}
  courseStepper('c2sw',STEPS.length,show);
}
// c2l3m4 — WAP: the wireless access point at L2
function renderC2Wap(){
  const svg='<svg viewBox="0 0 640 160" width="100%" style="display:block">'
    +'<g transform="translate(320,70)"><rect x="-30" y="-18" width="60" height="36" rx="7" style="fill:var(--cyan);fill-opacity:.16;stroke:var(--cyan);stroke-width:1.6"/><text y="3" text-anchor="middle" style="font:700 8.5px var(--sans);fill:var(--cyan)">AP</text></g>'
    +'<line x1="320" y1="88" x2="320" y2="120" style="stroke:var(--cyan);stroke-width:2"/><text x="320" y="138" text-anchor="middle" style="font:400 8px var(--sans);fill:var(--muted)">'+'cable to switch (wired network)'+'</text>'
    +'<path d="M290 50a40 40 0 00-30 -8M350 50a40 40 0 0130 -8" fill="none" stroke="var(--cyan)" stroke-width="1.4"/>'
    +'<circle cx="200" cy="40" r="9" style="fill:var(--green);fill-opacity:.15;stroke:var(--green);stroke-width:1.3"/><circle cx="440" cy="40" r="9" style="fill:var(--green);fill-opacity:.15;stroke:var(--green);stroke-width:1.3"/>'
    +'<path d="M270 60 Q235 50 209 45M370 60 Q405 50 431 45" fill="none" stroke="var(--cyan)" stroke-width="1.2" stroke-dasharray="3 3"/>'
    +'</svg>';
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'An <b>access point (AP, sometimes WAP)</b> is really a <b>switch for the air</b>. It works at <b>L2</b>: it takes wireless devices over Wi-Fi and <b>bridges</b> them onto the wired network it is cabled into. From the network’s point of view a wireless client behaves as if cabled into a switch – it gets an address from the same network the SSID maps to. The AP <b>does not decide IP</b> and does not route – the router does that. At home the AP is part of an all-in-one router; in an office it is a separate device – you have probably seen them as white discs mounted on the ceiling in offices or schools.'+'</p>'
    +'<div class="osi-stage">'+svg+'</div>'
    +'<div class="m1-cap"><span>'+'An AP = a switch for the air: it bridges Wi-Fi clients onto the wired network (L2).'+'</span></div>'
    +abbrBox([['AP / WAP','(wireless) access point – an L2 bridge between Wi-Fi and the wired network.'],['SSID','the Wi-Fi network name; maps wireless clients to a specific network.']]);
}
// c2l4m1 — What L3 handles: routing between networks
function renderC2L3Routing(){
  const net=(x,c,lbl)=>'<g transform="translate('+x+',95)"><ellipse rx="56" ry="30" style="fill:var('+c+');fill-opacity:.10;stroke:var('+c+');stroke-width:1.3"/><text y="3" text-anchor="middle" style="font:700 8.5px var(--mono);fill:var('+c+')">'+esc(lbl)+'</text></g>';
  const svg='<svg viewBox="0 0 640 170" width="100%" style="display:block">'
    +net(110,'--green','192.168.1.0/24')+net(545,'--violet','10.0.0.0/24')
    +'<g transform="translate(320,95)"><rect x="-26" y="-20" width="52" height="40" rx="8" style="fill:var(--blue);fill-opacity:.16;stroke:var(--blue);stroke-width:1.6"/><text y="4" text-anchor="middle" style="font:700 8px var(--sans);fill:var(--blue)">router</text></g>'
    +'<line x1="166" y1="95" x2="293" y2="95" style="stroke:var(--line);stroke-width:1.6"/><line x1="347" y1="95" x2="489" y2="95" style="stroke:var(--line);stroke-width:1.6"/>'
    +'<text x="320" y="150" text-anchor="middle" style="font:400 8.5px var(--sans);fill:var(--muted)">'+'only L3 (a router) moves you between different networks — by destination IP'+'</text>'
    +'</svg>';
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'L1 carries the signal, L2 delivers a frame within one network. But how does data reach a <b>different</b> network? That is the job of <b>layer 3 – network</b>. L3 works with <b>IP addresses</b> and can <b>route</b>: by the destination IP it decides which way to send the packet next. The key difference: <b>L2 handles one hop within a network (MAC), L3 handles the path across many networks (IP)</b>. The device that does this is the <b>router</b> (and its relative the L3 switch). Without L3 every local network would be an island – the internet is really one giant jigsaw of L3 routing.'+'</p>'
    +'<div class="osi-stage">'+svg+'</div>'
    +'<div class="m1-cap"><span>'+'L3 (a router) moves between different networks by IP. L2 = within, L3 = across.'+'</span></div>'
    +abbrBox([['L3','the network layer – routing between different networks by IP address.'],['routing','deciding which way to send a packet toward the destination network.']]);
}
// c2l4m2 — Router and the routing table (step-through scene)
function renderC2Router(){
  const svg='<svg id="c2rtsvg" viewBox="0 0 640 215" width="100%" style="display:block">'
    +'<line x1="97" y1="60" x2="222" y2="60" style="stroke:var(--line2);stroke-width:1.6"/>'
    +'<line x1="278" y1="60" x2="433" y2="60" style="stroke:var(--line2);stroke-width:1.6"/>'
    +'<line x1="266.6" y1="80" x2="425" y2="150" style="stroke:var(--line2);stroke-width:1.6;stroke-dasharray:4 4"/>'
    +'<g id="c2rtglow"></g>'
    +'<g transform="translate(75,60)"><circle r="18" style="fill:var(--green);fill-opacity:.15;stroke:var(--green);stroke-width:1.5"/><text y="4" text-anchor="middle" style="font:700 8px var(--sans);fill:var(--green)">PC</text></g>'
    +'<text x="75" y="94" text-anchor="middle" style="font:700 7.5px var(--mono);fill:var(--green)">192.168.1.10</text>'
    +'<g transform="translate(250,60)"><rect x="-26" y="-20" width="52" height="40" rx="8" style="fill:var(--blue);fill-opacity:.16;stroke:var(--blue);stroke-width:1.6"/><text y="4" text-anchor="middle" style="font:700 8px var(--sans);fill:var(--blue)">router</text></g>'
    +'<g transform="translate(455,60)"><circle r="18" style="fill:var(--violet);fill-opacity:.15;stroke:var(--violet);stroke-width:1.5"/><text y="4" text-anchor="middle" style="font:700 8px var(--sans);fill:var(--violet)">'+'server'+'</text></g>'
    +'<text x="455" y="94" text-anchor="middle" style="font:700 7.5px var(--mono);fill:var(--violet)">10.0.0.42 · '+'iface A'+'</text>'
    +'<g transform="translate(470,165)"><ellipse rx="44" ry="20" style="fill:var(--blue);fill-opacity:.10;stroke:var(--blue);stroke-width:1.3"/><text y="4" text-anchor="middle" style="font:700 8px var(--mono);fill:var(--blue)">'+'internet'+'</text></g>'
    +'<g id="c2rtdyn"></g></svg>';
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'The <b>router</b> is the main L3 device. For every packet it looks at the <b>destination IP</b> and in its <b>routing table</b> – a list of "destination network → the way out" – finds <b>which interface</b> to send it out to get closer to the target. Each pass through a router is one <b>hop</b>. So a packet does not wander the network forever, it carries a <b>TTL</b> (Time To Live) – a <b>hop counter</b>: every router lowers it by 1, and when it reaches zero the packet is dropped. Step through the decision.'+'</p>'
    +'<div class="osi-stage">'+svg+'</div>'
    +'<div class="m1-cap" id="c2rtcap"></div>'
    +courseStepControls('c2rt')
    +abbrBox([['router','an L3 device: routes packets between networks by destination IP.'],['routing table','a list "dest network → which interface"; includes the default route 0.0.0.0/0.'],['TTL','a hop counter; each router lowers it, at zero the packet is dropped.'],['NAT','address translation on the router: many devices in the home network share one public IP toward the internet.']]);
}
function mountC2Router(){
  const ROWS=[['10.0.0.0/24','iface A'],['192.168.1.0/24','iface B'],['0.0.0.0/0','provider']];
  const rt=(hi,col)=>{let o='<g transform="translate(30,120)"><rect x="0" y="0" width="200" height="80" rx="5" style="fill:var(--panel2);stroke:var(--line2);stroke-width:1"/><text x="8" y="13" style="font:700 7px var(--mono);fill:var(--muted)">'+esc('dest network → via')+'</text>';
    ROWS.forEach((r,i)=>{const on=i===hi,c=on?(col||'--green'):'--txt';o+=(on?'<rect x="4" y="'+(34+i*14-9)+'" width="192" height="13" rx="3" style="fill:var('+c+');fill-opacity:.16"/>':'')+'<text x="8" y="'+(35+i*14)+'" style="font:700 7px var(--mono);fill:var('+c+')">'+r[0]+' → '+esc(r[1])+'</text>';});
    return o+'</g>';};
  const lbl=(x,y,tx,c)=>'<text x="'+x+'" y="'+y+'" text-anchor="middle" style="font:700 7.5px var(--mono);fill:var('+c+')">'+esc(tx)+'</text>';
  const STEPS=[
    {glow:csGlow(75,60,'--green'),dyn:csPkt('M97 60 L222 60','--green')+lbl(160,44,'dest: 10.0.0.42','--green')+lbl(160,80,'TTL 64','--green')+rt(-1),cap:'The PC sends a packet to <b>10.0.0.42</b> with <b>TTL 64</b> in its header. First it travels to the <b>router</b> – its network’s gateway.'},
    {glow:csGlow(250,60,'--blue',26),dyn:lbl(250,26,'reading dest IP: 10.0.0.42','--blue')+lbl(250,96,'TTL 64 → 63','--blue')+rt(-1),cap:'The router reads the <b>destination IP</b> from the header, <b>lowers the TTL by 1</b> (64 → 63) and asks its <b>routing table</b>: which way gets closer to the target?'},
    {glow:csGlow(250,60,'--green',26),dyn:rt(0,'--green'),cap:'It finds a <b>match</b> in the table: destination 10.0.0.42 belongs to network <b>10.0.0.0/24 → interface A</b>. (The /24 notation means "the 10.0.0.x network" – we will unpack it properly in the subnetting module shortly.)'},
    {glow:csGlow(455,60,'--violet'),dyn:rt(0,'--green')+csPkt('M278 60 L433 60','--green')+lbl(355,44,'TTL 63','--green'),cap:'And it sends the packet out <b>interface A</b> – the right way toward the target. No magic: read the IP, find the row, send.'},
    {glow:csGlow(250,60,'--amber',26),dyn:lbl(250,26,'dest: 8.8.8.8 – nothing matches','--amber')+rt(2,'--amber')+csPkt('M262 78 L425 150','--amber'),cap:'A packet to <b>8.8.8.8</b>? No specific row matches → the <b>default route 0.0.0.0/0</b> is used: "if I know nothing better, send it to the provider".'}
  ];
  function show(i){const g=$('c2rtglow');if(g)g.innerHTML=STEPS[i].glow||'';const d=$('c2rtdyn');if(d)d.innerHTML=STEPS[i].dyn||'';const c=$('c2rtcap');if(c)c.innerHTML='<span>'+STEPS[i].cap+'</span>';}
  courseStepper('c2rt',STEPS.length,show);
}
// c2l4m3 — NAT in practice: one public IP for the whole network (the port distinguishes connections)
function renderC2Nat(){
  const svg='<svg id="c2ntsvg" viewBox="0 0 640 200" width="100%" style="display:block">'
    +'<line x1="102" y1="60" x2="252" y2="60" style="stroke:var(--line2);stroke-width:1.6"/>'
    +'<line x1="308" y1="60" x2="482" y2="60" style="stroke:var(--line2);stroke-width:1.6;stroke-dasharray:4 4"/>'
    +'<g id="c2ntglow"></g>'
    +'<g transform="translate(80,60)"><circle r="18" style="fill:var(--green);fill-opacity:.15;stroke:var(--green);stroke-width:1.5"/><text y="4" text-anchor="middle" style="font:700 8px var(--sans);fill:var(--green)">PC</text></g>'
    +'<text x="80" y="94" text-anchor="middle" style="font:700 7.5px var(--mono);fill:var(--green)">192.168.1.10</text>'
    +'<g transform="translate(280,60)"><rect x="-26" y="-20" width="52" height="40" rx="8" style="fill:var(--blue);fill-opacity:.16;stroke:var(--blue);stroke-width:1.6"/><text y="4" text-anchor="middle" style="font:700 8px var(--sans);fill:var(--blue)">NAT</text></g>'
    +'<text x="280" y="96" text-anchor="middle" style="font:700 7.5px var(--mono);fill:var(--blue)">'+'public'+' 198.51.100.1</text>'
    +'<g transform="translate(530,60)"><ellipse rx="44" ry="22" style="fill:var(--blue);fill-opacity:.10;stroke:var(--blue);stroke-width:1.3"/><text y="4" text-anchor="middle" style="font:700 8px var(--mono);fill:var(--blue)">'+'internet'+'</text></g>'
    +'<rect x="170" y="126" width="310" height="52" rx="7" style="fill:var(--panel);stroke:var(--line2);stroke-width:1.2"/>'
    +'<text x="185" y="144" style="font:700 8px var(--sans);fill:var(--muted)">'+'NAT table (private ↔ public)'+'</text>'
    +'<g id="c2ntdyn"></g></svg>';
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'In the first course (<b>How networks work</b>) you saw the router <b>swap</b> your private address for its single public one (that is <b>NAT</b>). But then how does it know <b>whose reply</b> a packet is, when the whole household hides behind that one public IP? It uses <b>port numbers</b> and a <b>translation table</b>. This common variant (port-based NAT) is called <b>PAT</b> – and it is exactly why a <b>single public address</b> is enough for a whole network. Don’t confuse the <b>NAT table</b> with a stateful firewall’s connection table: the NAT table <b>translates</b> addresses and ports, while the connection table only <b>permits</b> return traffic that was requested from inside. A NAT router is usually also a stateful firewall, which is why the two functions often blur together. Step through the packet’s trip there and back.'+'</p>'
    +'<div class="osi-stage">'+svg+'</div>'
    +'<div class="m1-cap" id="c2ntcap"></div>'
    +courseStepControls('c2nt')
    +abbrBox([['NAT','translation between private and public addresses on the router.'],['PAT','port-based NAT – one public IP tells many devices’ connections apart by port number.']]);
}
function mountC2Nat(){
  const row=(txt,col)=>'<text x="185" y="164" style="font:600 8.5px var(--mono);fill:var('+col+')">'+esc(txt)+'</text>';
  const rec=row('192.168.1.10:51000 ↔ 198.51.100.1:40001','--green');
  const lbl=(x,y,tx,c)=>'<text x="'+x+'" y="'+y+'" text-anchor="middle" style="font:700 7.5px var(--mono);fill:var('+c+')">'+esc(tx)+'</text>';
  const STEPS=[
    {glow:csGlow(80,60,'--green'),dyn:csPkt('M102 60 L252 60','--green')+lbl(177,44,'from: 192.168.1.10:51000','--green')+row('— empty so far —','--muted'),cap:'The PC sends a packet out to the internet. But the source address is <b>private</b> – nobody on the internet could reply to that.'},
    {glow:csGlow(280,60,'--blue',26),dyn:csPkt('M308 60 L482 60','--blue')+lbl(395,44,'from: 198.51.100.1:40001','--blue')+rec,cap:'The router <b>rewrites the source IP</b> to its public one (and picks a port) – and <b>writes the translation into its NAT table</b>. The packet leaves with the public address.'},
    {glow:csGlow(530,60,'--blue',30),dyn:csPkt('M482 60 L308 60','--cyan')+lbl(395,44,'to: 198.51.100.1:40001','--cyan')+rec,cap:'The reply from the internet comes back <b>to the public IP and port</b>. The router finds the record in the table: port 40001 → that is the PC’s connection.'},
    {glow:csGlow(80,60,'--green'),dyn:csPkt('M252 60 L102 60','--cyan')+lbl(177,44,'to: 192.168.1.10:51000','--cyan')+rec,cap:'Using the table it <b>rewrites the address back</b> to 192.168.1.10 and delivers it. The whole household gets by with a <b>single public IP</b>.'}
  ];
  function show(i){const g=$('c2ntglow');if(g)g.innerHTML=STEPS[i].glow||'';const d=$('c2ntdyn');if(d)d.innerHTML=STEPS[i].dyn||'';const c=$('c2ntcap');if(c)c.innerHTML='<span>'+STEPS[i].cap+'</span>';}
  courseStepper('c2nt',STEPS.length,show);
}
// c2l4m4 — L3 switch: when a switch can route
function renderC2L3Switch(){
  const svg='<svg viewBox="0 0 640 160" width="100%" style="display:block">'
    +'<g transform="translate(320,70)"><rect x="-44" y="-24" width="88" height="48" rx="9" style="fill:var(--violet);fill-opacity:.14;stroke:var(--violet);stroke-width:1.6"/><text y="-2" text-anchor="middle" style="font:700 9px var(--sans);fill:var(--violet)">L3 switch</text><text y="13" text-anchor="middle" style="font:700 7.5px var(--mono);fill:var(--violet)">L2 + L3</text></g>'
    +['VLAN 10','VLAN 20','VLAN 30'].map((v,i)=>'<g transform="translate('+(120+i*200)+',135)"><text text-anchor="middle" style="font:700 8.5px var(--mono);fill:var(--cyan)">'+v+'</text></g>').join('')
    +[120,320,520].map(x=>'<line x1="320" y1="94" x2="'+x+'" y2="122" style="stroke:var(--line);stroke-width:1.3"/>').join('')
    +'</svg>';
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'What if you want a switch’s speed <b>and</b> the ability to send data between different networks (VLANs), all in one box? That is the <b>L3 switch</b>: it does <b>both</b>. Within one network (a <b>VLAN</b> – a logically separated network on a single switch) it behaves like a blazing-fast L2 switch; between VLANs it <b>routes</b> like a router. In companies it is a backbone device – instead of a tangle of cables to one router, <b>inter-VLAN routing</b> is done right on the switch. The difference from an ordinary router: an L3 switch is tuned for high speed inside the company, a router for connecting to the internet (NAT, WAN). In practice, though, their roles increasingly overlap. <i>(VLANs are covered in detail in the Switching and VLANs course.)</i>'+'</p>'
    +'<div class="osi-stage">'+svg+'</div>'
    +'<div class="m1-cap"><span>'+'An L3 switch = L2 switching within a VLAN + L3 routing between VLANs in one box.'+'</span></div>'
    +abbrBox([['VLAN','a logically separated network on one physical switch – like several separate networks in one box.'],['L3 switch','a switch that can also route between networks (VLANs).'],['inter-VLAN routing','moving between two VLANs; needs an L3 device.']]);
}
// c2l5m1 — What L4 handles: end-to-end delivery
function renderC2L4(){
  const svg='<svg viewBox="0 0 640 150" width="100%" style="display:block">'
    +'<g transform="translate(90,75)"><circle r="20" style="fill:var(--green);fill-opacity:.15;stroke:var(--green);stroke-width:1.5"/><text y="4" text-anchor="middle" style="font:700 8px var(--sans);fill:var(--green)">'+'app'+'</text></g>'
    +'<g transform="translate(550,75)"><circle r="20" style="fill:var(--violet);fill-opacity:.15;stroke:var(--violet);stroke-width:1.5"/><text y="4" text-anchor="middle" style="font:700 8px var(--sans);fill:var(--violet)">'+'app'+'</text></g>'
    +'<line x1="110" y1="75" x2="530" y2="75" style="stroke:var(--green);stroke-width:2;stroke-dasharray:6 4"/>'
    +'<text x="320" y="60" text-anchor="middle" style="font:700 8.5px var(--sans);fill:var(--green)">'+'end-to-end: app to app'+'</text>'
    +'<text x="320" y="108" text-anchor="middle" style="font:400 8px var(--sans);fill:var(--muted)">'+'ports decide which app the connection belongs to'+'</text>'
    +'</svg>';
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'L3 delivers a packet to the right <b>device</b>. But that target device runs many apps at once – which of them is the packet for? That is handled by <b>layer 4 – transport</b>. It takes care of <b>app-to-app delivery</b> (end-to-end) and tells them apart by <b>ports</b>. This happens with everything you do online – browsing the web, downloading a file, a video call, messaging or sending email. It has two main flavors: <b>TCP</b> (reliable, with a connection and acknowledgments) and <b>UDP</b> (fast, no guarantee). Where L3 handles the path between devices, L4 handles the <b>conversation between two specific apps</b> at the ends. The next two modules cover TCP and UDP in depth.'+'</p>'
    +'<div class="osi-stage">'+svg+'</div>'
    +'<div class="m1-cap"><span>'+'L4 delivers app-to-app (ports); choose TCP (reliable) or UDP (fast).'+'</span></div>'
    +abbrBox([['L4','the transport layer – app-to-app delivery, told apart by ports.'],['port','an app’s number on a device (80, 443, 53…).'],['TCP','reliable transport: opens a connection and resends what is lost (web, files, email).'],['UDP','fast transport with no guarantee: just sends, no waiting for acks (calls, video, games).']]);
}
// c2l5m3 — UDP: when speed beats reliability
function renderC2Udp(){
  const svg='<svg viewBox="0 0 640 150" width="100%" style="display:block">'
    +'<line x1="112" y1="75" x2="528" y2="75" style="stroke:var(--amber);stroke-width:1;stroke-dasharray:3 3;opacity:.4"/>'
    +[0,1,2,3].map(i=>'<rect y="66" width="26" height="18" rx="3" style="fill:var(--amber);fill-opacity:.85"><animate attributeName="x" from="112" to="510" dur="1.5s" begin="'+(i*0.37).toFixed(2)+'s" repeatCount="indefinite"/>'+(i===2?'<animate attributeName="opacity" values="1;1;0;0" keyTimes="0;0.48;0.55;1" dur="1.5s" begin="'+(i*0.37).toFixed(2)+'s" repeatCount="indefinite"/>':'')+'</rect>').join('')
    +'<text x="330" y="54" text-anchor="middle" style="font:700 7.5px var(--mono);fill:var(--red)">'+esc('✕ one gets lost')+'</text>'
    +'<g transform="translate(90,75)"><circle r="18" style="fill:var(--green);fill-opacity:.15;stroke:var(--green);stroke-width:1.5"/><text y="4" text-anchor="middle" style="font:700 9px var(--mono);fill:var(--green)">A</text></g>'
    +'<g transform="translate(550,75)"><circle r="18" style="fill:var(--violet);fill-opacity:.15;stroke:var(--violet);stroke-width:1.5"/><text y="4" text-anchor="middle" style="font:700 9px var(--mono);fill:var(--violet)">B</text></g>'
    +'<text x="320" y="118" text-anchor="middle" style="font:400 8.5px var(--sans);fill:var(--muted)">'+'fire and do not wait for an ack — a lost packet is not resent'+'</text>'
    +'</svg>';
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'<b>UDP</b> is the opposite of TCP: no connection setup, no acknowledgments, no reordering. It just <b>sends a packet and moves on</b> – if it is lost on the way, nothing is resent. That sounds worse, but for many things it is <b>better</b>: in a <b>live call, video or game</b> there is no point resending data that should have arrived long ago – the delay would hurt more than a single dropped frame. So UDP is fast and overhead-free. <b>DNS</b> uses it too (a short query and reply). How does an app’s developer decide? If it needs <b>certainty</b>, they pick TCP; if it needs <b>speed and freshness</b>, they pick UDP.'+'</p>'
    +'<div class="osi-stage">'+svg+'</div>'
    +'<div class="m1-cap"><span>'+'UDP: fire and forget. Fast and overhead-free — ideal for calls, video, games, DNS.'+'</span></div>'
    +abbrBox([['UDP','the fast protocol with no guarantee: send and do not wait for confirmation.'],['connectionless','UDP sets up no connection – each packet goes on its own.']]);
}
// c2l6m1 — TCP/IP model: 4 layers in practice
function renderC2TcpIp(){
  const osi=['7 Application','6 Presentation','5 Session','4 Transport','3 Network','2 Data link','1 Physical'];
  const tcp=[[0,3,'--lime','Application'],[3,1,'--green','Transport'],[4,1,'--blue','Internet'],[5,2,'--amber','Link']];
  const RH=18,RY=30;
  const osiMid=i=>RY+i*RH+(RH-3)/2, tcpMid=b=>RY+b[0]*RH+(b[1]*RH-3)/2, rowToTcp=[0,0,0,1,2,3,3];
  let svg='<svg viewBox="0 0 640 '+(RY+7*RH+20)+'" width="100%" style="display:block">'
    +'<defs><marker id="tcparrow" markerWidth="7" markerHeight="7" refX="5.5" refY="3" orient="auto"><path d="M0 0L6 3L0 6Z" fill="context-stroke"/></marker></defs>'
    +'<text x="150" y="20" text-anchor="middle" style="font:700 9px var(--mono);fill:var(--cyan)">ISO/OSI (7)</text>'
    +'<text x="460" y="20" text-anchor="middle" style="font:700 9px var(--mono);fill:var(--cyan)">TCP/IP (4)</text>';
  osi.forEach((o,i)=>{const y=RY+i*RH;svg+='<rect x="40" y="'+y+'" width="220" height="'+(RH-3)+'" rx="3" style="fill:var(--muted);fill-opacity:.10;stroke:var(--muted);stroke-width:.8"/><text x="50" y="'+(y+12)+'" style="font:600 9px var(--sans);fill:var(--txt)">'+esc(o)+'</text>';});
  for(let i=0;i<7;i++){const b=tcp[rowToTcp[i]];svg+='<line x1="262" y1="'+osiMid(i)+'" x2="356" y2="'+tcpMid(b)+'" marker-end="url(#tcparrow)" style="stroke:var('+b[2]+');stroke-width:1.4;opacity:.7"/>';}
  tcp.forEach(t=>{const y=RY+t[0]*RH,h=t[1]*RH-3;svg+='<rect x="360" y="'+y+'" width="220" height="'+h+'" rx="4" style="fill:var('+t[2]+');fill-opacity:.16;stroke:var('+t[2]+');stroke-width:1.3"/><text x="470" y="'+(y+h/2+4)+'" text-anchor="middle" style="font:700 9.5px var(--sans);fill:var('+t[2]+')">'+esc(t[3])+'</text>';});
  svg+='</svg>';
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'ISO/OSI has 7 layers and is a great <b>map for understanding</b> how a network works. But the internet actually runs on the simpler <b>TCP/IP model</b> with just <b>4 layers</b> – it merges some OSI layers. <b>Application</b> (merges OSI 5–7: app, format, session) → <b>Transport</b> (= OSI 4: TCP/UDP) → <b>Internet</b> (= OSI 3: IP, routing) → <b>Link</b> (merges OSI 1–2: frame + signal). Why know both? OSI is better for <b>learning and troubleshooting</b> ("which layer is it stuck at?"), TCP/IP describes <b>how it really is</b>. When you hear "an L3 problem" or "the application layer", you now know what people mean.'+'</p>'
    +'<div class="osi-stage">'+svg+'</div>'
    +'<div class="m1-cap"><span>'+'TCP/IP = 4 layers (OSI merged). OSI for learning and debugging, TCP/IP is what actually runs.'+'</span></div>'
    +abbrBox([['TCP/IP','the 4-layer model the internet actually runs on (application, transport, internet, link).']]);
}
// c2l6m2 — Application layer: where DNS, HTTP and TLS sit
function renderC2AppLayer(){
  const svg='<svg viewBox="0 0 640 150" width="100%" style="display:block">'
    +'<rect x="120" y="30" width="400" height="40" rx="8" style="fill:var(--lime);fill-opacity:.12;stroke:var(--lime);stroke-width:1.4"/><text x="320" y="55" text-anchor="middle" style="font:700 10px var(--sans);fill:var(--lime)">'+'APPLICATION LAYER'+'</text>'
    +['DNS','HTTP','HTTPS','TLS','DHCP'].map((p,i)=>'<g transform="translate('+(110+i*105)+',105)"><rect x="-40" y="-15" width="80" height="30" rx="6" style="fill:var(--panel);stroke:var(--lime);stroke-width:1.1"/><text y="4" text-anchor="middle" style="font:700 9px var(--mono);fill:var(--lime)">'+p+'</text></g>').join('')
    +'</svg>';
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'At the very top is the <b>application layer</b> – what the app you use (browser, email) actually works with. This is where the protocols you already know from the How networks work course "live": <b>DNS</b> (name resolution), <b>HTTP/HTTPS</b> (the web), <b>TLS</b> (encryption), <b>DHCP</b> (address assignment). In the TCP/IP model everything from OSI layers 5–7 lands here at once. Important: the application layer <b>need not care</b> whether you are on Wi-Fi or a cable, what your IP is or how TCP is set up – the lower layers did that for it. That is why a web developer can write an app and never think about how the data physically flows.'+'</p>'
    +'<div class="osi-stage">'+svg+'</div>'
    +'<div class="m1-cap"><span>'+'The application layer = DNS, HTTP(S), TLS, DHCP. It need not care how data physically flows.'+'</span></div>';
}
// c2lspm1 — L5 session: establish and maintain a connection
function renderC2Session(){
  const node=(x,lbl)=>'<g transform="translate('+x+',61)"><circle r="16" style="fill:var(--green);fill-opacity:.15;stroke:var(--green);stroke-width:1.5"/><text y="3" text-anchor="middle" style="font:700 9px var(--mono);fill:var(--green)">'+lbl+'</text></g>';
  const seg=(x1,x2,col,num,lbl)=>'<rect x="'+x1+'" y="54" width="'+(x2-x1)+'" height="14" rx="3" style="fill:var('+col+');fill-opacity:.22;stroke:var('+col+');stroke-width:1.2"/><text x="'+((x1+x2)/2)+'" y="44" text-anchor="middle" style="font:700 8px var(--sans);fill:var('+col+')">'+num+'</text><text x="'+((x1+x2)/2)+'" y="84" text-anchor="middle" style="font:400 7.5px var(--sans);fill:var(--muted)">'+lbl+'</text>';
  const svg='<svg viewBox="0 0 640 150" width="100%" style="display:block">'
    +node(40,'A')+node(600,'B')
    +seg(64,212,'--green','1 Set up','"hi, we are talking"')
    +seg(212,428,'--cyan','2 Keep','connection runs, keeps order')
    +seg(428,576,'--violet','3 Close','hangs up cleanly')
    +'<text x="320" y="116" text-anchor="middle" style="font:400 8.5px var(--sans);fill:var(--muted)">'+'like a phone call: dial → talk → hang up'+'</text>'
    +'</svg>';
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'Right above the transport layer sits <b>layer 5 – session</b>. It is in charge of a <b>session</b> – a continuous "conversation" between two apps. It does three things: it <b>sets up</b> the connection (both sides agree they are talking), then <b>maintains</b> it for the whole exchange (keeping order and continuity), and at the end <b>closes it cleanly</b>. Picture a <b>phone call</b>: you dial, the other side picks up, you talk for a while, then you hang up. In practice this is your <b>login</b> that "holds" until you log out, or <b>resuming an interrupted download</b> from where it stopped. Unlike the one-off <b>TCP handshake</b> (a transport agreement about a single connection), a session is an <b>application conversation</b> that can outlive several TCP connections – a login happily runs across dozens of separate requests. In the TCP/IP model the session layer has no place of its own – the <b>application itself</b> handles it (a web page manages your login session).'+'</p>'
    +'<div class="osi-stage">'+svg+'</div>'
    +'<div class="m1-cap"><span>'+'L5 = session: set up → keep → close (like a phone call). In TCP/IP the application handles it.'+'</span></div>'
    +abbrBox([['session layer (L5)','sets up, maintains and closes a session (conversation) between two apps.'],['session','a continuous "conversation" between two apps (e.g. a login until you log out).']]);
}
// c2lspm2 — L6 presentation: the form of data (encoding, compression, encryption)
function renderC2Present(){
  const row=(y,col,title,desc)=>'<circle cx="42" cy="'+y+'" r="5" style="fill:var('+col+')"/><text x="60" y="'+(y+1)+'" style="font:700 9.5px var(--sans);fill:var('+col+')">'+title+'</text><text x="60" y="'+(y+16)+'" style="font:400 8.5px var(--sans);fill:var(--muted)">'+desc+'</text>';
  const svg='<svg viewBox="0 0 640 150" width="100%" style="display:block">'
    +row(30,'--lime','Encoding','letters → bytes, so everyone reads the same (e.g. UTF-8)')
    +row(74,'--cyan','Compression','shrinks the data so it takes less and travels faster (zip, video codec)')
    +row(118,'--amber','Encryption','locks the content – only the two ends read it (TLS, the "padlock")')
    +'</svg>';
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'<b>Layer 6 – presentation</b> handles the <b>form of the data</b> – so both sides understand it the same way. It does three things. <b>Encoding</b>: it turns letters into <b>bytes</b> (groups of 8 bits – those ones and zeros from the first lesson) and back, so an "á" or an emoji looks the same everywhere – this rule is e.g. <b>UTF-8</b> (an agreement on which number means which character). <b>Compression</b>: it shrinks the data so it takes less space and travels faster (zip, image and video codecs). <b>Encryption</b>: it <b>locks</b> the content, so only the two ends can read it on the way – this is exactly what <b>TLS</b> does, the "padlock" in your browser you know from the first course. In the TCP/IP model the presentation layer has no place of its own either – the <b>application itself</b> takes care of it (the browser picks the encoding and sets up TLS).'+'</p>'
    +'<div class="osi-stage">'+svg+'</div>'
    +'<div class="m1-cap"><span>'+'L6 = data form: encoding (UTF-8), compression, encryption (TLS). In TCP/IP the application handles it.'+'</span></div>'
    +abbrBox([['presentation layer (L6)','handles the form of the data – encoding, compression and encryption.'],['byte','8 bits together – the basic unit of data; one character is often one byte.'],['UTF-8','a common agreement for encoding characters (letters, emoji) into bytes.']]);
}
// c2l6m3 — How to read documentation and certifications
function renderC2Docs(){
  const svg='<svg viewBox="0 0 640 140" width="100%" style="display:block">'
    +['L2 · switch, VLAN','L3 · router, IP, routing, NAT','L4 · TCP, port, PAT','L7 · HTTP, TLS'].map((s,i)=>'<g transform="translate(60,'+(28+i*26)+')"><circle r="4" style="fill:var(--cyan)"/><text x="16" y="4" style="font:600 10px var(--mono);fill:var(--txt)">'+esc(s)+'</text></g>').join('')
    +'<text x="320" y="128" text-anchor="middle" style="font:400 8.5px var(--sans);fill:var(--muted)">'+'"at which layer?" is the key to reading docs and devices'+'</text>'
    +'</svg>';
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'Why know the layers at all? Because you will see them everywhere. Device docs, manuals, job ads and <b>certifications</b> (CompTIA Network+, Cisco CCNA…) are built on layers. When you read "an L3 device", "works at layer 2" or "an L7 firewall", you instantly know what it means: L2 = MAC/switch/VLAN, L3 = IP/router/routing/NAT, L4 = TCP/port/PAT, L7 = app/HTTP/TLS. Layers are the <b>shared language</b> of the whole field: "which layer is it stuck at?" is the first troubleshooting question, and "what layer does it work at?" the first question about any device. This course gave you exactly that map.'+'</p>'
    +'<div class="osi-stage">'+svg+'</div>'
    +'<div class="m1-cap"><span>'+'Layers are the field’s shared language — docs, certifications and troubleshooting.'+'</span></div>';
}
// c2l7m1 — Why a firewall does not belong to a single layer
function renderC2FwLayers(){
  const svg='<svg viewBox="0 0 640 150" width="100%" style="display:block">'
    +'<g transform="translate(320,75)"><path d="M0 -42c4 8-2 10 2 16 3 4 8 2 8 10a13 13 0 11-26 0c0-6 4-6 4-12 0-4 6-6 11-14z" style="fill:var(--red);fill-opacity:.7"/></g>'
    +[['L3 · IP',-1],['L4 · port',-0.33],['L7 · content',0.33]].map((s,i)=>'<text x="'+(160+i*150)+'" y="135" text-anchor="middle" style="font:700 8.5px var(--mono);fill:var(--amber)">'+esc(s[0])+'</text>').join('')
    +'</svg>';
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'A <b>firewall</b> is a security gateway between networks – it lets only allowed traffic through and blocks the rest. Some devices do not fit a single layer, and the firewall is the flagship: it decides using information from <b>several layers at once</b>. It can filter by <b>L3</b> (source/destination IP), by <b>L4</b> (port and protocol – "allow 443, block 23"), and the more advanced ones by <b>L7</b> too (the content itself – "block this attack in HTTP"). So it makes no sense to ask "what layer is the firewall at" – it depends on what it is doing. That is also why we left the firewall until here, at the end of the layers: now that you know L3, L4 and L7, its behavior makes sense. The next two modules show how it actually decides.'+'</p>'
    +'<div class="osi-stage">'+svg+'</div>'
    +'<div class="m1-cap"><span>'+'A firewall decides across layers: IP (L3), port (L4) and content (L7).'+'</span></div>'
    +abbrBox([['firewall','guards traffic between networks/zones and permits or blocks it by rules (L3–L7).']]);
}
// c2l7m2 — Packet filter and stateful firewall
function renderC2FwStateful(){
  const svg='<svg id="fwstsvg" viewBox="0 0 640 210" width="100%" style="display:block">'
    +'<line x1="110" y1="60" x2="292" y2="60" style="stroke:var(--line2);stroke-width:1.6"/>'
    +'<line x1="348" y1="60" x2="508" y2="60" style="stroke:var(--line2);stroke-width:1.6;stroke-dasharray:4 4"/>'
    +'<g id="fwstglow"></g>'
    +'<g transform="translate(90,60)"><circle r="18" style="fill:var(--green);fill-opacity:.15;stroke:var(--green);stroke-width:1.5"/><text y="4" text-anchor="middle" style="font:700 8px var(--sans);fill:var(--green)">'+'inside'+'</text></g>'
    +'<g transform="translate(320,60)"><rect x="-26" y="-24" width="52" height="48" rx="8" style="fill:var(--red);fill-opacity:.14;stroke:var(--red);stroke-width:1.6"/><text y="4" text-anchor="middle" style="font:700 8px var(--sans);fill:var(--red)">FW</text></g>'
    +'<g transform="translate(550,60)"><ellipse rx="40" ry="24" style="fill:var(--blue);fill-opacity:.10;stroke:var(--blue);stroke-width:1.3"/><text y="4" text-anchor="middle" style="font:700 8px var(--mono);fill:var(--blue)">'+'internet'+'</text></g>'
    +'<rect x="185" y="118" width="270" height="52" rx="7" style="fill:var(--panel);stroke:var(--line2);stroke-width:1.2"/>'
    +'<text x="200" y="136" style="font:700 8px var(--sans);fill:var(--muted)">'+'connection table (connection memory)'+'</text>'
    +'<g id="fwstdyn"></g></svg>';
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'A firewall lets through only what it should and blocks the rest – <b>unsolicited or dangerous traffic from outside</b>. But how does it decide? The simplest is a <b>packet filter</b>: it judges each packet <b>on its own</b> by rules (source, destination, protocol, port). It works, but knows nothing about <b>context</b> – the reply to your request is just a foreign packet from outside to it. That is why a <b>stateful firewall</b> is used: it <b>remembers established connections</b>. Its <b>connection table</b> only <b>permits</b> the return – unlike the NAT table (Lesson L3), which also <b>translates</b> addresses and ports. Step through how it does that. In the simulator, return traffic is stateful as well.'+'</p>'
    +'<div class="osi-stage">'+svg+'</div>'
    +'<div class="m1-cap" id="fwstcap"></div>'
    +courseStepControls('fwst')
    +abbrBox([['packet filter','a firewall that judges each packet on its own by rules.'],['stateful firewall','remembers established connections and lets the replies back automatically.']]);
}
function mountC2FwStateful(){
  const row=(txt,col)=>'<text x="200" y="156" style="font:600 9px var(--mono);fill:var('+col+')">'+esc(txt)+'</text>';
  const rec=row('10.0.0.5:51000 → 198.51.100.1:443 ✓','--green');
  const STEPS=[
    {glow:csGlow(90,60,'--green',22), dyn:csPkt('M110 60 L292 60','--green')+'<text x="200" y="46" text-anchor="middle" style="font:700 8px var(--sans);fill:var(--green)">'+esc('SYN out (connection request)')+'</text>'+row('— empty so far —','--muted'), cap:'The internal PC opens a website: it sends a <b>SYN out</b> (a connection request). The rules <b>allow</b> it outbound – the packet reaches the firewall.'},
    {glow:csGlow(320,60,'--red',30), dyn:csPkt('M348 60 L508 60','--green')+rec, cap:'The firewall passes the packet on – and crucially <b>writes the connection into its connection table</b>: who, from where, to where and on which port. From now on it knows <b>you asked for this connection</b>.'},
    {glow:csGlow(320,60,'--cyan',30)+csGlow(90,60,'--green',22), dyn:csPkt('M508 60 L348 60','--cyan')+csPkt('M292 60 L110 60','--cyan')+rec+'<text x="430" y="46" text-anchor="middle" style="font:700 8px var(--sans);fill:var(--cyan)">'+esc('reply = matches the record')+'</text>', cap:'A <b>reply from outside</b> arrives. A packet filter would drop it without an inbound rule – but the stateful firewall <b>checks it against the table</b>: it matches your connection → it <b>passes</b> all the way to the PC.'},
    {glow:csGlow(320,60,'--red',30), dyn:csPkt('M508 60 L348 60','--red')+rec+'<text x="430" y="46" text-anchor="middle" style="font:700 9px var(--sans);fill:var(--red)">'+esc('foreign SYN → no record → ✕')+'</text>', cap:'And now an <b>unsolicited SYN from outside</b> (someone probing in). The firewall searches the table – <b>no record</b>, nobody asked for it → the packet is <b>dropped</b>. You only write rules "outbound" and the state guards the return.'}
  ];
  function show(i){const g=$('fwstglow');if(g)g.innerHTML=STEPS[i].glow||'';const d=$('fwstdyn');if(d)d.innerHTML=STEPS[i].dyn||'';const c=$('fwstcap');if(c)c.innerHTML='<span>'+STEPS[i].cap+'</span>';}
  courseStepper('fwst',STEPS.length,show);
}
// c2l7m3 — Zones: inside, outside, DMZ
function renderC2Zones(){
  const zone=(x,c,lbl,sub)=>'<g transform="translate('+x+',80)"><rect x="-70" y="-34" width="140" height="68" rx="9" style="fill:var('+c+');fill-opacity:.10;stroke:var('+c+');stroke-width:1.4"/><text y="-8" text-anchor="middle" style="font:700 10px var(--sans);fill:var('+c+')">'+esc(lbl)+'</text><text y="10" text-anchor="middle" style="font:400 7.5px var(--sans);fill:var(--muted)">'+esc(sub)+'</text></g>';
  const svg='<svg viewBox="0 0 640 160" width="100%" style="display:block">'
    +zone(110,'--green','inside','internal · trusted')
    +zone(320,'--amber','DMZ','public servers')
    +zone(530,'--red','outside','internet · untrusted')
    +'</svg>';
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'So you do not write rules per cable, a firewall groups interfaces into <b>zones</b> by <b>trust level</b>. The three classic ones: <b>inside</b> (your internal network – trusted), <b>outside</b> (the internet – untrusted) and <b>DMZ</b> (demilitarized zone – where you put <b>public servers</b>, e.g. a web server). <i>(In practice there are usually more – covered in detail in the Network security course.)</i> The logic is simple: from the internet you may reach <b>only the DMZ</b> and only on allowed ports (443); nobody reaches <b>inside</b> from outside. And crucially: even if an attacker compromises a server in the DMZ, <b>they cannot get into the internal network from there</b> – the DMZ is a buffer. You try exactly this in the task "Expose the web, protect the internal network". Zones are the practical payoff of everything the course taught: layers, addresses, ports and trust together.'+'</p>'
    +'<div class="osi-stage">'+svg+'</div>'
    +'<div class="m1-cap"><span>'+'Zones by trust: inside (internal), DMZ (public servers), outside (internet).'+'</span></div>'
    +abbrBox([['zone','a group of interfaces with the same trust level (inside, DMZ, outside).'],['DMZ','a separate zone for public servers – reachable from the internet, not into the internal network.']]);
}
// c2l8m1 — Each layer adds its own header
function renderC2EncapIntro(){
  const lay=[['data','--lime',0],['+TCP','--green',1],['+IP','--blue',2],['+MAC … FCS','--amber',3]];
  const svg='<svg viewBox="0 0 640 160" width="100%" style="display:block">'
    +lay.map((l,i)=>{const w=120+i*90,x=320-w/2;return '<g transform="translate(0,'+(28+i*30)+')"><rect x="'+x+'" y="0" width="'+w+'" height="24" rx="4" style="fill:var('+l[1]+');fill-opacity:.16;stroke:var('+l[1]+');stroke-width:1.3"/><text x="320" y="16" text-anchor="middle" style="font:700 9px var(--mono);fill:var('+l[1]+')">'+esc(l[0])+'</text></g>';}).join('')
    +'<text x="320" y="152" text-anchor="middle" style="font:400 8.5px var(--sans);fill:var(--muted)">'+'going down, each layer adds its own header — an envelope in an envelope'+'</text>'
    +'</svg>';
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'Now you know what each layer does. The last question: how do the layers <b>work together</b> on one piece of sent data? The answer is <b>encapsulation</b> – "wrapping". When you send something, data goes <b>down</b> the stack and each layer wraps <b>its own header</b> around it: transport adds ports (a <b>segment</b>), network adds IP addresses (a <b>packet</b>), data-link adds MAC and a checksum (a <b>frame</b>), physical sends it as <b>bits</b>. It is like <b>an envelope inside an envelope</b>. At the receiver the whole thing is <b>unwrapped</b> in reverse – each layer reads and peels its own header and passes the rest up. In the next module you step through it as an animation at both sender and receiver.'+'</p>'
    +'<div class="osi-stage">'+svg+'</div>'
    +'<div class="m1-cap"><span>'+'Encapsulation: going down, each layer adds a header (segment → packet → frame → bits).'+'</span></div>'
    +abbrBox([['encapsulation','each layer wraps its header around the data from the layer above (an envelope in an envelope).'],['PDU','the bundle name per layer: data → segment (L4) → packet (L3) → frame (L2) → bits (L1).']]);
}
const COURSE_2_FINAL_EXTRA_DEF=[
  { q:'What layer does a switch work at, and a router?',
    opts:['switch at L2 (by MAC), router at L3 (by IP)','both at L3 – both decide by the destination IP','switch at L3 (by IP), router at L2 (by MAC)'],
    correct:0, why:'A switch forwards frames within a network by MAC (L2); a router routes between networks by IP (L3).' },
  { q:'What is the process called where each layer adds its own header to the data before sending?',
    opts:['encapsulation','fragmentation','encryption'],
    correct:0, why:'When sending, each lower layer wraps its own header (segment → packet → frame → bits) – this is called encapsulation; the other end unwraps it again (decapsulation).' },
  { q:'A firewall that decides by application and content (e.g. blocks a specific HTTP request) works at which layer?',
    opts:['application (L7)','physical (L1)','data link (L2)'],
    correct:0, why:'Deciding by application content (HTTP, TLS) is L7 work; a simpler firewall filters at L3/L4 by IP/ports.' }
];
__regCourse(2,COURSE_2_DEF,COURSE_2_QUIZZES_DEF,COURSE_2_FINAL_EXTRA_DEF);
