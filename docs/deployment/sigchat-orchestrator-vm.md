# Manual deployment of PRs #4 / #5 / #6 to vm-sigchat-orchestrator

## Why this is a manual step
- `tryrecall/recall-agents` publishes to npm via the `Recall NPM Release` workflow, but that workflow has 0 successful runs as of 2026-04-28.
- The dev orchestrator VM (`vm-sigchat-orchestrator` — public IP `20.230.36.130`, private `10.140.3.132`) runs `recall@2026.3.23` installed from a tarball during initial provisioning in March 2026. There is no automated update path from `recall-agents/main` to the VM.
- The VM does not have build tooling installed (`pnpm`, `sharp`'s native deps, etc.), so `npm install -g git+https://github.com/tryrecall/recall-agents.git#main` fails on `sharp`'s postinstall.

## What needs to happen
PRs #4, #5, #6 fix issue #110 in `tryrecall/signature-recall-chat`. All three are in `recall-agents/main` but have not reached the live VM. The end-to-end chain currently broken at the live VM:

1. Dashboard sends `thinking: { type: "enabled", budget_tokens: N }` in the chat-completions body.
2. Gateway's `openai-http.ts` reads it via `resolveThinkingFromRequest` (PR #5).
3. `agentCommand` translates `opts.thinking` -> `resolvedReasoningLevel` and forwards to `runEmbeddedPiAgent` (PR #6).
4. `pi-embedded-subscribe` sets `reasoningMode = "on"`, which causes Anthropic to receive `thinking.type: "enabled"` and emit `thinking_delta` events.
5. The runner emits `AgentEvent { stream: "thinking", data: { delta } }`.
6. Gateway's `openai-http.ts` forwards as `delta.thinking_content` SSE chunks (PR #4).
7. Dashboard's `<Thinking>` component renders the trace as a collapsible block.

Without all 3 PRs, step 4 is a no-op and the chain breaks at the source.

## Deployment options (any one is sufficient)

### Option 1: publish a new `recall` npm version (preferred)
1. Bump `package.json` version to next semver, e.g. `2026.4.21`.
2. Commit + tag `v2026.4.21`, push tag.
3. Run the `Recall NPM Release` GitHub Action with `tag: v2026.4.21`.
4. On the VM:
   ```
   ssh -i ~/.ssh/sigchat_dev_orchestrator sadmin@20.230.36.130
   sudo npm install -g recall@2026.4.21
   sudo systemctl restart recall-gateway-sigchat.service
   ```

### Option 2: build locally + scp the dist
1. Clone `recall-agents`, `pnpm install`, `pnpm build`.
2. `scp -i ~/.ssh/sigchat_dev_orchestrator -r dist/* sadmin@20.230.36.130:/usr/lib/node_modules/recall-agents/dist/`
3. `ssh sadmin@... 'sudo systemctl restart recall-gateway-sigchat.service'`

### Option 3: provision build tools on the VM
1. SSH to VM. `sudo apt-get install -y libvips-dev` (and any other native deps).
2. `sudo npm install -g git+https://github.com/tryrecall/recall-agents.git#main`
3. `sudo systemctl restart recall-gateway-sigchat.service`

## Verification after deployment
```
ssh -i ~/.ssh/sigchat_dev_orchestrator sadmin@20.230.36.130
TOKEN=<gateway token from secret>
curl -s -X POST http://10.140.3.132:9450/v1/chat/completions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "model":"recall",
    "messages":[{"role":"user","content":"Solve 17*23 step by step."}],
    "thinking":{"type":"enabled","budget_tokens":2048},
    "max_tokens":3072,
    "stream":true
  }'
```

Expected: at least one chunk should contain `"delta":{"thinking_content":"..."}`. If you only see `delta.content`, the chain is still broken and we have a fourth-layer bug.

## Risk if not deployed
The dashboard's `<Thinking>` component never renders. The `/reasoning on` toggle is purely cosmetic at the UI layer (sets a DB flag) but produces no visible thinking output for the user. Otherwise everything else works.

## Why I didn't deploy this from my session
I attempted to patch the minified `gateway-cli-DB4t9cO5.js` directly on the VM. The patches are non-trivial (adding new functions, conditional handler blocks, plumbing through 6 separate locations) and the bash heredoc + Python `string.replace` approach kept failing on shell-escaping the JS template literals. After multiple failed attempts, reverted the VM to its baseline (which is what I want to leave it at — partially-patched is worse than unpatched).

Manual deployment via Option 1 (npm release) is the right path.
