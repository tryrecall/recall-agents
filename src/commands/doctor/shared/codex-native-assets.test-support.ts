import type { SteelEngineConfig } from "../../../config/types.steelengine.js";
import "./codex-native-assets.js";

type CodexNativeAssetHit = {
  kind: "skill" | "plugin" | "config" | "hooks";
  path: string;
};

type TestApi = {
  scanCodexNativeAssets(params: {
    cfg: SteelEngineConfig;
    env?: NodeJS.ProcessEnv;
  }): Promise<CodexNativeAssetHit[]>;
};

function getTestApi(): TestApi {
  return (globalThis as Record<PropertyKey, unknown>)[
    Symbol.for("steelengine.codexNativeAssetsTestApi")
  ] as TestApi;
}

export const scanCodexNativeAssets: TestApi["scanCodexNativeAssets"] = (params) =>
  getTestApi().scanCodexNativeAssets(params);
