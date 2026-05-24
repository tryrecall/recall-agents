// Private runtime barrel for the bundled Microsoft Teams extension.
// Keep this barrel thin and aligned with the local extension surface.

export { DEFAULT_ACCOUNT_ID } from "recall/plugin-sdk/account-id";
export type { AllowlistMatch } from "recall/plugin-sdk/allow-from";
export {
  mergeAllowlist,
  resolveAllowlistMatchSimple,
  summarizeMapping,
} from "recall/plugin-sdk/allow-from";
export type {
  BaseProbeResult,
  ChannelDirectoryEntry,
  ChannelGroupContext,
  ChannelMessageActionName,
  ChannelOutboundAdapter,
} from "recall/plugin-sdk/channel-contract";
export type { ChannelPlugin } from "recall/plugin-sdk/channel-core";
export { logTypingFailure } from "recall/plugin-sdk/channel-logging";
export { createChannelPairingController } from "recall/plugin-sdk/channel-pairing";
export { resolveToolsBySender } from "recall/plugin-sdk/channel-policy";
export { createChannelMessageReplyPipeline } from "recall/plugin-sdk/channel-message";
export {
  PAIRING_APPROVED_MESSAGE,
  buildProbeChannelStatusSummary,
  createDefaultChannelRuntimeState,
} from "recall/plugin-sdk/channel-status";
export {
  buildChannelKeyCandidates,
  normalizeChannelSlug,
  resolveChannelEntryMatchWithFallback,
  resolveNestedAllowlistDecision,
} from "recall/plugin-sdk/channel-targets";
export type {
  GroupPolicy,
  GroupToolPolicyConfig,
  MSTeamsChannelConfig,
  MSTeamsConfig,
  MSTeamsReplyStyle,
  MSTeamsTeamConfig,
  MarkdownTableMode,
  RecallConfig,
} from "recall/plugin-sdk/config-contracts";
export { isDangerousNameMatchingEnabled } from "recall/plugin-sdk/dangerous-name-runtime";
export { resolveDefaultGroupPolicy } from "recall/plugin-sdk/runtime-group-policy";
export { withFileLock } from "recall/plugin-sdk/file-lock";
export { keepHttpServerTaskAlive } from "recall/plugin-sdk/channel-lifecycle";
export {
  detectMime,
  extensionForMime,
  extractOriginalFilename,
  getFileExtension,
  resolveChannelMediaMaxBytes,
} from "recall/plugin-sdk/media-runtime";
export { dispatchReplyFromConfigWithSettledDispatcher } from "recall/plugin-sdk/inbound-reply-dispatch";
export { loadOutboundMediaFromUrl } from "recall/plugin-sdk/outbound-media";
export { buildMediaPayload } from "recall/plugin-sdk/reply-payload";
export type { ReplyPayload } from "recall/plugin-sdk/reply-payload";
export type { PluginRuntime } from "recall/plugin-sdk/runtime-store";
export type { RuntimeEnv } from "recall/plugin-sdk/runtime";
export type { SsrFPolicy } from "recall/plugin-sdk/ssrf-runtime";
export { fetchWithSsrFGuard } from "recall/plugin-sdk/ssrf-runtime";
export { normalizeStringEntries } from "recall/plugin-sdk/string-normalization-runtime";
export { chunkTextForOutbound } from "recall/plugin-sdk/text-chunking";
export { DEFAULT_WEBHOOK_MAX_BODY_BYTES } from "recall/plugin-sdk/webhook-ingress";
export { setMSTeamsRuntime } from "./src/runtime.js";
