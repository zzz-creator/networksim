(function(){var th;try{th=localStorage.getItem('netsim_theme');}catch(e){}
if(th!=="light"&&th!=="dark")th=(window.matchMedia&&matchMedia('(prefers-color-scheme: light)').matches)?"light":"dark";
document.documentElement.setAttribute('data-theme',th);})();

// Error ring buffer. Installed here because head.js is the only script that
// loads before js/01-core.js — an error buffer attached in 19-boot.js would
// miss every throw during app startup, which is exactly when bugs happen.
// Read by appDiagnostics() when the user copies their diagnostics.
(function () {
  var MAX = 20;
  try {
    window.__nsErrors = [];
    function rec(kind, text) {
      var list = window.__nsErrors;
      if (!list) return;
      list.push({ t: new Date().toISOString(), kind: kind, msg: String(text).slice(0, 300) });
      if (list.length > MAX) list.shift();
    }
    window.__nsRecError = rec;
    window.addEventListener("error", function (e) {
      var where = e.filename ? " @" + String(e.filename).split("/").pop() + ":" + e.lineno : "";
      rec("error", (e.message || "unknown error") + where);
    });
    window.addEventListener("unhandledrejection", function (e) {
      var r = e && e.reason;
      rec("unhandled rejection", (r && (r.message || r)) || "unknown");
    });
  } catch (e) {}
})();