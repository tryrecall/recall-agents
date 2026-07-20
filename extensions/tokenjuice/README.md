# @steelengine/tokenjuice

Official Tokenjuice output compaction plugin for SteelEngine.

Tokenjuice compacts noisy `exec` and `bash` tool results after commands run, before the result is fed back into the active agent session. It does not rewrite commands, rerun commands, or change exit codes.

## Install

```bash
steelengine plugins install @steelengine/tokenjuice
```

Restart the Gateway after installing or updating the plugin.

## Enable

```bash
steelengine config set plugins.entries.tokenjuice.enabled true
```

Equivalent:

```bash
steelengine plugins enable tokenjuice
```

## Docs

- https://docs.steelengine.ai/tools/tokenjuice

## Package

- Plugin id: `tokenjuice`
- Package: `@steelengine/tokenjuice`
- Minimum SteelEngine host: `2026.5.28`
