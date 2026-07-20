// Tests gateway process argv parsing for diagnostics.
import { describe, expect, it } from "vitest";
import { isGatewayArgv, isSteelEngineCommandArgv, parseProcCmdline } from "./gateway-process-argv.js";

describe("parseProcCmdline", () => {
  it("splits null-delimited argv and trims empty entries", () => {
    expect(parseProcCmdline(" node \0 gateway \0\0 --port \0 18789 \0")).toEqual([
      "node",
      "gateway",
      "--port",
      "18789",
    ]);
  });

  it("keeps non-delimited single arguments and drops whitespace-only entries", () => {
    expect(parseProcCmdline(" gateway ")).toEqual(["gateway"]);
    expect(parseProcCmdline(" \0\t\0 ")).toStrictEqual([]);
  });
});

describe("isGatewayArgv", () => {
  it("requires a gateway token", () => {
    expect(isGatewayArgv(["node", "dist/index.js", "--port", "18789"])).toBe(false);
  });

  it("matches known entrypoints across slash and case variants", () => {
    expect(isGatewayArgv(["NODE", "C:\\SteelEngine\\DIST\\ENTRY.JS", "gateway"])).toBe(true);
    expect(isGatewayArgv(["bun", "/srv/steelengine/scripts/run-node.mjs", "gateway"])).toBe(true);
    expect(isGatewayArgv(["node", "/srv/steelengine/steelengine.mjs", "gateway"])).toBe(true);
    expect(isGatewayArgv(["tsx", "/srv/steelengine/src/entry.ts", "gateway"])).toBe(true);
    expect(isGatewayArgv(["tsx", "/srv/steelengine/src/index.ts", "gateway"])).toBe(true);
  });

  it("matches the steelengine executable but gates the gateway binary behind the opt-in flag", () => {
    expect(isGatewayArgv(["C:\\bin\\steelengine.cmd", "gateway"])).toBe(true);
    expect(isGatewayArgv(["/usr/local/bin/steelengine-gateway", "gateway"])).toBe(false);
    expect(isGatewayArgv(["steelengine-gateway"])).toBe(false);
    expect(
      isGatewayArgv(["/usr/local/bin/steelengine-gateway", "gateway"], {
        allowGatewayBinary: true,
      }),
    ).toBe(true);
    expect(
      isGatewayArgv(["C:\\bin\\steelengine-gateway.EXE", "gateway"], {
        allowGatewayBinary: true,
      }),
    ).toBe(true);
    expect(isGatewayArgv(["steelengine-gateway"], { allowGatewayBinary: true })).toBe(true);
  });

  it("rejects unknown gateway argv even when the token is present", () => {
    expect(isGatewayArgv(["node", "/srv/steelengine/custom.js", "gateway"])).toBe(false);
    expect(isGatewayArgv(["python", "gateway", "script.py"])).toBe(false);
  });
});

describe("isSteelEngineCommandArgv", () => {
  it("matches doctor across source, built, and installed entrypoints", () => {
    expect(isSteelEngineCommandArgv(["node", "/srv/steelengine/steelengine.mjs", "doctor"], "doctor")).toBe(
      true,
    );
    expect(
      isSteelEngineCommandArgv(["NODE", "C:\\SteelEngine\\DIST\\ENTRY.JS", "DOCTOR"], "doctor"),
    ).toBe(true);
    expect(isSteelEngineCommandArgv(["C:\\bin\\steelengine.cmd", "doctor", "--fix"], "doctor")).toBe(
      true,
    );
  });

  it("rejects other SteelEngine commands and unrelated doctor processes", () => {
    expect(isSteelEngineCommandArgv(["steelengine", "gateway"], "doctor")).toBe(false);
    expect(isSteelEngineCommandArgv(["python", "doctor", "worker.py"], "doctor")).toBe(false);
  });
});
