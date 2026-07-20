// Private runtime barrel for the bundled Microsoft Teams extension.
// Keep this barrel thin and aligned with the local extension surface.

export { DEFAULT_ACCOUNT_ID } from "steelengine/plugin-sdk/account-id";
export type { AllowlistMatch } from "steelengine/plugin-sdk/allow-from";
export {
  mergeAllowlist,
  resolveAllowlistMatchSimple,
  summarizeMapping,
} from "steelengine/plugin-sdk/allow-from";
export type {
  BaseProbeResult,
  ChannelDirectoryEntry,
  ChannelGroupContext,
  ChannelMessageActionName,
  ChannelOutboundAdapter,
} from "steelengine/plugin-sdk/channel-contract";
export type { ChannelPlugin } from "steelengine/plugin-sdk/channel-core";
export { logTypingFailure } from "steelengine/plugin-sdk/channel-outbound";
export { createChannelPairingController } from "steelengine/plugin-sdk/channel-pairing";
export { resolveToolsBySender } from "steelengine/plugin-sdk/channel-policy";
export { createChannelMessageReplyPipeline } from "steelengine/plugin-sdk/channel-outbound";
export {
  PAIRING_APPROVED_MESSAGE,
  buildProbeChannelStatusSummary,
  createDefaultChannelRuntimeState,
} from "steelengine/plugin-sdk/channel-status";
export {
  buildChannelKeyCandidates,
  normalizeChannelSlug,
  resolveChannelEntryMatchWithFallback,
  resolveNestedAllowlistDecision,
} from "steelengine/plugin-sdk/channel-targets";
export type {
  GroupPolicy,
  GroupToolPolicyConfig,
  MSTeamsChannelConfig,
  MSTeamsCloudName,
  MSTeamsConfig,
  MSTeamsReplyStyle,
  MSTeamsTeamConfig,
  MarkdownTableMode,
  SteelEngineConfig,
} from "steelengine/plugin-sdk/config-contracts";
export { isDangerousNameMatchingEnabled } from "steelengine/plugin-sdk/dangerous-name-runtime";
export { resolveDefaultGroupPolicy } from "steelengine/plugin-sdk/runtime-group-policy";
export { withFileLock } from "steelengine/plugin-sdk/file-lock";
export { keepHttpServerTaskAlive } from "steelengine/plugin-sdk/channel-outbound";
export {
  detectMime,
  extensionForMime,
  extractOriginalFilename,
  getFileExtension,
  resolveChannelMediaMaxBytes,
} from "steelengine/plugin-sdk/media-runtime";
export { loadOutboundMediaFromUrl } from "steelengine/plugin-sdk/outbound-media";
export { buildMediaPayload } from "steelengine/plugin-sdk/reply-payload";
export type { ReplyPayload } from "steelengine/plugin-sdk/reply-payload";
export type { PluginRuntime } from "steelengine/plugin-sdk/runtime-store";
export type { RuntimeEnv } from "steelengine/plugin-sdk/runtime";
export type { SsrFPolicy } from "steelengine/plugin-sdk/ssrf-runtime";
export { fetchWithSsrFGuard } from "steelengine/plugin-sdk/ssrf-runtime";
export { normalizeStringEntries } from "steelengine/plugin-sdk/string-normalization-runtime";
export { chunkTextForOutbound } from "steelengine/plugin-sdk/text-chunking";
export { DEFAULT_WEBHOOK_MAX_BODY_BYTES } from "steelengine/plugin-sdk/webhook-ingress";
export { setMSTeamsRuntime } from "./src/runtime.js";
