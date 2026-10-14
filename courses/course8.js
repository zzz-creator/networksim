/* course8.js — content of Course 8 (split out of course.js; loaded on demand via course-core.js) */
/* ============================================================
   COURSE 8 — Advanced security (DPI, IDS/IPS). Shared scene c8Net (internet → FW → IDS/IPS → DMZ web + internal PC).
   ============================================================ */
var C8N={net:[50,100],fw:[180,100],ips:[310,100],web:[470,66],pc:[470,140]};
function c8Net(pfx){
  return '<svg id="'+pfx+'svg" viewBox="0 0 600 200" width="100%" style="display:block">'
    +'<line x1="66" y1="100" x2="166" y2="100" style="stroke:var(--line2);stroke-width:1.8"/>'
    +'<line x1="194" y1="100" x2="296" y2="100" style="stroke:var(--line2);stroke-width:1.8"/>'
    +'<line x1="322" y1="94" x2="456" y2="72" style="stroke:var(--line2);stroke-width:1.6"/>'
    +'<line x1="322" y1="106" x2="456" y2="134" style="stroke:var(--line2);stroke-width:1.6"/>'
    +'<g id="'+pfx+'glow"></g>'
    +csHost(50,100,'globe','--red','Internet')+csDev(180,100,'firewall','FW')+csDev(310,100,'idsips','IDS/IPS')
    +csHost(470,66,'server','--green','WEB · DMZ')+csHost(470,140,'desktop','--blue','PC')
    +'<g id="'+pfx+'dyn"></g></svg>';
}
function c8P(pfx,intro,terms){
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+intro+'</p>'
    +'<div class="osi-stage">'+c8Net(pfx)+'</div><div class="m1-cap" id="'+pfx+'cap"></div>'
    +courseStepControls(pfx)+abbrBox(terms);
}
function c8Mount(pfx,STEPS){
  function show(i){var g=$(pfx+'glow');if(g)g.innerHTML=STEPS[i].glow||'';var d=$(pfx+'dyn');if(d)d.innerHTML=STEPS[i].dyn||'';var c=$(pfx+'cap');if(c)c.innerHTML='<span>'+STEPS[i].cap+'</span>';}
  courseStepper(pfx,STEPS.length,show);
}
function c8g(name,color){var p=C8N[name];return csGlow(p[0],p[1],color,20);}
function c8all(color){return c8g('fw',color)+c8g('ips',color)+c8g('web',color)+c8g('pc',color);}
function c8lbl(x,y,tx,c){return '<text x="'+x+'" y="'+y+'" text-anchor="middle" style="font:700 7.5px var(--mono);fill:var('+c+')">'+esc(tx)+'</text>';}
function c8pkt(p1,p2,color,dur){return '<rect x="-6" y="-4" width="12" height="9" rx="2" style="fill:var('+color+')"><animateMotion path="M '+p1+' L '+p2+'" dur="'+(dur||'1.3s')+'" repeatCount="indefinite"/></rect>';}
// L1M1 — what a basic firewall sees
function renderC8WhatFwSees(){return c8P('c8a',
  'In the Network security course we built a firewall that decides by <b>zones, IP addresses and ports</b> (layers L3/L4). That stops a lot – but the firewall <b>can’t see inside</b> the packet. It knows "TCP to port 443 from outside to the DMZ", but <b>not WHAT</b> is in that traffic. And the <b>content</b> is exactly where most attacks hide today. This course adds a layer that looks <b>deeper</b>: stateful inspection, DPI and IDS/IPS.',
  [['L3/L4 filtering','deciding by IP addresses (L3) and ports/protocol (L4) – what a classic firewall does.'],['DPI','Deep Packet Inspection – checking the CONTENT of a packet, not just addresses and ports.']]);}
function mountC8WhatFwSees(){c8Mount('c8a',[
  {glow:c8g('net','--cyan')+c8g('fw','--green'),dyn:c8pkt('66 100','166 100','--cyan'),cap:'The firewall sees "TCP 443 from the internet to the DMZ" – <b>addresses and a port</b>. By those it permits or drops.'},
  {glow:c8g('fw','--amber'),dyn:c8lbl(180,74,'content? can’t see','--amber'),cap:'But <b>what’s inside</b> (which HTTP request, what data) the firewall <b>can’t see</b>. An attack hidden in an allowed port slips through.'},
  {glow:c8all('--cyan'),dyn:c8lbl(310,74,'IDS/IPS + DPI','--cyan'),cap:'So we add a device that looks <b>into the content</b> – DPI and IDS/IPS. That’s this whole course.'}
]);}
// L1M2 — a packet has content too
function renderC8Payload(){return c8P('c8b',
  ('Every packet has two parts: <b>headers</b> (who to whom, which port – that’s what the firewall sees) and the <b>payload</b> (the actual data – the request content, a chunk of a file, a command). An attack is rarely recognizable from the header; it’s recognizable from the <b>content</b>: the payload <code>'+esc("' OR '1'='1")+'</code> is SQL injection (SQL = the query language for databases; this trick fools the query into returning everything or letting you in without a password), the string <code>/etc/passwd</code> is an attempt to read system files, a certain byte pattern is known malware. To catch attacks like that you must read the payload – and that’s what <b>DPI</b> does.'),
  [['payload','the packet’s actual data (content), after the headers; most attacks hide there.'],['header','the packet’s addresses and ports; the firewall decides by these, not the content.']]);}
function mountC8Payload(){c8Mount('c8b',[
  {glow:c8g('fw','--cyan'),dyn:c8lbl(180,74,'header: 443 ✓','--cyan'),cap:'Header: "TCP 443 to the DMZ". The firewall reads it and permits – looks harmless.'},
  {glow:c8g('web','--red'),dyn:c8lbl(470,40,"payload: ' OR '1'='1",'--red'),cap:'But the <b>payload</b> carries SQL injection. From the header alone you can’t tell – you must read the <b>content</b>.'},
  {glow:c8g('ips','--green'),dyn:c8lbl(310,74,'DPI reads content','--green'),cap:'<b>DPI</b> peeks into the payload and compares it against <b>attack patterns</b> (signatures). That’s how it spots an attack inside an allowed port.'}
]);}
// L1M3 — tunneling
function renderC8Tunnel(){return c8P('c8c',
  'Attackers know the firewall allows a few ports (80, 443, 53…). So they <b>hide their traffic in exactly those</b> – this is called <b>tunneling</b>. Malware can talk to its command server (C2) over <b>DNS queries</b> or wrap data in <b>HTTPS</b> that looks like ordinary browsing. To the firewall (L3/L4) it’s "allowed port 443", and it lets it through. Spotting it is only possible <b>from behavior and content</b> – another reason for deep inspection and IDS/IPS.',
  [['tunneling','hiding disallowed traffic inside an allowed port/protocol (e.g. C2 over DNS or HTTPS).'],['C2','Command &amp; Control – the attacker’s control server that malware talks to.']]);}
function mountC8Tunnel(){c8Mount('c8c',[
  {glow:c8g('pc','--red')+c8g('ips','--red'),dyn:c8pkt('456 134','322 106','--red'),cap:'An infected PC inside wants out to its <b>C2 server</b>. A direct channel the firewall would cut.'},
  {glow:c8g('fw','--amber'),dyn:c8lbl(180,74,'looks like DNS/443','--amber'),cap:'So it hides in <b>DNS queries</b> or HTTPS. The firewall sees only "an allowed port" and <b>lets it through</b>.'},
  {glow:c8g('ips','--green'),dyn:c8lbl(310,74,'by behavior/content','--green'),cap:'Spotting it needs <b>deep inspection and behavior</b> (oddly many DNS queries, a suspicious pattern). Hence IDS/IPS.'}
]);}
// L2M1 — connection table
function renderC8ConnTable(){return c8P('c8d',
  'Back to the <b>stateful</b> firewall from the Network security course – but deeper. A stateful firewall keeps a <b>connection table</b>: for each established connection it remembers who started it, to which port, and what state it’s in. That is how it recognizes the <b>reply</b> to an allowed connection and lets it back <b>automatically</b> – without you writing a rule for the return direction. And conversely: a packet that <b>doesn’t belong</b> to any entry in the table is suspicious.',
  [['connection table','the list of active connections a stateful firewall keeps to recognize replies and state.'],['stateful inspection','deciding in the context of the whole connection, not a single packet.']]);}
function mountC8ConnTable(){c8Mount('c8d',[
  {glow:c8g('pc','--green')+c8g('ips','--green')+c8g('fw','--green'),dyn:'<rect x="-6" y="-4" width="12" height="9" rx="2" style="fill:var(--green)"><animateMotion path="M 456 134 L 322 106 L 194 100" dur="1.7s" repeatCount="indefinite"/></rect>'+c8lbl(180,74,'recorded in the connection table','--green'),cap:'A PC inside opens a connection out (e.g. web on 443). The traffic reaches the <b>firewall</b>, which <b>records it in the table</b>.'},
  {glow:c8g('fw','--green'),dyn:c8pkt('166 100','194 100','--cyan')+c8lbl(180,74,'reply matches connection','--green'),cap:'The server’s reply is <b>found</b> in the table → the firewall lets it back <b>automatically</b>, no manual return rule.'},
  {glow:c8g('fw','--red'),dyn:c8lbl(180,74,'unsolicited packet = drop','--red'),cap:'A packet that <b>matches nothing in the table</b> (unsolicited from outside) is suspicious and gets dropped.'}
]);}
// L2M2 — TCP states
function renderC8TcpStates(){return c8P('c8e',
  'To know a connection’s "state", the firewall watches the <b>TCP handshake</b> (covered in the ISO/OSI and TCP/IP course). A new TCP connection starts with the trio <b>SYN → SYN-ACK → ACK</b> (SYN = synchronize, ACK = acknowledge; like "I call – you answer – I confirm"). Only after it is the connection <b>established</b>. A stateful firewall watches this: a packet in the middle that pretends to be an established connection without a handshake is a <b>fake</b>. Tracking state is the foundation that attack detection like SYN flood builds on.',
  [['TCP handshake','SYN → SYN-ACK → ACK; the three-way setup of a TCP connection.'],['established','the state of an established connection after the handshake completes.']]);}
function mountC8TcpStates(){
  var FWD='M 66 100 L 166 100 L 194 100 L 296 100 L 322 94 L 456 72';
  var REV='M 456 72 L 322 94 L 296 100 L 194 100 L 166 100 L 66 100';
  var pk=function(p,c,dur,begin){return '<rect x="-6" y="-4" width="12" height="9" rx="2" style="fill:var('+c+')"><animateMotion path="'+p+'" dur="'+dur+'" begin="'+(begin||'0s')+'" repeatCount="indefinite"/></rect>';};
  var ALL=function(c){return c8g('net',c)+c8g('fw',c)+c8g('ips',c)+c8g('web',c);};
  c8Mount('c8e',[
  {glow:ALL('--cyan'),dyn:pk(FWD,'--cyan','1.6s')+c8lbl(180,74,'SYN →','--cyan'),cap:'The client sends <b>SYN</b> – "I want a connection". The firewall notes a <b>half-open</b> connection.'},
  {glow:ALL('--cyan'),dyn:pk(REV,'--violet','1.6s')+pk(FWD,'--cyan','1.6s','1.6s')+c8lbl(180,74,'← SYN-ACK · ACK →','--cyan'),cap:'The server replies <b>SYN-ACK</b>, the client confirms <b>ACK</b>. The three-way setup is done.'},
  {glow:ALL('--green'),dyn:pk(FWD,'--green','1.4s')+pk(REV,'--green','1.4s','0.7s')+c8lbl(180,74,'established ✓','--green'),cap:'Now the connection is <b>established</b> and <b>data flows both ways</b>. A packet without this handshake posing as established the firewall <b>spots</b>.'}
]);}
// L2M3 — SYN flood
function renderC8SynFlood(){return c8P('c8f',
  'Now an attack that abuses state: <b>SYN flood</b>. The attacker sends a <b>flood of SYN</b> packets but <b>never completes</b> the handshake (no ACK). The server holds many <b>half-open</b> connections, waits for confirmation, its <b>queue of half-open connections</b> fills up and it <b>stops accepting</b> legitimate clients – that’s a <b>DoS</b> (denial of service). A stateful firewall / IPS spots it by the <b>pattern</b> (unusually many SYNs without a completed handshake) and starts <b>dropping</b> or rate-limiting them. The server can also defend itself (not drawn in the animation below) with <b>SYN cookies</b>: it keeps no state for the half-open connection at all – it encrypts the needed info straight into the number it has to send anyway, and reads it back from the client’s reply.',
  [['SYN flood','a flood of SYNs without completing the handshake; it exhausts the half-open connection table.'],['DoS','Denial of Service – overwhelming a service so it stops serving legitimate users.']]);}
function mountC8SynFlood(){var f=function(){var o='';for(var i=0;i<4;i++)o+='<rect x="-5" y="-4" width="10" height="8" rx="2" style="fill:var(--red)"><animateMotion path="M 66 '+(80+i*12)+' L 456 '+(60+i*5)+'" dur="0.9s" begin="'+(i*0.18)+'s" repeatCount="indefinite"/></rect>';return o;};c8Mount('c8f',[
  {glow:c8g('net','--red')+c8g('fw','--red')+c8g('ips','--red')+c8g('web','--amber'),dyn:f(),cap:'The attacker spews <b>SYN after SYN</b>… but never sends ACK. The connections stay <b>half-open</b>.'},
  {glow:c8g('web','--red'),dyn:c8lbl(470,40,'table full → DoS','--red'),cap:'The server <b>runs out</b> of its half-open table and stops accepting even <b>legitimate</b> clients. That’s a DoS.'},
  {glow:c8g('ips','--green'),dyn:c8lbl(310,74,'SYN-without-ACK pattern → block','--green'),cap:'The IPS spots the <b>pattern</b> (too many SYN without ACK) and starts <b>dropping</b>/limiting them. The server keeps breathing.'}
]);}
// L3M1 — what DPI is
function renderC8Dpi(){return c8P('c8g',
  '<b>DPI (Deep Packet Inspection)</b> = deep inspection: the device <b>unwraps the packet down to the payload</b> and reads the <b>content</b> too, not just headers. Instead of "port 443 allowed" it asks "<b>what exactly</b> is that HTTP request doing?". This catches attacks hidden in allowed traffic (SQL injection, file reads, known malware) and recognizes the application regardless of port. The price is <b>performance</b> (reading content costs more than just a header) and with encrypted traffic a <b>problem</b> – next module.',
  [['DPI','Deep Packet Inspection – reading the content (payload) of a packet, not just headers.'],['signature','a pattern (string/regex) describing a specific attack; DPI looks for it in the content.']]);}
function mountC8Dpi(){c8Mount('c8g',[
  {glow:c8g('fw','--cyan')+c8g('ips','--cyan'),dyn:c8pkt('166 100','296 100','--cyan'),cap:'Traffic reaches the device with <b>DPI</b>. It doesn’t just pass it – first it looks inside.'},
  {glow:c8g('ips','--violet'),dyn:c8lbl(310,74,'unwrap payload, compare','--violet'),cap:'DPI <b>unwraps the payload</b> and compares it against <b>signatures</b> (attack patterns). It looks for "/etc/passwd", SQLi patterns, malware.'},
  {glow:c8g('ips','--green'),dyn:c8lbl(310,74,'match? flag/block','--green'),cap:'On a <b>match</b> it flags (IDS) or blocks (IPS). You will write your own signature later in this course (the IPS – prevention lesson).'}
]);}
// L3M2 — application signatures
function renderC8Sigs(){return c8P('c8h',
  'How does DPI recognize an attack? By <b>signatures</b> – exact patterns in the content. A signature can be a <b>string</b> (the payload contains <code>/etc/passwd</code>), a <b>regular expression</b> (an SQL injection pattern) or a <b>fingerprint</b> of known malware. Vendors ship large <b>signature sets</b> that update continuously (new threats arrive daily). The strength of signatures is precision on <b>known</b> attacks; the weakness is that a <b>new, unknown</b> attack with no signature slips through – which is why <b>anomaly</b> detection is added (next lesson).',
  [['signature set','a continuously updated vendor database of known-attack patterns.'],['regex','a regular expression – a flexible pattern that catches variants of the same attack.']]);}
function mountC8Sigs(){c8Mount('c8h',[
  {glow:c8g('ips','--cyan'),dyn:c8lbl(310,74,"\""+"/etc/passwd\" · regex SQLi",'--cyan'),cap:'A signature = a pattern: the string "/etc/passwd", a regex for SQL injection, a malware fingerprint.'},
  {glow:c8g('web','--red')+c8g('ips','--green'),dyn:c8lbl(470,40,'payload matches pattern','--red')+c8lbl(310,74,'match ✓','--green'),cap:'When the payload <b>matches</b> a pattern, it’s a <b>hit</b> = a known attack. DPI catches it.'},
  {glow:c8g('ips','--amber'),dyn:c8lbl(310,74,'unknown attack? slips by','--amber'),cap:'Weakness: a <b>new</b> attack with no signature matches nothing → it slips by. <b>Anomaly</b> detection fills that gap.'}
]);}
// L3M3 — TLS inspection / MITM
function renderC8Tls(){return c8P('c8i',
  'A big catch: most traffic today is <b>encrypted (HTTPS/TLS)</b>. But DPI needs to <b>see the content</b> – and it’s hidden inside the encryption. The enterprise solution is <b>TLS inspection</b>: the security device acts as a <b>controlled man-in-the-middle (MITM)</b> – unlike an attacker, though, the company does this on <b>its own</b> device, with <b>your consent</b> (in the employment/policy terms) and its <b>own</b> certificate, which is what makes it legitimate rather than an attack. It <b>decrypts</b> the connection, inspects it, and <b>re-encrypts</b> it onward. It only works because the company installs its <b>own root (CA) certificate</b> on its devices – with it the device can mint a certificate for each site that the endpoints trust (because that pre-installed company certificate signed it). It’s powerful but sensitive: it touches privacy, is demanding, and done badly it <b>weakens security</b>. So it’s deployed thoughtfully. Even without decrypting, the network still sees at least <b>metadata</b> – e.g. the server name and the volume of data.',
  [['TLS inspection','controlled decryption of traffic for inspection, then re-encryption onward.'],['MITM','Man-in-the-Middle – a party between client and server; here controlled and authorized.']]);}
function mountC8Tls(){c8Mount('c8i',[
  {glow:c8g('ips','--amber'),dyn:c8lbl(310,74,'HTTPS = content hidden','--amber')+c8lbl(300,182,'visible metadata: server name · data volume · timing','--muted'),cap:'The traffic is <b>encrypted</b>. DPI would love to read the content, but sees only ciphertext – all it keeps is <b>metadata</b> (server name, data volume and timing). Now what?'},
  {glow:c8g('ips','--violet'),dyn:c8lbl(310,74,'decrypt → inspect → re-encrypt','--violet'),cap:'<b>TLS inspection</b>: the device decrypts (as a controlled MITM), inspects and re-encrypts. It works thanks to the <b>company root certificate</b> pre-installed in the devices’ trusted-certificate store – the browser therefore trusts the minted certificate and raises no error.'},
  {glow:c8g('ips','--red'),dyn:c8lbl(310,74,'privacy + risk','--red'),cap:'Powerful but sensitive: it touches <b>privacy</b>, is demanding, and done badly <b>weakens</b> security. Deploy thoughtfully.'}
]);}
// L4M1 — IDS as a camera
function renderC8Ids(){return c8P('c8j',
  '<b>IDS (Intrusion Detection System)</b> = intrusion detection. Think of it as a <b>security camera</b>: it sits <b>off the traffic path</b> (gets a copy via TAP/SPAN), <b>watches</b> the traffic, and when it sees an attack it <b>raises an alarm (alert)</b> – but <b>doesn’t intervene</b>, doesn’t block traffic. Upside: it slows nothing and never blocks anything by mistake. Downside: it only <b>records</b> the attack, doesn’t stop it – someone has to see it and react. In the simulator you switch the sensor to IDS mode and see "ALERT" without blocking.',
  [['IDS','Intrusion Detection System – off-path; it records and reports an attack, but doesn’t block.'],['TAP/SPAN','a copy of the traffic sent to the IDS sensor so it can watch without being in the path.']]);}
function mountC8Ids(){var tap=function(c){return '<line x1="310" y1="126" x2="310" y2="152" style="stroke:var('+c+');stroke-width:1.4;stroke-dasharray:4 3"/>'
    +'<rect x="252" y="152" width="116" height="22" rx="6" style="fill:var(--panel);stroke:var('+c+');stroke-width:1.2"/>'
    +'<text x="310" y="167" text-anchor="middle" style="font:700 7.5px var(--mono);fill:var('+c+')">'+esc('IDS · copy (TAP/SPAN)')+'</text>';};c8Mount('c8j',[
  {glow:c8g('ips','--cyan'),dyn:tap('--cyan')+c8lbl(310,74,'traffic keeps flowing here','--cyan'),cap:'The IDS sits <b>off the path</b> – it only taps a <b>copy</b> of the traffic off the link (TAP/SPAN). Traffic flows on with or without it.'},
  {glow:c8g('net','--red')+c8g('fw','--red')+c8g('web','--amber')+c8g('ips','--amber'),dyn:c8pkt('66 100','456 72','--red')+tap('--amber')+c8lbl(310,74,'ALERT','--amber'),cap:'It sees an attack → <b>raises an alarm</b> (ALERT to the central log). But it <b>doesn’t stop</b> the traffic – only records it.'},
  {glow:c8g('web','--red'),dyn:tap('--muted')+c8lbl(470,40,'the attack still arrived','--red'),cap:'The attack <b>still reached</b> the target – the IDS is only on a branch, traffic never passes through it. IDS is a witness, not a guard. If no one acts on the alert, nothing’s solved.'}
]);}
// L4M2 — signature vs anomaly
function renderC8Anomaly(){return c8P('c8k',
  'IDS/IPS recognizes threats in two ways. <b>Signature-based</b> (by patterns) is precise on <b>known</b> attacks but misses unknown ones. <b>Anomaly-based</b> first learns what <b>normal traffic</b> looks like (a baseline) and then reports <b>deviations</b> – say a server that suddenly sends gigabytes out at night, or ten times the usual DNS queries. Upside: it catches <b>new</b> attacks with no signature. Downside: more <b>false alarms</b> (unusual ≠ always bad). In practice the two approaches are <b>combined</b>.',
  [['signature-based','detection by known patterns; precise on known, blind to unknown attacks.'],['anomaly-based','detection of deviations from a learned baseline; catches new attacks but yields false alarms.']]);}
function mountC8Anomaly(){c8Mount('c8k',[
  {glow:c8g('ips','--cyan'),dyn:c8lbl(310,74,'signature: known attack ✓','--cyan'),cap:'<b>Signature-based</b>: the payload matches a known pattern → a sure hit. But it won’t catch an unknown attack.'},
  {glow:c8g('ips','--violet'),dyn:c8lbl(310,74,'baseline: this is normal','--violet'),cap:'<b>Anomaly-based</b>: first it learns the <b>normal</b> traffic (a baseline).'},
  {glow:c8g('pc','--red'),dyn:c8lbl(370,192,'10× more DNS at night?!','--red'),cap:'Then it reports <b>deviations</b> – a sudden data exfil, oddly many DNS. It catches new attacks, but at the cost of <b>false alarms</b>. Hence the approaches are combined.'}
]);}
// L4M3 — alert fatigue + task
function renderC8AlertFatigue(){return c8P('c8l',
  'A big practical problem with detection: <b>alert fatigue</b>. When a system spews <b>thousands</b> of alerts a day and most are false alarms, the team <b>stops taking them seriously</b> – and the <b>one real</b> attack drowns in the noise. So alerts are <b>tuned</b> (reduce noise), <b>triaged by severity</b> and funneled into a <b>SIEM</b>, where they’re correlated. Detection without response is useless – and you can’t respond if you can’t make sense of the alerts. Now in the <b>ids-to-ips</b> task you’ll try the difference between "just alert" and "block outright".',
  [['alert fatigue','overload with false alarms that lets a real attack slip through unnoticed.'],['SIEM','Security Information and Event Management – collecting and correlating logs/alerts across the network.']]);}
function mountC8AlertFatigue(){c8Mount('c8l',[
  {glow:c8g('ips','--amber'),dyn:c8lbl(310,74,'1000+ alerts/day','--amber'),cap:'Detection spews <b>thousands</b> of alerts, most false. The team stops watching them.'},
  {glow:c8g('web','--red'),dyn:c8lbl(470,40,'the real one drowned','--red'),cap:'And in that noise the <b>one real</b> attack drowns. That’s alert fatigue.'},
  {glow:c8g('ips','--green'),dyn:c8lbl(310,74,'tuning + SIEM + IPS','--green'),cap:'The fix: <b>tune</b> alerts, triage, correlate in a <b>SIEM</b> – and let critical things <b>block outright (IPS)</b>. You’ll try that in the ids-to-ips task.'}
]);}
// L5M1 — IPS as a guard
function renderC8Ips(){return c8P('c8m',
  '<b>IPS (Intrusion Prevention System)</b> = intrusion prevention. Unlike IDS (a camera off the path), an IPS sits <b>directly in the traffic path (inline)</b> – it’s a <b>guard</b> everything must pass through. When it sees an attack, it <b>doesn’t stop at an alarm</b> – it <b>drops/blocks</b> it outright, so it never reaches the target. The price: because it’s in the path, its <b>failure or slowness</b> affects traffic, and a <b>false alarm</b> blocks something legitimate. So an IPS is carefully <b>tuned</b>. In the simulator the sensor in IPS mode is exactly this – inline blocking.',
  [['IPS','Intrusion Prevention System – inline (in the path); it blocks an attack outright, not just records it.'],['inline','the device sits directly in the traffic path, so it can stop traffic.']]);}
function mountC8Ips(){c8Mount('c8m',[
  {glow:c8g('ips','--cyan'),dyn:c8lbl(310,74,'inline – everything passes here','--cyan'),cap:'The IPS sits <b>directly in the path</b>. All traffic must pass through it – it’s a guard, not a camera.'},
  {glow:c8g('net','--red')+c8g('fw','--red')+c8g('ips','--red'),dyn:c8pkt('66 100','296 100','--red')+c8lbl(310,74,'match → drop','--red'),cap:'It sees an attack → <b>drops it outright</b>. It never reaches the web server. That’s the difference from IDS.'},
  {glow:c8g('web','--green'),dyn:c8lbl(470,40,'target clean ✓','--green'),cap:'The target stayed <b>clean</b>. The cost: an IPS in the path – its failure or a false alarm affects traffic. So it’s tuned.'}
]);}
// L5M2 — detection vs prevention + tuning
function renderC8Tuning(){return c8P('c8n',
  'The key decision: <b>detect or block?</b> IDS (detection) is <b>safe</b> for traffic but won’t stop the attack. IPS (prevention) stops the attack, but a <b>false alarm hurts</b> – it blocks something legitimate. So a new signature is often first deployed in <b>alert-only mode</b>, watched to see if it hits benign traffic, and only once <b>tuned</b> switched to blocking. Good <b>tuning</b> balances <b>false positives</b> (blocking the good) and <b>false negatives</b> (letting the bad through). That’s the security team’s daily work.',
  [['false positive','a false alarm – the system flags/blocks benign traffic.'],['false negative','a missed attack – the system didn’t recognize it.']]);}
function mountC8Tuning(){
  var FWD='M 66 100 L 166 100 L 194 100 L 296 100 L 322 94 L 456 72';
  var STOP='M 66 100 L 166 100 L 194 100 L 296 100';
  var CHAIN=function(c){return c8g('net',c)+c8g('fw',c)+c8g('ips',c);};
  var pk=function(p,c,dur,begin){return '<rect x="-6" y="-4" width="12" height="9" rx="2" style="fill:var('+c+')"><animateMotion path="'+p+'" dur="'+dur+'" begin="'+(begin||'0s')+'" repeatCount="indefinite"/></rect>';};
  c8Mount('c8n',[
  {glow:CHAIN('--amber')+c8g('web','--amber'),dyn:pk(FWD,'--amber','1.7s')+c8lbl(310,74,'new signature → alert only','--amber'),cap:'You first deploy a new signature <b>as alert only</b> (like IDS) and watch what it hits.'},
  {glow:CHAIN('--red'),dyn:pk(STOP,'--green','1.5s')+c8lbl(310,74,'legitimate traffic blocked ✕','--red'),cap:'If it blocked right away, it would also stop <b>legitimate</b> traffic (a false positive) – the green packet never reaches the web server. You <b>tune</b> it to be precise.'},
  {glow:CHAIN('--green')+c8g('web','--green'),dyn:pk(FWD,'--green','1.5s')+pk(STOP,'--red','1.5s','0.4s')+c8lbl(310,74,'tuned → good passes, bad stops','--green'),cap:'Only once <b>tuned</b> do you switch it to <b>blocking (IPS)</b>: the legitimate packet reaches the web server, the attack one dies at the IPS. A balance between "block the good" and "let the bad through".'}
]);}
// L5M3 — custom signature (task)
function renderC8CustomSig(){return c8P('c8o',
  'Sometimes no off-the-shelf signature catches an attack – say a targeted attack on <b>your</b> application. Then you write a <b>custom DPI signature</b>: a pattern (string or regex) searched in the payload. The key is to write it so it <b>catches the attack</b> but <b>doesn’t block benign</b> traffic (no false alarms). You’ll try this now in the <b>ips-custom</b> task (advanced mode): a payload with <code>/etc/passwd</code> targets the web, no category catches it – you write a signature that catches that string and verify a benign request passes.',
  [['ips-custom','the task: write a custom DPI signature that catches the attack while letting benign traffic through.'],['custom signature','a pattern you define yourself for an attack that off-the-shelf rules don’t cover.']]);}
function mountC8CustomSig(){c8Mount('c8o',[
  {glow:c8g('net','--red')+c8g('fw','--red')+c8g('ips','--red')+c8g('web','--red'),dyn:c8pkt('66 100','456 72','--red')+c8lbl(470,40,'payload: /etc/passwd','--red'),cap:'A targeted attack with <code>/etc/passwd</code> hits the web. No off-the-shelf category catches it.'},
  {glow:c8g('ips','--violet'),dyn:c8lbl(310,74,'write the pattern "/etc/passwd"','--violet'),cap:'In the IPS (advanced mode) you write a <b>custom signature</b> for that string.'},
  {glow:c8g('ips','--green'),dyn:c8lbl(310,74,'attack blocked · benign passes','--green'),cap:'The attack is <b>blocked</b>, a benign request (GET /index.html) <b>passes</b>. That’s exactly the <b>ips-custom</b> task.'}
]);}
// L6M1 — port scan
function renderC8PortScan(){return c8P('c8p',
  'Real attacks rarely start "head-on". First comes <b>reconnaissance</b> – typically a <b>port scan</b>: the attacker systematically tries <b>which ports</b> are open on the target to find a way in. From the network’s view it looks like <b>many connections to different ports</b> from one address in a short time – a distinct <b>pattern</b> that IDS/IPS recognizes. A port scan itself does no harm, but it’s a <b>precursor</b>: someone is mapping your surface before attacking.',
  [['port scan','systematically probing a target’s open ports – reconnaissance before an attack.'],['reconnaissance','the recon phase: the attacker maps the target before striking.']]);}
function mountC8PortScan(){var f=function(){var o='';for(var i=0;i<5;i++)o+='<rect x="-4" y="-3" width="8" height="6" rx="1" style="fill:var(--amber)"><animateMotion path="M 66 100 L 456 '+(50+i*11)+'" dur="0.8s" begin="'+(i*0.14)+'s" repeatCount="indefinite"/></rect>';return o;};c8Mount('c8p',[
  {glow:c8g('net','--amber')+c8g('fw','--amber')+c8g('ips','--amber')+c8g('web','--amber'),dyn:f(),cap:'The attacker tries <b>port after port</b> – 22? 80? 443? 3389? Looking for a way in.'},
  {glow:c8g('ips','--cyan'),dyn:c8lbl(310,74,'many ports from 1 IP = pattern','--cyan'),cap:'Many connections to <b>different ports</b> from one address = a clear <b>port-scan pattern</b>. IDS/IPS spots it.'},
  {glow:c8g('ips','--green'),dyn:c8lbl(310,74,'precursor → watch/block','--green'),cap:'The scan itself is harmless, but it’s a <b>precursor</b>. You can watch the source or block it before it attacks.'}
]);}
// L6M2 — SQLi over HTTPS + lateral
function renderC8Sqli(){return c8P('c8q',
  ('When the attacker finds a web app, they try to break it – e.g. <b>SQL injection (SQLi)</b>: slipping a piece of SQL (<code>'+esc("' OR '1'='1")+'</code>) into a form/URL to pull data from the database or bypass login. And because the web runs over <b>HTTPS</b>, the payload is <b>encrypted</b> – an ordinary firewall doesn’t see it; only DPI <b>after TLS inspection</b> catches it (the simulator simplifies encryption – the IPS sees the payload directly; in reality TLS inspection would have to sit in front of it). Once the attacker lands on one server, they try <b>lateral movement</b>: spreading from it to <b>other</b> machines on the network. Here <b>segmentation</b> (VLANs/zones from the Switching and VLANs and Network security courses) pays off – it limits how far they get.'),
  [['SQLi','SQL injection – slipping SQL into an app’s input to read/bypass the database.'],['lateral movement','spreading from the first compromised machine to others on the network.']]);}
function mountC8Sqli(){c8Mount('c8q',[
  {glow:c8g('net','--red')+c8g('fw','--red')+c8g('ips','--red')+c8g('web','--red'),dyn:c8pkt('66 100','456 72','--red')+c8lbl(470,40,"' OR '1'='1",'--red'),cap:'The attacker slips <b>SQL injection</b> to the web server. Over HTTPS the payload is encrypted – only DPI after <b>TLS inspection</b> catches it (simplified in the simulator: the IPS sees the payload directly).'},
  {glow:c8g('web','--amber')+c8g('pc','--red'),dyn:c8pkt('470 80','470 130','--red')+c8lbl(370,192,'jump to the next host','--amber'),cap:'If it works, they try <b>lateral movement</b>: spreading from the web to <b>other</b> servers and hosts.'},
  {glow:c8g('ips','--green'),dyn:c8lbl(310,74,'segmentation limits the blast','--green'),cap:'<b>Segmentation</b> (VLANs/zones) and IPS <b>limit</b> the attack’s reach – it can’t get everywhere. Defense is layered.'}
]);}
// L6M3 — C2 over DNS
function renderC8C2(){return c8P('c8r',
  'The last piece of the chain: the compromised host needs to <b>talk to the attacker</b> (download more tools, send stolen data). To hide that channel from the firewall, it tucks it into a <b>commonly allowed protocol</b> – often <b>DNS</b> (few block DNS) or HTTPS. Data is chopped into <b>DNS queries</b> for odd subdomains. The firewall sees "normal DNS" and lets it pass. It’s revealed mainly by <b>behavior</b> (anomaly: unusually many DNS, long random names) and DPI over DNS – exactly what anomaly-based detection and deep inspection do.',
  [['C2 over DNS','a covert control/exfil channel hidden in DNS queries to look harmless.'],['exfiltration','leaking stolen data out of the network, often covertly in small chunks.']]);}
function mountC8C2(){var f=function(){var o='';for(var i=0;i<4;i++)o+='<rect x="-4" y="-3" width="8" height="6" rx="1" style="fill:var(--red)"><animateMotion path="M 456 134 L 66 100" dur="1s" begin="'+(i*0.22)+'s" repeatCount="indefinite"/></rect>';return o;};c8Mount('c8r',[
  {glow:c8g('pc','--red')+c8g('ips','--red')+c8g('fw','--red')+c8g('net','--red'),dyn:f(),cap:'The compromised PC sends data out – hidden in <b>DNS queries</b> to odd subdomains.'},
  {glow:c8g('fw','--amber'),dyn:c8lbl(180,74,'"normal DNS" → passes','--amber'),cap:'The firewall sees only <b>allowed DNS</b> and lets it pass. A classic L3/L4 firewall doesn’t spot it.'},
  {glow:c8g('ips','--green'),dyn:c8lbl(310,74,'anomaly: too much DNS → caught','--green'),cap:'Behavior reveals it: unusually many DNS, long random names. That’s the job of anomaly detection and DPI. You will try stopping one of this lesson’s attacks yourself – <b>SQLi</b> against a web server – in the task at the end of this lesson.'}
]);}
// L6M4 — XSS
function renderC8Xss(){return c8P('c8v',
  ('The second classic web attack: <b>XSS (cross-site scripting)</b>. While SQLi attacks the <b>database</b>, XSS attacks the <b>site’s visitors</b>: the attacker slips a piece of <b>JavaScript</b> into the page (a comment, form, URL) – e.g. <code>'+esc('<script>steal(cookie)<\/script>')+'</code>. The site stores it and then <b>serves it to others</b>: the victim’s browser runs the script as if it belonged to the site, handing the attacker a session cookie or login. On the wire it looks like ordinary web traffic – but an <b>IPS with DPI</b> recognizes typical XSS patterns in the content (script tags in inputs) and blocks the request before it is stored. In the simulator: pick the <b>XSS</b> content in the traffic test and enable the XSS category on the IPS.'),
  [['XSS','cross-site scripting – slipping a script into a page that then runs in other visitors’ browsers.'],['session cookie','the login identifier in the browser – whoever steals it is "logged in" as the victim.']]);}
function mountC8Xss(){c8Mount('c8v',[
  {glow:c8g('net','--red')+c8g('fw','--red')+c8g('ips','--red')+c8g('web','--red'),dyn:c8pkt('66 100','456 72','--red')+c8lbl(470,40,'<script>…<\/script>','--red'),cap:'The attacker submits a <b>script</b> into the site’s form. Goal: get the site to store it and serve it to other visitors.'},
  {glow:c8g('web','--amber')+c8g('pc','--red'),dyn:c8pkt('470 80','470 130','--red')+c8lbl(370,192,'the script runs at the victim','--red'),cap:'The victim opens the page – the script <b>runs in their browser</b> and sends the attacker the session cookie. The victim did nothing wrong.'},
  {glow:c8g('ips','--green'),dyn:c8lbl(310,74,'DPI: a script in the input → block','--green'),cap:'An <b>IPS with DPI</b> spots script patterns in inputs and blocks the request before it is stored. The second layer: the site itself must <b>sanitize</b> (escape) inputs – the IPS is a safety net, not a substitute.'}
]);}
// L7M1 — defense in depth
function renderC8DefenseDepth(){return c8P('c8s',
  'No single layer is enough. Security is <b>defense in depth</b>: if one layer fails, the next catches it. An attack from the internet hits, in order, the <b>firewall</b> (zones, ports – the Network security course), the <b>IDS/IPS with DPI</b> (content – this course), inside it <b>segmentation</b> by VLANs and zones (the Switching and VLANs and Network security courses), <b>ACLs</b> between networks (the same courses) and finally <b>the servers’ own hardening</b>. No wall is perfect – but <b>stacked layers</b> make an attack far more expensive and noisy.',
  [['defense in depth','layered defense: several independent layers so one failure doesn’t mean a breach.'],['hardening','strengthening the server/host itself (patches, disabled services, strong auth).']]);}
function mountC8DefenseDepth(){c8Mount('c8s',[
  {glow:c8g('net','--red')+c8g('fw','--green'),dyn:c8pkt('66 100','166 100','--red')+c8lbl(180,74,'1) firewall: zones/ports','--green'),cap:'Layer 1: the <b>firewall</b> filters by zones and ports. What passes moves on.'},
  {glow:c8g('ips','--green'),dyn:c8lbl(310,74,'2) IDS/IPS + DPI: content','--green'),cap:'Layer 2: <b>IDS/IPS with DPI</b> checks content and catches an attack hidden in an allowed port.'},
  {glow:c8all('--green'),dyn:c8lbl(310,170,'3) segmentation · ACL · hardening','--green'),cap:'Layer 3+: <b>segmentation, ACLs, server hardening</b>. If one layer fails, the next catches it. That’s defense in depth.'}
]);}
// L7M2 — the complete C3-C8 network
function renderC8FullStack(){return c8P('c8t',
  'Let’s tie it together across <b>all the courses</b>. We’ve built: <b>VLANs and switching</b> (C3), <b>routing and IP</b> (C4), <b>firewall and zones</b> (C5), <b>redundancy and STP</b> (C6), <b>OSPF</b> (C7) and now <b>deep security</b> (C8). Together they make a <b>real enterprise network</b>: divided (VLANs), reliably connected (routing/OSPF), resilient to failure (redundancy) and protected in multiple layers (firewall + IDS/IPS + segmentation). Each course was one layer of this puzzle.',
  [['enterprise network','the result of courses C3–C8: a segmented, routed, redundant and multi-layer protected network.'],['layers','each course = one layer: VLAN, routing, FW, redundancy, OSPF, deep security.']]);}
function mountC8FullStack(){
  var OUT='M 456 134 L 322 106 L 296 100 L 194 100 L 166 100 L 66 100';
  var IN='M 66 100 L 166 100 L 194 100 L 296 100';
  var pk=function(p,c,dur,begin){return '<rect x="-6" y="-4" width="12" height="9" rx="2" style="fill:var('+c+')"><animateMotion path="'+p+'" dur="'+dur+'" begin="'+(begin||'0s')+'" repeatCount="indefinite"/></rect>';};
  c8Mount('c8t',[
  {glow:c8g('pc','--cyan')+c8g('ips','--cyan')+c8g('fw','--cyan'),dyn:pk('M 456 134 L 322 106 L 296 100 L 194 100','--cyan','1.6s')+c8lbl(310,74,'C3 VLAN · C4 routing · C5 firewall','--cyan'),cap:'Foundation: a <b>divided</b> network (C3), <b>connected</b> by routing (C4) – traffic from the PC reaches the <b>firewall</b> (C5), which checks it.'},
  {glow:c8g('pc','--violet')+c8g('ips','--violet')+c8g('fw','--violet')+c8g('net','--violet'),dyn:pk(OUT,'--violet','2s')+c8lbl(310,74,'C6 redundancy · C7 OSPF','--violet'),cap:'Reliability: <b>redundancy and STP</b> (C6) and <b>dynamic OSPF routing</b> (C7) keep the <b>way out</b> open even after a link fails.'},
  {glow:c8g('net','--red')+c8g('fw','--red')+c8g('ips','--green')+c8g('web','--green')+c8g('pc','--green'),dyn:pk(IN,'--red','1.5s')+c8lbl(310,74,'C8 DPI / IDS / IPS','--green'),cap:'And now <b>layered defense</b> (C8): an attack from outside passes the firewall but dies at the <b>DPI/IPS</b>. A complete enterprise network together.'}
]);}
// L7M3 — what next
function renderC8Wrap(){return c8P('c8u',
  'You’ve managed to build and secure a real network from the ground up. Where do the next steps lead? Security is a <b>never-ending</b> field: <b>SIEM</b> and a SOC (central event collection and analysis, a team that responds), <b>Zero Trust</b> ("trust nothing, verify everything" – the end of trust based on network location), <b>cloud and SD-WAN</b> (network and security as software across sites), and <b>automation/threat intelligence</b>. That’s beyond this simulator – but thanks to courses C1–C8 you now <b>understand these topics in context</b>. Congratulations.',
  [['Zero Trust','a "trust nothing, verify everything" model; trust isn’t derived from network location.'],['SOC/SIEM','the team and system for central collection, correlation and response to security events.'],['SD-WAN','software-defined WAN – branch connectivity and security policies are managed centrally, independent of the underlying links.']]);}
function mountC8Wrap(){c8Mount('c8u',[
  {glow:c8all('--green'),dyn:c8lbl(310,74,'the C1–C8 network is done','--green'),cap:'A built, connected, resilient and <b>multi-layer protected</b> network. That’s the core of networking.'},
  {glow:c8g('ips','--violet'),dyn:c8lbl(310,74,'SIEM · Zero Trust · cloud','--violet'),cap:'Next come <b>SIEM/SOC</b>, <b>Zero Trust</b>, <b>cloud and SD-WAN</b>, automation. A never-ending field.'},
  {glow:c8all('--cyan'),dyn:c8lbl(310,170,'you understand it in context','--cyan'),cap:'These topics are beyond the simulator – but thanks to C1–C8 you now <b>understand them in context</b>. Congratulations!'}
]);}
const COURSE_8_DEF = {
  id:'course8',
title:'Advanced security (DPI, IDS/IPS)',
  blurb:'Defense in depth: what a firewall can’t see, stateful inspection, DPI and TLS, IDS vs IPS, real attacks (port scan, SQLi, C2) and layered defense.',
  lessons:[
    { id:'c8l1', title:'What a basic firewall can’t see', taskId:null, quizId:'c8q_l1', modules:[
      { id:'c8l1m1', title:'A firewall sees only addresses and ports', render:renderC8WhatFwSees, mount:mountC8WhatFwSees },
      { id:'c8l1m2', title:'A packet has content too', render:renderC8Payload, mount:mountC8Payload },
      { id:'c8l1m3', title:'Tunneling in an allowed port', render:renderC8Tunnel, mount:mountC8Tunnel }
    ]},
    { id:'c8l2', title:'Stateful inspection in depth', taskId:null, quizId:'c8q_l2', modules:[
      { id:'c8l2m1', title:'The connection table', render:renderC8ConnTable, mount:mountC8ConnTable },
      { id:'c8l2m2', title:'TCP states and the handshake', render:renderC8TcpStates, mount:mountC8TcpStates },
      { id:'c8l2m3', title:'SYN flood', render:renderC8SynFlood, mount:mountC8SynFlood }
    ]},
    { id:'c8l3', title:'DPI – deep inspection', taskId:null, quizId:'c8q_l3', modules:[
      { id:'c8l3m1', title:'What DPI is', render:renderC8Dpi, mount:mountC8Dpi },
      { id:'c8l3m2', title:'Application signatures', render:renderC8Sigs, mount:mountC8Sigs },
      { id:'c8l3m3', title:'TLS inspection and MITM', render:renderC8Tls, mount:mountC8Tls }
    ]},
    { id:'c8l4', title:'IDS – detection', taskId:'ids-to-ips', quizId:'c8q_l4', modules:[
      { id:'c8l4m1', title:'IDS as a camera', render:renderC8Ids, mount:mountC8Ids },
      { id:'c8l4m2', title:'Signatures vs anomalies', render:renderC8Anomaly, mount:mountC8Anomaly },
      { id:'c8l4m3', title:'Alert fatigue', render:renderC8AlertFatigue, mount:mountC8AlertFatigue }
    ]},
    { id:'c8l5', title:'IPS – prevention', taskId:'ips-custom', quizId:'c8q_l5', modules:[
      { id:'c8l5m1', title:'IPS as a guard (inline)', render:renderC8Ips, mount:mountC8Ips },
      { id:'c8l5m2', title:'Detect vs block and tuning', render:renderC8Tuning, mount:mountC8Tuning },
      { id:'c8l5m3', title:'A custom signature', render:renderC8CustomSig, mount:mountC8CustomSig }
    ]},
    { id:'c8l6', title:'Real attacks', taskId:'ips-sqli', quizId:'c8q_l6', modules:[
      { id:'c8l6m1', title:'Port scan (recon)', render:renderC8PortScan, mount:mountC8PortScan },
      { id:'c8l6m2', title:'SQLi over HTTPS and lateral movement', render:renderC8Sqli, mount:mountC8Sqli },
      { id:'c8l6m3', title:'C2 over DNS', render:renderC8C2, mount:mountC8C2 },
      { id:'c8l6m4', title:'XSS: attacking the site’s visitors', render:renderC8Xss, mount:mountC8Xss }
    ]},
    { id:'c8l7', title:'Layered defense', taskId:'layered-def', quizId:'c8q_l7', modules:[
      { id:'c8l7m1', title:'Defense in depth', render:renderC8DefenseDepth, mount:mountC8DefenseDepth },
      { id:'c8l7m2', title:'The complete C3–C8 network', render:renderC8FullStack, mount:mountC8FullStack },
      { id:'c8l7m3', title:'What’s next', render:renderC8Wrap, mount:mountC8Wrap }
    ]}
  ]
};
const COURSE_8_QUIZZES_DEF = {
  c8q_l1:{ title:'Quiz: What a firewall can’t see', qs:[
    { q:'What does a <b>classic</b> firewall (L3/L4) decide by?',
      opts:['by IP addresses, ports and protocol – not by the packet content','by the content (payload) of each individual passing packet separately','by the name of the currently logged-in user and their assigned permissions'],
      correct:0, why:'A classic firewall sees headers (addresses/ports), not content. So it won’t spot an attack hidden in an allowed port – that’s what DPI is for.' },
    { q:'Where do most of today’s attacks hide in a packet?',
      opts:['in the payload (content) – which is why it must be read (DPI)','in the packet header along with the source and destination IP','in the physical length and quality of the network cable used'],
      correct:0, why:'SQL injection, file reads, malware – all that is in the content. You can’t tell from the header, you must read the payload.' },
    { q:'What is <b>tunneling</b> in the context of attacks?',
      opts:['hiding disallowed traffic inside an allowed port/protocol (e.g. C2 over DNS or HTTPS)','far faster and more efficient data transfer thanks to cleverly bundling several network links together','reliable end-to-end encryption of all outgoing emails so nobody reads them en route'],
      correct:0, why:'The attacker hides their channel in what the firewall allows (53, 443). To an L3/L4 firewall it looks harmless – only behavior/content reveals it.' }
  ]},
  c8q_l2:{ title:'Quiz: Stateful inspection', qs:[
    { q:'What is a stateful firewall’s <b>connection table</b> for?',
      opts:['it remembers established connections, so it recognizes the reply and lets it back automatically','it securely stores the login names and passwords of absolutely all connected network users','it markedly speeds up domain name resolution over DNS for the whole company network'],
      correct:0, why:'Thanks to the table the firewall recognizes the reply to an allowed connection (no return rule needed) and drops an unsolicited packet.' },
    { q:'How does a new <b>TCP</b> connection start?',
      opts:['with a three-way handshake SYN → SYN-ACK → ACK','by sending the very first data right away with no preamble at all','with a single standalone ACK acknowledgment packet'],
      correct:0, why:'Only after SYN/SYN-ACK/ACK is the connection established. A stateful firewall watches this and spots a fake (a packet with no handshake).' },
    { q:'How does a <b>SYN flood</b> attack work?',
      opts:['a flood of SYNs without completing the handshake → exhausts the half-open table (DoS)','it encrypts the target server’s files and then demands a ransom for restoring them','it gradually steals all the login passwords stored in the breached server’s database'],
      correct:0, why:'The attacker never sends ACK; the server holds many half-open connections, runs out of capacity and stops serving legitimate clients. An IPS spots it by the pattern.' }
  ]},
  c8q_l3:{ title:'Quiz: DPI', qs:[
    { q:'What does <b>DPI (Deep Packet Inspection)</b> do?',
      opts:['reads the packet content (payload) and compares it against signatures, not just headers','it only counts the total number of absolutely all the packets passing a given interface','it only continuously measures the current speed and load of the link between two switches'],
      correct:0, why:'DPI peeks into the content and looks for attack patterns. The price is performance, and for encrypted traffic it needs TLS inspection.' },
    { q:'What is a <b>signature</b> and what’s its weakness?',
      opts:['a pattern (string/regex) of a known attack; the weakness is a NEW attack with no signature slips through','a secret encryption key for all of the traffic; it actually has no weakness or limitation whatsoever at all','a randomly assigned sequence number of each packet, by which it is ordered in the queue'],
      correct:0, why:'Signatures are precise on known attacks but miss unknown ones – which is why anomaly detection is added.' },
    { q:'Why is <b>TLS inspection</b> needed for <b>HTTPS</b> and why is it sensitive?',
      opts:['the content is encrypted; the device decrypts it as a controlled MITM, inspects and re-encrypts – but it touches privacy and done badly weakens security','encrypted HTTPS traffic actually cannot be inspected or read in any technical way whatsoever, and so nobody even attempts to do it at all','on the contrary, TLS inspection itself speeds up the whole web and the loading of absolutely all pages markedly and very noticeably, so it pays to enable it everywhere'],
      correct:0, why:'Without decryption DPI can’t see the content. TLS inspection enables it (company certificate), but it’s powerful and sensitive – deployed thoughtfully.' }
  ]},
  c8q_l4:{ title:'Quiz: IDS', qs:[
    { q:'How does an <b>IDS</b> work?',
      opts:['it sits off the path (a traffic copy), records and alerts on an attack, but doesn’t block','it sits directly in the path of traffic and outright blocks absolutely all the passing traffic','it reliably encrypts all the traffic passing between the internal network and the internet'],
      correct:0, why:'IDS is like a camera: it sees and alerts but doesn’t intervene. It records the attack, doesn’t stop it – someone must respond.' },
    { q:'What’s the difference between <b>signature-based</b> and <b>anomaly-based</b> detection?',
      opts:['signature = by known patterns (precise, blind to new); anomaly = by deviations from a baseline (catches new, but yields false alarms)','signature = learns normal traffic and reports deviations from it; anomaly = compares traffic against a database of known attack patterns','signature catches only application-layer (L7) attacks, whereas anomaly detection covers only layers L3 and L4'],
      correct:0, why:'Each approach has the opposite weakness of the other, so in practice they’re combined.' },
    { q:'What is <b>alert fatigue</b>?',
      opts:['overload with false alarms that lets the one real attack slip by unnoticed','the gradual tiring and overload of the server from too large an amount of network traffic','a too-slow firewall that can’t evaluate all the rules in time'],
      correct:0, why:'When most alerts are false, the team stops taking them seriously. So alerts are tuned, triaged and correlated in a SIEM.' }
  ]},
  c8q_l5:{ title:'Quiz: IPS', qs:[
    { q:'How does an <b>IPS</b> differ from an <b>IDS</b>?',
      opts:['an IPS is inline (in the path) and blocks the attack outright; an IDS only detects and alerts off-path','on the contrary IPS only quietly logs and records traffic, whereas IDS actively blocks and discards it','they are in fact absolutely identical devices, differing only in name and vendor brand'],
      correct:0, why:'IDS = a camera (sees, reports). IPS = a guard in the path (stops). The IPS cost: a failure or false alarm affects traffic.' },
    { q:'Why is a new signature often deployed <b>as alert-only</b> first and only then set to block?',
      opts:['to verify it doesn’t hit legitimate traffic (false positives) before it starts blocking','because immediate automatic blocking of traffic is explicitly forbidden by law in most countries','so that scarce memory and the needed processor power are saved on the device itself'],
      correct:0, why:'Inline blocking of a false positive blocks something legitimate. So a signature is first tuned in alert mode and only blocks once tuned.' },
    { q:'When do you write a <b>custom DPI signature</b>?',
      opts:['when no off-the-shelf rule catches a specific attack – it must catch the attack while letting benign traffic pass','you don’t write your own signatures, the device vendor creates and supplies them','you write your own signature when you want to speed up the company network'],
      correct:0, why:'That’s exactly the ips-custom task: a pattern for "/etc/passwd" that blocks the attack and lets a benign GET /index.html pass.' }
  ]},
  c8q_l6:{ title:'Quiz: Real attacks', qs:[
    { q:'What is a <b>port scan</b> and why does it matter?',
      opts:['systematically probing a target’s open ports – recon, a precursor to attack; IDS/IPS spots it by the pattern','the finished attack itself, which immediately and entirely without warning steals all the sensitive data from the breached server','a completely ordinary harmless test of the speed and quality of the internet connection that endangers nothing'],
      correct:0, why:'A scan itself is harmless, but the attacker maps a way in. Many connections to different ports from one IP is a clear pattern.' },
    { q:'Why doesn’t a classic firewall see <b>SQL injection over HTTPS</b>?',
      opts:['the payload is encrypted – only DPI after TLS inspection catches it; segmentation then limits lateral movement','SQL injection over encrypted HTTPS in fact does not exist at all whatsoever and there is really nothing to fear','on the contrary a classic firewall always sees such an attack absolutely reliably and blocks it itself right away'],
      correct:0, why:'A classic L3/L4 firewall doesn’t read an encrypted payload. And if the attacker succeeds, segmentation (VLANs/zones) limits where they get from there.' },
    { q:'How is a <b>C2 channel hidden in DNS</b> spotted?',
      opts:['by behavior/anomaly – unusually many DNS queries, long random names; a classic firewall sees only "allowed DNS"','it can be spotted by the destination port number this traffic targets','such a hidden C2 channel cannot be detected by any reasonable technical means'],
      correct:0, why:'C2 over DNS looks harmless to the firewall. Only anomaly detection and DPI reveal it by behavior.' }
  ]},
  c8q_l7:{ title:'Quiz: Layered defense', qs:[
    { q:'What does <b>defense in depth</b> mean?',
      opts:['several independent layers (firewall, IDS/IPS, segmentation, ACLs, hardening) so one failure doesn’t mean a breach','one single very strong and very well configured defensive wall that reliably suffices for everything on its own','reliable double encryption of absolutely all the data transferred in the network, so it is always protected twice over in a row'],
      correct:0, why:'No single layer is perfect. Stacked layers make an attack costlier and noisier – if one fails, the next catches it.' },
    { q:'How do courses <b>C3–C8</b> fit together?',
      opts:['each is one layer of an enterprise network: VLANs, routing, firewall, redundancy, OSPF, deep security','they are mutually completely unrelated, separate topics that have nothing whatsoever to do with one another','absolutely all those courses in fact just keep repeating one and the same thing over and over, each time in different words'],
      correct:0, why:'Together they make a segmented, routed, redundant and multi-layer protected network – a real enterprise infrastructure.' },
    { q:'What is <b>Zero Trust</b>?',
      opts:['"trust nothing, verify everything" – trust isn’t derived from network location','it means the complete and permanent shutdown of the firewall and all the other protection in the whole network','automatic and full trust in all the devices that are on the internal network'],
      correct:0, why:'Zero Trust abandons "the internal network = trusted". Every access is verified again, regardless of where it comes from.' }
  ]}
};
const COURSE_8_FINAL_EXTRA_DEF=[{ q:'An attack hides inside allowed HTTPS on port 443. Why does a classic firewall miss it, and what catches it?', opts:['it decides by IP and ports, not content – only DPI sees into the payload','it’s simply too slow for such a fast backbone link and can’t keep up at all','it just blocks port 443 entirely, so then no website works at all'], correct:0, why:'A classic firewall sees addresses and ports (L3/L4), not content. "TCP to 443" is allowed whatever is inside. Only deep packet inspection (DPI) looks into the content.' },{ q:'What’s the difference between an IDS and an IPS during a real attack?', opts:['an IDS sits off-path and only alerts; an IPS is inline and blocks the attack outright','on the contrary it’s the IDS that actively blocks traffic, while the IPS only quietly logs','they’re basically the same device – an IDS suits small networks and an IPS large ones'], correct:0, why:'An IDS gets a copy of traffic – it records and alerts but doesn’t stop it. An IPS sits inline, so it can block it outright. That’s why an IPS is tuned not to hit legitimate traffic.' },{ q:'Malware tunnels commands over DNS (C2). Why does the firewall miss it, and what reveals it?', opts:['it sees only "allowed DNS"; behavior gives it away – too many queries, odd names','it’s spotted right away by the destination port number this DNS traffic targets','a C2 channel hidden this way over DNS can’t be detected by common means'], correct:0, why:'DNS is normally allowed, so the firewall sees only "legit DNS". Tunneled C2 is given away by behavior/anomaly – unusually many queries and long random names. Hence layered defense.' }];
__regCourse(8,COURSE_8_DEF,COURSE_8_QUIZZES_DEF,COURSE_8_FINAL_EXTRA_DEF);
