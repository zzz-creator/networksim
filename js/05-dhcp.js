"use strict";

let _dhcpReachCache = new Map();
function dhcpCacheClear() {
  _dhcpReachCache.clear();
}
function dhcpServerReachable(segId, srvId) {
  const srv = getNode(srvId);
  if (!srv || isInactive(srvId)) return false;
  if (neighborsOf(srvId).indexOf(segId) >= 0) return true;
  if (isHost(srvId) && srv.segId === segId) return true;
  const s = getNode(segId),
    relay = s && s.dhcpRelayId;
  const rn = relay ? getNode(relay) : null;
  if (!rn || isInactive(relay)) return false;

  if (!isDevice(relay) || L3TYPES.indexOf(rn.type) < 0) return false;
  if (!(neighborsOf(relay).indexOf(segId) >= 0 || gatewaysOf(segId).has(relay)))
    return false;
  if (_dhcpEvalSegs.has(segId)) return false;
  const ck = segId + "|" + srvId,
    hit = _dhcpReachCache.get(ck);
  if (hit !== undefined) return hit;
  const top = _dhcpEvalSegs.size === 0;
  _dhcpEvalSegs.add(segId);
  let out;
  try {
    out =
      evaluateEP(segId, srvId, {
        proto: "udp",
        port: 67,
        content: null,
        payload: null,
      }).status === "allowed";
  } catch (e) {
    out = false;
  } finally {
    _dhcpEvalSegs.delete(segId);
  }
  if (top) _dhcpReachCache.set(ck, out);
  return out;
}

function dhcpAvailable(segId) {
  const s = getNode(segId);
  if (!s) return true;
  if (s.dhcpSrvId) {
    if (!isDhcpServerNode(s.dhcpSrvId)) return false;
    return dhcpServerReachable(segId, s.dhcpSrvId);
  }
  return s.dhcp !== false;
}

function dhcpStarverStopped(id) {
  const h = getNode(id),
    rng = h && h.segId ? segDhcpRange(h.segId) : null;
  const need = rng ? rng.end - rng.start + 1 : 2;
  for (const l of linksOf(id)) {
    const p = l.port;
    if (!(p && p.mode === "access" && p.sec)) continue;
    if (p.sec.mac) return true;
    if (+p.sec.max > 0 && +p.sec.max < need) return true;
  }
  return false;
}
function dhcpStarved(segId) {
  return (DB.hosts || []).some(
    (a) =>
      a &&
      a.dhcpStarve &&
      a.segId === segId &&
      !isInactive(a.id) &&
      !dhcpStarverStopped(a.id),
  );
}

function segDhcpRange(segId) {
  const s = getNode(segId);
  if (!s) return null;
  const c = parseCidr(s.subnet);
  if (!c || c.bits >= 31) return null;
  const cfg = dhcpScopeFor(segId) || s;
  const lo = c.start + 1,
    hi = c.end - 1;
  let st =
    cfg.dhcpStart && _ipValid(String(cfg.dhcpStart).trim())
      ? ipToInt(String(cfg.dhcpStart).trim())
      : null;
  let en =
    cfg.dhcpEnd && _ipValid(String(cfg.dhcpEnd).trim())
      ? ipToInt(String(cfg.dhcpEnd).trim())
      : null;
  if (st == null && en == null) {
    let base = c.start + 10;
    if (base > hi) base = c.start + 2;
    st = base;
    en =
      typeof cfg.dhcpMax === "number" && cfg.dhcpMax >= 0
        ? base + cfg.dhcpMax - 1
        : hi;
  } else {
    if (st == null) st = c.start + 10;
    if (en == null) en = hi;
  }
  st = Math.max(st, lo);
  en = Math.min(en, hi);
  en = Math.min(en, st + 65535);
  if (en < st) return null;
  return { start: st, end: en };
}

function segReservationFor(segId, mac) {
  const cfg = dhcpScopeFor(segId);
  if (!cfg || !Array.isArray(cfg.dhcpReservations) || !mac) return null;
  const m = String(mac).trim().toLowerCase();
  const r = cfg.dhcpReservations.find(
    (x) =>
      x &&
      x.mac &&
      String(x.mac).trim().toLowerCase() === m &&
      x.ip &&
      _ipValid(String(x.ip).trim()),
  );
  return r ? String(r.ip).trim() : null;
}
function hostIpAuto(hostId) {
  const h = getNode(hostId);
  if (!h || !h.segId) return null;
  if (h.ip && h.ip.trim()) return h.ip.trim();
  const c = parseCidr((getNode(h.segId) || {}).subnet);
  if (!c || c.bits >= 31) return null;
  if (!dhcpAvailable(h.segId)) return null;
  const resv = segReservationFor(h.segId, hostMac(hostId));
  if (resv) return resv;
  if (dhcpStarved(h.segId)) return null;
  const rng = segDhcpRange(h.segId);
  if (!rng) return null;

  const taken = new Set();
  (DB.hosts || []).forEach((x) => {
    if (x.segId === h.segId && x.id !== hostId && x.ip && _ipValid(x.ip.trim()))
      taken.add(ipToInt(x.ip.trim()));
  });
  const cfgR = dhcpScopeFor(h.segId);
  if (cfgR && Array.isArray(cfgR.dhcpReservations))
    cfgR.dhcpReservations.forEach((x) => {
      if (x && x.ip && _ipValid(String(x.ip).trim()))
        taken.add(ipToInt(String(x.ip).trim()));
    });

  const dyn = (DB.hosts || []).filter(
    (x) =>
      x.segId === h.segId &&
      !(x.ip && x.ip.trim()) &&
      !segReservationFor(h.segId, hostMac(x.id)),
  );
  const rank = dyn.findIndex((x) => x.id === hostId);
  if (rank < 0) return null;
  let seen = -1;
  for (let ip = rng.start; ip <= rng.end; ip++) {
    if (taken.has(ip)) continue;
    seen++;
    if (seen === rank) return intToIp(ip);
  }
  return null;
}

function dhcpOfferSurvives(serverId) {
  for (const l of linksOf(serverId)) {
    const other = l.fromId === serverId ? l.toId : l.fromId,
      nd = getNode(other);
    if (nd && isDevice(nd.id) && nd.dhcpSnoop && !(l.port && l.port.trust))
      return false;
  }
  return true;
}
function hostDhcpGw(hostId) {
  const h = getNode(hostId);
  if (!h || !h.segId) return { has: false, gw: null };
  const servers = (DB.hosts || []).filter(
    (s) => s.dhcpd && s.segId === h.segId && s.id !== hostId,
  );
  if (!servers.length) return { has: false, gw: null };
  const surv = servers.filter((s) => dhcpOfferSurvives(s.id));
  if (!surv.length) return { has: true, gw: null };
  const win = surv.find((s) => s.dhcpd.rogue) || surv[0];
  return { has: true, gw: win.dhcpd.gw || null };
}

function hostGwOk(hostId) {
  const h = getNode(hostId);
  if (!h) return true;
  if (h.gw && h.gw.trim()) return h.gw.trim() === subnetGwIp(h.segId);
  const d = hostDhcpGw(hostId);
  if (!d.has) return true;
  return d.gw != null && d.gw === subnetGwIp(h.segId);
}

function arpSpooferStopped(spooferId) {
  for (const l of linksOf(spooferId)) {
    const other = l.fromId === spooferId ? l.toId : l.fromId,
      nd = getNode(other);
    if (nd && isDevice(nd.id) && nd.dai && !(l.port && l.port.trust))
      return true;
  }
  return false;
}
function arpPoisoned(hostId) {
  const h = getNode(hostId);
  if (!h || !h.segId) return false;
  return (DB.hosts || []).some(
    (s) =>
      s.arpSpoof &&
      s.segId === h.segId &&
      s.id !== hostId &&
      !isDown(s.id) &&
      !isQuar(s.id) &&
      !arpSpooferStopped(s.id),
  );
}

function segDhcpOn(segId) {
  const s = getNode(segId);
  return !s || s.dhcp !== false;
}
function hostHasIp(hostId) {
  return hostIpAuto(hostId) != null;
}

function hostMac(hostId) {
  const h = getNode(hostId);
  if (!h) return null;
  if (h.mac && h.mac.trim()) return h.mac.trim().toLowerCase();
  let n = 0;
  for (let i = 0; i < hostId.length; i++)
    n = (n * 31 + hostId.charCodeAt(i)) >>> 0;
  const b = [
    2,
    (n >>> 24) & 255,
    (n >>> 16) & 255,
    (n >>> 8) & 255,
    n & 255,
    (n * 7) & 255,
  ];
  return b.map((x) => ("0" + (x & 255).toString(16)).slice(-2)).join(":");
}

const PORTSEC_L2_TYPES = ["l2switch", "l2mgmt", "hub", "ap"];

const PORTSEC_OWNER_TYPES = ["l2switch", "l2mgmt", "ap"];
function macsBehindPort(sideId, portDevId) {
  const seen = new Set([portDevId, sideId]);
  const q = [sideId];
  let n = isHost(sideId) ? 1 : 0;
  while (q.length) {
    const c = q.shift();
    for (const nb of neighborsOf(c)) {
      if (seen.has(nb)) continue;
      seen.add(nb);
      if (isHost(nb)) {
        n++;
        q.push(nb);
        continue;
      }
      const nd = getNode(nb);
      if (nd && isDevice(nb) && PORTSEC_L2_TYPES.indexOf(nd.type) >= 0)
        q.push(nb);
    }
  }
  return n;
}

function hostPortSecViolation(hostId) {
  const chk = (p, side, dev) => {
    if (!(p && p.mode === "access" && p.sec)) return null;
    if (p.sec.mac && hostMac(hostId) !== String(p.sec.mac).trim().toLowerCase())
      return "mac";
    if (+p.sec.max > 0 && macsBehindPort(side, dev) > +p.sec.max) return "max";
    return null;
  };
  const seen = new Set([hostId]);
  const q = [hostId];
  while (q.length) {
    const c = q.shift();
    for (const l of linksOf(c)) {
      const nb = l.fromId === c ? l.toId : l.fromId;
      if (seen.has(nb)) continue;
      const nbd = getNode(nb);
      const isL2 = !!(
        nbd &&
        isDevice(nb) &&
        PORTSEC_L2_TYPES.indexOf(nbd.type) >= 0
      );

      if (
        c === hostId ||
        (isL2 && PORTSEC_OWNER_TYPES.indexOf(nbd.type) >= 0)
      ) {
        const v = chk(l.port, c, nb);
        if (v) return v;
      }
      if (isL2) {
        seen.add(nb);
        q.push(nb);
      }
    }
  }
  return null;
}

function _hash32(s) {
  let n = 0;
  s = String(s);
  for (let i = 0; i < s.length; i++) n = (n * 31 + s.charCodeAt(i)) >>> 0;
  return n;
}
function natPublicIp(devId) {
  return "203.0.113." + (1 + (_hash32(devId) % 50));
}
function natEphPort(hostId) {
  return 49152 + (_hash32("eph:" + hostId) % 16000);
}
function natPatPort(key) {
  return 40000 + (_hash32("pat:" + key) % 20000);
}

function epAddr(id) {
  if (isHost(id)) {
    const ip = hostIpAuto(id),
      mac = hostMac(id);
    return (ip || "") + (mac ? " · " + mac : "");
  }
  if (isSegment(id)) {
    const s = getNode(id);
    return s.isInternet ? "Internet (0.0.0.0/0)" : s.subnet || s.name || "";
  }
  const n = getNode(id);
  return n ? n.label || "" : "";
}

function _ipValid(s) {
  return (
    /^\d{1,3}(\.\d{1,3}){3}$/.test(s) &&
    s.split(".").every((o) => +o >= 0 && +o <= 255)
  );
}
function hostIpInSubnet(hostId) {
  const h = getNode(hostId);
  if (!h || !h.ip || !h.ip.trim() || !h.segId) return true;
  const ipS = h.ip.trim();
  if (!_ipValid(ipS)) return false;
  const c = parseCidr((getNode(h.segId) || {}).subnet);
  if (!c) return true;
  const ip = ipToInt(ipS);
  if (ip < c.start || ip > c.end) return false;
  if (c.bits < 31 && (ip === c.start || ip === c.end)) return false;
  return true;
}

let _ipConflictSet = null;
function buildIpConflicts() {
  const byKey = new Map();
  (DB.hosts || []).forEach((h) => {
    if (!h || !h.segId) return;
    const ip = hostIpAuto(h.id);
    if (!ip) return;
    const k = h.segId + "|" + ip;
    let a = byKey.get(k);
    if (!a) {
      a = [];
      byKey.set(k, a);
    }
    a.push(h.id);
  });
  const s = new Set();
  byKey.forEach((a) => {
    if (a.length > 1) a.forEach((id) => s.add(id));
  });
  return s;
}
function hostIpConflict(hostId) {
  if (_ipConflictSet) return _ipConflictSet.has(hostId);
  const h = getNode(hostId);
  if (!h || !h.segId) return false;
  const mine = hostIpAuto(hostId);
  if (!mine) return false;
  return (DB.hosts || []).some(
    (x) => x.id !== hostId && x.segId === h.segId && hostIpAuto(x.id) === mine,
  );
}

function hostStaticInPool(hostId) {
  const h = getNode(hostId);
  if (!h || !h.segId || !h.ip || !h.ip.trim() || !_ipValid(h.ip.trim()))
    return false;
  if (!segDhcpOn(h.segId)) return false;
  const rng = segDhcpRange(h.segId);
  if (!rng) return false;
  const ip = ipToInt(h.ip.trim());
  if (ip < rng.start || ip > rng.end) return false;
  const resv = segReservationFor(h.segId, hostMac(hostId));
  return !(resv && _ipValid(resv) && ipToInt(resv) === ip);
}

function nodeMac(id) {
  if (isHost(id)) return hostMac(id);
  const n = getNode(id);
  if (!n) return null;
  if (n.mac && String(n.mac).trim()) return String(n.mac).trim().toLowerCase();
  const x = _hash32("dev:" + id);
  const b = [
    2,
    (x >>> 24) & 255,
    (x >>> 16) & 255,
    (x >>> 8) & 255,
    x & 255,
    (x * 7) & 255,
  ];
  return b.map((v) => ("0" + (v & 255).toString(16)).slice(-2)).join(":");
}

function deviceRouteOk(d, dstSeg, path, idx) {
  if (!d) return true;
  if (deviceProto(d) !== "static") return true;
  const dn = getNode(dstSeg);
  if (!dn || !dn.subnet) return true;
  if (neighborsOf(d.id).indexOf(dstSeg) >= 0) return true;
  if (dn.gwId === d.id) return true;
  const dc = parseCidr(dn.subnet);
  if (!dc) return true;
  return (d.routes || []).some((r) => {
    const rc = parseCidr(r && r.dest);
    if (!(rc && dc.start >= rc.start && dc.end <= rc.end)) return false;

    if (r.via && path) {
      const vi = path.indexOf(r.via);
      if (vi >= 0 && vi < idx) return false;
    }
    return true;
  });
}

function aclPortRange(r) {
  if (r.proto === "icmp") return [0, 65535];
  const op = r.portOp;
  const num = (v) => (v == null || v === "" ? null : +v);
  const p1 = num(r.port),
    p2 = num(r.port2);
  if (!op || op === "any") return [0, 65535];
  if (op === "eq") return p1 == null ? [0, 65535] : [p1, p1];
  if (op === "range") {
    if (p1 == null || p2 == null || p1 > p2) return [0, 65535];
    return [p1, p2];
  }
  return [0, 65535];
}

function aclCovers(j, i) {
  if (j.proto !== "ip" && j.proto !== i.proto) return false;
  if (j.srcSeg && j.srcSeg !== "*" && j.srcSeg !== i.srcSeg) return false;
  if (j.dstSeg && j.dstSeg !== "*" && j.dstSeg !== i.dstSeg) return false;
  const jr = aclPortRange(j),
    ir = aclPortRange(i);
  return jr[0] <= ir[0] && ir[1] <= jr[1];
}

function firstShadowedRule(acl) {
  if (!Array.isArray(acl)) return 0;
  for (let i = 0; i < acl.length; i++)
    for (let j = 0; j < i; j++) if (aclCovers(acl[j], acl[i])) return i + 1;
  return 0;
}

function fwRuleCovers(j, i) {
  const zc = (zj, zi) => zj === "*" || zj === zi;
  if (!zc(j.srcZone, i.srcZone)) return false;
  if (!zc(j.dstZone, i.dstZone)) return false;
  return aclCovers(j, i);
}
function firstShadowedFwRule(rules) {
  if (!Array.isArray(rules)) return 0;
  for (let i = 0; i < rules.length; i++)
    for (let j = 0; j < i; j++)
      if (fwRuleCovers(rules[j], rules[i])) return i + 1;
  return 0;
}
function nodeWarnings(n) {
  const w = [];
  const links = linksOf(n.id);
  if (n.type === "host") {
    if (!n.segId || !getNode(n.segId)) w.push(t("warnHostNoSeg"));
    else if (linksOf(n.id).length && !hostLinkCarriesVlan(n.id))
      w.push(t("warnHostPortVlan"));
    if (isDnsHost(n.id)) {
      const dead = dnsRecordsOf(n)
        .filter(
          (r) =>
            r &&
            dnsNorm(r.name) &&
            dnsRecType(r) !== "CNAME" &&
            !getNode(r.hostId),
        )
        .map((r) => r.name);
      if (dead.length) w.push(tf("warnDnsDeadRec", dead.join(", ")));
      const noName = dnsRecordsOf(n).filter(
        (r) => r && !dnsNorm(r.name),
      ).length;
      if (noName) w.push(t("warnDnsEmptyRec"));
    }
    {
      if (n.ip && n.ip.trim() && !hostIpInSubnet(n.id))
        w.push(t("warnHostBadIp"));
      else if (hostIpConflict(n.id)) w.push(t("warnHostIpConflict"));
      else if (hostStaticInPool(n.id)) w.push(t("warnStaticInPool"));
    }
    return w;
  }
  if (isSegment(n.id)) {
    if (links.length === 0) {
      w.push(t("warnSegNoLinks"));
    } else {
      const reach = reachableDevices(n.id);
      const hasL3 = reach.some((d) => L3TYPES.includes(d.type));
      const onlyL2 =
        reach.length > 0 &&
        reach.every(
          (d) =>
            d.type === "l2switch" ||
            d.type === "l2mgmt" ||
            d.type === "ap" ||
            d.type === "hub",
        );
      if (onlyL2 && !hasL3) {
        w.push(t("warnSegNoL3"));
      }
    }
    for (const s of DB.segments) {
      if (s.id !== n.id && subnetsOverlap(n.subnet, s.subnet)) {
        w.push(tf("warnSubnetOverlap", n.subnet, s.subnet, s.name));
      }
    }
  } else {
    if (links.length === 0) {
      w.push(t("warnDevNoLinks"));
    } else if (n.type === "firewall") {
      ensureFirewallZones(n);
      const hasOutside = fwInterfaces(n).some((it) => {
        const z = (n.zones || []).find(
          (z) => z.id === n.ifaceZones[it.link.id],
        );
        return z && z.role === "outside";
      });
      const facesInternet = fwInterfaces(n).some((it) =>
        ifaceLeadsOutside(n.id, it.neighborId),
      );
      if (facesInternet && !hasOutside) w.push(t("warnFwNoOutside"));
      const shf = firstShadowedFwRule(n.firewallRules);
      if (shf) w.push(t("wAclShadowed").replace("{n}", shf));

      const pf = n.portForwards || [];
      dup: for (let i = 0; i < pf.length; i++)
        for (let j = 0; j < i; j++)
          if (
            pf[j].proto === pf[i].proto &&
            +pf[j].pubPort === +pf[i].pubPort &&
            pf[j].hostId !== pf[i].hostId
          ) {
            w.push(
              tf("wPfDup", String(pf[i].proto).toUpperCase(), pf[i].pubPort),
            );
            break dup;
          }
    }
    const sh = firstShadowedRule(n.acl);
    if (sh) w.push(t("wAclShadowed").replace("{n}", sh));

    if (
      deviceProto(n) === "static" &&
      (n.routes || []).some(
        (r) => r && r.via && neighborsOf(n.id).indexOf(r.via) < 0,
      )
    )
      w.push(t("warnRouteViaGone"));

    const _dr = dnsRoleOf(n.id);
    if (_dr === "server") {
      const recs = dnsRecordsOf(n);
      if (!recs.some((r) => r && dnsNorm(r.name))) w.push(t("warnDevDnsNoRec"));
      const dead = recs
        .filter(
          (r) =>
            r &&
            dnsNorm(r.name) &&
            dnsRecType(r) !== "CNAME" &&
            !getNode(r.hostId),
        )
        .map((r) => r.name);
      if (dead.length) w.push(tf("warnDnsDeadRec", dead.join(", ")));
    } else if (_dr === "forwarder") {
      const up = dnsUpstreamOf(n);
      if (up) {
        try {
          if (
            evaluateEP(n.id, up, {
              proto: "udp",
              port: 53,
              content: null,
              payload: null,
            }).status !== "allowed"
          )
            w.push(t("warnDnsUpUnreach"));
        } catch (e) {}
      }
    }

    if (n.dhcpRole === "server") {
      const served = DB.segments.filter((s) => s.dhcpSrvId === n.id);
      if (!served.length) w.push(t("warnDhcpNoSeg"));
      const _out = (v, c) => {
        if (!v) return false;
        const s2 = String(v).trim();
        return _ipValid(s2) && (ipToInt(s2) < c.start || ipToInt(s2) > c.end);
      };
      served.forEach((s2) => {
        const c = parseCidr(s2.subnet);
        if (!c) return;
        const sc = Array.isArray(n.dhcpScopes)
          ? n.dhcpScopes.find((x) => x && x.segId === s2.id)
          : null;
        const src = sc
          ? { a: sc.start, b: sc.end }
          : { a: n.dhcpStart, b: n.dhcpEnd };
        if (_out(src.a, c) || _out(src.b, c))
          w.push(tf("warnDhcpScopeOut", s2.name));
      });
    }
  }

  try {
    if (isDevice(n.id) && Array.isArray(n.ssids))
      apEffSsids(n).forEach((ss) => {
        if (ssidSec(ss) === "ent" && !radiusReachable(ss.segId, ss.radiusId))
          w.push(tf("warnRadiusUnreach", ss.name));
      });
    if (
      n.type === "firewall" &&
      n.vpnRadiusId &&
      !radiusReachable(n.id, n.vpnRadiusId)
    )
      w.push(t("warnVpnRadiusUnreach"));
  } catch (e) {}
  return w;
}
function reachableDevices(segId) {
  const seen = new Set([segId]);
  const q = [segId];
  const devs = [];
  while (q.length) {
    const c = q.shift();
    for (const nb of neighborsOf(c)) {
      if (!seen.has(nb)) {
        seen.add(nb);
        if (isDevice(nb)) devs.push(getNode(nb));
        q.push(nb);
      }
    }
  }
  return devs;
}

function el(tag, attrs, children) {
  const e = document.createElementNS(SVGNS, tag);
  if (attrs) for (const k in attrs) e.setAttribute(k, attrs[k]);
  if (children) for (const c of children) e.appendChild(c);
  return e;
}
function txt(s, attrs) {
  const t = el("text", attrs);
  t.textContent = s;
  return t;
}
const svg = $("svg");
