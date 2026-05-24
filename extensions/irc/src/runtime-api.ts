// Private runtime barrel for the bundled IRC extension.
// Keep this barrel thin and generic-only.

export type { BaseProbeResult } from "recall/plugin-sdk/channel-contract";
export type { ChannelPlugin } from "recall/plugin-sdk/channel-core";
export type { RecallConfig } from "recall/plugin-sdk/config-contracts";
export type { PluginRuntime } from "recall/plugin-sdk/runtime-store";
export type { RuntimeEnv } from "recall/plugin-sdk/runtime";
export type {
  BlockStreamingCoalesceConfig,
  DmConfig,
  DmPolicy,
  GroupPolicy,
  GroupToolPolicyBySenderConfig,
  GroupToolPolicyConfig,
  MarkdownConfig,
} from "recall/plugin-sdk/config-contracts";
export type { OutboundReplyPayload } from "recall/plugin-sdk/reply-payload";
export { DEFAULT_ACCOUNT_ID } from "recall/plugin-sdk/account-id";
export { buildChannelConfigSchema } from "recall/plugin-sdk/channel-config-primitives";
export {
  PAIRING_APPROVED_MESSAGE,
  buildBaseChannelStatusSummary,
} from "recall/plugin-sdk/channel-status";
export { createChannelPairingController } from "recall/plugin-sdk/channel-pairing";
export { createAccountStatusSink } from "recall/plugin-sdk/channel-lifecycle";
export { resolveControlCommandGate } from "recall/plugin-sdk/command-auth-native";
export { createChannelMessageReplyPipeline } from "recall/plugin-sdk/channel-message";
export { chunkTextForOutbound } from "recall/plugin-sdk/text-chunking";
export {
  deliverFormattedTextWithAttachments,
  formatTextWithAttachmentLinks,
  resolveOutboundMediaUrls,
} from "recall/plugin-sdk/reply-payload";
export {
  GROUP_POLICY_BLOCKED_LABEL,
  resolveAllowlistProviderRuntimeGroupPolicy,
  resolveDefaultGroupPolicy,
  warnMissingProviderGroupPolicyFallbackOnce,
} from "recall/plugin-sdk/runtime-group-policy";
export { isDangerousNameMatchingEnabled } from "recall/plugin-sdk/dangerous-name-runtime";
export { logInboundDrop } from "recall/plugin-sdk/channel-inbound";
