# Choria Agent Plugins

A [Claude Code plugin marketplace](https://code.claude.com/docs/en/plugin-marketplaces)
hosting reusable skills and plugins for working with Choria and Go projects.

The repository is a generic container: it currently ships a Claude Code marketplace under
[`.claude-plugin/`](.claude-plugin/marketplace.json), and is laid out so that plugins for
other agents/tools can live alongside it in the future.

## Install (Claude Code)

Add the marketplace once, then install the plugins you want:

```text
/plugin marketplace add choria-io/agent-plugins
/plugin install codemap@choria
```

Later, pull updates with:

```text
/plugin marketplace update choria
```

To see what's installed or remove things:

```text
/plugin marketplace list
/plugin uninstall codemap@choria
```

## Available plugins

### `codemap`

Generates a "code map" — a wiki-style deep-dive into a Go codebase (mental model,
architecture, per-subsystem pages with hand-authored SVG diagrams and flows). Bundles two
skills so you can pick the output format:

| Skill             | Output                                                                                                                     |
|-------------------|----------------------------------------------------------------------------------------------------------------------------|
| `go-codemap`      | A self-contained static HTML site under `./codemap` (no build step, opens as `file://`).                                   |
| `go-codemap-hugo` | Native Hugo content for a `hugo-theme-relearn` site (renders inside the theme with menu, search, breadcrumbs, light/dark). |

Once installed, invoke by asking Claude to "create a code map" (or "codemap") for a Go repo,
or call a skill directly, e.g. `/codemap:go-codemap`.
