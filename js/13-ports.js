"use strict";

function setPortColorMode(m) {
  _portColorMode = m === "vlan" || m === "speed" ? m : "state";
  try {
    localStorage.setItem("netsim_portcolor", _portColorMode);
  } catch (e) {}
}

const SPEED_STRIP_COLORS = {
  10: "#eab308",
  100: "#eab308",
  1000: "#22c55e",
  2500: "#60a5fa",
  5000: "#3b82f6",
  10000: "#22d3ee",
};
const SPEED_AUTO_COLOR = "#86efac";

const VLAN_FALLBACK_PALETTE = [
  "#22c55e",
  "#38bdf8",
  "#f59e0b",
  "#a78bfa",
  "#f472b6",
  "#2dd4bf",
  "#fb7185",
  "#84cc16",
];
function vlanColorOf(seg) {
  if (!seg) return "var(--green)";
  if (seg.color) return seg.color;
  let h = 0;
  const s = String(seg.id || "");
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return VLAN_FALLBACK_PALETTE[h % VLAN_FALLBACK_PALETTE.length];
}

let _portHi = null;

function portEffSeg(d, l) {
  if (!l) return null;
  const p = l.port || {};
  if (p.mode === "trunk" || p.mode === "dynamic") return null;
  if (p.mode === "access" && p.vlan) {
    const s = getNode(p.vlan);
    if (s) return s;
  }
  const otherId = l.fromId === d.id ? l.toId : l.fromId,
    o = getNode(otherId);
  if (o && isHost(otherId) && o.segId) {
    const s = getNode(o.segId);
    if (s) return s;
  }
  return null;
}

function portVlanKey(d, l) {
  if (!l) return "free";
  const s = portEffSeg(d, l);
  return s ? s.id : "trunk";
}

const PORT_CELL_FG = "#04140c";
function portCellColor(d, l) {
  const off = l && linkDown(l);
  if (!l) return { bg: "var(--line2)", bd: "", fg: "var(--txt)" };
  const wan = isWanLink(l);
  if (_portColorMode === "state")
    return off
      ? { bg: "var(--red)", bd: "", fg: "var(--on-red)" }
      : wan
        ? { bg: "var(--amber)", bd: "", fg: "var(--on-amber)" }
        : { bg: "var(--green)", bd: "", fg: "var(--on-green)" };
  if (off) return { bg: "var(--line2)", bd: "var(--red)", fg: "var(--txt)" };
  const wb = wan ? "var(--amber)" : "";
  if (_portColorMode === "vlan") {
    const s = portEffSeg(d, l);
    return {
      bg: s ? vlanColorOf(s) : "var(--cyan)",
      bd: wb,
      fg: s ? PORT_CELL_FG : "var(--on-accent)",
    };
  }

  const c = (l.speed > 0 && SPEED_STRIP_COLORS[l.speed]) || SPEED_AUTO_COLOR;
  return { bg: c, bd: wb, fg: PORT_CELL_FG };
}

function portStripLegend(d) {
  const active = (kind, id) =>
    _portHi && _portHi.kind === kind && (id === undefined || _portHi.id === id);
  const dot = (css, lbl, attrs, on) =>
    '<span class="p-leg' +
    (attrs ? "" : " p-leg-static") +
    '"' +
    (attrs || "") +
    ' style="display:inline-flex;align-items:center;gap:4px' +
    (attrs ? ";cursor:pointer" : "") +
    (on
      ? ";font-weight:700;color:var(--text)"
      : _portHi && attrs
        ? ";opacity:.5"
        : "") +
    '">' +
    '<span style="width:10px;height:10px;border-radius:3px;background:' +
    css +
    '"></span>' +
    esc(lbl) +
    "</span>";
  let items;
  if (_portColorMode === "vlan") {
    items = vlanSegs().map((s) =>
      dot(
        vlanColorOf(s),
        s.name + (s.vlan ? " (VLAN " + s.vlan + ")" : ""),
        ' data-leg="vlan" data-legid="' + esc(s.id) + '"',
        active("vlan", s.id),
      ),
    );
    items.push(
      dot("var(--cyan)", t("pcmTrunk"), ' data-leg="trunk"', active("trunk")),
    );
    items.push(
      dot("var(--line2)", t("pcmFree"), ' data-leg="free"', active("free")),
    );
    items.push(dot("var(--line2)", t("pcmDown"), null, false));
  } else if (_portColorMode === "speed")
    items = [
      dot(SPEED_STRIP_COLORS[10], t("pcmFe")),
      dot(SPEED_STRIP_COLORS[1000], t("pcm1g")),
      dot(SPEED_STRIP_COLORS[2500], t("pcm25g")),
      dot(SPEED_STRIP_COLORS[5000], t("pcm5g")),
      dot(SPEED_STRIP_COLORS[10000], t("pcm10g")),
      dot(SPEED_AUTO_COLOR, t("pcmAuto")),
      dot("var(--line2)", t("pcmDisconnected")),
      dot("var(--red)", t("pcmDown")),
    ];
  else
    items = [
      dot("var(--green)", t("pcmUp")),
      dot("var(--amber)", t("pcmWan")),
      dot("var(--line2)", t("pcmFree")),
      dot("var(--red)", t("pcmDown")),
    ];
  return (
    '<div style="display:flex;flex-wrap:wrap;gap:12px;margin-top:6px;font-size:10.5px;color:var(--muted)">' +
    items.join("") +
    "</div>"
  );
}

function portPeerLabel(d, l) {
  if (!l) return "";
  const otherId = l.fromId === d.id ? l.toId : l.fromId,
    o = getNode(otherId);
  if (!o) return "";
  return String(o.label || o.name || otherId);
}
function portStripInnerHtml(d) {
  const n = portsOf(d),
    used = usedPortsPhys(d);
  assignLinkSlots(d);
  const conn = portLinks(d);
  const byNum = {};
  conn.forEach((l) => {
    const p = portNumOf(l, d.id);
    if (p) byNum[p] = l;
  });
  {
    const ls = loopSlotsOf(d);
    Object.keys(ls).forEach((k) => {
      if (!byNum[k]) byNum[k] = ls[k];
    });
  }
  const cfgAll = d.portCfg || {};
  const cells = [];

  const hiOn = (ll) => {
    if (!_portHi) return true;
    if (_portHi.kind === "port") return _portHi.num === undefined;
    if (_portHi.kind === "vlan")
      return !!ll && portVlanKey(d, ll) === _portHi.id;
    if (_portHi.kind === "trunk") return !!ll && portVlanKey(d, ll) === "trunk";
    if (_portHi.kind === "free") return !ll;
    return true;
  };
  const vlanMode = _portColorMode === "vlan";
  const r = rj45Of(d),
    s = sfpOf(d);
  const sfpCells = [];
  for (let num = 1; num <= n; num++) {
    const l = byNum[num] || null;
    let col;
    if (l) col = portCellColor(d, l);
    else if (cfgAll[num] && cfgAll[num].off)
      col = { bg: "var(--line2)", bd: "var(--red)", fg: "var(--txt)" };
    else col = { bg: "var(--line2)", bd: "", fg: "var(--txt)" };
    const bd = col.bd ? ";box-shadow:inset 0 0 0 2px " + col.bd : "";
    const dim = vlanMode && _portHi && !hiOn(l) ? ";opacity:.3" : "";
    const sfp = num > r;
    const shape = sfp
      ? "border-radius:9px 2px;outline:1px solid var(--cyan);outline-offset:1px"
      : "border-radius:4px";
    (sfp ? sfpCells : cells).push(
      '<span class="p-cell" data-pnum="' +
        num +
        '" data-pused="' +
        (l ? 1 : 0) +
        '" title="' +
        esc(
          sfp
            ? portLabelOf(d, num) + " · " + t("sfpDlgHint")
            : l
              ? t("portStateLabel") + " · " + portPeerLabel(d, l)
              : t("portStateLabel"),
        ) +
        '" style="width:22px;height:20px;' +
        shape +
        ";cursor:pointer;display:inline-flex;align-items:center;justify-content:center;font:600 10px var(--mono);color:" +
        (col.fg || PORT_CELL_FG) +
        ";background:" +
        col.bg +
        bd +
        dim +
        '">' +
        (sfp ? num - r : num) +
        "</span>",
    );
  }
  const modeBtn = (m, lbl) =>
    '<button type="button" class="p-cmode" data-cm="' +
    m +
    '" style="padding:3px 9px;font-size:11px;font-weight:600;border:1px solid var(--line2);cursor:pointer;background:' +
    (_portColorMode === m ? "var(--cyan)" : "transparent") +
    ";color:" +
    (_portColorMode === m ? "var(--on-accent)" : "var(--muted)") +
    '">' +
    esc(lbl) +
    "</button>";
  const modeSwitch =
    '<span style="font-size:11px;color:var(--muted)">' +
    esc(t("portColorMode")) +
    ":</span>" +
    '<span style="display:inline-flex;border:1px solid var(--line2);border-radius:7px;overflow:hidden">' +
    modeBtn("state", t("pcmState")) +
    modeBtn("vlan", t("pcmVlan")) +
    modeBtn("speed", t("pcmSpeed")) +
    "</span>";
  const hasSfpOpt = !!SFP_OPTIONS[d.type];
  const sfpSel = hasSfpOpt
    ? '<span style="font-size:12px;color:var(--muted)">SFP</span>' +
      '<select id="mSfpN" title="' +
      esc(t("sfpCountTitle")) +
      '" style="width:60px">' +
      sfpOptionsFor(d)
        .map(
          (v) =>
            '<option value="' +
            v +
            '"' +
            (v === s ? " selected" : "") +
            ">" +
            v +
            "</option>",
        )
        .join("") +
      "</select>"
    : "";
  const sfpBlock = sfpCells.length
    ? '<span style="width:10px"></span><span style="font-size:10px;color:var(--cyan);font-weight:700;align-self:center">SFP</span>' +
      sfpCells.join("")
    : "";
  return (
    "<label>" +
    t("portsPhysLabel") +
    "</label>" +
    '<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">' +
    '<select id="mPortsN" title="' +
    esc(t("portsCountTitle")) +
    '" style="width:80px">' +
    portOptionsFor(d)
      .map(
        (v) =>
          '<option value="' +
          v +
          '"' +
          (v === r ? " selected" : "") +
          ">" +
          v +
          "</option>",
      )
      .join("") +
    "</select>" +
    sfpSel +
    '<span style="font-size:12px;color:var(--muted)">' +
    esc(tf("portsUsed", used, n)) +
    "</span></div>" +
    '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:8px">' +
    modeSwitch +
    "</div>" +
    '<div style="display:flex;flex-wrap:wrap;gap:5px;margin-top:8px">' +
    cells.join("") +
    sfpBlock +
    "</div>" +
    portStripLegend(d)
  );
}
function portStripHtml(d) {
  if (!isAdvanced()) return "";
  if (isWifiOnlyHost(d))
    return (
      '<div class="mfield" style="margin-bottom:12px;font-size:12px;color:var(--muted)">' +
      t("portsWifiOnlyNote") +
      "</div>"
    );
  return (
    '<div class="mfield" id="mPortStrip" style="margin-bottom:12px">' +
    portStripInnerHtml(d) +
    "</div>"
  );
}

function wirePortStrip(d, redraw) {
  const wrap = modalBox.querySelector("#mPortStrip");
  if (!wrap) return;
  const bind = () => {
    const inp = wrap.querySelector("#mPortsN");
    if (inp)
      inp.onchange = (e) => {
        const used = usedRj45(d),
          oldR = rj45Of(d);
        let v = parseInt(e.target.value, 10);
        if (!(v > 0) || v < used)
          v = Math.max(used, DEFAULT_PORTS[d.type] || 8);
        if (v === Math.max(DEFAULT_PORTS[d.type] || 8, used)) delete d.ports;
        else d.ports = v;

        remapSfpSlots(d, oldR, rj45Of(d));
        saveDB();
        window.netRender();
        if (redraw) {
          redraw();
          return;
        }
        wrap.innerHTML = portStripInnerHtml(d);
        bind();
      };

    const sfpInp = wrap.querySelector("#mSfpN");
    if (sfpInp)
      sfpInp.onchange = (e) => {
        const minS = maxUsedSfpSlot(d);
        let v = parseInt(e.target.value, 10);
        if (!(v >= 0) || v < minS) v = Math.max(minS, DEFAULT_SFP[d.type] || 0);
        if (v === (DEFAULT_SFP[d.type] || 0)) delete d.sfp;
        else d.sfp = v;

        const max = portsOf(d);
        if (d.portCfg) {
          Object.keys(d.portCfg).forEach((k) => {
            if (+k > max) delete d.portCfg[k];
          });
          if (!Object.keys(d.portCfg).length) delete d.portCfg;
        }
        saveDB();
        window.netRender();
        if (redraw) {
          redraw();
          return;
        }
        wrap.innerHTML = portStripInnerHtml(d);
        bind();
      };

    wrap.querySelectorAll(".p-cmode").forEach(
      (b) =>
        (b.onclick = () => {
          setPortColorMode(b.getAttribute("data-cm"));
          _portHi = null;
          wrap.innerHTML = portStripInnerHtml(d);
          bind();
        }),
    );

    wrap.querySelectorAll(".p-leg[data-leg]").forEach(
      (el) =>
        (el.onclick = () => {
          const kind = el.getAttribute("data-leg"),
            id = el.getAttribute("data-legid") || undefined;
          if (_portHi && _portHi.kind === kind && _portHi.id === id)
            _portHi = null;
          else _portHi = { kind, id };
          wrap.innerHTML = portStripInnerHtml(d);
          bind();
        }),
    );

    wrap.querySelectorAll(".p-cell").forEach(
      (c) =>
        (c.onclick = () => {
          const num = +c.getAttribute("data-pnum");
          if (_portColorMode === "vlan") {
            assignLinkSlots(d);
            const l =
              portLinks(d).find((x) => portNumOf(x, d.id) === num) || null;
            const key = portVlanKey(d, l);
            const kind = key === "trunk" || key === "free" ? key : "vlan";
            const id = kind === "vlan" ? key : undefined;
            if (_portHi && _portHi.kind === kind && _portHi.id === id)
              _portHi = null;
            else _portHi = { kind, id };
            wrap.innerHTML = portStripInnerHtml(d);
            bind();
          }
          openPortDlg(d.id, num);
        }),
    );
  };
  bind();
}

function vlanSegs() {
  return DB.segments.filter((s) => !s.isInternet);
}
let _portsAllOpen = false;

function portDetailBtnHtml(num) {
  return `<button type="button" class="p-detail btn" data-pdlg="${num}" title="${t("portDetail")}" style="flex:0 0 auto;display:inline-flex;align-items:center;gap:5px;padding:3px 9px;font-size:11px">${icon("sliders")}${t("portDetail")}</button>`;
}

function freePortRowHtml(d, num, vs) {
  const cfg = (d.portCfg && d.portCfg[num]) || {};
  const off = !!cfg.off;
  const preset =
    portVlanCapable(d) &&
    (cfg.mode || cfg.vlan || (cfg.vlans && cfg.vlans.length));
  const offSel =
    `<select class="pf-off" data-pnum="${num}" title="${t("portStateLabel")}" style="flex:0 0 auto;font-size:11px">` +
    `<option value=""${off ? "" : " selected"}>${t("portOn")}</option><option value="1"${off ? " selected" : ""}>${t("portOff")}</option></select>`;
  const badge = off
    ? ` <span style="color:var(--red);font-weight:600">· ${t("portAdminDownBadge")}</span>`
    : preset
      ? ` <span class="pf-badge" style="color:var(--cyan);font-weight:600">· ${t("portPreset")}</span>`
      : "";
  const bd = off ? "var(--red-bd)" : "var(--line2)";
  return `<div class="port-row" id="p-slot-${num}" data-portfree="${num}" style="border:1px dashed ${bd};border-radius:9px;padding:9px 10px;margin-bottom:8px${off ? ";opacity:.75" : ""}">
    <div style="display:flex;align-items:center;gap:8px">
      <b style="flex:1;font-size:12.5px;color:var(--muted)">${portLabelOf(d, num)} · ${t("portFree")}${badge}</b>
      ${offSel}${portDetailBtnHtml(num)}</div></div>`;
}

function wanPaneHtml(d) {
  const wl = wanLinksOf(d);
  if (wl.length < 2) return "";
  assignLinkSlots(d);
  const mode = wanModeOf(d),
    prim = wanPrimaryOf(d);
  const live = wl.filter((l) => !linkDown(l));
  const inetName = (l) => {
    const i = getNode(wanInetOf(l));
    return i ? i.name || "Internet" : "?";
  };
  const rows = wl
    .map((l) => {
      const num = portNumOf(l, d.id),
        down = linkDown(l);
      const radio =
        mode === "failover"
          ? `<input type="radio" name="wanPrim" class="wan-prim" value="${l.id}"${l.id === prim ? " checked" : ""} style="margin:0" title="${t("wanPrimaryLbl")}">`
          : "";
      return `<label style="display:flex;align-items:center;gap:8px;font-size:12px;padding:3px 0;cursor:${mode === "failover" ? "pointer" : "default"}">${radio}
      <b style="flex:1">${portLabelOf(d, num)} · ${esc(inetName(l))}${l.id === prim && mode === "failover" ? ' <span style="color:var(--muted);font-weight:500">· ' + t("wanPrimaryLbl") + "</span>" : ""}</b>
      <span style="color:${down ? "var(--red)" : "var(--green)"};font-weight:600">${down ? t("portOff") : t("portOn")}</span></label>`;
    })
    .join("");
  let st = "";
  if (mode === "balance")
    st = `<span style="color:var(--cyan)">${tf("wanStBalance", live.length)}</span>`;
  else if (!live.length)
    st = `<span style="color:var(--red)">${t("wanStAllDown")}</span>`;
  else {
    const act = live.find((l) => l.id === prim) || live[0];
    st =
      act.id === prim
        ? `<span style="color:var(--green)">${tf("wanStActive", esc(inetName(act)))}</span>`
        : `<span style="color:var(--amber)">${tf("wanStSwitched", esc(inetName(act)))}</span>`;
  }
  const sel = `<select id="wanMode" style="font-size:12px"><option value="failover"${mode === "failover" ? " selected" : ""}>${t("wanModeFailover")}</option><option value="balance"${mode === "balance" ? " selected" : ""}>${t("wanModeBalance")}</option></select>`;
  return `<div style="border:1px solid var(--amber);border-radius:9px;padding:9px 10px;margin-bottom:10px">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;flex-wrap:wrap"><b style="flex:1;font-size:12.5px;color:var(--amber)">${t("wanSecTitle")}</b><label style="font-size:12px;color:var(--muted)">${t("wanModeLbl")}</label>${sel}</div>
    ${rows}
    <div style="font-size:11.5px;margin-top:5px">${st}</div></div>`;
}
function portsPaneHtml(d) {
  const vs = vlanSegs();
  const isSw = portCfgIsSwitch(d);
  const links = portLinks(d);
  let out = isSw
    ? `<div class="default-pol" style="margin:0 0 10px">${t("portIntro")}</div>`
    : "";
  out += wanPaneHtml(d);
  out += portStripHtml(d);

  if (isSw && !links.length)
    out += `<div style="color:var(--muted);font-size:12px;margin-bottom:8px">${t("portNoLinks")}</div>`;
  if (isSw && !vs.length)
    out += `<div style="color:var(--amber);font-size:12px;margin-bottom:8px">${t("portNoVlans")}</div>`;
  if (isSw && links.length && isAdvanced())
    out += `<div style="display:flex;flex-wrap:wrap;align-items:center;gap:14px;margin:0 0 10px;padding:8px 10px;border:1px solid var(--line2);border-radius:9px">
    <label style="display:flex;align-items:center;gap:6px;font-size:12px;cursor:pointer" title="${t("portSnoopTitle")} ${t("portWholeSwitch")}"><input type="checkbox" id="p-snoop"${d.dhcpSnoop ? " checked" : ""}> ${t("portSnoop")}</label>
    <label style="display:flex;align-items:center;gap:6px;font-size:12px;cursor:pointer" title="${t("portDaiTitle")} ${t("portWholeSwitch")}"><input type="checkbox" id="p-dai"${d.dai ? " checked" : ""}> ${t("portDai")}</label>
    <span style="font-size:10.5px;color:var(--muted)">${t("portWholeSwitch")}</span></div>`;
  assignLinkSlots(d);

  const loopEx = loopSlotsOf(d);
  const slotsOf = (l) =>
    [portNumOf(l, d.id)].concat(
      Object.keys(loopEx)
        .filter((k) => loopEx[k] === l)
        .map(Number),
    );
  let rows = [];
  links.forEach((l) =>
    slotsOf(l).forEach((num) => {
      const otherId = l.fromId === d.id ? l.toId : l.fromId;
      const o = getNode(otherId);
      const oname = o ? o.label || o.name || "?" : "?";
      const p = l.port || {};
      const off = linkDown(l);
      const offSel =
        `<select class="p-off" data-lid="${l.id}" title="${t("portStateLabel")}" style="flex:0 0 auto;font-size:11px">` +
        `<option value=""${off ? "" : " selected"}>${t("portOn")}</option><option value="1"${off ? " selected" : ""}>${t("portOff")}</option></select>`;
      let modeSel = "";
      if (portVlanCapable(d)) {
        const modes = isSw
          ? [
              ["", "— " + t("portModeAll")],
              ["access", "access"],
              ["trunk", "trunk"],
              ["dynamic", "dynamic (DTP)"],
            ]
          : [
              ["", "— " + t("portModeAll")],
              ["access", "access"],
              ["trunk", "trunk"],
            ];
        const modeOpt = modes
          .map(
            (m) =>
              `<option value="${m[0]}"${(p.mode || "") === m[0] ? " selected" : ""}>${m[1]}</option>`,
          )
          .join("");
        modeSel = `<select class="p-mode" data-lid="${l.id}" style="flex:0 0 116px"${off ? " disabled" : ""}>${modeOpt}</select>`;
      }
      const html = `<div class="port-row" id="p-slot-${num}" data-portrow="${num}" style="border:1px solid ${off ? "var(--red-bd)" : "var(--line2)"};border-radius:9px;padding:9px 10px;margin-bottom:8px${off ? ";opacity:.65" : ""}">
      <div style="display:flex;align-items:center;gap:8px">
        <b style="flex:1;font-size:12.5px">${portLabelOf(d, num)} · ${esc(oname)}${isWanLink(l) ? ' <span style="color:var(--amber);font-weight:700">· WAN</span>' : ""}${off ? ' <span style="color:var(--red);font-weight:600">· ' + t("portAdminDownBadge") + "</span>" : ""}</b>
        ${offSel}${modeSel}${portDetailBtnHtml(num)}</div></div>`;
      rows.push({ num: num || 9999, html });
    }),
  );

  const N = portsOf(d);
  const connNums = new Set(rows.map((r) => r.num));
  for (let num = 1; num <= N; num++) {
    if (connNums.has(num)) continue;
    rows.push({ num, html: freePortRowHtml(d, num, vs) });
  }
  const rowsHtml = rows
    .sort((a, b) => a.num - b.num)
    .map((r) => r.html)
    .join("");

  out += `<details id="portsAll"${_portsAllOpen ? " open" : ""} style="margin-bottom:6px"><summary style="cursor:pointer;font-size:12.5px;color:var(--muted);margin-bottom:8px">${t("portsAllLabel")} (${portsOf(d)})</summary>${rowsHtml}</details>`;

  if (isSw) out += macTableHtml(d);
  return out;
}

function arpNeighbors(id) {
  let segs = [];
  if (isHost(id)) {
    const sg = epSeg(id);
    if (sg) segs = [sg];
  } else {
    const d = getNode(id);
    if (!d || L3TYPES.indexOf(d.type) < 0) return [];

    segs = DB.segments
      .filter((sg) => {
        if (sg.isInternet) return false;
        try {
          const gs = gatewaysOf(sg.id);
          return gs && (gs.has ? gs.has(id) : [...gs].indexOf(id) >= 0);
        } catch (e) {
          return false;
        }
      })
      .map((sg) => sg.id);
  }
  segs = segs.filter((x) => x && !isInternetSeg(x));
  if (!segs.length) return [];
  const out = [];
  segs.forEach((seg) => {
    (DB.hosts || []).forEach((h) => {
      if (h.id === id || h.segId !== seg) return;
      if (isDown(h.id) || isQuar(h.id)) return;
      if (!l2Path(id, h.id)) return;
      const ip = hostIpAuto(h.id);
      if (!ip) return;
      out.push({ ip, mac: nodeMac(h.id), who: h.label || h.name || h.id });
    });
  });
  const seg = segs[0];
  if (!isHost(id)) return out.slice(0, 12);
  const gwIp = subnetGwIp(seg);
  if (gwIp) {
    let gwId = null;
    try {
      const gs = gatewaysOf(seg);
      for (const g of gs || []) {
        if (!isInactive(g)) {
          gwId = g;
          break;
        }
      }
    } catch (e) {}
    if (gwId) {
      const gw = getNode(gwId);
      if (gw)
        out.unshift({
          ip: gwIp,
          mac: nodeMac(gwId),
          who: gw.label || gw.name,
          gw: true,
        });
    }
  }
  return out.slice(0, 12);
}
function arpTableHtml(id) {
  if (!isAdvanced()) return "";
  if (isDown(id) || isQuar(id)) return "";
  const rows = arpNeighbors(id);
  if (!rows.length) return "";
  const poisoned =
    isHost(id) && typeof arpPoisoned === "function" && arpPoisoned(id);

  const atk = poisoned
    ? (DB.hosts || []).find(
        (h) =>
          h.arpSpoof &&
          h.segId === epSeg(id) &&
          h.id !== id &&
          !isDown(h.id) &&
          !isQuar(h.id) &&
          !arpSpooferStopped(h.id),
      )
    : null;
  return (
    '<div class="mfield"><label>' +
    esc(t("arpTblTitle")) +
    '</label><div style="font-size:11.5px;line-height:1.9">' +
    rows
      .map((r) => {
        const bad = poisoned && r.gw && atk;
        const mac = bad ? nodeMac(atk.id) : r.mac;
        return (
          '<div><span class="mono">' +
          esc(r.ip) +
          '</span> <span style="color:var(--muted)">→</span> <span class="mono">' +
          esc(mac || "?") +
          "</span>" +
          ' <span style="color:var(--muted);font-size:10.5px">' +
          esc(r.who || "") +
          (r.gw ? " · " + esc(t("arpGw")) : "") +
          "</span>" +
          (bad
            ? ' <span style="color:var(--red);font-weight:700;font-size:10.5px">' +
              esc(t("arpTblPoisoned")) +
              "</span>"
            : "") +
          "</div>"
        );
      })
      .join("") +
    '</div><div style="font-size:11px;color:var(--muted);margin-top:6px">' +
    t("arpTblNote") +
    "</div></div>"
  );
}

function natTableHtml(d) {
  if (!isAdvanced()) return "";
  const pf = (d.portForwards || []).filter((r) => r && getNode(r.hostId));
  const sn = (d.staticNat || []).filter((r) => r && getNode(r.hostId));
  const live = [...natLog.values()].filter((x) => x.dev === d.id).slice(0, 8);
  if (!pf.length && !sn.length && !live.length) return "";
  const nm = (id) => {
    const n = getNode(id);
    return n ? esc(n.label || n.name || id) : esc(id);
  };
  let rows = "";
  sn.forEach((r) => {
    rows +=
      '<div><span class="mono">' +
      esc(hostIpAuto(r.hostId) || "?") +
      '</span> <span style="color:var(--muted)">↔</span> <span class="mono">' +
      esc(r.publicIp || "?") +
      '</span> <span style="color:var(--muted);font-size:10.5px">' +
      nm(r.hostId) +
      " · " +
      esc(t("natTblStatic")) +
      "</span></div>";
  });
  pf.forEach((r) => {
    rows +=
      '<div><span class="mono">:' +
      esc(String(r.pubPort)) +
      '</span> <span style="color:var(--muted)">→</span> <span class="mono">' +
      esc(hostIpAuto(r.hostId) || "?") +
      ":" +
      esc(String(r.intPort)) +
      '</span> <span style="color:var(--muted);font-size:10.5px">' +
      nm(r.hostId) +
      " · " +
      esc(t("natTblDnat")) +
      "</span></div>";
  });
  live.forEach((x) => {
    rows +=
      '<div><span class="mono">' +
      esc(x.inside) +
      '</span> <span style="color:var(--muted)">→</span> <span class="mono">' +
      esc(x.outside) +
      '</span> <span style="color:var(--muted);font-size:10.5px">' +
      esc(t("natTblPat")) +
      "</span></div>";
  });
  return (
    '<div class="mfield"><label>' +
    esc(t("natTblTitle")) +
    '</label><div style="font-size:11.5px;line-height:1.9">' +
    rows +
    "</div>" +
    '<div style="font-size:11px;color:var(--muted);margin-top:6px">' +
    t("natTblNote") +
    "</div></div>"
  );
}
function macTableHtml(d, isAp) {
  if (!isAdvanced()) return "";

  const L2PASS = ["l2switch", "l2mgmt", "ap", "hub"];
  const rows = [],
    seen = new Set([d.id]),
    q = [];
  linksOf(d.id).forEach((l) => {
    const nb = l.fromId === d.id ? l.toId : l.fromId;
    if (!seen.has(nb)) {
      seen.add(nb);
      q.push({ id: nb, first: nb });
    }
  });
  while (q.length) {
    const c = q.shift();
    const n = getNode(c.id);
    if (!n) continue;
    if (isHost(c.id)) {
      rows.push({ hostId: c.id, first: c.first });
      continue;
    }
    if (isSegment(c.id)) continue;
    if (isDevice(c.id) && L2PASS.indexOf(n.type) >= 0 && !isInactive(c.id))
      linksOf(c.id).forEach((l) => {
        const nb = l.fromId === c.id ? l.toId : l.fromId;
        if (!seen.has(nb)) {
          seen.add(nb);
          q.push({ id: nb, first: c.first });
        }
      });
  }
  if (!rows.length) return "";
  const lbl = (id) => {
    const n = getNode(id);
    return n ? n.label || n.name || "?" : "?";
  };
  return (
    `<div style="margin-top:14px;font-size:12px;color:var(--muted);font-weight:600">${t("macTblTitle")}${isAp ? " " + "(wireless clients)" : ""}</div>` +
    `<table class="rules-tbl" style="margin-top:6px"><thead><tr><th>MAC</th><th>${t("macTblHost")}</th><th>VLAN</th><th>Port</th></tr></thead><tbody>` +
    rows
      .map((r) => {
        const o = getNode(r.hostId);
        const seg = o && o.segId ? getNode(o.segId) : null;
        const vlan = seg && seg.vlan ? seg.vlan : "—";
        return `<tr><td class="mono">${esc(hostMac(r.hostId) || "")}</td><td>${esc(o ? o.label : "?")}</td><td>${esc(vlan)}</td><td>${esc(lbl(r.first))}</td></tr>`;
      })
      .join("") +
    `</tbody></table><div style="font-size:11px;color:var(--muted);margin-top:5px">${t("macTblNote")}</div>`
  );
}

let _portsPaneRedraw = null,
  _portsPaneDev = null;

function wirePortsPane(redraw, dev) {
  _portsPaneRedraw = redraw;
  _portsPaneDev = dev || null;
  if (dev) wirePortStrip(dev, redraw);
  const det = modalBox.querySelector("#portsAll");
  if (det)
    det.ontoggle = () => {
      _portsAllOpen = det.open;
    };
  const snoop = modalBox.querySelector("#p-snoop");
  if (snoop && dev)
    snoop.onchange = (e) => {
      const nd = getNode(dev.id);
      if (e.target.checked) nd.dhcpSnoop = true;
      else delete nd.dhcpSnoop;
      saveDB();
      window.netRender();
      redraw();
    };
  const dai = modalBox.querySelector("#p-dai");
  if (dai && dev)
    dai.onchange = (e) => {
      const nd = getNode(dev.id);
      if (e.target.checked) nd.dai = true;
      else delete nd.dai;
      saveDB();
      window.netRender();
      redraw();
    };

  const wm = modalBox.querySelector("#wanMode");
  if (wm && dev)
    wm.onchange = (e) => {
      const nd = getNode(dev.id);
      if (e.target.value === "balance") nd.wanMode = "balance";
      else delete nd.wanMode;
      saveDB();
      window.netRender();
      redraw();
    };
  if (dev)
    modalBox.querySelectorAll(".wan-prim").forEach(
      (r) =>
        (r.onchange = (e) => {
          const nd = getNode(dev.id);
          nd.wanPrimary = e.target.value;
          saveDB();
          window.netRender();
          redraw();
        }),
    );

  modalBox.querySelectorAll(".p-off").forEach(
    (sel) =>
      (sel.onchange = (e) => {
        const l = DB.links.find(
          (x) => x.id === e.target.getAttribute("data-lid"),
        );
        if (!l) return;
        if (e.target.value) {
          l.port = Object.assign({}, l.port || {});
          l.port.off = true;
        } else if (l.port) {
          delete l.port.off;
          if (!portCfgMeaningful(l.port)) delete l.port;
        }
        saveDB();
        window.netRender();
        redraw();
      }),
  );

  modalBox.querySelectorAll(".p-mode").forEach(
    (sel) =>
      (sel.onchange = (e) => {
        const l = DB.links.find(
          (x) => x.id === e.target.getAttribute("data-lid"),
        );
        if (!l) return;
        applyPortMode(l, e.target.value);
        saveDB();
        window.netRender();
        redraw();
      }),
  );

  if (dev) {
    modalBox.querySelectorAll(".pf-off").forEach(
      (sel) =>
        (sel.onchange = (e) => {
          const num = +e.target.getAttribute("data-pnum"),
            c = portCfgGet(dev, num);
          if (e.target.value) c.off = true;
          else delete c.off;
          portCfgClean(dev, num);
          saveDB();
          window.netRender();
          redraw();
        }),
    );
  }

  modalBox.querySelectorAll(".p-detail").forEach(
    (b) =>
      (b.onclick = () => {
        if (dev) openPortDlg(dev.id, +b.getAttribute("data-pdlg"));
      }),
  );
}

function applyPortMode(l, m) {
  if (!m) delete l.port;
  else if (m === "access")
    l.port = {
      mode: "access",
      vlan: (l.port && l.port.vlan) || null,
      sec: (l.port && l.port.sec) || null,
    };
  else if (m === "dynamic") l.port = { mode: "dynamic" };
  else l.port = { mode: "trunk", vlans: (l.port && l.port.vlans) || [] };
}

const portDlgBg = $("portDlgBg"),
  portDlg = $("portDlg");
let _portDlgNum = 0,
  _portDlgDev = null;
portDlgBg.addEventListener("pointerdown", (e) => {
  if (e.target === portDlgBg) closePortDlg();
});
function openPortDlg(devId, num) {
  const d = getNode(devId);
  if (!d) return;
  _portDlgDev = d;
  _portDlgNum = num;
  renderPortDlg();
  portDlgBg.classList.add("show");
}
function closePortDlg() {
  const d = _portDlgDev;
  portDlgBg.classList.remove("show");
  portDlg.innerHTML = "";
  _portDlgDev = null;
  _portDlgNum = 0;

  if (_portsPaneRedraw) _portsPaneRedraw();
  else if (d) {
    const wrap = modalBox.querySelector("#mPortStrip");
    if (wrap) {
      wrap.innerHTML = portStripInnerHtml(d);
      wirePortStrip(d);
    }
  }
}

function renderPortDlg() {
  const d = _portDlgDev,
    num = _portDlgNum;
  if (!d) return;
  portDlg.innerHTML = portDlgInnerHtml(d, num);
  wirePortDlg();
}

function portDlgLink(d, num) {
  assignLinkSlots(d);
  return (
    portLinks(d).find((x) => portNumOf(x, d.id) === num) ||
    loopSlotsOf(d)[num] ||
    null
  );
}
function portDlgInnerHtml(d, num) {
  const vs = vlanSegs();

  const isSw = d.type === "l2mgmt" || d.type === "l3switch";
  const canVlan = portVlanCapable(d);
  const l = portDlgLink(d, num);
  const trustOn = isAdvanced() && (d.dhcpSnoop || d.dai);

  const cfg = l ? l.port || {} : (d.portCfg && d.portCfg[num]) || {};
  const off = !!cfg.off;
  const attr = l ? `data-lid="${l.id}"` : `data-pnum="${num}"`;
  const cls = (p) => (l ? p : p.replace(/^p-/, "pf-"));

  let info;
  if (l) {
    const otherId = l.fromId === d.id ? l.toId : l.fromId,
      o = getNode(otherId);
    const isH = isHost(otherId);
    const ip = isH ? hostIpAuto(otherId) : null,
      mac = isH ? hostMac(otherId) : null;
    const seg = isH && o && o.segId ? getNode(o.segId) : null;
    const vlanTxt = seg
      ? seg.vlan
        ? "VLAN " + seg.vlan + " · " + seg.name
        : seg.name
      : "—";
    const spd = l.speed > 0 ? speedLabel(l.speed) : "—";
    const CONN_TYPE = {
      l2switch: "L2 switch",
      l2mgmt: "Managed L2",
      l3switch: "L3 switch",
      router: "Router",
      firewall: "Firewall",
      idsips: "IDS/IPS",
      loadbalancer: "Load balancer",
      vpn: "VPN",
      ap: "Wi-Fi AP",
      hub: "Hub",
    };

    const connType = isH
      ? o
        ? hostKind(o.kind).name
        : "?"
      : isSegment(otherId)
        ? ((o && (o.name || o.label)) || "?") +
          (o && o.isInternet ? " (WAN)" : "")
        : o
          ? CONN_TYPE[o.type] || o.type
          : "?";
    const dupTxt = l.duplex === "half" ? t("lcDuplexHalf") : t("lcDuplexFull");
    const lag = l.lag != null ? l.lag : null;
    info =
      `<div style="display:grid;grid-template-columns:auto 1fr;gap:3px 12px;font-size:12px;color:var(--muted)">` +
      `<span>${t("portConnType")}</span><span style="color:var(--text)">${esc(connType)}</span>` +
      (ip
        ? `<span>${t("portIp")}</span><span class="mono" style="color:var(--text)">${esc(ip)}</span>`
        : "") +
      (mac
        ? `<span>${t("portMac")}</span><span class="mono" style="color:var(--text)">${esc(mac)}</span>`
        : "") +
      `<span>VLAN</span><span style="color:var(--text)">${esc(vlanTxt)}</span>` +
      `<span>${t("portSpeed")}</span><span style="color:var(--text)">${esc(spd)}</span>` +
      `<span>${t("portDuplex")}</span><span style="color:var(--text)">${esc(dupTxt)}</span>` +
      `<span>${t("portCost")}</span><span style="color:var(--text)">${baseLinkCost(l)}</span>` +
      (lag
        ? `<span>LAG</span><span style="color:var(--text)">${esc(lag)}</span>`
        : "") +
      `<span>${t("portStateLabel")}</span><span style="color:${off ? "var(--red)" : "var(--green)"}">${off ? t("portOff") : t("portOn")}</span></div>` +
      `<button type="button" class="btn" id="pdlgLinkProps" data-link="${esc(l.id)}" style="width:100%;margin-top:8px;font-size:12px">${esc(t("ctxLinkCost"))}</button>`;
  } else {
    info =
      `<div style="font-size:12px;color:var(--muted)">${t("portFree")}</div>` +
      `<div style="font-size:11px;color:var(--muted);margin-top:4px">${t("portFreeDlgHint")}</div>`;
  }

  const offSel =
    `<select class="${cls("p-off")}" ${attr} title="${t("portStateLabel")}" style="font-size:12px">` +
    `<option value=""${off ? "" : " selected"}>${t("portOn")}</option><option value="1"${off ? " selected" : ""}>${t("portOff")}</option></select>`;
  let body = `<div class="mfield" style="margin-bottom:12px"><label>${t("portStateLabel")}</label>${offSel}</div>`;

  if (canVlan) {
    const modes = isSw
      ? [
          ["", "— " + t("portModeAll")],
          ["access", "access"],
          ["trunk", "trunk"],
          ["dynamic", "dynamic (DTP)"],
        ]
      : [
          ["", "— " + t("portModeAll")],
          ["access", "access"],
          ["trunk", "trunk"],
        ];
    const modeOpt = modes
      .map(
        (m) =>
          `<option value="${m[0]}"${(cfg.mode || "") === m[0] ? " selected" : ""}>${m[1]}</option>`,
      )
      .join("");
    body += `<div class="mfield" style="margin-bottom:12px"><label>${t("portModeLabel")}</label><select class="${cls("p-mode")}" ${attr}${off ? " disabled" : ""} style="font-size:12px">${modeOpt}</select></div>`;
    let modeCfg = "";
    if (!off && cfg.mode === "dynamic") {
      modeCfg = `<div style="font-size:12px;color:var(--amber)">⚠ ${t("portDynWarn")}</div>`;
    } else if (!off && cfg.mode === "access") {
      modeCfg =
        `<div class="mfield" style="margin-bottom:10px"><label>VLAN</label><select class="${cls("p-vlan")}" ${attr}><option value="">${t("portPickVlan")}</option>${vs.map((s) => `<option value="${s.id}"${cfg.vlan === s.id ? " selected" : ""}>${esc(s.name)}${s.vlan ? " (VLAN " + esc(s.vlan) + ")" : ""}</option>`).join("")}</select></div>` +
        (isSw && isAdvanced()
          ? `<div style="display:flex;flex-wrap:wrap;gap:12px;align-items:center;margin-bottom:6px">` +
            `<label style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--muted)" title="${t("portSecTitle")}">${t("portSecMaxLabel")}<input class="${cls("p-sec")} mono" ${attr} type="number" min="1" placeholder="${t("portSecPh")}" value="${(cfg.sec && cfg.sec.max) || ""}" style="width:80px"></label>` +
            `<label style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--muted)" title="${t("portSecMacTitle")}">${t("portSecMacLabel")}<input class="${cls("p-secmac")} mono" ${attr} placeholder="${t("portSecMacPh")}" value="${esc((cfg.sec && cfg.sec.mac) || "")}" style="width:170px"></label>` +
            `<label style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--muted)" title="${t("portBpduTitle")}"><input type="checkbox" class="${cls("p-bpdu")}" ${attr}${cfg.bpduGuard ? " checked" : ""}>${t("portBpduLabel")}</label>` +
            `<label style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--muted)" title="${t("portDot1xTitle")}"><input type="checkbox" class="${cls("p-dot1x")}" ${attr}${cfg.dot1x ? " checked" : ""}>${t("portDot1xLabel")}</label>` +
            (cfg.dot1x
              ? `<select class="${cls("p-dot1xrad")}" ${attr} title="RADIUS" style="flex:0 1 150px;min-width:0;font-size:12px"><option value="">${t("portDot1xNoRad")}</option>${_radHosts()
                  .map(
                    (h) =>
                      `<option value="${h.id}"${cfg.dot1x.radiusId === h.id ? " selected" : ""}>${esc(h.label || h.id)}</option>`,
                  )
                  .join("")}</select>`
              : "") +
            `</div>`
          : "");
    } else if (!off && cfg.mode === "trunk") {
      modeCfg = `<div class="mfield" style="margin-bottom:6px"><label>${t("portTrunkVlans")}</label><div style="display:flex;flex-wrap:wrap;gap:12px">${vs.map((s) => `<label style="font-size:12px;display:flex;align-items:center;gap:5px"><input type="checkbox" class="${cls("p-tv")}" ${attr} value="${s.id}"${!cfg.vlans || !cfg.vlans.length || cfg.vlans.indexOf(s.id) >= 0 ? " checked" : ""}>${esc(s.name)}</label>`).join("")}</div></div>`;
    }
    if (modeCfg)
      body += `<div class="${l ? "p-cfg" : "pf-cfg"}" style="margin-bottom:12px">${modeCfg}</div>`;
  }

  if (l) {
    assignLinkSlots(d);
    const takenNums = new Set(
      portLinks(d)
        .map((x) => portNumOf(x, d.id))
        .concat(Object.keys(loopSlotsOf(d)).map(Number)),
    );
    const moveOpts = [];
    for (let k = 1; k <= portsOf(d); k++) {
      if (k !== num && takenNums.has(k)) continue;
      const cOff = k !== num && d.portCfg && d.portCfg[k] && d.portCfg[k].off;
      moveOpts.push(
        `<option value="${k}"${k === num ? " selected" : ""}>${portLabelOf(d, k)}${cOff ? " · " + t("portOff") : ""}</option>`,
      );
    }
    if (moveOpts.length > 1)
      body += `<div class="mfield" style="margin-bottom:12px"><label>${t("portMoveLabel")}</label><select class="p-move" data-lid="${l.id}" style="font-size:12px">${moveOpts.join("")}</select></div>`;
  }

  if (l) {
    const curSpeed = l.speed > 0 ? l.speed : 0,
      curDuplex = l.duplex === "half" ? "half" : "full";

    const spList = SPEED_OPTS;
    const spOpts =
      '<option value="0"' +
      (curSpeed ? "" : " selected") +
      ">" +
      esc(t("lcSpeedAuto")) +
      "</option>" +
      spList
        .map(
          (mb) =>
            '<option value="' +
            mb +
            '"' +
            (curSpeed === mb ? " selected" : "") +
            ">" +
            speedLabel(mb) +
            "</option>",
        )
        .join("");
    const dxOpts =
      '<option value="full"' +
      (curDuplex === "full" ? " selected" : "") +
      ">" +
      esc(t("lcDuplexFull")) +
      "</option>" +
      '<option value="half"' +
      (curDuplex === "half" ? " selected" : "") +
      ">" +
      esc(t("lcDuplexHalf")) +
      "</option>";
    body += `<div class="mfield" style="margin-bottom:12px"><label>${t("portSpeed")} · ${t("portDuplex")}</label>
      <div style="display:flex;flex-wrap:wrap;align-items:center;gap:8px">
      <select class="p-speed" data-lid="${l.id}" style="font-size:12px"${off ? " disabled" : ""}>${spOpts}</select>
      <select class="p-duplex" data-lid="${l.id}" style="font-size:12px"${off ? " disabled" : ""}>${dxOpts}</select>
      <span class="p-costview" style="font-size:12px;color:var(--cyan);font-weight:600">${t("portCost")} ${baseLinkCost(l)}</span></div></div>`;
  }

  if (l && trustOn) {
    body +=
      `<div class="mfield" style="margin-bottom:12px"><label>${t("portTrust")}</label>` +
      `<label style="display:flex;align-items:center;gap:8px;font-size:12px;color:${cfg.trust ? "var(--green)" : "var(--muted)"}" title="${t("portTrustTitle")}"><input type="checkbox" class="p-trust" data-lid="${l.id}"${cfg.trust ? " checked" : ""}> ${t("portTrustLong")}</label></div>`;
  }
  const sfpHint = isSfpNum(d, num)
    ? `<div style="font-size:11px;color:var(--cyan);margin-bottom:10px">${t("sfpDlgHint")}</div>`
    : "";
  return (
    `<h2 style="font-family:var(--mono)">${icon("sliders", "ico-a")}${portLabelOf(d, num)} · ${esc(d.label || d.name || "")}</h2>` +
    sfpHint +
    `<div style="border:1px solid var(--line2);border-radius:9px;padding:10px 12px;margin-bottom:14px">${info}</div>` +
    body +
    `<div class="actions"><button class="btn primary" id="pdlgClose">${t("portClose")}</button></div>`
  );
}

function wirePortDlg() {
  const d = _portDlgDev,
    num = _portDlgNum;
  if (!d) return;
  const l = portDlgLink(d, num);
  const q = (s) => portDlg.querySelector(s),
    qa = (s) => portDlg.querySelectorAll(s);
  const closeBtn = q("#pdlgClose");
  if (closeBtn) closeBtn.onclick = closePortDlg;
  const lpBtn = q("#pdlgLinkProps");
  if (lpBtn)
    lpBtn.onclick = () => {
      const id = lpBtn.getAttribute("data-link"),
        dev = _portDlgDev && _portDlgDev.id,
        num = _portDlgNum;
      closePortDlg();
      openLinkCostEditor(id);
      modalCloseHook = () => {
        const d = dev && getNode(dev);
        if (!d) return;
        openDeviceModal(d);
        setTimeout(() => {
          try {
            openPortDlg(dev, num);
          } catch (e) {}
        }, 0);
      };
    };

  const after = (rerender) => {
    saveDB();
    window.netRender();
    if (rerender !== false) renderPortDlg();
  };
  if (l) {
    const lid = l.id;
    const link = () => DB.links.find((x) => x.id === lid);
    const off = q(".p-off");
    if (off)
      off.onchange = (e) => {
        const L = link();
        if (!L) return;
        if (e.target.value) {
          L.port = Object.assign({}, L.port || {});
          L.port.off = true;
        } else if (L.port) {
          delete L.port.off;
          if (!portCfgMeaningful(L.port)) delete L.port;
        }
        after();
      };

    const mv = q(".p-move");
    if (mv)
      mv.onchange = (e) => {
        const L = link();
        if (!L) return;
        const to = parseInt(e.target.value, 10);
        if (movePortSlot(d, L, to)) _portDlgNum = to;
        after();
      };
    const mode = q(".p-mode");
    if (mode)
      mode.onchange = (e) => {
        const L = link();
        if (!L) return;
        applyPortMode(L, e.target.value);
        after();
      };
    const vlan = q(".p-vlan");
    if (vlan)
      vlan.onchange = (e) => {
        const L = link();
        if (L && L.port) L.port.vlan = e.target.value || null;
        after();
      };
    const sec = q(".p-sec");
    if (sec)
      sec.oninput = (e) => {
        const L = link();
        if (L && L.port) {
          const v = parseInt(e.target.value, 10);
          const mac = (L.port.sec && L.port.sec.mac) || null;
          L.port.sec =
            v > 0 || mac
              ? { max: v > 0 ? v : undefined, mac: mac || undefined }
              : null;
        }
        after(false);
      };
    const secmac = q(".p-secmac");
    if (secmac)
      secmac.oninput = (e) => {
        const L = link();
        if (L && L.port) {
          const v = e.target.value.trim();
          if (v) {
            L.port.sec = Object.assign({}, L.port.sec || {}, { mac: v });
          } else if (L.port.sec) {
            delete L.port.sec.mac;
            if (!L.port.sec.max) L.port.sec = null;
          }
        }
        after(false);
      };
    const bg = q(".p-bpdu");
    if (bg)
      bg.onchange = (e) => {
        const L = link();
        if (L && L.port) {
          if (e.target.checked) L.port.bpduGuard = true;
          else delete L.port.bpduGuard;
          after(true);
        }
      };
    const d1x = q(".p-dot1x");
    if (d1x)
      d1x.onchange = (e) => {
        const L = link();
        if (L && L.port) {
          if (e.target.checked) L.port.dot1x = { radiusId: null };
          else delete L.port.dot1x;
          after(true);
        }
      };
    const dr = q(".p-dot1xrad");
    if (dr)
      dr.onchange = (e) => {
        const L = link();
        if (L && L.port && L.port.dot1x) {
          L.port.dot1x.radiusId = e.target.value || null;
          after(false);
        }
      };
    qa(".p-tv").forEach(
      (cb) =>
        (cb.onchange = () => {
          const L = link();
          if (!L || !L.port) return;
          L.port.vlans = [...qa(".p-tv")]
            .filter((c) => c.checked)
            .map((c) => c.value);
          after(false);
        }),
    );
    const applySpdDx = () => {
      const L = link();
      if (!L) return;
      const mb = +(q(".p-speed") || {}).value || 0;
      if (mb > 0) L.speed = mb;
      else delete L.speed;
      const dx = (q(".p-duplex") || {}).value;
      if (dx === "half") L.duplex = "half";
      else delete L.duplex;
      after();
    };
    const sp = q(".p-speed");
    if (sp) sp.onchange = applySpdDx;
    const dx = q(".p-duplex");
    if (dx) dx.onchange = applySpdDx;
    const tr = q(".p-trust");
    if (tr)
      tr.onchange = (e) => {
        const L = link();
        if (!L) return;
        L.port = Object.assign({}, L.port || {});
        if (e.target.checked) L.port.trust = true;
        else delete L.port.trust;
        if (!portCfgMeaningful(L.port)) delete L.port;
        after();
      };
  } else {
    const off = q(".pf-off");
    if (off)
      off.onchange = (e) => {
        const c = portCfgGet(d, num);
        if (e.target.value) c.off = true;
        else delete c.off;
        portCfgClean(d, num);
        after();
      };
    const mode = q(".pf-mode");
    if (mode)
      mode.onchange = (e) => {
        const c = portCfgGet(d, num),
          m = e.target.value;
        delete c.mode;
        delete c.vlan;
        delete c.vlans;
        delete c.sec;
        if (m === "access") c.mode = "access";
        else if (m === "dynamic") c.mode = "dynamic";
        else if (m === "trunk") {
          c.mode = "trunk";
          c.vlans = [];
        }
        portCfgClean(d, num);
        after();
      };
    const vlan = q(".pf-vlan");
    if (vlan)
      vlan.onchange = (e) => {
        const c = portCfgGet(d, num);
        if (e.target.value) c.vlan = e.target.value;
        else delete c.vlan;
        portCfgClean(d, num);
        after();
      };
    const sec = q(".pf-sec");
    if (sec)
      sec.oninput = (e) => {
        const c = portCfgGet(d, num),
          v = parseInt(e.target.value, 10),
          mac = (c.sec && c.sec.mac) || null;
        c.sec =
          v > 0 || mac
            ? { max: v > 0 ? v : undefined, mac: mac || undefined }
            : undefined;
        if (!c.sec) delete c.sec;
        portCfgClean(d, num);
        after(false);
      };
    const secmac = q(".pf-secmac");
    if (secmac)
      secmac.oninput = (e) => {
        const c = portCfgGet(d, num),
          v = e.target.value.trim();
        if (v) c.sec = Object.assign({}, c.sec || {}, { mac: v });
        else if (c.sec) {
          delete c.sec.mac;
          if (!c.sec.max) delete c.sec;
        }
        portCfgClean(d, num);
        after(false);
      };
    qa(".pf-tv").forEach(
      (cb) =>
        (cb.onchange = () => {
          const c = portCfgGet(d, num);
          c.vlans = [...qa(".pf-tv")]
            .filter((x) => x.checked)
            .map((x) => x.value);
          portCfgClean(d, num);
          after(false);
        }),
    );
  }
}

function routesPaneHtml(work, d) {
  const conn = DB.segments.filter(
    (s) =>
      s &&
      !s.isInternet &&
      s.subnet &&
      (s.gwId === d.id || neighborsOf(d.id).indexOf(s.id) >= 0),
  );
  const connList = conn.length
    ? conn
        .map(
          (s) =>
            `<li><span class="mono">${esc(s.subnet)}</span> <span style="color:var(--muted)">— ${esc(s.name)} (${"directly connected"})</span></li>`,
        )
        .join("")
    : '<li style="color:var(--muted)">' +
      "no directly connected network" +
      "</li>";
  const nh = neighborsOf(d.id).map(getNode).filter(Boolean);
  const nhOpts = (sel) =>
    '<option value="">' +
    "— next hop" +
    "</option>" +
    nh
      .map(
        (n) =>
          `<option value="${n.id}"${sel === n.id ? " selected" : ""}>${esc(n.label || n.name)}</option>`,
      )
      .join("");
  const rows = (work.routes || [])
    .map(
      (r, i) => `<tr data-rri="${i}">
    <td><input class="rt-dest mono" value="${esc(r.dest || "")}" placeholder="10.0.20.0/24" style="min-width:130px"></td>
    <td><select class="rt-via">${nhOpts(r.via)}</select></td>
    <td style="width:40px"><button class="rt-del" title="${t("aclDel")}">✕</button></td></tr>`,
    )
    .join("");
  const isFw = d.type === "firewall";
  const proto = isFw
    ? work.manualRouting
      ? "static"
      : "ospf"
    : deviceProto(work);
  const showStatic = isFw || proto === "static";
  const connBlock = `<div style="font-size:12px;color:var(--muted);font-weight:600;margin-bottom:4px">${"Directly connected networks"}</div><ul class="zone-list" style="margin-bottom:12px">${connList}</ul>`;
  const staticBlock =
    `<div style="font-size:12px;color:var(--muted);font-weight:600;margin-bottom:4px">${"Static routes"}</div>` +
    `<table class="rules-tbl"><thead><tr><th>${"Destination network"}</th><th>${"Next hop"}</th><th></th></tr></thead><tbody id="rtBody">${rows || '<tr><td colspan="3" style="color:var(--muted);padding:8px 4px">' + "no static routes" + "</td></tr>"}</tbody></table>` +
    `<button class="btn" id="rtAdd" style="margin-top:8px">${"+ Add route"}</button>`;
  let header;
  if (isFw) {
    header =
      `<label class="toggle-row" style="margin:0 0 8px"><input type="checkbox" id="mManualRt"${work.manualRouting ? " checked" : ""}><span>${"Manual static routing"}</span></label>` +
      `<div style="font-size:11px;color:var(--muted);margin:-2px 0 12px">${"On = only directly connected networks + explicit static routes are reachable (0.0.0.0/0 = default). Off = automatic routing."}</div>`;
  } else {
    const opts = [
      ["static", "rpProtoStatic"],
      ["rip", "rpProtoRip"],
      ["ospf", "rpProtoOspf"],
      ["eigrp", "rpProtoEigrp"],
    ]
      .map(
        (o) =>
          `<option value="${o[0]}"${proto === o[0] ? " selected" : ""}>${t(o[1])}</option>`,
      )
      .join("");
    header =
      `<div class="mfield" style="margin-bottom:6px"><label>${t("rpProtoLabel")}</label><select id="mRoutingProto">${opts}</select></div>` +
      `<div style="font-size:11px;color:var(--muted);margin:-2px 0 12px">${t("rpProtoHint" + proto.charAt(0).toUpperCase() + proto.slice(1))}</div>`;
  }

  const dyn = isFw ? !work.manualRouting : proto !== "static";
  const learnedPart = dyn
    ? `<div id="rtLearned" data-dev="${d.id}" style="margin-top:12px"></div>`
    : `<div style="font-size:12px;color:var(--muted);margin-top:12px">${"Static mode – the device doesn't learn routes on its own."}</div>`;
  return (
    header +
    linkLabelsChkHtml() +
    connBlock +
    (showStatic
      ? staticBlock
      : `<div style="font-size:12px;color:var(--muted)">${"The router <b>learns routes dynamically</b> – no manual table is entered (you see metric and AD in the path test)."}</div>`) +
    learnedPart
  );
}

function fillLearnedRoutes(devId) {
  const box = document.getElementById("rtLearned");
  if (
    !box ||
    box.getAttribute("data-filled") ||
    box.getAttribute("data-dev") !== devId
  )
    return;
  const d = getNode(devId);
  if (!d) return;
  box.setAttribute("data-filled", "1");

  const prev = {},
    seen = new Set([d.id]),
    q = [d.id];
  while (q.length) {
    const c = q.shift();
    for (const l of linksOf(c)) {
      const nb = l.fromId === c ? l.toId : l.fromId;
      if (seen.has(nb) || isHost(nb)) continue;
      if (isDevice(nb) && isInactive(nb)) continue;
      if (linkDown(l)) continue;
      seen.add(nb);
      prev[nb] = c;
      q.push(nb);
    }
  }
  const conn = new Set(
    DB.segments
      .filter(
        (s) =>
          s &&
          !s.isInternet &&
          s.subnet &&
          (s.gwId === d.id || neighborsOf(d.id).indexOf(s.id) >= 0),
      )
      .map((s) => s.id),
  );
  const nextHop = (segId) => {
    const path = [];
    let k = segId;
    while (k !== undefined && k !== d.id) {
      path.unshift(k);
      k = prev[k];
    }
    let first = null;
    for (const id of path) {
      const n = getNode(id);
      if (n && isDevice(id)) {
        if (!first) first = n;
        if (L3TYPES.indexOf(n.type) >= 0) return n;
      }
    }
    return first;
  };
  const rows = [];
  DB.segments.forEach((s) => {
    if (!s || conn.has(s.id) || !seen.has(s.id)) return;
    const isInet = s.isInternet || s.subnet === "0.0.0.0/0";
    if (!isInet && !s.subnet) return;
    const nh = nextHop(s.id),
      rs = routeSourceOf(d, s.id, isInet);
    rows.push(
      `<li><span class="mono">${esc(isInet ? "0.0.0.0/0" : s.subnet)}</span> <span style="color:var(--muted)">— ${esc(s.name)}${isInet ? " (" + "default" + ")" : ""} · via ${esc(nh ? nh.label || nh.name : "—")} (${esc(rs.proto)}, AD ${rs.ad})</span></li>`,
    );
  });
  box.innerHTML =
    `<div style="font-size:12px;color:var(--muted);font-weight:600;margin-bottom:4px">${"Learned routes (by protocol)"}</div>` +
    `<ul class="zone-list" style="margin-bottom:12px">${rows.join("") || '<li style="color:var(--muted)">' + "no learned routes" + "</li>"}</ul>`;
}

function stpPriFieldHtml(o) {
  var v = typeof o.stpPriority === "number" ? o.stpPriority : "";
  return (
    '<div class="mfield"><label>' +
    "STP priority (bridge priority)" +
    "</label>" +
    '<input id="mStpPrio" class="mono" type="number" min="0" max="61440" step="4096" value="' +
    esc(String(v)) +
    '" placeholder="32768"></div>' +
    '<div class="default-pol" style="font-size:11px">' +
    "Lower value = more likely to become the <b>root bridge</b>. Step 4096, range 0–61440, default 32768. Empty = default." +
    "</div>"
  );
}
function normStpPri(raw) {
  if (raw == null) return null;
  var s = String(raw).trim();
  if (s === "") return null;
  var n = parseInt(s, 10);
  if (isNaN(n)) return null;
  n = Math.max(0, Math.min(61440, n));
  return Math.round(n / 4096) * 4096;
}
function applyStpPri(d, raw) {
  var n = normStpPri(raw);
  if (n == null) delete d.stpPriority;
  else d.stpPriority = n;
}

function stpModeFieldHtml(o) {
  var m = stpModeOf(o);
  var opt = function (v, lab) {
    return (
      '<option value="' +
      v +
      '"' +
      (m === v ? " selected" : "") +
      ">" +
      lab +
      "</option>"
    );
  };
  return (
    '<div class="mfield"><label>' +
    t("stpModeLabel") +
    "</label>" +
    '<select id="mStpMode">' +
    opt("rstp", t("stpModeRstp")) +
    opt("stp", t("stpModeStp")) +
    opt("off", t("stpModeOff")) +
    "</select></div>" +
    linkLabelsChkHtml()
  );
}

function applyStpMode(d, val) {
  if (!val || val === "rstp") delete d.stpMode;
  else d.stpMode = val;
}
function openDeviceModal(d) {
  modalCloseHook = null;
  if (d.type === "l2switch" || d.type === "hub") {
    const isHub = d.type === "hub";
    openModal(`
      <h2>⬡ ${isHub ? "Hub" : "L2 switch"}: ${esc(d.label)}</h2>
      <div class="mfield"><label>${t("devModalName")}</label><input id="mName" value="${esc(d.label)}"></div>
      ${isHub || !isAdvanced() ? "" : stpPriFieldHtml(d)}
      ${isHub || !isAdvanced() ? "" : stpModeFieldHtml(d)}
      ${portStripHtml(d)}
      <div class="default-pol">${isHub ? t("devHubInfo") : t("devL2Info")}</div>
      ${isHub ? "" : macTableHtml(d)}
      <div class="actions">
        <button class="btn" id="mCancel">${t("cancel")}</button>
        <button class="btn primary" id="mSave">${t("save")}</button>
      </div>`);
    wirePortStrip(d);
    $("mCancel").onclick = closeModal;
    $("mSave").onclick = () => {
      d.label = $("mName").value.trim() || d.label;
      var sp = document.getElementById("mStpPrio");
      if (sp) applyStpPri(d, sp.value);
      var sm = document.getElementById("mStpMode");
      if (sm) applyStpMode(d, sm.value);
      saveDB();
      window.netRender();
      refreshAll();
      closeModal();
      setStatus(t("stSaved"));
    };
    return;
  }
  if (d.type === "ap") {
    const ed = wifiSsidEditor(d.ssids, d.wifiOn, d.wlTx);

    let up = apUplink(d),
      repSsid = (d.repSsid || "").trim();
    const hasCable = apHasCable(d);
    const repOpts = () => {
      const out = [];
      DB.devices.forEach((o) => {
        if (o.id === d.id || !apWifiCapable(o)) return;
        if (o.type === "ap" && apUplink(o) === "repeater") return;
        (o.ssids || []).forEach((s) => {
          const nm = (s.name || "").trim();
          if (
            nm &&
            s.on !== false &&
            s.segId != null &&
            getNode(s.segId) &&
            out.indexOf(nm) < 0
          )
            out.push(nm);
        });
      });
      return out;
    };
    const bhStatus = () => {
      if (hasCable)
        return (
          '<span style="color:var(--green);font-weight:600">' +
          "The AP is connected by cable." +
          "</span>" +
          (up !== "cable"
            ? ' <span style="color:var(--muted)">' +
              "Cable takes precedence – mesh/repeater is used only after the cable is disconnected." +
              "</span>"
            : "")
        );
      if (up === "cable")
        return (
          '<span style="color:var(--red);font-weight:700">' +
          "The AP has no cable – connect it, or pick mesh/repeater." +
          "</span>"
        );
      const oU = d.uplink,
        oR = d.repSsid;
      d.uplink = up;
      d.repSsid = repSsid;
      let par = null;
      try {
        const w = bhComputeWants();
        par = w[d.id] ? getNode(w[d.id]) : null;
      } finally {
        if (oU === undefined) delete d.uplink;
        else d.uplink = oU;
        if (oR === undefined) delete d.repSsid;
        else d.repSsid = oR;
      }
      return par
        ? '<span style="color:var(--cyan);font-weight:600">' +
            "Connected over the air to: " +
            esc(par.label || "?") +
            "</span>"
        : '<span style="color:var(--red);font-weight:700">' +
            "No uplink – this AP's clients have no path into the network." +
            "</span>";
    };
    const upHtml = () => {
      const dis = hasCable ? " disabled" : "";
      const radio = (v, lab) =>
        '<label class="toggle-row" style="margin:0 14px 0 0;display:inline-flex"><input type="radio" name="apUpMode" value="' +
        v +
        '"' +
        (up === v ? " checked" : "") +
        (v === "cable" ? "" : dis) +
        "><span>" +
        lab +
        "</span></label>";
      const HINTS = {
        cable: "The AP is connected by cable into the wired network (current behavior).",
        mesh: "Cableless, the AP connects over the air to the nearest AP with the same enabled SSID (that itself has an uplink).",
        repeater: "Plain repeater: it repeats the chosen SSID of the nearest AP. It has no SSID of its own and <b>halves throughput</b>.",
      };
      let h =
        '<div class="mfield"><label>' +
        "Uplink" +
        '</label><div style="margin:2px 0 6px">' +
        radio("cable", "Cable") +
        radio("mesh", "Wireless mesh") +
        radio("repeater", "Repeater") +
        "</div>" +
        '<div style="font-size:11.5px;color:var(--muted);line-height:1.5;margin-bottom:6px">' +
        HINTS[up] +
        (hasCable && up === "cable"
          ? " " +
            "(Mesh/repeater are available only when the AP has no cable.)"
          : "") +
        "</div>";
      if (up === "repeater") {
        const opts = repOpts();
        h +=
          '<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px"><span style="font-size:12px;color:var(--txt);font-weight:600">' +
          "Repeated SSID" +
          "</span>" +
          (opts.length
            ? '<select id="apRepSsid" style="flex:1 1 auto;min-width:0">' +
              opts
                .map(
                  (nm) =>
                    '<option value="' +
                    esc(nm) +
                    '"' +
                    (repSsid === nm ? " selected" : "") +
                    ">" +
                    esc(nm) +
                    "</option>",
                )
                .join("") +
              "</select>"
            : '<span style="font-size:11.5px;color:var(--red)">' +
              "There is no enabled SSID in the topology to repeat." +
              "</span>") +
          "</div>";
        if (opts.length && (!repSsid || opts.indexOf(repSsid) < 0))
          repSsid = opts[0];
      }
      h +=
        '<div id="apBhState" style="font-size:12px">' +
        bhStatus() +
        "</div></div>";
      return h;
    };
    const wireUp = () => {
      modalBox.querySelectorAll('input[name="apUpMode"]').forEach(
        (r) =>
          (r.onchange = () => {
            up = r.value;
            redrawUp();
          }),
      );
      const rs = $("apRepSsid");
      if (rs)
        rs.onchange = () => {
          repSsid = rs.value;
          const st = $("apBhState");
          if (st) st.innerHTML = bhStatus();
        };
      const wrap = $("apSsidWrap");
      if (wrap) wrap.style.display = up === "repeater" ? "none" : "";
    };
    const redrawUp = () => {
      const sec = $("apUplinkSec");
      if (sec) {
        sec.innerHTML = upHtml();
        wireUp();
      }
    };
    openModal(
      "<h2>" +
        icon("layers", "ico-a") +
        "Wi-Fi AP: " +
        esc(d.label) +
        "</h2>" +
        '<div class="mfield"><label>' +
        t("devModalName") +
        '</label><input id="mName" value="' +
        esc(d.label) +
        '"></div>' +
        '<div class="default-pol">' +
        "The AP is a <b>layer-2 bridge</b>: it bridges wireless clients into the wired LAN. It can broadcast <b>multiple SSIDs</b> and map each to a different <b>network/VLAN</b>. The client then belongs to that VLAN – pick the same network on the host. The uplink to the switch is a <b>trunk</b> carrying those VLANs." +
        "</div>" +
        portStripHtml(d) +
        '<div id="apUplinkSec">' +
        upHtml() +
        "</div>" +
        '<div id="apSsidWrap"' +
        (up === "repeater" ? ' style="display:none"' : "") +
        ">" +
        ed.html() +
        "</div>" +
        macTableHtml(d, true) +
        '<div class="actions"><button class="btn" id="mCancel">' +
        t("cancel") +
        '</button><button class="btn primary" id="mSave">' +
        t("save") +
        "</button></div>",
    );
    wirePortStrip(d);
    ed.wire();
    wireUp();
    $("mCancel").onclick = closeModal;
    $("mSave").onclick = () => {
      d.label = $("mName").value.trim() || d.label;
      const v = ed.value();
      d.ssids = v.ssids;
      d.wifiOn = v.wifiOn;
      d.wlTx = v.wlTx;
      if (up === "cable") delete d.uplink;
      else d.uplink = up;
      if (up === "repeater" && repSsid) d.repSsid = repSsid;
      else delete d.repSsid;
      reconcileWifiClients();
      saveDB();
      window.netRender();
      refreshAll();
      closeModal();
      setStatus(t("stSaved"));
    };
    return;
  }
  if (d.type === "vpn") {
    openModal(`
      <h2>${icon("lock", "ico-a")}${t("nVpnGw")}: ${esc(d.label)}</h2>
      <div class="mfield"><label>${t("devModalName2")}</label><input id="mName" value="${esc(d.label)}"></div>
      ${portStripHtml(d)}
      <div class="default-pol">${t("devVpnInfo")}</div>
      <div class="actions"><button class="btn" id="mCancel">${t("cancel")}</button><button class="btn primary" id="mSave">${t("save")}</button></div>`);
    wirePortStrip(d);
    $("mCancel").onclick = closeModal;
    $("mSave").onclick = () => {
      d.label = $("mName").value.trim() || d.label;
      saveDB();
      window.netRender();
      refreshAll();
      closeModal();
      setStatus(t("stSaved"));
    };
    return;
  }
  if (d.type === "loadbalancer") {
    const autoPool = lbBackends({ id: d.id, vipPorts: d.vipPorts || "" }).map(
      (h) => h.id,
    );
    const work = {
      label: d.label,
      vipPorts: d.vipPorts || "",
      algorithm: d.algorithm || "rr",
      lbWeights: Object.assign({}, d.lbWeights || {}),
      pool: Array.isArray(d.pool) ? d.pool.slice() : autoPool,
    };
    const ALGO = [
      ["rr", t("lbRR")],
      ["leastconn", t("lbLeastConn")],
      ["weighted", t("lbWeighted")],
      ["srcip", t("lbSrcIP")],
    ];
    const draw = () => {
      const vip = parsePortList(work.vipPorts);
      const servers = lbCandidates(d);
      const showW = work.algorithm === "weighted";
      const rows = servers.length
        ? servers
            .map((h) => {
              const on = work.pool.indexOf(h.id) >= 0;
              const onVip =
                !vip.length ||
                (h.services || []).some((p) => vip.indexOf(p) >= 0);
              const seg = h.segId && getNode(h.segId);
              return `<li style="align-items:center"><label style="display:flex;align-items:center;gap:8px;flex:1;cursor:pointer;margin:0">
          <input type="checkbox" class="lb-pick" data-h="${h.id}"${on ? " checked" : ""}>
          <span style="flex:1">${esc(h.label)} <span style="color:var(--muted);font-size:11px">${seg ? esc(seg.name) + " · " : ""}${(h.services || []).join(", ") || "—"}${on && !onVip ? ' <b style="color:var(--amber)">⚠ ' + t("devLbNoVip") + "</b>" : ""}</span></span></label>
          ${showW && on ? `<input class="lb-w mono" data-h="${h.id}" type="number" min="1" value="${work.lbWeights[h.id] || 1}" style="flex:0 0 50px" title="${t("lbWeightTitle")}">` : ""}</li>`;
            })
            .join("")
        : '<li style="color:var(--muted)">' + t("devLbNoServers") + "</li>";
      const algoOpts = ALGO.map(
        (o) =>
          `<option value="${o[0]}"${work.algorithm === o[0] ? " selected" : ""}>${o[1]}</option>`,
      ).join("");
      const cnt = work.pool.filter((id) => {
        const h = getNode(id);
        return (
          h &&
          (!vip.length || (h.services || []).some((p) => vip.indexOf(p) >= 0))
        );
      }).length;
      modalBox.innerHTML = `
        <h2>${icon("balance", "ico-a")}Load balancer: ${esc(work.label)}</h2>
        <div class="mfield"><label>${t("devModalName2")}</label><input id="mName" value="${esc(work.label)}"></div>
        ${portStripHtml(d)}
        <div class="mfield"><label>${t("devLbVip")}</label><input id="mVip" class="mono" value="${esc(work.vipPorts)}" placeholder="443"></div>
        <div class="mfield"><label>${t("devLbAlgo")}</label><select id="mAlgo">${algoOpts}</select></div>
        <label style="font-size:12px;color:var(--muted);font-weight:600">${t("devLbPool")} ${cnt}</label>
        <ul class="zone-list" style="max-height:230px;overflow:auto">${rows}</ul>
        <div class="default-pol">${tf("devLbInfo", esc(work.label))}</div>
        <div class="actions"><button class="btn" id="mCancel">${t("cancel")}</button><button class="btn primary" id="mSave">${t("save")}</button></div>`;
      wirePortStrip(d);
      $("mName").oninput = (e) => (work.label = e.target.value);
      $("mVip").oninput = (e) => (work.vipPorts = e.target.value);
      $("mVip").onchange = draw;
      $("mAlgo").onchange = (e) => {
        work.algorithm = e.target.value;
        draw();
      };
      modalBox.querySelectorAll(".lb-pick").forEach(
        (c) =>
          (c.onchange = (e) => {
            const id = e.target.getAttribute("data-h");
            if (e.target.checked) {
              if (work.pool.indexOf(id) < 0) work.pool.push(id);
            } else work.pool = work.pool.filter((x) => x !== id);
            draw();
          }),
      );
      modalBox.querySelectorAll(".lb-w").forEach(
        (i) =>
          (i.oninput = (e) => {
            work.lbWeights[e.target.getAttribute("data-h")] = Math.max(
              1,
              parseInt(e.target.value, 10) || 1,
            );
          }),
      );
      $("mCancel").onclick = closeModal;
      $("mSave").onclick = () => {
        d.label = work.label.trim() || d.label;
        d.vipPorts = work.vipPorts.trim();
        d.algorithm = work.algorithm;
        d.lbWeights = work.lbWeights;
        if (!work.pool.length && !autoPool.length) delete d.pool;
        else d.pool = work.pool.slice();
        saveDB();
        window.netRender();
        refreshAll();
        closeModal();
        setStatus(t("stLbSaved"));
      };
    };
    draw();
    modalBg.classList.add("show");
    return;
  }
  if (d.type === "waf") {
    openModal(`
      <h2>${icon("shield", "ico-a")}${t("nWafTitle")}: ${esc(d.label)}</h2>
      <div class="mfield"><label>${t("devModalName2")}</label><input id="mName" value="${esc(d.label)}"></div>
      ${portStripHtml(d)}
      <div class="default-pol">${t("wafInfo")}</div>
      <div class="actions"><button class="btn" id="mCancel">${t("cancel")}</button><button class="btn primary" id="mSave">${t("save")}</button></div>`);
    wirePortStrip(d);
    $("mCancel").onclick = closeModal;
    $("mSave").onclick = () => {
      d.label = $("mName").value.trim() || d.label;
      saveDB();
      window.netRender();
      refreshAll();
      closeModal();
      setStatus(t("stSaved"));
    };
    return;
  }
  if (d.type === "datadiode") {
    const work = JSON.parse(JSON.stringify(d));
    const draw = () => {
      const nbs = neighborsOf(d.id).map((id) => ({
        id: id,
        label: (getNode(id) && (getNode(id).label || getNode(id).name)) || id,
      }));
      const opts = nbs
        .map(
          (n) =>
            `<option value="${n.id}"${work.outId === n.id ? " selected" : ""}>${esc(n.label)}</option>`,
        )
        .join("");
      modalBox.innerHTML = `
        <h2>${icon("share", "ico-a")}Data diode: ${esc(work.label)}</h2>
        <div class="mfield"><label>${t("devModalName2")}</label><input id="mName" value="${esc(work.label)}"></div>
        <div class="default-pol" style="margin-bottom:12px">${t("diodeInfo")}</div>
        ${
          nbs.length >= 2
            ? `<div class="mfield"><label>${t("diodeOut")}</label>
          <select id="mDiodeOut"><option value="">${t("diodeOutNone")}</option>${opts}</select></div>
          <div style="font-size:11px;color:var(--muted)">${t("diodeOutHint")}</div>`
            : `<div style="font-size:12px;color:var(--amber)">${t("diodeNeedLinks")}</div>`
        }
        <div class="actions"><button class="btn" id="mCancel">${t("cancel")}</button><button class="btn primary" id="mSave">${t("save")}</button></div>`;
      $("mName").oninput = (e) => (work.label = e.target.value);
      if ($("mDiodeOut"))
        $("mDiodeOut").onchange = (e) => (work.outId = e.target.value || null);
      $("mCancel").onclick = closeModal;
      $("mSave").onclick = () => {
        d.label = work.label.trim() || d.label;
        d.outId = work.outId || null;
        saveDB();
        window.netRender();
        refreshAll();
        closeModal();
        setStatus(t("stSaved"));
      };
    };
    draw();
    modalBg.classList.add("show");
    return;
  }
  if (d.type === "idsips") {
    if (!Array.isArray(d.signatures)) d.signatures = [];
    const work = JSON.parse(JSON.stringify(d));
    if (!work.mode) work.mode = "ips";
    if (!Array.isArray(work.signatures)) work.signatures = [];
    const draw = () => {
      const adv = isAdvanced();
      const sigs = work.signatures;
      const enabledCat = (id) => sigs.some((s) => s.content === id);
      const chips = IPS_THREATS.map((x) => {
        const on = enabledCat(x.id);
        const c = SEV_COLOR[x.sev] || "#7dd3fc";
        return `<button type="button" class="ips-chip${on ? " on" : ""}" data-cat="${x.id}" style="${on ? "border-color:" + c + ";color:" + c + ";background:" + c + "22" : ""}"><span class="ips-dot" style="background:${c}"></span>${esc(threatLabel(x.id))} <em>${esc(sevLabel(x.sev))}</em></button>`;
      }).join("");
      const patIdx = sigs
        .map((s, i) => ({ s: s, i: i }))
        .filter((o) => o.s.pattern !== undefined && o.s.content == null);
      const patRows = patIdx
        .map(
          (o) => `<tr data-si="${o.i}">
        <td><input class="s-label" value="${esc(o.s.label || "")}" placeholder="${t("sigDescPh")}"></td>
        <td><input class="s-pattern mono" value="${esc(o.s.pattern || "")}" placeholder="OR 1=1" style="min-width:150px"></td>
        <td style="width:30px;text-align:center"><input type="checkbox" class="s-rx"${o.s.isRegex ? " checked" : ""} title="regex"></td>
        <td class="ops" style="width:28px"><button class="del" title="${t("aclDel")}">✕</button></td></tr>`,
        )
        .join("");
      const portIdx = sigs
        .map((s, i) => ({ s: s, i: i }))
        .filter((o) => o.s.pattern === undefined && o.s.content == null);
      const portRows = portIdx
        .map(
          (o) => `<tr data-si="${o.i}">
        <td><input class="s-label" value="${esc(o.s.label || "")}" placeholder="${t("sigDescPh")}"></td>
        <td><select class="s-proto">${["ip", "tcp", "udp", "icmp"].map((p) => `<option value="${p}"${o.s.proto === p ? " selected" : ""}>${p}</option>`).join("")}</select></td>
        <td><select class="s-portop">${["any", "eq", "range"].map((p) => `<option value="${p}"${o.s.portOp === p ? " selected" : ""}>${p}</option>`).join("")}</select></td>
        <td style="width:58px"><input class="s-port mono" type="number" value="${o.s.port ?? ""}" ${o.s.portOp === "any" ? "disabled" : ""}></td>
        <td style="width:58px"><input class="s-port2 mono" type="number" value="${o.s.port2 ?? ""}" ${o.s.portOp === "range" ? "" : "disabled"}></td>
        <td class="ops" style="width:28px"><button class="del" title="${t("aclDel")}">✕</button></td></tr>`,
        )
        .join("");
      modalBox.innerHTML = `
        <h2>${icon("shield", "ico-a")}IDS / IPS: ${esc(work.label)}</h2>
        <div class="mfield"><label>${t("devIpsName")}</label><input id="mName" value="${esc(work.label)}"></div>
        ${isAdvanced() ? `<div class="mfield" style="margin-bottom:12px;font-size:12px;color:var(--muted)">${t("ipsPortsNote")}</div>` : ""}
        <div class="mfield"><label>${t("devIpsMode")}</label>
          <div class="mode2"><button type="button" id="mIps" class="${work.mode === "ips" ? "on" : ""}">${t("ipsBtnInline")}</button><button type="button" id="mIds" class="${work.mode === "ids" ? "on" : ""}">${t("idsBtnPassive")}</button></div>
        </div>
        <div class="default-pol" style="margin-bottom:12px">${work.mode === "ips" ? t("ipsInlineMode") : t("idsPassiveMode")} ${t("ipsNotFw")}</div>
        <div class="mfield" style="margin-bottom:12px">
          <label class="toggle-row" style="margin:2px 0 8px;font-size:12.5px"><input type="checkbox" id="mTlsIns"${work.tlsInspect ? " checked" : ""}> ${t("ipsTlsLabel")}</label>
          <div style="font-size:11px;color:var(--muted);margin-top:4px">${t("ipsTlsHint")}</div>
        </div>
        <label style="font-size:12px;color:var(--muted);font-weight:600">${t("ipsRulesetH")}</label>
        <div style="font-size:11px;color:var(--muted);margin:2px 0 7px">${t("ipsRulesetHint")}</div>
        <div class="ips-chips">${chips}</div>
        ${
          adv
            ? `
        <label style="font-size:12px;color:var(--muted);font-weight:600">${t("ipsCustomH")}</label>
        <div style="font-size:11px;color:var(--muted);margin:2px 0 6px">${t("ipsCustomHint")}</div>
        <table class="rules-tbl"><thead><tr><th>${t("sigColDesc")}</th><th>${t("ipsColPattern")}</th><th title="regex">rx</th><th></th></tr></thead>
          <tbody id="patBody">${patRows || '<tr><td colspan="4" style="color:var(--muted);padding:8px 4px">' + t("ipsNoCustom") + "</td></tr>"}</tbody></table>
        <div style="display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap"><button class="btn" id="addPattern">${t("ipsAddPattern")}</button><button class="btn" id="addPatterns">${t("ipsAddExamples")}</button></div>
        <label style="font-size:12px;color:var(--muted);font-weight:600">${t("ipsPortH")}</label>
        <div style="font-size:11px;color:var(--muted);margin:2px 0 6px">${t("ipsPortHint")}</div>
        <table class="rules-tbl"><thead><tr><th>${t("sigColDesc")}</th><th>${t("fwColProto")}</th><th>${t("fwColPortOp")}</th><th>${t("fwColPort")}</th><th>${t("fwColPort2")}</th><th></th></tr></thead>
          <tbody id="portBody">${portRows || '<tr><td colspan="6" style="color:var(--muted);padding:8px 4px">' + t("ipsNoPort") + "</td></tr>"}</tbody></table>
        <div style="display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap"><button class="btn" id="addPort">${t("ipsAddPort")}</button><button class="btn" id="addInsecure">${t("devIpsAddInsecure")}</button></div>`
            : ""
        }
        <div class="actions"><button class="btn" id="mCancel">${t("cancel")}</button><button class="btn primary" id="mSave">${t("save")}</button></div>`;
      $("mName").oninput = (e) => (work.label = e.target.value);
      $("mIps").onclick = () => {
        work.mode = "ips";
        draw();
      };
      $("mIds").onclick = () => {
        work.mode = "ids";
        draw();
      };
      if ($("mTlsIns"))
        $("mTlsIns").onchange = (e) => {
          work.tlsInspect = e.target.checked;
        };
      modalBox.querySelectorAll(".ips-chip").forEach(
        (b) =>
          (b.onclick = () => {
            const cat = b.getAttribute("data-cat");
            if (enabledCat(cat))
              work.signatures = work.signatures.filter(
                (s) => s.content !== cat,
              );
            else
              work.signatures.push({
                id: uid("sig"),
                label: threatLabel(cat),
                content: cat,
              });
            draw();
          }),
      );
      if ($("addPattern"))
        $("addPattern").onclick = () => {
          work.signatures.push({
            id: uid("sig"),
            label: "",
            pattern: "",
            isRegex: false,
          });
          draw();
        };
      if ($("addPatterns"))
        $("addPatterns").onclick = () => {
          [
            ["SQL injection", "OR 1=1", false],
            ["Shellshock", "() { :;};", false],
            ["EICAR", "EICAR", false],
            ["Path traversal", "../", false],
            ["XSS", "<" + "script", false],
          ].forEach((p) =>
            work.signatures.push({
              id: uid("sig"),
              label: p[0],
              pattern: p[1],
              isRegex: p[2],
            }),
          );
          draw();
        };
      if ($("addPort"))
        $("addPort").onclick = () => {
          work.signatures.push({
            id: uid("sig"),
            label: "",
            proto: "tcp",
            portOp: "eq",
            port: 23,
            port2: null,
          });
          draw();
        };
      if ($("addInsecure"))
        $("addInsecure").onclick = () => {
          [
            ["Telnet", 23, "tcp"],
            ["FTP", 21, "tcp"],
            ["HTTP", 80, "tcp"],
            ["SMTP", 25, "tcp"],
            ["SNMP", 161, "udp"],
          ].forEach((p) =>
            work.signatures.push({
              id: uid("sig"),
              label: p[0],
              proto: p[2],
              portOp: "eq",
              port: p[1],
              port2: null,
            }),
          );
          draw();
        };
      modalBox.querySelectorAll("#patBody tr[data-si]").forEach((tr) => {
        const i = +tr.getAttribute("data-si");
        const s = work.signatures[i];
        tr.querySelector(".s-label").oninput = (e) =>
          (s.label = e.target.value);
        tr.querySelector(".s-pattern").oninput = (e) =>
          (s.pattern = e.target.value);
        tr.querySelector(".s-rx").onchange = (e) =>
          (s.isRegex = e.target.checked);
        tr.querySelector(".del").onclick = () => {
          work.signatures.splice(i, 1);
          draw();
        };
      });
      modalBox.querySelectorAll("#portBody tr[data-si]").forEach((tr) => {
        const i = +tr.getAttribute("data-si");
        const s = work.signatures[i];
        tr.querySelector(".s-label").oninput = (e) =>
          (s.label = e.target.value);
        tr.querySelector(".s-proto").onchange = (e) =>
          (s.proto = e.target.value);
        tr.querySelector(".s-portop").onchange = (e) => {
          s.portOp = e.target.value;
          if (s.portOp === "any") {
            s.port = null;
            s.port2 = null;
          }
          draw();
        };
        tr.querySelector(".s-port").oninput = (e) =>
          (s.port =
            e.target.value === "" ? null : parseInt(e.target.value, 10));
        tr.querySelector(".s-port2").oninput = (e) =>
          (s.port2 =
            e.target.value === "" ? null : parseInt(e.target.value, 10));
        tr.querySelector(".del").onclick = () => {
          work.signatures.splice(i, 1);
          draw();
        };
      });
      $("mCancel").onclick = closeModal;
      $("mSave").onclick = () => {
        d.label = work.label.trim() || d.label;
        d.mode = work.mode;
        d.signatures = work.signatures;
        d.tlsInspect = !!work.tlsInspect;
        saveDB();
        window.netRender();
        refreshAll();
        closeModal();
        setStatus(t("stIdsSaved"));
      };
    };
    draw();
    modalBg.classList.add("show");
    return;
  }

  if (!Array.isArray(d.acl)) d.acl = [];
  const work = JSON.parse(JSON.stringify(d));
  if (!Array.isArray(work.acl)) work.acl = [];
  if (work.aclDefault !== "permit" && work.aclDefault !== "deny")
    work.aclDefault = "permit";
  if (!Array.isArray(work.routes)) work.routes = [];
  if (!Array.isArray(work.portForwards)) work.portForwards = [];
  const isRouter = d.type === "router";
  const isL2mgmt = d.type === "l2mgmt";
  const isL3switch = d.type === "l3switch";
  const hasPorts = isL2mgmt || isL3switch || isRouter;
  const hasRoutes = (isRouter || isL3switch) && isAdvanced();

  const ed = isRouter ? wifiSsidEditor(d.ssids, d.wifiOn, d.wlTx) : null;
  const hasSvcRoles = isRouter || isL3switch;
  if (hasSvcRoles) devDnsWorkInit(work);
  if (hasSvcRoles) devDhcpWorkInit(work);
  function segOptions(sel) {
    let o = `<option value="*"${sel === "*" || sel == null ? " selected" : ""}>* (any)</option>`;
    DB.segments.forEach((s) => {
      o += `<option value="${s.id}"${sel === s.id ? " selected" : ""}>${esc(s.name)}</option>`;
    });
    return o;
  }
  let activeTab = "rules";
  function showTab(tab) {
    activeTab = tab;
    modalBox.querySelectorAll("[data-fwtab]").forEach((b) => {
      const on = b.getAttribute("data-fwtab") === tab;
      b.classList.toggle("active", on);
      b.setAttribute("aria-selected", on ? "true" : "false");
    });
    modalBox.querySelectorAll("[data-fwpane]").forEach((p) => {
      p.style.display = p.getAttribute("data-fwpane") === tab ? "" : "none";
    });
    if (tab === "routes") fillLearnedRoutes(d.id);
  }
  function draw() {
    const rows = work.acl
      .map(
        (r, i) => `
      <tr data-ri="${i}">
        <td class="num">${i + 1}</td>
        <td><select class="r-src">${segOptions(r.srcSeg)}</select></td>
        <td><select class="r-dst">${segOptions(r.dstSeg)}</select></td>
        <td><select class="r-proto">${["ip", "tcp", "udp", "icmp"].map((p) => `<option value="${p}"${r.proto === p ? " selected" : ""}>${p}</option>`).join("")}</select></td>
        <td><select class="r-portop">${["any", "eq", "range"].map((p) => `<option value="${p}"${r.portOp === p ? " selected" : ""}>${p}</option>`).join("")}</select></td>
        <td style="width:60px"><input class="r-port mono" type="number" value="${r.port ?? ""}" ${r.portOp === "any" ? "disabled" : ""}></td>
        <td style="width:60px"><input class="r-port2 mono" type="number" value="${r.port2 ?? ""}" ${r.portOp === "range" ? "" : "disabled"}></td>
        <td style="width:84px"><div class="act-toggle">
          <button class="permit ${r.action === "permit" ? "on" : ""}" data-act="permit">${t("fwPermit")}</button>
          <button class="deny ${r.action === "deny" ? "on" : ""}" data-act="deny">${t("fwDeny")}</button>
        </div></td>
        <td class="ops" style="width:64px">
          <button class="up" title="${t("aclUp")}">↑</button>
          <button class="down" title="${t("aclDown")}">↓</button>
          <button class="del" title="${t("aclDel")}">✕</button>
        </td>
      </tr>`,
      )
      .join("");
    modalBox.innerHTML = `
      <h2>${isL2mgmt ? "▦ Managed L2 switch" : isRouter ? "⊕ Router" : "◇ L3 switch"}: ${esc(work.label)}</h2>
      <div class="mfield"><label>${t("devModalName2")}</label><input id="mName" value="${esc(work.label)}"></div>
      ${(isL2mgmt || isL3switch) && isAdvanced() ? stpPriFieldHtml(work) : ""}
      ${(isL2mgmt || isL3switch) && isAdvanced() ? stpModeFieldHtml(work) : ""}
      <div class="default-pol" style="margin-bottom:12px">${t("tType")} <b>${isL2mgmt ? t("devTypeL2m") : isRouter ? t("devTypeRouter") : t("devTypeL3")}</b><br>${isL2mgmt ? t("devL2mInfo") : t("devL3Info")}</div>
      ${!hasPorts ? portStripHtml(d) : ""}
      <div class="subtabs"><button type="button" data-fwtab="rules">${t("fwTabRules")}</button>${hasPorts && isAdvanced() ? '<button type="button" data-fwtab="ports">' + t("portTab") + "</button>" : ""}${hasRoutes ? '<button type="button" data-fwtab="routes">' + t("routeTab") + "</button>" : ""}${isRouter ? '<button type="button" data-fwtab="wifi">Wi-Fi</button>' : ""}${hasSvcRoles && isAdvanced() ? '<button type="button" data-fwtab="dns">DNS</button>' : ""}${hasSvcRoles && isAdvanced() ? '<button type="button" data-fwtab="dhcp">DHCP</button>' : ""}<button type="button" data-fwtab="ha">${t("fwTabHa")}</button></div>
      <div data-fwpane="rules">
        <label style="font-size:12px;color:var(--muted);font-weight:600">${t("devL3Acl")}</label>
        <table class="rules-tbl">
          <thead><tr><th>#</th><th>${t("fwAclColFromSeg")}</th><th>${t("fwAclColToSeg")}</th><th>${t("fwColProto")}</th><th>${t("fwColPortOp")}</th><th>${t("fwColPort")}</th><th>${t("fwColPort2")}</th><th>${t("fwColAction")}</th><th></th></tr></thead>
          <tbody id="aclBody">${rows || '<tr><td colspan="9" style="color:var(--muted);padding:10px 4px">' + t("devL3NoAcl") + "</td></tr>"}</tbody>
        </table>
        <button class="btn" id="addRule" style="margin-bottom:14px">${t("devL3AddAcl")}</button>
        <div class="mfield"><label>${t("aclDefaultLabel")}</label>
          <select id="aclDefAction"><option value="deny"${work.aclDefault === "deny" ? " selected" : ""}>${t("fwSimpleDenyAll")}</option><option value="permit"${work.aclDefault !== "deny" ? " selected" : ""}>${t("fwSimplePermitAll")}</option></select>
        </div>
        <div class="default-pol">${t("devL3ImplicitPol")}</div>
        ${
          isRouter
            ? (() => {
                const hosts = DB.hosts || [];
                const hostOpt = (sel) =>
                  hosts
                    .map(
                      (h) =>
                        `<option value="${h.id}"${sel === h.id ? " selected" : ""}>${esc(h.label)}</option>`,
                    )
                    .join("");
                const pfRows = work.portForwards
                  .map(
                    (r, i) => `
            <tr data-pfi="${i}">
              <td><select class="pf-proto">${["tcp", "udp"].map((p) => `<option value="${p}"${r.proto === p ? " selected" : ""}>${p}</option>`).join("")}</select></td>
              <td style="width:74px"><input class="pf-pub mono" type="number" value="${r.pubPort ?? ""}"></td>
              <td><select class="pf-host">${hostOpt(r.hostId)}</select></td>
              <td style="width:74px"><input class="pf-int mono" type="number" value="${r.intPort ?? ""}"></td>
              <td class="ops" style="width:32px"><button class="pf-del" title="${t("aclDel")}">✕</button></td>
            </tr>`,
                  )
                  .join("");
                return `
        <label style="font-size:12px;color:var(--muted);font-weight:600;margin-top:16px;display:block">${t("fwPfTitle")}</label>
        <div style="font-size:11px;color:var(--muted);margin-bottom:6px">${t("rtPfNote")}</div>
        ${
          hosts.length
            ? `<table class="rules-tbl">
          <thead><tr><th>${t("fwColProto")}</th><th>${t("fwPfPub")}</th><th>${t("fwPfHost")}</th><th>${t("fwPfInt")}</th><th></th></tr></thead>
          <tbody id="pfBody">${pfRows || '<tr><td colspan="5" style="color:var(--muted);padding:10px 4px">' + t("fwPfNone") + "</td></tr>"}</tbody>
        </table>
        <button class="btn" id="addPf" style="margin-bottom:6px">${t("fwPfAdd")}</button>`
            : '<div style="font-size:11px;color:var(--muted)">' +
              t("fwPfNoHosts") +
              "</div>"
        }`;
              })()
            : ""
        }
      </div>
      ${hasPorts && isAdvanced() ? `<div data-fwpane="ports">${portsPaneHtml(d)}</div>` : ""}
      ${hasRoutes ? `<div data-fwpane="routes">${routesPaneHtml(work, d)}${arpTableHtml(d.id)}</div>` : ""}
      ${isRouter ? `<div data-fwpane="wifi"><div class="default-pol" style="margin:0 0 8px">${"Home <b>all-in-one</b>: this router can also broadcast <b>Wi-Fi</b>. Add an SSID and map it to a network/VLAN – the client then connects wirelessly (choose “Connect to Wi-Fi” on the host), no cable."}</div>${ed.html()}</div>` : ""}
      ${hasSvcRoles && isAdvanced() ? `<div data-fwpane="dns">${devDnsPaneHtml(work, d.id)}</div>` : ""}
      ${hasSvcRoles && isAdvanced() ? `<div data-fwpane="dhcp">${devDhcpPaneHtml(work)}</div>` : ""}
      <div data-fwpane="ha">${haSectionHTML(d, work.haPeer)}</div>
      <div class="actions">
        <button class="btn" id="mCancel">${t("cancel")}</button>
        <button class="btn primary" id="mSave">${t("save")}</button>
      </div>`;
    wire();
    showTab(activeTab);
  }
  function wire() {
    modalBox
      .querySelectorAll("[data-fwtab]")
      .forEach(
        (b) => (b.onclick = () => showTab(b.getAttribute("data-fwtab"))),
      );
    $("mName").oninput = (e) => (work.label = e.target.value);
    if ($("mStpPrio"))
      $("mStpPrio").oninput = (e) => (work.stpPriority = e.target.value);
    if ($("mStpMode"))
      $("mStpMode").onchange = (e) => (work.stpMode = e.target.value);
    if ($("mHaPeer"))
      $("mHaPeer").onchange = (e) => {
        work.haPeer = e.target.value || null;
        const w = $("mHaModeWrap");
        if (w) w.style.display = e.target.value ? "" : "none";
      };
    if ($("aclDefAction"))
      $("aclDefAction").onchange = (e) => (work.aclDefault = e.target.value);
    $("addRule").onclick = () => {
      work.acl.push({
        id: uid("a"),
        srcSeg: "*",
        dstSeg: "*",
        action: "permit",
        proto: "ip",
        portOp: "any",
        port: null,
        port2: null,
      });
      draw();
    };
    modalBox.querySelectorAll("#aclBody tr[data-ri]").forEach((tr) => {
      const i = +tr.getAttribute("data-ri");
      const r = work.acl[i];
      tr.querySelector(".r-src").onchange = (e) => (r.srcSeg = e.target.value);
      tr.querySelector(".r-dst").onchange = (e) => (r.dstSeg = e.target.value);
      tr.querySelector(".r-proto").onchange = (e) => (r.proto = e.target.value);
      tr.querySelector(".r-portop").onchange = (e) => {
        r.portOp = e.target.value;
        if (r.portOp === "any") {
          r.port = null;
          r.port2 = null;
        }
        draw();
      };
      tr.querySelector(".r-port").oninput = (e) =>
        (r.port = e.target.value === "" ? null : parseInt(e.target.value, 10));
      tr.querySelector(".r-port2").oninput = (e) =>
        (r.port2 = e.target.value === "" ? null : parseInt(e.target.value, 10));
      tr.querySelectorAll(".act-toggle button").forEach(
        (b) =>
          (b.onclick = () => {
            r.action = b.getAttribute("data-act");
            draw();
          }),
      );
      tr.querySelector(".up").onclick = () => {
        if (i > 0) {
          [work.acl[i - 1], work.acl[i]] = [work.acl[i], work.acl[i - 1]];
          draw();
        }
      };
      tr.querySelector(".down").onclick = () => {
        if (i < work.acl.length - 1) {
          [work.acl[i + 1], work.acl[i]] = [work.acl[i], work.acl[i + 1]];
          draw();
        }
      };
      tr.querySelector(".del").onclick = () => {
        work.acl.splice(i, 1);
        draw();
      };
    });
    if (isRouter) {
      if ($("addPf"))
        $("addPf").onclick = () => {
          const fh = (DB.hosts || [])[0];
          work.portForwards.push({
            id: uid("pf"),
            proto: "tcp",
            pubPort: 443,
            hostId: fh ? fh.id : null,
            intPort: 443,
          });
          draw();
        };
      modalBox.querySelectorAll("#pfBody tr[data-pfi]").forEach((tr) => {
        const i = +tr.getAttribute("data-pfi");
        const r = work.portForwards[i];
        tr.querySelector(".pf-proto").onchange = (e) =>
          (r.proto = e.target.value);
        tr.querySelector(".pf-pub").oninput = (e) =>
          (r.pubPort =
            e.target.value === "" ? null : parseInt(e.target.value, 10));
        tr.querySelector(".pf-host").onchange = (e) =>
          (r.hostId = e.target.value);
        tr.querySelector(".pf-int").oninput = (e) =>
          (r.intPort =
            e.target.value === "" ? null : parseInt(e.target.value, 10));
        tr.querySelector(".pf-del").onclick = () => {
          work.portForwards.splice(i, 1);
          draw();
        };
      });
    }
    if (hasPorts && isAdvanced()) wirePortsPane(draw, d);
    else wirePortStrip(d);
    if (hasRoutes) {
      const mrp = $("mRoutingProto");
      if (mrp)
        mrp.onchange = (e) => {
          work.routingProto = e.target.value;
          draw();
        };
      if ($("rtAdd"))
        $("rtAdd").onclick = () => {
          work.routes.push({ id: uid("rt"), dest: "", via: "" });
          draw();
        };
      modalBox.querySelectorAll("#rtBody tr[data-rri]").forEach((tr) => {
        const i = +tr.getAttribute("data-rri");
        const r = work.routes[i];
        tr.querySelector(".rt-dest").oninput = (e) =>
          (r.dest = e.target.value.trim());
        const via = tr.querySelector(".rt-via");
        if (via) via.onchange = (e) => (r.via = e.target.value || "");
        tr.querySelector(".rt-del").onclick = () => {
          work.routes.splice(i, 1);
          draw();
        };
      });
    }
    if (ed) ed.wire();
    if (hasSvcRoles && isAdvanced()) devDnsPaneWire(work, d.id, draw);
    if (hasSvcRoles && isAdvanced()) devDhcpPaneWire(work, draw);
    $("mCancel").onclick = closeModal;
    $("mSave").onclick = () => {
      const br = firstBadRange(work.acl);
      if (br) {
        setStatus(t("aclRangeBad").replace("{n}", br), false);
        return;
      }
      const mp = firstMissingPort(work.acl);
      if (mp) {
        setStatus(t("aclPortMissing").replace("{n}", mp), false);
        return;
      }
      d.label = work.label.trim() || d.label;
      d.acl = work.acl;
      d.aclDefault = work.aclDefault;
      if (isL2mgmt || isL3switch) {
        applyStpPri(d, work.stpPriority);
        applyStpMode(d, work.stpMode);
      }
      if (hasRoutes) {
        d.routes = work.routes;
        d.routingProto = work.routingProto || "ospf";
        d.manualRouting = d.routingProto === "static";
      }
      if (isRouter)
        d.portForwards = work.portForwards.filter(
          (r) =>
            r.hostId &&
            getNode(r.hostId) &&
            r.pubPort != null &&
            r.intPort != null,
        );
      if (hasSvcRoles) devDnsSave(d, work);
      if (hasSvcRoles && isAdvanced()) devDhcpSave(d, work);
      if (ed) {
        const v = ed.value();
        d.ssids = v.ssids;
        d.wifiOn = v.wifiOn;
        d.wlTx = v.wlTx;
        reconcileWifiClients();
      }
      applyHaPair(d, work.haPeer);
      if ($("mHaMode")) applyHaMode(d, $("mHaMode").value);
      saveDB();
      window.netRender();
      refreshAll();
      closeModal();
      setStatus(d.haPeer ? t("stHaSaved") : t("stSaved"));
    };
  }
  draw();
  modalBox.classList.add("wide");
  modalBg.classList.add("show");
}

function openFirewallModal(fw) {
  modalCloseHook = null;
  ensureFirewallZones(fw);
  const work = JSON.parse(JSON.stringify(fw));
  ensureFirewallZones(work);
  if (work.zoneMode === undefined) work.zoneMode = true;
  if (!work.defaultAction) work.defaultAction = "deny";
  if (!Array.isArray(work.simpleRules)) work.simpleRules = [];
  if (!Array.isArray(work.portForwards)) work.portForwards = [];
  if (!Array.isArray(work.staticNat)) work.staticNat = [];
  if (!Array.isArray(work.routes)) work.routes = [];
  devDnsWorkInit(work);
  devDhcpWorkInit(work);

  const fwHasRoutes = isAdvanced();
  const edWifi = wifiSsidEditor(work.ssids, work.wifiOn, work.wlTx);
  function zoneOptions(sel) {
    let o = `<option value="*"${sel === "*" ? " selected" : ""}>* (any)</option>`;
    work.zones.forEach((z) => {
      o += `<option value="${z.id}"${sel === z.id ? " selected" : ""}>${esc(z.name)}</option>`;
    });
    return o;
  }
  function segOptions(sel) {
    let o = `<option value="*"${sel === "*" || sel == null ? " selected" : ""}>* (any)</option>`;
    DB.segments.forEach((s) => {
      o += `<option value="${s.id}"${sel === s.id ? " selected" : ""}>${esc(s.name)}</option>`;
    });
    return o;
  }
  function l4cells(r) {
    return `
      <td><select class="r-proto">${["ip", "tcp", "udp", "icmp"].map((p) => `<option value="${p}"${r.proto === p ? " selected" : ""}>${p}</option>`).join("")}</select></td>
      <td><select class="r-portop">${["any", "eq", "range"].map((p) => `<option value="${p}"${r.portOp === p ? " selected" : ""}>${p}</option>`).join("")}</select></td>
      <td style="width:60px"><input class="r-port mono" type="number" value="${r.port ?? ""}" ${r.portOp === "any" ? "disabled" : ""}></td>
      <td style="width:60px"><input class="r-port2 mono" type="number" value="${r.port2 ?? ""}" ${r.portOp === "range" ? "" : "disabled"}></td>
      <td style="width:84px"><div class="act-toggle">
        <button class="permit ${r.action === "permit" ? "on" : ""}" data-act="permit">${t("fwPermit")}</button>
        <button class="deny ${r.action === "deny" ? "on" : ""}" data-act="deny">${t("fwDeny")}</button>
      </div></td>
      <td class="ops" style="width:64px"><button class="up" title="${t("aclUp")}">↑</button><button class="down" title="${t("aclDown")}">↓</button><button class="del" title="${t("aclDel")}">✕</button></td>`;
  }
  let activeFwTab = "zones";
  function showFwTab(tab) {
    activeFwTab = tab;
    modalBox.querySelectorAll("[data-fwtab]").forEach((b) => {
      const on = b.getAttribute("data-fwtab") === tab;
      b.classList.toggle("active", on);
      b.setAttribute("aria-selected", on ? "true" : "false");
    });
    modalBox.querySelectorAll("[data-fwpane]").forEach((p) => {
      p.style.display = p.getAttribute("data-fwpane") === tab ? "" : "none";
    });
    if (tab === "routes") fillLearnedRoutes(fw.id);
  }
  function render() {
    let paneZones = "",
      paneRules = "";
    if (work.zoneMode) {
      ensureFirewallZones(work);
      const rc = (r) =>
        r === "inside"
          ? "var(--green)"
          : r === "outside"
            ? "var(--red)"
            : r === "vpn"
              ? "var(--violet)"
              : "var(--amber)";
      const zoneLis = work.zones
        .map((z) => {
          const members = interfacesInZone(work, z.id);
          const roleOpts = [
            ["inside", "inside"],
            ["dmz", "DMZ"],
            ["outside", "outside"],
            ["vpn", "VPN"],
          ]
            .map(
              (o) =>
                `<option value="${o[0]}"${z.role === o[0] ? " selected" : ""}>${o[1]}</option>`,
            )
            .join("");
          return `<li><span class="zdot" style="background:${rc(z.role)}"></span>
        <input data-zid="${z.id}" value="${esc(z.name)}" style="flex:1" title="${t("fwZoneNameTitle")}">
        <select data-zrole="${z.id}" style="flex:0 0 82px">${roleOpts}</select>
        <span class="zmeta" style="flex:0 0 96px" title="${t("fwZoneIfacesTitle")}">${members.length ? esc(members.join(", ")) : t("fwZoneEmpty")}</span>
        <button data-zdel="${z.id}" title="${t("fwZoneDelTitle")}" style="background:none;border:none;color:var(--muted);cursor:pointer;font-size:14px;padding:0 2px">✕</button></li>`;
        })
        .join("");
      const ifaceZoneOpts = (zid) =>
        work.zones
          .map(
            (z) =>
              `<option value="${z.id}"${zid === z.id ? " selected" : ""}>${esc(z.name)} (${roleName(z.role)})</option>`,
          )
          .join("");
      const ifaceLis = fwInterfaces(work)
        .map((it) => {
          const n = getNode(it.neighborId);
          const nm = n ? n.name || n.label : "?";
          const seg = isSegment(it.neighborId);
          return `<li><span class="zmeta" style="flex:1">${esc(nm)}${seg ? ' <span style="color:var(--muted);font-size:10px">' + t("fwNetTag") + "</span>" : ""}</span><span style="color:var(--muted)">→</span>
        <select data-iface="${it.link.id}" style="flex:0 0 158px">${ifaceZoneOpts(work.ifaceZones[it.link.id])}${seg ? '<option value="__remove">' + t("fwIfaceRemove") + "</option>" : ""}</select></li>`;
        })
        .join("");

      const fwNb = new Set(fwInterfaces(work).map((it) => it.neighborId));
      const freeVlans = DB.segments.filter(
        (s) => !s.isInternet && !fwNb.has(s.id),
      );
      const vlanLis = freeVlans
        .map((s) => {
          const inh = inheritedFwZone(work, s.id);
          const defLbl = inh
            ? tf(
                "fwVlanAutoZone",
                inh.zone.name,
                (inh.via && (inh.via.name || inh.via.label)) || "?",
              )
            : t("fwVlanNoZone");
          return `<li><span class="zmeta" style="flex:1">${esc(s.name)}${s.subnet ? ' <span style="color:var(--muted);font-size:10px">' + esc(s.subnet) + "</span>" : ""}</span><span style="color:var(--muted)">→</span>
        <select data-vlanzone="${s.id}" style="flex:0 0 188px"><option value="">${esc(defLbl)}</option>${ifaceZoneOpts(null)}</select></li>`;
        })
        .join("");
      const ruleRows = work.firewallRules
        .map(
          (r, i) => `
        <tr data-ri="${i}"><td class="num">${i + 1}</td>
        <td><select class="r-src">${zoneOptions(r.srcZone)}</select></td>
        <td><select class="r-srcseg">${segOptions(r.srcSeg)}</select></td>
        <td><select class="r-dst">${zoneOptions(r.dstZone)}</select></td>
        <td><select class="r-dstseg">${segOptions(r.dstSeg)}</select></td>${l4cells(r)}</tr>`,
        )
        .join("");
      paneZones = `
      <div style="font-size:11.5px;color:var(--muted);margin:0 0 8px;line-height:1.5">${t("fwZoneDesc")}</div>
      <label style="font-size:12px;color:var(--muted);font-weight:600">${t("fwZones")}</label>
      <ul class="zone-list">${zoneLis || '<li style="color:var(--muted)">' + t("fwNoZones") + "</li>"}</ul>
      <button class="btn" id="addZone" style="margin:-4px 0 14px">${t("fwAddZone")}</button>
      <label style="font-size:12px;color:var(--muted);font-weight:600">${t("fwIfaceZones")}</label>
      <div style="font-size:11px;color:var(--muted);margin-bottom:6px">${t("fwIfaceNote")}</div>
      <ul class="zone-list">${ifaceLis + vlanLis || '<li style="color:var(--muted)">' + t("fwNoIface") + "</li>"}</ul>
      ${
        work.zones.some((z) => z.role === "vpn")
          ? `<label style="font-size:12px;color:var(--muted);font-weight:600;display:block;margin-top:12px">${t("fwVpnRadius")}</label>
      <div style="font-size:11px;color:var(--muted);margin-bottom:6px">${t("fwVpnRadiusNote")}</div>
      <select id="fwVpnRadius" style="width:100%"><option value="">${t("fwVpnRadiusNone")}</option>${_radHosts()
        .map(
          (x) =>
            `<option value="${x.id}"${work.vpnRadiusId === x.id ? " selected" : ""}>${esc(x.label)}</option>`,
        )
        .join("")}</select>`
          : ""
      }`;
      paneRules = `
      <label style="font-size:12px;color:var(--muted);font-weight:600">${t("fwRules")}</label>
      <div style="font-size:11px;color:var(--muted);margin-bottom:6px">${t("fwRulesNote")}</div>
      <table class="rules-tbl">
        <thead><tr><th>#</th><th>${t("fwColFrom")}</th><th>${t("fwColFromSeg")}</th><th>${t("fwColTo")}</th><th>${t("fwColToSeg")}</th><th>${t("fwColProto")}</th><th>${t("fwColPortOp")}</th><th>${t("fwColPort")}</th><th>${t("fwColPort2")}</th><th>${t("fwColAction")}</th><th></th></tr></thead>
        <tbody id="ruleBody">${ruleRows || '<tr><td colspan="11" style="color:var(--muted);padding:10px 4px">' + t("fwNoRules") + "</td></tr>"}</tbody>
      </table>
      <button class="btn" id="addRule" style="margin-bottom:14px">${t("fwAddRule")}</button>
      <div class="default-pol">${t("fwDefaultPol")}</div>`;
    } else {
      const ruleRows = work.simpleRules
        .map(
          (r, i) => `
        <tr data-ri="${i}"><td class="num">${i + 1}</td>
        <td><select class="r-src">${segOptions(r.srcSeg)}</select></td>
        <td><select class="r-dst">${segOptions(r.dstSeg)}</select></td>${l4cells(r)}</tr>`,
        )
        .join("");
      paneRules = `
      <div style="font-size:11.5px;color:var(--muted);margin:0 0 10px;line-height:1.5">${t("fwSimpleDesc")}</div>
      <div class="mfield"><label>${t("fwSimpleDefaultLabel")}</label>
        <select id="defAction"><option value="deny"${work.defaultAction === "deny" ? " selected" : ""}>${t("fwSimpleDenyAll")}</option><option value="permit"${work.defaultAction === "permit" ? " selected" : ""}>${t("fwSimplePermitAll")}</option></select>
      </div>
      <label style="font-size:12px;color:var(--muted);font-weight:600">${t("fwRules")}</label>
      <table class="rules-tbl">
        <thead><tr><th>#</th><th>${t("fwAclColFromSeg")}</th><th>${t("fwAclColToSeg")}</th><th>${t("fwColProto")}</th><th>${t("fwColPortOp")}</th><th>${t("fwColPort")}</th><th>${t("fwColPort2")}</th><th>${t("fwColAction")}</th><th></th></tr></thead>
        <tbody id="ruleBody">${ruleRows || '<tr><td colspan="9" style="color:var(--muted);padding:10px 4px">' + t("fwSimpleNoRules") + "</td></tr>"}</tbody>
      </table>
      <button class="btn" id="addRule" style="margin-bottom:14px">${t("fwAddRule")}</button>
      <div class="default-pol"><span style="color:var(--muted)">${t("fwSimpleStateful")}</span></div>`;
    }

    {
      const hosts = DB.hosts || [];
      const hostOpt = (sel) =>
        hosts
          .map(
            (h) =>
              `<option value="${h.id}"${sel === h.id ? " selected" : ""}>${esc(h.label)}</option>`,
          )
          .join("");
      const pfRows = work.portForwards
        .map(
          (r, i) => `
        <tr data-pfi="${i}">
          <td><select class="pf-proto">${["tcp", "udp"].map((p) => `<option value="${p}"${r.proto === p ? " selected" : ""}>${p}</option>`).join("")}</select></td>
          <td style="width:74px"><input class="pf-pub mono" type="number" value="${r.pubPort ?? ""}"></td>
          <td><select class="pf-host">${hostOpt(r.hostId)}</select></td>
          <td style="width:74px"><input class="pf-int mono" type="number" value="${r.intPort ?? ""}"></td>
          <td class="ops" style="width:32px"><button class="pf-del" title="${t("aclDel")}">✕</button></td>
        </tr>`,
        )
        .join("");
      paneRules += `
        <label style="font-size:12px;color:var(--muted);font-weight:600;margin-top:16px;display:block">${t("fwPfTitle")}</label>
        <div style="font-size:11px;color:var(--muted);margin-bottom:6px">${t("fwPfNote")}</div>
        ${
          hosts.length
            ? `<table class="rules-tbl">
          <thead><tr><th>${t("fwColProto")}</th><th>${t("fwPfPub")}</th><th>${t("fwPfHost")}</th><th>${t("fwPfInt")}</th><th></th></tr></thead>
          <tbody id="pfBody">${pfRows || '<tr><td colspan="5" style="color:var(--muted);padding:10px 4px">' + t("fwPfNone") + "</td></tr>"}</tbody>
        </table>
        <button class="btn" id="addPf" style="margin-bottom:6px">${t("fwPfAdd")}</button>`
            : '<div style="font-size:11px;color:var(--muted)">' +
              t("fwPfNoHosts") +
              "</div>"
        }`;

      const snRows = work.staticNat
        .map(
          (r, i) => `
        <tr data-sni="${i}">
          <td><select class="sn-host">${hostOpt(r.hostId)}</select></td>
          <td><input class="sn-pub mono" value="${esc(r.publicIp || "")}" placeholder="203.0.113.20"></td>
          <td class="ops" style="width:32px"><button class="sn-del" title="${t("aclDel")}">✕</button></td>
        </tr>`,
        )
        .join("");
      if (hosts.length)
        paneRules += `
        <label style="font-size:12px;color:var(--muted);font-weight:600;margin-top:16px;display:block">${t("fwSnatTitle")}</label>
        <div style="font-size:11px;color:var(--muted);margin-bottom:6px">${t("fwSnatNote")}</div>
        <table class="rules-tbl"><thead><tr><th>${t("fwPfHost")}</th><th>${t("fwSnatPub")}</th><th></th></tr></thead>
          <tbody id="snBody">${snRows || '<tr><td colspan="3" style="color:var(--muted);padding:10px 4px">' + t("fwSnatNone") + "</td></tr>"}</tbody>
        </table>
        <button class="btn" id="addSn" style="margin-bottom:6px">${t("fwSnatAdd")}</button>`;
    }
    paneRules += natTableHtml(fw);
    modalBox.innerHTML = `
      <h2>${icon("flame", "ico-a")}Firewall: ${esc(work.label)}</h2>
      <div class="mfield"><label>${t("devModalName2")}</label><input id="mName" value="${esc(work.label)}"></div>
      <label class="toggle-row"><input type="checkbox" id="zoneToggle" ${work.zoneMode ? "checked" : ""}><span>${t("fwZoneToggle")}</span></label>
      <div class="subtabs">${work.zoneMode ? `<button type="button" data-fwtab="zones">${t("fwTabZones")}</button>` : ""}<button type="button" data-fwtab="rules">${t("fwTabRules")}</button>${isAdvanced() ? `<button type="button" data-fwtab="ports">${t("portTab")}</button>` : ""}${fwHasRoutes ? `<button type="button" data-fwtab="routes">${t("routeTab")}</button>` : ""}<button type="button" data-fwtab="wifi">Wi-Fi</button>${isAdvanced() ? '<button type="button" data-fwtab="dns">DNS</button>' : ""}${isAdvanced() ? '<button type="button" data-fwtab="dhcp">DHCP</button>' : ""}<button type="button" data-fwtab="ha">${t("fwTabHa")}</button></div>
      ${work.zoneMode ? `<div data-fwpane="zones">${paneZones}</div>` : ""}
      <div data-fwpane="rules">${paneRules}</div>
      ${isAdvanced() ? `<div data-fwpane="ports">${portsPaneHtml(fw)}</div>` : ""}
      ${fwHasRoutes ? `<div data-fwpane="routes">${routesPaneHtml(work, fw)}</div>` : ""}
      <div data-fwpane="wifi"><div style="font-size:11.5px;color:var(--muted);margin:0 0 8px;line-height:1.5">${"Home <b>all-in-one</b>: this firewall can also broadcast <b>Wi-Fi</b>. Add an SSID and map it to a network/VLAN – the client connects wirelessly (choose “Connect to Wi-Fi” on the host), no cable."}</div>${edWifi.html()}</div>
      ${isAdvanced() ? `<div data-fwpane="dns">${devDnsPaneHtml(work, fw.id)}</div>` : ""}
      ${isAdvanced() ? `<div data-fwpane="dhcp">${devDhcpPaneHtml(work)}</div>` : ""}
      <div data-fwpane="ha"><div style="font-size:11px;color:var(--muted);margin-bottom:10px">${t("fwInterfaceNote")}</div>${haSectionHTML(fw, work.haPeer)}</div>
      <div class="actions">
        <button class="btn" id="mCancel">${t("cancel")}</button>
        <button class="btn primary" id="mSave">${t("save")}</button>
      </div>`;
    bind();
    let tab = activeFwTab;
    if (!work.zoneMode && tab === "zones") tab = "rules";
    if (tab === "ports" && !isAdvanced())
      tab = work.zoneMode ? "zones" : "rules";
    showFwTab(tab);
  }
  function bind() {
    modalBox
      .querySelectorAll("[data-fwtab]")
      .forEach(
        (b) => (b.onclick = () => showFwTab(b.getAttribute("data-fwtab"))),
      );
    if (isAdvanced()) wirePortsPane(render, fw);
    if (isAdvanced()) devDnsPaneWire(work, fw.id, render);
    if (isAdvanced()) devDhcpPaneWire(work, render);
    edWifi.wire();
    $("mName").oninput = (e) => {
      work.label = e.target.value;
    };
    if ($("mHaPeer"))
      $("mHaPeer").onchange = (e) => {
        work.haPeer = e.target.value || null;
        const w = $("mHaModeWrap");
        if (w) w.style.display = e.target.value ? "" : "none";
      };
    $("zoneToggle").onchange = (e) => {
      work.zoneMode = e.target.checked;
      render();
    };
    if ($("defAction"))
      $("defAction").onchange = (e) => (work.defaultAction = e.target.value);
    if (fwHasRoutes) {
      const mr = $("mManualRt");
      if (mr)
        mr.onchange = (e) => {
          work.manualRouting = e.target.checked;
        };
      if ($("rtAdd"))
        $("rtAdd").onclick = () => {
          work.routes.push({ id: uid("rt"), dest: "", via: "" });
          render();
        };
      modalBox.querySelectorAll("#rtBody tr[data-rri]").forEach((tr) => {
        const i = +tr.getAttribute("data-rri");
        const r = work.routes[i];
        tr.querySelector(".rt-dest").oninput = (e) =>
          (r.dest = e.target.value.trim());
        const via = tr.querySelector(".rt-via");
        if (via) via.onchange = (e) => (r.via = e.target.value || "");
        tr.querySelector(".rt-del").onclick = () => {
          work.routes.splice(i, 1);
          render();
        };
      });
    }
    modalBox.querySelectorAll(".zone-list input[data-zid]").forEach((inp) => {
      inp.oninput = (e) => {
        const z = work.zones.find(
          (z) => z.id === e.target.getAttribute("data-zid"),
        );
        if (z) z.name = e.target.value;
      };
    });
    modalBox
      .querySelectorAll(".zone-list select[data-zrole]")
      .forEach((sel) => {
        sel.onchange = (e) => {
          const z = work.zones.find(
            (z) => z.id === e.target.getAttribute("data-zrole"),
          );
          if (z) {
            z.role = e.target.value;
            render();
          }
        };
      });
    {
      const r = $("fwVpnRadius");
      if (r)
        r.onchange = () => {
          work.vpnRadiusId = r.value || null;
        };
    }
    modalBox
      .querySelectorAll(".zone-list select[data-iface]")
      .forEach((sel) => {
        sel.onchange = (e) => {
          const lid = e.target.getAttribute("data-iface");
          if (e.target.value === "__remove") {
            const rl = DB.links.find((l) => l.id === lid);
            const segId = rl
              ? rl.fromId === fw.id
                ? rl.toId
                : rl.fromId
              : null;
            DB.links = DB.links.filter((l) => l.id !== lid);
            delete work.ifaceZones[lid];
            delete fw.ifaceZones[lid];
            if (fw.haPeer && segId && isSegment(segId)) {
              const p = getNode(fw.haPeer);
              if (p) {
                const pl = DB.links.find(
                  (l) =>
                    (l.fromId === p.id && l.toId === segId) ||
                    (l.toId === p.id && l.fromId === segId),
                );
                if (pl) {
                  DB.links = DB.links.filter((l) => l.id !== pl.id);
                  if (p.ifaceZones) delete p.ifaceZones[pl.id];
                }
              }
            }
            saveDB();
            window.netRender();
            refreshAll();
            render();
            return;
          }
          work.ifaceZones[lid] = e.target.value;
          render();
        };
      });

    modalBox
      .querySelectorAll(".zone-list select[data-vlanzone]")
      .forEach((sel) => {
        sel.onchange = (e) => {
          const segId = e.target.getAttribute("data-vlanzone"),
            zid = e.target.value;
          if (!zid) return;
          let link = DB.links.find(
            (l) =>
              (l.fromId === fw.id && l.toId === segId) ||
              (l.toId === fw.id && l.fromId === segId),
          );
          if (!link) {
            link = { id: uid("l"), fromId: fw.id, toId: segId };
            DB.links.push(link);
          }
          fw.ifaceZones[link.id] = zid;
          work.ifaceZones[link.id] = zid;
          if (fw.haPeer) {
            const p = getNode(fw.haPeer);
            if (p) replicateFwInterfaces(fw, p);
          }
          saveDB();
          window.netRender();
          refreshAll();
          render();
        };
      });
    modalBox.querySelectorAll(".zone-list button[data-zdel]").forEach((b) => {
      b.onclick = () => {
        const zid = b.getAttribute("data-zdel");
        if (work.zones.length <= 1) {
          setStatus(t("stFwNeedsZone"), false);
          return;
        }
        work.zones = work.zones.filter((z) => z.id !== zid);

        const fb = work.zones[0].id;
        Object.keys(work.ifaceZones).forEach((lid) => {
          if (work.ifaceZones[lid] === zid) work.ifaceZones[lid] = fb;
        });

        work.firewallRules.forEach((r) => {
          if (r.srcZone === zid) r.srcZone = "*";
          if (r.dstZone === zid) r.dstZone = "*";
        });
        render();
      };
    });
    if ($("addZone"))
      $("addZone").onclick = () => {
        work.zones.push({
          id: uidZone(work),
          name: "zone" + (work.zones.length + 1),
          role: "dmz",
        });
        render();
      };
    const list = work.zoneMode ? work.firewallRules : work.simpleRules;
    $("addRule").onclick = () => {
      if (work.zoneMode) {
        const dz = work.zones[0] ? work.zones[0].id : "*";
        work.firewallRules.push({
          id: uid("r"),
          srcZone: "*",
          dstZone: dz,
          srcSeg: "*",
          dstSeg: "*",
          action: "permit",
          proto: "ip",
          portOp: "any",
          port: null,
          port2: null,
        });
      } else {
        work.simpleRules.push({
          id: uid("r"),
          srcSeg: "*",
          dstSeg: "*",
          action: "permit",
          proto: "ip",
          portOp: "any",
          port: null,
          port2: null,
        });
      }
      render();
    };
    modalBox.querySelectorAll("#ruleBody tr[data-ri]").forEach((tr) => {
      const i = +tr.getAttribute("data-ri");
      const r = list[i];
      const s1 = tr.querySelector(".r-src"),
        s2 = tr.querySelector(".r-dst");
      if (work.zoneMode) {
        s1.onchange = (e) => (r.srcZone = e.target.value);
        s2.onchange = (e) => (r.dstZone = e.target.value);
        const ss = tr.querySelector(".r-srcseg"),
          ds = tr.querySelector(".r-dstseg");
        if (ss) ss.onchange = (e) => (r.srcSeg = e.target.value);
        if (ds) ds.onchange = (e) => (r.dstSeg = e.target.value);
      } else {
        s1.onchange = (e) => (r.srcSeg = e.target.value);
        s2.onchange = (e) => (r.dstSeg = e.target.value);
      }
      tr.querySelector(".r-proto").onchange = (e) => (r.proto = e.target.value);
      tr.querySelector(".r-portop").onchange = (e) => {
        r.portOp = e.target.value;
        if (r.portOp === "any") {
          r.port = null;
          r.port2 = null;
        }
        render();
      };
      tr.querySelector(".r-port").oninput = (e) =>
        (r.port = e.target.value === "" ? null : parseInt(e.target.value, 10));
      tr.querySelector(".r-port2").oninput = (e) =>
        (r.port2 = e.target.value === "" ? null : parseInt(e.target.value, 10));
      tr.querySelectorAll(".act-toggle button").forEach(
        (b) =>
          (b.onclick = () => {
            r.action = b.getAttribute("data-act");
            render();
          }),
      );
      tr.querySelector(".up").onclick = () => {
        if (i > 0) {
          [list[i - 1], list[i]] = [list[i], list[i - 1]];
          render();
        }
      };
      tr.querySelector(".down").onclick = () => {
        if (i < list.length - 1) {
          [list[i + 1], list[i]] = [list[i], list[i + 1]];
          render();
        }
      };
      tr.querySelector(".del").onclick = () => {
        list.splice(i, 1);
        render();
      };
    });
    if ($("addPf"))
      $("addPf").onclick = () => {
        const fh = (DB.hosts || [])[0];
        work.portForwards.push({
          id: uid("pf"),
          proto: "tcp",
          pubPort: 443,
          hostId: fh ? fh.id : null,
          intPort: 443,
        });
        render();
      };
    modalBox.querySelectorAll("#pfBody tr[data-pfi]").forEach((tr) => {
      const i = +tr.getAttribute("data-pfi");
      const r = work.portForwards[i];
      tr.querySelector(".pf-proto").onchange = (e) =>
        (r.proto = e.target.value);
      tr.querySelector(".pf-pub").oninput = (e) =>
        (r.pubPort =
          e.target.value === "" ? null : parseInt(e.target.value, 10));
      tr.querySelector(".pf-host").onchange = (e) =>
        (r.hostId = e.target.value);
      tr.querySelector(".pf-int").oninput = (e) =>
        (r.intPort =
          e.target.value === "" ? null : parseInt(e.target.value, 10));
      tr.querySelector(".pf-del").onclick = () => {
        work.portForwards.splice(i, 1);
        render();
      };
    });
    if ($("addSn"))
      $("addSn").onclick = () => {
        const fh = (DB.hosts || [])[0];
        work.staticNat.push({
          id: uid("sn"),
          hostId: fh ? fh.id : null,
          publicIp: "",
        });
        render();
      };
    modalBox.querySelectorAll("#snBody tr[data-sni]").forEach((tr) => {
      const i = +tr.getAttribute("data-sni");
      const r = work.staticNat[i];
      tr.querySelector(".sn-host").onchange = (e) =>
        (r.hostId = e.target.value);
      tr.querySelector(".sn-pub").oninput = (e) =>
        (r.publicIp = e.target.value);
      tr.querySelector(".sn-del").onclick = () => {
        work.staticNat.splice(i, 1);
        render();
      };
    });
    $("mCancel").onclick = closeModal;
    $("mSave").onclick = () => {
      const br = firstBadRange(
        work.zoneMode ? work.firewallRules : work.simpleRules,
      );
      if (br) {
        setStatus(t("aclRangeBad").replace("{n}", br), false);
        return;
      }
      const mp = firstMissingPort(
        work.zoneMode ? work.firewallRules : work.simpleRules,
      );
      if (mp) {
        setStatus(t("aclPortMissing").replace("{n}", mp), false);
        return;
      }
      fw.label = work.label.trim() || fw.label;
      fw.zoneMode = work.zoneMode;
      fw.defaultAction = work.defaultAction;
      fw.simpleRules = work.simpleRules;
      fw.zones = work.zones.map((z) => ({
        id: z.id,
        name: (z.name || "").trim() || roleName(z.role),
        role: z.role,
      }));
      fw.ifaceZones = work.ifaceZones;
      fw.firewallRules = work.firewallRules;
      fw.portForwards = work.portForwards.filter(
        (r) =>
          r.hostId &&
          getNode(r.hostId) &&
          r.pubPort != null &&
          r.intPort != null,
      );
      fw.staticNat = work.staticNat.filter(
        (r) => r.hostId && getNode(r.hostId) && r.publicIp && r.publicIp.trim(),
      );
      devDnsSave(fw, work);
      if (isAdvanced()) devDhcpSave(fw, work);
      if (fwHasRoutes) {
        fw.routes = work.routes;
        fw.manualRouting = !!work.manualRouting;
      }
      {
        const v = edWifi.value();
        fw.ssids = v.ssids;
        fw.wifiOn = v.wifiOn;
        fw.wlTx = v.wlTx;
        reconcileWifiClients();
      }
      fw.vpnRadiusId = work.vpnRadiusId || null;
      applyHaPair(fw, work.haPeer);
      if ($("mHaMode")) applyHaMode(fw, $("mHaMode").value);
      saveDB();
      window.netRender();
      refreshAll();
      closeModal();
      setStatus(fw.haPeer ? t("stHaSaved") : t("stSaved"));
    };
  }
  render();
  modalBox.classList.add("wide");
  modalBg.classList.add("show");
}
function esc(s) {
  return String(s == null ? "" : s).replace(
    /[&<>"]/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c],
  );
}

window.netRender = render;
