---
name: go-codemap-hugo
description: Generate a "code map" documentation deep-dive for a Go repository as native Hugo pages for a hugo-theme-relearn site, so it renders inside the site theme with the left menu, search, breadcrumbs, and light and dark variants. Emits markdown under content/ with front matter, relearn notice and badge shortcodes, native code and tables, hand-authored SVG diagrams, and a small custom CSS file. Use this skill when the user asks to add a code map, codemap, architecture guide, or code walkthrough to a Hugo site or relearn docs site, or to document a Go codebase as Hugo content. For a standalone self-contained HTML site instead, use the go-codemap skill.
---

# go-codemap-hugo

Produces a code map that lives inside a Hugo site built with hugo-theme-relearn. The output is native
content: markdown pages under `content/`, one small CSS file under `static/`, and a head partial that
loads it. The pages render through the theme, so they inherit the left menu, search, breadcrumbs, and
the site's light, dark, and auto variants with no bespoke shell.

This is the Hugo sibling of the `go-codemap` skill. The survey, page-set, exploration, and grounding
work are the same. The difference is the output format: relearn markdown instead of a standalone HTML
site. Read `references/relearn-components.md` before authoring. It is the component catalog, the SVG
diagram cookbook, and the voice and tone rules.

## Step 0: Scope the request

Confirm these. Ask only if unclear. Otherwise use the defaults and state them.
- Target repo. Default: the current working directory. It must be a Go module with a `go.mod`.
- Hugo site root. The directory that holds `config.toml` or `hugo.toml` and a `content/` folder.
- Section path. Default: `content/codemap/`. This becomes a top-level menu category.
- Theme check. Confirm the site uses hugo-theme-relearn and that `unsafe = true` is set under
  `[markup.goldmark.renderer]`. Raw HTML and inline SVG need it. If it is off, note that the diagrams
  and custom blocks will not render until it is enabled.

## Step 1: Survey the repository

Build a factual skeleton before delegating. Gather these in parallel.
- `go.mod` for the module path, Go version, and notable direct dependencies. The dependencies reveal
  the architecture.
- The package and directory tree, and Go LOC per directory, to find the weight centers:
  `find . -name '*.go' -not -path './vendor/*' | sed 's|/[^/]*$||' | sort | uniq -c | sort -rn`
- Entry points: `main` packages with `func main`, and for a library the top-level exported API.
- `README.md` and `docs/` for the project's own framing and vocabulary. Reuse its terms.
- Provenance for the overview snapshot notice: `git rev-parse --short HEAD`,
  `git rev-parse --abbrev-ref HEAD`, `git status --porcelain` to detect an uncommitted tree, and the
  date from `date +%F`. If the repo is not a git checkout, record the date only.

Record what the project is (CLI, service, library, worker, TUI), its three to six major subsystems,
and the data shapes that recur. This determines the page set.

## Step 2: Decide the page set

Every codemap has three anchor pages.
- Overview: the section landing page `_index.md`. What the project is, the one-paragraph mental model,
  a system-at-a-glance diagram, the provenance snapshot notice, and a `{{% children %}}` card list.
- Architecture: package layering, the key seams and interfaces, and how the pieces compose.
- Reference and Map: the CLI or API surface, a source-file map by package, key types linked to the
  page that explains them, and a glossary.

Between them, add one page per major subsystem or cross-cutting concern, chosen adaptively for the
project. Aim for six to ten pages total. Use fewer for a small repo. Do not pad. Give each page a
`weight` that sets its menu order.

## Step 3: Understand the subsystems with parallel agents

Delegate deep reading. Spawn one `Explore` or `general-purpose` agent per subsystem in a single
message so they run concurrently. Use one reporting contract:

> Explore `<paths>` in the Go repo at `<root>`. I'm writing a documentation page about `<subsystem>`.
> Read the relevant files thoroughly and report a structured summary covering: (1) key files and their
> responsibilities with `path:line`; (2) core types and structs and their roles; (3) the main flows
> step by step; (4) key exported functions with signatures worth citing; (5) notable design decisions,
> invariants, and safety or concurrency mechanisms, with the reasons; (6) anything reserved, unused, or
> aspirational. Prose plus bullets with `file:line` references. Do not write any files.

While the agents run, scaffold in Step 4. When they return, verify surprising or load-bearing claims
against the source before writing them. A subagent summary is a strong draft, not ground truth.

## Step 4: Scaffold the site integration

From this skill directory:
1. Copy `assets/codemap.css` to the site's `static/css/codemap.css`.
2. Install the head partial that loads it. If `layouts/partials/custom-header.html` does not exist,
   copy this skill's `assets/custom-header.html` to it. If it already exists, append the single
   `<link>` line from that file so existing custom head content is preserved.
3. Create the section folder for the chosen path and its `_index.md`.

The custom CSS is namespaced `cm-` and derives its colors from relearn's own variables, so it themes
correctly and does not affect other pages.

## Step 5: Author the pages

Use `references/page-template.md` for the section landing page and subsystem pages, and
`references/relearn-components.md` for every element. Follow the voice and tone rules there for all
prose: plain, direct North American English; present tense and active voice; no "you" or "we"; short
sentences; no filler; no emojis; no em dashes.

Content rules:
- Render callouts with relearn `notice` shortcodes, code with fenced blocks, tables with native
  markdown, and tags with `badge` shortcodes. Reserve the `cm-` custom blocks for the definition list,
  steps, concept card grid, terminal mock, and diagrams.
- Open each subsystem page with a `note` notice titled "Where it lives" that names the package and key
  files.
- Include at least one hand-authored SVG diagram per subsystem page for its primary flow, plus a
  system-at-a-glance diagram on the overview and a layered-architecture diagram on the architecture
  page. Diagrams use `cm-` CSS variables so they follow the theme variant.
- Keep every raw HTML block contiguous, with no blank lines inside it. This covers the `<figure>`
  SVG blocks and the `cm-` custom blocks (`<dl>`, `<ol>`, `<div>`). Goldmark ends a raw HTML block at
  the first blank line, then parses the indented remainder as a Markdown code block and HTML-escapes
  it, so a blank line between an SVG's `<defs>` and its shapes renders half the diagram as visible
  `<code>` markup. This still builds with no error and the opening `<svg>` tag still looks fine, so it
  passes a naive grep for `<svg>`; only the shapes after the blank line break. Separate logical groups
  with a comment line or indentation, never a blank line.
- On the overview `_index.md`, place the provenance snapshot notice near the top and list child pages
  with `{{% children description="true" %}}`.
- Ground claims in real symbols and files. Explain the reasons behind non-obvious design. Flag
  invariants with a `warning` notice titled "Load-bearing decision".
- Cross-link pages with `{{% relref "slug" %}}`. End each page with a `tip` notice pointing to the
  natural next read.
- Match the project's own vocabulary from its README and docs. Be honest about reserved, unused, or
  aspirational code.

## Step 6: Verify

- Build check: run `hugo --quiet` or `hugo --renderToMemory` in the site root if the binary is
  available. It must complete with no template or shortcode errors. This is a build, not a test.
- Shortcodes: every `relref` target resolves to a page in the section. Every `notice`, `badge`, and
  `children` shortcode is closed correctly.
- Rendering prerequisites: `unsafe = true` is set, so the inline SVG and `cm-` blocks render rather
  than escape.
- No raw HTML leaked into a code block: after building, grep the rendered output for an escaped shape.
  `grep -rlE '&lt;(rect|text|line|path|svg)' public/<section>` must return nothing. A hit means a blank
  line broke a `<figure>` block; remove blank lines inside raw HTML blocks (see the rule in Step 5).
  Do not rely on grepping for `<svg>` alone, since the opening tag survives the break.
- Assets: `static/css/codemap.css` exists and `layouts/partials/custom-header.html` links it. Load a
  page and confirm the diagrams and cards are styled, which proves the CSS is injected.
- Menu and order: the section appears as a menu category and the pages sort by `weight`.
- Provenance: the overview has the snapshot notice with the date and, for a git repo, the commit and
  branch.
- Voice check: no em dashes, no emojis, no "you" or "we" in the page prose.

Then tell the user the section path, list the pages produced, and note the one-time site changes made
(`static/css/codemap.css` and `layouts/partials/custom-header.html`). Note anything left shallow.

## Notes

- This skill targets hugo-theme-relearn specifically. Its notice and badge shortcodes and CSS variables
  do not transfer to other themes. For a portable, self-contained HTML site, use `go-codemap`.
- There is no URL collision to manage. The pages are native content at the section path; no static
  microsite competes for the same URL.
- Deploying is just committing the new content, the one CSS file, and the head partial. The site's
  normal build publishes them.
