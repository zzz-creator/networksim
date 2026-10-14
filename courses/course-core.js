/* ============================================================
   networksim — COURSE engine (loaded lazily from the app via courses/course-core.js)
   ------------------------------------------------------------
   All course content + navigation lives here. Depends on globals
   defined elsewhere in the app: openModal, closeModal, modalBox, modalBg,
   modalCloseHook, icon, esc, $, getTasks, startTask,
   openTasksModal, and the small progress helpers courseProgress /
   markCourseSeen / courseTry / courseCTA / abbrBox (declared in
   js/17-learn.js — all scripts share one global scope).

   Architecture:
   - COURSE_1 = data (lessons -> modules). Add/remove a lesson or
     module = edit one entry in the array.
   - Each module: { id, title, render()->htmlString,
     mount?() }. render returns the inner HTML; optional mount runs
     AFTER openModal to wire interactive step-through (‹ / ›).
   - Quizzes are DATA (COURSE_1_QUIZZES).
   - NO play buttons anywhere — animations are step-through only.
   ============================================================ */

/* ---------- shared step-through helpers (NO play button — ‹ / › only) ---------- */
function courseStepControls(p){
  return '<div class="m1-controls"><button class="btn" id="'+p+'prev">‹ '+'Back'+'</button><button class="btn" id="'+p+'next">'+'Next'+' ›</button><span id="'+p+'count" style="font:600 11px var(--mono);color:var(--muted);margin-left:6px"></span></div>';
}
function courseStepper(p,count,show){
  let idx=0;
  const upd=()=>{ try{show(idx);}catch(e){} const c=$(p+'count'); if(c)c.textContent=(idx+1)+' / '+count; const pb=$(p+'prev'); if(pb)pb.disabled=idx===0; const nb=$(p+'next'); if(nb)nb.disabled=idx===count-1;
    // Record the position for appDiagnostics(); idx is only visible in here.
    try{var cid=(typeof activeCourse!=='undefined'&&activeCourse&&activeCourse.id)||'course'; window.__nsWhere=cid+' / '+p+' / step '+(idx+1)+' of '+count;}catch(e){}
  };
  const pb=$(p+'prev'); if(pb)pb.onclick=()=>{ if(idx>0){idx--;upd();} };
  const nb=$(p+'next'); if(nb)nb.onclick=()=>{ if(idx<count-1){idx++;upd();} };
  upd();
}
// reveal-style step-through for concept modules: devices id "<p>-0".."<p>-(n-1)" are revealed
// progressively (dim until reached, highlight the current); caps[i] -> #<p>cap. No play button.
function courseRevealMount(p,caps){
  const total=caps.length;
  function show(i){
    for(let n=0;n<total;n++){const el=$(p+'-'+n);if(el){el.style.transition='opacity .25s';el.style.opacity=(n<=i)?'1':'0.3';}}
    const c=$(p+'cap');if(c)c.innerHTML='<span>'+caps[i]+'</span>';
  }
  courseStepper(p,total,show);
}
// ---- sim-matching icons: reuse the simulator's exact device/host glyphs (built with el()) as SVG strings ----
function csHost(x,y,iconId,color,lbl,scale){var s=scale||1.25;return '<g transform="translate('+x+','+y+') scale('+s+')">'+segIcon(iconId,'var('+color+')').outerHTML+'</g>'+(lbl?'<text x="'+x+'" y="'+(y+35)+'" text-anchor="middle" style="font:700 8px var(--mono);fill:var('+color+')">'+esc(lbl)+'</text>':'');}
function csDev(x,y,type,lbl,scale){var s=scale||1.3;return '<g transform="translate('+x+','+y+') scale('+s+')">'+deviceIcon(type).outerHTML+'</g>'+(lbl?'<text x="'+x+'" y="'+(y+35)+'" text-anchor="middle" style="font:700 8px var(--mono);fill:var(--muted)">'+esc(lbl)+'</text>':'');}
function csGlow(x,y,color,r){return '<circle cx="'+x+'" cy="'+y+'" r="'+(r||20)+'" style="fill:var('+color+');fill-opacity:.16;stroke:var('+color+');stroke-width:2.4"/>';}
const CRS_DUR='1.5s'; // single, calm packet speed used across all course animations
function csPkt(path,color,dur){return '<rect x="-7" y="-5" width="14" height="10" rx="2" style="fill:var('+color+')"><animateMotion path="'+path+'" dur="'+(dur||CRS_DUR)+'" repeatCount="indefinite"/></rect>';}

/* ===== GENERATED CORE REGISTRY (splitter) =====
   Courses are split into course1.js..course10.js; the core holds lightweight "stubs"
   (complete course/lesson/module metadata WITHOUT render/mount functions).
   courseN.js is loaded on demand (__loadCourseFile) and __regCourse
   hydrates the stub: it fills in render/mount/build + quizzes + FINAL_EXTRA.
   The identity of the COURSE_N objects stays stable (the stub is enriched in-place). */
var COURSE_1={"id":"course1","title":"How networks work","blurb":"Understand networks from the ground up: why they exist, how devices talk, and how your message reaches exactly where it should.","lessons":[{"id":"l1","title":"Why networks exist and how data travels","taskId":"first-steps","quizId":"q_l1","modules":[{"id":"l1m1","title":"Why networks exist"},{"id":"l1m2","title":"How a message is split into packets"},{"id":"l1m3","title":"The router and the internet"}]},{"id":"l2","title":"What data travels on: media","taskId":"wifi-connect","quizId":"q_l2","modules":[{"id":"l2m1","title":"Bits and signals"},{"id":"l2m2","title":"Wired media: copper and fiber"},{"id":"l2m3","title":"Wireless media"}]},{"id":"l3","title":"How devices are identified: addresses","taskId":null,"quizId":"q_l3","modules":[{"id":"l3m1","title":"Why we need addresses"},{"id":"l3m2","title":"MAC address: the factory label"},{"id":"l3m3","title":"IP address: the postal address"},{"id":"l3m4","title":"Your router has two addresses"}]},{"id":"l4","title":"How a device uses its address","taskId":null,"quizId":"q_l4","modules":[{"id":"l4m1","title":"ARP: finding the MAC for an IP"},{"id":"l4m2","title":"Default gateway: the way out"},{"id":"l4m3","title":"DHCP: your automatic address"},{"id":"l4m4","title":"When it does not work: first steps"}]},{"id":"l5","title":"Finding a server and opening a connection","taskId":"port-test","quizId":"q_l5","modules":[{"id":"l5m1","title":"DNS: the internet's phone book"},{"id":"l5m2","title":"TCP and UDP: reliable vs. fast"},{"id":"l5m3","title":"Ports: the apartment number"}]},{"id":"l6","title":"The language of the web","taskId":null,"quizId":"q_l6","modules":[{"id":"l6m1","title":"HTTP: how the browser talks to the server"},{"id":"l6m2","title":"HTTPS and encryption: why the padlock"},{"id":"l6m3","title":"What HTTPS does not hide"}]},{"id":"l7","title":"The whole journey together","taskId":null,"quizId":"q_l7","modules":[{"id":"l7m1","title":"From click to loaded page"},{"id":"l7m2","title":"What now?"}]}]};
var COURSE_2={"id":"course2","title":"ISO/OSI and TCP/IP: the network map","blurb":"Name every layer and device. Walk the network layer by layer (L1–L7), add the TCP/IP model, cross-layer firewalling, and encapsulation.","lessons":[{"id":"c2l1","title":"Why layers","taskId":null,"quizId":"c2q_l1","modules":[{"id":"c2l1m1","title":"Devices from different vendors understand each other"},{"id":"c2l1m2","title":"The layered model: each part does one job"},{"id":"c2l1m3","title":"OSI and TCP/IP: two maps of one network"}]},{"id":"c2l2","title":"L1: the physical layer","taskId":"qos-voice","quizId":"c2q_l2","modules":[{"id":"c2l2m1","title":"What L1 does: signal, medium, bits"},{"id":"c2l2m2","title":"Interference: when noise talks into the signal"},{"id":"c2l2m3","title":"Bandwidth, throughput, latency"}]},{"id":"c2l3","title":"L2: the data-link layer","taskId":"hub-vs-switch","quizId":"c2q_l3","modules":[{"id":"c2l3m1","title":"What L2 does: frames and local delivery"},{"id":"c2l3m2","title":"Hub: sends to everyone — why that is not enough"},{"id":"c2l3m3","title":"Switch and the MAC table"},{"id":"c2l3m4","title":"WAP: the wireless access point at L2"}]},{"id":"c2l4","title":"L3: the network layer","taskId":"subnet-lab","quizId":"c2q_l4","modules":[{"id":"c2l4m1","title":"What L3 does: routing between networks"},{"id":"c2l4m2","title":"Router and the routing table"},{"id":"c2l4m3","title":"NAT in practice: one address for the whole network"},{"id":"c2l4m4","title":"L3 switch: when a switch can route"},{"id":"c2l4m5","title":"Bits and numbers: how 8 bits become 0–255"},{"id":"c2l4m6","title":"Subnetting: how to split a network"}]},{"id":"c2l5","title":"L4: the transport layer","taskId":"port-test","quizId":"c2q_l5","modules":[{"id":"c2l5m1","title":"What L4 does: end-to-end delivery"},{"id":"c2l5m2","title":"TCP in depth: handshake and acknowledgments"},{"id":"c2l5m3","title":"UDP: when speed beats reliability"}]},{"id":"c2lsp","title":"L5 and L6: session and presentation","taskId":null,"quizId":"c2q_lsp","modules":[{"id":"c2lspm1","title":"L5 session: set up and keep the connection"},{"id":"c2lspm2","title":"L6 presentation: the form of the data (encoding, encryption)"}]},{"id":"c2l6","title":"The application layer and the TCP/IP model","taskId":null,"quizId":"c2q_l6","modules":[{"id":"c2l6m1","title":"TCP/IP model: 4 layers in practice"},{"id":"c2l6m2","title":"Application layer: where DNS, HTTP and TLS live"},{"id":"c2l6m3","title":"How to read documentation and certifications"}]},{"id":"c2l7","title":"Firewall: a device across multiple layers","taskId":"web-dmz","quizId":"c2q_l7","modules":[{"id":"c2l7m1","title":"Why a firewall does not fit in one layer"},{"id":"c2l7m2","title":"Packet filter and stateful firewall"},{"id":"c2l7m3","title":"Zones: inside, outside, DMZ"}]},{"id":"c2l8","title":"Encapsulation: the stack in action","taskId":null,"quizId":"c2q_l8","modules":[{"id":"c2l8m1","title":"Each layer adds its own header"},{"id":"c2l8m2","title":"Stack animation: sender and receiver"}]}]};
var COURSE_3={"id":"course3","title":"Switching and VLANs","blurb":"Switching in practice: split the network into VLANs, set up access and trunk ports, route between VLANs at L3 and secure L2.","lessons":[{"id":"c3l1","title":"Everyone on one network","taskId":null,"quizId":"c3q_l1","modules":[{"id":"c3l1m1","title":"An office with no walls"},{"id":"c3l1m2","title":"Three problems"},{"id":"c3l1m3","title":"The physical fix is costly"}]},{"id":"c3l2","title":"VLAN: a wall you can’t see","taskId":"vlan-split","quizId":"c3q_l2","modules":[{"id":"c3l2m0","title":"Broadcast: a message for everyone"},{"id":"c3l2m1","title":"What a VLAN is"},{"id":"c3l2m2","title":"How the switch knows where a frame belongs"},{"id":"c3l2m3","title":"VLAN ID"},{"id":"c3l2m4","title":"What a VLAN does not solve"}]},{"id":"c3l3","title":"Trunk: how a VLAN crosses a cable","taskId":"trunk-setup","quizId":"c3q_l3","modules":[{"id":"c3l3m1","title":"The multiple-switch problem"},{"id":"c3l3m2","title":"The 802.1Q tag"},{"id":"c3l3m3","title":"Access port vs trunk port"},{"id":"c3l3m4","title":"Native VLAN"}]},{"id":"c3l4","title":"Why VLANs can’t talk to each other","taskId":"router-intro","quizId":"c3q_l4","modules":[{"id":"c3l4m1","title":"The wall works too well"},{"id":"c3l4m2","title":"L3 as a translator"},{"id":"c3l4m3","title":"Router-on-a-stick"}]},{"id":"c3l5","title":"The L3 switch","taskId":"inter-vlan","quizId":"c3q_l5","modules":[{"id":"c3l5m1","title":"Where router-on-a-stick falls short"},{"id":"c3l5m2","title":"SVI: a gateway inside the switch"},{"id":"c3l5m3","title":"A routing table on the switch"},{"id":"c3l5m4","title":"When a router, when an L3 switch"}]},{"id":"c3l6","title":"Guests and IoT: isolation in practice","taskId":"guest-iso","quizId":"c3q_l6","modules":[{"id":"c3l6m1","title":"Three worlds on one network"},{"id":"c3l6m2","title":"Guest VLAN in practice"},{"id":"c3l6m3","title":"IoT and blast radius"},{"id":"c3l6m4","title":"ACL: who may cross between VLANs"}]},{"id":"c3l7","title":"The whole path together","taskId":"vlan-design","quizId":"c3q_l7","modules":[{"id":"c3l7m1","title":"The whole topology, layer by layer"},{"id":"c3l7m2","title":"A packet across the whole network"},{"id":"c3l7m3","title":"What is still missing"}]}]};
var COURSE_4={"id":"course4","title":"Routing and IP addresses","blurb":"How a router picks a path: the routing table and longest-prefix, default and static routes, NAT/PAT — and then further: why static isn’t enough, how routers learn routes on their own (RIP vs OSPF), metrics, convergence and administrative distance.","lessons":[{"id":"c4l1","title":"Why networks need a map","taskId":null,"quizId":"c4q_l1","modules":[{"id":"c4l1m1","title":"A packet at the crossroads"},{"id":"c4l1m2","title":"The router as a junction"},{"id":"c4l1m3","title":"The routing table"}]},{"id":"c4l2","title":"The default route","taskId":"def-route","quizId":"c4q_l2","modules":[{"id":"c4l2m1","title":"You can’t know the whole world"},{"id":"c4l2m2","title":"The default route = the way out"},{"id":"c4l2m3","title":"The default gateway at home"}]},{"id":"c4l3","title":"Static routes","taskId":"static-route","quizId":"c4q_l3","modules":[{"id":"c4l3m1","title":"When a static route"},{"id":"c4l3m2","title":"What it looks like"},{"id":"c4l3m3","title":"Floating static (backup)"},{"id":"c4l3m4","title":"Where static falls short"}]},{"id":"c4l4","title":"NAT and PAT","taskId":"nat-lab","quizId":"c4q_l4","modules":[{"id":"c4l4m1","title":"Why NAT"},{"id":"c4l4m2","title":"PAT: one IP for everyone"},{"id":"c4l4m3","title":"Port forwarding (DNAT)"},{"id":"c4l4m4","title":"Hairpin NAT"}]},{"id":"c4l5","title":"When a router isn’t enough","taskId":null,"quizId":"c4q_l5","modules":[{"id":"c4l5m1","title":"A company with many branches (WAN)"},{"id":"c4l5m2","title":"A WAN link fails"},{"id":"c4l5m3","title":"What we would want"}]},{"id":"c4l6","title":"How routers share maps","taskId":null,"quizId":"c4q_l6","modules":[{"id":"c4l6m1","title":"Routers talk to each other"},{"id":"c4l6m2","title":"Distance-vector vs link-state"},{"id":"c4l6m3","title":"Hello and adjacency"},{"id":"c4l6m4","title":"Metric: the best path"}]},{"id":"c4l7","title":"Inside OSPF","taskId":"ospf-cost","quizId":"c4q_l7","modules":[{"id":"c4l7m1","title":"Same map, own computation"},{"id":"c4l7m3","title":"Cost: how it’s computed"},{"id":"c4l7m6","title":"What’s under the hood → <i>OSPF in depth</i>"}]},{"id":"c4l8","title":"Convergence","taskId":null,"quizId":"c4q_l8","modules":[{"id":"c4l8m1","title":"What convergence is"},{"id":"c4l8m2","title":"How fast"}]},{"id":"c4l9","title":"Protocols in the company network","taskId":null,"quizId":"c4q_l9","modules":[{"id":"c4l9m1","title":"How a router learns routes"},{"id":"c4l9m2","title":"RIP — counting hops"},{"id":"c4l9m3","title":"OSPF — the cheapest path"},{"id":"c4l9m4","title":"EIGRP — a composite metric"}]},{"id":"c4l10","title":"The internet and who wins","taskId":null,"quizId":"c4q_l10","modules":[{"id":"c4l9m5","title":"IS-IS and BGP — backbones and the internet"},{"id":"c4l9m6","title":"Which one wins? Administrative distance"}]}]};
var COURSE_5={"id":"course5","title":"Network security","blurb":"Firewalls in practice: inside/outside/DMZ zones, rules, stateful inspection, VPN and common misconfigurations.","lessons":[{"id":"c5l1","title":"The open-network problem","taskId":"open-net","quizId":"c5q_l1","modules":[{"id":"c5l1m1","title":"A network with no door"},{"id":"c5l1m2","title":"What’s at risk"},{"id":"c5l1m3","title":"The firewall = a gatekeeper"}]},{"id":"c5l2","title":"Zones: inside, outside, DMZ","taskId":"web-dmz","quizId":"c5q_l2","modules":[{"id":"c5l2m1","title":"Trust zones"},{"id":"c5l2m2","title":"Default deny inbound"},{"id":"c5l2m3","title":"DMZ: public servers apart"},{"id":"c5l2m4","title":"Rules between zones"},{"id":"c5l2m5","title":"The whole picture"}]},{"id":"c5l3","title":"Anatomy of a rule","taskId":"block-telnet","quizId":"c5q_l3","modules":[{"id":"c5l3m1","title":"What a rule is made of"},{"id":"c5l3m2","title":"First-match: order matters"},{"id":"c5l3m3","title":"Default deny at the end"},{"id":"c5l3m4","title":"Example: block Telnet"}]},{"id":"c5l4","title":"Stateful firewall","taskId":"firewall-observe","quizId":"c5q_l4","modules":[{"id":"c5l4m1","title":"The reply problem"},{"id":"c5l4m2","title":"The connection table"},{"id":"c5l4m3","title":"Replies pass, unsolicited don’t"},{"id":"c5l4m4","title":"UDP and ICMP"}]},{"id":"c5l5","title":"Shadowed rules and mistakes","taskId":"shadow-rule","quizId":"c5q_l5","modules":[{"id":"c5l5m1","title":"A shadowed rule"},{"id":"c5l5m2","title":"An over-permissive rule"},{"id":"c5l5m3","title":"A forgotten rule"},{"id":"c5l5m4","title":"Audit and clean-up"}]},{"id":"c5l6","title":"VPN: remote access","taskId":"remote-vpn","quizId":"c5q_l6","modules":[{"id":"c5l6m1","title":"Remote access"},{"id":"c5l6m2","title":"What a VPN does"},{"id":"c5l6m3","title":"Remote-access vs site-to-site"},{"id":"c5l6m4","title":"Where a VPN sits on the firewall"},{"id":"c5l6m5","title":"Split vs full tunnel"}]},{"id":"c5l7","title":"The whole path together","taskId":"default-deny","quizId":"c5q_l7","modules":[{"id":"c5l7m1","title":"VLAN + firewall together"},{"id":"c5l7m2","title":"Two scenarios"},{"id":"c5l7m3","title":"What is still missing → <i>Redundancy and Spanning Tree</i>"}]}]};
var COURSE_6={"id":"course6","title":"Redundancy and Spanning Tree","blurb":"Why one link isn’t enough: loops and broadcast storms, Spanning Tree (root bridge, port states), RSTP, EtherChannel.","lessons":[{"id":"c6l1","title":"The loop that kills a network","taskId":"storm-stp","quizId":"c6q_l1","modules":[{"id":"c6l1m1","title":"We want a backup"},{"id":"c6l1m2","title":"Broadcast storm"},{"id":"c6l1m3","title":"MAC instability"}]},{"id":"c6l2","title":"Spanning Tree","taskId":"stp-loop","quizId":"c6q_l2","modules":[{"id":"c6l2m1","title":"The idea of STP"},{"id":"c6l2m2","title":"The root bridge"},{"id":"c6l2m3","title":"Port states"},{"id":"c6l2m4","title":"Choosing the blocked port"},{"id":"c6l2m5","title":"Failure and switchover"}]},{"id":"c6l3","title":"RSTP and PortFast","taskId":null,"quizId":"c6q_l3","modules":[{"id":"c6l3m1","title":"Why classic STP is slow"},{"id":"c6l3m2","title":"RSTP: rapid convergence"},{"id":"c6l3m3","title":"PortFast"},{"id":"c6l3m4","title":"BPDU Guard"}]},{"id":"c6l4","title":"EtherChannel","taskId":"lag-uplink","quizId":"c6q_l4","modules":[{"id":"c6l4m1","title":"STP wastes bandwidth"},{"id":"c6l4m2","title":"Bundle them into one"},{"id":"c6l4m3","title":"LACP"},{"id":"c6l4m4","title":"Load balancing"}]},{"id":"c6l5","title":"Trunks in depth and synthesis","taskId":"stp-redundant","quizId":"c6q_l5","modules":[{"id":"c6l5m1","title":"VLAN pruning"},{"id":"c6l5m2","title":"Native VLAN and VLAN hopping"},{"id":"c6l5m3","title":"A redundant network together"},{"id":"c6l5m4","title":"Failure and what’s next"}]}]};
var COURSE_7={"id":"course7","title":"OSPF in depth","blurb":"Dynamic routing: why static isn’t enough, how OSPF routers find each other (Hello, DR/BDR), the shared map (LSDB), Dijkstra, areas, convergence and OSPF in context.","lessons":[{"id":"c7l1","title":"When static isn’t enough","taskId":null,"quizId":"c7q_l1","modules":[{"id":"c7l1m1","title":"Hand-built routes don’t scale"},{"id":"c7l1m2","title":"Static doesn’t survive failures"},{"id":"c7l1m3","title":"The idea of OSPF"}]},{"id":"c7l2","title":"How OSPF routers find each other","taskId":null,"quizId":"c7q_l2","modules":[{"id":"c7l2m1","title":"Hello packets"},{"id":"c7l2m2","title":"Adjacency"},{"id":"c7l2m3","title":"DR and BDR"}]},{"id":"c7l3","title":"The shared map (LSDB)","taskId":null,"quizId":"c7q_l3","modules":[{"id":"c7l3m1","title":"LSA: a piece of the map"},{"id":"c7l3m2","title":"Flooding"},{"id":"c7l3m3","title":"The same LSDB for everyone"}]},{"id":"c7l4","title":"Dijkstra without the math","taskId":"ospf-cost","quizId":"c7q_l4","modules":[{"id":"c7l4m1","title":"Cost by speed"},{"id":"c7l4m2","title":"The shortest-path tree"},{"id":"c7l4m3","title":"In the simulator"}]},{"id":"c7l5","title":"Areas","taskId":null,"quizId":"c7q_l5","modules":[{"id":"c7l5m1","title":"A big area = a problem"},{"id":"c7l5m2","title":"The backbone: area 0"},{"id":"c7l5m3","title":"ABR and summaries"}]},{"id":"c7l6","title":"Convergence","taskId":"ospf-fix","quizId":"c7q_l6","modules":[{"id":"c7l6m1","title":"Failure and recompute"},{"id":"c7l6m2","title":"Speed: Hello/Dead and BFD"},{"id":"c7l6m3","title":"Reroute in the simulator"}]},{"id":"c7l7","title":"OSPF in context","taskId":null,"quizId":"c7q_l7","modules":[{"id":"c7l7m1","title":"Default route to the internet"},{"id":"c7l7m2","title":"Redistribution"},{"id":"c7l7m3","title":"The whole path and what’s next"},{"id":"c7l7m4","title":"OSPF vs. the others"}]}]};
var COURSE_8={"id":"course8","title":"Advanced security (DPI, IDS/IPS)","blurb":"Defense in depth: what a firewall can’t see, stateful inspection, DPI and TLS, IDS vs IPS, real attacks (port scan, SQLi, C2) and layered defense.","lessons":[{"id":"c8l1","title":"What a basic firewall can’t see","taskId":null,"quizId":"c8q_l1","modules":[{"id":"c8l1m1","title":"A firewall sees only addresses and ports"},{"id":"c8l1m2","title":"A packet has content too"},{"id":"c8l1m3","title":"Tunneling in an allowed port"}]},{"id":"c8l2","title":"Stateful inspection in depth","taskId":null,"quizId":"c8q_l2","modules":[{"id":"c8l2m1","title":"The connection table"},{"id":"c8l2m2","title":"TCP states and the handshake"},{"id":"c8l2m3","title":"SYN flood"}]},{"id":"c8l3","title":"DPI – deep inspection","taskId":null,"quizId":"c8q_l3","modules":[{"id":"c8l3m1","title":"What DPI is"},{"id":"c8l3m2","title":"Application signatures"},{"id":"c8l3m3","title":"TLS inspection and MITM"}]},{"id":"c8l4","title":"IDS – detection","taskId":"ids-to-ips","quizId":"c8q_l4","modules":[{"id":"c8l4m1","title":"IDS as a camera"},{"id":"c8l4m2","title":"Signatures vs anomalies"},{"id":"c8l4m3","title":"Alert fatigue"}]},{"id":"c8l5","title":"IPS – prevention","taskId":"ips-custom","quizId":"c8q_l5","modules":[{"id":"c8l5m1","title":"IPS as a guard (inline)"},{"id":"c8l5m2","title":"Detect vs block and tuning"},{"id":"c8l5m3","title":"A custom signature"}]},{"id":"c8l6","title":"Real attacks","taskId":"ips-sqli","quizId":"c8q_l6","modules":[{"id":"c8l6m1","title":"Port scan (recon)"},{"id":"c8l6m2","title":"SQLi over HTTPS and lateral movement"},{"id":"c8l6m3","title":"C2 over DNS"},{"id":"c8l6m4","title":"XSS: attacking the site’s visitors"}]},{"id":"c8l7","title":"Layered defense","taskId":"layered-def","quizId":"c8q_l7","modules":[{"id":"c8l7m1","title":"Defense in depth"},{"id":"c8l7m2","title":"The complete C3–C8 network"},{"id":"c8l7m3","title":"What’s next"}]}]};
var COURSE_9={"id":"course9","title":"The switch in depth","blurb":"L2 mechanics and security: MAC table and flooding, the 802.1Q frame, port security, VLAN hopping, DHCP snooping and DAI, Spanning Tree protection.","lessons":[{"id":"c9l1","title":"How a switch really forwards","taskId":"mac-table","quizId":"c9q_l1","modules":[{"id":"c9l1m1","title":"MAC learning"},{"id":"c9l1m2","title":"Flooding an unknown MAC"},{"id":"c9l1m3","title":"Aging and table capacity"}]},{"id":"c9l2","title":"Inside the frame and 802.1Q","taskId":null,"quizId":"c9q_l2","modules":[{"id":"c9l2m1","title":"The Ethernet frame"},{"id":"c9l2m2","title":"The 802.1Q tag"},{"id":"c9l2m3","title":"The native VLAN"}]},{"id":"c9l3","title":"Port security in depth","taskId":"ch-portsec","quizId":"c9q_l3","modules":[{"id":"c9l3m1","title":"CAM overflow (MAC flooding)"},{"id":"c9l3m2","title":"Port security and sticky MAC"},{"id":"c9l3m3","title":"Violation actions"}]},{"id":"c9l4","title":"VLAN hopping","taskId":"ch-vlanhop","quizId":"c9q_l4","modules":[{"id":"c9l4m1","title":"Double tagging"},{"id":"c9l4m2","title":"DTP and switch spoofing"},{"id":"c9l4m3","title":"Defending against hopping"}]},{"id":"c9l5","title":"DHCP and ARP defense","taskId":"ch-roguedhcp","quizId":"c9q_l5","modules":[{"id":"c9l5m1","title":"Rogue DHCP (MITM)"},{"id":"c9l5m2","title":"DHCP snooping"},{"id":"c9l5m3","title":"Dynamic ARP Inspection"}]},{"id":"c9l6","title":"Protecting Spanning Tree","taskId":"bpdu-guard","quizId":"c9q_l6","modules":[{"id":"c9l6m1","title":"Rogue root and BPDU attack"},{"id":"c9l6m2","title":"PortFast and BPDU Guard"},{"id":"c9l6m3","title":"Root Guard"}]},{"id":"c9l7","title":"Operations and synthesis","taskId":"dot1x-wired","quizId":"c9q_l7","modules":[{"id":"c9l7m1","title":"SPAN and monitoring"},{"id":"c9l7m4","title":"The port’s physical layer"},{"id":"c9l7m2","title":"Link aggregation"},{"id":"c9l7m3","title":"A secured L2 and what’s next"}]}]};
var COURSE_10={"id":"course10","title":"The router in depth","blurb":"L3 mechanics and security: the routing table and administrative distance, packet processing, NAT/PAT types, default and floating routes, HSRP/VRRP, router hardening.","lessons":[{"id":"c10l1","title":"The routing table in depth","taskId":"two-nets","quizId":"c10q_l1","modules":[{"id":"c10l1m1","title":"Three route sources"},{"id":"c10l1m2","title":"Administrative distance"},{"id":"c10l1m3","title":"Longest prefix match"}]},{"id":"c10l2","title":"How a router processes a packet","taskId":null,"quizId":"c10q_l2","modules":[{"id":"c10l2m1","title":"Lookup and next hop"},{"id":"c10l2m2","title":"ARP for the next hop"},{"id":"c10l2m3","title":"When there’s no route"}]},{"id":"c10l3","title":"NAT and PAT in depth","taskId":"static-nat","quizId":"c10q_l3","modules":[{"id":"c10l3m1","title":"Static NAT (1:1)"},{"id":"c10l3m2","title":"Dynamic NAT and PAT"},{"id":"c10l3m3","title":"Port forwarding and hairpin"}]},{"id":"c10l4","title":"Ways out and backups","taskId":"wan-failover","quizId":"c10q_l4","modules":[{"id":"c10l4m1","title":"The default route"},{"id":"c10l4m2","title":"Floating static (backup)"},{"id":"c10l4m3","title":"Stub vs transit router"}]},{"id":"c10l5","title":"First-hop redundancy","taskId":"hsrp","quizId":"c10q_l5","modules":[{"id":"c10l5m1","title":"The single-gateway problem"},{"id":"c10l5m2","title":"HSRP and VRRP"},{"id":"c10l5m3","title":"Load sharing and three redundancies"}]},{"id":"c10l6","title":"Router security","taskId":null,"quizId":"c10q_l6","modules":[{"id":"c10l6m1","title":"Control plane vs data plane"},{"id":"c10l6m4","title":"The wildcard mask"},{"id":"c10l6m2","title":"ACLs on the interface"},{"id":"c10l6m3","title":"Anti-spoofing and secure management"}]},{"id":"c10l7","title":"The router in practice and synthesis","taskId":"port-fwd","quizId":"c10q_l7","modules":[{"id":"c10l7m1","title":"VRF: separate tables"},{"id":"c10l7m2","title":"Monitoring and logging"},{"id":"c10l7m3","title":"The complete router and what’s next"}]}]};
var COURSE_11={"id":"course11","title":"Wireless in practice","blurb":"Wi-Fi from the ground up: joining, bands and channels, Wi-Fi generations, coverage and roaming, mesh vs repeater, antennas and MIMO, and a peek at security (WPA2/WPA3, guest) – all hands-on in the simulator. Deep security has its own the course <i>Wi-Fi: security in depth</i>.","lessons":[{"id":"c11l1","title":"Why wireless","taskId":null,"quizId":"c11q_l1","modules":[{"id":"c11l1m1","title":"A network without cables"},{"id":"c11l1m2","title":"The air is a shared medium"},{"id":"c11l1m3","title":"What wireless costs you"}]},{"id":"c11l2","title":"AP, SSID and joining","taskId":"wifi-connect","quizId":"c11q_l2","modules":[{"id":"c11l2m1","title":"The AP: a bridge into the wired network"},{"id":"c11l2m2","title":"How a client joins"},{"id":"c11l2m3","title":"Bands: 2.4 vs 5 vs 6 GHz"},{"id":"c11l2m4","title":"Channels and interference"},{"id":"c11l2m5","title":"Wi-Fi generations: 4, 5, 6, 7"}]},{"id":"c11l3","title":"Securing Wi-Fi","taskId":"wifi-secure","quizId":"c11q_l3","modules":[{"id":"c11l3m1","title":"An open network: anyone can listen"},{"id":"c11l3m2","title":"WPA2 and WPA3"},{"id":"c11l3m4","title":"Guest SSID and isolation"}]},{"id":"c11l4","title":"Coverage, roaming and mesh","taskId":"wifi-mesh","quizId":"c11q_l4","modules":[{"id":"c11l4m1","title":"One AP isn’t enough"},{"id":"c11l4m2","title":"Roaming between APs"},{"id":"c11l4m3","title":"Mesh vs repeater"}]},{"id":"c11l7","title":"Antennas and MIMO","taskId":null,"quizId":"c11q_l7","modules":[{"id":"c11l7m1","title":"Antennas and AP placement"},{"id":"c11l7m2","title":"MIMO, streams and beamforming"}]},{"id":"c11l5","title":"The whole path over wireless","taskId":"wifi-k2","quizId":"c11q_l5","modules":[{"id":"c11l5m1","title":"The home all-in-one"},{"id":"c11l5m2","title":"From phone to web: the whole path"}]}]};
var COURSE_12={"id":"course12","title":"Wi-Fi: security in depth","blurb":"Wireless security without the gloss: how WPA2’s handshake and WPA3 (SAE) really work, PMF, enterprise 802.1X/EAP authentication, captive portals and NAC, real attacks (evil twin, deauth, handshake capture, KRACK, WPS) and defense (WIPS, rogue-AP detection, monitoring, segmentation).","lessons":[{"id":"c12l1","title":"Why Wi-Fi needs more","taskId":"rogue-ap","quizId":"c12q_l1","modules":[{"id":"c12l1m1","title":"The attacker is in range"},{"id":"c12l1m2","title":"What a shared password doesn’t solve"},{"id":"c12l1m3","title":"The layers of Wi-Fi defense"}]},{"id":"c12l2","title":"Encryption in depth","taskId":null,"quizId":"c12q_l2","modules":[{"id":"c12l2m1","title":"WPA2: the four-way handshake"},{"id":"c12l2m2","title":"Capturing the handshake and the offline attack"},{"id":"c12l2m3","title":"WPA3 and SAE"},{"id":"c12l2m4","title":"PMF: protecting management frames"}]},{"id":"c12l3","title":"Enterprise authentication: 802.1X and EAP","taskId":"wifi-enterprise","quizId":"c12q_l3","modules":[{"id":"c12l3m1","title":"802.1X and RADIUS"},{"id":"c12l3m2","title":"EAP methods: TLS, PEAP, TTLS"},{"id":"c12l3m3","title":"Verifying the server’s identity"},{"id":"c12l3m4","title":"Dynamic VLANs and accounting"}]},{"id":"c12l4","title":"Guest, captive portal and NAC","taskId":"wifi-guest","quizId":"c12q_l4","modules":[{"id":"c12l4m1","title":"Guest isolation in depth"},{"id":"c12l4m2","title":"Captive portal and the walled garden"},{"id":"c12l4m3","title":"Enhanced Open and NAC"}]},{"id":"c12l5","title":"Attacks on Wi-Fi","taskId":"evil-twin","quizId":"c12q_l5","modules":[{"id":"c12l5m1","title":"Evil twin and deauthentication"},{"id":"c12l5m2","title":"Rogue AP and KARMA"},{"id":"c12l5m3","title":"Capture and crack (handshake, PMKID, WPS)"},{"id":"c12l5m4","title":"KRACK and downgrade attacks"}]},{"id":"c12l6","title":"Defense and operations","taskId":"vpn-radius","quizId":"c12q_l6","modules":[{"id":"c12l6m1","title":"Myths: hidden SSID, MAC filter, WPS"},{"id":"c12l6m2","title":"WIPS and rogue-AP detection"},{"id":"c12l6m3","title":"Monitoring, logs and who/when"},{"id":"c12l6m4","title":"Segmentation and Zero Trust"}]},{"id":"c12l7","title":"The whole defense together","taskId":null,"quizId":"c12q_l7","modules":[{"id":"c12l7m1","title":"Layered Wi-Fi defense"},{"id":"c12l7m2","title":"What’s next: WPA3-only, DPP, 6 GHz"}]}]};
var COURSE_13={"id":"course13","title":"OT/ICS: industrial network security","blurb":"Networks that move real things: PLCs, HMIs and the historian, availability first, the Purdue model and IT/OT segmentation, the industrial DMZ, Modbus without authentication, the data diode and one-way flows, attacks on OT (Stuxnet, ransomware, insiders, vendor access) and operational defense (inventory, passive monitoring, zones, backups).","lessons":[{"id":"c13l1","title":"What OT is and why it differs","taskId":null,"quizId":"c13q_l1","modules":[{"id":"c13l1m1","title":"The network that moves things"},{"id":"c13l1m2","title":"Availability above all"},{"id":"c13l1m3","title":"Twenty years without a patch"}]},{"id":"c13l2","title":"The Purdue model and IT/OT segmentation","taskId":null,"quizId":"c13q_l2","modules":[{"id":"c13l2m1","title":"The Purdue model: the plant’s floors"},{"id":"c13l2m2","title":"Why IT must not reach the PLC directly"},{"id":"c13l2m3","title":"The industrial DMZ and the middleman"}]},{"id":"c13l3","title":"Industrial protocols","taskId":"ch-otseg","quizId":"c13q_l3","modules":[{"id":"c13l3m1","title":"Modbus: a protocol without a lock"},{"id":"c13l3m2","title":"Where data flows: 502 vs 1433"},{"id":"c13l3m3","title":"Verify it in the simulator"}]},{"id":"c13l4","title":"The data diode and one-way flows","taskId":"diode-way","quizId":"c13q_l4","modules":[{"id":"c13l4m1","title":"The diode: physics instead of rules"},{"id":"c13l4m2","title":"Monitoring out, no path in"},{"id":"c13l4m3","title":"Where the diode pays off"}]},{"id":"c13l5","title":"Attacks on OT","taskId":null,"quizId":"c13q_l5","modules":[{"id":"c13l5m1","title":"Stuxnet: the attack that moved iron"},{"id":"c13l5m2","title":"Ransomware: production stops via IT"},{"id":"c13l5m3","title":"The insider, USB and the service laptop"},{"id":"c13l5m4","title":"Vendor remote access"}]},{"id":"c13l6","title":"OT defense and operations","taskId":null,"quizId":"c13q_l6","modules":[{"id":"c13l6m1","title":"Inventory: you can’t protect the unknown"},{"id":"c13l6m2","title":"Passive monitoring: why you don’t scan"},{"id":"c13l6m3","title":"Zones, conduits and the recovery plan"},{"id":"c13l6m4","title":"Summary: the whole defense together"}]}]};
var COURSE_14={"id":"course14","title":"Network resilience and scaling","blurb":"Networks that survive a fault and bear a surge: the single point of failure (SPOF) and high availability (N-1), the HA firewall pair (active/standby vs active/active, failover, state synchronization, split-brain), load balancing (scale-out, VIP, algorithms, sticky sessions, health check), the redundancy map (STP, HSRP/VRRP, EtherChannel/LAG, multi-WAN) and designing a resilient network by risk analysis.","lessons":[{"id":"c14l1","title":"Why resilience: SPOF and N-1","taskId":"spof-fix","quizId":"c14q_l1","modules":[{"id":"c14l1m1","title":"The single point of failure (SPOF)"},{"id":"c14l1m2","title":"High availability and N-1"},{"id":"c14l1m3","title":"Find the SPOF: audit and resilience test"}]},{"id":"c14l2","title":"High availability: the HA pair","taskId":"ha-failover","quizId":"c14q_l2","modules":[{"id":"c14l2m1","title":"Active/standby vs active/active"},{"id":"c14l2m2","title":"How failover happens"},{"id":"c14l2m3","title":"State synchronization and split-brain"}]},{"id":"c14l3","title":"Load balancing","taskId":"lb-web","quizId":"c14q_l3","modules":[{"id":"c14l3m1","title":"Scale-up vs scale-out and the VIP"},{"id":"c14l3m2","title":"Balancing algorithms"},{"id":"c14l3m3","title":"Health check and the dead backend"}]},{"id":"c14l4","title":"The redundancy map","taskId":"n1-map","quizId":"c14q_l4","modules":[{"id":"c14l4m1","title":"L2 and gateway redundancy"},{"id":"c14l4m2","title":"Capacity and WAN redundancy"},{"id":"c14l4m3","title":"The whole map: where to use what"}]},{"id":"c14l5","title":"Designing a resilient network","taskId":"slow-link","quizId":"c14q_l5","modules":[{"id":"c14l5m1","title":"Layer your redundancy"},{"id":"c14l5m2","title":"Cost vs benefit"},{"id":"c14l5m3","title":"Summary: resilience together"}]}]};
var COURSE_15={"id":"course15","title":"Build your first company network","blurb":"A consolidation course: turn a small company’s requirements into a working, secure network. You put the courses from <i>Why networks exist and how data travels</i> to <i>Network security</i> to work – three groups by trust (employees, servers, guests) and a plan, VLAN segmentation, subnets and gateways with a router (inter-VLAN) and NAT out, a firewall with inside/DMZ/outside zones (web on 443, guests out only, default-deny) and finally a path test and topology check that shrinks the blast radius.","lessons":[{"id":"c15l1","title":"Requirements and plan","taskId":null,"quizId":"c15q_l1","modules":[{"id":"c15l1m1","title":"A small company: what it has and needs"},{"id":"c15l1m2","title":"Three groups, three risks"},{"id":"c15l1m3","title":"Sketch the plan: groups → segments"}]},{"id":"c15l2","title":"Segmentation into VLANs","taskId":"inter-vlan","quizId":"c15q_l2","modules":[{"id":"c15l2m1","title":"Why one flat network isn’t enough"},{"id":"c15l2m2","title":"Split into VLANs: employees, servers, guests"},{"id":"c15l2m3","title":"Isolating the guests"}]},{"id":"c15l3","title":"Router and addresses","taskId":"subnet-lab","quizId":"c15q_l3","modules":[{"id":"c15l3m1","title":"Give each VLAN a subnet and gateway"},{"id":"c15l3m4","title":"DHCP in a bigger network"},{"id":"c15l3m2","title":"Traffic between VLANs through the router"},{"id":"c15l3m3","title":"NAT out to the internet"}]},{"id":"c15l4","title":"Firewall and zones","taskId":"web-dmz","quizId":"c15q_l4","modules":[{"id":"c15l4m1","title":"Insert the firewall: inside/DMZ/outside zones"},{"id":"c15l4m2","title":"Servers into the DMZ (web out on 443)"},{"id":"c15l4m3","title":"Guests out only, default-deny"}]},{"id":"c15l5","title":"Test and harden","taskId":null,"quizId":"c15q_l5","modules":[{"id":"c15l5m1","title":"Path test: what may and what may not"},{"id":"c15l5m2","title":"Topology check and blast radius"},{"id":"c15l5m3","title":"Summary and what’s next"}]}]};
var COURSE_16={"id":"course16","title":"DNS and names in the network","blurb":"From the “phone book” into depth: who asks whom (client, resolver, authority), cache and TTL, your own local DNS in a company as well as public resolvers and the path from the root, record types (A, CNAME, MX, TXT, NS, PTR) and what they are for — and finally what happens when DNS fails or lies.","lessons":[{"id":"c16l1","title":"From a name to an address","taskId":null,"quizId":"c16q_l1","modules":[{"id":"c16l1m1","title":"Why names: addresses change, names stay"},{"id":"c16l1m2","title":"Who asks whom: client, resolver, authority"},{"id":"c16l1m3","title":"Cache and TTL: why we do not ask every time"}]},{"id":"c16l2","title":"Local DNS: names in your own network","taskId":"dns-down","quizId":"c16q_l2","modules":[{"id":"c16l2m1","title":"Why have DNS at home and in a company"},{"id":"c16l2m2","title":"Records and forwarding: what I know, the rest I pass on"},{"id":"c16l2m4","title":"Who resolves? The router as a resolver"},{"id":"c16l2m3","title":"When DNS fails: the server runs, but nobody finds it"}]},{"id":"c16l3","title":"Public DNS: the path from the root","taskId":null,"quizId":"c16q_l3","modules":[{"id":"c16l3m1","title":"The name hierarchy: root, TLD, domain"},{"id":"c16l3m2","title":"Recursion in practice: root → TLD → authority"},{"id":"c16l3m3","title":"Public resolvers and privacy"}]},{"id":"c16l4","title":"Record types and what they are for","taskId":"dns-alias","quizId":"c16q_l4","modules":[{"id":"c16l4m1","title":"A and AAAA: a name to an IP address"},{"id":"c16l4m2","title":"CNAME: an alias of another name"},{"id":"c16l4m3","title":"MX and TXT: mail and verification"},{"id":"c16l4m4","title":"NS and PTR: delegation and reverse lookup"}]},{"id":"c16l5","title":"When DNS lies","taskId":"dns-rogue","quizId":"c16q_l5","modules":[{"id":"c16l5m1","title":"A rogue resolver: you get the attacker’s address"},{"id":"c16l5m2","title":"Poisoned cache and DNSSEC"},{"id":"c16l5m3","title":"DoH and DoT: an encrypted query"}]}]};
var COURSE_17={"id":"course17","title":"When the network breaks: troubleshooting","blurb":"Method instead of guessing: turning a complaint into a fault description, scope, bottom-up and top-down approaches and halving the problem. Then layer by layer: cable, port and admin down, an access port in the wrong VLAN and a trunk without the allowed VLAN, address, mask, gateway and a missing route, the name-versus-address test, a silent resolver and a stale cached answer, and finally the default deny and the shadowing rule on a firewall – including isolation, documentation and escalation when nothing helps.","lessons":[{"id":"c17l1","title":"Method instead of guessing","taskId":"ch-down","quizId":"c17q_l1","modules":[{"id":"c17l1m1","title":"What actually happened"},{"id":"c17l1m2","title":"Scope: one user, or the whole network?"},{"id":"c17l1m3","title":"Bottom-up, top-down and halving"}]},{"id":"c17l2","title":"The physical layer and connections","taskId":"ch-down","quizId":"c17q_l2","modules":[{"id":"c17l2m1","title":"Cable, port, link state"},{"id":"c17l2m2","title":"A disabled port and admin down"},{"id":"c17l2m3","title":"When one connection is faulty"}]},{"id":"c17l3","title":"L2: VLANs and ports","taskId":"ch-portvlan","quizId":"c17q_l3","modules":[{"id":"c17l3m1","title":"An access port in the wrong VLAN"},{"id":"c17l3m2","title":"A trunk that does not carry what it should"},{"id":"c17l3m3","title":"Where the frame gets lost"}]},{"id":"c17l4","title":"L3: addresses, gateway, paths","taskId":"ch-gw","quizId":"c17q_l4","modules":[{"id":"c17l4m1","title":"A wrong IP or mask"},{"id":"c17l4m2","title":"A missing or wrong gateway"},{"id":"c17l4m3","title":"A missing route"}]},{"id":"c17l5","title":"The IP works, the name does not","taskId":"dns-down","quizId":"c17q_l5","modules":[{"id":"c17l5m1","title":"Testing by name vs by address"},{"id":"c17l5m2","title":"When the resolver stays silent"},{"id":"c17l5m3","title":"Cache and the stale answer"}]},{"id":"c17l6","title":"When a rule is to blame","taskId":"shadow-rule","quizId":"c17q_l6","modules":[{"id":"c17l6m1","title":"The firewall and default deny"},{"id":"c17l6m2","title":"The shadowing rule"},{"id":"c17l6m3","title":"When nothing helps"}]}]};
var COURSE_18={"id":"course18","title":"Zero Trust and microsegmentation","blurb":"Why a wall at the network border is not enough and what to do instead: the attacker pivot and lateral movement, the three Zero Trust principles, least privilege in rules (any-any, default deny, shadowed rules), role-based microsegmentation, identity verification with 802.1X and RADIUS, blast radius and decoys, and the journey from a flat network step by step.","lessons":[{"id":"c18l1","title":"Why the perimeter is not enough","taskId":"dmz-pivot","quizId":"c18q_l1","modules":[{"id":"c18l1m1","title":"Castle and moat: the model that failed"},{"id":"c18l1m2","title":"Pivot: the attacker is already inside"},{"id":"c18l1m3","title":"The three Zero Trust principles"}]},{"id":"c18l2","title":"Least privilege in rules","taskId":"default-deny","quizId":"c18q_l2","modules":[{"id":"c18l2m1","title":"From any-any to the specific"},{"id":"c18l2m2","title":"Default deny as the default stance"},{"id":"c18l2m3","title":"Rules that overlap"}]},{"id":"c18l3","title":"Microsegmentation","taskId":"vlan-design","quizId":"c18q_l3","modules":[{"id":"c18l3m1","title":"Segment by role, not by floor"},{"id":"c18l3m2","title":"Guest and IoT: where they must not go"},{"id":"c18l3m3","title":"How many segments is too many"}]},{"id":"c18l4","title":"Verify identity, not the socket","taskId":"wifi-enterprise","quizId":"c18q_l4","modules":[{"id":"c18l4m1","title":"802.1X and RADIUS on Wi-Fi"},{"id":"c18l4m2","title":"VPN authentication against RADIUS"},{"id":"c18l4m3","title":"What to do when the authentication server fails"}]},{"id":"c18l5","title":"Assume breach","taskId":"guest-iso","quizId":"c18q_l5","modules":[{"id":"c18l5m1","title":"Blast radius: where the attacker reaches"},{"id":"c18l5m2","title":"A decoy as an early warning"},{"id":"c18l5m3","title":"The topology check as hygiene"}]},{"id":"c18l6","title":"Zero Trust in practice","taskId":"ch-guest","quizId":"c18q_l6","modules":[{"id":"c18l6m1","title":"The journey from a flat network"},{"id":"c18l6m2","title":"What Zero Trust is not"},{"id":"c18l6m3","title":"A checklist for your design"}]}]};
var COURSE_19={"id":"course19","title":"Monitoring, logging and detection","blurb":"How you find out what is really happening in your network: why nothing can be traced without logs, the log server as one place for the whole network, severity levels and alert fatigue, lost logs and blind spots (syslog rides on UDP 514 and a firewall can close it), flows, baselines and anomalies, correlating fragments into a single incident, SIEM in concept, and device monitoring including a decoy and a checklist.","lessons":[{"id":"c19l1","title":"Why logs","taskId":null,"quizId":"c19q_l1","modules":[{"id":"c19l1m1","title":"What happens when you have no logs"},{"id":"c19l1m2","title":"Log server: one place for the whole network"},{"id":"c19l1m3","title":"What to log and what not to"}]},{"id":"c19l2","title":"Severity and what to do with it","taskId":null,"quizId":"c19q_l2","modules":[{"id":"c19l2m1","title":"Severity levels"},{"id":"c19l2m2","title":"Critical events you must not miss"},{"id":"c19l2m3","title":"Alert fatigue"}]},{"id":"c19l3","title":"When logs do not arrive","taskId":"syslog-blocked","quizId":"c19q_l3","modules":[{"id":"c19l3m1","title":"The log path is traffic too"},{"id":"c19l3m2","title":"The firewall blocks port 514"},{"id":"c19l3m3","title":"Lost logs = a blind spot"}]},{"id":"c19l4","title":"Who talks to whom","taskId":"c2-dns","quizId":"c19q_l4","modules":[{"id":"c19l4m1","title":"Traffic as a flow"},{"id":"c19l4m2","title":"Baseline: what is normal"},{"id":"c19l4m3","title":"Anomalies: what stands out"}]},{"id":"c19l5","title":"Correlation: a story from fragments","taskId":"storm-stp","quizId":"c19q_l5","modules":[{"id":"c19l5m1","title":"One event is not enough"},{"id":"c19l5m2","title":"Three lines, one incident"},{"id":"c19l5m3","title":"SIEM: correlation at scale"}]},{"id":"c19l6","title":"Monitoring in practice","taskId":"ch-ids","quizId":"c19q_l6","modules":[{"id":"c19l6m1","title":"What to watch on devices"},{"id":"c19l6m2","title":"A decoy as a clean signal"},{"id":"c19l6m3","title":"A monitoring checklist"}]}]};
var COURSE_20={"id":"course20","title":"Networking to the cloud","blurb":"What the cloud looks like through the eyes of the network: the cloud as someone else’s datacenter behind the network and shared responsibility, an open bucket as an open zone, site-to-site and remote-access VPN into the cloud, publishing a service via a public IP and DNAT, a load balancer before a web farm, a cloud DMZ and security groups with default deny, and resilience through multi-WAN, backups and regions.","lessons":[{"id":"c20l1","title":"The cloud is not magic","taskId":null,"quizId":"c20q_l1","modules":[{"id":"c20l1m1","title":"The cloud is a datacenter behind the network"},{"id":"c20l1m2","title":"Shared responsibility"},{"id":"c20l1m3","title":"An open bucket = an open zone"}]},{"id":"c20l2","title":"Site-to-site VPN into the cloud","taskId":"site2site","quizId":"c20q_l2","modules":[{"id":"c20l2m1","title":"A permanent tunnel between company and cloud"},{"id":"c20l2m2","title":"What flows through the tunnel and what not"},{"id":"c20l2m3","title":"When the tunnel drops"}]},{"id":"c20l3","title":"Remote access into the cloud","taskId":"remote-vpn","quizId":"c20q_l3","modules":[{"id":"c20l3m1","title":"Remote-access vs. site-to-site"},{"id":"c20l3m2","title":"A user from the internet into the cloud"},{"id":"c20l3m3","title":"The difference between the approaches"}]},{"id":"c20l4","title":"Publishing a service","taskId":"lb-web","quizId":"c20q_l4","modules":[{"id":"c20l4m1","title":"A public IP and DNAT"},{"id":"c20l4m2","title":"A load balancer before a web farm"},{"id":"c20l4m3","title":"Only what should be public"}]},{"id":"c20l5","title":"A cloud DMZ and security groups","taskId":"web-dmz","quizId":"c20q_l5","modules":[{"id":"c20l5m1","title":"A security group = a zone firewall"},{"id":"c20l5m2","title":"Segmentation in the cloud"},{"id":"c20l5m3","title":"Default deny in the cloud too"}]},{"id":"c20l6","title":"Resilience and design","taskId":"wan-failover","quizId":"c20q_l6","modules":[{"id":"c20l6m1","title":"Redundant connectivity (multi-WAN)"},{"id":"c20l6m2","title":"Where to put data: backups and regions"},{"id":"c20l6m3","title":"A cloud network checklist"}]}]};
var COURSE_21={"id":"course21","title":"When it happens: incident response","blurb":"What to do when something happens in the network that should not have: the response phases and preparation (log server, contacts, network map, configuration backups), roles and escalation, where the first signal comes from and how to triage it, containment by quarantine and its price, investigation from a timeline and flows including the real blast radius, remediating the cause instead of the symptom, safe recovery with the N-1 test, and a blameless post-mortem.","lessons":[{"id":"c21l1","title":"Before it happens","taskId":null,"quizId":"c21q_l1","modules":[{"id":"c21l1m1","title":"The phases of incident response"},{"id":"c21l1m2","title":"What to prepare in advance"},{"id":"c21l1m3","title":"Who does what"}]},{"id":"c21l2","title":"Detection: the first signal","taskId":"ch-ids","quizId":"c21q_l2","modules":[{"id":"c21l2m1","title":"Where the first report comes from"},{"id":"c21l2m2","title":"An alert vs. an incident"},{"id":"c21l2m3","title":"Verify before you raise the alarm"}]},{"id":"c21l3","title":"Containment: stop the spread","taskId":"quar-contain","quizId":"c21q_l3","modules":[{"id":"c21l3m1","title":"Isolating a device and its price"},{"id":"c21l3m2","title":"When to isolate and when to watch"},{"id":"c21l3m3","title":"What isolation does not solve"}]},{"id":"c21l4","title":"Investigation","taskId":"c2-dns","quizId":"c21q_l4","modules":[{"id":"c21l4m1","title":"A timeline from the logs"},{"id":"c21l4m2","title":"How it spread"},{"id":"c21l4m3","title":"What to write down"}]},{"id":"c21l5","title":"Remediation and recovery","taskId":"spof-fix","quizId":"c21q_l5","modules":[{"id":"c21l5m1","title":"Remove the cause, not the symptom"},{"id":"c21l5m2","title":"Back into service safely"},{"id":"c21l5m3","title":"When an incident is closed"}]},{"id":"c21l6","title":"Lessons learned","taskId":"layered-def","quizId":"c21q_l6","modules":[{"id":"c21l6m1","title":"A blameless post-mortem"},{"id":"c21l6m2","title":"What to change in the network"},{"id":"c21l6m3","title":"A readiness checklist"}]}]};
var COURSE_22={"id":"course22","title":"Encryption in the network: what it hides and what not","blurb":"From the Caesar cipher and frequency analysis to today: what is visible on the cable and what encryption really hides, three properties (confidentiality, integrity, authenticity), symmetric and asymmetric ciphers and why they are used together, password hashing with salt and pepper, the TLS handshake step by step, what a certificate holds and why the browser complains, the chain of trust and an internal company authority, the limits of encryption (a compromised computer, firewall decryption, metadata) and the practical order of what to encrypt first.","lessons":[{"id":"c22l1","title":"From Caesar to today","taskId":null,"quizId":"c22q_l1","modules":[{"id":"c22l1m1","title":"The Caesar cipher"},{"id":"c22l1m2","title":"Why hand ciphers fall"},{"id":"c22l1m3","title":"Hide or encrypt"}]},{"id":"c22l2","title":"Why encrypt","taskId":"wiretap","quizId":"c22q_l2","modules":[{"id":"c22l2m1","title":"What is visible on the cable"},{"id":"c22l2m2","title":"What encryption solves and what not"},{"id":"c22l2m3","title":"Three properties"}]},{"id":"c22l3","title":"Unencrypted protocols and their replacements","taskId":"block-telnet","quizId":"c22q_l3","modules":[{"id":"c22l3m1","title":"The pairs you must know"},{"id":"c22l3m2","title":"How to tell what runs in your network"},{"id":"c22l3m3","title":"Migration without an outage"}]},{"id":"c22l4","title":"How it works without the math","taskId":null,"quizId":"c22q_l4","modules":[{"id":"c22l4m1","title":"The symmetric cipher"},{"id":"c22l4m2","title":"The asymmetric cipher"},{"id":"c22l4m3","title":"Why they are used together"}]},{"id":"c22l5","title":"Hashing: a fingerprint, not a cipher","taskId":null,"quizId":"c22q_l5","modules":[{"id":"c22l5m1","title":"A fingerprint with no way back"},{"id":"c22l5m2","title":"Salt and pepper"},{"id":"c22l5m3","title":"A fingerprint as an integrity check"}]},{"id":"c22l6","title":"TLS in practice","taskId":null,"quizId":"c22q_l6","modules":[{"id":"c22l6m1","title":"What happens when you open https"},{"id":"c22l6m2","title":"What a certificate holds"},{"id":"c22l6m3","title":"Why the browser complains"}]},{"id":"c22l7","title":"Certificates and authorities","taskId":null,"quizId":"c22q_l7","modules":[{"id":"c22l7m1","title":"Who trusts whom"},{"id":"c22l7m2","title":"An internal company authority"},{"id":"c22l7m3","title":"When a certificate fails"}]},{"id":"c22l8","title":"Where encryption is not enough","taskId":"tls-blind","quizId":"c22q_l8","modules":[{"id":"c22l8m1","title":"An attacker on the endpoint"},{"id":"c22l8m2","title":"Decryption on the firewall"},{"id":"c22l8m3","title":"Metadata and traffic analysis"}]},{"id":"c22l9","title":"Practice and summary","taskId":null,"quizId":"c22q_l9","modules":[{"id":"c22l9m1","title":"What to encrypt first"},{"id":"c22l9m2","title":"Common mistakes"},{"id":"c22l9m3","title":"A checklist"}]}]};
var COURSE_23={"id":"course23","title":"DHCP: how a device gets an address","blurb":"Addresses are not handed out by hand: the four DORA messages, the whole settings bundle (address, mask, gateway, DNS), the range and the lease time, reservations by MAC, relays into remote networks – and finally the rogue server, the drained range and the defense on the switch.","lessons":[{"id":"c23l1","title":"Why addresses are not handed out by hand","taskId":null,"quizId":"c23q_l1","modules":[{"id":"c23l1m1","title":"Manual addresses and their limits"},{"id":"c23l1m2","title":"What a client actually needs"},{"id":"c23l1m3","title":"Where the DHCP server lives"}]},{"id":"c23l2","title":"DORA: the four messages","taskId":null,"quizId":"c23q_l2","modules":[{"id":"c23l2m1","title":"Discover: a shout into the dark"},{"id":"c23l2m2","title":"Offer: an offer, not an order"},{"id":"c23l2m3","title":"Request and Acknowledge"},{"id":"c23l2m4","title":"When two answer"}]},{"id":"c23l3","title":"Range, lease and reservations","taskId":"ch-dhcppool","quizId":"c23q_l3","modules":[{"id":"c23l3m1","title":"The range: from where to where"},{"id":"c23l3m2","title":"What does not belong in a range"},{"id":"c23l3m3","title":"The lease: lent for a time"},{"id":"c23l3m4","title":"Reservations by MAC"}]},{"id":"c23l4","title":"When the server is elsewhere: the relay","taskId":"ch-dhcp","quizId":"c23q_l4","modules":[{"id":"c23l4m1","title":"A broadcast does not cross a router"},{"id":"c23l4m2","title":"The relay: repackage and forward"},{"id":"c23l4m3","title":"One server for several networks"}]},{"id":"c23l5","title":"When DHCP misbehaves","taskId":"dhcp-starvation","quizId":"c23q_l5","modules":[{"id":"c23l5m1","title":"A rogue DHCP server"},{"id":"c23l5m2","title":"Starvation: a drained range"},{"id":"c23l5m3","title":"Defense: snooping and port security"}]}]};
var COURSE_24={"id":"course24","title":"Splitting a network: subnets in practice","blurb":"Building on the bit ruler from the course <i>ISO/OSI and TCP/IP: the network map</i>, this takes the next step: how to split one allocated network into several pieces of different sizes. How many addresses to ask for, where subnets begin, VLSM and the largest-first order, the /30 on router links – and the mistakes that break a plan (overlap, a wrong mask, exhausted addresses).","lessons":[{"id":"c24l1","title":"Why split one network","taskId":null,"quizId":"c24q_l1","modules":[{"id":"c24l1m1","title":"One large network: noise and security"},{"id":"c24l1m2","title":"How many addresses you actually need"},{"id":"c24l1m3","title":"Where to draw from: private ranges"}]},{"id":"c24l2","title":"Where the network ends and the host begins","taskId":null,"quizId":"c24q_l2","modules":[{"id":"c24l2m1","title":"The prefix as a line in the address"},{"id":"c24l2m2","title":"Network address, broadcast and the rest"},{"id":"c24l2m3","title":"The step between subnets"}]},{"id":"c24l3","title":"Split one network into several","taskId":"subnet-plan","quizId":"c24q_l3","modules":[{"id":"c24l3m1","title":"Equal-sized pieces"},{"id":"c24l3m2","title":"VLSM: pieces of different sizes"},{"id":"c24l3m3","title":"Largest first"},{"id":"c24l3m4","title":"/30 and /31 on a link"}]},{"id":"c24l4","title":"Mistakes in a plan","taskId":"ch-badip","quizId":"c24q_l4","modules":[{"id":"c24l4m1","title":"Overlapping subnets"},{"id":"c24l4m2","title":"A wrong mask: a neighbor that is not one"},{"id":"c24l4m3","title":"When the addresses run out"}]}]};
var COURSE_25={"id":"course25","title":"IPv6: why it exists and how to plan it","blurb":"The biggest gap in a network from A to Z: why IPv4 ran out, how a 128-bit address is really written and read, what the extra room fixes, why the router stops doing NAT, addresses without a server (SLAAC and DHCPv6), link-local and multicast, the transition (dual-stack and tunnels) and how you plan a dual-stack network with room left behind.","lessons":[{"id":"c25l1","title":"Why IPv6 exists","taskId":null,"quizId":"c25q_l1","modules":[{"id":"c25l1m1","title":"4.3 billion, and then nothing"},{"id":"c25l1m2","title":"Writing a 128-bit address"},{"id":"c25l1m3","title":"What the extra room fixes"}]},{"id":"c25l2","title":"How IPv6 behaves differently","taskId":"nat-lab","quizId":"c25q_l2","modules":[{"id":"c25l2m1","title":"The router stops doing NAT"},{"id":"c25l2m2","title":"Addresses without a server"},{"id":"c25l2m3","title":"Link-local, zones and multicast"}]},{"id":"c25l3","title":"Getting there: the transition","taskId":null,"quizId":"c25q_l3","modules":[{"id":"c25l3m1","title":"One network, two families"},{"id":"c25l3m2","title":"When the other side speaks only v4"},{"id":"c25l3m3","title":"Planning a v6 network"}]},{"id":"c25l4","title":"Before you switch it on","taskId":"dns-alias","quizId":"c25q_l4","modules":[{"id":"c25l4m1","title":"DNS and the AAAA record"},{"id":"c25l4m2","title":"A checklist before the switch-on"}]}]};
var COURSE_26={"id":"course26","title":"The physical layer: cables, media and links","blurb":"The layer everything else assumes. What a cable actually carries and why the twist matters, copper against fibre and where each stops working, straight-through against crossover and Auto-MDI, speed and duplex and why a mismatch is not “half speed”, power over Ethernet and its budget, and how to read a link from both ends.","lessons":[{"id":"c26l1","title":"The medium itself","taskId":"ch-down","quizId":"c26q_l1","modules":[{"id":"c26l1m1","title":"What a cable actually is"},{"id":"c26l1m2","title":"Copper and fibre"},{"id":"c26l1m3","title":"Crossover and Auto-MDI"}]},{"id":"c26l2","title":"A working link","taskId":null,"quizId":"c26q_l2","modules":[{"id":"c26l2m1","title":"Speed and duplex"},{"id":"c26l2m2","title":"Power over Ethernet"},{"id":"c26l2m3","title":"Reading a link"}]}]};
var COURSE_27={"id":"course27","title":"Multicast: one sender, many receivers","blurb":"The other traffic shape. Why one-to-many deserves its own machinery, multicast addresses and why they are scoped, IGMP – who joins and the awkward question of who leaves, why a naive switch floods a stream meant for a few, why routers do not forward multicast at all until PIM is configured, and the shapes a stream can take (shared tree, source tree, SSM).","lessons":[{"id":"c27l1","title":"What multicast is for","taskId":null,"quizId":"c27q_l1","modules":[{"id":"c27l1m1","title":"Why one-to-many is its own problem"},{"id":"c27l1m2","title":"Multicast addresses and groups"}]},{"id":"c27l2","title":"Joining and leaving","taskId":"ch-vlan","quizId":"c27q_l2","modules":[{"id":"c27l2m1","title":"IGMP: joining and leaving"},{"id":"c27l2m2","title":"Switches and multicast floods"}]},{"id":"c27l3","title":"Across routers","taskId":null,"quizId":"c27q_l3","modules":[{"id":"c27l3m1","title":"Why routers do not forward it by default"},{"id":"c27l3m2","title":"Trees and rendezvous points"}]},{"id":"c27l4","title":"Choosing it well","taskId":null,"quizId":"c27q_l4","modules":[{"id":"c27l4m1","title":"When multicast is the right tool"}]}]};
var COURSE_28={"id":"course28","title":"First-hop redundancy: HSRP, VRRP, GLBP","blurb":"The failure the redundancy map is easiest to forget. Why the single default gateway is a single point of failure, how a virtual IP and a virtual MAC make two routers behave like one, how the pair agrees on who leads and how failover actually happens, what it costs and what it does not fix, and the load-balancing variant GLBP.","lessons":[{"id":"c28l1","title":"The single-gateway problem","taskId":"hsrp","quizId":"c28q_l1","modules":[{"id":"c28l1m1","title":"One gateway, one single point of failure"},{"id":"c28l1m2","title":"The virtual address"}]},{"id":"c28l2","title":"How the pair works","taskId":"spof-fix","quizId":"c28q_l2","modules":[{"id":"c28l2m1","title":"Roles, priority, preemption and tracking"},{"id":"c28l2m2","title":"When the active router fails"}]},{"id":"c28l3","title":"Judgement","taskId":null,"quizId":"c28q_l3","modules":[{"id":"c28l3m1","title":"What it costs and what it does not fix"},{"id":"c28l3m2","title":"The third kind: load balancing"}]}]};
var COURSE_29={"id":"course29","title":"Quality of Service in depth","blurb":"Beyond the one checkbox. What a congested link actually does to a call, how traffic is classified and marked (DSCP and 802.1p) and why the trust boundary is the whole security story, queues and how they are served (PQ, WFQ, CBWFQ), policing versus shaping and why voice wants shaping, the VoIP trust problem that one changed cable can cause, and the order in which a QoS design should actually be done.","lessons":[{"id":"c29l1","title":"The problem","taskId":"qos-voice","quizId":"c29q_l1","modules":[{"id":"c29l1m1","title":"What a congested link does"},{"id":"c29l1m2","title":"Classifying: what deserves better"}]},{"id":"c29l2","title":"The mechanisms","taskId":null,"quizId":"c29q_l2","modules":[{"id":"c29l2m1","title":"Queues and how they are served"},{"id":"c29l2m2","title":"Shaping or policing"}]},{"id":"c29l3","title":"Doing it properly","taskId":null,"quizId":"c29q_l3","modules":[{"id":"c29l3m1","title":"The VoIP trust problem"},{"id":"c29l3m2","title":"Getting it right"}]}]};
var COURSE_30={"id":"course30","title":"Storage networks: block, file and the array","blurb":"Where storage became a network service. Block versus file (SAN versus NAS) and why a database wants one and users the other, the protocols (NFS, SMB, iSCSI, Fibre Channel), the idea that undoes most assumptions – latency matters more than bandwidth – the dedicated storage VLAN and its ACL, and resilience with RAID, snapshots and replication.","lessons":[{"id":"c30l1","title":"Why storage is a network problem","taskId":null,"quizId":"c30q_l1","modules":[{"id":"c30l1m1","title":"From a disk inside the server to a service"},{"id":"c30l1m2","title":"Block or file: SAN versus NAS"}]},{"id":"c30l2","title":"How storage speaks","taskId":"slow-link","quizId":"c30q_l2","modules":[{"id":"c30l2m1","title":"The protocols you meet as ports"},{"id":"c30l2m2","title":"Latency beats bandwidth"}]},{"id":"c30l3","title":"Designing for it","taskId":"storage-vlan","quizId":"c30q_l3","modules":[{"id":"c30l3m1","title":"The storage VLAN"},{"id":"c30l3m2","title":"Capacity and survival"}]}]};
var COURSE_1_QUIZZES={},COURSE_2_QUIZZES={},COURSE_3_QUIZZES={},COURSE_4_QUIZZES={},COURSE_5_QUIZZES={},COURSE_6_QUIZZES={},COURSE_7_QUIZZES={},COURSE_8_QUIZZES={},COURSE_9_QUIZZES={},COURSE_10_QUIZZES={},COURSE_11_QUIZZES={},COURSE_12_QUIZZES={},COURSE_13_QUIZZES={},COURSE_14_QUIZZES={},COURSE_15_QUIZZES={},COURSE_16_QUIZZES={},COURSE_17_QUIZZES={},COURSE_18_QUIZZES={},COURSE_19_QUIZZES={},COURSE_20_QUIZZES={},COURSE_21_QUIZZES={},COURSE_22_QUIZZES={},COURSE_23_QUIZZES={},COURSE_24_QUIZZES={},COURSE_25_QUIZZES={},COURSE_26_QUIZZES={},COURSE_27_QUIZZES={},COURSE_28_QUIZZES={},COURSE_29_QUIZZES={},COURSE_30_QUIZZES={};
var COURSE_1_FINAL_EXTRA=[],COURSE_2_FINAL_EXTRA=[],COURSE_3_FINAL_EXTRA=[],COURSE_4_FINAL_EXTRA=[],COURSE_5_FINAL_EXTRA=[],COURSE_6_FINAL_EXTRA=[],COURSE_7_FINAL_EXTRA=[],COURSE_8_FINAL_EXTRA=[],COURSE_9_FINAL_EXTRA=[],COURSE_10_FINAL_EXTRA=[],COURSE_11_FINAL_EXTRA=[],COURSE_12_FINAL_EXTRA=[],COURSE_13_FINAL_EXTRA=[],COURSE_14_FINAL_EXTRA=[],COURSE_15_FINAL_EXTRA=[],COURSE_16_FINAL_EXTRA=[],COURSE_17_FINAL_EXTRA=[],COURSE_18_FINAL_EXTRA=[],COURSE_19_FINAL_EXTRA=[],COURSE_20_FINAL_EXTRA=[],COURSE_21_FINAL_EXTRA=[],COURSE_22_FINAL_EXTRA=[],COURSE_23_FINAL_EXTRA=[],COURSE_24_FINAL_EXTRA=[],COURSE_25_FINAL_EXTRA=[],COURSE_26_FINAL_EXTRA=[],COURSE_27_FINAL_EXTRA=[],COURSE_28_FINAL_EXTRA=[],COURSE_29_FINAL_EXTRA=[],COURSE_30_FINAL_EXTRA=[];
var __courseFilesLoaded={},__courseFileCbs={},__courseFileLoading={};
var COURSE_COUNT=30; // number of courses (the registry below must have that many entries)
function __courseReg(n){var R=[[COURSE_1,COURSE_1_QUIZZES,COURSE_1_FINAL_EXTRA],[COURSE_2,COURSE_2_QUIZZES,COURSE_2_FINAL_EXTRA],[COURSE_3,COURSE_3_QUIZZES,COURSE_3_FINAL_EXTRA],[COURSE_4,COURSE_4_QUIZZES,COURSE_4_FINAL_EXTRA],[COURSE_5,COURSE_5_QUIZZES,COURSE_5_FINAL_EXTRA],[COURSE_6,COURSE_6_QUIZZES,COURSE_6_FINAL_EXTRA],[COURSE_7,COURSE_7_QUIZZES,COURSE_7_FINAL_EXTRA],[COURSE_8,COURSE_8_QUIZZES,COURSE_8_FINAL_EXTRA],[COURSE_9,COURSE_9_QUIZZES,COURSE_9_FINAL_EXTRA],[COURSE_10,COURSE_10_QUIZZES,COURSE_10_FINAL_EXTRA],[COURSE_11,COURSE_11_QUIZZES,COURSE_11_FINAL_EXTRA],[COURSE_12,COURSE_12_QUIZZES,COURSE_12_FINAL_EXTRA],[COURSE_13,COURSE_13_QUIZZES,COURSE_13_FINAL_EXTRA],[COURSE_14,COURSE_14_QUIZZES,COURSE_14_FINAL_EXTRA],[COURSE_15,COURSE_15_QUIZZES,COURSE_15_FINAL_EXTRA],[COURSE_16,COURSE_16_QUIZZES,COURSE_16_FINAL_EXTRA],[COURSE_17,COURSE_17_QUIZZES,COURSE_17_FINAL_EXTRA],[COURSE_18,COURSE_18_QUIZZES,COURSE_18_FINAL_EXTRA],[COURSE_19,COURSE_19_QUIZZES,COURSE_19_FINAL_EXTRA],[COURSE_20,COURSE_20_QUIZZES,COURSE_20_FINAL_EXTRA],[COURSE_21,COURSE_21_QUIZZES,COURSE_21_FINAL_EXTRA],[COURSE_22,COURSE_22_QUIZZES,COURSE_22_FINAL_EXTRA],[COURSE_23,COURSE_23_QUIZZES,COURSE_23_FINAL_EXTRA],[COURSE_24,COURSE_24_QUIZZES,COURSE_24_FINAL_EXTRA],[COURSE_25,COURSE_25_QUIZZES,COURSE_25_FINAL_EXTRA],[COURSE_26,COURSE_26_QUIZZES,COURSE_26_FINAL_EXTRA],[COURSE_27,COURSE_27_QUIZZES,COURSE_27_FINAL_EXTRA],[COURSE_28,COURSE_28_QUIZZES,COURSE_28_FINAL_EXTRA],[COURSE_29,COURSE_29_QUIZZES,COURSE_29_FINAL_EXTRA],[COURSE_30,COURSE_30_QUIZZES,COURSE_30_FINAL_EXTRA]];return R[n-1]||R[0];}
function __regCourse(n,def,quizzes,extra){
  var stub=__courseReg(n)[0];
  (def.lessons||[]).forEach(function(dl){
    var sl=(stub.lessons||[]).find(function(l){return l.id===dl.id;}); if(!sl)return;
    (dl.modules||[]).forEach(function(dm){
      var sm=(sl.modules||[]).find(function(m){return m.id===dm.id;}); if(!sm)return;
      for(var k in dm)sm[k]=dm[k];
    });
  });
  var qt=__courseReg(n)[1];
  for(var q in quizzes)qt[q]=quizzes[q];
  var fx=__courseReg(n)[2];
  if(fx.length===0)(extra||[]).forEach(function(q){fx.push(q);});
  __courseFilesLoaded[n]=true;
}
function __courseNumForId(id){var m=/^c(\d+)/.exec(String(id||''));var n=m?+m[1]:1;return (n>=1&&n<=COURSE_COUNT)?n:1;}
function __courseFileLoaded(n){return !!__courseFilesLoaded[n];}
function __loadCourseFile(n,cb){
  if(__courseFilesLoaded[n]){if(cb)cb();return;}
  (__courseFileCbs[n]=__courseFileCbs[n]||[]).push(cb||null);
  if(__courseFileLoading[n])return;
  __courseFileLoading[n]=true;
  var s=document.createElement('script');s.src='courses/course'+n+'.js';s.async=true;
  s.onload=function(){__courseFileLoading[n]=false;var q=__courseFileCbs[n]||[];__courseFileCbs[n]=[];q.forEach(function(f){if(f){try{f();}catch(e){}}});};
  s.onerror=function(){__courseFileLoading[n]=false;__courseFileCbs[n]=[];try{setStatus('Failed to load the course.',false);}catch(e){}};
  document.head.appendChild(s);
}
/* ===== /GENERATED CORE REGISTRY ===== */
/* --- multi-course awareness: which course the navigation is currently in --- */
let activeCourse=COURSE_1, activeQuizzes=COURSE_1_QUIZZES;
// study order of courses (not numeric): new courses just need to be added here, the rest is derived from the number
function allCourses(){return [COURSE_1, COURSE_2, COURSE_24, COURSE_16, COURSE_23, COURSE_3, COURSE_4, COURSE_5, COURSE_15, COURSE_6, COURSE_7, COURSE_8, COURSE_9, COURSE_10, COURSE_11, COURSE_12, COURSE_13, COURSE_14, COURSE_17, COURSE_18, COURSE_19, COURSE_20, COURSE_21, COURSE_22, COURSE_25, COURSE_26, COURSE_27, COURSE_28, COURSE_29, COURSE_30];}
function __courseNum(c){const m=c&&/^course(\d+)$/.exec(c.id||'');return m?+m[1]:1;}
function setActiveCourse(c){activeCourse=c;activeQuizzes=__courseReg(__courseNum(c))[1];}
function courseForId(id){var m=/^c(\d+)/.exec(String(id||""));return m?__courseReg(+m[1])[0]:COURSE_1;}
function buildFinalQuiz(qz,extra,title){
  const pool=[];for(const k in qz){(qz[k].qs||[]).forEach(q=>pool.push(q));}
  const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));const t=a[i];a[i]=a[j];a[j]=t;}return a;};
  const need=Math.max(0,10-extra.length);
  return {title,qs:shuffle(extra.concat(shuffle(pool).slice(0,need)))};
}
function quizForId(id){
  if(id==='q_final')return buildFinalQuiz(COURSE_1_QUIZZES,COURSE_1_FINAL_EXTRA,'Final quiz – '+COURSE_1.title);
  if(id==='c2q_final')return buildFinalQuiz(COURSE_2_QUIZZES,COURSE_2_FINAL_EXTRA,'Final quiz – '+COURSE_2.title);
  if(id==='c3q_final')return buildFinalQuiz(COURSE_3_QUIZZES,COURSE_3_FINAL_EXTRA,'Final quiz – '+COURSE_3.title);
  if(id==='c4q_final')return buildFinalQuiz(COURSE_4_QUIZZES,COURSE_4_FINAL_EXTRA,'Final quiz – '+COURSE_4.title);
  if(id==='c5q_final')return buildFinalQuiz(COURSE_5_QUIZZES,COURSE_5_FINAL_EXTRA,'Final quiz – '+COURSE_5.title);
  if(id==='c6q_final')return buildFinalQuiz(COURSE_6_QUIZZES,COURSE_6_FINAL_EXTRA,'Final quiz – '+COURSE_6.title);
  if(id==='c7q_final')return buildFinalQuiz(COURSE_7_QUIZZES,COURSE_7_FINAL_EXTRA,'Final quiz – '+COURSE_7.title);
  if(id==='c8q_final')return buildFinalQuiz(COURSE_8_QUIZZES,COURSE_8_FINAL_EXTRA,'Final quiz – '+COURSE_8.title);
  if(id==='c9q_final')return buildFinalQuiz(COURSE_9_QUIZZES,COURSE_9_FINAL_EXTRA,'Final quiz – '+COURSE_9.title);
  if(id==='c10q_final')return buildFinalQuiz(COURSE_10_QUIZZES,COURSE_10_FINAL_EXTRA,'Final quiz – '+COURSE_10.title);
  if(id==='c11q_final')return buildFinalQuiz(COURSE_11_QUIZZES,COURSE_11_FINAL_EXTRA,'Final quiz – '+COURSE_11.title);
  if(id==='c12q_final')return buildFinalQuiz(COURSE_12_QUIZZES,COURSE_12_FINAL_EXTRA,'Final quiz – '+COURSE_12.title);
  if(id==='c13q_final')return buildFinalQuiz(COURSE_13_QUIZZES,COURSE_13_FINAL_EXTRA,'Final quiz – '+COURSE_13.title);
  if(id==='c14q_final')return buildFinalQuiz(COURSE_14_QUIZZES,COURSE_14_FINAL_EXTRA,'Final quiz – '+COURSE_14.title);
  if(id==='c15q_final')return buildFinalQuiz(COURSE_15_QUIZZES,COURSE_15_FINAL_EXTRA,'Final quiz – '+COURSE_15.title);
  if(id==='c16q_final')return buildFinalQuiz(COURSE_16_QUIZZES,COURSE_16_FINAL_EXTRA,'Final quiz – '+COURSE_16.title);
  // final quizzes of new courses (17+) and the lesson-bank lookup – derived from the registry, not a hardcoded list
  {const fm=/^c(\d+)q_final$/.exec(String(id||''));
   if(fm){const n=+fm[1],r=__courseReg(n);if(r&&r[0])return buildFinalQuiz(r[1],r[2],'Final quiz – '+r[0].title);}}
  for(var n=1;n<=COURSE_COUNT;n++){var b=__courseReg(n)[1];if(b&&b[id])return b[id];}
  return null;
}
function isQuizId(id){if(id==='q_final')return true;if(/^c\d+q_final$/.test(String(id||'')))return true;for(var n=1;n<=COURSE_COUNT;n++){var b=__courseReg(n)[1];if(b&&b[id])return true;}return false;}
function courseFindModule(id){
  let mod=null, lesson=null, course=null;
  allCourses().forEach(c=>c.lessons.forEach(les=>les.modules.forEach(m=>{ if(m.id===id){mod=m;lesson=les;course=c;} })));
  if(course)setActiveCourse(course); // the module's own course drives order/breadcrumb/progress
  return {mod,lesson};
}
// linear walk order across the ACTIVE course: each lesson's modules, then its quiz
function courseOrder(){
  const order=[];
  activeCourse.lessons.forEach((les,li)=>{
    les.modules.forEach(m=>order.push({id:m.id,li,kind:'mod'}));
    if(les.quizId)order.push({id:les.quizId,li,kind:'quiz'});
  });
  return order;
}
// localize a quiz from data (either course)
function courseQuizFor(id){
  const q=quizForId(id); if(!q)return null;
  return {title:q.title, qs:q.qs.map(x=>({q:x.q,opts:x.opts,correct:x.correct,why:x.why}))};
}

/* ---------- central glossary (glossary of terms) — one searchable place for every term ---------- */
const COURSE_GLOSSARY_CATS=[
  {k:'basics',text:'Basics'},
  {k:'addr',text:'Addressing'},
  {k:'layers',text:'Layers & encapsulation'},
  {k:'conn',text:'Connectivity & media'},
  {k:'proto',text:'Protocols & services'},
  {k:'sec',text:'Security'},
  {k:'adv',text:'Switching & operations'},
  {k:'route',text:'Routing & OSPF'},
  {k:'ot',text:'Industrial networks (OT/ICS)'}
];
const COURSE_GLOSSARY=[
  // ---- Basics ----
  {cat:'basics',t:'network',text:'two or more devices that can exchange data.'},
  {cat:'basics',t:'packet',text:'a small chunk of data with an address; large data travels packet by packet.'},
  {cat:'basics',t:'host',text:'an end device on the network (PC, phone, server) – it sends or receives.'},
  {cat:'basics',t:'server',text:'a computer that provides a service (web, email, files) and answers requests.'},
  {cat:'basics',t:'client',text:'the device that asks for a service/data (e.g. a browser).'},
  {cat:'basics',t:'internet',text:'a network of networks – routers worldwide linked together; owned as a whole by no one.'},
  {cat:'basics',t:'LAN',text:'Local Area Network – a local network in one place (home, office).'},
  {cat:'basics',t:'WAN',text:'Wide Area Network – a wide-area network linking distant sites (typically via a provider). A router’s WAN port leads to the ISP; with several WAN ports you can have multiple ISPs (failover or load balancing).'},
  {cat:'basics',t:'PAN',text:'Personal Area Network – a network within one person’s reach (Bluetooth headphones, watch ↔ phone).'},
  {cat:'basics',t:'MAN',text:'Metropolitan Area Network – a city-scale network (between LAN and WAN); in practice you meet the term mostly in certifications.'},
  {cat:'basics',t:'broadcast',text:'a "to everyone" message on the given local network.'},
  {cat:'basics',t:'broadcast domain',text:'the set of devices a single broadcast reaches; a router/VLAN bounds it.'},
  {cat:'basics',t:'hub',text:'the "dumb" predecessor of the switch – sends a frame to all ports except the source, no MAC table.'},
  // ---- Addressing ----
  {cat:'addr',t:'MAC address',text:'the network card’s factory label; unique, valid on the local network.'},
  {cat:'addr',t:'IP address',text:'a device’s hierarchical address (network + host); works across the whole internet.'},
  {cat:'addr',t:'IPv4',text:'an IP address as 4 numbers 0–255 (32 bits), e.g. 192.168.1.10.'},
  {cat:'addr',t:'IPv6',text:'the newer IP address (128 bits) – a vast address space, written in hex (2001:db8::1).'},
  {cat:'addr',t:'private IP',text:'ranges for internal networks only (10.x, 172.16–31.x, 192.168.x); not routed on the internet.'},
  {cat:'addr',t:'public IP',text:'a globally unique address from your provider; the internet reaches you through it.'},
  {cat:'addr',t:'default gateway',text:'the router you send traffic to when it is headed outside your network.'},
  {cat:'addr',t:'ARP',text:'finds the MAC address for a given IP (a "who has this IP?" query on the local network).'},
  {cat:'addr',t:'ARP table',text:'stored IP → MAC pairs so a device need not keep asking.'},
  {cat:'addr',t:'prefix / mask',text:'says how many leading bits of an IP belong to the network (e.g. /24 = 255.255.255.0).'},
  {cat:'addr',t:'CIDR',text:'writing a network with a slash prefix (192.168.1.0/24) instead of fixed classes.'},
  {cat:'addr',t:'VLSM',text:'variable length subnet masking: each subnet gets its own prefix according to its size, not one shared by all.'},
  {cat:'addr',t:'network address',text:'a subnet’s first address – the name of the whole network; no device gets it.'},
  {cat:'addr',t:'subnet',text:'a smaller network carved out by moving the prefix (more network bits = more, smaller networks).'},
  {cat:'addr',t:'NAT',text:'the router rewrites a private IP to a public one so devices can reach the internet.'},
  {cat:'addr',t:'PAT',text:'port-based NAT – one public IP tells many devices’ connections apart by port number.'},
  {cat:'addr',t:'port forwarding (DNAT)',text:'the router sends an incoming connection on a given port to a specific internal device; technically DNAT (destination NAT).'},
  // ---- Layers and encapsulation ----
  {cat:'layers',t:'OSI',text:'a reference model from the international standards body ISO; splits network communication into 7 layers (a map for understanding, hence ISO/OSI).'},
  {cat:'layers',t:'TCP/IP',text:'the simplified 4-layer model the internet actually runs on.'},
  {cat:'layers',t:'layer',text:'one level of responsibility – does one job and talks to the neighboring layer.'},
  {cat:'layers',t:'protocol',text:'the agreed rules for how devices and layers talk to each other.'},
  {cat:'layers',t:'encapsulation',text:'wrapping – each layer adds its header around the data (an envelope in an envelope).'},
  {cat:'layers',t:'header',text:'the label a layer adds; the counterpart on the other side reads and peels it off.'},
  {cat:'layers',t:'PDU',text:'the name of the "bundle" at each layer: data → segment → packet → frame → bits.'},
  {cat:'layers',t:'frame',text:'the Layer-2 unit – data + MAC addresses + a checksum.'},
  {cat:'layers',t:'segment',text:'the Layer-4 (TCP) unit – a piece of data with ports and a sequence number.'},
  {cat:'layers',t:'FCS',text:'the checksum in a frame – detects that data got corrupted in transit.'},
  {cat:'layers',t:'TTL',text:'a hop counter in a packet; each router lowers it, at zero the packet is dropped (stops loops). In DNS, TTL means something else: how long (in seconds) a client or resolver may keep an answer in its cache.'},
  {cat:'layers',t:'bit',text:'the smallest piece of data – a 1 or a 0.'},
  {cat:'layers',t:'byte',text:'8 bits together – the basic unit data is counted in; one character is often one byte.'},
  // ---- Connectivity and media ----
  {cat:'conn',t:'medium',text:'what a bit physically travels on – copper (voltage), fiber (light), Wi-Fi (radio).'},
  {cat:'conn',t:'bandwidth',text:'how many bits a medium carries per second (Mbps/Gbps).'},
  {cat:'conn',t:'throughput',text:'how much data actually flows per second (often less than the bandwidth).'},
  {cat:'conn',t:'latency',text:'the delay – how long data takes to get from one end to the other (often measured round-trip, RTT – there and back).'},
  {cat:'conn',t:'twisted pair (UTP)',text:'the common copper LAN cable with an RJ-45 plug (Cat5e/Cat6), ~100 m reach.'},
  {cat:'conn',t:'shielded twisted pair (STP/FTP)',text:'twisted pair with metal shielding against interference; for places with motors, fluorescent lights, etc. (Note: in later courses the abbreviation STP also means Spanning Tree Protocol – a completely different term.)'},
  {cat:'conn',t:'crosstalk',text:'interference that "leaks" from one wire onto a neighboring one; shielding and twisting the pairs suppress it.'},
  {cat:'conn',t:'optical fiber',text:'transmission by light in glass – very fast, long distances, no interference.'},
  {cat:'conn',t:'FTTH',text:'fiber brought all the way into the apartment/house.'},
  {cat:'conn',t:'coax',text:'an older cable type; today it mostly carries cable TV and cable-company internet.'},
  {cat:'conn',t:'Wi-Fi',text:'a wireless radio link to an access point (the 802.11 standard).'},
  {cat:'conn',t:'AP / WAP',text:'the device (or a router’s function) that broadcasts Wi-Fi; also called a WAP (wireless access point).'},
  {cat:'conn',t:'SSID',text:'the Wi-Fi network name you see when connecting.'},
  {cat:'conn',t:'WPA2 / WPA3',text:'Wi-Fi security – encrypts the wireless traffic; the key comes from a shared password (PSK) or from corporate 802.1X authentication (WPA3 is newer).'},
  {cat:'conn',t:'mobile network (4G/5G)',text:'connection via the carrier’s cell towers; 5G is faster with lower latency.'},
  {cat:'conn',t:'ISP',text:'your internet service provider (operator) that gives you a public IP and internet access.'},
  {cat:'conn',t:'SFP / SFP+',text:'a swappable module (optical or copper) for a switch’s uplink slot; SFP+ handles 10 Gb/s.'},
  {cat:'conn',t:'mesh (Wi-Fi)',text:'hanging an AP wirelessly off another AP with the same SSID instead of a cable – coverage without pulling cabling.'},
  {cat:'conn',t:'repeater',text:'a "dumb" re-broadcast of the Wi-Fi signal further out; it halves the throughput.'},
  {cat:'conn',t:'duplex',text:'half/full – whether you can send and receive at the same time (full) or only take turns (half).'},
  {cat:'conn',t:'multi-gig (2.5G/5G)',text:'2.5/5 Gb/s speeds over ordinary twisted pair – a middle step between 1G and 10G.'},
  {cat:'conn',t:'link-local address',text:'a fallback 169.254.x.x address a device gives itself when DHCP fails; it cannot reach out.'},
  // ---- Protocols and services ----
  {cat:'proto',t:'DHCP',text:'the service that lends clients an address and the rest of the settings (mask, gateway, DNS) by itself – not a kind of device but a role you switch on for a router, firewall, L3 switch or server.'},
  {cat:'proto',t:'DORA',text:'the four messages by which a client obtains an address: Discover (who is here?), Offer, Request (I take it) and Acknowledge.'},
  {cat:'proto',t:'lease',text:'the time an address is lent for; whatever is not renewed falls back into the range.'},
  {cat:'proto',t:'range (pool, scope)',text:'from which address to which DHCP may lend in a given network; addresses with fixed settings do not belong in it.'},
  {cat:'proto',t:'DHCP relay',text:'a router function: it repackages a DHCP broadcast into an addressed packet for a server in another network and adds which network the client came from.'},
  {cat:'proto',t:'TCP',text:'the reliable protocol: opens a connection and resends lost pieces.'},
  {cat:'proto',t:'UDP',text:'the fast protocol with no guarantee: send and do not wait for confirmation.'},
  {cat:'proto',t:'port',text:'a number (0–65535) telling apps apart on one device – like an apartment number.'},
  {cat:'proto',t:'well-known port',text:'a fixed service number (HTTPS 443, HTTP 80, DNS 53, SSH 22).'},
  {cat:'proto',t:'three-way handshake',text:'TCP’s opening agreement before transfer: SYN → SYN-ACK → ACK.'},
  {cat:'proto',t:'ICMP',text:'a service protocol for reports and diagnostics (used by ping and traceroute).'},
  {cat:'proto',t:'ping',text:'sends a small packet and measures whether (and how fast) the target replies.'},
  {cat:'proto',t:'traceroute',text:'lists the routers (hops) on the way to a target using a rising TTL.'},
  {cat:'proto',t:'sniffing',text:'reading traffic as it passes over the wire or the air; unencrypted protocols (HTTP, Telnet, FTP) give away even passwords, encrypted ones hide the content but not the metadata.'},
  {cat:'sec',t:'symmetric cipher',text:'one key both encrypts and decrypts – fast, but the key has to reach the other side safely.'},
  {cat:'sec',t:'asymmetric cipher',text:'a key pair: the public one you hand out, the private one you keep. What one encrypts only the other opens – it solves key exchange and signing.'},
  {cat:'sec',t:'public and private key',text:'anyone may know the public key (it encrypts for you and verifies your signature); the private one must never leave its owner – leaking it ends the trust.'},
  {cat:'sec',t:'certificate',text:'a file binding a name (domain) to a public key, signed by an authority; valid means the name matches, the validity period runs, and the signature leads to a trusted authority.'},
  {cat:'sec',t:'certificate authority (CA)',text:'the issuer of certificates that devices trust; a root authority signs intermediates and those sign servers – that chain is called the chain of trust.'},
  {cat:'sec',t:'pepper',text:'a secret ingredient added when hashing passwords, stored outside the database (in the app config) – unlike salt, stealing the database does not reveal it.'},
  {cat:'sec',t:'data exfiltration',text:'quietly moving data out of the network; in traffic it shows up as a new who-talks-to-whom pair that was not there before.'},
  {cat:'sec',t:'quarantine (isolation)',text:'cutting a device off the network without powering it down – it stops the spread but fixes neither the cause nor the attacker\'s persistent access.'},
  {cat:'sec',t:'ARP spoofing',text:'the attacker poses as the gateway with forged ARP replies so neighbors\' traffic flows through them; Dynamic ARP Inspection defends against it.'},
  {cat:'sec',t:'rogue DHCP',text:'a foreign DHCP server handing clients the attacker\'s gateway; DHCP snooping with a trusted port defends against it.'},
  {cat:'proto',t:'NTP',text:'a protocol that synchronizes device clocks to a common time source (port 123); without it log timestamps drift apart and cannot be correlated.'},
  {cat:'proto',t:'DNS',text:'the internet’s phone book – translates names (example.com) into IP addresses.'},
  {cat:'proto',t:'resolver',text:'the DNS server clients ask to resolve names; it either knows the answer or finds it out (and caches it).'},
  {cat:'proto',t:'FQDN',text:'a device’s fully qualified domain name including the domain, e.g. web.acme.local.'},
  {cat:'proto',t:'CNAME',text:'an alias DNS record: the name points not at an address but at another name (which then leads to the address).'},
  {cat:'proto',t:'NXDOMAIN',text:'the DNS answer “no such name exists”. A client remembers it for a while (negative caching).'},
  {cat:'proto',t:'DNS forwarding',text:'a resolver passes a name it does not know further on (typically out to the internet) instead of answering “no such name”.'},
  {cat:'proto',t:'DHCP',text:'automatically gives a device an IP address (plus gateway and DNS) when it joins.'},
  {cat:'proto',t:'HTTP',text:'the language of the web (request → response); sends plain text.'},
  {cat:'proto',t:'HTTPS',text:'HTTP + TLS encryption; only the two ends can read the content (the browser padlock).'},
  {cat:'proto',t:'TLS',text:'encrypts the connection between you and the server – unreadable along the way.'},
  {cat:'proto',t:'GET / POST',text:'HTTP request methods: GET = fetch content, POST = send data to the server.'},
  {cat:'proto',t:'status code',text:'the HTTP response result: 200 OK, 404 not found, 500 server error.'},
  {cat:'proto',t:'SNI',text:'the destination server name, visible even with HTTPS – so the domain shows, not the content.'},
  {cat:'proto',t:'SFTP',text:'file transfer inside an SSH connection (port 22) – the secure replacement for FTP, where name, password and file content are otherwise visible.'},
  {cat:'proto',t:'LDAPS',text:'company-directory queries wrapped in TLS (port 636) instead of plain LDAP on 389, where the account password and the answers about users are visible.'},
  {cat:'proto',t:'STARTTLS',text:'a connection starts unencrypted on the ordinary port (typically SMTP on 25) and only then switches to TLS; if the switch does not happen, traffic goes on in the clear.'},
  {cat:'proto',t:'SNMPv3',text:'the SNMP version with real authentication and encryption; older v1 and v2c send only a legible community string instead of a password.'},
  {cat:'proto',t:'DoH',text:'DNS over HTTPS – encrypted name resolution so even the DNS query is hidden.'},
  // ---- Security ----
  {cat:'sec',t:'firewall',text:'guards traffic between networks/zones and permits or blocks it by rules.'},
  {cat:'sec',t:'zone',text:'a group of interfaces with the same trust level (inside, DMZ, outside, VPN).'},
  {cat:'sec',t:'DMZ',text:'a separate zone for public servers – reachable from the internet but not into the internal network.'},
  {cat:'sec',t:'ACL',text:'a list of permit/deny rules by source, destination, protocol and port.'},
  {cat:'sec',t:'stateful firewall',text:'remembers established connections and lets the replies back automatically.'},
  {cat:'sec',t:'default deny',text:'whatever is not explicitly permitted is blocked (the safe firewall default).'},
  {cat:'sec',t:'IDS',text:'intrusion detection – only flags suspicious traffic (alerts), does not stop it.'},
  {cat:'sec',t:'IPS',text:'intrusion prevention – blocks suspicious traffic outright.'},
  {cat:'sec',t:'signature',text:'a pattern of a known attack that an IDS/IPS uses to spot a threat in the content.'},
  {cat:'sec',t:'VPN',text:'an encrypted tunnel over the internet – a remote device acts as if it were on the internal network.'},
  {cat:'sec',t:'Caesar cipher',text:'the oldest textbook example of a cipher: every letter moves a few places in the alphabet and the key is by how much. There are only twenty-five keys, so all can be tried – but it shows nicely that the procedure and the key are two different things.'},
  {cat:'sec',t:'steganography',text:'hiding a message so nobody spots that one exists at all (typically in a picture). Encryption hides the content, steganography the fact you communicate; attackers use it to send data out of a company.'},
  {cat:'sec',t:'hash (fingerprint)',text:'a short fixed-length result computed from data. The road runs one way only: the original data cannot be recovered from it. Used for storing passwords and for checking a file did not change on the way (today SHA-256, and bcrypt or argon2 for passwords).'},
  {cat:'sec',t:'salt',text:'a random value mixed into each password separately before the fingerprint is computed; stored with the record and need not be secret. It ensures two identical passwords do not give the same fingerprint. A pepper is the same but secret and kept outside the database.'},
  {cat:'sec',t:'rainbow table',text:'a precomputed list of "fingerprint → password"; with it, cracking a password turns from computing into a lookup. The defense is a salt, because the table would have to be built separately for every salt.'},
  {cat:'sec',t:'end-to-end encryption',text:'only the sender and receiver can decrypt the data; nobody on the path can read it.'},
  // ---- Switching, routing and traffic ----
  {cat:'adv',t:'L2 switch',text:'switches frames within one local network by MAC address.'},
  {cat:'adv',t:'L3 switch',text:'a switch that can also route between networks (VLANs).'},
  {cat:'adv',t:'router',text:'links networks and decides which way a packet goes next (by destination IP).'},
  {cat:'adv',t:'VLAN',text:'a logical network separated on a switch – like several networks in one cable.'},
  {cat:'adv',t:'trunk',text:'a link between devices that carries several VLANs at once (tags frames with 802.1Q).'},
  {cat:'adv',t:'Spanning Tree (STP)',text:'a protocol that logically blocks redundant ports so no loop (broadcast storm) forms; elects a root bridge. Note: the abbreviation STP also means shielded twisted pair – a different term from the media course.'},
  {cat:'adv',t:'RSTP',text:'Rapid STP (802.1w) – the fast version of STP; converges in ~1 s instead of tens of seconds. Today’s default.'},
  {cat:'adv',t:'MSTP',text:'Multiple STP (802.1s) – maps many VLANs onto a few tree instances (scales large networks).'},
  {cat:'adv',t:'PVST+',text:'a Cisco STP variant – computes the tree separately per VLAN (this simulator does the same).'},
  {cat:'adv',t:'access port',text:'a switch port assigned to one VLAN (you plug an end device here).'},
  {cat:'adv',t:'inter-VLAN routing',text:'moving between two VLANs needs an L3 device (router/L3 switch).'},
  {cat:'adv',t:'routing table',text:'a list of which way (interface) to send a packet for a given destination network.'},
  {cat:'adv',t:'MAC table (CAM)',text:'a switch remembers which MAC address is behind which port; sometimes called the CAM table (Content-Addressable Memory).'},
  {cat:'adv',t:'EtherChannel / LAG',text:'bundling several parallel links into one logical link – more capacity and redundancy (and STP does not see them as a loop).'},
  {cat:'adv',t:'load balancer',text:'spreads incoming traffic across several servers (by an algorithm).'},
  {cat:'adv',t:'VIP',text:'the virtual IP/port the load balancer listens on instead of individual servers.'},
  {cat:'adv',t:'HA',text:'high availability – a pair of devices where one takes over if the other fails.'},
  {cat:'adv',t:'blast radius',text:'how far an attacker can reach from a given spot – the reach of a compromise.'},
  {cat:'adv',t:'N-1',text:'a resilience test: take out one device and check the network still works.'},
  {cat:'adv',t:'root bridge',text:'the elected "center" of Spanning Tree – the tree is computed from it (lowest priority/ID wins); Root Guard blocks a hostile takeover.'},
  {cat:'adv',t:'broadcast storm',text:'a broadcast looping in a topology without STP – frames circle and multiply until the network drowns.'},
  {cat:'adv',t:'BPDU',text:'the Spanning Tree message – switches use it to elect the root bridge and pick the blocked port; BPDU Guard watches for it on edge ports.'},
  {cat:'adv',t:'PortFast',text:'a port for end devices – it skips the STP wait and forwards immediately; never on a switch-to-switch link.'},
  {cat:'adv',t:'LACP',text:'the standard protocol (today 802.1AX, originally 802.3ad) by which both ends negotiate an EtherChannel automatically.'},
  {cat:'adv',t:'port security',text:'a limit on which MAC addresses (and how many) may appear on a switch port; on violation the port reacts (e.g. shuts down).'},
  {cat:'adv',t:'native VLAN',text:'the VLAN whose frames cross a trunk untagged (no 802.1Q); left as VLAN 1 it is a security hole (VLAN hopping).'},
  {cat:'adv',t:'VLAN hopping',text:'an attack that gets a frame into someone else’s VLAN (double tagging, or switch spoofing via DTP).'},
  {cat:'adv',t:'DTP',text:'the Cisco protocol ports use to auto-negotiate a trunk; an attacker uses it to pose as a switch and force a trunk (seeing every VLAN), so it is disabled on access ports.'},
  {cat:'adv',t:'rogue DHCP',text:'an unapproved DHCP server in the network; the client takes the first offer, so it takes its gateway and DNS too.'},
  {cat:'adv',t:'DHCP starvation',text:'an attacker drains the range with requests for made-up MAC addresses; new devices then get no address.'},
  {cat:'adv',t:'DHCP snooping',text:'the switch trusts DHCP replies only from a marked (trusted) port; a rogue DHCP server on any other port is dropped.'},
  {cat:'adv',t:'DAI',text:'Dynamic ARP Inspection – the switch checks ARP replies against the DHCP-snooping table and drops forged ones.'},
  {cat:'adv',t:'MAC flapping',text:'the same MAC "jumps" between ports in the MAC table – the classic sign of a loop or an attack.'},
  {cat:'adv',t:'SPAN',text:'port mirroring – a copy of a port’s/VLAN’s traffic goes to the port with a monitoring device (IDS, analyzer).'},
  {cat:'adv',t:'PoE',text:'power over the Ethernet cable – an AP, camera or IP phone needs no power outlet of its own.'},
  {cat:'adv',t:'SVI',text:'a VLAN’s virtual L3 interface on an (L3) switch – the VLAN’s gateway without a physical port.'},
  {cat:'adv',t:'subinterface',text:'a logical sub-interface of one physical port – e.g. router-on-a-stick has one port and a subinterface per VLAN.'},
  {cat:'route',t:'OSPF',text:'a dynamic (link-state) routing protocol – routers exchange a map of the network and each computes the shortest paths itself. Administrative distance (trust) 110.'},
  {cat:'route',t:'link-state',text:'the protocol family (OSPF, IS-IS): every router holds the whole map and computes paths itself.'},
  {cat:'route',t:'distance-vector',text:'the older protocol family (RIP): a router trusts neighbors saying "it is X hops that way" and never sees the whole map.'},
  {cat:'route',t:'LSA',text:'a piece of the OSPF map – a message about a router or link that a router floods to the others.'},
  {cat:'route',t:'LSDB',text:'the shared OSPF map – the database of all LSAs; every router in an area holds an identical copy.'},
  {cat:'route',t:'Dijkstra (SPF)',text:'the algorithm OSPF runs on the map (LSDB) to compute the shortest-path tree; it feeds the routing table.'},
  {cat:'route',t:'area',text:'a part of an OSPF network; networks split into areas around the backbone area 0 so recomputation and the LSDB scale.'},
  {cat:'route',t:'ABR',text:'Area Border Router – a router on the boundary of OSPF areas; it passes summaries between them instead of details.'},
  {cat:'route',t:'DR / BDR',text:'on a shared network OSPF elects a "spokesman" (DR) and its backup (BDR) so not everyone exchanges the map with everyone.'},
  {cat:'route',t:'convergence',text:'the state where, after a change (failure), all devices agree on the paths again; the time to agree = convergence time.'},
  {cat:'route',t:'BFD',text:'a link-failure detector in milliseconds – it tells the routing protocol "the neighbor died" before the Dead timer expires.'},
  {cat:'route',t:'metric (cost)',text:'the number a protocol compares paths by (OSPF: cost from link speed); lower = better.'},
  {cat:'route',t:'administrative distance (AD)',text:'how trusted a route’s source is – for the same destination the lower number wins (connected 0, static 1, OSPF 110, RIP 120).'},
  {cat:'route',t:'longest prefix match',text:'the router picks the most specific (longest) matching prefix; it takes precedence over AD; the 0.0.0.0/0 default is the last resort.'},
  {cat:'route',t:'floating static',text:'a static route with a worse AD – it "sleeps" and steps in only when the primary route disappears (a backup).'},
  {cat:'route',t:'BGP',text:'the protocol providers route between each other with – it glues the internet together from autonomous systems; decides by policy (business relationships), not speed. Administrative distance 20 (eBGP = BGP between carriers).'},
  {cat:'route',t:'AS',text:'an autonomous system – one network under one administration (an ISP, a large company) with its own number; BGP routes between ASes.'},
  {cat:'route',t:'redistribution',text:'pouring routes from one source into another (e.g. a static default into OSPF); misconfigured it can create loops.'},
  {cat:'addr',t:'hairpin NAT',text:'reaching your own public IP from inside the network – the router must "hairpin" the connection back inward.'},
  {cat:'route',t:'HSRP / VRRP',text:'two routers share a virtual gateway IP; if the active one fails the other takes over (hosts notice nothing). Cisco GLBP also spreads the load.'},
  {cat:'route',t:'control plane / data plane',text:'the device’s brain (protocols, management) vs. its muscles (the actual packet forwarding); each is protected separately.'},
  {cat:'route',t:'VRF',text:'several separate routing tables on one router – like VLANs, but for L3.'},
  {cat:'route',t:'uRPF',text:'a defense against a forged source IP (spoofing): the router verifies the packet’s source IP makes sense on the interface it arrived on – otherwise it drops the packet.'},
  {cat:'sec',t:'DPI',text:'deep packet inspection – the device looks into the content, not just addresses and ports.'},
  {cat:'sec',t:'MITM',text:'an attacker "in the middle" – traffic flows through them, so they can eavesdrop or alter data.'},
  {cat:'sec',t:'TLS inspection',text:'the firewall unwraps encrypted traffic (a controlled MITM with its own certificate), inspects it and re-encrypts.'},
  {cat:'sec',t:'SYN flood',text:'a DoS attack flooding SYN packets – the server piles up half-open connections until it runs out of resources.'},
  {cat:'sec',t:'DoS',text:'a flooding attack – the target gets so much traffic/requests it stops serving real users.'},
  {cat:'sec',t:'C2',text:'command & control – the channel malware uses to "phone home" for orders (it likes hiding in DNS, for example).'},
  {cat:'sec',t:'lateral movement',text:'the attacker moving "sideways" – from the first compromised machine onward through the internal network; segmentation slows it.'},
  {cat:'sec',t:'defense in depth',text:'layered defense – several independent protections in a row; when one fails, the next one catches it.'},
  {cat:'sec',t:'SIEM',text:'the central log collector – collects events from all devices and hunts for correlations and attacks.'},
  // ---- Wireless in practice (Course 11) ----
  {cat:'conn',t:'CSMA/CA',text:'the rule for shared air: listen, and if it is free, transmit after a random moment. Collisions are avoided in advance, because Wi-Fi – unlike a cable – cannot detect them.'},
  {cat:'conn',t:'beacon',text:'the access point’s regular “here I am”; the list of networks you see when connecting is built from captured beacons.'},
  {cat:'conn',t:'2.4 / 5 GHz band',text:'the lower frequency reaches further and better through walls, the higher one is faster and cleaner but shorter; 6 GHz (Wi-Fi 6E/7) is the cleanest with the shortest reach.'},
  {cat:'conn',t:'channel (Wi-Fi)',text:'a slice of the band, something like a traffic lane. In 2.4 GHz only channels 1, 6 and 11 do not overlap – networks on the same channel at least hear each other and take turns, overlapping ones interfere and cannot take turns.'},
  {cat:'conn',t:'attenuation',text:'the signal weakening with distance and obstacles; reinforced concrete and water (people in the room included) are the worst for it.'},
  {cat:'conn',t:'site survey',text:'measuring signal strength room by room – the basis for where to put access points and which channels to set on them.'},
  {cat:'conn',t:'roaming',text:'a client switches itself to a stronger access point with the same SSID; it keeps its IP, so existing connections keep running. The client decides, not the network.'},
  {cat:'conn',t:'MIMO',text:'several antennas carry several data streams at once (2×2, 4×4 = transmit×receive chains). The weaker end sets the speed – a phone often has only one or two antennas.'},
  {cat:'conn',t:'AP uplink',text:'how an access point attaches to the rest of the network: a cable is always best (full speed), then a mesh backhaul, and worst a repeater.'},
  // ---- Wi-Fi security in depth (Course 12) ----
  {cat:'sec',t:'4-way handshake',text:'the four messages a client and an AP use in WPA2 to derive the key for one specific connection. The password never flies through the air – the handshake does, so it can be captured and passwords tried offline.'},
  {cat:'sec',t:'SAE (WPA3)',text:'the WPA3 key exchange (nicknamed Dragonfly): every password guess needs live interaction with the AP, so offline cracking falls away. It also gives forward secrecy.'},
  {cat:'sec',t:'PMKID',text:'password-cracking material an attacker gets without waiting for a client – it starts connecting itself and receives it straight from the AP. The defense is the same as for the handshake: a long random password.'},
  {cat:'sec',t:'PMF (802.11w)',text:'signing of Wi-Fi management frames, so a forged disconnect (deauth) frame is dropped. WPA3 requires it, on WPA2 you switch it on yourself.'},
  {cat:'sec',t:'802.1X',text:'port-based authentication (on cable and on Wi-Fi): the port stays shut until a RADIUS server says “let them in”. Everyone has their own identity instead of one shared password.'},
  {cat:'sec',t:'EAP',text:'the envelope 802.1X carries authentication in. EAP-TLS uses a certificate on both ends, PEAP/EAP-TTLS a name and password in a TLS tunnel – there you must verify the server’s certificate.'},
  {cat:'sec',t:'RADIUS',text:'the server that decides who may join the network with 802.1X. By identity it can also return a VLAN and log who was connected, when and for how long.'},
  {cat:'sec',t:'captive portal',text:'a guest network’s login page: it controls access but does not encrypt content. On a foreign network never type a real account password or card number into it.'},
  {cat:'sec',t:'evil twin',text:'a fake AP with the same SSID and a stronger signal; the client joins the attacker, who then sits in the middle of the connection. A flood of disconnect frames often comes first.'},
  {cat:'sec',t:'rogue AP',text:'an access point that has no business being in the network. Most often your own employee plugs it in out of convenience, not an attacker – and it bypasses the network’s whole security.'},
  {cat:'sec',t:'KRACK',text:'a 2017 attack on the 4-way handshake itself: a replayed message makes the client reuse an already used key. It does not depend on password strength; vendors have patched it.'},
  {cat:'sec',t:'WPS',text:'joining Wi-Fi with an eight-digit PIN. A design flaw (it is verified in halves) cuts it to thousands of tries, so it is guessable in hours regardless of password strength – turn it off.'},
  {cat:'sec',t:'WIPS',text:'sensors that scan the airwaves and report fake APs, an evil twin or a flood of disconnect frames. WIDS only reports, WIPS also acts – the same pair as IDS/IPS.'},
  // ---- OT/ICS (Course 13) ----
  {cat:'ot',t:'OT (operational technology)',text:'the networks and systems that run physical production. Its priorities are the reverse of IT: availability before integrity and only then confidentiality – so in OT you never reboot “just in case”.'},
  {cat:'ot',t:'SCADA',text:'the supervisory control and data acquisition system over the whole production – it collects process data and sends commands.'},
  {cat:'ot',t:'PLC',text:'a programmable controller at the machine – it reads sensors and switches motors and valves. It serves 20–30 years, often without patches, and its network stack is fragile.'},
  {cat:'ot',t:'HMI',text:'the operator’s panel or control room – it shows the process state and sends commands to PLCs. Under attack it can lie to you, so you need independent monitoring of the process.'},
  {cat:'ot',t:'historian',text:'a database of process values (temperatures, pressures). It sits in the industrial DMZ as a middleman: it collects from the OT side, the office queries it from the IT side.'},
  {cat:'ot',t:'Purdue model',text:'a map of an industrial network in levels 0–4 by closeness to the physical process (0 sensors, 1 PLCs, 2 control room, 3 production management, 4 corporate IT). Its main point: it defines the boundaries where firewalls stand.'},
  {cat:'ot',t:'industrial DMZ',text:'the in-between floor (level 3.5) between IT and production, home to a middleman such as the historian. Thanks to it no rule leads directly from IT into OT.'},
  {cat:'ot',t:'Modbus',text:'an industrial protocol from 1979 (Modbus/TCP on port 502 over a network) with no authentication at all – a PLC obeys anyone who connects. It is not a bug to patch, it is the design; so the network has to say no.'},
  {cat:'ot',t:'data diode',text:'a physically one-way link – a transmitter only on one side, a receiver only on the other. Unlike a firewall it decides nothing by rules, the other direction simply does not exist. The price: nothing at all gets back.'},
  {cat:'ot',t:'air gap',text:'a complete physical disconnection of a network from the internet. It is not absolute – a USB stick, a service laptop or a supplier gets across it.'},
  {cat:'ot',t:'Stuxnet',text:'malware uncovered in 2010 that reached an enrichment plant on a USB stick and wrecked centrifuges by changing their speed, while replaying recorded normal values to the operators. Software broke hardware.'},
  // ---- IPv6 (Course 25) ----
  {cat:'addr',t:'IPv6',text:'the 128-bit successor to IPv4. Enough addresses for every interface on earth, and the redesign took NAT away, brought autoconfiguration and a fixed header along with it.'},
  {cat:'addr',t:'128-bit address',text:'eight groups of four hex digits (32 bits each). Leading zeros inside a group may be dropped, and one run of zero groups may be written as :: – but :: may appear only once per address.'},
  {cat:'addr',t:'dual-stack',text:'running IPv4 and IPv6 at the same time so old and new work in parallel during the transition. The host ends up with an address in both families.'},
  {cat:'addr',t:'link-local address (IPv6)',text:'fe80::/10 – exists on every interface, valid only on that link and never routed. The same address exists on every interface, so a zone (%eth0) is added to say which one is meant.'},
  {cat:'addr',t:'zone / scope id',text:'the %eth0 or %2 after a link-local IPv6 address, naming which interface it applies to. Without it the address is ambiguous.'},
  {cat:'addr',t:'SLAAC',text:'stateless address autoconfiguration: the router advertises a /64 prefix and each device forms the rest of its own address, often from its MAC address. Nothing has to be maintained centrally.'},
  {cat:'addr',t:'DHCPv6',text:'the IPv6 counterpart of DHCP, handing out addresses centrally with state – used where you need to know exactly which host has which address.'},
  {cat:'addr',t:'AAAA',text:'the DNS record type mapping a name to an IPv6 address (four A’s because it returns 128 bits, against 32 for A). A host with both families simply has both records.'},
  {cat:'proto',t:'ISATAP',text:'carries IPv6 traffic inside IPv4 within one organisation, so IPv6 can be introduced host by host without touching the infrastructure.'},
  {cat:'proto',t:'6to4 / Teredo',text:'transitional mechanisms giving an IPv6 host connectivity across IPv4-only networks – the former using a public relay with a special prefix, the latter tunnelling through a server.'},
  {cat:'route',t:'NAT64',text:'translation for the other direction: lets an IPv6-only client reach an IPv4-only server. Like tunnelling, it is transitional rather than an end state.'},
  // ---- The physical layer (Course 26) ----
  {cat:'conn',t:'crosstalk',text:'interference between neighbouring wire pairs inside one cable, which shows up as receive errors. Tightly twisted, well-shielded pairs reduce it.'},
  {cat:'conn',t:'twisted pair',text:'two copper conductors twisted together. The receiver reads the voltage difference between them, so interference hitting both wires cancels out – which is why the twist is there at all.'},
  {cat:'conn',t:'crossover cable',text:'a cable with transmit and receive pairs crossed. Needed once between like devices (switch–switch); Auto-MDI/Auto-MDI-X makes it irrelevant on modern ports.'},
  {cat:'conn',t:'PoE',text:'power over Ethernet: DC power delivered to a device in the same cable as the data. PoE is about 15.4 W per port, PoE+ up to about 30 W – but the real limit is the switch’s total budget.'},
  {cat:'adv',t:'duplex',text:'whether both ends of a link can transmit at once (full) or take turns (half). A full/half mismatch causes collisions and retries: the link looks up and yet crawls.'},
  {cat:'adv',t:'flapping',text:'a link going up and down repeatedly. Almost always physical or a power problem: a loose connector, a damaged cable, or a device failing to power on properly.'},
  {cat:'adv',t:'link aggregation',text:'several physical links carried as one logical link (EtherChannel/LAG), giving both more capacity and a backup path.'},
  // ---- Multicast (Course 27) ----
  {cat:'proto',t:'multicast',text:'one sender to many receivers at once, with the network delivering a single copy to everyone who joined. It replaces N unicast copies with one – and gives up replies and per-receiver acknowledgement in exchange.'},
  {cat:'proto',t:'multicast group',text:'a set of receivers identified by one address. The destination names the group rather than a host; in IPv4 a multicast address is never a source address.'},
  {cat:'proto',t:'IGMP',text:'the protocol a host uses to join and leave multicast groups on its local router, so the router knows which ports lead to members.'},
  {cat:'adv',t:'last-member problem',text:'a viewer that simply stops listening is indistinguishable from one whose network is broken, so the router queries the group instead of trusting silence.'},
  {cat:'adv',t:'IGMP snooping',text:'the switch reading IGMP reports itself, so it forwards multicast only to ports that have members instead of flooding it like a broadcast.'},
  {cat:'route',t:'RP (rendezvous point)',text:'the router where senders and receivers meet on a shared multicast tree. Simple and bandwidth-saving, but every stream passes through one machine and every router must be able to find it.'},
  {cat:'route',t:'PIM',text:'the multicast routing protocol that supplies the knowledge a router needs to forward a group. Without it, routers deliberately stop multicast at their boundary.'},
  {cat:'route',t:'SSM',text:'source-specific multicast: receivers join a (source, group) pair, so no RP is needed. The usual choice for one-to-many content.'},
  {cat:'route',t:'shared tree / source tree',text:'the two classic multicast shapes: everything meets at an RP, or a tree is rooted at the sender for the shortest path. The first saves complexity, the second saves traffic.'},
  // ---- First-hop redundancy (Course 28) ----
  {cat:'adv',t:'virtual IP (VIP)',text:'an address belonging to a pair of routers rather than to one device. Hosts use it as their gateway; one router is active and answers for it, the other stands by to take over.'},
  {cat:'adv',t:'virtual MAC',text:'the MAC address the active router also answers to, so frames for the VIP reach the right hardware. Without it failover would not be transparent.'},
  {cat:'adv',t:'gratuitous ARP',text:'an unasked broadcast a device sends to refresh neighbours’ ARP caches after a change – how a failover becomes invisible to hosts.'},
  {cat:'adv',t:'preemption',text:'whether the higher-priority router may reclaim the active role when it returns. Without it, the current active keeps the role and the network does not change hands twice.'},
  {cat:'adv',t:'tracking',text:'watching an upstream interface or route so a router that has lost its way out steps down as active – otherwise it keeps a role it cannot usefully perform.'},
  {cat:'adv',t:'HSRP / VRRP / GLBP',text:'the first-hop redundancy protocols: HSRP and VRRP keep one router active and the other idle, while GLBP load-balances across both while still presenting one virtual gateway.'},
  // ---- QoS (Course 29) ----
  {cat:'adv',t:'QoS',text:'the arrangement that decides who waits on a link that is already full. It reorders the suffering between traffic classes – it adds no capacity, and bandwidth fixes are still the better answer where they are possible.'},
  {cat:'adv',t:'DSCP / 802.1p',text:'the 6-bit IP field and the older Ethernet CoS byte, used to mark a packet’s priority. The mark must be set at the edge and preserved on every hop.'},
  {cat:'adv',t:'trust boundary',text:'where you believe a device’s own marking (access ports) and where you discard and overwrite it (untrusted edges). Every trust decision in QoS is also a security decision.'},
  {cat:'adv',t:'policing',text:'checking a rate and dropping or re-marking what exceeds it: instant, cheap, and punishing. The usual tool on a carrier’s edge.'},
  {cat:'adv',t:'shaping',text:'holding the excess in a buffer and releasing it smoothly, so the sender is slowed rather than dropped. The buffer is a queue, so shaping adds latency.'},
  {cat:'adv',t:'WFQ / CBWFQ',text:'weighted fair queuing gives each queue a guaranteed share so none starves; CBWFQ adds a class per traffic type with fair queuing inside it.'},
  {cat:'adv',t:'LLQ',text:'low-latency queuing: a small priority queue for voice with shaping for everything else, so priority traffic never queues behind bulk.'},
  {cat:'adv',t:'WRED',text:'dropping traffic early and deliberately, before the buffer is full, so the majority are not penalised the way full-buffer tail drop punishes them.'},
  {cat:'adv',t:'tail drop',text:'discarding packets when a queue is full – the default on a congested link, and the reason QoS exists at all.'},
  // ---- Storage (Course 30) ----
  {cat:'proto',t:'SAN / NAS',text:'Storage Area Network: block storage presented raw over a dedicated network, for databases. Network Attached Storage: file storage served over the network, for users and shares.'},
  {cat:'proto',t:'iSCSI',text:'block storage carried inside TCP (port 3260), so a Storage Area Network can use the existing network instead of dedicated Fibre Channel hardware.'},
  {cat:'proto',t:'Fibre Channel',text:'the dedicated protocol for block storage, with its own fabric, addressing, switches and terminology – a separate world from IP networking.'},
  {cat:'proto',t:'NFS',text:'the Unix file protocol (port 2049); the counterpart to SMB on Windows. Both serve files, so they are storage you can reach by path.'},
  {cat:'adv',t:'storage VLAN',text:'a dedicated VLAN for storage traffic, so an ACL and QoS can be applied to it independently and users cannot address the array directly.'},
  {cat:'adv',t:'RAID',text:'combining drives so one failing does not lose data. It is availability, not a backup – it faithfully replicates a deletion, a corruption, or an attacker.'},
  {cat:'adv',t:'snapshot',text:'a cheap point-in-time copy recording only what changed. Restoring one is a normal operation, which is what makes ransomware survivable.'},
  {cat:'adv',t:'replication',text:'a live copy at a second site – the only thing that survives losing the building. It helps only if the copy is isolated from whatever destroyed the original.'},
  // ---- Resilience and scaling (Course 14) ----
  {cat:'adv',t:'SPOF',text:'a single point of failure – a device whose outage takes the whole service down, because no alternate path goes around it. Double one up and the next one surfaces.'},
  {cat:'adv',t:'active/standby vs active/active',text:'the two HA pair modes: either one serves and the other waits (simple, but the backup idles), or both serve and share the load (more capacity, but neither may run at 100%).'},
  {cat:'adv',t:'failover',text:'the backup automatically taking over the active device’s role: detect the outage, take over the virtual IP, redirect the surroundings. A well-tuned pair does it in seconds.'},
  {cat:'adv',t:'heartbeat',text:'short “I am alive” messages between the two devices of an HA pair over a dedicated link; when they go quiet, failover starts.'},
  {cat:'adv',t:'split-brain',text:'only the heartbeat link fails, so both devices declare themselves active and claim the same virtual IP. That is why HA is never built on a single link.'},
  {cat:'adv',t:'state synchronization',text:'the active device copies its table of established connections to the backup, so the backup does not drop them after a failover.'},
  {cat:'adv',t:'health check',text:'the load balancer regularly asks the servers in the pool whether they are alive; it drops the dead ones and returns the recovered ones. Without it, it would make availability worse.'},
  {cat:'adv',t:'scale-up vs scale-out',text:'scaling up = one stronger machine (it has a ceiling and is a SPOF), scaling out = more smaller machines sharing the load (it grows and it survives a failure).'},
  {cat:'adv',t:'multi-WAN',text:'two connections from two providers, ideally over different technologies (fiber + mobile); when one fails, traffic moves to the other.'},
  {cat:'adv',t:'availability (nines)',text:'the percentage of time a service is running. “Five nines” (99.999%) means a few minutes of outage over a whole year – and it is extremely expensive.'},
  {cat:'adv',t:'MTBF',text:'mean time between failures – how long a device lasts on average without a fault. No number ever means “it will not fail”.'},
  {cat:'adv',t:'RTO',text:'the recovery time objective – how fast a service must come back when a fault happens. N-1 says how much may fail, RTO how fast the network gets back up.'},
  {cat:'adv',t:'MTTR',text:'mean time to repair – how long a fault takes to fix on average. MTBF says how often it happens, MTTR how long it then hurts.'},
  // ---- Zero Trust (Course 18) ----
  {cat:'sec',t:'Zero Trust',text:'a design approach where trust is not derived from network location but verified at every access. It is not a product but a way of designing from known parts: segments, rules, identity, monitoring.'},
  {cat:'sec',t:'microsegmentation',text:'a fine split of the network down to roles and servers, not just inside and DMZ; traffic between segments passes a checked point.'},
  {cat:'sec',t:'least privilege',text:'everyone gets exactly as much access as they need to work – and nothing more. In rules it means a narrow source, destination and service instead of any-any.'},
  {cat:'sec',t:'pivot',text:'using an already captured machine as a springboard to further targets in the network; lateral movement follows, and the border firewall never sees this internal traffic.'},
  {cat:'sec',t:'assume breach',text:'design the network as if the attacker were already inside; ask where they can reach from there, not whether they get in at all.'},
  {cat:'sec',t:'shadowing rule',text:'a broader rule higher in the list that decides before yours is ever reached; the shadowed one below it is called a dead rule.'},
  {cat:'sec',t:'decoy (honeypot)',text:'a tempting device with no legitimate purpose; any access to it is suspicious. It stops nobody, but tells you in time that something is happening.'},
  {cat:'sec',t:'PSK',text:'a pre-shared Wi-Fi password (WPA2/WPA3-Personal) – one secret for everyone; you cannot revoke it for a single person nor tell who it actually was.'},
  {cat:'sec',t:'fail-open / fail-closed',text:'how the network behaves when the authentication server is unreachable: with fail-closed nobody gets in (safe, but a blanket outage), with fail-open access is granted unverified (work continues, identity checks are gone). Decide in advance.'},
  {cat:'conn',t:'open network (open SSID)',text:'Wi-Fi without encryption; anyone in range can read the frames, listening is enough.'},
  // ---- Monitoring and logging (Course 19) ----
  {cat:'adv',t:'syslog',text:'the established way devices send their records to a shared collector; traditionally over UDP on port 514, so without delivery confirmation.'},
  {cat:'adv',t:'log server',text:'a host running log collection; one place for the whole network’s events – unlike local records, which are lost together with the device.'},
  {cat:'adv',t:'severity',text:'a mark on a record saying how quickly a human should care; in practice three levels are enough: info, warning, critical.'},
  {cat:'adv',t:'baseline',text:'a description of the network’s usual state: who talks to whom, on which ports and when. Without it you cannot spot a deviation – and a stale baseline manufactures false alarms.'},
  {cat:'adv',t:'anomaly',text:'a deviation from the usual: a new partner, a new port, an unusual time, volume or regularity. It is always measured against the baseline.'},
  {cat:'adv',t:'correlation',text:'assembling several records from different sources until they form a comprehensible story; it needs synchronized clocks on all devices.'},
  {cat:'adv',t:'flow',text:'a terse record of a connection: source, destination, port, protocol and volume – no content. That is why it stays visible even for encrypted traffic.'},
  {cat:'adv',t:'alert fatigue',text:'the state where alerts are so many that a human stops reading – and a real one slips through among them.'},
  {cat:'adv',t:'false positive',text:'an alert about something that is not really a problem; typically a known regular job. The main source of alert fatigue.'},
  {cat:'adv',t:'blind spot',text:'a part of the network you cannot see but consider fine – a mistaken certainty. It typically arises when records are not delivered and nobody counts it.'},
  {cat:'adv',t:'SNMP',text:'the established way a monitoring system asks a device for its values and state. Older versions run unencrypted, so they belong in the management network.'},
  {cat:'adv',t:'admin down',text:'the port is off by an administrator’s decision, not by a fault; hardware and cable are fine. Disabling unused ports is a common security measure.'},
  // ---- Troubleshooting methodology (Course 17) ----
  {cat:'basics',t:'symptom vs impact',text:'the symptom is what the user sees and describes ("the page will not load"); the impact is what the fault means for the business – it decides how urgent the case is.'},
  {cat:'basics',t:'fault isolation',text:'simplifying the situation until the problem vanishes: swap the cable, the port, the device. Each swap halves the suspects.'},
  {cat:'basics',t:'escalation',text:'handing the case on when your authority or knowledge runs out, or when the impact outgrows your progress.'}
];
function openCourseGlossary(back){
  const A=(typeof ACRONYM_FULL!=='undefined')?ACRONYM_FULL:{};
  const item=(g)=>{const term=g.t;const full=A[term]||'';const def=g.text;
    const key=(term+' '+(full||'')+' '+def.replace(/<[^>]+>/g,'')).toLowerCase();
    return '<details class="gl-item" data-k="'+esc(key)+'"><summary><b>'+esc(term)+'</b>'+(full?'<span class="gl-full">'+esc(full)+'</span>':'')+'</summary><div class="gl-def">'+def+'</div></details>';};
  const tk=g=>(g.t||'').toLowerCase(); // sort alphabetically by the displayed term
  const byTerm=(a,b)=>{const at=tk(a),bt=tk(b);return at<bt?-1:at>bt?1:0;};
  let rows='';
  COURSE_GLOSSARY_CATS.forEach(c=>{const terms=COURSE_GLOSSARY.filter(g=>g.cat===c.k).sort(byTerm);if(!terms.length)return;
    rows+='<div class="gl-cat"><div class="gl-cat-h">'+esc(c.text)+'</div>'+terms.map(item).join('')+'</div>';});
  openModal('<h2>'+icon('layers','ico-a')+'Glossary'+'</h2>'
    +'<div style="font-size:11.5px;color:var(--muted);margin:-6px 0 10px">'+'Terms from the course and the simulator. Click for detail; it keeps growing.'+'</div>'
    +'<input id="glFilter" placeholder="'+'Search a term…'+'" style="width:100%;margin:0 0 10px;box-sizing:border-box">'
    +'<div id="glList" style="max-height:58vh;overflow:auto">'+rows+'</div>'
    +'<div class="actions"><button class="btn" id="glClose">'+'Close'+'</button></div>');
  modalBox.classList.add('wide');
  const f=$('glFilter');if(f)f.oninput=()=>{const q=f.value.trim().toLowerCase();
    modalBox.querySelectorAll('.gl-item').forEach(r=>{const hit=!q||r.getAttribute('data-k').indexOf(q)>=0;r.style.display=hit?'':'none';if(q&&hit)r.open=true;else if(!q)r.open=false;});
    modalBox.querySelectorAll('.gl-cat').forEach(c=>{const any=Array.from(c.querySelectorAll('.gl-item')).some(r=>r.style.display!=='none');c.style.display=any?'':'none';});};
  // closing returns to where the glossary was opened from: to the course module (via _last), to the overview (back), otherwise the canvas
  $('glClose').onclick=()=>{
    if(typeof back==='function'){back();return;}
    let last=null;try{last=(typeof courseProgress==='function')&&courseProgress()._last;}catch(e){}
    if(last&&typeof openCourseModule==='function'){openCourseModule(last);}
    else closeModal();
  };
}
/* ---------- course grouping: learning path vs. topic (toggle above the list) ---------- */
const COURSE_GROUPS={
  path:[
    {text:'Getting started',ids:[1,2,26]},
    {text:'Addressing and services',ids:[24,23,16,25]},
    {text:'Build and secure a network',ids:[3,4,5,15]},
    {text:'Deepening: switching and routing',ids:[6,7,9,10,28]},
    {text:'Security in depth',ids:[8,22,18,12]},
    {text:'Wireless',ids:[11,30]},
    {text:'Quality of service',ids:[27,29]},
    {text:'Operations and incidents',ids:[19,17,21,14]},
    {text:'Specializations',ids:[13,20]}
  ],
  topic:[
    {text:'Networking basics',ids:[1,2,15,26]},
    {text:'Switching and routing',ids:[3,4,24,6,7,9,10,28]},
    {text:'Security',ids:[5,8,18,22]},
    {text:'Wireless',ids:[11,12]},
    {text:'Services and operations',ids:[16,23,25,19,17,21,14]},
    {text:'Industry and cloud',ids:[13,20,30]},
    {text:'Traffic handling',ids:[27,29]}
  ]
};
function courseGroupMode(){let v='path';try{v=localStorage.getItem('netsim_course_group')||'path';}catch(e){}return (v==='topic')?'topic':'path';}
function setCourseGroupMode(v){try{localStorage.setItem('netsim_course_group',v);}catch(e){}openCourse();}
/* ---------- course LIST (entry point from the Learn menu) ---------- */
function openCourse(){
  const prog=courseProgress();
  const sub=(co,fen)=>{const total=co.lessons.reduce((a,l)=>a+l.modules.length+(l.quizId?1:0),0);const done=co.lessons.reduce((a,l)=>a+l.modules.filter(m=>prog[m.id]).length+((l.quizId&&prog[l.quizId])?1:0),0);return done>0?('continue · '+done+' '+'of'+' '+total):fen;};
  const card=(id,co,fen)=>'<button class="preset-item course-card" id="'+id+'"><b>'+icon('layers','ico-a')+' '+esc(co.title)+'</b><small>'+esc(sub(co,fen))+'</small></button>';
  const CARD={};CARD[1]=card('courseOpen1',COURSE_1,'from the first packet to a loaded page');
  CARD[2]=card('courseOpen2',COURSE_2,'ISO/OSI and TCP/IP layers — from physical to encapsulation');
  CARD[16]=card('courseOpen16',COURSE_16,'DNS in depth — client, resolver and authority, cache and TTL, local DNS and forwarding, the path from the root, record types (A, CNAME, MX, TXT, NS, PTR), rogue DNS and DoH');
  CARD[3]=card('courseOpen3',COURSE_3,'switching and VLANs — split the network, access/trunk ports, inter-VLAN routing');
  CARD[4]=card('courseOpen4',COURSE_4,'routing and IP addresses — routing table, default and static routes, NAT, dynamic routing (RIP/OSPF)');
  CARD[5]=card('courseOpen5',COURSE_5,'network security — firewall, inside/outside/DMZ zones, rules, stateful inspection, VPN');
  CARD[15]=card('courseOpen15',COURSE_15,'build your first company network — plan, VLAN segmentation, subnets and router (inter-VLAN, NAT), firewall with zones and default-deny, test and audit');
  CARD[6]=card('courseOpen6',COURSE_6,'redundancy — loops and broadcast storms, Spanning Tree, root bridge, RSTP, EtherChannel');
  CARD[7]=card('courseOpen7',COURSE_7,'OSPF in depth — dynamic routing, Hello/DR/BDR, LSDB, Dijkstra, areas, convergence');
  CARD[8]=card('courseOpen8',COURSE_8,'advanced security — DPI, stateful inspection, IDS vs IPS, real attacks, layered defense');
  CARD[9]=card('courseOpen9',COURSE_9,'the switch in depth — MAC table, 802.1Q, port security, VLAN hopping, DHCP snooping, STP protection');
  CARD[10]=card('courseOpen10',COURSE_10,'the router in depth — routing table, administrative distance, NAT/PAT, HSRP/VRRP, router hardening');
  CARD[11]=card('courseOpen11',COURSE_11,'wireless in practice — AP and SSID, bands and generations, coverage and roaming, mesh vs repeater, antennas and MIMO, a peek at security');
  CARD[12]=card('courseOpen12',COURSE_12,'Wi-Fi security in depth — WPA2 handshake, WPA3/SAE, PMF, 802.1X/EAP, captive portal, attacks (evil twin, KRACK, WPS) and defense (WIPS)');
  CARD[13]=card('courseOpen13',COURSE_13,'OT/ICS security — PLCs and HMIs, the Purdue model, IT/OT segmentation, Modbus, the data diode, Stuxnet and defending production');
  CARD[14]=card('courseOpen14',COURSE_14,'resilience and scaling — SPOF and N-1, the HA pair and failover, load balancing (VIP, health check), the redundancy map and resilient design');
  CARD[17]=card('courseOpen17',COURSE_17,'troubleshooting — method instead of guessing, layer by layer from cable to firewall, name vs address test, the shadowing rule');
  CARD[18]=card('courseOpen18',COURSE_18,'Zero Trust and microsegmentation — why the perimeter is not enough, least privilege, role-based segments, identity verification, blast radius');
  CARD[19]=card('courseOpen19',COURSE_19,'monitoring and logs — log server and syslog, severity and alert fatigue, lost logs, baselines and anomalies, correlation into one incident');
  CARD[20]=card('courseOpen20',COURSE_20,'networking to the cloud — the cloud as a datacenter behind the network, site-to-site and remote VPN, publishing a service (DNAT, LB), a cloud DMZ and security groups, multi-WAN');
  CARD[21]=card('courseOpen21',COURSE_21,'incident response — phases and preparation, detection and triage, containment by quarantine, investigation from logs and flows, remediation, recovery and post-mortem');
  CARD[22]=card('courseOpen22',COURSE_22,'encryption in the network — what is visible on the cable, symmetric and asymmetric ciphers, the TLS handshake and certificates, the chain of trust and an internal authority, the limits of encryption and metadata');
  CARD[24]=card('courseOpen24',COURSE_24,'splitting a network into subnets — how many addresses you need, where subnets begin, VLSM and the largest-first order, the /30 on router links, overlaps and wrong masks');
  CARD[23]=card('courseOpen23',COURSE_23,'DHCP — why addresses are not handed out by hand, the four DORA messages, the range and lease time, reservations by MAC, relays into remote networks, the rogue server and starvation');
  CARD[25]=card('courseOpen25',COURSE_25,'IPv6 — why IPv4 ran out, writing a 128-bit address, why NAT stops, SLAAC and DHCPv6, link-local and multicast, the transition (dual-stack, tunnels) and planning a v6 network');
  CARD[26]=card('courseOpen26',COURSE_26,'the physical layer — what a cable actually carries, copper and fibre, crossover and Auto-MDI, speed and duplex, PoE and its budget, reading a link from both ends');
  CARD[27]=card('courseOpen27',COURSE_27,'multicast — one sender to many receivers, multicast groups and scoped addresses, IGMP joining and leaving, why switches flood, why routers stop it until PIM, shared and source trees, SSM');
  CARD[28]=card('courseOpen28',COURSE_28,'first-hop redundancy — the single-gateway problem, the virtual IP and MAC, priority, preemption and tracking, what failover costs, and GLBP for load sharing');
  CARD[29]=card('courseOpen29',COURSE_29,'Quality of Service in depth — what a congested link does to a call, marking (DSCP/802.1p) and trust boundaries, PQ/WFQ/CBWFQ, policing versus shaping, the VoIP trust problem, doing it in the right order');
  CARD[30]=card('courseOpen30',COURSE_30,'storage networks — block versus file (SAN/NAS), NFS/SMB/iSCSI/Fibre Channel, why latency beats bandwidth, the storage VLAN and its ACL, RAID, snapshots and replication');
  const GM=courseGroupMode();
  let resumeCard='';
  {const lastId=prog._last;
   if(lastId){let m=null,co=null;
     allCourses().forEach(c=>c.lessons.forEach(l=>l.modules.forEach(x=>{if(x.id===lastId){m=x;co=c;}}))); // without setActiveCourse – the overview must not switch the active course
     const nadpis=m?('Continue: '+m.title):'Continue the course';
     const popis=co?(co.title+' · '+'I will take you back where you stopped'):'I will take you back where you stopped';
     if(m||isQuizId(lastId))resumeCard='<div class="course-list" style="margin:0 0 6px"><button class="preset-item course-card crs-resume" id="courseResume"><b>'+icon('layers','ico-a')+' '+esc(nadpis)+'</b><small>'+esc(popis)+'</small></button></div>';}}
  let cards='';
  const used={};
  (COURSE_GROUPS[GM]||[]).forEach(g=>{
    const inner=g.ids.map(n=>{used[n]=1;return CARD[n]||'';}).join('');
    if(inner)cards+='<h3 class="ab-h" style="margin:16px 0 8px">'+esc(g.text)+'</h3><div class="course-list">'+inner+'</div>';
  });
  {const rest=Object.keys(CARD).filter(n=>!used[n]).map(n=>CARD[n]).join(''); // safety net: an unlisted course must not disappear from the list
   if(rest)cards+='<h3 class="ab-h" style="margin:16px 0 8px">'+esc('Other')+'</h3><div class="course-list">'+rest+'</div>';}
  cards+='<div class="course-list">';
  cards+='<button class="preset-item course-card locked" id="courseMore"><b>'+icon('chat','ico-a')+' '+'More courses coming soon'+'</b><small>'+'I pick topics partly from your feedback. '+'<span style="color:var(--cyan);text-decoration:underline">'+'Click to tell me what you want next ›'+'</span></small></button>';
  cards+='</div>';
  openModal('<h2>'+icon('layers','ico-a')+'Networking courses'+'</h2>'
    +'<p style="color:var(--muted);font-size:13px;line-height:1.55;margin:0 0 14px">'+'The courses take you through networking <b>from the ground up</b> and gradually go deeper – visual, step by step and jargon-free. And more courses are on the way!'+'</p>'
    +resumeCard
    +'<div class="seg" id="segCourseGroup" style="margin:0 0 4px"><button data-cg="path" class="'+(GM==='path'?'active':'')+'">'+esc('By learning path')+'</button><button data-cg="topic" class="'+(GM==='topic'?'active':'')+'">'+esc('By topic')+'</button></div>'
    +cards
    +'<div class="actions"><button class="btn" id="courseGlossary">'+icon('book','ico-a')+'Glossary'+'</button><button class="btn" id="courseClose">'+'Close'+'</button></div>');
  modalBox.classList.add('wide');
  {const sg=$('segCourseGroup');if(sg)sg.querySelectorAll('button').forEach(b=>{b.onclick=()=>setCourseGroupMode(b.getAttribute('data-cg'));});}
  if($('courseOpen1'))$('courseOpen1').onclick=()=>{setActiveCourse(COURSE_1);openCourseLessons();};
  if($('courseOpen2'))$('courseOpen2').onclick=()=>{setActiveCourse(COURSE_2);openCourseLessons();};
  if($('courseOpen16'))$('courseOpen16').onclick=()=>{setActiveCourse(COURSE_16);openCourseLessons();};
  if($('courseOpen3'))$('courseOpen3').onclick=()=>{setActiveCourse(COURSE_3);openCourseLessons();};
  if($('courseOpen4'))$('courseOpen4').onclick=()=>{setActiveCourse(COURSE_4);openCourseLessons();};
  if($('courseOpen5'))$('courseOpen5').onclick=()=>{setActiveCourse(COURSE_5);openCourseLessons();};
  if($('courseOpen15'))$('courseOpen15').onclick=()=>{setActiveCourse(COURSE_15);openCourseLessons();};
  if($('courseOpen6'))$('courseOpen6').onclick=()=>{setActiveCourse(COURSE_6);openCourseLessons();};
  if($('courseOpen7'))$('courseOpen7').onclick=()=>{setActiveCourse(COURSE_7);openCourseLessons();};
  if($('courseOpen8'))$('courseOpen8').onclick=()=>{setActiveCourse(COURSE_8);openCourseLessons();};
  if($('courseOpen9'))$('courseOpen9').onclick=()=>{setActiveCourse(COURSE_9);openCourseLessons();};
  if($('courseOpen10'))$('courseOpen10').onclick=()=>{setActiveCourse(COURSE_10);openCourseLessons();};
  if($('courseOpen11'))$('courseOpen11').onclick=()=>{setActiveCourse(COURSE_11);openCourseLessons();};
  if($('courseOpen12'))$('courseOpen12').onclick=()=>{setActiveCourse(COURSE_12);openCourseLessons();};
  if($('courseOpen13'))$('courseOpen13').onclick=()=>{setActiveCourse(COURSE_13);openCourseLessons();};
  if($('courseOpen14'))$('courseOpen14').onclick=()=>{setActiveCourse(COURSE_14);openCourseLessons();};
  if($('courseOpen17'))$('courseOpen17').onclick=()=>{setActiveCourse(COURSE_17);openCourseLessons();};
  if($('courseOpen18'))$('courseOpen18').onclick=()=>{setActiveCourse(COURSE_18);openCourseLessons();};
  if($('courseOpen19'))$('courseOpen19').onclick=()=>{setActiveCourse(COURSE_19);openCourseLessons();};
  if($('courseOpen20'))$('courseOpen20').onclick=()=>{setActiveCourse(COURSE_20);openCourseLessons();};
  if($('courseOpen21'))$('courseOpen21').onclick=()=>{setActiveCourse(COURSE_21);openCourseLessons();};
  if($('courseOpen22'))$('courseOpen22').onclick=()=>{setActiveCourse(COURSE_22);openCourseLessons();};
  if($('courseOpen23'))$('courseOpen23').onclick=()=>{setActiveCourse(COURSE_23);openCourseLessons();};
  if($('courseOpen24'))$('courseOpen24').onclick=()=>{setActiveCourse(COURSE_24);openCourseLessons();};
  if($('courseOpen25'))$('courseOpen25').onclick=()=>{setActiveCourse(COURSE_25);openCourseLessons();};
  if($('courseOpen26'))$('courseOpen26').onclick=()=>{setActiveCourse(COURSE_26);openCourseLessons();};
  if($('courseOpen27'))$('courseOpen27').onclick=()=>{setActiveCourse(COURSE_27);openCourseLessons();};
  if($('courseOpen28'))$('courseOpen28').onclick=()=>{setActiveCourse(COURSE_28);openCourseLessons();};
  if($('courseOpen29'))$('courseOpen29').onclick=()=>{setActiveCourse(COURSE_29);openCourseLessons();};
  if($('courseOpen30'))$('courseOpen30').onclick=()=>{setActiveCourse(COURSE_30);openCourseLessons();};
  if($('courseResume'))$('courseResume').onclick=()=>openCourseModule(prog._last);
  if($('courseMore')&&typeof openFeedbackModal==='function')$('courseMore').onclick=openFeedbackModal;
  if($('courseGlossary'))$('courseGlossary').onclick=()=>openCourseGlossary(openCourse);
  $('courseClose').onclick=closeModal;
}

/* ---------- lesson accordion for COURSE_1 ---------- */
function openCourseLessons(){
  const prog=courseProgress();
  let openIdx=0;
  if(prog._last){activeCourse.lessons.forEach((les,i)=>{ if(les.modules.some(m=>m.id===prog._last)||les.quizId===prog._last)openIdx=i; });}
  const order=courseOrder();
  let startId=activeCourse.lessons[0].modules[0].id;
  const resumeId=(prog._last&&order.some(o=>o.id===prog._last))?prog._last:startId;
  const allItems=[];activeCourse.lessons.forEach(les=>{les.modules.forEach(m=>allItems.push(m.id));if(les.quizId)allItems.push(les.quizId);});
  const courseDone=allItems.length>0&&allItems.every(id=>prog[id]);
  const modCount=activeCourse.lessons.reduce((a,l)=>a+l.modules.length,0);
  let body='';
  activeCourse.lessons.forEach((les,li)=>{
    const items=les.modules.map(m=>({id:m.id,t:m.title,quiz:false}));
    if(les.quizId)items.push({id:les.quizId,t:'Quiz',quiz:true});
    const total=items.length, done=items.filter(it=>prog[it.id]).length, allDone=total>0&&done===total;
    let mn=0,inner='';
    items.forEach(it=>{
      const num=it.quiz?'?':String(++mn);
      const seen=!!prog[it.id];
      const badge=it.quiz?('<span class="cm-badge ready">'+'Quiz'+' ▸</span>'):('<span class="cm-badge ready">▸ '+'Open'+'</span>');
      inner+='<div class="course-mod ready'+(it.quiz?' quiz':'')+(seen?' seen':'')+'" data-mod="'+it.id+'"><span class="cm-num">'+(seen?'✓':num)+'</span><span class="cm-t">'+esc(it.t)+'</span>'+badge+'</div>';
    });
    body+='<details class="course-lesson"'+(li===openIdx?' open':'')+'><summary><span class="cl-t">'+esc('Lesson'+' '+(li+1)+' · '+les.title)+'</span><span class="cl-prog'+(allDone?' done':'')+'">'+(allDone?('✓ '+'done'):(done+' '+'of'+' '+total))+'</span></summary>'+inner+'</details>';
  });
  const __fn=__courseNum(activeCourse);
  const finalId=(__fn===1)?'q_final':('c'+__fn+'q_final');
  body+='<div class="course-mod ready quiz" data-mod="'+finalId+'" style="margin-top:10px;border:1px dashed var(--cyan)"><span class="cm-num">'+(prog[finalId]?'✓':'?')+'</span><span class="cm-t">'+esc('Final quiz')+'</span><span class="cm-badge ready">'+'Quiz'+' ▸</span></div>';
  openModal('<h2>'+icon('layers','ico-a')+esc(activeCourse.title)+'</h2>'
    +'<p style="color:var(--muted);font-size:13px;line-height:1.55;margin:0 0 12px">'+esc(activeCourse.blurb)+' '+activeCourse.lessons.length+' '+'lessons · '+modCount+' '+'modules + a quiz after each lesson. Step through each at your own pace (‹ / ›).'+'</p>'
    +'<p style="color:var(--muted);font-size:11.5px;line-height:1.5;margin:0 0 10px;opacity:.85">'+'Click a lesson to unfold its modules. A green <b style="color:var(--green)">✓</b> marks what you have finished; when you return, the course opens where you last left off. Progress is saved only in your browser.'+'</p>'
    +'<div class="course-wrap">'+body+'</div>'
    +'<div class="actions"><button class="btn" id="courseBackList">‹ '+'Courses'+'</button><button class="btn primary" id="courseStart">'+(courseDone?'↺ '+'Start over':((resumeId!==startId?'Continue':'Start Lesson 1')+' ›'))+'</button></div>');
  modalBox.classList.add('wide');
  // A module row is a <div> (because of the layout inside <details>), so focus does not reach it on its own –
  // the same addition as for the device palette in a11yInit(): role=button + tabindex + Enter/Space.
  // Without it, the keyboard could only reach the lesson <summary> and the two bottom buttons, not a specific
  // module or a quiz.
  modalBox.querySelectorAll('.course-mod.ready').forEach(r=>{
    r.onclick=()=>openCourseModule(r.getAttribute('data-mod'));
    r.setAttribute('role','button');
    r.setAttribute('tabindex','0');
    r.addEventListener('keydown',e=>{ if(e.key!=='Enter'&&e.key!==' ')return; e.preventDefault(); r.click(); });
  });
  if($('courseBackList'))$('courseBackList').onclick=openCourse;
  if($('courseStart'))$('courseStart').onclick=()=>{
    if(courseDone){
      uiConfirm('Start this course over? This clears your progress in this course.',()=>{ resetCourseProgress(allItems.concat(finalId)); openCourseModule(startId); });
    } else if(resumeId) openCourseModule(resumeId);
  };
}

/* ---------- universal module dispatcher ---------- */
function openCourseModule(id){
  try{if(typeof courseMinClear==="function")courseMinClear();}catch(e){} // the lesson is open again – the "collapsed" bar no longer applies
  if(!__courseFileLoaded(__courseNumForId(id))){ __loadCourseFile(__courseNumForId(id),function(){openCourseModule(id);}); return; }
  if(isQuizId(id)){ setActiveCourse(courseForId(id)); markCourseSeen(id); openCourseQuiz(id); courseNav(id); return; }
  const {mod,lesson}=courseFindModule(id); if(!mod)return;
  // module may expose either render()(+optional mount) OR build()->{html,mount} (for heavy interactive modules)
  const built=mod.build?mod.build():null;
  const html=built?built.html:(mod.render?mod.render():'<p>—</p>');
  // data-driven: surface the lesson's task as a CTA on its last module
  let extra='';
  const lastMod=lesson&&lesson.modules[lesson.modules.length-1];
  if(lesson&&lesson.taskId&&lastMod&&lastMod.id===id){
    extra=courseCTA('crsTaskCta','Try this lesson in practice – open the learning task.','Open the task');
  }
  openModal('<h2>'+icon('layers','ico-a')+esc(mod.title)+'</h2>'+html+extra
    +'<div class="actions"></div>');
  modalBox.classList.add('wide');
  if(built&&built.mount){try{built.mount();}catch(e){console.warn('[course mount]',mod.id,e);}}
  else if(mod.mount){try{mod.mount();}catch(e){console.warn('[course mount]',mod.id,e);}}
  if(lesson&&lesson.taskId&&$('crsTaskCta'))$('crsTaskCta').onclick=()=>courseTry(lesson.taskId);
  markCourseSeen(id);
  courseNav(id);
}

/* ---------- breadcrumb + prev / overview / next ---------- */
function courseNav(id){
  const order=courseOrder();
  const i=order.findIndex(o=>o.id===id); if(i<0)return;
  const h2=modalBox.querySelector('h2');
  if(h2 && !modalBox.querySelector('.crs-bc')){
    const bc=document.createElement('div');bc.className='crs-bc';
    const li=order[i].li, les=activeCourse.lessons[li];
    bc.textContent=(order[i].kind==='quiz')
      ? 'Lesson'+' '+(li+1)+' · '+'quiz'
      : 'Lesson'+' '+(li+1)+' · '+'module'+' '+(les.modules.findIndex(m=>m.id===id)+1)+'/'+les.modules.length;
    h2.insertAdjacentElement('afterend',bc);
    h2.style.display='flex';h2.style.alignItems='center';h2.style.gap='8px';
    const x=document.createElement('button');
    x.type='button';x.id='crsClose';
    x.setAttribute('aria-label','Close the lesson');
    x.title='Close the lesson';
    x.textContent='✕';
    x.style.cssText='margin-left:auto;background:none;border:none;color:var(--muted);cursor:pointer;font-size:16px;line-height:1;padding:2px 4px;font-family:inherit';
    x.onclick=()=>closeModal();
    h2.appendChild(x);
  }
  // course text size: A− / A+ (reader feedback – default 13.5px, stored in localStorage)
  if(!modalBox.querySelector('.crs-fs')){
    const bcEl=modalBox.querySelector('.crs-bc');
    if(bcEl){
      const FS=[12.5,13.5,15,16.5];
      const cur=()=>{let v=13.5;try{v=parseFloat(localStorage.getItem('netsim_crs_fs'))||13.5;}catch(e){}return FS.indexOf(v)>=0?v:13.5;};
      const apply=v=>{document.documentElement.style.setProperty('--crs-fs',v+'px');try{localStorage.setItem('netsim_crs_fs',String(v));}catch(e){}};
      const wrap=document.createElement('span');wrap.className='crs-fs';
      wrap.style.cssText='float:right;display:inline-flex;gap:4px;align-items:center';
      wrap.innerHTML='<button type="button" id="crsFsDn" class="btn" style="padding:1px 8px;font-size:11px" title="'+esc('Smaller text')+'">A−</button>'
        +'<button type="button" id="crsFsUp" class="btn" style="padding:1px 8px;font-size:13px" title="'+esc('Larger text')+'">A+</button>';
      bcEl.appendChild(wrap);
      const step=d=>{const i=FS.indexOf(cur());const v=FS[Math.min(FS.length-1,Math.max(0,i+d))];apply(v);};
      wrap.querySelector('#crsFsDn').onclick=()=>step(-1);
      wrap.querySelector('#crsFsUp').onclick=()=>step(1);
    }
  }
  const act=[...modalBox.querySelectorAll('.actions')].pop(); if(!act)return;
  const prev=i>0?order[i-1].id:null, next=i<order.length-1?order[i+1].id:null;
  const go=(t)=>{ if(modalCloseHook){const cb=modalCloseHook;modalCloseHook=null;try{cb();}catch(e){}} openCourseModule(t); };
  act.style.justifyContent='space-between';
  act.innerHTML='<div style="flex:1 1 0;display:flex;justify-content:flex-start">'+(prev?'<button class="btn" id="crsPrev">‹ '+'Previous'+'</button>':'')+'</div>'
    +'<div style="flex:0 0 auto;display:flex;justify-content:center"><button class="btn" id="crsHome">'+'Course overview'+'</button></div>'
    +'<div style="flex:1 1 0;display:flex;justify-content:flex-end">'+(order[i].kind==='quiz'?'':(next?'<button class="btn primary" id="crsNext">'+(order[i+1].kind==='quiz'?'Next: quiz':'Next module')+' ›</button>':'<button class="btn primary" id="crsDone">'+'Finish ✓'+'</button>'))+'</div>';
  if($('crsPrev'))$('crsPrev').onclick=()=>go(prev);
  if($('crsHome'))$('crsHome').onclick=openCourseLessons;
  if($('crsNext'))$('crsNext').onclick=()=>go(next);
  if($('crsDone'))$('crsDone').onclick=openCourseLessons;
  // a subtle feedback link directly from the lesson (the top bar is behind the modal)
  if(!modalBox.querySelector('.crs-fb')&&typeof openFeedbackModal==='function'){
    const fb=document.createElement('div');fb.className='crs-fb';
    fb.style.cssText='text-align:center;margin-top:8px';
    fb.innerHTML='<button type="button" id="crsFb" style="background:none;border:none;color:var(--muted);font-size:11px;cursor:pointer;opacity:.7;text-decoration:underline;font-family:inherit">'+'Something off or missing in the course? Tell me.'+'</button>';
    act.insertAdjacentElement('afterend',fb);
    if($('crsFb'))$('crsFb').onclick=openFeedbackModal;
  }
}

/* ---------- quiz engine (data-driven) ---------- */
function openCourseQuiz(id){
  const quiz=courseQuizFor(id); if(!quiz)return;
  const qs=quiz.qs; let idx=0,score=0,answered=false;
  const order=courseOrder();
  const oi=order.findIndex(o=>o.id===id),nextId=(oi>=0&&oi<order.length-1)?order[oi+1].id:null;
  const goNext=()=>{ if(modalCloseHook){const cb=modalCloseHook;modalCloseHook=null;try{cb();}catch(e){}} if(nextId)openCourseModule(nextId); else openCourseLessons(); };
  const goTasks=()=>{ if(modalCloseHook){const cb=modalCloseHook;modalCloseHook=null;try{cb();}catch(e){}} openTasksModal(); };
  function render(){
    const atResult=idx>=qs.length; // on the result screen the skip/intro + persistent feedback link are pointless (the result has its own nudge)
    {const sk=$('quizSkipAll');if(sk)sk.style.display=atResult?'none':'';const ip=$('quizIntro');if(ip)ip.style.display=atResult?'none':'';const fb=modalBox.querySelector('.crs-fb');if(fb)fb.style.display=atResult?'none':'';}
    if(idx>=qs.length){
      const pct=Math.round(score/qs.length*100),col=pct>=80?'--green':(pct>=50?'--amber':'--red');
      const fin=!nextId;
      const _all=allCourses(); const _ci=_all.indexOf(activeCourse);
      const nextCourse=(_ci>=0&&_ci<_all.length-1)?_all[_ci+1]:null;
      const finPracticeMsg=nextCourse
        ? ('You can go straight on to <b>'+esc(nextCourse.title)+'</b>, or try the learning tasks in the simulator now.')
        : 'You finished the last course. Now try the learning tasks in the simulator.';
      $('quizBody').innerHTML='<div class="quiz-prog">'+'Result'+'</div>'
        +'<div class="quiz-score" style="color:var('+col+')">'+score+' / '+qs.length+'</div>'
        +(fin
          ? '<div style="text-align:center;margin:0 0 14px"><div style="font-weight:700;color:var(--green);font-size:14px;margin-bottom:4px">'+'You finished the whole course!'+'</div><div style="color:var(--muted);font-size:13px;line-height:1.5">'+finPracticeMsg+'</div></div>'
          : '<div style="text-align:center;color:var(--muted);font-size:13px;margin-bottom:14px">'+(pct>=80?'Great, you’ve got it!':pct>=50?'Decent – review a couple of spots.':'Go through it again and retry.')+'</div>')
        +'<div style="display:flex;justify-content:center;gap:8px;flex-wrap:wrap"><button class="btn" id="quizRetry">'+'Try again'+'</button>'
        +(fin
          ? (nextCourse
              ? '<button class="btn" id="quizTasks">'+'Try the tasks'+' ›</button><button class="btn primary" id="quizNextCourse">'+'Continue to course'+': '+esc(nextCourse.title)+' ›</button>'
              : '<button class="btn primary" id="quizTasks">'+'Try the tasks'+' ›</button>')
          : '<button class="btn primary" id="quizGoNext">'+'Next module'+' ›</button>')
        +'</div>'
        +feedbackPromptHtml();
      $('quizRetry').onclick=()=>{idx=0;score=0;answered=false;render();};
      if(fin){
        if($('quizTasks'))$('quizTasks').onclick=goTasks;
        const nc=$('quizNextCourse');
        if(nc&&nextCourse)nc.onclick=()=>{ if(modalCloseHook){const cb=modalCloseHook;modalCloseHook=null;try{cb();}catch(e){}} setActiveCourse(nextCourse); openCourseLessons(); };
      }
      else $('quizGoNext').onclick=goNext;
      return;
    }
    const q=qs[idx]; answered=false;
    const perm=q.opts.map((_,i)=>i);
    for(let i=perm.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));const tmp=perm[i];perm[i]=perm[j];perm[j]=tmp;}
    const shOpts=perm.map(i=>q.opts[i]), correctIdx=perm.indexOf(q.correct);
    const progTxt=s=>'Question'+' '+(idx+1)+' / '+qs.length+' · '+'score'+' '+s;
    let h='<div class="quiz-prog" id="quizProg">'+progTxt(score)+'</div>';
    h+='<div class="quiz-q">'+q.q+'</div>';
    shOpts.forEach((o,i)=>{h+='<button class="quiz-opt" data-i="'+i+'">'+esc(o)+'</button>';});
    h+='<div class="quiz-why" id="quizWhy" role="status" aria-live="polite" style="display:none"></div>';
    h+='<div style="display:flex;justify-content:flex-end;margin-top:10px"><button class="btn primary" id="quizNext" style="display:none">'+(idx===qs.length-1?'See result':'Next question')+' ›</button></div>';
    $('quizBody').innerHTML=h;
    modalBox.querySelectorAll('.quiz-opt').forEach(b=>b.onclick=()=>{
      if(answered)return; answered=true;
      const pick=+b.getAttribute('data-i');
      modalBox.querySelectorAll('.quiz-opt').forEach((x,xi)=>{x.disabled=true;if(xi===correctIdx)x.classList.add('correct');if(xi===pick&&pick!==correctIdx)x.classList.add('wrong');});
      if(pick===correctIdx)score++;
      // the score in the header was previously only updated with the next question, so after a correct answer it still
      // showed "score 0" – rewrite it right away
      {const p=$('quizProg');if(p)p.textContent=progTxt(score);}
      const w=$('quizWhy');w.textContent=(pick===correctIdx?'Correct. ':'Not quite. ')+q.why;w.style.display='';
      $('quizNext').style.display='';
      // the options are now disabled -> focus would fall to BODY; move it to "Next" so the keyboard can continue
      try{$('quizNext').focus();}catch(e){}
    });
    if($('quizNext'))$('quizNext').onclick=()=>{idx++;render();};
  }
  openModal('<h2>'+icon('tasks','ico-a')+esc(quiz.title)+'</h2>'
    +'<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;margin:0 0 8px">'
      +'<p id="quizIntro" style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.5;margin:0;flex:1">'+'A quick, <b>optional</b> check. Click an answer and you will see right away if it is right, and why. Not in the mood? Feel free to skip it.'+'</p>'
      +'<button class="btn" id="quizSkipAll" style="white-space:nowrap;flex:0 0 auto">'+'Skip quiz'+' →</button>'
    +'</div>'
    +'<div id="quizBody"></div>'
    +'<div class="actions"><button class="btn" id="quizBack">'+'‹ Back to course'+'</button></div>');
  modalBox.classList.add('wide');
  const skipAll=$('quizSkipAll');if(skipAll)skipAll.onclick=goNext;
  $('quizBack').onclick=openCourseLessons;
  render();
}

/* ---------- minimal CSS for the course list (rest reuses index.html) ---------- */
(function(){
  try{
    var css='.course-list{display:flex;flex-direction:column;gap:8px;margin:6px 0 14px}'
      +'.course-card{text-align:left;width:100%}'
      +'.course-card b{display:flex;align-items:center;gap:6px}'
      +'.course-card.locked{opacity:.6;cursor:pointer;border-style:dashed;background:var(--panel2)}';
    var s=document.createElement('style');s.textContent=css;document.head.appendChild(s);
  }catch(e){}
})();

/* load marker (transition aid) */
try { window.__courseJsLoaded = true; } catch(e){}

/* ---- dev-only quiz integrity assert (Block B) ---- */
function validateQuizzes(){
  let n=0;
  const chk=(q,tag)=>{
    const opts=q.opts||[];
    if(!Number.isInteger(q.correct)||q.correct<0||q.correct>=opts.length){console.error(tag+': correct OOB');n++;}
    if(!q.why||!q.q){console.error(tag+': missing field');n++;}
  };
  const QZ=[COURSE_1_QUIZZES,COURSE_2_QUIZZES,COURSE_3_QUIZZES,COURSE_4_QUIZZES,COURSE_5_QUIZZES,
            COURSE_6_QUIZZES,COURSE_7_QUIZZES,COURSE_8_QUIZZES,COURSE_9_QUIZZES,COURSE_10_QUIZZES,COURSE_11_QUIZZES,COURSE_12_QUIZZES,COURSE_13_QUIZZES,COURSE_14_QUIZZES,COURSE_15_QUIZZES,COURSE_16_QUIZZES];
  QZ.forEach((Q,ci)=>{for(const qid in Q){(Q[qid].qs||[]).forEach((q,qi)=>chk(q,'C'+(ci+1)+' '+qid+' q'+qi));}});
  const FX=[COURSE_1_FINAL_EXTRA,COURSE_2_FINAL_EXTRA,COURSE_3_FINAL_EXTRA,COURSE_4_FINAL_EXTRA,COURSE_5_FINAL_EXTRA,
            COURSE_6_FINAL_EXTRA,COURSE_7_FINAL_EXTRA,COURSE_8_FINAL_EXTRA,COURSE_9_FINAL_EXTRA,COURSE_10_FINAL_EXTRA,COURSE_11_FINAL_EXTRA,COURSE_12_FINAL_EXTRA,COURSE_13_FINAL_EXTRA,COURSE_14_FINAL_EXTRA,COURSE_15_FINAL_EXTRA,COURSE_16_FINAL_EXTRA];
  FX.forEach((A,ci)=>{(A||[]).forEach((q,qi)=>chk(q,'C'+(ci+1)+' FINAL_EXTRA q'+qi));});
  // success is NOT LOGGED – it was the only thing the app wrote to the console on its own; every problem
  // calls console.error higher up itself, so silence = all good
  if(n)console.error('[validateQuizzes] '+n+' problems');
}
try{ if(typeof location!=='undefined'&&/^(localhost|127\.0\.0\.1)$/.test(location.hostname))validateQuizzes(); }catch(e){}

