---
name: go-codemap
description: Generate a polished multi-page "code map" documentation website (design, layout, structure, dependencies, and flows) for a Go repository, like a well-written wiki deep-dive into the codebase. Output is a self-contained static site under ./codemap with an index.html, shared CSS/JS, hand-authored SVG diagrams, and cross-linked subsystem pages. Use this skill whenever the user asks to "create a code map", "codemap", "document this codebase as a website/wiki", "generate an architecture guide/site", "produce a code walkthrough site", or similar for a Go project.
---

# go-codemap

Produces a static documentation website that explains a Go codebase the way a good engineering wiki
would. It leads with the mental model, then architecture, then a page per subsystem with diagrams and
flows, grounded in real files and symbols. The output is a folder of interlinked HTML pages plus a
reusable design system (CSS and JS) and hand-authored SVG diagrams. There is no build step. It opens
as `file://`.

This skill ships the finished design system so the effort goes into understanding the code and
writing accurate content, not into CSS. Read `references/authoring-guide.md` before writing pages. It
is the component catalog, the diagram cookbook, and the voice and tone rules.

## Step 0: Scope the request

Confirm two things. Ask only if unclear. Otherwise use the defaults and state them.
- Target repo. Default: the current working directory. It must be a Go module with a `go.mod`.
- Output directory. Default: `./codemap`. Create it with an `assets/` subdirectory.

Honor any extra emphasis from the user, such as "focus on the storage layer" or "keep it short,"
when choosing the page set and depth in Step 3.

## Step 1: Survey the repository

Build a factual skeleton before delegating. Gather these in parallel.
- `go.mod` for the module path, Go version, and notable direct dependencies. The dependencies reveal
  the architecture: web framework, database driver, message bus, CLI library, TUI library, gRPC.
- The package and directory tree, and Go LOC per directory, to find the weight centers:
  `find . -name '*.go' -not -path './vendor/*' | sed 's|/[^/]*$||' | sort | uniq -c | sort -rn`
- Entry points: `main` packages with `func main`, and for a library the top-level exported API.
- `README.md` and `docs/` for the project's own framing and vocabulary. Reuse its terms.
- The test framework and how tests run. Note it. Do not run tests.
- Provenance for the overview's staleness callout. Capture the commit the map is built against and
  the generation date: `git rev-parse --short HEAD`, `git rev-parse --abbrev-ref HEAD`, and
  `git status --porcelain` to detect an uncommitted working tree, plus the current date from `date
  +%F`. If the repo is not a git checkout, record the date only.

Record what the project is (CLI, service, library, worker, TUI), its three to six major subsystems,
and the data shapes that recur. This determines the page set.

## Step 2: Decide the page set

Every codemap has three anchor pages.
- Overview (`index.html`): what the project is, the one-paragraph mental model, a system-at-a-glance
  diagram, the tech stack, card links into the rest, and a provenance callout that records when the
  map was generated and the commit it reflects.
- Architecture (`architecture.html`): package layering, the key seams and interfaces, how the pieces
  compose, and how one binary or library serves its modes.
- Reference and Map (`reference.html`): the lookup layer. The CLI or API surface, a source-file map
  by package, key types each linked to the page that explains them, and a glossary.

Between them, add one page per major subsystem or cross-cutting concern. Choose adaptively.
- CLI or TUI app: the command tree, the run or loop, the UI layer.
- Service or API: the HTTP or gRPC surface, the request lifecycle, middleware and auth.
- Any project: data model and persistence, concurrency model, background jobs, config, plugin or
  extension points, wire protocols, external integrations.

Aim for six to ten pages total. Use fewer for a small repo. Do not pad. Give each page a two-digit
reading index and slot it into a group for `nav.js`.

## Step 3: Understand the subsystems with parallel agents

Delegate deep reading so it is fast and thorough. Spawn one `Explore` or `general-purpose` agent per
subsystem in a single message so they run concurrently. Give each the same reporting contract so the
results are consistent:

> Explore `<paths>` in the Go repo at `<root>`. I'm writing a documentation page about `<subsystem>`.
> Read the relevant files thoroughly and report a structured summary covering: (1) key files and
> their responsibilities with `path:line`; (2) core types and structs and their roles; (3) the main
> flows step by step; (4) key exported functions with signatures worth citing; (5) notable design
> decisions, invariants, and safety or concurrency mechanisms, with the reasons; (6) anything
> reserved, unused, or aspirational. Prose plus bullets with `file:line` references. Do not write any
> files.

While the agents run, scaffold the assets in Step 4. When they return, verify surprising or
load-bearing claims against the source before writing them. A subagent summary is a strong draft, not
ground truth. Verify exact identifiers, defaults, file paths, and any security or data-durability
claim.

## Step 4: Scaffold the site assets

1. Copy the design system verbatim into the output. Do not rewrite it.
   - `assets/styles.css` from this skill's `assets/styles.css`
   - `assets/app.js` from this skill's `assets/app.js`
   Use `cp` from this skill directory. `styles.css` and `app.js` are generic and complete.
2. Author the single site-specific JS file `assets/nav.js` per the format in
   `references/authoring-guide.md`. It sets `window.CODEMAP_TITLE`, `CODEMAP_LOGO`, and
   `CODEMAP_PAGES`.

## Step 5: Author the pages

Use `references/page-template.html` as the skeleton and the component catalog in
`references/authoring-guide.md` for every element: callouts, tables, `.kv`, `.steps`, cards, tags,
the terminal mock, and the SVG diagram patterns.

Follow the voice and tone rules in `references/authoring-guide.md` for all prose. In short: plain,
direct North American English; present tense and active voice; no "you" or "we"; short sentences, one
idea each; no filler; no emojis; no em dashes.

Content rules:
- On the overview page, place a provenance callout near the top that records the generation date and
  the commit hash the map was built against, so readers can spot stale content. Use the values
  captured in Step 1. See the provenance callout in `references/authoring-guide.md`.
- Open each subsystem page with a `◆ Where it lives` note callout that names the package and key
  files.
- Include at least one hand-authored SVG diagram per subsystem page for its primary flow, plus a
  system-at-a-glance diagram on the overview and a layered-architecture diagram on the architecture
  page. Diagrams must use CSS-variable colors so dark mode works.
- Ground claims in real symbols (`<code>Type</code>`, `<code>Func</code>`) and files (`path/x.go`).
  Explain the reasons behind non-obvious design. Flag invariants with a `⚠` safety callout.
- Cross-link pages heavily. End each page with a `▸` tip callout pointing to the natural next read.
- Match the project's own vocabulary from its README and docs.
- Be honest about reserved, unused, or aspirational code. Label it. Do not oversell it.

Every content page ends with `<script src="assets/nav.js"></script>` then
`<script src="assets/app.js"></script>`.

## Step 6: Verify

- Links: every `href="*.html"` resolves to a file that exists, and every filename in `nav.js` has a
  matching page. Grep for hrefs. Filenames may contain digits. Diff against the file list.
- Assets present: `assets/styles.css`, `assets/app.js`, and `assets/nav.js` all exist. Every page
  references both scripts and the stylesheet.
- Accuracy spot-check: re-open the source for a few load-bearing claims, such as defaults, exact
  identifiers, and security or durability statements, and confirm they are right.
- Voice check: no em dashes, no emojis, no "you" or "we" in the page prose.
- Provenance: the overview has a callout with the generation date and, for a git repo, the commit
  hash and branch. It flags an uncommitted working tree when one was present.
- Diagram fit: no `svg-label` or `svg-sub` text is wider than its box. Estimate width at about `8px`
  per character for labels and `6.6px` for sub text, and confirm each line fits within its `<rect>`
  `width - 14`. Widen the box (symmetrically about its center, adjusting only the arrows on the moved
  edges) or shorten the text where it does not.
- Render sanity: the sidebar lists all pages in order, prev/next chains through them, and the theme
  toggle is present.

Then tell the user where it is (`./codemap/index.html`), list the pages produced, and note any areas
flagged as uncertain or left shallow.

## Notes

- Keep it dependency-free and offline. No CDNs, no fonts to fetch, no JS frameworks. Everything works
  from `file://`.
- The design system is intentionally fixed so every codemap looks consistent. Extend it by adding new
  component classes to a page's inline `<style>` only when truly needed. Prefer the catalog.
- This skill is tuned for Go, but the process and design system are language-agnostic. If pointed at
  a non-Go repo, adapt the Step 1 commands and proceed.
- This skill produces a standalone self-contained HTML site. To instead emit native Hugo pages that
  render inside a hugo-theme-relearn site (menu, search, theme variants), use the go-codemap-hugo
  skill. The survey, page-set, exploration, and grounding steps are shared; only the output differs.
