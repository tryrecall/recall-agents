type McpLoopbackRuntime = {
  port: number;
  ownerToken: string;
  nonOwnerToken: string;
};

let activeRuntime: McpLoopbackRuntime | undefined;

export function getActiveMcpLoopbackRuntime(): McpLoopbackRuntime | undefined {
  return activeRuntime ? { ...activeRuntime } : undefined;
}

export function setActiveMcpLoopbackRuntime(runtime: McpLoopbackRuntime): void {
  activeRuntime = { ...runtime };
}

export function resolveMcpLoopbackBearerToken(
  runtime: McpLoopbackRuntime,
  senderIsOwner: boolean,
): string {
  return senderIsOwner ? runtime.ownerToken : runtime.nonOwnerToken;
}

export function clearActiveMcpLoopbackRuntimeByOwnerToken(ownerToken: string): void {
  if (activeRuntime?.ownerToken === ownerToken) {
    activeRuntime = undefined;
  }
}

export function createMcpLoopbackServerConfig(port: number) {
  return {
    mcpServers: {
      recall: {
        type: "http",
        url: `http://127.0.0.1:${port}/mcp`,
        headers: {
          Authorization: "Bearer ${RECALL_MCP_TOKEN}",
          "x-session-key": "${RECALL_MCP_SESSION_KEY}",
          "x-recall-agent-id": "${RECALL_MCP_AGENT_ID}",
          "x-recall-account-id": "${RECALL_MCP_ACCOUNT_ID}",
          "x-recall-message-channel": "${RECALL_MCP_MESSAGE_CHANNEL}",
          "x-recall-inbound-event-kind": "${RECALL_MCP_INBOUND_EVENT_KIND}",
        },
      },
    },
  };
}
