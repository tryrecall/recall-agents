// Private runtime barrel for the bundled Mattermost extension.
// Keep this barrel thin and generic-only.

export type {
  BaseProbeResult,
  ChannelAccountSnapshot,
  ChannelDirectoryEntry,
  ChannelGroupContext,
  ChannelMessageActionName,
  ChannelPlugin,
  ChatType,
  HistoryEntry,
  RecallConfig,
  RecallPluginApi,
  PluginRuntime,
} from "recall/plugin-sdk/core";
export type { RuntimeEnv } from "recall/plugin-sdk/runtime";
export type { ReplyPayload } from "recall/plugin-sdk/reply-runtime";
export type { ModelsProviderData } from "recall/plugin-sdk/models-provider-runtime";
export type {
  BlockStreamingCoalesceConfig,
  DmPolicy,
  GroupPolicy,
} from "recall/plugin-sdk/config-contracts";
export {
  DEFAULT_ACCOUNT_ID,
  buildChannelConfigSchema,
  createDedupeCache,
  parseStrictPositiveInteger,
  resolveClientIp,
  isTrustedProxyAddress,
} from "recall/plugin-sdk/core";
export { buildComputedAccountStatusSnapshot } from "recall/plugin-sdk/channel-status";
export { createAccountStatusSink } from "recall/plugin-sdk/channel-lifecycle";
export { buildAgentMediaPayload } from "recall/plugin-sdk/agent-media-payload";
export {
  listSkillCommandsForAgents,
  resolveControlCommandGate,
  resolveStoredModelOverride,
} from "recall/plugin-sdk/command-auth-native";
export { buildModelsProviderData } from "recall/plugin-sdk/models-provider-runtime";
export {
  GROUP_POLICY_BLOCKED_LABEL,
  resolveAllowlistProviderRuntimeGroupPolicy,
  resolveDefaultGroupPolicy,
  warnMissingProviderGroupPolicyFallbackOnce,
} from "recall/plugin-sdk/runtime-group-policy";
export { isDangerousNameMatchingEnabled } from "recall/plugin-sdk/dangerous-name-runtime";
export { loadSessionStore, resolveStorePath } from "recall/plugin-sdk/session-store-runtime";
export { formatInboundFromLabel } from "recall/plugin-sdk/channel-inbound";
export { logInboundDrop } from "recall/plugin-sdk/channel-inbound";
export { createChannelPairingController } from "recall/plugin-sdk/channel-pairing";
export { createChannelMessageReplyPipeline } from "recall/plugin-sdk/channel-message";
export { logTypingFailure } from "recall/plugin-sdk/channel-feedback";
export { loadOutboundMediaFromUrl } from "recall/plugin-sdk/outbound-media";
export { rawDataToString } from "recall/plugin-sdk/webhook-ingress";
export { chunkTextForOutbound } from "recall/plugin-sdk/text-chunking";
// Legacy map-helper exports stay for older plugin consumers. New message-turn
// code should use createChannelHistoryWindow.
export {
  DEFAULT_GROUP_HISTORY_LIMIT,
  createChannelHistoryWindow,
  buildPendingHistoryContextFromMap,
  clearHistoryEntriesIfEnabled,
  recordPendingHistoryEntryIfEnabled,
} from "recall/plugin-sdk/reply-history";
export { normalizeAccountId, resolveThreadSessionKeys } from "recall/plugin-sdk/routing";
export { resolveAllowlistMatchSimple } from "recall/plugin-sdk/allow-from";
export { registerPluginHttpRoute } from "recall/plugin-sdk/webhook-targets";
export {
  isRequestBodyLimitError,
  readRequestBodyWithLimit,
} from "recall/plugin-sdk/webhook-ingress";
export {
  applyAccountNameToChannelSection,
  applySetupAccountConfigPatch,
  migrateBaseNameToDefaultAccount,
} from "recall/plugin-sdk/setup";
export {
  getAgentScopedMediaLocalRoots,
  resolveChannelMediaMaxBytes,
} from "recall/plugin-sdk/media-runtime";
export { normalizeProviderId } from "recall/plugin-sdk/provider-model-shared";
export { setMattermostRuntime } from "./src/runtime.js";
