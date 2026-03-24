import { describe, expect, it } from "vitest";
import { buildPlatformRuntimeLogHints, buildPlatformServiceStartHints } from "./runtime-hints.js";

describe("buildPlatformRuntimeLogHints", () => {
  it("renders launchd log hints on darwin", () => {
    expect(
      buildPlatformRuntimeLogHints({
        platform: "darwin",
        env: {
          RECALL_STATE_DIR: "/tmp/recall-state",
          RECALL_LOG_PREFIX: "gateway",
        },
        systemdServiceName: "recall-gateway",
        windowsTaskName: "Recall Gateway",
      }),
    ).toEqual([
      "Launchd stdout (if installed): /tmp/recall-state/logs/gateway.log",
      "Launchd stderr (if installed): /tmp/recall-state/logs/gateway.err.log",
    ]);
  });

  it("renders systemd and windows hints by platform", () => {
    expect(
      buildPlatformRuntimeLogHints({
        platform: "linux",
        systemdServiceName: "recall-gateway",
        windowsTaskName: "Recall Gateway",
      }),
    ).toEqual(["Logs: journalctl --user -u recall-gateway.service -n 200 --no-pager"]);
    expect(
      buildPlatformRuntimeLogHints({
        platform: "win32",
        systemdServiceName: "recall-gateway",
        windowsTaskName: "Recall Gateway",
      }),
    ).toEqual(['Logs: schtasks /Query /TN "Recall Gateway" /V /FO LIST']);
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
