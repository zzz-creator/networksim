"use strict";

function closeKindPicker() {
  const e = $("kindPick");
  if (e) e.remove();
  document.removeEventListener("pointerdown", kindPickAway, true);
  document.removeEventListener("keydown", kindPickKey, true);
  if (_pendingHost && !_kindCommitted) {
    const id = _pendingHost.id;
    DB.hosts = (DB.hosts || []).filter((x) => x.id !== id);
    if (selectedId === id) selectedId = null;
    saveDB();
    render();
    refreshAll();
  }
  _pendingHost = null;
  _kindCommitted = false;
}
function kindPickAway(ev) {
  const e = $("kindPick");
  if (e && !e.contains(ev.target)) closeKindPicker();
}
function kindPickKey(ev) {
  if (ev.key === "Escape") closeKindPicker();
}
function openKindPicker(h) {
  closeKindPicker();
  _pendingHost = h;
  _kindCommitted = false;
  const box = document.createElement("div");
  box.className = "kindpick";
  box.id = "kindPick";
  const ttl = document.createElement("div");
  ttl.className = "kp-ttl";
  ttl.textContent = t("kindPickTitle");
  box.appendChild(ttl);
  const grid = document.createElement("div");
  grid.className = "kp-grid";
  box.appendChild(grid);
  HOST_KINDS.forEach((k) => {
    const b = document.createElement("button");
    b.className = "kp-btn";
    b.type = "button";
    const sv = el("svg", { viewBox: "-14 -14 28 28" });
    sv.appendChild(segIcon(k.icon, "currentColor"));
    b.appendChild(sv);
    const lb = document.createElement("span");
    lb.textContent = k.name;
    b.appendChild(lb);
    b.addEventListener("click", () => {
      _kindCommitted = true;
      h.kind = k.id;
      h.services = (k.svc || []).slice();
      if (isAutoHostLabel(h.label)) h.label = nextHostLabel(k.id);
      saveDB();
      render();
      refreshAll();
      select(h.id);
      setStatus(t("stAdded") + ": " + h.label);
      closeKindPicker();
    });
    grid.appendChild(b);
  });
  const more = document.createElement("button");
  more.className = "kp-more";
  more.type = "button";
  more.textContent = t("kindPickMore");
  more.addEventListener("click", () => {
    _kindCommitted = true;
    closeKindPicker();
    openHostModal(h, false);
  });
  box.appendChild(more);
  document.body.appendChild(box);

  const c = svgToClient(h.x, h.y);
  const r = box.getBoundingClientRect();
  let left = c.x + 22,
    top = c.y - r.height / 2;
  left = Math.max(8, Math.min(left, innerWidth - r.width - 8));
  top = Math.max(8, Math.min(top, innerHeight - r.height - 8));
  box.style.left = left + "px";
  box.style.top = top + "px";
  setTimeout(() => {
    document.addEventListener("pointerdown", kindPickAway, true);
    document.addEventListener("keydown", kindPickKey, true);
  }, 0);
}

function dhcpServerNodeList() {
  return DB.devices
    .filter(
      (d) =>
        (d.type === "router" ||
          d.type === "firewall" ||
          d.type === "l3switch") &&
        d.dhcpRole === "server",
    )
    .concat(
      (DB.hosts || []).filter(
        (h) => Array.isArray(h.services) && h.services.indexOf(67) >= 0,
      ),
    );
}
function wireDhcpResv(listId, addId, initial) {
  const rl = $(listId);
  if (!rl) return;
  const addRow = (mac, ip) => {
    const row = document.createElement("div");
    row.className = "mResvRow";
    row.style.cssText =
      "display:flex;gap:6px;align-items:center;margin-bottom:4px";
    row.innerHTML = `<input class="mResvMac mono" placeholder="MAC (02:..)" value="${esc(mac || "")}" style="flex:1"><span style="color:var(--muted)">→</span><input class="mResvIp mono" placeholder="IP" value="${esc(ip || "")}" style="width:120px"><button type="button" class="iconbtn mResvDel" title="${"Odebrat"}">×</button>`;
    row.querySelector(".mResvDel").onclick = () => row.remove();
    rl.appendChild(row);
  };
  (initial || []).forEach((r) => addRow(r && r.mac, r && r.ip));
  if ($(addId)) $(addId).onclick = () => addRow("", "");
}
function readDhcpResv(listId) {
  const out = [];
  document.querySelectorAll("#" + listId + " .mResvRow").forEach((row) => {
    const m = (row.querySelector(".mResvMac").value || "").trim();
    const ip = (row.querySelector(".mResvIp").value || "").trim();
    if (m && ip) out.push({ mac: m.toLowerCase(), ip });
  });
  return out;
}

function dnsRecEditorHtml(records, selfId) {
  const dnsAdv = isAdvanced();

  const dnsHostOpts = (sel) =>
    '<option value="">' +
    t("dnsRecPick") +
    "</option>" +
    (DB.hosts || [])
      .filter((x) => x.id !== selfId)
      .map((x) => {
        const ip = hostIpAuto(x.id);
        return `<option value="${x.id}"${sel === x.id ? " selected" : ""}>${ip ? esc(ip) + " · " : ""}${esc(x.label)}</option>`;
      })
      .join("");
  const dnsHead = `<div style="display:flex;gap:6px;font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:.03em;margin:0 0 4px">
      <span style="flex:1 1 130px;min-width:130px">${t("dnsColName")}</span>${dnsAdv ? `<span style="width:78px">${t("dnsColType")}</span>` : ""}<span style="width:12px"></span><span style="width:150px">${t("dnsColTarget")}</span>${dnsAdv ? `<span style="width:58px">${t("dnsColTtl")}</span>` : ""}<span style="width:28px"></span></div>`;
  return `
      <div class="mfield"><label>${t("dnsRecLabel")}</label>
        ${records.length ? dnsHead : ""}
        <div id="mDnsList">${records
          .map(
            (
              r,
              i,
            ) => `<div style="display:flex;gap:6px;align-items:center;margin-bottom:4px;flex-wrap:wrap">
          <input class="mDnsName mono" data-ri="${i}" value="${esc(r.name)}" placeholder="${t("dnsRecNamePh")}" style="flex:1 1 130px;min-width:130px">
          ${dnsAdv ? `<select class="mDnsType" data-ri="${i}" style="width:78px"><option value="A"${dnsRecType(r) === "A" ? " selected" : ""}>A</option><option value="CNAME"${dnsRecType(r) === "CNAME" ? " selected" : ""}>CNAME</option><option value="MX"${dnsRecType(r) === "MX" ? " selected" : ""}>MX</option></select>` : ""}
          <span style="color:var(--muted)">→</span>
          ${
            dnsRecType(r) === "CNAME"
              ? `<input class="mDnsCname mono" data-ri="${i}" value="${esc(r.cname || "")}" placeholder="${t("dnsRecCnamePh")}" style="width:150px"${dnsAdv ? "" : ` title="${esc(t("dnsCnameAdvTitle"))}"`}>`
              : `<select class="mDnsHost" data-ri="${i}" style="width:150px">${dnsHostOpts(r.hostId)}</select>`
          }
          ${dnsAdv ? `<input class="mDnsTtl mono" data-ri="${i}" value="${dnsRecTtl(r)}" title="${esc(t("dnsRecTtlTitle"))}" style="width:58px;flex:none">` : ""}
          <button type="button" class="iconbtn mDnsDel" data-ri="${i}" title="${t("dnsRecDel")}" style="flex:none">×</button></div>`,
          )
          .join("")}</div>
        <button type="button" class="btn" id="mDnsAdd" style="margin-top:6px">+ ${t("dnsRecAdd")}</button>
        <button type="button" class="btn" id="mDnsFill" style="margin-top:6px;margin-left:6px" title="${esc(t("dnsFillHint"))}">${t("dnsFill")}</button>
        <div style="font-size:11px;color:var(--muted);margin-top:6px">${t("dnsRecHint")}${dnsAdv ? "" : " " + t("dnsSimpleMore")}</div></div>`;
}
function dnsRecEditorWire(records, selfId, redraw) {
  modalBox.querySelectorAll(".mDnsName").forEach(
    (inp) =>
      (inp.oninput = () => {
        const r = records[+inp.getAttribute("data-ri")];
        if (r) r.name = inp.value;
      }),
  );
  modalBox.querySelectorAll(".mDnsHost").forEach(
    (s) =>
      (s.onchange = () => {
        const r = records[+s.getAttribute("data-ri")];
        if (r) r.hostId = s.value;
      }),
  );
  modalBox.querySelectorAll(".mDnsCname").forEach(
    (inp) =>
      (inp.oninput = () => {
        const r = records[+inp.getAttribute("data-ri")];
        if (r) r.cname = inp.value;
      }),
  );
  modalBox.querySelectorAll(".mDnsTtl").forEach(
    (inp) =>
      (inp.oninput = () => {
        const r = records[+inp.getAttribute("data-ri")];
        if (r) {
          const n = parseInt(inp.value, 10);
          r.ttl = isFinite(n) && n > 0 ? n : DNS_TTL_DEF;
        }
      }),
  );
  modalBox.querySelectorAll(".mDnsType").forEach(
    (s) =>
      (s.onchange = () => {
        const r = records[+s.getAttribute("data-ri")];
        if (!r) return;
        r.type = s.value === "CNAME" || s.value === "MX" ? s.value : "A";
        if (r.type === "CNAME") {
          delete r.hostId;
          if (typeof r.cname !== "string") r.cname = "";
        } else {
          delete r.cname;
          if (!r.hostId) r.hostId = "";
        }
        redraw();
      }),
  );
  modalBox.querySelectorAll(".mDnsDel").forEach(
    (b) =>
      (b.onclick = () => {
        records.splice(+b.getAttribute("data-ri"), 1);
        redraw();
      }),
  );
  if ($("mDnsAdd"))
    $("mDnsAdd").onclick = () => {
      records.push({
        id: uid("dr"),
        name: "",
        type: "A",
        hostId: "",
        ttl: DNS_TTL_DEF,
      });
      redraw();
    };

  if ($("mDnsFill"))
    $("mDnsFill").onclick = () => {
      let added = 0;
      (DB.hosts || []).forEach((x) => {
        if (x.id === selfId) return;
        hostServedNames(x).forEach((nm) => {
          if (
            records.some(
              (r) => dnsRecType(r) !== "MX" && dnsNorm(r.name) === dnsNorm(nm),
            )
          )
            return;
          records.push({
            id: uid("dr"),
            name: nm,
            type: "A",
            hostId: x.id,
            ttl: DNS_TTL_DEF,
          });
          added++;
        });
        (x.mailDomains || []).forEach((d) => {
          const dn = (d || "").trim();
          if (!dn) return;
          if (
            records.some(
              (r) => dnsRecType(r) === "MX" && dnsNorm(r.name) === dnsNorm(dn),
            )
          )
            return;
          records.push({
            id: uid("dr"),
            name: dn,
            type: "MX",
            hostId: x.id,
            ttl: DNS_TTL_DEF,
          });
          added++;
        });
      });
      setStatus(added ? tf("dnsFillDone", added) : t("dnsFillNone"));
      redraw();
    };
}

function dnsRecSaveClean(records) {
  return (records || [])
    .filter((r) => {
      if (!(r.name || "").trim()) return false;
      return dnsRecType(r) === "CNAME"
        ? !!(r.cname || "").trim()
        : !!(r.hostId && getNode(r.hostId));
    })
    .map((r) => {
      const o = {
        id: r.id,
        name: r.name.trim(),
        type: dnsRecType(r),
        ttl: dnsRecTtl(r),
      };
      if (o.type === "CNAME") o.cname = r.cname.trim();
      else o.hostId = r.hostId;
      return o;
    });
}

function devDnsPaneHtml(work, selfId) {
  const role =
    work.dnsRole === "forwarder" || work.dnsRole === "server"
      ? work.dnsRole
      : "";
  const upOpts =
    '<option value="">' +
    t("devDnsUpstreamNone") +
    "</option>" +
    dnsNodeList()
      .filter((n) => n.id !== selfId && dnsRoleOf(n.id) !== "forwarder")
      .map(
        (n) =>
          `<option value="${n.id}"${work.dnsUpstreamId === n.id ? " selected" : ""}>${esc(n.label)}</option>`,
      )
      .join("");
  return `<div style="font-size:11px;color:var(--muted);margin:0 0 10px">${t("devDnsIntro")}</div>
    <div class="mfield"><label>${t("devDnsRoleLabel")}</label>
      <select id="mDevDnsRole"><option value=""${!role ? " selected" : ""}>${t("devDnsRoleOff")}</option><option value="forwarder"${role === "forwarder" ? " selected" : ""}>${t("devDnsRoleFwd")}</option><option value="server"${role === "server" ? " selected" : ""}>${t("devDnsRoleSrv")}</option></select></div>
    ${
      role === "forwarder"
        ? `<div class="mfield"><label>${t("devDnsUpstreamLabel")}</label><select id="mDevDnsUp">${upOpts}</select>
      <div style="font-size:11px;color:var(--muted);margin-top:5px">${t("devDnsUpstreamHint")}</div></div>`
        : ""
    }
    ${
      role === "server"
        ? dnsRecEditorHtml(work.dnsRecords, selfId) +
          `<label class="toggle-row" style="margin:0 0 4px"><input type="checkbox" id="mDevDnsFwd"${work.dnsForward !== false ? " checked" : ""}><span>${t("dnsFwdLabel")}</span></label>
      <div style="font-size:11px;color:var(--muted);margin:0 0 12px">${t("dnsFwdHint")}</div>`
        : ""
    }`;
}
function devDnsPaneWire(work, selfId, redraw) {
  const rs = $("mDevDnsRole");
  if (rs)
    rs.onchange = (e) => {
      work.dnsRole = e.target.value;
      redraw();
    };
  const us = $("mDevDnsUp");
  if (us)
    us.onchange = (e) => {
      work.dnsUpstreamId = e.target.value || null;
    };
  const fw = $("mDevDnsFwd");
  if (fw)
    fw.onchange = () => {
      work.dnsForward = fw.checked;
    };
  if (work.dnsRole === "server")
    dnsRecEditorWire(work.dnsRecords, selfId, redraw);
}

function devDnsWorkInit(work) {
  work.dnsRole =
    work.dnsRole === "forwarder" || work.dnsRole === "server"
      ? work.dnsRole
      : "";
  work.dnsRecords = dnsRecordsOf(work).map((r) => ({
    id: r.id || uid("dr"),
    name: r.name || "",
    type: dnsRecType(r),
    hostId: r.hostId || "",
    cname: r.cname || "",
    ttl: dnsRecTtl(r),
  }));
  if (work.dnsForward === undefined) work.dnsForward = true;
}
function devDnsSave(d, work) {
  const role =
    work.dnsRole === "forwarder" || work.dnsRole === "server"
      ? work.dnsRole
      : "";
  if (role) d.dnsRole = role;
  else delete d.dnsRole;
  if (
    role === "forwarder" &&
    work.dnsUpstreamId &&
    work.dnsUpstreamId !== d.id &&
    isDnsNode(work.dnsUpstreamId) &&
    dnsRoleOf(work.dnsUpstreamId) !== "forwarder"
  )
    d.dnsUpstreamId = work.dnsUpstreamId;
  else delete d.dnsUpstreamId;
  if (role === "server") {
    d.dnsRecords = dnsRecSaveClean(work.dnsRecords);
    d.dnsForward = work.dnsForward !== false;
  } else {
    delete d.dnsRecords;
    delete d.dnsForward;
  }
}

const DHCP_SCOPE_DEF = "*";
function devDhcpWorkInit(work) {
  work.dhcpRole = work.dhcpRole === "server" ? "server" : "";
  const rows = [],
    defResv = Array.isArray(work.dhcpReservations)
      ? work.dhcpReservations.slice()
      : [];
  if (
    (work.dhcpStart || "").trim() ||
    (work.dhcpEnd || "").trim() ||
    defResv.length
  )
    rows.push({
      segId: DHCP_SCOPE_DEF,
      start: work.dhcpStart || "",
      end: work.dhcpEnd || "",
      reservations: defResv,
    });
  (Array.isArray(work.dhcpScopes) ? work.dhcpScopes : []).forEach((sc) => {
    if (sc)
      rows.push({
        segId: sc.segId || "",
        start: sc.start || "",
        end: sc.end || "",
        reservations: Array.isArray(sc.reservations)
          ? sc.reservations.slice()
          : [],
      });
  });
  work.dhcpScopes = rows;
}
function devDhcpSyncResv(work) {
  (work.dhcpScopes || []).forEach((sc, i) => {
    if ($("mScResv" + i)) sc.reservations = readDhcpResv("mScResv" + i);
  });
}
function devDhcpPaneHtml(work) {
  const on = work.dhcpRole === "server";
  const segOpts = (sel, i) => {
    const used = work.dhcpScopes
      .filter((x, j) => j !== i && x.segId)
      .map((x) => x.segId);
    const opt = (v, txt) => {
      const dup = v !== sel && used.indexOf(v) >= 0;
      return `<option value="${v}"${v === sel ? " selected" : ""}${dup ? " disabled" : ""}>${esc(txt)}${dup ? " " + esc(t("dhcpScopeUsedOpt")) : ""}</option>`;
    };
    return (
      '<option value="">' +
      esc(t("dhcpScopeSegPick")) +
      "</option>" +
      opt(DHCP_SCOPE_DEF, t("dhcpScopeDefaultOpt")) +
      DB.segments
        .filter((s) => !s.isInternet)
        .map((s) => opt(s.id, s.name + (s.subnet ? " · " + s.subnet : "")))
        .join("")
    );
  };
  const scopes = work.dhcpScopes
    .map(
      (
        sc,
        i,
      ) => `<div class="mScopeRow" style="border:1px solid var(--line2);border-radius:9px;padding:8px;margin-bottom:8px">
      <div style="display:flex;gap:6px;align-items:center;margin-bottom:6px"><select class="mScopeSeg" data-si="${i}" style="flex:1">${segOpts(sc.segId, i)}</select><button type="button" class="iconbtn mScopeDel" data-si="${i}" title="${"Remove scope"}">×</button></div>
      <div style="display:flex;gap:6px;align-items:center"><input class="mScopeStart mono" data-si="${i}" value="${esc(sc.start || "")}" placeholder="${t("dhcpFromPh")}" style="width:130px"><span style="color:var(--muted)">–</span><input class="mScopeEnd mono" data-si="${i}" value="${esc(sc.end || "")}" placeholder="${t("dhcpToPh")}" style="width:130px"></div>
      <div style="margin-top:8px"><label style="font-size:11px;color:var(--muted);font-weight:600;display:block;margin-bottom:4px">${"Reservations (MAC → IP)"}</label><div id="mScResv${i}"></div><button type="button" class="btn" id="mScResvAdd${i}" style="margin-top:4px">+ ${"Add reservation"}</button></div>
    </div>`,
    )
    .join("");
  return `<div style="font-size:11px;color:var(--muted);margin:0 0 10px">${t("devDhcpIntro")}</div>
    <label class="toggle-row" style="margin:0 0 10px"><input type="checkbox" id="mDevDhcp"${on ? " checked" : ""}><span>${t("devDhcpRoleLabel")}</span></label>
    ${
      on
        ? `<div class="mfield" style="margin-bottom:6px"><label>${t("dhcpScopesLabel")}</label>
      <div style="font-size:11px;color:var(--muted);margin:0 0 8px">${t("dhcpScopesHint")}</div>
      <div id="mDevScopes">${scopes || `<div style="font-size:11px;color:var(--muted);margin:0 0 8px">${t("dhcpScopeEmptyHint")}</div>`}</div>
      <button type="button" class="btn" id="mDevScopeAdd">+ ${t("dhcpScopeAdd")}</button>
      ${scopes ? `<div style="font-size:11px;color:var(--muted);margin-top:8px">${t("dhcpRangeHint")}</div>` : ""}</div>`
        : ""
    }`;
}
function devDhcpPaneWire(work, redraw) {
  const cb = $("mDevDhcp");
  if (cb)
    cb.onchange = (e) => {
      devDhcpSyncResv(work);
      work.dhcpRole = e.target.checked ? "server" : "";
      redraw();
    };
  if (work.dhcpRole === "server") {
    modalBox.querySelectorAll(".mScopeSeg").forEach(
      (s) =>
        (s.onchange = () => {
          devDhcpSyncResv(work);
          const sc = work.dhcpScopes[+s.getAttribute("data-si")];
          if (sc) sc.segId = s.value;
          redraw();
        }),
    );
    modalBox.querySelectorAll(".mScopeStart").forEach(
      (inp) =>
        (inp.oninput = () => {
          const sc = work.dhcpScopes[+inp.getAttribute("data-si")];
          if (sc) sc.start = inp.value.trim();
        }),
    );
    modalBox.querySelectorAll(".mScopeEnd").forEach(
      (inp) =>
        (inp.oninput = () => {
          const sc = work.dhcpScopes[+inp.getAttribute("data-si")];
          if (sc) sc.end = inp.value.trim();
        }),
    );
    modalBox.querySelectorAll(".mScopeDel").forEach(
      (b) =>
        (b.onclick = () => {
          devDhcpSyncResv(work);
          work.dhcpScopes.splice(+b.getAttribute("data-si"), 1);
          redraw();
        }),
    );
    work.dhcpScopes.forEach((sc, i) =>
      wireDhcpResv("mScResv" + i, "mScResvAdd" + i, sc.reservations),
    );
    if ($("mDevScopeAdd"))
      $("mDevScopeAdd").onclick = () => {
        devDhcpSyncResv(work);
        work.dhcpScopes.push({
          segId: "",
          start: "",
          end: "",
          reservations: [],
        });
        redraw();
      };
  }
}
function devDhcpSave(d, work) {
  if (work.dhcpRole === "server") {
    d.dhcpRole = "server";
    devDhcpSyncResv(work);
    const rows = (work.dhcpScopes || []).map((sc) => ({
      segId: sc.segId || "",
      start: (sc.start || "").trim(),
      end: (sc.end || "").trim(),
      reservations: (Array.isArray(sc.reservations)
        ? sc.reservations
        : []
      ).filter((r) => r && r.mac && r.ip),
    }));
    const def = rows.find((r) => r.segId === DHCP_SCOPE_DEF);
    if (def && def.start) d.dhcpStart = def.start;
    else delete d.dhcpStart;
    if (def && def.end) d.dhcpEnd = def.end;
    else delete d.dhcpEnd;
    if (def && def.reservations.length) d.dhcpReservations = def.reservations;
    else delete d.dhcpReservations;

    const seen = new Set(),
      scopes = [];
    rows.forEach((r) => {
      if (
        r.segId === DHCP_SCOPE_DEF ||
        !r.segId ||
        !getNode(r.segId) ||
        seen.has(r.segId)
      )
        return;
      seen.add(r.segId);
      const o = { segId: r.segId };
      if (r.start) o.start = r.start;
      if (r.end) o.end = r.end;
      if (r.reservations.length) o.reservations = r.reservations;
      scopes.push(o);
    });
    if (scopes.length) d.dhcpScopes = scopes;
    else delete d.dhcpScopes;
  } else {
    delete d.dhcpRole;
    delete d.dhcpStart;
    delete d.dhcpEnd;
    delete d.dhcpReservations;
    delete d.dhcpScopes;
  }
}
function openHostModal(h, isNew) {
  const COMMON = [
    "http",
    "https",
    "ssh",
    "rdp",
    "smb",
    "dns",
    "ftp",
    "mssql",
    "mysql",
    "postgres",
    "ldap",
    "ldaps",
    "smtp",
    "radius",
    "syslog",
  ];
  let kind = h.kind || "pc";
  let services = (h.services || []).slice();
  let fqdn = h.fqdn || "";

  let dnsRecords = dnsRecordsOf(h).map((r) => ({
    id: r.id || uid("dr"),
    name: r.name || "",
    type: dnsRecType(r),
    hostId: r.hostId || "",
    cname: r.cname || "",
    ttl: dnsRecTtl(r),
  }));
  let dnsForward = h.dnsForward !== false;
  let webNames = Array.isArray(h.webNames) ? h.webNames.slice() : [];
  let mailDomains = Array.isArray(h.mailDomains) ? h.mailDomains.slice() : [];
  let segSel = h.segId || null;
  let vpnSplit = !!h.vpnSplit;

  let wifi = h.wifi
    ? { apId: h.wifi.apId, ssid: h.wifi.ssid, segId: undefined }
    : null;
  if (wifi && !wifiAssocLive(h)) wifi = null;
  if (wifi) {
    const _ap = getNode(wifi.apId);
    const _ss =
      _ap &&
      apEffSsids(_ap).find(
        (s) =>
          (s.name || "").trim() === (wifi.ssid || "").trim() && s.on !== false,
      );
    if (_ss) wifi.segId = _ss.segId;
  }
  let wifiClientOn = h.wifiClient != null ? h.wifiClient : !!h.wifi;
  if (wifi) wifiClientOn = true;
  let wifiSel = null;
  let wifiMsg = "";
  let hostTab = "conn";
  const showHostTab = (tab) => {
    hostTab = tab;
    modalBox.querySelectorAll("[data-fwtab]").forEach((b) => {
      const on = b.getAttribute("data-fwtab") === tab;
      b.classList.toggle("active", on);
      b.setAttribute("aria-selected", on ? "true" : "false");
    });
    modalBox.querySelectorAll("[data-fwpane]").forEach((p) => {
      p.style.display = p.getAttribute("data-fwpane") === tab ? "" : "none";
    });
  };
  const origLabel = h.label;
  let saved = false;
  modalCloseHook = () => {
    if (saved) return;
    if (isNew) {
      DB.hosts = DB.hosts.filter((x) => x.id !== h.id);
      if (selectedId === h.id) selectedId = null;
      saveDB();
      render();
      refreshAll();
    } else if (h.label !== origLabel) {
      h.label = origLabel;
      render();
    }
  };
  const segOpts = () =>
    DB.segments
      .filter((s) => !s.isInternet)
      .map(
        (s) =>
          `<option value="${s.id}"${segSel === s.id ? " selected" : ""}>${esc(s.name)}${s.subnet ? " (" + esc(s.subnet) + ")" : ""}</option>`,
      )
      .join("");
  const draw = () => {
    const aps = DB.devices.filter(
      (x) =>
        (x.type === "ap" || x.type === "router" || x.type === "firewall") &&
        x.wifiOn !== false &&
        apEffSsids(x).length,
    );
    const _wifiRaw = [];
    aps.forEach((ap) =>
      apEffSsids(ap).forEach((s) => {
        if (
          (s.name || "").trim() &&
          s.on !== false &&
          s.segId &&
          getNode(s.segId)
        )
          _wifiRaw.push({
            apId: ap.id,
            apLabel: ap.label,
            name: (s.name || "").trim(),
            segId: s.segId,
            pass: s.pass || "",
            sec: ssidSec(s),
            radiusId: s.radiusId || null,
          });
      }),
    );

    const _apDist = (ap) =>
      ap ? Math.hypot((ap.x || 0) - (h.x || 0), (ap.y || 0) - (h.y || 0)) : 1e9;
    const _byName = {};
    _wifiRaw.forEach((w) => {
      const e = _byName[w.name];
      if (!e) {
        _byName[w.name] = Object.assign({ count: 1 }, w);
      } else {
        e.count++;
        if (_apDist(getNode(w.apId)) < _apDist(getNode(e.apId))) {
          e.apId = w.apId;
          e.apLabel = w.apLabel;
          e.segId = w.segId;
          e.pass = w.pass;
          e.sec = w.sec;
          e.radiusId = w.radiusId;
        }
      }
    });
    const wifiList = Object.values(_byName);
    const segName = (sid) => {
      const sg = getNode(sid);
      return sg ? sg.name : "";
    };
    let wifiHtml =
      '<div class="mfield"><label>Wi-Fi</label>' +
      '<label class="toggle-row" style="margin:2px 0 7px"><input type="checkbox" id="mWifiClient"' +
      (wifiClientOn ? " checked" : "") +
      "><span>" +
      "Wi-Fi on" +
      "</span></label>";
    if (!wifiClientOn) {
      wifiHtml +=
        '<div style="font-size:11.5px;color:var(--muted)">' +
        "Wi-Fi is off. Turn it on and pick an available network." +
        "</div>";
    } else if (wifi) {
      const apN = (getNode(wifi.apId) || {}).label || "?";
      wifiHtml +=
        '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap"><span style="color:var(--cyan);font-weight:600;font-size:12.5px">' +
        "Connected" +
        ": " +
        esc(wifi.ssid) +
        " · " +
        esc(apN) +
        "</span>" +
        '<button class="btn" id="mWifiOff" style="margin-left:auto">' +
        "Disconnect" +
        "</button></div>";
    } else if (wifiList.length) {
      wifiHtml +=
        '<div style="font-size:11px;color:var(--muted);margin-bottom:5px">' +
        "Available networks (click to connect):" +
        "</div>" +
        wifiList
          .map(
            (w, i) =>
              '<button type="button" class="btn wifi-net" data-i="' +
              i +
              '" style="display:flex;width:100%;box-sizing:border-box;justify-content:space-between;align-items:center;gap:8px;margin-bottom:5px;text-align:left">' +
              '<span style="display:flex;align-items:center;gap:6px;min-width:0"><b style="overflow:hidden;text-overflow:ellipsis">' +
              esc(w.name) +
              '</b><span style="color:var(--muted);font-size:10px;white-space:nowrap">· ' +
              esc(w.apLabel) +
              (w.count > 1 ? " (" + "nearest of" + " " + w.count + ")" : "") +
              (w.segId ? " → " + esc(segName(w.segId)) : "") +
              "</span></span>" +
              '<span style="flex:0 0 auto;font-size:10px;color:' +
              (w.sec === "open" ? "var(--amber)" : "var(--muted)") +
              '">' +
              (w.sec === "open"
                ? ssidSecLabel("open")
                : icon("lock") + " " + ssidSecLabel(w.sec)) +
              "</span></button>",
          )
          .join("");
      if (wifiSel != null && wifiList[wifiSel]) {
        const w = wifiList[wifiSel];
        wifiHtml +=
          '<div style="display:flex;gap:6px;margin-top:2px"><input id="mWifiPass" type="text" placeholder="' +
          "password for " +
          esc(w.name) +
          '" style="flex:1;min-width:0"><button class="btn primary" id="mWifiOn">' +
          "Connect" +
          "</button></div>";
      }
      if (wifiMsg)
        wifiHtml +=
          '<div style="font-size:11.5px;margin-top:5px;color:' +
          (wifiMsg[0] === "✓" ? "var(--green)" : "var(--red)") +
          '">' +
          esc(wifiMsg) +
          "</div>";
    } else {
      wifiHtml +=
        '<div style="font-size:11.5px;color:var(--muted);line-height:1.5">' +
        "Searching… no network found. First turn on Wi-Fi and add an SSID on a <b>router</b>, <b>firewall</b>, or <b>AP</b>." +
        "</div>";
    }
    wifiHtml += "</div>";
    const isVpn = segSel && segVpnFirewall(segSel);
    const commonPorts = COMMON.map((k) => TRAFFIC[k].port);
    const chips = COMMON.map((k) => {
      const t = TRAFFIC[k];
      const on = services.indexOf(t.port) >= 0;
      return `<button type="button" class="svc-chip${on ? " on" : ""}" data-port="${t.port}">${esc(t.label)}</button>`;
    }).join("");

    const extraChips = services
      .filter((p) => commonPorts.indexOf(p) < 0)
      .sort((a, b) => a - b)
      .map(
        (p) =>
          `<button type="button" class="svc-chip on" data-port="${p}" title="${t("hostModalCustomPort")}">${p}</button>`,
      )
      .join("");
    const kindOpts = HOST_KINDS.map(
      (k) =>
        `<option value="${k.id}"${kind === k.id ? " selected" : ""}>${esc(k.name)}</option>`,
    ).join("");

    let advNetHtml = "";
    if (isAdvanced()) {
      const segNode = segSel ? getNode(segSel) : null;
      const sub = segNode && segNode.subnet ? segNode.subnet : "";
      const autoIp = hostIpAuto(h.id) || "";
      const defGw = subnetGwIp(segSel) || "";
      const gwWrong = !!(h.gw && h.gw.trim() && defGw && h.gw.trim() !== defGw);
      const ipBad = !!(h.ip && h.ip.trim() && !hostIpInSubnet(h.id));
      const ipConf = hostIpConflict(h.id);
      const dhcpOff = !!(segNode && segNode.dhcp === false);
      const hostNoIp = hostIpAuto(h.id) === null;
      const dhcpRng = segNode && !dhcpOff ? segDhcpRange(segSel) : undefined;
      const poolNull = !!(segNode && !dhcpOff && hostNoIp && dhcpRng === null);
      const dhcpExhausted = !!(
        segNode &&
        !dhcpOff &&
        hostNoIp &&
        dhcpRng != null
      );
      const noIp =
        (dhcpOff && !(h.ip && h.ip.trim())) || poolNull || dhcpExhausted;
      advNetHtml =
        '<div class="mfield"><label>' +
        "Network settings (advanced)" +
        "</label>" +
        (sub
          ? '<div style="font-size:11px;color:var(--muted);margin-bottom:6px">' +
            "Subnet" +
            ": " +
            esc(sub) +
            (defGw
              ? " · " + "gateway usually" + " " + esc(defGw)
              : "") +
            "</div>"
          : '<div style="font-size:11px;color:var(--muted);margin-bottom:6px">' +
            "No network / subnet." +
            "</div>") +
        (segNode
          ? '<div style="font-size:11px;margin-bottom:6px;color:' +
            (noIp ? "var(--amber)" : "var(--muted)") +
            '">' +
            (dhcpOff
              ? "DHCP is off on this network – enter an IP manually, otherwise the host won't connect."
              : poolNull
                ? t("hDhcpNoPool")
                : dhcpExhausted
                  ? t("hDhcpExhausted")
                  : "IP is assigned automatically from DHCP (or enter it manually).") +
            "</div>"
          : "") +
        '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
        '<div style="flex:1;min-width:130px"><div style="font-size:10.5px;color:var(--muted);margin-bottom:3px">' +
        "IP adresa" +
        '</div><input id="mIp" aria-label="' +
        esc("IP address") +
        '" value="' +
        esc(h.ip || "") +
        '" placeholder="' +
        esc(autoIp || "automatic") +
        '"></div>' +
        '<div style="flex:1;min-width:130px"><div style="font-size:10.5px;color:var(--muted);margin-bottom:3px">' +
        "Default gateway" +
        '</div><input id="mGw" aria-label="' +
        esc("Default gateway") +
        '" value="' +
        esc(h.gw || "") +
        '" placeholder="' +
        esc(defGw || "automatic") +
        '"></div>' +
        "</div>" +
        '<div style="margin-top:8px"><div style="font-size:10.5px;color:var(--muted);margin-bottom:3px">' +
        "MAC address" +
        '</div><input id="mMac" class="mono" aria-label="' +
        esc("MAC address") +
        '" value="' +
        esc(h.mac || "") +
        '" placeholder="' +
        esc(hostMac(h.id) || "02:00:00:00:00:00") +
        '" style="width:100%;box-sizing:border-box"></div>' +
        '<div style="font-size:11px;color:var(--muted);margin-top:6px">' +
        "If you leave it empty, an automatic value is used." +
        "</div>" +
        (() => {
          const dhost = (sel) =>
            '<option value="">' +
            esc("default: from network") +
            "</option>" +
            dnsNodeList()
              .map(
                (x) =>
                  `<option value="${x.id}"${sel === x.id ? " selected" : ""}>${esc(x.label)}</option>`,
              )
              .join("");
          return (
            '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px">' +
            '<div style="flex:1;min-width:130px"><div style="font-size:10.5px;color:var(--muted);margin-bottom:3px">' +
            "DNS server" +
            '</div><select id="mHostDns" aria-label="' +
            esc("DNS server") +
            '" style="width:100%">' +
            dhost(h.dnsId) +
            "</select></div>" +
            '<div style="flex:1;min-width:130px"><div style="font-size:10.5px;color:var(--muted);margin-bottom:3px">' +
            "Backup DNS" +
            '</div><select id="mHostDns2" aria-label="' +
            esc("Backup DNS") +
            '" style="width:100%">' +
            dhost(h.dnsId2) +
            "</select></div>" +
            "</div>"
          );
        })() +
        (gwWrong
          ? '<div style="font-size:11px;color:var(--amber);margin-top:6px">' +
            "Warning: this gateway is not in subnet " +
            esc(sub) +
            " – the host won't get outside its network." +
            "</div>"
          : "") +
        (ipBad
          ? '<div style="font-size:11px;color:var(--amber);margin-top:6px">' +
            "Warning: this IP is not in subnet " +
            esc(sub) +
            " (wrong IP or mask) – the host won't communicate." +
            "</div>"
          : "") +
        (ipConf
          ? '<div style="font-size:11px;color:var(--amber);margin-top:6px">' +
            "Warning: another host on the same network has the same IP address (IP conflict)." +
            "</div>"
          : "") +
        "</div>";
    } else {
      const ipv = hostIpAuto(h.id),
        macv = hostMac(h.id);
      const ipManual = !!(h.ip && h.ip.trim()),
        macManual = !!(h.mac && h.mac.trim());
      const autoTag =
        ' <span style="color:var(--muted);font-size:11px">' +
        t("hostAutoTag") +
        "</span>";

      const gwManual = !!(h.gw && h.gw.trim());
      const manualBroken =
        (ipManual && (!hostIpInSubnet(h.id) || hostIpConflict(h.id))) ||
        (gwManual && !hostGwOk(h.id));
      advNetHtml =
        '<div class="mfield"><label>' +
        t("hostNetInfoLabel") +
        "</label>" +
        '<div style="font-size:12px;line-height:1.8">' +
        '<span style="color:var(--muted)">' +
        t("hostIpLabel") +
        ':</span> <span class="mono">' +
        (ipv ? esc(ipv) : "—") +
        "</span>" +
        (ipv && !ipManual ? autoTag : "") +
        "<br>" +
        '<span style="color:var(--muted)">' +
        t("hostMacLabel") +
        ':</span> <span class="mono">' +
        (macv ? esc(macv) : "—") +
        "</span>" +
        (macv && !macManual ? autoTag : "") +
        "</div>" +
        (ipManual || gwManual
          ? '<div style="font-size:11.5px;color:var(--muted);margin-top:6px">' +
            t(manualBroken ? "hostManualBrokenNote" : "hostManualNote") +
            ' <button class="btn" id="mIpReset" style="margin-left:6px">' +
            t("hostIpResetBtn") +
            "</button></div>"
          : "") +
        "</div>";
    }

    const dnsAdv = isAdvanced();
    const dnsEditorHtml =
      services.indexOf(53) < 0
        ? ""
        : dnsRecEditorHtml(dnsRecords, h.id) +
          (dnsAdv
            ? `<label class="toggle-row" style="margin:0 0 4px"><input type="checkbox" id="mDnsFwd"${dnsForward ? " checked" : ""}><span>${t("dnsFwdLabel")}</span></label>
        <div style="font-size:11px;color:var(--muted);margin:0 0 12px">${t("dnsFwdHint")}</div>`
            : "");

    const hasWeb = services.indexOf(80) >= 0 || services.indexOf(443) >= 0;
    const webEditorHtml = !hasWeb
      ? ""
      : `
        <div class="mfield"><label>${t("webAddrLabel")}</label>
          <div id="mWebList">${webNames
            .map(
              (
                n,
                i,
              ) => `<div style="display:flex;gap:6px;align-items:center;margin-bottom:4px">
            <input class="mWebName mono" data-wi="${i}" value="${esc(n)}" placeholder="${t("webAddrPh")}" style="flex:1;min-width:0">
            <button type="button" class="iconbtn mWebDel" data-wi="${i}" title="${t("webAddrDel")}" style="flex:none">×</button></div>`,
            )
            .join("")}</div>
          <button type="button" class="btn" id="mWebAdd" style="margin-top:6px">+ ${t("webAddrAdd")}</button>
          <div style="font-size:11px;color:var(--muted);margin-top:6px">${t("webAddrHint")}</div></div>`;

    const hasMail = services.indexOf(25) >= 0 || services.indexOf(143) >= 0;
    const mailEditorHtml = !hasMail
      ? ""
      : `
        <div class="mfield"><label>${t("mailDomLabel")}</label>
          <div id="mMailList">${mailDomains
            .map(
              (
                n,
                i,
              ) => `<div style="display:flex;gap:6px;align-items:center;margin-bottom:4px">
            <input class="mMailName mono" data-mi="${i}" value="${esc(n)}" placeholder="${t("mailDomPh")}" style="flex:1;min-width:0">
            <button type="button" class="iconbtn mMailDel" data-mi="${i}" title="${t("mailDomDel")}" style="flex:none">×</button></div>`,
            )
            .join("")}</div>
          <button type="button" class="btn" id="mMailAdd" style="margin-top:6px">+ ${t("mailDomAdd")}</button>
          <div style="font-size:11px;color:var(--muted);margin-top:6px">${t("mailDomHint")}</div></div>`;

    const dcAdv = isAdvanced(),
      dcEntries = dnsClientEntries(h.id);

    const dcSeg = segSel ? getNode(segSel) : null;
    const dcSrv = (dcSeg ? dnsServersFor(h.id, dcSeg) : []).map(
      (id) => (getNode(id) || {}).label || id,
    );
    const dcShow = dcSrv.length > 0 || dcEntries.length > 0;

    const dcWho =
      dcAdv && dcSrv.length > 1
        ? tf("dcacheAsks2", esc(dcSrv[0]), esc(dcSrv[1]))
        : dcSrv.length
          ? tf("dcacheAsks", esc(dcSrv[0]))
          : "";
    const dcacheHtml = `<div style="font-size:11px;color:var(--muted);margin:0 0 10px">${t("dcachePaneIntro")}</div>
        ${dcWho ? `<div style="font-size:11.5px;color:var(--muted);margin:0 0 10px;padding:7px 9px;border:1px solid var(--line2);border-radius:8px">${dcWho}</div>` : ""}
        ${
          dcEntries.length
            ? `<div style="display:flex;gap:6px;font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:.03em;margin:0 0 4px"><span style="flex:1">${t("dnsColName")}</span><span style="flex:1">${t("dcacheColAnswer")}</span>${dcAdv ? `<span style="width:64px;text-align:right">${t("dnsColTtl")}</span>` : ""}</div>
        ${dcEntries
          .map(
            (
              e,
            ) => `<div style="display:flex;gap:6px;align-items:center;margin-bottom:3px;font-size:12px">
          <span class="mono" style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis">${esc(e.name)}</span>
          <span style="flex:1;min-width:0;color:${e.neg ? "var(--red)" : "var(--txt)"}">${e.neg ? t("dcacheNeg") : esc((e.ip ? e.ip + " · " : "") + e.target)}</span>
          ${dcAdv ? `<span class="mono" style="width:64px;text-align:right;color:var(--muted)">${e.ttlLeft}s</span>` : ""}</div>`,
          )
          .join("")}`
            : `<div style="font-size:12px;color:var(--muted);margin:6px 0">${t("dcacheEmpty")}</div>`
        }
        <button type="button" class="btn" id="mDcFlush" style="margin-top:8px"${dcEntries.length ? "" : " disabled"}>${t("dcacheFlush")}</button>`;
    modalBox.innerHTML = `
      <h2>${icon("monitor", "ico-a")}${esc(hostKind(kind).name)}: ${esc(h.label)}</h2>
      <div class="mfield"><label>${t("hostModalTitle")}</label><input id="mName" value="${esc(h.label)}"></div>
      <div class="subtabs"><button type="button" data-fwtab="conn">${"Connection"}</button><button type="button" data-fwtab="role">${"Type and services"}</button>${hasWeb ? `<button type="button" data-fwtab="web">${icon("link", "ico-a")}Web</button>` : ""}${hasMail ? `<button type="button" data-fwtab="mail">${icon("link", "ico-a")}Mail</button>` : ""}${services.indexOf(53) >= 0 ? `<button type="button" data-fwtab="dns">${icon("dns", "ico-a")}DNS</button>` : ""}${dcShow ? `<button type="button" data-fwtab="dcache">${t("dcacheTab")}</button>` : ""}</div>
      <div data-fwpane="conn">
        <div class="mfield"><label>${t("hostModalSeg")}</label><select id="mSeg"${wifi ? " disabled" : ""}>${DB.segments.some((s) => !s.isInternet) ? '<option value="">' + t("hostModalNoNet") + "</option>" + segOpts() : '<option value="">' + t("hostModalNoNetEmpty") + "</option>"}</select>${wifi ? '<div style="font-size:11px;color:var(--muted);margin-top:4px">' + "The connected Wi-Fi (SSID) determines the network." + "</div>" : ""}</div>
        ${wifiHtml}
        ${advNetHtml}
        ${arpTableHtml(h.id)}
        ${portStripHtml(h)}
        ${
          isVpn
            ? `<div class="mfield"><label>${t("hostModalVpnLabel")}</label>
          <select id="mVpnTun"><option value="full"${!vpnSplit ? " selected" : ""}>${t("hostModalVpnFull")}</option><option value="split"${vpnSplit ? " selected" : ""}>${t("hostModalVpnSplit")}</option></select>
          <div style="font-size:11px;color:var(--muted);margin-top:5px">${t("hostModalVpnHint")}</div></div>`
            : ""
        }
      </div>
      <div data-fwpane="role">
        <div class="mfield"><label>${t("hostModalKind")}</label><select id="mKind">${kindOpts}</select></div>
        <div class="mfield"><label>${t("dnsFqdnLabel")}</label><input id="mFqdn" class="mono" value="${esc(fqdn)}" placeholder="${t("dnsFqdnPh")}">
          <div style="font-size:11px;color:var(--muted);margin-top:6px">${t("dnsFqdnHint")}</div></div>
        <div class="mfield"><label>${t("hostModalPorts")}</label><div class="svc-row">${chips}${extraChips}</div>
          <div style="display:flex;gap:8px;margin-top:8px;align-items:center"><input id="mCustomPort" type="number" min="1" max="65535" placeholder="${t("hostModalCustomPort")}" style="flex:1"><button class="btn" id="mAddPort">${t("hostModalAddPort")}</button></div>
          <div style="font-size:11px;color:var(--muted);margin-top:6px">${t("hostModalPortHint")}</div></div>
      </div>
      <div data-fwpane="web" style="display:none">${hasWeb ? `<div style="font-size:11px;color:var(--muted);margin:0 0 10px">${t("webPaneIntro")}</div>${webEditorHtml}` : ""}</div>
      <div data-fwpane="mail" style="display:none">${hasMail ? `<div style="font-size:11px;color:var(--muted);margin:0 0 10px">${t("mailPaneIntro")}</div>${mailEditorHtml}` : ""}</div>
      <div data-fwpane="dns" style="display:none">${services.indexOf(53) >= 0 ? `<div style="font-size:11px;color:var(--muted);margin:0 0 10px">${t("dnsPaneIntro")}</div>${dnsEditorHtml}` : ""}</div>
      ${dcShow ? `<div data-fwpane="dcache" style="display:none">${dcacheHtml}</div>` : ""}
      ${isAdvanced() ? `<label class="toggle-row" style="margin:2px 0 10px;font-size:12.5px" title="${t("hostNoCredsTitle")}"><input type="checkbox" id="mNoCreds"${h.noCreds ? " checked" : ""}><span>${t("hostNoCreds")}</span></label>` : ""}
      <div class="actions"><button class="btn" id="mCancel">${t("cancel")}</button><button class="btn primary" id="mSave">${t("save")}</button></div>`;
    modalBox
      .querySelectorAll("[data-fwtab]")
      .forEach(
        (b) => (b.onclick = () => showHostTab(b.getAttribute("data-fwtab"))),
      );
    wirePortStrip(h);
    $("mName").oninput = (e) => (h.label = e.target.value);
    if ($("mSeg"))
      $("mSeg").onchange = (e) => {
        segSel = e.target.value || null;
        draw();
      };
    if ($("mVpnTun"))
      $("mVpnTun").onchange = (e) => (vpnSplit = e.target.value === "split");
    $("mKind").onchange = (e) => {
      const oldDef = hostKind(kind).svc || [];
      const wasDefault =
        services.length === 0 ||
        (services.length === oldDef.length &&
          services.every((p) => oldDef.indexOf(p) >= 0));
      kind = e.target.value;
      if (wasDefault) services = (hostKind(kind).svc || []).slice();

      const curName = ($("mName") ? $("mName").value : h.label) || "";
      if (isAutoHostLabel(curName)) h.label = nextHostLabel(kind);
      draw();
    };
    if ($("mFqdn"))
      $("mFqdn").oninput = (e) => {
        fqdn = e.target.value;
      };
    dnsRecEditorWire(dnsRecords, h.id, draw);
    if ($("mDnsFwd"))
      $("mDnsFwd").onchange = (e) => {
        dnsForward = e.target.checked;
      };
    modalBox.querySelectorAll(".mWebName").forEach(
      (inp) =>
        (inp.oninput = () => {
          const i = +inp.getAttribute("data-wi");
          if (i < webNames.length) webNames[i] = inp.value;
        }),
    );
    modalBox.querySelectorAll(".mWebDel").forEach(
      (b) =>
        (b.onclick = () => {
          webNames.splice(+b.getAttribute("data-wi"), 1);
          draw();
        }),
    );
    if ($("mWebAdd"))
      $("mWebAdd").onclick = () => {
        webNames.push("");
        draw();
      };
    modalBox.querySelectorAll(".mMailName").forEach(
      (inp) =>
        (inp.oninput = () => {
          const i = +inp.getAttribute("data-mi");
          if (i < mailDomains.length) mailDomains[i] = inp.value;
        }),
    );
    modalBox.querySelectorAll(".mMailDel").forEach(
      (b) =>
        (b.onclick = () => {
          mailDomains.splice(+b.getAttribute("data-mi"), 1);
          draw();
        }),
    );
    if ($("mMailAdd"))
      $("mMailAdd").onclick = () => {
        mailDomains.push("");
        draw();
      };
    if ($("mDcFlush"))
      $("mDcFlush").onclick = () => {
        dnsClientFlush(h.id);
        setStatus(t("dcacheFlushed"));
        draw();
      };
    if ($("mIpReset"))
      $("mIpReset").onclick = () => {
        delete h.ip;
        delete h.gw;
        saveDB();
        render();
        draw();
        setStatus(t("hostIpResetDone"));
      };
    modalBox.querySelectorAll(".svc-chip").forEach(
      (b) =>
        (b.onclick = () => {
          const p = +b.getAttribute("data-port");
          const i = services.indexOf(p);
          if (i >= 0) services.splice(i, 1);
          else services.push(p);
          draw();
        }),
    );
    if ($("mAddPort"))
      $("mAddPort").onclick = () => {
        const v = parseInt($("mCustomPort").value, 10);
        if (v >= 1 && v <= 65535 && services.indexOf(v) < 0) {
          services.push(v);
          draw();
        }
      };
    const mwc = $("mWifiClient");
    if (mwc)
      mwc.onchange = () => {
        wifiClientOn = mwc.checked;
        if (!wifiClientOn) wifi = null;
        wifiSel = null;
        wifiMsg = "";
        draw();
      };
    const doConn = (w, pw) => {
      if (w.sec === "ent" && !radiusReachable(w.segId, w.radiusId)) {
        wifiMsg =
          "✗ Authentication failed – the RADIUS server isn't responding (unreachable, port 1812 blocked, or not running).";
        draw();
        return;
      }
      if (w.sec !== "open" && w.sec !== "ent" && pw !== w.pass) {
        wifiMsg = "✗ Wrong password.";
        draw();
        return;
      }
      wifi = { apId: w.apId, ssid: w.name, segId: w.segId };
      segSel = w.segId || null;
      wifiSel = null;
      wifiMsg = "";
      draw();
    };
    modalBox.querySelectorAll(".wifi-net").forEach(
      (b) =>
        (b.onclick = () => {
          const w = wifiList[+b.getAttribute("data-i")];
          if (!w) return;
          if (w.sec !== "open" && w.sec !== "ent") {
            wifiSel = +b.getAttribute("data-i");
            wifiMsg = "";
            draw();
          } else doConn(w, "");
        }),
    );
    if ($("mWifiOn"))
      $("mWifiOn").onclick = () => {
        const w = wifiList[wifiSel];
        if (w) doConn(w, $("mWifiPass").value || "");
      };
    if ($("mWifiOff"))
      $("mWifiOff").onclick = () => {
        wifi = null;
        wifiMsg = "";
        wifiSel = null;
        draw();
      };
    $("mCancel").onclick = closeModal;
    $("mSave").onclick = () => {
      saved = true;
      h.label = ($("mName").value || "").trim() || h.label;
      if ($("mNoCreds")) {
        if ($("mNoCreds").checked) h.noCreds = true;
        else delete h.noCreds;
      }
      h.segId = $("mSeg").value || null;
      h.kind = kind;
      h.wifiClient = wifiClientOn;
      h.services = services.slice().sort((a, b) => a - b);
      h.vpnSplit = vpnSplit;
      const fq = (fqdn || "").trim();
      if (fq) h.fqdn = fq;
      else delete h.fqdn;
      if (services.indexOf(53) >= 0) {
        h.dnsRecords = dnsRecSaveClean(dnsRecords);
        h.dnsForward = dnsForward;
      } else {
        delete h.dnsRecords;
        delete h.dnsForward;
      }

      if (services.indexOf(80) >= 0 || services.indexOf(443) >= 0) {
        const wn = webNames.map((n) => (n || "").trim()).filter(Boolean);
        if (wn.length) h.webNames = wn;
        else delete h.webNames;
      } else delete h.webNames;
      if (services.indexOf(25) >= 0 || services.indexOf(143) >= 0) {
        const md = mailDomains.map((n) => (n || "").trim()).filter(Boolean);
        if (md.length) h.mailDomains = md;
        else delete h.mailDomains;
      } else delete h.mailDomains;
      if (isAdvanced()) {
        const ipv = ($("mIp") ? $("mIp").value : "").trim();
        const gwv = ($("mGw") ? $("mGw").value : "").trim();
        const macv = ($("mMac") ? $("mMac").value : "").trim();
        if (ipv) h.ip = ipv;
        else delete h.ip;
        if (gwv) h.gw = gwv;
        else delete h.gw;
        if (macv) h.mac = macv;
        else delete h.mac;

        const dns1 = $("mHostDns") ? $("mHostDns").value : "";
        const dns2 = $("mHostDns2") ? $("mHostDns2").value : "";
        if (dns1) h.dnsId = dns1;
        else delete h.dnsId;
        if (dns1 && dns2 && dns2 !== dns1) h.dnsId2 = dns2;
        else delete h.dnsId2;
      }

      if (wifi) {
        h.wifi = { apId: wifi.apId, ssid: wifi.ssid };
        if (wifi.segId != null) h.segId = wifi.segId;
        DB.links = DB.links.filter((l) => l.fromId !== h.id && l.toId !== h.id);
        if (getNode(wifi.apId))
          DB.links.push({ id: uid("l"), fromId: h.id, toId: wifi.apId });
      } else {
        if (h.wifi) {
          const apId = h.wifi.apId;
          DB.links = DB.links.filter((l) => {
            if (l.fromId !== h.id && l.toId !== h.id) return true;
            const o = getNode(l.fromId === h.id ? l.toId : l.fromId);
            return !(o && o.id === apId);
          });
        }
        h.wifi = null;
      }
      saveDB();
      render();
      refreshAll();
      closeModal();
      setStatus(t("stHostSaved"));
    };
    if (hostTab === "dns" && services.indexOf(53) < 0) hostTab = "role";
    if (
      hostTab === "web" &&
      services.indexOf(80) < 0 &&
      services.indexOf(443) < 0
    )
      hostTab = "role";
    if (
      hostTab === "mail" &&
      services.indexOf(25) < 0 &&
      services.indexOf(143) < 0
    )
      hostTab = "role";
    if (hostTab === "dcache" && !dcShow) hostTab = "conn";
    showHostTab(hostTab);
  };
  draw();
  modalBg.classList.add("show");
}

function openSegmentModal(seg, x, y) {
  const isNew = !seg;
  const cur = seg || {
    name: t("palNet"),
    subnet: "10.0.0.0/24",
    vlan: "",
    color: SEG_COLORS[DB.segments.length % SEG_COLORS.length],
    icon: "lan",
  };
  const inet = !!(cur.isInternet || cur.subnet === "0.0.0.0/0");

  let color = cur.color || "#2dd4bf";
  let pickedIcon = inet ? "cloud" : cur.icon || "lan";
  const subnetField = inet
    ? ``
    : `<div class="mrow">
        <div class="mfield"><label>${t("segModalSubnet")}</label><input id="mSubnet" class="mono" value="${esc(cur.subnet)}" placeholder="10.0.0.0/24"></div>
        <div class="mfield"><label>${t("segModalVlan")}</label><input id="mVlan" class="mono" value="${esc(cur.vlan || "")}" placeholder="10"></div>
      </div>`;
  openModal(`
    <h2>${icon("network", "ico-a")}${isNew ? t("segModalNew") : (inet ? t("segModalInetPfx") : t("segModalSegPfx")) + esc(cur.name)}</h2>
    <div class="mfield"><label>${t("segModalName")}</label><input id="mName" value="${esc(cur.name)}"></div>
    ${subnetField}
    ${
      isAdvanced() && !inet
        ? `<label class="toggle-row" style="margin:0 0 12px"><input type="checkbox" id="mDhcp"${cur.dhcp !== false ? " checked" : ""}><span>${"DHCP – automatically assigns IP addresses in this network"}</span></label><div style="font-size:11px;color:var(--muted);margin:-8px 0 10px">${"Disabled DHCP = a host without a manually entered IP gets no address and won't connect."}</div><div class="mfield" style="margin-bottom:12px"><label>${"DHCP range – pool / scope (from – to)"}</label><div style="display:flex;gap:6px;align-items:center"><input id="mDhcpStart" class="mono" value="${esc(cur.dhcpStart || "")}" placeholder="${"from (e.g. .10)"}" style="width:130px"><span style="color:var(--muted)">–</span><input id="mDhcpEnd" class="mono" value="${esc(cur.dhcpEnd || "")}" placeholder="${"to (e.g. .200)"}" style="width:130px"></div><div style="font-size:11px;color:var(--muted);margin-top:4px">${"Empty = the whole rest of the subnet (from .10). Static IPs and reservations are excluded from the pool."}</div></div><div class="mfield" style="margin-bottom:12px"><label>${"Reservations (MAC → IP)"}</label><div id="mResvList"></div><button type="button" class="btn" id="mResvAdd" style="margin-top:6px">+ ${"Add reservation"}</button><div id="mDhcpPoolNote" style="display:none;font-size:11px;color:var(--amber);margin-top:8px">${t("dhcpPoolExternalNote")}</div></div>` +
          `<div class="mfield" style="margin-bottom:12px"><label>${t("dhcpSrvSegLabel")}</label><select id="mDhcpSrv"><option value="">${t("dhcpSrvSegDefault")}</option>${dhcpServerNodeList()
            .map(
              (x) =>
                `<option value="${x.id}"${cur.dhcpSrvId === x.id ? " selected" : ""}>${esc(x.label)}</option>`,
            )
            .join(
              "",
            )}</select><div style="font-size:11px;color:var(--muted);margin-top:4px">${t("dhcpSrvSegHint")}</div><div id="mDhcpRelayWrap" style="margin-top:8px;display:${cur.dhcpSrvId ? "block" : "none"}"><label style="font-size:12px;color:var(--muted);font-weight:600">${t("dhcpRelayLabel")}</label><select id="mDhcpRelay" style="width:100%"><option value="">${t("dhcpRelayNone")}</option>${DB.devices
            .filter(
              (d) =>
                L3TYPES.indexOf(d.type) >= 0 &&
                neighborsOf(d.id).indexOf(cur.id) >= 0,
            )
            .map(
              (d) =>
                `<option value="${d.id}"${cur.dhcpRelayId === d.id ? " selected" : ""}>${esc(d.label)}</option>`,
            )
            .join(
              "",
            )}</select><div style="font-size:11px;color:var(--muted);margin-top:4px">${t("dhcpRelayHint")}</div><div id="mDhcpRelayWarn" style="display:none;font-size:11px;color:var(--amber);margin-top:6px">${t("dhcpRelayWarn")}</div></div></div>`
        : ""
    }
    ${
      inet
        ? ""
        : `<div class="mfield"><label>${t("dnsSegLabel")}</label>
      <select id="mSegDns"><option value="">${t("dnsSegNone")}</option>${dnsNodeList()
        .map(
          (x) =>
            `<option value="${x.id}"${cur.dnsId === x.id ? " selected" : ""}>${esc(x.label)}</option>`,
        )
        .join("")}</select>
      <div style="font-size:11px;color:var(--muted);margin-top:4px">${t("dnsSegHint")}</div></div>
    ${
      inet || !isAdvanced()
        ? ""
        : `<div class="mfield"><label>${t("dnsSeg2Label")}</label>
      <select id="mSegDns2"><option value="">${t("dnsSeg2None")}</option>${dnsNodeList()
        .map(
          (x) =>
            `<option value="${x.id}"${cur.dnsId2 === x.id ? " selected" : ""}>${esc(x.label)}</option>`,
        )
        .join("")}</select>
      <div style="font-size:11px;color:var(--muted);margin-top:4px">${t("dnsSeg2Hint")}</div></div>`
    }`
    }
    ${inet ? '<div style="font-size:11.5px;color:var(--muted);margin:-4px 0 12px">' + t("segModalInetNote") + "</div>" : ""}
    <div class="mfield"><label>${t("segModalColor")}</label><div class="colorrow" id="mColors"></div></div>
    <div class="mfield"><label>${t("segModalMoreColors")}</label>
      <div style="display:flex;gap:8px;align-items:flex-start">
        <div class="cdrop" id="mColorDrop" style="flex:1">
          <button type="button" class="cdrop-btn" id="mColorBtn"><span class="cdrop-sw" id="mColorBtnSw"></span><span style="flex:1;text-align:left">${t("segModalPickPalette")}</span><span style="color:var(--muted)">▾</span></button>
          <div class="cdrop-panel" id="mColorPanel"></div>
        </div>
        <label class="custom-color"><input type="color" id="mColorCustom" value="${esc(color)}"><span>${t("segModalCustomColor")}</span></label>
      </div>
    </div>
    <div class="actions">
      <button class="btn" id="mCancel">${t("cancel")}</button>
      <button class="btn primary" id="mSave">${isNew ? t("segModalCreate") : t("save")}</button>
    </div>`);
  const cr = $("mColors");

  const EXTRA = [
    "#16c6b4",
    "#0ea5a3",
    "#2dd4bf",
    "#5eead4",
    "#22b8cf",
    "#38bdf8",
    "#60a5fa",
    "#818cf8",
    "#a78bfa",
    "#c084fc",
    "#e879f9",
    "#f472b6",
    "#fb7185",
    "#f87171",
    "#fb923c",
    "#fbbf24",
    "#facc15",
    "#a3e635",
    "#4ade80",
    "#34d399",
    "#10b981",
    "#94a3b8",
    "#cbd5e1",
    "#e2e8f0",
  ];
  const panel = $("mColorPanel"),
    btnSw = $("mColorBtnSw");
  function setColor(c) {
    color = c;
    markSwatch();
    markPanel();
    $("mColorCustom").value = c;
    btnSw.style.background = c;
    redrawIcons();
  }
  function markSwatch() {
    cr.querySelectorAll(".swatch").forEach((z) =>
      z.classList.toggle("sel", z.dataset.c === color),
    );
  }
  function markPanel() {
    panel
      .querySelectorAll(".cdrop-opt")
      .forEach((o) => o.classList.toggle("sel", o.dataset.c === color));
  }
  SEG_COLORS.forEach((c) => {
    const s = document.createElement("div");
    s.className = "swatch" + (c === color ? " sel" : "");
    s.dataset.c = c;
    s.style.background = c;
    s.onclick = () => setColor(c);
    cr.appendChild(s);
  });
  EXTRA.forEach((c) => {
    const o = document.createElement("button");
    o.type = "button";
    o.className = "cdrop-opt" + (c === color ? " sel" : "");
    o.dataset.c = c;
    o.style.background = c;
    o.title = c;
    o.onclick = () => {
      setColor(c);
      panel.classList.remove("open");
    };
    panel.appendChild(o);
  });
  btnSw.style.background = color;
  $("mColorBtn").onclick = () => panel.classList.toggle("open");
  $("mColorCustom").oninput = (e) => setColor(e.target.value);
  const ir = $("mIcons");
  function redrawIcons() {
    if (!ir) return;
    ir.innerHTML = "";
    SEG_ICONS.forEach((ic) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "iconbtn" + (ic.id === pickedIcon ? " sel" : "");
      b.title = ic.name;
      const sv = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      sv.setAttribute("viewBox", "-13 -13 26 26");
      sv.setAttribute("width", "26");
      sv.setAttribute("height", "26");
      sv.appendChild(segIcon(ic.id, color));
      b.appendChild(sv);
      b.onclick = () => {
        pickedIcon = ic.id;
        redrawIcons();
      };
      ir.appendChild(b);
    });
  }
  redrawIcons();

  if (isAdvanced() && !inet && $("mResvList")) {
    wireDhcpResv("mResvList", "mResvAdd", cur.dhcpReservations);

    const segId = isNew ? null : cur.id;
    const srvRemote = (sv) => {
      const n = getNode(sv);
      if (!n) return false;
      return isHost(sv)
        ? n.segId !== segId
        : neighborsOf(sv).indexOf(segId) < 0;
    };
    function updateDhcpSrvUi() {
      const sv = $("mDhcpSrv") ? $("mDhcpSrv").value : "";
      const w = $("mDhcpRelayWrap");
      if (w) w.style.display = sv ? "block" : "none";
      ["mDhcpStart", "mDhcpEnd", "mResvAdd"].forEach((id) => {
        const e = $(id);
        if (e) e.disabled = !!sv;
      });
      const rl = $("mResvList");
      if (rl)
        rl.querySelectorAll("input,select,button").forEach((e) => {
          e.disabled = !!sv;
        });
      const note = $("mDhcpPoolNote");
      if (note) note.style.display = sv ? "block" : "none";
      const warn = $("mDhcpRelayWarn");
      if (warn)
        warn.style.display =
          sv && srvRemote(sv) && !($("mDhcpRelay") && $("mDhcpRelay").value)
            ? "block"
            : "none";
    }
    if ($("mDhcpSrv")) $("mDhcpSrv").onchange = updateDhcpSrvUi;
    if ($("mDhcpRelay")) $("mDhcpRelay").onchange = updateDhcpSrvUi;
    if ($("mResvAdd"))
      $("mResvAdd").addEventListener("click", () =>
        setTimeout(updateDhcpSrvUi, 0),
      );
    updateDhcpSrvUi();
  }
  $("mCancel").onclick = closeModal;
  $("mSave").onclick = () => {
    const name = $("mName").value.trim() || t("palNet");
    let subnet, vlan;
    if (inet) {
      subnet = "0.0.0.0/0";
      vlan = "";
    } else {
      subnet = $("mSubnet").value.trim();
      if (subnet && !parseCidr(subnet)) {
        setStatus(t("stCidrInvalid"), false);
        return;
      }
      vlan = $("mVlan").value.trim();
    }
    let target;
    if (isNew) {
      const _sp = x && y ? { x, y } : spawnSpot();
      target = {
        id: uid("s"),
        name,
        subnet,
        vlan,
        color,
        icon: pickedIcon,
        isInternet: inet,
        x: x || _sp.x,
        y: y || _sp.y,
      };
      DB.segments.push(target);
      if (!(x && y)) ensureVisible(target.x, target.y);
    } else {
      seg.name = name;
      seg.subnet = subnet;
      seg.vlan = vlan;
      seg.color = color;
      seg.icon = pickedIcon;
      seg.isInternet = inet;
      target = seg;
    }

    let warnMsg = null;
    if ($("mSegDns")) {
      const dv = $("mSegDns").value;
      if (dv) target.dnsId = dv;
      else delete target.dnsId;
    }
    if ($("mSegDns2")) {
      const dv = $("mSegDns2").value;
      if (!dv) delete target.dnsId2;
      else if (!target.dnsId) {
        target.dnsId = dv;
        delete target.dnsId2;
        warnMsg = t("stDns2Promoted");
      } else if (dv === target.dnsId) {
        delete target.dnsId2;
        warnMsg = t("stDns2Same");
      } else target.dnsId2 = dv;
    }
    if (isAdvanced() && $("mDhcp")) {
      if ($("mDhcp").checked) delete target.dhcp;
      else target.dhcp = false;
    }
    if (isAdvanced() && $("mDhcpStart")) {
      const on = $("mDhcp") && $("mDhcp").checked;
      const st = $("mDhcpStart").value.trim(),
        en = $("mDhcpEnd").value.trim();
      if (on && st) target.dhcpStart = st;
      else delete target.dhcpStart;
      if (on && en) target.dhcpEnd = en;
      else delete target.dhcpEnd;
      delete target.dhcpMax;
      const resv = readDhcpResv("mResvList");
      if (on && resv.length) target.dhcpReservations = resv;
      else delete target.dhcpReservations;
    }

    if (isAdvanced() && !inet && $("mDhcpSrv")) {
      const sv = $("mDhcpSrv").value;
      if (sv && isDhcpServerNode(sv)) {
        target.dhcpSrvId = sv;
        const rl = $("mDhcpRelay") ? $("mDhcpRelay").value : "";
        if (rl && getNode(rl) && L3TYPES.indexOf((getNode(rl) || {}).type) >= 0)
          target.dhcpRelayId = rl;
        else delete target.dhcpRelayId;
      } else {
        delete target.dhcpSrvId;
        delete target.dhcpRelayId;
      }
    }
    saveDB();
    render();
    refreshAll();
    closeModal();
    setStatus(
      warnMsg || (isNew ? t("stSegCreated") : t("stSegSaved")),
      !warnMsg,
    );
  };
}

function replicateFwInterfaces(a, b) {
  const ifZ = Object.assign({}, b.ifaceZones || {});
  fwInterfaces(a).forEach((itA) => {
    const zid = (a.ifaceZones || {})[itA.link.id];
    if (zid == null) return;
    let itB = fwInterfaces(b).find((x) => x.neighborId === itA.neighborId);
    if (!itB && isSegment(itA.neighborId)) {
      const link = { id: uid("l"), fromId: b.id, toId: itA.neighborId };
      DB.links.push(link);
      itB = { link: link, neighborId: itA.neighborId };
    }
    if (itB) ifZ[itB.link.id] = zid;
  });
  b.ifaceZones = ifZ;
}
function replicateConfig(srcId) {
  const a = getNode(srcId);
  if (!a || !a.haPeer) return;
  const b = getNode(a.haPeer);
  if (!b || b.type !== a.type) return;
  if (a.type === "firewall") {
    b.zoneMode = a.zoneMode;
    b.defaultAction = a.defaultAction;
    b.zones = JSON.parse(JSON.stringify(a.zones || []));
    b.firewallRules = JSON.parse(JSON.stringify(a.firewallRules || []));
    b.simpleRules = JSON.parse(JSON.stringify(a.simpleRules || []));
    replicateFwInterfaces(a, b);
    ensureFirewallZones(b);
  } else if (
    a.type === "l3switch" ||
    a.type === "router" ||
    a.type === "l2mgmt"
  ) {
    b.acl = JSON.parse(JSON.stringify(a.acl || []));
    b.aclDefault = a.aclDefault;
  }
}

function mirrorHaPairLinks(a, b) {
  [
    [a, b],
    [b, a],
  ].forEach((pair) => {
    const src = pair[0],
      dst = pair[1];
    neighborsOf(src.id).forEach((nb) => {
      if (nb === dst.id || nb === src.id || isHost(nb)) return;
      const has = DB.links.some(
        (l) =>
          (l.fromId === dst.id && l.toId === nb) ||
          (l.toId === dst.id && l.fromId === nb),
      );
      if (!has) DB.links.push({ id: uid("l"), fromId: dst.id, toId: nb });
    });
  });
}
function applyHaPair(dev, newPeer) {
  newPeer = newPeer || null;
  const old = dev.haPeer || null;
  if (old && old !== newPeer) {
    const o = getNode(old);
    if (o && o.haPeer === dev.id) o.haPeer = null;
  }
  dev.haPeer = newPeer;
  if (newPeer) {
    const np = getNode(newPeer);
    if (np) {
      if (np.haPeer && np.haPeer !== dev.id) {
        const x = getNode(np.haPeer);
        if (x && x.haPeer === np.id) x.haPeer = null;
      }
      np.haPeer = dev.id;
    }
    if (np) mirrorHaPairLinks(dev, np);
    replicateConfig(dev.id);
  }
}

function applyHaMode(dev, val) {
  const peer = dev.haPeer && getNode(dev.haPeer);
  if (val === "ap-active") {
    dev.haMode = "ap";
    dev.haStandby = false;
    if (peer) {
      peer.haMode = "ap";
      peer.haStandby = true;
    }
  } else if (val === "ap-standby") {
    dev.haMode = "ap";
    dev.haStandby = true;
    if (peer) {
      peer.haMode = "ap";
      peer.haStandby = false;
    }
  } else {
    dev.haMode = "aa";
    dev.haStandby = false;
    if (peer) {
      peer.haMode = "aa";
      peer.haStandby = false;
    }
  }
}
function haModeVal(dev) {
  return dev.haMode === "ap"
    ? dev.haStandby
      ? "ap-standby"
      : "ap-active"
    : "aa";
}

function isPassiveStandby(id) {
  const d = getNode(id);
  return !!(
    d &&
    d.haMode === "ap" &&
    d.haStandby &&
    d.haPeer &&
    !isDown(d.haPeer)
  );
}
function isQuar(id) {
  const n = getNode(id);
  return !!(n && n.quar);
}
function isInactive(id) {
  return isDown(id) || isPassiveStandby(id) || isQuar(id);
}

let aaSkip = new Set(),
  aaCounter = 0;
function aaRotate() {
  aaSkip = new Set();
  aaCounter++;
  const seen = new Set();
  DB.devices.forEach((d) => {
    if (d.haMode === "aa" && d.haPeer && !seen.has(d.id)) {
      const p = getNode(d.haPeer);
      if (!p) return;
      seen.add(d.id);
      seen.add(p.id);
      if (isDown(d.id) || isDown(p.id)) return;
      const drop = aaCounter % 2 === 0 ? p : d;
      aaSkip.add(drop.id);
    }
  });
}
function aaClearSkip() {
  aaSkip = new Set();
}

function segVpnFirewall(segId) {
  for (const d of DB.devices) {
    if (d.type !== "firewall" || isDown(d.id)) continue;
    ensureFirewallZones(d);
    const it = fwInterfaces(d).find((x) => x.neighborId === segId);
    if (it) {
      const z = (d.zones || []).find((z) => z.id === d.ifaceZones[it.link.id]);
      if (z && z.role === "vpn") return d;
    }
  }
  return null;
}

function isVpnHost(id) {
  if (!isHost(id)) return false;
  const seg = epSeg(id);
  return !!(seg && segVpnFirewall(seg));
}
function haSectionHTML(dev, curPeer) {
  const cands = DB.devices.filter(
    (x) => x.type === dev.type && x.id !== dev.id,
  );
  const opts =
    '<option value="">' +
    t("fwHaNoPeer") +
    "</option>" +
    cands
      .map(
        (x) =>
          `<option value="${x.id}"${curPeer === x.id ? " selected" : ""}>${esc(x.label)}</option>`,
      )
      .join("");
  const cfg = dev.type === "firewall" ? t("haCfgFw") : "ACL";
  const mv = haModeVal(dev);
  const modeSel = `<select id="mHaMode" style="margin-top:7px">
    <option value="aa"${mv === "aa" ? " selected" : ""}>${t("fwHaAA")}</option>
    <option value="ap-active"${mv === "ap-active" ? " selected" : ""}>${t("fwHaAPActive")}</option>
    <option value="ap-standby"${mv === "ap-standby" ? " selected" : ""}>${t("fwHaAPStandby")}</option>
  </select>`;
  const showMode = !!curPeer && cands.length > 0;
  return `<div class="mfield"><label>${t("fwHaLabel")}</label>
    <select id="mHaPeer">${cands.length ? opts : '<option value="">' + t("fwHaNoDevice") + "</option>"}</select>
    <div id="mHaModeWrap"${showMode ? "" : " style='display:none'"}>${modeSel}
    <div style="font-size:11px;color:var(--muted);margin-top:5px">${tf("fwHaHint", cfg)}${L2_BRIDGE_TYPES.indexOf(dev.type) >= 0 ? " " + t("fwHaStackHint") : ""}</div></div></div>`;
}

function _radHosts() {
  return (DB.hosts || []).filter(
    (x) => Array.isArray(x.services) && x.services.indexOf(1812) >= 0,
  );
}
function wifiSsidEditor(initial, initialWifiOn, initialTx) {
  const segs = DB.segments.filter((s) => !s.isInternet);
  let wifiOn = initialWifiOn !== false;
  let tx = wlTxOf({ wlTx: initialTx });
  const work = (initial || []).map((s) => ({
    name: s.name,
    segId: s.segId,
    pass: s.pass || "",
    sec: ssidSec(s),
    radiusId: s.radiusId || null,
    on: s.on !== false,
    band: wlBandOf(s),
    ch: wlChOf(s),
  }));
  const segOpt = (sel) =>
    '<option value="">' +
    "— select a network —" +
    "</option>" +
    segs
      .map(
        (s) =>
          '<option value="' +
          s.id +
          '"' +
          (s.id === sel ? " selected" : "") +
          ">" +
          esc(s.name) +
          (s.vlan ? " (VLAN " + esc(s.vlan) + ")" : "") +
          "</option>",
      )
      .join("");
  const rowsHtml = () =>
    work.length
      ? work
          .map(
            (ss, i) =>
              '<div style="display:flex;gap:8px;margin-bottom:6px;align-items:center;flex-wrap:wrap' +
              (wifiOn ? "" : ";opacity:.45") +
              '">' +
              '<input type="checkbox" class="ss-on" data-i="' +
              i +
              '"' +
              (ss.on ? " checked" : "") +
              (wifiOn ? "" : " disabled") +
              ' title="' +
              "broadcast this SSID" +
              '" style="flex:0 0 auto;width:16px;height:16px">' +
              '<input class="ss-name" data-i="' +
              i +
              '" value="' +
              esc(ss.name || "") +
              '" placeholder="SSID" style="flex:1 1 95px;min-width:0"' +
              (wifiOn ? "" : " disabled") +
              ">" +
              '<select class="ss-seg" data-i="' +
              i +
              '" style="flex:1 1 95px;min-width:0"' +
              (wifiOn ? "" : " disabled") +
              ">" +
              segOpt(ss.segId) +
              "</select>" +
              '<select class="ss-sec" data-i="' +
              i +
              '" title="' +
              "security" +
              '" style="flex:0 1 88px;min-width:0"' +
              (wifiOn ? "" : " disabled") +
              ">" +
              ["open", "wpa2", "wpa3", "ent"]
                .map(
                  (v) =>
                    '<option value="' +
                    v +
                    '"' +
                    (ss.sec === v ? " selected" : "") +
                    (v === "ent" && !_radHosts().length && ss.sec !== "ent"
                      ? " disabled"
                      : "") +
                    ">" +
                    (v === "open"
                      ? "open"
                      : v === "ent"
                        ? "802.1X"
                        : v.toUpperCase()) +
                    "</option>",
                )
                .join("") +
              "</select>" +
              '<select class="ss-band" data-i="' +
              i +
              '" title="' +
              t("wlBandLabel") +
              '" style="flex:0 1 96px;min-width:0"' +
              (wifiOn ? "" : " disabled") +
              ">" +
              WL_BAND_LIST.map(
                (b) =>
                  '<option value="' +
                  b +
                  '"' +
                  (wlBandOf(ss) === b ? " selected" : "") +
                  ">" +
                  wlBandLabel(b) +
                  "</option>",
              ).join("") +
              "</select>" +
              '<select class="ss-ch" data-i="' +
              i +
              '" title="' +
              t("wlChHint") +
              '" style="flex:0 1 62px;min-width:0"' +
              (wifiOn ? "" : " disabled") +
              ">" +
              WL_CHANNELS[wlBandOf(ss)]
                .map(
                  (c) =>
                    '<option value="' +
                    c +
                    '"' +
                    (wlChOf(ss) === c ? " selected" : "") +
                    ">" +
                    c +
                    "</option>",
                )
                .join("") +
              "</select>" +
              (ss.sec === "ent" && !_radHosts().length
                ? '<span style="flex:1 1 100%;font-size:11px;color:var(--amber)">' +
                  t("ssidNeedRadius") +
                  "</span>"
                : "") +
              (ss.sec === "open" || ss.sec === "ent"
                ? ""
                : '<input class="ss-pass" data-i="' +
                  i +
                  '" value="' +
                  esc(ss.pass || "") +
                  '" placeholder="' +
                  "password" +
                  '" style="flex:1 1 95px;min-width:0"' +
                  (wifiOn ? "" : " disabled") +
                  ">") +
              (ss.sec === "ent"
                ? '<select class="ss-radius" data-i="' +
                  i +
                  '" title="RADIUS" style="flex:1 1 95px;min-width:0"' +
                  (wifiOn ? "" : " disabled") +
                  '><option value="">' +
                  "— RADIUS server —" +
                  "</option>" +
                  _radHosts()
                    .map(
                      (x) =>
                        '<option value="' +
                        x.id +
                        '"' +
                        (ss.radiusId === x.id ? " selected" : "") +
                        ">" +
                        esc(x.label) +
                        "</option>",
                    )
                    .join("") +
                  "</select>"
                : "") +
              '<button class="btn ss-del" data-i="' +
              i +
              '" title="' +
              "remove" +
              '"' +
              (wifiOn ? "" : " disabled") +
              ">✕</button></div>",
          )
          .join("")
      : '<div style="color:var(--muted);font-size:12px;margin-bottom:6px">' +
        "No Wi-Fi yet. Add an SSID and choose which network/VLAN it belongs to." +
        "</div>";
  function html() {
    return (
      '<div class="mfield">' +
      '<label class="toggle-row" style="margin-bottom:8px"><input type="checkbox" id="wifiOnToggle"' +
      (wifiOn ? " checked" : "") +
      "><span>" +
      "Wi-Fi on (broadcasting)" +
      "</span></label>" +
      '<div style="margin-bottom:8px">' +
      '<label for="wifiTx">' +
      t("wlTxLabel") +
      "</label>" +
      '<select id="wifiTx" style="width:auto">' +
      [5, 10, 15, 20, 25, 30]
        .map(
          (v) =>
            '<option value="' +
            v +
            '"' +
            (tx === v ? " selected" : "") +
            ">" +
            v +
            " dBm</option>",
        )
        .join("") +
      "</select>" +
      '<div style="font-size:11px;color:var(--muted);margin-top:5px">' +
      t("wlTxHint") +
      "</div></div>" +
      "<label>" +
      "SSID (Wi-Fi name) → network / VLAN" +
      '</label><div id="apRows">' +
      rowsHtml() +
      "</div>" +
      '<button class="btn" id="apAdd" type="button" style="margin-top:4px"' +
      (wifiOn ? "" : " disabled") +
      ">+ " +
      "Add SSID" +
      "</button></div>"
    );
  }
  function wireRows() {
    modalBox.querySelectorAll(".ss-on").forEach(
      (cb) =>
        (cb.onchange = () => {
          work[+cb.getAttribute("data-i")].on = cb.checked;
        }),
    );
    modalBox.querySelectorAll(".ss-name").forEach(
      (inp) =>
        (inp.oninput = () => {
          work[+inp.getAttribute("data-i")].name = inp.value;
        }),
    );
    modalBox.querySelectorAll(".ss-seg").forEach(
      (sel) =>
        (sel.onchange = () => {
          work[+sel.getAttribute("data-i")].segId = sel.value || null;
        }),
    );
    modalBox.querySelectorAll(".ss-pass").forEach(
      (inp) =>
        (inp.oninput = () => {
          work[+inp.getAttribute("data-i")].pass = inp.value;
        }),
    );
    modalBox.querySelectorAll(".ss-sec").forEach(
      (sel) =>
        (sel.onchange = () => {
          const w = work[+sel.getAttribute("data-i")];
          w.sec = sel.value;
          if (w.sec === "open") w.pass = "";
          const c = $("apRows");
          if (c) c.innerHTML = rowsHtml();
          wireRows();
        }),
    );
    modalBox.querySelectorAll(".ss-radius").forEach(
      (sel) =>
        (sel.onchange = () => {
          work[+sel.getAttribute("data-i")].radiusId = sel.value || null;
        }),
    );
    modalBox.querySelectorAll(".ss-band").forEach(
      (sel) =>
        (sel.onchange = () => {
          // Each band has its own channel plan, so switching band has to reset the
          // channel too -- and redraw the row, since the option list changes.
          const w = work[+sel.getAttribute("data-i")];
          w.band = wlBandOf({ band: sel.value });
          w.ch = WL_BANDS[w.band].defCh;
          const c = $("apRows");
          if (c) c.innerHTML = rowsHtml();
          wireRows();
        }),
    );
    modalBox.querySelectorAll(".ss-ch").forEach(
      (sel) =>
        (sel.onchange = () => {
          work[+sel.getAttribute("data-i")].ch = +sel.value;
        }),
    );
    modalBox.querySelectorAll(".ss-del").forEach(
      (b) =>
        (b.onclick = () => {
          work.splice(+b.getAttribute("data-i"), 1);
          const c = $("apRows");
          if (c) c.innerHTML = rowsHtml();
          wireRows();
        }),
    );
  }
  function wire() {
    const txSel = $("wifiTx");
    if (txSel) txSel.onchange = () => (tx = +txSel.value);
    const mt = $("wifiOnToggle");
    if (mt)
      mt.onchange = () => {
        wifiOn = mt.checked;
        const c = $("apRows");
        if (c) c.innerHTML = rowsHtml();
        wireRows();
        const add = $("apAdd");
        if (add) add.disabled = !wifiOn;
      };
    wireRows();
    const add = $("apAdd");
    if (add)
      add.onclick = () => {
        if (!wifiOn) return;
        work.push({
          name: "",
          segId: segs[0] ? segs[0].id : null,
          pass: "",
          sec: "wpa2",
          on: true,
          band: "5",
          ch: WL_BANDS["5"].defCh,
        });
        const c = $("apRows");
        if (c) c.innerHTML = rowsHtml();
        wireRows();
      };
  }
  function value() {
    const seen = new Set();

    const ssids = work
      .filter((s) => (s.name || "").trim() && s.segId)
      .map((s) => {
        let sec = s.sec;
        const hasPass = !!(s.pass || "").trim();
        if (sec === "ent" && !s.radiusId) sec = hasPass ? "wpa2" : "open";
        else if (sec !== "open" && sec !== "ent" && !hasPass) sec = "open";
        const o = {
          name: (s.name || "").trim(),
          segId: s.segId,
          pass: sec === "open" || sec === "ent" ? "" : s.pass || "",
          sec,
          on: s.on !== false,
          band: wlBandOf(s),
          ch: wlChOf(s),
        };
        if (sec === "ent") o.radiusId = s.radiusId;
        return o;
      })
      .filter((s) => {
        if (seen.has(s.name)) return false;
        seen.add(s.name);
        return true;
      });
    return { wifiOn: wifiOn, ssids, wlTx: tx };
  }
  return { html, wire, value };
}

let _portColorMode = (function () {
  try {
    const v = localStorage.getItem("netsim_portcolor");
    return v === "vlan" || v === "speed" ? v : "state";
  } catch (e) {
    return "state";
  }
})();
