#!/usr/bin/env bash
set -euo pipefail

cd /repo

export RECALL_STATE_DIR="/tmp/recall-test"
export RECALL_CONFIG_PATH="${RECALL_STATE_DIR}/recall.json"

echo "==> Build"
pnpm build

echo "==> Seed state"
mkdir -p "${RECALL_STATE_DIR}/credentials"
mkdir -p "${RECALL_STATE_DIR}/agents/main/sessions"
echo '{}' >"${RECALL_CONFIG_PATH}"
echo 'creds' >"${RECALL_STATE_DIR}/credentials/marker.txt"
echo 'session' >"${RECALL_STATE_DIR}/agents/main/sessions/sessions.json"

echo "==> Reset (config+creds+sessions)"
pnpm recall reset --scope config+creds+sessions --yes --non-interactive

test ! -f "${RECALL_CONFIG_PATH}"
test ! -d "${RECALL_STATE_DIR}/credentials"
test ! -d "${RECALL_STATE_DIR}/agents/main/sessions"

echo "==> Recreate minimal config"
mkdir -p "${RECALL_STATE_DIR}/credentials"
echo '{}' >"${RECALL_CONFIG_PATH}"

echo "==> Uninstall (state only)"
pnpm recall uninstall --state --yes --non-interactive

test ! -d "${RECALL_STATE_DIR}"

echo "OK"
