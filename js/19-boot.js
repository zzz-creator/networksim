"use strict";

let statusTimer = null;
function setStatus(msg, ok = true) {
  const t = $("toast");
  t.textContent = msg;
  t.className = "toast show" + (ok ? "" : " err");
  if (statusTimer) clearTimeout(statusTimer);
  statusTimer = setTimeout(() => {
    t.className = "toast" + (ok ? "" : " err");
    setTimeout(() => {
      if (!t.classList.contains("show")) t.textContent = "";
    }, 300);
  }, 2400);
}

function renderOverview() {
  const el = document.getElementById("overviewBody");
  if (!el) return;
  const devs = DB.devices || [],
    segs = (DB.segments || []).filter((s) => !s.isInternet),
    hosts = DB.hosts || [];
  const byType = {};
  devs.forEach((d) => {
    byType[d.type] = (byType[d.type] || 0) + 1;
  });
  const TL = {
    firewall: "FW",
    l2switch: "L2",
    l2mgmt: "MSW",
    hub: "hub",
    l3switch: "L3",
    router: "router",
    idsips: "IDS/IPS",
    loadbalancer: "LB",
    vpn: "VPN",
    ap: "AP",
  };
  const brk = Object.keys(byType)
    .map((k) => byType[k] + "× " + (TL[k] || k))
    .join(" · ");
  let rules = 0;
  const _seen = new Set();
  devs.forEach((d) => {
    if (d.haPeer && _seen.has(d.haPeer)) return;
    _seen.add(d.id);
    rules +=
      (d.firewallRules || []).length +
      (d.simpleRules || []).length +
      (d.acl || []).length;
  });
  const warns = document.querySelectorAll("#svg .warnbadge").length;
  const row = (l, v, x) =>
    `<div class="ov-row"><span>${l}</span><b>${v}</b>${x ? `<small>${esc(x)}</small>` : ""}</div>`;
  el.innerHTML =
    row(t("ovDevices"), devs.length, brk) +
    row(t("ovSegments"), segs.length) +
    row(t("ovHosts"), hosts.length) +
    row(t("ovRules"), rules) +
    (warns ? row(t("ovWarnings"), warns) : "");
}
function refreshAll() {
  refreshSelects();
  if (view === "matrix") renderMatrix();
  if ($("netsView") && $("netsView").style.display !== "none") renderNetsView();
  renderOverview();
}

function showRPTab(t) {
  $("rtTest").classList.toggle("active", t === "test");
  $("rtNets").classList.toggle("active", t === "nets");
  $("rtLogs").classList.toggle("active", t === "logs");
  if (typeof a11yTabs === "function")
    a11yTabs($("testpanel").querySelector(".rp-tabs"));
  $("testView").style.display = t === "test" ? "block" : "none";
  $("netsView").style.display = t === "nets" ? "block" : "none";
  $("logsView").style.display = t === "logs" ? "block" : "none";
  if (t === "nets") renderNetsView();
  if (t === "logs") {
    renderSyslog();
    renderFlows();
  }
}
$("rtTest").onclick = () => showRPTab("test");
$("rtNets").onclick = () => showRPTab("nets");
$("rtLogs").onclick = () => showRPTab("logs");
function showLogTab(t) {
  [
    ["ltTraffic", "trafficPanel"],
    ["ltFlows", "flowsPanel"],
    ["ltSys", "syslogPanel"],
  ].forEach(([b, pn]) => {
    $(b).classList.toggle("active", b === "lt" + t);
    $(pn).style.display = b === "lt" + t ? "" : "none";
  });
  if (t === "Sys") renderSyslog();
  if (t === "Flows") renderFlows();
}
$("ltTraffic").onclick = () => showLogTab("Traffic");
$("ltFlows").onclick = () => showLogTab("Flows");
$("ltSys").onclick = () => showLogTab("Sys");

function _dhcpFieldBad(val, c) {
  if (val == null || String(val).trim() === "") return false;
  if (!c) return false;
  const s = String(val).trim();
  if (!_ipValid(s)) return true;
  const ip = ipToInt(s);
  return c.bits < 31 ? ip <= c.start || ip >= c.end : false;
}
function renderNetsView() {
  const cont = $("netsList");
  if (!cont) return;
  const vlans = DB.segments.filter((s) => !s.isInternet);
  if (!vlans.length) {
    cont.innerHTML =
      '<div style="font-size:12px;color:var(--muted)">' +
      t("netsEmpty") +
      "</div>";
    return;
  }

  cont.innerHTML = vlans
    .map((v) => {
      const c = parseCidr(v.subnet),
        subBad = !c;
      const vlanBad =
        v.vlan != null &&
        String(v.vlan).trim() !== "" &&
        !(Number.isInteger(+v.vlan) && +v.vlan >= 1 && +v.vlan <= 4094);
      const on = v.dhcp !== false;

      let gwIp = "",
        defStart = "",
        defEnd = "";
      if (c && c.bits < 31) {
        gwIp = intToIp(c.start + 1);
        defStart = intToIp(Math.min(c.start + 10, c.end - 1));
        defEnd = intToIp(c.end - 1);
      }
      const dispStart =
        v.dhcpStart != null && v.dhcpStart !== "" ? v.dhcpStart : defStart;
      const dispEnd =
        v.dhcpEnd != null && v.dhcpEnd !== "" ? v.dhcpEnd : defEnd;
      const startBad = _dhcpFieldBad(dispStart, c),
        endBad = _dhcpFieldBad(dispEnd, c);
      const orderBad =
        !startBad &&
        !endBad &&
        _ipValid(String(dispStart)) &&
        _ipValid(String(dispEnd)) &&
        ipToInt(String(dispStart)) > ipToInt(String(dispEnd));

      const gws = [...gatewaysOf(v.id)]
        .map((id) => getNode(id))
        .filter(Boolean);
      const server =
        gws.find((d) => d.type === "router" || d.type === "l3switch") ||
        gws.find((d) => d.type === "firewall") ||
        null;
      const hasL3 = gws.length > 0;
      return `<div class="vlan-card">
      <div class="vc-top"><input type="color" class="v-color" data-net="${v.id}" value="${esc(v.color || "#2dd4bf")}"><input class="vc-name v-name" data-net="${v.id}" value="${esc(v.name)}"><button class="vc-open" data-net="${v.id}" title="${esc(t("netsOpenTip"))}" aria-label="${esc(t("netsOpenTip"))}">${icon("sliders")}</button><button class="vc-del" data-net="${v.id}" title="${"delete VLAN"}">✕</button></div>
      <div class="vc-row"><input class="v-sub${subBad ? " cfg-bad" : ""}" data-net="${v.id}" value="${esc(v.subnet || "")}" placeholder="10.0.0.0/24"><input class="v-vlan${vlanBad ? " cfg-bad" : ""}" data-net="${v.id}" value="${esc(v.vlan || "")}" placeholder="VLAN ID"></div>
      <div class="vc-sum">${(() => {
        const hs = (DB.hosts || []).filter((h) => h.segId === v.id);
        const dh = segDhcpOn(v.id)
          ? hs.filter((h) => !(h.ip && String(h.ip).trim())).length
          : 0;
        return hs.length + " " + "devices" + " · " + dh + " " + "from DHCP";
      })()}</div>
    </div>`;
    })
    .join("");
  cont.querySelectorAll(".vc-open").forEach(
    (b) =>
      (b.onclick = (e) => {
        const n = getNode(e.currentTarget.dataset.net);
        if (n) openSegmentModal(n);
      }),
  );
  cont.querySelectorAll(".v-name").forEach(
    (i) =>
      (i.oninput = (e) => {
        getNode(e.target.dataset.net).name = e.target.value;
        saveDB();
        refreshSelects();
      }),
  );
  cont.querySelectorAll(".v-sub").forEach((i) => {
    i.oninput = (e) => {
      const s = getNode(e.target.dataset.net);
      s.subnet = e.target.value;
      e.target.classList.toggle("cfg-bad", !parseCidr(s.subnet));
      saveDB();
      refreshSelects();
    };
    i.onchange = () => renderNetsView();
  });
  cont.querySelectorAll(".v-vlan").forEach(
    (i) =>
      (i.oninput = (e) => {
        const s = getNode(e.target.dataset.net);
        s.vlan = e.target.value;
        const n = +s.vlan;
        e.target.classList.toggle(
          "cfg-bad",
          String(s.vlan).trim() !== "" &&
            !(Number.isInteger(n) && n >= 1 && n <= 4094),
        );
        saveDB();
      }),
  );
  cont.querySelectorAll(".v-dhcp").forEach(
    (i) =>
      (i.onchange = (e) => {
        const s = getNode(e.target.dataset.net);
        if (e.target.checked) delete s.dhcp;
        else s.dhcp = false;
        saveDB();
        renderNetsView();
      }),
  );
  cont.querySelectorAll(".v-dhcpstart").forEach(
    (i) =>
      (i.oninput = (e) => {
        const s = getNode(e.target.dataset.net);
        const v = e.target.value.trim();
        if (s.dhcp !== false && v) s.dhcpStart = v;
        else delete s.dhcpStart;
        delete s.dhcpMax;
        e.target.classList.toggle(
          "cfg-bad",
          _dhcpFieldBad(v, parseCidr(s.subnet)),
        );
        saveDB();
      }),
  );
  cont.querySelectorAll(".v-dhcpend").forEach(
    (i) =>
      (i.oninput = (e) => {
        const s = getNode(e.target.dataset.net);
        const v = e.target.value.trim();
        if (s.dhcp !== false && v) s.dhcpEnd = v;
        else delete s.dhcpEnd;
        delete s.dhcpMax;
        e.target.classList.toggle(
          "cfg-bad",
          _dhcpFieldBad(v, parseCidr(s.subnet)),
        );
        saveDB();
      }),
  );
  cont.querySelectorAll(".v-color").forEach(
    (i) =>
      (i.oninput = (e) => {
        getNode(e.target.dataset.net).color = e.target.value;
        saveDB();
        render();
      }),
  );
  cont.querySelectorAll(".vc-del").forEach(
    (b) =>
      (b.onclick = () => {
        const id = b.dataset.net;
        DB.segments = DB.segments.filter((s) => s.id !== id);
        DB.links = DB.links.filter((l) => l.fromId !== id && l.toId !== id);
        (DB.hosts || []).forEach((h) => {
          if (h.segId === id) h.segId = null;
        });
        DB.devices.forEach((d) =>
          (d.ssids || []).forEach((s) => {
            if (s.segId === id) s.segId = null;
          }),
        );
        reconcileWifiClients();
        saveDB();
        render();
        refreshAll();
        renderNetsView();
      }),
  );
}
$("addVlan").onclick = () => {
  const n = DB.segments.filter((s) => !s.isInternet).length + 1;
  const seg = {
    id: uid("s"),
    name: "VLAN " + n * 10,
    subnet: "10.0." + n + ".0/24",
    vlan: String(n * 10),
    color: SEG_COLORS[DB.segments.length % SEG_COLORS.length],
    icon: "lan",
  };
  DB.segments.push(seg);
  saveDB();
  refreshSelects();
  renderNetsView();
  setStatus(t("stVlanAdded") + " " + seg.name);
};

const ID_SAFE = /^[A-Za-z0-9_.:-]+$/;
function sanitizeIds() {
  const map = Object.create(null),
    used = new Set();
  const eachIded = (fn) => {
    const seen = new Set();
    (function w(v) {
      if (!v || typeof v !== "object" || seen.has(v)) return;
      seen.add(v);
      if (!Array.isArray(v) && "id" in v) fn(v);
      for (const k in v) w(v[k]);
    })(DB);
  };
  eachIded((o) => {
    if (typeof o.id === "string" && ID_SAFE.test(o.id)) used.add(o.id);
  });
  eachIded((o) => {
    if (
      typeof o.id === "string"
        ? ID_SAFE.test(o.id)
        : o.id == null || typeof o.id === "number"
    )
      return;
    const base =
      (typeof o.id === "string" ? o.id : "")
        .replace(/[^A-Za-z0-9_.:-]/g, "")
        .slice(0, 24) || "x";
    let id = base,
      i = 1;
    while (used.has(id)) id = base + "_" + i++;
    used.add(id);
    if (typeof o.id === "string") map[o.id] = id;
    o.id = id;
  });
  if (!Object.keys(map).length) return;

  const TEXT_KEYS = {
    label: 1,
    name: 1,
    text: 1,
    title: 1,
    note: 1,
    ssid: 1,
    subnet: 1,
    ip: 1,
    mac: 1,
  };
  (function rewrite(v) {
    if (Array.isArray(v)) {
      for (let i = 0; i < v.length; i++) {
        const c = v[i];
        if (typeof c === "string") {
          if (map[c] !== undefined) v[i] = map[c];
        } else if (c && typeof c === "object") rewrite(c);
      }
      return;
    }
    for (const k of Object.keys(v)) {
      const c = v[k];
      if (typeof c === "string") {
        if (map[c] !== undefined && !TEXT_KEYS[k]) v[k] = map[c];
      } else if (c && typeof c === "object") rewrite(c);
      if (map[k] !== undefined && v[map[k]] === undefined) {
        v[map[k]] = v[k];
        delete v[k];
      }
    }
  })(DB);
}
function migrateDB() {
  runtimeClear();
  if (typeof flowsClear === "function") flowsClear();
  if (typeof syslogClear === "function") syslogClear();

  if (!DB.meta || typeof DB.meta !== "object" || Array.isArray(DB.meta))
    DB.meta = { name: t("topoDefault"), version: 1 };
  if (!Array.isArray(DB.devices)) DB.devices = [];
  else DB.devices = DB.devices.filter((d) => d && typeof d === "object");
  if (!Array.isArray(DB.segments)) DB.segments = [];
  else DB.segments = DB.segments.filter((s) => s && typeof s === "object");
  if (Array.isArray(DB.links))
    DB.links = DB.links.filter((l) => l && typeof l === "object");
  else DB.links = [];
  if (!Array.isArray(DB.hosts)) DB.hosts = [];
  else DB.hosts = DB.hosts.filter((h) => h && typeof h === "object");
  if (!Array.isArray(DB.notes)) DB.notes = [];
  else DB.notes = DB.notes.filter((n) => n && typeof n === "object");
  sanitizeIds();

  DB.devices.forEach((d) => {
    if (d.acl !== undefined && !Array.isArray(d.acl)) delete d.acl;
    else if (Array.isArray(d.acl))
      d.acl = d.acl.filter((r) => r && typeof r === "object");
    if (d.routes !== undefined && !Array.isArray(d.routes)) delete d.routes;
    else if (Array.isArray(d.routes))
      d.routes = d.routes.filter((r) => r && typeof r === "object");
  });
  DB.hosts.forEach((h) => {
    if (h.services !== undefined && !Array.isArray(h.services))
      delete h.services;
  });
  DB.segments.forEach((s) => {
    if (s.subnet !== undefined && typeof s.subnet !== "string") delete s.subnet;
  });

  let _gi = 0;
  DB.devices
    .concat(
      DB.hosts,
      DB.notes,
      DB.segments.filter((s) => s.isInternet),
    )
    .forEach((n) => {
      if (!isFinite(+n.x) || !isFinite(+n.y)) {
        n.x = 140 + (_gi % 8) * 150;
        n.y = 140 + Math.floor(_gi / 8) * 130;
        _gi++;
      }
    });

  const _sanDhcpScopes = (n) => {
    if (n.dhcpScopes === undefined) return;
    if (!Array.isArray(n.dhcpScopes)) {
      delete n.dhcpScopes;
      return;
    }
    n.dhcpScopes = n.dhcpScopes
      .filter(
        (sc) =>
          sc &&
          typeof sc === "object" &&
          typeof sc.segId === "string" &&
          DB.segments.some((x) => x.id === sc.segId),
      )
      .map((sc) => {
        const o = { segId: sc.segId };
        if (typeof sc.start === "string" && sc.start.trim())
          o.start = sc.start.trim();
        if (typeof sc.end === "string" && sc.end.trim()) o.end = sc.end.trim();
        if (Array.isArray(sc.reservations)) {
          const rs = sc.reservations.filter(
            (r) => r && typeof r === "object" && r.mac && r.ip,
          );
          if (rs.length) o.reservations = rs;
        }
        return o;
      });
    if (!n.dhcpScopes.length) delete n.dhcpScopes;
  };
  DB.devices.forEach((d) => {
    if (d.type === "l3switch" || d.type === "router" || d.type === "l2mgmt") {
      if (!Array.isArray(d.acl)) d.acl = [];
      if (d.aclDefault !== "permit" && d.aclDefault !== "deny")
        d.aclDefault = "permit";
    }
    if ((d.type === "router" || d.type === "l3switch") && !d.routingProto)
      d.routingProto = d.manualRouting ? "static" : "ospf";
    if (d.type === "firewall") {
      if (!Array.isArray(d.zones)) d.zones = [];
      if (!Array.isArray(d.firewallRules)) d.firewallRules = [];
      if (d.zoneMode === undefined) d.zoneMode = true;
      if (!d.defaultAction) d.defaultAction = "deny";
      if (!Array.isArray(d.simpleRules)) d.simpleRules = [];
      if (!d.ifaceZones || typeof d.ifaceZones !== "object") d.ifaceZones = {};
    }
    if (d.type === "idsips") {
      if (!d.mode) d.mode = "ips";
      if (!Array.isArray(d.signatures)) d.signatures = [];
    }
    if (d.type === "loadbalancer") {
      if (d.vipPorts === undefined) d.vipPorts = "";
      if (!d.algorithm) d.algorithm = "rr";
      if (!d.lbWeights || typeof d.lbWeights !== "object") d.lbWeights = {};
    }
    if (d.type === "ap" || d.type === "router" || d.type === "firewall") {
      if (!Array.isArray(d.ssids)) d.ssids = [];
      d.ssids = d.ssids.filter((ss) => ss && typeof ss === "object");
      d.ssids.forEach((ss) => {
        if (
          (ss.sec === "wpa2" || ss.sec === "wpa3") &&
          !(typeof ss.pass === "string" && ss.pass)
        )
          ss.sec = "open";
        ss.sec = ssidSec(ss);
        if (ss.sec === "open" || ss.sec === "ent") ss.pass = "";
        if (ss.sec !== "ent") delete ss.radiusId;
        else if (
          typeof ss.radiusId !== "string" ||
          !(DB.hosts || []).some((h) => h.id === ss.radiusId)
        )
          ss.radiusId = null;
        // Radio settings: drop anything off the band/channel tables so a hand-edited
        // topology cannot smuggle in a channel that does not exist on that band.
        ss.band = wlBandOf(ss);
        ss.ch = wlChOf(ss);
      });
      if (d.wlTx !== undefined) {
        const tx = +d.wlTx;
        if (!isFinite(tx) || tx < WL_TX_MIN || tx > WL_TX_MAX) delete d.wlTx;
      }
    }

    if (d.type === "router" || d.type === "firewall" || d.type === "l3switch") {
      if (d.dnsRole !== "forwarder" && d.dnsRole !== "server") delete d.dnsRole;
    } else {
      delete d.dnsRole;
      delete d.dnsUpstreamId;
      delete d.dnsRecords;
      delete d.dnsForward;
    }

    if (
      (d.type === "router" || d.type === "firewall" || d.type === "l3switch") &&
      d.dhcpRole === "server"
    ) {
      if (
        d.dhcpReservations !== undefined &&
        !Array.isArray(d.dhcpReservations)
      )
        delete d.dhcpReservations;
      if (d.dhcpStart !== undefined && typeof d.dhcpStart !== "string")
        delete d.dhcpStart;
      if (d.dhcpEnd !== undefined && typeof d.dhcpEnd !== "string")
        delete d.dhcpEnd;
      _sanDhcpScopes(d);
    } else {
      delete d.dhcpRole;
      delete d.dhcpStart;
      delete d.dhcpEnd;
      delete d.dhcpReservations;
      delete d.dhcpScopes;
    }
  });

  const _sanDnsRecs = (n) => {
    if (!Array.isArray(n.dnsRecords)) n.dnsRecords = [];
    else
      n.dnsRecords = n.dnsRecords
        .filter((r) => r && typeof r === "object" && typeof r.name === "string")
        .map((r) => {
          const o = {
            id: r.id || uid("dr"),
            name: r.name,
            type: r.type === "CNAME" || r.type === "MX" ? r.type : "A",
            ttl:
              isFinite(+r.ttl) && +r.ttl > 0 ? Math.floor(+r.ttl) : DNS_TTL_DEF,
          };
          if (o.type === "CNAME")
            o.cname = typeof r.cname === "string" ? r.cname : "";
          else o.hostId = r.hostId || null;
          return o;
        });
    if (n.dnsForward === undefined) n.dnsForward = true;
  };

  const _dnsNodeOk = (id) =>
    (DB.hosts || []).some(
      (x) =>
        x.id === id && Array.isArray(x.services) && x.services.indexOf(53) >= 0,
    ) ||
    DB.devices.some(
      (x) =>
        x.id === id && (x.dnsRole === "forwarder" || x.dnsRole === "server"),
    );
  DB.devices.forEach((d) => {
    const role = d.dnsRole || "";
    if (role === "server") _sanDnsRecs(d);
    else {
      delete d.dnsRecords;
      delete d.dnsForward;
    }
    if (role !== "forwarder") delete d.dnsUpstreamId;
    else if (d.dnsUpstreamId !== undefined) {
      const u = d.dnsUpstreamId;
      const ok =
        u &&
        u !== d.id &&
        _dnsNodeOk(u) &&
        !DB.devices.some((x) => x.id === u && x.dnsRole === "forwarder");
      if (!ok) delete d.dnsUpstreamId;
    }
  });
  delete DB.zones;

  DB.hosts.forEach((h) => {
    if (!h.kind) {
      h.kind = h.role === "server" ? "server" : "pc";
      delete h.role;
    }
  });

  DB.hosts.forEach((h) => {
    if (h.kind === "dns") {
      h.kind = "server";
      if (!Array.isArray(h.services)) h.services = [];
      if (h.services.indexOf(53) < 0) h.services.push(53);
    }
  });

  DB.hosts.forEach((h) => {
    if (h.fqdn != null && typeof h.fqdn !== "string") delete h.fqdn;
    if (h.webNames !== undefined) {
      const wn = Array.isArray(h.webNames)
        ? h.webNames
            .filter((n) => typeof n === "string" && n.trim())
            .map((n) => n.trim())
        : [];
      if (
        wn.length &&
        Array.isArray(h.services) &&
        (h.services.indexOf(80) >= 0 || h.services.indexOf(443) >= 0)
      )
        h.webNames = wn;
      else delete h.webNames;
    }
    if (h.mailDomains !== undefined) {
      const md = Array.isArray(h.mailDomains)
        ? h.mailDomains
            .filter((n) => typeof n === "string" && n.trim())
            .map((n) => n.trim())
        : [];
      if (
        md.length &&
        Array.isArray(h.services) &&
        (h.services.indexOf(25) >= 0 || h.services.indexOf(143) >= 0)
      )
        h.mailDomains = md;
      else delete h.mailDomains;
    }

    if (h.dhcpStarve !== undefined && h.dhcpStarve !== true)
      delete h.dhcpStarve;
    if (h.arpSpoof !== undefined && h.arpSpoof !== true) delete h.arpSpoof;
    if (Array.isArray(h.services) && h.services.indexOf(67) >= 0) {
      if (
        h.dhcpReservations !== undefined &&
        !Array.isArray(h.dhcpReservations)
      )
        delete h.dhcpReservations;
      if (h.dhcpStart !== undefined && typeof h.dhcpStart !== "string")
        delete h.dhcpStart;
      if (h.dhcpEnd !== undefined && typeof h.dhcpEnd !== "string")
        delete h.dhcpEnd;
      _sanDhcpScopes(h);
    } else {
      delete h.dhcpStart;
      delete h.dhcpEnd;
      delete h.dhcpReservations;
      delete h.dhcpScopes;
    }

    if (h.dnsId !== undefined && (!h.dnsId || !_dnsNodeOk(h.dnsId)))
      delete h.dnsId;
    if (
      h.dnsId2 !== undefined &&
      (!h.dnsId || !h.dnsId2 || h.dnsId2 === h.dnsId || !_dnsNodeOk(h.dnsId2))
    )
      delete h.dnsId2;
    if (!Array.isArray(h.services) || h.services.indexOf(53) < 0) {
      delete h.dnsRecords;
      delete h.dnsForward;
      return;
    }
    if (!Array.isArray(h.dnsRecords)) h.dnsRecords = [];
    else
      h.dnsRecords = h.dnsRecords
        .filter((r) => r && typeof r === "object" && typeof r.name === "string")
        .map((r) => {
          const o = {
            id: r.id || uid("dr"),
            name: r.name,
            type: r.type === "CNAME" || r.type === "MX" ? r.type : "A",
            ttl:
              isFinite(+r.ttl) && +r.ttl > 0 ? Math.floor(+r.ttl) : DNS_TTL_DEF,
          };
          if (o.type === "CNAME")
            o.cname = typeof r.cname === "string" ? r.cname : "";
          else o.hostId = r.hostId || null;
          return o;
        });
    if (h.dnsForward === undefined) h.dnsForward = true;
  });

  DB.segments.forEach((s) => {
    if (s.isInternet) {
      if (s.icon !== "cloud") s.icon = "cloud";
      return;
    }
    if (!s.gwId) {
      const gw = typeof gatewaysOf === "function" ? [...gatewaysOf(s.id)] : [];
      if (gw.length) s.gwId = gw[0];
      else {
        const nb = neighborsOf(s.id)
          .map(getNode)
          .find((d) => d && L3TYPES.indexOf(d.type) >= 0);
        if (nb) s.gwId = nb.id;
      }
    }

    if (
      typeof s.dhcpMax === "number" &&
      s.dhcpMax >= 0 &&
      !s.dhcpStart &&
      !s.dhcpEnd
    ) {
      const c = parseCidr(s.subnet);
      if (c && c.bits < 31) {
        const base = c.start + 10;
        s.dhcpStart = intToIp(Math.min(base, c.end - 1));
        s.dhcpEnd = intToIp(Math.min(base + s.dhcpMax - 1, c.end - 1));
      }
      delete s.dhcpMax;
    }
    if (s.dhcpReservations !== undefined && !Array.isArray(s.dhcpReservations))
      delete s.dhcpReservations;

    if (
      s.dhcpSrvId !== undefined &&
      (!s.dhcpSrvId || !isDhcpServerNode(s.dhcpSrvId))
    )
      delete s.dhcpSrvId;
    if (
      s.dhcpRelayId !== undefined &&
      (!s.dhcpSrvId ||
        !s.dhcpRelayId ||
        !DB.devices.some(
          (x) => x.id === s.dhcpRelayId && L3TYPES.indexOf(x.type) >= 0,
        ))
    )
      delete s.dhcpRelayId;

    const _isDns = (h) =>
      Array.isArray(h.services) && h.services.indexOf(53) >= 0;
    if (s.dnsId === undefined) {
      const d = (DB.hosts || []).find((h) => _isDns(h) && h.segId === s.id);
      s.dnsId = d ? d.id : null;
    } else if (s.dnsId && !_dnsNodeOk(s.dnsId)) s.dnsId = null;
    if (
      s.dnsId2 !== undefined &&
      (!s.dnsId2 || !_dnsNodeOk(s.dnsId2) || s.dnsId2 === s.dnsId)
    )
      delete s.dnsId2;
  });
  if (typeof reconcileWifiClients === "function") reconcileWifiClients();

  DB.devices.concat(DB.hosts || []).forEach((d) => assignLinkSlots(d));
}

let _a11ySeq = 0,
  _a11yBusy = false;
function a11yUid() {
  return "a11y-" + ++_a11ySeq;
}

function aSet(el, k, v) {
  if (el.getAttribute(k) !== v) el.setAttribute(k, v);
}

function a11yLabels(root) {
  root.querySelectorAll("label:not([for])").forEach((lb) => {
    if (lb.querySelector("input,select,textarea")) return;
    const fld = lb.closest(".field,.port-row,.toggle-row") || lb.parentElement;
    if (!fld) return;
    let ctl = null;
    for (const c of fld.querySelectorAll("input,select,textarea")) {
      if (!lb.contains(c)) {
        ctl = c;
        break;
      }
    }
    if (!ctl) return;
    if (!ctl.id) ctl.id = a11yUid();
    lb.setAttribute("for", ctl.id);
  });
}

function a11yTables(root) {
  root.querySelectorAll("table.rules-tbl").forEach((tb) => {
    const ths = Array.from(tb.querySelectorAll("thead th"));
    if (!ths.length) return;
    const heads = ths.map((th) => {
      aSet(th, "scope", "col");
      return (th.textContent || "").trim();
    });
    let uniform = true;
    Array.from(tb.querySelectorAll("tbody tr")).forEach((tr, ri) => {
      const tds = Array.from(tr.children);
      if (tds.length === 1 && tds[0].hasAttribute("colspan")) return;
      if (tds.length !== heads.length) uniform = false;
      const rowTxt = "row " + (ri + 1);
      tds.forEach((td, ci) => {
        const h = heads[ci] || "";
        if (h) aSet(td, "data-lbl", h);
        td.querySelectorAll("input,select,textarea,button").forEach((c) => {
          if (c.getAttribute("aria-label")) return;
          let base = (c.getAttribute("title") || "").trim();
          if (!base && c.tagName === "BUTTON")
            base = (c.textContent || "").trim();
          if (c.tagName !== "BUTTON" || !base) base = h || base;
          else if (h && h !== base) base = h + ": " + base;
          if (base) aSet(c, "aria-label", base + " — " + rowTxt);
        });
      });
    });

    tb.classList.toggle("cards", uniform);
  });
}

function a11yIconBtns(root) {
  root.querySelectorAll("button[title]:not([aria-label])").forEach((b) => {
    const txt = (b.textContent || "").trim();
    if (txt.length <= 2 && !b.querySelector("svg"))
      b.setAttribute("aria-label", b.getAttribute("title"));
  });
}

function a11yTabs(root) {
  root.querySelectorAll(".subtabs,.rp-tabs,.tabs").forEach((g) => {
    aSet(g, "role", "tablist");
    g.querySelectorAll("button").forEach((b) => {
      aSet(b, "role", "tab");
      aSet(
        b,
        "aria-selected",
        b.classList.contains("active") ? "true" : "false",
      );
    });
  });
}

function a11yDialog(bg, box) {
  if (!bg || !box) return;
  const h = box.querySelector("h2,h3");
  if (h) {
    if (!h.id) h.id = a11yUid();
    aSet(bg, "aria-labelledby", h.id);
  } else bg.removeAttribute("aria-labelledby");
}

function a11yRowNames(root) {
  root.querySelectorAll("li,.port-row,.ss-row").forEach((row) => {
    const ctls = Array.from(
      row.querySelectorAll("input,select,textarea"),
    ).filter(
      (c) =>
        !c.getAttribute("aria-label") &&
        !c.getAttribute("title") &&
        !(c.labels && c.labels.length),
    );
    if (!ctls.length) return;
    const cl = row.cloneNode(true);
    cl.querySelectorAll("input,select,textarea,button").forEach((x) =>
      x.remove(),
    );
    const txt = (cl.textContent || "").replace(/\s+/g, " ").trim().slice(0, 60);
    if (!txt) return;
    ctls.forEach((c) => aSet(c, "aria-label", txt));
  });
}

function a11yFix(root) {
  if (!root || _a11yBusy) return;
  _a11yBusy = true;
  try {
    a11yLabels(root);
    a11yTables(root);
    a11yRowNames(root);
    a11yIconBtns(root);
    a11yTabs(root);
  } catch (e) {
    console.error("a11yFix", e);
  } finally {
    _a11yBusy = false;
  }
}

function a11yCanvasLabel() {
  try {
    const s = document.getElementById("svg");
    if (!s) return;
    const nd = (DB.devices || []).length + (DB.hosts || []).length,
      ns = (DB.segments || []).length,
      nl = (DB.links || []).length;

    const pe = (n, a, b) => n + " " + (Math.abs(n) === 1 ? a : b);
    aSet(s, "role", "img");
    aSet(
      s,
      "aria-label",
      "Network diagram: " +
        pe(nd, "device", "devices") +
        ", " +
        pe(ns, "network", "networks") +
        ", " +
        pe(nl, "link", "links") +
        ". Find the detailed text breakdown in the Topology Overview section in the right panel.",
    );
  } catch (e) {}
}

const _rmQuery = (function () {
  try {
    return window.matchMedia
      ? matchMedia("(prefers-reduced-motion: reduce)")
      : null;
  } catch (e) {
    return null;
  }
})();
function reducedMotion() {
  return !!(_rmQuery && _rmQuery.matches);
}

function mSpeed(v) {
  return reducedMotion() ? v * 12 : v;
}

document.addEventListener(
  "pointerdown",
  (e) => {
    const el = document.elementFromPoint(e.clientX, e.clientY);
    if (!el) return;
    const b = el.closest("button,input,select");
    if (!b || !b.disabled) return;
    const why = (b.getAttribute("title") || "").trim();
    if (why) setStatus(why, false);
  },
  true,
);

function a11yMenus() {
  [
    ["btnLearn", "learnPanel"],
    ["btnPresets", "presetPanel"],
    ["btnMore", "morePanel"],
  ].forEach(([bid, pid]) => {
    const b = $(bid),
      p = $(pid);
    if (!b || !p) return;
    b.setAttribute("aria-haspopup", "true");
    b.setAttribute("aria-controls", pid);
    b.setAttribute(
      "aria-expanded",
      p.classList.contains("open") ? "true" : "false",
    );
    new MutationObserver(() =>
      b.setAttribute(
        "aria-expanded",
        p.classList.contains("open") ? "true" : "false",
      ),
    ).observe(p, { attributes: true, attributeFilter: ["class"] });
  });
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    const open = ["presetPanel", "learnPanel", "morePanel"].find((id) => {
      const p = $(id);
      return p && p.classList.contains("open");
    });
    if (!open) return;
    closeMenus();
    const btn = {
      presetPanel: "btnPresets",
      learnPanel: "btnLearn",
      morePanel: "btnMore",
    }[open];
    const b = $(btn);
    if (b) b.focus();
  });
}

function a11yInit() {
  document.querySelectorAll(".pal-item").forEach((it) => {
    it.setAttribute("role", "button");
    it.setAttribute("tabindex", "0");
    it.addEventListener("keydown", (e) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      e.preventDefault();
      it.click();
    });
  });
  a11yFix(document.body);
  a11yCanvasLabel();
  a11yMenus();

  [
    ["modalBox", "modalBg"],
    ["portDlg", "portDlgBg"],
  ].forEach(([boxId, bgId]) => {
    const box = $(boxId),
      bg = $(bgId);
    if (!box || !bg) return;
    let pend = false;
    new MutationObserver(() => {
      if (pend || _a11yBusy) return;
      pend = true;
      requestAnimationFrame(() => {
        pend = false;
        a11yFix(box);
        a11yDialog(bg, box);
      });
    }).observe(box, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class"],
    });
  });

  const tp = $("testpanel");
  if (tp) {
    let pend2 = false;
    new MutationObserver((m) => {
      if (pend2 || _a11yBusy) return;
      if (m.every((x) => x.target.closest && x.target.closest("#trafficLog")))
        return;
      pend2 = true;
      requestAnimationFrame(() => {
        pend2 = false;
        a11yFix(tp);
      });
    }).observe(tp, { childList: true, subtree: true });
  }

  const mt = $("matrixTable");
  if (mt)
    new MutationObserver(() => {
      mt.querySelectorAll("thead th").forEach((th) => aSet(th, "scope", "col"));
      mt.querySelectorAll("tbody th").forEach((th) => aSet(th, "scope", "row"));
      mt.querySelectorAll("td.cell[data-src]:not([tabindex])").forEach((td) => {
        td.setAttribute("tabindex", "0");
        td.setAttribute("role", "button");
        td.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            td.click();
          }
        });
      });
    }).observe(mt, { childList: true, subtree: true });
}

async function init() {
  try {
    const v = parseFloat(localStorage.getItem("netsim_crs_fs"));
    if (v) document.documentElement.style.setProperty("--crs-fs", v + "px");
  } catch (e) {}
  let shared = null;
  const _hm = location.hash.match(/[#&]t=([^&]+)/);
  if (_hm) {
    try {
      shared = await decodeTopo(decodeURIComponent(_hm[1]));
    } catch (e) {
      shared = null;
      setTimeout(() => setStatus(t("stLinkError"), false), 0);
    }
  }

  let _hasDeepLink = false;
  try {
    const _qp = new URLSearchParams(location.search);
    _hasDeepLink = !!(_qp.get("course") || _qp.get("task"));
  } catch (e) {}
  DB = shared || loadDB();
  if (!DB || !DB.devices) {
    DB = seedDB();
    if (!shared) dropSavedDB();
  }
  try {
    migrateDB();
  } catch (e) {
    console.error(
      "migrateDB failed (corrupt share-link/state) → seedDB",
      e,
    );
    DB = seedDB();
    if (!shared) dropSavedDB();
    try {
      migrateDB();
    } catch (_) {}
  }
  $("topoName").value = DB.meta ? DB.meta.name : t("topoDefault");
  fillTrafficSelect();

  try {
    render();
    refreshSelects();
    fitView();
  } catch (e) {
    console.error("render failed (corrupt state) → seedDB", e);
    DB = seedDB();
    if (!shared) dropSavedDB();
    try {
      migrateDB();
    } catch (_) {}
    try {
      render();
      refreshSelects();
      fitView();
    } catch (_) {}
  }
  setView("diagram");
  initIcons();
  initPanelToggles();
  restoreActiveTask();
  restoreCourseMin();
  segActive(
    "segTheme",
    "data-theme",
    document.documentElement.getAttribute("data-theme"),
  );
  let welcomed = null,
    seenVer = null;
  try {
    welcomed = localStorage.getItem("netsim_welcomed");
    seenVer = localStorage.getItem("netsim_seen_version");
  } catch (e) {}
  let welcomeShown = false;

  const _optedOut = welcomed === "1" && seenVer === APP_VERSION;
  if (!shared && !_hasDeepLink && !_optedOut) {
    openWelcome(welcomed === "1" || seenVer ? "whatsnew" : "full");
    welcomeShown = true;
  }

  if (!welcomeShown && !maybeMobileHint()) initFeedbackBanner();
  histCommit();
  updateUndoButtons();
  try {
    a11yInit();
  } catch (e) {
    console.error("a11yInit", e);
  }
  if (shared) {
    try {
      history.replaceState(null, "", location.pathname + location.search);
    } catch (e) {}
    setStatus(t("stLinkLoaded"));
  }
}

function initFeedbackBanner() {
  const b = $("eaBanner");
  if (!b) return;
  if ($("pcHint")) return;
  try {
    if (sessionStorage.getItem("netsim_fb_shown") === "1") return;
    sessionStorage.setItem("netsim_fb_shown", "1");
  } catch (e) {}
  b.style.display = "";
  if (typeof syncMobTest === "function") syncMobTest();
  $("eaBannerCta").onclick = () => openFeedbackModal();
  const hide = () => {
    b.style.display = "none";
    if (typeof syncMobTest === "function") syncMobTest();
  };
  $("eaBannerX").onclick = hide;
  $("eaBannerDismiss").onclick = hide;
}

function maybeMobileHint() {
  let dismissed = false;
  try {
    dismissed = localStorage.getItem("netsim_pc_hint") === "1";
  } catch (e) {}
  if (dismissed) return false;
  if (!window.matchMedia || !window.matchMedia("(max-width:860px)").matches)
    return false;
  if ($("pcHint")) return false;
  const el = document.createElement("div");
  el.id = "pcHint";
  el.style.cssText =
    "position:fixed;left:12px;right:12px;bottom:12px;z-index:48;background:var(--panel);border:1px solid var(--line2);border-radius:12px;box-shadow:var(--shadow-sm);padding:12px 14px;display:flex;flex-direction:column;gap:10px;font-size:13px;line-height:1.5;color:var(--txt)";
  const msg = document.createElement("div");
  msg.textContent = t("mobileHintMsg");
  const btn = document.createElement("button");
  btn.className = "btn primary";
  btn.textContent = t("mobileHintOk");
  btn.style.alignSelf = "flex-end";
  btn.onclick = () => {
    try {
      localStorage.setItem("netsim_pc_hint", "1");
    } catch (e) {}
    el.remove();
  };
  el.appendChild(msg);
  el.appendChild(btn);
  document.body.appendChild(el);
}

$("segMode")
  .querySelectorAll("button")
  .forEach(
    (b) =>
      (b.onclick = () => {
        setMode(b.getAttribute("data-mode"), true);
        if (typeof syncPayloadField === "function") syncPayloadField();
      }),
  );
if ($("modeInfoBtn")) $("modeInfoBtn").onclick = () => openModeInfo();
setMode(appMode);

function syncMobTest() {
  const b = document.getElementById("mobTestBtn");
  if (!b) return;
  const goal = document.getElementById("btnTest");
  const off = typeof view !== "undefined" && view !== "diagram";
  if (off || !goal) {
    b.hidden = true;
    return;
  }

  const ea = document.getElementById("eaBanner");
  if (ea && ea.style.display !== "none") {
    b.hidden = true;
    return;
  }
  const r = goal.getBoundingClientRect();

  if (!r.width && !r.height) {
    b.hidden = true;
    return;
  }
  b.hidden = r.top < innerHeight - 8 && r.bottom > 0;
}
(function () {
  const b = document.getElementById("mobTestBtn");
  if (!b) return;
  b.onclick = () => {
    const tp = document.getElementById("testpanel");
    if (tp) tp.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  document.addEventListener("scroll", syncMobTest, {
    passive: true,
    capture: true,
  });
  addEventListener("resize", syncMobTest);
  syncMobTest();
})();

[
  ["palAdv", "netsim_pal_adv"],
  ["rpAdv", "netsim_rp_adv"],
].forEach(([id, key]) => {
  const d = document.getElementById(id);
  if (!d) return;
  try {
    if (localStorage.getItem(key) === "1") d.open = true;
  } catch (e) {}
  d.addEventListener("toggle", () => {
    try {
      localStorage.setItem(key, d.open ? "1" : "0");
    } catch (e) {}
  });
});

function applyTheme(th) {
  document.documentElement.setAttribute("data-theme", th);
  try {
    localStorage.setItem("netsim_theme", th);
  } catch (e) {}
  segActive("segTheme", "data-theme", th);
}
$("segTheme")
  .querySelectorAll("button")
  .forEach((b) => (b.onclick = () => applyTheme(b.getAttribute("data-theme"))));

const GOOGLE_FORM_URL = "";

function appDiagnostics() {
  const L = [];
  const row = (k, v) => L.push((k + " ").padEnd(20, " ") + " : " + v);
  const n = (a) => (a || []).length;

  row("version", "v" + APP_VERSION);
  row("collected", new Date().toLocaleString());

  const uad = navigator.userAgentData;
  row(
    "browser",
    (uad && uad.brands
      ? uad.brands.map((b) => b.brand + " " + b.version).join(", ")
      : navigator.userAgent) || "unknown",
  );
  row("platform", navigator.platform || "unknown");
  row("language", navigator.language || "unknown");
  row(
    "viewport",
    window.innerWidth +
      "x" +
      window.innerHeight +
      " @dpr" +
      (window.devicePixelRatio || 1),
  );
  row(
    "layout",
    window.matchMedia && window.matchMedia("(max-width:860px)").matches
      ? "narrow (mobile breakpoint)"
      : "wide",
  );
  row("touch", "ontouchstart" in window ? "yes" : "no");

  row("mode", appMode);
  row("theme", document.documentElement.getAttribute("data-theme") || "unknown");
  row("hints", typeof hintsOn !== "undefined" && hintsOn ? "on" : "off");

  row(
    "topology",
    n(DB.devices) +
      " devices, " +
      n(DB.hosts) +
      " hosts, " +
      n(DB.segments) +
      " segments, " +
      n(DB.links) +
      " links",
  );
  row("where", window.__nsWhere || "simulator");

  const errs = window.__nsErrors || [];
  L.push("");
  if (!errs.length) {
    L.push("Recent JS errors: none");
  } else {
    L.push("Recent JS errors (" + errs.length + "):");
    errs.forEach((e) => L.push("    " + e.t + "  " + e.kind + ": " + e.msg));
  }
  return L.join("\n");
}

function feedbackPromptHtml() {
  return (
    '<div class="fb-nudge">' +
    t("fbNudgeMsg") +
    ' <button type="button" class="fb-nudge-link" onclick="openFeedbackModal()">' +
    t("fbNudgeCta") +
    "</button></div>"
  );
}
function openFeedbackModal(opts) {
  const wantRoad = !!(opts && opts.roadmap);
  const formReady = /^https?:\/\//i.test(GOOGLE_FORM_URL);
  openModal(`
    <div class="fbf-head">
      <h2 style="font-family:var(--mono)">ⓘ networksim <span class="appver" style="color:var(--muted);font-size:12px;font-weight:400">v${APP_VERSION}</span></h2>
      <div class="ab-sec" style="color:var(--muted)">${t("fbIntro")}</div>
    </div>
    <div class="fbf-tabs" role="tablist">
      <button type="button" role="tab" id="fbfTabFb" aria-controls="fbfPaneFb" aria-selected="${wantRoad ? "false" : "true"}">${t("fbTabFeedback")}</button>
      <button type="button" role="tab" id="fbfTabRoad" aria-controls="fbfPaneRoad" aria-selected="${wantRoad ? "true" : "false"}">${t("fbTabRoadmap")}</button>
    </div>
    <div class="fbf-pane${wantRoad ? "" : " show"}" id="fbfPaneFb" role="tabpanel" aria-labelledby="fbfTabFb">
      ${
        formReady
          ? `<iframe class="fbf-frame" title="${t("fbTitle")}" src="${esc(GOOGLE_FORM_URL)}" loading="lazy" referrerpolicy="no-referrer"></iframe>`
          : `<div class="ab-sec" style="flex:1 1 auto;display:flex;align-items:center;justify-content:center;text-align:center;padding:20px;border:1px dashed var(--line2);border-radius:11px">${t("fbFormNote")}</div>`
      }
      <div class="fbf-diag">
        <div class="fbf-diag-t"><b>${t("fbDiagTitle")}</b>${t("fbDiagHint")}</div>
        <button class="btn" id="fbfCopy">${t("fbDiagBtn")}</button>
        <button class="btn" id="fbfShow">${t("fbDiagShow")}</button>
        <button class="btn" id="abClose">${t("fbCancel")}</button>
      </div>
      <textarea id="fbfDiagText" readonly hidden style="flex:0 0 auto;height:120px;margin-top:10px;background:var(--panel2);border:1px solid var(--line2);border-radius:9px;color:var(--txt);font:11.5px var(--mono);padding:9px;resize:vertical;white-space:pre"></textarea>
    </div>
    <div class="fbf-pane scroll${wantRoad ? " show" : ""}" id="fbfPaneRoad" role="tabpanel" aria-labelledby="fbfTabRoad">
      <h3 class="ab-h">${t("abRoadH")}</h3>
    ${[
      {
        cat: "abRoadCatDone",
        ico: "checkcircle",
        tag: "done",
        open: !!(opts && opts.roadmap),
        versions: [
          {
            ver: "v0.8",
            open: true,
            items: [
              "abRoadV8a",
              "abRoadV8b",
              "abRoadV8c",
              "abRoadV8d",
              "abRoadV8e",
              "abRoadV8f",
              "abRoadV8g",
              "abRoadV8h",
              "abRoadV8i",
              "abRoadV8j",
            ],
          },
          {
            ver: "v0.7",
            open: false,
            items: [
              "abRoadV7a",
              "abRoadV7b",
              "abRoadV7c",
              "abRoadV7d",
              "abRoadV7e",
              "abRoadV7f",
              "abRoadV7g",
              "abRoadV7h",
              "abRoadV7i",
              "abRoadV7j",
              "abRoadV7k",
            ],
          },
          {
            ver: "v0.6",
            open: false,
            items: [
              "abRoadV6a",
              "abRoadV6b",
              "abRoadV6c",
              "abRoadV6d",
              "abRoadV6e",
              "abRoadV6f",
              "abRoadV6g",
              "abRoadV6h",
              "abRoadV6i",
              "abRoadV6j",
              "abRoadV6k",
              "abRoadV6l",
              "abRoadV6n",
              "abRoadV6o",
              "abRoadV6p",
              "abRoadV6q",
              "abRoadV6r",
              "abRoadV6s",
              "abRoadV6t",
              "abRoadV6u",
              "abRoadV6v",
              "abRoadV6x",
            ],
          },
          {
            ver: "v0.5",
            open: false,
            items: [
              "abRoadV5a",
              "abRoadV5b",
              "abRoadV5c",
              "abRoadV5d",
              "abRoadV5e",
              "abRoadV5f",
              "abRoadV5g",
              "abRoadV5h",
              "abRoadV5i",
              "abRoadV5j",
              "abRoadV5k",
              "abRoadV5l",
            ],
          },
          {
            ver: "v0.4",
            open: false,
            items: [
              "abRoadV4a",
              "abRoadV4b",
              "abRoadV4c",
              "abRoadV4d",
              "abRoadV4e",
              "abRoadV4f",
              "abRoadV4g",
              "abRoadV4h",
              "abRoadV4i",
              "abRoadV4j",
              "abRoadV4k",
            ],
          },
          {
            ver: "v0.3",
            open: false,
            items: [
              "abRoadV3a",
              "abRoadV3b",
              "abRoadV3c",
              "abRoadV3d",
              "abRoadV3f",
              "abRoadV3g",
              "abRoadV3e",
            ],
          },
          {
            ver: "v0.2",
            open: false,
            items: [
              "abRoadCD1",
              "abRoadCD2",
              "abRoadCD3",
              "abRoadCD8",
              "abRoadCD6",
              "abRoadCD7",
              "abRoadCD4",
              "abRoadCD5",
              "abRoadCD9",
            ],
          },
          {
            ver: "v0.1",
            open: false,
            items: [
              "abRoadV1a",
              "abRoadV1b",
              "abRoadV1c",
              "abRoadV1d",
              "abRoadV1e",
              "abRoadV1f",
              "abRoadV1g",
              "abRoadV1h",
            ],
          },
        ],
      },
      {
        cat: "abRoadCatSoon",
        ico: "energy",
        tag: "soon",
        items: ["abRoadS6a"],
      },
      {
        cat: "abRoadCat5",
        ico: "learn",
        tag: "goal",
        items: ["abRoadC5a", "abRoadC5c"],
      },
    ]
      .map(
        (c) => `
    <details class="ab-cat"${c.open ? " open" : ""}>
      <summary><span>${icon(c.ico, "ico-a")}${t(c.cat)}</span><span class="ab-tag ${c.tag}">${t({ soon: "abSoon", idea: "abIdea", done: "abDone", goal: "abGoal" }[c.tag])}</span></summary>
      ${c.versions ? c.versions.map((v) => `<details class="ab-ver"${v.open ? " open" : ""}><summary>${v.ver}</summary><ul class="ab-road" data-nolp>${v.items.map((k) => `<li><span>${t(k)}</span></li>`).join("")}</ul></details>`).join("") : `<ul class="ab-road" data-nolp>${c.items.map((k) => `<li><span>${t(k)}</span></li>`).join("")}</ul>`}
    </details>`,
      )
      .join("")}
    <div class="ab-sec" style="color:var(--muted);margin-top:10px">${t("abRoadNote")}</div>
    </div>
  `);
  // openModal() clears the class list, so the fill modifier goes on afterwards.
  modalBox.classList.add("fbfill", "show");

  const fbPane = $("fbfPaneFb");
  const roadPane = $("fbfPaneRoad");
  const tabFb = $("fbfTabFb");
  const tabRoad = $("fbfTabRoad");
  const pick = (isFb) => {
    fbPane.classList.toggle("show", isFb);
    roadPane.classList.toggle("show", !isFb);
    tabFb.setAttribute("aria-selected", String(isFb));
    tabRoad.setAttribute("aria-selected", String(!isFb));
  };
  tabFb.onclick = () => pick(true);
  tabRoad.onclick = () => pick(false);
  pick(!wantRoad);

  $("abClose").onclick = closeModal;

  const diagBox = $("fbfDiagText");
  const fillDiag = () => {
    if (!diagBox.value) diagBox.value = appDiagnostics();
    return diagBox.value;
  };
  $("fbfShow").onclick = () => {
    fillDiag();
    const showing = diagBox.hasAttribute("hidden");
    if (showing) diagBox.removeAttribute("hidden");
    else diagBox.setAttribute("hidden", "");
    $("fbfShow").textContent = t(showing ? "fbDiagHide" : "fbDiagShow");
  };
  $("fbfCopy").onclick = () => {
    copyText(fillDiag()).then(
      () => setStatus(t("fbDiagCopied")),
      () => {
        // Clipboard API can reject on an insecure origin; show the text so the
        // reporter can still select it by hand.
        diagBox.removeAttribute("hidden");
        diagBox.focus();
        diagBox.select();
        setStatus(t("fbDiagFallback"), true);
      },
    );
  };
}
$("btnFeedback").onclick = openFeedbackModal;

const APP_VERSION = "0.7";
document.querySelectorAll(".appver").forEach((e) => {
  e.textContent = "v" + APP_VERSION;
});
function openWelcome(mode) {
  const wn = document.getElementById("wWhatsNew");
  if (wn) wn.open = mode === "whatsnew";
  const cb = $("wDontShow");
  if (cb) {
    try {
      cb.checked = localStorage.getItem("netsim_welcomed") === "1";
    } catch (e) {
      cb.checked = false;
    }
  }
  $("welcomeBg").classList.add("show");
}
function closeWelcome(surfaceFeedback) {
  try {
    if ($("wDontShow") && $("wDontShow").checked) {
      localStorage.setItem("netsim_welcomed", "1");
      localStorage.setItem("netsim_seen_version", APP_VERSION);
    } else {
      localStorage.removeItem("netsim_welcomed");
    }
  } catch (e) {}
  $("welcomeBg").classList.remove("show");

  if (surfaceFeedback) initFeedbackBanner();
}
if ($("wnMore"))
  $("wnMore").onclick = () => {
    closeWelcome(false);
    openFeedbackModal({ roadmap: true });
  };
$("wFirstTask").onclick = () => {
  closeWelcome();
  coachStart();
};
$("wStart").onclick = () => closeWelcome(true);
$("wClose").onclick = () => closeWelcome(true);
$("wExample").onclick = () => {
  closeWelcome(true);
  openWelcomePresets();
};
$("wCourse").onclick = () => {
  closeWelcome(false);
  ensureCourse(() => openCourse());
};
$("wTutorial").onclick = () => {
  closeWelcome(false);
  openTutorial(0);
};
function openWelcomePresets() {
  openModal(`
    <h2 style="font-family:var(--mono)">${t("wPickTitle")}</h2>
    <div style="display:flex;flex-direction:column;gap:4px;margin:6px 0 14px">
      ${getPresets()
        .map(
          (pr, i) =>
            `<button class="preset-item" style="border:1px solid var(--line2);background:var(--panel2)" data-wp="${i}">${esc(pr.name)}<small>${esc(pr.short || "")}</small></button>`,
        )
        .join("")}
    </div>
    <div style="display:flex;justify-content:flex-start">
      <button class="btn" id="wpClose">${t("wBack")}</button>
    </div>`);
  modalBox.querySelectorAll("[data-wp]").forEach(
    (b) =>
      (b.onclick = () => {
        closeModal();
        loadPreset(getPresets()[+b.getAttribute("data-wp")], true);
      }),
  );
  $("wpClose").onclick = () => {
    closeModal();
    openWelcome("full");
  };
}

window.addEventListener("resize", () => {});

function ensureCourse(cb) {
  if (window.__courseReady || typeof allCourses === "function") {
    trackModalOpeners();
    if (cb) cb();
    return;
  }
  (window.__courseCbs = window.__courseCbs || []).push(cb || null);
  if (window.__courseLoading) return;
  window.__courseLoading = true;
  var s = document.createElement("script");
  s.src = "courses/course-core.js";
  s.async = true;
  s.onload = function () {
    window.__courseReady = true;
    window.__courseLoading = false;
    trackModalOpeners();
    var q = window.__courseCbs || [];
    window.__courseCbs = [];
    q.forEach(function (f) {
      if (f) {
        try {
          f();
        } catch (e) {}
      }
    });
  };
  s.onerror = function () {
    window.__courseLoading = false;
    try {
      setStatus(
        "Failed to load the course.",
        false,
      );
    } catch (e) {}
  };
  document.head.appendChild(s);
}
init();

(function () {
  try {
    var tid = new URLSearchParams(location.search).get("task");
    if (!tid) return;
    var run = function () {
      try {
        var tk =
          typeof getTasks === "function"
            ? getTasks().find(function (x) {
                return x.id === tid;
              })
            : null;
        if (tk && typeof startTask === "function")
          startTask(tk, "tasks", canvasEmpty());
      } catch (e) {}
    };
    if (
      document.readyState === "complete" ||
      document.readyState === "interactive"
    )
      setTimeout(run, 0);
    else
      document.addEventListener("DOMContentLoaded", function () {
        setTimeout(run, 0);
      });
  } catch (e) {}
})();

(function () {
  try {
    var qp = new URLSearchParams(location.search),
      cRaw = qp.get("course");
    if (!cRaw) return;
    var run = function () {
      var cid = /^course\d+$/.test(cRaw)
        ? cRaw
        : "course" + cRaw.replace(/^c/i, "");
      var course = allCourses().find(function (c) {
        return c.id === cid;
      });
      if (!course) {
        if (typeof openCourse === "function") openCourse();
        return;
      }
      var lRaw = qp.get("lesson");
      var _ls = course.lessons || [];
      var les = lRaw
        ? _ls.find(function (le) {
            return le.id === lRaw;
          }) ||
          (/^\d+$/.test(lRaw) ? _ls[+lRaw - 1] : null) ||
          null
        : null;
      var target = les
        ? les.modules && les.modules[0]
          ? les.modules[0].id
          : les.id
        : null;
      setActiveCourse(course);
      if (target && typeof openCourseModule === "function")
        openCourseModule(target);
      else if (typeof openCourseLessons === "function") openCourseLessons();
    };
    if (typeof ensureCourse === "function") ensureCourse(run);
    else if (typeof allCourses === "function") run();
  } catch (e) {}
})();
