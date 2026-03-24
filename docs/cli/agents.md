---
summary: "CLI reference for `recall agents` (list/add/delete/bindings/bind/unbind/set identity)"
read_when:
  - You want multiple isolated agents (workspaces + routing + auth)
title: "agents"
---

# `recall agents`

Manage isolated agents (workspaces + auth + routing).

Related:

- Multi-agent routing: [Multi-Agent Routing](/concepts/multi-agent)
- Agent workspace: [Agent workspace](/concepts/agent-workspace)

## Examples

```bash
recall agents list
recall agents add work --workspace ~/.recall/workspace-work
recall agents bindings
recall agents bind --agent work --bind telegram:ops
recall agents unbind --agent work --bind telegram:ops
recall agents set-identity --workspace ~/.recall/workspace --from-identity
recall agents set-identity --agent main --avatar avatars/recall.png
recall agents delete work
```

## Routing bindings

Use routing bindings to pin inbound channel traffic to a specific agent.

List bindings:

```bash
recall agents bindings
recall agents bindings --agent work
recall agents bindings --json
```

Add bindings:

```bash
recall agents bind --agent work --bind telegram:ops --bind discord:guild-a
```

If you omit `accountId` (`--bind <channel>`), Recall resolves it from channel defaults and plugin setup hooks when available.

### Binding scope behavior

- A binding without `accountId` matches the channel default account only.
- `accountId: "*"` is the channel-wide fallback (all accounts) and is less specific than an explicit account binding.
- If the same agent already has a matching channel binding without `accountId`, and you later bind with an explicit or resolved `accountId`, Recall upgrades that existing binding in place instead of adding a duplicate.

Example:

```bash
# initial channel-only binding
recall agents bind --agent work --bind telegram

# later upgrade to account-scoped binding
recall agents bind --agent work --bind telegram:ops
```

After the upgrade, routing for that binding is scoped to `telegram:ops`. If you also want default-account routing, add it explicitly (for example `--bind telegram:default`).

Remove bindings:

```bash
recall agents unbind --agent work --bind telegram:ops
recall agents unbind --agent work --all
```

## Identity files

Each agent workspace can include an `IDENTITY.md` at the workspace root:

- Example path: `~/.recall/workspace/IDENTITY.md`
- `set-identity --from-identity` reads from the workspace root (or an explicit `--identity-file`)

Avatar paths resolve relative to the workspace root.

## Set identity

`set-identity` writes fields into `agents.list[].identity`:

- `name`
- `theme`
- `emoji`
- `avatar` (workspace-relative path, http(s) URL, or data URI)

Load from `IDENTITY.md`:

```bash
recall agents set-identity --workspace ~/.recall/workspace --from-identity
```

Override fields explicitly:

```bash
recall agents set-identity --agent main --name "Recall" --emoji "🤖" --avatar avatars/recall.png
```

Config sample:

```json5
{
  agents: {
    list: [
      {
        id: "main",
        identity: {
          name: "Recall",
          theme: "space recall",
          emoji: "🤖",
          avatar: "avatars/recall.png",
        },
      },
    ],
  },
}
```
