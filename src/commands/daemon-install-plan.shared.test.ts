import { describe, expect, it } from "vitest";
import {
  resolveDaemonInstallRuntimeInputs,
  resolveDaemonNodeBinDir,
  resolveDaemonRecallBinDir,
  resolveDaemonServicePathDirs,
  resolveGatewayDevMode,
} from "./daemon-install-plan.shared.js";

describe("resolveGatewayDevMode", () => {
  it("detects src ts entrypoints", () => {
    expect(resolveGatewayDevMode(["node", "/Users/me/recall/src/cli/index.ts"])).toBe(true);
    expect(resolveGatewayDevMode(["node", "C:\\Users\\me\\recall\\src\\cli\\index.ts"])).toBe(
      true,
    );
    expect(resolveGatewayDevMode(["node", "/Users/me/recall/dist/cli/index.js"])).toBe(false);
  });
});

describe("resolveDaemonInstallRuntimeInputs", () => {
  it("keeps explicit devMode and nodePath overrides", async () => {
    await expect(
      resolveDaemonInstallRuntimeInputs({
        env: {},
        runtime: "node",
        devMode: false,
        nodePath: "/custom/node",
      }),
    ).resolves.toEqual({
      devMode: false,
      nodePath: "/custom/node",
    });
  });
});

describe("resolveDaemonNodeBinDir", () => {
  it("returns the absolute node bin directory", () => {
    expect(resolveDaemonNodeBinDir("/custom/node/bin/node")).toEqual(["/custom/node/bin"]);
  });

  it("ignores bare executable names", () => {
    expect(resolveDaemonNodeBinDir("node")).toBeUndefined();
  });
});

describe("resolveDaemonRecallBinDir", () => {
  it("uses the active recall command directory", () => {
    expect(
      resolveDaemonRecallBinDir({
        argv: ["node", "/Users/testuser/.npm-global/bin/recall", "gateway", "install"],
        env: { PATH: "" },
        platform: "darwin",
      }),
    ).toEqual(["/Users/testuser/.npm-global/bin"]);
  });

  it("finds the PATH shim that resolves to the active package entrypoint", () => {
    const realpaths = new Map([
      ["/Users/testuser/.npm-global/bin/recall", "/pkg/tryrecall/recall-agents.mjs"],
      [
        "/Users/testuser/.npm-global/lib/node_modules/tryrecall/recall-agents.mjs",
        "/pkg/tryrecall/recall-agents.mjs",
      ],
    ]);

    expect(
      resolveDaemonRecallBinDir({
        argv: [
          "node",
          "/Users/testuser/.npm-global/lib/node_modules/tryrecall/recall-agents.mjs",
          "gateway",
          "install",
        ],
        env: { PATH: "/Users/testuser/.npm-global/bin:/usr/bin" },
        platform: "darwin",
        existsSync: (candidate) => candidate === "/Users/testuser/.npm-global/bin/recall",
        realpathSync: (candidate) => realpaths.get(candidate) ?? candidate,
      }),
    ).toEqual(["/Users/testuser/.npm-global/bin"]);
  });

  it("ignores unrelated recall commands elsewhere on PATH", () => {
    expect(
      resolveDaemonRecallBinDir({
        argv: ["node", "/opt/tryrecall/recall-agents.mjs", "gateway", "install"],
        env: { PATH: "/Users/testuser/.npm-global/bin" },
        platform: "darwin",
        existsSync: () => true,
        realpathSync: (candidate) =>
          candidate === "/Users/testuser/.npm-global/bin/recall"
            ? "/other/recall.mjs"
            : candidate,
      }),
    ).toBeUndefined();
  });
});

describe("resolveDaemonServicePathDirs", () => {
  it("combines node and active recall command directories", () => {
    expect(
      resolveDaemonServicePathDirs({
        nodePath: "/opt/homebrew/opt/node/bin/node",
        argv: ["node", "/Users/testuser/.npm-global/bin/recall", "gateway", "install"],
        env: { PATH: "" },
        platform: "darwin",
      }),
    ).toEqual(["/opt/homebrew/opt/node/bin", "/Users/testuser/.npm-global/bin"]);
  });
});
