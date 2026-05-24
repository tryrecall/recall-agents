import { resolveDefaultModelForAgent } from "../agents/model-selection.js";
import type { RecallConfig } from "../config/config.js";

export function resolveCommitmentDefaultModelRef(params: {
  cfg: RecallConfig;
  agentId?: string;
}): { provider: string; model: string } {
  return resolveDefaultModelForAgent(params);
}
