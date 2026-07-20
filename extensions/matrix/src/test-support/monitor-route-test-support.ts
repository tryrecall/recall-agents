// Matrix plugin module implements monitor route test support behavior.
export {
  registerSessionBindingAdapter,
  testing,
} from "steelengine/plugin-sdk/session-binding-runtime";
export { resolveAgentRoute } from "steelengine/plugin-sdk/routing";
export {
  createTestRegistry,
  setActivePluginRegistry,
} from "steelengine/plugin-sdk/plugin-test-runtime";
export type { SteelEngineConfig } from "steelengine/plugin-sdk/config-contracts";
