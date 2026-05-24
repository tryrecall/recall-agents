// Narrow plugin-sdk surface for the bundled thread-ownership plugin.
// Keep this list additive and scoped to symbols used under extensions/thread-ownership.

export { definePluginEntry } from "./plugin-entry.js";
export type { RecallConfig } from "../config/config.js";
export type { RecallPluginApi } from "../plugins/types.js";
