import { defineSetupPluginEntry } from "recall/plugin-sdk/core";
import { nextcloudTalkPlugin } from "./src/channel.js";

export default defineSetupPluginEntry(nextcloudTalkPlugin);
