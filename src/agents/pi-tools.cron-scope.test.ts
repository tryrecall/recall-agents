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
    createRecallToolsOptions: vi.fn(),
    stubTool,
  };
});

vi.mock("./recall-tools.js", () => ({
  createRecallTools: (options: unknown) => {
    mocks.createRecallToolsOptions(options);
    return [mocks.stubTool("cron")];
  },
}));

import "./test-helpers/fast-bash-tools.js";
import "./test-helpers/fast-coding-tools.js";
import { createRecallCodingTools } from "./pi-tools.js";

function firstRecallToolsOptions(): { cronSelfRemoveOnlyJobId?: string } | undefined {
  return mocks.createRecallToolsOptions.mock.calls[0]?.[0] as
    | { cronSelfRemoveOnlyJobId?: string }
    | undefined;
}

describe("createRecallCodingTools cron scope", () => {
  beforeEach(() => {
    mocks.createRecallToolsOptions.mockClear();
  });

  it("scopes cron-triggered jobs to self-removal", () => {
    const tools = createRecallCodingTools({
      trigger: "cron",
      jobId: "job-current",
    });

    expect(tools.map((tool) => tool.name)).toContain("cron");
    expect(firstRecallToolsOptions()?.cronSelfRemoveOnlyJobId).toBe("job-current");
  });

  it("does not scope non-cron sessions", () => {
    createRecallCodingTools({
      trigger: "user",
      jobId: "job-current",
    });

    expect(firstRecallToolsOptions()?.cronSelfRemoveOnlyJobId).toBeUndefined();
  });
});
