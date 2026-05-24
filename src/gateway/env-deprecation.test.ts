import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  resetLegacyRecallEnvWarningForTest,
  warnLegacyRecallEnvVars,
} from "./env-deprecation.js";

describe("warnLegacyRecallEnvVars", () => {
  const originalNodeEnv = process.env.NODE_ENV;
  const originalVitest = process.env.VITEST;
  let emitWarning: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    resetLegacyRecallEnvWarningForTest();
    emitWarning = vi.spyOn(process, "emitWarning").mockImplementation(() => {});
    delete process.env.NODE_ENV;
    delete process.env.VITEST;
  });

  afterEach(() => {
    emitWarning.mockRestore();
    resetLegacyRecallEnvWarningForTest();
    restoreEnv("NODE_ENV", originalNodeEnv);
    restoreEnv("VITEST", originalVitest);
  });

  it("warns with counts and prefixes instead of secret-shaped env names", () => {
    warnLegacyRecallEnvVars({
      CLAWDBOT_GATEWAY_TOKEN: "old-token",
      MOLTBOT_GATEWAY_PASSWORD: "old-password", // pragma: allowlist secret
      "CLAWDBOT_MALICIOUS\nforged": "old-value",
    });

    expect(emitWarning).toHaveBeenCalledOnce();
    const [message, options] = emitWarning.mock.calls.at(0) as [
      string,
      { code: string; type: string },
    ];
    expect(message).toContain("Legacy CLAWDBOT_*, MOLTBOT_* environment variables");
    expect(message).toContain("3 total");
    expect(message).toContain("replacing the legacy prefix with RECALL_");
    expect(message).not.toContain("GATEWAY_TOKEN");
    expect(message).not.toContain("GATEWAY_PASSWORD");
    expect(message).not.toContain("forged");
    expect(options).toEqual({
      code: "RECALL_LEGACY_ENV_VARS",
      type: "DeprecationWarning",
    });
  });

  it("does not warn for current OPENCLAW names", () => {
    warnLegacyRecallEnvVars({ RECALL_GATEWAY_TOKEN: "token" });

    expect(emitWarning).not.toHaveBeenCalled();
  });

  it("warns only once after a successful emit", () => {
    warnLegacyRecallEnvVars({ CLAWDBOT_GATEWAY_TOKEN: "old-token" });
    warnLegacyRecallEnvVars({ MOLTBOT_GATEWAY_TOKEN: "old-token" });

    expect(emitWarning).toHaveBeenCalledOnce();
  });

  it("retries if emitWarning throws before the warning is emitted", () => {
    emitWarning
      .mockImplementationOnce(() => {
        throw new Error("warning sink failed");
      })
      .mockImplementationOnce(() => {});

    expect(() => warnLegacyRecallEnvVars({ CLAWDBOT_GATEWAY_TOKEN: "old-token" })).toThrow(
      "warning sink failed",
    );
    warnLegacyRecallEnvVars({ CLAWDBOT_GATEWAY_TOKEN: "old-token" });

    expect(emitWarning).toHaveBeenCalledTimes(2);
  });

  it("suppresses warning noise based on the passed env", () => {
    warnLegacyRecallEnvVars({
      CLAWDBOT_GATEWAY_TOKEN: "old-token",
      VITEST: "true",
    });

    expect(emitWarning).not.toHaveBeenCalled();
  });

  it("does not let process.env test flags suppress a synthetic env", () => {
    process.env.VITEST = "true";

    warnLegacyRecallEnvVars({ CLAWDBOT_GATEWAY_TOKEN: "old-token" });

    expect(emitWarning).toHaveBeenCalledOnce();
  });
});

function restoreEnv(name: string, value: string | undefined): void {
  if (value === undefined) {
    delete process.env[name];
    return;
  }
  process.env[name] = value;
}
