import type { RecallConfig } from "recall/plugin-sdk/config-contracts";
import type { ThreadBindingManager } from "./thread-bindings.js";

type DiscordConfig = NonNullable<RecallConfig["channels"]>["discord"];

export type DiscordCommandArgContext = {
  cfg: RecallConfig;
  discordConfig: DiscordConfig;
  accountId: string;
  sessionPrefix: string;
  threadBindings: ThreadBindingManager;
  postApplySettleMs?: number;
};

export type DiscordModelPickerContext = DiscordCommandArgContext;

export type SafeDiscordInteractionCall = <T>(
  label: string,
  fn: () => Promise<T>,
) => Promise<T | null>;
