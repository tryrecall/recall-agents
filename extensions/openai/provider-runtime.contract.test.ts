import { describeOpenAIProviderRuntimeContract } from "recall/plugin-sdk/provider-test-contracts";

describeOpenAIProviderRuntimeContract(() => import("./index.js"));
