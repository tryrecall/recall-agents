// Telegram API module exposes the plugin public contract.
import type { SteelEngineConfig } from "./runtime-api.js";
import { inspectTelegramAccount } from "./src/account-inspect.js";

export function inspectTelegramReadOnlyAccount(cfg: SteelEngineConfig, accountId?: string | null) {
  return inspectTelegramAccount({ cfg, accountId });
}
