import type { RecallConfig } from "./runtime-api.js";
import { inspectTelegramAccount } from "./src/account-inspect.js";

export function inspectTelegramReadOnlyAccount(cfg: RecallConfig, accountId?: string | null) {
  return inspectTelegramAccount({ cfg, accountId });
}
