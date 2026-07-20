// Verifies gateway client capabilities are hard availability requirements for tools.
import { describe, expect, it, vi } from "vitest";

vi.mock("./steelengine-plugin-tools.js", () => ({
  resolveSteelEnginePluginToolsForOptions: () => [
    {
      name: "show_widget",
      label: "Show widget",
      description: "Test capability-gated tool",
      parameters: { type: "object", properties: {} },
      requiredClientCaps: ["inline-widgets"],
      execute: async () => ({ content: [], details: {} }),
    },
  ],
}));

import { createSteelEngineCodingTools } from "./agent-tools.js";
import { createSteelEngineTools } from "./steelengine-tools.js";

function hasWidget(tools: readonly { name: string }[]): boolean {
  return tools.some((tool) => tool.name === "show_widget");
}

function hasScreen(tools: readonly { name: string }[]): boolean {
  return tools.some((tool) => tool.name === "screen");
}

function hasTerminal(tools: readonly { name: string }[]): boolean {
  return tools.some((tool) => tool.name === "terminal");
}

describe("gateway client capability tool filtering", () => {
  it("excludes capability-gated tools when no gateway client caps exist", () => {
    expect(hasWidget(createSteelEngineTools())).toBe(false);
  });

  it("excludes capability-gated tools when a required cap is absent", () => {
    expect(hasWidget(createSteelEngineTools({ clientCaps: ["tool-events"] }))).toBe(false);
  });

  it("includes capability-gated tools when the client caps are a superset", () => {
    expect(hasWidget(createSteelEngineTools({ clientCaps: ["tool-events", "inline-widgets"] }))).toBe(
      true,
    );
  });

  it("only exposes screen to UI-command clients", () => {
    expect(hasScreen(createSteelEngineTools())).toBe(false);
    expect(hasScreen(createSteelEngineTools({ clientCaps: ["ui-commands"] }))).toBe(true);
  });

  it("omits terminal for sandboxed agents", () => {
    expect(hasTerminal(createSteelEngineTools({ agentSessionKey: "agent:main:main" }))).toBe(true);
    expect(
      hasTerminal(createSteelEngineTools({ agentSessionKey: "agent:main:main", sandboxed: true })),
    ).toBe(false);
  });

  it("does not let tools.allow resurrect a gated tool for a channel run", () => {
    const tools = createSteelEngineCodingTools({
      messageProvider: "telegram",
      disableMessageTool: true,
      config: { tools: { allow: ["show_widget"] } },
      toolConstructionPlan: {
        includeBaseCodingTools: false,
        includeShellTools: false,
        includeChannelTools: false,
        includeSteelEngineTools: true,
        includePluginTools: true,
      },
    });

    expect(hasWidget(tools)).toBe(false);
  });

  it("filters gated tools on plugin-only construction plans", () => {
    // Regression: plugin-only plans bypass createSteelEngineTools, which used to
    // skip the capability gate entirely for narrow allowlists.
    const plan = {
      includeBaseCodingTools: false,
      includeShellTools: false,
      includeChannelTools: false,
      includeSteelEngineTools: false,
      includePluginTools: true,
    };

    expect(
      hasWidget(
        createSteelEngineCodingTools({ messageProvider: "telegram", toolConstructionPlan: plan }),
      ),
    ).toBe(false);
    expect(
      hasWidget(
        createSteelEngineCodingTools({
          messageProvider: "webchat",
          clientCaps: ["inline-widgets"],
          toolConstructionPlan: plan,
        }),
      ),
    ).toBe(true);
  });
});
