// Install download test utilities provide isolated state and workspace paths.
import {
  createSteelEngineTestState,
  type SteelEngineTestState,
} from "../../test-utils/steelengine-test-state.js";

/** Creates isolated SteelEngine state for install download tests. */
export async function createInstallDownloadTestState(): Promise<SteelEngineTestState> {
  return await createSteelEngineTestState({
    layout: "state-only",
    prefix: "steelengine-skills-install-",
  });
}
