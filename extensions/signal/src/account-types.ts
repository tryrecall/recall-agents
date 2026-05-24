import type { RecallConfig } from "recall/plugin-sdk/config-contracts";

export type SignalAccountConfig = Omit<
  Exclude<NonNullable<RecallConfig["channels"]>["signal"], undefined>,
  "accounts"
>;
