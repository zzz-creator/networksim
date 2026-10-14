"use strict";

function toSvgPoint(clientX, clientY) {
  const p = svg.createSVGPoint();
  p.x = clientX;
  p.y = clientY;
  const m = svg.getScreenCTM();
  if (!m) return { x: clientX, y: clientY };
  return p.matrixTransform(m.inverse());
}
function viewBoxCenter() {
  const vb = svg.viewBox.baseVal;
  return { x: vb.x + vb.width / 2, y: vb.y + vb.height / 2 };
}

function deviceIcon(type) {
  const g = el("g", {});
  if (type === "l2switch") {
    g.appendChild(
      el("path", {
        d: "M-22 -4h14M-8 -4l-5 -3M-8 -4l-5 3M22 4H8M8 4l5 -3M8 4l5 3",
        stroke: "var(--cyan)",
        "stroke-width": "1.6",
        fill: "none",
        "stroke-linecap": "round",
      }),
    );
  } else if (type === "l2mgmt") {
    g.appendChild(
      el("path", {
        d: "M-22 -2h14M-8 -2l-5 -3M-8 -2l-5 3M22 6H8M8 6l5 -3M8 6l5 3",
        stroke: "var(--blue)",
        "stroke-width": "1.6",
        fill: "none",
        "stroke-linecap": "round",
      }),
    );
    g.appendChild(
      el("path", { d: "M-5 -12h4v4h-4zM1 -12h4v4h-4z", fill: "var(--blue)" }),
    );
  } else if (type === "l3switch") {
    g.appendChild(
      el("path", { d: "M0 -9l7 7-7 7-7-7z", fill: "var(--violet)" }),
    );
  } else if (type === "router") {
    g.appendChild(
      el("circle", {
        cx: 0,
        cy: 0,
        r: 11,
        fill: "none",
        stroke: "var(--green)",
        "stroke-width": "1.6",
      }),
    );
    g.appendChild(
      el("path", {
        d: "M0 -8v16M-8 0h16M0 -8l-2 2M0 -8l2 2M0 8l-2 -2M0 8l2 -2M-8 0l2 -2M-8 0l2 2M8 0l-2 -2M8 0l-2 2",
        stroke: "var(--green)",
        "stroke-width": "1.4",
        fill: "none",
        "stroke-linecap": "round",
      }),
    );
  } else if (type === "firewall") {
    g.appendChild(
      el("path", {
        d: "M0 -13c2.5 5-1.3 6.3 1.3 10 1.9 2.7 5 1.3 5 6.3a8 8 0 11-16 0c0-4 2.6-4 2.6-8 0-2.7 4-4 7-8.6z",
        fill: "var(--red)",
        "fill-opacity": ".85",
      }),
    );
  } else if (type === "idsips") {
    g.appendChild(
      el("path", {
        d: "M0 -12l11 4v7c0 7-5 11-11 13-6-2-11-6-11-13v-7z",
        fill: "none",
        stroke: "var(--amber)",
        "stroke-width": "1.8",
      }),
    );
    g.appendChild(
      el("path", {
        d: "M-6 0l4 4 8-8",
        fill: "none",
        stroke: "var(--amber)",
        "stroke-width": "2",
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
      }),
    );
  } else if (type === "loadbalancer") {
    g.appendChild(
      el("circle", {
        cx: 0,
        cy: -9,
        r: 3.4,
        fill: "none",
        stroke: "var(--blue)",
        "stroke-width": "1.7",
      }),
    );
    g.appendChild(
      el("circle", {
        cx: -10,
        cy: 9,
        r: 3.4,
        fill: "none",
        stroke: "var(--blue)",
        "stroke-width": "1.7",
      }),
    );
    g.appendChild(
      el("circle", {
        cx: 10,
        cy: 9,
        r: 3.4,
        fill: "none",
        stroke: "var(--blue)",
        "stroke-width": "1.7",
      }),
    );
    g.appendChild(
      el("path", {
        d: "M0 -5v3M0 2l-10 4M0 2l10 4",
        stroke: "var(--blue)",
        "stroke-width": "1.5",
        fill: "none",
      }),
    );
  } else if (type === "vpn") {
    g.appendChild(
      el("rect", {
        x: -9,
        y: -2,
        width: 18,
        height: 13,
        rx: 2.5,
        fill: "none",
        stroke: "var(--lime)",
        "stroke-width": "1.7",
      }),
    );
    g.appendChild(
      el("path", {
        d: "M-5 -2v-4a5 5 0 0110 0v4",
        fill: "none",
        stroke: "var(--lime)",
        "stroke-width": "1.7",
      }),
    );
    g.appendChild(el("circle", { cx: 0, cy: 4, r: 1.8, fill: "var(--lime)" }));
  } else if (type === "ap") {
    g.appendChild(
      el("path", {
        d: "M0 11V0",
        stroke: "var(--cyan)",
        "stroke-width": "1.8",
        "stroke-linecap": "round",
      }),
    );
    g.appendChild(
      el("path", {
        d: "M-7 11h14",
        stroke: "var(--cyan)",
        "stroke-width": "1.8",
        "stroke-linecap": "round",
      }),
    );
    g.appendChild(el("circle", { cx: 0, cy: -2, r: 2.4, fill: "var(--cyan)" }));
    g.appendChild(
      el("path", {
        d: "M-6 -8a8 8 0 0112 0M-11 -12a13 13 0 0122 0",
        fill: "none",
        stroke: "var(--cyan)",
        "stroke-width": "1.5",
        "stroke-linecap": "round",
      }),
    );
  } else if (type === "hub") {
    g.appendChild(
      el("rect", {
        x: -13,
        y: -6,
        width: 26,
        height: 11,
        rx: 1.5,
        fill: "none",
        stroke: "var(--muted)",
        "stroke-width": "1.6",
      }),
    );
    g.appendChild(
      el("path", {
        d: "M-9 5v4M-3 5v4M3 5v4M9 5v4",
        stroke: "var(--muted)",
        "stroke-width": "1.5",
        "stroke-linecap": "round",
      }),
    );
  } else if (type === "datadiode") {
    g.appendChild(
      el("path", {
        d: "M-10 -9v18M-10 -9l16 9-16 9z",
        fill: "none",
        stroke: "var(--lime)",
        "stroke-width": "1.8",
        "stroke-linejoin": "round",
      }),
    );
    g.appendChild(
      el("path", {
        d: "M8 0h6M14 0l-3 -3M14 0l-3 3",
        stroke: "var(--lime)",
        "stroke-width": "1.6",
        fill: "none",
        "stroke-linecap": "round",
      }),
    );
  } else if (type === "waf") {
    g.appendChild(
      el("path", {
        d: "M0 -11l10 4v6c0 6-5 9-10 12-5-3-10-6-10-12v-6z",
        fill: "none",
        stroke: "var(--red)",
        "stroke-width": "1.7",
        "stroke-linejoin": "round",
      }),
    );
    g.appendChild(
      el("path", {
        d: "M-4 -2l-3 3 3 3M4 -2l3 3-3 3",
        stroke: "var(--red)",
        "stroke-width": "1.5",
        fill: "none",
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
      }),
    );
  } else if (type === "internet") {
    g.appendChild(
      el("path", {
        d: "M-9 5a5 5 0 010 -10 6.9 6.9 0 0113.3 -1.3A5.3 5.3 0 019 5z",
        stroke: "var(--blue)",
        "stroke-width": "1.6",
        fill: "none",
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
      }),
    );
  }
  return g;
}
const SEG_ICONS = [
  {
    id: "lan",
    get name() {
      return t("siLan");
    },
  },
  {
    id: "desktop",
    get name() {
      return t("siDesktop");
    },
  },
  {
    id: "laptop",
    get name() {
      return t("siLaptop");
    },
  },
  {
    id: "server",
    get name() {
      return t("siServer");
    },
  },
  {
    id: "nas",
    get name() {
      return t("siNas");
    },
  },
  {
    id: "db",
    get name() {
      return t("siDb");
    },
  },
  {
    id: "printer",
    get name() {
      return t("siPrinter");
    },
  },
  {
    id: "phone",
    get name() {
      return t("siPhone");
    },
  },
  {
    id: "users",
    get name() {
      return t("siUsers");
    },
  },
  {
    id: "camera",
    get name() {
      return t("siCamera");
    },
  },
  {
    id: "iot",
    get name() {
      return t("siIot");
    },
  },
  {
    id: "wifi",
    get name() {
      return t("siWifi");
    },
  },
  {
    id: "cloud",
    get name() {
      return t("siCloud");
    },
  },
  {
    id: "globe",
    get name() {
      return t("siGlobe");
    },
  },
  {
    id: "shield",
    get name() {
      return t("siShield");
    },
  },
];
function segIcon(iconId, color) {
  const g = el("g", {});
  const P = (d, sw) =>
    g.appendChild(
      el("path", {
        d: d,
        fill: "none",
        stroke: color,
        "stroke-width": sw || 1.5,
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
      }),
    );
  const R = (x, y, w, h, r) =>
    g.appendChild(
      el("rect", {
        x: x,
        y: y,
        width: w,
        height: h,
        rx: r || 1.5,
        fill: "none",
        stroke: color,
        "stroke-width": 1.5,
      }),
    );
  const C = (cx, cy, r, f) =>
    g.appendChild(
      el("circle", {
        cx: cx,
        cy: cy,
        r: r,
        fill: f ? color : "none",
        stroke: color,
        "stroke-width": 1.5,
      }),
    );
  switch (iconId) {
    case "wifi":
      P("M-9 4a9 6 0 0118 0", 1.8);
      P("M-5 6a5 3.5 0 0110 0", 1.6);
      C(0, 7.5, 1.6, true);
      break;
    case "desktop":
      R(-9, -7, 18, 12, 1.5);
      P("M-4 9h8M0 5v4", 1.6);
      break;
    case "server":
      R(-9, -8, 18, 7, 1.5);
      R(-9, 1, 18, 7, 1.5);
      C(-5, -4.5, 1.1, true);
      C(-5, 4.5, 1.1, true);
      break;
    case "db":
      g.appendChild(
        el("ellipse", {
          cx: 0,
          cy: -6,
          rx: 8,
          ry: 3,
          fill: "none",
          stroke: color,
          "stroke-width": 1.5,
        }),
      );
      P("M-8 -6v12c0 1.7 3.6 3 8 3s8-1.3 8-3v-12", 1.5);
      P("M-8 0c0 1.7 3.6 3 8 3s8-1.3 8-3", 1.2);
      break;
    case "users":
      C(-4, -3, 3);
      C(5, -2, 2.3);
      P("M-10 8c0-4 3-6 6-6s6 2 6 6", 1.5);
      P("M2 8c0-3 2-5 5-5s5 2 5 5", 1.3);
      break;
    case "globe":
      C(0, 0, 9);
      P(
        "M-9 0h18M0 -9c5 4 5 14 0 18M0 -9c-5 4-5 14 0 18M-7.5 -5c5 3 10 3 15 0M-7.5 5c5-3 10-3 15 0",
        1.1,
      );
      break;
    case "shield":
      P("M0 -9l8 3v5c0 5-4 8-8 10-4-2-8-5-8-10v-5z", 1.5);
      break;
    case "laptop":
      P("M-7 -7h14v9h-14z", 1.5);
      P("M-10 6h20l-1.5 3h-17z", 1.5);
      break;
    case "nas":
      R(-8, -9, 16, 18, 2);
      P("M-4 -5h8M-4 -1h8", 1.4);
      C(0, 5, 1.4, true);
      break;
    case "printer":
      P("M-6 -8h12v5h-12z", 1.4);
      R(-8, -3, 16, 8, 1.5);
      P("M-5 5h10v5h-10z", 1.4);
      C(5, 0, 1, true);
      break;
    case "phone":
      R(-5, -9, 10, 18, 2);
      P("M-2 -6h4", 1.4);
      C(0, 6, 1.2, true);
      break;
    case "camera":
      R(-9, -4, 13, 9, 1.5);
      P("M4 -1l5 -3v9l-5 -3z", 1.5);
      C(-3, 0.5, 2);
      break;
    case "iot":
      R(-6, -6, 12, 12, 2);
      P("M-9 -3h3M-9 3h3M6 -3h3M6 3h3M-3 -9v3M3 -9v3M-3 6v3M3 6v3", 1.3);
      C(0, 0, 2.4);
      break;
    case "mobile":
      R(-5, -9, 10, 18, 2.5);
      P("M-2.5 -6.5h5", 1.4);
      P("M-3 6h6", 1.4);
      break;
    case "tablet":
      R(-7, -9.5, 14, 19, 2);
      P("M-4 -7h8", 1.2);
      C(0, 6.5, 1, true);
      break;
    case "tv":
      R(-10, -7, 20, 12, 1.5);
      P("M-6 9 -3 5M6 9 3 5", 1.5);
      break;
    case "cloud":
      P("M-7 4a4 4 0 010 -8 5.5 5.5 0 0110.6 -1A4.2 4.2 0 017 4z", 1.5);
      break;
    case "plc":
      R(-8, -7, 16, 11, 1.5);
      P("M-8 -2h16", 1.2);
      C(-5, -4.5, 1.2, true);
      P("M-6 4v4M-3 4v4M0 4v4M3 4v4M6 4v4", 1.3);
      break;
    case "hmi":
      R(-9, -8, 18, 14, 1.5);
      P("M-4 3a4 4 0 018 0", 1.4);
      P("M0 3l2.5 -3", 1.3);
      C(0, 3, 0.9, true);
      break;
    case "historian":
      g.appendChild(
        el("ellipse", {
          cx: 0,
          cy: -6,
          rx: 7,
          ry: 2.6,
          fill: "none",
          stroke: color,
          "stroke-width": 1.5,
        }),
      );
      P("M-7 -6v11c0 1.5 3.1 2.6 7 2.6s7-1.1 7-2.6v-11", 1.5);
      C(0, 2, 2.6);
      P("M0 2v-1.7M0 2h1.5", 1.2);
      break;
    case "honeypot":
      P("M-6 -6h12l-1.5 11c-.2 1.4-4.5 1.4-9 0z", 1.5);
      P("M-7 -6h14", 1.6);
      C(0, 1, 1.1, true);
      P("M0 2.2c0 1.6 2 1.6 2 0c0-1-2-2.6-2-2.6s-2 1.6-2 2.6", 1.1);
      break;
    case "dns":
      R(-8, -6, 16, 12, 2);
      C(-4.5, -2.5, 1.1, true);
      P("M-1.5 -3h6M-1.5 0h6M-6 3h12", 1.3);
      break;
    case "lan":
    default:
      R(-3, -9, 6, 5, 1);
      R(-9, 4, 6, 5, 1);
      R(3, 4, 6, 5, 1);
      P("M0 -4v4M-6 4V1h12v3", 1.3);
      break;
  }
  return g;
}

let nodeEls = {};
let noteEls = {},
  selectedNoteId = null;
let showZones = true;
try {
  showZones = localStorage.getItem("netsim_zones") !== "0";
} catch (e) {}

let _curveMap = {};
function _computeCurves() {
  _curveMap = {};
  const THRESH = 0.13;
  const byNode = {};
  for (const l of DB.links) {
    const p = getNode(l.fromId),
      q = getNode(l.toId);
    if (!p || !q || typeof p.x !== "number" || typeof q.x !== "number")
      continue;
    if (l.fromId === l.toId) continue;
    (byNode[l.fromId] = byNode[l.fromId] || []).push({ l, me: p, other: q });
    (byNode[l.toId] = byNode[l.toId] || []).push({ l, me: q, other: p });
  }
  const cdiff = (a, b) => {
    let d = Math.abs(a - b);
    return d > Math.PI ? 2 * Math.PI - d : d;
  };
  for (const nid in byNode) {
    const arr = byNode[nid];
    if (arr.length < 2) continue;
    arr.forEach((e) => {
      e.ang = Math.atan2(e.other.y - e.me.y, e.other.x - e.me.x);
    });
    arr.sort((a, b) => a.ang - b.ang);

    let maxGap = -1,
      rot = 0;
    for (let k = 0; k < arr.length; k++) {
      const a0 = arr[(k - 1 + arr.length) % arr.length].ang;
      let g = arr[k].ang - a0;
      if (g < 0) g += 2 * Math.PI;
      if (g > maxGap) {
        maxGap = g;
        rot = k;
      }
    }
    const ord = arr.slice(rot).concat(arr.slice(0, rot));
    let i = 0;
    while (i < ord.length) {
      let j = i + 1;
      while (j < ord.length && cdiff(ord[j].ang, ord[j - 1].ang) < THRESH) j++;
      const n = j - i;
      if (n >= 2) {
        const step = Math.min(20, 44 / (n - 1));
        for (let k = 0; k < n; k++) {
          const fan = (k - (n - 1) / 2) * step,
            e = ord[i + k],
            P = e.me,
            Q = e.other;
          const nIsA = P.x < Q.x || (P.x === Q.x && P.y < Q.y);
          const rec =
            _curveMap[e.l.id] || (_curveMap[e.l.id] = { oa: 0, ob: 0 });
          if (nIsA) rec.oa = fan;
          else rec.ob = -fan;
        }
      }
      i = j;
    }
  }
}
function _segRec(ax, ay, bx, by) {
  const near = (x, y, u, v) => Math.abs(x - u) < 0.6 && Math.abs(y - v) < 0.6;
  for (const l of DB.links) {
    const rec = _curveMap[l.id];
    if (!rec) continue;
    const p = getNode(l.fromId),
      q = getNode(l.toId);
    if (!p || !q) continue;
    if (
      (near(p.x, p.y, ax, ay) && near(q.x, q.y, bx, by)) ||
      (near(q.x, q.y, ax, ay) && near(p.x, p.y, bx, by))
    )
      return rec;
  }
  return null;
}
function _canon(ax, ay, bx, by) {
  return bx < ax || (bx === ax && by < ay)
    ? [bx, by, ax, ay, true]
    : [ax, ay, bx, by, false];
}

const SELFLOOP_W = 52,
  SELFLOOP_H = 78;
function _isSelfPt(ax, ay, bx, by) {
  return ax === bx && ay === by;
}
function _selfLoopC(ax, ay) {
  return {
    c1x: ax + SELFLOOP_W,
    c1y: ay - SELFLOOP_H,
    c2x: ax - SELFLOOP_W,
    c2y: ay - SELFLOOP_H,
  };
}
function _cubic(cax, cay, cbx, cby) {
  const rec = _segRec(cax, cay, cbx, cby);
  if (!rec || (!rec.oa && !rec.ob)) return null;
  const dx = cbx - cax,
    dy = cby - cay,
    len = Math.hypot(dx, dy);
  if (len < 24) return null;
  const ux = dx / len,
    uy = dy / len,
    px = -uy,
    py = ux,
    d = len * 0.28;
  return {
    c1x: cax + ux * d + px * rec.oa,
    c1y: cay + uy * d + py * rec.oa,
    c2x: cbx - ux * d + px * rec.ob,
    c2y: cby - uy * d + py * rec.ob,
  };
}
function _linkD(ax, ay, bx, by) {
  if (_isSelfPt(ax, ay, bx, by)) {
    const s = _selfLoopC(ax, ay);
    return `M${ax} ${ay}C${s.c1x} ${s.c1y} ${s.c2x} ${s.c2y} ${bx} ${by}`;
  }
  const [cax, cay, cbx, cby] = _canon(ax, ay, bx, by);
  const c = _cubic(cax, cay, cbx, cby);
  if (!c) return `M${ax} ${ay}L${bx} ${by}`;
  return `M${cax} ${cay}C${c.c1x} ${c.c1y} ${c.c2x} ${c.c2y} ${cbx} ${cby}`;
}
function _linkMid(ax, ay, bx, by) {
  if (_isSelfPt(ax, ay, bx, by)) {
    const s = _selfLoopC(ax, ay);
    return { x: ax, y: 0.25 * ay + 0.375 * s.c1y + 0.375 * s.c2y };
  }
  const [cax, cay, cbx, cby] = _canon(ax, ay, bx, by);
  const c = _cubic(cax, cay, cbx, cby);
  if (!c) return { x: (ax + bx) / 2, y: (ay + by) / 2 };
  return {
    x: 0.125 * cax + 0.375 * c.c1x + 0.375 * c.c2x + 0.125 * cbx,
    y: 0.125 * cay + 0.375 * c.c1y + 0.375 * c.c2y + 0.125 * cby,
  };
}
function _bez(ax, ay, bx, by, t) {
  if (_isSelfPt(ax, ay, bx, by)) {
    const s = _selfLoopC(ax, ay),
      u = 1 - t,
      w0 = u * u * u,
      w1 = 3 * u * u * t,
      w2 = 3 * u * t * t,
      w3 = t * t * t;
    return {
      x: w0 * ax + w1 * s.c1x + w2 * s.c2x + w3 * bx,
      y: w0 * ay + w1 * s.c1y + w2 * s.c2y + w3 * by,
    };
  }
  const [cax, cay, cbx, cby, rev] = _canon(ax, ay, bx, by);
  const c = _cubic(cax, cay, cbx, cby);
  if (!c) return { x: ax + (bx - ax) * t, y: ay + (by - ay) * t };
  const tt = rev ? 1 - t : t,
    u = 1 - tt,
    w0 = u * u * u,
    w1 = 3 * u * u * tt,
    w2 = 3 * u * tt * tt,
    w3 = tt * tt * tt;
  return {
    x: w0 * cax + w1 * c.c1x + w2 * c.c2x + w3 * cbx,
    y: w0 * cay + w1 * c.c1y + w2 * c.c2y + w3 * cby,
  };
}
function render() {
  dhcpCacheClear();
  _ipConflictSet = buildIpConflicts();
  try {
    _render();
  } finally {
    _ipConflictSet = null;
  }
}
function _render() {
  const gNodes = $("gNodes"),
    gLinks = $("gLinks"),
    gLinkLabels = $("gLinkLabels");
  gNodes.innerHTML = "";
  gLinks.innerHTML = "";
  if (gLinkLabels) gLinkLabels.innerHTML = "";
  nodeEls = {};
  _computeCurves();

  if (animRAF) cancelAnimationFrame(animRAF);
  const gov = $("gOverlay");
  if (gov) gov.innerHTML = "";

  const isVlanNode = (id) => {
    const n = getNode(id);
    return n && isSegment(id) && !n.isInternet;
  };
  const _stpBl = stpBlockedLinks();
  const _stpRoot = _stpBl.size ? stpRootId() : null;
  const _stpStorm = stpStormLinks();
  const _lagBadged = new Set();

  const _cardBoxes = [];
  for (const n of [].concat(
    DB.devices || [],
    DB.hosts || [],
    DB.segments || [],
  )) {
    if (!n || !isFinite(n.x) || !isFinite(n.y) || !isRenderedNode(n.id))
      continue;
    const d = isSegment(n.id) ? NODE.seg : isHost(n.id) ? NODE.host : NODE.dev;
    _cardBoxes.push({
      x: n.x - d.w / 2 - 6,
      y: n.y - d.h / 2 - 6,
      w: d.w + 12,
      h: d.h + 12,
    });
  }

  for (const l of DB.links) {
    if (isVlanNode(l.fromId) || isVlanNode(l.toId)) continue;
    const a = getNode(l.fromId),
      b = getNode(l.toId);
    if (!a || !b) continue;

    const isWifi =
      !!l.wl ||
      (a.type === "host" && a.wifi && a.wifi.apId === b.id) ||
      (b.type === "host" && b.wifi && b.wifi.apId === a.id);
    const _linkDown = linkDown(l);
    const _stpStorming = !_linkDown && _stpStorm.has(l.id);
    const _stpBlocked = !_linkDown && !_stpStorming && _stpBl.has(l.id);
    const _d = _linkD(a.x, a.y, b.x, b.y);

    const _m = (function () {
      const mid = _linkMid(a.x, a.y, b.x, b.y);

      const LW = 118,
        LH = 22,
        LDY = -20;
      const hits = (p) => {
        const lx = p.x - LW / 2,
          ly = p.y + LDY - LH / 2;
        return _cardBoxes.some(
          (r) =>
            !(
              lx + LW <= r.x ||
              r.x + r.w <= lx ||
              ly + LH <= r.y ||
              r.y + r.h <= ly
            ),
        );
      };
      if (!hits(mid)) return mid;

      {
        const dx = b.x - a.x,
          dy = b.y - a.y,
          len = Math.hypot(dx, dy) || 1,
          px = -dy / len,
          py = dx / len;
        for (const off of [0, 30, -30, 52, -52, 76, -76, 104, -104]) {
          for (const t of [0.5, 0.36, 0.64, 0.28, 0.72, 0.2, 0.8, 0.14, 0.86]) {
            const c = _bez(a.x, a.y, b.x, b.y, t);
            const p = { x: c.x + px * off, y: c.y + py * off };
            if (!hits(p)) return p;
          }
        }
      }
      return mid;
    })();
    const _hit = el("path", {
      class: "link-hit",
      "data-link-hit": l.id,
      d: _d,
    });
    if (_linkDown) {
      const _tt = el("title");
      _tt.textContent = t("portAdminDown");
      _hit.appendChild(_tt);
    } else if (_stpStorming) {
      const _tt = el("title");
      _tt.textContent = t("stpStormTip");
      _hit.appendChild(_tt);
    } else if (_stpBlocked) {
      const _tt = el("title");
      _tt.textContent = stpBadgeTipFor(l);
      _hit.appendChild(_tt);
    } else if (l.congested) {
      const _tt = el("title");
      _tt.textContent = t("linkCongestedTip");
      _hit.appendChild(_tt);
    }
    gLinks.appendChild(_hit);
    const _isLag = l.lag != null && !_linkDown && !_stpStorming && !_stpBlocked;

    const _mg = el("g", {
      "data-mid": l.id,
      transform: `translate(${_m.x},${_m.y})`,
      "pointer-events": "none",
    });
    gLinks.appendChild(
      el("path", {
        class:
          "link" +
          (selectedLinkId === l.id ? " sel" : "") +
          (isWifi ? " wifi" : "") +
          (_stpStorming ? " storm-link" : "") +
          (l.congested && !_linkDown && !_stpStorming && !_stpBlocked
            ? " congested-link"
            : ""),
        "data-link": l.id,
        d: _d,
        style: _linkDown
          ? "stroke:var(--red);stroke-width:1.6;stroke-dasharray:5 5;opacity:.55"
          : _stpBlocked
            ? "stroke:var(--amber);stroke-width:1.6;stroke-dasharray:6 5;opacity:.7"
            : _isLag
              ? "stroke:var(--cyan);stroke-width:2.4"
              : "",
      }),
    );
    if (_isLag && !_lagBadged.has(l.lag)) {
      _lagBadged.add(l.lag);
      const cnt = DB.links.filter((x) => x.lag === l.lag).length,
        mx = 0,
        my = 0;
      const bg = el("rect", {
        x: mx - 24,
        y: my - 9,
        width: 48,
        height: 18,
        rx: 5,
        fill: "var(--bdg-cyan-bg)",
        stroke: "var(--cyan)",
        "stroke-width": 1,
        "pointer-events": "none",
      });
      _mg.appendChild(bg);
      const tx = el("text", {
        x: mx,
        y: my + 4,
        "text-anchor": "middle",
        fill: "var(--cyan)",
        "font-size": "9",
        "font-weight": "700",
        "font-family": "var(--mono)",
        "pointer-events": "none",
      });
      tx.textContent = "LAG ×" + cnt;
      _mg.appendChild(tx);
    }
    if (_stpStorming) {
      const mx = 0,
        my = 0;
      const bg = el("rect", {
        x: mx - 27,
        y: my - 9,
        width: 54,
        height: 18,
        rx: 5,
        fill: "var(--bdg-red-bg)",
        stroke: "var(--red)",
        "stroke-width": 1,
        "pointer-events": "none",
      });
      _mg.appendChild(bg);
      const tx = el("text", {
        x: mx,
        y: my + 4,
        "text-anchor": "middle",
        fill: "var(--red)",
        "font-size": "9",
        "font-weight": "700",
        "font-family": "var(--mono)",
        "pointer-events": "none",
      });
      tx.textContent = t("stpStormBadge");
      _mg.appendChild(tx);
    } else if (_stpBlocked) {
      const mx = 0,
        my = 0;
      const bg = el("rect", {
        x: mx - 30,
        y: my - 9,
        width: 60,
        height: 18,
        rx: 5,
        fill: "var(--bdg-amber-bg)",
        stroke: "var(--amber)",
        "stroke-width": 1,
        "pointer-events": "none",
      });
      _mg.appendChild(bg);
      const tx = el("text", {
        x: mx,
        y: my + 4,
        "text-anchor": "middle",
        fill: "var(--amber)",
        "font-size": "9",
        "font-weight": "700",
        "font-family": "var(--mono)",
        "pointer-events": "none",
      });
      tx.textContent = t("stpBlockBadge");
      _mg.appendChild(tx);
    } else if (_linkDown) {
      const mx = 0,
        my = 0;
      const bg = el("rect", {
        x: mx - 33,
        y: my - 9,
        width: 66,
        height: 18,
        rx: 5,
        fill: "var(--bdg-red-bg)",
        stroke: "var(--red)",
        "stroke-width": 1,
        "pointer-events": "none",
      });
      _mg.appendChild(bg);
      const tx = el("text", {
        x: mx,
        y: my + 4,
        "text-anchor": "middle",
        fill: "var(--red)",
        "font-size": "9",
        "font-weight": "700",
        "font-family": "var(--mono)",
        "pointer-events": "none",
      });
      tx.textContent = t("portAdminDownBadge");
      _mg.appendChild(tx);
    }
    if (isWifi) {
      const mx = _m.x,
        my = _m.y;
      const g = el("g", {
        class: "wifi-arc",
        "data-arc": l.id,
        transform: `translate(${mx},${my})`,
      });
      g.appendChild(
        el("path", {
          d: "M-9 4 a9 9 0 0 1 18 0 M-5 4 a5 5 0 0 1 10 0",
          fill: "none",
          stroke: "var(--cyan)",
          "stroke-width": "1.6",
          "stroke-linecap": "round",
        }),
      );
      g.appendChild(
        el("circle", { cx: 0, cy: 5, r: 1.6, fill: "var(--cyan)" }),
      );
      gLinks.appendChild(g);
    }

    let _portTag = "";
    if (l.port && l.port.mode) {
      if (l.port.mode === "access") {
        const sg = getNode(l.port.vlan);
        _portTag = sg && sg.vlan ? "VLAN " + sg.vlan : "";
      } else if (l.port.mode === "trunk") _portTag = "trunk";
      else if (l.port.mode === "dynamic") _portTag = "dynamic";
    }

    {
      const _cong = l.congested && !_linkDown && !_stpStorming && !_stpBlocked;
      const parts = [];
      if (_portTag) parts.push(_portTag);
      if (_cong) parts.push(t("linkCongestedBadge"));
      if (showLinkLabels) {
        const ec = baseLinkCost(l);
        const _wl = !!l.wl || isWirelessClientLink(l);
        const _mb = linkMbits(l);
        if (
          (typeof l.cost === "number" && l.cost > 0) ||
          l.speed > 0 ||
          l.wl ||
          _wl
        )
          parts.push(
            (_wl
              ? _mb > 0
                ? speedLabel(_mb) + " · "
                : t("wlOutOfRange") + " · "
              : l.speed > 0
                ? speedLabel(l.speed) + " · "
                : "") + "cost " + ec,
          );
      }
      if (parts.length) {
        const lbl = parts.join(" · "),
          w = Math.max(54, lbl.length * 5.9 + 14);
        const _col = _cong
          ? "var(--amber)"
          : l.port && l.port.mode === "trunk"
            ? "var(--cyan)"
            : "var(--line2)";
        const bg = el("rect", {
          x: -w / 2,
          y: -29,
          width: w,
          height: 18,
          rx: 5,
          fill: _cong ? "var(--bdg-amber-bg)" : "var(--panel)",
          stroke: _col,
          "stroke-width": 1,
          "pointer-events": "none",
        });
        _mg.appendChild(bg);
        _mg.appendChild(
          el("line", {
            x1: 0,
            y1: -11,
            x2: 0,
            y2: -2,
            stroke: _col,
            "stroke-width": 1,
            opacity: 0.7,
            "pointer-events": "none",
          }),
        );
        const bx = el("text", {
          x: 0,
          y: -16,
          "text-anchor": "middle",
          fill: _cong ? "var(--amber)" : "var(--txt)",
          "font-size": "9",
          "font-weight": "700",
          "font-family": "var(--mono)",
          "pointer-events": "none",
        });
        bx.textContent = lbl;
        _mg.appendChild(bx);
      }
    }

    if (_mg.childNodes.length) (gLinkLabels || gLinks).appendChild(_mg);
  }

  const haSeen = new Set();
  for (const d of DB.devices) {
    if (d.haPeer && !haSeen.has(d.id)) {
      const p = getNode(d.haPeer);
      if (p) {
        haSeen.add(d.id);
        haSeen.add(p.id);
        gLinks.appendChild(
          el("line", {
            class: "ha-link",
            "data-ha": d.id,
            x1: d.x,
            y1: d.y,
            x2: p.x,
            y2: p.y,
          }),
        );
      }
    }
  }

  for (const s of DB.segments) {
    if (s.isInternet) gNodes.appendChild(buildNode(s, true));
  }
  for (const d of DB.devices) gNodes.appendChild(buildNode(d, false));
  for (const h of DB.hosts || []) gNodes.appendChild(buildHost(h));
  if (_stpRoot) {
    const rn = getNode(_stpRoot);
    if (rn) {
      const members = [rn];
      if (rn.haPeer) {
        const p = getNode(rn.haPeer);
        if (p && !isInactive(p.id)) members.push(p);
      }
      members.forEach((m) => {
        const g = el("g", {
          "pointer-events": "none",
          "data-rootbadge": m.id,
          transform: `translate(${m.x},${m.y})`,
        });
        g.appendChild(
          el("rect", {
            x: -26,
            y: -40,
            width: 52,
            height: 16,
            rx: 8,
            fill: "var(--bdg-green-bg)",
            stroke: "var(--green)",
            "stroke-width": 1.2,
          }),
        );
        const tx = el("text", {
          x: 0,
          y: -28,
          "text-anchor": "middle",
          fill: "var(--green)",
          "font-size": "9",
          "font-weight": "700",
          "font-family": "var(--mono)",
        });
        tx.textContent = "ROOT";
        g.appendChild(tx);
        gNodes.appendChild(g);
      });
    }
  }
  const gN = $("gNotes");
  if (gN) {
    gN.innerHTML = "";
    noteEls = {};
    for (const nt of DB.notes || []) gN.appendChild(buildNote(nt));
  }
  renderZoneOverlays();
  updateZonesBtn();
  fitNodeLabels();
  fitNotes();
  a11yCanvasLabel();
}

function fitNodeLabels() {
  for (const id in nodeEls) {
    const g = nodeEls[id];
    if (!g) continue;
    g.querySelectorAll("text[data-maxw]").forEach((tn) => {
      const maxw = parseFloat(tn.getAttribute("data-maxw"));
      if (!maxw) return;
      const tnode = tn.firstChild;
      if (!tnode || tnode.nodeType !== 3) return;
      const full = tnode.nodeValue;
      if (!full) return;
      let len;
      try {
        len = tn.getComputedTextLength();
      } catch (e) {
        return;
      }
      if (!len || len <= maxw) return;
      let s = full;
      while (s.length > 1) {
        s = s.slice(0, -1);
        tnode.nodeValue = s.replace(/\s+$/, "") + "…";
        try {
          len = tn.getComputedTextLength();
        } catch (e) {
          break;
        }
        if (len <= maxw) break;
      }
      if (!tn.querySelector("title")) {
        const tt = el("title");
        tt.textContent = full;
        tn.appendChild(tt);
      }
    });
  }
}
function buildHost(h) {
  const w = NODE.host.w,
    hh = NODE.host.h;
  const g = el("g", {
    class:
      "node host" +
      (selectedId === h.id ? " selected" : "") +
      (h.down ? " down" : "") +
      (h.quar ? " quar" : ""),
    "data-id": h.id,
    transform: `translate(${h.x},${h.y})`,
  });
  nodeEls[h.id] = g;
  const kind = hostKind(h.kind);
  const segC =
    (h.segId && getNode(h.segId) && getNode(h.segId).color) || "#2dd4bf";
  const accent = segC;
  const clipId = "clip-" + h.id;
  const cp = el("clipPath", { id: clipId });
  cp.appendChild(
    el("rect", { x: -w / 2, y: -hh / 2, width: w, height: hh, rx: 11 }),
  );
  g.appendChild(cp);
  g.appendChild(
    el("rect", {
      class: "nbox",
      x: -w / 2,
      y: -hh / 2,
      width: w,
      height: hh,
      rx: 11,
      fill: "var(--panel)",
    }),
  );
  g.appendChild(
    el("rect", {
      x: -w / 2,
      y: -hh / 2,
      width: w,
      height: 5,
      fill: accent,
      "clip-path": `url(#${clipId})`,
    }),
  );
  const _isDns = isDnsHost(h.id);
  g.appendChild(
    el("g", { transform: `translate(${-w / 2 + 20},0)` }, [
      segIcon(_isDns ? "dns" : kind.icon, accent),
    ]),
  );
  g.appendChild(
    txt(h.label, {
      class: "nlabel",
      x: -w / 2 + 38,
      y: -6,
      "data-maxw": w - 48,
    }),
  );
  const seg = h.segId && getNode(h.segId);
  const subFull = kind.name + (seg ? " · " + seg.name : "");
  g.appendChild(
    txt(subFull, {
      class: "ntype",
      x: -w / 2 + 38,
      y: 10,
      "data-maxw": w - 48,
    }),
  );

  const _isDhcp = Array.isArray(h.services) && h.services.indexOf(67) >= 0;
  const hb = [];
  if (_isDns)
    hb.push({ txt: "DNS", fill: "var(--violet)", tip: t("devBadgeDnsSrv") });
  if (_isDhcp)
    hb.push({ txt: "DHCP", fill: "var(--cyan)", tip: t("devBadgeDhcp") });
  const hbW = hb.reduce((s, b) => s + (b.txt.length > 3 ? 34 : 27) + 2, 0);
  let svc,
    svcFull = null;
  if (h.services && h.services.length) {
    const names = h.services.map((p) => serviceShort(p));
    svc =
      names.slice(0, 3).join(" ") +
      (names.length > 3 ? " +" + (names.length - 3) : "");
    svcFull = t("openPorts") + " " + h.services.join(", ");
  } else svc = t("noServices");
  const svcT = txt(svc, {
    class: "ntype",
    x: -w / 2 + 38,
    y: 24,
    "data-maxw": w - 48 - hbW - 6,
  });
  if (svcFull) {
    const tt = el("title");
    tt.textContent = svcFull;
    svcT.appendChild(tt);
  }
  g.appendChild(svcT);
  {
    let bx = w / 2 - 2 - hbW;
    hb.forEach((b) => {
      const bw = b.txt.length > 3 ? 34 : 27;
      const g2 = el("g", { transform: `translate(${bx},${hh / 2 - 16})` });
      g2.appendChild(
        el("rect", { x: 0, y: 0, width: bw, height: 14, rx: 4, fill: b.fill }),
      );
      g2.appendChild(
        txt(b.txt, {
          x: bw / 2,
          y: 10,
          "text-anchor": "middle",
          "font-size": "9",
          "font-weight": "700",
          fill: "var(--on-accent)",
          "font-family": "var(--sans)",
        }),
      );
      const bt = el("title");
      bt.textContent = b.tip;
      g2.appendChild(bt);
      g.appendChild(g2);
      bx += bw + 2;
    });
  }
  if (h.quar) {
    g.appendChild(
      el("rect", {
        x: -w / 2,
        y: -hh / 2,
        width: w,
        height: hh,
        rx: 12,
        fill: "none",
        stroke: "var(--amber)",
        "stroke-width": 2,
        "stroke-dasharray": "3 3",
      }),
    );
    g.appendChild(
      txt(t("quarBadge"), {
        x: 0,
        y: hh / 2 - 6,
        "text-anchor": "middle",
        "font-size": "9.5",
        "font-weight": "700",
        fill: "var(--amber)",
        "font-family": "var(--sans)",
      }),
    );
  }
  const warns = nodeWarnings(h);
  if (warns.length) {
    const wb = el("g", {
      class: "warnbadge",
      transform: `translate(${w / 2 - 13},${-hh / 2 + 13})`,
    });
    wb.appendChild(
      el("path", {
        d: "M0 -7L7 6H-7z",
        fill: "var(--amber)",
        stroke: "var(--on-amber)",
        "stroke-width": "1",
      }),
    );
    wb.appendChild(
      txt("!", {
        x: 0,
        y: 4,
        "text-anchor": "middle",
        "font-size": "9",
        "font-weight": "700",
        fill: "var(--on-amber)",
        "font-family": "var(--sans)",
      }),
    );
    const ttl = el("title");
    ttl.textContent = warns.join("\n");
    wb.appendChild(ttl);
    g.appendChild(wb);
  }
  [w / 2, -w / 2].forEach((px) => {
    const pc = el("circle", {
      class: "port",
      "data-id": h.id,
      cx: px,
      cy: 0,
      r: 6,
    });
    const ti = el("title");
    ti.textContent = t("portConnectTip");
    pc.appendChild(ti);
    g.appendChild(pc);
    g.appendChild(
      el("path", {
        class: "port-plus",
        d: `M${px - 2.4} 0h4.8M${px} -2.4v4.8`,
      }),
    );
  });
  g.appendChild(
    el("circle", {
      class: "port-hit",
      "data-id": h.id,
      cx: w / 2,
      cy: 0,
      r: 15,
    }),
  );
  g.appendChild(
    el("circle", {
      class: "port-hit",
      "data-id": h.id,
      cx: -w / 2,
      cy: 0,
      r: 15,
    }),
  );
  return g;
}
function serviceShort(port) {
  for (const k in TRAFFIC) {
    if (TRAFFIC[k].port === port) return TRAFFIC[k].label.split(" ")[0];
  }
  return String(port);
}

function buildNode(n, isSeg) {
  const dim = isSeg ? NODE.seg : NODE.dev;
  const w = dim.w,
    h = dim.h;
  const g = el("g", {
    class:
      "node" +
      (selectedId === n.id ? " selected" : "") +
      (n.down ? " down" : "") +
      (n.quar ? " quar" : ""),
    "data-id": n.id,
    transform: `translate(${n.x},${n.y})`,
  });
  nodeEls[n.id] = g;

  const DEVACCENT = {
    firewall: "var(--red)",
    router: "var(--green)",
    l3switch: "var(--violet)",
    l2switch: "var(--cyan)",
    l2mgmt: "var(--blue)",
    idsips: "var(--amber)",
    loadbalancer: "var(--blue)",
    vpn: "var(--lime)",
    ap: "var(--cyan)",
    hub: "var(--muted)",
  };
  const accent = isSeg
    ? n.color || "#2dd4bf"
    : DEVACCENT[n.type] || "var(--cyan)";
  const clipId = "clip-" + n.id;
  const cp = el("clipPath", { id: clipId });
  cp.appendChild(
    el("rect", { x: -w / 2, y: -h / 2, width: w, height: h, rx: 12 }),
  );
  g.appendChild(cp);
  g.appendChild(
    el("rect", {
      class: "nbox",
      x: -w / 2,
      y: -h / 2,
      width: w,
      height: h,
      rx: 12,
      fill: "var(--panel)",
    }),
  );

  g.appendChild(
    el("rect", {
      x: -w / 2,
      y: -h / 2,
      width: w,
      height: 5,
      fill: accent,
      "clip-path": `url(#${clipId})`,
    }),
  );
  if (isSeg) {
    g.appendChild(
      el("g", { transform: `translate(${-w / 2 + 22},${-h / 2 + 24})` }, [
        segIcon(n.icon || "lan", n.color || "#2dd4bf"),
      ]),
    );
    g.appendChild(
      txt(n.name, {
        class: "nlabel",
        x: -w / 2 + 40,
        y: -h / 2 + 26,
        "data-maxw": w - 50,
      }),
    );
    g.appendChild(
      txt(n.subnet || "", {
        class: "nsub",
        x: -w / 2 + 16,
        y: -h / 2 + 48,
        "data-maxw": w - 26,
      }),
    );
    if (n.vlan)
      g.appendChild(
        txt("VLAN " + n.vlan, {
          class: "nsub",
          x: -w / 2 + 16,
          y: -h / 2 + 66,
          "data-maxw": w - 26,
        }),
      );
  } else {
    const SUBL = {
      l2switch: "L2 switch",
      l2mgmt: "Managed L2 · ACL",
      l3switch: "L3 switch · routing",
      router: "Router · NAT",
      firewall: "Firewall",
      idsips: "IDS/IPS",
      loadbalancer: "Load balancer",
      vpn: t("nVpnGw"),
      ap: "Wi-Fi AP · " + "bridge",
      hub: "Hub · " + "all ports",
      datadiode:
        "Data diode · " + "one-way",
      waf: "WAF · " + "web L7",
    };
    let sub = SUBL[n.type] || n.type;
    if (n.type === "idsips")
      sub = n.mode === "ids" ? "IDS · " + t("nDevDetect") : "IPS · inline";
    let info = null;
    if (n.type === "firewall") {
      ensureFirewallZones(n);
      info =
        n.zoneMode === false
          ? tf("nFwSimpleInfo", n.simpleRules ? n.simpleRules.length : 0)
          : tf("nFwZonesInfo", n.zones.length, n.firewallRules.length);
    } else if (
      (n.type === "l3switch" || n.type === "router" || n.type === "l2mgmt") &&
      n.acl &&
      n.acl.length
    ) {
      info = tf("nDevAclCount", n.acl.length);
    } else if (n.type === "idsips" && n.signatures && n.signatures.length) {
      info = tf("nDevSigCount", n.signatures.length);
    } else if (
      n.type === "loadbalancer" &&
      n.vipPorts &&
      String(n.vipPorts).trim()
    ) {
      info = tf("nDevVip", String(n.vipPorts).trim());
    }
    g.appendChild(
      el("g", { transform: `translate(${-w / 2 + 22},0)` }, [
        deviceIcon(n.type),
      ]),
    );
    if (info) {
      g.appendChild(
        txt(n.label, {
          class: "nlabel",
          x: -w / 2 + 42,
          y: -11,
          "data-maxw": w - 48,
        }),
      );
      g.appendChild(
        txt(sub, { class: "ntype", x: -w / 2 + 42, y: 5, "data-maxw": w - 48 }),
      );
      g.appendChild(
        txt(info, {
          class: "ntype",
          x: -w / 2 + 42,
          y: 20,
          "data-maxw": w - 48,
        }),
      );
    } else {
      g.appendChild(
        txt(n.label, {
          class: "nlabel",
          x: -w / 2 + 42,
          y: -3,
          "data-maxw": w - 48,
        }),
      );
      g.appendChild(
        txt(sub, {
          class: "ntype",
          x: -w / 2 + 42,
          y: 13,
          "data-maxw": w - 48,
        }),
      );
    }

    if (n.haPeer && getNode(n.haPeer)) {
      const hb = el("g", {
        transform: `translate(${-w / 2 + 2},${-h / 2 - 2})`,
      });
      hb.appendChild(
        el("rect", {
          x: 0,
          y: 0,
          width: 24,
          height: 14,
          rx: 4,
          fill: "var(--amber)",
        }),
      );
      hb.appendChild(
        txt("HA", {
          x: 12,
          y: 10,
          "text-anchor": "middle",
          "font-size": "9",
          "font-weight": "700",
          fill: "var(--on-amber)",
          "font-family": "var(--sans)",
        }),
      );
      const tt = el("title");
      tt.textContent = tf("nHaPairWith", getNode(n.haPeer).label || "");
      hb.appendChild(tt);
      g.appendChild(hb);
    }

    if (
      (n.type === "router" || n.type === "firewall" || n.type === "l3switch") &&
      isAdvanced()
    ) {
      const rb = [];
      const dr = dnsRoleOf(n.id);
      if (dr)
        rb.push({
          txt: "DNS",
          fill: "var(--violet)",
          tip: dr === "server" ? t("devBadgeDnsSrv") : t("devBadgeDnsFwd"),
        });
      if (n.dhcpRole === "server")
        rb.push({ txt: "DHCP", fill: "var(--cyan)", tip: t("devBadgeDhcp") });
      let bx = -w / 2 + 2;
      rb.forEach((b) => {
        const bw = b.txt.length > 3 ? 34 : 27;
        const g2 = el("g", { transform: `translate(${bx},${h / 2 - 12})` });
        g2.appendChild(
          el("rect", {
            x: 0,
            y: 0,
            width: bw,
            height: 14,
            rx: 4,
            fill: b.fill,
          }),
        );
        g2.appendChild(
          txt(b.txt, {
            x: bw / 2,
            y: 10,
            "text-anchor": "middle",
            "font-size": "9",
            "font-weight": "700",
            fill: "var(--on-accent)",
            "font-family": "var(--sans)",
          }),
        );
        const bt = el("title");
        bt.textContent = b.tip;
        g2.appendChild(bt);
        g.appendChild(g2);
        bx += bw + 3;
      });
    }
  }

  if (n.down) {
    g.appendChild(
      el("rect", {
        x: -w / 2,
        y: -h / 2,
        width: w,
        height: h,
        rx: 12,
        fill: "none",
        stroke: "var(--red)",
        "stroke-width": 2,
        "stroke-dasharray": "7 4",
      }),
    );
    g.appendChild(
      txt(t("hostOffBadge"), {
        x: 0,
        y: h / 2 - 6,
        "text-anchor": "middle",
        "font-size": "9.5",
        "font-weight": "700",
        fill: "var(--red)",
        "font-family": "var(--sans)",
      }),
    );
  }
  if (n.quar) {
    g.appendChild(
      el("rect", {
        x: -w / 2,
        y: -h / 2,
        width: w,
        height: h,
        rx: 12,
        fill: "none",
        stroke: "var(--amber)",
        "stroke-width": 2,
        "stroke-dasharray": "3 3",
      }),
    );
    g.appendChild(
      txt(t("quarBadge"), {
        x: 0,
        y: h / 2 - 6,
        "text-anchor": "middle",
        "font-size": "9.5",
        "font-weight": "700",
        fill: "var(--amber)",
        "font-family": "var(--sans)",
      }),
    );
  }

  if (
    !isSeg &&
    n.type === "ap" &&
    typeof apNoUplink === "function" &&
    apNoUplink(n)
  ) {
    g.appendChild(
      txt(t("apNoUplinkBadge"), {
        x: 0,
        y: h / 2 - 6,
        "text-anchor": "middle",
        "font-size": "9.5",
        "font-weight": "700",
        fill: "var(--red)",
        "font-family": "var(--sans)",
      }),
    );
  }

  const warns = nodeWarnings(n);
  if (warns.length) {
    const wb = el("g", {
      class: "warnbadge",
      transform: `translate(${w / 2 - 14},${-h / 2 + 14})`,
    });
    wb.appendChild(
      el("path", {
        d: "M0 -8L8 7H-8z",
        fill: "var(--amber)",
        stroke: "var(--on-amber)",
        "stroke-width": "1",
      }),
    );
    wb.appendChild(
      txt("!", {
        x: 0,
        y: 5,
        "text-anchor": "middle",
        "font-size": "10",
        "font-weight": "700",
        fill: "var(--on-amber)",
        "font-family": "var(--sans)",
      }),
    );
    const ttl = el("title");
    ttl.textContent = warns.join("\n");
    wb.appendChild(ttl);
    g.appendChild(wb);
  }

  [w / 2, -w / 2].forEach((px) => {
    const pc = el("circle", {
      class: "port",
      "data-id": n.id,
      cx: px,
      cy: 0,
      r: 7,
    });
    const ti = el("title");
    ti.textContent = t("portConnectTip");
    pc.appendChild(ti);
    g.appendChild(pc);
    g.appendChild(
      el("path", {
        class: "port-plus",
        d: `M${px - 2.6} 0h5.2M${px} -2.6v5.2`,
      }),
    );
  });
  g.appendChild(
    el("circle", {
      class: "port-hit",
      "data-id": n.id,
      cx: w / 2,
      cy: 0,
      r: 16,
    }),
  );
  g.appendChild(
    el("circle", {
      class: "port-hit",
      "data-id": n.id,
      cx: -w / 2,
      cy: 0,
      r: 16,
    }),
  );
  return g;
}

function updateLinkGeom() {
  _computeCurves();
  for (const l of DB.links) {
    const a = getNode(l.fromId),
      b = getNode(l.toId);
    if (!a || !b) continue;
    const _d = _linkD(a.x, a.y, b.x, b.y);
    $("gLinks")
      .querySelectorAll(`[data-link="${l.id}"],[data-link-hit="${l.id}"]`)
      .forEach((ln) => {
        ln.setAttribute("d", _d);
      });
    const arc = $("gLinks").querySelector(`[data-arc="${l.id}"]`);
    const midG = document.querySelector(`[data-mid="${l.id}"]`);
    if (arc || midG) {
      const m = _linkMid(a.x, a.y, b.x, b.y);
      const tr = `translate(${m.x},${m.y})`;
      if (arc) arc.setAttribute("transform", tr);
      if (midG) midG.setAttribute("transform", tr);
    }
  }

  $("gNodes")
    .querySelectorAll("[data-rootbadge]")
    .forEach((g) => {
      const n = getNode(g.getAttribute("data-rootbadge"));
      if (n) g.setAttribute("transform", `translate(${n.x},${n.y})`);
    });
  for (const d of DB.devices) {
    if (!d.haPeer) continue;
    const p = getNode(d.haPeer);
    const ln = $("gLinks").querySelector(`[data-ha="${d.id}"]`);
    if (p && ln) {
      ln.setAttribute("x1", d.x);
      ln.setAttribute("y1", d.y);
      ln.setAttribute("x2", p.x);
      ln.setAttribute("y2", p.y);
    }
  }
}

function fitView() {
  const all = [
    ...DB.devices,
    ...DB.segments.filter((s) => s.isInternet),
    ...(DB.hosts || []),
  ];
  if (!all.length) {
    svg.setAttribute("viewBox", "0 0 1000 640");
    return;
  }
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
  const pad = 70;
  const w = Math.max(maxX - minX + pad * 2, 600),
    h = Math.max(maxY - minY + pad * 2, 400);
  svg.setAttribute("viewBox", `${minX - pad} ${minY - pad} ${w} ${h}`);
}

const ZOOM_MIN = 300,
  ZOOM_MAX = 4000;
function getVB() {
  const v = svg.viewBox.baseVal;
  return { x: v.x, y: v.y, w: v.width, h: v.height };
}
function setVB(x, y, w, h) {
  svg.setAttribute("viewBox", `${x} ${y} ${w} ${h}`);
}
function zoomAt(clientX, clientY, factor) {
  const vb = getVB();
  let nw = vb.w * factor;
  nw = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, nw));
  const f = nw / vb.w;
  if (f === 1) return;
  const nh = vb.h * f;
  const p = toSvgPoint(clientX, clientY);
  setVB(p.x - (p.x - vb.x) * f, p.y - (p.y - vb.y) * f, nw, nh);
}
function zoomCenter(factor) {
  const r = svg.getBoundingClientRect();
  zoomAt(r.left + r.width / 2, r.top + r.height / 2, factor);
}
svg.addEventListener(
  "wheel",
  (e) => {
    e.preventDefault();
    zoomAt(e.clientX, e.clientY, e.deltaY > 0 ? 1.12 : 0.89);
  },
  { passive: false },
);
