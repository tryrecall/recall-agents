// Agent Workspace script supports SteelEngine repository automation.
export function posixAgentWorkspaceScript(purpose: string): string {
  return `set -eu
workspace="\${STEELENGINE_WORKSPACE_DIR:-$HOME/.steelengine/workspace}"
mkdir -p "$workspace/.steelengine"
cat > "$workspace/IDENTITY.md" <<'IDENTITY_EOF'
# Identity

- Name: SteelEngine
- Purpose: ${purpose}
IDENTITY_EOF
rm -f "$workspace/BOOTSTRAP.md"`;
}

export function windowsAgentWorkspaceScript(purpose: string): string {
  return `$workspace = $env:STEELENGINE_WORKSPACE_DIR
if (-not $workspace) { $workspace = Join-Path $env:USERPROFILE '.steelengine\\workspace' }
$stateDir = Join-Path $workspace '.steelengine'
New-Item -ItemType Directory -Path $stateDir -Force | Out-Null
@'
# Identity

- Name: SteelEngine
- Purpose: ${purpose}
'@ | Set-Content -Path (Join-Path $workspace 'IDENTITY.md') -Encoding UTF8
Remove-Item (Join-Path $workspace 'BOOTSTRAP.md') -Force -ErrorAction SilentlyContinue`;
}
