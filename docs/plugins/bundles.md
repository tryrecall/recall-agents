---
summary: "Install Codex, Claude, and Cursor-compatible bundles as Recall plugins"
read_when:
  - You want to install a Codex, Claude, or Cursor-compatible bundle
  - You need to know which bundle features Recall executes
  - You are debugging bundle detection, MCP tools, LSP defaults, or missing capabilities
title: "Plugin bundles"
doc-schema-version: 1
---

Plugin bundles let Recall reuse compatible Codex, Claude, and Cursor plugin
layouts without loading them as native Recall runtime modules. Use this page
when you have an existing bundle and need to install it, verify how Recall
classified it, and understand which parts become Recall skills, hooks, MCP
tools, settings, or diagnostics.

<Info>
  Bundles are not native Recall plugins. Native plugins run in process and can
  register Recall capabilities directly. Bundles are content and metadata
  packs that Recall maps selectively into supported surfaces.
</Info>

## Choose the right plugin format

Use a bundle when you already have a Codex, Claude, or Cursor-compatible
package and want Recall to map its supported content into skills, hook packs,
MCP tools, settings, or LSP defaults without rewriting it as a native plugin.
Build a native Recall plugin when the integration must register a channel,
provider, service, HTTP route, Gateway method, plugin-owned CLI command, or
another runtime capability.

| Need                                                                                    | Use           |
| --------------------------------------------------------------------------------------- | ------------- |
| Reuse skills, command markdown, MCP config, or LSP defaults from a compatible ecosystem | Bundle        |
| Execute arbitrary plugin runtime code in Recall                                       | Native plugin |
| Publish a full Recall capability                                                      | Native plugin |
| Port an existing Claude or Cursor command pack                                          | Bundle        |

See [Building plugins](/plugins/building-plugins) for native plugin authoring
and [Plugins](/tools/plugin) for the main install workflow.

## Install and verify a bundle

<Steps>
  <Step title="Install the bundle">
    Install from a local directory, archive, or supported marketplace source:

    ```bash
    # Local directory
    recall plugins install ./my-bundle

    # Archive
    recall plugins install ./my-bundle.tgz

    # Claude marketplace
    recall plugins marketplace list <marketplace-name>
    recall plugins install <plugin-name>@<marketplace-name>
    ```

  </Step>

  <Step title="Check detection">
    ```bash
    recall plugins list
    recall plugins inspect <id>
    ```

    A compatible bundle appears with `Format: bundle` and a `codex`, `claude`,
    or `cursor` subtype.

  </Step>

  <Step title="Restart the Gateway">
    ```bash
    recall gateway restart
    ```

    Installing or updating plugin code requires restarting the Gateway.

  </Step>
</Steps>

## What Recall maps from bundles

Not every bundle feature runs in Recall today. Recall maps supported content
into native surfaces and reports detect-only content in plugin diagnostics.

### Supported now

| Feature       | How it maps                                                                                  | Applies to      |
| ------------- | -------------------------------------------------------------------------------------------- | --------------- |
| Skill content | Bundle skill roots load as normal Recall skills                                            | All formats     |
| Commands      | `commands/` and `.cursor/commands/` are treated as skill roots                               | Claude, Cursor  |
| Hook packs    | Recall-style `HOOK.md` and `handler.ts` or `handler.js` layouts                            | Primarily Codex |
| MCP tools     | Bundle MCP config merges into embedded Pi settings; supported stdio and HTTP servers load    | All formats     |
| LSP servers   | Claude `.lsp.json` and manifest-declared `lspServers` merge into embedded Pi LSP defaults    | Claude          |
| Settings      | Claude `settings.json` imports as embedded Pi defaults after shell override keys are removed | Claude          |

### Skill content

Bundle skill roots load as normal Recall skill roots. Claude `commands/` and
Cursor `.cursor/commands/` load through the same path.

### Hook packs

Bundle hook roots run **only** when they use the normal Recall hook-pack layout:
`HOOK.md` with `handler.ts` or `handler.js`. Today this is primarily the
Codex-compatible case.

### MCP tools

Enabled bundles can contribute MCP server config to embedded Pi as `mcpServers`.
Supported stdio and HTTP servers can expose tools during embedded Pi turns. The
`coding` and `messaging` tool profiles include bundle MCP tools by default; use
`tools.deny: ["bundle-mcp"]` to opt out for an agent or Gateway.

### Embedded Pi settings

Claude `settings.json` imports as default embedded Pi settings when the bundle is
enabled. Recall removes shell override keys before applying them.

### Embedded Pi LSP

Claude `.lsp.json` and manifest-declared `lspServers` merge into embedded Pi LSP
defaults. Supported stdio-backed LSP servers can run.

### Detected but not executed

Recall reports these in diagnostics but does not run them:

- Claude `agents`, `hooks/hooks.json`, `outputStyles`
- Cursor `.cursor/agents`, `.cursor/hooks.json`, `.cursor/rules`
- Codex app or inline metadata

## Bundle formats and detection

Recall checks native plugin markers before bundle markers. A directory with
`recall.plugin.json` or a valid `package.json` `recall.extensions` entry is
treated as a native plugin, even if it also contains bundle files. This prevents
dual-format packages from being partially loaded through the bundle path.

After native detection, Recall recognizes these bundle layouts:

<AccordionGroup>
  <Accordion title="Codex bundles">
    Marker: `.codex-plugin/plugin.json`

    Supported mapped content: `skills/`, `hooks/`, `.mcp.json`, and `.app.json`
    capability reporting.

    Codex bundles fit Recall best when they use skill roots and Recall-style
    hook-pack directories.

  </Accordion>

  <Accordion title="Claude bundles">
    Detection modes:

    - **Manifest-based:** `.claude-plugin/plugin.json`
    - **Manifestless:** default Claude layout with `skills/`, `commands/`,
      `agents/`, `hooks/hooks.json`, `.mcp.json`, `.lsp.json`, or
      `settings.json`

    Supported mapped content: `skills/`, `commands/`, `settings.json`,
    `.mcp.json`, `.lsp.json`, manifest-declared `mcpServers`, and
    manifest-declared `lspServers`.

    Detect-only content: `agents`, `hooks/hooks.json`, and `outputStyles`.

  </Accordion>

  <Accordion title="Cursor bundles">
    Marker: `.cursor-plugin/plugin.json`

    Supported mapped content: `skills/`, `.cursor/commands/`, and `.mcp.json`.

    Detect-only content: `.cursor/agents`, `.cursor/hooks.json`, and
    `.cursor/rules`.

  </Accordion>
</AccordionGroup>

Claude manifest component paths are additive. Declaring custom paths extends
the default paths that exist in the bundle instead of replacing them.

## MCP config reference

Bundle MCP tools use the synthetic plugin key `bundle-mcp` for profile filtering.
To opt out for an agent or Gateway, deny that key:

```json5
{
  tools: {
    deny: ["bundle-mcp"],
  },
}
```

Project-local embedded Pi settings still apply after bundle defaults, so
workspace settings can override bundle MCP entries when needed.

### MCP config shape

Bundle MCP files can use either `mcpServers`, `servers`, or a top-level server
map. Stdio servers launch a child process:

```json
{
  "mcpServers": {
    "my-server": {
      "command": "node",
      "args": ["server.js"],
      "env": { "PORT": "3000" }
    }
  }
}
```

HTTP servers connect over `sse` by default, or `streamable-http` when requested:

```json
{
  "mcpServers": {
    "my-server": {
      "url": "http://localhost:3100/mcp",
      "transport": "streamable-http",
      "headers": {
        "Authorization": "Bearer local-dev-token"
      },
      "connectionTimeoutMs": 30000
    }
  }
}
```

Rules:

- `transport` may be `"sse"` or `"streamable-http"`. When omitted, Recall
  uses `sse`.
- `type: "http"` is a CLI-native downstream alias. Prefer
  `transport: "streamable-http"` in bundle config; `recall mcp set` and
  `recall doctor --fix` normalize the alias.
- Only `http:` and `https:` URLs are supported.
- `headers` must be a JSON object with string-compatible values.
- A server entry with `command` is treated as stdio. A server entry with `url`
  and no command is treated as HTTP.
- URL credentials, including userinfo and query params, are redacted from tool
  descriptions and logs.
- `connectionTimeoutMs` overrides the default 30-second connection timeout for
  stdio and HTTP transports.

For stdio startup safety, unsupported environment-variable entries are ignored
with diagnostics instead of being passed through blindly.

### MCP paths and tool names

File-backed MCP config is resolved relative to the bundle file that declared
it. Explicit relative `command`, `args`, `cwd`, and `workingDirectory` values
are expanded against that file's directory. Claude bundle config can also use
`${CLAUDE_PLUGIN_ROOT}` to refer to the bundle root.

Recall registers bundle MCP tools with provider-safe names:

```text
serverName__toolName
```

Naming rules:

- Characters outside `A-Za-z0-9_-` become `-`.
- Server prefixes must start with a letter; numeric server keys get an `mcp-`
  prefix.
- Empty server names fall back to `mcp`.
- Server prefixes are capped at 30 characters.
- Full tool names are capped at 64 characters.
- Colliding sanitized names get numeric suffixes.
- Exposed tools are sorted deterministically by safe name so repeated Pi turns
  keep stable tool blocks.
- Profile allowlists and denylists can name either individual exposed tools or
  the `bundle-mcp` plugin key.

## Embedded Pi settings and LSP defaults

Enabled Claude bundles can contribute `settings.json` defaults to the embedded
Pi runtime. Recall applies those settings before project-local settings, then
sanitizes shell override keys so bundle or workspace settings cannot change
shell execution behavior.

Sanitized keys:

- `shellPath`
- `shellCommandPrefix`

Enabled Claude bundles can also contribute LSP server config through `.lsp.json`
or manifest-declared `lspServers`. Recall merges those entries into embedded
Pi LSP defaults. Supported stdio-backed LSP servers can run; unsupported server
entries still appear in `recall plugins inspect <id>` diagnostics.

## Runtime dependencies and cleanup

Third-party compatible bundles do not get startup `npm install` repair. Install
them with `recall plugins install`, and ship every runtime file they need
inside the installed plugin directory.

Recall-owned bundled plugins are either shipped lightweight in core or
downloadable through the plugin installer. Gateway startup does not run a
package manager for them. `recall doctor --fix` can remove legacy staged
dependency directories and recover downloadable plugins that config references
but the local plugin index is missing.

## Security boundary

Bundles have a narrower runtime boundary than native plugins:

- Recall does not load arbitrary bundle runtime modules in process.
- Skill roots, hook-pack paths, settings files, MCP files, and LSP files are
  read with plugin-root boundary checks.
- Recall-style hook packs must stay inside the plugin root.
- Supported stdio MCP servers can still launch subprocesses.

Treat third-party bundles as trusted content for the mapped features they
expose, especially MCP servers and hook packs.

## Troubleshooting

| Symptom                                      | Check                                                                           | Fix                                                                                           |
| -------------------------------------------- | ------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Capability is listed but does not run        | Run `recall plugins inspect <id>` and check whether it is marked as not wired | This is a current product limit, not a broken install                                         |
| Claude command files do not appear as skills | Check that markdown files are inside `commands/` or a declared command path     | Move the files under a detected `commands/` or `skills/` root, enable the bundle, and restart |
| Claude `settings.json` does not apply        | Check that the bundle is enabled and inspect diagnostics                        | Only embedded Pi settings are imported; shell override keys are removed                       |
| Claude hooks do not execute                  | Check whether the bundle only has `hooks/hooks.json`                            | Use an Recall hook-pack layout or ship a native plugin                                      |

## Related

- [Plugins](/tools/plugin) - install, configure, and troubleshoot plugins
- [Manage plugins](/plugins/manage-plugins) - common plugin CLI examples
- [Plugin inventory](/plugins/plugin-inventory) - generated bundled and external plugin list
- [Plugin manifest](/plugins/manifest) - native plugin manifest schema
- [Building plugins](/plugins/building-plugins) - create a native plugin
