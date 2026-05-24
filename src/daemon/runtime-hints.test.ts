import { describe, expect, it } from "vitest";
import { buildPlatformRuntimeLogHints, buildPlatformServiceStartHints } from "./runtime-hints.js";

describe("buildPlatformRuntimeLogHints", () => {
  it("renders launchd log hints on darwin", () => {
    expect(
      buildPlatformRuntimeLogHints({
        platform: "darwin",
        env: {
          HOME: "/Users/test",
          RECALL_STATE_DIR: "/tmp/recall-state",
          RECALL_LOG_PREFIX: "gateway",
        },
        systemdServiceName: "recall-gateway",
        windowsTaskName: "Recall Gateway",
      }),
    ).toEqual([
      "Launchd stdout (if installed): /Users/test/Library/Logs/recall/gateway.log",
      "Launchd stderr (if installed): suppressed",
      "Restart attempts: /tmp/recall-state/logs/gateway-restart.log",
    ]);
  });

  it("renders systemd and windows hints by platform", () => {
    expect(
      buildPlatformRuntimeLogHints({
        platform: "linux",
        env: {
          RECALL_STATE_DIR: "/tmp/recall-state",
        },
        systemdServiceName: "recall-gateway",
        windowsTaskName: "Recall Gateway",
      }),
    ).toEqual([
      "Logs: journalctl --user -u recall-gateway.service -n 200 --no-pager",
      "Restart attempts: /tmp/recall-state/logs/gateway-restart.log",
    ]);
    expect(
      buildPlatformRuntimeLogHints({
        platform: "win32",
        env: {
          RECALL_STATE_DIR: "/tmp/recall-state",
        },
        systemdServiceName: "recall-gateway",
        windowsTaskName: "Recall Gateway",
      }),
    ).toEqual([
      'Logs: schtasks /Query /TN "Recall Gateway" /V /FO LIST',
      "Restart attempts: /tmp/recall-state/logs/gateway-restart.log",
    ]);
  });
});

describe("buildPlatformServiceStartHints", () => {
  it("builds platform-specific service start hints", () => {
    expect(
      buildPlatformServiceStartHints({
        platform: "darwin",
        installCommand: "recall gateway install",
        startCommand: "recall gateway",
        launchAgentPlistPath: "~/Library/LaunchAgents/com.recall.gateway.plist",
        systemdServiceName: "recall-gateway",
        windowsTaskName: "Recall Gateway",
      }),
    ).toEqual([
      "recall gateway install",
      "recall gateway",
      "launchctl bootstrap gui/$UID ~/Library/LaunchAgents/com.recall.gateway.plist",
    ]);
    expect(
      buildPlatformServiceStartHints({
        platform: "linux",
        installCommand: "recall gateway install",
        startCommand: "recall gateway",
        launchAgentPlistPath: "~/Library/LaunchAgents/com.recall.gateway.plist",
        systemdServiceName: "recall-gateway",
        windowsTaskName: "Recall Gateway",
      }),
    ).toEqual([
      "recall gateway install",
      "recall gateway",
      "systemctl --user start recall-gateway.service",
    ]);
  });
});
