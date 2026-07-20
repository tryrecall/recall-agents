// Mattermost API module exposes the plugin public contract.
export type {
  BaseProbeResult,
  ChannelAccountSnapshot,
  ChannelDirectoryEntry,
  ChatType,
  HistoryEntry,
  SteelEngineConfig,
  SteelEnginePluginApi,
  ReplyPayload,
} from "steelengine/plugin-sdk/core";
export type { RuntimeEnv } from "steelengine/plugin-sdk/runtime";
export { buildAgentMediaPayload } from "steelengine/plugin-sdk/agent-media-payload";
export { resolveAllowlistMatchSimple } from "steelengine/plugin-sdk/allow-from";
export { logInboundDrop } from "steelengine/plugin-sdk/channel-inbound";
export { createChannelPairingController } from "steelengine/plugin-sdk/channel-pairing";
export { createChannelMessageReplyPipeline } from "steelengine/plugin-sdk/channel-outbound";
export { logTypingFailure } from "steelengine/plugin-sdk/channel-feedback";
export { listSkillCommandsForAgents } from "steelengine/plugin-sdk/command-auth-native";
export { buildModelsProviderData } from "steelengine/plugin-sdk/models-provider-runtime";
export { isDangerousNameMatchingEnabled } from "steelengine/plugin-sdk/dangerous-name-runtime";
export {
  resolveAllowlistProviderRuntimeGroupPolicy,
  resolveDefaultGroupPolicy,
  warnMissingProviderGroupPolicyFallbackOnce,
} from "steelengine/plugin-sdk/runtime-group-policy";
export { resolveChannelMediaMaxBytes } from "steelengine/plugin-sdk/media-runtime";
export { loadOutboundMediaFromUrl } from "steelengine/plugin-sdk/outbound-media";
// Legacy map-helper exports stay for older plugin consumers. New message-turn
// code should use createChannelHistoryWindow.
export {
  DEFAULT_GROUP_HISTORY_LIMIT,
  createChannelHistoryWindow,
} from "steelengine/plugin-sdk/reply-history";
export { registerPluginHttpRoute } from "steelengine/plugin-sdk/webhook-targets";
export {
  isRequestBodyLimitError,
  readRequestBodyWithLimit,
} from "steelengine/plugin-sdk/webhook-ingress";
export { isTrustedProxyAddress, resolveClientIp } from "steelengine/plugin-sdk/core";
export { parseTcpPort } from "steelengine/plugin-sdk/number-runtime";
