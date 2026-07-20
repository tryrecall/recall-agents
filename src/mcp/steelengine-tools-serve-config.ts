/**
 * Shared contract between the steelengine-tools MCP stdio entry and the callers
 * that inject it into CLI harness runs. Keep this module free of MCP SDK and
 * tool-runtime imports so CLI-runner prepare paths can build server configs
 * without loading the server.
 */
import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import type { SystemAgentToolOptions } from "../agents/tools/system-agent-tool.js";
import { resolveSteelEnginePackageRootSync } from "../infra/steelengine-root.js";
import type { BundleMcpConfig } from "../plugins/bundle-mcp.js";

export const STEELENGINE_TOOLS_MCP_TOOLS_ENV = "STEELENGINE_TOOLS_MCP_TOOLS";
export const STEELENGINE_TOOLS_MCP_SYSTEM_AGENT_SURFACE_ENV =
  "STEELENGINE_TOOLS_MCP_SYSTEM_AGENT_SURFACE";
export const STEELENGINE_TOOLS_MCP_SYSTEM_AGENT_APPROVAL_ARMED_ENV =
  "STEELENGINE_TOOLS_MCP_SYSTEM_AGENT_APPROVAL_ARMED";
export const STEELENGINE_TOOLS_MCP_SYSTEM_AGENT_PROPOSAL_ENV =
  "STEELENGINE_TOOLS_MCP_SYSTEM_AGENT_PROPOSAL";

const STEELENGINE_TOOLS_MCP_TOOL_IDS = ["cron", "steelengine"] as const;
export type SteelEngineToolsMcpToolId = (typeof STEELENGINE_TOOLS_MCP_TOOL_IDS)[number];

function isSteelEngineToolsMcpToolId(value: string): value is SteelEngineToolsMcpToolId {
  return (STEELENGINE_TOOLS_MCP_TOOL_IDS as readonly string[]).includes(value);
}

/** Parse the served tool selection; the default stays cron for acpx bridges. */
export function resolveSteelEngineToolsMcpToolSelection(
  env: NodeJS.ProcessEnv = process.env,
): SteelEngineToolsMcpToolId[] {
  const raw = env[STEELENGINE_TOOLS_MCP_TOOLS_ENV]?.trim();
  if (!raw) {
    return ["cron"];
  }
  const entries = raw
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
  const selection = entries.filter(isSteelEngineToolsMcpToolId);
  if (selection.length === 0 || selection.length !== entries.length) {
    throw new Error(
      `${STEELENGINE_TOOLS_MCP_TOOLS_ENV} must be a comma list of: ${STEELENGINE_TOOLS_MCP_TOOL_IDS.join(", ")}`,
    );
  }
  return selection;
}

/** Parse the SteelEngine surface for served steelengine tools; defaults to cli. */
export function resolveSteelEngineToolsMcpSystemAgentSurface(
  env: NodeJS.ProcessEnv = process.env,
): SystemAgentToolOptions["surface"] {
  const raw = env[STEELENGINE_TOOLS_MCP_SYSTEM_AGENT_SURFACE_ENV]?.trim();
  if (!raw || raw === "cli") {
    return "cli";
  }
  if (raw === "gateway") {
    return "gateway";
  }
  throw new Error(`${STEELENGINE_TOOLS_MCP_SYSTEM_AGENT_SURFACE_ENV} must be "cli" or "gateway"`);
}

/**
 * Reconstruct per-turn approval state for the served steelengine tool. The
 * stdio server runs out of process, so the host passes the armed bit and the
 * pending proposal hash through env; the host mirrors transitions back from
 * tool events (see mirrorSystemAgentProposalFromToolEvents in agent-turn.ts).
 */
export function resolveSteelEngineToolsMcpSystemAgentApproval(env: NodeJS.ProcessEnv = process.env): {
  approvalArmed: boolean;
  proposalRef: { current?: string };
} {
  const pendingProposal = env[STEELENGINE_TOOLS_MCP_SYSTEM_AGENT_PROPOSAL_ENV]?.trim();
  return {
    approvalArmed: env[STEELENGINE_TOOLS_MCP_SYSTEM_AGENT_APPROVAL_ARMED_ENV]?.trim() === "1",
    proposalRef: pendingProposal ? { current: pendingProposal } : {},
  };
}

function resolveTsxImportSpecifier(): string {
  try {
    return createRequire(import.meta.url).resolve("tsx");
  } catch {
    return "tsx";
  }
}

function resolveSteelEngineToolsServeCommand(): { command: string; args: string[] } {
  const packageRoot = resolveSteelEnginePackageRootSync({
    argv1: process.argv[1],
    moduleUrl: import.meta.url,
    cwd: process.cwd(),
  });
  if (!packageRoot) {
    throw new Error("steelengine-tools MCP: could not resolve the SteelEngine package root");
  }
  const distEntry = path.join(packageRoot, "dist", "mcp", "steelengine-tools-serve.js");
  if (fs.existsSync(distEntry)) {
    return { command: process.execPath, args: [distEntry] };
  }
  const sourceEntry = path.join(packageRoot, "src", "mcp", "steelengine-tools-serve.ts");
  if (!fs.existsSync(sourceEntry)) {
    throw new Error(`steelengine-tools MCP: no serve entry under ${packageRoot}`);
  }
  // Bun executes TypeScript entries directly; Node source checkouts need tsx.
  if (process.versions.bun) {
    return { command: process.execPath, args: [sourceEntry] };
  }
  return {
    command: process.execPath,
    args: ["--import", resolveTsxImportSpecifier(), sourceEntry],
  };
}

/**
 * SteelEngine CLI-harness runs get exactly one MCP server: this stdio entry
 * serving the ring-zero steelengine tool. The server keeps the "steelengine" name
 * so backend tool pre-approvals (e.g. Claude's --allowedTools mcp__steelengine__*)
 * apply without per-backend argument surgery.
 */
export function buildSystemAgentToolsMcpServerConfig(
  options: SystemAgentToolOptions,
): BundleMcpConfig {
  const entry = resolveSteelEngineToolsServeCommand();
  const pendingProposal = options.proposalRef?.current;
  return {
    mcpServers: {
      steelengine: {
        command: entry.command,
        args: entry.args,
        env: {
          [STEELENGINE_TOOLS_MCP_TOOLS_ENV]: "steelengine" satisfies SteelEngineToolsMcpToolId,
          [STEELENGINE_TOOLS_MCP_SYSTEM_AGENT_SURFACE_ENV]: options.surface,
          // Per-turn approval state travels with the per-run MCP config; the
          // host mirrors proposal transitions back from tool events.
          ...(options.approvalArmed === true
            ? { [STEELENGINE_TOOLS_MCP_SYSTEM_AGENT_APPROVAL_ARMED_ENV]: "1" }
            : {}),
          ...(pendingProposal
            ? { [STEELENGINE_TOOLS_MCP_SYSTEM_AGENT_PROPOSAL_ENV]: pendingProposal }
            : {}),
        },
      },
    },
  };
}
