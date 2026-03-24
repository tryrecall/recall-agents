import { OPENCODE_ZEN_DEFAULT_MODEL_REF } from "recall/plugin-sdk/provider-models";
import {
  applyAgentDefaultModelPrimary,
  withAgentModelAliases,
  type RecallConfig,
} from "recall/plugin-sdk/provider-onboard";

export { OPENCODE_ZEN_DEFAULT_MODEL_REF };

export function applyOpencodeZenProviderConfig(cfg: RecallConfig): RecallConfig {
  return {
    ...cfg,
    agents: {
      ...cfg.agents,
      defaults: {
        ...cfg.agents?.defaults,
        models: withAgentModelAliases(cfg.agents?.defaults?.models, [
          { modelRef: OPENCODE_ZEN_DEFAULT_MODEL_REF, alias: "Opus" },
        ]),
      },
    },
  };
}

export function applyOpencodeZenConfig(cfg: RecallConfig): RecallConfig {
  return applyAgentDefaultModelPrimary(
    applyOpencodeZenProviderConfig(cfg),
    OPENCODE_ZEN_DEFAULT_MODEL_REF,
  );
}
