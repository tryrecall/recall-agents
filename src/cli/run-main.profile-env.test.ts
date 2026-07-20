// Run-main profile env tests cover profile environment handling in the CLI entrypoint.
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { captureEnv, deleteTestEnvValue, setTestEnvValue } from "../test-utils/env.js";

const fileState = vi.hoisted(() => ({
  hasCliDotEnv: false,
}));

const dotenvState = vi.hoisted(() => {
  const state = {
    profileAtDotenvLoad: undefined as string | undefined,
    containerAtDotenvLoad: undefined as string | undefined,
  };
  return {
    state,
    loadDotEnv: vi.fn(() => {
      state.profileAtDotenvLoad = process.env.STEELENGINE_PROFILE;
      state.containerAtDotenvLoad = process.env.STEELENGINE_CONTAINER;
    }),
  };
});

const maybeRunCliInContainerMock = vi.hoisted(() =>
  vi.fn((argv: string[]) => ({ handled: false, argv })),
);

vi.mock("node:fs", async () => {
  const actual = await vi.importActual<typeof import("node:fs")>("node:fs");
  type ExistsSyncPath = Parameters<typeof actual.existsSync>[0];
  return {
    ...actual,
    existsSync: vi.fn((target: ExistsSyncPath) => {
      if (typeof target === "string" && target.endsWith(".env")) {
        return fileState.hasCliDotEnv;
      }
      return actual.existsSync(target);
    }),
  };
});

vi.mock("./dotenv.js", () => ({
  loadCliDotEnv: dotenvState.loadDotEnv,
}));

vi.mock("../infra/env.js", () => ({
  isTruthyEnvValue: (value?: string) =>
    typeof value === "string" && ["1", "on", "true", "yes"].includes(value.trim().toLowerCase()),
  normalizeEnv: vi.fn(),
}));

vi.mock("../infra/runtime-guard.js", () => ({
  assertSupportedRuntime: vi.fn(),
}));

vi.mock("../infra/path-env.js", () => ({
  ensureSteelEngineCliOnPath: vi.fn(),
}));

vi.mock("./route.js", () => ({
  tryRouteCli: vi.fn(async () => true),
}));

vi.mock("./windows-argv.js", () => ({
  normalizeWindowsArgv: (argv: string[]) => argv,
}));

vi.mock("./container-target.js", async () => {
  const actual =
    await vi.importActual<typeof import("./container-target.js")>("./container-target.js");
  return {
    ...actual,
    maybeRunCliInContainer: maybeRunCliInContainerMock,
  };
});

import { runCli } from "./run-main.js";

describe("runCli profile env bootstrap", () => {
  const envSnapshot = captureEnv([
    "STEELENGINE_PROFILE",
    "STEELENGINE_STATE_DIR",
    "STEELENGINE_CONFIG_PATH",
    "STEELENGINE_CONTAINER",
    "STEELENGINE_GATEWAY_PORT",
    "STEELENGINE_GATEWAY_URL",
    "STEELENGINE_GATEWAY_TOKEN",
    "STEELENGINE_GATEWAY_PASSWORD",
  ]);

  beforeEach(() => {
    deleteTestEnvValue("STEELENGINE_PROFILE");
    deleteTestEnvValue("STEELENGINE_STATE_DIR");
    deleteTestEnvValue("STEELENGINE_CONFIG_PATH");
    deleteTestEnvValue("STEELENGINE_CONTAINER");
    deleteTestEnvValue("STEELENGINE_GATEWAY_PORT");
    deleteTestEnvValue("STEELENGINE_GATEWAY_URL");
    deleteTestEnvValue("STEELENGINE_GATEWAY_TOKEN");
    deleteTestEnvValue("STEELENGINE_GATEWAY_PASSWORD");
    dotenvState.state.profileAtDotenvLoad = undefined;
    dotenvState.state.containerAtDotenvLoad = undefined;
    dotenvState.loadDotEnv.mockClear();
    maybeRunCliInContainerMock.mockClear();
    fileState.hasCliDotEnv = false;
  });

  afterEach(() => {
    envSnapshot.restore();
  });

  it("applies --profile before dotenv loading", async () => {
    fileState.hasCliDotEnv = true;
    await runCli(["node", "steelengine", "--profile", "rawdog", "status"]);

    expect(dotenvState.loadDotEnv).toHaveBeenCalledOnce();
    expect(dotenvState.state.profileAtDotenvLoad).toBe("rawdog");
    expect(process.env.STEELENGINE_PROFILE).toBe("rawdog");
  });

  it("rejects --container combined with --profile", async () => {
    await expect(
      runCli(["node", "steelengine", "--container", "demo", "--profile", "rawdog", "status"]),
    ).rejects.toThrow("--container cannot be combined with --profile/--dev");

    expect(dotenvState.loadDotEnv).not.toHaveBeenCalled();
    expect(process.env.STEELENGINE_PROFILE).toBe("rawdog");
  });

  it("rejects --container combined with interleaved --profile", async () => {
    await expect(
      runCli(["node", "steelengine", "status", "--container", "demo", "--profile", "rawdog"]),
    ).rejects.toThrow("--container cannot be combined with --profile/--dev");
  });

  it("rejects --container combined with interleaved --dev", async () => {
    await expect(
      runCli(["node", "steelengine", "status", "--container", "demo", "--dev"]),
    ).rejects.toThrow("--container cannot be combined with --profile/--dev");
  });

  it("does not let dotenv change container target resolution", async () => {
    fileState.hasCliDotEnv = true;
    dotenvState.loadDotEnv.mockImplementationOnce(() => {
      process.env.STEELENGINE_CONTAINER = "demo";
      dotenvState.state.profileAtDotenvLoad = process.env.STEELENGINE_PROFILE;
      dotenvState.state.containerAtDotenvLoad = process.env.STEELENGINE_CONTAINER;
    });

    await runCli(["node", "steelengine", "status"]);

    expect(dotenvState.loadDotEnv).toHaveBeenCalledOnce();
    expect(process.env.STEELENGINE_CONTAINER).toBe("demo");
    expect(dotenvState.state.containerAtDotenvLoad).toBe("demo");
    expect(maybeRunCliInContainerMock).toHaveBeenCalledWith(["node", "steelengine", "status"]);
    expect(maybeRunCliInContainerMock).toHaveReturnedWith({
      handled: false,
      argv: ["node", "steelengine", "status"],
    });
  });

  it("allows container mode when STEELENGINE_PROFILE is already set in env", async () => {
    setTestEnvValue("STEELENGINE_PROFILE", "work");

    await expect(
      runCli(["node", "steelengine", "--container", "demo", "status"]),
    ).resolves.toBeUndefined();
  });

  it.each([
    ["STEELENGINE_GATEWAY_PORT", "19001"],
    ["STEELENGINE_GATEWAY_URL", "ws://127.0.0.1:18789"],
    ["STEELENGINE_GATEWAY_TOKEN", "demo-token"],
    ["STEELENGINE_GATEWAY_PASSWORD", "demo-password"],
  ])("allows container mode when %s is set in env", async (key, value) => {
    setTestEnvValue(key, value);

    await expect(
      runCli(["node", "steelengine", "--container", "demo", "status"]),
    ).resolves.toBeUndefined();
  });

  it("allows container mode when only STEELENGINE_STATE_DIR is set in env", async () => {
    setTestEnvValue("STEELENGINE_STATE_DIR", "/tmp/steelengine-host-state");

    await expect(
      runCli(["node", "steelengine", "--container", "demo", "status"]),
    ).resolves.toBeUndefined();
  });

  it("allows container mode when only STEELENGINE_CONFIG_PATH is set in env", async () => {
    setTestEnvValue("STEELENGINE_CONFIG_PATH", "/tmp/steelengine-host-state/steelengine.json");

    await expect(
      runCli(["node", "steelengine", "--container", "demo", "status"]),
    ).resolves.toBeUndefined();
  });
});
