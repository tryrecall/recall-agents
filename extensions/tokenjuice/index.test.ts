import fs from "node:fs";
import { createTestPluginApi } from "recall/plugin-sdk/plugin-test-api";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { tokenjuiceFactory, createTokenjuiceRecallEmbeddedExtension } = vi.hoisted(() => {
  const tokenjuiceFactory = vi.fn();
  const createTokenjuiceRecallEmbeddedExtension = vi.fn(() => tokenjuiceFactory);
  return {
    tokenjuiceFactory,
    createTokenjuiceRecallEmbeddedExtension,
  };
});

vi.mock("./runtime-api.js", () => ({
  createTokenjuiceRecallEmbeddedExtension,
}));

import plugin from "./index.js";

describe("tokenjuice bundled plugin", () => {
  beforeEach(() => {
    createTokenjuiceRecallEmbeddedExtension.mockClear();
    tokenjuiceFactory.mockClear();
  });

  it("is opt-in by default", () => {
    const manifest = JSON.parse(
      fs.readFileSync(new URL("./recall.plugin.json", import.meta.url), "utf8"),
    ) as { enabledByDefault?: unknown };

    expect(manifest.enabledByDefault).toBeUndefined();
  });

  it("registers tokenjuice tool result middleware for Pi and Codex runtimes", () => {
    const registerAgentToolResultMiddleware = vi.fn();

    plugin.register(
      createTestPluginApi({
        id: "tokenjuice",
        name: "tokenjuice",
        source: "test",
        config: {},
        pluginConfig: {},
        runtime: {} as never,
        registerAgentToolResultMiddleware,
      }),
    );

    expect(createTokenjuiceRecallEmbeddedExtension).toHaveBeenCalledTimes(1);
    expect(tokenjuiceFactory).toHaveBeenCalledTimes(1);
    const registration = registerAgentToolResultMiddleware.mock.calls[0];
    expect(typeof registration?.[0]).toBe("function");
    expect(registration?.[1]).toEqual({ runtimes: ["pi", "codex"] });
  });
});
