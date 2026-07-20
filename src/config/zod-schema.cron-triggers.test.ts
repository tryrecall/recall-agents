import { describe, expect, it } from "vitest";
import { SteelEngineSchema } from "./zod-schema.js";

describe("SteelEngineSchema cron triggers", () => {
  it("accepts the strict trigger gate and interval floor", () => {
    expect(
      SteelEngineSchema.parse({ cron: { triggers: { enabled: true, minIntervalMs: 45_000 } } }).cron
        ?.triggers,
    ).toEqual({ enabled: true, minIntervalMs: 45_000 });
  });

  it("rejects invalid and unknown trigger settings", () => {
    expect(SteelEngineSchema.safeParse({ cron: { triggers: { minIntervalMs: 0 } } }).success).toBe(
      false,
    );
    expect(
      SteelEngineSchema.safeParse({ cron: { triggers: { enabled: true, extra: true } } }).success,
    ).toBe(false);
  });
});
