import { defineSetupPluginEntry } from "recall/plugin-sdk/core";
import { nostrPlugin } from "./src/channel.js";

export default defineSetupPluginEntry(nostrPlugin);
