// OC Path plugin entrypoint registers its SteelEngine integration.
import { definePluginEntry } from "steelengine/plugin-sdk/plugin-entry";
import { registerOcPathCli } from "./cli-registration.js";

export default definePluginEntry({
  id: "oc-path",
  name: "OC Path",
  description: "Adds the steelengine path CLI for oc:// workspace file addressing.",
  register(api) {
    registerOcPathCli(api);
  },
});
