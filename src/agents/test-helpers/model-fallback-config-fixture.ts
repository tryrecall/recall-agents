import type { RecallConfig } from "../../config/types.recall.js";

export function makeModelFallbackCfg(overrides: Partial<RecallConfig> = {}): RecallConfig {
  return {
    agents: {
      defaults: {
        model: {
          primary: "openai/gpt-4.1-mini",
          fallbacks: ["anthropic/claude-haiku-3-5"],
        },
      },
    },
    ...overrides,
  } as RecallConfig;
}
