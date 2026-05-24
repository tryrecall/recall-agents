import type { RecallConfig } from "recall/plugin-sdk/config-contracts";

export type IMessageAccountConfig = Omit<
  NonNullable<NonNullable<RecallConfig["channels"]>["imessage"]>,
  "accounts" | "defaultAccount"
>;
