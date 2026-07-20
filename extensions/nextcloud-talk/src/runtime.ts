// Nextcloud Talk plugin module implements runtime behavior.
import { createPluginRuntimeStore } from "steelengine/plugin-sdk/runtime-store";
import type { PluginRuntime } from "steelengine/plugin-sdk/runtime-store";

const { setRuntime: setNextcloudTalkRuntime, getRuntime: getNextcloudTalkRuntime } =
  createPluginRuntimeStore<PluginRuntime>({
    pluginId: "nextcloud-talk",
    errorMessage: "Nextcloud Talk runtime not initialized",
  });
export { getNextcloudTalkRuntime, setNextcloudTalkRuntime };
