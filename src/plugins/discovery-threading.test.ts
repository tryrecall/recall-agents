// Covers plugin discovery threading and concurrency behavior.
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { PluginDiscoveryResult } from "./discovery.js";

const discoverSteelEnginePluginsMock = vi.fn();

vi.mock("./discovery.js", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./discovery.js")>();
  return {
    ...actual,
    discoverSteelEnginePlugins: (...args: unknown[]) => discoverSteelEnginePluginsMock(...args),
  };
});

const { loadPluginManifestRegistry } = await import("./manifest-registry.js");
const { resolveInstalledPluginIndexRegistry } =
  await import("./installed-plugin-index-registry.js");

const emptyDiscovery: PluginDiscoveryResult = { candidates: [], diagnostics: [] };

describe("discovery threading", () => {
  beforeEach(() => {
    discoverSteelEnginePluginsMock.mockReset();
    discoverSteelEnginePluginsMock.mockReturnValue(emptyDiscovery);
  });

  it("skips internal discoverSteelEnginePlugins when discovery is supplied", () => {
    loadPluginManifestRegistry({ discovery: emptyDiscovery });
    expect(discoverSteelEnginePluginsMock).not.toHaveBeenCalled();

    discoverSteelEnginePluginsMock.mockClear();
    resolveInstalledPluginIndexRegistry({ discovery: emptyDiscovery, installRecords: {} });
    expect(discoverSteelEnginePluginsMock).not.toHaveBeenCalled();
  });

  it("calls discoverSteelEnginePlugins when neither discovery nor candidates supplied", () => {
    loadPluginManifestRegistry({});
    expect(discoverSteelEnginePluginsMock).toHaveBeenCalledTimes(1);

    discoverSteelEnginePluginsMock.mockClear();
    resolveInstalledPluginIndexRegistry({ installRecords: {} });
    expect(discoverSteelEnginePluginsMock).toHaveBeenCalledTimes(1);
  });

  it("prefers explicit candidates over discovery when both are supplied", () => {
    loadPluginManifestRegistry({ candidates: [], diagnostics: [], discovery: emptyDiscovery });
    expect(discoverSteelEnginePluginsMock).not.toHaveBeenCalled();

    discoverSteelEnginePluginsMock.mockClear();
    resolveInstalledPluginIndexRegistry({
      candidates: [],
      discovery: emptyDiscovery,
      installRecords: {},
    });
    expect(discoverSteelEnginePluginsMock).not.toHaveBeenCalled();
  });
});
