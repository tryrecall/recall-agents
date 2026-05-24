import type { RecallConfig } from "recall/plugin-sdk/config-contracts";
import type { CommandArgValues } from "recall/plugin-sdk/native-command-registry";

export type DiscordConfig = NonNullable<RecallConfig["channels"]>["discord"];

export type DiscordCommandArgs = {
  raw?: string;
  values?: CommandArgValues;
};
