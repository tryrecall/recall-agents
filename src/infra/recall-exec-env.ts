export const RECALL_CLI_ENV_VAR = "RECALL_CLI";
export const RECALL_CLI_ENV_VALUE = "1";

export function markRecallExecEnv<T extends Record<string, string | undefined>>(env: T): T {
  return {
    ...env,
    [RECALL_CLI_ENV_VAR]: RECALL_CLI_ENV_VALUE,
  };
}

export function ensureRecallExecMarkerOnProcess(
  env: NodeJS.ProcessEnv = process.env,
): NodeJS.ProcessEnv {
  env[RECALL_CLI_ENV_VAR] = RECALL_CLI_ENV_VALUE;
  return env;
}
