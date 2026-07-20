#!/usr/bin/env bash
# Verifies status/doctor UX for a configured plugin channel whose setup entry
# fails because a staged dependency tree is corrupt.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
TMP_DIR="$(mktemp -d "${TMPDIR:-/tmp}/steelengine-status-corrupt-plugin-deps.XXXXXX")"
cleanup() {
  rm -rf "$TMP_DIR"
}
trap cleanup EXIT

HOME_DIR="$TMP_DIR/home"
STATE_DIR="$TMP_DIR/state"
CONFIG_PATH="$TMP_DIR/steelengine.json"
PLUGIN_DIR="$TMP_DIR/plugin"
STAGE_DIR="$TMP_DIR/stage"
mkdir -p "$HOME_DIR" "$STATE_DIR" "$PLUGIN_DIR" "$STAGE_DIR/node_modules/ansi-escapes"
printf "corrupt rename residue\n" > "$STAGE_DIR/node_modules/ansi-escapes/.steelengine-rename-tmp"

cat > "$PLUGIN_DIR/package.json" <<'JSON'
{
  "name": "@example/steelengine-e2e-corrupt-chat",
  "version": "1.0.0",
  "steelengine": {
    "extensions": ["./index.cjs"],
    "setupEntry": "./setup-entry.cjs"
  }
}
JSON

cat > "$PLUGIN_DIR/steelengine.plugin.json" <<'JSON'
{
  "id": "e2e-corrupt-chat",
  "configSchema": {
    "type": "object",
    "additionalProperties": false,
    "properties": {}
  },
  "channelConfigs": {
    "e2e-corrupt-chat": {
      "label": "E2E Corrupt Chat",
      "description": "E2E corrupt dependency fixture",
      "schema": {
        "type": "object",
        "additionalProperties": false,
        "properties": {
          "enabled": { "type": "boolean" },
          "token": { "type": "string" }
        }
      }
    }
  },
  "channels": ["e2e-corrupt-chat"],
  "channelEnvVars": {
    "e2e-corrupt-chat": ["E2E_CORRUPT_CHAT_TOKEN"]
  }
}
JSON

cat > "$PLUGIN_DIR/index.cjs" <<'JS'
module.exports = {
  id: "e2e-corrupt-chat",
  register() {}
};
JS

cat > "$PLUGIN_DIR/setup-entry.cjs" <<'JS'
const fs = require("node:fs");
const path = require("node:path");

const stageDir = process.env.STEELENGINE_PLUGIN_STAGE_DIR || "";
const renameResidue = path.join(stageDir, "node_modules", "ansi-escapes", ".steelengine-rename-tmp");
if (fs.existsSync(renameResidue)) {
  const err = new Error("ENOTEMPTY: directory not empty, rename 'ansi-escapes'");
  err.code = "ENOTEMPTY";
  throw err;
}

const plugin = {
  id: "e2e-corrupt-chat",
  meta: {
    id: "e2e-corrupt-chat",
    label: "E2E Corrupt Chat",
    selectionLabel: "E2E Corrupt Chat",
    docsPath: "/channels/e2e-corrupt-chat",
    blurb: "E2E corrupt dependency fixture"
  },
  capabilities: { chatTypes: ["direct"] },
  config: {
    listAccountIds: () => ["default"],
    resolveAccount: () => ({ accountId: "default", token: "configured" }),
    isEnabled: () => true,
    isConfigured: () => true,
    hasConfiguredState: () => true
  },
  outbound: { deliveryMode: "direct" }
};

module.exports = { plugin };
JS

cat > "$CONFIG_PATH" <<JSON
{
  "gateway": { "mode": "local" },
  "plugins": {
    "enabled": true,
    "load": { "paths": ["$PLUGIN_DIR"] },
    "allow": ["e2e-corrupt-chat"]
  },
  "channels": {
    "e2e-corrupt-chat": { "enabled": true, "token": "configured" }
  }
}
JSON

run_steelengine() {
  HOME="$HOME_DIR" \
  STEELENGINE_HOME="$STATE_DIR" \
  STEELENGINE_STATE_DIR="$STATE_DIR" \
  STEELENGINE_CONFIG_PATH="$CONFIG_PATH" \
  STEELENGINE_PLUGIN_STAGE_DIR="$STAGE_DIR" \
  STEELENGINE_DISABLE_BUNDLED_PLUGINS=1 \
  STEELENGINE_NO_ONBOARD=1 \
  STEELENGINE_NO_PROMPT=1 \
  STEELENGINE_SKIP_CHANNELS=1 \
  STEELENGINE_SKIP_PROVIDERS=1 \
  COREPACK_ENABLE_DOWNLOAD_PROMPT=0 \
  NO_COLOR=1 \
    node "$ROOT_DIR/scripts/run-node.mjs" "$@"
}

BEFORE="$TMP_DIR/status-before.txt"
DOCTOR="$TMP_DIR/doctor.txt"
AFTER="$TMP_DIR/status-after.txt"

run_steelengine status --all --timeout 1 > "$BEFORE"
grep -F "e2e-corrupt-chat" "$BEFORE" >/dev/null
grep -F "plugin load failed: dependency tree corrupted; run steelengine doctor --fix" "$BEFORE" >/dev/null

run_steelengine doctor --fix --non-interactive --yes > "$DOCTOR"
if [[ -e "$STAGE_DIR" ]]; then
  echo "doctor --fix did not remove corrupt plugin stage dir: $STAGE_DIR" >&2
  exit 1
fi

run_steelengine status --all --timeout 1 > "$AFTER"
grep -F "E2E Corrupt Chat" "$AFTER" >/dev/null
if grep -F "plugin load failed: dependency tree corrupted" "$AFTER" >/dev/null; then
  echo "status still reports corrupt plugin dependency tree after doctor --fix" >&2
  exit 1
fi

echo "Status corrupt plugin dependency E2E passed."
