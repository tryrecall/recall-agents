import type { RecallConfig } from "./types.recall.js";

export type OwnerDisplaySecretRuntimeState = {
  pendingByPath: Map<string, string>;
};

export function retainGeneratedOwnerDisplaySecret(params: {
  config: RecallConfig;
  configPath: string;
  generatedSecret?: string;
  state: OwnerDisplaySecretRuntimeState;
}): RecallConfig {
  const { config, configPath, generatedSecret, state } = params;
  if (!generatedSecret) {
    state.pendingByPath.delete(configPath);
    return config;
  }

  state.pendingByPath.set(configPath, generatedSecret);
  return config;
}
