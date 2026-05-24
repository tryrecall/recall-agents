const COMMON_LIVE_ENV_NAMES = [
  "RECALL_AGENT_RUNTIME",
  "RECALL_CONFIG_PATH",
  "RECALL_GATEWAY_TOKEN",
  "OPENAI_API_KEY",
  "OPENAI_BASE_URL",
  "RECALL_SKIP_BROWSER_CONTROL_SERVER",
  "RECALL_SKIP_CANVAS_HOST",
  "RECALL_SKIP_CHANNELS",
  "RECALL_SKIP_CRON",
  "RECALL_SKIP_GMAIL_WATCHER",
  "RECALL_STATE_DIR",
] as const;

export type LiveEnvSnapshot = Record<string, string | undefined>;

export function snapshotLiveEnv(extraNames: readonly string[] = []): LiveEnvSnapshot {
  const snapshot: LiveEnvSnapshot = {};
  for (const name of [...COMMON_LIVE_ENV_NAMES, ...extraNames]) {
    snapshot[name] = process.env[name];
  }
  return snapshot;
}

export function restoreLiveEnv(snapshot: LiveEnvSnapshot): void {
  for (const [name, value] of Object.entries(snapshot)) {
    if (value === undefined) {
      delete process.env[name];
    } else {
      process.env[name] = value;
    }
  }
}
