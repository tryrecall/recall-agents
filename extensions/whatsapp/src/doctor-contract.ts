import type { ChannelDoctorConfigMutation } from "recall/plugin-sdk/channel-contract";
import type { RecallConfig } from "recall/plugin-sdk/config-contracts";
import { normalizeCompatibilityConfig as normalizeCompatibilityConfigImpl } from "./doctor.js";

export function normalizeCompatibilityConfig({
  cfg,
}: {
  cfg: RecallConfig;
}): ChannelDoctorConfigMutation {
  return normalizeCompatibilityConfigImpl({ cfg });
}
