import type { RecallConfig } from "recall/plugin-sdk/config-contracts";
import { inspectDiscordAccount } from "./src/account-inspect.js";

export function inspectDiscordReadOnlyAccount(cfg: RecallConfig, accountId?: string | null) {
  return inspectDiscordAccount({ cfg, accountId });
}
