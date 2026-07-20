// Verifies video-generation tool registration through the shared generation harness.
import { describeSteelEngineGenerationToolRegistration } from "./steelengine-tools.generation.test-support.js";

describeSteelEngineGenerationToolRegistration({
  suiteName: "steelengine tools video generation registration",
  toolName: "video_generate",
  toolLabel: "a video-generation tool",
});
