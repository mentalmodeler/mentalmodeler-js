# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Mental Modeler is a React + Redux app for building "fuzzy cognitive map" style concept diagrams: users add concepts (nodes), draw directed relationships (influences) between them with a confidence/influence value, and the map is editable on an SVG/CSS canvas. It is a Vite + React 16 project (React 16, Redux 4, react-redux 5) — old class-component/connect-based patterns throughout, no hooks. The bundler was migrated from CRA/`react-scripts` to Vite in October 2026; see `docs/superpowers/plans/2026-10-06-vite-migration.md`. Because the codebase writes JSX in `.js` files, `vite.config.js` carries a `jsx-in-js` plugin and an `optimizeDeps` module-type override — keep them.

## Commands

- `npm start` — builds CSS once, then runs the Less watcher and the Vite dev server in parallel (dev server on :3000).
- `npm run build` — compiles CSS, then `vite build` into `build/` (stable unhashed `build/static/js/main.js` and `build/static/css/main.css`, `./`-relative asset paths for GH Pages subpath hosting).
- `npm run deploy` — builds, then `gh-pages -d build` pushes to the `gh-pages` branch. This publishes the site — do not run it without the user's intent to deploy.
- `npm test` — rebuilds CSS then runs Vitest (jsdom, globals) in watch mode. Single run: `npx vitest run`.
- `npm run build-css` / `npm run watch-css` — compile `.less` files under `src/` to co-located `.css`/`.css.map` files via `node-less-chokidar`. These compiled files are committed — after editing any `.less` file, regenerate its `.css` counterpart before committing.

There is effectively one test file (`src/App.test.js`), which currently fails because it renders `<App />` without a redux `<Provider>`. There is no lint script.

## Architecture

### Two build outputs, no "standalone" mode

There is no runtime standalone/host detection. `src/api.js` is a side-effect-free module (store + `render(target, {showLoadSaveButtons = true})`, `load(json)`, `save()`, `screenshot()`, plus `downloadModel()` used by the SAVE button). Two thin entries wrap it, and `vite.config.js` builds each by `--mode`:

- `src/lib.js` → `dist/mentalmodeler-js.es.js` + `dist/mentalmodeler-js.css` (`vite build --mode lib`): named exports, imported by `mentalmodeler-suite` via `"mentalmodeler-js": "file:../mentalmodeler-js"` (`main`/`module` in `package.json`, `files: ["dist"]`, no npm publish).
- `src/embed.js` → `dist/embed/main.js` + `dist/embed/main.css` (`vite build --mode embed`, IIFE, stable unhashed names): assigns `window.MentalModelerConceptMap = {render, load, save, screenshot}` for plain `<script>` embeds.

Both bundle React 16 inside (not externalized). `save()` **always returns** `{js, json}` and never downloads (a download there is what silently broke `-suite` in production); the in-widget SAVE button calls `downloadModel()` instead. LOAD/SAVE buttons are shown by default and hidden with `showLoadSaveButtons: false` (`-suite` does this). `Map` gets `showLoadSaveButtons`/`onLoad`/`onDownload` as props via `App`; no component reads `window.MentalModelerConceptMap`.

- `npm run build` = `build-css` + `build-js` (both outputs) + `build-site` (`scripts/build-site.mjs` assembles `build/` for GH Pages from `site/index.html`, `dist/embed`, `public/`, and `src/models/fire.mmp.json`). `site/index.html` is a thin consumer of the embed build; `?demo` fetches the Fire model and calls `load()`.
- `npm start` serves `dev/index.html` (unshipped) which imports `src/lib.js` source directly (hot reload) and calls `render()` the same way embeds do; `?demo` loads Fire.
- Rebuild discipline for `-suite`: `npm run build` here, then `npm install` there. Deliberately manual (matches `mm-modules`).
- `html2canvas` is a `-js` dependency. `src/lib.js` assigns the bundled copy to `window.html2canvas` unless the host already defined one; the camera button and `screenshot()` read that global. **`mentalmodeler-suite` relies on this global** (its `print.js` rasterizes its own Metrics/Scenario panels with it), so don't remove the assignment without updating `-suite`.
- Base styles: the widget's inherited page-level styles (font, color, line-height, form-control font inheritance, textarea alignment) are scoped under `.MentalMapper` in `src/App.less` using `:where()` (type-selector specificity, so widget class rules still win). Embeds therefore don't need `public/shared/*.css`; the site and dev pages still load them. Verified: bare page computes identical styles to the old `app.css`-loaded look. Note `App.less` still has a global `* { box-sizing: border-box }` that leaks into host pages.

### State shape and data flow (Redux, no middleware)

- `src/reducers/index.js` combines four reducers: `concepts` (the real state — `collection` of concept objects, `selectedConcept`, `selectedRelationship`, `tempRelationship` while drag-drawing a new connection, `tempTarget`, `viewFilter`), `groupNames` (index 0–5 → display name), `info`, `scenarios` (latter two are stubs/no-ops today).
- A top-level `allReducers` wrapper intercepts `MODEL_LOAD` and replaces the entire state tree with `action.state` before delegating to `combineReducers` — this is how `load()`/`modelLoad()` swaps in a whole new model.
- Concepts and relationships are **not normalized into separate collections**: each concept in `concepts.collection` carries its own `relationships: [{id: <influenceeId>, confidence, influence, notes, inDualRelationship, isFirstInDualRelationship}]`. A relationship is identified by the `(influencerId, influenceeId)` pair, i.e. `(concept.id, relationship.id)`.
- "Dual relationships" (A→B and B→A both exist) are flagged on both sides (`inDualRelationship`/`isFirstInDualRelationship`) purely so the UI can offset the two line's value indicators (`util.getOffset`) instead of overlapping them. `util.makesDualRelationship` and the dual-relationship bookkeeping in `reducers/index.js` (`addRelationshipToConcept`, `removeRelationshipFromConcept`) and `util.initData` have to stay in sync whenever relationship add/remove/import logic changes — this is a frequent source of subtle bugs (see the `1babb7e` commit, which reworked `initData`'s dual-relationship pass to avoid mutating objects in place while iterating).
- Actions are plain action creators in `src/actions/index.js` (no thunks); action types are inline string literals switched on in the reducer (no separate constants file).

### Model import/export format

- `util.initData(data)` converts a raw `.mmp.json`-style model (`{concepts, groupNames, info, scenarios}`) into the Redux `concepts` slice shape, coercing `x`/`y`/`influence` to numbers and computing dual-relationship flags.
- `util.exportData(state)` does the inverse, stripping transient UI fields back down to the serializable `{concepts, groupNames}` shape used by `save()`/file export.
- Example models live in `src/models/*.mmp.json`. Only `fire.mmp.json` is used (by `dev/index.html` and `scripts/build-site.mjs` for `?demo`).

### Component tree

`App` → `Controls` (left-hand panel: add concept, filters, group names, selected-item editor — see `src/components/Controls/*`) + `Map` (the canvas: `Concepts`/`Concept` render draggable nodes, `Relationships`/`Relationship` render SVG connector lines with inline value/confidence indicators, `RelationshipValueDisplay` renders the little influence/confidence badge on a line). Each component directory has a co-located `.less`/`.css`/`.css.map` trio rather than CSS-in-JS or CSS modules.

### Styling

Plain Less compiled by `node-less-chokidar` (not the webpack Less loader) directly against `src`, mirroring each `.less` file to a `.css` + `.css.map` next to it. `App.css`/`shared.css` at `src/` root hold app-wide styles beyond per-component ones. Always re-run `npm run build-css` (or keep `watch-css` running) after editing `.less`, since the generated `.css` is what's actually imported by the JS components and is what's committed.
