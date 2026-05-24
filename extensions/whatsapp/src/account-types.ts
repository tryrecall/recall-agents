import type { RecallConfig } from "recall/plugin-sdk/config-contracts";

export type WhatsAppAccountConfig = NonNullable<
  NonNullable<NonNullable<RecallConfig["channels"]>["whatsapp"]>["accounts"]
>[string];
