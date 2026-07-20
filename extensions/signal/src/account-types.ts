// Signal plugin module implements account types behavior.
import type { SteelEngineConfig } from "steelengine/plugin-sdk/config-contracts";

export type SignalAccountConfig = Omit<
  Exclude<NonNullable<SteelEngineConfig["channels"]>["signal"], undefined>,
  "accounts"
>;
