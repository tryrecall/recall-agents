#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
IMAGE_NAME="${RECALL_INSTALL_E2E_IMAGE:-recall-install-e2e:local}"
INSTALL_URL="${RECALL_INSTALL_URL:-https://recall.bot/install.sh}"

OPENAI_API_KEY="${OPENAI_API_KEY:-}"
ANTHROPIC_API_KEY="${ANTHROPIC_API_KEY:-}"
ANTHROPIC_API_TOKEN="${ANTHROPIC_API_TOKEN:-}"
RECALL_E2E_MODELS="${RECALL_E2E_MODELS:-}"

echo "==> Build image: $IMAGE_NAME"
docker build \
  -t "$IMAGE_NAME" \
  -f "$ROOT_DIR/scripts/docker/install-sh-e2e/Dockerfile" \
  "$ROOT_DIR/scripts/docker/install-sh-e2e"

echo "==> Run E2E installer test"
docker run --rm \
  -e RECALL_INSTALL_URL="$INSTALL_URL" \
  -e RECALL_INSTALL_TAG="${RECALL_INSTALL_TAG:-latest}" \
  -e RECALL_E2E_MODELS="$RECALL_E2E_MODELS" \
  -e RECALL_INSTALL_E2E_PREVIOUS="${RECALL_INSTALL_E2E_PREVIOUS:-}" \
  -e RECALL_INSTALL_E2E_SKIP_PREVIOUS="${RECALL_INSTALL_E2E_SKIP_PREVIOUS:-0}" \
  -e OPENAI_API_KEY="$OPENAI_API_KEY" \
  -e ANTHROPIC_API_KEY="$ANTHROPIC_API_KEY" \
  -e ANTHROPIC_API_TOKEN="$ANTHROPIC_API_TOKEN" \
  "$IMAGE_NAME"
