"use strict";

function _drawable(id) {
  return isDevice(id) || isHost(id) || (isSegment(id) && isInternetSeg(id));
}

function _layoutRank(id) {
  const n = getNode(id);
  if (!n) return 6;
  const t = n.type;
  if (t === "firewall") return 0;
  if (t === "l3switch" || t === "router") return 1;
  if (t === "l2switch" || t === "l2mgmt" || t === "hub") return 2;
  if (t === "ap") return 3;
  if (isHost(id)) return 5;
  return 4;
}

function _treeLayout(nodeIds, rootIds) {
  const set = new Set(nodeIds),
    parent = {},
    q = [];
  rootIds.forEach((id) => {
    if (set.has(id) && parent[id] === undefined) {
      parent[id] = null;
      q.push(id);
    }
  });
  const vis = new Set(q);
  while (q.length) {
    const c = q.shift();
    for (const nb of neighborsOf(c)) {
      if (set.has(nb) && !vis.has(nb)) {
        vis.add(nb);
        parent[nb] = c;
        q.push(nb);
      }
    }
  }
  const children = {};
  nodeIds.forEach((id) => {
    if (!vis.has(id)) parent[id] = null;
    const p = parent[id];
    if (p != null) (children[p] = children[p] || []).push(id);
  });
  const cmp = (a, b) =>
    _layoutRank(a) - _layoutRank(b) ||
    String((getNode(a) && getNode(a).label) || a).localeCompare(
      String((getNode(b) && getNode(b).label) || b),
    );
  Object.keys(children).forEach((k) => children[k].sort(cmp));
  const roots = nodeIds.filter((id) => parent[id] == null).sort(cmp);

  const seen = new Set(),
    MAXLEAFCOLS = 4,
    LEAFROWS = 2,
    LEAF_PITCH = 0.88;

  const HW = (id) => ((isHost(id) ? 152 : 188) / 2 + 5) / 178;

  const SHELF_W = 14;
  const SHELF_IND = 1.6;

  function mkItem(cells) {
    const L = [],
      R = [];
    cells.forEach((c) => {
      const hw = HW(c[0]),
        r = c[2];
      if (L[r] === undefined || c[1] - hw < L[r]) L[r] = c[1] - hw;
      if (R[r] === undefined || c[1] + hw > R[r]) R[r] = c[1] + hw;
    });
    return { cells, L, R };
  }

  function join(acc, it, extra) {
    let sh = 0;
    for (let r = 0; r < it.L.length; r++) {
      if (it.L[r] === undefined || acc.R[r] === undefined) continue;
      const need = acc.R[r] - it.L[r] + (extra || 0);
      if (need > sh) sh = need;
    }
    it.cells.forEach((c) => {
      c[1] += sh;
    });
    for (let r = 0; r < it.L.length; r++) {
      if (it.L[r] === undefined) continue;
      const l = it.L[r] + sh,
        rr = it.R[r] + sh;
      if (acc.L[r] === undefined || l < acc.L[r]) acc.L[r] = l;
      if (acc.R[r] === undefined || rr > acc.R[r]) acc.R[r] = rr;
    }
    acc.cells = acc.cells.concat(it.cells);
  }
  const itemW = (it) => {
    let l = Infinity,
      r = -Infinity;
    for (let i = 0; i < it.L.length; i++) {
      if (it.L[i] === undefined) continue;
      if (it.L[i] < l) l = it.L[i];
      if (it.R[i] > r) r = it.R[i];
    }
    return isFinite(l) ? r - l : 0;
  };
  const itemRows = (it) => {
    let m = 0;
    it.cells.forEach((c) => {
      if (c[2] > m) m = c[2];
    });
    return m + 1;
  };
  const itemRoot = (it) => {
    const t = it.cells.filter((c) => c[2] === 0);
    return t.length === 1 ? t[0][0] : null;
  };

  const clone = (it) => mkItem(it.cells.map((c) => [c[0], c[1], c[2]]));
  function shelve(items) {
    if (items.length < 3) return null;

    const one = clone(items[0]);
    for (let i = 1; i < items.length; i++) join(one, clone(items[i]), 0);
    const w1 = itemW(one);
    if (w1 <= SHELF_W) return null;

    const out = [];
    let cur = null,
      prevRoot = null;
    items.forEach((it) => {
      const root = itemRoot(it);
      const ha = !!(
        root &&
        prevRoot &&
        getNode(root) &&
        getNode(root).haPeer === prevRoot
      );
      prevRoot = root;
      if (!cur) {
        cur = clone(it);
        return;
      }
      const test = clone(cur);
      join(test, clone(it), 0);
      if (!ha && itemW(test) > SHELF_W) {
        out.push(cur);
        cur = clone(it);
      } else cur = test;
    });
    if (cur) out.push(cur);
    return out.length > 1 ? out : null;
  }
  function sub(id) {
    if (seen.has(id)) return null;
    seen.add(id);
    const kids = (children[id] || []).filter((k) => !seen.has(k));
    if (!kids.length) return mkItem([[id, 0, 0]]);
    const inner = kids.filter((k) =>
      (children[k] || []).some((x) => !seen.has(x)),
    );
    const leaves = kids.filter((k) => !inner.includes(k));
    const items = [];
    inner.forEach((k) => {
      const s = sub(k);
      if (s) items.push(s);
    });
    if (leaves.length) {
      const g =
        leaves.length <= 3
          ? leaves.length
          : Math.max(
              1,
              Math.min(MAXLEAFCOLS, Math.ceil(leaves.length / LEAFROWS)),
            );
      const lc = [];
      leaves.forEach((k, i) => {
        seen.add(k);
        lc.push([k, (i % g) * LEAF_PITCH, Math.floor(i / g)]);
      });
      items.push(mkItem(lc));
    }
    if (!items.length) return mkItem([[id, 0, 0]]);
    const shelves = shelve(items.slice());
    let blk, mc;
    if (shelves) {
      const cells = [];
      let rowOff = 0;
      shelves.forEach((sh) => {
        let l = Infinity;
        for (let i = 0; i < sh.L.length; i++)
          if (sh.L[i] !== undefined && sh.L[i] < l) l = sh.L[i];
        const dx = SHELF_IND - (isFinite(l) ? l : 0);
        sh.cells.forEach((c) => {
          cells.push([c[0], c[1] + dx, c[2] + rowOff]);
        });
        rowOff += itemRows(sh);
      });
      blk = mkItem(cells);
      mc = SHELF_IND / 2;
    } else {
      blk = items.shift();
      items.forEach((it) => join(blk, it, 0));
      const top = blk.cells.filter((c) => c[2] === 0).map((c) => c[1]);
      mc = top.length
        ? (Math.min.apply(null, top) + Math.max.apply(null, top)) / 2
        : 0;
    }
    blk.cells.forEach((c) => {
      c[2] += 1;
    });
    return mkItem(blk.cells.concat([[id, mc, 0]]));
  }
  let all = null;
  roots.forEach((r) => {
    const s = sub(r);
    if (!s) return;
    if (!all) all = s;
    else join(all, s, 0.5);
  });
  if (!all) all = mkItem([]);
  const pos = {};
  let maxRow = 0,
    minC = Infinity,
    maxC = -Infinity;
  all.cells.forEach((c) => {
    if (c[2] > maxRow) maxRow = c[2];
    if (c[1] < minC) minC = c[1];
    if (c[1] > maxC) maxC = c[1];
  });
  const off = isFinite(minC) ? minC : 0;
  all.cells.forEach((c) => {
    pos[c[0]] = { col: c[1] - off, row: c[2] };
  });
  let col = isFinite(maxC) ? maxC - off + 1 : 0;
  nodeIds.forEach((id) => {
    if (!seen.has(id)) {
      seen.add(id);
      pos[id] = { col: col++, row: 0 };
    }
  });
  return { pos, cols: col, maxRow };
}

function relayout() {
  const all = [
    ...DB.devices,
    ...DB.segments.filter((s) => s.isInternet),
    ...(DB.hosts || []),
  ];
  if (!all.length) {
    fitView();
    return;
  }
  const drawIds = all.map((n) => n.id).filter(_drawable);
  const colGap = 178,
    rowGap = 106,
    x0 = 120,
    y0 = 70;

  const haFix = (pos) => {
    const done = new Set();
    Object.keys(pos).forEach((id) => {
      const d = getNode(id);
      if (!d || !d.haPeer || !pos[d.haPeer] || done.has(id)) return;
      done.add(id);
      done.add(d.haPeer);
      const a = pos[id],
        b = pos[d.haPeer];
      const prim = a.row <= b.row ? a : b,
        sec = a.row <= b.row ? b : a;
      sec.row = prim.row;
      sec.col = prim.col + 1.12;
    });
  };

  const seeds = DB.segments
    .filter((s) => s.isInternet || s.subnet === "0.0.0.0/0")
    .map((s) => s.id);
  const { pos } = _treeLayout(drawIds, seeds.length ? seeds : [all[0].id]);
  haFix(pos);
  drawIds.forEach((id) => {
    const n = getNode(id),
      p = pos[id];
    if (!n || !p) return;
    n.x = Math.round(x0 + p.col * colGap);
    n.y = Math.round(y0 + p.row * rowGap);
  });

  const cardW = (id) => (isHost(id) ? 152 : 188),
    MINGUT = 10;
  const rows = {};
  drawIds.forEach((id) => {
    const n = getNode(id);
    if (n && isFinite(n.x)) (rows[n.y] = rows[n.y] || []).push(n);
  });
  Object.keys(rows).forEach((y) => {
    const r = rows[y].sort((a, b) => a.x - b.x);
    for (let i = 1; i < r.length; i++) {
      const min =
        r[i - 1].x + (cardW(r[i - 1].id) + cardW(r[i].id)) / 2 + MINGUT;
      if (r[i].x < min) r[i].x = Math.round(min);
    }
  });
  render();
  fitView();
  saveDB();
}

let drag = null;
let linking = null;
let pan = null;
let lastClick = { id: null, t: 0 };

svg.addEventListener("pointerdown", (e) => {
  if (_pinch) return;
  hideCtx();
  const portEl = e.target.closest(".port,.port-hit");
  if (portEl) {
    const fromId = portEl.getAttribute("data-id");
    const ghost = el("line", { class: "ghostlink" });
    $("gOverlay").appendChild(ghost);
    const p = toSvgPoint(e.clientX, e.clientY);
    const f = getNode(fromId);
    ghost.setAttribute("x1", f.x);
    ghost.setAttribute("y1", f.y);
    ghost.setAttribute("x2", p.x);
    ghost.setAttribute("y2", p.y);
    linking = {
      fromId,
      ghost,
      moved: false,
      startX: e.clientX,
      startY: e.clientY,
    };
    svg.setPointerCapture(e.pointerId);
    e.preventDefault();
    return;
  }
  const nodeEl = e.target.closest(".node");
  if (nodeEl) {
    const id = nodeEl.getAttribute("data-id");
    const n = getNode(id);
    const p = toSvgPoint(e.clientX, e.clientY);
    drag = {
      id,
      offX: p.x - n.x,
      offY: p.y - n.y,
      moved: false,
      startX: e.clientX,
      startY: e.clientY,
      ctrl: e.ctrlKey || e.metaKey,
    };
    nodeEl.classList.add("dragging");
    svg.setPointerCapture(e.pointerId);
    e.preventDefault();
    return;
  }
  const noteEl = e.target.closest(".note");
  if (noteEl) {
    const id = noteEl.getAttribute("data-note"),
      nn = noteById(id);
    if (nn) {
      const p = toSvgPoint(e.clientX, e.clientY);
      drag = {
        id,
        note: true,
        offX: p.x - nn.x,
        offY: p.y - nn.y,
        moved: false,
        startX: e.clientX,
        startY: e.clientY,
      };
      noteEl.classList.add("dragging");
      svg.setPointerCapture(e.pointerId);
      e.preventDefault();
      return;
    }
  }
  const hitEl = e.target.closest(".link-hit");
  if (hitEl) {
    selectLink(hitEl.getAttribute("data-link-hit"));
    e.preventDefault();
    return;
  }

  const ctm = svg.getScreenCTM();
  pan = {
    startX: e.clientX,
    startY: e.clientY,
    vb: getVB(),
    moved: false,
    sx: ctm ? 1 / ctm.a : 1,
    sy: ctm ? 1 / ctm.d : 1,
  };
  svg.setPointerCapture(e.pointerId);
  e.preventDefault();
});

let snapGrid = false;
const SNAP = 20;
try {
  snapGrid = localStorage.getItem("netsim_snap") === "1";
} catch (e) {}

let showLinkLabels = false;
try {
  showLinkLabels = localStorage.getItem("netsim_linklabels") === "1";
} catch (e) {}
function setLinkLabels(on) {
  showLinkLabels = !!on;
  try {
    localStorage.setItem("netsim_linklabels", showLinkLabels ? "1" : "0");
  } catch (e) {}
}

function linkLabelsChkHtml() {
  return (
    '<label style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--muted);cursor:pointer;margin:2px 0 10px" title="' +
    esc(t("linkLabelsTitle")) +
    '"><input type="checkbox" class="lbl-links"' +
    (showLinkLabels ? " checked" : "") +
    "> " +
    t("linkLabelsChk") +
    "</label>"
  );
}
function syncLinkLabelsBtn() {
  const b = $("btnLinkLabels");
  if (b) b.classList.toggle("on", !!showLinkLabels);
}
if ($("btnLinkLabels"))
  $("btnLinkLabels").onclick = () => {
    setLinkLabels(!showLinkLabels);
    render();
    syncLinkLabelsBtn();
    document.querySelectorAll(".lbl-links").forEach((c) => {
      c.checked = showLinkLabels;
    });
    setStatus(showLinkLabels ? t("stLinkLabelsOn") : t("stLinkLabelsOff"));
  };
syncLinkLabelsBtn();
document.addEventListener("change", (e) => {
  const el = e.target;
  if (!(el && el.classList && el.classList.contains("lbl-links"))) return;
  setLinkLabels(el.checked);
  render();
  document.querySelectorAll(".lbl-links").forEach((c) => {
    if (c !== el) c.checked = showLinkLabels;
  });
  setStatus(showLinkLabels ? t("stLinkLabelsOn") : t("stLinkLabelsOff"));
  if (typeof syncLinkLabelsBtn === "function") syncLinkLabelsBtn();
});
svg.addEventListener("pointermove", (e) => {
  if (_pinch) return;
  if (linking) {
    const p = toSvgPoint(e.clientX, e.clientY);
    if (
      Math.abs(e.clientX - linking.startX) > 4 ||
      Math.abs(e.clientY - linking.startY) > 4
    )
      linking.moved = true;
    linking.ghost.setAttribute("x2", p.x);
    linking.ghost.setAttribute("y2", p.y);
    return;
  }
  if (drag) {
    const dx = Math.abs(e.clientX - drag.startX),
      dy = Math.abs(e.clientY - drag.startY);
    if (dx > 4 || dy > 4) drag.moved = true;
    if (drag.moved) {
      if (!drag.fxCleared) {
        drag.fxCleared = true;
        clearManualTestFx();
        clearBlast();
      }
      const p = toSvgPoint(e.clientX, e.clientY);
      const n = drag.note ? noteById(drag.id) : getNode(drag.id);
      n.x = Math.round(p.x - drag.offX);
      n.y = Math.round(p.y - drag.offY);
      if (snapGrid) {
        n.x = Math.round(n.x / SNAP) * SNAP;
        n.y = Math.round(n.y / SNAP) * SNAP;
      }
      (drag.note ? noteEls : nodeEls)[drag.id].setAttribute(
        "transform",
        `translate(${n.x},${n.y})`,
      );
      if (!drag.note) {
        if (n && n.type === "host" && n.wifi) {
          if (roamWifiHost(n)) drag.roamed = true;
        } else if (
          n &&
          (n.type === "ap" || n.type === "router" || n.type === "firewall") &&
          n.wifiOn !== false
        ) {
          if (reconcileBackhaul()) {
            drag.roamed = true;
            render();
          }
          (DB.hosts || []).forEach((h) => {
            if (h.wifi && roamWifiHost(h)) drag.roamed = true;
          });
        }
        updateLinkGeom();
        if (showZones) renderZoneOverlays(true);
      }
    }
    return;
  }
  if (pan) {
    const ddx = e.clientX - pan.startX,
      ddy = e.clientY - pan.startY;
    if (Math.abs(ddx) > 3 || Math.abs(ddy) > 3) pan.moved = true;
    setVB(pan.vb.x - ddx * pan.sx, pan.vb.y - ddy * pan.sy, pan.vb.w, pan.vb.h);
  }
});

svg.addEventListener("pointerup", (e) => {
  if (linking) {
    const target = document.elementFromPoint(e.clientX, e.clientY);
    const nodeEl = target && target.closest(".node");
    if (nodeEl) {
      const toId = nodeEl.getAttribute("data-id");
      if (toId !== linking.fromId || linking.moved)
        tryAddLink(linking.fromId, toId);
    }
    linking.ghost.remove();
    linking = null;
    return;
  }
  if (drag) {
    if (drag.note) {
      const ne = noteEls[drag.id];
      if (ne) ne.classList.remove("dragging");
      if (!drag.moved) {
        const now = Date.now();
        if (lastClick.id === drag.id && now - lastClick.t < 400) {
          lastClick = { id: null, t: 0 };
          editNote(drag.id);
        } else {
          selectNote(drag.id);
          lastClick = { id: drag.id, t: now };
        }
      } else saveDB();
      drag = null;
      return;
    }
    const nodeEl = nodeEls[drag.id];
    if (nodeEl) nodeEl.classList.remove("dragging");
    if (!drag.moved) {
      const now = Date.now();
      if (drag.ctrl && selectedId && selectedId !== drag.id) {
        tryAddLink(selectedId, drag.id);
        lastClick = { id: null, t: 0 };
      } else if (lastClick.id === drag.id && now - lastClick.t < 400) {
        lastClick = { id: null, t: 0 };
        const lbl = e.target.closest && e.target.closest("text.nlabel");
        if (lbl && lbl.closest(".node") === nodeEl) inlineRename(drag.id, lbl);
        else openEditor(drag.id);
      } else {
        select(drag.id);
        lastClick = { id: drag.id, t: now };
      }
    } else {
      saveDB();
      if (drag.roamed) refreshAll();
    }
    drag = null;
    return;
  }
  if (pan) {
    if (!pan.moved) select(null);
    pan = null;
  }
});

svg.addEventListener("contextmenu", (e) => {
  const nodeEl = e.target.closest(".node");
  if (nodeEl) {
    e.preventDefault();
    showCtx(e.clientX, e.clientY, nodeEl.getAttribute("data-id"));
    return;
  }
  const hitEl = e.target.closest(".link-hit");
  if (hitEl) {
    e.preventDefault();
    showCtxLink(e.clientX, e.clientY, hitEl.getAttribute("data-link-hit"));
  }
});
