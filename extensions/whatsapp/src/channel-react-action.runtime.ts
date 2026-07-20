// Whatsapp plugin module implements channel react action behavior.
import { readStringOrNumberParam, readStringParam } from "steelengine/plugin-sdk/channel-actions";
import type { SteelEngineConfig } from "steelengine/plugin-sdk/config-contracts";

export { resolveReactionMessageId } from "steelengine/plugin-sdk/channel-actions";
export { handleWhatsAppAction } from "./action-runtime.js";
export { resolveAuthorizedWhatsAppOutboundTarget } from "./action-runtime-target-auth.js";
export { resolveWhatsAppAccount, resolveWhatsAppMediaMaxBytes } from "./accounts.js";
export { isWhatsAppGroupJid, normalizeWhatsAppTarget } from "./normalize.js";
export { sendMessageWhatsApp } from "./send.js";
export { readStringOrNumberParam, readStringParam, type SteelEngineConfig };
