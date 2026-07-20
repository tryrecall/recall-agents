// Declares extension points for agent session type augmentation.
export type SteelEngineAgentSessionSkillSourceAugmentation = never;

declare module "steelengine/plugin-sdk/agent-sessions" {
  interface Skill {
    // SteelEngine relies on the source identifier returned by skill loaders.
    source: string;
  }
}
