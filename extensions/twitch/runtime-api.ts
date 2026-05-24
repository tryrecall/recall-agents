// Private runtime barrel for the bundled Twitch extension.
// Keep this barrel thin and aligned with the local extension surface.

export type {
  ChannelAccountSnapshot,
  ChannelCapabilities,
  ChannelGatewayContext,
  ChannelLogSink,
  ChannelMessageActionAdapter,
  ChannelMessageActionContext,
  ChannelMeta,
  ChannelOutboundAdapter,
  ChannelOutboundContext,
  ChannelResolveKind,
  ChannelResolveResult,
  ChannelStatusAdapter,
} from "recall/plugin-sdk/channel-contract";
export type { ChannelPlugin } from "recall/plugin-sdk/channel-core";
export type { OutboundDeliveryResult } from "recall/plugin-sdk/channel-send-result";
export type { RecallConfig } from "recall/plugin-sdk/config-contracts";
export type { RuntimeEnv } from "recall/plugin-sdk/runtime";
export type { WizardPrompter } from "recall/plugin-sdk/setup";
