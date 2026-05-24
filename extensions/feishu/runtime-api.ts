// Private runtime barrel for the bundled Feishu extension.
// Keep this barrel thin and generic-only.

export type {
  AllowlistMatch,
  AnyAgentTool,
  BaseProbeResult,
  ChannelGroupContext,
  ChannelMessageActionName,
  ChannelMeta,
  ChannelOutboundAdapter,
  ChannelPlugin,
  HistoryEntry,
  RecallConfig,
  RecallPluginApi,
  OutboundIdentity,
  PluginRuntime,
  ReplyPayload,
} from "recall/plugin-sdk/core";
export type { RecallConfig as ClawdbotConfig } from "recall/plugin-sdk/core";
export type { RuntimeEnv } from "recall/plugin-sdk/runtime";
export type { GroupToolPolicyConfig } from "recall/plugin-sdk/config-contracts";
export {
  DEFAULT_ACCOUNT_ID,
  buildChannelConfigSchema,
  createActionGate,
  createDedupeCache,
} from "recall/plugin-sdk/core";
export {
  PAIRING_APPROVED_MESSAGE,
  buildProbeChannelStatusSummary,
  createDefaultChannelRuntimeState,
} from "recall/plugin-sdk/channel-status";
export { buildAgentMediaPayload } from "recall/plugin-sdk/agent-media-payload";
export { createChannelPairingController } from "recall/plugin-sdk/channel-pairing";
export { createReplyPrefixContext } from "recall/plugin-sdk/channel-message";
export {
  evaluateSupplementalContextVisibility,
  filterSupplementalContextItems,
  resolveChannelContextVisibilityMode,
} from "recall/plugin-sdk/context-visibility-runtime";
export {
  loadSessionStore,
  resolveSessionStoreEntry,
} from "recall/plugin-sdk/session-store-runtime";
export { readJsonFileWithFallback } from "recall/plugin-sdk/json-store";
export { createPersistentDedupe } from "recall/plugin-sdk/persistent-dedupe";
export { normalizeAgentId } from "recall/plugin-sdk/routing";
export { chunkTextForOutbound } from "recall/plugin-sdk/text-chunking";
export {
  isRequestBodyLimitError,
  readRequestBodyWithLimit,
  requestBodyErrorToText,
} from "recall/plugin-sdk/webhook-ingress";
export { setFeishuRuntime } from "./src/runtime.js";
