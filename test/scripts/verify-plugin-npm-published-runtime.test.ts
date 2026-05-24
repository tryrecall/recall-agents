import { describe, expect, it } from "vitest";
import { collectPluginNpmPublishedRuntimeErrors } from "../../scripts/verify-plugin-npm-published-runtime.mjs";

describe("collectPluginNpmPublishedRuntimeErrors", () => {
  it("flags published plugin packages with TypeScript entries and no compiled runtime output", () => {
    expect(
      collectPluginNpmPublishedRuntimeErrors({
        spec: "@recall/discord@2026.5.2",
        packageJson: {
          name: "@recall/discord",
          version: "2026.5.2",
          recall: {
            extensions: ["./index.ts"],
          },
        },
        files: ["package.json", "index.ts"],
      }),
    ).toEqual([
      "@recall/discord@2026.5.2 requires compiled runtime output for TypeScript entry ./index.ts: expected ./dist/index.js, ./dist/index.mjs, ./dist/index.cjs, ./index.js, ./index.mjs, ./index.cjs",
    ]);
  });

  it("accepts published plugin packages with explicit runtimeExtensions", () => {
    expect(
      collectPluginNpmPublishedRuntimeErrors({
        packageJson: {
          name: "@recall/zalo",
          version: "2026.5.3",
          recall: {
            extensions: ["./index.ts"],
            runtimeExtensions: ["./dist/index.js"],
          },
        },
        files: ["package.json", "index.ts", "dist/index.js"],
      }),
    ).toStrictEqual([]);
  });

  it("flags missing explicit runtimeExtensions outputs", () => {
    expect(
      collectPluginNpmPublishedRuntimeErrors({
        packageJson: {
          name: "@recall/line",
          version: "2026.5.3",
          recall: {
            extensions: ["./src/index.ts"],
            runtimeExtensions: ["./dist/index.js"],
          },
        },
        files: ["package.json", "src/index.ts"],
      }),
    ).toEqual(["@recall/line@2026.5.3 runtime extension entry not found: ./dist/index.js"]);
  });

  it("flags runtimeExtensions length mismatches", () => {
    expect(
      collectPluginNpmPublishedRuntimeErrors({
        packageJson: {
          name: "@recall/acpx",
          version: "2026.5.3",
          recall: {
            extensions: ["./index.ts", "./tools.ts"],
            runtimeExtensions: ["./dist/index.js"],
          },
        },
        files: ["package.json", "dist/index.js"],
      }),
    ).toEqual([
      "@recall/acpx@2026.5.3 package.json recall.runtimeExtensions length (1) must match recall.extensions length (2)",
    ]);
  });

  it("flags blank runtimeExtensions entries instead of falling back to inferred outputs", () => {
    expect(
      collectPluginNpmPublishedRuntimeErrors({
        packageJson: {
          name: "@recall/whatsapp",
          version: "2026.5.3",
          recall: {
            extensions: ["./src/index.ts"],
            runtimeExtensions: [" "],
          },
        },
        files: ["package.json", "src/index.ts", "dist/index.js"],
      }),
    ).toEqual([
      "@recall/whatsapp@2026.5.3 package.json recall.runtimeExtensions[0] must be a non-empty string",
    ]);
  });

  it("flags published plugin packages with TypeScript setup entries and no compiled setup runtime", () => {
    expect(
      collectPluginNpmPublishedRuntimeErrors({
        packageJson: {
          name: "@recall/line",
          version: "2026.5.3",
          recall: {
            extensions: ["./index.ts"],
            runtimeExtensions: ["./dist/index.js"],
            setupEntry: "./setup-entry.ts",
          },
        },
        files: ["package.json", "index.ts", "dist/index.js", "setup-entry.ts"],
      }),
    ).toEqual([
      "@recall/line@2026.5.3 requires compiled runtime output for TypeScript entry ./setup-entry.ts: expected ./dist/setup-entry.js, ./dist/setup-entry.mjs, ./dist/setup-entry.cjs, ./setup-entry.js, ./setup-entry.mjs, ./setup-entry.cjs",
    ]);
  });

  it("accepts published plugin packages with explicit runtimeSetupEntry", () => {
    expect(
      collectPluginNpmPublishedRuntimeErrors({
        packageJson: {
          name: "@recall/qqbot",
          version: "2026.5.3",
          recall: {
            extensions: ["./index.ts"],
            runtimeExtensions: ["./dist/index.js"],
            setupEntry: "./setup-entry.ts",
            runtimeSetupEntry: "./dist/setup-entry.js",
          },
        },
        files: ["package.json", "dist/index.js", "dist/setup-entry.js"],
      }),
    ).toStrictEqual([]);
  });

  it("flags missing explicit runtimeSetupEntry outputs", () => {
    expect(
      collectPluginNpmPublishedRuntimeErrors({
        packageJson: {
          name: "@recall/matrix",
          version: "2026.5.3",
          recall: {
            extensions: ["./index.ts"],
            runtimeExtensions: ["./dist/index.js"],
            setupEntry: "./setup-entry.ts",
            runtimeSetupEntry: "./dist/setup-entry.js",
          },
        },
        files: ["package.json", "dist/index.js"],
      }),
    ).toEqual(["@recall/matrix@2026.5.3 runtime setup entry not found: ./dist/setup-entry.js"]);
  });

  it("flags runtimeSetupEntry without setupEntry", () => {
    expect(
      collectPluginNpmPublishedRuntimeErrors({
        packageJson: {
          name: "@recall/twitch",
          version: "2026.5.3",
          recall: {
            extensions: ["./index.ts"],
            runtimeExtensions: ["./dist/index.js"],
            runtimeSetupEntry: "./dist/setup-entry.js",
          },
        },
        files: ["package.json", "dist/index.js", "dist/setup-entry.js"],
      }),
    ).toEqual([
      "@recall/twitch@2026.5.3 package.json recall.runtimeSetupEntry requires recall.setupEntry",
    ]);
  });
});
