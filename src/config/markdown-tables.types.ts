import type { MarkdownTableMode } from "./types.base.js";
import type { RecallConfig } from "./types.recall.js";

export type ResolveMarkdownTableModeParams = {
  cfg?: Partial<RecallConfig>;
  channel?: string | null;
  accountId?: string | null;
};

export type ResolveMarkdownTableMode = (
  params: ResolveMarkdownTableModeParams,
) => MarkdownTableMode;
