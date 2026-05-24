import { describePluginRegistrationContract } from "recall/plugin-sdk/plugin-test-contracts";

describePluginRegistrationContract({
  pluginId: "ollama",
  providerIds: ["ollama"],
  webSearchProviderIds: ["ollama"],
});
