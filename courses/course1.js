/* course1.js — Course 1 content (split out of course.js; loaded on demand via course-core.js) */
/* ============================================================
   LESSON 1 — Why networks exist and how they work
   ============================================================ */
// MOD 1.1 — Why networks exist (static, no animation)
function renderL1M1(){
  const dev=(x,y,c,lbl)=>'<rect x="'+(x-26)+'" y="'+(y-16)+'" width="52" height="32" rx="7" style="fill:var('+c+');fill-opacity:.14;stroke:var('+c+');stroke-width:1.4"/><text x="'+x+'" y="'+(y+4)+'" text-anchor="middle" style="font:700 8.5px var(--sans);fill:var('+c+')">'+esc(lbl)+'</text>';
  const svg='<svg viewBox="0 0 640 235" width="100%" style="display:block">'
    +'<line x1="320" y1="34" x2="320" y2="214" style="stroke:var(--line);stroke-width:1;stroke-dasharray:3 4"/>'
    +'<text x="160" y="26" text-anchor="middle" style="font:700 10px var(--mono);fill:var(--muted)">'+'BEFORE: each device an island'+'</text>'
    +'<text x="480" y="26" text-anchor="middle" style="font:700 10px var(--mono);fill:var(--cyan)">'+'NETWORK: connected & sharing'+'</text>'
    +'<g id="l1m1-0">'+dev(110,80,'--green','PC')+dev(210,140,'--green','printer')+dev(110,180,'--green','PC')
      +'<text x="160" y="212" text-anchor="middle" style="font:400 8.5px var(--sans);fill:var(--muted)">'+'data on a floppy, printer for one PC'+'</text></g>'
    +'<g id="l1m1-1"><line x1="410" y1="120" x2="560" y2="120" style="stroke:var(--cyan);stroke-width:2"/>'
      +'<line x1="430" y1="120" x2="430" y2="86" style="stroke:var(--cyan);stroke-width:1.5"/><line x1="485" y1="120" x2="485" y2="158" style="stroke:var(--cyan);stroke-width:1.5"/><line x1="540" y1="120" x2="540" y2="86" style="stroke:var(--cyan);stroke-width:1.5"/>'
      +dev(430,72,'--green','PC')+dev(485,174,'--green','printer')+dev(540,72,'--green','TV')+'</g>'
    +'<g id="l1m1-2"><circle cx="467" cy="120" r="6" style="fill:var(--cyan)"/>'
      +'<text x="485" y="212" text-anchor="middle" style="font:400 8.5px var(--sans);fill:var(--muted)">'+'shares files, the printer and the connection'+'</text></g>'
    +'</svg>';
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'Devices used to be <b>islands</b>: you carried a file on a floppy disk and a printer served just one computer. A <b>network</b> is <b>two or more devices that can exchange data</b>. It solves <b>sharing</b> – of files, a printer, one internet connection, and messages. Today almost everything is networked: your phone, laptop, TV, game console, smart speaker. The principle is always the same – connect devices so they can talk and share.'+'</p>'
    +'<div class="osi-stage">'+svg+'</div>'
    +'<div class="m1-cap"><span>'+'Connecting the isolated islands turns them into a network that shares.'+'</span></div>';
}
// MOD 1.2 — How you send a message (reuse the packet/envelope animation; step-through only)
function renderL1M2(){
  const SX=70,DX=570,WY=150;
  const envInner='<rect x="-15" y="-10" width="30" height="20" rx="3" style="fill:var(--panel);stroke:var(--cyan);stroke-width:1.3"/><path d="M-15 -10 L0 1 L15 -10" style="fill:none;stroke:var(--cyan);stroke-width:1"/>';
  const frame='<svg id="pksvg" viewBox="0 0 640 235" width="100%" style="display:block">'
    +'<text x="'+SX+'" y="34" text-anchor="middle" style="font:700 10.5px var(--mono);fill:var(--cyan)">'+'SENDER'+'</text>'
    +'<text x="'+DX+'" y="34" text-anchor="middle" style="font:700 10.5px var(--mono);fill:var(--cyan)">'+'RECEIVER'+'</text>'
    +'<line x1="'+(SX+30)+'" y1="'+WY+'" x2="'+(DX-30)+'" y2="'+WY+'" style="stroke:var(--line);stroke-width:2;stroke-dasharray:4 4"/>'
    +'<rect x="'+(SX-26)+'" y="58" width="52" height="40" rx="7" style="fill:var(--green);fill-opacity:.14;stroke:var(--green);stroke-width:1.4"/>'
    +'<rect x="'+(DX-26)+'" y="58" width="52" height="40" rx="7" style="fill:var(--green);fill-opacity:.14;stroke:var(--green);stroke-width:1.4"/>'
    +'<g id="pkdyn"></g>'
    +[0,1,2].map(i=>'<g id="pkp'+i+'" class="crs-move" transform="translate('+SX+','+WY+')" opacity="0">'+envInner+'<text x="0" y="7" text-anchor="middle" style="font:700 9px var(--mono);fill:var(--cyan)">'+(i+1)+'</text></g>').join('')
    +'</svg>';
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'How does a file actually travel across the network? It is not sent as one big blob. It is split into many small chunks – <b>packets</b>. Each packet is like a letter: the <b>content</b> (your data) inside an envelope marked <b>to</b> and <b>from</b>. The network does not care what is inside – it reads the address on the envelope and delivers accordingly. Careful: “does not care” is not “cannot see” – the envelope is not sealed, and whoever sits along the path can read the contents. What you can do about that comes in the last lesson. At the destination the packets are put back together in the right order. Step through it (‹ / ›).'+'</p>'
    +'<div class="osi-stage" id="pkstage">'+frame+'</div>'
    +'<div class="m1-cap" id="pkcap"></div>'
    +courseStepControls('pk')
    +abbrBox([['packet','a small chunk of data with an address; large data is sent packet by packet.'],['encapsulation','wrapping data with addresses and headers; covered in detail in the next course.']]);
}
function mountL1M2(){
  const SX=70,DX=570,WY=150;
  const env=(x,y,n,big)=>{const w=big?42:28,h=big?30:19;return '<g transform="translate('+x+','+y+')"><rect x="'+(-w/2)+'" y="'+(-h/2)+'" width="'+w+'" height="'+h+'" rx="3" style="fill:var(--panel);stroke:var(--cyan);stroke-width:1.3"/><path d="M'+(-w/2)+' '+(-h/2)+' L0 1 L'+(w/2)+' '+(-h/2)+'" style="fill:none;stroke:var(--cyan);stroke-width:1"/><text x="0" y="'+(h/2-3)+'" text-anchor="middle" style="font:700 '+(big?11:9)+'px var(--mono);fill:var(--cyan)">'+n+'</text></g>';};
  const file=(x)=>'<rect x="'+(x-16)+'" y="'+(WY-22)+'" width="32" height="42" rx="4" style="fill:var(--blue);fill-opacity:.16;stroke:var(--blue);stroke-width:1.5"/><text x="'+x+'" y="'+(WY+3)+'" text-anchor="middle" style="font:700 8.5px var(--sans);fill:var(--blue)">'+'file'+'</text>';
  // per-step packet positions [x,y,opacity] for packets 1,2,3 (the persistent #pkp0..2 glide between these)
  const POS=[
    [[SX,WY,0],[SX,WY,0],[SX,WY,0]],                          // 0 file only
    [[SX,WY-22,1],[SX,WY,1],[SX,WY+22,1]],                    // 1 split at sender
    [[SX,WY-22,.2],[SX,WY,.2],[SX,WY+22,.2]],                 // 2 dim while detail shows
    [[210,WY-16,1],[345,WY+13,1],[160,WY-2,1]],              // 3 scattered in transit
    [[DX,WY-22,1],[DX,WY,1],[DX,WY+22,1]],                    // 4 lined up at receiver
    [[DX,WY,0],[DX,WY,0],[DX,WY,0]]                           // 5 reassembled into file
  ];
  const STEPS=[
    {cap:'This is your file – say a photo. How do we send it over the network?'},
    {cap:'It is not sent in one piece. It is chopped into small chunks – <b>packets</b>. Each knows where it belongs in the message.'},
    {cap:'Each packet is like a letter: the <b>content</b> inside and a <b>TO</b> and <b>FROM</b> on the envelope (addresses). The network reads only the envelope, not the content.'},
    {cap:'The packets travel across the network <b>separately</b> – they may take different routes and arrive out of order (for simplicity the picture draws just one path).'},
    {cap:'At the receiver they are put back into the <b>right order</b> – and you have the whole file back.'},
    {cap:'This wrapping of data with addresses is the start of <b>encapsulation</b> – more on it in the next course.'}
  ];
  function show(idx){
    for(let i=0;i<3;i++){const g=$('pkp'+i);if(g){const p=POS[idx][i];g.setAttribute('transform','translate('+p[0]+','+p[1]+')');g.style.opacity=p[2];}}
    const d=$('pkdyn');let s='';
    if(idx===0)s=file(SX);
    else if(idx===2)s=env(320,WY,'2',true)+'<text x="320" y="'+(WY-27)+'" text-anchor="middle" style="font:700 8.5px var(--mono);fill:var(--muted)">'+'TO → B'+'</text><text x="320" y="'+(WY+36)+'" text-anchor="middle" style="font:700 8.5px var(--mono);fill:var(--muted)">'+'FROM A'+'</text>';
    else if(idx===5)s=file(DX)+'<text x="'+DX+'" y="'+(WY-30)+'" text-anchor="middle" style="font:700 14px var(--sans);fill:var(--green)">✓</text>';
    if(d)d.innerHTML=s;
    const cap=$('pkcap');if(cap)cap.innerHTML='<span>'+STEPS[idx].cap+'</span>';
  }
  courseStepper('pk',STEPS.length,show);
}
// MOD 1.3 — Router and the internet (new step-through animation)
function renderL1M3(){
  const Y=128;
  const node=(x,c,lbl,sub)=>'<rect x="'+(x-30)+'" y="'+(Y-22)+'" width="60" height="44" rx="9" style="fill:var('+c+');fill-opacity:.14;stroke:var('+c+');stroke-width:1.5"/><text x="'+x+'" y="'+(Y-2)+'" text-anchor="middle" style="font:700 9.5px var(--sans);fill:var('+c+')">'+esc(lbl)+'</text>'+(sub?'<text x="'+x+'" y="'+(Y+13)+'" text-anchor="middle" style="font:400 7.5px var(--sans);fill:var(--muted)">'+esc(sub)+'</text>':'');
  const svg='<svg id="rtsvg" viewBox="0 0 640 220" width="100%" style="display:block">'
    +'<line x1="100" y1="'+Y+'" x2="540" y2="'+Y+'" style="stroke:var(--line);stroke-width:2;stroke-dasharray:4 4"/>'
    +'<ellipse cx="360" cy="'+Y+'" rx="80" ry="38" style="fill:var(--blue);fill-opacity:.10;stroke:var(--blue);stroke-width:1.3"/>'
    +'<text x="360" y="'+(Y-25)+'" text-anchor="middle" style="font:700 9px var(--mono);fill:var(--blue)">'+'internet'+'</text>'
    +'<circle cx="322" cy="'+Y+'" r="6.5" style="fill:none;stroke:var(--blue);stroke-width:1.4"/><circle cx="360" cy="'+(Y+13)+'" r="6.5" style="fill:none;stroke:var(--blue);stroke-width:1.4"/><circle cx="398" cy="'+Y+'" r="6.5" style="fill:none;stroke:var(--blue);stroke-width:1.4"/>'
    +'<text x="360" y="'+(Y+32)+'" text-anchor="middle" style="font:400 7.5px var(--sans);fill:var(--muted)">'+'routers pass the packet on'+'</text>'
    +node(70,'--green','PC','at home')
    +node(190,'--cyan','router','from your provider')
    +node(580,'--violet','server','e.g. a website')
    +'<g id="rtdyn"></g>'
    +'<g id="rtpkt" class="crs-move" transform="translate(70,'+Y+')" opacity="0"><rect id="rtbox" x="-26" y="-12" width="52" height="24" rx="7" style="fill:var(--panel);stroke:var(--amber);stroke-width:1.6;filter:drop-shadow(0 2px 6px rgba(0,0,0,.55))"/><text id="rtlab" x="0" y="4" text-anchor="middle" style="font:700 10.5px var(--mono);fill:var(--amber)"></text></g>'
    +'</svg>';
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'That box from your provider at home is the <b>router</b>. It does several things, but its main job is one: decide what stays home (your <b>LAN</b>) and what goes <b>out to the internet</b> (the <b>WAN</b>). And how does a packet reach a remote server? <b>One router hands it to the next</b>, and that one to the next – like changing from train to train. The <b>internet</b> is exactly that: a network of networks, routers worldwide linked together, owned as a whole by no one. Step through the packet’s journey.'+'</p>'
    +'<div class="osi-stage">'+svg+'</div>'
    +'<div class="m1-cap" id="rtcap"></div>'
    +courseStepControls('rt')
    +abbrBox([['router','the box that links your network to the internet and decides which way a packet goes.'],['LAN','Local Area Network – your local network (home, office); everything on your side of the router.'],['WAN','Wide Area Network – the wide network "outside", beyond the router toward the provider and the internet.'],['internet','a network of networks – routers worldwide linked together; no one owns the whole.'],['server','a computer that provides a service (web, email, files) and answers requests.']]);
}
function mountL1M3(){
  const Y=128;
  const STEPS=[
    {x:70, col:'--amber', lab:'data', cap:'Your <b>PC</b> at home wants to open a website – it runs on a remote <b>server</b>.'},
    {x:190, col:'--amber', lab:'data', cap:'The packet first goes to the <b>router</b>. It decides: stay home, or go out? This one heads out to the internet.'},
    {x:360, col:'--amber', lab:'data', cap:'On the internet, <b>router after router</b> hands the packet on – like a relay baton – toward the destination.'},
    {x:580, col:'--green', lab:'✓', cap:'The packet reaches the <b>server</b>. It handles the request and sends a <b>reply</b> back.'},
    {x:70, col:'--green', lab:'reply', cap:'The reply travels back through the network to you – and the page appears. The whole thing takes a fraction of a second.'}
  ];
  function show(i){const s=STEPS[i],g=$('rtpkt'),box=$('rtbox'),lab=$('rtlab');
    if(g&&box&&lab){const w=Math.max(42,s.lab.length*8+22);
      box.setAttribute('x',-w/2);box.setAttribute('width',w);box.style.stroke='var('+s.col+')';
      lab.style.fill='var('+s.col+')';lab.textContent=s.lab;
      g.style.opacity='1';g.setAttribute('transform','translate('+s.x+','+Y+')');}
    const d=$('rtdyn');if(d)d.innerHTML=(i===2)?(csGlow(322,128,'--amber',12)+csGlow(360,141,'--amber',10)+csGlow(398,128,'--amber',12)):'';
    const c=$('rtcap');if(c)c.innerHTML='<span>'+STEPS[i].cap+'</span>';}
  courseStepper('rt',STEPS.length,show);
}
/* ============================================================
   LESSON 2 — How devices find each other (addressing; BEFORE OSI, so no L2/L3 jargon)
   ============================================================ */
// MOD 2.2 — IP address (reuse the network/host split visual, static)
function renderL2M2(){
  const oct=[{v:'192',c:'--blue'},{v:'168',c:'--blue'},{v:'1',c:'--blue'},{v:'10',c:'--green'}];
  const OW=110,OX=(640-OW*4-3*10)/2,OY=66,OH=44;
  let s='<svg viewBox="0 0 640 210" width="100%" style="display:block">';
  s+='<text x="320" y="34" text-anchor="middle" style="font:700 10.5px var(--mono);fill:var(--cyan)">'+'IP ADDRESS = NETWORK + HOST'+'</text>';
  s+='<g id="l2m2-0">';let x=OX;oct.forEach((o,i)=>{s+='<rect x="'+x+'" y="'+OY+'" width="'+OW+'" height="'+OH+'" rx="7" style="fill:var('+o.c+');fill-opacity:.15;stroke:var('+o.c+');stroke-width:1.4"/><text x="'+(x+OW/2)+'" y="'+(OY+OH/2+6)+'" text-anchor="middle" style="font:700 18px var(--mono);fill:var('+o.c+')">'+o.v+'</text>';if(i<3)s+='<text x="'+(x+OW+4)+'" y="'+(OY+OH/2+6)+'" text-anchor="middle" style="font:700 16px var(--mono);fill:var(--muted)">.</text>';x+=OW+10;});s+='</g>';
  s+='<g id="l2m2-1"><rect x="'+OX+'" y="'+(OY+OH+8)+'" width="'+(OW*3+20)+'" height="20" rx="5" style="fill:var(--blue);fill-opacity:.1"/><text x="'+(OX+(OW*3+20)/2)+'" y="'+(OY+OH+22)+'" text-anchor="middle" style="font:700 9px var(--sans);fill:var(--blue)">'+'NETWORK (like a city)'+'</text></g>';
  s+='<g id="l2m2-2"><rect x="'+(OX+OW*3+30)+'" y="'+(OY+OH+8)+'" width="'+OW+'" height="20" rx="5" style="fill:var(--green);fill-opacity:.1"/><text x="'+(OX+OW*3+30+OW/2)+'" y="'+(OY+OH+22)+'" text-anchor="middle" style="font:700 9px var(--sans);fill:var(--green)">'+'HOST'+'</text></g>';
  s+='<g id="l2m2-3"><text x="320" y="172" text-anchor="middle" style="font:600 10px var(--mono);fill:var(--muted)">/24 → '+'first 24 bits = network, last 8 = host (254 addresses)'+'</text></g>';
  s+='</svg>';
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'An IP address solves what MAC cannot: it is <b>hierarchical</b> – it has a <b>network part</b> (picture it as a city) and a <b>host part</b> (like a house number in that city). That lets a router tell which direction an address lies. <b>IPv4</b> is written as 4 numbers 0–255 (e.g. <span class="mono">192.168.1.10</span>); under the hood it is 32 <b>bits</b> (a bit = the smallest piece of data, a 1 or 0 – you met bits in the media lesson). Not every address goes out to the internet: some ranges are <b>private</b> – valid only inside your home or company network and never routed on the internet: <span class="mono">10.0.0.0/8</span>, <span class="mono">172.16.0.0/12</span>, <span class="mono">192.168.0.0/16</span>. <b>Public</b> addresses are globally unique and assigned by your provider (ISP); you need one for the internet to reach you. The <span class="mono">/24</span> notation says how many leading bits belong to the network – in <span class="mono">192.168.1.10/24</span> that is the first three numbers (<span class="mono">192.168.1</span> = network, <span class="mono">.10</span> = host); we cover subnetting in the next course.'+'</p>'
    +'<div class="osi-stage">'+s+'</div>'
    +'<div class="m1-cap" id="l2m2cap"></div>'+courseStepControls('l2m2')
    +abbrBox([['IP','a device’s address in the network; hierarchical (network + host).'],['IPv4','a 32-bit address – each of the 4 numbers is 8 bits, hence the 0–255 range; separated by dots.'],['private','ranges for internal networks only (10.x, 172.16–31.x, 192.168.x).'],['public','a globally unique address from your provider.'],['ISP','your internet service provider.']]);
}
/* ============================================================
   LESSON 4 — How we connect (physical media; static comparison modules)
   ============================================================ */
function courseCard(c,title,desc,id){
  return '<div '+(id?'id="'+id+'" ':'')+'style="flex:1 1 165px;min-width:150px;border:1px solid var(--line2);border-radius:10px;padding:10px 11px;background:var(--panel2)"><div style="font-weight:700;color:var('+c+');font-size:12px;margin-bottom:5px">'+title+'</div><div style="font-size:11px;color:var(--muted);line-height:1.45">'+desc+'</div></div>';
}
// MOD 4.1 — Bits and signals
function renderL4M1(){
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'Whether data travels by cable or through the air, at the very lowest level it is always just <b>ones and zeros</b> – <b>bits</b>. But how does a bit physically travel from one device to another? It depends on the <b>medium</b> – what it travels on. Copper carries a bit as <b>voltage</b>, fiber as <b>light</b>, and Wi-Fi as a <b>radio wave</b>. How many bits a medium carries per second is its <b>bandwidth</b> – measured in Mbps or Gbps.'+'</p>'
    +'<div style="display:flex;gap:8px;flex-wrap:wrap;margin:2px 0">'
      +courseCard('--amber','Copper (cable)','electrical voltage: 1 = voltage, 0 = none.','l4m1-0')
      +courseCard('--cyan','Optical fiber','light pulses: 1 = flash, 0 = dark.','l4m1-1')
      +courseCard('--green','Wi-Fi (radio)','radio waves through the air – the signal is modulated.','l4m1-2')
    +'</div>'
    +'<div class="m1-cap" id="l4m1cap"></div>'+courseStepControls('l4m1')
    +abbrBox([['bit','the smallest unit of data – a 1 or a 0.'],['Mbps / Gbps','megabits/gigabits per second – how much data passes per second.'],['bandwidth','how many bits a medium can carry per second.']]);
}
// MOD 4.2 — Cables
function renderL4M2(){
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'There are three main types for a wired connection. <b>Twisted pair</b> (the RJ-45 plug) is the most common cable in home and company networks – usually the unshielded <b>UTP</b> variant, with shielded STP/FTP for <b>noisy environments</b> (near power cables, motors or machines that induce interference into the wire). <b>Optical fiber</b> guides light and offers <b>higher speeds and longer reach</b> – it forms the backbone of the internet. <b>Coax</b> is the oldest of the three; today it mostly carries cable TV and cable-company internet. Practical tip: where you can, use a cable – it is steadier and faster than Wi-Fi.'+'</p>'
    +'<div style="display:flex;gap:8px;flex-wrap:wrap;margin:2px 0">'
      +courseCard('--amber','Twisted pair','copper pairs (UTP/STP, Cat5e/Cat6), RJ-45 plug. Reliable, the ordinary LAN.','l4m2-0')
      +courseCard('--cyan','Optical fiber','light in glass. Higher speeds and longer reach, no electrical interference. Backbone and fiber-to-the-home (FTTH).','l4m2-1')
      +courseCard('--violet','Coax','an older type. Today it is used mostly for cable TV and cable-company internet.','l4m2-2')
    +'</div>'
    +'<div class="m1-cap" id="l4m2cap"></div>'+courseStepControls('l4m2')
    +abbrBox([['twisted pair','copper pairs with an RJ-45 plug (UTP unshielded, STP/FTP shielded) – the common LAN cable.'],['fiber','transmission by light in a glass strand – very fast and over long distances.'],['FTTH','fiber brought all the way into the flat/house.']]);
}
// MOD 4.3 — Wi-Fi and mobile networks
function renderL4M3(){
  const col=(c,color,name,pic,rows,use)=>{
    let s='<rect x="'+(c-97)+'" y="10" width="194" height="248" rx="10" style="fill:var('+color+');fill-opacity:.06;stroke:var('+color+');stroke-width:1.2"/>'
      +'<text x="'+c+'" y="34" text-anchor="middle" style="font:700 11px var(--sans);fill:var('+color+')">'+esc(name)+'</text>'
      +pic;
    rows.forEach((r,i)=>{const y=110+i*32;
      s+='<text x="'+c+'" y="'+y+'" text-anchor="middle" style="font:600 7.5px var(--mono);fill:var(--muted)">'+esc(r[0])+'</text>'
        +'<text x="'+c+'" y="'+(y+13)+'" text-anchor="middle" style="font:700 9px var(--sans);fill:var(--txt)">'+esc(r[1])+'</text>';});
    return s+'<text x="'+c+'" y="248" text-anchor="middle" style="font:italic 700 8px var(--sans);fill:var('+color+')">'+esc(use)+'</text>';
  };
  const picCable=(c)=>'<rect x="'+(c-44)+'" y="60" width="16" height="14" rx="3" style="fill:none;stroke:var(--amber);stroke-width:1.6"/>'
    +'<rect x="'+(c+28)+'" y="60" width="16" height="14" rx="3" style="fill:none;stroke:var(--amber);stroke-width:1.6"/>'
    +'<line x1="'+(c-28)+'" y1="67" x2="'+(c+28)+'" y2="67" style="stroke:var(--amber);stroke-width:1.8"/>';
  const picWifi=(c)=>'<circle cx="'+c+'" cy="78" r="2.6" style="fill:var(--green)"/>'
    +'<path d="M'+(c-10)+' 70 Q'+c+' 60 '+(c+10)+' 70" style="fill:none;stroke:var(--green);stroke-width:1.8"/>'
    +'<path d="M'+(c-17)+' 62 Q'+c+' 47 '+(c+17)+' 62" style="fill:none;stroke:var(--green);stroke-width:1.8"/>';
  const picCell=(c)=>'<line x1="'+c+'" y1="52" x2="'+c+'" y2="80" style="stroke:var(--cyan);stroke-width:2"/>'
    +'<line x1="'+(c-9)+'" y1="80" x2="'+c+'" y2="64" style="stroke:var(--cyan);stroke-width:1.5"/>'
    +'<line x1="'+(c+9)+'" y1="80" x2="'+c+'" y2="64" style="stroke:var(--cyan);stroke-width:1.5"/>'
    +'<path d="M'+(c-8)+' 50 Q'+(c-13)+' 56 '+(c-8)+' 62" style="fill:none;stroke:var(--cyan);stroke-width:1.5"/>'
    +'<path d="M'+(c+8)+' 50 Q'+(c+13)+' 56 '+(c+8)+' 62" style="fill:none;stroke:var(--cyan);stroke-width:1.5"/>';
  const scene='<div class="osi-stage"><svg viewBox="0 0 640 268" width="100%" style="display:block">'
    +col(115,'--amber','Cable (UTP)',picCable(115),[
      ['speed','highest'],
      ['reliability','best'],
      ['latency','lowest'],
      ['mobility','none (wired)']],'use a cable where you can')
    +col(320,'--green','Wi-Fi',picWifi(320),[
      ['speed','high'],
      ['reliability','varies'],
      ['latency','medium'],
      ['mobility','around the building']],'convenience at home and office')
    +col(525,'--cyan','Mobile network',picCell(525),[
      ['speed','high (5G)'],
      ['reliability','varies by coverage'],
      ['latency','medium–low (4G/5G)'],
      ['mobility','everywhere']],'connectivity anywhere')
    +'</svg></div>';
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'There are mainly two ways to connect wirelessly. <b>Wi-Fi</b> (the 802.11 standard) is a radio link to an <b>access point</b> (at home it is part of the router). <b>Mobile networks</b> (4G/5G) are a completely different infrastructure – the operator’s masts cover whole regions; <b>5G</b> adds higher speed and lower <b>latency</b>. And there are <b>short-range</b> wireless networks too, such as <b>Bluetooth</b> (headphones, mouse, smartwatch). A comparison of the main ones:'+'</p>'
    +scene
    +'<div class="m1-cap"><span>'+'Cable = steadiest, Wi-Fi = convenience at home, mobile = connectivity anywhere.'+'</span></div>'
    +abbrBox([['Wi-Fi / 802.11','a wireless radio link to an access point.'],['AP','the device that broadcasts Wi-Fi; at home it is usually inside the router.'],['4G / 5G','the operator’s mobile networks; 5G is faster with lower latency.'],['Bluetooth','a short-range wireless network (headphones, mouse, watch).'],['latency','the delay – how long data takes to get there and back.']]);
}
function mountL4M1(){courseRevealMount('l4m1',[
  '<b>Copper</b>: a bit travels as electrical voltage – simple and cheap.',
  '<b>Fiber</b>: a bit travels as a flash of light – fastest and over long distances.',
  '<b>Wi-Fi</b>: a bit travels as a radio wave through the air – no cable, but variable. Bits per second = bandwidth.']);}
function mountL4M2(){courseRevealMount('l4m2',[
  '<b>UTP / RJ-45</b>: the common copper LAN cable, ~100 m reach. Home and office.',
  '<b>Optical fiber</b>: light in glass – tens of Gbps, kilometers. The internet backbone.',
  '<b>Coax</b>: an older type, used today mostly for cable TV and internet. Use a cable where you can.']);}
// MOD 5.3 — HTTP, HTTPS and encryption (reuse the wire-vs-observer visual, static)
function renderL5M3(){
  function row(id,y,label,c,wireText,obsText,obsOk){
    return '<g id="'+id+'"><text x="40" y="'+(y+4)+'" style="font:700 10px var(--mono);fill:var('+c+')">'+label+'</text>'
      +'<rect x="150" y="'+(y-15)+'" width="300" height="30" rx="6" style="fill:var('+c+');fill-opacity:.12;stroke:var('+c+');stroke-width:1.3"/>'
      +'<text x="300" y="'+(y+4)+'" text-anchor="middle" style="font:700 10px var(--mono);fill:var('+c+')">'+esc(wireText)+'</text>'
      +'<text x="600" y="'+(y-3)+'" text-anchor="end" style="font:400 8.5px var(--sans);fill:var(--muted)">'+'on the way:'+'</text>'
      +'<text x="600" y="'+(y+11)+'" text-anchor="end" style="font:700 9.5px var(--mono);fill:var('+(obsOk?'--green':'--red')+')">'+esc(obsText)+'</text></g>';
  }
  let s='<svg viewBox="0 0 640 170" width="100%" style="display:block">';
  s+='<text x="300" y="26" text-anchor="middle" style="font:700 10px var(--mono);fill:var(--muted)">'+'what travels on the wire'+'</text>';
  s+=row('l5m3-0',70,'HTTP','--red','password=Secret123','password=Secret123 ✗',false);
  s+=row('l5m3-1',125,'HTTPS','--green','x8#@9f$ K2!a…','x8#@9f$ K2!a… ✓',true);
  s+='</svg>';
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'What you send over the network does not go straight to the target – it passes through plenty of machines that are not yours (the café Wi-Fi, your provider, the routers along the way). <b>HTTP</b> is the language of the web: you send a <b>request</b>, the server returns a <b>response</b> (the page). But it sends everything as <b>plain text</b> – whatever you send (passwords, card numbers) can be read by anyone on the way. <b>HTTPS</b> = HTTP + <b>encryption</b>. It <b>encrypts</b> the data so that only the <b>two ends</b> can unlock it – <b>you and the server</b>. To anyone on the path it is an unreadable jumble, and the <b>padlock</b> shows in your browser. Note: HTTPS hides the <b>content</b> and the specific <b>page address</b> (the URL path), but not the <b>domain</b> you connect to – the server name (SNI) stays visible.'+'</p>'
    +'<div class="osi-stage">'+s+'</div>'
    +'<div class="m1-cap" id="l5m3cap"></div>'+courseStepControls('l5m3')
    +abbrBox([['HTTP','the web protocol (request → response); unencrypted.'],['HTTPS','HTTP + encryption; the padlock in the browser.'],['encryption','encodes data so only the two ends can read it (for HTTPS the TLS protocol provides this).']]);
}
// MOD 6.3 — Summary: what happens when you open a page (synthesis, static — all concepts now known)
function renderL6M3(){
  const steps=[
    {k:'Connect',c:'--green',d:'You join the network – by cable or wirelessly over Wi-Fi.'},
    {k:'DHCP',c:'--cyan',d:'You get an IP address (plus the gateway and DNS) – once when you join the network.'},
    {k:'ARP',c:'--amber',d:'ARP finds the gateway’s MAC – every outbound packet (including the DNS query) goes to the router first.'},
    {k:'DNS',c:'--blue',d:'The name <span class="mono">example.com</span> is resolved to an IP address.'},
    {k:'TCP',c:'--green',d:'A reliable connection to the server opens.'},
    {k:'Encryption',c:'--violet',d:'Encryption is negotiated – only the two ends can read the content.'},
    {k:'HTTP request',c:'--lime',d:'The browser sends the request, the server returns the page.'},
    {k:'Display',c:'--cyan',d:'The data is decrypted, reassembled and the page is drawn.'}
  ];
  let rows='';
  steps.forEach((s,i)=>{rows+='<div id="l6m3-'+i+'" style="display:flex;align-items:flex-start;gap:10px;padding:7px 0;border-top:'+(i?'1px solid var(--line2)':'none')+'">'
    +'<span style="flex:0 0 26px;height:26px;border-radius:50%;background:var('+s.c+');color:var(--on-accent);font:700 11px var(--mono);display:flex;align-items:center;justify-content:center">'+(i+1)+'</span>'
    +'<div style="flex:1"><div style="font-weight:700;color:var('+s.c+');font-size:var(--crs-fs,13.5px)">'+s.k+'</div><div style="font-size:11.5px;color:var(--muted);line-height:1.45">'+s.d+'</div></div></div>';});
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'Now you have all the pieces. Let us walk through what happens when you type an address into the browser and press Enter – no new terms, just putting it together into one journey.'+'</p>'
    +'<div style="border:1px solid var(--line2);border-radius:10px;padding:4px 12px;background:var(--panel2)">'+rows+'</div>'
    +'<div class="m1-cap" id="l6m3cap" style="margin-top:10px"></div>'+courseStepControls('l6m3')
    +'<p style="color:var(--muted);font-size:11px;line-height:1.5;margin:6px 0 0;opacity:.85">'+'Most of the steps happen in under a second, a hundred times a day.'+'</p>'
    +abbrBox([['DHCP','automatically gives you an IP address (plus the gateway and DNS) when you join.'],['ARP','finds the MAC address for a given IP (a broadcast query in the local network).'],['DNS','the internet’s phone book – translates a name (example.com) into an IP address.'],['TCP','a reliable connection – connection setup and delivery acknowledgments.'],['default gateway','the router you send traffic to when it is headed outside your network.']]);
}
function mountL6M3(){courseRevealMount('l6m3',[
  '<b>1) Connect</b>: you join the network by cable or wirelessly over Wi-Fi.',
  '<b>2) DHCP</b> gives you an IP address – once, when you join the network.',
  '<b>3) ARP</b> finds the gateway’s MAC – every outbound packet (even the DNS query) goes to the router first.',
  '<b>4) DNS</b> translates the server name (example.com) into a numeric IP.',
  '<b>5) TCP</b> opens a reliable connection to the server.',
  '<b>6) Encryption</b> is negotiated – only the two ends can read the content.',
  '<b>7) HTTP</b>: the browser sends a request, the server returns the page.',
  '<b>8) Display</b>: the data is decrypted, reassembled – and the page appears. Now you know how!']);}

/* ---------- mounts for the reveal-style concept modules ---------- */
function mountL2M2(){courseRevealMount('l2m2',[
  'This is an <b>IP address</b>: four numbers 0–255 (e.g. 192.168.1.10).',
  'The front part is the <b>NETWORK</b> (like a city) – shared by a whole group of devices.',
  'The back part is the <b>HOST</b> – it picks one specific device in that network.',
  'Where is the boundary? The <b>prefix</b> /24 says it – how many leading bits belong to the network. More in a later lesson.']);}
function mountL5M3(){courseRevealMount('l5m3',[
  '<b>HTTP</b> sends everything in <b>plain text</b>. Anyone on the way (the café, your provider) reads even your password.',
  '<b>HTTPS</b> = HTTP + <b>TLS</b>. Only the two ends can unlock the data – you and the server – on the way it is an unreadable jumble and the padlock shows in the browser.']);}
/* ---------- COURSE 1 data structure ---------- */
/* ============================================================
   v0.3 NEW MODULES OF COURSE 1 (descriptive names; existing functions are just rewired in the data)
   ============================================================ */
// L3M1 — Why we need addresses at all (motivational, static)
function renderWhyAddr(){
  const dot=(x,y,on)=>'<circle cx="'+x+'" cy="'+y+'" r="9" style="fill:var('+(on?'--cyan':'--muted')+');fill-opacity:.18;stroke:var('+(on?'--cyan':'--muted')+');stroke-width:1.4"/>';
  let cloud='';const pts=[[120,70],[210,50],[300,80],[400,55],[480,85],[160,150],[260,150],[360,150],[450,150]];
  pts.forEach(p=>cloud+=dot(p[0],p[1],false));
  const svg='<svg viewBox="0 0 640 215" width="100%" style="display:block">'
    +'<text x="320" y="24" text-anchor="middle" style="font:700 10px var(--mono);fill:var(--muted)">'+'THOUSANDS OF DEVICES — WHO TO SEND TO?'+'</text>'
    +cloud
    +'<g transform="translate(300,110)"><circle r="13" style="fill:var(--amber);fill-opacity:.18;stroke:var(--amber);stroke-width:1.6"/><text y="4" text-anchor="middle" style="font:700 12px var(--mono);fill:var(--amber)">?</text></g>'
    +'<text x="320" y="200" text-anchor="middle" style="font:400 9px var(--sans);fill:var(--muted)">'+'Without an address, data has nowhere to go. The address solves it.'+'</text>'
    +'</svg>';
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'A network can easily have thousands of devices. How does each know <b>who</b> to send data to? Just like the postal system: every device needs an <b>address</b>. But in networking one is not enough – there are <b>two</b>, each for a different job. One says <b>who you are</b> (your specific device), the other <b>where you are</b> (which network). In the next modules we look at both – first "who you are" (MAC), then "where you are" (IP).'+'</p>'
    +'<div class="osi-stage">'+svg+'</div>'
    +'<div class="m1-cap"><span>'+'Every device needs an address – otherwise data has nowhere to go.'+'</span></div>';
}
// L3M2 — MAC address: the factory label (static; split out of the earlier MAC explanation)
function renderMac(){
  const svg='<svg viewBox="0 0 640 200" width="100%" style="display:block">'
    +'<rect x="180" y="40" width="280" height="96" rx="10" style="fill:var(--green);fill-opacity:.10;stroke:var(--green);stroke-width:1.5"/>'
    +'<text x="320" y="66" text-anchor="middle" style="font:700 9px var(--sans);fill:var(--green)">'+'NETWORK CARD'+'</text>'
    +'<rect x="232" y="80" width="176" height="30" rx="5" style="fill:var(--panel);stroke:var(--green);stroke-width:1.3"/>'
    +'<text x="320" y="100" text-anchor="middle" style="font:700 14px var(--mono);fill:var(--green)">00:1A:2B:3C:4D:5E</text>'
    +'<text x="320" y="128" text-anchor="middle" style="font:400 8px var(--sans);fill:var(--muted)">'+'6 pairs in hexadecimal (hex) = 48 bits'+'</text>'
    +'<text x="320" y="170" text-anchor="middle" style="font:600 9.5px var(--mono);fill:var(--muted)">'+'the "factory label" — meant to be unique, valid only in the local network'+'</text>'
    +'</svg>';
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'The first address says <b>who you are</b>. It is the <b>MAC address</b> – like a network card’s <b>factory label</b>. The maker "burns" it in at manufacture and it normally never changes. It looks like six pairs in hexadecimal, e.g. <span class="mono">00:1A:2B:3C:4D:5E</span> (each pair = 8 bits, 48 in total). It is <b>meant to be unique</b> worldwide (each maker gets its own assigned range), but that is the <b>intent, not a guarantee</b> – a MAC address can be changed in software, and phones deliberately randomize theirs while scanning for networks. It is <b>used only within one local network</b> – switches (the boxes that carry data around inside a network) deliver by it only inside your network, and it is not carried across a router. The moment data leaves your network, the second address, <b>IP</b>, takes over (in the next module).'+'</p>'
    +'<div class="osi-stage">'+svg+'</div>'
    +'<div class="m1-cap"><span>'+'MAC = who you are. The card’s factory label, valid in the local network.'+'</span></div>'
    +abbrBox([['MAC address','the network card’s factory label (48 bits, 6 hex pairs); meant to be unique (though it can be changed in software), valid in the local network.'],['hex','hexadecimal (0–9, A–F) – a compact way to write bytes.']]);
}
// L3M4 — Your router has two addresses (private vs. public + NAT swap animation)
function renderRouterTwo(){
  const svg='<svg id="natsvg" viewBox="0 0 640 220" width="100%" style="display:block">'
    +'<line x1="106" y1="120" x2="294" y2="120" style="stroke:var(--green);stroke-width:2.2"/>'
    +'<line x1="366" y1="120" x2="490" y2="120" style="stroke:var(--blue);stroke-width:2;stroke-dasharray:4 4"/>'
    +'<g id="natglow"></g>'
    +'<g transform="translate(80,120)"><circle r="22" style="fill:var(--green);fill-opacity:.15;stroke:var(--green);stroke-width:1.8"/><text y="4" text-anchor="middle" style="font:700 11px var(--mono);fill:var(--green)">PC</text></g>'
    +'<text x="80" y="162" text-anchor="middle" style="font:600 8px var(--mono);fill:var(--green)">192.168.1.10</text>'
    +'<g transform="translate(330,120)"><rect x="-36" y="-24" width="72" height="48" rx="8" style="fill:var(--cyan);fill-opacity:.16;stroke:var(--cyan);stroke-width:1.6"/><text y="-3" text-anchor="middle" style="font:700 9px var(--sans);fill:var(--cyan)">router</text><text y="12" text-anchor="middle" style="font:700 8px var(--mono);fill:var(--cyan)">NAT</text></g>'
    +'<g transform="translate(556,120)"><ellipse rx="66" ry="38" style="fill:var(--blue);fill-opacity:.10;stroke:var(--blue);stroke-width:1.3"/><text y="-4" text-anchor="middle" style="font:700 9px var(--mono);fill:var(--blue)">'+'internet'+'</text><text y="12" text-anchor="middle" style="font:700 9px var(--mono);fill:var(--blue)">198.51.100.1</text></g>'
    +'<g id="natdyn"></g></svg>';
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'At home every device has a <b>private IP</b> (<span class="mono">10.x.x.x</span>, <span class="mono">192.168.x.x</span>, <span class="mono">172.16–31.x.x</span>) – these work <b>only inside your network</b> and the internet could never find them. But the router also has <b>one public IP</b> from your provider – <b>that one the whole internet sees</b>. When you send data out, the router <b>swaps</b> your private address for its public one (and back on the reply). That translation is called <b>NAT</b>. Thanks to it the whole household hides behind a single public address. Step through the swap. <i>How NAT works in detail comes in the next course.</i>'+'</p>'
    +'<div class="osi-stage">'+svg+'</div>'
    +'<div class="m1-cap" id="natcap"></div>'
    +courseStepControls('nat')
    +abbrBox([['private IP','ranges for internal networks only (10.x.x.x, 192.168.x.x, 172.16–31.x.x); not routed on the internet.'],['public IP','a globally unique address from your provider; visible to the whole internet.'],['NAT','translation between private and public addresses; a whole network hides behind one public IP (detail in the next course).'],['ISP','your internet service provider.']]);
}
function mountRouterTwo(){
  const chip=(col,txt)=>'<rect x="160" y="188" width="320" height="22" rx="6" style="fill:var(--panel);stroke:var('+col+');stroke-width:1.1"/><text x="320" y="203" text-anchor="middle" style="font:700 9.5px var(--mono);fill:var('+col+')">'+esc(txt)+'</text>';
  const STEPS=[
    {glow:csGlow(80,120,'--green',26), dyn:chip('--green','packet · source: 192.168.1.10 (private)'), cap:'The PC builds a packet with its <b>private</b> source address <span class="mono">192.168.1.10</span>. As is, it would fail on the internet – no one routes a private address there.'},
    {glow:csGlow(80,120,'--green',26)+csGlow(330,120,'--cyan',30), dyn:csPkt('M106 120 L294 120','--green')+chip('--green','source: 192.168.1.10 → router'), cap:'The packet reaches the <b>router</b> – the gateway between your network and the internet.'},
    {glow:csGlow(330,120,'--cyan',30), dyn:'<rect x="196" y="150" width="248" height="20" rx="5" style="fill:var(--panel);stroke:var(--amber);stroke-width:1.2"/><text x="320" y="164" text-anchor="middle" style="font:700 8.5px var(--mono);fill:var(--amber)">'+esc('NAT table: 192.168.1.10 ↔ 198.51.100.1')+'</text>'+chip('--amber','the record = so the reply finds its way back'), cap:'<b>NAT</b>: the router rewrites the source from private <span class="mono">192.168.1.10</span> to its <b>public</b> <span class="mono">198.51.100.1</span> and <b>records</b> whose reply it is (several devices at once are told apart by port numbers – you’ll meet those in lesson 5).'},
    {glow:csGlow(330,120,'--cyan',30), dyn:csPkt('M366 120 L490 120','--blue')+chip('--blue','source: 198.51.100.1 (public) → internet'), cap:'Out on the internet the packet carries the <b>public</b> address. The server sees only <span class="mono">198.51.100.1</span> – it has no idea about your PC.'},
    {glow:csGlow(330,120,'--cyan',30), dyn:csPkt('M490 120 L366 120','--blue')+chip('--blue','reply → 198.51.100.1'), cap:'The reply comes back to the <b>public</b> <span class="mono">198.51.100.1</span> – that is, to the router.'},
    {glow:csGlow(330,120,'--cyan',30)+csGlow(80,120,'--green',26), dyn:'<rect x="196" y="150" width="248" height="20" rx="5" style="fill:var(--panel);stroke:var(--green);stroke-width:1.2"/><text x="320" y="164" text-anchor="middle" style="font:700 8.5px var(--mono);fill:var(--green)">'+esc('NAT table: 192.168.1.10 ↔ 198.51.100.1 ✓')+'</text>'+csPkt('M294 120 L106 120','--green')+chip('--green','from the record: 198.51.100.1 → 192.168.1.10'), cap:'The router checks its <b>record</b>, rewrites the destination back to <span class="mono">192.168.1.10</span> and delivers to the <b>right PC</b>. That is <b>NAT</b>: private out as public, back again as private.'}
  ];
  function show(i){const g=$('natglow');if(g)g.innerHTML=STEPS[i].glow||'';const d=$('natdyn');if(d)d.innerHTML=STEPS[i].dyn||'';const c=$('natcap');if(c)c.innerHTML='<span>'+STEPS[i].cap+'</span>';}
  courseStepper('nat',STEPS.length,show);
}
// L4M1 — ARP: how I find the MAC for a given IP (step-through animation)
function renderArp(){
  const other='<circle r="16" style="fill:var(--muted);fill-opacity:.12;stroke:var(--muted);stroke-width:1.3"/><text y="3.5" text-anchor="middle" style="font:600 7px var(--sans);fill:var(--muted)">'+'other'+'</text>';
  const svg='<svg id="arpasvg" viewBox="0 0 640 240" width="100%" style="display:block">'
    +'<line x1="99" y1="112" x2="460" y2="63" style="stroke:var(--line2);stroke-width:1.4"/>'
    +'<line x1="100" y1="116" x2="453" y2="116" style="stroke:var(--line2);stroke-width:1.4"/>'
    +'<line x1="99" y1="120" x2="460" y2="169" style="stroke:var(--line2);stroke-width:1.4"/>'
    +'<g id="arpaglow"></g>'
    +'<g transform="translate(74,116)"><circle r="24" style="fill:var(--green);fill-opacity:.15;stroke:var(--green);stroke-width:1.8"/><text y="4.5" text-anchor="middle" style="font:700 12px var(--mono);fill:var(--green)">PC</text></g>'
    +'<g transform="translate(478,58)">'+other+'</g>'
    +'<g transform="translate(478,174)">'+other+'</g>'
    +'<g transform="translate(478,116)"><circle r="22" style="fill:var(--blue);fill-opacity:.16;stroke:var(--blue);stroke-width:2"/><text y="1" text-anchor="middle" style="font:700 8.5px var(--sans);fill:var(--blue)">router</text><text y="12" text-anchor="middle" style="font:600 7px var(--mono);fill:var(--blue)">.1</text></g>'
    +'<g id="arpadyn"></g></svg>';
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'You want to send data to someone on your <b>local network</b> and you know their <b>IP address</b>. But inside the network a frame is physically delivered by <b>MAC address</b> (the network card’s factory label), not by IP – without the target’s MAC you have no one to physically hand the data to. How do you find that MAC for a given IP? That is exactly what <b>ARP</b> solves – step through it.'+'</p>'
    +'<div class="osi-stage">'+svg+'</div>'
    +'<div class="m1-cap" id="arpacap"></div>'
    +courseStepControls('arpa')
    +abbrBox([['ARP','finds the MAC address for a given IP (a broadcast query in the local network).'],['broadcast','a "to everyone" message in the given local network.'],['ARP table','stored IP → MAC pairs so the device need not keep asking.'],['frame','a data unit for delivery inside the local network – it contains the sender and receiver MAC addresses, the data itself, and a checksum.']]);
}
function mountArp(){
  const chip=(x,y,w,col,txt)=>'<rect x="'+x+'" y="'+y+'" width="'+w+'" height="22" rx="6" style="fill:var(--panel);stroke:var('+col+');stroke-width:1.1"/><text x="'+(x+w/2)+'" y="'+(y+15)+'" text-anchor="middle" style="font:700 9.5px var(--mono);fill:var('+col+')">'+esc(txt)+'</text>';
  const cross='<text x="504" y="62" style="font:700 11px var(--sans);fill:var(--muted)">✗</text><text x="504" y="178" style="font:700 11px var(--sans);fill:var(--muted)">✗</text>';
  const STEPS=[
    {glow:csGlow(74,116,'--green',26), dyn:csPkt('M100 116 L453 116','--amber')+csPkt('M99 112 L460 63','--amber')+csPkt('M99 120 L460 169','--amber')+chip(150,204,340,'--amber','broadcast to all: "Who has IP 192.168.1.1?"'), cap:'The PC knows the IP (<span class="mono">192.168.1.1</span>) but not the MAC. So it asks with a <b>broadcast</b> – a "to everyone" message reaching <b>every device</b> on the local network.'},
    {glow:csGlow(478,116,'--blue',24), dyn:cross+csPkt('M453 116 L100 116','--green')+chip(150,204,340,'--green','only the owner replies: "Here is my MAC"'), cap:'The others <b>ignore</b> the query (not their IP). <b>Only the owner</b> replies – the .1 router sends its MAC <b>straight to the asker</b> (unicast, no broadcast any more).'},
    {glow:csGlow(74,116,'--green',26), dyn:'<rect x="155" y="200" width="330" height="24" rx="6" style="fill:var(--panel);stroke:var(--green);stroke-width:1.1"/><text x="320" y="216" text-anchor="middle" style="font:700 9px var(--mono);fill:var(--green)">'+esc('ARP table: 192.168.1.1 → BB:CC.. ✓')+'</text>', cap:'The PC <b>stores the IP → MAC pair in its ARP table</b>. Next time it need not ask – the answer is at hand.'},
    {glow:csGlow(478,116,'--blue',24), dyn:'<rect x="155" y="200" width="330" height="24" rx="6" style="fill:var(--panel);stroke:var(--green);stroke-width:1.1"/><text x="320" y="216" text-anchor="middle" style="font:700 9px var(--mono);fill:var(--green)">'+esc('ARP table: 192.168.1.1 → BB:CC.. ✓')+'</text>'+csPkt('M100 116 L453 116','--green'), cap:'The next frame goes <b>straight</b> to the known MAC – no broadcast, no waiting. That is <b>ARP</b>: ask once, then send directly.'}
  ];
  function show(i){const g=$('arpaglow');if(g)g.innerHTML=STEPS[i].glow||'';const d=$('arpadyn');if(d)d.innerHTML=STEPS[i].dyn||'';const c=$('arpacap');if(c)c.innerHTML='<span>'+STEPS[i].cap+'</span>';}
  courseStepper('arpa',STEPS.length,show);
}
// L4M2 — Default gateway: the way out of the network (static)
function renderGateway(){
  const svg='<svg viewBox="0 0 640 200" width="100%" style="display:block">'
    +'<g transform="translate(80,100)"><circle r="20" style="fill:var(--green);fill-opacity:.15;stroke:var(--green);stroke-width:1.6"/><text y="4" text-anchor="middle" style="font:700 10px var(--mono);fill:var(--green)">PC</text></g>'
    +'<g transform="translate(320,100)"><rect x="-40" y="-26" width="80" height="52" rx="9" style="fill:var(--cyan);fill-opacity:.16;stroke:var(--cyan);stroke-width:1.6"/><text y="-4" text-anchor="middle" style="font:700 9px var(--sans);fill:var(--cyan)">'+'default gateway'+'</text><text y="12" text-anchor="middle" style="font:700 9px var(--mono);fill:var(--cyan)">192.168.1.1</text></g>'
    +'<g transform="translate(545,100)"><ellipse rx="66" ry="38" style="fill:var(--blue);fill-opacity:.10;stroke:var(--blue);stroke-width:1.3"/><text y="4" text-anchor="middle" style="font:700 9px var(--mono);fill:var(--blue)">'+'internet'+'</text></g>'
    +'<line x1="100" y1="100" x2="278" y2="100" style="stroke:var(--cyan);stroke-width:2.4"/><line x1="360" y1="100" x2="480" y2="100" style="stroke:var(--blue);stroke-width:2;stroke-dasharray:4 4"/>'
    +'<text x="190" y="88" text-anchor="middle" style="font:700 8.5px var(--sans);fill:var(--cyan)">'+'target outside → send to gateway'+'</text>'
    +'</svg>';
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'What if the target is <b>not on your network</b> – say a website somewhere on the internet? You cannot reach it directly. So you send the data to the <b>default gateway</b>: that is your router, the "way out" of the network. In practice the gateway is usually the <b>first address</b> in the network, e.g. <span class="mono">192.168.1.1</span>. Your device doesn’t have to guess it – it gets it <b>automatically</b> together with its IP address (from DHCP, in the next module). The rule is simple: <b>target on my network → deliver directly; target outside → send to the gateway</b> and it forwards it on. (The device tells whether a target is "on my network" from the network part of the IP address – if it matches its own, the target is local.)'+'</p>'
    +'<div class="osi-stage">'+svg+'</div>'
    +'<div class="m1-cap"><span>'+'Target outside your network? Send it to the default gateway (router) and it forwards it.'+'</span></div>'
    +abbrBox([['default gateway','the router you send traffic to when it is headed outside your network; typically the first address (.1).'],['DHCP','a server that automatically gives a device an IP address (plus the gateway and DNS) when it joins; in detail in the next module.']]);
}
// L4M3 — DHCP: who gives you an address automatically (static)
function renderDhcp(){
  const other='<circle r="16" style="fill:var(--muted);fill-opacity:.12;stroke:var(--muted);stroke-width:1.3"/><text y="3.5" text-anchor="middle" style="font:600 7px var(--sans);fill:var(--muted)">'+'other'+'</text>';
  const svg='<svg id="dhcasvg" viewBox="0 0 640 230" width="100%" style="display:block">'
    +'<line x1="101" y1="104" x2="434" y2="66" style="stroke:var(--line2);stroke-width:1.4"/>'
    +'<line x1="101" y1="116" x2="461" y2="170" style="stroke:var(--line2);stroke-width:1.4"/>'
    +'<g id="dhcaglow"></g>'
    +'<g transform="translate(80,110)"><circle r="20" style="fill:var(--green);fill-opacity:.15;stroke:var(--green);stroke-width:1.6"/><text y="4" text-anchor="middle" style="font:700 10px var(--mono);fill:var(--green)">PC</text></g>'
    +'<g transform="translate(480,60)"><rect x="-44" y="-24" width="88" height="48" rx="8" style="fill:var(--cyan);fill-opacity:.16;stroke:var(--cyan);stroke-width:1.6"/><text y="4" text-anchor="middle" style="font:700 10px var(--mono);fill:var(--cyan)">DHCP</text></g>'
    +'<g transform="translate(480,175)">'+other+'</g>'
    +'<g id="dhcadyn"></g></svg>';
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'Where does the IP address actually come from? Usually you do not set it by hand – a <b>DHCP</b> server assigns it automatically (at home it is in the router). The assignment is a short conversation of <b>four messages</b> – step through it. That is why joining the Wi-Fi just works. If DHCP fails, the device gives itself a fallback address <span class="mono">169.254.x.x</span> (called <b>link-local</b>) – but that cannot reach out, so there is no internet.'+'</p>'
    +'<div class="osi-stage">'+svg+'</div>'
    +'<div class="m1-cap" id="dhcacap"></div>'
    +courseStepControls('dhca')
    +abbrBox([['DHCP','a server that automatically assigns an IP address (plus the gateway and DNS).'],['link-local','a fallback 169.254.x.x address a device gives itself when DHCP fails; it cannot reach out.']]);
}
function mountDhcp(){
  const tag=(txt,col)=>'<rect x="180" y="200" width="280" height="22" rx="6" style="fill:var(--panel);stroke:var('+col+');stroke-width:1.1"/><text x="320" y="215" text-anchor="middle" style="font:700 9.5px var(--mono);fill:var('+col+')">'+esc(txt)+'</text>';
  const row=(y,k,v)=>'<text x="192" y="'+y+'" style="font:700 9px var(--mono);fill:var(--cyan)">'+esc(k)+'</text><text x="242" y="'+y+'" style="font:400 9px var(--mono);fill:var(--txt)">'+v+'</text>';
  const cfg='<rect x="180" y="140" width="150" height="58" rx="6" style="fill:var(--panel);stroke:var(--cyan);stroke-width:1.2"/>'+row(158,'IP:','192.168.1.10')+row(174,'gw'+':','192.168.1.1')+row(190,'DNS:','192.168.1.1');
  const STEPS=[
    {glow:csGlow(80,110,'--green',22), dyn:csPkt('M101 104 L434 66','--amber')+csPkt('M101 116 L461 170','--amber')+tag('1) DISCOVER — "I need an address!"','--amber'), cap:'The PC just joined and <b>has no address</b>. So it calls out <b>by broadcast to everyone</b>: "Any DHCP server here? I need an address!" (DISCOVER).'},
    {glow:csGlow(480,60,'--cyan',26), dyn:csPkt('M434 66 L101 104','--cyan')+tag('2) OFFER — "I offer 192.168.1.10"','--cyan'), cap:'The <b>DHCP server</b> answers (the others stay silent): "I offer you <span class="mono">192.168.1.10</span>" (OFFER). The address is only <b>reserved</b> so far, not assigned.'},
    {glow:csGlow(80,110,'--green',22), dyn:csPkt('M101 104 L434 66','--green')+csPkt('M101 116 L461 170','--green')+tag('3) REQUEST — "I take it!"','--green'), cap:'The PC <b>confirms</b> the offer: "I take this address" (REQUEST) – sent as a <b>broadcast</b> so the other servers also learn which offer you chose.'},
    {glow:csGlow(480,60,'--cyan',26)+csGlow(80,110,'--green',22), dyn:csPkt('M434 66 L101 104','--green')+cfg+tag('4) ACK — assigned ✓','--green'), cap:'The server confirms with an <b>ACK</b> and sends the whole bundle with it: the <b>IP</b>, the <b>default gateway</b> and the <b>DNS server</b> (what DNS does comes in the next lesson). The PC writes it all down – and can communicate from now on.'}
  ];
  function show(i){const g=$('dhcaglow');if(g)g.innerHTML=STEPS[i].glow||'';const d=$('dhcadyn');if(d)d.innerHTML=STEPS[i].dyn||'';const c=$('dhcacap');if(c)c.innerHTML='<span>'+STEPS[i].cap+'</span>';}
  courseStepper('dhca',STEPS.length,show);
}
// L4M4 — When it does not work: first steps (decision tree, static)
function renderTrouble(){
  const card=(x,c,sym,t1,t2)=>'<g transform="translate('+x+',60)"><rect x="-92" y="0" width="184" height="120" rx="10" style="fill:var('+c+');fill-opacity:.08;stroke:var('+c+');stroke-width:1.4"/><text x="0" y="30" text-anchor="middle" style="font:700 16px var(--sans);fill:var('+c+')">'+sym+'</text><text x="0" y="58" text-anchor="middle" style="font:700 9px var(--sans);fill:var(--txt)">'+esc(t1)+'</text>'+t2.map((s,i)=>'<text x="0" y="'+(80+i*16)+'" text-anchor="middle" style="font:400 8.5px var(--sans);fill:var(--muted)">'+esc(s)+'</text>').join('')+'</g>';
  const svg='<svg viewBox="0 0 640 200" width="100%" style="display:block">'
    +card(110,'--amber','Wi-Fi ✓','No internet, Wi-Fi up',['check the IP address','reconnect'])
    +card(320,'--blue','DNS','One site will not load',['probably DNS / cache','try another site'])
    +card(530,'--red','✗','Nothing works at all',['ping the gateway .1','no reply → local network'])
    +'</svg>';
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'When the internet is down, a few first steps usually help – based on the symptom. <b>1) No internet but Wi-Fi is up:</b> you probably have no valid <b>IP address</b> (maybe DHCP did not give one) – try disconnecting and reconnecting. <b>2) One site fails, others work:</b> the issue is usually <b>DNS</b> (the name-resolution service – covered in the next lesson) or a stale DNS cache – the site itself could also be down. <b>3) Nothing works at all:</b> try a <b>ping</b> to the default gateway (e.g. <span class="mono">192.168.1.1</span>). A <b>ping</b> is a simple "are you there?" test – in the command line (the system’s text window where you type commands instead of clicking) you type <span class="mono">ping 192.168.1.1</span> and wait for a reply. If the gateway <b>does not answer</b>, the problem is on your <b>local network</b> (cable, network gear, Wi-Fi), not out on the internet.'+'</p>'
    +'<div class="osi-stage">'+svg+'</div>'
    +'<div class="m1-cap"><span>'+'Match the symptom → take the first step. A ping to the gateway shows if the problem is local.'+'</span></div>';
}
// L5M1 — DNS: the internet's phone book (static)
function renderDns(){
  const svg='<svg id="dnsasvg" viewBox="0 0 640 210" width="100%" style="display:block">'
    +'<line x1="98" y1="133" x2="280" y2="69" style="stroke:var(--line2);stroke-width:1.4"/>'
    +'<line x1="100" y1="140" x2="516" y2="140" style="stroke:var(--line2);stroke-width:1.4"/>'
    +'<g id="dnsaglow"></g>'
    +'<g transform="translate(80,140)"><circle r="20" style="fill:var(--green);fill-opacity:.15;stroke:var(--green);stroke-width:1.6"/><text y="4" text-anchor="middle" style="font:700 10px var(--mono);fill:var(--green)">PC</text></g>'
    +'<g transform="translate(320,45)"><rect x="-50" y="-24" width="100" height="48" rx="8" style="fill:var(--blue);fill-opacity:.14;stroke:var(--blue);stroke-width:1.6"/><text y="-2" text-anchor="middle" style="font:700 10px var(--mono);fill:var(--blue)">DNS</text><text y="13" text-anchor="middle" style="font:400 6.5px var(--sans);fill:var(--muted)">'+'phone book'+'</text></g>'
    +'<g transform="translate(560,140)"><rect x="-44" y="-24" width="88" height="48" rx="8" style="fill:var(--violet);fill-opacity:.14;stroke:var(--violet);stroke-width:1.6"/><text y="4" text-anchor="middle" style="font:700 9px var(--sans);fill:var(--violet)">'+'web server'+'</text></g>'
    +'<text x="560" y="196" text-anchor="middle" style="font:600 7.5px var(--mono);fill:var(--violet)">198.51.100.1</text>'
    +'<g id="dnsadyn"></g></svg>';
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'In your browser you type names like <span class="mono">example.com</span> – easy for you to remember. But computers and networks only use numbers between themselves, <b>IP addresses</b>. Something has to translate that name into a number – and that is exactly what <b>DNS</b> does: the <b>internet’s phone book</b>. Step through what happens when you open a page. (The animation shows a <b>successful</b> lookup. If DNS failed, the page would not load even though its server is up – the browser simply could not find the way to it.)'+'</p>'
    +'<div class="osi-stage">'+svg+'</div>'
    +'<div class="m1-cap" id="dnsacap"></div>'
    +courseStepControls('dnsa')
    +abbrBox([['DNS','the internet’s phone book – translates names (example.com) into IP addresses.'],['DNS cache','briefly stored DNS answers so a name is not resolved over and over.']]);
}
function mountDns(){
  const tag=(txt,col)=>'<text x="230" y="112" text-anchor="middle" style="font:700 9px var(--mono);fill:var('+col+')">'+esc(txt)+'</text>';
  const cache='<rect x="150" y="176" width="220" height="24" rx="6" style="fill:var(--panel);stroke:var(--blue);stroke-width:1.1"/><text x="260" y="192" text-anchor="middle" style="font:700 9px var(--mono);fill:var(--blue)">'+esc('cache: example.com → 198.51.100.1')+'</text>';
  const STEPS=[
    {glow:csGlow(80,140,'--green',22), dyn:csPkt('M98 133 L280 69','--amber')+tag('example.com = ?','--amber'), cap:'You type <span class="mono">example.com</span>. But the PC needs a <b>number</b> – so it asks the <b>DNS server</b>: "What IP belongs to example.com?"'},
    {glow:csGlow(320,45,'--blue',34), dyn:csPkt('M280 69 L98 133','--blue')+tag('→ 198.51.100.1','--blue'), cap:'The DNS server looks the name up in its "phone book" and <b>replies with the number</b>: <span class="mono">198.51.100.1</span>.'},
    {glow:csGlow(80,140,'--green',22), dyn:cache, cap:'The PC briefly keeps the answer in its <b>DNS cache</b> – next time it need not ask again. That is why opening the page a second time is faster.'},
    {glow:csGlow(560,140,'--violet',34), dyn:cache+csPkt('M100 140 L516 140','--green'), cap:'Only now does the PC <b>connect to that IP address</b> – to the web server. DNS was just the first step: translate the name, then everything runs on the number.'}
  ];
  function show(i){const g=$('dnsaglow');if(g)g.innerHTML=STEPS[i].glow||'';const d=$('dnsadyn');if(d)d.innerHTML=STEPS[i].dyn||'';const c=$('dnsacap');if(c)c.innerHTML='<span>'+STEPS[i].cap+'</span>';}
  courseStepper('dnsa',STEPS.length,show);
}
// L5M2 (Course 1) — TCP and UDP simplified (no handshake/datagram jargon; details are in Course 2)
function renderTcpUdpSimple(){
  const svg='<svg viewBox="0 0 640 150" width="100%" style="display:block">'
    +'<text x="165" y="20" text-anchor="middle" style="font:700 10px var(--mono);fill:var(--green)">TCP — '+'reliable'+'</text>'
    +'<text x="475" y="20" text-anchor="middle" style="font:700 10px var(--mono);fill:var(--amber)">UDP — '+'fast'+'</text>'
    +'<line x1="320" y1="30" x2="320" y2="138" style="stroke:var(--line);stroke-width:1;stroke-dasharray:3 4"/>'
    +'<g transform="translate(55,61)"><circle r="13" style="fill:var(--green);fill-opacity:.15;stroke:var(--green);stroke-width:1.4"/><text y="3" text-anchor="middle" style="font:700 8px var(--mono);fill:var(--green)">A</text></g>'
    +'<g transform="translate(275,61)"><circle r="13" style="fill:var(--green);fill-opacity:.15;stroke:var(--green);stroke-width:1.4"/><text y="3" text-anchor="middle" style="font:700 8px var(--mono);fill:var(--green)">B</text></g>'
    +'<line x1="70" y1="52" x2="260" y2="52" style="stroke:var(--green);stroke-width:1.3;opacity:.45"/><text x="165" y="44" text-anchor="middle" style="font:600 7.5px var(--sans);fill:var(--green)">'+'agrees + confirms'+'</text>'
    +'<line x1="260" y1="70" x2="70" y2="70" style="stroke:var(--green);stroke-width:1.2;stroke-dasharray:3 2;opacity:.45"/><text x="165" y="84" text-anchor="middle" style="font:600 7.5px var(--sans);fill:var(--muted)">'+'resends what is lost'+'</text>'
    +'<rect y="46" width="16" height="11" rx="2" style="fill:var(--green)"><animate attributeName="x" values="60;244;244" keyTimes="0;0.42;1" dur="2.6s" repeatCount="indefinite"/><animate attributeName="opacity" values="1;1;0;0" keyTimes="0;0.4;0.44;1" dur="2.6s" repeatCount="indefinite"/></rect>'
    +'<rect y="64" width="14" height="10" rx="2" style="fill:none;stroke:var(--green);stroke-width:1.3;stroke-dasharray:2 1.5"><animate attributeName="x" values="246;246;62;62" keyTimes="0;0.5;0.92;1" dur="2.6s" repeatCount="indefinite"/><animate attributeName="opacity" values="0;0;1;1;0;0" keyTimes="0;0.5;0.52;0.9;0.92;1" dur="2.6s" repeatCount="indefinite"/></rect>'
    +'<text x="165" y="116" text-anchor="middle" style="font:400 8px var(--sans);fill:var(--muted)">'+'web, files, email'+'</text>'
    +'<g transform="translate(370,61)"><circle r="13" style="fill:var(--amber);fill-opacity:.13;stroke:var(--amber);stroke-width:1.4"/><text y="3" text-anchor="middle" style="font:700 8px var(--mono);fill:var(--amber)">A</text></g>'
    +'<g transform="translate(580,61)"><circle r="13" style="fill:var(--amber);fill-opacity:.13;stroke:var(--amber);stroke-width:1.4"/><text y="3" text-anchor="middle" style="font:700 8px var(--mono);fill:var(--amber)">B</text></g>'
    +'<line x1="385" y1="61" x2="565" y2="61" style="stroke:var(--amber);stroke-width:1;stroke-dasharray:3 3;opacity:.4"/>'
    +[0,1,2].map(i=>'<rect y="55" width="14" height="11" rx="2" style="fill:var(--amber)"><animate attributeName="x" from="384" to="552" dur="1.25s" begin="'+(i*0.42).toFixed(2)+'s" repeatCount="indefinite"/></rect>').join('')
    +'<text x="475" y="90" text-anchor="middle" style="font:600 7.5px var(--sans);fill:var(--amber)">'+'just sends, no wait'+'</text>'
    +'<text x="475" y="116" text-anchor="middle" style="font:400 8px var(--sans);fill:var(--muted)">'+'calls, video, games'+'</text>'
    +'</svg>';
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'You already have the address (IP) and the path (via the router) – data reaches the right <b>device</b>. But many apps run on it at once: a browser, email, a game. How does the data get to the <b>right app</b> (the one waiting for it), and <b>reliably</b> at that? There are two approaches. <b>TCP</b> is like registered mail: the two sides first <b>agree</b> they are talking, then <b>confirm</b> the transfer to each other – anything lost is resent. So it is <b>reliable</b> (web, files, email) but a bit slower. <b>UDP</b> is like a postcard: it just <b>sends and does not wait</b> for confirmation. It is <b>fast</b> but with no guarantee – ideal for <b>live calls, video and games</b>, where resending something that should have arrived long ago is pointless. We’ll show exactly how that "agreement" works in the next course.'+'</p>'
    +'<div class="osi-stage">'+svg+'</div>'
    +'<div class="m1-cap"><span>'+'TCP = reliable (agrees and confirms). UDP = fast (just sends).'+'</span></div>'
    +abbrBox([['TCP','the reliable protocol: it agrees, confirms and resends what is lost.'],['UDP','the fast protocol with no guarantee: send and do not wait for confirmation.']]);
}
// L5M3 — Ports: the apartment number (static)
function renderPorts(){
  const app=(x,c,lbl,port)=>'<g transform="translate('+x+',150)"><rect x="-40" y="-22" width="80" height="40" rx="7" style="fill:var('+c+');fill-opacity:.14;stroke:var('+c+');stroke-width:1.4"/><text y="-3" text-anchor="middle" style="font:700 9px var(--sans);fill:var('+c+')">'+esc(lbl)+'</text><text y="12" text-anchor="middle" style="font:700 9px var(--mono);fill:var('+c+')">:'+port+'</text></g>';
  const svg='<svg viewBox="0 0 640 200" width="100%" style="display:block">'
    +'<rect x="60" y="24" width="520" height="40" rx="8" style="fill:var(--panel);stroke:var(--line2);stroke-width:1.4"/><text x="320" y="49" text-anchor="middle" style="font:700 10px var(--mono);fill:var(--cyan)">'+'ONE IP ADDRESS = 192.168.1.10 (the building)'+'</text>'
    +app(150,'--blue','browser',51724)+app(320,'--green','Spotify',52310)+app(490,'--violet','e-mail',52880)
    +[150,320,490].map(x=>'<line x1="'+x+'" y1="64" x2="'+x+'" y2="128" style="stroke:var(--muted);stroke-width:1.2;stroke-dasharray:3 3"/>').join('')
    +'<text x="320" y="186" text-anchor="middle" style="font:400 8.5px var(--sans);fill:var(--muted)">'+'port = the apartment number: routes incoming data to the right app'+'</text>'
    +'</svg>';
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'One computer runs many apps at once – browser, music, email – all sharing <b>one IP address</b>. How does data know which app it belongs to? By the <b>port</b>. If the IP address is the <b>building</b>, the port is the <b>apartment number</b>. Port numbers range from <b>0 to 65535</b>, and in a conversation <b>each side</b> has one: the <b>server</b> listens on a <b>pre-agreed</b> number so the client can find it. Common services have standardized numbers (the <b>well-known</b> ports, 0–1023) – <span class="mono">80</span> HTTP, <span class="mono">443</span> HTTPS, <span class="mono">53</span> DNS, <span class="mono">22</span> SSH – but a server can listen on any other port too (say <span class="mono">4070</span> or <span class="mono">8080</span>) as long as the client knows it – a non-standard port is typically written into the address after a colon (e.g. <span class="mono">server.com:8080</span>), or the service admin tells you. The <b>client</b> in turn takes a random <b>high</b> port (an ephemeral one = temporary; the system assigns it just for this one connection). A connection is then pinned down by <b>four things</b> (plus whether it’s TCP or UDP): your IP + your port and the server’s IP + the server’s port. That is why replies never get mixed up, even with many connections open at once.'+'</p>'
    +'<div class="osi-stage">'+svg+'</div>'
    +'<div class="m1-cap"><span>'+'IP = the building, port = the apartment number. IP+port delivers data to the right app.'+'</span></div>'
    +abbrBox([['port','a number (0–65535) that tells apps apart on one device – like an apartment number.'],['well-known ports','fixed numbers 0–1023 for common services (80, 443, 53, 22…).'],['ephemeral port','a temporary high port a client takes for an outgoing connection.']]);
}
// L6M1 — HTTP: the language of the web (step-through animation request → response)
function renderHttp(){
  const svg='<svg id="httpsvg" viewBox="0 0 640 200" width="100%" style="display:block">'
    +'<line x1="121" y1="100" x2="511" y2="100" style="stroke:var(--line2);stroke-width:1.6"/>'
    +'<g id="httpglow"></g>'
    +'<g transform="translate(95,100)"><circle r="22" style="fill:var(--green);fill-opacity:.15;stroke:var(--green);stroke-width:1.6"/><text y="-1" text-anchor="middle" style="font:700 8px var(--sans);fill:var(--green)">'+'browser'+'</text><text y="11" text-anchor="middle" style="font:400 7px var(--sans);fill:var(--muted)">'+'client'+'</text></g>'
    +'<g transform="translate(545,100)"><rect x="-34" y="-22" width="68" height="44" rx="8" style="fill:var(--violet);fill-opacity:.14;stroke:var(--violet);stroke-width:1.6"/><text y="4" text-anchor="middle" style="font:700 9px var(--sans);fill:var(--violet)">server</text></g>'
    +'<g id="httpdyn"></g></svg>';
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'Once you have the server’s address and a connection, how does the web actually "talk"? In the <b>HTTP</b> language. It works as <b>request → response</b>: the browser (client) sends a <b>request</b> – a method (e.g. <b>GET</b> = give me, <b>POST</b> = here is data), the page address and headers. The server returns a <b>response</b>: a <b>status code</b> (<span class="mono">200</span> OK, <span class="mono">404</span> Not Found, <span class="mono">500</span> server error) and a body – e.g. the HTML page. It is all <b>plain text</b>, so anyone on the path could read it. That is why <b>HTTPS</b> exists (in the next module), encrypting the content.'+'</p>'
    +'<div class="osi-stage">'+svg+'</div>'
    +'<div class="m1-cap" id="httpcap"></div>'
    +courseStepControls('http')
    +abbrBox([['HTTP','the web’s language: the browser sends a request, the server returns a response; unencrypted.'],['GET / POST','request methods: GET = fetch content, POST = send data to the server.'],['status code','the result number: 200 OK, 404 not found, 500 server error.'],['headers','extra fields on a request or response (e.g. content type, language, cookies) – the page itself is in the body.']]);
}
function mountHttp(){
  const chip=(y,col,txt)=>'<rect x="170" y="'+y+'" width="300" height="22" rx="5" style="fill:var(--panel);stroke:var('+col+');stroke-width:1.1"/><text x="320" y="'+(y+15)+'" text-anchor="middle" style="font:700 9.5px var(--mono);fill:var('+col+')">'+esc(txt)+'</text>';
  const STEPS=[
    {glow:csGlow(95,100,'--green',26)+csGlow(545,100,'--violet',30), dyn:csPkt('M121 100 L511 100','--blue')+chip(52,'--blue','→ GET /index.html + headers'), cap:'The browser (client) sends a <b>request</b>: the <b>GET</b> method (give me), the page address and <b>headers</b> (extra fields – language, cookies…).'},
    {glow:csGlow(545,100,'--violet',30), dyn:'<circle cx="545" cy="100" r="30" fill="none" stroke="var(--violet)" stroke-width="2"><animate attributeName="opacity" values="0.15;1;0.15" dur="1s" repeatCount="indefinite"/></circle>'+chip(52,'--violet','server looks up /index.html'), cap:'The server <b>processes</b> the request – it finds the <span class="mono">/index.html</span> file and builds a response (or returns an error if it does not exist).'},
    {glow:csGlow(545,100,'--violet',30)+csGlow(95,100,'--green',26), dyn:csPkt('M511 100 L121 100','--green')+chip(126,'--green','← 200 OK + HTML'), cap:'The server returns a <b>response</b>: <b>status code</b> <span class="mono">200</span> OK and the <b>HTML</b> page in the body. (Missing: <span class="mono">404</span>. Server-side error: <span class="mono">500</span>.)'},
    {glow:csGlow(95,100,'--green',26), dyn:chip(52,'--blue','→ GET /index.html')+chip(126,'--green','← 200 OK + HTML')+'<text x="320" y="170" text-anchor="middle" style="font:600 8.5px var(--sans);fill:var(--amber)">'+esc('all plain text — anyone on the path can read it')+'</text>', cap:'Both request and response are <b>plain text</b> – anyone on the path could read it. That is why <b>HTTPS</b> exists, encrypting the content (in the next module).'}
  ];
  function show(i){const g=$('httpglow');if(g)g.innerHTML=STEPS[i].glow||'';const d=$('httpdyn');if(d)d.innerHTML=STEPS[i].dyn||'';const c=$('httpcap');if(c)c.innerHTML='<span>'+STEPS[i].cap+'</span>';}
  courseStepper('http',STEPS.length,show);
}
// L6M3 — What HTTPS does not hide (static)
function renderHttpsHides(){
  const svg='<svg viewBox="0 0 640 190" width="100%" style="display:block">'
    +'<rect x="180" y="40" width="280" height="92" rx="10" style="fill:var(--panel);stroke:var(--green);stroke-width:1.6"/>'
    +'<text x="320" y="34" text-anchor="middle" style="font:700 8.5px var(--sans);fill:var(--muted)">'+'ENVELOPE (visible address)'+'</text>'
    +'<text x="320" y="62" text-anchor="middle" style="font:700 11px var(--mono);fill:var(--blue)">→ banka.cz</text>'
    +'<rect x="210" y="74" width="220" height="44" rx="6" style="fill:var(--green);fill-opacity:.12;stroke:var(--green);stroke-width:1.3;stroke-dasharray:4 3"/>'
    +'<text x="320" y="92" text-anchor="middle" style="font:700 9px var(--sans);fill:var(--green)">'+'ENCRYPTED CONTENT'+'</text>'
    +'<text x="320" y="108" text-anchor="middle" style="font:400 8px var(--sans);fill:var(--muted)">'+'passwords, card numbers, text'+'</text>'
    +'<text x="320" y="156" text-anchor="middle" style="font:400 8.5px var(--sans);fill:var(--muted)">'+'An observer sees WHERE you go, not WHAT you do.'+'</text>'
    +'</svg>';
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+'HTTPS encrypts the <b>content</b> – passwords, card numbers, message text. That is great, but it is worth knowing what it <b>does not hide</b>. Think of a parcel: the <b>contents are sealed</b>, but the <b>address on the outside is visible</b>. An observer on the path (say your provider) can see <b>which domain you connect to</b> (the server name, SNI), <b>when</b> and <b>for how long</b> and how much data flows – just not <i>what</i> exactly you exchange. Example: it is visible that you connected to <span class="mono">banka.cz</span>, but not what you do there. Why is SNI visible? The server name is sent <b>during the initial connection setup</b> – before the encryption is even negotiated. That is why name resolution is also being encrypted – <b>DNS over HTTPS (DoH)</b> – so even the "what IP does banka.cz have" query stays hidden.'+'</p>'
    +'<div class="osi-stage">'+svg+'</div>'
    +'<div class="m1-cap"><span>'+'HTTPS hides the content, not the address: WHERE you go is visible, WHAT you do is not.'+'</span></div>'
    +abbrBox([['HTTPS','HTTP + encryption; hides the content, not the destination domain.'],['SNI','the name of the server you connect to – visible even with HTTPS.'],['DoH','DNS over HTTPS – encrypted name resolution so even the query is hidden.']]);
}
// L7M2 — What now? (end of C1, link to C2)
function renderWhatNow(){
  const svg='<svg viewBox="0 0 640 150" width="100%" style="display:block">'
    +['DHCP','DNS','TCP','encryption','HTTP'].map((k,i)=>'<g transform="translate('+(80+i*120)+',60)"><rect x="-44" y="-18" width="88" height="36" rx="8" style="fill:var(--cyan);fill-opacity:.12;stroke:var(--cyan);stroke-width:1.3"/><text y="4" text-anchor="middle" style="font:700 9.5px var(--mono);fill:var(--cyan)">'+esc(k)+'</text></g>'+(i<4?'<text x="'+(140+i*120)+'" y="64" text-anchor="middle" style="font:700 12px var(--mono);fill:var(--muted)">→</text>':'')).join('')
    +'<text x="320" y="118" text-anchor="middle" style="font:700 10px var(--sans);fill:var(--violet)">'+'Next course: name every layer and device (ISO/OSI · TCP/IP)'+'</text>'
    +'</svg>';
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 12px">'+'That is it! You now know how data travels from your computer over Wi-Fi or a cable, through the router, DNS, TCP and HTTPS to the server and back – and the page loads in a fraction of a second. But it does not end there: <b>What if someone on that path were eavesdropping? And how far does an attacker who gets into the network reach?</b> All those devices, protocols and "floors" have a system and names – <b>ISO/OSI</b> and <b>TCP/IP</b>. That is the <b>next course</b>: layer by layer, device by device, until you can name every piece of the journey and understand where a network can be secured.'+'</p>'
    +'<div class="osi-stage">'+svg+'</div>'
    +courseCTA('crsToC2','That was the last lesson. Not in the mood for the final quiz? You can go straight to the next course.','Continue to the next course');
}
function mountWhatNow(){const b=$('crsToC2');if(b)b.onclick=()=>{setActiveCourse(COURSE_2);openCourseLessons();};}
const COURSE_1_DEF = {
  id: 'course1',
  title: 'How networks work',
  blurb: 'Understand networks from the ground up: why they exist, how devices talk, and how your message reaches exactly where it should.',
  lessons: [
    // LESSON 1 — unchanged (l1m2 renamed)
    { id:'l1', title:'Why networks exist and how data travels',
      taskId:'first-steps', quizId:'q_l1', modules:[
        { id:'l1m1', title:'Why networks exist', render:renderL1M1 },
        { id:'l1m2', title:'How a message is split into packets', render:renderL1M2, mount:mountL1M2 },
        { id:'l1m3', title:'The router and the internet', render:renderL1M3, mount:mountL1M3 }
      ]},
    // LESSON 2 — media (moved from the earlier L4)
    { id:'l2', title:'What data travels on: media',
      taskId:'wifi-connect', quizId:'q_l2', modules:[
        { id:'l2m1', title:'Bits and signals', render:renderL4M1, mount:mountL4M1 },
        { id:'l2m2', title:'Wired media: copper and fiber', render:renderL4M2, mount:mountL4M2 },
        { id:'l2m3', title:'Wireless media', render:renderL4M3 }
      ]},
    // LESSON 3 — addresses
    { id:'l3', title:'How devices are identified: addresses',
      taskId:null, quizId:'q_l3', modules:[
        { id:'l3m1', title:'Why we need addresses', render:renderWhyAddr },
        { id:'l3m2', title:'MAC address: the factory label', render:renderMac },
        { id:'l3m3', title:'IP address: the postal address', render:renderL2M2, mount:mountL2M2 },
        { id:'l3m4', title:'Your router has two addresses', render:renderRouterTwo, mount:mountRouterTwo }
      ]},
    // LESSON 4 — using the address
    { id:'l4', title:'How a device uses its address',
      taskId:null, quizId:'q_l4', modules:[
        { id:'l4m1', title:'ARP: finding the MAC for an IP', render:renderArp, mount:mountArp },
        { id:'l4m2', title:'Default gateway: the way out', render:renderGateway },
        { id:'l4m3', title:'DHCP: your automatic address', render:renderDhcp, mount:mountDhcp },
        { id:'l4m4', title:"When it does not work: first steps", render:renderTrouble }
      ]},
    // LESSON 5 — server and connection
    { id:'l5', title:'Finding a server and opening a connection',
      taskId:'port-test', quizId:'q_l5', modules:[
        { id:'l5m1', title:"DNS: the internet's phone book", render:renderDns, mount:mountDns },
        { id:'l5m2', title:'TCP and UDP: reliable vs. fast', render:renderTcpUdpSimple },
        { id:'l5m3', title:'Ports: the apartment number', render:renderPorts }
      ]},
    // LESSON 6 — web
    { id:'l6', title:'The language of the web',
      taskId:null, quizId:'q_l6', modules:[
        { id:'l6m1', title:'HTTP: how the browser talks to the server', render:renderHttp, mount:mountHttp },
        { id:'l6m2', title:'HTTPS and encryption: why the padlock', render:renderL5M3, mount:mountL5M3 },
        { id:'l6m3', title:"What HTTPS does not hide", render:renderHttpsHides }
      ]},
    // LESSON 7 — the whole journey
    { id:'l7', title:'The whole journey together',
      taskId:null, quizId:'q_l7', modules:[
        { id:'l7m1', title:'From click to loaded page', render:renderL6M3, mount:mountL6M3 },
        { id:'l7m2', title:'What now?', render:renderWhatNow, mount:mountWhatNow }
      ]}
  ]
};

/* ---------- locked future courses (teaser placeholders) ---------- */
/* ---------- quizzes as DATA ----------
   shape: { title, qs:[{ q, opts:[], correct, why }] }
   `correct` = index into the ORIGINAL (pre-shuffle) options.            */
const COURSE_1_QUIZZES_DEF = {
  // q_l1 — LESSON 1
  q_l1:{ title:'Quiz: Why networks', qs:[
    { q:'What are networks mainly for?',
      opts:['sharing data and resources between devices','speeding up a single home computer','protecting a computer from harmful viruses'],
      correct:0, why:'A network connects devices so they can share files, a printer, one internet connection.' },
    { q:'What is a message split into when it’s sent over a network?',
      opts:['into many small packets','into one big block of data','into several separate files'],
      correct:0, why:'A message is not sent whole – it travels as small packets, like letters in envelopes.' },
    { q:'What is the home router’s main job?',
      opts:['it connects the home network to the internet and decides what goes out','it stores and backs up files for absolutely all the devices in the network','it encrypts the content of absolutely all your outgoing messages and calls'],
      correct:0, why:'The router is the gateway between your home network and the internet – it decides what stays home and what goes out.' }
  ]},
  // q_l2 — LESSON 2: media
  q_l2:{ title:'Quiz: Media', qs:[
    { q:'How is a bit carried over optical fiber?',
      opts:['by light pulses','by electrical voltage','by radio waves'],
      correct:0, why:'Fiber carries data as flashes of light in a glass strand (1 = flash, 0 = dark).' },
    { q:'Which connection is the most stable?',
      opts:['a cable','Wi-Fi','mobile network'],
      correct:0, why:'A cable (twisted pair or fiber) is the steadiest and fastest – Wi-Fi and mobile both vary. Use a cable where you can.' },
    { q:'What is an access point (AP)?',
      opts:['a device that broadcasts the Wi-Fi signal','a cable running from the router to the internet','an antenna that only boosts a weak signal'],
      correct:0, why:'An AP broadcasts Wi-Fi and bridges wireless devices onto the wired network; at home it is part of the router.' }
  ]},
  // q_l3 — LESSON 3: addresses
  q_l3:{ title:'Quiz: Addresses', qs:[
    { q:'What is the difference between a MAC and an IP address?',
      opts:['MAC is hardware and local, IP is network-wide and works across the internet','they are really just two interchangeable labels for one and the same address','a MAC address is used only on Wi-Fi networks, whereas an IP only on cabled ones'],
      correct:0, why:'MAC is the card’s factory label (valid in one network); IP is a hierarchical address for routing across the internet.' },
    { q:'What is a private IP address?',
      opts:['an address for internal use that does not go out to the internet directly','a globally unique address assigned directly by your provider','a secret address that nobody in the world knows'],
      correct:0, why:'Private ranges (10.x, 172.16–31.x, 192.168.x) are valid only inside your network; you go out via the router’s public IP.' },
    { q:'Why does the router have one public IP address?',
      opts:['so the internet can reach you – the whole household hides behind it (NAT)','only so that the whole router is noticeably faster than it used to be','only so that it can keep broadcasting the Wi-Fi signal into its surroundings'],
      correct:0, why:'The router has one public IP from the provider; NAT translates the household’s private addresses to that single public one.' }
  ]},
  // q_l4 — LESSON 4: using the address
  q_l4:{ title:'Quiz: Using the address', qs:[
    { q:'What does ARP do?',
      opts:['it finds the MAC address for a given IP on the local network','it translates a website\'s domain name into its public IP address','it automatically assigns a newly connected device its IP address'],
      correct:0, why:'ARP broadcasts "who has this IP?" and the owner replies with its MAC address.' },
    { q:'Where do you send data for a target outside your network?',
      opts:['to the default gateway (the router)','straight to the target by its MAC','to the whole-network broadcast'],
      correct:0, why:'You cannot reach an off-network target directly – you send it to the default gateway, which forwards it on.' },
    { q:'What does DHCP automatically give you on joining?',
      opts:['an IP address, the default gateway and DNS','only the current connection speed','a secret encryption key to your Wi-Fi'],
      correct:0, why:'The DHCP server (in the home router) sends a bundle: an IP address, the gateway and the DNS server address.' },
    { q:'Nothing works at all. How do you tell whether the problem is in your local network or out on the internet?',
      opts:['ping the default gateway – if it does not answer, the problem is local','I’d rather first try restarting my internet browser','I’d try entering some completely different password to the home Wi-Fi'],
      correct:0, why:'Pinging the gateway (e.g. 192.168.1.1) is an "are you there?" test. If the gateway does not answer, it is stuck in your local network (cable, switch, Wi-Fi), not out on the internet.' }
  ]},
  // q_l5 — LESSON 5: server and connection
  q_l5:{ title:'Quiz: Server and connection', qs:[
    { q:'What does DNS do?',
      opts:['it translates a name (example.com) into an IP address','it encrypts the whole connection between you and the website','it auto-assigns your device its IP'],
      correct:0, why:'DNS is the internet’s phone book: it finds the server’s numeric IP from a name.' },
    { q:'How does TCP differ from UDP?',
      opts:['TCP is reliable with acknowledgments, UDP is fast without guarantees','UDP is encrypted end to end, whereas TCP is not','TCP, unlike UDP, does not use port numbers in its header'],
      correct:0, why:'TCP agrees first (handshake) and resends lost data; UDP just fires data – ideal for video, calls, games.' },
    { q:'What is a port for?',
      opts:['it tells apps apart on one device – like an apartment number','it sets the overall connection speed of each individual app','it is really just another name for the IP address itself'],
      correct:0, why:'IP is the building, the port is the apartment number: IP+port delivers data to the right app (80=HTTP, 443=HTTPS…).' }
  ]},
  // q_l6 — LESSON 6: web
  q_l6:{ title:'Quiz: The language of the web', qs:[
    { q:'How does HTTP work?',
      opts:['the browser sends a request, the server returns a response','on its own it encrypts the content between the two endpoints','it automatically assigns connected devices their IP addresses'],
      correct:0, why:'HTTP is the web’s language: a request (GET/POST) → a response with a status code (200, 404, 500) and the page body.' },
    { q:'What does HTTPS add over HTTP?',
      opts:['TLS encryption of the content','faster downloads','its own public IP address'],
      correct:0, why:'HTTPS = HTTP + TLS; only the two endpoints can read the content on the way (the padlock in your browser).' },
    { q:'What does HTTPS NOT hide?',
      opts:['which domain you connect to','your website login password','the very content of your sent message'],
      correct:0, why:'HTTPS encrypts the content, but the destination domain name (SNI), timing and data volume stay visible.' }
  ]},
  // q_l7 — LESSON 7: recap
  q_l7:{ title:'Quiz: The whole journey', qs:[
    { q:'In roughly what order does a page load after you connect?',
      opts:['DHCP → DNS → TCP → TLS → HTTP','HTTP → TCP → DNS → DHCP → TLS','DNS → DHCP → TLS → HTTP → TCP'],
      correct:0, why:'First you get an address (DHCP), resolve the name (DNS), open a connection (TCP), negotiate encryption (TLS), and only then the request goes (HTTP).' },
    { q:'Which address is valid only on the local network?',
      opts:['the MAC address','the public IP address','the DNS name'],
      correct:0, why:'MAC is local (delivery within one network); across the internet routing goes by IP.' },
    { q:'How does a device automatically get an IP address?',
      opts:['from DHCP','from DNS','via ARP'],
      correct:0, why:'DHCP assigns the IP (plus gateway and DNS) on joining; DNS resolves names, ARP finds MACs.' }
  ]}
};

// Final quiz: a few new connecting questions across topics + a mix from the lessons (a different selection each attempt).
const COURSE_1_FINAL_EXTRA_DEF=[
  { q:'You open a new website in the browser. What has to happen first of all?',
    opts:['the computer must have an IP address (DHCP gives it one if needed)','the page content downloads – the HTML and images arrive from the server','you check out in an e-shop – the browser sends the order to the server'],
    correct:0, why:'Without an address you cannot communicate – so the IP (usually from DHCP) comes first, then DNS, TCP and downloading the page.' },
  { q:'Which device connects you to the internet and hides the whole household behind one public address (NAT)?',
    opts:['the router','a switch','a DNS server'],
    correct:0, why:'The router is the gateway out and does NAT; a switch only connects devices inside, DNS resolves names.' },
  { q:'With HTTPS the content is encrypted. What can someone eavesdropping on the path still see?',
    opts:['which domain you connect to (the server name, SNI)','your passwords – sent outside the encrypted connection','the text of messages you send – only the address is encrypted'],
    correct:0, why:'HTTPS hides the content, not the address – WHERE you go (banka.cz) is visible, WHAT you do is not.' }
];
__regCourse(1,COURSE_1_DEF,COURSE_1_QUIZZES_DEF,COURSE_1_FINAL_EXTRA_DEF);
