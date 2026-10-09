# Dual Build Outputs (ES module + IIFE embed) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `mentalmodeler-js` build an importable ES-module package (`dist/mentalmodeler-js.es.js`) and a stable-filename IIFE embed (`dist/embed/main.js`) from one source, add a `showLoadSaveButtons` render option, and delete the runtime "standalone" concept (the GH Pages demo becomes a thin embed consumer).

**Architecture:** Split today's `src/index.js` into a side-effect-free `src/api.js` (store, `render/load/save/screenshot`), a `src/lib.js` ES entry (named exports only) and a `src/embed.js` IIFE entry (re-exports + assigns `window.MentalModelerConceptMap`). One `vite.config.js` switches on `mode` (`lib` / `embed`). The GH Pages site and the local dev harness are plain HTML pages that call `render()` exactly like a third-party embed.

**Tech Stack:** Vite 8 library mode (Rollup `formats`), Vitest 5 + jsdom, React 16 bundled *inside* the output (not externalized), Less pipeline untouched.

**Spec:** `docs/superpowers/specs/2026-10-08-bundling-and-embedding-design.md` (Sections 1–3 and the Testing items 2–3). Section 4 / Testing item 1 (`-suite` integration) is **not** in this plan — see "Scope decision" below.

**Prerequisite:** `docs/superpowers/plans/2026-10-06-vite-migration.md` Tasks 1–4 and 6 are executed and merged into this branch (Vite dev server, `vite.config.js`, Vitest, `npm test` working). Its Task 5 (re-vendoring the CRA-shaped `build/` into `-suite`/`-scenario`) is a parity check that this plan's output supersedes; run it only if you want a pre-layer-2 baseline.

## Scope decision: layers 2 and 3 are separate plans

This plan is layer 2 (`-js` only). Layer 3 (`-suite` integration) gets its own plan, written **after** this one executes, in `-suite`'s `docs/superpowers/plans/`. Reasons: (a) it lives in a different repo with its own review/commit rules; (b) it needs the real `dist/` output to be written against, and Task 6 below leaves open questions it must answer (shared CSS, `html2canvas`); (c) the two layers are independently revertible, as the spec notes.

## Global Constraints

- Public API signatures (verbatim from spec): `render(container, options)`, `load(model)`, `save()`, `screenshot()`. `window.MentalModelerConceptMap = {render, load, save, screenshot}` must still be assigned by the **embed** build.
- `render(container, { showLoadSaveButtons: true })` — default `true`.
- Output paths (verbatim): `dist/mentalmodeler-js.es.js`, `dist/mentalmodeler-js.css`, `dist/embed/main.js`, `dist/embed/main.css`. Embed filenames are stable and unhashed.
- `package.json` gains `"name": "mentalmodeler-js"`, `"main"` and `"module"` = `dist/mentalmodeler-js.es.js`, `"files": ["dist"]`, and a bumped `version`. Stays `file:`-linkable; **no npm publish**.
- No runtime `standalone` concept may remain in shipped output: no `?standalone` param, no hostname check, no `NODE_ENV === 'development'` branch.
- Do not change React/Redux versions (React 16 stays bundled and sealed). Do not touch the Less→CSS pipeline or committed `.css`/`.css.map` files.
- `npm run deploy` (`gh-pages -d build`) keeps working; the site is served from the subpath `https://mentalmodeler.github.io/mentalmodeler-js/`, so every URL in the site must be `./`-relative.
- Do not edit or commit in `mentalmodeler-suite` or `mentalmodeler-scenario`.

## Review Focus

1. **`process.env.NODE_ENV` not replaced in library mode** — bundled React/Redux read it at load; unreplaced, the IIFE throws `process is not defined` in any browser embed. Pinned by Task 3's browser/grep check on both outputs.
2. **`save()` returns `undefined`** — the exact failure mode of the production bug phase 1 fixed. The public `save()` must return `{js, json}` always and never download. Pinned by Task 1's test.
3. **Two instances/stores on one page** — loading `embed/main.js` twice, or an embed host calling `render()` into a second container, must not throw (the module store is a singleton; second `render` re-targets it). Pinned by Task 1's test.
4. **`load()` with garbage** (empty string, invalid JSON, `null`) — must log and leave the existing model intact, not blank the map. Pinned by Task 1's test.
5. **GH Pages wrapper served from a subpath** — absolute URLs in the wrapper (`/embed/main.js`, `/models/fire.mmp.json`) 404 on the real site while working on `localhost`. Pinned by Task 5's nested-subpath serve test.

---

## File Structure

- Create `src/api.js` — store + `render/load/save/screenshot` + internal `downloadModel`. No window side effects, no data imports.
- Create `src/lib.js` — ES entry: `export { render, load, save, screenshot } from './api'` plus `import './index.css'`.
- Create `src/embed.js` — IIFE entry: imports `./lib`, assigns `window.MentalModelerConceptMap`.
- Create `src/api.test.js` — Vitest tests for the API.
- Create `dev/index.html` — unshipped dev harness.
- Create `site/index.html` — GH Pages thin wrapper (source; copied into `build/`).
- Create `scripts/build-site.mjs` — assembles `build/` for `gh-pages`.
- Modify `src/App.js`, `src/components/Map/Map.js` — replace `standalone` + window-global usage with props.
- Modify `vite.config.js`, `package.json`.
- Delete `src/index.js` (replaced by the three files above), root `index.html` created by the migration plan, `src/registerServiceWorker.js` references if unused.
- Leave `src/data/*.mmp.js` and `src/models/*.mmp.json` in place; they are no longer imported by any entry (the site fetches `fire.mmp.json`).

---

### Task 1: Extract a side-effect-free `src/api.js` (TDD)

**Files:**
- Create: `src/api.js`, `src/api.test.js`
- Modify: `src/App.js`, `src/components/Map/Map.js`

**Interfaces:**
- Produces (`src/api.js`), all named exports:
  - `render(target = '#root', options = {})` — `target` is an `Element` or selector string; `options.showLoadSaveButtons` defaults `true`. Re-render into a different container is allowed.
  - `load(json: string | object): void` — never throws; on invalid input logs via `console.error` and leaves the store untouched.
  - `save(): {js, json} | undefined` — **always returns** `util.exportData(store.getState())`; never downloads.
  - `downloadModel(): void` — internal-use export (used by the SAVE button) that writes `mmp.json` via `file-saver`.
  - `screenshot(): Promise<canvas> | undefined` — body unchanged from current `src/index.js`.
- Produces (`App` props): `showLoadSaveButtons: boolean`, `onLoad(json)`, `onDownload()`; `Map` receives the same three props.

- [ ] **Step 1: Write the failing tests** — `src/api.test.js`

```js
import { render, load, save } from './api';

const model = {
    info: { id: 'x', name: 'T', author: 'a', description: '' },
    groupNames: { 0: 'g0' },
    concepts: [
        { id: 'a', name: 'A', x: 10, y: 10, group: 0, relationships: [{ id: 'b', influence: 0.5, confidence: 1 }] },
        { id: 'b', name: 'B', x: 100, y: 100, group: 0, relationships: [] },
    ],
};

function mount(options) {
    const el = document.createElement('div');
    document.body.appendChild(el);
    render(el, options);
    return el;
}

describe('api', () => {
    it('save() returns the loaded model, never undefined', () => {
        load(model);
        const out = save();
        expect(out).toBeDefined();
        expect(out.json).toBeDefined();
        expect(JSON.stringify(out.json)).toContain('"A"');
    });

    it('load() accepts a JSON string', () => {
        load(JSON.stringify(model));
        expect(JSON.stringify(save().json)).toContain('"B"');
    });

    it('load() with garbage leaves the existing model intact', () => {
        load(model);
        const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
        load('not json');
        load(null);
        load('');
        spy.mockRestore();
        expect(JSON.stringify(save().json)).toContain('"A"');
    });

    it('shows LOAD/SAVE buttons by default', () => {
        const el = mount();
        expect(el.querySelector('.map-controls__save')).not.toBeNull();
        expect(el.querySelector('.map-controls__load')).not.toBeNull();
    });

    it('hides LOAD/SAVE buttons when showLoadSaveButtons is false', () => {
        const el = mount({ showLoadSaveButtons: false });
        expect(el.querySelector('.map-controls__save')).toBeNull();
        expect(el.querySelector('.map-controls__load')).toBeNull();
    });

    it('render() into a second container does not throw', () => {
        mount();
        expect(() => mount({ showLoadSaveButtons: false })).not.toThrow();
    });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run src/api.test.js`
Expected: FAIL — `Failed to resolve import "./api"`.

- [ ] **Step 3: Create `src/api.js`**

Move (do not rewrite) `load`, `loadModel`, `writeLocalFile`, `screenshot` and the `createStore` call from `src/index.js`, then:

```js
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { saveAs } from 'file-saver';

import allReducers from './reducers';
import App from './App';
import util from './utils/util';
import { modelLoad } from './actions/index';

const store = createStore(allReducers, {});

// ...loadModel, load, writeLocalFile, screenshot copied verbatim from src/index.js...

export function save() {
    try {
        return util.exportData(store.getState());
    } catch (e) {
        console.error('ERROR - ConceptMap > save, e:', e);
    }
}

export function downloadModel() {
    const data = save();
    if (data) {
        writeLocalFile({ content: data.json, name: 'mmp.json', type: 'json' });
    }
}

export function render(target = '#root', { showLoadSaveButtons = true } = {}) {
    try {
        const elem = typeof target === 'string' ? document.querySelector(target) : target;
        ReactDOM.render(
            <Provider store={store}>
                <App
                    showLoadSaveButtons={showLoadSaveButtons}
                    onLoad={load}
                    onDownload={downloadModel}
                />
            </Provider>,
            elem
        );
    } catch (e) {
        console.error('ERROR - ConceptMap > render, e:', e);
    }
}

export { load, screenshot };
```

Note `render` no longer special-cases `HTMLDocument` or `Element` via `instanceof` (cross-realm/iframe embeds fail `instanceof`); non-string targets are passed through.

- [ ] **Step 4: Thread props through `App.js` and `Map.js`**

`src/App.js`: replace `<Map standalone={this.props.standalone}/>` with
```jsx
<Map
    showLoadSaveButtons={this.props.showLoadSaveButtons}
    onLoad={this.props.onLoad}
    onDownload={this.props.onDownload}
/>
```
`src/components/Map/Map.js`:
- line ~310: `{this.props.standalone &&` → `{this.props.showLoadSaveButtons &&`
- `onFileReaderLoadEnd` body → `this.props.onLoad && this.props.onLoad(e.target.result);`
- `onClickSave` body → `this.props.onDownload && this.props.onDownload();`
- Remove both `window.MentalModelerConceptMap` references. Add `showLoadSaveButtons`, `onLoad`, `onDownload` to Map's `propTypes` if it declares any.

- [ ] **Step 5: Run to verify pass**

Run: `npx vitest run src/api.test.js`
Expected: PASS (6 tests). If rendering throws a `Connect(Map)` error here, the cause is something other than the missing `Provider` that the old `App.test.js` also lacked — stop and diagnose (systematic-debugging) before proceeding; do not delete the render tests.

- [ ] **Step 6: Commit**

```bash
git add src/api.js src/api.test.js src/App.js src/components/Map/Map.js
git commit -m "Extract side-effect-free api module; replace standalone prop with showLoadSaveButtons"
```

---

### Task 2: Entries (`lib.js`, `embed.js`) and removal of `src/index.js`

**Files:**
- Create: `src/lib.js`, `src/embed.js`
- Delete: `src/index.js`, root `index.html` (from migration plan)
- Modify: `src/App.test.js` (see Step 3)

**Interfaces:**
- Consumes: `render, load, save, screenshot` from `src/api.js`.
- Produces: `src/lib.js` (named exports, imports CSS); `src/embed.js` (assigns `window.MentalModelerConceptMap`, also `export`s nothing).

- [ ] **Step 1: Create the entries**

`src/lib.js`:
```js
import './index.css';

export { render, load, save, screenshot } from './api';
```
`src/embed.js`:
```js
import { render, load, save, screenshot } from './lib';

if (typeof window !== 'undefined') {
    window.MentalModelerConceptMap = { render, load, save, screenshot };
}
```
The `Element.prototype.matches` polyfill from the old `index.js` moves to the top of `src/lib.js` verbatim (before the `export`).

- [ ] **Step 2: Delete old entry and the migration plan's root `index.html`**

```bash
git rm src/index.js index.html
```
(`npm start` is broken until Task 4 supplies `dev/index.html`; that's expected.)

- [ ] **Step 3: Fix `App.test.js` to use a Provider-less-safe call or leave it**

The pre-existing test renders `<App />` with no store. Replace its body with a call through the public API, which supplies the Provider:
```js
import { render } from './api';

it('renders without crashing', () => {
    const div = document.createElement('div');
    render(div);
});
```
This intentionally changes the migration plan's "carry the known failure forward" constraint: the failure was almost certainly the missing `Provider`, and Task 1 now covers rendering properly. If the new test still fails, revert this step and note it.

- [ ] **Step 4: Run all tests**

Run: `npx vitest run`
Expected: all pass.

- [ ] **Step 5: Commit**

```bash
git add -A src index.html
git commit -m "Split entry into lib.js (ES) and embed.js (IIFE); remove standalone index.js"
```

---

### Task 3: Library-mode build config (ES + IIFE)

**Files:**
- Modify: `vite.config.js`, `package.json`

**Interfaces:**
- Consumes: `src/lib.js`, `src/embed.js`.
- Produces: `npm run build-js` yielding `dist/mentalmodeler-js.es.js`, `dist/mentalmodeler-js.css`, `dist/embed/main.js`, `dist/embed/main.css`.

- [ ] **Step 1: Replace `vite.config.js`**

```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

export default defineConfig(({ mode }) => {
    const embed = mode === 'embed';
    return {
        plugins: [react()],
        base: './',
        server: { port: 3000 },
        // Library mode does NOT replace process.env.NODE_ENV; bundled React/Redux read it.
        define: { 'process.env.NODE_ENV': JSON.stringify('production') },
        build: {
            outDir: embed ? 'dist/embed' : 'dist',
            emptyOutDir: !embed, // embed runs second and must not wipe the ES build
            sourcemap: true,
            lib: {
                entry: resolve(__dirname, embed ? 'src/embed.js' : 'src/lib.js'),
                name: 'MentalModelerConceptMapBundle',
                formats: [embed ? 'iife' : 'es'],
                fileName: () => (embed ? 'main.js' : 'mentalmodeler-js.es.js'),
                cssFileName: embed ? 'main' : 'mentalmodeler-js',
            },
        },
        test: { environment: 'jsdom', globals: true },
    };
});
```
Caveat: `define` of `NODE_ENV` also applies to `vite` dev server and Vitest; React then runs its production build in dev. If that hurts dev warnings, narrow with `...(mode === 'lib' || embed ? {define: ...} : {})`. Do that if Step 3 shows dev warnings vanish.

- [ ] **Step 2: Update `package.json`**

```json
"name": "mentalmodeler-js",
"version": "0.2.0",
"private": true,
"main": "dist/mentalmodeler-js.es.js",
"module": "dist/mentalmodeler-js.es.js",
"files": ["dist"],
"scripts": {
  "build-js": "vite build --mode lib && vite build --mode embed",
  "start-js": "vite --open /dev/index.html"
}
```
Keep `"private": true` (blocks accidental publish; `file:` links ignore it). Remove `"homepage"`.

- [ ] **Step 3: Build and verify outputs**

```bash
npm run build-css && npm run build-js
ls dist dist/embed
grep -c "process.env" dist/mentalmodeler-js.es.js dist/embed/main.js
```
Expected: the four named files exist (`mentalmodeler-js.es.js`, `mentalmodeler-js.css`, `embed/main.js`, `embed/main.css`) plus `.map` files; grep counts are `0` for both. If the CSS has a different name (e.g. `style.css`), fix `cssFileName`; if `cssFileName` is unsupported by the installed Vite, rename in a `closeBundle` plugin hook instead — the filenames above are the contract.

- [ ] **Step 4: Verify the ES build is importable and the IIFE sets the global**

```bash
node --input-type=module -e "
import { JSDOM } from 'jsdom';
const dom = new JSDOM('<div id=root></div>', {runScripts:'outside-only'});
dom.window.eval(require('fs').readFileSync('dist/embed/main.js','utf8'));
console.log(Object.keys(dom.window.MentalModelerConceptMap));
"
```
Expected: `[ 'render', 'load', 'save', 'screenshot' ]`. (If `require` is unavailable in ESM, use `readFileSync` from `node:fs`.)

- [ ] **Step 5: Commit** (`dist/` is gitignored — add `/dist` to `.gitignore` in this commit)

```bash
echo "/dist" >> .gitignore
git add vite.config.js package.json package-lock.json .gitignore
git commit -m "Add library-mode ES and IIFE embed builds"
```

---

### Task 4: Dev harness (`dev/index.html`)

**Files:**
- Create: `dev/index.html`

**Interfaces:**
- Consumes: `src/lib.js` source via Vite dev server.
- Produces: `npm start` → full-page editor at `http://localhost:3000/dev/index.html`, `?demo` loads Fire.

- [ ] **Step 1: Create `dev/index.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="stylesheet" href="/shared/font-awesome.css" />
    <link rel="stylesheet" href="/shared/foundation.css" />
    <link rel="stylesheet" href="/shared/app.css" />
    <title>Mental Modeler (dev)</title>
  </head>
  <body>
    <div id="root" style="height: 100vh; width: 100vw"></div>
    <script type="module">
      import { render, load } from '/src/lib.js';
      import fire from '/src/models/fire.mmp.json';
      render('#root');
      if (new URLSearchParams(location.search).has('demo')) load(fire);
    </script>
  </body>
</html>
```
(Absolute `/` paths are fine here: dev-only, never shipped.)

- [ ] **Step 2: Verify in a browser**

Run `npm start`; open `/dev/index.html` and `/dev/index.html?demo`. Confirm Controls + Map render, no console errors, `?demo` shows Fire concepts, LOAD/SAVE buttons present, SAVE downloads `mmp.json`, editing a concept then HMR-saving a source file keeps the app alive.

- [ ] **Step 3: Commit**

```bash
git add dev/index.html
git commit -m "Add unshipped dev harness that consumes the library entry"
```

---

### Task 5: GH Pages thin wrapper and `build-site`

**Files:**
- Create: `site/index.html`, `scripts/build-site.mjs`
- Modify: `package.json` (`build` script)

**Interfaces:**
- Consumes: `dist/embed/main.{js,css}`, `public/**`, `src/models/fire.mmp.json`.
- Produces: `build/` containing `index.html`, `embed/main.js`, `embed/main.css`, `models/fire.mmp.json`, `shared/*`, `manifest.json`, `favicon.ico` — the `gh-pages -d build` payload.

- [ ] **Step 1: Create `site/index.html`** (every URL `./`-relative)

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="manifest" href="./manifest.json" />
    <link rel="shortcut icon" href="./favicon.ico" />
    <link rel="stylesheet" href="./shared/font-awesome.css" />
    <link rel="stylesheet" href="./shared/foundation.css" />
    <link rel="stylesheet" href="./shared/app.css" />
    <link rel="stylesheet" href="./embed/main.css" />
    <title>Mental Modeler</title>
  </head>
  <body>
    <div id="root" style="height: 100vh; width: 100vw"></div>
    <script src="./embed/main.js"></script>
    <script>
      window.MentalModelerConceptMap.render('#root');
      if (new URLSearchParams(location.search).has('demo')) {
        fetch('./models/fire.mmp.json')
          .then(function (r) { return r.json(); })
          .then(function (m) { window.MentalModelerConceptMap.load(m); })
          .catch(function (e) { console.error('demo load failed', e); });
      }
    </script>
  </body>
</html>
```

- [ ] **Step 2: Create `scripts/build-site.mjs`**

```js
import { cpSync, rmSync, mkdirSync, existsSync } from 'node:fs';

if (!existsSync('dist/embed/main.js')) {
    console.error('dist/embed/main.js missing — run `npm run build-js` first');
    process.exit(1);
}
rmSync('build', { recursive: true, force: true });
mkdirSync('build/models', { recursive: true });
cpSync('public', 'build', { recursive: true });
cpSync('site/index.html', 'build/index.html');
cpSync('dist/embed', 'build/embed', { recursive: true });
cpSync('src/models/fire.mmp.json', 'build/models/fire.mmp.json');
```
The `.mjs` extension keeps this ES-module script working without adding `"type": "module"` repo-wide.

- [ ] **Step 3: Wire scripts**

```json
"build": "run-s -n build-css build-js build-site",
"build-site": "node scripts/build-site.mjs",
"predeploy": "npm run build"
```

- [ ] **Step 4: Verify from a nested subpath (real GH Pages shape)**

```bash
npm run build
rm -rf /tmp/subpath-test && mkdir -p /tmp/subpath-test/mentalmodeler-js
cp -r build/* /tmp/subpath-test/mentalmodeler-js/
cd /tmp/subpath-test && python3 -m http.server 8123
```
Open `http://localhost:8123/mentalmodeler-js/` and `...?demo`. Confirm: no 404s in Network; editor fills the window; `?demo` loads Fire; LOAD opens a file picker and loads a saved `mmp.json`; SAVE downloads `mmp.json`. `grep -nE '(href|src)="/' build/index.html` must print nothing.

- [ ] **Step 5: Commit**

```bash
git add site scripts package.json
git commit -m "Convert GH Pages site to a thin embed-API wrapper"
```

---

### Task 6: Embed smoke test, docs, and hand-off notes for layer 3

**Files:**
- No committed files besides `CLAUDE.md`; the smoke page lives in the scratchpad.
- Modify: `CLAUDE.md`

- [ ] **Step 1: Throwaway embed page** (scratchpad, not committed)

A static HTML file that loads `dist/embed/main.css` and `dist/embed/main.js` with plain tags, creates two containers, and calls `render('#a', { showLoadSaveButtons: true })` and `render('#b', { showLoadSaveButtons: false })`, then `load()`s the Fire JSON and logs `save().json`. Serve over HTTP and confirm: container A has LOAD/SAVE, container B doesn't (the shared store means both show the same model — expected), no console errors, `save()` logs data.

- [ ] **Step 2: Answer these for the layer-3 plan and record them in the final report** (do not fix here)
  - `public/shared/{app,foundation,font-awesome}.css` (287 KB) is loaded by `<link>` tags in the shipped pages, **not** imported by the JS/CSS bundle. `-suite` today links `/libs/conceptmap/shared/app.css` and will lose it when `public/libs/conceptmap/` is deleted. Determine which of those rules the widget actually needs; layer 3 must either import them or fold the needed part into `dist/mentalmodeler-js.css`.
  - `screenshot()` requires a global `window.html2canvas`; `html2canvas` is in `dependencies` but never imported. Decide whether the ES build should import it (layer 3 / `-suite` print flow depends on it).
  - `docs/mentalmodeler-js-deploy-and-vendoring.md` (in `-suite`) claims a path-aware hostname check is in `-js`'s `src/index.js`; this branch's `src/index.js` had hostname-only. Confirm which branch holds the fix — moot after this plan, but relevant if `-suite` is rebuilt against an older `-js`.

- [ ] **Step 3: Update `CLAUDE.md`**

Replace the "Dual build targets" section: no more standalone mode; document `src/api.js` / `lib.js` / `embed.js`, the `showLoadSaveButtons` option, `save()` always returning data (SAVE button uses `downloadModel`), the `dist/` layout, `dev/index.html`, `site/index.html` + `build-site`, and the manual rebuild discipline (`npm run build` in `-js`, then `npm install` in `-suite`).

- [ ] **Step 4: Final verification and commit**

Run: `npx vitest run && npm run build` — expected: tests pass, build produces `dist/` and `build/`.
```bash
git add CLAUDE.md
git commit -m "Document dual-build architecture"
```

---

## Self-Review

**Spec coverage:** Section 1 (two outputs, one config) → Task 3. Section 2 (GH Pages wrapper, standalone deleted, dev harness) → Tasks 1–2 (deletion), 4 (dev), 5 (wrapper, `?demo` as page JS). Section 3 (`showLoadSaveButtons`) → Task 1. Section 4 `package.json` fields → Task 3; `-suite` call-site changes and deletions → deliberately deferred to the layer-3 plan. Testing items 2 (embed smoke) → Task 6; 3 (wrapper) → Task 5; item 1 → layer 3.

**Spec gaps resolved here (flag for user):** (1) SAVE-button behaviour without `standalone` (spec silent) → `downloadModel`. (2) Spec says the migration plan creates `dev/index.html`; it does not → Task 4. (3) `process.env.NODE_ENV` in lib mode → Task 3. (4) Output dir: spec's `dist/` vs migration plan's `build/` → `dist/` for library output, `build/` kept only as the assembled GH Pages payload so `gh-pages -d build` is unchanged. (5) `Map.js` internally depended on `window.MentalModelerConceptMap` → props.

**Placeholder scan:** Task 1 Step 3 says "copied verbatim from `src/index.js`" for four functions rather than re-printing ~90 lines; the source is in the repo at the current commit, and the move is mechanical.

**Type consistency:** `showLoadSaveButtons`, `onLoad`, `onDownload` are named identically in Task 1's tests, `render`, `App`, `Map`; `downloadModel` is used in `api.js` and the `onDownload` wiring only.
