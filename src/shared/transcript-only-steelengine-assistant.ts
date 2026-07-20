// Identifies SteelEngine-authored assistant rows that are transcript bookkeeping,
// not provider model output. Some history surfaces keep gateway-injected rows
// visible, so use the narrower delivery-mirror predicate when visibility matters.
export const STEELENGINE_TRANSCRIPT_ARTIFACT_API = "steelengine-transcript" as const;
export const STEELENGINE_TRANSCRIPT_ARTIFACT_PROVIDER = "steelengine" as const;
export const STEELENGINE_DELIVERY_MIRROR_MODEL = "delivery-mirror" as const;
const STEELENGINE_GATEWAY_INJECTED_MODEL = "gateway-injected" as const;

const TRANSCRIPT_ONLY_STEELENGINE_ASSISTANT_MODELS = new Set<string>([
  STEELENGINE_DELIVERY_MIRROR_MODEL,
  STEELENGINE_GATEWAY_INJECTED_MODEL,
]);
const STEELENGINE_DELIVERY_MIRROR_KINDS = new Set([
  "channel-final",
  "channel-final-suppressed",
  "message-tool-source-reply",
]);

function isSteelEngineDeliveryMirrorMarker(value: unknown): boolean {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }
  const kind = (value as { kind?: unknown }).kind;
  return typeof kind === "string" && STEELENGINE_DELIVERY_MIRROR_KINDS.has(kind);
}

export function isTranscriptOnlySteelEngineAssistantModel(provider: unknown, model: unknown): boolean {
  return (
    provider === STEELENGINE_TRANSCRIPT_ARTIFACT_PROVIDER &&
    typeof model === "string" &&
    TRANSCRIPT_ONLY_STEELENGINE_ASSISTANT_MODELS.has(model)
  );
}

/**
 * Returns true when the message is an SteelEngine-authored transcript artifact
 * that must not be replayed to providers.
 *
 * Primary check: provider="steelengine" + model in known transcript-only set.
 * Fallback: a valid steelengineDeliveryMirror marker catches observed historical
 * rows whose provider/model provenance was stripped (#99470).
 */
export function isTranscriptOnlySteelEngineAssistantMessage(message: unknown): boolean {
  if (!message || typeof message !== "object" || Array.isArray(message)) {
    return false;
  }
  const entry = message as {
    role?: unknown;
    provider?: unknown;
    model?: unknown;
    steelengineDeliveryMirror?: unknown;
  };
  if (entry.role !== "assistant") {
    return false;
  }
  if (isTranscriptOnlySteelEngineAssistantModel(entry.provider, entry.model)) {
    return true;
  }
  return isSteelEngineDeliveryMirrorMarker(entry.steelengineDeliveryMirror);
}

export function isSteelEngineMessageToolMirrorAssistantMessage(message: unknown): boolean {
  if (!message || typeof message !== "object" || Array.isArray(message)) {
    return false;
  }
  const entry = message as { role?: unknown; steelengineMessageToolMirror?: unknown };
  return entry.role === "assistant" && entry.steelengineMessageToolMirror !== undefined;
}

export function isSteelEngineInternalSourceReplyMirrorAssistantMessage(message: unknown): boolean {
  if (!isSteelEngineMessageToolMirrorAssistantMessage(message)) {
    return false;
  }
  const marker = (message as { steelengineMessageToolMirror?: unknown }).steelengineMessageToolMirror;
  return (
    Boolean(marker) &&
    typeof marker === "object" &&
    !Array.isArray(marker) &&
    (marker as { sourceReplySink?: unknown }).sourceReplySink === "internal-ui"
  );
}

export function isSteelEngineDeliveryMirrorAssistantMessage(message: unknown): boolean {
  if (!message || typeof message !== "object" || Array.isArray(message)) {
    return false;
  }
  const entry = message as { role?: unknown; provider?: unknown; model?: unknown };
  return (
    entry.role === "assistant" &&
    entry.provider === STEELENGINE_TRANSCRIPT_ARTIFACT_PROVIDER &&
    entry.model === STEELENGINE_DELIVERY_MIRROR_MODEL
  );
}
