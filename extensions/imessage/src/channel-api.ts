// Imessage API module exposes the plugin public contract.
import { formatTrimmedAllowFromEntries } from "steelengine/plugin-sdk/channel-config-helpers";
import { PAIRING_APPROVED_MESSAGE } from "steelengine/plugin-sdk/channel-status";
import {
  DEFAULT_ACCOUNT_ID,
  getChatChannelMeta,
  type ChannelPlugin,
} from "steelengine/plugin-sdk/core";
import { resolveChannelMediaMaxBytes } from "steelengine/plugin-sdk/media-runtime";
import { collectStatusIssuesFromLastError } from "steelengine/plugin-sdk/status-helpers";
import { normalizeIMessageMessagingTarget } from "./normalize.js";
export { chunkTextForOutbound } from "steelengine/plugin-sdk/text-chunking";

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
