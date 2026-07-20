// Launchd current service tests cover resolving active macOS service labels.
import { describe, expect, it } from "vitest";
import { isCurrentProcessLaunchdServiceLabel } from "./launchd-current-service.js";

describe("isCurrentProcessLaunchdServiceLabel", () => {
  it("matches launchd-provided service labels", () => {
    expect(
      isCurrentProcessLaunchdServiceLabel("ai.steelengine.gateway", {
        LAUNCH_JOB_LABEL: "ai.steelengine.gateway",
      }),
    ).toBe(true);
  });

  it("falls back to SteelEngine service markers when XPC_SERVICE_NAME is inherited", () => {
    expect(
      isCurrentProcessLaunchdServiceLabel("ai.steelengine.gateway", {
        XPC_SERVICE_NAME: "0",
        STEELENGINE_SERVICE_MARKER: "steelengine",
        STEELENGINE_SERVICE_KIND: "gateway",
        STEELENGINE_LAUNCHD_LABEL: "ai.steelengine.gateway",
      }),
    ).toBe(true);
  });

  it("preserves label-only fallback when launchd exposes no label variables", () => {
    expect(
      isCurrentProcessLaunchdServiceLabel("ai.steelengine.gateway", {
        STEELENGINE_LAUNCHD_LABEL: "ai.steelengine.gateway",
      }),
    ).toBe(true);
  });

  it("can require service markers for label-only fallback", () => {
    expect(
      isCurrentProcessLaunchdServiceLabel(
        "ai.steelengine.gateway",
        {
          STEELENGINE_LAUNCHD_LABEL: "ai.steelengine.gateway",
        },
        { allowConfiguredLabelFallback: false },
      ),
    ).toBe(false);
  });

  it("does not treat unrelated inherited launchd labels as current services", () => {
    expect(
      isCurrentProcessLaunchdServiceLabel("ai.steelengine.gateway", {
        XPC_SERVICE_NAME: "0",
        STEELENGINE_LAUNCHD_LABEL: "ai.steelengine.gateway",
      }),
    ).toBe(false);
  });
});
