import { describeModelStudioProviderDiscoveryContract } from "recall/plugin-sdk/provider-test-contracts";

describeModelStudioProviderDiscoveryContract(() => import("./index.js"));
