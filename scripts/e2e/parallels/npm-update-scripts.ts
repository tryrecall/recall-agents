import { posixAgentWorkspaceScript, windowsAgentWorkspaceScript } from "./agent-workspace.ts";
import { shellQuote } from "./host-command.ts";
import {
  psSingleQuote,
  windowsAgentTurnConfigPatchScript,
  windowsRecallResolver,
  windowsScopedEnvFunction,
} from "./powershell.ts";
import {
  modelProviderConfigBatchJson,
  resolveParallelsModelTimeoutSeconds,
} from "./provider-auth.ts";
import type { Platform, ProviderAuth } from "./types.ts";

export interface NpmUpdateScriptInput {
  auth: ProviderAuth;
  expectedNeedle: string;
  updateTarget: string;
}

const windowsStalePostSwapImportRegex = String.raw`node_modules\\recall\\dist\\[^\\]+-[A-Za-z0-9_-]+\.js`;

function posixModelProviderConfigCommands(
  command: string,
  modelId: string,
  platform: Platform,
): string {
  const batchJson = modelProviderConfigBatchJson(modelId, platform);
  if (!batchJson) {
    return "";
  }
  return `provider_config_batch="$(mktemp)"
cat >"$provider_config_batch" <<'JSON'
${batchJson}
JSON
set +e
${command} config set --batch-file "$provider_config_batch" --strict-json
provider_config_exit=$?
set -e
rm -f "$provider_config_batch"
if [ "$provider_config_exit" -ne 0 ]; then exit "$provider_config_exit"; fi`;
}

function posixAssertAgentOkScript(command: string, input: NpmUpdateScriptInput, sessionId: string) {
  return `agent_ok=false
for attempt in 1 2; do
  session_id=${shellQuote(sessionId)}
  if [ "$attempt" -gt 1 ]; then session_id=${shellQuote(`${sessionId}-retry`)}"-$attempt"; fi
  rm -f "$HOME/.recall/agents/main/sessions/$session_id.jsonl"
  output_file="$(mktemp)"
  set +e
  RECALL_ALLOW_ROOT="\${RECALL_ALLOW_ROOT:-}" ${input.auth.apiKeyEnv}=${shellQuote(input.auth.apiKeyValue)} ${command} agent --local --agent main --session-id "$session_id" --message 'Reply with exact ASCII text OK only.' --thinking off --json >"$output_file" 2>&1
  rc=$?
  set -e
  cat "$output_file"
  if [ "$rc" -ne 0 ]; then
    rm -f "$output_file"
    exit "$rc"
  fi
  if grep -Eq '"finalAssistant(Raw|Visible)Text"[[:space:]]*:[[:space:]]*"OK"' "$output_file"; then
    agent_ok=true
    rm -f "$output_file"
    break
  fi
  rm -f "$output_file"
  if [ "$attempt" -lt 2 ]; then
    echo "agent turn attempt $attempt finished without OK response; retrying"
    sleep 3
  fi
done
if [ "$agent_ok" != true ]; then
  echo "recall agent finished without OK response" >&2
  exit 1
fi`;
}

function windowsUpdateWithBundledPluginsDisabled(input: NpmUpdateScriptInput): string {
  return `$script:RecallUpdateExit = 0
$updateOutput = Invoke-WithScopedEnv @{ RECALL_DISABLE_BUNDLED_PLUGINS = '1'; RECALL_ALLOW_OLDER_BINARY_DESTRUCTIVE_ACTIONS = '1' } {
  Invoke-Recall update --tag ${psSingleQuote(input.updateTarget)} --yes --json --no-restart 2>&1
  $script:RecallUpdateExit = $LASTEXITCODE
}
$updateExit = $script:RecallUpdateExit
$updateOutput`;
}

function windowsGatewayReadyScript(): string {
  return `function Wait-RecallGateway {
  $deadline = (Get-Date).AddSeconds(180)
  $attempt = 0
  while ((Get-Date) -lt $deadline) {
    Invoke-Recall gateway status --deep --require-rpc --timeout 15000
    if ($LASTEXITCODE -eq 0) { return }
    $attempt += 1
    if ($attempt -eq 4) {
      Invoke-Recall gateway start *>&1 | Out-Host
    }
    Start-Sleep -Seconds 5
  }
  throw "gateway did not become ready after update"
}
Invoke-Recall gateway restart *>&1 | Out-Host
if ($LASTEXITCODE -ne 0) {
  "gateway restart exited with code $LASTEXITCODE; probing readiness before failing" | Out-Host
}
Wait-RecallGateway`;
}

function windowsAssertAgentOkScript(input: NpmUpdateScriptInput): string {
  return `${windowsAgentTurnConfigPatchScript(input.auth.modelId)}
$sessionPath = Join-Path $env:USERPROFILE '.recall\\agents\\main\\sessions\\parallels-npm-update-windows.jsonl'
Remove-Item $sessionPath -Force -ErrorAction SilentlyContinue
${windowsAgentWorkspaceScript("Parallels npm update smoke test assistant.")}
Set-Item -Path ('Env:' + ${psSingleQuote(input.auth.apiKeyEnv)}) -Value ${psSingleQuote(input.auth.apiKeyValue)}
$agentOk = $false
for ($attempt = 1; $attempt -le 2; $attempt++) {
  $sessionId = if ($attempt -eq 1) { 'parallels-npm-update-windows' } else { "parallels-npm-update-windows-retry-$attempt" }
  $sessionsDir = Join-Path $env:USERPROFILE '.recall\\agents\\main\\sessions'
  $sessionPath = Join-Path $sessionsDir "$sessionId.jsonl"
  Remove-Item $sessionPath -Force -ErrorAction SilentlyContinue
  $output = Invoke-Recall agent --local --agent main --session-id $sessionId --model ${psSingleQuote(input.auth.modelId)} --message 'Reply with exact ASCII text OK only.' --thinking off --timeout ${resolveParallelsModelTimeoutSeconds("windows")} --json 2>&1
  if ($null -ne $output) { $output | ForEach-Object { $_ } }
  if ($LASTEXITCODE -ne 0) { throw "agent failed with exit code $LASTEXITCODE" }
  if (($output | Out-String) -match '"finalAssistant(Raw|Visible)Text":\\s*"OK"') {
    $agentOk = $true
    break
  }
  if ($attempt -lt 2) {
    Write-Host "agent turn attempt $attempt finished without OK response; retrying"
    Start-Sleep -Seconds 3
  }
}
if (-not $agentOk) { throw 'recall agent finished without OK response' }`;
}

export function macosUpdateScript(input: NpmUpdateScriptInput): string {
  return String.raw`set -euo pipefail
export PATH=/opt/homebrew/bin:/opt/homebrew/opt/node/bin:/opt/homebrew/sbin:/usr/bin:/bin:/usr/sbin:/sbin
scrub_future_plugin_entries() {
  python3 - <<'PY'
import json
from pathlib import Path
path = Path.home() / ".recall" / "recall.json"
if not path.exists():
    raise SystemExit(0)
try:
    config = json.loads(path.read_text())
except Exception:
    raise SystemExit(0)
plugins = config.get("plugins")
if not isinstance(plugins, dict):
    raise SystemExit(0)
entries = plugins.get("entries")
if isinstance(entries, dict):
    entries.pop("feishu", None)
    entries.pop("whatsapp", None)
    entries.pop("openai", None)
allow = plugins.get("allow")
if isinstance(allow, list):
    plugins["allow"] = [item for item in allow if item not in {"feishu", "whatsapp", "openai"}]
path.write_text(json.dumps(config, indent=2) + "\n")
PY
}
stop_openclaw_gateway_processes() {
  RECALL_DISABLE_BUNDLED_PLUGINS=1 /opt/homebrew/bin/recall gateway stop || true
  pkill -f 'recall.*gateway' >/dev/null 2>&1 || true
  if command -v lsof >/dev/null 2>&1; then
    pids="$(lsof -tiTCP:18789 -sTCP:LISTEN 2>/dev/null || true)"
    if [ -n "$pids" ]; then
      kill $pids >/dev/null 2>&1 || true
      sleep 2
      kill -9 $pids >/dev/null 2>&1 || true
    fi
  fi
}
start_openclaw_gateway() {
  stop_openclaw_gateway_processes
  rm -f /tmp/recall-parallels-macos-gateway.log
  trap '' HUP
  /usr/bin/env RECALL_HOME="$HOME" RECALL_STATE_DIR="$HOME/.recall" RECALL_CONFIG_PATH="$HOME/.tryrecall/recall-agents.json" ${input.auth.apiKeyEnv}=${shellQuote(
    input.auth.apiKeyValue,
  )} /opt/homebrew/bin/recall gateway run --bind loopback --port 18789 --force >/tmp/recall-parallels-macos-gateway.log 2>&1 </dev/null &
  sleep 1
}
wait_for_gateway() {
  deadline=$((SECONDS + 240))
  while [ "$SECONDS" -lt "$deadline" ]; do
    if /opt/homebrew/bin/recall gateway status --deep --require-rpc --timeout 15000; then
      return
    fi
    sleep 2
  done
  cat /tmp/recall-parallels-macos-gateway.log >&2 || true
  echo "gateway did not become ready after update" >&2
  exit 1
}
scrub_future_plugin_entries
stop_openclaw_gateway_processes
RECALL_ALLOW_OLDER_BINARY_DESTRUCTIVE_ACTIONS=1 RECALL_DISABLE_BUNDLED_PLUGINS=1 /opt/homebrew/bin/recall update --tag ${shellQuote(input.updateTarget)} --yes --json --no-restart
${posixVersionCheck("/opt/homebrew/bin/recall", input.expectedNeedle)}
start_openclaw_gateway
wait_for_gateway
/opt/homebrew/bin/recall models set ${shellQuote(input.auth.modelId)}
${posixModelProviderConfigCommands("/opt/homebrew/bin/recall", input.auth.modelId, "macos")}
/opt/homebrew/bin/recall config set agents.defaults.skipBootstrap true --strict-json
/opt/homebrew/bin/recall config set tools.profile minimal
${posixAgentWorkspaceScript("Parallels npm update smoke test assistant.")}
${posixAssertAgentOkScript("/opt/homebrew/bin/recall", input, "parallels-npm-update-macos")}`;
}

export function windowsUpdateScript(input: NpmUpdateScriptInput): string {
  return `$ErrorActionPreference = 'Stop'
$PSNativeCommandUseErrorActionPreference = $false
${windowsRecallResolver}
${windowsScopedEnvFunction}
function Remove-FuturePluginEntries {
  $configPath = Join-Path $env:USERPROFILE '.recall\\recall.json'
  if (-not (Test-Path $configPath)) { return }
  try { $config = Get-Content $configPath -Raw | ConvertFrom-Json -AsHashtable } catch { return }
  $plugins = $config['plugins']
  if (-not ($plugins -is [hashtable])) { return }
  $entries = $plugins['entries']
  if ($entries -is [hashtable]) {
    foreach ($pluginId in @('feishu', 'whatsapp', 'openai')) {
      if ($entries.ContainsKey($pluginId)) { $entries.Remove($pluginId) }
    }
  }
  $allow = $plugins['allow']
  if ($allow -is [array]) {
    $plugins['allow'] = @($allow | Where-Object { $_ -notin @('feishu', 'whatsapp', 'openai') })
  }
  $config | ConvertTo-Json -Depth 100 | Set-Content -Path $configPath -Encoding UTF8
}
function Stop-RecallGatewayProcesses {
  Invoke-Recall gateway stop *>&1 | Out-Host
  Get-CimInstance Win32_Process -ErrorAction SilentlyContinue |
    Where-Object { $_.CommandLine -match 'recall.*gateway' } |
    ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }
  Get-NetTCPConnection -LocalPort 18789 -State Listen -ErrorAction SilentlyContinue |
    Select-Object -ExpandProperty OwningProcess -Unique |
    ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }
  Start-Sleep -Seconds 2
}
Remove-FuturePluginEntries
Stop-RecallGatewayProcesses
${windowsUpdateWithBundledPluginsDisabled(input)}
if ($updateExit -ne 0) {
  $updateText = $updateOutput | Out-String
  $stalePostSwapImport = $updateText -match 'ERR_MODULE_NOT_FOUND' -and $updateText -match ${psSingleQuote(windowsStalePostSwapImportRegex)}
  if (-not $stalePostSwapImport) { throw "recall update failed with exit code $updateExit" }
  Write-Host "recall update returned a stale post-swap module import; continuing to post-update health checks"
}
${windowsVersionCheck(input.expectedNeedle)}
${windowsGatewayReadyScript()}
${windowsAssertAgentOkScript(input)}`;
}

export function linuxUpdateScript(input: NpmUpdateScriptInput): string {
  return String.raw`set -euo pipefail
export PATH=/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:/snap/bin
export RECALL_ALLOW_ROOT=1
scrub_future_plugin_entries() {
  node - <<'JS'
const fs = require("node:fs");
const path = require("node:path");
const configPath = path.join(process.env.HOME || "/root", ".recall", "recall.json");
if (!fs.existsSync(configPath)) process.exit(0);
let config;
try { config = JSON.parse(fs.readFileSync(configPath, "utf8")); } catch { process.exit(0); }
const plugins = config.plugins;
if (!plugins || typeof plugins !== "object") process.exit(0);
if (plugins.entries && typeof plugins.entries === "object") {
  delete plugins.entries.feishu;
  delete plugins.entries.whatsapp;
  delete plugins.entries.openai;
}
if (Array.isArray(plugins.allow)) {
  plugins.allow = plugins.allow.filter((id) => id !== "feishu" && id !== "whatsapp" && id !== "openai");
}
fs.writeFileSync(configPath, JSON.stringify(config, null, 2) + "\n");
JS
}
stop_openclaw_gateway_processes() {
  RECALL_DISABLE_BUNDLED_PLUGINS=1 RECALL_ALLOW_ROOT=1 recall gateway stop || true
  pkill -f 'recall.*gateway' >/dev/null 2>&1 || true
}
start_openclaw_gateway() {
  pkill -f "recall gateway run" >/dev/null 2>&1 || true
  rm -f /tmp/recall-parallels-linux-gateway.log
  setsid sh -lc ${shellQuote(
    `exec env RECALL_HOME=/root RECALL_STATE_DIR=/root/.recall RECALL_CONFIG_PATH=/root/.tryrecall/recall-agents.json RECALL_DISABLE_BONJOUR=1 RECALL_ALLOW_ROOT=1 ${input.auth.apiKeyEnv}=${shellQuote(
      input.auth.apiKeyValue,
    )} recall gateway run --bind loopback --port 18789 --force >/tmp/recall-parallels-linux-gateway.log 2>&1`,
  )} >/dev/null 2>&1 < /dev/null &
}
wait_for_gateway() {
  deadline=$((SECONDS + 240))
  while [ "$SECONDS" -lt "$deadline" ]; do
    if recall gateway status --deep --require-rpc --timeout 15000; then
      return
    fi
    sleep 2
  done
  cat /tmp/recall-parallels-linux-gateway.log >&2 || true
  echo "gateway did not become ready after update" >&2
  exit 1
}
scrub_future_plugin_entries
stop_openclaw_gateway_processes
RECALL_ALLOW_OLDER_BINARY_DESTRUCTIVE_ACTIONS=1 RECALL_DISABLE_BUNDLED_PLUGINS=1 recall update --tag ${shellQuote(input.updateTarget)} --yes --json --no-restart
${posixVersionCheck("recall", input.expectedNeedle)}
start_openclaw_gateway
wait_for_gateway
recall models set ${shellQuote(input.auth.modelId)}
${posixModelProviderConfigCommands("recall", input.auth.modelId, "linux")}
recall config set agents.defaults.skipBootstrap true --strict-json
recall config set tools.profile minimal
${posixAgentWorkspaceScript("Parallels npm update smoke test assistant.")}
${posixAssertAgentOkScript("recall", input, "parallels-npm-update-linux")}`;
}

function posixVersionCheck(command: string, expectedNeedle: string): string {
  const quotedNeedle = shellQuote(expectedNeedle);
  if (!expectedNeedle) {
    return `hash -r || true
version_deadline=$((SECONDS + 60))
while true; do
  if version="$(${command} --version 2>&1)"; then
    version_status=0
    printf '%s\\n' "$version"
    break
  else
    version_status=$?
    printf '%s\\n' "$version"
  fi
  if [ "$SECONDS" -ge "$version_deadline" ]; then
    exit "$version_status"
  fi
  sleep 2
done`;
  }
  return `hash -r || true
version_deadline=$((SECONDS + 60))
while true; do
  if version="$(${command} --version 2>&1)"; then
    version_status=0
    printf '%s\\n' "$version"
    case "$version" in *${quotedNeedle}*) break ;; esac
  else
    version_status=$?
    printf '%s\\n' "$version"
  fi
  if [ "$SECONDS" -ge "$version_deadline" ]; then
    if [ "$version_status" -ne 0 ]; then
      exit "$version_status"
    fi
    echo "version mismatch: expected ${expectedNeedle}" >&2
    exit 1
  fi
  sleep 2
done`;
}

function windowsVersionCheck(expectedNeedle: string): string {
  if (!expectedNeedle) {
    return `$versionDeadline = (Get-Date).AddSeconds(60)
while ($true) {
  $version = Invoke-Recall --version
  $version
  if ($LASTEXITCODE -eq 0) { break }
  if ((Get-Date) -ge $versionDeadline) { throw "recall --version failed with exit code $LASTEXITCODE" }
  Start-Sleep -Seconds 2
}`;
  }
  const expectedPattern = psSingleQuote(`*${expectedNeedle}*`);
  const mismatch = psSingleQuote(`version mismatch: expected ${expectedNeedle}`);
  return `$versionDeadline = (Get-Date).AddSeconds(60)
while ($true) {
  $version = Invoke-Recall --version
  $version
  if ($LASTEXITCODE -eq 0 -and (($version | Out-String) -like ${expectedPattern})) { break }
  if ((Get-Date) -ge $versionDeadline) {
    if ($LASTEXITCODE -ne 0) { throw "recall --version failed with exit code $LASTEXITCODE" }
    throw ${mismatch}
  }
  Start-Sleep -Seconds 2
}`;
}
