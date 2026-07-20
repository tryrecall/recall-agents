// Provider-index types describe install hints, auth choices, and preview catalogs for discoverable providers.
import type { ModelCatalogProvider } from "@steelengine/model-catalog-core/model-catalog-types";

// Normalized provider-index schema. It describes providers discoverable before
// plugin install, including install hints, auth choices, and preview catalogs.
export type SteelEngineProviderIndexPluginInstall = {
  clawhubSpec?: string;
  npmSpec?: string;
  defaultChoice?: "clawhub" | "npm";
  minHostVersion?: string;
  expectedIntegrity?: string;
};

export type SteelEngineProviderIndexPlugin = {
  id: string;
  package?: string;
  source?: string;
  install?: SteelEngineProviderIndexPluginInstall;
};

export type SteelEngineProviderIndexProviderAuthChoice = {
  method: string;
  choiceId: string;
  choiceLabel: string;
  choiceHint?: string;
  assistantPriority?: number;
  assistantVisibility?: "visible" | "manual-only";
  groupId?: string;
  groupLabel?: string;
  groupHint?: string;
  optionKey?: string;
  cliFlag?: string;
  cliOption?: string;
  cliDescription?: string;
  onboardingScopes?: readonly ("text-inference" | "image-generation" | "music-generation")[];
};

export type SteelEngineProviderIndexProvider = {
  id: string;
  name: string;
  plugin: SteelEngineProviderIndexPlugin;
  docs?: string;
  categories?: readonly string[];
  authChoices?: readonly SteelEngineProviderIndexProviderAuthChoice[];
  previewCatalog?: ModelCatalogProvider;
};

export type SteelEngineProviderIndex = {
  version: number;
  providers: Readonly<Record<string, SteelEngineProviderIndexProvider>>;
};
