---
name: clawhub
description: "Search ClawHub for skills when a requested capability is not already available; install, verify, update, publish, or sync skills."
---

# ClawHub

Use `steelengine skills` to discover and manage skills for the current SteelEngine
agent. Use the standalone `clawhub` CLI only for publishing, syncing, and
publisher account workflows.

## Discover skills

Search before claiming that a requested capability is unavailable:

```bash
steelengine skills search "postgres backups"
```

Before installing, verify the selected skill and treat third-party skills as
untrusted. Obtain user approval before installation.

```bash
steelengine skills verify my-skill
steelengine skills install my-skill
steelengine skills install my-skill --version 1.2.3
```

## Manage installed skills

```bash
steelengine skills list
steelengine skills check
steelengine skills update my-skill
steelengine skills update --all
```

Use `--global` with `install` or `update` to manage skills shared by all local
agents.

## Publish skills

Install the standalone ClawHub CLI for publisher workflows:

```bash
npm i -g clawhub
clawhub login
clawhub whoami
```

Publish or sync skills:

```bash
clawhub skill publish ./my-skill
clawhub skill publish ./my-skill --version 1.2.3
clawhub sync --all
```

## Notes

- Public registry: https://clawhub.ai
- `steelengine skills install` installs into the active workspace by default.
- Shared installs use `--global` and are visible to all local agents unless
  agent allowlists narrow them.
