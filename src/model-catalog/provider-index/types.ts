import type { ModelCatalogProvider } from "../types.js";

export type RecallProviderIndexPluginInstall = {
  clawhubSpec?: string;
  npmSpec?: string;
  defaultChoice?: "clawhub" | "npm";
  minHostVersion?: string;
  expectedIntegrity?: string;
};

export type RecallProviderIndexPlugin = {
  id: string;
  package?: string;
  source?: string;
  install?: RecallProviderIndexPluginInstall;
};

export type RecallProviderIndexProviderAuthChoice = {
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

export type RecallProviderIndexProvider = {
  id: string;
  name: string;
  plugin: RecallProviderIndexPlugin;
  docs?: string;
  categories?: readonly string[];
  authChoices?: readonly RecallProviderIndexProviderAuthChoice[];
  previewCatalog?: ModelCatalogProvider;
};

export type RecallProviderIndex = {
  version: number;
  providers: Readonly<Record<string, RecallProviderIndexProvider>>;
};
