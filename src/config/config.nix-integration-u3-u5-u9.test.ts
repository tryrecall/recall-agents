// Covers Nix integration config compatibility scenarios U3, U5, and U9.
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  DEFAULT_GATEWAY_PORT,
  resolveConfigPathCandidate,
  resolveGatewayPort,
  resolveIsNixMode,
  resolveStateDir,
} from "./config.js";
import { withTempHome } from "./test-helpers.js";

vi.unmock("../version.js");

function envWith(overrides: Record<string, string | undefined>): NodeJS.ProcessEnv {
  // Hermetic env: don't inherit process.env because other tests may mutate it.
  return { ...overrides };
}

describe("Nix integration (U3, U5, U9)", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("U3: isNixMode env var detection", () => {
    it("isNixMode is false when STEELENGINE_NIX_MODE is not set", () => {
      expect(resolveIsNixMode(envWith({ STEELENGINE_NIX_MODE: undefined }))).toBe(false);
    });

    it("isNixMode is false when STEELENGINE_NIX_MODE is empty", () => {
      expect(resolveIsNixMode(envWith({ STEELENGINE_NIX_MODE: "" }))).toBe(false);
    });

    it("isNixMode is false when STEELENGINE_NIX_MODE is not '1'", () => {
      expect(resolveIsNixMode(envWith({ STEELENGINE_NIX_MODE: "true" }))).toBe(false);
    });

    it("isNixMode is true when STEELENGINE_NIX_MODE=1", () => {
      expect(resolveIsNixMode(envWith({ STEELENGINE_NIX_MODE: "1" }))).toBe(true);
    });
  });

  describe("U5: CONFIG_PATH and STATE_DIR env var overrides", () => {
    it("STATE_DIR defaults to ~/.steelengine when env not set", () => {
      expect(resolveStateDir(envWith({ STEELENGINE_STATE_DIR: undefined }))).toMatch(/\.steelengine$/);
    });

    it("STATE_DIR respects STEELENGINE_STATE_DIR override", () => {
      expect(resolveStateDir(envWith({ STEELENGINE_STATE_DIR: "/custom/state/dir" }))).toBe(
        path.resolve("/custom/state/dir"),
      );
    });

    it("STATE_DIR respects STEELENGINE_HOME when state override is unset", () => {
      const customHome = path.join(path.sep, "custom", "home");
      expect(
        resolveStateDir(envWith({ STEELENGINE_HOME: customHome, STEELENGINE_STATE_DIR: undefined })),
      ).toBe(path.join(path.resolve(customHome), ".steelengine"));
    });

    it("CONFIG_PATH defaults to STEELENGINE_HOME/.steelengine/steelengine.json", () => {
      const customHome = path.join(path.sep, "custom", "home");
      expect(
        resolveConfigPathCandidate(
          envWith({
            STEELENGINE_HOME: customHome,
            STEELENGINE_CONFIG_PATH: undefined,
            STEELENGINE_STATE_DIR: undefined,
          }),
        ),
      ).toBe(path.join(path.resolve(customHome), ".steelengine", "steelengine.json"));
    });

    it("CONFIG_PATH defaults to ~/.steelengine/steelengine.json when env not set", () => {
      expect(
        resolveConfigPathCandidate(
          envWith({ STEELENGINE_CONFIG_PATH: undefined, STEELENGINE_STATE_DIR: undefined }),
        ),
      ).toMatch(/\.steelengine[\\/]steelengine\.json$/);
    });

    it("CONFIG_PATH respects STEELENGINE_CONFIG_PATH override", () => {
      expect(
        resolveConfigPathCandidate(
          envWith({ STEELENGINE_CONFIG_PATH: "/nix/store/abc/steelengine.json" }),
        ),
      ).toBe(path.resolve("/nix/store/abc/steelengine.json"));
    });

    it("CONFIG_PATH expands ~ in STEELENGINE_CONFIG_PATH override", async () => {
      await withTempHome(async (home) => {
        expect(
          resolveConfigPathCandidate(
            envWith({ STEELENGINE_HOME: home, STEELENGINE_CONFIG_PATH: "~/.steelengine/custom.json" }),
            () => home,
          ),
        ).toBe(path.join(home, ".steelengine", "custom.json"));
      });
    });

    it("CONFIG_PATH uses STATE_DIR when only state dir is overridden", () => {
      expect(
        resolveConfigPathCandidate(
          envWith({ STEELENGINE_STATE_DIR: "/custom/state", STEELENGINE_TEST_FAST: "1" }),
          () => path.join(path.sep, "tmp", "steelengine-config-home"),
        ),
      ).toBe(path.join(path.resolve("/custom/state"), "steelengine.json"));
    });
  });

  describe("U6: gateway port resolution", () => {
    it("uses default when env and config are unset", () => {
      expect(resolveGatewayPort({}, envWith({ STEELENGINE_GATEWAY_PORT: undefined }))).toBe(
        DEFAULT_GATEWAY_PORT,
      );
    });

    it("prefers STEELENGINE_GATEWAY_PORT over config", () => {
      expect(
        resolveGatewayPort(
          { gateway: { port: 19002 } },
          envWith({ STEELENGINE_GATEWAY_PORT: "19001" }),
        ),
      ).toBe(19001);
    });

    it("falls back to config when env is invalid", () => {
      expect(
        resolveGatewayPort(
          { gateway: { port: 19003 } },
          envWith({ STEELENGINE_GATEWAY_PORT: "nope" }),
        ),
      ).toBe(19003);
    });
  });
});
