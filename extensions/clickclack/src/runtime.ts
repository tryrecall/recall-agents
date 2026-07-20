/**
 * Runtime store for host-provided SteelEngine services used by the ClickClack
 * bundled plugin.
 */
import { createPluginRuntimeStore } from "steelengine/plugin-sdk/runtime-store";
import type { PluginRuntime } from "steelengine/plugin-sdk/runtime-store";

const { setRuntime: setClickClackRuntime, getRuntime: getClickClackRuntime } =
  createPluginRuntimeStore<PluginRuntime>({
    pluginId: "clickclack",
    errorMessage: "ClickClack runtime not initialized",
  });

export { getClickClackRuntime, setClickClackRuntime };
