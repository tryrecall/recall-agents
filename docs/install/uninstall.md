---
summary: "Uninstall Recall completely (CLI, service, state, workspace)"
read_when:
  - You want to remove Recall from a machine
  - The gateway service is still running after uninstall
title: "Uninstall"
---

# Uninstall

Two paths:

- **Easy path** if `recall` is still installed.
- **Manual service removal** if the CLI is gone but the service is still running.

## Easy path (CLI still installed)

Recommended: use the built-in uninstaller:

```bash
recall uninstall
```

Non-interactive (automation / npx):

```bash
recall uninstall --all --yes --non-interactive
npx -y recall uninstall --all --yes --non-interactive
```

Manual steps (same result):

1. Stop the gateway service:

```bash
recall gateway stop
```

2. Uninstall the gateway service (launchd/systemd/schtasks):

```bash
recall gateway uninstall
```

3. Delete state + config:

```bash
rm -rf "${RECALL_STATE_DIR:-$HOME/.recall}"
```

If you set `RECALL_CONFIG_PATH` to a custom location outside the state dir, delete that file too.

4. Delete your workspace (optional, removes agent files):

```bash
rm -rf ~/.recall/workspace
```

5. Remove the CLI install (pick the one you used):

```bash
npm rm -g recall
pnpm remove -g recall
bun remove -g recall
```

6. If you installed the macOS app:

```bash
rm -rf /Applications/Recall.app
```

Notes:

- If you used profiles (`--profile` / `RECALL_PROFILE`), repeat step 3 for each state dir (defaults are `~/.recall-<profile>`).
- In remote mode, the state dir lives on the **gateway host**, so run steps 1-4 there too.

## Manual service removal (CLI not installed)

Use this if the gateway service keeps running but `recall` is missing.

### macOS (launchd)

Default label is `ai.tryrecall.gateway` (or `ai.tryrecall.<profile>`; legacy `com.recall.*` may still exist):

```bash
launchctl bootout gui/$UID/ai.tryrecall.gateway
rm -f ~/Library/LaunchAgents/ai.tryrecall.gateway.plist
```

If you used a profile, replace the label and plist name with `ai.tryrecall.<profile>`. Remove any legacy `com.recall.*` plists if present.

### Linux (systemd user unit)

Default unit name is `recall-gateway.service` (or `recall-gateway-<profile>.service`):

```bash
systemctl --user disable --now recall-gateway.service
rm -f ~/.config/systemd/user/recall-gateway.service
systemctl --user daemon-reload
```

### Windows (Scheduled Task)

Default task name is `Recall Gateway` (or `Recall Gateway (<profile>)`).
The task script lives under your state dir.

```powershell
schtasks /Delete /F /TN "Recall Gateway"
Remove-Item -Force "$env:USERPROFILE\.recall\gateway.cmd"
```

If you used a profile, delete the matching task name and `~\.recall-<profile>\gateway.cmd`.

## Normal install vs source checkout

### Normal install (install.sh / npm / pnpm / bun)

If you used `https://recall.ai/install.sh` or `install.ps1`, the CLI was installed with `npm install -g recall@latest`.
Remove it with `npm rm -g recall` (or `pnpm remove -g` / `bun remove -g` if you installed that way).

### Source checkout (git clone)

If you run from a repo checkout (`git clone` + `recall ...` / `bun run recall ...`):

1. Uninstall the gateway service **before** deleting the repo (use the easy path above or manual service removal).
2. Delete the repo directory.
3. Remove state + workspace as shown above.
