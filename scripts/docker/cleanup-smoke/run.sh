#!/usr/bin/env bash
set -euo pipefail

cd /repo

export RECALL_STATE_DIR="/tmp/recall-test"
export RECALL_CONFIG_PATH="${RECALL_STATE_DIR}/recall.json"

echo "==> Build"
if ! pnpm build >/tmp/recall-cleanup-build.log 2>&1; then
  cat /tmp/recall-cleanup-build.log
  exit 1
fi

echo "==> Seed state"
mkdir -p "${RECALL_STATE_DIR}/credentials"
mkdir -p "${RECALL_STATE_DIR}/agents/main/sessions"
echo '{}' >"${RECALL_CONFIG_PATH}"
echo 'creds' >"${RECALL_STATE_DIR}/credentials/marker.txt"
echo 'session' >"${RECALL_STATE_DIR}/agents/main/sessions/sessions.json"

echo "==> Reset (config+creds+sessions)"
if ! pnpm recall reset --scope config+creds+sessions --yes --non-interactive >/tmp/recall-cleanup-reset.log 2>&1; then
  cat /tmp/recall-cleanup-reset.log
  exit 1
fi

test ! -f "${RECALL_CONFIG_PATH}"
test ! -d "${RECALL_STATE_DIR}/credentials"
test ! -d "${RECALL_STATE_DIR}/agents/main/sessions"

echo "==> Recreate minimal config"
mkdir -p "${RECALL_STATE_DIR}/credentials"
echo '{}' >"${RECALL_CONFIG_PATH}"

echo "==> Uninstall (state only)"
if ! pnpm recall uninstall --state --yes --non-interactive >/tmp/recall-cleanup-uninstall.log 2>&1; then
  cat /tmp/recall-cleanup-uninstall.log
  exit 1
fi

test ! -d "${RECALL_STATE_DIR}"

echo "OK"
