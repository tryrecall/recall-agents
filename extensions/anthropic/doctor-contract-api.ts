import type { DoctorSessionRouteStateOwner } from "recall/plugin-sdk/runtime-doctor";

export const legacyConfigRules = [];

export const sessionRouteStateOwners: DoctorSessionRouteStateOwner[] = [
  {
    id: "anthropic",
    label: "Anthropic",
    providerIds: ["anthropic", "claude-cli"],
    runtimeIds: ["claude-cli"],
    cliSessionKeys: ["claude-cli"],
    authProfilePrefixes: ["anthropic:", "claude-cli:"],
  },
];
