// SteelEngine live rescue channel tests cover live-channel rescue message delivery.
import fs from "node:fs/promises";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import type { CommandContext } from "../auto-reply/reply/commands-types.js";
import { clearConfigCache } from "../config/config.js";
import type { SteelEngineConfig } from "../config/types.steelengine.js";
import { withTempDir } from "../test-helpers/temp-dir.js";
import { deleteTestEnvValue, setTestEnvValue } from "../test-utils/env.js";
import { runSystemAgentRescueMessage } from "./rescue-message.js";

const originalStateDir = process.env.STEELENGINE_STATE_DIR;
const originalConfigPath = process.env.STEELENGINE_CONFIG_PATH;

function truthy(value: string | undefined): boolean {
  return /^(1|true|yes|on)$/i.test(value?.trim() ?? "");
}

const runLive =
  truthy(process.env.STEELENGINE_LIVE_TEST) &&
  truthy(process.env.STEELENGINE_LIVE_SYSTEM_AGENT_RESCUE_CHANNEL);
const describeLive = runLive ? describe : describe.skip;

function commandContext(channel = process.env.STEELENGINE_LIVE_SYSTEM_AGENT_CHANNEL ?? "whatsapp") {
  return {
    surface: channel,
    channel,
    channelId: channel,
    ownerList: ["user:owner"],
    senderIsOwner: true,
    isAuthorizedSender: true,
    senderId: "user:owner",
    rawBodyNormalized: "/steelengine status",
    commandBodyNormalized: "/steelengine status",
    from: "user:owner",
    to: "account:default",
  } satisfies CommandContext;
}

async function runRescue(params: {
  commandBody: string;
  cfg: SteelEngineConfig;
  ctx?: CommandContext;
}) {
  const ctx = params.ctx ?? commandContext();
  return await runSystemAgentRescueMessage({
    cfg: params.cfg,
    command: { ...ctx, commandBodyNormalized: params.commandBody },
    commandBody: params.commandBody,
    isGroup: false,
  });
}

describeLive("SteelEngine live rescue channel smoke", () => {
  afterEach(() => {
    clearConfigCache();
    if (originalStateDir === undefined) {
      deleteTestEnvValue("STEELENGINE_STATE_DIR");
    } else {
      setTestEnvValue("STEELENGINE_STATE_DIR", originalStateDir);
    }
    if (originalConfigPath === undefined) {
      deleteTestEnvValue("STEELENGINE_CONFIG_PATH");
    } else {
      setTestEnvValue("STEELENGINE_CONFIG_PATH", originalConfigPath);
    }
  });

  it("handles /steelengine status and a persistent approval roundtrip", async () => {
    await withTempDir({ prefix: "steelengine-live-rescue-" }, async (tempDir) => {
      const configPath = path.join(tempDir, "steelengine.json");
      setTestEnvValue("STEELENGINE_STATE_DIR", tempDir);
      setTestEnvValue("STEELENGINE_CONFIG_PATH", configPath);
      await fs.writeFile(
        configPath,
        JSON.stringify(
          {
            meta: { lastTouchedVersion: "live-test", lastTouchedAt: new Date(0).toISOString() },
            agents: { defaults: {} },
            tools: { exec: { security: "full", ask: "off" } },
          },
          null,
          2,
        ),
      );

      const cfg: SteelEngineConfig = {
        systemAgent: { rescue: { enabled: true } },
        tools: { exec: { security: "full", ask: "off" } },
      };

      await expect(runRescue({ commandBody: "/steelengine status", cfg })).resolves.toContain(
        "[steelengine] done: status.check",
      );
      await expect(
        runRescue({ commandBody: "/steelengine set default model openai/gpt-5.5", cfg }),
      ).resolves.toContain("Reply /steelengine yes to apply");
      await expect(runRescue({ commandBody: "/steelengine yes", cfg })).resolves.toContain(
        "Default model: openai/gpt-5.5",
      );

      const config = JSON.parse(await fs.readFile(configPath, "utf8")) as SteelEngineConfig;
      const defaultModel = config.agents?.defaults?.model;
      if (!defaultModel || typeof defaultModel !== "object") {
        throw new Error("expected default model object");
      }
      expect(defaultModel.primary).toBe("openai/gpt-5.5");
      const auditPath = path.join(tempDir, "audit", "system-agent.jsonl");
      const auditLines = (await fs.readFile(auditPath, "utf8")).trim().split("\n");
      expect(auditLines.some((line) => line.includes('"operation":"config.setDefaultModel"'))).toBe(
        true,
      );
    });
  });
});
