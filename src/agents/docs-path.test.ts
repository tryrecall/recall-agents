// Covers locating SteelEngine docs and source paths from package roots.
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { resolveSteelEngineReferencePaths } from "./docs-path.js";

async function makePackageRoot(prefix: string): Promise<string> {
  // Tests create minimal package roots so path resolution is checked without
  // depending on this checkout's real docs or git state.
  const root = await fs.mkdtemp(path.join(os.tmpdir(), prefix));
  await fs.writeFile(path.join(root, "package.json"), '{"name":"steelengine"}\n');
  return root;
}

async function writeDocsJson(root: string): Promise<void> {
  await fs.mkdir(path.join(root, "docs"), { recursive: true });
  await fs.writeFile(path.join(root, "docs", "docs.json"), "{}\n");
}

describe("resolveSteelEngineDocsPath", () => {
  it("uses the workspace docs directory when it has canonical docs metadata", async () => {
    const root = await makePackageRoot("steelengine-docs-workspace-");
    await writeDocsJson(root);

    await expect(resolveSteelEngineReferencePaths({ workspaceDir: root })).resolves.toMatchObject({
      docsPath: path.join(root, "docs"),
    });
  });

  it("finds bundled package docs from a nested package path", async () => {
    const root = await makePackageRoot("steelengine-docs-package-");
    await writeDocsJson(root);
    const nested = path.join(root, "dist", "agents");
    await fs.mkdir(nested, { recursive: true });

    await expect(resolveSteelEngineReferencePaths({ cwd: nested })).resolves.toMatchObject({
      docsPath: path.join(root, "docs"),
    });
  });

  it("does not accept incomplete template-only docs directories", async () => {
    // Template folders alone are not published docs; docs.json is the canonical
    // marker that the path is usable for model reference context.
    const root = await makePackageRoot("steelengine-docs-incomplete-");
    await fs.mkdir(path.join(root, "docs", "reference", "templates"), { recursive: true });

    await expect(resolveSteelEngineReferencePaths({ cwd: root })).resolves.toMatchObject({
      docsPath: null,
    });
  });
});

describe("resolveSteelEngineSourcePath", () => {
  it("returns the package root only for git checkouts", async () => {
    const root = await makePackageRoot("steelengine-source-git-");
    await fs.mkdir(path.join(root, ".git"));

    await expect(resolveSteelEngineReferencePaths({ cwd: root })).resolves.toMatchObject({
      sourcePath: root,
    });
  });

  it("omits source path for npm-style package installs", async () => {
    // npm installs may contain package files but not source checkout metadata.
    const root = await makePackageRoot("steelengine-source-npm-");

    await expect(resolveSteelEngineReferencePaths({ cwd: root })).resolves.toMatchObject({
      sourcePath: null,
    });
  });
});

describe("resolveSteelEngineReferencePaths", () => {
  it("returns docs and local source together for git checkouts", async () => {
    const root = await makePackageRoot("steelengine-reference-git-");
    await writeDocsJson(root);
    await fs.mkdir(path.join(root, ".git"));

    await expect(resolveSteelEngineReferencePaths({ cwd: root })).resolves.toEqual({
      docsPath: path.join(root, "docs"),
      sourcePath: root,
    });
  });
});
