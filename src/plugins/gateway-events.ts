import type { PluginJsonValue } from "./host-hook-json.js";

export type SteelEnginePluginGatewayEventScope = "operator.read" | "operator.write" | "operator.admin";

export type SteelEnginePluginGatewayEvents = {
  emit: (
    event: string,
    payload: PluginJsonValue,
    opts: { scope: SteelEnginePluginGatewayEventScope },
  ) => void;
};
