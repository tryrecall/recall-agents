/**
 * Standalone MCP server for selected built-in SteelEngine tools.
 *
 * Run via: node --import tsx src/mcp/steelengine-tools-serve.ts
 * Or: bun src/mcp/steelengine-tools-serve.ts
 */
import { pathToFileURL } from "node:url";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import type { AnyAgentTool } from "../agents/tools/common.js";
import { createCronTool } from "../agents/tools/cron-tool.js";
import { createSystemAgentTool } from "../agents/tools/system-agent-tool.js";
import type { SystemAgentToolOptions } from "../agents/tools/system-agent-tool.js";
import { formatErrorMessage } from "../infra/errors.js";
import {
  STEELENGINE_TOOLS_MCP_AGENT_SESSION_KEY_ENV,
  resolveToolsMcpAgentSessionKey,
} from "./agent-session-env.js";
import {
  resolveSteelEngineToolsMcpSystemAgentApproval,
  resolveSteelEngineToolsMcpSystemAgentSurface,
  resolveSteelEngineToolsMcpToolSelection,
  type SteelEngineToolsMcpToolId,
} from "./steelengine-tools-serve-config.js";
import { connectToolsMcpServerToStdio, createToolsMcpServer } from "./tools-stdio-server.js";

export {
  STEELENGINE_TOOLS_MCP_SYSTEM_AGENT_SURFACE_ENV,
  STEELENGINE_TOOLS_MCP_TOOLS_ENV,
} from "./steelengine-tools-serve-config.js";

export { STEELENGINE_TOOLS_MCP_AGENT_SESSION_KEY_ENV } from "./agent-session-env.js";

export function resolveSteelEngineToolsMcpAgentSessionKey(
  env: NodeJS.ProcessEnv = process.env,
): string | undefined {
  return resolveToolsMcpAgentSessionKey(env);
}

export function resolveSteelEngineToolsForMcp(
  params: {
    agentSessionKey?: string;
    tools?: SteelEngineToolsMcpToolId[];
    systemAgentSurface?: SystemAgentToolOptions["surface"];
  } = {},
): AnyAgentTool[] {
  const selection = params.tools ?? resolveSteelEngineToolsMcpToolSelection();
  return selection.map((tool) => {
    if (tool === "steelengine") {
      return createSystemAgentTool({
        surface: params.systemAgentSurface ?? resolveSteelEngineToolsMcpSystemAgentSurface(),
        ...resolveSteelEngineToolsMcpSystemAgentApproval(),
      });
    }
    const agentSessionKey = (
      params.agentSessionKey ?? resolveSteelEngineToolsMcpAgentSessionKey()
    )?.trim();
    if (!agentSessionKey) {
      throw new Error(`${STEELENGINE_TOOLS_MCP_AGENT_SESSION_KEY_ENV} is required`);
    }
    return createCronTool({ agentSessionKey, creatorToolAllowlist: [{ name: "cron" }] });
  });
}

function createSteelEngineToolsMcpServer(
  params: {
    tools?: AnyAgentTool[];
  } = {},
): Server {
  const tools = params.tools ?? resolveSteelEngineToolsForMcp();
  return createToolsMcpServer({ name: "steelengine-tools", tools });
}

async function serveSteelEngineToolsMcp(): Promise<void> {
  const server = createSteelEngineToolsMcpServer();
  await connectToolsMcpServerToStdio(server);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  serveSteelEngineToolsMcp().catch((err: unknown) => {
    process.stderr.write(`steelengine-tools-serve: ${formatErrorMessage(err)}\n`);
    process.exit(1);
  });
}
