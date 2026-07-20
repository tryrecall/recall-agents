// Memory Core plugin module implements public artifacts behavior.
import {
  listMemoryHostPublicArtifacts,
  type MemoryPluginPublicArtifact,
} from "steelengine/plugin-sdk/memory-host-core";
import type { SteelEngineConfig } from "../api.js";

export async function listMemoryCorePublicArtifacts(params: {
  cfg: SteelEngineConfig;
}): Promise<MemoryPluginPublicArtifact[]> {
  return await listMemoryHostPublicArtifacts(params);
}
