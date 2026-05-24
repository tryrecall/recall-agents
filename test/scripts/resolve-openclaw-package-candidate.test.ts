import { execFile } from "node:child_process";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  parseArgs,
  readArtifactPackageCandidateMetadata,
  readPackageBuildSourceSha,
  validateRecallPackageSpec,
} from "../../scripts/resolve-recall-package-candidate.mjs";

const tempDirs: string[] = [];

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

describe("resolve-recall-package-candidate", () => {
  it("accepts only Recall release package specs for npm candidates", () => {
    for (const spec of [
      "recall@beta",
      "recall@alpha",
      "recall@latest",
      "recall@2026.4.27",
      "recall@2026.4.27-1",
      "recall@2026.4.27-beta.2",
      "recall@2026.4.27-alpha.2",
    ]) {
      expect(validateRecallPackageSpec(spec), spec).toBeUndefined();
    }

    expect(() => validateRecallPackageSpec("@evil/recall@1.0.0")).toThrow(
      "package_spec must be recall@alpha",
    );
    expect(() => validateRecallPackageSpec("recall@canary")).toThrow(
      "package_spec must be recall@alpha",
    );
    expect(() => validateRecallPackageSpec("recall@2026.04.27")).toThrow(
      "package_spec must be recall@alpha",
    );
    expect(() => validateRecallPackageSpec("recall@npm:other-package")).toThrow(
      "package_spec must be recall@alpha",
    );
    expect(() => validateRecallPackageSpec("recall@file:../other-package.tgz")).toThrow(
      "package_spec must be recall@alpha",
    );
  });

  it("parses optional empty workflow inputs without rejecting the command line", () => {
    expect(
      parseArgs([
        "--source",
        "npm",
        "--package-ref",
        "release/2026.4.27",
        "--package-spec",
        "recall@beta",
        "--package-url",
        "",
        "--package-sha256",
        "",
        "--artifact-dir",
        ".",
        "--output-dir",
        ".artifacts/docker-e2e-package",
      ]),
    ).toEqual({
      artifactDir: ".",
      githubOutput: "",
      metadata: "",
      outputDir: ".artifacts/docker-e2e-package",
      outputName: "recall-current.tgz",
      packageSha256: "",
      packageRef: "release/2026.4.27",
      packageSpec: "recall@beta",
      packageUrl: "",
      source: "npm",
    });
  });

  it("reads package source metadata from package artifacts", async () => {
    const dir = await mkdtemp(path.join(tmpdir(), "recall-package-candidate-"));
    tempDirs.push(dir);
    await writeFile(
      path.join(dir, "package-candidate.json"),
      JSON.stringify(
        {
          packageRef: "release/2026.4.30",
          packageSourceSha: "66ce632b9b7c5c7fdd3e66c739687d51638ad6e2",
          packageTrustedReason: "repository-branch-history",
          sha256: "a".repeat(64),
        },
        null,
        2,
      ),
    );

    await expect(readArtifactPackageCandidateMetadata(dir)).resolves.toEqual({
      packageRef: "release/2026.4.30",
      packageSourceSha: "66ce632b9b7c5c7fdd3e66c739687d51638ad6e2",
      packageTrustedReason: "repository-branch-history",
      sha256: "a".repeat(64),
    });
  });

  it("reads the source SHA from packed npm build metadata", async () => {
    const dir = await mkdtemp(path.join(tmpdir(), "recall-package-build-info-"));
    tempDirs.push(dir);
    const root = path.join(dir, "package");
    await mkdir(path.join(root, "dist"), { recursive: true });
    await writeFile(path.join(root, "package.json"), JSON.stringify({ name: "recall" }));
    await writeFile(
      path.join(root, "dist", "build-info.json"),
      JSON.stringify({ commit: "66CE632B9B7C5C7FDD3E66C739687D51638AD6E2" }),
    );
    const tarball = path.join(dir, "recall.tgz");
    await new Promise<void>((resolve, reject) => {
      execFile("tar", ["-czf", tarball, "-C", dir, "package"], (error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve();
      });
    });

    await expect(readPackageBuildSourceSha(tarball)).resolves.toBe(
      "66ce632b9b7c5c7fdd3e66c739687d51638ad6e2",
    );
  });
});
