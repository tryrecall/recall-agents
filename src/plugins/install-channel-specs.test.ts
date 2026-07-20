import { describe, expect, it } from "vitest";
import {
  resolveClawHubInstallSpecsForUpdateChannel,
  resolveNpmInstallSpecsForUpdateChannel,
} from "./install-channel-specs.js";

describe("resolveNpmInstallSpecsForUpdateChannel", () => {
  it.each(["@steelengine/discord", "@steelengine/discord@latest"])(
    "targets the exact core version for official extended-stable intent %s",
    (spec) => {
      expect(
        resolveNpmInstallSpecsForUpdateChannel({
          spec,
          updateChannel: "extended-stable",
          officialPackageName: "@steelengine/discord",
          coreVersion: "2026.7.33",
        }),
      ).toEqual({
        installSpec: "@steelengine/discord@2026.7.33",
        recordSpec: spec,
      });
    },
  );

  it.each([
    "@steelengine/discord@2026.6.33",
    "@steelengine/discord@next",
    "@steelengine/discord@beta",
    "@steelengine/discord@^2026.6.0",
    "https://registry.example.test/discord.tgz",
  ])("preserves explicit extended-stable intent %s", (spec) => {
    expect(
      resolveNpmInstallSpecsForUpdateChannel({
        spec,
        updateChannel: "extended-stable",
        officialPackageName: "@steelengine/discord",
        coreVersion: "2026.7.33",
      }),
    ).toEqual({ installSpec: spec, recordSpec: spec });
  });

  it("does not rewrite a third-party package", () => {
    expect(
      resolveNpmInstallSpecsForUpdateChannel({
        spec: "@acme/discord",
        updateChannel: "extended-stable",
        officialPackageName: "@steelengine/discord",
        coreVersion: "2026.7.33",
      }),
    ).toEqual({ installSpec: "@acme/discord", recordSpec: "@acme/discord" });
  });

  it("fails closed without an authoritative extended-stable core version", () => {
    expect(() =>
      resolveNpmInstallSpecsForUpdateChannel({
        spec: "@steelengine/discord",
        updateChannel: "extended-stable",
        officialPackageName: "@steelengine/discord",
      }),
    ).toThrow("requires an exact core version");
  });

  it("preserves beta behavior", () => {
    expect(
      resolveNpmInstallSpecsForUpdateChannel({
        spec: "@steelengine/discord@latest",
        updateChannel: "beta",
        officialPackageName: "@steelengine/discord",
        coreVersion: "2026.7.33",
      }),
    ).toEqual({
      installSpec: "@steelengine/discord@beta",
      recordSpec: "@steelengine/discord@latest",
      fallbackSpec: "@steelengine/discord@latest",
      fallbackLabel: "@steelengine/discord@beta",
    });
  });
});

describe("resolveClawHubInstallSpecsForUpdateChannel", () => {
  it("does not rewrite ClawHub on extended-stable", () => {
    expect(
      resolveClawHubInstallSpecsForUpdateChannel({
        spec: "clawhub:@steelengine/discord",
        updateChannel: "extended-stable",
      }),
    ).toEqual({
      installSpec: "clawhub:@steelengine/discord",
      recordSpec: "clawhub:@steelengine/discord",
    });
  });
});
