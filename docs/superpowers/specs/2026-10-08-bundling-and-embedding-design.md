# mentalmodeler-js: packaging & dual-channel distribution — design

**Status:** Approved by user review (2026-10-08), ready for implementation planning.

## Context

`mentalmodeler-js` is the React/Redux concept-map editor consumed by both
`mentalmodeler-scenario` (legacy) and `mentalmodeler-suite` (the active port
target), plus at least one known third-party embed (a CodePen demo built by
the project owner) via `window.MentalModelerConceptMap = {render, load, save,
screenshot}`.

Today `-suite` consumes `-js` by vendoring a manually-copied build into
`public/libs/conceptmap/`, loaded via plain `<script>`/`<link>` tags. A
2026-10-08 interim fix (`mentalmodeler-suite/scripts/sync-conceptmap.js`)
automated the copy/rename step and fixed a production bug where `-js`'s
hostname-only `standalone` detection false-positived once `-suite` was also
deployed under `mentalmodeler.github.io` — see
`mentalmodeler-suite/docs/mentalmodeler-js-deploy-and-vendoring.md` for that
incident's full writeup. That fix was deliberately kept small; this spec is
the deferred "real" rework it pointed to.

`-js` is also still on Create React App (`react-scripts@1.1.5`, React 16). A
separate, already-written plan —
[`../plans/2026-10-06-vite-migration.md`](../plans/2026-10-06-vite-migration.md)
— covers the CRA→Vite swap, Vitest, and stable unhashed build filenames for
`-js`'s own standalone app. That plan is unexecuted but complete; this spec
builds on top of it rather than re-covering it.

## Goal

Replace static-copy vendoring with a real package `-suite` can `import`
directly (same pattern `mm-modules` already uses), while preserving
`window.MentalModelerConceptMap` as a stable public embed API for third
parties — as two distribution channels built from one source, not two
separately-maintained copies of the concept-map editor.

## Non-goals

- **React/Redux version upgrade.** `-js` keeps its current React
  16/sealed-instance isolation. Packaging it better doesn't require touching
  the runtime version; a version bump is deliberately deferred to a later
  phase 3, decided separately.
- **`-js`'s own dependency/security audit**, beyond whatever the Vite
  migration plan does incidentally.
- **Publishing to a real npm registry.** Stays a `file:` link, matching
  `mm-modules`'s existing convention for `-suite`.
- **Fixing the `file:`-link CI/GitHub-Actions limitation** that `mm-modules`
  already has (a sibling-repo-checkout dependency that would break if
  `-suite`'s build ever moved into a runner without `-js` checked out
  alongside it). Accepted, not solved here.
- **Deleting `-js`'s vestigial `docs/` folder** from its pre-`gh-pages`-branch
  deploy setup. Unrelated cleanup.

**Resolved as a side effect, not deferred:** the previously-accepted gap
where third-party embeds (e.g. the CodePen demo) needed a manual hash update
on every `-js` release — noted as "known and accepted for now" in
`mentalmodeler-suite/docs/mentalmodeler-js-deploy-and-vendoring.md` — goes
away once this spec ships, since Section 1's embed build uses stable
unhashed filenames. Listed here so it isn't mistaken for a dropped item.

## Design

### 1. Two build outputs from one Vite config, not three

`-js`'s `vite.config.js` (created by the Vite-migration plan) gains
library-mode build config producing two targets via Rollup's
`build.lib.formats`, alongside the existing standalone-app build:

- **`dist/mentalmodeler-js.es.js`** (+ `dist/mentalmodeler-js.css`) — ES
  module build. Named exports: `render(container, options)`, `load(model)`,
  `save()`, `screenshot()`. This is what `-suite` imports.
- **`dist/embed/main.js`** + **`dist/embed/main.css`** — IIFE global build,
  same entry point, `output.name` set so it attaches to
  `window.MentalModelerConceptMap` exactly as today. Stable, unhashed
  filenames (continuing the convention the Vite-migration plan already sets
  for the standalone build) — a `<script src=".../embed/main.js">` embed
  never needs a hash update after a rebuild.

Both targets build from the same source entry. The `standalone`/path-aware
hostname-detection branch (phase 1's fix, and the mechanism that caused the
production bug it fixed) is **deleted entirely** — see Section 2.

### 2. The GitHub Pages demo becomes an embed consumer, not a special app

Today, `-js`'s own GitHub Pages site self-renders because its runtime
detects `standalone === true` via a path-aware hostname check. That
detection branch exists only to answer "is this the GH Pages demo site," and
it's the exact class of bug that broke `-suite` in production once two apps
shared a hostname.

Instead: `-js`'s GitHub Pages site becomes a thin `index.html` + a few lines
of page-level JS that loads `dist/embed/main.js`/`main.css` and calls
`window.MentalModelerConceptMap.render()` — i.e., it becomes a real,
first-party example of the public embed API, structurally identical to the
CodePen demo a third party already built. The `?demo` fire-model-loading
behavior is replicated as page-level JS calling `load()` with the fire model
URL, not a bundler-level flag.

There is no more runtime "standalone" concept in `-js`'s shipped output.
Local dev needs an equivalent harness for the same reason `npm start` today
self-renders full-page without a host page: a small, **unshipped**
`dev/index.html` (not part of `dist/`) that Vite's dev server serves
directly against source, calling `render()` the same way the GH Pages
wrapper and third-party embeds do. This file is dev tooling, created as part
of the Vite-migration plan's dev-server-parity task — this spec notes the
requirement; the migration plan owns the implementation.

Net effect: the dev harness, the GH Pages demo, and a third-party embed are
all the same pattern (script/module + `render()` call), not three different
code paths.

### 3. `render()` gains a `showLoadSaveButtons` option

The concept-map widget's save/load buttons are part of the widget itself
(not standalone-app-only chrome), confirmed during design review. They
become a `render()` option:

```js
render(container, { showLoadSaveButtons: true }); // default: true
```

Default `true` preserves today's behavior for the GH Pages demo and
third-party embeds. `-suite` passes `false`, since it has its own load/save
controls — this also resolves a standing `-suite`-side question about how to
hide those buttons, without a `-suite`-side hack.

### 4. Package shape and `-suite` integration

`mentalmodeler-js/package.json` gains the fields needed to be an importable
package, mirroring `mm-modules`'s existing shape:

```json
{
  "name": "mentalmodeler-js",
  "version": "<bumped>",
  "main": "dist/mentalmodeler-js.es.js",
  "module": "dist/mentalmodeler-js.es.js",
  "files": ["dist"]
}
```

No npm registry publish. `-suite` links it the same way it already links
`mm-modules`: `"mentalmodeler-js": "file:../mentalmodeler-js"` in `-suite`'s
`package.json`, `npm install` to create/refresh the symlink.

**Call-site changes in `-suite`** — mechanical, no logic change, since
function signatures match today's global methods exactly:
- `src/components/ConceptMap/ConceptMap.jsx` — `window.MentalModelerConceptMap.render()/load()` → `import { render, load } from 'mentalmodeler-js'`
- `src/redux/actions/models.js` — `window.MentalModelerConceptMap.save()` → `import { save } from 'mentalmodeler-js'`
- `src/services/print.js` — `window.MentalModelerConceptMap.screenshot()` → `import { screenshot } from 'mentalmodeler-js'`

CSS: `-suite` imports `mentalmodeler-js/dist/mentalmodeler-js.css` explicitly
in its entry (Vite bundles it normally) — no `<link>` tag needed.

**Deleted from `-suite`:** `scripts/sync-conceptmap.js`,
`public/libs/conceptmap/` entirely (including the dated manual-snapshot
folders), `index.html`'s vendored `<link>`/`<script>` tags, and
`.eslintrc.cjs`'s now-dead `scripts/**/*.js` Node-env override.

**Rebuild discipline — deliberately manual, no new tooling.** When `-js`
changes, the workflow is: `npm run build` in `-js`, then `npm install` (or
just re-run, since it's a symlink) in `-suite`. This matches `mm-modules`'s
existing, already-documented convention. No `prepare`-lifecycle automation —
npm's `file:`-dependency script-execution behavior is inconsistent across
npm versions, so this spec doesn't introduce a different convention than the
one already proven for `mm-modules`.

## Testing & verification

Unit/build-level coverage (Vitest against the ESM build's `render`/`load`/
`save`/`screenshot`) is the Vite-migration plan's existing scope, not new
here. New for this phase:

1. **Package-import smoke test, in `-suite`.** After the call-site swap, run
   `-suite`'s real dev server and production build, and click through the
   same flows phase 1's bug broke: switch tabs, switch models, switch
   scenarios, trigger save, trigger print/screenshot. Check that model data
   survives a tab switch — that was the actual failure mode (silent
   `undefined`, not a crash), so a build that merely compiles is not
   sufficient evidence.
2. **Embed-build smoke test.** A throwaway static HTML file (not part of any
   app) loading `dist/embed/main.js`/`main.css` via plain `<script>`/
   `<link>`, same shape as the existing CodePen, calling `render()` with
   `showLoadSaveButtons` both `true` and `false`.
3. **GH Pages thin-wrapper verification.** Build, serve locally, confirm the
   demo renders full-page, `?demo` still loads the fire model, and save/load
   buttons behave — a faithful replacement for today's standalone app, not
   just "loads without erroring."

## Sequencing

1. **Vite migration** (existing plan, unmodified) — CRA→Vite, Vitest, stable
   unhashed standalone-build filenames. Executed first; this spec's work
   depends on the `vite.config.js` it creates.
2. **Dual build outputs** (Sections 1–3 above) — entirely within `-js`: add
   library-mode targets, add `showLoadSaveButtons`, convert the GH Pages
   site to the thin wrapper, delete the standalone-detection branch.
3. **`-suite` integration** (Section 4) — `file:` link, call-site swaps,
   delete the vendoring script and copied assets, verify per the Testing
   section above.

Layers 2 and 3 are independently revertible (2 is `-js`-only, 3 is
`-suite`-only) and should likely be separate implementation plans for that
reason — left to the writing-plans step to decide, not fixed here.
