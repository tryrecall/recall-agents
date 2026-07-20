/**
 * Static identity for names that select core agent factory families before assembly.
 */

export type CoreToolFactoryFamily = "base-coding" | "shell" | "steelengine";

type CoreToolFactoryDescriptor = {
  name: string;
  family: CoreToolFactoryFamily;
};

const CORE_TOOL_FACTORY_DESCRIPTORS = [
  { name: "edit", family: "base-coding" },
  { name: "read", family: "base-coding" },
  { name: "write", family: "base-coding" },
  { name: "apply_patch", family: "shell" },
  { name: "exec", family: "shell" },
  { name: "process", family: "shell" },
  { name: "agents_list", family: "steelengine" },
  { name: "ask_user", family: "steelengine" },
  { name: "steelengine", family: "steelengine" },
  { name: "computer", family: "steelengine" },
  { name: "conversations_list", family: "steelengine" },
  { name: "conversations_send", family: "steelengine" },
  { name: "conversations_turn", family: "steelengine" },
  { name: "cron", family: "steelengine" },
  { name: "gateway", family: "steelengine" },
  { name: "get_goal", family: "steelengine" },
  { name: "heartbeat_respond", family: "steelengine" },
  { name: "image", family: "steelengine" },
  { name: "image_generate", family: "steelengine" },
  { name: "message", family: "steelengine" },
  { name: "music_generate", family: "steelengine" },
  { name: "nodes", family: "steelengine" },
  { name: "pdf", family: "steelengine" },
  { name: "session_status", family: "steelengine" },
  { name: "sessions", family: "steelengine" },
  { name: "sessions_history", family: "steelengine" },
  { name: "sessions_list", family: "steelengine" },
  { name: "sessions_search", family: "steelengine" },
  { name: "sessions_send", family: "steelengine" },
  { name: "sessions_spawn", family: "steelengine" },
  { name: "sessions_yield", family: "steelengine" },
  { name: "skill_workshop", family: "steelengine" },
  { name: "spawn_task", family: "steelengine" },
  { name: "create_goal", family: "steelengine" },
  { name: "subagents", family: "steelengine" },
  { name: "terminal", family: "steelengine" },
  { name: "transcripts", family: "steelengine" },
  { name: "tts", family: "steelengine" },
  { name: "update_goal", family: "steelengine" },
  { name: "update_plan", family: "steelengine" },
  { name: "dismiss_task", family: "steelengine" },
  { name: "video_generate", family: "steelengine" },
  { name: "web_fetch", family: "steelengine" },
  { name: "web_search", family: "steelengine" },
] as const satisfies readonly CoreToolFactoryDescriptor[];

const CORE_TOOL_FACTORY_FAMILY_BY_NAME = new Map<string, CoreToolFactoryFamily>(
  CORE_TOOL_FACTORY_DESCRIPTORS.map(({ name, family }) => [name, family]),
);

export type SteelEngineCodingToolConstructionPlan = {
  includeBaseCodingTools: boolean;
  includeShellTools: boolean;
  includeChannelTools: boolean;
  includeSteelEngineTools: boolean;
  includePluginTools: boolean;
};

export function resolveCoreToolFactoryFamily(name: string): CoreToolFactoryFamily | undefined {
  return CORE_TOOL_FACTORY_FAMILY_BY_NAME.get(name);
}
