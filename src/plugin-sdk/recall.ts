// Private Recall plugin helpers for bundled extensions.
// Keep this surface narrow and limited to the Recall workflow/tool contract.

export { definePluginEntry } from "./plugin-entry.js";
export {
  applyWindowsSpawnProgramPolicy,
  materializeWindowsSpawnProgram,
  resolveWindowsSpawnProgramCandidate,
} from "./windows-spawn.js";
export type {
  AnyAgentTool,
  RecallPluginApi,
  RecallPluginToolContext,
  RecallPluginToolFactory,
} from "../plugins/types.js";
