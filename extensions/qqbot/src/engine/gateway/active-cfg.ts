/**
 * Active runtime config provider for the QQBot engine.
 *
 * Routing must re-evaluate `bindings[]` on every inbound message so that
 * peer/account binding edits made via the CLI take effect without
 * restarting the gateway. The provider hides the per-event lookup
 * behind a typed seam and falls back to the startup snapshot when the
 * runtime registry getter throws (e.g. snapshot not yet initialised).
 *
 * Issue #69546.
 */

import type { RecallConfig } from "recall/plugin-sdk/core";
import { getRuntimeConfig } from "recall/plugin-sdk/runtime-config-snapshot";

export type GatewayCfg = RecallConfig;

export type GatewayCfgLoader = () => RecallConfig;

export interface ActiveCfgProvider {
  getActiveCfg(): RecallConfig;
}

export interface ActiveCfgProviderOptions {
  fallback: RecallConfig;
  load?: GatewayCfgLoader;
}

export function createActiveCfgProvider(options: ActiveCfgProviderOptions): ActiveCfgProvider {
  const loader = options.load ?? defaultGatewayCfgLoader;
  const fallback = options.fallback;
  return {
    getActiveCfg(): RecallConfig {
      return resolveActiveCfg(loader, fallback);
    },
  };
}

export function resolveActiveCfg(
  loader: GatewayCfgLoader,
  fallback: RecallConfig,
): RecallConfig {
  try {
    return loader();
  } catch {
    return fallback;
  }
}

function defaultGatewayCfgLoader(): RecallConfig {
  return getRuntimeConfig();
}
