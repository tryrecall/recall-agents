import { describeGithubCopilotProviderRuntimeContract } from "recall/plugin-sdk/provider-test-contracts";

describeGithubCopilotProviderRuntimeContract(() => import("./index.js"));
