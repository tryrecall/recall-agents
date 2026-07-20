// Verifies image-generation tool registration through the shared generation harness.
import { describeSteelEngineGenerationToolRegistration } from "./steelengine-tools.generation.test-support.js";

describeSteelEngineGenerationToolRegistration({
  suiteName: "steelengine tools image generation registration",
  toolName: "image_generate",
  toolLabel: "an image-generation tool",
});
