---
summary: "Anthropic models, Claude CLI, and native Claude session catalog."
read_when:
  - You are installing, configuring, or auditing the anthropic plugin
title: "Anthropic plugin"
---

# Anthropic plugin

Anthropic models, Claude CLI, and native Claude session catalog.

## Distribution

- Package: `@steelengine/anthropic-provider`
- Install route: included in SteelEngine

## Surface

providers: `anthropic`; contracts: `mediaUnderstandingProviders`, `usageProviders`

<!-- steelengine-plugin-reference:manual-start -->

node commands: anthropic.claude.sessions.list.v1,
anthropic.claude.sessions.read.v1; contracts: mediaUnderstandingProviders,
usageProviders

<!-- steelengine-plugin-reference:manual-end -->

## Related docs

- [anthropic](/providers/anthropic)
