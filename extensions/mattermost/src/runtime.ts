// Mattermost plugin module implements runtime behavior.
import { createPluginRuntimeStore } from "steelengine/plugin-sdk/runtime-store";
import type { PluginRuntime } from "steelengine/plugin-sdk/runtime-store";

const {
  setRuntime: setMattermostRuntime,
  getRuntime: getMattermostRuntime,
  tryGetRuntime: getOptionalMattermostRuntime,
} = createPluginRuntimeStore<PluginRuntime>({
  pluginId: "mattermost",
  errorMessage: "Mattermost runtime not initialized",
});
export { getMattermostRuntime, getOptionalMattermostRuntime, setMattermostRuntime };
