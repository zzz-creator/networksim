#!/usr/bin/env node
/*
 * networksim verification harness  --  DEV ONLY, never shipped to the browser.
 *
 * The app is a static, no-build page: index.html loads js/01..19 and courses/*
 * as plain <script> tags sharing one global scope. This harness boots that page
 * in a real browser and checks it, because there is no other automated check.
 *
 *   npm install     (devDependencies only; installs playwright-core, no browser)
 *   npm run verify
 *
 * Options:
 *   --suite=<name>     run only that suite (boot|selftest|courses|presets)
 *   --sample=<n>       course modules rendered per course (default 1, 0 = none)
 *   --chrome=<path>    explicit browser executable
 *   --headed           show the browser window
 *   --quiet            only print failures and the summary
 *
 * Exit code 0 = all checks passed, 1 = at least one failed.
 */

"use strict";

const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");

const argv = process.argv.slice(2);
const argOf = (k) => {
  const m = argv.find((a) => a.startsWith("--" + k + "="));
  return m ? m.slice(k.length + 3) : null;
};
const onlySuites = argOf("suite");
const RENDER_SAMPLE = argOf("sample") === null ? 1 : parseInt(argOf("sample"), 10);
const HEADED = argv.includes("--headed");
const QUIET = argv.includes("--quiet");

/* ---------------------------------------------------------------- reporting */

/*
 * Confirmed, already-triaged defects. An entry silences exactly ONE check and is
 * always printed as KNOWN -- never as a pass -- so it can never be mistaken for
 * health. Delete an entry when the defect is fixed: the check then runs for real.
 */
// Known defects, keyed by check label. Empty right now: the one entry that used
// to live here (the OT/ICS example registered in PRESET_BUILDERS but absent from
// getPresets(), so unreachable from every menu) is fixed and its check runs for
// real. Add an entry to silence exactly one check while you triage it -- it prints
// as KNOWN, never as a pass. Delete the entry once fixed.
const KNOWN = {};

const results = [];
let currentSuite = "";

function suite(name) {
  currentSuite = name;
  if (!QUIET) {
    process.stdout.write("\n" + name + "\n" + "-".repeat(name.length) + "\n");
  }
}

function record(ok, label, detail) {
  const known = !ok && KNOWN[label] ? KNOWN[label] : null;
  const status = ok ? "pass" : known ? "known" : "fail";
  const note = ok ? null : known || (Array.isArray(detail) ? detail.join("\n") : String(detail || "condition was false"));
  results.push({ suite: currentSuite, status, label, detail: note });
  if (!QUIET) {
    const mark = status === "pass" ? "PASS" : status === "known" ? "KNOWN" : "FAIL";
    process.stdout.write("  [" + mark + "] " + label + "\n");
    if (status !== "pass") {
      String(note)
        .split("\n")
        .slice(0, 25)
        .forEach((d) => process.stdout.write("         " + d + "\n"));
      if (Array.isArray(detail) && detail.length > 25) {
        process.stdout.write("         ... " + (detail.length - 25) + " more\n");
      }
    }
  }
}

function check(label, cond, detail) {
  record(!!cond, label, cond ? null : detail || "condition was false");
}

function checkEq(label, actual, expected) {
  record(
    actual === expected,
    label,
    actual === expected ? null : "expected " + JSON.stringify(expected) + ", got " + JSON.stringify(actual),
  );
}

/* ------------------------------------------------------------ static server */

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

function startServer(root) {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      let urlPath;
      try {
        urlPath = decodeURIComponent(req.url.split("?")[0]);
      } catch (e) {
        res.writeHead(400);
        return res.end("bad request");
      }
      if (urlPath === "/") urlPath = "/index.html";
      // The app ships no favicon. Chrome probes for one automatically and logs a
      // console error on the 404, which would be a harness artifact rather than
      // an app fault. Answer it here so the console check stays strict.
      if (urlPath === "/favicon.ico") {
        res.writeHead(204);
        return res.end();
      }
      const filePath = path.join(root, urlPath);
      // keep the server inside ROOT: reject ../ escapes
      if (!filePath.startsWith(root)) {
        res.writeHead(403);
        return res.end("forbidden");
      }
      fs.readFile(filePath, (err, buf) => {
        if (err) {
          res.writeHead(404, { "Content-Type": "text/plain" });
          return res.end("not found: " + urlPath);
        }
        res.writeHead(200, {
          "Content-Type": MIME[path.extname(filePath).toLowerCase()] || "application/octet-stream",
          "Cache-Control": "no-store",
        });
        res.end(buf);
      });
    });
    server.on("error", reject);
    server.listen(0, "127.0.0.1", () => {
      resolve({ server, port: server.address().port });
    });
  });
}

/* --------------------------------------------------------- browser selection */

function findBrowser() {
  const explicit = argOf("chrome") || process.env.NETSIM_CHROME;
  if (explicit) {
    if (!fs.existsSync(explicit)) {
      throw new Error("--chrome path does not exist: " + explicit);
    }
    return explicit;
  }
  const roots = [
    process.env["ProgramFiles"],
    process.env["ProgramFiles(x86)"],
    process.env.LOCALAPPDATA,
  ].filter(Boolean);
  const rels = [
    ["Google", "Chrome", "Application", "chrome.exe"],
    ["Microsoft", "Edge", "Application", "msedge.exe"],
  ];
  for (const r of roots) {
    for (const parts of rels) {
      const p = path.join(r, ...parts);
      if (fs.existsSync(p)) return p;
    }
  }
  // mac / linux, so the harness is not Windows-only
  const unix = [
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
  ];
  for (const p of unix) if (fs.existsSync(p)) return p;
  throw new Error(
    "No Chrome/Edge found. Pass --chrome=<path> or set NETSIM_CHROME to a browser executable.",
  );
}

/* ------------------------------------------------------------------- helpers */

// Runs in the page: load course-core.js then every courses/course<N>.js.
const LOAD_ALL_COURSES = async () => {
  await new Promise((res) => {
    if (typeof ensureCourse === "function") ensureCourse(res);
    else res();
  });
  const count = window.COURSE_COUNT;
  for (let n = 1; n <= count; n++) {
    await new Promise((res) => window.__loadCourseFile(n, res));
  }
  return count;
};

// Runs in the page: collect the shape of every course module and lesson quiz.
const COLLECT_COURSES = () => {
  const problems = [];
  const info = [];
  const courses = window.allCourses();
  courses.forEach((c) => {
    const num = window.__courseNum(c);
    let mods = 0,
      lessons = 0,
      quizzes = 0;
    (c.lessons || []).forEach((l) => {
      lessons++;
      if (!l.id) problems.push(c.id + ": a lesson has no id");
      if (!l.title) problems.push(c.id + "/" + (l.id || "?") + ": lesson has no title");
      (l.modules || []).forEach((m) => {
        mods++;
        const hasRender = typeof m.render === "function";
        const hasBuild = typeof m.build === "function";
        if (!hasRender && !hasBuild) {
          problems.push(
            c.id +
              "/" +
              (m.id || "?") +
              ": module has neither render() nor build() -- " +
              (m.title || "(no title)"),
          );
        }
      });
      if (!l.modules || !l.modules.length) {
        problems.push(c.id + "/" + l.id + ": lesson has no modules");
      }
      if (l.quizId) {
        const q = window.quizForId(l.quizId);
        if (!q || !q.qs || !q.qs.length) {
          problems.push(c.id + "/" + l.id + ": quizId '" + l.quizId + "' does not resolve");
        } else {
          quizzes++;
          const bad = q.qs.filter((x) => typeof x.correct !== "number" || !x.opts || !x.opts.length);
          if (bad.length) {
            problems.push(
              c.id + "/" + l.id + ": quiz '" + l.quizId + "' has " + bad.length + " malformed question(s)",
            );
          }
        }
      }
    });
    if (!c.title) problems.push(c.id + ": course has no title");
    if (!c.blurb) problems.push(c.id + ": course has no blurb");
    info.push({ id: c.id, num, title: c.title, lessons, mods, quizzes });
  });
  return { problems, info };
};

/* --------------------------------------------------------------------- main */

async function main() {
  const { chromium } = require("playwright-core");
  const exe = findBrowser();
  const { server, port } = await startServer(ROOT);
  const base = "http://127.0.0.1:" + port + "/";

  if (!QUIET) {
    process.stdout.write("networksim verification\n");
    process.stdout.write("  root:   " + ROOT + "\n");
    process.stdout.write("  serve:  " + base + "\n");
    process.stdout.write("  browser:" + exe + "\n");
  }

  const browser = await chromium.launch({ executablePath: exe, headless: !HEADED });
  const context = await browser.newContext({ viewport: { width: 1600, height: 1000 } });
  const page = await context.newPage();

  const consoleErrors = [];
  const pageErrors = [];
  const failedRequests = [];

  page.on("console", (msg) => {
    if (msg.type() !== "error") return;
    const loc = msg.location() || {};
    const at = loc.url ? " @ " + loc.url + (loc.lineNumber ? ":" + loc.lineNumber : "") : "";
    consoleErrors.push(msg.text() + at);
  });
  page.on("pageerror", (err) => pageErrors.push(String((err && err.stack) || err)));
  page.on("requestfailed", (req) => {
    failedRequests.push(req.url() + " -- " + ((req.failure() && req.failure().errorText) || "failed"));
  });
  page.on("response", (res) => {
    if (res.status() >= 400) failedRequests.push(res.status() + " " + res.url());
  });

  const run = (name) => !onlySuites || onlySuites.split(",").map((s) => s.trim()).includes(name);

  try {
    // Navigation always happens, whatever suites were selected: every later
    // suite evaluates in the booted page.
    await page.goto(base, { waitUntil: "load", timeout: 60000 });
    await page.waitForFunction(
      () =>
        typeof window.getTasks === "function" &&
        typeof window.migrateDB === "function" &&
        typeof window.evaluateEP === "function" &&
        typeof window.render === "function",
      null,
      { timeout: 60000 },
    );
    await page.waitForTimeout(600);

    /* ------------------------------------------------------------- boot */
    if (run("boot")) {
      suite("boot");
      check(
        "page boots without uncaught exceptions",
        pageErrors.length === 0,
        pageErrors,
      );
      check(
        "no console.error during boot",
        consoleErrors.length === 0,
        consoleErrors,
      );
      check(
        "no failed or 4xx/5xx requests",
        failedRequests.length === 0,
        failedRequests,
      );

      const globals = await page.evaluate(() =>
        [
          "getTasks",
          "getPresets",
          "migrateDB",
          "evaluateEP",
          "evaluate",
          "taskCrits",
          "findFullPath",
          "findFullPathCost",
          "baseLinkCost",
          "speedCost",
          "renderOverview",
          "runAudit",
          "runBlastRadius",
          "runResilience",
          "renderMatrix",
          "netSelfTest",
          "reconcileBackhaul",
          "roamWifiHost",
          "openLinkCostEditor",
          "ensureCourse",
        ].filter((n) => typeof window[n] !== "function"),
      );
      check(
        "all expected global functions exist",
        globals.length === 0,
        globals.map((g) => "missing: window." + g),
      );

      const built = await page.evaluate(() => {
        const t = document.getElementById("trafficPanel");
        const pres = document.getElementById("presetPanel");
        return {
          hasTrafficPanel: !!t,
          hasPresetPanel: !!pres,
          bodyNodes: document.body ? document.body.children.length : 0,
        };
      });
      check("main DOM panels present", built.hasTrafficPanel && built.hasPresetPanel, built);
      check("document body rendered content", built.bodyNodes > 3, built);
    }

    /* ---------------------------------------------------------- selftest */
    if (run("selftest")) {
      suite("selftest (window.netSelfTest)");
      const out = await page.evaluate(() => window.netSelfTest());
      const failed = out.filter((r) => !r.pass);
      const taskRows = out.filter((r) => r.id !== "ap-bridge");
      const observeRows = taskRows.filter((r) => r.before === true && r.after === undefined);

      // Every registered task must actually be exercised. Derive the count from
      // getTasks() instead of hard-coding it, so adding a task without a solve()
      // or with a broken one cannot slip past a stale literal.
      const declared = await page.evaluate(() => getTasks().length);
      checkEq("every registered task is exercised", taskRows.length, declared);
      checkEq(
        "every task has an id",
        await page.evaluate(() => getTasks().filter((t) => !t.id).length),
        0,
      );
      check(
        "every solvable task provides a solve() (observe tasks need not)",
        await page.evaluate(() => {
          const bad = getTasks()
            .filter((t) => !t.observe && typeof t.solve !== "function")
            .map((t) => t.id);
          return bad;
        }).then((bad) => bad.length === 0 || bad),
        [],
      );
      check(
        "every task passes (fail-before / pass-after solve, or observe-passes-as-shipped)",
        failed.length === 0,
        failed.map((r) => r.id + (r.err ? "  ERROR: " + r.err : "  " + (r.detail || []).join(" | "))),
      );
      if (!QUIET) {
        process.stdout.write(
          "         (" +
            taskRows.length +
            " tasks, " +
            observeRows.length +
            " observe-only, 1 ap-bridge)\n",
        );
      }
    }

    /* ----------------------------------------------------------- courses */
    if (run("courses")) {
      suite("courses");
      // Compare against COURSE_COUNT rather than a literal, so adding a course
      // cannot leave this check quietly asserting the old number.
      const count = await page.evaluate(LOAD_ALL_COURSES);
      checkEq("COURSE_COUNT matches the loaded course files", count, 32);

      const { problems, info } = await page.evaluate(COLLECT_COURSES);
      check(
        "every course/lesson/module/quiz is well formed",
        problems.length === 0,
        problems,
      );

      const ids = info.map((c) => c.id);
      checkEq("allCourses() returns every registered course", info.length, count);
      check(
        "no duplicate course ids in allCourses()",
        new Set(ids).size === ids.length,
        ids,
      );

      const covered = new Set(ids);
      const gaps = [];
      for (let n = 1; n <= count; n++) if (!covered.has("course" + n)) gaps.push("course" + n);
      check(
        "allCourses() contains every course number (no orphans)",
        gaps.length === 0,
        gaps.map((g) => g + " is registered but never reachable from allCourses()"),
      );

      if (!QUIET) {
        const total = info.reduce((a, c) => a + c.mods, 0);
        const less = info.reduce((a, c) => a + c.lessons, 0);
        process.stdout.write(
          "         (" + info.length + " courses, " + less + " lessons, " + total + " modules)\n",
        );
      }

      // A module that renders is not the same as a course that teaches. Render EVERY
      // module of the NEW courses (25-30) and assert the HTML is clean -- prose that
      // silently renders "undefined" or "[object Object]" is worse than a crash,
      // because on screen it just looks like ordinary text.
      // render() returns only the intro prose. The step captions live in mount(),
      // and that is exactly where a copy-paste slip hides -- so open every module
      // for real and inspect the MOUNTED DOM, not the returned string.
      const deep = [];
      const deepDetail = await page.evaluate(() => {
        const out = [];
        for (const c of allCourses()) {
          if (__courseNum(c) < 25) continue;
          setActiveCourse(c);
          for (const l of c.lessons) {
            for (const m of l.modules) {
              let html = "";
              try {
                const built = m.build ? m.build() : { html: m.render() };
                html = built && built.html;
                if (typeof html !== "string") {
                  out.push(c.id + "/" + m.id + ": render did not return a string");
                  continue;
                }
              } catch (e) {
                out.push(c.id + "/" + m.id + " (" + m.title + "): render threw " + (e.message || e));
                continue;
              }
              // A leftover id from another course's scene helper = copy-paste slip.
              const ids = html.match(/(?:id|for)="(d\d+)[a-z]?"/g) || [];
              const prefixes = new Set(ids.map((s) => s.replace(/.*"(d\d+).*/, "$1")));
              if (prefixes.size > 1)
                out.push(c.id + "/" + m.id + " (" + m.title + "): mixed scene prefixes " + [...prefixes].join(","));
              // dXXlbl() runs its text through esc(), which turns undefined/null into
              // an empty string -- a missing label looks blank rather than broken.
              // Catch the empty <text> element directly.
              const emptyLabels = [];
              const labels = html.match(/<text\b[^>]*>\s*<\/text>/g) || [];
              labels.forEach((l) => emptyLabels.push(l));
              if (emptyLabels.length)
                out.push(c.id + "/" + m.id + " (" + m.title + "): " + emptyLabels.length + " empty <text> label(s) in the scene");
              if (html.length < 400)
                out.push(c.id + "/" + m.id + " (" + m.title + "): intro suspiciously short (" + html.length + ")");
              // dXXlbl() runs its text through esc(), which turns undefined/null into
              // an EMPTY string -- a lost label looks blank, never "undefined".
              const emptyT = (html.match(/<text\b[^>]*>\s*<\/text>/g) || []).length;
              if (emptyT)
                out.push(c.id + "/" + m.id + " (" + m.title + "): " + emptyT + " empty <text> label(s)");

              // Now mount it for real and click through EVERY step. courseStepper
              // only shows step 1 on mount and swallows exceptions in show(), so
              // a broken step 4 is invisible unless somebody clicks Next.
              try {
                openCourseModule(m.id);
                const box = document.getElementById("modalBox") || document.body;
                const scan = (where) => {
                  const t = box.textContent || "";
                  const h = box.innerHTML || "";
                  const bad = [];
                  // NOTE: esc() renders undefined/null as an EMPTY string, so a
                  // missing label shows up as a blank -- not as the word
                  // "undefined". Hence the empty-caption check below.
                  if (t.indexOf("undefined") >= 0) bad.push("shows 'undefined'");
                  if (h.indexOf("[object Object]") >= 0) bad.push("shows '[object Object]'");
                  if (t.indexOf("NaN") >= 0) bad.push("shows 'NaN'");
                  const cap = box.querySelector(".m1-cap");
                  if (!cap || !cap.textContent.trim()) bad.push("empty step caption");
                  // A step caption that lost its label renders an empty <text>.
                  // This only appears AFTER a Next click, so it cannot be caught
                  // from the string render() returned.
                  // A caption whose argument went missing renders as an EMPTY
                  // <text> (esc() maps undefined to ""), never as the word
                  // "undefined" -- so look for the blank element itself.
                  let blank = 0;
                  box.querySelectorAll("text").forEach((el) => {
                    if (!el.textContent.trim()) blank++;
                  });
                  if (blank) bad.push(blank + " empty <text> label(s)");
                  // Two labels overprint only if they share a row AND overlap
                  // horizontally. Node captions are deliberately on one row.
                  const rows = {};
                  box.querySelectorAll("text").forEach((el) => {
                    const y = el.getAttribute("y");
                    const x = parseFloat(el.getAttribute("x"));
                    const s = (el.textContent || "").trim();
                    if (!y || !s || !isFinite(x)) return;
                    (rows[y] = rows[y] || []).push({ x, s, w: s.length * 4.3 });
                  });
                  Object.keys(rows).forEach((y) => {
                    const r = rows[y].sort((a, b) => a.x - b.x);
                    for (let i = 1; i < r.length; i++) {
                      const prev = r[i - 1];
                      if (prev.x + prev.w / 2 > r[i].x - r[i].w / 2)
                        bad.push('overprint on y=' + y + ': "' + prev.s + '" and "' + r[i].s + '"');
                    }
                  });
                  return bad;
                };
                let step = 0;
                for (;;) {
                  const bad = scan(step);
                  if (bad.length) {
                    out.push(
                      c.id + "/" + m.id + " (" + m.title + "): step " + (step + 1) + " " + bad.join(", "),
                    );
                    break;
                  }
                  // courseStepControls emits id="<prefix>next"; grab it by suffix,
                  // not by CSS position, so the selector cannot silently miss.
                  const btns = box.querySelectorAll(".m1-controls button");
                  let nb = null;
                  for (const b of btns) if (/next$/i.test(b.id || "")) nb = b;
                  if (!nb) {
                    out.push(
                      c.id + "/" + m.id + " (" + m.title + "): found " + btns.length + " step buttons but no Next",
                    );
                    break;
                  }
                  if (nb.disabled) break;
                  nb.click();
                  step++;
                  if (step > 40) break; // a runaway stepper is itself a bug
                }
                // Only complain when the module claims to be interactive but offers
                // no way forward. Not every module has a stepper (plain prose,
                // or the reveal-style "p-0"/"p-1" devices).
                if (box.querySelector(".m1-controls") && step === 0) {
                  const revealed = box.querySelector('[id$="-0"]');
                  if (!revealed)
                    out.push(c.id + "/" + m.id + " (" + m.title + "): step controls but nothing to step through");
                }
                closeModal();
              } catch (e) {
                out.push(c.id + "/" + m.id + " (" + m.title + "): mount threw " + (e.message || e));
                try { closeModal(); } catch (x) {}
              }
            }
            if (l.quizId) {
              const q = quizForId(l.quizId);
              if (!q || !q.qs || q.qs.length < 3)
                out.push(c.id + "/" + l.id + ": quiz " + l.quizId + " has too few questions");
            }
          }
        }
        return out;
      });
      check(
        "every module of courses 25-30 mounts clean DOM (render + mount + step captions)",
        deepDetail.length === 0,
        deepDetail,
      );

      // Every course must point at a task that actually exists.
      const badTaskRefs = await page.evaluate(() => {
        const ids = new Set(getTasks().map((t) => t.id));
        const bad = [];
        for (const c of allCourses())
          for (const l of c.lessons)
            if (l.taskId && !ids.has(l.taskId))
              bad.push(c.id + "/" + l.id + " -> unknown task '" + l.taskId + "'");
        return bad;
      });
      check(
        "every course taskId resolves to a real task",
        badTaskRefs.length === 0,
        badTaskRefs,
      );

      // Render a bounded sample of the OTHER courses to catch template errors.
      if (RENDER_SAMPLE > 0) {
        const renderErrors = await page.evaluate(async (perCourse) => {
          const errs = [];
          const courses = window.allCourses();
          for (const c of courses) {
            window.setActiveCourse(c);
            let n = 0;
            for (const l of c.lessons || []) {
              for (const m of l.modules || []) {
                if (n >= perCourse) break;
                try {
                  const out = m.build ? m.build() : { html: m.render() };
                  const html = (out && out.html) || "";
                  if (typeof html !== "string") {
                    errs.push(c.id + "/" + m.id + ": did not return HTML");
                  } else if (/undefined|\[object Object\]|NaN/.test(html)) {
                    errs.push(c.id + "/" + m.id + ": rendered HTML contains a broken value");
                  }
                } catch (e) {
                  errs.push(c.id + "/" + m.id + ": " + e.message);
                }
                n++;
              }
              if (n >= perCourse) break;
            }
          }
          return errs;
        }, RENDER_SAMPLE);
        check(
          "sample module render (" + RENDER_SAMPLE + "/course) produces clean HTML",
          renderErrors.length === 0,
          renderErrors,
        );
      }
    }

    /* ----------------------------------------------------------- presets */
    if (run("presets")) {
      suite("presets");
      // DB is declared `let DB = null` in js/01-core.js, so it is a global LEXICAL
      // binding and `window.DB = x` would create a second, unrelated property
      // while the app keeps using the original. Always assign the bare identifier.
      const dbReach = await page.evaluate(() => {
        const before = DB;
        DB = { segments: [], devices: [{ id: "probe_dev", type: "l2switch" }], hosts: [], links: [] };
        const seen = !!getNode("probe_dev");
        DB = before;
        return seen;
      });
      check(
        "page-side DB assignment reaches the app (guard against a vacuous suite)",
        dbReach,
        "assigning DB in page context did not reach getNode()",
      );

      const report = await page.evaluate(() => {
        const out = [];
        const presets = window.getPresets();
        for (const pr of presets) {
          const rec = { id: pr.id, name: pr.name };
          try {
            DB = pr.build();
            migrateDB();
            runtimeClear();
            render();
            refreshAll();
            rec.segments = (DB.segments || []).length;
            rec.devices = (DB.devices || []).length;
            rec.hosts = (DB.hosts || []).length;
            rec.links = (DB.links || []).length;
            // Prove the topology we just measured is the one the app is holding:
            // resolve a real node id back through the app's own lookup.
            const probe = (DB.devices || [])[0];
            rec.live = !!probe && !!getNode(probe.id);
            rec.empty = !rec.devices && !rec.hosts && !rec.segments;
            rec.ok = !rec.empty && rec.live;
          } catch (e) {
            rec.ok = false;
            rec.err = (e && e.message) || String(e);
          }
          out.push(rec);
        }
        return out;
      });

      check(
        "preset list is not empty",
        report.length > 0,
        "getPresets() returned nothing",
      );
      check(
        "every preset builds, migrates and renders as the live topology",
        report.every((r) => r.ok),
        report
          .filter((r) => !r.ok)
          .map((r) =>
            r.err
              ? r.id + ": " + r.err
              : r.live === false
                ? r.id + ": nodes are not resolvable through getNode() -- DB assignment did not land"
                : r.id + ": built an empty topology",
          ),
      );

      // Each example network advertises specific, testable claims in its bullet
      // list. Assert the network actually behaves that way, so "the topology
      // loads" can never be mistaken for "the topology teaches".
      //
      // This MUST run before the build/render loop above. That loop calls
      // netRender()/refreshAll(), which stomp cached render state; a later
      // evaluateEP then reports "noroute" for traffic that is plainly fine on a
      // freshly built topology. Rebuild per preset and never render here.
      const claims = await page.evaluate(() => {
        const spec = {
          dc: [
            ["dc_w1", "dc_int", { proto: "tcp", port: 443 }, "allowed", "internet reaches the public web"],
            ["dc_w1", "dc_a1", { proto: "tcp", port: 443 }, "allowed", "DMZ may call the application tier"],
            ["dc_w1", "dc_db1", { proto: "tcp", port: 1433 }, "blocked", "the DMZ cannot pivot into the database"],
            ["dc_w1", "dc_st1", { proto: "tcp", port: 2049 }, "blocked", "the DMZ cannot pivot into storage"],
            ["dc_a1", "dc_db1", { proto: "tcp", port: 1433 }, "allowed", "the app tier reaches its database"],
            ["dc_a1", "dc_st1", { proto: "tcp", port: 2049 }, "allowed", "the app tier reaches storage over NFS"],
            ["dc_w1", "dc_con", { proto: "tcp", port: 22 }, "blocked", "the DMZ cannot reach the management network"],
          ],
          campus: [
            ["cp_gst1", "cp_int", { proto: "tcp", port: 443 }, "allowed", "guests still get internet"],
            ["cp_gst1", "cp_file", { proto: "tcp", port: 445 }, "blocked", "guests cannot reach the file server"],
            ["cp_stf2", "cp_file", { proto: "tcp", port: 445 }, "allowed", "staff reach the file server"],
            ["cp_stu1", "cp_file", { proto: "tcp", port: 445 }, "allowed", "students reach the file server"],
          ],
          branch: [
            ["br_pc1", "br_nas", { proto: "tcp", port: 445 }, "allowed", "HQ reaches its own file server"],
            ["br_b1pc", "br_nas", { proto: "tcp", port: 445 }, "allowed", "branch 1 reaches HQ over the VPN"],
            ["br_b2pc", "br_nas", { proto: "tcp", port: 445 }, "allowed", "branch 2 reaches HQ over the VPN"],
            ["br_b1pc", "br_intA", { proto: "tcp", port: 443 }, "allowed", "branch 1 reaches the internet"],
          ],
          voip: [
            ["vc_p1", "vc_cm", { proto: "udp", port: 5060 }, "allowed", "a phone reaches the call manager on SIP"],
            ["vc_p1", "vc_cm", { proto: "tcp", port: 80 }, "allowed", "a phone reaches the call manager web UI"],
            ["vc_pc1", "vc_cm", { proto: "udp", port: 5060 }, "blocked", "a data PC cannot talk to the call manager"],
            ["vc_pc1", "vc_int", { proto: "tcp", port: 443 }, "allowed", "a data PC reaches the internet"],
            ["vc_p1", "vc_int", { proto: "tcp", port: 443 }, "blocked", "a phone cannot browse"],
          ],
          hotel: [
            ["ht_gstnb", "ht_int", { proto: "tcp", port: 443 }, "allowed", "a guest gets internet"],
            ["ht_gstnb", "ht_pms", { proto: "tcp", port: 445 }, "blocked", "a guest cannot reach the property system"],
            ["ht_gstnb", "ht_pos1", { proto: "tcp", port: 80 }, "blocked", "a guest cannot reach point of sale"],
            ["ht_tv", "ht_int", { proto: "tcp", port: 443 }, "allowed", "a room TV may stream"],
            ["ht_tv", "ht_pms", { proto: "tcp", port: 445 }, "blocked", "a room TV cannot reach the property system"],
            ["ht_desk", "ht_pms", { proto: "tcp", port: 445 }, "allowed", "the front desk reaches the property system"],
            ["ht_pos1", "ht_pms", { proto: "tcp", port: 443 }, "allowed", "point of sale reaches the property system"],
          ],
          otics: [
            ["ot_pc", "ot_hist", { proto: "tcp", port: 1433 }, "allowed", "IT reaches the historian"],
            ["ot_pc", "ot_plc", { proto: "tcp", port: 502 }, "blocked", "IT cannot reach the PLC directly"],
            ["ot_hist", "ot_plc", { proto: "tcp", port: 502 }, "allowed", "the historian collects from the PLC"],
          ],
        };
        const out = [];
        for (const key in spec) {
          const pr = getPresets().find((p) => p.id === key);
          if (!pr) {
            out.push({ preset: key, missing: true });
            continue;
          }
          // Rebuild from scratch for every preset. The build/render loop above left
          // cached render state behind; only a clean build gives a trustworthy
          // path result, and only then is "noroute" meaningful.
          DB = pr.build();
          migrateDB();
          runtimeClear();
          render();
          for (const [src, dst, tr, want, label] of spec[key]) {
            let got = "threw";
            try {
              got = evaluateEP(src, dst, tr, { commit: true }).status;
            } catch (e) {
              got = "threw: " + e.message;
            }
            out.push({ preset: key, src, dst, want, got, label, ok: got === want });
          }
        }
        return out;
      });

      const missingPreset = claims.filter((c) => c.missing).map((c) => c.preset);
      check(
        "every example network with documented claims is listed in getPresets()",
        missingPreset.length === 0,
        missingPreset.map((p) => p + " has documented behaviour but cannot be loaded"),
      );
      const badClaims = claims.filter((c) => !c.missing && !c.ok);
      // Run the claim probes FIRST, on their own, before the build/render loop
      // below walks every preset. That loop leaves DB holding whichever preset
      // sorted last, so a stale DB silently turns every "allowed" into "noroute".
      check(
        "every example network behaves the way its bullet list claims (" +
          (claims.length - missingPreset.length) +
          " claims)",
        badClaims.length === 0,
        badClaims.map(
          (c) =>
            c.preset +
            ": " +
            c.label +
            " (" +
            c.src +
            " -> " +
            c.dst +
            ") expected " +
            c.want +
            " but got " +
            c.got,
        ),
      );

      const orphans = await page.evaluate(() => {
        const listed = new Set(window.getPresets().map((p) => p.id));
        // NOTE: PRESET_BUILDERS is declared with `const`, so it is NOT on window.
        // Reference the bare identifier (global lexical scope) or this check
        // silently passes on an empty list.
        const builders = typeof PRESET_BUILDERS === "object" && PRESET_BUILDERS ? Object.keys(PRESET_BUILDERS) : null;
        return { builders, orphans: builders === null ? null : builders.filter((k) => !listed.has(k)) };
      });
      check(
        "PRESET_BUILDERS is reachable from global scope",
        orphans.builders !== null,
        "PRESET_BUILDERS did not resolve -- the check below would pass vacuously",
      );
      if (orphans.builders !== null) {
        check(
          "no preset builder is unreachable from getPresets()",
          orphans.orphans.length === 0,
          orphans.orphans.map((k) => "PRESET_BUILDERS has '" + k + "' but getPresets() does not list it"),
        );
      }

      if (!QUIET) {
        report.forEach((r) =>
          process.stdout.write(
            "         " +
              (r.ok ? " " : "!") +
              " " +
              r.id +
              ": " +
              r.devices +
              " dev, " +
              r.segments +
              " net, " +
              r.hosts +
              " hosts, " +
              r.links +
              " links\n",
          ),
        );
      }
    }

    /* ----------------------------------------------------------- wireless */
    if (run("wireless")) {
      suite("wireless (derived band/distance capacity)");
      const w = await page.evaluate(() => {
        const seg = {
          id: "wseg",
          name: "WLAN",
          subnet: "10.0.9.0/24",
          vlan: "9",
          isInternet: false,
        };
        const ssid = (name, band, ch) => ({
          name,
          segId: "wseg",
          pass: "x",
          sec: "wpa2",
          on: true,
          band,
          ch,
        });
        DB = {
          segments: [seg],
          devices: [
            {
              id: "wap",
              type: "ap",
              label: "AP",
              x: 0,
              y: 0,
              wifiOn: true,
              ssids: [ssid("B24", "2.4", 6), ssid("B5", "5", 36)],
            },
            {
              id: "wmesh",
              type: "ap",
              label: "Mesh",
              x: 300,
              y: 0,
              wifiOn: true,
              uplink: "mesh",
              ssids: [ssid("B5", "5", 36)],
            },
            {
              id: "wrep",
              type: "ap",
              label: "Rep",
              x: 300,
              y: 60,
              wifiOn: true,
              uplink: "repeater",
              repSsid: "B5",
              ssids: [],
            },
          ],
          hosts: [
            { id: "hNear", type: "host", kind: "ntb", label: "Near", segId: "wseg", x: 30, y: 0 },
            { id: "hMid", type: "host", kind: "ntb", label: "Mid", segId: "wseg", x: 300, y: 0 },
            { id: "hFar", type: "host", kind: "ntb", label: "Far", segId: "wseg", x: 900, y: 0 },
            { id: "hHuge", type: "host", kind: "ntb", label: "Huge", segId: "wseg", x: 40000, y: 0 },
          ],
          links: [
            { id: "wbm", fromId: "wmesh", toId: "wap", wl: "mesh" },
            { id: "wbr", fromId: "wrep", toId: "wap", wl: "rep" },
          ],
        };
        migrateDB();

        const ap = getNode("wap");
        const near24 = wlCell(ap, "hNear", "B24");
        const near5 = wlCell(ap, "hNear", "B5");
        const mid5 = wlCell(ap, "hMid", "B5");
        const far5 = wlCell(ap, "hFar", "B5");
        const huge5 = wlCell(ap, "hHuge", "B5");

        const mesh = wlBackhaulMbits({ wl: "mesh", fromId: "wmesh", toId: "wap" });
        const rep = wlBackhaulMbits({ wl: "rep", fromId: "wrep", toId: "wap" });
        // The repeater's own radio reading, so the halving contract can be checked
        // without depending on two APs sitting at the same distance with the same
        // co-channel neighbours.
        const repCell = wlCell(getNode("wrep"), "wap", "B5");

        // A client link with no hand-set speed must still produce a cost.
        const l = { id: "cl", fromId: "hNear", toId: "wap" };
        getNode("hNear").wifi = { apId: "wap", ssid: "B5" };
        const clientIsWireless = isWirelessClientLink(l);
        const clientMb = wlClientMbits(l);
        const clientCost = baseLinkCost(l);

        // migration must reject a channel that does not exist on that band
        DB.devices[0].ssids[0].ch = 44; // 44 is a 5 GHz channel
        migrateDB();
        const chRejected = DB.devices[0].ssids[0].ch;

        // Roaming: a second AP broadcasting the same SSID. It is placed clear of
        // the mesh fixtures so no co-located AP can win a distance tie instead.
        DB.devices.push({
          id: "wap2",
          type: "ap",
          label: "AP2",
          x: 0,
          y: 600,
          wifiOn: true,
          ssids: [ssid("B5", "5", 36)],
        });
        DB.links.push({ id: "cable", fromId: "wap", toId: "wap2" });
        migrateDB();
        const cli = {
          id: "hCli",
          type: "host",
          kind: "ntb",
          label: "Cli",
          segId: "wseg",
          x: 0,
          y: 300,
          wifi: { apId: "wap", ssid: "B5" },
        };
        DB.hosts.push(cli);
        // The association link the app creates when a client joins a network.
        DB.links.push({ id: "cliLink", fromId: "hCli", toId: "wap" });
        // Dead centre between the two APs (300 px each): no reason to move.
        const stayedPut = roamWifiHost(cli) === false && cli.wifi.apId === "wap";
        // Nudge 10 px toward AP2 -- it is nearer by a hair, and real clients do not
        // hop for that.
        cli.y = 310;
        const stayedPutNudge = roamWifiHost(cli) === false && cli.wifi.apId === "wap";
        // Now decisively inside AP2's cell.
        cli.y = 500;
        const roamRet = roamWifiHost(cli);
        const roamed = roamRet === true && cli.wifi.apId === "wap2";
        const roamLinkFollowed = DB.links.some(
          (x) => x.fromId === "hCli" && x.toId === "wap2",
        );
        const roamDebug = {
          y: cli.y,
          wifiAfter: cli.wifi && cli.wifi.apId,
          ret: roamRet,
          d1: Math.round(Math.abs((getNode("wap").y || 0) - cli.y)),
          d2: Math.round(Math.abs((getNode("wap2").y || 0) - cli.y)),
          inLinks: DB.links.filter((x) => x.fromId === "hCli" || x.toId === "hCli").map((x) => x.fromId + "->" + x.toId),
        };

        return {
          bandDefault: wlBandOf({}),
          chDefault24: wlChOf({ band: "2.4" }),
          chDefault5: wlChOf({ band: "5" }),
          chValid: wlChOf({ band: "5", ch: 44 }),
          chKept: wlChOf({ band: "2.4", ch: 11 }),
          chRejected,
          txDefault: wlTxOf({}),
          txLow: wlTxOf({ wlTx: 3 }),
          txHigh: wlTxOf({ wlTx: 99 }),
          near24: { mb: near24.mbits, rssi: Math.round(near24.rssi), dist: Math.round(near24.distM) },
          near5: { mb: near5.mbits, rssi: Math.round(near5.rssi) },
          mid5: { mb: mid5.mbits, rssi: Math.round(mid5.rssi) },
          far5: { mb: far5.mbits, rssi: Math.round(far5.rssi) },
          huge5: { mb: huge5.mbits, rssi: Math.round(huge5.rssi), oor: huge5.outOfRange },
          mesh,
          rep,
          repCellMb: repCell.mbits,
          repCellBand: repCell.band,
          repCellCh: repCell.ch,
          stayedPut,
          stayedPutNudge,
          roamed,
          roamLinkFollowed,
          roamDebug,
          clientIsWireless,
          clientMb,
          clientCost,
        };
      });

      checkEq("band defaults to 5 GHz when unset", w.bandDefault, "5");
      checkEq("2.4 GHz defaults to channel 6", w.chDefault24, 6);
      checkEq("5 GHz defaults to channel 36", w.chDefault5, 36);
      checkEq("a valid channel is kept (5 GHz / 44)", w.chValid, 44);
      checkEq("a valid channel is kept (2.4 GHz / 11)", w.chKept, 11);
      checkEq(
        "migration rejects channel 44 on 2.4 GHz",
        w.chRejected,
        6,
      );
      checkEq("transmit power defaults to 20 dBm", w.txDefault, 20);
      checkEq("out-of-range transmit power falls back to default", w.txLow, 20);
      checkEq("over-range transmit power falls back to default", w.txHigh, 20);

      check(
        "5 GHz outrates 2.4 GHz at the same distance",
        w.near5.mb > w.near24.mb,
        "5 GHz " + w.near5.mb + " vs 2.4 GHz " + w.near24.mb,
      );
      check(
        "capacity falls off with distance",
        w.near5.mb > w.mid5.mb && w.mid5.mb > w.far5.mb,
        "near " + w.near5.mb + " / mid " + w.mid5.mb + " / far " + w.far5.mb,
      );
      check(
        "a distant client is out of range and gets no capacity",
        w.huge5.oor === true && w.huge5.mb === 0,
        "rssi " + w.huge5.rssi + " dBm, mbits " + w.huge5.mb,
      );
      check(
        "mesh backhaul derives a capacity from band and distance",
        w.mesh > 0 && w.mesh < 1200,
        "mesh " + w.mesh + " Mbit/s",
      );
      check(
        "a repeater backhaul gets exactly half the airtime",
        w.repCellMb > 0 && w.rep === Math.round(w.repCellMb / 2),
        "radio reading " + w.repCellMb + " Mbit/s -> repeater " + w.rep + " Mbit/s",
      );
      check(
        "a repeater is always slower than a mesh hop",
        w.rep < w.mesh,
        "mesh " + w.mesh + " vs repeater " + w.rep,
      );
      check(
        "a repeater inherits the band and channel it repeats",
        w.repCellBand === "5" && w.repCellCh === 36,
        "band " + w.repCellBand + ", channel " + w.repCellCh,
      );
      check("a client link is recognised as wireless", w.clientIsWireless === true);
      check(
        "a client link derives capacity with no hand-set speed",
        w.clientMb > 0,
        "mbits " + w.clientMb,
      );
      check(
        "a client link still produces an OSPF cost",
        w.clientCost > 0 && isFinite(w.clientCost),
        "cost " + w.clientCost,
      );

      check(
        "a client stays on its AP when that AP is nearer",
        w.stayedPut,
        "roamed to " + (w.stayedPut ? "" : "the wrong AP"),
      );
      check(
        "roaming hysteresis: a hair's-breadth move does not flip the client",
        w.stayedPutNudge,
        "client hopped although the current AP was still nearly as close",
      );
      check(
        "a client does roam once another AP is clearly nearer",
        w.roamed,
        "expected a move to wap2: " + JSON.stringify(w.roamDebug),
      );
      check(
        "the client link follows the client to the new AP",
        w.roamLinkFollowed,
        "no link from hCli to wap2 after roaming: " + JSON.stringify(w.roamDebug),
      );

      if (!QUIET) {
        process.stdout.write(
          "         near " +
            w.near24.mb +
            "M (2.4) vs " +
            w.near5.mb +
            "M (5), mid " +
            w.mid5.mb +
            "M, far " +
            w.far5.mb +
            "M, out-of-range " +
            (w.huge5.oor ? "yes" : "no") +
            "\n",
        );
      }

      // Drive the real AP modal: band and channel must survive the edit -> save
      // -> reload round trip, and switching band must repopulate the channel list.
      const ui = await page.evaluate(() => {
        DB = {
          segments: [
            { id: "uiseg", name: "WLAN", subnet: "10.0.8.0/24", vlan: "8", isInternet: false },
          ],
          devices: [
            {
              id: "uap",
              type: "ap",
              label: "AP",
              x: 0,
              y: 0,
              wifiOn: true,
              ssids: [
                { name: "UI-NET", segId: "uiseg", pass: "pw", sec: "wpa2", on: true, band: "5", ch: 36 },
              ],
            },
          ],
          hosts: [],
          links: [],
        };
        migrateDB();
        render();
        openDeviceModal(getNode("uap"));

        const hadBand = !!document.querySelector(".ss-band");
        const hadCh = !!document.querySelector(".ss-ch");
        const hadTx = !!document.querySelector("#wifiTx");
        const bandSel = document.querySelector(".ss-band");

        bandSel.value = "2.4";
        bandSel.dispatchEvent(new Event("change"));

        // The row is redrawn on a band change, so re-query rather than reuse.
        const chSel = document.querySelector(".ss-ch");
        const chOpts = Array.prototype.map.call(chSel.options, (o) => +o.value);
        const chDefaultAfterBandSwitch = +chSel.value;
        chSel.value = "11";
        chSel.dispatchEvent(new Event("change"));

        const txSel = document.querySelector("#wifiTx");
        txSel.value = "10";
        txSel.dispatchEvent(new Event("change"));

        document.querySelector("#mSave").click();

        const d = getNode("uap");
        const saved = {
          band: d.ssids[0].band,
          ch: d.ssids[0].ch,
          wlTx: d.wlTx,
        };
        // And once more through migrateDB, as a reload would.
        migrateDB();
        const reloaded = {
          band: getNode("uap").ssids[0].band,
          ch: getNode("uap").ssids[0].ch,
          wlTx: getNode("uap").wlTx,
        };
        closeModal();
        return {
          hadBand,
          hadCh,
          hadTx,
          chCount: chOpts.length,
          chMax: Math.max.apply(null, chOpts),
          chDefaultAfterBandSwitch,
          saved,
          reloaded,
        };
      });

      check("AP modal offers a band selector", ui.hadBand);
      check("AP modal offers a channel selector", ui.hadCh);
      check("AP modal offers a transmit power control", ui.hadTx);
      checkEq(
        "switching to 2.4 GHz repopulates the channel list (1-13)",
        ui.chCount + "/" + ui.chMax,
        "13/13",
      );
      checkEq("switching band resets to that band's default channel", ui.chDefaultAfterBandSwitch, 6);
      check(
        "band saved through the modal",
        ui.saved.band === "2.4",
        "got " + JSON.stringify(ui.saved.band),
      );
      checkEq("channel saved through the modal", ui.saved.ch, 11);
      checkEq("transmit power saved through the modal", ui.saved.wlTx, 10);
      check(
        "band, channel and power survive a reload",
        ui.reloaded.band === "2.4" && ui.reloaded.ch === 11 && ui.reloaded.wlTx === 10,
        "got " + JSON.stringify(ui.reloaded),
      );
    }

    /* ---------------------------------------------- errors seen during runs */
    suite("console hygiene (whole run)");
    check(
      "no uncaught exceptions during the whole run",
      pageErrors.length === 0,
      pageErrors,
    );
    check(
      "no console.error during the whole run",
      consoleErrors.length === 0,
      consoleErrors,
    );
    check(
      "no failed requests during the whole run",
      failedRequests.length === 0,
      failedRequests,
    );
  } finally {
    await context.close().catch(() => {});
    await browser.close().catch(() => {});
    server.close();
  }

  /* ---------------------------------------------------------------- summary */
  const failed = results.filter((r) => r.status === "fail");
  const known = results.filter((r) => r.status === "known");
  const bySuite = {};
  results.forEach((r) => {
    bySuite[r.suite] = bySuite[r.suite] || { pass: 0, fail: 0, known: 0 };
    bySuite[r.suite][r.status]++;
  });

  process.stdout.write("\n" + "=".repeat(64) + "\n");
  Object.keys(bySuite).forEach((s) => {
    const b = bySuite[s];
    const mark = b.fail ? "FAIL " : b.known ? "warn " : "ok   ";
    const tally = b.pass + "/" + (b.pass + b.fail + b.known) + (b.known ? " (" + b.known + " known)" : "");
    process.stdout.write(mark + s.padEnd(40) + tally + "\n");
  });

  const passCount = results.filter((r) => r.status === "pass").length;
  process.stdout.write(
    "\n" +
      passCount +
      "/" +
      results.length +
      " checks passed" +
      (known.length ? ", " + known.length + " known defect(s)" : "") +
      (failed.length ? " -- " + failed.length + " FAILED" : "") +
      "\n",
  );

  if (known.length) {
    process.stdout.write("\nKnown defects (tracked, not counted as passes):\n");
    known.forEach((k) => process.stdout.write("  - [" + k.suite + "] " + k.label + "\n"));
  }
  if (failed.length) {
    process.stdout.write("\nFailures:\n");
    failed.forEach((f) => process.stdout.write("  - [" + f.suite + "] " + f.label + "\n"));
  }

  // Known defects do not fail the run; anything genuinely broken does.
  process.exit(failed.length ? 1 : 0);
}

main().catch((err) => {
  process.stderr.write("\nharness error: " + ((err && err.stack) || err) + "\n");
  process.exit(2);
});
