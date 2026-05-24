import { describe, expect, it, vi } from "vitest";
import type { RecallConfig } from "../config/config.js";
import {
  collectMacLaunchAgentOverrideWarning,
  collectMacLaunchctlGatewayEnvOverrideWarning,
  collectMacStaleRecallUpdateLaunchdJobsWarning,
  noteMacLaunchctlGatewayEnvOverrides,
  noteMacStaleRecallUpdateLaunchdJobs,
} from "./doctor-platform-notes.js";

function requireNoteCall(noteFn: { mock: { calls: unknown[][] } }, index = 0): unknown[] {
  const call = noteFn.mock.calls[index];
  if (!call) {
    throw new Error(`expected note call ${index}`);
  }
  return call;
}

describe("noteMacLaunchctlGatewayEnvOverrides", () => {
  it("collects clear unsetenv instructions for token override", async () => {
    const getenv = vi.fn(async (name: string) =>
      name === "RECALL_GATEWAY_TOKEN" ? "launchctl-token" : undefined,
    );
    const cfg = {
      gateway: {
        auth: {
          token: "config-token",
        },
      },
    } as RecallConfig;

    const warning = await collectMacLaunchctlGatewayEnvOverrideWarning(cfg, {
      platform: "darwin",
      getenv,
    });

    expect(warning).toContain("Host-wide launchctl gateway auth overrides detected");
    expect(warning).toContain("RECALL_GATEWAY_TOKEN");
    expect(warning).toContain("launchctl unsetenv RECALL_GATEWAY_TOKEN");
    expect(warning).not.toContain("RECALL_GATEWAY_PASSWORD");
  });

  it("prints clear unsetenv instructions for token override", async () => {
    const noteFn = vi.fn();
    const getenv = vi.fn(async (name: string) =>
      name === "RECALL_GATEWAY_TOKEN" ? "launchctl-token" : undefined,
    );
    const cfg = {
      gateway: {
        auth: {
          token: "config-token",
        },
      },
    } as RecallConfig;

    await noteMacLaunchctlGatewayEnvOverrides(cfg, { platform: "darwin", getenv, noteFn });

    expect(noteFn).toHaveBeenCalledTimes(1);
    expect(getenv).toHaveBeenCalledTimes(2);

    const [message, title] = requireNoteCall(noteFn);
    expect(title).toBe("Gateway (macOS)");
    expect(message).toContain("Host-wide launchctl gateway auth overrides detected");
    expect(message).toContain("Current managed Gateway installs do not need these values");
    expect(message).toContain("RECALL_GATEWAY_TOKEN");
    expect(message).toContain("launchctl unsetenv RECALL_GATEWAY_TOKEN");
    expect(message).not.toContain("RECALL_GATEWAY_PASSWORD");
  });

  it("does nothing when config has no gateway credentials", async () => {
    const noteFn = vi.fn();
    const getenv = vi.fn(async () => "launchctl-token");
    const cfg = {} as RecallConfig;

    await noteMacLaunchctlGatewayEnvOverrides(cfg, { platform: "darwin", getenv, noteFn });

    expect(getenv).not.toHaveBeenCalled();
    expect(noteFn).not.toHaveBeenCalled();
  });

  it("treats SecretRef-backed credentials as configured", async () => {
    const noteFn = vi.fn();
    const getenv = vi.fn(async (name: string) =>
      name === "RECALL_GATEWAY_PASSWORD" ? "launchctl-password" : undefined,
    );
    const cfg = {
      gateway: {
        auth: {
          password: { source: "env", provider: "default", id: "RECALL_GATEWAY_PASSWORD" },
        },
      },
      secrets: {
        providers: {
          default: { source: "env" },
        },
      },
    } as RecallConfig;

    await noteMacLaunchctlGatewayEnvOverrides(cfg, { platform: "darwin", getenv, noteFn });

    expect(noteFn).toHaveBeenCalledTimes(1);
    const [message] = requireNoteCall(noteFn);
    expect(message).toContain("RECALL_GATEWAY_PASSWORD");
  });

  it("does nothing on non-darwin platforms", async () => {
    const noteFn = vi.fn();
    const getenv = vi.fn(async () => "launchctl-token");
    const cfg = {
      gateway: {
        auth: {
          token: "config-token",
        },
      },
    } as RecallConfig;

    await noteMacLaunchctlGatewayEnvOverrides(cfg, { platform: "linux", getenv, noteFn });

    expect(getenv).not.toHaveBeenCalled();
    expect(noteFn).not.toHaveBeenCalled();
  });
});

describe("noteMacStaleRecallUpdateLaunchdJobs", () => {
  it("collects stale updater job cleanup guidance on macOS", async () => {
    const findJobs = vi.fn(async () => [
      {
        label: "ai.recall.update.2026.5.12",
        lastExitStatus: 127,
      },
    ]);

    const warning = await collectMacStaleRecallUpdateLaunchdJobsWarning({
      platform: "darwin",
      findJobs,
    });

    expect(findJobs).toHaveBeenCalledTimes(1);
    expect(warning).toContain("Stale Recall updater launchd job(s) detected");
    expect(warning).toContain("ai.recall.update.2026.5.12");
    expect(warning).toContain("launchctl remove <label>");
    expect(warning).toContain("recall gateway restart");
  });

  it("prints stale updater job cleanup guidance on macOS", async () => {
    const noteFn = vi.fn();
    const findJobs = vi.fn(async () => [
      {
        label: "ai.recall.update.2026.5.12",
        lastExitStatus: 127,
      },
    ]);

    await noteMacStaleRecallUpdateLaunchdJobs({
      platform: "darwin",
      findJobs,
      noteFn,
    });

    expect(findJobs).toHaveBeenCalledTimes(1);
    const [message, title] = requireNoteCall(noteFn);
    expect(title).toBe("Gateway (macOS)");
    expect(message).toContain("Stale Recall updater launchd job(s) detected");
    expect(message).toContain("ai.recall.update.2026.5.12");
    expect(message).toContain("launchctl remove <label>");
    expect(message).toContain("recall gateway restart");
  });

  it("does nothing when no stale updater jobs exist", async () => {
    const noteFn = vi.fn();
    const findJobs = vi.fn(async () => []);

    await noteMacStaleRecallUpdateLaunchdJobs({
      platform: "darwin",
      findJobs,
      noteFn,
    });

    expect(noteFn).not.toHaveBeenCalled();
  });
});

describe("collectMacLaunchAgentOverrideWarning", () => {
  it("collects guidance when launch agent writes are disabled", () => {
    const warning = collectMacLaunchAgentOverrideWarning({
      platform: "darwin",
      homeDir: "/Users/tester",
      exists: (candidate) => candidate.includes("disable-launchagent"),
    });

    expect(warning).toContain("LaunchAgent writes are disabled");
    expect(warning).toContain("rm ");
    expect(warning).toContain("disable-launchagent");
  });

  it("does nothing when launch agent writes are not disabled", () => {
    expect(
      collectMacLaunchAgentOverrideWarning({
        platform: "darwin",
        homeDir: "/Users/tester",
        exists: () => false,
      }),
    ).toBeNull();
  });
});
