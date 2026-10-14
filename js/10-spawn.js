"use strict";

const SPAWN_GAP = 90;
const NOTE_OFF = { x: 52, y: 18 };
const SPAWN_RINGS = 14;
const SPAWN_MARGIN = 70;

function spawnBounds() {
  let v;
  try {
    v = getVB();
  } catch (e) {
    return null;
  }
  if (!v || !(v.w > 0) || !(v.h > 0)) return null;

  const m = Math.min(SPAWN_MARGIN, v.w / 2.2, v.h / 2.2);
  return { x0: v.x + m, y0: v.y + m, x1: v.x + v.w - m, y1: v.y + v.h - m };
}

function ensureVisible(x, y) {
  let v;
  try {
    v = getVB();
  } catch (e) {
    return;
  }
  if (!v || !(v.w > 0) || !(v.h > 0)) return;
  const m = Math.min(SPAWN_MARGIN, v.w / 2, v.h / 2);
  let nx = v.x,
    ny = v.y;
  if (x < v.x + m) nx = x - m;
  else if (x > v.x + v.w - m) nx = x - v.w + m;
  if (y < v.y + m) ny = y - m;
  else if (y > v.y + v.h - m) ny = y - v.h + m;
  if (nx !== v.x || ny !== v.y) setVB(nx, ny, v.w, v.h);
}
function freeSpot(cx, cy, bounds, strict) {
  const pts = [
    ...(DB.devices || []),
    ...(DB.segments || []),
    ...(DB.hosts || []),
  ]
    .filter((n) => isFinite(n.x) && isFinite(n.y))
    .concat(
      (DB.notes || [])
        .filter((n) => isFinite(n.x) && isFinite(n.y))
        .map((n) => ({ x: n.x + NOTE_OFF.x, y: n.y + NOTE_OFF.y })),
    );
  const free = (x, y) =>
    pts.every(
      (n) => Math.abs(n.x - x) >= SPAWN_GAP || Math.abs(n.y - y) >= SPAWN_GAP,
    );
  const inside = (x, y) =>
    !bounds ||
    (x >= bounds.x0 && x <= bounds.x1 && y >= bounds.y0 && y <= bounds.y1);
  if (inside(cx, cy) && free(cx, cy))
    return { x: Math.round(cx), y: Math.round(cy) };
  for (let r = 1; r <= SPAWN_RINGS; r++) {
    const ring = [];
    for (let dy = -r; dy <= r; dy++)
      for (let dx = -r; dx <= r; dx++) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
        ring.push({ dx, dy });
      }
    ring.sort(
      (a, b) =>
        a.dx * a.dx + a.dy * a.dy - (b.dx * b.dx + b.dy * b.dy) ||
        a.dy - b.dy ||
        a.dx - b.dx,
    );
    for (const c of ring) {
      const x = cx + c.dx * SPAWN_GAP,
        y = cy + c.dy * SPAWN_GAP;
      if (inside(x, y) && free(x, y))
        return { x: Math.round(x), y: Math.round(y) };
    }
  }
  if (bounds) return strict ? null : freeSpot(cx, cy, null);
  return { x: Math.round(cx), y: Math.round(cy) };
}

function spawnSpot() {
  const c = viewBoxCenter();
  let v = null;
  try {
    v = getVB();
  } catch (e) {}
  if (!v || !(v.w > 0) || !(v.h > 0)) return freeSpot(c.x, c.y, null);
  if (v.w <= SPAWN_MARGIN * 2 || v.h <= SPAWN_MARGIN * 2)
    return { x: Math.round(c.x), y: Math.round(c.y) };
  for (;;) {
    const s = freeSpot(c.x, c.y, spawnBounds(), true);
    if (s) return s;
    const vv = getVB();
    if (!(vv.w < ZOOM_MAX)) break;
    const k = Math.min(1.35, ZOOM_MAX / vv.w);
    const nw = vv.w * k,
      nh = vv.h * k;
    setVB(vv.x - (nw - vv.w) / 2, vv.y - (nh - vv.h) / 2, nw, nh);
  }
  return freeSpot(c.x, c.y, null);
}
document.querySelectorAll(".pal-item").forEach((it) => {
  it.addEventListener("dragstart", (e) => {
    palDragType = it.getAttribute("data-type");
    e.dataTransfer.effectAllowed = "copy";
  });
  it.addEventListener("click", () => {
    const c = spawnSpot();
    spawn(it.getAttribute("data-type"), c.x, c.y);
    ensureVisible(c.x, c.y);
  });
});
$("stage").addEventListener("dragover", (e) => {
  e.preventDefault();
  e.dataTransfer.dropEffect = "copy";
});
$("stage").addEventListener("drop", (e) => {
  e.preventDefault();
  if (!palDragType) return;
  const p = toSvgPoint(e.clientX, e.clientY);
  spawn(palDragType, Math.round(p.x), Math.round(p.y));
  palDragType = null;
});

function spawn(type, x, y) {
  if (type === "internet") {
    const nInet = DB.segments.filter((s) => s.isInternet).length;
    const s = {
      id: uid("s"),
      name: "Internet" + (nInet ? " " + (nInet + 1) : ""),
      subnet: "0.0.0.0/0",
      vlan: "",
      color: "#fbbf24",
      icon: "cloud",
      isInternet: true,
      x,
      y,
    };
    DB.segments.push(s);
    saveDB();
    render();
    refreshAll();
    select(s.id);
    setStatus(t("stInternetAdded"));
    return;
  }
  if (type === "host") {
    const firstNet = DB.segments.find((s) => !s.isInternet);
    const h = {
      id: uid("h"),
      type: "host",
      label: nextLabel("host"),
      kind: "pc",
      services: [],
      segId: firstNet ? firstNet.id : null,
      x,
      y,
    };
    DB.hosts.push(h);
    saveDB();
    render();
    refreshAll();
    select(h.id);
    openKindPicker(h);
    return;
  }
  const d = { id: uid("d"), type, label: nextLabel(type), x, y };
  if (type === "firewall") {
    d.zones = [];
    d.ifaceZones = {};
    d.firewallRules = [];
    d.zoneMode = true;
    d.defaultAction = "deny";
    d.simpleRules = [];
    d.ssids = [];
  }
  if (type === "l3switch" || type === "router" || type === "l2mgmt") {
    d.acl = [];
    d.aclDefault = "deny";
  }
  if (type === "router") {
    d.ssids = [];
  }
  if (type === "idsips") {
    d.mode = "ips";
    d.signatures = [];
  }
  if (type === "loadbalancer") {
    d.vipPorts = "";
  }
  if (type === "vpn") {
  }
  if (type === "ap") {
    d.ssids = [];
  }
  DB.devices.push(d);
  saveDB();
  render();
  refreshAll();
  select(d.id);
  setStatus(t("stAdded") + ": " + d.label);
}

const modalBg = $("modalBg"),
  modalBox = $("modalBox");
