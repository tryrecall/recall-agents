// Telegram plugin module implements auto topic label behavior.
import type { SteelEngineConfig } from "steelengine/plugin-sdk/config-contracts";
import { generateConversationLabel } from "steelengine/plugin-sdk/reply-dispatch-runtime";
export { resolveAutoTopicLabelConfig } from "./auto-topic-label-config.js";

export async function generateTelegramTopicLabel(params: {
  userMessage: string;
  prompt: string;
  cfg: SteelEngineConfig;
  agentId?: string;
  agentDir?: string;
}): Promise<string | null> {
  return await generateConversationLabel({
    ...params,
    maxLength: 128,
  });
}
