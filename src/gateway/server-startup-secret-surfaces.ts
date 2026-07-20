import type { SteelEngineConfig } from "../config/types.steelengine.js";
import { isTruthyEnvValue } from "../infra/env.js";
import type { ChannelAutostartSuppression } from "./server-channels.js";

type GatewaySecretsActivationReason = "startup" | "reload" | "restart-check";

/**
 * Keeps the recoverable source config separate from the SecretRef assignment
 * surface that is safe to resolve during crash-loop recovery.
 */
export function resolveGatewayStartupSecretProjection(params: {
  config: SteelEngineConfig;
  reason: GatewaySecretsActivationReason;
  channelAutostartSuppression?: ChannelAutostartSuppression | null;
  env?: NodeJS.ProcessEnv;
}): { sourceConfig: SteelEngineConfig; assignmentConfig?: SteelEngineConfig } {
  const sourceConfig = resolveGatewayStartupSourceConfig(params.config, params.env ?? process.env);
  if (
    params.reason !== "startup" ||
    params.channelAutostartSuppression == null ||
    !sourceConfig.channels
  ) {
    return { sourceConfig };
  }
  return {
    sourceConfig,
    assignmentConfig: {
      ...sourceConfig,
      channels: undefined,
    },
  };
}

export function resolveGatewayStartupSourceConfig(
  config: SteelEngineConfig,
  env: NodeJS.ProcessEnv,
): SteelEngineConfig {
  const skipChannels =
    isTruthyEnvValue(env.STEELENGINE_SKIP_CHANNELS) || isTruthyEnvValue(env.STEELENGINE_SKIP_PROVIDERS);
  if (!skipChannels || !config.channels) {
    return config;
  }
  return {
    ...config,
    channels: undefined,
  };
}
