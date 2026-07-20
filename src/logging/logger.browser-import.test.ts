// Logger browser import tests cover safe import behavior in browser-like runtimes.
import { importFreshModule } from "steelengine/plugin-sdk/test-fixtures";
import { afterEach, describe, expect, it, vi } from "vitest";

type LoggerModule = typeof import("./logger.js");

const originalGetBuiltinModule = (
  process as NodeJS.Process & { getBuiltinModule?: (id: string) => unknown }
).getBuiltinModule;

async function importBrowserSafeLogger(params?: {
  resolvePreferredSteelEngineTmpDir?: ReturnType<typeof vi.fn>;
}): Promise<{
  module: LoggerModule;
  resolvePreferredSteelEngineTmpDir: ReturnType<typeof vi.fn>;
}> {
  const resolvePreferredSteelEngineTmpDir =
    params?.resolvePreferredSteelEngineTmpDir ??
    vi.fn(() => {
      throw new Error("resolvePreferredSteelEngineTmpDir should not run during browser-safe import");
    });

  vi.doMock("../infra/tmp-steelengine-dir.js", async () => {
    const actual = await vi.importActual<typeof import("../infra/tmp-steelengine-dir.js")>(
      "../infra/tmp-steelengine-dir.js",
    );
    return {
      ...actual,
      resolvePreferredSteelEngineTmpDir,
    };
  });

  Object.defineProperty(process, "getBuiltinModule", {
    configurable: true,
    value: undefined,
  });

  const module = await importFreshModule<LoggerModule>(
    import.meta.url,
    "./logger.js?scope=browser-safe",
  );
  return { module, resolvePreferredSteelEngineTmpDir };
}

describe("logging/logger browser-safe import", () => {
  afterEach(() => {
    vi.doUnmock("../infra/tmp-steelengine-dir.js");
    Object.defineProperty(process, "getBuiltinModule", {
      configurable: true,
      value: originalGetBuiltinModule,
    });
  });

  it("does not resolve the preferred temp dir at import time when node fs is unavailable", async () => {
    const { module, resolvePreferredSteelEngineTmpDir } = await importBrowserSafeLogger();

    expect(resolvePreferredSteelEngineTmpDir).not.toHaveBeenCalled();
    expect(module.DEFAULT_LOG_DIR).toBe("/tmp/steelengine");
    expect(module.DEFAULT_LOG_FILE).toBe("/tmp/steelengine/steelengine.log");
  });

  it("disables file logging when imported in a browser-like environment", async () => {
    const { module, resolvePreferredSteelEngineTmpDir } = await importBrowserSafeLogger();

    expect(module.getResolvedLoggerSettings()).toStrictEqual({
      level: "silent",
      file: "/tmp/steelengine/steelengine.log",
      maxFileBytes: 100 * 1024 * 1024,
    });
    expect(module.isFileLogLevelEnabled("info")).toBe(false);
    expect(module.getLogger().info("browser-safe")).toBeUndefined();
    expect(resolvePreferredSteelEngineTmpDir).not.toHaveBeenCalled();
  });
});
