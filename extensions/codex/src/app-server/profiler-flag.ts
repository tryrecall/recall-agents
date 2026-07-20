/**
 * Resolves whether Codex app-server profiling instrumentation is enabled by
 * SteelEngine diagnostic flags.
 */
import type { SteelEngineConfig } from "steelengine/plugin-sdk/config-contracts";
import { isDiagnosticFlagEnabled } from "steelengine/plugin-sdk/diagnostic-runtime";

const PROFILER_FLAGS = ["profiler", "codex.profiler"] as const;

/** Checks the generic and Codex-specific profiler diagnostic flags. */
export function isCodexAppServerProfilerEnabled(
  config?: SteelEngineConfig,
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  return PROFILER_FLAGS.some((flag) => isDiagnosticFlagEnabled(flag, config, env));
}
