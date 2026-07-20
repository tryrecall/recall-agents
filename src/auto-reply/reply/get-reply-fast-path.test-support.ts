import type { SteelEngineConfig } from "../../config/types.steelengine.js";
import { markReplyConfigRuntimeMode } from "./reply-config-runtime-mode.js";

export function markCompleteReplyConfig<T extends SteelEngineConfig>(
  config: T,
  options?: { runtimeMode?: "fast" | "full" },
): T {
  return markReplyConfigRuntimeMode(config, options?.runtimeMode ?? "fast");
}

export function withFastReplyConfig<T extends SteelEngineConfig>(config: T): T {
  return markCompleteReplyConfig(config);
}
