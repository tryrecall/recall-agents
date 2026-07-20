// Slack API module exposes the plugin public contract.
import type { SteelEngineConfig } from "steelengine/plugin-sdk/config-contracts";
import { inspectSlackAccount } from "./src/account-inspect.js";

export function inspectSlackReadOnlyAccount(cfg: SteelEngineConfig, accountId?: string | null) {
  return inspectSlackAccount({ cfg, accountId });
}
