"use strict";

let modalCloseHook = null;
let modalReopen = null;
let modalOpenerName = null;

function wrapCourseFigures(root) {
  root.querySelectorAll('svg[width="100%"]').forEach((s) => {
    const p = s.parentNode;
    if (!p || !p.classList || p.classList.contains("cfig-scroll")) return;
    const vb = s.getAttribute("viewBox");
    if (!vb) return;
    const w = parseFloat(vb.trim().split(/[\s,]+/)[2]);
    if (!(w >= 480)) return;
    const box = document.createElement("div");
    box.className = "cfig-scroll";
    p.insertBefore(box, s);
    box.appendChild(s);
  });
}

const LP_TEXT = {
  en: [
    ["Right-clicking", "Pressing and holding"],
    ["right-clicking", "pressing and holding"],
    ["Right-click", "Press and hold"],
    ["right-click", "press and hold"],
  ],
};
let _lpTouchUi = null;
function lpTouchUi() {
  if (_lpTouchUi === null) {
    try {
      _lpTouchUi = !!(
        window.matchMedia && matchMedia("(pointer:coarse)").matches
      );
    } catch (e) {
      _lpTouchUi = false;
    }
  }
  return _lpTouchUi;
}
function lpText(s) {
  const rules = LP_TEXT.en;
  let out = s;
  for (const r of rules)
    if (out.indexOf(r[0]) >= 0) out = out.split(r[0]).join(r[1]);
  return out;
}
let _lpBusy = false;
function lpRetouch(root) {
  if (!lpTouchUi() || _lpBusy || !root || !root.nodeType) return;
  _lpBusy = true;
  try {
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(n) {
        const p = n.parentElement;
        if (!p || !n.data) return NodeFilter.FILTER_REJECT;

        if (p.closest("[data-nolp],script,style,textarea,#svg"))
          return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      },
    });
    for (let n = w.nextNode(); n; n = w.nextNode()) {
      const v = lpText(n.data);
      if (v !== n.data) n.data = v;
    }
  } finally {
    _lpBusy = false;
  }
}
const _lpObs = new MutationObserver((ms) => {
  for (const m of ms) {
    if (m.type === "characterData") lpRetouch(m.target.parentElement);
    else
      m.addedNodes.forEach((n) =>
        lpRetouch(n.nodeType === 1 ? n : n.parentElement),
      );
  }
});
if (lpTouchUi()) {
  lpRetouch(document.body);
  _lpObs.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
  });
}
const _cfigObs = new MutationObserver(() => wrapCourseFigures(modalBox));
let _modalSeq = 0;
function openModal(html) {
  if (modalCloseHook) {
    const _h = modalCloseHook;
    modalCloseHook = null;
    try {
      _h();
    } catch (e) {}
  }
  modalCloseHook = null;
  modalReopen = null;
  modalOpenerName = null;
  _modalSeq++;
  _portsAllOpen = false;
  modalBox.classList.remove("wide");
  modalBox.innerHTML = html;
  wrapCourseFigures(modalBox);
  _cfigObs.observe(modalBox, { childList: true, subtree: true });
  modalBg.classList.add("show");
}
function closeModal() {
  const pdb = document.getElementById("portDlgBg");
  if (pdb && pdb.classList.contains("show")) {
    pdb.classList.remove("show");
    const pd = document.getElementById("portDlg");
    if (pd) pd.innerHTML = "";
    _portDlgDev = null;
    _portDlgNum = 0;
  }
  _portsPaneRedraw = null;
  _portsPaneDev = null;
  modalReopen = null;
  modalOpenerName = null;
  _cfigObs.disconnect();
  modalBg.classList.remove("show");
  modalBox.classList.remove("wide");
  modalBox.innerHTML = "";
  if (modalCloseHook) {
    const cb = modalCloseHook;
    modalCloseHook = null;
    cb();
  }
}

const KEEP_OPEN_ON_BACKDROP = ["openCourseModule"];
modalBg.addEventListener("pointerdown", (e) => {
  if (e.target !== modalBg) return;
  if (KEEP_OPEN_ON_BACKDROP.indexOf(modalOpenerName) >= 0 && courseMinimize())
    return;
  closeModal();
});

const MODAL_OPENERS = [
  "openModeInfo",
  "editNote",
  "openLinkCostEditor",
  "openSegmentModal",
  "openDeviceModal",
  "openFirewallModal",
  "openHostModal",
  "openKindPicker",
  "openExportImage",
  "openPresetInfo",
  "openTasksModal",
  "openFeedbackModal",
  "openSupportModal",
  "openWelcomePresets",
  "shareLink",
  "openCourse",
  "openCourseLessons",
  "openCourseModule",
  "openCourseGlossary",
];

const DB_MODALS = [
  "editNote",
  "openLinkCostEditor",
  "openSegmentModal",
  "openDeviceModal",
  "openFirewallModal",
  "openHostModal",
  "openKindPicker",
];
function trackModalOpeners() {
  MODAL_OPENERS.forEach((name) => {
    const f = window[name];
    if (typeof f !== "function" || f.__tracked) return;
    const w = function () {
      const args = [].slice.call(arguments);
      const r = f.apply(this, args);
      if (modalBg.classList.contains("show")) {
        modalReopen = () => window[name].apply(null, args);
        modalOpenerName = name;
      }
      return r;
    };
    w.__tracked = true;
    window[name] = w;
  });
}
trackModalOpeners();

function modalRedrawFailed(err) {
  if (err && typeof console !== "undefined" && console.warn)
    console.warn("redrawOpenModal:", err);
  _modalRedrawFails++;
  if (modalBg.classList.contains("show")) {
    closeModal();
    setStatus(t("stModalGone"), false);
  }
}
let _modalRedrawFails = 0;
function redrawOpenModal() {
  if (!modalBg.classList.contains("show") || !modalReopen) return;

  const f = modalReopen,
    seq = _modalSeq,
    before = modalBox.innerHTML;
  const check = () => {
    if (
      modalBg.classList.contains("show") &&
      _modalSeq === seq &&
      modalBox.innerHTML === before
    )
      modalRedrawFailed(null);
  };
  let r;
  try {
    r = f();
  } catch (err) {
    modalRedrawFailed(err);
    return;
  }
  if (r && typeof r.then === "function") {
    r.then(check, modalRedrawFailed);
    return;
  }
  check();
}

function redrawOtherLayers() {
  if (portDlgBg.classList.contains("show")) {
    if (_portDlgDev && getNode(_portDlgDev.id)) renderPortDlg();
    else closePortDlg();
  }
  redrawConfirm();
}

(function () {
  const FOCUSABLE =
    'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
  function focusableIn(root) {
    return [...root.querySelectorAll(FOCUSABLE)].filter(
      (el) =>
        el.offsetWidth > 0 ||
        el.offsetHeight > 0 ||
        el === document.activeElement,
    );
  }

  function topOpen() {
    const l = [...document.querySelectorAll(".modal-bg.show")];
    if (l.length) return l[l.length - 1];
    return tourFocusRoot() || null;
  }
  window.focusTrapRoot = topOpen;

  function restoreFocus(p) {
    if (!p || !p.focus || !document.contains(p)) return;
    try {
      p.focus();
    } catch (e) {}
    if (document.activeElement === p) return;
    let a = p.parentElement;
    while (a && a !== document.body) {
      const c = [...a.querySelectorAll(FOCUSABLE)].find(
        (el) => el.offsetWidth > 0 || el.offsetHeight > 0,
      );
      if (c) {
        try {
          c.focus();
        } catch (e) {}
        if (document.activeElement === c) return;
      }
      a = a.parentElement;
    }
  }
  window.restoreFocusTo = restoreFocus;
  document.querySelectorAll(".modal-bg").forEach((bg) => {
    const box = bg.querySelector(".modal");
    if (box && !box.hasAttribute("tabindex"))
      box.setAttribute("tabindex", "-1");
    new MutationObserver(() => {
      const open = bg.classList.contains("show");
      if (open && !bg._focusOpen) {
        bg._focusOpen = true;
        bg._prevFocus = document.activeElement;
        setTimeout(() => {
          if (!bg.classList.contains("show")) return;
          const f = focusableIn(bg);
          (f[0] || box || bg).focus && (f[0] || box || bg).focus();
        }, 30);
      } else if (!open && bg._focusOpen) {
        bg._focusOpen = false;
        const p = bg._prevFocus;
        bg._prevFocus = null;
        restoreFocus(p);
      }
    }).observe(bg, { attributes: true, attributeFilter: ["class"] });
  });
  document.addEventListener(
    "keydown",
    (e) => {
      if (e.key !== "Tab") return;
      const m = topOpen();
      if (!m) return;
      const f = focusableIn(m);
      if (!f.length) {
        e.preventDefault();
        return;
      }
      const first = f[0],
        last = f[f.length - 1];
      if (e.shiftKey) {
        if (
          document.activeElement === first ||
          !m.contains(document.activeElement)
        ) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (
          document.activeElement === last ||
          !m.contains(document.activeElement)
        ) {
          e.preventDefault();
          first.focus();
        }
      }
    },
    true,
  );
})();

function openEditor(id) {
  const n = getNode(id);
  if (!n) return;
  if (n.type === "host") openHostModal(n);
  else if (isSegment(id)) openSegmentModal(n);
  else if (n.type === "firewall") openFirewallModal(n);
  else openDeviceModal(n);
}

function apUplink(d) {
  return d &&
    d.type === "ap" &&
    (d.uplink === "mesh" || d.uplink === "repeater")
    ? d.uplink
    : "cable";
}
function apHasCable(d) {
  return portLinks(d).length > 0;
}
function apWifiCapable(d) {
  return (
    !!d &&
    (d.type === "ap" || d.type === "router" || d.type === "firewall") &&
    d.wifiOn !== false
  );
}

function ssidSec(ss) {
  const v = ss && ss.sec;
  return v === "open" || v === "wpa2" || v === "wpa3" || v === "ent"
    ? v
    : ss && ss.pass
      ? "wpa2"
      : "open";
}
function ssidSecLabel(sec) {
  return sec === "ent"
    ? "802.1X"
    : sec === "wpa3"
      ? "WPA3"
      : sec === "wpa2"
        ? "WPA2"
        : "open";
}

function isRadiusHost(id) {
  const h = getNode(id);
  return (
    !!h &&
    isHost(id) &&
    Array.isArray(h.services) &&
    h.services.indexOf(1812) >= 0
  );
}

let _radGuard = false;
const _radCache = {};
function radiusCacheClear() {
  for (const k in _radCache) delete _radCache[k];
}
function radiusReachable(srcId, radiusId) {
  if (!radiusId) return false;
  if (_radGuard) return true;
  const k = srcId + "|" + radiusId;
  if (k in _radCache) return _radCache[k];
  let v = false;
  _radGuard = true;
  try {
    const rh = getNode(radiusId);
    v =
      !!rh &&
      !rh.down &&
      isRadiusHost(radiusId) &&
      evaluateEP(srcId, radiusId, { proto: "udp", port: 1812 }).status ===
        "allowed";
  } catch (e) {
    v = false;
  }
  _radGuard = false;
  _radCache[k] = v;
  return v;
}
function apEffSsids(d) {
  if (!d) return [];
  if (d.type === "ap" && apUplink(d) === "repeater") {
    const nm = (d.repSsid || "").trim();
    if (!nm) return [];
    let src = null;
    DB.devices.forEach((o) => {
      if (src || o.id === d.id || !apWifiCapable(o)) return;
      if (o.type === "ap" && apUplink(o) === "repeater") return;
      const ss = (o.ssids || []).find(
        (s) =>
          (s.name || "").trim() === nm &&
          s.on !== false &&
          s.segId != null &&
          !!getNode(s.segId),
      );
      if (ss) src = ss;
    });
    return src
      ? [
          {
            name: nm,
            segId: src.segId,
            pass: src.pass || "",
            sec: ssidSec(src),
            radiusId: src.radiusId || null,
            on: true,
            // A repeater re-sends on the radio it repeats, so it keeps the source
            // band and channel rather than picking its own.
            band: src.band,
            ch: src.ch,
          },
        ]
      : [];
  }
  return d.ssids || [];
}

function apLiveSsidNames(d) {
  return apEffSsids(d)
    .filter(
      (s) =>
        s.on !== false &&
        (s.name || "").trim() &&
        s.segId != null &&
        !!getNode(s.segId),
    )
    .map((s) => (s.name || "").trim());
}
function apBackhaulLink(d) {
  return d ? (DB.links || []).find((l) => l.wl && l.fromId === d.id) : null;
}

function apNoUplink(d) {
  return (
    !!d &&
    d.type === "ap" &&
    apUplink(d) !== "cable" &&
    !apHasCable(d) &&
    !apBackhaulLink(d)
  );
}

function bhComputeWants() {
  const wants = {};
  const dist = (a, b) =>
    Math.hypot((a.x || 0) - (b.x || 0), (a.y || 0) - (b.y || 0));
  const anchored = new Set();
  DB.devices.forEach((d) => {
    if (!apWifiCapable(d)) return;
    if (d.type !== "ap" || apHasCable(d)) anchored.add(d.id);
  });
  const nearest = (d, names) => {
    let best = null,
      bd = Infinity;
    DB.devices.forEach((o) => {
      if (o.id === d.id || !apWifiCapable(o) || !anchored.has(o.id)) return;
      if (o.type === "ap" && apUplink(o) === "repeater") return;
      const on = apLiveSsidNames(o);
      if (!names.some((n) => on.indexOf(n) >= 0)) return;
      const dd = dist(d, o);
      if (dd < bd) {
        bd = dd;
        best = o;
      }
    });
    return best;
  };
  const meshAps = DB.devices.filter(
    (d) =>
      d.type === "ap" &&
      apUplink(d) === "mesh" &&
      !apHasCable(d) &&
      d.wifiOn !== false,
  );
  let grew = true;
  while (grew) {
    grew = false;
    meshAps.forEach((d) => {
      if (anchored.has(d.id)) return;
      const names = (d.ssids || [])
        .filter((s) => s.on !== false && (s.name || "").trim())
        .map((s) => (s.name || "").trim());
      const best = names.length ? nearest(d, names) : null;
      if (best) {
        wants[d.id] = best.id;
        anchored.add(d.id);
        grew = true;
      }
    });
  }
  DB.devices.forEach((d) => {
    if (
      d.type !== "ap" ||
      apUplink(d) !== "repeater" ||
      apHasCable(d) ||
      d.wifiOn === false
    )
      return;
    const nm = (d.repSsid || "").trim();
    if (!nm) return;
    const best = nearest(d, [nm]);
    if (best) wants[d.id] = best.id;
  });
  return wants;
}

function reconcileBackhaul() {
  if (!DB || !Array.isArray(DB.links)) return false;
  const wants = bhComputeWants();
  let changed = false;
  DB.links = DB.links.filter((l) => {
    if (!l.wl) return true;
    const d = getNode(l.fromId);
    const wl = d && apUplink(d) === "repeater" ? "rep" : "mesh";
    if (d && wants[l.fromId] === l.toId && l.wl === wl) {
      delete wants[l.fromId];
      return true;
    }
    changed = true;
    return false;
  });
  Object.keys(wants).forEach((cid) => {
    const d = getNode(cid);
    if (!d) return;
    DB.links.push({
      id: "bh_" + cid,
      fromId: cid,
      toId: wants[cid],
      wl: apUplink(d) === "repeater" ? "rep" : "mesh",
    });
    changed = true;
  });
  return changed;
}

function wifiAssocLive(h) {
  if (!h || !h.wifi) return false;
  const ap = getNode(h.wifi.apId);
  if (!ap || ap.wifiOn === false) return false;
  return apEffSsids(ap).some(
    (s) =>
      (s.name || "").trim() === (h.wifi.ssid || "").trim() &&
      s.on !== false &&
      s.segId != null &&
      !!getNode(s.segId) &&
      (ssidSec(s) !== "ent" || radiusReachable(s.segId, s.radiusId)),
  );
}

function reconcileWifiClients() {
  let changed = reconcileBackhaul();
  (DB.hosts || []).forEach((h) => {
    if (h.wifi && !wifiAssocLive(h)) {
      const apId = h.wifi.apId;
      DB.links = DB.links.filter((l) => {
        const oid =
          l.fromId === h.id ? l.toId : l.toId === h.id ? l.fromId : null;
        return oid !== apId;
      });
      h.wifi = null;
      changed = true;
    }
  });
  return changed;
}

function roamWifiHost(h) {
  if (!h || !h.wifi) return false;
  const ssid = (h.wifi.ssid || "").trim();
  let best = null,
    bd = Infinity,
    bestSeg = null,
    curD = Infinity,
    curSeg = null;
  DB.devices.forEach((ap) => {
    if (
      !(ap.type === "ap" || ap.type === "router" || ap.type === "firewall") ||
      ap.wifiOn === false
    )
      return;
    const ss = apEffSsids(ap).find(
      (s) =>
        (s.name || "").trim() === ssid &&
        s.on !== false &&
        s.segId != null &&
        getNode(s.segId),
    );
    if (!ss) return;
    const d = Math.hypot((ap.x || 0) - (h.x || 0), (ap.y || 0) - (h.y || 0));
    if (d < bd) {
      bd = d;
      best = ap;
      bestSeg = ss.segId;
    }
    if (ap.id === h.wifi.apId) {
      curD = d;
      curSeg = ss.segId;
    }
  });
  if (!best) return false;
  // Stay put while the current AP is still close to the best one: real clients do
  // not hop between neighbours on every small move.
  if (
    best.id !== h.wifi.apId &&
    isFinite(curD) &&
    curD <= bd * WL_ROAM_STICKY
  ) {
    bd = curD;
    best = getNode(h.wifi.apId);
    bestSeg = curSeg;
  }
  if (!best || best.id === h.wifi.apId) return false;
  const oldAp = h.wifi.apId;
  h.wifi.apId = best.id;
  if (bestSeg != null) h.segId = bestSeg;
  DB.links.forEach((l) => {
    if (l.fromId === h.id && l.toId === oldAp) l.toId = best.id;
    else if (l.toId === h.id && l.fromId === oldAp) l.fromId = best.id;
  });
  return true;
}

function svgToClient(x, y) {
  const p = svg.createSVGPoint();
  p.x = x;
  p.y = y;
  const m = svg.getScreenCTM();
  if (!m) return { x, y };
  return p.matrixTransform(m);
}
let _pendingHost = null,
  _kindCommitted = false;
