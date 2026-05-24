import { describe, expect, it } from "vitest";
import type { RecallConfig } from "../config/types.recall.js";
import { resolveCliRuntimeExecutionProvider } from "./model-runtime-aliases.js";

function createAnthropicAuthConfig(params: {
  order?: string[];
  models?: NonNullable<NonNullable<RecallConfig["agents"]>["defaults"]>["models"];
}): RecallConfig {
  return {
    auth: {
      order: params.order ? { anthropic: params.order } : undefined,
      profiles: {
        "anthropic:api": { provider: "anthropic", mode: "api_key" },
        "anthropic:claude-cli": { provider: "claude-cli", mode: "oauth" },
      },
    },
    agents: {
      defaults: {
        models: params.models,
      },
    },
  } as RecallConfig;
}

describe("resolveCliRuntimeExecutionProvider", () => {
  it("routes Anthropic execution to Claude CLI when the selected auth profile is Claude CLI", () => {
    expect(
      resolveCliRuntimeExecutionProvider({
        cfg: createAnthropicAuthConfig({ order: ["anthropic:claude-cli"] }),
        provider: "anthropic",
        modelId: "opus-4.7",
      }),
    ).toBe("claude-cli");
  });

  it("keeps direct Anthropic execution when the selected auth profile is direct Anthropic", () => {
    expect(
      resolveCliRuntimeExecutionProvider({
        cfg: createAnthropicAuthConfig({
          order: ["anthropic:api", "anthropic:claude-cli"],
        }),
        provider: "anthropic",
        modelId: "opus-4.7",
      }),
    ).toBeUndefined();
  });

  it("honors an explicit direct Anthropic auth profile over CLI auth order", () => {
    expect(
      resolveCliRuntimeExecutionProvider({
        authProfileId: "anthropic:api",
        cfg: createAnthropicAuthConfig({ order: ["anthropic:claude-cli"] }),
        provider: "anthropic",
        modelId: "opus-4.7",
      }),
    ).toBeUndefined();
  });

  it("uses an explicit Claude CLI auth profile without a model-runtime entry", () => {
    expect(
      resolveCliRuntimeExecutionProvider({
        authProfileId: "anthropic:claude-cli",
        cfg: createAnthropicAuthConfig({ order: ["anthropic:api"] }),
        provider: "anthropic",
        modelId: "opus-4.7",
      }),
    ).toBe("claude-cli");
  });

  it("does not override an explicit PI model-runtime policy with CLI auth", () => {
    expect(
      resolveCliRuntimeExecutionProvider({
        cfg: createAnthropicAuthConfig({
          order: ["anthropic:claude-cli"],
          models: {
            "anthropic/opus-4.7": { agentRuntime: { id: "pi" } },
          },
        }),
        provider: "anthropic",
        modelId: "opus-4.7",
      }),
    ).toBeUndefined();
  });
});
