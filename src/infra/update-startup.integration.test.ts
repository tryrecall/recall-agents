// Proves startup update discovery through the real extended-stable registry resolver.
import http from "node:http";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { closeSteelEngineStateDatabaseForTest } from "../state/steelengine-state-db.js";
import {
  createSteelEngineTestState,
  type SteelEngineTestState,
} from "../test-utils/steelengine-test-state.js";
import type { UpdateCheckResult } from "./update-check.js";

vi.mock("./steelengine-root.js", async () => {
  const actual = await vi.importActual<typeof import("./steelengine-root.js")>("./steelengine-root.js");
  return {
    ...actual,
    resolveSteelEnginePackageRoot: vi.fn(async () => "/opt/steelengine"),
  };
});

vi.mock("./update-check.js", async () => {
  const actual = await vi.importActual<typeof import("./update-check.js")>("./update-check.js");
  return {
    ...actual,
    checkUpdateStatus: vi.fn(
      async () =>
        ({
          root: "/opt/steelengine",
          installKind: "package",
          packageManager: "npm",
        }) satisfies UpdateCheckResult,
    ),
  };
});

vi.mock("../version.js", () => ({
  VERSION: "1.0.0",
}));

describe("extended-stable startup update integration", () => {
  let testState: SteelEngineTestState;
  let server: http.Server | undefined;

  beforeEach(async () => {
    server = undefined;
    testState = await createSteelEngineTestState({
      layout: "state-only",
      prefix: "steelengine-update-startup-integration-",
      env: {
        NODE_ENV: "test",
        NPM_CONFIG_REGISTRY: undefined,
        STEELENGINE_UPDATE_PACKAGE_SPEC: undefined,
        VITEST: undefined,
      },
    });
  });

  afterEach(async () => {
    const activeServer = server;
    if (activeServer) {
      await new Promise<void>((resolve, reject) => {
        activeServer.close((error) => (error ? reject(error) : resolve()));
      });
    }
    closeSteelEngineStateDatabaseForTest();
    await testState.cleanup();
  });

  it("emits a read-only hint after verifying a newer exact loopback package", async () => {
    const requests: string[] = [];
    const registryServer = http.createServer((request, response) => {
      requests.push(request.url ?? "");
      response.writeHead(200, { "content-type": "application/json" });
      response.end(JSON.stringify({ version: "2.0.0" }));
    });
    server = registryServer;
    await new Promise<void>((resolve) => {
      registryServer.listen(0, "127.0.0.1", resolve);
    });
    const address = registryServer.address();
    if (!address || typeof address === "string") {
      throw new Error("expected loopback registry address");
    }
    process.env.STEELENGINE_UPDATE_PACKAGE_SPEC = "steelengine";
    process.env.NPM_CONFIG_REGISTRY = `http://127.0.0.1:${address.port}/`;

    const { runGatewayUpdateCheck, resetUpdateAvailableStateForTest } =
      await import("./update-startup.js");
    resetUpdateAvailableStateForTest();
    const log = { info: vi.fn() };
    const onUpdateAvailableChange = vi.fn();
    const runAutoUpdate = vi.fn();

    await runGatewayUpdateCheck({
      cfg: { update: { channel: "extended-stable", auto: { enabled: true } } },
      log,
      isNixMode: false,
      allowInTests: true,
      onUpdateAvailableChange,
      runAutoUpdate,
    });

    expect(requests).toEqual(["/steelengine/extended-stable", "/steelengine/2.0.0"]);
    expect(onUpdateAvailableChange).toHaveBeenCalledWith({
      currentVersion: "1.0.0",
      latestVersion: "2.0.0",
      channel: "extended-stable",
    });
    expect(log.info).toHaveBeenCalledWith(
      "update available (extended-stable): v2.0.0 (current v1.0.0). Run: steelengine update",
    );
    expect(runAutoUpdate).not.toHaveBeenCalled();
  });
});
