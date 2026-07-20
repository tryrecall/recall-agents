// Covers config path resolution across env, home, and agent roots.
import fs from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { withTempDir } from "../test-helpers/temp-dir.js";
import {
  CONFIG_PATH,
  DEFAULT_GATEWAY_PORT,
  isNixMode,
  normalizeStateDirEnv,
  pinRuntimePaths,
  resolveDefaultConfigCandidates,
  resolveConfigPathCandidate,
  resolveConfigPath,
  resolveGatewayPort,
  resolveIncludeRoots,
  resolveOAuthDir,
  resolveOAuthPath,
  resolveStateDir,
  STATE_DIR,
} from "./paths.js";

function envWith(overrides: Record<string, string | undefined>): NodeJS.ProcessEnv {
  return { ...overrides };
}

describe("oauth paths", () => {
  it("prefers STEELENGINE_OAUTH_DIR over STEELENGINE_STATE_DIR", () => {
    const env = {
      STEELENGINE_OAUTH_DIR: "/custom/oauth",
      STEELENGINE_STATE_DIR: "/custom/state",
    } as NodeJS.ProcessEnv;

    expect(resolveOAuthDir(env, "/custom/state")).toBe(path.resolve("/custom/oauth"));
    expect(resolveOAuthPath(env, "/custom/state")).toBe(
      path.join(path.resolve("/custom/oauth"), "oauth.json"),
    );
  });

  it("derives oauth path from STEELENGINE_STATE_DIR when unset", () => {
    const env = {
      STEELENGINE_STATE_DIR: "/custom/state",
    } as NodeJS.ProcessEnv;

    expect(resolveOAuthDir(env, "/custom/state")).toBe(path.join("/custom/state", "credentials"));
    expect(resolveOAuthPath(env, "/custom/state")).toBe(
      path.join("/custom/state", "credentials", "oauth.json"),
    );
  });
});

describe("gateway port resolution", () => {
  it("prefers numeric env values over config", () => {
    expect(
      resolveGatewayPort(
        { gateway: { port: 19002 } },
        envWith({ STEELENGINE_GATEWAY_PORT: "19001" }),
      ),
    ).toBe(19001);
  });

  it("accepts Compose-style IPv4 host publish values from env", () => {
    expect(
      resolveGatewayPort(
        { gateway: { port: 19002 } },
        envWith({ STEELENGINE_GATEWAY_PORT: "127.0.0.1:18789" }),
      ),
    ).toBe(18789);
  });

  it("accepts Compose-style IPv6 host publish values from env", () => {
    expect(
      resolveGatewayPort(
        { gateway: { port: 19002 } },
        envWith({ STEELENGINE_GATEWAY_PORT: "[::1]:28789" }),
      ),
    ).toBe(28789);
  });

  it("ignores the legacy env name and falls back to config", () => {
    expect(
      resolveGatewayPort(
        { gateway: { port: 19002 } },
        envWith({ CLAWDBOT_GATEWAY_PORT: "127.0.0.1:18789" }),
      ),
    ).toBe(19002);
  });

  it("falls back to config when the Compose-style suffix is invalid", () => {
    expect(
      resolveGatewayPort(
        { gateway: { port: 19003 } },
        envWith({ STEELENGINE_GATEWAY_PORT: "127.0.0.1:not-a-port" }),
      ),
    ).toBe(19003);
  });

  it("falls back to config when env ports exceed TCP bounds", () => {
    expect(
      resolveGatewayPort(
        { gateway: { port: 19003 } },
        envWith({ STEELENGINE_GATEWAY_PORT: "65536" }),
      ),
    ).toBe(19003);
    expect(
      resolveGatewayPort(
        { gateway: { port: 19004 } },
        envWith({ STEELENGINE_GATEWAY_PORT: "127.0.0.1:65536" }),
      ),
    ).toBe(19004);
    expect(
      resolveGatewayPort(
        { gateway: { port: 19005 } },
        envWith({ STEELENGINE_GATEWAY_PORT: "[::1]:65536" }),
      ),
    ).toBe(19005);
  });

  it("falls back when malformed IPv6 inputs do not provide an explicit port", () => {
    expect(
      resolveGatewayPort(
        { gateway: { port: 19003 } },
        envWith({ STEELENGINE_GATEWAY_PORT: "::1" }),
      ),
    ).toBe(19003);
    expect(resolveGatewayPort({}, envWith({ STEELENGINE_GATEWAY_PORT: "2001:db8::1" }))).toBe(
      DEFAULT_GATEWAY_PORT,
    );
  });

  it("falls back to the default port when env is invalid and config is unset", () => {
    expect(
      resolveGatewayPort({}, envWith({ STEELENGINE_GATEWAY_PORT: "127.0.0.1:not-a-port" })),
    ).toBe(DEFAULT_GATEWAY_PORT);
  });
});

describe("state + config path candidates", () => {
  function expectSteelEngineHomeDefaults(env: NodeJS.ProcessEnv): void {
    const configuredHome = env.STEELENGINE_HOME;
    if (!configuredHome) {
      throw new Error("STEELENGINE_HOME must be set for this assertion helper");
    }
    const resolvedHome = path.resolve(configuredHome);
    expect(resolveStateDir(env)).toBe(path.join(resolvedHome, ".steelengine"));

    const candidates = resolveDefaultConfigCandidates(env);
    expect(candidates[0]).toBe(path.join(resolvedHome, ".steelengine", "steelengine.json"));
  }

  it("uses STEELENGINE_STATE_DIR when set", () => {
    const env = {
      STEELENGINE_STATE_DIR: "/new/state",
    } as NodeJS.ProcessEnv;

    expect(resolveStateDir(env, () => "/home/test")).toBe(path.resolve("/new/state"));
  });

  it("normalizes relative STEELENGINE_STATE_DIR overrides to absolute paths", () => {
    const env = {
      STEELENGINE_STATE_DIR: ".",
      STEELENGINE_HOME: "/srv/steelengine-home",
    } as NodeJS.ProcessEnv;

    normalizeStateDirEnv(env);

    expect(env.STEELENGINE_STATE_DIR).toBe(path.resolve("."));
  });

  it("pins a relative state-dir override before later resolution", () => {
    const env = {
      STEELENGINE_STATE_DIR: "relative-state",
      STEELENGINE_HOME: "/srv/steelengine-home",
    } as NodeJS.ProcessEnv;

    normalizeStateDirEnv(env);
    const normalized = env.STEELENGINE_STATE_DIR;

    expect(normalized).toBe(path.resolve("relative-state"));
    expect(resolveStateDir(env, () => "/srv/other-home")).toBe(normalized);
  });

  it("re-pins exported runtime paths after startup environment selection", () => {
    const originalConfigPath = CONFIG_PATH;
    const originalNixMode = isNixMode;
    const originalStateDir = STATE_DIR;
    const selectedStateDir = path.resolve("/tmp/steelengine-selected-runtime-state");
    const selectedConfigPath = path.join(selectedStateDir, "selected.json");
    try {
      const pinned = pinRuntimePaths({
        STEELENGINE_CONFIG_PATH: selectedConfigPath,
        STEELENGINE_NIX_MODE: "1",
        STEELENGINE_STATE_DIR: selectedStateDir,
        STEELENGINE_TEST_FAST: "1",
      });

      expect(pinned).toEqual({
        configPath: selectedConfigPath,
        stateDir: selectedStateDir,
      });
      expect(CONFIG_PATH).toBe(selectedConfigPath);
      expect(isNixMode).toBe(true);
      expect(STATE_DIR).toBe(selectedStateDir);
    } finally {
      pinRuntimePaths({
        STEELENGINE_CONFIG_PATH: originalConfigPath,
        STEELENGINE_NIX_MODE: originalNixMode ? "1" : undefined,
        STEELENGINE_STATE_DIR: originalStateDir,
        STEELENGINE_TEST_FAST: "1",
      });
    }
  });

  it("uses STEELENGINE_HOME for default state/config locations", () => {
    const env = {
      STEELENGINE_HOME: "/srv/steelengine-home",
    } as NodeJS.ProcessEnv;
    expectSteelEngineHomeDefaults(env);
  });

  it("prefers STEELENGINE_HOME over HOME for default state/config locations", () => {
    const env = {
      STEELENGINE_HOME: "/srv/steelengine-home",
      HOME: "/home/other",
    } as NodeJS.ProcessEnv;
    expectSteelEngineHomeDefaults(env);
  });

  it("orders default config candidates in a stable order", () => {
    const home = "/home/test";
    const resolvedHome = path.resolve(home);
    const candidates = resolveDefaultConfigCandidates({} as NodeJS.ProcessEnv, () => home);
    const expected = [
      path.join(resolvedHome, ".steelengine", "steelengine.json"),
      path.join(resolvedHome, ".steelengine", "recall.json"),
      path.join(resolvedHome, ".steelengine", "openclaw.json"),
      path.join(resolvedHome, ".steelengine", "clawdbot.json"),
      path.join(resolvedHome, ".recall", "steelengine.json"),
      path.join(resolvedHome, ".recall", "recall.json"),
      path.join(resolvedHome, ".recall", "openclaw.json"),
      path.join(resolvedHome, ".recall", "clawdbot.json"),
      path.join(resolvedHome, ".openclaw", "steelengine.json"),
      path.join(resolvedHome, ".openclaw", "recall.json"),
      path.join(resolvedHome, ".openclaw", "openclaw.json"),
      path.join(resolvedHome, ".openclaw", "clawdbot.json"),
      path.join(resolvedHome, ".clawdbot", "steelengine.json"),
      path.join(resolvedHome, ".clawdbot", "recall.json"),
      path.join(resolvedHome, ".clawdbot", "openclaw.json"),
      path.join(resolvedHome, ".clawdbot", "clawdbot.json"),
    ];
    expect(candidates).toEqual(expected);
  });

  it("prefers ~/.steelengine when it exists and legacy dir is missing", async () => {
    await withTempDir({ prefix: "steelengine-state-" }, async (root) => {
      const newDir = path.join(root, ".steelengine");
      await fs.mkdir(newDir, { recursive: true });
      const resolved = resolveStateDir({} as NodeJS.ProcessEnv, () => root);
      expect(resolved).toBe(newDir);
    });
  });

  it("falls back to existing legacy state dir when ~/.steelengine is missing", async () => {
    await withTempDir({ prefix: "steelengine-state-legacy-" }, async (root) => {
      const legacyDir = path.join(root, ".clawdbot");
      await fs.mkdir(legacyDir, { recursive: true });
      const resolved = resolveStateDir({} as NodeJS.ProcessEnv, () => root);
      expect(resolved).toBe(legacyDir);
    });
  });

  it("prefers an existing Recall state dir over older legacy state dirs", async () => {
    await withTempDir({ prefix: "steelengine-state-recall-" }, async (root) => {
      const recallDir = path.join(root, ".recall");
      await fs.mkdir(recallDir, { recursive: true });
      await fs.mkdir(path.join(root, ".clawdbot"), { recursive: true });

      expect(resolveStateDir({} as NodeJS.ProcessEnv, () => root)).toBe(recallDir);
    });
  });

  it("prefers a configured upstream state dir over an unrelated empty Recall dir", async () => {
    await withTempDir({ prefix: "steelengine-state-upstream-" }, async (root) => {
      const recallDir = path.join(root, ".recall");
      const upstreamDir = path.join(root, ".openclaw");
      await fs.mkdir(recallDir, { recursive: true });
      await fs.mkdir(upstreamDir, { recursive: true });
      await fs.writeFile(path.join(upstreamDir, "openclaw.json"), "{}\n", "utf-8");

      expect(resolveStateDir({} as NodeJS.ProcessEnv, () => root)).toBe(upstreamDir);
      expect(resolveConfigPathCandidate({} as NodeJS.ProcessEnv, () => root)).toBe(
        path.join(upstreamDir, "openclaw.json"),
      );
    });
  });

  it("CONFIG_PATH prefers existing config when present", async () => {
    await withTempDir({ prefix: "steelengine-config-" }, async (root) => {
      const legacyDir = path.join(root, ".steelengine");
      await fs.mkdir(legacyDir, { recursive: true });
      const legacyPath = path.join(legacyDir, "steelengine.json");
      await fs.writeFile(legacyPath, "{}", "utf-8");

      const resolved = resolveConfigPathCandidate({} as NodeJS.ProcessEnv, () => root);
      expect(resolved).toBe(legacyPath);
    });
  });

  it("respects state dir overrides when config is missing", async () => {
    await withTempDir({ prefix: "steelengine-config-override-" }, async (root) => {
      const legacyDir = path.join(root, ".steelengine");
      await fs.mkdir(legacyDir, { recursive: true });
      const legacyConfig = path.join(legacyDir, "steelengine.json");
      await fs.writeFile(legacyConfig, "{}", "utf-8");

      const overrideDir = path.join(root, "override");
      const env = { STEELENGINE_STATE_DIR: overrideDir } as NodeJS.ProcessEnv;
      const resolved = resolveConfigPath(env, overrideDir, () => root);
      expect(resolved).toBe(path.join(overrideDir, "steelengine.json"));
    });
  });
});

describe("resolveIncludeRoots", () => {
  const HOME = path.parse(process.cwd()).root + "fakehome";

  it("returns an empty list when STEELENGINE_INCLUDE_ROOTS is unset or blank", () => {
    expect(resolveIncludeRoots(envWith({}), () => HOME)).toStrictEqual([]);
    expect(
      resolveIncludeRoots(envWith({ STEELENGINE_INCLUDE_ROOTS: "" }), () => HOME),
    ).toStrictEqual([]);
    expect(
      resolveIncludeRoots(envWith({ STEELENGINE_INCLUDE_ROOTS: "   " }), () => HOME),
    ).toStrictEqual([]);
  });

  it("splits on the platform path delimiter and resolves each entry to an absolute path", () => {
    const a = path.resolve(path.parse(process.cwd()).root, "shared", "a");
    const b = path.resolve(path.parse(process.cwd()).root, "shared", "b");
    const env = envWith({ STEELENGINE_INCLUDE_ROOTS: [a, b].join(path.delimiter) });
    expect(resolveIncludeRoots(env, () => HOME)).toEqual([a, b]);
  });

  it("expands a leading tilde in each entry using the resolved home dir", () => {
    const env = envWith({ STEELENGINE_INCLUDE_ROOTS: "~/share/steelengine" });
    expect(resolveIncludeRoots(env, () => HOME)).toEqual([path.join(HOME, "share", "steelengine")]);
  });

  it("drops empty entries and preserves de-duplicated order for repeated roots", () => {
    const a = path.resolve(path.parse(process.cwd()).root, "shared", "a");
    const env = envWith({
      STEELENGINE_INCLUDE_ROOTS: ["", a, "  ", a].join(path.delimiter),
    });
    expect(resolveIncludeRoots(env, () => HOME)).toEqual([a]);
  });
});
