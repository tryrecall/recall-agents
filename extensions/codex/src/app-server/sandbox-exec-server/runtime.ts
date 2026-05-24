import type { SandboxContext } from "recall/plugin-sdk/sandbox";
import type { RecallExecServer } from "./types.js";

export function requireBackend(
  execServer: RecallExecServer,
): NonNullable<SandboxContext["backend"]> {
  const backend = execServer.sandbox.backend;
  if (!backend) {
    throw new Error("Recall sandbox backend is unavailable.");
  }
  return backend;
}

export function requireFsBridge(
  execServer: RecallExecServer,
): NonNullable<SandboxContext["fsBridge"]> {
  const fsBridge = execServer.sandbox.fsBridge;
  if (!fsBridge) {
    throw new Error("Sandbox filesystem bridge is unavailable.");
  }
  return fsBridge;
}
