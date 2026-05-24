// Private runtime barrel for the bundled Google Chat extension.
// Keep this barrel thin and avoid broad plugin-sdk surfaces during bootstrap.

export { DEFAULT_ACCOUNT_ID } from "recall/plugin-sdk/account-id";
export {
  createActionGate,
  jsonResult,
  readNumberParam,
  readReactionParams,
  readStringParam,
} from "recall/plugin-sdk/channel-actions";
export { buildChannelConfigSchema } from "recall/plugin-sdk/channel-config-primitives";
export type {
  ChannelMessageActionAdapter,
  ChannelMessageActionName,
  ChannelStatusIssue,
} from "recall/plugin-sdk/channel-contract";
export { missingTargetError } from "recall/plugin-sdk/channel-feedback";
export {
  createAccountStatusSink,
  runPassiveAccountLifecycle,
} from "recall/plugin-sdk/channel-lifecycle";
export { createChannelPairingController } from "recall/plugin-sdk/channel-pairing";
export { createChannelMessageReplyPipeline } from "recall/plugin-sdk/channel-message";
export { PAIRING_APPROVED_MESSAGE } from "recall/plugin-sdk/channel-status";
export { chunkTextForOutbound } from "recall/plugin-sdk/text-chunking";
export type { RecallConfig } from "recall/plugin-sdk/config-contracts";
export { GoogleChatConfigSchema } from "recall/plugin-sdk/bundled-channel-config-schema";
export {
  GROUP_POLICY_BLOCKED_LABEL,
  resolveAllowlistProviderRuntimeGroupPolicy,
  resolveDefaultGroupPolicy,
  warnMissingProviderGroupPolicyFallbackOnce,
} from "recall/plugin-sdk/runtime-group-policy";
export { isDangerousNameMatchingEnabled } from "recall/plugin-sdk/dangerous-name-runtime";
export {
  readRemoteMediaBuffer,
  resolveChannelMediaMaxBytes,
} from "recall/plugin-sdk/media-runtime";
export { loadOutboundMediaFromUrl } from "recall/plugin-sdk/outbound-media";
export type { PluginRuntime } from "recall/plugin-sdk/runtime-store";
export { fetchWithSsrFGuard } from "recall/plugin-sdk/ssrf-runtime";
export type {
  GoogleChatAccountConfig,
  GoogleChatConfig,
} from "recall/plugin-sdk/config-contracts";
export { extractToolSend } from "recall/plugin-sdk/tool-send";
export { resolveInboundMentionDecision } from "recall/plugin-sdk/channel-inbound";
export { resolveInboundRouteEnvelopeBuilderWithRuntime } from "recall/plugin-sdk/inbound-envelope";
export { resolveWebhookPath } from "recall/plugin-sdk/webhook-ingress";
export {
  registerWebhookTargetWithPluginRoute,
  resolveWebhookTargetWithAuthOrReject,
  withResolvedWebhookRequestPipeline,
} from "recall/plugin-sdk/webhook-targets";
export {
  createWebhookInFlightLimiter,
  readJsonWebhookBodyOrReject,
  type WebhookInFlightLimiter,
} from "recall/plugin-sdk/webhook-request-guards";
export { setGoogleChatRuntime } from "./src/runtime.js";
