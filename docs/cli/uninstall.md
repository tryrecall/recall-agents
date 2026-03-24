---
summary: "CLI reference for `recall uninstall` (remove gateway service + local data)"
read_when:
  - You want to remove the gateway service and/or local state
  - You want a dry-run first
title: "uninstall"
---

# `recall uninstall`

Uninstall the gateway service + local data (CLI remains).

```bash
recall backup create
recall uninstall
recall uninstall --all --yes
recall uninstall --dry-run
```

Run `recall backup create` first if you want a restorable snapshot before removing state or workspaces.
