import { describePluginRegistrationContract } from "recall/plugin-sdk/plugin-test-contracts";

describePluginRegistrationContract({
  pluginId: "byteplus",
  providerIds: ["byteplus", "byteplus-plan"],
  videoGenerationProviderIds: ["byteplus"],
  requireGenerateVideo: true,
});
