import { describeGithubCopilotProviderAuthContract } from "recall/plugin-sdk/provider-test-contracts";

describeGithubCopilotProviderAuthContract(() => import("./index.js"));
