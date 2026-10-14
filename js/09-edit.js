"use strict";

function inlineRename(id, labelEl) {
  const n = getNode(id);
  if (!n) return;
  const old = document.getElementById("inlineRen");
  if (old) old.remove();
  const isSeg = isSegment(id);
  const r = labelEl.getBoundingClientRect();
  const inp = document.createElement("input");
  inp.id = "inlineRen";
  inp.type = "text";
  inp.maxLength = 48;
  inp.value = isSeg ? n.name || "" : n.label || "";
  inp.style.cssText =
    "position:fixed;left:" +
    (r.left - 5) +
    "px;top:" +
    (r.top - 7) +
    "px;width:" +
    Math.max(130, Math.ceil(r.width) + 46) +
    "px;z-index:70;font:600 13px var(--mono);background:var(--panel2);color:var(--txt);border:1px solid var(--cyan);border-radius:6px;padding:3px 7px;box-shadow:var(--shadow-sm)";
  document.body.appendChild(inp);
  inp.focus();
  inp.select();
  let done = false;
  const finish = (commit) => {
    if (done) return;
    done = true;
    const v = inp.value.trim();
    inp.remove();
    if (commit && v && v !== (isSeg ? n.name : n.label)) {
      if (isSeg) n.name = v;
      else n.label = v;
      saveDB();
      render();
      refreshAll();
      select(id);
      setStatus(t("stRenamed") + ": " + v);
    }
  };
  inp.addEventListener("keydown", (ev) => {
    ev.stopPropagation();
    if (ev.key === "Enter") finish(true);
    else if (ev.key === "Escape") finish(false);
  });
  inp.addEventListener("blur", () => finish(true));
}

const SELFLOOP_TYPES = ["l2switch", "l2mgmt", "hub", "l3switch"];
function tryAddLink(a, b) {
  if (a === b && !(isDevice(a) && SELFLOOP_TYPES.indexOf(getNode(a).type) >= 0))
    return;
  if (
    DB.links.some(
      (l) =>
        !l.wl &&
        ((l.fromId === a && l.toId === b) || (l.fromId === b && l.toId === a)),
    )
  ) {
    setStatus(t("stLinkExists"), false);
    return;
  }

  const tgtSeg = (other) => {
    if (isSegment(other) && !getNode(other).isInternet) return other;
    if (isDevice(other)) {
      const ss = neighborsOf(other).filter(
        (n) => isSegment(n) && !getNode(n).isInternet,
      );
      if (ss.length === 1) return ss[0];
    }
    return null;
  };

  const rehomePlan = [];
  [
    [a, b],
    [b, a],
  ].forEach(([id, other]) => {
    if (!isHost(id)) return;
    const hh = getNode(id),
      ns = tgtSeg(other),
      hasLinks = DB.links.some((l) => l.fromId === id || l.toId === id);
    if (hasLinks) {
      if (hh.wifi)
        rehomePlan.push({ id, drop: true, clearWifi: true, seg: ns || null });
      else if (ns && hh.segId && ns !== hh.segId) {
        const keepVlan = isDevice(other) && getNode(other).type === "l2mgmt";
        rehomePlan.push({ id, drop: true, seg: keepVlan ? undefined : ns });
      } else if (!hh.segId && ns) rehomePlan.push({ id, seg: ns });
    } else if (ns) rehomePlan.push({ id, seg: ns });
  });

  for (const [id, other] of [
    [a, b],
    [b, a],
  ]) {
    const seg = isSegment(other) ? getNode(other) : null;
    if (!seg || !seg.isInternet) continue;
    if (isHost(id)) continue;
    const n = getNode(id);
    if (isDevice(id) && ["hub", "l2switch", "l2mgmt", "ap"].includes(n.type)) {
      setStatus(tf("stWanBadDevice", n.label || "?"), false);
      return;
    }
  }

  if (isAdvanced()) {
    const dropIds = new Set(rehomePlan.filter((p) => p.drop).map((p) => p.id));
    for (const id of [a, b]) {
      if (!isDevice(id) && !isHost(id)) continue;
      const x = getNode(id);
      if (isWifiOnlyHost(x)) {
        setStatus(tf("stWifiOnlyNoCable", x.label || x.name || "?"), false);
        return;
      }

      const used = usedPortsPhys(
        x,
        (l) => dropIds.has(l.fromId) || dropIds.has(l.toId),
      );
      const need = a === b ? 2 : 1;
      if (used + need > portsOf(x)) {
        setStatus(tf("portsFull", x.label || x.name || "?", portsOf(x)), false);
        return;
      }
    }
  }

  let rehomed = false;
  rehomePlan.forEach((p) => {
    const hh = getNode(p.id);
    if (!hh) return;
    if (p.drop) {
      DB.links = DB.links.filter((l) => l.fromId !== p.id && l.toId !== p.id);
      rehomed = true;
    }
    if (p.clearWifi) hh.wifi = null;
    if (p.seg !== undefined) hh.segId = p.seg;
  });
  const newLink = { id: uid("l"), fromId: a, toId: b };
  DB.links.push(newLink);

  [a, b].forEach((id) => {
    const D = isDevice(id) ? getNode(id) : isHost(id) ? getNode(id) : null;
    if (D) assignLinkSlots(D);
  });
  [a, b].forEach((id) => {
    const D = isDevice(id) || isHost(id) ? getNode(id) : null;
    if (!D || !D.portCfg) return;
    const pi = portNumOf(newLink, D.id);
    if (!pi || !D.portCfg[pi]) return;
    const cfg = D.portCfg[pi];
    newLink.port = Object.assign({}, newLink.port || {});
    for (const k of [
      "mode",
      "vlan",
      "vlans",
      "sec",
      "trust",
      "bpduGuard",
      "dot1x",
    ]) {
      if (cfg[k] !== undefined && cfg[k] !== null) newLink.port[k] = cfg[k];
    }
    if (cfg.off) newLink.port.off = true;
    if (!portCfgMeaningful(newLink.port)) delete newLink.port;
    delete D.portCfg[pi];
    if (!Object.keys(D.portCfg).length) delete D.portCfg;
  });

  let needVlan = false;
  [
    [a, b],
    [b, a],
  ].forEach(([id, other]) => {
    if (isHost(id) && !getNode(id).segId && isDevice(other)) needVlan = true;
  });

  let vpnHint = false;
  [
    [a, b],
    [b, a],
  ].forEach(([id, other]) => {
    if (vpnHint || !isHost(id) || !isVpnHost(id)) return;
    const ns = isSegment(other) ? other : tgtSeg(other);
    if (ns && segVpnFirewall(ns)) vpnHint = true;
  });
  reconcileWifiClients();
  saveDB();
  render();
  refreshAll();
  if (vpnHint) {
    setStatus(t("stVpnCableHint"), false);
    return;
  }
  setStatus(
    needVlan
      ? t("stCablePickVlan")
      : rehomed
        ? t("stEndpointRehomed")
        : t("stLinkCreated"),
  );
}

function highlightSelectedLink() {
  $("gLinks")
    .querySelectorAll(".link")
    .forEach((ln) =>
      ln.classList.toggle(
        "sel",
        ln.getAttribute("data-link") === selectedLinkId,
      ),
    );
}
function select(id) {
  if (typeof clearBlast === "function") clearBlast();
  selectedId = id;
  selectedLinkId = null;
  selectedNoteId = null;
  for (const k in noteEls) noteEls[k].classList.remove("selected");
  for (const k in nodeEls) nodeEls[k].classList.toggle("selected", k === id);
  highlightSelectedLink();
}
function selectLink(linkId) {
  selectedLinkId = linkId;
  selectedId = null;
  selectedNoteId = null;
  for (const k in noteEls) noteEls[k].classList.remove("selected");
  for (const k in nodeEls) nodeEls[k].classList.remove("selected");
  highlightSelectedLink();
}
function deleteLink(linkId) {
  const l = DB.links.find((l) => l.id === linkId);
  if (!l) return;

  [
    [l.fromId, l.toId],
    [l.toId, l.fromId],
  ].forEach(([hid, apId]) => {
    const h = isHost(hid) && getNode(hid);
    if (h && h.wifi && h.wifi.apId === apId) h.wifi = null;
  });

  [l.fromId, l.toId].forEach((id) => {
    if (!isDevice(id)) return;
    const D = getNode(id);
    if (!D) return;
    if (!(portCfgIsSwitch(D) || D.type === "router" || D.type === "firewall"))
      return;
    const pi = portNumOf(l, D.id);
    if (!pi) return;
    if (!portCfgMeaningful(l.port)) return;
    const cfg = {};
    for (const k of [
      "mode",
      "vlan",
      "vlans",
      "sec",
      "trust",
      "off",
      "bpduGuard",
      "dot1x",
    ]) {
      if (l.port[k] !== undefined && l.port[k] !== null)
        cfg[k] = JSON.parse(JSON.stringify(l.port[k]));
    }
    if (!D.portCfg) D.portCfg = {};
    D.portCfg[pi] = cfg;
  });
  DB.links = DB.links.filter((x) => x.id !== linkId);
  reconcileWifiClients();
  if (selectedLinkId === linkId) selectedLinkId = null;
  saveDB();
  render();
  refreshAll();
  setStatus(t("stLinkDeleted"));
}

const LAG_TYPES = ["l2switch", "l2mgmt", "l3switch", "router"];
function lagEligible(id) {
  const d = getNode(id);
  return !!d && isDevice(id) && LAG_TYPES.indexOf(d.type) >= 0;
}

function parallelLinks(a, b) {
  return DB.links.filter(
    (l) => (l.fromId === a && l.toId === b) || (l.fromId === b && l.toId === a),
  );
}

function nextLagId() {
  let i = 1;
  const used = new Set(DB.links.map((l) => l.lag).filter((x) => x != null));
  while (used.has(i)) i++;
  return i;
}

function linkLagCandidate(l) {
  return (
    !!l &&
    lagEligible(l.fromId) &&
    lagEligible(l.toId) &&
    parallelLinks(l.fromId, l.toId).length >= 2
  );
}
function lagBundle(linkId) {
  const l = DB.links.find((x) => x.id === linkId);
  if (!l || !linkLagCandidate(l)) return;
  const members = parallelLinks(l.fromId, l.toId);

  const existing = members.map((m) => m.lag).find((x) => x != null);
  const id = existing != null ? existing : nextLagId();
  members.forEach((m) => {
    m.lag = id;
  });
  saveDB();
  render();
  refreshAll();
  setStatus(tf("lagBundled", members.length));
}
function lagUnbundle(linkId) {
  const l = DB.links.find((x) => x.id === linkId);
  if (!l) return;
  const gid = l.lag;
  const members =
    gid != null
      ? DB.links.filter((m) => m.lag === gid)
      : parallelLinks(l.fromId, l.toId);
  members.forEach((m) => {
    delete m.lag;
  });
  saveDB();
  render();
  refreshAll();
  setStatus(t("lagUnbundled"));
}

const ZONE_ROLE_VAR = {
  inside: "--green",
  outside: "--red",
  dmz: "--amber",
  vpn: "--violet",
};

function collectZoneNodes(startId, set) {
  if (!getNode(startId) || (isSegment(startId) && isInternetSeg(startId)))
    return;
  const q = [startId],
    seen = new Set([startId]);
  set.add(startId);
  while (q.length) {
    const c = q.shift();
    for (const nb of neighborsOf(c)) {
      if (seen.has(nb)) continue;
      seen.add(nb);
      const n = getNode(nb);
      if (!n) continue;
      if (isDevice(nb) && n.type === "firewall") continue;
      if (isSegment(nb) && isInternetSeg(nb)) continue;
      set.add(nb);
      q.push(nb);
    }
  }
}

function fwZoneGroups() {
  const raw = [];
  if (!DB || !Array.isArray(DB.devices)) return raw;
  for (const fw of DB.devices) {
    if (fw.type !== "firewall" || fw.zoneMode === false) continue;
    ensureFirewallZones(fw);
    for (const z of fw.zones || []) {
      const ifaces = fwInterfaces(fw).filter(
        (it) => fw.ifaceZones[it.link.id] === z.id,
      );
      if (!ifaces.length) continue;
      const nodes = new Set();
      if (z.role === "outside") {
        ifaces.forEach((it) => {
          if (isSegment(it.neighborId)) nodes.add(it.neighborId);
        });
      } else {
        ifaces.forEach((it) => collectZoneNodes(it.neighborId, nodes));
      }

      const zoneSegs = new Set([...nodes].filter((id) => isSegment(id)));
      if (zoneSegs.size)
        DB.hosts.forEach((h) => {
          if (zoneSegs.has(h.segId)) nodes.add(h.id);
        });
      if (!nodes.size) continue;

      raw.push({
        fwLabel: fw.label,
        role: z.role,
        name: z.name || roleName(z.role),
        nodes,
        key: z.role + "|" + [...nodes].sort().join(","),
      });
    }
  }
  const byKey = {};
  raw.forEach((g) => {
    if (!byKey[g.key]) byKey[g.key] = g;
  });
  return Object.values(byKey);
}

function nodeXY(id) {
  const n = getNode(id);
  if (n && isFinite(n.x) && isFinite(n.y)) return { x: n.x, y: n.y };
  const e = nodeEls[id];
  if (
    e &&
    e.transform &&
    e.transform.baseVal &&
    e.transform.baseVal.numberOfItems
  ) {
    const m = e.transform.baseVal.consolidate();
    if (m && isFinite(m.matrix.e) && isFinite(m.matrix.f))
      return { x: m.matrix.e, y: m.matrix.f };
  }
  return null;
}
let _zoneGroupsCache = null;
function renderZoneOverlays(reuse) {
  const g = $("gZones");
  if (!g) return;
  g.innerHTML = "";
  if (!showZones) {
    _zoneGroupsCache = null;
    return;
  }
  const grps =
    reuse && _zoneGroupsCache
      ? _zoneGroupsCache
      : (_zoneGroupsCache = fwZoneGroups());
  const nameCount = {};
  grps.forEach((g) => (nameCount[g.name] = (nameCount[g.name] || 0) + 1));
  for (const grp of grps) {
    let minX = 1e9,
      minY = 1e9,
      maxX = -1e9,
      maxY = -1e9;
    grp.nodes.forEach((id) => {
      const n = getNode(id);
      if (!n) return;
      const p = nodeXY(id);
      if (!p) return;
      const d = nodeDims(n);
      minX = Math.min(minX, p.x - d.w / 2);
      maxX = Math.max(maxX, p.x + d.w / 2);
      minY = Math.min(minY, p.y - d.h / 2);
      maxY = Math.max(maxY, p.y + d.h / 2);
    });
    if (!isFinite(minX) || minX > maxX) continue;
    const pad = 24;
    minX -= pad;
    minY -= pad;
    maxX += pad;
    maxY += pad;
    const cvar = "var(" + (ZONE_ROLE_VAR[grp.role] || "--cyan") + ")";
    const zg = el("g", { class: "zone-auto" });
    zg.appendChild(
      el("rect", {
        class: "zone-fill",
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY,
        rx: 14,
        style: "fill:" + cvar,
      }),
    );
    zg.appendChild(
      el("rect", {
        class: "zone-box",
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY,
        rx: 14,
        style: "stroke:" + cvar,
      }),
    );
    const tx = el("text", {
      class: "zone-label",
      x: minX + 12,
      y: minY - 8,
      style: "fill:" + cvar,
    });
    tx.textContent =
      (nameCount[grp.name] > 1 ? grp.fwLabel + " · " : "") + grp.name;
    zg.appendChild(tx);
    g.appendChild(zg);
  }
}

function updateZonesBtn() {
  const b = $("btnZones");
  if (!b) return;
  const has = fwZoneGroups().length > 0;
  b.classList.toggle("on", showZones && has);
  b.classList.toggle("zbtn-empty", !has);
  b.disabled = !has;
  if (has) b.removeAttribute("title");
  else b.title = t("zoneNoneHint");
}
function toggleZones() {
  const anyZone = fwZoneGroups().length > 0;
  if (!anyZone) {
    setStatus(t("zoneNoneHint"));
    return;
  }
  showZones = !showZones;
  try {
    localStorage.setItem("netsim_zones", showZones ? "1" : "0");
  } catch (e) {}
  renderZoneOverlays();
  updateZonesBtn();
  setStatus(showZones ? t("stZonesOn") : t("stZonesOff"));
}
function noteById(id) {
  return (DB.notes || []).find((n) => n.id === id) || null;
}
function noteUid() {
  let i = 1;
  while (noteById("note" + i)) i++;
  return "note" + i;
}
function buildNote(n) {
  const g = el("g", {
    class: "note" + (selectedNoteId === n.id ? " selected" : ""),
    "data-note": n.id,
    transform: `translate(${n.x},${n.y})`,
  });
  noteEls[n.id] = g;
  const lines = String(n.text || "").split("\n");
  const PADX = 10,
    PADY = 7,
    LH = 16;
  g.appendChild(
    el("rect", {
      class: "note-box",
      x: 0,
      y: 0,
      rx: 8,
      width: 120,
      height: PADY * 2 + LH * Math.max(1, lines.length),
    }),
  );
  const tx = el("text", { class: "note-text", x: PADX, y: PADY + 12 });
  lines.forEach((ln, i) => {
    const ts = el("tspan", { x: PADX, dy: i === 0 ? 0 : LH });
    ts.textContent = ln || " ";
    tx.appendChild(ts);
  });
  g.appendChild(tx);
  return g;
}
function fitNotes() {
  for (const id in noteEls) {
    const g = noteEls[id];
    if (!g) continue;
    const tx = g.querySelector(".note-text"),
      box = g.querySelector(".note-box");
    if (!tx || !box) continue;
    let bb;
    try {
      bb = tx.getBBox();
    } catch (e) {
      continue;
    }
    box.setAttribute("width", Math.max(44, Math.ceil(bb.width) + 20));
  }
}
function selectNote(id) {
  selectedNoteId = id;
  selectedId = null;
  selectedLinkId = null;
  for (const k in nodeEls) nodeEls[k].classList.remove("selected");
  highlightSelectedLink();
  for (const k in noteEls) noteEls[k].classList.toggle("selected", k === id);
}
function addNote() {
  editNote(null);
}
function removeNote(id) {
  DB.notes = (DB.notes || []).filter((n) => n.id !== id);
  if (selectedNoteId === id) selectedNoteId = null;
  saveDB();
  render();
  setStatus(t("stNoteDeleted"));
}
function editNote(id) {
  const existing = id ? noteById(id) : null;
  if (id && !existing) return;
  openModal(
    "<h2>" +
      icon("pencil", "ico-a") +
      t("noteTitle") +
      "</h2>" +
      '<div class="mfield"><textarea id="noteTa" rows="4" style="width:100%;box-sizing:border-box;resize:vertical;font-family:var(--sans)" placeholder="' +
      esc(t("notePh")) +
      '">' +
      esc(existing ? existing.text : "") +
      "</textarea></div>" +
      '<div class="actions">' +
      (existing
        ? '<button class="btn" id="noteDel">' +
          icon("trash") +
          t("noteDelete") +
          "</button>"
        : "") +
      '<span style="flex:1"></span><button class="btn" id="noteCancel">' +
      t("fbCancel") +
      '</button><button class="btn primary" id="noteSave">' +
      t("noteSave") +
      "</button></div>",
  );
  const ta = $("noteTa");
  if (ta) {
    ta.focus();
    try {
      ta.setSelectionRange(ta.value.length, ta.value.length);
    } catch (e) {}
  }
  $("noteSave").onclick = () => {
    const v = $("noteTa") ? $("noteTa").value : "";
    if (!v.trim()) {
      if (existing) removeNote(existing.id);
      closeModal();
      return;
    }
    if (existing) {
      existing.text = v;
      saveDB();
      render();
      selectNote(existing.id);
    } else {
      const c = spawnSpot();
      const n = {
        id: noteUid(),
        x: Math.round(c.x - NOTE_OFF.x),
        y: Math.round(c.y - NOTE_OFF.y),
        text: v,
      };
      (DB.notes || (DB.notes = [])).push(n);
      saveDB();
      render();
      selectNote(n.id);
      ensureVisible(c.x, c.y);
      setStatus(t("stNoteAdded"));
    }
    closeModal();
  };
  if (existing && $("noteDel"))
    $("noteDel").onclick = () => {
      closeModal();
      removeNote(existing.id);
    };
  $("noteCancel").onclick = closeModal;
}

document.addEventListener("keydown", (e) => {
  const _af = document.activeElement,
    _inField =
      _af &&
      (_af.tagName === "INPUT" ||
        _af.tagName === "SELECT" ||
        _af.tagName === "TEXTAREA");
  if (!_inField && (e.ctrlKey || e.metaKey) && !e.altKey) {
    const k = (e.key || "").toLowerCase();
    if (k === "z" && !e.shiftKey) {
      e.preventDefault();
      undo();
      return;
    }
    if (k === "y" || (k === "z" && e.shiftKey)) {
      e.preventDefault();
      redo();
      return;
    }
  }
  if (e.key === "Delete" || e.key === "Backspace") {
    const act = document.activeElement;
    if (
      act &&
      (act.tagName === "INPUT" ||
        act.tagName === "SELECT" ||
        act.tagName === "TEXTAREA")
    )
      return;
    if ($("modalBg").classList.contains("show")) return;
    if (selectedLinkId) {
      deleteLink(selectedLinkId);
    } else if (selectedNoteId) {
      removeNote(selectedNoteId);
    } else if (selectedId) {
      deleteNode(selectedId);
    }
  }
  if (e.key === "Escape") {
    hideCtx();
    if (typeof closeTour === "function") closeTour();
    if ($("confirmBg") && $("confirmBg").classList.contains("show")) {
      $("confirmBg").classList.remove("show");
      const c = _confirmCancel;
      _confirmCancel = null;
      if (c) c();
    } else if ($("welcomeBg") && $("welcomeBg").classList.contains("show")) {
      closeWelcome(true);
    } else if ($("portDlgBg") && $("portDlgBg").classList.contains("show")) {
      closePortDlg();
    } else {
      closeModal();
      select(null);
    }
  }
});

function showCtx(x, y, id) {
  const m = $("ctxmenu");
  m.innerHTML = "";
  const n = getNode(id);
  const mk = (label, fn, cls, ico) => {
    const b = document.createElement("button");
    b.innerHTML = (ico ? icon(ico) : "") + esc(label);
    if (cls) b.className = cls;
    b.onclick = () => {
      hideCtx();
      fn();
    };
    m.appendChild(b);
  };
  mk(t("ctxEdit"), () => openEditor(id), null, "pencil");
  if (isDevice(id) || isHost(id)) {
    const qLbl = n.quar ? t("ctxUnquar") : t("ctxQuar");
    mk(
      qLbl,
      () => {
        if (!n.quar) logEvent("crit", n.id, t("sysEvQuar"));
        n.quar = !n.quar;
        saveDB();
        render();
        refreshAll();
        setStatus(
          n.quar ? n.label + " " + t("stQuar") : n.label + " " + t("stUnquar"),
        );
      },
      null,
      n.quar ? "checkcircle" : "shield",
    );
    const dnLbl = isHost(id)
      ? n.down
        ? t("ctxHostUp")
        : t("ctxHostDown")
      : n.down
        ? t("ctxRestore")
        : t("ctxDown");
    mk(
      dnLbl,
      () => {
        if (!n.down) logEvent("crit", n.id, t("sysEvDown"));
        n.down = !n.down;
        saveDB();
        render();
        refreshAll();
        if (!n.down) logEvent("info", n.id, t("sysEvUp"));
        setStatus(
          n.down
            ? n.label + " " + t("stDown")
            : n.label + " " + t("stRestored"),
        );
      },
      null,
      n.down ? "checkcircle" : "power",
    );
  }
  const hr = document.createElement("hr");
  m.appendChild(hr);
  mk(t("ctxDelete"), () => deleteNode(id), "del", "trash");
  m.style.left = Math.min(x, innerWidth - 170) + "px";
  m.style.top = Math.min(y, innerHeight - 150) + "px";
  m.classList.add("show");
  select(id);
}
function showCtxLink(x, y, linkId) {
  const l = DB.links.find((l) => l.id === linkId);
  if (!l) return;
  const m = $("ctxmenu");
  m.innerHTML = "";
  const a = getNode(l.fromId),
    b = getNode(l.toId);
  const head = document.createElement("div");
  head.style.cssText = "padding:6px 12px;font-size:11px;color:var(--muted)";
  head.textContent =
    t("ctxLinkLabel") +
    " " +
    ((a && (a.name || a.label)) || "?") +
    " — " +
    ((b && (b.name || b.label)) || "?");
  m.appendChild(head);
  const hr = document.createElement("hr");
  m.appendChild(hr);
  const cur = baseLinkCost(l);
  const cbtn = document.createElement("button");
  cbtn.innerHTML =
    icon("share") +
    esc(t("ctxLinkCost")) +
    '  <span style="color:var(--cyan);font-weight:700">' +
    cur +
    "</span>";
  cbtn.onclick = () => {
    hideCtx();
    openLinkCostEditor(linkId);
  };
  m.appendChild(cbtn);

  if (l.lag != null) {
    const ub = document.createElement("button");
    ub.innerHTML = icon("share") + esc(t("ctxLagUnbundle"));
    ub.onclick = () => {
      hideCtx();
      lagUnbundle(linkId);
    };
    m.appendChild(ub);
  } else if (linkLagCandidate(l)) {
    const bb = document.createElement("button");
    bb.innerHTML = icon("share") + esc(t("ctxLagBundle"));
    bb.onclick = () => {
      hideCtx();
      lagBundle(linkId);
    };
    m.appendChild(bb);
  }
  const cap = document.createElement("button");
  cap.innerHTML = icon("monitor") + esc(t("ctxCapture"));
  cap.onclick = () => {
    hideCtx();
    openCaptureModal(linkId);
  };
  m.appendChild(cap);
  const btn = document.createElement("button");
  btn.innerHTML = icon("trash") + esc(t("ctxDeleteLink"));
  btn.className = "del";
  btn.onclick = () => {
    hideCtx();
    deleteLink(linkId);
  };
  m.appendChild(btn);
  m.style.left = Math.min(x, innerWidth - 180) + "px";
  m.style.top = Math.min(y, innerHeight - 150) + "px";
  m.classList.add("show");
  selectLink(linkId);
}
function openLinkCostEditor(linkId) {
  const l = DB.links.find((l) => l.id === linkId);
  if (!l) return;
  const a = getNode(l.fromId),
    b = getNode(l.toId);
  const cur = typeof l.cost === "number" && l.cost > 0 ? l.cost : "";
  const curSpeed = l.speed > 0 ? l.speed : 0;
  const curDuplex = l.duplex === "half" ? "half" : "full";
  const spOpts =
    '<option value="0"' +
    (curSpeed ? "" : " selected") +
    ">" +
    esc(t("lcSpeedAuto")) +
    "</option>" +
    SPEED_OPTS.map(
      (mb) =>
        '<option value="' +
        mb +
        '"' +
        (curSpeed === mb ? " selected" : "") +
        ">" +
        speedLabel(mb) +
        "</option>",
    ).join("");
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
  const selCss =
    "padding:7px 9px;font:600 13px var(--mono);background:var(--panel);color:var(--txt);border:1px solid var(--line2);border-radius:7px";
  // A wireless hop has no cable to set a speed on: its capacity falls out of the
  // radio model, so show that rather than a dropdown that could do nothing.
  const isWl = !!l.wl || isWirelessClientLink(l);
  const wlMb = isWl ? linkMbits(l) : 0;
  const wlCellInfo = isWl ? (l.wl ? wlBackhaulCell(l) : wlClientCell(l)) : null;
  const speedRow = isWl
    ? '<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px"><label style="font-size:12.5px;color:var(--txt);font-weight:600;min-width:78px">' +
      esc(t("lcSpeedLabel")) +
      "</label>" +
      '<span style="' +
      selCss +
      'display:inline-block">' +
      (wlMb > 0 ? speedLabel(wlMb) : esc(t("wlOutOfRange"))) +
      "</span>" +
      '<span style="font-size:11.5px;color:var(--muted)">' +
      esc(t("wlSpeedDerived")) +
      "</span></div>" +
      '<p style="color:var(--muted);font-size:11.5px;line-height:1.55;margin:0 0 10px">' +
      t("wlSpeedDerivedHint") +
      (wlCellInfo && wlCellInfo.distM !== Infinity
        ? " (" +
          t("wlSignalLabel") +
          " " +
          Math.round(wlCellInfo.rssi) +
          " dBm · " +
          Math.round(wlCellInfo.distM) +
          " m · " +
          esc(wlBandLabel(wlCellInfo.band)) +
          " ch " +
          wlCellInfo.ch +
          ")"
        : "") +
      "</p>"
    : '<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px"><label for="lcSpeed" style="font-size:12.5px;color:var(--txt);font-weight:600;min-width:78px">' +
      esc(t("lcSpeedLabel")) +
      "</label>" +
      '<select id="lcSpeed" style="' +
      selCss +
      '">' +
      spOpts +
      "</select>" +
      '<select id="lcDuplex" style="' +
      selCss +
      '">' +
      dxOpts +
      "</select></div>";
  openModal(
    "<h2>" +
      icon("share", "ico-a") +
      esc(t("lcTitle")) +
      "</h2>" +
      '<p style="color:var(--muted);font-size:11.5px;line-height:1.5;margin:0 0 6px;font-weight:700">' +
      esc(
        ((a && (a.name || a.label)) || "?") +
          " — " +
          ((b && (b.name || b.label)) || "?"),
      ) +
      "</p>" +
      (l.wl === "rep"
        ? '<p style="color:var(--amber);font-size:11.5px;font-weight:700;margin:0 0 8px">' +
          esc(t("apRepHalfNote")) +
          "</p>"
        : "") +
      '<p style="color:var(--muted);font-size:12px;line-height:1.55;margin:0 0 12px">' +
      t("lcHint") +
      "</p>" +
      speedRow +
      '<label class="toggle-row" style="margin:0 0 10px;font-size:12.5px"><input type="checkbox" id="lcQos" title="' +
      esc(t("lcQosTitle")) +
      '"' +
      (l.qos ? " checked" : "") +
      "><span>" +
      esc(t("lcQos")) +
      "</span></label>" +
      '<label class="toggle-row" style="margin:0 0 10px;font-size:12.5px"><input type="checkbox" id="lcCong"' +
      (l.congested ? " checked" : "") +
      "><span>" +
      esc(t("lcCongested")) +
      "</span></label>" +
      '<div id="lcDerived" style="font-size:11.5px;color:var(--cyan);font-weight:700;margin:0 0 12px;min-height:16px"></div>' +
      '<div style="display:flex;align-items:center;gap:10px;margin-bottom:14px"><label for="lcInput" style="font-size:12.5px;color:var(--txt);font-weight:600;min-width:78px">' +
      esc(t("lcLabel")) +
      "</label>" +
      '<input type="number" id="lcInput" min="1" max="65535" placeholder="' +
      esc(t("lcAutoPh")) +
      '" value="' +
      cur +
      '" style="width:130px;padding:7px 9px;font:600 14px var(--mono);background:var(--panel);color:var(--txt);border:1px solid var(--line2);border-radius:7px"></div>' +
      '<div class="actions"><button class="btn" id="lcResetBtn">' +
      esc(t("lcReset")) +
      '</button><button class="btn primary" id="lcSaveBtn">' +
      esc(t("lcSave")) +
      "</button></div>",
  );
  const upDerived = () => {
    const dv = $("lcDerived");
    if (!dv) return;
    const ov = +($("lcInput") || {}).value || 0;
    let msg = "";
    if (ov > 0) msg = tf("lcDerivedManual", ov);
    else if (isWl) {
      const mb = linkMbits(l);
      msg =
        (mb > 0 ? speedLabel(mb) : t("wlOutOfRange")) +
        " → " +
        tf("lcDerivedAuto", baseLinkCost(l));
    } else {
      const mb = +($("lcSpeed") || {}).value || 0;
      if (mb > 0) msg = speedLabel(mb) + " → " + tf("lcDerivedAuto", speedCost(mb));
      else msg = speedLabel(1000) + " → " + tf("lcDerivedAuto", OSPF_AUTO_COST);
      if (($("lcDuplex") || {}).value === "half") msg += " · " + t("lcHalfNote");
    }
    dv.textContent = msg;
  };
  const apply = (v) => {
    const link = DB.links.find((x) => x.id === linkId);
    if (!link) return;
    if (!v || v < 1) {
      delete link.cost;
    } else {
      link.cost = Math.min(65535, Math.round(v));
    }
    // On a wireless hop the speed/duplex controls are not rendered, so leave any
    // stale hand-set values alone -- capacity comes from the radio model.
    if (!isWl) {
      const mb = +($("lcSpeed") || {}).value || 0;
      if (mb > 0) link.speed = mb;
      else delete link.speed;
      const dx = ($("lcDuplex") || {}).value;
      if (dx === "half") link.duplex = "half";
      else delete link.duplex;
    }
    if (($("lcCong") || {}).checked) link.congested = true;
    else delete link.congested;
    if (($("lcQos") || {}).checked) link.qos = true;
    else delete link.qos;
    saveDB();
    render();
    refreshAll();
    closeModal();
    setStatus(t("lcSaved") + " · " + baseLinkCost(link));
  };
  const inp = $("lcInput");
  if (inp) {
    inp.focus();
    inp.oninput = upDerived;
    inp.onkeydown = (e) => {
      if (e.key === "Enter") apply(+inp.value);
    };
  }
  if ($("lcSpeed")) $("lcSpeed").onchange = upDerived;
  if ($("lcDuplex")) $("lcDuplex").onchange = upDerived;
  upDerived();
  if ($("lcSaveBtn")) $("lcSaveBtn").onclick = () => apply(+$("lcInput").value);
  if ($("lcResetBtn"))
    $("lcResetBtn").onclick = () => {
      const link = DB.links.find((x) => x.id === linkId);
      if (link) {
        delete link.cost;
        delete link.speed;
        delete link.duplex;
        delete link.congested;
        delete link.qos;
      }
      saveDB();
      render();
      refreshAll();
      closeModal();
      setStatus(
        t("lcSaved") + " · " + (link ? baseLinkCost(link) : OSPF_AUTO_COST),
      );
    };
}
function hideCtx() {
  $("ctxmenu").classList.remove("show");
}
document.addEventListener(
  "pointerdown",
  (e) => {
    if (!e.target.closest("#ctxmenu")) hideCtx();
  },
  true,
);

function deleteNode(id) {
  const n = getNode(id);
  if (!n) return;

  const ownedNets = DB.segments.filter((s) => s.gwId === id).map((s) => s.id);
  DB.devices.forEach((d) => {
    if (d.haPeer === id) d.haPeer = null;
  });
  delete lbRuntime[id];
  DB.devices = DB.devices.filter((d) => d.id !== id);
  DB.segments = DB.segments.filter(
    (s) => s.id !== id && ownedNets.indexOf(s.id) < 0,
  );
  DB.hosts = (DB.hosts || []).filter((h) => h.id !== id);
  const gone = new Set([id].concat(ownedNets));
  DB.links = DB.links.filter((l) => !gone.has(l.fromId) && !gone.has(l.toId));

  (DB.hosts || []).forEach((h) => {
    if (gone.has(h.segId)) h.segId = null;
  });
  DB.devices.forEach((d) =>
    (d.ssids || []).forEach((s) => {
      if (gone.has(s.segId)) s.segId = null;
    }),
  );
  reconcileWifiClients();
  if (selectedId === id) selectedId = null;
  saveDB();
  render();
  refreshAll();
  setStatus(t("stDeleted") + ": " + (n.label || n.name));
}

let palDragType = null;
