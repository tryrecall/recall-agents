// Diagnostics Otel API module exposes the plugin public contract.
export {
  createChildDiagnosticTraceContext,
  createDiagnosticTraceContext,
  emitDiagnosticEvent,
  formatDiagnosticTraceparent,
  isValidDiagnosticSpanId,
  isValidDiagnosticTraceFlags,
  isValidDiagnosticTraceId,
  onDiagnosticEvent,
  parseDiagnosticTraceparent,
  type DiagnosticEventMetadata,
  type DiagnosticEventPayload,
  type DiagnosticEventPrivateData,
  type DiagnosticTraceContext,
} from "steelengine/plugin-sdk/diagnostic-runtime";
export { emptyPluginConfigSchema, type SteelEnginePluginApi } from "steelengine/plugin-sdk/plugin-entry";
export type {
  SteelEnginePluginService,
  SteelEnginePluginServiceContext,
} from "steelengine/plugin-sdk/plugin-entry";
export { redactSensitiveText } from "steelengine/plugin-sdk/security-runtime";
