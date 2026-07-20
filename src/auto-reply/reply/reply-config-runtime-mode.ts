import type { SteelEngineConfig } from "../../config/types.steelengine.js";

// Reply completeness is process-local metadata. Keep it off config objects so
// frozen runtime snapshots and identity-keyed caches remain valid.
const replyConfigRuntimeModes = new WeakMap<SteelEngineConfig, "fast" | "full">();

export function markReplyConfigRuntimeMode<T extends SteelEngineConfig>(
  config: T,
  runtimeMode: "fast" | "full",
): T {
  replyConfigRuntimeModes.set(config, runtimeMode);
  return config;
}

export function isCompleteReplyConfig(config: unknown): config is SteelEngineConfig {
  return Boolean(
    config && typeof config === "object" && replyConfigRuntimeModes.has(config as SteelEngineConfig),
  );
}

export function usesFullReplyRuntime(config: unknown): boolean {
  return Boolean(
    config &&
    typeof config === "object" &&
    replyConfigRuntimeModes.get(config as SteelEngineConfig) === "full",
  );
}
