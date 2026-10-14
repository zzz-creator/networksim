"use strict";

let _incSt = {};
function taskIncident(scId) {
  const sc = INCIDENT_SCENARIOS.find((x) => x.id === scId);
  DB = presetEnt();
  migrateDB();
  _incSt[scId] = sc ? sc.apply() : null;
  return DB;
}
function incidentSolved(scId) {
  const sc = INCIDENT_SCENARIOS.find((x) => x.id === scId),
    st = _incSt[scId];
  if (!sc || !st) return false;
  try {
    return !!sc.solved(st);
  } catch (e) {
    return false;
  }
}
function incidentQuar(id) {
  const n = getNode(id);
  if (n) n.quar = true;
}
function getTasks() {
  return [
    {
      id: "first-steps",
      level: 1,
      tKey: "tk_fs_t",
      gKey: "tk_fs_g",
      setup: taskFirstSteps,
      solve: () => {
        DB.links.push({ id: "fss1", fromId: "fs_pc", toId: "fs_rt" });
        getNode("fs_pc").segId = "fs_lan";
      },
      flows: [
        {
          src: "fs_pc",
          dst: "fs_int",
          proto: "tcp",
          port: 443,
          expect: "allowed",
          k: "tk_fs_1",
        },
      ],
    },
    {
      id: "router-intro",
      level: 1,
      tKey: "tk_ri_t",
      gKey: "tk_ri_g",
      setup: taskRouterIntro,
      solve: () => {
        DB.devices.push({
          id: "ri_l3",
          type: "l3switch",
          label: "L3",
          acl: [],
          x: 430,
          y: 110,
        });
        DB.links.push(
          { id: "ris1", fromId: "ri_l3", toId: "ri_swa" },
          { id: "ris2", fromId: "ri_l3", toId: "ri_swb" },
        );
      },
      flows: [
        {
          src: "ri_pca",
          dst: "ri_pcb",
          proto: "tcp",
          port: 445,
          expect: "allowed",
          k: "tk_ri_1",
        },
      ],
    },
    {
      id: "two-nets",
      level: 1,
      observe: true,
      tKey: "tk_tn_t",
      gKey: "tk_tn_g",
      setup: taskTwoNets,
      solve: () => {},
      flows: [
        {
          src: "tn_pc",
          dst: "tn_srv",
          proto: "tcp",
          port: 443,
          expect: "allowed",
          k: "tk_tn_1",
        },
        {
          src: "tn_pc",
          dst: "tn_int",
          proto: "tcp",
          port: 443,
          expect: "allowed",
          k: "tk_tn_2",
        },
      ],
    },
    {
      id: "port-test",
      level: 1,
      observe: true,
      tKey: "tk_pt_t",
      gKey: "tk_pt_g",
      setup: taskPortTest,
      solve: () => {},
      flows: [
        {
          src: "pt_pc",
          dst: "pt_web",
          proto: "tcp",
          port: 443,
          expect: "allowed",
          k: "tk_pt_1",
        },
        {
          src: "pt_pc",
          dst: "pt_web",
          proto: "tcp",
          port: 80,
          expect: "blocked",
          by: "pt_fw",
          k: "tk_pt_2",
        },
      ],
    },
    {
      id: "dns-down",
      level: 1,
      observe: true,
      tKey: "tk_dnsdown_t",
      gKey: "tk_dnsdown_g",
      setup: taskDnsDown,
      solve: () => {},
      flows: [
        {
          src: "dn_pc",
          name: "web.acme.local",
          proto: "tcp",
          port: 443,
          expect: "dnsfail",
          err: "dnsUnreachable",
          k: "tk_dnsdown_1",
        },
        {
          src: "dn_pc",
          dst: "dn_web",
          proto: "tcp",
          port: 443,
          expect: "allowed",
          k: "tk_dnsdown_2",
        },
      ],
    },
    {
      id: "dns-rogue",
      level: 2,
      observe: true,
      tKey: "tk_dnsrogue_t",
      gKey: "tk_dnsrogue_g",
      setup: taskDnsRogue,
      solve: () => {},
      flows: [
        {
          src: "dr_pc",
          name: "web.acme.local",
          proto: "tcp",
          port: 443,
          expect: "allowed",
          resolvesTo: "dr_evil",
          k: "tk_dnsrogue_1",
        },
        {
          src: "dr_pc",
          dst: "dr_web",
          proto: "tcp",
          port: 443,
          expect: "allowed",
          k: "tk_dnsrogue_2",
        },
      ],
    },
    {
      id: "dns-backup",
      mode: "advanced",
      level: 2,
      tKey: "tk_dnsbk_t",
      gKey: "tk_dnsbk_g",
      setup: taskDnsBackup,
      solve: () => {
        const s = DB.segments.find((x) => x.id === "pd_lan");
        if (s) s.dnsId2 = "pd_dns2";
      },
      flows: [
        {
          src: "pd_pc",
          name: "web.acme.local",
          proto: "tcp",
          port: 443,
          expect: "allowed",
          k: "tk_dnsbk_1",
        },
        {
          src: "pd_pc",
          dst: "pd_web",
          proto: "tcp",
          port: 443,
          expect: "allowed",
          k: "tk_dnsbk_2",
        },
      ],
    },
    {
      id: "dhcp-starvation",
      mode: "advanced",
      level: 2,
      tKey: "tk_dhstv_t",
      gKey: "tk_dhstv_g",
      setup: taskDhcpStarv,
      solve: () => {
        const l = DB.links.find((x) => x.id === "dvl3");
        if (l)
          l.port = Object.assign({}, l.port || {}, {
            mode: "access",
            sec: { max: 1, mac: "02:aa:bb:cc:dd:ee" },
          });
      },
      flows: [
        {
          src: "dv_pc",
          dst: "dv_srv",
          proto: "tcp",
          port: 445,
          expect: "allowed",
          k: "tk_dhstv_1",
        },
      ],
    },
    {
      id: "subnet-lab",
      level: 1,
      observe: true,
      tKey: "tk_sl_t",
      gKey: "tk_sl_g",
      setup: taskSubnetLab,
      solve: () => {},
      flows: [
        {
          src: "sl_pca",
          dst: "sl_srvb",
          proto: "tcp",
          port: 443,
          expect: "allowed",
          k: "tk_sl_1",
        },
        {
          src: "sl_pcb",
          dst: "sl_srva",
          proto: "tcp",
          port: 443,
          expect: "allowed",
          k: "tk_sl_2",
        },
      ],
    },
    {
      id: "nat-lab",
      level: 1,
      observe: true,
      tKey: "tk_nl_t",
      gKey: "tk_nl_g",
      setup: taskNatLab,
      solve: () => {},
      flows: [
        {
          src: "nl_pc",
          dst: "nl_int",
          proto: "tcp",
          port: 443,
          expect: "allowed",
          k: "tk_nl_1",
        },
        {
          src: "nl_pc",
          dst: "nl_int",
          proto: "tcp",
          port: 80,
          expect: "allowed",
          k: "tk_nl_2",
        },
      ],
    },
    {
      id: "web-dmz",
      level: 1,
      tKey: "tk_webdmz_t",
      gKey: "tk_webdmz_g",
      setup: taskWebDmz,
      solve: () => {
        getNode("t_fw").firewallRules.push({
          id: "sv",
          srcZone: "zo",
          dstZone: "zd",
          srcSeg: "*",
          dstSeg: "*",
          action: "permit",
          proto: "tcp",
          portOp: "eq",
          port: 443,
          port2: null,
        });
      },
      flows: [
        {
          src: "t_int",
          dst: "t_web",
          proto: "tcp",
          port: 443,
          expect: "allowed",
          k: "tk_webdmz_1",
        },
        {
          src: "t_int",
          dst: "t_db",
          proto: "tcp",
          port: 445,
          expect: "blocked",
          by: "t_fw",
          k: "tk_webdmz_2",
        },
        {
          src: "t_int",
          dst: "t_web",
          proto: "tcp",
          port: 80,
          expect: "blocked",
          by: "t_fw",
          k: "tk_webdmz_3",
        },
      ],
    },
    {
      id: "vlan-split",
      level: 1,
      tKey: "tk_vsp_t",
      gKey: "tk_vsp_g",
      setup: taskVlanSplit,
      solve: () => {
        DB.segments.push({
          id: "vs_mk",
          name: "VLAN20 Marketing",
          subnet: "10.0.2.0/24",
          vlan: "20",
          color: "#f472b6",
          icon: "lan",
        });
        DB.links.push({ id: "vsl6", fromId: "vs_sw", toId: "vs_mk" });
        getNode("vs_mkt").segId = "vs_mk";
        getNode("vs_nas").segId = "vs_mk";
      },
      flows: [
        {
          src: "vs_uc",
          dst: "vs_srv",
          proto: "tcp",
          port: 445,
          expect: "allowed",
          k: "tk_vsp_1",
        },
        {
          src: "vs_mkt",
          dst: "vs_srv",
          proto: "tcp",
          port: 445,
          expect: "blocked",
          k: "tk_vsp_2",
        },
        {
          src: "vs_mkt",
          dst: "vs_nas",
          proto: "tcp",
          port: 445,
          expect: "allowed",
          k: "tk_vsp_3",
        },
      ],
      checks: [{ k: "tk_vsp_4", ok: () => vsSplitOk() }],
    },
    {
      id: "trunk-setup",
      level: 2,
      mode: "advanced",
      tKey: "tk_trs_t",
      gKey: "tk_trs_g",
      setup: taskTrunkSetup,
      solve: () => {
        const l = DB.links.find((x) => x.id === "trl1");
        l.port = { mode: "trunk", vlans: ["tr_v10", "tr_v20"] };
      },
      flows: [
        {
          src: "tr_pc10b",
          dst: "tr_pc10a",
          proto: "tcp",
          port: 445,
          expect: "allowed",
          k: "tk_trs_1",
        },
        {
          src: "tr_pc20b",
          dst: "tr_srv20",
          proto: "tcp",
          port: 445,
          expect: "allowed",
          k: "tk_trs_2",
        },
      ],
      checks: [
        {
          k: "tk_trs_3",
          ok: () => {
            const l = (DB.links || []).find((x) => x.id === "trl1");
            return !!(
              l &&
              l.port &&
              l.port.mode === "trunk" &&
              linkCarriesVlan(l, "tr_v10") &&
              linkCarriesVlan(l, "tr_v20")
            );
          },
        },
      ],
    },
    {
      id: "guest-iso",
      level: 1,
      tKey: "tk_guest_t",
      gKey: "tk_guest_g",
      setup: taskGuestIso,
      solve: () => {
        getNode("t_core").acl.push({
          id: "sv",
          srcSeg: "t_guest",
          dstSeg: "t_srvn",
          action: "deny",
          proto: "ip",
          portOp: "any",
          port: null,
          port2: null,
        });
      },
      flows: [
        {
          src: "t_g",
          dst: "t_srv",
          proto: "tcp",
          port: 445,
          expect: "blocked",
          by: "t_core",
          k: "tk_guest_1",
        },
        {
          src: "t_g",
          dst: "t_int",
          proto: "tcp",
          port: 443,
          expect: "allowed",
          k: "tk_guest_2",
        },
        {
          src: "t_pc",
          dst: "t_srv",
          proto: "tcp",
          port: 445,
          expect: "allowed",
          k: "tk_guest_3",
        },
        {
          src: "t_g",
          dst: "t_srv",
          proto: "tcp",
          port: 3389,
          expect: "blocked",
          by: "t_core",
          k: "tk_guest_4",
        },
      ],
    },
    {
      id: "ids-to-ips",
      level: 1,
      tKey: "tk_idsips_t",
      gKey: "tk_idsips_g",
      setup: taskIdsIps,
      solve: () => {
        getNode("ii_ids").mode = "ips";
      },
      flows: [
        {
          src: "ii_int",
          dst: "ii_web",
          proto: "tcp",
          port: 443,
          content: "malware",
          expect: "blocked",
          by: "ii_ids",
          k: "tk_idsips_1",
        },
        {
          src: "ii_int",
          dst: "ii_web",
          proto: "tcp",
          port: 443,
          expect: "allowed",
          k: "tk_idsips_2",
        },
      ],
    },
    {
      id: "tls-blind",
      mode: "advanced",
      level: 2,
      tKey: "tk_tls_t",
      gKey: "tk_tls_g",
      setup: taskTlsBlind,
      solve: () => {
        getNode("tb_ips").tlsInspect = true;
      },
      flows: [
        {
          src: "tb_int",
          dst: "tb_web",
          proto: "tcp",
          port: 80,
          content: "sqli",
          expect: "blocked",
          by: "tb_ips",
          k: "tk_tls_1",
        },
        {
          src: "tb_int",
          dst: "tb_web",
          proto: "tcp",
          port: 443,
          content: "sqli",
          expect: "blocked",
          by: "tb_ips",
          k: "tk_tls_2",
        },
        {
          src: "tb_int",
          dst: "tb_web",
          proto: "tcp",
          port: 443,
          expect: "allowed",
          k: "tk_tls_3",
        },
      ],
    },
    {
      id: "ips-sqli",
      level: 1,
      tKey: "tk_sqli_t",
      gKey: "tk_sqli_g",
      setup: taskIpsSqli,
      solve: () => {
        getNode("t_ips").signatures.push({
          id: "sv",
          label: "SQLi",
          content: "sqli",
        });
      },
      flows: [
        {
          src: "t_int",
          dst: "t_web",
          proto: "tcp",
          port: 443,
          content: "sqli",
          expect: "blocked",
          by: "t_ips",
          k: "tk_sqli_1",
        },
        {
          src: "t_int",
          dst: "t_web",
          proto: "tcp",
          port: 443,
          expect: "allowed",
          k: "tk_sqli_2",
        },
      ],
    },
    {
      id: "wiretap",
      level: 2,
      mode: "advanced",
      tKey: "tk_wt_t",
      gKey: "tk_wt_g",
      setup: taskWiretap,
      solve: () => {
        const fw = getNode("wt_fw");
        fw.simpleRules = fw.simpleRules.filter((r) => r.port !== 23);
        const h = getNode("wt_srv1");
        h.services = h.services.filter((p) => p !== 23);
      },
      flows: [
        {
          src: "wt_adm",
          dst: "wt_srv1",
          proto: "tcp",
          port: 23,
          expect: "blocked",
          k: "tk_wt_1",
        },
        {
          src: "wt_adm",
          dst: "wt_srv1",
          proto: "tcp",
          port: 22,
          expect: "allowed",
          k: "tk_wt_2",
        },
      ],
      checks: [
        {
          k: "tk_wt_3",
          ok: () => {
            const h = getNode("wt_srv1");
            return !!h && (h.services || []).indexOf(23) < 0;
          },
        },
      ],
    },
    {
      id: "block-telnet",
      level: 2,
      tKey: "tk_telnet_t",
      gKey: "tk_telnet_g",
      setup: taskBlockTelnet,
      solve: () => {
        getNode("bt_core").acl.push({
          id: "sv",
          srcSeg: "bt_ws",
          dstSeg: "bt_srv",
          action: "deny",
          proto: "tcp",
          portOp: "eq",
          port: 23,
          port2: null,
        });
      },
      flows: [
        {
          src: "bt_pc",
          dst: "bt_mgmt",
          proto: "tcp",
          port: 23,
          expect: "blocked",
          by: "bt_core",
          k: "tk_telnet_1",
        },
        {
          src: "bt_pc",
          dst: "bt_mgmt",
          proto: "tcp",
          port: 22,
          expect: "allowed",
          k: "tk_telnet_2",
        },
      ],
    },
    {
      id: "dmz-pivot",
      level: 2,
      tKey: "tk_pivot_t",
      gKey: "tk_pivot_g",
      setup: taskDmzPivot,
      solve: () => {
        const fw = getNode("dp_fw");
        fw.firewallRules = fw.firewallRules.filter((r) => r.id !== "r2");
      },
      flows: [
        {
          src: "dp_int",
          dst: "dp_web",
          proto: "tcp",
          port: 443,
          expect: "allowed",
          k: "tk_pivot_1",
        },
        {
          src: "dp_web",
          dst: "dp_db",
          proto: "tcp",
          port: 1433,
          expect: "blocked",
          by: "dp_fw",
          k: "tk_pivot_2",
        },
        {
          src: "dp_web",
          dst: "dp_db",
          proto: "tcp",
          port: 445,
          expect: "blocked",
          by: "dp_fw",
          k: "tk_pivot_3",
        },
      ],
    },
    {
      id: "default-deny",
      level: 2,
      tKey: "tk_deny_t",
      gKey: "tk_deny_g",
      setup: taskDefaultDeny,
      solve: () => {
        const fw = getNode("dd_fw");
        fw.defaultAction = "deny";
        fw.simpleRules = [
          {
            id: "sv",
            srcSeg: "dd_int",
            dstSeg: "dd_dmz",
            action: "permit",
            proto: "tcp",
            portOp: "eq",
            port: 443,
            port2: null,
          },
        ];
      },
      flows: [
        {
          src: "dd_int",
          dst: "dd_web",
          proto: "tcp",
          port: 443,
          expect: "allowed",
          k: "tk_deny_1",
        },
        {
          src: "dd_int",
          dst: "dd_db",
          proto: "tcp",
          port: 1433,
          expect: "blocked",
          by: "dd_fw",
          k: "tk_deny_2",
        },
        {
          src: "dd_int",
          dst: "dd_web",
          proto: "tcp",
          port: 80,
          expect: "blocked",
          by: "dd_fw",
          k: "tk_deny_3",
        },
      ],
    },
    {
      id: "inter-vlan",
      level: 1,
      tKey: "tk_ivlan_t",
      gKey: "tk_ivlan_g",
      setup: taskInterVlan,
      solve: () => {
        DB.devices.push({
          id: "iv_l3",
          type: "l3switch",
          label: "L3",
          acl: [],
          x: 430,
          y: 110,
        });
        DB.links.push(
          { id: "ivs1", fromId: "iv_l3", toId: "iv_swa" },
          { id: "ivs2", fromId: "iv_l3", toId: "iv_swb" },
        );
      },
      flows: [
        {
          src: "iv_pc",
          dst: "iv_srv",
          proto: "tcp",
          port: 445,
          expect: "allowed",
          k: "tk_ivlan_1",
        },
      ],
    },
    {
      id: "ospf-cost",
      level: 2,
      observe: true,
      tKey: "tk_ospf_t",
      gKey: "tk_ospf_g",
      setup: taskOspfCost,
      solve: () => {},
      flows: [
        {
          src: "oc_pc",
          dst: "oc_srv",
          proto: "tcp",
          port: 80,
          expect: "allowed",
          k: "tk_ospf_1",
        },
      ],
    },
    {
      id: "stp-loop",
      level: 2,
      observe: true,
      tKey: "tk_stp_t",
      gKey: "tk_stp_g",
      setup: taskStpLoop,
      solve: () => {},
      flows: [
        {
          src: "sp_pc",
          dst: "sp_srv",
          proto: "tcp",
          port: 80,
          expect: "allowed",
          k: "tk_stp_1",
        },
      ],
    },
    {
      id: "stp-redundant",
      level: 3,
      observe: true,
      tKey: "tk_stpr_t",
      gKey: "tk_stpr_g",
      setup: taskStpRedundant,
      solve: () => {},
      flows: [
        {
          src: "sr_pc",
          dst: "sr_srv",
          proto: "tcp",
          port: 80,
          expect: "allowed",
          k: "tk_stpr_1",
        },
      ],
    },
    {
      id: "ospf-fix",
      level: 2,
      tKey: "tk_ofix_t",
      gKey: "tk_ofix_g",
      setup: taskOspfFix,
      solve: () => {
        DB.links
          .filter((l) => l.id === "ofl1" || l.id === "ofl2")
          .forEach((l) => {
            l.cost = 50;
          });
      },
      flows: [
        {
          src: "of_pc",
          dst: "of_srv",
          proto: "tcp",
          port: 80,
          expect: "allowed",
          k: "tk_ofix_1",
        },
      ],
      checks: [
        {
          k: "tk_ofix_2",
          ok: () => {
            try {
              const r = evaluateEP("of_pc", "of_srv", {
                proto: "tcp",
                port: 80,
              });
              return (
                r.status === "allowed" && (r.path || []).indexOf("of_rx") < 0
              );
            } catch (e) {
              return false;
            }
          },
        },
      ],
    },
    {
      id: "hsrp",
      level: 2,
      observe: true,
      tKey: "tk_hsrp_t",
      gKey: "tk_hsrp_g",
      setup: taskHsrp,
      solve: () => {},
      flows: [
        {
          src: "hs_pc",
          dst: "hs_int",
          proto: "tcp",
          port: 443,
          expect: "allowed",
          k: "tk_hsrp_1",
        },
      ],
    },
    {
      id: "port-fwd",
      level: 2,
      tKey: "tk_pfwd_t",
      gKey: "tk_pfwd_g",
      setup: taskPortFwd,
      solve: () => {
        getNode("pf_fw").portForwards.push({
          id: "pf",
          proto: "tcp",
          pubPort: 443,
          hostId: "pf_web",
          intPort: 443,
        });
      },
      flows: [
        {
          src: "pf_int",
          dst: "pf_web",
          proto: "tcp",
          port: 443,
          expect: "allowed",
          k: "tk_pfwd_1",
        },
      ],
      checks: [
        {
          k: "tk_pfwd_2",
          ok: () => {
            const fw = getNode("pf_fw");
            return (
              !!fw &&
              (fw.portForwards || []).some(
                (p) => p && +p.pubPort === 443 && p.hostId === "pf_web",
              )
            );
          },
        },
      ],
    },
    {
      id: "static-nat",
      level: 2,
      tKey: "tk_snat_t",
      gKey: "tk_snat_g",
      setup: taskStaticNat,
      solve: () => {
        getNode("sn_fw").staticNat.push({
          id: "sn",
          hostId: "sn_web",
          publicIp: "203.0.113.20",
        });
      },
      flows: [
        {
          src: "sn_int",
          dst: "sn_web",
          proto: "tcp",
          port: 443,
          expect: "allowed",
          k: "tk_snat_1",
        },
        {
          src: "sn_int",
          dst: "sn_web",
          proto: "tcp",
          port: 22,
          expect: "allowed",
          k: "tk_snat_2",
        },
      ],
      checks: [
        {
          k: "tk_snat_3",
          ok: () => {
            const fw = getNode("sn_fw");
            return (
              !!fw &&
              (fw.staticNat || []).some((x) => x && x.hostId === "sn_web")
            );
          },
        },
      ],
    },
    {
      id: "def-route",
      mode: "advanced",
      level: 1,
      tKey: "tk_drt_t",
      gKey: "tk_drt_g",
      setup: taskDefRoute,
      solve: () => {
        getNode("dr_r").routes = [
          { id: "dv", dest: "0.0.0.0/0", via: "dr_isp" },
        ];
      },
      flows: [
        {
          src: "dr_pc",
          dst: "dr_srv",
          proto: "tcp",
          port: 443,
          expect: "allowed",
          k: "tk_drt_1",
        },
        {
          src: "dr_pc",
          dst: "dr_int",
          proto: "tcp",
          port: 443,
          expect: "allowed",
          k: "tk_drt_2",
        },
      ],
      checks: [
        {
          k: "tk_drt_3",
          ok: () => {
            const r = getNode("dr_r");
            return !!(
              r && (r.routes || []).some((x) => x && x.dest === "0.0.0.0/0")
            );
          },
        },
      ],
    },
    {
      id: "subnet-plan",
      level: 2,
      tKey: "tk_spl_t",
      gKey: "tk_spl_g",
      setup: taskSubnetPlan,
      solve: () => {
        getNode("sp_off").subnet = "192.168.10.0/26";
        getNode("sp_wh").subnet = "192.168.10.64/27";
        getNode("sp_srv").subnet = "192.168.10.96/28";
      },
      flows: [
        {
          src: "sp_pc",
          dst: "sp_srvh",
          proto: "tcp",
          port: 445,
          expect: "allowed",
          k: "tk_spl_1",
        },
        {
          src: "sp_scan",
          dst: "sp_srvh",
          proto: "tcp",
          port: 445,
          expect: "allowed",
          k: "tk_spl_2",
        },
      ],
      checks: [{ k: "tk_spl_3", ok: () => spPlanOk() }],
    },
    {
      id: "static-route",
      mode: "advanced",
      level: 2,
      tKey: "tk_srt_t",
      gKey: "tk_srt_g",
      setup: taskStaticRoute,
      solve: () => {
        getNode("sta_r1").routes = [
          { id: "sv", dest: "192.168.2.0/24", via: "sta_r2" },
        ];
      },
      flows: [
        {
          src: "sta_pc",
          dst: "sta_srv",
          proto: "tcp",
          port: 443,
          expect: "allowed",
          k: "tk_srt_1",
        },
      ],
      checks: [
        {
          k: "tk_srt_2",
          ok: () => {
            const r = getNode("sta_r1");
            return (
              !!r &&
              (r.routes || []).some((x) => x && x.dest === "192.168.2.0/24")
            );
          },
        },
      ],
    },
    {
      id: "ch-otseg",
      challenge: true,
      level: 3,
      tKey: "tk_chots_t",
      gKey: "tk_chots_g",
      setup: taskChOtSeg,
      solve: () => {
        const fw = getNode("os_fw");
        fw.defaultAction = "deny";
        fw.simpleRules = [
          {
            id: "s1",
            srcSeg: "os_it",
            dstSeg: "os_dmz",
            action: "permit",
            proto: "tcp",
            portOp: "eq",
            port: 1433,
            port2: null,
          },
          {
            id: "s2",
            srcSeg: "os_dmz",
            dstSeg: "os_ot",
            action: "permit",
            proto: "tcp",
            portOp: "eq",
            port: 502,
            port2: null,
          },
        ];
      },
      flows: [
        {
          src: "os_pc",
          dst: "os_plc",
          proto: "tcp",
          port: 502,
          expect: "blocked",
          k: "tk_chots_1",
        },
        {
          src: "os_pc",
          dst: "os_hist",
          proto: "tcp",
          port: 1433,
          expect: "allowed",
          k: "tk_chots_2",
        },
        {
          src: "os_hist",
          dst: "os_plc",
          proto: "tcp",
          port: 502,
          expect: "allowed",
          k: "tk_chots_3",
        },
        {
          src: "os_hmi",
          dst: "os_plc",
          proto: "tcp",
          port: 502,
          expect: "allowed",
          k: "tk_chots_4",
        },
      ],
    },
    {
      id: "ch-rtpf",
      challenge: true,
      level: 1,
      tKey: "tk_chrtpf_t",
      gKey: "tk_chrtpf_g",
      setup: taskChRtPf,
      solve: () => {
        getNode("rp_rt").portForwards.push({
          id: "sv",
          proto: "tcp",
          pubPort: 443,
          hostId: "rp_nas",
          intPort: 443,
        });
      },
      flows: [
        {
          src: "rp_pc",
          dst: "rp_int",
          proto: "tcp",
          port: 443,
          expect: "allowed",
          k: "tk_chrtpf_1",
        },
        {
          src: "rp_int",
          dst: "rp_nas",
          proto: "tcp",
          port: 443,
          expect: "allowed",
          k: "tk_chrtpf_2",
        },
      ],
    },
    {
      id: "ch-web",
      challenge: true,
      level: 1,
      tKey: "tk_chweb_t",
      gKey: "tk_chweb_g",
      setup: taskChWeb,
      solve: () => {
        getNode("cw_fw").firewallRules.push({
          id: "sv",
          srcZone: "zo",
          dstZone: "zd",
          srcSeg: "*",
          dstSeg: "*",
          action: "permit",
          proto: "tcp",
          portOp: "eq",
          port: 443,
          port2: null,
        });
      },
      flows: [
        {
          src: "cw_int",
          dst: "cw_web",
          proto: "tcp",
          port: 443,
          expect: "allowed",
          k: "tk_chweb_1",
        },
      ],
      checks: [
        {
          k: "tk_chweb_2",
          ok: () => {
            const fw = getNode("cw_fw");
            return !!fw && fw.defaultAction === "deny";
          },
        },
      ],
    },
    {
      id: "ch-vlan",
      challenge: true,
      level: 2,
      tKey: "tk_chvlan_t",
      gKey: "tk_chvlan_g",
      setup: taskChVlan,
      solve: () => {
        DB.devices.push({
          id: "cv_l3",
          type: "l3switch",
          label: "L3",
          acl: [],
          x: 430,
          y: 110,
        });
        DB.links.push(
          { id: "cvs1", fromId: "cv_l3", toId: "cv_swa" },
          { id: "cvs2", fromId: "cv_l3", toId: "cv_swb" },
        );
      },
      flows: [
        {
          src: "cv_pc",
          dst: "cv_srv",
          proto: "tcp",
          port: 445,
          expect: "allowed",
          k: "tk_chvlan_1",
        },
      ],
    },
    {
      id: "ch-guest",
      challenge: true,
      level: 2,
      tKey: "tk_chguest_t",
      gKey: "tk_chguest_g",
      setup: taskChGuest,
      solve: () => {
        getNode("cg_core").acl.push({
          id: "sv",
          srcSeg: "cg_guest",
          dstSeg: "cg_srvn",
          action: "deny",
          proto: "ip",
          portOp: "any",
          port: null,
          port2: null,
        });
      },
      flows: [
        {
          src: "cg_g",
          dst: "cg_srv",
          proto: "tcp",
          port: 1433,
          expect: "blocked",
          by: "cg_core",
          k: "tk_chguest_1",
        },
        {
          src: "cg_pc",
          dst: "cg_srv",
          proto: "tcp",
          port: 1433,
          expect: "allowed",
          k: "tk_chguest_2",
        },
      ],
    },
    {
      id: "ch-portvlan",
      challenge: true,
      mode: "advanced",
      level: 2,
      tKey: "tk_chpv_t",
      gKey: "tk_chpv_g",
      setup: taskChPortVlan,
      solve: () => {
        const l = DB.links.find((x) => x.id === "cpl3");
        if (l) l.port = { mode: "access", vlan: "cp_v10" };
      },
      flows: [
        {
          src: "cp_pc",
          dst: "cp_srv",
          proto: "tcp",
          port: 445,
          expect: "allowed",
          k: "tk_chpv_1",
        },
      ],
      checks: [
        {
          k: "tk_chpv_2",
          ok: () => {
            const l = (DB.links || []).find((x) => x.id === "cpl3");
            return !!(
              l &&
              l.port &&
              l.port.mode === "access" &&
              l.port.vlan === "cp_v10"
            );
          },
        },
      ],
    },
    {
      id: "ch-down",
      challenge: true,
      level: 1,
      tKey: "tk_chdn_t",
      gKey: "tk_chdn_g",
      setup: taskChDown,
      solve: () => {
        getNode("cd_core").down = false;
      },
      flows: [
        {
          src: "cd_pc",
          dst: "cd_srv",
          proto: "tcp",
          port: 445,
          expect: "allowed",
          k: "tk_chdn_1",
        },
      ],
    },
    {
      id: "ch-ids",
      challenge: true,
      level: 2,
      tKey: "tk_chids_t",
      gKey: "tk_chids_g",
      setup: taskChIds,
      solve: () => {
        getNode("ci_ids").mode = "ips";
      },
      flows: [
        {
          src: "ci_int",
          dst: "ci_web",
          proto: "tcp",
          port: 443,
          content: "malware",
          expect: "blocked",
          by: "ci_ids",
          k: "tk_chids_1",
        },
        {
          src: "ci_int",
          dst: "ci_web",
          proto: "tcp",
          port: 443,
          expect: "allowed",
          k: "tk_chids_2",
        },
      ],
    },
    {
      id: "ch-gw",
      challenge: true,
      mode: "advanced",
      level: 2,
      tKey: "tk_chgw_t",
      gKey: "tk_chgw_g",
      setup: taskChGw,
      solve: () => {
        getNode("gw_pc").gw = "10.0.10.1";
      },
      flows: [
        {
          src: "gw_pc",
          dst: "gw_srv",
          proto: "tcp",
          port: 445,
          expect: "allowed",
          k: "tk_chgw_1",
        },
      ],
    },
    {
      id: "ch-dhcp",
      challenge: true,
      mode: "advanced",
      level: 2,
      tKey: "tk_chdh_t",
      gKey: "tk_chdh_g",
      setup: taskChDhcp,
      solve: () => {
        delete getNode("dh_lan").dhcp;
      },
      flows: [
        {
          src: "dh_pc",
          dst: "dh_srv",
          proto: "tcp",
          port: 445,
          expect: "allowed",
          k: "tk_chdh_1",
        },
      ],
    },
    {
      id: "ch-portsec",
      challenge: true,
      mode: "advanced",
      level: 2,
      tKey: "tk_chps_t",
      gKey: "tk_chps_g",
      setup: taskChPortSec,
      solve: () => {
        const l = DB.links.find((x) => x.id === "psl1");
        if (l && l.port && l.port.sec) delete l.port.sec.mac;
      },
      flows: [
        {
          src: "ps_pc",
          dst: "ps_srv",
          proto: "tcp",
          port: 445,
          expect: "allowed",
          k: "tk_chps_1",
        },
      ],
    },
    {
      id: "ch-badip",
      challenge: true,
      mode: "advanced",
      level: 2,
      tKey: "tk_chbip_t",
      gKey: "tk_chbip_g",
      setup: taskChBadIp,
      solve: () => {
        getNode("bi_pc").ip = "10.0.8.10";
      },
      flows: [
        {
          src: "bi_pc",
          dst: "bi_srv",
          proto: "tcp",
          port: 445,
          expect: "allowed",
          k: "tk_chbip_1",
        },
      ],
    },
    {
      id: "ch-dhcppool",
      challenge: true,
      mode: "advanced",
      level: 2,
      tKey: "tk_chdp_t",
      gKey: "tk_chdp_g",
      setup: taskChDhcpPool,
      solve: () => {
        getNode("dp_lan").dhcpEnd = "10.0.9.12";
      },
      flows: [
        {
          src: "dp_c",
          dst: "dp_srv",
          proto: "tcp",
          port: 445,
          expect: "allowed",
          k: "tk_chdp_1",
        },
      ],
    },
    {
      id: "ch-route",
      challenge: true,
      mode: "advanced",
      level: 3,
      tKey: "tk_chrt_t",
      gKey: "tk_chrt_g",
      setup: taskChRoute,
      solve: () => {
        getNode("rt_r1").routes = [
          { id: "rtx", dest: "10.0.2.0/24", via: "rt_r2" },
        ];
      },
      flows: [
        {
          src: "rt_pc",
          dst: "rt_srv",
          proto: "tcp",
          port: 445,
          expect: "allowed",
          k: "tk_chrt_1",
        },
      ],
      checks: [
        {
          k: "tk_chrt_2",
          ok: () => {
            const r = getNode("rt_r1");
            return (
              !!r && (r.routes || []).some((x) => x && x.dest === "10.0.2.0/24")
            );
          },
        },
      ],
    },
    {
      id: "ch-trunk",
      challenge: true,
      mode: "advanced",
      level: 2,
      tKey: "tk_chtr_t",
      gKey: "tk_chtr_g",
      setup: taskChTrunk,
      solve: () => {
        const l = DB.links.find((x) => x.id === "ctl1");
        if (l) l.port = { mode: "trunk", vlans: [] };
      },
      flows: [
        {
          src: "ct_pc",
          dst: "ct_srv",
          proto: "tcp",
          port: 445,
          expect: "allowed",
          k: "tk_chtr_1",
        },
      ],
      checks: [
        {
          k: "tk_chtr_2",
          ok: () => {
            const l = (DB.links || []).find((x) => x.id === "ctl1");
            return !!(l && l.port && l.port.mode === "trunk");
          },
        },
      ],
    },
    {
      id: "ch-multi",
      challenge: true,
      mode: "advanced",
      level: 3,
      tKey: "tk_chmulti_t",
      gKey: "tk_chmulti_g",
      setup: taskChMulti,
      solve: () => {
        getNode("cm_core").down = false;
        const l = DB.links.find((x) => x.id === "cml4");
        if (l) l.port = { mode: "access", vlan: "cm_v10" };
      },
      flows: [
        {
          src: "cm_pc2",
          dst: "cm_srv",
          proto: "tcp",
          port: 445,
          expect: "allowed",
          k: "tk_chmulti_1",
        },
        {
          src: "cm_pc1",
          dst: "cm_srv",
          proto: "tcp",
          port: 445,
          expect: "allowed",
          k: "tk_chmulti_2",
        },
      ],
    },
    {
      id: "ch-vlanhop",
      challenge: true,
      mode: "advanced",
      level: 2,
      tKey: "tk_chvh_t",
      gKey: "tk_chvh_g",
      setup: taskChVlanHop,
      solve: () => {
        const l = DB.links.find((x) => x.id === "vhl3");
        if (l) l.port = { mode: "access", vlan: "vh_v10" };
      },
      flows: [
        {
          src: "vh_atk",
          dst: "vh_srv",
          proto: "tcp",
          port: 445,
          expect: "blocked",
          k: "tk_chvh_1",
        },
        {
          src: "vh_atk",
          dst: "vh_f10",
          proto: "tcp",
          port: 445,
          expect: "allowed",
          k: "tk_chvh_2",
        },
      ],
      checks: [
        {
          k: "tk_chvh_3",
          ok: () => {
            const l = (DB.links || []).find((x) => x.id === "vhl3");
            return !!(l && l.port && l.port.mode === "access");
          },
        },
      ],
    },
    {
      id: "ch-roguedhcp",
      challenge: true,
      mode: "advanced",
      level: 2,
      tKey: "tk_chrd_t",
      gKey: "tk_chrd_g",
      setup: taskChRogueDhcp,
      solve: () => {
        const sw = getNode("rd_sw");
        sw.dhcpSnoop = true;
        sw.dai = true;
        const l = DB.links.find((x) => x.id === "rdl_dh");
        if (l) l.port = Object.assign({}, l.port || {}, { trust: true });
      },
      flows: [
        {
          src: "rd_pc",
          dst: "rd_srv",
          proto: "tcp",
          port: 445,
          expect: "allowed",
          k: "tk_chrd_1",
        },
      ],
    },
    {
      id: "vlan-design",
      level: 2,
      tKey: "tk_vd_t",
      gKey: "tk_vd_g",
      setup: taskVlanDesign,
      solve: () => {
        DB.devices.push({
          id: "vd_l3",
          type: "l3switch",
          label: "Core L3",
          acl: [
            {
              id: "a1",
              srcSeg: "vd_guestn",
              dstSeg: "vd_srvn",
              action: "deny",
              proto: "ip",
              portOp: "any",
              port: null,
              port2: null,
            },
            {
              id: "a2",
              srcSeg: "vd_iot",
              dstSeg: "vd_srvn",
              action: "deny",
              proto: "ip",
              portOp: "any",
              port: null,
              port2: null,
            },
          ],
          x: 430,
          y: 200,
        });
        DB.links.push({ id: "vds1", fromId: "vd_l3", toId: "vd_sw" });
      },
      flows: [
        {
          src: "vd_pc",
          dst: "vd_srv",
          proto: "tcp",
          port: 445,
          expect: "allowed",
          k: "tk_vd_1",
        },
        {
          src: "vd_guest",
          dst: "vd_srv",
          proto: "tcp",
          port: 445,
          expect: "blocked",
          k: "tk_vd_2",
        },
        {
          src: "vd_cam",
          dst: "vd_srv",
          proto: "tcp",
          port: 445,
          expect: "blocked",
          k: "tk_vd_3",
        },
      ],
    },
    {
      id: "shadow-rule",
      level: 3,
      tKey: "tk_shadow_t",
      gKey: "tk_shadow_g",
      setup: taskShadowRule,
      solve: () => {
        const c = getNode("sh_core");
        c.acl = [c.acl[1], c.acl[0]];
      },
      flows: [
        {
          src: "sh_g",
          dst: "sh_srvh",
          proto: "tcp",
          port: 445,
          expect: "blocked",
          by: "sh_core",
          k: "tk_shadow_1",
        },
        {
          src: "sh_pc",
          dst: "sh_srvh",
          proto: "tcp",
          port: 445,
          expect: "allowed",
          k: "tk_shadow_2",
        },
      ],
    },
    {
      id: "remote-vpn",
      level: 3,
      tKey: "tk_vpn_t",
      gKey: "tk_vpn_g",
      setup: taskRemoteVpn,
      solve: () => {
        getNode("vp_fw").zones.find((z) => z.id === "zv").role = "vpn";
      },
      flows: [
        {
          src: "vp_client",
          dst: "vp_srv",
          proto: "tcp",
          port: 3389,
          expect: "allowed",
          k: "tk_vpn_1",
        },
        {
          src: "vp_int",
          dst: "vp_srv",
          proto: "tcp",
          port: 3389,
          expect: "blocked",
          by: "vp_fw",
          k: "tk_vpn_2",
        },
      ],
    },
    {
      id: "ips-custom",
      level: 3,
      mode: "advanced",
      tKey: "tk_custom_t",
      gKey: "tk_custom_g",
      setup: taskCustomSig,
      solve: () => {
        getNode("cp_ips").signatures.push({
          id: "sv",
          label: "LFI",
          pattern: "etc/passwd",
          isRegex: false,
        });
      },
      flows: [
        {
          src: "cp_int",
          dst: "cp_web",
          proto: "tcp",
          port: 443,
          content: "clean",
          payload: "GET /../../../../etc/passwd HTTP/1.1",
          expect: "blocked",
          by: "cp_ips",
          k: "tk_custom_1",
        },
        {
          src: "cp_int",
          dst: "cp_web",
          proto: "tcp",
          port: 443,
          content: "clean",
          payload: "GET /index.html HTTP/1.1",
          expect: "allowed",
          k: "tk_custom_2",
        },
      ],
    },
    {
      id: "wifi-connect",
      level: 1,
      tKey: "tk_wc_t",
      gKey: "tk_wc_g",
      setup: taskWifiConnect,
      solve: () => {
        const pc = getNode("wc_pc");
        pc.wifi = { apId: "wc_ap", ssid: "HomeNet" };
        pc.segId = "wc_lan";
        DB.links.push({ id: "wcl_w", fromId: "wc_pc", toId: "wc_ap" });
      },
      flows: [
        {
          src: "wc_pc",
          dst: "wc_int",
          proto: "tcp",
          port: 443,
          expect: "allowed",
          requireWifi: true,
          k: "tk_wc_1",
        },
      ],
    },
    {
      id: "hub-vs-switch",
      level: 1,
      observe: true,
      tKey: "tk_hvs_t",
      gKey: "tk_hvs_g",
      setup: taskHubVsSwitch,
      solve: () => {},
      flows: [
        {
          src: "hvs_pca",
          dst: "hvs_pcb",
          proto: "tcp",
          port: 80,
          expect: "allowed",
          k: "tk_hvs_1",
        },
        {
          src: "hvs_pcd",
          dst: "hvs_pce",
          proto: "tcp",
          port: 80,
          expect: "allowed",
          k: "tk_hvs_2",
        },
      ],
    },
    {
      id: "wifi-k2",
      level: 1,
      tKey: "tk_wk2_t",
      gKey: "tk_wk2_g",
      setup: taskWifiK2,
      solve: () => {
        const pc = getNode("wk2_pc");
        pc.wifi = { apId: "wk2_ap", ssid: "Office" };
        pc.segId = "wk2_lan";
        DB.links.push({ id: "wk2l_w", fromId: "wk2_pc", toId: "wk2_ap" });
      },
      flows: [
        {
          src: "wk2_pc",
          dst: "wk2_int",
          proto: "tcp",
          port: 443,
          expect: "allowed",
          requireWifi: true,
          k: "tk_wk2_1",
        },
      ],
    },
    {
      id: "wifi-mesh",
      level: 1,
      observe: true,
      tKey: "tk_wm_t",
      gKey: "tk_wm_g",
      setup: taskWifiMesh,
      solve: () => {},
      flows: [
        {
          src: "wm_mob",
          dst: "wm_int",
          proto: "tcp",
          port: 443,
          expect: "allowed",
          requireWifi: true,
          k: "tk_wm_1",
        },
      ],
    },
    {
      id: "wifi-guest",
      level: 2,
      tKey: "tk_wgs_t",
      gKey: "tk_wgs_g",
      setup: taskWifiGuest,
      solve: () => {
        const rt = getNode("wg_rt");
        rt.ssids.push({
          name: "Guest",
          segId: "wg_guest",
          on: true,
          pass: "host123",
        });
        rt.simpleRules.push({
          id: "wgsv",
          srcSeg: "wg_guest",
          dstSeg: "wg_int",
          action: "permit",
          proto: "ip",
          portOp: "any",
          port: null,
          port2: null,
        });
        const ph = getNode("wg_ph");
        ph.wifi = { apId: "wg_rt", ssid: "Guest" };
        ph.segId = "wg_guest";
      },
      flows: [
        {
          src: "wg_ph",
          dst: "wg_nas",
          proto: "tcp",
          port: 445,
          expect: "blocked",
          k: "tk_wgs_1",
        },
        {
          src: "wg_ph",
          dst: "wg_int",
          proto: "tcp",
          port: 443,
          expect: "allowed",
          requireWifi: true,
          k: "tk_wgs_2",
        },
        {
          src: "wg_pc",
          dst: "wg_nas",
          proto: "tcp",
          port: 445,
          expect: "allowed",
          k: "tk_wgs_3",
        },
      ],
    },
    {
      id: "bpdu-guard",
      mode: "advanced",
      level: 2,
      tKey: "tk_bpdu_t",
      gKey: "tk_bpdu_g",
      setup: taskBpduGuard,
      solve: () => {
        const l = DB.links.find((x) => x.id === "bgl5");
        l.port = Object.assign({}, l.port || {}, { bpduGuard: true });
      },
      flows: [
        {
          src: "bg_pc",
          dst: "bg_srv",
          proto: "tcp",
          port: 445,
          expect: "allowed",
          k: "tk_bpdu_1",
        },
      ],
      checks: [
        { k: "tk_bpdu_2", ok: () => stpRootId() === "bg_core" },
        {
          k: "tk_bpdu_3",
          ok: () => {
            const l = (DB.links || []).find((x) => x.id === "bgl5");
            return !!(l && l.port && l.port.bpduGuard);
          },
        },
      ],
    },
    {
      id: "spof-fix",
      level: 2,
      tKey: "tk_spf_t",
      gKey: "tk_spf_g",
      setup: taskSpofFix,
      solve: () => {
        DB.links.push(
          { id: "sps1", fromId: "sp_acc", toId: "sp_bkp" },
          { id: "sps2", fromId: "sp_bkp", toId: "sp_srvsw" },
        );
      },
      flows: [
        {
          src: "sp_pc",
          dst: "sp_web",
          proto: "tcp",
          port: 443,
          expect: "allowed",
          k: "tk_spf_1",
        },
      ],
      checks: [
        {
          k: "tk_spf_2",
          ok: () => {
            try {
              const r = evaluateEP("sp_pc", "sp_web", {
                proto: "tcp",
                port: 443,
              });
              return (
                r.status === "allowed" && (r.path || []).indexOf("sp_bkp") >= 0
              );
            } catch (e) {
              return false;
            }
          },
        },
      ],
    },
    {
      id: "ha-failover",
      level: 2,
      observe: true,
      tKey: "tk_haf_t",
      gKey: "tk_haf_g",
      setup: taskHaFailover,
      solve: () => {},
      flows: [
        {
          src: "hf_pc",
          dst: "hf_int",
          proto: "tcp",
          port: 443,
          expect: "allowed",
          k: "tk_haf_1",
        },
      ],
    },
    {
      id: "lb-web",
      level: 2,
      observe: true,
      tKey: "tk_lbw_t",
      gKey: "tk_lbw_g",
      setup: taskLoadBalancer,
      solve: () => {},
      flows: [
        {
          src: "lb_int",
          dst: "lb_lb",
          proto: "tcp",
          port: 443,
          expect: "allowed",
          k: "tk_lbw_1",
        },
      ],
    },
    {
      id: "c2-dns",
      level: 3,
      mode: "advanced",
      tKey: "tk_c2d_t",
      gKey: "tk_c2d_g",
      setup: taskC2Dns,
      solve: () => {
        getNode("cd_ips").signatures.push({
          id: "sv",
          label: "C2",
          content: "c2",
        });
      },
      flows: [
        {
          src: "cd_pc",
          dst: "cd_int",
          proto: "tcp",
          port: 53,
          content: "c2",
          expect: "blocked",
          by: "cd_ips",
          k: "tk_c2d_1",
        },
        {
          src: "cd_pc",
          dst: "cd_int",
          proto: "tcp",
          port: 443,
          content: "clean",
          expect: "allowed",
          k: "tk_c2d_2",
        },
      ],
    },
    {
      id: "site2site",
      level: 2,
      observe: true,
      tKey: "tk_s2s_t",
      gKey: "tk_s2s_g",
      setup: taskSiteToSite,
      solve: () => {},
      flows: [
        {
          src: "s2_pc",
          dst: "s2_srv",
          proto: "tcp",
          port: 445,
          expect: "allowed",
          k: "tk_s2s_1",
        },
        {
          src: "s2_int",
          dst: "s2_srv",
          proto: "tcp",
          port: 445,
          expect: "blocked",
          by: "s2_rhq",
          k: "tk_s2s_2",
        },
        {
          src: "s2_pc",
          dst: "s2_int",
          proto: "tcp",
          port: 443,
          expect: "allowed",
          k: "tk_s2s_3",
        },
      ],
    },
    {
      id: "lag-uplink",
      level: 3,
      tKey: "tk_lag_t",
      gKey: "tk_lag_g",
      setup: taskLag,
      solve: () => {
        const gid = nextLagId();
        DB.links
          .filter((l) => l.id === "lgl2" || l.id === "lgl3")
          .forEach((l) => {
            l.lag = gid;
          });
      },
      flows: [
        {
          src: "lg_pc",
          dst: "lg_srv",
          proto: "tcp",
          port: 443,
          expect: "allowed",
          requireLag: { a: "lg_sw1", b: "lg_sw2", min: 2 },
          k: "tk_lag_1",
        },
      ],
    },
    {
      id: "quar-contain",
      level: 2,
      mode: "advanced",
      tKey: "tk_qc_t",
      gKey: "tk_qc_g",
      setup: taskQuarContain,
      solve: () => {
        getNode("qc_bad").quar = true;
      },
      flows: [
        {
          src: "qc_bad",
          dst: "qc_file",
          proto: "tcp",
          port: 445,
          expect: "blocked",
          requireQuar: ["qc_bad"],
          k: "tk_qc_1",
        },
        {
          src: "qc_pc",
          dst: "qc_file",
          proto: "tcp",
          port: 445,
          expect: "allowed",
          requireNoQuar: ["qc_pc", "qc_file", "qc_log"],
          k: "tk_qc_2",
        },
        {
          src: "qc_pc",
          dst: "qc_int",
          proto: "tcp",
          port: 443,
          expect: "allowed",
          k: "tk_qc_3",
        },
      ],
    },
    {
      id: "dot1x-wired",
      mode: "advanced",
      level: 2,
      tKey: "tk_d1x_t",
      gKey: "tk_d1x_g",
      setup: taskDot1xWired,
      solve: () => {
        ["dxl4", "dxl5"].forEach((id) => {
          const l = DB.links.find((x) => x.id === id);
          if (l)
            l.port = Object.assign({}, l.port || {}, {
              dot1x: { radiusId: "dx_rad" },
            });
        });
      },
      flows: [
        {
          src: "dx_pc",
          dst: "dx_srv",
          proto: "tcp",
          port: 445,
          expect: "allowed",
          k: "tk_d1x_1",
        },
        {
          src: "dx_host",
          dst: "dx_srv",
          proto: "tcp",
          port: 445,
          expect: "blocked",
          k: "tk_d1x_2",
        },
      ],
      checks: [
        {
          k: "tk_d1x_3",
          ok: () =>
            ["dxl4", "dxl5"].every((id) => {
              const l = (DB.links || []).find((x) => x.id === id);
              return !!(
                l &&
                l.port &&
                l.port.dot1x &&
                l.port.dot1x.radiusId === "dx_rad"
              );
            }),
        },
        {
          k: "tk_d1x_4",
          ok: () => {
            try {
              return hostPortAuthorized("dx_host") === "creds";
            } catch (e) {
              return false;
            }
          },
        },
      ],
    },
    {
      id: "qos-voice",
      mode: "advanced",
      level: 2,
      tKey: "tk_qos_t",
      gKey: "tk_qos_g",
      setup: taskQosVoice,
      solve: () => {
        const l = DB.links.find((x) => x.id === "qvl2");
        l.qos = true;
      },
      flows: [
        {
          src: "qv_tel",
          dst: "qv_pbx",
          proto: "tcp",
          port: 5060,
          expect: "allowed",
          avoidCongested: true,
          requireCongested: ["qvl2"],
          k: "tk_qos_1",
        },
        {
          src: "qv_pc",
          dst: "qv_srv",
          proto: "tcp",
          port: 445,
          expect: "allowed",
          k: "tk_qos_1b",
        },
      ],
      checks: [
        {
          k: "tk_qos_2",
          ok: () => {
            try {
              const tr = { proto: "tcp", port: 445 };
              const r = evaluateEP("qv_pc", "qv_srv", tr);
              return r.status === "allowed" && pathCongested(r.path, tr);
            } catch (e) {
              return false;
            }
          },
        },
        {
          k: "tk_qos_3",
          ok: () => {
            const l = (DB.links || []).find((x) => x.id === "qvl2");
            return !!(l && l.qos && l.congested);
          },
        },
      ],
    },
    {
      id: "slow-link",
      level: 2,
      mode: "advanced",
      tKey: "tk_slow_t",
      gKey: "tk_slow_g",
      setup: taskSlowLink,
      solve: () => {
        DB.links.push(
          { id: "sls1", fromId: "sl_acc", toId: "sl_alt" },
          { id: "sls2", fromId: "sl_alt", toId: "sl_core" },
        );
        const l = DB.links.find((x) => x.id === "sll2");
        if (l) l.port = { off: true };
      },
      flows: [
        {
          src: "sl_pc",
          dst: "sl_srv",
          proto: "tcp",
          port: 445,
          expect: "allowed",
          avoidCongested: true,
          requireCongested: ["sll2"],
          k: "tk_slow_1",
        },
      ],
      checks: [
        {
          k: "tk_slow_2",
          ok: () => {
            try {
              const r = evaluateEP("sl_pc", "sl_srv", {
                proto: "tcp",
                port: 445,
              });
              return (
                r.status === "allowed" && (r.path || []).indexOf("sl_alt") >= 0
              );
            } catch (e) {
              return false;
            }
          },
        },
      ],
    },
    {
      id: "syslog-blocked",
      level: 2,
      tKey: "tk_sysb_t",
      gKey: "tk_sysb_g",
      setup: taskSyslogBlocked,
      solve: () => {
        getNode("sy_fw").simpleRules.push({
          id: "sy_r3",
          srcSeg: "sy_lan",
          dstSeg: "sy_dc",
          action: "permit",
          proto: "udp",
          portOp: "eq",
          port: 514,
          port2: null,
        });
      },
      flows: [
        {
          src: "sy_srv",
          dst: "sy_log",
          proto: "udp",
          port: 514,
          expect: "allowed",
          k: "tk_sysb_1",
        },
        {
          src: "sy_pc",
          dst: "sy_int",
          proto: "tcp",
          port: 443,
          expect: "allowed",
          k: "tk_sysb_2",
        },
        {
          src: "sy_pc",
          dst: "sy_log",
          proto: "tcp",
          port: 445,
          expect: "blocked",
          by: "sy_fw",
          k: "tk_sysb_3",
        },
        {
          src: "sy_pc",
          dst: "sy_log",
          proto: "udp",
          port: 53,
          expect: "blocked",
          by: "sy_fw",
          k: "tk_sysb_4",
        },
      ],
    },
    {
      id: "layered-def",
      level: 3,
      tKey: "tk_lay_t",
      gKey: "tk_lay_g",
      setup: taskLayered,
      solve: () => {
        DB.devices.push({
          id: "ly_waf",
          type: "waf",
          label: "WAF",
          x: 430,
          y: 240,
        });
        const l = DB.links.find((x) => x.id === "lyl2");
        if (l) l.toId = "ly_waf";
        DB.links.push({ id: "lys1", fromId: "ly_waf", toId: "ly_sw" });
      },
      flows: [
        {
          src: "ly_int",
          dst: "ly_web",
          proto: "tcp",
          port: 443,
          content: "sqli",
          expect: "blocked",
          by: "ly_waf",
          k: "tk_lay_1",
        },
        {
          src: "ly_int",
          dst: "ly_web",
          proto: "tcp",
          port: 443,
          content: "clean",
          expect: "allowed",
          k: "tk_lay_2",
        },
      ],
    },
    {
      id: "n1-map",
      level: 2,
      observe: true,
      tKey: "tk_n1m_t",
      gKey: "tk_n1m_g",
      setup: taskN1Map,
      solve: () => {},
      flows: [
        {
          src: "nm_pc",
          dst: "nm_int",
          proto: "tcp",
          port: 443,
          expect: "allowed",
          k: "tk_n1m_1",
        },
      ],
    },
    {
      id: "diode-way",
      level: 2,
      tKey: "tk_dio_t",
      gKey: "tk_dio_g",
      setup: taskDiode,
      solve: () => {
        getNode("dd_d").outId = "dd_l3";
      },
      flows: [
        {
          src: "dd_plc",
          dst: "dd_hist",
          proto: "tcp",
          port: 1433,
          expect: "allowed",
          k: "tk_dio_1",
        },
        {
          src: "dd_hist",
          dst: "dd_plc",
          proto: "tcp",
          port: 502,
          expect: "blocked",
          by: "dd_d",
          k: "tk_dio_2",
        },
      ],
    },
    {
      id: "wan-failover",
      level: 2,
      tKey: "tk_wan_t",
      gKey: "tk_wan_g",
      setup: taskWanFailover,
      solve: () => {
        DB.links.push({ id: "wfs1", fromId: "wf_isp2", toId: "wf_rt" });
      },
      flows: [
        {
          src: "wf_pc",
          dst: "wf_isp2",
          proto: "tcp",
          port: 443,
          expect: "allowed",
          k: "tk_wan_1",
        },
      ],
    },
    {
      id: "storm-stp",
      level: 2,
      mode: "advanced",
      tKey: "tk_sto_t",
      gKey: "tk_sto_g",
      setup: taskStormStp,
      solve: () => {
        getNode("st_sw1").stpMode = "rstp";
        getNode("st_sw2").stpMode = "rstp";
      },
      flows: [
        {
          src: "st_pc",
          dst: "st_srv",
          proto: "tcp",
          port: 443,
          expect: "allowed",
          requireStp: ["st_sw1", "st_sw2"],
          requireLinks: ["stl2", "stl3"],
          k: "tk_sto_1",
        },
      ],
    },
    {
      id: "dns-alias",
      level: 2,
      tKey: "tk_dal_t",
      gKey: "tk_dal_g",
      setup: taskDnsAlias,
      solve: () => {
        getNode("da_dns").dnsRecords.push({
          id: "dar2",
          name: "www.acme.local",
          type: "CNAME",
          cname: "web.acme.local",
          ttl: 300,
        });
        dnsCacheClear();
      },
      flows: [
        {
          src: "da_pc",
          dst: "da_web",
          name: "www.acme.local",
          proto: "tcp",
          port: 443,
          expect: "allowed",
          resolvesTo: "da_web",
          requireRecType: {
            host: "da_dns",
            name: "www.acme.local",
            type: "CNAME",
          },
          k: "tk_dal_1",
        },
      ],
    },
    {
      id: "wifi-enterprise",
      level: 3,
      tKey: "tk_went_t",
      gKey: "tk_went_g",
      setup: taskWifiEnterprise,
      solve: () => {
        getNode("we_fw").simpleRules.push({
          id: "we_r2",
          srcSeg: "we_lan",
          dstSeg: "we_dc",
          action: "permit",
          proto: "udp",
          portOp: "eq",
          port: 1812,
          port2: null,
        });
        const h = getNode("we_ntb");
        h.wifi = { apId: "we_ap", ssid: "Corp" };
        h.segId = "we_lan";
        DB.links.push({ id: "wel7", fromId: "we_ntb", toId: "we_ap" });
      },
      flows: [
        {
          src: "we_ntb",
          dst: "we_int",
          proto: "tcp",
          port: 443,
          expect: "allowed",
          requireWifi: true,
          requireSsidSec: "ent",
          k: "tk_went_1",
        },
      ],
    },
    {
      id: "vpn-radius",
      level: 3,
      tKey: "tk_vrad_t",
      gKey: "tk_vrad_g",
      setup: taskVpnRadius,
      solve: () => {
        getNode("vr_rad").down = false;
      },
      flows: [
        {
          src: "vr_cli",
          dst: "vr_srv",
          proto: "tcp",
          port: 443,
          expect: "allowed",
          k: "tk_vrad_1",
        },
      ],
    },
    {
      id: "wifi-secure",
      level: 2,
      tKey: "tk_wsec_t",
      gKey: "tk_wsec_g",
      setup: taskWifiSecure,
      solve: () => {
        const ap = getNode("ws_ap");
        const ss = ap.ssids[0];
        ss.sec = "wpa2";
        ss.pass = "firemni-heslo";
      },
      flows: [
        {
          src: "ws_ntb",
          dst: "ws_int",
          proto: "tcp",
          port: 443,
          expect: "allowed",
          requireWifi: true,
          k: "tk_wsec_1",
        },
        {
          src: "ws_ntb",
          dst: "ws_int",
          proto: "tcp",
          port: 443,
          expect: "allowed",
          requireSsidSec: "wpa2",
          k: "tk_wsec_2",
        },
      ],
    },
    {
      id: "evil-twin",
      level: 2,
      tKey: "tk_etw_t",
      gKey: "tk_etw_g",
      setup: taskEvilTwin,
      solve: () => {
        const h = getNode("et_ntb");
        h.wifi = { apId: "et_ap", ssid: "CafeWifi" };
        h.segId = "et_lan";
        const l = DB.links.find((x) => x.id === "etl6");
        if (l) l.toId = "et_ap";
      },
      flows: [
        {
          src: "et_ntb",
          dst: "et_int",
          proto: "tcp",
          port: 443,
          expect: "allowed",
          requireApId: "et_ap",
          k: "tk_etw_1",
        },
      ],
    },
    {
      id: "rogue-ap",
      level: 2,
      observe: true,
      tKey: "tk_rap_t",
      gKey: "tk_rap_g",
      setup: taskRogueAp,
      solve: () => {},
      flows: [
        {
          src: "ra_att",
          dst: "ra_srv",
          proto: "tcp",
          port: 445,
          expect: "allowed",
          requireWifi: true,
          k: "tk_rap_1",
        },
        {
          src: "ra_int",
          dst: "ra_srv",
          proto: "tcp",
          port: 445,
          expect: "blocked",
          by: "ra_fw",
          k: "tk_rap_2",
        },
        {
          src: "ra_pc",
          dst: "ra_int",
          proto: "tcp",
          port: 443,
          expect: "allowed",
          k: "tk_rap_3",
        },
      ],
    },
    {
      id: "mac-table",
      level: 1,
      mode: "advanced",
      observe: true,
      tKey: "tk_mac_t",
      gKey: "tk_mac_g",
      setup: taskMacTable,
      solve: () => {},
      flows: [
        {
          src: "mt_pca",
          dst: "mt_srv",
          proto: "tcp",
          port: 445,
          expect: "allowed",
          k: "tk_mac_1",
        },
        {
          src: "mt_pcc",
          dst: "mt_srv",
          proto: "tcp",
          port: 445,
          expect: "allowed",
          k: "tk_mac_2",
        },
      ],
    },
    {
      id: "open-net",
      level: 1,
      observe: true,
      tKey: "tk_opn_t",
      gKey: "tk_opn_g",
      setup: taskOpenNet,
      solve: () => {},
      flows: [
        {
          src: "on_int",
          dst: "on_srv",
          proto: "tcp",
          port: 445,
          expect: "allowed",
          k: "tk_opn_1",
        },
        {
          src: "on_int",
          dst: "on_srv",
          proto: "tcp",
          port: 3389,
          expect: "allowed",
          k: "tk_opn_2",
        },
        {
          src: "on_pc",
          dst: "on_int",
          proto: "tcp",
          port: 443,
          expect: "allowed",
          k: "tk_opn_3",
        },
      ],
    },
    {
      id: "firewall-observe",
      level: 1,
      observe: true,
      tKey: "tk_fo_t",
      gKey: "tk_fo_g",
      setup: taskFirewallObserve,
      solve: () => {},
      flows: [
        {
          src: "fo_int",
          dst: "fo_web",
          proto: "tcp",
          port: 443,
          expect: "allowed",
          k: "tk_fo_1",
        },
        {
          src: "fo_int",
          dst: "fo_web",
          proto: "tcp",
          port: 80,
          expect: "blocked",
          by: "fo_fw",
          k: "tk_fo_2",
        },
      ],
    },
    {
      id: "inc-arp",
      level: 3,
      mode: "advanced",
      tKey: "tk_iarp_t",
      gKey: "tk_iarp_g",
      setup: () => taskIncident("arp"),
      solve: () => incidentQuar("drill_atk"),
      checks: [
        { k: "tk_iarp_1", why: "drillRevArp", ok: () => incidentSolved("arp") },
      ],
    },
    {
      id: "inc-dhcp",
      level: 3,
      mode: "advanced",
      tKey: "tk_idhcp_t",
      gKey: "tk_idhcp_g",
      setup: () => taskIncident("dhcp"),
      solve: () => incidentQuar("drill_atk"),
      checks: [
        {
          k: "tk_idhcp_1",
          why: "drillRevDhcp",
          ok: () => incidentSolved("dhcp"),
        },
      ],
    },
    {
      id: "inc-dns",
      level: 3,
      mode: "advanced",
      tKey: "tk_idns_t",
      gKey: "tk_idns_g",
      setup: () => taskIncident("dns"),
      solve: () => incidentQuar("drill_atk"),
      checks: [
        { k: "tk_idns_1", why: "drillRevDns", ok: () => incidentSolved("dns") },
      ],
    },
    {
      id: "inc-twin",
      level: 3,
      mode: "advanced",
      tKey: "tk_itwin_t",
      gKey: "tk_itwin_g",
      setup: () => taskIncident("twin"),
      solve: () => incidentQuar("drill_ap"),
      checks: [
        {
          k: "tk_itwin_1",
          why: "drillRevTwin",
          ok: () => incidentSolved("twin"),
        },
      ],
    },
    {
      id: "inc-exfil",
      level: 3,
      mode: "advanced",
      tKey: "tk_iexf_t",
      gKey: "tk_iexf_g",
      setup: () => taskIncident("exfil"),
      solve: () => incidentQuar("drill_atk"),
      checks: [
        {
          k: "tk_iexf_1",
          why: "drillRevExfil",
          ok: () => incidentSolved("exfil"),
        },
      ],
    },
    {
      id: "wifi-band",
      level: 1,
      tKey: "tk_wband_t",
      gKey: "tk_wband_g",
      setup: taskWifiBand,
      solve: () => {
        const ap = getNode("wb_ap");
        ap.ssids[0].band = "5";
        ap.ssids[0].ch = 36;
      },
      flows: [
        {
          src: "wb_ntb",
          dst: "wb_srv",
          proto: "tcp",
          port: 445,
          expect: "allowed",
          requireWifi: true,
          requireBand: "5",
          k: "tk_wband_1",
        },
        {
          src: "wb_ntb",
          dst: "wb_srv",
          proto: "tcp",
          port: 445,
          expect: "allowed",
          minLinkMbits: 400,
          k: "tk_wband_2",
        },
      ],
    },
    {
      id: "wifi-range",
      level: 2,
      tKey: "tk_wrange_t",
      gKey: "tk_wrange_g",
      setup: taskWifiRange,
      solve: () => {
        getNode("wr_ap").wlTx = 30;
      },
      flows: [
        {
          src: "wr_ntb",
          dst: "wr_srv",
          proto: "tcp",
          port: 445,
          expect: "allowed",
          requireWifi: true,
          k: "tk_wrange_1",
        },
        {
          src: "wr_ntb",
          dst: "wr_srv",
          proto: "tcp",
          port: 445,
          expect: "allowed",
          minLinkMbits: 300,
          k: "tk_wrange_2",
        },
      ],
    },
    {
      id: "wifi-channel",
      level: 2,
      mode: "advanced",
      tKey: "tk_wchplan_t",
      gKey: "tk_wchplan_g",
      setup: taskWifiChannelPlan,
      // Neighbouring APs must not share or overlap a channel, so they go to the
      // two ends of the non-overlapping 2.4 GHz plan: 1 and 11.
      solve: () => {
        const ap1 = getNode("wc_ap1"),
          ap2 = getNode("wc_ap2");
        if (ap1) ap1.ssids[0].ch = 1;
        if (ap2) ap2.ssids[0].ch = 11;
      },
      flows: [
        {
          src: "wc_n1",
          dst: "wc_srv",
          proto: "tcp",
          port: 445,
          expect: "allowed",
          requireWifi: true,
          requireBand: "2.4",
          requireChannel: 1,
          k: "tk_wchplan_1",
        },
        {
          src: "wc_n1",
          dst: "wc_srv",
          proto: "tcp",
          port: 445,
          expect: "allowed",
          minLinkMbits: 400,
          k: "tk_wchplan_2",
        },
      ],
    },
    {
      id: "storage-vlan",
      level: 2,
      tKey: "tk_stovlan_t",
      gKey: "tk_stovlan_g",
      setup: taskStorageVlan,
      // Trunk all three VLANs across the inter-switch path instead of leaving the
      // ports as single-VLAN access ports. Which VLANs may then *talk* stays the
      // firewall's decision, not the cabling's.
      solve: () => {
        const all = ["sv_v10", "sv_appnet", "sv_v30"];
        ["sv_l2", "sv_l3"].forEach((id) => {
          const l = (DB.links || []).find((x) => x.id === id);
          if (l) l.port = { mode: "trunk", vlans: all };
        });
      },
      flows: [
        {
          src: "sv_app",
          dst: "sv_nas",
          proto: "tcp",
          port: 2049,
          expect: "allowed",
          k: "tk_stovlan_1",
        },
        {
          src: "sv_pc",
          dst: "sv_nas",
          proto: "tcp",
          port: 2049,
          expect: "blocked",
          by: "sv_fw",
          k: "tk_stovlan_2",
        },
      ],
    },
    {
      id: "voice-vlan",
      level: 2,
      mode: "advanced",
      tKey: "tk_voicevlan_t",
      gKey: "tk_voicevlan_g",
      setup: taskVoiceVlan,
      solve: () => {
        (DB.links || []).forEach((l) => {
          if (l.id === "vv_l1" || l.id === "vv_l2") l.qos = true;
        });
      },
      flows: [
        {
          src: "vv_tel",
          dst: "vv_cm",
          proto: "udp",
          port: 5060,
          expect: "allowed",
          k: "tk_voicevlan_1",
        },
        {
          // Voice priority is what actually has to be switched on, so assert it
          // directly rather than inferring it from the congestion marks.
          src: "vv_tel",
          dst: "vv_cm",
          proto: "udp",
          port: 5060,
          expect: "allowed",
          requireCongested: ["vv_l1", "vv_l2"],
          requireQos: ["vv_l1", "vv_l2"],
          k: "tk_voicevlan_2",
        },
      ],
    },
    {
      id: "inc-rule",
      level: 3,
      mode: "advanced",
      tKey: "tk_irule_t",
      gKey: "tk_irule_g",
      setup: () => taskIncident("rule"),
      solve: () => {
        const st = _incSt["rule"];
        const fw = st && getNode(st.fwId);
        if (fw)
          fw.firewallRules = (fw.firewallRules || []).filter(
            (r) => !(r && r.id === "drill_rule"),
          );
      },
      checks: [
        {
          k: "tk_irule_1",
          why: "drillRevRule",
          ok: () => incidentSolved("rule"),
        },
        {
          k: "tk_irule_2",
          ok: () => {
            const st = _incSt["rule"];
            const fw = st && getNode(st.fwId);
            return !!fw && fw.defaultAction === "deny";
          },
        },
      ],
    },
  ];
}
function levelMeta(l) {
  return l >= 3
    ? { lbl: t("lvlAdvanced"), c: "#fb7185" }
    : l === 2
      ? { lbl: t("lvlInter"), c: "#fbbf24" }
      : { lbl: t("lvlBasic"), c: "#3ddc97" };
}

function backToCourse() {
  ensureCourse(function () {
    let last = null;
    try {
      last = typeof courseProgress === "function" && courseProgress()._last;
    } catch (e) {}
    if (last && typeof openCourseModule === "function") openCourseModule(last);
    else if (typeof openCourseLessons === "function") openCourseLessons();
    else if (typeof openCourse === "function") openCourse();
  });
}
function renderTaskBar() {
  const bar = $("taskBar");
  if (!bar) return;
  if (!activeTask) {
    bar.style.display = "none";
    if ($("hintbar")) $("hintbar").style.display = "";
    return;
  }
  if ($("hintbar")) $("hintbar").style.display = "none";
  bar.style.display = "flex";
  bar.innerHTML = `<div class="tb-body"><div class="tb-title">${icon("target")}${esc(t(activeTask.tKey))}${activeTask.challenge ? ` <span style="font-size:9px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;padding:1px 7px;border-radius:10px;background:var(--red);color:var(--on-red);margin-left:5px">${t("challengeTag")}</span>` : ""}${activeTask.observe ? ` <span style="font-size:9px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;padding:1px 7px;border-radius:10px;border:1px solid rgba(255,255,255,.45);margin-left:5px">${t("taskObserveTag")}</span>` : ""}</div><div class="tb-goal">${t(activeTask.gKey)}</div></div>
    <span id="taskbarVerdict" class="tb-verdict" style="display:none"></span>${taskOrigin === "course" ? `<button class="btn" id="taskToCourse">${t("taskBackToCourse")}</button>` : ""}<button class="btn primary" id="taskCheck">${t("taskCheckBtn")}</button><button class="btn" id="taskEnd" title="${t("taskEndTitle")}">✕</button>`;
  $("taskCheck").onclick = checkActiveTask;
  $("taskEnd").onclick = endTask;
  if ($("taskToCourse")) $("taskToCourse").onclick = backToCourse;
}
function canvasEmpty() {
  try {
    return (
      !(DB.devices || []).length &&
      !(DB.hosts || []).length &&
      !(DB.segments || []).filter((x) => !x.isInternet).length
    );
  } catch (e) {
    return false;
  }
}
function startTask(task, origin, skipConfirm) {
  taskOrigin = origin || "tasks";
  const run = () => {
    clearTaskCheckAnim();
    DB = task.setup();
    migrateDB();
    selectedId = null;
    selectedLinkId = null;
    lastResult = null;
    if (typeof flowsClear === "function") flowsClear();
    if (typeof syslogClear === "function") syslogClear();

    if (
      !showLinkLabels &&
      (DB.links || []).some(
        (l) =>
          (typeof l.cost === "number" && l.cost > 0) ||
          l.speed > 0 ||
          l.wl === "rep",
      )
    )
      setLinkLabels(true);
    activeTask = task;
    DB.meta = DB.meta || {};
    DB.meta.task = task.id;
    try {
      localStorage.setItem("netsim_active_task", task.id);
    } catch (e) {}
    if (task.mode) setMode(task.mode);
    $("topoName").value = t(task.tKey);
    $("result").style.display = "none";
    $("probes").style.display = "none";
    saveDB();
    render();
    refreshAll();
    fitView();
    setView("diagram");
    closeModal();
    renderTaskBar();
    setStatus(t("taskStarted") + " " + t(task.tKey));
  };
  if (!skipConfirm && (DB.devices.length || DB.segments.length)) {
    uiConfirm(
      () => tf("taskConfirm", t(task.tKey)),
      run,
      () => {
        if (taskOrigin === "course" && typeof backToCourse === "function")
          backToCourse();
      },
    );
  } else run();
}
function endTask() {
  activeTask = null;
  if (DB && DB.meta) delete DB.meta.task;
  saveDB();
  try {
    localStorage.removeItem("netsim_active_task");
  } catch (e) {}
  renderTaskBar();
  clearTaskCheckAnim();
  setStatus(t("taskEnded"));
}

// The slowest wireless hop on the path a flow actually takes -- what a criterion
// like "at least 400 Mbit/s" should be measured against.
function linkMbitsOf(srcId, dstId) {
  try {
    const r = evaluateEP(srcId, dstId, { proto: "tcp", port: 443 });
    const path = r && r.path;
    if (!path || path.length < 2) return 0;
    let worst = Infinity;
    for (let i = 0; i < path.length - 1; i++) {
      let hop = 0;
      for (const l of DB.links || []) {
        const m =
          (l.fromId === path[i] && l.toId === path[i + 1]) ||
          (l.fromId === path[i + 1] && l.toId === path[i]);
        if (m) {
          const v = linkMbits(l);
          if (v > 0) hop = Math.max(hop, v);
        }
      }
      if (hop > 0) worst = Math.min(worst, hop);
    }
    return isFinite(worst) ? worst : 0;
  } catch (e) {
    return 0;
  }
}

function flowOk(f) {
  if (f.requireWifi) {
    const h = getNode(f.src);
    if (!h || !h.wifi || !wifiAssocLive(h)) return false;
  }
  if (f.requireLag) {
    const { a, b, min } = f.requireLag;
    const ls = DB.links.filter(
      (l) =>
        ((l.fromId === a && l.toId === b) ||
          (l.fromId === b && l.toId === a)) &&
        l.lag != null &&
        !linkDown(l),
    );
    if (ls.length < (min || 2) || new Set(ls.map((l) => l.lag)).size !== 1)
      return false;
  }
  if (f.requireQuar) {
    for (const id of f.requireQuar) {
      const n = getNode(id);
      if (!n || !n.quar) return false;
    }
  }
  if (f.requireNoQuar) {
    for (const id of f.requireNoQuar) {
      const n = getNode(id);
      if (!n || n.quar) return false;
    }
  }
  if (f.requireRecType) {
    const h = getNode(f.requireRecType.host);
    const r =
      h &&
      (h.dnsRecords || []).find(
        (x) => x && dnsNorm(x.name) === dnsNorm(f.requireRecType.name),
      );
    if (!r || dnsRecType(r) !== f.requireRecType.type) return false;
  }
  if (f.requireCongested) {
    for (const id of f.requireCongested) {
      const l = (DB.links || []).find((x) => x.id === id);
      if (!l || !l.congested) return false;
    }
  }
  if (f.avoidCongested) {
    try {
      const r = evaluateEP(f.src, f.dst, { proto: f.proto, port: f.port });
      if (
        r.status !== "allowed" ||
        pathCongested(r.path, { proto: f.proto, port: f.port })
      )
        return false;
    } catch (e) {
      return false;
    }
  }
  if (f.requireQos) {
    for (const id of f.requireQos) {
      const l = (DB.links || []).find((x) => x.id === id);
      if (!l || !l.qos) return false;
    }
  }
  if (f.requireBand) {
    const h = getNode(f.src);
    if (!h || !h.wifi) return false;
    const ap = getNode(h.wifi.apId);
    const ss = ap && apEffSsids(ap).find((x) => (x.name || "").trim() === (h.wifi.ssid || "").trim());
    if (!ss || wlBandOf(ss) !== f.requireBand) return false;
  }
  if (f.requireChannel) {
    const h = getNode(f.src);
    if (!h || !h.wifi) return false;
    const ap = getNode(h.wifi.apId);
    const ss = ap && apEffSsids(ap).find((x) => (x.name || "").trim() === (h.wifi.ssid || "").trim());
    if (!ss || wlChOf(ss) !== f.requireChannel) return false;
  }
  if (f.minLinkMbits) {
    const mb = linkMbitsOf(f.src, f.dst);
    if (!(mb >= f.minLinkMbits))
      return false;
  }
  if (f.maxLinkMbits) {
    const mb = linkMbitsOf(f.src, f.dst);
    if (!(mb >= 0 && mb <= f.maxLinkMbits)) return false;
  }
  if (f.requireStp) {
    for (const id of f.requireStp) {
      const d = getNode(id);
      if (!d || stpModeOf(d) === "off") return false;
    }
  }
  if (f.requireLinks) {
    for (const id of f.requireLinks) {
      if (!DB.links.some((l) => l.id === id && !linkDown(l))) return false;
    }
  }
  if (f.requireApId) {
    const h = getNode(f.src);
    if (!h || !h.wifi || h.wifi.apId !== f.requireApId || !wifiAssocLive(h))
      return false;
  }
  if (f.requireSsidSec) {
    const h = getNode(f.src);
    if (!h || !h.wifi) return false;
    const ap = getNode(h.wifi.apId);
    const ss = ap && apEffSsids(ap).find((x) => x.name === h.wifi.ssid);
    const rank = { open: 0, wpa2: 1, wpa3: 2, ent: 3 };
    if (!ss || (rank[ssidSec(ss)] || 0) < (rank[f.requireSsidSec] || 0))
      return false;
  }
  if (f.name) {
    const rn = resolveName(f.src, f.name);
    if (f.expect === "dnsfail") return !rn.ok && (!f.err || rn.err === f.err);
    if (!rn.ok || rn.internet) return false;
    if (f.resolvesTo && rn.hostId !== f.resolvesTo) return false;
    const st = tEv(f.src, rn.hostId, f.proto, f.port, f.content, f.payload);
    return f.expect === "allowed" ? st === "allowed" : st !== "allowed";
  }
  if (f.expect === "allowed")
    return (
      tEv(f.src, f.dst, f.proto, f.port, f.content, f.payload) === "allowed"
    );
  if (f.by)
    return tBlockedBy(
      f.src,
      f.dst,
      f.proto,
      f.port,
      f.by,
      f.content,
      f.payload,
    );
  return tEv(f.src, f.dst, f.proto, f.port, f.content, f.payload) !== "allowed";
}
function taskCrits(task) {
  const fromFlows = (task.flows || []).map((f) => ({
    label: t(f.k),
    ok: flowOk(f),
    flow: f,
  }));

  const fromChecks = (task.checks || []).map((c) => {
    let v = false;
    try {
      v = !!(c.ok && c.ok());
    } catch (e) {}
    return { label: t(c.k), ok: v, flow: null, why: c.why || null };
  });
  return fromFlows.concat(fromChecks);
}

function visualizeFlow(f) {
  if (f.name) {
    const rn = resolveName(f.src, f.name);
    if (!rn.ok)
      return {
        status: "noroute",
        reason:
          t("dnsVerdFail") + " — " + dnsErrText(rn).replace(/<[^>]+>/g, ""),
      };
    f = Object.assign({}, f, { dst: rn.internet ? rn.inetId : rn.hostId });
  }
  const res = evaluateEP(
    f.src,
    f.dst,
    {
      proto: f.proto,
      port: f.port,
      content: f.content || null,
      payload:
        f.payload != null
          ? f.payload
          : f.content
            ? samplePayload(f.content)
            : null,
    },
    {},
  );
  if (typeof animateResult === "function") animateResult(res);
  return res;
}
function flowReason(res) {
  if (res.status === "allowed") return "✔ " + t("verdAllow");
  if (res.status === "blocked")
    return (
      "✖ " +
      t("verdBlocked") +
      (res.blockedAt
        ? " · " + esc(res.blockedAt.label || res.blockedAt.name)
        : "") +
      (res.reason ? " — " + esc(res.reason) : "")
    );
  return (
    "⛌ " + t("verdUnreachable") + (res.reason ? " — " + esc(res.reason) : "")
  );
}
let taskCheckTimers = [];
function clearTaskCheckAnim() {
  taskCheckTimers.forEach(clearTimeout);
  taskCheckTimers = [];
}
function revealResult() {
  const r = $("result");
  if (r && r.scrollIntoView)
    r.scrollIntoView({ behavior: "smooth", block: "nearest" });
}
function checkActiveTask() {
  if (!activeTask) return;
  clearTaskCheckAnim();
  const crits = taskCrits(activeTask);
  const allOk = crits.length > 0 && crits.every((c) => c.ok);
  if (allOk) markTaskDone(activeTask.id);

  $("result").style.display = "block";
  $("probes").style.display = "none";
  {
    const _st = $("result").querySelector(".subtabs");
    if (_st) _st.style.display = "none";
  }
  $("resBody").innerHTML =
    `<div class="verdict pop ${allOk ? "ok" : "block"}"><span class="ic">${allOk ? icon("checkcircle") : icon("alert")}</span>${allOk ? t("taskPass") : t("taskFail")}</div>
    <div id="taskCrits">${crits.map((c, i) => `<div class="task-crit ${c.ok ? "ok" : "no"}" data-ci="${i}" role="button" tabindex="0" style="cursor:pointer" title="${t("taskReplayHint")}"><span class="ci">${c.ok ? "✓" : "✗"}</span><span>${esc(c.label)} <span style="color:var(--muted)">▸</span></span></div>`).join("")}</div>
    <div id="taskCritDetail" class="expl" style="margin-top:8px;min-height:18px;color:var(--muted)"></div>
    <div style="margin-top:6px;font-size:12.5px;${allOk ? "color:var(--green);font-weight:600" : "color:var(--muted)"}">${allOk ? t("taskPassMsg") : t("taskFailMsg")}</div>
    ${allOk && taskOrigin !== "course" ? `<button class="btn" id="taskBackBtn" style="margin-top:10px">${t("taskBackToList")}</button>` : ""}${allOk ? feedbackPromptHtml() : ""}`;
  const playFlow = (i) => {
    const c = crits[i];
    const d0 = $("taskCritDetail");
    if (!c.flow) {
      if (d0) d0.innerHTML = c.why ? t(c.why) : esc(c.label);
      $("resBody")
        .querySelectorAll(".task-crit[data-ci]")
        .forEach((r) => (r.style.outline = ""));
      const r0 = $("resBody").querySelector(
        String.fromCharCode(46) +
          "task-crit[data-ci=" +
          JSON.stringify(String(i)) +
          "]",
      );
      if (r0) r0.style.outline = "1px solid var(--cyan)";
      return null;
    }
    const res = visualizeFlow(c.flow);
    const d = $("taskCritDetail");
    if (d) d.innerHTML = flowReason(res);
    $("resBody")
      .querySelectorAll(".task-crit[data-ci]")
      .forEach((r) => (r.style.outline = ""));
    const row = $("resBody").querySelector(`.task-crit[data-ci="${i}"]`);
    if (row) row.style.outline = "1px solid var(--cyan)";
    return res;
  };
  $("resBody")
    .querySelectorAll(".task-crit[data-ci]")
    .forEach((row) => {
      const go = () => playFlow(+row.getAttribute("data-ci"));
      row.onclick = go;
      row.onkeydown = (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          go();
        }
      };
    });
  if ($("taskBackBtn")) $("taskBackBtn").onclick = openTasksModal;
  const _tb = $("taskBar");
  if (_tb) {
    _tb.classList.remove("tb-flash-ok", "tb-flash-no");
    void _tb.offsetWidth;
    _tb.classList.add(allOk ? "tb-flash-ok" : "tb-flash-no");
  }

  const tv = $("taskbarVerdict");
  if (tv) {
    tv.style.display = "";
    tv.className = "tb-verdict " + (allOk ? "ok" : "no");
    tv.innerHTML =
      (allOk ? icon("checkcircle") : icon("alert")) +
      (allOk
        ? t("taskPass")
        : t("taskFail") +
          " · " +
          crits.filter((c) => c.ok).length +
          "/" +
          crits.length);
  }
  revealResult();

  const playSeq = (i) => {
    if (i >= crits.length) return;
    const res = playFlow(i);
    let hops = 1;
    if (res && res.path && res.path.length > 1) {
      const phys = physicalPath(res.path);
      let upto = phys.length - 1;
      if (res.status === "blocked" && res.blockedAt) {
        const bi = phys.indexOf(res.blockedAt.id);
        if (bi >= 0) upto = bi;
      }
      hops = Math.max(1, upto);
    }
    taskCheckTimers.push(
      setTimeout(() => playSeq(i + 1), Math.round((hops / 1.4) * 1000) + 800),
    );
  };
  playSeq(0);
}

const TASK_CAT = {
  "first-steps": "basics",
  "router-intro": "basics",
  "hub-vs-switch": "basics",
  "two-nets": "basics",
  "ch-down": "basics",
  "ch-rtpf": "routing",
  "mac-table": "basics",
  "vlan-split": "vlan",
  "trunk-setup": "vlan",
  "inter-vlan": "vlan",
  "vlan-design": "vlan",
  "port-test": "basics",
  "ch-vlan": "vlan",
  "ch-portvlan": "vlan",
  "ch-trunk": "vlan",
  "ch-vlanhop": "vlan",
  "subnet-plan": "routing",
  "def-route": "routing",
  "subnet-lab": "routing",
  "nat-lab": "routing",
  "static-nat": "routing",
  "port-fwd": "routing",
  "static-route": "routing",
  "ch-route": "routing",
  "ch-gw": "routing",
  "ch-badip": "routing",
  "ch-multi": "routing",
  "stp-loop": "redundancy",
  "stp-redundant": "redundancy",
  "ospf-cost": "redundancy",
  "ospf-fix": "redundancy",
  hsrp: "redundancy",
  "ha-failover": "redundancy",
  "lb-web": "redundancy",
  "bpdu-guard": "redundancy",
  "spof-fix": "redundancy",
  "wifi-connect": "wifi",
  "wifi-k2": "wifi",
  "wifi-mesh": "wifi",
  "wifi-guest": "wifi",
  "rogue-ap": "wifi",
  "wifi-secure": "wifi",
  "evil-twin": "wifi",
  "wifi-enterprise": "wifi",
  "vpn-radius": "firewall",
  "dns-down": "services",
  "dns-rogue": "services",
  "dns-backup": "services",
  "ch-dhcp": "services",
  "ch-dhcppool": "services",
  "ch-roguedhcp": "services",
  "dhcp-starvation": "services",
  "web-dmz": "firewall",
  "guest-iso": "firewall",
  "block-telnet": "firewall",
  "dmz-pivot": "firewall",
  "default-deny": "firewall",
  "shadow-rule": "firewall",
  "remote-vpn": "firewall",
  "open-net": "firewall",
  "firewall-observe": "firewall",
  "ch-guest": "firewall",
  "ch-web": "firewall",
  site2site: "firewall",
  "ids-to-ips": "security",
  "tls-blind": "security",
  "ips-sqli": "security",
  "ips-custom": "security",
  "ch-ids": "security",
  "ch-portsec": "security",
  "c2-dns": "security",
  "inc-arp": "incident",
  "inc-dhcp": "incident",
  "inc-dns": "incident",
  "inc-twin": "incident",
  "inc-exfil": "incident",
  "inc-rule": "incident",
  "ch-otseg": "ot",
  "diode-way": "ot",
  "syslog-blocked": "services",
  wiretap: "security",
  "quar-contain": "security",
  "dot1x-wired": "security",
  "qos-voice": "basics",
  "slow-link": "redundancy",
  "lag-uplink": "redundancy",
  "layered-def": "security",
  "n1-map": "redundancy",
  "wan-failover": "redundancy",
  "storm-stp": "redundancy",
  "dns-alias": "services",
  "wifi-band": "wifi",
  "wifi-range": "wifi",
  "wifi-channel": "wifi",
  "storage-vlan": "vlan",
  "voice-vlan": "redundancy",
};
const CAT_ORDER = [
  "basics",
  "vlan",
  "routing",
  "redundancy",
  "wifi",
  "services",
  "firewall",
  "security",
  "incident",
  "ot",
];
function taskItemHtml(tk, done) {
  const lm = levelMeta(tk.level);
  let sum = t(tk.gKey)
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (!tk.challenge) sum = sum.split(/\s(?=\d\))/)[0];
  if (sum.length > 160) sum = sum.slice(0, 158).replace(/\s\S*$/, "") + "…";

  const obs = tk.observe
    ? `<span class="tlvl" style="background:transparent;border:1px solid var(--line2);color:var(--muted)">${esc(t("taskObserveTag"))}</span>`
    : "";
  return `<button class="task-item" data-task="${tk.id}"><b>${esc(t(tk.tKey))} <span class="tlvl" style="background:${lm.c}">${esc(lm.lbl)}</span>${obs}${done.indexOf(tk.id) >= 0 ? `<span class="done">${t("taskDoneTag")}</span>` : ""}</b><small>${esc(sum)}</small></button>`;
}
function openTasksModal() {
  const all = getTasks(),
    done = tasksDone();
  const dnAll = done.filter((id) => all.some((x) => x.id === id)).length;
  const catLabel = {
    basics: t("catBasics"),
    vlan: t("catVlan"),
    routing: t("catRouting"),
    redundancy: t("catRedundancy"),
    wifi: t("catWifi"),
    services: t("catServices"),
    firewall: t("catFirewall"),
    security: t("catSecurity"),
    incident: t("catIncident"),
    ot: t("catOt"),
  };
  const tutB = (() => {
    let seen = false;
    try {
      seen = !!localStorage.getItem("netsim_seen_tutorial");
    } catch (e) {}
    return seen;
  })()
    ? ""
    : '<button class="btn" id="tutBtn" style="margin-bottom:14px">' +
      icon("book", "ico-a") +
      t("tasksTutBtn") +
      "</button>";
  const sections = CAT_ORDER.map((cat, ci) => {
    const items = all
      .filter((tk) => (TASK_CAT[tk.id] || "security") === cat)
      .sort((a, b) => (a.level || 1) - (b.level || 1));
    if (!items.length) return "";
    const cd = items.filter((tk) => done.indexOf(tk.id) >= 0).length;
    return `<details class="task-sec"${ci === 0 ? " open" : ""}><summary><span class="ts-name">${esc(catLabel[cat])}</span><span class="ts-cnt">${cd}/${items.length}</span></summary>${items.map((tk) => taskItemHtml(tk, done)).join("")}</details>`;
  }).join("");
  openModal(`<h2 style="font-family:var(--mono)">${t("learnPractice")} <span style="font-size:12px;font-weight:500;color:var(--muted)">${dnAll}/${all.length} ${t("tasksDoneLbl")}</span></h2>
    <div style="font-size:12px;color:var(--muted);margin-bottom:12px;line-height:1.5">${t("tasksIntro")}</div>
    ${tutB}${sections}
    <div class="actions"><button class="btn" id="tasksCourse">${icon("layers", "ico-a")}${t("learnCourse")}</button><button class="btn" id="mClose">${t("fbCancel")}</button></div>`);
  modalBox.querySelectorAll(".task-item").forEach(
    (b) =>
      (b.onclick = () => {
        const tk = all.find((x) => x.id === b.getAttribute("data-task"));
        if (tk) startTask(tk, "tasks");
      }),
  );
  if ($("tutBtn")) $("tutBtn").onclick = () => openTutorial(0);
  $("tasksCourse").onclick = () => {
    closeModal();
    ensureCourse(() => openCourse());
  };
  $("mClose").onclick = closeModal;
}
function openChallengesModal() {
  openTasksModal();
}

window.netSelfTest = function () {
  const tasks = getTasks(),
    out = [];
  tasks.forEach((tk) => {
    const r = { id: tk.id };
    const _savedMode = appMode;
    try {
      appMode = tk.mode === "advanced" ? "advanced" : "simple";
      DB = tk.setup();
      migrateDB();
      runtimeClear();
      const beforeCrits = taskCrits(tk);
      r.before = beforeCrits.every((c) => c.ok);
      if (tk.observe) {
        r.pass = r.before === true;
        if (!r.pass) r.detail = beforeCrits.map((c) => c.ok + ":" + c.label);
      } else {
        tk.solve();
        const after = taskCrits(tk);
        r.after = after.every((c) => c.ok);
        r.pass = r.before === false && r.after === true;
        if (!r.pass) r.detail = after.map((c) => c.ok + ":" + c.label);
      }
    } catch (e) {
      r.pass = false;
      r.err = e.message;
    }
    appMode = _savedMode;
    out.push(r);
  });

  try {
    DB = {
      devices: [
        { id: "sw", type: "l2switch", label: "SW" },
        {
          id: "ap",
          type: "ap",
          label: "AP",
          ssids: [
            { name: "OFFICE", segId: "s10" },
            { name: "GUEST", segId: "s90" },
          ],
        },
      ],
      hosts: [
        {
          id: "srv",
          type: "host",
          kind: "server",
          label: "SRV",
          services: [443],
          segId: "s10",
        },
        {
          id: "off",
          type: "host",
          kind: "ntb",
          label: "Laptop",
          services: [],
          segId: "s10",
        },
        {
          id: "gst",
          type: "host",
          kind: "ntb",
          label: "Guest",
          services: [],
          segId: "s90",
        },
      ],
      segments: [
        {
          id: "s10",
          name: "VLAN10",
          subnet: "10.0.0.0/24",
          vlan: "10",
          isInternet: false,
        },
        {
          id: "s90",
          name: "VLAN90",
          subnet: "172.16.9.0/24",
          vlan: "90",
          isInternet: false,
        },
      ],
      links: [
        { id: "l1", fromId: "sw", toId: "srv" },
        { id: "l2", fromId: "sw", toId: "ap" },
        { id: "l3", fromId: "ap", toId: "off" },
        { id: "l4", fromId: "ap", toId: "gst" },
      ],
    };
    migrateDB();
    const A = evaluateEP("off", "srv", { proto: "tcp", port: 443 });
    const B = evaluateEP("gst", "srv", { proto: "tcp", port: 443 });
    const sameVlanBridges =
      A.status === "allowed" && (A.path || []).indexOf("ap") >= 0;
    const guestIsolated = B.status !== "allowed";
    out.push({
      id: "ap-bridge",
      sameVlanBridges,
      guestIsolated,
      pass: sameVlanBridges && guestIsolated,
    });
  } catch (e) {
    out.push({ id: "ap-bridge", pass: false, err: e.message });
  }
  return out;
};

$("btnRelayout").onclick = relayout;
$("btnAddNote").onclick = addNote;
{
  const _bz = $("btnZones");
  if (_bz) {
    _bz.onclick = toggleZones;
    updateZonesBtn();
  }
}
$("btnUndo").onclick = undo;
$("btnRedo").onclick = redo;
$("btnSnap").onclick = () => {
  snapGrid = !snapGrid;
  try {
    localStorage.setItem("netsim_snap", snapGrid ? "1" : "0");
  } catch (e) {}
  $("btnSnap").classList.toggle("on", snapGrid);
  setStatus(snapGrid ? t("stSnapOn") : t("stSnapOff"));
};
$("btnSnap").classList.toggle("on", snapGrid);
$("btnZoomIn").onclick = () => zoomCenter(0.8);
$("btnZoomOut").onclick = () => zoomCenter(1.25);
$("btnZoomFit").onclick = fitView;
let hintIdx = -1;
setInterval(() => {
  if (document.hidden) return;
  if (window.matchMedia && matchMedia("(pointer:coarse)").matches) return;
  const hints = t("hints");
  hintIdx = (hintIdx + 1) % hints.length;
  $("hintText").textContent = hints[hintIdx];
}, 12000);
