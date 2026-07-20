// Focused runtime contract for memory plugin config/state/helpers.

export type { AnyAgentTool } from "./host/steelengine-runtime-agent.js";
export { resolveCronStyleNow } from "./host/steelengine-runtime-agent.js";
export { DEFAULT_AGENT_COMPACTION_RESERVE_TOKENS_FLOOR } from "./host/steelengine-runtime-agent.js";
export { resolveDefaultAgentId, resolveSessionAgentId } from "./host/steelengine-runtime-agent.js";
export { resolveMemorySearchConfig } from "./host/steelengine-runtime-agent.js";
export {
  asToolParamsRecord,
  jsonResult,
  readNumberParam,
  readStringParam,
} from "./host/steelengine-runtime-agent.js";
export { SILENT_REPLY_TOKEN } from "./host/steelengine-runtime-session.js";
export { parseNonNegativeByteSize } from "./host/steelengine-runtime-config.js";
export {
  getRuntimeConfig,
  /** @deprecated Use getRuntimeConfig(), or pass the already loaded config through the call path. */
  loadConfig,
} from "./host/steelengine-runtime-config.js";
export { resolveStateDir } from "./host/steelengine-runtime-config.js";
export { resolveSessionTranscriptsDirForAgent } from "./host/steelengine-runtime-config.js";
export { emptyPluginConfigSchema } from "./host/steelengine-runtime-memory.js";
export {
  buildActiveMemoryPromptSection,
  getMemoryCapabilityRegistration,
  listActiveMemoryPublicArtifacts,
} from "./host/steelengine-runtime-memory.js";
export { parseAgentSessionKey } from "./host/steelengine-runtime-agent.js";
export type { SteelEngineConfig } from "./host/steelengine-runtime-config.js";
export type { MemoryCitationsMode } from "./host/steelengine-runtime-config.js";
export type {
  MemoryFlushPlan,
  MemoryFlushPlanResolver,
  MemoryPluginCapability,
  MemoryPluginPublicArtifact,
  MemoryPluginPublicArtifactsProvider,
  MemoryPluginRuntime,
  MemoryPromptSectionBuilder,
} from "./host/steelengine-runtime-memory.js";
export type { SteelEnginePluginApi } from "./host/steelengine-runtime-memory.js";
