// Qqbot API module exposes the plugin public contract.
export type { ChannelPlugin, SteelEnginePluginApi, PluginRuntime } from "steelengine/plugin-sdk/core";
export type { SteelEngineConfig } from "steelengine/plugin-sdk/config-contracts";
export type {
  SteelEnginePluginService,
  SteelEnginePluginServiceContext,
  PluginLogger,
} from "steelengine/plugin-sdk/core";
export type { ResolvedQQBotAccount, QQBotAccountConfig } from "./src/types.js";
export { getQQBotRuntime, setQQBotRuntime } from "./src/bridge/runtime.js";
