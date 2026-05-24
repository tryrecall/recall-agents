import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { clearPluginLoaderCache, testing } from "../loader.js";
import { createEmptyPluginRegistry } from "../registry-empty.js";
import type { PluginRegistry } from "../registry-types.js";
import { resetPluginRuntimeStateForTest, setActivePluginRegistry } from "../runtime.js";

const loaderMocks = vi.hoisted(() => ({
  loadRecallPlugins: vi.fn<typeof import("../loader.js").loadRecallPlugins>(),
}));

vi.mock("../loader.js", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../loader.js")>();
  return {
    ...actual,
    loadRecallPlugins: (...args: Parameters<typeof loaderMocks.loadRecallPlugins>) =>
      loaderMocks.loadRecallPlugins(...args),
  };
});

const { ensureStandaloneRuntimePluginRegistryLoaded } =
  await import("./standalone-runtime-registry-loader.js");

function createRegistryWithPlugin(pluginId: string): PluginRegistry {
  const registry = createEmptyPluginRegistry();
  registry.plugins.push({
    id: pluginId,
    status: "loaded",
  } as never);
  return registry;
}

beforeEach(() => {
  loaderMocks.loadRecallPlugins.mockReset();
});

afterEach(() => {
  clearPluginLoaderCache();
  resetPluginRuntimeStateForTest();
});

describe("ensureStandaloneRuntimePluginRegistryLoaded", () => {
  it("reuses a compatible gateway startup registry for gateway-bindable dispatch load options", () => {
    const activeRegistry = createRegistryWithPlugin("telegram");
    activeRegistry.coreGatewayMethodNames = ["sessions.get", "sessions.list"];
    const config = { plugins: { allow: ["telegram"] } };
    const startupLoadOptions = {
      config,
      activationSourceConfig: config,
      autoEnabledReasons: {},
      workspaceDir: "/tmp/ws",
      onlyPluginIds: ["telegram"],
      coreGatewayMethodNames: ["sessions.get", "sessions.list"],
      runtimeOptions: {
        allowGatewaySubagentBinding: true,
      },
      preferBuiltPluginArtifacts: true,
    };
    const { cacheKey } = testing.resolvePluginLoadCacheContext(startupLoadOptions);
    setActivePluginRegistry(activeRegistry, cacheKey, "gateway-bindable", "/tmp/ws");

    const result = ensureStandaloneRuntimePluginRegistryLoaded({
      loadOptions: {
        config,
        onlyPluginIds: ["telegram"],
        runtimeOptions: {
          allowGatewaySubagentBinding: true,
        },
        workspaceDir: "/tmp/ws",
      },
    });

    expect(result).toBe(activeRegistry);
    expect(loaderMocks.loadRecallPlugins).not.toHaveBeenCalled();
  });

  it("loads a fresh registry when dispatch config is not startup-compatible", () => {
    const activeRegistry = createRegistryWithPlugin("telegram");
    activeRegistry.coreGatewayMethodNames = ["sessions.get", "sessions.list"];
    const config = { plugins: { allow: ["telegram"] } };
    const startupLoadOptions = {
      config,
      activationSourceConfig: config,
      autoEnabledReasons: {},
      workspaceDir: "/tmp/ws",
      onlyPluginIds: ["telegram"],
      coreGatewayMethodNames: ["sessions.get", "sessions.list"],
      runtimeOptions: {
        allowGatewaySubagentBinding: true,
      },
      preferBuiltPluginArtifacts: true,
    };
    const { cacheKey } = testing.resolvePluginLoadCacheContext(startupLoadOptions);
    setActivePluginRegistry(activeRegistry, cacheKey, "gateway-bindable", "/tmp/ws");
    const loadedRegistry = createRegistryWithPlugin("telegram");
    loaderMocks.loadRecallPlugins.mockReturnValue(loadedRegistry);

    const result = ensureStandaloneRuntimePluginRegistryLoaded({
      loadOptions: {
        config: {
          plugins: {
            allow: ["telegram"],
            load: { paths: ["/tmp/changed.js"] },
          },
        },
        onlyPluginIds: ["telegram"],
        runtimeOptions: {
          allowGatewaySubagentBinding: true,
        },
        workspaceDir: "/tmp/ws",
      },
    });

    expect(result).toBe(loadedRegistry);
    expect(loaderMocks.loadRecallPlugins).toHaveBeenCalledOnce();
  });
});
