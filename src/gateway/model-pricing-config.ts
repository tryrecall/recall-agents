// Gateway model-pricing config helper.
// Resolves whether cost/pricing metadata should be available to Gateway surfaces.
import type { SteelEngineConfig } from "../config/types.steelengine.js";

/** Returns whether gateway model pricing/cost metadata should be shown. */
export function isGatewayModelPricingEnabled(config: SteelEngineConfig): boolean {
  return config.models?.pricing?.enabled !== false;
}
