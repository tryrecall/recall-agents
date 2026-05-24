import { describePluginRegistrationContract } from "recall/plugin-sdk/plugin-test-contracts";

describePluginRegistrationContract({
  pluginId: "gradium",
  speechProviderIds: ["gradium"],
});
