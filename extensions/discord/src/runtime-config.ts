// Discord helper module supports runtime config behavior.
import {
  getRuntimeConfigSnapshot,
  getRuntimeConfigSourceSnapshot,
  selectApplicableRuntimeConfig,
} from "steelengine/plugin-sdk/runtime-config-snapshot";
import type { SteelEngineConfig } from "./runtime-api.js";

export function selectDiscordRuntimeConfig(inputConfig: SteelEngineConfig): SteelEngineConfig {
  return (
    selectApplicableRuntimeConfig({
      inputConfig,
      runtimeConfig: getRuntimeConfigSnapshot(),
      runtimeSourceConfig: getRuntimeConfigSourceSnapshot(),
    }) ?? inputConfig
  );
}
