import type { RecallConfig } from "../config/types.recall.js";
import type { BundleMcpDiagnostic, BundleMcpServerConfig } from "../plugins/bundle-mcp.js";
import { loadMergedBundleMcpConfig } from "./bundle-mcp-config.js";

type EmbeddedPiMcpConfig = {
  mcpServers: Record<string, BundleMcpServerConfig>;
  diagnostics: BundleMcpDiagnostic[];
};

export function loadEmbeddedPiMcpConfig(params: {
  workspaceDir: string;
  cfg?: RecallConfig;
}): EmbeddedPiMcpConfig {
  const bundleMcp = loadMergedBundleMcpConfig({
    workspaceDir: params.workspaceDir,
    cfg: params.cfg,
  });

  return {
    mcpServers: bundleMcp.config.mcpServers,
    diagnostics: bundleMcp.diagnostics,
  };
}
