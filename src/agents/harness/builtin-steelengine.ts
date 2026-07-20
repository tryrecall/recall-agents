/**
 * Built-in SteelEngine harness registration.
 *
 * Harness selection uses this factory to expose the embedded SteelEngine runtime
 * through the same AgentHarness contract as external harness plugins.
 */
import { STEELENGINE_EMBEDDED_CONTEXT_ENGINE_HOST } from "../../context-engine/host-compat.js";
import { runEmbeddedAttempt } from "../embedded-agent-runner/run/attempt.js";
import type { AgentHarness } from "./types.js";

/** Creates the built-in harness backed by the embedded SteelEngine agent runner. */
export function createSteelEngineAgentHarness(): AgentHarness {
  return {
    id: "steelengine",
    label: "SteelEngine embedded agent",
    contextEngineHostCapabilities: STEELENGINE_EMBEDDED_CONTEXT_ENGINE_HOST.capabilities,
    supports: () => ({ supported: true, priority: 0 }),
    runAttempt: runEmbeddedAttempt,
  };
}
