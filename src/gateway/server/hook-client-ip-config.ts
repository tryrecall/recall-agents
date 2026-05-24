import type { RecallConfig } from "../../config/types.recall.js";
import type { HookClientIpConfig } from "./hooks-request-handler.js";

export function resolveHookClientIpConfig(cfg: RecallConfig): HookClientIpConfig {
  return {
    trustedProxies: cfg.gateway?.trustedProxies,
    allowRealIpFallback: cfg.gateway?.allowRealIpFallback === true,
  };
}
