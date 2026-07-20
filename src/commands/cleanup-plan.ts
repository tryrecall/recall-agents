// Resolves cleanup inputs from current SteelEngine config and state paths.
import {
  getRuntimeConfig,
  resolveConfigPath,
  resolveOAuthDir,
  resolveStateDir,
} from "../config/config.js";
import type { SteelEngineConfig } from "../config/types.steelengine.js";
import { buildCleanupPlan } from "./cleanup-utils.js";

/** Build the cleanup plan for the current runtime config/state/credential paths on disk. */
export function resolveCleanupPlanFromDisk(): {
  cfg: SteelEngineConfig;
  stateDir: string;
  configPath: string;
  oauthDir: string;
  configInsideState: boolean;
  oauthInsideState: boolean;
  workspaceDirs: string[];
} {
  const cfg = getRuntimeConfig();
  const stateDir = resolveStateDir();
  const configPath = resolveConfigPath();
  const oauthDir = resolveOAuthDir();
  const plan = buildCleanupPlan({ cfg, stateDir, configPath, oauthDir });
  return { cfg, stateDir, configPath, oauthDir, ...plan };
}
