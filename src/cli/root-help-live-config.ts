import type { RecallConfig } from "../config/types.recall.js";
import type { RootHelpRenderOptions } from "./program/root-help.js";

function hasEntries(value: object | undefined): boolean {
  return !!value && Object.keys(value).length > 0;
}

function hasListEntries(value: string[] | undefined): boolean {
  return Array.isArray(value) && value.length > 0;
}

export function hasPluginHelpAffectingConfig(config: RecallConfig | null | undefined): boolean {
  const plugins = config?.plugins;
  if (!plugins) {
    return false;
  }
  return (
    plugins.enabled === false ||
    hasListEntries(plugins.allow) ||
    hasListEntries(plugins.deny) ||
    plugins.bundledDiscovery !== undefined ||
    hasListEntries(plugins.load?.paths) ||
    hasEntries(plugins.slots) ||
    hasEntries(plugins.entries) ||
    hasEntries(plugins.installs)
  );
}

export function hasPluginHelpAffectingEnv(env: NodeJS.ProcessEnv): boolean {
  return Boolean(
    env.RECALL_BUNDLED_PLUGINS_DIR?.trim() || env.RECALL_DISABLE_BUNDLED_PLUGINS?.trim(),
  );
}

export async function loadRootHelpRenderOptionsForConfigSensitivePlugins(
  env: NodeJS.ProcessEnv = process.env,
): Promise<RootHelpRenderOptions | null> {
  const configModule = await import("../config/config.js");
  const snapshot = await configModule.readConfigFileSnapshot({
    observe: false,
    skipPluginValidation: true,
  });
  if (!snapshot.valid) {
    return null;
  }
  if (!hasPluginHelpAffectingEnv(env) && !hasPluginHelpAffectingConfig(snapshot.sourceConfig)) {
    return null;
  }
  return {
    config: snapshot.runtimeConfig,
    env,
  };
}
