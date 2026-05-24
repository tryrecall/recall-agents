// Real workspace contract for memory engine foundation concerns.

export {
  resolveAgentContextLimits,
  resolveAgentDir,
  resolveAgentWorkspaceDir,
  resolveDefaultAgentId,
  resolveSessionAgentId,
} from "./host/recall-runtime-agent.js";
export {
  resolveMemorySearchConfig,
  resolveMemorySearchSyncConfig,
  type ResolvedMemorySearchConfig,
  type ResolvedMemorySearchSyncConfig,
} from "./host/recall-runtime-agent.js";
export { parseDurationMs } from "./host/recall-runtime-config.js";
export { loadConfig } from "./host/recall-runtime-config.js";
export { resolveStateDir } from "./host/recall-runtime-config.js";
export { resolveSessionTranscriptsDirForAgent } from "./host/recall-runtime-config.js";
export {
  hasConfiguredSecretInput,
  normalizeResolvedSecretInputString,
} from "./host/recall-runtime-config.js";
export { root } from "./host/recall-runtime-io.js";
export { isPathInside } from "./host/fs-utils.js";
export { createSubsystemLogger } from "./host/recall-runtime-io.js";
export { detectMime } from "./host/recall-runtime-io.js";
export { resolveGlobalSingleton } from "./host/recall-runtime-io.js";
export { onSessionTranscriptUpdate } from "./host/recall-runtime-session.js";
export { splitShellArgs } from "./host/recall-runtime-io.js";
export { runTasksWithConcurrency } from "./host/recall-runtime-io.js";
export {
  shortenHomeInString,
  shortenHomePath,
  resolveUserPath,
  truncateUtf16Safe,
} from "./host/recall-runtime-io.js";
export type { RecallConfig } from "./host/recall-runtime-config.js";
export type { SessionSendPolicyConfig } from "./host/recall-runtime-config.js";
export type { SecretInput } from "./host/recall-runtime-config.js";
export type {
  MemoryBackend,
  MemoryCitationsMode,
  MemoryQmdConfig,
  MemoryQmdIndexPath,
  MemoryQmdMcporterConfig,
  MemoryQmdSearchMode,
} from "./host/recall-runtime-config.js";
export type { MemorySearchConfig } from "./host/recall-runtime-config.js";
