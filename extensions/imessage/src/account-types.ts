// Imessage plugin module implements account types behavior.
import type { SteelEngineConfig } from "steelengine/plugin-sdk/config-contracts";

export type IMessageAccountConfig = Omit<
  NonNullable<NonNullable<SteelEngineConfig["channels"]>["imessage"]>,
  "accounts" | "defaultAccount"
>;
