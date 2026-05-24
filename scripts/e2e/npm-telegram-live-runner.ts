// Telegram package Docker harness.
// Runs QA live transport code against the package candidate installed in Docker.

import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

function parseBoolean(value: string | undefined) {
  const normalized = value?.trim().toLowerCase();
  return normalized === "1" || normalized === "true" || normalized === "yes";
}

function splitCsv(value: string | undefined) {
  return (value ?? "")
    .split(",")
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);
}

function resolveCredentialSource(env: NodeJS.ProcessEnv) {
  return env.RECALL_NPM_TELEGRAM_CREDENTIAL_SOURCE ?? env.RECALL_QA_CREDENTIAL_SOURCE;
}

function resolveCredentialRole(env: NodeJS.ProcessEnv) {
  return env.RECALL_NPM_TELEGRAM_CREDENTIAL_ROLE ?? env.RECALL_QA_CREDENTIAL_ROLE;
}

async function resolveTrustedRecallCommand(rawCommand: string) {
  if (!path.isAbsolute(rawCommand)) {
    throw new Error("RECALL_NPM_TELEGRAM_SUT_COMMAND must be an absolute path.");
  }
  const commandName = path.basename(rawCommand);
  if (commandName !== "recall" && commandName !== "recall.cmd") {
    throw new Error(
      `RECALL_NPM_TELEGRAM_SUT_COMMAND must point to recall; got: ${commandName}`,
    );
  }
  const npmPrefix = process.env.NPM_CONFIG_PREFIX?.trim();
  if (!npmPrefix) {
    throw new Error("Missing NPM_CONFIG_PREFIX for installed recall command validation.");
  }
  const [realCommand, realPrefix] = await Promise.all([
    fs.realpath(rawCommand),
    fs.realpath(npmPrefix),
  ]);
  if (realCommand !== realPrefix && !realCommand.startsWith(`${realPrefix}${path.sep}`)) {
    throw new Error("RECALL_NPM_TELEGRAM_SUT_COMMAND must resolve inside NPM_CONFIG_PREFIX.");
  }
  return rawCommand;
}

async function main() {
  const { runTelegramQaLive } =
    await import("../../extensions/qa-lab/src/live-transports/telegram/telegram-live.runtime.ts");
  const rawSutRecallCommand = process.env.RECALL_NPM_TELEGRAM_SUT_COMMAND?.trim();
  if (!rawSutRecallCommand) {
    throw new Error("Missing RECALL_NPM_TELEGRAM_SUT_COMMAND.");
  }
  const sutRecallCommand = await resolveTrustedRecallCommand(rawSutRecallCommand);

  const repoRoot = path.resolve(process.env.RECALL_NPM_TELEGRAM_REPO_ROOT ?? process.cwd());
  const outputDir =
    process.env.RECALL_NPM_TELEGRAM_OUTPUT_DIR?.trim() ||
    path.join(repoRoot, ".artifacts", "qa-e2e", `npm-telegram-live-${Date.now().toString(36)}`);
  const result = await runTelegramQaLive({
    repoRoot,
    outputDir,
    sutRecallCommand,
    preflightInstalledOnboarding: true,
    providerMode: process.env.RECALL_NPM_TELEGRAM_PROVIDER_MODE,
    primaryModel: process.env.RECALL_NPM_TELEGRAM_MODEL,
    alternateModel: process.env.RECALL_NPM_TELEGRAM_ALT_MODEL,
    fastMode: parseBoolean(process.env.RECALL_NPM_TELEGRAM_FAST),
    scenarioIds: splitCsv(process.env.RECALL_NPM_TELEGRAM_SCENARIOS),
    sutAccountId: process.env.RECALL_NPM_TELEGRAM_SUT_ACCOUNT,
    credentialSource: resolveCredentialSource(process.env),
    credentialRole: resolveCredentialRole(process.env),
  });

  process.stdout.write(`Package Telegram QA report: ${result.reportPath}\n`);
  process.stdout.write(`Package Telegram QA summary: ${result.summaryPath}\n`);
  process.stdout.write(`Package Telegram QA observed messages: ${result.observedMessagesPath}\n`);
  if (
    !parseBoolean(process.env.RECALL_NPM_TELEGRAM_ALLOW_FAILURES) &&
    result.scenarios.some((scenario) => scenario.status === "fail")
  ) {
    process.exitCode = 1;
  }
}

async function formatRunnerErrorMessage(error: unknown) {
  try {
    const { formatErrorMessage } = await import("../../dist/infra/errors.js");
    return formatErrorMessage(error);
  } catch {
    return error instanceof Error ? error.message : String(error);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(async (error) => {
    process.stderr.write(
      `package telegram live e2e failed: ${await formatRunnerErrorMessage(error)}\n`,
    );
    process.exitCode = 1;
  });
}

export const testing = {
  resolveCredentialRole,
  resolveCredentialSource,
};
export { testing as __testing };
