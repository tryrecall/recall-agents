// Verifies logging-level schema parsing and defaults.
import { describe, expect, it } from "vitest";
import { SteelEngineSchema } from "./zod-schema.js";

describe("SteelEngineSchema logging levels", () => {
  it("accepts valid logging level values for level and consoleLevel", () => {
    const result = SteelEngineSchema.safeParse({
      logging: {
        level: "debug",
        consoleLevel: "warn",
      },
    });

    expect(result.success).toBe(true);
  });

  it("rejects invalid logging level values", () => {
    const invalidLevel = SteelEngineSchema.safeParse({
      logging: {
        level: "loud",
      },
    });
    const invalidConsoleLevel = SteelEngineSchema.safeParse({
      logging: {
        consoleLevel: "verbose",
      },
    });

    expect(invalidLevel.success).toBe(false);
    if (!invalidLevel.success) {
      expect(
        invalidLevel.error.issues.some((issue) => issue.path.join(".") === "logging.level"),
      ).toBe(true);
    }
    expect(invalidConsoleLevel.success).toBe(false);
    if (!invalidConsoleLevel.success) {
      expect(
        invalidConsoleLevel.error.issues.some(
          (issue) => issue.path.join(".") === "logging.consoleLevel",
        ),
      ).toBe(true);
    }
  });
});
