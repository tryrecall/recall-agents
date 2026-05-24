// Private runtime barrel for the bundled Nostr extension.
// Keep this barrel thin and aligned with the local extension surface.

export type { RecallConfig } from "recall/plugin-sdk/config-contracts";
export { getPluginRuntimeGatewayRequestScope } from "recall/plugin-sdk/plugin-runtime";
export type { PluginRuntime } from "recall/plugin-sdk/runtime-store";
