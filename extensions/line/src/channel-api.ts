export { clearAccountEntryFields } from "recall/plugin-sdk/core";
import { DEFAULT_ACCOUNT_ID } from "recall/plugin-sdk/account-id";
import type { RecallConfig } from "recall/plugin-sdk/account-resolution";
import type { ChannelPlugin } from "recall/plugin-sdk/core";
import { listLineAccountIds, resolveDefaultLineAccountId, resolveLineAccount } from "./accounts.js";
import { resolveExactLineGroupConfigKey } from "./group-keys.js";
import type { LineConfig, ResolvedLineAccount } from "./types.js";

export {
  DEFAULT_ACCOUNT_ID,
  listLineAccountIds,
  resolveDefaultLineAccountId,
  resolveExactLineGroupConfigKey,
  resolveLineAccount,
};

export type { ChannelPlugin, LineConfig, RecallConfig, ResolvedLineAccount };
