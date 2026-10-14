"use strict";

function uiConfirm(msg, onOk, onCancel) {
  _confirmMsg = typeof msg === "function" ? msg : () => msg;
  redrawConfirm(true);
  $("confirmBg").classList.add("show");
  _confirmCancel = onCancel || null;
  const close = () => $("confirmBg").classList.remove("show");
  $("confirmNo").onclick = () => {
    close();
    const c = _confirmCancel;
    _confirmCancel = null;
    if (c) c();
  };
  $("confirmYes").onclick = () => {
    close();
    _confirmCancel = null;
    onOk();
  };
}
function redrawConfirm(force) {
  if (!force && !$("confirmBg").classList.contains("show")) return;
  if (_confirmMsg) $("confirmMsg").textContent = _confirmMsg();
  $("confirmNo").textContent = t("cfNo");
  $("confirmYes").textContent = t("cfYes");
}
$("confirmBg").addEventListener("pointerdown", (e) => {
  if (e.target === $("confirmBg")) {
    $("confirmBg").classList.remove("show");
    const c = _confirmCancel;
    _confirmCancel = null;
    if (c) c();
  }
});

function restoreActiveTask() {
  try {
    const id = DB && DB.meta && DB.meta.task;
    if (!id) return;
    if (typeof getTasks !== "function") return;
    const tk = getTasks().find((x) => x.id === id);
    if (!tk) return;
    activeTask = tk;
    taskOrigin = "tasks";
    if (tk.mode) setMode(tk.mode);
    $("topoName").value = t(tk.tKey);
    renderTaskBar();
  } catch (e) {
    console.error("restoreActiveTask", e);
  }
}
function clearActiveTask() {
  if (typeof activeTask !== "undefined" && activeTask) {
    activeTask = null;
    try {
      localStorage.removeItem("netsim_active_task");
    } catch (e) {}
    if (typeof renderTaskBar === "function") renderTaskBar();
  }
}
function loadPreset(pr, skipConfirm) {
  if (!skipConfirm && (DB.devices.length || DB.segments.length)) {
    uiConfirm(
      () => tf("presetConfirm", pr.name),
      () => loadPreset(pr, true),
    );
    return;
  }
  clearActiveTask();
  if (typeof clearTaskCheckAnim === "function") clearTaskCheckAnim();
  DB = pr.build();
  migrateDB();
  selectedId = null;
  selectedLinkId = null;
  lastResult = null;
  $("topoName").value = DB.meta.name;
  $("result").style.display = "none";
  $("probes").style.display = "none";
  saveDB();
  render();
  refreshAll();
  fitView();
  setView("diagram");
  histStack = [];
  histPtr = -1;
  histCommit();
  setStatus(t("presetStatus") + " " + pr.name);
}
function closeMenus(except) {
  ["presetPanel", "learnPanel", "morePanel"].forEach((id) => {
    if (id !== except) $(id).classList.remove("open");
  });
}
$("btnPresets").onclick = (e) => {
  e.stopPropagation();
  buildPresetMenu();
  closeMenus("presetPanel");
  $("presetPanel").classList.toggle("open");
};
$("btnLearn").onclick = (e) => {
  e.stopPropagation();
  closeMenus("learnPanel");
  $("learnPanel").classList.toggle("open");
};
$("btnMore").onclick = (e) => {
  e.stopPropagation();
  closeMenus("morePanel");
  $("morePanel").classList.toggle("open");
};

let hdrCollapsed = false;
try {
  hdrCollapsed = localStorage.getItem("netsim_hdr") === "0";
} catch (e) {}
function applyHdr() {
  document.body.classList.toggle("hdr-collapsed", hdrCollapsed);
  const b = $("hdrToggle"),
    r = $("hdrRail");
  if (b) b.setAttribute("aria-expanded", hdrCollapsed ? "false" : "true");
  if (r) r.setAttribute("aria-expanded", hdrCollapsed ? "false" : "true");
  try {
    localStorage.setItem("netsim_hdr", hdrCollapsed ? "0" : "1");
  } catch (e) {}
  window.dispatchEvent(new Event("resize"));
}

function setHdr(on, moveFocus) {
  hdrCollapsed = !on;
  applyHdr();
  if (moveFocus) {
    const el = $(on ? "hdrToggle" : "hdrRail");
    if (el)
      try {
        el.focus();
      } catch (e) {}
  }
}
if ($("hdrToggle")) $("hdrToggle").onclick = () => setHdr(false, true);
if ($("hdrRail")) $("hdrRail").onclick = () => setHdr(true, true);
applyHdr();

let hintsOn = true;
try {
  hintsOn = localStorage.getItem("netsim_hints") !== "0";
} catch (e) {}
function applyHints() {
  document.body.classList.toggle("no-hints", !hintsOn);
  try {
    localStorage.setItem("netsim_hints", hintsOn ? "1" : "0");
  } catch (e) {}
  segActive("segHints", "data-hints", hintsOn ? "1" : "0");
}
if ($("segHints"))
  $("segHints")
    .querySelectorAll("button")
    .forEach(
      (b) =>
        (b.onclick = () => {
          hintsOn = b.getAttribute("data-hints") === "1";
          applyHints();
          setStatus(hintsOn ? t("stHintsOn") : t("stHintsOff"));
        }),
    );
applyHints();
$("learnTutorial").onclick = () => {
  closeMenus();
  openTutorial(0);
};

let coach = null;
function coachStart() {
  const tk =
    typeof getTasks === "function"
      ? getTasks().find((x) => x.id === "first-steps")
      : null;
  if (!tk) return;
  startTask(tk, "welcome", canvasEmpty());
  if (coach && coach.timer) clearInterval(coach.timer);
  coach = { timer: setInterval(coachTick, 700) };
  coachRender();
}
function coachSteps() {
  const linked = (DB.links || []).some(
    (l) => l.fromId === "fs_pc" || l.toId === "fs_pc",
  );
  const tested = !!lastResult;
  const done =
    typeof taskCrits === "function" &&
    (() => {
      try {
        const tk = getTasks().find((x) => x.id === "first-steps");
        return taskCrits(tk).every((c) => c.ok);
      } catch (e) {
        return false;
      }
    })();
  return [
    { k: "coachS1", ok: linked },
    { k: "coachS2", ok: tested },
    { k: "coachS3", ok: done },
  ];
}
function coachRender() {
  let box = $("coachBox");
  if (!coach) {
    if (box) box.remove();
    return;
  }
  if (!box) {
    box = document.createElement("div");
    box.id = "coachBox";
    box.style.cssText =
      "position:fixed;left:18px;bottom:18px;z-index:46;width:290px;max-width:calc(100vw - 36px);background:var(--panel2);border:1px solid var(--cyan);border-radius:12px;padding:12px 14px;font-size:12.5px;box-shadow:0 8px 26px rgba(0,0,0,.4)";
    document.body.appendChild(box);
  }
  const st = coachSteps();
  box.innerHTML =
    '<div style="font-weight:700;margin-bottom:7px">' +
    esc(t("coachTitle")) +
    "</div>" +
    st
      .map(
        (x) =>
          '<div style="display:flex;gap:8px;margin:5px 0;line-height:1.45;' +
          (x.ok ? "opacity:.55" : "") +
          '"><span style="flex:0 0 auto;color:' +
          (x.ok ? "var(--green)" : "var(--muted)") +
          '">' +
          (x.ok ? "✔" : "○") +
          "</span><span>" +
          t(x.k) +
          "</span></div>",
      )
      .join("") +
    '<div style="text-align:right;margin-top:8px"><button class="btn" id="coachEnd" style="padding:3px 10px;font-size:11.5px">' +
    esc(t("coachHide")) +
    "</button></div>";
  $("coachEnd").onclick = coachStop;
}
function coachStop() {
  if (coach) {
    clearInterval(coach.timer);
    coach = null;
  }
  coachRender();
}
function coachTick() {
  if (!coach) return;
  if (!activeTask || activeTask.id !== "first-steps") {
    coachStop();
    return;
  }
  coachRender();
  if (coachSteps().every((x) => x.ok)) {
    setTimeout(coachStop, 4000);
  }
}
if ($("learnProgress"))
  $("learnProgress").onclick = () => {
    closeMenus();
    ensureCourse(() => openProgressOverview());
  };
if ($("learnPractice"))
  $("learnPractice").onclick = () => {
    closeMenus();
    openTasksModal();
  };
$("learnCourse").onclick = () => {
  closeMenus();
  ensureCourse(() => openCourse());
};

function lastCourseModule() {
  try {
    const p = JSON.parse(localStorage.getItem(CRS_PROG_KEY) || "{}");
    return (p && p._last) || null;
  } catch (e) {
    return null;
  }
}

let _crsMinId = null;
function courseMinimize() {
  const id = lastCourseModule();
  if (!id) return false;
  const h2 = modalBox.querySelector("h2");
  const title = h2 ? (h2.textContent || "").replace("✕", "").trim() : "";
  closeModal();
  try {
    localStorage.setItem(
      "netsim_crs_min",
      JSON.stringify({ id: id, title: title }),
    );
  } catch (e) {}
  courseMinShow(id, title);
  return true;
}
function courseMinClear() {
  _crsMinId = null;
  try {
    localStorage.removeItem("netsim_crs_min");
  } catch (e) {}
  const b = $("crsMin");
  if (b) b.classList.remove("show");
}
function courseMinShow(id, title) {
  _crsMinId = id;
  const bar = $("crsMin");
  if (!bar) return;
  $("crsMinTitle").textContent = title || "";
  bar.classList.add("show");
}
function restoreCourseMin() {
  try {
    const raw = localStorage.getItem("netsim_crs_min");
    if (!raw) return;
    const o = JSON.parse(raw);
    if (o && o.id) courseMinShow(o.id, o.title);
  } catch (e) {}
}
if ($("crsMinOpen"))
  $("crsMinOpen").onclick = () => {
    const id = _crsMinId;
    if (!id) return;
    courseMinClear();
    ensureCourse(() => openCourseModule(id));
  };
if ($("crsMinX"))
  $("crsMinX").onclick = () => {
    courseMinClear();
    const f = $("btnLearn") || document.querySelector("header button");
    if (f)
      try {
        f.focus();
      } catch (e) {}
  };

const CRS_PROG_KEY = "netsim_course_progress";
function courseProgress() {
  try {
    return JSON.parse(localStorage.getItem(CRS_PROG_KEY) || "{}");
  } catch (e) {
    return {};
  }
}
function markCourseSeen(id) {
  try {
    const p = courseProgress();
    p[id] = 1;
    p._last = id;
    localStorage.setItem(CRS_PROG_KEY, JSON.stringify(p));
  } catch (e) {}
}
function resetCourseProgress(ids) {
  try {
    const p = courseProgress();
    ids.forEach((id) => {
      delete p[id];
    });
    if (ids.indexOf(p._last) >= 0) delete p._last;
    localStorage.setItem(CRS_PROG_KEY, JSON.stringify(p));
  } catch (e) {}
}

function courseTry(taskId) {
  if (!(typeof courseMinimize === "function" && courseMinimize())) closeModal();
  if (taskId) {
    const tk = getTasks().find((x) => x.id === taskId);
    if (tk) {
      startTask(
        tk,
        "course",
        typeof canvasEmpty === "function" && canvasEmpty(),
      );
      return;
    }
  }
}

const ACRONYM_FULL = {
  ARP: "Address Resolution Protocol",
  IP: "Internet Protocol",
  IPv4: "Internet Protocol version 4",
  ISP: "Internet Service Provider",
  OSI: "Open Systems Interconnection",
  "TCP/IP": "Transmission Control Protocol / Internet Protocol",
  TCP: "Transmission Control Protocol",
  UDP: "User Datagram Protocol",
  DNS: "Domain Name System",
  DHCP: "Dynamic Host Configuration Protocol",
  HTTP: "HyperText Transfer Protocol",
  HTTPS: "HTTP Secure",
  TLS: "Transport Layer Security",
  PDU: "Protocol Data Unit",
  FTTH: "Fiber to the Home",
  NAT: "Network Address Translation",
  VLAN: "Virtual LAN",
  SSID: "Service Set Identifier",
  "MAC adresa": "Media Access Control (address)",
  "MAC address": "Media Access Control (address)",
  "IP adresa": "Internet Protocol (address)",
  "IP address": "Internet Protocol (address)",
  AP: "Access Point",
  LAN: "Local Area Network",
  WAN: "Wide Area Network",
  IPv6: "Internet Protocol version 6",
  CIDR: "Classless Inter-Domain Routing",
  PAT: "Port Address Translation",
  ICMP: "Internet Control Message Protocol",
  TTL: "Time To Live",
  FCS: "Frame Check Sequence",
  DMZ: "Demilitarized Zone",
  ACL: "Access Control List",
  IDS: "Intrusion Detection System",
  IPS: "Intrusion Prevention System",
  VPN: "Virtual Private Network",
  HA: "High Availability",
  VIP: "Virtual IP (address)",
  "WPA2 / WPA3": "Wi-Fi Protected Access",
  SNI: "Server Name Indication",
  DoH: "DNS over HTTPS",
  "SYN / ACK": "SYNchronize / ACKnowledge (TCP flags)",
  "AP / WAP": "Access Point / Wireless Access Point",
  OSPF: "Open Shortest Path First",
  LSA: "Link-State Advertisement",
  LSDB: "Link-State Database",
  SPF: "Shortest Path First",
  ABR: "Area Border Router",
  "DR / BDR": "Designated Router / Backup DR",
  BFD: "Bidirectional Forwarding Detection",
  AD: "Administrative Distance",
  BGP: "Border Gateway Protocol",
  AS: "Autonomous System",
  EIGRP: "Enhanced Interior Gateway Routing Protocol",
  "IS-IS": "Intermediate System to Intermediate System",
  RIP: "Routing Information Protocol",
  HSRP: "Hot Standby Router Protocol",
  VRRP: "Virtual Router Redundancy Protocol",
  "HSRP / VRRP": "Hot Standby / Virtual Router Redundancy Protocol",
  GLBP: "Gateway Load Balancing Protocol",
  FHRP: "First Hop Redundancy Protocol",
  VRF: "Virtual Routing and Forwarding",
  uRPF: "unicast Reverse Path Forwarding",
  DNAT: "Destination NAT",
  SNAT: "Source NAT",
  SVI: "Switched Virtual Interface",
  STP: "Spanning Tree Protocol",
  RSTP: "Rapid Spanning Tree Protocol",
  MSTP: "Multiple Spanning Tree Protocol",
  "PVST+": "Per-VLAN Spanning Tree Plus",
  BPDU: "Bridge Protocol Data Unit",
  DTP: "Dynamic Trunking Protocol",
  LACP: "Link Aggregation Control Protocol",
  LAG: "Link Aggregation Group",
  CAM: "Content-Addressable Memory",
  DAI: "Dynamic ARP Inspection",
  SPAN: "Switched Port Analyzer",
  PoE: "Power over Ethernet",
  SFP: "Small Form-factor Pluggable",
  DPI: "Deep Packet Inspection",
  MITM: "Man-in-the-Middle",
  DoS: "Denial of Service",
  C2: "Command & Control",
  SIEM: "Security Information and Event Management",
  SOC: "Security Operations Center",
  TAP: "Test Access Point",
  SNMP: "Simple Network Management Protocol",
  SSH: "Secure Shell",
  RDP: "Remote Desktop Protocol",
  SMB: "Server Message Block",
  CoPP: "Control Plane Policing",
};
function abbrBox(items) {
  if (!items || !items.length) return "";
  const lbl = "Abbreviations & terms used here";
  const rows = items
    .map((it) => {
      const full = ACRONYM_FULL[it[0]];
      return (
        '<div class="abbr-row"><span class="abbr-term">' +
        esc(it[0]) +
        '</span><span class="abbr-def">' +
        (full ? '<span class="abbr-full">' + esc(full) + "</span> — " : "") +
        it[1] +
        "</span></div>"
      );
    })
    .join("");
  const glLink =
    typeof openCourseGlossary === "function"
      ? '<button type="button" class="abbr-gl" onclick="openCourseGlossary()">' +
        "Open the full glossary →" +
        "</button>"
      : "";
  return (
    '<details class="abbr-box" open><summary>' +
    lbl +
    '</summary><div class="abbr-grid">' +
    rows +
    "</div>" +
    glLink +
    "</details>"
  );
}

function courseCTA(id, text, btn) {
  return (
    '<div class="crs-cta"><div class="crs-cta-t">' +
    text +
    '</div><button type="button" class="btn primary" id="' +
    id +
    '">' +
    icon("tasks") +
    (btn || "Open the task") +
    "</button></div>"
  );
}

document.addEventListener(
  "pointerdown",
  (e) => {
    if (
      !e.target.closest("#presetDrop") &&
      !e.target.closest("#learnDrop") &&
      !e.target.closest("#moreDrop")
    )
      closeMenus();
  },
  true,
);

const TOUR_STEPS = [
  { sel: null, k: "tour1" },
  { sel: "#palette", k: "tour2" },
  { sel: "#stage", k: "tour3" },
  {
    sel: "#stage",
    k: "tourWire",
    ill: '<svg viewBox="0 0 240 54" width="100%" style="display:block;margin:8px 0 2px"><rect x="14" y="14" width="54" height="26" rx="6" fill="var(--panel2)" stroke="var(--cyan)" stroke-width="1.3"/><text x="41" y="31" text-anchor="middle" style="font:600 9px var(--mono);fill:var(--cyan)">A</text><circle cx="68" cy="27" r="7" fill="none" stroke="var(--cyan)" stroke-width="1.4"/><text x="68" y="30.5" text-anchor="middle" style="font:700 10px var(--mono);fill:var(--cyan)">+</text><line x1="75" y1="27" x2="165" y2="27" stroke="var(--green)" stroke-width="2" stroke-dasharray="4 3"/><rect x="172" y="14" width="54" height="26" rx="6" fill="var(--panel2)" stroke="var(--line2)" stroke-width="1.3"/><text x="199" y="31" text-anchor="middle" style="font:600 9px var(--mono);fill:var(--txt)">B</text></svg>',
  },
  {
    sel: "#stage",
    k: "tourConfig",
    ill: '<svg viewBox="0 0 240 54" width="100%" style="display:block;margin:8px 0 2px"><rect x="16" y="13" width="58" height="28" rx="6" fill="var(--panel2)" stroke="var(--violet)" stroke-width="1.3"/><circle cx="45" cy="27" r="6" fill="none" stroke="var(--violet)" stroke-width="1.4"/><text x="45" y="51" text-anchor="middle" style="font:700 8px var(--mono);fill:var(--muted)">2×</text><path d="M90 27h40M122 21l8 6-8 6" stroke="var(--muted)" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/><rect x="150" y="9" width="76" height="36" rx="6" fill="var(--panel2)" stroke="var(--line2)" stroke-width="1.3"/><line x1="159" y1="19" x2="217" y2="19" stroke="var(--muted)" stroke-width="2.2" stroke-linecap="round"/><line x1="159" y1="27" x2="217" y2="27" stroke="var(--muted)" stroke-width="2.2" stroke-linecap="round"/><line x1="159" y1="35" x2="200" y2="35" stroke="var(--muted)" stroke-width="2.2" stroke-linecap="round"/></svg>',
  },
  {
    sel: "#stage",
    k: "tourWifi",
    ill: '<svg viewBox="0 0 240 54" width="100%" style="display:block;margin:8px 0 2px"><rect x="14" y="14" width="52" height="26" rx="6" fill="var(--panel2)" stroke="var(--cyan)" stroke-width="1.3"/><text x="40" y="31" text-anchor="middle" style="font:600 8.5px var(--mono);fill:var(--cyan)">PC</text><path d="M88 35a15 15 0 0126 0M94 30a9 9 0 0114 0" fill="none" stroke="var(--cyan)" stroke-width="1.6" stroke-linecap="round"/><circle cx="101" cy="39" r="2" fill="var(--cyan)"/><rect x="150" y="14" width="76" height="26" rx="6" fill="var(--panel2)" stroke="var(--green)" stroke-width="1.3"/><text x="188" y="31" text-anchor="middle" style="font:600 8px var(--mono);fill:var(--green)">Router · SSID</text></svg>',
  },
  { sel: "#testpanel", k: "tour4" },
  { sel: "#testpanel", k: "tourLogs" },
  { sel: "#btnPresets", k: "tour5" },
  { sel: "#btnLearn", k: "tour6" },
  { sel: "#btnLearn", k: "tourTasks" },
  { sel: "#segMode", k: "tour7" },
  { sel: null, k: "tour8" },
];
let tutStep = 0,
  tourHole = null,
  tourTip = null,
  tourDim = null,
  tourLive = null,
  tourResizeBound = false,
  tourOpen = false,
  tourPrevFocus = null;
function tourBuild() {
  if (tourHole) return;
  tourDim = document.createElement("div");
  tourDim.className = "tour-dim";
  tourHole = document.createElement("div");
  tourHole.className = "tour-hole";
  tourTip = document.createElement("div");
  tourTip.className = "tour-tip";

  tourTip.setAttribute("role", "dialog");
  tourTip.setAttribute("tabindex", "-1");
  tourLive = $("tourLive");
  document.body.appendChild(tourDim);
  document.body.appendChild(tourHole);
  document.body.appendChild(tourTip);
  tourDim.addEventListener("pointerdown", (e) => {
    if (e.target === tourDim) closeTour();
  });
}

function tourFocusRoot() {
  return tourOpen && tourTip ? tourTip : null;
}
function tourFocusIn() {
  if (!tourOpen || !tourTip) return;
  const f = tourTip.querySelector("button:not([disabled])");
  if ((f || tourTip).focus) (f || tourTip).focus();
}
function closeTour() {
  if (!tourHole) return;
  tourHole.style.display = "none";
  tourTip.style.display = "none";
  tourDim.style.display = "none";
  if (tourLive) tourLive.textContent = "";
  if (!tourOpen) return;
  tourOpen = false;
  const p = tourPrevFocus;
  tourPrevFocus = null;
  if (typeof window.restoreFocusTo === "function") window.restoreFocusTo(p);
  else if (p && p.focus && document.contains(p)) {
    try {
      p.focus();
    } catch (e) {}
  }
}
function tourPosition() {
  const st = TOUR_STEPS[tutStep];
  const tgt = st.sel ? document.querySelector(st.sel) : null;
  const rect =
    tgt && tgt.getBoundingClientRect().width > 0
      ? tgt.getBoundingClientRect()
      : null;
  const pad = 6;
  if (rect) {
    tourDim.style.display = "none";
    tourHole.style.display = "block";
    tourHole.style.left = rect.left - pad + "px";
    tourHole.style.top = rect.top - pad + "px";
    tourHole.style.width = rect.width + pad * 2 + "px";
    tourHole.style.height = rect.height + pad * 2 + "px";
  } else {
    tourHole.style.display = "none";
    tourDim.style.display = "block";
  }
  tourTip.style.display = "block";
  const tw = tourTip.offsetWidth,
    th = tourTip.offsetHeight,
    vw = window.innerWidth,
    vh = window.innerHeight;
  let left, top;
  if (rect) {
    if (rect.bottom + th + 14 < vh) {
      top = rect.bottom + 12;
      left = Math.min(Math.max(8, rect.left), vw - tw - 8);
    } else if (rect.top - th - 14 > 0) {
      top = rect.top - th - 12;
      left = Math.min(Math.max(8, rect.left), vw - tw - 8);
    } else {
      top = Math.max(8, (vh - th) / 2);
      left = Math.min(Math.max(8, rect.right + 12), vw - tw - 8);
    }
  } else {
    left = (vw - tw) / 2;
    top = (vh - th) / 2;
  }
  tourTip.style.left = left + "px";
  tourTip.style.top = top + "px";
}

function tourBody(k) {
  try {
    if (window.matchMedia && matchMedia("(pointer:coarse)").matches) {
      const tk = k + "bt";
      if (STRINGS[tk] !== undefined) return t(tk);
    }
  } catch (e) {}
  return t(k + "b");
}
function openTutorial(i) {
  tourBuild();
  if (!tourOpen) {
    tourOpen = true;
    tourPrevFocus = document.activeElement;
  }
  if (typeof closeModal === "function") closeModal();
  if (typeof setView === "function" && view !== "diagram") setView("diagram");
  if (typeof window.pinPanels === "function") window.pinPanels();
  if (typeof setHdr === "function") setHdr(true);
  tutStep = Math.max(0, Math.min(TOUR_STEPS.length - 1, i));
  const n = tutStep + 1,
    st = TOUR_STEPS[tutStep],
    last = tutStep === TOUR_STEPS.length - 1;
  try {
    localStorage.setItem("netsim_seen_tutorial", "1");
  } catch (e) {}
  const navHtml = last
    ? `<div class="tour-nav-end"><button class="btn primary" id="tutCourse">${icon("layers")}${t("tutGoCourse")}</button><button class="btn" id="tutTasks">${icon("tasks")}${t("tutGoTasks")}</button><button class="btn" id="tutGo">${t("tutGo")}</button><button class="btn tour-back" id="tutPrev">${t("tutPrev")}</button></div>`
    : `<div class="tour-nav"><button class="btn" id="tutSkip">${t("tutSkip")}</button><span style="display:flex;gap:8px;margin-left:auto">${tutStep > 0 ? `<button class="btn" id="tutPrev">${t("tutPrev")}</button>` : ""}${tutStep === 0 ? `<button class="btn" id="tutCourse">${t("tutGoCourse")}</button><button class="btn primary" id="tutNext">${t("tutNext")}</button>` : `<button class="btn primary" id="tutNext">${t("tutNext")}</button>`}</span></div>`;
  tourTip.innerHTML = `<div class="tour-step">${t("tutBadge")} · ${n}/${TOUR_STEPS.length}</div>
    <h4>${t(st.k + "t")}</h4><p>${tourBody(st.k)}</p>${st.ill || ""}${navHtml}`;
  tourTip.setAttribute(
    "aria-label",
    t("tutBadge") + " " + n + "/" + TOUR_STEPS.length + " – " + t(st.k + "t"),
  );
  if (tourLive)
    tourLive.textContent =
      t("tutBadge") + " " + n + "/" + TOUR_STEPS.length + " – " + t(st.k + "t");
  tourPosition();
  if ($("tutSkip")) $("tutSkip").onclick = closeTour;
  if ($("tutGo")) $("tutGo").onclick = closeTour;
  if ($("tutPrev")) $("tutPrev").onclick = () => openTutorial(tutStep - 1);
  if ($("tutCourse"))
    $("tutCourse").onclick = () => {
      closeTour();
      ensureCourse(() => openCourse());
    };
  if ($("tutTasks"))
    $("tutTasks").onclick = () => {
      closeTour();
      openTasksModal();
    };
  if ($("tutNext")) $("tutNext").onclick = () => openTutorial(tutStep + 1);
  if (!tourResizeBound) {
    tourResizeBound = true;
    window.addEventListener("resize", () => {
      if (tourTip && tourTip.style.display !== "none") tourPosition();
    });
  }
  tourFocusIn();
  setTimeout(tourFocusIn, 30);
}

function tEv(a, b, proto, port, content, payload) {
  return evaluateEP(
    a,
    b,
    {
      proto: proto,
      port: port,
      content: content || null,
      payload:
        payload != null ? payload : content ? samplePayload(content) : "clean",
    },
    {},
  ).status;
}
function tBlockedBy(a, b, proto, port, devId, content, payload) {
  const r = evaluateEP(
    a,
    b,
    {
      proto: proto,
      port: port,
      content: content || null,
      payload:
        payload != null ? payload : content ? samplePayload(content) : "clean",
    },
    {},
  );
  return r.status !== "allowed" && !!r.blockedAt && r.blockedAt.id === devId;
}
function progressStats() {
  const cp = courseProgress(),
    td = tasksDone();
  const done = (id) => !!cp[id];
  let courses = [];
  try {
    courses = (typeof allCourses === "function" ? allCourses() : []).map(
      (c) => {
        let total = 0,
          seen = 0;
        (c.lessons || []).forEach((le) => {
          (le.modules || []).forEach((m) => {
            total++;
            if (done(m.id)) seen++;
          });
          if (le.quizId) {
            total++;
            if (done(le.quizId)) seen++;
          }
        });
        return { id: c.id, title: c.title || c.id, total, seen };
      },
    );
  } catch (e) {}
  let tasks = { total: 0, done: 0 };
  try {
    const T = getTasks();
    tasks = {
      total: T.length,
      done: T.filter((x) => td.indexOf(x.id) >= 0).length,
    };
  } catch (e) {}
  return { courses, tasks };
}
function openProgressOverview() {
  const st = progressStats();
  const fmt = (x) => {
    const m = Math.floor(x / 60),
      ss = String(x % 60).padStart(2, "0");
    return m + ":" + ss;
  };
  const bar = (seen, total) => {
    const pct = total ? Math.round((seen * 100) / total) : 0;
    return (
      '<div style="flex:1 1 90px;height:6px;background:var(--panel);border-radius:4px;overflow:hidden;min-width:70px"><div style="width:' +
      pct +
      "%;height:100%;background:var(" +
      (pct === 100 ? "--green" : "--cyan") +
      ')"></div></div>'
    );
  };
  const cDone = st.courses.filter((c) => c.total && c.seen >= c.total).length;
  const cStarted = st.courses.filter(
    (c) => c.seen > 0 && c.seen < c.total,
  ).length;
  const rows = st.courses
    .filter((c) => c.seen > 0)
    .sort((a, b) => b.seen / b.total - a.seen / a.total)
    .map(
      (c) =>
        '<div style="display:flex;align-items:center;gap:9px;margin:5px 0;font-size:12.5px"><span style="flex:1 1 auto">' +
        esc(c.title) +
        "</span>" +
        bar(c.seen, c.total) +
        '<span style="flex:0 0 auto;color:var(--muted);font-family:var(--mono);font-size:11px">' +
        c.seen +
        "/" +
        c.total +
        "</span></div>",
    )
    .join("");
  openModal(
    "<h2>" +
      icon("chart", "ico-a") +
      esc(t("progOvTitle")) +
      "</h2>" +
      '<div class="ab-sec" style="color:var(--muted)">' +
      tf(
        "progOvLead2",
        cDone,
        st.courses.length,
        st.tasks.done,
        st.tasks.total,
      ) +
      "</div>" +
      (rows
        ? '<h3 class="ab-h">' + esc(t("progOvCourses")) + "</h3>" + rows
        : '<div class="ab-sec" style="color:var(--muted)">' +
          t("progOvNothing") +
          "</div>") +
      (cStarted
        ? '<div style="font-size:11.5px;color:var(--muted);margin-top:6px">' +
          tf("progOvStarted", cStarted) +
          "</div>"
        : "") +
      '<div class="actions" style="justify-content:space-between"><div style="display:flex;gap:8px"><button class="btn" id="povBackup">' +
      esc(t("btnProgress")) +
      "</button>" +
      '<button class="btn" id="povCourses">' +
      esc(t("learnCourse")) +
      "</button></div>" +
      '<button class="btn primary" id="povClose">' +
      esc(t("btnCloseModal")) +
      "</button></div>",
  );
  $("povBackup").onclick = () => {
    closeModal();
    openProgressModal();
  };
  $("povCourses").onclick = () => {
    closeModal();
    ensureCourse(() => openCourse());
  };
  $("povClose").onclick = closeModal;
}
function progressExportObj() {
  const g = (k) => {
    try {
      return localStorage.getItem(k);
    } catch (e) {
      return null;
    }
  };
  return {
    app: "networksim",
    kind: "progress",
    v: 1,
    ver: typeof APP_VERSION !== "undefined" ? APP_VERSION : "",
    date: new Date().toISOString(),
    course: (() => {
      try {
        return JSON.parse(g("netsim_course_progress") || "{}");
      } catch (e) {
        return {};
      }
    })(),
    tasks: (() => {
      try {
        return JSON.parse(g("netsim_tasks_done") || "[]");
      } catch (e) {
        return [];
      }
    })(),
  };
}
function progressImportObj(o) {
  if (!o || o.kind !== "progress" || typeof o !== "object") return false;

  const cur = courseProgress();
  const inc = o.course && typeof o.course === "object" ? o.course : {};
  Object.keys(inc).forEach((k) => {
    if (k !== "_last" && inc[k]) cur[k] = 1;
  });
  try {
    localStorage.setItem(CRS_PROG_KEY, JSON.stringify(cur));
  } catch (e) {}
  const td = tasksDone();
  (Array.isArray(o.tasks) ? o.tasks : []).forEach((id) => {
    if (typeof id === "string" && td.indexOf(id) < 0) td.push(id);
  });
  try {
    localStorage.setItem("netsim_tasks_done", JSON.stringify(td));
  } catch (e) {}
  return true;
}
function openProgressModal() {
  const cp = courseProgress();
  const nMod = Object.keys(cp).filter((k) => k !== "_last").length;
  const nTask = tasksDone().length;
  openModal(
    "<h2>" +
      icon("shieldcheck", "ico-a") +
      esc(t("progTitle")) +
      "</h2>" +
      '<div class="ab-sec" style="color:var(--muted)">' +
      t("progIntro") +
      "</div>" +
      '<div class="ab-sec">' +
      tf("progStats", nMod, nTask) +
      "</div>" +
      '<div class="actions" style="justify-content:flex-start"><button class="btn primary" id="progExp">' +
      esc(t("progExport")) +
      "</button>" +
      '<button class="btn" id="progImp">' +
      esc(t("progImport")) +
      "</button>" +
      '<input type="file" id="progFile" accept=".json,application/json" style="display:none"></div>',
  );
  $("progExp").onclick = () => {
    const b = new Blob([JSON.stringify(progressExportObj(), null, 1)], {
      type: "application/json",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(b);
    a.download = "networksim-postup.json";
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    setStatus(t("progExported"));
  };
  $("progImp").onclick = () => $("progFile").click();
  $("progFile").onchange = (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      let ok = false;
      try {
        ok = progressImportObj(JSON.parse(String(r.result)));
      } catch (err) {}
      if (ok) {
        setStatus(t("progImported"));
        closeModal();
        if (typeof renderTasksModal === "function") {
        }
      } else setStatus(t("progBadFile"), false);
    };
    r.readAsText(f);
  };
}
$("btnProgress").onclick = () => {
  if (typeof closeMenus === "function") closeMenus();
  openProgressModal();
};
function tasksDone() {
  try {
    return JSON.parse(localStorage.getItem("netsim_tasks_done") || "[]");
  } catch (e) {
    return [];
  }
}
function markTaskDone(id) {
  const a = tasksDone();
  if (a.indexOf(id) < 0) {
    a.push(id);
    try {
      localStorage.setItem("netsim_tasks_done", JSON.stringify(a));
    } catch (e) {}
  }
}
let activeTask = null;
let taskOrigin = "tasks";
function taskWebDmz() {
  return {
    meta: { name: "web-dmz", version: 1 },
    segments: [
      {
        id: "t_int",
        name: "Internet",
        subnet: "0.0.0.0/0",
        isInternet: true,
        color: "#fbbf24",
        icon: "globe",
        x: 430,
        y: 40,
      },
      {
        id: "t_dmz",
        name: "DMZ",
        subnet: "203.0.113.0/24",
        color: "#fb923c",
        icon: "lan",
      },
      {
        id: "t_lan",
        name: "Internal LAN",
        subnet: "10.0.0.0/24",
        vlan: "10",
        color: "#3ddc97",
        icon: "lan",
      },
    ],
    devices: [
      {
        id: "t_fw",
        type: "firewall",
        label: "FW",
        x: 430,
        y: 170,
        zoneMode: true,
        defaultAction: "deny",
        simpleRules: [],
        zones: [
          { id: "zo", name: "outside", role: "outside" },
          { id: "zi", name: "inside", role: "inside" },
          { id: "zd", name: "DMZ", role: "dmz" },
        ],
        ifaceZones: { tl1: "zo", tl2: "zd", tl5: "zi" },
        firewallRules: [],
      },
      { id: "t_sw_dmz", type: "l2switch", label: "SW-DMZ", x: 640, y: 300 },
      { id: "t_sw_lan", type: "l2switch", label: "SW-LAN", x: 230, y: 300 },
    ],
    hosts: [
      {
        id: "t_web",
        type: "host",
        label: "WEB",
        kind: "server",
        services: [443],
        segId: "t_dmz",
        x: 640,
        y: 420,
      },
      {
        id: "t_db",
        type: "host",
        label: "Internal server",
        kind: "server",
        services: [445],
        segId: "t_lan",
        x: 230,
        y: 420,
      },
    ],
    links: [
      { id: "tl1", fromId: "t_int", toId: "t_fw" },
      { id: "tl2", fromId: "t_fw", toId: "t_sw_dmz" },
      { id: "tl3", fromId: "t_sw_dmz", toId: "t_dmz" },
      { id: "tl4", fromId: "t_web", toId: "t_sw_dmz" },
      { id: "tl5", fromId: "t_fw", toId: "t_sw_lan" },
      { id: "tl6", fromId: "t_sw_lan", toId: "t_lan" },
      { id: "tl7", fromId: "t_db", toId: "t_sw_lan" },
    ],
  };
}

function vsSplitOk() {
  const a = getNode("vs_mkt"),
    b = getNode("vs_nas");
  if (
    !a ||
    !b ||
    !a.segId ||
    a.segId !== b.segId ||
    a.segId === "vs_lan" ||
    !getNode(a.segId)
  )
    return false;
  const naSw = (id) =>
    (DB.links || []).some(
      (l) =>
        (l.fromId === id && l.toId === "vs_sw") ||
        (l.toId === id && l.fromId === "vs_sw"),
    );
  return naSw("vs_mkt") && naSw("vs_nas");
}
function taskVlanSplit() {
  return {
    meta: { name: "vlan-split", version: 1 },
    segments: [
      {
        id: "vs_lan",
        name: "VLAN10 Company LAN",
        subnet: "10.0.1.0/24",
        vlan: "10",
        color: "#2dd4bf",
        icon: "lan",
      },
    ],
    devices: [{ id: "vs_sw", type: "l2switch", label: "SW", x: 430, y: 180 }],
    hosts: [
      {
        id: "vs_uc",
        type: "host",
        label: "PC accountant",
        kind: "pc",
        services: [],
        segId: "vs_lan",
        x: 150,
        y: 330,
      },
      {
        id: "vs_srv",
        type: "host",
        label: "Accounting server (SMB 445)",
        kind: "server",
        services: [445],
        segId: "vs_lan",
        x: 340,
        y: 330,
      },
      {
        id: "vs_mkt",
        type: "host",
        label: "PC marketing",
        kind: "pc",
        services: [],
        segId: "vs_lan",
        x: 530,
        y: 330,
      },
      {
        id: "vs_nas",
        type: "host",
        label: "NAS marketingu (SMB 445)",
        kind: "server",
        services: [445],
        segId: "vs_lan",
        x: 720,
        y: 330,
      },
    ],
    links: [
      { id: "vsl1", fromId: "vs_sw", toId: "vs_lan" },
      { id: "vsl2", fromId: "vs_uc", toId: "vs_sw" },
      { id: "vsl3", fromId: "vs_srv", toId: "vs_sw" },
      { id: "vsl4", fromId: "vs_mkt", toId: "vs_sw" },
      { id: "vsl5", fromId: "vs_nas", toId: "vs_sw" },
    ],
  };
}
function taskTrunkSetup() {
  return {
    meta: { name: "trunk-setup", version: 1 },
    segments: [
      {
        id: "tr_v10",
        name: "VLAN10 Prodej",
        subnet: "10.0.10.0/24",
        vlan: "10",
        color: "#2dd4bf",
        icon: "lan",
      },
      {
        id: "tr_v20",
        name: "VLAN20 Servers",
        subnet: "10.0.20.0/24",
        vlan: "20",
        color: "#3ddc97",
        icon: "lan",
      },
    ],
    devices: [
      { id: "tr_swa", type: "l2switch", label: "SW-A", x: 300, y: 200 },
      { id: "tr_swb", type: "l2switch", label: "SW-B", x: 600, y: 200 },
    ],
    hosts: [
      {
        id: "tr_pc10a",
        type: "host",
        label: "Sales file server (SMB 445)",
        kind: "server",
        services: [445],
        segId: "tr_v10",
        x: 180,
        y: 340,
      },
      {
        id: "tr_srv20",
        type: "host",
        label: "Server (SMB 445)",
        kind: "server",
        services: [445],
        segId: "tr_v20",
        x: 340,
        y: 340,
      },
      {
        id: "tr_pc10b",
        type: "host",
        label: "PC sales B",
        kind: "pc",
        services: [],
        segId: "tr_v10",
        x: 560,
        y: 340,
      },
      {
        id: "tr_pc20b",
        type: "host",
        label: "PC admin",
        kind: "pc",
        services: [],
        segId: "tr_v20",
        x: 720,
        y: 340,
      },
    ],
    links: [
      {
        id: "trl1",
        fromId: "tr_swa",
        toId: "tr_swb",
        port: { mode: "access", vlan: "tr_v10" },
      },
      { id: "trl2", fromId: "tr_swa", toId: "tr_v10" },
      { id: "trl3", fromId: "tr_swa", toId: "tr_v20" },
      { id: "trl4", fromId: "tr_pc10a", toId: "tr_swa" },
      { id: "trl5", fromId: "tr_srv20", toId: "tr_swa" },
      { id: "trl6", fromId: "tr_pc10b", toId: "tr_swb" },
      { id: "trl7", fromId: "tr_pc20b", toId: "tr_swb" },
    ],
  };
}
function taskGuestIso() {
  return {
    meta: { name: "guest-iso", version: 1 },
    segments: [
      {
        id: "t_int",
        name: "Internet",
        subnet: "0.0.0.0/0",
        isInternet: true,
        color: "#fbbf24",
        icon: "globe",
        x: 430,
        y: 30,
      },
      {
        id: "t_ws",
        name: "VLAN10 Workstations",
        subnet: "10.0.1.0/24",
        vlan: "10",
        color: "#2dd4bf",
        icon: "lan",
      },
      {
        id: "t_srvn",
        name: "VLAN20 Servers",
        subnet: "10.0.2.0/24",
        vlan: "20",
        color: "#3ddc97",
        icon: "lan",
      },
      {
        id: "t_guest",
        name: "VLAN30 Guest",
        subnet: "10.0.3.0/24",
        vlan: "30",
        color: "#f472b6",
        icon: "lan",
      },
    ],
    devices: [
      {
        id: "t_fw",
        type: "firewall",
        label: "FW",
        x: 430,
        y: 120,
        zoneMode: true,
        defaultAction: "deny",
        simpleRules: [],
        zones: [
          { id: "zo", name: "outside", role: "outside" },
          { id: "zi", name: "inside", role: "inside" },
        ],
        ifaceZones: { gl1: "zo", gl2: "zi" },
        firewallRules: [],
      },
      {
        id: "t_core",
        type: "l3switch",
        label: "Core L3",
        acl: [],
        x: 430,
        y: 230,
      },
      { id: "t_sw", type: "l2switch", label: "SW-access", x: 430, y: 330 },
    ],
    hosts: [
      {
        id: "t_pc",
        type: "host",
        label: "PC",
        kind: "pc",
        services: [],
        segId: "t_ws",
        x: 200,
        y: 450,
      },
      {
        id: "t_srv",
        type: "host",
        label: "SRV (SMB 445)",
        kind: "server",
        services: [445],
        segId: "t_srvn",
        x: 430,
        y: 450,
      },
      {
        id: "t_g",
        type: "host",
        label: "Guest NTB",
        kind: "ntb",
        services: [],
        segId: "t_guest",
        x: 660,
        y: 450,
      },
    ],
    links: [
      { id: "gl1", fromId: "t_int", toId: "t_fw" },
      { id: "gl2", fromId: "t_fw", toId: "t_core" },
      { id: "gl3", fromId: "t_core", toId: "t_sw" },
      { id: "gl4", fromId: "t_sw", toId: "t_ws" },
      { id: "gl5", fromId: "t_sw", toId: "t_srvn" },
      { id: "gl6", fromId: "t_sw", toId: "t_guest" },
      { id: "gl7", fromId: "t_pc", toId: "t_sw" },
      { id: "gl8", fromId: "t_srv", toId: "t_sw" },
      { id: "gl9", fromId: "t_g", toId: "t_sw" },
    ],
  };
}
function taskTlsBlind() {
  return {
    meta: { name: "tls-blind", version: 1 },
    segments: [
      {
        id: "tb_int",
        name: "Internet",
        subnet: "0.0.0.0/0",
        isInternet: true,
        color: "#fbbf24",
        icon: "globe",
        x: 430,
        y: 30,
      },
      {
        id: "tb_dmz",
        name: "DMZ – web",
        subnet: "203.0.113.0/24",
        color: "#fb923c",
        icon: "lan",
      },
    ],
    devices: [
      {
        id: "tb_ips",
        type: "idsips",
        label: "IPS",
        mode: "ips",
        tlsInspect: false,
        signatures: [{ id: "s1", label: "SQLi", content: "sqli" }],
        x: 430,
        y: 130,
      },
      {
        id: "tb_fw",
        type: "firewall",
        label: "FW",
        x: 430,
        y: 240,
        zoneMode: true,
        defaultAction: "deny",
        simpleRules: [],
        zones: [
          { id: "zo", name: "outside", role: "outside" },
          { id: "zd", name: "DMZ", role: "dmz" },
        ],
        ifaceZones: { tbl2: "zo", tbl3: "zd" },
        firewallRules: [
          {
            id: "r1",
            srcZone: "zo",
            dstZone: "zd",
            srcSeg: "*",
            dstSeg: "*",
            action: "permit",
            proto: "tcp",
            portOp: "eq",
            port: 443,
            port2: null,
          },
          {
            id: "r2",
            srcZone: "zo",
            dstZone: "zd",
            srcSeg: "*",
            dstSeg: "*",
            action: "permit",
            proto: "tcp",
            portOp: "eq",
            port: 80,
            port2: null,
          },
        ],
      },
      { id: "tb_sw", type: "l2switch", label: "SW-DMZ", x: 640, y: 360 },
    ],
    hosts: [
      {
        id: "tb_web",
        type: "host",
        label: "WEB (80 + 443)",
        kind: "server",
        services: [80, 443],
        segId: "tb_dmz",
        x: 640,
        y: 470,
      },
    ],
    links: [
      { id: "tbl1", fromId: "tb_int", toId: "tb_ips" },
      { id: "tbl2", fromId: "tb_ips", toId: "tb_fw" },
      { id: "tbl3", fromId: "tb_fw", toId: "tb_sw" },
      { id: "tbl4", fromId: "tb_sw", toId: "tb_dmz" },
      { id: "tbl5", fromId: "tb_web", toId: "tb_sw" },
    ],
  };
}
function taskIpsSqli() {
  return {
    meta: { name: "ips-sqli", version: 1 },
    segments: [
      {
        id: "t_int",
        name: "Internet",
        subnet: "0.0.0.0/0",
        isInternet: true,
        color: "#fbbf24",
        icon: "globe",
        x: 430,
        y: 30,
      },
      {
        id: "t_dmz",
        name: "DMZ – Web",
        subnet: "203.0.113.0/24",
        color: "#fb923c",
        icon: "lan",
      },
    ],
    devices: [
      {
        id: "t_ips",
        type: "idsips",
        tlsInspect: true,
        label: "IPS",
        mode: "ips",
        signatures: [],
        x: 430,
        y: 130,
      },
      {
        id: "t_fw",
        type: "firewall",
        label: "FW",
        x: 430,
        y: 240,
        zoneMode: true,
        defaultAction: "deny",
        simpleRules: [],
        zones: [
          { id: "zo", name: "outside", role: "outside" },
          { id: "zd", name: "DMZ", role: "dmz" },
        ],
        ifaceZones: { il2: "zo", il3: "zd" },
        firewallRules: [
          {
            id: "r1",
            srcZone: "zo",
            dstZone: "zd",
            srcSeg: "*",
            dstSeg: "*",
            action: "permit",
            proto: "tcp",
            portOp: "eq",
            port: 443,
            port2: null,
          },
        ],
      },
      { id: "t_sw", type: "l2switch", label: "SW-DMZ", x: 640, y: 360 },
    ],
    hosts: [
      {
        id: "t_web",
        type: "host",
        label: "WEB",
        kind: "server",
        services: [443, 80],
        segId: "t_dmz",
        x: 640,
        y: 470,
      },
    ],
    links: [
      { id: "il1", fromId: "t_int", toId: "t_ips" },
      { id: "il2", fromId: "t_ips", toId: "t_fw" },
      { id: "il3", fromId: "t_fw", toId: "t_sw" },
      { id: "il4", fromId: "t_sw", toId: "t_dmz" },
      { id: "il5", fromId: "t_web", toId: "t_sw" },
    ],
  };
}
function taskIdsIps() {
  return {
    meta: { name: "ids-to-ips", version: 1 },
    segments: [
      {
        id: "ii_int",
        name: "Internet",
        subnet: "0.0.0.0/0",
        isInternet: true,
        color: "#fbbf24",
        icon: "globe",
        x: 430,
        y: 30,
      },
      {
        id: "ii_dmz",
        name: "DMZ – Web",
        subnet: "203.0.113.0/24",
        color: "#fb923c",
        icon: "lan",
      },
    ],
    devices: [
      {
        id: "ii_ids",
        type: "idsips",
        tlsInspect: true,
        label: "Sonda (IDS)",
        mode: "ids",
        signatures: [
          { id: "s1", label: "Malware / EICAR", content: "malware" },
        ],
        x: 430,
        y: 130,
      },
      {
        id: "ii_fw",
        type: "firewall",
        label: "FW",
        x: 430,
        y: 240,
        zoneMode: true,
        defaultAction: "deny",
        simpleRules: [],
        zones: [
          { id: "zo", name: "outside", role: "outside" },
          { id: "zd", name: "DMZ", role: "dmz" },
        ],
        ifaceZones: { iil2: "zo", iil3: "zd" },
        firewallRules: [
          {
            id: "r1",
            srcZone: "zo",
            dstZone: "zd",
            srcSeg: "*",
            dstSeg: "*",
            action: "permit",
            proto: "tcp",
            portOp: "eq",
            port: 443,
            port2: null,
          },
        ],
      },
      { id: "ii_sw", type: "l2switch", label: "SW-DMZ", x: 640, y: 360 },
    ],
    hosts: [
      {
        id: "ii_web",
        type: "host",
        label: "WEB",
        kind: "server",
        services: [443],
        segId: "ii_dmz",
        x: 640,
        y: 470,
      },
    ],
    links: [
      { id: "iil1", fromId: "ii_int", toId: "ii_ids" },
      { id: "iil2", fromId: "ii_ids", toId: "ii_fw" },
      { id: "iil3", fromId: "ii_fw", toId: "ii_sw" },
      { id: "iil4", fromId: "ii_sw", toId: "ii_dmz" },
      { id: "iil5", fromId: "ii_web", toId: "ii_sw" },
    ],
  };
}
function taskWiretap() {
  return {
    meta: { name: "wiretap", version: 1 },

    segments: [
      {
        id: "wt_int",
        name: "Internet",
        subnet: "0.0.0.0/0",
        isInternet: true,
        color: "#fbbf24",
        icon: "globe",
        x: 430,
        y: 40,
      },
      {
        id: "wt_lan",
        name: "Offices",
        subnet: "10.0.5.0/24",
        color: "#3ddc97",
        icon: "lan",
        x: 230,
        y: 300,
      },
      {
        id: "wt_srv",
        name: "Servers",
        subnet: "10.0.6.0/24",
        color: "#7dd3fc",
        icon: "db",
        x: 640,
        y: 300,
      },
    ],
    devices: [
      {
        id: "wt_fw",
        type: "firewall",
        label: "Firewall",
        x: 430,
        y: 170,
        zoneMode: false,
        defaultAction: "deny",
        firewallRules: [],
        simpleRules: [
          {
            id: "wt_r1",
            srcSeg: "wt_lan",
            dstSeg: "wt_srv",
            action: "permit",
            proto: "tcp",
            portOp: "eq",
            port: 23,
            port2: null,
          },
          {
            id: "wt_r2",
            srcSeg: "wt_lan",
            dstSeg: "wt_srv",
            action: "permit",
            proto: "tcp",
            portOp: "eq",
            port: 22,
            port2: null,
          },
          {
            id: "wt_r3",
            srcSeg: "wt_lan",
            dstSeg: "wt_int",
            action: "permit",
            proto: "tcp",
            portOp: "eq",
            port: 443,
            port2: null,
          },
        ],
      },
      { id: "wt_sw", type: "l2switch", label: "SW-offices", x: 230, y: 420 },
    ],
    hosts: [
      {
        id: "wt_adm",
        type: "host",
        label: "PC admin",
        kind: "pc",
        services: [],
        segId: "wt_lan",
        x: 120,
        y: 520,
      },
      {
        id: "wt_srv1",
        type: "host",
        label: "Admin server",
        kind: "server",
        services: [22, 23],
        segId: "wt_srv",
        x: 640,
        y: 430,
      },
    ],
    links: [
      { id: "wtl1", fromId: "wt_int", toId: "wt_fw" },
      { id: "wtl2", fromId: "wt_fw", toId: "wt_sw" },
      { id: "wtl3", fromId: "wt_sw", toId: "wt_lan" },
      { id: "wtl4", fromId: "wt_fw", toId: "wt_srv" },
      { id: "wtl5", fromId: "wt_adm", toId: "wt_sw" },
      { id: "wtl6", fromId: "wt_srv1", toId: "wt_srv" },
    ],
  };
}
function taskBlockTelnet() {
  return {
    meta: { name: "block-telnet", version: 1 },
    segments: [
      {
        id: "bt_ws",
        name: "VLAN10 Workstations",
        subnet: "10.0.1.0/24",
        vlan: "10",
        color: "#2dd4bf",
        icon: "lan",
      },
      {
        id: "bt_srv",
        name: "VLAN20 Mgmt",
        subnet: "10.0.2.0/24",
        vlan: "20",
        color: "#3ddc97",
        icon: "lan",
      },
    ],
    devices: [
      {
        id: "bt_core",
        type: "l3switch",
        label: "Core L3",
        acl: [],
        x: 430,
        y: 140,
      },
      { id: "bt_sw", type: "l2switch", label: "SW-access", x: 430, y: 250 },
    ],
    hosts: [
      {
        id: "bt_pc",
        type: "host",
        label: "PC",
        kind: "pc",
        services: [],
        segId: "bt_ws",
        x: 250,
        y: 380,
      },
      {
        id: "bt_mgmt",
        type: "host",
        label: "Mgmt server (SSH+Telnet)",
        kind: "server",
        services: [22, 23],
        segId: "bt_srv",
        x: 610,
        y: 380,
      },
    ],
    links: [
      { id: "btl1", fromId: "bt_core", toId: "bt_sw" },
      { id: "btl2", fromId: "bt_sw", toId: "bt_ws" },
      { id: "btl3", fromId: "bt_sw", toId: "bt_srv" },
      { id: "btl4", fromId: "bt_pc", toId: "bt_sw" },
      { id: "btl5", fromId: "bt_mgmt", toId: "bt_sw" },
    ],
  };
}
function taskDmzPivot() {
  return {
    meta: { name: "dmz-pivot", version: 1 },
    segments: [
      {
        id: "dp_int",
        name: "Internet",
        subnet: "0.0.0.0/0",
        isInternet: true,
        color: "#fbbf24",
        icon: "globe",
        x: 430,
        y: 30,
      },
      {
        id: "dp_dmz",
        name: "DMZ",
        subnet: "203.0.113.0/24",
        color: "#fb923c",
        icon: "lan",
      },
      {
        id: "dp_lan",
        name: "LAN (DB)",
        subnet: "10.0.0.0/24",
        vlan: "10",
        color: "#3ddc97",
        icon: "lan",
      },
    ],
    devices: [
      {
        id: "dp_fw",
        type: "firewall",
        label: "FW",
        x: 430,
        y: 150,
        zoneMode: true,
        defaultAction: "deny",
        simpleRules: [],
        zones: [
          { id: "zo", name: "outside", role: "outside" },
          { id: "zi", name: "inside", role: "inside" },
          { id: "zd", name: "DMZ", role: "dmz" },
        ],
        ifaceZones: { dpl1: "zo", dpl2: "zd", dpl5: "zi" },
        firewallRules: [
          {
            id: "r1",
            srcZone: "zo",
            dstZone: "zd",
            srcSeg: "*",
            dstSeg: "*",
            action: "permit",
            proto: "tcp",
            portOp: "eq",
            port: 443,
            port2: null,
          },
          {
            id: "r2",
            srcZone: "zd",
            dstZone: "zi",
            srcSeg: "*",
            dstSeg: "*",
            action: "permit",
            proto: "ip",
            portOp: "any",
            port: null,
            port2: null,
          },
        ],
      },
      { id: "dp_sw_dmz", type: "l2switch", label: "SW-DMZ", x: 640, y: 290 },
      { id: "dp_sw_lan", type: "l2switch", label: "SW-LAN", x: 230, y: 290 },
    ],
    hosts: [
      {
        id: "dp_web",
        type: "host",
        label: "WEB (DMZ)",
        kind: "server",
        services: [443],
        segId: "dp_dmz",
        x: 640,
        y: 410,
      },
      {
        id: "dp_db",
        type: "host",
        label: "DB (internal)",
        kind: "server",
        services: [1433],
        segId: "dp_lan",
        x: 230,
        y: 410,
      },
    ],
    links: [
      { id: "dpl1", fromId: "dp_int", toId: "dp_fw" },
      { id: "dpl2", fromId: "dp_fw", toId: "dp_sw_dmz" },
      { id: "dpl3", fromId: "dp_sw_dmz", toId: "dp_dmz" },
      { id: "dpl4", fromId: "dp_web", toId: "dp_sw_dmz" },
      { id: "dpl5", fromId: "dp_fw", toId: "dp_sw_lan" },
      { id: "dpl6", fromId: "dp_sw_lan", toId: "dp_lan" },
      { id: "dpl7", fromId: "dp_db", toId: "dp_sw_lan" },
    ],
  };
}
function taskCustomSig() {
  return {
    meta: { name: "ips-custom", version: 1 },
    segments: [
      {
        id: "cp_int",
        name: "Internet",
        subnet: "0.0.0.0/0",
        isInternet: true,
        color: "#fbbf24",
        icon: "globe",
        x: 430,
        y: 30,
      },
      {
        id: "cp_dmz",
        name: "DMZ – Web",
        subnet: "203.0.113.0/24",
        color: "#fb923c",
        icon: "lan",
      },
    ],
    devices: [
      {
        id: "cp_ips",
        type: "idsips",
        tlsInspect: true,
        label: "IPS",
        mode: "ips",
        signatures: [],
        x: 430,
        y: 130,
      },
      {
        id: "cp_fw",
        type: "firewall",
        label: "FW",
        x: 430,
        y: 240,
        zoneMode: true,
        defaultAction: "deny",
        simpleRules: [],
        zones: [
          { id: "zo", name: "outside", role: "outside" },
          { id: "zd", name: "DMZ", role: "dmz" },
        ],
        ifaceZones: { cpl2: "zo", cpl3: "zd" },
        firewallRules: [
          {
            id: "r1",
            srcZone: "zo",
            dstZone: "zd",
            srcSeg: "*",
            dstSeg: "*",
            action: "permit",
            proto: "tcp",
            portOp: "eq",
            port: 443,
            port2: null,
          },
        ],
      },
      { id: "cp_sw", type: "l2switch", label: "SW-DMZ", x: 640, y: 360 },
    ],
    hosts: [
      {
        id: "cp_web",
        type: "host",
        label: "WEB",
        kind: "server",
        services: [443],
        segId: "cp_dmz",
        x: 640,
        y: 470,
      },
    ],
    links: [
      { id: "cpl1", fromId: "cp_int", toId: "cp_ips" },
      { id: "cpl2", fromId: "cp_ips", toId: "cp_fw" },
      { id: "cpl3", fromId: "cp_fw", toId: "cp_sw" },
      { id: "cpl4", fromId: "cp_sw", toId: "cp_dmz" },
      { id: "cpl5", fromId: "cp_web", toId: "cp_sw" },
    ],
  };
}
function taskDefaultDeny() {
  return {
    meta: { name: "default-deny", version: 1 },
    segments: [
      {
        id: "dd_int",
        name: "Internet",
        subnet: "0.0.0.0/0",
        isInternet: true,
        color: "#fbbf24",
        icon: "globe",
        x: 430,
        y: 30,
      },
      {
        id: "dd_dmz",
        name: "DMZ",
        subnet: "203.0.113.0/24",
        color: "#fb923c",
        icon: "lan",
      },
      {
        id: "dd_lan",
        name: "LAN (DB)",
        subnet: "10.0.0.0/24",
        vlan: "10",
        color: "#3ddc97",
        icon: "lan",
      },
    ],
    devices: [
      {
        id: "dd_fw",
        type: "firewall",
        label: "FW (simple)",
        x: 430,
        y: 150,
        zoneMode: false,
        defaultAction: "permit",
        simpleRules: [],
        zones: [],
        ifaceZones: {},
        firewallRules: [],
      },
      { id: "dd_sw_dmz", type: "l2switch", label: "SW-DMZ", x: 640, y: 290 },
      { id: "dd_sw_lan", type: "l2switch", label: "SW-LAN", x: 230, y: 290 },
    ],
    hosts: [
      {
        id: "dd_web",
        type: "host",
        label: "WEB",
        kind: "server",
        services: [443],
        segId: "dd_dmz",
        x: 640,
        y: 410,
      },
      {
        id: "dd_db",
        type: "host",
        label: "DB",
        kind: "server",
        services: [1433],
        segId: "dd_lan",
        x: 230,
        y: 410,
      },
    ],
    links: [
      { id: "ddl1", fromId: "dd_int", toId: "dd_fw" },
      { id: "ddl2", fromId: "dd_fw", toId: "dd_sw_dmz" },
      { id: "ddl3", fromId: "dd_sw_dmz", toId: "dd_dmz" },
      { id: "ddl4", fromId: "dd_web", toId: "dd_sw_dmz" },
      { id: "ddl5", fromId: "dd_fw", toId: "dd_sw_lan" },
      { id: "ddl6", fromId: "dd_sw_lan", toId: "dd_lan" },
      { id: "ddl7", fromId: "dd_db", toId: "dd_sw_lan" },
    ],
  };
}
function taskInterVlan() {
  return {
    meta: { name: "inter-vlan", version: 1 },
    segments: [
      {
        id: "iv_a",
        name: "VLAN10 Workstations",
        subnet: "10.0.1.0/24",
        vlan: "10",
        color: "#2dd4bf",
        icon: "lan",
      },
      {
        id: "iv_b",
        name: "VLAN20 Servers",
        subnet: "10.0.2.0/24",
        vlan: "20",
        color: "#3ddc97",
        icon: "lan",
      },
    ],
    devices: [
      { id: "iv_swa", type: "l2switch", label: "SW VLAN10", x: 250, y: 210 },
      { id: "iv_swb", type: "l2switch", label: "SW VLAN20", x: 610, y: 210 },
    ],
    hosts: [
      {
        id: "iv_pc",
        type: "host",
        label: "PC",
        kind: "pc",
        services: [],
        segId: "iv_a",
        x: 250,
        y: 370,
      },
      {
        id: "iv_srv",
        type: "host",
        label: "File server",
        kind: "server",
        services: [445],
        segId: "iv_b",
        x: 610,
        y: 370,
      },
    ],
    links: [
      { id: "ivl1", fromId: "iv_swa", toId: "iv_a" },
      { id: "ivl2", fromId: "iv_pc", toId: "iv_swa" },
      { id: "ivl3", fromId: "iv_swb", toId: "iv_b" },
      { id: "ivl4", fromId: "iv_srv", toId: "iv_swb" },
    ],
  };
}
function taskVlanDesign() {
  return {
    meta: { name: "vlan-design", version: 1 },
    segments: [
      {
        id: "vd_ws",
        name: "VLAN10 Workstations",
        subnet: "10.0.10.0/24",
        vlan: "10",
        color: "#2dd4bf",
        icon: "lan",
      },
      {
        id: "vd_srvn",
        name: "VLAN20 Servers",
        subnet: "10.0.20.0/24",
        vlan: "20",
        color: "#3ddc97",
        icon: "lan",
      },
      {
        id: "vd_guestn",
        name: "VLAN30 Guest",
        subnet: "10.0.30.0/24",
        vlan: "30",
        color: "#f472b6",
        icon: "lan",
      },
      {
        id: "vd_iot",
        name: "VLAN40 IoT",
        subnet: "10.0.40.0/24",
        vlan: "40",
        color: "#a78bfa",
        icon: "lan",
      },
    ],
    devices: [
      { id: "vd_sw", type: "l2switch", label: "SW-access", x: 430, y: 330 },
    ],
    hosts: [
      {
        id: "vd_pc",
        type: "host",
        label: "PC",
        kind: "pc",
        services: [],
        segId: "vd_ws",
        x: 150,
        y: 470,
      },
      {
        id: "vd_srv",
        type: "host",
        label: "File server (SMB 445)",
        kind: "server",
        services: [445],
        segId: "vd_srvn",
        x: 380,
        y: 470,
      },
      {
        id: "vd_guest",
        type: "host",
        label: "Guest NTB",
        kind: "ntb",
        services: [],
        segId: "vd_guestn",
        x: 600,
        y: 470,
      },
      {
        id: "vd_cam",
        type: "host",
        label: "IP kamera",
        kind: "camera",
        services: [],
        segId: "vd_iot",
        x: 800,
        y: 470,
      },
    ],
    links: [
      { id: "vdl1", fromId: "vd_sw", toId: "vd_ws" },
      { id: "vdl2", fromId: "vd_sw", toId: "vd_srvn" },
      { id: "vdl3", fromId: "vd_sw", toId: "vd_guestn" },
      { id: "vdl4", fromId: "vd_sw", toId: "vd_iot" },
      { id: "vdl5", fromId: "vd_pc", toId: "vd_sw" },
      { id: "vdl6", fromId: "vd_srv", toId: "vd_sw" },
      { id: "vdl7", fromId: "vd_guest", toId: "vd_sw" },
      { id: "vdl8", fromId: "vd_cam", toId: "vd_sw" },
    ],
  };
}
function taskOspfCost() {
  return {
    meta: { name: "ospf-cost", version: 1 },
    segments: [
      {
        id: "oc_a",
        name: "LAN A",
        subnet: "10.0.1.0/24",
        color: "#2dd4bf",
        icon: "lan",
      },
      {
        id: "oc_b",
        name: "LAN B",
        subnet: "10.0.2.0/24",
        color: "#3ddc97",
        icon: "lan",
      },
    ],
    devices: [
      {
        id: "oc_rd",
        type: "router",
        label: "R-slow (cost 50)",
        acl: [],
        x: 430,
        y: 120,
      },
      {
        id: "oc_ra",
        type: "router",
        label: "R-fast 1 (cost 5)",
        acl: [],
        x: 230,
        y: 300,
      },
      {
        id: "oc_rb",
        type: "router",
        label: "R-fast 2 (cost 5)",
        acl: [],
        x: 630,
        y: 300,
      },
      { id: "oc_swa", type: "l2switch", label: "SW-A", x: 150, y: 430 },
      { id: "oc_swb", type: "l2switch", label: "SW-B", x: 710, y: 430 },
    ],
    hosts: [
      {
        id: "oc_pc",
        type: "host",
        label: "PC",
        kind: "pc",
        services: [],
        segId: "oc_a",
        x: 150,
        y: 540,
      },
      {
        id: "oc_srv",
        type: "host",
        label: "WEB (80)",
        kind: "server",
        services: [80],
        segId: "oc_b",
        x: 710,
        y: 540,
      },
    ],
    links: [
      { id: "ocl1", fromId: "oc_rd", toId: "oc_swa", cost: 50 },
      { id: "ocl2", fromId: "oc_rd", toId: "oc_swb", cost: 50 },
      { id: "ocl3", fromId: "oc_ra", toId: "oc_a", cost: 5 },
      { id: "ocl4", fromId: "oc_ra", toId: "oc_rb", cost: 5 },
      { id: "ocl5", fromId: "oc_rb", toId: "oc_b", cost: 5 },
      { id: "ocl6", fromId: "oc_swa", toId: "oc_a" },
      { id: "ocl7", fromId: "oc_pc", toId: "oc_swa" },
      { id: "ocl8", fromId: "oc_swb", toId: "oc_b" },
      { id: "ocl9", fromId: "oc_srv", toId: "oc_swb" },
    ],
  };
}
function taskStpLoop() {
  return {
    meta: { name: "stp-loop", version: 1 },
    segments: [
      {
        id: "sp_a",
        name: "VLAN10",
        subnet: "10.0.0.0/24",
        vlan: "10",
        color: "#2dd4bf",
        icon: "lan",
      },
    ],
    devices: [
      { id: "sp_s1", type: "l2switch", label: "SW1 (root)", x: 430, y: 130 },
      { id: "sp_s2", type: "l2switch", label: "SW2", x: 250, y: 310 },
      { id: "sp_s3", type: "l2switch", label: "SW3", x: 610, y: 310 },
    ],
    hosts: [
      {
        id: "sp_pc",
        type: "host",
        label: "PC1",
        kind: "pc",
        services: [],
        segId: "sp_a",
        x: 150,
        y: 450,
      },
      {
        id: "sp_srv",
        type: "host",
        label: "SERVER (80)",
        kind: "server",
        services: [80],
        segId: "sp_a",
        x: 710,
        y: 450,
      },
    ],
    links: [
      { id: "spl1", fromId: "sp_s1", toId: "sp_s2" },
      { id: "spl2", fromId: "sp_s1", toId: "sp_s3" },
      { id: "spl3", fromId: "sp_s2", toId: "sp_s3" },
      { id: "spl4", fromId: "sp_s2", toId: "sp_a" },
      { id: "spl5", fromId: "sp_pc", toId: "sp_s2" },
      { id: "spl6", fromId: "sp_srv", toId: "sp_s3" },
    ],
  };
}
function taskOspfFix() {
  return {
    meta: { name: "ospf-fix", version: 1 },
    segments: [
      {
        id: "of_a",
        name: "LAN A",
        subnet: "10.0.1.0/24",
        color: "#2dd4bf",
        icon: "lan",
      },
      {
        id: "of_b",
        name: "LAN B",
        subnet: "10.0.2.0/24",
        color: "#3ddc97",
        icon: "lan",
      },
    ],
    devices: [
      {
        id: "of_r1",
        type: "router",
        label: "R1 (gateway A)",
        acl: [],
        x: 120,
        y: 240,
      },
      {
        id: "of_r2",
        type: "router",
        label: "R2 (gateway B)",
        acl: [],
        x: 740,
        y: 240,
      },
      {
        id: "of_rx",
        type: "router",
        label: "R-mgmt (blocking)",
        acl: [
          {
            id: "d1",
            srcSeg: "*",
            dstSeg: "*",
            action: "deny",
            proto: "ip",
            portOp: "any",
            port: null,
            port2: null,
          },
        ],
        x: 430,
        y: 120,
      },
      { id: "of_ry", type: "router", label: "R-A", acl: [], x: 320, y: 360 },
      { id: "of_rz", type: "router", label: "R-B", acl: [], x: 540, y: 360 },
      { id: "of_swa", type: "l2switch", label: "SW-A", x: 120, y: 400 },
      { id: "of_swb", type: "l2switch", label: "SW-B", x: 740, y: 400 },
    ],
    hosts: [
      {
        id: "of_pc",
        type: "host",
        label: "PC",
        kind: "pc",
        services: [],
        segId: "of_a",
        x: 120,
        y: 520,
      },
      {
        id: "of_srv",
        type: "host",
        label: "SERVER (80)",
        kind: "server",
        services: [80],
        segId: "of_b",
        x: 740,
        y: 520,
      },
    ],
    links: [
      { id: "ofl1", fromId: "of_r1", toId: "of_rx" },
      { id: "ofl2", fromId: "of_rx", toId: "of_r2" },
      { id: "ofl3", fromId: "of_r1", toId: "of_ry" },
      { id: "ofl4", fromId: "of_ry", toId: "of_rz" },
      { id: "ofl5", fromId: "of_rz", toId: "of_r2" },
      { id: "ofl6", fromId: "of_r1", toId: "of_a" },
      { id: "ofl7", fromId: "of_r2", toId: "of_b" },
      { id: "ofl8", fromId: "of_swa", toId: "of_a" },
      { id: "ofl9", fromId: "of_pc", toId: "of_swa" },
      { id: "ofl10", fromId: "of_swb", toId: "of_b" },
      { id: "ofl11", fromId: "of_srv", toId: "of_swb" },
    ],
  };
}
function taskHsrp() {
  return {
    meta: { name: "hsrp", version: 1 },
    segments: [
      {
        id: "hs_lan",
        name: "Office",
        subnet: "10.0.5.0/24",
        color: "#2dd4bf",
        icon: "lan",
      },
      {
        id: "hs_int",
        name: "Internet",
        subnet: "0.0.0.0/0",
        isInternet: true,
        icon: "globe",
        color: "#94a3b8",
      },
    ],
    devices: [
      {
        id: "hs_r1",
        type: "router",
        label: "R1 (active)",
        acl: [],
        x: 360,
        y: 150,
      },
      {
        id: "hs_r2",
        type: "router",
        label: "R2 (standby)",
        acl: [],
        x: 360,
        y: 310,
      },
      { id: "hs_sw", type: "l2switch", label: "SW", x: 200, y: 230 },
    ],
    hosts: [
      {
        id: "hs_pc",
        type: "host",
        label: "PC",
        kind: "pc",
        services: [],
        segId: "hs_lan",
        x: 90,
        y: 230,
      },
    ],
    links: [
      { id: "hsl1", fromId: "hs_pc", toId: "hs_sw" },
      { id: "hsl2", fromId: "hs_sw", toId: "hs_lan" },
      { id: "hsl3", fromId: "hs_r1", toId: "hs_lan" },
      { id: "hsl4", fromId: "hs_r1", toId: "hs_int" },
      { id: "hsl5", fromId: "hs_r2", toId: "hs_lan" },
      { id: "hsl6", fromId: "hs_r2", toId: "hs_int" },
    ],
  };
}
function taskPortFwd() {
  return {
    meta: { name: "port-fwd", version: 1 },
    segments: [
      {
        id: "pf_int",
        name: "Internet",
        subnet: "0.0.0.0/0",
        isInternet: true,
        color: "#fbbf24",
        icon: "globe",
        x: 430,
        y: 30,
      },
      {
        id: "pf_lan",
        name: "LAN (internal)",
        subnet: "10.0.0.0/24",
        vlan: "10",
        color: "#3ddc97",
        icon: "lan",
      },
    ],
    devices: [
      {
        id: "pf_fw",
        type: "firewall",
        label: "FW",
        x: 430,
        y: 150,
        zoneMode: true,
        defaultAction: "deny",
        simpleRules: [],
        zones: [
          { id: "zo", name: "outside", role: "outside" },
          { id: "zi", name: "inside", role: "inside" },
        ],
        ifaceZones: { pfl1: "zo", pfl2: "zi" },
        firewallRules: [],
        portForwards: [],
      },
      { id: "pf_sw", type: "l2switch", label: "SW", x: 430, y: 300 },
    ],
    hosts: [
      {
        id: "pf_web",
        type: "host",
        label: "WEB 10.0.0.20 (443)",
        kind: "server",
        ip: "10.0.0.20",
        services: [443],
        segId: "pf_lan",
        x: 430,
        y: 440,
      },
    ],
    links: [
      { id: "pfl1", fromId: "pf_int", toId: "pf_fw" },
      { id: "pfl2", fromId: "pf_fw", toId: "pf_sw" },
      { id: "pfl3", fromId: "pf_sw", toId: "pf_lan" },
      { id: "pfl4", fromId: "pf_web", toId: "pf_sw" },
    ],
  };
}
function taskChRtPf() {
  return {
    meta: { name: "ch-rtpf", version: 1 },
    segments: [
      {
        id: "rp_int",
        name: "Internet",
        subnet: "0.0.0.0/0",
        isInternet: true,
        color: "#fbbf24",
        icon: "globe",
        x: 430,
        y: 30,
      },
      {
        id: "rp_lan",
        name: "Home LAN",
        subnet: "192.168.1.0/24",
        vlan: "1",
        color: "#3ddc97",
        icon: "lan",
      },
    ],
    devices: [
      {
        id: "rp_rt",
        type: "router",
        label: "Home router",
        acl: [],
        portForwards: [],
        x: 430,
        y: 150,
      },
      { id: "rp_sw", type: "l2switch", label: "SW", x: 430, y: 300 },
    ],
    hosts: [
      {
        id: "rp_nas",
        type: "host",
        label: "NAS 192.168.1.20 (443)",
        kind: "nas",
        ip: "192.168.1.20",
        services: [443],
        segId: "rp_lan",
        x: 560,
        y: 440,
      },
      {
        id: "rp_pc",
        type: "host",
        label: "PC",
        kind: "desktop",
        services: [],
        segId: "rp_lan",
        x: 300,
        y: 440,
      },
    ],
    links: [
      { id: "rpl1", fromId: "rp_int", toId: "rp_rt" },
      { id: "rpl2", fromId: "rp_rt", toId: "rp_sw" },
      { id: "rpl3", fromId: "rp_sw", toId: "rp_lan" },
      { id: "rpl4", fromId: "rp_nas", toId: "rp_sw" },
      { id: "rpl5", fromId: "rp_pc", toId: "rp_sw" },
    ],
  };
}
function taskChOtSeg() {
  return {
    meta: { name: "ch-otseg", version: 1 },

    segments: [
      {
        id: "os_it",
        name: "IT LAN (office)",
        subnet: "10.0.1.0/24",
        color: "#60a5fa",
        icon: "lan",
        x: 200,
        y: 40,
      },
      {
        id: "os_dmz",
        name: "Industrial DMZ",
        subnet: "10.0.2.0/24",
        color: "#f59e0b",
        icon: "db",
        x: 430,
        y: 300,
      },
      {
        id: "os_ot",
        name: "OT LAN (control)",
        subnet: "10.0.3.0/24",
        color: "#a78bfa",
        icon: "iot",
        x: 680,
        y: 40,
      },
    ],
    devices: [
      {
        id: "os_fw",
        type: "firewall",
        label: "Inter-FW (IT/OT)",
        x: 430,
        y: 150,
        zoneMode: false,
        defaultAction: "permit",
        firewallRules: [],
        simpleRules: [],
      },
      { id: "os_swit", type: "l2switch", label: "SW-IT", x: 200, y: 190 },
      { id: "os_swot", type: "l2switch", label: "SW-OT", x: 680, y: 190 },
    ],
    hosts: [
      {
        id: "os_pc",
        type: "host",
        label: "PC-office",
        kind: "pc",
        services: [],
        segId: "os_it",
        x: 90,
        y: 330,
      },
      {
        id: "os_hist",
        type: "host",
        label: "Historian (1433)",
        kind: "historian",
        services: [1433],
        segId: "os_dmz",
        x: 430,
        y: 440,
      },
      {
        id: "os_plc",
        type: "host",
        label: "PLC-1 (Modbus 502)",
        kind: "plc",
        services: [502],
        segId: "os_ot",
        x: 620,
        y: 330,
      },
      {
        id: "os_hmi",
        type: "host",
        label: "HMI-1",
        kind: "hmi",
        services: [],
        segId: "os_ot",
        x: 770,
        y: 330,
      },
    ],
    links: [
      { id: "osl1", fromId: "os_fw", toId: "os_swit" },
      { id: "osl1b", fromId: "os_swit", toId: "os_it" },
      { id: "osl2", fromId: "os_fw", toId: "os_dmz" },
      { id: "osl3", fromId: "os_fw", toId: "os_swot" },
      { id: "osl3b", fromId: "os_swot", toId: "os_ot" },
      { id: "osl4", fromId: "os_pc", toId: "os_swit" },
      { id: "osl5", fromId: "os_hist", toId: "os_fw" },
      { id: "osl6", fromId: "os_plc", toId: "os_swot" },
      { id: "osl7", fromId: "os_hmi", toId: "os_swot" },
    ],
  };
}
function taskStaticNat() {
  return {
    meta: { name: "static-nat", version: 1 },
    segments: [
      {
        id: "sn_int",
        name: "Internet",
        subnet: "0.0.0.0/0",
        isInternet: true,
        color: "#fbbf24",
        icon: "globe",
        x: 430,
        y: 30,
      },
      {
        id: "sn_dmz",
        name: "DMZ",
        subnet: "10.0.0.0/24",
        color: "#fbbf24",
        icon: "lan",
      },
    ],
    devices: [
      {
        id: "sn_fw",
        type: "firewall",
        label: "FW",
        x: 430,
        y: 150,
        zoneMode: true,
        defaultAction: "deny",
        simpleRules: [],
        zones: [
          { id: "zo", name: "outside", role: "outside" },
          { id: "zd", name: "dmz", role: "dmz" },
        ],
        ifaceZones: { snl1: "zo", snl2: "zd" },
        firewallRules: [],
        portForwards: [],
        staticNat: [],
      },
      { id: "sn_sw", type: "l2switch", label: "SW", x: 430, y: 300 },
    ],
    hosts: [
      {
        id: "sn_web",
        type: "host",
        label: "Server (HTTPS 443 + SSH 22)",
        kind: "server",
        services: [443, 22],
        segId: "sn_dmz",
        x: 430,
        y: 440,
      },
    ],
    links: [
      { id: "snl1", fromId: "sn_int", toId: "sn_fw" },
      { id: "snl2", fromId: "sn_fw", toId: "sn_sw" },
      { id: "snl3", fromId: "sn_sw", toId: "sn_dmz" },
      { id: "snl4", fromId: "sn_web", toId: "sn_sw" },
    ],
  };
}
function taskChPortVlan() {
  return {
    meta: { name: "ch-portvlan", version: 1 },
    segments: [
      {
        id: "cp_v10",
        name: "VLAN10 Employees",
        subnet: "10.0.10.0/24",
        vlan: "10",
        color: "#2dd4bf",
        icon: "lan",
      },
      {
        id: "cp_v20",
        name: "VLAN20 Servers",
        subnet: "10.0.20.0/24",
        vlan: "20",
        color: "#3ddc97",
        icon: "lan",
      },
    ],
    devices: [
      {
        id: "cp_sw",
        type: "l2mgmt",
        label: "Managed switch",
        acl: [],
        x: 430,
        y: 200,
      },
    ],
    hosts: [
      {
        id: "cp_pc",
        type: "host",
        label: "PC employee",
        kind: "pc",
        services: [],
        segId: "cp_v10",
        x: 250,
        y: 380,
      },
      {
        id: "cp_srv",
        type: "host",
        label: "File server (445)",
        kind: "server",
        services: [445],
        segId: "cp_v10",
        x: 610,
        y: 380,
      },
    ],
    links: [
      { id: "cpl1", fromId: "cp_sw", toId: "cp_v10" },
      { id: "cpl2", fromId: "cp_sw", toId: "cp_v20" },
      {
        id: "cpl3",
        fromId: "cp_pc",
        toId: "cp_sw",
        port: { mode: "access", vlan: "cp_v20" },
      },
      { id: "cpl4", fromId: "cp_srv", toId: "cp_sw" },
    ],
  };
}
function taskChDown() {
  return {
    meta: { name: "ch-down", version: 1 },
    segments: [
      {
        id: "cd_v10",
        name: "VLAN10 Accounting",
        subnet: "10.0.1.0/24",
        vlan: "10",
        color: "#2dd4bf",
        icon: "lan",
      },
      {
        id: "cd_v20",
        name: "VLAN20 Servers",
        subnet: "10.0.2.0/24",
        vlan: "20",
        color: "#3ddc97",
        icon: "lan",
      },
    ],
    devices: [
      {
        id: "cd_core",
        type: "l3switch",
        label: "Core L3",
        acl: [],
        down: true,
        x: 430,
        y: 170,
      },
      { id: "cd_sw", type: "l2switch", label: "SW-access", x: 430, y: 300 },
    ],
    hosts: [
      {
        id: "cd_pc",
        type: "host",
        label: "PC accountant",
        kind: "pc",
        services: [],
        segId: "cd_v10",
        x: 250,
        y: 440,
      },
      {
        id: "cd_srv",
        type: "host",
        label: "Server (445)",
        kind: "server",
        services: [445],
        segId: "cd_v20",
        x: 610,
        y: 440,
      },
    ],
    links: [
      { id: "cdl1", fromId: "cd_core", toId: "cd_sw" },
      { id: "cdl2", fromId: "cd_sw", toId: "cd_v10" },
      { id: "cdl3", fromId: "cd_sw", toId: "cd_v20" },
      { id: "cdl4", fromId: "cd_pc", toId: "cd_sw" },
      { id: "cdl5", fromId: "cd_srv", toId: "cd_sw" },
    ],
  };
}
function taskStpRedundant() {
  return {
    meta: { name: "stp-redundant", version: 1 },
    segments: [
      {
        id: "sr_v10",
        name: "VLAN10",
        subnet: "10.0.10.0/24",
        vlan: "10",
        color: "#2dd4bf",
        icon: "lan",
      },
    ],
    devices: [
      {
        id: "sr_d1",
        type: "l2switch",
        label: "DIST-1 (root)",
        stpPriority: 4096,
        x: 380,
        y: 130,
      },
      { id: "sr_d2", type: "l2switch", label: "DIST-2", x: 660, y: 130 },
      { id: "sr_aa", type: "l2switch", label: "ACC-A", x: 250, y: 310 },
      { id: "sr_ab", type: "l2switch", label: "ACC-B", x: 760, y: 310 },
    ],
    hosts: [
      {
        id: "sr_pc",
        type: "host",
        label: "PC",
        kind: "pc",
        services: [],
        segId: "sr_v10",
        x: 150,
        y: 450,
      },
      {
        id: "sr_srv",
        type: "host",
        label: "SERVER (80)",
        kind: "server",
        services: [80],
        segId: "sr_v10",
        x: 860,
        y: 450,
      },
    ],
    links: [
      { id: "srl1", fromId: "sr_d1", toId: "sr_d2" },
      { id: "srl2", fromId: "sr_d1", toId: "sr_aa" },
      { id: "srl3", fromId: "sr_d2", toId: "sr_aa" },
      { id: "srl4", fromId: "sr_d1", toId: "sr_ab" },
      { id: "srl5", fromId: "sr_d2", toId: "sr_ab" },
      { id: "srl6", fromId: "sr_d1", toId: "sr_v10" },
      { id: "srl7", fromId: "sr_pc", toId: "sr_aa" },
      { id: "srl8", fromId: "sr_srv", toId: "sr_ab" },
    ],
  };
}

function taskChWeb() {
  return {
    meta: { name: "ch-web", version: 1 },
    segments: [
      {
        id: "cw_int",
        name: "Internet",
        subnet: "0.0.0.0/0",
        isInternet: true,
        color: "#fbbf24",
        icon: "globe",
        x: 430,
        y: 30,
      },
      {
        id: "cw_dmz",
        name: "DMZ – Web",
        subnet: "203.0.113.0/24",
        color: "#fb923c",
        icon: "lan",
      },
    ],
    devices: [
      {
        id: "cw_fw",
        type: "firewall",
        label: "FW",
        x: 430,
        y: 150,
        zoneMode: true,
        defaultAction: "deny",
        simpleRules: [],
        zones: [
          { id: "zo", name: "outside", role: "outside" },
          { id: "zd", name: "DMZ", role: "dmz" },
        ],
        ifaceZones: { cwl1: "zo", cwl2: "zd" },
        firewallRules: [],
      },
      { id: "cw_sw", type: "l2switch", label: "SW-DMZ", x: 640, y: 330 },
    ],
    hosts: [
      {
        id: "cw_web",
        type: "host",
        label: "WEB (443)",
        kind: "server",
        services: [443],
        segId: "cw_dmz",
        x: 640,
        y: 450,
      },
    ],
    links: [
      { id: "cwl1", fromId: "cw_int", toId: "cw_fw" },
      { id: "cwl2", fromId: "cw_fw", toId: "cw_sw" },
      { id: "cwl3", fromId: "cw_sw", toId: "cw_dmz" },
      { id: "cwl4", fromId: "cw_web", toId: "cw_sw" },
    ],
  };
}
function taskChVlan() {
  return {
    meta: { name: "ch-vlan", version: 1 },
    segments: [
      {
        id: "cv_a",
        name: "VLAN10 Accounting",
        subnet: "10.0.1.0/24",
        vlan: "10",
        color: "#2dd4bf",
        icon: "lan",
      },
      {
        id: "cv_b",
        name: "VLAN20 Servers",
        subnet: "10.0.2.0/24",
        vlan: "20",
        color: "#3ddc97",
        icon: "lan",
      },
    ],
    devices: [
      { id: "cv_swa", type: "l2switch", label: "SW Accounting", x: 250, y: 210 },
      { id: "cv_swb", type: "l2switch", label: "SW Servery", x: 610, y: 210 },
    ],
    hosts: [
      {
        id: "cv_pc",
        type: "host",
        label: "PC accountant",
        kind: "pc",
        services: [],
        segId: "cv_a",
        x: 250,
        y: 370,
      },
      {
        id: "cv_srv",
        type: "host",
        label: "File server (445)",
        kind: "server",
        services: [445],
        segId: "cv_b",
        x: 610,
        y: 370,
      },
    ],
    links: [
      { id: "cvl1", fromId: "cv_swa", toId: "cv_a" },
      { id: "cvl2", fromId: "cv_pc", toId: "cv_swa" },
      { id: "cvl3", fromId: "cv_swb", toId: "cv_b" },
      { id: "cvl4", fromId: "cv_srv", toId: "cv_swb" },
    ],
  };
}
function taskChGuest() {
  return {
    meta: { name: "ch-guest", version: 1 },
    segments: [
      {
        id: "cg_ws",
        name: "VLAN10 Employees",
        subnet: "10.0.1.0/24",
        vlan: "10",
        color: "#2dd4bf",
        icon: "lan",
      },
      {
        id: "cg_srvn",
        name: "VLAN20 Servers",
        subnet: "10.0.2.0/24",
        vlan: "20",
        color: "#3ddc97",
        icon: "lan",
      },
      {
        id: "cg_guest",
        name: "VLAN30 Guests",
        subnet: "10.0.3.0/24",
        vlan: "30",
        color: "#f472b6",
        icon: "lan",
      },
    ],
    devices: [
      {
        id: "cg_core",
        type: "l3switch",
        label: "Core L3",
        acl: [],
        x: 430,
        y: 170,
      },
      { id: "cg_sw", type: "l2switch", label: "SW-access", x: 430, y: 300 },
    ],
    hosts: [
      {
        id: "cg_pc",
        type: "host",
        label: "PC employee",
        kind: "pc",
        services: [],
        segId: "cg_ws",
        x: 200,
        y: 440,
      },
      {
        id: "cg_srv",
        type: "host",
        label: "DB server (1433)",
        kind: "server",
        services: [1433],
        segId: "cg_srvn",
        x: 430,
        y: 440,
      },
      {
        id: "cg_g",
        type: "host",
        label: "Guest NTB",
        kind: "ntb",
        services: [],
        segId: "cg_guest",
        x: 660,
        y: 440,
      },
    ],
    links: [
      { id: "cgl1", fromId: "cg_core", toId: "cg_sw" },
      { id: "cgl2", fromId: "cg_sw", toId: "cg_ws" },
      { id: "cgl3", fromId: "cg_sw", toId: "cg_srvn" },
      { id: "cgl4", fromId: "cg_sw", toId: "cg_guest" },
      { id: "cgl5", fromId: "cg_pc", toId: "cg_sw" },
      { id: "cgl6", fromId: "cg_srv", toId: "cg_sw" },
      { id: "cgl7", fromId: "cg_g", toId: "cg_sw" },
    ],
  };
}
function taskChMulti() {
  return {
    meta: { name: "ch-multi", version: 1 },
    segments: [
      {
        id: "cm_v10",
        name: "VLAN10 Employees",
        subnet: "10.0.1.0/24",
        vlan: "10",
        color: "#2dd4bf",
        icon: "lan",
      },
      {
        id: "cm_v20",
        name: "VLAN20 Servers",
        subnet: "10.0.2.0/24",
        vlan: "20",
        color: "#3ddc97",
        icon: "lan",
      },
    ],
    devices: [
      {
        id: "cm_core",
        type: "l3switch",
        label: "Core L3",
        acl: [],
        down: true,
        x: 430,
        y: 170,
      },
      {
        id: "cm_sw",
        type: "l2mgmt",
        label: "SW-access",
        acl: [],
        x: 430,
        y: 300,
      },
    ],
    hosts: [
      {
        id: "cm_pc1",
        type: "host",
        label: "PC1",
        kind: "pc",
        services: [],
        segId: "cm_v10",
        x: 180,
        y: 440,
      },
      {
        id: "cm_pc2",
        type: "host",
        label: "PC2",
        kind: "pc",
        services: [],
        segId: "cm_v10",
        x: 430,
        y: 440,
      },
      {
        id: "cm_srv",
        type: "host",
        label: "Server (445)",
        kind: "server",
        services: [445],
        segId: "cm_v20",
        x: 680,
        y: 440,
      },
    ],
    links: [
      { id: "cml1", fromId: "cm_core", toId: "cm_sw" },
      { id: "cml2", fromId: "cm_sw", toId: "cm_v10" },
      { id: "cml3", fromId: "cm_sw", toId: "cm_v20" },
      {
        id: "cml4",
        fromId: "cm_pc1",
        toId: "cm_sw",
        port: { mode: "access", vlan: "cm_v20" },
      },
      { id: "cml5", fromId: "cm_pc2", toId: "cm_sw" },
      { id: "cml6", fromId: "cm_srv", toId: "cm_sw" },
    ],
  };
}
function taskChIds() {
  return {
    meta: { name: "ch-ids", version: 1 },
    segments: [
      {
        id: "ci_int",
        name: "Internet",
        subnet: "0.0.0.0/0",
        isInternet: true,
        color: "#fbbf24",
        icon: "globe",
        x: 430,
        y: 30,
      },
      {
        id: "ci_dmz",
        name: "DMZ – Web",
        subnet: "203.0.113.0/24",
        color: "#fb923c",
        icon: "lan",
      },
    ],
    devices: [
      {
        id: "ci_ids",
        type: "idsips",
        tlsInspect: true,
        label: "Sonda (IDS)",
        mode: "ids",
        signatures: [{ id: "s1", label: "Malware", content: "malware" }],
        x: 430,
        y: 130,
      },
      {
        id: "ci_fw",
        type: "firewall",
        label: "FW",
        x: 430,
        y: 240,
        zoneMode: true,
        defaultAction: "deny",
        simpleRules: [],
        zones: [
          { id: "zo", name: "outside", role: "outside" },
          { id: "zd", name: "DMZ", role: "dmz" },
        ],
        ifaceZones: { cil2: "zo", cil3: "zd" },
        firewallRules: [
          {
            id: "r1",
            srcZone: "zo",
            dstZone: "zd",
            srcSeg: "*",
            dstSeg: "*",
            action: "permit",
            proto: "tcp",
            portOp: "eq",
            port: 443,
            port2: null,
          },
        ],
      },
      { id: "ci_sw", type: "l2switch", label: "SW-DMZ", x: 640, y: 360 },
    ],
    hosts: [
      {
        id: "ci_web",
        type: "host",
        label: "WEB (443)",
        kind: "server",
        services: [443],
        segId: "ci_dmz",
        x: 640,
        y: 470,
      },
    ],
    links: [
      { id: "cil1", fromId: "ci_int", toId: "ci_ids" },
      { id: "cil2", fromId: "ci_ids", toId: "ci_fw" },
      { id: "cil3", fromId: "ci_fw", toId: "ci_sw" },
      { id: "cil4", fromId: "ci_sw", toId: "ci_dmz" },
      { id: "cil5", fromId: "ci_web", toId: "ci_sw" },
    ],
  };
}
function taskChTrunk() {
  return {
    meta: { name: "ch-trunk", version: 1 },
    segments: [
      {
        id: "ct_v10",
        name: "VLAN10",
        subnet: "10.0.10.0/24",
        vlan: "10",
        color: "#2dd4bf",
        icon: "lan",
      },
      {
        id: "ct_v20",
        name: "VLAN20",
        subnet: "10.0.20.0/24",
        vlan: "20",
        color: "#a78bfa",
        icon: "lan",
      },
    ],
    devices: [
      { id: "ct_swa", type: "l2mgmt", label: "SW-A", acl: [], x: 300, y: 220 },
      { id: "ct_swb", type: "l2mgmt", label: "SW-B", acl: [], x: 620, y: 220 },
    ],
    hosts: [
      {
        id: "ct_pc",
        type: "host",
        label: "PC (VLAN10)",
        kind: "pc",
        services: [],
        segId: "ct_v10",
        x: 200,
        y: 400,
      },
      {
        id: "ct_srv",
        type: "host",
        label: "Server VLAN10 (445)",
        kind: "server",
        services: [445],
        segId: "ct_v10",
        x: 720,
        y: 400,
      },
    ],
    links: [
      {
        id: "ctl1",
        fromId: "ct_swa",
        toId: "ct_swb",
        port: { mode: "access", vlan: "ct_v20" },
      },
      { id: "ctl2", fromId: "ct_pc", toId: "ct_swa" },
      { id: "ctl3", fromId: "ct_srv", toId: "ct_swb" },
    ],
  };
}
function taskChGw() {
  return {
    meta: { name: "ch-gw", version: 1 },
    segments: [
      {
        id: "gw_v10",
        name: "VLAN10 Users",
        subnet: "10.0.10.0/24",
        vlan: "10",
        color: "#2dd4bf",
        icon: "lan",
      },
      {
        id: "gw_v20",
        name: "VLAN20 Servers",
        subnet: "10.0.20.0/24",
        vlan: "20",
        color: "#3ddc97",
        icon: "lan",
      },
    ],
    devices: [
      {
        id: "gw_core",
        type: "l3switch",
        label: "Core L3",
        acl: [],
        x: 430,
        y: 200,
      },
      { id: "gw_sw", type: "l2switch", label: "SW-access", x: 430, y: 320 },
    ],
    hosts: [
      {
        id: "gw_pc",
        type: "host",
        label: "PC",
        kind: "pc",
        services: [],
        segId: "gw_v10",
        gw: "10.0.10.254",
        x: 250,
        y: 440,
      },
      {
        id: "gw_srv",
        type: "host",
        label: "Server (445)",
        kind: "server",
        services: [445],
        segId: "gw_v20",
        x: 610,
        y: 440,
      },
    ],
    links: [
      { id: "gwl1", fromId: "gw_core", toId: "gw_sw" },
      { id: "gwl2", fromId: "gw_sw", toId: "gw_v10" },
      { id: "gwl3", fromId: "gw_sw", toId: "gw_v20" },
      { id: "gwl4", fromId: "gw_pc", toId: "gw_sw" },
      { id: "gwl5", fromId: "gw_srv", toId: "gw_sw" },
    ],
  };
}
function taskChDhcp() {
  return {
    meta: { name: "ch-dhcp", version: 1 },
    segments: [
      {
        id: "dh_lan",
        name: "Office",
        subnet: "10.0.5.0/24",
        vlan: "5",
        color: "#38bdf8",
        icon: "lan",
        dhcp: false,
      },
    ],
    devices: [
      { id: "dh_sw", type: "l2switch", label: "Switch", x: 430, y: 240 },
    ],
    hosts: [
      {
        id: "dh_pc",
        type: "host",
        label: "PC",
        kind: "pc",
        services: [],
        segId: "dh_lan",
        x: 280,
        y: 400,
      },
      {
        id: "dh_srv",
        type: "host",
        label: "File server (445)",
        kind: "server",
        services: [445],
        segId: "dh_lan",
        ip: "10.0.5.20",
        x: 600,
        y: 400,
      },
    ],
    links: [
      { id: "dhl1", fromId: "dh_pc", toId: "dh_sw" },
      { id: "dhl2", fromId: "dh_srv", toId: "dh_sw" },
      { id: "dhl3", fromId: "dh_sw", toId: "dh_lan" },
    ],
  };
}
function taskChPortSec() {
  return {
    meta: { name: "ch-portsec", version: 1 },
    segments: [
      {
        id: "ps_lan",
        name: "Office",
        subnet: "10.0.7.0/24",
        vlan: "7",
        color: "#a78bfa",
        icon: "lan",
      },
    ],
    devices: [
      { id: "ps_sw", type: "l2mgmt", label: "Managed switch", x: 430, y: 240 },
    ],
    hosts: [
      {
        id: "ps_pc",
        type: "host",
        label: "New PC",
        kind: "pc",
        services: [],
        segId: "ps_lan",
        x: 280,
        y: 400,
      },
      {
        id: "ps_srv",
        type: "host",
        label: "Server (445)",
        kind: "server",
        services: [445],
        segId: "ps_lan",
        ip: "10.0.7.20",
        x: 600,
        y: 400,
      },
    ],
    links: [
      {
        id: "psl1",
        fromId: "ps_pc",
        toId: "ps_sw",
        port: {
          mode: "access",
          vlan: "ps_lan",
          sec: { max: 1, mac: "02:11:22:33:44:55" },
        },
      },
      { id: "psl2", fromId: "ps_srv", toId: "ps_sw" },
      { id: "psl3", fromId: "ps_sw", toId: "ps_lan" },
    ],
  };
}
function taskChBadIp() {
  return {
    meta: { name: "ch-badip", version: 1 },
    segments: [
      {
        id: "bi_lan",
        name: "Office",
        subnet: "10.0.8.0/24",
        vlan: "8",
        color: "#34d399",
        icon: "lan",
      },
    ],
    devices: [
      { id: "bi_sw", type: "l2switch", label: "Switch", x: 430, y: 240 },
    ],
    hosts: [
      {
        id: "bi_pc",
        type: "host",
        label: "PC",
        kind: "pc",
        services: [],
        segId: "bi_lan",
        ip: "10.0.80.10",
        x: 280,
        y: 400,
      },
      {
        id: "bi_srv",
        type: "host",
        label: "Server (445)",
        kind: "server",
        services: [445],
        segId: "bi_lan",
        ip: "10.0.8.20",
        x: 600,
        y: 400,
      },
    ],
    links: [
      { id: "bil1", fromId: "bi_pc", toId: "bi_sw" },
      { id: "bil2", fromId: "bi_srv", toId: "bi_sw" },
      { id: "bil3", fromId: "bi_sw", toId: "bi_lan" },
    ],
  };
}
function taskChDhcpPool() {
  return {
    meta: { name: "ch-dhcppool", version: 1 },
    segments: [
      {
        id: "dp_lan",
        name: "Office",
        subnet: "10.0.9.0/24",
        vlan: "9",
        color: "#60a5fa",
        icon: "lan",
        dhcpStart: "10.0.9.10",
        dhcpEnd: "10.0.9.11",
      },
    ],
    devices: [
      { id: "dp_sw", type: "l2switch", label: "Switch", x: 430, y: 200 },
    ],
    hosts: [
      {
        id: "dp_a",
        type: "host",
        label: "PC-1",
        kind: "pc",
        services: [],
        segId: "dp_lan",
        x: 200,
        y: 380,
      },
      {
        id: "dp_b",
        type: "host",
        label: "PC-2",
        kind: "pc",
        services: [],
        segId: "dp_lan",
        x: 340,
        y: 380,
      },
      {
        id: "dp_c",
        type: "host",
        label: "PC-3 (new)",
        kind: "pc",
        services: [],
        segId: "dp_lan",
        x: 480,
        y: 380,
      },
      {
        id: "dp_srv",
        type: "host",
        label: "Server (445)",
        kind: "server",
        services: [445],
        segId: "dp_lan",
        ip: "10.0.9.20",
        x: 640,
        y: 380,
      },
    ],
    links: [
      { id: "dpl1", fromId: "dp_a", toId: "dp_sw" },
      { id: "dpl2", fromId: "dp_b", toId: "dp_sw" },
      { id: "dpl3", fromId: "dp_c", toId: "dp_sw" },
      { id: "dpl4", fromId: "dp_srv", toId: "dp_sw" },
      { id: "dpl5", fromId: "dp_sw", toId: "dp_lan" },
    ],
  };
}
function taskChRoute() {
  return {
    meta: { name: "ch-route", version: 1 },
    segments: [
      {
        id: "rt_a",
        name: "Network A",
        subnet: "10.0.1.0/24",
        vlan: "",
        color: "#2dd4bf",
        icon: "lan",
      },
      {
        id: "rt_b",
        name: "Network B",
        subnet: "10.0.2.0/24",
        vlan: "",
        color: "#34d399",
        icon: "lan",
      },
    ],
    devices: [
      {
        id: "rt_r1",
        type: "router",
        label: "R1",
        acl: [],
        manualRouting: true,
        routes: [],
        x: 330,
        y: 240,
      },
      {
        id: "rt_r2",
        type: "router",
        label: "R2",
        acl: [],
        manualRouting: true,
        routes: [{ id: "rtb1", dest: "10.0.1.0/24", via: "rt_r1" }],
        x: 560,
        y: 240,
      },
      { id: "rt_swa", type: "l2switch", label: "SW-A", x: 200, y: 360 },
      { id: "rt_swb", type: "l2switch", label: "SW-B", x: 690, y: 360 },
    ],
    hosts: [
      {
        id: "rt_pc",
        type: "host",
        label: "PC",
        kind: "pc",
        services: [],
        segId: "rt_a",
        x: 200,
        y: 470,
      },
      {
        id: "rt_srv",
        type: "host",
        label: "Server (445)",
        kind: "server",
        services: [445],
        segId: "rt_b",
        x: 690,
        y: 470,
      },
    ],
    links: [
      { id: "rtl1", fromId: "rt_pc", toId: "rt_swa" },
      { id: "rtl2", fromId: "rt_swa", toId: "rt_a" },
      { id: "rtl3", fromId: "rt_r1", toId: "rt_a" },
      { id: "rtl4", fromId: "rt_r1", toId: "rt_r2" },
      { id: "rtl6", fromId: "rt_r2", toId: "rt_b" },
      { id: "rtl7", fromId: "rt_swb", toId: "rt_b" },
      { id: "rtl8", fromId: "rt_srv", toId: "rt_swb" },
    ],
  };
}
function taskDefRoute() {
  return {
    meta: { name: "def-route", version: 1 },
    segments: [
      {
        id: "dr_int",
        name: "Internet",
        subnet: "0.0.0.0/0",
        isInternet: true,
        color: "#fbbf24",
        icon: "globe",
        x: 430,
        y: 30,
      },
      {
        id: "dr_lan",
        name: "Company LAN",
        subnet: "192.168.1.0/24",
        vlan: "",
        color: "#2dd4bf",
        icon: "lan",
      },
    ],
    devices: [
      {
        id: "dr_isp",
        type: "router",
        label: "ISP router",
        acl: [],
        x: 430,
        y: 120,
      },
      {
        id: "dr_r",
        type: "router",
        label: "R (manual routing)",
        acl: [],
        manualRouting: true,
        routingProto: "static",
        routes: [],
        x: 430,
        y: 240,
      },
      { id: "dr_sw", type: "l2switch", label: "SW", x: 430, y: 360 },
    ],
    hosts: [
      {
        id: "dr_pc",
        type: "host",
        label: "PC",
        kind: "pc",
        services: [],
        segId: "dr_lan",
        x: 280,
        y: 470,
      },
      {
        id: "dr_srv",
        type: "host",
        label: "Internal server (443)",
        kind: "server",
        services: [443],
        segId: "dr_lan",
        x: 580,
        y: 470,
      },
    ],
    links: [
      { id: "drl1", fromId: "dr_int", toId: "dr_isp" },
      { id: "drl2", fromId: "dr_isp", toId: "dr_r" },
      { id: "drl3", fromId: "dr_r", toId: "dr_lan" },
      { id: "drl4", fromId: "dr_sw", toId: "dr_lan" },
      { id: "drl5", fromId: "dr_pc", toId: "dr_sw" },
      { id: "drl6", fromId: "dr_srv", toId: "dr_sw" },
    ],
  };
}
function taskSubnetPlan() {
  return {
    meta: { name: "subnet-plan", version: 1 },
    segments: [
      {
        id: "sp_off",
        name: "Offices (50 devices)",
        subnet: "192.168.10.0/24",
        color: "#2dd4bf",
        icon: "lan",
      },
      {
        id: "sp_wh",
        name: "Warehouse (20 devices)",
        subnet: "192.168.10.0/24",
        color: "#f59e0b",
        icon: "lan",
      },
      {
        id: "sp_srv",
        name: "Servers (10 devices)",
        subnet: "192.168.10.0/24",
        color: "#3ddc97",
        icon: "lan",
      },
    ],
    devices: [
      {
        id: "sp_r",
        type: "l3switch",
        label: "Core L3",
        acl: [],
        x: 430,
        y: 150,
      },
      { id: "sp_sw", type: "l2switch", label: "SW", x: 430, y: 280 },
    ],
    hosts: [
      {
        id: "sp_pc",
        type: "host",
        label: "PC office",
        kind: "pc",
        services: [],
        segId: "sp_off",
        x: 200,
        y: 420,
      },
      {
        id: "sp_scan",
        type: "host",
        label: "Warehouse terminal",
        kind: "pc",
        services: [],
        segId: "sp_wh",
        x: 430,
        y: 420,
      },
      {
        id: "sp_srvh",
        type: "host",
        label: "File server (SMB 445)",
        kind: "server",
        services: [445],
        segId: "sp_srv",
        x: 660,
        y: 420,
      },
    ],
    links: [
      { id: "spl1", fromId: "sp_r", toId: "sp_off" },
      { id: "spl2", fromId: "sp_r", toId: "sp_wh" },
      { id: "spl3", fromId: "sp_r", toId: "sp_srv" },
      { id: "spl4", fromId: "sp_r", toId: "sp_sw" },
      { id: "spl5", fromId: "sp_pc", toId: "sp_sw" },
      { id: "spl6", fromId: "sp_scan", toId: "sp_sw" },
      { id: "spl7", fromId: "sp_srvh", toId: "sp_sw" },
    ],
  };
}

function spPlanOk() {
  const need = { sp_off: 50, sp_wh: 20, sp_srv: 10 };
  const parent = parseCidr("192.168.10.0/24");
  if (!parent) return false;
  const cs = [];
  for (const id in need) {
    const seg = getNode(id);
    if (!seg) return false;
    const c = parseCidr(seg.subnet);
    if (!c) return false;
    if (c.start < parent.start || c.end > parent.end) return false;
    if (ipToInt(String(seg.subnet).split("/")[0]) !== c.start) return false;
    const usable = c.bits >= 31 ? 0 : Math.pow(2, 32 - c.bits) - 2;
    if (usable < need[id]) return false;
    if (usable >= need[id] * 4) return false;
    cs.push(c);
  }
  for (let i = 0; i < cs.length; i++)
    for (let j = i + 1; j < cs.length; j++)
      if (cs[i].start <= cs[j].end && cs[j].start <= cs[i].end) return false;
  return true;
}
function taskStaticRoute() {
  return {
    meta: { name: "static-route", version: 1 },
    segments: [
      {
        id: "sta_a",
        name: "LAN A",
        subnet: "192.168.1.0/24",
        vlan: "",
        color: "#2dd4bf",
        icon: "lan",
      },
      {
        id: "sta_b",
        name: "LAN B",
        subnet: "192.168.2.0/24",
        vlan: "",
        color: "#34d399",
        icon: "lan",
      },
    ],
    devices: [
      {
        id: "sta_r1",
        type: "router",
        label: "R1 (static routing)",
        acl: [],
        manualRouting: true,
        routingProto: "static",
        routes: [],
        x: 330,
        y: 240,
      },
      { id: "sta_r2", type: "router", label: "R2", acl: [], x: 560, y: 240 },
      { id: "sta_swa", type: "l2switch", label: "SW-A", x: 200, y: 360 },
      { id: "sta_swb", type: "l2switch", label: "SW-B", x: 690, y: 360 },
    ],
    hosts: [
      {
        id: "sta_pc",
        type: "host",
        label: "PC",
        kind: "pc",
        services: [],
        segId: "sta_a",
        x: 200,
        y: 470,
      },
      {
        id: "sta_srv",
        type: "host",
        label: "Server (443)",
        kind: "server",
        services: [443],
        segId: "sta_b",
        x: 690,
        y: 470,
      },
    ],
    links: [
      { id: "stal1", fromId: "sta_pc", toId: "sta_swa" },
      { id: "stal2", fromId: "sta_swa", toId: "sta_a" },
      { id: "stal3", fromId: "sta_r1", toId: "sta_a" },
      { id: "stal4", fromId: "sta_r1", toId: "sta_r2" },
      { id: "stal5", fromId: "sta_r2", toId: "sta_b" },
      { id: "stal6", fromId: "sta_swb", toId: "sta_b" },
      { id: "stal7", fromId: "sta_srv", toId: "sta_swb" },
    ],
  };
}
function taskChVlanHop() {
  return {
    meta: { name: "ch-vlanhop", version: 1 },
    segments: [
      {
        id: "vh_v10",
        name: "VLAN10 Users",
        subnet: "10.0.10.0/24",
        vlan: "10",
        color: "#2dd4bf",
        icon: "lan",
      },
      {
        id: "vh_v20",
        name: "VLAN20 Servers",
        subnet: "10.0.20.0/24",
        vlan: "20",
        color: "#f472b6",
        icon: "lan",
      },
    ],
    devices: [
      {
        id: "vh_sw",
        type: "l2mgmt",
        label: "Managed switch",
        acl: [],
        x: 430,
        y: 200,
      },
    ],
    hosts: [
      {
        id: "vh_atk",
        type: "host",
        label: "PC user (VLAN10)",
        kind: "pc",
        services: [],
        segId: "vh_v10",
        ip: "10.0.10.11",
        x: 220,
        y: 400,
      },
      {
        id: "vh_f10",
        type: "host",
        label: "File server VLAN10 (445)",
        kind: "server",
        services: [445],
        segId: "vh_v10",
        ip: "10.0.10.20",
        x: 430,
        y: 400,
      },
      {
        id: "vh_srv",
        type: "host",
        label: "Server VLAN20 (445)",
        kind: "server",
        services: [445],
        segId: "vh_v20",
        ip: "10.0.20.20",
        x: 640,
        y: 400,
      },
    ],
    links: [
      { id: "vhl1", fromId: "vh_sw", toId: "vh_v10" },
      { id: "vhl2", fromId: "vh_sw", toId: "vh_v20" },
      {
        id: "vhl3",
        fromId: "vh_atk",
        toId: "vh_sw",
        port: { mode: "dynamic" },
      },
      { id: "vhl4", fromId: "vh_f10", toId: "vh_sw" },
      { id: "vhl5", fromId: "vh_srv", toId: "vh_sw" },
    ],
  };
}
function taskChRogueDhcp() {
  return {
    meta: { name: "ch-roguedhcp", version: 1 },
    segments: [
      {
        id: "rd_office",
        name: "Office",
        subnet: "10.0.5.0/24",
        vlan: "5",
        color: "#38bdf8",
        icon: "lan",
      },
      {
        id: "rd_srvn",
        name: "Server room",
        subnet: "10.0.9.0/24",
        vlan: "9",
        color: "#3ddc97",
        icon: "lan",
      },
    ],
    devices: [
      {
        id: "rd_r",
        type: "router",
        label: "Router (gateway .1)",
        acl: [],
        x: 640,
        y: 150,
      },
      {
        id: "rd_sw",
        type: "l2mgmt",
        label: "Managed switch",
        acl: [],
        x: 300,
        y: 230,
      },
    ],
    hosts: [
      {
        id: "rd_pc",
        type: "host",
        label: "PC client (DHCP)",
        kind: "pc",
        services: [],
        segId: "rd_office",
        x: 150,
        y: 420,
      },
      {
        id: "rd_atk",
        type: "host",
        label: "PC attacker (rogue DHCP + ARP)",
        kind: "pc",
        services: [],
        segId: "rd_office",
        ip: "10.0.5.66",
        dhcpd: { gw: "10.0.5.66", rogue: true },
        arpSpoof: true,
        x: 320,
        y: 420,
      },
      {
        id: "rd_dhcp",
        type: "host",
        label: "DHCP server (legit)",
        kind: "server",
        services: [67],
        segId: "rd_office",
        ip: "10.0.5.2",
        dhcpd: { gw: "10.0.5.1" },
        x: 490,
        y: 420,
      },
      {
        id: "rd_srv",
        type: "host",
        label: "Server (445)",
        kind: "server",
        services: [445],
        segId: "rd_srvn",
        ip: "10.0.9.20",
        x: 760,
        y: 420,
      },
    ],
    links: [
      { id: "rdl1", fromId: "rd_sw", toId: "rd_office" },
      { id: "rdl2", fromId: "rd_r", toId: "rd_sw" },
      { id: "rdl3", fromId: "rd_r", toId: "rd_srvn" },
      { id: "rdl4", fromId: "rd_pc", toId: "rd_sw" },
      { id: "rdl5", fromId: "rd_atk", toId: "rd_sw" },
      { id: "rdl_dh", fromId: "rd_dhcp", toId: "rd_sw" },
      { id: "rdl6", fromId: "rd_srv", toId: "rd_r" },
    ],
  };
}
function taskShadowRule() {
  return {
    meta: { name: "shadow-rule", version: 1 },
    segments: [
      {
        id: "sh_ws",
        name: "VLAN10 Workstations",
        subnet: "10.0.1.0/24",
        vlan: "10",
        color: "#2dd4bf",
        icon: "lan",
      },
      {
        id: "sh_srv",
        name: "VLAN20 Servers",
        subnet: "10.0.2.0/24",
        vlan: "20",
        color: "#3ddc97",
        icon: "lan",
      },
      {
        id: "sh_guest",
        name: "VLAN30 Guest",
        subnet: "10.0.3.0/24",
        vlan: "30",
        color: "#f472b6",
        icon: "lan",
      },
    ],
    devices: [
      {
        id: "sh_core",
        type: "l3switch",
        label: "Core L3",
        acl: [
          {
            id: "a1",
            srcSeg: "*",
            dstSeg: "*",
            action: "permit",
            proto: "ip",
            portOp: "any",
            port: null,
            port2: null,
          },
          {
            id: "a2",
            srcSeg: "sh_guest",
            dstSeg: "sh_srv",
            action: "deny",
            proto: "ip",
            portOp: "any",
            port: null,
            port2: null,
          },
        ],
        x: 430,
        y: 150,
      },
      { id: "sh_sw", type: "l2switch", label: "SW-access", x: 430, y: 260 },
    ],
    hosts: [
      {
        id: "sh_pc",
        type: "host",
        label: "PC",
        kind: "pc",
        services: [],
        segId: "sh_ws",
        x: 200,
        y: 390,
      },
      {
        id: "sh_srvh",
        type: "host",
        label: "Server (SMB 445)",
        kind: "server",
        services: [445],
        segId: "sh_srv",
        x: 430,
        y: 390,
      },
      {
        id: "sh_g",
        type: "host",
        label: "Guest NTB",
        kind: "ntb",
        services: [],
        segId: "sh_guest",
        x: 660,
        y: 390,
      },
    ],
    links: [
      { id: "shl1", fromId: "sh_core", toId: "sh_sw" },
      { id: "shl2", fromId: "sh_sw", toId: "sh_ws" },
      { id: "shl3", fromId: "sh_sw", toId: "sh_srv" },
      { id: "shl4", fromId: "sh_sw", toId: "sh_guest" },
      { id: "shl5", fromId: "sh_pc", toId: "sh_sw" },
      { id: "shl6", fromId: "sh_srvh", toId: "sh_sw" },
      { id: "shl7", fromId: "sh_g", toId: "sh_sw" },
    ],
  };
}
function taskRemoteVpn() {
  return {
    meta: { name: "remote-vpn", version: 1 },
    segments: [
      {
        id: "vp_int",
        name: "Internet",
        subnet: "0.0.0.0/0",
        isInternet: true,
        color: "#fbbf24",
        icon: "globe",
        x: 430,
        y: 30,
      },
      {
        id: "vp_pool",
        name: "VPN pool",
        subnet: "10.8.0.0/24",
        color: "#a78bfa",
        icon: "lan",
      },
      {
        id: "vp_lan",
        name: "LAN (servers)",
        subnet: "10.0.0.0/24",
        vlan: "10",
        color: "#3ddc97",
        icon: "lan",
      },
    ],
    devices: [
      {
        id: "vp_fw",
        type: "firewall",
        label: "FW (VPN gateway)",
        x: 430,
        y: 150,
        zoneMode: true,
        defaultAction: "deny",
        simpleRules: [],
        zones: [
          { id: "zo", name: "outside", role: "outside" },
          { id: "zi", name: "inside", role: "inside" },
          { id: "zv", name: "VPN-pool", role: "outside" },
        ],
        ifaceZones: { vpl1: "zo", vpl2: "zv", vpl5: "zi" },
        firewallRules: [],
      },
      { id: "vp_sw_pool", type: "l2switch", label: "SW-VPN", x: 640, y: 300 },
      { id: "vp_sw_lan", type: "l2switch", label: "SW-LAN", x: 230, y: 300 },
    ],
    hosts: [
      {
        id: "vp_client",
        type: "host",
        label: "VPN client (RDP)",
        kind: "ntb",
        services: [],
        segId: "vp_pool",
        x: 640,
        y: 420,
      },
      {
        id: "vp_srv",
        type: "host",
        label: "Internal server",
        kind: "server",
        services: [3389, 445],
        segId: "vp_lan",
        x: 230,
        y: 420,
      },
    ],
    links: [
      { id: "vpl1", fromId: "vp_int", toId: "vp_fw" },
      { id: "vpl2", fromId: "vp_fw", toId: "vp_sw_pool" },
      { id: "vpl3", fromId: "vp_sw_pool", toId: "vp_pool" },
      { id: "vpl4", fromId: "vp_client", toId: "vp_sw_pool" },
      { id: "vpl5", fromId: "vp_fw", toId: "vp_sw_lan" },
      { id: "vpl6", fromId: "vp_sw_lan", toId: "vp_lan" },
      { id: "vpl7", fromId: "vp_srv", toId: "vp_sw_lan" },
    ],
  };
}

function taskFirstSteps() {
  return {
    meta: { name: "first-steps", version: 3 },

    segments: [
      {
        id: "fs_int",
        name: "Internet",
        subnet: "0.0.0.0/0",
        isInternet: true,
        color: "#fbbf24",
        icon: "globe",
        x: 320,
        y: 60,
      },
      {
        id: "fs_lan",
        name: "Home network",
        subnet: "192.168.1.0/24",
        color: "#3ddc97",
        icon: "lan",
        x: 320,
        y: 330,
      },
    ],
    devices: [{ id: "fs_rt", type: "router", label: "Router", x: 320, y: 190 }],
    hosts: [
      {
        id: "fs_pc",
        type: "host",
        label: "PC",
        kind: "pc",
        services: [],
        segId: null,
        x: 320,
        y: 430,
      },
    ],
    links: [
      { id: "fsl1", fromId: "fs_int", toId: "fs_rt" },
      { id: "fsl2", fromId: "fs_rt", toId: "fs_lan" },
    ],
  };
}
function taskRouterIntro() {
  return {
    meta: { name: "router-intro", version: 1 },
    segments: [
      {
        id: "ri_a",
        name: "Network A",
        subnet: "192.168.1.0/24",
        color: "#2dd4bf",
        icon: "lan",
      },
      {
        id: "ri_b",
        name: "Network B",
        subnet: "192.168.2.0/24",
        color: "#3ddc97",
        icon: "lan",
      },
    ],
    devices: [
      { id: "ri_swa", type: "l2switch", label: "SW-A", x: 250, y: 210 },
      { id: "ri_swb", type: "l2switch", label: "SW-B", x: 610, y: 210 },
    ],
    hosts: [
      {
        id: "ri_pca",
        type: "host",
        label: "PC-A",
        kind: "pc",
        services: [445],
        segId: "ri_a",
        x: 250,
        y: 370,
      },
      {
        id: "ri_pcb",
        type: "host",
        label: "PC-B",
        kind: "pc",
        services: [445],
        segId: "ri_b",
        x: 610,
        y: 370,
      },
    ],
    links: [
      { id: "ril1", fromId: "ri_swa", toId: "ri_a" },
      { id: "ril2", fromId: "ri_pca", toId: "ri_swa" },
      { id: "ril3", fromId: "ri_swb", toId: "ri_b" },
      { id: "ril4", fromId: "ri_pcb", toId: "ri_swb" },
    ],
  };
}
function taskTwoNets() {
  return {
    meta: { name: "two-nets", version: 1 },
    segments: [
      {
        id: "tn_int",
        name: "Internet",
        subnet: "0.0.0.0/0",
        isInternet: true,
        color: "#fbbf24",
        icon: "globe",
        x: 430,
        y: 40,
      },
      {
        id: "tn_a",
        name: "Offices",
        subnet: "192.168.1.0/24",
        color: "#2dd4bf",
        icon: "lan",
      },
      {
        id: "tn_b",
        name: "Servers",
        subnet: "10.0.5.0/24",
        color: "#3ddc97",
        icon: "lan",
      },
    ],
    devices: [
      { id: "tn_rt", type: "router", label: "Router", x: 430, y: 160 },
      { id: "tn_swa", type: "l2switch", label: "SW-A", x: 250, y: 290 },
      { id: "tn_swb", type: "l2switch", label: "SW-B", x: 610, y: 290 },
    ],
    hosts: [
      {
        id: "tn_pc",
        type: "host",
        label: "PC",
        kind: "pc",
        services: [],
        segId: "tn_a",
        x: 250,
        y: 420,
      },
      {
        id: "tn_srv",
        type: "host",
        label: "Server",
        kind: "server",
        services: [80, 443],
        segId: "tn_b",
        x: 610,
        y: 420,
      },
    ],
    links: [
      { id: "tnl0", fromId: "tn_int", toId: "tn_rt" },
      { id: "tnl1", fromId: "tn_rt", toId: "tn_swa" },
      { id: "tnl2", fromId: "tn_rt", toId: "tn_swb" },
      { id: "tnl3", fromId: "tn_swa", toId: "tn_a" },
      { id: "tnl4", fromId: "tn_pc", toId: "tn_swa" },
      { id: "tnl5", fromId: "tn_swb", toId: "tn_b" },
      { id: "tnl6", fromId: "tn_srv", toId: "tn_swb" },
    ],
  };
}
function taskPortTest() {
  return {
    meta: { name: "port-test", version: 1 },
    segments: [
      {
        id: "pt_cli",
        name: "Klient",
        subnet: "192.168.1.0/24",
        color: "#2dd4bf",
        icon: "lan",
      },
      {
        id: "pt_srv",
        name: "Server",
        subnet: "10.0.0.0/24",
        color: "#3ddc97",
        icon: "lan",
      },
    ],
    devices: [
      {
        id: "pt_fw",
        type: "firewall",
        label: "FW (jen 443)",
        x: 430,
        y: 150,
        zoneMode: false,
        defaultAction: "deny",
        simpleRules: [
          {
            id: "r1",
            srcSeg: "pt_cli",
            dstSeg: "pt_srv",
            action: "permit",
            proto: "tcp",
            portOp: "eq",
            port: 443,
            port2: null,
          },
        ],
        zones: [],
        ifaceZones: {},
        firewallRules: [],
      },
      { id: "pt_swc", type: "l2switch", label: "SW-C", x: 230, y: 290 },
      { id: "pt_sws", type: "l2switch", label: "SW-S", x: 640, y: 290 },
    ],
    hosts: [
      {
        id: "pt_pc",
        type: "host",
        label: "PC",
        kind: "pc",
        services: [],
        segId: "pt_cli",
        x: 230,
        y: 410,
      },
      {
        id: "pt_web",
        type: "host",
        label: "Web",
        kind: "server",
        services: [443, 80],
        segId: "pt_srv",
        x: 640,
        y: 410,
      },
    ],
    links: [
      { id: "ptl1", fromId: "pt_fw", toId: "pt_swc" },
      { id: "ptl2", fromId: "pt_swc", toId: "pt_cli" },
      { id: "ptl3", fromId: "pt_pc", toId: "pt_swc" },
      { id: "ptl4", fromId: "pt_fw", toId: "pt_sws" },
      { id: "ptl5", fromId: "pt_sws", toId: "pt_srv" },
      { id: "ptl6", fromId: "pt_web", toId: "pt_sws" },
    ],
  };
}

function taskDnsDown() {
  return {
    meta: { name: "dns-down", version: 1 },
    segments: [
      {
        id: "dn_cli",
        name: "Klient",
        subnet: "192.168.1.0/24",
        color: "#2dd4bf",
        icon: "lan",
        dnsId: "dn_dns",
      },
      {
        id: "dn_srv",
        name: "Server room",
        subnet: "10.0.0.0/24",
        color: "#3ddc97",
        icon: "server",
      },
    ],
    devices: [
      {
        id: "dn_fw",
        type: "firewall",
        label: "FW (jen 443)",
        x: 430,
        y: 150,
        zoneMode: false,
        defaultAction: "deny",
        simpleRules: [
          {
            id: "r1",
            srcSeg: "dn_cli",
            dstSeg: "dn_srv",
            action: "permit",
            proto: "tcp",
            portOp: "eq",
            port: 443,
            port2: null,
          },
        ],
        zones: [],
        ifaceZones: {},
        firewallRules: [],
      },
      { id: "dn_swc", type: "l2switch", label: "SW-C", x: 230, y: 290 },
      { id: "dn_sws", type: "l2switch", label: "SW-S", x: 640, y: 290 },
    ],
    hosts: [
      {
        id: "dn_pc",
        type: "host",
        label: "PC",
        kind: "pc",
        services: [],
        segId: "dn_cli",
        x: 230,
        y: 410,
      },
      {
        id: "dn_web",
        type: "host",
        label: "Web",
        kind: "server",
        services: [443],
        segId: "dn_srv",
        x: 560,
        y: 410,
        fqdn: "web.acme.local",
      },
      {
        id: "dn_dns",
        type: "host",
        label: "DNS-1",
        kind: "server",
        services: [53],
        segId: "dn_srv",
        x: 720,
        y: 410,
        dnsForward: false,
        dnsRecords: [{ id: "dnr1", name: "web.acme.local", hostId: "dn_web" }],
      },
    ],
    links: [
      { id: "dnl1", fromId: "dn_fw", toId: "dn_swc" },
      { id: "dnl2", fromId: "dn_swc", toId: "dn_cli" },
      { id: "dnl3", fromId: "dn_pc", toId: "dn_swc" },
      { id: "dnl4", fromId: "dn_fw", toId: "dn_sws" },
      { id: "dnl5", fromId: "dn_sws", toId: "dn_srv" },
      { id: "dnl6", fromId: "dn_web", toId: "dn_sws" },
      { id: "dnl7", fromId: "dn_dns", toId: "dn_sws" },
    ],
  };
}

function taskDnsRogue() {
  return {
    meta: { name: "dns-rogue", version: 1 },
    segments: [
      {
        id: "dr_cli",
        name: "Office",
        subnet: "192.168.1.0/24",
        color: "#2dd4bf",
        icon: "lan",
        dnsId: "dr_rogue",
      },
      {
        id: "dr_srv",
        name: "Server room",
        subnet: "10.0.0.0/24",
        color: "#3ddc97",
        icon: "server",
        dnsId: "dr_dns",
      },
    ],
    devices: [
      {
        id: "dr_fw",
        type: "firewall",
        label: "FW",
        x: 430,
        y: 150,
        zoneMode: false,
        defaultAction: "permit",
        simpleRules: [],
        zones: [],
        ifaceZones: {},
        firewallRules: [],
      },
      { id: "dr_swc", type: "l2switch", label: "SW-C", x: 230, y: 290 },
      { id: "dr_sws", type: "l2switch", label: "SW-S", x: 640, y: 290 },
    ],
    hosts: [
      {
        id: "dr_pc",
        type: "host",
        label: "PC",
        kind: "pc",
        services: [],
        segId: "dr_cli",
        x: 130,
        y: 410,
      },
      {
        id: "dr_rogue",
        type: "host",
        label: "DNS-ATTACKER",
        kind: "server",
        services: [53],
        segId: "dr_cli",
        x: 280,
        y: 410,
        dnsForward: false,
        dnsRecords: [{ id: "drr1", name: "web.acme.local", hostId: "dr_evil" }],
      },
      {
        id: "dr_evil",
        type: "host",
        label: "Fake web",
        kind: "server",
        services: [443],
        segId: "dr_cli",
        x: 400,
        y: 410,
      },
      {
        id: "dr_web",
        type: "host",
        label: "Web",
        kind: "server",
        services: [443],
        segId: "dr_srv",
        x: 560,
        y: 410,
        fqdn: "web.acme.local",
      },
      {
        id: "dr_dns",
        type: "host",
        label: "DNS-1",
        kind: "server",
        services: [53],
        segId: "dr_srv",
        x: 720,
        y: 410,
        dnsForward: false,
        dnsRecords: [{ id: "drr2", name: "web.acme.local", hostId: "dr_web" }],
      },
    ],
    links: [
      { id: "drl1", fromId: "dr_fw", toId: "dr_swc" },
      { id: "drl2", fromId: "dr_swc", toId: "dr_cli" },
      { id: "drl3", fromId: "dr_pc", toId: "dr_swc" },
      { id: "drl4", fromId: "dr_rogue", toId: "dr_swc" },
      { id: "drl5", fromId: "dr_evil", toId: "dr_swc" },
      { id: "drl6", fromId: "dr_fw", toId: "dr_sws" },
      { id: "drl7", fromId: "dr_sws", toId: "dr_srv" },
      { id: "drl8", fromId: "dr_web", toId: "dr_sws" },
      { id: "drl9", fromId: "dr_dns", toId: "dr_sws" },
    ],
  };
}

function taskDnsBackup() {
  return {
    meta: { name: "dns-backup", version: 1 },
    segments: [
      {
        id: "pd_lan",
        name: "Company LAN",
        subnet: "10.0.0.0/24",
        color: "#2dd4bf",
        icon: "lan",
        dnsId: "pd_dns",
      },
    ],
    devices: [{ id: "pd_sw", type: "l2switch", label: "SW-1", x: 430, y: 200 }],
    hosts: [
      {
        id: "pd_pc",
        type: "host",
        label: "PC",
        kind: "pc",
        services: [],
        segId: "pd_lan",
        x: 200,
        y: 380,
      },
      {
        id: "pd_web",
        type: "host",
        label: "Web",
        kind: "server",
        services: [443],
        segId: "pd_lan",
        x: 340,
        y: 380,
        fqdn: "web.acme.local",
      },
      {
        id: "pd_dns",
        type: "host",
        label: "DNS-1 (off)",
        kind: "server",
        services: [53],
        segId: "pd_lan",
        x: 520,
        y: 380,
        down: true,
        dnsForward: false,
        dnsRecords: [{ id: "pdr1", name: "web.acme.local", hostId: "pd_web" }],
      },
      {
        id: "pd_dns2",
        type: "host",
        label: "DNS-2",
        kind: "server",
        services: [53],
        segId: "pd_lan",
        x: 660,
        y: 380,
        dnsForward: false,
        dnsRecords: [{ id: "pdr2", name: "web.acme.local", hostId: "pd_web" }],
      },
    ],
    links: [
      { id: "pdl1", fromId: "pd_pc", toId: "pd_sw" },
      { id: "pdl2", fromId: "pd_web", toId: "pd_sw" },
      { id: "pdl3", fromId: "pd_dns", toId: "pd_sw" },
      { id: "pdl4", fromId: "pd_dns2", toId: "pd_sw" },
    ],
  };
}

function taskDhcpStarv() {
  return {
    meta: { name: "dhcp-starvation", version: 1 },
    segments: [
      {
        id: "dv_lan",
        name: "Office",
        subnet: "10.0.7.0/24",
        vlan: "7",
        color: "#38bdf8",
        icon: "lan",
      },
    ],
    devices: [
      {
        id: "dv_sw",
        type: "l2mgmt",
        label: "Managed switch",
        acl: [],
        aclDefault: "permit",
        x: 430,
        y: 220,
      },
    ],
    hosts: [
      {
        id: "dv_pc",
        type: "host",
        label: "New PC",
        kind: "pc",
        services: [],
        segId: "dv_lan",
        x: 250,
        y: 400,
      },
      {
        id: "dv_srv",
        type: "host",
        label: "Server (445)",
        kind: "server",
        services: [445],
        segId: "dv_lan",
        ip: "10.0.7.5",
        x: 430,
        y: 400,
      },
      {
        id: "dv_atk",
        type: "host",
        label: "PC attacker (DHCP starvation)",
        kind: "pc",
        services: [],
        segId: "dv_lan",
        ip: "10.0.7.66",
        mac: "02:aa:bb:cc:dd:ee",
        dhcpStarve: true,
        x: 620,
        y: 400,
      },
    ],
    links: [
      { id: "dvl1", fromId: "dv_pc", toId: "dv_sw" },
      { id: "dvl2", fromId: "dv_srv", toId: "dv_sw" },
      {
        id: "dvl3",
        fromId: "dv_atk",
        toId: "dv_sw",
        port: { mode: "access", vlan: "dv_lan" },
      },
      { id: "dvl4", fromId: "dv_sw", toId: "dv_lan" },
    ],
  };
}
function taskSubnetLab() {
  return {
    meta: { name: "subnet-lab", version: 1 },
    segments: [
      {
        id: "sl_a",
        name: "Subnet A /26",
        subnet: "192.168.1.0/26",
        color: "#2dd4bf",
        icon: "lan",
      },
      {
        id: "sl_b",
        name: "Subnet B /26",
        subnet: "192.168.1.64/26",
        color: "#3ddc97",
        icon: "lan",
      },
    ],
    devices: [
      { id: "sl_l3", type: "l3switch", label: "L3", acl: [], x: 430, y: 120 },
      { id: "sl_swa", type: "l2switch", label: "SW-A", x: 250, y: 230 },
      { id: "sl_swb", type: "l2switch", label: "SW-B", x: 610, y: 230 },
    ],
    hosts: [
      {
        id: "sl_pca",
        type: "host",
        label: "PC-A",
        kind: "pc",
        services: [],
        segId: "sl_a",
        x: 200,
        y: 380,
      },
      {
        id: "sl_srva",
        type: "host",
        label: "Server A",
        kind: "server",
        services: [443],
        segId: "sl_a",
        x: 310,
        y: 380,
      },
      {
        id: "sl_pcb",
        type: "host",
        label: "PC-B",
        kind: "pc",
        services: [],
        segId: "sl_b",
        x: 550,
        y: 380,
      },
      {
        id: "sl_srvb",
        type: "host",
        label: "Server B",
        kind: "server",
        services: [443],
        segId: "sl_b",
        x: 660,
        y: 380,
      },
    ],
    links: [
      { id: "sll1", fromId: "sl_l3", toId: "sl_swa" },
      { id: "sll2", fromId: "sl_l3", toId: "sl_swb" },
      { id: "sll3", fromId: "sl_swa", toId: "sl_a" },
      { id: "sll4", fromId: "sl_pca", toId: "sl_swa" },
      { id: "sll5", fromId: "sl_srva", toId: "sl_swa" },
      { id: "sll6", fromId: "sl_swb", toId: "sl_b" },
      { id: "sll7", fromId: "sl_pcb", toId: "sl_swb" },
      { id: "sll8", fromId: "sl_srvb", toId: "sl_swb" },
    ],
  };
}
function taskNatLab() {
  return {
    meta: { name: "nat-lab", version: 1 },
    segments: [
      {
        id: "nl_int",
        name: "Internet",
        subnet: "0.0.0.0/0",
        isInternet: true,
        color: "#fbbf24",
        icon: "globe",
        x: 320,
        y: 40,
      },
      {
        id: "nl_lan",
        name: "Private network",
        subnet: "192.168.1.0/24",
        color: "#3ddc97",
        icon: "lan",
      },
    ],
    devices: [
      { id: "nl_rt", type: "router", label: "Router (NAT)", x: 320, y: 170 },
      { id: "nl_sw", type: "l2switch", label: "Switch", x: 320, y: 290 },
    ],
    hosts: [
      {
        id: "nl_pc",
        type: "host",
        label: "PC (192.168.1.10)",
        kind: "pc",
        services: [],
        segId: "nl_lan",
        x: 320,
        y: 410,
      },
    ],
    links: [
      { id: "nll1", fromId: "nl_int", toId: "nl_rt" },
      { id: "nll2", fromId: "nl_rt", toId: "nl_sw" },
      { id: "nll3", fromId: "nl_sw", toId: "nl_lan" },
      { id: "nll4", fromId: "nl_pc", toId: "nl_sw" },
    ],
  };
}
function taskWifiConnect() {
  return {
    meta: { name: "wifi-connect", version: 1 },

    segments: [
      {
        id: "wc_int",
        name: "Internet",
        subnet: "0.0.0.0/0",
        isInternet: true,
        color: "#fbbf24",
        icon: "globe",
        x: 320,
        y: 60,
      },
      {
        id: "wc_lan",
        name: "Home network",
        subnet: "192.168.1.0/24",
        color: "#3ddc97",
        icon: "lan",
        x: 320,
        y: 330,
      },
    ],
    devices: [
      {
        id: "wc_ap",
        type: "router",
        label: "Router/AP",
        ssids: [{ name: "HomeNet", segId: "wc_lan", pass: "1234" }],
        x: 320,
        y: 190,
      },
    ],
    hosts: [
      {
        id: "wc_pc",
        type: "host",
        label: "PC",
        kind: "pc",
        services: [],
        segId: null,
        x: 320,
        y: 430,
      },
    ],
    links: [
      { id: "wcl1", fromId: "wc_int", toId: "wc_ap" },
      { id: "wcl2", fromId: "wc_ap", toId: "wc_lan" },
    ],
  };
}
function taskWifiMesh() {
  return {
    meta: { name: "wifi-mesh", version: 1 },

    segments: [
      {
        id: "wm_int",
        name: "Internet",
        subnet: "0.0.0.0/0",
        isInternet: true,
        color: "#fbbf24",
        icon: "globe",
        x: 200,
        y: 50,
      },
      {
        id: "wm_lan",
        name: "Home network",
        subnet: "192.168.1.0/24",
        color: "#3ddc97",
        icon: "lan",
        x: 200,
        y: 330,
      },
    ],
    devices: [
      {
        id: "wm_rt",
        type: "router",
        label: "Router/AP (ground floor)",
        wifiOn: true,
        ssids: [{ name: "HomeNet", segId: "wm_lan", on: true, pass: "1234" }],
        x: 200,
        y: 180,
      },
      {
        id: "wm_ap2",
        type: "ap",
        label: "AP-mesh (floor)",
        wifiOn: true,
        uplink: "mesh",
        ssids: [{ name: "HomeNet", segId: "wm_lan", on: true, pass: "1234" }],
        x: 620,
        y: 180,
      },
      {
        id: "wm_rep",
        type: "ap",
        label: "Repeater (garden)",
        wifiOn: true,
        uplink: "repeater",
        repSsid: "HomeNet",
        ssids: [],
        x: 980,
        y: 180,
      },
    ],
    hosts: [
      {
        id: "wm_mob",
        type: "host",
        label: "Mobile",
        kind: "mobile",
        services: [],
        segId: "wm_lan",
        wifi: { apId: "wm_rt", ssid: "HomeNet" },
        x: 330,
        y: 330,
      },
    ],
    links: [
      { id: "wml1", fromId: "wm_int", toId: "wm_rt" },
      { id: "wml2", fromId: "wm_rt", toId: "wm_lan" },
      { id: "wml3", fromId: "wm_mob", toId: "wm_rt" },
    ],
  };
}
function taskHubVsSwitch() {
  return {
    meta: { name: "hub-vs-switch", version: 1 },
    segments: [
      {
        id: "hvs_n1",
        name: "Network 1 (hub)",
        subnet: "192.168.1.0/24",
        color: "#2dd4bf",
        icon: "lan",
        x: 250,
        y: 110,
      },
      {
        id: "hvs_n2",
        name: "Network 2 (switch)",
        subnet: "192.168.2.0/24",
        color: "#3ddc97",
        icon: "lan",
        x: 780,
        y: 110,
      },
    ],
    devices: [
      { id: "hvs_hub", type: "hub", label: "Hub", x: 250, y: 230 },
      { id: "hvs_sw", type: "l2switch", label: "Switch", x: 780, y: 230 },
    ],
    hosts: [
      {
        id: "hvs_pca",
        type: "host",
        label: "PC-A",
        kind: "pc",
        services: [],
        segId: "hvs_n1",
        x: 120,
        y: 370,
      },
      {
        id: "hvs_pcb",
        type: "host",
        label: "PC-B",
        kind: "pc",
        services: [80],
        segId: "hvs_n1",
        x: 250,
        y: 380,
      },
      {
        id: "hvs_pcc",
        type: "host",
        label: "PC-C",
        kind: "pc",
        services: [80],
        segId: "hvs_n1",
        x: 380,
        y: 370,
      },
      {
        id: "hvs_pcd",
        type: "host",
        label: "PC-D",
        kind: "pc",
        services: [],
        segId: "hvs_n2",
        x: 650,
        y: 370,
      },
      {
        id: "hvs_pce",
        type: "host",
        label: "PC-E",
        kind: "pc",
        services: [80],
        segId: "hvs_n2",
        x: 780,
        y: 380,
      },
      {
        id: "hvs_pcf",
        type: "host",
        label: "PC-F",
        kind: "pc",
        services: [80],
        segId: "hvs_n2",
        x: 910,
        y: 370,
      },
    ],
    links: [
      { id: "hvsl1", fromId: "hvs_hub", toId: "hvs_n1" },
      { id: "hvsl2", fromId: "hvs_pca", toId: "hvs_hub" },
      { id: "hvsl3", fromId: "hvs_pcb", toId: "hvs_hub" },
      { id: "hvsl4", fromId: "hvs_pcc", toId: "hvs_hub" },
      { id: "hvsl5", fromId: "hvs_sw", toId: "hvs_n2" },
      { id: "hvsl6", fromId: "hvs_pcd", toId: "hvs_sw" },
      { id: "hvsl7", fromId: "hvs_pce", toId: "hvs_sw" },
      { id: "hvsl8", fromId: "hvs_pcf", toId: "hvs_sw" },
    ],
  };
}
function taskWifiK2() {
  return {
    meta: { name: "wifi-k2", version: 1 },
    segments: [
      {
        id: "wk2_int",
        name: "Internet",
        subnet: "0.0.0.0/0",
        isInternet: true,
        color: "#fbbf24",
        icon: "globe",
        x: 430,
        y: 60,
      },
      {
        id: "wk2_lan",
        name: "Company network",
        subnet: "192.168.1.0/24",
        color: "#3ddc97",
        icon: "lan",
        x: 430,
        y: 430,
      },
    ],
    devices: [
      { id: "wk2_rt", type: "router", label: "Router", x: 430, y: 160 },
      { id: "wk2_sw", type: "l2switch", label: "Switch", x: 430, y: 280 },
      {
        id: "wk2_ap",
        type: "ap",
        label: "AP (Office)",
        ssids: [{ name: "Office", segId: "wk2_lan", pass: "pass" }],
        x: 620,
        y: 360,
      },
    ],
    hosts: [
      {
        id: "wk2_pc",
        type: "host",
        label: "PC",
        kind: "pc",
        services: [],
        segId: null,
        x: 620,
        y: 470,
      },
    ],
    links: [
      { id: "wk2l1", fromId: "wk2_int", toId: "wk2_rt" },
      { id: "wk2l2", fromId: "wk2_rt", toId: "wk2_lan" },
      { id: "wk2l3", fromId: "wk2_lan", toId: "wk2_sw" },
      { id: "wk2l4", fromId: "wk2_sw", toId: "wk2_ap" },
    ],
  };
}
function taskBpduGuard() {
  return {
    meta: { name: "bpdu-guard", version: 1 },
    segments: [
      {
        id: "bg_lan",
        name: "Company LAN",
        subnet: "10.0.0.0/24",
        color: "#2dd4bf",
        icon: "lan",
        x: 430,
        y: 70,
      },
    ],
    devices: [
      {
        id: "bg_core",
        type: "l2switch",
        label: "Core (root bridge)",
        stpPriority: 4096,
        x: 430,
        y: 200,
      },
      {
        id: "bg_acc",
        type: "l2mgmt",
        label: "SW-access (managed)",
        stpPriority: 32768,
        x: 430,
        y: 330,
      },
      {
        id: "bg_rogue",
        type: "l2switch",
        label: "Rogue switch under the desk",
        stpPriority: 0,
        x: 700,
        y: 430,
      },
    ],
    hosts: [
      {
        id: "bg_pc",
        type: "host",
        label: "PC",
        kind: "pc",
        services: [],
        segId: "bg_lan",
        x: 180,
        y: 450,
      },
      {
        id: "bg_srv",
        type: "host",
        label: "Server (SMB 445)",
        kind: "server",
        services: [445],
        segId: "bg_lan",
        x: 430,
        y: 470,
      },
    ],
    links: [
      { id: "bgl1", fromId: "bg_core", toId: "bg_lan" },
      { id: "bgl2", fromId: "bg_acc", toId: "bg_core" },
      { id: "bgl3", fromId: "bg_pc", toId: "bg_acc" },
      { id: "bgl4", fromId: "bg_srv", toId: "bg_core" },
      {
        id: "bgl5",
        fromId: "bg_acc",
        toId: "bg_rogue",
        port: { mode: "access", vlan: "bg_lan" },
      },
      { id: "bgl6", fromId: "bg_acc", toId: "bg_core" },
    ],
  };
}
function taskSpofFix() {
  return {
    meta: { name: "spof-fix", version: 1 },

    segments: [
      {
        id: "sp_lan",
        name: "Company LAN",
        subnet: "10.0.0.0/24",
        color: "#3ddc97",
        icon: "lan",
        x: 430,
        y: 60,
      },
    ],
    devices: [
      {
        id: "sp_core",
        type: "l2switch",
        label: "Core (down)",
        down: true,
        x: 430,
        y: 200,
      },
      { id: "sp_acc", type: "l2switch", label: "SW-access", x: 230, y: 330 },
      { id: "sp_srvsw", type: "l2switch", label: "SW-servers", x: 630, y: 330 },
      { id: "sp_bkp", type: "l2switch", label: "SW-spare", x: 430, y: 400 },
    ],
    hosts: [
      {
        id: "sp_pc",
        type: "host",
        label: "PC",
        kind: "pc",
        services: [],
        segId: "sp_lan",
        x: 150,
        y: 480,
      },
      {
        id: "sp_web",
        type: "host",
        label: "WEB",
        kind: "server",
        services: [443],
        segId: "sp_lan",
        x: 720,
        y: 480,
      },
    ],
    links: [
      { id: "spl1", fromId: "sp_lan", toId: "sp_core" },
      { id: "spl2", fromId: "sp_acc", toId: "sp_core" },
      { id: "spl3", fromId: "sp_srvsw", toId: "sp_core" },
      { id: "spl4", fromId: "sp_pc", toId: "sp_acc" },
      { id: "spl5", fromId: "sp_web", toId: "sp_srvsw" },
    ],
  };
}
function taskHaFailover() {
  const rules = [
    {
      id: "r1",
      srcSeg: "hf_lan",
      dstSeg: "hf_int",
      action: "permit",
      proto: "ip",
      portOp: "any",
      port: null,
      port2: null,
    },
  ];
  return {
    meta: { name: "ha-failover", version: 1 },

    segments: [
      {
        id: "hf_int",
        name: "Internet",
        subnet: "0.0.0.0/0",
        isInternet: true,
        color: "#fbbf24",
        icon: "globe",
        x: 430,
        y: 40,
      },
      {
        id: "hf_lan",
        name: "Company LAN",
        subnet: "10.0.0.0/24",
        color: "#3ddc97",
        icon: "lan",
        x: 430,
        y: 470,
      },
    ],
    devices: [
      {
        id: "hf_fwa",
        type: "firewall",
        label: "FW-A (active)",
        x: 300,
        y: 200,
        zoneMode: false,
        defaultAction: "deny",
        firewallRules: [],
        simpleRules: JSON.parse(JSON.stringify(rules)),
        haPeer: "hf_fwb",
        haMode: "ap",
        haStandby: false,
      },
      {
        id: "hf_fwb",
        type: "firewall",
        label: "FW-B (backup)",
        x: 560,
        y: 200,
        zoneMode: false,
        defaultAction: "deny",
        firewallRules: [],
        simpleRules: JSON.parse(JSON.stringify(rules)),
        haPeer: "hf_fwa",
        haMode: "ap",
        haStandby: true,
      },
      { id: "hf_sw", type: "l2switch", label: "Switch", x: 430, y: 340 },
    ],
    hosts: [
      {
        id: "hf_pc",
        type: "host",
        label: "PC-office",
        kind: "pc",
        services: [],
        segId: "hf_lan",
        x: 430,
        y: 520,
      },
    ],
    links: [
      { id: "hfl1", fromId: "hf_int", toId: "hf_fwa" },
      { id: "hfl2", fromId: "hf_int", toId: "hf_fwb" },
      { id: "hfl3", fromId: "hf_fwa", toId: "hf_sw" },
      { id: "hfl4", fromId: "hf_fwb", toId: "hf_sw" },
      { id: "hfl5", fromId: "hf_sw", toId: "hf_lan" },
      { id: "hfl6", fromId: "hf_pc", toId: "hf_sw" },
    ],
  };
}
function taskLoadBalancer() {
  return {
    meta: { name: "lb-web", version: 1 },

    segments: [
      {
        id: "lb_int",
        name: "Internet",
        subnet: "0.0.0.0/0",
        isInternet: true,
        color: "#fbbf24",
        icon: "globe",
        x: 430,
        y: 40,
      },
      {
        id: "lb_dmz",
        name: "DMZ – web",
        subnet: "203.0.113.0/24",
        color: "#fb923c",
        icon: "lan",
        x: 430,
        y: 470,
      },
    ],
    devices: [
      {
        id: "lb_fw",
        type: "firewall",
        label: "FW",
        x: 430,
        y: 150,
        zoneMode: false,
        defaultAction: "deny",
        firewallRules: [],
        simpleRules: [
          {
            id: "r1",
            srcSeg: "lb_int",
            dstSeg: "lb_dmz",
            action: "permit",
            proto: "tcp",
            portOp: "eq",
            port: 443,
            port2: null,
          },
        ],
      },
      {
        id: "lb_lb",
        type: "loadbalancer",
        label: "LB (VIP :443)",
        vipPorts: "443",
        algorithm: "rr",
        lbWeights: {},
        pool: ["lb_w1", "lb_w2"],
        x: 430,
        y: 270,
      },
      { id: "lb_sw", type: "l2switch", label: "SW-DMZ", x: 430, y: 370 },
    ],
    hosts: [
      {
        id: "lb_w1",
        type: "host",
        label: "WEB-1",
        kind: "server",
        services: [443, 80],
        segId: "lb_dmz",
        x: 320,
        y: 520,
      },
      {
        id: "lb_w2",
        type: "host",
        label: "WEB-2",
        kind: "server",
        services: [443, 80],
        segId: "lb_dmz",
        x: 540,
        y: 520,
      },
    ],
    links: [
      { id: "lbl1", fromId: "lb_int", toId: "lb_fw" },
      { id: "lbl2", fromId: "lb_fw", toId: "lb_lb" },
      { id: "lbl3", fromId: "lb_lb", toId: "lb_sw" },
      { id: "lbl4", fromId: "lb_sw", toId: "lb_dmz" },
      { id: "lbl5", fromId: "lb_w1", toId: "lb_sw" },
      { id: "lbl6", fromId: "lb_w2", toId: "lb_sw" },
    ],
  };
}
function taskC2Dns() {
  return {
    meta: { name: "c2-dns", version: 1 },

    segments: [
      {
        id: "cd_int",
        name: "Internet",
        subnet: "0.0.0.0/0",
        isInternet: true,
        color: "#fbbf24",
        icon: "globe",
        x: 430,
        y: 30,
      },
      {
        id: "cd_lan",
        name: "Company LAN",
        subnet: "10.0.0.0/24",
        color: "#3ddc97",
        icon: "lan",
        x: 430,
        y: 430,
      },
    ],
    devices: [
      {
        id: "cd_ips",
        type: "idsips",
        label: "IPS",
        mode: "ips",
        signatures: [],
        x: 430,
        y: 130,
      },
      {
        id: "cd_fw",
        type: "firewall",
        label: "FW",
        x: 430,
        y: 240,
        zoneMode: true,
        defaultAction: "deny",
        simpleRules: [],
        zones: [
          { id: "zo", name: "outside", role: "outside" },
          { id: "zi", name: "inside", role: "inside" },
        ],
        ifaceZones: { cdl2: "zo", cdl3: "zi" },
        firewallRules: [
          {
            id: "r1",
            srcZone: "zi",
            dstZone: "zo",
            srcSeg: "*",
            dstSeg: "*",
            action: "permit",
            proto: "ip",
            portOp: "any",
            port: null,
            port2: null,
          },
        ],
      },
      { id: "cd_sw", type: "l2switch", label: "SW", x: 430, y: 340 },
    ],
    hosts: [
      {
        id: "cd_pc",
        type: "host",
        label: "PC (compromised)",
        kind: "pc",
        services: [],
        segId: "cd_lan",
        x: 430,
        y: 470,
      },
    ],
    links: [
      { id: "cdl1", fromId: "cd_int", toId: "cd_ips" },
      { id: "cdl2", fromId: "cd_ips", toId: "cd_fw" },
      { id: "cdl3", fromId: "cd_fw", toId: "cd_sw" },
      { id: "cdl4", fromId: "cd_sw", toId: "cd_lan" },
      { id: "cdl5", fromId: "cd_pc", toId: "cd_sw" },
    ],
  };
}
function taskSiteToSite() {
  return {
    meta: { name: "site2site", version: 1 },

    segments: [
      {
        id: "s2_int",
        name: "Internet",
        subnet: "0.0.0.0/0",
        isInternet: true,
        color: "#fbbf24",
        icon: "globe",
        x: 400,
        y: 40,
      },
      {
        id: "s2_br",
        name: "Branch",
        subnet: "10.1.0.0/24",
        color: "#2dd4bf",
        icon: "lan",
        x: 120,
        y: 330,
      },
      {
        id: "s2_hq",
        name: "Headquarters",
        subnet: "10.0.0.0/24",
        color: "#3ddc97",
        icon: "lan",
        x: 680,
        y: 330,
      },
    ],
    devices: [
      { id: "s2_rbr", type: "router", label: "R-branch", x: 250, y: 120 },
      { id: "s2_rhq", type: "router", label: "R-HQ", x: 550, y: 120 },
      { id: "s2_gwa", type: "vpn", label: "VPN-GW-A", x: 280, y: 230 },
      { id: "s2_gwb", type: "vpn", label: "VPN-GW-B", x: 520, y: 230 },
      { id: "s2_swa", type: "l2switch", label: "SW-branch", x: 140, y: 250 },
      { id: "s2_swb", type: "l2switch", label: "SW-HQ", x: 660, y: 250 },
    ],
    hosts: [
      {
        id: "s2_pc",
        type: "host",
        label: "PC-branch",
        kind: "pc",
        services: [],
        segId: "s2_br",
        x: 60,
        y: 440,
      },
      {
        id: "s2_srv",
        type: "host",
        label: "SRV-HQ (SMB)",
        kind: "server",
        services: [445],
        segId: "s2_hq",
        x: 740,
        y: 440,
      },
    ],
    links: [
      { id: "s2t1", fromId: "s2_rbr", toId: "s2_int" },
      { id: "s2t2", fromId: "s2_rhq", toId: "s2_int" },
      { id: "s2t3", fromId: "s2_rbr", toId: "s2_swa" },
      { id: "s2t3b", fromId: "s2_swa", toId: "s2_br" },
      { id: "s2t4", fromId: "s2_rhq", toId: "s2_swb" },
      { id: "s2t4b", fromId: "s2_swb", toId: "s2_hq" },
      { id: "s2t5", fromId: "s2_gwa", toId: "s2_swa" },
      { id: "s2t6", fromId: "s2_gwb", toId: "s2_swb" },
      { id: "s2t7", fromId: "s2_gwa", toId: "s2_gwb" },
      { id: "s2t8", fromId: "s2_pc", toId: "s2_swa" },
      { id: "s2t9", fromId: "s2_srv", toId: "s2_swb" },
    ],
  };
}
function taskWifiGuest() {
  return {
    meta: { name: "wifi-guest", version: 1 },

    segments: [
      {
        id: "wg_int",
        name: "Internet",
        subnet: "0.0.0.0/0",
        isInternet: true,
        color: "#fbbf24",
        icon: "globe",
        x: 430,
        y: 50,
      },
      {
        id: "wg_lan",
        name: "Home network",
        subnet: "192.168.1.0/24",
        color: "#3ddc97",
        icon: "lan",
        x: 240,
        y: 330,
      },
      {
        id: "wg_guest",
        name: "Guests",
        subnet: "192.168.50.0/24",
        color: "#a78bfa",
        icon: "users",
        x: 640,
        y: 330,
      },
    ],
    devices: [
      {
        id: "wg_rt",
        type: "firewall",
        label: "Router-home (all-in-one + Wi-Fi)",
        wifiOn: true,
        zones: [],
        ifaceZones: {},
        zoneMode: false,
        defaultAction: "deny",
        firewallRules: [],
        simpleRules: [
          {
            id: "wg_r1",
            srcSeg: "wg_lan",
            dstSeg: "wg_int",
            action: "permit",
            proto: "ip",
            portOp: "any",
            port: null,
            port2: null,
          },
        ],
        ssids: [{ name: "Office", segId: "wg_lan", on: true, pass: "secret1" }],
        x: 430,
        y: 190,
      },
      { id: "wg_sw", type: "l2switch", label: "Switch", x: 240, y: 250 },
    ],
    hosts: [
      {
        id: "wg_pc",
        type: "host",
        label: "PC",
        kind: "pc",
        services: [],
        segId: "wg_lan",
        x: 130,
        y: 460,
      },
      {
        id: "wg_nas",
        type: "host",
        label: "NAS",
        kind: "nas",
        services: [445],
        segId: "wg_lan",
        x: 300,
        y: 470,
      },
      {
        id: "wg_ph",
        type: "host",
        label: "Visitor mobile",
        kind: "mobile",
        services: [],
        segId: "wg_lan",
        wifi: { apId: "wg_rt", ssid: "Office" },
        x: 640,
        y: 460,
      },
    ],
    links: [
      { id: "wgl1", fromId: "wg_int", toId: "wg_rt" },
      { id: "wgl2", fromId: "wg_rt", toId: "wg_sw" },
      { id: "wgl2b", fromId: "wg_sw", toId: "wg_lan" },
      { id: "wgl3", fromId: "wg_rt", toId: "wg_guest" },
      { id: "wgl4", fromId: "wg_pc", toId: "wg_sw" },
      { id: "wgl5", fromId: "wg_nas", toId: "wg_sw" },
      { id: "wgl6", fromId: "wg_ph", toId: "wg_rt" },
    ],
  };
}
function taskLag() {
  return {
    meta: { name: "lag-uplink", version: 1 },

    segments: [
      {
        id: "lg_lan",
        name: "Company LAN",
        subnet: "10.0.0.0/24",
        color: "#3ddc97",
        icon: "lan",
        x: 430,
        y: 80,
      },
    ],
    devices: [
      { id: "lg_sw1", type: "l2switch", label: "SW-access", x: 280, y: 260 },
      { id: "lg_sw2", type: "l2switch", label: "SW-core", x: 600, y: 260 },
    ],
    hosts: [
      {
        id: "lg_pc",
        type: "host",
        label: "PC",
        kind: "pc",
        services: [],
        segId: "lg_lan",
        x: 200,
        y: 440,
      },
      {
        id: "lg_srv",
        type: "host",
        label: "Server",
        kind: "server",
        services: [443],
        segId: "lg_lan",
        x: 680,
        y: 440,
      },
    ],
    links: [
      { id: "lgl1", fromId: "lg_sw2", toId: "lg_lan" },
      { id: "lgl2", fromId: "lg_sw1", toId: "lg_sw2" },
      { id: "lgl3", fromId: "lg_sw1", toId: "lg_sw2" },
      { id: "lgl4", fromId: "lg_pc", toId: "lg_sw1" },
      { id: "lgl5", fromId: "lg_srv", toId: "lg_sw2" },
    ],
  };
}
function taskQuarContain() {
  return {
    meta: { name: "quar-contain", version: 1 },

    segments: [
      {
        id: "qc_int",
        name: "Internet",
        subnet: "0.0.0.0/0",
        isInternet: true,
        color: "#fbbf24",
        icon: "globe",
        x: 430,
        y: 40,
      },
      {
        id: "qc_lan",
        name: "Offices",
        subnet: "10.0.10.0/24",
        color: "#3ddc97",
        icon: "lan",
        x: 250,
        y: 450,
      },
      {
        id: "qc_srv",
        name: "Servers",
        subnet: "10.0.20.0/24",
        color: "#7dd3fc",
        icon: "db",
        x: 660,
        y: 450,
      },
    ],
    devices: [
      {
        id: "qc_fw",
        type: "firewall",
        label: "Firewall",
        x: 430,
        y: 170,
        zoneMode: false,
        defaultAction: "deny",
        firewallRules: [],
        simpleRules: [
          {
            id: "qc_r1",
            srcSeg: "qc_lan",
            dstSeg: "qc_int",
            action: "permit",
            proto: "ip",
            portOp: "any",
            port: null,
            port2: null,
          },
          {
            id: "qc_r2",
            srcSeg: "qc_lan",
            dstSeg: "qc_srv",
            action: "permit",
            proto: "tcp",
            portOp: "eq",
            port: 445,
            port2: null,
          },
        ],
      },
      { id: "qc_swo", type: "l2switch", label: "SW-offices", x: 250, y: 300 },
      { id: "qc_sws", type: "l2switch", label: "SW-servers", x: 660, y: 300 },
    ],
    hosts: [
      {
        id: "qc_bad",
        type: "host",
        label: "PC-04 (compromised)",
        kind: "pc",
        services: [],
        segId: "qc_lan",
        x: 120,
        y: 560,
      },
      {
        id: "qc_pc",
        type: "host",
        label: "PC-05",
        kind: "pc",
        services: [],
        segId: "qc_lan",
        x: 300,
        y: 560,
      },
      {
        id: "qc_file",
        type: "host",
        label: "File server",
        kind: "server",
        services: [445],
        segId: "qc_srv",
        x: 600,
        y: 560,
      },
      {
        id: "qc_log",
        type: "host",
        label: "Log collection",
        kind: "server",
        services: [514],
        segId: "qc_srv",
        x: 780,
        y: 560,
      },
    ],
    links: [
      { id: "qcl1", fromId: "qc_int", toId: "qc_fw" },
      { id: "qcl2", fromId: "qc_fw", toId: "qc_swo" },
      { id: "qcl3", fromId: "qc_swo", toId: "qc_lan" },
      { id: "qcl4", fromId: "qc_fw", toId: "qc_sws" },
      { id: "qcl5", fromId: "qc_sws", toId: "qc_srv" },
      { id: "qcl6", fromId: "qc_bad", toId: "qc_swo" },
      { id: "qcl7", fromId: "qc_pc", toId: "qc_swo" },
      { id: "qcl8", fromId: "qc_file", toId: "qc_sws" },
      { id: "qcl9", fromId: "qc_log", toId: "qc_sws" },
    ],
  };
}
function taskDot1xWired() {
  return {
    meta: { name: "dot1x-wired", version: 1 },
    segments: [
      {
        id: "dx_lan",
        name: "Company LAN",
        subnet: "10.0.0.0/24",
        color: "#2dd4bf",
        icon: "lan",
        x: 430,
        y: 80,
      },
    ],
    devices: [
      { id: "dx_sw", type: "l2mgmt", label: "Managed switch", x: 430, y: 230 },
    ],
    hosts: [
      {
        id: "dx_rad",
        type: "host",
        label: "RADIUS server (1812)",
        kind: "server",
        services: [1812],
        segId: "dx_lan",
        x: 700,
        y: 400,
      },
      {
        id: "dx_srv",
        type: "host",
        label: "File server (SMB 445)",
        kind: "server",
        services: [445],
        segId: "dx_lan",
        x: 500,
        y: 420,
      },
      {
        id: "dx_pc",
        type: "host",
        label: "Company PC",
        kind: "pc",
        services: [],
        segId: "dx_lan",
        x: 200,
        y: 400,
      },
      {
        id: "dx_host",
        type: "host",
        label: "Foreign laptop in meeting room",
        kind: "ntb",
        services: [],
        noCreds: true,
        segId: "dx_lan",
        x: 120,
        y: 300,
      },
    ],
    links: [
      { id: "dxl1", fromId: "dx_sw", toId: "dx_lan" },
      { id: "dxl2", fromId: "dx_rad", toId: "dx_sw" },
      { id: "dxl3", fromId: "dx_srv", toId: "dx_sw" },
      {
        id: "dxl4",
        fromId: "dx_pc",
        toId: "dx_sw",
        port: { mode: "access", vlan: "dx_lan" },
      },
      {
        id: "dxl5",
        fromId: "dx_host",
        toId: "dx_sw",
        port: { mode: "access", vlan: "dx_lan" },
      },
    ],
  };
}
function taskQosVoice() {
  return {
    meta: { name: "qos-voice", version: 1 },
    segments: [
      {
        id: "qv_lan",
        name: "Offices",
        subnet: "10.0.0.0/24",
        color: "#3ddc97",
        icon: "lan",
        x: 430,
        y: 70,
      },
    ],
    devices: [
      { id: "qv_acc", type: "l2switch", label: "SW-access", x: 250, y: 250 },
      { id: "qv_core", type: "l2switch", label: "SW-core", x: 640, y: 250 },
    ],
    hosts: [
      {
        id: "qv_tel",
        type: "host",
        label: "IP telefon",
        kind: "voip",
        services: [5060],
        segId: "qv_lan",
        x: 120,
        y: 420,
      },
      {
        id: "qv_pc",
        type: "host",
        label: "PC",
        kind: "pc",
        services: [],
        segId: "qv_lan",
        x: 300,
        y: 430,
      },
      {
        id: "qv_pbx",
        type: "host",
        label: "PBX (SIP 5060)",
        kind: "server",
        services: [5060],
        segId: "qv_lan",
        x: 700,
        y: 420,
      },
      {
        id: "qv_srv",
        type: "host",
        label: "File server (SMB 445)",
        kind: "server",
        services: [445],
        segId: "qv_lan",
        x: 860,
        y: 430,
      },
    ],
    links: [
      { id: "qvl1", fromId: "qv_core", toId: "qv_lan" },
      { id: "qvl2", fromId: "qv_acc", toId: "qv_core", congested: true },
      { id: "qvl3", fromId: "qv_tel", toId: "qv_acc" },
      { id: "qvl4", fromId: "qv_pc", toId: "qv_acc" },
      { id: "qvl5", fromId: "qv_pbx", toId: "qv_core" },
      { id: "qvl6", fromId: "qv_srv", toId: "qv_core" },
    ],
  };
}
function taskSlowLink() {
  return {
    meta: { name: "slow-link", version: 1 },

    segments: [
      {
        id: "sl_lan",
        name: "Offices",
        subnet: "10.0.0.0/24",
        color: "#3ddc97",
        icon: "lan",
        x: 430,
        y: 70,
      },
    ],
    devices: [
      { id: "sl_acc", type: "l2switch", label: "SW-access", x: 250, y: 250 },
      { id: "sl_core", type: "l2switch", label: "SW-core", x: 640, y: 250 },
      { id: "sl_alt", type: "l2switch", label: "SW-spare", x: 440, y: 400 },
    ],
    hosts: [
      {
        id: "sl_pc",
        type: "host",
        label: "PC",
        kind: "pc",
        services: [],
        segId: "sl_lan",
        x: 150,
        y: 430,
      },
      {
        id: "sl_srv",
        type: "host",
        label: "File server",
        kind: "server",
        services: [445],
        segId: "sl_lan",
        x: 760,
        y: 430,
      },
    ],
    links: [
      { id: "sll1", fromId: "sl_core", toId: "sl_lan" },
      { id: "sll2", fromId: "sl_acc", toId: "sl_core", congested: true },
      { id: "sll3", fromId: "sl_pc", toId: "sl_acc" },
      { id: "sll4", fromId: "sl_srv", toId: "sl_core" },
    ],
  };
}
function taskSyslogBlocked() {
  return {
    meta: { name: "syslog-blocked", version: 1 },

    segments: [
      {
        id: "sy_int",
        name: "Internet",
        subnet: "0.0.0.0/0",
        isInternet: true,
        color: "#fbbf24",
        icon: "globe",
        x: 430,
        y: 40,
      },
      {
        id: "sy_lan",
        name: "Offices",
        subnet: "10.0.10.0/24",
        color: "#3ddc97",
        icon: "lan",
        x: 220,
        y: 440,
      },
      {
        id: "sy_dc",
        name: "Datacentrum",
        subnet: "10.0.20.0/24",
        color: "#7dd3fc",
        icon: "lan",
        x: 660,
        y: 440,
      },
    ],
    devices: [
      {
        id: "sy_fw",
        type: "firewall",
        label: "Firewall",
        x: 430,
        y: 170,
        zoneMode: false,
        defaultAction: "deny",
        firewallRules: [],
        simpleRules: [
          {
            id: "sy_r1",
            srcSeg: "sy_lan",
            dstSeg: "sy_int",
            action: "permit",
            proto: "ip",
            portOp: "any",
            port: null,
            port2: null,
          },
          {
            id: "sy_r2",
            srcSeg: "sy_lan",
            dstSeg: "sy_dc",
            action: "permit",
            proto: "tcp",
            portOp: "eq",
            port: 443,
            port2: null,
          },
        ],
      },
      { id: "sy_swo", type: "l2switch", label: "SW-offices", x: 220, y: 300 },
      { id: "sy_swd", type: "l2switch", label: "SW-DC", x: 660, y: 300 },
    ],
    hosts: [
      {
        id: "sy_srv",
        type: "host",
        label: "File server",
        kind: "server",
        services: [443, 445],
        segId: "sy_lan",
        x: 120,
        y: 540,
      },
      {
        id: "sy_pc",
        type: "host",
        label: "PC",
        kind: "pc",
        services: [],
        segId: "sy_lan",
        x: 300,
        y: 540,
      },
      {
        id: "sy_log",
        type: "host",
        label: "LOG (log collection)",
        kind: "server",
        services: [514],
        segId: "sy_dc",
        x: 760,
        y: 540,
      },
    ],
    links: [
      { id: "syl1", fromId: "sy_int", toId: "sy_fw" },
      { id: "syl2", fromId: "sy_fw", toId: "sy_swo" },
      { id: "syl3", fromId: "sy_swo", toId: "sy_lan" },
      { id: "syl4", fromId: "sy_fw", toId: "sy_swd" },
      { id: "syl5", fromId: "sy_swd", toId: "sy_dc" },
      { id: "syl6", fromId: "sy_srv", toId: "sy_swo" },
      { id: "syl7", fromId: "sy_pc", toId: "sy_swo" },
      { id: "syl8", fromId: "sy_log", toId: "sy_swd" },
    ],
  };
}
function taskLayered() {
  return {
    meta: { name: "layered-def", version: 1 },

    segments: [
      {
        id: "ly_int",
        name: "Internet",
        subnet: "0.0.0.0/0",
        isInternet: true,
        color: "#fbbf24",
        icon: "globe",
        x: 430,
        y: 40,
      },
      {
        id: "ly_dmz",
        name: "DMZ",
        subnet: "203.0.113.0/24",
        color: "#fb923c",
        icon: "lan",
        x: 430,
        y: 460,
      },
    ],
    devices: [
      {
        id: "ly_fw",
        type: "firewall",
        label: "Firewall",
        x: 430,
        y: 150,
        zoneMode: false,
        defaultAction: "deny",
        firewallRules: [],
        simpleRules: [
          {
            id: "ly_r1",
            srcSeg: "ly_int",
            dstSeg: "ly_dmz",
            action: "permit",
            proto: "tcp",
            portOp: "eq",
            port: 443,
            port2: null,
          },
        ],
      },
      { id: "ly_sw", type: "l2switch", label: "SW-DMZ", x: 430, y: 330 },
    ],
    hosts: [
      {
        id: "ly_web",
        type: "host",
        label: "WEB",
        kind: "server",
        services: [443],
        segId: "ly_dmz",
        x: 280,
        y: 540,
      },
      {
        id: "ly_hp",
        type: "host",
        label: "Decoy",
        kind: "honeypot",
        services: [443, 22],
        segId: "ly_dmz",
        x: 600,
        y: 540,
      },
    ],
    links: [
      { id: "lyl1", fromId: "ly_int", toId: "ly_fw" },
      { id: "lyl2", fromId: "ly_fw", toId: "ly_sw" },
      { id: "lyl3", fromId: "ly_sw", toId: "ly_dmz" },
      { id: "lyl4", fromId: "ly_web", toId: "ly_sw" },
      { id: "lyl5", fromId: "ly_hp", toId: "ly_sw" },
    ],
  };
}
function taskN1Map() {
  return {
    meta: { name: "n1-map", version: 1 },

    segments: [
      {
        id: "nm_int",
        name: "Internet",
        subnet: "0.0.0.0/0",
        isInternet: true,
        color: "#fbbf24",
        icon: "globe",
        x: 430,
        y: 40,
      },
      {
        id: "nm_lan",
        name: "Company LAN",
        subnet: "10.0.0.0/24",
        color: "#3ddc97",
        icon: "lan",
        x: 430,
        y: 470,
      },
    ],
    devices: [
      {
        id: "nm_fwa",
        type: "firewall",
        label: "FW-A (active)",
        x: 300,
        y: 170,
        zoneMode: false,
        defaultAction: "deny",
        firewallRules: [],
        simpleRules: [
          {
            id: "nm_r1",
            srcSeg: "nm_lan",
            dstSeg: "nm_int",
            action: "permit",
            proto: "ip",
            portOp: "any",
            port: null,
            port2: null,
          },
        ],
        haPeer: "nm_fwb",
        haMode: "ap",
        haStandby: false,
      },
      {
        id: "nm_fwb",
        type: "firewall",
        label: "FW-B (backup)",
        x: 560,
        y: 170,
        zoneMode: false,
        defaultAction: "deny",
        firewallRules: [],
        simpleRules: [
          {
            id: "nm_r2",
            srcSeg: "nm_lan",
            dstSeg: "nm_int",
            action: "permit",
            proto: "ip",
            portOp: "any",
            port: null,
            port2: null,
          },
        ],
        haPeer: "nm_fwa",
        haMode: "ap",
        haStandby: true,
      },
      {
        id: "nm_sw",
        type: "l2switch",
        label: "Switch (only one!)",
        x: 430,
        y: 320,
      },
    ],
    hosts: [
      {
        id: "nm_pc",
        type: "host",
        label: "PC",
        kind: "pc",
        services: [],
        segId: "nm_lan",
        x: 430,
        y: 540,
      },
    ],
    links: [
      { id: "nml1", fromId: "nm_int", toId: "nm_fwa" },
      { id: "nml2", fromId: "nm_int", toId: "nm_fwb" },
      { id: "nml3", fromId: "nm_fwa", toId: "nm_sw" },
      { id: "nml4", fromId: "nm_fwb", toId: "nm_sw" },
      { id: "nml5", fromId: "nm_sw", toId: "nm_lan" },
      { id: "nml6", fromId: "nm_pc", toId: "nm_sw" },
    ],
  };
}
function taskDiode() {
  return {
    meta: { name: "diode-way", version: 1 },

    segments: [
      {
        id: "dd_it",
        name: "IT LAN (office)",
        subnet: "10.0.1.0/24",
        color: "#60a5fa",
        icon: "lan",
        x: 200,
        y: 80,
      },
      {
        id: "dd_ot",
        name: "OT LAN (production)",
        subnet: "10.0.3.0/24",
        color: "#a78bfa",
        icon: "iot",
        x: 680,
        y: 80,
      },
    ],
    devices: [
      {
        id: "dd_d",
        type: "datadiode",
        label: "Data diode",
        outId: "dd_swot",
        x: 430,
        y: 250,
      },
      {
        id: "dd_l3",
        type: "l3switch",
        label: "L3-IT",
        acl: [],
        x: 200,
        y: 250,
      },
      { id: "dd_swot", type: "l2switch", label: "SW-OT", x: 680, y: 250 },
    ],
    hosts: [
      {
        id: "dd_hist",
        type: "host",
        label: "Historian (1433)",
        kind: "historian",
        services: [1433],
        segId: "dd_it",
        x: 120,
        y: 420,
      },
      {
        id: "dd_plc",
        type: "host",
        label: "PLC-1 (502)",
        kind: "plc",
        services: [502],
        segId: "dd_ot",
        x: 760,
        y: 420,
      },
    ],
    links: [
      { id: "ddl1", fromId: "dd_it", toId: "dd_l3" },
      { id: "ddl2", fromId: "dd_l3", toId: "dd_d" },
      { id: "ddl3", fromId: "dd_d", toId: "dd_swot" },
      { id: "ddl4", fromId: "dd_swot", toId: "dd_ot" },
      { id: "ddl5", fromId: "dd_hist", toId: "dd_l3" },
      { id: "ddl6", fromId: "dd_plc", toId: "dd_swot" },
    ],
  };
}
function taskWanFailover() {
  return {
    meta: { name: "wan-failover", version: 1 },

    segments: [
      {
        id: "wf_isp1",
        name: "ISP A",
        subnet: "0.0.0.0/0",
        isInternet: true,
        color: "#fbbf24",
        icon: "globe",
        x: 250,
        y: 40,
      },
      {
        id: "wf_isp2",
        name: "ISP B",
        subnet: "0.0.0.0/0",
        isInternet: true,
        color: "#f59e0b",
        icon: "globe",
        x: 640,
        y: 40,
      },
      {
        id: "wf_lan",
        name: "Company LAN",
        subnet: "10.0.0.0/24",
        color: "#3ddc97",
        icon: "lan",
        x: 430,
        y: 430,
      },
    ],
    devices: [
      { id: "wf_rt", type: "router", label: "Router", x: 430, y: 200 },
      { id: "wf_sw", type: "l2switch", label: "Switch", x: 430, y: 320 },
    ],
    hosts: [
      {
        id: "wf_pc",
        type: "host",
        label: "PC",
        kind: "pc",
        services: [],
        segId: "wf_lan",
        x: 430,
        y: 500,
      },
    ],
    links: [
      { id: "wfl1", fromId: "wf_isp1", toId: "wf_rt", port: { off: true } },
      { id: "wfl2", fromId: "wf_rt", toId: "wf_sw" },
      { id: "wfl3", fromId: "wf_sw", toId: "wf_lan" },
      { id: "wfl4", fromId: "wf_pc", toId: "wf_sw" },
    ],
  };
}
function taskStormStp() {
  return {
    meta: { name: "storm-stp", version: 1 },

    segments: [
      {
        id: "st_lan",
        name: "Company LAN",
        subnet: "10.0.0.0/24",
        color: "#3ddc97",
        icon: "lan",
        x: 430,
        y: 80,
      },
    ],
    devices: [
      {
        id: "st_sw1",
        type: "l2switch",
        label: "SW-1",
        stpMode: "off",
        x: 280,
        y: 260,
      },
      {
        id: "st_sw2",
        type: "l2switch",
        label: "SW-2",
        stpMode: "off",
        x: 600,
        y: 260,
      },
    ],
    hosts: [
      {
        id: "st_pc",
        type: "host",
        label: "PC",
        kind: "pc",
        services: [],
        segId: "st_lan",
        x: 200,
        y: 440,
      },
      {
        id: "st_srv",
        type: "host",
        label: "Server",
        kind: "server",
        services: [443],
        segId: "st_lan",
        x: 680,
        y: 440,
      },
    ],
    links: [
      { id: "stl1", fromId: "st_sw1", toId: "st_lan" },
      { id: "stl2", fromId: "st_sw1", toId: "st_sw2" },
      { id: "stl3", fromId: "st_sw1", toId: "st_sw2" },
      { id: "stl4", fromId: "st_pc", toId: "st_sw1" },
      { id: "stl5", fromId: "st_srv", toId: "st_sw2" },
    ],
  };
}
function taskDnsAlias() {
  return {
    meta: { name: "dns-alias", version: 1 },

    segments: [
      {
        id: "da_lan",
        name: "Company LAN",
        subnet: "10.0.0.0/24",
        color: "#3ddc97",
        icon: "lan",
        x: 430,
        y: 100,
      },
    ],
    devices: [
      { id: "da_sw", type: "l2switch", label: "Switch", x: 430, y: 250 },
    ],
    hosts: [
      {
        id: "da_pc",
        type: "host",
        label: "PC",
        kind: "pc",
        services: [],
        segId: "da_lan",
        dnsId: "da_dns",
        x: 200,
        y: 440,
      },
      {
        id: "da_dns",
        type: "host",
        label: "DNS",
        kind: "server",
        services: [53],
        segId: "da_lan",
        x: 430,
        y: 440,
        dnsForward: false,
        dnsRecords: [
          {
            id: "dar1",
            name: "web.acme.local",
            type: "A",
            hostId: "da_web",
            ttl: 300,
          },
        ],
      },
      {
        id: "da_web",
        type: "host",
        label: "WEB",
        kind: "server",
        services: [443],
        segId: "da_lan",
        x: 680,
        y: 440,
      },
    ],
    links: [
      { id: "dal1", fromId: "da_sw", toId: "da_lan" },
      { id: "dal2", fromId: "da_pc", toId: "da_sw" },
      { id: "dal3", fromId: "da_dns", toId: "da_sw" },
      { id: "dal4", fromId: "da_web", toId: "da_sw" },
    ],
  };
}
function taskWifiEnterprise() {
  return {
    meta: { name: "wifi-enterprise", version: 1 },

    segments: [
      {
        id: "we_int",
        name: "Internet",
        subnet: "0.0.0.0/0",
        isInternet: true,
        color: "#fbbf24",
        icon: "globe",
        x: 430,
        y: 40,
      },
      {
        id: "we_lan",
        name: "Offices",
        subnet: "10.0.10.0/24",
        color: "#3ddc97",
        icon: "lan",
        x: 230,
        y: 430,
      },
      {
        id: "we_dc",
        name: "Datacentrum",
        subnet: "10.0.20.0/24",
        color: "#7dd3fc",
        icon: "lan",
        x: 660,
        y: 430,
      },
    ],
    devices: [
      {
        id: "we_fw",
        type: "firewall",
        label: "Firewall",
        x: 430,
        y: 170,
        zoneMode: false,
        defaultAction: "deny",
        firewallRules: [],
        simpleRules: [
          {
            id: "we_r1",
            srcSeg: "we_lan",
            dstSeg: "we_int",
            action: "permit",
            proto: "ip",
            portOp: "any",
            port: null,
            port2: null,
          },
        ],
      },
      {
        id: "we_ap",
        type: "ap",
        label: "AP",
        wifiOn: true,
        ssids: [
          {
            name: "Corp",
            segId: "we_lan",
            sec: "ent",
            radiusId: "we_rad",
            pass: "",
            on: true,
          },
        ],
        x: 230,
        y: 300,
      },
      { id: "we_swd", type: "l2switch", label: "SW-DC", x: 660, y: 300 },
    ],
    hosts: [
      {
        id: "we_ntb",
        type: "host",
        label: "NTB",
        kind: "ntb",
        services: [],
        segId: "we_lan",
        wifiClient: true,
        x: 130,
        y: 470,
      },
      {
        id: "we_rad",
        type: "host",
        label: "RADIUS",
        kind: "server",
        services: [1812],
        segId: "we_dc",
        x: 760,
        y: 470,
      },
    ],
    links: [
      { id: "wel1", fromId: "we_int", toId: "we_fw" },
      { id: "wel2", fromId: "we_fw", toId: "we_lan" },
      { id: "wel3", fromId: "we_fw", toId: "we_swd" },
      { id: "wel4", fromId: "we_swd", toId: "we_dc" },
      { id: "wel5", fromId: "we_lan", toId: "we_ap" },
      { id: "wel6", fromId: "we_rad", toId: "we_swd" },
    ],
  };
}
function taskVpnRadius() {
  return {
    meta: { name: "vpn-radius", version: 1 },

    segments: [
      {
        id: "vr_int",
        name: "Internet",
        subnet: "0.0.0.0/0",
        isInternet: true,
        color: "#fbbf24",
        icon: "globe",
        x: 430,
        y: 30,
      },
      {
        id: "vr_pool",
        name: "VPN pool",
        subnet: "10.8.0.0/24",
        color: "#a78bfa",
        icon: "lan",
        x: 660,
        y: 330,
      },
      {
        id: "vr_lan",
        name: "LAN (servers)",
        subnet: "10.0.0.0/24",
        color: "#3ddc97",
        icon: "lan",
        x: 230,
        y: 330,
      },
    ],
    devices: [
      {
        id: "vr_fw",
        type: "firewall",
        label: "FW (VPN)",
        x: 430,
        y: 150,
        zoneMode: true,
        defaultAction: "deny",
        simpleRules: [],
        zones: [
          { id: "zo", name: "outside", role: "outside" },
          { id: "zi", name: "inside", role: "inside" },
          { id: "zv", name: "VPN", role: "vpn" },
        ],
        ifaceZones: { vrl1: "zo", vrl2: "zv", vrl3: "zi" },
        firewallRules: [],
        vpnRadiusId: "vr_rad",
      },
    ],
    hosts: [
      {
        id: "vr_cli",
        type: "host",
        label: "VPN client",
        kind: "ntb",
        services: [],
        segId: "vr_pool",
        x: 660,
        y: 470,
      },
      {
        id: "vr_srv",
        type: "host",
        label: "Internal server",
        kind: "server",
        services: [443, 3389],
        segId: "vr_lan",
        x: 130,
        y: 470,
      },
      {
        id: "vr_rad",
        type: "host",
        label: "RADIUS (off)",
        kind: "server",
        services: [1812],
        segId: "vr_lan",
        down: true,
        x: 330,
        y: 470,
      },
    ],
    links: [
      { id: "vrl1", fromId: "vr_int", toId: "vr_fw" },
      { id: "vrl2", fromId: "vr_fw", toId: "vr_pool" },
      { id: "vrl3", fromId: "vr_fw", toId: "vr_lan" },
      { id: "vrl4", fromId: "vr_cli", toId: "vr_int" },
      { id: "vrl5", fromId: "vr_srv", toId: "vr_lan" },
      { id: "vrl6", fromId: "vr_rad", toId: "vr_lan" },
    ],
  };
}
function taskWifiSecure() {
  return {
    meta: { name: "wifi-secure", version: 1 },

    segments: [
      {
        id: "ws_int",
        name: "Internet",
        subnet: "0.0.0.0/0",
        isInternet: true,
        color: "#fbbf24",
        icon: "globe",
        x: 430,
        y: 50,
      },
      {
        id: "ws_lan",
        name: "Company network",
        subnet: "10.0.0.0/24",
        color: "#3ddc97",
        icon: "lan",
        x: 430,
        y: 430,
      },
    ],
    devices: [
      { id: "ws_rt", type: "router", label: "Router", x: 430, y: 170 },
      { id: "ws_sw", type: "l2switch", label: "Switch", x: 300, y: 300 },
      {
        id: "ws_ap",
        type: "ap",
        label: "AP",
        wifiOn: true,
        ssids: [
          { name: "Office", segId: "ws_lan", sec: "open", pass: "", on: true },
        ],
        x: 620,
        y: 300,
      },
    ],
    hosts: [
      {
        id: "ws_ntb",
        type: "host",
        label: "NTB",
        kind: "ntb",
        services: [],
        segId: "ws_lan",
        wifi: { apId: "ws_ap", ssid: "Office" },
        x: 700,
        y: 460,
      },
    ],
    links: [
      { id: "wsl1", fromId: "ws_int", toId: "ws_rt" },
      { id: "wsl2", fromId: "ws_rt", toId: "ws_sw" },
      { id: "wsl3", fromId: "ws_sw", toId: "ws_lan" },
      { id: "wsl4", fromId: "ws_sw", toId: "ws_ap" },
      { id: "wsl5", fromId: "ws_ntb", toId: "ws_ap" },
    ],
  };
}
function taskEvilTwin() {
  return {
    meta: { name: "evil-twin", version: 1 },

    segments: [
      {
        id: "et_int",
        name: "Internet",
        subnet: "0.0.0.0/0",
        isInternet: true,
        color: "#fbbf24",
        icon: "globe",
        x: 430,
        y: 50,
      },
      {
        id: "et_lan",
        name: "Café network",
        subnet: "10.0.0.0/24",
        color: "#3ddc97",
        icon: "lan",
        x: 250,
        y: 430,
      },
      {
        id: "et_evil",
        name: "Attacker's network",
        subnet: "192.168.66.0/24",
        color: "#fb7185",
        icon: "lan",
        x: 660,
        y: 430,
      },
    ],
    devices: [
      { id: "et_rt", type: "router", label: "Router", x: 250, y: 170 },
      {
        id: "et_ap",
        type: "ap",
        label: "Café AP",
        wifiOn: true,
        ssids: [
          {
            name: "CafeWifi",
            segId: "et_lan",
            sec: "wpa2",
            pass: "cafe123",
            on: true,
          },
        ],
        x: 250,
        y: 300,
      },
      {
        id: "et_twin",
        type: "ap",
        label: "Evil twin (attacker)",
        wifiOn: true,
        ssids: [
          {
            name: "CafeWifi",
            segId: "et_evil",
            sec: "open",
            pass: "",
            on: true,
          },
        ],
        x: 660,
        y: 300,
      },
    ],
    hosts: [
      {
        id: "et_ntb",
        type: "host",
        label: "NTB",
        kind: "ntb",
        services: [],
        segId: "et_evil",
        wifi: { apId: "et_twin", ssid: "CafeWifi" },
        x: 560,
        y: 470,
      },
      {
        id: "et_atk",
        type: "host",
        label: "Attacker",
        kind: "pc",
        services: [],
        segId: "et_evil",
        x: 760,
        y: 470,
      },
    ],
    links: [
      { id: "etl1", fromId: "et_int", toId: "et_rt" },
      { id: "etl2", fromId: "et_rt", toId: "et_lan" },
      { id: "etl3", fromId: "et_lan", toId: "et_ap" },
      { id: "etl4", fromId: "et_twin", toId: "et_evil" },
      { id: "etl5", fromId: "et_atk", toId: "et_twin" },
      { id: "etl6", fromId: "et_ntb", toId: "et_twin" },
    ],
  };
}
function taskRogueAp() {
  return {
    meta: { name: "rogue-ap", version: 1 },

    segments: [
      {
        id: "ra_int",
        name: "Internet",
        subnet: "0.0.0.0/0",
        isInternet: true,
        color: "#fbbf24",
        icon: "globe",
        x: 430,
        y: 50,
      },
      {
        id: "ra_lan",
        name: "Company network",
        subnet: "10.0.0.0/24",
        color: "#3ddc97",
        icon: "lan",
        x: 430,
        y: 430,
      },
    ],
    devices: [
      {
        id: "ra_fw",
        type: "firewall",
        label: "Firewall",
        x: 430,
        y: 170,
        zoneMode: false,
        defaultAction: "deny",
        zones: [],
        ifaceZones: {},
        firewallRules: [],
        simpleRules: [
          {
            id: "ra_r1",
            srcSeg: "ra_lan",
            dstSeg: "ra_int",
            action: "permit",
            proto: "ip",
            portOp: "any",
            port: null,
            port2: null,
          },
        ],
      },
      { id: "ra_sw", type: "l2switch", label: "Switch", x: 430, y: 300 },
      {
        id: "ra_ap",
        type: "ap",
        label: "Employee AP (no password!)",
        wifiOn: true,
        ssids: [{ name: "FreeWifi", segId: "ra_lan", on: true }],
        x: 700,
        y: 300,
      },
    ],
    hosts: [
      {
        id: "ra_pc",
        type: "host",
        label: "PC-office",
        kind: "pc",
        services: [],
        segId: "ra_lan",
        x: 250,
        y: 470,
      },
      {
        id: "ra_srv",
        type: "host",
        label: "Server (SMB)",
        kind: "server",
        services: [445],
        segId: "ra_lan",
        x: 430,
        y: 500,
      },
      {
        id: "ra_att",
        type: "host",
        label: "Attacker (parking lot)",
        kind: "ntb",
        services: [],
        segId: "ra_lan",
        wifi: { apId: "ra_ap", ssid: "FreeWifi" },
        x: 830,
        y: 440,
      },
    ],
    links: [
      { id: "ral1", fromId: "ra_int", toId: "ra_fw" },
      { id: "ral2", fromId: "ra_fw", toId: "ra_sw" },
      { id: "ral3", fromId: "ra_sw", toId: "ra_lan" },
      { id: "ral4", fromId: "ra_pc", toId: "ra_sw" },
      { id: "ral5", fromId: "ra_srv", toId: "ra_sw" },
      { id: "ral6", fromId: "ra_ap", toId: "ra_sw" },
      { id: "ral7", fromId: "ra_att", toId: "ra_ap" },
    ],
  };
}
function taskMacTable() {
  return {
    meta: { name: "mac-table", version: 1 },
    segments: [
      {
        id: "mt_lan",
        name: "Company LAN",
        subnet: "192.168.1.0/24",
        color: "#2dd4bf",
        icon: "lan",
        x: 430,
        y: 120,
      },
    ],
    devices: [
      { id: "mt_swa", type: "l2switch", label: "SW-A", x: 330, y: 240 },
      { id: "mt_swb", type: "l2switch", label: "SW-B", x: 640, y: 240 },
    ],
    hosts: [
      {
        id: "mt_pca",
        type: "host",
        label: "PC-A",
        kind: "pc",
        services: [],
        segId: "mt_lan",
        x: 170,
        y: 380,
      },
      {
        id: "mt_srv",
        type: "host",
        label: "Server (SMB 445)",
        kind: "server",
        services: [445],
        segId: "mt_lan",
        x: 330,
        y: 380,
      },
      {
        id: "mt_pcc",
        type: "host",
        label: "PC-C",
        kind: "pc",
        services: [],
        segId: "mt_lan",
        x: 580,
        y: 380,
      },
      {
        id: "mt_pcd",
        type: "host",
        label: "PC-D",
        kind: "pc",
        services: [],
        segId: "mt_lan",
        x: 730,
        y: 380,
      },
    ],
    links: [
      { id: "mtl1", fromId: "mt_swa", toId: "mt_lan" },
      { id: "mtl2", fromId: "mt_swa", toId: "mt_swb" },
      { id: "mtl3", fromId: "mt_pca", toId: "mt_swa" },
      { id: "mtl4", fromId: "mt_srv", toId: "mt_swa" },
      { id: "mtl5", fromId: "mt_pcc", toId: "mt_swb" },
      { id: "mtl6", fromId: "mt_pcd", toId: "mt_swb" },
    ],
  };
}
function taskOpenNet() {
  return {
    meta: { name: "open-net", version: 1 },
    segments: [
      {
        id: "on_int",
        name: "Internet",
        subnet: "0.0.0.0/0",
        isInternet: true,
        color: "#fbbf24",
        icon: "globe",
        x: 430,
        y: 60,
      },
      {
        id: "on_lan",
        name: "Company LAN",
        subnet: "192.168.1.0/24",
        color: "#2dd4bf",
        icon: "lan",
        x: 430,
        y: 430,
      },
    ],
    devices: [
      {
        id: "on_r",
        type: "firewall",
        label: "Firewall (allows everything)",
        x: 430,
        y: 180,
        zoneMode: false,
        defaultAction: "permit",
        simpleRules: [],
        zones: [],
        ifaceZones: {},
        firewallRules: [],
      },
      { id: "on_sw", type: "l2switch", label: "SW", x: 430, y: 300 },
    ],
    hosts: [
      {
        id: "on_srv",
        type: "host",
        label: "File server (SMB 445, RDP 3389)",
        kind: "server",
        services: [445, 3389],
        segId: "on_lan",
        x: 300,
        y: 480,
      },
      {
        id: "on_pc",
        type: "host",
        label: "PC",
        kind: "pc",
        services: [],
        segId: "on_lan",
        x: 560,
        y: 480,
      },
    ],
    links: [
      { id: "onl1", fromId: "on_int", toId: "on_r" },
      { id: "onl2", fromId: "on_r", toId: "on_lan" },
      { id: "onl3", fromId: "on_sw", toId: "on_lan" },
      { id: "onl4", fromId: "on_srv", toId: "on_sw" },
      { id: "onl5", fromId: "on_pc", toId: "on_sw" },
    ],
  };
}
function taskFirewallObserve() {
  return {
    meta: { name: "firewall-observe", version: 1 },
    segments: [
      {
        id: "fo_int",
        name: "Internet",
        subnet: "0.0.0.0/0",
        isInternet: true,
        color: "#fbbf24",
        icon: "globe",
        x: 430,
        y: 60,
      },
      {
        id: "fo_dmz",
        name: "Web server (inside)",
        subnet: "10.0.0.0/24",
        color: "#3ddc97",
        icon: "lan",
        x: 430,
        y: 430,
      },
    ],
    devices: [
      {
        id: "fo_fw",
        type: "firewall",
        label: "Firewall",
        x: 430,
        y: 170,
        zoneMode: false,
        defaultAction: "deny",
        simpleRules: [
          {
            id: "r1",
            srcSeg: "fo_int",
            dstSeg: "fo_dmz",
            action: "permit",
            proto: "tcp",
            portOp: "eq",
            port: 443,
            port2: null,
          },
        ],
        zones: [],
        ifaceZones: {},
        firewallRules: [],
      },
      { id: "fo_sw", type: "l2switch", label: "SW", x: 430, y: 300 },
    ],
    hosts: [
      {
        id: "fo_web",
        type: "host",
        label: "Web server",
        kind: "server",
        services: [443, 80],
        segId: "fo_dmz",
        x: 430,
        y: 470,
      },
    ],
    links: [
      { id: "fol1", fromId: "fo_int", toId: "fo_fw" },
      { id: "fol2", fromId: "fo_fw", toId: "fo_sw" },
      { id: "fol3", fromId: "fo_sw", toId: "fo_dmz" },
      { id: "fol4", fromId: "fo_web", toId: "fo_sw" },
    ],
  };
}

/* ===== Tasks for the data centre, campus, branch, VoIP and hotel examples ===== */

function taskWifiBand() {
  return {
    meta: { name: "wifi-band", version: 1 },
    segments: [
      { id: "wb_int", name: "Internet", subnet: "0.0.0.0/0", isInternet: true, color: "#fbbf24", icon: "globe", x: 520, y: 40 },
      { id: "wb_lan", name: "Office LAN", subnet: "10.60.10.0/24", color: "#3ddc97", icon: "lan", x: 520, y: 330 },
    ],
    devices: [
      { id: "wb_rt", type: "router", label: "Router", x: 520, y: 190 },
      {
        id: "wb_ap", type: "ap", label: "AP", x: 520, y: 480, wifiOn: true,
        ssids: [
          { name: "OFFICE", segId: "wb_lan", pass: "officepw", sec: "wpa2", on: true, band: "2.4", ch: 6 },
        ],
      },
    ],
    hosts: [
      { id: "wb_ntb", type: "host", kind: "ntb", label: "Notebook", segId: "wb_lan", x: 640, y: 560, wifi: { apId: "wb_ap", ssid: "OFFICE" } },
      { id: "wb_srv", type: "host", kind: "server", services: [445], segId: "wb_lan", x: 380, y: 400 },
    ],
    links: [
      { id: "wbl1", fromId: "wb_int", toId: "wb_rt" },
      { id: "wbl2", fromId: "wb_rt", toId: "wb_lan" },
      { id: "wbl3", fromId: "wb_ap", toId: "wb_lan" },
      { id: "wbl4", fromId: "wb_ntb", toId: "wb_ap" },
      // The wired server sits on the same switch as the AP, not floating on the
      // segment alone, or it has no cable to be found by.
      { id: "wbl5", fromId: "wb_srv", toId: "wb_ap" },
    ],
  };
}

function taskWifiRange() {
  return {
    meta: { name: "wifi-range", version: 1 },
    segments: [
      { id: "wr_int", name: "Internet", subnet: "0.0.0.0/0", isInternet: true, color: "#fbbf24", icon: "globe", x: 200, y: 40 },
      { id: "wr_lan", name: "Office LAN", subnet: "10.61.10.0/24", color: "#3ddc97", icon: "lan", x: 200, y: 330 },
    ],
    devices: [
      { id: "wr_rt", type: "router", label: "Router", x: 200, y: 190 },
      {
        // Far end of the hall: the client sits well beyond comfortable range for a
        // 10 dBm radio, so the cell has to be widened rather than the topology moved.
        id: "wr_ap", type: "ap", label: "AP (weak)", x: 200, y: 480, wifiOn: true, wlTx: 10,
        ssids: [
          { name: "OFFICE", segId: "wr_lan", pass: "officepw", sec: "wpa2", on: true, band: "5", ch: 36 },
        ],
      },
    ],
    hosts: [
      { id: "wr_ntb", type: "host", kind: "ntb", label: "Notebook", segId: "wr_lan", x: 780, y: 520, wifi: { apId: "wr_ap", ssid: "OFFICE" } },
      { id: "wr_srv", type: "host", kind: "server", services: [445], segId: "wr_lan", x: 80, y: 400 },
    ],
    links: [
      { id: "wrl1", fromId: "wr_int", toId: "wr_rt" },
      { id: "wrl2", fromId: "wr_rt", toId: "wr_lan" },
      { id: "wrl3", fromId: "wr_ap", toId: "wr_lan" },
      { id: "wrl4", fromId: "wr_ntb", toId: "wr_ap" },
      { id: "wrl5", fromId: "wr_srv", toId: "wr_ap" },
    ],
  };
}

function taskWifiChannelPlan() {
  return {
    meta: { name: "wifi-channel", version: 1 },
    segments: [
      { id: "wc_int", name: "Internet", subnet: "0.0.0.0/0", isInternet: true, color: "#fbbf24", icon: "globe", x: 520, y: 40 },
      { id: "wc_lan", name: "Office LAN", subnet: "10.62.10.0/24", color: "#3ddc97", icon: "lan", x: 520, y: 330 },
    ],
    devices: [
      { id: "wc_rt", type: "router", label: "Router", x: 520, y: 190 },
      // Two 2.4 GHz APs, both on channel 6 -- their cells overlap and each one
      // steals airtime from the other.
      { id: "wc_ap1", type: "ap", label: "AP-1", x: 320, y: 480, wifiOn: true, wlTx: 20,
        ssids: [{ name: "OFFICE", segId: "wc_lan", pass: "officepw", sec: "wpa2", on: true, band: "2.4", ch: 6 }] },
      { id: "wc_ap2", type: "ap", label: "AP-2", x: 740, y: 480, wifiOn: true, wlTx: 20,
        ssids: [{ name: "OFFICE", segId: "wc_lan", pass: "officepw", sec: "wpa2", on: true, band: "2.4", ch: 6 }] },
    ],
    hosts: [
      { id: "wc_n1", type: "host", kind: "ntb", label: "Notebook 1", segId: "wc_lan", x: 320, y: 620, wifi: { apId: "wc_ap1", ssid: "OFFICE" } },
      { id: "wc_n2", type: "host", kind: "ntb", label: "Notebook 2", segId: "wc_lan", x: 740, y: 620, wifi: { apId: "wc_ap2", ssid: "OFFICE" } },
      { id: "wc_srv", type: "host", kind: "server", services: [445], segId: "wc_lan", x: 520, y: 400 },
    ],
    links: [
      { id: "wcl1", fromId: "wc_int", toId: "wc_rt" },
      { id: "wcl2", fromId: "wc_rt", toId: "wc_lan" },
      { id: "wcl3", fromId: "wc_ap1", toId: "wc_lan" },
      { id: "wcl4", fromId: "wc_ap2", toId: "wc_lan" },
      { id: "wcl5", fromId: "wc_n1", toId: "wc_ap1" },
      { id: "wcl6", fromId: "wc_n2", toId: "wc_ap2" },
      { id: "wcl7", fromId: "wc_srv", toId: "wc_ap1" },
    ],
  };
}

function taskStorageVlan() {
  // A NEW object literal per call: netSelfTest runs setup() again after solve()
  // has mutated the first one, and a shared literal would hand back the solved
  // state -- so the task would look already-finished on its first run.
  return {
    meta: { name: "storage-vlan", version: 2 },
    segments: [
      { id: "sv_int", name: "Internet", subnet: "0.0.0.0/0", isInternet: true, color: "#fbbf24", icon: "globe", x: 620, y: 40 },
      { id: "sv_v10", name: "VLAN10 – clients", subnet: "10.70.10.0/24", vlan: "10", color: "#3ddc97", icon: "lan", x: 300, y: 300 },
      { id: "sv_appnet", name: "VLAN20 – application", subnet: "10.70.20.0/24", vlan: "20", color: "#60a5fa", icon: "lan", x: 300, y: 460 },
      { id: "sv_v30", name: "VLAN30 – storage", subnet: "10.70.30.0/24", vlan: "30", color: "#a78bfa", icon: "db", x: 300, y: 620 },
    ],
    devices: [
      {
        id: "sv_fw", type: "firewall", label: "FW", x: 620, y: 170,
        zoneMode: false, defaultAction: "deny", firewallRules: [],
        simpleRules: [
          // The application tier is allowed to read the storage; ordinary clients
          // are not, whatever the cabling does.
          { id: "sv_r1", srcSeg: "sv_appnet", dstSeg: "sv_v30", action: "permit", proto: "tcp", portOp: "eq", port: 2049, port2: null },
          { id: "sv_r2", srcSeg: "sv_v10", dstSeg: "sv_v30", action: "deny", proto: "ip", portOp: "any", port: null, port2: null },
        ],
      },
      { id: "sv_sw1", type: "l2mgmt", label: "SW-1", x: 460, y: 300 },
      { id: "sv_sw2", type: "l2mgmt", label: "SW-2", x: 460, y: 620 },
    ],
    hosts: [
      { id: "sv_pc", type: "host", kind: "pc", label: "Client PC", segId: "sv_v10", x: 200, y: 220 },
      { id: "sv_app", type: "host", kind: "server", services: [443], segId: "sv_appnet", x: 380, y: 220 },
      { id: "sv_nas", type: "host", kind: "nas", services: [2049, 445], segId: "sv_v30", x: 200, y: 760 },
    ],
    links: [
      { id: "sv_l1", fromId: "sv_int", toId: "sv_fw" },
      // Both inter-switch links were left pinned to the client VLAN, so neither the
      // application nor the storage VLAN can cross to the server switch.
      { id: "sv_l2", fromId: "sv_fw", toId: "sv_sw2", port: { mode: "access", vlan: "sv_v10" } },
      { id: "sv_l3", fromId: "sv_sw2", toId: "sv_sw1", port: { mode: "access", vlan: "sv_v10" } },
      { id: "sv_l4", fromId: "sv_sw1", toId: "sv_v10" },
      { id: "sv_l4b", fromId: "sv_sw1", toId: "sv_appnet" },
      { id: "sv_l5", fromId: "sv_sw2", toId: "sv_v30" },
      { id: "sv_l6", fromId: "sv_pc", toId: "sv_sw1" },
      { id: "sv_l7", fromId: "sv_app", toId: "sv_sw1" },
      { id: "sv_l8", fromId: "sv_nas", toId: "sv_sw2" },
    ],
  };
}

function taskVoiceVlan() {
  return {
    meta: { name: "voice-vlan", version: 2 },
    segments: [
      { id: "vv_int", name: "Internet (SIP trunk)", subnet: "0.0.0.0/0", isInternet: true, color: "#fbbf24", icon: "globe", x: 620, y: 40 },
      { id: "vv_data", name: "VLAN10 – Data", subnet: "10.80.10.0/24", vlan: "10", color: "#3ddc97", icon: "lan", x: 300, y: 300 },
      { id: "vv_voice", name: "VLAN50 – Voice", subnet: "10.80.50.0/24", vlan: "50", color: "#a78bfa", icon: "lan", x: 300, y: 620 },
      { id: "vv_srv", name: "VLAN60 – Call services", subnet: "10.80.60.0/24", vlan: "60", color: "#60a5fa", icon: "db", x: 940, y: 620 },
    ],
    devices: [
      {
        id: "vv_fw", type: "firewall", label: "Voice FW", x: 620, y: 170,
        zoneMode: false, defaultAction: "deny", firewallRules: [],
        simpleRules: [
          { id: "vv_r1", srcSeg: "vv_voice", dstSeg: "vv_srv", action: "permit", proto: "udp", portOp: "eq", port: 5060, port2: null },
          { id: "vv_r2", srcSeg: "vv_srv", dstSeg: "vv_int", action: "permit", proto: "udp", portOp: "eq", port: 5060, port2: null },
        ],
      },
      { id: "vv_sw", type: "l2mgmt", label: "CC-SW", x: 300, y: 460 },
      { id: "vv_sw2", type: "l2mgmt", label: "CC-SW-VOICE", x: 640, y: 460 },
    ],
    hosts: [
      { id: "vv_tel", type: "host", kind: "voip", services: [5060], segId: "vv_voice", x: 180, y: 720 },
      { id: "vv_cm", type: "host", kind: "server", services: [5060], segId: "vv_srv", x: 940, y: 480 },
      { id: "vv_pc", type: "host", kind: "pc", label: "Agent PC", segId: "vv_data", x: 180, y: 240 },
    ],
    links: [
      // Both links are congested: calls pass, but they wait behind everything else
      // because nobody has given voice traffic priority yet.
      { id: "vv_l1", fromId: "vv_fw", toId: "vv_sw", speed: 100, congested: true },
      { id: "vv_l2", fromId: "vv_fw", toId: "vv_sw2", speed: 100, congested: true },
      { id: "vv_l3", fromId: "vv_int", toId: "vv_fw" },
      { id: "vv_l4", fromId: "vv_data", toId: "vv_sw" },
      { id: "vv_l5", fromId: "vv_voice", toId: "vv_sw2" },
      { id: "vv_l6", fromId: "vv_srv", toId: "vv_sw2" },
      { id: "vv_l7", fromId: "vv_tel", toId: "vv_sw2" },
      { id: "vv_l8", fromId: "vv_cm", toId: "vv_sw2" },
      { id: "vv_l9", fromId: "vv_pc", toId: "vv_sw" },
    ],
  };
}

const INCIDENT_SCENARIOS = [
  {
    id: "arp",
    apply() {
      const seg = "g_u1";
      const atk = {
        id: "drill_atk",
        type: "host",
        label: "PC-107",
        kind: "pc",
        services: [],
        segId: seg,
        arpSpoof: true,
        x: 260,
        y: 640,
      };
      DB.hosts.push(atk);
      const sw = DB.devices.find((d) => d.id === "g_swp1");
      DB.links.push({
        id: "drill_l",
        fromId: "drill_atk",
        toId: sw ? sw.id : DB.devices[0].id,
      });
      return { atkId: "drill_atk" };
    },
    solved(st) {
      const n = getNode(st.atkId);
      return !n || !!n.quar;
    },
    revealKey: "drillRevArp",
  },
  {
    id: "dhcp",
    apply() {
      const seg = "g_u2";
      const atk = {
        id: "drill_atk",
        type: "host",
        label: "PRN-207",
        kind: "pc",
        services: [],
        segId: seg,
        dhcpd: { gw: "10.20.11.66", rogue: true },
        x: 520,
        y: 640,
      };
      DB.hosts.push(atk);
      const sw = DB.devices.find((d) => d.id === "g_swp2");
      DB.links.push({
        id: "drill_l",
        fromId: "drill_atk",
        toId: sw ? sw.id : DB.devices[0].id,
      });
      return { atkId: "drill_atk" };
    },
    solved(st) {
      const n = getNode(st.atkId);
      return !n || !!n.quar || !dhcpOfferSurvives(st.atkId);
    },
    revealKey: "drillRevDhcp",
  },
  {
    id: "dns",
    apply() {
      const dns = DB.hosts.find((h) => h.id === "g_dns");
      if (!dns) return null;
      const atk = {
        id: "drill_atk",
        type: "host",
        label: "SRV-CACHE-02",
        kind: "server",
        services: [80, 443],
        segId: "g_u2",
        x: 900,
        y: 640,
      };
      DB.hosts.push(atk);
      const sw = DB.devices.find((d) => d.id === "g_swp2");
      DB.links.push({
        id: "drill_l",
        fromId: "drill_atk",
        toId: sw ? sw.id : DB.devices[0].id,
      });
      const rec = (dns.dnsRecords || []).find(
        (r) => r && /intra|www/.test(String(r.name || "")),
      );
      if (!rec) return null;
      const orig = rec.hostId;
      rec.hostId = "drill_atk";
      return { atkId: "drill_atk", dnsId: dns.id, recId: rec.id, orig };
    },
    solved(st) {
      const dns = getNode(st.dnsId);
      if (!dns) return true;
      const r = (dns.dnsRecords || []).find((x) => x && x.id === st.recId);
      const atk = getNode(st.atkId);
      return !r || r.hostId !== st.atkId || !atk || !!atk.quar;
    },
    revealKey: "drillRevDns",
  },
  {
    id: "twin",
    apply() {
      const ap = DB.devices.find((d) => d.type === "ap" && !isInactive(d.id));
      if (!ap) return null;
      const name = (apEffSsids(ap)[0] || {}).name || "CORP-WIFI";
      const evil = {
        id: "drill_ap",
        type: "ap",
        label: "AP-FL1 (kopie)",
        x: (ap.x || 300) + 120,
        y: (ap.y || 500) + 90,
        wifiOn: true,
        ssids: [
          { name: name, segId: "g_guest", on: true, sec: "open", pass: "" },
        ],
      };
      DB.devices.push(evil);
      const sw = DB.devices.find((d) => d.id === "g_swp1");
      DB.links.push({
        id: "drill_l",
        fromId: "drill_ap",
        toId: sw ? sw.id : DB.devices[0].id,
      });
      return { atkId: "drill_ap" };
    },
    solved(st) {
      const n = getNode(st.atkId);
      return !n || !!n.quar || !!n.down || n.wifiOn === false;
    },
    revealKey: "drillRevTwin",
  },
  {
    id: "exfil",
    apply() {
      const atk = {
        id: "drill_atk",
        type: "host",
        label: "PC-104",
        kind: "pc",
        services: [],
        segId: "g_u1",
        x: 200,
        y: 700,
        exfil: true,
      };
      DB.hosts.push(atk);
      const sw = DB.devices.find((d) => d.id === "g_swp1");
      DB.links.push({
        id: "drill_l",
        fromId: "drill_atk",
        toId: sw ? sw.id : DB.devices[0].id,
      });
      return { atkId: "drill_atk", exfil: true };
    },
    solved(st) {
      const n = getNode(st.atkId);
      return !n || !!n.quar || !!n.down;
    },
    revealKey: "drillRevExfil",
  },
  {
    id: "rule",
    apply() {
      const fw = DB.devices.find(
        (d) => d.type === "firewall" && !isInactive(d.id),
      );
      if (!fw) return null;
      const r = {
        id: "drill_rule",
        srcZone: "*",
        dstZone: "*",
        srcSeg: "*",
        dstSeg: "*",
        action: "permit",
        proto: "ip",
        portOp: "any",
        port: null,
        port2: null,
      };
      (fw.firewallRules = fw.firewallRules || []).unshift(r);
      return { fwId: fw.id };
    },
    solved(st) {
      const fw = getNode(st.fwId);
      return (
        !fw || !(fw.firewallRules || []).some((r) => r && r.id === "drill_rule")
      );
    },
    revealKey: "drillRevRule",
  },
];
