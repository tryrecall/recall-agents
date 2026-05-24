import { pluginRegistrationContractCases } from "recall/plugin-sdk/plugin-test-contracts";
import { describePluginRegistrationContract } from "recall/plugin-sdk/plugin-test-contracts";

describePluginRegistrationContract({
  ...pluginRegistrationContractCases.google,
  speechProviderIds: ["google"],
  videoGenerationProviderIds: ["google"],
  webSearchProviderIds: ["gemini"],
  requireDescribeImages: true,
  requireGenerateImage: true,
  requireGenerateVideo: true,
});
