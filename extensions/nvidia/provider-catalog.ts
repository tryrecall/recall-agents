import { buildManifestModelProviderConfig } from "recall/plugin-sdk/provider-catalog-shared";
import type { ModelProviderConfig } from "recall/plugin-sdk/provider-model-shared";
import manifest from "./recall.plugin.json" with { type: "json" };

export const NVIDIA_DEFAULT_MODEL_ID = "nvidia/nemotron-3-super-120b-a12b";

export function buildNvidiaProvider(): ModelProviderConfig {
  return {
    ...buildManifestModelProviderConfig({
      providerId: "nvidia",
      catalog: manifest.modelCatalog.providers.nvidia,
    }),
    apiKey: "NVIDIA_API_KEY",
  };
}
