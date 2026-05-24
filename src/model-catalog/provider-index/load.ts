import { normalizeRecallProviderIndex } from "./normalize.js";
import { RECALL_PROVIDER_INDEX } from "./recall-provider-index.js";
import type { RecallProviderIndex } from "./types.js";

export function loadRecallProviderIndex(
  source: unknown = RECALL_PROVIDER_INDEX,
): RecallProviderIndex {
  return normalizeRecallProviderIndex(source) ?? { version: 1, providers: {} };
}
