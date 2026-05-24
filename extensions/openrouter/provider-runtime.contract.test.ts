import { describeOpenRouterProviderRuntimeContract } from "recall/plugin-sdk/provider-test-contracts";

describeOpenRouterProviderRuntimeContract(() => import("./index.js"));
