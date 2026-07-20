// Error output tests cover program-level error display and exit messaging.
import { describe, expect, it } from "vitest";
import { formatCliParseErrorOutput } from "./error-output.js";

describe("formatCliParseErrorOutput", () => {
  it("explains unknown commands with root help and plugin hints", () => {
    const output = formatCliParseErrorOutput("error: unknown command 'wat'\n", {
      argv: ["node", "steelengine", "wat"],
    });

    expect(output).toBe(
      'SteelEngine does not know the command "wat".\nTry: steelengine --help\nPlugin command? steelengine plugins list\nDocs: https://docs.steelengine.ai/cli\n',
    );
  });

  it("suggests close known commands for unknown commands", () => {
    const output = formatCliParseErrorOutput("error: unknown command 'upate'\n", {
      argv: ["node", "steelengine", "upate"],
    });

    expect(output).toBe(
      'SteelEngine does not know the command "upate".\nDid you mean this?\n  steelengine update\nTry: steelengine --help\nPlugin command? steelengine plugins list\nDocs: https://docs.steelengine.ai/cli\n',
    );
  });

  it("suggests explicit aliases for common adjacent terminology", () => {
    const output = formatCliParseErrorOutput("error: unknown command 'upgrade'\n", {
      argv: ["node", "steelengine", "upgrade"],
    });

    expect(output).toContain("Did you mean this?\n  steelengine update\n");
  });

  it("preserves active profile context in command suggestions", () => {
    const originalProfile = process.env.STEELENGINE_PROFILE;
    process.env.STEELENGINE_PROFILE = "work";
    try {
      const output = formatCliParseErrorOutput("error: unknown command 'doctr'\n", {
        argv: ["node", "steelengine", "doctr"],
      });

      expect(output).toContain("Did you mean this?\n  steelengine --profile work doctor\n");
    } finally {
      if (originalProfile === undefined) {
        delete process.env.STEELENGINE_PROFILE;
      } else {
        process.env.STEELENGINE_PROFILE = originalProfile;
      }
    }
  });

  it("points unknown options at the active command help", () => {
    const output = formatCliParseErrorOutput("error: unknown option '--wat'\n", {
      argv: ["node", "steelengine", "channels", "status", "--wat"],
    });

    expect(output).toBe(
      'SteelEngine does not recognize option "--wat".\nTry: steelengine channels status --help\n',
    );
  });

  it("points missing required arguments at command help", () => {
    const output = formatCliParseErrorOutput("error: missing required argument 'name'\n", {
      argv: ["node", "steelengine", "plugins", "install"],
    });

    expect(output).toBe(
      'Missing required argument "name".\nTry: steelengine plugins install --help\n',
    );
  });
});
