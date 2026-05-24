// Private runtime barrel for the bundled Voice Call extension.
// Keep this barrel thin and aligned with the local extension surface.

export { definePluginEntry } from "recall/plugin-sdk/plugin-entry";
export type { RecallPluginApi } from "recall/plugin-sdk/plugin-entry";
export type { GatewayRequestHandlerOptions } from "recall/plugin-sdk/gateway-runtime";
export {
  isRequestBodyLimitError,
  readRequestBodyWithLimit,
  requestBodyErrorToText,
} from "recall/plugin-sdk/webhook-request-guards";
export { fetchWithSsrFGuard, isBlockedHostnameOrIp } from "recall/plugin-sdk/ssrf-runtime";
export type { SessionEntry } from "recall/plugin-sdk/session-store-runtime";
export {
  TtsAutoSchema,
  TtsConfigSchema,
  TtsModeSchema,
  TtsProviderSchema,
} from "recall/plugin-sdk/tts-runtime";
export { sleep } from "recall/plugin-sdk/runtime-env";
