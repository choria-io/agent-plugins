# Relearn component catalog

How to render each codemap element as native hugo-theme-relearn markdown. Prefer theme shortcodes so
the pages inherit the site's styling, search, and light and dark variants. Fall back to the `cm-`
custom classes (styled by `assets/codemap.css`) only for elements the theme has no equivalent for.

Raw HTML and inline SVG require `unsafe = true` under `[markup.goldmark.renderer]` in the site config.
choria-cm.dev already sets this. Confirm it before authoring, or the SVG and `cm-` blocks render as
escaped text.

## Voice and tone

Identical to the standalone skill. All prose is plain, direct North American English; present tense
and active voice; no "you" or "we"; short sentences, one idea each; no filler; no emojis; no em
dashes. Use commas, periods, or semicolons in place of em dashes.

## Front matter

Use TOML front matter to match the site convention.
```toml
+++
title = "Architecture"
weight = 20
description = "Package layering and the seams that make the engine composable."
+++
```
`weight` sets the order in the left menu. `description` feeds the card text produced by
`{{% children %}}` on the overview. The section landing page is `_index.md`; child pages are plain
`.md` files in the same folder.

## Callouts: relearn `notice`

Use the markdown form `{{% ... %}}` so the body renders as markdown.
```md
{{% notice style="note" title="Where it lives" %}}
`path/to/pkg`: one line on what it owns. Key files: `a.go`, `b.go`.
{{% /notice %}}
```
Map the four codemap intents to relearn styles:

| Intent | style | Title example |
|--------|-------|---------------|
| Orientation | `note` | Where it lives |
| Pointer or next step | `tip` | Next |
| Gotcha | `warning` | Caveat |
| Load-bearing invariant | `warning` | Load-bearing decision |

## Code blocks and tables: native markdown

Use fenced code blocks with a language tag. The theme highlights them with its own chroma style and
they follow light and dark automatically. Do not hand-color tokens.
````md
```go
func Foo(x int) error { // comment
    return nil
}
```
````
Use native markdown tables. The theme styles them.
```md
| Tag | Effect |
|-----|--------|
| `ai:deny` | Never exposed. |
```

## Tags and badges: relearn `badge`

```md
{{% badge style="note" %}}ai:deny{{% /badge %}}
{{% badge style="warning" %}}ai:confirm{{% /badge %}}
{{% badge %}}impact:ro{{% /badge %}}
```

## Cross-links: relearn `relref`

Link between codemap pages by file name, without extensions or absolute paths.
```md
Continue to [the agent loop]({{% relref "agent-loop" %}}).
```

## Buttons: relearn `button`

Use for a prominent launch or cross-link when a plain link is too quiet.
```md
{{% button href="{{% relref "reference" %}}" %}}Open the reference{{% /button %}}
```

## Overview card navigation: relearn `children`

On the section landing page (`_index.md`), list the child pages as cards instead of hand-building a
grid. It reads each child's `description`.
```md
{{% children description="true" %}}
```
Use the `cm-card-grid` custom block only for concept groups that are not the section's own pages.

## Custom blocks (cm- classes)

These have no theme equivalent. They are styled by `assets/codemap.css`. Write them as raw HTML in
the markdown body.

Never put a blank line inside one of these raw HTML blocks. Goldmark ends a raw HTML block at the
first blank line and parses the indented remainder as a Markdown code block, HTML-escaping it. Keep
each `<dl>`, `<ol>`, `<div>`, or `<figure>` contiguous from its opening tag to its closing tag.

Definition list for struct fields or config keys:
```html
<dl class="cm-kv">
  <dt>FieldName</dt><dd>What it is or does.</dd>
  <dt>OtherField</dt><dd>...</dd>
</dl>
```

Numbered steps:
```html
<ol class="cm-steps">
  <li><b>Do the first thing</b> Detail and the function that drives it.</li>
  <li><b>Then this</b> ...</li>
</ol>
```

Concept card grid:
```html
<div class="cm-card-grid">
  <a class="cm-card" href="...">
    <div class="cm-ix">01 · TOPIC</div>
    <h4>Short title</h4>
    <p>One-sentence teaser.</p>
  </a>
</div>
```

Terminal mock (overview only):
```html
<div class="cm-terminal">
  <div class="cm-tbar"><i class="r"></i><i class="y"></i><i class="g"></i></div>
  <div class="cm-tbody">plain output
<span class="c-tool">-&gt; highlighted</span>  <span class="c-ok">ok</span>  <span class="c-warn">warning</span></div>
</div>
```
Inside `cm-tbody`: `c-dim c-accent c-tool c-ok c-warn`. Whitespace is preserved.

## SVG diagrams

The signature element. Hand-author inline SVG inside a `cm-diagram` figure. Reference the `cm-` color
variables so the diagram follows the active theme variant.
```html
<figure class="cm-diagram">
  <svg viewBox="0 0 760 260" role="img" aria-label="Describe the diagram">
    <defs>
      <marker id="ah" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto">
        <path d="M0,0 L7,3 L0,6 Z" fill="var(--cm-accent)"/>
      </marker>
    </defs>
    <rect class="cm-svg-box" x="20" y="80" width="150" height="56" rx="8"/>
    <text class="cm-svg-label" x="95" y="104" text-anchor="middle">Title</text>
    <text class="cm-svg-sub"   x="95" y="122" text-anchor="middle">subtitle</text>
    <rect x="300" y="80" width="150" height="56" rx="8"
          fill="color-mix(in srgb, var(--cm-accent) 12%, transparent)" stroke="var(--cm-accent)"/>
    <text class="cm-svg-label" x="375" y="108" text-anchor="middle" style="fill:var(--cm-accent)">Core</text>
    <line x1="170" y1="108" x2="300" y2="108" stroke="var(--cm-accent)" stroke-width="2" marker-end="url(#ah)"/>
  </svg>
  <figcaption>One sentence on what the reader should take away.</figcaption>
</figure>
```

Rules:
- No blank lines anywhere between `<figure>` and `</figure>`. A blank line ends the raw HTML block,
  and every indented SVG element after it renders as escaped `<code>` text instead of a shape. This is
  the most common way these diagrams break: it still builds cleanly and the opening `<svg>` tag looks
  right, so only the shapes below the blank line are lost. Group elements with comments, not blank
  lines, and verify with `grep -rlE '&lt;(rect|text|line|path)' public/<section>` returning nothing.
- Use a `760`-wide `viewBox`. The SVG scales to the content column.
- Colors are `cm-` variables, never hardcoded hex: `var(--cm-accent)` for the primary accent,
  `var(--cm-accent2)` for a second subsystem color, `var(--cm-accent3)` for danger, `var(--cm-text)`,
  `var(--cm-faint)`, and `class="cm-svg-box"` for neutral boxes.
- Emphasis fills use `color-mix(in srgb, var(--cm-accent) 12%, transparent)` so the tint works on both
  light and dark backgrounds. Raise the percentage for a stronger fill.
- Text uses `class="cm-svg-label"` for titles and `class="cm-svg-sub"` for detail. Recolor a label with
  `style="fill:var(--cm-accent)"`. Both classes are already bold and high-contrast in light and dark;
  do not add per-element `font-weight` or a faint `fill` to make them readable.
- Fit text inside its box. The mono fonts are fixed-advance: a `cm-svg-sub` char is ~6px wide (10px),
  a `cm-svg-label` char is ~8px wide (13px). Keep a centered label within `(box_width - 20) / 6`
  characters for sub-labels or `(box_width - 20) / 8` for titles, so it clears the border on both
  sides. A `180`px box holds ~26 sub-label characters; if the text is longer, widen the box (and its
  incoming/outgoing edges) or shorten the text — do not shrink the font per-element. Free-floating
  captions not inside a box only need to fit the `760`-wide viewBox.
- One diagram per major flow: a layered architecture, a request or loop with a decision diamond and a
  dashed loop-back edge, a data pipeline, a state machine, or a topology.

## Provenance callout

Place a snapshot notice near the top of the overview `_index.md` so readers can judge staleness. Fill
the values captured in the survey step.
```md
{{% notice style="note" title="Snapshot" %}}
Generated 2026-07-10 against commit `89c01f6` on branch `main`. Commits after this one may make parts
of this map stale.
{{% /notice %}}
```
Add a sentence when the working tree was dirty. For a directory with no git metadata, show only the
date and omit the commit line.
