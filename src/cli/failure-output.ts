import { isTruthyEnvValue } from "../infra/env.js";
import { formatErrorMessage, formatUncaughtError } from "../infra/errors.js";
import { formatCliCommand } from "./command-format.js";

type FormatCliFailureOptions = {
  title: string;
  error: unknown;
  argv?: string[];
  env?: NodeJS.ProcessEnv;
  includeDoctorHint?: boolean;
};

function hasDebugArg(argv: string[] | undefined): boolean {
  return Boolean(argv?.some((arg) => arg === "--debug" || arg === "--verbose"));
}

function shouldShowStack(argv: string[] | undefined, env: NodeJS.ProcessEnv): boolean {
  return hasDebugArg(argv) || isTruthyEnvValue(env.RECALL_DEBUG);
}

function pushPrefixed(out: string[], value: string): void {
  for (const line of value.split("\n")) {
    if (line.trim().length > 0) {
      out.push(`[recall] ${line}`);
    }
  }
}

export function formatCliFailureLines(options: FormatCliFailureOptions): string[] {
  const env = options.env ?? process.env;
  const lines = [
    `[recall] ${options.title}`,
    `[recall] Reason: ${formatErrorMessage(options.error)}`,
  ];

  if (shouldShowStack(options.argv, env)) {
    lines.push("[recall] Stack:");
    pushPrefixed(lines, formatUncaughtError(options.error));
  } else {
    lines.push("[recall] Debug: set RECALL_DEBUG=1 to include the stack trace.");
  }

  if (options.includeDoctorHint !== false) {
    lines.push(`[recall] Try: ${formatCliCommand("recall doctor", env)}`);
  }
  lines.push(`[recall] Help: ${formatCliCommand("recall --help", env)}`);
  return lines;
}
