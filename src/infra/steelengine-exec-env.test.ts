// Tests SteelEngine execution environment construction.
import { describe, expect, it } from "vitest";
import { deleteTestEnvValue, setTestEnvValue } from "../test-utils/env.js";
import {
  ensureSteelEngineExecMarkerOnProcess,
  markSteelEngineExecEnv,
  STEELENGINE_CLI_ENV_VAR,
} from "./steelengine-exec-env.js";

const STEELENGINE_CLI_ENV_VALUE = "1";

describe("markSteelEngineExecEnv", () => {
  it("returns a cloned env object with the exec marker set", () => {
    const env = { PATH: "/usr/bin", STEELENGINE_CLI: "0" };
    const marked = markSteelEngineExecEnv(env);

    expect(marked).toEqual({
      PATH: "/usr/bin",
      STEELENGINE_CLI: STEELENGINE_CLI_ENV_VALUE,
    });
    expect(marked).not.toBe(env);
    expect(env.STEELENGINE_CLI).toBe("0");
  });
});

describe("ensureSteelEngineExecMarkerOnProcess", () => {
  it.each([
    {
      name: "mutates and returns the provided process env",
      env: { PATH: "/usr/bin" } as NodeJS.ProcessEnv,
    },
    {
      name: "overwrites an existing marker on the provided process env",
      env: { PATH: "/usr/bin", [STEELENGINE_CLI_ENV_VAR]: "0" } as NodeJS.ProcessEnv,
    },
  ])("$name", ({ env }) => {
    expect(ensureSteelEngineExecMarkerOnProcess(env)).toBe(env);
    expect(env[STEELENGINE_CLI_ENV_VAR]).toBe(STEELENGINE_CLI_ENV_VALUE);
  });

  it("defaults to mutating process.env when no env object is provided", () => {
    const previous = process.env[STEELENGINE_CLI_ENV_VAR];
    deleteTestEnvValue(STEELENGINE_CLI_ENV_VAR);

    try {
      expect(ensureSteelEngineExecMarkerOnProcess()).toBe(process.env);
      expect(process.env[STEELENGINE_CLI_ENV_VAR]).toBe(STEELENGINE_CLI_ENV_VALUE);
    } finally {
      if (previous === undefined) {
        deleteTestEnvValue(STEELENGINE_CLI_ENV_VAR);
      } else {
        setTestEnvValue(STEELENGINE_CLI_ENV_VAR, previous);
      }
    }
  });
});
