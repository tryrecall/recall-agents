// Test fixture helpers for constructing ACP runtime session metadata.
import type { SessionAcpMeta } from "../../../config/sessions/types.js";
import type { SteelEngineConfig } from "../../../config/types.steelengine.js";

export function createAcpTestConfig(overrides?: Partial<SteelEngineConfig>): SteelEngineConfig {
  return {
    acp: {
      enabled: true,
      stream: {
        coalesceIdleMs: 0,
        maxChunkChars: 64,
      },
    },
    ...overrides,
  } as SteelEngineConfig;
}

export function createAcpSessionMeta(overrides?: Partial<SessionAcpMeta>): SessionAcpMeta {
  return {
    backend: "acpx",
    agent: "codex",
    runtimeSessionName: "runtime:1",
    mode: "persistent",
    state: "idle",
    lastActivityAt: Date.now(),
    identity: {
      state: "resolved",
      acpxSessionId: "acpx-session-1",
      source: "status",
      lastUpdatedAt: Date.now(),
    },
    ...overrides,
  };
}
