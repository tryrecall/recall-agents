---
summary: "CLI reference for `recall reset` (reset local state/config)"
read_when:
  - You want to wipe local state while keeping the CLI installed
  - You want a dry-run of what would be removed
title: "reset"
---

# `recall reset`

Reset local config/state (keeps the CLI installed).

```bash
recall backup create
recall reset
recall reset --dry-run
recall reset --scope config+creds+sessions --yes --non-interactive
```

Run `recall backup create` first if you want a restorable snapshot before removing local state.
