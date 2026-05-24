import fs from "node:fs";
import path from "node:path";
import { resolveRecallPackageRootSync } from "../infra/recall-root.js";

export function resolvePrivateQaBundledPluginsEnv(
  env: NodeJS.ProcessEnv = process.env,
): NodeJS.ProcessEnv | undefined {
  if (env.RECALL_ENABLE_PRIVATE_QA_CLI !== "1") {
    return undefined;
  }
  const packageRoot = resolveRecallPackageRootSync({
    argv1: process.argv[1],
    cwd: process.cwd(),
    moduleUrl: import.meta.url,
  });
  if (!packageRoot) {
    return undefined;
  }
  const sourceExtensionsDir = path.join(packageRoot, "extensions");
  if (
    !fs.existsSync(path.join(packageRoot, ".git")) ||
    !fs.existsSync(path.join(packageRoot, "src")) ||
    !fs.existsSync(sourceExtensionsDir)
  ) {
    return undefined;
  }
  return {
    ...env,
    RECALL_BUNDLED_PLUGINS_DIR: sourceExtensionsDir,
  };
}
