// Discord API module exposes the plugin public contract.
import type { SteelEngineConfig } from "steelengine/plugin-sdk/config-contracts";
import { inspectDiscordAccount } from "./src/account-inspect.js";

export function inspectDiscordReadOnlyAccount(cfg: SteelEngineConfig, accountId?: string | null) {
  return inspectDiscordAccount({ cfg, accountId });
}
