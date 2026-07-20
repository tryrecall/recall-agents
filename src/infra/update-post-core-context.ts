import type { SteelEngineConfig } from "../config/types.steelengine.js";

export const POST_CORE_UPDATE_SOURCE_CONFIG_PATH_ENV =
  "STEELENGINE_UPDATE_POST_CORE_SOURCE_CONFIG_PATH";

export type PreUpdateConfigRestoreInput = {
  sourceConfig: SteelEngineConfig;
  authoredConfig: SteelEngineConfig;
};
