import {
  applyAgentDefaultModelPrimary,
  type RecallConfig,
} from "recall/plugin-sdk/provider-onboard";

export const OPENCODE_GO_DEFAULT_MODEL_REF = "opencode-go/kimi-k2.6";

export function applyOpencodeGoProviderConfig(cfg: RecallConfig): RecallConfig {
  return cfg;
}

export function applyOpencodeGoConfig(cfg: RecallConfig): RecallConfig {
  return applyAgentDefaultModelPrimary(
    applyOpencodeGoProviderConfig(cfg),
    OPENCODE_GO_DEFAULT_MODEL_REF,
  );
}
