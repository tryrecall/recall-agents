import type { RecallConfig } from "./config.js";

export function ensurePluginAllowlisted(cfg: RecallConfig, pluginId: string): RecallConfig {
  const allow = cfg.plugins?.allow;
  if (!Array.isArray(allow) || allow.includes(pluginId)) {
    return cfg;
  }
  return {
    ...cfg,
    plugins: {
      ...cfg.plugins,
      allow: [...allow, pluginId],
    },
  };
}
