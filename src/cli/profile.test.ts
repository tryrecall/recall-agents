import path from "node:path";
import { describe, expect, it } from "vitest";
import { formatCliCommand } from "./command-format.js";
import { applyCliProfileEnv, parseCliProfileArgs } from "./profile.js";

describe("parseCliProfileArgs", () => {
  it("leaves gateway --dev for subcommands", () => {
    const res = parseCliProfileArgs([
      "node",
      "recall",
      "gateway",
      "--dev",
      "--allow-unconfigured",
    ]);
    if (!res.ok) {
      throw new Error(res.error);
    }
    expect(res.profile).toBeNull();
    expect(res.argv).toEqual(["node", "recall", "gateway", "--dev", "--allow-unconfigured"]);
  });

  it("still accepts global --dev before subcommand", () => {
    const res = parseCliProfileArgs(["node", "recall", "--dev", "gateway"]);
    if (!res.ok) {
      throw new Error(res.error);
    }
    expect(res.profile).toBe("dev");
    expect(res.argv).toEqual(["node", "recall", "gateway"]);
  });

  it("parses --profile value and strips it", () => {
    const res = parseCliProfileArgs(["node", "recall", "--profile", "work", "status"]);
    if (!res.ok) {
      throw new Error(res.error);
    }
    expect(res.profile).toBe("work");
    expect(res.argv).toEqual(["node", "recall", "status"]);
  });

  it("rejects missing profile value", () => {
    const res = parseCliProfileArgs(["node", "recall", "--profile"]);
    expect(res.ok).toBe(false);
  });

  it.each([
    ["--dev first", ["node", "recall", "--dev", "--profile", "work", "status"]],
    ["--profile first", ["node", "recall", "--profile", "work", "--dev", "status"]],
  ])("rejects combining --dev with --profile (%s)", (_name, argv) => {
    const res = parseCliProfileArgs(argv);
    expect(res.ok).toBe(false);
  });
});

describe("applyCliProfileEnv", () => {
  it("fills env defaults for dev profile", () => {
    const env: Record<string, string | undefined> = {};
    applyCliProfileEnv({
      profile: "dev",
      env,
      homedir: () => "/home/peter",
    });
    const expectedStateDir = path.join(path.resolve("/home/peter"), ".recall-dev");
    expect(env.RECALL_PROFILE).toBe("dev");
    expect(env.RECALL_STATE_DIR).toBe(expectedStateDir);
    expect(env.RECALL_CONFIG_PATH).toBe(path.join(expectedStateDir, "recall.json"));
    expect(env.RECALL_GATEWAY_PORT).toBe("19001");
  });

  it("does not override explicit env values", () => {
    const env: Record<string, string | undefined> = {
      RECALL_STATE_DIR: "/custom",
      RECALL_GATEWAY_PORT: "19099",
    };
    applyCliProfileEnv({
      profile: "dev",
      env,
      homedir: () => "/home/peter",
    });
    expect(env.RECALL_STATE_DIR).toBe("/custom");
    expect(env.RECALL_GATEWAY_PORT).toBe("19099");
    expect(env.RECALL_CONFIG_PATH).toBe(path.join("/custom", "recall.json"));
  });

  it("uses RECALL_HOME when deriving profile state dir", () => {
    const env: Record<string, string | undefined> = {
      RECALL_HOME: "/srv/recall-home",
      HOME: "/home/other",
    };
    applyCliProfileEnv({
      profile: "work",
      env,
      homedir: () => "/home/fallback",
    });

    const resolvedHome = path.resolve("/srv/recall-home");
    expect(env.RECALL_STATE_DIR).toBe(path.join(resolvedHome, ".recall-work"));
    expect(env.RECALL_CONFIG_PATH).toBe(
      path.join(resolvedHome, ".recall-work", "recall.json"),
    );
  });
});

describe("formatCliCommand", () => {
  it.each([
    {
      name: "no profile is set",
      cmd: "recall doctor --fix",
      env: {},
      expected: "recall doctor --fix",
    },
    {
      name: "profile is default",
      cmd: "recall doctor --fix",
      env: { RECALL_PROFILE: "default" },
      expected: "recall doctor --fix",
    },
    {
      name: "profile is Default (case-insensitive)",
      cmd: "recall doctor --fix",
      env: { RECALL_PROFILE: "Default" },
      expected: "recall doctor --fix",
    },
    {
      name: "profile is invalid",
      cmd: "recall doctor --fix",
      env: { RECALL_PROFILE: "bad profile" },
      expected: "recall doctor --fix",
    },
    {
      name: "--profile is already present",
      cmd: "recall --profile work doctor --fix",
      env: { RECALL_PROFILE: "work" },
      expected: "recall --profile work doctor --fix",
    },
    {
      name: "--dev is already present",
      cmd: "recall --dev doctor",
      env: { RECALL_PROFILE: "dev" },
      expected: "recall --dev doctor",
    },
  ])("returns command unchanged when $name", ({ cmd, env, expected }) => {
    expect(formatCliCommand(cmd, env)).toBe(expected);
  });

  it("inserts --profile flag when profile is set", () => {
    expect(formatCliCommand("recall doctor --fix", { RECALL_PROFILE: "work" })).toBe(
      "recall --profile work doctor --fix",
    );
  });

  it("trims whitespace from profile", () => {
    expect(formatCliCommand("recall doctor --fix", { RECALL_PROFILE: "  jbrecall  " })).toBe(
      "recall --profile jbrecall doctor --fix",
    );
  });

  it("handles command with no args after recall", () => {
    expect(formatCliCommand("recall", { RECALL_PROFILE: "test" })).toBe(
      "recall --profile test",
    );
  });

  it("handles pnpm wrapper", () => {
    expect(formatCliCommand("pnpm recall doctor", { RECALL_PROFILE: "work" })).toBe(
      "pnpm recall --profile work doctor",
    );
  });
});
