---
summary: "Generated inventory of SteelEngine plugins shipped in core, published externally, or kept source-only"
read_when:
  - You are deciding whether a plugin ships in the core npm package or installs separately
  - You are updating bundled plugin package metadata or release automation
  - You need the canonical internal vs external plugin list
title: "Plugin inventory"
---

# Plugin inventory

This page is generated from `extensions/*/package.json`, `steelengine.plugin.json`,
and the root npm package `files` exclusions. Regenerate it with:

```bash
pnpm plugins:inventory:gen
```

## Definitions

- **Core npm package:** built into the `steelengine` npm package and available without a separate plugin install.
- **Official external package:** SteelEngine-maintained plugin omitted from the core npm package, kept in this official inventory, and installed on demand through ClawHub and/or npm.
- **Source checkout only:** repo-local plugin omitted from published npm artifacts and not advertised as an installable package.

Source checkouts are different from npm installs: after `pnpm install`, bundled
plugins load from `extensions/<id>` so local edits and package-local workspace
dependencies are available.

## Install a plugin

Use the install route in each entry to decide whether install is needed. Plugins
that say `included in SteelEngine` are already present in the core package.
Official external packages need one install, then a Gateway restart.

For example, Discord is an official external package:

```bash
steelengine plugins install @steelengine/discord
steelengine gateway restart
steelengine plugins inspect discord --runtime --json
```

During the launch cutover, ordinary bare package specs still install from npm.
Use `clawhub:@steelengine/discord` or `npm:@steelengine/discord` when you need an
explicit source. After install, follow the plugin's setup doc, such as
[Discord](/channels/discord), to add credentials and channel config. See
[Manage plugins](/plugins/manage-plugins) for update, uninstall, and publishing
commands.

Each entry lists the package, distribution route, and description.

## Core npm package

68 plugins

- **[admin-http-rpc](/plugins/reference/admin-http-rpc)** (`@steelengine/admin-http-rpc`) - included in SteelEngine. SteelEngine admin HTTP RPC endpoint.

- **[alibaba](/plugins/reference/alibaba)** (`@steelengine/alibaba-provider`) - included in SteelEngine. Adds video generation provider support.

- **[anthropic](/plugins/reference/anthropic)** (`@steelengine/anthropic-provider`) - included in SteelEngine. Anthropic models, Claude CLI, and native Claude session catalog.

- **[azure-speech](/plugins/reference/azure-speech)** (`@steelengine/azure-speech`) - included in SteelEngine. Azure AI Speech text-to-speech (MP3, native Ogg/Opus voice notes, PCM telephony).

- **[bonjour](/plugins/reference/bonjour)** (`@steelengine/bonjour`) - included in SteelEngine. Advertise the local SteelEngine gateway over Bonjour/mDNS.

- **[browser](/plugins/reference/browser)** (`@steelengine/browser-plugin`) - included in SteelEngine. Adds agent-callable tools.

- **[byteplus](/plugins/reference/byteplus)** (`@steelengine/byteplus-provider`) - included in SteelEngine. Adds BytePlus, BytePlus Plan model provider support to SteelEngine.

- **[canvas](/plugins/reference/canvas)** (`@steelengine/canvas-plugin`) - included in SteelEngine. Experimental Canvas control and A2UI rendering surfaces for paired nodes.

- **[clawrouter](/plugins/reference/clawrouter)** (`@steelengine/clawrouter`) - included in SteelEngine. Adds ClawRouter model provider support to SteelEngine.

- **[cohere](/plugins/reference/cohere)** (`@steelengine/cohere-provider`) - included in SteelEngine; npm; ClawHub: `clawhub:@steelengine/cohere-provider`. SteelEngine Cohere provider plugin.

- **[comfy](/plugins/reference/comfy)** (`@steelengine/comfy-provider`) - included in SteelEngine. Adds ComfyUI model provider support to SteelEngine.

- **[copilot-proxy](/plugins/reference/copilot-proxy)** (`@steelengine/copilot-proxy`) - included in SteelEngine. Adds Copilot Proxy model provider support to SteelEngine.

- **[crabbox](/plugins/reference/crabbox)** (`@steelengine/crabbox-provider`) - included in SteelEngine. Cloud worker provider backed by the Crabbox CLI.

- **[deepgram](/plugins/reference/deepgram)** (`@steelengine/deepgram-provider`) - included in SteelEngine. Adds media understanding provider support. Adds realtime transcription provider support.

- **[document-extract](/plugins/reference/document-extract)** (`@steelengine/document-extract-plugin`) - included in SteelEngine. Extract text and fallback page images from local document attachments.

- **[duckduckgo](/plugins/reference/duckduckgo)** (`@steelengine/duckduckgo-plugin`) - included in SteelEngine. Adds web search provider support.

- **[elevenlabs](/plugins/reference/elevenlabs)** (`@steelengine/elevenlabs-speech`) - included in SteelEngine. Adds media understanding provider support. Adds realtime transcription provider support. Adds text-to-speech provider support.

- **[fal](/plugins/reference/fal)** (`@steelengine/fal-provider`) - included in SteelEngine. Adds fal model provider support to SteelEngine.

- **[file-transfer](/plugins/reference/file-transfer)** (`@steelengine/file-transfer`) - included in SteelEngine. Fetch, list, and write files on paired nodes via dedicated node commands. Bypasses bash stdout truncation by using base64 over node.invoke for binaries up to 16 MB.

- **[github-copilot](/plugins/reference/github-copilot)** (`@steelengine/github-copilot-provider`) - included in SteelEngine. Adds GitHub Copilot model provider support to SteelEngine.

- **[google](/plugins/reference/google)** (`@steelengine/google-plugin`) - included in SteelEngine. Adds Google, Google Gemini CLI, Google Vertex model provider support to SteelEngine.

- **[huggingface](/plugins/reference/huggingface)** (`@steelengine/huggingface-provider`) - included in SteelEngine. Adds Hugging Face model provider support to SteelEngine.

- **[imessage](/plugins/reference/imessage)** (`@steelengine/imessage`) - included in SteelEngine. Adds the iMessage channel surface for sending and receiving SteelEngine messages.

- **[linux-canvas](/plugins/reference/linux-canvas)** (`@steelengine/linux-canvas`) - included in SteelEngine. Canvas rendering bridge for the SteelEngine Linux desktop app.

- **[linux-node](/plugins/reference/linux-node)** (`@steelengine/linux-node`) - included in SteelEngine. Desktop notifications, camera capture, and location for Linux node hosts.

- **[litellm](/plugins/reference/litellm)** (`@steelengine/litellm-provider`) - included in SteelEngine. Adds LiteLLM model provider support to SteelEngine.

- **[llm-task](/plugins/reference/llm-task)** (`@steelengine/llm-task`) - included in SteelEngine. Generic JSON-only LLM tool for structured tasks callable from workflows.

- **[lmstudio](/plugins/reference/lmstudio)** (`@steelengine/lmstudio-provider`) - included in SteelEngine. Adds LM Studio model provider support to SteelEngine.

- **[logbook](/plugins/reference/logbook)** (`@steelengine/logbook`) - included in SteelEngine. Automatic work journal: captures periodic screen snapshots from a paired node and turns them into a reviewable timeline of your day.

- **[memory-core](/plugins/reference/memory-core)** (`@steelengine/memory-core`) - included in SteelEngine. Adds agent-callable tools.

- **[memory-wiki](/plugins/reference/memory-wiki)** (`@steelengine/memory-wiki`) - included in SteelEngine. Persistent wiki compiler and Obsidian-friendly knowledge vault for SteelEngine.

- **[meta](/plugins/reference/meta)** (`@steelengine/meta-provider`) - included in SteelEngine; npm; ClawHub: `clawhub:@steelengine/meta-provider`. Adds Meta model provider support to SteelEngine.

- **[microsoft](/plugins/reference/microsoft)** (`@steelengine/microsoft-speech`) - included in SteelEngine. Adds text-to-speech provider support.

- **[microsoft-foundry](/plugins/reference/microsoft-foundry)** (`@steelengine/microsoft-foundry`) - included in SteelEngine. Adds Microsoft Foundry model provider support to SteelEngine.

- **[migrate-claude](/plugins/reference/migrate-claude)** (`@steelengine/migrate-claude`) - included in SteelEngine. Imports Claude Code and Claude Desktop instructions, MCP servers, skills, and safe configuration into SteelEngine.

- **[migrate-hermes](/plugins/reference/migrate-hermes)** (`@steelengine/migrate-hermes`) - included in SteelEngine. Imports Hermes configuration, memories, skills, and supported credentials into SteelEngine.

- **[minimax](/plugins/reference/minimax)** (`@steelengine/minimax-provider`) - included in SteelEngine. Adds MiniMax, MiniMax Portal model provider support to SteelEngine.

- **[mistral](/plugins/reference/mistral)** (`@steelengine/mistral-provider`) - included in SteelEngine. Adds Mistral model provider support to SteelEngine.

- **[novita](/plugins/reference/novita)** (`@steelengine/novita-provider`) - included in SteelEngine. Adds Novita, Novita AI, Novitaai model provider support to SteelEngine.

- **[nvidia](/plugins/reference/nvidia)** (`@steelengine/nvidia-provider`) - included in SteelEngine. Adds NVIDIA model provider support to SteelEngine.

- **[oc-path](/plugins/reference/oc-path)** (`@steelengine/oc-path`) - included in SteelEngine. Adds the steelengine path CLI for oc:// workspace file addressing.

- **[ollama](/plugins/reference/ollama)** (`@steelengine/ollama-provider`) - included in SteelEngine. Adds Ollama, Ollama Cloud model provider support to SteelEngine.

- **[onepassword](/plugins/reference/onepassword)** (`@steelengine/onepassword`) - included in SteelEngine. Curated 1Password secrets broker with approval policy and SQLite audit history.

- **[open-prose](/plugins/reference/open-prose)** (`@steelengine/open-prose`) - included in SteelEngine. OpenProse VM skill pack with a /prose slash command.

- **[openai](/plugins/reference/openai)** (`@steelengine/openai-provider`) - included in SteelEngine. Adds OpenAI model provider support to SteelEngine.

- **[opencode](/plugins/reference/opencode)** (`@steelengine/opencode-provider`) - included in SteelEngine. Adds OpenCode model provider support to SteelEngine.

- **[opencode-go](/plugins/reference/opencode-go)** (`@steelengine/opencode-go-provider`) - included in SteelEngine. Adds OpenCode Go model provider support to SteelEngine.

- **[openrouter](/plugins/reference/openrouter)** (`@steelengine/openrouter-provider`) - included in SteelEngine. Adds OpenRouter model provider support to SteelEngine.

- **[policy](/plugins/reference/policy)** (`@steelengine/policy`) - included in SteelEngine. Adds policy-backed doctor checks for workspace conformance.

- **[reef](/plugins/reference/reef)** (`@steelengine/reef`) - included in SteelEngine. Guarded end-to-end encrypted claw channel.

- **[runway](/plugins/reference/runway)** (`@steelengine/runway-provider`) - included in SteelEngine. Adds video generation provider support.

- **[senseaudio](/plugins/reference/senseaudio)** (`@steelengine/senseaudio-provider`) - included in SteelEngine. Adds media understanding provider support.

- **[sglang](/plugins/reference/sglang)** (`@steelengine/sglang-provider`) - included in SteelEngine. Adds SGLang model provider support to SteelEngine.

- **[synthetic](/plugins/reference/synthetic)** (`@steelengine/synthetic-provider`) - included in SteelEngine. Adds Synthetic model provider support to SteelEngine.

- **[teams-meetings](/plugins/reference/teams-meetings)** (`@steelengine/teams-meetings`) - included in SteelEngine. Join Microsoft Teams meetings as a Chrome browser guest.

- **[telegram](/plugins/reference/telegram)** (`@steelengine/telegram`) - included in SteelEngine. Adds the Telegram channel surface for sending and receiving SteelEngine messages.

- **[together](/plugins/reference/together)** (`@steelengine/together-provider`) - included in SteelEngine. Adds Together model provider support to SteelEngine.

- **[tts-local-cli](/plugins/reference/tts-local-cli)** (`@steelengine/tts-local-cli`) - included in SteelEngine. Adds text-to-speech provider support.

- **[vault](/plugins/reference/vault)** (`@steelengine/vault`) - included in SteelEngine. HashiCorp Vault SecretRef provider integration.

- **[vllm](/plugins/reference/vllm)** (`@steelengine/vllm-provider`) - included in SteelEngine. Adds vLLM model provider support to SteelEngine.

- **[volcengine](/plugins/reference/volcengine)** (`@steelengine/volcengine-provider`) - included in SteelEngine. Adds Volcengine, Volcengine Plan model provider support to SteelEngine.

- **[voyage](/plugins/reference/voyage)** (`@steelengine/voyage-provider`) - included in SteelEngine. Adds memory embedding provider support.

- **[vydra](/plugins/reference/vydra)** (`@steelengine/vydra-provider`) - included in SteelEngine. Adds Vydra model provider support to SteelEngine.

- **[web-readability](/plugins/reference/web-readability)** (`@steelengine/web-readability-plugin`) - included in SteelEngine. Extract readable article content from local HTML web fetch responses.

- **[webhooks](/plugins/reference/webhooks)** (`@steelengine/webhooks`) - included in SteelEngine. Authenticated inbound webhooks that bind external automation to SteelEngine TaskFlows.

- **[workboard](/plugins/reference/workboard)** (`@steelengine/workboard`) - included in SteelEngine. Dashboard workboard for agent-owned issues and sessions.

- **[xai](/plugins/reference/xai)** (`@steelengine/xai-plugin`) - included in SteelEngine. Adds xAI model provider support to SteelEngine.

- **[xiaomi](/plugins/reference/xiaomi)** (`@steelengine/xiaomi-provider`) - included in SteelEngine. Adds Xiaomi, Xiaomi Token Plan model provider support to SteelEngine.

## Official external packages

72 plugins

- **[acpx](/plugins/reference/acpx)** (`@steelengine/acpx`) - npm; ClawHub. SteelEngine ACP runtime backend with plugin-owned session and transport management.

- **[amazon-bedrock](/plugins/reference/amazon-bedrock)** (`@steelengine/amazon-bedrock-provider`) - npm; ClawHub. SteelEngine Amazon Bedrock provider plugin with model discovery, embeddings, and guardrail support.

- **[amazon-bedrock-mantle](/plugins/reference/amazon-bedrock-mantle)** (`@steelengine/amazon-bedrock-mantle-provider`) - npm; ClawHub. SteelEngine Amazon Bedrock Mantle provider plugin for OpenAI-compatible model routing.

- **[anthropic-vertex](/plugins/reference/anthropic-vertex)** (`@steelengine/anthropic-vertex-provider`) - npm; ClawHub. SteelEngine Anthropic Vertex provider plugin for Claude models on Google Vertex AI.

- **[arcee](/plugins/reference/arcee)** (`@steelengine/arcee-provider`) - npm; ClawHub: `clawhub:@steelengine/arcee-provider`. Adds Arcee model provider support to SteelEngine.

- **[baseten](/plugins/reference/baseten)** (`@steelengine/baseten-provider`) - npm; ClawHub: `clawhub:@steelengine/baseten-provider`. SteelEngine Baseten provider plugin.

- **[brave](/plugins/reference/brave)** (`@steelengine/brave-plugin`) - npm; ClawHub. SteelEngine Brave Search provider plugin for web search.

- **[cerebras](/plugins/reference/cerebras)** (`@steelengine/cerebras-provider`) - npm; ClawHub: `clawhub:@steelengine/cerebras-provider`. Adds Cerebras model provider support to SteelEngine.

- **[chutes](/plugins/reference/chutes)** (`@steelengine/chutes-provider`) - npm; ClawHub: `clawhub:@steelengine/chutes-provider`. Adds Chutes model provider support to SteelEngine.

- **[clickclack](/plugins/reference/clickclack)** (`@steelengine/clickclack`) - npm; ClawHub: `clawhub:@steelengine/clickclack`. Adds the Clickclack channel surface for sending and receiving SteelEngine messages.

- **[cloudflare-ai-gateway](/plugins/reference/cloudflare-ai-gateway)** (`@steelengine/cloudflare-ai-gateway-provider`) - npm; ClawHub: `clawhub:@steelengine/cloudflare-ai-gateway-provider`. Adds Cloudflare AI Gateway model provider support to SteelEngine.

- **[codex](/plugins/reference/codex)** (`@steelengine/codex`) - npm; ClawHub. Codex app-server harness and native session catalog.

- **[copilot](/plugins/reference/copilot)** (`@steelengine/copilot`) - npm; ClawHub: `clawhub:@steelengine/copilot`. Registers the GitHub Copilot agent runtime.

- **[deepinfra](/plugins/reference/deepinfra)** (`@steelengine/deepinfra-provider`) - npm; ClawHub: `clawhub:@steelengine/deepinfra-provider`. Adds DeepInfra model provider support to SteelEngine.

- **[deepseek](/plugins/reference/deepseek)** (`@steelengine/deepseek-provider`) - npm; ClawHub: `clawhub:@steelengine/deepseek-provider`. Adds DeepSeek model provider support to SteelEngine.

- **[diagnostics-otel](/plugins/reference/diagnostics-otel)** (`@steelengine/diagnostics-otel`) - npm; ClawHub: `clawhub:@steelengine/diagnostics-otel`. SteelEngine diagnostics OpenTelemetry exporter for metrics, traces, and logs.

- **[diagnostics-prometheus](/plugins/reference/diagnostics-prometheus)** (`@steelengine/diagnostics-prometheus`) - npm; ClawHub: `clawhub:@steelengine/diagnostics-prometheus`. SteelEngine diagnostics Prometheus exporter for runtime metrics.

- **[diffs](/plugins/reference/diffs)** (`@steelengine/diffs`) - npm; ClawHub. SteelEngine read-only diff viewer plugin and file renderer for agents.

- **[diffs-language-pack](/plugins/reference/diffs-language-pack)** (`@steelengine/diffs-language-pack`) - npm; ClawHub: `clawhub:@steelengine/diffs-language-pack`. Adds syntax highlighting for languages outside the default diffs viewer set.

- **[discord](/plugins/reference/discord)** (`@steelengine/discord`) - npm; ClawHub. SteelEngine Discord channel plugin for channels, DMs, commands, and app events.

- **[exa](/plugins/reference/exa)** (`@steelengine/exa-plugin`) - npm; ClawHub: `clawhub:@steelengine/exa-plugin`. Adds web search provider support.

- **[featherless](/plugins/reference/featherless)** (`@steelengine/featherless-provider`) - npm; ClawHub: `clawhub:@steelengine/featherless-provider`. SteelEngine Featherless AI provider plugin.

- **[feishu](/plugins/reference/feishu)** (`@steelengine/feishu`) - npm; ClawHub. SteelEngine Feishu/Lark channel plugin for chats and workplace tools (community maintained by @m1heng).

- **[firecrawl](/plugins/reference/firecrawl)** (`@steelengine/firecrawl-plugin`) - npm; ClawHub: `clawhub:@steelengine/firecrawl-plugin`. Adds agent-callable tools. Adds web fetch provider support. Adds web search provider support.

- **[fireworks](/plugins/reference/fireworks)** (`@steelengine/fireworks-provider`) - npm; ClawHub: `clawhub:@steelengine/fireworks-provider`. Adds Fireworks model provider support to SteelEngine.

- **[gmi](/plugins/reference/gmi)** (`@steelengine/gmi-provider`) - npm; ClawHub: `clawhub:@steelengine/gmi-provider`. SteelEngine GMI Cloud provider plugin.

- **[google-meet](/plugins/reference/google-meet)** (`@steelengine/google-meet`) - npm; ClawHub. SteelEngine Google Meet participant plugin for joining calls through Chrome or Twilio transports.

- **[googlechat](/plugins/reference/googlechat)** (`@steelengine/googlechat`) - npm; ClawHub. SteelEngine Google Chat channel plugin for spaces and direct messages.

- **[gradium](/plugins/reference/gradium)** (`@steelengine/gradium-speech`) - npm; ClawHub: `clawhub:@steelengine/gradium-speech`. Adds text-to-speech provider support.

- **[groq](/plugins/reference/groq)** (`@steelengine/groq-provider`) - npm; ClawHub: `clawhub:@steelengine/groq-provider`. Adds Groq model provider support to SteelEngine.

- **[inworld](/plugins/reference/inworld)** (`@steelengine/inworld-speech`) - npm; ClawHub: `clawhub:@steelengine/inworld-speech`. Inworld streaming text-to-speech (MP3, OGG_OPUS, PCM telephony).

- **[irc](/plugins/reference/irc)** (`@steelengine/irc`) - npm; ClawHub: `clawhub:@steelengine/irc`. Adds the IRC channel surface for sending and receiving SteelEngine messages.

- **[kilocode](/plugins/reference/kilocode)** (`@steelengine/kilocode-provider`) - npm; ClawHub: `clawhub:@steelengine/kilocode-provider`. Adds Kilocode model provider support to SteelEngine.

- **[kimi](/plugins/reference/kimi)** (`@steelengine/kimi-provider`) - npm; ClawHub: `clawhub:@steelengine/kimi-provider`. Adds Kimi, Kimi Coding model provider support to SteelEngine.

- **[line](/plugins/reference/line)** (`@steelengine/line`) - npm; ClawHub. SteelEngine LINE channel plugin for LINE Bot API chats.

- **[llama-cpp](/plugins/reference/llama-cpp)** (`@steelengine/llama-cpp-provider`) - npm; ClawHub. Local GGUF text inference and embeddings through node-llama-cpp.

- **[lobster](/plugins/reference/lobster)** (`@steelengine/lobster`) - npm; ClawHub. Lobster workflow tool plugin for typed pipelines and resumable approvals.

- **[longcat](/plugins/reference/longcat)** (`@steelengine/longcat-provider`) - npm; ClawHub: `clawhub:@steelengine/longcat-provider`. SteelEngine LongCat provider plugin.

- **[matrix](/plugins/reference/matrix)** (`@steelengine/matrix`) - ClawHub: `clawhub:@steelengine/matrix`; npm. SteelEngine Matrix channel plugin for rooms and direct messages.

- **[mattermost](/plugins/reference/mattermost)** (`@steelengine/mattermost`) - npm; ClawHub: `clawhub:@steelengine/mattermost`. Adds the Mattermost channel surface for sending and receiving SteelEngine messages.

- **[memory-lancedb](/plugins/reference/memory-lancedb)** (`@steelengine/memory-lancedb`) - npm; ClawHub. SteelEngine LanceDB-backed long-term memory plugin with auto-recall, auto-capture, and vector search.

- **[moonshot](/plugins/reference/moonshot)** (`@steelengine/moonshot-provider`) - npm; ClawHub: `clawhub:@steelengine/moonshot-provider`. Adds Moonshot model provider support to SteelEngine.

- **[msteams](/plugins/reference/msteams)** (`@steelengine/msteams`) - npm; ClawHub. SteelEngine Microsoft Teams channel plugin for bot conversations.

- **[mxc](/plugins/reference/mxc)** (`@steelengine/mxc-sandbox`) - npm; ClawHub. OS-level sandboxed tool execution via MXC for MXC-capable Windows hosts: runs commands in ProcessContainer (Windows) with configured MXC policy files.

- **[nextcloud-talk](/plugins/reference/nextcloud-talk)** (`@steelengine/nextcloud-talk`) - npm; ClawHub. SteelEngine Nextcloud Talk channel plugin for conversations.

- **[nostr](/plugins/reference/nostr)** (`@steelengine/nostr`) - npm; ClawHub. SteelEngine Nostr channel plugin for NIP-04 encrypted direct messages.

- **[openshell](/plugins/reference/openshell)** (`@steelengine/openshell-sandbox`) - npm; ClawHub. SteelEngine sandbox backend for the NVIDIA OpenShell CLI with mirrored local workspaces and SSH command execution.

- **[parallel](/tools/parallel-search)** (`@steelengine/parallel-plugin`) - npm; ClawHub: `clawhub:@steelengine/parallel-plugin`. Adds web search provider support.

- **[perplexity](/plugins/reference/perplexity)** (`@steelengine/perplexity-plugin`) - npm; ClawHub: `clawhub:@steelengine/perplexity-plugin`. Adds web search provider support.

- **[pixverse](/plugins/reference/pixverse)** (`@steelengine/pixverse-provider`) - npm; ClawHub: `clawhub:@steelengine/pixverse-provider`. SteelEngine PixVerse video generation provider plugin.

- **[qianfan](/plugins/reference/qianfan)** (`@steelengine/qianfan-provider`) - npm; ClawHub: `clawhub:@steelengine/qianfan-provider`. Adds Qianfan model provider support to SteelEngine.

- **[qqbot](/plugins/reference/qqbot)** (`@steelengine/qqbot`) - npm; ClawHub. SteelEngine QQ Bot channel plugin for group and direct-message workflows.

- **[qwen](/plugins/reference/qwen)** (`@steelengine/qwen-provider`) - npm; ClawHub: `clawhub:@steelengine/qwen-provider`. Adds Qwen, Qwen Cloud, Model Studio, DashScope, Qwen Token Plan, Bailian Token Plan model provider support to SteelEngine.

- **[raft](/plugins/reference/raft)** (`@steelengine/raft`) - npm; ClawHub. SteelEngine Raft channel plugin for secure CLI wake bridges.

- **[searxng](/plugins/reference/searxng)** (`@steelengine/searxng-plugin`) - npm; ClawHub: `clawhub:@steelengine/searxng-plugin`. Adds web search provider support.

- **[signal](/plugins/reference/signal)** (`@steelengine/signal`) - npm; ClawHub: `clawhub:@steelengine/signal`. Adds the Signal channel surface for sending and receiving SteelEngine messages.

- **[slack](/plugins/reference/slack)** (`@steelengine/slack`) - npm; ClawHub. SteelEngine Slack channel plugin for channels, DMs, commands, and app events.

- **[sms](/plugins/reference/sms)** (`@steelengine/sms`) - npm; ClawHub: `clawhub:@steelengine/sms`. Twilio SMS channel plugin for SteelEngine text messages.

- **[stepfun](/plugins/reference/stepfun)** (`@steelengine/stepfun-provider`) - npm; ClawHub: `clawhub:@steelengine/stepfun-provider`. Adds StepFun, StepFun Plan model provider support to SteelEngine.

- **[synology-chat](/plugins/reference/synology-chat)** (`@steelengine/synology-chat`) - npm; ClawHub. Synology Chat channel plugin for SteelEngine channels and direct messages.

- **[tavily](/plugins/reference/tavily)** (`@steelengine/tavily-plugin`) - npm; ClawHub: `clawhub:@steelengine/tavily-plugin`. Adds agent-callable tools. Adds web search provider support.

- **[tencent](/plugins/reference/tencent)** (`@steelengine/tencent-provider`) - npm; ClawHub: `clawhub:@steelengine/tencent-provider`. Adds Tencent TokenHub, Tencent Tokenplan model provider support to SteelEngine.

- **[tlon](/plugins/reference/tlon)** (`@steelengine/tlon`) - npm; ClawHub. SteelEngine Tlon/Urbit channel plugin for chat workflows.

- **[tokenjuice](/plugins/reference/tokenjuice)** (`@steelengine/tokenjuice`) - npm; ClawHub: `clawhub:@steelengine/tokenjuice`. Compacts exec and bash tool results with tokenjuice reducers.

- **[twitch](/plugins/reference/twitch)** (`@steelengine/twitch`) - npm; ClawHub. SteelEngine Twitch channel plugin for chat and moderation workflows.

- **[venice](/plugins/reference/venice)** (`@steelengine/venice-provider`) - npm; ClawHub: `clawhub:@steelengine/venice-provider`. Adds Venice model provider support to SteelEngine.

- **[vercel-ai-gateway](/plugins/reference/vercel-ai-gateway)** (`@steelengine/vercel-ai-gateway-provider`) - npm; ClawHub: `clawhub:@steelengine/vercel-ai-gateway-provider`. Adds Vercel AI Gateway model provider support to SteelEngine.

- **[voice-call](/plugins/reference/voice-call)** (`@steelengine/voice-call`) - npm; ClawHub. SteelEngine voice-call plugin for Twilio, Telnyx, and Plivo phone calls.

- **[whatsapp](/plugins/reference/whatsapp)** (`@steelengine/whatsapp`) - ClawHub: `clawhub:@steelengine/whatsapp`; npm. SteelEngine WhatsApp channel plugin for WhatsApp Web chats.

- **[zai](/plugins/reference/zai)** (`@steelengine/zai-provider`) - npm; ClawHub: `clawhub:@steelengine/zai-provider`. Adds Z.AI model provider support to SteelEngine.

- **[zalo](/plugins/reference/zalo)** (`@steelengine/zalo`) - npm; ClawHub. SteelEngine Zalo channel plugin for bot and webhook chats.

- **[zalouser](/plugins/reference/zalouser)** (`@steelengine/zalouser`) - npm; ClawHub. SteelEngine Zalo Personal Account plugin via native zca-js integration.

## Source checkout only

2 plugins

- **[qa-channel](/plugins/reference/qa-channel)** (`@steelengine/qa-channel`) - source checkout only. Adds the QA Channel surface for sending and receiving SteelEngine messages.

- **[qa-lab](/plugins/reference/qa-lab)** (`@steelengine/qa-lab`) - source checkout only. SteelEngine QA lab plugin with private debugger UI and scenario runner.
