// Provider-index loader normalizes bundled installable-provider metadata and falls back to an empty index.
import { normalizeSteelEngineProviderIndex } from "./normalize.js";
import { STEELENGINE_PROVIDER_INDEX } from "./steelengine-provider-index.js";
import type { SteelEngineProviderIndex } from "./types.js";

// Load the bundled provider index through the normalizer. Invalid generated or
// caller-supplied data falls back to an empty v1 index instead of leaking shape.
export function loadSteelEngineProviderIndex(
  source: unknown = STEELENGINE_PROVIDER_INDEX,
): SteelEngineProviderIndex {
  return normalizeSteelEngineProviderIndex(source) ?? { version: 1, providers: {} };
}
