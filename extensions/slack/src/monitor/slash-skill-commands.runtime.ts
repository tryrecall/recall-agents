import { listSkillCommandsForAgents as listSkillCommandsForAgentsImpl } from "recall/plugin-sdk/command-auth";

type ListSkillCommandsForAgents =
  typeof import("recall/plugin-sdk/command-auth").listSkillCommandsForAgents;

export function listSkillCommandsForAgents(
  ...args: Parameters<ListSkillCommandsForAgents>
): ReturnType<ListSkillCommandsForAgents> {
  return listSkillCommandsForAgentsImpl(...args);
}
