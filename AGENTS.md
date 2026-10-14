# AGENTS.md — networksim

Static, no-build browser app. The **app** has no bundler and no runtime
dependencies: `index.html` loads plain `<script>` tags. Don't invent build or
runtime-dependency commands for it.

The **repo** does carry a dev-only verification harness: a `package.json` with
one devDependency (`playwright-core`) and `tools/verify.js`. Nothing under
`node_modules/`, `package.json`, or `tools/` is ever loaded by the browser. See
"How to verify".

## How to run / verify

- Open `index.html` via any static server (e.g. `python -m http.server`) or
  directly in a browser. There is no build step — edit files, reload.
- There is no `err.log`; it was an empty leftover and has been removed. Console
  output goes to the browser DevTools, not to a file.
- Automated check: `npm install` then `npm run verify`. This serves the repo
  over a throwaway localhost port, boots it in the installed Chrome/Edge (found
  automatically; override with `--chrome=<path>` or `NETSIM_CHROME`), and runs
  five suites — **boot**, **selftest** (all 96 learning tasks must fail before
  `solve()` and pass after, via `window.netSelfTest`), **courses** (all 30
  course files load; every module has `render`/`build`; every `quizId`
  resolves; every module of courses 25-30 is opened for real and clicked through
  every step), **presets** (every example builds, migrates and renders as the live
  topology, **and** 29 assertions that each example actually behaves the way its
  own bullet list claims — the load test was never the interesting part),
  **wireless** (the derived band/distance radio model, roaming hysteresis, and
  the AP modal round-trip). Exits non-zero on failure. Useful flags:
  `--suite=selftest,wireless`, `--sample=0`, `--quiet`, `--headed`.
- `tools/verify.js` has a `KNOWN` map of already-triaged defects. Those print as
  `KNOWN`, never as a pass, and do not fail the run. **Delete an entry when the
  defect is fixed** so the check runs for real.
- A check that never fails is worse than no check. Two have already been caught
  passing vacuously: `window.PRESET_BUILDERS` (`const`, so not on `window`) and
  `window.DB = x` (`let DB`, so it creates a second binding the app ignores).
  Assign and read **bare identifiers**, and keep the guard checks that prove the
  fixture actually landed.
- Manual checks still exist: reload the page, watch the DevTools console, and use
  Topology check / resilience / blast-radius / traffic path test.

## Architecture facts that matter

- `index.html` loads `js/01-core.js` … `js/19-boot.js` as plain `<script>` tags,
  in that exact order. All of them share **one global scope** — helpers
  (`$`, `esc`, `icon`, `t`, `tf`, task/course globals, …) are defined across
  these files and expected to be visible everywhere. Do not wrap them in
  modules, IIFEs, or rename without a global call-site sweep.
- A top-level `function` declaration becomes a `window` property; a top-level
  `const`/`let` does **not**. Code evaluated in the page (including
  `tools/verify.js`) must reference bare identifiers like `PRESET_BUILDERS`,
  not `window.PRESET_BUILDERS`, or it silently reads `undefined`.
- Filenames are load-order numbers: a new dependency must be placed before its
  first use, and `19-boot.js` is the entrypoint that wires events and boots.
- Courses are lazy-loaded: `js/19-boot.js` injects `courses/course-core.js`
  (`ensureCourse`), which in turn injects `courses/course<N>.js`
  (`__loadCourseFile`). Each `course<N>.js` assumes the globals from
  `course-core.js` (and from the main app) already exist.
- Adding course #N touches **six** places in `courses/course-core.js`: the
  `COURSE_N` stub, the `COURSE_N_QUIZZES` / `COURSE_N_FINAL_EXTRA` line,
  `COURSE_COUNT`, the `__courseReg` array, `allCourses()`, and `CARD[N]` +
  its `$('courseOpenN').onclick` line. Also check the id is in a `COURSE_GROUPS`
  list for both `path` and `topic` (an unlisted course lands in "Other").
- A module's `render()` returns only the intro prose; the step captions live in
  `mount()` and only appear after a "Next" click — and `courseStepper` wraps
  `show()` in `try/catch`, so a broken step fails silently. The harness opens
  every new module and clicks through every step for this reason. Note `esc()`
  renders `undefined` as an **empty string**, so a lost label shows as a blank
  `<text>`, never as the word "undefined".
- There is **no bundle artifact**. An `app.js` (1.2 MB concatenated snapshot of
  `js/*.js`) used to sit in the root unreferenced by `index.html`; it was deleted
  on 14 Oct 2026 because it had gone stale and only invited edits to the wrong
  file. If a bundle is ever wanted again, generate it from `js/*.js` — never
  hand-edit it, and never let `index.html` load it.
- i18n is a single flat `STRINGS` object at the top of `js/01-core.js`, resolved
  by `t(key)` and `tf(key, ...args)` (both defined near the end of that file).
  There is **no** `LANG_DATA`, **no** `data-i18n` attributes, and **no**
  multi-language support — it is English only. Add new user-facing strings to
  `STRINGS`, not inline. Watch for hardcoded English left in the modals
  (`js/12-devcfg.js`, `js/13-ports.js`); move it into `STRINGS` when you touch it.
- Persistent state uses `localStorage` keys (theme: `netsim_theme`, course
  progress `netsim_course_progress`, tasks done `netsim_tasks_done`, topology
  saves `netsim_db`) — keep key names stable; users have saved data.

## Gotchas

- Never redeclare a top-level `const`/`let` that already exists in another
  `js/` file or inline in `index.html` — shared scope means it throws
  `SyntaxError: Identifier has already been declared`. Prefer reusing or
  checking with a grep first.
- `head.js` runs before `style.css` to set `data-theme` from localStorage;
  changing theme logic belongs there to avoid a flash of wrong theme.
- Files use **CRLF** line endings. Rewriting one with PowerShell `Set-Content`
  or a careless script can change the whole file's endings and bury a small edit
  in a huge diff; check the byte count afterwards. Edits that introduce lone `LF`
  can be normalised with a byte-level `s.replace(/\r?\n/g, "\r\n")` pass.
- Wireless capacity is **derived, never hand-set**: band + channel + transmit
  power + distance decide it (see the Wi-Fi radio model in `js/03-model.js`).
  `linkMbits(l)` is the single source of truth and feeds `baseLinkCost`. Do not
  write a derived rate into `l.speed` — the hand-set speed dropdowns only offer
  `SPEED_OPTS` values.
- `gatewaysOf()` walks L2 bridges only, so an **L3 device must be cabled
  directly to the access switch** that serves a VLAN. Attaching it to the same
  *segment* is not enough and yields a silent `noroute`. Working shape:
  `VLAN ← access switch ← L3 core`.
- A host with only a `segId` and no link has no neighbours, so `findFullPath`
  returns null. Every host needs a real cable (or a Wi-Fi association link).
- `netSelfTest` calls `setup()` once, runs `solve()`, then re-checks. Task setups
  must return a **fresh object literal** each call — a shared literal hands back
  the solved state and the task looks already-finished on its first run.
- Task criteria can assert radio/config state directly via `requireBand`,
  `requireChannel`, `minLinkMbits` / `maxLinkMbits`, `requireQos`,
  `requireCongested`, `requireLinks` (all handled in `flowOk`). Use these instead
  of inferring intent from a flow's verdict.
