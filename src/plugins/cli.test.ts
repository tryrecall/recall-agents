import { Command } from "commander";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { RecallConfig } from "../config/config.js";

const mocks = vi.hoisted(() => ({
  memoryRegister: vi.fn(),
  otherRegister: vi.fn(),
  loadRecallPlugins: vi.fn(),
}));

vi.mock("./loader.js", () => ({
  loadRecallPlugins: (...args: unknown[]) => mocks.loadRecallPlugins(...args),
}));

import { registerPluginCliCommands } from "./cli.js";

describe("registerPluginCliCommands", () => {
  beforeEach(() => {
    mocks.memoryRegister.mockClear();
    mocks.otherRegister.mockClear();
    mocks.loadRecallPlugins.mockReset();
    mocks.loadRecallPlugins.mockReturnValue({
      cliRegistrars: [
        {
          pluginId: "memory-core",
          register: mocks.memoryRegister,
          commands: ["memory"],
          source: "bundled",
        },
        {
          pluginId: "other",
          register: mocks.otherRegister,
          commands: ["other"],
          source: "bundled",
        },
      ],
    });
  });

  it("skips plugin CLI registrars when commands already exist", () => {
    const program = new Command();
    program.command("memory");

    // oxlint-disable-next-line typescript/no-explicit-any
    registerPluginCliCommands(program, {} as any);

    expect(mocks.memoryRegister).not.toHaveBeenCalled();
    expect(mocks.otherRegister).toHaveBeenCalledTimes(1);
  });

  it("forwards an explicit env to plugin loading", () => {
    const program = new Command();
    const env = { RECALL_HOME: "/srv/recall-home" } as NodeJS.ProcessEnv;

    registerPluginCliCommands(program, {} as RecallConfig, env);

    expect(mocks.loadRecallPlugins).toHaveBeenCalledWith(
      expect.objectContaining({
        env,
      }),
    );
  });
});
