import type { RecallConfig } from "../../config/types.recall.js";
import type { FinalizedMsgContext } from "../templating.js";

export type FastAbortResult = {
  handled: boolean;
  aborted: boolean;
  stoppedSubagents?: number;
};

export type TryFastAbortFromMessage = (params: {
  ctx: FinalizedMsgContext;
  cfg: RecallConfig;
}) => Promise<FastAbortResult>;

export type FormatAbortReplyText = (stoppedSubagents?: number) => string;
