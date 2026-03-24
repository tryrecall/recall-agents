import { describe, expect, it } from "vitest";
import {
  ensureRecallExecMarkerOnProcess,
  markRecallExecEnv,
  RECALL_CLI_ENV_VALUE,
  RECALL_CLI_ENV_VAR,
} from "./recall-exec-env.js";

describe("markRecallExecEnv", () => {
  it("returns a cloned env object with the exec marker set", () => {
    const env = { PATH: "/usr/bin", RECALL_CLI: "0" };
    const marked = markRecallExecEnv(env);

    expect(marked).toEqual({
      PATH: "/usr/bin",
      RECALL_CLI: RECALL_CLI_ENV_VALUE,
    });
    expect(marked).not.toBe(env);
    expect(env.RECALL_CLI).toBe("0");
  });
});

describe("ensureRecallExecMarkerOnProcess", () => {
  it("mutates and returns the provided process env", () => {
    const env: NodeJS.ProcessEnv = { PATH: "/usr/bin" };

    expect(ensureRecallExecMarkerOnProcess(env)).toBe(env);
    expect(env[RECALL_CLI_ENV_VAR]).toBe(RECALL_CLI_ENV_VALUE);
  });

  it("defaults to mutating process.env when no env object is provided", () => {
    const previous = process.env[RECALL_CLI_ENV_VAR];
    delete process.env[RECALL_CLI_ENV_VAR];

    try {
      expect(ensureRecallExecMarkerOnProcess()).toBe(process.env);
      expect(process.env[RECALL_CLI_ENV_VAR]).toBe(RECALL_CLI_ENV_VALUE);
    } finally {
      if (previous === undefined) {
        delete process.env[RECALL_CLI_ENV_VAR];
      } else {
        process.env[RECALL_CLI_ENV_VAR] = previous;
      }
    }
  });
});
