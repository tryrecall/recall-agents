import { resolveActiveTalkProviderConfig } from "../../config/talk.js";
import type { RecallConfig } from "../../config/types.js";

export { resolveActiveTalkProviderConfig };

export function getRuntimeConfigSnapshot(): RecallConfig | null {
  return null;
}
