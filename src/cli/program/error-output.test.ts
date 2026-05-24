import { describe, expect, it } from "vitest";
import { formatCliParseErrorOutput } from "./error-output.js";

describe("formatCliParseErrorOutput", () => {
  it("explains unknown commands with root help and plugin hints", () => {
    const output = formatCliParseErrorOutput("error: unknown command 'wat'\n", {
      argv: ["node", "recall", "wat"],
    });

    expect(output).toBe(
      'Recall does not know the command "wat".\nTry: recall --help\nPlugin command? recall plugins list\nDocs: https://docs.recall.ai/cli\n',
    );
  });

  it("points unknown options at the active command help", () => {
    const output = formatCliParseErrorOutput("error: unknown option '--wat'\n", {
      argv: ["node", "recall", "channels", "status", "--wat"],
    });

    expect(output).toBe(
      'Recall does not recognize option "--wat".\nTry: recall channels status --help\n',
    );
  });

  it("points missing required arguments at command help", () => {
    const output = formatCliParseErrorOutput("error: missing required argument 'name'\n", {
      argv: ["node", "recall", "plugins", "install"],
    });

    expect(output).toBe(
      'Missing required argument "name".\nTry: recall plugins install --help\n',
    );
  });
});
