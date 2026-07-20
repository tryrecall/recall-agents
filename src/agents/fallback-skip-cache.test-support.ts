type FallbackSkipCacheState = {
  buckets: Map<string, Map<string, unknown>>;
  lastGlobalPruneAtMs: number;
};

function getFallbackSkipCacheGlobals() {
  return globalThis as typeof globalThis & {
    steelengineFallbackSkipCache?: Map<string, Map<string, unknown>>;
    steelengineFallbackSkipCacheState?: FallbackSkipCacheState;
  };
}

export function resetFallbackSkipCacheForTest(): void {
  const globals = getFallbackSkipCacheGlobals();
  globals.steelengineFallbackSkipCache?.clear();
  globals.steelengineFallbackSkipCacheState?.buckets.clear();
  if (globals.steelengineFallbackSkipCacheState) {
    globals.steelengineFallbackSkipCacheState.lastGlobalPruneAtMs = 0;
  }
}

export function listFallbackSkipCacheSessionIdsForTest(): string[] {
  const globals = getFallbackSkipCacheGlobals();
  return [...(globals.steelengineFallbackSkipCacheState?.buckets.keys() ?? [])];
}
