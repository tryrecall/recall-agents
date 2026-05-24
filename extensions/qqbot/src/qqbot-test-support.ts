import type { RecallConfig } from "recall/plugin-sdk/config-contracts";

export function makeQqbotSecretRefConfig(): RecallConfig {
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
  } as RecallConfig;
}

export function makeQqbotDefaultAccountConfig(): RecallConfig {
  return {
    channels: {
      qqbot: {
        defaultAccount: "bot2",
        accounts: {
          bot2: { appId: "123456" },
        },
      },
    },
  } as RecallConfig;
}
