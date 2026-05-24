import type { SkillStatusEntry, SkillStatusReport } from "../agents/skills-status.js";
import type { RecallConfig } from "../config/types.recall.js";

export function collectUnavailableAgentSkills(report: SkillStatusReport): SkillStatusEntry[] {
  return report.skills.filter(
    (skill) =>
      !skill.eligible &&
      !skill.disabled &&
      !skill.blockedByAllowlist &&
      !skill.blockedByAgentFilter,
  );
}

export function disableUnavailableSkillsInConfig(
  config: RecallConfig,
  skills: readonly SkillStatusEntry[],
): RecallConfig {
  if (skills.length === 0) {
    return config;
  }
  const entries = { ...config.skills?.entries };
  for (const skill of skills) {
    entries[skill.skillKey] = {
      ...entries[skill.skillKey],
      enabled: false,
    };
  }
  return {
    ...config,
    skills: {
      ...config.skills,
      entries,
    },
  };
}
