/** ACP runtime error exports wired to SteelEngine secret redaction. */
import { configureAcpErrorRedactor } from "@steelengine/acp-core";
import { redactSensitiveText } from "../../logging/redact.js";

// Ensure ACP-core runtime errors use SteelEngine's secret redaction before re-export.
configureAcpErrorRedactor(redactSensitiveText);

export * from "@steelengine/acp-core/runtime/errors";
