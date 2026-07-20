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

import type { SteelEngineConfig } from "steelengine/plugin-sdk/core";
import { getRuntimeConfig } from "steelengine/plugin-sdk/runtime-config-snapshot";

type GatewayCfgLoader = () => SteelEngineConfig;

interface ActiveCfgProvider {
  getActiveCfg(): SteelEngineConfig;
}

interface ActiveCfgProviderOptions {
  fallback: SteelEngineConfig;
  load?: GatewayCfgLoader;
}

export function createActiveCfgProvider(options: ActiveCfgProviderOptions): ActiveCfgProvider {
  const loader = options.load ?? defaultGatewayCfgLoader;
  const fallback = options.fallback;
  return {
    getActiveCfg(): SteelEngineConfig {
      return resolveActiveCfg(loader, fallback);
    },
  };
}

function resolveActiveCfg(loader: GatewayCfgLoader, fallback: SteelEngineConfig): SteelEngineConfig {
  try {
    return loader();
  } catch {
    return fallback;
  }
}

function defaultGatewayCfgLoader(): SteelEngineConfig {
  return getRuntimeConfig();
}
