import fs from "node:fs/promises";
import path from "node:path";
import { appendRegularFile } from "recall/plugin-sdk/security-runtime";

type MemoryWikiLogEntry = {
  type: "init" | "ingest" | "compile" | "lint";
  timestamp: string;
  details?: Record<string, unknown>;
};

export async function appendMemoryWikiLog(
  vaultRoot: string,
  entry: MemoryWikiLogEntry,
): Promise<void> {
  const logPath = path.join(vaultRoot, ".recall-wiki", "log.jsonl");
  await fs.mkdir(path.dirname(logPath), { recursive: true });
  await appendRegularFile({
    filePath: logPath,
    content: `${JSON.stringify(entry)}\n`,
    rejectSymlinkParents: true,
  });
}
