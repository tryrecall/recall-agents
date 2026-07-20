// Mattermost API module exposes the plugin public contract.
export { createAccountStatusSink } from "steelengine/plugin-sdk/channel-outbound";
export type { ChannelPlugin } from "steelengine/plugin-sdk/core";
export { DEFAULT_ACCOUNT_ID } from "steelengine/plugin-sdk/core";
export { chunkTextForOutbound } from "steelengine/plugin-sdk/text-chunking";
