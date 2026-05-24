import type { RecallConfig } from "../../config/types.recall.js";

export function createPerSenderSessionConfig(
  overrides: Partial<NonNullable<RecallConfig["session"]>> = {},
): NonNullable<RecallConfig["session"]> {
  return {
    mainKey: "main",
    scope: "per-sender",
    ...overrides,
  };
}
