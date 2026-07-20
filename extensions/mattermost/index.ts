// Mattermost plugin entrypoint registers its SteelEngine integration.
import {
  defineBundledChannelEntry,
  loadBundledEntryExportSync,
} from "steelengine/plugin-sdk/channel-entry-contract";
import type { SteelEnginePluginApi } from "steelengine/plugin-sdk/channel-entry-contract";

function registerSlashCommandRoute(api: SteelEnginePluginApi): void {
  const register = loadBundledEntryExportSync<(api: SteelEnginePluginApi) => void>(import.meta.url, {
    specifier: "./slash-route-api.js",
    exportName: "registerSlashCommandRoute",
  });
  register(api);
}

export default defineBundledChannelEntry({
  id: "mattermost",
  name: "Mattermost",
  description: "Mattermost channel plugin",
  importMetaUrl: import.meta.url,
  plugin: {
    specifier: "./channel-plugin-api.js",
    exportName: "mattermostPlugin",
  },
  secrets: {
    specifier: "./secret-contract-api.js",
    exportName: "channelSecrets",
  },
  runtime: {
    specifier: "./runtime-api.js",
    exportName: "setMattermostRuntime",
  },
  registerFull(api) {
    // Actual slash-command registration happens after the monitor connects and
    // knows the team id; the route itself can be wired here.
    registerSlashCommandRoute(api);
  },
});
