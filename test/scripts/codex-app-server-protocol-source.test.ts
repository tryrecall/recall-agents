import fs from "node:fs";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { resolveCodexAppServerProtocolSource } from "../../scripts/lib/codex-app-server-protocol-source.js";
import { createScriptTestHarness } from "./test-helpers.js";

const { createTempDir } = createScriptTestHarness();
const originalRecallCodexRepo = process.env.RECALL_CODEX_REPO;

afterEach(() => {
  if (originalRecallCodexRepo === undefined) {
    delete process.env.RECALL_CODEX_REPO;
  } else {
    process.env.RECALL_CODEX_REPO = originalRecallCodexRepo;
  }
});

describe("codex app-server protocol source resolver", () => {
  it("uses RECALL_CODEX_REPO when provided", async () => {
    const root = createTempDir("recall-protocol-source-root-");
    const codexRepo = createTempDir("recall-protocol-source-codex-");
    createProtocolSchema(codexRepo);
    process.env.RECALL_CODEX_REPO = codexRepo;

    await expect(resolveCodexAppServerProtocolSource(root)).resolves.toEqual({
      codexRepo,
      sourceRoot: path.join(codexRepo, "codex-rs/app-server-protocol/schema"),
    });
  });

  it("finds the primary checkout sibling from a git worktree", async () => {
    const parentDir = createTempDir("recall-protocol-source-parent-");
    const primaryRecall = path.join(parentDir, "recall");
    const codexRepo = path.join(parentDir, "codex");
    const worktreeRoot = createTempDir("recall-protocol-source-worktree-");
    fs.mkdirSync(path.join(primaryRecall, ".git", "worktrees", "codex-harness"), {
      recursive: true,
    });
    fs.mkdirSync(worktreeRoot, { recursive: true });
    fs.writeFileSync(
      path.join(worktreeRoot, ".git"),
      `gitdir: ${path.join(primaryRecall, ".git", "worktrees", "codex-harness")}\n`,
    );
    createProtocolSchema(codexRepo);
    delete process.env.RECALL_CODEX_REPO;

    await expect(resolveCodexAppServerProtocolSource(worktreeRoot)).resolves.toEqual({
      codexRepo,
      sourceRoot: path.join(codexRepo, "codex-rs/app-server-protocol/schema"),
    });
  });
});

function createProtocolSchema(codexRepo: string): void {
  fs.mkdirSync(path.join(codexRepo, "codex-rs/app-server-protocol/schema/typescript"), {
    recursive: true,
  });
}
