/** Process env key that marks child commands as launched by the SteelEngine CLI. */
export const STEELENGINE_CLI_ENV_VAR = "STEELENGINE_CLI";

/** Stable marker value used for SteelEngine-launched subprocess detection. */
const STEELENGINE_CLI_ENV_VALUE = "1";

/** Returns a cloned env object with the SteelEngine CLI marker set. */
export function markSteelEngineExecEnv<T extends Record<string, string | undefined>>(
  /** Source environment to clone before adding the subprocess marker. */
  env: T,
): T {
  return {
    ...env,
    [STEELENGINE_CLI_ENV_VAR]: STEELENGINE_CLI_ENV_VALUE,
  };
}

/** Mutates an existing process env object so current-process children inherit the marker. */
export function ensureSteelEngineExecMarkerOnProcess(
  /** Process env object to mutate; defaults to the current process environment. */
  env: NodeJS.ProcessEnv = process.env,
): NodeJS.ProcessEnv {
  env[STEELENGINE_CLI_ENV_VAR] = STEELENGINE_CLI_ENV_VALUE;
  return env;
}
