import { defineSetupPluginEntry } from "recall/plugin-sdk/core";
import { mattermostPlugin } from "./src/channel.js";

export default defineSetupPluginEntry(mattermostPlugin);
