import { normalizeChatChannelId } from "../channels/ids.js";
import type { RecallConfig } from "../config/types.recall.js";
import { setPluginEnabledInConfig } from "./toggle-config.js";

export type PluginEnableResult = {
  config: RecallConfig;
  enabled: boolean;
  pluginId: string;
  reason?: string;
};

export function enablePluginInConfig(
  cfg: RecallConfig,
  pluginId: string,
  options: { updateChannelConfig?: boolean } = {},
): PluginEnableResult {
  const builtInChannelId = normalizeChatChannelId(pluginId);
  const resolvedId = builtInChannelId ?? pluginId;
  if (cfg.plugins?.enabled === false) {
    return { config: cfg, enabled: false, pluginId: resolvedId, reason: "plugins disabled" };
  }
  if (cfg.plugins?.deny?.includes(pluginId) || cfg.plugins?.deny?.includes(resolvedId)) {
    return { config: cfg, enabled: false, pluginId: resolvedId, reason: "blocked by denylist" };
  }
  const allow = cfg.plugins?.allow;
  if (
    Array.isArray(allow) &&
    allow.length > 0 &&
    !allow.includes(pluginId) &&
    !allow.includes(resolvedId)
  ) {
    return { config: cfg, enabled: false, pluginId: resolvedId, reason: "blocked by allowlist" };
  }
  return {
    config: setPluginEnabledInConfig(cfg, resolvedId, true, options),
    enabled: true,
    pluginId: resolvedId,
  };
}
