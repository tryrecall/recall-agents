import type { RecallConfig } from "recall/plugin-sdk/config-contracts";
import { inspectSlackAccount } from "./src/account-inspect.js";

export function inspectSlackReadOnlyAccount(cfg: RecallConfig, accountId?: string | null) {
  return inspectSlackAccount({ cfg, accountId });
}
