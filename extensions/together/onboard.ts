import {
  buildTogetherModelDefinition,
  TOGETHER_BASE_URL,
  TOGETHER_MODEL_CATALOG,
} from "recall/plugin-sdk/provider-models";
import {
  createModelCatalogPresetAppliers,
  type RecallConfig,
} from "recall/plugin-sdk/provider-onboard";

export const TOGETHER_DEFAULT_MODEL_REF = "together/moonshotai/Kimi-K2.5";

const togetherPresetAppliers = createModelCatalogPresetAppliers({
  primaryModelRef: TOGETHER_DEFAULT_MODEL_REF,
  resolveParams: (_cfg: RecallConfig) => ({
    providerId: "together",
    api: "openai-completions",
    baseUrl: TOGETHER_BASE_URL,
    catalogModels: TOGETHER_MODEL_CATALOG.map(buildTogetherModelDefinition),
    aliases: [{ modelRef: TOGETHER_DEFAULT_MODEL_REF, alias: "Together AI" }],
  }),
});

export function applyTogetherProviderConfig(cfg: RecallConfig): RecallConfig {
  return togetherPresetAppliers.applyProviderConfig(cfg);
}

export function applyTogetherConfig(cfg: RecallConfig): RecallConfig {
  return togetherPresetAppliers.applyConfig(cfg);
}
