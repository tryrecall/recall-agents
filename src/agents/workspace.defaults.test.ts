// Workspace default tests cover environment-variable precedence for the
// built-in agent workspace location.
import path from "node:path";
import { describe, expect, it } from "vitest";
import { withEnv } from "../test-utils/env.js";
import { resolveDefaultAgentWorkspaceDir } from "./workspace.js";

describe("DEFAULT_AGENT_WORKSPACE_DIR", () => {
  it("uses STEELENGINE_HOME when resolving the default workspace dir", () => {
    const home = path.join(path.sep, "srv", "steelengine-home");

    const resolved = withEnv(
      {
        STEELENGINE_WORKSPACE_DIR: undefined,
        STEELENGINE_PROFILE: undefined,
        STEELENGINE_HOME: home,
        HOME: path.join(path.sep, "home", "other"),
      },
      () => resolveDefaultAgentWorkspaceDir(),
    );

    expect(resolved).toBe(path.join(path.resolve(home), ".steelengine", "workspace"));
  });

  it("uses STEELENGINE_WORKSPACE_DIR before STEELENGINE_HOME", () => {
    const workspaceDir = path.join(path.sep, "srv", "steelengine-workspace");

    const resolved = withEnv(
      {
        STEELENGINE_WORKSPACE_DIR: workspaceDir,
        STEELENGINE_HOME: path.join(path.sep, "srv", "steelengine-home"),
      },
      () => resolveDefaultAgentWorkspaceDir(),
    );

    expect(resolved).toBe(path.resolve(workspaceDir));
  });
});
