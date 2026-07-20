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
  SteelEngineConfig,
  SteelEnginePluginApi,
  OutboundIdentity,
  PluginRuntime,
  ReplyPayload,
} from "steelengine/plugin-sdk/core";
export type { SteelEngineConfig as ClawdbotConfig } from "steelengine/plugin-sdk/core";
export type RuntimeEnv = {
  log: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
  exit: (code: number) => void;
};
export type { GroupToolPolicyConfig } from "steelengine/plugin-sdk/config-contracts";
export {
  DEFAULT_ACCOUNT_ID,
  buildChannelConfigSchema,
  createActionGate,
  createDedupeCache,
} from "steelengine/plugin-sdk/core";
export {
  PAIRING_APPROVED_MESSAGE,
  buildProbeChannelStatusSummary,
  createDefaultChannelRuntimeState,
} from "steelengine/plugin-sdk/channel-status";
export { buildAgentMediaPayload } from "steelengine/plugin-sdk/agent-media-payload";
export { createChannelPairingController } from "steelengine/plugin-sdk/channel-pairing";
export { createReplyPrefixContext } from "steelengine/plugin-sdk/channel-outbound";
export {
  evaluateSupplementalContextVisibility,
  filterSupplementalContextItems,
  resolveChannelContextVisibilityMode,
} from "steelengine/plugin-sdk/context-visibility-runtime";
export { getSessionEntry } from "steelengine/plugin-sdk/session-store-runtime";
export { readJsonFileWithFallback } from "steelengine/plugin-sdk/json-store";
export { normalizeAgentId } from "steelengine/plugin-sdk/routing";
export { chunkTextForOutbound } from "steelengine/plugin-sdk/text-chunking";
export {
  isRequestBodyLimitError,
  readRequestBodyWithLimit,
  requestBodyErrorToText,
} from "steelengine/plugin-sdk/webhook-ingress";
export { setFeishuRuntime } from "./src/runtime.js";
