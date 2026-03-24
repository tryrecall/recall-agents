import { definePluginEntry } from "recall/plugin-sdk/plugin-entry";
import { buildElevenLabsSpeechProvider } from "./speech-provider.js";

export default definePluginEntry({
  id: "elevenlabs",
  name: "ElevenLabs Speech",
  description: "Bundled ElevenLabs speech provider",
  register(api) {
    api.registerSpeechProvider(buildElevenLabsSpeechProvider());
  },
});
