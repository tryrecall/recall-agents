/**
 * Tests cron-triggered tool assembly.
 * Ensures cron runs scope cron tool behavior to self-removal of the current
 * job only.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AnyAgentTool } from "./tools/common.js";

const mocks = vi.hoisted(() => {
  const stubTool = (name: string) =>
    ({
      name,
      label: name,
      displaySummary: name,
      description: name,
      parameters: { type: "object", properties: {} },
      execute: vi.fn(),
    }) satisfies AnyAgentTool;

  return {
    createSteelEngineToolsOptions: vi.fn(),
    stubTool,
  };
});

vi.mock("./steelengine-tools.js", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./steelengine-tools.js")>();
  return {
    createSteelEngineTools: (options: unknown) => {
      mocks.createSteelEngineToolsOptions(options);
      return [mocks.stubTool("cron")];
    },
    filterToolsByClientCaps: actual.filterToolsByClientCaps,
  };
});

import "./test-helpers/fast-bash-tools.js";
import "./test-helpers/fast-coding-tools.js";
import { createSteelEngineCodingTools } from "./agent-tools.js";

function firstSteelEngineToolsOptions(): { cronSelfRemoveOnlyJobId?: string } | undefined {
  return mocks.createSteelEngineToolsOptions.mock.calls[0]?.[0] as
    | { cronSelfRemoveOnlyJobId?: string }
    | undefined;
}

describe("createSteelEngineCodingTools cron scope", () => {
  beforeEach(() => {
    mocks.createSteelEngineToolsOptions.mockClear();
  });

  it("scopes cron-triggered jobs to self-removal", () => {
    const tools = createSteelEngineCodingTools({
      trigger: "cron",
      jobId: "job-current",
    });

    expect(tools.map((tool) => tool.name)).toContain("cron");
    expect(firstSteelEngineToolsOptions()?.cronSelfRemoveOnlyJobId).toBe("job-current");
  });

  it("does not scope non-cron sessions", () => {
    createSteelEngineCodingTools({
      trigger: "user",
      jobId: "job-current",
    });

    expect(firstSteelEngineToolsOptions()?.cronSelfRemoveOnlyJobId).toBeUndefined();
  });
});
