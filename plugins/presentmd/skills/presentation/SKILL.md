---
name: presentation
description: >
  Build a presentmd slide deck: interview the person about the talk, then write the deck into
  a directory, as one presentation.md or as presentation.yaml with a file per slide, and render
  it to check every slide fits. Use this whenever someone asks for a presentation, a slide deck, a
  talk, a keynote, slides for a conference or a meeting, or asks to turn notes, a README or a
  design document into slides. Use it also when they ask to add slides to a deck that already
  exists, or to restructure one. It covers the deck format, the seven page styles, and the
  layout limits that decide how much fits on a slide.
---

# Writing a presentmd deck

A deck is a directory, holding the talk and an `images/` directory for whatever the slides
point at. The binary reads it; this skill writes it.

The talk itself is written either way. One file, which is what to write unless the person says
otherwise:

```
mydeck/
  presentation.md
  images/diagram.svg
```

```markdown
---
title: A Talk About Things
theme: default
---

+++
page_style: title
+++

+++
page_style: content
caption: A caption
+++

# What They Are For

The body, as **markdown**.
```

The frontmatter at the top is the presentation. A `+++` on its own line opens a slide and
closes that slide's frontmatter, and everything under it to the next `+++` is the body. Order in
the file is the order of the talk, so there are no numbers to keep in step.

Or a file per slide, which suits a deck long enough that moving a slide means moving a file, and
is what to keep writing when the deck already is one:

```
mydeck/
  presentation.yaml
  01-title.md
  02-what-it-is.md
  images/diagram.svg
```

`presentation.yaml` holds what the single file writes as its top frontmatter, without the
fences, and each numbered file holds one slide's frontmatter and body.

Write a deck one way or the other. A directory holding `presentation.md` is read that way and
the markdown beside it is not searched for slides, and a `presentation.yaml` left there is
reported as a problem, which `render` refuses to write past. Converting a deck means moving it
rather than leaving both.

Serve it with `presentmd serve mydeck`, which reloads the browser as you save. Write it as one
self contained HTML file with `presentmd render mydeck talk.html`. Either command takes
`--theme` to render the deck through a theme other than the one it names.

## Interview first

A deck carries a person's name, their contacts, the event and the date. Guessing any of those
puts a wrong address on a slide in front of an audience, so ask. Keep the interview short: the
answers you need are the ones you cannot infer from the material.

Ask about:

- **The talk.** What it is about, and what the audience should leave believing or able to do.
  This decides the spine, and everything else follows it.
- **The audience.** Their background decides how much you can assume and how much a slide has
  to explain.
- **The slot.** Minutes on stage. This decides the slide count, and it is the answer people
  most often forget to give.
- **The event and the date**, as they should appear on the title slide.
- **The presenter**: name, surname, and the contacts to show, `contact_email`, `contact_web`,
  `contact_social` with `contact_social_network` naming the network the handle is on.
- **An avatar**, a file in the deck directory, or a GitHub handle to build one from.
- **Where the deck goes**, if the working directory does not make it obvious.

When the person hands you material to work from, a README, notes, a design document, read it
before asking anything. Most of the interview is then confirming what you already found.

## Defaults to take without asking

These are the settings a typical talk wants. Take them, say which you took, and change them
when the person says otherwise.

- `theme: default`, the theme that ships in the binary.
- `aspect: "16:9"`.
- `transition: fade`, which moves without drawing attention to the move.
- No `footer` key, which leaves the footer built from the presenter and the contacts. Setting
  `footer` replaces that line rather than adding to it, so set one or the other.
- Roughly one slide per minute of the slot, counting the title and the closing. A twenty
  minute talk is about twenty slides. Section dividers are cheap and worth their place.
- One `presentation.md`, which keeps the whole talk in front of you as you write it. Add to a
  deck that already exists in the form it is already in.
- In the file per slide form, filenames numbered `01-`, `02-` in tens if the deck is long enough
  that inserting a slide later is likely.

## The shape of a talk

Open with a `title` slide, close with a `closing` slide, and divide the middle with `section`
slides so the audience knows where they are. Between the dividers, `content` slides carry the
argument, with `code`, `image` and `columns` where the material calls for them.

Give every slide `notes`. The speaker view shows them and the audience never does, and a
person presenting from a laptop reads them rather than the slide. Write what you would say out
loud, not a second copy of the slide.

## The frontmatter

Every slide names a `page_style`, which is the only required key. The rest:

- `caption`, a line under the body.
- `cta`, a call to action under the caption.
- `notes`, the speaker view.
- `background`, a hex value, a CSS color name, or a path to an image.
- `transition`, this slide's own move, over the deck's.
- `text_size`, one of `small`, `normal`, `large`, `huge`.

The body's first level one heading is the slide's heading and the rest is the content. The
theme places the presenter, the contacts and the footer, so no slide writes them.

In a `presentation.md` the frontmatter is fenced with `+++` rather than `---`, since a `---`
inside a body already means a thematic break. In a file per slide it is fenced with `---` as
usual, and `slide:` overrides the number the filename gives.

## The seven page styles

| `page_style` | What it carries |
|--------------|-----------------|
| `title`      | the opening slide, built from the presentation; a body that is one image becomes the logo |
| `section`    | a divider carrying a heading alone |
| `content`    | a heading and a body, the ordinary slide |
| `columns`    | a body divided at a `---` into two columns |
| `code`       | a slide built around a fenced code block |
| `image`      | a slide built around one picture |
| `closing`    | the questions slide, which lists the contacts |

A `---` on a line of its own divides the body only in a page style the theme splits, which for
the shipped theme is `columns`. In every other style it is a horizontal rule, and a second
break in a splitting slide is reported as a problem. This is why a `presentation.md` breaks its
slides at `+++`: a `---` on its own line is already the divider inside one. A `+++` inside a
fenced code block is the deck's own text and does not end the slide.

## How much fits on a slide

This is where decks go wrong, and it is worth more care than the wording. A slide that
overflows does not scroll: it runs under the footer, or reveal scales the whole slide down and
that slide alone looks different from the rest.

At `normal` size a `content` slide holds roughly a short paragraph and four bullets, or a table
of five rows, or one image. Not two of those together, and never three. When you have a table
and a quote and a picture, that is three slides.

- A wide image belongs on an `image` slide. On a `content` slide the theme caps its height but
  not its width, so a diagram wider than about 600px pushes the layout out.
- Drop a slide to `text_size: small` when it carries a fenced code block over about twelve
  lines, or a table over about five rows.
- Keep code block lines under about 70 characters. One long line makes reveal scale the whole
  slide, which is more noticeable than the small text would have been.
- A `cta` is one short line. Two lines of call to action pushes into the footer.
- Prefer more slides over smaller text. A person in the back row reads the slide once.

## Backgrounds

`background` takes a hex value, a CSS color name, or a path to an image in the deck directory.
The shipped theme sets dark type, so pick a ground it reads against. A dark background needs a
theme whose type is light, and pairing dark on dark is the most common way a background slide
ends up unreadable.

## Images

Point at files in the deck directory, `images/thing.svg`. Prefer SVG you write by hand for
diagrams: it is text, it stays sharp, and `render` inlines it as a data URI so the exported
file opens with no network.

Check the whole drawing fits inside the `viewBox`. Text in an SVG is clipped at the viewBox
edge with no warning, and a wordmark that runs past it loses its last letters.

## Finish by rendering it

Never hand over a deck you have not rendered. Run:

```
presentmd render <deck> /tmp/deck.html
```

Every problem it prints is a slide that will be wrong in front of an audience: a page style the
theme does not have, a missing `page_style`, two slides claiming the same number, a second
thematic break. Fix all of them. A problem in a `presentation.md` names the line the slide opens
on, `presentation.md:22`, which is the `+++` above it.

Rendering proves the deck loads. It does not prove the slides fit, which is the failure this
skill exists to prevent. When Chrome is available, look at them:

```
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --disable-gpu \
  --window-size=1280,720 --virtual-time-budget=3000 \
  --screenshot=/tmp/slide-3.png "file:///tmp/deck.html#/2"
```

The hash is zero based, so `#/2` is the third slide. Read the images. Look for text crossing the
footer rule, a slide whose type is smaller than its neighbours, and an image running past the
edge. Fix what you find and shoot it again.

If there is no browser, say so rather than implying the layout was checked.
