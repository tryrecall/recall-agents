// Irc API module exposes the plugin public contract.
export { createAccountStatusSink } from "steelengine/plugin-sdk/channel-outbound";
export { DEFAULT_ACCOUNT_ID } from "steelengine/plugin-sdk/account-id";
export type { ChannelPlugin } from "steelengine/plugin-sdk/channel-core";
export { PAIRING_APPROVED_MESSAGE } from "steelengine/plugin-sdk/channel-status";
export { buildBaseChannelStatusSummary } from "steelengine/plugin-sdk/status-helpers";
export { chunkTextForOutbound } from "steelengine/plugin-sdk/text-chunking";
