// Daemon runtime hint tests cover platform-specific daemon guidance.
import { describe, expect, it } from "vitest";
import { buildPlatformRuntimeLogHints, buildPlatformServiceStartHints } from "./runtime-hints.js";

describe("buildPlatformRuntimeLogHints", () => {
  it("renders launchd log hints on darwin", () => {
    expect(
      buildPlatformRuntimeLogHints({
        platform: "darwin",
        env: {
          HOME: "/Users/test",
          STEELENGINE_STATE_DIR: "/tmp/steelengine-state",
          STEELENGINE_LOG_PREFIX: "gateway",
        },
        systemdServiceName: "steelengine-gateway",
        windowsTaskName: "SteelEngine Gateway",
      }),
    ).toEqual([
      "Launchd stdout (if installed): /Users/test/Library/Logs/steelengine/gateway.log",
      "Launchd stderr (if installed): suppressed",
      "Restart attempts: /tmp/steelengine-state/logs/gateway-restart.log",
    ]);
  });

  it("renders systemd and windows hints by platform", () => {
    expect(
      buildPlatformRuntimeLogHints({
        platform: "linux",
        env: {
          STEELENGINE_STATE_DIR: "/tmp/steelengine-state",
        },
        systemdServiceName: "steelengine-gateway",
        windowsTaskName: "SteelEngine Gateway",
      }),
    ).toEqual([
      "Logs: journalctl --user -u steelengine-gateway.service -n 200 --no-pager",
      "Restart attempts: /tmp/steelengine-state/logs/gateway-restart.log",
    ]);
    expect(
      buildPlatformRuntimeLogHints({
        platform: "win32",
        env: {
          STEELENGINE_STATE_DIR: "/tmp/steelengine-state",
        },
        systemdServiceName: "steelengine-gateway",
        windowsTaskName: "SteelEngine Gateway",
      }),
    ).toEqual([
      'Logs: schtasks /Query /TN "SteelEngine Gateway" /V /FO LIST',
      "Restart attempts: /tmp/steelengine-state/logs/gateway-restart.log",
    ]);
  });
});

describe("buildPlatformServiceStartHints", () => {
  it("builds platform-specific service start hints", () => {
    expect(
      buildPlatformServiceStartHints({
        platform: "darwin",
        installCommand: "steelengine gateway install",
        startCommand: "steelengine gateway",
        launchAgentPlistPath: "~/Library/LaunchAgents/com.steelengine.gateway.plist",
        systemdServiceName: "steelengine-gateway",
        windowsTaskName: "SteelEngine Gateway",
      }),
    ).toEqual([
      "steelengine gateway install",
      "steelengine gateway",
      "launchctl bootstrap gui/$UID ~/Library/LaunchAgents/com.steelengine.gateway.plist",
    ]);
    expect(
      buildPlatformServiceStartHints({
        platform: "linux",
        installCommand: "steelengine gateway install",
        startCommand: "steelengine gateway",
        launchAgentPlistPath: "~/Library/LaunchAgents/com.steelengine.gateway.plist",
        systemdServiceName: "steelengine-gateway",
        windowsTaskName: "SteelEngine Gateway",
      }),
    ).toEqual([
      "steelengine gateway install",
      "steelengine gateway",
      "systemctl --user start steelengine-gateway.service",
    ]);
  });
});
