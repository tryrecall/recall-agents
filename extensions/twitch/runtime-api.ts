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
} from "steelengine/plugin-sdk/channel-contract";
export type { ChannelPlugin } from "steelengine/plugin-sdk/channel-core";
export type { OutboundDeliveryResult } from "steelengine/plugin-sdk/channel-send-result";
export type { SteelEngineConfig } from "steelengine/plugin-sdk/config-contracts";
export type { RuntimeEnv } from "steelengine/plugin-sdk/runtime";
export type { WizardPrompter } from "steelengine/plugin-sdk/setup";
