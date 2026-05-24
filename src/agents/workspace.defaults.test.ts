import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { resolveDefaultAgentWorkspaceDir } from "./workspace.js";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("DEFAULT_AGENT_WORKSPACE_DIR", () => {
  it("uses RECALL_HOME when resolving the default workspace dir", () => {
    const home = path.join(path.sep, "srv", "recall-home");
    vi.stubEnv("RECALL_HOME", home);
    vi.stubEnv("HOME", path.join(path.sep, "home", "other"));

    expect(resolveDefaultAgentWorkspaceDir()).toBe(
      path.join(path.resolve(home), ".recall", "workspace"),
    );
  });

  it("uses RECALL_WORKSPACE_DIR before RECALL_HOME", () => {
    const workspaceDir = path.join(path.sep, "srv", "recall-workspace");
    vi.stubEnv("RECALL_WORKSPACE_DIR", workspaceDir);
    vi.stubEnv("RECALL_HOME", path.join(path.sep, "srv", "recall-home"));

    expect(resolveDefaultAgentWorkspaceDir()).toBe(path.resolve(workspaceDir));
  });
});
