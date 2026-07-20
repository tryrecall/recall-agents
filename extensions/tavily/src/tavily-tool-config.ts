// Tavily helper module supports tavily tool config behavior.
import type { SteelEngineConfig } from "steelengine/plugin-sdk/config-contracts";
import type { SteelEnginePluginToolContext } from "steelengine/plugin-sdk/plugin-entry";
import type { SteelEnginePluginApi } from "steelengine/plugin-sdk/plugin-runtime";

export type TavilyToolConfigContext = Pick<
  SteelEnginePluginToolContext,
  "config" | "runtimeConfig" | "getRuntimeConfig"
>;

export function resolveTavilyToolConfig(
  api: SteelEnginePluginApi,
  ctx?: TavilyToolConfigContext,
): SteelEngineConfig {
  return ctx?.getRuntimeConfig?.() ?? ctx?.runtimeConfig ?? ctx?.config ?? api.config;
}
