export type RecallPiCodingAgentSkillSourceAugmentation = never;

declare module "@earendil-works/pi-coding-agent" {
  interface Skill {
    // Recall relies on the source identifier returned by pi skill loaders.
    source: string;
  }
}
