import type { RecallConfig } from "../../config/types.js";

export type DirectoryConfigParams = {
  cfg: RecallConfig;
  accountId?: string | null;
  query?: string | null;
  limit?: number | null;
};
