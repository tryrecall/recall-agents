import { buildManifestModelProviderConfig } from "recall/plugin-sdk/provider-catalog-shared";
import type { ModelProviderConfig } from "recall/plugin-sdk/provider-model-shared";
import manifest from "./recall.plugin.json" with { type: "json" };

export function buildMistralProvider(): ModelProviderConfig {
  return buildManifestModelProviderConfig({
    providerId: "mistral",
    catalog: manifest.modelCatalog.providers.mistral,
  });
}
