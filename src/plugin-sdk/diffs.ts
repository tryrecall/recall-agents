// Narrow plugin-sdk surface for the bundled diffs plugin.
// Keep this list additive and scoped to symbols used under extensions/diffs.

export { definePluginEntry } from "./plugin-entry.js";
export type { RecallConfig } from "../config/config.js";
export { resolvePreferredRecallTmpDir } from "../infra/tmp-recall-dir.js";
export type {
  AnyAgentTool,
  RecallPluginApi,
  RecallPluginConfigSchema,
  RecallPluginToolContext,
  PluginLogger,
} from "../plugins/types.js";
