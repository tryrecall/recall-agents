import type { RecallConfig } from "../config/types.recall.js";

export function isGatewayModelPricingEnabled(config: RecallConfig): boolean {
  return config.models?.pricing?.enabled !== false;
}
