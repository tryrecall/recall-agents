// Profile CLI tests cover profile selection, persistence, and command wiring.
import path from "node:path";
import { describe, expect, it } from "vitest";
import { formatCliCommand } from "./command-format.js";
import { applyCliProfileEnv, parseCliProfileArgs } from "./profile.js";

describe("parseCliProfileArgs", () => {
  it("leaves gateway --dev for subcommands", () => {
    const res = parseCliProfileArgs([
      "node",
      "steelengine",
      "gateway",
      "--dev",
      "--allow-unconfigured",
    ]);
    if (!res.ok) {
      throw new Error(res.error);
    }
    expect(res.profile).toBeNull();
    expect(res.argv).toEqual(["node", "steelengine", "gateway", "--dev", "--allow-unconfigured"]);
  });

  it("leaves gateway --dev for subcommands after leading root options", () => {
    const res = parseCliProfileArgs([
      "node",
      "steelengine",
      "--no-color",
      "gateway",
      "--dev",
      "--allow-unconfigured",
    ]);
    if (!res.ok) {
      throw new Error(res.error);
    }
    expect(res.profile).toBeNull();
    expect(res.argv).toEqual([
      "node",
      "steelengine",
      "--no-color",
      "gateway",
      "--dev",
      "--allow-unconfigured",
    ]);
  });

  it("still accepts global --dev before subcommand", () => {
    const res = parseCliProfileArgs(["node", "steelengine", "--dev", "gateway"]);
    if (!res.ok) {
      throw new Error(res.error);
    }
    expect(res.profile).toBe("dev");
    expect(res.argv).toEqual(["node", "steelengine", "gateway"]);
  });

  it("parses --profile value and strips it", () => {
    const res = parseCliProfileArgs(["node", "steelengine", "--profile", "work", "status"]);
    if (!res.ok) {
      throw new Error(res.error);
    }
    expect(res.profile).toBe("work");
    expect(res.argv).toEqual(["node", "steelengine", "status"]);
  });

  it("parses interleaved --profile after the command token", () => {
    const res = parseCliProfileArgs(["node", "steelengine", "status", "--profile", "work", "--deep"]);
    if (!res.ok) {
      throw new Error(res.error);
    }
    expect(res.profile).toBe("work");
    expect(res.argv).toEqual(["node", "steelengine", "status", "--deep"]);
  });

  it("preserves Matrix QA --profile for the command parser", () => {
    const res = parseCliProfileArgs([
      "node",
      "steelengine",
      "qa",
      "matrix",
      "--profile",
      "fast",
      "--fail-fast",
    ]);
    if (!res.ok) {
      throw new Error(res.error);
    }
    expect(res.profile).toBeNull();
    expect(res.argv).toEqual([
      "node",
      "steelengine",
      "qa",
      "matrix",
      "--profile",
      "fast",
      "--fail-fast",
    ]);
  });

  it("preserves Matrix QA --profile after leading root options", () => {
    const res = parseCliProfileArgs([
      "node",
      "steelengine",
      "--no-color",
      "qa",
      "matrix",
      "--profile=fast",
    ]);
    if (!res.ok) {
      throw new Error(res.error);
    }
    expect(res.profile).toBeNull();
    expect(res.argv).toEqual(["node", "steelengine", "--no-color", "qa", "matrix", "--profile=fast"]);
  });

  it("parses qa run --profile smoke-ci as a root profile", () => {
    const res = parseCliProfileArgs([
      "node",
      "steelengine",
      "qa",
      "run",
      "--profile",
      "smoke-ci",
      "--category",
      "agent-runtime-and-provider-execution.agent-turn-execution",
    ]);
    if (!res.ok) {
      throw new Error(res.error);
    }
    expect(res.profile).toBe("smoke-ci");
    expect(res.argv).toEqual([
      "node",
      "steelengine",
      "qa",
      "run",
      "--category",
      "agent-runtime-and-provider-execution.agent-turn-execution",
    ]);
  });

  it("parses qa run --profile=release self-check invocations as root profiles", () => {
    const res = parseCliProfileArgs([
      "node",
      "steelengine",
      "qa",
      "run",
      "--profile=release",
      "--output",
      "qa-report.md",
    ]);
    if (!res.ok) {
      throw new Error(res.error);
    }
    expect(res.profile).toBe("release");
    expect(res.argv).toEqual(["node", "steelengine", "qa", "run", "--output", "qa-report.md"]);
  });

  it("preserves qa run --qa-profile for the command parser", () => {
    const res = parseCliProfileArgs([
      "node",
      "steelengine",
      "qa",
      "run",
      "--qa-profile",
      "smoke-ci",
      "--surface",
      "agent-runtime-and-provider-execution",
    ]);
    if (!res.ok) {
      throw new Error(res.error);
    }
    expect(res.profile).toBeNull();
    expect(res.argv).toEqual([
      "node",
      "steelengine",
      "qa",
      "run",
      "--qa-profile",
      "smoke-ci",
      "--surface",
      "agent-runtime-and-provider-execution",
    ]);
  });

  it("parses arbitrary qa run --profile values as root profiles", () => {
    const res = parseCliProfileArgs([
      "node",
      "steelengine",
      "qa",
      "run",
      "--profile",
      "work",
      "--output",
      "qa-report.md",
    ]);
    if (!res.ok) {
      throw new Error(res.error);
    }
    expect(res.profile).toBe("work");
    expect(res.argv).toEqual(["node", "steelengine", "qa", "run", "--output", "qa-report.md"]);
  });

  it("parses arbitrary qa run --profile= values as root profiles", () => {
    const res = parseCliProfileArgs([
      "node",
      "steelengine",
      "qa",
      "run",
      "--profile=work",
      "--output",
      "qa-report.md",
    ]);
    if (!res.ok) {
      throw new Error(res.error);
    }
    expect(res.profile).toBe("work");
    expect(res.argv).toEqual(["node", "steelengine", "qa", "run", "--output", "qa-report.md"]);
  });

  it("still parses root --profile before qa run", () => {
    const res = parseCliProfileArgs([
      "node",
      "steelengine",
      "--profile",
      "work",
      "qa",
      "run",
      "--qa-profile",
      "smoke-ci",
    ]);
    if (!res.ok) {
      throw new Error(res.error);
    }
    expect(res.profile).toBe("work");
    expect(res.argv).toEqual(["node", "steelengine", "qa", "run", "--qa-profile", "smoke-ci"]);
  });

  it("still parses root --profile before Matrix QA", () => {
    const res = parseCliProfileArgs([
      "node",
      "steelengine",
      "--profile",
      "work",
      "qa",
      "matrix",
      "--fail-fast",
    ]);
    if (!res.ok) {
      throw new Error(res.error);
    }
    expect(res.profile).toBe("work");
    expect(res.argv).toEqual(["node", "steelengine", "qa", "matrix", "--fail-fast"]);
  });

  it("parses interleaved --dev after the command token", () => {
    const res = parseCliProfileArgs(["node", "steelengine", "status", "--dev"]);
    if (!res.ok) {
      throw new Error(res.error);
    }
    expect(res.profile).toBe("dev");
    expect(res.argv).toEqual(["node", "steelengine", "status"]);
  });

  it("rejects missing profile value", () => {
    const res = parseCliProfileArgs(["node", "steelengine", "--profile"]);
    expect(res.ok).toBe(false);
  });

  it.each([
    ["--dev first", ["node", "steelengine", "--dev", "--profile", "work", "status"]],
    ["--profile first", ["node", "steelengine", "--profile", "work", "--dev", "status"]],
    ["interleaved after command", ["node", "steelengine", "status", "--profile", "work", "--dev"]],
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
    const expectedStateDir = path.join(path.resolve("/home/peter"), ".steelengine-dev");
    expect(env.STEELENGINE_PROFILE).toBe("dev");
    expect(env.STEELENGINE_STATE_DIR).toBe(expectedStateDir);
    expect(env.STEELENGINE_CONFIG_PATH).toBe(path.join(expectedStateDir, "steelengine.json"));
    expect(env.STEELENGINE_GATEWAY_PORT).toBe("19001");
  });

  it("does not override explicit env values", () => {
    const env: Record<string, string | undefined> = {
      STEELENGINE_PROFILE: "prod",
      STEELENGINE_STATE_DIR: "/custom",
      STEELENGINE_GATEWAY_PORT: "19099",
    };
    applyCliProfileEnv({
      profile: "dev",
      env,
      homedir: () => "/home/peter",
    });
    expect(env.STEELENGINE_PROFILE).toBe("dev");
    expect(env.STEELENGINE_STATE_DIR).toBe("/custom");
    expect(env.STEELENGINE_GATEWAY_PORT).toBe("19099");
    expect(env.STEELENGINE_CONFIG_PATH).toBe(path.join("/custom", "steelengine.json"));
  });

  it("uses STEELENGINE_HOME when deriving profile state dir", () => {
    const env: Record<string, string | undefined> = {
      STEELENGINE_HOME: "/srv/steelengine-home",
      HOME: "/home/other",
    };
    applyCliProfileEnv({
      profile: "work",
      env,
      homedir: () => "/home/fallback",
    });

    const resolvedHome = path.resolve("/srv/steelengine-home");
    expect(env.STEELENGINE_STATE_DIR).toBe(path.join(resolvedHome, ".steelengine-work"));
    expect(env.STEELENGINE_CONFIG_PATH).toBe(
      path.join(resolvedHome, ".steelengine-work", "steelengine.json"),
    );
  });
});

describe("formatCliCommand", () => {
  it.each([
    {
      name: "no profile is set",
      cmd: "steelengine doctor --fix",
      env: {},
      expected: "steelengine doctor --fix",
    },
    {
      name: "profile is default",
      cmd: "steelengine doctor --fix",
      env: { STEELENGINE_PROFILE: "default" },
      expected: "steelengine doctor --fix",
    },
    {
      name: "profile is Default (case-insensitive)",
      cmd: "steelengine doctor --fix",
      env: { STEELENGINE_PROFILE: "Default" },
      expected: "steelengine doctor --fix",
    },
    {
      name: "profile is invalid",
      cmd: "steelengine doctor --fix",
      env: { STEELENGINE_PROFILE: "bad profile" },
      expected: "steelengine doctor --fix",
    },
    {
      name: "--profile is already present",
      cmd: "steelengine --profile work doctor --fix",
      env: { STEELENGINE_PROFILE: "work" },
      expected: "steelengine --profile work doctor --fix",
    },
    {
      name: "--dev is already present",
      cmd: "steelengine --dev doctor",
      env: { STEELENGINE_PROFILE: "dev" },
      expected: "steelengine --dev doctor",
    },
  ])("returns command unchanged when $name", ({ cmd, env, expected }) => {
    expect(formatCliCommand(cmd, env)).toBe(expected);
  });

  it("inserts --profile flag when profile is set", () => {
    expect(formatCliCommand("steelengine doctor --fix", { STEELENGINE_PROFILE: "work" })).toBe(
      "steelengine --profile work doctor --fix",
    );
  });

  it("trims whitespace from profile", () => {
    expect(formatCliCommand("steelengine doctor --fix", { STEELENGINE_PROFILE: "  jbsteelengine  " })).toBe(
      "steelengine --profile jbsteelengine doctor --fix",
    );
  });

  it("handles command with no args after steelengine", () => {
    expect(formatCliCommand("steelengine", { STEELENGINE_PROFILE: "test" })).toBe(
      "steelengine --profile test",
    );
  });

  it("handles pnpm wrapper", () => {
    expect(formatCliCommand("pnpm steelengine doctor", { STEELENGINE_PROFILE: "work" })).toBe(
      "pnpm steelengine --profile work doctor",
    );
  });

  it("inserts --container when a container hint is set", () => {
    expect(
      formatCliCommand("steelengine gateway status --deep", { STEELENGINE_CONTAINER_HINT: "demo" }),
    ).toBe("steelengine --container demo gateway status --deep");
  });

  it("ignores unsafe container hints", () => {
    expect(
      formatCliCommand("steelengine gateway status --deep", {
        STEELENGINE_CONTAINER_HINT: "demo; rm -rf /",
      }),
    ).toBe("steelengine gateway status --deep");
  });

  it("preserves both --container and --profile hints", () => {
    expect(
      formatCliCommand("steelengine doctor", {
        STEELENGINE_CONTAINER_HINT: "demo",
        STEELENGINE_PROFILE: "work",
      }),
    ).toBe("steelengine --container demo doctor");
  });

  it("does not prepend --container for update commands", () => {
    expect(formatCliCommand("steelengine update", { STEELENGINE_CONTAINER_HINT: "demo" })).toBe(
      "steelengine update",
    );
    expect(
      formatCliCommand("pnpm steelengine update --channel beta", { STEELENGINE_CONTAINER_HINT: "demo" }),
    ).toBe("pnpm steelengine update --channel beta");
  });
});
