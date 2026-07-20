// Whatsapp plugin module implements account types behavior.
import type { SteelEngineConfig } from "steelengine/plugin-sdk/config-contracts";

export type WhatsAppAccountConfig = NonNullable<
  NonNullable<NonNullable<SteelEngineConfig["channels"]>["whatsapp"]>["accounts"]
>[string];
