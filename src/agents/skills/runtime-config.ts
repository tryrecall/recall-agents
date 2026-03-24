import { getRuntimeConfigSnapshot, type RecallConfig } from "../../config/config.js";

export function resolveSkillRuntimeConfig(config?: RecallConfig): RecallConfig | undefined {
  return getRuntimeConfigSnapshot() ?? config;
}
