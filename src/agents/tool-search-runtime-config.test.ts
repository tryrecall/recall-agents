import { afterEach, describe, expect, it } from "vitest";
import { resetConfigRuntimeState, setRuntimeConfigSnapshot } from "../config/config.js";
import type { SteelEngineConfig } from "../config/types.steelengine.js";
import { resolveAgentRuntimeToolConfig } from "./tool-runtime-config.js";
import { resolveAgentToolSearchRuntimeConfig } from "./tool-search-runtime-config.js";

function createRuntimeConfigPair() {
  const sourceConfig = {
    agents: { defaults: { experimental: { localModelLean: true } } },
    plugins: {
      entries: {
        "example-plugin": {
          config: {
            marker: {
              source: "exec",
              provider: "example",
              id: "example/value",
            },
          },
        },
      },
    },
  } as SteelEngineConfig;
  const runtimeConfig = {
    ...sourceConfig,
    plugins: {
      entries: {
        "example-plugin": {
          config: { marker: "resolved" },
        },
      },
    },
  } as SteelEngineConfig;
  return { runtimeConfig, sourceConfig };
}

describe("resolveAgentToolSearchRuntimeConfig", () => {
  afterEach(() => {
    resetConfigRuntimeState();
  });

  it("applies Tool Search defaults after selecting the resolved runtime snapshot", () => {
    const { runtimeConfig, sourceConfig } = createRuntimeConfigPair();
    setRuntimeConfigSnapshot(runtimeConfig, sourceConfig);

    const resolved = resolveAgentToolSearchRuntimeConfig({ config: sourceConfig });

    expect(resolved?.tools?.toolSearch).toEqual({
      enabled: true,
      mode: "tools",
      searchDefaultLimit: 5,
      maxSearchLimit: 10,
    });
    expect(resolved?.plugins?.entries?.["example-plugin"]?.config).toMatchObject({
      marker: "resolved",
    });
    expect(runtimeConfig.tools).toBeUndefined();
    expect(sourceConfig.plugins?.entries?.["example-plugin"]?.config).toMatchObject({
      marker: {
        source: "exec",
        provider: "example",
        id: "example/value",
      },
    });
  });

  it("returns the resolved snapshot unchanged for direct-message-only tool surfaces", () => {
    const { runtimeConfig, sourceConfig } = createRuntimeConfigPair();
    setRuntimeConfigSnapshot(runtimeConfig, sourceConfig);

    expect(
      resolveAgentToolSearchRuntimeConfig({
        config: sourceConfig,
        forceDirectMessageTool: true,
      }),
    ).toBe(runtimeConfig);
  });

  it("preserves an explicit config that is unrelated to the active source snapshot", () => {
    const { runtimeConfig, sourceConfig } = createRuntimeConfigPair();
    setRuntimeConfigSnapshot(runtimeConfig, sourceConfig);
    const explicitConfig = {
      plugins: {
        entries: {
          "example-plugin": { config: { marker: "explicit" } },
        },
      },
    } as SteelEngineConfig;

    expect(resolveAgentRuntimeToolConfig(explicitConfig)).toBe(explicitConfig);
    expect(resolveAgentToolSearchRuntimeConfig({ config: explicitConfig })).toBe(explicitConfig);
  });

  it("uses the input config when no runtime snapshot exists", () => {
    const config = { tools: { toolSearch: false } } as SteelEngineConfig;

    expect(resolveAgentRuntimeToolConfig(config)).toBe(config);
    expect(resolveAgentToolSearchRuntimeConfig({ config })).toBe(config);
  });
});
