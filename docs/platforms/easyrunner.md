---
summary: "Run the Recall Gateway on EasyRunner with Podman and Caddy"
read_when:
  - Deploying Recall on EasyRunner
  - Running the Gateway behind EasyRunner's Caddy proxy
  - Choosing persistent volumes and auth for a hosted Gateway
title: "EasyRunner"
---

EasyRunner can host the Recall Gateway as a small containerized app behind its
Caddy proxy. This guide assumes an EasyRunner host that runs Podman-compatible
Compose apps and exposes HTTPS through Caddy.

## Before you begin

- An EasyRunner server with a domain routed to it.
- A built or published Recall container image.
- A persistent config volume for `/home/node/.recall`.
- A persistent workspace volume for `/workspace`.
- A strong Gateway token or password.

Keep device auth enabled when possible. If your reverse proxy deployment cannot
carry device identity correctly, fix trusted-proxy settings first; use
dangerous auth bypasses only for a fully private, operator-controlled network.

## Compose app

Create an EasyRunner app with a Compose file shaped like this:

```yaml
services:
  recall:
    image: ghcr.io/tryrecall/recall-agents:latest
    restart: unless-stopped
    environment:
      RECALL_GATEWAY_TOKEN: ${RECALL_GATEWAY_TOKEN}
      RECALL_HOME: /home/node
      RECALL_STATE_DIR: /home/node/.recall
      RECALL_CONFIG_PATH: /home/node/.tryrecall/recall-agents.json
      RECALL_WORKSPACE_DIR: /workspace
    volumes:
      - recall-config:/home/node/.recall
      - recall-workspace:/workspace
    labels:
      caddy: recall.example.com
      caddy.reverse_proxy: "{{upstreams 1455}}"
    command: ["recall", "gateway", "--bind", "lan", "--port", "1455"]

volumes:
  recall-config:
  recall-workspace:
```

Replace `recall.example.com` with your Gateway hostname. Store
`RECALL_GATEWAY_TOKEN` in EasyRunner's secret/environment manager instead of
committing it to the app definition.

## Configure Recall

Inside the persistent config volume, keep the Gateway reachable only through
the proxy and require auth:

```json5
{
  gateway: {
    bind: "lan",
    port: 1455,
    auth: {
      token: "${RECALL_GATEWAY_TOKEN}",
    },
  },
}
```

If Caddy terminates TLS for the Gateway, configure trusted proxy settings for
the exact proxy path rather than disabling auth checks globally. See
[Trusted proxy auth](/gateway/trusted-proxy-auth).

## Verify

From your workstation:

```bash
recall gateway probe --url https://recall.example.com --token <token>
recall gateway status --url https://recall.example.com --token <token>
```

From the EasyRunner host, check the app logs for a listening Gateway and no
startup SecretRef, plugin, or channel auth failures.

## Updates and backups

- Pull or build the new Recall image, then redeploy the EasyRunner app.
- Back up the `recall-config` volume before updates.
- Back up `recall-workspace` if agents write durable project data there.
- Run `recall doctor` after major updates to catch config migrations and
  service warnings.

## Troubleshooting

- `gateway probe` cannot connect: confirm the Caddy hostname points at the app
  and that the container listens on `0.0.0.0:1455`.
- Auth fails: rotate the token in EasyRunner secrets and the local client
  command together.
- Files are root-owned after restore: repair the mounted volumes so the
  container user can write `/home/node/.recall` and `/workspace`.
- Browser or channel plugins fail: check whether the required external
  binaries, network egress, and mounted credentials are available inside the
  container.
