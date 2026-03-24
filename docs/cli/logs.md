---
summary: "CLI reference for `recall logs` (tail gateway logs via RPC)"
read_when:
  - You need to tail Gateway logs remotely (without SSH)
  - You want JSON log lines for tooling
title: "logs"
---

# `recall logs`

Tail Gateway file logs over RPC (works in remote mode).

Related:

- Logging overview: [Logging](/logging)

## Examples

```bash
recall logs
recall logs --follow
recall logs --json
recall logs --limit 500
recall logs --local-time
recall logs --follow --local-time
```

Use `--local-time` to render timestamps in your local timezone.
