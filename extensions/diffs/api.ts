// Diffs API module exposes the plugin public contract.
export type { SteelEngineConfig } from "steelengine/plugin-sdk/config-contracts";
export {
  definePluginEntry,
  type AnyAgentTool,
  type SteelEnginePluginApi,
  type SteelEnginePluginConfigSchema,
  type SteelEnginePluginToolContext,
  type PluginLogger,
} from "steelengine/plugin-sdk/plugin-entry";
export { resolvePreferredSteelEngineTmpDir } from "steelengine/plugin-sdk/temp-path";
