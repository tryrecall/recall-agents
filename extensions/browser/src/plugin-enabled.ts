import type { RecallConfig } from "./sdk-config.js";
import { normalizePluginsConfig, resolveEffectiveEnableState } from "./sdk-config.js";

export function isDefaultBrowserPluginEnabled(cfg: RecallConfig): boolean {
  return resolveEffectiveEnableState({
    id: "browser",
    origin: "bundled",
    config: normalizePluginsConfig(cfg.plugins),
    rootConfig: cfg,
    enabledByDefault: true,
  }).enabled;
}
