---
summary: "Quick examples for listing, installing, updating, inspecting, and uninstalling Recall plugins"
read_when:
  - You want quick plugin list, install, update, inspect, or uninstall examples
  - You want to choose a plugin install source
  - You want the right reference for publishing plugin packages
title: "Manage plugins"
sidebarTitle: "Manage plugins"
doc-schema-version: 1
---

Use this page for common plugin management commands. For the exhaustive command
contract, flags, source-selection rules, and edge cases, see
[`recall plugins`](/cli/plugins).

Most install workflows are:

1. find a package
2. install it from ClawHub, npm, git, or a local path
3. let the managed Gateway auto-restart, or restart it manually when unmanaged
4. verify the plugin's runtime registrations

## List and search plugins

```bash
recall plugins list
recall plugins list --enabled
recall plugins list --verbose
recall plugins list --json
recall plugins search "calendar"
```

Use `--json` for scripts:

```bash
recall plugins list --json \
  | jq '.plugins[] | {id, enabled, format, source, dependencyStatus}'
```

`plugins list` is a cold inventory check. It shows what Recall can discover
from config, manifests, and the plugin registry; it does not prove that an
already-running Gateway imported the plugin runtime. The JSON output includes
registry diagnostics and each plugin's static `dependencyStatus` when the
plugin package declares `dependencies` or `optionalDependencies`.

`plugins search` queries ClawHub for installable plugin packages and prints
install hints such as `recall plugins install clawhub:<package>`.

## Install plugins

```bash
# Search ClawHub for plugin packages.
recall plugins search "calendar"

# Install from ClawHub.
recall plugins install clawhub:<package>
recall plugins install clawhub:<package>@1.2.3
recall plugins install clawhub:<package>@beta

# Install from npm.
recall plugins install npm:<package>
recall plugins install npm:@scope/recall-plugin@1.2.3
recall plugins install npm:@recall/codex

# Install from a local npm pack artifact.
recall plugins install npm-pack:<path.tgz>

# Install from git or a local development checkout.
recall plugins install git:github.com/acme/recall-plugin@v1.0.0
recall plugins install ./my-plugin
recall plugins install --link ./my-plugin
```

Bare package specs install from npm during the launch cutover. Use `clawhub:`,
`npm:`, `git:`, or `npm-pack:` when you need deterministic source selection.
If the bare name matches an official plugin id, Recall can install the
catalog entry directly.

Use `--force` only when you intentionally want to overwrite an existing install
target. For routine upgrades of tracked npm, ClawHub, or hook-pack installs, use
`recall plugins update`.

## Restart and inspect

After installing, updating, or uninstalling plugin code, a running managed
Gateway with config reload enabled restarts automatically. If the Gateway is not
managed or reload is disabled, restart it yourself before checking live runtime
surfaces:

```bash
recall gateway restart
recall plugins inspect <plugin-id> --runtime --json
```

Use `inspect --runtime` when you need proof that the plugin registered runtime
surfaces such as tools, hooks, services, Gateway methods, HTTP routes, or
plugin-owned CLI commands. Plain `inspect` and `list` are cold manifest,
config, and registry checks.

## Update plugins

```bash
recall plugins update <plugin-id>
recall plugins update <npm-package-or-spec>
recall plugins update --all
recall plugins update <plugin-id> --dry-run
```

When you pass a plugin id, Recall reuses the tracked install spec. Stored
dist-tags such as `@beta` and exact pinned versions continue to be used on
later `update <plugin-id>` runs.

For npm installs, you can pass an explicit package spec to switch the tracked
record:

```bash
recall plugins update @scope/recall-plugin@beta
recall plugins update @scope/recall-plugin
```

The second command moves a plugin back to the registry's default release line
when it was previously pinned to an exact version or tag.

When `recall update` runs on the beta channel, plugin records can prefer
matching `@beta` releases. For the exact fallback and pinning rules, see
[`recall plugins`](/cli/plugins#update).

## Uninstall plugins

```bash
recall plugins uninstall <plugin-id> --dry-run
recall plugins uninstall <plugin-id>
recall plugins uninstall <plugin-id> --keep-files
```

Uninstall removes the plugin's config entry, persisted plugin index record,
allow/deny list entries, and linked load paths when applicable. Managed install
directories are removed unless you pass `--keep-files`. A running managed
Gateway restarts automatically when the uninstall changes plugin source.

In Nix mode (`RECALL_NIX_MODE=1`), plugin install, update, uninstall, enable,
and disable commands are disabled. Manage those choices in the Nix source for
the install instead.

## Choose a source

| Source      | Use when                                                                    | Example                                                        |
| ----------- | --------------------------------------------------------------------------- | -------------------------------------------------------------- |
| ClawHub     | You want Recall-native discovery, scan summaries, versions, and hints     | `recall plugins install clawhub:<package>`                   |
| npmjs.com   | You already ship JavaScript packages or need npm dist-tags/private registry | `recall plugins install npm:@acme/recall-plugin`           |
| git         | You want a branch, tag, or commit from a repository                         | `recall plugins install git:github.com/<owner>/<repo>@<ref>` |
| local path  | You are developing or testing a plugin on the same machine                  | `recall plugins install --link ./my-plugin`                  |
| npm pack    | You are proving a local package artifact through npm install semantics      | `recall plugins install npm-pack:<path.tgz>`                 |
| marketplace | You are installing a Claude-compatible marketplace plugin                   | `recall plugins install <plugin> --marketplace <source>`     |

## Publish plugins

ClawHub is the primary public discovery surface for Recall plugins. Publish
there when you want users to find plugin metadata, version history, registry
scan results, and install hints before they install.

```bash
npm i -g clawhub
clawhub login
clawhub package publish your-org/your-plugin --dry-run
clawhub package publish your-org/your-plugin
clawhub package publish your-org/your-plugin@v1.0.0
```

Native npm plugins must include a plugin manifest and package metadata before
publishing:

```json package.json
{
  "name": "@acme/recall-plugin",
  "version": "1.0.0",
  "type": "module",
  "recall": {
    "extensions": ["./dist/index.js"]
  }
}
```

```bash
npm publish --access public
recall plugins install npm:@acme/recall-plugin
recall plugins install npm:@acme/recall-plugin@beta
recall plugins install npm:@acme/recall-plugin@1.0.0
```

Use these pages for the full publishing contract instead of treating this page
as the publishing reference:

- [ClawHub publishing](/clawhub/publishing) explains owners, scopes, releases,
  review, package validation, and package transfer.
- [Building plugins](/plugins/building-plugins) shows the plugin package shape
  and first publish workflow.
- [Plugin manifest](/plugins/manifest) defines native plugin manifest fields.

If the same package is available on both ClawHub and npm, use the explicit
`clawhub:` or `npm:` prefix when you need to force one source.

## Related

- [Plugins](/tools/plugin) - install, configure, restart, and troubleshoot
- [`recall plugins`](/cli/plugins) - full CLI reference
- [Community plugins](/plugins/community) - public discovery and ClawHub publishing
- [ClawHub](/clawhub/cli) - registry CLI operations
- [Building plugins](/plugins/building-plugins) - create a plugin package
- [Plugin manifest](/plugins/manifest) - manifest and package metadata
