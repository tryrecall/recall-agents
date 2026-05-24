import { beforeEach, describe, expect, it, vi } from "vitest";
import type { PluginDiscoveryResult } from "./discovery.js";

const discoverRecallPluginsMock = vi.fn();

vi.mock("./discovery.js", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./discovery.js")>();
  return {
    ...actual,
    discoverRecallPlugins: (...args: unknown[]) => discoverRecallPluginsMock(...args),
  };
});

const { loadPluginManifestRegistry } = await import("./manifest-registry.js");
const { resolveInstalledPluginIndexRegistry } =
  await import("./installed-plugin-index-registry.js");

const emptyDiscovery: PluginDiscoveryResult = { candidates: [], diagnostics: [] };

describe("discovery threading", () => {
  beforeEach(() => {
    discoverRecallPluginsMock.mockReset();
    discoverRecallPluginsMock.mockReturnValue(emptyDiscovery);
  });

  describe("loadPluginManifestRegistry", () => {
    it("skips internal discoverRecallPlugins when discovery is supplied", () => {
      loadPluginManifestRegistry({ discovery: emptyDiscovery });
      expect(discoverRecallPluginsMock).not.toHaveBeenCalled();
    });

    it("calls discoverRecallPlugins when neither discovery nor candidates supplied", () => {
      loadPluginManifestRegistry({});
      expect(discoverRecallPluginsMock).toHaveBeenCalledTimes(1);
    });

    it("prefers explicit candidates over discovery when both are supplied", () => {
      loadPluginManifestRegistry({ candidates: [], diagnostics: [], discovery: emptyDiscovery });
      expect(discoverRecallPluginsMock).not.toHaveBeenCalled();
    });
  });

  describe("resolveInstalledPluginIndexRegistry", () => {
    it("skips internal discoverRecallPlugins when discovery is supplied", () => {
      resolveInstalledPluginIndexRegistry({ discovery: emptyDiscovery, installRecords: {} });
      expect(discoverRecallPluginsMock).not.toHaveBeenCalled();
    });

    it("calls discoverRecallPlugins when neither discovery nor candidates supplied", () => {
      resolveInstalledPluginIndexRegistry({ installRecords: {} });
      expect(discoverRecallPluginsMock).toHaveBeenCalledTimes(1);
    });

    it("prefers explicit candidates over discovery when both are supplied", () => {
      resolveInstalledPluginIndexRegistry({
        candidates: [],
        discovery: emptyDiscovery,
        installRecords: {},
      });
      expect(discoverRecallPluginsMock).not.toHaveBeenCalled();
    });
  });
});
