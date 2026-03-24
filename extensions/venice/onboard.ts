import {
  buildVeniceModelDefinition,
  VENICE_BASE_URL,
  VENICE_DEFAULT_MODEL_REF,
  VENICE_MODEL_CATALOG,
} from "recall/plugin-sdk/provider-models";
import {
  createModelCatalogPresetAppliers,
  type RecallConfig,
} from "recall/plugin-sdk/provider-onboard";

export { VENICE_DEFAULT_MODEL_REF };

const venicePresetAppliers = createModelCatalogPresetAppliers({
  primaryModelRef: VENICE_DEFAULT_MODEL_REF,
  resolveParams: (_cfg: RecallConfig) => ({
    providerId: "venice",
    api: "openai-completions",
    baseUrl: VENICE_BASE_URL,
    catalogModels: VENICE_MODEL_CATALOG.map(buildVeniceModelDefinition),
    aliases: [{ modelRef: VENICE_DEFAULT_MODEL_REF, alias: "Kimi K2.5" }],
  }),
});

export function applyVeniceProviderConfig(cfg: RecallConfig): RecallConfig {
  return venicePresetAppliers.applyProviderConfig(cfg);
}

export function applyVeniceConfig(cfg: RecallConfig): RecallConfig {
  return venicePresetAppliers.applyConfig(cfg);
}
