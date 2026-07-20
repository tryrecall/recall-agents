// Discord plugin module implements audit behavior.
import type { SteelEngineConfig } from "steelengine/plugin-sdk/config-contracts";
import { inspectDiscordAccount } from "./account-inspect.js";
import {
  auditDiscordChannelPermissionsWithFetcher,
  collectDiscordAuditChannelIdsForAccount,
  type DiscordChannelPermissionsAudit,
} from "./audit-core.js";
import { fetchChannelPermissionsDiscord } from "./send.js";

export function collectDiscordAuditChannelIds(params: {
  cfg: SteelEngineConfig;
  accountId?: string | null;
}) {
  const account = inspectDiscordAccount({
    cfg: params.cfg,
    accountId: params.accountId,
  });
  return collectDiscordAuditChannelIdsForAccount(account.config);
}

export async function auditDiscordChannelPermissions(params: {
  cfg: SteelEngineConfig;
  token: string;
  accountId?: string | null;
  channelIds: string[];
  timeoutMs: number;
}): Promise<DiscordChannelPermissionsAudit> {
  return await auditDiscordChannelPermissionsWithFetcher({
    ...params,
    fetchChannelPermissions: fetchChannelPermissionsDiscord,
  });
}
