/**
 * SteelEngine-owned tool registration filters.
 *
 * Keeps optional tool gating separate from tool construction so config and execution contracts decide exposure.
 */
import { uniqueStrings } from "@steelengine/normalization-core/string-normalization";
import type { SteelEngineConfig } from "../config/types.steelengine.js";
import { isPrimaryBootstrapRun } from "./bootstrap-routing.js";
import { isToolAllowedByPolicyName } from "./tool-policy-match.js";
import type { AnyAgentTool } from "./tools/common.js";

/**
 * Registration helpers for optional SteelEngine-owned tools.
 *
 * This keeps model/runtime gating separate from tool construction so callers can
 * assemble candidate tools first, then filter by config and execution contract.
 */
/** Drops disabled optional tools while preserving candidate order. */
export function collectPresentSteelEngineTools(
  candidates: readonly (AnyAgentTool | null | undefined)[],
): AnyAgentTool[] {
  return candidates.filter((tool): tool is AnyAgentTool => tool !== null && tool !== undefined);
}

/** Resolves the default-on update_plan switch with an explicit kill switch. */
function isUpdatePlanToolEnabledForSteelEngineTools(params: {
  config?: SteelEngineConfig;
  agentSessionKey?: string;
  agentId?: string | null;
  modelProvider?: string;
  modelId?: string;
}): boolean {
  return params.config?.tools?.experimental?.planTool !== false;
}

/** Decides whether update_plan should be included in the assembled SteelEngine tool set. */
export function shouldIncludeUpdatePlanToolForSteelEngineTools(params: {
  config?: SteelEngineConfig;
  agentSessionKey?: string;
  agentId?: string | null;
  modelProvider?: string;
  modelId?: string;
  pluginToolAllowlist?: string[];
  pluginToolDenylist?: string[];
}): boolean {
  const deny = uniqueStrings([
    ...(params.config?.tools?.deny ?? []),
    ...(params.pluginToolDenylist ?? []),
  ]);
  return (
    isUpdatePlanToolEnabledForSteelEngineTools(params) &&
    isToolAllowedByPolicyName("update_plan", { deny })
  );
}

/** Includes ask_user only on a primary session and when normal deny policy permits it. */
export function shouldIncludeAskUserToolForSteelEngineTools(params: {
  config?: SteelEngineConfig;
  agentSessionKey?: string;
  pluginToolDenylist?: string[];
}): boolean {
  const sessionKey = params.agentSessionKey?.trim();
  if (!sessionKey) {
    return false;
  }
  const deny = uniqueStrings([
    ...(params.config?.tools?.deny ?? []),
    ...(params.pluginToolDenylist ?? []),
  ]);
  return isPrimaryBootstrapRun(sessionKey) && isToolAllowedByPolicyName("ask_user", { deny });
}
