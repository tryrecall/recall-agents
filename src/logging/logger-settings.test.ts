import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

let originalTestFileLog: string | undefined;
let originalRecallLogLevel: string | undefined;
let logging: typeof import("../logging.js");

beforeAll(async () => {
  logging = await import("../logging.js");
});

beforeEach(() => {
  originalTestFileLog = process.env.RECALL_TEST_FILE_LOG;
  originalRecallLogLevel = process.env.RECALL_LOG_LEVEL;
  delete process.env.RECALL_TEST_FILE_LOG;
  delete process.env.RECALL_LOG_LEVEL;
  logging.resetLogger();
  logging.setLoggerOverride(null);
});

afterEach(() => {
  if (originalTestFileLog === undefined) {
    delete process.env.RECALL_TEST_FILE_LOG;
  } else {
    process.env.RECALL_TEST_FILE_LOG = originalTestFileLog;
  }
  if (originalRecallLogLevel === undefined) {
    delete process.env.RECALL_LOG_LEVEL;
  } else {
    process.env.RECALL_LOG_LEVEL = originalRecallLogLevel;
  }
  logging.resetLogger();
  logging.setLoggerOverride(null);
  logging.setLoggerConfigLoaderForTests();
  vi.restoreAllMocks();
});

describe("getResolvedLoggerSettings", () => {
  it("uses a silent fast path in default Vitest mode without config reads", () => {
    const readLoggingConfig = vi.fn(() => undefined);
    logging.setLoggerConfigLoaderForTests(readLoggingConfig);

    const settings = logging.getResolvedLoggerSettings();

    expect(settings.level).toBe("silent");
    expect(readLoggingConfig).not.toHaveBeenCalled();
  });

  it("reads logging config when test file logging is explicitly enabled", () => {
    process.env.RECALL_TEST_FILE_LOG = "1";
    logging.setLoggerConfigLoaderForTests(() => ({
      level: "debug",
      file: "/tmp/recall-configured.log",
      maxFileBytes: 2048,
    }));

    const settings = logging.getResolvedLoggerSettings();

    expect(settings.level).toBe("debug");
    expect(settings.file).toBe("/tmp/recall-configured.log");
    expect(settings.maxFileBytes).toBe(2048);
  });

  it("uses defaults when no logging config is available", () => {
    process.env.RECALL_TEST_FILE_LOG = "1";
    logging.setLoggerConfigLoaderForTests(() => undefined);

    const settings = logging.getResolvedLoggerSettings();

    expect(settings.level).toBe("info");
  });
});
