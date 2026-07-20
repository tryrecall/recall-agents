// Whatsapp plugin module implements channel actions behavior.
import { createActionGate } from "steelengine/plugin-sdk/channel-actions";
import type { ChannelMessageActionName } from "steelengine/plugin-sdk/channel-contract";
import type { SteelEngineConfig } from "steelengine/plugin-sdk/config-contracts";

export { listWhatsAppAccountIds, resolveWhatsAppAccount } from "./accounts.js";
export { resolveWhatsAppReactionLevel } from "./reaction-level.js";
export { createActionGate, type ChannelMessageActionName, type SteelEngineConfig };
