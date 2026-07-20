// Slack API module exposes the plugin public contract.
export {
  buildComputedAccountStatusSnapshot,
  PAIRING_APPROVED_MESSAGE,
  projectCredentialSnapshotFields,
  resolveConfiguredFromRequiredCredentialStatuses,
} from "steelengine/plugin-sdk/channel-status";
export { buildChannelConfigSchema, SlackConfigSchema } from "../config-api.js";
export type { ChannelMessageActionContext } from "steelengine/plugin-sdk/channel-contract";
export { DEFAULT_ACCOUNT_ID } from "steelengine/plugin-sdk/account-id";
export type {
  ChannelPlugin,
  SteelEnginePluginApi,
  PluginRuntime,
} from "steelengine/plugin-sdk/channel-plugin-common";
export type { SteelEngineConfig } from "steelengine/plugin-sdk/config-contracts";
export type { SlackAccountConfig } from "steelengine/plugin-sdk/config-contracts";
export {
  emptyPluginConfigSchema,
  formatPairingApproveHint,
} from "steelengine/plugin-sdk/channel-plugin-common";
export { loadOutboundMediaFromUrl } from "steelengine/plugin-sdk/outbound-media";
export { looksLikeSlackTargetId, normalizeSlackMessagingTarget } from "./target-parsing.js";
export { getChatChannelMeta } from "./channel-api.js";
export {
  createActionGate,
  imageResultFromFile,
  jsonResult,
  readNumberParam,
  readPositiveIntegerParam,
  readReactionParams,
  readStringParam,
  withNormalizedTimestamp,
} from "steelengine/plugin-sdk/channel-actions";
