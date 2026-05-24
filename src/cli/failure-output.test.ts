import { describe, expect, it } from "vitest";
import { formatCliFailureLines } from "./failure-output.js";

describe("formatCliFailureLines", () => {
  it("shows a concise reason and recovery commands by default", () => {
    const lines = formatCliFailureLines({
      title: "Could not start the CLI.",
      error: new Error("config file is invalid"),
      argv: ["node", "recall", "status"],
      env: {},
    });

    expect(lines).toEqual([
      "[recall] Could not start the CLI.",
      "[recall] Reason: config file is invalid",
      "[recall] Debug: set RECALL_DEBUG=1 to include the stack trace.",
      "[recall] Try: recall doctor",
      "[recall] Help: recall --help",
    ]);
  });

  it("prints stack details when debug output is requested", () => {
    const lines = formatCliFailureLines({
      title: "The CLI command failed.",
      error: new Error("boom"),
      env: { RECALL_DEBUG: "1" },
    });

    expect(lines.slice(0, 4)).toEqual([
      "[recall] The CLI command failed.",
      "[recall] Reason: boom",
      "[recall] Stack:",
      "[recall] Error: boom",
    ]);
    expect(lines.join("\n")).toContain("Error: boom");
  });
});
