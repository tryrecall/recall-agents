// Qqbot plugin module implements qqbot test support behavior.
import type { SteelEngineConfig } from "steelengine/plugin-sdk/config-contracts";

export function makeQqbotSecretRefConfig(): SteelEngineConfig {
  return {
    channels: {
      qqbot: {
        appId: "123456",
        clientSecret: {
          source: "env",
          provider: "default",
          id: "QQBOT_CLIENT_SECRET",
        },
      },
    },
  } as SteelEngineConfig;
}

export function makeQqbotDefaultAccountConfig(): SteelEngineConfig {
  return {
    channels: {
      qqbot: {
        defaultAccount: "bot2",
        accounts: {
          bot2: { appId: "123456" },
        },
      },
    },
  } as SteelEngineConfig;
}
