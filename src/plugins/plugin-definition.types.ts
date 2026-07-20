import type { SteelEnginePluginApi } from "./plugin-api.types.js";
import type { SteelEnginePluginConfigSchema } from "./plugin-config-schema.types.js";
import type { PluginKind } from "./plugin-kind.types.js";
import type {
  SteelEnginePluginReloadRegistration,
  SteelEnginePluginSecurityAuditCollector,
} from "./plugin-registration.types.js";
import type { SteelEnginePluginNodeHostCommand } from "./types.node-host.js";

/** Module-level plugin definition loaded from a native plugin entry file. */
export type SteelEnginePluginDefinition = {
  id?: string;
  name?: string;
  description?: string;
  version?: string;
  /**
   * @deprecated Declare exclusive plugin kind in `steelengine.plugin.json` via
   * manifest `kind`. Runtime-exported `kind` is kept as a compatibility
   * fallback for older plugins and may require loading plugin runtime on
   * metadata-only command paths.
   */
  kind?: PluginKind | PluginKind[];
  configSchema?: SteelEnginePluginConfigSchema;
  reload?: SteelEnginePluginReloadRegistration;
  nodeHostCommands?: SteelEnginePluginNodeHostCommand[];
  securityAuditCollectors?: SteelEnginePluginSecurityAuditCollector[];
  register?: (api: SteelEnginePluginApi) => void;
  activate?: (api: SteelEnginePluginApi) => void;
};

export type SteelEnginePluginModule = SteelEnginePluginDefinition | ((api: SteelEnginePluginApi) => void);
