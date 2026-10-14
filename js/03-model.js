"use strict";

function isPriorityTraffic(traffic) {
  return !!(traffic && QOS_PRIO_PORTS.indexOf(traffic.port) >= 0);
}

function qosProtects(l, traffic) {
  return !!(l && l.qos && isPriorityTraffic(traffic));
}
function edgeCongested(a, b, traffic) {
  return (DB.links || []).some(
    (l) =>
      ((l.fromId === a && l.toId === b) || (l.fromId === b && l.toId === a)) &&
      l.congested &&
      !linkDown(l) &&
      !qosProtects(l, traffic),
  );
}
function pathCongested(path, traffic) {
  if (!path || path.length < 2) return false;
  for (let i = 0; i < path.length - 1; i++)
    if (edgeCongested(path[i], path[i + 1], traffic)) return true;
  return false;
}

function neighborsOf(id) {
  return linksOf(id).map((l) => (l.fromId === id ? l.toId : l.fromId));
}

const DEFAULT_PORTS = {
  host: 1,
  l2switch: 24,
  l2mgmt: 24,
  l3switch: 24,
  router: 4,
  firewall: 8,
  hub: 8,
  ap: 4,
  loadbalancer: 4,
  idsips: 2,
  vpn: 2,
};

const PORT_OPTIONS = {
  host: [1, 2, 4],
  l2switch: [4, 5, 8, 16, 24, 48],
  l2mgmt: [4, 5, 8, 16, 24, 48],
  l3switch: [4, 5, 8, 16, 24, 48],
  router: [2, 4, 8, 16],
  firewall: [4, 8, 16],
  hub: [4, 5, 8, 16],
  ap: [1, 2, 4],
  loadbalancer: [2, 4, 8],
  idsips: [2],
  vpn: [2, 4],
};

function portLinks(d) {
  return linksOf(d.id).filter((l) => {
    if (l.wl) return false;
    const oid = l.fromId === d.id ? l.toId : l.fromId;
    if (isSegment(oid)) {
      const s = getNode(oid);
      if (!(s && s.isInternet)) return false;
    }
    const h = isHost(d.id) && d.wifi && d.wifi.apId === oid;
    const h2 =
      isHost(oid) &&
      getNode(oid) &&
      getNode(oid).wifi &&
      getNode(oid).wifi.apId === d.id;
    if (h || h2) return false;
    return true;
  });
}

function usedPortsPhys(d, skip) {
  return portLinks(d).reduce(
    (n, l) => (skip && skip(l) ? n : n + (l.fromId === l.toId ? 2 : 1)),
    0,
  );
}

function loopSlotsOf(d) {
  const out = {};
  if (!d || !d.id) return out;
  const links = portLinks(d),
    loops = links.filter((l) => l.fromId === l.toId);
  if (!loops.length) return out;
  const taken = new Set();
  links.forEach((l) => {
    const p = portNumOf(l, d.id);
    if (p) taken.add(p);
  });
  const N = portsOf(d);
  loops.forEach((l) => {
    for (let i = 1; i <= N; i++)
      if (!taken.has(i)) {
        taken.add(i);
        out[i] = l;
        break;
      }
  });
  return out;
}

function isWanLink(l) {
  if (!l) return false;
  const f = getNode(l.fromId),
    g = getNode(l.toId);
  return !!((f && f.isInternet) || (g && g.isInternet));
}

function wanLinksOf(d) {
  if (!d || !d.id || !isDevice(d.id)) return [];
  return (DB.links || []).filter(
    (l) => isWanLink(l) && (l.fromId === d.id || l.toId === d.id),
  );
}
function wanModeOf(d) {
  return d && d.wanMode === "balance" ? "balance" : "failover";
}

function wanPrimaryOf(d) {
  const wl = wanLinksOf(d);
  if (!wl.length) return null;
  const p = d.wanPrimary && wl.find((l) => l.id === d.wanPrimary);
  return (p || wl[0]).id;
}

function wanInetOf(l) {
  const f = getNode(l.fromId);
  return f && f.isInternet ? l.fromId : l.toId;
}

function wanCostExtra(l) {
  if (!isWanLink(l)) return 0;
  const f = getNode(l.fromId);
  const d = f && f.isInternet ? getNode(l.toId) : f;
  if (!d || !isDevice(d.id)) return 0;
  if (wanModeOf(d) !== "failover") return 0;
  const wl = wanLinksOf(d);
  if (wl.length < 2) return 0;
  return l.id === wanPrimaryOf(d) ? 0 : 1000;
}

function isWifiOnlyHost(d) {
  return !!(d && d.type === "host" && hostKind(d.kind).wifiOnly);
}
function hostPortOpts(d) {
  const k = hostKind(d.kind);
  return k.wifiOnly ? [] : k.ports || [1];
}

const DEFAULT_SFP = { l2switch: 2, l2mgmt: 2, l3switch: 2 };
const SFP_OPTIONS = {
  l2switch: [0, 2, 4, 8],
  l2mgmt: [0, 2, 4, 8],
  l3switch: [0, 2, 4, 8],
  router: [0, 2],
  firewall: [0, 2],
};
const MAX_PORTS = 64;
function _portNum(v, def) {
  return Number.isInteger(v) && v >= 0 && v <= MAX_PORTS ? v : def;
}
function sfpOf(d) {
  if (!d || d.type === "host") return 0;
  if (typeof d.sfp === "number")
    return _portNum(d.sfp, DEFAULT_SFP[d.type] || 0);
  return DEFAULT_SFP[d.type] || 0;
}

function rj45Of(d) {
  if (d.type === "host") {
    const o = hostPortOpts(d);
    return Math.max(
      typeof d.ports === "number" ? d.ports : o.length ? o[0] : 0,
      usedPortsPhys(d),
    );
  }
  const base =
    typeof d.ports === "number" ? d.ports : DEFAULT_PORTS[d.type] || 8;
  return Math.max(base, usedPortsPhys(d) - sfpOf(d));
}

function portsOf(d) {
  return rj45Of(d) + sfpOf(d);
}
function isSfpNum(d, num) {
  return num > rj45Of(d);
}

function portLabelOf(d, num) {
  return isSfpNum(d, num)
    ? "SFP " + (num - rj45Of(d))
    : t("portLabel") + " " + num;
}

function portNumOf(link, devId) {
  return (link && link.pi && link.pi[devId]) || 0;
}

const PORTCFG_SWITCH_TYPES = ["l2switch", "l2mgmt", "l3switch"];
function portCfgIsSwitch(d) {
  return !!d && PORTCFG_SWITCH_TYPES.indexOf(d.type) >= 0;
}

function portVlanCapable(d) {
  return (
    portCfgIsSwitch(d) ||
    (!!d && (d.type === "router" || d.type === "firewall"))
  );
}

function portCfgMeaningful(p) {
  return (
    !!p &&
    (p.mode ||
      p.vlan ||
      (p.vlans && p.vlans.length) ||
      p.sec ||
      p.off ||
      p.trust ||
      p.bpduGuard ||
      p.dot1x)
  );
}

function portCfgGet(d, num) {
  if (!d.portCfg) d.portCfg = {};
  if (!d.portCfg[num]) d.portCfg[num] = {};
  return d.portCfg[num];
}

function portCfgClean(d, num) {
  const c = d.portCfg && d.portCfg[num];
  if (!c) return;
  if (!portCfgMeaningful(c)) delete d.portCfg[num];
  if (d.portCfg && !Object.keys(d.portCfg).length) delete d.portCfg;
}

function assignLinkSlots(d) {
  if (!d || !d.id) return;
  const links = portLinks(d);
  const N = portsOf(d);
  const taken = new Set();
  links.forEach((l) => {
    if (l.pi && l.pi[d.id]) taken.add(l.pi[d.id]);
  });

  Object.keys(loopSlotsOf(d)).forEach((n) => taken.add(+n));
  const nextFree = () => {
    const cfg = d.portCfg || {};
    let preferred = 0,
      plain = 0;
    for (let i = 1; i <= N; i++) {
      if (taken.has(i)) continue;
      if (cfg[i] && !preferred) preferred = i;
      if (!plain) plain = i;
    }
    return preferred || plain || 0;
  };
  links.forEach((l) => {
    if (l.pi && l.pi[d.id]) return;
    const num = nextFree();
    if (!num) return;
    if (!l.pi) l.pi = {};
    l.pi[d.id] = num;
    taken.add(num);
  });
}

function usedSfp(d) {
  const r = rj45Of(d);
  const ls = loopSlotsOf(d);
  return (
    portLinks(d).filter((l) => ((l.pi && l.pi[d.id]) || 0) > r).length +
    Object.keys(ls).filter((n) => +n > r).length
  );
}
function usedRj45(d) {
  return usedPortsPhys(d) - usedSfp(d);
}

function portOptionsFor(d) {
  const used = usedRj45(d),
    cur = rj45Of(d);
  const base = d.type === "host" ? hostPortOpts(d) : PORT_OPTIONS[d.type] || [];
  let opts = base.filter((v) => v >= used);
  if (cur > 0 && opts.indexOf(cur) < 0) opts.push(cur);
  return [...new Set(opts)].sort((a, b) => a - b);
}

function maxUsedSfpSlot(d) {
  const r = rj45Of(d);
  let m = 0;
  portLinks(d).forEach((l) => {
    const pi = (l.pi && l.pi[d.id]) || 0;
    if (pi > r && pi - r > m) m = pi - r;
  });
  return m;
}

function sfpOptionsFor(d) {
  const minS = maxUsedSfpSlot(d),
    cur = sfpOf(d);
  let opts = (SFP_OPTIONS[d.type] || []).filter((v) => v >= minS);
  if (opts.indexOf(cur) < 0) opts.push(cur);
  return [...new Set(opts)].sort((a, b) => a - b);
}

function remapSfpSlots(d, oldR, newR) {
  if (oldR === newR) return;
  const shift = newR - oldR;
  portLinks(d).forEach((l) => {
    const p = l.pi && l.pi[d.id];
    if (!p) return;
    if (p > oldR) l.pi[d.id] = p + shift;
    else if (p > newR) delete l.pi[d.id];
  });
  if (d.portCfg) {
    const nc = {};
    Object.keys(d.portCfg).forEach((k) => {
      const n = +k;
      if (n > oldR) nc[n + shift] = d.portCfg[k];
      else if (n <= newR) nc[n] = d.portCfg[k];
    });
    if (Object.keys(nc).length) d.portCfg = nc;
    else delete d.portCfg;
  }
  assignLinkSlots(d);
}

function movePortSlot(d, l, to) {
  assignLinkSlots(d);
  const from = portNumOf(l, d.id);
  if (!to || to === from || to < 1 || to > portsOf(d)) return false;
  if (
    portLinks(d).some((x) => x !== l && portNumOf(x, d.id) === to) ||
    loopSlotsOf(d)[to]
  )
    return false;
  if (d.portCfg && d.portCfg[to]) {
    d.portCfg[from] = d.portCfg[to];
    delete d.portCfg[to];
  }
  if (!l.pi) l.pi = {};
  l.pi[d.id] = to;
  return true;
}
function nodeDims(n) {
  return n.type === "host" ? NODE.host : isSegment(n.id) ? NODE.seg : NODE.dev;
}
function uid(p) {
  let i = 1;
  while (getNode(p + i) || DB.links.some((l) => l.id === p + i)) i++;
  return p + i;
}
function nextLabel(type) {
  const map = {
    l2switch: "SW",
    l2mgmt: "MSW",
    hub: "HUB",
    l3switch: "L3",
    router: "R",
    firewall: "FW",
    idsips: "IPS",
    loadbalancer: "LB",
    vpn: "VPN",
    ap: "AP",
    datadiode: "DIODE",
    waf: "WAF",
    host: "PC",
  };
  const pre = map[type] || "DEV";

  const all = DB.devices.concat(DB.hosts || []);
  let n = 1,
    lbl;
  do {
    lbl = pre + "-" + n;
    n++;
  } while (all.some((d) => d.label === lbl));
  return lbl;
}

function nextHostLabel(kind) {
  const pre = hostKind(kind).prefix || "PC";
  const all = DB.devices.concat(DB.hosts || []);
  let n = 1,
    lbl;
  do {
    lbl = pre + "-" + n;
    n++;
  } while (all.some((d) => d.label === lbl));
  return lbl;
}

function isAutoHostLabel(name) {
  return new RegExp(
    "^(" + HOST_KINDS.map((k) => k.prefix).join("|") + ")-\\d+$",
  ).test(name || "");
}

function roleName(role) {
  return role === "inside"
    ? "inside"
    : role === "outside"
      ? "outside"
      : role === "vpn"
        ? "VPN"
        : "DMZ";
}
function isInternetSeg(id) {
  const n = getNode(id);
  return !!(n && isSegment(id) && (n.isInternet || n.subnet === "0.0.0.0/0"));
}

function ifaceLeadsOutside(fwId, neighborId) {
  if (isInternetSeg(neighborId)) return true;
  const seen = new Set([fwId]),
    q = [neighborId];
  while (q.length) {
    const c = q.shift();
    if (seen.has(c)) continue;
    seen.add(c);
    if (isInternetSeg(c)) return true;
    if (isSegment(c)) continue;
    if (isDevice(c)) {
      const t = getNode(c).type;
      if (
        t !== "idsips" &&
        t !== "l2switch" &&
        t !== "l2mgmt" &&
        t !== "ap" &&
        t !== "hub" &&
        t !== "datadiode" &&
        t !== "waf"
      )
        continue;
    }
    for (const nb of neighborsOf(c)) if (!seen.has(nb)) q.push(nb);
  }
  return false;
}
function fwInterfaces(fw) {
  return linksOf(fw.id).map((l) => ({
    link: l,
    neighborId: l.fromId === fw.id ? l.toId : l.fromId,
  }));
}
function uidZone(fw) {
  let i = 0,
    id;
  do {
    id = fw.id + "_z" + i;
    i++;
  } while ((fw.zones || []).some((z) => z.id === id));
  return id;
}
function ensureZoneByRole(fw, role) {
  let z = fw.zones.find((z) => z.role === role);
  if (!z) {
    z = { id: uidZone(fw), name: roleName(role), role: role };
    fw.zones.push(z);
  }
  return z;
}

function ensureFirewallZones(fw) {
  if (!Array.isArray(fw.zones)) fw.zones = [];
  if (!fw.ifaceZones || typeof fw.ifaceZones !== "object") fw.ifaceZones = {};

  if (fw.zones.some((z) => z.linkId !== undefined)) {
    const map = {};
    fw.zones.forEach((z) => {
      if (z.linkId) map[z.linkId] = z.id;
    });
    fw.ifaceZones = Object.assign(map, fw.ifaceZones);
    fw.zones = fw.zones.map((z) => ({
      id: z.id,
      name: z.name,
      role: z.role || "dmz",
    }));
  }
  const ifaces = fwInterfaces(fw);
  const validLinks = new Set(ifaces.map((it) => it.link.id));

  Object.keys(fw.ifaceZones).forEach((lid) => {
    if (!validLinks.has(lid)) delete fw.ifaceZones[lid];
  });

  let insideUsed = ifaces.some((it) => {
    const z = fw.zones.find((z) => z.id === fw.ifaceZones[it.link.id]);
    return z && z.role === "inside";
  });
  ifaces.forEach((it) => {
    const cur = fw.ifaceZones[it.link.id];
    if (cur && fw.zones.some((z) => z.id === cur)) return;
    let role;
    if (isInternetSeg(it.neighborId) || ifaceLeadsOutside(fw.id, it.neighborId))
      role = "outside";
    else if (!insideUsed) {
      role = "inside";
      insideUsed = true;
    } else role = "inside";
    fw.ifaceZones[it.link.id] = ensureZoneByRole(fw, role).id;
  });
  return fw.zones;
}
function zoneForNeighbor(fw, neighborId) {
  ensureFirewallZones(fw);
  const it = fwInterfaces(fw).find((x) => x.neighborId === neighborId);
  if (!it) return null;
  return fw.zones.find((z) => z.id === fw.ifaceZones[it.link.id]) || null;
}

function interfacesInZone(fw, zoneId) {
  return fwInterfaces(fw)
    .filter((it) => fw.ifaceZones[it.link.id] === zoneId)
    .map((it) => {
      const n = getNode(it.neighborId);
      return n ? n.name || n.label : "?";
    });
}

function inheritedFwZone(fw, segId) {
  const nbZone = {};
  fwInterfaces(fw).forEach((it) => {
    const z = (fw.zones || []).find((z) => z.id === fw.ifaceZones[it.link.id]);
    if (z) nbZone[it.neighborId] = z;
  });
  const seen = new Set([segId, fw.id]),
    q = [segId];
  while (q.length) {
    const c = q.shift();
    for (const nb of rNeighbors(c)) {
      if (nb === fw.id || seen.has(nb)) continue;
      if (nbZone[nb]) return { zone: nbZone[nb], via: getNode(nb) };
      seen.add(nb);
      if (isDevice(nb) || isSegment(nb)) q.push(nb);
    }
  }
  return null;
}

function sameSubnet(a, b) {
  const na = getNode(a),
    nb = getNode(b);
  return !!(
    na &&
    nb &&
    isSegment(a) &&
    isSegment(b) &&
    na.subnet &&
    na.subnet === nb.subnet
  );
}

function srcSitsIn(srcId, dstId) {
  if (!isDevice(srcId) || !isSegment(dstId)) return false;
  const segs = neighborsOf(srcId).filter(isSegment);
  return segs.length === 1 && segs[0] === dstId;
}
function isDown(id) {
  const n = getNode(id);
  return !!(n && n.down);
}

function hostSwitchesOf(segId) {
  const sw = new Set();
  (DB.hosts || []).forEach((h) => {
    if (h.segId === segId)
      neighborsOf(h.id).forEach((n) => {
        if (isDevice(n)) sw.add(n);
      });
  });
  return sw;
}
function rNeighbors(id) {
  const base = new Set(neighborsOf(id));
  if (isSegment(id)) {
    hostSwitchesOf(id).forEach((s) => base.add(s));
  } else if (isDevice(id)) {
    (DB.hosts || []).forEach((h) => {
      if (h.segId && neighborsOf(h.id).indexOf(id) >= 0) base.add(h.segId);
    });
  }
  return [...base];
}
function plainReachable(a, b) {
  const seen = new Set([a]),
    q = [a];
  while (q.length) {
    const c = q.shift();
    if (c === b) return true;
    for (const nb of rNeighbors(c)) {
      if (isDevice(nb) && isInactive(nb)) continue;
      if (!linkUp(c, nb)) continue;
      if (!seen.has(nb)) {
        seen.add(nb);
        q.push(nb);
      }
    }
  }
  return false;
}

function offAccessDevice(hostId) {
  const seen = new Set([hostId]),
    q = [hostId];
  while (q.length) {
    const c = q.shift();
    for (const nb of rNeighbors(c)) {
      if (!linkUp(c, nb)) continue;
      if (isDevice(nb) && isInactive(nb)) {
        if (typeof isDown === "function" && isDown(nb)) {
          const n = getNode(nb);
          return (n && (n.label || n.name)) || nb;
        }
        continue;
      }
      if (!seen.has(nb)) {
        seen.add(nb);
        q.push(nb);
      }
    }
  }
  return null;
}

function gatewaysOf(segId) {
  const set = new Set();
  if (!getNode(segId)) return set;

  const vfw = segVpnFirewall(segId);
  if (vfw) {
    const s = new Set([vfw.id]);
    if (vfw.haPeer && !isDown(vfw.haPeer)) s.add(vfw.haPeer);
    return s;
  }
  const seen = new Set([segId]);
  let frontier = rNeighbors(segId);
  while (frontier.length) {
    const next = [];
    frontier.forEach((id) => {
      if (seen.has(id)) return;
      seen.add(id);
      if (isDevice(id) && isInactive(id)) return;
      const n = getNode(id);
      if (!n) return;
      if (isDevice(id) && L3TYPES.includes(n.type)) {
        set.add(id);
        return;
      }
      if (
        isDevice(id) &&
        (n.type === "l2switch" ||
          n.type === "l2mgmt" ||
          n.type === "idsips" ||
          n.type === "ap" ||
          n.type === "hub" ||
          n.type === "datadiode" ||
          n.type === "waf")
      ) {
        rNeighbors(id).forEach((m) => {
          if (!seen.has(m)) next.push(m);
        });
      }
    });
    if (set.size) break;
    frontier = next;
  }
  let cand = [...set];

  const routers = cand.filter((id) => {
    const t = getNode(id).type;
    return t === "l3switch" || t === "router";
  });
  if (routers.length) cand = routers;

  const haPaired = cand.filter((id) => {
    const d = getNode(id);
    return d && d.haPeer;
  });
  if (haPaired.length) cand = haPaired;
  const out = new Set(cand);
  [...out].forEach((id) => {
    const d = getNode(id);
    if (d && d.haPeer && !isDown(d.haPeer)) out.add(d.haPeer);
  });
  return out;
}

const OSPF_COST_REF = 10000;
const OSPF_AUTO_COST = 10;
const SPEED_OPTS = [10, 100, 1000, 2500, 5000, 10000];

/* ===== Wi-Fi radio model =====
   Wireless capacity is derived, never hand-set like a cable. Three inputs decide
   it: the band and channel an SSID broadcasts on, the access point's transmit
   power, and the distance between the two devices on the canvas. The same model
   serves a client link and a mesh/repeater backhaul hop, so a 2.4 GHz link at the
   edge of the cell really is slower than a 5 GHz link beside the AP.
*/

const WL_PX_PER_M = 3; // canvas scale: the board stands for a site, not a room
const WL_REF_RSSI = -35; // dBm a full-power radio receives at 1 m
const WL_PATHLOSS = 2.6; // log-distance exponent, typical office with walls
const WL_NOISE = -95; // dBm noise floor, the input to SNR
const WL_SENS = -82; // dBm client sensitivity: below this a link stops working
const WL_FLOOR = -100; // dBm absolute floor
const WL_TX_DEFAULT = 20; // dBm
const WL_TX_MIN = 5;
const WL_TX_MAX = 30;
// A client stays on its current access point until another one is clearly closer.
// Without this, nudging a host by a pixel flips it between two nearby APs and the
// topology appears to flicker for no reason a user can see.
const WL_ROAM_STICKY = 1.15;

const WL_BAND_LIST = ["2.4", "5", "6"];
const WL_BANDS = {
  "2.4": { label: "2.4 GHz", maxMbits: 574, defCh: 6 },
  "5": { label: "5 GHz", maxMbits: 1200, defCh: 36 },
  "6": { label: "6 GHz", maxMbits: 2400, defCh: 37 },
};
// 2.4 GHz: 13 narrow channels, and only 1/6/11 avoid overlapping. 5 GHz: 20 MHz
// channels 4 apart. 6 GHz starts over at 1 and runs to 233.
const WL_CHANNELS = {
  "2.4": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
  "5": [36, 40, 44, 48, 52, 56, 60, 64, 100, 104, 108, 112, 116, 120, 124, 128, 132, 136, 140, 144],
  "6": (function () {
    const a = [];
    for (let c = 1; c <= 233; c += 4) a.push(c);
    return a;
  })(),
};
// Signal-to-noise ratio to spectral efficiency, capped at 1.0 so the best case is
// the band's rated PHY rate. Follows the shape of a real MCS table: the last few
// dB buy far less than the first few.
const WL_SNR_EFF = [
  [0, 0.1],
  [5, 0.2],
  [10, 0.32],
  [15, 0.45],
  [20, 0.56],
  [25, 0.66],
  [30, 0.76],
  [35, 0.85],
  [40, 0.92],
  [50, 1.0],
];

function wlBandOf(ss) {
  return ss && WL_BAND_LIST.indexOf(ss.band) >= 0 ? ss.band : "5";
}
function wlChOf(ss) {
  const b = wlBandOf(ss);
  const c = ss && +ss.ch;
  return WL_CHANNELS[b].indexOf(c) >= 0 ? c : WL_BANDS[b].defCh;
}
function wlBandLabel(band) {
  return (WL_BANDS[wlBandOf({ band: band })] || WL_BANDS["5"]).label;
}
function wlTxOf(dev) {
  const v = dev && +dev.wlTx;
  return isFinite(v) && v >= WL_TX_MIN && v <= WL_TX_MAX ? v : WL_TX_DEFAULT;
}
function wlDistM(a, b) {
  if (!a || !b) return Infinity;
  return Math.hypot((a.x || 0) - (b.x || 0), (a.y || 0) - (b.y || 0)) / WL_PX_PER_M;
}
// Free-space-ish log distance path loss, floored so the number stays sane at 0 m.
function wlRssiDbm(tx, distM) {
  const d = Math.max(0.5, distM);
  return Math.max(WL_FLOOR, tx + WL_REF_RSSI - 10 * WL_PATHLOSS * Math.log10(d));
}
function wlRangeM(tx, sens) {
  return Math.pow(10, (tx + WL_REF_RSSI - sens) / (10 * WL_PATHLOSS));
}
function wlEff(snr) {
  if (snr <= WL_SNR_EFF[0][0]) return WL_SNR_EFF[0][1];
  for (let i = 1; i < WL_SNR_EFF.length; i++) {
    if (snr < WL_SNR_EFF[i][0]) {
      const a = WL_SNR_EFF[i - 1],
        b = WL_SNR_EFF[i];
      return a[1] + ((snr - a[0]) / (b[0] - a[0])) * (b[1] - a[1]);
    }
  }
  return WL_SNR_EFF[WL_SNR_EFF.length - 1][1];
}
// Round to a number a radio would actually advertise, so labels read cleanly.
function wlRoundMbits(mb) {
  if (!(mb > 0)) return 0;
  const step = mb >= 1000 ? 100 : mb >= 100 ? 25 : 5;
  return Math.max(step, Math.round(mb / step) * step);
}
function wlSsidOf(dev, name) {
  if (!dev) return null;
  const want = (name || "").trim();
  if (!want) return null;
  return (
    apEffSsids(dev).find((s) => (s.name || "").trim() === want) || null
  );
}
// Co-/adjacent-channel reuse is the classic 2.4 GHz planning trap. Each nearby
// broadcaster on a colliding channel burns airtime, so every one of them slows
// this link down a little.
function wlChFactor(dev, ss) {
  if (!DB || !Array.isArray(DB.devices)) return 1;
  const band = wlBandOf(ss),
    ch = wlChOf(ss),
    reach = wlRangeM(wlTxOf(dev), WL_SENS) * 1.5;
  let hits = 0;
  DB.devices.forEach((o) => {
    if (!o || o.id === dev.id || !apWifiCapable(o)) return;
    (o.ssids || []).forEach((os) => {
      if (os.on === false || wlBandOf(os) !== band) return;
      if (Math.abs(wlChOf(os) - ch) > 2) return;
      if (wlDistM(dev, o) > reach) return;
      hits++;
    });
  });
  return Math.max(0.25, 1 - 0.25 * Math.min(hits, 3));
}
// The full radio reading between an access point and one peer on one SSID.
function wlCell(dev, peerId, ssidName) {
  const peer = getNode(peerId);
  const out = {
    ok: false,
    distM: Infinity,
    rssi: WL_FLOOR,
    snr: 0,
    eff: 0,
    mbits: 0,
    band: "5",
    ch: WL_BANDS["5"].defCh,
    tx: WL_TX_DEFAULT,
    outOfRange: true,
  };
  if (!dev || !peer || !apWifiCapable(dev)) return out;
  const ss = wlSsidOf(dev, ssidName);
  if (!ss || ss.on === false) return out;
  out.band = wlBandOf(ss);
  out.ch = wlChOf(ss);
  out.tx = wlTxOf(dev);
  out.distM = wlDistM(dev, peer);
  out.rssi = wlRssiDbm(out.tx, out.distM);
  out.snr = out.rssi - WL_NOISE;
  out.outOfRange = out.rssi < WL_SENS;
  out.eff = wlEff(out.snr);
  out.mbits = out.outOfRange
    ? 0
    : wlRoundMbits(
        WL_BANDS[out.band].maxMbits * out.eff * wlChFactor(dev, ss),
      );
  out.ok = !out.outOfRange;
  return out;
}
function isWirelessClientLink(l) {
  if (!l) return false;
  const f = getNode(l.fromId),
    g = getNode(l.toId);
  const isClient = (n, ap) =>
    !!n && n.type === "host" && !!n.wifi && n.wifi.apId === ap.id;
  return isClient(f, g) || isClient(g, f);
}
function wlClientMbits(l) {
  const f = getNode(l.fromId),
    g = getNode(l.toId);
  let host = null,
    ap = null;
  if (f && f.type === "host" && f.wifi && f.wifi.apId === g.id) {
    host = f;
    ap = g;
  } else if (g && g.type === "host" && g.wifi && g.wifi.apId === f.id) {
    host = g;
    ap = f;
  }
  if (!host || !ap) return 0;
  return wlCell(ap, host.id, host.wifi.ssid).mbits;
}
// The backhaul rides whichever radio the child advertises the shared SSID on.
function wlBackhaulMbits(l) {
  const a = getNode(l.fromId),
    b = getNode(l.toId);
  if (!a || !b) return 0;
  let best = 0;
  apLiveSsidNames(a).forEach((nm) => {
    best = Math.max(best, wlCell(a, b.id, nm).mbits);
  });
  // A repeater has a single radio: it must receive and re-send on the same
  // channel, so it never gets the full airtime.
  return l.wl === "rep" ? Math.round(best / 2) : best;
}
// Single source of truth for "how fast is this link", wired and wireless alike.
function linkMbits(l) {
  if (!l) return 0;
  if (l.wl) return wlBackhaulMbits(l);
  if (isWirelessClientLink(l)) return wlClientMbits(l);
  return l.speed || 0;
}
// The radio reading behind a wireless link, for UI that wants more than a number.
function wlClientCell(l) {
  const f = getNode(l && l.fromId),
    g = getNode(l && l.toId);
  let host = null,
    ap = null;
  if (f && f.type === "host" && f.wifi && f.wifi.apId === g.id) {
    host = f;
    ap = g;
  } else if (g && g.type === "host" && g.wifi && g.wifi.apId === f.id) {
    host = g;
    ap = f;
  }
  if (!host || !ap) return null;
  return wlCell(ap, host.id, host.wifi.ssid);
}
function wlBackhaulCell(l) {
  const a = getNode(l && l.fromId),
    b = getNode(l && l.toId);
  if (!a || !b) return null;
  let best = null;
  apLiveSsidNames(a).forEach((nm) => {
    const c = wlCell(a, b.id, nm);
    if (!best || c.mbits > best.mbits) best = c;
  });
  if (best && l.wl === "rep") {
    // Report the halved figure so the UI agrees with what the router will use.
    best = Object.assign({}, best, { mbits: Math.round(best.mbits / 2) });
  }
  return best;
}

function speedCost(mbps) {
  if (!mbps || mbps <= 0) return null;
  return Math.max(1, Math.round(OSPF_COST_REF / mbps));
}
function speedLabel(mbps) {
  if (!mbps || mbps <= 0) return "—";
  return mbps >= 1000 ? mbps / 1000 + "G" : mbps + "M";
}

function baseLinkCost(l) {
  if (!l) return OSPF_AUTO_COST;
  // An explicit cost still wins: it is the user's override for everything below.
  if (typeof l.cost === "number" && l.cost > 0) return l.cost;
  const sc = speedCost(linkMbits(l));
  return sc != null ? sc : OSPF_AUTO_COST;
}
function effectiveLinkCost(l) {
  return baseLinkCost(l) + wanCostExtra(l);
}
function linkCostBetween(a, b) {
  let c = Infinity;
  for (const l of DB.links) {
    if ((l.fromId === a && l.toId === b) || (l.fromId === b && l.toId === a)) {
      const lc = effectiveLinkCost(l);
      if (lc < c) c = lc;
    }
  }
  return isFinite(c) ? c : OSPF_AUTO_COST;
}

function ospfActive() {
  return (DB.links || []).some(
    (l) =>
      (typeof l.cost === "number" && l.cost > 0) ||
      l.speed > 0 ||
      l.wl ||
      wanCostExtra(l) !== 0,
  );
}

const ADMIN_DIST = {
  connected: 0,
  static: 1,
  ebgp: 20,
  eigrp: 90,
  ospf: 110,
  isis: 115,
  rip: 120,
};

function deviceProto(d) {
  if (!d) return "ospf";
  if (d.routingProto) return d.routingProto;
  return d.manualRouting ? "static" : "ospf";
}

function dynamicCostActive(srcId) {
  let rip = false,
    cost = false;
  gatewaysOf(srcId).forEach((id) => {
    const p = deviceProto(getNode(id));
    if (p === "rip") rip = true;
    else if (p === "ospf" || p === "eigrp") cost = true;
  });
  if (cost) return true;
  if (rip) return false;
  return ospfActive();
}
function l3OnPath(path) {
  return (path || []).filter((id) => {
    const n = getNode(id);
    return n && (n.type === "router" || n.type === "l3switch");
  });
}

function ripLimited(path) {
  const l3 = l3OnPath(path);
  return l3.length > 15 && deviceProto(getNode(l3[0])) === "rip";
}
function ripPartialPath(path) {
  let c = 0,
    cut = path.length;
  for (let i = 0; i < path.length; i++) {
    const n = getNode(path[i]);
    if (n && (n.type === "router" || n.type === "l3switch")) {
      c++;
      if (c > 15) {
        cut = i;
        break;
      }
    }
  }
  return path.slice(0, cut);
}

function routeSourceOf(d, dstSeg, isWan) {
  if (isWan) return { proto: "eBGP", ad: ADMIN_DIST.ebgp };
  const dseg = getNode(dstSeg);
  if (dseg && (neighborsOf(d.id).indexOf(dstSeg) >= 0 || dseg.gwId === d.id))
    return { proto: t("rpProtoConnected"), ad: 0 };
  const p = deviceProto(d);
  if (p === "static") return { proto: t("rpProtoStatic"), ad: 1 };
  const m = {
    rip: ADMIN_DIST.rip,
    ospf: ADMIN_DIST.ospf,
    eigrp: ADMIN_DIST.eigrp,
  };
  return { proto: p.toUpperCase(), ad: m[p] != null ? m[p] : ADMIN_DIST.ospf };
}

function findFullPathCost(srcId, dstId) {
  const needL3 = !sameSubnet(srcId, dstId) && !srcSitsIn(srcId, dstId);
  const srcSeg = getNode(srcId);
  const gw = gatewaysOf(srcId);
  const enforceGw =
    needL3 &&
    gw.size > 0 &&
    !(srcSeg && (srcSeg.isInternet || srcSeg.subnet === "0.0.0.0/0"));
  const srcVlanSeg = vlanSegOf(srcId),
    dstVlanSeg = vlanSegOf(dstId);
  const startL3 = isDevice(srcId) && L3TYPES.includes(getNode(srcId).type);

  const dstDevSegs = isDevice(dstId)
    ? new Set(neighborsOf(dstId).filter(isSegment))
    : null;
  const startKey = srcId + "|" + (startL3 ? "1" : "0");
  const dist = {};
  dist[startKey] = 0;
  const prev = {};
  prev[startKey] = null;
  const done = new Set();
  const pq = [[0, srcId, startL3]];
  while (pq.length) {
    let mi = 0;
    for (let i = 1; i < pq.length; i++) if (pq[i][0] < pq[mi][0]) mi = i;
    const cur = pq.splice(mi, 1)[0];
    const cdist = cur[0],
      node = cur[1],
      l3 = cur[2];
    const ckey = node + "|" + (l3 ? "1" : "0");
    if (done.has(ckey)) continue;
    done.add(ckey);
    if (node === dstId) {
      if (l3 || !needL3) {
        const seq = [];
        let k = ckey;
        while (k !== null) {
          seq.unshift(k.split("|")[0]);
          k = prev[k];
        }
        return seq;
      }
      continue;
    }
    for (const nb of rNeighbors(node)) {
      if (isSegment(nb) && nb !== dstId && !(dstDevSegs && dstDevSegs.has(nb)))
        continue;
      if (
        dstDevSegs &&
        isSegment(node) &&
        node !== srcId &&
        dstDevSegs.has(node) &&
        nb !== dstId
      )
        continue;
      if (isDevice(nb) && (isInactive(nb) || aaSkip.has(nb))) continue;
      if (!linkUp(node, nb)) continue;
      let vchk = l3 ? dstVlanSeg : srcVlanSeg;
      if (dstDevSegs) {
        if (isSegment(nb) && dstDevSegs.has(nb)) vchk = nb;
        else if (isSegment(node) && dstDevSegs.has(node)) vchk = node;
      }
      if (!stpLinkOpen(node, nb, vchk)) continue;
      if (!edgeCarriesVlan(node, nb, vchk)) continue;
      const isL3dev = isDevice(nb) && L3TYPES.includes(getNode(nb).type);
      if (enforceGw && isL3dev && !l3 && !gw.has(nb)) continue;
      const nl3 = l3 || isL3dev;
      const key = nb + "|" + (nl3 ? "1" : "0");
      if (done.has(key)) continue;

      const nd =
        cdist + (isL3dev || nb === dstId ? linkCostBetween(node, nb) : 0);
      if (dist[key] === undefined || nd < dist[key]) {
        dist[key] = nd;
        prev[key] = ckey;
        pq.push([nd, nb, nl3]);
      }
    }
  }
  return null;
}
function findFullPath(srcId, dstId) {
  if (dynamicCostActive(srcId)) return findFullPathCost(srcId, dstId);
  const needL3 = !sameSubnet(srcId, dstId) && !srcSitsIn(srcId, dstId);
  const srcSeg = getNode(srcId);
  const gw = gatewaysOf(srcId);
  const enforceGw =
    needL3 &&
    gw.size > 0 &&
    !(srcSeg && (srcSeg.isInternet || srcSeg.subnet === "0.0.0.0/0"));
  const srcVlanSeg = vlanSegOf(srcId),
    dstVlanSeg = vlanSegOf(dstId);
  const startL3 = isDevice(srcId) && L3TYPES.includes(getNode(srcId).type);

  const dstDevSegs = isDevice(dstId)
    ? new Set(neighborsOf(dstId).filter(isSegment))
    : null;
  const startKey = srcId + "|" + (startL3 ? "1" : "0");
  const prev = {};
  prev[startKey] = null;
  const seen = new Set([startKey]);
  const q = [[srcId, startL3]];
  while (q.length) {
    const cur = q.shift();
    const node = cur[0],
      l3 = cur[1];
    if (node === dstId) {
      if (l3 || !needL3) {
        const seq = [];
        let k = node + "|" + (l3 ? "1" : "0");
        while (k !== null) {
          seq.unshift(k.split("|")[0]);
          k = prev[k];
        }
        return seq;
      }
      continue;
    }
    for (const nb of rNeighbors(node)) {
      if (isSegment(nb) && nb !== dstId && !(dstDevSegs && dstDevSegs.has(nb)))
        continue;
      if (
        dstDevSegs &&
        isSegment(node) &&
        node !== srcId &&
        dstDevSegs.has(node) &&
        nb !== dstId
      )
        continue;
      if (isDevice(nb) && (isInactive(nb) || aaSkip.has(nb))) continue;
      if (!linkUp(node, nb)) continue;
      let vchk = l3 ? dstVlanSeg : srcVlanSeg;
      if (dstDevSegs) {
        if (isSegment(nb) && dstDevSegs.has(nb)) vchk = nb;
        else if (isSegment(node) && dstDevSegs.has(node)) vchk = node;
      }
      if (!stpLinkOpen(node, nb, vchk)) continue;
      if (!edgeCarriesVlan(node, nb, vchk)) continue;
      const isL3dev = isDevice(nb) && L3TYPES.includes(getNode(nb).type);
      if (enforceGw && isL3dev && !l3 && !gw.has(nb)) continue;
      const nl3 = l3 || isL3dev;
      const key = nb + "|" + (nl3 ? "1" : "0");
      if (!seen.has(key)) {
        seen.add(key);
        prev[key] = node + "|" + (l3 ? "1" : "0");
        q.push([nb, nl3]);
      }
    }
  }
  return null;
}

function partialPath(srcId, dstId) {
  const srcSeg = getNode(srcId);
  const gw = gatewaysOf(srcId);
  const enforceGw =
    gw.size > 0 &&
    !(srcSeg && (srcSeg.isInternet || srcSeg.subnet === "0.0.0.0/0"));
  const srcVlanSeg = vlanSegOf(srcId),
    dstVlanSeg = dstId != null ? vlanSegOf(dstId) : null;
  const startKey = srcId + "|0";
  const prev = {};
  prev[startKey] = null;
  const depth = {};
  depth[startKey] = 0;
  const seen = new Set([startKey]);
  const q = [[srcId, false]];
  let bestKey = null,
    bestDepth = -1;
  while (q.length) {
    const cur = q.shift();
    const node = cur[0],
      l3 = cur[1];
    const ckey = node + "|" + (l3 ? "1" : "0");
    if (isDevice(node) && depth[ckey] > bestDepth) {
      bestDepth = depth[ckey];
      bestKey = ckey;
    }
    for (const nb of rNeighbors(node)) {
      if (isSegment(nb)) continue;
      if (isDevice(nb) && (isInactive(nb) || aaSkip.has(nb))) continue;
      if (!linkUp(node, nb)) continue;
      if (!stpLinkOpen(node, nb, l3 ? dstVlanSeg : srcVlanSeg)) continue;
      if (!edgeCarriesVlan(node, nb, l3 ? dstVlanSeg : srcVlanSeg)) continue;
      const isL3dev = isDevice(nb) && L3TYPES.includes(getNode(nb).type);
      if (enforceGw && isL3dev && !l3 && !gw.has(nb)) continue;
      const nl3 = l3 || isL3dev;
      const key = nb + "|" + (nl3 ? "1" : "0");
      if (!seen.has(key)) {
        seen.add(key);
        prev[key] = ckey;
        depth[key] = depth[ckey] + 1;
        q.push([nb, nl3]);
      }
    }
  }
  if (bestKey == null) return null;
  const seq = [];
  let k = bestKey;
  while (k !== null) {
    seq.unshift(k.split("|")[0]);
    k = prev[k];
  }
  return seq;
}

function firstBadRange(rules) {
  if (!Array.isArray(rules)) return 0;
  for (let i = 0; i < rules.length; i++) {
    const r = rules[i];
    if (
      r &&
      r.portOp === "range" &&
      r.port != null &&
      r.port2 != null &&
      +r.port > +r.port2
    )
      return i + 1;
  }
  return 0;
}

function firstMissingPort(rules) {
  if (!Array.isArray(rules)) return 0;
  const empty = (v) => v == null || String(v).trim() === "";
  for (let i = 0; i < rules.length; i++) {
    const r = rules[i];
    if (!r || r.proto === "icmp") continue;
    if (r.portOp === "eq" && empty(r.port)) return i + 1;
    if (r.portOp === "range" && (empty(r.port) || empty(r.port2))) return i + 1;
  }
  return 0;
}

function portSpecMatches(op, p1, p2, proto, tport) {
  const num = (v) => (v == null || v === "" ? null : +v);
  p1 = num(p1);
  p2 = num(p2);
  tport = num(tport);
  if (!op || op === "any") return true;
  if (proto === "icmp") return true;
  if (op === "eq" && p1 == null) return true;
  if (op === "range" && (p1 == null || p2 == null || p1 > p2)) return true;
  if (tport == null) return false;
  if (op === "eq") return tport === p1;
  if (op === "range") return tport >= p1 && tport <= p2;
  return true;
}
function ruleMatches(r, sz, dz, traffic, srcId, dstId) {
  const zoneOk = (rz, actual) => rz === "*" || (actual && rz === actual.id);
  if (!zoneOk(r.srcZone, sz)) return false;
  if (!zoneOk(r.dstZone, dz)) return false;
  if (r.srcSeg && r.srcSeg !== "*" && r.srcSeg !== srcId) return false;
  if (r.dstSeg && r.dstSeg !== "*" && r.dstSeg !== dstId) return false;
  const rp = r.proto || "ip";
  if (rp !== "ip" && rp !== traffic.proto) return false;
  if (!portSpecMatches(r.portOp, r.port, r.port2, rp, traffic.port))
    return false;
  return true;
}

const PORTSPAN_NARROW = 1024;
