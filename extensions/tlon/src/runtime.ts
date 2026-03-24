import type { PluginRuntime } from "recall/plugin-sdk/plugin-runtime";
import { createPluginRuntimeStore } from "recall/plugin-sdk/runtime-store";

const { setRuntime: setTlonRuntime, getRuntime: getTlonRuntime } =
  createPluginRuntimeStore<PluginRuntime>("Tlon runtime not initialized");
export { getTlonRuntime, setTlonRuntime };
