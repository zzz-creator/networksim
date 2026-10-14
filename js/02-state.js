"use strict";

let selectedId = null;
let selectedLinkId = null;
let view = "diagram";
let resultMode = "result";
let lastResult = null;

let _saveFailed = false;
function saveDB() {
  radiusCacheClear();
  syslogCacheClear();

  DB.meta.name = document.getElementById("topoName").value || t("topoDefault");

  try {
    localStorage.setItem("netsim_db", JSON.stringify(DB));
    _saveFailed = false;
  } catch (e) {
    if (!_saveFailed) {
      _saveFailed = true;
      setStatus(t("stSaveFailed"), false);
    }
  }
  runtimeClear();
  histSnapshot();
}

try {
  window.addEventListener("storage", (e) => {
    if (e.key === "netsim_db") setStatus(t("stOtherTab"), false);
  });
} catch (e) {}
function loadDB() {
  try {
    const s = localStorage.getItem("netsim_db");
    if (s) return JSON.parse(s);
  } catch (e) {}
  return null;
}

function dropSavedDB() {
  try {
    localStorage.removeItem("netsim_db");
  } catch (e) {}
}

let histStack = [],
  histPtr = -1,
  histLock = false,
  histTimer = null;
function histSnapshot() {
  if (histLock) return;
  clearTimeout(histTimer);
  histTimer = setTimeout(histCommit, 400);
}
function histCommit() {
  histTimer = null;
  const snap = JSON.stringify(DB);
  if (histPtr >= 0 && histStack[histPtr] === snap) return;
  histStack = histStack.slice(0, histPtr + 1);
  histStack.push(snap);
  if (histStack.length > 60) histStack.shift();
  histPtr = histStack.length - 1;
  updateUndoButtons();
}
function histRestore(dir) {
  if (histTimer) {
    clearTimeout(histTimer);
    histCommit();
  }
  const np = histPtr + dir;
  if (np < 0 || np >= histStack.length) return;
  histPtr = np;
  histLock = true;

  if (
    $("modalBg").classList.contains("show") &&
    DB_MODALS.indexOf(modalOpenerName) >= 0
  )
    closeModal();
  try {
    DB = JSON.parse(histStack[histPtr]);
    try {
      localStorage.setItem("netsim_db", JSON.stringify(DB));
    } catch (e) {}
    runtimeClear();
    selectedId = null;
    selectedLinkId = null;
    const tn = document.getElementById("topoName");
    if (tn && DB.meta) tn.value = DB.meta.name;
    render();
    refreshAll();
  } finally {
    histLock = false;
  }
  updateUndoButtons();
  setStatus(dir < 0 ? t("stUndone") : t("stRedone"));
}
function undo() {
  histRestore(-1);
}
function redo() {
  histRestore(1);
}
function updateUndoButtons() {
  const u = document.getElementById("btnUndo"),
    r = document.getElementById("btnRedo");
  if (u) u.disabled = !(histPtr > 0);
  if (r) r.disabled = !(histPtr < histStack.length - 1);
}

function _b64urlEnc(bytes) {
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function _b64urlDec(s) {
  s = s.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(s);
  const a = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) a[i] = bin.charCodeAt(i);
  return a;
}
async function _gzip(str) {
  const cs = new CompressionStream("gzip");
  const buf = await new Response(
    new Blob([new TextEncoder().encode(str)]).stream().pipeThrough(cs),
  ).arrayBuffer();
  return new Uint8Array(buf);
}
async function _gunzip(bytes) {
  const ds = new DecompressionStream("gzip");
  const buf = await new Response(
    new Blob([bytes]).stream().pipeThrough(ds),
  ).arrayBuffer();
  return new TextDecoder().decode(buf);
}
async function encodeTopo() {
  const json = JSON.stringify(DB);
  if (typeof CompressionStream !== "undefined") {
    try {
      return "g" + _b64urlEnc(await _gzip(json));
    } catch (e) {}
  }
  return "r" + _b64urlEnc(new TextEncoder().encode(json));
}
async function decodeTopo(payload) {
  const scheme = payload[0],
    data = payload.slice(1);
  if (scheme === "g") return JSON.parse(await _gunzip(_b64urlDec(data)));
  if (scheme === "r")
    return JSON.parse(new TextDecoder().decode(_b64urlDec(data)));
  return JSON.parse(new TextDecoder().decode(_b64urlDec(payload)));
}
function copyText(txt) {
  if (navigator.clipboard && navigator.clipboard.writeText)
    return navigator.clipboard.writeText(txt);
  return new Promise((res, rej) => {
    try {
      const ta = document.createElement("textarea");
      ta.value = txt;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      res();
    } catch (e) {
      rej(e);
    }
  });
}
async function shareLink() {
  saveDB();
  let url;
  try {
    const payload = await encodeTopo();
    url = location.href.split("#")[0] + "#t=" + payload;
  } catch (e) {
    setStatus(t("stLinkError"), false);
    return;
  }
  openModal(`<h2>${icon("link", "ico-a")}${t("shareTitle")}</h2>
    <p style="color:var(--muted);font-size:13px;line-height:1.55;margin:0 0 14px">${t("shareDesc")}</p>
    <div class="mrow"><input id="shareUrl" class="mono" readonly aria-label="${esc(t("shareTitle"))}" value="${esc(url)}" style="flex:1;background:var(--panel2);border:1px solid var(--line2);color:var(--txt);padding:9px 11px;border-radius:9px;font-size:12px"><button class="btn primary" id="shareCopy">${t("shareCopy")}</button></div>
    <div class="actions"><button class="btn" id="shareClose">${t("fbCancel")}</button></div>`);
  const inp = $("shareUrl");
  inp.focus();
  inp.select();
  const doCopy = () =>
    copyText(url).then(
      () => {
        $("shareCopy").textContent = t("shareCopied");
        setStatus(t("stLinkCopied"));
      },
      () => {
        inp.focus();
        inp.select();
      },
    );
  $("shareCopy").onclick = doCopy;
  $("shareClose").onclick = closeModal;
  doCopy();
}

function seedDB() {
  return {
    meta: { name: t("topoDefault"), version: 1 },
    devices: [],
    segments: [],
    hosts: [],
    links: [],
  };
}

const $ = (id) => document.getElementById(id);
function getNode(id) {
  return (
    DB.devices.find((d) => d.id === id) ||
    DB.segments.find((s) => s.id === id) ||
    (DB.hosts || []).find((h) => h.id === id) ||
    null
  );
}
function isDevice(id) {
  return DB.devices.some((d) => d.id === id);
}
function isSegment(id) {
  return DB.segments.some((s) => s.id === id);
}
function isHost(id) {
  return (DB.hosts || []).some((h) => h.id === id);
}
function linksOf(id) {
  return DB.links.filter((l) => l.fromId === id || l.toId === id);
}

const QOS_PRIO_PORTS = [5060, 5061];
