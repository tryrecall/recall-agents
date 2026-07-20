// Whatsapp API module exposes the plugin public contract.
export { resolveIdentityNamePrefix } from "steelengine/plugin-sdk/agent-runtime";
export { formatInboundEnvelope } from "steelengine/plugin-sdk/channel-inbound";
export { resolveInboundSessionEnvelopeContext } from "steelengine/plugin-sdk/channel-inbound";
export { toLocationContext } from "steelengine/plugin-sdk/channel-inbound";
export {
  createChannelMessageReplyPipeline,
  resolveChannelMessageSourceReplyDeliveryMode,
} from "steelengine/plugin-sdk/channel-outbound";
export {
  isControlCommandMessage,
  shouldComputeCommandAuthorized,
} from "steelengine/plugin-sdk/command-detection";
export { resolveChannelContextVisibilityMode } from "../config.runtime.js";
export { getAgentScopedMediaLocalRoots } from "steelengine/plugin-sdk/media-runtime";
export type LoadConfigFn = typeof import("../config.runtime.js").getRuntimeConfig;
export {
  buildHistoryContextFromEntries,
  type HistoryEntry,
} from "steelengine/plugin-sdk/reply-history";
export { resolveSendableOutboundReplyParts } from "steelengine/plugin-sdk/reply-payload";
export {
  resolveChunkMode,
  resolveTextChunkLimit,
  type getReplyFromConfig,
  type ReplyPayload,
} from "steelengine/plugin-sdk/reply-runtime";
export {
  resolveInboundLastRouteSessionKey,
  type resolveAgentRoute,
} from "steelengine/plugin-sdk/routing";
export { logVerbose, shouldLogVerbose, type getChildLogger } from "steelengine/plugin-sdk/runtime-env";
export { resolvePinnedMainDmOwnerFromAllowlist } from "steelengine/plugin-sdk/security-runtime";
export { resolveMarkdownTableMode } from "steelengine/plugin-sdk/markdown-table-runtime";
export { jidToE164, normalizeE164 } from "../../text-runtime.js";
