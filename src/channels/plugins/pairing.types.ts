import type { RecallConfig } from "../../config/types.recall.js";
import type { RuntimeEnv } from "../../runtime.js";

export type ChannelPairingAdapter = {
  idLabel: string;
  normalizeAllowEntry?: (entry: string) => string;
  notifyApproval?: (params: {
    cfg: RecallConfig;
    id: string;
    accountId?: string;
    runtime?: RuntimeEnv;
  }) => Promise<void>;
};
