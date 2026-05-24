import { describeAnthropicProviderRuntimeContract } from "recall/plugin-sdk/provider-test-contracts";

describeAnthropicProviderRuntimeContract(() => import("./index.js"));
