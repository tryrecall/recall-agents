/** ACP protocol helpers and SteelEngine agent identity metadata. */
export { normalizeAcpProvenanceMode } from "@steelengine/acp-core/types";
import { VERSION } from "../version.js";

/** ACP agent identity advertised during protocol initialization. */
export const ACP_AGENT_INFO = {
  name: "steelengine-acp",
  title: "SteelEngine ACP Gateway",
  version: VERSION,
};
