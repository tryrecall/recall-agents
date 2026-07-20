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
  SteelEngineConfig,
  SteelEnginePluginApi,
  PluginRuntime,
} from "steelengine/plugin-sdk/core";
export type { RuntimeEnv } from "steelengine/plugin-sdk/runtime";
export type { ReplyPayload } from "steelengine/plugin-sdk/reply-runtime";
export type { ModelsProviderData } from "steelengine/plugin-sdk/models-provider-runtime";
export type {
  BlockStreamingCoalesceConfig,
  DmPolicy,
  GroupPolicy,
} from "steelengine/plugin-sdk/config-contracts";
export {
  DEFAULT_ACCOUNT_ID,
  buildChannelConfigSchema,
  createDedupeCache,
  parseStrictPositiveInteger,
  resolveClientIp,
  isTrustedProxyAddress,
} from "steelengine/plugin-sdk/core";
export { buildComputedAccountStatusSnapshot } from "steelengine/plugin-sdk/channel-status";
export { createAccountStatusSink } from "steelengine/plugin-sdk/channel-outbound";
export { buildAgentMediaPayload } from "steelengine/plugin-sdk/agent-media-payload";
export {
  listSkillCommandsForAgents,
  resolveControlCommandGate,
  resolveStoredModelOverride,
} from "steelengine/plugin-sdk/command-auth-native";
export { buildModelsProviderData } from "steelengine/plugin-sdk/models-provider-runtime";
export {
  GROUP_POLICY_BLOCKED_LABEL,
  resolveAllowlistProviderRuntimeGroupPolicy,
  resolveDefaultGroupPolicy,
  warnMissingProviderGroupPolicyFallbackOnce,
} from "steelengine/plugin-sdk/runtime-group-policy";
export { isDangerousNameMatchingEnabled } from "steelengine/plugin-sdk/dangerous-name-runtime";
export { resolveStorePath } from "steelengine/plugin-sdk/session-store-runtime";
export { formatInboundFromLabel } from "steelengine/plugin-sdk/channel-inbound";
export { logInboundDrop } from "steelengine/plugin-sdk/channel-inbound";
export { createChannelPairingController } from "steelengine/plugin-sdk/channel-pairing";
export { createChannelMessageReplyPipeline } from "steelengine/plugin-sdk/channel-outbound";
export { logTypingFailure } from "steelengine/plugin-sdk/channel-feedback";
export { loadOutboundMediaFromUrl } from "steelengine/plugin-sdk/outbound-media";
export { rawDataToString } from "steelengine/plugin-sdk/webhook-ingress";
export { chunkTextForOutbound } from "steelengine/plugin-sdk/text-chunking";
// Legacy map-helper exports stay for older plugin consumers. New message-turn
// code should use createChannelHistoryWindow.
export {
  DEFAULT_GROUP_HISTORY_LIMIT,
  createChannelHistoryWindow,
  buildPendingHistoryContextFromMap,
  clearHistoryEntriesIfEnabled,
  recordPendingHistoryEntryIfEnabled,
} from "steelengine/plugin-sdk/reply-history";
export { normalizeAccountId, resolveThreadSessionKeys } from "steelengine/plugin-sdk/routing";
export { resolveAllowlistMatchSimple } from "steelengine/plugin-sdk/allow-from";
export { registerPluginHttpRoute } from "steelengine/plugin-sdk/webhook-targets";
export {
  isRequestBodyLimitError,
  readRequestBodyWithLimit,
} from "steelengine/plugin-sdk/webhook-ingress";
export {
  applyAccountNameToChannelSection,
  applySetupAccountConfigPatch,
  migrateBaseNameToDefaultAccount,
} from "steelengine/plugin-sdk/setup";
export {
  getAgentScopedMediaLocalRoots,
  resolveChannelMediaMaxBytes,
} from "steelengine/plugin-sdk/media-runtime";
export { normalizeProviderId } from "steelengine/plugin-sdk/provider-model-shared";
export { setMattermostRuntime } from "./src/runtime.js";
