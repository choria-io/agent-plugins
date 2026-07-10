# Codemap authoring guide

The component catalog and conventions for writing codemap pages. All components are plain HTML
styled by `assets/styles.css` (copied verbatim). There is no build step and no external CDN. The
site must work when opened directly as `file://`.

## Voice and tone

These rules govern all prose in the generated codemap. Follow them exactly.

- Write in plain, direct North American English.
- Use the present tense and active voice. Write "The service resource manages system services," not
  "System services are managed by the service resource."
- Address the reader implicitly. Do not use "you" or "we." State facts and give instructions. Write
  "Specify commands with their full path," not "You should specify commands with their full path."
- Keep sentences short. One idea per sentence.
- Do not editorialize or use filler. Avoid "Note that," "It is important to," and "Simply."
- Do not use emojis.
- Do not use em dashes. Use commas, periods, or semicolons instead.

The only non-alphanumeric glyphs allowed are the fixed marks in the design: the `.co-title` symbols
(`◆ ▸ ⚠ △`), the nav arrows in prev/next, and the `-> <-` and `›` markers in the terminal and
feature-list components. These are structural, not decorative. Do not add others.

## Content approach

- Lead each page with the mental model. Then the mechanics. Then the edge cases.
- Ground every claim in the source. Reference real symbols with `<code>` and real files as
  `path/file.go`. When a design decision is non-obvious, state why it was made that way.
- Prefer short paragraphs and lists over long blocks of text. One idea per paragraph.
- Match the project's own vocabulary from its README and docs.
- Be honest about reserved, unused, or aspirational code. Label it. Do not present intent as
  implemented behavior.

## Page skeleton

Every page follows `page-template.html`: a `.layout > .main > .content` wrapper, an `<h1>`, a
`.lede` paragraph, then `<h2 id="...">` sections. End every page with both scripts in this order:

```html
<script src="assets/nav.js"></script>
<script src="assets/app.js"></script>
```

`nav.js` sets the page list. `app.js` injects the sidebar, mobile topbar, theme toggle, and
prev/next footer. Give every `<h2>` and `<h3>` a stable `id` so cross-page anchors work.

## nav.js (the one generated JS file)

`app.js` is generic and copied verbatim. The only site-specific JS is `assets/nav.js`:

```js
window.CODEMAP_TITLE = "projectname";      // shown in the sidebar brand and mobile bar
window.CODEMAP_LOGO  = "PN";               // 2 letters for the logo tile (optional; derived if omitted)
window.CODEMAP_PAGES = [
  { group: "Start here", items: [
    { n: "00", href: "index.html",       title: "Overview" },
    { n: "01", href: "architecture.html", title: "Architecture" },
  ]},
  { group: "Core", items: [
    { n: "02", href: "subsystem-a.html", title: "Subsystem A" },
    { n: "03", href: "subsystem-b.html", title: "Subsystem B" },
  ]},
  { group: "Reference", items: [
    { n: "09", href: "reference.html",   title: "Reference & Map" },
  ]},
];
```

Keep `n`, the two-digit index, contiguous across groups. It sets the reading order and drives
prev/next. Group labels are short, one or two words.

## Component catalog

### Callouts: orient, warn, highlight
```html
<div class="callout note">   <div class="co-title">◆ Where it lives</div> <p>...</p></div>
<div class="callout tip">    <div class="co-title">▸ Next</div>          <p>...</p></div>
<div class="callout warn">   <div class="co-title">△ Caveat</div>        <p>...</p></div>
<div class="callout safety"> <div class="co-title">⚠ Load-bearing decision</div> <p>...</p></div>
```
Use `note` for orientation, `tip` for pointers and next steps, `warn` for gotchas, `safety` for
invariants that must not be violated, such as security, data-loss, or ordering guarantees.

### Provenance callout: overview page only
Place this near the top of `index.html`, right after the lede, so readers can judge whether the map
is current. Fill the date, short commit hash, and branch from the values captured in Step 1.
```html
<div class="callout note">
  <div class="co-title">◆ Snapshot</div>
  <p>Generated 2026-07-09 against commit <code>a1b2c3d</code> on branch <code>main</code>. Commits
  after this one may make parts of this map stale.</p>
</div>
```
When the working tree had uncommitted changes at generation time, add a sentence: "The working tree
had uncommitted changes when this map was generated, so it may not match any single commit." For a
directory with no git metadata, show only the date and omit the commit line.

### Tables: enumerations, mappings, comparisons
```html
<div class="table-wrap"><table>
  <thead><tr><th>Col</th><th>Col</th></tr></thead>
  <tbody><tr><td>...</td><td>...</td></tr></tbody>
</table></div>
```
Always wrap in `.table-wrap`. It provides the border and horizontal scroll on mobile.

### Definition list (`.kv`): labelled fields, struct members, options
```html
<dl class="kv">
  <dt>FieldName</dt><dd>What it is or does.</dd>
  <dt>OtherField</dt><dd>...</dd>
</dl>
```
Use this for the fields of a struct or the keys of a config block.

### Steps (`.steps`): ordered flows with a bold lead
```html
<ol class="steps">
  <li><b>Do the first thing</b> Details of what happens and which function drives it.</li>
  <li><b>Then this</b> ...</li>
</ol>
```
The circles number themselves. Use for a request flow or a set of setup phases.

### Card grid: landing-page navigation, concept groups
```html
<div class="card-grid">
  <a class="card" href="tools.html">
    <div class="card-ix">01 · TOPIC</div>
    <h4>Short title</h4>
    <p>One-sentence teaser.</p>
  </a>
  <!-- non-link version: <div class="card">...</div> -->
</div>
```

### Code blocks with light syntax coloring
Wrap tokens in spans. The palette works in both themes. Keep snippets short and real.
```html
<pre><code><span class="tok-key">func</span> Foo(x <span class="tok-key">int</span>) <span class="tok-key">error</span> {  <span class="tok-com">// comment</span>
    s := <span class="tok-str">"literal"</span>; n := <span class="tok-num">42</span>
}</code></pre>
```
Token classes: `tok-key` for keywords and types, `tok-str` for strings, `tok-com` for comments,
`tok-num` for numbers and bools, `tok-fn` for function names, `tok-punc` for punctuation. For YAML,
use `tok-key` on keys, `tok-str` on values, `tok-com` on `#` comments. Do not over-highlight. Color
the meaningful tokens only.

### Tags and badges: recurring markers, states
```html
<span class="tag">plain</span>
<span class="tag deny">danger</span> <span class="tag confirm">gated</span>
<span class="tag defer">special</span> <span class="tag ro">read-only</span>
<span class="pill">DEFAULT</span> <span class="pill p2">alt</span>
```
Repurpose the colored variants for whatever domain markers recur in the repo, such as states,
impact levels, or tiers. Define them once in a legend on the reference page.

### Terminal mock: show the tool or app in action
Good on the overview page.
```html
<div class="terminal">
  <div class="tbar"><i class="r"></i><i class="y"></i><i class="g"></i>
    <span style="margin-left:.6rem;color:#6b7688">$ command</span></div>
  <div class="tbody">plain output
<span class="c-tool">-&gt; highlighted</span>  <span class="c-ok">success</span>  <span class="c-warn">warning</span></div>
</div>
```
Classes inside `.tbody`: `c-dim c-accent c-tool c-ok c-warn`. Whitespace is preserved.

### Feature list: scannable bullets with a marker
```html
<ul class="feature-list"><li>Point one.</li><li>Point two.</li></ul>
```

## SVG diagrams

Diagrams are the codemap's signature. Hand-author inline `<svg>`. They are theme-aware because they
reference CSS variables. Wrap each in `<figure class="diagram">` with a `<figcaption>`.

Skeleton:
```html
<figure class="diagram">
  <svg viewBox="0 0 760 260" role="img" aria-label="Describe the diagram">
    <defs>
      <marker id="ah" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto">
        <path d="M0,0 L7,3 L0,6 Z" fill="var(--accent)"/>
      </marker>
    </defs>
    <!-- neutral box -->
    <rect class="svg-box" x="20" y="80" width="150" height="56" rx="8"/>
    <text class="svg-label" x="95" y="104" text-anchor="middle">Title</text>
    <text class="svg-sub"   x="95" y="122" text-anchor="middle">subtitle</text>
    <!-- accent-filled box for emphasis -->
    <rect x="300" y="80" width="150" height="56" rx="8" fill="var(--accent-soft)" stroke="var(--accent)"/>
    <text class="svg-label" x="375" y="108" text-anchor="middle" style="fill:var(--accent)">Core</text>
    <!-- arrow -->
    <line x1="170" y1="108" x2="300" y2="108" stroke="var(--accent)" stroke-width="2" marker-end="url(#ah)"/>
  </svg>
  <figcaption>One sentence explaining what the reader should take away.</figcaption>
</figure>
```

Rules that keep diagrams legible and on-theme:
- Use a `760`-wide `viewBox`. Set the height to fit. The SVG scales to the content column.
- Colors must be CSS variables, never hardcoded hex, so dark mode works: `var(--bg-elev)`,
  `var(--border-strong)`, `var(--accent)`, `var(--accent-2)`, `var(--accent-3)`,
  `var(--accent-soft)`, `var(--accent-2-soft)`, `var(--text)`, `var(--text-faint)`.
- Text uses `class="svg-label"` for titles and `class="svg-sub"` for detail. To recolor a label,
  add `style="fill:var(--accent)"`. Neutral boxes use `class="svg-box"`.
- Size every box to its text. SVG `<text>` does not wrap or shrink to fit; a label wider than its
  `<rect>` spills over both edges. Budget about `8px` per character for a `svg-label` (13px bold) and
  about `6.6px` per character for a `svg-sub` (11px mono), and keep the longest line in a box within
  `width - 14`. If a `text-anchor="middle"` label is too long, widen the box symmetrically about its
  center so the text stays centered and only the arrows touching the moved edges need a new endpoint,
  or shorten the label. Prefer short labels over wide boxes. Two or three words per line reads best.
- Emphasis boxes use `fill:var(--accent-soft)` with `stroke:var(--accent)`, or the `-2` and `-3`
  accents to distinguish subsystems. Decision diamonds use a `<polygon>` with `fill:var(--bg-elev)`.
- Give each arrow direction its own marker fill when using multiple accent colors. Define `ah`,
  `ah2`, and so on in `<defs>`.
- Use one diagram per major flow. Good subjects are a layered architecture, a request or loop flow
  with a decision diamond and a dashed loop-back edge, a data pipeline, a state machine, and a
  topology.

## What makes a codemap good

1. A reader builds a correct mental model without opening the code. Every claim is still traceable
   to a file or symbol.
2. Every non-trivial flow has a diagram. Text explains; diagrams make it stick.
3. The non-obvious is called out: invariants, safety decisions, the reasons behind a design, and
   gotchas. Anyone can list files. The value is the reasoning.
4. Structure is consistent: the same page shape, the same components, predictable navigation.
5. The content is honest. Reserved, unused, or aspirational code is labelled as such.
