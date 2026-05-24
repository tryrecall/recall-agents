import { formatTrimmedAllowFromEntries } from "recall/plugin-sdk/channel-config-helpers";
import { PAIRING_APPROVED_MESSAGE } from "recall/plugin-sdk/channel-status";
import {
  DEFAULT_ACCOUNT_ID,
  getChatChannelMeta,
  type ChannelPlugin,
} from "recall/plugin-sdk/core";
import { resolveChannelMediaMaxBytes } from "recall/plugin-sdk/media-runtime";
import { collectStatusIssuesFromLastError } from "recall/plugin-sdk/status-helpers";
import { normalizeIMessageMessagingTarget } from "./normalize.js";
export { chunkTextForOutbound } from "recall/plugin-sdk/text-chunking";

export {
  collectStatusIssuesFromLastError,
  DEFAULT_ACCOUNT_ID,
  formatTrimmedAllowFromEntries,
  getChatChannelMeta,
  normalizeIMessageMessagingTarget,
  PAIRING_APPROVED_MESSAGE,
  resolveChannelMediaMaxBytes,
};

export type { ChannelPlugin };
