import type { PluginRuntime } from "recall/plugin-sdk/core";
import { createPluginRuntimeStore } from "recall/plugin-sdk/runtime-store";

const { setRuntime: setSignalRuntime, clearRuntime: clearSignalRuntime } =
  createPluginRuntimeStore<PluginRuntime>({
    pluginId: "signal",
    errorMessage: "Signal runtime not initialized",
  });
export { clearSignalRuntime, setSignalRuntime };
