// Packed Plugin Sdk Type Smoke script supports SteelEngine repository automation.
type PublicPluginSdkModules = [
  typeof import("steelengine/plugin-sdk"),
  typeof import("steelengine/plugin-sdk/channel-entry-contract"),
  typeof import("steelengine/plugin-sdk/config-contracts"),
  typeof import("steelengine/plugin-sdk/provider-entry"),
  typeof import("steelengine/plugin-sdk/runtime-env"),
];

const resolvedModules = null as unknown as PublicPluginSdkModules;

void resolvedModules;
