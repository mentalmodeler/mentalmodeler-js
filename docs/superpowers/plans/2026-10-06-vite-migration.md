# Migrate mentalmodeler-js from CRA/react-scripts to Vite — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace `react-scripts@1.1.5` (CRA 1.x) with Vite as the dev-server/build/test toolchain for `mentalmodeler-js`, eliminating the ~173 Dependabot alerts that live in CRA's abandoned webpack/babel dependency tree, while preserving the dual standalone-app/embeddable-widget contract byte-for-byte in behavior (not necessarily in literal file bytes).

**Architecture:** `src/index.js` stays the single entry point with no code changes to its logic — Vite bundles it as a classic single-entry app (not "library mode"; the `window.MentalModelerConceptMap` assignment is already a plain side effect in the module, so a normal app build reproduces it). The committed `.css`/`.css.map` Less-compiler pipeline (`node-less-chokidar`) is untouched and orthogonal to the bundler. Production output is reshaped to **stable, unhashed filenames** (`build/static/js/main.js`, `build/static/css/main.css`) via Rollup output config — this is a deliberate improvement over CRA's hashed output, because it removes the manual "rename the JS bundle, hand-edit the hashed CSS href" steps that `mentalmodeler-suite`'s vendoring process currently requires (see `mentalmodeler-suite/docs/mentalmodeler-js-deploy-and-vendoring.md`).

**Tech Stack:** Vite 8, `@vitejs/plugin-react` 6, Vitest 5 + jsdom 30 (replacing CRA's bundled Jest), all as `devDependencies`. No change to runtime dependencies (`react@^16.4.2`, `react-redux@^5.0.7`, `redux@^4.0.0`, etc.).

**Spec:** No separate spec doc exists for this work — it's derived from this session's conversation plus two existing documents that define the contract this plan must not break:
- `mentalmodeler-js/CLAUDE.md` — dual standalone/widget architecture, `window.MentalModelerConceptMap` API, Less build pipeline.
- `mentalmodeler-suite/docs/mentalmodeler-js-deploy-and-vendoring.md` — the exact integration contract both consumer repos (`mentalmodeler-suite`, `mentalmodeler-scenario`) depend on (file paths, href conventions, the `window.MentalModelerConceptMap` call sites).

## Global Constraints

- Preserve `window.MentalModelerConceptMap = {render, load, save, screenshot}` exactly — consumed by `mentalmodeler-suite/src/components/ConceptMap/ConceptMap.jsx` (`render`, `load`), `mentalmodeler-suite/src/redux/actions/models.js` (`save`), `mentalmodeler-suite/src/services/print.js` (`screenshot`), and `mentalmodeler-scenario/index.html`'s `?gitmm` loader.
- Do not touch the Less→CSS compilation pipeline (`node-less-chokidar`, `build-css`/`watch-css` scripts, committed `.css`/`.css.map` files). It is independent of the JS bundler today and must stay that way.
- Keep GH Pages subpath-relative asset basing equivalent to today's `"homepage": "."` behavior — the deployed site lives at `https://mentalmodeler.github.io/mentalmodeler-js/`, a project subpath, not domain root.
- `npm run deploy` (`gh-pages -d build`) must keep working unchanged — build output must still land in `build/`.
- Pin new devDependencies to versions confirmed available at plan-authoring time: `vite@8.3.3`, `@vitejs/plugin-react@6.1.2`, `vitest@5.0.3`, `jsdom@30.1.2`. Local toolchain confirmed compatible: Node v24.18.0, npm 11.16.0.
- Do not change `react`/`react-dom`/`react-redux`/`redux`/`prop-types`/`classnames`/`file-saver`/`html2canvas`/`lodash.debounce`/`lodash.throttle` versions — out of scope.
- Do not fix the pre-existing `App.test.js` failure (`Connect(Map)` crashes under test — a React 16/jsdom incompatibility unrelated to the bundler). Carry it forward unchanged; this plan proves parity, not a fix.
- Do not commit changes inside `mentalmodeler-suite` or `mentalmodeler-scenario` as part of this plan — those are separate repos with their own review process. Task 5 copies files into their working trees only to smoke-test; committing there needs explicit separate confirmation.

## Review Focus

1. **GH Pages subpath relative-basing breaks** — an absolute (`/...`) path sneaks into the built `index.html` or a public asset reference, so the deployed site (served from `/mentalmodeler-js/`, not domain root) 404s on CSS/favicon/manifest even though it works fine from `localhost:5173/`. Owned by Task 2's nested-subpath local-server test.
2. **Downstream consumers silently break** — the manually re-vendored unhashed bundle isn't actually drop-in compatible with `mentalmodeler-suite`/`mentalmodeler-scenario` (e.g. a race where `window.MentalModelerConceptMap` is read before the script finishes evaluating, or a CSS specificity change) — the widget fails inside host pages even though standalone mode looks fine in isolation. Owned by Task 5's cross-repo smoke test.
3. **Extensionless `.mmp` import breaks in production only** — `./data/fire.mmp` resolves to `fire.mmp.js` via Vite's default extension resolution in dev, but a production-build-only path (minification, tree-shaking) could behave differently; `?demo` must be verified against the **built artifact**, not just the dev server. Owned by Task 1 (dev) and Task 2 (build).
4. **JSX-in-`.js`-extension files silently skipped** — `@vitejs/plugin-react`'s default `include` (`/\.[tj]sx?$/`) does cover `.js`, but if some component under `src/components/**` is missed, the failure mode is a broken render, not a build error. Owned by Task 1, which must exercise every component directory (`Controls`, `Map`, `Concept`, `Concepts`, `Relationship`, `Relationships`, `RelationshipValueDisplay`), not just the `App` shell.
5. **False sense of security on the Dependabot count** — after removing `react-scripts`, some other pre-existing vulnerable leaf (e.g. pulled in by `gh-pages` or `node-less-chokidar`, already present before this migration) could get miscounted as "fixed by this work." Owned by Task 4, which re-runs the full audit comparison rather than just checking `react-scripts` is gone.

---

## File Structure

- Create `vite.config.js` (repo root) — dev server, build, and Vitest config in one file.
- Create `index.html` (repo root) — Vite's dev/build entry, replacing `public/index.html`.
- Delete `public/index.html` (moved, not duplicated).
- Modify `package.json` — swap `react-scripts` for `vite`/`@vitejs/plugin-react`/`vitest`/`jsdom`; update `start-js`/`build-js`/`test-js` scripts; drop `eject`.
- No changes to `src/**`, `public/manifest.json`, `public/favicon.ico`, `public/shared/**`, or any `.less`/`.css` files.

---

### Task 1: Vite dev-server parity

**Files:**
- Modify: `package.json`
- Create: `vite.config.js`
- Create: `index.html`
- Delete: `public/index.html`

**Interfaces:**
- Produces: a working `npm start` that serves the standalone app at `http://localhost:3000/` with hot reload, functionally equivalent to today's `react-scripts start`.

- [ ] **Step 1: Remove `react-scripts`, add Vite toolchain to `package.json`**

In `dependencies`, remove:
```json
"react-scripts": "1.1.5",
```

In `devDependencies`, add (alongside the existing `gh-pages`, `node-less-chokidar`, `npm-run-all`):
```json
"@vitejs/plugin-react": "^6.1.2",
"vite": "^8.3.3"
```

Update `scripts`:
```json
"start-js": "vite",
"build-js": "vite build",
```
Remove the `"eject": "react-scripts eject"` line entirely — the binary it invokes no longer exists.

- [ ] **Step 2: Install**

Run: `npm install`
Expected: installs cleanly, `node_modules/.bin/vite` exists, `node_modules/react-scripts` is gone.

- [ ] **Step 3: Create `vite.config.js`**

```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    // relative base matches CRA's "homepage": "." — required because the
    // deployed site lives at a GH Pages project subpath, not domain root.
    base: './',
    server: {
        port: 3000,
    },
    build: {
        outDir: 'build',
        sourcemap: true,
        rollupOptions: {
            output: {
                entryFileNames: 'static/js/main.js',
                chunkFileNames: 'static/js/[name].js',
                assetFileNames: (assetInfo) => {
                    const name = assetInfo.name || (assetInfo.names && assetInfo.names[0]) || '';
                    return name.endsWith('.css') ? 'static/css/main.css' : 'static/media/[name][extname]';
                },
            },
        },
    },
    test: {
        environment: 'jsdom',
        // mirrors Jest's implicit it()/describe() globals so App.test.js needs no edits
        globals: true,
    },
});
```

- [ ] **Step 4: Create root `index.html`, delete `public/index.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
    <meta name="theme-color" content="#000000" />
    <link rel="manifest" href="%BASE_URL%manifest.json" />
    <link rel="shortcut icon" href="%BASE_URL%favicon.ico" />
    <link rel="stylesheet" href="%BASE_URL%shared/font-awesome.css" />
    <link rel="stylesheet" href="%BASE_URL%shared/foundation.css" />
    <link rel="stylesheet" href="%BASE_URL%shared/app.css" />
    <title>React App</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root" style="height: 100vh; width: 100vw"></div>
    <script type="module" src="/src/index.js"></script>
  </body>
</html>
```

Then delete `public/index.html` (content has moved here; `public/manifest.json`, `public/favicon.ico`, `public/shared/**` stay where they are — Vite copies `public/` verbatim into the build output root, same as CRA).

- [ ] **Step 5: Run the dev server and verify structurally**

Run: `npm run build-css && npx vite`
Expected: prints a local URL (`http://localhost:3000/`), no startup errors.

In a second terminal:
```bash
curl -s http://localhost:3000/ | grep -c 'type="module"'   # expect: 1
curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/src/index.js   # expect: 200
```

- [ ] **Step 6: Browser smoke test (standalone + demo + every component)**

With the dev server still running, open `http://localhost:3000/` in a browser and confirm, with devtools console open:
- No console errors on load.
- The `Controls` panel (left) and `Map` canvas (right) both render — proves `App.js`'s JSX and both top-level component trees compiled.
- Open `http://localhost:3000/?demo` — the Fire model loads with its concepts visible as nodes on the map, proving the extensionless `./data/fire.mmp` → `fire.mmp.js` import resolved.
- Add a new concept via the Controls panel, then draw a relationship between two concepts — this exercises `Concept`, `Concepts`, `Relationship`, `Relationships`, and `RelationshipValueDisplay`, confirming JSX transforms correctly across every component directory, not just `App`.
- In the devtools console, run `window.MentalModelerConceptMap` and confirm it returns an object with `render`, `load`, `save`, `screenshot` functions.

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json vite.config.js index.html
git rm public/index.html
git commit -m "Replace react-scripts dev server with Vite"
```

---

### Task 2: Production build parity

**Files:**
- No new files — this task only verifies Task 1's `vite.config.js` build output.

**Interfaces:**
- Consumes: `vite.config.js`'s `build` config from Task 1.
- Produces: a verified `build/` directory structure matching the current vendoring contract (`build/static/js/main.js`, `build/static/css/main.css`, `build/shared/*`, `build/manifest.json`, `build/favicon.ico`), confirmed to work when served from a GH-Pages-style subpath.

- [ ] **Step 1: Capture the current (pre-migration) build as a baseline, if not already captured**

If you still have a `build/` from before Task 1's changes, save its `index.html` for comparison:
```bash
cp build/index.html /tmp/cra-baseline-index.html
```
(If it's already gone, the known-good reference format is: `href="./manifest.json"`, `href="./favicon.ico"`, `href="./shared/font-awesome.css"`, `href="./static/css/main.<hash>.css"`, `src="./static/js/main.<hash>.js"` — all `./`-relative.)

- [ ] **Step 2: Build with Vite and inspect output structure**

```bash
rm -rf build
npm run build-css && npx vite build
find build -type f | sort
```
Expected files present: `build/index.html`, `build/manifest.json`, `build/favicon.ico`, `build/shared/app.css`, `build/shared/font-awesome.css`, `build/shared/foundation.css`, `build/static/js/main.js`, `build/static/css/main.css` (no hash suffix on either, per Task 1's `rollupOptions.output` config).

- [ ] **Step 3: Verify relative-path hrefs**

```bash
cat build/index.html
```
Expected: every `href`/`src` is `./`-relative (e.g. `href="./manifest.json"`, `src="./static/js/main.js"`) — no leading `/`. This is the literal requirement for working from a GH Pages project subpath.

- [ ] **Step 4: Verify the build works from a subpath, not just domain root**

This is the real test — simulate GH Pages' project-subpath hosting locally:
```bash
mkdir -p /tmp/subpath-test/mentalmodeler-js
cp -r build/* /tmp/subpath-test/mentalmodeler-js/
cd /tmp/subpath-test && python3 -m http.server 8123
```
Open `http://localhost:8123/mentalmodeler-js/` in a browser. Confirm:
- Page loads with no 404s in the Network tab for `manifest.json`, `favicon.ico`, `shared/*.css`, `static/js/main.js`, `static/css/main.css`.
- The app renders identically to Task 1's dev-server check (Controls + Map visible, no console errors).
- `http://localhost:8123/mentalmodeler-js/?demo` loads the Fire model — confirms the extensionless `.mmp` import survives production minification, not just dev.

Stop the server (`Ctrl-C`) when done; `/tmp/subpath-test` can be deleted afterward.

- [ ] **Step 5: Commit**

No code changes in this task — if Steps 1-4 all pass, there's nothing to commit. If any step required a fix to `vite.config.js`, amend Task 1's commit review or add a new commit:
```bash
git add vite.config.js
git commit -m "Fix Vite build output to match GH Pages subpath hosting"
```
(Only run this if you actually changed something — otherwise skip.)

---

### Task 3: Swap test runner (Jest → Vitest)

**Files:**
- Modify: `package.json`

**Interfaces:**
- Consumes: `vite.config.js`'s `test` block from Task 1 (`environment: 'jsdom'`, `globals: true`).
- Produces: `npm test` running Vitest instead of Jest, with `src/App.test.js` unchanged and reproducing the same pre-existing single failure as before (parity, not a fix).

- [ ] **Step 1: Add Vitest + jsdom to `devDependencies`**

```json
"jsdom": "^30.1.2",
"vitest": "^5.0.3"
```

- [ ] **Step 2: Update the test script**

Change:
```json
"test-js": "react-scripts test --env=jsdom"
```
to:
```json
"test-js": "vitest"
```
(Bare `vitest`, like bare `react-scripts test`, watches by default. For a single CI run, the equivalent of the old `CI=true npx react-scripts test --env=jsdom` is now `npx vitest run`.)

- [ ] **Step 3: Install**

Run: `npm install`

- [ ] **Step 4: Run the test suite once (non-watch) and confirm parity**

Run: `npx vitest run`
Expected: **1 failed, 1 total** — `src/App.test.js`'s `renders without crashing` test fails with the same pre-existing `Connect(Map)` / `Connect(Controls)` render error seen before this migration (a React 16 + jsdom incompatibility unrelated to the bundler). If it instead fails with a *different* error (e.g. a module resolution or JSX-transform error), that's a regression introduced by this migration — stop and fix it before continuing; do not paper over it.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json
git commit -m "Replace Jest test runner (react-scripts test) with Vitest"
```

---

### Task 4: Confirm the Dependabot alert reduction

**Files:**
- None — verification only.

**Interfaces:**
- Consumes: the fully migrated `package.json`/`package-lock.json` from Tasks 1-3.
- Produces: a documented before/after alert count, confirming the react-scripts-rooted alerts are actually gone (not just assumed gone).

- [ ] **Step 1: Confirm react-scripts is fully gone**

```bash
npm ls react-scripts
```
Expected: `npm error` — "react-scripts" not found in the tree (not a warning about version mismatch, an actual absence).

- [ ] **Step 2: Re-run the full audit and compare against the pre-migration baseline (173 vulnerabilities, from this session's earlier `npm audit fix`)**

```bash
npm audit --json | python3 -c "
import json,sys
d=json.load(sys.stdin)
print(d.get('metadata',{}).get('vulnerabilities'))
"
```
Expected: a large drop from the pre-migration `{'low': 7, 'moderate': 77, 'high': 43, 'critical': 46, 'total': 173}`. Do not assume it's zero — Vite's own dependency tree (esbuild, rollup) and the untouched `gh-pages`/`node-less-chokidar`/`npm-run-all` devDependencies can still carry their own alerts. Record whatever the actual new total is.

- [ ] **Step 3: Attribute any remaining alerts**

```bash
npm audit --json | python3 -c "
import json,sys
d=json.load(sys.stdin)
for name,v in d['vulnerabilities'].items():
    print(v['severity'], name, v.get('fixAvailable'))
" | sort
```
For anything remaining at `high`/`critical`, check `npm ls <package-name>` to see what currently pulls it in. If it's a leftover from `gh-pages`/`node-less-chokidar`/`npm-run-all` (pre-existing, unrelated to this migration), note it as a known follow-up — do not attempt to fix it as part of this task; that's a separate, unscoped piece of work.

- [ ] **Step 4: Commit**

Nothing to commit (verification only) unless Step 3 surfaced something you fixed — if so, follow the same commit pattern as the other tasks.

---

### Task 5: Cross-repo integration smoke test

**Files:**
- Copies files into `mentalmodeler-suite/public/libs/conceptmap/` and `mentalmodeler-scenario/libs/conceptmap/` working trees — **do not commit in either of those repos as part of this task.**

**Interfaces:**
- Consumes: `build/static/js/main.js`, `build/static/css/main.css` from Task 2.
- Produces: visual confirmation that `mentalmodeler-suite` and `mentalmodeler-scenario` both still work with the Vite-built bundle, using the exact vendoring steps from `mentalmodeler-suite/docs/mentalmodeler-js-deploy-and-vendoring.md`.

- [ ] **Step 1: Re-vendor into `mentalmodeler-suite`**

```bash
cp /Users/jonathan/Workspace/jonathanelbom/mentalmodeler/mentalmodeler-js/build/static/js/main.js \
   /Users/jonathan/Workspace/jonathanelbom/mentalmodeler/mentalmodeler-suite/public/libs/conceptmap/static/js/main.js
cp /Users/jonathan/Workspace/jonathanelbom/mentalmodeler/mentalmodeler-js/build/static/css/main.css \
   /Users/jonathan/Workspace/jonathanelbom/mentalmodeler/mentalmodeler-suite/public/libs/conceptmap/static/css/main.css
```

Note the filename is now unhashed (`main.css`, not `main.<hash>.css`) — update the `<link>` href in `mentalmodeler-suite/index.html` to match:
```html
<link href="/libs/conceptmap/static/css/main.css" rel="stylesheet" />
```
This is the exact pain point the vendoring doc flags as a "DX gap" (hand-editing a hashed filename on every update) — this migration removes it going forward, but this one edit is still needed now since the href is currently pointing at the old hashed name.

- [ ] **Step 2: Smoke-test `mentalmodeler-suite`**

Run `mentalmodeler-suite`'s own dev server per its CLAUDE.md, open it in a browser, and confirm:
- The concept map widget renders inside `ConceptMap.jsx`'s mount point (exercises `render()`).
- Loading an existing model into it works (exercises `load()`).
- Saving/exporting works (exercises `save()` via `redux/actions/models.js`).
- If reachable without triggering a real print dialog, confirm `services/print.js`'s call to `screenshot()` doesn't throw in the console (it will still log the known pre-existing "html2canvas is not defined" error — that's unrelated and pre-existing, not a regression from this migration).

- [ ] **Step 3: Re-vendor into `mentalmodeler-scenario` and smoke-test**

```bash
cp /Users/jonathan/Workspace/jonathanelbom/mentalmodeler/mentalmodeler-js/build/static/js/main.js \
   /Users/jonathan/Workspace/jonathanelbom/mentalmodeler/mentalmodeler-scenario/libs/conceptmap/js/main.js
cp /Users/jonathan/Workspace/jonathanelbom/mentalmodeler/mentalmodeler-js/build/static/css/main.css \
   /Users/jonathan/Workspace/jonathanelbom/mentalmodeler/mentalmodeler-scenario/libs/conceptmap/css/main.css
```
(No href edit needed here — `mentalmodeler-scenario/index.html`'s `?gitmm` loader already references the unhashed `libs/conceptmap/js/main.js` / `libs/conceptmap/css/main.css` paths directly.)

Run `mentalmodeler-scenario` per its own CLAUDE.md, open it with `?gitmm` in the URL, and confirm the concept map editor loads and renders inside the existing tab-based workspace with no console errors.

- [ ] **Step 4: Stop — do not commit in either sibling repo**

If Steps 2-3 pass, leave the working-tree changes in `mentalmodeler-suite` and `mentalmodeler-scenario` as uncommitted local verification. Report back to decide separately, in each of those repos' own context, whether/when to commit the re-vendored bundle and the href fix. This plan's own commits are scoped to `mentalmodeler-js` only.

---

### Task 6: Update `mentalmodeler-js/CLAUDE.md`

**Files:**
- Modify: `mentalmodeler-js/CLAUDE.md`

**Interfaces:**
- Consumes: the final script names and config files from Tasks 1-3.
- Produces: accurate repo documentation — no behavioral change.

- [ ] **Step 1: Update the Commands section**

Replace the `## Commands` section's references to `react-scripts`/CRA/Jest with the Vite/Vitest equivalents: `npm start` still builds CSS once then runs the Less watcher and dev server in parallel, but the dev server is now `vite` (port 3000, unchanged) instead of `react-scripts start`; `npm run build` now runs `vite build` instead of `react-scripts build`, still followed by nothing else (the old CRA→`docs/` copy step is already gone per this session's earlier `gh-pages` switch, unrelated to this plan); `npm test` now runs Vitest (watch mode by default, same as before) instead of CRA's bundled Jest, with `npx vitest run` as the single-run/CI equivalent of the old `CI=true npx react-scripts test --env=jsdom`.

- [ ] **Step 2: Update the "What this is" paragraph**

Remove "It is a Create React App 1.x project (`react-scripts@1.1.5`, React 16...)" and replace with "It is a Vite + React 16 project — React 16, Redux 4, react-redux 5 — old class-component/connect-based patterns throughout, no hooks. The bundler was migrated from CRA/`react-scripts` to Vite in October 2026; see `docs/superpowers/plans/2026-10-06-vite-migration.md` for why and how."

- [ ] **Step 3: Commit**

```bash
git add CLAUDE.md
git commit -m "Update CLAUDE.md for Vite migration"
```

---

## Self-Review

**Spec coverage:** Every constraint in Global Constraints maps to a task — widget contract (Task 1 Step 6, Task 5), Less pipeline untouched (no task modifies it, by design), GH Pages subpath basing (Task 2), `npm run deploy` output location (Task 1's `outDir: 'build'`, re-verified implicitly by Task 2), pinned versions (Task 1/3 Steps 1), runtime deps unchanged (no task touches them), pre-existing test failure carried forward not fixed (Task 3 Step 4 explicitly checks for same failure, not a fix), no cross-repo commits (Task 5 Step 4).

**Placeholder scan:** No "TBD"/"handle edge cases"/"similar to Task N" — every step has literal file contents or literal commands with stated expected output.

**Type consistency:** `window.MentalModelerConceptMap`'s shape (`render`, `load`, `save`, `screenshot`) is referenced identically in Task 1 Step 6, the Global Constraints, and Task 5 Step 2. Build output paths (`build/static/js/main.js`, `build/static/css/main.css`) are referenced identically in Task 1's `vite.config.js`, Task 2's verification, and Task 5's copy commands.

**Review Focus:** All five items have an owning task as listed above — no gaps found.

---

Plan complete and saved to `docs/superpowers/plans/2026-10-06-vite-migration.md`. Please review the plan. Which execution approach would you prefer?

- **Subagent-driven** — A fresh subagent implements each task and a fresh reviewer checks it before the next one starts, then a whole-branch review at the end. Most thorough; costs a fresh context per task and per review.
- **Native** — I implement every task myself in this session, then one fresh reviewer checks the whole branch at the end. Cheapest and fastest; no independent review until the end.

For this plan I recommend **Native**, because the six tasks are mostly sequential config/verification work on one small repo (no parallelizable subsystems, no task where an independent per-task reviewer catches something a single whole-branch review at the end wouldn't) — the real risk here is empirical (does the subpath test actually pass, does the browser actually render) rather than design risk a second reviewer's opinion would catch mid-stream. Does the plan capture what you want, and which approach should we use?
