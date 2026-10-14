"use strict";

function refreshSelects() {
  const segs = DB.segments,
    hosts = DB.hosts || [];
  const lbs = DB.devices.filter(
    (d) => d.type === "loadbalancer" && lbBackends(d).length,
  );
  const allIds = segs.map((s) => s.id).concat(hosts.map((h) => h.id));
  const fill = (sel, keep, withLB, preferHost) => {
    sel.innerHTML = "";
    if (segs.length) {
      const og = document.createElement("optgroup");
      og.label = t("netsTitle");
      segs.forEach((s) => {
        const o = document.createElement("option");
        o.value = s.id;
        o.textContent = s.name + (s.subnet ? " (" + s.subnet + ")" : "");
        og.appendChild(o);
      });
      sel.appendChild(og);
    }
    if (hosts.length) {
      const og = document.createElement("optgroup");
      og.label = t("hostsGroupLabel");
      hosts.forEach((h) => {
        const o = document.createElement("option");
        o.value = h.id;
        const seg = h.segId && getNode(h.segId);
        o.textContent = h.label + (seg ? " @ " + seg.name : t("hostNoSeg"));
        og.appendChild(o);
      });
      sel.appendChild(og);
    }
    if (withLB && lbs.length) {
      const og = document.createElement("optgroup");
      og.label = t("lbGroupLabel");
      lbs.forEach((d) => {
        const o = document.createElement("option");
        o.value = d.id;
        o.textContent =
          d.label + " (VIP" + (d.vipPorts ? " " + d.vipPorts : "") + ")";
        og.appendChild(o);
      });
      sel.appendChild(og);
    }

    const names = withLB ? allDnsNames() : [];
    if (names.length) {
      const og = document.createElement("optgroup");
      og.label = t("dnsGroupLabel");
      names.forEach((n) => {
        const o = document.createElement("option");
        o.value = "name:" + n;
        o.textContent = n;
        og.appendChild(o);
      });
      sel.appendChild(og);
    }
    const mxDoms = withLB ? allMxDomains() : [];
    if (mxDoms.length) {
      const og = document.createElement("optgroup");
      og.label = t("dnsMxGroupLabel");
      mxDoms.forEach((n) => {
        const o = document.createElement("option");
        o.value = "mx:" + n;
        o.textContent = "@" + n;
        og.appendChild(o);
      });
      sel.appendChild(og);
    }
    const okIds = (withLB ? allIds.concat(lbs.map((d) => d.id)) : allIds)
      .concat(names.map((n) => "name:" + n))
      .concat(mxDoms.map((n) => "mx:" + n));
    if (keep && okIds.indexOf(keep) >= 0) sel.value = keep;
    else if (preferHost && hosts.length) sel.value = hosts[0].id;
  };
  fill($("selSrc"), $("selSrc").value, false, true);
  fill($("selDst"), $("selDst").value, true);
  if (allIds.length > 1 && $("selSrc").value === $("selDst").value) {
    $("selDst").value =
      allIds.find((id) => id !== $("selSrc").value) || allIds[1];
  }
  refreshTaskActions();
}

function updateAnalysisBtns() {
  const eps = simEndpoints().length,
    devs = DB.devices.length,
    nodes =
      devs +
      (DB.hosts || []).length +
      DB.segments.filter((s) => !s.isInternet).length;
  const set = (id, bad, why) => {
    const b = $(id);
    if (!b) return;
    b.disabled = !!bad;
    if (bad) b.title = why;
    else b.removeAttribute("title");
  };
  set("btnTest", eps < 2, t("btnDisNeedEp"));
  set(
    "btnBlast",
    eps < 2 || nodes > BLAST_MAX_NODES,
    eps < 2 ? t("btnDisNeedEp") : tf("btnDisTooBig", nodes, BLAST_MAX_NODES),
  );
  set(
    "btnHA",
    eps < 2 || !devs || nodes > HA_MAX_NODES,
    eps < 2
      ? t("btnDisNeedEp")
      : !devs
        ? t("btnDisNeedDev")
        : tf("btnDisTooBig", nodes, HA_MAX_NODES),
  );
  set("btnAudit", !nodes, t("btnDisNeedNodes"));
  if (!(typeof simState !== "undefined" && simState.on))
    set("btnTrafficSim", eps < 2, t("btnDisNeedEp"));
}
function refreshTaskActions() {
  updateAnalysisBtns();
  if (!$("taskWebSel")) return;
  {
    const s = $("selSrc"),
      lbl = $("taskActSrc");
    if (lbl) {
      const o = s && s.selectedIndex >= 0 ? s.options[s.selectedIndex] : null;
      lbl.textContent = o ? o.textContent : "—";
      lbl.parentElement.style.display = o ? "" : "none";
    }
  }
  const fillOne = (sel, opts) => {
    const prev = sel.value;
    sel.innerHTML = "";
    opts.forEach((o) => {
      const e = document.createElement("option");
      e.value = o.v;
      e.textContent = o.l;
      sel.appendChild(e);
    });
    if (prev && opts.some((o) => o.v === prev)) sel.value = prev;
    return opts.length > 0;
  };

  const names = allDnsNames();
  const isWebName = (n) => {
    const nm = dnsNorm(n);
    if (
      (DB.hosts || []).some(
        (h) =>
          Array.isArray(h.services) &&
          (h.services.indexOf(80) >= 0 || h.services.indexOf(443) >= 0) &&
          hostServedNames(h).some((x) => dnsNorm(x) === nm),
      )
    )
      return true;
    return dnsNodeList().some((r) => {
      const loc = dnsLookupLocal(r, nm);
      if (!loc || !loc.ok || !loc.hostId) return false;
      const th = getNode(loc.hostId);
      return !!(
        th &&
        Array.isArray(th.services) &&
        (th.services.indexOf(80) >= 0 || th.services.indexOf(443) >= 0)
      );
    });
  };

  const webFirst = names.filter(isWebName);
  const webOpts = webFirst.length
    ? webFirst.map((n) => ({ v: "name:" + n, l: n }))
    : (DB.hosts || [])
        .filter(
          (h) =>
            Array.isArray(h.services) &&
            (h.services.indexOf(443) >= 0 || h.services.indexOf(80) >= 0),
        )
        .map((h) => ({ v: h.id, l: h.label }));
  const wOk = fillOne($("taskWebSel"), webOpts);
  $("taskWebSel").closest(".field").style.display = wOk ? "" : "none";
  $("taskWebBtn").disabled = !wOk;
  $("taskWebNone").style.display = wOk ? "none" : "block";
  const mOk = fillOne(
    $("taskMailSel"),
    allMxDomains().map((n) => ({ v: "mx:" + n, l: "@" + n })),
  );
  $("taskMailSel").closest(".field").style.display = mOk ? "" : "none";
  $("taskMailBtn").disabled = !mOk;
  $("taskMailNone").style.display = mOk ? "none" : "block";
  if ($("taskPingBtn")) $("taskPingBtn").disabled = simEndpoints().length < 2;
}
function fillTrafficSelect() {
  const sel = $("selTraffic"),
    m = $("matrixTraffic");
  [sel, m].forEach((s) => {
    const prev = s.value;
    s.innerHTML = "";
    Object.keys(TRAFFIC).forEach((k) => {
      if (s === m && k === "custom") return;
      const o = document.createElement("option");
      o.value = k;
      o.textContent = TRAFFIC[k].label;
      s.appendChild(o);
    });
    if (prev) s.value = prev;
  });
  if (!sel.value) sel.value = "icmp";
  if (!m.value) m.value = "https";
  const c = $("selContent");
  if (c) {
    const prev = c.value;
    c.innerHTML =
      '<option value="">' +
      t("labelThreatClean") +
      "</option>" +
      IPS_THREATS.map(
        (x) => `<option value="${x.id}">${esc(threatLabel(x.id))}</option>`,
      ).join("");
    c.value = prev || "";
  }
}
function syncPayloadField() {
  const p = $("selPayload");
  if (!p) return;
  if (isAdvanced()) {
    const c = $("selContent") ? $("selContent").value : "";
    if (!p.value || p.dataset.auto === "1") {
      p.value = samplePayload(c || "clean");
      p.dataset.auto = "1";
    }
  }
}
function currentTraffic() {
  const k = $("selTraffic").value;
  const content = ($("selContent") && $("selContent").value) || null;
  let payload = null;
  if (isAdvanced()) {
    const pl = $("selPayload") && $("selPayload").value;
    payload = pl && pl.length ? pl : samplePayload(content || "clean");
  } else if (content) {
    payload = samplePayload(content);
  }
  const base =
    k === "custom"
      ? {
          proto: $("customProto").value,
          port: parseInt($("customPort").value, 10) || 0,
        }
      : { proto: TRAFFIC[k].proto, port: TRAFFIC[k].port };
  base.content = content || null;
  base.payload = payload;
  return base;
}
$("selTraffic").addEventListener("change", () => {
  $("customRow").style.display =
    $("selTraffic").value === "custom" ? "flex" : "none";
});
$("selContent").addEventListener("change", () => {
  const p = $("selPayload");
  if (p) p.dataset.auto = "1";
  syncPayloadField();
});
$("selPayload").addEventListener("input", () => {
  $("selPayload").dataset.auto = "0";
});

$("selSrc").addEventListener("change", refreshTaskActions);
$("btnTest").addEventListener("click", () => {
  runTest();
  revealResult();
});

function runTaskAction(dstVal, trafficKey) {
  if (dstVal) $("selDst").value = dstVal;
  $("selTraffic").value = trafficKey;
  $("customRow").style.display = "none";
  runTest();
  revealResult();
}
$("taskWebBtn").addEventListener("click", () => {
  const v = $("taskWebSel").value;
  if (!v) return;
  let tk = "https";
  if (v.indexOf("name:") !== 0) {
    const h = getNode(v);
    if (
      h &&
      Array.isArray(h.services) &&
      h.services.indexOf(443) < 0 &&
      h.services.indexOf(80) >= 0
    )
      tk = "http";
  }
  runTaskAction(v, tk);
});
$("taskMailBtn").addEventListener("click", () => {
  const v = $("taskMailSel").value;
  if (!v) return;
  runTaskAction(v, "smtp");
});
$("taskPingBtn").addEventListener("click", () => {
  runTaskAction(null, "icmp");
});

$("btnBlast").addEventListener("click", () => {
  runBlastRadius();
  revealResult();
});
$("btnHA").addEventListener("click", () => {
  runResilience();
  revealResult();
});
$("btnAudit").addEventListener("click", () => {
  runAudit();
  revealResult();
});

let simState = {
  on: false,
  timer: null,
  raf: null,
  packets: [],
  floods: [],
  count: 0,
};
