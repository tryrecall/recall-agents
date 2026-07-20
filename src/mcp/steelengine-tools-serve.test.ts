// SteelEngine MCP tools tests cover core tool server startup and registration.
import { afterEach, describe, expect, it, vi } from "vitest";
import { hashSystemAgentOperation } from "../agents/tools/system-agent-tool.js";
import {
  buildSystemAgentToolsMcpServerConfig,
  STEELENGINE_TOOLS_MCP_SYSTEM_AGENT_APPROVAL_ARMED_ENV,
  STEELENGINE_TOOLS_MCP_SYSTEM_AGENT_PROPOSAL_ENV,
  STEELENGINE_TOOLS_MCP_SYSTEM_AGENT_SURFACE_ENV,
  STEELENGINE_TOOLS_MCP_TOOLS_ENV,
  resolveSteelEngineToolsMcpSystemAgentSurface,
  resolveSteelEngineToolsMcpToolSelection,
} from "./steelengine-tools-serve-config.js";
import {
  STEELENGINE_TOOLS_MCP_AGENT_SESSION_KEY_ENV,
  resolveSteelEngineToolsForMcp,
  resolveSteelEngineToolsMcpAgentSessionKey,
} from "./steelengine-tools-serve.js";
import { createPluginToolsMcpHandlers } from "./plugin-tools-handlers.js";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("SteelEngine tools MCP server", () => {
  it("exposes cron", async () => {
    const handlers = createPluginToolsMcpHandlers(
      resolveSteelEngineToolsForMcp({ agentSessionKey: "agent:worker:main" }),
    );

    const listed = await handlers.listTools();
    expect(listed.tools.map((tool) => tool.name)).toContain("cron");
  });

  it("requires the managed bridge to pass a real agent session key", () => {
    expect(() => resolveSteelEngineToolsForMcp({ agentSessionKey: "" })).toThrow(
      STEELENGINE_TOOLS_MCP_AGENT_SESSION_KEY_ENV,
    );
  });

  it("reads the managed bridge agent session key from env", () => {
    expect(
      resolveSteelEngineToolsMcpAgentSessionKey({
        [STEELENGINE_TOOLS_MCP_AGENT_SESSION_KEY_ENV]: " agent:worker:main ",
      }),
    ).toBe("agent:worker:main");
  });

  it("serves the ring-zero steelengine tool without an agent session key", async () => {
    const handlers = createPluginToolsMcpHandlers(
      resolveSteelEngineToolsForMcp({ tools: ["steelengine"], systemAgentSurface: "cli" }),
    );

    const listed = await handlers.listTools();
    expect(listed.tools.map((tool) => tool.name)).toEqual(["steelengine"]);
  });

  it("returns approved CLI MCP mutations to the host instead of applying them", async () => {
    const operation = { kind: "config-set", path: "gateway.port", value: "19001" } as const;
    vi.stubEnv(STEELENGINE_TOOLS_MCP_SYSTEM_AGENT_APPROVAL_ARMED_ENV, "1");
    vi.stubEnv(STEELENGINE_TOOLS_MCP_SYSTEM_AGENT_PROPOSAL_ENV, hashSystemAgentOperation(operation));
    const handlers = createPluginToolsMcpHandlers(
      resolveSteelEngineToolsForMcp({ tools: ["steelengine"], systemAgentSurface: "cli" }),
    );

    const result = await handlers.callTool({
      name: "steelengine",
      arguments: {
        action: "config_set",
        path: "gateway.port",
        value: "19001",
        approved: true,
      },
    });

    expect(JSON.stringify(result)).toContain("directive:approved-operation:");
  });

  it("parses the served tool selection from env and defaults to cron", () => {
    expect(resolveSteelEngineToolsMcpToolSelection({})).toEqual(["cron"]);
    expect(
      resolveSteelEngineToolsMcpToolSelection({
        [STEELENGINE_TOOLS_MCP_TOOLS_ENV]: " steelengine , cron ",
      }),
    ).toEqual(["steelengine", "cron"]);
    expect(() =>
      resolveSteelEngineToolsMcpToolSelection({ [STEELENGINE_TOOLS_MCP_TOOLS_ENV]: "exec" }),
    ).toThrow(STEELENGINE_TOOLS_MCP_TOOLS_ENV);
  });

  it("parses the steelengine surface from env and defaults to cli", () => {
    expect(resolveSteelEngineToolsMcpSystemAgentSurface({})).toBe("cli");
    expect(
      resolveSteelEngineToolsMcpSystemAgentSurface({
        [STEELENGINE_TOOLS_MCP_SYSTEM_AGENT_SURFACE_ENV]: "gateway",
      }),
    ).toBe("gateway");
    expect(() =>
      resolveSteelEngineToolsMcpSystemAgentSurface({
        [STEELENGINE_TOOLS_MCP_SYSTEM_AGENT_SURFACE_ENV]: "remote",
      }),
    ).toThrow(STEELENGINE_TOOLS_MCP_SYSTEM_AGENT_SURFACE_ENV);
  });

  it("builds a steelengine-only stdio server config under the steelengine name", () => {
    const config = buildSystemAgentToolsMcpServerConfig({ surface: "gateway" });

    expect(Object.keys(config.mcpServers)).toEqual(["steelengine"]);
    const server = config.mcpServers.steelengine as {
      command?: string;
      args?: string[];
      env?: Record<string, string>;
    };
    expect(server.command).toBe(process.execPath);
    expect(server.args?.at(-1)).toMatch(/steelengine-tools-serve\.(js|ts)$/);
    expect(server.env).toEqual({
      [STEELENGINE_TOOLS_MCP_TOOLS_ENV]: "steelengine",
      [STEELENGINE_TOOLS_MCP_SYSTEM_AGENT_SURFACE_ENV]: "gateway",
    });
  });
});
