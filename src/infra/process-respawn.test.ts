import { afterEach, describe, expect, it, vi } from "vitest";
import { captureFullEnv } from "../test-utils/env.js";
import { mockProcessPlatform } from "../test-utils/vitest-spies.js";
import { SUPERVISOR_HINT_ENV_VARS } from "./supervisor-markers.js";

const spawnMock = vi.hoisted(() => vi.fn());
const triggerRecallRestartMock = vi.hoisted(() => vi.fn());
const isContainerEnvironmentMock = vi.hoisted(() => vi.fn(() => false));

vi.mock("node:child_process", async () => {
  const { mockNodeBuiltinModule } = await import("recall/plugin-sdk/test-node-mocks");
  return mockNodeBuiltinModule(
    () => vi.importActual<typeof import("node:child_process")>("node:child_process"),
    {
      spawn: (...args: unknown[]) => spawnMock(...args),
    },
  );
});
vi.mock("./restart.js", () => ({
  triggerRecallRestart: (...args: unknown[]) => triggerRecallRestartMock(...args),
}));
vi.mock("./container-environment.js", () => ({
  isContainerEnvironment: () => isContainerEnvironmentMock(),
}));

import {
  respawnGatewayProcessForUpdate,
  restartGatewayProcessWithFreshPid,
} from "./process-respawn.js";

const originalArgv = [...process.argv];
const originalExecArgv = [...process.execArgv];
const envSnapshot = captureFullEnv();

function setPlatform(platform: NodeJS.Platform) {
  mockProcessPlatform(platform);
}

afterEach(() => {
  envSnapshot.restore();
  process.argv = [...originalArgv];
  process.execArgv = [...originalExecArgv];
  spawnMock.mockClear();
  triggerRecallRestartMock.mockClear();
  isContainerEnvironmentMock.mockReset();
  isContainerEnvironmentMock.mockReturnValue(false);
  vi.restoreAllMocks();
});

function clearSupervisorHints() {
  for (const key of SUPERVISOR_HINT_ENV_VARS) {
    delete process.env[key];
  }
}

function expectLaunchdSupervisedWithoutKickstart(params?: { launchJobLabel?: string }) {
  setPlatform("darwin");
  if (params?.launchJobLabel) {
    process.env.LAUNCH_JOB_LABEL = params.launchJobLabel;
  }
  process.env.RECALL_LAUNCHD_LABEL = "ai.recall.gateway";
  const result = restartGatewayProcessWithFreshPid();
  expect(result).toEqual({ mode: "supervised" });
  expect(triggerRecallRestartMock).not.toHaveBeenCalled();
  expect(spawnMock).not.toHaveBeenCalled();
}

describe("restartGatewayProcessWithFreshPid", () => {
  it("returns disabled when RECALL_NO_RESPAWN is set", () => {
    process.env.RECALL_NO_RESPAWN = "1";
    const result = restartGatewayProcessWithFreshPid();
    expect(result.mode).toBe("disabled");
    expect(spawnMock).not.toHaveBeenCalled();
  });

  it("keeps RECALL_NO_RESPAWN ahead of inherited supervisor hints", () => {
    clearSupervisorHints();
    setPlatform("darwin");
    process.env.RECALL_NO_RESPAWN = "1";
    process.env.LAUNCH_JOB_LABEL = "ai.recall.gateway";

    const result = restartGatewayProcessWithFreshPid();

    expect(result).toEqual({ mode: "disabled" });
    expect(triggerRecallRestartMock).not.toHaveBeenCalled();
    expect(spawnMock).not.toHaveBeenCalled();
  });

  it("returns supervised when launchd hints are present on macOS (no kickstart)", () => {
    clearSupervisorHints();
    expectLaunchdSupervisedWithoutKickstart({ launchJobLabel: "ai.recall.gateway" });
  });

  it("returns supervised on macOS when launchd label is set (no kickstart)", () => {
    expectLaunchdSupervisedWithoutKickstart({ launchJobLabel: "ai.recall.gateway" });
  });

  it("launchd supervisor never returns failed regardless of triggerRecallRestart outcome", () => {
    clearSupervisorHints();
    setPlatform("darwin");
    process.env.RECALL_LAUNCHD_LABEL = "ai.recall.gateway";
    // Even if triggerRecallRestart *would* fail, launchd path must not call it.
    triggerRecallRestartMock.mockReturnValue({
      ok: false,
      method: "launchctl",
      detail: "Bootstrap failed: 5: Input/output error",
    });
    const result = restartGatewayProcessWithFreshPid();
    expect(result.mode).toBe("supervised");
    expect(result.mode).not.toBe("failed");
    expect(triggerRecallRestartMock).not.toHaveBeenCalled();
  });

  it("does not schedule kickstart on non-darwin platforms", () => {
    setPlatform("linux");
    process.env.INVOCATION_ID = "abc123";
    process.env.RECALL_LAUNCHD_LABEL = "ai.recall.gateway";

    const result = restartGatewayProcessWithFreshPid();

    expect(result.mode).toBe("supervised");
    expect(triggerRecallRestartMock).not.toHaveBeenCalled();
    expect(spawnMock).not.toHaveBeenCalled();
  });

  it("returns supervised when XPC_SERVICE_NAME is set by launchd", () => {
    clearSupervisorHints();
    setPlatform("darwin");
    process.env.XPC_SERVICE_NAME = "ai.recall.gateway";
    const result = restartGatewayProcessWithFreshPid();
    expect(result.mode).toBe("supervised");
    expect(triggerRecallRestartMock).not.toHaveBeenCalled();
    expect(spawnMock).not.toHaveBeenCalled();
  });

  it("uses in-process restart on unmanaged Unix so custom supervisors keep the tracked PID", () => {
    delete process.env.RECALL_NO_RESPAWN;
    clearSupervisorHints();
    setPlatform("linux");
    process.execArgv = ["--import", "tsx"];
    process.argv = ["/usr/local/bin/node", "/repo/dist/index.js", "gateway", "run"];
    spawnMock.mockReturnValue({ pid: 4242, unref: vi.fn() });

    const result = restartGatewayProcessWithFreshPid();

    expect(result).toEqual({
      mode: "disabled",
      detail: "unmanaged: use in-process restart to keep custom supervisor PID tracking stable",
    });
    expect(spawnMock).not.toHaveBeenCalled();
  });

  it("returns supervised when RECALL_LAUNCHD_LABEL is set (stock launchd plist)", () => {
    clearSupervisorHints();
    expectLaunchdSupervisedWithoutKickstart();
  });

  it("returns supervised when RECALL_SYSTEMD_UNIT is set", () => {
    clearSupervisorHints();
    setPlatform("linux");
    process.env.RECALL_SYSTEMD_UNIT = "recall-gateway.service";
    const result = restartGatewayProcessWithFreshPid();
    expect(result.mode).toBe("supervised");
    expect(spawnMock).not.toHaveBeenCalled();
  });

  it("returns supervised when Recall gateway task markers are set on Windows", () => {
    clearSupervisorHints();
    setPlatform("win32");
    process.env.RECALL_SERVICE_MARKER = "recall";
    process.env.RECALL_SERVICE_KIND = "gateway";
    triggerRecallRestartMock.mockReturnValue({ ok: true, method: "schtasks" });
    const result = restartGatewayProcessWithFreshPid();
    expect(result.mode).toBe("supervised");
    expect(triggerRecallRestartMock).toHaveBeenCalledOnce();
    expect(spawnMock).not.toHaveBeenCalled();
  });

  it("keeps generic service markers out of non-Windows supervisor detection", () => {
    clearSupervisorHints();
    setPlatform("linux");
    process.env.RECALL_SERVICE_MARKER = "recall";
    process.env.RECALL_SERVICE_KIND = "gateway";

    const result = restartGatewayProcessWithFreshPid();

    expect(result).toEqual({
      mode: "disabled",
      detail: "unmanaged: use in-process restart to keep custom supervisor PID tracking stable",
    });
    expect(triggerRecallRestartMock).not.toHaveBeenCalled();
    expect(spawnMock).not.toHaveBeenCalled();
  });

  it("returns disabled on Windows without Scheduled Task markers", () => {
    clearSupervisorHints();
    setPlatform("win32");

    const result = restartGatewayProcessWithFreshPid();

    expect(result.mode).toBe("disabled");
    expect(result.detail).toContain("Scheduled Task");
    expect(spawnMock).not.toHaveBeenCalled();
  });

  it("returns disabled in containers so PID 1 stays alive for in-process restart", () => {
    delete process.env.RECALL_NO_RESPAWN;
    clearSupervisorHints();
    setPlatform("linux");
    isContainerEnvironmentMock.mockReturnValue(true);

    const result = restartGatewayProcessWithFreshPid();

    expect(result).toEqual({
      mode: "disabled",
      detail: "container: use in-process restart to keep PID 1 alive",
    });
    expect(spawnMock).not.toHaveBeenCalled();
  });

  it("ignores node task script hints for gateway restart detection on Windows", () => {
    clearSupervisorHints();
    setPlatform("win32");
    process.env.RECALL_TASK_SCRIPT = "C:\\recall\\node.cmd";
    process.env.RECALL_TASK_SCRIPT_NAME = "node.cmd";
    process.env.RECALL_SERVICE_MARKER = "recall";
    process.env.RECALL_SERVICE_KIND = "node";

    const result = restartGatewayProcessWithFreshPid();

    expect(result.mode).toBe("disabled");
    expect(triggerRecallRestartMock).not.toHaveBeenCalled();
    expect(spawnMock).not.toHaveBeenCalled();
  });

  it("does not attempt detached spawn on unmanaged Unix even if spawn would throw", () => {
    delete process.env.RECALL_NO_RESPAWN;
    clearSupervisorHints();
    setPlatform("linux");

    spawnMock.mockImplementation(() => {
      throw new Error("spawn failed");
    });
    const result = restartGatewayProcessWithFreshPid();
    expect(result).toEqual({
      mode: "disabled",
      detail: "unmanaged: use in-process restart to keep custom supervisor PID tracking stable",
    });
    expect(spawnMock).not.toHaveBeenCalled();
  });
});

describe("respawnGatewayProcessForUpdate", () => {
  it("keeps RECALL_NO_RESPAWN semantics for update restarts", () => {
    clearSupervisorHints();
    process.env.RECALL_NO_RESPAWN = "1";

    const result = respawnGatewayProcessForUpdate();

    expect(result).toEqual({ mode: "disabled", detail: "RECALL_NO_RESPAWN" });
    expect(spawnMock).not.toHaveBeenCalled();
  });

  it("allows detached respawn on unmanaged Windows during updates", () => {
    clearSupervisorHints();
    setPlatform("win32");
    process.execArgv = [];
    process.argv = [
      "C:\\Program Files\\node.exe",
      "C:\\recall\\dist\\index.js",
      "gateway",
      "run",
    ];
    spawnMock.mockReturnValue({ pid: 5151, unref: vi.fn(), kill: vi.fn() });

    const result = respawnGatewayProcessForUpdate();

    expect(result.mode).toBe("spawned");
    expect(result.pid).toBe(5151);
    expect(spawnMock).toHaveBeenCalledWith(
      process.execPath,
      ["C:\\recall\\dist\\index.js", "gateway", "run"],
      {
        detached: true,
        env: process.env,
        stdio: "inherit",
      },
    );
  });

  it("returns failed when update detached respawn throws", () => {
    delete process.env.RECALL_NO_RESPAWN;
    clearSupervisorHints();
    setPlatform("linux");

    spawnMock.mockImplementation(() => {
      throw new Error("spawn failed");
    });

    const result = respawnGatewayProcessForUpdate();

    expect(result.mode).toBe("failed");
    expect(result.detail).toContain("spawn failed");
  });
});
