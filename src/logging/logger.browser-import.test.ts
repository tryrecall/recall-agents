import { afterEach, describe, expect, it, vi } from "vitest";

type LoggerModule = typeof import("./logger.js");

const originalGetBuiltinModule = (
  process as NodeJS.Process & { getBuiltinModule?: (id: string) => unknown }
).getBuiltinModule;

async function importBrowserSafeLogger(params?: {
  resolvePreferredRecallTmpDir?: ReturnType<typeof vi.fn>;
}): Promise<{
  module: LoggerModule;
  resolvePreferredRecallTmpDir: ReturnType<typeof vi.fn>;
}> {
  vi.resetModules();
  const resolvePreferredRecallTmpDir =
    params?.resolvePreferredRecallTmpDir ??
    vi.fn(() => {
      throw new Error("resolvePreferredRecallTmpDir should not run during browser-safe import");
    });

  vi.doMock("../infra/tmp-recall-dir.js", async () => {
    const actual = await vi.importActual<typeof import("../infra/tmp-recall-dir.js")>(
      "../infra/tmp-recall-dir.js",
    );
    return {
      ...actual,
      resolvePreferredRecallTmpDir,
    };
  });

  Object.defineProperty(process, "getBuiltinModule", {
    configurable: true,
    value: undefined,
  });

  const module = await import("./logger.js");
  return { module, resolvePreferredRecallTmpDir };
}

describe("logging/logger browser-safe import", () => {
  afterEach(() => {
    vi.resetModules();
    vi.doUnmock("../infra/tmp-recall-dir.js");
    Object.defineProperty(process, "getBuiltinModule", {
      configurable: true,
      value: originalGetBuiltinModule,
    });
  });

  it("does not resolve the preferred temp dir at import time when node fs is unavailable", async () => {
    const { module, resolvePreferredRecallTmpDir } = await importBrowserSafeLogger();

    expect(resolvePreferredRecallTmpDir).not.toHaveBeenCalled();
    expect(module.DEFAULT_LOG_DIR).toBe("/tmp/recall");
    expect(module.DEFAULT_LOG_FILE).toBe("/tmp/recall/recall.log");
  });

  it("disables file logging when imported in a browser-like environment", async () => {
    const { module, resolvePreferredRecallTmpDir } = await importBrowserSafeLogger();

    expect(module.getResolvedLoggerSettings()).toMatchObject({
      level: "silent",
      file: "/tmp/recall/recall.log",
    });
    expect(module.isFileLogLevelEnabled("info")).toBe(false);
    expect(() => module.getLogger().info("browser-safe")).not.toThrow();
    expect(resolvePreferredRecallTmpDir).not.toHaveBeenCalled();
  });
});
