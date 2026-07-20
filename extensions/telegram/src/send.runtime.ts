// Telegram plugin module implements send behavior.
export { requireRuntimeConfig } from "steelengine/plugin-sdk/plugin-config-runtime";
export { resolveMarkdownTableMode } from "steelengine/plugin-sdk/markdown-table-runtime";
export type { SteelEngineConfig } from "steelengine/plugin-sdk/config-contracts";
export type { PollInput, MediaKind } from "steelengine/plugin-sdk/media-runtime";
export {
  buildOutboundMediaLoadOptions,
  getImageMetadata,
  isGifMedia,
  kindFromMime,
  normalizePollInput,
  probeVideoDimensions,
} from "steelengine/plugin-sdk/media-runtime";
export { loadWebMedia } from "steelengine/plugin-sdk/web-media";
