// Diagnostics Otel plugin entrypoint registers its SteelEngine integration.
import { definePluginEntry } from "steelengine/plugin-sdk/plugin-entry";
import { createDiagnosticsOtelService } from "./runtime-api.js";

export default definePluginEntry({
  id: "diagnostics-otel",
  name: "Diagnostics OpenTelemetry",
  description: "Export diagnostics events to OpenTelemetry",
  register(api) {
    api.registerService(createDiagnosticsOtelService());
  },
});
