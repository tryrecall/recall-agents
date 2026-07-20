// Telegram plugin module implements bot message dispatch behavior.
export { getSessionEntry, type SessionEntry } from "steelengine/plugin-sdk/session-store-runtime";
export { resolveMarkdownTableMode } from "steelengine/plugin-sdk/markdown-table-runtime";
export { getAgentScopedMediaLocalRoots } from "steelengine/plugin-sdk/media-runtime";
export { resolveChunkMode } from "steelengine/plugin-sdk/reply-dispatch-runtime";
export {
  generateTelegramTopicLabel as generateTopicLabel,
  resolveAutoTopicLabelConfig,
} from "./auto-topic-label.js";
