import { collectConfigRuntimeEnvVars } from "./env-vars.js";
import type { SteelEngineConfig } from "./types.js";

export const GATEWAY_CONFIG_SELECTION_ENV_KEYS: ReadonlySet<string> = new Set([
  "ANDROID_DATA",
  "HOME",
  "HOMEDRIVE",
  "HOMEPATH",
  "STEELENGINE_AGENT_DIR",
  "STEELENGINE_CONFIG_PATH",
  "STEELENGINE_HOME",
  "STEELENGINE_INCLUDE_ROOTS",
  "STEELENGINE_NIX_MODE",
  "STEELENGINE_OAUTH_DIR",
  "STEELENGINE_PACKAGE_DIR",
  "STEELENGINE_PROFILE",
  "STEELENGINE_STATE_DIR",
  "STEELENGINE_TEST_FAST",
  "STEELENGINE_WORKSPACE_DIR",
  "PI_CODING_AGENT_DIR",
  "PREFIX",
  "USERPROFILE",
]);

/** Rejects config.env changes that would retarget a running Gateway process. */
export function assertGatewayConfigEnvSelectionUnchanged(
  previousConfig: SteelEngineConfig,
  nextConfig: SteelEngineConfig,
): void {
  const normalize = (config: SteelEngineConfig) =>
    new Map(
      Object.entries(collectConfigRuntimeEnvVars(config)).map(([key, value]) => [
        key.toUpperCase(),
        value,
      ]),
    );
  const previous = normalize(previousConfig);
  const next = normalize(nextConfig);
  for (const key of GATEWAY_CONFIG_SELECTION_ENV_KEYS) {
    if (previous.get(key) !== next.get(key)) {
      throw new Error(
        `Config env cannot change process-stable Gateway selector ${key} during reload. Restart with the target environment instead.`,
      );
    }
  }
}
