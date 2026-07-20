// Whatsapp plugin entrypoint registers its SteelEngine integration.
import {
  defineBundledChannelEntry,
  loadBundledEntryExportSync,
} from "steelengine/plugin-sdk/channel-entry-contract";
import type { SteelEnginePluginApi } from "steelengine/plugin-sdk/channel-entry-contract";

function registerWhatsAppCallTool(api: SteelEnginePluginApi): void {
  const registerTool = loadBundledEntryExportSync<(api: SteelEnginePluginApi) => void>(
    import.meta.url,
    {
      specifier: "./call-tool-api.js",
      exportName: "registerWhatsAppCallTool",
    },
  );
  registerTool(api);
}

export default defineBundledChannelEntry({
  id: "whatsapp",
  name: "WhatsApp",
  description: "WhatsApp channel plugin",
  importMetaUrl: import.meta.url,
  plugin: {
    specifier: "./channel-plugin-api.js",
    exportName: "whatsappPlugin",
  },
  runtime: {
    specifier: "./runtime-setter-api.js",
    exportName: "setWhatsAppRuntime",
  },
  registerFull: registerWhatsAppCallTool,
});
