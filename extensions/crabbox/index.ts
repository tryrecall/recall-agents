import { definePluginEntry } from "steelengine/plugin-sdk/plugin-entry";
import { createCrabboxWorkerProvider, resolveSteelEngineRoot } from "./src/crabbox-worker-provider.js";

export default definePluginEntry({
  id: "crabbox",
  name: "Crabbox Worker Provider",
  description: "Cloud worker provider backed by the Crabbox CLI",
  register(api) {
    api.registerWorkerProvider(
      createCrabboxWorkerProvider({ steelengineRoot: resolveSteelEngineRoot(api.rootDir) }),
    );
  },
});
