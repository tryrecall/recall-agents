import fs from "node:fs/promises";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useAutoCleanupTempDirTracker } from "../../test/helpers/temp-dir.js";

const resolvePreferredSteelEngineTmpDirMock = vi.hoisted(() => vi.fn());

vi.mock("./tmp-steelengine-dir.js", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./tmp-steelengine-dir.js")>();
  return {
    ...actual,
    resolvePreferredSteelEngineTmpDir: resolvePreferredSteelEngineTmpDirMock,
  };
});

import { withTempDir } from "./install-source-utils.js";

describe("withTempDir private root", () => {
  const tempDirs = useAutoCleanupTempDirTracker(afterEach);

  it.runIf(process.platform !== "win32")(
    "preserves parent temp root permissions when using private SteelEngine temp root",
    async () => {
      const mockParentRoot = tempDirs.make("steelengine-chmod-test-");
      const mockSteelEngineDir = path.join(mockParentRoot, "steelengine");

      await fs.mkdir(mockSteelEngineDir, { recursive: true });
      await fs.chmod(mockParentRoot, 0o1777);
      const canonicalSteelEngineDir = await fs.realpath(mockSteelEngineDir);

      resolvePreferredSteelEngineTmpDirMock.mockReturnValue(mockSteelEngineDir);

      let observedDir = "";
      const value = await withTempDir("steelengine-test-", async (tmpDir) => {
        observedDir = tmpDir;
        expect(path.dirname(tmpDir)).toBe(canonicalSteelEngineDir);
        await fs.writeFile(path.join(tmpDir, "marker.txt"), "ok");
        return "done";
      });

      expect(value).toBe("done");

      await expect(
        fs.stat(observedDir).then(
          () => true,
          () => false,
        ),
      ).resolves.toBe(false);

      const privateRootStat = await fs.stat(mockSteelEngineDir);
      expect(privateRootStat.mode & 0o7777).toBe(0o700);

      const parentStat = await fs.stat(mockParentRoot);
      expect(parentStat.mode & 0o7777).toBe(0o1777);
    },
  );
});
