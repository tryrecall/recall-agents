// Focused runtime contract for memory plugin config/state/helpers.

export type { AnyAgentTool } from "./host/recall-runtime-agent.js";
export { resolveCronStyleNow } from "./host/recall-runtime-agent.js";
export { DEFAULT_PI_COMPACTION_RESERVE_TOKENS_FLOOR } from "./host/recall-runtime-agent.js";
export { resolveDefaultAgentId, resolveSessionAgentId } from "./host/recall-runtime-agent.js";
export { resolveMemorySearchConfig } from "./host/recall-runtime-agent.js";
export {
  asToolParamsRecord,
  jsonResult,
  readNumberParam,
  readStringParam,
} from "./host/recall-runtime-agent.js";
export { SILENT_REPLY_TOKEN } from "./host/recall-runtime-session.js";
export { parseNonNegativeByteSize } from "./host/recall-runtime-config.js";
export {
  getRuntimeConfig,
  /** @deprecated Use getRuntimeConfig(), or pass the already loaded config through the call path. */
  loadConfig,
} from "./host/recall-runtime-config.js";
export { resolveStateDir } from "./host/recall-runtime-config.js";
export { resolveSessionTranscriptsDirForAgent } from "./host/recall-runtime-config.js";
export { emptyPluginConfigSchema } from "./host/recall-runtime-memory.js";
export {
  buildActiveMemoryPromptSection,
  getMemoryCapabilityRegistration,
  listActiveMemoryPublicArtifacts,
} from "./host/recall-runtime-memory.js";
export { parseAgentSessionKey } from "./host/recall-runtime-agent.js";
export type { RecallConfig } from "./host/recall-runtime-config.js";
export type { MemoryCitationsMode } from "./host/recall-runtime-config.js";
export type {
  MemoryFlushPlan,
  MemoryFlushPlanResolver,
  MemoryPluginCapability,
  MemoryPluginPublicArtifact,
  MemoryPluginPublicArtifactsProvider,
  MemoryPluginRuntime,
  MemoryPromptSectionBuilder,
} from "./host/recall-runtime-memory.js";
export type { RecallPluginApi } from "./host/recall-runtime-memory.js";
