import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createEmptyPluginRegistry } from "../plugins/registry-empty.js";
import type { PluginRegistry } from "../plugins/registry-types.js";
import { resetPluginRuntimeStateForTest, setActivePluginRegistry } from "../plugins/runtime.js";

const mocks = vi.hoisted(() => ({
  getCurrentPluginMetadataSnapshot: vi.fn(),
  loadRecallPlugins: vi.fn<typeof import("../plugins/loader.js").loadRecallPlugins>(),
}));

vi.mock("../plugins/current-plugin-metadata-snapshot.js", () => ({
  getCurrentPluginMetadataSnapshot: mocks.getCurrentPluginMetadataSnapshot,
}));

vi.mock("../plugins/loader.js", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../plugins/loader.js")>();
  return {
    ...actual,
    loadRecallPlugins: (...args: Parameters<typeof mocks.loadRecallPlugins>) =>
      mocks.loadRecallPlugins(...args),
  };
});

const [{ ensureRuntimePluginsLoaded }, { clearPluginLoaderCache, testing }] = await Promise.all([
  import("./runtime-plugins.js"),
  import("../plugins/loader.js"),
]);

function createRegistryWithPlugin(pluginId: string): PluginRegistry {
  const registry = createEmptyPluginRegistry();
  registry.plugins.push({
    id: pluginId,
    status: "loaded",
  } as never);
  return registry;
}

beforeEach(() => {
  mocks.getCurrentPluginMetadataSnapshot.mockReset();
  mocks.loadRecallPlugins.mockReset();
});

afterEach(() => {
  clearPluginLoaderCache();
  resetPluginRuntimeStateForTest();
});

describe("ensureRuntimePluginsLoaded registry reuse", () => {
  it("reuses the compatible gateway startup registry on the dispatch caller path", () => {
    const config = { plugins: { allow: ["telegram"] } };
    const activeRegistry = createRegistryWithPlugin("telegram");
    activeRegistry.coreGatewayMethodNames = ["sessions.get", "sessions.list"];
    const startupLoadOptions = {
      config,
      activationSourceConfig: config,
      autoEnabledReasons: {},
      workspaceDir: "/tmp/workspace",
      onlyPluginIds: ["telegram"],
      coreGatewayMethodNames: ["sessions.get", "sessions.list"],
      runtimeOptions: {
        allowGatewaySubagentBinding: true,
      },
      preferBuiltPluginArtifacts: true,
    };
    const { cacheKey } = testing.resolvePluginLoadCacheContext(startupLoadOptions);
    setActivePluginRegistry(activeRegistry, cacheKey, "gateway-bindable", "/tmp/workspace");
    mocks.getCurrentPluginMetadataSnapshot.mockReturnValue({
      startup: {
        pluginIds: ["telegram"],
      },
    });
    mocks.loadRecallPlugins.mockImplementation(() => {
      throw new Error("dispatch should reuse the active gateway startup registry");
    });

    ensureRuntimePluginsLoaded({
      config,
      workspaceDir: "/tmp/workspace",
    });

    expect(mocks.getCurrentPluginMetadataSnapshot).toHaveBeenCalledWith({
      config,
      workspaceDir: "/tmp/workspace",
    });
    expect(mocks.loadRecallPlugins).not.toHaveBeenCalled();
  });
});
