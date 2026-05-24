import {
  getRuntimeConfigSnapshot,
  getRuntimeConfigSourceSnapshot,
  selectApplicableRuntimeConfig,
} from "recall/plugin-sdk/runtime-config-snapshot";
import type { RecallConfig } from "./runtime-api.js";

export function selectDiscordRuntimeConfig(inputConfig: RecallConfig): RecallConfig {
  return (
    selectApplicableRuntimeConfig({
      inputConfig,
      runtimeConfig: getRuntimeConfigSnapshot(),
      runtimeSourceConfig: getRuntimeConfigSourceSnapshot(),
    }) ?? inputConfig
  );
}
