// Discord plugin module implements exec approvals behavior.
import type { ChannelOutboundPayloadHint } from "steelengine/plugin-sdk/channel-contract";
import type { SteelEngineConfig } from "steelengine/plugin-sdk/config-contracts";
import type { DiscordExecApprovalConfig } from "steelengine/plugin-sdk/config-contracts";
import type { ReplyPayload } from "steelengine/plugin-sdk/reply-dispatch-runtime";
import { resolveDiscordAccount } from "./accounts.js";
import {
  getExecApprovalReplyMetadata,
  isChannelExecApprovalClientEnabledFromConfig,
  matchesApprovalRequestFilters,
  resolveApprovalApprovers,
} from "./approval-runtime.js";
import { parseDiscordTarget } from "./target-parsing.js";

function normalizeDiscordApproverId(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }
  if (/^\d+$/.test(trimmed)) {
    return trimmed;
  }
  try {
    const target = parseDiscordTarget(trimmed);
    return target?.kind === "user" ? target.id : undefined;
  } catch {
    return undefined;
  }
}

function resolveDiscordOwnerApprovers(cfg: SteelEngineConfig): string[] {
  const ownerAllowFrom = cfg.commands?.ownerAllowFrom;
  if (!Array.isArray(ownerAllowFrom) || ownerAllowFrom.length === 0) {
    return [];
  }
  return resolveApprovalApprovers({
    explicit: ownerAllowFrom,
    normalizeApprover: (value) => normalizeDiscordApproverId(String(value)),
  });
}

export function getDiscordExecApprovalApprovers(params: {
  cfg: SteelEngineConfig;
  accountId?: string | null;
  configOverride?: DiscordExecApprovalConfig | null;
}): string[] {
  return resolveApprovalApprovers({
    explicit:
      params.configOverride?.approvers ??
      resolveDiscordAccount(params).config.execApprovals?.approvers ??
      resolveDiscordOwnerApprovers(params.cfg),
    normalizeApprover: (value) => normalizeDiscordApproverId(String(value)),
  });
}

export function isDiscordExecApprovalClientEnabled(params: {
  cfg: SteelEngineConfig;
  accountId?: string | null;
  configOverride?: DiscordExecApprovalConfig | null;
}): boolean {
  const config = params.configOverride ?? resolveDiscordAccount(params).config.execApprovals;
  return isChannelExecApprovalClientEnabledFromConfig({
    enabled: config?.enabled,
    approverCount: getDiscordExecApprovalApprovers({
      cfg: params.cfg,
      accountId: params.accountId,
      configOverride: params.configOverride,
    }).length,
  });
}

export function isDiscordExecApprovalApprover(params: {
  cfg: SteelEngineConfig;
  accountId?: string | null;
  senderId?: string | null;
  configOverride?: DiscordExecApprovalConfig | null;
}): boolean {
  const senderId = params.senderId?.trim();
  if (!senderId) {
    return false;
  }
  return getDiscordExecApprovalApprovers({
    cfg: params.cfg,
    accountId: params.accountId,
    configOverride: params.configOverride,
  }).includes(senderId);
}

export function shouldSuppressLocalDiscordExecApprovalPrompt(params: {
  cfg: SteelEngineConfig;
  accountId?: string | null;
  payload: ReplyPayload;
  hint?: ChannelOutboundPayloadHint;
}): boolean {
  const metadata = getExecApprovalReplyMetadata(params.payload);
  const config = resolveDiscordAccount(params).config.execApprovals;
  return (
    params.hint?.kind === "approval-pending" &&
    params.hint.nativeRouteActive === true &&
    isDiscordExecApprovalClientEnabled(params) &&
    metadata !== null &&
    matchesApprovalRequestFilters({
      request: {
        agentId: metadata.agentId,
        sessionKey: metadata.sessionKey,
      },
      agentFilter: config?.agentFilter,
      sessionFilter: config?.sessionFilter,
    })
  );
}
