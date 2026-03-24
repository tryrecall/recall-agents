export {
  buildChannelConfigSchema,
  createActionGate,
  DEFAULT_ACCOUNT_ID,
  formatWhatsAppConfigAllowFromEntries,
  getChatChannelMeta,
  jsonResult,
  normalizeE164,
  readReactionParams,
  readStringParam,
  resolveWhatsAppGroupIntroHint,
  resolveWhatsAppGroupRequireMention,
  resolveWhatsAppGroupToolPolicy,
  ToolAuthorizationError,
  WhatsAppConfigSchema,
  type ChannelPlugin,
  type RecallConfig,
} from "recall/plugin-sdk/whatsapp-core";

export {
  createWhatsAppOutboundBase,
  looksLikeWhatsAppTargetId,
  normalizeWhatsAppAllowFromEntries,
  normalizeWhatsAppMessagingTarget,
  resolveWhatsAppHeartbeatRecipients,
  resolveWhatsAppMentionStripRegexes,
  type ChannelMessageActionName,
  type DmPolicy,
  type GroupPolicy,
  type WhatsAppAccountConfig,
} from "recall/plugin-sdk/whatsapp-shared";
export {
  isWhatsAppGroupJid,
  isWhatsAppUserTarget,
  normalizeWhatsAppTarget,
} from "./normalize-target.js";
export { resolveWhatsAppOutboundTarget } from "./resolve-outbound-target.js";

export { monitorWebChannel } from "./channel.runtime.js";
