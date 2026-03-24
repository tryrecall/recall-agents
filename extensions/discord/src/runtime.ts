import type { PluginRuntime } from "recall/plugin-sdk/core";
import { createPluginRuntimeStore } from "recall/plugin-sdk/runtime-store";

const { setRuntime: setDiscordRuntime, getRuntime: getDiscordRuntime } =
  createPluginRuntimeStore<PluginRuntime>("Discord runtime not initialized");
export { getDiscordRuntime, setDiscordRuntime };
