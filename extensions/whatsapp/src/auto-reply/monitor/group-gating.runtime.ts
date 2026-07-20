// Whatsapp plugin module implements group gating behavior.
export {
  implicitMentionKindWhen,
  resolveInboundMentionDecision,
} from "steelengine/plugin-sdk/channel-mention-gating";
export { hasControlCommand } from "steelengine/plugin-sdk/command-detection";
export { createChannelHistoryWindow } from "steelengine/plugin-sdk/reply-history";
export { parseActivationCommand } from "steelengine/plugin-sdk/group-activation";
export { normalizeE164 } from "../../text-runtime.js";
