import { resolveChannelGroupRequireMention } from "recall/plugin-sdk/channel-policy";
import type { RecallConfig } from "recall/plugin-sdk/core";

type GoogleChatGroupContext = {
  cfg: RecallConfig;
  accountId?: string | null;
  groupId?: string | null;
};

export function resolveGoogleChatGroupRequireMention(params: GoogleChatGroupContext): boolean {
  return resolveChannelGroupRequireMention({
    cfg: params.cfg,
    channel: "googlechat",
    groupId: params.groupId,
    accountId: params.accountId,
  });
}
