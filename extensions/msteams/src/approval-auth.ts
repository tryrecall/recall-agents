import {
  createResolvedApproverActionAuthAdapter,
  resolveApprovalApprovers,
} from "recall/plugin-sdk/approval-auth-runtime";
import { normalizeOptionalLowercaseString } from "recall/plugin-sdk/string-coerce-runtime";
import type { RecallConfig } from "../runtime-api.js";
import { normalizeMSTeamsMessagingTarget } from "./resolve-allowlist.js";

const MSTEAMS_ID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function normalizeMSTeamsApproverId(value: string | number): string | undefined {
  const normalized = normalizeMSTeamsMessagingTarget(String(value));
  if (!normalized?.startsWith("user:")) {
    return undefined;
  }
  const id = normalizeOptionalLowercaseString(normalized.slice("user:".length));
  if (!id) {
    return undefined;
  }
  return MSTEAMS_ID_RE.test(id) ? id : undefined;
}

function resolveMSTeamsChannelConfig(cfg: RecallConfig) {
  return cfg.channels?.msteams;
}

export const msTeamsApprovalAuth = createResolvedApproverActionAuthAdapter({
  channelLabel: "Microsoft Teams",
  resolveApprovers: ({ cfg }) => {
    const channel = resolveMSTeamsChannelConfig(cfg);
    return resolveApprovalApprovers({
      allowFrom: channel?.allowFrom,
      defaultTo: channel?.defaultTo,
      normalizeApprover: normalizeMSTeamsApproverId,
    });
  },
  normalizeSenderId: (value) => {
    const trimmed = normalizeOptionalLowercaseString(value);
    if (!trimmed) {
      return undefined;
    }
    return MSTEAMS_ID_RE.test(trimmed) ? trimmed : undefined;
  },
});
