---
name: theme
description: >
  Build a presentmd theme: a directory holding theme.yaml, theme.css and one jet template per
  page style, which decides what every slide of a deck looks like. Use this whenever someone
  wants a theme for a slide deck, a new look for a talk, their brand colors or fonts on a
  presentation, a dark theme, a conference or company template, or asks to change how
  presentmd renders slides rather than what a slide says. It covers the template variables, the
  escaping rule, and the CSS a theme has to get right for backgrounds, text sizes and printing.
---

# Writing a presentmd theme

A theme is a directory. A deck reaches it by path, `theme: ./mytheme` in its `presentation.yaml`
or in the frontmatter of its `presentation.md`, resolved against the deck directory, and the
theme is watched along with the deck so editing it reloads the browser.

`presentmd serve --theme ./mytheme <deck>` renders a deck through the theme without editing the
deck, which is how to point an existing deck at the theme you are working on.

```
mytheme/
  theme.yaml
  theme.css
  fonts/body.woff2
  styles/title.jet
  styles/section.jet
  styles/content.jet
  styles/columns.jet
  styles/code.jet
  styles/image.jet
  styles/closing.jet
  styles/_footer.jet
```

Copy `present/themes/default/` from the presentmd repository and change it, rather than
starting from an empty directory. It implements all seven page styles, ships its fonts, and
handles the printing and background cases below, which are easy to leave out and annoying to
discover on stage.

## Interview first

A theme is a look, and a look is the one thing you cannot infer from the code. Ask:

- **The feeling**: what the talk is and who is in the room. A conference keynote and an
  internal design review want different weights.
- **Light or dark ground**, and the accent color. Ask for hex values or a brand page.
- **Fonts**: names, and whether font files can ship with the theme.
- **Which page styles are needed.** A theme may implement fewer than seven, and a deck naming a
  style the theme lacks is reported as a problem against that slide. Seven is the safe set.
- **Anything to place on every slide**: a logo, an event name, a confidentiality line.

## theme.yaml

```yaml
code_style: github        # a chroma style name, for fenced code
split_styles:             # page styles a --- divides into two columns
  - columns
transition: none          # the theme's own move, which a deck overrides
fonts:
  heading: '"Your Sans", ui-sans-serif, system-ui, sans-serif'
  body: '"Your Sans", ui-sans-serif, system-ui, sans-serif'
  mono: '"Your Mono", ui-monospace, Menlo, monospace'
```

The three stacks reach the page as `--font-heading`, `--font-body` and `--font-mono`, so the
stylesheet reads `var(--font-body)` rather than naming a family in two places.

Listing a style in `split_styles` and then not reading `left` and `right` in its template
renders that slide empty, since a splitting style is handed the two halves instead of `body`.

## The templates

One [jet](https://github.com/CloudyKit/jet) template per page style, named for the style. Files
beginning with an underscore are partials the others include; `_footer.jet` is the convention.

Every template is handed:

| Variable | What it holds |
|----------|---------------|
| `heading` `body` | the slide's heading and content, already HTML |
| `left` `right` | the two halves of a splitting slide, already HTML |
| `caption` `cta` | the two lines under the body, already HTML |
| `presenter` `avatar` | the name as one string, and the picture's path |
| `footer` | the footer parts, as a list to join |
| `contacts` | `Label` and `Value` pairs for the closing slide |
| `presentation` `slide` | the yaml and this slide, whole |

### The escaping rule

Jet escapes every expression by default, and `raw:` opts out per expression. Write `heading`,
`body`, `left`, `right`, `caption` and `cta` with `raw:`, since the renderer already turned
those from markdown into HTML and escaping them again prints the tags on the slide. Write
everything reached through `presentation` and `slide` plain, so a title holding an ampersand
cannot arrive as markup.

Getting that backwards is how a theme opens a hole the renderer cannot close on its behalf.

```html
<div class="slide-frame">
  {{ if heading != "" }}
    <h1 class="slide-heading">{{ raw: heading }}</h1>
  {{ end }}
  <div class="slide-body">
    <div class="body">{{ raw: body }}</div>
    {{ if caption != "" }}<div class="slide-caption">{{ raw: caption }}</div>{{ end }}
  </div>
  {{ include "_footer.jet" }}
</div>
```

Guard every optional slot with `{{ if x != "" }}`. A theme that always writes the caption
element leaves an empty box on every slide that has no caption.

## The CSS a theme has to get right

Four things are not obvious, and each one produces a bug that only shows up in a particular
slide or a particular moment.

**Paint the ground on the viewport alone.**

```css
.reveal-viewport { background: var(--bg); }
```

Reveal draws a slide's own `background` in a layer behind `.slides`. Painting `.slides` as well
covers it, and a slide that sets `background:` then shows its color only as a border around the
frame.

**Spell a rule for every text size.** A slide may name `small`, `large` or `huge`, and the
renderer accepts all of them whatever the theme spells. A step with no rule renders at the
normal size and nobody is told why.

```css
.reveal section[data-text-size="small"] { --body-scale: 0.85; }
.reveal section[data-text-size="large"] { --body-scale: 1.25; }
.reveal section[data-text-size="huge"]  { --body-scale: 1.6; }
```

Read that scale in the body and the code together, so a slide changes size as one thing.

**Cap an inline image in both directions.** A `max-height` alone lets a wide diagram push a
content slide out sideways.

```css
.slide-content .slide-body img { max-height: 340px; max-width: 100%; }
```

**Fix the print view**, which is how a deck becomes a PDF. Reveal centers each slide by
measuring its content and setting the section's top; a theme that also gives the section the
full height of the page compounds the two and drops the footer off the bottom.

```css
@media print {
  .print-pdf .reveal .slides section { top: 0 !important; height: 100% !important; }
}
```

## Fonts

Name font files from the stylesheet with `url("fonts/body.woff2")`. Files named that way are
served from the theme directory and inlined into an export, so a deck rendered against your
theme opens on a machine that has never installed the font.

An `<img src>` written by a template resolves against the deck rather than the theme, so an
icon referenced that way has to live in the deck directory. Reach theme images from the
stylesheet as `background-image` instead, which keeps the theme portable.

## Style the markdown, not only the frame

A deck author writes ordinary markdown, so the stylesheet has to answer for tables,
blockquotes, ordered and unordered lists, inline code, links and emphasis. A theme that styles
only the heading and the body looks unfinished the first time someone puts a table on a slide.

## Finish by looking at it

Render a deck through the theme and read the result:

```
presentmd render <deck> /tmp/deck.html
```

The example decks in the presentmd repository exercise every page style, both background kinds,
the text sizes and the markdown a theme has to answer for, which makes them the right thing to
point a new theme at.

Then look at the slides, because a theme is a visual thing and rendering only proves it did not
error:

```
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --disable-gpu \
  --window-size=1280,720 --virtual-time-budget=3000 \
  --screenshot=/tmp/slide-1.png "file:///tmp/deck.html#/0"
```

Walk the whole deck, `#/0` upward. Check that no slide's content crosses the footer rule, that
the background slides show their background and their type is readable against it, and that a
`columns` slide fills both halves.
