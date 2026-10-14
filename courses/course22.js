/* course22.js — content of Course 22 (Encryption in the network: what it hides and what it does not; loaded on demand via course-core.js) */
/* ============================================================
   COURSE 22 — Encryption in the network: what it hides and what it does not (wiretapping a link, three
   properties, a symmetric and an asymmetric cipher, TLS handshake, certificates,
   PKI and the chain of trust, the limits of encryption, practice and a checklist).
   Scene c22Net: PC / PC2 — SW — FW — DPI, CA, WEB, NET.
   ============================================================ */
var C22R={pc:[58,80],pc2:[58,240],sw:[180,160],fw:[320,160],dpi:[320,275],ca:[470,60],web:[470,255],net:[600,160]};
function c22Net(pfx){
  return '<svg id="'+pfx+'svg" viewBox="0 0 640 320" width="100%" style="display:block">'
    +'<line x1="76" y1="92" x2="162" y2="148" style="stroke:var(--line2);stroke-width:1.6"/>'
    +'<line x1="76" y1="228" x2="162" y2="172" style="stroke:var(--line2);stroke-width:1.6"/>'
    +'<line x1="202" y1="160" x2="298" y2="160" style="stroke:var(--line2);stroke-width:1.6"/>'
    +'<line x1="338" y1="148" x2="452" y2="72" style="stroke:var(--line2);stroke-width:1.6"/>'
    +'<line x1="339" y1="172" x2="451" y2="243" style="stroke:var(--line2);stroke-width:1.6"/>'
    +'<line x1="342" y1="160" x2="578" y2="160" style="stroke:var(--line2);stroke-width:1.6"/>'
    +'<line x1="320" y1="182" x2="320" y2="253" style="stroke:var(--line2);stroke-width:1.6"/>'
    +'<g id="'+pfx+'glow"></g>'
    +csHost(58,80,'desktop','--blue','PC')
    +csHost(58,240,'laptop','--violet','PC2')
    +csDev(180,160,'l2switch','SW')+csDev(320,160,'firewall','FW')
    +csDev(320,275,'idsips','DPI')
    +csHost(470,60,'server','--green','CA')
    +csHost(470,255,'server','--amber','WEB')
    +csHost(600,160,'globe','--cyan','NET')
    +'<g id="'+pfx+'dyn"></g></svg>';
}
function c22P(pfx,intro,terms){
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+intro+'</p>'
    +'<div class="osi-stage">'+c22Net(pfx)+'</div><div class="m1-cap" id="'+pfx+'cap"></div>'
    +courseStepControls(pfx)+abbrBox(terms);
}
function c22Mount(pfx,STEPS){
  function show(i){var g=$(pfx+'glow');if(g)g.innerHTML=STEPS[i].glow||'';var d=$(pfx+'dyn');if(d)d.innerHTML=STEPS[i].dyn||'';var c=$(pfx+'cap');if(c)c.innerHTML='<span>'+STEPS[i].cap+'</span>';}
  courseStepper(pfx,STEPS.length,show);
}
function c22g(name,color){var p=C22R[name];return csGlow(p[0],p[1],color,22);}
function c22lbl(tx,c){return '<text x="320" y="20" text-anchor="middle" style="font:700 8px var(--mono);fill:var('+c+')">'+esc(tx)+'</text>';}
function c22pkt(path,color,dur){return '<rect x="-6" y="-4" width="12" height="9" rx="2" style="fill:var('+color+')"><animateMotion path="'+path+'" dur="'+(dur||'1.7s')+'" repeatCount="indefinite"/></rect>';}

/* ---------- text scene (letters and fingerprints; no topology) ---------- */
function c22Txt(pfx){return '<svg id="'+pfx+'svg" viewBox="0 0 640 250" width="100%" style="display:block"><g id="'+pfx+'dyn"></g></svg>';}
function c22TP(pfx,intro,terms){
  return '<p style="color:var(--muted);font-size:var(--crs-fs,13.5px);line-height:1.55;margin:0 0 10px">'+intro+'</p>'
    +'<div class="osi-stage">'+c22Txt(pfx)+'</div><div class="m1-cap" id="'+pfx+'cap"></div>'
    +courseStepControls(pfx)+abbrBox(terms);
}
function c22TMount(pfx,STEPS){
  function show(i){var d=$(pfx+'dyn');if(d)d.innerHTML=STEPS[i].dyn||'';var c=$(pfx+'cap');if(c)c.innerHTML='<span>'+STEPS[i].cap+'</span>';}
  courseStepper(pfx,STEPS.length,show);
}
function c22Ttl(tx,c){return '<text x="320" y="22" text-anchor="middle" style="font:700 10px var(--mono);fill:var('+c+')">'+esc(tx)+'</text>';}
function c22Note(y,tx,c){return '<text x="320" y="'+y+'" text-anchor="middle" style="font:400 10px var(--sans);fill:var('+(c||'--muted')+')">'+esc(tx)+'</text>';}
function c22Tag(x,y,tx,c){return '<text x="'+x+'" y="'+y+'" style="font:700 9px var(--mono);fill:var('+c+')">'+esc(tx)+'</text>';}
function c22Ltr(x,y,word,c){var s='';for(var i=0;i<word.length;i++){var xx=x+i*34;s+='<rect x="'+xx+'" y="'+y+'" width="28" height="34" rx="6" style="fill:var('+c+');fill-opacity:.14;stroke:var('+c+');stroke-width:1.4"/><text x="'+(xx+14)+'" y="'+(y+23)+'" text-anchor="middle" style="font:700 15px var(--mono);fill:var('+c+')">'+esc(word.charAt(i))+'</text>';}return s;}
function c22Bar(x,y,h,tx,c){return '<rect x="'+x+'" y="'+(y-h)+'" width="26" height="'+h+'" rx="4" style="fill:var('+c+');fill-opacity:.25;stroke:var('+c+');stroke-width:1.3"/><text x="'+(x+13)+'" y="'+(y+14)+'" text-anchor="middle" style="font:700 11px var(--mono);fill:var('+c+')">'+esc(tx)+'</text>';}
function c22Card(x,y,w,h,c,tx,sub){return '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="8" style="fill:var('+c+');fill-opacity:.13;stroke:var('+c+');stroke-width:1.5"/><text x="'+(x+w/2)+'" y="'+(y+(sub?h/2-1:h/2+5))+'" text-anchor="middle" style="font:700 12px var(--mono);fill:var('+c+')">'+esc(tx)+'</text>'+(sub?'<text x="'+(x+w/2)+'" y="'+(y+h/2+14)+'" text-anchor="middle" style="font:400 9px var(--sans);fill:var(--muted)">'+esc(sub)+'</text>':'');}
function c22Arr(x,y,tx,c){return '<text x="'+x+'" y="'+y+'" text-anchor="middle" style="font:700 14px var(--mono);fill:var('+(c||'--muted')+')">'+esc(tx)+'</text>';}

/* ---------- L1M1 — The Caesar cipher ---------- */
function renderC22Caesar(){return c22TP('tls',
  'Encryption is not an invention of the internet – people needed to write so a messenger could not read it long before the first cable existed. The best-known old example is named after a Roman commander: the <b>Caesar cipher</b>. It works so simply you can try it on paper. You take the alphabet and replace every letter of the message with the letter a few places further on. With a shift of three, A becomes D, B becomes E and so on; at the end of the alphabet you simply continue from the start. The number you shift by is the <b>key</b>. Whoever knows it reads the message easily: shift the letters back. Whoever does not sees a meaningless row of letters. This simple example already shows everything essential that holds for today’s ciphers too. First, the <b>procedure</b> (shift the letters) is separate from the <b>key</b> (by how much). Second, both sides must somehow know the key in advance – and how a key gets delivered is a problem that will accompany you through the whole course. And third: the strength of the protection depends on how many different keys come into question. With Caesar there are twenty-five, so you can try them all on paper before you finish your coffee. That is precisely why ciphers had to move much further on – and why exactly this is not enough is what the next module shows.',
  [['the Caesar cipher','every letter is replaced by one a few places further in the alphabet; the key is by how much.'],['key','the secret value without which the message cannot be read; the procedure need not be secret.']]);}
function mountC22Caesar(){var P='HELLO',C='KHOOR',x0=320-P.length*17;
  c22TMount('tls',[
  {dyn:c22Ttl('we start with ordinary text we want to hide','--blue')
    +c22Tag(x0,66,'plaintext','--muted')+c22Ltr(x0,76,P,'--blue')
    +c22Note(150,'anyone on the path would read this off the cable'),
   cap:'We start with <b>plaintext</b>: an ordinary word we want to send so the messenger cannot read it.'},
  {dyn:c22Ttl('we shift every letter three places in the alphabet','--amber')
    +c22Tag(x0,66,'plaintext','--muted')+c22Ltr(x0,76,P,'--blue')
    +c22Arr(320,132,'shift by 3 ↓','--amber')
    +c22Tag(x0,152,'encrypted','--muted')+c22Ltr(x0,162,C,'--amber')
    +c22Note(220,'A → D, B → E, … and at the end of the alphabet you continue from the start'),
   cap:'We shift every letter <b>three places</b>. A becomes D, B becomes E – and past the last letter you continue from the start of the alphabet.'},
  {dyn:c22Ttl('that is all an outsider gets to see','--green')
    +c22Tag(x0,66,'encrypted','--muted')+c22Ltr(x0,76,C,'--green')
    +c22Note(150,'without the key it is just a row of letters with no meaning')
    +c22Note(172,'with the key you simply shift the letters back'),
   cap:'An outsider sees only a <b>row of meaningless letters</b>. Whoever knows the key shifts them back and reads the original.'},
  {dyn:c22Ttl('the key is a single number – and there are only twenty-five','--red')
    +c22Card(70,60,150,54,'--blue','procedure','shift the letters')
    +c22Card(250,60,150,54,'--amber','key','by how much')
    +c22Card(430,60,140,54,'--red','1 … 25','all the options')
    +c22Note(160,'the procedure is publicly known, only the key number should be secret')
    +c22Note(182,'but twenty-five numbers can be tried on paper in no time','--red'),
   cap:'The key here is a single number and there are <b>twenty-five</b> options. Trying them all takes moments – and that is where the problem starts.'}
]);}
/* ---------- L1M2 — Why hand ciphers fall ---------- */
function renderC22Freq(){return c22TP('tlt',
  'The Caesar cipher falls to brute force because there are few keys. The fix suggests itself: replace every letter with another letter from an arbitrary table, not merely by a shift. Such a <b>substitution</b> has an enormous number of possible tables and trying them all is genuinely out of reach. Even so, such a cipher breaks easily, with a tool called <b>frequency analysis</b>. The trick is that in every language letters do not occur equally often. In Czech the most common are E, A and O, in English E, T and A. When one letter appears in the ciphertext far more often than the others, there is a fair chance it is exactly the most common letter of the language – and from that one guess the rest unravels like a crossword. Substitution <b>preserves the frequencies</b>: it only repaints their name tags. A modern cipher does not do that. In it the same letter comes out differently every time depending on what came before, so the output looks like perfectly even noise and no statistic pulls anything out of it. And one more thing was learned from the history of hand ciphers, the hard way: <b>security must not rest on keeping the procedure secret</b>. A procedure always leaks sooner or later – a device is stolen, a person defects, someone simply works it out. So today ciphers are published and left to be publicly attacked; only the <b>key</b> should be secret. A cipher nobody has seen, whose author claims it is safe, is not trusted – it is a warning sign.',
  [['frequency analysis','breaking a cipher by how often individual letters occur in the language.'],['substitution','each letter is replaced by another from a table; the letter frequencies remain.'],['only the key is secret','the cipher’s procedure is published and left to be attacked; protection rests on the key alone.']]);}
function mountC22Freq(){var F=['E','T','A','O','I'];
  c22TMount('tlt',[
  {dyn:c22Ttl('in every language some letters are far more common','--blue')
    +c22Bar(150,150,86,F[0],'--blue')+c22Bar(210,150,68,F[1],'--blue')+c22Bar(270,150,58,F[2],'--blue')+c22Bar(330,150,44,F[3],'--blue')+c22Bar(390,150,34,F[4],'--blue')
    +c22Note(196,'the most common letters of ordinary text')
    +c22Note(218,'and that is exactly what someone without the key notices'),
   cap:'In every language <b>some letters are far more common</b> than others. That is a property of the text, not of the cipher.'},
  {dyn:c22Ttl('substitution keeps the frequencies, it only repaints the labels','--amber')
    +c22Bar(150,150,86,'?','--amber')+c22Bar(210,150,68,'?','--amber')+c22Bar(270,150,58,'?','--amber')+c22Bar(330,150,44,'?','--amber')+c22Bar(390,150,34,'?','--amber')
    +c22Note(196,'the tallest bar is almost surely the language’s most common letter','--amber')
    +c22Note(218,'and from one guessed pair the rest unravels like a crossword'),
   cap:'<b>Substitution</b> keeps the frequencies: the tallest bar stays tallest. Guess one letter and the rest unravels.'},
  {dyn:c22Ttl('a modern cipher makes even noise you can read nothing from','--green')
    +c22Bar(150,150,52,'?','--green')+c22Bar(210,150,49,'?','--green')+c22Bar(270,150,54,'?','--green')+c22Bar(330,150,50,'?','--green')+c22Bar(390,150,51,'?','--green')
    +c22Note(196,'the same letter comes out differently each time, depending on what came before')
    +c22Note(218,'the bars are equally tall, so statistics has nothing to catch on'),
   cap:'A <b>modern cipher</b> makes even noise: the same letter comes out differently every time and statistics has nothing to catch on.'},
  {dyn:c22Ttl('security must not rest on hiding the procedure','--red')
    +c22Card(60,64,240,58,'--red','a secret procedure','sooner or later it leaks')
    +c22Card(340,64,240,58,'--green','a secret key','you replace it and carry on')
    +c22Note(164,'ciphers today are published and left to be publicly attacked')
    +c22Note(186,'a cipher nobody has seen is no proof of safety but a warning','--red'),
   cap:'The last lesson from history: <b>only the key should be secret</b>. The procedure is published – one nobody has seen is a warning sign.'}
]);}
/* ---------- L1M3 — Hide or encrypt ---------- */
function renderC22Steg(){return c22TP('tlu',
  'There is a second way to keep something from someone, and it is confused with encryption surprisingly often. It is called <b>steganography</b> and it means <b>hiding</b> a message instead of encrypting it. Encryption says: ‘here is a message, but you will not read it’. Steganography says: ‘there is no message here’. The classic form is a picture: the photo looks perfectly ordinary, but text is imperceptibly tucked into the data of individual dots. The eye sees no difference, the file size fits, the format is fine. Things can also be hidden in sound, in video, in unused space in a document, or in the pattern of someone sending seemingly dull queries. The difference matters and is worth remembering: encryption protects the <b>content</b>, steganography protects <b>the fact that you are communicating at all</b>. Neither replaces the other, and anyone serious uses both – encrypt the message first and only then hide it. For you as a defender the term has one practical consequence above all, which the incident course follows up: steganography is a favorite way to <b>get data out of a company</b>. An attacker does not send the database as a file but pours it piece by piece into images uploaded to an ordinary photo service or into DNS queries. Nobody finds the content odd, because there is no suspicious content. It is spotted almost solely by what the course has already discussed: <b>metadata and volume</b> – who suddenly sends far more data out than before, and where to.',
  [['steganography','hiding a message so nobody spots that one exists at all (typically in a picture).'],['hide vs. encrypt','encryption protects the content, steganography the fact you communicate; neither replaces the other.']]);}
function mountC22Steg(){c22TMount('tlu',[
  {dyn:c22Ttl('two different ways of keeping something from someone','--blue')
    +c22Card(60,60,240,64,'--green','encrypt','‘the message is here, but you cannot read it’')
    +c22Card(340,60,240,64,'--violet','hide','‘there is no message here’')
    +c22Note(166,'encryption protects the content, steganography the fact you communicate')
    +c22Note(188,'neither replaces the other – anyone serious uses both'),
   cap:'Encryption says ‘you will not read the message’. <b>Steganography</b> says ‘there is no message here’. Two different things.'},
  {dyn:c22Ttl('text tucked into image data – the eye sees no difference','--violet')
    +c22Card(120,58,180,74,'--blue','an ordinary photo','looks perfectly ordinary')
    +c22Arr(320,100,'=','--muted')
    +c22Card(340,58,180,74,'--violet','photo + message','size and format still fit')
    +c22Note(172,'the message is imperceptibly scattered through the data of individual dots')
    +c22Note(194,'it can also hide in sound, video or DNS queries'),
   cap:'The classic form is a <b>picture</b>: text scattered through the dot data. The eye sees no difference and format and size still fit.'},
  {dyn:c22Ttl('hence its use today for sending data out of a company','--red')
    +c22Card(50,60,160,58,'--red','a database','not sent as a file')
    +c22Arr(240,94,'→','--muted')
    +c22Card(270,60,160,58,'--amber','piece by piece','into images and queries')
    +c22Arr(460,94,'→','--muted')
    +c22Card(480,60,110,58,'--violet','out','nothing looks odd')
    +c22Note(160,'there is no suspicious content there, so there is nothing to search for')
    +c22Note(182,'it follows on from the incident course: this is what a data leak looks like'),
   cap:'An attacker <b>pours data out piece by piece</b> into images or queries. There is no suspicious content because there is no content.'},
  {dyn:c22Ttl('it is spotted mainly from metadata and volume','--cyan')
    +c22Card(70,62,220,60,'--cyan','how much data goes out','and how that changed from before')
    +c22Card(350,62,220,60,'--cyan','where to and how often','a new target service, a regular rhythm')
    +c22Note(164,'the content will not help you, because nothing about it is odd')
    +c22Note(186,'and that is why an encrypted network is watched by traffic pattern'),
   cap:'Detection rests on <b>metadata and volume</b>: who suddenly sends far more out than before, and where to. Content will not help.'}
]);}
/* ---------- L2M1 — What is visible on the cable ---------- */
function renderC22Wire(){return c22P('tla',
  '<b>Before you start:</b> this course builds on the earlier courses (addresses and mask, gateway, ports, DNS, firewall, DPI and sensors) – if any term feels unfamiliar, check those first. We begin with an unpleasant finding: <b>a cable hides nothing</b>. The data running through a network is just a sequence of bytes, and whoever reaches it reads it exactly as the sender sent it. You can try this in the simulator right away: <b>right-click a link</b> and choose <b>Capture traffic</b>. You will see what travels along that cable – and with old protocols the reading is uncomfortably legible. <b>HTTP</b> shows the whole page address and everything you typed into a form. <b>Telnet</b> shows the login name, the password and every command you typed on the device. <b>FTP</b> behaves the same: name and password go over the wire in plain text. These protocols were not born out of malice – they were born when networks were small and everyone in them trusted each other. Anyone who needs to capture traffic today need not be a hacker with expensive gear: it is enough to be <b>on the path</b> the data flows through. A switch plugged into the meeting room, public Wi-Fi in a cafe, the connectivity provider, anyone between you and the server. That is exactly why encryption exists: so that whoever looks at the cable sees only an unintelligible jumble. The rest of the course is about how that is done and – no less important – <b>what it still does not hide</b>.',
  [['capturing on a link','right-click a link → Capture traffic; it shows what really travels the cable.'],['plain text','data sent without encryption; HTTP, Telnet and FTP send even passwords this way.']])
  +courseCTA('tlaTask','Capture the traffic on a link and see how much of unencrypted traffic is legible: the task ‘Wiretap the cable’.','Open the task');}
function mountC22Wire(){c22Mount('tla',[
  {glow:c22g('pc','--red')+c22g('sw','--red')+c22g('fw','--red')+c22g('net','--red'),dyn:c22pkt('M 58 80 L 180 160 L 320 160 L 600 160','--red','2.1s')+c22lbl('HTTP: the address and the typed password are legible','--red'),cap:'Over <b>HTTP</b> everything goes in plain text: the page address and whatever you typed into a form. Whoever is on the path reads along.'},
  {glow:c22g('pc2','--amber')+c22g('sw','--amber'),dyn:c22pkt('M 58 240 L 180 160','--amber','1.1s')+c22lbl('Telnet and FTP: name, password and every command','--amber'),cap:'<b>Telnet</b> and <b>FTP</b> are the same: name, password and every typed command go over the wire as they are.'},
  {glow:c22g('dpi','--cyan')+c22g('fw','--cyan'),dyn:c22pkt('M 320 275 L 320 160','--cyan','1.2s')+c22lbl('try it: right-click a link → Capture traffic','--cyan'),cap:'Try it: <b>right-click a link → Capture traffic</b>. You will see exactly what anyone on the path would see.'},
  {glow:c22g('pc','--green')+c22g('sw','--green')+c22g('fw','--green')+c22g('web','--green'),dyn:c22pkt('M 58 80 L 180 160 L 320 160 L 470 255','--green','2.1s')+c22lbl('encrypted: only an unintelligible jumble is left','--green'),cap:'With <b>encryption</b> the same connection travels the same cable, but a capture sees only an unintelligible jumble of bytes.'}
]);
  var b=$('tlaTask');if(b)b.onclick=function(){courseTry('wiretap');};
}
/* ---------- L2M2 — What encryption solves and what not ---------- */
function renderC22What(){return c22P('tlb',
  'In everyday speech encryption is often treated as a magic cloak of invisibility: ‘it is encrypted, so it is safe’. The reality is more precise and worth knowing at the outset, so you do not lean on encryption where it will not help. Encryption reliably hides the <b>content</b>: what you wrote, which file you downloaded, which password you entered, what the server answered. That is genuinely strong protection and nobody breaks it by brute force in practice. What encryption does <b>not</b> hide is <b>metadata</b> – the facts about the connection itself: who talked to whom, when, for how long and how much data moved. For data to arrive at all, the sender and recipient addresses must be readable to every switch and router along the way. They cannot be encrypted, or the packet could not be delivered. And a surprising amount can be derived from metadata. That the accountant’s computer connects to a foreign address every night at three and sends hundreds of megabytes tells you almost everything, even if you read not one byte. That someone in the company regularly connects to a job-hunting site does too. And third: encryption does not protect the <b>endpoints</b> either. When an attacker has your computer, they see the data at the moment it is decrypted – exactly where you work with it. Encryption is protection <b>on the path</b>, not protection of everything.',
  [['metadata','facts about a connection: who with whom, when, how long, how much – encryption does not hide them.'],['protection on the path','encryption protects data between sender and recipient, not on the end devices.']]);}
function mountC22What(){c22Mount('tlb',[
  {glow:c22g('pc','--green')+c22g('sw','--green')+c22g('fw','--green')+c22g('web','--green'),dyn:c22pkt('M 58 80 L 180 160 L 320 160 L 470 255','--green','2.1s')+c22lbl('the content is hidden: text, file and typed password','--green'),cap:'Encryption hides the <b>content</b>: what you wrote, what you downloaded, which password you entered. That is genuinely strong protection.'},
  {glow:c22g('pc','--amber')+c22g('sw','--amber')+c22g('fw','--amber')+c22g('net','--amber'),dyn:c22pkt('M 58 80 L 180 160 L 320 160 L 600 160','--amber','2.1s')+c22lbl('addresses stay readable, or the packet cannot arrive','--amber'),cap:'Addresses <b>must</b> stay readable – otherwise the packet could not arrive. Every switch and router on the path sees them.'},
  {glow:c22g('net','--red')+c22g('fw','--red')+c22g('web','--red'),dyn:c22pkt('M 600 160 L 320 160 L 470 255','--red','2.0s')+c22lbl('metadata: who with whom, when, how long, how much','--red'),cap:'<b>Metadata</b> remain: who talked to whom, when, for how long and how much moved. A great deal follows from that.'},
  {glow:c22g('pc','--cyan')+c22g('sw','--cyan'),dyn:c22pkt('M 58 80 L 180 160','--cyan','1.1s')+c22lbl('and encryption does not protect the endpoint either','--cyan'),cap:'And encryption does not protect the <b>endpoint</b>: whoever has your computer sees the data the moment it is decrypted.'}
]);}
/* ---------- L2M3 — Three properties ---------- */
function renderC22Three(){return c22P('tlc',
  'When security talks about encryption, it almost always means three different properties at once. It pays to tell them apart, because each is provided by a different part of the mechanism and each can fail on its own. The first is <b>confidentiality</b>: no outsider reads the content. That is the property everyone pictures – data turns into a jumble from which nothing can be pulled without the key. The second is <b>integrity</b>: nobody changes the content on the way without it being noticed. Without it an attacker could not read your message, but could shuffle bytes in it and the recipient would receive something other than you sent. So a short check value is computed for every message; after any change it no longer matches and the recipient discards the message. The third is <b>authenticity</b>: you really are talking to who you think. Without it even perfect encryption is useless – a perfectly encrypted conversation with an attacker merely posing as the server helps you not at all. Authenticity is precisely what <b>certificates</b> address, and half this course is devoted to them. Remember it as three questions about any connection: <b>Can anyone read this? Can anyone change it? And who am I actually talking to?</b> Good encryption answers all three; when only the first is answered, the protection is merely apparent.',
  [['confidentiality','no outsider reads the content – the property everyone pictures under encryption.'],['integrity','a change on the way is spotted by the recipient via a check value and the message discarded.'],['authenticity','certainty the other side really is who you want to talk to; certificates address it.']]);}
function mountC22Three(){c22Mount('tlc',[
  {glow:c22g('pc','--green')+c22g('sw','--green')+c22g('fw','--green')+c22g('web','--green'),dyn:c22pkt('M 58 80 L 180 160 L 320 160 L 470 255','--green','2.1s')+c22lbl('confidentiality: no outsider reads the content','--green'),cap:'<b>Confidentiality</b>: the content becomes a jumble from which nothing can be pulled without the key. That is the first of three properties.'},
  {glow:c22g('net','--red')+c22g('fw','--red')+c22g('web','--red'),dyn:c22pkt('M 600 160 L 320 160 L 470 255','--red','2.0s')+c22lbl('integrity: a change on the way is noticed','--red'),cap:'<b>Integrity</b>: a check value is computed for the message. If someone shuffles bytes on the way it no longer matches and the recipient discards it.'},
  {glow:c22g('fw','--blue')+c22g('ca','--blue'),dyn:c22pkt('M 320 160 L 470 60','--blue','1.5s')+c22lbl('authenticity: are you really talking to that server?','--blue'),cap:'<b>Authenticity</b>: are you really talking to who you think? Certificates and authorities answer that – the second half of the course.'},
  {glow:c22g('dpi','--cyan')+c22g('fw','--cyan'),dyn:c22pkt('M 320 275 L 320 160','--cyan','1.2s')+c22lbl('who can read it? who can change it? who is it?','--cyan'),cap:'Three questions for any connection: <b>can anyone read it, can anyone change it, and who am I talking to?</b> Good encryption answers all of them.'}
]);}
/* ---------- L3M1 — The symmetric cipher ---------- */
function renderC22Sym(){return c22P('tld',
  'The simplest way to encrypt something is a <b>symmetric cipher</b>: there is a single key and it is used both to encrypt and to decrypt. Whoever has the key reads the data; whoever lacks it sees a jumble. The comparison holds: an ordinary lock with one key. Whoever has the key can both open and close the door. In practice the cipher used today is mainly <b>AES</b>, and two things about it suffice: it is considered secure and it is <b>very fast</b>. Modern processors handle it directly in hardware, so encrypting a large volume of data costs practically nothing – which is why it encrypts ordinary traffic, video calls and whole disks. But a symmetric cipher has one flaw, and it is fundamental: <b>how to get the key to the other side</b>. For a server to send you encrypted data you must both hold the same key – yet sending it over the very network you are only starting to protect is nonsense. Whoever is listening captures the key and reads everything from then on. And delivering it otherwise, say by meeting in person, is impossible with the hundreds of servers you talk to daily. This problem is called <b>key exchange</b> and for decades it was encryption’s hardest nut. It is solved precisely by the second kind of cipher, called asymmetric, which comes in the very next module.',
  [['symmetric cipher','one key both encrypts and decrypts; fast and suited to large volumes of data (AES).'],['key exchange','the problem of delivering a shared key over a network nobody protects yet.']]);}
function mountC22Sym(){c22Mount('tld',[
  {glow:c22g('pc','--green')+c22g('sw','--green')+c22g('fw','--green')+c22g('web','--green'),dyn:c22pkt('M 58 80 L 180 160 L 320 160 L 470 255','--green','2.1s')+c22lbl('one key both encrypts and decrypts','--green'),cap:'A <b>symmetric cipher</b>: one key encrypts and decrypts. Like an ordinary lock – whoever has the key both opens and closes.'},
  {glow:c22g('pc2','--blue')+c22g('sw','--blue')+c22g('fw','--blue')+c22g('web','--blue'),dyn:c22pkt('M 58 240 L 180 160 L 320 160 L 470 255','--blue','1.5s')+c22lbl('AES is fast: large volumes cost practically nothing','--blue'),cap:'Mainly <b>AES</b> is used: considered secure and very fast – processors handle it directly in hardware.'},
  {glow:c22g('net','--red')+c22g('fw','--red')+c22g('web','--red'),dyn:c22pkt('M 600 160 L 320 160 L 470 255','--red','2.0s')+c22lbl('but how do you deliver the key to the other side?','--red'),cap:'The flaw is fundamental: <b>how do you get the key to the other side?</b> Sending it over the network you want to protect is nonsense.'},
  {glow:c22g('dpi','--amber')+c22g('fw','--amber'),dyn:c22pkt('M 320 275 L 320 160','--amber','1.2s')+c22lbl('whoever captures the key reads everything after','--amber'),cap:'Whoever captures the key on the way <b>reads everything from then on</b>. This is called key exchange – and the next module solves it.'}
]);}
/* ---------- L3M2 — The asymmetric cipher ---------- */
function renderC22Asym(){return c22P('tle',
  'An <b>asymmetric cipher</b> looks nonsensical at first glance and ingenious at the second: instead of one key it has a <b>pair</b> that belongs together. One of them is <b>public</b> and anyone may have it – you can post it on the web. The other is <b>private</b> and never leaves the device it belongs to. The relation between them is what matters: what you encrypt with the public key can be opened <b>only</b> by the private one. And the other way round: what the private key encrypts, anyone can verify with the public one. Two different uses follow, and they are often confused. The first is <b>delivering a secret</b>: to send something to a server so that only it can read it, you encrypt it with the server’s public key. Anyone on the path holds that same public key, but for decryption it is useless. The second use is a <b>signature</b>: the server encrypts something with its private key and you verify it with its public one. When verification succeeds, you know the holder of the private key sent it – and nobody else could have. That is exactly how certificates work, which we reach in the TLS lesson. There is one catch, a practical one: an asymmetric cipher is <b>orders of magnitude slower</b> than a symmetric one. Encrypting a whole file download or a video call with it would be unusable. So in practice it is not used alone – and how the two ciphers complement each other is the next module.',
  [['public key','anyone may hold it; what it encrypts only the matching private key can open.'],['private key','never leaves the device; it opens messages and signs – so its leak is the worst case.']]);}
function mountC22Asym(){c22Mount('tle',[
  {glow:c22g('fw','--blue')+c22g('ca','--blue'),dyn:c22pkt('M 320 160 L 470 60','--blue','1.5s')+c22lbl('the public key may be handed to anyone','--blue'),cap:'There are two keys and they belong together. Anyone may hold the <b>public</b> one; the <b>private</b> one never leaves its device.'},
  {glow:c22g('pc','--green')+c22g('sw','--green')+c22g('fw','--green')+c22g('web','--green'),dyn:c22pkt('M 58 80 L 180 160 L 320 160 L 470 255','--green','2.1s')+c22lbl('you encrypt with the public, only the private opens','--green'),cap:'Want to send a secret only to the server? Encrypt with its <b>public</b> key – only its <b>private</b> key opens it.'},
  {glow:c22g('web','--cyan')+c22g('fw','--cyan')+c22g('ca','--cyan'),dyn:c22pkt('M 470 255 L 320 160 L 470 60','--cyan','2.0s')+c22lbl('signature: signed by private, verified by public','--cyan'),cap:'The second use is a <b>signature</b>: the server signs with the private key and you verify with the public one. Nobody else could have done it.'},
  {glow:c22g('net','--red')+c22g('fw','--red'),dyn:c22pkt('M 600 160 L 320 160','--red','1.5s')+c22lbl('the catch: orders of magnitude slower than symmetric','--red'),cap:'The catch: an asymmetric cipher is <b>orders of magnitude slower</b>. Encrypting a download or a video call with it would be unusable.'}
]);}
/* ---------- L3M3 — Why they are used together ---------- */
function renderC22Both(){return c22P('tlf',
  'Now the two ciphers join and produce what protects almost the whole internet today. A symmetric cipher is fast but cannot deliver the key. An asymmetric one can deliver a secret but is slow. The solution suggests itself: <b>use the asymmetric cipher only once, to agree a symmetric key</b> – and encrypt everything else with the fast symmetric one. That is exactly what <b>TLS</b> does, the protocol behind the https prefix. At the start of a connection there is a short, computationally heavier part in which both sides agree a shared key and check who they are talking to. Then it switches to the symmetric cipher and the rest of the connection runs fast. A comparison: with the asymmetric cipher you shake hands and safely pass the safe’s key; from then on you use the safe. Two things are worth adding. First, these days the key is usually not even sent – both sides <b>compute</b> it from publicly exchanged values in a way that a listener cannot derive from what they saw. It sounds like magic, but it is only mathematics this course does not need. Second, a <b>new key is created for every connection</b>. If someone obtains one later, an old captured connection does not help them – that property is called forward secrecy and it is a main reason old TLS versions are no longer used.',
  [['TLS','the protocol behind https: the key is agreed asymmetrically, then it runs symmetrically.'],['a per-connection key','a new key for each connection; a later leak does not reveal previously captured traffic.']]);}
function mountC22Both(){c22Mount('tlf',[
  {glow:c22g('pc','--blue')+c22g('sw','--blue')+c22g('fw','--blue')+c22g('web','--blue'),dyn:c22pkt('M 58 80 L 180 160 L 320 160 L 470 255','--blue','2.1s')+c22lbl('the key is agreed asymmetrically at the start','--blue'),cap:'At the start of a connection a shared key is agreed <b>asymmetrically</b>. It is a short but computationally heavier part.'},
  {glow:c22g('fw','--green')+c22g('web','--green'),dyn:c22pkt('M 320 160 L 470 255','--green','1.4s')+c22lbl('both sides usually compute the key themselves','--green'),cap:'These days the key is usually not even sent – both sides <b>compute</b> it so a listener cannot derive it from what they saw.'},
  {glow:c22g('pc','--amber')+c22g('sw','--amber')+c22g('fw','--amber')+c22g('net','--amber'),dyn:c22pkt('M 58 80 L 180 160 L 320 160 L 600 160','--amber','1.4s')+c22lbl('from then on the fast symmetric cipher runs','--amber'),cap:'Then it switches to the <b>symmetric</b> cipher and the rest runs fast. Shake hands, pass the safe’s key, then use the safe.'},
  {glow:c22g('dpi','--cyan')+c22g('fw','--cyan'),dyn:c22pkt('M 320 275 L 320 160','--cyan','1.2s')+c22lbl('every connection gets its own new key','--cyan'),cap:'A <b>new key is created for every connection</b>. A later leak therefore does not reveal previously captured traffic.'}
]);}
/* ---------- L4M1 — A fingerprint with no way back ---------- */
function renderC22Hash(){return c22TP('tlv',
  'Until now the talk was about encryption, that is about something that can be decrypted again. Now comes a thing confused with encryption almost constantly, while being something else entirely: a <b>hash</b>, a <b>fingerprint</b> of data. A fingerprint is produced by running data through a computation that spits out a short string of fixed length. Whether you feed it one word or a two-hour film, the result is always the same length. And above all: the road runs <b>one way only</b>. From data you compute a fingerprint easily, but from a fingerprint you do not get the original data back – not because it is hard, but because it is simply not in there. It is like the ash of a letter: it came from the letter, but you will not reassemble the letter from it. This one-way nature is what makes fingerprints an ideal tool for <b>passwords</b>. A server need not know your password at all. At registration it computes its fingerprint and stores only that. When you log in, it computes the fingerprint again from what you typed and compares it with the stored one. If they match, the password was right. When someone steals such a database, they do not have passwords – they have fingerprints. The second useful property is sensitivity to change: <b>a tiny change of input makes a completely different fingerprint</b>. Rewrite a single letter in a file and the result is not ‘almost the same’ but unrecognizably different at first glance. Integrity checking, which the third module covers, builds on exactly this.',
  [['hash (fingerprint)','a short fixed-length result computed from data; you cannot get the data back from it.'],['one-way','a fingerprint is easy to compute from data; the reverse is not – the data is not in it.']]);}
function mountC22Hash(){c22TMount('tlv',[
  {dyn:c22Ttl('from data you compute a short fixed-length fingerprint','--blue')
    +c22Card(50,62,170,58,'--blue','a password or file','an input of any length')
    +c22Arr(250,96,'→','--muted')
    +c22Card(270,62,120,58,'--amber','computation','always the same procedure')
    +c22Arr(420,96,'→','--muted')
    +c22Card(440,62,150,58,'--green','fingerprint','always the same length')
    +c22Note(162,'one word and a two-hour film give a result of the same length'),
   cap:'A <b>fingerprint</b> is a short fixed-length result. Feed the computation a word or a whole film – the output is always the same length.'},
  {dyn:c22Ttl('the reverse does not work: the data is not in the fingerprint','--red')
    +c22Card(50,62,150,58,'--green','fingerprint','short and unintelligible')
    +c22Arr(230,96,'✕','--red')
    +c22Card(260,62,170,58,'--red','the original data','not reassembled from it')
    +c22Note(158,'it is like the ash of a letter: it came from it, but you cannot rebuild the letter')
    +c22Note(180,'hence a fingerprint is called one-way – and hence it is not a cipher','--red'),
   cap:'There is no way back: <b>the data is simply not in the fingerprint</b>. So it is not a cipher – nothing can be decrypted, there is nothing there.'},
  {dyn:c22Ttl('so the server need not know your password at all','--green')
    +c22Card(60,60,220,58,'--blue','at registration','only the password fingerprint is stored')
    +c22Card(360,60,220,58,'--green','at login','it is computed again and compared')
    +c22Note(158,'if the fingerprints match, the password was right – and was never stored')
    +c22Note(180,'whoever steals such a database has no passwords, only fingerprints'),
   cap:'The server <b>stores only the fingerprint</b>. At login it recomputes and compares. Whoever steals the database finds no passwords.'},
  {dyn:c22Ttl('and a tiny change of input makes a completely different fingerprint','--cyan')
    +c22Card(60,60,230,58,'--blue','contract.pdf','fingerprint starts 4f 2b …')
    +c22Card(350,60,230,58,'--cyan','contract.pdf + one letter','fingerprint starts d9 71 …')
    +c22Note(158,'the result is not ‘almost the same’ but unrecognizably different at a glance')
    +c22Note(180,'integrity checking in the third module rests on this property'),
   cap:'Change one letter and the fingerprint is <b>completely different</b>, not ‘almost the same’. Checking a file did not change rests on that.'}
]);}
/* ---------- L4M2 — Salt and pepper ---------- */
function renderC22Salt(){return c22TP('tlw',
  'Storing a fingerprint instead of a password is the right idea, but on its own it is not enough – and the reason is inconspicuous. A fingerprint is always computed the same way, so <b>two identical inputs give an identical output</b>. When a thousand people pick the same favorite password, the database holds the same string a thousand times. An attacker who steals the database therefore sees straight away who shares a password with whom – and above all need not compute anything anew. There are <b>rainbow tables</b>: enormous precomputed lists of ‘this fingerprint belongs to this password’. Breaking a password then means not computing but looking up, and that takes a fraction of a second. The defense is called a <b>salt</b>. Before the computation a short <b>random</b> value is mixed into each password, different for every user, and stored next to the fingerprint in the same record. A salt is not secret – its point is not secrecy but that it <b>breaks the sameness</b>: two people with the same password end up with completely different fingerprints, and a precomputed table becomes useless, because it would have to be built separately for every salt. The companion is a <b>pepper</b>: another secret value mixed in the same way, but <b>not stored in the database</b> – it lives in the application configuration or a secure key store. When an attacker steals only the database and cannot reach the application, a piece of the input is missing and they compute nothing. So a salt is a duty, a pepper a welcome extra.',
  [['rainbow table','a precomputed list of ‘fingerprint → password’; cracking turns into a lookup.'],['salt','a random value mixed into each password separately; stored with the record, need not be secret.'],['pepper','a secret value mixed in like a salt but kept outside the database – in the app configuration.']]);}
function mountC22Salt(){c22TMount('tlw',[
  {dyn:c22Ttl('the same password gives the same fingerprint – and that is a problem','--red')
    +c22Card(60,60,230,58,'--blue','user A','fingerprint 7c 1e 44 …')
    +c22Card(350,60,230,58,'--blue','user B','fingerprint 7c 1e 44 …')
    +c22Note(158,'a stolen database shows at once who shares a password with whom','--red')
    +c22Note(180,'and the attacker need break only one password for the whole group'),
   cap:'A fingerprint is always computed the same, so <b>identical passwords give identical fingerprints</b>. A stolen database shows it at a glance.'},
  {dyn:c22Ttl('a rainbow table: a precomputed list of fingerprints to passwords','--amber')
    +c22Card(80,60,200,58,'--amber','7c 1e 44 …','= a known popular password')
    +c22Arr(310,94,'→','--muted')
    +c22Card(340,60,200,58,'--red','found in a moment','nothing computed, just looked up')
    +c22Note(158,'password cracking turns from computing into a lookup in a list')
    +c22Note(180,'tables for common passwords have long existed and are freely available'),
   cap:'A <b>rainbow table</b> is a precomputed ‘fingerprint → password’ list. Cracking turns from computing into a lookup – a matter of moments.'},
  {dyn:c22Ttl('a salt: a different random value mixed into every password','--green')
    +c22Card(60,60,230,58,'--green','user A + salt x9f','fingerprint b2 55 01 …')
    +c22Card(350,60,230,58,'--green','user B + salt q3d','fingerprint e8 4a 97 …')
    +c22Note(158,'thanks to the salt identical passwords get completely different fingerprints')
    +c22Note(180,'the salt is stored with the record and need not be secret – it breaks the sameness'),
   cap:'A <b>salt</b> is a random value, different for each user. It need not be secret; its point is to break the sameness of fingerprints.'},
  {dyn:c22Ttl('a pepper: a secret value that is not in the database at all','--cyan')
    +c22Card(60,60,230,58,'--blue','the database','fingerprints and salts')
    +c22Card(350,60,230,58,'--cyan','app configuration','the pepper stays here')
    +c22Note(158,'whoever steals only the database lacks part of the input and computes nothing')
    +c22Note(180,'a salt is a duty, a pepper a welcome extra'),
   cap:'A <b>pepper</b> is a secret outside the database – in the app configuration. Whoever steals only the database lacks part of the input.'}
]);}
/* ---------- L4M3 — A fingerprint as an integrity check ---------- */
function renderC22Integ(){return c22TP('tlx',
  'Fingerprints are not used only for passwords. The second big use is <b>integrity checking</b>, that is answering whether a file is still the one someone released. The principle follows directly from what you know: identical data gives an identical fingerprint and a tiny change gives a completely different one. So downloadable files come with a published <b>checksum</b>. You download the file, compute its fingerprint yourself and compare it with the one stated on the page. If they match, nobody changed the file on the way and it was not corrupted. If they do not, do not run it. You met the same reasoning with the three properties in the previous lesson – message integrity in TLS is watched by exactly such a short check value computed from the content. One important note remains: not every fingerprint is worth anything today. For the older functions <b>MD5</b> and <b>SHA-1</b>, <b>collisions</b> were found – pairs of different inputs with the same fingerprint. For integrity checking that is fatal: an attacker can prepare a forged version of a file with the same checksum as the real one. Hence <b>SHA-256</b> is used today. And passwords have one more quirk: there a fast computation is a disadvantage, because an attacker with a stolen database tries passwords by the billion. So <b>deliberately slow</b> functions are used, such as bcrypt or argon2, designed so that a single computation costs something. The practical rule: <b>SHA-256 for integrity, bcrypt or argon2 for passwords, MD5 and SHA-1 nowhere</b>.',
  [['checksum','a published fingerprint of a file; after downloading you compute it yourself and compare.'],['collision','two different inputs with the same fingerprint; because of them MD5 and SHA-1 are out.']]);}
function mountC22Integ(){c22TMount('tlx',[
  {dyn:c22Ttl('the same file gives the same fingerprint every time','--green')
    +c22Card(60,60,230,58,'--blue','fingerprint on the page','published by the file’s publisher')
    +c22Card(350,60,230,58,'--green','fingerprint after download','you compute it yourself')
    +c22Note(158,'if both match, nobody changed the file on the way and it is not corrupted')
    +c22Note(180,'hence downloadable files come with a published checksum'),
   cap:'A <b>checksum</b>: the publisher states the fingerprint, you compute it after downloading and compare. If they match, the file is unchanged.'},
  {dyn:c22Ttl('a changed file is spotted without looking inside it','--red')
    +c22Card(60,60,230,58,'--blue','expected fingerprint','4f 2b 90 …')
    +c22Card(350,60,230,58,'--red','computed fingerprint','a1 e7 c3 …')
    +c22Note(158,'they differ – the file is not the one the publisher released','--red')
    +c22Note(180,'in that case do not run it and download it again from a verified source'),
   cap:'When the fingerprints <b>differ</b>, the file is not what the publisher released. Do not run it – be it corruption or a forgery.'},
  {dyn:c22Ttl('collisions were found for MD5 and SHA-1','--amber')
    +c22Card(60,60,230,58,'--amber','the genuine file','MD5 fingerprint: 3d 8a …')
    +c22Card(350,60,230,58,'--red','the forged file','MD5 fingerprint: 3d 8a …')
    +c22Note(158,'a collision = two different inputs with the same fingerprint')
    +c22Note(180,'for integrity checking that is fatal, hence MD5 and SHA-1 nowhere','--red'),
   cap:'For <b>MD5</b> and <b>SHA-1</b>, <b>collisions</b> can be found: two different files with one fingerprint. So they no longer suffice for integrity.'},
  {dyn:c22Ttl('what to use today: it depends what you need the fingerprint for','--cyan')
    +c22Card(60,60,230,58,'--green','SHA-256','for file and message integrity')
    +c22Card(350,60,230,58,'--cyan','bcrypt or argon2','for passwords – deliberately slow')
    +c22Note(158,'with passwords speed is a drawback: an attacker tries them by the billion')
    +c22Note(180,'the rule: SHA-256 for integrity, bcrypt or argon2 for passwords'),
   cap:'The practical rule: <b>SHA-256 for integrity, bcrypt or argon2 for passwords</b> – deliberately slow ones. MD5 and SHA-1 nowhere.'}
]);}
/* ---------- L5M1 — What happens when you open https ---------- */
function renderC22Hand(){return c22P('tlg',
  'You type an address starting with <b>https://</b> and before the page appears a conversation called a <b>handshake</b> takes place. It lasts a fraction of a second and has four steps, which we walk through without a single formula. <b>Step one:</b> the browser contacts the server and says which TLS versions and ciphers it supports and, importantly, which <b>name</b> it is asking for. The name matters because one address may host several sites. <b>Step two:</b> the server replies which cipher it picked from the offer and sends its <b>certificate</b> – a document stating its name, its public key and the signature of the authority confirming it. <b>Step three:</b> the browser <b>verifies</b> the certificate (does the name match? is it valid? was it signed by someone I trust?) and both sides agree a shared symmetric key. If verification failed you would see a warning and the next step would never come. <b>Step four:</b> both sides confirm they hold the same key, and from this moment the whole connection is encrypted – only now does the page request go out. It is worth noting what follows in practice: <b>the padlock in the browser does not mean ‘this site is honest’</b>. It only means ‘the connection is encrypted and the certificate matches the name you typed’. A fraudulent site can hold a valid certificate exactly like a bank.',
  [['handshake','a connection’s opening exchange: cipher offer, certificate, verification and key agreement.'],['the browser padlock','it means an encrypted connection matching the typed name – not that the site is honest.']]);}
function mountC22Hand(){c22Mount('tlg',[
  {glow:c22g('pc','--blue')+c22g('sw','--blue')+c22g('fw','--blue')+c22g('web','--blue'),dyn:c22pkt('M 58 80 L 180 160 L 320 160 L 470 255','--blue','2.1s')+c22lbl('1) the browser says what it supports and which name','--blue'),cap:'<b>1)</b> The browser speaks up: I support these versions and ciphers, and I am asking for this <b>name</b>. One address may host several sites.'},
  {glow:c22g('web','--green')+c22g('fw','--green')+c22g('sw','--green')+c22g('pc','--green'),dyn:c22pkt('M 470 255 L 320 160 L 180 160 L 58 80','--green','2.1s')+c22lbl('2) the server sends its cipher choice and certificate','--green'),cap:'<b>2)</b> The server replies which cipher it picked and sends its <b>certificate</b>: name, public key and the authority’s signature.'},
  {glow:c22g('pc','--amber')+c22g('sw','--amber')+c22g('fw','--amber')+c22g('ca','--amber'),dyn:c22pkt('M 58 80 L 180 160 L 320 160 L 470 60','--amber','2.1s')+c22lbl('3) certificate verification and key agreement','--amber'),cap:'<b>3)</b> The browser <b>verifies</b> the certificate – name matches, still valid, signed by someone trusted? – and a key is agreed.'},
  {glow:c22g('pc','--cyan')+c22g('sw','--cyan')+c22g('fw','--cyan')+c22g('web','--cyan'),dyn:c22pkt('M 58 80 L 180 160 L 320 160 L 470 255','--cyan','1.4s')+c22lbl('4) only now does the request go out, encrypted','--cyan'),cap:'<b>4)</b> Both sides confirm the key and only now the request goes out – encrypted. But the padlock does not mean ‘an honest site’.'}
]);}
/* ---------- L5M2 — What a certificate holds ---------- */
function renderC22Cert(){return c22P('tlh',
  'A <b>certificate</b> sounds mysterious, but it is an ordinary data file with a few fields and one signature. Inside you find four essential things. The <b>name</b> the certificate is valid for – a specific domain or a group of domains. The server’s <b>public key</b>, the half of the pair anyone may hold. The <b>validity period</b>, from when to when the certificate counts as good; today it tends to be short, a matter of months. And the <b>authority’s signature</b>, which attested all of it – without it anyone could produce such a file about themselves. The signature is exactly the use of asymmetric cryptography you saw in the second lesson: the authority signed with its private key and you verify with its public one. The word <b>valid</b> then means three things hold at once. First, <b>the name matches</b> the address you actually typed. Second, <b>the validity period is running</b> – it does not start tomorrow and did not end last week. Third, <b>the signature leads to an authority your device trusts</b>; the browser and the operating system carry a list of such authorities. If any of the three fails, the connection must not be treated as verified. And once more the most important part, because even professionals confuse it: <b>a valid certificate vouches for the name, not for honesty</b>. That a site has a properly issued certificate says nothing about what it will do with your data.',
  [['certificate','a file with a name, a public key, a validity period and an authority’s signature.'],['a valid certificate','the name matches, the period is running and the signature leads to a trusted authority.']]);}
function mountC22Cert(){c22Mount('tlh',[
  {glow:c22g('fw','--blue')+c22g('ca','--blue'),dyn:c22pkt('M 320 160 L 470 60','--blue','1.5s')+c22lbl('inside: name, public key, validity, signature','--blue'),cap:'A certificate holds four essentials: the <b>name</b>, the <b>public key</b>, the <b>validity period</b> and the <b>authority’s signature</b>.'},
  {glow:c22g('pc','--cyan')+c22g('sw','--cyan')+c22g('fw','--cyan')+c22g('ca','--cyan'),dyn:c22pkt('M 58 80 L 180 160 L 320 160 L 470 60','--cyan','2.1s')+c22lbl('the signature: attested with the authority’s private key','--cyan'),cap:'The <b>signature</b> is asymmetric cryptography at work: the authority signed with its private key, you verify with its public one.'},
  {glow:c22g('web','--green')+c22g('fw','--green')+c22g('ca','--green'),dyn:c22pkt('M 470 255 L 320 160 L 470 60','--green','2.0s')+c22lbl('valid = name matches, period runs, authority known','--green'),cap:'<b>Valid</b> means three things at once: the name matches the address, the period is running and the signature leads to a trusted authority.'},
  {glow:c22g('net','--red')+c22g('fw','--red'),dyn:c22pkt('M 600 160 L 320 160','--red','1.5s')+c22lbl('a valid certificate vouches for the name, not for honesty','--red'),cap:'Careful: <b>a valid certificate vouches for the name, not for honesty</b>. A fraudulent site can hold one exactly like a bank.'}
]);}
/* ---------- L5M3 — Why the browser complains ---------- */
function renderC22Warn(){return c22P('tli',
  'Everyone sees certificate warnings and most people click them away, because they do not understand what the browser is actually asking. Yet it is always one of three specific faults – and each means something different. <b>Expired.</b> The validity period ended. In the vast majority of cases it is an operational slip: someone forgot the renewal. The risk itself is small, but it is a warning sign about how the server is cared for – and it cannot be told apart from a certificate that expired because nobody administers the server any more. <b>Name mismatch.</b> The certificate is issued for a different domain than the one you asked for. This is the most serious of the three: it is exactly what an attempt to impersonate someone else’s server looks like. Sometimes it is only an administrator’s slip (a name variant is missing), but the two cannot be told apart from outside. <b>Unknown authority.</b> The certificate is signed by someone your device does not know – typically it is <b>self-signed</b>, that is signed by itself, or it comes from an internal company authority the device does not have on its list. Encryption in such a connection runs normally, but <b>authenticity is missing</b>: nothing guarantees the other side is who you expect. The practical rule for all three cases is the same: <b>never click a warning away where you log in or enter sensitive data</b>. And when the server is yours, do not teach users to click ‘proceed’ – learn to watch renewals instead.',
  [['self-signed','a certificate signed by itself; it encrypts, but nobody vouches for who is on the other side.'],['name mismatch','the certificate is for a different domain than you asked for – the most serious of the three warnings.']]);}
function mountC22Warn(){c22Mount('tli',[
  {glow:c22g('fw','--amber')+c22g('ca','--amber'),dyn:c22pkt('M 320 160 L 470 60','--amber','1.5s')+c22lbl('expired: usually a forgotten renewal','--amber'),cap:'<b>Expired</b>: the period ended, usually because someone forgot the renewal. Small risk, a loud signal about the care taken.'},
  {glow:c22g('pc','--red')+c22g('sw','--red')+c22g('fw','--red')+c22g('web','--red'),dyn:c22pkt('M 58 80 L 180 160 L 320 160 L 470 255','--red','2.1s')+c22lbl('name mismatch: this is what impersonation looks like','--red'),cap:'<b>Name mismatch</b>: the certificate is for another domain. This is what impersonating a server looks like – the most serious of the three.'},
  {glow:c22g('net','--red')+c22g('fw','--red')+c22g('web','--red'),dyn:c22pkt('M 600 160 L 320 160 L 470 255','--red','2.0s')+c22lbl('unknown authority: it encrypts but vouches for nothing','--red'),cap:'<b>Unknown authority</b> (often self-signed): encryption runs, but <b>authenticity is missing</b> – nobody vouches for the other side.'},
  {glow:c22g('dpi','--cyan')+c22g('fw','--cyan'),dyn:c22pkt('M 320 275 L 320 160','--cyan','1.2s')+c22lbl('at a login screen, warnings are not clicked away','--cyan'),cap:'A rule for all three: <b>do not click warnings away where you log in</b> or enter sensitive data.'}
]);}
/* ---------- L6M1 — Who trusts whom ---------- */
function renderC22Chain(){return c22P('tlj',
  'One question has hung in the air since the last lesson: <b>why do you trust the signature of an authority</b> you have never seen? The answer is called the <b>chain of trust</b> and rests on a simple idea: trust is not passed directly but link by link. At the start of the chain is a <b>root authority</b>. Its certificate is signed by itself and nobody vouches for it – it is trusted because your browser and operating system carry it in a <b>list of trusted authorities</b>. That list is the outcome of audits and rules; you do not maintain it, but you can add your own entries, which will matter shortly. A root authority does not sign ordinary certificates directly – its private key is too precious to be used daily. Instead it signs <b>intermediate authorities</b>, and those issue certificates to individual servers. A chain arises: the server certificate ← the intermediate authority ← the root. The browser walks the chain upward looking for a link it knows. When it finds one and all signatures match, the connection is verified. The practical consequence people trip over most in operations: <b>the server must also send the intermediate certificates</b>. When an administrator forgets to configure them, the chain breaks and some devices report an error while others – which happen to remember the intermediate from before – do not. Hence the classic line ‘it works for me’.',
  [['chain of trust','the server certificate ← an intermediate authority ← the root; the browser walks upward.'],['root authority','the start of the chain; trusted because it sits in the built-in list of the browser and system.']]);}
function mountC22Chain(){c22Mount('tlj',[
  {glow:c22g('fw','--blue')+c22g('ca','--blue'),dyn:c22pkt('M 320 160 L 470 60','--blue','1.5s')+c22lbl('a root authority: signed by itself','--blue'),cap:'At the start is a <b>root authority</b>. Its certificate is signed by itself and is trusted because it sits in the list.'},
  {glow:c22g('ca','--green')+c22g('fw','--green')+c22g('web','--green'),dyn:c22pkt('M 470 60 L 320 160 L 470 255','--green','2.0s')+c22lbl('the root signs an intermediate, that signs the server','--green'),cap:'The root does not sign servers directly. It signs an <b>intermediate authority</b>, and that issues the certificate to the server.'},
  {glow:c22g('pc','--cyan')+c22g('sw','--cyan')+c22g('fw','--cyan')+c22g('ca','--cyan'),dyn:c22pkt('M 58 80 L 180 160 L 320 160 L 470 60','--cyan','2.1s')+c22lbl('the browser walks the chain to a link it knows','--cyan'),cap:'The browser walks <b>up the chain</b> looking for a link it knows. When it finds one and the signatures match, the connection is verified.'},
  {glow:c22g('net','--red')+c22g('fw','--red'),dyn:c22pkt('M 600 160 L 320 160','--red','1.5s')+c22lbl('a missing intermediate → some devices report an error','--red'),cap:'When a server <b>does not send the intermediates</b>, the chain breaks. Some devices error, others do not – hence ‘it works for me’.'}
]);}
/* ---------- L6M2 — An internal company authority ---------- */
function renderC22Intca(){return c22P('tlk',
  'A company runs plenty of things unreachable from the internet: a switch’s web interface, an internal system, a print server, a test environment. A public authority will not issue them a certificate, because it has no way to verify a name that does not exist on the internet. So companies often run their own <b>certificate authority</b>. The principle is the same as with a public one: a root certificate is created, <b>distributed to all company devices</b> (typically by central management) and from then on internal certificates appear trustworthy to them. The reward is decent: internal services stop raising warnings, you stop teaching users to click errors away, and you also gain a way to issue certificates to devices and people, not just servers. But the price is real and it is fair to know it in advance. First, <b>the root’s private key is a crown jewel</b>: whoever steals it can impersonate any internal service and every company device will believe them. It must therefore be stored away from daily operations, ideally offline. Second, <b>it is extra work</b>: issuing, renewal, records, revocation – without automation it quickly becomes forgotten paperwork and certificates start expiring quietly. And third, <b>an internal root counts only at home</b>: a visitor or a customer does not have it on their device, so an internal authority must never be used for a service people reach from outside. For those a public authority remains the right choice.',
  [['internal authority','a company certificate authority for services that do not exist on the internet.'],['distributing the root','the root certificate is loaded onto company devices; nobody else has it.']]);}
function mountC22Intca(){c22Mount('tlk',[
  {glow:c22g('pc','--blue')+c22g('sw','--blue')+c22g('fw','--blue')+c22g('ca','--blue'),dyn:c22pkt('M 58 80 L 180 160 L 320 160 L 470 60','--blue','2.1s')+c22lbl('an own authority for services that are not outside','--blue'),cap:'A public authority cannot cover internal services – their names do not exist on the internet. So the company runs its <b>own authority</b>.'},
  {glow:c22g('pc2','--green')+c22g('sw','--green')+c22g('fw','--green')+c22g('ca','--green'),dyn:c22pkt('M 58 240 L 180 160 L 320 160 L 470 60','--green','2.1s')+c22lbl('the root is distributed to all company devices','--green'),cap:'The root certificate is <b>distributed to company devices</b>. From then on internal certificates look trustworthy to them.'},
  {glow:c22g('fw','--amber')+c22g('web','--amber'),dyn:c22pkt('M 320 160 L 470 255','--amber','1.4s')+c22lbl('the internal site stops raising warnings','--amber'),cap:'Internal interfaces stop raising warnings and you need not teach users to click errors away. That is the main reward.'},
  {glow:c22g('dpi','--red')+c22g('fw','--red'),dyn:c22pkt('M 320 275 L 320 160','--red','1.2s')+c22lbl('the price: the root private key is a crown jewel','--red'),cap:'The price: <b>the root private key is a crown jewel</b>, it is extra work – and outside it will not help you; there a public authority belongs.'}
]);}
/* ---------- L6M3 — When a certificate fails ---------- */
function renderC22Fail(){return c22P('tll',
  'A certificate is not something you set and forget. It fails, in three ways that differ in practice both in severity and in what can be done about them. The first and most common is <b>expiry</b>. A certificate has a limited validity and today it is deliberately being shortened – a shorter validity means smaller damage when something goes wrong. But an expired certificate means a broken service: users see a warning and applications that cannot click warnings away simply stop connecting. The defense is boring and effective: <b>automatic renewal</b> and watching the dates in monitoring, not in your head. The second failure is <b>a private key leak</b>. When an attacker obtains a server’s private key, they can impersonate that server and nobody notices – the certificate is valid, after all. This is the most serious case, because the encryption itself keeps working and what is missing is exactly what trust rests on. The third thing is <b>revocation</b>, declaring a certificate invalid before its period ends. It is used precisely after a key leak or when a service is retired. The problem with revocation is practical: the browser must somehow learn the certificate no longer counts, either by downloading a list of revoked certificates or by asking the authority. Both are slow and unreliable, so in practice much is left to the certificate expiring by itself. That is also why validity periods are short today: <b>a short validity beats a fast revocation</b>.',
  [['revocation','declaring a certificate invalid before its period ends; slow and unreliable in practice.'],['a private key leak','the most serious failure: an attacker can impersonate the server while the certificate stays valid.']]);}
function mountC22Fail(){c22Mount('tll',[
  {glow:c22g('fw','--amber')+c22g('ca','--amber'),dyn:c22pkt('M 320 160 L 470 60','--amber','1.5s')+c22lbl('expiry: the service breaks, apps stop connecting','--amber'),cap:'<b>Expiry</b> is the most common: users see a warning and applications that cannot click it away stop connecting.'},
  {glow:c22g('pc','--red')+c22g('sw','--red')+c22g('fw','--red')+c22g('ca','--red'),dyn:c22pkt('M 58 80 L 180 160 L 320 160 L 470 60','--red','2.1s')+c22lbl('a key leak: and the certificate stays valid','--red'),cap:'<b>A private key leak</b> is the most serious: an attacker can impersonate the server while the certificate stays valid.'},
  {glow:c22g('ca','--cyan')+c22g('fw','--cyan')+c22g('net','--cyan'),dyn:c22pkt('M 470 60 L 320 160 L 600 160','--cyan','2.0s')+c22lbl('revocation: invalidating before the period ends','--cyan'),cap:'<b>Revocation</b> invalidates a certificate early. But the browser must learn of it – and that is slow and unreliable.'},
  {glow:c22g('pc2','--green')+c22g('sw','--green')+c22g('fw','--green')+c22g('web','--green'),dyn:c22pkt('M 58 240 L 180 160 L 320 160 L 470 255','--green','2.1s')+c22lbl('hence short validity and automatic renewal','--green'),cap:'Hence today’s <b>short validity and automatic renewal</b>: a short validity beats a fast revocation.'}
]);}
/* ---------- L7M1 — An attacker on the endpoint ---------- */
function renderC22Endp(){return c22P('tlm',
  'This lesson is about the limits of encryption and we begin with the harshest: <b>encryption does not protect a compromised computer</b>. The reason is logical, not technical. Data is encrypted so that nobody reads it <b>on the path</b>. At both ends it must be readable, or it could not be used – the browser has to render the page, you have to see the message text. So whoever sits on the end device sees the same as you, and how perfect the cipher protecting the connection was makes no difference to them. The practical consequence is unpleasant. A compromised computer can log into internet banking, read the page content, record what the user types on the keyboard and send it away – inside a perfectly correct encrypted connection. Neither an IDS sensor nor a firewall on the path will see anything unusual, because from their view it is ordinary encrypted traffic on an ordinary port. Quite the opposite: encryption <b>helps</b> the attacker, because it hides what they are sending. That is exactly why the incident response course talked so much about metadata and flows – when you cannot see content, what is left is watching <b>who talks to whom and when</b>. Do not conclude from this that encryption is pointless, though. The conclusion is different and it is one of the main takeaways of the whole course: <b>encryption is one layer of defense, not the whole defense</b>. It protects data on the path perfectly and leaves everything else to endpoint protection, access control and monitoring.',
  [['endpoint','the device where data is decrypted; an attacker there sees the same as the user.'],['a layer of defense','encryption protects the path; it does not replace device protection, access control or monitoring.']]);}
function mountC22Endp(){c22Mount('tlm',[
  {glow:c22g('pc','--green')+c22g('sw','--green')+c22g('fw','--green')+c22g('web','--green'),dyn:c22pkt('M 58 80 L 180 160 L 320 160 L 470 255','--green','2.1s')+c22lbl('the path is protected perfectly','--green'),cap:'The path is protected perfectly: nobody reads the content on the cable. But at both ends it <b>must be readable</b>.'},
  {glow:c22g('pc','--red')+c22g('sw','--red'),dyn:c22pkt('M 58 80 L 180 160','--red','1.1s')+c22lbl('a compromised PC sees the same as the user','--red'),cap:'Whoever sits on a <b>compromised computer</b> sees the same as the user: the page content and the keystrokes.'},
  {glow:c22g('pc','--amber')+c22g('sw','--amber')+c22g('fw','--amber')+c22g('net','--amber'),dyn:c22pkt('M 58 80 L 180 160 L 320 160 L 600 160','--amber','2.1s')+c22lbl('and sends it out in a correctly encrypted connection','--amber'),cap:'And sends it out <b>in a correctly encrypted connection</b>. Neither sensor nor firewall on the path sees anything unusual.'},
  {glow:c22g('dpi','--cyan')+c22g('fw','--cyan'),dyn:c22pkt('M 320 275 L 320 160','--cyan','1.2s')+c22lbl('encryption is one layer of defense, not all of it','--cyan'),cap:'The conclusion: <b>encryption is one layer of defense, not the whole defense.</b> The rest is devices, access control and monitoring.'}
]);}
/* ---------- L7M2 — Decryption on the firewall ---------- */
function renderC22Insp(){return c22P('tln',
  'In the advanced security course you saw that <b>DPI</b> looks into packet contents and searches them for attacks. But when traffic is encrypted, DPI sees nothing but a jumble – and that is a problem for defense, because today almost everything is encrypted, including malware downloads and communication with an attacker’s control server. So companies reach for something called <b>TLS inspection</b>: the firewall <b>terminates the connection at itself</b>, decrypts the content, examines it, re-encrypts it and sends it on. For this to work, the firewall must produce its own certificate for every site visited – and for browsers to accept it, company devices must be set to trust the <b>internal authority</b> from the previous lesson. Yes, this is precisely what textbooks call a man-in-the-middle attack, only operated by your own company and with the device owner’s consent. The price is high and it is fair to list it. <b>Privacy:</b> the firewall sees the content of all employee communication, including banking and health data; sensitive categories are therefore commonly excluded from inspection. <b>Risk:</b> the firewall becomes the place where the company’s whole traffic exists in the clear – and its compromise is a catastrophe. <b>Operations:</b> some applications refuse inspection because they check which certificate they received. And <b>performance:</b> decrypting and re-encrypting everything costs a lot. A sensible deployment therefore turns inspection on <b>selectively</b>, not across the board.',
  [['TLS inspection','the firewall terminates the connection, examines the content and re-encrypts it; it needs an internal authority.'],['selectively, not universally','inspection is enabled only where it makes sense; sensitive categories are excluded.']]);}
function mountC22Insp(){c22Mount('tln',[
  {glow:c22g('pc','--blue')+c22g('sw','--blue')+c22g('fw','--blue'),dyn:c22pkt('M 58 80 L 180 160 L 320 160','--blue')+c22lbl('the connection ends at the firewall, not at the site','--blue'),cap:'With <b>TLS inspection</b> the connection does not end at the site but <b>at the firewall</b>. It decrypts and looks inside.'},
  {glow:c22g('fw','--green')+c22g('net','--green'),dyn:c22pkt('M 320 160 L 600 160','--green','1.5s')+c22lbl('the firewall opens a second connection outward','--green'),cap:'The firewall then opens a <b>second connection</b> outward and passes the data on. The browser gets a certificate made by the firewall.'},
  {glow:c22g('dpi','--amber')+c22g('fw','--amber')+c22g('net','--amber'),dyn:c22pkt('M 320 275 L 320 160 L 600 160','--amber','2.0s')+c22lbl('only now can DPI see content and find an attack','--amber'),cap:'Only now does <b>DPI see the content</b> and can find a malicious file or communication with the attacker’s control server.'},
  {glow:c22g('fw','--red')+c22g('web','--red'),dyn:c22pkt('M 320 160 L 470 255','--red','1.4s')+c22lbl('the price: privacy, performance, a firewall in the clear','--red'),cap:'The price is high: <b>privacy</b>, performance, refusing applications – and a firewall holding all traffic in the clear. Hence selectively.'}
]);}
/* ---------- L7M3 — Metadata and traffic analysis ---------- */
function renderC22Meta(){return c22P('tlo',
  'We reached metadata in the very first lesson; now it is time to show how strong it is. When the content is encrypted, what remains is observing the <b>traffic pattern</b>: who connects to whom, how often, at what time, how long a connection lasts and how much data flows in each direction. A surprising amount follows. Short regular connections every few minutes to the same address look like communication with an attacker’s control server, even though you cannot read a single letter of them. A long connection with a large volume <b>outward</b> in the middle of the night looks like data being sent away. A new pair, ‘this computer talks to that server’, never seen in the network before, looks like an attacker moving. And third: which <b>name</b> the client asked for is often visible at the start of a connection, and DNS queries are visible almost always. The key insight is that this view is available to you exactly as it is to an attacker: the <b>connections overview</b> in the simulator shows precisely what anyone on the path sees. It cuts both ways. For defense it is good news – even in a fully encrypted network a great deal can be detected without decrypting anything, and it is far cheaper and less invasive than TLS inspection. For privacy it is bad news: encrypting content <b>is not anonymity</b>. Whoever sees your traffic knows who you talk to and when – and that is often half the story.',
  [['traffic pattern','the frequency, timing, duration and volume of connections; detection works without reading content.'],['encryption is not anonymity','the content is hidden, but the map of who talks to whom and when stays readable.']])
  +courseCTA('tloTask','Find the connection that does not belong in encrypted traffic from the pattern and metadata alone: the task ‘Catch the C2 channel on the IPS’.','Open the task');}
function mountC22Meta(){c22Mount('tlo',[
  {glow:c22g('pc','--amber')+c22g('sw','--amber')+c22g('fw','--amber')+c22g('net','--amber'),dyn:c22pkt('M 58 80 L 180 160 L 320 160 L 600 160','--amber','1.2s')+c22lbl('short regular connections to the same address','--amber'),cap:'Short <b>regular</b> connections every few minutes to the same address look like an attacker’s control channel – without reading content.'},
  {glow:c22g('pc2','--blue')+c22g('sw','--blue')+c22g('fw','--blue')+c22g('web','--blue'),dyn:c22pkt('M 58 240 L 180 160 L 320 160 L 470 255','--blue','2.1s')+c22lbl('a new pair never seen in the network before','--blue'),cap:'A <b>new pair</b> – ‘this computer talks to that server’ – looks like an attacker moving. The connections overview shows it.'},
  {glow:c22g('net','--red')+c22g('fw','--red')+c22g('web','--red'),dyn:c22pkt('M 600 160 L 320 160 L 470 255','--red','2.0s')+c22lbl('volume and timing: a big upload in the night','--red'),cap:'<b>Volume and timing</b> reveal a lot: a long connection sending a lot outward in the middle of the night looks like a data leak.'},
  {glow:c22g('dpi','--cyan')+c22g('fw','--cyan'),dyn:c22pkt('M 320 275 L 320 160','--cyan','1.2s')+c22lbl('encrypting the content is not anonymity','--cyan'),cap:'Good news for defense, bad for privacy: <b>encrypting content is not anonymity</b>. The map of connections stays readable.'}
]);
  var b=$('tloTask');if(b)b.onclick=function(){courseTry('c2-dns');};
}
/* ---------- L8M1 — What to encrypt first ---------- */
function renderC22Prio(){return c22P('tlp',
  'Encrypting absolutely everything at once is not feasible – or rather it is, but in a real company it means months of work and a series of broken things along the way. So you start where the ratio of benefit to effort is best. <b>First comes device administration.</b> Logging into switches, routers, firewalls and servers is among the most valuable things in a network: whoever captures it gains administrator access outright. Telnet is therefore replaced by <b>SSH</b>, web interfaces switch to https, and the old administration is turned off, not merely ‘not used’. <b>Second are passwords and logins in general.</b> Every form where a user enters a name and password must run over https – including inside the company network, because an attacker inside is still the most common scenario. <b>Third are backups and data transfers.</b> A backup is a copy of everything valuable in one place; when it travels the network in the clear or lies unencrypted on a disk, it is the cheapest possible target. And <b>fourth is anything crossing someone else’s network</b>: branches, working from home, public Wi-Fi. VPN belongs there, or at least consistent https. A useful shortcut for deciding: <b>rank services by what capturing them would give an attacker</b> and start at the top. Not by what is easiest to encrypt – that is the road to a beautifully secured print server and Telnet on the main switch.',
  [['SSH','the encrypted replacement of Telnet for device administration; the old one is turned off, not just unused.'],['order by benefit','rank services by what capturing them would give an attacker and start at the top.']]);}
function mountC22Prio(){c22Mount('tlp',[
  {glow:c22g('pc','--blue')+c22g('sw','--blue')+c22g('fw','--blue'),dyn:c22pkt('M 58 80 L 180 160 L 320 160','--blue')+c22lbl('device administration: SSH and https, not Telnet','--blue'),cap:'<b>Device administration</b> comes first: whoever captures it gains administrator access. Telnet out, SSH and https in.'},
  {glow:c22g('pc','--green')+c22g('sw','--green')+c22g('fw','--green')+c22g('web','--green'),dyn:c22pkt('M 58 80 L 180 160 L 320 160 L 470 255','--green','2.1s')+c22lbl('passwords and logins – inside the company too','--green'),cap:'<b>Passwords and logins</b> belong on https inside the company too: an attacker inside the network is still the most common case.'},
  {glow:c22g('fw','--amber')+c22g('ca','--amber'),dyn:c22pkt('M 320 160 L 470 60','--amber','1.5s')+c22lbl('backups: a copy of everything valuable in one place','--amber'),cap:'<b>Backups</b> are a copy of everything valuable in one place. An unencrypted backup is the cheapest possible target.'},
  {glow:c22g('pc2','--cyan')+c22g('sw','--cyan')+c22g('fw','--cyan')+c22g('net','--cyan'),dyn:c22pkt('M 58 240 L 180 160 L 320 160 L 600 160','--cyan','2.1s')+c22lbl('and anything crossing someone else’s network','--cyan'),cap:'And <b>anything crossing someone else’s network</b>: branches, home office, public Wi-Fi. VPN belongs there, or consistent https.'}
]);}
/* ---------- L8M2 — Common mistakes ---------- */
function renderC22Mist(){return c22P('tlq',
  'Mistakes in encryption share one property: <b>they look like everything is done</b>. The address starts with https, the padlock is on, nobody complains – and yet the protection does not work the way everyone assumes. Four of the most common deserve naming. <b>A self-signed certificate in production.</b> It usually appears during a test and nobody ever replaces it. Encryption runs, but users learn to click warnings away – and with that, protection against server impersonation is practically abolished, because nobody would recognize the fraud any more. <b>A forgotten renewal.</b> The certificate expires quietly over the weekend and on Monday morning an application nobody thought of stops working. The fix is automatic renewal and watching the dates in monitoring, not in one person’s calendar. <b>Encryption only from outside.</b> A classic: the site has beautiful https from the internet, but behind the firewall traffic to the application server goes in the clear, administration runs over Telnet and the database talks unencrypted. An attacker inside suddenly has everything – exactly why the Zero Trust course insists the internal network is not a safe zone. And <b>old versions and weak ciphers</b>: a server with obsolete protocols enabled for years offers an attacker a way to push the connection down to something weaker. The check is boring but quick: <b>go through what the server offers and turn off what does not belong</b>.',
  [['self-signed in production','it appears in a test and stays; users learn to click warnings away and then miss a fraud.'],['encryption only from outside','https from the internet, but traffic in the clear inside, Telnet and an unencrypted database.']]);}
function mountC22Mist(){c22Mount('tlq',[
  {glow:c22g('fw','--red')+c22g('web','--red'),dyn:c22pkt('M 320 160 L 470 255','--red','1.4s')+c22lbl('self-signed in production: users click it away','--red'),cap:'<b>Self-signed in production</b>: encryption runs, but users learn to click warnings away – and then miss a fraud.'},
  {glow:c22g('fw','--amber')+c22g('ca','--amber'),dyn:c22pkt('M 320 160 L 470 60','--amber','1.5s')+c22lbl('a forgotten renewal: on Monday something is down','--amber'),cap:'<b>A forgotten renewal</b>: the certificate expires over the weekend and on Monday an app nobody thought of is down.'},
  {glow:c22g('pc','--blue')+c22g('sw','--blue')+c22g('fw','--blue')+c22g('web','--blue'),dyn:c22pkt('M 58 80 L 180 160 L 320 160 L 470 255','--blue','2.1s')+c22lbl('https outside, but Telnet and clear data inside','--blue'),cap:'<b>Encryption only from outside</b>: https from the internet, but Telnet and an unencrypted database inside. An attacker inside has it all.'},
  {glow:c22g('dpi','--cyan')+c22g('fw','--cyan'),dyn:c22pkt('M 320 275 L 320 160','--cyan','1.2s')+c22lbl('old versions and weak ciphers: check the offer','--cyan'),cap:'<b>Old versions and weak ciphers</b> offer a way to push a connection down. Go through what the server offers and turn off the rest.'}
]);}
/* ---------- L8M3 — A checklist ---------- */
function renderC22Check(){return c22P('tlr',
  'To close the course, let us sum encryption into a list you can walk in a few minutes and that tells you where you stand <b>today</b>. <b>Does device administration run encrypted only?</b> Check that Telnet is off, not merely unused, and that web interfaces go over https. This is the one item you must not postpone. <b>Is https everywhere a password is entered?</b> Including internal applications – an attacker inside the network is the most common scenario. <b>Do you know when your certificates expire?</b> If the answer is ‘someone watches it’, then nobody watches it; it belongs in monitoring together with automatic renewal. <b>Are the certificates from an authority the devices really trust?</b> Self-signed in production teaches users to click warnings away and thereby cancels the protection against fraud. <b>Are passwords stored as a salted fingerprint?</b> Nowhere should they lie in the clear, nor as a bare unsalted fingerprint; passwords belong in bcrypt or argon2, not MD5 and SHA-1. <b>Do you encrypt inside as well?</b> Walk the path from the user to the database and look for a stretch where data is in the clear. <b>Do you know what your metadata reveals?</b> Open the connections overview and look at the ‘who talks to whom’ pairs – you see exactly what an attacker sees. And a last question people do not ask: <b>what would you see if someone were listening on your cable right now?</b> Try capturing on a link and walk the traffic. If you find a legible password there, you have the first item of the plan – and you know where to start.',
  [['a checklist','a few questions walked calmly that show where encryption is missing in your network.'],['turn off, not merely unuse','unencrypted services are turned off on the device; ‘we do not use it’ is not a setting.']])
  +courseCTA('tlrTask','Ban unencrypted administration in the network and verify Telnet logins no longer work: the task ‘Block Telnet’.','Open the task');}
function mountC22Check(){c22Mount('tlr',[
  {glow:c22g('pc','--green')+c22g('sw','--green')+c22g('fw','--green')+c22g('web','--green'),dyn:c22pkt('M 58 80 L 180 160 L 320 160 L 470 255','--green','2.1s')+c22lbl('is https everywhere a password is entered?','--green'),cap:'<b>Is https everywhere a password is entered?</b> Including internal applications – an attacker inside is the most common scenario.'},
  {glow:c22g('pc2','--blue')+c22g('sw','--blue')+c22g('fw','--blue'),dyn:c22pkt('M 58 240 L 180 160 L 320 160','--blue')+c22lbl('does administration run only over SSH and https?','--blue'),cap:'<b>Does administration run encrypted only?</b> Telnet should be <b>off</b>, not merely unused. Do not postpone this item.'},
  {glow:c22g('fw','--amber')+c22g('ca','--amber'),dyn:c22pkt('M 320 160 L 470 60','--amber','1.5s')+c22lbl('do you know when your certificates expire?','--amber'),cap:'<b>Do you know when your certificates expire?</b> If the answer is ‘someone watches it’, nobody does. It belongs in monitoring.'},
  {glow:c22g('pc','--cyan')+c22g('sw','--cyan')+c22g('fw','--cyan')+c22g('net','--cyan'),dyn:c22pkt('M 58 80 L 180 160 L 320 160 L 600 160','--cyan','2.1s')+c22lbl('what would a listener on your cable see right now?','--cyan'),cap:'And last: <b>what would a listener on your cable see right now?</b> Try a capture – a legible password is the first task for your plan.'}
]);
  var b=$('tlrTask');if(b)b.onclick=function(){courseTry('block-telnet');};
}

/* ---------- L3M1 — The pairs you must know ---------- */
function c22Pair(ttl,ttlc,ins,insSub,sec,secSub,n1,n2){
  return c22Ttl(ttl,ttlc)
    +c22Card(46,58,240,64,'--red',ins,insSub)
    +c22Arr(320,96,'→','--muted')
    +c22Card(354,58,240,64,'--green',sec,secSub)
    +c22Note(160,n1,'--red')+c22Note(184,n2,'--green');
}
function renderC22Pairs(){return c22TP('tly',
  'Most network services come in two forms: an older one that sends everything in plain text, and a newer one that wraps the same thing in encryption. The simulator knows this split – when you send an unencrypted service in a path test, it warns you and suggests the replacement right away. To make that make sense, let us walk the six pairs you meet most often. <b>HTTP (port 80) → HTTPS (443)</b>: the web. Over HTTP an attacker on the cable would see the whole page and the password you typed into a form. <b>FTP (21) → SFTP or FTPS</b>: file transfer. Over FTP the name, the password and the content of every transferred file are visible. <b>Telnet (23) → SSH (22)</b>: remote device administration. Over Telnet the login and every command you type on the router are visible – the keys to the network, in other words. <b>SMTP (25) → SMTPS, or STARTTLS</b>: sending mail. Over bare SMTP the sender, the recipient and the whole body of the email are visible. <b>LDAP (389) → LDAPS (636)</b>: queries into the company directory. Over LDAP the name and password of the account an application signs in with are visible, plus the answers about users. <b>SNMP v1 and v2c (161) → SNMPv3</b>: device monitoring. The older versions send only a ‘community’ string in the clear instead of a password, and whoever captures it can query the device themselves. One closing point, because it is confused over and over: <b>a port encrypts nothing by itself</b>. The number 443 is merely an agreed habit for where TLS-protected web tends to live – TLS encrypts, not the port. You can happily run an unencrypted service on 443 and it stays as legible as before.',
  [['the unencrypted variant','the older form of a service that sends name, password and content in plain text.'],['SFTP','file transfer inside an SSH connection; the replacement for FTP, running on port 22.'],['LDAPS','directory queries wrapped in TLS (port 636) instead of plain LDAP on 389.'],['SNMPv3','the SNMP version with real authentication and encryption; older v1/v2c have only a legible community.'],['port','the number that identifies a service – it encrypts nothing itself; TLS or SSH does.']]);}
function mountC22Pairs(){c22TMount('tly',[
  {dyn:c22Pair('the web: HTTP versus HTTPS','--blue',
    'HTTP · 80','the web in plain text','HTTPS · 443','the same web inside TLS',
    'a listener on the cable: the whole page and the form password',
    'with encryption only the server address and volume remain'),
   cap:'<b>HTTP → HTTPS.</b> Over HTTP a listener on the cable would see the whole page and the password you typed into the form.'},
  {dyn:c22Pair('remote administration: Telnet versus SSH','--red',
    'Telnet · 23','login and commands in the clear','SSH · 22','encrypted device administration',
    'a listener: the admin password and every router command',
    'start with this pair – these are the keys to the network'),
   cap:'<b>Telnet → SSH.</b> Over Telnet the login and every router command are visible – the keys to the whole network.'},
  {dyn:c22Pair('file transfer: FTP versus SFTP','--amber',
    'FTP · 21','name, password and file content','SFTP / FTPS','transfer inside SSH or TLS',
    'a listener: the login and the whole transferred file',
    'SFTP runs inside SSH, FTPS is FTP wrapped in TLS'),
   cap:'<b>FTP → SFTP or FTPS.</b> Over FTP the name, the password and the content of every transferred file are visible.'},
  {dyn:c22Pair('mail and directory: SMTP and LDAP','--violet',
    'SMTP · 25 / LDAP · 389','emails and directory queries','SMTPS / LDAPS · 636','the same wrapped in TLS',
    'a listener: the email body and the directory account password',
    'with SMTP, STARTTLS is often used instead of another port'),
   cap:'<b>SMTP → SMTPS</b> and <b>LDAP → LDAPS.</b> Over bare SMTP the whole email is visible, over LDAP the password of the account querying the directory.'},
  {dyn:c22Pair('device monitoring: SNMP versus SNMPv3','--cyan',
    'SNMP v1 / v2c · 161','a community string instead of a password','SNMPv3','real authentication and encryption',
    'a listener captures the community and queries the device',
    'and a port encrypts nothing: 443 is habit, TLS encrypts'),
   cap:'<b>SNMP → SNMPv3.</b> And above all: <b>a port encrypts nothing by itself.</b> 443 is merely an agreed habit – TLS encrypts, not the number.'}
]);}
/* ---------- L3M2 — How to tell what runs in your network ---------- */
function renderC22Detect(){return c22P('tlz',
  'Knowing which protocols have a secure variant is half the job. The other half is finding out what runs in your network <b>right now</b> – because an unencrypted service does not announce itself. There are two routes and you can try both right here in the app. The first is <b>by port</b>. Most services sit on their usual number, so when a path test or a list of open ports shows 23, that is almost certainly Telnet; 21 is FTP, 161 SNMP, 389 LDAP. It is a quick overview, but not proof: a service can be run on any port and occasionally someone does. The second route is <b>by behavior</b>, that is, by what the traffic actually reveals. When a legible name and password show up in a capture, the port it ran on does not matter – it is unencrypted. And here the app helps you on its own, in two places. In the <b>path test</b> a warning with the recommended replacement appears for an unencrypted service, so you need not recall anything. And in the <b>capture on a link</b> (right-click a link) legible traffic is marked, so you see at a glance which stretch of the path is open. One case deserves special mention, because the port will not reveal it: <b>STARTTLS</b>. The connection starts on the same, unencrypted port (typically SMTP on 25) and only then do both sides agree to switch to an encrypted form. When all is well, traffic is unreadable from that moment on. But if the other side does not offer encryption, or someone strips it on the way, the switch simply does not happen – and the mail goes on in plain text. That is why STARTTLS is configured to rather not send at all without encryption.',
  [['STARTTLS','a connection starts unencrypted on the ordinary port and only then switches to TLS; if the switch fails, traffic goes in the clear.'],['path test','the app tool that sends traffic from A to B and reports where it went and what is wrong with it.'],['capture on a link','right-click a link → Capture traffic; legible traffic gets marked there.']]);}
function mountC22Detect(){c22Mount('tlz',[
  {glow:c22g('pc','--blue')+c22g('sw','--blue')+c22g('fw','--blue')+c22g('web','--blue'),dyn:c22pkt('M 58 80 L 180 160 L 320 160 L 470 255','--blue','2.1s')+c22lbl('by port: 23 is Telnet, 21 FTP, 389 LDAP','--blue'),cap:'<b>By port</b>: 23 is almost certainly Telnet, 21 FTP, 161 SNMP, 389 LDAP. A quick overview, but no proof – another port can be chosen.'},
  {glow:c22g('pc2','--red')+c22g('sw','--red')+c22g('fw','--red'),dyn:c22pkt('M 58 240 L 180 160 L 320 160','--red','1.7s')+c22lbl('the path test flags an unencrypted service itself','--red'),cap:'In the <b>path test</b> an unencrypted service gets a warning with the recommended replacement. You need not memorize the pairs.'},
  {glow:c22g('dpi','--amber')+c22g('fw','--amber')+c22g('sw','--amber'),dyn:c22pkt('M 320 275 L 320 160 L 180 160','--amber','1.6s')+c22lbl('capture on a link: legible traffic gets marked','--amber'),cap:'<b>By behavior</b>: right-click a link → Capture traffic. Legible traffic is marked, so you see which stretch is open.'},
  {glow:c22g('web','--violet')+c22g('fw','--violet')+c22g('net','--violet'),dyn:c22pkt('M 470 255 L 320 160 L 600 160','--violet','2.0s')+c22lbl('STARTTLS: same port, encryption turns on later','--violet'),cap:'<b>STARTTLS</b> is the special case: the same port, encryption switched on later. If it is not switched on, traffic goes on in the clear.'}
]);}
/* ---------- L3M3 — Migration without an outage ---------- */
function renderC22Migr(){return c22P('tl0',
  'When you find an unencrypted service in the network, the question is what to do with it. The answer ‘we will ban it on Friday afternoon’ sounds decisive and is the fastest way to make yourself weekend work. A secure variant is rolled out in an <b>order that cuts nobody off</b>, and that order has four steps. First <b>turn on the secure variant alongside the old one</b>. SSH can be enabled on a router without turning Telnet off; https runs on a different port than http. So both will run at once for a while, and that is fine – it is a temporary state, not the target. Then <b>verify the new path really works</b>: sign in over it, transfer a file, try it from where the others normally connect too. This is where a missing certificate or a firewall that does not pass the new port usually shows up. Only then <b>switch clients and applications</b> to the new variant; this step takes longest, because there is always a script or a printer nobody thought of. And <b>only at the very end ban the old service</b> – turn it off on the device and add a firewall rule so the unencrypted port cannot be used even by accident. Why the reverse order hurts is easy to work out. If you turn Telnet off first and only then find SSH was never configured on that device, you have just shut yourself out of a room whose handle is on the inside. With a remote router that means a drive. So in administration you never remove the last working access before the new one is tested. Try that last step in the simulator now on the task ‘Block Telnet’: unencrypted administration should be banned so that a Telnet login to the device really does not work.',
  [['migration','a gradual move from an old service to a new one so users are not left cut off.'],['running side by side','the temporary state with both variants running; it should end by turning the old one off.'],['locking yourself out','turning off the last working access before the new one is tested – with a remote device that means a trip.']])
  +courseCTA('tl0Task','Try the last step of the migration: ban unencrypted administration and verify a Telnet login really fails – the task ‘Block Telnet’.','Open the task');}
function mountC22Migr(){c22Mount('tl0',[
  {glow:c22g('pc','--green')+c22g('sw','--green'),dyn:c22pkt('M 58 80 L 180 160','--green','1.1s')+c22lbl('1. turn the secure variant on beside the old one','--green'),cap:'<b>1. Turn the secure variant on alongside.</b> SSH can be enabled without turning Telnet off. Running both is temporary, not the target.'},
  {glow:c22g('pc','--blue')+c22g('sw','--blue')+c22g('fw','--blue')+c22g('web','--blue'),dyn:c22pkt('M 58 80 L 180 160 L 320 160 L 470 255','--blue','2.1s')+c22lbl('2. verify the new path really works','--blue'),cap:'<b>2. Verify the new path.</b> Sign in, transfer a file, try it from elsewhere. A missing certificate or a closed firewall port shows up here.'},
  {glow:c22g('pc2','--amber')+c22g('sw','--amber')+c22g('fw','--amber')+c22g('net','--amber'),dyn:c22pkt('M 58 240 L 180 160 L 320 160 L 600 160','--amber','2.1s')+c22lbl('3. switch clients and applications over','--amber'),cap:'<b>3. Switch clients and applications.</b> This step takes longest – there is always a script or a printer nobody thought of.'},
  {glow:c22g('fw','--red')+c22g('sw','--red')+c22g('dpi','--red'),dyn:c22pkt('M 320 160 L 180 160','--red','1.3s')+c22lbl('4. only now ban the old service','--red'),cap:'<b>4. Only now ban the old service.</b> The reverse locks you out: you turn Telnet off and find SSH was never set up. With a remote router that is a drive.'}
]);
  var b=$('tl0Task');if(b)b.onclick=function(){courseTry('block-telnet');};
}

const COURSE_22_DEF = {
  id:'course22',
title:'Encryption in the network: what it hides and what not',
  blurb:'From the Caesar cipher and frequency analysis to today: what is visible on the cable and what encryption really hides, three properties (confidentiality, integrity, authenticity), symmetric and asymmetric ciphers and why they are used together, password hashing with salt and pepper, the TLS handshake step by step, what a certificate holds and why the browser complains, the chain of trust and an internal company authority, the limits of encryption (a compromised computer, firewall decryption, metadata) and the practical order of what to encrypt first.',
  lessons:[
    { id:'c22l1', title:'From Caesar to today', taskId:null, quizId:'c22q_l1', modules:[
      { id:'c22l1m1', title:'The Caesar cipher', render:renderC22Caesar, mount:mountC22Caesar },
      { id:'c22l1m2', title:'Why hand ciphers fall', render:renderC22Freq, mount:mountC22Freq },
      { id:'c22l1m3', title:'Hide or encrypt', render:renderC22Steg, mount:mountC22Steg }
    ]},
    { id:'c22l2', title:'Why encrypt', taskId:'wiretap', quizId:'c22q_l2', modules:[
      { id:'c22l2m1', title:'What is visible on the cable', render:renderC22Wire, mount:mountC22Wire },
      { id:'c22l2m2', title:'What encryption solves and what not', render:renderC22What, mount:mountC22What },
      { id:'c22l2m3', title:'Three properties', render:renderC22Three, mount:mountC22Three }
    ]},
    { id:'c22l3', title:'Unencrypted protocols and their replacements', taskId:'block-telnet', quizId:'c22q_l3', modules:[
      { id:'c22l3m1', title:'The pairs you must know', render:renderC22Pairs, mount:mountC22Pairs },
      { id:'c22l3m2', title:'How to tell what runs in your network', render:renderC22Detect, mount:mountC22Detect },
      { id:'c22l3m3', title:'Migration without an outage', render:renderC22Migr, mount:mountC22Migr }
    ]},
    { id:'c22l4', title:'How it works without the math', taskId:null, quizId:'c22q_l4', modules:[
      { id:'c22l4m1', title:'The symmetric cipher', render:renderC22Sym, mount:mountC22Sym },
      { id:'c22l4m2', title:'The asymmetric cipher', render:renderC22Asym, mount:mountC22Asym },
      { id:'c22l4m3', title:'Why they are used together', render:renderC22Both, mount:mountC22Both }
    ]},
    { id:'c22l5', title:'Hashing: a fingerprint, not a cipher', taskId:null, quizId:'c22q_l5', modules:[
      { id:'c22l5m1', title:'A fingerprint with no way back', render:renderC22Hash, mount:mountC22Hash },
      { id:'c22l5m2', title:'Salt and pepper', render:renderC22Salt, mount:mountC22Salt },
      { id:'c22l5m3', title:'A fingerprint as an integrity check', render:renderC22Integ, mount:mountC22Integ }
    ]},
    { id:'c22l6', title:'TLS in practice', taskId:null, quizId:'c22q_l6', modules:[
      { id:'c22l6m1', title:'What happens when you open https', render:renderC22Hand, mount:mountC22Hand },
      { id:'c22l6m2', title:'What a certificate holds', render:renderC22Cert, mount:mountC22Cert },
      { id:'c22l6m3', title:'Why the browser complains', render:renderC22Warn, mount:mountC22Warn }
    ]},
    { id:'c22l7', title:'Certificates and authorities', taskId:null, quizId:'c22q_l7', modules:[
      { id:'c22l7m1', title:'Who trusts whom', render:renderC22Chain, mount:mountC22Chain },
      { id:'c22l7m2', title:'An internal company authority', render:renderC22Intca, mount:mountC22Intca },
      { id:'c22l7m3', title:'When a certificate fails', render:renderC22Fail, mount:mountC22Fail }
    ]},
    { id:'c22l8', title:'Where encryption is not enough', taskId:'tls-blind', quizId:'c22q_l8', modules:[
      { id:'c22l8m1', title:'An attacker on the endpoint', render:renderC22Endp, mount:mountC22Endp },
      { id:'c22l8m2', title:'Decryption on the firewall', render:renderC22Insp, mount:mountC22Insp },
      { id:'c22l8m3', title:'Metadata and traffic analysis', render:renderC22Meta, mount:mountC22Meta }
    ]},
    { id:'c22l9', title:'Practice and summary', taskId:null, quizId:'c22q_l9', modules:[
      { id:'c22l9m1', title:'What to encrypt first', render:renderC22Prio, mount:mountC22Prio },
      { id:'c22l9m2', title:'Common mistakes', render:renderC22Mist, mount:mountC22Mist },
      { id:'c22l9m3', title:'A checklist', render:renderC22Check, mount:mountC22Check }
    ]}
  ]
};
const COURSE_22_QUIZZES_DEF = {
  c22q_l1:{ title:'Quiz: From Caesar to today', qs:[
    { q:'What is the key in the Caesar cipher?',
      opts:['a table in which a chosen replacement is written down for every letter','a number saying how many places each letter is shifted in the alphabet','a word the message is padded with at the start and the end to one length'],
      correct:1, why:'The procedure (shift the letters) is separate from the key (by how much). But there are only twenty-five keys, so all can be tried on paper.' },
    { q:'Why does a substitution cipher break to frequency analysis?',
      opts:['because it preserves letter frequencies and only swaps their labels – the most common stays the most common','because at least a part of the original word always seeps into the encrypted text','because the key is a single number and there are therefore only twenty-five options'],
      correct:0, why:'In Czech the most common are E, A and O, in English E, T and A. A modern cipher avoids this: the output looks like even noise and statistics pulls nothing out.' },
    { q:'What does it mean that security must not rest on hiding the procedure?',
      opts:['that a cipher’s procedure is published and left to be attacked, while only the key should be secret','that the procedure should change with every message so an attacker cannot reuse it','that the key is split between two people so neither of them knows the whole of it'],
      correct:0, why:'A procedure leaks sooner or later – a device is stolen or someone works it out. A cipher nobody has seen is no proof of safety but a warning sign.' },
    { q:'How does steganography differ from encryption?',
      opts:['it hides the very fact a message exists, while encryption hides only its content','it changes the message content with a key, while encryption merely wraps it in another file','it protects the message on the path, while encryption protects it on the target device'],
      correct:0, why:'Anyone serious uses both: encrypt the message first and only then hide it. Attackers use this to get data out and are spotted mainly by metadata and volume.' }
  ]},
  c22q_l2:{ title:'Quiz: Why encrypt', qs:[
    { q:'What do you see when you capture a link carrying Telnet traffic?',
      opts:['only the sender and recipient addresses, since command content goes on a separate channel','the name, the password and every typed command, as Telnet sends all in plain text','only the start of the session, because after login the traffic switches to an encrypted form'],
      correct:1, why:'HTTP and FTP are the same. Try a capture with a right-click on a link → Capture traffic; an attacker only needs to be on the path the data flows.' },
    { q:'What does encrypting traffic not hide?',
      opts:['the message content and passwords typed into a form, if the attacker sits on a device along the path','metadata: who talked to whom, when, how long and how much moved – addresses must stay readable','the server’s reply, because unlike the client’s request it is always transferred in the clear'],
      correct:1, why:'Addresses must be readable to every switch and router, or the packet could not arrive. Metadata alone reveals much without a single byte being read.' },
    { q:'Which property does the check value computed for a message provide?',
      opts:['integrity: if someone changes the content on the way, the value no longer matches and it is discarded','confidentiality: the content becomes a jumble nobody can read anything from without the key','authenticity: it confirms the other side of the connection really is the server you typed'],
      correct:0, why:'There are three properties: confidentiality (nobody reads), integrity (nobody changes unnoticed) and authenticity (you talk to the right party). Each comes from a different part.' },
    { q:'Why is authenticity as important as confidentiality?',
      opts:['because without it encrypted traffic travels considerably slower and connections often break before a reply can be transferred','because a perfectly encrypted conversation with an attacker merely posing as the server helps you not at all','because otherwise the browser could not pick which of the offered ciphers to finally use for the connection'],
      correct:1, why:'Authenticity is exactly what certificates address. So for every connection you ask three questions: can anyone read it, change it, and who am I talking to?' }
  ]},
  c22q_l3:{ title:'Quiz: Unencrypted protocols', qs:[
    { q:'What is the secure replacement for FTP?',
      opts:['SFTP or FTPS – file transfer inside an SSH connection or wrapped in TLS','FTP on another port, since changing the port number encrypts the traffic','SNMPv3, because that one replaces all older unencrypted protocols at once'],
      correct:0, why:'Over bare FTP the name, password and content of every transferred file are visible. SFTP runs inside SSH, FTPS is FTP wrapped in TLS.' },
    { q:'The app flags an unencrypted service running on port 443. How is that possible?',
      opts:['a port is just a service number and encrypts nothing – TLS above it does','an unencrypted service cannot run on port 443, so the app must be mistaken','the traffic really is encrypted, the app only sees it after the test finishes'],
      correct:0, why:'The number 443 is merely an agreed habit for TLS-protected web. TLS encrypts, not the port – an unencrypted service there stays as legible as before.' },
    { q:'What makes STARTTLS special compared with SMTPS?',
      opts:['the connection starts on the same unencrypted port and switches to TLS later','it uses its own port where the traffic is encrypted from the very first packet','it encrypts only the email attachments and leaves the headers in the clear'],
      correct:0, why:'That is why STARTTLS cannot be spotted by port. And if the other side does not offer encryption, or someone strips it, the switch fails and mail goes in the clear.' },
    { q:'How do you replace Telnet on a remote router without losing access to it?',
      opts:['you enable SSH alongside, verify the login and ban Telnet only after that','you ban Telnet and enable SSH right after, so clear access does not last long','you reboot the router, enable SSH at startup and never enable Telnet again'],
      correct:0, why:'You never remove the last working access before the new one is tested. Otherwise you shut yourself out of a room whose handle is inside – and you drive there.' }
  ]},
  c22q_l4:{ title:'Quiz: How it works', qs:[
    { q:'What is the main weakness of a symmetric cipher alone?',
      opts:['it is slow, so it cannot encrypt large volumes of data or ordinary traffic between a server and a client','the shared key must somehow reach the other side, and sending it over an unprotected network is nonsense','it cannot provide integrity, so a change of content on the way has no way of ever showing up'],
      correct:1, why:'A symmetric cipher (AES) is on the contrary very fast – processors do it in hardware. The delivery problem is called key exchange and asymmetric cryptography solves it.' },
    { q:'What holds for a public and private key pair?',
      opts:['both keys must stay secret, otherwise anyone on the path could read and decrypt the message','what the public key encrypts, only the private one opens – and what the private signs, anyone verifies','the keys swap roles in each connection, so the public becomes private and vice versa as agreed'],
      correct:1, why:'Two uses follow: delivering a secret (encrypt with the recipient’s public key) and signing (the private key signs, the public verifies). Certificates rest exactly on signing.' },
    { q:'How does TLS combine the two ciphers?',
      opts:['it encrypts the whole connection asymmetrically, as that is safer, using the symmetric one only for check values','a symmetric key is agreed asymmetrically at the start and the rest runs with the fast symmetric cipher','both ciphers run over each other at once, so an attacker must break two different layers of protection'],
      correct:1, why:'An asymmetric cipher is orders of magnitude slower, so it is used only at the start. A comparison: shake hands and pass the safe’s key, then use the safe.' },
    { q:'Why is a new key created for every connection?',
      opts:['because a key wears out and after a certain volume of data it would stop encrypting','so that a later leak of the key does not reveal older traffic somebody captured and stored','because otherwise the two sides could not verify they talk to whom they really want to'],
      correct:1, why:'These days the key is usually not even sent – both sides compute it from publicly exchanged values so a listener cannot derive it from what they saw.' }
  ]},
  c22q_l5:{ title:'Quiz: Hashing', qs:[
    { q:'How does a hash differ from encryption?',
      opts:['it is one-way: from data you compute a fingerprint, but not the original data back from it','it uses a key pair, so a fingerprint opens only for the holder of the matching private key','it is computed only from short inputs, so it cannot be used on large files at all'],
      correct:0, why:'The data is simply not in the fingerprint – it is like the ash of a letter. So a server need not know your password: it stores the fingerprint and recomputes it at login.' },
    { q:'What is a salt for when storing passwords?',
      opts:['so two identical passwords do not give one fingerprint and a precomputed rainbow table is useless','so a password can, when needed, be correctly reassembled from the stored fingerprint again','so a fingerprint always takes the same space in the database regardless of password length'],
      correct:0, why:'A salt is a random value, different per user, stored with the record; it need not be secret. A pepper is secret and not in the database – it lives in the app configuration.' },
    { q:'Why is a checksum published for downloadable files?',
      opts:['so that after downloading you verify nobody changed the file on the way and it is not corrupted','so that an interrupted download can resume exactly where it previously left off','so the browser knows which key to decrypt the downloaded file with after saving'],
      correct:0, why:'Identical data gives an identical fingerprint and a tiny change a completely different one. If your computed fingerprint differs from the page, do not run the file.' },
    { q:'Why are MD5 and SHA-1 not used for passwords today?',
      opts:['collisions can be found for them and they compute so fast that passwords are tried by the billion','they do not work on inputs longer than a password, so a longer passphrase cannot be used at all','they keep part of the original password in the fingerprint, so a stolen database reads out directly'],
      correct:0, why:'For integrity SHA-256 is used today. For passwords the fit is deliberately slow functions like bcrypt or argon2 – there speed is a drawback.' }
  ]},
  c22q_l6:{ title:'Quiz: TLS in practice', qs:[
    { q:'What does the server send the browser in the second handshake step?',
      opts:['its private key, so the browser can decrypt the page content even before it starts rendering it','the chosen cipher and its certificate: a name, a public key and the signature of the attesting authority','a finished symmetric key for the whole connection, which the browser merely stores and never changes'],
      correct:1, why:'A private key never leaves the device. The browser then verifies the certificate and only after the key is agreed does the first page request go out – encrypted.' },
    { q:'What does it mean that a certificate is valid?',
      opts:['that the site operator passed a business integrity check and its pages are therefore trustworthy','that the name matches the address, the validity period runs and the signature leads to a trusted authority','that the server offers the newest protocol version and has all weak ciphers disabled on its interface'],
      correct:1, why:'All three conditions must hold at once. And beware a common misunderstanding: a valid certificate vouches for the name, not for honesty – a fraudulent site can hold one too.' },
    { q:'Which browser warning is the most serious?',
      opts:['the certificate expired, because from then on no encryption runs and the data goes in the clear','the certificate is issued for a different name, because that is exactly what impersonation looks like','the certificate is from an authority the device does not know, because then not even confidentiality holds'],
      correct:1, why:'Expiry is usually an operational slip and with an unknown authority encryption still runs – only authenticity is missing. But at a login none of the three is clicked away.' },
    { q:'What does the padlock in the browser guarantee?',
      opts:['that the connection is encrypted and the certificate matches the name you typed into the address bar','that the site operator is vetted and will handle the data you enter according to the applicable rules','that the page content passed a malicious code check and it is therefore safe to fill anything in'],
      correct:0, why:'Nothing more. A fraudulent site obtains a valid certificate as easily as anyone else, so the padlock is no reason to trust the content or the operator.' }
  ]},
  c22q_l7:{ title:'Quiz: Certificates and authorities', qs:[
    { q:'Why does a device trust a root authority it has never seen?',
      opts:['because it downloads her certificate on the first connection and remembers it for all the later ones','because the browser and the operating system carry her in a built-in list of trusted authorities','because every root authority is signed by another authority, so the chain never ends anywhere'],
      correct:1, why:'A root is signed by itself. It signs intermediate authorities and only those issue server certificates – forming the chain of trust the browser walks upward.' },
    { q:'A server has a valid certificate, yet some devices error. What is the usual cause?',
      opts:['the server does not send the intermediate certificates, the chain breaks and some devices lack the missing link','the server runs a different protocol version than the browsers on those particular devices support','the certificate is issued for too many names at once and devices therefore refuse to accept its signature'],
      correct:0, why:'A device that happens to remember the intermediate from before reports no error – hence the classic ‘it works for me’. The browser walks the chain to a known link.' },
    { q:'What does a company need its own certificate authority for?',
      opts:['to save on public certificates even for services that customers and visitors reach from the internet','for certificates for internal services whose names do not exist on the internet and no public authority attests','so it can decide by itself which public authority its devices will trust and which they will not'],
      correct:1, why:'The internal root is distributed to company devices. Outside nobody has it, so for services reachable from outside a public authority remains the right choice.' },
    { q:'Why are certificates issued with short validity periods today?',
      opts:['because revocation is slow and unreliable, so it is better if an invalid certificate soon expires by itself','because a longer validity would markedly slow down signature verification in the browser at each connection','because with a longer validity authorities cannot guarantee the name in the certificate will still exist'],
      correct:0, why:'The most serious failure is a private key leak: an attacker can impersonate the server while the certificate stays valid. A short validity beats a fast revocation.' }
  ]},
  c22q_l8:{ title:'Quiz: Where encryption is not enough', qs:[
    { q:'Why does encryption not help when the user’s computer itself is compromised?',
      opts:['because a compromised computer usually uses an outdated protocol version an attacker can easily break','because at the ends data must be readable or it could not be used – and an attacker there sees what the user sees','because the key stored on the computer can be derived from traffic the attacker captured earlier on the path'],
      correct:1, why:'Encryption even helps the attacker: it hides what they send. Neither sensor nor firewall sees anything unusual – it is ordinary encrypted traffic on an ordinary port.' },
    { q:'What must be set on company devices for TLS inspection to work?',
      opts:['they must trust the internal authority, because the firewall itself makes a certificate for every visited site','they must have certificate verification disabled, because otherwise they would not connect to the site at all','they must have the firewall’s private key installed, which is then used to decrypt the server’s reply'],
      correct:0, why:'It is essentially a controlled man-in-the-middle run by your own company. The price is privacy, performance, refusing applications and a firewall holding all traffic in the clear.' },
    { q:'What can be spotted from metadata even when the content is encrypted?',
      opts:['exactly which files the user downloaded and which passwords they typed into login forms along the way','a regular control channel, a big upload at night, or a pair that has never appeared in the network before','which specific vulnerabilities the attacker tried to exploit on the compromised server and with what result'],
      correct:1, why:'The connections overview shows exactly what anyone on the path sees. Good news for defense, bad for privacy: encrypting content is not anonymity.' },
    { q:'Why is TLS inspection enabled selectively rather than universally?',
      opts:['because a firewall can decrypt only one connection at a time and other traffic would have to queue up','because otherwise the firewall sees employees’ banking and health data too, and it costs a lot of performance','because enabled inspection turns off stateful inspection and the firewall stops telling connection direction'],
      correct:1, why:'Sensitive categories are commonly excluded from inspection. And note: the firewall becomes the place where all company traffic is in the clear – its compromise is a catastrophe.' }
  ]},
  c22q_l9:{ title:'Quiz: Practice and summary', qs:[
    { q:'What should you start with when encrypting a network?',
      opts:['the company’s public site, because it is visible from outside and a mistake there would damage the reputation','device administration: whoever captures a login to a switch or firewall gains administrator access outright','the print server and the test environment, because a rollout there breaks nobody’s ordinary operations'],
      correct:1, why:'Rank services by what capturing them would give an attacker and start at the top. Otherwise you end with a beautifully secured print server and Telnet on the main switch.' },
    { q:'Why is a self-signed certificate in production a problem?',
      opts:['because no encryption runs on such a connection and the content is transferred in the clear','because users learn to click warnings away and thereby stop recognizing a genuine fraud as well','because browsers refuse to open such a connection and the service is unreachable from their view'],
      correct:1, why:'Encryption runs normally, but authenticity is missing. Besides self-signed, common mistakes are forgotten renewals, encryption only from outside, and old weak ciphers.' },
    { q:'What does the mistake ‘encryption only from outside’ mean?',
      opts:['the site has https from the internet, but inside administration runs over Telnet and the database is unencrypted','traffic is encrypted only in the outbound direction, while replies from servers come back in the clear','the certificate is issued only for the public name, so from the internet a single path leads to the server'],
      correct:0, why:'An attacker inside suddenly has everything. That is why the Zero Trust course insists the internal network is not a safe zone – encrypt between your own servers too.' },
    { q:'How do you tell that watching certificate validity is really solved?',
      opts:['someone on the team remembers the dates and always warns the others in time before the period ends','the dates are in monitoring and renewal runs automatically, not in one person’s head or calendar','the certificates are issued for as long as possible, so renewal is dealt with once every few years'],
      correct:1, why:'If the answer is ‘someone watches it’, nobody does. An expired certificate also breaks applications that cannot click warnings away – they simply stop connecting.' }
  ]}
};
const COURSE_22_FINAL_EXTRA_DEF=[
  { q:'A colleague says: ‘the traffic is encrypted, so an attacker learns nothing about us’. What do you reply?',
    opts:['he is right, because without the key nothing usable at all can be derived from captured traffic','the content is hidden, but metadata is not: who talks to whom, when, how long and how much moves','he is right only about outbound connections, because inside the network traffic always goes in the clear'],
    correct:1, why:'Addresses must stay readable, or the packet could not arrive. That is why detection in an encrypted network works from the traffic pattern – and why encryption is not anonymity.' },
  { q:'The browser reports the internal system’s certificate is from an unknown authority. What is the right fix?',
    opts:['teach users to click the warning away, since it is an internal system nobody can reach from outside','issue the certificate from an internal authority and push its root to company devices centrally','turn encryption off on that system entirely, since without a certificate it brings no protection anyway'],
    correct:1, why:'Clicking warnings away is the worst option: the user then misses a genuine fraud too. Note the internal root counts only at home – outside a public authority belongs.' },
  { q:'A company considers decrypting all traffic on the firewall. What is the main argument against?',
    opts:['the firewall would need the private keys of all the visited sites, which no public authority issues to it','the firewall sees the content of all communication including private, and holds all traffic in the clear','decryption would break the integrity of the connection, so the browser would discard every page received'],
    correct:1, why:'So inspection is enabled selectively and sensitive categories are excluded. Besides privacy there is performance and applications that check which certificate they got.' }
];
__regCourse(22,COURSE_22_DEF,COURSE_22_QUIZZES_DEF,COURSE_22_FINAL_EXTRA_DEF);
