import { describeVeniceProviderRuntimeContract } from "recall/plugin-sdk/provider-test-contracts";

describeVeniceProviderRuntimeContract(() => import("./index.js"));
