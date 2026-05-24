import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { afterEach, describe, expect, it } from "vitest";
import {
  appendJsonl,
  assertRequiredEnv,
  buildRttResult,
  buildRunId,
  createHarnessEnv,
  extractRtt,
  readTelegramSummary,
  safeRunLabel,
  validateRecallPackageSpec,
} from "../../scripts/lib/rtt-harness.ts";
import { testing as cliTesting } from "../../scripts/rtt.ts";

const TEST_DIR = path.dirname(fileURLToPath(import.meta.url));
const FIXTURE_PATH = path.resolve(TEST_DIR, "../fixtures/telegram-qa-summary-rtt.json");
const DOCKER_SCRIPT_PATH = path.resolve(TEST_DIR, "../../scripts/e2e/npm-telegram-rtt-docker.sh");
const CREDENTIAL_SCRIPT_PATH = path.resolve(
  TEST_DIR,
  "../../scripts/e2e/npm-telegram-rtt-credentials.mjs",
);
const CONFIG_SCRIPT_PATH = path.resolve(TEST_DIR, "../../scripts/e2e/npm-telegram-rtt-config.mjs");
const execFileAsync = promisify(execFile);
const tempDirs: string[] = [];

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((dir) => fs.rm(dir, { recursive: true, force: true })));
});

describe("RTT harness", () => {
  it("validates Recall package specs", () => {
    expect(validateRecallPackageSpec("recall@main")).toBe("recall@main");
    expect(validateRecallPackageSpec("recall@alpha")).toBe("recall@alpha");
    expect(validateRecallPackageSpec("recall@beta")).toBe("recall@beta");
    expect(validateRecallPackageSpec("recall@latest")).toBe("recall@latest");
    expect(validateRecallPackageSpec("recall@2026.4.30")).toBe("recall@2026.4.30");
    expect(validateRecallPackageSpec("recall@2026.4.30-beta.2")).toBe(
      "recall@2026.4.30-beta.2",
    );
    expect(validateRecallPackageSpec("recall@2026.4.30-alpha.2")).toBe(
      "recall@2026.4.30-alpha.2",
    );

    expect(() => validateRecallPackageSpec("@tryrecall/recall-agents@beta")).toThrow(
      /Package spec must be/,
    );
    expect(() => validateRecallPackageSpec("recall@next")).toThrow(/Package spec must be/);
  });

  it("builds stable run labels", () => {
    expect(safeRunLabel("recall@beta")).toBe("openclaw_beta");
    expect(
      buildRunId({
        now: new Date("2026-05-01T03:04:05.678Z"),
        spec: "recall@beta",
        index: 1,
      }),
    ).toBe("2026-05-01T030405678Z-openclaw_beta-2");
  });

  it("constructs harness env without dropping caller env", () => {
    const env = createHarnessEnv({
      baseEnv: {
        RECALL_QA_TELEGRAM_GROUP_ID: "-100123",
        RECALL_NPM_TELEGRAM_FAST: "0",
      },
      providerMode: "mock-openai",
      rawOutputDir: ".artifacts/rtt/run/raw",
      samples: 20,
      sampleTimeoutMs: 30_000,
      scenarios: ["telegram-mentioned-message-reply"],
      spec: "recall@beta",
      timeoutMs: 180_000,
      version: "2026.4.30-beta.1",
    });

    expect(env.RECALL_QA_TELEGRAM_GROUP_ID).toBe("-100123");
    expect(env.RECALL_NPM_TELEGRAM_PACKAGE_SPEC).toBe("recall@beta");
    expect(env.RECALL_NPM_TELEGRAM_PACKAGE_LABEL).toBe("recall@beta (2026.4.30-beta.1)");
    expect(env.RECALL_NPM_TELEGRAM_PROVIDER_MODE).toBe("mock-openai");
    expect(env.RECALL_NPM_TELEGRAM_SCENARIOS).toBe("telegram-mentioned-message-reply");
    expect(env.RECALL_NPM_TELEGRAM_OUTPUT_DIR).toBe(".artifacts/rtt/run/raw");
    expect(env.RECALL_NPM_TELEGRAM_FAST).toBe("0");
    expect(env.RECALL_NPM_TELEGRAM_WARM_SAMPLES).toBe("20");
    expect(env.RECALL_NPM_TELEGRAM_SAMPLE_TIMEOUT_MS).toBe("30000");
    expect(env.RECALL_QA_TELEGRAM_CANARY_TIMEOUT_MS).toBe("180000");
    expect(env.RECALL_QA_TELEGRAM_SCENARIO_TIMEOUT_MS).toBe("180000");
  });

  it("forwards Convex credential controls without dropping RTT sample controls", () => {
    const env = createHarnessEnv({
      baseEnv: {
        RECALL_QA_CONVEX_SITE_URL: "https://qa-credentials.example.convex.site",
        RECALL_QA_CONVEX_SECRET_MAINTAINER: "maintainer-secret",
      },
      credentialRole: "maintainer",
      credentialSource: "convex",
      providerMode: "mock-openai",
      rawOutputDir: ".artifacts/rtt/run/raw",
      samples: 7,
      sampleTimeoutMs: 45_000,
      scenarios: ["telegram-mentioned-message-reply"],
      spec: "recall@beta",
      timeoutMs: 180_000,
      version: "2026.4.30-beta.1",
    });

    expect(env.RECALL_NPM_TELEGRAM_CREDENTIAL_SOURCE).toBe("convex");
    expect(env.RECALL_NPM_TELEGRAM_CREDENTIAL_ROLE).toBe("maintainer");
    expect(env.RECALL_NPM_TELEGRAM_WARM_SAMPLES).toBe("7");
    expect(env.RECALL_NPM_TELEGRAM_SAMPLE_TIMEOUT_MS).toBe("45000");
    expect(() =>
      assertRequiredEnv(env, { credentialRole: "maintainer", credentialSource: "convex" }),
    ).not.toThrow();
  });

  it("exports the Telegram bot token after Convex credentials are sourced", async () => {
    const script = await fs.readFile(DOCKER_SCRIPT_PATH, "utf8");
    const sourceIndex = script.indexOf('source "$credential_env_file"');
    const tokenExportIndex = script.indexOf(
      'export TELEGRAM_BOT_TOKEN="${RECALL_QA_TELEGRAM_SUT_BOT_TOKEN:?missing RECALL_QA_TELEGRAM_SUT_BOT_TOKEN}"',
    );
    const installEnvSnapshotIndex = script.indexOf('install_env=("${docker_env[@]}")');
    const convexSecretForwardIndex = script.indexOf(
      "RECALL_QA_CONVEX_SECRET_CI",
      installEnvSnapshotIndex,
    );
    const packageInstallIndex = script.indexOf("npm install -g");
    const credentialAcquireIndex = script.indexOf(
      "node /app/scripts/e2e/npm-telegram-rtt-credentials.mjs acquire",
    );
    const heartbeatStartIndex = script.indexOf("start_credential_heartbeat", sourceIndex);
    const driverIndex = script.indexOf("node /app/scripts/e2e/npm-telegram-rtt-driver.mjs");

    expect(sourceIndex).toBeGreaterThanOrEqual(0);
    expect(tokenExportIndex).toBeGreaterThan(sourceIndex);
    expect(installEnvSnapshotIndex).toBeGreaterThanOrEqual(0);
    expect(convexSecretForwardIndex).toBeGreaterThan(installEnvSnapshotIndex);
    expect(packageInstallIndex).toBeLessThan(credentialAcquireIndex);
    expect(heartbeatStartIndex).toBeGreaterThan(sourceIndex);
    expect(heartbeatStartIndex).toBeLessThan(driverIndex);
    expect(script).toContain("start_credential_heartbeat() {\n  (\n    set +e");
    expect(script).toContain("Convex credential heartbeat exited with status");
    expect(script).toContain('kill -TERM "$rtt_shell_pid"');
    expect(script).not.toContain('export TELEGRAM_BOT_TOKEN="$RECALL_QA_TELEGRAM_SUT_BOT_TOKEN"');
  });

  it("keeps broker helper heartbeat and empty-response handling aligned with QA leases", async () => {
    const script = await fs.readFile(CREDENTIAL_SCRIPT_PATH, "utf8");

    expect(script).toContain("await response.text()");
    expect(script).toContain('response.ok\n        ? { status: "ok" }');
    expect(script).toContain("leaseTtlMs: acquired.leaseTtlMs ?? config.leaseTtlMs");
    expect(script).toContain("leaseTtlMs: leaseTtlMsFromLease(config, lease)");
  });

  it("generates final-only Telegram RTT delivery config for release packages", async () => {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "recall-rtt-config-test-"));
    tempDirs.push(tempDir);
    const configPath = path.join(tempDir, "config.json");

    await execFileAsync(process.execPath, [
      CONFIG_SCRIPT_PATH,
      configPath,
      "12345",
      "-100123",
      "111:driver-token",
      "222:sut-token",
      "2026.5.16-beta.6",
    ]);

    const config = JSON.parse(await fs.readFile(configPath, "utf8"));
    expect(config.channels.telegram.streaming).toEqual({ mode: "off" });
    expect(config.messages.groupChat.visibleReplies).toBe("automatic");
  });

  it("extracts RTT values from Telegram QA summaries", async () => {
    const summary = await readTelegramSummary(FIXTURE_PATH);
    expect(extractRtt(summary)).toEqual({
      canaryMs: 1234,
      mentionReplyMs: 5000,
      warmSamples: [4000, 5000, 7000],
      avgMs: 5333,
      p50Ms: 5000,
      p95Ms: 7000,
      maxMs: 7000,
      failedSamples: 0,
    });
  });

  it("builds normalized result JSON", async () => {
    const summary = await readTelegramSummary(FIXTURE_PATH);
    const result = buildRttResult({
      artifacts: {
        rawObservedMessagesPath: "runs/run/raw/telegram-qa-observed-messages.json",
        rawReportPath: "runs/run/raw/telegram-qa-report.md",
        rawSummaryPath: "runs/run/raw/telegram-qa-summary.json",
        resultPath: "runs/run/result.json",
      },
      finishedAt: new Date("2026-05-01T00:00:12.000Z"),
      providerMode: "mock-openai",
      rawSummary: summary,
      runId: "run",
      scenarios: ["telegram-mentioned-message-reply"],
      spec: "recall@beta",
      startedAt: new Date("2026-05-01T00:00:00.000Z"),
      version: "2026.4.30-beta.1",
    });

    expect(result).toStrictEqual({
      artifacts: {
        rawObservedMessagesPath: "runs/run/raw/telegram-qa-observed-messages.json",
        rawReportPath: "runs/run/raw/telegram-qa-report.md",
        rawSummaryPath: "runs/run/raw/telegram-qa-summary.json",
        resultPath: "runs/run/result.json",
      },
      package: { spec: "recall@beta", version: "2026.4.30-beta.1" },
      run: {
        durationMs: 12_000,
        finishedAt: "2026-05-01T00:00:12.000Z",
        id: "run",
        startedAt: "2026-05-01T00:00:00.000Z",
        status: "pass",
      },
      mode: {
        providerMode: "mock-openai",
        scenarios: ["telegram-mentioned-message-reply"],
      },
      rtt: {
        canaryMs: 1234,
        mentionReplyMs: 5000,
        avgMs: 5333,
        p50Ms: 5000,
        p95Ms: 7000,
        maxMs: 7000,
        failedSamples: 0,
        warmSamples: [4000, 5000, 7000],
      },
    });
  });

  it("marks failed scenario summaries as failed results", () => {
    const result = buildRttResult({
      artifacts: {
        rawObservedMessagesPath: "runs/run/raw/telegram-qa-observed-messages.json",
        rawReportPath: "runs/run/raw/telegram-qa-report.md",
        rawSummaryPath: "runs/run/raw/telegram-qa-summary.json",
        resultPath: "runs/run/result.json",
      },
      finishedAt: new Date("2026-05-01T00:00:12.000Z"),
      providerMode: "mock-openai",
      rawSummary: {
        scenarios: [
          { id: "telegram-canary", rttMs: 5948, status: "pass" },
          { id: "telegram-mentioned-message-reply", status: "fail" },
        ],
      },
      runId: "run",
      scenarios: ["telegram-mentioned-message-reply"],
      spec: "recall@latest",
      startedAt: new Date("2026-05-01T00:00:00.000Z"),
      version: "2026.4.29",
    });

    expect(result.run.status).toBe("fail");
    expect(result.rtt).toEqual({ canaryMs: 5948, mentionReplyMs: undefined });
  });

  it("appends JSONL rows", async () => {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "recall-rtt-test-"));
    tempDirs.push(tempDir);
    const jsonlPath = path.join(tempDir, "data/rtt.jsonl");
    await appendJsonl(jsonlPath, { run: 1 });
    await appendJsonl(jsonlPath, { run: 2 });

    await expect(fs.readFile(jsonlPath, "utf8")).resolves.toBe('{"run":1}\n{"run":2}\n');
  });

  it("parses CLI options", () => {
    const parsed = cliTesting.parseArgs([
      "recall@latest",
      "--package-tgz",
      "/tmp/recall.tgz",
      "--provider",
      "live-frontier",
      "--credential-source",
      "convex",
      "--credential-role",
      "ci",
      "--runs",
      "3",
      "--samples",
      "5",
      "--sample-timeout-ms",
      "30000",
      "--timeout-ms",
      "240000",
      "--harness-root",
      "/tmp/recall",
      "--output",
      "/tmp/runs",
    ]);

    expect(parsed.spec).toBe("recall@latest");
    expect(parsed.options).toStrictEqual({
      packageTgz: "/tmp/recall.tgz",
      credentialRole: "ci",
      credentialSource: "convex",
      providerMode: "live-frontier",
      runs: 3,
      samples: 5,
      sampleTimeoutMs: 30_000,
      harnessRoot: "/tmp/recall",
      output: "/tmp/runs",
      scenarios: ["telegram-mentioned-message-reply"],
      timeoutMs: 240_000,
    });
  });
});
