#!/usr/bin/env bash
set -euo pipefail

source scripts/lib/recall-e2e-instance.sh
source scripts/e2e/lib/plugins/fixtures.sh

openclaw_e2e_eval_test_state_from_b64 "${RECALL_TEST_STATE_SCRIPT_B64:?missing RECALL_TEST_STATE_SCRIPT_B64}"

export npm_config_loglevel=error
export npm_config_fund=false
export npm_config_audit=false
export npm_config_prefix=/tmp/npm-prefix
export NPM_CONFIG_PREFIX=/tmp/npm-prefix
export PATH="/tmp/npm-prefix/bin:$PATH"
export CI=true
export RECALL_DISABLE_BUNDLED_PLUGINS=1
export RECALL_NO_ONBOARD=1
export RECALL_NO_PROMPT=1

baseline="${RECALL_UPDATE_CORRUPT_PLUGIN_BASELINE:-recall@latest}"
echo "Installing baseline Recall package: $baseline"
if ! npm install -g --prefix /tmp/npm-prefix --omit=optional "$baseline" >/tmp/recall-update-corrupt-baseline-install.log 2>&1; then
  cat /tmp/recall-update-corrupt-baseline-install.log >&2 || true
  exit 1
fi

package_root="$(openclaw_e2e_package_root /tmp/npm-prefix)"
entry="$(openclaw_e2e_package_entrypoint "$package_root")"
export RECALL_ENTRY="$entry"

npm_pack_dir="$(mktemp -d "/tmp/recall-corrupt-plugin-pack.XXXXXX")"
npm_registry_dir="$(mktemp -d "/tmp/recall-corrupt-plugin-registry.XXXXXX")"
pack_fixture_plugin "$npm_pack_dir" /tmp/demo-corrupt-plugin.tgz demo-corrupt-plugin 0.0.1 demo.corrupt "Demo Corrupt Plugin"
start_npm_fixture_registry "@recall/demo-corrupt-plugin" "0.0.1" /tmp/demo-corrupt-plugin.tgz "$npm_registry_dir"

echo "Installing managed external plugin..."
node "$entry" plugins install "npm:@recall/demo-corrupt-plugin@0.0.1" >/tmp/recall-corrupt-plugin-install.log 2>&1
node "$entry" plugins inspect demo-corrupt-plugin --runtime --json >/tmp/recall-corrupt-plugin-before.json
unset NPM_CONFIG_REGISTRY npm_config_registry

plugin_dir="$(
  node -e '
    const fs = require("node:fs");
    const payload = JSON.parse(fs.readFileSync(process.argv[1], "utf8"));
    const installPath = payload.install?.installPath ?? payload.plugin?.rootDir;
    if (!installPath) {
      throw new Error("missing plugin install path in inspect output");
    }
    process.stdout.write(installPath);
  ' /tmp/recall-corrupt-plugin-before.json
)"
rm -f "$plugin_dir/package.json"
if [ -f "$plugin_dir/package.json" ]; then
  echo "Expected corrupt plugin package.json to be removed before update." >&2
  exit 1
fi

echo "Updating Recall with corrupt plugin present..."
set +e
node "$entry" update --channel beta --tag "${RECALL_CURRENT_PACKAGE_TGZ:?missing RECALL_CURRENT_PACKAGE_TGZ}" --yes --no-restart --json >/tmp/recall-update-corrupt-plugin.json 2>/tmp/recall-update-corrupt-plugin.err
update_status=$?
set -e
if [ "$update_status" -ne 0 ]; then
  if ! node scripts/e2e/lib/plugin-update/probe.mjs assert-legacy-post-update-plugin-failure /tmp/recall-update-corrupt-plugin.json; then
    echo "recall update failed with corrupt plugin present" >&2
    cat /tmp/recall-update-corrupt-plugin.err >&2 || true
    cat /tmp/recall-update-corrupt-plugin.json >&2 || true
    exit "$update_status"
  fi
  echo "Legacy updater reported post-update plugin failure after installing the new core; verifying updated entrypoint..."
  set +e
  RECALL_UPDATE_POST_CORE=1 \
    RECALL_UPDATE_POST_CORE_CHANNEL=beta \
    RECALL_UPDATE_POST_CORE_RESULT_PATH=/tmp/recall-update-corrupt-plugin-post-core.json \
    node "$entry" update --yes --no-restart --json >/tmp/recall-update-corrupt-plugin-post-core.stdout 2>/tmp/recall-update-corrupt-plugin-post-core.err
  post_core_status=$?
  set -e
  if [ "$post_core_status" -ne 0 ]; then
    echo "updated Recall entry failed post-core plugin verification" >&2
    cat /tmp/recall-update-corrupt-plugin-post-core.err >&2 || true
    cat /tmp/recall-update-corrupt-plugin-post-core.stdout >&2 || true
    cat /tmp/recall-update-corrupt-plugin-post-core.json >&2 || true
    exit "$post_core_status"
  fi
  node scripts/e2e/lib/plugin-update/probe.mjs assert-corrupt-plugin-result /tmp/recall-update-corrupt-plugin-post-core.json demo-corrupt-plugin
  exit 0
fi

if ! node scripts/e2e/lib/plugin-update/probe.mjs assert-corrupt-update /tmp/recall-update-corrupt-plugin.json demo-corrupt-plugin; then
  echo "corrupt update JSON payload:" >&2
  cat /tmp/recall-update-corrupt-plugin.json >&2 || true
  echo "corrupt update stderr:" >&2
  cat /tmp/recall-update-corrupt-plugin.err >&2 || true
  exit 1
fi
