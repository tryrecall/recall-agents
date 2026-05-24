import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import type { RecallConfig } from "../config/types.recall.js";
import { VERSION } from "../version.js";
import { RecallChannelBridge } from "./channel-bridge.js";
import { ClaudePermissionRequestSchema, type ClaudeChannelMode } from "./channel-shared.js";
import { getChannelMcpCapabilities, registerChannelMcpTools } from "./channel-tools.js";

export { RecallChannelBridge } from "./channel-bridge.js";

export type RecallMcpServeOptions = {
  gatewayUrl?: string;
  gatewayToken?: string;
  gatewayPassword?: string;
  config?: RecallConfig;
  claudeChannelMode?: ClaudeChannelMode;
  verbose?: boolean;
};

async function resolveMcpConfig(config: RecallConfig | undefined): Promise<RecallConfig> {
  if (config) {
    return config;
  }
  const { getRuntimeConfig } = await import("../config/config.js");
  return getRuntimeConfig();
}

export async function createRecallChannelMcpServer(opts: RecallMcpServeOptions = {}): Promise<{
  server: McpServer;
  bridge: RecallChannelBridge;
  start: () => Promise<void>;
  close: () => Promise<void>;
}> {
  const cfg = await resolveMcpConfig(opts.config);
  const claudeChannelMode = opts.claudeChannelMode ?? "auto";
  const capabilities = getChannelMcpCapabilities(claudeChannelMode);
  const server = new McpServer(
    { name: "recall", version: VERSION },
    capabilities ? { capabilities } : undefined,
  );
  const bridge = new RecallChannelBridge(cfg, {
    gatewayUrl: opts.gatewayUrl,
    gatewayToken: opts.gatewayToken,
    gatewayPassword: opts.gatewayPassword,
    claudeChannelMode,
    verbose: opts.verbose ?? false,
  });
  bridge.setServer(server);

  server.server.setNotificationHandler(ClaudePermissionRequestSchema, async ({ params }) => {
    await bridge.handleClaudePermissionRequest({
      requestId: params.request_id,
      toolName: params.tool_name,
      description: params.description,
      inputPreview: params.input_preview,
    });
  });
  registerChannelMcpTools(server, bridge);

  return {
    server,
    bridge,
    start: async () => {
      await bridge.start();
    },
    close: async () => {
      await bridge.close();
      await server.close();
    },
  };
}

export async function serveRecallChannelMcp(opts: RecallMcpServeOptions = {}): Promise<void> {
  const { server, start, close } = await createRecallChannelMcpServer(opts);
  const transport = new StdioServerTransport();

  let shuttingDown = false;
  let resolveClosed!: () => void;
  const closed = new Promise<void>((resolve) => {
    resolveClosed = resolve;
  });

  const shutdown = () => {
    if (shuttingDown) {
      return;
    }
    shuttingDown = true;
    process.stdin.off("end", shutdown);
    process.stdin.off("close", shutdown);
    process.off("SIGINT", shutdown);
    process.off("SIGTERM", shutdown);
    transport["onclose"] = undefined;
    close().then(resolveClosed, resolveClosed);
  };

  transport["onclose"] = shutdown;
  process.stdin.once("end", shutdown);
  process.stdin.once("close", shutdown);
  process.once("SIGINT", shutdown);
  process.once("SIGTERM", shutdown);

  try {
    await server.connect(transport);
    await start();
    await closed;
  } finally {
    shutdown();
    await closed;
  }
}
