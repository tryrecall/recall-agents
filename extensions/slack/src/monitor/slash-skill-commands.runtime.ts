import { listSkillCommandsForAgents as listSkillCommandsForAgentsImpl } from "recall/plugin-sdk/command-auth-native";

type ListSkillCommandsForAgents =
  typeof import("recall/plugin-sdk/command-auth-native").listSkillCommandsForAgents;

export function listSkillCommandsForAgents(
  ...args: Parameters<ListSkillCommandsForAgents>
): ReturnType<ListSkillCommandsForAgents> {
  return listSkillCommandsForAgentsImpl(...args);
}
