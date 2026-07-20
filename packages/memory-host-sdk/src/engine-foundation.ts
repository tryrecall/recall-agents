// Real workspace contract for memory engine foundation concerns.

export {
  resolveAgentContextLimits,
  resolveAgentDir,
  resolveAgentWorkspaceDir,
  resolveDefaultAgentId,
  resolveSessionAgentId,
} from "./host/steelengine-runtime-agent.js";
export {
  resolveMemorySearchConfig,
  resolveMemorySearchSyncConfig,
  type ResolvedMemorySearchConfig,
  type ResolvedMemorySearchSyncConfig,
} from "./host/steelengine-runtime-agent.js";
export { parseDurationMs } from "./host/steelengine-runtime-config.js";
export { loadConfig } from "./host/steelengine-runtime-config.js";
export { resolveStateDir } from "./host/steelengine-runtime-config.js";
export { resolveSessionTranscriptsDirForAgent } from "./host/steelengine-runtime-config.js";
export {
  hasConfiguredSecretInput,
  normalizeResolvedSecretInputString,
} from "./host/steelengine-runtime-config.js";
export { root } from "./host/steelengine-runtime-io.js";
export { isPathInside } from "./host/fs-utils.js";
export { createSubsystemLogger } from "./host/steelengine-runtime-io.js";
export { detectMime } from "./host/steelengine-runtime-io.js";
export { resolveGlobalSingleton } from "./host/steelengine-runtime-io.js";
export { onSessionTranscriptUpdate } from "./host/steelengine-runtime-session.js";
export { splitShellArgs } from "./host/steelengine-runtime-io.js";
export { runTasksWithConcurrency } from "./host/steelengine-runtime-io.js";
export {
  shortenHomeInString,
  shortenHomePath,
  resolveUserPath,
  truncateUtf16Safe,
} from "./host/steelengine-runtime-io.js";
export type { SteelEngineConfig } from "./host/steelengine-runtime-config.js";
export type { SessionSendPolicyConfig } from "./host/steelengine-runtime-config.js";
export type { SecretInput } from "./host/steelengine-runtime-config.js";
export type {
  MemoryBackend,
  MemoryCitationsMode,
  MemoryQmdConfig,
  MemoryQmdIndexPath,
  MemoryQmdMcporterConfig,
  MemoryQmdSearchMode,
} from "./host/steelengine-runtime-config.js";
export type { MemorySearchConfig } from "./host/steelengine-runtime-config.js";
