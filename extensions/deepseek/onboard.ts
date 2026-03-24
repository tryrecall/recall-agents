import {
  buildDeepSeekModelDefinition,
  DEEPSEEK_BASE_URL,
  DEEPSEEK_MODEL_CATALOG,
} from "recall/plugin-sdk/provider-models";
import {
  applyAgentDefaultModelPrimary,
  applyProviderConfigWithModelCatalog,
  type RecallConfig,
} from "recall/plugin-sdk/provider-onboard";

export const DEEPSEEK_DEFAULT_MODEL_REF = "deepseek/deepseek-chat";

export function applyDeepSeekProviderConfig(cfg: RecallConfig): RecallConfig {
  const models = { ...cfg.agents?.defaults?.models };
  models[DEEPSEEK_DEFAULT_MODEL_REF] = {
    ...models[DEEPSEEK_DEFAULT_MODEL_REF],
    alias: models[DEEPSEEK_DEFAULT_MODEL_REF]?.alias ?? "DeepSeek",
  };

  return applyProviderConfigWithModelCatalog(cfg, {
    agentModels: models,
    providerId: "deepseek",
    api: "openai-completions",
    baseUrl: DEEPSEEK_BASE_URL,
    catalogModels: DEEPSEEK_MODEL_CATALOG.map(buildDeepSeekModelDefinition),
  });
}

export function applyDeepSeekConfig(cfg: RecallConfig): RecallConfig {
  return applyAgentDefaultModelPrimary(
    applyDeepSeekProviderConfig(cfg),
    DEEPSEEK_DEFAULT_MODEL_REF,
  );
}
