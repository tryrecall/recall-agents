// Private runtime barrel for the bundled Nextcloud Talk extension.
// Keep this barrel thin and aligned with the local extension surface.

export type { AllowlistMatch } from "steelengine/plugin-sdk/allow-from";
export type { ChannelGroupContext } from "steelengine/plugin-sdk/channel-contract";
export { logInboundDrop } from "steelengine/plugin-sdk/channel-inbound";
export { createChannelPairingController } from "steelengine/plugin-sdk/channel-pairing";
export type {
  BlockStreamingCoalesceConfig,
  DmConfig,
  DmPolicy,
  GroupPolicy,
  GroupToolPolicyConfig,
  SteelEngineConfig,
} from "steelengine/plugin-sdk/config-contracts";
export {
  GROUP_POLICY_BLOCKED_LABEL,
  resolveAllowlistProviderRuntimeGroupPolicy,
  resolveDefaultGroupPolicy,
  warnMissingProviderGroupPolicyFallbackOnce,
} from "steelengine/plugin-sdk/runtime-group-policy";
export { createChannelMessageReplyPipeline } from "steelengine/plugin-sdk/channel-outbound";
export type { OutboundReplyPayload } from "steelengine/plugin-sdk/reply-payload";
export { deliverFormattedTextWithAttachments } from "steelengine/plugin-sdk/reply-payload";
export type { PluginRuntime } from "steelengine/plugin-sdk/runtime-store";
export type { RuntimeEnv } from "steelengine/plugin-sdk/runtime";
export type { SecretInput } from "steelengine/plugin-sdk/secret-input";
export { fetchWithSsrFGuard } from "steelengine/plugin-sdk/ssrf-runtime";
export { setNextcloudTalkRuntime } from "./src/runtime.js";
