#!/usr/bin/env bash
set -euo pipefail

SCRIPT_ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ROOT_DIR="${STEELENGINE_LIVE_DOCKER_REPO_ROOT:-$SCRIPT_ROOT_DIR}"
ROOT_DIR="$(cd "$ROOT_DIR" && pwd)"
TRUSTED_HARNESS_DIR="${STEELENGINE_LIVE_DOCKER_TRUSTED_HARNESS_DIR:-${STEELENGINE_LIVE_CODEX_TRUSTED_HARNESS_DIR:-$SCRIPT_ROOT_DIR}}"
if [[ -z "$TRUSTED_HARNESS_DIR" || ! -d "$TRUSTED_HARNESS_DIR" ]]; then
  echo "ERROR: trusted Codex harness directory not found: ${TRUSTED_HARNESS_DIR:-<empty>}." >&2
  exit 1
fi
TRUSTED_HARNESS_DIR="$(cd "$TRUSTED_HARNESS_DIR" && pwd)"
source "$TRUSTED_HARNESS_DIR/scripts/lib/live-docker-auth.sh"
IMAGE_NAME="${STEELENGINE_IMAGE:-steelengine:local}"
LIVE_IMAGE_NAME="${STEELENGINE_LIVE_IMAGE:-${IMAGE_NAME}-live}"
CONFIG_DIR="${STEELENGINE_CONFIG_DIR:-$HOME/.steelengine}"
WORKSPACE_DIR="${STEELENGINE_WORKSPACE_DIR:-$HOME/.steelengine/workspace}"
PROFILE_FILE="$(steelengine_live_default_profile_file)"
CODEX_HARNESS_AUTH_MODE="${STEELENGINE_LIVE_CODEX_HARNESS_AUTH:-codex-auth}"
CODEX_CLI_PACKAGE_SPEC="${STEELENGINE_LIVE_CODEX_CLI_PACKAGE_SPEC:-}"
CODEX_HARNESS_SETUP_TIMEOUT_SECONDS="$(steelengine_live_read_positive_int_env STEELENGINE_LIVE_CODEX_HARNESS_SETUP_TIMEOUT_SECONDS 180)"
CODEX_HARNESS_TARGET_COUNT=1
if [[ -n "${STEELENGINE_LIVE_CODEX_HARNESS_TARGETS:-}" ]]; then
  IFS=',' read -r -a CODEX_HARNESS_TARGET_ITEMS <<<"$STEELENGINE_LIVE_CODEX_HARNESS_TARGETS"
  CODEX_HARNESS_TARGET_COUNT="${#CODEX_HARNESS_TARGET_ITEMS[@]}"
fi
# Each target starts an isolated 15-minute Vitest suite. Preserve the old
# 35-minute single-target budget while scaling matrix runs linearly.
CODEX_HARNESS_DOCKER_RUN_TIMEOUT="${STEELENGINE_LIVE_CODEX_HARNESS_DOCKER_RUN_TIMEOUT:-$((2100 * CODEX_HARNESS_TARGET_COUNT))s}"
TEMP_DIRS=()
DOCKER_USER="${STEELENGINE_DOCKER_USER:-node}"
DOCKER_HOME_MOUNT=()
DOCKER_TRUSTED_HARNESS_MOUNT=()
DOCKER_TRUSTED_HARNESS_CONTAINER_DIR=""
DOCKER_CACHE_CONTAINER_DIR="/tmp/steelengine-cache"
DOCKER_CLI_TOOLS_CONTAINER_DIR="/tmp/steelengine-npm-global"
DOCKER_EXTRA_ENV_FILES=()
DOCKER_AUTH_PRESTAGED=0

steelengine_live_codex_harness_is_ci() {
  steelengine_live_is_ci
}

steelengine_live_codex_harness_append_build_extension() {
  local extension="${1:?extension required}"
  local current="${STEELENGINE_DOCKER_BUILD_EXTENSIONS:-${STEELENGINE_EXTENSIONS:-}}"
  case " $current " in
    *" $extension "*)
      ;;
    *)
      export STEELENGINE_DOCKER_BUILD_EXTENSIONS="${current:+$current }$extension"
      ;;
  esac
}

case "$CODEX_HARNESS_AUTH_MODE" in
  codex-auth | api-key)
    ;;
  *)
    echo "ERROR: STEELENGINE_LIVE_CODEX_HARNESS_AUTH must be one of: codex-auth, api-key." >&2
    exit 1
    ;;
esac

if [[ -f "$PROFILE_FILE" && -r "$PROFILE_FILE" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "$PROFILE_FILE"
  set +a
fi

if [[ "$CODEX_HARNESS_AUTH_MODE" == "api-key" && -z "${OPENAI_API_KEY:-}" ]]; then
  echo "ERROR: STEELENGINE_LIVE_CODEX_HARNESS_AUTH=api-key requires OPENAI_API_KEY." >&2
  exit 1
fi
if [[ "$CODEX_HARNESS_AUTH_MODE" != "api-key" && ! -s "$HOME/.codex/auth.json" ]]; then
  echo "ERROR: STEELENGINE_LIVE_CODEX_HARNESS_AUTH=codex-auth requires ~/.codex/auth.json before building the live Docker image." >&2
  if [[ -n "${OPENAI_API_KEY:-}" ]]; then
    echo "If this is a Testbox/API-key run, set STEELENGINE_LIVE_CODEX_HARNESS_AUTH=api-key and run through steelengine-testbox-env." >&2
  fi
  exit 1
fi
if [[ -z "$CODEX_CLI_PACKAGE_SPEC" ]]; then
  CODEX_CLI_PACKAGE_SPEC="$(
    node -e '
      const pkg = require(process.argv[1]);
      const version = pkg.dependencies?.["@openai/codex"];
      if (!version || typeof version !== "string") process.exit(1);
      process.stdout.write(`@openai/codex@${version}`);
    ' "$ROOT_DIR/extensions/codex/package.json"
  )"
fi

cleanup_temp_dirs() {
  if ((${#TEMP_DIRS[@]} > 0)); then
    rm -rf "${TEMP_DIRS[@]}"
  fi
}
trap cleanup_temp_dirs EXIT

if [[ -n "${STEELENGINE_DOCKER_CLI_TOOLS_DIR:-}" ]]; then
  CLI_TOOLS_DIR="${STEELENGINE_DOCKER_CLI_TOOLS_DIR}"
elif steelengine_live_codex_harness_is_ci; then
  CLI_TOOLS_DIR="$(mktemp -d "${RUNNER_TEMP:-/tmp}/steelengine-docker-cli-tools.XXXXXX")"
  TEMP_DIRS+=("$CLI_TOOLS_DIR")
else
  CLI_TOOLS_DIR="$HOME/.cache/steelengine/docker-cli-tools"
fi
if [[ -n "${STEELENGINE_DOCKER_CACHE_HOME_DIR:-}" ]]; then
  CACHE_HOME_DIR="${STEELENGINE_DOCKER_CACHE_HOME_DIR}"
elif steelengine_live_codex_harness_is_ci; then
  CACHE_HOME_DIR="$(mktemp -d "${RUNNER_TEMP:-/tmp}/steelengine-docker-cache.XXXXXX")"
  TEMP_DIRS+=("$CACHE_HOME_DIR")
else
  CACHE_HOME_DIR="$HOME/.cache/steelengine/docker-cache"
fi

steelengine_live_prepare_bind_dir_for_container_user "$CLI_TOOLS_DIR"
steelengine_live_prepare_bind_dir_for_container_user "$CACHE_HOME_DIR"
if steelengine_live_uses_managed_bind_dirs; then
  DOCKER_USER="$(id -u):$(id -g)"
  DOCKER_HOME_DIR="$(mktemp -d "${RUNNER_TEMP:-/tmp}/steelengine-docker-home.XXXXXX")"
  TEMP_DIRS+=("$DOCKER_HOME_DIR")
  steelengine_live_prepare_bind_dir_for_container_user "$DOCKER_HOME_DIR"
  DOCKER_HOME_MOUNT=(-v "$DOCKER_HOME_DIR":/home/node)
fi
if [[ "$CODEX_HARNESS_AUTH_MODE" == "api-key" ]]; then
  if [[ -z "${DOCKER_HOME_DIR:-}" ]]; then
    DOCKER_HOME_DIR="$(mktemp -d "${RUNNER_TEMP:-/tmp}/steelengine-docker-home.XXXXXX")"
    TEMP_DIRS+=("$DOCKER_HOME_DIR")
    steelengine_live_prepare_bind_dir_for_container_user "$DOCKER_HOME_DIR"
    DOCKER_HOME_MOUNT=(-v "$DOCKER_HOME_DIR":/home/node)
  fi
  CONFIG_DIR="$(mktemp -d "${RUNNER_TEMP:-/tmp}/steelengine-docker-config.XXXXXX")"
  WORKSPACE_DIR="$(mktemp -d "${RUNNER_TEMP:-/tmp}/steelengine-docker-workspace.XXXXXX")"
  TEMP_DIRS+=("$CONFIG_DIR" "$WORKSPACE_DIR")
  chmod 0777 "$DOCKER_HOME_DIR" "$CONFIG_DIR" "$WORKSPACE_DIR" || true
  DOCKER_CACHE_CONTAINER_DIR="/home/node/.cache"
  DOCKER_CLI_TOOLS_CONTAINER_DIR="/home/node/.npm-global"
fi

PROFILE_MOUNT=()
PROFILE_STATUS="none"
if [[ "$CODEX_HARNESS_AUTH_MODE" != "api-key" && -f "$PROFILE_FILE" && -r "$PROFILE_FILE" ]]; then
  if [[ -n "${DOCKER_HOME_DIR:-}" ]]; then
    steelengine_live_stage_profile_into_home "$DOCKER_HOME_DIR" "$PROFILE_FILE"
  else
    PROFILE_MOUNT=(-v "$PROFILE_FILE":/home/node/.profile:ro)
  fi
  PROFILE_STATUS="$PROFILE_FILE"
elif [[ "$CODEX_HARNESS_AUTH_MODE" == "api-key" ]]; then
  PROFILE_STATUS="api-key-env"
fi

DOCKER_TRUSTED_HARNESS_CONTAINER_DIR="/trusted-harness"
DOCKER_TRUSTED_HARNESS_MOUNT=(-v "$TRUSTED_HARNESS_DIR":"$DOCKER_TRUSTED_HARNESS_CONTAINER_DIR":ro)

AUTH_FILES=()
if [[ "$CODEX_HARNESS_AUTH_MODE" != "api-key" ]]; then
  while IFS= read -r auth_file; do
    [[ -n "$auth_file" ]] || continue
    AUTH_FILES+=("$auth_file")
  done < <(steelengine_live_collect_auth_files_from_csv "openai")
fi

AUTH_FILES_CSV=""
if ((${#AUTH_FILES[@]} > 0)); then
  AUTH_FILES_CSV="$(steelengine_live_join_csv "${AUTH_FILES[@]}")"
fi

if [[ -n "${DOCKER_HOME_DIR:-}" ]]; then
  steelengine_live_stage_auth_into_home "$DOCKER_HOME_DIR" --files "${AUTH_FILES[@]}"
  DOCKER_AUTH_PRESTAGED=1
fi

EXTERNAL_AUTH_MOUNTS=()
if ((${#AUTH_FILES[@]} > 0)); then
  for auth_file in "${AUTH_FILES[@]}"; do
    auth_file="$(steelengine_live_validate_relative_home_path "$auth_file")"
    host_path="$HOME/$auth_file"
    if [[ -f "$host_path" ]]; then
      EXTERNAL_AUTH_MOUNTS+=(-v "$host_path":/host-auth-files/"$auth_file":ro)
    fi
  done
fi

DOCKER_AUTH_ENV=()
if [[ "$CODEX_HARNESS_AUTH_MODE" == "api-key" ]]; then
  docker_env_dir="$(mktemp -d "${RUNNER_TEMP:-/tmp}/steelengine-codex-harness-env.XXXXXX")"
  TEMP_DIRS+=("$docker_env_dir")
  docker_env_file="$docker_env_dir/openai.env"
  {
    printf 'OPENAI_API_KEY=%s\n' "${OPENAI_API_KEY}"
    printf 'CODEX_API_KEY=%s\n' "${CODEX_API_KEY:-$OPENAI_API_KEY}"
    if [[ -n "${OPENAI_BASE_URL:-}" ]]; then
      printf 'OPENAI_BASE_URL=%s\n' "${OPENAI_BASE_URL}"
    fi
  } >"$docker_env_file"
  DOCKER_EXTRA_ENV_FILES+=(--env-file "$docker_env_file")
fi

read -r -d '' LIVE_TEST_CMD <<'EOF' || true
set -euo pipefail
[ -f "$HOME/.profile" ] && [ -r "$HOME/.profile" ] && source "$HOME/.profile" || true
export NPM_CONFIG_PREFIX="${NPM_CONFIG_PREFIX:-$HOME/.npm-global}"
export npm_config_prefix="$NPM_CONFIG_PREFIX"
export XDG_CACHE_HOME="${XDG_CACHE_HOME:-$HOME/.cache}"
export COREPACK_HOME="${COREPACK_HOME:-$XDG_CACHE_HOME/node/corepack}"
export NPM_CONFIG_CACHE="${NPM_CONFIG_CACHE:-$XDG_CACHE_HOME/npm}"
export npm_config_cache="$NPM_CONFIG_CACHE"
cleanup_codex_live_mounts() {
  chmod -R a+rwX "$HOME" "$NPM_CONFIG_PREFIX" "$XDG_CACHE_HOME" 2>/dev/null || true
}
trap cleanup_codex_live_mounts EXIT
if [ "${STEELENGINE_LIVE_CODEX_HARNESS_DEBUG:-}" = "1" ]; then
  id
  mount | grep -E 'steelengine-cache|steelengine-npm|/home/node' || true
  ls -ld "$HOME" "$XDG_CACHE_HOME" "$NPM_CONFIG_PREFIX" 2>/dev/null || true
fi
# Force the Codex harness to use the staged `~/.codex` auth files. This lane
# is not meant to exercise raw OpenAI API-key routing unless the lane
# explicitly opts into API-key auth for CI.
if [ "${STEELENGINE_LIVE_CODEX_HARNESS_AUTH:-codex-auth}" != "api-key" ]; then
  unset OPENAI_API_KEY OPENAI_BASE_URL
fi
mkdir -p "$NPM_CONFIG_PREFIX" "$XDG_CACHE_HOME" "$COREPACK_HOME" "$NPM_CONFIG_CACHE"
chmod 700 "$XDG_CACHE_HOME" "$COREPACK_HOME" "$NPM_CONFIG_CACHE" || true
export PATH="$NPM_CONFIG_PREFIX/bin:$PATH"
run_setup_command() {
  local timeout_value="${STEELENGINE_LIVE_CODEX_HARNESS_SETUP_TIMEOUT_SECONDS:?missing live Codex harness setup timeout seconds}s"
  local timeout_bin=""
  if command -v timeout >/dev/null 2>&1; then
    timeout_bin="timeout"
  elif command -v gtimeout >/dev/null 2>&1; then
    timeout_bin="gtimeout"
  else
    echo "timeout command not found; cannot bound live Codex harness setup after ${timeout_value}" >&2
    return 127
  fi
  if "$timeout_bin" --kill-after=1s 1s true >/dev/null 2>&1; then
    "$timeout_bin" --kill-after=30s "$timeout_value" "$@"
  else
    "$timeout_bin" "$timeout_value" "$@"
  fi
}
if [ "${STEELENGINE_DOCKER_AUTH_PRESTAGED:-0}" != "1" ]; then
  IFS=',' read -r -a auth_files <<<"${STEELENGINE_DOCKER_AUTH_FILES_RESOLVED:-}"
  if ((${#auth_files[@]} > 0)); then
    for auth_file in "${auth_files[@]}"; do
      [ -n "$auth_file" ] || continue
      if [ -f "/host-auth-files/$auth_file" ]; then
        mkdir -p "$(dirname "$HOME/$auth_file")"
        cp "/host-auth-files/$auth_file" "$HOME/$auth_file"
        chmod u+rw "$HOME/$auth_file" || true
      fi
    done
  fi
fi
if [ "${STEELENGINE_LIVE_CODEX_HARNESS_AUTH:-codex-auth}" != "api-key" ] && [ ! -s "$HOME/.codex/auth.json" ]; then
  echo "ERROR: missing ~/.codex/auth.json for Codex harness live test." >&2
  exit 1
fi
trusted_scripts_dir="${STEELENGINE_LIVE_DOCKER_SCRIPTS_DIR:-/src/scripts}"
if [ "${STEELENGINE_LIVE_CODEX_HARNESS_AUTH:-codex-auth}" != "api-key" ]; then
  node --import tsx "$trusted_scripts_dir/prepare-codex-ci-auth.ts" "$HOME/.codex/auth.json"
fi
run_setup_command npm install -g "$STEELENGINE_LIVE_CODEX_CLI_PACKAGE_SPEC"
"$NPM_CONFIG_PREFIX/bin/codex" --version
if [ "${STEELENGINE_LIVE_CODEX_HARNESS_AUTH:-codex-auth}" = "api-key" ]; then
  printf '%s\n' "$OPENAI_API_KEY" | "$NPM_CONFIG_PREFIX/bin/codex" login --with-api-key >/dev/null
fi
tmp_dir="$(mktemp -d)"
source "$trusted_scripts_dir/lib/live-docker-stage.sh"
steelengine_live_stage_source_tree "$tmp_dir"
steelengine_live_stage_node_modules "$tmp_dir"
steelengine_live_link_runtime_tree "$tmp_dir"
if [ -d /app/dist-runtime/extensions/codex ]; then
  export STEELENGINE_BUNDLED_PLUGINS_DIR=/app/dist-runtime/extensions
elif [ -d /app/dist/extensions/codex ]; then
  export STEELENGINE_BUNDLED_PLUGINS_DIR=/app/dist/extensions
elif [ -f "$tmp_dir/extensions/codex/steelengine.plugin.json" ]; then
  export STEELENGINE_BUNDLED_PLUGINS_DIR="$tmp_dir/extensions"
else
  echo "ERROR: staged Codex plugin not found for live harness." >&2
  exit 1
fi
steelengine_live_stage_state_dir "$tmp_dir/.steelengine-state"
if [ -n "${STEELENGINE_LIVE_CODEX_TRUSTED_HARNESS_DIR:-}" ] && [ -d "$STEELENGINE_LIVE_CODEX_TRUSTED_HARNESS_DIR" ]; then
  for harness_file in src/gateway/gateway-codex-harness.live-helpers.ts; do
    if [ -f "$STEELENGINE_LIVE_CODEX_TRUSTED_HARNESS_DIR/$harness_file" ]; then
      mkdir -p "$(dirname "$tmp_dir/$harness_file")"
      cp "$STEELENGINE_LIVE_CODEX_TRUSTED_HARNESS_DIR/$harness_file" "$tmp_dir/$harness_file"
    fi
  done
fi
steelengine_live_prepare_staged_config
cd "$tmp_dir"
if [ "${STEELENGINE_LIVE_CODEX_HARNESS_USE_CI_SAFE_CODEX_CONFIG:-1}" = "1" ]; then
  node --import tsx "$trusted_scripts_dir/prepare-codex-ci-config.ts" "$HOME/.codex/config.toml" "$tmp_dir"
fi
codex_preflight_log="$tmp_dir/codex-preflight.log"
codex_preflight_token="CODEX-PREFLIGHT-OK"
if ! "$NPM_CONFIG_PREFIX/bin/codex" exec \
  --json \
  --color never \
  --skip-git-repo-check \
  "Reply exactly: $codex_preflight_token" >"$codex_preflight_log" 2>&1; then
  if grep -q "Failed to extract accountId from token" "$codex_preflight_log"; then
    echo "ERROR: Codex auth cannot extract accountId from the available token; refresh STEELENGINE_CODEX_AUTH_JSON or use STEELENGINE_LIVE_CODEX_HARNESS_AUTH=api-key." >&2
    exit 1
  fi
  tail -c 262144 "$codex_preflight_log" >&2 || true
  exit 1
fi
run_codex_harness_target() {
  local model="${1:?model required}"
  local thinking="${2:?thinking required}"
  export STEELENGINE_LIVE_CODEX_HARNESS_MODEL="$model"
  export STEELENGINE_LIVE_CODEX_HARNESS_THINKING="$thinking"
  echo "==> Codex harness target: model=$model thinking=$thinking"
  node scripts/test-live.mjs -- ${STEELENGINE_LIVE_CODEX_TEST_FILES:-src/gateway/gateway-codex-harness.live.test.ts}
}
if [ -n "${STEELENGINE_LIVE_CODEX_HARNESS_TARGETS:-}" ]; then
  IFS=',' read -r -a harness_targets <<<"$STEELENGINE_LIVE_CODEX_HARNESS_TARGETS"
  for harness_target in "${harness_targets[@]}"; do
    model="${harness_target%%=*}"
    thinking="${harness_target##*=}"
    if [ -z "$model" ] || [ -z "$thinking" ] || [ "$model" = "$thinking" ]; then
      echo "ERROR: invalid Codex harness target '$harness_target'; expected provider/model=thinking." >&2
      exit 1
    fi
    run_codex_harness_target "$model" "$thinking"
  done
else
  run_codex_harness_target \
    "${STEELENGINE_LIVE_CODEX_HARNESS_MODEL:-openai/gpt-5.6-luna}" \
    "${STEELENGINE_LIVE_CODEX_HARNESS_THINKING:-low}"
fi
EOF

steelengine_live_codex_harness_append_build_extension codex
# The release package image intentionally excludes externalized plugins such as
# Codex. This lane must rebuild the live image so the plugin-owned harness is
# present under the bundled plugin runtime directory.
STEELENGINE_SKIP_DOCKER_BUILD=0
export STEELENGINE_SKIP_DOCKER_BUILD
STEELENGINE_LIVE_DOCKER_REPO_ROOT="$ROOT_DIR" "$TRUSTED_HARNESS_DIR/scripts/test-live-build-docker.sh"
if steelengine_live_uses_managed_bind_dirs; then
  steelengine_live_chown_bind_dirs_for_container_user \
    "$LIVE_IMAGE_NAME" \
    "$DOCKER_USER" \
    "$CLI_TOOLS_DIR" \
    "$CACHE_HOME_DIR" \
    "$CONFIG_DIR" \
    "$WORKSPACE_DIR" \
    "${DOCKER_HOME_DIR:-}"
fi

echo "==> Run Codex harness live test in Docker"
echo "==> Model: ${STEELENGINE_LIVE_CODEX_HARNESS_MODEL:-openai/gpt-5.6-luna}"
echo "==> Thinking: ${STEELENGINE_LIVE_CODEX_HARNESS_THINKING:-low}"
echo "==> Expected native effort: ${STEELENGINE_LIVE_CODEX_HARNESS_EXPECTED_EFFORT:-auto}"
echo "==> Targets: ${STEELENGINE_LIVE_CODEX_HARNESS_TARGETS:-single model}"
echo "==> Target count: $CODEX_HARNESS_TARGET_COUNT"
echo "==> Docker run timeout: $CODEX_HARNESS_DOCKER_RUN_TIMEOUT"
echo "==> Chat image probe: ${STEELENGINE_LIVE_CODEX_HARNESS_CHAT_IMAGE_PROBE:-0}"
echo "==> Image probe: ${STEELENGINE_LIVE_CODEX_HARNESS_IMAGE_PROBE:-1}"
echo "==> MCP probe: ${STEELENGINE_LIVE_CODEX_HARNESS_MCP_PROBE:-1}"
echo "==> Subagent probe: ${STEELENGINE_LIVE_CODEX_HARNESS_SUBAGENT_PROBE:-1}"
echo "==> Subagent count: ${STEELENGINE_LIVE_CODEX_HARNESS_SUBAGENT_COUNT:-1}"
echo "==> Subagent-only fast path: ${STEELENGINE_LIVE_CODEX_HARNESS_SUBAGENT_ONLY:-auto}"
echo "==> Guardian probe: ${STEELENGINE_LIVE_CODEX_HARNESS_GUARDIAN_PROBE:-1}"
echo "==> Code-mode-only probe: ${STEELENGINE_LIVE_CODEX_HARNESS_CODE_MODE_ONLY:-0}"
echo "==> Loop relay disabled: ${STEELENGINE_LIVE_CODEX_HARNESS_DISABLE_LOOP_RELAY:-0}"
echo "==> Resume stress: ${STEELENGINE_LIVE_CODEX_HARNESS_RESUME_STRESS:-0}"
echo "==> Resume stress history turns: ${STEELENGINE_LIVE_CODEX_HARNESS_RESUME_STRESS_HISTORY_TURNS:-4}"
echo "==> Resume stress restarts: ${STEELENGINE_LIVE_CODEX_HARNESS_RESUME_STRESS_RESTARTS:-3}"
echo "==> Compaction stress: ${STEELENGINE_LIVE_CODEX_HARNESS_COMPACTION_STRESS:-0}"
echo "==> Compaction stress turns: ${STEELENGINE_LIVE_CODEX_HARNESS_COMPACTION_STRESS_TURNS:-4}"
echo "==> Large output bytes: ${STEELENGINE_LIVE_CODEX_HARNESS_LARGE_OUTPUT_BYTES:-300000}"
echo "==> Auth mode: $CODEX_HARNESS_AUTH_MODE"
echo "==> Profile file: $PROFILE_STATUS"
echo "==> CI-safe Codex config: ${STEELENGINE_LIVE_CODEX_HARNESS_USE_CI_SAFE_CODEX_CONFIG:-1}"
echo "==> Test files: ${STEELENGINE_LIVE_CODEX_TEST_FILES:-src/gateway/gateway-codex-harness.live.test.ts}"
echo "==> Codex CLI package: $CODEX_CLI_PACKAGE_SPEC"
echo "==> Harness fallback: none"
echo "==> Auth files: ${AUTH_FILES_CSV:-none}"
DOCKER_RUN_ARGS=()
steelengine_live_init_docker_run_args DOCKER_RUN_ARGS "$CODEX_HARNESS_DOCKER_RUN_TIMEOUT"
DOCKER_RUN_ARGS+=(--rm -t \
  -u "$DOCKER_USER" \
  --entrypoint bash \
  -e COREPACK_ENABLE_DOWNLOAD_PROMPT=0 \
  -e HOME=/home/node \
  -e NPM_CONFIG_PREFIX="$DOCKER_CLI_TOOLS_CONTAINER_DIR" \
  -e npm_config_prefix="$DOCKER_CLI_TOOLS_CONTAINER_DIR" \
  -e XDG_CACHE_HOME="$DOCKER_CACHE_CONTAINER_DIR" \
  -e COREPACK_HOME="$DOCKER_CACHE_CONTAINER_DIR/node/corepack" \
  -e NPM_CONFIG_CACHE="$DOCKER_CACHE_CONTAINER_DIR/npm" \
  -e npm_config_cache="$DOCKER_CACHE_CONTAINER_DIR/npm" \
  -e NODE_OPTIONS="$(steelengine_live_container_node_options)" \
  -e STEELENGINE_AGENT_HARNESS_FALLBACK=none \
  -e STEELENGINE_DOCKER_AUTH_PRESTAGED="$DOCKER_AUTH_PRESTAGED" \
  -e STEELENGINE_CODEX_APP_SERVER_BIN="${STEELENGINE_CODEX_APP_SERVER_BIN:-codex}" \
  -e STEELENGINE_DOCKER_AUTH_FILES_RESOLVED="$AUTH_FILES_CSV" \
  -e STEELENGINE_LIVE_DOCKER_SOURCE_STAGE_MODE="${STEELENGINE_LIVE_DOCKER_SOURCE_STAGE_MODE:-copy}" \
  -e STEELENGINE_LIVE_CODEX_HARNESS_AUTH="$CODEX_HARNESS_AUTH_MODE" \
  -e STEELENGINE_LIVE_CODEX_HARNESS=1 \
  -e STEELENGINE_LIVE_CODEX_HARNESS_CHAT_IMAGE_PROBE="${STEELENGINE_LIVE_CODEX_HARNESS_CHAT_IMAGE_PROBE:-0}" \
  -e STEELENGINE_LIVE_CODEX_HARNESS_CODE_MODE_ONLY="${STEELENGINE_LIVE_CODEX_HARNESS_CODE_MODE_ONLY:-0}" \
  -e STEELENGINE_LIVE_CODEX_HARNESS_COMPACTION_STRESS="${STEELENGINE_LIVE_CODEX_HARNESS_COMPACTION_STRESS:-0}" \
  -e STEELENGINE_LIVE_CODEX_HARNESS_COMPACTION_STRESS_TURNS="${STEELENGINE_LIVE_CODEX_HARNESS_COMPACTION_STRESS_TURNS:-4}" \
  -e STEELENGINE_LIVE_CODEX_HARNESS_DEBUG="${STEELENGINE_LIVE_CODEX_HARNESS_DEBUG:-}" \
  -e STEELENGINE_LIVE_CODEX_HARNESS_DISABLE_LOOP_RELAY="${STEELENGINE_LIVE_CODEX_HARNESS_DISABLE_LOOP_RELAY:-0}" \
  -e STEELENGINE_LIVE_CODEX_HARNESS_GUARDIAN_PROBE="${STEELENGINE_LIVE_CODEX_HARNESS_GUARDIAN_PROBE:-1}" \
  -e STEELENGINE_LIVE_CODEX_HARNESS_IMAGE_PROBE="${STEELENGINE_LIVE_CODEX_HARNESS_IMAGE_PROBE:-1}" \
  -e STEELENGINE_LIVE_CODEX_HARNESS_LARGE_OUTPUT_BYTES="${STEELENGINE_LIVE_CODEX_HARNESS_LARGE_OUTPUT_BYTES:-300000}" \
  -e STEELENGINE_LIVE_CODEX_HARNESS_MCP_PROBE="${STEELENGINE_LIVE_CODEX_HARNESS_MCP_PROBE:-1}" \
  -e STEELENGINE_LIVE_CODEX_HARNESS_MODEL="${STEELENGINE_LIVE_CODEX_HARNESS_MODEL:-openai/gpt-5.6-luna}" \
  -e STEELENGINE_LIVE_CODEX_HARNESS_TARGETS="${STEELENGINE_LIVE_CODEX_HARNESS_TARGETS:-}" \
  -e STEELENGINE_LIVE_CODEX_HARNESS_THINKING="${STEELENGINE_LIVE_CODEX_HARNESS_THINKING:-low}" \
  -e STEELENGINE_LIVE_CODEX_HARNESS_EXPECTED_EFFORT="${STEELENGINE_LIVE_CODEX_HARNESS_EXPECTED_EFFORT:-}" \
  -e STEELENGINE_LIVE_CODEX_HARNESS_REQUIRE_GUARDIAN_EVENTS="${STEELENGINE_LIVE_CODEX_HARNESS_REQUIRE_GUARDIAN_EVENTS:-1}" \
  -e STEELENGINE_LIVE_CODEX_HARNESS_REQUEST_TIMEOUT_MS="${STEELENGINE_LIVE_CODEX_HARNESS_REQUEST_TIMEOUT_MS:-}" \
  -e STEELENGINE_LIVE_CODEX_HARNESS_RESUME_STRESS="${STEELENGINE_LIVE_CODEX_HARNESS_RESUME_STRESS:-0}" \
  -e STEELENGINE_LIVE_CODEX_HARNESS_RESUME_STRESS_HISTORY_TURNS="${STEELENGINE_LIVE_CODEX_HARNESS_RESUME_STRESS_HISTORY_TURNS:-4}" \
  -e STEELENGINE_LIVE_CODEX_HARNESS_RESUME_STRESS_RESTARTS="${STEELENGINE_LIVE_CODEX_HARNESS_RESUME_STRESS_RESTARTS:-3}" \
  -e STEELENGINE_LIVE_CODEX_HARNESS_SETUP_TIMEOUT_SECONDS="$CODEX_HARNESS_SETUP_TIMEOUT_SECONDS" \
  -e STEELENGINE_LIVE_CODEX_HARNESS_SUBAGENT_ONLY="${STEELENGINE_LIVE_CODEX_HARNESS_SUBAGENT_ONLY:-}" \
  -e STEELENGINE_LIVE_CODEX_HARNESS_SUBAGENT_COUNT="${STEELENGINE_LIVE_CODEX_HARNESS_SUBAGENT_COUNT:-1}" \
  -e STEELENGINE_LIVE_CODEX_HARNESS_SUBAGENT_PROBE="${STEELENGINE_LIVE_CODEX_HARNESS_SUBAGENT_PROBE:-1}" \
  -e STEELENGINE_LIVE_CODEX_HARNESS_USE_CI_SAFE_CODEX_CONFIG="${STEELENGINE_LIVE_CODEX_HARNESS_USE_CI_SAFE_CODEX_CONFIG:-1}" \
  -e STEELENGINE_LIVE_CODEX_CLI_PACKAGE_SPEC="$CODEX_CLI_PACKAGE_SPEC" \
  -e STEELENGINE_CLI_BACKEND_LOG_OUTPUT="${STEELENGINE_CLI_BACKEND_LOG_OUTPUT:-}" \
  -e STEELENGINE_TEST_CONSOLE="${STEELENGINE_TEST_CONSOLE:-}" \
  -e STEELENGINE_LIVE_DOCKER_SCRIPTS_DIR="${DOCKER_TRUSTED_HARNESS_CONTAINER_DIR}/scripts" \
  -e STEELENGINE_LIVE_DOCKER_TRUSTED_HARNESS_DIR="$DOCKER_TRUSTED_HARNESS_CONTAINER_DIR" \
  -e STEELENGINE_LIVE_CODEX_TRUSTED_HARNESS_DIR="$DOCKER_TRUSTED_HARNESS_CONTAINER_DIR" \
  -e STEELENGINE_LIVE_CODEX_BIND="${STEELENGINE_LIVE_CODEX_BIND:-}" \
  -e STEELENGINE_LIVE_CODEX_BIND_MODEL="${STEELENGINE_LIVE_CODEX_BIND_MODEL:-}" \
  -e STEELENGINE_LIVE_CODEX_BIND_PROVIDER="${STEELENGINE_LIVE_CODEX_BIND_PROVIDER:-}" \
  -e STEELENGINE_LIVE_CODEX_TEST_FILES="${STEELENGINE_LIVE_CODEX_TEST_FILES:-}" \
  -e STEELENGINE_LIVE_TEST=1 \
  -e STEELENGINE_VITEST_FS_MODULE_CACHE=0)
steelengine_live_append_array DOCKER_RUN_ARGS DOCKER_AUTH_ENV
steelengine_live_append_array DOCKER_RUN_ARGS DOCKER_EXTRA_ENV_FILES
steelengine_live_append_array DOCKER_RUN_ARGS DOCKER_HOME_MOUNT
steelengine_live_append_array DOCKER_RUN_ARGS DOCKER_TRUSTED_HARNESS_MOUNT
DOCKER_RUN_ARGS+=(\
  -v "$ROOT_DIR":/src:ro \
  -v "$CONFIG_DIR":/home/node/.steelengine \
  -v "$WORKSPACE_DIR":/home/node/.steelengine/workspace)
if [[ "$CODEX_HARNESS_AUTH_MODE" != "api-key" ]]; then
  DOCKER_RUN_ARGS+=(\
    -v "$CACHE_HOME_DIR":"$DOCKER_CACHE_CONTAINER_DIR" \
    -v "$CLI_TOOLS_DIR":"$DOCKER_CLI_TOOLS_CONTAINER_DIR")
fi
steelengine_live_append_array DOCKER_RUN_ARGS EXTERNAL_AUTH_MOUNTS
steelengine_live_append_array DOCKER_RUN_ARGS PROFILE_MOUNT
DOCKER_RUN_ARGS+=(\
  "$LIVE_IMAGE_NAME" \
  -lc "$LIVE_TEST_CMD")
if [[ "${STEELENGINE_LIVE_CODEX_HARNESS_DEBUG:-}" == "1" ]]; then
  echo "==> Docker debug: host ids and mounted dirs"
  id
  ls -ld "$CACHE_HOME_DIR" "$CLI_TOOLS_DIR" "${DOCKER_HOME_DIR:-$HOME}" 2>/dev/null || true
  printf '==> Docker debug args:'
  printf ' %q' "${DOCKER_RUN_ARGS[@]}"
  printf '\n'
fi
"${DOCKER_RUN_ARGS[@]}"
