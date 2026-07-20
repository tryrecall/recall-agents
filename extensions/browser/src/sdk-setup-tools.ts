/**
 * Browser-local SDK setup/tooling bridge for CLI, media, and action helpers.
 */
export {
  callGatewayTool,
  listNodes,
  resolveNodeIdFromList,
  selectDefaultNodeFromList,
} from "steelengine/plugin-sdk/agent-harness-runtime";
export type { AnyAgentTool, NodeListNode } from "steelengine/plugin-sdk/agent-harness-runtime";
export {
  imageResultFromFile,
  jsonResult,
  readPositiveIntegerParam,
  readStringParam,
} from "steelengine/plugin-sdk/channel-actions";
export {
  formatCliCommand,
  formatHelpExamples,
  inheritOptionFromParent,
  note,
  theme,
} from "steelengine/plugin-sdk/cli-runtime";
export { danger, info } from "steelengine/plugin-sdk/runtime-env";
export {
  IMAGE_REDUCE_QUALITY_STEPS,
  buildImageResizeSideGrid,
  getImageMetadata,
  isImageProcessorUnavailableError,
  resizeToJpeg,
} from "steelengine/plugin-sdk/media-runtime";
export { detectMime } from "steelengine/plugin-sdk/media-mime";
export { ensureMediaDir, saveMediaBuffer } from "steelengine/plugin-sdk/media-runtime";
export { describeImageFile } from "steelengine/plugin-sdk/media-understanding-runtime";
export { formatDocsLink } from "steelengine/plugin-sdk/setup-tools";
