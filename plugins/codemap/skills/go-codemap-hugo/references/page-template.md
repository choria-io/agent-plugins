# Page templates

Two skeletons: the section landing page and a subsystem page. Both are relearn markdown. See
`relearn-components.md` for the full catalog.

## Section landing page: `content/<section>/_index.md`

```md
+++
title = "Code Map"
weight = 40
description = "A guided deep-dive into the codebase: architecture, subsystems, and flows."
+++

One or two sentences on what the project is and why it matters.

{{% notice style="note" title="Snapshot" %}}
Generated 2026-07-10 against commit `89c01f6` on branch `main`. Commits after this one may make parts
of this map stale.
{{% /notice %}}

## The mental model

One paragraph that lets a reader hold the whole system in their head.

<figure class="cm-diagram">
  <svg viewBox="0 0 760 260" role="img" aria-label="System at a glance">
    <!-- ... -->
  </svg>
  <figcaption>One core, many faces.</figcaption>
</figure>

## Explore

{{% children description="true" %}}
```

## Subsystem page: `content/<section>/<slug>.md`

```md
+++
title = "The Agent Loop"
weight = 20
description = "Call the model, run the tools it asks for, feed results back, under a budget."
+++

Lede sentence on what this subsystem is and why it matters.

{{% notice style="note" title="Where it lives" %}}
`internal/agent`: the loop and its budgets. Key files: `agent.go`, `runner.go`.
{{% /notice %}}

## How one iteration runs

Prose grounded in real symbols like `runner.loop` and files like `internal/agent/runner.go`.

<ol class="cm-steps">
  <li><b>Poll for suspend</b> At the loop boundary, never mid-tool.</li>
  <li><b>Call the model</b> Under the per-call timeout.</li>
</ol>

<figure class="cm-diagram">
  <svg viewBox="0 0 760 300" role="img" aria-label="Agent loop"><!-- ... --></svg>
  <figcaption>One iteration of the loop.</figcaption>
</figure>

{{% notice style="warning" title="Load-bearing decision" %}}
State why an invariant must hold.
{{% /notice %}}

{{% notice style="tip" title="Next" %}}
Continue to [Tools and Introspection]({{% relref "tools" %}}).
{{% /notice %}}
```
