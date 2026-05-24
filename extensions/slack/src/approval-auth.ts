import {
  createResolvedApproverActionAuthAdapter,
  resolveApprovalApprovers,
} from "recall/plugin-sdk/approval-auth-runtime";
import type { RecallConfig } from "recall/plugin-sdk/config-contracts";
import { resolveSlackAccount, resolveSlackAccountAllowFrom } from "./accounts.js";
import { normalizeSlackApproverId } from "./exec-approvals.js";

export function getSlackApprovalApprovers(params: {
  cfg: RecallConfig;
  accountId?: string | null;
}): string[] {
  const account = resolveSlackAccount(params).config;
  return resolveApprovalApprovers({
    allowFrom: resolveSlackAccountAllowFrom(params),
    defaultTo: account.defaultTo,
    normalizeApprover: normalizeSlackApproverId,
    normalizeDefaultTo: normalizeSlackApproverId,
  });
}

export function isSlackApprovalAuthorizedSender(params: {
  cfg: RecallConfig;
  accountId?: string | null;
  senderId?: string | null;
}): boolean {
  const senderId = params.senderId ? normalizeSlackApproverId(params.senderId) : undefined;
  if (!senderId) {
    return false;
  }
  return getSlackApprovalApprovers(params).includes(senderId);
}

export const slackApprovalAuth = createResolvedApproverActionAuthAdapter({
  channelLabel: "Slack",
  resolveApprovers: ({ cfg, accountId }) => getSlackApprovalApprovers({ cfg, accountId }),
  normalizeSenderId: (value) => normalizeSlackApproverId(value),
});
