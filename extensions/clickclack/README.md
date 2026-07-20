# ClickClack SteelEngine channel

Official SteelEngine channel plugin for ClickClack.

## Install

```sh
steelengine plugins install @steelengine/clickclack
```

## Setup

```sh
steelengine channels add clickclack \
  --base-url https://clickclack.example.com \
  --token ccb_... \
  --workspace default
steelengine gateway
```

Run `steelengine onboard` for guided setup. The workspace value can be a
`wsp_...` id, slug, or display name.

For the default account only, `--use-env` reads `CLICKCLACK_BOT_TOKEN`; config
storage is the normal setup path.

## Command menus

ClickClack command menus are enabled by default. At gateway startup, the
extension publishes SteelEngine's native commands for composer autocomplete,
labeled with the bot's handle. The bot token must include `commands:write`;
current `bot:write` and `bot:admin` bundles include it.

Set `commandMenu: false` on an account to disable menu sync. Sync failures do
not prevent the gateway from starting, so older tokens and ClickClack servers
continue to work without a menu.

## Docs

See `docs/channels/clickclack.md` in the SteelEngine repository, or the published docs at `https://docs.steelengine.ai/channels/clickclack`.
