---
summary: "CLI reference for `recall voicecall` (voice-call plugin command surface)"
read_when:
  - You use the voice-call plugin and want the CLI entry points
  - You want quick examples for `voicecall call|continue|status|tail|expose`
title: "voicecall"
---

# `recall voicecall`

`voicecall` is a plugin-provided command. It only appears if the voice-call plugin is installed and enabled.

Primary doc:

- Voice-call plugin: [Voice Call](/plugins/voice-call)

## Common commands

```bash
recall voicecall status --call-id <id>
recall voicecall call --to "+15555550123" --message "Hello" --mode notify
recall voicecall continue --call-id <id> --message "Any questions?"
recall voicecall end --call-id <id>
```

## Exposing webhooks (Tailscale)

```bash
recall voicecall expose --mode serve
recall voicecall expose --mode funnel
recall voicecall expose --mode off
```

Security note: only expose the webhook endpoint to networks you trust. Prefer Tailscale Serve over Funnel when possible.
