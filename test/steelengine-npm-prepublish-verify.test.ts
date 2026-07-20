import { describe, expect, it } from "vitest";
import {
  steelEngineNpmPrepublishVerifyUsage,
  parseSteelEngineNpmPrepublishVerifyArgs,
  usesPreparedLocalDependencyInstall,
} from "../scripts/steelengine-npm-prepublish-verify.ts";

describe("parseSteelEngineNpmPrepublishVerifyArgs", () => {
  it("supports help, optional versions, and package-manager separators", () => {
    expect(parseSteelEngineNpmPrepublishVerifyArgs(["--help"])).toEqual({
      dependencyTarballPaths: [],
      help: true,
      tarballPath: "",
    });
    expect(parseSteelEngineNpmPrepublishVerifyArgs(["steelengine.tgz"])).toEqual({
      dependencyTarballPaths: [],
      help: false,
      tarballPath: "steelengine.tgz",
    });
    expect(parseSteelEngineNpmPrepublishVerifyArgs(["--", "steelengine.tgz", "2026.3.23"])).toEqual({
      dependencyTarballPaths: [],
      expectedVersion: "2026.3.23",
      help: false,
      tarballPath: "steelengine.tgz",
    });
  });

  it("rejects missing, option-like, and extra arguments before installing", () => {
    expect(() => parseSteelEngineNpmPrepublishVerifyArgs([])).toThrow(
      steelEngineNpmPrepublishVerifyUsage(),
    );
    expect(() => parseSteelEngineNpmPrepublishVerifyArgs(["--tag"])).toThrow(
      "Unknown steelengine npm prepublish verifier option: --tag",
    );
    expect(() => parseSteelEngineNpmPrepublishVerifyArgs(["steelengine.tgz", "--tag"])).toThrow(
      "Unknown steelengine npm prepublish verifier option: --tag",
    );
    expect(
      parseSteelEngineNpmPrepublishVerifyArgs(["steelengine.tgz", "2026.3.23", "llm-core.tgz", "ai.tgz"]),
    ).toEqual({
      dependencyTarballPaths: ["llm-core.tgz", "ai.tgz"],
      expectedVersion: "2026.3.23",
      help: false,
      tarballPath: "steelengine.tgz",
    });
    expect(() =>
      parseSteelEngineNpmPrepublishVerifyArgs(["steelengine.tgz", "2026.3.23", "--bad"]),
    ).toThrow("Invalid dependency tarball path: --bad");
  });
});

describe("usesPreparedLocalDependencyInstall", () => {
  it("uses the prepared local project only for the single AI tarball release path", () => {
    expect(usesPreparedLocalDependencyInstall(0)).toBe(false);
    expect(usesPreparedLocalDependencyInstall(1)).toBe(true);
    expect(usesPreparedLocalDependencyInstall(2)).toBe(false);
  });
});
