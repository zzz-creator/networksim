"use strict";

function trafficForPort(p) {
  for (const k in TRAFFIC) {
    if (TRAFFIC[k].port === p)
      return {
        proto: TRAFFIC[k].proto,
        port: p,
        label: TRAFFIC[k].label.split(" ")[0],
      };
  }
  return { proto: "tcp", port: p, label: "TCP " + p };
}
function simEndpoints() {
  const pool = (DB.hosts || []).map((h) => h.id);
  DB.segments.filter((s) => s.isInternet).forEach((s) => pool.push(s.id));
  return pool;
}

function simInternets() {
  const all = DB.segments.filter((s) => s.isInternet);
  if (all.length < 2) return all;
  const pref = new Set();
  for (const d of DB.devices) {
    const wl = wanLinksOf(d);
    if (!wl.length) continue;
    const live = wl.filter((l) => !linkDown(l));
    if (!live.length) continue;
    if (wl.length >= 2 && wanModeOf(d) === "failover") {
      const act = live.find((l) => l.id === wanPrimaryOf(d)) || live[0];
      pref.add(wanInetOf(act));
    } else live.forEach((l) => pref.add(wanInetOf(l)));
  }
  const p = all.filter((s) => pref.has(s.id));
  return p.length ? p : all;
}

const SIM_CLIENT_IPS = [
  "198.51.100.7",
  "198.51.100.23",
  "203.0.113.9",
  "203.0.113.42",
  "192.0.2.15",
  "192.0.2.88",
];

function simPickFlow() {
  if (Math.random() < 0.3) {
    const f = exfilFlow();
    if (f) return f;
  }
  if (capture) {
    const f = capPickFlow();
    if (f) return f;
  }
  const hosts = DB.hosts || [];
  const inets = simInternets();
  const inet = inets.length
    ? inets[Math.floor(Math.random() * inets.length)]
    : null;
  const clients = hosts.filter(
    (h) =>
      h.kind === "pc" || h.kind === "ntb" || !(h.services && h.services.length),
  );
  const servers = hosts.filter((h) => h.services && h.services.length);
  const lbVips = DB.devices.filter(
    (d) => d.type === "loadbalancer" && lbBackends(d).length,
  );
  const rk = (a) => a[Math.floor(Math.random() * a.length)];
  const threat = (arr, p) => (Math.random() < p ? rk(arr) : null);
  const r = Math.random();
  if (lbVips.length && inet && r < 0.42) {
    const lb = rk(lbVips),
      vip = parsePortList(lb.vipPorts);
    const tr = vip.length
      ? trafficForPort(rk(vip))
      : { proto: "tcp", port: 443, label: "TCP 443" };
    const th = threat(["sqli", "xss", "exploit"], 0.25);
    if (th) tr.content = th;
    return { a: inet.id, b: lb.id, tr, clientKey: rk(SIM_CLIENT_IPS) };
  }
  if (clients.length && servers.length && r < 0.64) {
    const s = rk(servers);
    return { a: rk(clients).id, b: s.id, tr: trafficForPort(rk(s.services)) };
  }
  if (clients.length && inet && r < 0.82) {
    const t = TRAFFIC[rk(["https", "http", "dns"])];
    const tr = { proto: t.proto, port: t.port, label: t.label.split(" ")[0] };
    const th = threat(["c2", "creds", "dnstunnel"], 0.14);
    if (th) tr.content = th;
    return { a: rk(clients).id, b: inet.id, tr };
  }
  if (inet && servers.length) {
    const s = rk(servers);
    const tr = trafficForPort(rk(s.services));
    const th = threat(["sqli", "exploit", "malware", "portscan"], 0.5);
    if (th) tr.content = th;
    return { a: inet.id, b: s.id, tr, clientKey: rk(SIM_CLIENT_IPS) };
  }
  if (clients.length && servers.length) {
    const s = rk(servers);
    return { a: rk(clients).id, b: s.id, tr: trafficForPort(rk(s.services)) };
  }
  return null;
}

function simTargetName(clientId, targetId) {
  const segId = epSeg(clientId),
    seg = segId ? getNode(segId) : null;
  if (!seg) return null;
  const all = dnsServersFor(clientId, seg);

  const up = all.filter(
    (rid) =>
      rid === clientId ||
      evaluateEP(clientId, rid, {
        proto: "udp",
        port: 53,
        content: null,
        payload: null,
      }).status === "allowed",
  );
  const servers = up.length ? up : all;
  for (const rid of servers) {
    let resolver = getNode(rid);

    if (dnsRoleOf(rid) === "forwarder") {
      const up = dnsUpstreamOf(resolver);
      if (!up) continue;
      resolver = getNode(up);
    }
    for (const r of dnsRecordsOf(resolver)) {
      if (!r || dnsRecType(r) === "MX") continue;
      const nm = dnsNorm(r.name);
      if (!nm) continue;
      const loc = dnsLookupLocal(resolver, nm);
      if (loc && loc.ok && loc.hostId === targetId) return nm;
    }
    return null;
  }
  return null;
}

function simResolveTarget(clientId, targetId) {
  const name = simTargetName(clientId, targetId);
  if (!name) return null;
  const rn = resolveName(clientId, name);
  const fromCache = !!(rn.fromCache && rn.cacheSource === "client");
  if (rn.ok && !rn.internet)
    return {
      name,
      hostId: rn.hostId,
      via: rn.via || null,
      forwarder: rn.forwarder || null,
      viaSecondary: !!rn.viaSecondary,
      fromCache,
      fail: null,
    };
  if (rn.ok) return null;
  return {
    name,
    hostId: null,
    via: rn.via || null,
    forwarder: rn.forwarder || null,
    viaSecondary: !!rn.viaSecondary,
    fromCache,
    fail: rn.err,
  };
}

function simSpawnDnsPacket(srcId, resolverId) {
  if (!resolverId || srcId === resolverId) return;
  const res = evaluateEP(srcId, resolverId, {
    proto: "udp",
    port: 53,
    content: null,
    payload: null,
  });
  const phys = res.path ? physicalPath(res.path) : null;
  if (!phys || phys.length < 2) return;
  const blockedId =
    res.status !== "allowed" && res.blockedAt ? res.blockedAt.id : null;
  let upto = phys.length - 1;
  if (blockedId) {
    const bi = phys.indexOf(blockedId);
    if (bi >= 0) upto = bi;
  }
  const pids = phys.slice(0, upto + 1);
  const pts = pids.map((id) => {
    const n = getNode(id);
    return { x: n.x || 0, y: n.y || 0 };
  });
  if (pts.length < 2) return;
  const color = res.status === "allowed" ? "#c084fc" : "#fb7185";

  const trace = el("polyline", {
    class: "simtrace",
    points: pts.map((p) => p.x + "," + p.y).join(" "),
    fill: "none",
    stroke: color,
    "stroke-width": 1.5,
    opacity: 0.28,
    style: "color:" + color,
  });
  $("gOverlay").appendChild(trace);
  const dot = el("circle", {
    class: "simpacket",
    r: 3.5,
    cx: pts[0].x,
    cy: pts[0].y,
    fill: color,
    style: "color:" + color,
  });
  $("gOverlay").appendChild(dot);
  simState.packets.push({
    pts,
    pids,
    flooded: new Set(),
    seg: 0,
    t: 0,
    dot,
    trace,
    traceOp: 0.28,
    blocked: res.status !== "allowed",
    speed: 1.1,
  });
}
function simSpawn() {
  if (document.hidden) return;
  if (isAdvanced() && simState.floods.length < 3 && simState.count % 4 === 3) {
    simChatterTick();
    return;
  }
  if (simState.packets.length > 80) return;
  const flow = simPickFlow();
  if (!flow) return;
  aaRotate();
  try {
    const tr = flow.tr,
      a = flow.a;
    let b = flow.b;
    const clientKey = flow.clientKey || null;

    let dns = null;
    if (isHost(a) && !isSegment(b)) {
      dns = simResolveTarget(a, b);
      if (dns && !dns.fromCache)
        simSpawnDnsPacket(
          a,
          dns.forwarder ? dns.forwarder.id : dns.via ? dns.via.id : null,
        );
      if (dns && dns.fail) {
        simLog(a, b, tr.label, { status: "dnsfail" }, dns);
        flowNote(a, b, tr.proto, tr.port, "dnsfail");
        return;
      }
      if (dns) b = dns.hostId;
    }
    const payload = tr.content ? samplePayload(tr.content) : null;
    const res = evaluateEP(
      a,
      b,
      {
        proto: tr.proto,
        port: tr.port,
        content: tr.content || null,
        payload: payload,
      },
      { commit: true, live: true, clientKey },
    );
    const label = tr.content
      ? tr.label + " ⚠" + threatLabel(tr.content)
      : tr.label;
    simLog(clientKey || a, b, label, res, dns);

    flowNote(
      a,
      res.lbBackend ? res.lbBackend.id : b,
      tr.proto,
      tr.port,
      res.status,
    );
    if (capture && res.path)
      capNote(
        physicalPath(res.path) || res.path,
        {
          proto: tr.proto,
          port: tr.port,
          label: tr.label,
          content: tr.content,
          payload: payload,
        },
        res,
        { a: a, b: b },
      );

    let lbId = null,
      beId = null;
    if (res.lbBackend) {
      const lb = getNode(b);
      if (lb && lb.type === "loadbalancer") {
        lbId = b;
        beId = res.lbBackend.id;
        const rt = lbRuntimeFor(lbId);
        rt.active[beId] = (rt.active[beId] || 0) + 1;
      }
    }
    const release = () => {
      if (lbId && beId) {
        const rt = lbRuntime[lbId];
        if (rt && rt.active)
          rt.active[beId] = Math.max(0, (rt.active[beId] || 0) - 1);
      }
    };

    const phys = res.path ? physicalPath(res.path) : null;
    if (!phys || phys.length < 2) {
      release();
      return;
    }
    const blockedId =
      res.status === "blocked" && res.blockedAt ? res.blockedAt.id : null;
    let upto = phys.length - 1;
    if (blockedId) {
      const bi = phys.indexOf(blockedId);
      if (bi >= 0) upto = bi;
    }
    const pts = phys.slice(0, upto + 1).map((id) => {
      const n = getNode(id);
      return { x: n.x || 0, y: n.y || 0 };
    });
    const pids = phys.slice(0, upto + 1);
    if (pts.length < 2) {
      release();
      return;
    }
    const ok = res.status === "allowed";
    const alerted = (res.hops || []).some(
      (h) =>
        h.device && h.device.type === "idsips" && /ALERT/i.test(h.note || ""),
    );
    if (blockedId)
      logEvent(
        "warn",
        blockedId,
        tf("sysEvDeny", nodeLabel(flow.a), nodeLabel(flow.b)),
      );
    if (alerted) {
      const _ids = (res.hops || []).find(
        (h) =>
          h.device && h.device.type === "idsips" && /ALERT/i.test(h.note || ""),
      );
      if (_ids)
        logEvent("crit", _ids.device.id, tf("sysEvIds", nodeLabel(flow.a)));
    }
    const color = blockedId
      ? "#fb7185"
      : alerted
        ? "#fbbf24"
        : ok
          ? "#34d399"
          : "#fbbf24";
    const trace = el("polyline", {
      class: "simtrace",
      points: pts.map((p) => p.x + "," + p.y).join(" "),
      fill: "none",
      stroke: color,
      "stroke-width": 3,
      opacity: 0.6,
      style: "color:" + color,
    });
    $("gOverlay").appendChild(trace);
    const dot = el("circle", {
      class: "simpacket",
      r: ok && !alerted ? 5 : 5.5,
      cx: pts[0].x,
      cy: pts[0].y,
      fill: color,
      style: "color:" + color,
    });
    $("gOverlay").appendChild(dot);
    const _slow = pathCongested(pids, tr);
    if (_slow && !blockedId) {
      dot.setAttribute("fill", "#fbbf24");
      if (trace) trace.setAttribute("stroke", "#fbbf24");
    }
    simState.packets.push({
      pts,
      pids,
      flooded: new Set(),
      seg: 0,
      t: 0,
      dot,
      trace,
      blocked: !!blockedId,
      speed: mSpeed((0.7 + Math.random() * 0.4) * (_slow ? 0.35 : 1)),
      lbId,
      beId,
    });
  } finally {
    aaClearSkip();
  }
}
function simFrame(ts) {
  if (
    !simState.on &&
    !simState.packets.length &&
    !(simState.floods || []).length
  ) {
    simState.raf = null;
    simState.lastTs = 0;
    return;
  }
  const dt = simState.lastTs
    ? Math.min(0.05, (ts - simState.lastTs) / 1000)
    : 0.016;
  simState.lastTs = ts;
  const live = [];
  for (const pk of simState.packets) {
    const pts = (pk.pids || []).map((id) => {
      const n = getNode(id);
      return n ? { x: n.x || 0, y: n.y || 0 } : null;
    });
    if (!pts.length || pts.some((p) => !p)) {
      pk.dot.remove();
      if (pk.trace) pk.trace.remove();
      continue;
    }
    if (pk.trace)
      pk.trace.setAttribute(
        "points",
        pts.map((p) => p.x + "," + p.y).join(" "),
      );
    pk.t += pk.speed * dt;
    if (pk.t >= 1) {
      pk.t = 0;
      pk.seg++;
    }

    if (
      pk.pids &&
      !pk.flooded.has(pk.seg) &&
      pk.pids[pk.seg] &&
      isDevice(pk.pids[pk.seg]) &&
      getNode(pk.pids[pk.seg]) &&
      getNode(pk.pids[pk.seg]).type === "hub"
    ) {
      pk.flooded.add(pk.seg);
      floodFromHub(
        pk.pids[pk.seg],
        [pk.pids[pk.seg - 1], pk.pids[pk.seg + 1]],
        pk.blocked ? "#fb7185" : "#34d399",
      );
    }
    if (pk.seg >= pts.length - 1) {
      if (pk.blocked) simBlockFlash(pts[pts.length - 1]);
      if (pk.lbId && pk.beId) {
        const rt = lbRuntime[pk.lbId];
        if (rt && rt.active)
          rt.active[pk.beId] = Math.max(0, (rt.active[pk.beId] || 0) - 1);
      }
      pk.dot.remove();
      if (pk.trace) pk.trace.remove();
      continue;
    }
    const a = pts[pk.seg],
      b = pts[pk.seg + 1];
    const _p = _bez(a.x, a.y, b.x, b.y, pk.t);
    pk.dot.setAttribute("cx", _p.x);
    pk.dot.setAttribute("cy", _p.y);
    if (pk.trace) {
      const prog = (pk.seg + pk.t) / (pts.length - 1);
      pk.trace.setAttribute(
        "opacity",
        ((pk.traceOp || 0.6) * (1 - prog * 0.55)).toFixed(2),
      );
    }
    live.push(pk);
  }
  simState.packets = live;

  const liveF = [];
  for (const fl of simState.floods || []) {
    fl.t += fl.speed * dt;
    let alive = false;
    for (const e of fl.edges) {
      const A = getNode(e.a),
        B = getNode(e.b);
      if (!A || !B || !e.dot.isConnected) {
        if (e.dot) e.dot.remove();
        continue;
      }
      const lt = fl.t - e.delay;
      if (lt < 0) {
        alive = true;
        continue;
      }
      if (lt >= 1) {
        e.dot.remove();
        continue;
      }
      const _p = _bez(A.x || 0, A.y || 0, B.x || 0, B.y || 0, lt);
      e.dot.setAttribute("cx", _p.x);
      e.dot.setAttribute("cy", _p.y);
      e.dot.setAttribute("opacity", 0.95);
      alive = true;
    }
    if (alive) liveF.push(fl);
    else
      fl.edges.forEach((e) => {
        if (e.dot) e.dot.remove();
      });
  }
  simState.floods = liveF;
  simState.raf = requestAnimationFrame(simFrame);
}

const FLOOD_MAX_EDGES = 60;
function simSpawnFlood(srcId, vlan, color, label) {
  const edges = l2FloodTree(srcId, vlan, FLOOD_MAX_EDGES);
  if (!edges.length) return 0;
  const depth = {};
  depth[srcId] = 0;
  const g = $("gOverlay");
  if (!g) return 0;
  const items = [];

  const drawn = (id) => {
    const n = getNode(id);
    return !!(n && isFinite(n.x) && isFinite(n.y) && isRenderedNode(id));
  };
  const anchor = {};
  anchor[srcId] = drawn(srcId) ? srcId : null;
  edges.forEach(([a, b]) => {
    const d = depth[a] || 0;
    depth[b] = d + 1;
    const A = a in anchor ? anchor[a] : drawn(a) ? a : null;
    if (!drawn(b)) {
      anchor[b] = A;
      return;
    }
    anchor[b] = b;
    if (!A || A === b) return;
    const dot = el("circle", {
      class: "simpacket bcast",
      r: 4.5,
      cx: -99,
      cy: -99,
      fill: color,
      opacity: 0,
    });
    g.appendChild(dot);
    items.push({ a: A, b, dot, delay: d * 0.55 });
  });
  if (!items.length) return 0;
  const maxDelay = items.reduce((m, e) => Math.max(m, e.delay), 0);
  simState.floods.push({
    edges: items,
    t: 0,
    speed: mSpeed(1.5),
    label,
    end: maxDelay + 1,
  });
  return items.length;
}

function simChatterTick() {
  const hosts = (DB.hosts || []).filter(
    (h) =>
      h.segId &&
      getNode(h.segId) &&
      !getNode(h.segId).isInternet &&
      !isDown(h.id) &&
      !isQuar(h.id) &&
      hostLinkCarriesVlan(h.id) &&
      linksOf(h.id).length,
  );
  if (!hosts.length) {
    simState.count++;
    return;
  }
  const h =
    hosts[Math.floor((hosts.length * (simState.count % 7)) / 7)] || hosts[0];
  const vlan = h.segId;
  if (stpStormLinks(vlan).size) {
    simState.count++;
    return;
  }

  const wantsDhcp = segDhcpOn(vlan) && simState.count % 3 === 0;
  const n = simSpawnFlood(
    h.id,
    vlan,
    wantsDhcp ? "#fbbf24" : "#7dd3fc",
    wantsDhcp ? "DHCP" : "ARP",
  );
  if (n) simLogChatter(h.id, vlan, wantsDhcp ? "dhcp" : "arp", n);
  else simState.count++;
}
function simLogChatter(srcId, vlan, kind, n) {
  const log = $("trafficLog");
  if (!log) return;
  const nm = (id) => {
    const x = getNode(id);
    return x ? esc(x.label || x.name) : esc(id);
  };
  const row = document.createElement("div");
  row.className = "tl-row ok";
  row.innerHTML =
    nm(srcId) +
    ' <span class="tl-v">→</span> ' +
    t("simBcastAll") +
    ' <span class="tl-v">· ' +
    (kind === "dhcp" ? "DHCP DISCOVER" : "ARP") +
    " ·</span> " +
    tf("simBcastDomain", n, esc((getNode(vlan) || {}).name || ""));
  log.insertBefore(row, log.firstChild);
  while (log.children.length > 50) log.removeChild(log.lastChild);
  simState.count++;
  $("trafficCount").textContent = simState.count;
}

function nodeLabel(id) {
  const n = getNode(id);
  return n ? n.label || n.name || id : id;
}
const SYSLOG_MAX = 200;
let sysEvents = [],
  sysLost = 0;
function logHosts() {
  return (DB.hosts || []).filter(
    (h) => Array.isArray(h.services) && h.services.indexOf(514) >= 0 && !h.down,
  );
}
function syslogClear() {
  sysEvents = [];
  sysLost = 0;
  renderSyslog();
}

let _sysGuard = false;
const _sysCache = {};
function syslogCacheClear() {
  for (const k in _sysCache) delete _sysCache[k];
}
function syslogReachable(srcId, logId) {
  if (_sysGuard) return true;
  const k = srcId + "|" + logId;
  if (k in _sysCache) return _sysCache[k];
  let v = false;
  _sysGuard = true;
  try {
    v =
      evaluateEP(srcId, logId, { proto: "udp", port: 514 }).status ===
      "allowed";
  } catch (e) {
    v = false;
  }
  _sysGuard = false;
  _sysCache[k] = v;
  return v;
}

function logEvent(sev, srcId, msg) {
  const lhs = logHosts();
  if (!lhs.length) return;
  const src = getNode(srcId);
  if (!src) return;

  const delivered =
    isDevice(srcId) ||
    lhs.some((l) => l.id === srcId || syslogReachable(srcId, l.id));
  if (!delivered) {
    sysLost++;
    renderSyslog();
    return;
  }
  sysEvents.unshift({
    sev,
    src: src.label || src.name || srcId,
    msg,
    n: 1,
    ts: Date.now(),
  });
  const top = sysEvents[1];
  if (
    top &&
    top.sev === sev &&
    top.src === sysEvents[0].src &&
    top.msg === msg
  ) {
    sysEvents.shift();
    top.n++;
    top.ts = Date.now();
  }
  while (sysEvents.length > SYSLOG_MAX) sysEvents.pop();
  renderSyslog();
}
function renderSyslog() {
  const box = $("syslogLog");
  if (!box) return;
  const _has = logHosts().length;
  const cnt = $("syslogCount");
  if (cnt) cnt.textContent = _has ? sysEvents.reduce((a, e) => a + e.n, 0) : 0;
  if (!_has) {
    box.innerHTML = '<div class="tl-row none">' + t("sysNoServer") + "</div>";
    return;
  }
  const sevCls = { crit: "block", warn: "none", info: "ok" };
  box.innerHTML =
    (sysLost
      ? '<div class="tl-row block">' + tf("sysLost", sysLost) + "</div>"
      : "") +
    (sysEvents.length
      ? sysEvents
          .map(
            (e) =>
              '<div class="tl-row ' +
              (sevCls[e.sev] || "ok") +
              '"><b>' +
              esc(e.src) +
              '</b> <span class="tl-v">·</span> ' +
              esc(e.msg) +
              (e.n > 1 ? ' <span class="tl-v">×' + e.n + "</span>" : "") +
              "</div>",
          )
          .join("")
      : '<div class="tl-row ok">' + t("sysEmpty") + "</div>");
}
function incidentReport() {
  const pad = (n) => String(n).padStart(2, "0");
  const fmt = (ts) => {
    const d = new Date(ts);
    return (
      pad(d.getHours()) + ":" + pad(d.getMinutes()) + ":" + pad(d.getSeconds())
    );
  };
  const lines = [];
  lines.push("INCIDENT REPORT" + " — " + ((DB.meta && DB.meta.name) || ""));
  lines.push("Created" + ": " + new Date().toLocaleString());
  lines.push("");
  const q = [...(DB.devices || []), ...(DB.hosts || [])].filter((n) => n.quar);
  lines.push(
    "Isolated devices (quarantine):" +
      " " +
      (q.length
        ? q.map((n) => n.label || n.name || n.id).join(", ")
        : "none"),
  );
  lines.push("");
  lines.push("Timeline (syslog, oldest on top):");
  if (sysLost) lines.push("  " + tf("sysLost", sysLost));
  const sevTxt = { crit: "CRIT", warn: "WARN", info: "info" };
  if (!sysEvents.length)
    lines.push(
      "  " +
        "no events – start the live simulation or run the tests",
    );
  [...sysEvents].reverse().forEach((e) => {
    lines.push(
      "  " +
        (e.ts ? fmt(e.ts) + "  " : "") +
        (sevTxt[e.sev] || "info") +
        "  " +
        e.src +
        " — " +
        e.msg +
        (e.n > 1 ? "  (×" + e.n + ")" : ""),
    );
  });
  lines.push("");
  lines.push("Observed connections (who talked to whom):");
  if (!flowStats.size)
    lines.push(
      "  " + "none – the connection overview is empty",
    );
  [...flowStats.values()].forEach((f) => {
    const an = getNode(f.a),
      bn = getNode(f.b);
    lines.push(
      "  " +
        (an ? an.label || an.name || f.a : f.a) +
        " → " +
        (bn ? bn.label || bn.name || f.b : f.b) +
        "  " +
        f.proto +
        "/" +
        f.port +
        "  " +
        "passed" +
        " " +
        f.ok +
        "×, " +
        "blocked" +
        " " +
        f.blocked +
        "×",
    );
  });
  lines.push("");
  lines.push(
    "Note: also log your own steps with timestamps – what you did and when (course “When It Happens”).",
  );
  return lines.join("\n");
}
function openIncidentReport() {
  const txt = incidentReport();
  openModal(
    "<h2>" +
      icon("file", "ico-a") +
      esc(t("sysReportTitle")) +
      "</h2>" +
      '<div style="font-size:12px;color:var(--muted);margin:0 0 8px">' +
      t("sysReportIntro") +
      "</div>" +
      '<textarea id="irText" readonly style="width:100%;height:300px;background:var(--panel2);border:1px solid var(--line2);border-radius:9px;color:var(--txt);font:12px var(--mono);padding:10px;resize:vertical;white-space:pre"></textarea>' +
      '<div class="actions"><button class="btn" id="irCopy">' +
      esc(t("sysReportCopy")) +
      '</button><button class="btn" id="irDl">' +
      esc(t("sysReportDl")) +
      '</button><button class="btn primary" id="irClose">' +
      esc(t("btnCloseModal")) +
      "</button></div>",
  );
  $("irText").value = txt;
  $("irCopy").onclick = () => {
    try {
      navigator.clipboard.writeText($("irText").value);
      setStatus(t("sysReportCopied"));
    } catch (e) {
      $("irText").select();
      document.execCommand("copy");
    }
  };
  $("irDl").onclick = () => {
    const b = new Blob([$("irText").value], {
      type: "text/plain;charset=utf-8",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(b);
    a.download = "incident-report.txt";
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  };
  $("irClose").onclick = closeModal;
}
$("sysReport").onclick = openIncidentReport;
function simBlockFlash(p) {
  const g = el("g", { class: "simx", opacity: 1 });
  const s = 8;
  g.appendChild(
    el("line", {
      x1: p.x - s,
      y1: p.y - s,
      x2: p.x + s,
      y2: p.y + s,
      stroke: "#fb7185",
      "stroke-width": 3,
      "stroke-linecap": "round",
    }),
  );
  g.appendChild(
    el("line", {
      x1: p.x + s,
      y1: p.y - s,
      x2: p.x - s,
      y2: p.y + s,
      stroke: "#fb7185",
      "stroke-width": 3,
      "stroke-linecap": "round",
    }),
  );
  $("gOverlay").appendChild(g);
  let o = 1,
    last = null;
  (function fade(ts) {
    if (!g.isConnected) return;
    if (last == null) last = ts;
    const dt = Math.min(0.05, ((ts || 0) - last) / 1000);
    last = ts;
    o -= 3.6 * dt;
    if (o <= 0) {
      g.remove();
      return;
    }
    g.setAttribute("opacity", o);
    requestAnimationFrame(fade);
  })(performance.now());
}

let flowStats = new Map(),
  _flowsDrawn = 0;
const natLog = new Map();
const NATLOG_MAX = 40;
const FLOWS_MAX = 200;
function flowKey(a, b, proto, port) {
  return a + ">" + b + "|" + proto + "/" + (port == null ? "-" : port);
}
function flowsClear() {
  flowStats = new Map();
  natLog.clear();
  renderFlows();
}
function exfilFlow() {
  const me = (DB.hosts || []).find((h) => h && h.exfil && !isInactive(h.id));
  if (!me) return null;
  const inets = simInternets();
  if (!inets.length) return null;
  return {
    a: me.id,
    b: inets[0].id,
    tr: { proto: "tcp", port: 443, label: "HTTPS", content: "c2" },
  };
}
function capPickFlow() {
  const ends = [capture.a, capture.b].filter((id) => isHost(id));
  if (!ends.length) return null;
  const me = getNode(ends[Math.floor(Math.random() * ends.length)]);
  if (!me) return null;
  const servers = (DB.hosts || []).filter(
    (h) =>
      h.id !== me.id && h.services && h.services.length && !isInactive(h.id),
  );
  const inets = simInternets();
  const dst =
    servers.length && Math.random() < 0.65
      ? servers[Math.floor(Math.random() * servers.length)].id
      : inets.length
        ? inets[Math.floor(Math.random() * inets.length)].id
        : servers.length
          ? servers[0].id
          : null;
  if (!dst) return null;
  const d = getNode(dst);
  const port =
    d && Array.isArray(d.services) && d.services.length
      ? d.services[Math.floor(Math.random() * d.services.length)]
      : Math.random() < 0.5
        ? 443
        : 80;
  const tr = trafficForPort(port) || {
    proto: "tcp",
    port: port,
    label: "TCP " + port,
  };
  return { a: me.id, b: dst, tr };
}
let capture = null;
const CAP_MAX = 80;
function capNote(pids, traffic, res, ep) {
  if (!capture || !Array.isArray(pids)) return;

  let hit = false;
  for (let i = 0; i < pids.length - 1; i++) {
    if (
      (pids[i] === capture.a && pids[i + 1] === capture.b) ||
      (pids[i] === capture.b && pids[i + 1] === capture.a)
    ) {
      hit = true;
      break;
    }
  }
  if (!hit) return;
  const src = (ep && ep.a) || pids[0],
    dst = (ep && ep.b) || pids[pids.length - 1];
  const ins = typeof insecureInfo === "function" ? insecureInfo(traffic) : null;
  const enc = trafficEncrypted(traffic);
  capture.rows.unshift({
    src: nodeLabel(src),
    dst: nodeLabel(dst),
    sMac: nodeMac(src) || "?",
    sIp: epAddr(src),
    dIp: epAddr(dst),
    proto: (traffic.proto || "ip").toUpperCase(),
    port: traffic.port || 0,
    label: traffic.label || "",
    payload: ins ? traffic.payload || traffic.content || null : null,
    readable: !!ins,
    enc: !!enc,
    blocked: res && res.status !== "allowed",
  });
  while (capture.rows.length > CAP_MAX) capture.rows.pop();
  renderCapture();
}
function renderCapture() {
  const box = $("capBody");
  if (!box || !capture) return;
  if (!capture.rows.length) {
    box.innerHTML = '<div class="tl-row none">' + t("capEmpty") + "</div>";
    return;
  }
  box.innerHTML = capture.rows
    .map((r) => {
      const tag = r.readable
        ? '<span style="color:var(--red);font-weight:700">' +
          esc(t("capPlain")) +
          "</span>"
        : r.enc
          ? '<span style="color:var(--green);font-weight:700">' +
            esc(t("capEnc")) +
            "</span>"
          : '<span style="color:var(--muted)">' + esc(t("capMeta")) + "</span>";
      return (
        '<div class="tl-row ' +
        (r.blocked ? "block" : "ok") +
        '" style="line-height:1.6">' +
        "<b>" +
        esc(r.src) +
        '</b> <span class="tl-v">→</span> <b>' +
        esc(r.dst) +
        '</b> <span class="tl-v">·</span> ' +
        esc(r.proto) +
        "/" +
        r.port +
        " " +
        tag +
        '<div style="font-size:10.5px;color:var(--muted);font-family:var(--mono)">' +
        esc(r.sMac) +
        " · " +
        esc(r.sIp) +
        " → " +
        esc(r.dIp) +
        "</div>" +
        (r.readable && r.payload
          ? '<div style="font-size:10.5px;color:var(--red);font-family:var(--mono);word-break:break-all">' +
            esc(String(r.payload).slice(0, 90)) +
            "</div>"
          : "") +
        "</div>"
      );
    })
    .join("");
}
function openCaptureModal(linkId) {
  const l = (DB.links || []).find((x) => x.id === linkId);
  if (!l) return;
  capture = { linkId, a: l.fromId, b: l.toId, rows: [] };
  const nm = (id) => {
    const n = getNode(id);
    return n ? n.label || n.name || id : id;
  };
  openModal(
    "<h2>" +
      icon("monitor", "ico-a") +
      esc(t("capTitle")) +
      "</h2>" +
      '<div style="font-weight:700;font-size:12.5px;margin:0 0 4px">' +
      esc(nm(l.fromId) + " — " + nm(l.toId)) +
      "</div>" +
      '<div class="ab-sec" style="color:var(--muted);font-size:12px">' +
      t("capIntro") +
      "</div>" +
      '<div id="capBody" class="traffic-log" style="max-height:320px"></div>' +
      '<div class="actions"><button class="btn" id="capClear">' +
      esc(t("trafficClear")) +
      '</button><button class="btn primary" id="capClose">' +
      esc(t("btnCloseModal")) +
      "</button></div>",
  );
  renderCapture();
  $("capClear").onclick = () => {
    capture.rows = [];
    renderCapture();
  };
  $("capClose").onclick = () => {
    capture = null;
    closeModal();
  };
  modalCloseHook = () => {
    capture = null;
  };
  if (!simState.on) startSim();
}
function flowNote(a, b, proto, port, status) {
  const k = flowKey(a, b, proto, port);
  let f = flowStats.get(k);
  if (!f) {
    if (flowStats.size >= FLOWS_MAX) return;
    f = { a, b, proto, port, n: 0, ok: 0, blocked: 0, other: 0 };
    flowStats.set(k, f);
  }
  f.n++;
  if (status === "allowed") f.ok++;
  else if (status === "blocked") f.blocked++;
  else f.other++;
  const pn = $("flowsPanel");
  if (pn && pn.style.display !== "none") {
    const now = Date.now();
    if (now - _flowsDrawn > 250) {
      _flowsDrawn = now;
      renderFlows();
    }
  }
}
function renderFlows() {
  const box = $("flowsLog");
  if (!box) return;
  const rows = [...flowStats.values()].sort((x, y) => y.n - x.n).slice(0, 40);
  const cnt = $("flowsCount");
  if (cnt) cnt.textContent = flowStats.size;
  if (!rows.length) {
    box.innerHTML = '<div class="tl-row ok">' + t("flowsEmpty") + "</div>";
    return;
  }
  const nm = (id) => {
    const n = getNode(id);
    return n ? esc(n.label || n.name) : esc(id);
  };
  box.innerHTML = rows
    .map((f) => {
      const cls = f.ok ? "ok" : f.blocked ? "block" : "none";
      const svc =
        (f.proto || "").toUpperCase() + (f.port != null ? " " + f.port : "");
      let verd;
      if (f.ok && !f.blocked && !f.other) verd = t("flowsPass");
      else if (f.blocked && !f.ok && !f.other) verd = t("flowsBlocked");
      else if (f.other && !f.ok && !f.blocked) verd = t("flowsFail");
      else verd = tf("flowsMixed", f.ok, f.blocked + f.other);
      return (
        '<div class="tl-row ' +
        cls +
        '">' +
        nm(f.a) +
        ' <span class="tl-v">→</span> ' +
        nm(f.b) +
        ' <span class="tl-v">· ' +
        esc(svc) +
        " ·</span> " +
        verd +
        ' <span class="tl-v">×' +
        f.n +
        "</span></div>"
      );
    })
    .join("");
}
function simLog(a, b, proto, res, dns) {
  const nm = (id) => {
    const n = getNode(id);
    return n ? esc(n.label || n.name) : esc(id);
  };
  let cls, verdict;
  if (res.status === "allowed") {
    cls = "ok";
    verdict = t("simPass");
  } else if (res.status === "dnsfail") {
    cls = "block";
    verdict = t("simDnsFail");
  } else if (res.status === "blocked") {
    cls = "block";
    verdict =
      t("simBlock") +
      (res.blockedAt
        ? " · " + esc(res.blockedAt.label || res.blockedAt.name)
        : "");
  } else {
    cls = "none";
    verdict = t("simNoRoute");
  }
  if (dns && dns.viaSecondary)
    verdict += ' <span class="tl-v">' + t("simViaDns2") + "</span>";
  const log = $("trafficLog");
  const row = document.createElement("div");
  row.className = "tl-row " + cls;
  let dstTxt = res.lbBackend
    ? nm(b) +
      ' <span class="tl-v">' +
      icon("balance") +
      "→</span> " +
      esc(res.lbBackend.label)
    : nm(b);
  if (dns && dns.name)
    dstTxt =
      res.status === "dnsfail"
        ? esc(dns.name)
        : esc(dns.name) + ' <span class="tl-v">(' + dstTxt + ")</span>";
  row.innerHTML =
    nm(a) +
    ' <span class="tl-v">→</span> ' +
    dstTxt +
    ' <span class="tl-v">· ' +
    esc(proto) +
    " ·</span> " +
    verdict;
  log.insertBefore(row, log.firstChild);
  while (log.children.length > 50) log.removeChild(log.lastChild);
  simState.count++;
  $("trafficCount").textContent = simState.count;
}

const SIM_RATES = Array.from(
  { length: 20 },
  (_, i) => +((i + 1) / 10).toFixed(1),
).concat([3, 4, 5, 6, 7, 8, 9, 10]);
const SIM_RATE_DEFAULT = 20;
function simRateVal() {
  return SIM_RATES[+$("trafficRate").value] || 1;
}
function simInterval() {
  return Math.max(40, Math.round(1000 / (simState.rate || 3)));
}
function startSim() {
  if (simEndpoints().length < 2) {
    setStatus(t("stNeedEndpoints"), false);
    return;
  }
  if (view !== "diagram") setView("diagram");

  document
    .querySelectorAll(".link")
    .forEach((l) => l.classList.remove("active-ok", "active-block"));
  $("gOverlay")
    .querySelectorAll(
      ".packet,.blockX,.dnspkt,.dnstrace,.simpacket,.simtrace,.simx",
    )
    .forEach((e) => e.remove());
  if (animRAF) cancelAnimationFrame(animRAF);
  lbRuntimeClear();
  if (simState.raf) {
    cancelAnimationFrame(simState.raf);
    simState.raf = null;
  }
  simState.on = true;
  simState.packets = [];
  simState.lastTs = 0;
  $("trafficRate").value = SIM_RATE_DEFAULT;
  simState.rate = simRateVal();
  $("trafficRateVal").textContent = simState.rate;
  $("rateRow").style.display = "";
  $("btnTrafficSim").textContent = t("btnTrafficStop");
  $("btnTrafficSim").classList.add("on");
  simSpawn();
  simState.timer = setInterval(simSpawn, simInterval());
  simState.raf = requestAnimationFrame(simFrame);
  setStatus(t("stSimRunning"));
}
function stopSim() {
  simState.on = false;
  $("rateRow").style.display = "none";
  if (simState.timer) clearInterval(simState.timer);
  simState.timer = null;
  if (simState.raf) cancelAnimationFrame(simState.raf);
  simState.raf = null;
  simState.packets.forEach((p) => {
    try {
      p.dot.remove();
      if (p.trace) p.trace.remove();
    } catch (e) {}
  });
  simState.packets = [];
  (simState.floods || []).forEach((f) =>
    f.edges.forEach((e) => {
      try {
        e.dot.remove();
      } catch (e2) {}
    }),
  );
  simState.floods = [];
  $("gOverlay")
    .querySelectorAll(".simx,.simtrace,.simpacket")
    .forEach((e) => e.remove());
  $("btnTrafficSim").textContent = t("btnTrafficSim");
  $("btnTrafficSim").classList.remove("on");
}
$("btnTrafficSim").onclick = () => {
  simState.on ? stopSim() : startSim();
};
function _simWake() {
  if (!simState.raf) {
    simState.lastTs = 0;
    simState.raf = requestAnimationFrame(simFrame);
  }
}
setInterval(() => {
  if (simState.on) return;
  if (!isAdvanced()) return;
  if (view !== "diagram") return;
  if (document.hidden) return;
  if ((simState.floods || []).length >= 2) return;
  simChatterTick();
  _simWake();
}, 3500);
$("syslogClear").onclick = syslogClear;
$("flowsClear").onclick = flowsClear;
function _simBtnLabel() {
  if (simState.on) {
    $("btnTrafficSim").textContent = t("btnTrafficStop");
  }
}
$("trafficRate").oninput = () => {
  simState.rate = simRateVal();
  $("trafficRateVal").textContent = simState.rate;
  if (simState.on) {
    clearInterval(simState.timer);
    simState.timer = setInterval(simSpawn, simInterval());
  }
};
$("trafficClear").onclick = () => {
  $("trafficLog").innerHTML = "";
  simState.count = 0;
  $("trafficCount").textContent = "0";
};

function epSeg(id) {
  if (isHost(id)) {
    const h = getNode(id);
    if (h && h.wifi && wifiAssocLive(h)) {
      const ap = getNode(h.wifi.apId);
      const ss =
        ap &&
        apEffSsids(ap).find(
          (s) =>
            (s.name || "").trim() === (h.wifi.ssid || "").trim() &&
            s.on !== false,
        );
      if (ss && ss.segId && getNode(ss.segId)) return ss.segId;
    }
    return h && h.segId;
  }
  return id;
}

const L2_BRIDGE_TYPES = [
  "l2switch",
  "l2mgmt",
  "hub",
  "l3switch",
  "idsips",
  "ap",
  "datadiode",
  "waf",
];
const L2_BOUNDARY_TYPES = ["router", "firewall", "loadbalancer", "vpn"];

function linkCarriesVlan(link, segId) {
  const p = link && link.port;
  if (!p || !p.mode) return true;
  if (p.mode === "access") return p.vlan === segId;
  if (p.mode === "trunk")
    return !p.vlans || !p.vlans.length || p.vlans.indexOf(segId) >= 0;
  if (p.mode === "dynamic") return true;
  return true;
}

function edgeCarriesVlan(a, b, segId) {
  if (!segId) return true;
  const ls = DB.links.filter(
    (l) => (l.fromId === a && l.toId === b) || (l.fromId === b && l.toId === a),
  );
  if (!ls.length) return true;
  return ls.some((l) => !linkDown(l) && linkCarriesVlan(l, segId));
}

function vlanSegOf(id) {
  return isSegment(id) ? id : epSeg(id);
}

function hostLinkCarriesVlan(hostId) {
  const seg = epSeg(hostId);
  if (!seg) return true;
  const ls = linksOf(hostId);
  if (!ls.length) return true;
  return ls.some((l) => linkCarriesVlan(l, seg));
}

function hostPortAuthorized(hostId) {
  const ls = linksOf(hostId);
  if (!ls.length) return true;
  let seen = false,
    creds = false,
    open = false;
  for (const l of ls) {
    if (linkDown(l)) continue;
    const d = l.port && l.port.dot1x;
    if (!d) {
      open = true;
      continue;
    }
    seen = true;
    const h = getNode(hostId);
    if (h && h.noCreds) {
      creds = true;
      continue;
    }
    if (radiusReachable(hostId, d.radiusId || null)) return true;
  }
  if (!seen || open) return true;
  return creds ? "creds" : false;
}

function hostPortDynamic(hostId) {
  return linksOf(hostId).some((l) => l.port && l.port.mode === "dynamic");
}

function l2FloodTree(a, vlan, maxEdges) {
  const lim = maxEdges || 60,
    out = [];
  const _stpBl = stpBlockedLinks(vlan);
  const apBridgesVlan = (d) =>
    (d.type === "router" || d.type === "firewall") &&
    d.wifiOn !== false &&
    (d.ssids || []).some(
      (x) => x.segId === vlan && x.on !== false && !!getNode(x.segId),
    );
  const seen = new Set([a]),
    q = [a];
  while (q.length && out.length < lim) {
    const c = q.shift();
    for (const l of linksOf(c)) {
      const nb = l.fromId === c ? l.toId : l.fromId;
      if (seen.has(nb)) continue;
      if (isDevice(c)) {
        const cn = getNode(c);
        if (cn.type === "datadiode" && cn.outId && nb !== cn.outId) continue;
      }
      if (isSegment(c) && !isHost(nb)) continue;
      if (linkDown(l)) continue;
      if (_stpBl.has(l.id)) continue;
      if (!linkCarriesVlan(l, vlan)) continue;
      if (isSegment(nb) && nb !== vlan) continue;

      if (isHost(nb) && getNode(nb) && getNode(nb).segId !== vlan) continue;
      if (isHost(nb) && (isDown(nb) || isQuar(nb))) continue;
      seen.add(nb);
      out.push([c, nb]);
      if (isHost(nb)) continue;
      if (isSegment(nb)) {
        if (isHost(c)) q.push(nb);
        continue;
      }
      const nd = getNode(nb);
      if (!nd) continue;
      if (L2_BRIDGE_TYPES.indexOf(nd.type) < 0 && !apBridgesVlan(nd)) continue;
      if (isInactive(nb)) continue;
      q.push(nb);
    }
  }
  return out;
}
function l2Path(a, b, vlanOverride) {
  if (a === b) return [a];
  const vlan = vlanOverride || epSeg(a);

  const apBridgesVlan = (d) =>
    (d.type === "router" || d.type === "firewall") &&
    d.wifiOn !== false &&
    (d.ssids || []).some(
      (s) => s.segId === vlan && s.on !== false && !!getNode(s.segId),
    );
  const prev = {},
    seen = new Set([a]),
    q = [a];
  const _stpBl = stpBlockedLinks(vlan);
  while (q.length) {
    const c = q.shift();
    for (const l of linksOf(c)) {
      const nb = l.fromId === c ? l.toId : l.fromId;
      if (seen.has(nb)) continue;

      if (isDevice(c)) {
        const cn = getNode(c);
        if (cn.type === "datadiode" && cn.outId && nb !== cn.outId) continue;
      }
      if (isSegment(c) && !isHost(nb)) continue;
      if (linkDown(l)) continue;
      if (_stpBl.has(l.id)) continue;
      if (!linkCarriesVlan(l, vlan)) continue;
      if (nb === b) {
        const seq = [b];
        let k = c;
        while (k !== undefined) {
          seq.unshift(k);
          k = prev[k];
        }
        return seq;
      }
      if (isSegment(nb)) {
        if (nb === vlan && isHost(c)) {
          seen.add(nb);
          prev[nb] = c;
          q.push(nb);
        }
        continue;
      }
      if (isHost(nb)) continue;
      if (isDevice(nb)) {
        const nd = getNode(nb);
        if (L2_BRIDGE_TYPES.indexOf(nd.type) < 0 && !apBridgesVlan(nd))
          continue;
        if (isInactive(nb)) continue;
      }
      seen.add(nb);
      prev[nb] = c;
      q.push(nb);
    }
  }
  return null;
}

const STP_ELECT_TYPES = ["l2switch", "l2mgmt", "l3switch"];

function stpModeOf(d) {
  return (d && d.stpMode) || "rstp";
}

function stpLinkMode(l) {
  let mode = "rstp";
  for (const end of [l.fromId, l.toId]) {
    const n = getNode(end);
    if (n && isDevice(end) && STP_ELECT_TYPES.indexOf(n.type) >= 0) {
      const m = stpModeOf(n);
      if (m === "stp") mode = "stp";
    }
  }
  return mode;
}

function stpBadgeTipFor(l) {
  return t(stpLinkMode(l) === "stp" ? "stpBadgeTipStp" : "stpBadgeTip");
}

const STP_SPEED_COST = {
  10: 100,
  100: 19,
  1000: 4,
  2500: 3,
  5000: 3,
  10000: 2,
};
function stpLinkCost(l) {
  if (typeof l.cost === "number" && l.cost > 0) return l.cost;
  const c = STP_SPEED_COST[l.speed];
  return c != null ? c : 4;
}
let _stpCache = null;
function _stpSig() {
  let s = "";
  for (const l of DB.links)
    s +=
      "L" +
      l.id +
      "|" +
      l.fromId +
      "|" +
      l.toId +
      "|" +
      (l.cost || "") +
      "|" +
      (l.speed || "") +
      "|" +
      (l.lag != null ? l.lag : "") +
      "|" +
      (l.port ? JSON.stringify(l.port) : "") +
      ";";
  for (const d of DB.devices)
    s +=
      "D" +
      d.id +
      "|" +
      d.type +
      (isInactive(d.id) ? "x" : "") +
      "|" +
      (typeof d.stpPriority === "number" ? d.stpPriority : "") +
      "|" +
      (d.stpMode || "") +
      "|" +
      (d.haPeer || "") +
      ";";

  for (const g of DB.segments) s += "S" + g.id + "|" + (g.vlan || "") + ";";
  return s;
}

function _stpRep(id) {
  const d = getNode(id);
  if (!d || !isDevice(id) || !d.haPeer) return id;
  const p = getNode(d.haPeer);
  if (!p || isInactive(d.id) || isInactive(p.id)) return id;
  return d.id < p.id ? d.id : p.id;
}

function _stpCompute(vlan) {
  const sig = _stpSig();
  if (!_stpCache || _stpCache.sig !== sig)
    _stpCache = { sig, byVlan: {}, root: null };
  const key = vlan || "*";
  if (_stpCache.byVlan[key]) return _stpCache.byVlan[key];
  const blocked = new Set(),
    storm = new Set();
  let rootId = null;
  const isNode = (id) => {
    const n = getNode(id);
    if (!n) return false;
    if (isSegment(id)) return true;
    return (
      isDevice(id) && L2_BRIDGE_TYPES.indexOf(n.type) >= 0 && !isInactive(id)
    );
  };

  const groups = {};
  DB.devices
    .filter((d) => STP_ELECT_TYPES.indexOf(d.type) >= 0 && !isInactive(d.id))
    .forEach((d) => {
      const r = _stpRep(d.id);
      (groups[r] = groups[r] || []).push(d);
    });

  const participant = {};
  Object.keys(groups).forEach((r) => {
    participant[r] = groups[r].some((m) => stpModeOf(m) !== "off");
  });
  const _liveDev = (id) =>
    DB.links.some(
      (l) =>
        !linkDown(l) &&
        (l.fromId === id || l.toId === id) &&
        (!vlan || linkCarriesVlan(l, vlan)),
    );
  const bridges = Object.keys(groups)
    .filter((r) => groups[r].some((m) => _liveDev(m.id)))
    .map((r) => ({
      id: r,
      stpPriority: Math.min(
        ...groups[r].map((m) =>
          typeof m.stpPriority === "number" ? m.stpPriority : 32768,
        ),
      ),
      merged: groups[r].length > 1,
    }));
  const mergedReps = new Set(bridges.filter((b) => b.merged).map((b) => b.id));

  DB.links.forEach((l) => {
    if (
      l.fromId !== l.toId ||
      linkDown(l) ||
      !isDevice(l.fromId) ||
      !isNode(l.fromId)
    )
      return;
    if (vlan && !linkCarriesVlan(l, vlan)) return;
    if (participant[_stpRep(l.fromId)]) blocked.add(l.id);
    else storm.add(l.id);
  });
  if (bridges.length >= 2) {
    const bid = (d) =>
      String(
        (typeof d.stpPriority === "number" ? d.stpPriority : 32768) + 1000000,
      ) +
      "|" +
      d.id;
    const root = bridges.reduce((a, b) => (bid(a) <= bid(b) ? a : b));
    rootId = root.id;
    const l2links = DB.links.filter(
      (l) =>
        !linkDown(l) &&
        isNode(l.fromId) &&
        isNode(l.toId) &&
        (!vlan || linkCarriesVlan(l, vlan)),
    );

    const edges = [];
    const mec = {};
    l2links.forEach((l) => {
      const a = _stpRep(l.fromId),
        b = _stpRep(l.toId);
      if (a === b) return;
      const hasLag = l.lag != null;
      if (hasLag || mergedReps.has(a) || mergedReps.has(b)) {
        const key = hasLag ? "lag:" + l.lag : a < b ? a + "~" + b : b + "~" + a;
        const e = mec[key];
        if (
          e &&
          hasLag &&
          !((e.a === a && e.b === b) || (e.a === b && e.b === a))
        ) {
          edges.push({ a, b, links: [l], cost: stpLinkCost(l), id: l.id });
          return;
        }
        const ee =
          e ||
          (mec[key] = {
            a,
            b,
            links: [],
            cost: Infinity,
            id: null,
            isLag: hasLag,
          });
        ee.links.push(l);
        const c = stpLinkCost(l);
        if (c < ee.cost) ee.cost = c;
        if (ee.id == null || l.id < ee.id) ee.id = l.id;
      } else edges.push({ a, b, links: [l], cost: stpLinkCost(l), id: l.id });
    });

    Object.keys(mec).forEach((k) => {
      const e = mec[k];
      if (e.isLag && e.links.length > 1)
        e.cost = Math.max(1, e.cost / e.links.length);
      edges.push(e);
    });
    const adj = {};
    edges.forEach((e) => {
      (adj[e.a] = adj[e.a] || []).push(e);
      (adj[e.b] = adj[e.b] || []).push(e);
    });

    const order = (ls) =>
      ls.slice().sort((x, y) => x.cost - y.cost || (x.id < y.id ? -1 : 1));

    const parent = {},
      parNode = {};

    const treePathEdges = (x, y) => {
      const up = (n) => {
        const arr = [];
        let k = n;
        while (k !== undefined) {
          arr.push(k);
          k = parNode[k];
        }
        return arr;
      };
      const ax = up(x),
        ay = up(y),
        setY = new Set(ay);
      let lca = null;
      for (const n of ax) {
        if (setY.has(n)) {
          lca = n;
          break;
        }
      }
      const ids = [];
      for (const n of ax) {
        if (n === lca) break;
        ids.push(parent[n]);
      }
      for (const n of ay) {
        if (n === lca) break;
        ids.push(parent[n]);
      }
      return ids;
    };
    const cycleReps = (x, y) => {
      const up = (n) => {
        const arr = [];
        let k = n;
        while (k !== undefined) {
          arr.push(k);
          k = parNode[k];
        }
        return arr;
      };
      const ax = up(x),
        ay = up(y),
        setY = new Set(ay);
      let lca = null;
      for (const n of ax) {
        if (setY.has(n)) {
          lca = n;
          break;
        }
      }
      const s = new Set();
      for (const n of ax) {
        s.add(n);
        if (n === lca) break;
      }
      for (const n of ay) {
        s.add(n);
        if (n === lca) break;
      }
      return s;
    };

    const dist = {};
    dist[root.id] = 0;
    const seq = {};
    seq[root.id] = 0;
    let seqN = 1;
    const finished = new Set();
    let frontier = [root.id];
    while (frontier.length) {
      let bi = 0;
      for (let i = 1; i < frontier.length; i++) {
        const u = frontier[i],
          v = frontier[bi];
        if (dist[u] < dist[v] || (dist[u] === dist[v] && seq[u] < seq[v]))
          bi = i;
      }
      const c = frontier.splice(bi, 1)[0];
      if (finished.has(c)) continue;
      finished.add(c);
      for (const e of order(adj[c] || [])) {
        const nb = e.a === c ? e.b : e.a;
        if (finished.has(nb)) continue;
        const nd = dist[c] + e.cost;
        if (dist[nb] === undefined || nd < dist[nb]) {
          dist[nb] = nd;
          parent[nb] = e.id;
          parNode[nb] = c;
          if (seq[nb] === undefined) seq[nb] = seqN++;
          frontier.push(nb);
        }
      }
    }

    const redundant = [];
    edges.forEach((e) => {
      if (!finished.has(e.a) || !finished.has(e.b)) return;
      if (parent[e.a] === e.id || parent[e.b] === e.id) return;
      redundant.push({ e, a: e.a, b: e.b });
    });
    const done = new Set();
    redundant.forEach(({ e, a, b }) => {
      if (done.has(e.id)) return;
      done.add(e.id);
      const reps = cycleReps(a, b);
      const hasPart = [...reps].some((r) => participant[r]);
      if (hasPart) {
        e.links.forEach((l) => blocked.add(l.id));
      } else {
        e.links.forEach((l) => storm.add(l.id));
        treePathEdges(a, b).forEach((id) => {
          const te = edges.find((x) => x.id === id);
          if (te) te.links.forEach((l) => storm.add(l.id));
        });
      }
    });
  }
  const res = { blocked, storm };
  res.root = rootId;
  _stpCache.byVlan[key] = res;
  return res;
}

function bpduGuardTripped(l) {
  if (!l || !l.port || !l.port.bpduGuard) return false;
  const a = getNode(l.fromId),
    b = getNode(l.toId);
  const sw = (n) =>
    !!(n && isDevice(n.id) && STP_ELECT_TYPES.indexOf(n.type) >= 0);
  return sw(a) && sw(b);
}
function linkDown(l) {
  return !!(l && l.port && (l.port.off || bpduGuardTripped(l)));
}

function linkUp(a, b) {
  const ls = DB.links.filter(
    (l) => (l.fromId === a && l.toId === b) || (l.fromId === b && l.toId === a),
  );
  if (!ls.length) return true;
  return ls.some((l) => !linkDown(l));
}
function stpBlockedLinks(vlan) {
  return _stpCompute(vlan).blocked;
}
function stpStormLinks(vlan) {
  return _stpCompute(vlan).storm;
}

function stpSegStorming(segId) {
  return _stpCompute(segId).storm.size > 0;
}

function stpStormNode(segId) {
  const st = stpStormLinks(segId);
  if (!st.size) return null;
  for (const l of DB.links) {
    if (st.has(l.id)) {
      for (const e of [l.fromId, l.toId]) {
        const n = getNode(e);
        if (n && isDevice(e) && STP_ELECT_TYPES.indexOf(n.type) >= 0) return n;
      }
    }
  }
  return null;
}
function stpRootId() {
  stpBlockedLinks();
  const r = _stpCache && _stpCache.byVlan["*"];
  return r ? r.root : null;
}

function stpLinkOpen(a, b, vlan) {
  const bl = stpBlockedLinks(vlan);
  if (!bl.size) return true;
  const ls = DB.links.filter(
    (l) => (l.fromId === a && l.toId === b) || (l.fromId === b && l.toId === a),
  );
  if (!ls.length) return true;
  return ls.some((l) => !bl.has(l.id));
}

const lbRuntime = {};

function lbRuntimeClear() {
  Object.keys(lbRuntime).forEach((k) => {
    delete lbRuntime[k];
  });
}

function lbRuntimeFor(id) {
  return lbRuntime[id] || (lbRuntime[id] = { rr: -1, active: {}, mconn: {} });
}
const LB_ALGO_NAME = {
  rr: "round-robin",
  leastconn: "least-connections",
  weighted: "weighted",
  srcip: "source-IP affinity",
};

function lbCandidates(lb) {
  const found = [],
    seen = new Set([lb.id]),
    q = [lb.id];
  while (q.length) {
    const c = q.shift();
    for (const nb of neighborsOf(c)) {
      if (seen.has(nb)) continue;
      seen.add(nb);
      if (isHost(nb)) {
        found.push(getNode(nb));
        continue;
      }
      if (isSegment(nb)) continue;
      if (
        isDevice(nb) &&
        (getNode(nb).type === "l2switch" ||
          getNode(nb).type === "l2mgmt" ||
          getNode(nb).type === "ap" ||
          getNode(nb).type === "hub")
      )
        q.push(nb);
    }
  }
  return found;
}
function lbBackends(lb) {
  const vip = parsePortList(lb.vipPorts);
  const cands = lbCandidates(lb);
  let cand;
  if (Array.isArray(lb.pool)) {
    const cs = new Set(cands.map((h) => h.id));
    cand = lb.pool
      .map(getNode)
      .filter((h) => h && isHost(h.id) && cs.has(h.id));
  } else cand = cands;
  return cand.filter(
    (h) =>
      (!vip.length || (h.services || []).some((p) => vip.indexOf(p) >= 0)) &&
      !isDown(h.id),
  );
}

function lbPick(lb, srcId, backends, opts) {
  opts = opts || {};
  const algo = lb.algorithm || "rr";
  const rt = lbRuntimeFor(lb.id);
  if (algo === "srcip") {
    const key = String(opts.clientKey || srcId);
    let hh = 0;
    for (let i = 0; i < key.length; i++)
      hh = (hh * 31 + key.charCodeAt(i)) >>> 0;
    return backends[hh % backends.length];
  }
  if (algo === "weighted") {
    const w = backends.map((b) =>
      Math.max(1, (lb.lbWeights && +lb.lbWeights[b.id]) || 1),
    );
    if (!opts.live) {
      let bi = 0;
      for (let i = 1; i < w.length; i++) if (w[i] > w[bi]) bi = i;
      return backends[bi];
    }
    let tot = w.reduce((a, c) => a + c, 0),
      r = Math.random() * tot;
    for (let i = 0; i < backends.length; i++) {
      r -= w[i];
      if (r <= 0) return backends[i];
    }
    return backends[backends.length - 1];
  }
  if (algo === "leastconn") {
    const act = rt.active,
      mc = rt.mconn;
    let min = Infinity,
      pick = backends[0];
    backends.forEach((b) => {
      const c = (act[b.id] || 0) + (mc[b.id] || 0);
      if (c < min) {
        min = c;
        pick = b;
      }
    });
    if (opts.commit && !opts.live) {
      mc[pick.id] = (mc[pick.id] || 0) + 1;
      const mn = Math.min(...backends.map((b) => mc[b.id] || 0));
      if (mn > 0)
        backends.forEach((b) => {
          mc[b.id] = (mc[b.id] || 0) - mn;
        });
    }
    return pick;
  }
  if (opts.commit) {
    rt.rr = (rt.rr + 1) % backends.length;
    return backends[rt.rr];
  }
  return backends[(rt.rr + 1) % backends.length];
}
function evaluateToVIP(srcId, lbId, traffic, opts) {
  const lb = getNode(lbId);
  if (isDown(lbId))
    return { status: "noroute", reason: tf("nLbDown", lb.label) };

  if (isPassiveStandby(lbId))
    return { status: "noroute", reason: tf("nLbStandby", lb.label) };
  const backends = lbBackends(lb);
  if (!backends.length)
    return { status: "noroute", reason: tf("nLbNoBackends", lb.label) };
  const vip = parsePortList(lb.vipPorts);
  if (vip.length && (traffic.port == null || vip.indexOf(traffic.port) < 0))
    return {
      status: "blocked",
      blockedAt: lb,
      hops: [],
      reason: tf("nLbVipOnly", vip.join(", ")),
    };
  const backend = lbPick(lb, srcId, backends, opts);
  const res = Object.assign({}, evaluateEP(srcId, backend.id, traffic));
  res.lbBackend = backend;
  res.lbAlgo = lb.algorithm || "rr";
  res.lbCount = backends.length;
  return res;
}

function dnsRecordsOf(h) {
  return h && Array.isArray(h.dnsRecords) ? h.dnsRecords : [];
}

function dnsServersFor(clientId, seg) {
  return dnsConfiguredFor(clientId, seg).filter((id) => isDnsNode(id));
}

function dnsConfiguredFor(clientId, seg) {
  const h = clientId && isHost(clientId) ? getNode(clientId) : null;
  const ids = h && h.dnsId ? [h.dnsId, h.dnsId2] : [seg.dnsId, seg.dnsId2];
  return ids.filter((id, i, a) => id && getNode(id) && a.indexOf(id) === i);
}

function dnsDeadResolvers(clientId, seg) {
  return dnsConfiguredFor(clientId, seg)
    .filter((id) => !isDnsNode(id))
    .map((id) => getNode(id));
}

function dnsNoServerErr(clientId, seg) {
  const dead = dnsDeadResolvers(clientId, seg);
  return dead.length
    ? { err: "resolverOff", dead: dead, via: dead[0] }
    : { err: "noResolver" };
}
const DNS_TTL_DEF = 300,
  DNS_CNAME_MAX = 8;
function dnsRecType(r) {
  const tp = r && r.type;
  return tp === "CNAME" || tp === "MX" ? tp : "A";
}

function dnsTriedPush(tried, resolverId, why, at) {
  const rn = getNode(resolverId);
  tried.push({
    label: (rn && (rn.label || rn.name)) || "?",
    why,
    atLabel: (at && (at.label || at.name)) || null,
  });
}

function resolveMx(clientId, domain) {
  const dom = dnsNorm(domain);
  if (!dom) return { err: "nxdomain" };
  const segId = epSeg(clientId),
    seg = segId ? getNode(segId) : null;
  if (!seg) return { err: "noResolver" };
  const servers = dnsServersFor(clientId, seg);
  if (!servers.length) return dnsNoServerErr(clientId, seg);
  let last = null;
  const tried = [];
  for (let i = 0; i < servers.length; i++) {
    const rid = servers[i],
      resolver = getNode(rid);
    if (rid !== clientId) {
      const r = evaluateEP(clientId, rid, {
        proto: "udp",
        port: 53,
        content: null,
        payload: null,
      });
      if (r.status !== "allowed") {
        last = {
          err: "dnsUnreachable",
          at: r.blockedAt || null,
          via: resolver,
        };
        dnsTriedPush(tried, rid, "unreachable", r.blockedAt);
        continue;
      }
    }
    let ansNode = resolver,
      fwd = null;
    if (dnsRoleOf(rid) === "forwarder") {
      const upId = dnsUpstreamOf(resolver);
      if (!upId) {
        last = { err: "nxdomain", via: resolver };
        dnsTriedPush(tried, rid, "forwardFail", null);
        continue;
      }
      const up = getNode(upId);
      const r2 = evaluateEP(rid, upId, {
        proto: "udp",
        port: 53,
        content: null,
        payload: null,
      });
      if (r2.status !== "allowed") {
        last = { err: "dnsUnreachable", at: r2.blockedAt || up, via: resolver };
        dnsTriedPush(tried, rid, "unreachable", r2.blockedAt || up);
        continue;
      }
      ansNode = up;
      fwd = resolver;
    }
    const rec = dnsRecordsOf(ansNode).find(
      (x) =>
        x &&
        dnsRecType(x) === "MX" &&
        dnsNorm(x.name) === dom &&
        getNode(x.hostId),
    );
    const res = rec
      ? { ok: true, hostId: rec.hostId, via: ansNode }
      : { err: "nxdomain", via: ansNode };
    if (fwd) res.forwarder = fwd;
    if (i > 0) {
      res.viaSecondary = true;
      res.tried = tried;
    }
    return res;
  }
  if (last) {
    if (servers.length > 1) last.failover = true;
    last.tried = tried;
  }
  return last || { err: "noResolver" };
}
function dnsRecTtl(r) {
  const n = +(r && r.ttl);
  return isFinite(n) && n > 0 ? Math.floor(n) : DNS_TTL_DEF;
}

let _dnsCache = new Map();
let _dnsClientCache = new Map();
function dnsCacheClear() {
  _dnsCache.clear();
  _dnsClientCache.clear();
  dhcpCacheClear();
}

function runtimeClear() {
  dnsCacheClear();
  lbRuntimeClear();
  radiusCacheClear();
  syslogCacheClear();
}
function _dnsNow() {
  return Date.now();
}

function dnsLookupLocal(resolver, nm, seen) {
  seen = seen || new Set();
  if (seen.has(nm) || seen.size > DNS_CNAME_MAX) return { err: "cnameLoop" };
  seen.add(nm);
  const rec = dnsRecordsOf(resolver).find(
    (x) => x && dnsRecType(x) !== "MX" && dnsNorm(x.name) === nm,
  );
  if (!rec) return null;
  if (dnsRecType(rec) === "CNAME") {
    const tgt = dnsNorm(rec.cname);
    if (!tgt) return null;
    const next = dnsLookupLocal(resolver, tgt, seen);
    if (next && next.ok)
      return {
        ok: true,
        hostId: next.hostId,
        ttl: Math.min(dnsRecTtl(rec), next.ttl),
        chain: [rec.name].concat(next.chain || []),
      };
    if (next && next.err) return next;
    return { err: "cnameDead", cname: rec.cname };
  }
  if (!getNode(rec.hostId)) return null;
  return {
    ok: true,
    hostId: rec.hostId,
    ttl: dnsRecTtl(rec),
    chain: [rec.name],
  };
}

function isDnsHost(id) {
  const h = getNode(id);
  return !!(
    h &&
    isHost(id) &&
    Array.isArray(h.services) &&
    h.services.indexOf(53) >= 0
  );
}

function dnsRoleOf(id) {
  const d = getNode(id);
  if (
    !d ||
    !isDevice(id) ||
    (d.type !== "router" && d.type !== "firewall" && d.type !== "l3switch")
  )
    return "";
  return d.dnsRole === "forwarder" || d.dnsRole === "server" ? d.dnsRole : "";
}

function isDnsNode(id) {
  return isDnsHost(id) || !!dnsRoleOf(id);
}

function dnsUpstreamOf(dev) {
  const u = dev && dev.dnsUpstreamId;
  return u && u !== dev.id && isDnsNode(u) && dnsRoleOf(u) !== "forwarder"
    ? u
    : null;
}

function dnsNodeList() {
  return (DB.hosts || [])
    .filter((h) => isDnsHost(h.id))
    .concat((DB.devices || []).filter((d) => dnsRoleOf(d.id)));
}

function dnsNorm(n) {
  return (n == null ? "" : String(n)).trim().toLowerCase().replace(/\.$/, "");
}

function hostServedNames(h) {
  const out = [];
  const f = ((h && h.fqdn) || "").trim();
  if (f) out.push(f);
  ((h && h.webNames) || []).forEach((n) => {
    const w = (n || "").trim();
    if (w) out.push(w);
  });
  return out;
}
function allDnsNames() {
  const m = new Map();
  (DB.hosts || []).concat(DB.devices || []).forEach((h) => {
    hostServedNames(h).forEach((n) => m.set(dnsNorm(n), n));
    dnsRecordsOf(h).forEach((r) => {
      const n = ((r && r.name) || "").trim();
      if (n) m.set(dnsNorm(n), n);
    });
  });
  return [...m.values()].sort((a, b) => a.localeCompare(b));
}

function resolveName(clientId, name) {
  const nm = dnsNorm(name);
  if (!nm) return { err: "nxdomain" };
  const now = _dnsNow();

  const cck = clientId + "|" + nm,
    chit = _dnsClientCache.get(cck);
  if (chit && chit.expires > now) {
    const ttlLeft = Math.max(0, Math.ceil((chit.expires - now) / 1000));
    if (chit.neg) {
      const nout = {
        err: chit.err,
        via: chit.via,
        fromCache: true,
        cacheSource: "client",
        ttl: chit.ttl,
        ttlLeft,
      };
      if (chit.fwd) nout.forwarder = chit.fwd;
      return nout;
    }
    const cout = Object.assign({}, chit.res, {
      via: chit.via,
      fromCache: true,
      cacheSource: "client",
      ttl: chit.ttl,
      ttlLeft,
    });
    if (chit.fwd) cout.forwarder = chit.fwd;
    return cout;
  }
  const segId = epSeg(clientId),
    seg = segId ? getNode(segId) : null;
  if (!seg) return { err: "noResolver" };

  const servers = dnsServersFor(clientId, seg);
  if (!servers.length) return dnsNoServerErr(clientId, seg);

  const tryServer = (resolverId) => {
    const resolver = getNode(resolverId);
    if (resolverId !== clientId) {
      const r = evaluateEP(clientId, resolverId, {
        proto: "udp",
        port: 53,
        content: null,
        payload: null,
      });
      if (r.status !== "allowed")
        return { unreachable: true, at: r.blockedAt || null, via: resolver };
    }

    let fwdNote = null;
    const storeClient = (res, viaN) => {
      _dnsClientCache.set(cck, {
        name: nm,
        neg: false,
        res: {
          ok: true,
          hostId: res.hostId,
          internet: res.internet,
          inetId: res.inetId,
          chain: res.chain,
        },
        via: viaN || resolver,
        fwd: fwdNote,
        ttl: res.ttl,
        expires: now + res.ttl * 1000,
      });
    };
    const storeClientNeg = (viaN) => {
      _dnsClientCache.set(cck, {
        name: nm,
        neg: true,
        err: "nxdomain",
        via: viaN || resolver,
        fwd: fwdNote,
        ttl: DNS_TTL_DEF,
        expires: now + DNS_TTL_DEF * 1000,
      });
    };
    const ck = resolverId + "|" + nm,
      hit = _dnsCache.get(ck);
    if (hit && hit.expires > now) {
      fwdNote = hit.fwd || null;
      storeClient(
        {
          hostId: hit.res.hostId,
          internet: hit.res.internet,
          inetId: hit.res.inetId,
          chain: hit.res.chain,
          ttl: Math.max(1, Math.ceil((hit.expires - now) / 1000)),
        },
        hit.via,
      );
      const out = Object.assign({}, hit.res, {
        via: hit.via || resolver,
        fromCache: true,
        cacheSource: "resolver",
        ttl: hit.ttl,
        ttlLeft: Math.max(0, Math.ceil((hit.expires - now) / 1000)),
      });
      if (fwdNote) out.forwarder = fwdNote;
      return out;
    }
    const keep = (res, viaN) => {
      _dnsCache.set(ck, {
        res: {
          ok: true,
          hostId: res.hostId,
          internet: res.internet,
          inetId: res.inetId,
          chain: res.chain,
        },
        via: viaN || resolver,
        fwd: fwdNote,
        ttl: res.ttl,
        expires: now + res.ttl * 1000,
      });
      storeClient(res, viaN);
      return Object.assign({}, res, { via: viaN || resolver });
    };
    const inetVia = (fromId) =>
      DB.segments
        .filter((s) => s && isInternetSeg(s.id))
        .find(
          (s) =>
            evaluateEP(fromId, s.id, {
              proto: "udp",
              port: 53,
              content: null,
              payload: null,
            }).status === "allowed",
        );

    if (dnsRoleOf(resolverId) === "forwarder") {
      fwdNote = resolver;
      const upId = dnsUpstreamOf(resolver);
      if (!upId) {
        const inet = inetVia(resolverId);
        if (inet) {
          const res = keep({
            ok: true,
            internet: true,
            inetId: inet.id,
            ttl: DNS_TTL_DEF,
          });
          res.forwarder = resolver;
          return res;
        }
        return { err: "forwardFail", via: resolver };
      }
      const up = getNode(upId);
      const r2 = evaluateEP(resolverId, upId, {
        proto: "udp",
        port: 53,
        content: null,
        payload: null,
      });
      if (r2.status !== "allowed")
        return { unreachable: true, at: r2.blockedAt || up, via: resolver };
      const loc2 = dnsLookupLocal(up, nm);
      if (loc2 && loc2.ok) {
        const res = keep(loc2, up);
        res.forwarder = resolver;
        return res;
      }
      if (loc2 && loc2.err)
        return {
          err: loc2.err,
          cname: loc2.cname,
          via: up,
          forwarder: resolver,
        };
      if (up.dnsForward !== false) {
        const inet = inetVia(upId);
        if (inet) {
          const res = keep(
            { ok: true, internet: true, inetId: inet.id, ttl: DNS_TTL_DEF },
            up,
          );
          res.forwarder = resolver;
          return res;
        }
        return { err: "forwardFail", via: up, forwarder: resolver };
      }
      storeClientNeg(up);
      return { err: "nxdomain", via: up, forwarder: resolver };
    }
    const loc = dnsLookupLocal(resolver, nm);
    if (loc && loc.ok) return keep(loc);
    if (loc && loc.err)
      return { err: loc.err, cname: loc.cname, via: resolver };
    if (resolver.dnsForward !== false) {
      const inet = DB.segments
        .filter((s) => s && isInternetSeg(s.id))
        .find(
          (s) =>
            evaluateEP(resolverId, s.id, {
              proto: "udp",
              port: 53,
              content: null,
              payload: null,
            }).status === "allowed",
        );
      if (inet)
        return keep({
          ok: true,
          internet: true,
          inetId: inet.id,
          ttl: DNS_TTL_DEF,
        });
      return { err: "forwardFail", via: resolver };
    }
    storeClientNeg();
    return { err: "nxdomain", via: resolver };
  };
  let last = null;

  const tried = [];
  for (let i = 0; i < servers.length; i++) {
    const res = tryServer(servers[i]);

    if (!res.unreachable && res.err !== "forwardFail") {
      if (i > 0) {
        res.viaSecondary = true;
        res.tried = tried;
      }
      return res;
    }
    dnsTriedPush(
      tried,
      servers[i],
      res.unreachable ? "unreachable" : "forwardFail",
      res.at,
    );
    last = res;
  }
  if (last && last.err === "forwardFail")
    return Object.assign(
      {},
      last,
      servers.length > 1 ? { failover: true, tried } : { tried },
    );
  return {
    err: "dnsUnreachable",
    at: (last && last.at) || null,
    via: last && last.via,
    failover: servers.length > 1,
    tried,
  };
}

function dnsClientFlush(id) {
  const pre = id + "|";
  [..._dnsClientCache.keys()].forEach((k) => {
    if (k.indexOf(pre) === 0) _dnsClientCache.delete(k);
  });
}
function dnsClientEntries(id) {
  const now = _dnsNow(),
    pre = id + "|",
    out = [];
  _dnsClientCache.forEach((e, k) => {
    if (k.indexOf(pre) !== 0 || e.expires <= now) return;
    out.push({
      name: e.name,
      neg: !!e.neg,
      target: e.neg
        ? null
        : e.res.internet
          ? t("dnsResolvedInet")
          : (getNode(e.res.hostId) || {}).label || "?",
      ip: e.neg ? null : e.res.internet ? null : hostIpAuto(e.res.hostId),
      via: e.via ? e.via.label : "?",
      ttlLeft: Math.max(0, Math.ceil((e.expires - now) / 1000)),
      ttl: e.ttl,
    });
  });
  return out.sort((a, b) => a.name.localeCompare(b.name));
}

function dnsConflict(name, viaId) {
  const nm = dnsNorm(name),
    via = viaId ? getNode(viaId) : null;
  if (!via) return null;

  const mine = dnsLookupLocal(via, nm);
  if (!mine || !mine.ok) return null;
  for (const h of dnsNodeList()) {
    if (h.id === viaId) continue;
    const r = dnsLookupLocal(h, nm);
    if (r && r.ok && r.hostId !== mine.hostId)
      return {
        srv: h.label,
        host: (getNode(r.hostId) || {}).label || r.hostId || "?",
      };
  }
  return null;
}

function dstEndpoint(srcId, val) {
  if (typeof val !== "string") return val;
  if (val.indexOf("mx:") === 0) {
    const rn = resolveMx(srcId, val.slice(3));
    return rn.ok ? rn.hostId : null;
  }
  if (val.indexOf("name:") !== 0) return val;
  const rn = resolveName(srcId, val.slice(5));
  if (!rn.ok) return null;
  return rn.internet ? rn.inetId : rn.hostId;
}

function allMxDomains() {
  const m = new Map();
  (DB.hosts || []).concat(DB.devices || []).forEach((h) => {
    (h.mailDomains || []).forEach((d) => {
      const dn = (d || "").trim();
      if (dn) m.set(dnsNorm(dn), dn);
    });
    dnsRecordsOf(h).forEach((r) => {
      if (r && dnsRecType(r) === "MX") {
        const n = (r.name || "").trim();
        if (n) m.set(dnsNorm(n), n);
      }
    });
  });
  return [...m.values()].sort((a, b) => a.localeCompare(b));
}
function dnsErrText(rn) {
  if (rn.err === "noResolver") return t("dnsErrNoResolver");
  if (rn.err === "resolverOff")
    return tf(
      "dnsErrResolverOff",
      esc(
        (rn.dead || [])
          .map((d) => (d && (d.label || d.name)) || "?")
          .join(", "),
      ),
    );
  if (rn.err === "dnsUnreachable")
    return (
      (rn.at
        ? tf("dnsErrUnreachAt", esc(rn.at.label || rn.at.name || "?"))
        : t("dnsErrUnreach")) + (rn.failover ? " " + t("dnsErrBothDown") : "")
    );
  if (rn.err === "forwardFail")
    return tf("dnsErrForward", esc(rn.via ? rn.via.label : "DNS"));
  if (rn.err === "cnameLoop")
    return tf("dnsErrCnameLoop", esc(rn.via ? rn.via.label : "DNS"));
  if (rn.err === "cnameDead")
    return tf(
      "dnsErrCnameDead",
      esc(rn.via ? rn.via.label : "DNS"),
      esc(rn.cname || "?"),
    );

  return (
    tf("dnsErrNx", esc(rn.via ? rn.via.label : "DNS")) +
    (rn.fromCache && rn.cacheSource === "client" ? t("dcacheFromClient") : "")
  );
}

function dnsTargetDesc(dns) {
  if (dns.targetDesc != null) return dns.targetDesc;
  if (dns.internet) return t("dnsResolvedInet");
  const h = getNode(dns.hostId);
  const ip = hostIpAuto(dns.hostId);
  return (ip ? ip + " · " : "") + (h ? h.label : dns.hostLabel || "?");
}
function dnsStepText(dns) {
  let s =
    (dns.mx
      ? tf(
          "dnsMxStep",
          esc(dns.name),
          esc(dns.hostLabel || (getNode(dns.hostId) || {}).label || "?"),
          esc(dns.via ? dns.via.label : "?"),
        )
      : tf(
          "dnsStep",
          esc(dns.name),
          esc(dnsTargetDesc(dns)),
          esc(dns.via ? dns.via.label : "?"),
        )) +
    (dns.forwarder ? tf("dnsFwdViaNote", esc(dns.forwarder.label)) : "") +
    (dns.viaSecondary ? t("dnsFailoverNote") : "");
  if (dns.chain && dns.chain.length > 1)
    s +=
      '<br><span style="color:var(--muted)">' +
      tf("dnsChainNote", esc(dns.chain.join(" → "))) +
      "</span>";
  if (dns.fromCache)
    s +=
      '<br><span style="color:var(--muted)">' +
      tf(
        dns.cacheSource === "client" ? "dnsCacheClientNote" : "dnsCacheNote",
        dns.ttlLeft,
      ) +
      "</span>";

  const cf =
    "conflict" in dns
      ? dns.conflict
      : dns.via
        ? dnsConflict(dns.name, dns.via.id)
        : null;
  if (cf)
    s +=
      '<br><b style="color:var(--amber)">' +
      tf("dnsConflictNote", esc(cf.srv), esc(cf.host)) +
      "</b>";
  return s;
}

function dnsLegs(srcId, dns) {
  if (!dns || !srcId) return [];
  if (dns.fromCache && dns.cacheSource === "client") return [];
  const q = () => ({ proto: "udp", port: 53, content: null, payload: null });
  const nlbl = (id) => {
    const n = getNode(id);
    return n ? n.label || n.name || null : null;
  };
  const leg = (from, to) => ({
    from,
    to,
    fromLabel: nlbl(from),
    toLabel: nlbl(to),
    res: evaluateEP(from, to, q()),
  });
  const fw = dns.forwarder ? dns.forwarder.id : null,
    via = dns.via ? dns.via.id : null,
    legs = [];
  const first = fw || via;
  if (first && first !== srcId) legs.push(leg(srcId, first));
  if (!dns.fromCache && fw && via && via !== fw && via !== srcId)
    legs.push(leg(fw, via));

  if (
    dns.fail &&
    !fw &&
    via &&
    dnsRoleOf(via) === "forwarder" &&
    legs.length &&
    legs[0].res.status === "allowed"
  ) {
    const up = dnsUpstreamOf(getNode(via));
    if (up && up !== via) legs.push(leg(via, up));
  }

  if (!dns.fail && dns.internet && !dns.fromCache && via) {
    const lastTo = legs.length ? legs[legs.length - 1].to : srcId;
    if (lastTo === via) {
      const inet = DB.segments
        .filter((s) => s && isInternetSeg(s.id))
        .find((s) => evaluateEP(via, s.id, q()).status === "allowed");
      if (inet) legs.push(leg(via, inet.id));
    }
  }
  return legs;
}

function dnsNodeSnap(n) {
  return n ? { id: n.id, label: n.label || n.name || "?" } : null;
}

function dnsFreezeRes(r) {
  if (!r) return r;
  return {
    status: r.status,
    reason: r.reason,
    path: r.path ? r.path.slice() : null,
    blockedAt: r.blockedAt
      ? {
          id: r.blockedAt.id,
          label: r.blockedAt.label || r.blockedAt.name || "?",
        }
      : null,
    hops: (r.hops || []).map((h) => ({
      action: h.action,
      note: h.note,
      device: {
        id: h.device && h.device.id,
        label: (h.device && (h.device.label || h.device.name)) || "?",
        type: h.device && h.device.type,
      },
      srcZone: h.srcZone ? { name: h.srcZone.name } : null,
      dstZone: h.dstZone ? { name: h.dstZone.name } : null,
    })),
  };
}

function dnsFreezeRn(rn) {
  if (!rn) return rn;
  const o = Object.assign({}, rn);
  o.via = dnsNodeSnap(rn.via);
  o.at = dnsNodeSnap(rn.at);
  if (Array.isArray(rn.dead)) o.dead = rn.dead.map(dnsNodeSnap);
  return o;
}
function dnsFreeze(srcId, dns) {
  if (!dns) return dns;
  dns.legs = dnsLegs(srcId, dns).map((l) => ({
    from: l.from,
    to: l.to,
    fromLabel: l.fromLabel,
    toLabel: l.toLabel,
    res: dnsFreezeRes(l.res),
  }));
  const h = dns.hostId ? getNode(dns.hostId) : null;
  if (h) dns.hostLabel = h.label || h.name;
  if (!dns.fail) dns.targetDesc = dnsTargetDesc(dns);
  dns.conflict = dns.via ? dnsConflict(dns.name, dns.via.id) : null;
  dns.via = dnsNodeSnap(dns.via);
  dns.forwarder = dnsNodeSnap(dns.forwarder);
  if (dns.rn) dns.rn = dnsFreezeRn(dns.rn);
  return dns;
}

function dnsStepsLi(srcId, dns) {
  if (!dns) return "";

  const lbl = (id, frozen) => {
    const n = getNode(id);
    return esc(frozen || (n && (n.label || n.name)) || "?");
  };
  const askedNode = dns.forwarder || dns.via;
  const clientCache = !!(dns.fromCache && dns.cacheSource === "client");
  const q = clientCache
    ? t("dnsStepsCacheHit")
    : askedNode
      ? tf("dnsStepsQuery", esc(dns.name), esc(askedNode.label))
      : dns.rn
        ? dnsErrText(dns.rn)
        : "";
  let out = `<li><span class="num dns">DNS</span><div class="sc"><b>${t("dnsStepsPhase")}</b><span>${q}</span></div></li>`;

  (dns.tried || []).forEach((tr) => {
    out +=
      `<li><span class="num block">✖</span><div class="sc"><b>${esc(tr.label)}</b><span>` +
      (tr.why === "forwardFail"
        ? tf("dnsStepsTriedFwd", esc(tr.label))
        : tr.atLabel
          ? tf("dnsStepsTriedAt", esc(tr.label), esc(tr.atLabel))
          : tf("dnsStepsTried", esc(tr.label))) +
      `</span></div></li>`;
  });
  let n = 0;

  (dns.legs || dnsLegs(srcId, dns)).forEach((leg, i) => {
    if (i > 0)
      out += `<li><span class="num dns">DNS</span><div class="sc"><b>${lbl(leg.from, leg.fromLabel)}</b><span>${tf("dnsStepsFwdLeg", lbl(leg.to, leg.toLabel))}</span></div></li>`;
    const hops = leg.res.hops || [];
    if (
      !hops.length &&
      leg.res.status !== "allowed" &&
      leg.res.status !== "same"
    )
      out += `<li><span class="num block">✖</span><div class="sc"><b>${lbl(leg.to, leg.toLabel)}</b><span>${tf("dnsStepsNoPath", lbl(leg.to, leg.toLabel))}${leg.res.reason ? " " + esc(leg.res.reason) : ""}</span></div></li>`;
    hops.forEach((h) => {
      n++;
      let sub = esc(h.note);
      if (h.device.type === "firewall" && h.srcZone && h.dstZone)
        sub =
          t("stepsZone") +
          " " +
          esc(h.srcZone.name) +
          " → " +
          esc(h.dstZone.name) +
          " · " +
          esc(h.note);
      out += `<li><span class="num ${h.action === "deny" ? "block" : "dns"}">D${n}</span><div class="sc"><b>${esc(h.device.label)}</b><span>${sub}</span></div></li>`;
    });
  });
  if (dns.fail)
    out += `<li><span class="num block">✖</span><div class="sc"><b>${t("dnsStepsFailHdr")}</b><span>${dns.rn ? dnsErrText(dns.rn) : ""}</span></div></li>`;
  else
    out += `<li><span class="num dns">✔</span><div class="sc"><b>${t("dnsStepsAnswer")}</b><span>${dnsStepText(dns)}<br><span style="color:var(--muted)">${t("dnsStepsConn")}</span></span></div></li>`;
  return out;
}
function evaluateEP(srcId, dstId, traffic, opts) {
  if (!_radGuard) radiusCacheClear();
  if (srcId === dstId) return { status: "same" };

  if (isHost(srcId) && !neighborsOf(srcId).length)
    return { status: "noroute", reason: t("nSrcHostUnplugged") };
  if (isHost(dstId) && !neighborsOf(dstId).length)
    return { status: "noroute", reason: t("nDstHostUnplugged") };

  if (isHost(srcId) && isDown(srcId))
    return { status: "noroute", reason: t("nSrcHostOff") };
  if (isHost(srcId) && isQuar(srcId))
    return { status: "noroute", reason: t("nSrcQuar") };
  if (isHost(dstId) && isQuar(dstId))
    return { status: "noroute", reason: t("nDstQuar") };
  if (isHost(dstId) && isDown(dstId))
    return { status: "noroute", reason: t("nDstHostOff") };
  if (isDevice(dstId) && getNode(dstId).type === "loadbalancer")
    return evaluateToVIP(srcId, dstId, traffic, opts);

  if (isHost(srcId) && getNode(srcId).vpnSplit && isVpnHost(srcId)) {
    const dseg = epSeg(dstId),
      dn = getNode(dseg);
    if (dn && (dn.isInternet || dn.subnet === "0.0.0.0/0")) {
      const direct = neighborsOf(srcId).find(
        (n) => isSegment(n) && isInternetSeg(n),
      );
      if (direct)
        return {
          status: "allowed",
          path: [srcId, direct],
          hops: [],
          splitTunnel: true,
        };
    }
  }
  const sSeg = epSeg(srcId),
    dSeg = epSeg(dstId);
  if (isHost(srcId) && !sSeg)
    return { status: "noroute", reason: t("nSrcHostNoSeg") };
  if (isHost(dstId) && !dSeg)
    return { status: "noroute", reason: t("nDstHostNoSeg") };

  if (isHost(srcId) && !hostHasIp(srcId))
    return { status: "noroute", reason: t("nSrcNoIp") };
  if (isHost(dstId) && !hostHasIp(dstId))
    return { status: "noroute", reason: t("nDstNoIp") };

  if (isHost(srcId) && !hostIpInSubnet(srcId))
    return { status: "noroute", reason: t("nSrcBadIp") };
  if (isHost(dstId) && !hostIpInSubnet(dstId))
    return { status: "noroute", reason: t("nDstBadIp") };
  if (isHost(srcId) && hostIpConflict(srcId))
    return { status: "noroute", reason: t("nSrcIpConflict") };
  if (isHost(dstId) && hostIpConflict(dstId))
    return { status: "noroute", reason: t("nDstIpConflict") };

  if (isHost(srcId) && !hostLinkCarriesVlan(srcId))
    return { status: "noroute", reason: t("nSrcPortVlan") };
  if (isHost(dstId) && !hostLinkCarriesVlan(dstId))
    return { status: "noroute", reason: t("nDstPortVlan") };

  {
    const a = hostPortAuthorized(srcId);
    if (isHost(srcId) && a !== true)
      return {
        status: "noroute",
        reason: t(a === "creds" ? "nSrcDot1xCreds" : "nSrcDot1x"),
      };
  }
  {
    const a = hostPortAuthorized(dstId);
    if (isHost(dstId) && a !== true)
      return {
        status: "noroute",
        reason: t(a === "creds" ? "nDstDot1xCreds" : "nDstDot1x"),
      };
  }

  if (isHost(srcId)) {
    const v = hostPortSecViolation(srcId);
    if (v)
      return {
        status: "noroute",
        reason: t(v === "max" ? "nSrcPortSecMax" : "nSrcPortSec"),
      };
  }
  if (isHost(dstId)) {
    const v = hostPortSecViolation(dstId);
    if (v)
      return {
        status: "noroute",
        reason: t(v === "max" ? "nDstPortSecMax" : "nDstPortSec"),
      };
  }

  for (const _vid of [srcId, dstId]) {
    if (isHost(_vid) && isVpnHost(_vid)) {
      const _vfw = segVpnFirewall(epSeg(_vid));
      if (
        _vfw &&
        _vfw.vpnRadiusId &&
        !radiusReachable(_vfw.id, _vfw.vpnRadiusId)
      )
        return { status: "noroute", reason: t("nVpnAuthDown") };
    }
  }
  let dnatRule = null;
  if (isHost(dstId) && sSeg && isInternetSeg(sSeg) && !isInternetSeg(dSeg)) {
    const p = findFullPath(sSeg, dSeg);
    if (p)
      for (const id of p) {
        if (!isDevice(id)) continue;
        const d = getNode(id);
        if (d.type === "firewall" || d.type === "router") {
          dnatRule =
            (d.portForwards || []).find(
              (x) =>
                x.hostId === dstId &&
                x.proto === traffic.proto &&
                +x.pubPort === +traffic.port,
            ) || null;

          if (
            !dnatRule &&
            d.type === "firewall" &&
            (d.staticNat || []).some((x) => x.hostId === dstId)
          )
            dnatRule = {
              hostId: dstId,
              proto: traffic.proto,
              pubPort: traffic.port,
              intPort: traffic.port,
              _static: true,
              _fwId: d.id,
            };
          if (dnatRule) break;
        }
      }
  }
  let res;
  if (sSeg === dSeg) {
    if (stpSegStorming(sSeg)) {
      const bn = stpStormNode(sSeg) || getNode(sSeg);
      return {
        status: "blocked",
        hops: [],
        blockedAt: bn,
        reason: t("nStpStorm"),
      };
    }

    if (isHost(srcId) && isHost(dstId)) {
      const lp = l2Path(srcId, dstId);
      if (!lp) {
        const phys = physBFS(srcId, dstId);
        const bid =
          phys &&
          phys.find(
            (nid) =>
              isDevice(nid) &&
              L2_BOUNDARY_TYPES.indexOf(getNode(nid).type) >= 0,
          );
        if (bid) {
          const bdev = getNode(bid);
          const tn =
            {
              router: "router",
              firewall: "firewall",
              loadbalancer: "load balancer",
              vpn: t("nVpnGw"),
            }[bdev.type] || t("nL3Elem");
          const cut = phys.slice(0, phys.indexOf(bid) + 1);
          res = {
            status: "blocked",
            path: cut,
            hops: [],
            blockedAt: bdev,
            reason: tf("nSameVlanBlocked", tn, bdev.label),
          };
        } else {
          res = { status: "noroute", reason: t("nSameVlanNoLink") };
        }
      } else {
        const hops = [];
        let blk = null;
        for (const nid of lp) {
          if (!isDevice(nid)) continue;
          const d = getNode(nid);
          if (d.type === "l2switch" || d.type === "hub") {
            hops.push({
              device: d,
              action: "forward",
              note: t(d.type === "hub" ? "nHubFlood" : "nL2SameVlan"),
            });
          } else if (d.type === "l2mgmt") {
            const m = evaluateAcl(
              d.acl || [],
              epSeg(srcId),
              epSeg(dstId),
              traffic,
              d.aclDefault,
            );
            if (m.action === "deny") {
              hops.push({
                device: d,
                action: "deny",
                note: m.note,
                rule: m.rule,
                ruleNo: m.ruleNo,
              });
              blk = d;
              break;
            }
            hops.push({
              device: d,
              action: "forward",
              note:
                t("nL2SameVlan") +
                (d.acl && d.acl.length && m.ruleNo
                  ? tf("nAclTag", m.ruleNo)
                  : ""),
            });
          } else if (d.type === "ap") {
            hops.push({ device: d, action: "forward", note: t("nApSameVlan") });
          } else if (d.type === "l3switch") {
            hops.push({ device: d, action: "forward", note: t("nL3SameVlan") });
          } else if (d.type === "idsips") {
            const hit = matchSignature(d, traffic);
            if (d.mode === "ips" && hit) {
              hops.push({
                device: d,
                action: "deny",
                note: tf("nIpsBlockedInline", hit),
              });
              blk = d;
              break;
            }
            hops.push({
              device: d,
              action: "forward",
              note:
                d.mode === "ids"
                  ? hit
                    ? tf("nIdsAlertShort", hit)
                    : t("nIdsPassiveShort")
                  : t("nIpsInlineNoMatchShort"),
            });
          }
        }
        if (blk) {
          const reason =
            blk.type === "l2mgmt"
              ? hops[hops.length - 1].note
              : tf("nIpsSameVlan", matchSignature(blk, traffic));
          res = { status: "blocked", path: lp, hops, blockedAt: blk, reason };
        } else res = { status: "allowed", path: lp, hops };
      }
    } else {
      res = { status: "allowed", path: [sSeg], hops: [] };
    }
  } else {
    for (const sg of [sSeg, dSeg]) {
      if (sg && !isInternetSeg(sg) && stpSegStorming(sg)) {
        const bn = stpStormNode(sg) || getNode(sg);
        return {
          status: "blocked",
          hops: [],
          blockedAt: bn,
          reason: t("nStpStorm"),
        };
      }
    }

    if (
      isHost(srcId) &&
      isHost(dstId) &&
      hostPortDynamic(srcId) &&
      dSeg &&
      !isInternetSeg(dSeg)
    ) {
      const hop = l2Path(srcId, dstId, dSeg);
      if (hop) {
        const hops = hop
          .filter((id) => isDevice(id))
          .map((id) => ({
            device: getNode(id),
            action: "forward",
            note: t("nVlanHop"),
          }));
        res = { status: "allowed", path: hop, hops, spoof: true };
      }
    }
    if (!res) {
      if (isHost(srcId) && !hostGwOk(srcId))
        return { status: "noroute", reason: t("nBadGw") };

      if (isHost(srcId) && arpPoisoned(srcId))
        return { status: "noroute", reason: t("nArpSpoof") };

      if (isHost(srcId) && !plainReachable(srcId, sSeg)) {
        const _od = offAccessDevice(srcId);
        return {
          status: "noroute",
          reason: _od ? tf("nSrcAccessDownNamed", _od) : t("nSrcAccessDown"),
        };
      }
      if (isHost(dstId) && !plainReachable(dstId, dSeg)) {
        const _od = offAccessDevice(dstId);
        return {
          status: "noroute",
          reason: _od ? tf("nDstAccessDownNamed", _od) : t("nDstAccessDown"),
        };
      }
      res = evaluate(sSeg, dSeg, traffic, dnatRule);
    }
  }
  res = Object.assign({}, res);

  if (
    isHost(srcId) &&
    isVpnHost(srcId) &&
    !res.splitTunnel &&
    res.path &&
    res.status !== "noroute"
  ) {
    const vfw0 = segVpnFirewall(sSeg);
    if (vfw0) {
      const fwIds = new Set([vfw0.id]);
      if (vfw0.haPeer) fwIds.add(vfw0.haPeer);
      const fwOnPath = res.path.find((id) => fwIds.has(id));
      if (fwOnPath) {
        const under = physBFS(srcId, fwOnPath);
        if (!under) return { status: "noroute", reason: t("nVpnNoPhys") };
        res.path = under.concat(res.path.slice(res.path.indexOf(fwOnPath) + 1));
        const trans = under
          .slice(1, -1)
          .filter((id) => isDevice(id))
          .map((id) => ({
            device: getNode(id),
            action: "forward",
            note: t("nVpnTransit"),
          }));
        if (trans.length) res.hops = trans.concat(res.hops || []);
      }
    }
  }

  if (res.path) {
    const p = res.path.slice();
    if (isHost(srcId) && p[0] !== srcId) p.unshift(srcId);
    if (isHost(dstId) && res.status === "allowed" && p[p.length - 1] !== dstId)
      p.push(dstId);
    res.path = p;
  }

  if (
    res.status === "allowed" &&
    res.hops &&
    res.hops.length &&
    isHost(srcId) &&
    isInternetSeg(dSeg)
  ) {
    const natHop = [...res.hops]
      .reverse()
      .find(
        (h) =>
          h.device &&
          (h.device.type === "router" || h.device.type === "firewall"),
      );
    if (natHop && isAdvanced()) {
      const inIp = hostIpAuto(srcId) || "?",
        eph = natEphPort(srcId);
      const pubIp = natPublicIp(natHop.device.id),
        pubPort = natPatPort(inIp + ":" + eph);
      res.nat = {
        inside: inIp + ":" + eph,
        outside: pubIp + ":" + pubPort,
        dev: natHop.device.label,
      };
      {
        const k = natHop.device.id + "|" + inIp + ":" + eph;
        if (!natLog.has(k) && natLog.size < NATLOG_MAX)
          natLog.set(k, {
            dev: natHop.device.id,
            inside: inIp + ":" + eph,
            outside: pubIp + ":" + pubPort,
          });
      }
      natHop.note =
        natHop.note + " · " + tf("nNatXlate", res.nat.inside, res.nat.outside);
    }
  }

  if (
    isAdvanced() &&
    res.status === "allowed" &&
    res.hops &&
    res.hops.length &&
    ((dSeg && isInternetSeg(dSeg)) || (sSeg && isInternetSeg(sSeg)))
  ) {
    const bh = res.hops.find(
      (h) =>
        h.device &&
        h.device.wanMode === "balance" &&
        wanLinksOf(h.device).filter((l) => !linkDown(l)).length >= 2,
    );
    if (bh) {
      const n = wanLinksOf(bh.device).filter((l) => !linkDown(l)).length;
      bh.note = (bh.note ? bh.note + " · " : "") + tf("nWanBalance", n);
    }
  }

  if (res.status === "allowed" && isHost(dstId)) {
    const h = getNode(dstId);
    const effPort = dnatRule ? +dnatRule.intPort : traffic.port;
    if (traffic.proto === "icmp") {
    } else if (!h.services || !h.services.length) {
      return {
        status: "blocked",
        path: res.path,
        hops: res.hops,
        blockedAt: h,
        reason: tf("nHostNoPorts", h.label),
      };
    } else if (effPort == null || h.services.indexOf(effPort) < 0) {
      return {
        status: "blocked",
        path: res.path,
        hops: res.hops,
        blockedAt: h,
        reason: tf(
          "nHostNoSvc",
          h.label,
          effPort == null ? t("nNoPort") : effPort,
          h.services.join(", "),
        ),
      };
    }
  }
  if (res.status === "allowed") {
    res.ttlHops = ttlL3Hops(res.hops);
    res = applyTtl(res);
  }
  return res;
}
function clearBlast() {
  document
    .querySelectorAll(".node.attacker,.node.reach,.node.safe,.node.spof")
    .forEach((g) => g.classList.remove("attacker", "reach", "safe", "spof"));
}

function clearManualTestFx() {
  document
    .querySelectorAll(".link.active-ok,.link.active-block")
    .forEach((l) => l.classList.remove("active-ok", "active-block"));
  const ov = $("gOverlay");
  if (ov)
    ov.querySelectorAll(".packet,.blockX,.hubflood,.dnspkt,.dnstrace").forEach(
      (e) => e.remove(),
    );
  if (typeof animRAF !== "undefined" && animRAF) cancelAnimationFrame(animRAF);
}

let __haTmp = 0;
function mirrorHaLinks(downId, peerId) {
  const added = [];
  const downDev = getNode(downId),
    peer = getNode(peerId);
  neighborsOf(downId).forEach((n) => {
    if (n === peerId || n === downId || isHost(n)) return;
    const exists = DB.links.some(
      (l) =>
        (l.fromId === peerId && l.toId === n) ||
        (l.toId === peerId && l.fromId === n),
    );
    if (!exists) {
      const id = "__ha" + ++__haTmp;
      DB.links.push({ id, fromId: peerId, toId: n });
      added.push(id);

      if (downDev && peer && downDev.ifaceZones) {
        const dl = DB.links.find(
          (l) =>
            (l.fromId === downId && l.toId === n) ||
            (l.toId === downId && l.fromId === n),
        );
        const z = dl && downDev.ifaceZones[dl.id];
        if (z) {
          (peer.ifaceZones || (peer.ifaceZones = {}))[id] = z;
        }
      }
    }
  });
  return added;
}
function runResilience() {
  clearBlast();
  aaClearSkip();
  __haTmp = 0;
  document
    .querySelectorAll(".link")
    .forEach((l) => l.classList.remove("active-ok", "active-block"));
  $("gOverlay")
    .querySelectorAll(".packet,.blockX,.dnspkt,.dnstrace")
    .forEach((e) => e.remove());
  const rawDst = $("selDst").value,
    byName = rawDst.indexOf("name:") === 0 || rawDst.indexOf("mx:") === 0;
  const src = $("selSrc").value,
    dst = dstEndpoint(src, rawDst);
  if (!src || !dst) {
    setStatus(t(byName ? "dnsVerdFail" : "stPickSrcDst"), false);
    return;
  }
  const traffic = currentTraffic();
  const base = evaluateEP(src, dst, traffic);
  $("result").style.display = "block";
  $("probes").style.display = "none";
  {
    const _st = $("result").querySelector(".subtabs");
    if (_st) _st.style.display = "none";
  }
  if (base.status !== "allowed") {
    $("resBody").innerHTML =
      `<div class="verdict warn"><span class="ic">${icon("shield")}</span>${t("verdResilience")}</div>
      <div class="expl">${tf("explResilienceNotWorking", base.status === "blocked" ? t("verdBlocked") : t("simNoRoute"))}</div>`;
    return;
  }

  const up = DB.devices
    .filter((d) => !d.down)
    .concat(
      (DB.hosts || []).filter((h) => !h.down && h.id !== src && h.id !== dst),
    );
  const spof = [];
  up.forEach((d) => {
    d.down = true;
    dhcpCacheClear();
    let temp = [],
      peer = null,
      r;
    try {
      if (d.haPeer) {
        const p = getNode(d.haPeer);
        if (p && !p.down) {
          peer = p;
          temp = mirrorHaLinks(d.id, p.id);
        }
      }
      if (byName) {
        runtimeClear();
        const dd = dstEndpoint(src, rawDst);
        r = dd ? evaluateEP(src, dd, traffic) : { status: "noroute" };
      } else r = evaluateEP(src, dst, traffic);
    } finally {
      if (temp.length) {
        DB.links = DB.links.filter((l) => temp.indexOf(l.id) < 0);
        if (peer && peer.ifaceZones)
          temp.forEach((id) => delete peer.ifaceZones[id]);
      }
      d.down = false;
      dhcpCacheClear();
    }
    if (r && r.status !== "allowed") spof.push(d);
  });
  if (byName) runtimeClear();
  const resilient = spof.length === 0 && up.length > 0;
  spof.forEach((d) => {
    if (nodeEls[d.id]) nodeEls[d.id].classList.add("spof");
  });
  $("resBody").innerHTML =
    `<div class="verdict ${resilient ? "ok" : "block"}"><span class="ic">${resilient ? "✔" : "⚠"}</span>${resilient ? t("verdResilientOk") : t("verdSpof")}</div>
    <div class="expl">${
      resilient
        ? "<b>" +
          esc(getNode(src).name || getNode(src).label) +
          " → " +
          esc(getNode(dst).name || getNode(dst).label) +
          "</b> " +
          t("explResilientOk")
        : t("explSpof") +
          " <b style='color:var(--red)'>" +
          spof.map((d) => esc(d.label)).join(", ") +
          "</b>. " +
          t("explSpofAdvice")
    }
      <br><span style="color:var(--muted)">${t("explResilientTip")}</span></div>`;
  setStatus(
    resilient
      ? t("stResilientN1")
      : t("stSpof") + ": " + spof.map((d) => d.label).join(", "),
  );
}

function _audComponents(skipId) {
  const seen = new Set(skipId ? [skipId] : []);
  const comp = new Map();
  let c = 0;
  for (const s of DB.segments) {
    if (seen.has(s.id) || comp.has(s.id)) continue;
    c++;
    const q = [s.id];
    seen.add(s.id);
    comp.set(s.id, c);
    while (q.length) {
      const x = q.shift();
      for (const nb of neighborsOf(x)) {
        if (seen.has(nb)) continue;
        seen.add(nb);
        if (isSegment(nb)) comp.set(nb, c);
        q.push(nb);
      }
    }
  }
  return comp;
}
function _quarList() {
  return (DB.devices || [])
    .concat(DB.hosts || [])
    .filter((x) => x && x.quar)
    .map((x) => x.label || x.name || x.id);
}
function auditTopology() {
  const F = [];

  DB.segments
    .filter((s) => !s.isInternet && stpSegStorming(s.id))
    .forEach((s) => F.push({ sev: "crit", text: tf("audStorm", s.name) }));

  {
    const lh = logHosts();
    if (lh.length) {
      const ntp = (DB.hosts || []).filter(
        (h) =>
          Array.isArray(h.services) && h.services.indexOf(123) >= 0 && !h.down,
      );
      if (!ntp.length) F.push({ sev: "tip", text: t("audNoNtp") });
      else {
        const _ntpReach = (a, b) => {
          if (_sysGuard) return true;
          let v = false;
          _sysGuard = true;
          try {
            v =
              evaluateEP(a, b, { proto: "udp", port: 123 }).status ===
              "allowed";
          } catch (e) {}
          _sysGuard = false;
          return v;
        };
        const unreach = lh.filter(
          (l) => !ntp.some((n) => n.id === l.id || _ntpReach(l.id, n.id)),
        );
        if (unreach.length)
          F.push({
            sev: "warn",
            text: tf("audNtpUnreach", unreach[0].label || unreach[0].name),
          });
      }
    }
  }

  (DB.hosts || [])
    .filter((h) => h.arpSpoof && !isInactive(h.id) && !arpSpooferStopped(h.id))
    .forEach((h) => {
      F.push({
        sev: "crit",
        text: tf("audArpSpoof", h.label || h.name || h.id),
      });
    });

  (DB.devices || [])
    .filter((d) => d.type === "firewall" && !isInactive(d.id))
    .forEach((d) => {
      const wide = (d.firewallRules || []).some(
        (r) =>
          r &&
          r.action === "permit" &&
          (r.srcSeg === "*" || !r.srcSeg) &&
          (r.dstSeg === "*" || !r.dstSeg) &&
          (!r.proto || r.proto === "ip") &&
          (!r.portOp || r.portOp === "any"),
      );
      if (wide)
        F.push({
          sev: "crit",
          text: tf("audAnyAny", d.label || d.name || d.id),
        });
    });

  (DB.hosts || [])
    .filter((h) => h.dhcpd && h.dhcpd.rogue && !isInactive(h.id))
    .forEach((h) => {
      if (dhcpOfferSurvives(h.id))
        F.push({
          sev: "crit",
          text: tf("audRogueDhcp", h.label || h.name || h.id),
        });
    });

  {
    const byName = {};
    (DB.devices || [])
      .filter((d) => !isInactive(d.id))
      .forEach((d) => {
        if (typeof apEffSsids !== "function") return;
        (Array.isArray(d.ssids) ? apEffSsids(d) : []).forEach((ss) => {
          if (ss.on === false || !(ss.name || "").trim()) return;
          const k = ss.name.trim();
          (byName[k] = byName[k] || []).push({
            dev: d,
            sec: ssidSec(ss),
            seg: ss.segId,
          });
        });
      });
    Object.keys(byName).forEach((k) => {
      const v = byName[k];
      if (v.length < 2) return;
      const secs = new Set(v.map((x) => x.sec)),
        segs = new Set(v.map((x) => x.seg));
      if (secs.size > 1 || segs.size > 1)
        F.push({ sev: "crit", text: tf("audEvilTwin", k) });
    });
  }

  DB.segments
    .filter((s) => s.isInternet)
    .forEach((s) => {
      neighborsOf(s.id)
        .filter(isDevice)
        .map(getNode)
        .forEach((d) => {
          if (
            !d ||
            d.type === "firewall" ||
            d.type === "idsips" ||
            d.type === "vpn"
          )
            return;
          if (d.type === "router")
            F.push({ sev: "tip", text: tf("audEdgeRouter", d.label) });
          else F.push({ sev: "warn", text: tf("audEdgeNoFw", d.label || "?") });
        });
    });

  DB.devices
    .filter((d) => d.type === "firewall")
    .forEach((fw) => {
      const zrole = (id) => {
        const z = (fw.zones || []).find((z) => z.id === id);
        return z ? z.role : null;
      };
      (fw.firewallRules || []).forEach((r, i) => {
        if (r.action !== "permit") return;
        const broad =
          (r.proto === "ip" || !r.proto) && (r.portOp === "any" || !r.portOp);
        if (!broad) return;
        const sr = zrole(r.srcZone),
          dr = zrole(r.dstZone);
        if (sr === "outside" && dr === "inside")
          F.push({ sev: "crit", text: tf("audAnyIn", fw.label, i + 1) });
        else if (sr === "outside" && dr === "dmz")
          F.push({ sev: "warn", text: tf("audOutDmzBroad", fw.label, i + 1) });
        else if (sr === "dmz" && dr === "inside")
          F.push({ sev: "warn", text: tf("audDmzInside", fw.label, i + 1) });
      });
    });

  const base = _audComponents(null);
  const groups = new Map();
  base.forEach((c, sid) => {
    const g = groups.get(c) || [];
    g.push(sid);
    groups.set(c, g);
  });
  const leafCut = [];
  DB.devices.forEach((d) => {
    if (isInactive(d.id)) return;
    if (d.haPeer) {
      const p = getNode(d.haPeer);
      if (p && !isInactive(p.id)) return;
    }
    const c2 = _audComponents(d.id);
    for (const [, segs] of groups) {
      if (segs.length < 2) continue;
      const parts = new Map();
      segs.forEach((sid) => {
        const c = c2.get(sid);
        const a = parts.get(c) || [];
        a.push(sid);
        parts.set(c, a);
      });
      if (parts.size < 2) continue;
      const arr = [...parts.values()];
      const singles = arr.filter((a) => a.length === 1);
      const inetSplit =
        arr.length > 1 &&
        arr.some((a) =>
          a.every((sid) => {
            const s = getNode(sid);
            return s && s.isInternet;
          }),
        ) &&
        arr.some((a) =>
          a.some((sid) => {
            const s = getNode(sid);
            return s && !s.isInternet;
          }),
        );
      if (
        arr.length === 2 &&
        singles.length &&
        singles.some((a) => {
          const s = getNode(a[0]);
          return s && !s.isInternet;
        }) &&
        !inetSplit
      ) {
        leafCut.push(d.label);
      } else if (inetSplit && arr.length === 2)
        F.push({ sev: "warn", text: tf("audSpofEdge", d.label) });
      else F.push({ sev: "warn", text: tf("audSpof", d.label) });
      break;
    }
  });
  if (leafCut.length)
    F.push({ sev: "tip", text: tf("audSpofLeafAgg", leafCut.join(", ")) });

  const dnsHosts = dnsNodeList().filter((n) => !isInactive(n.id));
  {
    const d1 = [],
      d2 = [];
    DB.segments.forEach((s) => {
      if (s.dnsId && !getNode(s.dnsId)) d1.push(s.name || s.id);
      if (s.dnsId2 && !getNode(s.dnsId2)) d2.push(s.name || s.id);
    });
    if (d1.length)
      F.push({ sev: "warn", text: tf("audDnsDangling", d1.join(", ")) });
    if (d2.length)
      F.push({ sev: "warn", text: tf("audDnsDangling2", d2.join(", ")) });
  }

  (DB.hosts || []).forEach((h) => {
    if (h.dnsId && !getNode(h.dnsId))
      F.push({ sev: "warn", text: tf("audDnsDanglingHost", h.label || h.id) });
    if (h.dnsId2 && !getNode(h.dnsId2))
      F.push({ sev: "warn", text: tf("audDnsDanglingHost2", h.label || h.id) });
  });

  DB.segments
    .filter((s) => s.dhcpSrvId)
    .forEach((s) => {
      if (!getNode(s.dhcpSrvId)) {
        F.push({ sev: "warn", text: tf("audDhcpDangling", s.name || s.id) });
        return;
      }
      if (!isDhcpServerNode(s.dhcpSrvId)) return;
      if (!dhcpServerReachable(s.id, s.dhcpSrvId))
        F.push({ sev: "warn", text: tf("audDhcpUnreach", s.name || s.id) });
    });
  if (dnsHosts.length) {
    const usedR = new Set();
    const addR = (id) => {
      if (id && getNode(id) && !isInactive(id)) usedR.add(id);
    };
    DB.segments.forEach((s) => {
      addR(s.dnsId);
      addR(s.dnsId2);
    });
    (DB.hosts || []).forEach((h) => {
      addR(h.dnsId);
      addR(h.dnsId2);
    });
    const effR = new Set(
      [...usedR].map((id) => {
        if (dnsRoleOf(id) === "forwarder") {
          const up = dnsUpstreamOf(getNode(id));
          if (up) return up;
        }
        return id;
      }),
    );
    if (effR.size === 1) {
      const d = getNode([...effR][0]);
      F.push({ sev: "warn", text: tf("audDnsSpof", d.label || d.id) });
    }
    const NEEDS_NAMES = ["pc", "ntb", "server", "mobile", "tablet", "nas"];
    DB.segments
      .filter((s) => !s.isInternet && !s.dnsId)
      .forEach((s) => {
        const cli = (DB.hosts || []).find(
          (h) =>
            h.segId === s.id &&
            NEEDS_NAMES.indexOf(h.kind) >= 0 &&
            !isInactive(h.id),
        );
        if (!cli) return;
        const reach = dnsHosts.find((d) => {
          if (d.segId === s.id) return true;
          try {
            return (
              evaluateEP(cli.id, d.id, { proto: "udp", port: 53 }).status ===
              "allowed"
            );
          } catch (e) {
            return false;
          }
        });
        if (reach)
          F.push({
            sev: "tip",
            text: tf(
              "audDnsNoResolver",
              s.name || s.id,
              reach.label || reach.id,
            ),
          });
      });
  }

  [].concat(DB.devices, DB.hosts || [], DB.segments).forEach((n) => {
    try {
      nodeWarnings(n).forEach((w) =>
        F.push({ sev: "warn", text: (n.label || n.name || n.id) + ": " + w }),
      );
    } catch (e) {}
  });
  const order = { crit: 0, warn: 1, tip: 2 };
  {
    const q = _quarList();
    if (q.length) F.push({ sev: "tip", text: tf("audQuar", q.join(", ")) });
  }
  {
    const cong = (DB.links || [])
      .filter((l) => l.congested)
      .map((l) => {
        const a = getNode(l.fromId),
          b = getNode(l.toId);
        return (
          ((a && (a.label || a.name)) || "?") +
          " — " +
          ((b && (b.label || b.name)) || "?")
        );
      });
    if (cong.length)
      F.push({ sev: "tip", text: tf("audCongested", cong.join(", ")) });
  }
  return F.sort((a, b) => order[a.sev] - order[b.sev]);
}
function runAudit() {
  clearBlast();
  aaClearSkip();
  $("result").style.display = "block";
  $("probes").style.display = "none";
  {
    const _st = $("result").querySelector(".subtabs");
    if (_st) _st.style.display = "none";
  }

  if (
    !DB.devices.length &&
    !(DB.hosts || []).length &&
    !DB.segments.filter((s) => !s.isInternet).length
  ) {
    $("resBody").innerHTML =
      `<div class="verdict warn"><span class="ic">${icon("info")}</span>${t("audEmpty")}</div><div class="expl">${t("audEmptyExpl")}</div>`;
    setStatus(t("audEmpty"), false);
    return;
  }
  const F = auditTopology();
  const sevMeta = {
    crit: { c: "var(--red)", lbl: t("audCrit") },
    warn: { c: "var(--amber)", lbl: t("audWarn") },
    tip: { c: "var(--muted)", lbl: t("audTip") },
  };
  if (!F.length) {
    $("resBody").innerHTML =
      `<div class="verdict ok"><span class="ic">✔</span>${t("audOkAll")}</div><div class="expl">${t("audOkExpl")}</div>`;
    setStatus(t("audOkAll"));
    return;
  }
  const rows = F.map(
    (f) =>
      `<div style="display:flex;gap:8px;align-items:flex-start;margin:5px 0;font-size:12px;line-height:1.45"><span style="flex:none;font-size:9px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;padding:1px 7px;border-radius:10px;border:1px solid ${sevMeta[f.sev].c};color:${sevMeta[f.sev].c};margin-top:1px">${sevMeta[f.sev].lbl}</span><span>${esc(f.text)}</span></div>`,
  ).join("");
  const nCrit = F.filter((f) => f.sev === "crit").length;
  $("resBody").innerHTML =
    `<div class="verdict ${nCrit ? "block" : "warn"}"><span class="ic">${nCrit ? "⚠" : icon("checkcircle")}</span>${tf("audFound", F.length)}</div><div class="expl">${rows}</div>`;
  setStatus(tf("audFound", F.length));
}
function runTest() {
  clearBlast();
  const src = $("selSrc").value,
    dst = $("selDst").value;
  if (!src || !dst) {
    setStatus(t("stPickSrcDst"), false);
    return;
  }
  const traffic = currentTraffic();
  aaClearSkip();
  try {
    let dstId = dst,
      dns = null;

    if (
      (dst.indexOf("mx:") === 0 || dst.indexOf("name:") === 0) &&
      isHost(src) &&
      isDown(src)
    ) {
      const res = { status: "noroute", reason: t("nSrcHostOff") };
      lastResult = res;
      showResult(res, traffic);
      $("probes").style.display = "none";
      animateResult(res);
      return;
    }
    if (dst.indexOf("mx:") === 0) {
      const dom = dst.slice(3),
        rn = resolveMx(src, dom);
      if (!rn.ok) {
        showDnsFail(rn, src, dom, true);
        return;
      }
      dstId = rn.hostId;
      dns = {
        mx: true,
        name: dom,
        via: rn.via,
        hostId: rn.hostId,
        viaSecondary: rn.viaSecondary,
        forwarder: rn.forwarder,
      };
    } else if (dst.indexOf("name:") === 0) {
      const nm = dst.slice(5),
        rn = resolveName(src, nm);
      if (!rn.ok) {
        showDnsFail(rn, src, nm, false);
        return;
      }
      dstId = rn.internet ? rn.inetId : rn.hostId;
      dns = {
        name: nm,
        via: rn.via,
        internet: !!rn.internet,
        hostId: rn.hostId,
        chain: rn.chain,
        fromCache: rn.fromCache,
        cacheSource: rn.cacheSource,
        ttlLeft: rn.ttlLeft,
        viaSecondary: rn.viaSecondary,
        forwarder: rn.forwarder,
        tried: rn.tried,
      };
    }

    const res = evaluateEP(src, dstId, traffic, { commit: true });
    if (dns) {
      res.dns = dnsFreeze(src, dns);
      res.dnsSrc = src;
    }
    lastResult = res;
    showResult(res, traffic);
    runProbes(src, dstId);
    animateWithDns(src, res);
  } finally {
    aaClearSkip();
  }
}

function showDnsFail(rn, srcId, name, mx) {
  const dns = {
    fail: true,
    rn: rn,
    name: name,
    mx: !!mx,
    via: rn.via || null,
    forwarder: rn.forwarder || null,
    tried: rn.tried,
    fromCache: rn.fromCache,
    cacheSource: rn.cacheSource,
    ttlLeft: rn.ttlLeft,
  };
  const res = { status: "dnsfail", dns: dnsFreeze(srcId, dns), dnsSrc: srcId };
  lastResult = res;
  $("result").style.display = "block";
  $("probes").style.display = "none";
  {
    const _st = $("result").querySelector(".subtabs");
    if (_st) _st.style.display = "";
  }
  renderResultBody(res, null);
  setStatus(t("dnsVerdFail"), false);
  animateWithDns(srcId, res);
}
const REACH_PROBES = [
  { proto: "icmp", port: null },
  { proto: "tcp", port: 443 },
  { proto: "tcp", port: 80 },
  { proto: "tcp", port: 445 },
  { proto: "tcp", port: 3389 },
  { proto: "tcp", port: 22 },
  { proto: "udp", port: 53 },
];
function runBlastRadius() {
  aaClearSkip();
  const src = $("selSrc").value;
  if (!src) {
    setStatus(t("stPickSrc"), false);
    return;
  }
  const srcSeg = epSeg(src);
  document
    .querySelectorAll(".link")
    .forEach((l) => l.classList.remove("active-ok", "active-block"));
  $("gOverlay")
    .querySelectorAll(".packet,.blockX,.dnspkt,.dnstrace")
    .forEach((e) => e.remove());
  clearBlast();
  const segs = DB.segments.filter((s) => s.id !== srcSeg);
  const reach = [],
    safe = [];
  segs.forEach((s) => {
    const ok = REACH_PROBES.some(
      (tr) => evaluate(srcSeg, s.id, tr).status === "allowed",
    );
    (ok ? reach : safe).push(s);
  });
  const hosts = (DB.hosts || []).filter((h) => h.id !== src && epSeg(h.id));
  const reachH = [],
    safeH = [];
  hosts.forEach((h) => {
    const ok = REACH_PROBES.some(
      (tr) => evaluateEP(src, h.id, tr).status === "allowed",
    );
    (ok ? reachH : safeH).push(h);
  });
  if (nodeEls[src]) nodeEls[src].classList.add("attacker");
  reach.forEach((s) => {
    if (nodeEls[s.id]) nodeEls[s.id].classList.add("reach");
  });
  safe.forEach((s) => {
    if (nodeEls[s.id]) nodeEls[s.id].classList.add("safe");
  });
  reachH.forEach((h) => {
    if (nodeEls[h.id]) nodeEls[h.id].classList.add("reach");
  });
  safeH.forEach((h) => {
    if (nodeEls[h.id]) nodeEls[h.id].classList.add("safe");
  });
  $("result").style.display = "block";
  $("probes").style.display = "none";
  {
    const _st = $("result").querySelector(".subtabs");
    if (_st) _st.style.display = "none";
  }
  const srcNode = getNode(src);
  const hostLine = hosts.length
    ? `<b style="color:var(--red)">${reachH.length} ${t("explBlastOf")} ${hosts.length}</b> ${t("explBlastMachines")}${
        reachH.length
          ? " (" +
            reachH
              .slice(0, 8)
              .map((h) => esc(h.label))
              .join(", ") +
            (reachH.length > 8 ? " …" : "") +
            ")"
          : ""
      }<br>`
    : "";
  $("resBody").innerHTML =
    `<div class="verdict warn"><span class="ic">${icon("target")}</span>${t("verdBlast")}</div>
    <div class="expl">${t("explBlastAttacker")} <span class='tag'>${esc(srcNode ? srcNode.name || srcNode.label : src)}</span> ${t("explBlastReaches")}<br>
    ${hostLine}<b style="color:var(--red)">${reach.length} ${t("explBlastOf")} ${segs.length}</b> ${t("explBlastSegments")}${reach.length ? ": " + reach.map((s) => esc(s.name)).join(", ") : ""}.<br>
    <b style="color:var(--green)">${t("explBlastProtected")}: ${safeH.length} ${safeH.length === 1 ? t("explBlastMachine") : t("explBlastMachines")} / ${safe.length} ${safe.length === 1 ? t("explBlastSegment") : t("explBlastSegments")}.</b><br>
    <span style="color:var(--muted)">${t("explBlastTip")}</span></div>`;
  setStatus(
    t("stBroadcast") +
      ": " +
      reachH.length +
      "/" +
      hosts.length +
      " " +
      t("explBlastMachines") +
      ", " +
      reach.length +
      "/" +
      segs.length +
      " " +
      t("explBlastSegments"),
  );
}

function showResult(res, traffic) {
  $("result").style.display = "block";
  {
    const _st = $("result").querySelector(".subtabs");
    if (_st) _st.style.display = "";
  }
  $("probes").style.display = "block";
  const _ph = $("probesHint");
  if (_ph) _ph.style.display = isAdvanced() ? "none" : "block";
  renderResultBody(res, traffic);
}
function trafficLabel(t) {
  return t.proto === "icmp"
    ? "ICMP"
    : t.proto.toUpperCase() + (t.port != null ? " " + t.port : "");
}

const ENC_PORTS = [443, 22, 636, 993, 995];
function trafficEncrypted(traffic) {
  if (!traffic) return false;
  if (insecureInfo(traffic)) return false;
  return ENC_PORTS.indexOf(traffic.port) >= 0;
}
function insecureInfo(traffic) {
  for (const k in TRAFFIC) {
    const t = TRAFFIC[k];
    if (t.insecure && t.proto === traffic.proto && t.port === traffic.port)
      return t;
  }
  return null;
}
function _resDetOpen() {
  try {
    return localStorage.getItem("netsim_resdet") === "1";
  } catch (e) {
    return false;
  }
}
document.addEventListener(
  "toggle",
  (e) => {
    if (e.target && e.target.id === "resDet") {
      try {
        localStorage.setItem("netsim_resdet", e.target.open ? "1" : "0");
      } catch (err) {}
    }
  },
  true,
);
function renderResultBody(res, traffic) {
  const body = $("resBody");
  if (res.status === "dnsfail") {
    body.innerHTML =
      resultMode === "steps"
        ? `<ul class="steps">${dnsStepsLi(res.dnsSrc, res.dns)}</ul>`
        : `<div class="verdict block"><span class="ic">⛌</span>${t("dnsVerdFail")}</div>
    <div class="expl">${res.dns.rn ? dnsErrText(res.dns.rn) : ""}<br><span style="color:var(--muted)">${t("dnsHintIp")}</span></div>`;
    return;
  }
  if (resultMode === "result") {
    let v = "",
      cls = "",
      ic = "",
      expl = "";
    const adv = isAdvanced();
    if (res.status === "same") {
      cls = "warn";
      ic = "◎";
      v = t("verdSameSegment");
      expl = t("explSameSegment");
    } else if (res.status === "blocked" && res.reason === t("nStpStorm")) {
      cls = "block";
      ic = "✖";
      v = t("verdBlocked");
      expl = res.reason + " " + t("explStormOnCanvas");
    } else if (res.status === "noroute") {
      cls = "block";
      ic = "⛌";
      v = t("verdUnreachable");
      expl = esc(res.reason);
    } else if (res.status === "blocked" && res.ttlExpired) {
      cls = "block";
      ic = "✖";
      v = adv ? t("verdTtlExpired") : t("verdTtlExpiredSimple");
      expl = adv
        ? esc(res.reason)
        : tf("explTtlExpiredSimple", esc(res.blockedAt.label));
    } else if (res.status === "blocked") {
      cls = "block";
      ic = "✖";
      v = t("verdBlocked");
      if (adv) {
        expl =
          "<span class='tag'>" +
          trafficLabel(traffic) +
          "</span> " +
          t("explBlocked") +
          " <span class='tag'>" +
          esc(res.blockedAt.label) +
          "</span>" +
          (res.srcZone && res.dstZone
            ? " (" +
              t("explZone") +
              " <span class='tag'>" +
              esc(res.srcZone.name) +
              "</span> → <span class='tag'>" +
              esc(res.dstZone.name) +
              "</span>)"
            : "") +
          ".<br>" +
          esc(res.reason);
      } else {
        expl =
          t("explBlockedSimple") +
          " <span class='tag'>" +
          esc(res.blockedAt.label) +
          "</span>.";
      }
    } else {
      cls = "ok";
      ic = "✔";
      v = t("verdAllow");
      if (adv) {
        const fwHop = res.hops.find((h) => h.device.type === "firewall");
        const ids = res.hops.find((h) => h.device.type === "idsips");
        if (res.splitTunnel)
          expl =
            "<span class='tag'>" +
            trafficLabel(traffic) +
            "</span> " +
            t("explSplitTunnel");
        else
          expl =
            "<span class='tag'>" +
            trafficLabel(traffic) +
            "</span> " +
            t("explTrafficThrough") +
            " " +
            res.hops.length +
            " " +
            t("explDevices") +
            "." +
            (fwHop
              ? "<br>Firewall <span class='tag'>" +
                esc(fwHop.device.label) +
                "</span>: " +
                esc(fwHop.note) +
                "."
              : "") +
            (ids
              ? "<br><span class='tag'>" +
                esc(ids.device.label) +
                "</span>: " +
                esc(ids.note) +
                "."
              : "") +
            (fwHop ? "<br>" + t("explStatefulReturn") : "");
      } else {
        expl = t("explAllowSimple");
      }
    }

    if (res.lbBackend) {
      const an = LB_ALGO_NAME[res.lbAlgo] || res.lbAlgo;
      expl =
        (adv
          ? t("explLbPicked") +
            " <span class='tag'>" +
            esc(res.lbBackend.label) +
            "</span> (" +
            t("explLbAlgo") +
            " <b>" +
            esc(an) +
            "</b>, " +
            t("explLbFrom") +
            " " +
            res.lbCount +
            " " +
            t("explLbServers") +
            ")."
          : t("explLbPickedSimple") +
            " <span class='tag'>" +
            esc(res.lbBackend.label) +
            "</span> (" +
            t("explLbFrom") +
            " " +
            res.lbCount +
            " " +
            t("explLbServers") +
            ").") +
        "<br>" +
        expl;
    }

    const _wifiOpenOf = (id) => {
      if (!isHost(id)) return null;
      const h = getNode(id);
      if (!h || !h.wifi || !wifiAssocLive(h)) return null;
      const ap = getNode(h.wifi.apId);
      const ss = ap && apEffSsids(ap).find((x) => x.name === h.wifi.ssid);
      return ss && ssidSec(ss) === "open" ? h.wifi.ssid : null;
    };
    const _woSsid =
      res.path && res.path.length
        ? _wifiOpenOf(res.path[0]) || _wifiOpenOf(res.path[res.path.length - 1])
        : null;
    const wifiOpenWarn =
      _woSsid && res.status === "allowed"
        ? `<div class="expl insecure">⚠ ${tf("explWifiOpen", esc(_woSsid))}</div>`
        : "";
    const ins = insecureInfo(traffic);
    const insWarn =
      adv && ins && res.status === "allowed"
        ? `<div class="expl insecure">⚠ <b>${esc(ins.label)}</b> ${t("explInsecure")} <b>${esc(ins.alt)}</b>.</div>`
        : "";

    const _poolEnd =
      res.path && res.path.length ? res.path[res.path.length - 1] : null;
    const congWarn =
      res.status === "allowed" && pathCongested(res.path, traffic)
        ? `<div class="expl insecure">⚠ ${t("explCongested")}</div>`
        : "";

    const qosNote =
      res.status === "allowed" &&
      !congWarn &&
      res.path &&
      pathCongested(res.path) &&
      !pathCongested(res.path, traffic)
        ? `<div class="expl">${t("explQosVoice")}</div>`
        : "";
    const poolWarn =
      adv &&
      res.status === "allowed" &&
      res.path &&
      res.path.length &&
      ((isHost(res.path[0]) && hostStaticInPool(res.path[0])) ||
        (isHost(_poolEnd) && hostStaticInPool(_poolEnd)))
        ? `<div class="expl insecure">⚠ ${t("nStaticInPool")}</div>`
        : "";
    const alerts = adv
      ? (res.hops || []).filter(
          (h) => h.device.type === "idsips" && /ALERT/.test(h.note || ""),
        )
      : [];
    const alertBox = alerts.length
      ? `<div class="expl alertbox">${icon("bell")}${t("explAlertIDS")} ${alerts.map((a) => esc(a.device.label) + " " + t("explAlertNote")).join("<br>")}</div>`
      : "";

    const _hpEnd =
      res.path && res.path.length ? res.path[res.path.length - 1] : null;
    const honeypotBox =
      res.status === "allowed" &&
      isHost(_hpEnd) &&
      getNode(_hpEnd) &&
      getNode(_hpEnd).kind === "honeypot"
        ? `<div class="expl alertbox">${icon("bell")}${t("explHoneypot")}</div>`
        : "";
    let arpLine = "";
    if (res.path && res.path.length >= 2 && isHost(res.path[0])) {
      const src = res.path[0],
        dst = res.path[res.path.length - 1],
        ss = epSeg(src),
        ds = epSeg(dst);
      if (ss && ds && ss === ds && isHost(dst)) {
        arpLine = `<br><b>ARP:</b> <span class="mono">${esc(t("arpTarget"))} ${esc(hostIpAuto(dst) || "?")} → ${esc(nodeMac(dst) || "?")}</span>`;
      } else {
        const gwDev = res.path
          .slice(1)
          .find(
            (id) =>
              isDevice(id) &&
              ["router", "l3switch", "firewall"].indexOf(getNode(id).type) >= 0,
          );
        const gwIp = subnetGwIp(ss);
        if (gwDev && gwIp)
          arpLine = `<br><b>ARP:</b> <span class="mono">${esc(t("arpGw"))} ${esc(gwIp)} → ${esc(nodeMac(gwDev) || "?")}</span>`;
      }
    }

    const ttlLine =
      res.status === "allowed" && res.ttlHops > 0
        ? `<br><b>TTL:</b> <span class="mono">${TTL_START} → ${TTL_START - res.ttlHops}</span> ${tf("explTtlHops", res.ttlHops)}`
        : "";
    let traceBox = "";
    if (
      res.path &&
      res.path.length &&
      (res.status === "allowed" || res.ttlExpired)
    ) {
      const L3 = (res.hops || []).filter(
        (h) =>
          h.device &&
          ["router", "l3switch", "firewall"].indexOf(h.device.type) >= 0 &&
          h.action !== "deny",
      );
      if (L3.length >= 2) {
        let ttl = TTL_START;
        const rows = L3.map((h, i) => {
          ttl--;
          return (
            '<div><span class="mono">' +
            (i + 1) +
            '</span> <span class="tag">' +
            esc(h.device.label) +
            '</span> <span style="color:var(--muted);font-size:11px">TTL ' +
            ttl +
            "</span></div>"
          );
        }).join("");
        const last = res.ttlExpired
          ? res.blockedAt
            ? '<div><span class="mono">' +
              (L3.length + 1) +
              '</span> <span class="tag">' +
              esc(res.blockedAt.label || res.blockedAt.name || "?") +
              '</span> <span style="color:var(--muted);font-size:11px">TTL 0</span></div>'
            : ""
          : '<div><span class="mono">' +
            (L3.length + 1) +
            '</span> <span class="tag">' +
            esc(
              (getNode(res.path[res.path.length - 1]) || {}).label ||
                (getNode(res.path[res.path.length - 1]) || {}).name ||
                "?",
            ) +
            '</span> <span style="color:var(--muted);font-size:11px">' +
            esc(t("traceTarget")) +
            "</span></div>";
        traceBox =
          '<div class="expl" style="font-size:12px"><b>' +
          t("traceTitle") +
          '</b><div style="line-height:1.9;margin-top:4px">' +
          rows +
          last +
          '</div><div style="color:var(--muted);font-size:11px;margin-top:4px">' +
          t("traceNote") +
          "</div></div>";
      }
    }
    const addrBox =
      res.path && res.path.length
        ? `<div class="expl" style="font-size:12px"><b>${t("explAddrSrc")}</b> <span class="mono">${esc(epAddr(res.path[0]))}</span> → <b>${t("explAddrDst")}</b> <span class="mono">${esc(epAddr(res.path[res.path.length - 1]))}</span>${arpLine}${ttlLine}${res.nat ? `<br><b>NAT/PAT:</b> <span class="mono">${esc(res.nat.inside)} → ${esc(res.nat.outside)}</span> (${esc(res.nat.dev)})` : ""}</div>`
        : "";

    const dnsBox = res.dns
      ? `<div class="expl">${dnsStepText(res.dns)}</div>`
      : "";
    const detIn =
      addrBox || traceBox
        ? `<details class="resdet" id="resDet"${_resDetOpen() ? " open" : ""}><summary>${t("resDetails")}</summary>${addrBox}${traceBox}</details>`
        : "";
    body.innerHTML = `<div class="verdict ${cls}"><span class="ic">${ic}</span>${v}</div>${dnsBox}<div class="expl">${expl}</div>${detIn}${alertBox}${honeypotBox}${insWarn}${wifiOpenWarn}${congWarn}${qosNote}${poolWarn}`;
  } else {
    if (res.status === "same") {
      body.innerHTML = `<div class="expl">${t("stepsSameSeg")}</div>`;
      return;
    }
    if (res.status === "noroute") {
      body.innerHTML = `<div class="expl">${t("stepsNoRoute")}<br>${esc(res.reason)}</div>`;
      return;
    }
    const hops = res.hops || [];
    let li = hops
      .map((h, i) => {
        const blocked = h.action === "deny";
        const numCls = blocked
          ? "block"
          : h.device.type === "firewall"
            ? "ok"
            : "";
        let sub = esc(h.note);
        if (h.device.type === "firewall" && h.srcZone && h.dstZone) {
          sub =
            t("stepsZone") +
            " " +
            esc(h.srcZone.name) +
            " → " +
            esc(h.dstZone.name) +
            " · " +
            esc(h.note);
        }
        return `<li><span class="num ${numCls}">${i + 1}</span><div class="sc"><b>${esc(h.device.label)}</b><span>${sub}</span></div></li>`;
      })
      .join("");
    if (res.dns)
      li = dnsStepsLi(res.dnsSrc || (res.path && res.path[0]), res.dns) + li;
    if (res.splitTunnel)
      li =
        `<li><span class="num ok">1</span><div class="sc"><b>${esc(getNode(res.path[0]) ? getNode(res.path[0]).label : "?")}</b><span>${t("stepsSplitTunnel")}</span></div></li>` +
        li;
    if (res.status === "allowed") {
      const _fwOnPath = hops.some((h) => h.device.type === "firewall");
      li += `<li><span class="num ok">✔</span><div class="sc"><b>${t("stepsReached")}</b>${_fwOnPath ? `<span>${t("stepsReturnAuto")}</span>` : ""}</div></li>`;
    }
    body.innerHTML = `<ul class="steps">${li}</ul>`;
  }
}
$("subResult").onclick = () => {
  resultMode = "result";
  $("subResult").classList.add("active");
  $("subSteps").classList.remove("active");
  a11yTabs($("result"));
  if (lastResult) renderResultBody(lastResult, currentTraffic());
};
$("subSteps").onclick = () => {
  resultMode = "steps";
  $("subSteps").classList.add("active");
  $("subResult").classList.remove("active");
  a11yTabs($("result"));
  if (lastResult) renderResultBody(lastResult, currentTraffic());
};

function runProbes(src, dst) {
  const cont = $("probeGroups");
  const pass = [],
    fail = [];
  let same = false;
  Object.keys(TRAFFIC).forEach((k) => {
    if (k === "custom") return;
    const tr = TRAFFIC[k];
    const simple = !isAdvanced();
    const lbl = simple && PROBE_FRIENDLY[k] ? PROBE_FRIENDLY[k].en : tr.label;
    const alt = simple && tr.alt ? tr.alt.replace(/\s*\(\d+\)/g, "") : tr.alt;
    const res = evaluateEP(src, dst, { proto: tr.proto, port: tr.port });
    if (res.status === "same") {
      same = true;
      return;
    }
    if (res.status === "allowed")
      pass.push({ label: lbl, insecure: !!tr.insecure, alt: alt });
    else
      fail.push({
        label: lbl,
        why: res.status === "noroute" ? t("probesNoRoute") : t("probesBlocked"),
      });
  });
  if (same) {
    cont.innerHTML = '<div class="probe-note">' + t("probesSameSeg") + "</div>";
    return;
  }
  const grp = (cls, title, items, renderItem) => `
    <div class="probe-grp ${cls}" data-open="1">
      <button class="probe-head"><span class="caret">▾</span><span class="dot"></span>${title}<span class="cnt">${items.length}</span></button>
      <div class="probe-list">${items.length ? items.map(renderItem).join("") : '<span class="probe-empty">' + t("probesNone") + "</span>"}</div>
    </div>`;
  cont.innerHTML =
    grp(
      "ok",
      t("probesPass"),
      pass,
      (s) =>
        `<span class="probe-item${s.insecure ? " insecure" : ""}"${s.insecure ? ` title="${t("probesInsecureTitle")} ${esc(s.alt)}"` : ""}>${esc(s.label)}${s.insecure ? '<span class="ins">⚠</span>' : ""}</span>`,
    ) +
    grp(
      "block",
      t("probesFail"),
      fail,
      (s) =>
        `<span class="probe-item">${esc(s.label)} <em>${s.why}</em></span>`,
    );
  cont.querySelectorAll(".probe-head").forEach((h) => {
    h.onclick = () => {
      const gr = h.parentElement;
      const open = gr.dataset.open !== "1";
      gr.dataset.open = open ? "1" : "0";
      h.querySelector(".caret").textContent = open ? "▾" : "▸";
    };
  });
}

let animRAF = null;

function isRenderedNode(id) {
  const n = getNode(id);
  if (!n) return false;
  if (isSegment(id)) return !!n.isInternet;
  return true;
}

function physBFS(a, b) {
  if (a === b) return [a];
  const allowInet = isHost(a) || isHost(b);
  const prev = {},
    seen = new Set([a]),
    q = [a];
  while (q.length) {
    const c = q.shift();
    for (const nb of neighborsOf(c)) {
      if (!isRenderedNode(nb) || seen.has(nb)) continue;
      if (isDevice(nb) && (isInactive(nb) || aaSkip.has(nb))) continue;
      if (isSegment(nb) && nb !== b && !(allowInet && getNode(nb).isInternet))
        continue;
      seen.add(nb);
      prev[nb] = c;
      if (nb === b) {
        const seq = [b];
        let k = c;
        while (k !== undefined) {
          seq.unshift(k);
          k = prev[k];
        }
        return seq;
      }
      q.push(nb);
    }
  }
  return null;
}

function physicalPath(logical) {
  const vis = logical.filter(isRenderedNode);
  if (vis.length < 2) return vis;
  const out = [vis[0]];
  for (let i = 1; i < vis.length; i++) {
    const a = out[out.length - 1],
      b = vis[i];
    if (a === b) continue;
    if (neighborsOf(a).indexOf(b) >= 0) {
      out.push(b);
      continue;
    }
    const sub = physBFS(a, b);
    if (sub && sub.length > 1) {
      for (let j = 1; j < sub.length; j++) out.push(sub[j]);
    } else out.push(b);
  }

  for (let i = 0; i < out.length; i++) {
    const j = out.lastIndexOf(out[i]);
    if (
      j > i &&
      !out
        .slice(i + 1, j)
        .some(
          (id) =>
            isDevice(id) && L2_BOUNDARY_TYPES.indexOf(getNode(id).type) >= 0,
        )
    )
      out.splice(i + 1, j - i);
  }
  return out;
}

function floodFromHub(hubId, excludeIds, color, hl) {
  const hub = getNode(hubId);
  if (!hub) return;
  const targets = neighborsOf(hubId).filter(
    (n) => isHost(n) && excludeIds.indexOf(n) < 0,
  );
  targets.forEach((tid) => {
    const tn = getNode(tid);
    if (!tn) return;
    if (hl) {
      const ln = findLinkEl(hubId, tid);
      if (ln) ln.classList.add("active-ok");
    }
    const d = el("circle", {
      class: "packet hubflood",
      r: 5.5,
      cx: hub.x,
      cy: hub.y,
      fill: color,
    });
    $("gOverlay").appendChild(d);
    const x0 = hub.x,
      y0 = hub.y,
      x1 = tn.x,
      y1 = tn.y;
    let tt = 0,
      last = null;
    const sp = mSpeed(1.8);
    function fstep(ts) {
      if (last == null) last = ts;
      const dt = Math.min(0.05, (ts - last) / 1000);
      last = ts;
      tt += sp * dt;
      if (tt >= 1) {
        d.setAttribute("cx", x1);
        d.setAttribute("cy", y1);
        const drop = el("text", {
          x: x1,
          y: y1 - 15,
          "text-anchor": "middle",
          class: "hubflood",
          style: "font:700 12px var(--sans);fill:var(--muted)",
        });
        drop.textContent = "✗";
        $("gOverlay").appendChild(drop);
        setTimeout(() => {
          try {
            d.remove();
          } catch (e) {}
        }, 140);
        setTimeout(() => {
          try {
            drop.remove();
          } catch (e) {}
        }, 950);
        return;
      }
      d.setAttribute("cx", x0 + (x1 - x0) * tt);
      d.setAttribute("cy", y0 + (y1 - y0) * tt);
      requestAnimationFrame(fstep);
    }
    requestAnimationFrame(fstep);
  });
}

function animateWithDns(srcId, res) {
  document
    .querySelectorAll(".link")
    .forEach((l) => l.classList.remove("active-ok", "active-block"));
  $("gOverlay")
    .querySelectorAll(".packet,.blockX,.hubflood,.dnspkt,.dnstrace")
    .forEach((e) => e.remove());
  if (animRAF) cancelAnimationFrame(animRAF);
  const main = () => {
    if (res.status !== "dnsfail") animateResult(res);
  };
  const legs = res.dns ? res.dns.legs || dnsLegs(srcId, res.dns) : [];
  if (!legs.length) {
    main();
    return;
  }
  animateDnsLegs(legs, main);
}

function animateDnsLegs(legs, done) {
  let i = 0;
  const runLeg = () => {
    if (i >= legs.length) {
      done && done();
      return;
    }
    const leg = legs[i++];
    const phys = leg.res.path ? physicalPath(leg.res.path) : null;
    if (!phys || phys.length < 2) {
      runLeg();
      return;
    }
    const blockedId =
      leg.res.status !== "allowed" && leg.res.blockedAt
        ? leg.res.blockedAt.id
        : null;
    let upto = phys.length - 1;
    if (blockedId) {
      const bi = phys.indexOf(blockedId);
      if (bi >= 0) upto = bi;
    }
    const pts = phys.slice(0, upto + 1).map((id) => {
      const n = getNode(id);
      return { x: n.x || 0, y: n.y || 0 };
    });
    if (pts.length < 2) {
      runLeg();
      return;
    }
    const ok = leg.res.status === "allowed";
    const color = ok ? "#c084fc" : "#fb7185";
    const trace = el("polyline", {
      class: "dnstrace",
      points: pts.map((p) => p.x + "," + p.y).join(" "),
      fill: "none",
      stroke: color,
      "stroke-width": 2,
      opacity: 0.32,
      style: "color:" + color,
    });
    $("gOverlay").appendChild(trace);
    const dot = el("circle", {
      class: "dnspkt",
      r: 4,
      fill: color,
      style: "color:" + color,
    });
    $("gOverlay").appendChild(dot);
    const seq = ok ? pts.concat(pts.slice(0, -1).reverse()) : pts;
    let seg = 0,
      tt = 0,
      last = null;
    const sp = mSpeed(2.2);
    const stepFn = (ts) => {
      if (last == null) last = ts;
      const dt = Math.min(0.05, (ts - last) / 1000);
      last = ts;
      tt += sp * dt;
      while (tt >= 1) {
        tt -= 1;
        seg++;
      }
      if (seg >= seq.length - 1) {
        try {
          dot.remove();
        } catch (e) {}
        if (ok) runLeg();
        else {
          drawBlockX({ blockedAt: leg.res.blockedAt });
          done && done();
        }
        return;
      }
      const a = seq[seg],
        b = seq[seg + 1],
        p = _bez(a.x, a.y, b.x, b.y, tt);
      dot.setAttribute("cx", p.x);
      dot.setAttribute("cy", p.y);
      animRAF = requestAnimationFrame(stepFn);
    };
    animRAF = requestAnimationFrame(stepFn);
  };
  runLeg();
}
function animateResult(res) {
  document
    .querySelectorAll(".link")
    .forEach((l) => l.classList.remove("active-ok", "active-block"));
  $("gOverlay")
    .querySelectorAll(".packet,.blockX,.hubflood")
    .forEach((e) => e.remove());
  if (animRAF) cancelAnimationFrame(animRAF);
  if (!res.path || res.path.length < 2) return;
  const ok = res.status === "allowed";
  const blockedDevId =
    res.status === "blocked" && res.blockedAt ? res.blockedAt.id : null;

  const phys = physicalPath(res.path);
  if (phys.length < 2) {
    if (blockedDevId) drawBlockX(res);
    return;
  }

  let upto = phys.length - 1;
  if (blockedDevId) {
    const bi = phys.indexOf(blockedDevId);
    if (bi >= 0) upto = bi;
  }

  for (let i = 0; i < upto; i++) {
    const ln = findLinkEl(phys[i], phys[i + 1]);
    if (ln) ln.classList.add(blockedDevId ? "active-block" : "active-ok");
  }

  const pts = phys.slice(0, upto + 1).map((id) => {
    const n = getNode(id);
    return { x: n.x || 0, y: n.y || 0 };
  });
  const pids = phys.slice(0, upto + 1);
  const flooded = new Set();
  if (pts.length < 2) {
    drawBlockX(res);
    return;
  }
  const dot = el("circle", {
    class: "packet",
    r: 6,
    fill: ok ? "var(--green)" : blockedDevId ? "var(--red)" : "var(--cyan)",
  });
  $("gOverlay").appendChild(dot);
  let seg = 0,
    t = 0,
    last = null;
  const speed = mSpeed(1.4);

  function finish() {
    if (blockedDevId) {
      dot.remove();
      drawBlockX(res);
      return;
    }
    const fp = pts[pts.length - 1];
    dot.setAttribute("cx", fp.x);
    dot.setAttribute("cy", fp.y);
  }
  function step(ts) {
    if (seg >= pts.length - 1) {
      finish();
      return;
    }

    if (
      !flooded.has(seg) &&
      pids[seg] &&
      isDevice(pids[seg]) &&
      getNode(pids[seg]).type === "hub"
    ) {
      flooded.add(seg);
      floodFromHub(
        pids[seg],
        [pids[seg - 1], pids[seg + 1]],
        ok ? "var(--green)" : "var(--amber)",
        true,
      );
    }
    if (last == null) last = ts;
    const dt = Math.min(0.05, (ts - last) / 1000);
    last = ts;
    t += speed * dt;
    if (t >= 1) {
      t = 0;
      seg++;
      if (seg >= pts.length - 1) {
        finish();
        return;
      }
    }
    const a = pts[seg],
      b = pts[seg + 1];
    const _p = _bez(a.x, a.y, b.x, b.y, t);
    dot.setAttribute("cx", _p.x);
    dot.setAttribute("cy", _p.y);
    animRAF = requestAnimationFrame(step);
  }
  animRAF = requestAnimationFrame(step);
}
function drawBlockX(res) {
  if (!res.blockedAt) return;

  const n = (res.blockedAt.id && getNode(res.blockedAt.id)) || res.blockedAt;
  if (!isFinite(n.x) || !isFinite(n.y)) return;
  const dim = nodeDims(n);

  const cx = n.x - dim.w / 2 + 22,
    cy = n.y,
    s = 11;
  const g = el("g", { class: "blockX" });
  g.appendChild(
    el("circle", {
      cx: cx,
      cy: cy,
      r: s + 3,
      fill: "var(--bg)",
      "fill-opacity": 0.85,
      stroke: "var(--red)",
      "stroke-width": 1.5,
    }),
  );
  g.appendChild(
    el("line", {
      x1: cx - s,
      y1: cy - s,
      x2: cx + s,
      y2: cy + s,
      stroke: "var(--red)",
      "stroke-width": 3.5,
      "stroke-linecap": "round",
    }),
  );
  g.appendChild(
    el("line", {
      x1: cx + s,
      y1: cy - s,
      x2: cx - s,
      y2: cy + s,
      stroke: "var(--red)",
      "stroke-width": 3.5,
      "stroke-linecap": "round",
    }),
  );
  $("gOverlay").appendChild(g);
}
function findLinkEl(a, b) {
  const l = DB.links.find(
    (l) => (l.fromId === a && l.toId === b) || (l.fromId === b && l.toId === a),
  );
  if (!l) return null;
  return $("gLinks").querySelector(`[data-link="${l.id}"]`);
}

let matrixCache = { hash: null, html: null };

const MATRIX_MAX_SEGS = 24,
  BLAST_MAX_NODES = 100,
  HA_MAX_NODES = 100;
function renderMatrix() {
  aaClearSkip();
  const k = $("matrixTraffic").value;
  const tk = TRAFFIC[k];
  const segs = DB.segments;
  const cont = $("matrixTable");
  if (segs.length === 0) {
    cont.innerHTML =
      '<p style="color:var(--muted)">' + t("matrixNoSegs") + "</p>";
    return;
  }
  if (segs.length > MATRIX_MAX_SEGS) {
    cont.innerHTML =
      '<p style="color:var(--muted)">' +
      esc(tf("matrixTooBig", MATRIX_MAX_SEGS, segs.length)) +
      "</p>";
    return;
  }
  const hash = k + "|" + JSON.stringify(DB);
  let html;
  if (matrixCache.hash === hash) {
    html = matrixCache.html;
  } else {
    html = "<table><thead><tr><th></th>";
    segs.forEach((s) => (html += `<th class="col">${esc(s.name)}</th>`));
    html += "</tr></thead><tbody>";
    segs.forEach((sr) => {
      html += `<tr><th>${esc(sr.name)}</th>`;
      segs.forEach((sc) => {
        if (sr.id === sc.id) {
          html += '<td class="cell self">·</td>';
          return;
        }
        const res = evaluate(sr.id, sc.id, { proto: tk.proto, port: tk.port });
        let cls = "na",
          sym = "–";
        if (res.status === "allowed") {
          cls = "ok";
          sym = "✔";
        } else if (res.status === "blocked") {
          cls = "block";
          sym = "✖";
        } else if (res.status === "noroute") {
          cls = "block";
          sym = "⛌";
        }
        html += `<td class="cell ${cls}" data-src="${sr.id}" data-dst="${sc.id}">${sym}</td>`;
      });
      html += "</tr>";
    });
    html += "</tbody></table>";
    matrixCache = { hash, html };
  }
  cont.innerHTML = html;
  cont.querySelectorAll("td.cell[data-src]").forEach((td) => {
    td.onclick = () => {
      const src = td.getAttribute("data-src"),
        dst = td.getAttribute("data-dst");
      setView("diagram");
      $("selSrc").value = src;
      $("selDst").value = dst;
      $("selTraffic").value = k;
      $("customRow").style.display = "none";
      runTest();
    };
  });
}

function setView(v) {
  view = v;
  if (v !== "diagram" && typeof simState !== "undefined" && simState.on)
    stopSim();
  $("tabDiagram").classList.toggle("active", v === "diagram");
  if (typeof a11yTabs === "function")
    a11yTabs(document.querySelector("header"));
  $("tabMatrix").classList.toggle("active", v === "matrix");
  $("stage").style.display = v === "diagram" ? "flex" : "none";
  $("matrixview").classList.toggle("show", v === "matrix");
  $("testpanel").style.display = v === "diagram" ? "block" : "none";
  if (typeof syncMobTest === "function") syncMobTest();
  if (v === "matrix") renderMatrix();
}
$("tabDiagram").onclick = () => setView("diagram");
$("tabMatrix").onclick = () => setView("matrix");
$("matrixTraffic").onchange = renderMatrix;

function buildExportSvg() {
  const all = [
    ...DB.devices,
    ...DB.segments.filter((s) => s.isInternet),
    ...(DB.hosts || []),
  ];
  if (!all.length) return null;
  let minX = 1e9,
    minY = 1e9,
    maxX = -1e9,
    maxY = -1e9;
  for (const n of all) {
    const d = nodeDims(n);
    minX = Math.min(minX, n.x - d.w / 2);
    maxX = Math.max(maxX, n.x + d.w / 2);
    minY = Math.min(minY, n.y - d.h / 2);
    maxY = Math.max(maxY, n.y + d.h / 2);
  }
  (DB.notes || []).forEach((nt) => {
    const g = noteEls[nt.id];
    if (!g) return;
    let bb;
    try {
      bb = g.getBBox();
    } catch (e) {
      return;
    }
    minX = Math.min(minX, nt.x + bb.x);
    maxX = Math.max(maxX, nt.x + bb.x + bb.width);
    minY = Math.min(minY, nt.y + bb.y);
    maxY = Math.max(maxY, nt.y + bb.y + bb.height);
  });
  document.querySelectorAll("#gZones .zone-auto").forEach((g) => {
    let bb;
    try {
      bb = g.getBBox();
    } catch (e) {
      return;
    }
    minX = Math.min(minX, bb.x);
    maxX = Math.max(maxX, bb.x + bb.width);
    minY = Math.min(minY, bb.y);
    maxY = Math.max(maxY, bb.y + bb.height);
  });
  const pad = 44,
    x = Math.round(minX - pad),
    y = Math.round(minY - pad),
    w = Math.round(maxX - minX + pad * 2),
    h = Math.round(maxY - minY + pad * 2);
  const clone = svg.cloneNode(true);
  const PROPS = [
    "fill",
    "fill-opacity",
    "stroke",
    "stroke-opacity",
    "stroke-width",
    "stroke-dasharray",
    "stroke-linecap",
    "stroke-linejoin",
    "opacity",
    "font-family",
    "font-size",
    "font-weight",
    "text-anchor",
  ];
  (function walk(src, dst) {
    const cs = getComputedStyle(src);
    for (const p of PROPS) {
      const v = cs.getPropertyValue(p);
      if (v) dst.style.setProperty(p, v);
    }
    const sc = src.children,
      dc = dst.children;
    for (let i = 0; i < sc.length && i < dc.length; i++) walk(sc[i], dc[i]);
  })(svg, clone);
  clone.setAttribute("viewBox", x + " " + y + " " + w + " " + h);
  clone.setAttribute("width", w);
  clone.setAttribute("height", h);
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  const bg = (
    getComputedStyle(document.documentElement).getPropertyValue("--bg") ||
    "#040806"
  ).trim();
  const r = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  r.setAttribute("x", x);
  r.setAttribute("y", y);
  r.setAttribute("width", w);
  r.setAttribute("height", h);
  r.setAttribute("fill", bg);
  clone.insertBefore(r, clone.firstChild);
  return { xml: new XMLSerializer().serializeToString(clone), w, h, bg };
}
function dlBlob(blob, ext) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download =
    (DB.meta.name || "topologie").replace(/[^\w\-]+/g, "_") + "." + ext;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
function exportPng() {
  const s = buildExportSvg();
  if (!s) {
    setStatus(t("stPngEmpty"), false);
    return;
  }
  const SCALE = 2,
    img = new Image();
  img.onload = () => {
    const cv = document.createElement("canvas");
    cv.width = s.w * SCALE;
    cv.height = s.h * SCALE;
    const ctx = cv.getContext("2d");
    ctx.fillStyle = s.bg;
    ctx.fillRect(0, 0, cv.width, cv.height);
    ctx.drawImage(img, 0, 0, cv.width, cv.height);
    cv.toBlob((b) => {
      if (!b) {
        setStatus(t("stPngError"), false);
        return;
      }
      dlBlob(b, "png");
      setStatus(t("stPngExported"));
    }, "image/png");
  };
  img.onerror = () => setStatus(t("stPngError"), false);
  img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(s.xml);
}
function exportSvg() {
  const s = buildExportSvg();
  if (!s) {
    setStatus(t("stPngEmpty"), false);
    return;
  }
  dlBlob(new Blob([s.xml], { type: "image/svg+xml" }), "svg");
  setStatus(t("stSvgExported"));
}
function openExportImage() {
  openModal(`<h2>${icon("image", "ico-a")}${t("expImgTitle")}</h2>
    <p style="color:var(--muted);font-size:13px;line-height:1.55;margin:0 0 14px">${t("expImgDesc")}</p>
    <div class="mrow"><button class="btn primary" id="expPng" style="flex:1">${t("expPngBtn")}</button><button class="btn primary" id="expSvg" style="flex:1">${t("expSvgBtn")}</button></div>
    <div class="actions"><button class="btn" id="expClose">${t("fbCancel")}</button></div>`);
  $("expPng").onclick = () => {
    closeModal();
    exportPng();
  };
  $("expSvg").onclick = () => {
    closeModal();
    exportSvg();
  };
  $("expClose").onclick = closeModal;
}
$("btnExportPng").onclick = () => {
  if (typeof closeMenus === "function") closeMenus();
  openExportImage();
};
