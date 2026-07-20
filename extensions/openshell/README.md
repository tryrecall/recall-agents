# @steelengine/openshell-sandbox

Official NVIDIA OpenShell sandbox backend for SteelEngine.

This plugin lets SteelEngine use OpenShell-managed sandboxes with mirrored local workspaces and SSH command execution.

## Install

```bash
steelengine plugins install @steelengine/openshell-sandbox
```

Restart the Gateway after installing or updating the plugin.

## Configure

Use the OpenShell docs for credentials, workspace mirroring, runtime selection, and troubleshooting:

- https://docs.steelengine.ai/gateway/openshell

## Package

- Plugin id: `openshell`
- Package: `@steelengine/openshell-sandbox`
- Minimum SteelEngine host: `2026.5.12-beta.1`
