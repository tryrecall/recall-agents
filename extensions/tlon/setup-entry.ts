import { defineSetupPluginEntry } from "recall/plugin-sdk/core";
import { tlonPlugin } from "./src/channel.js";

export default defineSetupPluginEntry(tlonPlugin);
