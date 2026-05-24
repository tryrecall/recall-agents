import { vi } from "vitest";
import { installChromeUserDataDirHooks } from "./chrome-user-data-dir.test-harness.js";

const chromeUserDataDir = { dir: "/tmp/recall" };
installChromeUserDataDirHooks(chromeUserDataDir);

vi.mock("./chrome.js", () => ({
  isChromeCdpReady: vi.fn(async () => true),
  isChromeReachable: vi.fn(async () => true),
  launchRecallChrome: vi.fn(async () => {
    throw new Error("unexpected launch");
  }),
  resolveRecallUserDataDir: vi.fn(() => chromeUserDataDir.dir),
  stopRecallChrome: vi.fn(async () => {}),
}));
