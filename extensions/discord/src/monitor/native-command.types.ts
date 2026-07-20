// Discord type declarations define plugin contracts.
import type { SteelEngineConfig } from "steelengine/plugin-sdk/config-contracts";
import type { CommandArgValues } from "steelengine/plugin-sdk/native-command-registry";

export type DiscordConfig = NonNullable<SteelEngineConfig["channels"]>["discord"];

export type DiscordCommandArgs = {
  raw?: string;
  values?: CommandArgValues;
};
