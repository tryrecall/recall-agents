import {
  getRuntimeConfig,
  getRuntimeConfigSourceSnapshot,
  type RecallConfig,
} from "../config/config.js";

export function loadBrowserConfigForRuntimeRefresh(): RecallConfig {
  return getRuntimeConfigSourceSnapshot() ?? getRuntimeConfig();
}
