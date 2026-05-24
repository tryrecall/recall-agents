import os from "node:os";
import path from "node:path";
import { resolveRequiredHomeDir } from "../infra/home-dir.js";
import { normalizeOptionalLowercaseString } from "../shared/string-coerce.js";

export function resolveDefaultAgentWorkspaceDir(
  env: NodeJS.ProcessEnv = process.env,
  homedir: () => string = os.homedir,
): string {
  const workspaceDir = env.RECALL_WORKSPACE_DIR?.trim();
  if (workspaceDir) {
    return path.resolve(workspaceDir);
  }
  const home = resolveRequiredHomeDir(env, homedir);
  const profile = env.RECALL_PROFILE?.trim();
  if (profile && normalizeOptionalLowercaseString(profile) !== "default") {
    return path.join(home, ".recall", `workspace-${profile}`);
  }
  return path.join(home, ".recall", "workspace");
}

export const DEFAULT_AGENT_WORKSPACE_DIR = resolveDefaultAgentWorkspaceDir();
