/**
 * Tests agent directory compatibility helpers.
 */
import { describe, expect, it } from "vitest";
import { resolveSteelEngineAgentDir } from "./agent-dir-compat.js";

describe("resolveSteelEngineAgentDir", () => {
  it("keeps the shipped Pi env alias for deprecated plugin SDK callers", () => {
    expect(
      resolveSteelEngineAgentDir({
        PI_CODING_AGENT_DIR: "/tmp/steelengine-legacy-agent",
      }),
    ).toBe("/tmp/steelengine-legacy-agent");
  });

  it("prefers the SteelEngine env override over the deprecated Pi alias", () => {
    expect(
      resolveSteelEngineAgentDir({
        STEELENGINE_AGENT_DIR: "/tmp/steelengine-agent",
        PI_CODING_AGENT_DIR: "/tmp/steelengine-legacy-agent",
      }),
    ).toBe("/tmp/steelengine-agent");
  });
});
