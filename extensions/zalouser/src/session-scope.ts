import type { SteelEngineConfig } from "steelengine/plugin-sdk/config-contracts";

export function resolveZalouserDmSessionScope(config: SteelEngineConfig) {
  const configured = config.session?.dmScope;
  return configured === "main" || !configured ? "per-channel-peer" : configured;
}
