// Private runtime barrel for the bundled IRC extension.
// Keep this barrel thin and generic-only.

export type { BaseProbeResult } from "steelengine/plugin-sdk/channel-contract";
export type { ChannelPlugin } from "steelengine/plugin-sdk/channel-core";
export type { SteelEngineConfig } from "steelengine/plugin-sdk/config-contracts";
export type { PluginRuntime } from "steelengine/plugin-sdk/runtime-store";
export type { RuntimeEnv } from "steelengine/plugin-sdk/runtime";
export type {
  BlockStreamingCoalesceConfig,
  DmConfig,
  DmPolicy,
  GroupPolicy,
  GroupToolPolicyBySenderConfig,
  GroupToolPolicyConfig,
  MarkdownConfig,
} from "steelengine/plugin-sdk/config-contracts";
export type { OutboundReplyPayload } from "steelengine/plugin-sdk/reply-payload";
export { DEFAULT_ACCOUNT_ID } from "steelengine/plugin-sdk/account-id";
export { buildChannelConfigSchema } from "steelengine/plugin-sdk/channel-config-schema";
export {
  PAIRING_APPROVED_MESSAGE,
  buildBaseChannelStatusSummary,
} from "steelengine/plugin-sdk/channel-status";
export { createChannelPairingController } from "steelengine/plugin-sdk/channel-pairing";
export { createAccountStatusSink } from "steelengine/plugin-sdk/channel-outbound";
export { resolveControlCommandGate } from "steelengine/plugin-sdk/command-auth-native";
export { createChannelMessageReplyPipeline } from "steelengine/plugin-sdk/channel-outbound";
export { chunkTextForOutbound } from "steelengine/plugin-sdk/text-chunking";
export {
  deliverFormattedTextWithAttachments,
  formatTextWithAttachmentLinks,
  resolveOutboundMediaUrls,
} from "steelengine/plugin-sdk/reply-payload";
export {
  GROUP_POLICY_BLOCKED_LABEL,
  resolveAllowlistProviderRuntimeGroupPolicy,
  resolveDefaultGroupPolicy,
  warnMissingProviderGroupPolicyFallbackOnce,
} from "steelengine/plugin-sdk/runtime-group-policy";
export { isDangerousNameMatchingEnabled } from "steelengine/plugin-sdk/dangerous-name-runtime";
export { logInboundDrop } from "steelengine/plugin-sdk/channel-inbound";
