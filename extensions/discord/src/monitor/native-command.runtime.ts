// Discord plugin module implements native command behavior.
import { resolveDirectStatusReplyForSession } from "steelengine/plugin-sdk/command-status-runtime";
import * as pluginRuntime from "steelengine/plugin-sdk/plugin-runtime";
import { dispatchReplyWithDispatcher } from "steelengine/plugin-sdk/reply-dispatch-runtime";
import { getSessionEntry } from "steelengine/plugin-sdk/session-store-runtime";
import { resolveDiscordNativeInteractionRouteState } from "./native-command-route.js";

export const nativeCommandRuntime = {
  matchPluginCommand: pluginRuntime.matchPluginCommand,
  executePluginCommand: pluginRuntime.executePluginCommand,
  dispatchReplyWithDispatcher,
  resolveDirectStatusReplyForSession,
  resolveDiscordNativeInteractionRouteState,
  getSessionEntry,
};
