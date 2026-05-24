import { describeGoogleProviderRuntimeContract } from "recall/plugin-sdk/provider-test-contracts";

describeGoogleProviderRuntimeContract(() => import("./index.js"));
