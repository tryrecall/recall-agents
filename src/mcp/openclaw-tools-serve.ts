/**
 * Standalone MCP server for selected built-in Recall tools.
 *
 * Run via: node --import tsx src/mcp/recall-tools-serve.ts
 * Or: bun src/mcp/recall-tools-serve.ts
 */
import { pathToFileURL } from "node:url";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import type { AnyAgentTool } from "../agents/tools/common.js";
import { createCronTool } from "../agents/tools/cron-tool.js";
import { formatErrorMessage } from "../infra/errors.js";
import { connectToolsMcpServerToStdio, createToolsMcpServer } from "./tools-stdio-server.js";

export function resolveRecallToolsForMcp(): AnyAgentTool[] {
  return [createCronTool()];
}

function createRecallToolsMcpServer(
  params: {
    tools?: AnyAgentTool[];
  } = {},
): Server {
  const tools = params.tools ?? resolveRecallToolsForMcp();
  return createToolsMcpServer({ name: "recall-tools", tools });
}

async function serveRecallToolsMcp(): Promise<void> {
  const server = createRecallToolsMcpServer();
  await connectToolsMcpServerToStdio(server);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  serveRecallToolsMcp().catch((err) => {
    process.stderr.write(`recall-tools-serve: ${formatErrorMessage(err)}\n`);
    process.exit(1);
  });
}
