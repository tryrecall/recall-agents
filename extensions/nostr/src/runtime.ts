// Nostr plugin module implements runtime behavior.
import type { PluginRuntime } from "steelengine/plugin-sdk/core";
import { createPluginRuntimeStore } from "steelengine/plugin-sdk/runtime-store";

const { setRuntime: setNostrRuntime, getRuntime: getNostrRuntime } =
  createPluginRuntimeStore<PluginRuntime>({
    pluginId: "nostr",
    errorMessage: "Nostr runtime not initialized",
  });
export { getNostrRuntime, setNostrRuntime };
