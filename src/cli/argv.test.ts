// Argv tests cover CLI argument parsing helpers and platform-specific normalization.
import { describe, expect, it } from "vitest";
import {
  buildParseArgv,
  getFlagValue,
  getCommandPositionalsWithRootOptions,
  getCommandPathWithRootOptions,
  getPrimaryCommand,
  getPositiveIntFlagValue,
  getVerboseFlag,
  hasFlag,
  isHelpOrVersionInvocation,
  isRootHelpInvocation,
  isRootVersionInvocation,
  normalizeGeneratedHelpCommandArgv,
  normalizeRootHelpTargetArgv,
  normalizeRootLogLevelArgv,
  normalizeRootNoColorArgv,
  shouldMigrateStateFromPath,
} from "./argv.js";

describe("argv helpers", () => {
  it.each([
    {
      name: "known command group help command help flag",
      argv: ["node", "steelengine", "backup", "help", "--help"],
      expected: ["node", "steelengine", "backup", "help"],
    },
    {
      name: "known command group help command short help flag",
      argv: ["node", "steelengine", "--profile", "work", "backup", "help", "-h"],
      expected: ["node", "steelengine", "--profile", "work", "backup", "help"],
    },
    {
      name: "leaf positional help remains untouched",
      argv: ["node", "steelengine", "docs", "help", "--help"],
      expected: ["node", "steelengine", "docs", "help", "--help"],
    },
    {
      name: "known command group help target",
      argv: ["node", "steelengine", "plugins", "help", "list"],
      expected: ["node", "steelengine", "plugins", "list", "--help"],
    },
    {
      name: "known command group help target help flag",
      argv: ["node", "steelengine", "plugins", "help", "list", "--help"],
      expected: ["node", "steelengine", "plugins", "list", "--help"],
    },
    {
      name: "unknown plugin command group help target",
      argv: ["node", "steelengine", "external-plugin", "help", "inspect"],
      expected: ["node", "steelengine", "external-plugin", "inspect", "--help"],
    },
    {
      name: "unknown plugin command group help target help flag",
      argv: ["node", "steelengine", "external-plugin", "help", "inspect", "--help"],
      expected: ["node", "steelengine", "external-plugin", "inspect", "--help"],
    },
    {
      name: "generated help target with trailing root option",
      argv: ["node", "steelengine", "memory", "help", "status", "--no-color"],
      expected: ["node", "steelengine", "--no-color", "memory", "status", "--help"],
    },
    {
      name: "extra help positionals remain untouched",
      argv: ["node", "steelengine", "backup", "help", "missing", "extra", "--help"],
      expected: ["node", "steelengine", "backup", "help", "missing", "extra", "--help"],
    },
    {
      name: "terminator help flag remains untouched",
      argv: ["node", "steelengine", "backup", "help", "--", "--help"],
      expected: ["node", "steelengine", "backup", "help", "--", "--help"],
    },
  ])("normalizes generated help commands: $name", ({ argv, expected }) => {
    expect(normalizeGeneratedHelpCommandArgv(argv)).toEqual(expected);
  });

  it.each([
    {
      name: "root help target",
      argv: ["node", "steelengine", "help", "plugins"],
      expected: ["node", "steelengine", "plugins", "--help"],
    },
    {
      name: "root help target with help flag",
      argv: ["node", "steelengine", "help", "plugins", "--help"],
      expected: ["node", "steelengine", "plugins", "--help"],
    },
    {
      name: "root option before help target",
      argv: ["node", "steelengine", "--profile", "work", "help", "memory"],
      expected: ["node", "steelengine", "--profile", "work", "memory", "--help"],
    },
    {
      name: "bare root help remains untouched",
      argv: ["node", "steelengine", "help"],
      expected: ["node", "steelengine", "help"],
    },
    {
      name: "root help self-help remains untouched",
      argv: ["node", "steelengine", "help", "--help"],
      expected: ["node", "steelengine", "help", "--help"],
    },
    {
      name: "nested root help target",
      argv: ["node", "steelengine", "help", "plugins", "list"],
      expected: ["node", "steelengine", "plugins", "list", "--help"],
    },
    {
      name: "nested root help target with help flag",
      argv: ["node", "steelengine", "help", "plugins", "list", "--help"],
      expected: ["node", "steelengine", "plugins", "list", "--help"],
    },
    {
      name: "nested root help target with trailing root option",
      argv: ["node", "steelengine", "help", "memory", "status", "--no-color"],
      expected: ["node", "steelengine", "--no-color", "memory", "status", "--help"],
    },
  ])("normalizes root help targets: $name", ({ argv, expected }) => {
    expect(normalizeRootHelpTargetArgv(argv)).toEqual(expected);
  });

  it.each([
    {
      name: "subcommand trailing no-color",
      argv: ["node", "steelengine", "doctor", "--no-color", "--post-upgrade", "--json"],
      expected: ["node", "steelengine", "--no-color", "doctor", "--post-upgrade", "--json"],
    },
    {
      name: "keeps existing root options first",
      argv: ["node", "steelengine", "--profile", "work", "doctor", "--no-color", "--lint", "--json"],
      expected: [
        "node",
        "steelengine",
        "--profile",
        "work",
        "--no-color",
        "doctor",
        "--lint",
        "--json",
      ],
    },
    {
      name: "keeps no-color after possible command option value",
      argv: ["node", "steelengine", "doctor", "--lint", "--json", "--no-color"],
      expected: ["node", "steelengine", "doctor", "--lint", "--json", "--no-color"],
    },
    {
      name: "flag terminator leaves no-color positional",
      argv: ["node", "steelengine", "doctor", "--", "--no-color"],
      expected: ["node", "steelengine", "doctor", "--", "--no-color"],
    },
    {
      name: "command option value remains literal",
      argv: ["node", "steelengine", "agent", "--message", "--no-color"],
      expected: ["node", "steelengine", "agent", "--message", "--no-color"],
    },
    {
      name: "assigned command option value does not block no-color",
      argv: ["node", "steelengine", "agent", "--message=hello", "--no-color"],
      expected: ["node", "steelengine", "--no-color", "agent", "--message=hello"],
    },
  ])("normalizes root --no-color before command parsing: $name", ({ argv, expected }) => {
    expect(normalizeRootNoColorArgv(argv)).toEqual(expected);
  });

  it("allows final command metadata to lift no-color after boolean command flags", () => {
    const argv = ["node", "steelengine", "doctor", "--lint", "--json", "--no-color"];

    expect(
      normalizeRootNoColorArgv(argv, {
        shouldPreserveNoColor: ({ remainingArgs, noColorIndex }) =>
          remainingArgs[noColorIndex - 1] === "--message",
      }),
    ).toEqual(["node", "steelengine", "--no-color", "doctor", "--lint", "--json"]);
  });

  it.each([
    {
      name: "subcommand trailing log-level",
      argv: ["node", "steelengine", "doctor", "--log-level", "debug", "--json"],
      expected: ["node", "steelengine", "--log-level", "debug", "doctor", "--json"],
    },
    {
      name: "subcommand trailing log-level equals form",
      argv: ["node", "steelengine", "doctor", "--log-level=trace", "--json"],
      expected: ["node", "steelengine", "--log-level=trace", "doctor", "--json"],
    },
    {
      name: "keeps existing root options first",
      argv: ["node", "steelengine", "--profile", "work", "doctor", "--log-level", "debug"],
      expected: ["node", "steelengine", "--profile", "work", "--log-level", "debug", "doctor"],
    },
    {
      name: "keeps log-level after possible command option value",
      argv: ["node", "steelengine", "agent", "--message", "--log-level", "debug"],
      expected: ["node", "steelengine", "agent", "--message", "--log-level", "debug"],
    },
    {
      name: "flag terminator leaves log-level positional",
      argv: ["node", "steelengine", "nodes", "run", "--", "--log-level", "debug"],
      expected: ["node", "steelengine", "nodes", "run", "--", "--log-level", "debug"],
    },
    {
      name: "missing value remains command scoped",
      argv: ["node", "steelengine", "doctor", "--log-level", "--json"],
      expected: ["node", "steelengine", "doctor", "--log-level", "--json"],
    },
  ])("normalizes root --log-level before command parsing: $name", ({ argv, expected }) => {
    expect(normalizeRootLogLevelArgv(argv)).toEqual(expected);
  });

  it("allows final command metadata to lift log-level after boolean command flags", () => {
    const argv = ["node", "steelengine", "doctor", "--lint", "--json", "--log-level", "debug"];

    expect(
      normalizeRootLogLevelArgv(argv, {
        shouldPreserveLogLevel: ({ remainingArgs, logLevelIndex }) =>
          remainingArgs[logLevelIndex - 1] === "--message",
      }),
    ).toEqual(["node", "steelengine", "--log-level", "debug", "doctor", "--lint", "--json"]);
  });

  it("preserves log-level when final command metadata owns the option", () => {
    const argv = ["node", "steelengine", "plugin-cmd", "--log-level", "debug"];

    expect(
      normalizeRootLogLevelArgv(argv, {
        shouldPreserveLogLevel: ({ remainingArgs, logLevelIndex }) =>
          remainingArgs[logLevelIndex] === "--log-level",
      }),
    ).toEqual(argv);
  });

  it.each([
    {
      name: "root help command",
      argv: ["node", "steelengine", "help"],
      expected: true,
    },
    {
      name: "root help command with target",
      argv: ["node", "steelengine", "help", "matrix"],
      expected: true,
    },
    {
      name: "nested help command",
      argv: ["node", "steelengine", "matrix", "encryption", "help"],
      expected: true,
    },
    {
      name: "known subcommand root help command",
      argv: ["node", "steelengine", "config", "help"],
      expected: true,
    },
    {
      name: "known leaf command positional help",
      argv: ["node", "steelengine", "docs", "help"],
      expected: false,
    },
    {
      name: "known subcommand leaf positional help",
      argv: ["node", "steelengine", "config", "set", "some.path", "help"],
      expected: false,
    },
    {
      name: "unknown plugin command help",
      argv: ["node", "steelengine", "external-plugin", "tools", "help"],
      expected: true,
    },
    {
      name: "help flag",
      argv: ["node", "steelengine", "matrix", "encryption", "--help"],
      expected: true,
    },
    {
      name: "help as option value",
      argv: ["node", "steelengine", "agent", "--message", "help"],
      expected: false,
    },
    {
      name: "help after terminator",
      argv: ["node", "steelengine", "nodes", "invoke", "--", "help"],
      expected: false,
    },
    {
      name: "help flag after terminator",
      argv: ["node", "steelengine", "nodes", "invoke", "--", "--help"],
      expected: false,
    },
    {
      name: "version flag after terminator",
      argv: ["node", "steelengine", "nodes", "invoke", "--", "--version"],
      expected: false,
    },
  ])("detects help/version invocations: $name", ({ argv, expected }) => {
    expect(isHelpOrVersionInvocation(argv)).toBe(expected);
  });

  it.each([
    {
      name: "root --version",
      argv: ["node", "steelengine", "--version"],
      expected: true,
    },
    {
      name: "root -V",
      argv: ["node", "steelengine", "-V"],
      expected: true,
    },
    {
      name: "root -v alias with profile",
      argv: ["node", "steelengine", "--profile", "work", "-v"],
      expected: true,
    },
    {
      name: "subcommand version flag",
      argv: ["node", "steelengine", "status", "--version"],
      expected: false,
    },
    {
      name: "unknown root flag with version",
      argv: ["node", "steelengine", "--unknown", "--version"],
      expected: false,
    },
  ])("detects root-only version invocations: $name", ({ argv, expected }) => {
    expect(isRootVersionInvocation(argv)).toBe(expected);
  });

  it.each([
    {
      name: "root --help",
      argv: ["node", "steelengine", "--help"],
      expected: true,
    },
    {
      name: "root -h",
      argv: ["node", "steelengine", "-h"],
      expected: true,
    },
    {
      name: "root --help with profile",
      argv: ["node", "steelengine", "--profile", "work", "--help"],
      expected: true,
    },
    {
      name: "subcommand --help",
      argv: ["node", "steelengine", "status", "--help"],
      expected: false,
    },
    {
      name: "help before subcommand token",
      argv: ["node", "steelengine", "--help", "status"],
      expected: false,
    },
    {
      name: "help after -- terminator",
      argv: ["node", "steelengine", "nodes", "invoke", "--", "device.status", "--help"],
      expected: false,
    },
    {
      name: "unknown root flag before help",
      argv: ["node", "steelengine", "--unknown", "--help"],
      expected: false,
    },
    {
      name: "unknown root flag after help",
      argv: ["node", "steelengine", "--help", "--unknown"],
      expected: false,
    },
  ])("detects root-only help invocations: $name", ({ argv, expected }) => {
    expect(isRootHelpInvocation(argv)).toBe(expected);
  });

  it.each([
    {
      name: "single command with trailing flag",
      argv: ["node", "steelengine", "status", "--json"],
      expected: ["status"],
    },
    {
      name: "two-part command",
      argv: ["node", "steelengine", "agents", "list"],
      expected: ["agents", "list"],
    },
    {
      name: "terminator cuts parsing",
      argv: ["node", "steelengine", "status", "--", "ignored"],
      expected: ["status"],
    },
  ])("extracts command path: $name", ({ argv, expected }) => {
    expect(getCommandPathWithRootOptions(argv, 2)).toEqual(expected);
  });

  it("extracts command path while skipping known root option values", () => {
    expect(
      getCommandPathWithRootOptions(
        [
          "node",
          "steelengine",
          "--profile",
          "work",
          "--container",
          "demo",
          "--no-color",
          "config",
          "validate",
        ],
        2,
      ),
    ).toEqual(["config", "validate"]);
  });

  it("extracts routed config get positionals with interleaved root options", () => {
    expect(
      getCommandPositionalsWithRootOptions(
        ["node", "steelengine", "config", "get", "--log-level", "debug", "update.channel", "--json"],
        {
          commandPath: ["config", "get"],
          booleanFlags: ["--json"],
        },
      ),
    ).toEqual(["update.channel"]);
  });

  it("extracts routed config unset positionals with interleaved root options", () => {
    expect(
      getCommandPositionalsWithRootOptions(
        ["node", "steelengine", "config", "unset", "--profile", "work", "update.channel"],
        {
          commandPath: ["config", "unset"],
        },
      ),
    ).toEqual(["update.channel"]);
  });

  it("returns null when routed command sees unknown options", () => {
    expect(
      getCommandPositionalsWithRootOptions(
        ["node", "steelengine", "config", "get", "--mystery", "value", "update.channel"],
        {
          commandPath: ["config", "get"],
          booleanFlags: ["--json"],
        },
      ),
    ).toBeNull();
  });

  it.each([
    {
      name: "returns first command token",
      argv: ["node", "steelengine", "agents", "list"],
      expected: "agents",
    },
    {
      name: "returns null when no command exists",
      argv: ["node", "steelengine"],
      expected: null,
    },
    {
      name: "skips known root option values",
      argv: ["node", "steelengine", "--log-level", "debug", "status"],
      expected: "status",
    },
  ])("returns primary command: $name", ({ argv, expected }) => {
    expect(getPrimaryCommand(argv)).toBe(expected);
  });

  it.each([
    {
      name: "detects flag before terminator",
      argv: ["node", "steelengine", "status", "--json"],
      flag: "--json",
      expected: true,
    },
    {
      name: "ignores flag after terminator",
      argv: ["node", "steelengine", "--", "--json"],
      flag: "--json",
      expected: false,
    },
  ])("parses boolean flags: $name", ({ argv, flag, expected }) => {
    expect(hasFlag(argv, flag)).toBe(expected);
  });

  it.each([
    {
      name: "value in next token",
      argv: ["node", "steelengine", "status", "--timeout", "5000"],
      expected: "5000",
    },
    {
      name: "value in equals form",
      argv: ["node", "steelengine", "status", "--timeout=2500"],
      expected: "2500",
    },
    {
      name: "missing value",
      argv: ["node", "steelengine", "status", "--timeout"],
      expected: null,
    },
    {
      name: "next token is another flag",
      argv: ["node", "steelengine", "status", "--timeout", "--json"],
      expected: null,
    },
    {
      name: "flag appears after terminator",
      argv: ["node", "steelengine", "--", "--timeout=99"],
      expected: undefined,
    },
    {
      name: "repeated flag uses final value",
      argv: ["node", "steelengine", "status", "--timeout", "100", "--timeout=200"],
      expected: "200",
    },
    {
      name: "missing repeated value remains invalid",
      argv: ["node", "steelengine", "status", "--timeout", "--timeout", "200"],
      expected: null,
    },
  ])("extracts flag values: $name", ({ argv, expected }) => {
    expect(getFlagValue(argv, "--timeout")).toBe(expected);
  });

  it("parses verbose flags", () => {
    expect(getVerboseFlag(["node", "steelengine", "status", "--verbose"])).toBe(true);
    expect(getVerboseFlag(["node", "steelengine", "status", "--debug"])).toBe(false);
    expect(getVerboseFlag(["node", "steelengine", "status", "--debug"], { includeDebug: true })).toBe(
      true,
    );
  });

  it.each([
    {
      name: "missing flag",
      argv: ["node", "steelengine", "status"],
      expected: undefined,
    },
    {
      name: "missing value",
      argv: ["node", "steelengine", "status", "--timeout"],
      expected: null,
    },
    {
      name: "valid positive integer",
      argv: ["node", "steelengine", "status", "--timeout", "5000"],
      expected: 5000,
    },
    {
      name: "valid signed decimal positive integer",
      argv: ["node", "steelengine", "status", "--timeout", "+5000"],
      expected: 5000,
    },
    {
      name: "invalid integer",
      argv: ["node", "steelengine", "status", "--timeout", "nope"],
      expected: null,
    },
    {
      name: "non-decimal integer",
      argv: ["node", "steelengine", "status", "--timeout", "0x10"],
      expected: null,
    },
    {
      name: "partial integer",
      argv: ["node", "steelengine", "status", "--timeout", "5s"],
      expected: null,
    },
    {
      name: "zero",
      argv: ["node", "steelengine", "status", "--timeout", "0"],
      expected: null,
    },
    {
      name: "negative integer",
      argv: ["node", "steelengine", "status", "--timeout", "-5"],
      expected: null,
    },
    {
      name: "repeated value uses final valid integer",
      argv: ["node", "steelengine", "status", "--timeout", "nope", "--timeout", "5000"],
      expected: 5000,
    },
    {
      name: "repeated value rejects final invalid integer",
      argv: ["node", "steelengine", "status", "--timeout", "5000", "--timeout", "nope"],
      expected: null,
    },
  ])("parses positive integer flag values: $name", ({ argv, expected }) => {
    expect(getPositiveIntFlagValue(argv, "--timeout")).toBe(expected);
  });

  it.each([
    {
      name: "keeps plain node argv",
      rawArgs: ["node", "steelengine", "status"],
      expected: ["node", "steelengine", "status"],
    },
    {
      name: "keeps version-suffixed node binary",
      rawArgs: ["node-22", "steelengine", "status"],
      expected: ["node-22", "steelengine", "status"],
    },
    {
      name: "keeps windows versioned node exe",
      rawArgs: ["node-22.2.0.exe", "steelengine", "status"],
      expected: ["node-22.2.0.exe", "steelengine", "status"],
    },
    {
      name: "keeps dotted node binary",
      rawArgs: ["node-22.2", "steelengine", "status"],
      expected: ["node-22.2", "steelengine", "status"],
    },
    {
      name: "keeps dotted node exe",
      rawArgs: ["node-22.2.exe", "steelengine", "status"],
      expected: ["node-22.2.exe", "steelengine", "status"],
    },
    {
      name: "keeps absolute versioned node path",
      rawArgs: ["/usr/bin/node-22.2.0", "steelengine", "status"],
      expected: ["/usr/bin/node-22.2.0", "steelengine", "status"],
    },
    {
      name: "keeps node24 shorthand",
      rawArgs: ["node24", "steelengine", "status"],
      expected: ["node24", "steelengine", "status"],
    },
    {
      name: "keeps absolute node24 shorthand",
      rawArgs: ["/usr/bin/node24", "steelengine", "status"],
      expected: ["/usr/bin/node24", "steelengine", "status"],
    },
    {
      name: "keeps windows node24 exe",
      rawArgs: ["node24.exe", "steelengine", "status"],
      expected: ["node24.exe", "steelengine", "status"],
    },
    {
      name: "keeps nodejs binary",
      rawArgs: ["nodejs", "steelengine", "status"],
      expected: ["nodejs", "steelengine", "status"],
    },
    {
      name: "prefixes fallback when first arg is not a node launcher",
      rawArgs: ["node-dev", "steelengine", "status"],
      expected: ["node", "steelengine", "node-dev", "steelengine", "status"],
    },
    {
      name: "prefixes fallback when raw args start at program name",
      rawArgs: ["steelengine", "status"],
      expected: ["node", "steelengine", "status"],
    },
    {
      name: "keeps bun execution argv",
      rawArgs: ["bun", "src/entry.ts", "status"],
      expected: ["bun", "src/entry.ts", "status"],
    },
  ] as const)("builds parse argv from raw args: $name", ({ rawArgs, expected }) => {
    const parsed = buildParseArgv([...rawArgs]);
    expect(parsed).toEqual([...expected]);
  });

  it.each([
    { argv: ["node", "steelengine", "status"], expected: true },
    { argv: ["node", "steelengine", "health"], expected: false },
    { argv: ["node", "steelengine", "sessions"], expected: false },
    { argv: ["node", "steelengine", "--profile", "work", "status"], expected: true },
    { argv: ["node", "steelengine", "--log-level=debug", "models", "list"], expected: true },
    { argv: ["node", "steelengine", "config", "get", "update"], expected: false },
    { argv: ["node", "steelengine", "config", "unset", "update"], expected: false },
    { argv: ["node", "steelengine", "models", "list"], expected: true },
    { argv: ["node", "steelengine", "models", "status"], expected: true },
    { argv: ["node", "steelengine", "update", "status", "--json"], expected: false },
    { argv: ["node", "steelengine", "agent", "--message", "hi"], expected: true },
    { argv: ["node", "steelengine", "agents", "list"], expected: true },
    { argv: ["node", "steelengine", "message", "send"], expected: true },
  ] as const)("decides when to migrate state: $argv", ({ argv, expected }) => {
    const commandPath = getCommandPathWithRootOptions([...argv], 2);
    expect(shouldMigrateStateFromPath(commandPath)).toBe(expected);
  });

  it.each([
    { path: ["status"], expected: true },
    { path: ["update", "status"], expected: false },
    { path: ["config", "get"], expected: false },
    { path: ["agent"], expected: true },
    { path: ["models", "status"], expected: true },
    { path: ["agents", "list"], expected: true },
  ])("reuses command path for migrate state decisions: $path", ({ path, expected }) => {
    expect(shouldMigrateStateFromPath(path)).toBe(expected);
  });
});
