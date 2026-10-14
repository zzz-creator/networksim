"use strict";

function evaluateFirewall(
  fw,
  sz,
  dz,
  traffic,
  srcId,
  dstId,
  dnatRule,
  noStateful,
) {
  ensureFirewallZones(fw);
  for (let i = 0; i < fw.firewallRules.length; i++) {
    const r = fw.firewallRules[i];
    if (ruleMatches(r, sz, dz, traffic, srcId, dstId)) {
      return {
        action: r.action,
        rule: r,
        ruleNo: i + 1,
        note:
          r.action === "permit"
            ? tf("nPermitRule", i + 1)
            : tf("nDenyRule", i + 1),
      };
    }
  }
  if (sz && dz && sz.id === dz.id)
    return {
      action: "permit",
      rule: null,
      ruleNo: null,
      note: tf("nIntraZone", sz.name),
    };
  const srcVpn = sz && sz.role === "vpn";
  const srcInside = sz && sz.role === "inside";
  const dstVpn = dz && dz.role === "vpn";
  const dstOutside = dz && dz.role === "outside";

  if (srcVpn)
    return { action: "permit", rule: null, ruleNo: null, note: t("nVpnAny") };

  if (srcInside && !dstVpn)
    return {
      action: "permit",
      rule: null,
      ruleNo: null,
      note: t("nInsideAny"),
    };
  if (dstOutside)
    return { action: "permit", rule: null, ruleNo: null, note: t("nNatOut") };
  if (srcInside && dstVpn)
    return {
      action: "deny",
      rule: null,
      ruleNo: null,
      note: t("nInsideToVpn"),
    };

  if (dnatRule && (fw.portForwards || []).indexOf(dnatRule) >= 0) {
    const h = getNode(dnatRule.hostId);
    return {
      action: "permit",
      rule: null,
      ruleNo: null,
      note: tf("nDnat", dnatRule.pubPort, h ? h.label : "?", dnatRule.intPort),
    };
  }

  if (dnatRule && dnatRule._static && dnatRule._fwId === fw.id) {
    const h = getNode(dnatRule.hostId);
    return {
      action: "permit",
      rule: null,
      ruleNo: null,
      note: tf("nSnat", h ? h.label : "?"),
    };
  }

  if (!noStateful) {
    const rev = evaluateFirewall(fw, dz, sz, traffic, dstId, srcId, null, true);
    if (rev.action === "permit" && rev.rule) {
      const pr = aclPortRange(rev.rule);
      if (pr[1] - pr[0] + 1 <= PORTSPAN_NARROW) {
        return {
          action: "permit",
          rule: null,
          ruleNo: null,
          stateful: true,
          note: t("nStatefulReturn"),
        };
      }
    }
  }
  return { action: "deny", rule: null, ruleNo: null, note: t("nDefaultDeny") };
}

function evaluateSimpleFirewall(fw, srcId, dstId, traffic) {
  const rules = fw.simpleRules || [];
  for (let i = 0; i < rules.length; i++) {
    if (aclMatches(rules[i], srcId, dstId, traffic)) {
      return {
        action: rules[i].action,
        rule: rules[i],
        ruleNo: i + 1,
        note:
          rules[i].action === "permit"
            ? tf("nSimplePermitRule", i + 1)
            : tf("nSimpleDenyRule", i + 1),
      };
    }
  }
  const def = fw.defaultAction || "deny";
  return {
    action: def,
    rule: null,
    ruleNo: null,
    note: def === "permit" ? t("nSimpleDefPermit") : t("nSimpleDefDeny"),
  };
}

function aclMatches(r, srcId, dstId, traffic) {
  if (r.srcSeg && r.srcSeg !== "*" && r.srcSeg !== srcId) return false;
  if (r.dstSeg && r.dstSeg !== "*" && r.dstSeg !== dstId) return false;
  const rp = r.proto || "ip";
  if (rp !== "ip" && rp !== traffic.proto) return false;
  if (!portSpecMatches(r.portOp, r.port, r.port2, rp, traffic.port))
    return false;
  return true;
}
function evaluateAcl(acl, srcId, dstId, traffic, def) {
  if (!acl || acl.length === 0)
    return {
      action: "permit",
      rule: null,
      ruleNo: null,
      note: t("nAclImplicit"),
    };
  for (let i = 0; i < acl.length; i++) {
    if (aclMatches(acl[i], srcId, dstId, traffic)) {
      return {
        action: acl[i].action,
        rule: acl[i],
        ruleNo: i + 1,
        note:
          acl[i].action === "permit"
            ? tf("nAclPermit", i + 1)
            : tf("nAclDeny", i + 1),
      };
    }
  }
  const deny = def === "deny";
  return {
    action: deny ? "deny" : "permit",
    rule: null,
    ruleNo: null,
    note: deny ? t("nAclImplicitDeny") : t("nAclImplicit"),
  };
}

const IPS_THREATS = [
  { id: "sqli", sev: "high" },
  { id: "xss", sev: "high" },
  { id: "creds", sev: "medium" },
  { id: "malware", sev: "critical" },
  { id: "c2", sev: "critical" },
  { id: "exploit", sev: "critical" },
  { id: "portscan", sev: "low" },
  { id: "dnstunnel", sev: "medium" },
];
const SEV_COLOR = {
  critical: "#fb7185",
  high: "#fb923c",
  medium: "#fbbf24",
  low: "#7dd3fc",
};
function threatLabel(id) {
  return id ? t("thr_" + id) || id : id;
}
function sevLabel(sev) {
  return t("sev_" + sev) || sev;
}

const PAYLOAD_SAMPLES = {
  clean: [
    "GET /index.html HTTP/1.1",
    "GET /products?id=42 HTTP/1.1",
    'POST /api/login {"user":"bob"}',
    "GET /style.css HTTP/1.1",
  ],
  sqli: [
    "GET /item?id=1' OR '1'='1",
    "GET /login?u=admin'--",
    "id=1 UNION SELECT password FROM users",
    "'; DROP TABLE users;--",
  ],
  xss: [
    "GET /search?q=<" + "script>alert(1)<" + "/script>",
    "comment=<" + "img src=x onerror=alert(1)>",
  ],
  creds: [
    "POST /login user=admin&password=hunter2",
    "USER root / PASS toor (plaintext)",
  ],
  malware: [
    "X5O!P%@AP[4\\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*",
  ],
  c2: [
    "POST /gate.php id=BOT-7f3&cmd=beacon",
    "GET /pixel.gif?d=aGVsbG8 (exfil)",
  ],
  exploit: [
    "GET /cgi-bin/x () { :;}; /bin/bash -c id  (Shellshock)",
    "GET /../../../../etc/passwd",
  ],
  portscan: ["TCP SYN -> 22,23,80,443,445,3389 (scan)"],
  dnstunnel: ["TXT dotaz: ZXhmaWx0cmF0ZWQ.data.evil.example"],
};
function samplePayload(c) {
  const a = PAYLOAD_SAMPLES[c] || PAYLOAD_SAMPLES.clean;
  return a[Math.floor(Math.random() * a.length)];
}
function sigMatches(s, traffic) {
  if (s.pattern) {
    const pl = traffic.payload || "";
    let hit = false;
    if (s.isRegex) {
      try {
        hit = new RegExp(s.pattern, "i").test(pl);
      } catch (e) {
        hit = false;
      }
    } else hit = pl.toLowerCase().indexOf(s.pattern.toLowerCase()) >= 0;
    if (!hit) return false;
  } else if (s.content && s.content !== "any") {
    if ((traffic.content || "clean") !== s.content) return false;
  }
  if (s.proto && s.proto !== "ip" && s.proto !== traffic.proto) return false;
  if (!portSpecMatches(s.portOp, s.port, s.port2, s.proto, traffic.port))
    return false;

  if (
    !s.pattern &&
    (!s.content || s.content === "any") &&
    (!s.proto || s.proto === "ip") &&
    (!s.portOp || s.portOp === "any")
  )
    return false;
  return true;
}
function sigDesc(s) {
  const parts = [];
  if (s.pattern)
    parts.push((s.isRegex ? "/" : "„") + s.pattern + (s.isRegex ? "/i" : "“"));
  else if (s.content && s.content !== "any") parts.push(threatLabel(s.content));
  const l4 =
    (s.proto && s.proto !== "ip" ? s.proto : "") +
    (s.portOp && s.portOp !== "any"
      ? " " + (s.portOp === "range" ? s.port + "-" + s.port2 : s.port)
      : "");
  if (l4.trim()) parts.push(l4.trim());
  return parts.join(" · ") || "ip";
}
function matchSignature(d, traffic) {
  const blind = trafficEncrypted(traffic) && !(d && d.tlsInspect);
  for (const s of d.signatures || []) {
    if (blind && (s.pattern || (s.content && s.content !== "any"))) continue;
    if (sigMatches(s, traffic)) return s.label || sigDesc(s);
  }
  return null;
}
function parsePortList(str) {
  if (!str) return [];
  return String(str)
    .split(/[,\s]+/)
    .map((x) => parseInt(x, 10))
    .filter((x) => !isNaN(x));
}

function evaluate(srcId, dstId, traffic, dnatRule) {
  if (srcId === dstId) return { status: "same" };

  for (const sg of [srcId, dstId]) {
    if (isSegment(sg) && !isInternetSeg(sg) && stpSegStorming(sg)) {
      const bn = stpStormNode(sg) || getNode(sg);
      return {
        status: "blocked",
        hops: [],
        blockedAt: bn,
        reason: t("nStpStorm"),
      };
    }
  }
  const path = findFullPath(srcId, dstId);
  if (!path) {
    if (isSegment(srcId) && isSegment(dstId) && plainReachable(srcId, dstId)) {
      return { status: "noroute", reason: t("nNoL3") };
    }
    const pp = partialPath(srcId, dstId);
    if (pp && pp.length > 1)
      return {
        status: "noroute",
        reason: t("nNoPath"),
        path: pp,
        blockedAt: getNode(pp[pp.length - 1]),
        hops: [],
      };
    return { status: "noroute", reason: t("nNoPath") };
  }

  if (isAdvanced() && ripLimited(path)) {
    const pp = ripPartialPath(path);
    return {
      status: "noroute",
      reason: t("nRipHopLimit"),
      path: pp,
      blockedAt: getNode(pp[pp.length - 1]),
      hops: [],
    };
  }

  let pdstId = dstId;
  if (isDevice(dstId) && isSegment(path[path.length - 2]))
    pdstId = path[path.length - 2];

  let psrcId = srcId;
  if (
    isDevice(srcId) &&
    isSegment(path[1]) &&
    L3TYPES.includes(getNode(srcId).type)
  )
    psrcId = path[1];
  const hops = [];
  let effTraffic = traffic;
  for (let i = 0; i < path.length; i++) {
    const id = path[i];
    if (!isDevice(id)) continue;
    const d = getNode(id);
    if (d.type === "l2switch" || d.type === "hub") {
      hops.push({
        device: d,
        action: "forward",
        note: t(d.type === "hub" ? "nHubFlood" : "nL2Forward"),
      });
    } else if (d.type === "l2mgmt") {
      const acl = d.acl || [];
      const m = evaluateAcl(acl, psrcId, pdstId, traffic, d.aclDefault);
      if (m.action === "deny") {
        hops.push({
          device: d,
          action: "deny",
          note: m.note,
          rule: m.rule,
          ruleNo: m.ruleNo,
        });
        return {
          status: "blocked",
          path,
          hops,
          blockedAt: d,
          rule: m.rule,
          ruleNo: m.ruleNo,
          reason: m.note,
        };
      }
      let note = t("nL2Forward");
      if (acl.length)
        note += m.ruleNo ? tf("nAclTag", m.ruleNo) : t("nAclTagImplicit");
      hops.push({ device: d, action: "forward", note: note });
    } else if (d.type === "l3switch" || d.type === "router") {
      if (isAdvanced() && !deviceRouteOk(d, pdstId, path, i)) {
        hops.push({ device: d, action: "deny", note: t("nNoStaticRoute") });
        return {
          status: "blocked",
          path,
          hops,
          blockedAt: d,
          reason: t("nNoStaticRoute"),
        };
      }
      const acl = d.acl || [];
      const m = evaluateAcl(acl, psrcId, pdstId, traffic, d.aclDefault);
      const next = path[i + 1];
      const wan =
        d.type === "router" &&
        next &&
        isSegment(next) &&
        getNode(next).subnet === "0.0.0.0/0";
      if (m.action === "deny") {
        hops.push({
          device: d,
          action: "deny",
          note: m.note,
          rule: m.rule,
          ruleNo: m.ruleNo,
        });
        return {
          status: "blocked",
          path,
          hops,
          blockedAt: d,
          rule: m.rule,
          ruleNo: m.ruleNo,
          reason: m.note,
        };
      }

      const prev = path[i - 1];
      const wanIn =
        d.type === "router" &&
        prev &&
        isSegment(prev) &&
        isInternetSeg(prev) &&
        isSegment(srcId) &&
        isInternetSeg(srcId);
      let dnatNote = "";
      if (wanIn) {
        if (dnatRule && (d.portForwards || []).indexOf(dnatRule) >= 0) {
          const dh = getNode(dnatRule.hostId);
          dnatNote =
            " · " +
            tf(
              "nDnat",
              dnatRule.pubPort,
              dh ? dh.label : "?",
              dnatRule.intPort,
            );
        } else {
          hops.push({ device: d, action: "deny", note: t("nRouterNatDeny") });
          return {
            status: "blocked",
            path,
            hops,
            blockedAt: d,
            reason: t("nRouterNatDeny"),
          };
        }
      }
      let note =
        d.type === "router"
          ? wan
            ? t("nRouteNat")
            : t("nRoute")
          : t("nRouteInter");
      note += dnatNote;
      if (acl.length)
        note += m.ruleNo ? tf("nAclTag", m.ruleNo) : t("nAclTagImplicit");
      if (isAdvanced()) {
        const dsub = (getNode(dstId) || {}).subnet;
        if (dsub)
          note +=
            " · " + tf("nLpm", dsub === "0.0.0.0/0" ? t("nDefRoute") : dsub);
      }
      if (isAdvanced()) {
        const rs = routeSourceOf(d, dstId, wan);
        note += " · " + tf("nRouteVia", rs.proto, rs.ad);
      }
      hops.push({ device: d, action: "route", note: note });
    } else if (d.type === "firewall") {
      if (isAdvanced() && !deviceRouteOk(d, pdstId, path, i)) {
        hops.push({ device: d, action: "deny", note: t("nNoStaticRoute") });
        return {
          status: "blocked",
          path,
          hops,
          blockedAt: d,
          reason: t("nNoStaticRoute"),
        };
      }
      if (d.zoneMode === false) {
        const m = evaluateSimpleFirewall(d, psrcId, pdstId, traffic);
        hops.push({
          device: d,
          action: m.action === "permit" ? "permit" : "deny",
          note: m.note,
          rule: m.rule,
          ruleNo: m.ruleNo,
        });
        if (m.action === "deny") {
          return {
            status: "blocked",
            path,
            hops,
            blockedAt: d,
            rule: m.rule,
            ruleNo: m.ruleNo,
            reason: m.note,
          };
        }
      } else {
        const prev = path[i - 1],
          next = path[i + 1];

        const sz = zoneForNeighbor(d, prev !== undefined ? prev : next),
          dz = zoneForNeighbor(d, next !== undefined ? next : prev);
        const r = evaluateFirewall(
          d,
          sz,
          dz,
          traffic,
          psrcId,
          pdstId,
          dnatRule,
        );
        const h = {
          device: d,
          action: r.action === "permit" ? "permit" : "deny",
          note: r.note,
          srcZone: sz,
          dstZone: dz,
          rule: r.rule,
          ruleNo: r.ruleNo,
          stateful: r.stateful,
        };
        hops.push(h);
        if (r.action === "deny") {
          return {
            status: "blocked",
            path,
            hops,
            blockedAt: d,
            rule: r.rule,
            ruleNo: r.ruleNo,
            reason: r.note,
            srcZone: sz,
            dstZone: dz,
          };
        }
      }
    } else if (d.type === "idsips") {
      const blind = trafficEncrypted(effTraffic) && !d.tlsInspect;
      const hit = matchSignature(d, effTraffic);
      if (d.mode === "ids") {
        hops.push({
          device: d,
          action: "forward",
          note: hit
            ? tf("nIdsAlert", hit)
            : blind
              ? t("nIpsEncBlind")
              : t("nIdsPassive"),
        });
      } else {
        if (hit) {
          hops.push({
            device: d,
            action: "deny",
            note: tf("nIpsBlockedInline", hit),
          });
          return {
            status: "blocked",
            path,
            hops,
            blockedAt: d,
            reason: tf("nIpsReason", hit),
          };
        }
        hops.push({
          device: d,
          action: "forward",
          note: blind ? t("nIpsEncBlind") : t("nIpsInlineNoMatch"),
        });
      }
    } else if (d.type === "waf") {
      const WEB_ATTACKS = ["sqli", "xss", "exploit"];
      if (WEB_ATTACKS.indexOf(traffic.content) >= 0) {
        hops.push({
          device: d,
          action: "deny",
          note: tf("nWafBlocked", threatLabel(traffic.content)),
        });
        return {
          status: "blocked",
          path,
          hops,
          blockedAt: d,
          reason: tf("nWafReason", threatLabel(traffic.content)),
        };
      }
      hops.push({ device: d, action: "forward", note: t("nWafPass") });
    } else if (d.type === "datadiode") {
      const nxt = path[i + 1];
      if (d.outId && nxt && nxt !== d.outId) {
        hops.push({ device: d, action: "deny", note: t("nDiodeBlock") });
        return {
          status: "blocked",
          path,
          hops,
          blockedAt: d,
          reason: t("nDiodeBlock"),
        };
      }
      hops.push({
        device: d,
        action: "forward",
        note: d.outId ? t("nDiodeFwd") : t("nDiodePass"),
      });
    } else if (d.type === "loadbalancer") {
      hops.push({ device: d, action: "route", note: t("nLbTransit") });
    } else if (d.type === "vpn") {
      hops.push({ device: d, action: "route", note: t("nVpnTunnel") });
    }

    if (
      dnatRule &&
      effTraffic === traffic &&
      ((d.portForwards || []).indexOf(dnatRule) >= 0 ||
        (dnatRule._static && dnatRule._fwId === d.id))
    ) {
      const ip = +dnatRule.intPort;
      if (isFinite(ip) && ip !== traffic.port)
        effTraffic = Object.assign({}, traffic, { port: ip });
    }
  }
  return applyTtl({ status: "allowed", path, hops, ttlHops: ttlL3Hops(hops) });
}

const TTL_START = 64;
function ttlL3Hops(hops) {
  return (hops || []).filter(
    (h) =>
      h.device &&
      ["router", "l3switch", "firewall"].includes(h.device.type) &&
      h.action !== "deny",
  ).length;
}

function ttlExpiry(hops) {
  let n = 0;
  const H = hops || [];
  for (let i = 0; i < H.length; i++) {
    const h = H[i];
    if (
      !(
        h &&
        h.device &&
        ["router", "l3switch", "firewall"].includes(h.device.type) &&
        h.action !== "deny"
      )
    )
      continue;
    if (++n >= TTL_START) return { dev: h.device, hopIdx: i };
  }
  return null;
}

function applyTtl(res) {
  if (!res || res.status !== "allowed") return res;
  const ex = ttlExpiry(res.hops);
  if (!ex) return res;
  const hops = (res.hops || []).slice(0, ex.hopIdx + 1);
  hops[ex.hopIdx] = Object.assign({}, hops[ex.hopIdx], {
    action: "deny",
    note: t("nTtlExpired"),
  });
  const p = res.path || [],
    pi = p.indexOf(ex.dev.id);
  return {
    status: "blocked",
    ttlExpired: true,
    path: pi >= 0 ? p.slice(0, pi + 1) : p,
    hops,
    blockedAt: ex.dev,
    reason: tf(
      "nTtlExpiredReason",
      ex.dev.label || ex.dev.name || ex.dev.id,
      TTL_START,
    ),
    ttlHops: TTL_START,
  };
}

function ipToInt(ip) {
  const p = String(ip == null ? "" : ip)
    .split(".")
    .map(Number);
  return ((p[0] << 24) >>> 0) + (p[1] << 16) + (p[2] << 8) + p[3];
}
function parseCidr(c) {
  if (typeof c !== "string") return null;
  const i = c.indexOf("/");
  if (i < 0) return null;
  const ip = c.slice(0, i),
    bitsS = c.slice(i + 1);
  if (!/^\d+$/.test(bitsS)) return null;
  const bits = +bitsS;
  const parts = ip.split(".");
  if (
    parts.length !== 4 ||
    !parts.every((s) => /^\d{1,3}$/.test(s) && +s <= 255) ||
    bits > 32
  )
    return null;
  const base = ipToInt(ip);
  const mask = bits === 0 ? 0 : (0xffffffff << (32 - bits)) >>> 0;
  const net = (base & mask) >>> 0;
  const size = bits === 0 ? 0x100000000 : Math.pow(2, 32 - bits);
  return { start: net, end: net + size - 1, bits };
}
function subnetsOverlap(a, b) {
  const x = parseCidr(a),
    y = parseCidr(b);
  if (!x || !y) return false;
  if (a === "0.0.0.0/0" || b === "0.0.0.0/0") return false;
  return x.start <= y.end && y.start <= x.end;
}
function intToIp(n) {
  n = n >>> 0;
  return [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join(
    ".",
  );
}

function subnetGwIp(segId) {
  const n = getNode(segId);
  if (!n || !n.subnet) return null;
  const c = parseCidr(n.subnet);
  if (!c || c.bits >= 31) return null;
  return intToIp(c.start + 1);
}

function isDhcpServerNode(id) {
  const n = getNode(id);
  if (!n) return false;
  if (isDevice(id))
    return (
      (n.type === "router" || n.type === "firewall" || n.type === "l3switch") &&
      n.dhcpRole === "server"
    );
  return isHost(id) && Array.isArray(n.services) && n.services.indexOf(67) >= 0;
}

function dhcpScopeFor(segId) {
  const s = getNode(segId);
  if (!s) return null;
  if (s.dhcpSrvId && isDhcpServerNode(s.dhcpSrvId)) {
    const srv = getNode(s.dhcpSrvId);

    const sc = Array.isArray(srv.dhcpScopes)
      ? srv.dhcpScopes.find((x) => x && x.segId === segId)
      : null;
    if (sc)
      return {
        dhcpStart: sc.start,
        dhcpEnd: sc.end,
        dhcpReservations: Array.isArray(sc.reservations) ? sc.reservations : [],
      };
    return srv;
  }
  return s;
}

const _dhcpEvalSegs = new Set();
