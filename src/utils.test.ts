import fs from "node:fs";
import path from "node:path";
import { describe, expect, it, vi } from "vitest";
import { withTempDir } from "./test-helpers/temp-dir.js";
import {
  ensureDir,
  resolveConfigDir,
  resolveHomeDir,
  resolveUserPath,
  shortenHomeInString,
  shortenHomePath,
  sleep,
} from "./utils.js";

describe("ensureDir", () => {
  it("creates nested directory", async () => {
    await withTempDir({ prefix: "recall-test-" }, async (tmp) => {
      const target = path.join(tmp, "nested", "dir");
      await ensureDir(target);
      expect(fs.existsSync(target)).toBe(true);
    });
  });
});

describe("sleep", () => {
  it("resolves after delay using fake timers", async () => {
    vi.useFakeTimers();
    try {
      const promise = sleep(1000);
      vi.advanceTimersByTime(1000);
      await expect(promise).resolves.toBeUndefined();
    } finally {
      vi.useRealTimers();
    }
  });
});

describe("resolveConfigDir", () => {
  it("prefers ~/.recall when legacy dir is missing", async () => {
    await withTempDir({ prefix: "recall-config-dir-" }, async (root) => {
      const newDir = path.join(root, ".recall");
      await fs.promises.mkdir(newDir, { recursive: true });
      const resolved = resolveConfigDir({} as NodeJS.ProcessEnv, () => root);
      expect(resolved).toBe(newDir);
    });
  });

  it("expands RECALL_STATE_DIR using the provided env", () => {
    const env = {
      HOME: "/tmp/recall-home",
      RECALL_STATE_DIR: "~/state",
    } as NodeJS.ProcessEnv;

    expect(resolveConfigDir(env)).toBe(path.resolve("/tmp/recall-home", "state"));
  });

  it("falls back to the config file directory when only RECALL_CONFIG_PATH is set", () => {
    const env = {
      HOME: "/tmp/recall-home",
      RECALL_CONFIG_PATH: "~/profiles/dev/recall.json",
    } as NodeJS.ProcessEnv;

    expect(resolveConfigDir(env)).toBe(path.resolve("/tmp/recall-home", "profiles", "dev"));
  });
});

describe("resolveHomeDir", () => {
  it("prefers RECALL_HOME over HOME", () => {
    vi.stubEnv("RECALL_HOME", "/srv/recall-home");
    vi.stubEnv("HOME", "/home/other");
    try {
      expect(resolveHomeDir()).toBe(path.resolve("/srv/recall-home"));
    } finally {
      vi.unstubAllEnvs();
    }
  });
});

describe("shortenHomePath", () => {
  it("uses $RECALL_HOME prefix when RECALL_HOME is set", () => {
    vi.stubEnv("RECALL_HOME", "/srv/recall-home");
    vi.stubEnv("HOME", "/home/other");
    try {
      expect(shortenHomePath(`${path.resolve("/srv/recall-home")}/.tryrecall/recall-agents.json`)).toBe(
        "$RECALL_HOME/.tryrecall/recall-agents.json",
      );
    } finally {
      vi.unstubAllEnvs();
    }
  });
});

describe("shortenHomeInString", () => {
  it("uses $RECALL_HOME replacement when RECALL_HOME is set", () => {
    vi.stubEnv("RECALL_HOME", "/srv/recall-home");
    vi.stubEnv("HOME", "/home/other");
    try {
      expect(
        shortenHomeInString(
          `config: ${path.resolve("/srv/recall-home")}/.tryrecall/recall-agents.json`,
        ),
      ).toBe("config: $RECALL_HOME/.tryrecall/recall-agents.json");
    } finally {
      vi.unstubAllEnvs();
    }
  });
});

describe("resolveUserPath", () => {
  it("expands ~ to home dir", () => {
    expect(resolveUserPath("~", {}, () => "/Users/thoffman")).toBe(path.resolve("/Users/thoffman"));
  });

  it("expands ~/ to home dir", () => {
    expect(resolveUserPath("~/recall", {}, () => "/Users/thoffman")).toBe(
      path.resolve("/Users/thoffman", "recall"),
    );
  });

  it("resolves relative paths", () => {
    expect(resolveUserPath("tmp/dir")).toBe(path.resolve("tmp/dir"));
  });

  it("prefers RECALL_HOME for tilde expansion", () => {
    vi.stubEnv("RECALL_HOME", "/srv/recall-home");
    vi.stubEnv("HOME", "/home/other");
    try {
      expect(resolveUserPath("~/recall")).toBe(path.resolve("/srv/recall-home", "recall"));
    } finally {
      vi.unstubAllEnvs();
    }
  });

  it("uses the provided env for tilde expansion", () => {
    const env = {
      HOME: "/tmp/recall-home",
      RECALL_HOME: "/srv/recall-home",
    } as NodeJS.ProcessEnv;

    expect(resolveUserPath("~/recall", env)).toBe(path.resolve("/srv/recall-home", "recall"));
  });

  it("keeps blank paths blank", () => {
    expect(resolveUserPath("")).toBe("");
    expect(resolveUserPath("   ")).toBe("");
  });

  it("returns empty string for undefined/null input", () => {
    expect(resolveUserPath(undefined as unknown as string)).toBe("");
    expect(resolveUserPath(null as unknown as string)).toBe("");
  });
});
