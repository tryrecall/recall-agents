// Private runtime barrel for the bundled Google Chat extension.
// Keep this barrel thin and avoid broad plugin-sdk surfaces during bootstrap.

export { DEFAULT_ACCOUNT_ID } from "steelengine/plugin-sdk/account-id";
export {
  createActionGate,
  jsonResult,
  readNumberParam,
  readReactionParams,
  readStringParam,
} from "steelengine/plugin-sdk/channel-actions";
export { buildChannelConfigSchema, GoogleChatConfigSchema } from "./config-api.js";
export type {
  ChannelMessageActionAdapter,
  ChannelMessageActionName,
  ChannelStatusIssue,
} from "steelengine/plugin-sdk/channel-contract";
export { missingTargetError } from "steelengine/plugin-sdk/channel-feedback";
export {
  createAccountStatusSink,
  runPassiveAccountLifecycle,
} from "steelengine/plugin-sdk/channel-outbound";
export { createChannelPairingController } from "steelengine/plugin-sdk/channel-pairing";
export { createChannelMessageReplyPipeline } from "steelengine/plugin-sdk/channel-outbound";
export { PAIRING_APPROVED_MESSAGE } from "steelengine/plugin-sdk/channel-status";
export { chunkTextForOutbound } from "steelengine/plugin-sdk/text-chunking";
export type { SteelEngineConfig } from "steelengine/plugin-sdk/config-contracts";
export {
  GROUP_POLICY_BLOCKED_LABEL,
  resolveAllowlistProviderRuntimeGroupPolicy,
  resolveDefaultGroupPolicy,
  warnMissingProviderGroupPolicyFallbackOnce,
} from "steelengine/plugin-sdk/runtime-group-policy";
export { isDangerousNameMatchingEnabled } from "steelengine/plugin-sdk/dangerous-name-runtime";
export type { PluginRuntime } from "steelengine/plugin-sdk/runtime-store";
export { fetchWithSsrFGuard } from "steelengine/plugin-sdk/ssrf-runtime";
export type {
  GoogleChatAccountConfig,
  GoogleChatConfig,
} from "steelengine/plugin-sdk/config-contracts";
export { extractToolSend } from "steelengine/plugin-sdk/tool-send";
export { resolveInboundMentionDecision } from "steelengine/plugin-sdk/channel-inbound";
export { resolveWebhookPath } from "steelengine/plugin-sdk/webhook-ingress";
export {
  registerWebhookTargetWithPluginRoute,
  resolveWebhookTargetWithAuthOrReject,
  withResolvedWebhookRequestPipeline,
} from "steelengine/plugin-sdk/webhook-targets";
export {
  createWebhookInFlightLimiter,
  readJsonWebhookBodyOrReject,
  type WebhookInFlightLimiter,
} from "steelengine/plugin-sdk/webhook-request-guards";
export { setGoogleChatRuntime } from "./src/runtime.js";
