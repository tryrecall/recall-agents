// Private runtime barrel for the bundled Nextcloud Talk extension.
// Keep this barrel thin and aligned with the local extension surface.

export type { AllowlistMatch } from "recall/plugin-sdk/allow-from";
export type { ChannelGroupContext } from "recall/plugin-sdk/channel-contract";
export { logInboundDrop } from "recall/plugin-sdk/channel-logging";
export { createChannelPairingController } from "recall/plugin-sdk/channel-pairing";
export type {
  BlockStreamingCoalesceConfig,
  DmConfig,
  DmPolicy,
  GroupPolicy,
  GroupToolPolicyConfig,
  RecallConfig,
} from "recall/plugin-sdk/config-contracts";
export {
  GROUP_POLICY_BLOCKED_LABEL,
  resolveAllowlistProviderRuntimeGroupPolicy,
  resolveDefaultGroupPolicy,
  warnMissingProviderGroupPolicyFallbackOnce,
} from "recall/plugin-sdk/runtime-group-policy";
export { createChannelMessageReplyPipeline } from "recall/plugin-sdk/channel-message";
export type { OutboundReplyPayload } from "recall/plugin-sdk/reply-payload";
export { deliverFormattedTextWithAttachments } from "recall/plugin-sdk/reply-payload";
export type { PluginRuntime } from "recall/plugin-sdk/runtime-store";
export type { RuntimeEnv } from "recall/plugin-sdk/runtime";
export type { SecretInput } from "recall/plugin-sdk/secret-input";
export { fetchWithSsrFGuard } from "recall/plugin-sdk/ssrf-runtime";
export { setNextcloudTalkRuntime } from "./src/runtime.js";
