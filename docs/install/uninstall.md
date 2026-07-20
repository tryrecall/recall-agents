---
summary: "Uninstall SteelEngine completely (CLI, service, state, workspace)"
read_when:
  - You want to remove SteelEngine from a machine
  - The gateway service is still running after uninstall
title: "Uninstall"
---

Two paths:

- **Easy path** if `steelengine` is still installed.
- **Manual service removal** if the CLI is gone but the service is still running.

## Easy path (CLI still installed)

Recommended: use the built-in uninstaller:

```bash
steelengine uninstall
```

State removal preserves configured workspace directories unless you also select `--workspace`.

Preview what will be removed (safe):

```bash
steelengine uninstall --dry-run --all
```

Non-interactive (automation / npx). Use with caution and only after confirming scopes:

```bash
steelengine uninstall --all --yes --non-interactive
npx -y steelengine uninstall --all --yes --non-interactive
```

Flags: `--service`, `--state`, `--workspace`, `--app` select individual scopes; `--all` selects all four.

Manual steps (same result):

1. Stop the gateway service:

```bash
steelengine gateway stop
```

2. Uninstall the gateway service (launchd/systemd/schtasks):

```bash
steelengine gateway uninstall
```

3. Delete state + config:

```bash
rm -rf "${STEELENGINE_STATE_DIR:-$HOME/.steelengine}"
```

If you set `STEELENGINE_CONFIG_PATH` to a custom location outside the state dir, delete that file too.
If you want to keep a workspace inside the state dir, such as `~/.steelengine/workspace`, move it aside before running `rm -rf` or delete state contents selectively.

4. Delete your workspace (optional, removes agent files):

```bash
rm -rf ~/.steelengine/workspace
```

5. Remove the CLI install (pick the one you used):

```bash
npm rm -g steelengine
pnpm remove -g steelengine
bun remove -g steelengine
```

6. If you installed the macOS app:

```bash
rm -rf /Applications/SteelEngine.app
```

Notes:

- If you used profiles (`--profile` / `STEELENGINE_PROFILE`), repeat step 3 for each state dir (defaults are `~/.steelengine-<profile>`).
- In remote mode, the state dir lives on the **gateway host**, so run steps 1-4 there too.

## Manual service removal (CLI not installed)

Use this if the gateway service keeps running but `steelengine` is missing.

### macOS (launchd)

Default label is `ai.steelengine.gateway` (or `ai.steelengine.<profile>` with a profile):

```bash
launchctl bootout gui/$UID/ai.steelengine.gateway
rm -f ~/Library/LaunchAgents/ai.steelengine.gateway.plist
```

If you used a profile, replace the label and plist name with `ai.steelengine.<profile>`.

### Linux (systemd user unit)

Default unit name is `steelengine-gateway.service` (or `steelengine-gateway-<profile>.service`). A pre-rename `clawdbot-gateway.service` unit may still exist on machines upgraded from very old installs; `steelengine uninstall` / `steelengine gateway uninstall` detects and removes it automatically.

```bash
systemctl --user disable --now steelengine-gateway.service
rm -f ~/.config/systemd/user/steelengine-gateway.service
systemctl --user daemon-reload
```

### Windows (Scheduled Task)

Default task name is `SteelEngine Gateway` (or `SteelEngine Gateway (<profile>)`).
The task launches a windowless `gateway.vbs` script under your state dir, which in turn
runs `gateway.cmd`; remove both.

```powershell
schtasks /Delete /F /TN "SteelEngine Gateway"
Remove-Item -Force "$env:USERPROFILE\.steelengine\gateway.cmd" -ErrorAction SilentlyContinue
Remove-Item -Force "$env:USERPROFILE\.steelengine\gateway.vbs" -ErrorAction SilentlyContinue
```

If you used a profile, delete the matching task name and the `gateway.cmd` /
`gateway.vbs` files under `~\.steelengine-<profile>`.

## Normal install vs source checkout

### Normal install (install.sh / npm / pnpm / bun)

If you used `https://steelengine.ai/install.sh` or `install.ps1`, the CLI was installed with `npm install -g steelengine@latest`.
Remove it with `npm rm -g steelengine` (or `pnpm remove -g` / `bun remove -g` if you installed that way).

### Source checkout (git clone)

If you run from a repo checkout (`git clone` + `steelengine ...` / `bun run steelengine ...`):

1. Uninstall the gateway service **before** deleting the repo (use the easy path above or manual service removal).
2. Delete the repo directory.
3. Remove state + workspace as shown above.

## Related

- [Install overview](/install)
- [Migration guide](/install/migrating)
