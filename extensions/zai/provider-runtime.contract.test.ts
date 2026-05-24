import { describeZAIProviderRuntimeContract } from "recall/plugin-sdk/provider-test-contracts";

describeZAIProviderRuntimeContract(() => import("./index.js"));
